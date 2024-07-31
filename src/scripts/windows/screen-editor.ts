import { WindowConstructor } from "windows";
import ScreenEditorElement from "../elements/screen-editor.js";
import Fenster from "../fenster.js";

export default class ScreenEditorWindow extends Fenster<ScreenEditorElement> {
  constructor({
    style,
    globalState: { configManager, eventManager, resources },
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
      const icon = document.createElement("svg-icon");

      icon.name = "export";
      button.append(icon, "Export CharMap");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "import";
      button.append(icon, "Import CharMap");
      buttonsRight.push(button);
    }

    body.charmap = resources.get("charmap");

    super({
      title,
      body,
      style,
      buttonsRight,
    });

    configManager.subscribe("screen-width", (width: number) => {
      body.width = width;
    });

    configManager.subscribe("screen-height", (height: number) => {
      body.height = height;
    });

    eventManager.subscribe("render", () => {
      body.render();
    });

    resources.subscribe("charmap", (charmap) => {
      body.charmap = charmap;
    });

    this.toggleMinimize();
  }
}
