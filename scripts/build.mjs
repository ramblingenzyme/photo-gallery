import * as dotenv from "dotenv";
dotenv.config();

import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import url from "url";
import sizeOf from "image-size";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SRC_DIR = path.join(__dirname, "..", "src");
const DIST_DIR = path.join(__dirname, "..", " dist");

const { CF_DISTRIBUTION, S3_BUCKET } = process.env;
const images = await fs.readdir(path.join(SRC_DIR, "images"));

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

const imageInfo = images
  .map(image => {
    const dimensions = sizeOf(path.join(SRC_DIR, "images", image));

    // image orientations of 5 and above rotate so the dimensions are flipped :/
    const isTall =
      dimensions.orientation >= 5
        ? dimensions.width > dimensions.height
        : dimensions.height > dimensions.width;
    const isSquare = dimensions.height === dimensions.width;

    return {
      key: image,
      src: getRequestBody(image, 1200),
      class: isTall ? "portrait" : isSquare ? "square" : undefined
    };
  })
  .slice()
  .reverse();

const content = await ejs.renderFile(
  path.resolve(path.join(SRC_DIR, "template.ejs")),
  {
    images: imageInfo,
    imageBaseUrl: CF_DISTRIBUTION
  }
);

await fs.writeFile(path.join(SRC_DIR, "index.html"), content);
