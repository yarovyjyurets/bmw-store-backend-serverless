import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event, S3EventRecord } from "aws-lambda";
const csv = require("csv-parser");

const BMW_STORE_BUCKET_NAME = process.env.BMW_STORE_BUCKET_NAME;
const FOLDER_PREFIX = "uploaded";
const REGION = "eu-central-1";

const s3Client = new S3Client({ region: REGION });

export const main = async (event: S3Event): Promise<void> => {
  console.log(event.Records[0].s3.object.key);
  console.log(event.Records[0].s3.bucket.name);
  const bucketName = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  console.log({ bucketName, key });

  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: key })
    );
    Body.pipe(csv()).on("data", (data) => {
      console.log(data);
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
