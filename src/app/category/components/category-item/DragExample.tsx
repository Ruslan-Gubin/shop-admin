// import { useEffect, useRef, useState } from "react";
// import cn from "classnames";
// import { SectionProgressLine } from "../SectionProgressLine/SectionProgressLine";
// import DragCarImage from "@assets/images/lessons/Lesson1/CardDragCar.png";
// import type { ComponentType, DragEventHandler, FC } from "react";
// import type { RoadSectionSvgProps, RoadSectorModel } from "../../types";
// import errorBackground from '@assets/images/error-background.png';

import styles from "./RoadSection.module.scss";

type RoadSectionProps = {
  section: RoadSectorModel;
  opacity: boolean;
  svg: ComponentType<RoadSectionSvgProps>;
  className?: string;
  classContent?: string;
  startDraggable: (id: number | null) => void;
  onDragDrop: (dragId: number | null, dropId: number | null) => void;
  dragSection: number | null;
  changeTouchPosition: (x: number, y: number) => void;
  touchPosition: { x: number; y: number };
  isStopedDraggable: boolean;
};

let count = 0;

const RoadSection: FC<RoadSectionProps> = (props) => {
  const {
    section,
    opacity,
    className,
    classContent,
    svg: SvgComponent,
    startDraggable,
    onDragDrop,
    dragSection,
    changeTouchPosition,
    touchPosition,
    isStopedDraggable,
  } = props;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [targetDrop, setTargetDrop] = useState<number | null>(null);
  const [isDragStart, setIsDragStart] = useState<boolean>(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const node = sectionRef.current;

    const { top, left, height, width } = node.getClientRects()[0];
    const { y, x } = touchPosition;
    if (y < top || y > top + height || x < left || x > left + width) {
      if (dragSection === section.id) {
        startDraggable(null);
      }
      return;
    } else {
      startDraggable(section.id);
    }
  }, [touchPosition]);

  const handleStartDrag: DragEventHandler<HTMLElement> = () => {
    if (!section.isDraggable) return;
    startDraggable(section.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!section.isDraggable) return;
    setTargetDrop(section.id);
  };

  const handleLeaveDrag: DragEventHandler<HTMLElement> = (e) => {
    if (!section.isDraggable) return;
    e.stopPropagation();
    const isSectionLeave =
      e.relatedTarget && !sectionRef.current?.contains(e.relatedTarget as Node);
    if (isSectionLeave) {
      setTargetDrop(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!section.isDraggable) return;
    e.preventDefault();

    if (targetDrop !== null) {
      onDragDrop(dragSection, targetDrop);
    }

    setTargetDrop(null);
  };

  const handleEndDraggable = () => {
    setTargetDrop(null);
    startDraggable(null);
  };

  // const handleTouchStart: React.TouchEventHandler<HTMLElement> = (e) => {
  //   if (!isStopedDraggable) return;
  //   const { clientX, clientY } = e.nativeEvent.touches[0];
  //   changeTouchPosition(clientX, clientY);
  //   startDraggable(section.id);
  //   setIsDragStart(true);
  // };

  const handleTouchEnd = () => {
    onDragDrop(section.id, dragSection);
    setTargetDrop(null);
    startDraggable(null);
    setIsDragStart(false);
    changeTouchPosition(-1000, -1000);
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!section.isDraggable || !isDragStart) return;
    const { clientY, clientX } = e.touches[0];

    if (count % 2 === 0) {
      changeTouchPosition(clientX, clientY);
    }
    count++;
    if (count === 1000) {
      count = 0;
    }
  };

  const isDragEnter =
    typeof window !== "undefined" &&
    typeof targetDrop === "number" &&
    section.isDraggable &&
    Number(targetDrop) === section.id &&
    typeof dragSection === "number" &&
    Number(dragSection) !== section.id;

  const indicatorStatus =
    section.carCount < section.standartCountCar
      ? "error"
      : section.carCount > section.standartCountCar
        ? "warn"
        : "success";

  const carsInedexes = new Array(section.carCount)
    .fill(1)
    .map((_, index) => index + 1)
    .reverse();

  return (
    <section
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => console.log("cancel")}
      onDragLeave={handleLeaveDrag}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={sectionRef}
      className={cn(styles.root, className, opacity && styles.opacityContainer)}
    >
      <SvgComponent
        className={styles.sectionBackgroundSvg}
        isViolet={indicatorStatus === "error"}
        isDragEnter={isDragEnter}
      />

      <div className={cn(styles.content, classContent)}>
        {section.showProggress && (
          <SectionProgressLine
            carCount={section.carCount}
            standartCountCar={section.standartCountCar}
            indicator={indicatorStatus}
            isOpacity={section.isOpacity}
          />
        )}
        {section.showCars && (
          <ul className={styles.carList}>
            {new Array(section.carCount)
              .fill(1)
              .slice(0, 3)
              .map((_, index) => (
                <li
                  className={cn(
                    styles.carListItem,
                    section.isDraggable && isStopedDraggable && styles.carListItemCursor,
                    dragSection === section.id && index === 0 && styles.carListItemOpacity,
                  )}
                  key={`${section.id}${index}`}
                  style={{
                    transform: `translateY(${3 * index}px)`,
                    zIndex: carsInedexes[index],
                  }}
                >
                  <img
                    onDragStart={handleStartDrag}
                    onDragEnd={handleEndDraggable}
                    draggable={section.isDraggable && isStopedDraggable}
                    onTouchStart={handleTouchStart}
                    src={DragCarImage}
                    alt="Drag card car"
                    className={styles.carItemImage}
                    onError={(e) => (e.currentTarget.src = errorBackground)}
                  />
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export { RoadSection };
