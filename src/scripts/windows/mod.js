import ScreenEditor from "./screen-editor.js";
import MemoryEditor from "./memory-editor.js";
import ScreenViewer from "./screen-viewer.js";
import LogViewer from "./log-viewer.js";
import StateEditor from "./state-editor.js";
import ConfigEditor from "./config-editor.js";
import SourceEditor from "./source-editor.js";
import DocumentationViewer from "./documentation-viewer.js";
import FilePicker from "./file-picker.js";

export function createWindows(config, events) {
  const result = {};

  result.state = new StateEditor({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: "0.5rem",
    },
    config,
    events,
  });

  const stateBounds = result.state.getClientRect();

  result.memory = new MemoryEditor({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${stateBounds.bottom}px + 0.5rem)`,
      height: "20rem",
    },
    config,
    events,
  });

  const memoryBounds = result.memory.getClientRect();

  result.screen = new ScreenViewer({
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

  result.log = new LogViewer({
    style: {
      left: `calc(50ch + 1rem + 0.5rem)`,
      top: `calc(${memoryBounds.bottom}px + 0.5rem)`,
    },
    config,
    events,
  });

  result.charmap = new ScreenEditor({
    open: false,
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.config = new ConfigEditor({
    open: false,
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.documentation = new DocumentationViewer({
    open: false,
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
    config,
    events,
  });

  result.files = new FilePicker({
    open: true,
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
  ScreenEditor,
  MemoryEditor,
  ScreenViewer,
  LogViewer,
  StateEditor,
  ConfigEditor,
  SourceEditor,
  DocumentationViewer,
  FilePicker,
};
