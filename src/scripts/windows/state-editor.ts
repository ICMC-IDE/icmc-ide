import StateEditorElement from "../elements/state-editor.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class StateEditorWindow extends Fenster<StateEditorElement> {
  constructor({ style, config, events }: WindowProps) {
    const body = document.createElement("state-editor");
    const title = document.createElement("span");

    {
      title.innerText = "State";
      title.classList.add("title");
    }

    {
      body.addEventListener("change-frequency", ({ detail: frequency }) => {
        config.frequency.set(frequency);
      });

      body.addEventListener("change-file", ({ detail: fileName }) => {
        config.entryFile.set(fileName);
      });
    }

    super({
      title,
      body,
      style,
    });

    config.frequency.subscribe((frequency) => {
      body.frequency = frequency;
    });

    config.files.subscribe((files) => {
      body.files = Object.keys(files);
    });

    config.entryFile.subscribe((fileName) => {
      body.entryFile = fileName;
    });

    events.refresh.subscribe(({ registers, internalRegisters }) => {
      console.log(registers, internalRegisters);
      if (registers) {
        this.body.registers = registers;
      }

      if (internalRegisters) {
        this.body.internalRegisters = internalRegisters;
      }
    });

    events.render.subscribe(() => {
      this.body.render();
    });
  }
}
