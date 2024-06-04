class Field {
  #handlers = [];
  #value;
  #name;

  static async async_with(name, defaultValue) {
    const storedValue = localStorage.getItem(`config.${name}`) ?? await defaultValue();
    return new this(name, storedValue);
  }

  static with(name, defaultValue) {
    const storedValue = localStorage.getItem(`config.${name}`) ?? defaultValue;
    return new this(name, storedValue);
  }

  constructor(name, storedValue) {
    this.#name = name;

    if (storedValue !== null) {
      this.set(storedValue);
    }
  }

  get() {
    return this.#value;
  }

  set(value) {
    this.#value = value;

    localStorage.setItem(`config.${this.#name}`, value);

    for (const handler of this.#handlers) {
      handler(value);
    }
  }

  subscribe(handler) {
    this.#handlers.push(handler);
  }

  update(func) {
    this.set(func(this.#value));
  }
}

export const syntax = Field.with("syntax", "icmc");
export const language = Field.with("language", "asm");
export const screenWidth = Field.with("screenWidth", 40);
export const screenHeight = Field.with("screenHeight", 30);
export const sourceCode = await Field.async_with("sourceCode", async () => await (await fetch("../assets/example.asm")).text());
