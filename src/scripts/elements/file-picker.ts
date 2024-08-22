import {
  VirtualFileSystemDirectory,
  VirtualFileSystemFile,
} from "../resources/fs";

interface FileOpenEvent {
  detail: VirtualFileSystemFile;
}

interface FileRenameEvent {
  detail: {
    pathOld: string;
    pathNew: string;
  };
}

interface FileDeleteEvent {
  detail: VirtualFileSystemFile;
}

export default class FilePickerElement extends HTMLElement {
  #fs?: VirtualFileSystemDirectory;

  constructor() {
    super();
  }

  connectedCallback() {
    this.dataset.contextMenuId = "filepicker";

    this.addEventListener("fileNew", () => {
      const file = this.#generateFile(this.#fs!.createFile("untitled"));
      this.append(file);
      file.dispatchEvent(new Event("fileRename"));
    });
    this.addEventListener("folderNew", () => {
      const { mainNode: folder } = this.#generateFolder(
        this.#fs!.createDirectory("untitled"),
      );
      this.append(folder);
      folder.dispatchEvent(new Event("folderRename"));
    });
  }

  #generateFile(file: VirtualFileSystemFile) {
    const div = document.createElement("div");

    div.classList.add("file");
    div.dataset.contextMenuId = "file";

    {
      const button = document.createElement("button");
      const text = document.createElement("input");
      text.type = "text";
      text.value = file.name;
      text.readOnly = true;

      const form = document.createElement("form");
      form.onsubmit = () => {
        text.readOnly = true;

        const name = text.value;
        if (!file.created) {
          file.name = name;
          file.create();
        } else {
          file.rename(name).then((renamed) => {
            file = renamed;
          });
        }

        return false;
      };

      div.addEventListener("fileRename", () => {
        text.readOnly = false;
        text.focus();
        text.select();
      });

      div.addEventListener("fileDelete", () => {
        file.delete();
        div.remove();
      });

      button.addEventListener("click", () => {
        if (text.readOnly) {
          this.dispatchEvent(new CustomEvent("fileOpen", { detail: file }));
        }
      });

      text.addEventListener("blur", () => {
        if (!text.readOnly) {
          form.onsubmit!(new SubmitEvent("submit"));
        }
      });

      form.append(text);
      button.append(form);
      div.append(button);
    }

    return div;
  }

  #generateFolder(folder: VirtualFileSystemDirectory) {
    const div = document.createElement("div");
    div.classList.add("folder");
    div.dataset.contextMenuId = "folder";

    const childDiv = document.createElement("div");

    div.addEventListener("fileNew", (event) => {
      event.stopPropagation();
      const file = this.#generateFile(folder.createFile("untitled"));
      childDiv.append(file);
      file.dispatchEvent(new Event("fileRename"));
    });
    div.addEventListener("folderNew", (event) => {
      event.stopPropagation();
      const { mainNode } = this.#generateFolder(
        folder.createDirectory("untitled"),
      );
      childDiv.append(mainNode);
      mainNode.dispatchEvent(new Event("folderRename"));
    });

    {
      const button = document.createElement("button");
      const text = document.createElement("input");
      text.type = "text";
      text.value = folder.name;
      text.readOnly = true;

      const form = document.createElement("form");
      form.onsubmit = () => {
        text.readOnly = true;

        const name = text.value;
        if (!folder.created) {
          folder.name = name;
          folder.create();
        } else {
          folder.rename(name);
        }

        return false;
      };

      div.addEventListener("folderRename", () => {
        text.readOnly = false;
        text.focus();
        text.select();
      });

      div.addEventListener("folderDelete", () => {
        folder.delete();
        div.remove();
      });

      button.addEventListener("click", () => {
        childDiv.hidden = !childDiv.hidden;
      });

      text.addEventListener("blur", () => {
        if (!text.readOnly) {
          form.onsubmit!(new SubmitEvent("submit"));
        }
      });

      form.append(text);
      button.append(form);
      div.append(button);
    }

    div.append(childDiv);

    return { mainNode: div, childNode: childDiv };
  }

  async #buildFileTree(directory: VirtualFileSystemDirectory) {
    const filesDiv = document.createElement("div");

    for await (const file of directory.list()) {
      if (file instanceof VirtualFileSystemFile) {
        filesDiv.appendChild(this.#generateFile(file));
      } else {
        const { mainNode, childNode } = this.#generateFolder(
          file as VirtualFileSystemDirectory,
        );
        childNode.appendChild(
          await this.#buildFileTree(file as VirtualFileSystemDirectory),
        );
        filesDiv.appendChild(mainNode);
      }
    }

    return filesDiv;
  }

  async #update() {
    this.replaceChildren();
    this.append(await this.#buildFileTree(this.#fs!));
  }

  setFs(fs: VirtualFileSystemDirectory) {
    this.#fs = fs;
    this.#update();
  }
}

customElements.define("file-picker", FilePickerElement);

declare global {
  interface HTMLElementTagNameMap {
    "file-picker": FilePickerElement;
  }
  interface HTMLElementEventMap {
    fileOpen: FileOpenEvent;
    fileRename: FileRenameEvent;
    fileDelete: FileDeleteEvent;
  }
}
