export const modelSaveStatistics = (
  model: string,
  key: "success-model-statistics" | "error-model-statistics",
) => {
  const statistics: Record<string, number> = JSON.parse(window.localStorage.getItem(key) || "{}");
  statistics[model] = Object.hasOwn(statistics, model) ? statistics[model] + 1 : 1;
  window.localStorage.setItem(key, JSON.stringify(statistics));
};
