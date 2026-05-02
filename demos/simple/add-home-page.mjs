import Database from 'better-sqlite3';
const db = new Database('data.db');

// Check if home page already exists
const existing = db.prepare("SELECT id FROM ec_pages WHERE slug='home' OR slug=''").get();
if (existing) {
  console.log('Home page already exists:', existing.id);
  db.close();
  process.exit(0);
}

// Generate a ULID-style ID
const now = Date.now();
const id = now.toString(36).toUpperCase().padStart(10, '0') + Math.random().toString(36).slice(2, 16).toUpperCase();
const revId = (now + 1).toString(36).toUpperCase().padStart(10, '0') + Math.random().toString(36).slice(2, 16).toUpperCase();
const iso = new Date().toISOString();

// Insert Home page
db.prepare(`
  INSERT INTO ec_pages (id, slug, status, created_at, updated_at, published_at, version, locale, translation_group, title, content)
  VALUES (?, 'home', 'published', ?, ?, ?, 1, 'en', ?, 'Home', '[]')
`).run(id, iso, iso, iso, id);

console.log('Created Home page with id:', id);

// Also insert into revisions table to track it
db.prepare(`
  UPDATE ec_pages SET live_revision_id=NULL WHERE id=?
`).run(id);

const check = db.prepare("SELECT id, slug, title, status FROM ec_pages ORDER BY created_at DESC LIMIT 5").all();
console.log('Pages now:', JSON.stringify(check, null, 2));

db.close();
