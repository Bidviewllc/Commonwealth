/**
 * Taxonomy types for EmDash CMS
 */

/**
 * Taxonomy definition - describes a taxonomy like "category" or "tag"
 */
export interface TaxonomyDef {
	id: string;
	name: string; // 'category', 'tag', 'genre'
	label: string; // 'Categories', 'Tags'
	labelSingular?: string; // 'Category', 'Tag'
	hierarchical: boolean;
	collections: string[]; // ['posts', 'pages']
}

/**
 * Taxonomy term - a specific term within a taxonomy (e.g., "News" in "category")
 */
export interface TaxonomyTerm {
	id: string;
	name: string; // Taxonomy name ('category')
	slug: string; // Term slug ('news')
	label: string; // Display label ('News')
	parentId?: string;
	description?: string;
	children: TaxonomyTerm[]; // For tree structure
	count?: number; // Entry count
}

/**
 * Flat version for DB row
 */
export interface TaxonomyTermRow {
	id: string;
	name: string;
	slug: string;
	label: string;
	parent_id: string | null;
	data: string | null; // JSON
}

/**
 * Input for creating a term
 */
export interface CreateTermInput {
	slug: string;
	label: string;
	parentId?: string;
	description?: string;
}

/**
 * Input for updating a term
 */
export interface UpdateTermInput {
	slug?: string;
	label?: string;
	parentId?: string | null;
	description?: string;
}
