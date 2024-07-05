class TextEditorElement extends HTMLElement {
  #editor: monaco.editor.IStandaloneCodeEditor | null = null;
  #observer: ResizeObserver | null = null;
  #model: monaco.editor.ITextModel | null = null;

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

  set model(model: monaco.editor.ITextModel) {
    if (this.#editor) {
      this.#editor.setModel(model);
    } else {
      this.#model = model;
    }
  }
}

customElements.define("text-editor", TextEditorElement);
