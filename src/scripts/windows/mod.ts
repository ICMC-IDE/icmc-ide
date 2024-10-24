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

export interface WindowsMap {
  stateEditor: StateEditorWindow;
  memoryEditor: MemoryEditorWindow;
  screenViewer: ScreenViewerWindow;
  screenEditor: ScreenEditorWindow;
  logViewer: LogViewerWindow;
  configEditor: ConfigEditorWindow;
  documentationViewer: DocumentationViewerWindow;
  filePicker: FilePickerWindow;
}

type Builders = {
  [name in keyof WindowsMap]: new (
    state: WindowConstructor,
  ) => WindowsMap[name];
};

const builders: Builders = {
  stateEditor: StateEditorWindow,
  memoryEditor: MemoryEditorWindow,
  screenViewer: ScreenViewerWindow,
  screenEditor: ScreenEditorWindow,
  logViewer: LogViewerWindow,
  configEditor: ConfigEditorWindow,
  documentationViewer: DocumentationViewerWindow,
  filePicker: FilePickerWindow,
};

export type WindowTypes = keyof typeof builders;

export function openWindow<K extends WindowTypes>(
  type: K,
  constructor: WindowConstructor,
): WindowsMap[K] {
  return new builders[type](constructor);
}

export function createWindows(globalState: GlobalState) {
  const result: Partial<WindowsMap> = {};

  result["stateEditor"] = new StateEditorWindow({
    position: { x: 0, y: 0 },
    size: { width: 40, height: 30 },
    globalState,
  });

  // const stateBounds = result["stateEditor"].getClientRect();

  result["memoryEditor"] = new MemoryEditorWindow({
    name: "memoryEditor",
    position: { x: 40, y: 0 },
    size: { width: 40, height: 30 },
    globalState,
  });

  // const memoryBounds = result["memoryEditor"].getClientRect();

  result["screenViewer"] = new ScreenViewerWindow({
    name: "screenViewer",
    position: { x: 0, y: 0 },
    size: { width: 640, height: 480 },
    globalState,
  });

  result["logViewer"] = new LogViewerWindow({
    name: "logViewer",
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    globalState,
  });

  result["filePicker"] = new FilePickerWindow({
    name: "filePicker",
    position: { x: 0, y: 0 },
    size: { width: 160, height: 480 },
    globalState,
  });

  return result;
}

export {
  ScreenEditorWindow,
  MemoryEditorWindow,
  ScreenViewerWindow,
  LogViewerWindow,
  StateEditorWindow,
  ConfigEditorWindow,
  SourceEditorWindow,
  DocumentationViewerWindow,
  FilePickerWindow,
};
