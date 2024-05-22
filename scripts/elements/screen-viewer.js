export default class ScreenViewer extends HTMLElement {
  #canvas = document.createElement("canvas");
  #context = this.#canvas.getContext("2d");
  #memory;
  #charmap;

  #width;
  #height;

  constructor() {
    super();
  }

  connectedCallback() {
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
    this.appendChild(this.#canvas);
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
    this.#memory[offset] = value;
  }

  renderCell(offset, value = this.#memory[offset]) {
    const color = (value >> 0x08) & 0xFF;
    const char = value & 0xFF;

    this.#context.putImageData(this.#charmap, (offset % this.#width - color) * 8, Math.floor(offset / this.#width - char) * 8, color * 8, char * 8, 8, 8);
  }

  render() {
    const charmap = this.#charmap;
    const context = this.#context;
    const memory = this.#memory;
    const width = this.#width;

    for (let offset = 0; offset < memory.length; offset++) {
      const value = memory[offset];
      const color = (value >> 0x08) & 0xFF;
      const char = value & 0xFF;

      context.putImageData(charmap, (offset % width - color) * 8, Math.floor(offset / width - char) * 8, color * 8, char * 8, 8, 8);
    }
  }

  clear() {
    this.#context.fill = "black";
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #resize() {
    this.#memory = new Uint16Array(this.#width * this.#height);
    this.#canvas.width = this.width * 8;
    this.#canvas.height = this.height * 8;
  }

  set width(value) {
    this.#width = value;
    this.style.setProperty("--width", value);
  }

  get width() {
    return this.#width;
  }

  set height(value) {
    this.#height = value;
    this.style.setProperty("--height", value);
  }

  get height() {
    return this.#height;
  }

  set charmap(value) {
    this.#charmap = value;
    this.render();
  }
}

customElements.define("screen-viewer", ScreenViewer);
