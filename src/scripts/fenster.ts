import { EventHandler } from "./types";
import "@interactjs/auto-start";
import "@interactjs/actions/drag";
import "@interactjs/actions/resize";
import "@interactjs/modifiers";
import "@interactjs/snappers";
import interact from "@interactjs/interact";
import { GlobalState } from "./state/global";

let zIndex = 100;

interface FensterConstructor<T extends HTMLElement> {
  body: T;
  title: HTMLElement | DocumentFragment;
  style?: Record<string, string>;
  open?: boolean;
  buttonsLeft?: HTMLElement[];
  buttonsRight?: HTMLElement[];
  globalState: GlobalState;
}

export default class Fenster<T extends HTMLElement> {
  #position = { x: 0, y: 0 };
  #body;
  #dragger;
  #wrapper;
  #container;
  #onCloseHandlers: EventHandler<void>[] = [];

  isOpen = true;

  constructor({
    body,
    title,
    style,
    open,
    buttonsLeft,
    buttonsRight,
    globalState: { configManager },
  }: FensterConstructor<T>) {
    const wrapper = (this.#wrapper = document.createElement("div"));
    const dragger = (this.#dragger = document.createElement("summary"));
    const container = (this.#container = document.createElement("details"));

    const { left, top, ...others } = style ?? {};

    for (const name in others) {
      body.style.setProperty(name, others[name]);
    }

    if (left) {
      wrapper.style.left = left;
    }

    if (top) {
      wrapper.style.top = top;
    }

    wrapper.classList.add("wrapper");
    dragger.classList.add("dragger");
    container.classList.add("window");

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
        move: (event) => {
          this.#position.x += event.dx;
          this.#position.y += event.dy;
          wrapper.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;
        },
      },
    });

    interact(container).resizable({
      modifiers: [snap],
      edges: { top: true, left: true, bottom: true, right: true },
      listeners: {
        move: (event) => {
          this.#position.x += event.deltaRect.left;
          this.#position.y += event.deltaRect.top;

          Object.assign(body.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
          });

          wrapper.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;
        },
      },
    });

    container.open = open ?? true;

    this.#body = body;

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("minimize");
      button.append(icon);
      title.appendChild(button);

      button.addEventListener("click", () => {
        this.toggleMinimize();
      });

      container.addEventListener("toggle", () => {
        icon.setIcon(container.open ? "minimize" : "unminimize");
      });

      dragger.append(button);
    }

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

    dragger.addEventListener("click", (event) => {
      event.preventDefault();
      return false;
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

  toggleMinimize(force?: boolean) {
    const value = force ?? this.#container.open;
    this.#container.open = !value;
    return this.#container.open;
  }

  onClose(handler: EventHandler<void>) {
    this.#onCloseHandlers.push(handler);
  }
}
