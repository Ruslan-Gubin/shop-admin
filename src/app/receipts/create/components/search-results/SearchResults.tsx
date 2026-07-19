import { useEffect, useRef, useState } from "react";
import type { ProductModel } from "@/app/product/action";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { searchProductsByCodeAction } from "../../action";
import styles from "./SearchResults.module.css";

type Props = {
  search: string;
  onChangeSearch: (value: string) => void;
  onSelect: (product: ProductModel) => void;
  onCreateNew: () => void;
};

export const SearchResults = (props: Props) => {
  const [searchResults, setSearchResults] = useState<ProductModel[]>([]);
  const [isActiveSearchList, setIsActiveSearchList] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const debounceFn = useDebounce();

  const isCodeQuery = /^\d+$/.test(props.search);

  const selectedProduct = (product: ProductModel) => {
    setSearchResults([]);
    setIsActiveSearchList(false);
    props.onSelect(product);
  };

  const fetchResult = (value: string) => {
    searchProductsByCodeAction(value).then((response) => {
      if (response.status === "success" && response.data) {
        const isExactCodeMatch =
          /^\d+$/.test(value) && response.data.length === 1 && response.data[0].code === value;

        if (isExactCodeMatch) {
          setSearchResults([]);
          selectedProduct(response.data[0]);
        } else {
          setSearchResults(response.data);
        }
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleSearch = (value: string) => {
    props.onChangeSearch(value);
    setIsActiveSearchList(true);

    if (value.length > 2) {
      debounceFn(() => fetchResult(value));
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsActiveSearchList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetInput = () => {
    props.onChangeSearch("");
    setIsActiveSearchList(false);
    setSearchResults([]);
  };

  const handleCreate = () => {
    props.onCreateNew();
    setSearchResults([]);
    setIsActiveSearchList(false);
  };

  return (
    <div ref={searchRef} className={styles.searchField}>
      <Input
        name="search"
        id="income-search"
        variant="outlined"
        variantSize="sm"
        placeholder="Штрихкод или название товара"
        label="Штрихкод или название товара"
        type="text"
        value={props.search}
        onChange={(e) => handleSearch(e.target.value)}
        rightIcon={<CancelSvg />}
        onClickRightIcon={handleResetInput}
        onFocus={() => setIsActiveSearchList(true)}
        autoComplete="off"
      />
      {isActiveSearchList &&
        props.search.length > 2 &&
        (searchResults.length > 0 || !isCodeQuery) && (
          <ul className={styles.searchResultsList}>
            {searchResults.length > 0 &&
              searchResults.map((product) => (
                <li key={product.id} className={styles.searchResultItem}>
                  <button
                    type="button"
                    className={styles.searchResultButton}
                    onClick={() => selectedProduct(product)}
                  >
                    <span className={styles.searchResultIndicator} />
                    <span className={styles.searchResultName}>{product.name}</span>
                    <span className={styles.searchResultCode}>{product.code}</span>
                  </button>
                </li>
              ))}
            {!isCodeQuery && (
              <li className={styles.searchResultItem}>
                <button type="button" className={styles.searchResultButton} onClick={handleCreate}>
                  <span className={styles.searchResultCreate}>
                    +{props.search ? ` «${props.search}»` : ""}
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
    </div>
  );
};
