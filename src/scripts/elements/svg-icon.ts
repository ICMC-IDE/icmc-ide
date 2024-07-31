const cachedIcons: Record<string, XMLDocument> = {};
const domParser = new DOMParser();

export default class SvgIconElement extends HTMLElement {
  constructor() {
    super();

    const name = this.getAttribute("name");
    if (name !== null) {
      this.setIcon(name);
    }
  }

  async setIcon(name: string) {
    const svg = cachedIcons[name] ?? (await this.fetchIcon(name));
    const node = svg.documentElement.cloneNode(true);

    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }

    this.appendChild(node);
  }

  async fetchIcon(name: string) {
    const response = await fetch(`./images/${name}.svg`);

    return domParser.parseFromString(await response.text(), "image/svg+xml");
  }

  set name(name: string) {
    this.setIcon(name);
  }
}

customElements.define("svg-icon", SvgIconElement);

declare global {
  interface HTMLElementTagNameMap {
    "svg-icon": SvgIconElement;
  }
}
