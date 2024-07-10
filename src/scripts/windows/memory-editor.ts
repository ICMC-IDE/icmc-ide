import MemoryEditorElement from "../elements/memory-editor.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types";

export default class MemoryEditorWindow extends Fenster<MemoryEditorElement> {
  constructor({ style, events }: WindowProps) {
    const body = document.createElement("memory-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Memory Editor";
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

    events.refresh.subscribe(({ ram, symbols }) => {
      if (ram) {
        body.load(ram, symbols);
      }
    });
  }
}
