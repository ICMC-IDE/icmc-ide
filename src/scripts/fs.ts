export default class Fs {
  read(path: string): string | null {
    return localStorage.getItem("file:" + path);
  }

  write(path: string, content: string): void {
    localStorage.setItem("file:" + path, content);
  }
};
