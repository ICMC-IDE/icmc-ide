import ScreenViewerElement from "../elements/screen-viewer.js";
import { IREG_KB, IREG_WC } from "../enums.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class ScreenViewerWindow extends Fenster<ScreenViewerElement> {
  #internalRegisters: Uint16Array | null = null;
  #wc = -1;

  constructor({
    style,
    globalState,
    globalState: { configManager, eventManager, resourceManager },
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
      const icon = document.createElement("svg-icon");

      icon.name = "toggle-full-screen";
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
      const icon = document.createElement("svg-icon");

      icon.name = "erase";
      button.append(icon, "Clear");
      button.addEventListener("click", () => {
        body.clear();
      });
      buttonsRight.push(button);
    }

    {
      const [width, height] = configManager.getMany(
        "screenWidth",
        "screenHeight",
      );

      body.width = width!;
      body.height = height!;

      body.charmap = resourceManager.get("charmap");

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
      globalState,
    });

    const eventSubscriber = eventManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();
    const resourceSubscriber = resourceManager.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
      configSubscriber.unsubscribeAll();
      resourceSubscriber.unsubscribeAll();
    });

    eventSubscriber.subscribe("render", () => {
      this.render();
    });

    configSubscriber.subscribe("screenWidth", (width: number) => {
      body.width = width;
    });
    configSubscriber.subscribe("screenHeight", (height: number) => {
      body.height = height;
    });

    resourceSubscriber.subscribe("vram", (vram) => {
      body.memory = vram;
    });
    resourceSubscriber.subscribe("internalRegisters", (internalRegisters) => {
      this.#internalRegisters = internalRegisters;
    });
    resourceSubscriber.subscribe("charmap", (charmap) => {
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
