import { Activity, type DragEvent, useRef } from "react";
import { BirdSelectIcon } from "@/views/LayoutLeftSide/NavigateMenu/svg/BirdSelectIcon";
import type { CategoryModel } from "../../action";
import styles from "./CategoryItem.module.css";
import { AddSvg } from "./svg/AddSvg";
import { DeleteSvg } from "./svg/DeleteSvg";
import { DragSvg } from "./svg/DragSvg";
import { EditSvg } from "./svg/EditSvg";

type Props = {
  category: CategoryModel;
  onOpenSubCategoryModal: (id: number, position: number) => void;
  onOpenEditModal: (id: number, name: string, description: string) => void;
  onOpenDeleteModal: (category_id: number, parent_id: number | null) => void;
  onChangeCategoryPosition: (id: number, parent_id: number | null, position: number) => void;
  activeCategories: number[];
  onToggleOpenCategory: (id: number) => void;
  search: string;
};

export const CategoryItem = (props: Props) => {
  const dragButton = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLLIElement | null>(null);

  const getNewPositionNum = (childrenLength: number) => {
    return childrenLength === 0 ? 1 : childrenLength + 1;
  };

  const resetStylesRoot = () => {
    if (rootRef.current) {
      rootRef.current.classList.remove(
        styles.hoverDragFooterLine,
        styles.hoverDragHeaderLine,
        styles.hoverDragCenter,
      );
    }
  };

  const resetStylesDragButton = () => {
    if (dragButton.current) {
      dragButton.current.classList.remove(styles.selected);
    }
  };

  const getHoverSection = (
    cursorY: number,
    currentTarget: HTMLElement,
  ): "header" | "footer" | "center" | "none" => {
    const targetElement = currentTarget.getBoundingClientRect();
    const startY = targetElement.y;
    const endY = startY + targetElement.height;
    const sizeOffset = 10;

    const isHeaderHover = cursorY >= startY && cursorY <= startY + sizeOffset;
    const isFooterHover = cursorY <= endY && cursorY >= endY - sizeOffset;
    const isCenterHover = cursorY > startY + sizeOffset && cursorY < endY - sizeOffset;

    return isHeaderHover ? "header" : isFooterHover ? "footer" : isCenterHover ? "center" : "none";
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: number) => {
    if (props.activeCategories.includes(props.category.id)) {
      props.onToggleOpenCategory(props.category.id);
    }
    event.currentTarget.classList.add(styles.selected);
    event.dataTransfer.setData("category", id.toString());
  };

  const handleDragOver = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    const dropId = parseInt(event.dataTransfer.getData("category"), 10);
    const targetId = props.category.id;
    if (dropId === targetId || !rootRef.current) return;
    const hoverSection = getHoverSection(event.clientY, event.currentTarget);

    const rootNode = rootRef.current;

    if (hoverSection === "header") {
      rootNode.classList.add(styles.hoverDragHeaderLine);
      rootNode.classList.remove(styles.hoverDragFooterLine, styles.hoverDragCenter);
    }

    if (hoverSection === "center") {
      rootNode.classList.add(styles.hoverDragCenter);
      rootNode.classList.remove(styles.hoverDragFooterLine, styles.hoverDragHeaderLine);
    }

    if (hoverSection === "footer") {
      rootNode.classList.add(styles.hoverDragFooterLine);
      rootNode.classList.remove(styles.hoverDragHeaderLine, styles.hoverDragCenter);
    }

    if (hoverSection === "none") {
      resetStylesRoot();
    }
  };

  const handleLeaveDrag = (event: DragEvent<HTMLLIElement>) => {
    event.stopPropagation();
    resetStylesRoot();
  };

  const handleDragEnd = (event: DragEvent<HTMLLIElement>) => {
    if (!dragButton.current || !rootRef.current) return;
    event.dataTransfer.setData("category", "");
    resetStylesDragButton();
    resetStylesRoot();
  };

  const handleOnDrop = (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    const dropId = parseInt(event.dataTransfer.getData("category"), 10);
    const targetId = props.category.id;
    const targetPosition = props.category.position;

    resetStylesDragButton();
    resetStylesRoot();

    if (!dropId || dropId === targetId) {
      return;
    }

    const hoverSection = getHoverSection(event.clientY, event.currentTarget);

    let parent_id = props.category.parent_id;
    let position = 1;

    if (hoverSection === "header") {
      position = targetPosition;
    }

    if (hoverSection === "center") {
      parent_id = targetId;
      position = props.category.children.length + 1;
    }

    if (hoverSection === "footer") {
      position = targetPosition + 1;
    }
    props.onChangeCategoryPosition(dropId, parent_id, position);
  };

  const isOpen = props.activeCategories.includes(props.category.id);
  const isSearchCategory =
    props.search.length > 0 && props.category.name.toLowerCase().includes(props.search);

  return (
    <>
      <li
        ref={rootRef}
        onDragEnd={handleDragEnd}
        onDrop={handleOnDrop}
        onDragLeave={handleLeaveDrag}
        onDragOver={handleDragOver}
        className={styles.categoryListItem}
      >
        <div className={styles.leftSide}>
          <button
            type="button"
            ref={dragButton}
            onDragStart={(e) => handleDragStart(e, props.category.id)}
            draggable={true}
            className={styles.dragButton}
          >
            <div className={styles.dragSvgContainer}>
              <DragSvg />
            </div>
            <p className={styles.categoryNameDrag}>{props.category.name}</p>
          </button>

          <button
            type="button"
            onClick={() => props.onToggleOpenCategory(props.category.id)}
            className={styles.leftSideCategory}
          >
            <div className={styles.arrowContainer}>
              {props.category.children.length > 0 && (
                <BirdSelectIcon
                  className={isOpen ? styles.navigateMenuItemSvgActive : styles.navigateMenuItemSvg}
                />
              )}
            </div>
            <p
              className={
                isSearchCategory
                  ? `${styles.categoryNameSearch} ${styles.categoryName}`
                  : styles.categoryName
              }
            >
              {props.category.name}
            </p>
          </button>
        </div>
        <div className={styles.actionContainer}>
          <button
            title="Добавить раздел"
            className={styles.categoryListButton}
            type="button"
            onClick={() =>
              props.onOpenSubCategoryModal(
                props.category.id,
                getNewPositionNum(props.category.children.length),
              )
            }
          >
            <AddSvg />
          </button>
          <button
            title="Редактировать"
            className={styles.categoryListButton}
            type="button"
            onClick={() =>
              props.onOpenEditModal(
                props.category.id,
                props.category.name,
                props.category.description,
              )
            }
          >
            <EditSvg />
          </button>
          <button
            title="Удалить"
            className={styles.categoryListButton}
            type="button"
            onClick={() => props.onOpenDeleteModal(props.category.id, props.category.parent_id)}
          >
            <DeleteSvg />
          </button>
        </div>
      </li>

      <Activity mode={props.category.children.length > 0 && isOpen ? "visible" : "hidden"}>
        {props.category.children.length > 0 && (
          <ul className={styles.categoryList}>
            {props.category.children.length > 0 && isOpen && (
              <div className={styles.borderLeft}></div>
            )}
            {props.category.children.map((children) => (
              <CategoryItem
                search={props.search}
                onToggleOpenCategory={props.onToggleOpenCategory}
                activeCategories={props.activeCategories}
                key={children.id}
                category={children}
                onOpenDeleteModal={props.onOpenDeleteModal}
                onOpenEditModal={props.onOpenEditModal}
                onOpenSubCategoryModal={props.onOpenSubCategoryModal}
                onChangeCategoryPosition={props.onChangeCategoryPosition}
              />
            ))}
          </ul>
        )}
      </Activity>
    </>
  );
};
