class VirtualFileSystemObject<
  T extends FileSystemFileHandle | FileSystemDirectoryHandle,
> {
  name: string;
  handle?: T;
  parent?: VirtualFileSystemDirectory;

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
    const newFile = directory.createFile(name);
    await newFile.create();
    await newFile.write(content);
    return newFile;
  }

  async move(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newFile = await this.copy(directory, name);
    await this.delete();
    return newFile;
  }

  async rename(name: string) {
    return await this.move(this.parent!, name);
  }
}

export class VirtualFileSystemDirectory extends VirtualFileSystemObject<FileSystemDirectoryHandle> {
  async create() {
    this.handle = await this.parent!.handle!.getDirectoryHandle(this.name!, {
      create: true,
    });
  }

  createDirectory(name: string) {
    return new VirtualFileSystemDirectory(name, undefined, this);
  }

  createFile(name: string) {
    return new VirtualFileSystemFile(name, undefined, this);
  }

  async getDirectory(name: string) {
    const handle = await this.handle!.getDirectoryHandle(name);
    return new VirtualFileSystemDirectory(name, handle, this);
  }

  async getFile(name: string) {
    const handle = await this.handle!.getDirectoryHandle(name);
    return new VirtualFileSystemDirectory(name, handle, this);
  }

  async delete() {
    await this.parent!.handle!.removeEntry(this.name, { recursive: true });
    this.handle = undefined;
  }

  async copy(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newDirectory = directory.createDirectory(name);
    await newDirectory.create();

    for await (const object of this.list()) {
      await object.copy(newDirectory);
    }

    return newDirectory;
  }

  async move(directory: VirtualFileSystemDirectory, name: string = this.name) {
    const newDirectory = await this.copy(directory, name);
    await this.delete();
    return newDirectory;
  }

  async rename(name: string) {
    return await this.move(this.parent!, name);
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
