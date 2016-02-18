import {Stats, FSWatcher}  from 'fs';
import {File}              from './file.class';

let fs = require('fs');

export class FileSystem {
  public static readDir(path: string): Promise<Array<string> | Error> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err: Error, filesNames: Array<string>) => {
        err ? reject(err) : resolve(filesNames);
      });
    });
  }

  public static removeEmptyDir(path: string): Promise<Error> {
    return new Promise((resolve, reject) => {
      fs.rmdir(path, (err: Error) => {
        err ? reject(err) : resolve();
      });
    });
  }

  public static removeFile(path: string): Promise<Error> {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err: Error) => {
        err ? reject(err) : resolve();
      });
    });
  }

  public static getFilesStat(filesNames: Array<string>, basePath: string): Promise<Array<File>> {
    return Promise.all(filesNames.map((fileName: string) => {
      return new Promise((resolve) => {
        fs.stat(FileSystem.getFullPath(fileName, basePath), (err: Error, stats: Stats) => {
          resolve(err ? new File(null, true, fileName) : new File(stats, false, fileName));
        });
      });
    }));
  }

  public static removeFiles(files: Array<File>, basePath: string) {
    return Promise.all(files.map((file: File) => {
      let fullPath: string = FileSystem.getFullPath(file.fileName, basePath);
      let toReturn;

      if (file.isDrive) {
        toReturn = Promise.reject(new Error('Can not remove a drive'));
      } else if (file.isDirectory) {
        toReturn = FileSystem.readDir(fullPath)
            .then((filesNames: Array<string>) => FileSystem.getFilesStat(filesNames, fullPath))
            .then((files: Array<File>) => FileSystem.removeFiles(files, fullPath))
            .then(() => FileSystem.removeEmptyDir(fullPath));
      } else {
        toReturn = FileSystem.removeFile(fullPath);
      }

      return toReturn;
    }));
  }

  public static watchDir(fullPath: string, callback): FSWatcher {
    return fs.watch(fullPath, callback);
  }

  private static getFullPath(fileName: string, basePath: string): string {
    return basePath + (basePath.slice(-1) === '/' ? '' : '/') + fileName;
  }
}