"use client";
import { useState, useTransition } from "react";
import type { PriceTypeModel } from "@/app/price-types/action";
import { notificationAdapter } from "@/stores/notification/adapter";
import { EditableTable, type EditableTableDataItem } from "@/widgets/editable-table/EditableTable";
import { EditableTableMobile } from "@/widgets/editable-table-mobile/EditableTableMobile";
import { ModalDelete } from "@/widgets/modals/modal-delete/ModalDelete";
import { TableControls } from "@/widgets/table-controls/TableControls";
import type { CreateRangeFormFields, PriceFillModel, RangeModel } from "../../action";
import { ModalRangeForm } from "../modal-range-form/ModalRangeForm";

type Props = {
  priceTypes: PriceTypeModel[];
  ranges: RangeModel[];
  priceFill: PriceFillModel[];
  range: string;
  createRangeAction: (
    prevState: CreateRangeFormFields,
    formData: FormData,
  ) => Promise<CreateRangeFormFields>;
  updateRangeAction: (
    prevState: CreateRangeFormFields,
    formData: FormData,
  ) => Promise<CreateRangeFormFields>;
  deleteRangeAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
  createPriceFillAction: (
    price_range_id: number,
    price_type_id: number,
    percent: number,
  ) => Promise<{ status: "error" | "success"; message: string }>;
  updatePriceFillAction: (
    id: number,
    percent: number,
  ) => Promise<{ status: "error" | "success"; message: string }>;
  deletePriceFillAction: (id: number) => Promise<{ status: "error" | "success"; message: string }>;
};

