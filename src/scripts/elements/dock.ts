import { WindowTypes } from "windows/mod";

interface OpenWindowEvent {
  detail: WindowTypes;
}

export default class DockElement extends HTMLElement {
  #fragment: DocumentFragment;

  constructor() {
    super();

    const template = document.getElementById(
      "dockTemplate",
    ) as HTMLTemplateElement;

    const fragment = (this.#fragment = template.content.cloneNode(
      true,
    ) as DocumentFragment);

    fragment.querySelectorAll("button[data-window]").forEach((element) => {
      element.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("open-window", {
            detail: (element as HTMLElement).dataset.window,
          }),
        );
      });
    });
  }

  connectedCallback() {
    this.appendChild(this.#fragment);
  }
}

customElements.define("apps-dock", DockElement);

declare global {
  interface HTMLElementTagNameMap {
    "apps-dock": DockElement;
  }

  interface HTMLElementEventMap {
    "open-window": OpenWindowEvent;
  }
}
