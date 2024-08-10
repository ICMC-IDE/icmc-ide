import DocumentationViewerElement from "../elements/documentation-viewer.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class DocumentationViewerWindow extends Fenster<DocumentationViewerElement> {
  constructor({
    style,
    globalState,
    globalState: { configManager },
  }: WindowConstructor) {
    const title = document.createDocumentFragment();
    const body = document.createElement("documentation-viewer");

    {
      const span = document.createElement("span");
      span.innerText = "Documentation";
      span.classList.add("title");
      title.appendChild(span);
    }

    body.syntax = configManager.get("syntax")!;

    super({
      title,
      body,
      style,
      globalState,
    });

    this.toggleMinimize();

    const configSubscriber = configManager.getSubscriber();

    this.onClose(() => configSubscriber.unsubscribeAll());

    configManager.subscribe("syntax", (value: string) => {
      body.syntax = value;
    });
  }
}
