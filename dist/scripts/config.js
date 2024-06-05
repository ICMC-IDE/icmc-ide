class Field {
  #handlers = [];
  #value;
  #name;

  static async async_with(name, defaultValue) {
    const storedValue = localStorage.getItem(`config.${name}`);

    try {
      if (storedValue !== null) {
        return new this(name, JSON.parse(storedValue));
      }
    } finally {
      return new this(name, await defaultValue());
    }
  }

  static with(name, defaultValue) {
    const storedValue = localStorage.getItem(`config.${name}`);

    try {
      if (storedValue !== null) {
        return new this(name, JSON.parse(storedValue));
      }
    } finally {
      return new this(name, defaultValue);
    }
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

    localStorage.setItem(`config.${this.#name}`, JSON.stringify(value));

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



const assets = (async () => {
  const responses = await Promise.all(["example.c", "example.asm"].map((filename) => fetch(`../assets/${filename}`)));
  const [c, asm] = await Promise.all(responses.map((response) => response.text()));
  return { c, asm };
})();


export const syntax = Field.with("syntax", "icmc");
export const language = Field.with("language", "asm");
export const screenWidth = Field.with("screenWidth", 40);
export const screenHeight = Field.with("screenHeight", 30);
export const sourceCode = await Field.async_with("sourceCode", async () => await assets);
export const frequency = Field.with("frequency", 6);
