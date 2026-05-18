import { app } from "electron";
import Database from "better-sqlite3";
import path from "node:path";
import type {
  ActivityInput,
  ActivityMediaFilter,
  ActivityMediaRecord,
  ActivityMediaType,
  ActivityMediaUploadStatus,
  ActivityRecord,
  ActivityStatus,
  ActivitySessionMediaInput,
  ActivitySessionRecord,
  ActivitySessionSummaryRecord,
  ActivitySessionStatus,
  ActivityTimelineInput,
  ActivityType,
  IdlePeriodInput,
  InputActivityInput,
} from "./types";

let db: Database | null = null;

type ActivityRow = {
  id: number;
  project: string;
  type: ActivityType;
  description: string;
  session_id: string;
  created_at: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: ActivityStatus;
  screenshot_paths: string;
  camshot_paths: string;
  synced: number;
  sync_status: "pending" | "syncing" | "synced" | "failed";
  remote_id: string;
  uploaded_at: string;
  synced_at: string;
  upload_error: string;
};

type ActivityMediaRow = {
  id: number;
  activity_id: number;
  media_type: ActivityMediaType;
  file_path: string;
  upload_status: ActivityMediaUploadStatus;
  remote_id: string;
  uploaded_at: string;
  upload_error: string;
  created_at: string;
  project: string;
  activity_type: ActivityType;
  description: string;
};

type UploadedMediaFileRow = {
  id: number;
  file_path: string;
};

type ActiveActivityRow = {
  id: number;
  start_time: string;
};

type ActivitySessionRow = {
  id: string;
  project_id: string;
  task_id: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: ActivitySessionStatus;
};

type ActivitySessionSummaryRow = ActivitySessionRow & {
  screenshot_count: number;
  camshot_count: number;
  keyboard_count: number;
  mouse_click_count: number;
};

type TableColumn = {
  name: string;
  notnull: number;
};

function addColumnIfMissing(database: Database, table: string, definition: string) {
  try {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.toLowerCase().includes("duplicate column")
    ) {
      throw error;
    }
  }
}

function columnSql(database: Database, table: string, column: string, fallback: string) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as TableColumn[];

  return columns.some((item) => item.name === column) ? column : fallback;
}

function migrateActivityMediaIfNeeded(database: Database) {
  const columns = database.prepare("PRAGMA table_info(activity_media)").all() as TableColumn[];
  const activityIdColumn = columns.find((column) => column.name === "activity_id");

  if (!activityIdColumn || activityIdColumn.notnull === 0) {
    return;
  }

  const sessionId = columnSql(database, "activity_media", "session_id", "''");
  const approved = columnSql(database, "activity_media", "approved", "1");
  const rejected = columnSql(database, "activity_media", "rejected", "0");
  const cameraId = columnSql(database, "activity_media", "camera_id", "''");
  const fileDeleted = columnSql(database, "activity_media", "file_deleted", "0");

  database.exec("PRAGMA foreign_keys = OFF");
  database.exec(`
    ALTER TABLE activity_media RENAME TO activity_media_old;
    CREATE TABLE activity_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER,
      session_id TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL CHECK (media_type IN ('screenshot', 'camshot')),
      file_path TEXT NOT NULL,
      upload_status TEXT NOT NULL DEFAULT 'pending',
      remote_id TEXT NOT NULL DEFAULT '',
      uploaded_at TEXT NOT NULL DEFAULT '',
      upload_error TEXT NOT NULL DEFAULT '',
      approved INTEGER NOT NULL DEFAULT 1,
      rejected INTEGER NOT NULL DEFAULT 0,
      camera_id TEXT NOT NULL DEFAULT '',
      file_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE
    );
    INSERT INTO activity_media (
      id,
      activity_id,
      session_id,
      media_type,
      file_path,
      upload_status,
      remote_id,
      uploaded_at,
      upload_error,
      approved,
      rejected,
      camera_id,
      file_deleted,
      created_at
    )
    SELECT
      id,
      activity_id,
      ${sessionId},
      media_type,
      file_path,
      upload_status,
      remote_id,
      uploaded_at,
      upload_error,
      ${approved},
      ${rejected},
      ${cameraId},
      ${fileDeleted},
      created_at
    FROM activity_media_old;
    DROP TABLE activity_media_old;
  `);
  database.exec("PRAGMA foreign_keys = ON");
}

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function toActivityRecord(row: ActivityRow): ActivityRecord {
  return {
    id: row.id,
    project: row.project,
    type: row.type,
    description: row.description,
    sessionId: row.session_id,
    createdAt: row.created_at,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    status: row.status,
    screenshotPaths: parseJsonArray(row.screenshot_paths),
    camshotPaths: parseJsonArray(row.camshot_paths),
    synced: row.synced === 1,
    syncStatus: row.sync_status,
    remoteId: row.remote_id,
    uploadedAt: row.uploaded_at,
    syncedAt: row.synced_at,
    uploadError: row.upload_error,
  };
}

