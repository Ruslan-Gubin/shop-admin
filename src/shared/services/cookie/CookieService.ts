export type CookieServiceType = {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: {}): void;
  delete(name: string): void;
};

export const CookieService = {
  get(name: string) {
    if (typeof window !== "undefined" && document) {
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)",
        ),
      );

      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    return "";
  },

  set(name: string, value: string, options = {}) {
    options = {
      path: "/",
      ...options,
    };

    //@ts-ignore
    if (options.expires instanceof Date) {
      //@ts-ignore
      options.expires = options.expires.toUTCString();
    }

    let updatedCookie =
      encodeURIComponent(name.trim()) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      //@ts-ignore
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }

    if (typeof window !== "undefined") {
      document.cookie = updatedCookie;
    }
  },

  delete(name: string) {
    if (typeof window !== "undefined") {
      this.set( name, "",{
        "max-age": -1,
      });
    }
  },
};
