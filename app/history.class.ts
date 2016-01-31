export class History extends Array {

  private positionInTheHistory: number;

  constructor() {
    super();
    this.positionInTheHistory = -1;
  }

  public back(): string {
    return this[--this.positionInTheHistory];
  }

  public forward(): string {
    return this[++this.positionInTheHistory];
  }

  public saveToHistory(path: string): void {
    this.splice(this.positionInTheHistory + 1);
    this.positionInTheHistory = this.push(path) - 1;
  }

  public isTopOfTheHistory(): boolean {
    return this.positionInTheHistory === this.length - 1;
  }

  public isBottomOfTheHistory(): boolean {
    return this.positionInTheHistory < 0;
  }
}