import Fenster from "../fenster.js";

export default class MemoryEditor extends Fenster {
  constructor({ style }, _config, events) {
    const body = document.createElement("memory-editor");
    const title = document.createElement("span");
    const buttonsRight = [];

    {
      title.innerText = "Memory Editor";
      title.classList.add("title");
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/export.png";
      button.append(icon, "Export");
      buttonsRight.push(button)
    }

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/import.png";
      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    super({
      title,
      body,
      style,
      buttonsRight,
    });

    events.refresh.subscribe(({ ram, symbols }) => {
      if (ram) {
        body.load(ram, symbols);
      }
    });
  }
}
