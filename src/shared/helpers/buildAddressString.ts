import type { AddressItem } from "@/shared/ui/mapbox/Mapbox";

export const buildAddressString = (address: AddressItem | null) => {
  let result: string = "";

  if (address) {
    if (address.place) {
      result += address.place;
    }

    if (address.name) {
      result += result.length > 0 ? `, ${address.name}` : address.name;
    }

    if (address.entrance) {
      result += `${result.length > 0 ? "," : ""} под.${address.entrance}`;
    }

    if (address.floor) {
      result += `${result.length > 0 ? "," : ""} эт.${address.floor}`;
    }

    if (address.flat) {
      result += `${result.length > 0 ? "," : ""} кв.${address.flat}`;
    }

    if (address.intercom) {
      result += `${result.length > 0 ? "," : ""} домофон ${address.intercom}`;
    }
  }

  return result;
};
