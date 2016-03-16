import {File}           from './file.class';

let _ = require('underscore');

export class FileSelector {

  private files: Array<File>;
  private lastSelectedIndex: number;

  constructor(files = []) {
    this.files = files;
    this.lastSelectedIndex = 0;
  }

  public toggleSelection(files: Array<File> | File, flag?: boolean): Array<File> {
    (Array.isArray(files) ? files : [files])
      .forEach((file: File) => file.isSelected = flag === undefined ? !file.isSelected : flag);

    return this.getSelected();
  }

  public select(files: Array<File> | File, replace: boolean = true): Array<File> {
    if (replace) {
      this.clearSelection();
    }

    return this.toggleSelection(files, true);
  }

  public unselect(files: Array<File> | File): Array<File> {
    return this.toggleSelection(files, false);
  }

  public selectByIndexes(indexes: Array<number> | number, replace: boolean = true): Array<File> {
    return this.select(this.getFilesByIndexes(indexes), replace);
  }

  public unselectByIndexes(indexes: Array<number> | number): Array<File> {
    return this.unselect(this.getFilesByIndexes(indexes));
  }

  public selectAll(): Array<File> {
    return this.select(this.files);
  }

  public clearSelection(): void {
    this.toggleSelection(this.files, false);
  }

  /*public selectMultipleItems(files: Array<File>, targetIndex: number): Array<File> {
    let lastSelectedIndex = files.indexOf(_.last(this.selected));
    if (lastSelectedIndex === -1) {
      lastSelectedIndex = 0;
    }

    let startIndex = Math.min(targetIndex, lastSelectedIndex);
    let endIndex = Math.max(targetIndex, lastSelectedIndex);

    return this.replaceSelection(files.filter((filter, index) => index >= startIndex && index <= endIndex).reverse());
  }*/

  public getSelected(): Array<File> {
    return this.files.filter((file) => file.isSelected);
  }

  private getFilesByIndexes(indexes: Array<number> | number) {
    return (Array.isArray(indexes) ? indexes : [indexes]).map((index: number) => this.files[index])
  }
}