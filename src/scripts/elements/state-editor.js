const FREQUENCIES = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

class StateEditor extends HTMLElement {
  #buttons;
  #elements;
  #registers;
  #running = false;
  #frequency = 6;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(stateViewTemplate.content.cloneNode(true));

    const forms = this.querySelectorAll("form");

    this.#buttons = forms[0].elements;
    this.#elements = forms[1].elements;

    this.#buttons.frequency.addEventListener("input", ({ target }) => {
      this.dispatchEvent(new CustomEvent("change-frequency", { detail: target.valueAsNumber }));
    });

    this.#buttons.file.addEventListener("input", ({ target }) => {
      this.dispatchEvent(new CustomEvent("change-file", { detail: target.value }));
    });
  }

  disconnectedCallback() {
    this.#buttons = null;
    this.#elements = null;
    this.#registers = null;

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }

  render() {
    if (!this.#registers) return;

    const elements = this.#elements;
    const registers = this.#registers;

    for (let i = 0; i < registers.length; i++) {
      elements[i].value = registers[i].toString(16).padStart(4, "0").toUpperCase();
    }
  }

  get frequency() {
    return 10 ** this.#frequency;
  }

  set frequency(value) {
    this.#frequency = value;

    if (!this.#buttons) return;

    this.#buttons.frequency.nextSibling.innerText = FREQUENCIES[this.#buttons.frequency.valueAsNumber];

    if (this.#buttons.frequency.valueAsNumber !== value) {
      this.#buttons.frequency.value = value;
    }
  }

  set registers(registers) {
    this.#registers = registers;
  }

  set running(value) {
    this.#running = value;

    this.#buttons.stop.style.display = value ? "" : "none";
    this.#buttons.play.style.display = value ? "none" : "";
  }

  set files(fileNames) {
    const select = this.#buttons.file;
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
    this.#buttons.file.value = fileName;
  }
}

customElements.define("state-editor", StateEditor);
