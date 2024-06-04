import { syntax } from "../config.js";
import Fenster from "../modules/fenster.js";

export default class DocumentationViewer extends Fenster {
  constructor({ style }) {
    const title = document.createDocumentFragment();
    const body = document.createElement("documentation-viewer");

    {
      const span = document.createElement("span");
      span.innerText = "Documentation";
      span.classList.add("title");
      title.appendChild(span);
    }

    body.syntax = syntax.get();

    syntax.subscribe((value) => {
      body.syntax = value;
    });

    super({
      title,
      body,
      style,
    });
  }
}
