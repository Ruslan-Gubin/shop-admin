import { DrawService } from "./DrawService";
import type {
  IArbitraryFormsOptions,
  IArkOptions,
  IBezierCurvePathOptions,
  IImageOptions,
  IRectOptions,
  IStraightLineOptions,
  ITextOptions,
} from "./types";

export class CanvasDraw {
  private readonly context;
  private readonly drawService;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
    this.drawService = new DrawService(context);
  }

  /** прямая линия, если указать больше значений в lines будет продолжение */
  public straightLine(options: IStraightLineOptions) {
    const { lines, startLine, cap, border } = options;

    this.context.beginPath();
    this.context.moveTo(startLine.x, startLine.y);

    for (let i = 1; i < lines.length; i++) {
      if (i % 2 === 0) continue;
      this.context.lineTo(lines[i - 1], lines[i]);
    }

    this.context.lineCap = cap ? cap : "butt";
    this.drawService.checkBorder(border);
  }

  /** прямая линия, если указать больше значений в lines будет продолжение */
  public dashedLine(options: IStraightLineOptions) {
    const { lines, startLine, cap, border } = options;

    this.context.beginPath();
    this.context.setLineDash([5, 5]);
    this.context.moveTo(startLine.x, startLine.y);
    this.context.lineTo(lines[0], lines[1]);
    this.context.lineCap = cap ? cap : "butt";
    this.drawService.checkBorder(border);
    this.context.stroke();
    this.context.setLineDash([]);
  }

  /** прямоугольник */
  public rect(options: IRectOptions) {
    const { start, size, fill, border } = options;
    if (!fill && !border) return;

    this.context.beginPath();
    this.context.rect(start.x, start.y, size.width, size.height);

    this.drawService.checkFill(fill);
    this.drawService.checkBorder(border);
  }

  /** арка/круг size.start = -Math.PI / 4, size.start = Math.PI / 4, */
  public arc(options: IArkOptions) {
    const { size, border, fill } = options;

    this.context.beginPath();
    this.context.arc(
      size.x,
      size.y,
      size.radius,
      size.start ? this.drawService.degreesToRadians(size.start) : 0,
      size.end ? this.drawService.degreesToRadians(size.end) : Math.PI * 2,
    );

    this.drawService.checkFill(fill);
    this.drawService.checkBorder(border);
  }

  /** Сектор  */
  public drawSelectors(options: IArkOptions) {
    const { size, border, fill } = options;

    this.context.beginPath();
    this.context.moveTo(size.x, size.y);
    this.context.arc(
      size.x,
      size.y,
      size.radius,
      size.start ? this.drawService.degreesToRadians(size.start) : 0,
      size.end ? this.drawService.degreesToRadians(size.end) : Math.PI * 2,
    );

    this.drawService.checkFill(fill);
    this.drawService.checkBorder(border);
  }

  /** Кривые Безье продолжительная линия */
  bezierCurvePath(options: IBezierCurvePathOptions) {
    const { points, fill, border } = options;
    if (points.length === 0) return;

    this.context.beginPath();
    this.context.moveTo(points[0].x, points[0].y);

    let i = 1;

    while (i < points.length) {
      const prevX = points[i - 1].x;
      const currX = points[i].x;
      const midX = prevX + (currX - prevX) / 2;

      this.context.bezierCurveTo(midX, points[i - 1].y, midX, points[i].y, currX, points[i].y);
      i++;
    }
    if (fill) {
      this.drawService.checkFill(fill);
    }
    this.drawService.checkBorder(border);
  }

  /** Произвольные формы */
  arbitraryForms(options: IArbitraryFormsOptions) {
    const { lines, startLine, border, fill } = options;

    this.context.beginPath();
    this.context.moveTo(startLine.x, startLine.y);

    for (let i = 1; i < lines.length; i++) {
      if (i % 2 === 0) continue;
      this.context.lineTo(lines[i - 1], lines[i]);
    }

    this.context.closePath();

    this.drawService.checkFill(fill);
    this.drawService.checkBorder(border);
  }

  /** Текст */
  text(options: ITextOptions) {
    const {
      maxWidth,
      fontSize = "1.2rem",
      color = "black",
      text,
      x,
      y,
      textAlign = "left",
      baseline = "alphabetic",
    } = options;

    this.context.font = `${fontSize} sans-serif`;
    this.context.textAlign = textAlign;
    this.context.textBaseline = baseline;
    this.context.fillStyle = color;
    this.context.fillText(text, x, y, maxWidth);
  }

  /** Изображение */
  image(options: IImageOptions) {
    const { image, imageOptions, sourceOptions } = options;
    const { width, height } = image;

    const sourceParams: { [key: string]: number } = {
      x: 0,
      y: 0,
      width: Number(width),
      height: Number(height),
    };

    if (sourceOptions) {
      for (const value in sourceOptions) {
        sourceParams[value] = sourceOptions[value];
      }
    }

    this.context.drawImage(
      image,
      sourceParams.x,
      sourceParams.y,
      sourceParams.width,
      sourceParams.height,
      imageOptions.x,
      imageOptions.y,
      imageOptions.width,
      imageOptions.height,
    );
  }
}
