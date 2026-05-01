export const normalizePhoneNumber = (phone: FormDataEntryValue): string =>
  typeof phone === "string" ? phone.replace(/\D/g, "") : "";
