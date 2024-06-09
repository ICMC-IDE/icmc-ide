class MemoryEditor extends HTMLElement {
  #memory;
  #symbols;

  #hexCells = new Array(0x10000);
  #asciiCells = new Array(0x10000);

  #hovering;
  #pc = 0x0000;
  #sp = 0xFFFF;

  constructor() {
    super();
  }

  connectedCallback() {
    for (let i = 0; i < 0x10000; i++) {
      this.#hexCells[i] = this.#createHexCell(i);
      this.#asciiCells[i] = this.#createAsciiCell(i);
    }

    this.addEventListener("pointermove", (event) => {
      if (this.#hovering) {
        this.#hexCells[this.#hovering]
          .classList.toggle("hover", false);
        this.#asciiCells[this.#hovering]
          .classList.toggle("hover", false);
      }

      if (event.target.dataset.address === undefined) {
        this.#hovering = null;
        return;
      }

      const address = event.target.dataset.address;

      this.#hexCells[address]
        .classList.toggle("hover", true);
      this.#asciiCells[address]
        .classList.toggle("hover", true);

      this.#hovering = address;
    });
  }

  load(memory, symbols) {
    this.#memory = memory;

    if (typeof symbols === "string") {
      const labels = symbols
        .split("\n")
        .filter((line) => line.includes("="))
        .map((line) => {
          const [name, address] = line.split(" = ");
          return [name, parseInt(address)];
        });


      if (labels.length == 0 || labels[0][1] > 0) {
        labels.splice(0, 0, ["...", 0]);
      }

      this.#symbols = labels;
    }

    this.#renderMemory();
  }

  update(offset, value) {
    const hex = this.#hexCells[offset];
    const ascii = this.#asciiCells[offset];

    hex.innerText = value.toString(16).padStart(4, "0").toUpperCase();
    ascii.innerText = (value >= 32 & value <= 126)
      ? String.fromCharCode(value)
      : ".";
  }

  #createHexCell(address, value = 0x0000) {
    const span = document.createElement("span");

    span.dataset.address = address;
    span.innerText = value.toString(16).padStart(4, "0").toUpperCase();

    return span;
  }

  #createAsciiCell(address, value = 0x0000) {
    const span = document.createElement("span");

    span.dataset.address = address;
    span.innerText = (value >= 32 & value <= 126)
      ? String.fromCharCode(value)
      : ".";

    return span;
  }

  #renderMemoryBlock(data, region_name, offset, length, originOffset = 0) {
    const rows = length / 16;

    const region = document.createElement("details");
    const name = document.createElement("summary");
    const block = document.createElement("div");
    const address = document.createElement("div");

    const hex = document.createElement("div");
    const ascii = document.createElement("div");

    region.classList.add("memory");
    block.classList.add("region");
    address.classList.add("address");

    hex.classList.add("hex");
    ascii.classList.add("ascii");

    name.innerText = `${region_name} (${length} B)`;

    const group = [];

    // debugger;
    for (let i = 0; i < length; i++) {
      const value = data[offset + i];
      const span0 = this.#hexCells[offset + i];
      const span1 = this.#asciiCells[offset + i];

      span0.innerText = value.toString(16).padStart(4, "0").toUpperCase();

      if (value >= 32 & value <= 126) {
        span1.innerText = String.fromCharCode(value);
      } else {
        span1.innerText = ".";
      }

      hex.appendChild(span0);
      ascii.appendChild(span1);
      group.push([span0, span1]);
    }

    for (let i = 0; i < rows; i++) {
      const span = document.createElement("span");
      span.innerText = (offset + 16 * i).toString(16).padStart(4, "0").toUpperCase();
      address.appendChild(span);
    }

    block.appendChild(address);
    block.appendChild(hex);
    block.appendChild(ascii);

    region.appendChild(name);
    region.appendChild(block);

    return region;
  }

  #renderMemory() {
    let memory = this.#memory;
    let end = memory.length;

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }

    const symbols = this.#symbols;

    for (let i = this.#symbols.length - 1; i >= 0; i--) {
      const [name, offset] = symbols[i];
      const result = this.#renderMemoryBlock(memory, name, offset, end - offset, memory.byteOffset);
      end = offset;

      this.insertBefore(result, this.firstElementChild);
    }
  }

  set pc(offset) {
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

  set sp(offset) {
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
}

customElements.define("memory-editor", MemoryEditor);
