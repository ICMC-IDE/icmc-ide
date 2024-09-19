import { EventHandler } from "../types";
import { VirtualFileSystemFile } from "./fs";

export default class CharMap extends OffscreenCanvas {
  #context = this.getContext("2d", { willReadFrequently: true });
  #handlers: EventHandler<void>[] = [];
  #bytes = new Uint8Array(8 * 256);
  charWidth = 8;
  charHeight = 8;
  #colorPalette;
  #file;
  // TODO: Make charmap relative to charWidth and charHeight

  constructor(colorPalette: string[], file: VirtualFileSystemFile) {
    super(8 * 256, 8 * 256);
    this.#colorPalette = colorPalette;
    this.#file = file;
  }

  togglePixel(x: number, y: number) {
    const ctx = this.#context!;
    const byte = this.#bytes[y];
    const mask = 0b1 << (7 - x);
    const on = byte & mask;

    this.#bytes[y] = (byte & ~mask) | (~byte & mask);

    for (let i = 0; i < 0x100; i++) {
      ctx.fillStyle = on ? "#000" : this.#colorPalette[i];
      ctx.fillRect(8 * i + x, y, 1, 1);
    }

    return this.emmit();
  }

  subscribe(callback: EventHandler<void>) {
    this.#handlers.push(callback);
  }

  emmit() {
    const handlers = this.#handlers;
    this.#file.write(this.#bytes.buffer);

    queueMicrotask(() => {
      for (const callback of handlers) {
        callback();
      }
    });
  }

  data() {
    return this.#context!.getImageData(0, 0, this.width, this.height);
  }

  bytes() {
    return this.#bytes;
  }

  colorPalette() {
    return this.#colorPalette;
  }

  static fromBytes(
    data: Uint8Array,
    colorPalette: string[],
    file: VirtualFileSystemFile,
  ) {
    const charmap = new CharMap(colorPalette, file);
    const chars = new OffscreenCanvas(8, 8 * 256);

    {
      const ctx = chars.getContext("2d")!;
      const imageData = ctx!.createImageData(8, 8 * 256);
      const pixels = new Uint32Array(imageData.data.buffer);
      const bytes = charmap.#bytes;

      for (let y = 0, i = 0; y < bytes.length; y++) {
        const bitmask = data[y] ?? bytes[y];
        bytes[y] = bitmask;

        for (let x = 0; x < 8; x++, i++) {
          pixels[i] = (0xffffff * ((bitmask >> (7 - x)) & 0b1)) | 0xff000000;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    {
      const ctx = charmap.#context!;
      let x = 0;

      ctx.save();

      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = "transparent";

      for (const color of colorPalette) {
        ctx.fillStyle = color;
        ctx.fillRect(x, 0, 8, 256 * 8);
        ctx.drawImage(chars, 0, 0, 8, 8 * 256, x, 0, 8, 8 * 256);

        x += 8;
      }

      ctx.restore();
    }

    charmap.emmit();
    return charmap;
  }
}
