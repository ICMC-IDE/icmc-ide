
class ScreenEditor extends HTMLElement {
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

    const that = this;

    this.#colors.addEventListener("pointerdown", function (event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;

      that.pickColor(8 * y + x);
    });

    // FIXME
    this.#coloredChar.addEventListener("pointerdown", function (event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;
      const char = that.#char;
      const charmap = that.#charmap;

      charmap.togglePixel(x % 8, 8 * char + y);
    });

    this.#chars.addEventListener("pointerdown", function (event) {
      const rect = this.getBoundingClientRect();
      const x = (event.clientX - rect.left) / 16 | 0;
      const y = (event.clientY - rect.top) / 16 | 0;

      that.pickChar(32 * y + x);
    });

    this.#screen.addEventListener("pointerdown", function (event) {
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

  #generatePalette(palette) {
    const ctx = this.#colors.getContext("2d");

    for (let y = 0, i = 0; i < palette.length; y++) {
      for (let x = 0; x < 8; x++, i++) {
        ctx.fillStyle = palette[i];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  set charmap(value) {
    this.#charmap = value;
    this.#screen.charmap = value;
    this.#chars.charmap = value;
    this.#coloredChar.charmap = value;
    this.#generatePalette(value.colorPalette);
  }

  // set colorPalette(palette) {
  //   this.#generatePalette(palette);
  // }

  set width(value) {
    this.style.setProperty("--width", value);

    if (this.#screen) {
      this.#screen.width = value;
    }
  }

  get width() {
    return this.#screen.width;
  }

  set height(value) {
    this.style.setProperty("--height", value);

    if (this.#screen) {
      this.#screen.height = value;
    }
  }

  get height() {
    return this.#screen.height;
  }
}

customElements.define("screen-editor", ScreenEditor);
