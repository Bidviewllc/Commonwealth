import { z } from "zod";

import { httpUrl } from "./common.js";

// ---------------------------------------------------------------------------
// Settings: Input schemas
// ---------------------------------------------------------------------------

const mediaReference = z.object({
	mediaId: z.string(),
	alt: z.string().optional(),
});

const socialSettings = z.object({
	twitter: z.string().optional(),
	github: z.string().optional(),
	facebook: z.string().optional(),
	instagram: z.string().optional(),
	linkedin: z.string().optional(),
	youtube: z.string().optional(),
});

const seoSettings = z.object({
	titleSeparator: z.string().max(10).optional(),
	defaultOgImage: mediaReference.optional(),
	robotsTxt: z.string().max(5000).optional(),
	googleVerification: z.string().max(100).optional(),
	bingVerification: z.string().max(100).optional(),
});

export const settingsUpdateBody = z
	.object({
		title: z.string().optional(),
		tagline: z.string().optional(),
		logo: mediaReference.optional(),
		favicon: mediaReference.optional(),
		url: z.union([httpUrl, z.literal("")]).optional(),
		postsPerPage: z.number().int().min(1).max(100).optional(),
		dateFormat: z.string().optional(),
		timezone: z.string().optional(),
		social: socialSettings.optional(),
		seo: seoSettings.optional(),
	})
	.meta({ id: "SettingsUpdateBody" });

// ---------------------------------------------------------------------------
// Settings: Response schemas
// ---------------------------------------------------------------------------

export const siteSettingsSchema = z
	.object({
		title: z.string().optional(),
		tagline: z.string().optional(),
		logo: mediaReference.optional(),
		favicon: mediaReference.optional(),
		url: z.string().optional(),
		postsPerPage: z.number().int().optional(),
		dateFormat: z.string().optional(),
		timezone: z.string().optional(),
		social: socialSettings.optional(),
		seo: seoSettings.optional(),
	})
	.meta({ id: "SiteSettings" });
