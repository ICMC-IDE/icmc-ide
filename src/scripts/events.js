class EventEmitter {
  #handlers = [];

  emmit(value) {
    for (const handler of this.#handlers) {
      handler(value);
    }
  }

  subscribe(handler) {
    this.#handlers.push(handler);
  }
}

export const deleteFile = new EventEmitter();
export const openFile = new EventEmitter();
export const refresh = new EventEmitter();
