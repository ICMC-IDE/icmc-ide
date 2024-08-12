import StateEditorElement from "../elements/state-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "../types/windows.js";

export default class StateEditorWindow extends Fenster<StateEditorElement> {
  constructor({
    style,
    globalState,
    globalState: { configManager, eventManager, resourceManager },
  }: WindowConstructor) {
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

      body.addEventListener("changeFile", ({ detail: fileName }) => {
        console.log(fileName);
        configManager.set("entryFile", fileName);
      });

      body.addEventListener("build", () => {
        const userFs = resourceManager.get("fs").user;
        const internalFs = resourceManager.get("fs").internal;
        const files = { ...userFs.all(), ...internalFs.all() };
        const [entry, syntax] = configManager.getMany("entryFile", "syntax");

        resourceManager
          .get("mainWorker")
          .request("build", {
            files,
            entry,
            syntax,
          })
          .then(
            ({
              ram,
              vram,
              symbols,
              registers,
              internalRegisters,
              // asm,
              mif,
            }) => {
              const fs = resourceManager.get("fs").internal;

              resourceManager.set("ram", ram);
              resourceManager.set("vram", vram);
              resourceManager.set("registers", registers);
              resourceManager.set("internalRegisters", internalRegisters);
              resourceManager.set("symbols", symbols);

              fs.write(entry!.replace(/\.[^.]+$/, ".mif"), mif);

              // TODO: Write asm to fs
              // if (asm) {
              //   fs.write(entry!.replace(/\.[^.]+$/, ".asm"), asm);
              // }
            },
          )
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
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

      body.files = resourceManager
        .get("fs")
        .user.files()
        .filter((filename) => /\.(asm|c)$/i.test(filename));
    }

    super({
      title,
      body,
      style,
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

    eventSubscriber.subscribe("render", () => {
      body.render();
    });

    configSubscriber.subscribe("frequency", (frequency: number) => {
      body.frequency = frequency;
    });
    configSubscriber.subscribe("entryFile", (fileName: string) => {
      body.entryFile = fileName;
    });

    resourceSubscriber.subscribe("fs", (fs) => {
      const fsSubscriber = fs.user.getSubscriber();
      this.onClose(fsSubscriber.unsubscribeAll);

      fsSubscriber.subscribe("create", () => {
        body.files = resourceManager
          .get("fs")
          .user.files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });
      fsSubscriber.subscribe("delete", () => {
        body.files = resourceManager
          .get("fs")
          .user.files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });
    });
    resourceSubscriber.subscribe("registers", (registers) => {
      body.registers = registers;
    });
    resourceSubscriber.subscribe("internalRegisters", (registers) => {
      body.internalRegisters = registers;
    });
  }
}
