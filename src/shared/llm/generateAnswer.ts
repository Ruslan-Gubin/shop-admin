import { getUnoRouterApiKey } from "@/app/product/generate-product/action";
import { unoRouterModels } from "./unoRouterModels";

export const generateAnswer = async <T>(
  prompt: string,
  initModelId?: number,
): Promise<{ answer: T }> => {
  const currentModelId = initModelId ? initModelId : 0;
  const currentModel = unoRouterModels[currentModelId];

  const apiKey = await getUnoRouterApiKey();

  if (!currentModel) {
    throw "Не одна модель не выдала результат";
  }

  return fetch("https://api.unorouter.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
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
    signal: AbortSignal.timeout(120000),
  })
    .then((response) => {
      console.log(`
  response.status: ${response.status}
  model:           ${currentModel}
  modelId:           ${currentModelId}
                    `);
      if (!response.ok) {
        response.json().then((res) => console.log(res));
        return generateAnswer(prompt, currentModelId + 1);
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

      return json;
    })
    .catch((error) => {
      throw `Запрос к локальной LLM завершился с ошибкой: ${error}`;
    });

  // --------------------------------------------------------------------------

  // return fetch("http://localhost:8080/v1/chat/completions", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     model: "gemma-4-E2B_q4_0-it",
  //     messages: [
  //       {
  //         role: "user",
  //         content: prompt,
  //       },
  //     ],
  //     temperature: 1.0,
  //     top_p: 0.95,
  //     top_k: 64,
  //     max_tokens: 4096, // 2048
  //   }),
  //   signal: AbortSignal.timeout(120000),
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw `статус ${response.status}`;
  //     }
  //
  //     return response.json();
  //   })
  //   .then((response) => {
  //     if (Object.hasOwn(response, "error") && typeof response.error.message === "string") {
  //       throw response.error.message;
  //     }
  //     const emptyAnswerErrorText = "не удалось получить ответ";
  //
  //     const content = response.choices?.[0]?.message?.content ?? "";
  //     if (typeof content !== "string") throw emptyAnswerErrorText;
  //
  //     const match = content.match(/\{[\s\S]*\}/);
  //
  //     if (!match) throw emptyAnswerErrorText;
  //
  //     const json = JSON.parse(match[0]);
  //
  //     if (!Object.hasOwn(json, "answer")) throw emptyAnswerErrorText;
  //
  //     return json;
  //   })
  //   .catch((error) => {
  //     throw `Запрос к локальной LLM завершился с ошибкой: ${error}`;
  //   });
};
