import { screenHeight, screenWidth } from "../config.js";

function color8bits(byte) {
  byte = ~byte;
  const r = (((byte & 0b11100000) >> 5) * 0xFF / 0b111) | 0;
  const g = (((byte & 0b00011100) >> 2) * 0xFF / 0b111) | 0;
  const b = (((byte & 0b00000011) >> 0) * 0xFF / 0b011) | 0;
  return (r << 16) | (g << 8) | b;
}

const COLORS = (new Array(256))
  .fill(0)
  .map((_, i) => color8bits(i));

export default class ScreenEditor extends HTMLElement {
  #chars;
  #screen;
  #colors;
  #coloredChar;
  #color;
  #charmap;
  #char = 65;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(screenEditorTemplate.content.cloneNode(true))

    const viewers = this.querySelectorAll("screen-viewer");

    this.#chars = viewers[0];
    this.#coloredChar = viewers[1];
    this.#screen = viewers[2];
    this.#colors = this.querySelector("&>canvas");

    this.pickColor(0);
    this.pickChar(65);

    {
      const context = this.#colors.getContext("2d");
      const imageData = context.getImageData(0, 0, this.#colors.width, this.#colors.height);
      const pixels = new Uint32Array(imageData.data.buffer);

      for (let i = 0; i < 0x100; i++) {
        pixels[i] = COLORS[i] | 0xFF000000;
      }

      context.putImageData(imageData, 0, 0);
    }

    const that = this;

    this.#colors.addEventListener("pointerdown", function(event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;

      that.pickColor(8 * y + x);
    });

    // FIXME
    this.#coloredChar.addEventListener("pointerdown", function(event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;
      const char = that.#char;
      const charmap = that.#charmap;

      charmap.togglePixel(x % 8, 8 * char + y);
    });

    this.#chars.addEventListener("pointerdown", function(event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;

      that.pickChar(32 * y + x);
    });

    this.#screen.addEventListener("pointerdown", function(event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;

      that.#screen.updateCell(that.width * y + x, that.#char | (that.#color << 8));
    });
  }

  disconnectedCallback() {
    this.#screen = null;
    this.#chars = null;

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }

  render() {
    this.#chars.render();
    this.#screen.render();
    this.#coloredChar.render();
  }

  pickColor(color) {
    this.#color = color;

    for (let byte = 0; byte < 0x100; byte++) {
      this.#chars.updateCell(byte, (color << 8) | byte);
    }

    this.#coloredChar.updateCell(0, (color << 8) | this.#char);
  }

  pickChar(char) {
    this.#char = char;
    this.#coloredChar.updateCell(0, (this.#color << 8) | char);
  }

  set charmap(value) {
    this.#charmap = value;
    this.#screen.charmap = value;
    this.#chars.charmap = value;
    this.#coloredChar.charmap = value;
  }

  set width(value) {
    this.#screen.width = value;
    this.style.setProperty("--width", value);
  }

  get width() {
    return this.#screen.width;
  }

  set height(value) {
    this.#screen.height = value;
    this.style.setProperty("--height", value);
  }

  get height() {
    return this.#screen.height;
  }
}

customElements.define("screen-editor", ScreenEditor);
