export const generateAnswer = async (prompt: string, clearAnswer?: boolean): Promise<string> => {
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
      temperature: 1.0,
      top_p: 0.95,
      top_k: 64,
      max_tokens: 4096, // 2048
    }),
    signal: AbortSignal.timeout(120000),
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

      const content = response.choices?.[0]?.message?.content ?? "";
      if (typeof content !== "string") throw "ответ без текста";

      let answer = "";

      if (!clearAnswer) {
        const match = content.match(/\{[\s\S]*\}/);

        if (!match) throw "ответ без текста";
        const json = JSON.parse(match[0]);

        answer = typeof json.answer === "string" ? json.answer : "";
      } else {
        answer = content;
      }

      if (answer.length === 0) throw "ответ без текста";

      return answer;
    })
    .catch((error) => {
      throw `Запрос к локальной LLM завершился с ошибкой: ${error}`;
    });
};
