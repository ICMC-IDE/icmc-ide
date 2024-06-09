import Fenster from "../fenster.js";

export default class SourceEditor extends Fenster {
  constructor({ style }, config) {
    const body = document.createElement("text-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Source Editor";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/export.png";
      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/import.png";
      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      style,
      buttonsRight,
    });
  }

  set model(model) {
    this.body.model = model;
  }
}
