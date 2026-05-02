/**
 * Single menu endpoint
 *
 * GET    /_emdash/api/menus/:name - Get menu with items
 * PUT    /_emdash/api/menus/:name - Update menu metadata
 * DELETE /_emdash/api/menus/:name - Delete menu
 */

import type { APIRoute } from "astro";

import { requirePerm } from "#api/authorize.js";
import { handleError, unwrapResult } from "#api/error.js";
import { handleMenuDelete, handleMenuGet, handleMenuUpdate } from "#api/handlers/menus.js";
import { isParseError, parseBody } from "#api/parse.js";
import { updateMenuBody } from "#api/schemas.js";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:read");
	if (denied) return denied;

	try {
		const result = await handleMenuGet(emdash.db, name);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to fetch menu", "MENU_GET_ERROR");
	}
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:manage");
	if (denied) return denied;

	try {
		const body = await parseBody(request, updateMenuBody);
		if (isParseError(body)) return body;

		const result = await handleMenuUpdate(emdash.db, name, body);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to update menu", "MENU_UPDATE_ERROR");
	}
};

export const DELETE: APIRoute = async ({ params, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:manage");
	if (denied) return denied;

	try {
		const result = await handleMenuDelete(emdash.db, name);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to delete menu", "MENU_DELETE_ERROR");
	}
};
