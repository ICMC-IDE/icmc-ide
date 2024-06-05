import { frequency } from "../config.js";

const FREQUENCIES = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

export default class StateEditor extends HTMLElement {
  #buttons;
  #elements;
  #registers;
  #running = false;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(stateViewTemplate.content.cloneNode(true));

    const forms = this.querySelectorAll("form");

    this.#buttons = forms[0].elements;
    this.#elements = forms[1].elements;

    frequency.subscribe((value) => {
      this.#buttons.frequency.nextSibling.innerText = FREQUENCIES[this.#buttons.frequency.valueAsNumber];

      if (this.#buttons.frequency.valueAsNumber !== value) {
        this.#buttons.frequency.value = value;
      }
    });

    this.#buttons.frequency.addEventListener("input", function() {
      frequency.set(this.valueAsNumber);
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
    return 10 ** frequency.get();
  }

  set registers(registers) {
    this.#registers = registers;
  }

  set running(value) {
    this.#running = value;    

    this.#buttons.stop.style.display = value ? "" : "none";
    this.#buttons.play.style.display = value ? "none" : "";
  }
}

customElements.define("state-editor", StateEditor);
