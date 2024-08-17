import { DOMParser } from "linkedom";
import fs from "fs/promises";

const domParser = new DOMParser();
const rawIcon =
  '<?xml version="1.0" encoding="utf-8" ?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"></svg>';

const filenames = await fs.readdir("./src/images/icons/");
const files = filenames.map((filename) => [
  filename.replace(".svg", ""),
  fs.readFile(`./src/images/icons/${filename}`, { encoding: "utf-8" }),
]);

const document = domParser.parseFromString(rawIcon, "image/svg+xml");
const defs = document.createElement("defs");

document.firstElementChild.appendChild(defs);

for (const [iconName, request] of files) {
  const data = await request;
  const icon = domParser.parseFromString(data, "image/svg+xml");

  const symbol = document.createElement("symbol");
  symbol.id = iconName;

  symbol.replaceChildren(...icon.firstElementChild.children);
  defs.appendChild(symbol);
}

await fs.mkdir("./public/images", { recursive: true });
await fs.writeFile("./public/images/icons.svg", document.toString());
