import { screenWidth, screenHeight } from "../config.js";
import Fenster from "../modules/fenster.js";

export default class ScreenViewer extends Fenster {
  constructor({ style }) {
    const body = document.createElement("screen-viewer");
    const title = document.createDocumentFragment();

    const buttonsLeft = [];

    {
      const button = document.createElement("button");
      const icon = document.createElement("img");

      icon.src = "images/toggle-full-screen.png";
      button.append(icon);
      button.addEventListener("click", () => {
        body.requestFullscreen().catch((error) => {
          console.error(error);
        });
      });

      buttonsLeft.push(button);
    }

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
      buttonsLeft,
    });
  }
}
