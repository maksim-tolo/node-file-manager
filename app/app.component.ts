import {Component, NgZone} from 'angular2/core';
import {FSWatcher, Stats}  from 'fs';
import {FileSelector}      from './file-selector.class'
import {Navigation}        from './navigation.class';
import {File}              from './file.class';

@Component({
  selector: 'node-file-manager',
  templateUrl: './app/templates/app.template.html'
})
export class NodeFileManager {

  private gui = require('nw.gui');
  private fs = require('fs');
  private driveList = require('drivelist');

  private zone: NgZone;
  private fileSelector: FileSelector;
  private fileWatcher: FSWatcher;

  public navigation: Navigation;
  public files: Array<File>;
  public drives: Array<File>;
  public path: string;

  constructor(zone: NgZone) {
    this.files = [];
    this.drives = [];
    this.path = '';
    this.zone = zone;
    this.fileSelector = new FileSelector();
    this.navigation = new Navigation();
    this.refreshDriveList();
  }

  public onFileDblClick(file: File): void {
    if (!file.isSystemFile) {
      if (file.isDirectory || file.isDrive) {
        this.joinFolder(file);
      } else {
        this.openFile(file);
      }
    }
  }

  public goToPath(event: KeyboardEvent): void {
    const ENTER_KEY_CODE: number = 13;

    if (event.keyCode === ENTER_KEY_CODE) {
      this.navigation.go(this.path)
        .then(this.onChangeFolder.bind(this))
        .catch(this.showErrorPopup.bind(this));
    }
  }

  public back(): void {
    this.navigation.back()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public forward(): void {
    this.navigation.forward()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public upward(): void {
    this.navigation.upward()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public selectFile(event: MouseEvent, file: File): void {
    if (event.ctrlKey) {
      if (file.isSelected) {
        this.fileSelector.unselect(file);
      } else {
        this.fileSelector.select(file);
      }
    } else {
      this.fileSelector.replaceSelection(file);
    }
  }

  private joinFolder(file: File): void {
    this.navigation.joinFolder(file.fileName)
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  private openFile(file: File): void {
    this.gui.Shell.openItem(this.navigation.getCurrentPath() + file.fileName);
  }

  //TODO
  private refreshDriveList(): void {
    this.driveList.list((err: Error, drives) => {
      this.zone.run(() => {
        if (!err) {
          this.drives = drives.map((drive) => new File(drive));
          this.files = this.drives;
        }
      });
    });
  }

  private onChangeFolder(filesNames?: Array<string>): void {
    this.path = this.navigation.getCurrentPath();
    this.fileSelector.clearSelection();

    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    if (filesNames) {
      this.fileWatcher = this.fs.watch(this.navigation.getCurrentPath(), this.refresh.bind(this));
      this.getFilesStat(filesNames)
        .then((files: Array<File>) => this.files = files);
    } else {
      this.files = this.drives;
    }
  }

  private showErrorPopup(err: Error): void {
    console.log(err);
  }

  private refresh(): void {
    this.navigation.refresh()
      .then((filesNames?: Array<string>) => {
        this.zone.run(() => {
          this.onChangeFolder(filesNames);
        });
      })
      .catch(this.showErrorPopup.bind(this));
  }

  private getFilesStat(filesNames: Array<string>): Promise<Array<File>> {
    return Promise.all(filesNames.map((fileName: string) => {
      return new Promise((resolve) => {
        this.fs.stat(this.path + fileName, (err: Error, stats: Stats) => {
          resolve(err ? new File(null, true, fileName) : new File(stats, false, fileName));
        });
      });
    }));
  }
}