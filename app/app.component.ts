import {Component, NgZone} from 'angular2/core';
import {FileSelector}      from './file-selector.class'

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

  public drives: Array<Drive>;
  public currentPath: string;

  constructor(zone: NgZone) {
    this.drives = [];
    this.currentPath = '/dfdf/';
    this.zone = zone;
    this.fileSelector = new FileSelector();
    this.refreshDriveList();
  }

  public back() {
    //this.getFiles(this.currentPath + '../');
  }

  public defineAction(drive) {
    /*if (file && file.isFile && file.isFile()) {
      gui.Shell.openItem($scope.currentPath + file.fileName);
    } else {
      getFiles(this.currentPath + file.fileName + '/');
    }*/
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

 /* private getFiles(path) {
    this.fs.readdir(path, (err, files) => {
      if (err) {
        console.log(err);
      } else {
        this.currentPath = path;
        if (this.fileWatcher) {
          this.fileWatcher.close();
        }
        this.fileWatcher = this.fs.watch(this.currentPath,() => {
          this.getFiles(this.currentPath);
        });
        this.getFilesStat(files);
      }
    });
  }*/

  /*getFilesStat(files) {
    this.fileList = [];

    files.forEach(function(file) {
      var stats;

      try {
        stats = this.fs.statSync(this.currentPath + '/' + file);
        stats.imgSrc = stats.isDirectory() ? 'images/folder.png' : 'images/file.png';
      } catch (err) {
        stats = {
          imgSrc: 'images/folder.png',
          isSystemFile: true
        }
      }
      stats.fileName = file;
      this.fileList.push(stats);
    });
  }*/
}
interface Drive {
  description: string,
  device: string,
  fileName: string,
  icon: string,
  mountpoint: string,
  size: string
}
interface History {
  path: string
}