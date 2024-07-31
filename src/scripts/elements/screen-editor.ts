import CharMap from "../resources/charmap";
import ScreenViewerElement from "./screen-viewer";

export default class ScreenEditorElement extends HTMLElement {
  #chars: ScreenViewerElement;
  #screen: ScreenViewerElement;
  #colors: HTMLCanvasElement;
  #coloredChar: ScreenViewerElement;
  #charmap: CharMap | undefined;
  #char = 65;
  #color = 0;
  #fragment: DocumentFragment;

  constructor() {
    super();

    const screenEditorTemplate = document.getElementById(
      "screenEditorTemplate",
    )! as HTMLTemplateElement;

    const fragment = (this.#fragment = screenEditorTemplate.content.cloneNode(
      true,
    ) as DocumentFragment);

    const viewers = fragment.querySelectorAll("screen-viewer");

    this.#chars = viewers[0] as ScreenViewerElement;
    this.#coloredChar = viewers[1] as ScreenViewerElement;
    this.#screen = viewers[2] as ScreenViewerElement;
    this.#colors = fragment.querySelector("canvas")! as HTMLCanvasElement;

    this.#colors.addEventListener("pointerdown", (event: PointerEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / 16) | 0;
      const y = ((event.clientY - rect.top) / 16) | 0;

      this.pickColor(8 * y + x);
    });

    // FIXME
    this.#coloredChar.addEventListener("pointerdown", (event: PointerEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / 16) | 0;
      const y = ((event.clientY - rect.top) / 16) | 0;

      this.#charmap!.togglePixel(x % 8, 8 * this.#char + y);
    });

    this.#chars.addEventListener("pointerdown", (event: PointerEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / 16) | 0;
      const y = ((event.clientY - rect.top) / 16) | 0;

      this.pickChar(32 * y + x);
    });

    this.#screen.addEventListener("pointerdown", (event: PointerEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / 16) | 0;
      const y = ((event.clientY - rect.top) / 16) | 0;

      this.#screen.updateCell(
        canvas.width * y + x,
        this.#char | (this.#color << 8),
      );
    });
  }

  connectedCallback() {
    this.appendChild(this.#fragment); // this.#fragment becomes an empty array after being appended. so there is no problem doing it multiple times
  }

  render() {
    if (!this.isConnected) return;

    this.#chars.render();
    this.#screen.render();
    this.#coloredChar.render();
  }

  pickColor(color: number) {
    this.#color = color;

    for (let byte = 0; byte < 0x100; byte++) {
      this.#chars.updateCell(byte, (color << 8) | byte);
    }

    this.#coloredChar.updateCell(0, (color << 8) | this.#char);
  }

  pickChar(char: number) {
    this.#char = char;
    this.#coloredChar.updateCell(0, (this.#color << 8) | char);
  }

  #generatePalette(palette: string[]) {
    const ctx = this.#colors.getContext("2d")!;

    for (let y = 0, i = 0; i < palette.length; y++) {
      for (let x = 0; x < 8; x++, i++) {
        ctx.fillStyle = palette[i];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  set charmap(value: CharMap) {
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
    this.style.setProperty("--width", value.toString());

    if (this.#screen) {
      this.#screen.width = value;
    }
  }

  get width() {
    return this.#screen.width;
  }

  set height(value) {
    this.style.setProperty("--height", value.toString());

    if (this.#screen) {
      this.#screen.height = value;
    }
  }

  get height() {
    return this.#screen.height;
  }
}

customElements.define("screen-editor", ScreenEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "screen-editor": ScreenEditorElement;
  }
}
