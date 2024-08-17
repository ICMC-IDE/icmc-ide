interface FileOpenEvent {
  detail: string;
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

interface FileContextElements extends HTMLFormControlsCollection {
  open: HTMLButtonElement;
  rename: HTMLButtonElement;
  delete: HTMLButtonElement;
}

export default class FilePickerElement extends HTMLElement {
  #filenames: string[] = [];

  #contextTarget?: { path: string; newPath?: string; element: HTMLElement };
  #fileContext = document.getElementById("fileContextMenu")!;
  #fileContextBinds = {
    open: this.#fileContextOpen.bind(this),
    rename: this.#fileContextRename.bind(this),
    delete: this.#fileContextDelete.bind(this),
  };

  constructor() {
    super();
  }

  connectedCallback() {
    this.#update();

    {
      const elements = this.#fileContext.querySelector("form")!
        .elements as FileContextElements;
      elements.open.addEventListener("click", this.#fileContextBinds.open);
      elements.rename.addEventListener("click", this.#fileContextBinds.rename);
      elements.delete.addEventListener("click", this.#fileContextBinds.delete);
    }
  }

  disconnectedCallback() {
    {
      const elements = this.#fileContext.querySelector("form")!
        .elements as FileContextElements;
      elements.open.removeEventListener("click", this.#fileContextBinds.open);
      elements.rename.removeEventListener(
        "click",
        this.#fileContextBinds.rename,
      );
      elements.delete.removeEventListener(
        "click",
        this.#fileContextBinds.delete,
      );
    }
  }

  #fileContextOpen() {
    this.dispatchEvent(
      new CustomEvent("fileOpen", { detail: this.#contextTarget!.path }),
    );
    this.#fileContext.style.display = "none";
  }

  #fileContextRename() {
    this.#contextTarget!.element.contentEditable = "true";
    this.#contextTarget!.element.focus();

    // this.dispatchEvent(
    //   new CustomEvent("fileRename", {
    //     detail: {
    //       pathOld: this.#contextTarget!.path,
    //       pathNew: this.#contextTarget!.!,
    //     },
    //   }),
    // );
    this.#fileContext.style.display = "none";
  }

  #fileContextDelete() {
    this.dispatchEvent(
      new CustomEvent("fileDelete", { detail: this.#contextTarget!.path }),
    );
    this.#fileContext.style.display = "none";
  }

  #generateFile(filename: string, path: string) {
    const div = document.createElement("div");

    div.classList.add("file");

    {
      const button = document.createElement("button");

      button.innerText = filename;
      div.append(button);

      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("fileOpen", { detail: path }));
      });
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          this.#contextTarget!.newPath = button.innerText;
          button.contentEditable = "false";
        }
      });
      div.addEventListener("contextmenu", (event) => {
        event.preventDefault();

        this.#contextTarget = { path, element: button };
        this.#fileContext.style.display = "block";
        this.#fileContext.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      });
    }

    /*
    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/rename.png";
      button.append(icon);
      button.addEventListener("click", () => {
      });
      button.title = "Rename";

      div.append(button);
    }
    */

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("delete");
      button.append(icon);
      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("fileDelete", { detail: path }));
      });
      button.title = "Delete";

      div.append(button);
    }

    return div;
  }

  #generateFolder(filename: string) {
    const div = document.createElement("div");

    div.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      console.log("contextmenu");
    });

    div.classList.add("folder");

    {
      const button = document.createElement("button");

      button.innerText = filename;
      div.append(button);
    }

    return div;
  }

  #buildFileTree(paths: string[]) {
    type FileNode = {
      node: HTMLElement;
      children: Record<string, FileNode>;
    };

    const fileTree: FileNode = {
      node: this,
      children: {},
    };

    for (const path of paths) {
      const realPath = this.#resolvePath(path);
      const filename = realPath.pop()!;

      let currentDir = fileTree;

      for (const subdir of realPath) {
        let nextDir = fileTree.children[subdir];

        if (!nextDir) {
          nextDir = {
            node: this.#generateFolder(subdir),
            children: {},
          };

          fileTree.children[subdir] = nextDir;

          currentDir.node.appendChild(nextDir.node);
        }

        currentDir = nextDir;
      }

      currentDir.node.appendChild(this.#generateFile(filename, path));
    }

    return fileTree.node;
  }

  #resolvePath(path: string) {
    const stack: string[] = [];

    path.split("/").forEach((filename: string) => {
      if (filename == "..") {
        stack.pop();
      } else if (filename == ".") {
        //
      } else if (filename == "") {
        //
      } else {
        stack.push(filename);
      }
    });

    return stack;
  }

  #update() {
    this.replaceChildren();
    this.#buildFileTree(this.#filenames);
  }

  setFiles(filenames: string[]) {
    this.#filenames = filenames.sort();

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