function toActivityMediaRecord(row: ActivityMediaRow): ActivityMediaRecord {
  return {
    id: row.id,
    activityId: row.activity_id,
    mediaType: row.media_type,
    filePath: row.file_path,
    uploadStatus: row.upload_status,
    remoteId: row.remote_id,
    uploadedAt: row.uploaded_at,
    uploadError: row.upload_error,
    createdAt: row.created_at,
    project: row.project,
    activityType: row.activity_type,
    description: row.description,
  };
}

function toActivitySessionRecord(row: ActivitySessionRow): ActivitySessionRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    taskId: row.task_id,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    duration: row.duration,
    status: row.status,
  };
}

function toActivitySessionSummaryRecord(
  row: ActivitySessionSummaryRow,
): ActivitySessionSummaryRecord {
  return {
    ...toActivitySessionRecord(row),
    screenshotCount: row.screenshot_count || 0,
    camshotCount: row.camshot_count || 0,
    keyboardCount: row.keyboard_count || 0,
    mouseClickCount: row.mouse_click_count || 0,
  };
}

function getDb() {
  if (db) {
    return db;
  }
  const db_path = path.join(app.getPath("userData"), "time-tracker.sqlite");
  console.log("Database path:", db_path);
  db = new Database(db_path);
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
  addColumnIfMissing(db, "activities", "screenshot_paths TEXT NOT NULL DEFAULT '[]'");
  addColumnIfMissing(db, "activities", "camshot_paths TEXT NOT NULL DEFAULT '[]'");
  addColumnIfMissing(db, "activities", "synced INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "activities", "sync_status TEXT NOT NULL DEFAULT 'pending'");
  addColumnIfMissing(db, "activities", "remote_id TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "uploaded_at TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "synced_at TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "upload_error TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "start_time TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "end_time TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activities", "duration INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "activities", "status TEXT NOT NULL DEFAULT 'completed'");
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      task_id TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL DEFAULT '',
      duration INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'stopped')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER,
      session_id TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL CHECK (media_type IN ('screenshot', 'camshot')),
      file_path TEXT NOT NULL,
      upload_status TEXT NOT NULL DEFAULT 'pending',
      remote_id TEXT NOT NULL DEFAULT '',
      uploaded_at TEXT NOT NULL DEFAULT '',
      upload_error TEXT NOT NULL DEFAULT '',
      approved INTEGER NOT NULL DEFAULT 1,
      rejected INTEGER NOT NULL DEFAULT 0,
      camera_id TEXT NOT NULL DEFAULT '',
      file_deleted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE
    )
  `);
  migrateActivityMediaIfNeeded(db);
  addColumnIfMissing(db, "activity_media", "session_id TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activity_media", "approved INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing(db, "activity_media", "rejected INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "activity_media", "camera_id TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(db, "activity_media", "file_deleted INTEGER NOT NULL DEFAULT 0");
  db.exec(`
    CREATE TABLE IF NOT EXISTS input_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      activity_id INTEGER,
      kind TEXT NOT NULL CHECK (kind IN ('keyboard', 'mouse')),
      timestamp TEXT NOT NULL,
      count INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE SET NULL,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE
    )
  `);
  addColumnIfMissing(db, "input_activity", "activity_id INTEGER");
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      image_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(image_id) REFERENCES activity_media(id) ON DELETE SET NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS idle_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL DEFAULT '',
      duration INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE
    )
  `);

  return db;
}

