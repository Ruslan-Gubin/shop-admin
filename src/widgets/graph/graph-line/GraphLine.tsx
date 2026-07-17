"use client";
import { useEffect, useRef } from "react";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { LineChart } from "@/shared/services/canvas/LineChart";
import type { MenuOptionItem } from "@/shared/services/canvas/types";
import style from "./GraphLine.module.css";

type Props = {
  statisticLines: number[][];
  colorsList: string[];
  menuOptions: MenuOptionItem[];
};

export const GraphLine = ({ statisticLines, colorsList, menuOptions }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { windowSize } = useWindowSize();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasRef.current || !windowSize.width) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 189;

    const getMaxNumber = (numbers: number[]) => (numbers.length > 0 ? Math.max(...numbers) : 0);

    const maxCount = getMaxNumber(statisticLines.flat()); // 58510
    const rowCount = statisticLines[0].length > 0 ? statisticLines[0].length - 1 : 0;

    const drawLineGraph = new LineChart({
      menuOptions,
      baseContext: context,
      colorGridLines: "#DEE1E6",
      rowCount,
      maxCount,
      lines: statisticLines,
      colorsList,
    });

    const mouseMoveListener = drawLineGraph.mouseMoveListener;
    const mouseLeaveListener = drawLineGraph.mouseLeaveListener;
    const mouseEnterListener = drawLineGraph.mouseEnterListener;

    const render = () => drawLineGraph.update();

    const animate = requestAnimationFrame(render);

    canvas.addEventListener("mousemove", mouseMoveListener);
    canvas.addEventListener("mouseleave", mouseLeaveListener);
    canvas.addEventListener("mouseenter", mouseEnterListener);

    return () => {
      cancelAnimationFrame(animate);
      canvas.removeEventListener("mousemove", mouseMoveListener);
      canvas.removeEventListener("mouseleave", mouseLeaveListener);
      canvas.removeEventListener("mouseenter", mouseEnterListener);
    };
  }, [colorsList, statisticLines, windowSize, menuOptions]);

  return <canvas className={style.root} ref={canvasRef}></canvas>;
};
