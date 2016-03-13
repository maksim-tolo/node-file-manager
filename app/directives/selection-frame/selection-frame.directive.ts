import {Directive, ElementRef} from 'angular2/core';

let _ = require('underscore');

@Directive({
  selector: '[nfm-selection-frame]',
  host: {
    '(mousedown)': 'onMouseDown($event)'
  }
})
export class selectionFrame {

  private backdrop;
  private initialWidth: number;
  private initialHeight: number;
  private eventMap;

  constructor(private el: ElementRef) {
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.backdrop = document.createElement('div');
    this.eventMap = new Map();
    this.eventMap.set('mousemove', this.onMouseMove.bind(this));
    this.eventMap.set('mouseup', this.onMouseUp.bind(this));

    this.updateBackdropStyle({
      'position': 'absolute',
      'cursor': 'default',
      'z-index': 9000,
      'border': '1px #99CCFF solid',
      'background': 'rgba(153, 204, 255, 0.5)',
      'box-sizing': 'border-box'
    });
  }

  public onMouseDown(event) {
    let left: number = event.pageX;
    let top: number = event.pageY;
    let width: number = 0;
    let height: number = 0;

    this.initialWidth = event.pageX;
    this.initialHeight = event.pageY;

    this.updateBackdropStyle(this.getPositionInPixels({left, top, width, height}));
    this.addEventListeners();
  }

  private onMouseMove(event) {
    let left: number = this.initialWidth;
    let top: number = this.initialHeight;
    let width: number = Math.abs(this.initialWidth - event.pageX);
    let height: number = Math.abs(this.initialHeight - event.pageY);

    if (event.pageX <= this.initialWidth && event.pageY >= this.initialHeight) {
      left = event.pageX;
    } else if (event.pageX >= this.initialWidth && event.pageY <= this.initialHeight) {
      top = event.pageY;
    } else if (event.pageX < this.initialWidth && event.pageY < this.initialHeight) {
      left = event.pageX;
      top = event.pageY;
    }

    this.updateBackdropStyle(this.getPositionInPixels(this.getBackdropPosition({left, top, width, height})));
    this.attachBackdrop();

    //this.el.nativeElement.querySelectorAll('li').forEach()
  }

  private onMouseUp() {
    this.detachBackdrop();
    this.removeEventListeners();
  }

  private attachBackdrop() {
    if (!document.body.contains(this.backdrop)) {
      document.body.appendChild(this.backdrop);
    }
  }

  private detachBackdrop() {
    if (document.body.contains(this.backdrop)) {
      document.body.removeChild(this.backdrop);
    }
  }

  private addEventListeners() {
    this.eventMap.forEach((callback, eventType) => document.addEventListener(eventType, callback));
  }

  private removeEventListeners() {
    this.eventMap.forEach((callback, eventType) => document.removeEventListener(eventType, callback));
  }

  private updateBackdropStyle(newStyle = {}) {
    Object.assign(this.backdrop.style, newStyle);
  }

  private getBackdropPosition(position) {
    let {start: left, size: width} = this.calcPosition(position.left, this.el.nativeElement.offsetLeft,
      position.width, this.el.nativeElement.offsetWidth);
    let {start: top, size: height} = this.calcPosition(position.top, this.el.nativeElement.offsetTop,
      position.height, this.el.nativeElement.offsetHeight);

    return {left, top, width, height};
  }

  private calcPosition(start, offsetStart, size, offsetSize) {
    let toReturn = {
      start: 0,
      size: 0
    };

    if (start < offsetStart) {
      toReturn.start = offsetStart;
      toReturn.size = Math.min(size - (offsetStart - start), offsetSize);
    } else {
      toReturn.start = start;
      toReturn.size = Math.min(size, offsetSize - (start - offsetStart));
    }

    return toReturn;
  }

  private getPositionInPixels(numbers) {
    return _.each(numbers, (value, key, list) => list[key] = `${value}px`);
  }
}