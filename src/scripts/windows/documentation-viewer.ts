import DocumentationViewerElement from "../elements/documentation-viewer.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class DocumentationViewerWindow extends Fenster<DocumentationViewerElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { configManager },
    } = windowProps;

    const title = document.createDocumentFragment();
    const body = document.createElement("documentation-viewer");

    {
      const span = document.createElement("span");
      span.innerText = "Documentation";
      span.classList.add("title");
      title.appendChild(span);
    }

    body.setSyntax(configManager.get("syntax")!);

    super({
      title,
      body,
      ...windowProps,
    });

    const configSubscriber = configManager.getSubscriber();

    this.onClose(() => configSubscriber.unsubscribeAll());

    configSubscriber.subscribe("syntax", (value: string) => {
      body.setSyntax(value);
    });
  }
}
