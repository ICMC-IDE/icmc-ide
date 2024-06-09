import Fenster from "../fenster.js";

export default class ScreenEditor extends Fenster {
  constructor({ style }, config) {
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

    config.screenWidth.subscribe((width) => {
      body.width = width;
    });

    config.screenHeight.subscribe((height) => {
      body.height = height;
    });

    this.toggleMinimize();
  }

  set colorPalette(palette) {
    this.body.colorPalette = palette;
  }
}
