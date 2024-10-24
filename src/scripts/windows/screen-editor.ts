import { WindowConstructor } from "../types/windows.js";
import ScreenEditorElement from "../elements/screen-editor.js";
import Fenster from "../fenster.js";
import CharMap from "../resources/charmap.js";

export default class ScreenEditorWindow extends Fenster<ScreenEditorElement> {
  constructor(windowProps: WindowConstructor) {
    const {
      globalState: { eventManager, configManager, resourceManager },
    } = windowProps;

    const body = document.createElement("screen-editor");
    const title = document.createDocumentFragment();

    {
      const span = document.createElement("span");
      span.innerText = "Screen & CharMap Editor [WIP]";
      span.classList.add("title");
      title.appendChild(span);
    }

    const buttonsRight = [];

    {
      const icon = document.createElement("svg-icon");
      icon.setIcon("export");

      const button = document.createElement("button");
      button.addEventListener("click", async () => {
        resourceManager
          .get("mainWorker")
          .request("encodeMif8", resourceManager.get("charmap").bytes())
          .then((mif) => {
            const blob = new Blob([mif], {
              type: "application/octet-stream",
            });
            const anchor = Object.assign(document.createElement("a"), {
              download: "charmap.mif",
              href: URL.createObjectURL(blob),
            });
            anchor.click();
            URL.revokeObjectURL(anchor.href);
          });
      });

      button.append(icon, "Export");
      buttonsRight.push(button);
    }

    {
      const icon = document.createElement("svg-icon");
      icon.setIcon("import");

      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".mif";
      input.style.display = "none";
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) {
          return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const fs = resourceManager.get("fs");
          const file = await fs.getFile("internal/charmap.bin");

          const mif = await resourceManager
            .get("mainWorker")
            .request("parseMif", event.target?.result as string);

          const charmap = CharMap.fromBytes(
            mif,
            JSON.parse(
              await (await fs.getFile("internal/palette/8bit.json")).read(),
            ),
            file,
          );
          resourceManager.set("charmap", charmap);
        };

        reader.readAsText(file);
      });

      const button = document.createElement("button");
      button.addEventListener("click", () => {
        input.click();
      });

      button.append(icon, "Import");
      buttonsRight.push(button);
    }

    const [width, height] = configManager.getMany(
      "screenWidth",
      "screenHeight",
    );

    body.setWidth(width!);
    body.setHeight(height!);
    body.setCharmap(resourceManager.get("charmap"));

    super({
      title,
      body,
      buttonsRight,
      ...windowProps,
    });

    const eventSubscriber = eventManager.getSubscriber();
    const configSubscriber = configManager.getSubscriber();
    const resourceSubscriber = resourceManager.getSubscriber();

    this.onClose(() => {
      eventSubscriber.unsubscribeAll();
      configSubscriber.unsubscribeAll();
      resourceSubscriber.unsubscribeAll();
    });

    eventSubscriber.subscribe("render", () => {
      body.render();
    });

    configSubscriber.subscribe("screenWidth", (width: number) => {
      body.setWidth(width);
    });
    configSubscriber.subscribe("screenHeight", (height: number) => {
      body.setHeight(height);
    });

    resourceSubscriber.subscribe("charmap", (charmap) => {
      body.setCharmap(charmap);
    });
  }
}
