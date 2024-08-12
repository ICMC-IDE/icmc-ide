const TEMPLATE = document.getElementById(
  "configEditorTemplate",
) as HTMLTemplateElement;

interface ChangeConfigMap {
  screenWidth: number;
  screenHeight: number;
  gridWidth: number;
  gridHeight: number;
  syntax: string;
}

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
      let value;
      const target = event.target as HTMLInputElement;

      if (
        target.name === "screenWidth" ||
        target.name === "screenHeight" ||
        target.name === "gridWidth" ||
        target.name === "gridHeight"
      ) {
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
