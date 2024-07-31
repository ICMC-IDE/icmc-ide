import CharMap from "../resources/charmap.js";
import Renderer from "../renderer.js";

export default class ScreenViewerElement extends HTMLElement {
  #canvas = document.createElement("canvas");
  #renderer: Renderer | undefined;

  #width: number = 1;
  #height: number = 1;
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

  attributeChangedCallback() {
    // ...args
    console.log("ScreenViewer::attributeChangedCallback"); // ...args
  }

  updateCell(offset: number, value: number) {
    this.memory[offset] = value;
    this.shouldUpdate = true;
  }

  render() {
    if (!this.shouldUpdate || !this.isConnected) return;

    if (this.#renderer) {
      this.shouldUpdate = false;
      this.#renderer.render(
        this.memory.subarray(0, this.#width * this.#height),
      );
    } else {
      console.log("fuck");
    }
  }

  clear() {
    this.#renderer!.clear();
  }

  #resize() {
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

declare global {
  interface HTMLElementTagNameMap {
    "screen-viewer": ScreenViewerElement;
  }
}
