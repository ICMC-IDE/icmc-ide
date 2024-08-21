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
      file.dispatchEvent(new Event("fileRenameStart"));
    });

    this.#update();
  }

  #generateFile(file: VirtualFileSystemFile) {
    const div = document.createElement("div");

    div.classList.add("file");
    div.dataset.contextMenuId = "file";
    // div.dataset.contextMenuData = path;

    {
      const button = document.createElement("button");
      const text = document.createElement("input");
      text.type = "text";
      text.value = file.name;
      text.readOnly = true;

      const form = document.createElement("form");
      form.onsubmit = () => {
        file.name = text.value;
        if (!file.created) {
          file.create();
        }

        // const name = text.value;

        // if (path != pathNew) {
        //   this.dispatchEvent(
        //     new CustomEvent("fileRename", {
        //       detail: {
        //         pathOld: path,
        //         pathNew,
        //       },
        //     }),
        //   );
        // }

        text.readOnly = true;
        return false;
      };

      div.addEventListener("fileRenameStart", () => {
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
        console.log("blur");
        form.onsubmit!(new SubmitEvent("submit"));
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

    const childDiv = document.createElement("div");

    {
      const button = document.createElement("button");
      button.innerText = folder.name;

      button.addEventListener("click", () => {
        childDiv.hidden = !childDiv.hidden;
      });

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
    this.append(
      await this.#buildFileTree(
        new VirtualFileSystemDirectory(
          "",
          await navigator.storage.getDirectory(),
        ),
      ),
    );
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
