import {History}           from './history.class';
import {FileSystem}        from './file-system.class';
import {File}              from './file.class';

export class Navigation {

  private currentPath: string;
  private history: History;
  private driveListPromise: Promise<Array<File> | Error>;

  public isTopOfTheHistory: boolean;
  public isBottomOfTheHistory: boolean;
  public isRootFolder: boolean;

  constructor() {
    this.currentPath = '';
    this.history = new History();
    this.isTopOfTheHistory = true;
    this.isBottomOfTheHistory = true;
    this.isRootFolder = true;
    this.driveListPromise = FileSystem.getDrives();
  }

  public back(): Promise<Array<File> | Error> {
    return this.go(this.history.back(), false);
  }

  public forward(): Promise<Array<File> | Error> {
    return this.go(this.history.forward(), false);
  }

  public upward(): Promise<Array<File> | Error> {
    return this.go(this.currentPath.split('/').slice(0, -2).join('/'), true);
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public go(path: string = '', saveToHistory: boolean = true): Promise<Array<File> | Error> {
    let promise: Promise<Array<File> | Error>;

    if (path) {
      path += path.slice(-1) === '/' ? '' : '/';
      promise = FileSystem.readDir(path)
        .then((filesNames: Array<string>) => FileSystem.getFilesStat(filesNames, path));
    } else {
      promise = this.driveListPromise;
    }

    return promise.then((files: Array<File>) => this.updateCurrentPath(files, path, saveToHistory));
  }

  public joinFolder(folderName: string, saveToHistory: boolean = true): Promise<Array<File> | Error> {
    return this.go(this.currentPath + folderName, saveToHistory);
  }

  public refresh(): Promise<Array<File> | Error> {
    return this.go(this.currentPath, false);
  }

  private updateCurrentPath(files: Array<File>, path: string, saveToHistory: boolean = true): Array<File> {
    if (saveToHistory) {
      this.history.saveToHistory(path);
    }
    this.isRootFolder = !path;
    this.isTopOfTheHistory = this.history.isTopOfTheHistory();
    this.isBottomOfTheHistory = this.history.isBottomOfTheHistory();
    this.currentPath = path;

    return files;
  }
}