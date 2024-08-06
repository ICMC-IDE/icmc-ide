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

    // maybe we should pass fs to file-picker intead of updating it through the window?
    const fs = resources.get("fs");
    body.files = fs.files();

    body.addEventListener("open-file", ({ detail: filename }) => {
      eventManager.emmit("open-file", filename);
    });
    body.addEventListener("delete-file", ({ detail: filename }) => {
      fs.delete(filename);
    });

    super({
      title,
      body,
      style,
    });

    const fsSubscriber = fs.getSubscriber();

    this.onClose(fsSubscriber.unsubscribeAll);

    fsSubscriber.subscribe("create", () => {
      body.files = fs.files();
    });
    fsSubscriber.subscribe("delete", () => {
      body.files = fs.files();
    });
  }
}
