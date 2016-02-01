import {Component, NgZone} from 'angular2/core';
import {FileSelector}      from './file-selector.class'
import {Navigation}        from './navigation.class';
import {File}              from './file.class';
import {FSWatcher}         from 'fs';

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

  public joinFolder(folder) {
    this.navigation.joinFolder(folder.fileName, true)
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public goToPath(event) {
    const ENTER_KEY_CODE: number = 13;

    if (event.keyCode === ENTER_KEY_CODE) {
      this.navigation.go(this.path)
        .then(this.onChangeFolder.bind(this))
        .catch(this.showErrorPopup.bind(this));
    }
  }

  public back() {
    this.navigation.back()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public forward() {
    this.navigation.forward()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  public upward() {
    this.navigation.upward()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  /*public joinDrive(drive: Drive) {
    this.navigation.go(drive.fileName)
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
    if (file && file.isFile && file.isFile()) {
      gui.Shell.openItem($scope.path + file.fileName);
    } else {
      getFiles(this.path + file.fileName + '/');
    }
  }*/

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

  private onChangeFolder(filesNames?: Array<string>) {
    this.path = this.navigation.getCurrentPath();
    this.fileSelector.clearSelection();
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
    if (filesNames) {
      this.fileWatcher = this.fs.watch(this.navigation.getCurrentPath(), this.refresh.bind(this));
      this.files = this.getFilesStat(filesNames);
    } else {
      this.files = this.drives;
    }
  }

  private showErrorPopup(err: Error) {
    console.log(err);
  }

  public selectFile(event, file): void {
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

  private refresh() {
    this.navigation.refresh()
      .then((filesNames?: Array<string>) => {
        this.zone.run(() => {
          this.onChangeFolder(filesNames);
        });
      })
      .catch(this.showErrorPopup.bind(this));
  }

  //TODO
  getFilesStat(filesNames: Array<string>) {
    let files = [];

    filesNames.forEach((file) => {
      let stats: File;

      try {
        stats = new File(this.fs.statSync(this.path + file), false, file);
      } catch (err) {
        console.log(err);
        stats = new File(null, true, file);
      }
      files.push(stats);
    });

    return files;
  }
}