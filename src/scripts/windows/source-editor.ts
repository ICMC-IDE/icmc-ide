import Fs from "resources/fs.js";
import TextEditorElement from "../elements/text-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class SourceEditorWindow extends Fenster<TextEditorElement> {
  #fs: Fs;

  constructor({ style, globalState: { resources } }: WindowConstructor) {
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

    this.#fs = resources.get("fs");
  }

  setModel(model: monaco.editor.ITextModel, filename: string) {
    model.onDidChangeContent(() => {
      this.#fs.write(filename, model.getValue());
    });
    this.body.model = model;
  }
}