export function insertActivity(input: ActivityInput): ActivityRecord {
  const createdAt = input.createdAt || new Date().toISOString();
  const sessionId = input.sessionId || "";
  const screenshotPaths = input.screenshotPaths || [];
  const camshotPaths = input.camshotPaths || [];
  const result = getDb()
    .prepare(
      `
        INSERT INTO activities (
          project,
          type,
          description,
          session_id,
          created_at,
          start_time,
          end_time,
          duration,
          status,
          screenshot_paths,
          camshot_paths,
          synced,
          sync_status
        )
        VALUES (?, ?, ?, ?, ?, ?, '', 0, 'completed', ?, ?, 0, 'pending')
      `,
    )
    .run(
      input.project,
      input.type,
      input.description,
      sessionId,
      createdAt,
      input.createdAt || createdAt,
      JSON.stringify(screenshotPaths),
      JSON.stringify(camshotPaths),
    );
  const activityId = Number(result.lastInsertRowid);
  const mediaStatement = getDb().prepare(
    `
      INSERT INTO activity_media (
        activity_id,
        media_type,
        file_path,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `,
  );

  screenshotPaths.forEach((filePath) => {
    mediaStatement.run(activityId, "screenshot", filePath, createdAt);
  });
  camshotPaths.forEach((filePath) => {
    mediaStatement.run(activityId, "camshot", filePath, createdAt);
  });

  return {
    id: activityId,
    project: input.project,
    type: input.type,
    description: input.description,
    sessionId,
    createdAt,
    startTime: input.createdAt || createdAt,
    endTime: "",
    duration: 0,
    status: "completed",
    screenshotPaths,
    camshotPaths,
    synced: false,
    syncStatus: "pending",
    remoteId: "",
    uploadedAt: "",
    syncedAt: "",
    uploadError: "",
  };
}

export function createActivitySession(input: {
  id: string;
  projectId: string;
  taskId?: string;
  description: string;
  startTime: string;
}): ActivitySessionRecord {
  const now = new Date().toISOString();

  getDb()
    .prepare(
      `
        INSERT INTO activity_sessions (
          id,
          project_id,
          task_id,
          description,
          start_time,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
      `,
    )
    .run(
      input.id,
      input.projectId,
      input.taskId || "",
      input.description,
      input.startTime,
      now,
      now,
    );

  return {
    id: input.id,
    projectId: input.projectId,
    taskId: input.taskId || "",
    description: input.description,
    startTime: input.startTime,
    endTime: "",
    duration: 0,
    status: "active",
  };
}

export function createActivityRow(input: {
  sessionId: string;
  project: string;
  description: string;
  startTime: string;
}) {
  closeActiveActivityRow(input.sessionId, input.startTime);

  const result = getDb()
    .prepare(
      `
        INSERT INTO activities (
          project,
          type,
          description,
          session_id,
          created_at,
          start_time,
          end_time,
          duration,
          status,
          synced,
          sync_status
        )
        VALUES (?, 'start', ?, ?, ?, ?, '', 0, 'active', 0, 'pending')
      `,
    )
    .run(
      input.project,
      input.description,
      input.sessionId,
      input.startTime,
      input.startTime,
    );

  return Number(result.lastInsertRowid);
}

export function closeActiveActivityRow(sessionId: string, endTime: string) {
  const activeActivity = getActiveActivityRow(sessionId);

  if (!activeActivity) {
    return null;
  }

  const duration = Math.max(
    0,
    Math.floor(
      (new Date(endTime).getTime() -
        new Date(activeActivity.start_time).getTime()) /
        1000,
    ),
  );

  getDb()
    .prepare(
      `
        UPDATE activities
        SET end_time = ?,
            duration = ?,
            status = 'completed'
        WHERE id = ?
      `,
    )
    .run(endTime, duration, activeActivity.id);

  return activeActivity.id;
}

export function getActiveActivityId(sessionId: string) {
  return getActiveActivityRow(sessionId)?.id || null;
}

function getActiveActivityRow(sessionId: string) {
  return getDb()
    .prepare(
      `
        SELECT id, start_time
        FROM activities
        WHERE session_id = ? AND status = 'active'
        ORDER BY start_time DESC
        LIMIT 1
      `,
    )
    .get(sessionId) as ActiveActivityRow | undefined;
}

