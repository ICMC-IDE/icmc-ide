import Fenster from "../modules/fenster.js";

export default class MemoryEditor extends Fenster {
  constructor({ style }) {
    const body = document.createElement("memory-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Memory Editor";
      span.classList.add("title");
      title.appendChild(span);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/export.png";
      button.append(icon, "Export");
      title.appendChild(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/import.png";
      button.append(icon, "Import");
      title.appendChild(button);
    }

    super({
      title,
      body,
      style,
    });
  }
}
