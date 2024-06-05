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

export default class CharMap extends OffscreenCanvas {
  // #canvas = new OffscreenCanvas(2048, 1024);
  #context = this.getContext("2d");
  #pixel = this.#context.createImageData(1, 1);
  #color = new Uint32Array(this.#pixel.data.buffer);
  #handlers = [];

  constructor() {
    super(2048, 1024);
  }

  setPixel(x, y, on = true) {
    this.#color[0] = 0xFF000000 | (on * COLORS[(x / 8) | 0]);
    this.#context.putImageData(this.#pixel, x, y);

    return this.emmit();
  }

  rawSetPixel(x, y, on = true) {
    this.#color[0] = 0xFF000000 | (on * COLORS[(x / 8) | 0]);
    this.#context.putImageData(this.#pixel, x, y);
  }

  togglePixel(x, y) {
    const pixel = this.#context.getImageData(x, y, 1, 1);
    const on = !(pixel.data[0] & 0x00FFFFFF);

    for (let i = 0; i < 0x100; i++) {
      this.#color[0] = 0xFF000000 | (on * COLORS[i]);
      this.#context.putImageData(this.#pixel, x + 8 * i, y);
    }

    return this.emmit();
  }

  await(callback) {
    this.#handlers.push(callback);
  }

  emmit() {
    for (const callback of this.#handlers) {
      callback();
    }
  }

  static fromMif(data) {
    const charmap = new CharMap();

    data
      .split("\n")
      .filter((line) => /^\s*[\d\[].*:/.test(line))
      .forEach((line) => {
        line = line.trim();

        const res = line.match(/^(\d+)\s*:\s*([0-1]+)/);

        if (res) {
          let [_, y, value] = res;

          y = parseInt(y, 10);
          value = parseInt(value, 2);

          for (let l = 0, x = 0; l < 0x100; l++) {
            for (let j = 0; j < 8; j++, x++) {
              charmap.rawSetPixel(x, y, (value >> (7 - j)) & 0b1);
            }
          }
        } else {
          let [_, from, to, value] = line.match(/^\[(\d+)\.\.(\d+)\]\s*:\s*([01]+)/);

          from = parseInt(from, 10);
          to = parseInt(to, 10);
          value = parseInt(value, 2);

          for (let y = from; y <= to; y++) {
            for (let l = 0, x = 0; l < 0x100; l++) {
              for (let j = 0; j < 8; j++, x++) {
                charmap.rawSetPixel(x, y, (value >> (7 - j)) & 0b1);
              }
            }
          }
        }
      });

    return charmap;
  }
}
