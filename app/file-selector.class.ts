interface File {
  isSelected: boolean
}

export class FileSelector {

  private selected: Array<File>;

  constructor() {
    this.selected = [];
  }

  public select(files: Array<File> | File): Array<File> {
    FileSelector.toggleSelection(files);

    if (Array.isArray(files)) {
      this.selected.concat(files);
    } else {
      this.selected.push(files);
    }

    return this.getSelected();
  }

  public unselect(files: Array<File> | File): Array<File> {
    FileSelector.toggleSelection(files);

    if (Array.isArray(files)) {
      files.forEach((file: File) => this.selected.filter((selectedFile: File) => selectedFile !== file));
    } else {
      this.selected.filter((selectedFile: File) => selectedFile !== files);
    }

    return this.getSelected();
  }

  public replaceSelection(files: Array<File> | File): Array<File> {
    this.clearSelection();
    this.select(files);

    return this.getSelected();
  }

  public clearSelection(): void {
    FileSelector.toggleSelection(this.selected);
    this.selected = [];
  }

  public getSelected(): Array<File> {
    return this.selected;
  }

  private static toggleSelection(files: Array<File> | File): void {
    if (Array.isArray(files)) {
      files.forEach((file: File) => file.isSelected = !file.isSelected);
    } else {
      files.isSelected = !files.isSelected;
    }
  }
}