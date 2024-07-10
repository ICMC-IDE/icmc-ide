import FilePickerElement from "../elements/file-picker.js";
import Fenster from "../fenster.js";
import { WindowProps } from "./types.js";

export default class StateEditorWindow extends Fenster<FilePickerElement> {
  constructor({ style, config, events }: WindowProps) {
    const body = document.createElement("file-picker");
    const title = document.createElement("span");

    {
      title.innerText = "Files";
      title.classList.add("title");
    }

    body.addEventListener("open-file", ({ detail: fileName }) => {
      events.openFile.emmit(fileName);
    });

    body.addEventListener("delete-file", ({ detail: fileName }) => {
      events.deleteFile.emmit(fileName);
    });

    super({
      title,
      body,
      style,
    });

    config.files.subscribe((files) => {
      body.files = Object.keys(files);
    });
  }
}
