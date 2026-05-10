import type { Schema } from "zod";
import { getIsPayloadFieldObject } from "./get-is-payload-field-object";
import path from "path";

const getErrorsMap = (
  payload: Record<string, FormDataEntryValue | string | number | boolean>,
  validateSchema: Schema,
): Map<string, string> => {
  const errorsMap = new Map();

  const validatedFields = validateSchema.safeParse(payload);

  if (!validatedFields.success) {
    const errors: Record<string, string | string[] | undefined> =
      validatedFields.error.flatten().fieldErrors;

    for (const key in errors) {
      const errorText = errors[key] && typeof errors[key][0] === "string" ? errors[key][0] : "";
      if (errorText) {
        errorsMap.set(key, errorText);
      }
    }
  }

  return errorsMap;
};

const getFormPayload = <T>(
  formData: FormData,
  keys: (keyof T)[],
): Record<keyof T, FormDataEntryValue | string | number | boolean> => {
  const payload = {} as Record<keyof T, FormDataEntryValue>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (typeof key === "string") {
      const value = formData.get(key);

      if (value && key) {
        payload[String(key) as keyof T] =
          typeof value === "string" && value.length > 0 ? value.trim() : value;
      }

      if (!formData.has(key)) {
        payload[String(key) as keyof T] = "off";
      }
    }
  }

  return payload;
};

export const getFormActionState = <T>(formData: FormData, prevState: T, validateSchema: Schema) => {
  const newState = {} as T;
  const keys = [] as (keyof T)[];

  for (const key in prevState) {
    const isPayloadFieldObject = getIsPayloadFieldObject(prevState[key]);
    if (isPayloadFieldObject) {
      keys.push(key);
    } else {
      newState[key] = prevState[key];
    }
  }

  const payload = getFormPayload(formData, keys);
  const errorMap = getErrorsMap(payload, validateSchema);
  const isValid = errorMap.size === 0;

  for (const key of keys) {
    (newState as any)[key] = {
      value: payload[key] ? payload[key] : "",
      error: !isValid && errorMap.has(key as string) ? String(errorMap.get(key as string)) : "",
    };
  }

  return { newState, isValid, payload };
};

export const getValidatePayload = <T>(payload: T, validateSchema: Schema) => {
  const errorMap = getErrorsMap(payload, validateSchema);
  const isValid = errorMap.size === 0;

  const errors = {} as Record<keyof T, string>;

  for (const key in payload) {
    errors[key] = errorMap.has(key as string) ? String(errorMap.get(key as string)) : "";
  }

  return { isValid, errors };
};
