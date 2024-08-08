import MemoryEditorElement from "../elements/memory-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class MemoryEditorWindow extends Fenster<MemoryEditorElement> {
  constructor({
    style,
    globalState,
    globalState: { resourceManager },
  }: WindowConstructor) {
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

      icon.name = "export";
      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "import";
      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      style,
      buttonsRight,
      globalState,
    });

    const resourceSubscriber = resourceManager.getSubscriber();

    this.onClose(() => resourceSubscriber.unsubscribeAll());

    resourceSubscriber.subscribe("ram", (ram) => {
      body.ram = ram;
    });
    resourceSubscriber.subscribe("symbols", (symbols) => {
      body.symbols = symbols;
    });
  }
}
