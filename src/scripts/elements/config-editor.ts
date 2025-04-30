const TEMPLATE = document.getElementById(
  "configEditorTemplate",
) as HTMLTemplateElement;

interface ChangeConfigMap {
  screenWidth: number;
  screenHeight: number;
  gridWidth: number;
  gridHeight: number;
  syntax: string;
  numbersFormat: number;
}

export const CHANGE_CONFIG_MAP_KEYS = [
  "screenWidth",
  "screenHeight",
  "gridWidth",
  "gridHeight",
  "syntax",
  "numbersFormat",
] as const satisfies (keyof ChangeConfigMap)[];

interface ChangeConfigEvent<K extends keyof ChangeConfigMap> {
  detail: {
    name: K;
    value: ChangeConfigMap[K];
  };
}

export default class ConfigEditorElement extends HTMLElement {
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;

  constructor() {
    super();

    const fragment = this.#fragment;
    const form = fragment.querySelector("form")!;

    form.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement;

      let value: number | string = parseInt(target.value);
      if (isNaN(value)) {
        value = target.value;
      }
      /*    if (
              target.name === "screenWidth" ||
              target.name === "screenHeight" ||
              target.name === "gridWidth" ||
              target.name === "gridHeight" ||
              target.name === "numbersFormat"
            ) {
              value = target.valueAsNumber | 0;
            } else if (target.name) {
              value = target.value;
            }*/

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

  setConfigs(configs: ChangeConfigMap) {
    const form = this.#fragment.querySelector("form")!;

    for (const [key, value] of Object.entries(configs)) {
      const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
      if (input) {
        if (input.type === "checkbox") {
          input.checked = Boolean(value);
        } else {
          input.value = String(value);
        }
      }
    }
  }

  connectedCallback() {
    this.appendChild(this.#fragment);
  }
}

customElements.define("config-editor", ConfigEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "config-editor": ConfigEditorElement;
  }

  interface HTMLElementEventMap {
    "change-config": ChangeConfigEvent<keyof ChangeConfigMap>;
  }
}
