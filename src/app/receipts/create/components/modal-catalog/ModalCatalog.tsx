import type { CategoryModel } from "@/app/category/action";
import type { ProductModel } from "@/app/product/action";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalBody } from "@/shared/ui/modal/modal-body/ModalBody";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";
import { CatalogCategoryList } from "../catalog-category-list/CatalogCategoryList";
import styles from "./ModalCatalog.module.css";

type Props = {
  categories: CategoryModel[];
  onSelectProduct: (product: ProductModel) => void;
  onClose: () => void;
};

export const ModalCatalog = (props: Props) => {
  return (
    <Modal active={true} handleCloseAction={props.onClose} classContainer={styles.wideModal}>
      <ModalContent>
        <ModalHeader title="Каталог товаров" onClose={props.onClose} />
        <ModalBody>
          <CatalogCategoryList
            categories={props.categories}
            onSelectProduct={props.onSelectProduct}
          />
        </ModalBody>
        <div></div>
      </ModalContent>
    </Modal>
  );
};
