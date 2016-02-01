import {History} from "./history.class";

export class Navigation {

  private fs = require('fs');
  private currentPath: string;
  private history: History;

  public isTopOfTheHistory: boolean;
  public isBottomOfTheHistory: boolean;
  public isRootFolder: boolean;

  constructor() {
    this.currentPath = '';
    this.history = new History();
    this.isTopOfTheHistory = true;
    this.isBottomOfTheHistory = true;
    this.isRootFolder = true;
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

  public go(path: string = '', saveToHistory: boolean = true): Promise<Array<string> | Error> {
    return new Promise((resolve, reject) => {
      if (!path) {
        this.updateCurrentPath(path, saveToHistory);
        resolve();
      } else {
        path += path.slice(-1) === '/' ? '' : '/';
        this.fs.readdir(path, (err: Error, filesNames: Array<string>) => {
          if (err) {
            reject(err);
          } else {
            this.updateCurrentPath(path, saveToHistory);
            resolve(filesNames);
          }
        });
      }
    });
  }

  public joinFolder(folderName: string, saveToHistory: boolean = true): Promise<Array<string> | Error> {
    return this.go(this.currentPath + folderName, saveToHistory);
  }

  public refresh(): Promise<Array<string> | Error> {
    return this.go(this.currentPath, false);
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