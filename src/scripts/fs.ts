export default class Fs {
  read(path: string): string | null {
    return localStorage.getItem("file:" + path);
  }

  write(path: string, content: string): void {
    localStorage.setItem("file:" + path, content);
  }

  delete(path: string): void {
    localStorage.removeItem("file:" + path);
  }

  files(): string[] {
    return Array
      .from(localStorage, (_, i) => localStorage.key(i))
      .filter((key) => (typeof key === "string"))
      .filter((key) => key.startsWith("file:"));
  }
};
