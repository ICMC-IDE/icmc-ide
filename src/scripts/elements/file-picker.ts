interface OpenFileEvent {
  detail: string;
}

interface DeleteFileEvent {
  detail: string;
}

export default class FilePickerElement extends HTMLElement {
  #filenames: string[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.#update();
  }

  #generateFile(filename: string, path: string) {
    const div = document.createElement("div");

    div.classList.add("file");

    {
      const button = document.createElement("button");

      button.innerText = filename;
      div.append(button);

      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("open-file", { detail: path }));
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

      icon.name = "remove";
      button.append(icon);
      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete-file", { detail: path }));
      });
      button.title = "Delete";

      div.append(button);
    }

    return div;
  }

  #generateFolder(filename: string) {
    const div = document.createElement("div");

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

  set files(filenames: string[]) {
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
    "open-file": OpenFileEvent;
    "delete-file": DeleteFileEvent;
  }
}
