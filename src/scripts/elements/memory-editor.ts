interface Elements {
  address: HTMLInputElement;
  signed: HTMLInputElement;
  unsigned: HTMLInputElement;
  instruction: HTMLInputElement;
  bit: RadioNodeList;
}

export default class MemoryEditorElement extends HTMLElement {
  #memory: Uint16Array = new Uint16Array(0x10000);
  #smemory: Int16Array = new Int16Array(this.#memory);

  #symbols: [string, number][] = [];

  #hexCells = new Array(0x10000);
  #asciiCells = new Array(0x10000);

  #hovering: number | null = null;
  #pc = 0x0000;
  #sp = 0xffff;

  #address = 0x0000;

  #fragment = new DocumentFragment();

  #elements: Elements;

  constructor() {
    super();

    const fragment = this.#fragment;

    const template = document.getElementById(
      "memoryEditorTemplate",
    ) as HTMLTemplateElement;
    fragment.appendChild(template.content.cloneNode(true));

    const elements = (this.#elements = fragment.querySelector("form")!
      .elements as Elements);

    for (let i = 0, mask = 0x8000; i < 16; i++, mask >>= 1) {
      elements.bit[i].addEventListener("click", () => {
        // this operation is NOT ATOMIC
        const value = this.#memory[this.#address];
        this.#memory[this.#address] =
          (value & mask) == mask ? value & ~mask : value | mask;

        this.updatePanel();
      });
    }

    elements.signed.addEventListener("input", (ev) => {
      this.#smemory[this.#address] = (
        ev.target as HTMLInputElement
      ).valueAsNumber;

      this.updatePanel();
    });

