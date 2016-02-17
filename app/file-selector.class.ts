import {File}           from './file.class';

let _ = require('underscore');

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

    this.selected = _.without(this.selected, ...Array.isArray(files) ? files : [files]);

    return this.getSelected();
  }

  public replaceSelection(files: Array<File> | File): Array<File> {
    this.clearSelection();
    this.select(files);

    return this.getSelected();
  }

  public selectMultipleItems(files: Array<File>, targetIndex: number): Array<File> {
    let lastSelectedIndex = files.indexOf(_.last(this.selected));
    if (lastSelectedIndex === -1) {
      lastSelectedIndex = 0;
    }

    let startIndex = Math.min(targetIndex, lastSelectedIndex);
    let endIndex = Math.max(targetIndex, lastSelectedIndex);

    return this.replaceSelection(files.filter((filter, index) => index >= startIndex && index <= endIndex).reverse());
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