import StateEditorElement from "../elements/state-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class StateEditorWindow extends Fenster<StateEditorElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { eventManager, resourceManager, configManager },
    } = windowProps;

    const body = document.createElement("state-editor");
    const title = document.createElement("span");

    {
      title.innerText = "State";
      title.classList.add("title");
    }

    {
      body.addEventListener("changeFrequency", ({ detail: frequency }) => {
        configManager.set("frequency", frequency);
      });

      body.addEventListener("play", () => {
        resourceManager
          .get("mainWorker")
          .request("play", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("stop", () => {
        resourceManager
          .get("mainWorker")
          .request("stop", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("next", () => {
        resourceManager
          .get("mainWorker")
          .request("next", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("reset", () => {
        resourceManager
          .get("mainWorker")
          .request("reset", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      // body.setFiles(
      //   resourceManager
      //     .get("fs")
      //     .user.files()
      //     .filter((filename) => /\.(asm|c)$/i.test(filename)),
      // );
    }

    super({
      title,
      body,
      ...windowProps,
    });

    const eventSubscriber = eventManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();
    const resourceSubscriber = resourceManager.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
      configSubscriber.unsubscribeAll();
      resourceSubscriber.unsubscribeAll();
    });

    eventSubscriber.subscribe("render", () => {
      body.render();
    });

    configSubscriber.subscribe("frequency", (frequency: number) => {
      body.setFrequency(frequency);
    });

    // resourceSubscriber.subscribe("fs", (fs) => {
    //   const fsSubscriber = fs.user.getSubscriber();
    //   this.onClose(fsSubscriber.unsubscribeAll);

    //   fsSubscriber.subscribe("create", () => {
    //     body.setFiles(
    //       resourceManager
    //         .get("fs")
    //         .user.files()
    //         .filter((filename) => /\.(asm|c)$/i.test(filename)),
    //     );
    //   });
    //   fsSubscriber.subscribe("delete", () => {
    //     body.setFiles(
    //       resourceManager
    //         .get("fs")
    //         .user.files()
    //         .filter((filename) => /\.(asm|c)$/i.test(filename)),
    //     );
    //   });
    // });
    resourceSubscriber.subscribe("registers", (registers) => {
      body.registers = registers;
    });
    resourceSubscriber.subscribe("internalRegisters", (registers) => {
      body.internalRegisters = registers;
    });
  }
}
