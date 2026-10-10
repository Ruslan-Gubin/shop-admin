import { getUnoRouterApiKey } from "@/app/product/generate-product/action";
import { localGenerate } from "./localGenerate";
import { modelSaveStatistics } from "./modelStatistics";
import { unoRouterModels } from "./unoRouterModels";

export const generateAnswer = async <T>(
  prompt: string,
  initModelId?: number,
  initApiKey?: string,
): Promise<{ answer: T }> => {
  const currentModelId = initModelId ? initModelId : 0;
  const currentModel = unoRouterModels[currentModelId];

  let apiKeyUnoRouter = initApiKey || "";

  if (!apiKeyUnoRouter && !initApiKey) {
    apiKeyUnoRouter = await getUnoRouterApiKey();
  }

  if (!currentModel) {
    return localGenerate(prompt);
  }

  return fetch("https://api.unorouter.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKeyUnoRouter}`,
    },
    body: JSON.stringify({
      model: currentModel,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  })
    .then((response) => {
      if (!response.ok) {
        throw `status: ${response.status}`;
      }

      return response.json();
    })
    .then((response) => {
      if (Object.hasOwn(response, "error") && typeof response.error.message === "string") {
        throw response.error.message;
      }
      const emptyAnswerErrorText = "не удалось получить ответ";

      const content = response.choices?.[0]?.message?.content ?? "";
      if (typeof content !== "string") throw emptyAnswerErrorText;

      const match = content.match(/\{[\s\S]*\}/);

      if (!match) throw emptyAnswerErrorText;

      const json = JSON.parse(match[0]);

      if (!Object.hasOwn(json, "answer")) throw emptyAnswerErrorText;

      modelSaveStatistics(currentModel, "success-model-statistics");
      console.log(`Ответ unoRouter модели: ${currentModel}`);
      console.log(`Ответ:`, json);

      return json;
    })
    .catch((error) => {
      console.log("catch error:", error, ",model:", currentModel);

      modelSaveStatistics(currentModel, "error-model-statistics");
      return generateAnswer(prompt, currentModelId + 1, apiKeyUnoRouter);
    });
};
