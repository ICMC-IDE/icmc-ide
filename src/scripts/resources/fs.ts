class VirtualFileSystemObject<T extends FileSystemHandle> {
  handle?: T;
  readonly name: string;
  readonly parent?: VirtualFileSystemDirectory;

  constructor(name: string, handle?: T, parent?: VirtualFileSystemDirectory) {
    this.name = name;
    this.handle = handle;
    this.parent = parent;
  }

  get created() {
    return this.handle !== undefined;
  }
}

export class VirtualFileSystemFile extends VirtualFileSystemObject<FileSystemFileHandle> {
  async create() {
    this.handle = await this.parent!.handle!.getFileHandle(this.name, {
      create: true,
    });
  }

  async read() {
    return (await this.handle!.getFile()).text();
  }

  async write(data: string, position?: number, size: number = data.length) {
    const handle = await this.handle!.createWritable();
    await handle.write({
      data,
      position,
      size,
      type: "write",
    } as FileSystemWriteChunkType);
    await handle.close();
  }
}

export class VirtualFileSystemDirectory extends VirtualFileSystemObject<FileSystemDirectoryHandle> {
  async create() {
    this.handle = await this.parent!.handle!.getDirectoryHandle(this.name!, {
      create: true,
    });
  }

  createFile() {
    return new VirtualFileSystemFile(this.name, undefined, this);
  }

  createDirectory() {
    return new VirtualFileSystemDirectory(this.name, undefined, this);
  }

  async getFile(name: string) {
    const handle = await this.handle!.getDirectoryHandle(name);
    return new VirtualFileSystemDirectory(name, handle, this);
  }

  async getDirectory(name: string) {
    const handle = await this.handle!.getDirectoryHandle(name);
    return new VirtualFileSystemDirectory(name, handle, this);
  }

  async *list() {
    for await (const [name, file] of this.handle!.entries()) {
      if (file instanceof FileSystemFileHandle) {
        yield new VirtualFileSystemFile(name, file, this);
      } else {
        yield new VirtualFileSystemDirectory(
          name,
          file as FileSystemDirectoryHandle,
          this,
        );
      }
    }
  }
}
