export default class DocumentationViewerElement extends HTMLElement {
  constructor() {
    super();
  }

  setSyntax(value: string) {
    const documentationGirotoTemplate = document.getElementById(
      "documentationGirotoTemplate",
    ) as HTMLTemplateElement;
    const documentationIcmcTemplate = document.getElementById(
      "documentationIcmcTemplate",
    ) as HTMLTemplateElement;

    switch (value) {
      case "giroto":
        this.replaceChildren(
          documentationGirotoTemplate.content.cloneNode(true),
        );
        break;
      case "icmc":
        this.replaceChildren(documentationIcmcTemplate.content.cloneNode(true));
        break;
    }
  }
}

customElements.define("documentation-viewer", DocumentationViewerElement);

declare global {
  interface HTMLElementTagNameMap {
    "documentation-viewer": DocumentationViewerElement;
  }
}
