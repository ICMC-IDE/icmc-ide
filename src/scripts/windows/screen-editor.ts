import { WindowConstructor } from "windows";
import ScreenEditorElement from "../elements/screen-editor.js";
import Fenster from "../fenster.js";

export default class ScreenEditorWindow extends Fenster<ScreenEditorElement> {
  constructor({
    style,
    globalState: { configManager, eventManager },
  }: WindowConstructor) {
    const body = document.createElement("screen-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Screen & CharMap Editor [WIP]";
      span.classList.add("title");
      title.appendChild(span);
    }

    const buttonsRight = [];

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/export.png";
      button.append(icon, "Export CharMap");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/import.png";
      button.append(icon, "Import CharMap");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      style,
      buttonsRight,
    });

    configManager.subscribe("screenWidth", (width) => {
      body.width = width!;
    });

    configManager.subscribe("screenHeight", (height) => {
      body.height = height!;
    });

    eventManager.subscribe("render", () => {
      body.render();
    });

    eventManager.subscribe("setCharmap", (charmap) => {
      this.body.charmap = charmap;
    });

    this.toggleMinimize();
  }
}
