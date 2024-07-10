import ConfigEditorElement from "../elements/config-editor.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class ConfigEditor extends Fenster<ConfigEditorElement> {
  constructor({ style, config }: WindowProps) {
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
