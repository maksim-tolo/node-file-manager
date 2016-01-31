import {Component, NgZone} from 'angular2/core';
import {FileSelector}      from './file-selector.class'
import {Navigation}        from './navigation.class';

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
  private fileWatcher;

  public navigation: Navigation;
  public drives: Array<Drive>;
  public files: Array<File>;
  public path: string;
  public showDrives: boolean;

  constructor(zone: NgZone) {
    this.drives = [];
    this.path = '';
    this.zone = zone;
    this.showDrives = true;
    this.fileSelector = new FileSelector();
    this.navigation = new Navigation();
    this.refreshDriveList();
  }

  public back() {
    this.navigation.back()
      .then(this.onChangeFolder.bind(this))
      .catch((err: Error) => {
        console.log(err);
      });
  }

  public forward() {
    this.navigation.forward()
      .then(this.onChangeFolder.bind(this))
      .catch((err: Error) => {
        console.log(err);
      });
  }

  public upward() {
    this.navigation.upward()
      .then(this.onChangeFolder.bind(this))
      .catch((err: Error) => {
        console.log(err);
      });
  }

  public joinDrive(drive: Drive) {
    this.navigation.go(drive.fileName, true)
      .then(this.onChangeFolder.bind(this))
      .catch((err: Error) => {
        console.log(err);
      });
    /*if (file && file.isFile && file.isFile()) {
      gui.Shell.openItem($scope.path + file.fileName);
    } else {
      getFiles(this.path + file.fileName + '/');
    }*/
  }

  public joinFolder(folder) {
    this.navigation.joinFolder(folder.fileName, true)
      .then(this.onChangeFolder.bind(this))
      .catch((err: Error) => {
        console.log(err);
      });
  }

  private refreshDriveList(): void {
    this.driveList.list((error, drives: Array<Drive>) => {
      this.zone.run(() => {
        if (!error) {
          drives.forEach((drive: Drive) => {
            drive.icon = './images/drive.svg';
            drive.fileName = drive.mountpoint;
          });
          this.drives = drives;
        }
      });
    });
  }

  private onChangeFolder(filesNames?: Array<string>) {
    this.path = this.navigation.getCurrentPath();
    if (filesNames) {
      this.showDrives = false;
      this.getFilesStat(filesNames);
    } else {
      this.showDrives = true;
    }
  }

 /* private getFiles(path) {
    this.fs.readdir(path, (err, files) => {
      if (err) {
        console.log(err);
      } else {
        this.path = path;
        if (this.fileWatcher) {
          this.fileWatcher.close();
        }
        this.fileWatcher = this.fs.watch(this.path,() => {
          this.getFiles(this.path);
        });
        this.getFilesStat(files);
      }
    });
  }*/

  getFilesStat(files) {
    this.files = [];

    files.forEach((file) => {
      var stats;

      try {
        stats = this.fs.statSync(this.path + file);
        stats.icon = stats.isDirectory() ? './images/folder.png' : './images/file.png';
      } catch (err) {
        stats = {
          icon: './images/folder.png',
          isSystemFile: true
        }
      }
      stats.fileName = file;
      this.files.push(stats);
    });
  }
}
interface Drive {
  description: string,
  device: string,
  fileName: string,
  icon: string,
  mountpoint: string,
  size: string
}