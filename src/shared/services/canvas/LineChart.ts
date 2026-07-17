import { CanvasDrawGraph } from "./CanvasDrawGraph";
import type { LineChartProps, MenuOptionItem } from "./types";

export class LineChart extends CanvasDrawGraph {
  readonly colorsList: string[];
  private mainPoints: { x: number; y: number }[] = [];
  readonly menuOptions: MenuOptionItem[];
  private isHover: boolean = false;

  constructor({ menuOptions, colorsList, ...args }: LineChartProps) {
    super(args);
    this.colorsList = colorsList;
    this.menuOptions = menuOptions;
  }

  private getLinesCoordinate(data: number[]): { x: number; y: number }[] {
    const stepHorizontal = this.gridWidth / this.rowCount;

    const points = [];

    for (let i = 0; i < data.length; i++) {
      const step = this.lgSpacing + stepHorizontal * i;
      const { currentY } = this.getCurrentY(data[i], this.maxThreshold, this.gridHeight);

      points.push({ x: step, y: currentY + this.smSpacing });
    }

    return points;
  }

  private drawContent() {
    for (let i = 0; i < this.lines.length; i++) {
      const points = this.getLinesCoordinate(this.lines[i]);

      if (i === 2) {
        this.mainPoints = points;
      }

      this.canvasDraw.bezierCurvePath({
        points,
        border: { color: this.colorsList[i], width: 1.5 },
      });
      this.baseContext.stroke();
    }
  }

  public mouseLeaveListener = () => {
    this.isHover = false;
    this.baseContext.clearRect(0, 0, this.width, this.height);
    this.update();
  };

  public mouseEnterListener = () => {
    this.isHover = true;
  };

  public mouseMoveListener = (e: MouseEvent) => {
    const offsetY = e.offsetY;
    const offsetX = e.offsetX;

    if (
      offsetY > 15 &&
      offsetY < this.height &&
      offsetX > 0 &&
      offsetX < this.width &&
      this.isHover
    ) {
      const points = this.mainPoints;

      const step = (points[1].x - points[0].x) / 2;

      for (let i = 0; i < points.length; i++) {
        const pointX = points[i].x;
        const pointY = points[i].y;

        if (offsetX < pointX + step && offsetX > pointX - step && this.menuOptions[i]) {
          this.baseContext.clearRect(0, 0, this.width, this.height);
          this.update();
          this.canvasDraw.arc({
            size: { x: pointX, y: pointY, radius: 5 },
            fill: { color: "blue" },
            border: { color: "#c4c6ff", join: "round", width: 2 },
          });
          this.drawHoverMenu(pointX, pointY, this.menuOptions[i]);
          break;
        }
      }
    }
  };

  private drawHoverMenu(pointX: number, pointY: number, options: MenuOptionItem) {
    const sizeHeight = 73;
    const sizeWidth = 200;

    let menuStartY = pointY - sizeHeight / 2;
    let menuStartX = pointX + 15;

    if (pointY + sizeHeight / 2 > this.height - 6) {
      menuStartY = this.height - (sizeHeight + 6);
    }

    if (pointY - sizeHeight / 2 < 6) {
      menuStartY = 6;
    }

    if (menuStartX + sizeWidth + 6 > this.width) {
      menuStartX = pointX - sizeWidth - 15;
    }

    this.canvasDraw.rect({
      start: { x: menuStartX, y: menuStartY },
      size: { width: sizeWidth, height: sizeHeight },
      fill: { color: "#fffffff2" },
      border: { color: "#eaeaea", join: "round", width: 2 },
    });

    this.canvasDraw.text({
      x: menuStartX + 8,
      y: menuStartY + 16,
      color: "black",
      text: options.date,
      fontSize: "13px",
    });

    this.canvasDraw.text({
      x: menuStartX + 8,
      y: menuStartY + 32,
      color: options.cash.color,
      text: options.cash.text,
      fontSize: "13px",
    });

    this.canvasDraw.text({
      x: menuStartX + 8,
      y: menuStartY + 48,
      color: options.card.color,
      text: options.card.text,
      fontSize: "13px",
    });

    this.canvasDraw.text({
      x: menuStartX + 8,
      y: menuStartY + 66,
      color: options.total.color,
      text: options.total.text,
      fontSize: "13px",
    });
  }

  public update() {
    this.fillTable();
    this.drawContent();
  }
}
