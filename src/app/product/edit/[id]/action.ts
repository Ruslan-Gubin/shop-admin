"use server";
import { cookies } from "next/headers";
import {
  createProductSpecificationAction,
  createSpecification,
  deleteProductSpecificationAction,
  type ProductSpecificationModel,
  updateProductSpecificationAction,
} from "@/app/specifications/action";
import { fetchService } from "@/shared/fetch-api";
import { updateTokensInAction } from "@/shared/helpers/updateCookieAction";
import { getValidatePayload } from "@/shared/services/get-form-action-state";
import { setErrorFromServer } from "@/shared/services/set-new-store-error-from-server";
import {
  createProductPriceAction,
  deleteProductPriceAction,
  editProductPriceAction,
  type ProductModel,
  type ProductPriceModel,
} from "../../action";
import type { SpecificationValueItem } from "../../components/ProductForm/ProductForm";
import type { ProductFormPayload, ProductFormPayloadValues } from "../../create/action";
import { createProductSchema } from "../../create/schema";

export const fetchProduct = async (id: string) => {
  return await fetchService.get<ProductModel>({
    url: `product/${id}`,
  });
};

export const updateProductAction = async (
  payload: ProductFormPayloadValues,
  id: string | undefined,
): Promise<{
  status: "error" | "success";
  errors: Record<keyof ProductFormPayloadValues, string>;
  data: ProductModel | null;
}> => {
  const { isValid, errors } = getValidatePayload(payload, createProductSchema);

  if (isValid && id) {
    const updatePayload: ProductFormPayload = {
      ...payload,
      brand_id: null,
      weight: payload.weight ? Number(payload.weight) : null,
      height: payload.height ? Number(payload.height) : null,
      length: payload.length ? Number(payload.length) : null,
      width: payload.width ? Number(payload.width) : null,
      purchase_price: payload.purchase_price ? Number(payload.purchase_price) : null,
    };

    const cookieStore = await cookies();

    return await fetchService
      .patch<null>({
        url: `product/${id}`,
        payload: updatePayload,
      })
      .then((response) => {
        if (response.tokens) {
          updateTokensInAction(cookieStore, response.tokens);
        }

        if (response.status === "error" && response.errors) {
          setErrorFromServer(response.errors, errors);
        }

        return { status: response.status, errors, data: response.data };
      });
  }

  return { status: "error", errors, data: null };
};

export const updateProductPriceValues = async (
  typePriceValues: Record<string, string>,
  productPrices: ProductPriceModel[],
  product_id: string,
): Promise<string> => {
  let errorMessage = "";

  for (const key in typePriceValues) {
    const price =
      typePriceValues[key] && typePriceValues[key].length > 0 && Number(typePriceValues[key]);

    const productPrice = productPrices.find((el) => el.price_type_id === Number(key));

    if (!price && productPrice && productPrice.price) {
      await deleteProductPriceAction(productPrice.id).then((response) => {
        if (response === "error") {
          errorMessage = "Не удалось удалить цену для товара";
        }
      });
    }

    if (typeof price === "number" && !Number.isNaN(price) && !productPrice) {
      await createProductPriceAction({
        product_id: Number(product_id),
        price_type_id: Number(key),
        price,
      }).then((response) => {
        if (response.status === "error") {
          errorMessage = "Не удалось добавить цену для товара";
        }
      });
    }

    if (
      typeof price === "number" &&
      !Number.isNaN(price) &&
      productPrice &&
      price !== productPrice.price
    ) {
      await editProductPriceAction(productPrice.id, price).then((response) => {
        if (response === "error") {
          errorMessage = "Не изменить цену для товара";
        }
      });
    }
  }

  return errorMessage;
};

export const updateProductSpecifications = async (
  specificationsValues: SpecificationValueItem[],
  productSpecifications: ProductSpecificationModel[],
  product_id: string,
): Promise<string> => {
  let errorMessage = "";

  for (let i = 0; i < specificationsValues.length; i++) {
    const specificationValue = specificationsValues[i];
    const productSpecification = productSpecifications.find(
      (el) => el.specification_id === specificationValue.specificationId,
    );

    if (
      specificationValue.value &&
      productSpecification &&
      specificationValue.value !== productSpecification.value
    ) {
      await updateProductSpecificationAction(
        productSpecification.id,
        specificationValue.value,
      ).then((response) => {
        if (response === "error") {
          errorMessage = "Не удалось изменить характеристику для товара";
        }
      });
    }

    if (productSpecification && !specificationValue.value) {
      await deleteProductSpecificationAction(productSpecification.id).then((response) => {
        if (response === "error") {
          errorMessage = "Не удалось удалить характеристику для товара";
        }
      });
    }

    if (specificationValue.specificationId && specificationValue.value && !productSpecification) {
      await createProductSpecificationAction({
        product_id: Number(product_id),
        specification_id: specificationValue.specificationId,
        value: specificationValue.value,
      }).then((response) => {
        if (response === "error") {
          errorMessage = "Не удалось добавить характеристику для товара";
        }
      });
    } else if (
      !specificationValue.specificationId &&
      specificationValue.value &&
      specificationValue.label
    ) {
      await createSpecification({ name: specificationValue.label, type: "text" }).then(
        (response) => {
          if (typeof response === "number") {
            createProductSpecificationAction({
              product_id: Number(product_id),
              specification_id: response,
              value: specificationValue.value,
            });
          }
        },
      );
    }
  }

  for (let i = 0; i < productSpecifications.length; i++) {
    const productSpecification = productSpecifications[i];
    const specificationsValue = specificationsValues.find(
      (el) => el.specificationId === productSpecification.specification_id,
    );
    if (!specificationsValue) {
      await deleteProductSpecificationAction(productSpecification.id).then((response) => {
        if (response === "error") {
          errorMessage = "Не удалось удалить характеристику для товара";
        }
      });
    }
  }

  return errorMessage;
};
