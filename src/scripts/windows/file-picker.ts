import FilePickerElement from "../elements/file-picker.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class StateEditorWindow extends Fenster<FilePickerElement> {
  constructor({ style, globalState: { eventManager } }: WindowConstructor) {
    const body = document.createElement("file-picker");
    const title = document.createElement("span");

    {
      title.innerText = "Files";
      title.classList.add("title");
    }

    body.addEventListener("open-file", ({ detail: fileName }) => {
      eventManager.emmit("openFile", fileName);
    });

    body.addEventListener("delete-file", ({ detail: fileName }) => {
      eventManager.emmit("deleteFile", fileName);
    });

    super({
      title,
      body,
      style,
    });

    // body.files = .filesystem.get().files();
    /*
    config.files.subscribe((files) => {
      body.files = Object.keys(files);
    });
    */
  }
}
