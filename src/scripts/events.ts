import Charmap from "./charmap";
import { File, EventHandler } from "./types";

export type Unsubscriber = () => void;

class EventEmitter<T> {
  #handlers: EventHandler<T>[] = [];

  emmit(value: T) {
    for (const handler of this.#handlers) {
      handler(value);
    }
  }

  subscribe(handler: EventHandler<T>): Unsubscriber {
    this.#handlers.push(handler);
    return () => {
      this.#handlers = this.#handlers.filter((h) => h !== handler);
    };
  }
}

export const deleteFile = new EventEmitter<File>();
export const openFile = new EventEmitter<File>();
export const refresh = new EventEmitter<void>();
export const render = new EventEmitter<void>();
export const setCharmap = new EventEmitter<Charmap>();
