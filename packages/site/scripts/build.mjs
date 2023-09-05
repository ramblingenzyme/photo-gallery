import * as dotenv from "dotenv";
dotenv.config();

import less from "less";
import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import url from "url";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SRC_DIR = path.join(__dirname, "..", "src");

const lessContent = await fs.readFile(path.join(SRC_DIR, "css", "style.less"));
const output = await less.render(lessContent.toString());
await fs.writeFile(path.join(SRC_DIR, "css", "style.css"), output.css);

const { CF_DISTRIBUTION, S3_BUCKET } = process.env;

async function getImages() {
  const s3Client = new S3Client();

  const images = [];
  let nextContinuationToken = undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET
      })
    );

    images.push(...response.Contents);
    nextContinuationToken = response.NextContinuationToken;
  } while (nextContinuationToken);

  const sorted = images.sort((a, b) => b.LastModified - a.LastModified);

  return sorted.map(obj => obj.Key);
}

const images = await getImages();

const getRequestBody = (image, width) =>
  Buffer.from(
    JSON.stringify({
      bucket: S3_BUCKET,
      key: image,
      edits: {
        resize: {
          width,
          fit: "cover"
        }
      }
    })
  ).toString("base64");

const imageInfo = images.map(image => {
  return {
    key: image,
    src: getRequestBody(image, 1200)
  };
});

const content = await ejs.renderFile(
  path.resolve(path.join(SRC_DIR, "template.ejs")),
  {
    images: imageInfo,
    imageBaseUrl: CF_DISTRIBUTION
  }
);

await fs.writeFile(path.join(SRC_DIR, "index.html"), content);
