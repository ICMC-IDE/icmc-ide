import { screenHeight, screenWidth } from "../config.js";
import Fenster from "../modules/fenster.js";

export default class ScreenEditor extends Fenster {
  constructor({ style }) {
    const body = document.createElement("screen-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Screen & CharMap Editor [WIP]";
      span.classList.add("title");
      title.appendChild(span);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/export.png";
      button.append(icon, "Export CharMap");
      title.appendChild(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/import.png";
      button.append(icon, "Import CharMap");
      title.appendChild(button);
    }

    screenWidth.subscribe((value) => {
      body.width = value;
    });

    screenHeight.subscribe((value) => {
      body.height = value;
    });

    super({
      title,
      body,
      style,
    });
  }
}
