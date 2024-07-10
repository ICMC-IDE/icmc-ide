const SIDES = ["n", "e", "s", "w"];
const CORNERS = ["ne", "se", "sw", "nw"];

let zIndex = 100;

interface FensterProps<T extends HTMLElement> {
  body: T;
  title: HTMLElement | DocumentFragment;
  style: Record<string, string>;
  open?: boolean;
  buttonsLeft?: HTMLElement[];
  buttonsRight?: HTMLElement[];
}

export default class Fenster<T extends HTMLElement> {
  #body;
  #dragger;
  #wrapper;
  #window;

  constructor({
    body,
    title,
    style,
    open,
    buttonsLeft,
    buttonsRight,
  }: FensterProps<T>) {
    const wrapper = (this.#wrapper = document.createElement("div"));
    const dragger = (this.#dragger = document.createElement("summary"));
    const window = (this.#window = document.createElement("details"));

    const { left, top, ...others } = style;

    for (const name in others) {
      body.style.setProperty(name, style[name]);
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

    window.open = open ?? true;

    this.#body = body;

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/minimize.png";
      button.append(icon);
      title.appendChild(button);

      button.addEventListener("click", () => {
        this.toggleMinimize();
      });

      window.addEventListener("toggle", () => {
        icon.src = window.open
          ? "images/minimize.png"
          : "images/unminimize.png";
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
      const icon = document.createElement("img");

      icon.src = "images/close.png";
      button.append(icon);
      button.addEventListener("click", () => {
        this.#body.remove();
        this.#dragger.remove();
        this.#wrapper.remove();
        this.#window.remove();
      });

      dragger.append(button);
    }

    window.append(dragger, body);
    wrapper.append(window);

    let x: number, y: number;
    let offsetX: number, offsetY: number;
    let originalWidth: number, originalHeight: number;

    const resizerPointerMove = (event: PointerEvent) => {
      if (event.buttons !== 1) return;
      event.preventDefault();
      const target = event.target as HTMLElement;

      const dir = target.dataset.resizeDir;

      const boundsWindow = window.getBoundingClientRect();
      const boundsBody = body.getBoundingClientRect();

      for (const char of dir!) {
        switch (char) {
          case "w":
            this.resizeInline(
              originalWidth +
                (x - event.x) -
                (boundsWindow.width - boundsBody.width),
              event.x - offsetX,
            );
            break;
          case "s":
            this.resizeBlock(
              originalHeight +
                (event.y - y) -
                (boundsWindow.height - boundsBody.height),
            );
            break;
          case "e":
            this.resizeInline(
              originalWidth +
                (event.x - x) -
                (boundsWindow.width - boundsBody.width),
            );
            break;
          case "n":
            this.resizeBlock(
              originalHeight +
                (y - event.y) -
                (boundsWindow.height - boundsBody.height),
              event.y - offsetY,
            );
            break;
        }
      }
    };

    wrapper.addEventListener("pointerdown", function () {
      if (+this.style.zIndex < zIndex) {
        this.style.zIndex = (++zIndex).toString();
      }
    });

    const resizerPointerDown = function (event: PointerEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;

      target.setPointerCapture(event.pointerId);

      const boundsWindow = window.getBoundingClientRect();
      const boundsBody = body.getBoundingClientRect();

      x = event.x;
      y = event.y;

      offsetX = x - boundsWindow.left;
      offsetY = y - boundsWindow.top;

      originalWidth = boundsBody.width;
      originalHeight = boundsWindow.height;
    };

    const draggerPointerDown = function (event: PointerEvent) {
      event.preventDefault();
      const target = event.target as HTMLElement;

      target.setPointerCapture(event.pointerId);

      const boundsWindow = window.getBoundingClientRect();

      x = event.x;
      y = event.y;

      offsetX = x - boundsWindow.left;
      offsetY = y - boundsWindow.top;
    };

    const draggerPointerMove = function (event: PointerEvent) {
      if (event.buttons !== 1) return;
      event.preventDefault();

      wrapper.style.left = `${event.x - offsetX}px`;
      wrapper.style.top = `${event.y - offsetY}px`;
    };

    const draggerClick = function (event: MouseEvent) {
      event.preventDefault();
      return false;
    };

    for (const side of SIDES) {
      const dragger = document.createElement("div");
      dragger.classList.add("mover");
      dragger.classList.add(side);
      dragger.dataset.resizeDir = side;
      dragger.addEventListener("pointermove", resizerPointerMove);
      dragger.addEventListener("pointerdown", resizerPointerDown);
      wrapper.append(dragger);
    }

    for (const corner of CORNERS) {
      const dragger = document.createElement("div");
      dragger.classList.add("mover");
      dragger.classList.add(corner);
      dragger.dataset.resizeDir = corner;
      dragger.addEventListener("pointermove", resizerPointerMove);
      dragger.addEventListener("pointerdown", resizerPointerDown);
      wrapper.append(dragger);
    }

    dragger.addEventListener("pointerdown", draggerPointerDown);
    dragger.addEventListener("pointermove", draggerPointerMove);
    dragger.addEventListener("click", draggerClick);

    document.body.appendChild(wrapper);
  }

  resizeInline(targetWidth: number, left: number | null = null) {
    const originalBcr = this.#body.getBoundingClientRect();

    this.#body.style.width = `${targetWidth}px`;

    const newBcr = this.#body.getBoundingClientRect();
    const diff = newBcr.width - originalBcr.width;

    if (diff === 0) return;

    const diffTarget = targetWidth - newBcr.width;

    if (left == null) {
      left = this.#window.getBoundingClientRect().left;
    } else if (diff !== diffTarget) {
      left += diffTarget;
    }

    this.#wrapper.style.left = `${left}px`;
  }

  resizeBlock(targetHeight: number, top: number | null = null) {
    const originalBcr = this.#body.getBoundingClientRect();

    this.#body.style.height = `${targetHeight}px`;

    const newBcr = this.#body.getBoundingClientRect();
    const diff = newBcr.height - originalBcr.height;

    if (diff === 0) return;

    const diffTarget = targetHeight - newBcr.height;

    if (top == null) {
      top = this.#window.getBoundingClientRect().top;
    } else if (diff !== diffTarget) {
      top += diffTarget;
    }

    this.#wrapper.style.top = `${top}px`;
  }

  getClientRect() {
    return this.#window.getBoundingClientRect();
  }

  get body() {
    return this.#body;
  }

  toggleMinimize() {
    this.#window.open = !this.#window.open;
    return this.#window.open;
  }
}
