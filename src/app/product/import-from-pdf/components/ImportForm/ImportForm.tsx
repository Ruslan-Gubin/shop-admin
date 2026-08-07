"use client";
import { useRef, useState, useTransition } from "react";
import type { ImportPdfItem } from "@/shared/helpers/parse-catalog";
import { Button } from "@/shared/ui/button-main/Button";
import { notificationAdapter } from "@/stores/notification/adapter";
import { generateProductAction } from "@/app/product/action";
import { addProductAction, type CheckItemStatus, checkBarcodeAction, uploadAndParsePdfAction } from "../../action";
import { ImportTableActions } from "../ImportTableActions/ImportTableActions";
import styles from "./ImportForm.module.css";

const gridColumns = "minmax(200px, 1fr) 120px minmax(120px, 150px) 165px";

export const ImportForm = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [pdfItems, setPdfItems] = useState<ImportPdfItem[]>([]);
  const [statuses, setStatuses] = useState<
    Record<string, { status: CheckItemStatus; error_message: string; product_id: number | null }>
  >({});
  const [parseLoading, parseTransition] = useTransition();
  const [generateLoading, setGenerateLoading] = useState<boolean>(false);
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [processMap, setProcessMap] = useState<Record<string, number>>({});

  const handleFileChange = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      notificationAdapter.add("Файл не найден", "error");
      return;
    }

    parseTransition(() => {
      uploadAndParsePdfAction(file).then(async (fileItems) => {
        const chunkSize = 500;

        const statuses: Record<string, { status: CheckItemStatus; error_message: string; product_id: number | null }> =
          {};
        let isError = false;

        for (let i = 0; i < fileItems.length; i += chunkSize) {
          if (isError) break;

          const chunk = fileItems.slice(i, i + chunkSize);

          await checkBarcodeAction(chunk).then((response) => {
            if (response.status === "success" && response.data) {
              for (const key in response.data) {
                statuses[key] = response.data[key];
              }
            } else if (response.status === "error" && response.message) {
              notificationAdapter.add(response.message, response.status);
              isError = true;
              return;
            }
          });
        }

        if (!isError) {
          setStatuses(statuses);
          setPdfItems(fileItems);
          setFileName(file.name);
        }
      });
    });
  };

  const handleGenerate = (id: number) => {
    setProcessMap({ [id]: 1 });
    const item = pdfItems.find((el) => el.id === id);

    if (!item) {
      return notificationAdapter.add("Не удалось получить данные о товаре из файла", "error");
    }

    if (!item.barcode) {
      return notificationAdapter.add("Отсутствует штрих-код", "error");
    }

    generateProductAction(item.name || "", item.barcode)
      .then((response) => {
        let message = response.message;
        let status = response.status;

        if (response.status === "success" && response.data) {
          setStatuses((prev) => ({
            ...prev,
            [id]: {
              status: response.data?.clear_name && response.data?.product ? "record" : "error",
              error_message:
                response.data?.clear_name && response.data?.product
                  ? ""
                  : response?.data?.error_message
                    ? response.data.error_message
                    : "Нет полного описания",
              product_id: null,
            },
          }));

          if (response?.data?.error_message && typeof response?.data?.error_message === "string") {
            message = response?.data?.error_message;
            status = "error";
          }
        }
        notificationAdapter.add(message, status);
      })
      .finally(() => {
        setProcessMap({});
      });
  };

  const handleAdd = (id: number) => {
    setProcessMap({ [id]: 1 });

    const item = pdfItems.find((el) => el.id === id);

    if (!item) {
      return notificationAdapter.add("Не удалось получить данные о товаре из файла", "error");
    }

    if (!item.barcode) {
      return notificationAdapter.add("Отсутствует штрих-код", "error");
    }

    const currentPrice = !Number.isNaN(Number(item.price)) ? Math.ceil(Number(item.price)) : 0;

    addProductAction(item.barcode, currentPrice)
      .then((response) => {
        const message = response.message;
        const status = response.status;

        setStatuses((prev) => ({
          ...prev,
          [id]: {
            status: response.status === "success" ? "completed" : "record",
            error_message:
              response.status === "error"
                ? `${response.message && typeof response.message === "string" ? response.message : "Не удалось создать товар"}`
                : "",
            product_id: response.data ? response.data.id : null,
          },
        }));

        notificationAdapter.add(message, status);
      })
      .finally(() => {
        setProcessMap({});
      });
  };

  const handleGenerateAll = async () => {
    setGenerateLoading(true);

    for (let i = 0; i < pdfItems.length; i++) {
      const item = pdfItems[i];
      const status = statuses[i];

      if (item.barcode && status.status === "empty") {
        setProcessMap({ [item.id]: 1 });
        await generateProductAction(item.name || "", item.barcode)
          .then((response) => {
            let message = response.message;
            let status = response.status;

            if (response.status === "success" && response.data) {
              setStatuses((prev) => ({
                ...prev,
                [item.id]: {
                  status: response.data?.clear_name && response.data?.product ? "record" : "error",
                  error_message: response.data?.clear_name && response.data?.product ? "" : "Нет полного описания",
                  product_id: null,
                },
              }));

              if (!response?.data?.product) {
                message = "Не удалось сгенерировать описание для данного товара";
                status = "error";
              }
            }
            notificationAdapter.add(message, status);
          })
          .catch((error) => {
            notificationAdapter.add(error, "error");
          })
          .finally(() => {
            setProcessMap({});
          });
      }
      if (generateLoading) {
        setGenerateLoading(false);
      }
    }
  };

  const handleAddAll = async () => {
    setAddLoading(true);

    for (let i = 0; i < pdfItems.length; i++) {
      const item = pdfItems[i];
      const status = statuses[item.id];

      if (item.barcode && status?.status === "record") {
        setProcessMap({ [item.id]: 1 });

        const currentPrice = !Number.isNaN(Number(item.price)) ? Math.ceil(Number(item.price)) : 0;

        await addProductAction(item.barcode, currentPrice)
          .then((response) => {
            const message = response.message;
            const resStatus = response.status;

            setStatuses((prev) => ({
              ...prev,
              [item.id]: {
                status: response.status === "success" ? "completed" : "record",
                error_message:
                  response.status === "error"
                    ? `${response.message && typeof response.message === "string" ? response.message : "Не удалось создать товар"}`
                    : "",
                product_id: response.data ? response.data.id : null,
              },
            }));

            notificationAdapter.add(message, resStatus);
          })
          .catch((error) => {
            notificationAdapter.add(error, "error");
          })
          .finally(() => {
            setProcessMap({});
          });
      }
    }

    setAddLoading(false);
  };

  const getNeedGenerateCount = () => {
    let needGenerate = 0;
    let needAdd = 0;
    let completed = 0;
    let notBarcode = 0;
    let error = 0;

    for (const key in statuses) {
      const status = statuses[key].status;
      const hasBarcode = pdfItems[Number(key)]?.barcode?.length > 0;
      if (!hasBarcode) {
        notBarcode++;
      }

      if (status === "record" && hasBarcode) {
        needAdd++;
      } else if (status === "empty" && hasBarcode) {
        needGenerate++;
      } else if (status === "completed") {
        completed++;
      } else if (status === "error") {
        error++;
      }
    }

    return { needGenerate, needAdd, completed, notBarcode, error };
  };

  const counts = getNeedGenerateCount();

  const getIsProcess = (processMap: Record<string, number>) => {
    let hasProcess = false;

    for (const key in processMap) {
      if (processMap[key]) {
        hasProcess = true;
        break;
      }
    }

    return hasProcess;
  };

  const isHasProcess = getIsProcess(processMap);

  return (
    <section className={styles.section}>
      <div className={styles.uploadArea}>
        <label className={`${styles.fileLabel} ${parseLoading || isHasProcess ? styles.fileLabelDisabled : ""}`}>
          {parseLoading ? (
            <>
              <span className="spinner" />
              Формируем PDF…
            </>
          ) : (
            "Выбрать PDF"
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className={styles.fileInput}
            onChange={handleFileChange}
            disabled={parseLoading || isHasProcess}
          />
        </label>
        {fileName && <span className={styles.fileName}>{fileName}</span>}
      </div>

      {pdfItems.length > 0 && (
        <>
          <div className={styles.massActions}>
            {counts.needGenerate > 0 && (
              <Button variantColor="blue" size="sm" disabled={isHasProcess} onClick={handleGenerateAll}>
                {generateLoading && <div className="spinner" />}
                {generateLoading ? `Генерация (${counts.needGenerate})` : `Сгенерировать все (${counts.needGenerate})`}
              </Button>
            )}

            {counts.needAdd > 0 && (
              <Button size="sm" variantColor="green" disabled={isHasProcess} onClick={handleAddAll}>
                {addLoading && <div className="spinner" />}
                {addLoading ? `Добавление (${counts.needAdd})` : `Добавить все (${counts.needAdd})`}
              </Button>
            )}
          </div>
          <span className={styles.stats}>
            {counts.needGenerate} новых позиций · {counts.needAdd} готовых к добавлению{" "}
            {counts.error > 0 ? `· ${counts.error} с ошибкой` : ""}
            {counts.notBarcode > 0 ? ` · ${counts.notBarcode} без штрих-кода` : ""}
            {counts.completed > 0 ? `· ${counts.completed} добавлено` : ""}
          </span>

          <table className={styles.tableOuter}>
            <thead>
              <tr className={styles.headerLine} style={{ gridTemplateColumns: gridColumns }}>
                <th className={styles.headerCell}>Наименование</th>
                <th className={styles.headerCell}>Цена</th>
                <th className={styles.headerCell}>Штрихкод</th>
                <th className={styles.headerCell}></th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {pdfItems.map((p) => (
                <tr key={p.id} className={styles.dataRow} style={{ gridTemplateColumns: gridColumns }}>
                  <td className={styles.dataCell} title={p.name}>
                    <p className={styles.textOverflow}>{p.name}</p>
                    {statuses[p.id].status === "error" && statuses[p.id].error_message && (
                      <p className={styles.errorText}>{statuses[p.id].error_message}</p>
                    )}
                  </td>
                  <td className={styles.dataCell}>{p.price}</td>
                  <td className={styles.dataCell}>
                    <span className={styles.barcodeText}>{p.barcode}</span>
                  </td>
                  <td className={styles.dataCell}>
                    <ImportTableActions
                      id={p.id}
                      hasBarcode={p.barcode.length > 0}
                      isProcess={Object.hasOwn(processMap, p.id)}
                      disabled={isHasProcess}
                      status={statuses[p.id].status || "error"}
                      product_id={statuses[p.id].product_id}
                      onGenerate={handleGenerate}
                      onAdd={handleAdd}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
};
