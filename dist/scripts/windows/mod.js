import ScreenEditor from "./screen-editor.js";
import MemoryEditor from "./memory-editor.js";
import ScreenViewer from "./screen-viewer.js";
import LogViewer from "./log-viewer.js";
import StateEditor from "./state-editor.js";
import ConfigEditor from "./config-editor.js";
import SourceEditor from "./source-editor.js";
import DocumentationViewer from "./documentation-viewer.js";

export const text = new SourceEditor({
  style: {
    left: "0.5rem",
    top: "0.5rem",
    width: "50ch",
    height: "50rem",
  },
});

const textBounds = text.getClientRect();

export const state = new StateEditor({
  style: {
    left: `calc(${textBounds.right}px + 0.5rem)`,
    top: "0.5rem",
  },
});

const stateBounds = state.getClientRect();

export const memory = new MemoryEditor({
  style: {
    left: `calc(${textBounds.right}px + 0.5rem)`,
    top: `calc(${stateBounds.bottom}px + 0.5rem)`,
    height: "20rem",
  },
});

const memoryBounds = memory.getClientRect();

export const screen = new ScreenViewer({
  style: {
    left: `calc(${stateBounds.right}px + 0.5rem)`,
    top: "0.5rem",
    width: "640px",
    height: "480px",
    // filter: "url(/#crt)",
  },
});

export const log = new LogViewer({
  style: {
    left: `calc(${textBounds.right}px + 0.5rem)`,
    top: `calc(${memoryBounds.bottom}px + 0.5rem)`,
  },
});

export const charmap = new ScreenEditor({
  open: false,
  style: {
    left: `calc(${stateBounds.right}px + 0.5rem)`,
    top: "0.5rem",
    width: "640px",
    height: "480px",
  },
});

export const config = new ConfigEditor({
  open: false,
  style: {
    left: `calc(${stateBounds.right}px + 0.5rem)`,
    top: "0.5rem",
    width: "640px",
    height: "480px",
  },
});

export const documentation = new DocumentationViewer({
  open: false,
  style: {
    left: `calc(${stateBounds.right}px + 0.5rem)`,
    top: "0.5rem",
    width: "640px",
    height: "480px",
  },
});

