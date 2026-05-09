import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormStocks.module.css";

type Props = {
  warehouses: { id: number; name: string }[];
  initialRemains: Record<string, string>;
};

export const ProductFormStocks = (props: Props) => {
  const [stocks, setStocks] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    setStocks(props.initialRemains);
  }, []);

  const handleChangeStock = (id: number, value: string) => {
    setStocks((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <FormSection title="Остатки">
      <FormInstruction>
        {props.warehouses.length > 0 && <span>Введите количество остатков. </span>}
        <span>
          Чтобы добавить новый склад, перейдите на страницу{" "}
          <Link tabIndex={-1} href="/warehouses/create" className={styles.instructionLink}>
            создать склад
          </Link>
          .
        </span>
      </FormInstruction>

      <ul className={styles.pricesGrid}>
        {props.warehouses.map((warehouse) => (
          <li key={warehouse.id}>
            <Input
              name={`remains_${warehouse.name}`}
              id={`remains_${warehouse.id}`}
              variant="outlined"
              variantSize="sm"
              placeholder={warehouse.name}
              label={warehouse.name}
              type="number"
              rightIcon={<CancelSvg />}
              onClickRightIcon={() => handleChangeStock(warehouse.id, "")}
              onChange={(e) => handleChangeStock(warehouse.id, e.target.value)}
              value={stocks[warehouse.id] ?? ""}
            />
          </li>
        ))}
      </ul>
    </FormSection>
  );
};
