import * as dotenv from "dotenv";
dotenv.config();

import less from "less";
import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SRC_DIR = path.join(__dirname, "..", "src");

const lessContent = await fs.readFile(path.join(SRC_DIR, "css", "style.less"));
const output = await less.render(lessContent.toString());
await fs.writeFile(path.join(SRC_DIR, "css", "style.css"), output.css);

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
    return {
      key: image,
      src: getRequestBody(image, 1200)
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
