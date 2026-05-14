import Link from "next/link";
import { AddSvg } from "@/app/category/components/category-item/svg/AddSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { SearchInputQuery } from "@/shared/ui/search-input-query/SearchInputQuery";
import styles from "./TableControls.module.css";

type Props = {
  name?: string;
  queryKey?: string;
  addAction?: {
    variant?: "solid" | "outline" | "ghost" | "link";
    size?: "xs" | "sm" | "md" | "lg";
    text: string;
    href?: string;
    onClick?: () => void;
  };
  customSearchInput?: React.ReactNode;
  inputSearchLabel?: string;
};

export const TableControls = (props: Props) => {
  return (
    <section className={styles.root}>
      <div className={styles.searchInputContainer}>
        {props.customSearchInput && props.customSearchInput}
        {props.queryKey && (
          <SearchInputQuery
            inputSearchLabel={props.inputSearchLabel}
            search={props.name || ""}
            queryKey={props.queryKey}
            key={props.name}
          />
        )}
      </div>
      {props?.addAction?.href && (
        <Link href={props.addAction.href}>
          <Button
            size={props.addAction.size || "sm"}
            variant={props.addAction.variant || "outline"}
          >
            <AddSvg />
            {props.addAction.text}
          </Button>
        </Link>
      )}
      {props?.addAction?.onClick && (
        <Button
          size={props.addAction.size || "sm"}
          variant={props.addAction.variant || "outline"}
          onClick={props.addAction.onClick}
        >
          <AddSvg />
          {props.addAction.text}
        </Button>
      )}
    </section>
  );
};