    elements.unsigned.addEventListener("input", (ev) => {
      this.#memory[this.#address] = (
        ev.target as HTMLInputElement
      ).valueAsNumber;

      this.updatePanel();
    });

    console.log(this.#elements);
  }

  connectedCallback() {
    this.appendChild(this.#fragment);

    for (let i = 0; i < 0x10000; i++) {
      this.#hexCells[i] = this.#createHexCell(i.toString(16));
      this.#asciiCells[i] = this.#createAsciiCell(i.toString(16));
    }

    this.addEventListener("pointermove", (event) => {
      if (this.#hovering) {
        this.#hexCells[this.#hovering].classList.toggle("hover", false);
        this.#asciiCells[this.#hovering].classList.toggle("hover", false);
      }

      const that = event.target as HTMLSpanElement;
      if (that.dataset.address === undefined) {
        this.#hovering = null;
        return;
      }

      const address = parseInt(that.dataset.address, 16);

      this.#hexCells[address].classList.toggle("hover", true);
      this.#asciiCells[address].classList.toggle("hover", true);

      this.#hovering = address;
    });

    this.addEventListener("pointerdown", (event) => {
      const cell = event.target as HTMLElement;
      if (cell.dataset.address === undefined) {
        return;
      }

      const address = parseInt(cell.dataset.address, 16);

      this.#hexCells[this.#address].classList.toggle("selected", false);
      this.#asciiCells[this.#address].classList.toggle("selected", false);

      this.#hexCells[address].classList.toggle("selected", true);
      this.#asciiCells[address].classList.toggle("selected", true);

      this.#address = address;
      this.updatePanel();
    });
  }

  updatePanel() {
    const elements = this.#elements;
    const address = this.#address;

    elements.address.value = "0x" + address.toString(16).padStart(4, "0");
    // elements.instruction.value = "hi";
    const value = this.#memory[address];
    elements.signed.valueAsNumber = this.#smemory[address];
    elements.unsigned.valueAsNumber = value;

    for (let i = 0, mask = 0x8000; i < 16; i++, mask >>= 1) {
      (elements.bit[i] as HTMLInputElement).checked = (value & mask) == mask;
    }

    this.update(address);
  }

  update(offset: number, value: number = this.#memory[offset]) {
    const hex = this.#hexCells[offset];
    const ascii = this.#asciiCells[offset];

    hex.innerText = value.toString(16).padStart(4, "0").toUpperCase();
    ascii.innerText =
      value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";
  }

  #createHexCell(address: string, value = 0x0000) {
    const span = document.createElement("span");

    span.dataset.address = address;
    span.innerText = value.toString(16).padStart(4, "0").toUpperCase();

    return span;
  }

  #createAsciiCell(address: string, value = 0x0000) {
    const span = document.createElement("span");

    span.dataset.address = address;
    span.innerText =
      value >= 32 && value <= 126 ? String.fromCharCode(value) : ".";

    return span;
  }

  #renderMemoryBlock(
    data: Uint16Array,
    region_name: string,
    offset: number,
    length: number,
    // originOffset = 0,
  ) {
    const region = document.createElement("details");
    const name = document.createElement("summary");
    const block = document.createElement("div");

    const address = document.createElement("div");
    const hex = document.createElement("div");
    const ascii = document.createElement("div");

    region.classList.add("memory");
    block.classList.add("region");

    block.style.setProperty("--length", length.toString());
    name.innerText = `${region_name} (${length} B)`;

    address.classList.add("address");

    hex.classList.add("hex");
    ascii.classList.add("ascii");

    for (let ptr = offset, end = offset + length; ptr < end; ) {
      const hexGroup = document.createElement("div");
      const asciiGroup = document.createElement("div");
      const span = document.createElement("span");

      span.innerText = ptr.toString(16).padStart(4, "0").toUpperCase();
      address.appendChild(span);

      for (let target = Math.min(ptr + 8, end); ptr < target; ptr++) {
        const value = data[ptr];
        const hexSpan = this.#hexCells[ptr];
        const asciiSpan = this.#asciiCells[ptr];

        hexSpan.innerText = value.toString(16).padStart(4, "0").toUpperCase();

        if (value >= 32 && value <= 126) {
          asciiSpan.innerText = String.fromCharCode(value);
        } else {
          asciiSpan.innerText = ".";
        }

        asciiGroup.appendChild(asciiSpan);
        hexGroup.appendChild(hexSpan);
      }

      hex.appendChild(hexGroup);
      ascii.appendChild(asciiGroup);
    }

    // debugger;
    block.appendChild(address);
    block.appendChild(hex);
    block.appendChild(ascii);

    region.appendChild(name);
    region.appendChild(block);

    return region;
  }

  #renderMemory() {
    const memory = this.#memory;
    let end = memory.length;

    const main = this.firstElementChild!;
    main.replaceChildren();

    const symbols = this.#symbols;

    for (let i = this.#symbols.length - 1; i >= 0; i--) {
      const [name, offset] = symbols[i];
      const result = this.#renderMemoryBlock(
        memory,
        name,
        offset,
        end - offset,
        // memory.byteOffset,
      );
      end = offset as number;

      main.insertBefore(result, main.firstElementChild);
    }
  }

  set pc(offset: number) {
    if (offset === this.#pc) return;

    {
      const hex = this.#hexCells[this.#pc];
      const ascii = this.#asciiCells[this.#pc];

      hex.classList.toggle("pc", false);
      ascii.classList.toggle("pc", false);
    }

    {
      const hex = this.#hexCells[offset];
      const ascii = this.#asciiCells[offset];

      hex.classList.toggle("pc", true);
      ascii.classList.toggle("pc", true);
    }

    this.#pc = offset;
  }

  set sp(offset: number) {
    if (offset === this.#sp) return;

    {
      const hex = this.#hexCells[this.#sp];
      const ascii = this.#asciiCells[this.#sp];

      hex.classList.toggle("sp", false);
      ascii.classList.toggle("sp", false);
    }

    {
      const hex = this.#hexCells[offset];
      const ascii = this.#asciiCells[offset];

      hex.classList.toggle("sp", true);
      ascii.classList.toggle("sp", true);
    }

    this.#sp = offset;
  }

  set ram(memory: Uint16Array) {
    this.#memory = memory;
    this.#smemory = new Int16Array(
      memory.buffer,
      memory.byteOffset,
      memory.byteLength,
    );
  }

  set symbols(symbols: string) {
    const labels: [string, number][] = symbols
      .split("\n")
      .filter((line) => line.includes("="))
      .map((line): [string, number] => {
        const [name, address] = line.split(" = ");
        return [name, parseInt(address)];
      })
      .sort((lhs, rhs) => lhs[1] - rhs[1]);

    if (labels.length == 0 || labels[0][1] > 0) {
      labels.splice(0, 0, ["...", 0]);
    }

    this.#symbols = labels;
    this.#renderMemory();
  }
}

customElements.define("memory-editor", MemoryEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "memory-editor": MemoryEditorElement;
  }
}
