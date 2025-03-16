import CharMap from "../resources/charmap";
import ScreenViewerElement from "./screen-viewer";

const TEMPLATE = document.getElementById(
  "screenEditorTemplate",
)! as HTMLTemplateElement;

function calcXY(event: PointerEvent) {
  const canvas = event.target as HTMLCanvasElement;

  const rect = canvas.getBoundingClientRect();
  const x = (((event.clientX - rect.left) / rect.width) * canvas.width) | 0;
  const y = (((event.clientY - rect.top) / rect.height) * canvas.height) | 0;

  return [x, y];
}

export default class ScreenEditorElement extends HTMLElement {
  static observedAttributes = ["width", "height"];

  #chars: ScreenViewerElement;
  #screen: ScreenViewerElement;
  #colors: HTMLCanvasElement;
  #coloredChar: ScreenViewerElement;
  #charmap?: CharMap;
  #char = 65;
  #color = 0;
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;
  #controller?: AbortController;

  constructor() {
    super();

    const fragment = this.#fragment;
    const viewers = fragment.querySelectorAll("screen-viewer");

    this.#chars = viewers[0] as ScreenViewerElement;
    this.#coloredChar = viewers[1] as ScreenViewerElement;
    this.#screen = viewers[2] as ScreenViewerElement;
    this.#colors = fragment.querySelector("canvas")! as HTMLCanvasElement;
  }

  connectedCallback() {
    this.#controller = new AbortController();

    this.#colors.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        const [x, y] = calcXY(event);
        this.pickColor(this.#charmap!.charHeight * y + x);
      },
      { signal: this.#controller.signal },
    );

    this.#coloredChar.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        if (!(event.target instanceof HTMLCanvasElement)) return;

        const [x, y] = calcXY(event);
        this.#charmap!.togglePixel(
          x % this.#charmap!.charWidth,
          this.#charmap!.charHeight * this.#char + y,
        );
      },
      { signal: this.#controller.signal },
    );

    this.#chars.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        if (!(event.target instanceof HTMLCanvasElement)) return;

        const [x, y] = calcXY(event);
        this.pickChar(
          32 * Math.floor(y / this.#charmap!.charHeight) +
            Math.floor(x / this.#charmap!.charWidth),
        );
      },
      { signal: this.#controller.signal },
    );

    this.#screen.addEventListener(
      "pointerdown",
      (event: PointerEvent) => {
        if (!(event.target instanceof HTMLCanvasElement)) return;

        const [x, y] = calcXY(event);
        this.#screen.updateCell(
          this.#screen.width * Math.floor(y / this.#charmap!.charHeight) +
            Math.floor(x / this.#charmap!.charWidth),
          this.#char | (this.#color << 8),
        );
      },
      { signal: this.#controller.signal },
    );

    this.appendChild(this.#fragment); // this.#fragment becomes an empty array after being appended. so there is no problem doing it multiple times
    this.pickColor(this.#color);
  }

  disconnectedCallback() {
    this.#controller!.abort();
    this.#controller = undefined;
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

  setCharmap(value: CharMap) {
    this.#charmap = value;
    this.#generatePalette(value.colorPalette());

    customElements.whenDefined("screen-viewer").then(() => {
      this.#screen.setCharmap(value);
      this.#chars.setCharmap(value);
      this.#coloredChar.setCharmap(value);
    });
  }

  setWidth(value: number) {
    this.style.setProperty("--width", value.toString());

    // customElements.whenDefined("screen-viewer").then(() => {
    //   console.log(this.#screen);
    //   // this.#screen.setWidth(value);
    // });
  }

  setHeight(value: number) {
    this.style.setProperty("--height", value.toString());

    // customElements.whenDefined("screen-viewer").then(() => {
    //   console.log("ScreenEditorElement::setHeight[2]");
    //   // this.#screen.setHeight(value);
    // });
  }
}

customElements.define("screen-editor", ScreenEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "screen-editor": ScreenEditorElement;
  }
}
