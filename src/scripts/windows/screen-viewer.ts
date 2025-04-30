import ScreenViewerElement from "../elements/screen-viewer.js";
import { IREG_KB, IREG_WC } from "../enums.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class ScreenViewerWindow extends Fenster<ScreenViewerElement> {
  #internalRegisters: Uint16Array | null = null;
  #wc = -1;

  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { configManager, resourceManager, eventManager },
    } = windowProps;

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

      icon.setIcon("expand");
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

      icon.setIcon("clearCash");
      button.append(icon, "Clear");
      button.addEventListener("click", () => {
        body.clear();
      });
      buttonsRight.push(button);
    }

    {
      const { screenWidth, screenHeight } = configManager.getMany(
        "screenWidth",
        "screenHeight",
      );

      body.setWidth(screenWidth!);
      body.setHeight(screenHeight!);

      body.tabIndex = 1;

      // FIX THIS
      body.addEventListener("keydown", ({ keyCode, key }) => {
        if (this.#internalRegisters) {
          if (key.length === 1) {
            this.#internalRegisters[IREG_KB] = key.charCodeAt(0);
          } else {
            this.#internalRegisters[IREG_KB] = keyCode;
          }
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
      buttonsLeft,
      buttonsRight,
      ...windowProps,
    });

    const charmap = resourceManager.get("charmap");
    charmap.subscribe(() => {
      this.render(true);
    });
    body.setCharmap(charmap);

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
      body.setWidth(width);
    });
    configSubscriber.subscribe("screenHeight", (height: number) => {
      body.setHeight(height);
    });

    resourceSubscriber.subscribe("vram", (vram) => {
      body.memory = vram;
    });
    resourceSubscriber.subscribe("internalRegisters", (internalRegisters) => {
      this.#internalRegisters = internalRegisters;
    });
    resourceSubscriber.subscribe("charmap", (charmap) => {
      charmap.subscribe(() => {
        this.render(true);
      });
      body.setCharmap(charmap);
      this.render(true);
    });

    body.memory = resourceManager.get("vram");
    this.#internalRegisters = resourceManager.get("internalRegisters");
    this.render();
  }

  render(force = false) {
    if (!this.#internalRegisters) return;
    const newWc = this.#internalRegisters[IREG_WC];
    if (!force && newWc === this.#wc) return;

    this.body.shouldUpdate = true;
    this.body.render();
    this.#wc = newWc;
  }
}
