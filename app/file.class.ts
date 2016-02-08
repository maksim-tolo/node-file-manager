import {Stats}     from 'fs';

/*
 interface Drive {
 description: string,
 device: string,
 fileName: string,
 icon: string,
 mountpoint: string,
 size: string
 }*/

export class File {
    public isSelected: boolean;
    public isSystemFile: boolean;
    public isDirectory: boolean;
    public isDrive: boolean;
    public fileName: string;
    public icon: string;

    constructor(stat, isSystemFile: boolean = false, fileName?: string) {
        this.isSelected = false;
        this.isSystemFile = isSystemFile;
        if (stat && stat.mountpoint) {
            this.isDirectory = false;
            this.isDrive = true;
            this.fileName = stat.mountpoint;
            this.icon = 'view_agenda';
        } else {
            this.isDirectory = isSystemFile || stat.isDirectory();
            this.isDrive = false;
            this.fileName = fileName;
            this.icon = this.isDirectory ? 'folder' : 'insert_drive_file';
        }
    }
}