export function updateActivitySessionStatus(
  sessionId: string,
  status: ActivitySessionStatus,
) {
  getDb()
    .prepare(
      `
        UPDATE activity_sessions
        SET status = ?, updated_at = ?
        WHERE id = ?
      `,
    )
    .run(status, new Date().toISOString(), sessionId);
}

export function stopActivitySession(sessionId: string, endTime: string) {
  const session = getActivitySession(sessionId);

  if (!session) {
    throw new Error("Activity session was not found.");
  }

  const duration = Math.max(
    0,
    Math.floor(
      (new Date(endTime).getTime() - new Date(session.startTime).getTime()) /
        1000,
    ),
  );

  getDb()
    .prepare(
      `
        UPDATE activity_sessions
        SET end_time = ?,
            duration = ?,
            status = 'stopped',
            updated_at = ?
        WHERE id = ?
      `,
    )
    .run(endTime, duration, new Date().toISOString(), sessionId);

  return {
    ...session,
    endTime,
    duration,
    status: "stopped" as const,
  };
}

export function getActivitySession(sessionId: string) {
  const row = getDb()
    .prepare(
      `
        SELECT
          id,
          project_id,
          task_id,
          description,
          start_time,
          end_time,
          duration,
          status
        FROM activity_sessions
        WHERE id = ?
      `,
    )
    .get(sessionId) as ActivitySessionRow | undefined;

  return row ? toActivitySessionRecord(row) : null;
}

export function insertActivitySessionMedia(input: ActivitySessionMediaInput) {
  const activityId = getActiveActivityId(input.sessionId);
  const result = getDb()
    .prepare(
      `
        INSERT INTO activity_media (
          activity_id,
          session_id,
          media_type,
          file_path,
          upload_status,
          approved,
          rejected,
          camera_id,
          created_at
        )
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
      `,
    )
    .run(
      activityId,
      input.sessionId,
      input.mediaType,
      input.filePath,
      input.approved ? 1 : 0,
      input.rejected ? 1 : 0,
      input.cameraId || "",
      input.timestamp,
    );

  return Number(result.lastInsertRowid);
}

export function insertActivityTimeline(input: ActivityTimelineInput) {
  const timestamp = input.timestamp || new Date().toISOString();

  getDb()
    .prepare(
      `
        INSERT INTO activity_timeline (
          session_id,
          type,
          timestamp,
          image_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
      `,
    )
    .run(
      input.sessionId,
      input.type,
      timestamp,
      input.imageId || null,
      new Date().toISOString(),
    );
}

