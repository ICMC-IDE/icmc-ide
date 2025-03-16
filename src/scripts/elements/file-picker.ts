import {
  VirtualFileSystemDirectory,
  VirtualFileSystemFile,
} from "../resources/fs";

interface FileOpenEvent {
  detail: VirtualFileSystemFile;
}

export default class FilePickerElement extends HTMLElement {
  #fs?: VirtualFileSystemDirectory;
  #controller?: AbortController;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#controller = new AbortController();

    this.dataset.contextMenuId = "filepicker";

    this.addEventListener(
      "fileNew",
      async () => {
        const file = this.#generateFile(
          await this.#fs!.getFile("untitled", false),
        );
        this.append(file);
        file.dispatchEvent(new Event("fileRename"));
      },
      { signal: this.#controller.signal },
    );

    this.addEventListener(
      "folderNew",
      async () => {
        const { mainNode: folder } = this.#generateFolder(
          await this.#fs!.getDirectory("untitled", false),
        );
        this.append(folder);
        folder.dispatchEvent(new Event("folderRename"));
      },
      { signal: this.#controller.signal },
    );
  }

  disconnectedCallback() {
    this.#controller!.abort();
    this.#controller = undefined;
  }

  #generateFolder(folder: VirtualFileSystemDirectory, ident: number = 0) {
    const div = document.createElement("div");
    div.classList.add("folder");
    div.dataset.contextMenuId = "folder";

    const childDiv = document.createElement("div");

    div.addEventListener("fileNew", async (event) => {
      event.stopPropagation();
      childDiv.hidden = false;
      const file = this.#generateFile(
        await folder.getFile("untitled", false),
        ident + 1,
      );
      childDiv.append(file);
      file.dispatchEvent(new Event("fileRename"));
    });
    div.addEventListener("folderNew", async (event) => {
      event.stopPropagation();
      childDiv.hidden = false;
      const { mainNode } = this.#generateFolder(
        await folder.getDirectory("untitled", false),
        ident + 1,
      );
      childDiv.append(mainNode);
      mainNode.dispatchEvent(new Event("folderRename"));
    });
    div.addEventListener("folderOpen", (event) => {
      event.stopPropagation();
      childDiv.hidden = !childDiv.hidden;
    });

    {
      const button = document.createElement("button");
      for (let i = 0; i < ident; i++) {
        const identDiv = document.createElement("div");
        identDiv.classList.add("ident");
        button.append(identDiv);
      }

      const text = document.createElement("input");
      text.type = "text";
      text.value = folder.name;
      text.readOnly = true;

      const form = document.createElement("form");
      form.onsubmit = () => {
        text.readOnly = true;

        const name = text.value;
        if (!folder.loaded) {
          folder.name = name;
          folder.create();
        } else {
          folder.rename(name);
        }

        return false;
      };

      div.addEventListener("folderRename", (event) => {
        event.stopPropagation();
        text.readOnly = false;
        text.focus();
        text.select();
      });

      div.addEventListener("folderDelete", (event) => {
        event.stopPropagation();
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

  #generateFile(file: VirtualFileSystemFile, ident: number = 0) {
    const div = document.createElement("div");

    div.classList.add("file");
    div.dataset.contextMenuId = "file";

    {
      const button = document.createElement("button");
      for (let i = 0; i < ident; i++) {
        const identDiv = document.createElement("div");
        identDiv.classList.add("ident");
        button.append(identDiv);
      }

      const text = document.createElement("input");
      text.type = "text";
      text.value = file.name;
      text.readOnly = true;

      const form = document.createElement("form");
      form.onsubmit = () => {
        text.readOnly = true;

        const name = text.value;
        if (!file.loaded) {
          file.name = name;
          file.create();
        } else {
          file.rename(name);
        }

        return false;
      };

      div.addEventListener("fileRename", (event) => {
        event.stopPropagation();
        text.readOnly = false;
        text.focus();
        text.select();
      });

      div.addEventListener("fileDelete", (event) => {
        event.stopPropagation();
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

  async #buildFileTree(
    directory: VirtualFileSystemDirectory,
    ident: number = 0,
  ) {
    const filesDiv = document.createElement("div");

    for await (const file of directory.list()) {
      if (file instanceof VirtualFileSystemFile) {
        filesDiv.appendChild(this.#generateFile(file, ident));
      } else {
        const { mainNode, childNode } = this.#generateFolder(
          file as VirtualFileSystemDirectory,
          ident,
        );
        childNode.appendChild(
          await this.#buildFileTree(
            file as VirtualFileSystemDirectory,
            ident + 1,
          ),
        );
        filesDiv.appendChild(mainNode);
      }
    }

    return filesDiv;
  }

  async update() {
    this.replaceChildren();
    this.append(await this.#buildFileTree(this.#fs!));
  }

  setFs(fs: VirtualFileSystemDirectory) {
    this.#fs = fs;
    this.update();
  }
}

customElements.define("file-picker", FilePickerElement);

declare global {
  interface HTMLElementTagNameMap {
    "file-picker": FilePickerElement;
  }
  interface HTMLElementEventMap {
    fileOpen: FileOpenEvent;
  }
}
