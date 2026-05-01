export const getIsPayloadFieldObject = (
  fieldValue: { value: string | boolean; error: string } | unknown,
) => {
  let isPayloadField = false;
  if (
    typeof fieldValue === "object" &&
    fieldValue &&
    Object.hasOwn(fieldValue, "value") &&
    Object.hasOwn(fieldValue, "error")
  ) {
    isPayloadField = true;
  }
  return isPayloadField;
};
