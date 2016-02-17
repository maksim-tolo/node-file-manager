import {History}           from './history.class';
import {FileSystem}        from './file-system.class'

export class Navigation {

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

  public getFullPathToFile(fileName: string): string {
    return this.currentPath + fileName;
  }

  public go(path: string = '', saveToHistory: boolean = true): Promise<Array<string> | Error> {
    let toReturn;

    if (!path) {
      this.updateCurrentPath(path, saveToHistory);
      toReturn = Promise.resolve(null);
    } else {
      path += path.slice(-1) === '/' ? '' : '/';
      toReturn = FileSystem.readDir(path)
        .then((filesNames: Array<string>) => {
          this.updateCurrentPath(path, saveToHistory);

          return filesNames;
        });
    }

    return toReturn;
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