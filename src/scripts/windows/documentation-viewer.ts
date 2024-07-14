import DocumentationViewerElement from "../elements/documentation-viewer.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class DocumentationViewerWindow extends Fenster<DocumentationViewerElement> {
  constructor({ style, globalState: { configManager } }: WindowConstructor) {
    const title = document.createDocumentFragment();
    const body = document.createElement("documentation-viewer");

    {
      const span = document.createElement("span");
      span.innerText = "Documentation";
      span.classList.add("title");
      title.appendChild(span);
    }

    body.syntax = configManager.get("syntax")!;

    configManager.subscribe("syntax", (value) => {
      body.syntax = value!;
    });

    super({
      title,
      body,
      style,
    });

    this.toggleMinimize();
  }
}
