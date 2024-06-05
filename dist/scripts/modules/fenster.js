const SIDES = ["n", "e", "s", "w"];
const CORNERS = ["ne", "se", "sw", "nw"];

let zIndex = 100;

export default class Fenster {
  #body;
  #dragger;
  #wrapper;
  #window;
  #maximized = false;

  constructor({ body, title, style, open, buttonsLeft, buttonsRight }) {
    const wrapper = this.#wrapper = document.createElement("div");
    const dragger = this.#dragger = document.createElement("summary");
    const window = this.#window = document.createElement("details");

    const { left, top, ...others } = style;

    for (const name in others) {
      body.style[name] = style[name];
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
        icon.src = window.open ? "images/minimize.png" : "images/unminimize.png";
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

    window.append(dragger, body);
    wrapper.append(window);

    const that = this;

    let x, y;
    let offsetX, offsetY;
    let originalWidth, originalHeight;

    const resizerPointerMove = function(event) {
      if (event.buttons !== 1) return;
      event.preventDefault();

      const dir = this.dataset.resizeDir;

      const boundsWindow = window.getBoundingClientRect();
      const boundsBody = body.getBoundingClientRect();

      for (const char of dir) {
        switch (char) {
          case "w":
            that.resizeInline(originalWidth + (x - event.x) - (boundsWindow.width - boundsBody.width), event.x - offsetX);
            break;
          case "s":
            that.resizeBlock(originalHeight + (event.y - y) - (boundsWindow.height - boundsBody.height));
            break;
          case "e":
            that.resizeInline(originalWidth + (event.x - x) - (boundsWindow.width - boundsBody.width));
            break;
          case "n":
            that.resizeBlock(originalHeight + (y - event.y) - (boundsWindow.height - boundsBody.height), event.y - offsetY);
            break;
        }
      }
    };

    wrapper.addEventListener("pointerdown", function() {
      if (this.style.zIndex < zIndex)
        this.style.zIndex = ++zIndex;
    });

    const resizerPointerDown = function(event) {
      event.preventDefault();
      this.setPointerCapture(event.pointerId);

      const boundsWindow = window.getBoundingClientRect();
      const boundsBody = body.getBoundingClientRect();

      x = event.x;
      y = event.y;

      offsetX = x - boundsWindow.left;
      offsetY = y - boundsWindow.top;

      originalWidth = boundsBody.width;
      originalHeight = boundsWindow.height;
    };

    const draggerPointerDown = function(event) {
      event.preventDefault();
      this.setPointerCapture(event.pointerId);

      const boundsWindow = window.getBoundingClientRect();

      x = event.x;
      y = event.y;

      offsetX = x - boundsWindow.left;
      offsetY = y - boundsWindow.top;
    };

    const draggerPointerMove = function(event) {
      if (event.buttons !== 1) return;
      event.preventDefault();

      wrapper.style.left = `${event.x - offsetX}px`;
      wrapper.style.top = `${event.y - offsetY}px`;
    };

    const draggerClick = function(event) {
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

  resizeInline(targetWidth, left) {
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

  resizeBlock(targetHeight, top) {
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
    this.#window.open ^= true;
    return this.#window.open;
  }

  toggleMaximize() {
    this.#maximized ^= true;
    return this.#maximized;
  }
}
