import { GlobalConfigsMap } from "../state/global.js";
import ConfigEditorElement from "../elements/config-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class ConfigEditorWindow extends Fenster<ConfigEditorElement> {
  constructor({ style, globalState }: WindowConstructor) {
    const body = document.createElement("config-editor");
    const title = document.createElement("span");

    {
      title.innerText = "Config";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-config", ({ detail: { name, value } }) => {
        console.log(name, value);
        globalState.configManager.set(name as keyof GlobalConfigsMap, value);
        console.log(
          globalState.configManager.get(name as keyof GlobalConfigsMap),
        );
      });
    }

    super({
      title,
      body,
      style,
      globalState,
    });

    this.toggleMinimize();
  }
}
