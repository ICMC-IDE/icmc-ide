import MemoryEditorElement from "../elements/memory-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class MemoryEditorWindow extends Fenster<MemoryEditorElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { resourceManager, configManager },
    } = windowProps;

    const body = document.createElement("memory-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Memory Editor";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("export");
      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.setIcon("import");
      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      buttonsRight,
      ...windowProps,
    });

    body.setRam(resourceManager.get("ram") ?? new Uint16Array());
    body.setSymbols(resourceManager.get("symbols") ?? "");
    body.setNumbersFormat(configManager.get("numbersFormat") ?? 16);

    const resourceSubscriber = resourceManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();

    this.onClose(() => resourceSubscriber.unsubscribeAll());

    resourceSubscriber.subscribe("ram", (ram) => {
      body.setRam(ram);
    });
    resourceSubscriber.subscribe("symbols", (symbols) => {
      body.setSymbols(symbols);
    });

    configSubscriber.subscribe("numbersFormat", (format) => {
      body.setNumbersFormat(format);
    });
  }
}
