class ScreenViewer extends HTMLElement {
  #canvas = document.createElement("canvas");
  #context = this.#canvas.getContext("2d");
  #memory;
  #charmap;

  #width;
  #height;
  #shouldUpdate = false;

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
    this.#memory[offset] = value;
    this.#shouldUpdate = true;
  }

  render() {
    if (!this.#shouldUpdate) return;

    this.#shouldUpdate = false;

    const charmap = this.#charmap;
    const context = this.#context;
    const memory = this.#memory;
    const width = this.#width;

    for (let offset = 0; offset < memory.length; offset++) {
      const value = memory[offset];
      const color = (value >> 0x08) & 0xFF;
      const char = value & 0xFF;

      context.drawImage(charmap, color * 8, char * 8, 8, 8, (offset % width) * 8, Math.floor(offset / width) * 8, 8, 8);
    }
  }

  clear() {
    this.#context.fill = "black";
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #resize() {
    const newMemory = new Uint16Array(this.#width * this.#height);

    if (this.#memory) {
      const memory = this.#memory;
      const length = Math.min(newMemory.length, memory.length);

      for (let i = 0; i < length; i++) {
        newMemory[i] = memory[i];
      }
    }

    this.#memory = newMemory;
    this.#canvas.width = this.#width * 8;
    this.#canvas.height = this.#height * 8;
    this.style.setProperty("--width", this.#width);
    this.style.setProperty("--height", this.#height);
    this.#shouldUpdate = true;
  }

  set width(value) {
    if (value == this.#width) return;

    this.#width = value;
    this.#resize();
  }

  get width() {
    return this.#width;
  }

  set height(value) {
    if (value == this.#height) return;

    this.#height = value;
    this.#resize();
  }

  get height() {
    return this.#height;
  }

  set charmap(value) {
    this.#charmap = value;
    this.#shouldUpdate = true;

    const that = this;
    this.#charmap.subscribe(function() {
      that.#shouldUpdate = true;
    });
  }
}

customElements.define("screen-viewer", ScreenViewer);
