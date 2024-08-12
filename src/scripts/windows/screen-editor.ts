import { WindowConstructor } from "../types/windows.js";
import ScreenEditorElement from "../elements/screen-editor.js";
import Fenster from "../fenster.js";

export default class ScreenEditorWindow extends Fenster<ScreenEditorElement> {
  constructor({
    style,
    globalState,
    globalState: { configManager, eventManager, resourceManager },
  }: WindowConstructor) {
    const body = document.createElement("screen-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Screen & CharMap Editor [WIP]";
      span.classList.add("title");
      title.appendChild(span);
    }

    const buttonsRight = [];

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "export";
      button.append(icon, "Export CharMap");
      buttonsRight.push(button);
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("svg-icon");

      icon.name = "import";
      button.append(icon, "Import CharMap");
      buttonsRight.push(button);
    }

    const [width, height] = configManager.getMany(
      "screenWidth",
      "screenHeight",
    );

    body.width = width!;
    body.height = height!;
    body.charmap = resourceManager.get("charmap");

    super({
      title,
      body,
      style,
      buttonsRight,
      globalState,
    });

    const eventSubscriber = eventManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();
    const resourceSubscriber = resourceManager.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
      configSubscriber.unsubscribeAll();
      resourceSubscriber.unsubscribeAll();
    });

    eventManager.subscribe("render", () => {
      body.render();
    });

    configManager.subscribe("screenWidth", (width: number) => {
      body.width = width;
    });
    configManager.subscribe("screenHeight", (height: number) => {
      body.height = height;
    });

    resourceManager.subscribe("charmap", (charmap) => {
      body.charmap = charmap;
    });
  }
}
