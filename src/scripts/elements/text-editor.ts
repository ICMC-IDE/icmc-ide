import * as monaco from "monaco-editor";

monaco.editor.addKeybindingRules([
  {
    command: "editor.action.fontZoomIn",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal,
  },
  {
    command: "editor.action.fontZoomIn",
    keybinding:
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Equal,
  },
  {
    command: "editor.action.fontZoomOut",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus,
  },
  {
    command: "editor.action.fontZoomOut",
    keybinding:
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Minus,
  },
  {
    command: "editor.action.fontZoomReset",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0,
  },
]);

export default class TextEditorElement extends HTMLElement {
  #editor?: monaco.editor.IStandaloneCodeEditor;
  #observer?: ResizeObserver;
  #model?: monaco.editor.ITextModel;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#editor = monaco.editor.create(this, {
      theme: "vs-dark",
      fontFamily: "ui-monospace",
      model: this.#model,
    });

    this.#observer = new ResizeObserver(() => {
      this.#editor!.layout();
    });

    this.#observer.observe(this);
  }

  setModel(model: monaco.editor.ITextModel) {
    if (this.#editor) {
      this.#editor.setModel(model);
    } else {
      this.#model = model;
    }
  }
}

customElements.define("text-editor", TextEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "text-editor": TextEditorElement;
  }
}
