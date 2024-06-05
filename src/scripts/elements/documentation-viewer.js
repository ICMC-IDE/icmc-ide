export default class DocumentationViewer extends HTMLElement {
  constructor() {
    super();
  }

  disconnectedCallback() {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }

  set syntax(value) {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }

    switch (value) {
      case "giroto":
        this.appendChild(documentationGirotoTemplate.content.cloneNode(true));
        break;

      case "icmc":
        this.appendChild(documentationIcmcTemplate.content.cloneNode(true));
        break;
    }

  }
}

customElements.define("documentation-viewer", DocumentationViewer);
