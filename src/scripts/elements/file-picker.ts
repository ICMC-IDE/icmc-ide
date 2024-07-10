interface OpenFileEvent {
  detail: string;
}

interface DeleteFileEvent {
  detail: string;
}

export default class FilePickerElement extends HTMLElement {
  constructor() {
    super();
  }

  #generateFile(fileName: string) {
    const div = document.createElement("div");

    {
      const button = document.createElement("button");

      button.innerText = fileName;
      div.append(button);

      button.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("open-file", { detail: fileName }));
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
      const icon = document.createElement("img");

      icon.src = "images/remove.png";
      button.append(icon);
      button.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("delete-file", { detail: fileName }),
        );
      });
      button.title = "Delete";

      div.append(button);
    }

    return div;
  }

  set files(fileNames: string[]) {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }

    for (const fileName of fileNames) {
      this.appendChild(this.#generateFile(fileName));
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
