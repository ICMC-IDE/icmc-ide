const contextMenusMap = {
  file: [
    {
      text: "Open",
      event: "fileOpen",
    },
    {
      text: "Rename",
      event: "fileRename",
    },
    {
      text: "Delete",
      event: "fileDelete",
    },
  ],
  folder: [
    {
      text: "New File...",
      event: "fileNew",
    },
    {
      text: "New Folder...",
      event: "folderNew",
    },
    {
      text: "Collapse",
      event: "folderOpen",
    },
    {
      text: "Rename",
      event: "folderRename",
    },
    {
      text: "Delete",
      event: "folderDelete",
    },
  ],
  filepicker: [
    {
      text: "New File...",
      event: "fileNew",
    },
    {
      text: "New Folder...",
      event: "folderNew",
    },
  ],
};

let openMenu: HTMLElement | null = null;

export function contextMenusSetup() {
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    openMenu?.remove();
    openMenu = null;

    let target = event.target as HTMLElement;
    while (!target.dataset.contextMenuId) {
      target = target.parentElement!;
      if (!target) {
        return;
      }
    }

    const menu = document.createElement("div");

    for (const item of contextMenusMap[
      target.dataset.contextMenuId as keyof typeof contextMenusMap
    ]) {
      const button = document.createElement("button");
      button.innerText = item.text;
      button.addEventListener("click", () => {
        target.dispatchEvent(
          new CustomEvent(item.event, {
            detail: target.dataset.contextMenuData,
            bubbles: true,
          }),
        );
        menu.remove();
      });
      menu.append(button);
    }

    menu.classList.add("context-menu");
    menu.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;

    document.body.append(menu);
    openMenu = menu;
  });

  document.addEventListener("click", () => {
    openMenu?.remove();
    openMenu = null;
  });
}
