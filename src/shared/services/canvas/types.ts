import type { CanvasDraw } from "./CanvasDraw";

type FillOptions = { color?: string };
type BorderOptions = {
  color?: string;
  width?: number;
  join?: "bevel" | "round";
};
interface FillBorderOptions {
  fill?: FillOptions;
  border?: BorderOptions;
}
export interface IStraightLineOptions {
  startLine: { x: number; y: number };
  lines: number[];
  cap?: "round" | "square";
  border?: BorderOptions;
}

export interface IRectOptions extends FillBorderOptions {
  start: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface IArkOptions extends FillBorderOptions {
  size: { x: number; y: number; radius: number; start?: number; end?: number };
}

export interface IArbitraryFormsOptions extends FillBorderOptions {
  startLine: { x: number; y: number };
  lines: number[];
}

export interface ITextOptions {
  maxWidth?: number;
  fontSize?: string;
  color?: string;
  text: string;
  x: number;
  y: number;
  textAlign?: "start" | "right" | "center" | "end";
  baseline?: "bottom" | "middle" | "top";
}
export interface IImageOptions {
  image: HTMLImageElement;
  imageOptions: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sourceOptions?: {
    [key: string]: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ISelector {
  ratio: number;
  radius: number;
  color: string;
}

export interface PieChardDrawProps {
  radius: number;
  drawService: CanvasDraw;
  selectors: ISelector[];
  totalCount: number;
}

export interface CurrentListSelector {
  value: string;
  error: number;
  success: number;
  warn: number;
}

export interface DiagramMonthDrawProps {
  drawService: CanvasDraw;
  currentList: CurrentListSelector[];
  width: number;
  height: number;
}

export interface CanvasDrawGraphProps {
  baseContext: CanvasRenderingContext2D;
  colorGridLines: string;
  rowCount: number;
  maxCount: number;
  lines: number[][];
}

export type MenuOptionItem = {
  date: string;
  cash: { text: string; color: string };
  card: { text: string; color: string };
  total: { text: string; color: string };
};

export interface LineChartProps extends CanvasDrawGraphProps {
  colorsList: string[];
  menuOptions: MenuOptionItem[];
}

export interface IBezierCurvePathOptions {
  points: { x: number; y: number }[];
  fill?: FillOptions;
  border?: BorderOptions;
}
