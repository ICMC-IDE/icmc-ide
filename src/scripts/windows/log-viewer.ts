import LogViewerElement from "../elements/log-viewer.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows";

export default class LogViewerWindow extends Fenster<LogViewerElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { eventManager, resourceManager },
    } = windowProps;

    const body = document.createElement("log-viewer");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Log";
      span.classList.add("title");
      title.appendChild(span);
    }

    super({
      title,
      body,
      ...windowProps,
    });

    const cachedLog = resourceManager.get("cachedLog");

    if (cachedLog) {
      body.write(cachedLog);
    }

    const eventSubscriber = eventManager.getSubscriber();
    this.onClose(() => eventSubscriber.unsubscribeAll());

    eventSubscriber.subscribe("build", () => {
      body.clear();
    });
    eventSubscriber.subscribe("error", (error) => {
      body.write(error);
    });
  }
}
