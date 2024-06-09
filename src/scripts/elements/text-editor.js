class TextEditor extends HTMLElement {
  #editor;
  #observer;
  #model = null;

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
      this.#editor.layout();
    });

    this.#observer.observe(this);
  }

  set model(model) {
    if (this.#editor) {
      this.#editor.setModel(model);
    } else {
      this.#model = model;
    }
  }
}

customElements.define("text-editor", TextEditor);
