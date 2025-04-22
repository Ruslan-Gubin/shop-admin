//import type { Metadata } from "next";

export const getMetadata = ({
  title = "Next template",
  description = "Next template description",
  locale = "en",
  image = "", //https://api.andaman.city/uploads/infrastructure_4f70f1b7ee.jpg
  url = "", //https://dev.andaman.strapitest.rokyrocks.ru
  siteName = "Next template",
}: {
  title: string;
  description: string;
  locale?: string;
  image?: string;
  url?: string;
  siteName?: string;
}) => {
  return {
    metadataBase: url,
    openGraph: {
      type: "website",
      url: url,
      emails: "gubin_ruslan@rambler.ru",
      phoneNumbers: "+7 949 419 7155",
      siteName: siteName,
      locale: locale,
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: url,
      title,
      description,
      images: {
        url: image,
      },
      creator: siteName,
    },
    category: locale === "ru" ? "Строительство" : "Construction",
    alternates: {
      canonical: url,
    },
    manifest: "/manifest.json",
    title,
    description,
    other: {},
  };
};
