import type { SalesItem } from "@/app/dashboard-action";
import { priceFormatter } from "@/shared/helpers/formatPrice";
import type { MenuOptionItem } from "@/shared/services/canvas/types";
import { SalesChart } from "../chart-sales/SalesChart";
import { WidgetWrapper } from "../WidgetWrapper/WidgetWrapper";

type Props = {
  salesSchedule: SalesItem[];
};

export const SalesSchedule = (props: Props) => {
  const getLines = (salesSchedule: SalesItem[]) => {
    const lines: { color: string; title: string; values: number[] }[] = [
      {
        color: "green",
        title: "Наличными",
        values: [],
      },
      {
        color: "orange",
        title: "Картой",
        values: [],
      },
      {
        color: "blue",
        title: "Всего",
        values: [],
      },
    ];

    const dateNow = new Date();
    const dateStart = new Date();
    dateStart.setDate(1);
    const datesLength = dateNow.getDate();

    const salesMap = new Map();

    for (let i = 0; i < salesSchedule.length; i++) {
      const sales = salesSchedule[i];
      const date = new Date(sales.date);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!salesMap.has(key)) {
        salesMap.set(key, {
          cash: Number(sales.cash),
          card: Number(sales.card),
        });
      }
    }

    for (let i = 0; i < datesLength; i++) {
      const currentDate = `${dateStart.getFullYear()}-${String(dateStart.getMonth() + 1).padStart(2, "0")}-${String(dateStart.getDate() + i).padStart(2, "0")}`;

      if (salesMap.has(currentDate)) {
        const value = salesMap.get(currentDate);

        lines[0].values.push(value.cash);
        lines[1].values.push(value.card);
        lines[2].values.push(value.cash + value.card);
      } else {
        lines[0].values.push(0);
        lines[1].values.push(0);
        lines[2].values.push(0);
      }
    }

    return lines;
  };

  const lines = getLines(props.salesSchedule);

  const getMenuOptions = (lines: { color: string; title: string; values: number[] }[]) => {
    const result: MenuOptionItem[] = [];

    const dateNow = new Date();

    const formatter = Intl.DateTimeFormat("ru", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    for (let i = 0; i < lines[0].values.length; i++) {
      dateNow.setDate(i + 1);

      const cashLine = lines[0];
      const cardLine = lines[1];
      const totalLine = lines[2];

      if (cashLine && cardLine && totalLine) {
        result.push({
          date: formatter.format(dateNow),
          cash: {
            text: `${cashLine.title} ${cashLine.values[i] ? priceFormatter.format(cashLine.values[i]) : 0}`,
            color: cashLine.color,
          },
          card: {
            text: `${cardLine.title} ${cardLine.values[i] ? priceFormatter.format(cardLine.values[i]) : 0}`,
            color: cardLine.color,
          },
          total: {
            text: `${totalLine.title} ${totalLine.values[i] ? priceFormatter.format(totalLine.values[i]) : 0}`,
            color: totalLine.color,
          },
        });
      }
    }

    return result;
  };

  const menuOptions = getMenuOptions(lines);

  const maxCount = Math.max(...lines.flatMap((l) => l.values));
  const maxThreshold = maxCount <= 0 ? 10 : 10 ** Math.ceil(Math.log10(maxCount));

  const formatNumber = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const countLines = [
    formatNumber(maxThreshold),
    formatNumber(maxThreshold * 0.75),
    formatNumber(maxThreshold * 0.5),
    formatNumber(maxThreshold * 0.25),
    "0",
  ];

  return (
    <WidgetWrapper title="График продаж">
      <SalesChart
        menuOptions={menuOptions}
        showGraph={lines.length > 0 && lines[0].values.length > 1}
        countLines={countLines}
        lines={lines}
      />
    </WidgetWrapper>
  );
};
