import { z } from "astro/zod";

import type { FieldDefinition, ImageValue } from "./types.js";

/**
 * Image field schema
 */
const imageSchema = z.object({
	id: z.string(),
	src: z.string(),
	alt: z.string().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
});

/**
 * Image field
 * References media items from the media library
 */
export function image(options?: {
	required?: boolean;
	maxSize?: number; // in bytes
	allowedTypes?: string[]; // MIME types
}): FieldDefinition<ImageValue | undefined> {
	return {
		type: "image",
		columnType: "TEXT",
		schema: options?.required === false ? imageSchema.optional() : imageSchema,
		options,
		ui: {
			widget: "image",
		},
	};
}
