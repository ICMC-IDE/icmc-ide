import Fenster from "../fenster.js";

export default class ConfigEditor extends Fenster {
  constructor({ style }, config) {
    const body = document.createElement("config-editor");
    const title = document.createElement("span");

    {
      title.innerText = "Config";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-config", ({ detail: { name, value } }) => {
        config[name].set(value);
      });
    }

    super({
      title,
      body,
      style,
    });

    this.toggleMinimize();
  }
}
