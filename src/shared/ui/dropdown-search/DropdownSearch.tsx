import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/shared/svg/ArrowIcon";
import styles from "./DropdownSearch.module.css";

type Props = {
  options: { value: number; label: string }[];
  value: number | null;
  width?: number | string;
  menuHeight?: number;
  placeholder: string;
  disabled?: boolean;
  onChangeValue: (value: string) => void;
  inputValue: string;
  onSelectMenu: (value: number) => void;
};

export const DropdownSearch = ({
  options,
  placeholder,
  value,
  disabled,
  menuHeight,
  width,
  onChangeValue,
  inputValue,
  onSelectMenu,
}: Props) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !inputRef.current || !componentRef.current) {
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

    inputNode.addEventListener("focus", focusListener);
    window.document.addEventListener("click", handleCheckClickOutside);

    return () => {
      inputNode.removeEventListener("focus", focusListener);
      window.document.removeEventListener("click", handleCheckClickOutside);
      setMenuOpen(false);
    };
  }, []);

  const handleOpenMenu = () => {
    if (!menuOpen && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectMenu = (value: number) => {
    onSelectMenu(value);
    setMenuOpen(false);
  };

  return (
    <div data-width={width ? `${width}` : "100%"} ref={componentRef} className={styles.dropdown}>
      <button
        type="button"
        onClick={handleOpenMenu}
        className={`${styles.selectValueButton} ${menuOpen ? styles.selectValueButtonAction : ""}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={menuOpen}
        aria-disabled={disabled}
        aria-controls="dropdown-listbox"
      >
        <div className={styles.values}>
          <span
            className={
              inputValue.length > 0 ? `${styles.label} ${styles.labelActive}` : styles.label
            }
          >
            {placeholder}
          </span>
          <input
            autoComplete="off"
            className={styles.input}
            name="search address input"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onChangeValue(e.target.value)}
          />
        </div>
        <div className={`${styles.arrowIcon} ${menuOpen ? styles.arrowIconActive : ""}`}>
          {!disabled && <ArrowIcon />}
        </div>
      </button>

      {menuOpen && options.length > 0 && (
        <ul
          data-height={menuHeight ? menuHeight : "auto"}
          className={`${styles.dropdownMenu} ${menuOpen ? styles.dropdownMenuActive : ""}`}
          style={{ top: "36px" }}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                title={option.label}
                type="button"
                onClick={() => handleSelectMenu(option.value)}
                className={`${styles.dropdownMenuItemButton} ${value === option.value ? styles.dropdownMenuItemButtonActive : ""}`}
                disabled={disabled}
                aria-pressed={value === option.value}
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
