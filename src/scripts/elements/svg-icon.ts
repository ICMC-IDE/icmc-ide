const TEMPLATE = document.getElementById(
  "svgIconTemplate",
) as HTMLTemplateElement;

export default class SvgIconElement extends HTMLElement {
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;

  constructor() {
    super();

    const name = this.getAttribute("name");
    if (name !== null) {
      this.setIcon(name);
    }
  }

  connectedCallback() {
    this.appendChild(this.#fragment);
  }

  setIcon(name: string) {
    (this.#fragment.querySelector("use") ??
      this.querySelector("use"))!.setAttributeNS(
      null,
      "href",
      `./images/icons.svg#${name}`,
    );
  }
}

customElements.define("svg-icon", SvgIconElement);

declare global {
  interface HTMLElementTagNameMap {
    "svg-icon": SvgIconElement;
  }
}
