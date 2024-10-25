import ScreenEditorWindow from "./screen-editor.js";
import MemoryEditorWindow from "./memory-editor.js";
import ScreenViewerWindow from "./screen-viewer.js";
import LogViewerWindow from "./log-viewer.js";
import StateEditorWindow from "./state-editor.js";
import ConfigEditorWindow from "./config-editor.js";
import SourceEditorWindow from "./source-editor.js";
import DocumentationViewerWindow from "./documentation-viewer.js";
import FilePickerWindow from "./file-picker.js";
import { GlobalState } from "../state/global.js";
import { WindowConstructor } from "../types/windows";
import ConfigManager from "../state/config.js";

export interface WindowsMap {
  configEditor: ConfigEditorWindow;
  documentationViewer: DocumentationViewerWindow;
  filePicker: FilePickerWindow;
  logViewer: LogViewerWindow;
  memoryEditor: MemoryEditorWindow;
  screenEditor: ScreenEditorWindow;
  screenViewer: ScreenViewerWindow;
  stateEditor: StateEditorWindow;
  sourceEditor: SourceEditorWindow;
}

type WindowsBuilders = {
  [name in keyof WindowsMap]: new (
    props: WindowConstructor,
  ) => WindowsMap[name];
};
const windowsBuilders: WindowsBuilders = {
  configEditor: ConfigEditorWindow,
  documentationViewer: DocumentationViewerWindow,
  filePicker: FilePickerWindow,
  logViewer: LogViewerWindow,
  memoryEditor: MemoryEditorWindow,
  screenEditor: ScreenEditorWindow,
  screenViewer: ScreenViewerWindow,
  stateEditor: StateEditorWindow,
  sourceEditor: SourceEditorWindow,
};

const windowsDefaults: Record<
  keyof WindowsMap,
  Omit<WindowConstructor, "globalState">
> = {
  configEditor: {
    name: "configEditor",
    position: { x: 440, y: 270 },
    size: { width: 280, height: 150 },
  },
  documentationViewer: {
    name: "documentationViewer",
    position: { x: 440, y: 270 },
    size: { width: 580, height: 500 },
  },
  filePicker: {
    name: "filePicker",
    position: { x: 80, y: 10 },
    size: { width: 280, height: 480 },
  },
  logViewer: {
    name: "logViewer",
    position: { x: 720, y: 340 },
    size: { width: 340, height: 570 },
  },
  memoryEditor: {
    name: "memoryEditor",
    position: { x: 1070, y: 520 },
    size: { width: 840, height: 390 },
  },
  screenEditor: {
    name: "screenEditor",
    position: { x: 440, y: 270 },
    size: { width: 640, height: 480 },
  },
  screenViewer: {
    name: "screenViewer",
    position: { x: 1070, y: 10 },
    size: { width: 610, height: 470 },
  },
  stateEditor: {
    name: "stateEditor",
    position: { x: 580, y: 10 },
    size: { width: 485, height: 295 },
  },
  sourceEditor: {
    position: { x: 230, y: 110 },
    size: { width: 520, height: 780 },
  },
};

interface WindowsManagerMap {
  open: (keyof WindowsMap)[];
}
export class WindowsManager {
  #manager: ConfigManager<WindowsManagerMap>;
  #openWindows: Partial<WindowsMap> = {};
  #openSavedWindows: Partial<WindowsMap> = {};
  #globalState: GlobalState;

  constructor(globalState: GlobalState) {
    this.#globalState = globalState;
    this.#manager = new ConfigManager<WindowsManagerMap>("windows");
    this.#manager.loadAll();
  }

  open<K extends keyof WindowsMap>(
    windowName: K,
    props: Partial<Omit<WindowConstructor, "globalState">> = {},
  ) {
    if (this.#openWindows[windowName]) {
      const window = this.#openWindows[windowName]!;
      window.focus();
      return window;
    }

    const window = new windowsBuilders[windowName]({
      globalState: this.#globalState,
      ...{ ...windowsDefaults[windowName], ...props },
    });

    this.#openWindows[windowName] = window;

    if (props.name || windowsDefaults[windowName].name) {
      window.onClose(() => {
        delete this.#openWindows[windowName];
        delete this.#openSavedWindows[windowName];
        this.#manager.set(
          "open",
          Object.keys(this.#openSavedWindows) as (keyof WindowsMap)[],
        );
      });
      this.#openSavedWindows[windowName] = window;
      this.#manager.set(
        "open",
        Object.keys(this.#openSavedWindows) as (keyof WindowsMap)[],
      );
    } else {
      window.onClose(() => {
        delete this.#openWindows[windowName];
      });
    }

    return window;
  }

  openSaved() {
    const savedWindows = this.#manager.get("open") ?? [
      "filePicker",
      "logViewer",
      "memoryEditor",
      "screenViewer",
      "stateEditor",
    ];

    for (const window of savedWindows) {
      this.open(window);
    }
  }
}
