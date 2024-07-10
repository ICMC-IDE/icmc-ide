import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class SourceEditor extends Fenster<TextEditorElement> {
  constructor({ style }: WindowProps) {
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

  set model(model: monaco.editor.ITextModel) {
    this.body.model = model;
  }
}
