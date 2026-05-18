import { app } from "electron";
import Database from "better-sqlite3";
import path from "node:path";
import type { ActivityInput, ActivityRecord } from "./types";

let db: Database | null = null;

function getDb() {
  if (db) {
    return db;
  }

  db = new Database(path.join(app.getPath("userData"), "time-tracker.sqlite"));
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('start', 'stop')),
      description TEXT NOT NULL,
      session_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  return db;
}

export function insertActivity(input: ActivityInput): ActivityRecord {
  const createdAt = input.createdAt || new Date().toISOString();
  const sessionId = input.sessionId || "";
  const result = getDb()
    .prepare(
      `
        INSERT INTO activities (
          project,
          type,
          description,
          session_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(input.project, input.type, input.description, sessionId, createdAt);

  return {
    id: Number(result.lastInsertRowid),
    project: input.project,
    type: input.type,
    description: input.description,
    sessionId,
    createdAt,
  };
}
