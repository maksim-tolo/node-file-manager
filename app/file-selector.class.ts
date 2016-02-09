import {File}         from './file.class';
import {without}      from 'node_modules/underscore/underscore.js';

export class FileSelector {

  private selected: Array<File>;

  constructor() {
    this.selected = [];
  }

  public select(files: Array<File> | File): Array<File> {
    FileSelector.toggleSelection(files);

    this.selected.push(...Array.isArray(files) ? files : [files]);

    return this.getSelected();
  }

  public unselect(files: Array<File> | File): Array<File> {
    FileSelector.toggleSelection(files);

    this.selected = without(this.selected, ...Array.isArray(files) ? files : [files]);

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