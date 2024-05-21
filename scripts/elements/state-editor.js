const FREQUENCIES = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

export default class StateEditor extends HTMLElement {
  #frequency;
  #registers;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(stateViewTemplate.content.cloneNode(true));

    this.#frequency = this.querySelector(".frequency input");
    this.#registers = this.querySelector("form");

    this.#frequency.addEventListener("input", function() {
      this.nextSibling.innerText = FREQUENCIES[this.valueAsNumber];
    });

    this.#frequency.nextSibling.innerText = FREQUENCIES[this.#frequency.valueAsNumber];
  }

  disconnectedCallback() {
    this.#frequency = null; 

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }
   
  get frequency() {
    return 10 ** this.#frequency.valueAsNumber;
  }

  set registers(registers) {
    for (let i = 0; i < registers.length; i++) {
      this.#registers.elements[i].value = registers[i].toString(16).padStart(4, "0").toUpperCase();
    }
  }
}

customElements.define("state-editor", StateEditor);
