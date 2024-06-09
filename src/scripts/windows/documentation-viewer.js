import Fenster from "../fenster.js";

export default class DocumentationViewer extends Fenster {
  constructor({ style }, config) {
    const title = document.createDocumentFragment();
    const body = document.createElement("documentation-viewer");

    {
      const span = document.createElement("span");
      span.innerText = "Documentation";
      span.classList.add("title");
      title.appendChild(span);
    }

    body.syntax = config.syntax.get();

    config.syntax.subscribe((value) => {
      body.syntax = value;
    });

    super({
      title,
      body,
      style,
    });

    this.toggleMinimize();
  }
}
