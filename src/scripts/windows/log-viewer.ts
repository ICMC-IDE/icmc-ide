import LogViewerElement from "../elements/log-viewer.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class LogViewerWindow extends Fenster<LogViewerElement> {
  constructor({ style }: WindowConstructor) {
    const body = document.createElement("log-viewer");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Log";
      span.classList.add("title");
      title.appendChild(span);
    }

    super({
      title,
      body,
      style,
    });
  }
}
