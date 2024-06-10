import Renderer from "../renderer.js";

class ScreenViewer extends HTMLElement {
  #canvas = document.createElement("canvas");
  #renderer;

  #width;
  #height;
  shouldUpdate = false;

  memory = new Uint16Array(0x10000);

  constructor() {
    super();
  }

  connectedCallback() {
    const div = document.createElement("div");
    if (this.attributes.width) {
      this.width = this.attributes.width.value * 1;
    } else {
      this.width = 40;
    }

    if (this.attributes.height) {
      this.height = this.attributes.height.value * 1;
    } else {
      this.height = 30;
    }

    this.#resize();
    div.appendChild(this.#canvas);
    this.appendChild(div);
  }

  disconnectedCallback() {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }

  attributeChangedCallback() {
    console.log("ScreenViewer::attributeChangedCallback", ...arguments);
  }

  updateCell(offset, value) {
    this.memory[offset] = value;
    this.shouldUpdate = true;
  }

  render() {
    if (!this.shouldUpdate) return;
    this.shouldUpdate = false;

    console.log(this.memory.length);

    this.#renderer.render(this.memory.slice(0, this.#width * this.#height));
  }

  clear() {
    this.#renderer.clear();
  }

  #resize() {
    const newMemory = new Uint16Array(this.#width * this.#height);

    if (this.memory) {
      const memory = this.memory;
      const length = Math.min(newMemory.length, memory.length);

      for (let i = 0; i < length; i++) {
        newMemory[i] = memory[i];
      }
    }

    this.memory = newMemory;

    if (this.#renderer) {
      this.#renderer.resize(this.#width, this.#height);
    }

    this.style.setProperty("--width", this.#width);
    this.style.setProperty("--height", this.#height);
    this.shouldUpdate = true;
  }

  get width() {
    return this.#width;
  }

  set width(value) {
    if (value == this.#width) return;

    this.#width = value;
    this.#resize();
  }

  get height() {
    return this.#height;
  }

  set height(value) {
    if (value == this.#height) return;

    this.#height = value;
    this.#resize();
  }

  set charmap(value) {
    if (!this.#renderer) {
      this.#renderer = new Renderer(this.#canvas, value, this.#width, this.#height);
    } else {
      this.#renderer.charmap = value;
    }
    this.shouldUpdate = true;

    const that = this;
    value.subscribe((data) => {
      that.shouldUpdate = true;
      // update renderer
    });
  }
}

customElements.define("screen-viewer", ScreenViewer);
