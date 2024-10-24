import { GlobalConfigsMap } from "../state/global.js";
import ConfigEditorElement from "../elements/config-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class ConfigEditorWindow extends Fenster<ConfigEditorElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { configManager },
    } = windowProps;

    const body = document.createElement("config-editor");
    const title = document.createElement("span");

    {
      title.innerText = "Config";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-config", ({ detail: { name, value } }) => {
        configManager.set(name as keyof GlobalConfigsMap, value);
      });
    }

    super({
      title,
      body,
      ...windowProps,
    });
  }
}
