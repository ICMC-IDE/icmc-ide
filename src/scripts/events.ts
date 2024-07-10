import Charmap from "./charmap";
import { File, EventHandler } from "./types";

export type Unsubscriber = () => void;

export class EventEmitter<T> {
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

export default {
  deleteFile: new EventEmitter<File>(),
  openFile: new EventEmitter<File>(),
  refresh: new EventEmitter<void>(),
  render: new EventEmitter<void>(),
  setCharmap: new EventEmitter<Charmap>(),
};
