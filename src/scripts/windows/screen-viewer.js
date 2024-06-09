import Fenster from "../fenster.js";

export default class ScreenViewer extends Fenster {
  constructor({ style }, config) {
    const body = document.createElement("screen-viewer");
    const title = document.createElement("span");
    const buttonsLeft = [];

    {
      title.innerText = "Screen";
      title.classList.add("title");
    }

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

    super({
      title,
      body,
      style,
      buttonsLeft,
    });

    config.screenWidth.subscribe((width) => {
      body.width = width;
    });

    config.screenHeight.subscribe((height) => {
      body.height = height;
    });
  }
}
