/**
 * Single term endpoint
 *
 * GET /_emdash/api/taxonomies/:name/terms/:slug - Get a single term
 * PUT /_emdash/api/taxonomies/:name/terms/:slug - Update a term
 * DELETE /_emdash/api/taxonomies/:name/terms/:slug - Delete a term
 */

import type { APIRoute } from "astro";

import { requirePerm } from "#api/authorize.js";
import { apiError, handleError, requireDb, unwrapResult } from "#api/error.js";
import { handleTermDelete, handleTermGet, handleTermUpdate } from "#api/handlers/taxonomies.js";
import { isParseError, parseBody } from "#api/parse.js";
import { updateTermBody } from "#api/schemas.js";

export const prerender = false;

/**
 * Get a single term
 */
export const GET: APIRoute = async ({ params, locals }) => {
	const { emdash, user } = locals;
	const { name, slug } = params;

	if (!name || !slug) {
		return apiError("VALIDATION_ERROR", "Taxonomy name and slug required", 400);
	}

	const dbErr = requireDb(emdash?.db);
	if (dbErr) return dbErr;

	const denied = requirePerm(user, "taxonomies:read");
	if (denied) return denied;

	try {
		const result = await handleTermGet(emdash.db, name, slug);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to get term", "TERM_GET_ERROR");
	}
};

/**
 * Update a term
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
	const { emdash, user } = locals;
	const { name, slug } = params;

	if (!name || !slug) {
		return apiError("VALIDATION_ERROR", "Taxonomy name and slug required", 400);
	}

	const dbErr = requireDb(emdash?.db);
	if (dbErr) return dbErr;

	const denied = requirePerm(user, "taxonomies:manage");
	if (denied) return denied;

	try {
		const body = await parseBody(request, updateTermBody);
		if (isParseError(body)) return body;

		const result = await handleTermUpdate(emdash.db, name, slug, body);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to update term", "TERM_UPDATE_ERROR");
	}
};

/**
 * Delete a term
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
	const { emdash, user } = locals;
	const { name, slug } = params;

	if (!name || !slug) {
		return apiError("VALIDATION_ERROR", "Taxonomy name and slug required", 400);
	}

	const dbErr = requireDb(emdash?.db);
	if (dbErr) return dbErr;

	const denied = requirePerm(user, "taxonomies:manage");
	if (denied) return denied;

	try {
		const result = await handleTermDelete(emdash.db, name, slug);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to delete term", "TERM_DELETE_ERROR");
	}
};
