import { CONFIG_APP } from "../config/config";

export const formattedPhotoSrc = (src: string | undefined) => {
  let result = "/assets/no_image.jpg";

  if (typeof src === "string") {
    result = src.includes("uploads/") ? `${CONFIG_APP.BACKEND_URL}${src}` : src;
  }

  return result;
};
