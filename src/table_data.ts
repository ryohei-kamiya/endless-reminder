export class TableData {
  _values: any[][];

  constructor(values: any[][]) {
    this._values = values;
  }

  getRows(): number {
    if (!this._values) {
      return 0;
    }
    return this._values.length;
  }

  getColumns(): number {
    if (!this._values || this._values.length === 0) {
      return 0;
    }
    return this._values[0].length;
  }

  getValue(row: number, col: number): any {
    if (row >= this.getRows()) {
      return "";
    }
    if (col >= this.getColumns()) {
      return "";
    }
    return this._values[row][col];
  }

  setValue(row: number, col: number, value: any) {
    if (row >= this.getRows()) {
      return;
    }
    if (col >= this.getColumns()) {
      return;
    }
    this._values[row][col] = value;
  }
}
