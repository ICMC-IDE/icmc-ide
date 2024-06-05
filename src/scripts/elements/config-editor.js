import * as config from "../config.js";
const FREQUENCIES = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

export default class ConfigEditor extends HTMLElement {
  #elements;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(configEditorTemplate.content.cloneNode(true));

    const form = this.querySelector("form");

    this.#elements = form.elements;

    for (const field in config) {
      if (this.#elements[field]) {
        this.#elements[field].value = config[field].get();
      }
    }

    form.addEventListener("input",(event) => {
      const { target } = event;

      if (target.name === "screenWidth") {
        const width = (target.valueAsNumber) | 0;
        if (width < 1 || config.screenHeight.get() * width > 0x10000) return;

        config.screenWidth.set(width);
      } else if (target.name === "screenHeight") {
        const height = (target.valueAsNumber) | 0;
        if (height < 1 || config.screenWidth.get() * height > 0x10000) return;

        config.screenHeight.set(height);
      } else if (target.name) {
        config[target.name].set(target.value);
      }
    });
  }

  disconnectedCallback() {
    this.#elements = null;

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }
}

customElements.define("config-editor", ConfigEditor);
