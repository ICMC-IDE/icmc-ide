import { screenWidth, screenHeight } from "../config.js";
import Fenster from "../modules/fenster.js";

export default class ScreenViewer extends Fenster {
  constructor({ style }) {
    const body = document.createElement("screen-viewer");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Screen";
      span.classList.add("title");
      title.appendChild(span);
    }

    screenWidth.subscribe((value) => {
      body.width = value;
    });

    screenHeight.subscribe((value) => {
      body.height = value;
    });

    super({
      title,
      body,
      style,
    });
  }
}