export const PriceAutoFillTableWrapper = (props: Props) => {
  const [submitLoading, transition] = useTransition();
  const [optionFormModal, setOptionFormModal] = useState<{
    id: number | null;
    isOpen: boolean;
    price_from: string;
    price_to: string;
    isDelete: boolean;
  }>({
    id: null,
    isOpen: false,
    price_from: "",
    price_to: "",
    isDelete: false,
  });

  const handleOpenEditModal = (id: number) => {
    const findRange = props.ranges.find((el) => el.id === id);
    if (findRange) {
      setOptionFormModal({
        id: findRange.id,
        isOpen: true,
        price_from: String(findRange.price_from),
        price_to: String(findRange.price_to),
        isDelete: false,
      });
    }
  };

  const handleOpenMainModal = () => {
    setOptionFormModal({
      id: null,
      isOpen: true,
      price_from: "",
      price_to: "",
      isDelete: false,
    });
  };

  const handleOpenDeleteModal = (id: number) =>
    setOptionFormModal({
      id,
      isOpen: true,
      price_from: "",
      price_to: "",
      isDelete: true,
    });

  const handleCloseFormModal = () =>
    setOptionFormModal({
      id: null,
      isOpen: false,
      price_from: "",
      price_to: "",
      isDelete: false,
    });

  const submitDelete = () => {
    if (optionFormModal.isDelete && optionFormModal.isOpen) {
      transition(() => {
        if (optionFormModal.id) {
          props.deleteRangeAction(optionFormModal.id).then((res) => {
            notificationAdapter.add(res.message, res.status);
            handleCloseFormModal();
          });
        }
      });
    }
  };

  const isEditModal =
    optionFormModal.price_from.length > 0 && typeof optionFormModal.id === "number";
  const modalTitle = isEditModal ? "Редактировать диапазон" : "Добавить диапазон";
  const submitButtonText = isEditModal ? "Редактировать" : "Добавить";
  const onSubmitAction = isEditModal ? props.updateRangeAction : props.createRangeAction;

  const onBlurInputAction = (rowId: number, columnId: number, percent: string) => {
    if (!rowId || !columnId) return;
    const numberPercent = Number(percent);
    const findPriceFill = props.priceFill.find(
      (el) => el.price_range_id === rowId && el.price_type_id === columnId,
    );
    const isCreate = !findPriceFill && numberPercent > 0;
    const isEdit =
      findPriceFill &&
      findPriceFill.price_range_id === rowId &&
      findPriceFill.price_type_id === columnId &&
      numberPercent !== findPriceFill.percent;
    const isDelete = findPriceFill && percent === "";

    transition(() => {
      if (isDelete) {
        props.deletePriceFillAction(findPriceFill.id).then((res) => {
          notificationAdapter.add(res.message, res.status);
        });
      } else if (isEdit) {
        props.updatePriceFillAction(findPriceFill.id, numberPercent).then((res) => {
          notificationAdapter.add(res.message, res.status);
        });
      } else if (isCreate) {
        props.createPriceFillAction(rowId, columnId, numberPercent).then((res) => {
          notificationAdapter.add(res.message, res.status);
        });
      }
    });
  };

  const generateTableData = (ranges: RangeModel[], priceTypes: PriceTypeModel[]) => {
    const data: EditableTableDataItem[][] = [];

    for (let i = 0; i < ranges.length; i++) {
      const currentRange = props.ranges[i];
      const rangeFrom = currentRange.price_from;
      const rangeTo = currentRange.price_to;

      const rowArray: EditableTableDataItem[] = [];
      rowArray.push(
        {
          value: `${rangeFrom} - ${rangeTo}`,
          type: "label",
          rowId: currentRange.id,
          columnId: null,
        },
        {
          value: "",
          type: "action",
          rowId: currentRange.id,
          columnId: null,
        },
      );

      for (let j = 0; j < priceTypes.length; j++) {
        const currentType = props.priceTypes[j];
        const findPriceFill = props.priceFill.find(
          (el) => el.price_range_id === currentRange.id && el.price_type_id === currentType.id,
        );

        rowArray.push({
          value: findPriceFill ? String(findPriceFill.percent) : "",
          type: "input",
          rowId: currentRange.id,
          columnId: currentType.id,
        });
      }

      data.push(rowArray);
    }

    return data;
  };

  const filteredPriceTypes = props.priceTypes.filter((el) => el.isPublic);
  const priceTypesLabels = filteredPriceTypes.map((el) => el.name);
  const tableData = generateTableData(props.ranges, filteredPriceTypes);
  const headerRowLabels = ["Диапазон", "", ...priceTypesLabels];

  const gridTemplateColumns = [
    "200px",
    "58px",
    ...priceTypesLabels.map(() => "minmax(160px, 200px)"),
  ].join(" ");

  return (
    <>
      {optionFormModal.isOpen && !optionFormModal.isDelete && (
        <ModalRangeForm
          isOpen={optionFormModal.isOpen}
          onCloseModal={handleCloseFormModal}
          onSubmitAction={onSubmitAction}
          title={modalTitle}
          submitButtonText={submitButtonText}
          initValue={{
            price_from: optionFormModal.price_from,
            price_to: optionFormModal.price_to,
            id: optionFormModal.id,
          }}
        />
      )}
      <ModalDelete
        submit={submitDelete}
        title="Действительно хотите удалить диапазон?"
        isOpen={optionFormModal.isOpen && optionFormModal.isDelete}
        onClose={handleCloseFormModal}
        disabled={submitLoading}
        showSubTitle={true}
      />

      <div className="table-container">
        <TableControls
          addAction={{
            text: "Добавить диапазон",
            onClick: handleOpenMainModal,
          }}
          name={props.range}
          queryKey="range"
        />
        {props.ranges && props.ranges.length > 0 && (
          <>
            <div className="desktop-table">
              <EditableTable
                data={tableData}
                onBlurInputAction={onBlurInputAction}
                onEditAction={handleOpenEditModal}
                onDeleteAction={handleOpenDeleteModal}
                headerRowLabels={headerRowLabels}
                variant="stickyFirstColumn"
                gridTemplateColumns={gridTemplateColumns}
              />
            </div>
            <div className="mobile-table">
              <EditableTableMobile
                data={tableData}
                onBlurInputAction={onBlurInputAction}
                onEditAction={handleOpenEditModal}
                onDeleteAction={handleOpenDeleteModal}
                headerRowLabels={headerRowLabels}
                label={headerRowLabels[0]}
                labelValueIndex={0}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