export function insertInputActivity(input: InputActivityInput) {
  if (input.count <= 0) {
    return;
  }

  const activityId = input.activityId || getActiveActivityId(input.sessionId);

  getDb()
    .prepare(
      `
        INSERT INTO input_activity (
          session_id,
          activity_id,
          kind,
          timestamp,
          count,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .run(
      input.sessionId,
      activityId,
      input.kind,
      input.timestamp,
      input.count,
      new Date().toISOString(),
    );
}

export function startIdlePeriod(input: IdlePeriodInput) {
  getDb()
    .prepare(
      `
        INSERT INTO idle_periods (
          session_id,
          start_time,
          created_at
        )
        VALUES (?, ?, ?)
      `,
    )
    .run(input.sessionId, input.startTime, new Date().toISOString());
}

export function endIdlePeriod(input: Required<IdlePeriodInput>) {
  const duration = Math.max(
    0,
    Math.floor(
      (new Date(input.endTime).getTime() -
        new Date(input.startTime).getTime()) /
        1000,
    ),
  );

  getDb()
    .prepare(
      `
        UPDATE idle_periods
        SET end_time = ?,
            duration = ?
        WHERE id = (
          SELECT id
          FROM idle_periods
          WHERE session_id = ? AND start_time = ? AND end_time = ''
          ORDER BY id DESC
          LIMIT 1
        )
      `,
    )
    .run(input.endTime, duration, input.sessionId, input.startTime);
}

export function listRecentUnsyncedActivities(limit = 50): ActivityRecord[] {
  const rows = getDb()
    .prepare(
      `
        SELECT
          id,
          project,
          type,
          description,
          session_id,
          created_at,
          start_time,
          end_time,
          duration,
          status,
          screenshot_paths,
          camshot_paths,
          synced,
          sync_status,
          remote_id,
          uploaded_at,
          synced_at,
          upload_error
        FROM activities
        WHERE synced = 0
        ORDER BY created_at DESC
        LIMIT ?
      `,
    )
    .all(limit) as ActivityRow[];

  return rows.map(toActivityRecord);
}

export function listRecentActivitySessions(limit = 50): ActivitySessionSummaryRecord[] {
  const normalizedLimit = Math.min(Math.max(Math.floor(limit || 50), 1), 200);
  const rows = getDb()
    .prepare(
      `
        SELECT
          sessions.id,
          sessions.project_id,
          sessions.task_id,
          sessions.description,
          sessions.start_time,
          sessions.end_time,
          sessions.duration,
          sessions.status,
          COALESCE(media_counts.screenshot_count, 0) AS screenshot_count,
          COALESCE(media_counts.camshot_count, 0) AS camshot_count,
          COALESCE(input_counts.keyboard_count, 0) AS keyboard_count,
          COALESCE(input_counts.mouse_click_count, 0) AS mouse_click_count
        FROM activity_sessions sessions
        LEFT JOIN (
          SELECT
            session_id,
            SUM(CASE WHEN media_type = 'screenshot' THEN 1 ELSE 0 END) AS screenshot_count,
            SUM(CASE WHEN media_type = 'camshot' THEN 1 ELSE 0 END) AS camshot_count
          FROM activity_media
          GROUP BY session_id
        ) media_counts ON media_counts.session_id = sessions.id
        LEFT JOIN (
          SELECT
            session_id,
            SUM(CASE WHEN kind = 'keyboard' THEN count ELSE 0 END) AS keyboard_count,
            SUM(CASE WHEN kind = 'mouse' THEN count ELSE 0 END) AS mouse_click_count
          FROM input_activity
          GROUP BY session_id
        ) input_counts ON input_counts.session_id = sessions.id
        ORDER BY sessions.start_time DESC
        LIMIT ?
      `,
    )
    .all(normalizedLimit) as ActivitySessionSummaryRow[];

  return rows.map(toActivitySessionSummaryRecord);
}

export function listActivityMedia(
  filter: ActivityMediaFilter = "screenshot",
  limit = 100,
): ActivityMediaRecord[] {
  const normalizedFilter: ActivityMediaFilter =
    filter === "camshot" || filter === "all" ? filter : "screenshot";
  const normalizedLimit = Math.min(Math.max(Math.floor(limit || 100), 1), 500);
  const whereClause =
    normalizedFilter === "all" ? "" : "WHERE media.media_type = ?";
  const params =
    normalizedFilter === "all"
      ? [normalizedLimit]
      : [normalizedFilter, normalizedLimit];
  const rows = getDb()
    .prepare(
      `
        SELECT
          media.id,
          media.activity_id,
          media.media_type,
          media.file_path,
          media.upload_status,
          media.remote_id,
          media.uploaded_at,
          media.upload_error,
          media.created_at,
          COALESCE(activities.project, sessions.project_id, '') AS project,
          COALESCE(activities.type, 'start') AS activity_type,
          COALESCE(activities.description, sessions.description, '') AS description
        FROM activity_media media
        LEFT JOIN activities ON activities.id = media.activity_id
        LEFT JOIN activity_sessions sessions ON sessions.id = media.session_id
        ${whereClause}
        ORDER BY media.created_at DESC
        LIMIT ?
      `,
    )
    .all(...params) as ActivityMediaRow[];

  return rows.map(toActivityMediaRecord);
}

export function listUploadedMediaFiles(limit = 100) {
  const normalizedLimit = Math.min(Math.max(Math.floor(limit || 100), 1), 500);
  const rows = getDb()
    .prepare(
      `
        SELECT id, file_path
        FROM activity_media
        WHERE upload_status = 'uploaded'
          AND file_deleted = 0
          AND file_path != ''
        ORDER BY uploaded_at ASC, created_at ASC
        LIMIT ?
      `,
    )
    .all(normalizedLimit) as UploadedMediaFileRow[];

  return rows.map((row) => ({
    id: row.id,
    filePath: row.file_path,
  }));
}

export function markMediaFileDeleted(mediaId: number) {
  getDb()
    .prepare(
      `
        UPDATE activity_media
        SET file_deleted = 1
        WHERE id = ?
      `,
    )
    .run(mediaId);
}
