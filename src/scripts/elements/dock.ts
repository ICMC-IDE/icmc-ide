import { WindowTypes } from "../windows/mod";

interface WindowOpenEvent {
  detail: WindowTypes;
}

const TEMPLATE = document.getElementById("dockTemplate") as HTMLTemplateElement;

export default class DockElement extends HTMLElement {
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;

  constructor() {
    super();

    const fragment = this.#fragment;

    fragment.querySelectorAll("button[data-window]").forEach((element) => {
      element.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("windowOpen", {
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
    windowOpen: WindowOpenEvent;
  }
}
