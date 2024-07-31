import FilePickerElement from "../elements/file-picker.js";
import Fenster from "../fenster.js";
import { WindowConstructor } from "windows";

export default class StateEditorWindow extends Fenster<FilePickerElement> {
  constructor({
    style,
    globalState: { eventManager, resources },
  }: WindowConstructor) {
    const body = document.createElement("file-picker");
    const title = document.createElement("span");

    {
      title.innerText = "Files";
      title.classList.add("title");
    }

    {
      body.addEventListener("open-file", ({ detail: fileName }) => {
        eventManager.emmit("open-file", fileName);
      });

      body.addEventListener("delete-file", ({ detail: fileName }) => {
        eventManager.emmit("delete-file", fileName);
      });

      // maybe we should pass fs to file-picker intead of updating it through the window?
      body.files = resources.get("fs").files();
    }

    super({
      title,
      body,
      style,
    });

    resources.subscribe("fs", (fs) => {
      body.files = fs.files();

      fs.subscribe("create", () => {
        body.files = fs.files();
      });

      fs.subscribe("delete", () => {
        body.files = fs.files();
      });
    });
  }
}
