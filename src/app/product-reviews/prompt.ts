import type { CategoryModel } from "../category/action";
import type { ProductSpecificationModel } from "../specifications/action";

export type AnswerPromptPayload = {
  context?: string;
  name: string;
  brand_name: string;
  categories: CategoryModel[];
  description: string;
  country: string;
  product_type: string;
  equipment: string;
  specifications: ProductSpecificationModel[];
  rating: number;
  dignities: string;
  disadvantages: string;
  comment: string;
};

export const promptAnswerFromProductReview = async (
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
Ты — представитель интернет-магазина. Твоя задача — составить ответ на отзыв покупателя о товаре.

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

Отзыв покупателя:
- Оценка: ${payload.rating ? `${payload.rating} из 5` : "Отсутствует"}
- Достоинства: ${payload.dignities ? payload.dignities : "Отсутствуют"}
- Недостатки: ${payload.disadvantages ? payload.disadvantages : "Отсутствуют"}
- Комментарий: ${payload.comment ? payload.comment : "Отсутствует"}

Дополнительный контекст от администратора (может содержать инструкции, уточнения или справочную информацию): ${payload.context ? `"${payload.context}"` : "Отсутствует"}

Правила ответа:
1. Поблагодари покупателя за отзыв и удели внимание его оценке.
2. Отвечай ТОЛЬКО на основе фактов из данных о товаре и текста отзыва, ничего не выдумывай.
3. Если покупатель указал недостатки или претензии — корректно отреагируй, не спорь, предложи решение или уточнение (например, связаться с поддержкой).
4. Учти дополнительный контекст администратора, если он задан — он приоритетнее общих данных о товаре.
5. Тон — вежливый и доброжелательный, грамотный русский язык, без канцелярита.
6. Ответ должен быть кратким: 2-4 предложения.
7. Не используй markdown-разметку, списки и эмодзи.

Правила формата:
- Верни ТОЛЬКО JSON в виде ${validAnswer}
- Никаких префиксов, пояснений, нумерации и markdown-блоков
- Если ответ сформировать невозможно — верни JSON с пустой строкой: {"answer": ""}
`;
};
