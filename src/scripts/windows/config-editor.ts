import ConfigEditorElement from "../elements/config-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class ConfigEditorWindow extends Fenster<ConfigEditorElement> {
  constructor({ style, globalState: { configManager } }: WindowConstructor) {
    const body = document.createElement("config-editor");
    const title = document.createElement("span");

    {
      title.innerText = "Config";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-config", ({ detail: { name, value } }) => {
        configManager.set(name, value);
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
