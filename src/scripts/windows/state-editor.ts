import StateEditorElement from "../elements/state-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class StateEditorWindow extends Fenster<StateEditorElement> {
  constructor({
    style,
    globalState: { configManager, eventManager, resources },
  }: WindowConstructor) {
    const body = document.createElement("state-editor");
    const title = document.createElement("span");

    {
      title.innerText = "State";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-frequency", ({ detail: frequency }) => {
        configManager.set("frequency", frequency);
      });

      body.addEventListener("change-file", ({ detail: fileName }) => {
        configManager.set("entry-file", fileName);
      });

      body.addEventListener("build", () => {
        const fs = resources.get("fs");
        const files = fs.all();
        const [entry, syntax] = configManager.getMany("entry-file", "syntax");

        resources
          .get("main-worker")
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
              asm,
              mif,
            }) => {
              const fs = resources.get("fs");

              resources.set("ram", ram);
              resources.set("vram", vram);
              resources.set("registers", registers);
              resources.set("internal-registers", internalRegisters);
              resources.set("symbols", symbols);

              fs.write(entry!.replace(/\.[^.]+$/, ".mif"), mif);

              if (asm) {
                fs.write(entry!.replace(/\.[^.]+$/, ".asm"), asm);
              }
            },
          )
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("play", () => {
        resources
          .get("main-worker")
          .request("play", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("stop", () => {
        resources
          .get("main-worker")
          .request("stop", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("next", () => {
        resources
          .get("main-worker")
          .request("next", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.addEventListener("reset", () => {
        resources
          .get("main-worker")
          .request("reset", undefined)
          .then(() => {})
          .catch((error) => {
            eventManager.emmit("error", error);
          })
          .finally(() => {});
      });

      body.files = resources
        .get("fs")
        .files()
        .filter((filename) => /\.(asm|c)$/i.test(filename));
    }

    super({
      title,
      body,
      style,
    });

    const eventSubscriber = eventManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();
    const resourcesSubscriber = resources.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
      configSubscriber.unsubscribeAll();
      resourcesSubscriber.unsubscribeAll();
    });

    eventSubscriber.subscribe("render", () => {
      body.render();
    });

    configSubscriber.subscribe("frequency", (frequency: number) => {
      body.frequency = frequency;
    });
    configSubscriber.subscribe("entry-file", (fileName: string) => {
      body.entryFile = fileName;
    });

    resourcesSubscriber.subscribe("fs", (fs) => {
      const fsSubscriber = fs.getSubscriber();
      this.onClose(fsSubscriber.unsubscribeAll);

      fsSubscriber.subscribe("create", () => {
        body.files = resources
          .get("fs")
          .files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });
      fsSubscriber.subscribe("delete", () => {
        body.files = resources
          .get("fs")
          .files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });
    });
    resourcesSubscriber.subscribe("registers", (registers) => {
      body.registers = registers;
    });
    resourcesSubscriber.subscribe("internal-registers", (registers) => {
      body.internalRegisters = registers;
    });
  }
}
