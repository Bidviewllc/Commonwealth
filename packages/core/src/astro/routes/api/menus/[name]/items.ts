/**
 * Menu items CRUD endpoints
 *
 * POST   /_emdash/api/menus/:name/items - Add item
 * PUT    /_emdash/api/menus/:name/items/:id - Update item
 * DELETE /_emdash/api/menus/:name/items/:id - Delete item
 */

import type { APIRoute } from "astro";

import { requirePerm } from "#api/authorize.js";
import { handleError, unwrapResult } from "#api/error.js";
import {
	handleMenuItemCreate,
	handleMenuItemDelete,
	handleMenuItemUpdate,
} from "#api/handlers/menus.js";
import { isParseError, parseBody, parseQuery } from "#api/parse.js";
import {
	createMenuItemBody,
	menuItemDeleteQuery,
	menuItemUpdateQuery,
	updateMenuItemBody,
} from "#api/schemas.js";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:manage");
	if (denied) return denied;

	try {
		const body = await parseBody(request, createMenuItemBody);
		if (isParseError(body)) return body;

		const result = await handleMenuItemCreate(emdash.db, name, body);
		return unwrapResult(result, 201);
	} catch (error) {
		return handleError(error, "Failed to create menu item", "MENU_ITEM_CREATE_ERROR");
	}
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:manage");
	if (denied) return denied;

	const url = new URL(request.url);
	const query = parseQuery(url, menuItemUpdateQuery);
	if (isParseError(query)) return query;
	const itemId = query.id;

	try {
		const body = await parseBody(request, updateMenuItemBody);
		if (isParseError(body)) return body;

		const result = await handleMenuItemUpdate(emdash.db, name, itemId, body);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to update menu item", "MENU_ITEM_UPDATE_ERROR");
	}
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
	const { emdash, user } = locals;
	const name = params.name!;

	const denied = requirePerm(user, "menus:manage");
	if (denied) return denied;

	const url = new URL(request.url);
	const query = parseQuery(url, menuItemDeleteQuery);
	if (isParseError(query)) return query;
	const itemId = query.id;

	try {
		const result = await handleMenuItemDelete(emdash.db, name, itemId);
		return unwrapResult(result);
	} catch (error) {
		return handleError(error, "Failed to delete menu item", "MENU_ITEM_DELETE_ERROR");
	}
};
