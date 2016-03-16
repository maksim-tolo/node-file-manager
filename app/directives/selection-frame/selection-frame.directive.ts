import {Directive, ElementRef, Input} from 'angular2/core';

let _ = require('underscore');

@Directive({
  selector: '[nfmSelectionFrame]',
  host: {
    '(mousedown)': 'onMouseDown($event)'
  }
})
export class selectionFrame {

  @Input('nfmSelectionFrame') selectionCallback;

  private initialWidth: number;
  private initialHeight: number;
  private backdrop;
  private eventMap;

  constructor(private el: ElementRef) {
    this.initialWidth = 0;
    this.initialHeight = 0;
    this.backdrop = document.createElement('div');
    this.eventMap = new Map();
    this.eventMap.set('mousemove', this.onMouseMove.bind(this));
    this.eventMap.set('mouseup', this.onMouseUp.bind(this)); //TODO: add scroll event listener using arrow function

    this.updateBackdropStyle({
      'position': 'absolute',
      'cursor': 'default',
      'z-index': 9000,
      'border': '1px #99CCFF solid',
      'background': 'rgba(153, 204, 255, 0.5)',
      'box-sizing': 'border-box'
    });

    this.el.nativeElement.style.position = 'relative';
  }

  public onMouseDown(event) {
    const I = 'I';
    let element = this.el.nativeElement;
    let left: number = event.pageX - element.offsetLeft + element.scrollLeft;
    let top: number = event.pageY - element.offsetTop + element.scrollTop;
    let width: number = 0;
    let height: number = 0;

    //TODO
    if (event.target.tagName !== I) {
      this.initialWidth = left;
      this.initialHeight = top;

      this.updateBackdropStyle(this.getPositionInPixels({left, top, width, height}));
      this.addEventListeners();
    }
  }

  private onMouseMove(event) {
    let element = this.el.nativeElement;
    let pageX: number = event.pageX - element.offsetLeft + element.scrollLeft;
    let pageY: number = event.pageY - element.offsetTop + element.scrollTop;
    let left: number = Math.min(this.initialWidth, pageX);
    let top: number = Math.min(this.initialHeight, pageY);
    let width: number = Math.abs(this.initialWidth - pageX);
    let height: number = Math.abs(this.initialHeight - pageY);

    this.updateBackdropStyle(this.getPositionInPixels(this.getBackdropPosition({left, top, width, height})));
    this.attachBackdrop();
    this.selectFiles();
  }

  private onMouseUp() {
    this.detachBackdrop();
    this.removeEventListeners();
  }

  //TODO: configurable selector
  private selectFiles() {
    let backdropRect = this.backdrop.getBoundingClientRect();
    let selectedIndexes = Array.from(this.el.nativeElement.querySelectorAll('li'))
      .reduce((prev: Array<number>, cur: HTMLElement, index: number) => {
        let fileRect = cur.getBoundingClientRect();

        if (backdropRect.right > fileRect.left && backdropRect.left < fileRect.right &&
          backdropRect.bottom > fileRect.top && backdropRect.top < fileRect.bottom) {
          prev.push(index);
        }

        return prev;
      }, []);

    this.selectionCallback(selectedIndexes);
  }

  private attachBackdrop() {
    let parent = this.el.nativeElement;

    if (!parent.contains(this.backdrop)) {
      parent.appendChild(this.backdrop);
    }
  }

  private detachBackdrop() {
    let parent = this.el.nativeElement;

    if (parent.contains(this.backdrop)) {
      parent.removeChild(this.backdrop);
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
    let {start: left, size: width} = this.calcPosition(position.left, 0,
      position.width, this.el.nativeElement.scrollWidth);
    let {start: top, size: height} = this.calcPosition(position.top, 0,
      position.height, this.el.nativeElement.scrollHeight);

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