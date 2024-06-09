const FREQUENCIES = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

class StateEditor extends HTMLElement {
  #elements;
  #running = false;
  #frequency = 6;

  registers;
  internalRegisters;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(stateViewTemplate.content.cloneNode(true));

    const forms = this.querySelectorAll("form");

    this.#elements = {
      buttons: forms[0].elements,
      registers: forms[1].elements,
      internalRegisters: forms[2].elements,
    };

    this.#elements.buttons.frequency.addEventListener("input", ({ target }) => {
      this.dispatchEvent(new CustomEvent("change-frequency", { detail: target.valueAsNumber }));
    });

    this.#elements.buttons.file.addEventListener("input", ({ target }) => {
      this.dispatchEvent(new CustomEvent("change-file", { detail: target.value }));
    });
  }

  render() {
    const elements = this.#elements;

    if (this.registers) {
      for (let i = 0, registers = this.registers; i < registers.length; i++) {
        elements.registers[i].value = registers[i].toString(16).padStart(4, "0").toUpperCase();
      }
    }

    if (this.internalRegisters) {
      for (let i = 0, registers = this.internalRegisters; i < 4; i++) {
        elements.internalRegisters[i].value = registers[i].toString(16).padStart(4, "0").toUpperCase();
      }
    }
  }

  get frequency() {
    return 10 ** this.#frequency;
  }

  set frequency(value) {
    this.#frequency = value;

    if (!this.#elements.buttons) return;

    this.#elements.buttons.frequency.nextSibling.innerText = FREQUENCIES[this.#elements.buttons.frequency.valueAsNumber];

    if (this.#elements.buttons.frequency.valueAsNumber !== value) {
      this.#elements.buttons.frequency.value = value;
    }
  }

  set running(value) {
    this.#running = value;

    this.#elements.buttons.stop.style.display = value ? "" : "none";
    this.#elements.buttons.play.style.display = value ? "none" : "";
  }

  set files(fileNames) {
    const select = this.#elements.buttons.file;
    const value = select.value;

    while (select.lastElementChild) {
      select.lastElementChild.remove();
    }

    for (const fileName of fileNames) {
      if (!fileName.match(/\.c$|\.asm/i)) continue;

      const option = document.createElement("option");
      option.value = fileName;
      option.innerText = fileName;
      option.selected = fileName === value;
      select.appendChild(option);
    }
  }

  set entryFile(fileName) {
    this.#elements.buttons.file.value = fileName;
  }
}

customElements.define("state-editor", StateEditor);
