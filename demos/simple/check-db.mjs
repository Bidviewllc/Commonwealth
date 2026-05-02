import Database from 'better-sqlite3';
const db = new Database('data.db', { readonly: true });
try {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  console.log('Users count:', userCount.count);
  const users = db.prepare("SELECT id, email, name, role FROM users LIMIT 10").all();
  console.log('Users:', JSON.stringify(users, null, 2));
} catch (e) { console.log('users error:', e.message); }
try {
  const credCount = db.prepare("SELECT COUNT(*) as count FROM credentials").get();
  console.log('Credentials count:', credCount.count);
} catch (e) { console.log('credentials error:', e.message); }
db.close();
