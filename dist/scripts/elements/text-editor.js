import { language, sourceCode } from "../config.js";

export default class TextEditor extends HTMLElement {
  #editor;
  #observer;

  constructor() {
    super();

    this.#editor = monaco.editor.create(this, {
      language: language.get(),
      theme: "vs-dark",
      fontFamily: "ui-monospace",
      // fontSize: 16
    });

    language.subscribe((value) => {
      monaco.editor.setModelLanguage(this.#editor.getModel(), value);
      this.#editor.setValue(sourceCode.get()[value]);
    });

    this.#observer = new ResizeObserver(() => {
      this.#editor.layout();
    });

    this.#observer.observe(this);
  }

  set value(code) {
    this.#editor.setValue(code);
  }

  get value() {
    return this.#editor.getValue();    
  }
}

await new Promise((resolve) => {
  require.config({
    paths: {
      vs: "scripts/modules/monaco-editor/min/vs"
    }
  });

  require(["vs/editor/editor.main"], function() {
    resolve();
  });
});

customElements.define("text-editor", TextEditor);
