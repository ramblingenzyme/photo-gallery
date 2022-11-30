import ejs from "ejs";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import url from "url";
import sizeOf from "image-size";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");

const images = await fs.readdir(path.join(SRC_DIR, "images"));
const imageInfo = images
  .map((i) => {
    const dimensions = sizeOf(path.join(SRC_DIR, "images", i));
    const isTall = dimensions.height > dimensions.width;
    const isSquare = dimensions.height === dimensions.width;

    return {
      src: i,
      class: isTall ? "portrait" : isSquare ? "square" : undefined,
    };
  })
  .slice()
  .reverse();

const content = await ejs.renderFile(
  path.resolve(path.join(SRC_DIR, "template.ejs")),
  { images: imageInfo }
);

await fs.writeFile(path.join(SRC_DIR, "index.html"), content);
