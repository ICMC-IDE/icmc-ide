import LogViewerElement from "../elements/log-viewer.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class LogViewerWindow extends Fenster<LogViewerElement> {
  constructor({ style }: WindowProps) {
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
