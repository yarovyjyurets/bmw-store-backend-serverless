import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { Readable } from "stream";
const csv = require("csv-parser");
import * as path from "path";

const REGION = "eu-central-1";

const s3Client = new S3Client({ region: REGION });

export const main = async (event: S3Event): Promise<void> => {
  const bucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log({ bucketName, key });

  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: key })
    );

    for await (const data of Readable.from(Body.pipe(csv()))) {
      console.log(data);
    }
    console.log("File parsed");

    const fileName = path.basename(key);
    const destinationKey = `parsed/${fileName}`;
    console.log({ destinationKey, copySource: `${bucketName}/${key}` });
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${key}`,
        Key: destinationKey,
      })
    );
    console.log(`File copied to 'parsed' folder with key: ${destinationKey}`);

    await s3Client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: key })
    );
    console.log("Original file removed");
  } catch (error) {
    console.error("Error:", error);
  }
};
