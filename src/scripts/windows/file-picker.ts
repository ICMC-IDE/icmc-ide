import { ZipDirectoryEntry, fs as zipjsFs } from "@zip.js/zip.js";
import FilePickerElement from "../elements/file-picker.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows";
import {
  VirtualFileSystemDirectory,
  VirtualFileSystemFile,
} from "../resources/fs.js";

export default class StateEditorWindow extends Fenster<FilePickerElement> {
  constructor({
    style,
    globalState: { eventManager, resourceManager },
    globalState,
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

      icon.setIcon("download");
      button.appendChild(icon);
      buttonsRight.push(button);

      button.addEventListener("click", async () => {
        const fs = await resourceManager.get("fs").getDirectory("user");
        const zipFs = new zipjsFs.FS();

        const zipDirecory = async (
          fsDirectory: VirtualFileSystemDirectory,
          zipfsDirectory: ZipDirectoryEntry,
        ) => {
          for await (const file of fsDirectory.list()) {
            if (file instanceof VirtualFileSystemFile) {
              zipfsDirectory.addFile(await file.getFileHandle());
            } else {
              const newDirectory = zipfsDirectory.addDirectory(file.name);
              await zipDirecory(file, newDirectory);
            }
          }
        };

        await zipDirecory(fs, zipFs.root);
        const blob = await zipFs.exportBlob();

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

      icon.setIcon("upload");
      button.appendChild(icon);
      buttonsRight.push(button);

      button.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        //input.accept = "application/zip";

        input.addEventListener("change", async () => {
          const fs = await resourceManager.get("fs").getDirectory("user");

          for (const file of input.files!) {
            const fsFile = await fs.createFile(file.name);
            await file.stream().pipeTo(await fsFile.getWritable());
          }
          body.update();
          input.remove();
        });

        input.click();
      });
    }

    body.addEventListener("fileOpen", ({ detail: file }) => {
      eventManager.emmit("fileOpen", file);
    });

    super({
      title,
      body,
      style,
      buttonsRight,
      globalState,
    });

    const eventSubscriber = eventManager.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
    });

    eventSubscriber.subscribe("updateFs", () => body.update());

    resourceManager
      .get("fs")
      .getDirectory("user")
      .then((directory) => body.setFs(directory));
  }
}
