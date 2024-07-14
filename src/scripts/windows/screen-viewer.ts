import ScreenViewerElement from "../elements/screen-viewer.js";
import { IREG_KB, IREG_WC } from "../enums.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class ScreenViewerWindow extends Fenster<ScreenViewerElement> {
  #internalRegisters: Uint16Array | null = null;
  #wc = 0;

  constructor({
    style,
    globalState: { configManager, eventManager },
  }: WindowConstructor) {
    const body = document.createElement("screen-viewer");
    const title = document.createElement("span");
    const buttonsLeft = [];
    const buttonsRight = [];

    {
      title.innerText = "Screen";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/toggle-full-screen.png";
      button.append(icon);
      button.addEventListener("click", () => {
        body.requestFullscreen().catch((error) => {
          console.error(error);
        });
      });

      buttonsLeft.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/erase.png";
      button.append(icon, "Clear");
      button.addEventListener("click", () => {
        body.clear();
      });
      buttonsRight.push(button);
    }

    {
      body.tabIndex = 1;
      body.addEventListener("keydown", ({ keyCode }) => {
        if (this.#internalRegisters) {
          this.#internalRegisters[IREG_KB] = keyCode;
        }
      });

      body.addEventListener("keyup", () => {
        if (this.#internalRegisters) {
          this.#internalRegisters[IREG_KB] = 0xff;
        }
      });
    }

    super({
      title,
      body,
      style,
      buttonsLeft,
      buttonsRight,
    });

    configManager.subscribe("screenWidth", (width) => {
      body.width = width!;
    });

    configManager.subscribe("screenHeight", (height) => {
      body.height = height!;
    });

    eventManager.subscribe("refresh", ({ vram, internalRegisters }) => {
      if (vram) {
        body.memory = vram;
      }

      if (internalRegisters) {
        this.#internalRegisters = internalRegisters;
      }
    });

    eventManager.subscribe("render", () => {
      this.render();
    });

    eventManager.subscribe("setCharmap", (charmap) => {
      body.charmap = charmap;
    });
  }

  render() {
    if (!this.#internalRegisters) return;
    const newWc = this.#internalRegisters[IREG_WC];
    if (newWc === this.#wc) return;

    this.body.shouldUpdate = true;
    this.body.render();
    this.#wc = newWc;
  }
}
