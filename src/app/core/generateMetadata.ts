import type { Metadata } from "next";

interface CustomMetadata extends Metadata {
	title: string;
	description: string;
	locale?: string;
	image?: string;
	url?: string;
	siteName?: string;
}

export const getMetadata = ({
	title = "Raduga admin panel",
	description = "Raduga admin panel app",
	locale = "ru",
	image = "/assets/logo.png",
	url = "https://shop-admin-lyart.vercel.app/",
	siteName = "Raduga admin panel",
}: CustomMetadata): Metadata => {
	const metadata = {
		metadataBase: url,
		openGraph: {
			type: "website",
			url,
			emails: "gubin_ruslan@rambler.ru",
			phoneNumbers: "+7 949 386-57-86",
			siteName,
			locale,
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
		category: locale === "ru" ? "Торговля" : "Trading",
		alternates: {
			canonical: url,
		},
		manifest: "/manifest.json",
		title,
		description,
		other: {},
	};

	return metadata;
};
