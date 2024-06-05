import Fenster from "../modules/fenster.js";

export default class StateEditor extends Fenster {
  constructor({ style }) {
    const body = document.createElement("state-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "State";
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
