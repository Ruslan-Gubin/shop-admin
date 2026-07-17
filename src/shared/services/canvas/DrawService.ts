export class DrawService {
  private readonly context;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  /** Превращаем меридиану в градусы если наоборот return (n / Math.PI) * 180 */
  public degreesToRadians(n: number) {
    return (n / 180) * Math.PI;
  }

  /** Проверяем опции заливки */
  public checkFill(fill: { color?: string } | undefined) {
    if (!fill) return;
    this.context.fillStyle = fill.color ? fill.color : "";
    this.context.fill();
  }
  /** Проверяем опции границы */
  public checkBorder(
    border: { color?: string; width?: number; join?: "bevel" | "round" } | undefined,
  ) {
    this.context.strokeStyle = border?.color ? border.color : "black";
    this.context.lineWidth = border?.width ? border.width : 0;
    this.context.lineJoin = border?.join ? border.join : "miter";
    this.context.stroke();
  }
}
