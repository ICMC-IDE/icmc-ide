import TextEditorElement from "../elements/text-editor.js";
import Fenster from "../fenster.js";
import { VirtualFileSystemFile } from "../resources/fs.js";
import { WindowConstructor } from "../types/windows.js";
import * as monaco from "monaco-editor";

export default class SourceEditorWindow extends Fenster<TextEditorElement> {
  #file?: VirtualFileSystemFile;

  constructor({
    style,
    globalState,
    globalState: { eventManager, configManager, resourceManager },
  }: WindowConstructor) {
    const body = document.createElement("text-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Source Editor";
      title.classList.add("title");
    }

    // {
    //   const button = document.createElement("button");
    //   const icon = document.createElement("svg-icon");

    //   icon.setIcon("export");
    //   button.append(icon, "Export");
    //   buttonsRight.push(button);
    // }

    // {
    //   const button = document.createElement("button");
    //   const icon = document.createElement("svg-icon");

    //   icon.setIcon("import");
    //   button.append(icon, "Import");
    //   buttonsRight.push(button);
    // }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("build");
      button.append(icon, "Build");
      button.addEventListener("click", () => {
        // const userFs = resourceManager.get("fs").user;
        // const internalFs = resourceManager.get("fs").internal;
        // const files = { ...userFs.all(), ...internalFs.all() };
        const syntax = configManager.get("syntax");

        resourceManager
          .get("mainWorker")
          .request("build", {
            files: [this.#file],
            entry: this.#file!.name,
            syntax,
          })
          .then(
            ({
              ram,
              vram,
              symbols,
              registers,
              internalRegisters,
              // asm,
              // mif,
            }) => {
              // const fs = resourceManager.get("fs").internal;

              resourceManager.set("ram", ram);
              resourceManager.set("vram", vram);
              resourceManager.set("registers", registers);
              resourceManager.set("internalRegisters", internalRegisters);
              resourceManager.set("symbols", symbols);

              // fs.write(entry!.replace(/\.[^.]+$/, ".mif"), mif);

              // TODO: Write asm to fs
              // if (asm) {
              //   fs.write(entry!.replace(/\.[^.]+$/, ".asm"), asm);
              // }
            },
          )
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

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
    this.#file = file;
    model.onDidChangeContent(() => {
      file.write(model.getValue());
    });
    this.body.setModel(model);
  }
}
