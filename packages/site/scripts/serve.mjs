import express from "express";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();
const PATH = path.resolve(__dirname, "..", "src");

app.use(
  express.static(PATH, {
    extensions: ["html", "js", "css"]
  })
);

app.listen("3000", () => {
  console.log("App started at http://localhost:3000");
});
