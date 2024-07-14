import StateEditorElement from "../elements/state-editor.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class StateEditorWindow extends Fenster<StateEditorElement> {
  constructor({
    style,
    globalState: { configManager, eventManager },
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
        configManager.set("entryFile", fileName);
      });
    }

    super({
      title,
      body,
      style,
    });

    configManager.subscribe("frequency", (frequency) => {
      body.frequency = frequency!;
    });

    // configManager.subscribe("filesystem", (fs) => {
    //   console.log(fs);
    //   body.files = Object.keys(fs.files());
    // });

    configManager.subscribe("entryFile", (fileName) => {
      body.entryFile = fileName!;
    });

    eventManager.subscribe("refresh", ({ registers, internalRegisters }) => {
      console.log(registers, internalRegisters);
      if (registers) {
        this.body.registers = registers;
      }

      if (internalRegisters) {
        this.body.internalRegisters = internalRegisters;
      }
    });

    eventManager.subscribe("render", () => {
      this.body.render();
    });
  }
}
