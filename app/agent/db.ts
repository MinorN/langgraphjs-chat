import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'chat_history.db')
console.log(dbPath)
const db = new Database(dbPath)

export function initSessionTable() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
  ).run()
}

export function createSession(id: string, name: string) {
  db.prepare('INSERT INTO sessions (id, name) VALUES (?, ?)').run(id, name)
}

export function getAllSessions() {
  return db
    .prepare(
      'SELECT id, name, created_at FROM sessions ORDER BY created_at DESC'
    )
    .all()
}

export function updateSessionName(id: string, name: string) {
  db.prepare('UPDATE sessions SET name = ? WHERE id = ?').run(name, id)
}

export function deleteSession(id: string) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

export default db
