import Fenster from "../modules/fenster.js";

export default class ConfigEditor extends Fenster {
  constructor({ style }) {
    const body = document.createElement("config-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Config";
      span.classList.add("title");
      title.appendChild(span);
    }

    super({
      title,
      body,
      style,
    });

    this.toggleMinimize();
  }
}
