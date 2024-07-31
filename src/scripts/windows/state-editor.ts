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

        resources
          .get("main-worker")
          .request("build", {
            files: fs.all(),
            entry: configManager.get("entry-file"),
            syntax: configManager.get("syntax"),
          })
          .then(() => {})
          .catch(() => {})
          .finally(() => {});
      });

      body.addEventListener("play", () => {
        //
      });

      body.addEventListener("stop", () => {
        //
      });

      body.addEventListener("next", () => {
        //
      });

      body.addEventListener("reset", () => {
        //
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

    configManager.subscribe("frequency", (frequency: number) => {
      body.frequency = frequency;
    });

    configManager.subscribe("entry-file", (fileName: string) => {
      body.entryFile = fileName;
    });

    eventManager.subscribe("render", () => {
      body.render();
    });

    resources.subscribe("fs", (fs) => {
      fs.subscribe("create", () => {
        body.files = resources
          .get("fs")
          .files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });

      fs.subscribe("delete", () => {
        body.files = resources
          .get("fs")
          .files()
          .filter((filename) => /\.(asm|c)$/i.test(filename));
      });
    });

    resources.subscribe("registers", (registers) => {
      body.registers = registers;
    });

    resources.subscribe("internalRegisters", (registers) => {
      body.internalRegisters = registers;
    });
  }
}
