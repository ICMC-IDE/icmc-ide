import { EventHandler } from "./types";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import "@interactjs/snappers";
import interact from "@interactjs/interact";
import { GlobalState } from "./state/global";
import ConfigManager from "./state/config";

let zIndex = 100;

interface FensterConstructor<T extends HTMLElement> {
  body: T;
  title: HTMLElement | DocumentFragment;
  globalState: GlobalState;
  position: { x: number; y: number };
  size: { width: number; height: number };
  buttonsLeft?: HTMLElement[];
  buttonsRight?: HTMLElement[];
  style?: Record<string, string>;
  name?: string;
  saveState?: boolean;
  open?: boolean;
}

interface FensterStateMap {
  position: { x: number; y: number };
  size: { width: number; height: number };
  open: boolean;
}

export default class Fenster<T extends HTMLElement> {
  #body;
  #dragger;
  #wrapper;
  #container;
  #position = { x: 0, y: 0 };
  #size = { width: 0, height: 0 };
  #onCloseHandlers: EventHandler<void>[] = [];
  #stateManager: ConfigManager<FensterStateMap> | null = null;

  isOpen = true;

  constructor({
    body,
    title,
    globalState: { configManager },
    position,
    size,
    buttonsLeft,
    buttonsRight,
    style,
    name,
    saveState = true,
    open,
  }: FensterConstructor<T>) {
    if (saveState) {
      this.#stateManager = new ConfigManager<FensterStateMap>(name!);
      this.#stateManager.loadAll();

      this.#size = this.#stateManager.get("size") ?? size;
      this.#position = this.#stateManager.get("position") ?? position;
    }

    const wrapper = (this.#wrapper = document.createElement("div"));
    const dragger = (this.#dragger = document.createElement("div"));
    const container = (this.#container = document.createElement("div"));

    wrapper.classList.add("wrapper");
    dragger.classList.add("dragger");
    container.classList.add("window");

    body.style.width = `${this.#size.width}px`;
    body.style.height = `${this.#size.height}px`;
    wrapper.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;

    for (const prop in style ?? {}) {
      body.style.setProperty(prop, style![prop]);
    }

    {
      // TODO: IMPROVE THIS !!!!!
      const snap = interact.modifiers.snap({
        targets: [
          interact.snappers.grid({
            x: configManager.get("gridWidth"),
            y: configManager.get("gridHeight"),
            limits: {
              left: 0,
              right: window.screen.width,
              top: 0,
              bottom: window.screen.height,
            },
          }),
        ],
        range: Infinity,
        relativePoints: [{ x: 0, y: 0 }],
      });

      configManager.subscribe("gridWidth", () => {
        const snapGrid = interact.snappers.grid({
          x: configManager.get("gridWidth"),
          y: configManager.get("gridHeight"),
          limits: {
            left: 0,
            right: window.screen.width,
            top: 0,
            bottom: window.screen.height,
          },
        });
        snap.options.targets = [snapGrid];
      });
      configManager.subscribe("gridHeight", () => {
        const snapGrid = interact.snappers.grid({
          x: configManager.get("gridWidth"),
          y: configManager.get("gridHeight"),
        });
        snap.options.targets = [snapGrid];
      });

      interact(dragger).draggable({
        modifiers: [snap],
        listeners: {
          move: (event) => this.#move(event.dx, event.dy),
        },
      });

      interact(container).resizable({
        modifiers: [snap],
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
          move: (event) => {
            this.#move(event.deltaRect.left, event.deltaRect.top);
            this.#resize(event.rect.width, event.rect.height);
          },
        },
      });
    }

    this.#body = body;

    if (buttonsLeft) {
      dragger.append(...buttonsLeft);
    }

    dragger.append(title);

    if (buttonsRight) {
      dragger.append(...buttonsRight);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("close");
      button.append(icon);
      button.addEventListener("click", () => {
        this.#close();
      });

      dragger.append(button);
    }

    container.append(dragger, body);
    wrapper.append(container);

    wrapper.addEventListener("pointerdown", () => {
      this.focus();
    });

    document.body.appendChild(wrapper);
  }

  #close() {
    this.isOpen = false;

    for (const handler of this.#onCloseHandlers) {
      handler();
    }

    this.#body.remove();
    this.#dragger.remove();
    this.#wrapper.remove();
    this.#container.remove();
  }

  #move(x: number, y: number) {
    this.#position.x += x;
    this.#position.y += y;

    this.#wrapper.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;

    if (this.#stateManager) {
      this.#stateManager.set("position", this.#position);
    }
  }

  #resize(width: number, height: number) {
    this.#size.width = width;
    this.#size.height = height;

    this.#body.style.width = `${width}px`;
    this.#body.style.height = `${height}px`;

    if (this.#stateManager) {
      this.#stateManager.set("size", this.#size);
    }
  }

  focus() {
    const wrapper = this.#wrapper;

    if (+wrapper.style.zIndex < zIndex) {
      wrapper.style.zIndex = (++zIndex).toString();
    }
  }

  getClientRect() {
    return this.#container.getBoundingClientRect();
  }

  get body() {
    return this.#body;
  }

  onClose(handler: EventHandler<void>) {
    this.#onCloseHandlers.push(handler);
  }
}
