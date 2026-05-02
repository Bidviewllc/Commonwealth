/**
 * emdash plugin init
 *
 * Scaffold a new EmDash plugin. Generates the standard-format boilerplate:
 *   src/index.ts         -- descriptor factory
 *   src/sandbox-entry.ts -- definePlugin({ hooks, routes })
 *   package.json
 *   tsconfig.json
 *
 * Use --native to generate native-format boilerplate instead (createPlugin + React admin).
 *
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join, basename } from "node:path";

import { defineCommand } from "citty";
import consola from "consola";

import { fileExists } from "./bundle-utils.js";

const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SCOPE_RE = /^@[^/]+\//;

export const pluginInitCommand = defineCommand({
	meta: {
		name: "init",
		description: "Scaffold a new plugin",
	},
	args: {
		dir: {
			type: "string",
			description: "Directory to create the plugin in (default: current directory)",
			default: ".",
		},
		name: {
			type: "string",
			description: "Plugin name/id (e.g. my-plugin or @org/my-plugin)",
		},
		native: {
			type: "boolean",
			description: "Generate native-format plugin (createPlugin + React admin)",
			default: false,
		},
	},
	async run({ args }) {
		const targetDir = resolve(args.dir);
		const isNative = args.native;

		// Derive plugin name from --name or directory name
		let pluginName = args.name || basename(targetDir);
		if (!pluginName || pluginName === ".") {
			pluginName = basename(resolve("."));
		}

		// Strip scope for the slug
		const slug = pluginName.replace(SCOPE_RE, "");
		if (!SLUG_RE.test(slug)) {
			consola.error(
				`Invalid plugin name "${pluginName}". ` +
					"Use lowercase letters, numbers, and hyphens (e.g. my-plugin).",
			);
			process.exit(1);
		}

		// Check if directory already has files
		const srcDir = join(targetDir, "src");
		const pkgPath = join(targetDir, "package.json");
		if (await fileExists(pkgPath)) {
			consola.error(`package.json already exists in ${targetDir}`);
			process.exit(1);
		}

		consola.start(`Scaffolding ${isNative ? "native" : "standard"} plugin: ${pluginName}`);

		await mkdir(srcDir, { recursive: true });

		if (isNative) {
			await scaffoldNative(targetDir, srcDir, pluginName, slug);
		} else {
			await scaffoldStandard(targetDir, srcDir, pluginName, slug);
		}

		consola.success(`Plugin scaffolded in ${targetDir}`);
		consola.info("Next steps:");
		if (args.dir !== ".") {
			consola.info(`  1. cd ${args.dir}`);
		}
		consola.info(`  ${args.dir !== "." ? "2" : "1"}. pnpm install`);
		if (isNative) {
			consola.info(`  ${args.dir !== "." ? "3" : "2"}. Edit src/index.ts to add hooks and routes`);
		} else {
			consola.info(
				`  ${args.dir !== "." ? "3" : "2"}. Edit src/sandbox-entry.ts to add hooks and routes`,
			);
		}
		consola.info(`  ${args.dir !== "." ? "4" : "3"}. emdash plugin validate --dir .`);
	},
});

// ── Standard format scaffolding ──────────────────────────────────

async function scaffoldStandard(
	targetDir: string,
	srcDir: string,
	pluginName: string,
	slug: string,
): Promise<void> {
	// Derive the camelCase function name from slug
	const fnName = slug
		.split("-")
		.map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
		.join("");

	// package.json
	await writeFile(
		join(targetDir, "package.json"),
		JSON.stringify(
			{
				name: pluginName,
				version: "0.1.0",
				type: "module",
				exports: {
					".": "./src/index.ts",
					"./sandbox": "./src/sandbox-entry.ts",
				},
				files: ["src"],
				peerDependencies: {
					emdash: "*",
				},
			},
			null,
			"\t",
		) + "\n",
	);

	// tsconfig.json
	await writeFile(
		join(targetDir, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "preserve",
					moduleResolution: "bundler",
					strict: true,
					esModuleInterop: true,
					declaration: true,
					outDir: "./dist",
					rootDir: "./src",
				},
				include: ["src/**/*"],
				exclude: ["node_modules", "dist"],
			},
			null,
			"\t",
		) + "\n",
	);

	// src/index.ts -- descriptor factory
	await writeFile(
		join(srcDir, "index.ts"),
		`import type { PluginDescriptor } from "emdash";

export function ${fnName}Plugin(): PluginDescriptor {
\treturn {
\t\tid: "${pluginName}",
\t\tversion: "0.1.0",
\t\tformat: "standard",
\t\tentrypoint: "${pluginName}/sandbox",
\t\tcapabilities: [],
\t};
}
`,
	);

	// src/sandbox-entry.ts -- plugin definition
	await writeFile(
		join(srcDir, "sandbox-entry.ts"),
		`import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

export default definePlugin({
\thooks: {
\t\t"content:afterSave": {
\t\t\thandler: async (event: any, ctx: PluginContext) => {
\t\t\t\tctx.log.info("Content saved", {
\t\t\t\t\tcollection: event.collection,
\t\t\t\t\tid: event.content.id,
\t\t\t\t});
\t\t\t},
\t\t},
\t},
});
`,
	);
}

// ── Native format scaffolding ────────────────────────────────────

async function scaffoldNative(
	targetDir: string,
	srcDir: string,
	pluginName: string,
	slug: string,
): Promise<void> {
	const fnName = slug
		.split("-")
		.map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
		.join("");

	// package.json
	await writeFile(
		join(targetDir, "package.json"),
		JSON.stringify(
			{
				name: pluginName,
				version: "0.1.0",
				type: "module",
				exports: {
					".": "./src/index.ts",
				},
				files: ["src"],
				peerDependencies: {
					emdash: "*",
				},
			},
			null,
			"\t",
		) + "\n",
	);

	// tsconfig.json
	await writeFile(
		join(targetDir, "tsconfig.json"),
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "preserve",
					moduleResolution: "bundler",
					strict: true,
					esModuleInterop: true,
					declaration: true,
					outDir: "./dist",
					rootDir: "./src",
				},
				include: ["src/**/*"],
				exclude: ["node_modules", "dist"],
			},
			null,
			"\t",
		) + "\n",
	);

	// src/index.ts -- descriptor + createPlugin
	await writeFile(
		join(srcDir, "index.ts"),
		`import { definePlugin } from "emdash";
import type { PluginDescriptor } from "emdash";

export function ${fnName}Plugin(): PluginDescriptor {
\treturn {
\t\tid: "${pluginName}",
\t\tversion: "0.1.0",
\t\tformat: "native",
\t\tentrypoint: "${pluginName}",
\t\toptions: {},
\t};
}

export function createPlugin() {
\treturn definePlugin({
\t\tid: "${pluginName}",
\t\tversion: "0.1.0",

\t\thooks: {
\t\t\t"content:afterSave": async (event, ctx) => {
\t\t\t\tctx.log.info("Content saved", {
\t\t\t\t\tcollection: event.collection,
\t\t\t\t\tid: event.content.id,
\t\t\t\t});
\t\t\t},
\t\t},
\t});
}

export default createPlugin;
`,
	);
}
