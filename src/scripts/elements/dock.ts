import { WindowsMap } from "../windows/mod";

interface WindowOpenEvent {
  detail: keyof WindowsMap;
}

const TEMPLATE = document.getElementById("dockTemplate") as HTMLTemplateElement;

export default class DockElement extends HTMLElement {
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;
  #controller?: AbortController;

  connectedCallback() {
    this.#controller = new AbortController();

    this.appendChild(this.#fragment);

    for (const element of this.querySelectorAll("button[data-window]")) {
      element.addEventListener(
        "click",
        () => {
          this.dispatchEvent(
            new CustomEvent("windowOpen", {
              detail: (element as HTMLElement).dataset.window,
            }),
          );
        },
        { signal: this.#controller.signal },
      );
    }
  }

  disconnectedCallback() {
    this.#controller!.abort();
    this.#controller = undefined;
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
