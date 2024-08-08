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
  #window;
  #onCloseHandlers: EventHandler<void>[] = [];

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
    const window = (this.#window = document.createElement("details"));

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
    window.classList.add("window");

    // TODO: IMPROVE THIS !!!!!
    const snap = interact.modifiers.snap({
      targets: [
        interact.snappers.grid({
          x: configManager.get("gridWidth"),
          y: configManager.get("gridHeight"),
        }),
      ],
      range: Infinity,
      relativePoints: [{ x: 0, y: 0 }],
    });

    configManager.subscribe("gridWidth", () => {
      const snapGrid = interact.snappers.grid({
        x: configManager.get("gridWidth"),
        y: configManager.get("gridHeight"),
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
          window.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;
        },
      },
    });

    interact(window).resizable({
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

          window.style.transform = `translate(${this.#position.x}px, ${this.#position.y}px)`;
        },
      },
    });

    window.open = open ?? true;

    this.#body = body;

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "minimize";
      button.append(icon);
      title.appendChild(button);

      button.addEventListener("click", () => {
        this.toggleMinimize();
      });

      window.addEventListener("toggle", () => {
        icon.name = window.open ? "minimize" : "unminimize";
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

      icon.name = "close";
      button.append(icon);
      button.addEventListener("click", () => {
        this.#close();
      });

      dragger.append(button);
    }

    window.append(dragger, body);
    wrapper.append(window);

    wrapper.addEventListener("pointerdown", function () {
      if (+this.style.zIndex < zIndex) {
        this.style.zIndex = (++zIndex).toString();
      }
    });

    dragger.addEventListener("click", (event) => {
      event.preventDefault();
      return false;
    });

    document.body.appendChild(wrapper);
  }

  #close() {
    for (const handler of this.#onCloseHandlers) {
      handler();
    }

    this.#body.remove();
    this.#dragger.remove();
    this.#wrapper.remove();
    this.#window.remove();
  }

  getClientRect() {
    return this.#window.getBoundingClientRect();
  }

  get body() {
    return this.#body;
  }

  toggleMinimize(force?: boolean) {
    const value = force ?? this.#window.open;
    this.#window.open = !value;
    return this.#window.open;
  }

  onClose(handler: EventHandler<void>) {
    this.#onCloseHandlers.push(handler);
  }
}
