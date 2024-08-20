import { FsFile, FsFolder } from "../resources/fs";

interface FileOpenEvent {
  detail: FsFile;
}

interface FileRenameEvent {
  detail: {
    pathOld: string;
    pathNew: string;
  };
}

interface FileDeleteEvent {
  detail: string;
}

export default class FilePickerElement extends HTMLElement {
  #files: Record<string, FsFolder | FsFile> = {};

  constructor() {
    super();
  }

  connectedCallback() {
    this.dataset.contextMenuId = "filepicker";

    // this.addEventListener("fileNew", () => {
    //   const file = this.#generateFile("untitled", "");
    //   this.append(file);
    //   file.dispatchEvent(new Event("fileRenameStart"));
    // });

    this.#update();
  }

  #generateFile(file: FsFile) {
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
      // form.onsubmit = () => {
      //   const pathNewS = path.split("/");
      //   pathNewS[pathNewS.length - 1] = text.value;
      //   const pathNew = pathNewS.join("/");

      //   if (path != pathNew) {
      //     this.dispatchEvent(
      //       new CustomEvent("fileRename", {
      //         detail: {
      //           pathOld: path,
      //           pathNew,
      //         },
      //       }),
      //     );
      //   }

      //  text.readOnly = true;
      //  return false;
      //};

      div.addEventListener("fileRenameStart", () => {
        text.readOnly = false;
        text.focus();
        text.select();
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

  #generateFolder(folder: FsFolder) {
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

  #buildFileTree(files: Record<string, FsFile | FsFolder>) {
    const filesDiv = document.createElement("div");

    for (const file of Object.values(files)) {
      if (file instanceof FsFile) {
        filesDiv.appendChild(this.#generateFile(file));
      } else {
        const { mainNode, childNode } = this.#generateFolder(file);
        childNode.appendChild(this.#buildFileTree(file.children));
        filesDiv.appendChild(mainNode);
      }
    }

    return filesDiv;
  }

  // #buildFileTree() {
  //   type FileNode = {
  //     mainNode: HTMLElement;
  //     filesNode: HTMLElement;
  //     children: Record<string, FileNode>;
  //   };

  //   const fileTree: FileNode = {
  //     mainNode: this,
  //     filesNode: this,
  //     children: {},
  //   };

  //   for (const file of this.#files) {
  //     // const realPath = this.#resolvePath(path);
  //     // const filename = realPath.pop()!;

  //     let currentDir = fileTree;

  //     for (const subdir of realPath) {
  //       let nextDir = fileTree.children[subdir];

  //       if (!nextDir) {
  //         const { mainNode, filesNode } = this.#generateFolder(subdir);
  //         nextDir = {
  //           mainNode,
  //           filesNode,
  //           children: {},
  //         };

  //         fileTree.children[subdir] = nextDir;

  //         currentDir.filesNode.appendChild(nextDir.mainNode);
  //       }

  //       currentDir = nextDir;
  //     }

  //     currentDir.filesNode.appendChild(this.#generateFile(filename, path));
  //   }

  //  return fileTree.mainNode;
  // }

  // #resolvePath(path: string) {
  //   const stack: string[] = [];

  //   path.split("/").forEach((filename: string) => {
  //     if (filename == "..") {
  //       stack.pop();
  //     } else if (filename == ".") {
  //       //
  //     } else if (filename == "") {
  //       //
  //     } else {
  //       stack.push(filename);
  //     }
  //   });

  //   return stack;
  // }

  #update() {
    this.replaceChildren();
    this.append(this.#buildFileTree(this.#files));
  }

  setFiles(files: Record<string, FsFolder | FsFile>) {
    this.#files = files;

    if (this.isConnected) {
      this.#update();
    }
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
