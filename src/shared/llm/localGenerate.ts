export const localGenerate = async (prompt: string) => {
  return fetch("http://localhost:8080/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma-4-E2B_q4_0-it",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  })
    .then((response) => {
      if (!response.ok) {
        throw `статус ${response.status}`;
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

      console.log("Ответ локальной модели: gemma-4-E2B_q4_0-it");
      return json;
    })
    .catch((error) => {
      throw `Запрос к локальной LLM завершился с ошибкой: ${error.message} ${error.message === "" ? "Failed to fetch" : ", не запущена локальная модель."}`;
    });
};
