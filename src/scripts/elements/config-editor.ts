/*
const FREQUENCIES = [
  "1 Hz",
  "10 Hz",
  "100 Hz",
  "1 kHz",
  "10 kHz",
  "100 kHz",
  "1 MHz",
  "10 MHz",
  "100 MHz",
  "FAST!",
];
*/

interface ChangeConfigEvent {
  detail: {
    name: string;
    value: string | number | undefined;
  };
}

export default class ConfigEditorElement extends HTMLElement {
  // #elements;

  constructor() {
    super();
  }

  connectedCallback() {
    const configEditorTemplate = document.getElementById(
      "configEditorTemplate",
    ) as HTMLTemplateElement;
    this.appendChild(configEditorTemplate.content.cloneNode(true));

    const form = this.querySelector("form")!;

    // this.#elements = form.elements;

    /*
    for (const field in config) {
      if (this.#elements[field]) {
        this.#elements[field].value = config[field].get();
      }
    }
    */

    form.addEventListener("input", (event) => {
      let value;
      const target = event.target as HTMLInputElement;

      if (target.name === "screenWidth" || target.name === "screenHeight") {
        value = target.valueAsNumber | 0;
      } else if (target.name) {
        value = target.value;
      }

      this.dispatchEvent(
        new CustomEvent("change-config", {
          detail: {
            name: target.name,
            value,
          },
        }),
      );
    });
  }

  disconnectedCallback() {
    // this.#elements = null;

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }
}

customElements.define("config-editor", ConfigEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "config-editor": ConfigEditorElement;
  }
  interface HTMLElementEventMap {
    "change-config": ChangeConfigEvent;
  }
}
