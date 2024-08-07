import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "../../modules/zip.js/index.js";

import FilePickerElement from "../elements/file-picker.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";
import Fs from "resources/fs.js";

export default class StateEditorWindow extends Fenster<FilePickerElement> {
  #fs: Fs;

  constructor({
    style,
    globalState: { eventManager, resources },
  }: WindowConstructor) {
    const body = document.createElement("file-picker");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Files";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "download";
      button.appendChild(icon);
      buttonsRight.push(button);

      button.addEventListener("click", async () => {
        const fs = this.#fs;
        const writer = new ZipWriter(new BlobWriter("application/zip"));

        await Promise.all([
          fs
            .files()
            .map((path) => writer.add(path, new TextReader(fs.read(path)!))),
        ]);

        const blob = await writer.close();

        const anchor = Object.assign(document.createElement("a"), {
          download: "project.zip",
          href: URL.createObjectURL(blob),
        });

        anchor.click();
        URL.revokeObjectURL(anchor.href);
      });
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "upload";
      button.appendChild(icon);
      buttonsRight.push(button);

      button.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/zip";

        input.addEventListener("input", (ev) => {
          console.log(ev);
        });

        input.click();
      });
    }

    // maybe we should pass fs to file-picker intead of updating it through the window?
    const fs = resources.get("fs");
    body.files = fs.files();

    body.addEventListener("open-file", ({ detail: filename }) => {
      eventManager.emmit("open-file", filename);
    });
    body.addEventListener("delete-file", ({ detail: filename }) => {
      fs.delete(filename);
    });

    super({
      title,
      body,
      style,
      buttonsRight,
    });

    const fsSubscriber = fs.getSubscriber();

    this.#fs = fs;

    this.onClose(() => fsSubscriber.unsubscribeAll());

    fsSubscriber.subscribe("create", () => {
      body.files = fs.files();
    });

    fsSubscriber.subscribe("delete", () => {
      body.files = fs.files();
    });
  }
}
