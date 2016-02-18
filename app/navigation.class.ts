import {History}           from './history.class';
import {FileSystem}        from './file-system.class'
import {File}              from './file.class';

let driveList = require('drivelist');

export class Navigation {

  private currentPath: string;
  private history: History;
  private drives: Array<File>;

  public isTopOfTheHistory: boolean;
  public isBottomOfTheHistory: boolean;
  public isRootFolder: boolean;

  constructor() {
    this.currentPath = '';
    this.drives = [];
    this.history = new History();
    this.isTopOfTheHistory = true;
    this.isBottomOfTheHistory = true;
    this.isRootFolder = true;
    this.refreshDriveList();
  }

  public back(): Promise<Array<string> | Error> {
    return this.go(this.history.back(), false);
  }

  public forward(): Promise<Array<string> | Error> {
    return this.go(this.history.forward(), false);
  }

  public upward(): Promise<Array<string> | Error> {
    return this.go(this.currentPath.split('/').slice(0, -2).join('/'), true);
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getFullPathToFile(fileName: string): string {
    return this.currentPath + fileName;
  }

  public go(path: string = '', saveToHistory: boolean = true): Promise<Array<string> | Error | void> {
    let promise: Promise<Array<string> | Error | void>;

    if (!path) {
      this.updateCurrentPath(path, saveToHistory);
      promise = Promise.resolve();
    } else {
      //FileSystem.getFilesStat(filesNames, this.path)
      path += path.slice(-1) === '/' ? '' : '/';
      promise = FileSystem.readDir(path)
        .then((filesNames: Array<string>) => {
          this.updateCurrentPath(path, saveToHistory);

          return filesNames;
        });
    }

    return promise;
  }

  public joinFolder(folderName: string, saveToHistory: boolean = true): Promise<Array<string> | Error> {
    return this.go(this.currentPath + folderName, saveToHistory);
  }

  public refresh(): Promise<Array<string> | Error> {
    return this.go(this.currentPath, false);
  }

  //TODO
  private refreshDriveList() {
    return new Promise((resolve, reject) => {
      driveList.list((err: Error, drives) => {
        err ? reject(err) : resolve(drives);
      });
    });
    /*driveList.list((err: Error, drives) => {

      this.zone.run(() => {
        if (!err) {
          this.drives = drives.map((drive) => new File(drive));
          this.files = this.drives;
        }
      });
    });*/
  }

  private updateCurrentPath(path: string, saveToHistory: boolean = true): void {
    if (saveToHistory) {
      this.history.saveToHistory(path);
    }
    this.isRootFolder = !path;
    this.isTopOfTheHistory = this.history.isTopOfTheHistory();
    this.isBottomOfTheHistory = this.history.isBottomOfTheHistory();
    this.currentPath = path;
  }
}