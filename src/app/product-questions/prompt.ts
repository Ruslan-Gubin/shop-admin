"use server";
import type { CategoryModel } from "../category/action";
import type { ProductSpecificationModel } from "../specifications/action";

export type AnswerPromptPayload = {
  question: string;
  context?: string;
  name: string;
  brand_name: string;
  categories: CategoryModel[];
  description: string;
  country: string;
  product_type: string;
  equipment: string;
  specifications: ProductSpecificationModel[];
};

export const promptAnswerFromProductQuestions = async (
  payload: AnswerPromptPayload,
): Promise<string> => {
  const categoryName = payload.categories.reduce(
    // biome-ignore lint/style/useTemplate: <concatenation>
    (acc, category, index) => acc + `${index !== 0 ? "/" : ""} ${category.name} `,
    "",
  );

  const specificationsText =
    payload.specifications.length > 0
      ? payload.specifications
          .map(
            (item) =>
              `- ${item.specification?.name ? item.specification.name : "Характеристика"}: ${item.value}`,
          )
          .join("\n")
      : "Отсутствуют";

  const validAnswer = `{
  "answer": "Текст ответа покупателю"
}`;

  return `
Ты — консультант интернет-магазина. Твоя задача — составить ответ покупателю на его вопрос о товаре.

Данные о товаре:
- Название: ${payload.name ? payload.name : "Отсутствует"}
- Бренд: ${payload.brand_name ? payload.brand_name : "Отсутствует"}
- Категория: ${categoryName ? categoryName : "Отсутствует"}
- Описание: ${payload.description ? payload.description : "Отсутствует"}
- Страна: ${payload.country ? payload.country : "Отсутствует"}
- Тип: ${payload.product_type ? payload.product_type : "Отсутствует"}
- Комплектация: ${payload.equipment ? payload.equipment : "Отсутствует"}
- Характеристики:
${specificationsText}

Вопрос покупателя: "${payload.question}"

Дополнительный контекст от администратора (может содержать инструкции, уточнения или справочную информацию): ${payload.context ? `"${payload.context}"` : "Отсутствует"}

Правила ответа:
1. Отвечай ТОЛЬКО на основе фактов из данных о товаре, ничего не выдумывай.
2. Если в данных о товаре нет информации, необходимой для ответа — честно скажи об этом и предложи покупателю уточнить детали (например, связаться с поддержкой если это необходимо но в крайнем случае).
3. Учти дополнительный контекст администратора, если он задан — он приоритетнее общих данных о товаре.
4. Тон — вежливый и дружелюбный консультант, грамотный русский язык.
5. Ответ должен быть кратким: 2-4 предложения, без воды и канцелярита.
6. Не используй markdown-разметку, списки и эмодзи.

Правила формата:
- Верни ТОЛЬКО JSON в виде ${validAnswer}
- Никаких префиксов, пояснений, нумерации и markdown-блоков
- Если ответ сформировать невозможно — верни JSON с пустой строкой: {"answer": ""}
`;
};
