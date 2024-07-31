import TextEditorElement from "../elements/text-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class SourceEditorWindow extends Fenster<TextEditorElement> {
  constructor({ style }: WindowConstructor) {
    const body = document.createElement("text-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Source Editor";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "export";
      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "import";
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
