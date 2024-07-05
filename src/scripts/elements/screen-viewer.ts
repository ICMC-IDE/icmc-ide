import CharMap from "../charmap.js";
import Renderer from "../renderer.js";

export default class ScreenViewerElement extends HTMLElement {
  #canvas = document.createElement("canvas");
  #renderer: Renderer | undefined;

  #width: number = 0;
  #height: number = 0;
  shouldUpdate = false;

  memory = new Uint16Array(0x10000);

  constructor() {
    super();
  }

  connectedCallback() {
    const div = document.createElement("div");
    if (this.attributes.getNamedItem("width")) {
      this.width = parseInt(this.attributes.getNamedItem("width")!.value);
    } else {
      this.width = 40;
    }

    if (this.attributes.getNamedItem("height")) {
      this.height = parseInt(this.attributes.getNamedItem("height")!.value);
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
    // ...args
    console.log("ScreenViewer::attributeChangedCallback"); // ...args
  }

  updateCell(offset: number, value: number) {
    this.memory[offset] = value;
    this.shouldUpdate = true;
  }

  render() {
    if (!this.shouldUpdate) return;
    this.shouldUpdate = false;

    console.log(this.memory.length);

    this.#renderer!.render(this.memory.slice(0, this.#width * this.#height));
  }

  clear() {
    this.#renderer!.clear();
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

    this.style.setProperty("--width", this.#width.toString());
    this.style.setProperty("--height", this.#height.toString());
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

  set charmap(value: CharMap) {
    if (!this.#renderer) {
      this.#renderer = new Renderer(
        this.#canvas,
        value,
        this.#width,
        this.#height,
      );
    } else {
      this.#renderer.charmap = value;
    }
    this.shouldUpdate = true;

    value.subscribe(() => {
      this.shouldUpdate = true;
      // TODO: Change this
      this.#renderer!.charmap = this.#renderer!.charmap;
    });
  }
}

customElements.define("screen-viewer", ScreenViewerElement);
