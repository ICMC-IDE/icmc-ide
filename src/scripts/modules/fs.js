export default class Fs {
  #files = {};
  #handles = new Map();

  constructor() {
    const json = localStorage.getItem("files");

    if (json == null) {
      this.#files = {};
    } else {
      this.#files = JSON.parse(json);
    }

    let i = 0;
    for (const filename in this.#files) {
      this.#handles.set(i, filename);
      this.#handles.set(filename, i);

      i++;
    }
  }

  getHandle(filename) {
    return this.#handles.get(filename);
  }

  getFilename(file_handle) {
    return this.#handles.get(file_handle);
  }

  getBytes(file_handle) {
    const filename = this.#handles.get(file_handle);

    if (filename == null) return;
    return this.#files[filename];
  }

  writeBytes(filename, data) {
    if (this.#files[filename] == null) {
      let i = this.#handles.size >> 1;

      this.#handles.set(i, filename);
      this.#handles.set(filename, i);
    }

    this.#files[filename] = data;
  }
}
