export default class DocumentationViewerElement extends HTMLElement {
  constructor() {
    super();
  }

  disconnectedCallback() {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }
  }

  set syntax(value: string) {
    while (this.lastElementChild) {
      this.lastElementChild.remove();
    }

    const documentationGirotoTemplate = document.getElementById(
      "documentationGirotoTemplate",
    ) as HTMLTemplateElement;
    const documentationIcmcTemplate = document.getElementById(
      "documentationIcmcTemplate",
    ) as HTMLTemplateElement;

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

customElements.define("documentation-viewer", DocumentationViewerElement);
