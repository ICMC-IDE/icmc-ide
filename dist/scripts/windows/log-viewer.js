import Fenster from "../modules/fenster.js";

export default class LogViewer extends Fenster {
  constructor({ style }) {
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
