import ConfigEditorElement from "./config-editor";
import DocumentationViewerElement from "./documentation-viewer";
import FilePickerElement from "./file-picker";
import LogViewerElement from "./log-viewer";
import MemoryEditorElement from "./memory-editor";
import ScreenEditorElement from "./screen-editor";
import ScreenViewerElement from "./screen-viewer";
import StateEditorElement from "./state-editor";
import TextEditorElement from "./text-editor";

declare global {
  interface HTMLElementTagNameMap {
    "config-editor": ConfigEditorElement;
    "documentation-viewer": DocumentationViewerElement;
    "file-picker": FilePickerElement;
    "log-viewer": LogViewerElement;
    "memory-editor": MemoryEditorElement;
    "screen-editor": ScreenEditorElement;
    "screen-viewer": ScreenViewerElement;
    "state-editor": StateEditorElement;
    "text-editor": TextEditorElement;
  }
}
