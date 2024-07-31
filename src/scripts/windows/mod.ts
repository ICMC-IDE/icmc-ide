import ScreenEditorWindow from "./screen-editor.js";
import MemoryEditorWindow from "./memory-editor.js";
import ScreenViewerWindow from "./screen-viewer.js";
import LogViewerWindow from "./log-viewer.js";
import StateEditorWindow from "./state-editor.js";
import ConfigEditorWindow from "./config-editor.js";
import SourceEditorWindow from "./source-editor.js";
import DocumentationViewerWindow from "./documentation-viewer.js";
import FilePickerWindow from "./file-picker.js";
import { GlobalState } from "state/global.js";
import { WindowConstructor } from "windows";

interface Windows {
  "state-editor": StateEditorWindow;
  "memory-editor": MemoryEditorWindow;
  "screen-viewer": ScreenViewerWindow;
  "screen-editor": ScreenEditorWindow;
  "log-viewer": LogViewerWindow;
  "config-editor": ConfigEditorWindow;
  "documentation-viewer": DocumentationViewerWindow;
  "file-picker": FilePickerWindow;
}

type Builders = {
  [name in keyof Windows]: new (state: WindowConstructor) => Windows[name];
};

const builders: Builders = {
  "state-editor": StateEditorWindow,
  "memory-editor": MemoryEditorWindow,
  "screen-viewer": ScreenViewerWindow,
  "screen-editor": ScreenEditorWindow,
  "log-viewer": LogViewerWindow,
  "config-editor": ConfigEditorWindow,
  "documentation-viewer": DocumentationViewerWindow,
  "file-picker": FilePickerWindow,
};

export type WindowTypes = keyof typeof builders;

export function openWindow<K extends WindowTypes>(
  type: K,
  constructor: WindowConstructor,
): Windows[K] {
  return new builders[type](constructor);
}

export function createWindows(globalState: GlobalState) {
  const result: Partial<Windows> = {};

  result["state-editor"] = new StateEditorWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: "0.5rem",
    },
    globalState,
  });

  const stateBounds = result["state-editor"].getClientRect();

  result["memory-editor"] = new MemoryEditorWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${stateBounds.bottom}px + 0.5rem)`,
      height: "20rem",
    },
    globalState,
  });

  const memoryBounds = result["memory-editor"].getClientRect();

  result["screen-viewer"] = new ScreenViewerWindow({
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
      // filter: "url(/#crt)",
    },
    globalState,
  });

  result["log-viewer"] = new LogViewerWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${memoryBounds.bottom}px + 0.5rem)`,
    },
    globalState,
  });

  result["file-picker"] = new FilePickerWindow({
    style: {
      left: `0.5rem`,
      top: "0.5rem",
      width: "30ch",
      height: "480px",
    },
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
