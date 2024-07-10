import ScreenEditorWindow from "./screen-editor.js";
import MemoryEditorWindow from "./memory-editor.js";
import ScreenViewerWindow from "./screen-viewer.js";
import LogViewerWindow from "./log-viewer.js";
import StateEditorWindow from "./state-editor.js";
import ConfigEditorWindow from "./config-editor.js";
import SourceEditorWindow from "./source-editor.js";
import DocumentationViewerWindow from "./documentation-viewer.js";
import FilePickerWindow from "./file-picker.js";
import { ConfigField } from "../config.js";
import { EventEmitter } from "../events.js";

interface Windows {
  state: StateEditorWindow;
  memory: MemoryEditorWindow;
  screen: ScreenViewerWindow;
  log: LogViewerWindow;
  charmap: ScreenEditorWindow;
  config: ConfigEditorWindow;
  documentation: DocumentationViewerWindow;
  files: FilePickerWindow;
}

export function createWindows(
  config: Record<string, ConfigField<unknown>>,
  events: Record<string, EventEmitter<unknown>>,
) {
  const result: Windows = {} as Windows;

  result.state = new StateEditorWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: "0.5rem",
    },
    config,
    events,
  });

  const stateBounds = result.state.getClientRect();

  result.memory = new MemoryEditorWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${stateBounds.bottom}px + 0.5rem)`,
      height: "20rem",
    },
    config,
    events,
  });

  const memoryBounds = result.memory.getClientRect();

  result.screen = new ScreenViewerWindow({
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
      // filter: "url(/#crt)",
    },
    config,
    events,
  });

  result.log = new LogViewerWindow({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${memoryBounds.bottom}px + 0.5rem)`,
    },
    config,
    events,
  });

  result.charmap = new ScreenEditorWindow({
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.config = new ConfigEditorWindow({
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.documentation = new DocumentationViewerWindow({
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.files = new FilePickerWindow({
    style: {
      left: `0.5rem`,
      top: "0.5rem",
      width: "30ch",
      height: "480px",
    },
    config,
    events,
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
