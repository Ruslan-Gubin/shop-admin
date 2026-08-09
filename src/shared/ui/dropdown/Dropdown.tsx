import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/shared/svg/ArrowIcon";
import styles from "./Dropdown.module.css";

type Props = {
  options: { value: number | string; label: string }[];
  value: number | string;
  name: string;
  id: string;
  disabled?: boolean;
  onSelectMenu: (value: number | string) => void;
  width?: number | string;
  label: string;
  onChangeValue?: (value: string) => void;
  inputValue?: string;
  menuHeight?: number;
  variant: "select" | "search";
};

export const Dropdown = (props: Props) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !componentRef.current) {
      return;
    }

    const inputNode = inputRef.current;
    const componentNode = componentRef.current;

    const focusListener = () => {
      setMenuOpen(true);
    };

    const handleCheckClickOutside = (e: MouseEvent) => {
      if (componentNode && !componentNode.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (inputNode) {
      inputNode.addEventListener("focus", focusListener);
    }
    window.document.addEventListener("click", handleCheckClickOutside);

    return () => {
      if (inputNode) {
        inputNode.removeEventListener("focus", focusListener);
      }
      window.document.removeEventListener("click", handleCheckClickOutside);
      setMenuOpen(false);
    };
  }, []);

  const handleOpenMenu = () => {
    if (!menuOpen && inputRef.current && props.variant === "search") {
      inputRef.current.focus();
    } else if (!menuOpen && props.variant === "select") {
      setMenuOpen(true);
    }
  };

  const handleSelectMenu = (value: number | string) => {
    props.onSelectMenu(value);

    setMenuOpen(false);
  };

  const isHasSelect = props.options.some((el) => el.value === props.value);

  return (
    <div
      data-width={props.width ? `${props.width}` : "100%"}
      ref={componentRef}
      className={styles.dropdown}
    >
      <button
        type="button"
        onClick={handleOpenMenu}
        className={`${styles.selectValueButton} ${menuOpen ? styles.selectValueButtonAction : ""}`}
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-disabled={props.disabled}
        aria-controls="dropdown-listbox"
      >
        <div
          className={`${styles.values} ${props.variant === "search" ? styles.valuesSearch : ""}`}
        >
          <span
            className={
              props.variant === "search" &&
              typeof props.inputValue === "string" &&
              props.inputValue.length > 0
                ? `${styles.label} ${styles.labelActive}`
                : props.variant === "select" && (isHasSelect || menuOpen)
                  ? `${styles.label} ${styles.labelActive}`
                  : styles.label
            }
          >
            {props.label}
          </span>
          {props.variant === "select" && (
            <span className={styles.selectValue}>
              {props.options.find((el) => el.value === props.value)?.label || ""}
            </span>
          )}

          {props.variant === "search" &&
            typeof props.onChangeValue === "function" &&
            typeof props.inputValue === "string" && (
              <input
                autoComplete="off"
                className={styles.input}
                name="search select input"
                ref={inputRef}
                value={props.inputValue}
                onChange={(e) =>
                  typeof props.onChangeValue === "function" && props.onChangeValue(e.target.value)
                }
              />
            )}
        </div>
        <div className={`${styles.arrowIcon} ${menuOpen ? styles.arrowIconActive : ""}`}>
          {!props.disabled && <ArrowIcon />}
        </div>
      </button>

      {menuOpen && props.options.length > 0 && (
        <ul
          data-height={props.menuHeight ? props.menuHeight : "auto"}
          className={`${styles.dropdownMenu} ${menuOpen ? styles.dropdownMenuActive : ""}`}
          style={{ top: "36px" }}
        >
          {props.options.map((option) => (
            <li key={option.value}>
              <button
                title={option.label}
                type="button"
                onClick={() => handleSelectMenu(option.value)}
                className={`${styles.dropdownMenuItemButton} ${props.value === option.value ? styles.dropdownMenuItemButtonActive : ""}`}
                disabled={props.disabled}
                aria-pressed={props.value === option.value}
              >
                <span className={styles.dropdownMenuItemButtonText}>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
