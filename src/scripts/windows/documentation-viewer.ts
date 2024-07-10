import DocumentationViewerElement from "../elements/documentation-viewer.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class DocumentationViewer extends Fenster<DocumentationViewerElement> {
  constructor({ style, config }: WindowProps) {
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
