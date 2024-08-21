import TextEditorElement from "../elements/text-editor.js";
import Fenster from "../fenster.js";
import { VirtualFileSystemFile } from "../resources/fs.js";
import { WindowConstructor } from "../types/windows.js";
import * as monaco from "monaco-editor";

export default class SourceEditorWindow extends Fenster<TextEditorElement> {
  // #fs: Fs;

  constructor({
    style,
    globalState,
    // globalState: { resourceManager },
  }: WindowConstructor) {
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

      icon.setIcon("export");
      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("import");
      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      style,
      buttonsRight,
      globalState,
    });
  }

  setModel(model: monaco.editor.ITextModel, file: VirtualFileSystemFile) {
    model.onDidChangeContent(() => {
      file.write(model.getValue());
    });
    this.body.setModel(model);
  }
}
