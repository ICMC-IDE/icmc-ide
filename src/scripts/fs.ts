class Fs {
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
    return Array.from(localStorage, (_, i) => localStorage.key(i))
      .filter((key) => typeof key === "string")
      .filter((key) => key.startsWith("file:"));
  }
}

const fs = new Fs();

if (fs.files().length === 0) {
  const assets = await Promise.all(
    (
      await Promise.all(
        ["charmap.mif", "example.asm"].map((filename) =>
          fetch(`../assets/${filename}`),
        ),
      )
    ).map((data) => data.text()),
  );

  for (const [filename, content] of [
    ["charmap.mif", assets[0]],
    ["example.asm", assets[1]],
  ]) {
    fs.write(filename, content);
  }
}

export default fs;
