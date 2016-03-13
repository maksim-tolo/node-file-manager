import {Directive, AfterViewInit} from 'angular2/core';

@Directive({
  selector: '[mdl-upgrade]'
})
export class MdlUpgrade implements AfterViewInit{
  ngAfterViewInit() {
    componentHandler.upgradeAllRegistered();
  }
}