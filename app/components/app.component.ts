import {Component, NgZone} from 'angular2/core';
import {connect}           from 'socket.io-client';
import {FSWatcher}         from 'fs';
import {FileSelector}      from './../classes/file-selector.class';
import {Navigation}        from './../classes/navigation.class';
import {File}              from './../classes/file.class';
import {FileSystem}        from './../classes/file-system.class';

let gui = require('nw.gui');

@Component({
  selector: 'node-file-manager',
  templateUrl: './app/components/app.template.html'
})
export class NodeFileManager {

  private zone: NgZone;
  private fileSelector: FileSelector;
  private fileWatcher: FSWatcher;
  private socket;

  public navigation: Navigation;
  public files: Array<File>;
  public path: string;

  constructor(zone: NgZone) {
    this.files = [];
    this.path = '';
    this.zone = zone;
    this.fileSelector = new FileSelector();
    this.navigation = new Navigation();
    this.socket = connect('http://localhost:3000');
    this.socket.on('connect', () => {
      this.socket.emit('login', {
        qwe: 'asd'
      });
    });
    this.initEventListeners();
    this.refresh();
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

  public selectFile(event: MouseEvent, index: number, file: File): void {
    if (event.ctrlKey) {
      if (file.isSelected) {
        this.fileSelector.unselect(file);
      } else {
        this.fileSelector.select(file);
      }
    } else if (event.shiftKey) {
      this.fileSelector.selectMultipleItems(this.files, index);
    } else {
      this.fileSelector.replaceSelection(file);
    }
  }

  private joinFolder(file: File): void {
    this.navigation.joinFolder(file.fileName)
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  private refresh(): void {
    this.navigation.refresh()
      .then(this.onChangeFolder.bind(this))
      .catch(this.showErrorPopup.bind(this));
  }

  private openFile(file: File): void {
    gui.Shell.openItem(this.navigation.getCurrentPath() + file.fileName);
  }

  private onChangeFolder(files: Array<File>): void {
    this.files = files;
    this.path = this.navigation.getCurrentPath();
    this.fileSelector.clearSelection();

    if (this.fileWatcher) {
      this.fileWatcher.close();
    }
    this.fileWatcher = FileSystem.watchDir(this.path, this.refresh.bind(this));
  }

  private showErrorPopup(err: Error): void {
    console.log(err);
  }

  private initEventListeners() {
    const KEY_CODES = {
      DELETE: 46,
      A: 65,
      C: 67,
      V: 86,
      X: 88
    };

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const INPUT = 'INPUT';

      if (event.target.tagName !== INPUT) {
        event.preventDefault();

        if (event.keyCode === KEY_CODES.DELETE) {
          FileSystem.removeFiles(this.fileSelector.getSelected(), this.navigation.getCurrentPath())
              .catch(this.showErrorPopup.bind(this));
        }

        if (event.keyCode === KEY_CODES.A && event.ctrlKey) {
          this.fileSelector.replaceSelection(this.files);
        }
      }
    });
  }
}