import Link from "next/link";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Input } from "@/shared/ui/input-main/Input";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";
import styles from "./ProductFormStocks.module.css";

export type RemainsItem = {
  id: number;
  name: string;
  quantity: string;
  in_stock: boolean;
};

type Props = {
  remains: RemainsItem[];
  onChangeRemains: (updateRemains: RemainsItem[]) => void;
};

export const ProductFormStocks = (props: Props) => {
  const handleChangeQuantity = (id: number, value: string) => {
    const currentRemains = props.remains.find((el) => el.id === id);

    if (currentRemains) {
      currentRemains.quantity = value;
      props.onChangeRemains([...props.remains]);
    }
  };

  const handleChangeInStock = (id: number, in_stock: boolean) => {
    const currentRemains = props.remains.find((el) => el.id === id);

    if (currentRemains) {
      currentRemains.in_stock = !in_stock;
      props.onChangeRemains([...props.remains]);
    }
  };

  return (
    <FormSection title="Остатки">
      <FormInstruction>
        {props.remains.length > 0 && <span>Введите количество остатков. </span>}
        <span>
          Чтобы добавить новый склад, перейдите на страницу{" "}
          <Link tabIndex={-1} href="/warehouses/create" className="instruction-link">
            создать склад
          </Link>
          .
        </span>
      </FormInstruction>

      <ul className={styles.pricesGrid}>
        {props.remains.map((warehouse) => (
          <li key={warehouse.id} className={styles.pricesGridItem}>
            <span>{warehouse.name}</span>
            <Input
              name={`remains_${warehouse.id}`}
              id={`remains_${warehouse.id}`}
              variant="outlined"
              variantSize="sm"
              label="Остаток"
              type="number"
              rightIcon={<CancelSvg />}
              onClickRightIcon={() => handleChangeQuantity(warehouse.id, "")}
              onChange={(e) => handleChangeQuantity(warehouse.id, e.target.value)}
              value={warehouse.quantity ?? ""}
            />
            <Checkbox
              checked={warehouse.in_stock}
              onChange={() => handleChangeInStock(warehouse.id, warehouse.in_stock)}
              labelText="В наличии без учета"
            />
          </li>
        ))}
      </ul>
    </FormSection>
  );
};
