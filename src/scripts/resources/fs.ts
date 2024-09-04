const fileExtensions = new Set(["json", "txt", "c", "asm", "mif", "toml"]);

// TODO: Optimizations

class VirtualFileSystemObject<
  T extends FileSystemFileHandle | FileSystemDirectoryHandle,
> {
  name: string;
  handle?: T;
  parent?: VirtualFileSystemDirectory;

  constructor(name: string, parent?: VirtualFileSystemDirectory, handle?: T) {
    this.name = name;
    this.handle = handle;
    this.parent = parent;
  }

  get loaded() {
    return this.handle !== undefined;
  }

  get path(): string {
    return this.parent ? `${this.parent.path}/${this.name}` : this.name;
  }
}

export class VirtualFileSystemDirectory extends VirtualFileSystemObject<FileSystemDirectoryHandle> {
  #childDirectoriesCache: VirtualFileSystemDirectory[] = [];
  #childFilesCache: VirtualFileSystemFile[] = [];

  resolveDirectory(path: string[]): VirtualFileSystemDirectory {
    if (path.length === 0) {
      return this;
    }

    let part = path.shift()!;
    while (part === "." || part === "") {
      part = path.shift()!;
    }

    let nextDirectory = this.#childDirectoriesCache.find(
      (directory) => directory.name === part,
    );
    if (!nextDirectory) {
      nextDirectory = new VirtualFileSystemDirectory(part, this);
      this.#childDirectoriesCache.push(nextDirectory);
    }

    if (path.length === 0) {
      return nextDirectory;
    }
    return nextDirectory.resolveDirectory(path);
  }

  resolveFile(path: string[]) {
    const directory = this.resolveDirectory(path.slice(0, -1));
    const filename = path.at(-1)!;

    let file = this.#childFilesCache.find((file) => file.name === filename);
    if (!file) {
      file = new VirtualFileSystemFile(filename, directory);
      this.#childFilesCache.push(file);
    }

    return file;
  }

  async create(createParents = false) {
    if (this.loaded) {
      return;
    }
    if (createParents) {
      await this.parent!.create(true);
    }

    this.handle = await this.parent!.handle!.getDirectoryHandle(this.name, {
      create: true,
    });
  }

  async load(loadParents = true) {
    if (this.loaded) {
      return;
    }
    if (loadParents) {
      await this.parent!.load(true);
    }

    this.handle = await this.parent!.handle!.getDirectoryHandle(this.name);
  }

  async getDirectory(path: string, load = true) {
    const directory = this.resolveDirectory(path.split("/"));
    if (load) {
      await directory.load();
    }
    return directory;
  }

  async getFile(path: string, load = true) {
    const file = this.resolveFile(path.split("/"));
    if (load) {
      await file.load();
    }
    return file;
  }

  async createDirectory(path: string, createParents = false) {
    const directory = await this.getDirectory(path, false);
    await directory.create(createParents);
    return directory;
  }

  async createFile(path: string, createParents = false) {
    const file = await this.getFile(path, false);
    await file.create(createParents);
    return file;
  }

  async delete() {
    await this.parent!.handle!.removeEntry(this.name, { recursive: true });
    this.handle = undefined;
  }

  async copy(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newDirectory = await directory.createDirectory(name);

    for await (const object of this.list()) {
      await object.copy(newDirectory);
    }

    return newDirectory;
  }

  async move(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newDirectoryHandle = (await this.copy(directory, name)).handle!;
    await this.delete();

    this.handle = newDirectoryHandle;
    this.name = name;
    this.parent = directory;
  }

  async rename(name: string) {
    if (name === this.name) {
      return;
    }
    await this.move(this.parent!, name);
  }

  async hasDirectory(path: string) {
    try {
      await this.getDirectory(path);
      return true;
    } catch {
      return false;
    }
  }

  async hasFile(path: string) {
    try {
      await this.getFile(path);
      return true;
    } catch {
      return false;
    }
  }

  async *list() {
    for await (const [name, file] of this.handle!.entries()) {
      if (file instanceof FileSystemFileHandle) {
        yield new VirtualFileSystemFile(name, this, file);
      } else {
        yield new VirtualFileSystemDirectory(
          name,
          this,
          file as FileSystemDirectoryHandle,
        );
      }
    }
  }
}

export class VirtualFileSystemFile extends VirtualFileSystemObject<FileSystemFileHandle> {
  get extension() {
    const parts = this.name.split(".");

    if (parts.length === 1) {
      return "txt";
    }

    const extension = parts.at(-1)!;
    return fileExtensions.has(extension) ? extension : "txt";
  }

  async create(createParents = false) {
    if (this.loaded) {
      return;
    }
    if (createParents) {
      await this.parent!.create(true);
    }

    this.handle = await this.parent!.handle!.getFileHandle(this.name!, {
      create: true,
    });
  }

  async load(loadParents = true) {
    if (this.loaded) {
      return;
    }
    if (loadParents) {
      await this.parent!.load(true);
    }

    this.handle = await this.parent!.handle!.getFileHandle(this.name);
  }

  async read() {
    return (await this.handle!.getFile()).text();
  }

  async write(data: string, position: number = 0, size: number = data.length) {
    const handle = await this.handle!.createWritable();
    await handle.write({
      data,
      position,
      size,
      type: "write",
    } as FileSystemWriteChunkType);
    await handle.close();
  }

  async delete() {
    await this.parent!.handle!.removeEntry(this.name);
    this.handle = undefined;
  }

  async copy(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const content = await this.read();
    const newFile = await directory.createFile(name);
    await newFile.write(content);
    return newFile;
  }

  async move(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newFileHandle = (await this.copy(directory, name)).handle!;
    await this.delete();

    this.handle = newFileHandle;
    this.name = name;
    this.parent = directory;
  }

  async rename(name: string) {
    if (name === this.name) {
      return;
    }
    await this.move(this.parent!, name);
  }
}

const ASSETS_PATH = "assets/";
const ASSETS_LIST = ASSETS_PATH + "/assets.json";

export async function loadAssets(
  directory: VirtualFileSystemDirectory,
  loadUserAssets: boolean,
  overwrite = false,
) {
  const assets = (await (await fetch(ASSETS_LIST)).json()) as {
    user: string[];
    internal: string[];
  };

  await Promise.all(
    [assets.internal, loadUserAssets ? assets.user : []]
      .flat()
      .map(async (asset) => {
        if (!overwrite && (await directory.hasFile(asset))) {
          return;
        }

        const content = await (await fetch(ASSETS_PATH + asset)).text();
        const file = await directory.createFile(asset, true);
        return await file.write(content);
      }),
  );
}
