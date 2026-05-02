import Database from 'better-sqlite3';
const db = new Database('data.db');

// Rename "Site Configuration" to "Home Page" in admin sidebar
db.prepare("UPDATE _emdash_collections SET label='Home Page', label_singular='Home Page' WHERE slug='site_config'").run();
console.log('Renamed site_config → Home Page');

// Check result
const col = db.prepare("SELECT label, label_singular FROM _emdash_collections WHERE slug='site_config'").get();
console.log('New label:', JSON.stringify(col));

db.close();
console.log('Done.');
