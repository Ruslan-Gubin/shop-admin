import { CanvasDraw } from "./CanvasDraw";
import type { CanvasDrawGraphProps } from "./types";

class CanvasDrawGraph {
  readonly baseContext;
  readonly colorGridLines: string;
  readonly rowCount: number;
  readonly width: number;
  readonly height: number;
  readonly maxCount: number;
  readonly gridHeight: number;
  readonly gridWidth: number;
  readonly maxThreshold: number;
  public canvasDraw: CanvasDraw;
  private columnLine = 5;
  readonly lgSpacing = 4;
  readonly smSpacing = 4;
  readonly lines: number[][];

  constructor({ baseContext, colorGridLines, rowCount, maxCount, lines }: CanvasDrawGraphProps) {
    this.baseContext = baseContext;
    this.canvasDraw = new CanvasDraw(baseContext);
    this.width = this.baseContext.canvas.width;
    this.height = this.baseContext.canvas.height;
    this.colorGridLines = colorGridLines;
    this.rowCount = rowCount;
    this.maxCount = maxCount;
    this.gridHeight = this.height - 8;
    this.gridWidth = this.width - 8;
    this.lines = lines;
    this.maxThreshold = this.calculatedMaxThreshold(this.maxCount);
  }

  protected drawCenterGrid() {
    const gridCoordinate = {
      startX: this.lgSpacing,
      endX: this.gridWidth + this.lgSpacing,
      startY: this.smSpacing,
      endY: this.gridHeight,
    };

    const stepHorizontal = gridCoordinate.endY / 4;

    for (let i = 0; i < this.columnLine; i++) {
      const currentLineStartY = gridCoordinate.startY + i * stepHorizontal;
      this.canvasDraw.dashedLine({
        startLine: { x: gridCoordinate.startX, y: currentLineStartY },
        lines: [gridCoordinate.endX, currentLineStartY],
        border: { color: this.colorGridLines, width: 1 },
      });
    }
  }

  private calculatedMaxThreshold(maxCount: number): number {
    return maxCount <= 0 ? 10 : 10 ** Math.ceil(Math.log10(maxCount));
  }

  protected getCurrentPercent(value: number, totalSum: number): number {
    return (value / totalSum) * 100;
  }

  protected getCurrentHeightY(height: number, remains: number): number {
    const percentage = (remains / 100) * height;
    return height - percentage;
  }

  protected getCurrentY(
    count: number,
    maxValue: number,
    totalHeight: number,
  ): { currentY: number } {
    const percent = this.getCurrentPercent(count, maxValue);
    const remains = 100 - percent;
    const currentY = this.getCurrentHeightY(totalHeight, remains);
    return { currentY: totalHeight - currentY };
  }

  protected fillTable() {
    this.drawCenterGrid();
  }
}

export { CanvasDrawGraph };
