var _m = Object.defineProperty;
var Oc = (e) => {
  throw TypeError(e);
};
var Em = (e, t, n) => t in e ? _m(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var le = (e, t, n) => Em(e, typeof t != "symbol" ? t + "" : t, n), ai = (e, t, n) => t.has(e) || Oc("Cannot " + n);
var te = (e, t, n) => (ai(e, t, "read from private field"), n ? n.call(e) : t.get(e)), nt = (e, t, n) => t.has(e) ? Oc("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Me = (e, t, n, r) => (ai(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n), yt = (e, t, n) => (ai(e, t, "access private method"), n);
import yp, { BrowserWindow as zt, app as Fe, nativeImage as wm, Tray as $m, Menu as Sm, screen as Tm, ipcMain as ce, powerMonitor as Rm, systemPreferences as Ac } from "electron";
import { fileURLToPath as Om } from "node:url";
import Q from "node:path";
import Dt from "node:fs/promises";
import Am from "better-sqlite3";
import jn from "child_process";
import Ve, { resolve as Pc } from "path";
import vt from "fs";
import Pm from "constants";
import xa from "os";
import $r from "assert";
import gp, { EventEmitter as km } from "events";
import dn from "util";
import zs from "node:os";
import ve from "node:process";
import { promisify as ke, isDeepStrictEqual as kc } from "node:util";
import ne from "node:fs";
import Qn from "node:crypto";
import Nc from "node:assert";
import "node:events";
import "node:stream";
import Ae, { Readable as Nm } from "stream";
import qs from "http";
import Bs from "https";
import Pa from "url";
import xp from "crypto";
import Im from "net";
import jm from "tls";
import bp from "tty";
import _p from "http2";
import Ft from "zlib";
import { createRequire as Cm } from "node:module";
let _e = null, rt = null, Zn = null;
function Ep(e) {
  return _e = new zt({
    width: 550,
    height: 730,
    minWidth: 550,
    minHeight: 730,
    maxWidth: 550,
    maxHeight: 730,
    resizable: !1,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: Q.join(e.dirname, "preload.cjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    }
  }), e.isDev && e.viteDevServerUrl ? (_e.loadURL(e.viteDevServerUrl), _e.webContents.openDevTools()) : _e.loadFile(Q.join(e.dirname, "../renderer/index.html")), _e.on("close", (t) => {
    Fe.isQuitting || (t.preventDefault(), _e == null || _e.hide());
  }), _e;
}
function Lm(e) {
  const t = wm.createFromPath(
    Q.join(e, "../../resources/icon.png")
  );
  Zn = new $m(t);
  const n = Sm.buildFromTemplate([
    {
      label: "Open Tracker",
      click: () => {
        _e == null || _e.show();
      }
    },
    {
      label: "Start Tracking",
      click: async () => {
        console.log("Tracking Started");
      }
    },
    {
      label: "Stop Tracking",
      click: async () => {
        console.log("Tracking Stopped");
      }
    },
    {
      label: "Configuration",
      click: () => {
        wp({
          dirname: e,
          isDev: process.env.NODE_ENV === "development",
          viteDevServerUrl: process.env.VITE_DEV_SERVER_URL
        });
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        Fe.isQuitting = !0, Fe.quit();
      }
    }
  ]);
  return Zn.setToolTip("ERPNext Time Tracker"), Zn.setContextMenu(n), Zn.on("double-click", () => {
    _e == null || _e.show();
  }), Zn;
}
function Dm(e) {
  Ep(e), Lm(e.dirname);
}
function Fm(e) {
  if (zt.getAllWindows().length === 0) {
    Ep(e);
    return;
  }
  _e == null || _e.show();
}
function Um() {
  return _e;
}
function wp(e) {
  if (rt && !rt.isDestroyed())
    return rt.show(), rt.focus(), rt;
  if (rt = new zt({
    width: 760,
    height: 620,
    minWidth: 720,
    minHeight: 560,
    title: "Configuration",
    backgroundColor: "#f4f4f4",
    webPreferences: {
      preload: Q.join(e.dirname, "preload.cjs"),
      contextIsolation: !0,
      nodeIntegration: !1,
      sandbox: !1
    }
  }), e.isDev && e.viteDevServerUrl) {
    const t = new URL(e.viteDevServerUrl);
    t.searchParams.set("window", "config"), rt.loadURL(t.toString());
  } else
    rt.loadFile(Q.join(e.dirname, "../renderer/index.html"), {
      query: {
        window: "config"
      }
    });
  return rt.on("closed", () => {
    rt = null;
  }), rt;
}
let pe = null;
function $e(e, t, n) {
  try {
    e.exec(`ALTER TABLE ${t} ADD COLUMN ${n}`);
  } catch (r) {
    if (!(r instanceof Error) || !r.message.toLowerCase().includes("duplicate column"))
      throw r;
  }
}
function er(e, t, n, r) {
  return e.prepare(`PRAGMA table_info(${t})`).all().some((i) => i.name === n) ? n : r;
}
function Mm(e) {
  const n = e.prepare("PRAGMA table_info(activity_media)").all().find((l) => l.name === "activity_id");
  if (!n || n.notnull === 0)
    return;
  const r = er(e, "activity_media", "session_id", "''"), a = er(e, "activity_media", "approved", "1"), i = er(e, "activity_media", "rejected", "0"), s = er(e, "activity_media", "camera_id", "''"), o = er(e, "activity_media", "file_deleted", "0");
  e.exec("PRAGMA foreign_keys = OFF"), e.exec(`
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
      ${r},
      media_type,
      file_path,
      upload_status,
      remote_id,
      uploaded_at,
      upload_error,
      ${a},
      ${i},
      ${s},
      ${o},
      created_at
    FROM activity_media_old;
    DROP TABLE activity_media_old;
  `), e.exec("PRAGMA foreign_keys = ON");
}
function Ic(e) {
  try {
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
  } catch {
    return [];
  }
}
function zm(e) {
  return {
    id: e.id,
    project: e.project,
    type: e.type,
    description: e.description,
    sessionId: e.session_id,
    createdAt: e.created_at,
    startTime: e.start_time,
    endTime: e.end_time,
    duration: e.duration,
    status: e.status,
    screenshotPaths: Ic(e.screenshot_paths),
    camshotPaths: Ic(e.camshot_paths),
    synced: e.synced === 1,
    syncStatus: e.sync_status,
    remoteId: e.remote_id,
    uploadedAt: e.uploaded_at,
    syncedAt: e.synced_at,
    uploadError: e.upload_error
  };
}
function qm(e) {
  return {
    id: e.id,
    activityId: e.activity_id,
    mediaType: e.media_type,
    filePath: e.file_path,
    uploadStatus: e.upload_status,
    remoteId: e.remote_id,
    uploadedAt: e.uploaded_at,
    uploadError: e.upload_error,
    createdAt: e.created_at,
    project: e.project,
    activityType: e.activity_type,
    description: e.description
  };
}
function $p(e) {
  return {
    id: e.id,
    projectId: e.project_id,
    taskId: e.task_id,
    description: e.description,
    startTime: e.start_time,
    endTime: e.end_time,
    duration: e.duration,
    status: e.status
  };
}
function Bm(e) {
  return {
    ...$p(e),
    screenshotCount: e.screenshot_count || 0,
    camshotCount: e.camshot_count || 0,
    keyboardCount: e.keyboard_count || 0,
    mouseClickCount: e.mouse_click_count || 0
  };
}
function we() {
  if (pe)
    return pe;
  const e = Q.join(Fe.getPath("userData"), "time-tracker.sqlite");
  return console.log("Database path:", e), pe = new Am(e), pe.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('start', 'stop')),
      description TEXT NOT NULL,
      session_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `), $e(pe, "activities", "screenshot_paths TEXT NOT NULL DEFAULT '[]'"), $e(pe, "activities", "camshot_paths TEXT NOT NULL DEFAULT '[]'"), $e(pe, "activities", "synced INTEGER NOT NULL DEFAULT 0"), $e(pe, "activities", "sync_status TEXT NOT NULL DEFAULT 'pending'"), $e(pe, "activities", "remote_id TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "uploaded_at TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "synced_at TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "upload_error TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "start_time TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "end_time TEXT NOT NULL DEFAULT ''"), $e(pe, "activities", "duration INTEGER NOT NULL DEFAULT 0"), $e(pe, "activities", "status TEXT NOT NULL DEFAULT 'completed'"), pe.exec(`
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
  `), pe.exec(`
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
  `), Mm(pe), $e(pe, "activity_media", "session_id TEXT NOT NULL DEFAULT ''"), $e(pe, "activity_media", "approved INTEGER NOT NULL DEFAULT 1"), $e(pe, "activity_media", "rejected INTEGER NOT NULL DEFAULT 0"), $e(pe, "activity_media", "camera_id TEXT NOT NULL DEFAULT ''"), $e(pe, "activity_media", "file_deleted INTEGER NOT NULL DEFAULT 0"), pe.exec(`
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
  `), $e(pe, "input_activity", "activity_id INTEGER"), pe.exec(`
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
  `), pe.exec(`
    CREATE TABLE IF NOT EXISTS idle_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL DEFAULT '',
      duration INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES activity_sessions(id) ON DELETE CASCADE
    )
  `), pe;
}
function Vm(e) {
  const t = e.createdAt || (/* @__PURE__ */ new Date()).toISOString(), n = e.sessionId || "", r = e.screenshotPaths || [], a = e.camshotPaths || [], i = we().prepare(
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
      `
  ).run(
    e.project,
    e.type,
    e.description,
    n,
    t,
    e.createdAt || t,
    JSON.stringify(r),
    JSON.stringify(a)
  ), s = Number(i.lastInsertRowid), o = we().prepare(
    `
      INSERT INTO activity_media (
        activity_id,
        media_type,
        file_path,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `
  );
  return r.forEach((l) => {
    o.run(s, "screenshot", l, t);
  }), a.forEach((l) => {
    o.run(s, "camshot", l, t);
  }), {
    id: s,
    project: e.project,
    type: e.type,
    description: e.description,
    sessionId: n,
    createdAt: t,
    startTime: e.createdAt || t,
    endTime: "",
    duration: 0,
    status: "completed",
    screenshotPaths: r,
    camshotPaths: a,
    synced: !1,
    syncStatus: "pending",
    remoteId: "",
    uploadedAt: "",
    syncedAt: "",
    uploadError: ""
  };
}
function Hm(e) {
  const t = (/* @__PURE__ */ new Date()).toISOString();
  return we().prepare(
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
      `
  ).run(
    e.id,
    e.projectId,
    e.taskId || "",
    e.description,
    e.startTime,
    t,
    t
  ), {
    id: e.id,
    projectId: e.projectId,
    taskId: e.taskId || "",
    description: e.description,
    startTime: e.startTime,
    endTime: "",
    duration: 0,
    status: "active"
  };
}
function jc(e) {
  Sp(e.sessionId, e.startTime);
  const t = we().prepare(
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
      `
  ).run(
    e.project,
    e.description,
    e.sessionId,
    e.startTime,
    e.startTime
  );
  return Number(t.lastInsertRowid);
}
function Sp(e, t) {
  const n = Rp(e);
  if (!n)
    return null;
  const r = Math.max(
    0,
    Math.floor(
      (new Date(t).getTime() - new Date(n.start_time).getTime()) / 1e3
    )
  );
  return we().prepare(
    `
        UPDATE activities
        SET end_time = ?,
            duration = ?,
            status = 'completed'
        WHERE id = ?
      `
  ).run(t, r, n.id), n.id;
}
function Tp(e) {
  var t;
  return ((t = Rp(e)) == null ? void 0 : t.id) || null;
}
function Rp(e) {
  return we().prepare(
    `
        SELECT id, start_time
        FROM activities
        WHERE session_id = ? AND status = 'active'
        ORDER BY start_time DESC
        LIMIT 1
      `
  ).get(e);
}
function ms(e, t) {
  we().prepare(
    `
        UPDATE activity_sessions
        SET status = ?, updated_at = ?
        WHERE id = ?
      `
  ).run(t, (/* @__PURE__ */ new Date()).toISOString(), e);
}
function Gm(e, t) {
  const n = Km(e);
  if (!n)
    throw new Error("Activity session was not found.");
  const r = Math.max(
    0,
    Math.floor(
      (new Date(t).getTime() - new Date(n.startTime).getTime()) / 1e3
    )
  );
  return we().prepare(
    `
        UPDATE activity_sessions
        SET end_time = ?,
            duration = ?,
            status = 'stopped',
            updated_at = ?
        WHERE id = ?
      `
  ).run(t, r, (/* @__PURE__ */ new Date()).toISOString(), e), {
    ...n,
    endTime: t,
    duration: r,
    status: "stopped"
  };
}
function Km(e) {
  const t = we().prepare(
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
      `
  ).get(e);
  return t ? $p(t) : null;
}
function Op(e) {
  const t = Tp(e.sessionId), n = we().prepare(
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
      `
  ).run(
    t,
    e.sessionId,
    e.mediaType,
    e.filePath,
    e.approved ? 1 : 0,
    e.rejected ? 1 : 0,
    e.cameraId || "",
    e.timestamp
  );
  return Number(n.lastInsertRowid);
}
function Cn(e) {
  const t = e.timestamp || (/* @__PURE__ */ new Date()).toISOString();
  we().prepare(
    `
        INSERT INTO activity_timeline (
          session_id,
          type,
          timestamp,
          image_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
      `
  ).run(
    e.sessionId,
    e.type,
    t,
    e.imageId || null,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
function Xm(e) {
  if (e.count <= 0)
    return;
  const t = e.activityId || Tp(e.sessionId);
  we().prepare(
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
      `
  ).run(
    e.sessionId,
    t,
    e.kind,
    e.timestamp,
    e.count,
    (/* @__PURE__ */ new Date()).toISOString()
  );
}
function Wm(e) {
  we().prepare(
    `
        INSERT INTO idle_periods (
          session_id,
          start_time,
          created_at
        )
        VALUES (?, ?, ?)
      `
  ).run(e.sessionId, e.startTime, (/* @__PURE__ */ new Date()).toISOString());
}
function Cc(e) {
  const t = Math.max(
    0,
    Math.floor(
      (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / 1e3
    )
  );
  we().prepare(
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
      `
  ).run(e.endTime, t, e.sessionId, e.startTime);
}
function Ym(e = 50) {
  return we().prepare(
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
      `
  ).all(e).map(zm);
}
function Jm(e = 50) {
  const t = Math.min(Math.max(Math.floor(e || 50), 1), 200);
  return we().prepare(
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
      `
  ).all(t).map(Bm);
}
function Qm(e = "screenshot", t = 100) {
  const n = e === "camshot" || e === "all" ? e : "screenshot", r = Math.min(Math.max(Math.floor(t || 100), 1), 500), a = n === "all" ? "" : "WHERE media.media_type = ?", i = n === "all" ? [r] : [n, r];
  return we().prepare(
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
        ${a}
        ORDER BY media.created_at DESC
        LIMIT ?
      `
  ).all(...i).map(qm);
}
function Zm(e = 100) {
  const t = Math.min(Math.max(Math.floor(e || 100), 1), 500);
  return we().prepare(
    `
        SELECT id, file_path
        FROM activity_media
        WHERE upload_status = 'uploaded'
          AND file_deleted = 0
          AND file_path != ''
        ORDER BY uploaded_at ASC, created_at ASC
        LIMIT ?
      `
  ).all(t).map((r) => ({
    id: r.id,
    filePath: r.file_path
  }));
}
function eh(e) {
  we().prepare(
    `
        UPDATE activity_media
        SET file_deleted = 1
        WHERE id = ?
      `
  ).run(e);
}
var ht = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function zn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var pr = { exports: {} }, ii, Lc;
function Vs() {
  if (Lc) return ii;
  Lc = 1;
  const e = vt;
  function t(i) {
    return new Promise((s, o) => {
      e.unlink(i, function(l) {
        return l ? o(l) : s();
      });
    });
  }
  function n(i) {
    return new Promise((s, o) => {
      e.readFile(i, function(l, u) {
        if (l)
          return o(l);
        s(u);
      });
    });
  }
  function r(i) {
    return new Promise((s, o) => {
      n(i).then((l) => {
        t(i).then(() => {
          s(l);
        }).catch((u) => {
          o(u);
        });
      }).catch((l) => {
        o(l);
      });
    });
  }
  function a(i) {
    return new Promise((s, o) => {
      i.listDisplays().then((l) => {
        const u = l.map(({ id: c }) => i({ screen: c }));
        Promise.all(u).then(s).catch(o);
      }).catch(o);
    });
  }
  return ii = {
    unlinkP: t,
    readFileP: n,
    readAndUnlinkP: r,
    defaultAll: a
  }, ii;
}
var si, Dc;
function th() {
  if (Dc) return si;
  Dc = 1;
  const e = jn.exec, t = Ve, n = Vs().defaultAll, r = `Screen 0: minimum 320 x 200, current 5760 x 1080, maximum 8192 x 8192
eDP-1 connected (normal left inverted right x axis y axis)
  2560x1440     60.00 +
  1920x1440     60.00
  1856x1392     60.01
  1792x1344     60.01
  1920x1200     59.95
  1920x1080     59.93
  1600x1200     60.00
  1680x1050     59.95    59.88
  1600x1024     60.17
  1400x1050     59.98
  1280x1024     60.02
  1440x900      59.89
  1280x960      60.00
  1360x768      59.80    59.96
  1152x864      60.00
  1024x768      60.04    60.00
  960x720       60.00
  928x696       60.05
  896x672       60.01
  960x600       60.00
  960x540       59.99
  800x600       60.00    60.32    56.25
  840x525       60.01    59.88
  800x512       60.17
  700x525       59.98
  640x512       60.02
  720x450       59.89
  640x480       60.00    59.94
  680x384       59.80    59.96
  576x432       60.06
  512x384       60.00
  400x300       60.32    56.34
  320x240       60.05
DP-1 disconnected (normal left inverted right x axis y axis)
HDMI-1 connected primary 1920x1080+0+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2 disconnected (normal left inverted right x axis y axis)
HDMI-2 disconnected (normal left inverted right x axis y axis)
DP-2-1 connected 1920x1080+3840+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2-2 connected 1920x1080+1920+0 (normal left inverted right x axis y axis) 476mm x 268mm
  1920x1080     60.00*+  50.00    50.00    59.94
  1680x1050     59.88
  1600x900      60.00
  1280x1024     60.02
  1440x900      59.90
  1280x800      59.91
  1280x720      60.00    50.00    59.94
  1024x768      60.00
  800x600       60.32
  720x576       50.00
  720x480       60.00    59.94
  640x480       60.00    59.94
  720x400       70.08
DP-2-3 disconnected (normal left inverted right x axis y axis)`;
  function a(u) {
    return u.split(`
`).filter((c) => c.indexOf(" connected ") > 0).filter((c) => c.search(/\dx\d/) > 0).map((c, p) => {
      const f = c.split(" "), h = f[0], g = f[2] === "primary", m = g ? f[3] : f[2], v = m.split(/[x+]/), d = +v[0], y = +v[1], _ = +v[2], x = +v[3];
      return {
        width: d,
        height: y,
        name: h,
        id: h,
        offsetX: _,
        offsetY: x,
        primary: g,
        crop: m
      };
    });
  }
  function i() {
    return new Promise((u, c) => {
      e("xrandr --current", (p, f) => p ? c(p) : u(a(f)));
    });
  }
  function s(u) {
    let c = 0;
    return u.forEach((p) => {
      c += p.height * p.width;
    }), Math.max(c * 8, 10 * 1024 * 1024);
  }
  function o(u) {
    switch (t.extname(u)) {
      case ".jpg":
      case ".jpeg":
        return "jpeg";
      case ".png":
        return "png";
    }
    return "jpeg";
  }
  function l(u = {}) {
    return new Promise((c, p) => {
      i().then((f) => {
        const h = f.find(u.screen ? (x) => x.id === u.screen : (x) => x.primary || x.id === "default") || f[0], g = ["jpg", "jpeg", "png", "tiff", "bmp", "gif"], m = (u.format || o(u.filename || "")).toLowerCase();
        if (!g.includes(m))
          return p(new Error("Invalid format"));
        const v = u.filename ? u.filename.replace(/[^a-zA-Z0-9._\-/]/g, "") : "-", d = u.filename ? {} : {
          encoding: "buffer",
          maxBuffer: s(f)
        };
        let y, _;
        switch (u.linuxLibrary) {
          case "scrot":
            y = "scrot", _ = [v, "-e", "-z", 'echo "' + v + '"'];
            break;
          case "imagemagick":
          default:
            y = "import", _ = ["-silent", "-window", "root", "-crop", h.crop, "-screen", m + ":" + v];
            break;
        }
        jn.execFile(y, _, d, (x, E) => x ? p(x) : c(u.filename ? t.resolve(v) : E));
      });
    });
  }
  return l.listDisplays = i, l.parseDisplaysOutput = a, l.EXAMPLE_DISPLAYS_OUTPUT = r, l.all = () => n(l), si = l, si;
}
var Dr = { exports: {} }, Fr = {}, Fc;
function nh() {
  if (Fc) return Fr;
  Fc = 1;
  var e = Ve, t = process.platform === "win32", n = vt, r = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
  function a() {
    var l;
    if (r) {
      var u = new Error();
      l = c;
    } else
      l = p;
    return l;
    function c(f) {
      f && (u.message = f.message, f = u, p(f));
    }
    function p(f) {
      if (f) {
        if (process.throwDeprecation)
          throw f;
        if (!process.noDeprecation) {
          var h = "fs: missing callback " + (f.stack || f.message);
          process.traceDeprecation ? console.trace(h) : console.error(h);
        }
      }
    }
  }
  function i(l) {
    return typeof l == "function" ? l : a();
  }
  if (e.normalize, t)
    var s = /(.*?)(?:[\/\\]+|$)/g;
  else
    var s = /(.*?)(?:[\/]+|$)/g;
  if (t)
    var o = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
  else
    var o = /^[\/]*/;
  return Fr.realpathSync = function(u, c) {
    if (u = e.resolve(u), c && Object.prototype.hasOwnProperty.call(c, u))
      return c[u];
    var p = u, f = {}, h = {}, g, m, v, d;
    y();
    function y() {
      var D = o.exec(u);
      g = D[0].length, m = D[0], v = D[0], d = "", t && !h[v] && (n.lstatSync(v), h[v] = !0);
    }
    for (; g < u.length; ) {
      s.lastIndex = g;
      var _ = s.exec(u);
      if (d = m, m += _[0], v = d + _[1], g = s.lastIndex, !(h[v] || c && c[v] === v)) {
        var x;
        if (c && Object.prototype.hasOwnProperty.call(c, v))
          x = c[v];
        else {
          var E = n.lstatSync(v);
          if (!E.isSymbolicLink()) {
            h[v] = !0, c && (c[v] = v);
            continue;
          }
          var I = null;
          if (!t) {
            var C = E.dev.toString(32) + ":" + E.ino.toString(32);
            f.hasOwnProperty(C) && (I = f[C]);
          }
          I === null && (n.statSync(v), I = n.readlinkSync(v)), x = e.resolve(d, I), c && (c[v] = x), t || (f[C] = I);
        }
        u = e.resolve(x, u.slice(g)), y();
      }
    }
    return c && (c[p] = u), u;
  }, Fr.realpath = function(u, c, p) {
    if (typeof p != "function" && (p = i(c), c = null), u = e.resolve(u), c && Object.prototype.hasOwnProperty.call(c, u))
      return process.nextTick(p.bind(null, null, c[u]));
    var f = u, h = {}, g = {}, m, v, d, y;
    _();
    function _() {
      var D = o.exec(u);
      m = D[0].length, v = D[0], d = D[0], y = "", t && !g[d] ? n.lstat(d, function(S) {
        if (S) return p(S);
        g[d] = !0, x();
      }) : process.nextTick(x);
    }
    function x() {
      if (m >= u.length)
        return c && (c[f] = u), p(null, u);
      s.lastIndex = m;
      var D = s.exec(u);
      return y = v, v += D[0], d = y + D[1], m = s.lastIndex, g[d] || c && c[d] === d ? process.nextTick(x) : c && Object.prototype.hasOwnProperty.call(c, d) ? C(c[d]) : n.lstat(d, E);
    }
    function E(D, S) {
      if (D) return p(D);
      if (!S.isSymbolicLink())
        return g[d] = !0, c && (c[d] = d), process.nextTick(x);
      if (!t) {
        var R = S.dev.toString(32) + ":" + S.ino.toString(32);
        if (h.hasOwnProperty(R))
          return I(null, h[R], d);
      }
      n.stat(d, function(O) {
        if (O) return p(O);
        n.readlink(d, function(k, V) {
          t || (h[R] = V), I(k, V);
        });
      });
    }
    function I(D, S, R) {
      if (D) return p(D);
      var O = e.resolve(y, S);
      c && (c[R] = O), C(O);
    }
    function C(D) {
      u = e.resolve(D, u.slice(m)), _();
    }
  }, Fr;
}
var oi, Uc;
function Ap() {
  if (Uc) return oi;
  Uc = 1, oi = o, o.realpath = o, o.sync = l, o.realpathSync = l, o.monkeypatch = u, o.unmonkeypatch = c;
  var e = vt, t = e.realpath, n = e.realpathSync, r = process.version, a = /^v[0-5]\./.test(r), i = nh();
  function s(p) {
    return p && p.syscall === "realpath" && (p.code === "ELOOP" || p.code === "ENOMEM" || p.code === "ENAMETOOLONG");
  }
  function o(p, f, h) {
    if (a)
      return t(p, f, h);
    typeof f == "function" && (h = f, f = null), t(p, f, function(g, m) {
      s(g) ? i.realpath(p, f, h) : h(g, m);
    });
  }
  function l(p, f) {
    if (a)
      return n(p, f);
    try {
      return n(p, f);
    } catch (h) {
      if (s(h))
        return i.realpathSync(p, f);
      throw h;
    }
  }
  function u() {
    e.realpath = o, e.realpathSync = l;
  }
  function c() {
    e.realpath = t, e.realpathSync = n;
  }
  return oi;
}
var ci, Mc;
function rh() {
  if (Mc) return ci;
  Mc = 1, ci = function(t, n) {
    for (var r = [], a = 0; a < t.length; a++) {
      var i = n(t[a], a);
      e(i) ? r.push.apply(r, i) : r.push(i);
    }
    return r;
  };
  var e = Array.isArray || function(t) {
    return Object.prototype.toString.call(t) === "[object Array]";
  };
  return ci;
}
var li, zc;
function ah() {
  if (zc) return li;
  zc = 1, li = e;
  function e(r, a, i) {
    r instanceof RegExp && (r = t(r, i)), a instanceof RegExp && (a = t(a, i));
    var s = n(r, a, i);
    return s && {
      start: s[0],
      end: s[1],
      pre: i.slice(0, s[0]),
      body: i.slice(s[0] + r.length, s[1]),
      post: i.slice(s[1] + a.length)
    };
  }
  function t(r, a) {
    var i = a.match(r);
    return i ? i[0] : null;
  }
  e.range = n;
  function n(r, a, i) {
    var s, o, l, u, c, p = i.indexOf(r), f = i.indexOf(a, p + 1), h = p;
    if (p >= 0 && f > 0) {
      if (r === a)
        return [p, f];
      for (s = [], l = i.length; h >= 0 && !c; )
        h == p ? (s.push(h), p = i.indexOf(r, h + 1)) : s.length == 1 ? c = [s.pop(), f] : (o = s.pop(), o < l && (l = o, u = f), f = i.indexOf(a, h + 1)), h = p < f && p >= 0 ? p : f;
      s.length && (c = [l, u]);
    }
    return c;
  }
  return li;
}
var ui, qc;
function ih() {
  if (qc) return ui;
  qc = 1;
  var e = rh(), t = ah();
  ui = p;
  var n = "\0SLASH" + Math.random() + "\0", r = "\0OPEN" + Math.random() + "\0", a = "\0CLOSE" + Math.random() + "\0", i = "\0COMMA" + Math.random() + "\0", s = "\0PERIOD" + Math.random() + "\0";
  function o(d) {
    return parseInt(d, 10) == d ? parseInt(d, 10) : d.charCodeAt(0);
  }
  function l(d) {
    return d.split("\\\\").join(n).split("\\{").join(r).split("\\}").join(a).split("\\,").join(i).split("\\.").join(s);
  }
  function u(d) {
    return d.split(n).join("\\").split(r).join("{").split(a).join("}").split(i).join(",").split(s).join(".");
  }
  function c(d) {
    if (!d)
      return [""];
    var y = [], _ = t("{", "}", d);
    if (!_)
      return d.split(",");
    var x = _.pre, E = _.body, I = _.post, C = x.split(",");
    C[C.length - 1] += "{" + E + "}";
    var D = c(I);
    return I.length && (C[C.length - 1] += D.shift(), C.push.apply(C, D)), y.push.apply(y, C), y;
  }
  function p(d, y) {
    if (!d)
      return [];
    y = y || {};
    var _ = y.max == null ? 1 / 0 : y.max;
    return d.substr(0, 2) === "{}" && (d = "\\{\\}" + d.substr(2)), v(l(d), _, !0).map(u);
  }
  function f(d) {
    return "{" + d + "}";
  }
  function h(d) {
    return /^-?0\d/.test(d);
  }
  function g(d, y) {
    return d <= y;
  }
  function m(d, y) {
    return d >= y;
  }
  function v(d, y, _) {
    var x = [], E = t("{", "}", d);
    if (!E || /\$$/.test(E.pre)) return [d];
    var I = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(E.body), C = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(E.body), D = I || C, S = E.body.indexOf(",") >= 0;
    if (!D && !S)
      return E.post.match(/,(?!,).*\}/) ? (d = E.pre + "{" + E.body + a + E.post, v(d, y, !0)) : [d];
    var R;
    if (D)
      R = E.body.split(/\.\./);
    else if (R = c(E.body), R.length === 1 && (R = v(R[0], y, !1).map(f), R.length === 1)) {
      var k = E.post.length ? v(E.post, y, !1) : [""];
      return k.map(function(X) {
        return E.pre + R[0] + X;
      });
    }
    var O = E.pre, k = E.post.length ? v(E.post, y, !1) : [""], V;
    if (D) {
      var P = o(R[0]), F = o(R[1]), H = Math.max(R[0].length, R[1].length), j = R.length == 3 ? Math.max(Math.abs(o(R[2])), 1) : 1, U = g, B = F < P;
      B && (j *= -1, U = m);
      var L = R.some(h);
      V = [];
      for (var $ = P; U($, F); $ += j) {
        var N;
        if (C)
          N = String.fromCharCode($), N === "\\" && (N = "");
        else if (N = String($), L) {
          var T = H - N.length;
          if (T > 0) {
            var b = new Array(T + 1).join("0");
            $ < 0 ? N = "-" + b + N.slice(1) : N = b + N;
          }
        }
        V.push(N);
      }
    } else
      V = e(R, function(z) {
        return v(z, y, !1);
      });
    for (var w = 0; w < V.length; w++)
      for (var M = 0; M < k.length && x.length < y; M++) {
        var q = O + V[w] + k[M];
        (!_ || D || q) && x.push(q);
      }
    return x;
  }
  return ui;
}
var pi, Bc;
function Hs() {
  if (Bc) return pi;
  Bc = 1, pi = h, h.Minimatch = g;
  var e = function() {
    try {
      return require("path");
    } catch {
    }
  }() || {
    sep: "/"
  };
  h.sep = e.sep;
  var t = h.GLOBSTAR = g.GLOBSTAR = {}, n = ih(), r = {
    "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
    "?": { open: "(?:", close: ")?" },
    "+": { open: "(?:", close: ")+" },
    "*": { open: "(?:", close: ")*" },
    "@": { open: "(?:", close: ")" }
  }, a = "[^/]", i = a + "*?", s = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?", o = "(?:(?!(?:\\/|^)\\.).)*?", l = u("().*{}+?[]^$\\!");
  function u(S) {
    return S.split("").reduce(function(R, O) {
      return R[O] = !0, R;
    }, {});
  }
  var c = /\/+/;
  h.filter = p;
  function p(S, R) {
    return R = R || {}, function(O, k, V) {
      return h(O, S, R);
    };
  }
  function f(S, R) {
    R = R || {};
    var O = {};
    return Object.keys(S).forEach(function(k) {
      O[k] = S[k];
    }), Object.keys(R).forEach(function(k) {
      O[k] = R[k];
    }), O;
  }
  h.defaults = function(S) {
    if (!S || typeof S != "object" || !Object.keys(S).length)
      return h;
    var R = h, O = function(V, P, F) {
      return R(V, P, f(S, F));
    };
    return O.Minimatch = function(V, P) {
      return new R.Minimatch(V, f(S, P));
    }, O.Minimatch.defaults = function(V) {
      return R.defaults(f(S, V)).Minimatch;
    }, O.filter = function(V, P) {
      return R.filter(V, f(S, P));
    }, O.defaults = function(V) {
      return R.defaults(f(S, V));
    }, O.makeRe = function(V, P) {
      return R.makeRe(V, f(S, P));
    }, O.braceExpand = function(V, P) {
      return R.braceExpand(V, f(S, P));
    }, O.match = function(k, V, P) {
      return R.match(k, V, f(S, P));
    }, O;
  }, g.defaults = function(S) {
    return h.defaults(S).Minimatch;
  };
  function h(S, R, O) {
    return _(R), O || (O = {}), !O.nocomment && R.charAt(0) === "#" ? !1 : new g(R, O).match(S);
  }
  function g(S, R) {
    if (!(this instanceof g))
      return new g(S, R);
    _(S), R || (R = {}), S = S.trim(), !R.allowWindowsEscape && e.sep !== "/" && (S = S.split(e.sep).join("/")), this.options = R, this.maxGlobstarRecursion = R.maxGlobstarRecursion !== void 0 ? R.maxGlobstarRecursion : 200, this.set = [], this.pattern = S, this.regexp = null, this.negate = !1, this.comment = !1, this.empty = !1, this.partial = !!R.partial, this.make();
  }
  g.prototype.debug = function() {
  }, g.prototype.make = m;
  function m() {
    var S = this.pattern, R = this.options;
    if (!R.nocomment && S.charAt(0) === "#") {
      this.comment = !0;
      return;
    }
    if (!S) {
      this.empty = !0;
      return;
    }
    this.parseNegate();
    var O = this.globSet = this.braceExpand();
    R.debug && (this.debug = function() {
      console.error.apply(console, arguments);
    }), this.debug(this.pattern, O), O = this.globParts = O.map(function(k) {
      return k.split(c);
    }), this.debug(this.pattern, O), O = O.map(function(k, V, P) {
      return k.map(this.parse, this);
    }, this), this.debug(this.pattern, O), O = O.filter(function(k) {
      return k.indexOf(!1) === -1;
    }), this.debug(this.pattern, O), this.set = O;
  }
  g.prototype.parseNegate = v;
  function v() {
    var S = this.pattern, R = !1, O = this.options, k = 0;
    if (!O.nonegate) {
      for (var V = 0, P = S.length; V < P && S.charAt(V) === "!"; V++)
        R = !R, k++;
      k && (this.pattern = S.substr(k)), this.negate = R;
    }
  }
  h.braceExpand = function(S, R) {
    return d(S, R);
  }, g.prototype.braceExpand = d;
  function d(S, R) {
    return R || (this instanceof g ? R = this.options : R = {}), S = typeof S > "u" ? this.pattern : S, _(S), R.nobrace || !/\{(?:(?!\{).)*\}/.test(S) ? [S] : n(S);
  }
  var y = 1024 * 64, _ = function(S) {
    if (typeof S != "string")
      throw new TypeError("invalid pattern");
    if (S.length > y)
      throw new TypeError("pattern is too long");
  };
  g.prototype.parse = E;
  var x = {};
  function E(S, R) {
    _(S);
    var O = this.options;
    if (S === "**")
      if (O.noglobstar)
        S = "*";
      else
        return t;
    if (S === "") return "";
    var k = "", V = !!O.nocase, P = !1, F = [], H = [], j, U = !1, B = -1, L = -1, $ = S.charAt(0) === "." ? "" : O.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)", N = this;
    function T() {
      if (j) {
        switch (j) {
          case "*":
            k += i, V = !0;
            break;
          case "?":
            k += a, V = !0;
            break;
          default:
            k += "\\" + j;
            break;
        }
        N.debug("clearStateChar %j %j", j, k), j = !1;
      }
    }
    for (var b = 0, w = S.length, M; b < w && (M = S.charAt(b)); b++) {
      if (this.debug("%s	%s %s %j", S, b, k, M), P && l[M]) {
        k += "\\" + M, P = !1;
        continue;
      }
      switch (M) {
        case "/":
          return !1;
        case "\\":
          T(), P = !0;
          continue;
        case "?":
        case "*":
        case "+":
        case "@":
        case "!":
          if (this.debug("%s	%s %s %j <-- stateChar", S, b, k, M), U) {
            this.debug("  in class"), M === "!" && b === L + 1 && (M = "^"), k += M;
            continue;
          }
          if (M === "*" && j === "*") continue;
          N.debug("call clearStateChar %j", j), T(), j = M, O.noext && T();
          continue;
        case "(":
          if (U) {
            k += "(";
            continue;
          }
          if (!j) {
            k += "\\(";
            continue;
          }
          F.push({
            type: j,
            start: b - 1,
            reStart: k.length,
            open: r[j].open,
            close: r[j].close
          }), k += j === "!" ? "(?:(?!(?:" : "(?:", this.debug("plType %j %j", j, k), j = !1;
          continue;
        case ")":
          if (U || !F.length) {
            k += "\\)";
            continue;
          }
          T(), V = !0;
          var q = F.pop();
          k += q.close, q.type === "!" && H.push(q), q.reEnd = k.length;
          continue;
        case "|":
          if (U || !F.length || P) {
            k += "\\|", P = !1;
            continue;
          }
          T(), k += "|";
          continue;
        case "[":
          if (T(), U) {
            k += "\\" + M;
            continue;
          }
          U = !0, L = b, B = k.length, k += M;
          continue;
        case "]":
          if (b === L + 1 || !U) {
            k += "\\" + M, P = !1;
            continue;
          }
          var z = S.substring(L + 1, b);
          try {
            RegExp("[" + z + "]");
          } catch {
            var X = this.parse(z, x);
            k = k.substr(0, B) + "\\[" + X[0] + "\\]", V = V || X[1], U = !1;
            continue;
          }
          V = !0, U = !1, k += M;
          continue;
        default:
          T(), P ? P = !1 : l[M] && !(M === "^" && U) && (k += "\\"), k += M;
      }
    }
    for (U && (z = S.substr(L + 1), X = this.parse(z, x), k = k.substr(0, B) + "\\[" + X[0], V = V || X[1]), q = F.pop(); q; q = F.pop()) {
      var W = k.slice(q.reStart + q.open.length);
      this.debug("setting tail", k, q), W = W.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(yn, St, Vt) {
        return Vt || (Vt = "\\"), St + St + Vt + "|";
      }), this.debug(`tail=%j
   %s`, W, W, q, k);
      var J = q.type === "*" ? i : q.type === "?" ? a : "\\" + q.type;
      V = !0, k = k.slice(0, q.reStart) + J + "\\(" + W;
    }
    T(), P && (k += "\\\\");
    var ue = !1;
    switch (k.charAt(0)) {
      case "[":
      case ".":
      case "(":
        ue = !0;
    }
    for (var fe = H.length - 1; fe > -1; fe--) {
      var ie = H[fe], Ge = k.slice(0, ie.reStart), tt = k.slice(ie.reStart, ie.reEnd - 8), me = k.slice(ie.reEnd - 8, ie.reEnd), Ye = k.slice(ie.reEnd);
      me += Ye;
      var Wn = Ge.split("(").length - 1, qt = Ye;
      for (b = 0; b < Wn; b++)
        qt = qt.replace(/\)[+*?]?/, "");
      Ye = qt;
      var vn = "";
      Ye === "" && R !== x && (vn = "$");
      var Yn = Ge + tt + Ye + vn + me;
      k = Yn;
    }
    if (k !== "" && V && (k = "(?=.)" + k), ue && (k = $ + k), R === x)
      return [k, V];
    if (!V)
      return C(S);
    var Jn = O.nocase ? "i" : "";
    try {
      var Bt = new RegExp("^" + k + "$", Jn);
    } catch {
      return new RegExp("$.");
    }
    return Bt._glob = S, Bt._src = k, Bt;
  }
  h.makeRe = function(S, R) {
    return new g(S, R || {}).makeRe();
  }, g.prototype.makeRe = I;
  function I() {
    if (this.regexp || this.regexp === !1) return this.regexp;
    var S = this.set;
    if (!S.length)
      return this.regexp = !1, this.regexp;
    var R = this.options, O = R.noglobstar ? i : R.dot ? s : o, k = R.nocase ? "i" : "", V = S.map(function(P) {
      return P.map(function(F) {
        return F === t ? O : typeof F == "string" ? D(F) : F._src;
      }).join("\\/");
    }).join("|");
    V = "^(?:" + V + ")$", this.negate && (V = "^(?!" + V + ").*$");
    try {
      this.regexp = new RegExp(V, k);
    } catch {
      this.regexp = !1;
    }
    return this.regexp;
  }
  h.match = function(S, R, O) {
    O = O || {};
    var k = new g(R, O);
    return S = S.filter(function(V) {
      return k.match(V);
    }), k.options.nonull && !S.length && S.push(R), S;
  }, g.prototype.match = function(R, O) {
    if (typeof O > "u" && (O = this.partial), this.debug("match", R, this.pattern), this.comment) return !1;
    if (this.empty) return R === "";
    if (R === "/" && O) return !0;
    var k = this.options;
    e.sep !== "/" && (R = R.split(e.sep).join("/")), R = R.split(c), this.debug(this.pattern, "split", R);
    var V = this.set;
    this.debug(this.pattern, "set", V);
    var P, F;
    for (F = R.length - 1; F >= 0 && (P = R[F], !P); F--)
      ;
    for (F = 0; F < V.length; F++) {
      var H = V[F], j = R;
      k.matchBase && H.length === 1 && (j = [P]);
      var U = this.matchOne(j, H, O);
      if (U)
        return k.flipNegate ? !0 : !this.negate;
    }
    return k.flipNegate ? !1 : this.negate;
  }, g.prototype.matchOne = function(S, R, O) {
    return R.indexOf(t) !== -1 ? this._matchGlobstar(S, R, O, 0, 0) : this._matchOne(S, R, O, 0, 0);
  }, g.prototype._matchGlobstar = function(S, R, O, k, V) {
    var P, F = -1;
    for (P = V; P < R.length; P++)
      if (R[P] === t) {
        F = P;
        break;
      }
    var H = -1;
    for (P = R.length - 1; P >= 0; P--)
      if (R[P] === t) {
        H = P;
        break;
      }
    var j = R.slice(V, F), U = O ? R.slice(F + 1) : R.slice(F + 1, H), B = O ? [] : R.slice(H + 1);
    if (j.length) {
      var L = S.slice(k, k + j.length);
      if (!this._matchOne(L, j, O, 0, 0))
        return !1;
      k += j.length;
    }
    var $ = 0;
    if (B.length) {
      if (B.length + k > S.length) return !1;
      var N = S.length - B.length;
      if (this._matchOne(S, B, O, N, 0))
        $ = B.length;
      else {
        if (S[S.length - 1] !== "" || k + B.length === S.length || (N--, !this._matchOne(S, B, O, N, 0)))
          return !1;
        $ = B.length + 1;
      }
    }
    if (!U.length) {
      var T = !!$;
      for (P = k; P < S.length - $; P++) {
        var b = String(S[P]);
        if (T = !0, b === "." || b === ".." || !this.options.dot && b.charAt(0) === ".")
          return !1;
      }
      return O || T;
    }
    for (var w = [[[], 0]], M = w[0], q = 0, z = [0], X = 0; X < U.length; X++) {
      var W = U[X];
      W === t ? (z.push(q), M = [[], 0], w.push(M)) : (M[0].push(W), q++);
    }
    for (var J = w.length - 1, ue = S.length - $, fe = 0; fe < w.length; fe++)
      w[fe][1] = ue - (z[J--] + w[fe][0].length);
    return !!this._matchGlobStarBodySections(
      S,
      w,
      k,
      0,
      O,
      0,
      !!$
    );
  }, g.prototype._matchGlobStarBodySections = function(S, R, O, k, V, P, F) {
    var H = R[k];
    if (!H) {
      for (var j = O; j < S.length; j++) {
        F = !0;
        var U = S[j];
        if (U === "." || U === ".." || !this.options.dot && U.charAt(0) === ".")
          return !1;
      }
      return F;
    }
    for (var B = H[0], L = H[1]; O <= L; ) {
      var $ = this._matchOne(
        S.slice(0, O + B.length),
        B,
        V,
        O,
        0
      );
      if ($ && P < this.maxGlobstarRecursion) {
        var N = this._matchGlobStarBodySections(
          S,
          R,
          O + B.length,
          k + 1,
          V,
          P + 1,
          F
        );
        if (N !== !1)
          return N;
      }
      var U = S[O];
      if (U === "." || U === ".." || !this.options.dot && U.charAt(0) === ".")
        return !1;
      O++;
    }
    return V || null;
  }, g.prototype._matchOne = function(S, R, O, k, V) {
    var P, F, H, j;
    for (P = k, F = V, H = S.length, j = R.length; P < H && F < j; P++, F++) {
      this.debug("matchOne loop");
      var U = R[F], B = S[P];
      if (this.debug(R, U, B), U === !1 || U === t) return !1;
      var L;
      if (typeof U == "string" ? (L = B === U, this.debug("string match", U, B, L)) : (L = B.match(U), this.debug("pattern match", U, B, L)), !L) return !1;
    }
    if (P === H && F === j)
      return !0;
    if (P === H)
      return O;
    if (F === j)
      return P === H - 1 && S[P] === "";
    throw new Error("wtf?");
  };
  function C(S) {
    return S.replace(/\\(.)/g, "$1");
  }
  function D(S) {
    return S.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  return pi;
}
var Ur = { exports: {} }, Mr = { exports: {} }, Vc;
function sh() {
  return Vc || (Vc = 1, typeof Object.create == "function" ? Mr.exports = function(t, n) {
    n && (t.super_ = n, t.prototype = Object.create(n.prototype, {
      constructor: {
        value: t,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : Mr.exports = function(t, n) {
    if (n) {
      t.super_ = n;
      var r = function() {
      };
      r.prototype = n.prototype, t.prototype = new r(), t.prototype.constructor = t;
    }
  }), Mr.exports;
}
var Hc;
function oh() {
  if (Hc) return Ur.exports;
  Hc = 1;
  try {
    var e = require("util");
    if (typeof e.inherits != "function") throw "";
    Ur.exports = e.inherits;
  } catch {
    Ur.exports = sh();
  }
  return Ur.exports;
}
var tr = { exports: {} }, Gc;
function Gs() {
  if (Gc) return tr.exports;
  Gc = 1;
  function e(n) {
    return n.charAt(0) === "/";
  }
  function t(n) {
    var r = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/, a = r.exec(n), i = a[1] || "", s = !!(i && i.charAt(1) !== ":");
    return !!(a[2] || s);
  }
  return tr.exports = process.platform === "win32" ? t : e, tr.exports.posix = e, tr.exports.win32 = t, tr.exports;
}
var gt = {}, Kc;
function Pp() {
  if (Kc) return gt;
  Kc = 1, gt.setopts = u, gt.ownProp = e, gt.makeAbs = f, gt.finish = c, gt.mark = p, gt.isIgnored = h, gt.childrenIgnored = g;
  function e(m, v) {
    return Object.prototype.hasOwnProperty.call(m, v);
  }
  var t = vt, n = Ve, r = Hs(), a = Gs(), i = r.Minimatch;
  function s(m, v) {
    return m.localeCompare(v, "en");
  }
  function o(m, v) {
    m.ignore = v.ignore || [], Array.isArray(m.ignore) || (m.ignore = [m.ignore]), m.ignore.length && (m.ignore = m.ignore.map(l));
  }
  function l(m) {
    var v = null;
    if (m.slice(-3) === "/**") {
      var d = m.replace(/(\/\*\*)+$/, "");
      v = new i(d, { dot: !0 });
    }
    return {
      matcher: new i(m, { dot: !0 }),
      gmatcher: v
    };
  }
  function u(m, v, d) {
    if (d || (d = {}), d.matchBase && v.indexOf("/") === -1) {
      if (d.noglobstar)
        throw new Error("base matching requires globstar");
      v = "**/" + v;
    }
    m.silent = !!d.silent, m.pattern = v, m.strict = d.strict !== !1, m.realpath = !!d.realpath, m.realpathCache = d.realpathCache || /* @__PURE__ */ Object.create(null), m.follow = !!d.follow, m.dot = !!d.dot, m.mark = !!d.mark, m.nodir = !!d.nodir, m.nodir && (m.mark = !0), m.sync = !!d.sync, m.nounique = !!d.nounique, m.nonull = !!d.nonull, m.nosort = !!d.nosort, m.nocase = !!d.nocase, m.stat = !!d.stat, m.noprocess = !!d.noprocess, m.absolute = !!d.absolute, m.fs = d.fs || t, m.maxLength = d.maxLength || 1 / 0, m.cache = d.cache || /* @__PURE__ */ Object.create(null), m.statCache = d.statCache || /* @__PURE__ */ Object.create(null), m.symlinks = d.symlinks || /* @__PURE__ */ Object.create(null), o(m, d), m.changedCwd = !1;
    var y = process.cwd();
    e(d, "cwd") ? (m.cwd = n.resolve(d.cwd), m.changedCwd = m.cwd !== y) : m.cwd = y, m.root = d.root || n.resolve(m.cwd, "/"), m.root = n.resolve(m.root), process.platform === "win32" && (m.root = m.root.replace(/\\/g, "/")), m.cwdAbs = a(m.cwd) ? m.cwd : f(m, m.cwd), process.platform === "win32" && (m.cwdAbs = m.cwdAbs.replace(/\\/g, "/")), m.nomount = !!d.nomount, d.nonegate = !0, d.nocomment = !0, d.allowWindowsEscape = !1, m.minimatch = new i(v, d), m.options = m.minimatch.options;
  }
  function c(m) {
    for (var v = m.nounique, d = v ? [] : /* @__PURE__ */ Object.create(null), y = 0, _ = m.matches.length; y < _; y++) {
      var x = m.matches[y];
      if (!x || Object.keys(x).length === 0) {
        if (m.nonull) {
          var E = m.minimatch.globSet[y];
          v ? d.push(E) : d[E] = !0;
        }
      } else {
        var I = Object.keys(x);
        v ? d.push.apply(d, I) : I.forEach(function(C) {
          d[C] = !0;
        });
      }
    }
    if (v || (d = Object.keys(d)), m.nosort || (d = d.sort(s)), m.mark) {
      for (var y = 0; y < d.length; y++)
        d[y] = m._mark(d[y]);
      m.nodir && (d = d.filter(function(C) {
        var D = !/\/$/.test(C), S = m.cache[C] || m.cache[f(m, C)];
        return D && S && (D = S !== "DIR" && !Array.isArray(S)), D;
      }));
    }
    m.ignore.length && (d = d.filter(function(C) {
      return !h(m, C);
    })), m.found = d;
  }
  function p(m, v) {
    var d = f(m, v), y = m.cache[d], _ = v;
    if (y) {
      var x = y === "DIR" || Array.isArray(y), E = v.slice(-1) === "/";
      if (x && !E ? _ += "/" : !x && E && (_ = _.slice(0, -1)), _ !== v) {
        var I = f(m, _);
        m.statCache[I] = m.statCache[d], m.cache[I] = m.cache[d];
      }
    }
    return _;
  }
  function f(m, v) {
    var d = v;
    return v.charAt(0) === "/" ? d = n.join(m.root, v) : a(v) || v === "" ? d = v : m.changedCwd ? d = n.resolve(m.cwd, v) : d = n.resolve(v), process.platform === "win32" && (d = d.replace(/\\/g, "/")), d;
  }
  function h(m, v) {
    return m.ignore.length ? m.ignore.some(function(d) {
      return d.matcher.match(v) || !!(d.gmatcher && d.gmatcher.match(v));
    }) : !1;
  }
  function g(m, v) {
    return m.ignore.length ? m.ignore.some(function(d) {
      return !!(d.gmatcher && d.gmatcher.match(v));
    }) : !1;
  }
  return gt;
}
var di, Xc;
function ch() {
  if (Xc) return di;
  Xc = 1, di = c, c.GlobSync = p;
  var e = Ap(), t = Hs();
  t.Minimatch, Ip().Glob;
  var n = Ve, r = $r, a = Gs(), i = Pp(), s = i.setopts, o = i.ownProp, l = i.childrenIgnored, u = i.isIgnored;
  function c(f, h) {
    if (typeof h == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    return new p(f, h).found;
  }
  function p(f, h) {
    if (!f)
      throw new Error("must provide pattern");
    if (typeof h == "function" || arguments.length === 3)
      throw new TypeError(`callback provided to sync glob
See: https://github.com/isaacs/node-glob/issues/167`);
    if (!(this instanceof p))
      return new p(f, h);
    if (s(this, f, h), this.noprocess)
      return this;
    var g = this.minimatch.set.length;
    this.matches = new Array(g);
    for (var m = 0; m < g; m++)
      this._process(this.minimatch.set[m], m, !1);
    this._finish();
  }
  return p.prototype._finish = function() {
    if (r.ok(this instanceof p), this.realpath) {
      var f = this;
      this.matches.forEach(function(h, g) {
        var m = f.matches[g] = /* @__PURE__ */ Object.create(null);
        for (var v in h)
          try {
            v = f._makeAbs(v);
            var d = e.realpathSync(v, f.realpathCache);
            m[d] = !0;
          } catch (y) {
            if (y.syscall === "stat")
              m[f._makeAbs(v)] = !0;
            else
              throw y;
          }
      });
    }
    i.finish(this);
  }, p.prototype._process = function(f, h, g) {
    r.ok(this instanceof p);
    for (var m = 0; typeof f[m] == "string"; )
      m++;
    var v;
    switch (m) {
      case f.length:
        this._processSimple(f.join("/"), h);
        return;
      case 0:
        v = null;
        break;
      default:
        v = f.slice(0, m).join("/");
        break;
    }
    var d = f.slice(m), y;
    v === null ? y = "." : ((a(v) || a(f.map(function(E) {
      return typeof E == "string" ? E : "[*]";
    }).join("/"))) && (!v || !a(v)) && (v = "/" + v), y = v);
    var _ = this._makeAbs(y);
    if (!l(this, y)) {
      var x = d[0] === t.GLOBSTAR;
      x ? this._processGlobStar(v, y, _, d, h, g) : this._processReaddir(v, y, _, d, h, g);
    }
  }, p.prototype._processReaddir = function(f, h, g, m, v, d) {
    var y = this._readdir(g, d);
    if (y) {
      for (var _ = m[0], x = !!this.minimatch.negate, E = _._glob, I = this.dot || E.charAt(0) === ".", C = [], D = 0; D < y.length; D++) {
        var S = y[D];
        if (S.charAt(0) !== "." || I) {
          var R;
          x && !f ? R = !S.match(_) : R = S.match(_), R && C.push(S);
        }
      }
      var O = C.length;
      if (O !== 0) {
        if (m.length === 1 && !this.mark && !this.stat) {
          this.matches[v] || (this.matches[v] = /* @__PURE__ */ Object.create(null));
          for (var D = 0; D < O; D++) {
            var S = C[D];
            f && (f.slice(-1) !== "/" ? S = f + "/" + S : S = f + S), S.charAt(0) === "/" && !this.nomount && (S = n.join(this.root, S)), this._emitMatch(v, S);
          }
          return;
        }
        m.shift();
        for (var D = 0; D < O; D++) {
          var S = C[D], k;
          f ? k = [f, S] : k = [S], this._process(k.concat(m), v, d);
        }
      }
    }
  }, p.prototype._emitMatch = function(f, h) {
    if (!u(this, h)) {
      var g = this._makeAbs(h);
      if (this.mark && (h = this._mark(h)), this.absolute && (h = g), !this.matches[f][h]) {
        if (this.nodir) {
          var m = this.cache[g];
          if (m === "DIR" || Array.isArray(m))
            return;
        }
        this.matches[f][h] = !0, this.stat && this._stat(h);
      }
    }
  }, p.prototype._readdirInGlobStar = function(f) {
    if (this.follow)
      return this._readdir(f, !1);
    var h, g;
    try {
      g = this.fs.lstatSync(f);
    } catch (v) {
      if (v.code === "ENOENT")
        return null;
    }
    var m = g && g.isSymbolicLink();
    return this.symlinks[f] = m, !m && g && !g.isDirectory() ? this.cache[f] = "FILE" : h = this._readdir(f, !1), h;
  }, p.prototype._readdir = function(f, h) {
    if (h && !o(this.symlinks, f))
      return this._readdirInGlobStar(f);
    if (o(this.cache, f)) {
      var g = this.cache[f];
      if (!g || g === "FILE")
        return null;
      if (Array.isArray(g))
        return g;
    }
    try {
      return this._readdirEntries(f, this.fs.readdirSync(f));
    } catch (m) {
      return this._readdirError(f, m), null;
    }
  }, p.prototype._readdirEntries = function(f, h) {
    if (!this.mark && !this.stat)
      for (var g = 0; g < h.length; g++) {
        var m = h[g];
        f === "/" ? m = f + m : m = f + "/" + m, this.cache[m] = !0;
      }
    return this.cache[f] = h, h;
  }, p.prototype._readdirError = function(f, h) {
    switch (h.code) {
      case "ENOTSUP":
      case "ENOTDIR":
        var g = this._makeAbs(f);
        if (this.cache[g] = "FILE", g === this.cwdAbs) {
          var m = new Error(h.code + " invalid cwd " + this.cwd);
          throw m.path = this.cwd, m.code = h.code, m;
        }
        break;
      case "ENOENT":
      case "ELOOP":
      case "ENAMETOOLONG":
      case "UNKNOWN":
        this.cache[this._makeAbs(f)] = !1;
        break;
      default:
        if (this.cache[this._makeAbs(f)] = !1, this.strict)
          throw h;
        this.silent || console.error("glob error", h);
        break;
    }
  }, p.prototype._processGlobStar = function(f, h, g, m, v, d) {
    var y = this._readdir(g, d);
    if (y) {
      var _ = m.slice(1), x = f ? [f] : [], E = x.concat(_);
      this._process(E, v, !1);
      var I = y.length, C = this.symlinks[g];
      if (!(C && d))
        for (var D = 0; D < I; D++) {
          var S = y[D];
          if (!(S.charAt(0) === "." && !this.dot)) {
            var R = x.concat(y[D], _);
            this._process(R, v, !0);
            var O = x.concat(y[D], m);
            this._process(O, v, !0);
          }
        }
    }
  }, p.prototype._processSimple = function(f, h) {
    var g = this._stat(f);
    if (this.matches[h] || (this.matches[h] = /* @__PURE__ */ Object.create(null)), !!g) {
      if (f && a(f) && !this.nomount) {
        var m = /[\/\\]$/.test(f);
        f.charAt(0) === "/" ? f = n.join(this.root, f) : (f = n.resolve(this.root, f), m && (f += "/"));
      }
      process.platform === "win32" && (f = f.replace(/\\/g, "/")), this._emitMatch(h, f);
    }
  }, p.prototype._stat = function(f) {
    var h = this._makeAbs(f), g = f.slice(-1) === "/";
    if (f.length > this.maxLength)
      return !1;
    if (!this.stat && o(this.cache, h)) {
      var d = this.cache[h];
      if (Array.isArray(d) && (d = "DIR"), !g || d === "DIR")
        return d;
      if (g && d === "FILE")
        return !1;
    }
    var m = this.statCache[h];
    if (!m) {
      var v;
      try {
        v = this.fs.lstatSync(h);
      } catch (y) {
        if (y && (y.code === "ENOENT" || y.code === "ENOTDIR"))
          return this.statCache[h] = !1, !1;
      }
      if (v && v.isSymbolicLink())
        try {
          m = this.fs.statSync(h);
        } catch {
          m = v;
        }
      else
        m = v;
    }
    this.statCache[h] = m;
    var d = !0;
    return m && (d = m.isDirectory() ? "DIR" : "FILE"), this.cache[h] = this.cache[h] || d, g && d === "FILE" ? !1 : d;
  }, p.prototype._mark = function(f) {
    return i.mark(this, f);
  }, p.prototype._makeAbs = function(f) {
    return i.makeAbs(this, f);
  }, di;
}
var fi, Wc;
function kp() {
  if (Wc) return fi;
  Wc = 1, fi = e;
  function e(t, n) {
    if (t && n) return e(t)(n);
    if (typeof t != "function")
      throw new TypeError("need wrapper function");
    return Object.keys(t).forEach(function(a) {
      r[a] = t[a];
    }), r;
    function r() {
      for (var a = new Array(arguments.length), i = 0; i < a.length; i++)
        a[i] = arguments[i];
      var s = t.apply(this, a), o = a[a.length - 1];
      return typeof s == "function" && s !== o && Object.keys(o).forEach(function(l) {
        s[l] = o[l];
      }), s;
    }
  }
  return fi;
}
var zr = { exports: {} }, Yc;
function Np() {
  if (Yc) return zr.exports;
  Yc = 1;
  var e = kp();
  zr.exports = e(t), zr.exports.strict = e(n), t.proto = t(function() {
    Object.defineProperty(Function.prototype, "once", {
      value: function() {
        return t(this);
      },
      configurable: !0
    }), Object.defineProperty(Function.prototype, "onceStrict", {
      value: function() {
        return n(this);
      },
      configurable: !0
    });
  });
  function t(r) {
    var a = function() {
      return a.called ? a.value : (a.called = !0, a.value = r.apply(this, arguments));
    };
    return a.called = !1, a;
  }
  function n(r) {
    var a = function() {
      if (a.called)
        throw new Error(a.onceError);
      return a.called = !0, a.value = r.apply(this, arguments);
    }, i = r.name || "Function wrapped with `once`";
    return a.onceError = i + " shouldn't be called more than once", a.called = !1, a;
  }
  return zr.exports;
}
var mi, Jc;
function lh() {
  if (Jc) return mi;
  Jc = 1;
  var e = kp(), t = /* @__PURE__ */ Object.create(null), n = Np();
  mi = e(r);
  function r(s, o) {
    return t[s] ? (t[s].push(o), null) : (t[s] = [o], a(s));
  }
  function a(s) {
    return n(function o() {
      var l = t[s], u = l.length, c = i(arguments);
      try {
        for (var p = 0; p < u; p++)
          l[p].apply(null, c);
      } finally {
        l.length > u ? (l.splice(0, u), process.nextTick(function() {
          o.apply(null, c);
        })) : delete t[s];
      }
    });
  }
  function i(s) {
    for (var o = s.length, l = [], u = 0; u < o; u++) l[u] = s[u];
    return l;
  }
  return mi;
}
var hi, Qc;
function Ip() {
  if (Qc) return hi;
  Qc = 1, hi = m;
  var e = Ap(), t = Hs();
  t.Minimatch;
  var n = oh(), r = gp.EventEmitter, a = Ve, i = $r, s = Gs(), o = ch(), l = Pp(), u = l.setopts, c = l.ownProp, p = lh(), f = l.childrenIgnored, h = l.isIgnored, g = Np();
  function m(x, E, I) {
    if (typeof E == "function" && (I = E, E = {}), E || (E = {}), E.sync) {
      if (I)
        throw new TypeError("callback provided to sync glob");
      return o(x, E);
    }
    return new y(x, E, I);
  }
  m.sync = o;
  var v = m.GlobSync = o.GlobSync;
  m.glob = m;
  function d(x, E) {
    if (E === null || typeof E != "object")
      return x;
    for (var I = Object.keys(E), C = I.length; C--; )
      x[I[C]] = E[I[C]];
    return x;
  }
  m.hasMagic = function(x, E) {
    var I = d({}, E);
    I.noprocess = !0;
    var C = new y(x, I), D = C.minimatch.set;
    if (!x)
      return !1;
    if (D.length > 1)
      return !0;
    for (var S = 0; S < D[0].length; S++)
      if (typeof D[0][S] != "string")
        return !0;
    return !1;
  }, m.Glob = y, n(y, r);
  function y(x, E, I) {
    if (typeof E == "function" && (I = E, E = null), E && E.sync) {
      if (I)
        throw new TypeError("callback provided to sync glob");
      return new v(x, E);
    }
    if (!(this instanceof y))
      return new y(x, E, I);
    u(this, x, E), this._didRealPath = !1;
    var C = this.minimatch.set.length;
    this.matches = new Array(C), typeof I == "function" && (I = g(I), this.on("error", I), this.on("end", function(k) {
      I(null, k);
    }));
    var D = this;
    if (this._processing = 0, this._emitQueue = [], this._processQueue = [], this.paused = !1, this.noprocess)
      return this;
    if (C === 0)
      return O();
    for (var S = !0, R = 0; R < C; R++)
      this._process(this.minimatch.set[R], R, !1, O);
    S = !1;
    function O() {
      --D._processing, D._processing <= 0 && (S ? process.nextTick(function() {
        D._finish();
      }) : D._finish());
    }
  }
  y.prototype._finish = function() {
    if (i(this instanceof y), !this.aborted) {
      if (this.realpath && !this._didRealpath)
        return this._realpath();
      l.finish(this), this.emit("end", this.found);
    }
  }, y.prototype._realpath = function() {
    if (this._didRealpath)
      return;
    this._didRealpath = !0;
    var x = this.matches.length;
    if (x === 0)
      return this._finish();
    for (var E = this, I = 0; I < this.matches.length; I++)
      this._realpathSet(I, C);
    function C() {
      --x === 0 && E._finish();
    }
  }, y.prototype._realpathSet = function(x, E) {
    var I = this.matches[x];
    if (!I)
      return E();
    var C = Object.keys(I), D = this, S = C.length;
    if (S === 0)
      return E();
    var R = this.matches[x] = /* @__PURE__ */ Object.create(null);
    C.forEach(function(O, k) {
      O = D._makeAbs(O), e.realpath(O, D.realpathCache, function(V, P) {
        V ? V.syscall === "stat" ? R[O] = !0 : D.emit("error", V) : R[P] = !0, --S === 0 && (D.matches[x] = R, E());
      });
    });
  }, y.prototype._mark = function(x) {
    return l.mark(this, x);
  }, y.prototype._makeAbs = function(x) {
    return l.makeAbs(this, x);
  }, y.prototype.abort = function() {
    this.aborted = !0, this.emit("abort");
  }, y.prototype.pause = function() {
    this.paused || (this.paused = !0, this.emit("pause"));
  }, y.prototype.resume = function() {
    if (this.paused) {
      if (this.emit("resume"), this.paused = !1, this._emitQueue.length) {
        var x = this._emitQueue.slice(0);
        this._emitQueue.length = 0;
        for (var E = 0; E < x.length; E++) {
          var I = x[E];
          this._emitMatch(I[0], I[1]);
        }
      }
      if (this._processQueue.length) {
        var C = this._processQueue.slice(0);
        this._processQueue.length = 0;
        for (var E = 0; E < C.length; E++) {
          var D = C[E];
          this._processing--, this._process(D[0], D[1], D[2], D[3]);
        }
      }
    }
  }, y.prototype._process = function(x, E, I, C) {
    if (i(this instanceof y), i(typeof C == "function"), !this.aborted) {
      if (this._processing++, this.paused) {
        this._processQueue.push([x, E, I, C]);
        return;
      }
      for (var D = 0; typeof x[D] == "string"; )
        D++;
      var S;
      switch (D) {
        case x.length:
          this._processSimple(x.join("/"), E, C);
          return;
        case 0:
          S = null;
          break;
        default:
          S = x.slice(0, D).join("/");
          break;
      }
      var R = x.slice(D), O;
      S === null ? O = "." : ((s(S) || s(x.map(function(P) {
        return typeof P == "string" ? P : "[*]";
      }).join("/"))) && (!S || !s(S)) && (S = "/" + S), O = S);
      var k = this._makeAbs(O);
      if (f(this, O))
        return C();
      var V = R[0] === t.GLOBSTAR;
      V ? this._processGlobStar(S, O, k, R, E, I, C) : this._processReaddir(S, O, k, R, E, I, C);
    }
  }, y.prototype._processReaddir = function(x, E, I, C, D, S, R) {
    var O = this;
    this._readdir(I, S, function(k, V) {
      return O._processReaddir2(x, E, I, C, D, S, V, R);
    });
  }, y.prototype._processReaddir2 = function(x, E, I, C, D, S, R, O) {
    if (!R)
      return O();
    for (var k = C[0], V = !!this.minimatch.negate, P = k._glob, F = this.dot || P.charAt(0) === ".", H = [], j = 0; j < R.length; j++) {
      var U = R[j];
      if (U.charAt(0) !== "." || F) {
        var B;
        V && !x ? B = !U.match(k) : B = U.match(k), B && H.push(U);
      }
    }
    var L = H.length;
    if (L === 0)
      return O();
    if (C.length === 1 && !this.mark && !this.stat) {
      this.matches[D] || (this.matches[D] = /* @__PURE__ */ Object.create(null));
      for (var j = 0; j < L; j++) {
        var U = H[j];
        x && (x !== "/" ? U = x + "/" + U : U = x + U), U.charAt(0) === "/" && !this.nomount && (U = a.join(this.root, U)), this._emitMatch(D, U);
      }
      return O();
    }
    C.shift();
    for (var j = 0; j < L; j++) {
      var U = H[j];
      x && (x !== "/" ? U = x + "/" + U : U = x + U), this._process([U].concat(C), D, S, O);
    }
    O();
  }, y.prototype._emitMatch = function(x, E) {
    if (!this.aborted && !h(this, E)) {
      if (this.paused) {
        this._emitQueue.push([x, E]);
        return;
      }
      var I = s(E) ? E : this._makeAbs(E);
      if (this.mark && (E = this._mark(E)), this.absolute && (E = I), !this.matches[x][E]) {
        if (this.nodir) {
          var C = this.cache[I];
          if (C === "DIR" || Array.isArray(C))
            return;
        }
        this.matches[x][E] = !0;
        var D = this.statCache[I];
        D && this.emit("stat", E, D), this.emit("match", E);
      }
    }
  }, y.prototype._readdirInGlobStar = function(x, E) {
    if (this.aborted)
      return;
    if (this.follow)
      return this._readdir(x, !1, E);
    var I = "lstat\0" + x, C = this, D = p(I, S);
    D && C.fs.lstat(x, D);
    function S(R, O) {
      if (R && R.code === "ENOENT")
        return E();
      var k = O && O.isSymbolicLink();
      C.symlinks[x] = k, !k && O && !O.isDirectory() ? (C.cache[x] = "FILE", E()) : C._readdir(x, !1, E);
    }
  }, y.prototype._readdir = function(x, E, I) {
    if (!this.aborted && (I = p("readdir\0" + x + "\0" + E, I), !!I)) {
      if (E && !c(this.symlinks, x))
        return this._readdirInGlobStar(x, I);
      if (c(this.cache, x)) {
        var C = this.cache[x];
        if (!C || C === "FILE")
          return I();
        if (Array.isArray(C))
          return I(null, C);
      }
      var D = this;
      D.fs.readdir(x, _(this, x, I));
    }
  };
  function _(x, E, I) {
    return function(C, D) {
      C ? x._readdirError(E, C, I) : x._readdirEntries(E, D, I);
    };
  }
  return y.prototype._readdirEntries = function(x, E, I) {
    if (!this.aborted) {
      if (!this.mark && !this.stat)
        for (var C = 0; C < E.length; C++) {
          var D = E[C];
          x === "/" ? D = x + D : D = x + "/" + D, this.cache[D] = !0;
        }
      return this.cache[x] = E, I(null, E);
    }
  }, y.prototype._readdirError = function(x, E, I) {
    if (!this.aborted) {
      switch (E.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var C = this._makeAbs(x);
          if (this.cache[C] = "FILE", C === this.cwdAbs) {
            var D = new Error(E.code + " invalid cwd " + this.cwd);
            D.path = this.cwd, D.code = E.code, this.emit("error", D), this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(x)] = !1;
          break;
        default:
          this.cache[this._makeAbs(x)] = !1, this.strict && (this.emit("error", E), this.abort()), this.silent || console.error("glob error", E);
          break;
      }
      return I();
    }
  }, y.prototype._processGlobStar = function(x, E, I, C, D, S, R) {
    var O = this;
    this._readdir(I, S, function(k, V) {
      O._processGlobStar2(x, E, I, C, D, S, V, R);
    });
  }, y.prototype._processGlobStar2 = function(x, E, I, C, D, S, R, O) {
    if (!R)
      return O();
    var k = C.slice(1), V = x ? [x] : [], P = V.concat(k);
    this._process(P, D, !1, O);
    var F = this.symlinks[I], H = R.length;
    if (F && S)
      return O();
    for (var j = 0; j < H; j++) {
      var U = R[j];
      if (!(U.charAt(0) === "." && !this.dot)) {
        var B = V.concat(R[j], k);
        this._process(B, D, !0, O);
        var L = V.concat(R[j], C);
        this._process(L, D, !0, O);
      }
    }
    O();
  }, y.prototype._processSimple = function(x, E, I) {
    var C = this;
    this._stat(x, function(D, S) {
      C._processSimple2(x, E, D, S, I);
    });
  }, y.prototype._processSimple2 = function(x, E, I, C, D) {
    if (this.matches[E] || (this.matches[E] = /* @__PURE__ */ Object.create(null)), !C)
      return D();
    if (x && s(x) && !this.nomount) {
      var S = /[\/\\]$/.test(x);
      x.charAt(0) === "/" ? x = a.join(this.root, x) : (x = a.resolve(this.root, x), S && (x += "/"));
    }
    process.platform === "win32" && (x = x.replace(/\\/g, "/")), this._emitMatch(E, x), D();
  }, y.prototype._stat = function(x, E) {
    var I = this._makeAbs(x), C = x.slice(-1) === "/";
    if (x.length > this.maxLength)
      return E();
    if (!this.stat && c(this.cache, I)) {
      var D = this.cache[I];
      if (Array.isArray(D) && (D = "DIR"), !C || D === "DIR")
        return E(null, D);
      if (C && D === "FILE")
        return E();
    }
    var S = this.statCache[I];
    if (S !== void 0) {
      if (S === !1)
        return E(null, S);
      var R = S.isDirectory() ? "DIR" : "FILE";
      return C && R === "FILE" ? E() : E(null, R, S);
    }
    var O = this, k = p("stat\0" + I, V);
    k && O.fs.lstat(I, k);
    function V(P, F) {
      if (F && F.isSymbolicLink())
        return O.fs.stat(I, function(H, j) {
          H ? O._stat2(x, I, null, F, E) : O._stat2(x, I, H, j, E);
        });
      O._stat2(x, I, P, F, E);
    }
  }, y.prototype._stat2 = function(x, E, I, C, D) {
    if (I && (I.code === "ENOENT" || I.code === "ENOTDIR"))
      return this.statCache[E] = !1, D();
    var S = x.slice(-1) === "/";
    if (this.statCache[E] = C, E.slice(-1) === "/" && C && !C.isDirectory())
      return D(null, !1, C);
    var R = !0;
    return C && (R = C.isDirectory() ? "DIR" : "FILE"), this.cache[E] = this.cache[E] || R, S && R === "FILE" ? D() : D(null, R, C);
  }, hi;
}
var vi, Zc;
function uh() {
  if (Zc) return vi;
  Zc = 1, vi = u, u.sync = m;
  var e = $r, t = Ve, n = vt, r = Ip(), a = parseInt("666", 8), i = {
    nosort: !0,
    silent: !0
  }, s = 0, o = process.platform === "win32";
  function l(y) {
    var _ = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    _.forEach(function(x) {
      y[x] = y[x] || n[x], x = x + "Sync", y[x] = y[x] || n[x];
    }), y.maxBusyTries = y.maxBusyTries || 3, y.emfileWait = y.emfileWait || 1e3, y.glob === !1 && (y.disableGlob = !0), y.disableGlob = y.disableGlob || !1, y.glob = y.glob || i;
  }
  function u(y, _, x) {
    typeof _ == "function" && (x = _, _ = {}), e(y, "rimraf: missing path"), e.equal(typeof y, "string", "rimraf: path should be a string"), e.equal(typeof x, "function", "rimraf: callback function required"), e(_, "rimraf: invalid options argument provided"), e.equal(typeof _, "object", "rimraf: options should be object"), l(_);
    var E = 0, I = null, C = 0;
    if (_.disableGlob || !r.hasMagic(y))
      return S(null, [y]);
    _.lstat(y, function(R, O) {
      if (!R)
        return S(null, [y]);
      r(y, _.glob, S);
    });
    function D(R) {
      I = I || R, --C === 0 && x(I);
    }
    function S(R, O) {
      if (R)
        return x(R);
      if (C = O.length, C === 0)
        return x();
      O.forEach(function(k) {
        c(k, _, function V(P) {
          if (P) {
            if ((P.code === "EBUSY" || P.code === "ENOTEMPTY" || P.code === "EPERM") && E < _.maxBusyTries) {
              E++;
              var F = E * 100;
              return setTimeout(function() {
                c(k, _, V);
              }, F);
            }
            if (P.code === "EMFILE" && s < _.emfileWait)
              return setTimeout(function() {
                c(k, _, V);
              }, s++);
            P.code === "ENOENT" && (P = null);
          }
          s = 0, D(P);
        });
      });
    }
  }
  function c(y, _, x) {
    e(y), e(_), e(typeof x == "function"), _.lstat(y, function(E, I) {
      if (E && E.code === "ENOENT")
        return x(null);
      if (E && E.code === "EPERM" && o && p(y, _, E, x), I && I.isDirectory())
        return h(y, _, E, x);
      _.unlink(y, function(C) {
        if (C) {
          if (C.code === "ENOENT")
            return x(null);
          if (C.code === "EPERM")
            return o ? p(y, _, C, x) : h(y, _, C, x);
          if (C.code === "EISDIR")
            return h(y, _, C, x);
        }
        return x(C);
      });
    });
  }
  function p(y, _, x, E) {
    e(y), e(_), e(typeof E == "function"), x && e(x instanceof Error), _.chmod(y, a, function(I) {
      I ? E(I.code === "ENOENT" ? null : x) : _.stat(y, function(C, D) {
        C ? E(C.code === "ENOENT" ? null : x) : D.isDirectory() ? h(y, _, x, E) : _.unlink(y, E);
      });
    });
  }
  function f(y, _, x) {
    e(y), e(_), x && e(x instanceof Error);
    try {
      _.chmodSync(y, a);
    } catch (I) {
      if (I.code === "ENOENT")
        return;
      throw x;
    }
    try {
      var E = _.statSync(y);
    } catch (I) {
      if (I.code === "ENOENT")
        return;
      throw x;
    }
    E.isDirectory() ? v(y, _, x) : _.unlinkSync(y);
  }
  function h(y, _, x, E) {
    e(y), e(_), x && e(x instanceof Error), e(typeof E == "function"), _.rmdir(y, function(I) {
      I && (I.code === "ENOTEMPTY" || I.code === "EEXIST" || I.code === "EPERM") ? g(y, _, E) : I && I.code === "ENOTDIR" ? E(x) : E(I);
    });
  }
  function g(y, _, x) {
    e(y), e(_), e(typeof x == "function"), _.readdir(y, function(E, I) {
      if (E)
        return x(E);
      var C = I.length;
      if (C === 0)
        return _.rmdir(y, x);
      var D;
      I.forEach(function(S) {
        u(t.join(y, S), _, function(R) {
          if (!D) {
            if (R)
              return x(D = R);
            --C === 0 && _.rmdir(y, x);
          }
        });
      });
    });
  }
  function m(y, _) {
    _ = _ || {}, l(_), e(y, "rimraf: missing path"), e.equal(typeof y, "string", "rimraf: path should be a string"), e(_, "rimraf: missing options"), e.equal(typeof _, "object", "rimraf: options should be object");
    var x;
    if (_.disableGlob || !r.hasMagic(y))
      x = [y];
    else
      try {
        _.lstatSync(y), x = [y];
      } catch {
        x = r.sync(y, _.glob);
      }
    if (x.length)
      for (var E = 0; E < x.length; E++) {
        var y = x[E];
        try {
          var I = _.lstatSync(y);
        } catch (D) {
          if (D.code === "ENOENT")
            return;
          D.code === "EPERM" && o && f(y, _, D);
        }
        try {
          I && I.isDirectory() ? v(y, _, null) : _.unlinkSync(y);
        } catch (D) {
          if (D.code === "ENOENT")
            return;
          if (D.code === "EPERM")
            return o ? f(y, _, D) : v(y, _, D);
          if (D.code !== "EISDIR")
            throw D;
          v(y, _, D);
        }
      }
  }
  function v(y, _, x) {
    e(y), e(_), x && e(x instanceof Error);
    try {
      _.rmdirSync(y);
    } catch (E) {
      if (E.code === "ENOENT")
        return;
      if (E.code === "ENOTDIR")
        throw x;
      (E.code === "ENOTEMPTY" || E.code === "EEXIST" || E.code === "EPERM") && d(y, _);
    }
  }
  function d(y, _) {
    e(y), e(_), _.readdirSync(y).forEach(function(D) {
      m(t.join(y, D), _);
    });
    var x = o ? 100 : 1, E = 0;
    do {
      var I = !0;
      try {
        var C = _.rmdirSync(y, _);
        return I = !1, C;
      } finally {
        if (++E < x && I)
          continue;
      }
    } while (!0);
  }
  return vi;
}
var yi, el;
function ph() {
  if (el) return yi;
  el = 1;
  var e = Ve, t = vt, n = parseInt("0777", 8);
  yi = r.mkdirp = r.mkdirP = r;
  function r(a, i, s, o) {
    typeof i == "function" ? (s = i, i = {}) : (!i || typeof i != "object") && (i = { mode: i });
    var l = i.mode, u = i.fs || t;
    l === void 0 && (l = n), o || (o = null);
    var c = s || /* istanbul ignore next */
    function() {
    };
    a = e.resolve(a), u.mkdir(a, l, function(p) {
      if (!p)
        return o = o || a, c(null, o);
      switch (p.code) {
        case "ENOENT":
          if (e.dirname(a) === a) return c(p);
          r(e.dirname(a), i, function(f, h) {
            f ? c(f, h) : r(a, i, c, h);
          });
          break;
        default:
          u.stat(a, function(f, h) {
            f || !h.isDirectory() ? c(p, o) : c(null, o);
          });
          break;
      }
    });
  }
  return r.sync = function a(i, s, o) {
    (!s || typeof s != "object") && (s = { mode: s });
    var l = s.mode, u = s.fs || t;
    l === void 0 && (l = n), o || (o = null), i = e.resolve(i);
    try {
      u.mkdirSync(i, l), o = o || i;
    } catch (p) {
      switch (p.code) {
        case "ENOENT":
          o = a(e.dirname(i), s, o), a(i, s, o);
          break;
        default:
          var c;
          try {
            c = u.statSync(i);
          } catch {
            throw p;
          }
          if (!c.isDirectory()) throw p;
          break;
      }
    }
    return o;
  }, yi;
}
var tl;
function jp() {
  return tl || (tl = 1, function(e, t) {
    let n = vt, r = Ve, a = Pm, i = xa, s = uh(), o = ph();
    xa.tmpdir();
    const l = s.sync;
    let u = r.resolve(i.tmpdir()), c = a.O_CREAT | a.O_TRUNC | a.O_RDWR | a.O_EXCL, p = function(j) {
      if (typeof j == "function")
        return [void 0, j];
      var U, B = new Promise(function(L, $) {
        U = function() {
          var N = Array.from(arguments), T = N.shift();
          process.nextTick(function() {
            T ? $(T) : N.length === 1 ? L(N[0]) : L(N);
          });
        };
      });
      return [B, U];
    };
    var f = function(j, U) {
      var B = h(j, U), L = /* @__PURE__ */ new Date(), $ = [
        B.prefix,
        L.getFullYear(),
        L.getMonth(),
        L.getDate(),
        "-",
        process.pid,
        "-",
        (Math.random() * 4294967296 + 1).toString(36),
        B.suffix
      ].join("");
      return r.join(B.dir || u, $);
    }, h = function(j, U) {
      var B = { prefix: null, suffix: null };
      if (j)
        switch (typeof j) {
          case "string":
            B.prefix = j;
            break;
          case "object":
            B = j;
            break;
          default:
            throw new Error("Unknown affix declaration: " + B);
        }
      else
        B.prefix = U;
      return B;
    }, g = !1, m = function(j) {
      return g = j !== !1, e.exports;
    }, v = !1, d = [], y = [];
    function _(j) {
      if (!g) return !1;
      E(), d.push(j);
    }
    function x(j) {
      if (!g) return !1;
      E(), y.push(j);
    }
    function E() {
      if (!g) return !1;
      v || (process.addListener("exit", function() {
        try {
          R();
        } catch (j) {
          throw console.warn("Fail to clean temporary files on exit : ", j), j;
        }
      }), v = !0);
    }
    function I() {
      if (!g)
        return !1;
      for (var j = 0, U; (U = d.shift()) !== void 0; )
        l(U, { maxBusyTries: 6 }), j++;
      return j;
    }
    function C(j) {
      var U = p(j), B = U[0];
      if (j = U[1], !g)
        return j(new Error("not tracking")), B;
      var L = 0, $ = d.length;
      if (!$)
        return j(null, L), B;
      for (var N, T = function(b) {
        if ($) {
          if (b) {
            j(b), $ = 0;
            return;
          } else
            L++;
          $--, $ || j(null, L);
        }
      }; (N = d.shift()) !== void 0; )
        s(N, { maxBusyTries: 6 }, T);
      return B;
    }
    function D() {
      if (!g)
        return !1;
      for (var j = 0, U; (U = y.shift()) !== void 0; )
        l(U, { maxBusyTries: 6 }), j++;
      return j;
    }
    function S(j) {
      var U = p(j), B = U[0];
      if (j = U[1], !g)
        return j(new Error("not tracking")), B;
      var L = 0, $ = y.length;
      if (!$)
        return j(null, L), B;
      for (var N, T = function(b) {
        if ($) {
          if (b) {
            j(b, L), $ = 0;
            return;
          } else
            L++;
          $--, $ || j(null, L);
        }
      }; (N = y.shift()) !== void 0; )
        s(N, { maxBusyTries: 6 }, T);
      return B;
    }
    function R() {
      if (!g)
        return !1;
      var j = I(), U = D();
      return { files: j, dirs: U };
    }
    function O(j) {
      var U = p(j), B = U[0];
      return j = U[1], g ? (C(function(L, $) {
        L ? j(L, { files: $ }) : S(function(N, T) {
          j(N, { files: $, dirs: T });
        });
      }), B) : (j(new Error("not tracking")), B);
    }
    const k = (j, U) => {
      const B = p(U), L = B[0];
      U = B[1];
      let $ = f(j, "d-");
      return o($, 448, (N) => {
        N || x($), U(N, $);
      }), L;
    }, V = (j) => {
      let U = f(j, "d-");
      return o.sync(U, 448), x(U), U;
    }, P = (j, U) => {
      const B = p(U), L = B[0];
      U = B[1];
      const $ = f(j, "f-");
      return n.open($, c, 384, (N, T) => {
        N || _($), U(N, { path: $, fd: T });
      }), L;
    }, F = (j) => {
      const U = f(j, "f-");
      let B = n.openSync(U, c, 384);
      return _(U), { path: U, fd: B };
    }, H = (j) => {
      const U = f(j, "s-");
      let B = n.createWriteStream(U, { flags: c, mode: 384 });
      return _(U), B;
    };
    t.dir = u, t.track = m, t.mkdir = k, t.mkdirSync = V, t.open = P, t.openSync = F, t.path = f, t.cleanup = O, t.cleanupSync = R, t.createWriteStream = H;
  }(Dr, Dr.exports)), Dr.exports;
}
var gi, nl;
function dh() {
  if (nl) return gi;
  nl = 1;
  const e = jn.exec, t = jp(), n = vt, r = Vs(), a = Ve, { unlinkP: i, readAndUnlinkP: s } = r;
  function o(v = {}) {
    const d = (y) => new Promise((_, x) => {
      const E = y.length;
      if (E === 0)
        return x(new Error("No displays detected try dropping screen option"));
      const I = E - 1, C = v.screen || 0;
      if (!Number.isInteger(C) || C < 0 || C > I) {
        const F = I === 0 ? "(valid choice is 0 or drop screen option altogether)" : `(valid choice is an integer between 0 and ${I})`;
        return x(new Error(`Invalid choice of displayId: ${C} ${F}`));
      }
      const D = ["jpg", "jpeg", "png", "tiff", "bmp", "gif", "pdf"], S = (v.format || "jpg").toLowerCase();
      if (!D.includes(S))
        return x(new Error("Invalid format"));
      let R, O;
      if (v.filename) {
        const F = v.filename.replace(/[^a-zA-Z0-9._\-/]/g, ""), H = F.lastIndexOf(".");
        O = H >= 0 ? F.slice(H) : `.${S}`, R = F;
      } else
        O = `.${S}`;
      const k = Array(C + 1).fill(null).map(() => t.path({ suffix: O }));
      let V = [];
      v.filename && (k[C] = R), V = k.slice(0, C + 1);
      const P = ["-x", "-t", S, ...V];
      jn.execFile("screencapture", P, function(F, H) {
        if (F)
          return x(F);
        v.filename ? _(a.resolve(R)) : n.readFile(k[C], function(j, U) {
          if (j)
            return x(j);
          Promise.all(V.map(i)).then(() => _(U)).catch((B) => x(B));
        });
      });
    });
    return g().then((y) => d(y));
  }
  const l = `
Graphics/Displays:

    Intel Iris:

      Chipset Model: Intel Iris
      Type: GPU
      Bus: Built-In
      VRAM (Dynamic, Max): 1536 MB
      Vendor: Intel (0x8086)
      Device ID: 0x0a2e
      Revision ID: 0x0009
      Displays:
        Color LCD:
          Display Type: Retina LCD
          Resolution: 2560 x 1600 Retina
          Retina: Yes
          Pixel Depth: 32-Bit Color (ARGB8888)
          Main Display: Yes
          Mirror: Off
          Online: Yes
          Built-In: Yes
        HP 22cwa:
          Resolution: 1920 x 1080 @ 60Hz (1080p)
          Pixel Depth: 32-Bit Color (ARGB8888)
          Display Serial Number: 6CM7201231
          Mirror: Off
          Online: Yes
          Rotation: Supported
          Television: Yes
`;
  function u(v) {
    const d = [], y = /(\s*)(.*?):(.*)\n/g;
    let _;
    for (; (_ = y.exec(v)) !== null; )
      d.push({
        indent: _[1].length,
        key: _[2].trim(),
        value: _[3].trim()
      });
    return d;
  }
  function c(v, d, y) {
    let _;
    for (; _ = y.shift(); )
      if (_.value === "")
        if (v < _.indent) {
          for (; _.key in d; )
            _.key += "_1";
          d[_.key] = {}, c(_.indent, d[_.key], y);
        } else {
          y.unshift(_);
          return;
        }
      else {
        for (; _.key in d; )
          _.key += "_1";
        d[_.key] = _.value;
      }
  }
  function p(v) {
    const d = v.filter((_) => _.primary), y = v.filter((_) => !_.primary);
    return [...d, ...y];
  }
  function f(v) {
    let d = 0;
    return v.map((y) => Object.assign({}, y, { id: d++ }));
  }
  function h(v) {
    const d = {};
    if (c(-1, d, u(v)), !d["Graphics/Displays"])
      return [];
    const y = Object.keys(d["Graphics/Displays"]);
    if (!y || y.length <= 0)
      return [];
    let _ = [];
    return y.forEach((x) => {
      const E = d["Graphics/Displays"][x];
      if (E.Displays) {
        const I = Object.entries(E.Displays).map(([C, D]) => {
          const S = D["Main Display"] === "Yes";
          return { name: C, primary: S };
        });
        _ = _.concat(I);
      }
    }), f(p(_));
  }
  function g() {
    return new Promise((v, d) => {
      e(
        "system_profiler SPDisplaysDataType",
        (y, _) => {
          if (y)
            return d(y);
          v(h(_));
        }
      );
    });
  }
  function m() {
    return new Promise((v, d) => {
      g().then((y) => {
        const _ = y.map(() => t.path({ suffix: ".jpg" }));
        e("screencapture -x -t jpg " + _.join(" "), function(x, E) {
          if (x)
            return d(x);
          Promise.all(_.map(s)).then(v).catch(d);
        });
      });
    });
  }
  return o.listDisplays = g, o.all = m, o.parseDisplaysOutput = h, o.EXAMPLE_DISPLAYS_OUTPUT = l, gi = o, gi;
}
var xi, rl;
function fh() {
  if (rl) return xi;
  rl = 1;
  const e = jn.exec, t = jp(), n = Ve, r = Vs(), a = vt, i = xa, {
    readAndUnlinkP: s,
    defaultAll: o
  } = r;
  function l() {
    const h = n.join(i.tmpdir(), "screenCapture", "screenCapture_1.3.2.bat"), g = n.join(i.tmpdir(), "screenCapture", "app.manifest"), m = n.join(__dirname, "screenCapture_1.3.2.bat").replace("app.asar", "app.asar.unpacked"), v = n.join(__dirname, "app.manifest").replace("app.asar", "app.asar.unpacked");
    if (!a.existsSync(h)) {
      const d = n.join(i.tmpdir(), "screenCapture");
      a.existsSync(d) || a.mkdirSync(d);
      const y = {
        bat: a.readFileSync(m),
        manifest: a.readFileSync(v)
      };
      a.writeFileSync(h, y.bat), a.writeFileSync(g, y.manifest);
    }
    return h;
  }
  function u(h = {}) {
    return new Promise((g, m) => {
      const v = ["jpg", "jpeg", "png", "bmp"], d = (h.format || "jpg").toLowerCase();
      if (!v.includes(d))
        return m(new Error("Invalid format"));
      let y, _ = null;
      if (h.filename) {
        y = t.path({ suffix: `.${d}` });
        const D = n.dirname(h.filename), R = n.basename(h.filename).replace(/[^a-zA-Z0-9._\- ]/g, "");
        _ = n.isAbsolute(h.filename) ? n.join(D, R) : n.join(process.cwd(), D, R), _ = n.normalize(_);
        const O = n.dirname(_);
        a.existsSync(O) || a.mkdirSync(O, { recursive: !0 });
      } else
        y = t.path({ suffix: `.${d}` });
      const x = h.screen ? String(h.screen) : "", E = l(), I = [y];
      x && I.push("/d", x);
      const C = ["/c", E, ...I];
      jn.execFile("cmd.exe", C, {
        cwd: n.join(i.tmpdir(), "screenCapture"),
        windowsHide: !0
      }, (D, S, R) => {
        if (D)
          return m(D);
        h.filename ? a.copyFile(y, _, (O) => {
          if (O) return m(O);
          g(_);
        }) : s(y).then(g).catch(m);
      });
    });
  }
  const c = `\r
C:\\Users\\devetry\\screenshot-desktop\\lib\\win32>//  2>nul  || \r
\\.\\DISPLAY1;0;1920;1080;0\r
\\.\\DISPLAY2;0;3840;1080;1920\r
`;
  function p(h) {
    const g = /2>nul {2}\|\| /, {
      0: m,
      index: v
    } = g.exec(h);
    return h.slice(v + m.length).split(`
`).map((d) => d.replace(/[\n\r]/g, "")).map((d) => d.match(/(.*?);(.?\d+);(.?\d+);(.?\d+);(.?\d+);(.?\d*[\.,]?\d+)/)).filter((d) => d).map((d) => ({
      id: d[1],
      name: d[1],
      top: +d[2],
      right: +d[3],
      bottom: +d[4],
      left: +d[5],
      dpiScale: +d[6].replace(",", ".")
    })).map((d) => Object.assign(d, {
      height: d.bottom - d.top,
      width: d.right - d.left
    }));
  }
  function f() {
    return new Promise((h, g) => {
      const m = l();
      e(
        '"' + m + '" /list',
        {
          cwd: n.join(i.tmpdir(), "screenCapture")
        },
        (v, d) => {
          if (v)
            return g(v);
          h(p(d));
        }
      );
    });
  }
  return u.listDisplays = f, u.availableDisplays = f, u.parseDisplaysOutput = p, u.EXAMPLE_DISPLAYS_OUTPUT = c, u.all = () => o(u), xi = u, xi;
}
process.platform === "linux" ? pr.exports = th() : process.platform === "darwin" ? pr.exports = dh() : process.platform === "win32" ? pr.exports = fh() : pr.exports = function() {
  return Promise.reject(new Error("Currently unsupported platform. Pull requests welcome!"));
};
var mh = pr.exports;
const Cp = /* @__PURE__ */ zn(mh), an = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Lp = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Dp = 1e6, hh = (e) => e >= "0" && e <= "9";
function Fp(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= Dp;
  }
  return !1;
}
function bi(e, t) {
  return Lp.has(e) ? !1 : (e && Fp(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function vh(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let n = "", r = "start", a = !1, i = 0;
  for (const s of e) {
    if (i++, a) {
      n += s, a = !1;
      continue;
    }
    if (s === "\\") {
      if (r === "index")
        throw new Error(`Invalid character '${s}' in an index at position ${i}`);
      if (r === "indexEnd")
        throw new Error(`Invalid character '${s}' after an index at position ${i}`);
      a = !0, r = r === "start" ? "property" : r;
      continue;
    }
    switch (s) {
      case ".": {
        if (r === "index")
          throw new Error(`Invalid character '${s}' in an index at position ${i}`);
        if (r === "indexEnd") {
          r = "property";
          break;
        }
        if (!bi(n, t))
          return [];
        n = "", r = "property";
        break;
      }
      case "[": {
        if (r === "index")
          throw new Error(`Invalid character '${s}' in an index at position ${i}`);
        if (r === "indexEnd") {
          r = "index";
          break;
        }
        if (r === "property" || r === "start") {
          if ((n || r === "property") && !bi(n, t))
            return [];
          n = "";
        }
        r = "index";
        break;
      }
      case "]": {
        if (r === "index") {
          if (n === "")
            n = (t.pop() || "") + "[]", r = "property";
          else {
            const o = Number.parseInt(n, 10);
            !Number.isNaN(o) && Number.isFinite(o) && o >= 0 && o <= Number.MAX_SAFE_INTEGER && o <= Dp && n === String(o) ? t.push(o) : t.push(n), n = "", r = "indexEnd";
          }
          break;
        }
        if (r === "indexEnd")
          throw new Error(`Invalid character '${s}' after an index at position ${i}`);
        n += s;
        break;
      }
      default: {
        if (r === "index" && !hh(s))
          throw new Error(`Invalid character '${s}' in an index at position ${i}`);
        if (r === "indexEnd")
          throw new Error(`Invalid character '${s}' after an index at position ${i}`);
        r === "start" && (r = "property"), n += s;
      }
    }
  }
  switch (a && (n += "\\"), r) {
    case "property": {
      if (!bi(n, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function ka(e) {
  if (typeof e == "string")
    return vh(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [n, r] of e.entries()) {
      if (typeof r != "string" && typeof r != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${n}, got ${typeof r}`);
      if (typeof r == "number" && !Number.isFinite(r))
        throw new TypeError(`Path segment at index ${n} must be a finite number, got ${r}`);
      if (Lp.has(r))
        return [];
      typeof r == "string" && Fp(r) ? t.push(Number.parseInt(r, 10)) : t.push(r);
    }
    return t;
  }
  return [];
}
function al(e, t, n) {
  if (!an(e) || typeof t != "string" && !Array.isArray(t))
    return n === void 0 ? e : n;
  const r = ka(t);
  if (r.length === 0)
    return n;
  for (let a = 0; a < r.length; a++) {
    const i = r[a];
    if (e = e[i], e == null) {
      if (a !== r.length - 1)
        return n;
      break;
    }
  }
  return e === void 0 ? n : e;
}
function qr(e, t, n) {
  if (!an(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const r = e, a = ka(t);
  if (a.length === 0)
    return e;
  for (let i = 0; i < a.length; i++) {
    const s = a[i];
    if (i === a.length - 1)
      e[s] = n;
    else if (!an(e[s])) {
      const l = typeof a[i + 1] == "number";
      e[s] = l ? [] : {};
    }
    e = e[s];
  }
  return r;
}
function yh(e, t) {
  if (!an(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const n = ka(t);
  if (n.length === 0)
    return !1;
  for (let r = 0; r < n.length; r++) {
    const a = n[r];
    if (r === n.length - 1)
      return Object.hasOwn(e, a) ? (delete e[a], !0) : !1;
    if (e = e[a], !an(e))
      return !1;
  }
}
function _i(e, t) {
  if (!an(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const n = ka(t);
  if (n.length === 0)
    return !1;
  for (const r of n) {
    if (!an(e) || !(r in e))
      return !1;
    e = e[r];
  }
  return !0;
}
const It = zs.homedir(), Ks = zs.tmpdir(), { env: Sn } = ve, gh = (e) => {
  const t = Q.join(It, "Library");
  return {
    data: Q.join(t, "Application Support", e),
    config: Q.join(t, "Preferences", e),
    cache: Q.join(t, "Caches", e),
    log: Q.join(t, "Logs", e),
    temp: Q.join(Ks, e)
  };
}, xh = (e) => {
  const t = Sn.APPDATA || Q.join(It, "AppData", "Roaming"), n = Sn.LOCALAPPDATA || Q.join(It, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: Q.join(n, e, "Data"),
    config: Q.join(t, e, "Config"),
    cache: Q.join(n, e, "Cache"),
    log: Q.join(n, e, "Log"),
    temp: Q.join(Ks, e)
  };
}, bh = (e) => {
  const t = Q.basename(It);
  return {
    data: Q.join(Sn.XDG_DATA_HOME || Q.join(It, ".local", "share"), e),
    config: Q.join(Sn.XDG_CONFIG_HOME || Q.join(It, ".config"), e),
    cache: Q.join(Sn.XDG_CACHE_HOME || Q.join(It, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: Q.join(Sn.XDG_STATE_HOME || Q.join(It, ".local", "state"), e),
    temp: Q.join(Ks, t, e)
  };
};
function _h(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? gh(e) : ve.platform === "win32" ? xh(e) : bh(e);
}
const Tt = (e, t) => {
  const { onError: n } = t;
  return function(...a) {
    return e.apply(void 0, a).catch(n);
  };
}, xt = (e, t) => {
  const { onError: n } = t;
  return function(...a) {
    try {
      return e.apply(void 0, a);
    } catch (i) {
      return n(i);
    }
  };
}, Eh = 250, Rt = (e, t) => {
  const { isRetriable: n } = t;
  return function(a) {
    const { timeout: i } = a, s = a.interval ?? Eh, o = Date.now() + i;
    return function l(...u) {
      return e.apply(void 0, u).catch((c) => {
        if (!n(c) || Date.now() >= o)
          throw c;
        const p = Math.round(s * Math.random());
        return p > 0 ? new Promise((h) => setTimeout(h, p)).then(() => l.apply(void 0, u)) : l.apply(void 0, u);
      });
    };
  };
}, Ot = (e, t) => {
  const { isRetriable: n } = t;
  return function(a) {
    const { timeout: i } = a, s = Date.now() + i;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (u) {
          if (!n(u) || Date.now() >= s)
            throw u;
          continue;
        }
    };
  };
}, Tn = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Tn.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !wh && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Tn.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!Tn.isNodeError(e))
      throw e;
    if (!Tn.isChangeErrorOk(e))
      throw e;
  }
}, Br = {
  onError: Tn.onChangeError
}, Ke = {
  onError: () => {
  }
}, wh = ve.getuid ? !ve.getuid() : !1, Ne = {
  isRetriable: Tn.isRetriableError
}, je = {
  attempt: {
    /* ASYNC */
    chmod: Tt(ke(ne.chmod), Br),
    chown: Tt(ke(ne.chown), Br),
    close: Tt(ke(ne.close), Ke),
    fsync: Tt(ke(ne.fsync), Ke),
    mkdir: Tt(ke(ne.mkdir), Ke),
    realpath: Tt(ke(ne.realpath), Ke),
    stat: Tt(ke(ne.stat), Ke),
    unlink: Tt(ke(ne.unlink), Ke),
    /* SYNC */
    chmodSync: xt(ne.chmodSync, Br),
    chownSync: xt(ne.chownSync, Br),
    closeSync: xt(ne.closeSync, Ke),
    existsSync: xt(ne.existsSync, Ke),
    fsyncSync: xt(ne.fsync, Ke),
    mkdirSync: xt(ne.mkdirSync, Ke),
    realpathSync: xt(ne.realpathSync, Ke),
    statSync: xt(ne.statSync, Ke),
    unlinkSync: xt(ne.unlinkSync, Ke)
  },
  retry: {
    /* ASYNC */
    close: Rt(ke(ne.close), Ne),
    fsync: Rt(ke(ne.fsync), Ne),
    open: Rt(ke(ne.open), Ne),
    readFile: Rt(ke(ne.readFile), Ne),
    rename: Rt(ke(ne.rename), Ne),
    stat: Rt(ke(ne.stat), Ne),
    write: Rt(ke(ne.write), Ne),
    writeFile: Rt(ke(ne.writeFile), Ne),
    /* SYNC */
    closeSync: Ot(ne.closeSync, Ne),
    fsyncSync: Ot(ne.fsyncSync, Ne),
    openSync: Ot(ne.openSync, Ne),
    readFileSync: Ot(ne.readFileSync, Ne),
    renameSync: Ot(ne.renameSync, Ne),
    statSync: Ot(ne.statSync, Ne),
    writeSync: Ot(ne.writeSync, Ne),
    writeFileSync: Ot(ne.writeFileSync, Ne)
  }
}, $h = "utf8", il = 438, Sh = 511, Th = {}, Rh = ve.geteuid ? ve.geteuid() : -1, Oh = ve.getegid ? ve.getegid() : -1, Ah = 1e3, Ph = !!ve.getuid;
ve.getuid && ve.getuid();
const sl = 128, kh = (e) => e instanceof Error && "code" in e, ol = (e) => typeof e == "string", Ei = (e) => e === void 0, Nh = ve.platform === "linux", Up = ve.platform === "win32", Xs = ["SIGHUP", "SIGINT", "SIGTERM"];
Up || Xs.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Nh && Xs.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Ih {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const n of this.callbacks)
          n();
        t && (Up && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ve.kill(ve.pid, "SIGTERM") : ve.kill(ve.pid, t));
      }
    }, this.hook = () => {
      ve.once("exit", () => this.exit());
      for (const t of Xs)
        try {
          ve.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const jh = new Ih(), Ch = jh.register, Ce = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), a = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${a}`;
  },
  get: (e, t, n = !0) => {
    const r = Ce.truncate(t(e));
    return r in Ce.store ? Ce.get(e, t, n) : (Ce.store[r] = n, [r, () => delete Ce.store[r]]);
  },
  purge: (e) => {
    Ce.store[e] && (delete Ce.store[e], je.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ce.store[e] && (delete Ce.store[e], je.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ce.store)
      Ce.purgeSync(e);
  },
  truncate: (e) => {
    const t = Q.basename(e);
    if (t.length <= sl)
      return e;
    const n = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!n)
      return e;
    const r = t.length - sl;
    return `${e.slice(0, -t.length)}${n[1]}${n[2].slice(0, -r)}${n[3]}`;
  }
};
Ch(Ce.purgeSyncAll);
function Mp(e, t, n = Th) {
  if (ol(n))
    return Mp(e, t, { encoding: n });
  const a = { timeout: n.timeout ?? Ah };
  let i = null, s = null, o = null;
  try {
    const l = je.attempt.realpathSync(e), u = !!l;
    e = l || e, [s, i] = Ce.get(e, n.tmpCreate || Ce.create, n.tmpPurge !== !1);
    const c = Ph && Ei(n.chown), p = Ei(n.mode);
    if (u && (c || p)) {
      const f = je.attempt.statSync(e);
      f && (n = { ...n }, c && (n.chown = { uid: f.uid, gid: f.gid }), p && (n.mode = f.mode));
    }
    if (!u) {
      const f = Q.dirname(e);
      je.attempt.mkdirSync(f, {
        mode: Sh,
        recursive: !0
      });
    }
    o = je.retry.openSync(a)(s, "w", n.mode || il), n.tmpCreated && n.tmpCreated(s), ol(t) ? je.retry.writeSync(a)(o, t, 0, n.encoding || $h) : Ei(t) || je.retry.writeSync(a)(o, t, 0, t.length, 0), n.fsync !== !1 && (n.fsyncWait !== !1 ? je.retry.fsyncSync(a)(o) : je.attempt.fsync(o)), je.retry.closeSync(a)(o), o = null, n.chown && (n.chown.uid !== Rh || n.chown.gid !== Oh) && je.attempt.chownSync(s, n.chown.uid, n.chown.gid), n.mode && n.mode !== il && je.attempt.chmodSync(s, n.mode);
    try {
      je.retry.renameSync(a)(s, e);
    } catch (f) {
      if (!kh(f) || f.code !== "ENAMETOOLONG")
        throw f;
      je.retry.renameSync(a)(s, Ce.truncate(e));
    }
    i(), s = null;
  } finally {
    o && je.attempt.closeSync(o), s && Ce.purge(s);
  }
}
var hs = { exports: {} }, Ws = {}, et = {}, Ln = {}, Sr = {}, ee = {}, xr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class n extends t {
    constructor(y) {
      if (super(), !e.IDENTIFIER.test(y))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = y;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = n;
  class r extends t {
    constructor(y) {
      super(), this._items = typeof y == "string" ? [y] : y;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const y = this._items[0];
      return y === "" || y === '""';
    }
    get str() {
      var y;
      return (y = this._str) !== null && y !== void 0 ? y : this._str = this._items.reduce((_, x) => `${_}${x}`, "");
    }
    get names() {
      var y;
      return (y = this._names) !== null && y !== void 0 ? y : this._names = this._items.reduce((_, x) => (x instanceof n && (_[x.str] = (_[x.str] || 0) + 1), _), {});
    }
  }
  e._Code = r, e.nil = new r("");
  function a(d, ...y) {
    const _ = [d[0]];
    let x = 0;
    for (; x < y.length; )
      o(_, y[x]), _.push(d[++x]);
    return new r(_);
  }
  e._ = a;
  const i = new r("+");
  function s(d, ...y) {
    const _ = [h(d[0])];
    let x = 0;
    for (; x < y.length; )
      _.push(i), o(_, y[x]), _.push(i, h(d[++x]));
    return l(_), new r(_);
  }
  e.str = s;
  function o(d, y) {
    y instanceof r ? d.push(...y._items) : y instanceof n ? d.push(y) : d.push(p(y));
  }
  e.addCodeArg = o;
  function l(d) {
    let y = 1;
    for (; y < d.length - 1; ) {
      if (d[y] === i) {
        const _ = u(d[y - 1], d[y + 1]);
        if (_ !== void 0) {
          d.splice(y - 1, 3, _);
          continue;
        }
        d[y++] = "+";
      }
      y++;
    }
  }
  function u(d, y) {
    if (y === '""')
      return d;
    if (d === '""')
      return y;
    if (typeof d == "string")
      return y instanceof n || d[d.length - 1] !== '"' ? void 0 : typeof y != "string" ? `${d.slice(0, -1)}${y}"` : y[0] === '"' ? d.slice(0, -1) + y.slice(1) : void 0;
    if (typeof y == "string" && y[0] === '"' && !(d instanceof n))
      return `"${d}${y.slice(1)}`;
  }
  function c(d, y) {
    return y.emptyStr() ? d : d.emptyStr() ? y : s`${d}${y}`;
  }
  e.strConcat = c;
  function p(d) {
    return typeof d == "number" || typeof d == "boolean" || d === null ? d : h(Array.isArray(d) ? d.join(",") : d);
  }
  function f(d) {
    return new r(h(d));
  }
  e.stringify = f;
  function h(d) {
    return JSON.stringify(d).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = h;
  function g(d) {
    return typeof d == "string" && e.IDENTIFIER.test(d) ? new r(`.${d}`) : a`[${d}]`;
  }
  e.getProperty = g;
  function m(d) {
    if (typeof d == "string" && e.IDENTIFIER.test(d))
      return new r(`${d}`);
    throw new Error(`CodeGen: invalid export name: ${d}, use explicit $id name mapping`);
  }
  e.getEsmExportName = m;
  function v(d) {
    return new r(d.toString());
  }
  e.regexpCode = v;
})(xr);
var vs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = xr;
  class n extends Error {
    constructor(u) {
      super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
    }
  }
  var r;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(r || (e.UsedValueState = r = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class a {
    constructor({ prefixes: u, parent: c } = {}) {
      this._names = {}, this._prefixes = u, this._parent = c;
    }
    toName(u) {
      return u instanceof t.Name ? u : this.name(u);
    }
    name(u) {
      return new t.Name(this._newName(u));
    }
    _newName(u) {
      const c = this._names[u] || this._nameGroup(u);
      return `${u}${c.index++}`;
    }
    _nameGroup(u) {
      var c, p;
      if (!((p = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || p === void 0) && p.has(u) || this._prefixes && !this._prefixes.has(u))
        throw new Error(`CodeGen: prefix "${u}" is not allowed in this scope`);
      return this._names[u] = { prefix: u, index: 0 };
    }
  }
  e.Scope = a;
  class i extends t.Name {
    constructor(u, c) {
      super(c), this.prefix = u;
    }
    setValue(u, { property: c, itemIndex: p }) {
      this.value = u, this.scopePath = (0, t._)`.${new t.Name(c)}[${p}]`;
    }
  }
  e.ValueScopeName = i;
  const s = (0, t._)`\n`;
  class o extends a {
    constructor(u) {
      super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? s : t.nil };
    }
    get() {
      return this._scope;
    }
    name(u) {
      return new i(u, this._newName(u));
    }
    value(u, c) {
      var p;
      if (c.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const f = this.toName(u), { prefix: h } = f, g = (p = c.key) !== null && p !== void 0 ? p : c.ref;
      let m = this._values[h];
      if (m) {
        const y = m.get(g);
        if (y)
          return y;
      } else
        m = this._values[h] = /* @__PURE__ */ new Map();
      m.set(g, f);
      const v = this._scope[h] || (this._scope[h] = []), d = v.length;
      return v[d] = c.ref, f.setValue(c, { property: h, itemIndex: d }), f;
    }
    getValue(u, c) {
      const p = this._values[u];
      if (p)
        return p.get(c);
    }
    scopeRefs(u, c = this._values) {
      return this._reduceValues(c, (p) => {
        if (p.scopePath === void 0)
          throw new Error(`CodeGen: name "${p}" has no value`);
        return (0, t._)`${u}${p.scopePath}`;
      });
    }
    scopeCode(u = this._values, c, p) {
      return this._reduceValues(u, (f) => {
        if (f.value === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return f.value.code;
      }, c, p);
    }
    _reduceValues(u, c, p = {}, f) {
      let h = t.nil;
      for (const g in u) {
        const m = u[g];
        if (!m)
          continue;
        const v = p[g] = p[g] || /* @__PURE__ */ new Map();
        m.forEach((d) => {
          if (v.has(d))
            return;
          v.set(d, r.Started);
          let y = c(d);
          if (y) {
            const _ = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            h = (0, t._)`${h}${_} ${d} = ${y};${this.opts._n}`;
          } else if (y = f == null ? void 0 : f(d))
            h = (0, t._)`${h}${y}${this.opts._n}`;
          else
            throw new n(d);
          v.set(d, r.Completed);
        });
      }
      return h;
    }
  }
  e.ValueScope = o;
})(vs);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = xr, n = vs;
  var r = xr;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return r.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return r.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return r.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } });
  var a = vs;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return a.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return a.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return a.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return a.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class i {
    optimizeNodes() {
      return this;
    }
    optimizeNames(b, w) {
      return this;
    }
  }
  class s extends i {
    constructor(b, w, M) {
      super(), this.varKind = b, this.name = w, this.rhs = M;
    }
    render({ es5: b, _n: w }) {
      const M = b ? n.varKinds.var : this.varKind, q = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${M} ${this.name}${q};` + w;
    }
    optimizeNames(b, w) {
      if (b[this.name.str])
        return this.rhs && (this.rhs = P(this.rhs, b, w)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class o extends i {
    constructor(b, w, M) {
      super(), this.lhs = b, this.rhs = w, this.sideEffects = M;
    }
    render({ _n: b }) {
      return `${this.lhs} = ${this.rhs};` + b;
    }
    optimizeNames(b, w) {
      if (!(this.lhs instanceof t.Name && !b[this.lhs.str] && !this.sideEffects))
        return this.rhs = P(this.rhs, b, w), this;
    }
    get names() {
      const b = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return V(b, this.rhs);
    }
  }
  class l extends o {
    constructor(b, w, M, q) {
      super(b, M, q), this.op = w;
    }
    render({ _n: b }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + b;
    }
  }
  class u extends i {
    constructor(b) {
      super(), this.label = b, this.names = {};
    }
    render({ _n: b }) {
      return `${this.label}:` + b;
    }
  }
  class c extends i {
    constructor(b) {
      super(), this.label = b, this.names = {};
    }
    render({ _n: b }) {
      return `break${this.label ? ` ${this.label}` : ""};` + b;
    }
  }
  class p extends i {
    constructor(b) {
      super(), this.error = b;
    }
    render({ _n: b }) {
      return `throw ${this.error};` + b;
    }
    get names() {
      return this.error.names;
    }
  }
  class f extends i {
    constructor(b) {
      super(), this.code = b;
    }
    render({ _n: b }) {
      return `${this.code};` + b;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(b, w) {
      return this.code = P(this.code, b, w), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class h extends i {
    constructor(b = []) {
      super(), this.nodes = b;
    }
    render(b) {
      return this.nodes.reduce((w, M) => w + M.render(b), "");
    }
    optimizeNodes() {
      const { nodes: b } = this;
      let w = b.length;
      for (; w--; ) {
        const M = b[w].optimizeNodes();
        Array.isArray(M) ? b.splice(w, 1, ...M) : M ? b[w] = M : b.splice(w, 1);
      }
      return b.length > 0 ? this : void 0;
    }
    optimizeNames(b, w) {
      const { nodes: M } = this;
      let q = M.length;
      for (; q--; ) {
        const z = M[q];
        z.optimizeNames(b, w) || (F(b, z.names), M.splice(q, 1));
      }
      return M.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((b, w) => k(b, w.names), {});
    }
  }
  class g extends h {
    render(b) {
      return "{" + b._n + super.render(b) + "}" + b._n;
    }
  }
  class m extends h {
  }
  class v extends g {
  }
  v.kind = "else";
  class d extends g {
    constructor(b, w) {
      super(w), this.condition = b;
    }
    render(b) {
      let w = `if(${this.condition})` + super.render(b);
      return this.else && (w += "else " + this.else.render(b)), w;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const b = this.condition;
      if (b === !0)
        return this.nodes;
      let w = this.else;
      if (w) {
        const M = w.optimizeNodes();
        w = this.else = Array.isArray(M) ? new v(M) : M;
      }
      if (w)
        return b === !1 ? w instanceof d ? w : w.nodes : this.nodes.length ? this : new d(H(b), w instanceof d ? [w] : w.nodes);
      if (!(b === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(b, w) {
      var M;
      if (this.else = (M = this.else) === null || M === void 0 ? void 0 : M.optimizeNames(b, w), !!(super.optimizeNames(b, w) || this.else))
        return this.condition = P(this.condition, b, w), this;
    }
    get names() {
      const b = super.names;
      return V(b, this.condition), this.else && k(b, this.else.names), b;
    }
  }
  d.kind = "if";
  class y extends g {
  }
  y.kind = "for";
  class _ extends y {
    constructor(b) {
      super(), this.iteration = b;
    }
    render(b) {
      return `for(${this.iteration})` + super.render(b);
    }
    optimizeNames(b, w) {
      if (super.optimizeNames(b, w))
        return this.iteration = P(this.iteration, b, w), this;
    }
    get names() {
      return k(super.names, this.iteration.names);
    }
  }
  class x extends y {
    constructor(b, w, M, q) {
      super(), this.varKind = b, this.name = w, this.from = M, this.to = q;
    }
    render(b) {
      const w = b.es5 ? n.varKinds.var : this.varKind, { name: M, from: q, to: z } = this;
      return `for(${w} ${M}=${q}; ${M}<${z}; ${M}++)` + super.render(b);
    }
    get names() {
      const b = V(super.names, this.from);
      return V(b, this.to);
    }
  }
  class E extends y {
    constructor(b, w, M, q) {
      super(), this.loop = b, this.varKind = w, this.name = M, this.iterable = q;
    }
    render(b) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(b);
    }
    optimizeNames(b, w) {
      if (super.optimizeNames(b, w))
        return this.iterable = P(this.iterable, b, w), this;
    }
    get names() {
      return k(super.names, this.iterable.names);
    }
  }
  class I extends g {
    constructor(b, w, M) {
      super(), this.name = b, this.args = w, this.async = M;
    }
    render(b) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(b);
    }
  }
  I.kind = "func";
  class C extends h {
    render(b) {
      return "return " + super.render(b);
    }
  }
  C.kind = "return";
  class D extends g {
    render(b) {
      let w = "try" + super.render(b);
      return this.catch && (w += this.catch.render(b)), this.finally && (w += this.finally.render(b)), w;
    }
    optimizeNodes() {
      var b, w;
      return super.optimizeNodes(), (b = this.catch) === null || b === void 0 || b.optimizeNodes(), (w = this.finally) === null || w === void 0 || w.optimizeNodes(), this;
    }
    optimizeNames(b, w) {
      var M, q;
      return super.optimizeNames(b, w), (M = this.catch) === null || M === void 0 || M.optimizeNames(b, w), (q = this.finally) === null || q === void 0 || q.optimizeNames(b, w), this;
    }
    get names() {
      const b = super.names;
      return this.catch && k(b, this.catch.names), this.finally && k(b, this.finally.names), b;
    }
  }
  class S extends g {
    constructor(b) {
      super(), this.error = b;
    }
    render(b) {
      return `catch(${this.error})` + super.render(b);
    }
  }
  S.kind = "catch";
  class R extends g {
    render(b) {
      return "finally" + super.render(b);
    }
  }
  R.kind = "finally";
  class O {
    constructor(b, w = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...w, _n: w.lines ? `
` : "" }, this._extScope = b, this._scope = new n.Scope({ parent: b }), this._nodes = [new m()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(b) {
      return this._scope.name(b);
    }
    // reserves unique name in the external scope
    scopeName(b) {
      return this._extScope.name(b);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(b, w) {
      const M = this._extScope.value(b, w);
      return (this._values[M.prefix] || (this._values[M.prefix] = /* @__PURE__ */ new Set())).add(M), M;
    }
    getScopeValue(b, w) {
      return this._extScope.getValue(b, w);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(b) {
      return this._extScope.scopeRefs(b, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(b, w, M, q) {
      const z = this._scope.toName(w);
      return M !== void 0 && q && (this._constants[z.str] = M), this._leafNode(new s(b, z, M)), z;
    }
    // `const` declaration (`var` in es5 mode)
    const(b, w, M) {
      return this._def(n.varKinds.const, b, w, M);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(b, w, M) {
      return this._def(n.varKinds.let, b, w, M);
    }
    // `var` declaration with optional assignment
    var(b, w, M) {
      return this._def(n.varKinds.var, b, w, M);
    }
    // assignment code
    assign(b, w, M) {
      return this._leafNode(new o(b, w, M));
    }
    // `+=` code
    add(b, w) {
      return this._leafNode(new l(b, e.operators.ADD, w));
    }
    // appends passed SafeExpr to code or executes Block
    code(b) {
      return typeof b == "function" ? b() : b !== t.nil && this._leafNode(new f(b)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...b) {
      const w = ["{"];
      for (const [M, q] of b)
        w.length > 1 && w.push(","), w.push(M), (M !== q || this.opts.es5) && (w.push(":"), (0, t.addCodeArg)(w, q));
      return w.push("}"), new t._Code(w);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(b, w, M) {
      if (this._blockNode(new d(b)), w && M)
        this.code(w).else().code(M).endIf();
      else if (w)
        this.code(w).endIf();
      else if (M)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(b) {
      return this._elseNode(new d(b));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(d, v);
    }
    _for(b, w) {
      return this._blockNode(b), w && this.code(w).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(b, w) {
      return this._for(new _(b), w);
    }
    // `for` statement for a range of values
    forRange(b, w, M, q, z = this.opts.es5 ? n.varKinds.var : n.varKinds.let) {
      const X = this._scope.toName(b);
      return this._for(new x(z, X, w, M), () => q(X));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(b, w, M, q = n.varKinds.const) {
      const z = this._scope.toName(b);
      if (this.opts.es5) {
        const X = w instanceof t.Name ? w : this.var("_arr", w);
        return this.forRange("_i", 0, (0, t._)`${X}.length`, (W) => {
          this.var(z, (0, t._)`${X}[${W}]`), M(z);
        });
      }
      return this._for(new E("of", q, z, w), () => M(z));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(b, w, M, q = this.opts.es5 ? n.varKinds.var : n.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(b, (0, t._)`Object.keys(${w})`, M);
      const z = this._scope.toName(b);
      return this._for(new E("in", q, z, w), () => M(z));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(y);
    }
    // `label` statement
    label(b) {
      return this._leafNode(new u(b));
    }
    // `break` statement
    break(b) {
      return this._leafNode(new c(b));
    }
    // `return` statement
    return(b) {
      const w = new C();
      if (this._blockNode(w), this.code(b), w.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(C);
    }
    // `try` statement
    try(b, w, M) {
      if (!w && !M)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const q = new D();
      if (this._blockNode(q), this.code(b), w) {
        const z = this.name("e");
        this._currNode = q.catch = new S(z), w(z);
      }
      return M && (this._currNode = q.finally = new R(), this.code(M)), this._endBlockNode(S, R);
    }
    // `throw` statement
    throw(b) {
      return this._leafNode(new p(b));
    }
    // start self-balancing block
    block(b, w) {
      return this._blockStarts.push(this._nodes.length), b && this.code(b).endBlock(w), this;
    }
    // end the current self-balancing block
    endBlock(b) {
      const w = this._blockStarts.pop();
      if (w === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const M = this._nodes.length - w;
      if (M < 0 || b !== void 0 && M !== b)
        throw new Error(`CodeGen: wrong number of nodes: ${M} vs ${b} expected`);
      return this._nodes.length = w, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(b, w = t.nil, M, q) {
      return this._blockNode(new I(b, w, M)), q && this.code(q).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(I);
    }
    optimize(b = 1) {
      for (; b-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(b) {
      return this._currNode.nodes.push(b), this;
    }
    _blockNode(b) {
      this._currNode.nodes.push(b), this._nodes.push(b);
    }
    _endBlockNode(b, w) {
      const M = this._currNode;
      if (M instanceof b || w && M instanceof w)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${w ? `${b.kind}/${w.kind}` : b.kind}"`);
    }
    _elseNode(b) {
      const w = this._currNode;
      if (!(w instanceof d))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = w.else = b, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const b = this._nodes;
      return b[b.length - 1];
    }
    set _currNode(b) {
      const w = this._nodes;
      w[w.length - 1] = b;
    }
  }
  e.CodeGen = O;
  function k(T, b) {
    for (const w in b)
      T[w] = (T[w] || 0) + (b[w] || 0);
    return T;
  }
  function V(T, b) {
    return b instanceof t._CodeOrName ? k(T, b.names) : T;
  }
  function P(T, b, w) {
    if (T instanceof t.Name)
      return M(T);
    if (!q(T))
      return T;
    return new t._Code(T._items.reduce((z, X) => (X instanceof t.Name && (X = M(X)), X instanceof t._Code ? z.push(...X._items) : z.push(X), z), []));
    function M(z) {
      const X = w[z.str];
      return X === void 0 || b[z.str] !== 1 ? z : (delete b[z.str], X);
    }
    function q(z) {
      return z instanceof t._Code && z._items.some((X) => X instanceof t.Name && b[X.str] === 1 && w[X.str] !== void 0);
    }
  }
  function F(T, b) {
    for (const w in b)
      T[w] = (T[w] || 0) - (b[w] || 0);
  }
  function H(T) {
    return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, t._)`!${N(T)}`;
  }
  e.not = H;
  const j = $(e.operators.AND);
  function U(...T) {
    return T.reduce(j);
  }
  e.and = U;
  const B = $(e.operators.OR);
  function L(...T) {
    return T.reduce(B);
  }
  e.or = L;
  function $(T) {
    return (b, w) => b === t.nil ? w : w === t.nil ? b : (0, t._)`${N(b)} ${T} ${N(w)}`;
  }
  function N(T) {
    return T instanceof t.Name ? T : (0, t._)`(${T})`;
  }
})(ee);
var K = {};
Object.defineProperty(K, "__esModule", { value: !0 });
K.checkStrictMode = K.getErrorPath = K.Type = K.useFunc = K.setEvaluated = K.evaluatedPropsToName = K.mergeEvaluated = K.eachItem = K.unescapeJsonPointer = K.escapeJsonPointer = K.escapeFragment = K.unescapeFragment = K.schemaRefOrVal = K.schemaHasRulesButRef = K.schemaHasRules = K.checkUnknownRules = K.alwaysValidSchema = K.toHash = void 0;
const de = ee, Lh = xr;
function Dh(e) {
  const t = {};
  for (const n of e)
    t[n] = !0;
  return t;
}
K.toHash = Dh;
function Fh(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (zp(e, t), !qp(t, e.self.RULES.all));
}
K.alwaysValidSchema = Fh;
function zp(e, t = e.schema) {
  const { opts: n, self: r } = e;
  if (!n.strictSchema || typeof t == "boolean")
    return;
  const a = r.RULES.keywords;
  for (const i in t)
    a[i] || Hp(e, `unknown keyword: "${i}"`);
}
K.checkUnknownRules = zp;
function qp(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (t[n])
      return !0;
  return !1;
}
K.schemaHasRules = qp;
function Uh(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (n !== "$ref" && t.all[n])
      return !0;
  return !1;
}
K.schemaHasRulesButRef = Uh;
function Mh({ topSchemaRef: e, schemaPath: t }, n, r, a) {
  if (!a) {
    if (typeof n == "number" || typeof n == "boolean")
      return n;
    if (typeof n == "string")
      return (0, de._)`${n}`;
  }
  return (0, de._)`${e}${t}${(0, de.getProperty)(r)}`;
}
K.schemaRefOrVal = Mh;
function zh(e) {
  return Bp(decodeURIComponent(e));
}
K.unescapeFragment = zh;
function qh(e) {
  return encodeURIComponent(Ys(e));
}
K.escapeFragment = qh;
function Ys(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
K.escapeJsonPointer = Ys;
function Bp(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
K.unescapeJsonPointer = Bp;
function Bh(e, t) {
  if (Array.isArray(e))
    for (const n of e)
      t(n);
  else
    t(e);
}
K.eachItem = Bh;
function cl({ mergeNames: e, mergeToName: t, mergeValues: n, resultToName: r }) {
  return (a, i, s, o) => {
    const l = s === void 0 ? i : s instanceof de.Name ? (i instanceof de.Name ? e(a, i, s) : t(a, i, s), s) : i instanceof de.Name ? (t(a, s, i), i) : n(i, s);
    return o === de.Name && !(l instanceof de.Name) ? r(a, l) : l;
  };
}
K.mergeEvaluated = {
  props: cl({
    mergeNames: (e, t, n) => e.if((0, de._)`${n} !== true && ${t} !== undefined`, () => {
      e.if((0, de._)`${t} === true`, () => e.assign(n, !0), () => e.assign(n, (0, de._)`${n} || {}`).code((0, de._)`Object.assign(${n}, ${t})`));
    }),
    mergeToName: (e, t, n) => e.if((0, de._)`${n} !== true`, () => {
      t === !0 ? e.assign(n, !0) : (e.assign(n, (0, de._)`${n} || {}`), Js(e, n, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Vp
  }),
  items: cl({
    mergeNames: (e, t, n) => e.if((0, de._)`${n} !== true && ${t} !== undefined`, () => e.assign(n, (0, de._)`${t} === true ? true : ${n} > ${t} ? ${n} : ${t}`)),
    mergeToName: (e, t, n) => e.if((0, de._)`${n} !== true`, () => e.assign(n, t === !0 ? !0 : (0, de._)`${n} > ${t} ? ${n} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Vp(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const n = e.var("props", (0, de._)`{}`);
  return t !== void 0 && Js(e, n, t), n;
}
K.evaluatedPropsToName = Vp;
function Js(e, t, n) {
  Object.keys(n).forEach((r) => e.assign((0, de._)`${t}${(0, de.getProperty)(r)}`, !0));
}
K.setEvaluated = Js;
const ll = {};
function Vh(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: ll[t.code] || (ll[t.code] = new Lh._Code(t.code))
  });
}
K.useFunc = Vh;
var ys;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ys || (K.Type = ys = {}));
function Hh(e, t, n) {
  if (e instanceof de.Name) {
    const r = t === ys.Num;
    return n ? r ? (0, de._)`"[" + ${e} + "]"` : (0, de._)`"['" + ${e} + "']"` : r ? (0, de._)`"/" + ${e}` : (0, de._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return n ? (0, de.getProperty)(e).toString() : "/" + Ys(e);
}
K.getErrorPath = Hh;
function Hp(e, t, n = e.opts.strictSchema) {
  if (n) {
    if (t = `strict mode: ${t}`, n === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
K.checkStrictMode = Hp;
var We = {};
Object.defineProperty(We, "__esModule", { value: !0 });
const Ie = ee, Gh = {
  // validation function arguments
  data: new Ie.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ie.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ie.Name("instancePath"),
  parentData: new Ie.Name("parentData"),
  parentDataProperty: new Ie.Name("parentDataProperty"),
  rootData: new Ie.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ie.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ie.Name("vErrors"),
  // null or array of validation errors
  errors: new Ie.Name("errors"),
  // counter of validation errors
  this: new Ie.Name("this"),
  // "globals"
  self: new Ie.Name("self"),
  scope: new Ie.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ie.Name("json"),
  jsonPos: new Ie.Name("jsonPos"),
  jsonLen: new Ie.Name("jsonLen"),
  jsonPart: new Ie.Name("jsonPart")
};
We.default = Gh;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, n = K, r = We;
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: d }) => d ? (0, t.str)`"${v}" keyword must be ${d} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function a(v, d = e.keywordError, y, _) {
    const { it: x } = v, { gen: E, compositeRule: I, allErrors: C } = x, D = p(v, d, y);
    _ ?? (I || C) ? l(E, D) : u(x, (0, t._)`[${D}]`);
  }
  e.reportError = a;
  function i(v, d = e.keywordError, y) {
    const { it: _ } = v, { gen: x, compositeRule: E, allErrors: I } = _, C = p(v, d, y);
    l(x, C), E || I || u(_, r.default.vErrors);
  }
  e.reportExtraError = i;
  function s(v, d) {
    v.assign(r.default.errors, d), v.if((0, t._)`${r.default.vErrors} !== null`, () => v.if(d, () => v.assign((0, t._)`${r.default.vErrors}.length`, d), () => v.assign(r.default.vErrors, null)));
  }
  e.resetErrorsCount = s;
  function o({ gen: v, keyword: d, schemaValue: y, data: _, errsCount: x, it: E }) {
    if (x === void 0)
      throw new Error("ajv implementation error");
    const I = v.name("err");
    v.forRange("i", x, r.default.errors, (C) => {
      v.const(I, (0, t._)`${r.default.vErrors}[${C}]`), v.if((0, t._)`${I}.instancePath === undefined`, () => v.assign((0, t._)`${I}.instancePath`, (0, t.strConcat)(r.default.instancePath, E.errorPath))), v.assign((0, t._)`${I}.schemaPath`, (0, t.str)`${E.errSchemaPath}/${d}`), E.opts.verbose && (v.assign((0, t._)`${I}.schema`, y), v.assign((0, t._)`${I}.data`, _));
    });
  }
  e.extendErrors = o;
  function l(v, d) {
    const y = v.const("err", d);
    v.if((0, t._)`${r.default.vErrors} === null`, () => v.assign(r.default.vErrors, (0, t._)`[${y}]`), (0, t._)`${r.default.vErrors}.push(${y})`), v.code((0, t._)`${r.default.errors}++`);
  }
  function u(v, d) {
    const { gen: y, validateName: _, schemaEnv: x } = v;
    x.$async ? y.throw((0, t._)`new ${v.ValidationError}(${d})`) : (y.assign((0, t._)`${_}.errors`, d), y.return(!1));
  }
  const c = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function p(v, d, y) {
    const { createErrors: _ } = v.it;
    return _ === !1 ? (0, t._)`{}` : f(v, d, y);
  }
  function f(v, d, y = {}) {
    const { gen: _, it: x } = v, E = [
      h(x, y),
      g(v, y)
    ];
    return m(v, d, E), _.object(...E);
  }
  function h({ errorPath: v }, { instancePath: d }) {
    const y = d ? (0, t.str)`${v}${(0, n.getErrorPath)(d, n.Type.Str)}` : v;
    return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, y)];
  }
  function g({ keyword: v, it: { errSchemaPath: d } }, { schemaPath: y, parentSchema: _ }) {
    let x = _ ? d : (0, t.str)`${d}/${v}`;
    return y && (x = (0, t.str)`${x}${(0, n.getErrorPath)(y, n.Type.Str)}`), [c.schemaPath, x];
  }
  function m(v, { params: d, message: y }, _) {
    const { keyword: x, data: E, schemaValue: I, it: C } = v, { opts: D, propertyName: S, topSchemaRef: R, schemaPath: O } = C;
    _.push([c.keyword, x], [c.params, typeof d == "function" ? d(v) : d || (0, t._)`{}`]), D.messages && _.push([c.message, typeof y == "function" ? y(v) : y]), D.verbose && _.push([c.schema, I], [c.parentSchema, (0, t._)`${R}${O}`], [r.default.data, E]), S && _.push([c.propertyName, S]);
  }
})(Sr);
Object.defineProperty(Ln, "__esModule", { value: !0 });
Ln.boolOrEmptySchema = Ln.topBoolOrEmptySchema = void 0;
const Kh = Sr, Xh = ee, Wh = We, Yh = {
  message: "boolean schema is false"
};
function Jh(e) {
  const { gen: t, schema: n, validateName: r } = e;
  n === !1 ? Gp(e, !1) : typeof n == "object" && n.$async === !0 ? t.return(Wh.default.data) : (t.assign((0, Xh._)`${r}.errors`, null), t.return(!0));
}
Ln.topBoolOrEmptySchema = Jh;
function Qh(e, t) {
  const { gen: n, schema: r } = e;
  r === !1 ? (n.var(t, !1), Gp(e)) : n.var(t, !0);
}
Ln.boolOrEmptySchema = Qh;
function Gp(e, t) {
  const { gen: n, data: r } = e, a = {
    gen: n,
    keyword: "false schema",
    data: r,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Kh.reportError)(a, Yh, void 0, t);
}
var Ee = {}, sn = {};
Object.defineProperty(sn, "__esModule", { value: !0 });
sn.getRules = sn.isJSONType = void 0;
const Zh = ["string", "number", "integer", "boolean", "null", "object", "array"], ev = new Set(Zh);
function tv(e) {
  return typeof e == "string" && ev.has(e);
}
sn.isJSONType = tv;
function nv() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
sn.getRules = nv;
var Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.shouldUseRule = Et.shouldUseGroup = Et.schemaHasRulesForType = void 0;
function rv({ schema: e, self: t }, n) {
  const r = t.RULES.types[n];
  return r && r !== !0 && Kp(e, r);
}
Et.schemaHasRulesForType = rv;
function Kp(e, t) {
  return t.rules.some((n) => Xp(e, n));
}
Et.shouldUseGroup = Kp;
function Xp(e, t) {
  var n;
  return e[t.keyword] !== void 0 || ((n = t.definition.implements) === null || n === void 0 ? void 0 : n.some((r) => e[r] !== void 0));
}
Et.shouldUseRule = Xp;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.reportTypeError = Ee.checkDataTypes = Ee.checkDataType = Ee.coerceAndCheckDataType = Ee.getJSONTypes = Ee.getSchemaTypes = Ee.DataType = void 0;
const av = sn, iv = Et, sv = Sr, re = ee, Wp = K;
var Pn;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(Pn || (Ee.DataType = Pn = {}));
function ov(e) {
  const t = Yp(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
Ee.getSchemaTypes = ov;
function Yp(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(av.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Ee.getJSONTypes = Yp;
function cv(e, t) {
  const { gen: n, data: r, opts: a } = e, i = lv(t, a.coerceTypes), s = t.length > 0 && !(i.length === 0 && t.length === 1 && (0, iv.schemaHasRulesForType)(e, t[0]));
  if (s) {
    const o = Qs(t, r, a.strictNumbers, Pn.Wrong);
    n.if(o, () => {
      i.length ? uv(e, t, i) : Zs(e);
    });
  }
  return s;
}
Ee.coerceAndCheckDataType = cv;
const Jp = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function lv(e, t) {
  return t ? e.filter((n) => Jp.has(n) || t === "array" && n === "array") : [];
}
function uv(e, t, n) {
  const { gen: r, data: a, opts: i } = e, s = r.let("dataType", (0, re._)`typeof ${a}`), o = r.let("coerced", (0, re._)`undefined`);
  i.coerceTypes === "array" && r.if((0, re._)`${s} == 'object' && Array.isArray(${a}) && ${a}.length == 1`, () => r.assign(a, (0, re._)`${a}[0]`).assign(s, (0, re._)`typeof ${a}`).if(Qs(t, a, i.strictNumbers), () => r.assign(o, a))), r.if((0, re._)`${o} !== undefined`);
  for (const u of n)
    (Jp.has(u) || u === "array" && i.coerceTypes === "array") && l(u);
  r.else(), Zs(e), r.endIf(), r.if((0, re._)`${o} !== undefined`, () => {
    r.assign(a, o), pv(e, o);
  });
  function l(u) {
    switch (u) {
      case "string":
        r.elseIf((0, re._)`${s} == "number" || ${s} == "boolean"`).assign(o, (0, re._)`"" + ${a}`).elseIf((0, re._)`${a} === null`).assign(o, (0, re._)`""`);
        return;
      case "number":
        r.elseIf((0, re._)`${s} == "boolean" || ${a} === null
              || (${s} == "string" && ${a} && ${a} == +${a})`).assign(o, (0, re._)`+${a}`);
        return;
      case "integer":
        r.elseIf((0, re._)`${s} === "boolean" || ${a} === null
              || (${s} === "string" && ${a} && ${a} == +${a} && !(${a} % 1))`).assign(o, (0, re._)`+${a}`);
        return;
      case "boolean":
        r.elseIf((0, re._)`${a} === "false" || ${a} === 0 || ${a} === null`).assign(o, !1).elseIf((0, re._)`${a} === "true" || ${a} === 1`).assign(o, !0);
        return;
      case "null":
        r.elseIf((0, re._)`${a} === "" || ${a} === 0 || ${a} === false`), r.assign(o, null);
        return;
      case "array":
        r.elseIf((0, re._)`${s} === "string" || ${s} === "number"
              || ${s} === "boolean" || ${a} === null`).assign(o, (0, re._)`[${a}]`);
    }
  }
}
function pv({ gen: e, parentData: t, parentDataProperty: n }, r) {
  e.if((0, re._)`${t} !== undefined`, () => e.assign((0, re._)`${t}[${n}]`, r));
}
function gs(e, t, n, r = Pn.Correct) {
  const a = r === Pn.Correct ? re.operators.EQ : re.operators.NEQ;
  let i;
  switch (e) {
    case "null":
      return (0, re._)`${t} ${a} null`;
    case "array":
      i = (0, re._)`Array.isArray(${t})`;
      break;
    case "object":
      i = (0, re._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      i = s((0, re._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      i = s();
      break;
    default:
      return (0, re._)`typeof ${t} ${a} ${e}`;
  }
  return r === Pn.Correct ? i : (0, re.not)(i);
  function s(o = re.nil) {
    return (0, re.and)((0, re._)`typeof ${t} == "number"`, o, n ? (0, re._)`isFinite(${t})` : re.nil);
  }
}
Ee.checkDataType = gs;
function Qs(e, t, n, r) {
  if (e.length === 1)
    return gs(e[0], t, n, r);
  let a;
  const i = (0, Wp.toHash)(e);
  if (i.array && i.object) {
    const s = (0, re._)`typeof ${t} != "object"`;
    a = i.null ? s : (0, re._)`!${t} || ${s}`, delete i.null, delete i.array, delete i.object;
  } else
    a = re.nil;
  i.number && delete i.integer;
  for (const s in i)
    a = (0, re.and)(a, gs(s, t, n, r));
  return a;
}
Ee.checkDataTypes = Qs;
const dv = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, re._)`{type: ${e}}` : (0, re._)`{type: ${t}}`
};
function Zs(e) {
  const t = fv(e);
  (0, sv.reportError)(t, dv);
}
Ee.reportTypeError = Zs;
function fv(e) {
  const { gen: t, data: n, schema: r } = e, a = (0, Wp.schemaRefOrVal)(e, r, "type");
  return {
    gen: t,
    keyword: "type",
    data: n,
    schema: r.type,
    schemaCode: a,
    schemaValue: a,
    parentSchema: r,
    params: {},
    it: e
  };
}
var Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
Na.assignDefaults = void 0;
const gn = ee, mv = K;
function hv(e, t) {
  const { properties: n, items: r } = e.schema;
  if (t === "object" && n)
    for (const a in n)
      ul(e, a, n[a].default);
  else t === "array" && Array.isArray(r) && r.forEach((a, i) => ul(e, i, a.default));
}
Na.assignDefaults = hv;
function ul(e, t, n) {
  const { gen: r, compositeRule: a, data: i, opts: s } = e;
  if (n === void 0)
    return;
  const o = (0, gn._)`${i}${(0, gn.getProperty)(t)}`;
  if (a) {
    (0, mv.checkStrictMode)(e, `default is ignored for: ${o}`);
    return;
  }
  let l = (0, gn._)`${o} === undefined`;
  s.useDefaults === "empty" && (l = (0, gn._)`${l} || ${o} === null || ${o} === ""`), r.if(l, (0, gn._)`${o} = ${(0, gn.stringify)(n)}`);
}
var mt = {}, ae = {};
Object.defineProperty(ae, "__esModule", { value: !0 });
ae.validateUnion = ae.validateArray = ae.usePattern = ae.callValidateCode = ae.schemaProperties = ae.allSchemaProperties = ae.noPropertyInData = ae.propertyInData = ae.isOwnProperty = ae.hasPropFunc = ae.reportMissingProp = ae.checkMissingProp = ae.checkReportMissingProp = void 0;
const he = ee, eo = K, At = We, vv = K;
function yv(e, t) {
  const { gen: n, data: r, it: a } = e;
  n.if(no(n, r, t, a.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, he._)`${t}` }, !0), e.error();
  });
}
ae.checkReportMissingProp = yv;
function gv({ gen: e, data: t, it: { opts: n } }, r, a) {
  return (0, he.or)(...r.map((i) => (0, he.and)(no(e, t, i, n.ownProperties), (0, he._)`${a} = ${i}`)));
}
ae.checkMissingProp = gv;
function xv(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ae.reportMissingProp = xv;
function Qp(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, he._)`Object.prototype.hasOwnProperty`
  });
}
ae.hasPropFunc = Qp;
function to(e, t, n) {
  return (0, he._)`${Qp(e)}.call(${t}, ${n})`;
}
ae.isOwnProperty = to;
function bv(e, t, n, r) {
  const a = (0, he._)`${t}${(0, he.getProperty)(n)} !== undefined`;
  return r ? (0, he._)`${a} && ${to(e, t, n)}` : a;
}
ae.propertyInData = bv;
function no(e, t, n, r) {
  const a = (0, he._)`${t}${(0, he.getProperty)(n)} === undefined`;
  return r ? (0, he.or)(a, (0, he.not)(to(e, t, n))) : a;
}
ae.noPropertyInData = no;
function Zp(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ae.allSchemaProperties = Zp;
function _v(e, t) {
  return Zp(t).filter((n) => !(0, eo.alwaysValidSchema)(e, t[n]));
}
ae.schemaProperties = _v;
function Ev({ schemaCode: e, data: t, it: { gen: n, topSchemaRef: r, schemaPath: a, errorPath: i }, it: s }, o, l, u) {
  const c = u ? (0, he._)`${e}, ${t}, ${r}${a}` : t, p = [
    [At.default.instancePath, (0, he.strConcat)(At.default.instancePath, i)],
    [At.default.parentData, s.parentData],
    [At.default.parentDataProperty, s.parentDataProperty],
    [At.default.rootData, At.default.rootData]
  ];
  s.opts.dynamicRef && p.push([At.default.dynamicAnchors, At.default.dynamicAnchors]);
  const f = (0, he._)`${c}, ${n.object(...p)}`;
  return l !== he.nil ? (0, he._)`${o}.call(${l}, ${f})` : (0, he._)`${o}(${f})`;
}
ae.callValidateCode = Ev;
const wv = (0, he._)`new RegExp`;
function $v({ gen: e, it: { opts: t } }, n) {
  const r = t.unicodeRegExp ? "u" : "", { regExp: a } = t.code, i = a(n, r);
  return e.scopeValue("pattern", {
    key: i.toString(),
    ref: i,
    code: (0, he._)`${a.code === "new RegExp" ? wv : (0, vv.useFunc)(e, a)}(${n}, ${r})`
  });
}
ae.usePattern = $v;
function Sv(e) {
  const { gen: t, data: n, keyword: r, it: a } = e, i = t.name("valid");
  if (a.allErrors) {
    const o = t.let("valid", !0);
    return s(() => t.assign(o, !1)), o;
  }
  return t.var(i, !0), s(() => t.break()), i;
  function s(o) {
    const l = t.const("len", (0, he._)`${n}.length`);
    t.forRange("i", 0, l, (u) => {
      e.subschema({
        keyword: r,
        dataProp: u,
        dataPropType: eo.Type.Num
      }, i), t.if((0, he.not)(i), o);
    });
  }
}
ae.validateArray = Sv;
function Tv(e) {
  const { gen: t, schema: n, keyword: r, it: a } = e;
  if (!Array.isArray(n))
    throw new Error("ajv implementation error");
  if (n.some((l) => (0, eo.alwaysValidSchema)(a, l)) && !a.opts.unevaluated)
    return;
  const s = t.let("valid", !1), o = t.name("_valid");
  t.block(() => n.forEach((l, u) => {
    const c = e.subschema({
      keyword: r,
      schemaProp: u,
      compositeRule: !0
    }, o);
    t.assign(s, (0, he._)`${s} || ${o}`), e.mergeValidEvaluated(c, o) || t.if((0, he.not)(s));
  })), e.result(s, () => e.reset(), () => e.error(!0));
}
ae.validateUnion = Tv;
Object.defineProperty(mt, "__esModule", { value: !0 });
mt.validateKeywordUsage = mt.validSchemaType = mt.funcKeywordCode = mt.macroKeywordCode = void 0;
const De = ee, Gt = We, Rv = ae, Ov = Sr;
function Av(e, t) {
  const { gen: n, keyword: r, schema: a, parentSchema: i, it: s } = e, o = t.macro.call(s.self, a, i, s), l = ed(n, r, o);
  s.opts.validateSchema !== !1 && s.self.validateSchema(o, !0);
  const u = n.name("valid");
  e.subschema({
    schema: o,
    schemaPath: De.nil,
    errSchemaPath: `${s.errSchemaPath}/${r}`,
    topSchemaRef: l,
    compositeRule: !0
  }, u), e.pass(u, () => e.error(!0));
}
mt.macroKeywordCode = Av;
function Pv(e, t) {
  var n;
  const { gen: r, keyword: a, schema: i, parentSchema: s, $data: o, it: l } = e;
  Nv(l, t);
  const u = !o && t.compile ? t.compile.call(l.self, i, s, l) : t.validate, c = ed(r, a, u), p = r.let("valid");
  e.block$data(p, f), e.ok((n = t.valid) !== null && n !== void 0 ? n : p);
  function f() {
    if (t.errors === !1)
      m(), t.modifying && pl(e), v(() => e.error());
    else {
      const d = t.async ? h() : g();
      t.modifying && pl(e), v(() => kv(e, d));
    }
  }
  function h() {
    const d = r.let("ruleErrs", null);
    return r.try(() => m((0, De._)`await `), (y) => r.assign(p, !1).if((0, De._)`${y} instanceof ${l.ValidationError}`, () => r.assign(d, (0, De._)`${y}.errors`), () => r.throw(y))), d;
  }
  function g() {
    const d = (0, De._)`${c}.errors`;
    return r.assign(d, null), m(De.nil), d;
  }
  function m(d = t.async ? (0, De._)`await ` : De.nil) {
    const y = l.opts.passContext ? Gt.default.this : Gt.default.self, _ = !("compile" in t && !o || t.schema === !1);
    r.assign(p, (0, De._)`${d}${(0, Rv.callValidateCode)(e, c, y, _)}`, t.modifying);
  }
  function v(d) {
    var y;
    r.if((0, De.not)((y = t.valid) !== null && y !== void 0 ? y : p), d);
  }
}
mt.funcKeywordCode = Pv;
function pl(e) {
  const { gen: t, data: n, it: r } = e;
  t.if(r.parentData, () => t.assign(n, (0, De._)`${r.parentData}[${r.parentDataProperty}]`));
}
function kv(e, t) {
  const { gen: n } = e;
  n.if((0, De._)`Array.isArray(${t})`, () => {
    n.assign(Gt.default.vErrors, (0, De._)`${Gt.default.vErrors} === null ? ${t} : ${Gt.default.vErrors}.concat(${t})`).assign(Gt.default.errors, (0, De._)`${Gt.default.vErrors}.length`), (0, Ov.extendErrors)(e);
  }, () => e.error());
}
function Nv({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ed(e, t, n) {
  if (n === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof n == "function" ? { ref: n } : { ref: n, code: (0, De.stringify)(n) });
}
function Iv(e, t, n = !1) {
  return !t.length || t.some((r) => r === "array" ? Array.isArray(e) : r === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == r || n && typeof e > "u");
}
mt.validSchemaType = Iv;
function jv({ schema: e, opts: t, self: n, errSchemaPath: r }, a, i) {
  if (Array.isArray(a.keyword) ? !a.keyword.includes(i) : a.keyword !== i)
    throw new Error("ajv implementation error");
  const s = a.dependencies;
  if (s != null && s.some((o) => !Object.prototype.hasOwnProperty.call(e, o)))
    throw new Error(`parent schema must have dependencies of ${i}: ${s.join(",")}`);
  if (a.validateSchema && !a.validateSchema(e[i])) {
    const l = `keyword "${i}" value is invalid at path "${r}": ` + n.errorsText(a.validateSchema.errors);
    if (t.validateSchema === "log")
      n.logger.error(l);
    else
      throw new Error(l);
  }
}
mt.validateKeywordUsage = jv;
var Ut = {};
Object.defineProperty(Ut, "__esModule", { value: !0 });
Ut.extendSubschemaMode = Ut.extendSubschemaData = Ut.getSubschema = void 0;
const ft = ee, td = K;
function Cv(e, { keyword: t, schemaProp: n, schema: r, schemaPath: a, errSchemaPath: i, topSchemaRef: s }) {
  if (t !== void 0 && r !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const o = e.schema[t];
    return n === void 0 ? {
      schema: o,
      schemaPath: (0, ft._)`${e.schemaPath}${(0, ft.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: o[n],
      schemaPath: (0, ft._)`${e.schemaPath}${(0, ft.getProperty)(t)}${(0, ft.getProperty)(n)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, td.escapeFragment)(n)}`
    };
  }
  if (r !== void 0) {
    if (a === void 0 || i === void 0 || s === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: r,
      schemaPath: a,
      topSchemaRef: s,
      errSchemaPath: i
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Ut.getSubschema = Cv;
function Lv(e, t, { dataProp: n, dataPropType: r, data: a, dataTypes: i, propertyName: s }) {
  if (a !== void 0 && n !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: o } = t;
  if (n !== void 0) {
    const { errorPath: u, dataPathArr: c, opts: p } = t, f = o.let("data", (0, ft._)`${t.data}${(0, ft.getProperty)(n)}`, !0);
    l(f), e.errorPath = (0, ft.str)`${u}${(0, td.getErrorPath)(n, r, p.jsPropertySyntax)}`, e.parentDataProperty = (0, ft._)`${n}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (a !== void 0) {
    const u = a instanceof ft.Name ? a : o.let("data", a, !0);
    l(u), s !== void 0 && (e.propertyName = s);
  }
  i && (e.dataTypes = i);
  function l(u) {
    e.data = u, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, u];
  }
}
Ut.extendSubschemaData = Lv;
function Dv(e, { jtdDiscriminator: t, jtdMetadata: n, compositeRule: r, createErrors: a, allErrors: i }) {
  r !== void 0 && (e.compositeRule = r), a !== void 0 && (e.createErrors = a), i !== void 0 && (e.allErrors = i), e.jtdDiscriminator = t, e.jtdMetadata = n;
}
Ut.extendSubschemaMode = Dv;
var Pe = {}, nd = function e(t, n) {
  if (t === n) return !0;
  if (t && n && typeof t == "object" && typeof n == "object") {
    if (t.constructor !== n.constructor) return !1;
    var r, a, i;
    if (Array.isArray(t)) {
      if (r = t.length, r != n.length) return !1;
      for (a = r; a-- !== 0; )
        if (!e(t[a], n[a])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === n.source && t.flags === n.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === n.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === n.toString();
    if (i = Object.keys(t), r = i.length, r !== Object.keys(n).length) return !1;
    for (a = r; a-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(n, i[a])) return !1;
    for (a = r; a-- !== 0; ) {
      var s = i[a];
      if (!e(t[s], n[s])) return !1;
    }
    return !0;
  }
  return t !== t && n !== n;
}, rd = { exports: {} }, Lt = rd.exports = function(e, t, n) {
  typeof t == "function" && (n = t, t = {}), n = t.cb || n;
  var r = typeof n == "function" ? n : n.pre || function() {
  }, a = n.post || function() {
  };
  ca(t, r, a, e, "", e);
};
Lt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Lt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Lt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Lt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function ca(e, t, n, r, a, i, s, o, l, u) {
  if (r && typeof r == "object" && !Array.isArray(r)) {
    t(r, a, i, s, o, l, u);
    for (var c in r) {
      var p = r[c];
      if (Array.isArray(p)) {
        if (c in Lt.arrayKeywords)
          for (var f = 0; f < p.length; f++)
            ca(e, t, n, p[f], a + "/" + c + "/" + f, i, a, c, r, f);
      } else if (c in Lt.propsKeywords) {
        if (p && typeof p == "object")
          for (var h in p)
            ca(e, t, n, p[h], a + "/" + c + "/" + Fv(h), i, a, c, r, h);
      } else (c in Lt.keywords || e.allKeys && !(c in Lt.skipKeywords)) && ca(e, t, n, p, a + "/" + c, i, a, c, r);
    }
    n(r, a, i, s, o, l, u);
  }
}
function Fv(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Uv = rd.exports;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.getSchemaRefs = Pe.resolveUrl = Pe.normalizeId = Pe._getFullPath = Pe.getFullPath = Pe.inlineRef = void 0;
const Mv = K, zv = nd, qv = Uv, Bv = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Vv(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !xs(e) : t ? ad(e) <= t : !1;
}
Pe.inlineRef = Vv;
const Hv = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function xs(e) {
  for (const t in e) {
    if (Hv.has(t))
      return !0;
    const n = e[t];
    if (Array.isArray(n) && n.some(xs) || typeof n == "object" && xs(n))
      return !0;
  }
  return !1;
}
function ad(e) {
  let t = 0;
  for (const n in e) {
    if (n === "$ref")
      return 1 / 0;
    if (t++, !Bv.has(n) && (typeof e[n] == "object" && (0, Mv.eachItem)(e[n], (r) => t += ad(r)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function id(e, t = "", n) {
  n !== !1 && (t = kn(t));
  const r = e.parse(t);
  return sd(e, r);
}
Pe.getFullPath = id;
function sd(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Pe._getFullPath = sd;
const Gv = /#\/?$/;
function kn(e) {
  return e ? e.replace(Gv, "") : "";
}
Pe.normalizeId = kn;
function Kv(e, t, n) {
  return n = kn(n), e.resolve(t, n);
}
Pe.resolveUrl = Kv;
const Xv = /^[a-z_][-a-z0-9._]*$/i;
function Wv(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: n, uriResolver: r } = this.opts, a = kn(e[n] || t), i = { "": a }, s = id(r, a, !1), o = {}, l = /* @__PURE__ */ new Set();
  return qv(e, { allKeys: !0 }, (p, f, h, g) => {
    if (g === void 0)
      return;
    const m = s + f;
    let v = i[g];
    typeof p[n] == "string" && (v = d.call(this, p[n])), y.call(this, p.$anchor), y.call(this, p.$dynamicAnchor), i[f] = v;
    function d(_) {
      const x = this.opts.uriResolver.resolve;
      if (_ = kn(v ? x(v, _) : _), l.has(_))
        throw c(_);
      l.add(_);
      let E = this.refs[_];
      return typeof E == "string" && (E = this.refs[E]), typeof E == "object" ? u(p, E.schema, _) : _ !== kn(m) && (_[0] === "#" ? (u(p, o[_], _), o[_] = p) : this.refs[_] = m), _;
    }
    function y(_) {
      if (typeof _ == "string") {
        if (!Xv.test(_))
          throw new Error(`invalid anchor "${_}"`);
        d.call(this, `#${_}`);
      }
    }
  }), o;
  function u(p, f, h) {
    if (f !== void 0 && !zv(p, f))
      throw c(h);
  }
  function c(p) {
    return new Error(`reference "${p}" resolves to more than one schema`);
  }
}
Pe.getSchemaRefs = Wv;
Object.defineProperty(et, "__esModule", { value: !0 });
et.getData = et.KeywordCxt = et.validateFunctionCode = void 0;
const od = Ln, dl = Ee, ro = Et, ba = Ee, Yv = Na, mr = mt, wi = Ut, Y = ee, Z = We, Jv = Pe, wt = K, nr = Sr;
function Qv(e) {
  if (ud(e) && (pd(e), ld(e))) {
    ty(e);
    return;
  }
  cd(e, () => (0, od.topBoolOrEmptySchema)(e));
}
et.validateFunctionCode = Qv;
function cd({ gen: e, validateName: t, schema: n, schemaEnv: r, opts: a }, i) {
  a.code.es5 ? e.func(t, (0, Y._)`${Z.default.data}, ${Z.default.valCxt}`, r.$async, () => {
    e.code((0, Y._)`"use strict"; ${fl(n, a)}`), ey(e, a), e.code(i);
  }) : e.func(t, (0, Y._)`${Z.default.data}, ${Zv(a)}`, r.$async, () => e.code(fl(n, a)).code(i));
}
function Zv(e) {
  return (0, Y._)`{${Z.default.instancePath}="", ${Z.default.parentData}, ${Z.default.parentDataProperty}, ${Z.default.rootData}=${Z.default.data}${e.dynamicRef ? (0, Y._)`, ${Z.default.dynamicAnchors}={}` : Y.nil}}={}`;
}
function ey(e, t) {
  e.if(Z.default.valCxt, () => {
    e.var(Z.default.instancePath, (0, Y._)`${Z.default.valCxt}.${Z.default.instancePath}`), e.var(Z.default.parentData, (0, Y._)`${Z.default.valCxt}.${Z.default.parentData}`), e.var(Z.default.parentDataProperty, (0, Y._)`${Z.default.valCxt}.${Z.default.parentDataProperty}`), e.var(Z.default.rootData, (0, Y._)`${Z.default.valCxt}.${Z.default.rootData}`), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, Y._)`${Z.default.valCxt}.${Z.default.dynamicAnchors}`);
  }, () => {
    e.var(Z.default.instancePath, (0, Y._)`""`), e.var(Z.default.parentData, (0, Y._)`undefined`), e.var(Z.default.parentDataProperty, (0, Y._)`undefined`), e.var(Z.default.rootData, Z.default.data), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, Y._)`{}`);
  });
}
function ty(e) {
  const { schema: t, opts: n, gen: r } = e;
  cd(e, () => {
    n.$comment && t.$comment && fd(e), sy(e), r.let(Z.default.vErrors, null), r.let(Z.default.errors, 0), n.unevaluated && ny(e), dd(e), ly(e);
  });
}
function ny(e) {
  const { gen: t, validateName: n } = e;
  e.evaluated = t.const("evaluated", (0, Y._)`${n}.evaluated`), t.if((0, Y._)`${e.evaluated}.dynamicProps`, () => t.assign((0, Y._)`${e.evaluated}.props`, (0, Y._)`undefined`)), t.if((0, Y._)`${e.evaluated}.dynamicItems`, () => t.assign((0, Y._)`${e.evaluated}.items`, (0, Y._)`undefined`));
}
function fl(e, t) {
  const n = typeof e == "object" && e[t.schemaId];
  return n && (t.code.source || t.code.process) ? (0, Y._)`/*# sourceURL=${n} */` : Y.nil;
}
function ry(e, t) {
  if (ud(e) && (pd(e), ld(e))) {
    ay(e, t);
    return;
  }
  (0, od.boolOrEmptySchema)(e, t);
}
function ld({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (t.RULES.all[n])
      return !0;
  return !1;
}
function ud(e) {
  return typeof e.schema != "boolean";
}
function ay(e, t) {
  const { schema: n, gen: r, opts: a } = e;
  a.$comment && n.$comment && fd(e), oy(e), cy(e);
  const i = r.const("_errs", Z.default.errors);
  dd(e, i), r.var(t, (0, Y._)`${i} === ${Z.default.errors}`);
}
function pd(e) {
  (0, wt.checkUnknownRules)(e), iy(e);
}
function dd(e, t) {
  if (e.opts.jtd)
    return ml(e, [], !1, t);
  const n = (0, dl.getSchemaTypes)(e.schema), r = (0, dl.coerceAndCheckDataType)(e, n);
  ml(e, n, !r, t);
}
function iy(e) {
  const { schema: t, errSchemaPath: n, opts: r, self: a } = e;
  t.$ref && r.ignoreKeywordsWithRef && (0, wt.schemaHasRulesButRef)(t, a.RULES) && a.logger.warn(`$ref: keywords ignored in schema at path "${n}"`);
}
function sy(e) {
  const { schema: t, opts: n } = e;
  t.default !== void 0 && n.useDefaults && n.strictSchema && (0, wt.checkStrictMode)(e, "default is ignored in the schema root");
}
function oy(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Jv.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function cy(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function fd({ gen: e, schemaEnv: t, schema: n, errSchemaPath: r, opts: a }) {
  const i = n.$comment;
  if (a.$comment === !0)
    e.code((0, Y._)`${Z.default.self}.logger.log(${i})`);
  else if (typeof a.$comment == "function") {
    const s = (0, Y.str)`${r}/$comment`, o = e.scopeValue("root", { ref: t.root });
    e.code((0, Y._)`${Z.default.self}.opts.$comment(${i}, ${s}, ${o}.schema)`);
  }
}
function ly(e) {
  const { gen: t, schemaEnv: n, validateName: r, ValidationError: a, opts: i } = e;
  n.$async ? t.if((0, Y._)`${Z.default.errors} === 0`, () => t.return(Z.default.data), () => t.throw((0, Y._)`new ${a}(${Z.default.vErrors})`)) : (t.assign((0, Y._)`${r}.errors`, Z.default.vErrors), i.unevaluated && uy(e), t.return((0, Y._)`${Z.default.errors} === 0`));
}
function uy({ gen: e, evaluated: t, props: n, items: r }) {
  n instanceof Y.Name && e.assign((0, Y._)`${t}.props`, n), r instanceof Y.Name && e.assign((0, Y._)`${t}.items`, r);
}
function ml(e, t, n, r) {
  const { gen: a, schema: i, data: s, allErrors: o, opts: l, self: u } = e, { RULES: c } = u;
  if (i.$ref && (l.ignoreKeywordsWithRef || !(0, wt.schemaHasRulesButRef)(i, c))) {
    a.block(() => vd(e, "$ref", c.all.$ref.definition));
    return;
  }
  l.jtd || py(e, t), a.block(() => {
    for (const f of c.rules)
      p(f);
    p(c.post);
  });
  function p(f) {
    (0, ro.shouldUseGroup)(i, f) && (f.type ? (a.if((0, ba.checkDataType)(f.type, s, l.strictNumbers)), hl(e, f), t.length === 1 && t[0] === f.type && n && (a.else(), (0, ba.reportTypeError)(e)), a.endIf()) : hl(e, f), o || a.if((0, Y._)`${Z.default.errors} === ${r || 0}`));
  }
}
function hl(e, t) {
  const { gen: n, schema: r, opts: { useDefaults: a } } = e;
  a && (0, Yv.assignDefaults)(e, t.type), n.block(() => {
    for (const i of t.rules)
      (0, ro.shouldUseRule)(r, i) && vd(e, i.keyword, i.definition, t.type);
  });
}
function py(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (dy(e, t), e.opts.allowUnionTypes || fy(e, t), my(e, e.dataTypes));
}
function dy(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((n) => {
      md(e.dataTypes, n) || ao(e, `type "${n}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), vy(e, t);
  }
}
function fy(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && ao(e, "use allowUnionTypes to allow union type keyword");
}
function my(e, t) {
  const n = e.self.RULES.all;
  for (const r in n) {
    const a = n[r];
    if (typeof a == "object" && (0, ro.shouldUseRule)(e.schema, a)) {
      const { type: i } = a.definition;
      i.length && !i.some((s) => hy(t, s)) && ao(e, `missing type "${i.join(",")}" for keyword "${r}"`);
    }
  }
}
function hy(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function md(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function vy(e, t) {
  const n = [];
  for (const r of e.dataTypes)
    md(t, r) ? n.push(r) : t.includes("integer") && r === "number" && n.push("integer");
  e.dataTypes = n;
}
function ao(e, t) {
  const n = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${n}" (strictTypes)`, (0, wt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class hd {
  constructor(t, n, r) {
    if ((0, mr.validateKeywordUsage)(t, n, r), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = r, this.data = t.data, this.schema = t.schema[r], this.$data = n.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, wt.schemaRefOrVal)(t, this.schema, r, this.$data), this.schemaType = n.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = n, this.$data)
      this.schemaCode = t.gen.const("vSchema", yd(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, mr.validSchemaType)(this.schema, n.schemaType, n.allowUndefined))
      throw new Error(`${r} value must be ${JSON.stringify(n.schemaType)}`);
    ("code" in n ? n.trackErrors : n.errors !== !1) && (this.errsCount = t.gen.const("_errs", Z.default.errors));
  }
  result(t, n, r) {
    this.failResult((0, Y.not)(t), n, r);
  }
  failResult(t, n, r) {
    this.gen.if(t), r ? r() : this.error(), n ? (this.gen.else(), n(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, n) {
    this.failResult((0, Y.not)(t), void 0, n);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: n } = this;
    this.fail((0, Y._)`${n} !== undefined && (${(0, Y.or)(this.invalid$data(), t)})`);
  }
  error(t, n, r) {
    if (n) {
      this.setParams(n), this._error(t, r), this.setParams({});
      return;
    }
    this._error(t, r);
  }
  _error(t, n) {
    (t ? nr.reportExtraError : nr.reportError)(this, this.def.error, n);
  }
  $dataError() {
    (0, nr.reportError)(this, this.def.$dataError || nr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, nr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, n) {
    n ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, n, r = Y.nil) {
    this.gen.block(() => {
      this.check$data(t, r), n();
    });
  }
  check$data(t = Y.nil, n = Y.nil) {
    if (!this.$data)
      return;
    const { gen: r, schemaCode: a, schemaType: i, def: s } = this;
    r.if((0, Y.or)((0, Y._)`${a} === undefined`, n)), t !== Y.nil && r.assign(t, !0), (i.length || s.validateSchema) && (r.elseIf(this.invalid$data()), this.$dataError(), t !== Y.nil && r.assign(t, !1)), r.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: n, schemaType: r, def: a, it: i } = this;
    return (0, Y.or)(s(), o());
    function s() {
      if (r.length) {
        if (!(n instanceof Y.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(r) ? r : [r];
        return (0, Y._)`${(0, ba.checkDataTypes)(l, n, i.opts.strictNumbers, ba.DataType.Wrong)}`;
      }
      return Y.nil;
    }
    function o() {
      if (a.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: a.validateSchema });
        return (0, Y._)`!${l}(${n})`;
      }
      return Y.nil;
    }
  }
  subschema(t, n) {
    const r = (0, wi.getSubschema)(this.it, t);
    (0, wi.extendSubschemaData)(r, this.it, t), (0, wi.extendSubschemaMode)(r, t);
    const a = { ...this.it, ...r, items: void 0, props: void 0 };
    return ry(a, n), a;
  }
  mergeEvaluated(t, n) {
    const { it: r, gen: a } = this;
    r.opts.unevaluated && (r.props !== !0 && t.props !== void 0 && (r.props = wt.mergeEvaluated.props(a, t.props, r.props, n)), r.items !== !0 && t.items !== void 0 && (r.items = wt.mergeEvaluated.items(a, t.items, r.items, n)));
  }
  mergeValidEvaluated(t, n) {
    const { it: r, gen: a } = this;
    if (r.opts.unevaluated && (r.props !== !0 || r.items !== !0))
      return a.if(n, () => this.mergeEvaluated(t, Y.Name)), !0;
  }
}
et.KeywordCxt = hd;
function vd(e, t, n, r) {
  const a = new hd(e, n, t);
  "code" in n ? n.code(a, r) : a.$data && n.validate ? (0, mr.funcKeywordCode)(a, n) : "macro" in n ? (0, mr.macroKeywordCode)(a, n) : (n.compile || n.validate) && (0, mr.funcKeywordCode)(a, n);
}
const yy = /^\/(?:[^~]|~0|~1)*$/, gy = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function yd(e, { dataLevel: t, dataNames: n, dataPathArr: r }) {
  let a, i;
  if (e === "")
    return Z.default.rootData;
  if (e[0] === "/") {
    if (!yy.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    a = e, i = Z.default.rootData;
  } else {
    const u = gy.exec(e);
    if (!u)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const c = +u[1];
    if (a = u[2], a === "#") {
      if (c >= t)
        throw new Error(l("property/index", c));
      return r[t - c];
    }
    if (c > t)
      throw new Error(l("data", c));
    if (i = n[t - c], !a)
      return i;
  }
  let s = i;
  const o = a.split("/");
  for (const u of o)
    u && (i = (0, Y._)`${i}${(0, Y.getProperty)((0, wt.unescapeJsonPointer)(u))}`, s = (0, Y._)`${s} && ${i}`);
  return s;
  function l(u, c) {
    return `Cannot access ${u} ${c} levels up, current level is ${t}`;
  }
}
et.getData = yd;
var qn = {};
Object.defineProperty(qn, "__esModule", { value: !0 });
class xy extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
qn.default = xy;
var fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const $i = Pe;
class by extends Error {
  constructor(t, n, r, a) {
    super(a || `can't resolve reference ${r} from id ${n}`), this.missingRef = (0, $i.resolveUrl)(t, n, r), this.missingSchema = (0, $i.normalizeId)((0, $i.getFullPath)(t, this.missingRef));
  }
}
fn.default = by;
var Ue = {};
Object.defineProperty(Ue, "__esModule", { value: !0 });
Ue.resolveSchema = Ue.getCompilingSchema = Ue.resolveRef = Ue.compileSchema = Ue.SchemaEnv = void 0;
const at = ee, _y = qn, Ht = We, st = Pe, vl = K, Ey = et;
class Ia {
  constructor(t) {
    var n;
    this.refs = {}, this.dynamicAnchors = {};
    let r;
    typeof t.schema == "object" && (r = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (n = t.baseId) !== null && n !== void 0 ? n : (0, st.normalizeId)(r == null ? void 0 : r[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = r == null ? void 0 : r.$async, this.refs = {};
  }
}
Ue.SchemaEnv = Ia;
function io(e) {
  const t = gd.call(this, e);
  if (t)
    return t;
  const n = (0, st.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: r, lines: a } = this.opts.code, { ownProperties: i } = this.opts, s = new at.CodeGen(this.scope, { es5: r, lines: a, ownProperties: i });
  let o;
  e.$async && (o = s.scopeValue("Error", {
    ref: _y.default,
    code: (0, at._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = s.scopeName("validate");
  e.validateName = l;
  const u = {
    gen: s,
    allErrors: this.opts.allErrors,
    data: Ht.default.data,
    parentData: Ht.default.parentData,
    parentDataProperty: Ht.default.parentDataProperty,
    dataNames: [Ht.default.data],
    dataPathArr: [at.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: s.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, at.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: n,
    baseId: e.baseId || n,
    schemaPath: at.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, at._)`""`,
    opts: this.opts,
    self: this
  };
  let c;
  try {
    this._compilations.add(e), (0, Ey.validateFunctionCode)(u), s.optimize(this.opts.code.optimize);
    const p = s.toString();
    c = `${s.scopeRefs(Ht.default.scope)}return ${p}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const h = new Function(`${Ht.default.self}`, `${Ht.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(l, { ref: h }), h.errors = null, h.schema = e.schema, h.schemaEnv = e, e.$async && (h.$async = !0), this.opts.code.source === !0 && (h.source = { validateName: l, validateCode: p, scopeValues: s._values }), this.opts.unevaluated) {
      const { props: g, items: m } = u;
      h.evaluated = {
        props: g instanceof at.Name ? void 0 : g,
        items: m instanceof at.Name ? void 0 : m,
        dynamicProps: g instanceof at.Name,
        dynamicItems: m instanceof at.Name
      }, h.source && (h.source.evaluated = (0, at.stringify)(h.evaluated));
    }
    return e.validate = h, e;
  } catch (p) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), p;
  } finally {
    this._compilations.delete(e);
  }
}
Ue.compileSchema = io;
function wy(e, t, n) {
  var r;
  n = (0, st.resolveUrl)(this.opts.uriResolver, t, n);
  const a = e.refs[n];
  if (a)
    return a;
  let i = Ty.call(this, e, n);
  if (i === void 0) {
    const s = (r = e.localRefs) === null || r === void 0 ? void 0 : r[n], { schemaId: o } = this.opts;
    s && (i = new Ia({ schema: s, schemaId: o, root: e, baseId: t }));
  }
  if (i !== void 0)
    return e.refs[n] = $y.call(this, i);
}
Ue.resolveRef = wy;
function $y(e) {
  return (0, st.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : io.call(this, e);
}
function gd(e) {
  for (const t of this._compilations)
    if (Sy(t, e))
      return t;
}
Ue.getCompilingSchema = gd;
function Sy(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Ty(e, t) {
  let n;
  for (; typeof (n = this.refs[t]) == "string"; )
    t = n;
  return n || this.schemas[t] || ja.call(this, e, t);
}
function ja(e, t) {
  const n = this.opts.uriResolver.parse(t), r = (0, st._getFullPath)(this.opts.uriResolver, n);
  let a = (0, st.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && r === a)
    return Si.call(this, n, e);
  const i = (0, st.normalizeId)(r), s = this.refs[i] || this.schemas[i];
  if (typeof s == "string") {
    const o = ja.call(this, e, s);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : Si.call(this, n, o);
  }
  if (typeof (s == null ? void 0 : s.schema) == "object") {
    if (s.validate || io.call(this, s), i === (0, st.normalizeId)(t)) {
      const { schema: o } = s, { schemaId: l } = this.opts, u = o[l];
      return u && (a = (0, st.resolveUrl)(this.opts.uriResolver, a, u)), new Ia({ schema: o, schemaId: l, root: e, baseId: a });
    }
    return Si.call(this, n, s);
  }
}
Ue.resolveSchema = ja;
const Ry = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Si(e, { baseId: t, schema: n, root: r }) {
  var a;
  if (((a = e.fragment) === null || a === void 0 ? void 0 : a[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof n == "boolean")
      return;
    const l = n[(0, vl.unescapeFragment)(o)];
    if (l === void 0)
      return;
    n = l;
    const u = typeof n == "object" && n[this.opts.schemaId];
    !Ry.has(o) && u && (t = (0, st.resolveUrl)(this.opts.uriResolver, t, u));
  }
  let i;
  if (typeof n != "boolean" && n.$ref && !(0, vl.schemaHasRulesButRef)(n, this.RULES)) {
    const o = (0, st.resolveUrl)(this.opts.uriResolver, t, n.$ref);
    i = ja.call(this, r, o);
  }
  const { schemaId: s } = this.opts;
  if (i = i || new Ia({ schema: n, schemaId: s, root: r, baseId: t }), i.schema !== i.root.schema)
    return i;
}
const Oy = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Ay = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Py = "object", ky = [
  "$data"
], Ny = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Iy = !1, jy = {
  $id: Oy,
  description: Ay,
  type: Py,
  required: ky,
  properties: Ny,
  additionalProperties: Iy
};
var so = {}, Ca = { exports: {} };
const Cy = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), xd = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u), oo = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu), bd = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu), Ly = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
function _d(e) {
  let t = "", n = 0, r = 0;
  for (r = 0; r < e.length; r++)
    if (n = e[r].charCodeAt(0), n !== 48) {
      if (!(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
        return "";
      t += e[r];
      break;
    }
  for (r += 1; r < e.length; r++) {
    if (n = e[r].charCodeAt(0), !(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
      return "";
    t += e[r];
  }
  return t;
}
const Dy = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function yl(e) {
  return e.length = 0, !0;
}
function Fy(e, t, n) {
  if (e.length) {
    const r = _d(e);
    if (r !== "")
      t.push(r);
    else
      return n.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function Uy(e) {
  let t = 0;
  const n = { error: !1, address: "", zone: "" }, r = [], a = [];
  let i = !1, s = !1, o = Fy;
  for (let l = 0; l < e.length; l++) {
    const u = e[l];
    if (!(u === "[" || u === "]"))
      if (u === ":") {
        if (i === !0 && (s = !0), !o(a, r, n))
          break;
        if (++t > 7) {
          n.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (i = !0), r.push(":");
        continue;
      } else if (u === "%") {
        if (!o(a, r, n))
          break;
        o = yl;
      } else {
        a.push(u);
        continue;
      }
  }
  return a.length && (o === yl ? n.zone = a.join("") : s ? r.push(a.join("")) : r.push(_d(a))), n.address = r.join(""), n;
}
function Ed(e) {
  if (My(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Uy(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let n = t.address, r = t.address;
    return t.zone && (n += "%" + t.zone, r += "%25" + t.zone), { host: n, isIPV6: !0, escapedHost: r };
  }
}
function My(e, t) {
  let n = 0;
  for (let r = 0; r < e.length; r++)
    e[r] === t && n++;
  return n;
}
function zy(e) {
  let t = e;
  const n = [];
  let r = -1, a = 0;
  for (; a = t.length; ) {
    if (a === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        n.push("/");
        break;
      } else {
        n.push(t);
        break;
      }
    } else if (a === 2) {
      if (t[0] === ".") {
        if (t[1] === ".")
          break;
        if (t[1] === "/") {
          t = t.slice(2);
          continue;
        }
      } else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
        n.push("/");
        break;
      }
    } else if (a === 3 && t === "/..") {
      n.length !== 0 && n.pop(), n.push("/");
      break;
    }
    if (t[0] === ".") {
      if (t[1] === ".") {
        if (t[2] === "/") {
          t = t.slice(3);
          continue;
        }
      } else if (t[1] === "/") {
        t = t.slice(2);
        continue;
      }
    } else if (t[0] === "/" && t[1] === ".") {
      if (t[2] === "/") {
        t = t.slice(2);
        continue;
      } else if (t[2] === "." && t[3] === "/") {
        t = t.slice(3), n.length !== 0 && n.pop();
        continue;
      }
    }
    if ((r = t.indexOf("/", 1)) === -1) {
      n.push(t);
      break;
    } else
      n.push(t.slice(0, r)), t = t.slice(r);
  }
  return n.join("");
}
const qy = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" }, By = /[@/?#:]/g, Vy = /[@/?#]/g;
function wd(e, t) {
  const n = t ? Vy : By;
  return n.lastIndex = 0, e.replace(n, (r) => qy[r]);
}
function Hy(e, t = !1) {
  if (e.indexOf("%") === -1)
    return e;
  let n = "";
  for (let r = 0; r < e.length; r++) {
    if (e[r] === "%" && r + 2 < e.length) {
      const a = e.slice(r + 1, r + 3);
      if (oo(a)) {
        const i = a.toUpperCase(), s = String.fromCharCode(parseInt(i, 16));
        t && bd(s) ? n += s : n += "%" + i, r += 2;
        continue;
      }
    }
    n += e[r];
  }
  return n;
}
function Gy(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) {
    if (e[n] === "%" && n + 2 < e.length) {
      const r = e.slice(n + 1, n + 3);
      if (oo(r)) {
        const a = r.toUpperCase(), i = String.fromCharCode(parseInt(a, 16));
        i !== "." && bd(i) ? t += i : t += "%" + a, n += 2;
        continue;
      }
    }
    Ly(e[n]) ? t += e[n] : t += escape(e[n]);
  }
  return t;
}
function Ky(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) {
    if (e[n] === "%" && n + 2 < e.length) {
      const r = e.slice(n + 1, n + 3);
      if (oo(r)) {
        t += "%" + r.toUpperCase(), n += 2;
        continue;
      }
    }
    t += escape(e[n]);
  }
  return t;
}
function Xy(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let n = unescape(e.host);
    if (!xd(n)) {
      const r = Ed(n);
      r.isIPV6 === !0 ? n = `[${r.escapedHost}]` : n = wd(n, !1);
    }
    t.push(n);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var $d = {
  nonSimpleDomain: Dy,
  recomposeAuthority: Xy,
  reescapeHostDelimiters: wd,
  normalizePercentEncoding: Hy,
  normalizePathEncoding: Gy,
  escapePreservingEscapes: Ky,
  removeDotSegments: zy,
  isIPv4: xd,
  isUUID: Cy,
  normalizeIPv6: Ed
};
const { isUUID: Wy } = $d, Yy = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Sd(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Td(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Rd(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Jy(e) {
  return e.secure = Sd(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Qy(e) {
  if ((e.port === (Sd(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, n] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = n, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Zy(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const n = e.path.match(Yy);
  if (n) {
    const r = t.scheme || e.scheme || "urn";
    e.nid = n[1].toLowerCase(), e.nss = n[2];
    const a = `${r}:${t.nid || e.nid}`, i = co(a);
    e.path = void 0, i && (e = i.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function eg(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const n = t.scheme || e.scheme || "urn", r = e.nid.toLowerCase(), a = `${n}:${t.nid || r}`, i = co(a);
  i && (e = i.serialize(e, t));
  const s = e, o = e.nss;
  return s.path = `${r || t.nid}:${o}`, t.skipEscape = !0, s;
}
function tg(e, t) {
  const n = e;
  return n.uuid = n.nss, n.nss = void 0, !t.tolerant && (!n.uuid || !Wy(n.uuid)) && (n.error = n.error || "UUID is not valid."), n;
}
function ng(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Od = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Td,
    serialize: Rd
  }
), rg = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Od.domainHost,
    parse: Td,
    serialize: Rd
  }
), la = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Jy,
    serialize: Qy
  }
), ag = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: la.domainHost,
    parse: la.parse,
    serialize: la.serialize
  }
), ig = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Zy,
    serialize: eg,
    skipNormalize: !0
  }
), sg = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: tg,
    serialize: ng,
    skipNormalize: !0
  }
), _a = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Od,
    https: rg,
    ws: la,
    wss: ag,
    urn: ig,
    "urn:uuid": sg
  }
);
Object.setPrototypeOf(_a, null);
function co(e) {
  return e && (_a[
    /** @type {SchemeName} */
    e
  ] || _a[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var og = {
  SCHEMES: _a,
  getSchemeHandler: co
};
const { normalizeIPv6: cg, removeDotSegments: dr, recomposeAuthority: lg, normalizePercentEncoding: ug, normalizePathEncoding: pg, escapePreservingEscapes: dg, reescapeHostDelimiters: fg, isIPv4: mg, nonSimpleDomain: hg } = $d, { SCHEMES: vg, getSchemeHandler: Ad } = og;
function yg(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  Eg(e, t) : typeof e == "object" && (e = /** @type {T} */
  Dn(on(e, t), t)), e;
}
function gg(e, t, n) {
  const r = n ? Object.assign({ scheme: "null" }, n) : { scheme: "null" }, a = Pd(Dn(e, r), Dn(t, r), r, !0);
  return r.skipEscape = !0, on(a, r);
}
function Pd(e, t, n, r) {
  const a = {};
  return r || (e = Dn(on(e, n), n), t = Dn(on(t, n), n)), n = n || {}, !n.tolerant && t.scheme ? (a.scheme = t.scheme, a.userinfo = t.userinfo, a.host = t.host, a.port = t.port, a.path = dr(t.path || ""), a.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (a.userinfo = t.userinfo, a.host = t.host, a.port = t.port, a.path = dr(t.path || ""), a.query = t.query) : (t.path ? (t.path[0] === "/" ? a.path = dr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? a.path = "/" + t.path : e.path ? a.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : a.path = t.path, a.path = dr(a.path)), a.query = t.query) : (a.path = e.path, t.query !== void 0 ? a.query = t.query : a.query = e.query), a.userinfo = e.userinfo, a.host = e.host, a.port = e.port), a.scheme = e.scheme), a.fragment = t.fragment, a;
}
function xg(e, t, n) {
  const r = gl(e, n), a = gl(t, n);
  return r !== void 0 && a !== void 0 && r.toLowerCase() === a.toLowerCase();
}
function on(e, t) {
  const n = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, r = Object.assign({}, t), a = [], i = Ad(r.scheme || n.scheme);
  i && i.serialize && i.serialize(n, r), n.path !== void 0 && (r.skipEscape ? n.path = ug(n.path) : (n.path = dg(n.path), n.scheme !== void 0 && (n.path = n.path.split("%3A").join(":")))), r.reference !== "suffix" && n.scheme && a.push(n.scheme, ":");
  const s = lg(n);
  if (s !== void 0 && (r.reference !== "suffix" && a.push("//"), a.push(s), n.path && n.path[0] !== "/" && a.push("/")), n.path !== void 0) {
    let o = n.path;
    !r.absolutePath && (!i || !i.absolutePath) && (o = dr(o)), s === void 0 && o[0] === "/" && o[1] === "/" && (o = "/%2F" + o.slice(2)), a.push(o);
  }
  return n.query !== void 0 && a.push("?", n.query), n.fragment !== void 0 && a.push("#", n.fragment), a.join("");
}
const bg = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function _g(e, t) {
  if (t[2] !== void 0 && e.path && e.path[0] !== "/")
    return 'URI path must start with "/" when authority is present.';
  if (typeof e.port == "number" && (e.port < 0 || e.port > 65535))
    return "URI port is malformed.";
}
function kd(e, t) {
  const n = Object.assign({}, t), r = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let a = !1, i = !1;
  n.reference === "suffix" && (n.scheme ? e = n.scheme + ":" + e : e = "//" + e);
  const s = e.match(bg);
  if (s) {
    r.scheme = s[1], r.userinfo = s[3], r.host = s[4], r.port = parseInt(s[5], 10), r.path = s[6] || "", r.query = s[7], r.fragment = s[8], isNaN(r.port) && (r.port = s[5]);
    const o = _g(r, s);
    if (o !== void 0 && (r.error = r.error || o, a = !0), r.host)
      if (mg(r.host) === !1) {
        const c = cg(r.host);
        r.host = c.host.toLowerCase(), i = c.isIPV6;
      } else
        i = !0;
    r.scheme === void 0 && r.userinfo === void 0 && r.host === void 0 && r.port === void 0 && r.query === void 0 && !r.path ? r.reference = "same-document" : r.scheme === void 0 ? r.reference = "relative" : r.fragment === void 0 ? r.reference = "absolute" : r.reference = "uri", n.reference && n.reference !== "suffix" && n.reference !== r.reference && (r.error = r.error || "URI is not a " + n.reference + " reference.");
    const l = Ad(n.scheme || r.scheme);
    if (!n.unicodeSupport && (!l || !l.unicodeSupport) && r.host && (n.domainHost || l && l.domainHost) && i === !1 && hg(r.host))
      try {
        r.host = URL.domainToASCII(r.host.toLowerCase());
      } catch (u) {
        r.error = r.error || "Host's domain name can not be converted to ASCII: " + u;
      }
    if ((!l || l && !l.skipNormalize) && (e.indexOf("%") !== -1 && (r.scheme !== void 0 && (r.scheme = unescape(r.scheme)), r.host !== void 0 && (r.host = fg(unescape(r.host), i))), r.path && (r.path = pg(r.path)), r.fragment))
      try {
        r.fragment = encodeURI(decodeURIComponent(r.fragment));
      } catch {
        r.error = r.error || "URI malformed";
      }
    l && l.parse && l.parse(r, n);
  } else
    r.error = r.error || "URI can not be parsed.";
  return { parsed: r, malformedAuthorityOrPort: a };
}
function Dn(e, t) {
  return kd(e, t).parsed;
}
function Eg(e, t) {
  return Nd(e, t).normalized;
}
function Nd(e, t) {
  const { parsed: n, malformedAuthorityOrPort: r } = kd(e, t);
  return {
    normalized: r ? e : on(n, t),
    malformedAuthorityOrPort: r
  };
}
function gl(e, t) {
  if (typeof e == "string") {
    const { normalized: n, malformedAuthorityOrPort: r } = Nd(e, t);
    return r ? void 0 : n;
  }
  if (typeof e == "object")
    return on(e, t);
}
const lo = {
  SCHEMES: vg,
  normalize: yg,
  resolve: gg,
  resolveComponent: Pd,
  equal: xg,
  serialize: on,
  parse: Dn
};
Ca.exports = lo;
Ca.exports.default = lo;
Ca.exports.fastUri = lo;
var wg = Ca.exports;
Object.defineProperty(so, "__esModule", { value: !0 });
const Id = wg;
Id.code = 'require("ajv/dist/runtime/uri").default';
so.default = Id;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = et;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var n = ee;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return n.CodeGen;
  } });
  const r = qn, a = fn, i = sn, s = Ue, o = ee, l = Pe, u = Ee, c = K, p = jy, f = so, h = (L, $) => new RegExp(L, $);
  h.code = "new RegExp";
  const g = ["removeAdditional", "useDefaults", "coerceTypes"], m = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, d = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, y = 200;
  function _(L) {
    var $, N, T, b, w, M, q, z, X, W, J, ue, fe, ie, Ge, tt, me, Ye, Wn, qt, vn, Yn, Jn, Bt, yn;
    const St = L.strict, Vt = ($ = L.code) === null || $ === void 0 ? void 0 : $.optimize, Tc = Vt === !0 || Vt === void 0 ? 1 : Vt || 0, Rc = (T = (N = L.code) === null || N === void 0 ? void 0 : N.regExp) !== null && T !== void 0 ? T : h, bm = (b = L.uriResolver) !== null && b !== void 0 ? b : f.default;
    return {
      strictSchema: (M = (w = L.strictSchema) !== null && w !== void 0 ? w : St) !== null && M !== void 0 ? M : !0,
      strictNumbers: (z = (q = L.strictNumbers) !== null && q !== void 0 ? q : St) !== null && z !== void 0 ? z : !0,
      strictTypes: (W = (X = L.strictTypes) !== null && X !== void 0 ? X : St) !== null && W !== void 0 ? W : "log",
      strictTuples: (ue = (J = L.strictTuples) !== null && J !== void 0 ? J : St) !== null && ue !== void 0 ? ue : "log",
      strictRequired: (ie = (fe = L.strictRequired) !== null && fe !== void 0 ? fe : St) !== null && ie !== void 0 ? ie : !1,
      code: L.code ? { ...L.code, optimize: Tc, regExp: Rc } : { optimize: Tc, regExp: Rc },
      loopRequired: (Ge = L.loopRequired) !== null && Ge !== void 0 ? Ge : y,
      loopEnum: (tt = L.loopEnum) !== null && tt !== void 0 ? tt : y,
      meta: (me = L.meta) !== null && me !== void 0 ? me : !0,
      messages: (Ye = L.messages) !== null && Ye !== void 0 ? Ye : !0,
      inlineRefs: (Wn = L.inlineRefs) !== null && Wn !== void 0 ? Wn : !0,
      schemaId: (qt = L.schemaId) !== null && qt !== void 0 ? qt : "$id",
      addUsedSchema: (vn = L.addUsedSchema) !== null && vn !== void 0 ? vn : !0,
      validateSchema: (Yn = L.validateSchema) !== null && Yn !== void 0 ? Yn : !0,
      validateFormats: (Jn = L.validateFormats) !== null && Jn !== void 0 ? Jn : !0,
      unicodeRegExp: (Bt = L.unicodeRegExp) !== null && Bt !== void 0 ? Bt : !0,
      int32range: (yn = L.int32range) !== null && yn !== void 0 ? yn : !0,
      uriResolver: bm
    };
  }
  class x {
    constructor($ = {}) {
      this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), $ = this.opts = { ...$, ..._($) };
      const { es5: N, lines: T } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: m, es5: N, lines: T }), this.logger = k($.logger);
      const b = $.validateFormats;
      $.validateFormats = !1, this.RULES = (0, i.getRules)(), E.call(this, v, $, "NOT SUPPORTED"), E.call(this, d, $, "DEPRECATED", "warn"), this._metaOpts = R.call(this), $.formats && D.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), $.keywords && S.call(this, $.keywords), typeof $.meta == "object" && this.addMetaSchema($.meta), C.call(this), $.validateFormats = b;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: $, meta: N, schemaId: T } = this.opts;
      let b = p;
      T === "id" && (b = { ...p }, b.id = b.$id, delete b.$id), N && $ && this.addMetaSchema(b, b[T], !1);
    }
    defaultMeta() {
      const { meta: $, schemaId: N } = this.opts;
      return this.opts.defaultMeta = typeof $ == "object" ? $[N] || $ : void 0;
    }
    validate($, N) {
      let T;
      if (typeof $ == "string") {
        if (T = this.getSchema($), !T)
          throw new Error(`no schema with key or ref "${$}"`);
      } else
        T = this.compile($);
      const b = T(N);
      return "$async" in T || (this.errors = T.errors), b;
    }
    compile($, N) {
      const T = this._addSchema($, N);
      return T.validate || this._compileSchemaEnv(T);
    }
    compileAsync($, N) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: T } = this.opts;
      return b.call(this, $, N);
      async function b(W, J) {
        await w.call(this, W.$schema);
        const ue = this._addSchema(W, J);
        return ue.validate || M.call(this, ue);
      }
      async function w(W) {
        W && !this.getSchema(W) && await b.call(this, { $ref: W }, !0);
      }
      async function M(W) {
        try {
          return this._compileSchemaEnv(W);
        } catch (J) {
          if (!(J instanceof a.default))
            throw J;
          return q.call(this, J), await z.call(this, J.missingSchema), M.call(this, W);
        }
      }
      function q({ missingSchema: W, missingRef: J }) {
        if (this.refs[W])
          throw new Error(`AnySchema ${W} is loaded but ${J} cannot be resolved`);
      }
      async function z(W) {
        const J = await X.call(this, W);
        this.refs[W] || await w.call(this, J.$schema), this.refs[W] || this.addSchema(J, W, N);
      }
      async function X(W) {
        const J = this._loading[W];
        if (J)
          return J;
        try {
          return await (this._loading[W] = T(W));
        } finally {
          delete this._loading[W];
        }
      }
    }
    // Adds schema to the instance
    addSchema($, N, T, b = this.opts.validateSchema) {
      if (Array.isArray($)) {
        for (const M of $)
          this.addSchema(M, void 0, T, b);
        return this;
      }
      let w;
      if (typeof $ == "object") {
        const { schemaId: M } = this.opts;
        if (w = $[M], w !== void 0 && typeof w != "string")
          throw new Error(`schema ${M} must be string`);
      }
      return N = (0, l.normalizeId)(N || w), this._checkUnique(N), this.schemas[N] = this._addSchema($, T, N, b, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema($, N, T = this.opts.validateSchema) {
      return this.addSchema($, N, !0, T), this;
    }
    //  Validate schema against its meta-schema
    validateSchema($, N) {
      if (typeof $ == "boolean")
        return !0;
      let T;
      if (T = $.$schema, T !== void 0 && typeof T != "string")
        throw new Error("$schema must be a string");
      if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const b = this.validate(T, $);
      if (!b && N) {
        const w = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(w);
        else
          throw new Error(w);
      }
      return b;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema($) {
      let N;
      for (; typeof (N = I.call(this, $)) == "string"; )
        $ = N;
      if (N === void 0) {
        const { schemaId: T } = this.opts, b = new s.SchemaEnv({ schema: {}, schemaId: T });
        if (N = s.resolveSchema.call(this, b, $), !N)
          return;
        this.refs[$] = N;
      }
      return N.validate || this._compileSchemaEnv(N);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema($) {
      if ($ instanceof RegExp)
        return this._removeAllSchemas(this.schemas, $), this._removeAllSchemas(this.refs, $), this;
      switch (typeof $) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const N = I.call(this, $);
          return typeof N == "object" && this._cache.delete(N.schema), delete this.schemas[$], delete this.refs[$], this;
        }
        case "object": {
          const N = $;
          this._cache.delete(N);
          let T = $[this.opts.schemaId];
          return T && (T = (0, l.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary($) {
      for (const N of $)
        this.addKeyword(N);
      return this;
    }
    addKeyword($, N) {
      let T;
      if (typeof $ == "string")
        T = $, typeof N == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), N.keyword = T);
      else if (typeof $ == "object" && N === void 0) {
        if (N = $, T = N.keyword, Array.isArray(T) && !T.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (P.call(this, T, N), !N)
        return (0, c.eachItem)(T, (w) => F.call(this, w)), this;
      j.call(this, N);
      const b = {
        ...N,
        type: (0, u.getJSONTypes)(N.type),
        schemaType: (0, u.getJSONTypes)(N.schemaType)
      };
      return (0, c.eachItem)(T, b.type.length === 0 ? (w) => F.call(this, w, b) : (w) => b.type.forEach((M) => F.call(this, w, b, M))), this;
    }
    getKeyword($) {
      const N = this.RULES.all[$];
      return typeof N == "object" ? N.definition : !!N;
    }
    // Remove keyword
    removeKeyword($) {
      const { RULES: N } = this;
      delete N.keywords[$], delete N.all[$];
      for (const T of N.rules) {
        const b = T.rules.findIndex((w) => w.keyword === $);
        b >= 0 && T.rules.splice(b, 1);
      }
      return this;
    }
    // Add format
    addFormat($, N) {
      return typeof N == "string" && (N = new RegExp(N)), this.formats[$] = N, this;
    }
    errorsText($ = this.errors, { separator: N = ", ", dataVar: T = "data" } = {}) {
      return !$ || $.length === 0 ? "No errors" : $.map((b) => `${T}${b.instancePath} ${b.message}`).reduce((b, w) => b + N + w);
    }
    $dataMetaSchema($, N) {
      const T = this.RULES.all;
      $ = JSON.parse(JSON.stringify($));
      for (const b of N) {
        const w = b.split("/").slice(1);
        let M = $;
        for (const q of w)
          M = M[q];
        for (const q in T) {
          const z = T[q];
          if (typeof z != "object")
            continue;
          const { $data: X } = z.definition, W = M[q];
          X && W && (M[q] = B(W));
        }
      }
      return $;
    }
    _removeAllSchemas($, N) {
      for (const T in $) {
        const b = $[T];
        (!N || N.test(T)) && (typeof b == "string" ? delete $[T] : b && !b.meta && (this._cache.delete(b.schema), delete $[T]));
      }
    }
    _addSchema($, N, T, b = this.opts.validateSchema, w = this.opts.addUsedSchema) {
      let M;
      const { schemaId: q } = this.opts;
      if (typeof $ == "object")
        M = $[q];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof $ != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let z = this._cache.get($);
      if (z !== void 0)
        return z;
      T = (0, l.normalizeId)(M || T);
      const X = l.getSchemaRefs.call(this, $, T);
      return z = new s.SchemaEnv({ schema: $, schemaId: q, meta: N, baseId: T, localRefs: X }), this._cache.set(z.schema, z), w && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = z), b && this.validateSchema($, !0), z;
    }
    _checkUnique($) {
      if (this.schemas[$] || this.refs[$])
        throw new Error(`schema with key or id "${$}" already exists`);
    }
    _compileSchemaEnv($) {
      if ($.meta ? this._compileMetaSchema($) : s.compileSchema.call(this, $), !$.validate)
        throw new Error("ajv implementation error");
      return $.validate;
    }
    _compileMetaSchema($) {
      const N = this.opts;
      this.opts = this._metaOpts;
      try {
        s.compileSchema.call(this, $);
      } finally {
        this.opts = N;
      }
    }
  }
  x.ValidationError = r.default, x.MissingRefError = a.default, e.default = x;
  function E(L, $, N, T = "error") {
    for (const b in L) {
      const w = b;
      w in $ && this.logger[T](`${N}: option ${b}. ${L[w]}`);
    }
  }
  function I(L) {
    return L = (0, l.normalizeId)(L), this.schemas[L] || this.refs[L];
  }
  function C() {
    const L = this.opts.schemas;
    if (L)
      if (Array.isArray(L))
        this.addSchema(L);
      else
        for (const $ in L)
          this.addSchema(L[$], $);
  }
  function D() {
    for (const L in this.opts.formats) {
      const $ = this.opts.formats[L];
      $ && this.addFormat(L, $);
    }
  }
  function S(L) {
    if (Array.isArray(L)) {
      this.addVocabulary(L);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const $ in L) {
      const N = L[$];
      N.keyword || (N.keyword = $), this.addKeyword(N);
    }
  }
  function R() {
    const L = { ...this.opts };
    for (const $ of g)
      delete L[$];
    return L;
  }
  const O = { log() {
  }, warn() {
  }, error() {
  } };
  function k(L) {
    if (L === !1)
      return O;
    if (L === void 0)
      return console;
    if (L.log && L.warn && L.error)
      return L;
    throw new Error("logger must implement log, warn and error methods");
  }
  const V = /^[a-z_$][a-z0-9_$:-]*$/i;
  function P(L, $) {
    const { RULES: N } = this;
    if ((0, c.eachItem)(L, (T) => {
      if (N.keywords[T])
        throw new Error(`Keyword ${T} is already defined`);
      if (!V.test(T))
        throw new Error(`Keyword ${T} has invalid name`);
    }), !!$ && $.$data && !("code" in $ || "validate" in $))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function F(L, $, N) {
    var T;
    const b = $ == null ? void 0 : $.post;
    if (N && b)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: w } = this;
    let M = b ? w.post : w.rules.find(({ type: z }) => z === N);
    if (M || (M = { type: N, rules: [] }, w.rules.push(M)), w.keywords[L] = !0, !$)
      return;
    const q = {
      keyword: L,
      definition: {
        ...$,
        type: (0, u.getJSONTypes)($.type),
        schemaType: (0, u.getJSONTypes)($.schemaType)
      }
    };
    $.before ? H.call(this, M, q, $.before) : M.rules.push(q), w.all[L] = q, (T = $.implements) === null || T === void 0 || T.forEach((z) => this.addKeyword(z));
  }
  function H(L, $, N) {
    const T = L.rules.findIndex((b) => b.keyword === N);
    T >= 0 ? L.rules.splice(T, 0, $) : (L.rules.push($), this.logger.warn(`rule ${N} is not defined`));
  }
  function j(L) {
    let { metaSchema: $ } = L;
    $ !== void 0 && (L.$data && this.opts.$data && ($ = B($)), L.validateSchema = this.compile($, !0));
  }
  const U = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function B(L) {
    return { anyOf: [L, U] };
  }
})(Ws);
var uo = {}, La = {}, po = {};
Object.defineProperty(po, "__esModule", { value: !0 });
const $g = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
po.default = $g;
var $t = {};
Object.defineProperty($t, "__esModule", { value: !0 });
$t.callRef = $t.getValidate = void 0;
const Sg = fn, xl = ae, qe = ee, xn = We, bl = Ue, Vr = K, Tg = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: n, it: r } = e, { baseId: a, schemaEnv: i, validateName: s, opts: o, self: l } = r, { root: u } = i;
    if ((n === "#" || n === "#/") && a === u.baseId)
      return p();
    const c = bl.resolveRef.call(l, u, a, n);
    if (c === void 0)
      throw new Sg.default(r.opts.uriResolver, a, n);
    if (c instanceof bl.SchemaEnv)
      return f(c);
    return h(c);
    function p() {
      if (i === u)
        return ua(e, s, i, i.$async);
      const g = t.scopeValue("root", { ref: u });
      return ua(e, (0, qe._)`${g}.validate`, u, u.$async);
    }
    function f(g) {
      const m = jd(e, g);
      ua(e, m, g, g.$async);
    }
    function h(g) {
      const m = t.scopeValue("schema", o.code.source === !0 ? { ref: g, code: (0, qe.stringify)(g) } : { ref: g }), v = t.name("valid"), d = e.subschema({
        schema: g,
        dataTypes: [],
        schemaPath: qe.nil,
        topSchemaRef: m,
        errSchemaPath: n
      }, v);
      e.mergeEvaluated(d), e.ok(v);
    }
  }
};
function jd(e, t) {
  const { gen: n } = e;
  return t.validate ? n.scopeValue("validate", { ref: t.validate }) : (0, qe._)`${n.scopeValue("wrapper", { ref: t })}.validate`;
}
$t.getValidate = jd;
function ua(e, t, n, r) {
  const { gen: a, it: i } = e, { allErrors: s, schemaEnv: o, opts: l } = i, u = l.passContext ? xn.default.this : qe.nil;
  r ? c() : p();
  function c() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const g = a.let("valid");
    a.try(() => {
      a.code((0, qe._)`await ${(0, xl.callValidateCode)(e, t, u)}`), h(t), s || a.assign(g, !0);
    }, (m) => {
      a.if((0, qe._)`!(${m} instanceof ${i.ValidationError})`, () => a.throw(m)), f(m), s || a.assign(g, !1);
    }), e.ok(g);
  }
  function p() {
    e.result((0, xl.callValidateCode)(e, t, u), () => h(t), () => f(t));
  }
  function f(g) {
    const m = (0, qe._)`${g}.errors`;
    a.assign(xn.default.vErrors, (0, qe._)`${xn.default.vErrors} === null ? ${m} : ${xn.default.vErrors}.concat(${m})`), a.assign(xn.default.errors, (0, qe._)`${xn.default.vErrors}.length`);
  }
  function h(g) {
    var m;
    if (!i.opts.unevaluated)
      return;
    const v = (m = n == null ? void 0 : n.validate) === null || m === void 0 ? void 0 : m.evaluated;
    if (i.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (i.props = Vr.mergeEvaluated.props(a, v.props, i.props));
      else {
        const d = a.var("props", (0, qe._)`${g}.evaluated.props`);
        i.props = Vr.mergeEvaluated.props(a, d, i.props, qe.Name);
      }
    if (i.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (i.items = Vr.mergeEvaluated.items(a, v.items, i.items));
      else {
        const d = a.var("items", (0, qe._)`${g}.evaluated.items`);
        i.items = Vr.mergeEvaluated.items(a, d, i.items, qe.Name);
      }
  }
}
$t.callRef = ua;
$t.default = Tg;
Object.defineProperty(La, "__esModule", { value: !0 });
const Rg = po, Og = $t, Ag = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Rg.default,
  Og.default
];
La.default = Ag;
var Da = {}, fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Ea = ee, Pt = Ea.operators, wa = {
  maximum: { okStr: "<=", ok: Pt.LTE, fail: Pt.GT },
  minimum: { okStr: ">=", ok: Pt.GTE, fail: Pt.LT },
  exclusiveMaximum: { okStr: "<", ok: Pt.LT, fail: Pt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Pt.GT, fail: Pt.LTE }
}, Pg = {
  message: ({ keyword: e, schemaCode: t }) => (0, Ea.str)`must be ${wa[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Ea._)`{comparison: ${wa[e].okStr}, limit: ${t}}`
}, kg = {
  keyword: Object.keys(wa),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Pg,
  code(e) {
    const { keyword: t, data: n, schemaCode: r } = e;
    e.fail$data((0, Ea._)`${n} ${wa[t].fail} ${r} || isNaN(${n})`);
  }
};
fo.default = kg;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const hr = ee, Ng = {
  message: ({ schemaCode: e }) => (0, hr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, hr._)`{multipleOf: ${e}}`
}, Ig = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Ng,
  code(e) {
    const { gen: t, data: n, schemaCode: r, it: a } = e, i = a.opts.multipleOfPrecision, s = t.let("res"), o = i ? (0, hr._)`Math.abs(Math.round(${s}) - ${s}) > 1e-${i}` : (0, hr._)`${s} !== parseInt(${s})`;
    e.fail$data((0, hr._)`(${r} === 0 || (${s} = ${n}/${r}, ${o}))`);
  }
};
mo.default = Ig;
var ho = {}, vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
function Cd(e) {
  const t = e.length;
  let n = 0, r = 0, a;
  for (; r < t; )
    n++, a = e.charCodeAt(r++), a >= 55296 && a <= 56319 && r < t && (a = e.charCodeAt(r), (a & 64512) === 56320 && r++);
  return n;
}
vo.default = Cd;
Cd.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(ho, "__esModule", { value: !0 });
const Kt = ee, jg = K, Cg = vo, Lg = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxLength" ? "more" : "fewer";
    return (0, Kt.str)`must NOT have ${n} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Kt._)`{limit: ${e}}`
}, Dg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Lg,
  code(e) {
    const { keyword: t, data: n, schemaCode: r, it: a } = e, i = t === "maxLength" ? Kt.operators.GT : Kt.operators.LT, s = a.opts.unicode === !1 ? (0, Kt._)`${n}.length` : (0, Kt._)`${(0, jg.useFunc)(e.gen, Cg.default)}(${n})`;
    e.fail$data((0, Kt._)`${s} ${i} ${r}`);
  }
};
ho.default = Dg;
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const Fg = ae, Ug = K, Rn = ee, Mg = {
  message: ({ schemaCode: e }) => (0, Rn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Rn._)`{pattern: ${e}}`
}, zg = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Mg,
  code(e) {
    const { gen: t, data: n, $data: r, schema: a, schemaCode: i, it: s } = e, o = s.opts.unicodeRegExp ? "u" : "";
    if (r) {
      const { regExp: l } = s.opts.code, u = l.code === "new RegExp" ? (0, Rn._)`new RegExp` : (0, Ug.useFunc)(t, l), c = t.let("valid");
      t.try(() => t.assign(c, (0, Rn._)`${u}(${i}, ${o}).test(${n})`), () => t.assign(c, !1)), e.fail$data((0, Rn._)`!${c}`);
    } else {
      const l = (0, Fg.usePattern)(e, a);
      e.fail$data((0, Rn._)`!${l}.test(${n})`);
    }
  }
};
yo.default = zg;
var go = {};
Object.defineProperty(go, "__esModule", { value: !0 });
const vr = ee, qg = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxProperties" ? "more" : "fewer";
    return (0, vr.str)`must NOT have ${n} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, vr._)`{limit: ${e}}`
}, Bg = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: qg,
  code(e) {
    const { keyword: t, data: n, schemaCode: r } = e, a = t === "maxProperties" ? vr.operators.GT : vr.operators.LT;
    e.fail$data((0, vr._)`Object.keys(${n}).length ${a} ${r}`);
  }
};
go.default = Bg;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const rr = ae, yr = ee, Vg = K, Hg = {
  message: ({ params: { missingProperty: e } }) => (0, yr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, yr._)`{missingProperty: ${e}}`
}, Gg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Hg,
  code(e) {
    const { gen: t, schema: n, schemaCode: r, data: a, $data: i, it: s } = e, { opts: o } = s;
    if (!i && n.length === 0)
      return;
    const l = n.length >= o.loopRequired;
    if (s.allErrors ? u() : c(), o.strictRequired) {
      const h = e.parentSchema.properties, { definedProperties: g } = e.it;
      for (const m of n)
        if ((h == null ? void 0 : h[m]) === void 0 && !g.has(m)) {
          const v = s.schemaEnv.baseId + s.errSchemaPath, d = `required property "${m}" is not defined at "${v}" (strictRequired)`;
          (0, Vg.checkStrictMode)(s, d, s.opts.strictRequired);
        }
    }
    function u() {
      if (l || i)
        e.block$data(yr.nil, p);
      else
        for (const h of n)
          (0, rr.checkReportMissingProp)(e, h);
    }
    function c() {
      const h = t.let("missing");
      if (l || i) {
        const g = t.let("valid", !0);
        e.block$data(g, () => f(h, g)), e.ok(g);
      } else
        t.if((0, rr.checkMissingProp)(e, n, h)), (0, rr.reportMissingProp)(e, h), t.else();
    }
    function p() {
      t.forOf("prop", r, (h) => {
        e.setParams({ missingProperty: h }), t.if((0, rr.noPropertyInData)(t, a, h, o.ownProperties), () => e.error());
      });
    }
    function f(h, g) {
      e.setParams({ missingProperty: h }), t.forOf(h, r, () => {
        t.assign(g, (0, rr.propertyInData)(t, a, h, o.ownProperties)), t.if((0, yr.not)(g), () => {
          e.error(), t.break();
        });
      }, yr.nil);
    }
  }
};
xo.default = Gg;
var bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const gr = ee, Kg = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxItems" ? "more" : "fewer";
    return (0, gr.str)`must NOT have ${n} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, gr._)`{limit: ${e}}`
}, Xg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Kg,
  code(e) {
    const { keyword: t, data: n, schemaCode: r } = e, a = t === "maxItems" ? gr.operators.GT : gr.operators.LT;
    e.fail$data((0, gr._)`${n}.length ${a} ${r}`);
  }
};
bo.default = Xg;
var _o = {}, Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
const Ld = nd;
Ld.code = 'require("ajv/dist/runtime/equal").default';
Tr.default = Ld;
Object.defineProperty(_o, "__esModule", { value: !0 });
const Ti = Ee, Oe = ee, Wg = K, Yg = Tr, Jg = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, Qg = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Jg,
  code(e) {
    const { gen: t, data: n, $data: r, schema: a, parentSchema: i, schemaCode: s, it: o } = e;
    if (!r && !a)
      return;
    const l = t.let("valid"), u = i.items ? (0, Ti.getSchemaTypes)(i.items) : [];
    e.block$data(l, c, (0, Oe._)`${s} === false`), e.ok(l);
    function c() {
      const g = t.let("i", (0, Oe._)`${n}.length`), m = t.let("j");
      e.setParams({ i: g, j: m }), t.assign(l, !0), t.if((0, Oe._)`${g} > 1`, () => (p() ? f : h)(g, m));
    }
    function p() {
      return u.length > 0 && !u.some((g) => g === "object" || g === "array");
    }
    function f(g, m) {
      const v = t.name("item"), d = (0, Ti.checkDataTypes)(u, v, o.opts.strictNumbers, Ti.DataType.Wrong), y = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${g}--;`, () => {
        t.let(v, (0, Oe._)`${n}[${g}]`), t.if(d, (0, Oe._)`continue`), u.length > 1 && t.if((0, Oe._)`typeof ${v} == "string"`, (0, Oe._)`${v} += "_"`), t.if((0, Oe._)`typeof ${y}[${v}] == "number"`, () => {
          t.assign(m, (0, Oe._)`${y}[${v}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Oe._)`${y}[${v}] = ${g}`);
      });
    }
    function h(g, m) {
      const v = (0, Wg.useFunc)(t, Yg.default), d = t.name("outer");
      t.label(d).for((0, Oe._)`;${g}--;`, () => t.for((0, Oe._)`${m} = ${g}; ${m}--;`, () => t.if((0, Oe._)`${v}(${n}[${g}], ${n}[${m}])`, () => {
        e.error(), t.assign(l, !1).break(d);
      })));
    }
  }
};
_o.default = Qg;
var Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const bs = ee, Zg = K, ex = Tr, tx = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, bs._)`{allowedValue: ${e}}`
}, nx = {
  keyword: "const",
  $data: !0,
  error: tx,
  code(e) {
    const { gen: t, data: n, $data: r, schemaCode: a, schema: i } = e;
    r || i && typeof i == "object" ? e.fail$data((0, bs._)`!${(0, Zg.useFunc)(t, ex.default)}(${n}, ${a})`) : e.fail((0, bs._)`${i} !== ${n}`);
  }
};
Eo.default = nx;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const fr = ee, rx = K, ax = Tr, ix = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, fr._)`{allowedValues: ${e}}`
}, sx = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: ix,
  code(e) {
    const { gen: t, data: n, $data: r, schema: a, schemaCode: i, it: s } = e;
    if (!r && a.length === 0)
      throw new Error("enum must have non-empty array");
    const o = a.length >= s.opts.loopEnum;
    let l;
    const u = () => l ?? (l = (0, rx.useFunc)(t, ax.default));
    let c;
    if (o || r)
      c = t.let("valid"), e.block$data(c, p);
    else {
      if (!Array.isArray(a))
        throw new Error("ajv implementation error");
      const h = t.const("vSchema", i);
      c = (0, fr.or)(...a.map((g, m) => f(h, m)));
    }
    e.pass(c);
    function p() {
      t.assign(c, !1), t.forOf("v", i, (h) => t.if((0, fr._)`${u()}(${n}, ${h})`, () => t.assign(c, !0).break()));
    }
    function f(h, g) {
      const m = a[g];
      return typeof m == "object" && m !== null ? (0, fr._)`${u()}(${n}, ${h}[${g}])` : (0, fr._)`${n} === ${m}`;
    }
  }
};
wo.default = sx;
Object.defineProperty(Da, "__esModule", { value: !0 });
const ox = fo, cx = mo, lx = ho, ux = yo, px = go, dx = xo, fx = bo, mx = _o, hx = Eo, vx = wo, yx = [
  // number
  ox.default,
  cx.default,
  // string
  lx.default,
  ux.default,
  // object
  px.default,
  dx.default,
  // array
  fx.default,
  mx.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  hx.default,
  vx.default
];
Da.default = yx;
var Fa = {}, Bn = {};
Object.defineProperty(Bn, "__esModule", { value: !0 });
Bn.validateAdditionalItems = void 0;
const Xt = ee, _s = K, gx = {
  message: ({ params: { len: e } }) => (0, Xt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Xt._)`{limit: ${e}}`
}, xx = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: gx,
  code(e) {
    const { parentSchema: t, it: n } = e, { items: r } = t;
    if (!Array.isArray(r)) {
      (0, _s.checkStrictMode)(n, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Dd(e, r);
  }
};
function Dd(e, t) {
  const { gen: n, schema: r, data: a, keyword: i, it: s } = e;
  s.items = !0;
  const o = n.const("len", (0, Xt._)`${a}.length`);
  if (r === !1)
    e.setParams({ len: t.length }), e.pass((0, Xt._)`${o} <= ${t.length}`);
  else if (typeof r == "object" && !(0, _s.alwaysValidSchema)(s, r)) {
    const u = n.var("valid", (0, Xt._)`${o} <= ${t.length}`);
    n.if((0, Xt.not)(u), () => l(u)), e.ok(u);
  }
  function l(u) {
    n.forRange("i", t.length, o, (c) => {
      e.subschema({ keyword: i, dataProp: c, dataPropType: _s.Type.Num }, u), s.allErrors || n.if((0, Xt.not)(u), () => n.break());
    });
  }
}
Bn.validateAdditionalItems = Dd;
Bn.default = xx;
var $o = {}, Vn = {};
Object.defineProperty(Vn, "__esModule", { value: !0 });
Vn.validateTuple = void 0;
const _l = ee, pa = K, bx = ae, _x = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: n } = e;
    if (Array.isArray(t))
      return Fd(e, "additionalItems", t);
    n.items = !0, !(0, pa.alwaysValidSchema)(n, t) && e.ok((0, bx.validateArray)(e));
  }
};
function Fd(e, t, n = e.schema) {
  const { gen: r, parentSchema: a, data: i, keyword: s, it: o } = e;
  c(a), o.opts.unevaluated && n.length && o.items !== !0 && (o.items = pa.mergeEvaluated.items(r, n.length, o.items));
  const l = r.name("valid"), u = r.const("len", (0, _l._)`${i}.length`);
  n.forEach((p, f) => {
    (0, pa.alwaysValidSchema)(o, p) || (r.if((0, _l._)`${u} > ${f}`, () => e.subschema({
      keyword: s,
      schemaProp: f,
      dataProp: f
    }, l)), e.ok(l));
  });
  function c(p) {
    const { opts: f, errSchemaPath: h } = o, g = n.length, m = g === p.minItems && (g === p.maxItems || p[t] === !1);
    if (f.strictTuples && !m) {
      const v = `"${s}" is ${g}-tuple, but minItems or maxItems/${t} are not specified or different at path "${h}"`;
      (0, pa.checkStrictMode)(o, v, f.strictTuples);
    }
  }
}
Vn.validateTuple = Fd;
Vn.default = _x;
Object.defineProperty($o, "__esModule", { value: !0 });
const Ex = Vn, wx = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Ex.validateTuple)(e, "items")
};
$o.default = wx;
var So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const El = ee, $x = K, Sx = ae, Tx = Bn, Rx = {
  message: ({ params: { len: e } }) => (0, El.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, El._)`{limit: ${e}}`
}, Ox = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Rx,
  code(e) {
    const { schema: t, parentSchema: n, it: r } = e, { prefixItems: a } = n;
    r.items = !0, !(0, $x.alwaysValidSchema)(r, t) && (a ? (0, Tx.validateAdditionalItems)(e, a) : e.ok((0, Sx.validateArray)(e)));
  }
};
So.default = Ox;
var To = {};
Object.defineProperty(To, "__esModule", { value: !0 });
const Ze = ee, Hr = K, Ax = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ze.str)`must contain at least ${e} valid item(s)` : (0, Ze.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ze._)`{minContains: ${e}}` : (0, Ze._)`{minContains: ${e}, maxContains: ${t}}`
}, Px = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Ax,
  code(e) {
    const { gen: t, schema: n, parentSchema: r, data: a, it: i } = e;
    let s, o;
    const { minContains: l, maxContains: u } = r;
    i.opts.next ? (s = l === void 0 ? 1 : l, o = u) : s = 1;
    const c = t.const("len", (0, Ze._)`${a}.length`);
    if (e.setParams({ min: s, max: o }), o === void 0 && s === 0) {
      (0, Hr.checkStrictMode)(i, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && s > o) {
      (0, Hr.checkStrictMode)(i, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Hr.alwaysValidSchema)(i, n)) {
      let m = (0, Ze._)`${c} >= ${s}`;
      o !== void 0 && (m = (0, Ze._)`${m} && ${c} <= ${o}`), e.pass(m);
      return;
    }
    i.items = !0;
    const p = t.name("valid");
    o === void 0 && s === 1 ? h(p, () => t.if(p, () => t.break())) : s === 0 ? (t.let(p, !0), o !== void 0 && t.if((0, Ze._)`${a}.length > 0`, f)) : (t.let(p, !1), f()), e.result(p, () => e.reset());
    function f() {
      const m = t.name("_valid"), v = t.let("count", 0);
      h(m, () => t.if(m, () => g(v)));
    }
    function h(m, v) {
      t.forRange("i", 0, c, (d) => {
        e.subschema({
          keyword: "contains",
          dataProp: d,
          dataPropType: Hr.Type.Num,
          compositeRule: !0
        }, m), v();
      });
    }
    function g(m) {
      t.code((0, Ze._)`${m}++`), o === void 0 ? t.if((0, Ze._)`${m} >= ${s}`, () => t.assign(p, !0).break()) : (t.if((0, Ze._)`${m} > ${o}`, () => t.assign(p, !1).break()), s === 1 ? t.assign(p, !0) : t.if((0, Ze._)`${m} >= ${s}`, () => t.assign(p, !0)));
    }
  }
};
To.default = Px;
var Ua = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee, n = K, r = ae;
  e.error = {
    message: ({ params: { property: l, depsCount: u, deps: c } }) => {
      const p = u === 1 ? "property" : "properties";
      return (0, t.str)`must have ${p} ${c} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: u, deps: c, missingProperty: p } }) => (0, t._)`{property: ${l},
    missingProperty: ${p},
    depsCount: ${u},
    deps: ${c}}`
    // TODO change to reference
  };
  const a = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [u, c] = i(l);
      s(l, u), o(l, c);
    }
  };
  function i({ schema: l }) {
    const u = {}, c = {};
    for (const p in l) {
      if (p === "__proto__")
        continue;
      const f = Array.isArray(l[p]) ? u : c;
      f[p] = l[p];
    }
    return [u, c];
  }
  function s(l, u = l.schema) {
    const { gen: c, data: p, it: f } = l;
    if (Object.keys(u).length === 0)
      return;
    const h = c.let("missing");
    for (const g in u) {
      const m = u[g];
      if (m.length === 0)
        continue;
      const v = (0, r.propertyInData)(c, p, g, f.opts.ownProperties);
      l.setParams({
        property: g,
        depsCount: m.length,
        deps: m.join(", ")
      }), f.allErrors ? c.if(v, () => {
        for (const d of m)
          (0, r.checkReportMissingProp)(l, d);
      }) : (c.if((0, t._)`${v} && (${(0, r.checkMissingProp)(l, m, h)})`), (0, r.reportMissingProp)(l, h), c.else());
    }
  }
  e.validatePropertyDeps = s;
  function o(l, u = l.schema) {
    const { gen: c, data: p, keyword: f, it: h } = l, g = c.name("valid");
    for (const m in u)
      (0, n.alwaysValidSchema)(h, u[m]) || (c.if(
        (0, r.propertyInData)(c, p, m, h.opts.ownProperties),
        () => {
          const v = l.subschema({ keyword: f, schemaProp: m }, g);
          l.mergeValidEvaluated(v, g);
        },
        () => c.var(g, !0)
        // TODO var
      ), l.ok(g));
  }
  e.validateSchemaDeps = o, e.default = a;
})(Ua);
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const Ud = ee, kx = K, Nx = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Ud._)`{propertyName: ${e.propertyName}}`
}, Ix = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Nx,
  code(e) {
    const { gen: t, schema: n, data: r, it: a } = e;
    if ((0, kx.alwaysValidSchema)(a, n))
      return;
    const i = t.name("valid");
    t.forIn("key", r, (s) => {
      e.setParams({ propertyName: s }), e.subschema({
        keyword: "propertyNames",
        data: s,
        dataTypes: ["string"],
        propertyName: s,
        compositeRule: !0
      }, i), t.if((0, Ud.not)(i), () => {
        e.error(!0), a.allErrors || t.break();
      });
    }), e.ok(i);
  }
};
Ro.default = Ix;
var Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Gr = ae, it = ee, jx = We, Kr = K, Cx = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, it._)`{additionalProperty: ${e.additionalProperty}}`
}, Lx = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Cx,
  code(e) {
    const { gen: t, schema: n, parentSchema: r, data: a, errsCount: i, it: s } = e;
    if (!i)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: l } = s;
    if (s.props = !0, l.removeAdditional !== "all" && (0, Kr.alwaysValidSchema)(s, n))
      return;
    const u = (0, Gr.allSchemaProperties)(r.properties), c = (0, Gr.allSchemaProperties)(r.patternProperties);
    p(), e.ok((0, it._)`${i} === ${jx.default.errors}`);
    function p() {
      t.forIn("key", a, (v) => {
        !u.length && !c.length ? g(v) : t.if(f(v), () => g(v));
      });
    }
    function f(v) {
      let d;
      if (u.length > 8) {
        const y = (0, Kr.schemaRefOrVal)(s, r.properties, "properties");
        d = (0, Gr.isOwnProperty)(t, y, v);
      } else u.length ? d = (0, it.or)(...u.map((y) => (0, it._)`${v} === ${y}`)) : d = it.nil;
      return c.length && (d = (0, it.or)(d, ...c.map((y) => (0, it._)`${(0, Gr.usePattern)(e, y)}.test(${v})`))), (0, it.not)(d);
    }
    function h(v) {
      t.code((0, it._)`delete ${a}[${v}]`);
    }
    function g(v) {
      if (l.removeAdditional === "all" || l.removeAdditional && n === !1) {
        h(v);
        return;
      }
      if (n === !1) {
        e.setParams({ additionalProperty: v }), e.error(), o || t.break();
        return;
      }
      if (typeof n == "object" && !(0, Kr.alwaysValidSchema)(s, n)) {
        const d = t.name("valid");
        l.removeAdditional === "failing" ? (m(v, d, !1), t.if((0, it.not)(d), () => {
          e.reset(), h(v);
        })) : (m(v, d), o || t.if((0, it.not)(d), () => t.break()));
      }
    }
    function m(v, d, y) {
      const _ = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: Kr.Type.Str
      };
      y === !1 && Object.assign(_, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(_, d);
    }
  }
};
Ma.default = Lx;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const Dx = et, wl = ae, Ri = K, $l = Ma, Fx = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: n, parentSchema: r, data: a, it: i } = e;
    i.opts.removeAdditional === "all" && r.additionalProperties === void 0 && $l.default.code(new Dx.KeywordCxt(i, $l.default, "additionalProperties"));
    const s = (0, wl.allSchemaProperties)(n);
    for (const p of s)
      i.definedProperties.add(p);
    i.opts.unevaluated && s.length && i.props !== !0 && (i.props = Ri.mergeEvaluated.props(t, (0, Ri.toHash)(s), i.props));
    const o = s.filter((p) => !(0, Ri.alwaysValidSchema)(i, n[p]));
    if (o.length === 0)
      return;
    const l = t.name("valid");
    for (const p of o)
      u(p) ? c(p) : (t.if((0, wl.propertyInData)(t, a, p, i.opts.ownProperties)), c(p), i.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(p), e.ok(l);
    function u(p) {
      return i.opts.useDefaults && !i.compositeRule && n[p].default !== void 0;
    }
    function c(p) {
      e.subschema({
        keyword: "properties",
        schemaProp: p,
        dataProp: p
      }, l);
    }
  }
};
Oo.default = Fx;
var Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const Sl = ae, Xr = ee, Tl = K, Rl = K, Ux = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: n, data: r, parentSchema: a, it: i } = e, { opts: s } = i, o = (0, Sl.allSchemaProperties)(n), l = o.filter((m) => (0, Tl.alwaysValidSchema)(i, n[m]));
    if (o.length === 0 || l.length === o.length && (!i.opts.unevaluated || i.props === !0))
      return;
    const u = s.strictSchema && !s.allowMatchingProperties && a.properties, c = t.name("valid");
    i.props !== !0 && !(i.props instanceof Xr.Name) && (i.props = (0, Rl.evaluatedPropsToName)(t, i.props));
    const { props: p } = i;
    f();
    function f() {
      for (const m of o)
        u && h(m), i.allErrors ? g(m) : (t.var(c, !0), g(m), t.if(c));
    }
    function h(m) {
      for (const v in u)
        new RegExp(m).test(v) && (0, Tl.checkStrictMode)(i, `property ${v} matches pattern ${m} (use allowMatchingProperties)`);
    }
    function g(m) {
      t.forIn("key", r, (v) => {
        t.if((0, Xr._)`${(0, Sl.usePattern)(e, m)}.test(${v})`, () => {
          const d = l.includes(m);
          d || e.subschema({
            keyword: "patternProperties",
            schemaProp: m,
            dataProp: v,
            dataPropType: Rl.Type.Str
          }, c), i.opts.unevaluated && p !== !0 ? t.assign((0, Xr._)`${p}[${v}]`, !0) : !d && !i.allErrors && t.if((0, Xr.not)(c), () => t.break());
        });
      });
    }
  }
};
Ao.default = Ux;
var Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
const Mx = K, zx = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: n, it: r } = e;
    if ((0, Mx.alwaysValidSchema)(r, n)) {
      e.fail();
      return;
    }
    const a = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, a), e.failResult(a, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
Po.default = zx;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const qx = ae, Bx = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: qx.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
ko.default = Bx;
var No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const da = ee, Vx = K, Hx = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, da._)`{passingSchemas: ${e.passing}}`
}, Gx = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Hx,
  code(e) {
    const { gen: t, schema: n, parentSchema: r, it: a } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    if (a.opts.discriminator && r.discriminator)
      return;
    const i = n, s = t.let("valid", !1), o = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: o }), t.block(u), e.result(s, () => e.reset(), () => e.error(!0));
    function u() {
      i.forEach((c, p) => {
        let f;
        (0, Vx.alwaysValidSchema)(a, c) ? t.var(l, !0) : f = e.subschema({
          keyword: "oneOf",
          schemaProp: p,
          compositeRule: !0
        }, l), p > 0 && t.if((0, da._)`${l} && ${s}`).assign(s, !1).assign(o, (0, da._)`[${o}, ${p}]`).else(), t.if(l, () => {
          t.assign(s, !0), t.assign(o, p), f && e.mergeEvaluated(f, da.Name);
        });
      });
    }
  }
};
No.default = Gx;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const Kx = K, Xx = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: n, it: r } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    const a = t.name("valid");
    n.forEach((i, s) => {
      if ((0, Kx.alwaysValidSchema)(r, i))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: s }, a);
      e.ok(a), e.mergeEvaluated(o);
    });
  }
};
Io.default = Xx;
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const $a = ee, Md = K, Wx = {
  message: ({ params: e }) => (0, $a.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, $a._)`{failingKeyword: ${e.ifClause}}`
}, Yx = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Wx,
  code(e) {
    const { gen: t, parentSchema: n, it: r } = e;
    n.then === void 0 && n.else === void 0 && (0, Md.checkStrictMode)(r, '"if" without "then" and "else" is ignored');
    const a = Ol(r, "then"), i = Ol(r, "else");
    if (!a && !i)
      return;
    const s = t.let("valid", !0), o = t.name("_valid");
    if (l(), e.reset(), a && i) {
      const c = t.let("ifClause");
      e.setParams({ ifClause: c }), t.if(o, u("then", c), u("else", c));
    } else a ? t.if(o, u("then")) : t.if((0, $a.not)(o), u("else"));
    e.pass(s, () => e.error(!0));
    function l() {
      const c = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o);
      e.mergeEvaluated(c);
    }
    function u(c, p) {
      return () => {
        const f = e.subschema({ keyword: c }, o);
        t.assign(s, o), e.mergeValidEvaluated(f, s), p ? t.assign(p, (0, $a._)`${c}`) : e.setParams({ ifClause: c });
      };
    }
  }
};
function Ol(e, t) {
  const n = e.schema[t];
  return n !== void 0 && !(0, Md.alwaysValidSchema)(e, n);
}
jo.default = Yx;
var Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
const Jx = K, Qx = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: n }) {
    t.if === void 0 && (0, Jx.checkStrictMode)(n, `"${e}" without "if" is ignored`);
  }
};
Co.default = Qx;
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Zx = Bn, eb = $o, tb = Vn, nb = So, rb = To, ab = Ua, ib = Ro, sb = Ma, ob = Oo, cb = Ao, lb = Po, ub = ko, pb = No, db = Io, fb = jo, mb = Co;
function hb(e = !1) {
  const t = [
    // any
    lb.default,
    ub.default,
    pb.default,
    db.default,
    fb.default,
    mb.default,
    // object
    ib.default,
    sb.default,
    ab.default,
    ob.default,
    cb.default
  ];
  return e ? t.push(eb.default, nb.default) : t.push(Zx.default, tb.default), t.push(rb.default), t;
}
Fa.default = hb;
var Lo = {}, Hn = {};
Object.defineProperty(Hn, "__esModule", { value: !0 });
Hn.dynamicAnchor = void 0;
const Oi = ee, vb = We, Al = Ue, yb = $t, gb = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => zd(e, e.schema)
};
function zd(e, t) {
  const { gen: n, it: r } = e;
  r.schemaEnv.root.dynamicAnchors[t] = !0;
  const a = (0, Oi._)`${vb.default.dynamicAnchors}${(0, Oi.getProperty)(t)}`, i = r.errSchemaPath === "#" ? r.validateName : xb(e);
  n.if((0, Oi._)`!${a}`, () => n.assign(a, i));
}
Hn.dynamicAnchor = zd;
function xb(e) {
  const { schemaEnv: t, schema: n, self: r } = e.it, { root: a, baseId: i, localRefs: s, meta: o } = t.root, { schemaId: l } = r.opts, u = new Al.SchemaEnv({ schema: n, schemaId: l, root: a, baseId: i, localRefs: s, meta: o });
  return Al.compileSchema.call(r, u), (0, yb.getValidate)(e, u);
}
Hn.default = gb;
var Gn = {};
Object.defineProperty(Gn, "__esModule", { value: !0 });
Gn.dynamicRef = void 0;
const Pl = ee, bb = We, kl = $t, _b = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => qd(e, e.schema)
};
function qd(e, t) {
  const { gen: n, keyword: r, it: a } = e;
  if (t[0] !== "#")
    throw new Error(`"${r}" only supports hash fragment reference`);
  const i = t.slice(1);
  if (a.allErrors)
    s();
  else {
    const l = n.let("valid", !1);
    s(l), e.ok(l);
  }
  function s(l) {
    if (a.schemaEnv.root.dynamicAnchors[i]) {
      const u = n.let("_v", (0, Pl._)`${bb.default.dynamicAnchors}${(0, Pl.getProperty)(i)}`);
      n.if(u, o(u, l), o(a.validateName, l));
    } else
      o(a.validateName, l)();
  }
  function o(l, u) {
    return u ? () => n.block(() => {
      (0, kl.callRef)(e, l), n.let(u, !0);
    }) : () => (0, kl.callRef)(e, l);
  }
}
Gn.dynamicRef = qd;
Gn.default = _b;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const Eb = Hn, wb = K, $b = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Eb.dynamicAnchor)(e, "") : (0, wb.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Do.default = $b;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const Sb = Gn, Tb = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Sb.dynamicRef)(e, e.schema)
};
Fo.default = Tb;
Object.defineProperty(Lo, "__esModule", { value: !0 });
const Rb = Hn, Ob = Gn, Ab = Do, Pb = Fo, kb = [Rb.default, Ob.default, Ab.default, Pb.default];
Lo.default = kb;
var Uo = {}, Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const Nl = Ua, Nb = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Nl.error,
  code: (e) => (0, Nl.validatePropertyDeps)(e)
};
Mo.default = Nb;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const Ib = Ua, jb = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, Ib.validateSchemaDeps)(e)
};
zo.default = jb;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const Cb = K, Lb = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: n }) {
    t.contains === void 0 && (0, Cb.checkStrictMode)(n, `"${e}" without "contains" is ignored`);
  }
};
qo.default = Lb;
Object.defineProperty(Uo, "__esModule", { value: !0 });
const Db = Mo, Fb = zo, Ub = qo, Mb = [Db.default, Fb.default, Ub.default];
Uo.default = Mb;
var Bo = {}, Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const kt = ee, Il = K, zb = We, qb = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, kt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Bb = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: qb,
  code(e) {
    const { gen: t, schema: n, data: r, errsCount: a, it: i } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: s, props: o } = i;
    o instanceof kt.Name ? t.if((0, kt._)`${o} !== true`, () => t.forIn("key", r, (p) => t.if(u(o, p), () => l(p)))) : o !== !0 && t.forIn("key", r, (p) => o === void 0 ? l(p) : t.if(c(o, p), () => l(p))), i.props = !0, e.ok((0, kt._)`${a} === ${zb.default.errors}`);
    function l(p) {
      if (n === !1) {
        e.setParams({ unevaluatedProperty: p }), e.error(), s || t.break();
        return;
      }
      if (!(0, Il.alwaysValidSchema)(i, n)) {
        const f = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: p,
          dataPropType: Il.Type.Str
        }, f), s || t.if((0, kt.not)(f), () => t.break());
      }
    }
    function u(p, f) {
      return (0, kt._)`!${p} || !${p}[${f}]`;
    }
    function c(p, f) {
      const h = [];
      for (const g in p)
        p[g] === !0 && h.push((0, kt._)`${f} !== ${g}`);
      return (0, kt.and)(...h);
    }
  }
};
Vo.default = Bb;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const Wt = ee, jl = K, Vb = {
  message: ({ params: { len: e } }) => (0, Wt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Wt._)`{limit: ${e}}`
}, Hb = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Vb,
  code(e) {
    const { gen: t, schema: n, data: r, it: a } = e, i = a.items || 0;
    if (i === !0)
      return;
    const s = t.const("len", (0, Wt._)`${r}.length`);
    if (n === !1)
      e.setParams({ len: i }), e.fail((0, Wt._)`${s} > ${i}`);
    else if (typeof n == "object" && !(0, jl.alwaysValidSchema)(a, n)) {
      const l = t.var("valid", (0, Wt._)`${s} <= ${i}`);
      t.if((0, Wt.not)(l), () => o(l, i)), e.ok(l);
    }
    a.items = !0;
    function o(l, u) {
      t.forRange("i", u, s, (c) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: c, dataPropType: jl.Type.Num }, l), a.allErrors || t.if((0, Wt.not)(l), () => t.break());
      });
    }
  }
};
Ho.default = Hb;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const Gb = Vo, Kb = Ho, Xb = [Gb.default, Kb.default];
Bo.default = Xb;
var za = {}, Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const be = ee, Wb = {
  message: ({ schemaCode: e }) => (0, be.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, be._)`{format: ${e}}`
}, Yb = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Wb,
  code(e, t) {
    const { gen: n, data: r, $data: a, schema: i, schemaCode: s, it: o } = e, { opts: l, errSchemaPath: u, schemaEnv: c, self: p } = o;
    if (!l.validateFormats)
      return;
    a ? f() : h();
    function f() {
      const g = n.scopeValue("formats", {
        ref: p.formats,
        code: l.code.formats
      }), m = n.const("fDef", (0, be._)`${g}[${s}]`), v = n.let("fType"), d = n.let("format");
      n.if((0, be._)`typeof ${m} == "object" && !(${m} instanceof RegExp)`, () => n.assign(v, (0, be._)`${m}.type || "string"`).assign(d, (0, be._)`${m}.validate`), () => n.assign(v, (0, be._)`"string"`).assign(d, m)), e.fail$data((0, be.or)(y(), _()));
      function y() {
        return l.strictSchema === !1 ? be.nil : (0, be._)`${s} && !${d}`;
      }
      function _() {
        const x = c.$async ? (0, be._)`(${m}.async ? await ${d}(${r}) : ${d}(${r}))` : (0, be._)`${d}(${r})`, E = (0, be._)`(typeof ${d} == "function" ? ${x} : ${d}.test(${r}))`;
        return (0, be._)`${d} && ${d} !== true && ${v} === ${t} && !${E}`;
      }
    }
    function h() {
      const g = p.formats[i];
      if (!g) {
        y();
        return;
      }
      if (g === !0)
        return;
      const [m, v, d] = _(g);
      m === t && e.pass(x());
      function y() {
        if (l.strictSchema === !1) {
          p.logger.warn(E());
          return;
        }
        throw new Error(E());
        function E() {
          return `unknown format "${i}" ignored in schema at path "${u}"`;
        }
      }
      function _(E) {
        const I = E instanceof RegExp ? (0, be.regexpCode)(E) : l.code.formats ? (0, be._)`${l.code.formats}${(0, be.getProperty)(i)}` : void 0, C = n.scopeValue("formats", { key: i, ref: E, code: I });
        return typeof E == "object" && !(E instanceof RegExp) ? [E.type || "string", E.validate, (0, be._)`${C}.validate`] : ["string", E, C];
      }
      function x() {
        if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
          if (!c.$async)
            throw new Error("async format in sync schema");
          return (0, be._)`await ${d}(${r})`;
        }
        return typeof v == "function" ? (0, be._)`${d}(${r})` : (0, be._)`${d}.test(${r})`;
      }
    }
  }
};
Go.default = Yb;
Object.defineProperty(za, "__esModule", { value: !0 });
const Jb = Go, Qb = [Jb.default];
za.default = Qb;
var cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
cn.contentVocabulary = cn.metadataVocabulary = void 0;
cn.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
cn.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(uo, "__esModule", { value: !0 });
const Zb = La, e0 = Da, t0 = Fa, n0 = Lo, r0 = Uo, a0 = Bo, i0 = za, Cl = cn, s0 = [
  n0.default,
  Zb.default,
  e0.default,
  (0, t0.default)(!0),
  i0.default,
  Cl.metadataVocabulary,
  Cl.contentVocabulary,
  r0.default,
  a0.default
];
uo.default = s0;
var qa = {}, Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
Ba.DiscrError = void 0;
var Ll;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Ll || (Ba.DiscrError = Ll = {}));
Object.defineProperty(qa, "__esModule", { value: !0 });
const wn = ee, Es = Ba, Dl = Ue, o0 = fn, c0 = K, l0 = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Es.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: n } }) => (0, wn._)`{error: ${e}, tag: ${n}, tagValue: ${t}}`
}, u0 = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: l0,
  code(e) {
    const { gen: t, data: n, schema: r, parentSchema: a, it: i } = e, { oneOf: s } = a;
    if (!i.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = r.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (r.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!s)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), u = t.const("tag", (0, wn._)`${n}${(0, wn.getProperty)(o)}`);
    t.if((0, wn._)`typeof ${u} == "string"`, () => c(), () => e.error(!1, { discrError: Es.DiscrError.Tag, tag: u, tagName: o })), e.ok(l);
    function c() {
      const h = f();
      t.if(!1);
      for (const g in h)
        t.elseIf((0, wn._)`${u} === ${g}`), t.assign(l, p(h[g]));
      t.else(), e.error(!1, { discrError: Es.DiscrError.Mapping, tag: u, tagName: o }), t.endIf();
    }
    function p(h) {
      const g = t.name("valid"), m = e.subschema({ keyword: "oneOf", schemaProp: h }, g);
      return e.mergeEvaluated(m, wn.Name), g;
    }
    function f() {
      var h;
      const g = {}, m = d(a);
      let v = !0;
      for (let x = 0; x < s.length; x++) {
        let E = s[x];
        if (E != null && E.$ref && !(0, c0.schemaHasRulesButRef)(E, i.self.RULES)) {
          const C = E.$ref;
          if (E = Dl.resolveRef.call(i.self, i.schemaEnv.root, i.baseId, C), E instanceof Dl.SchemaEnv && (E = E.schema), E === void 0)
            throw new o0.default(i.opts.uriResolver, i.baseId, C);
        }
        const I = (h = E == null ? void 0 : E.properties) === null || h === void 0 ? void 0 : h[o];
        if (typeof I != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        v = v && (m || d(E)), y(I, x);
      }
      if (!v)
        throw new Error(`discriminator: "${o}" must be required`);
      return g;
      function d({ required: x }) {
        return Array.isArray(x) && x.includes(o);
      }
      function y(x, E) {
        if (x.const)
          _(x.const, E);
        else if (x.enum)
          for (const I of x.enum)
            _(I, E);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function _(x, E) {
        if (typeof x != "string" || x in g)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        g[x] = E;
      }
    }
  }
};
qa.default = u0;
var Ko = {};
const p0 = "https://json-schema.org/draft/2020-12/schema", d0 = "https://json-schema.org/draft/2020-12/schema", f0 = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, m0 = "meta", h0 = "Core and Validation specifications meta-schema", v0 = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], y0 = [
  "object",
  "boolean"
], g0 = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", x0 = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, b0 = {
  $schema: p0,
  $id: d0,
  $vocabulary: f0,
  $dynamicAnchor: m0,
  title: h0,
  allOf: v0,
  type: y0,
  $comment: g0,
  properties: x0
}, _0 = "https://json-schema.org/draft/2020-12/schema", E0 = "https://json-schema.org/draft/2020-12/meta/applicator", w0 = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, $0 = "meta", S0 = "Applicator vocabulary meta-schema", T0 = [
  "object",
  "boolean"
], R0 = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, O0 = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, A0 = {
  $schema: _0,
  $id: E0,
  $vocabulary: w0,
  $dynamicAnchor: $0,
  title: S0,
  type: T0,
  properties: R0,
  $defs: O0
}, P0 = "https://json-schema.org/draft/2020-12/schema", k0 = "https://json-schema.org/draft/2020-12/meta/unevaluated", N0 = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, I0 = "meta", j0 = "Unevaluated applicator vocabulary meta-schema", C0 = [
  "object",
  "boolean"
], L0 = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, D0 = {
  $schema: P0,
  $id: k0,
  $vocabulary: N0,
  $dynamicAnchor: I0,
  title: j0,
  type: C0,
  properties: L0
}, F0 = "https://json-schema.org/draft/2020-12/schema", U0 = "https://json-schema.org/draft/2020-12/meta/content", M0 = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, z0 = "meta", q0 = "Content vocabulary meta-schema", B0 = [
  "object",
  "boolean"
], V0 = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, H0 = {
  $schema: F0,
  $id: U0,
  $vocabulary: M0,
  $dynamicAnchor: z0,
  title: q0,
  type: B0,
  properties: V0
}, G0 = "https://json-schema.org/draft/2020-12/schema", K0 = "https://json-schema.org/draft/2020-12/meta/core", X0 = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, W0 = "meta", Y0 = "Core vocabulary meta-schema", J0 = [
  "object",
  "boolean"
], Q0 = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, Z0 = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, e_ = {
  $schema: G0,
  $id: K0,
  $vocabulary: X0,
  $dynamicAnchor: W0,
  title: Y0,
  type: J0,
  properties: Q0,
  $defs: Z0
}, t_ = "https://json-schema.org/draft/2020-12/schema", n_ = "https://json-schema.org/draft/2020-12/meta/format-annotation", r_ = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, a_ = "meta", i_ = "Format vocabulary meta-schema for annotation results", s_ = [
  "object",
  "boolean"
], o_ = {
  format: {
    type: "string"
  }
}, c_ = {
  $schema: t_,
  $id: n_,
  $vocabulary: r_,
  $dynamicAnchor: a_,
  title: i_,
  type: s_,
  properties: o_
}, l_ = "https://json-schema.org/draft/2020-12/schema", u_ = "https://json-schema.org/draft/2020-12/meta/meta-data", p_ = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, d_ = "meta", f_ = "Meta-data vocabulary meta-schema", m_ = [
  "object",
  "boolean"
], h_ = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, v_ = {
  $schema: l_,
  $id: u_,
  $vocabulary: p_,
  $dynamicAnchor: d_,
  title: f_,
  type: m_,
  properties: h_
}, y_ = "https://json-schema.org/draft/2020-12/schema", g_ = "https://json-schema.org/draft/2020-12/meta/validation", x_ = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, b_ = "meta", __ = "Validation vocabulary meta-schema", E_ = [
  "object",
  "boolean"
], w_ = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, $_ = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, S_ = {
  $schema: y_,
  $id: g_,
  $vocabulary: x_,
  $dynamicAnchor: b_,
  title: __,
  type: E_,
  properties: w_,
  $defs: $_
};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const T_ = b0, R_ = A0, O_ = D0, A_ = H0, P_ = e_, k_ = c_, N_ = v_, I_ = S_, j_ = ["/properties"];
function C_(e) {
  return [
    T_,
    R_,
    O_,
    A_,
    P_,
    t(this, k_),
    N_,
    t(this, I_)
  ].forEach((n) => this.addMetaSchema(n, void 0, !1)), this;
  function t(n, r) {
    return e ? n.$dataMetaSchema(r, j_) : r;
  }
}
Ko.default = C_;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const n = Ws, r = uo, a = qa, i = Ko, s = "https://json-schema.org/draft/2020-12/schema";
  class o extends n.default {
    constructor(h = {}) {
      super({
        ...h,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), r.default.forEach((h) => this.addVocabulary(h)), this.opts.discriminator && this.addKeyword(a.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: h, meta: g } = this.opts;
      g && (i.default.call(this, h), this.refs["http://json-schema.org/schema"] = s);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(s) ? s : void 0);
    }
  }
  t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  var l = et;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var u = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var c = qn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return c.default;
  } });
  var p = fn;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return p.default;
  } });
})(hs, hs.exports);
var L_ = hs.exports, ws = { exports: {} }, Bd = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(O, k) {
    return { validate: O, compare: k };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(i, s),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), u),
    "date-time": t(f(!0), h),
    "iso-time": t(l(), c),
    "iso-date-time": t(f(), g),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: d,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: R,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: _,
    // signed 32 bit integer
    int32: { type: "number", validate: I },
    // signed 64 bit integer
    int64: { type: "number", validate: C },
    // C-type float
    float: { type: "number", validate: D },
    // C-type double
    double: { type: "number", validate: D },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, s),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, u),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, h),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, g),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function n(O) {
    return O % 4 === 0 && (O % 100 !== 0 || O % 400 === 0);
  }
  const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function i(O) {
    const k = r.exec(O);
    if (!k)
      return !1;
    const V = +k[1], P = +k[2], F = +k[3];
    return P >= 1 && P <= 12 && F >= 1 && F <= (P === 2 && n(V) ? 29 : a[P]);
  }
  function s(O, k) {
    if (O && k)
      return O > k ? 1 : O < k ? -1 : 0;
  }
  const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(O) {
    return function(V) {
      const P = o.exec(V);
      if (!P)
        return !1;
      const F = +P[1], H = +P[2], j = +P[3], U = P[4], B = P[5] === "-" ? -1 : 1, L = +(P[6] || 0), $ = +(P[7] || 0);
      if (L > 23 || $ > 59 || O && !U)
        return !1;
      if (F <= 23 && H <= 59 && j < 60)
        return !0;
      const N = H - $ * B, T = F - L * B - (N < 0 ? 1 : 0);
      return (T === 23 || T === -1) && (N === 59 || N === -1) && j < 61;
    };
  }
  function u(O, k) {
    if (!(O && k))
      return;
    const V = (/* @__PURE__ */ new Date("2020-01-01T" + O)).valueOf(), P = (/* @__PURE__ */ new Date("2020-01-01T" + k)).valueOf();
    if (V && P)
      return V - P;
  }
  function c(O, k) {
    if (!(O && k))
      return;
    const V = o.exec(O), P = o.exec(k);
    if (V && P)
      return O = V[1] + V[2] + V[3], k = P[1] + P[2] + P[3], O > k ? 1 : O < k ? -1 : 0;
  }
  const p = /t|\s/i;
  function f(O) {
    const k = l(O);
    return function(P) {
      const F = P.split(p);
      return F.length === 2 && i(F[0]) && k(F[1]);
    };
  }
  function h(O, k) {
    if (!(O && k))
      return;
    const V = new Date(O).valueOf(), P = new Date(k).valueOf();
    if (V && P)
      return V - P;
  }
  function g(O, k) {
    if (!(O && k))
      return;
    const [V, P] = O.split(p), [F, H] = k.split(p), j = s(V, F);
    if (j !== void 0)
      return j || u(P, H);
  }
  const m = /\/|:/, v = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function d(O) {
    return m.test(O) && v.test(O);
  }
  const y = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function _(O) {
    return y.lastIndex = 0, y.test(O);
  }
  const x = -2147483648, E = 2 ** 31 - 1;
  function I(O) {
    return Number.isInteger(O) && O <= E && O >= x;
  }
  function C(O) {
    return Number.isInteger(O);
  }
  function D() {
    return !0;
  }
  const S = /[^\\]\\Z/;
  function R(O) {
    if (S.test(O))
      return !1;
    try {
      return new RegExp(O), !0;
    } catch {
      return !1;
    }
  }
})(Bd);
var Vd = {}, $s = { exports: {} }, Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const D_ = La, F_ = Da, U_ = Fa, M_ = za, Fl = cn, z_ = [
  D_.default,
  F_.default,
  (0, U_.default)(),
  M_.default,
  Fl.metadataVocabulary,
  Fl.contentVocabulary
];
Xo.default = z_;
const q_ = "http://json-schema.org/draft-07/schema#", B_ = "http://json-schema.org/draft-07/schema#", V_ = "Core schema meta-schema", H_ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, G_ = [
  "object",
  "boolean"
], K_ = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, X_ = {
  $schema: q_,
  $id: B_,
  title: V_,
  definitions: H_,
  type: G_,
  properties: K_,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const n = Ws, r = Xo, a = qa, i = X_, s = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class l extends n.default {
    _addVocabularies() {
      super._addVocabularies(), r.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(a.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const g = this.opts.$data ? this.$dataMetaSchema(i, s) : i;
      this.addMetaSchema(g, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var u = et;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return u.KeywordCxt;
  } });
  var c = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return c._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return c.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return c.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return c.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return c.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return c.CodeGen;
  } });
  var p = qn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return p.default;
  } });
  var f = fn;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return f.default;
  } });
})($s, $s.exports);
var W_ = $s.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = W_, n = ee, r = n.operators, a = {
    formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
    formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
    formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
  }, i = {
    message: ({ keyword: o, schemaCode: l }) => (0, n.str)`should be ${a[o].okStr} ${l}`,
    params: ({ keyword: o, schemaCode: l }) => (0, n._)`{comparison: ${a[o].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(a),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: i,
    code(o) {
      const { gen: l, data: u, schemaCode: c, keyword: p, it: f } = o, { opts: h, self: g } = f;
      if (!h.validateFormats)
        return;
      const m = new t.KeywordCxt(f, g.RULES.all.format.definition, "format");
      m.$data ? v() : d();
      function v() {
        const _ = l.scopeValue("formats", {
          ref: g.formats,
          code: h.code.formats
        }), x = l.const("fmt", (0, n._)`${_}[${m.schemaCode}]`);
        o.fail$data((0, n.or)((0, n._)`typeof ${x} != "object"`, (0, n._)`${x} instanceof RegExp`, (0, n._)`typeof ${x}.compare != "function"`, y(x)));
      }
      function d() {
        const _ = m.schema, x = g.formats[_];
        if (!x || x === !0)
          return;
        if (typeof x != "object" || x instanceof RegExp || typeof x.compare != "function")
          throw new Error(`"${p}": format "${_}" does not define "compare" function`);
        const E = l.scopeValue("formats", {
          key: _,
          ref: x,
          code: h.code.formats ? (0, n._)`${h.code.formats}${(0, n.getProperty)(_)}` : void 0
        });
        o.fail$data(y(E));
      }
      function y(_) {
        return (0, n._)`${_}.compare(${u}, ${c}) ${a[p].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const s = (o) => (o.addKeyword(e.formatLimitDefinition), o);
  e.default = s;
})(Vd);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = Bd, r = Vd, a = ee, i = new a.Name("fullFormats"), s = new a.Name("fastFormats"), o = (u, c = { keywords: !0 }) => {
    if (Array.isArray(c))
      return l(u, c, n.fullFormats, i), u;
    const [p, f] = c.mode === "fast" ? [n.fastFormats, s] : [n.fullFormats, i], h = c.formats || n.formatNames;
    return l(u, h, p, f), c.keywords && (0, r.default)(u), u;
  };
  o.get = (u, c = "full") => {
    const f = (c === "fast" ? n.fastFormats : n.fullFormats)[u];
    if (!f)
      throw new Error(`Unknown format "${u}"`);
    return f;
  };
  function l(u, c, p, f) {
    var h, g;
    (h = (g = u.opts.code).formats) !== null && h !== void 0 || (g.formats = (0, a._)`require("ajv-formats/dist/formats").${f}`);
    for (const m of c)
      u.addFormat(m, p[m]);
  }
  e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
})(ws, ws.exports);
var Y_ = ws.exports;
const J_ = /* @__PURE__ */ zn(Y_), Q_ = (e, t, n, r) => {
  if (n === "length" || n === "prototype" || n === "arguments" || n === "caller")
    return;
  const a = Object.getOwnPropertyDescriptor(e, n), i = Object.getOwnPropertyDescriptor(t, n);
  !Z_(a, i) && r || Object.defineProperty(e, n, i);
}, Z_ = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, eE = (e, t) => {
  const n = Object.getPrototypeOf(t);
  n !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, n);
}, tE = (e, t) => `/* Wrapped ${e}*/
${t}`, nE = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), rE = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), aE = (e, t, n) => {
  const r = n === "" ? "" : `with ${n.trim()}() `, a = tE.bind(null, r, t.toString());
  Object.defineProperty(a, "name", rE);
  const { writable: i, enumerable: s, configurable: o } = nE;
  Object.defineProperty(e, "toString", { value: a, writable: i, enumerable: s, configurable: o });
};
function iE(e, t, { ignoreNonConfigurable: n = !1 } = {}) {
  const { name: r } = e;
  for (const a of Reflect.ownKeys(t))
    Q_(e, t, a, n);
  return eE(e, t), aE(e, t, r), e;
}
const Ul = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: n = 0,
    maxWait: r = Number.POSITIVE_INFINITY,
    before: a = !1,
    after: i = !0
  } = t;
  if (n < 0 || r < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!a && !i)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let s, o, l;
  const u = function(...c) {
    const p = this, f = () => {
      s = void 0, o && (clearTimeout(o), o = void 0), i && (l = e.apply(p, c));
    }, h = () => {
      o = void 0, s && (clearTimeout(s), s = void 0), i && (l = e.apply(p, c));
    }, g = a && !s;
    return clearTimeout(s), s = setTimeout(f, n), r > 0 && r !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(h, r)), g && (l = e.apply(p, c)), l;
  };
  return iE(u, e), u.cancel = () => {
    s && (clearTimeout(s), s = void 0), o && (clearTimeout(o), o = void 0);
  }, u;
};
var Ss = { exports: {} };
const sE = "2.0.0", Hd = 256, oE = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, cE = 16, lE = Hd - 6, uE = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Rr = {
  MAX_LENGTH: Hd,
  MAX_SAFE_COMPONENT_LENGTH: cE,
  MAX_SAFE_BUILD_LENGTH: lE,
  MAX_SAFE_INTEGER: oE,
  RELEASE_TYPES: uE,
  SEMVER_SPEC_VERSION: sE,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const pE = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var Va = pE;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: r,
    MAX_LENGTH: a
  } = Rr, i = Va;
  t = e.exports = {};
  const s = t.re = [], o = t.safeRe = [], l = t.src = [], u = t.safeSrc = [], c = t.t = {};
  let p = 0;
  const f = "[a-zA-Z0-9-]", h = [
    ["\\s", 1],
    ["\\d", a],
    [f, r]
  ], g = (v) => {
    for (const [d, y] of h)
      v = v.split(`${d}*`).join(`${d}{0,${y}}`).split(`${d}+`).join(`${d}{1,${y}}`);
    return v;
  }, m = (v, d, y) => {
    const _ = g(d), x = p++;
    i(v, x, d), c[v] = x, l[x] = d, u[x] = _, s[x] = new RegExp(d, y ? "g" : void 0), o[x] = new RegExp(_, y ? "g" : void 0);
  };
  m("NUMERICIDENTIFIER", "0|[1-9]\\d*"), m("NUMERICIDENTIFIERLOOSE", "\\d+"), m("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${f}*`), m("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), m("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), m("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), m("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), m("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), m("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), m("BUILDIDENTIFIER", `${f}+`), m("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), m("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), m("FULL", `^${l[c.FULLPLAIN]}$`), m("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), m("LOOSE", `^${l[c.LOOSEPLAIN]}$`), m("GTLT", "((?:<|>)?=?)"), m("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), m("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), m("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), m("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), m("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), m("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), m("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), m("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), m("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), m("COERCERTL", l[c.COERCE], !0), m("COERCERTLFULL", l[c.COERCEFULL], !0), m("LONETILDE", "(?:~>?)"), m("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", m("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), m("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), m("LONECARET", "(?:\\^)"), m("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", m("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), m("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), m("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), m("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), m("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", m("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), m("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), m("STAR", "(<|>)?=?\\s*\\*"), m("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), m("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Ss, Ss.exports);
var Or = Ss.exports;
const dE = Object.freeze({ loose: !0 }), fE = Object.freeze({}), mE = (e) => e ? typeof e != "object" ? dE : e : fE;
var Wo = mE;
const Ml = /^[0-9]+$/, Gd = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const n = Ml.test(e), r = Ml.test(t);
  return n && r && (e = +e, t = +t), e === t ? 0 : n && !r ? -1 : r && !n ? 1 : e < t ? -1 : 1;
}, hE = (e, t) => Gd(t, e);
var Kd = {
  compareIdentifiers: Gd,
  rcompareIdentifiers: hE
};
const Wr = Va, { MAX_LENGTH: zl, MAX_SAFE_INTEGER: Yr } = Rr, { safeRe: Jr, t: Qr } = Or, vE = Wo, { compareIdentifiers: Ai } = Kd;
let yE = class pt {
  constructor(t, n) {
    if (n = vE(n), t instanceof pt) {
      if (t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > zl)
      throw new TypeError(
        `version is longer than ${zl} characters`
      );
    Wr("SemVer", t, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const r = t.trim().match(n.loose ? Jr[Qr.LOOSE] : Jr[Qr.FULL]);
    if (!r)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +r[1], this.minor = +r[2], this.patch = +r[3], this.major > Yr || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Yr || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Yr || this.patch < 0)
      throw new TypeError("Invalid patch version");
    r[4] ? this.prerelease = r[4].split(".").map((a) => {
      if (/^[0-9]+$/.test(a)) {
        const i = +a;
        if (i >= 0 && i < Yr)
          return i;
      }
      return a;
    }) : this.prerelease = [], this.build = r[5] ? r[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (Wr("SemVer.compare", this.version, this.options, t), !(t instanceof pt)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new pt(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof pt || (t = new pt(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof pt || (t = new pt(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let n = 0;
    do {
      const r = this.prerelease[n], a = t.prerelease[n];
      if (Wr("prerelease compare", n, r, a), r === void 0 && a === void 0)
        return 0;
      if (a === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === a)
        continue;
      return Ai(r, a);
    } while (++n);
  }
  compareBuild(t) {
    t instanceof pt || (t = new pt(t, this.options));
    let n = 0;
    do {
      const r = this.build[n], a = t.build[n];
      if (Wr("build compare", n, r, a), r === void 0 && a === void 0)
        return 0;
      if (a === void 0)
        return 1;
      if (r === void 0)
        return -1;
      if (r === a)
        continue;
      return Ai(r, a);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, n, r) {
    if (t.startsWith("pre")) {
      if (!n && r === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (n) {
        const a = `-${n}`.match(this.options.loose ? Jr[Qr.PRERELEASELOOSE] : Jr[Qr.PRERELEASE]);
        if (!a || a[1] !== n)
          throw new Error(`invalid identifier: ${n}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, r);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, r);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", n, r), this.inc("pre", n, r);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const a = Number(r) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [a];
        else {
          let i = this.prerelease.length;
          for (; --i >= 0; )
            typeof this.prerelease[i] == "number" && (this.prerelease[i]++, i = -2);
          if (i === -1) {
            if (n === this.prerelease.join(".") && r === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(a);
          }
        }
        if (n) {
          let i = [n, a];
          r === !1 && (i = [n]), Ai(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = i) : this.prerelease = i;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Le = yE;
const ql = Le, gE = (e, t, n = !1) => {
  if (e instanceof ql)
    return e;
  try {
    return new ql(e, t);
  } catch (r) {
    if (!n)
      return null;
    throw r;
  }
};
var mn = gE;
const xE = mn, bE = (e, t) => {
  const n = xE(e, t);
  return n ? n.version : null;
};
var _E = bE;
const EE = mn, wE = (e, t) => {
  const n = EE(e.trim().replace(/^[=v]+/, ""), t);
  return n ? n.version : null;
};
var $E = wE;
const Bl = Le, SE = (e, t, n, r, a) => {
  typeof n == "string" && (a = r, r = n, n = void 0);
  try {
    return new Bl(
      e instanceof Bl ? e.version : e,
      n
    ).inc(t, r, a).version;
  } catch {
    return null;
  }
};
var TE = SE;
const Vl = mn, RE = (e, t) => {
  const n = Vl(e, null, !0), r = Vl(t, null, !0), a = n.compare(r);
  if (a === 0)
    return null;
  const i = a > 0, s = i ? n : r, o = i ? r : n, l = !!s.prerelease.length;
  if (!!o.prerelease.length && !l) {
    if (!o.patch && !o.minor)
      return "major";
    if (o.compareMain(s) === 0)
      return o.minor && !o.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return n.major !== r.major ? c + "major" : n.minor !== r.minor ? c + "minor" : n.patch !== r.patch ? c + "patch" : "prerelease";
};
var OE = RE;
const AE = Le, PE = (e, t) => new AE(e, t).major;
var kE = PE;
const NE = Le, IE = (e, t) => new NE(e, t).minor;
var jE = IE;
const CE = Le, LE = (e, t) => new CE(e, t).patch;
var DE = LE;
const FE = mn, UE = (e, t) => {
  const n = FE(e, t);
  return n && n.prerelease.length ? n.prerelease : null;
};
var ME = UE;
const Hl = Le, zE = (e, t, n) => new Hl(e, n).compare(new Hl(t, n));
var ot = zE;
const qE = ot, BE = (e, t, n) => qE(t, e, n);
var VE = BE;
const HE = ot, GE = (e, t) => HE(e, t, !0);
var KE = GE;
const Gl = Le, XE = (e, t, n) => {
  const r = new Gl(e, n), a = new Gl(t, n);
  return r.compare(a) || r.compareBuild(a);
};
var Yo = XE;
const WE = Yo, YE = (e, t) => e.sort((n, r) => WE(n, r, t));
var JE = YE;
const QE = Yo, ZE = (e, t) => e.sort((n, r) => QE(r, n, t));
var ew = ZE;
const tw = ot, nw = (e, t, n) => tw(e, t, n) > 0;
var Ha = nw;
const rw = ot, aw = (e, t, n) => rw(e, t, n) < 0;
var Jo = aw;
const iw = ot, sw = (e, t, n) => iw(e, t, n) === 0;
var Xd = sw;
const ow = ot, cw = (e, t, n) => ow(e, t, n) !== 0;
var Wd = cw;
const lw = ot, uw = (e, t, n) => lw(e, t, n) >= 0;
var Qo = uw;
const pw = ot, dw = (e, t, n) => pw(e, t, n) <= 0;
var Zo = dw;
const fw = Xd, mw = Wd, hw = Ha, vw = Qo, yw = Jo, gw = Zo, xw = (e, t, n, r) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
    case "":
    case "=":
    case "==":
      return fw(e, n, r);
    case "!=":
      return mw(e, n, r);
    case ">":
      return hw(e, n, r);
    case ">=":
      return vw(e, n, r);
    case "<":
      return yw(e, n, r);
    case "<=":
      return gw(e, n, r);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Yd = xw;
const bw = Le, _w = mn, { safeRe: Zr, t: ea } = Or, Ew = (e, t) => {
  if (e instanceof bw)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let n = null;
  if (!t.rtl)
    n = e.match(t.includePrerelease ? Zr[ea.COERCEFULL] : Zr[ea.COERCE]);
  else {
    const l = t.includePrerelease ? Zr[ea.COERCERTLFULL] : Zr[ea.COERCERTL];
    let u;
    for (; (u = l.exec(e)) && (!n || n.index + n[0].length !== e.length); )
      (!n || u.index + u[0].length !== n.index + n[0].length) && (n = u), l.lastIndex = u.index + u[1].length + u[2].length;
    l.lastIndex = -1;
  }
  if (n === null)
    return null;
  const r = n[2], a = n[3] || "0", i = n[4] || "0", s = t.includePrerelease && n[5] ? `-${n[5]}` : "", o = t.includePrerelease && n[6] ? `+${n[6]}` : "";
  return _w(`${r}.${a}.${i}${s}${o}`, t);
};
var ww = Ew;
const $w = mn, Sw = Rr, Tw = Le, Rw = (e, t, n) => {
  if (!Sw.RELEASE_TYPES.includes(t))
    return null;
  const r = Ow(e, n);
  return r && Aw(r, t);
}, Ow = (e, t) => {
  const n = e instanceof Tw ? e.version : e;
  return $w(n, t);
}, Aw = (e, t) => {
  if (Pw(t))
    return e.version;
  switch (e.prerelease = [], t) {
    case "major":
      e.minor = 0, e.patch = 0;
      break;
    case "minor":
      e.patch = 0;
      break;
  }
  return e.format();
}, Pw = (e) => e.startsWith("pre");
var kw = Rw;
class Nw {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const n = this.map.get(t);
    if (n !== void 0)
      return this.map.delete(t), this.map.set(t, n), n;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, n) {
    if (!this.delete(t) && n !== void 0) {
      if (this.map.size >= this.max) {
        const a = this.map.keys().next().value;
        this.delete(a);
      }
      this.map.set(t, n);
    }
    return this;
  }
}
var Iw = Nw, Pi, Kl;
function ct() {
  if (Kl) return Pi;
  Kl = 1;
  const e = /\s+/g;
  class t {
    constructor(F, H) {
      if (H = a(H), F instanceof t)
        return F.loose === !!H.loose && F.includePrerelease === !!H.includePrerelease ? F : new t(F.raw, H);
      if (F instanceof i)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = H, this.loose = !!H.loose, this.includePrerelease = !!H.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((j) => this.parseRange(j.trim())).filter((j) => j.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const j = this.set[0];
        if (this.set = this.set.filter((U) => !m(U[0])), this.set.length === 0)
          this.set = [j];
        else if (this.set.length > 1) {
          for (const U of this.set)
            if (U.length === 1 && v(U[0])) {
              this.set = [U];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let F = 0; F < this.set.length; F++) {
          F > 0 && (this.formatted += "||");
          const H = this.set[F];
          for (let j = 0; j < H.length; j++)
            j > 0 && (this.formatted += " "), this.formatted += H[j].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(F) {
      const j = ((this.options.includePrerelease && h) | (this.options.loose && g)) + ":" + F, U = r.get(j);
      if (U)
        return U;
      const B = this.options.loose, L = B ? l[u.HYPHENRANGELOOSE] : l[u.HYPHENRANGE];
      F = F.replace(L, k(this.options.includePrerelease)), s("hyphen replace", F), F = F.replace(l[u.COMPARATORTRIM], c), s("comparator trim", F), F = F.replace(l[u.TILDETRIM], p), s("tilde trim", F), F = F.replace(l[u.CARETTRIM], f), s("caret trim", F);
      let $ = F.split(" ").map((w) => y(w, this.options)).join(" ").split(/\s+/).map((w) => O(w, this.options));
      B && ($ = $.filter((w) => (s("loose invalid filter", w, this.options), !!w.match(l[u.COMPARATORLOOSE])))), s("range list", $);
      const N = /* @__PURE__ */ new Map(), T = $.map((w) => new i(w, this.options));
      for (const w of T) {
        if (m(w))
          return [w];
        N.set(w.value, w);
      }
      N.size > 1 && N.has("") && N.delete("");
      const b = [...N.values()];
      return r.set(j, b), b;
    }
    intersects(F, H) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((j) => d(j, H) && F.set.some((U) => d(U, H) && j.every((B) => U.every((L) => B.intersects(L, H)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new o(F, this.options);
        } catch {
          return !1;
        }
      for (let H = 0; H < this.set.length; H++)
        if (V(this.set[H], F, this.options))
          return !0;
      return !1;
    }
  }
  Pi = t;
  const n = Iw, r = new n(), a = Wo, i = Ga(), s = Va, o = Le, {
    safeRe: l,
    t: u,
    comparatorTrimReplace: c,
    tildeTrimReplace: p,
    caretTrimReplace: f
  } = Or, { FLAG_INCLUDE_PRERELEASE: h, FLAG_LOOSE: g } = Rr, m = (P) => P.value === "<0.0.0-0", v = (P) => P.value === "", d = (P, F) => {
    let H = !0;
    const j = P.slice();
    let U = j.pop();
    for (; H && j.length; )
      H = j.every((B) => U.intersects(B, F)), U = j.pop();
    return H;
  }, y = (P, F) => (P = P.replace(l[u.BUILD], ""), s("comp", P, F), P = I(P, F), s("caret", P), P = x(P, F), s("tildes", P), P = D(P, F), s("xrange", P), P = R(P, F), s("stars", P), P), _ = (P) => !P || P.toLowerCase() === "x" || P === "*", x = (P, F) => P.trim().split(/\s+/).map((H) => E(H, F)).join(" "), E = (P, F) => {
    const H = F.loose ? l[u.TILDELOOSE] : l[u.TILDE];
    return P.replace(H, (j, U, B, L, $) => {
      s("tilde", P, j, U, B, L, $);
      let N;
      return _(U) ? N = "" : _(B) ? N = `>=${U}.0.0 <${+U + 1}.0.0-0` : _(L) ? N = `>=${U}.${B}.0 <${U}.${+B + 1}.0-0` : $ ? (s("replaceTilde pr", $), N = `>=${U}.${B}.${L}-${$} <${U}.${+B + 1}.0-0`) : N = `>=${U}.${B}.${L} <${U}.${+B + 1}.0-0`, s("tilde return", N), N;
    });
  }, I = (P, F) => P.trim().split(/\s+/).map((H) => C(H, F)).join(" "), C = (P, F) => {
    s("caret", P, F);
    const H = F.loose ? l[u.CARETLOOSE] : l[u.CARET], j = F.includePrerelease ? "-0" : "";
    return P.replace(H, (U, B, L, $, N) => {
      s("caret", P, U, B, L, $, N);
      let T;
      return _(B) ? T = "" : _(L) ? T = `>=${B}.0.0${j} <${+B + 1}.0.0-0` : _($) ? B === "0" ? T = `>=${B}.${L}.0${j} <${B}.${+L + 1}.0-0` : T = `>=${B}.${L}.0${j} <${+B + 1}.0.0-0` : N ? (s("replaceCaret pr", N), B === "0" ? L === "0" ? T = `>=${B}.${L}.${$}-${N} <${B}.${L}.${+$ + 1}-0` : T = `>=${B}.${L}.${$}-${N} <${B}.${+L + 1}.0-0` : T = `>=${B}.${L}.${$}-${N} <${+B + 1}.0.0-0`) : (s("no pr"), B === "0" ? L === "0" ? T = `>=${B}.${L}.${$}${j} <${B}.${L}.${+$ + 1}-0` : T = `>=${B}.${L}.${$}${j} <${B}.${+L + 1}.0-0` : T = `>=${B}.${L}.${$} <${+B + 1}.0.0-0`), s("caret return", T), T;
    });
  }, D = (P, F) => (s("replaceXRanges", P, F), P.split(/\s+/).map((H) => S(H, F)).join(" ")), S = (P, F) => {
    P = P.trim();
    const H = F.loose ? l[u.XRANGELOOSE] : l[u.XRANGE];
    return P.replace(H, (j, U, B, L, $, N) => {
      s("xRange", P, j, U, B, L, $, N);
      const T = _(B), b = T || _(L), w = b || _($), M = w;
      return U === "=" && M && (U = ""), N = F.includePrerelease ? "-0" : "", T ? U === ">" || U === "<" ? j = "<0.0.0-0" : j = "*" : U && M ? (b && (L = 0), $ = 0, U === ">" ? (U = ">=", b ? (B = +B + 1, L = 0, $ = 0) : (L = +L + 1, $ = 0)) : U === "<=" && (U = "<", b ? B = +B + 1 : L = +L + 1), U === "<" && (N = "-0"), j = `${U + B}.${L}.${$}${N}`) : b ? j = `>=${B}.0.0${N} <${+B + 1}.0.0-0` : w && (j = `>=${B}.${L}.0${N} <${B}.${+L + 1}.0-0`), s("xRange return", j), j;
    });
  }, R = (P, F) => (s("replaceStars", P, F), P.trim().replace(l[u.STAR], "")), O = (P, F) => (s("replaceGTE0", P, F), P.trim().replace(l[F.includePrerelease ? u.GTE0PRE : u.GTE0], "")), k = (P) => (F, H, j, U, B, L, $, N, T, b, w, M) => (_(j) ? H = "" : _(U) ? H = `>=${j}.0.0${P ? "-0" : ""}` : _(B) ? H = `>=${j}.${U}.0${P ? "-0" : ""}` : L ? H = `>=${H}` : H = `>=${H}${P ? "-0" : ""}`, _(T) ? N = "" : _(b) ? N = `<${+T + 1}.0.0-0` : _(w) ? N = `<${T}.${+b + 1}.0-0` : M ? N = `<=${T}.${b}.${w}-${M}` : P ? N = `<${T}.${b}.${+w + 1}-0` : N = `<=${N}`, `${H} ${N}`.trim()), V = (P, F, H) => {
    for (let j = 0; j < P.length; j++)
      if (!P[j].test(F))
        return !1;
    if (F.prerelease.length && !H.includePrerelease) {
      for (let j = 0; j < P.length; j++)
        if (s(P[j].semver), P[j].semver !== i.ANY && P[j].semver.prerelease.length > 0) {
          const U = P[j].semver;
          if (U.major === F.major && U.minor === F.minor && U.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Pi;
}
var ki, Xl;
function Ga() {
  if (Xl) return ki;
  Xl = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, p) {
      if (p = n(p), c instanceof t) {
        if (c.loose === !!p.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), s("comparator", c, p), this.options = p, this.loose = !!p.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(c) {
      const p = this.options.loose ? r[a.COMPARATORLOOSE] : r[a.COMPARATOR], f = c.match(p);
      if (!f)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = f[1] !== void 0 ? f[1] : "", this.operator === "=" && (this.operator = ""), f[2] ? this.semver = new o(f[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (s("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new o(c, this.options);
        } catch {
          return !1;
        }
      return i(c, this.operator, this.semver, this.options);
    }
    intersects(c, p) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, p).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, p).test(c.semver) : (p = n(p), p.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !p.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || i(this.semver, "<", c.semver, p) && this.operator.startsWith(">") && c.operator.startsWith("<") || i(this.semver, ">", c.semver, p) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  ki = t;
  const n = Wo, { safeRe: r, t: a } = Or, i = Yd, s = Va, o = Le, l = ct();
  return ki;
}
const jw = ct(), Cw = (e, t, n) => {
  try {
    t = new jw(t, n);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Ka = Cw;
const Lw = ct(), Dw = (e, t) => new Lw(e, t).set.map((n) => n.map((r) => r.value).join(" ").trim().split(" "));
var Fw = Dw;
const Uw = Le, Mw = ct(), zw = (e, t, n) => {
  let r = null, a = null, i = null;
  try {
    i = new Mw(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    i.test(s) && (!r || a.compare(s) === -1) && (r = s, a = new Uw(r, n));
  }), r;
};
var qw = zw;
const Bw = Le, Vw = ct(), Hw = (e, t, n) => {
  let r = null, a = null, i = null;
  try {
    i = new Vw(t, n);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    i.test(s) && (!r || a.compare(s) === 1) && (r = s, a = new Bw(r, n));
  }), r;
};
var Gw = Hw;
const Ni = Le, Kw = ct(), Wl = Ha, Xw = (e, t) => {
  e = new Kw(e, t);
  let n = new Ni("0.0.0");
  if (e.test(n) || (n = new Ni("0.0.0-0"), e.test(n)))
    return n;
  n = null;
  for (let r = 0; r < e.set.length; ++r) {
    const a = e.set[r];
    let i = null;
    a.forEach((s) => {
      const o = new Ni(s.semver.version);
      switch (s.operator) {
        case ">":
          o.prerelease.length === 0 ? o.patch++ : o.prerelease.push(0), o.raw = o.format();
        case "":
        case ">=":
          (!i || Wl(o, i)) && (i = o);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), i && (!n || Wl(n, i)) && (n = i);
  }
  return n && e.test(n) ? n : null;
};
var Ww = Xw;
const Yw = ct(), Jw = (e, t) => {
  try {
    return new Yw(e, t).range || "*";
  } catch {
    return null;
  }
};
var Qw = Jw;
const Zw = Le, Jd = Ga(), { ANY: e$ } = Jd, t$ = ct(), n$ = Ka, Yl = Ha, Jl = Jo, r$ = Zo, a$ = Qo, i$ = (e, t, n, r) => {
  e = new Zw(e, r), t = new t$(t, r);
  let a, i, s, o, l;
  switch (n) {
    case ">":
      a = Yl, i = r$, s = Jl, o = ">", l = ">=";
      break;
    case "<":
      a = Jl, i = a$, s = Yl, o = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (n$(e, t, r))
    return !1;
  for (let u = 0; u < t.set.length; ++u) {
    const c = t.set[u];
    let p = null, f = null;
    if (c.forEach((h) => {
      h.semver === e$ && (h = new Jd(">=0.0.0")), p = p || h, f = f || h, a(h.semver, p.semver, r) ? p = h : s(h.semver, f.semver, r) && (f = h);
    }), p.operator === o || p.operator === l || (!f.operator || f.operator === o) && i(e, f.semver))
      return !1;
    if (f.operator === l && s(e, f.semver))
      return !1;
  }
  return !0;
};
var ec = i$;
const s$ = ec, o$ = (e, t, n) => s$(e, t, ">", n);
var c$ = o$;
const l$ = ec, u$ = (e, t, n) => l$(e, t, "<", n);
var p$ = u$;
const Ql = ct(), d$ = (e, t, n) => (e = new Ql(e, n), t = new Ql(t, n), e.intersects(t, n));
var f$ = d$;
const m$ = Ka, h$ = ot;
var v$ = (e, t, n) => {
  const r = [];
  let a = null, i = null;
  const s = e.sort((c, p) => h$(c, p, n));
  for (const c of s)
    m$(c, t, n) ? (i = c, a || (a = c)) : (i && r.push([a, i]), i = null, a = null);
  a && r.push([a, null]);
  const o = [];
  for (const [c, p] of r)
    c === p ? o.push(c) : !p && c === s[0] ? o.push("*") : p ? c === s[0] ? o.push(`<=${p}`) : o.push(`${c} - ${p}`) : o.push(`>=${c}`);
  const l = o.join(" || "), u = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < u.length ? l : t;
};
const Zl = ct(), tc = Ga(), { ANY: Ii } = tc, ar = Ka, nc = ot, y$ = (e, t, n = {}) => {
  if (e === t)
    return !0;
  e = new Zl(e, n), t = new Zl(t, n);
  let r = !1;
  e: for (const a of e.set) {
    for (const i of t.set) {
      const s = x$(a, i, n);
      if (r = r || s !== null, s)
        continue e;
    }
    if (r)
      return !1;
  }
  return !0;
}, g$ = [new tc(">=0.0.0-0")], eu = [new tc(">=0.0.0")], x$ = (e, t, n) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Ii) {
    if (t.length === 1 && t[0].semver === Ii)
      return !0;
    n.includePrerelease ? e = g$ : e = eu;
  }
  if (t.length === 1 && t[0].semver === Ii) {
    if (n.includePrerelease)
      return !0;
    t = eu;
  }
  const r = /* @__PURE__ */ new Set();
  let a, i;
  for (const h of e)
    h.operator === ">" || h.operator === ">=" ? a = tu(a, h, n) : h.operator === "<" || h.operator === "<=" ? i = nu(i, h, n) : r.add(h.semver);
  if (r.size > 1)
    return null;
  let s;
  if (a && i) {
    if (s = nc(a.semver, i.semver, n), s > 0)
      return null;
    if (s === 0 && (a.operator !== ">=" || i.operator !== "<="))
      return null;
  }
  for (const h of r) {
    if (a && !ar(h, String(a), n) || i && !ar(h, String(i), n))
      return null;
    for (const g of t)
      if (!ar(h, String(g), n))
        return !1;
    return !0;
  }
  let o, l, u, c, p = i && !n.includePrerelease && i.semver.prerelease.length ? i.semver : !1, f = a && !n.includePrerelease && a.semver.prerelease.length ? a.semver : !1;
  p && p.prerelease.length === 1 && i.operator === "<" && p.prerelease[0] === 0 && (p = !1);
  for (const h of t) {
    if (c = c || h.operator === ">" || h.operator === ">=", u = u || h.operator === "<" || h.operator === "<=", a) {
      if (f && h.semver.prerelease && h.semver.prerelease.length && h.semver.major === f.major && h.semver.minor === f.minor && h.semver.patch === f.patch && (f = !1), h.operator === ">" || h.operator === ">=") {
        if (o = tu(a, h, n), o === h && o !== a)
          return !1;
      } else if (a.operator === ">=" && !ar(a.semver, String(h), n))
        return !1;
    }
    if (i) {
      if (p && h.semver.prerelease && h.semver.prerelease.length && h.semver.major === p.major && h.semver.minor === p.minor && h.semver.patch === p.patch && (p = !1), h.operator === "<" || h.operator === "<=") {
        if (l = nu(i, h, n), l === h && l !== i)
          return !1;
      } else if (i.operator === "<=" && !ar(i.semver, String(h), n))
        return !1;
    }
    if (!h.operator && (i || a) && s !== 0)
      return !1;
  }
  return !(a && u && !i && s !== 0 || i && c && !a && s !== 0 || f || p);
}, tu = (e, t, n) => {
  if (!e)
    return t;
  const r = nc(e.semver, t.semver, n);
  return r > 0 ? e : r < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, nu = (e, t, n) => {
  if (!e)
    return t;
  const r = nc(e.semver, t.semver, n);
  return r < 0 ? e : r > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var b$ = y$;
const ji = Or, ru = Rr, _$ = Le, au = Kd, E$ = mn, w$ = _E, $$ = $E, S$ = TE, T$ = OE, R$ = kE, O$ = jE, A$ = DE, P$ = ME, k$ = ot, N$ = VE, I$ = KE, j$ = Yo, C$ = JE, L$ = ew, D$ = Ha, F$ = Jo, U$ = Xd, M$ = Wd, z$ = Qo, q$ = Zo, B$ = Yd, V$ = ww, H$ = kw, G$ = Ga(), K$ = ct(), X$ = Ka, W$ = Fw, Y$ = qw, J$ = Gw, Q$ = Ww, Z$ = Qw, eS = ec, tS = c$, nS = p$, rS = f$, aS = v$, iS = b$;
var sS = {
  parse: E$,
  valid: w$,
  clean: $$,
  inc: S$,
  diff: T$,
  major: R$,
  minor: O$,
  patch: A$,
  prerelease: P$,
  compare: k$,
  rcompare: N$,
  compareLoose: I$,
  compareBuild: j$,
  sort: C$,
  rsort: L$,
  gt: D$,
  lt: F$,
  eq: U$,
  neq: M$,
  gte: z$,
  lte: q$,
  cmp: B$,
  coerce: V$,
  truncate: H$,
  Comparator: G$,
  Range: K$,
  satisfies: X$,
  toComparators: W$,
  maxSatisfying: Y$,
  minSatisfying: J$,
  minVersion: Q$,
  validRange: Z$,
  outside: eS,
  gtr: tS,
  ltr: nS,
  intersects: rS,
  simplifyRange: aS,
  subset: iS,
  SemVer: _$,
  re: ji.re,
  src: ji.src,
  tokens: ji.t,
  SEMVER_SPEC_VERSION: ru.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: ru.RELEASE_TYPES,
  compareIdentifiers: au.compareIdentifiers,
  rcompareIdentifiers: au.rcompareIdentifiers
};
const bn = /* @__PURE__ */ zn(sS), oS = Object.prototype.toString, cS = "[object Uint8Array]", lS = "[object ArrayBuffer]";
function Qd(e, t, n) {
  return e ? e.constructor === t ? !0 : oS.call(e) === n : !1;
}
function Zd(e) {
  return Qd(e, Uint8Array, cS);
}
function uS(e) {
  return Qd(e, ArrayBuffer, lS);
}
function pS(e) {
  return Zd(e) || uS(e);
}
function dS(e) {
  if (!Zd(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function fS(e) {
  if (!pS(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Ci(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((a, i) => a + i.length, 0));
  const n = new Uint8Array(t);
  let r = 0;
  for (const a of e)
    dS(a), n.set(a, r), r += a.length;
  return n;
}
const ta = {
  utf8: new globalThis.TextDecoder("utf8")
};
function na(e, t = "utf8") {
  return fS(e), ta[t] ?? (ta[t] = new globalThis.TextDecoder(t)), ta[t].decode(e);
}
function mS(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const hS = new globalThis.TextEncoder();
function Li(e) {
  return mS(e), hS.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const iu = "aes-256-cbc", ef = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), vS = (e) => typeof e == "string" && ef.has(e), bt = () => /* @__PURE__ */ Object.create(null), su = (e) => e !== void 0, Di = (e, t) => {
  const n = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), r = typeof t;
  if (n.has(r))
    throw new TypeError(`Setting a value of type \`${r}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Nt = "__internal__", Fi = `${Nt}.migrations.version`;
var jt, Ct, Qt, ze, Qe, Zt, en, In, dt, Re, tf, nf, rf, af, sf, of, cf, lf;
class yS {
  constructor(t = {}) {
    nt(this, Re);
    le(this, "path");
    le(this, "events");
    nt(this, jt);
    nt(this, Ct);
    nt(this, Qt);
    nt(this, ze);
    nt(this, Qe, {});
    nt(this, Zt, !1);
    nt(this, en);
    nt(this, In);
    nt(this, dt);
    le(this, "_deserialize", (t) => JSON.parse(t));
    le(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const n = yt(this, Re, tf).call(this, t);
    Me(this, ze, n), yt(this, Re, nf).call(this, n), yt(this, Re, af).call(this, n), yt(this, Re, sf).call(this, n), this.events = new EventTarget(), Me(this, Ct, n.encryptionKey), Me(this, Qt, n.encryptionAlgorithm ?? iu), this.path = yt(this, Re, of).call(this, n), yt(this, Re, cf).call(this, n), n.watch && this._watch();
  }
  get(t, n) {
    if (te(this, ze).accessPropertiesByDotNotation)
      return this._get(t, n);
    const { store: r } = this;
    return t in r ? r[t] : n;
  }
  set(t, n) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && n === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Nt} key, as it's used to manage this module internal operations.`);
    const { store: r } = this, a = (i, s) => {
      if (Di(i, s), te(this, ze).accessPropertiesByDotNotation)
        qr(r, i, s);
      else {
        if (i === "__proto__" || i === "constructor" || i === "prototype")
          return;
        r[i] = s;
      }
    };
    if (typeof t == "object") {
      const i = t;
      for (const [s, o] of Object.entries(i))
        a(s, o);
    } else
      a(t, n);
    this.store = r;
  }
  has(t) {
    return te(this, ze).accessPropertiesByDotNotation ? _i(this.store, t) : t in this.store;
  }
  appendToArray(t, n) {
    Di(t, n);
    const r = te(this, ze).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(r))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...r, n]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const n of t)
      su(te(this, Qe)[n]) && this.set(n, te(this, Qe)[n]);
  }
  delete(t) {
    const { store: n } = this;
    te(this, ze).accessPropertiesByDotNotation ? yh(n, t) : delete n[t], this.store = n;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = bt();
    for (const n of Object.keys(te(this, Qe)))
      su(te(this, Qe)[n]) && (Di(n, te(this, Qe)[n]), te(this, ze).accessPropertiesByDotNotation ? qr(t, n, te(this, Qe)[n]) : t[n] = te(this, Qe)[n]);
    this.store = t;
  }
  onDidChange(t, n) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof n != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof n}`);
    return this._handleValueChange(() => this.get(t), n);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((n) => !this._isReservedKeyPath(n)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    var t;
    try {
      const n = ne.readFileSync(this.path, te(this, Ct) ? null : "utf8"), r = this._decryptData(n);
      return ((i) => {
        const s = this._deserialize(i);
        return te(this, Zt) || this._validate(s), Object.assign(bt(), s);
      })(r);
    } catch (n) {
      if ((n == null ? void 0 : n.code) === "ENOENT")
        return this._ensureDirectory(), bt();
      if (te(this, ze).clearInvalidConfig) {
        const r = n;
        if (r.name === "SyntaxError" || (t = r.message) != null && t.startsWith("Config schema violation:") || r.message === "Failed to decrypt config data.")
          return bt();
      }
      throw n;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !_i(t, Nt))
      try {
        const n = ne.readFileSync(this.path, te(this, Ct) ? null : "utf8"), r = this._decryptData(n), a = this._deserialize(r);
        _i(a, Nt) && qr(t, Nt, al(a, Nt));
      } catch {
      }
    te(this, Zt) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, n] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, n]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    te(this, en) && (te(this, en).close(), Me(this, en, void 0)), te(this, In) && (ne.unwatchFile(this.path), Me(this, In, !1)), Me(this, dt, void 0);
  }
  _decryptData(t) {
    const n = te(this, Ct);
    if (!n)
      return typeof t == "string" ? t : na(t);
    const r = te(this, Qt), a = r === "aes-256-gcm" ? 16 : 0, i = ":".codePointAt(0), s = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(i !== void 0 && s === i)) {
      if (r === "aes-256-cbc")
        return typeof t == "string" ? t : na(t);
      throw new Error("Failed to decrypt config data.");
    }
    const l = (h) => {
      if (a === 0)
        return { ciphertext: h };
      const g = h.length - a;
      if (g < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: h.slice(0, g),
        authenticationTag: h.slice(g)
      };
    }, u = t.slice(0, 16), c = t.slice(17), p = typeof c == "string" ? Li(c) : c, f = (h) => {
      const { ciphertext: g, authenticationTag: m } = l(p), v = Qn.pbkdf2Sync(n, h, 1e4, 32, "sha512"), d = Qn.createDecipheriv(r, v, u);
      return m && d.setAuthTag(m), na(Ci([d.update(g), d.final()]));
    };
    try {
      return f(u);
    } catch {
      try {
        return f(u.toString());
      } catch {
      }
    }
    if (r === "aes-256-cbc")
      return typeof t == "string" ? t : na(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let n = this.store;
    const r = () => {
      const a = n, i = this.store;
      kc(i, a) || (n = i, t.call(this, i, a));
    };
    return this.events.addEventListener("change", r), () => {
      this.events.removeEventListener("change", r);
    };
  }
  _handleValueChange(t, n) {
    let r = t();
    const a = () => {
      const i = r, s = t();
      kc(s, i) || (r = s, n.call(this, s, i));
    };
    return this.events.addEventListener("change", a), () => {
      this.events.removeEventListener("change", a);
    };
  }
  _validate(t) {
    if (!te(this, jt) || te(this, jt).call(this, t) || !te(this, jt).errors)
      return;
    const r = te(this, jt).errors.map(({ instancePath: a, message: i = "" }) => `\`${a.slice(1)}\` ${i}`);
    throw new Error("Config schema violation: " + r.join("; "));
  }
  _ensureDirectory() {
    ne.mkdirSync(Q.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let n = this._serialize(t);
    const r = te(this, Ct);
    if (r) {
      const a = Qn.randomBytes(16), i = Qn.pbkdf2Sync(r, a, 1e4, 32, "sha512"), s = Qn.createCipheriv(te(this, Qt), i, a), o = Ci([s.update(Li(n)), s.final()]), l = [a, Li(":"), o];
      te(this, Qt) === "aes-256-gcm" && l.push(s.getAuthTag()), n = Ci(l);
    }
    if (ve.env.SNAP)
      ne.writeFileSync(this.path, n, { mode: te(this, ze).configFileMode });
    else
      try {
        Mp(this.path, n, { mode: te(this, ze).configFileMode });
      } catch (a) {
        if ((a == null ? void 0 : a.code) === "EXDEV") {
          ne.writeFileSync(this.path, n, { mode: te(this, ze).configFileMode });
          return;
        }
        throw a;
      }
  }
  _watch() {
    if (this._ensureDirectory(), ne.existsSync(this.path) || this._write(bt()), ve.platform === "win32" || ve.platform === "darwin") {
      te(this, dt) ?? Me(this, dt, Ul(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = Q.dirname(this.path), n = Q.basename(this.path);
      Me(this, en, ne.watch(t, { persistent: !1, encoding: "utf8" }, (r, a) => {
        a && a !== n || typeof te(this, dt) == "function" && te(this, dt).call(this);
      }));
    } else
      te(this, dt) ?? Me(this, dt, Ul(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), ne.watchFile(this.path, { persistent: !1 }, (t, n) => {
        typeof te(this, dt) == "function" && te(this, dt).call(this);
      }), Me(this, In, !0);
  }
  _migrate(t, n, r) {
    let a = this._get(Fi, "0.0.0");
    const i = Object.keys(t).filter((o) => this._shouldPerformMigration(o, a, n));
    let s = structuredClone(this.store);
    for (const o of i)
      try {
        r && r(this, {
          fromVersion: a,
          toVersion: o,
          finalVersion: n,
          versions: i
        });
        const l = t[o];
        l == null || l(this), this._set(Fi, o), a = o, s = structuredClone(this.store);
      } catch (l) {
        this.store = s;
        const u = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(a) || !bn.eq(a, n)) && this._set(Fi, n);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [n, r] of Object.entries(t))
      if (this._isReservedKeyPath(n) || this._objectContainsReservedKey(r))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === Nt || t.startsWith(`${Nt}.`);
  }
  _isVersionInRangeFormat(t) {
    return bn.clean(t) === null;
  }
  _shouldPerformMigration(t, n, r) {
    return this._isVersionInRangeFormat(t) ? n !== "0.0.0" && bn.satisfies(n, t) ? !1 : bn.satisfies(r, t) : !(bn.lte(t, n) || bn.gt(t, r));
  }
  _get(t, n) {
    return al(this.store, t, n);
  }
  _set(t, n) {
    const { store: r } = this;
    qr(r, t, n), this.store = r;
  }
}
jt = new WeakMap(), Ct = new WeakMap(), Qt = new WeakMap(), ze = new WeakMap(), Qe = new WeakMap(), Zt = new WeakMap(), en = new WeakMap(), In = new WeakMap(), dt = new WeakMap(), Re = new WeakSet(), tf = function(t) {
  const n = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (n.encryptionAlgorithm ?? (n.encryptionAlgorithm = iu), !vS(n.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...ef].join(", ")}`);
  if (!n.cwd) {
    if (!n.projectName)
      throw new Error("Please specify the `projectName` option.");
    n.cwd = _h(n.projectName, { suffix: n.projectSuffix }).config;
  }
  return typeof n.fileExtension == "string" && (n.fileExtension = n.fileExtension.replace(/^\.+/, "")), n;
}, nf = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const n = J_.default, r = new L_.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...t.ajvOptions
  });
  n(r);
  const a = {
    ...t.rootSchema,
    type: "object",
    properties: t.schema
  };
  Me(this, jt, r.compile(a)), yt(this, Re, rf).call(this, t.schema);
}, rf = function(t) {
  const n = Object.entries(t ?? {});
  for (const [r, a] of n) {
    if (!a || typeof a != "object" || !Object.hasOwn(a, "default"))
      continue;
    const { default: i } = a;
    i !== void 0 && (te(this, Qe)[r] = i);
  }
}, af = function(t) {
  t.defaults && Object.assign(te(this, Qe), t.defaults);
}, sf = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, of = function(t) {
  const n = typeof t.fileExtension == "string" ? t.fileExtension : void 0, r = n ? `.${n}` : "";
  return Q.resolve(t.cwd, `${t.configName ?? "config"}${r}`);
}, cf = function(t) {
  if (t.migrations) {
    yt(this, Re, lf).call(this, t), this._validate(this.store);
    return;
  }
  const n = this.store, r = Object.assign(bt(), t.defaults ?? {}, n);
  this._validate(r);
  try {
    Nc.deepEqual(n, r);
  } catch {
    this.store = r;
  }
}, lf = function(t) {
  const { migrations: n, projectVersion: r } = t;
  if (n) {
    if (!r)
      throw new Error("Please specify the `projectVersion` option.");
    Me(this, Zt, !0);
    try {
      const a = this.store, i = Object.assign(bt(), t.defaults ?? {}, a);
      try {
        Nc.deepEqual(a, i);
      } catch {
        this._write(i);
      }
      this._migrate(n, r, t.beforeEachMigration);
    } finally {
      Me(this, Zt, !1);
    }
  }
};
const { app: fa, ipcMain: Ts, shell: gS } = yp;
let ou = !1;
const cu = () => {
  if (!Ts || !fa)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: fa.getPath("userData"),
    appVersion: fa.getVersion()
  };
  return ou || (Ts.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), ou = !0), e;
};
class xS extends yS {
  constructor(t) {
    let n, r;
    if (ve.type === "renderer") {
      const a = yp.ipcRenderer.sendSync("electron-store-get-data");
      if (!a)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: n, appVersion: r } = a);
    } else Ts && fa && ({ defaultCwd: n, appVersion: r } = cu());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = r), t.cwd ? t.cwd = Q.isAbsolute(t.cwd) ? t.cwd : Q.join(n, t.cwd) : t.cwd = n, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    cu();
  }
  async openInEditor() {
    const t = await gS.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const hn = new xS(), uf = [1, 5, 10, 15, 30, 45, 60], lu = [
  ...uf,
  null
], bS = [5, 10, 15, 30, 60], _S = ["primary", "all"], pf = {
  general: {
    trackingIntervalMinutes: 15,
    activityUpdateIntervalMinutes: 30,
    idleTimeoutMinutes: 10,
    takeScreenshots: !0,
    takeCamshots: !1,
    resumeTrackingAfterIdle: !0,
    reviewImagesBeforeUpload: !1
  },
  advanced: {
    screenshotReviewSeconds: 10,
    randomizedTracking: !1,
    activityAutoComplete: !1,
    askActivityDescriptionOnTrackingStart: !0,
    askActivityDescriptionOnTrackingStop: !0
  },
  trackingSources: {
    countKeyboardHits: !0,
    countMouseClicks: !0,
    screenshotsFrom: "primary",
    cameraId: "",
    cameraName: ""
  },
  other: {
    playSounds: !0,
    showDockIcon: !0,
    openAtLogin: !1
  }
};
function uu(e) {
  return !!e && typeof e == "object" && !Array.isArray(e);
}
function rc(e, t) {
  if (!t)
    return structuredClone(e);
  const n = structuredClone(e);
  for (const r of Object.keys(t)) {
    const a = t[r];
    a !== void 0 && (uu(n[r]) && uu(a) ? n[r] = rc(n[r], a) : n[r] = a);
  }
  return n;
}
function ir(e, t, n) {
  if (!n.includes(t))
    throw new Error(`Invalid ${e}.`);
}
function Xe(e, t) {
  if (typeof t != "boolean")
    throw new Error(`Invalid ${e}.`);
}
function df(e) {
  ir(
    "tracking interval",
    e.general.trackingIntervalMinutes,
    uf
  ), ir(
    "activity update interval",
    e.general.activityUpdateIntervalMinutes,
    lu
  ), ir(
    "idle timeout",
    e.general.idleTimeoutMinutes,
    lu
  ), Xe("take screenshots", e.general.takeScreenshots), Xe("take camshots", e.general.takeCamshots), Xe(
    "resume tracking after idle",
    e.general.resumeTrackingAfterIdle
  ), Xe(
    "review images before upload",
    e.general.reviewImagesBeforeUpload
  ), ir(
    "screenshot review time",
    e.advanced.screenshotReviewSeconds,
    bS
  ), Xe("randomized tracking", e.advanced.randomizedTracking), Xe(
    "activity auto complete",
    e.advanced.activityAutoComplete
  ), Xe(
    "ask activity description on tracking start",
    e.advanced.askActivityDescriptionOnTrackingStart
  ), Xe(
    "ask activity description on tracking stop",
    e.advanced.askActivityDescriptionOnTrackingStop
  ), Xe("count keyboard hits", e.trackingSources.countKeyboardHits), Xe("count mouse clicks", e.trackingSources.countMouseClicks), ir(
    "screenshots source",
    e.trackingSources.screenshotsFrom,
    _S
  ), Xe("play sounds", e.other.playSounds), Xe("show dock icon", e.other.showDockIcon), Xe("open at login", e.other.openAtLogin);
}
function ac(e) {
  if (Fe.isPackaged || e.other.openAtLogin)
    try {
      Fe.setLoginItemSettings({
        openAtLogin: e.other.openAtLogin
      });
    } catch (t) {
      console.warn("Unable to update login item settings:", t);
    }
  process.platform === "darwin" && Fe.dock && (e.other.showDockIcon ? Fe.dock.show() : Fe.dock.hide());
}
function _t() {
  const e = rc(pf, hn.get("config"));
  return df(e), e;
}
function ES(e) {
  const t = rc(_t(), e);
  return df(t), hn.set("config", t), ac(t), t;
}
function wS() {
  const e = structuredClone(pf);
  return hn.set("config", e), ac(e), e;
}
function $S(e) {
  return e.trim().replace(/\/+$/, "");
}
function SS() {
  const e = hn.get("credentials");
  if (!e)
    throw new Error("Please login first.");
  return e;
}
function TS(e) {
  hn.set("credentials", e);
}
function RS() {
  hn.delete("credentials");
}
const OS = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};
function AS(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
async function ff(e, t) {
  if (!t.general.reviewImagesBeforeUpload)
    return !0;
  let n = "";
  try {
    n = await PS(e);
  } catch (r) {
    return console.warn("Unable to load image preview for review:", r), !0;
  }
  return new Promise((r) => {
    const a = `image-review-${Date.now()}-${Math.random().toString(36).slice(2)}`, i = Tm.getPrimaryDisplay(), s = 320, o = 260, l = 16, u = new zt({
      width: s,
      height: o,
      x: i.workArea.x + i.workArea.width - s - l,
      y: i.workArea.y + l,
      frame: !1,
      resizable: !1,
      alwaysOnTop: !0,
      skipTaskbar: !0,
      title: "Review Image",
      webPreferences: {
        nodeIntegration: !0,
        contextIsolation: !1
      }
    });
    let c = !1;
    function p() {
      ce.removeListener("image-review:allow", h), ce.removeListener("image-review:reject", g);
    }
    function f(m) {
      c || (c = !0, p(), r(m), u.isDestroyed() || u.close());
    }
    function h(m, v) {
      v.reviewId === a && f(!0);
    }
    function g(m, v) {
      v.reviewId === a && f(!1);
    }
    ce.on("image-review:allow", h), ce.on("image-review:reject", g), u.on("closed", () => {
      f(!0);
    }), setTimeout(() => {
      f(!0);
    }, t.advanced.screenshotReviewSeconds * 1e3), u.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                background: white;
                border: 1px solid #d1d5db;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                color: #4b5563;
              }
              .wrap { padding: 10px; }
              h1 { margin: 0 0 8px; font-size: 14px; font-weight: 600; }
              img {
                width: 100%;
                height: 160px;
                object-fit: cover;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: #f3f4f6;
              }
              .actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 10px;
              }
              button {
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                padding: 7px 12px;
                color: #4b5563;
                font-size: 13px;
              }
              .allow {
                border-color: #3ab175;
                background: #3ab175;
                color: white;
              }
            </style>
          </head>
          <body>
            <div class="wrap">
              <h1>Review Image Before Upload</h1>
              <img src="${AS(n)}" />
              <div class="actions">
                <button id="reject">Reject</button>
                <button class="allow" id="allow">Allow</button>
              </div>
            </div>
            <script>
              const { ipcRenderer } = require('electron');
              const reviewId = ${JSON.stringify(a)};
              document.getElementById('allow').addEventListener('click', () => {
                ipcRenderer.send('image-review:allow', { reviewId });
              });
              document.getElementById('reject').addEventListener('click', () => {
                ipcRenderer.send('image-review:reject', { reviewId });
              });
            <\/script>
          </body>
        </html>
      `)}`
    );
  });
}
async function PS(e) {
  const t = Q.extname(e).toLowerCase(), n = OS[t] || "image/jpeg", r = await Dt.readFile(Q.resolve(e));
  return `data:${n};base64,${r.toString("base64")}`;
}
function kS(e) {
  return Q.join(Fe.getPath("userData"), "captures", e);
}
async function mf(e) {
  const t = kS(e);
  return await Dt.mkdir(t, { recursive: !0 }), t;
}
async function pu(e = 100) {
  const t = Zm(e);
  await Promise.all(
    t.map(async (n) => {
      try {
        await Dt.unlink(n.filePath);
      } catch (r) {
        if (!(r instanceof Error) || !("code" in r) || r.code !== "ENOENT") {
          console.warn("Unable to delete uploaded media file:", r);
          return;
        }
      }
      eh(n.id);
    })
  );
}
async function du(e, t) {
  const n = await ff(e, t);
  return {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    filePath: e,
    approved: n,
    rejected: !n
  };
}
async function NS(e, t) {
  try {
    await Dt.rename(e, t);
  } catch {
    await Dt.copyFile(e, t), await Dt.unlink(e);
  }
}
async function fu(e, t, n) {
  const r = Ve.join(zs.tmpdir(), t), a = Ve.join(e, t), i = await Cp({
    filename: r,
    ...n === void 0 ? {} : { screen: n }
  });
  return await NS(i, a), a;
}
async function hf(e = _t()) {
  if (!e.general.takeScreenshots)
    return [];
  const t = await mf("screenshots"), n = Date.now();
  if (e.trackingSources.screenshotsFrom === "all") {
    const a = await Cp.listDisplays(), i = await Promise.all(
      a.map(async (s, o) => fu(
        t,
        `${n}-${o}.jpg`,
        Number(s.id)
      ))
    );
    return Promise.all(i.map((s) => du(s, e)));
  }
  const r = await fu(
    t,
    `${n}.jpg`
  );
  return [await du(r, e)];
}
async function IS() {
  return (await hf()).filter((t) => t.approved).map((t) => t.filePath);
}
const jS = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};
async function CS(e) {
  return Promise.all(
    e.map(async (t) => {
      try {
        const n = Q.extname(t.filePath).toLowerCase(), r = jS[n] || "image/jpeg", a = await Dt.readFile(t.filePath);
        return {
          ...t,
          previewDataUrl: `data:${r};base64,${a.toString("base64")}`
        };
      } catch {
        return t;
      }
    })
  );
}
async function vf(e) {
  const t = e.description.trim();
  if (!e.project)
    throw new Error("Please select a project first.");
  if (!t)
    throw new Error("Activity description is required.");
  const n = e.screenshotPaths === void 0 ? await IS() : e.screenshotPaths;
  return Vm({
    ...e,
    description: t,
    screenshotPaths: n,
    camshotPaths: e.camshotPaths || []
  });
}
function mu(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function yf(e, t) {
  const n = mu(t.title), r = mu(t.projectLabel || t.project);
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${n}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f4f4f4;
            color: #4b5563;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          form {
            height: 100vh;
            padding: 18px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 12px;
          }
          h1 {
            margin: 0;
            color: #374151;
            font-size: 18px;
            font-weight: 500;
          }
          p {
            margin: -4px 0 4px;
            color: #9ca3af;
            font-size: 12px;
          }
          input {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 10px 12px;
            color: #374151;
            font-size: 14px;
            outline: none;
          }
          input:focus { border-color: #60a5fa; }
          .error {
            min-height: 18px;
            color: #dc2626;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <form id="activity-form">
          <div>
            <h1>${n}</h1>
            <p>${r}</p>
          </div>
          <input id="description" autofocus placeholder="Activity description" />
          <div class="error" id="error"></div>
        </form>
        <script>
          const { ipcRenderer } = require('electron');
          const form = document.getElementById('activity-form');
          const input = document.getElementById('description');
          const error = document.getElementById('error');

          form.addEventListener('submit', (event) => {
            event.preventDefault();
            const description = input.value.trim();

            if (!description) {
              error.textContent = 'Activity description is required.';
              input.focus();
              return;
            }

            ipcRenderer.send('activity-prompt:submit', {
              promptId: ${JSON.stringify(e)},
              description,
            });
          });

          window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
              ipcRenderer.send('activity-prompt:cancel', {
                promptId: ${JSON.stringify(e)},
              });
            }
          });
        <\/script>
      </body>
    </html>
  `;
}
function LS(e) {
  return new Promise((t, n) => {
    const r = `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`, a = Um() || void 0, i = new zt({
      width: 420,
      height: 220,
      parent: a,
      modal: !!a,
      resizable: !1,
      minimizable: !1,
      maximizable: !1,
      title: e.title,
      backgroundColor: "#f4f4f4",
      webPreferences: {
        nodeIntegration: !0,
        contextIsolation: !1
      }
    });
    let s = !1;
    function o() {
      ce.removeListener("activity-prompt:submit", c), ce.removeListener("activity-prompt:cancel", u);
    }
    function l() {
      i.isDestroyed() || i.close();
    }
    function u(p, f) {
      f.promptId !== r || s || (s = !0, o(), t(null), l());
    }
    function c(p, f) {
      if (!(f.promptId !== r || s)) {
        s = !0, o();
        try {
          vf({
            ...e,
            description: f.description
          }).then((h) => {
            t(h), l();
          }).catch((h) => {
            n(h), l();
          });
        } catch (h) {
          n(h), l();
        }
      }
    }
    ce.on("activity-prompt:submit", c), ce.on("activity-prompt:cancel", u), i.on("closed", () => {
      s || (s = !0, o(), t(null));
    }), i.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        yf(r, e)
      )}`
    );
  });
}
function DS(e) {
  return new Promise((t) => {
    const n = `activity-description-${Date.now()}-${Math.random().toString(36).slice(2)}`, r = new zt({
      width: 420,
      height: 220,
      center: !0,
      show: !1,
      resizable: !1,
      minimizable: !1,
      maximizable: !1,
      alwaysOnTop: !0,
      title: e.title,
      backgroundColor: "#f4f4f4",
      webPreferences: {
        nodeIntegration: !0,
        contextIsolation: !1
      }
    });
    let a = !1;
    function i() {
      ce.removeListener("activity-prompt:submit", l), ce.removeListener("activity-prompt:cancel", o);
    }
    function s() {
      r.isDestroyed() || r.close();
    }
    function o(u, c) {
      c.promptId !== n || a || (a = !0, i(), t(null), s());
    }
    function l(u, c) {
      c.promptId !== n || a || (a = !0, i(), t(c.description.trim()), s());
    }
    ce.on("activity-prompt:submit", l), ce.on("activity-prompt:cancel", o), r.on("closed", () => {
      a || (a = !0, i(), t(null));
    }), r.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        yf(n, e)
      )}`
    ), r.once("ready-to-show", () => {
      r.show(), r.focus();
    });
  });
}
function FS() {
  ce.handle("activities:create", async (e, t) => vf(t)), ce.handle("activities:list-recent-unsynced", async (e, t) => Ym(t)), ce.handle("activities:list-recent-sessions", async (e, t) => Jm(t)), ce.handle(
    "activities:list-media",
    async (e, t, n) => CS(Qm(t, n))
  ), ce.handle("activities:prompt", async (e, t) => {
    if (!t.project)
      throw new Error("Please select a project first.");
    return LS(t);
  }), ce.handle(
    "activities:prompt-description",
    async (e, t) => {
      if (!t.project)
        throw new Error("Please select a project first.");
      return DS(t);
    }
  );
}
function US() {
  ce.handle("auth:get", async () => {
    const e = hn.get("credentials");
    return e ? {
      loggedIn: !0,
      siteUrl: e.siteUrl
    } : {
      loggedIn: !1,
      siteUrl: ""
    };
  }), ce.handle("auth:login", async (e, t) => {
    const n = $S(t.siteUrl), r = t.apiKey.trim(), a = t.apiSecret.trim();
    if (!n || !r || !a)
      throw new Error("Site URL, API key, and API secret are required.");
    return TS({
      siteUrl: n,
      apiKey: r,
      apiSecret: a
    }), {
      success: !0,
      siteUrl: n
    };
  }), ce.handle("auth:logout", async () => (RS(), {
    success: !0
  }));
}
function MS(e) {
  function t(n) {
    zt.getAllWindows().forEach((r) => {
      r.webContents.send("config:updated", n);
    });
  }
  ce.handle("config:open-window", async () => (wp(e), {
    success: !0
  })), ce.handle("config:get", async () => _t()), ce.handle("config:save", async (n, r) => {
    const a = ES(r);
    return t(a), a;
  }), ce.handle("config:reset", async () => {
    const n = wS();
    return t(n), n;
  });
}
function gf(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: zS } = Object.prototype, { getPrototypeOf: Xa } = Object, { iterator: Wa, toStringTag: xf } = Symbol, Ya = /* @__PURE__ */ ((e) => (t) => {
  const n = zS.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), lt = (e) => (e = e.toLowerCase(), (t) => Ya(t) === e), Ja = (e) => (t) => typeof t === e, { isArray: Kn } = Array, Fn = Ja("undefined");
function Ar(e) {
  return e !== null && !Fn(e) && e.constructor !== null && !Fn(e.constructor) && Be(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const bf = lt("ArrayBuffer");
function qS(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && bf(e.buffer), t;
}
const BS = Ja("string"), Be = Ja("function"), _f = Ja("number"), Pr = (e) => e !== null && typeof e == "object", VS = (e) => e === !0 || e === !1, ma = (e) => {
  if (Ya(e) !== "object")
    return !1;
  const t = Xa(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(xf in e) && !(Wa in e);
}, HS = (e) => {
  if (!Pr(e) || Ar(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, GS = lt("Date"), KS = lt("File"), XS = (e) => !!(e && typeof e.uri < "u"), WS = (e) => e && typeof e.getParts < "u", YS = lt("Blob"), JS = lt("FileList"), QS = (e) => Pr(e) && Be(e.pipe);
function ZS() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const hu = ZS(), vu = typeof hu.FormData < "u" ? hu.FormData : void 0, e1 = (e) => {
  if (!e) return !1;
  if (vu && e instanceof vu) return !0;
  const t = Xa(e);
  if (!t || t === Object.prototype || !Be(e.append)) return !1;
  const n = Ya(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && Be(e.toString) && e.toString() === "[object FormData]";
}, t1 = lt("URLSearchParams"), [n1, r1, a1, i1] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(lt), s1 = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function kr(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let r, a;
  if (typeof e != "object" && (e = [e]), Kn(e))
    for (r = 0, a = e.length; r < a; r++)
      t.call(null, e[r], r, e);
  else {
    if (Ar(e))
      return;
    const i = n ? Object.getOwnPropertyNames(e) : Object.keys(e), s = i.length;
    let o;
    for (r = 0; r < s; r++)
      o = i[r], t.call(null, e[o], o, e);
  }
}
function Ef(e, t) {
  if (Ar(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length, a;
  for (; r-- > 0; )
    if (a = n[r], t === a.toLowerCase())
      return a;
  return null;
}
const Yt = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, wf = (e) => !Fn(e) && e !== Yt;
function Rs(...e) {
  const { caseless: t, skipUndefined: n } = wf(this) && this || {}, r = {}, a = (i, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const o = t && Ef(r, s) || s, l = Os(r, o) ? r[o] : void 0;
    ma(l) && ma(i) ? r[o] = Rs(l, i) : ma(i) ? r[o] = Rs({}, i) : Kn(i) ? r[o] = i.slice() : (!n || !Fn(i)) && (r[o] = i);
  };
  for (let i = 0, s = e.length; i < s; i++)
    e[i] && kr(e[i], a);
  return r;
}
const o1 = (e, t, n, { allOwnKeys: r } = {}) => (kr(
  t,
  (a, i) => {
    n && Be(a) ? Object.defineProperty(e, i, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: gf(a, n),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, i, {
      __proto__: null,
      value: a,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: r }
), e), c1 = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), l1 = (e, t, n, r) => {
  e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, u1 = (e, t, n, r) => {
  let a, i, s;
  const o = {};
  if (t = t || {}, e == null) return t;
  do {
    for (a = Object.getOwnPropertyNames(e), i = a.length; i-- > 0; )
      s = a[i], (!r || r(s, e, t)) && !o[s] && (t[s] = e[s], o[s] = !0);
    e = n !== !1 && Xa(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, p1 = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const r = e.indexOf(t, n);
  return r !== -1 && r === n;
}, d1 = (e) => {
  if (!e) return null;
  if (Kn(e)) return e;
  let t = e.length;
  if (!_f(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, f1 = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && Xa(Uint8Array)), m1 = (e, t) => {
  const r = (e && e[Wa]).call(e);
  let a;
  for (; (a = r.next()) && !a.done; ) {
    const i = a.value;
    t.call(e, i[0], i[1]);
  }
}, h1 = (e, t) => {
  let n;
  const r = [];
  for (; (n = e.exec(t)) !== null; )
    r.push(n);
  return r;
}, v1 = lt("HTMLFormElement"), y1 = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, r, a) {
  return r.toUpperCase() + a;
}), Os = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), g1 = lt("RegExp"), $f = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), r = {};
  kr(n, (a, i) => {
    let s;
    (s = t(a, i, e)) !== !1 && (r[i] = s || a);
  }), Object.defineProperties(e, r);
}, x1 = (e) => {
  $f(e, (t, n) => {
    if (Be(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const r = e[n];
    if (Be(r)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, b1 = (e, t) => {
  const n = {}, r = (a) => {
    a.forEach((i) => {
      n[i] = !0;
    });
  };
  return Kn(e) ? r(e) : r(String(e).split(t)), n;
}, _1 = () => {
}, E1 = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function w1(e) {
  return !!(e && Be(e.append) && e[xf] === "FormData" && e[Wa]);
}
const $1 = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (r) => {
    if (Pr(r)) {
      if (t.has(r))
        return;
      if (Ar(r))
        return r;
      if (!("toJSON" in r)) {
        t.add(r);
        const a = Kn(r) ? [] : {};
        return kr(r, (i, s) => {
          const o = n(i);
          !Fn(o) && (a[s] = o);
        }), t.delete(r), a;
      }
    }
    return r;
  };
  return n(e);
}, S1 = lt("AsyncFunction"), T1 = (e) => e && (Pr(e) || Be(e)) && Be(e.then) && Be(e.catch), Sf = ((e, t) => e ? setImmediate : t ? ((n, r) => (Yt.addEventListener(
  "message",
  ({ source: a, data: i }) => {
    a === Yt && i === n && r.length && r.shift()();
  },
  !1
), (a) => {
  r.push(a), Yt.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", Be(Yt.postMessage)), R1 = typeof queueMicrotask < "u" ? queueMicrotask.bind(Yt) : typeof process < "u" && process.nextTick || Sf, O1 = (e) => e != null && Be(e[Wa]), A = {
  isArray: Kn,
  isArrayBuffer: bf,
  isBuffer: Ar,
  isFormData: e1,
  isArrayBufferView: qS,
  isString: BS,
  isNumber: _f,
  isBoolean: VS,
  isObject: Pr,
  isPlainObject: ma,
  isEmptyObject: HS,
  isReadableStream: n1,
  isRequest: r1,
  isResponse: a1,
  isHeaders: i1,
  isUndefined: Fn,
  isDate: GS,
  isFile: KS,
  isReactNativeBlob: XS,
  isReactNative: WS,
  isBlob: YS,
  isRegExp: g1,
  isFunction: Be,
  isStream: QS,
  isURLSearchParams: t1,
  isTypedArray: f1,
  isFileList: JS,
  forEach: kr,
  merge: Rs,
  extend: o1,
  trim: s1,
  stripBOM: c1,
  inherits: l1,
  toFlatObject: u1,
  kindOf: Ya,
  kindOfTest: lt,
  endsWith: p1,
  toArray: d1,
  forEachEntry: m1,
  matchAll: h1,
  isHTMLForm: v1,
  hasOwnProperty: Os,
  hasOwnProp: Os,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: $f,
  freezeMethods: x1,
  toObjectSet: b1,
  toCamelCase: y1,
  noop: _1,
  toFiniteNumber: E1,
  findKey: Ef,
  global: Yt,
  isContextDefined: wf,
  isSpecCompliantForm: w1,
  toJSONObject: $1,
  isAsyncFn: S1,
  isThenable: T1,
  setImmediate: Sf,
  asap: R1,
  isIterable: O1
}, A1 = A.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), P1 = (e) => {
  const t = {};
  let n, r, a;
  return e && e.split(`
`).forEach(function(s) {
    a = s.indexOf(":"), n = s.substring(0, a).trim().toLowerCase(), r = s.substring(a + 1).trim(), !(!n || t[n] && A1[n]) && (n === "set-cookie" ? t[n] ? t[n].push(r) : t[n] = [r] : t[n] = t[n] ? t[n] + ", " + r : r);
  }), t;
};
function k1(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const r = e.charCodeAt(t);
    if (r !== 9 && r !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const r = e.charCodeAt(n - 1);
    if (r !== 9 && r !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
const N1 = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), I1 = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function ic(e, t) {
  return A.isArray(e) ? e.map((n) => ic(n, t)) : k1(String(e).replace(t, ""));
}
const j1 = (e) => ic(e, N1), C1 = (e) => ic(e, I1);
function sc(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return A.forEach(e.toJSON(), (n, r) => {
    t[r] = C1(n);
  }), t;
}
const yu = Symbol("internals");
function sr(e) {
  return e && String(e).trim().toLowerCase();
}
function ha(e) {
  return e === !1 || e == null ? e : A.isArray(e) ? e.map(ha) : j1(String(e));
}
function L1(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(e); )
    t[r[1]] = r[2];
  return t;
}
const D1 = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Ui(e, t, n, r, a) {
  if (A.isFunction(r))
    return r.call(this, t, n);
  if (a && (t = n), !!A.isString(t)) {
    if (A.isString(r))
      return t.indexOf(r) !== -1;
    if (A.isRegExp(r))
      return r.test(t);
  }
}
function F1(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function U1(e, t) {
  const n = A.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(a, i, s) {
        return this[r].call(this, t, a, i, s);
      },
      configurable: !0
    });
  });
}
let Te = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const a = this;
    function i(o, l, u) {
      const c = sr(l);
      if (!c)
        throw new Error("header name must be a non-empty string");
      const p = A.findKey(a, c);
      (!p || a[p] === void 0 || u === !0 || u === void 0 && a[p] !== !1) && (a[p || l] = ha(o));
    }
    const s = (o, l) => A.forEach(o, (u, c) => i(u, c, l));
    if (A.isPlainObject(t) || t instanceof this.constructor)
      s(t, n);
    else if (A.isString(t) && (t = t.trim()) && !D1(t))
      s(P1(t), n);
    else if (A.isObject(t) && A.isIterable(t)) {
      let o = {}, l, u;
      for (const c of t) {
        if (!A.isArray(c))
          throw TypeError("Object iterator must return a key-value pair");
        o[u = c[0]] = (l = o[u]) ? A.isArray(l) ? [...l, c[1]] : [l, c[1]] : c[1];
      }
      s(o, n);
    } else
      t != null && i(n, t, r);
    return this;
  }
  get(t, n) {
    if (t = sr(t), t) {
      const r = A.findKey(this, t);
      if (r) {
        const a = this[r];
        if (!n)
          return a;
        if (n === !0)
          return L1(a);
        if (A.isFunction(n))
          return n.call(this, a, r);
        if (A.isRegExp(n))
          return n.exec(a);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = sr(t), t) {
      const r = A.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Ui(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let a = !1;
    function i(s) {
      if (s = sr(s), s) {
        const o = A.findKey(r, s);
        o && (!n || Ui(r, r[o], o, n)) && (delete r[o], a = !0);
      }
    }
    return A.isArray(t) ? t.forEach(i) : i(t), a;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length, a = !1;
    for (; r--; ) {
      const i = n[r];
      (!t || Ui(this, this[i], i, t, !0)) && (delete this[i], a = !0);
    }
    return a;
  }
  normalize(t) {
    const n = this, r = {};
    return A.forEach(this, (a, i) => {
      const s = A.findKey(r, i);
      if (s) {
        n[s] = ha(a), delete n[i];
        return;
      }
      const o = t ? F1(i) : String(i).trim();
      o !== i && delete n[i], n[o] = ha(a), r[o] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return A.forEach(this, (r, a) => {
      r != null && r !== !1 && (n[a] = t && A.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((a) => r.set(a)), r;
  }
  static accessor(t) {
    const r = (this[yu] = this[yu] = {
      accessors: {}
    }).accessors, a = this.prototype;
    function i(s) {
      const o = sr(s);
      r[o] || (U1(a, s), r[o] = !0);
    }
    return A.isArray(t) ? t.forEach(i) : i(t), this;
  }
};
Te.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
A.reduceDescriptors(Te.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    }
  };
});
A.freezeMethods(Te);
const M1 = "[REDACTED ****]";
function z1(e) {
  if (A.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (A.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function q1(e, t) {
  const n = new Set(t.map((i) => String(i).toLowerCase())), r = [], a = (i) => {
    if (i === null || typeof i != "object" || A.isBuffer(i)) return i;
    if (r.indexOf(i) !== -1) return;
    i instanceof Te && (i = i.toJSON()), r.push(i);
    let s;
    if (A.isArray(i))
      s = [], i.forEach((o, l) => {
        const u = a(o);
        A.isUndefined(u) || (s[l] = u);
      });
    else {
      if (!A.isPlainObject(i) && z1(i))
        return r.pop(), i;
      s = /* @__PURE__ */ Object.create(null);
      for (const [o, l] of Object.entries(i)) {
        const u = n.has(o.toLowerCase()) ? M1 : a(l);
        A.isUndefined(u) || (s[o] = u);
      }
    }
    return r.pop(), s;
  };
  return a(e);
}
let G = class Tf extends Error {
  static from(t, n, r, a, i, s) {
    const o = new Tf(t.message, n || t.code, r, a, i);
    return o.cause = t, o.name = t.name, t.status != null && o.status == null && (o.status = t.status), s && Object.assign(o, s), o;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(t, n, r, a, i) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), r && (this.config = r), a && (this.request = a), i && (this.response = i, this.status = i.status);
  }
  toJSON() {
    const t = this.config, n = t && A.hasOwnProp(t, "redact") ? t.redact : void 0, r = A.isArray(n) && n.length > 0 ? q1(t, n) : A.toJSONObject(t);
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: r,
      code: this.code,
      status: this.status
    };
  }
};
G.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
G.ERR_BAD_OPTION = "ERR_BAD_OPTION";
G.ECONNABORTED = "ECONNABORTED";
G.ETIMEDOUT = "ETIMEDOUT";
G.ECONNREFUSED = "ECONNREFUSED";
G.ERR_NETWORK = "ERR_NETWORK";
G.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
G.ERR_DEPRECATED = "ERR_DEPRECATED";
G.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
G.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
G.ERR_CANCELED = "ERR_CANCELED";
G.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
G.ERR_INVALID_URL = "ERR_INVALID_URL";
G.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
var Rf = Ae.Stream, B1 = dn, V1 = ut;
function ut() {
  this.source = null, this.dataSize = 0, this.maxDataSize = 1024 * 1024, this.pauseStream = !0, this._maxDataSizeExceeded = !1, this._released = !1, this._bufferedEvents = [];
}
B1.inherits(ut, Rf);
ut.create = function(e, t) {
  var n = new this();
  t = t || {};
  for (var r in t)
    n[r] = t[r];
  n.source = e;
  var a = e.emit;
  return e.emit = function() {
    return n._handleEmit(arguments), a.apply(e, arguments);
  }, e.on("error", function() {
  }), n.pauseStream && e.pause(), n;
};
Object.defineProperty(ut.prototype, "readable", {
  configurable: !0,
  enumerable: !0,
  get: function() {
    return this.source.readable;
  }
});
ut.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};
ut.prototype.resume = function() {
  this._released || this.release(), this.source.resume();
};
ut.prototype.pause = function() {
  this.source.pause();
};
ut.prototype.release = function() {
  this._released = !0, this._bufferedEvents.forEach((function(e) {
    this.emit.apply(this, e);
  }).bind(this)), this._bufferedEvents = [];
};
ut.prototype.pipe = function() {
  var e = Rf.prototype.pipe.apply(this, arguments);
  return this.resume(), e;
};
ut.prototype._handleEmit = function(e) {
  if (this._released) {
    this.emit.apply(this, e);
    return;
  }
  e[0] === "data" && (this.dataSize += e[1].length, this._checkIfMaxDataSizeExceeded()), this._bufferedEvents.push(e);
};
ut.prototype._checkIfMaxDataSizeExceeded = function() {
  if (!this._maxDataSizeExceeded && !(this.dataSize <= this.maxDataSize)) {
    this._maxDataSizeExceeded = !0;
    var e = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(e));
  }
};
var H1 = dn, Of = Ae.Stream, gu = V1, G1 = ge;
function ge() {
  this.writable = !1, this.readable = !0, this.dataSize = 0, this.maxDataSize = 2 * 1024 * 1024, this.pauseStreams = !0, this._released = !1, this._streams = [], this._currentStream = null, this._insideLoop = !1, this._pendingNext = !1;
}
H1.inherits(ge, Of);
ge.create = function(e) {
  var t = new this();
  e = e || {};
  for (var n in e)
    t[n] = e[n];
  return t;
};
ge.isStreamLike = function(e) {
  return typeof e != "function" && typeof e != "string" && typeof e != "boolean" && typeof e != "number" && !Buffer.isBuffer(e);
};
ge.prototype.append = function(e) {
  var t = ge.isStreamLike(e);
  if (t) {
    if (!(e instanceof gu)) {
      var n = gu.create(e, {
        maxDataSize: 1 / 0,
        pauseStream: this.pauseStreams
      });
      e.on("data", this._checkDataSize.bind(this)), e = n;
    }
    this._handleErrors(e), this.pauseStreams && e.pause();
  }
  return this._streams.push(e), this;
};
ge.prototype.pipe = function(e, t) {
  return Of.prototype.pipe.call(this, e, t), this.resume(), e;
};
ge.prototype._getNext = function() {
  if (this._currentStream = null, this._insideLoop) {
    this._pendingNext = !0;
    return;
  }
  this._insideLoop = !0;
  try {
    do
      this._pendingNext = !1, this._realGetNext();
    while (this._pendingNext);
  } finally {
    this._insideLoop = !1;
  }
};
ge.prototype._realGetNext = function() {
  var e = this._streams.shift();
  if (typeof e > "u") {
    this.end();
    return;
  }
  if (typeof e != "function") {
    this._pipeNext(e);
    return;
  }
  var t = e;
  t((function(n) {
    var r = ge.isStreamLike(n);
    r && (n.on("data", this._checkDataSize.bind(this)), this._handleErrors(n)), this._pipeNext(n);
  }).bind(this));
};
ge.prototype._pipeNext = function(e) {
  this._currentStream = e;
  var t = ge.isStreamLike(e);
  if (t) {
    e.on("end", this._getNext.bind(this)), e.pipe(this, { end: !1 });
    return;
  }
  var n = e;
  this.write(n), this._getNext();
};
ge.prototype._handleErrors = function(e) {
  var t = this;
  e.on("error", function(n) {
    t._emitError(n);
  });
};
ge.prototype.write = function(e) {
  this.emit("data", e);
};
ge.prototype.pause = function() {
  this.pauseStreams && (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function" && this._currentStream.pause(), this.emit("pause"));
};
ge.prototype.resume = function() {
  this._released || (this._released = !0, this.writable = !0, this._getNext()), this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function" && this._currentStream.resume(), this.emit("resume");
};
ge.prototype.end = function() {
  this._reset(), this.emit("end");
};
ge.prototype.destroy = function() {
  this._reset(), this.emit("close");
};
ge.prototype._reset = function() {
  this.writable = !1, this._streams = [], this._currentStream = null;
};
ge.prototype._checkDataSize = function() {
  if (this._updateDataSize(), !(this.dataSize <= this.maxDataSize)) {
    var e = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(e));
  }
};
ge.prototype._updateDataSize = function() {
  this.dataSize = 0;
  var e = this;
  this._streams.forEach(function(t) {
    t.dataSize && (e.dataSize += t.dataSize);
  }), this._currentStream && this._currentStream.dataSize && (this.dataSize += this._currentStream.dataSize);
};
ge.prototype._emitError = function(e) {
  this._reset(), this.emit("error", e);
};
var Af = {};
const K1 = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: !0
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: !0
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: !0
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: !0
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: !0
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: [
      "ez"
    ]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: [
      "aw"
    ]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: !0
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rsat"
    ]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: !0
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: !1
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: !1,
    extensions: [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/calendar+json": {
    source: "iana",
    compressible: !0
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xcs"
    ]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: !0
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: [
      "cdmiq"
    ]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: !0
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: !0
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: !0
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cpl"
    ]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: !0
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/csvm+json": {
    source: "iana",
    compressible: !0
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: [
      "cu"
    ]
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: !0
  },
  "application/dash+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpp"
    ]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "davmount"
    ]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: !0
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: !0
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/dssc+der": {
    source: "iana",
    extensions: [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdssc"
    ]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "iana",
    compressible: !0,
    extensions: [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: !1
  },
  "application/edifact": {
    source: "iana",
    compressible: !1
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/elm+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: !0
  },
  "application/emma+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/epub+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "epub"
    ]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: !0
  },
  "application/express": {
    source: "iana",
    extensions: [
      "exp"
    ]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "fdt"
    ]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/fido.trusted-apps+json": {
    compressible: !0
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: [
      "pfr"
    ]
  },
  "application/font-woff": {
    source: "iana",
    compressible: !1
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/geo+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "gml"
    ]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "gpx"
    ]
  },
  "application/gxf": {
    source: "apache",
    extensions: [
      "gxf"
    ]
  },
  "application/gzip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "gz"
    ]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: !0
  },
  "application/hjson": {
    extensions: [
      "hjson"
    ]
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: [
      "ipfix"
    ]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "its"
    ]
  },
  "application/java-archive": {
    source: "apache",
    compressible: !1,
    extensions: [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: !1,
    extensions: [
      "ser"
    ]
  },
  "application/java-vm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "class"
    ]
  },
  "application/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: !0
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: !0
  },
  "application/jrd+json": {
    source: "iana",
    compressible: !0
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: !0
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: [
      "json5"
    ]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: !0,
    extensions: [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: !0
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: !0
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/ld+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lgr"
    ]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/lost+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: !0
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: !1
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: [
      "cpt"
    ]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mads"
    ]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "webmanifest"
    ]
  },
  "application/marc": {
    source: "iana",
    extensions: [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mrcx"
    ]
  },
  "application/mathematica": {
    source: "iana",
    extensions: [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mbox": {
    source: "iana",
    extensions: [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "meta4"
    ]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mets"
    ]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "musd"
    ]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mods"
    ]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    source: "iana",
    extensions: [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: !0
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/msword": {
    source: "iana",
    compressible: !1,
    extensions: [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    source: "iana",
    compressible: !0
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: [
      "mxf"
    ]
  },
  "application/n-quads": {
    source: "iana",
    extensions: [
      "nq"
    ]
  },
  "application/n-triples": {
    source: "iana",
    extensions: [
      "nt"
    ]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/node": {
    source: "iana",
    extensions: [
      "cjs"
    ]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: !1,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: [
      "oda"
    ]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: !0
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "opf"
    ]
  },
  "application/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "omdoc"
    ]
  },
  "application/onenote": {
    source: "apache",
    extensions: [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: !0
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: [
      "oxps"
    ]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: !1
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "relo"
    ]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xer"
    ]
  },
  "application/pdf": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pdf"
    ]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: [
      "asc"
    ]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: [
      "prf"
    ]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/pkcs10": {
    source: "iana",
    extensions: [
      "p10"
    ]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: [
      "p7s"
    ]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: [
      "ac"
    ]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: [
      "cer"
    ]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: [
      "pki"
    ]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/postscript": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: !0
  },
  "application/problem+json": {
    source: "iana",
    compressible: !0
  },
  "application/problem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: [
      "cww"
    ]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: !1
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: !0
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: !0,
    extensions: [
      "raml"
    ]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: !0
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: [
      "rnc"
    ]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: !0
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rld"
    ]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: [
      "mft"
    ]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: [
      "roa"
    ]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "rsd"
    ]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "rss"
    ]
  },
  "application/rtf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtf"
    ]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: !0
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sarif+json": {
    source: "iana",
    compressible: !0
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: !0
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: !0
  },
  "application/scim+json": {
    source: "iana",
    compressible: !0
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: [
      "spp"
    ]
  },
  "application/sdp": {
    source: "iana",
    extensions: [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: !0
  },
  "application/senml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: !0
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: !0
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: [
      "setpay"
    ]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: [
      "setreg"
    ]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "shf"
    ]
  },
  "application/sieve": {
    source: "iana",
    extensions: [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: !0
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "iana"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sparql-query": {
    source: "iana",
    extensions: [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "srx"
    ]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: !0
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: !0
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: [
      "gram"
    ]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "grxml"
    ]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ssml"
    ]
  },
  "application/stix+json": {
    source: "iana",
    compressible: !0
  },
  "application/swid+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: !0
  },
  "application/taxii+json": {
    source: "iana",
    compressible: !0
  },
  "application/td+json": {
    source: "iana",
    compressible: !0
  },
  "application/tei+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: !0
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: !0,
    extensions: [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: [
      "trig"
    ]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: !1,
    extensions: [
      "ubj"
    ]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vcard+json": {
    source: "iana",
    compressible: !0
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: !1,
    extensions: [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    source: "iana",
    extensions: [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    source: "iana"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: !1,
    extensions: [
      "apk"
    ]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    compressible: !1,
    extensions: [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    source: "iana"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "iana",
    extensions: [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    source: "iana",
    extensions: [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    source: "iana",
    extensions: [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geo+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geocube+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    compressible: !1,
    extensions: [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    compressible: !1,
    extensions: [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: !1,
    extensions: [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: !1,
    extensions: [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "iana"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    source: "iana",
    extensions: [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.informix-visionary": {
    source: "iana"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: [
      "sse"
    ]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: !1
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: !0,
    extensions: [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: !0
  },
  "application/vnd.ms-outlook": {
    compressible: !1,
    extensions: [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: !0
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "iana",
    extensions: [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: !1,
    extensions: [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: [
      "oth"
    ]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: !1,
    extensions: [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: !1,
    extensions: [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: !1,
    extensions: [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: [
      "st"
    ]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: [
      "sema"
    ]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: [
      "semd"
    ]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: [
      "umj"
    ]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: !0
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    source: "iana"
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: !0
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: !0
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: [
      "wgt"
    ]
  },
  "application/winhlp": {
    source: "apache",
    extensions: [
      "hlp"
    ]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: !1,
    extensions: [
      "7z"
    ]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: [
      "ace"
    ]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: [
      "dmg"
    ]
  },
  "application/x-arj": {
    compressible: !1,
    extensions: [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: [
      "aas"
    ]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    compressible: !1,
    extensions: [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: [
      "torrent"
    ]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: !1,
    extensions: [
      "bz"
    ]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: !1,
    extensions: [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: [
      "cfs"
    ]
  },
  "application/x-chat": {
    source: "apache",
    extensions: [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    extensions: [
      "crx"
    ]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: [
      "cco"
    ]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: [
      "nsc"
    ]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: [
      "cpio"
    ]
  },
  "application/x-csh": {
    source: "apache",
    extensions: [
      "csh"
    ]
  },
  "application/x-deb": {
    compressible: !1
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: [
      "dgc"
    ]
  },
  "application/x-director": {
    source: "apache",
    extensions: [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    source: "apache",
    extensions: [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "res"
    ]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: !1,
    extensions: [
      "dvi"
    ]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: [
      "evy"
    ]
  },
  "application/x-eva": {
    source: "apache",
    extensions: [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: [
      "gca"
    ]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: [
      "gramps"
    ]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: [
      "gtar"
    ]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    compressible: !0,
    extensions: [
      "php"
    ]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: !1,
    extensions: [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    compressible: !0
  },
  "application/x-keepass2": {
    extensions: [
      "kdbx"
    ]
  },
  "application/x-latex": {
    source: "apache",
    compressible: !1,
    extensions: [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    extensions: [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: [
      "run"
    ]
  },
  "application/x-mie": {
    source: "apache",
    extensions: [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    compressible: !1
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: [
      "crd"
    ]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    extensions: [
      "exe"
    ]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: [
      "pub"
    ]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: [
      "scd"
    ]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: [
      "trm"
    ]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: [
      "wri"
    ]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: !0,
    extensions: [
      "pac"
    ]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: [
      "nzb"
    ]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: !1,
    extensions: [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: !1,
    extensions: [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: [
      "ris"
    ]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: [
      "sea"
    ]
  },
  "application/x-sh": {
    source: "apache",
    compressible: !0,
    extensions: [
      "sh"
    ]
  },
  "application/x-shar": {
    source: "apache",
    extensions: [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: !1,
    extensions: [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: [
      "xap"
    ]
  },
  "application/x-sql": {
    source: "apache",
    extensions: [
      "sql"
    ]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: !1,
    extensions: [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: [
      "sitx"
    ]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: [
      "t3"
    ]
  },
  "application/x-tads": {
    source: "apache",
    extensions: [
      "gam"
    ]
  },
  "application/x-tar": {
    source: "apache",
    compressible: !0,
    extensions: [
      "tar"
    ]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    source: "apache",
    extensions: [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: [
      "obj"
    ]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    compressible: !0,
    extensions: [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    compressible: !0,
    extensions: [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    compressible: !0,
    extensions: [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    compressible: !0,
    extensions: [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: !1,
    extensions: [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    compressible: !0,
    extensions: [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    compressible: !0,
    extensions: [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    compressible: !0,
    extensions: [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    compressible: !0,
    extensions: [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: !0
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: !1,
    extensions: [
      "xpi"
    ]
  },
  "application/x-xz": {
    source: "apache",
    extensions: [
      "xz"
    ]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: !0
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xlf"
    ]
  },
  "application/xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: !0
  },
  "application/xop+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xop"
    ]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: !0,
    extensions: [
      "xspf"
    ]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    source: "iana",
    extensions: [
      "yang"
    ]
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: !0
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: !0
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: !0
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: !0
  },
  "application/yin+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "yin"
    ]
  },
  "application/zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "zip"
    ]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: !1,
    extensions: [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana"
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: [
      "adp"
    ]
  },
  "audio/amr": {
    source: "iana",
    extensions: [
      "amr"
    ]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: !1,
    extensions: [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: !1
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: [
      "mxmf"
    ]
  },
  "audio/mp3": {
    compressible: !1,
    extensions: [
      "mp3"
    ]
  },
  "audio/mp4": {
    source: "iana",
    compressible: !1,
    extensions: [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: [
      "s3m"
    ]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: [
      "sil"
    ]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    compressible: !1
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: !1
  },
  "audio/vorbis": {
    source: "iana",
    compressible: !1
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: !1,
    extensions: [
      "wav"
    ]
  },
  "audio/wave": {
    compressible: !1,
    extensions: [
      "wav"
    ]
  },
  "audio/webm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "weba"
    ]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: !1,
    extensions: [
      "aac"
    ]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: !1,
    extensions: [
      "caf"
    ]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: [
      "flac"
    ]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: [
      "ra"
    ]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: [
      "wav"
    ]
  },
  "audio/xm": {
    source: "apache",
    extensions: [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: [
      "cml"
    ]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: [
      "xyz"
    ]
  },
  "font/collection": {
    source: "iana",
    extensions: [
      "ttc"
    ]
  },
  "font/otf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "otf"
    ]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ttf"
    ]
  },
  "font/woff": {
    source: "iana",
    extensions: [
      "woff"
    ]
  },
  "font/woff2": {
    source: "iana",
    extensions: [
      "woff2"
    ]
  },
  "image/aces": {
    source: "iana",
    extensions: [
      "exr"
    ]
  },
  "image/apng": {
    compressible: !1,
    extensions: [
      "apng"
    ]
  },
  "image/avci": {
    source: "iana",
    extensions: [
      "avci"
    ]
  },
  "image/avcs": {
    source: "iana",
    extensions: [
      "avcs"
    ]
  },
  "image/avif": {
    source: "iana",
    compressible: !1,
    extensions: [
      "avif"
    ]
  },
  "image/bmp": {
    source: "iana",
    compressible: !0,
    extensions: [
      "bmp"
    ]
  },
  "image/cgm": {
    source: "iana",
    extensions: [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: [
      "drle"
    ]
  },
  "image/emf": {
    source: "iana",
    extensions: [
      "emf"
    ]
  },
  "image/fits": {
    source: "iana",
    extensions: [
      "fits"
    ]
  },
  "image/g3fax": {
    source: "iana",
    extensions: [
      "g3"
    ]
  },
  "image/gif": {
    source: "iana",
    compressible: !1,
    extensions: [
      "gif"
    ]
  },
  "image/heic": {
    source: "iana",
    extensions: [
      "heic"
    ]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: [
      "heics"
    ]
  },
  "image/heif": {
    source: "iana",
    extensions: [
      "heif"
    ]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: [
      "heifs"
    ]
  },
  "image/hej2k": {
    source: "iana",
    extensions: [
      "hej2"
    ]
  },
  "image/hsj2": {
    source: "iana",
    extensions: [
      "hsj2"
    ]
  },
  "image/ief": {
    source: "iana",
    extensions: [
      "ief"
    ]
  },
  "image/jls": {
    source: "iana",
    extensions: [
      "jls"
    ]
  },
  "image/jp2": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    source: "iana",
    extensions: [
      "jph"
    ]
  },
  "image/jphc": {
    source: "iana",
    extensions: [
      "jhc"
    ]
  },
  "image/jpm": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpm"
    ]
  },
  "image/jpx": {
    source: "iana",
    compressible: !1,
    extensions: [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    source: "iana",
    extensions: [
      "jxr"
    ]
  },
  "image/jxra": {
    source: "iana",
    extensions: [
      "jxra"
    ]
  },
  "image/jxrs": {
    source: "iana",
    extensions: [
      "jxrs"
    ]
  },
  "image/jxs": {
    source: "iana",
    extensions: [
      "jxs"
    ]
  },
  "image/jxsc": {
    source: "iana",
    extensions: [
      "jxsc"
    ]
  },
  "image/jxsi": {
    source: "iana",
    extensions: [
      "jxsi"
    ]
  },
  "image/jxss": {
    source: "iana",
    extensions: [
      "jxss"
    ]
  },
  "image/ktx": {
    source: "iana",
    extensions: [
      "ktx"
    ]
  },
  "image/ktx2": {
    source: "iana",
    extensions: [
      "ktx2"
    ]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: !1
  },
  "image/png": {
    source: "iana",
    compressible: !1,
    extensions: [
      "png"
    ]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: [
      "btif"
    ]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: [
      "pti"
    ]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: [
      "sgi"
    ]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    source: "iana",
    extensions: [
      "t38"
    ]
  },
  "image/tiff": {
    source: "iana",
    compressible: !1,
    extensions: [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: !0,
    extensions: [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: !0,
    extensions: [
      "ico"
    ]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana"
  },
  "image/vnd.ms-dds": {
    compressible: !0,
    extensions: [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: [
      "pcx"
    ]
  },
  "image/webp": {
    source: "apache",
    extensions: [
      "webp"
    ]
  },
  "image/wmf": {
    source: "iana",
    extensions: [
      "wmf"
    ]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: [
      "ras"
    ]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: [
      "cmx"
    ]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    source: "apache",
    compressible: !0,
    extensions: [
      "ico"
    ]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: !0,
    extensions: [
      "bmp"
    ]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: [
      "pcx"
    ]
  },
  "image/x-pict": {
    source: "apache",
    extensions: [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: [
      "ppm"
    ]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: [
      "rgb"
    ]
  },
  "image/x-tga": {
    source: "apache",
    extensions: [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: [
      "xbm"
    ]
  },
  "image/x-xcf": {
    compressible: !1
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: [
      "xwd"
    ]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    source: "iana",
    extensions: [
      "u8hdr"
    ]
  },
  "message/http": {
    source: "iana",
    compressible: !1
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: !0
  },
  "message/news": {
    source: "iana"
  },
  "message/partial": {
    source: "iana",
    compressible: !1
  },
  "message/rfc822": {
    source: "iana",
    compressible: !0,
    extensions: [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    source: "iana"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "iana"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: [
      "wsc"
    ]
  },
  "model/3mf": {
    source: "iana",
    extensions: [
      "3mf"
    ]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: !0,
    extensions: [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: !0,
    extensions: [
      "glb"
    ]
  },
  "model/iges": {
    source: "iana",
    compressible: !1,
    extensions: [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    source: "iana",
    compressible: !1,
    extensions: [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    source: "iana",
    extensions: [
      "mtl"
    ]
  },
  "model/obj": {
    source: "iana",
    extensions: [
      "obj"
    ]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "stpx"
    ]
  },
  "model/step+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "stpxz"
    ]
  },
  "model/stl": {
    source: "iana",
    extensions: [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: !0
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    source: "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: !1,
    extensions: [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: [
      "vtu"
    ]
  },
  "model/vrml": {
    source: "iana",
    compressible: !1,
    extensions: [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: !1,
    extensions: [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: !1,
    extensions: [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: !1
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: !1
  },
  "multipart/form-data": {
    source: "iana",
    compressible: !1
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: !1
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: !1
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: !0,
    extensions: [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    source: "iana",
    extensions: [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    compressible: !0
  },
  "text/cmd": {
    compressible: !0
  },
  "text/coffeescript": {
    extensions: [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "css"
    ]
  },
  "text/csv": {
    source: "iana",
    compressible: !0,
    extensions: [
      "csv"
    ]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "iana"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: !0,
    extensions: [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    extensions: [
      "jade"
    ]
  },
  "text/javascript": {
    source: "iana",
    compressible: !0
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: !0,
    extensions: [
      "jsx"
    ]
  },
  "text/less": {
    compressible: !0,
    extensions: [
      "less"
    ]
  },
  "text/markdown": {
    source: "iana",
    compressible: !0,
    extensions: [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    source: "nginx",
    extensions: [
      "mml"
    ]
  },
  "text/mdx": {
    compressible: !0,
    extensions: [
      "mdx"
    ]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "n3"
    ]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: !0,
    extensions: [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtx"
    ]
  },
  "text/rtf": {
    source: "iana",
    compressible: !0,
    extensions: [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: [
      "shex"
    ]
  },
  "text/slim": {
    extensions: [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    source: "iana",
    extensions: [
      "spdx"
    ]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: !0,
    extensions: [
      "tsv"
    ]
  },
  "text/troff": {
    source: "iana",
    extensions: [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "ttl"
    ]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: !0,
    extensions: [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    source: "iana",
    compressible: !0,
    extensions: [
      "vcard"
    ]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: [
      "flx"
    ]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: [
      "gv"
    ]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "iana"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: [
      "wmls"
    ]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: !0,
    extensions: [
      "vtt"
    ]
  },
  "text/x-asm": {
    source: "apache",
    extensions: [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    source: "apache",
    extensions: [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    source: "nginx",
    extensions: [
      "htc"
    ]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    compressible: !0
  },
  "text/x-handlebars-template": {
    extensions: [
      "hbs"
    ]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    compressible: !0
  },
  "text/x-lua": {
    extensions: [
      "lua"
    ]
  },
  "text/x-markdown": {
    compressible: !0,
    extensions: [
      "mkd"
    ]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: [
      "nfo"
    ]
  },
  "text/x-opml": {
    source: "apache",
    extensions: [
      "opml"
    ]
  },
  "text/x-org": {
    compressible: !0,
    extensions: [
      "org"
    ]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    compressible: !0,
    extensions: [
      "pde"
    ]
  },
  "text/x-sass": {
    extensions: [
      "sass"
    ]
  },
  "text/x-scss": {
    extensions: [
      "scss"
    ]
  },
  "text/x-setext": {
    source: "apache",
    extensions: [
      "etx"
    ]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    compressible: !0,
    extensions: [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: [
      "vcs"
    ]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: [
      "vcf"
    ]
  },
  "text/xml": {
    source: "iana",
    compressible: !0,
    extensions: [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: !0,
    extensions: [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: [
      "3g2"
    ]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: [
      "h261"
    ]
  },
  "video/h263": {
    source: "iana",
    extensions: [
      "h263"
    ]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: [
      "m4s"
    ]
  },
  "video/jpeg": {
    source: "iana",
    extensions: [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: [
      "ts"
    ]
  },
  "video/mp4": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: !1,
    extensions: [
      "ogv"
    ]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: !1,
    extensions: [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: !1,
    extensions: [
      "webm"
    ]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: [
      "f4v"
    ]
  },
  "video/x-fli": {
    source: "apache",
    extensions: [
      "fli"
    ]
  },
  "video/x-flv": {
    source: "apache",
    compressible: !1,
    extensions: [
      "flv"
    ]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: [
      "m4v"
    ]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: !1,
    extensions: [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    source: "apache",
    extensions: [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: !1,
    extensions: [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: [
      "movie"
    ]
  },
  "video/x-smv": {
    source: "apache",
    extensions: [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    compressible: !0
  },
  "x-shader/x-vertex": {
    compressible: !0
  }
};
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
var X1 = K1;
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
(function(e) {
  var t = X1, n = Ve.extname, r = /^\s*([^;\s]*)(?:;|\s|$)/, a = /^text\//i;
  e.charset = i, e.charsets = { lookup: i }, e.contentType = s, e.extension = o, e.extensions = /* @__PURE__ */ Object.create(null), e.lookup = l, e.types = /* @__PURE__ */ Object.create(null), u(e.extensions, e.types);
  function i(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = r.exec(c), f = p && t[p[1].toLowerCase()];
    return f && f.charset ? f.charset : p && a.test(p[1]) ? "UTF-8" : !1;
  }
  function s(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = c.indexOf("/") === -1 ? e.lookup(c) : c;
    if (!p)
      return !1;
    if (p.indexOf("charset") === -1) {
      var f = e.charset(p);
      f && (p += "; charset=" + f.toLowerCase());
    }
    return p;
  }
  function o(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = r.exec(c), f = p && e.extensions[p[1].toLowerCase()];
    return !f || !f.length ? !1 : f[0];
  }
  function l(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = n("x." + c).toLowerCase().substr(1);
    return p && e.types[p] || !1;
  }
  function u(c, p) {
    var f = ["nginx", "apache", void 0, "iana"];
    Object.keys(t).forEach(function(g) {
      var m = t[g], v = m.extensions;
      if (!(!v || !v.length)) {
        c[g] = v;
        for (var d = 0; d < v.length; d++) {
          var y = v[d];
          if (p[y]) {
            var _ = f.indexOf(t[p[y]].source), x = f.indexOf(m.source);
            if (p[y] !== "application/octet-stream" && (_ > x || _ === x && p[y].substr(0, 12) === "application/"))
              continue;
          }
          p[y] = g;
        }
      }
    });
  }
})(Af);
var W1 = Y1;
function Y1(e) {
  var t = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
  t ? t(e) : setTimeout(e, 0);
}
var xu = W1, Pf = J1;
function J1(e) {
  var t = !1;
  return xu(function() {
    t = !0;
  }), function(r, a) {
    t ? e(r, a) : xu(function() {
      e(r, a);
    });
  };
}
var kf = Q1;
function Q1(e) {
  Object.keys(e.jobs).forEach(Z1.bind(e)), e.jobs = {};
}
function Z1(e) {
  typeof this.jobs[e] == "function" && this.jobs[e]();
}
var bu = Pf, eT = kf, Nf = tT;
function tT(e, t, n, r) {
  var a = n.keyedList ? n.keyedList[n.index] : n.index;
  n.jobs[a] = nT(t, a, e[a], function(i, s) {
    a in n.jobs && (delete n.jobs[a], i ? eT(n) : n.results[a] = s, r(i, n.results));
  });
}
function nT(e, t, n, r) {
  var a;
  return e.length == 2 ? a = e(n, bu(r)) : a = e(n, t, bu(r)), a;
}
var If = rT;
function rT(e, t) {
  var n = !Array.isArray(e), r = {
    index: 0,
    keyedList: n || t ? Object.keys(e) : null,
    jobs: {},
    results: n ? {} : [],
    size: n ? Object.keys(e).length : e.length
  };
  return t && r.keyedList.sort(n ? t : function(a, i) {
    return t(e[a], e[i]);
  }), r;
}
var aT = kf, iT = Pf, jf = sT;
function sT(e) {
  Object.keys(this.jobs).length && (this.index = this.size, aT(this), iT(e)(null, this.results));
}
var oT = Nf, cT = If, lT = jf, uT = pT;
function pT(e, t, n) {
  for (var r = cT(e); r.index < (r.keyedList || e).length; )
    oT(e, t, r, function(a, i) {
      if (a) {
        n(a, i);
        return;
      }
      if (Object.keys(r.jobs).length === 0) {
        n(null, r.results);
        return;
      }
    }), r.index++;
  return lT.bind(r, n);
}
var Qa = { exports: {} }, _u = Nf, dT = If, fT = jf;
Qa.exports = mT;
Qa.exports.ascending = Cf;
Qa.exports.descending = hT;
function mT(e, t, n, r) {
  var a = dT(e, n);
  return _u(e, t, a, function i(s, o) {
    if (s) {
      r(s, o);
      return;
    }
    if (a.index++, a.index < (a.keyedList || e).length) {
      _u(e, t, a, i);
      return;
    }
    r(null, a.results);
  }), fT.bind(a, r);
}
function Cf(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
function hT(e, t) {
  return -1 * Cf(e, t);
}
var Lf = Qa.exports, vT = Lf, yT = gT;
function gT(e, t, n) {
  return vT(e, t, null, n);
}
var xT = {
  parallel: uT,
  serial: yT,
  serialOrdered: Lf
}, Df = Object, bT = Error, _T = EvalError, ET = RangeError, wT = ReferenceError, $T = SyntaxError, Mi, Eu;
function oc() {
  return Eu || (Eu = 1, Mi = TypeError), Mi;
}
var ST = URIError, TT = Math.abs, RT = Math.floor, OT = Math.max, AT = Math.min, PT = Math.pow, kT = Math.round, NT = Number.isNaN || function(t) {
  return t !== t;
}, IT = NT, jT = function(t) {
  return IT(t) || t === 0 ? t : t < 0 ? -1 : 1;
}, CT = Object.getOwnPropertyDescriptor, va = CT;
if (va)
  try {
    va([], "length");
  } catch {
    va = null;
  }
var Ff = va, ya = Object.defineProperty || !1;
if (ya)
  try {
    ya({}, "a", { value: 1 });
  } catch {
    ya = !1;
  }
var LT = ya, zi, wu;
function Uf() {
  return wu || (wu = 1, zi = function() {
    if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
      return !1;
    if (typeof Symbol.iterator == "symbol")
      return !0;
    var t = {}, n = Symbol("test"), r = Object(n);
    if (typeof n == "string" || Object.prototype.toString.call(n) !== "[object Symbol]" || Object.prototype.toString.call(r) !== "[object Symbol]")
      return !1;
    var a = 42;
    t[n] = a;
    for (var i in t)
      return !1;
    if (typeof Object.keys == "function" && Object.keys(t).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(t).length !== 0)
      return !1;
    var s = Object.getOwnPropertySymbols(t);
    if (s.length !== 1 || s[0] !== n || !Object.prototype.propertyIsEnumerable.call(t, n))
      return !1;
    if (typeof Object.getOwnPropertyDescriptor == "function") {
      var o = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(t, n)
      );
      if (o.value !== a || o.enumerable !== !0)
        return !1;
    }
    return !0;
  }), zi;
}
var qi, $u;
function DT() {
  if ($u) return qi;
  $u = 1;
  var e = typeof Symbol < "u" && Symbol, t = Uf();
  return qi = function() {
    return typeof e != "function" || typeof Symbol != "function" || typeof e("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : t();
  }, qi;
}
var Bi, Su;
function Mf() {
  return Su || (Su = 1, Bi = typeof Reflect < "u" && Reflect.getPrototypeOf || null), Bi;
}
var Vi, Tu;
function zf() {
  if (Tu) return Vi;
  Tu = 1;
  var e = Df;
  return Vi = e.getPrototypeOf || null, Vi;
}
var FT = "Function.prototype.bind called on incompatible ", UT = Object.prototype.toString, MT = Math.max, zT = "[object Function]", Ru = function(t, n) {
  for (var r = [], a = 0; a < t.length; a += 1)
    r[a] = t[a];
  for (var i = 0; i < n.length; i += 1)
    r[i + t.length] = n[i];
  return r;
}, qT = function(t, n) {
  for (var r = [], a = n, i = 0; a < t.length; a += 1, i += 1)
    r[i] = t[a];
  return r;
}, BT = function(e, t) {
  for (var n = "", r = 0; r < e.length; r += 1)
    n += e[r], r + 1 < e.length && (n += t);
  return n;
}, VT = function(t) {
  var n = this;
  if (typeof n != "function" || UT.apply(n) !== zT)
    throw new TypeError(FT + n);
  for (var r = qT(arguments, 1), a, i = function() {
    if (this instanceof a) {
      var c = n.apply(
        this,
        Ru(r, arguments)
      );
      return Object(c) === c ? c : this;
    }
    return n.apply(
      t,
      Ru(r, arguments)
    );
  }, s = MT(0, n.length - r.length), o = [], l = 0; l < s; l++)
    o[l] = "$" + l;
  if (a = Function("binder", "return function (" + BT(o, ",") + "){ return binder.apply(this,arguments); }")(i), n.prototype) {
    var u = function() {
    };
    u.prototype = n.prototype, a.prototype = new u(), u.prototype = null;
  }
  return a;
}, HT = VT, Za = Function.prototype.bind || HT, Hi, Ou;
function cc() {
  return Ou || (Ou = 1, Hi = Function.prototype.call), Hi;
}
var Gi, Au;
function qf() {
  return Au || (Au = 1, Gi = Function.prototype.apply), Gi;
}
var Ki, Pu;
function GT() {
  return Pu || (Pu = 1, Ki = typeof Reflect < "u" && Reflect && Reflect.apply), Ki;
}
var Xi, ku;
function KT() {
  if (ku) return Xi;
  ku = 1;
  var e = Za, t = qf(), n = cc(), r = GT();
  return Xi = r || e.call(n, t), Xi;
}
var Wi, Nu;
function XT() {
  if (Nu) return Wi;
  Nu = 1;
  var e = Za, t = oc(), n = cc(), r = KT();
  return Wi = function(i) {
    if (i.length < 1 || typeof i[0] != "function")
      throw new t("a function is required");
    return r(e, n, i);
  }, Wi;
}
var Yi, Iu;
function WT() {
  if (Iu) return Yi;
  Iu = 1;
  var e = XT(), t = Ff, n;
  try {
    n = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (s) {
    if (!s || typeof s != "object" || !("code" in s) || s.code !== "ERR_PROTO_ACCESS")
      throw s;
  }
  var r = !!n && t && t(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  ), a = Object, i = a.getPrototypeOf;
  return Yi = r && typeof r.get == "function" ? e([r.get]) : typeof i == "function" ? (
    /** @type {import('./get')} */
    function(o) {
      return i(o == null ? o : a(o));
    }
  ) : !1, Yi;
}
var Ji, ju;
function YT() {
  if (ju) return Ji;
  ju = 1;
  var e = Mf(), t = zf(), n = WT();
  return Ji = e ? function(a) {
    return e(a);
  } : t ? function(a) {
    if (!a || typeof a != "object" && typeof a != "function")
      throw new TypeError("getProto: not an object");
    return t(a);
  } : n ? function(a) {
    return n(a);
  } : null, Ji;
}
var JT = Function.prototype.call, QT = Object.prototype.hasOwnProperty, ZT = Za, lc = ZT.call(JT, QT), se, eR = Df, tR = bT, nR = _T, rR = ET, aR = wT, Un = $T, Nn = oc(), iR = ST, sR = TT, oR = RT, cR = OT, lR = AT, uR = PT, pR = kT, dR = jT, Bf = Function, Qi = function(e) {
  try {
    return Bf('"use strict"; return (' + e + ").constructor;")();
  } catch {
  }
}, br = Ff, fR = LT, Zi = function() {
  throw new Nn();
}, mR = br ? function() {
  try {
    return arguments.callee, Zi;
  } catch {
    try {
      return br(arguments, "callee").get;
    } catch {
      return Zi;
    }
  }
}() : Zi, _n = DT()(), Se = YT(), hR = zf(), vR = Mf(), Vf = qf(), Nr = cc(), $n = {}, yR = typeof Uint8Array > "u" || !Se ? se : Se(Uint8Array), tn = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError > "u" ? se : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? se : ArrayBuffer,
  "%ArrayIteratorPrototype%": _n && Se ? Se([][Symbol.iterator]()) : se,
  "%AsyncFromSyncIteratorPrototype%": se,
  "%AsyncFunction%": $n,
  "%AsyncGenerator%": $n,
  "%AsyncGeneratorFunction%": $n,
  "%AsyncIteratorPrototype%": $n,
  "%Atomics%": typeof Atomics > "u" ? se : Atomics,
  "%BigInt%": typeof BigInt > "u" ? se : BigInt,
  "%BigInt64Array%": typeof BigInt64Array > "u" ? se : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array > "u" ? se : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView > "u" ? se : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": tR,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": nR,
  "%Float16Array%": typeof Float16Array > "u" ? se : Float16Array,
  "%Float32Array%": typeof Float32Array > "u" ? se : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? se : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? se : FinalizationRegistry,
  "%Function%": Bf,
  "%GeneratorFunction%": $n,
  "%Int8Array%": typeof Int8Array > "u" ? se : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? se : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? se : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": _n && Se ? Se(Se([][Symbol.iterator]())) : se,
  "%JSON%": typeof JSON == "object" ? JSON : se,
  "%Map%": typeof Map > "u" ? se : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !_n || !Se ? se : Se((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": eR,
  "%Object.getOwnPropertyDescriptor%": br,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? se : Promise,
  "%Proxy%": typeof Proxy > "u" ? se : Proxy,
  "%RangeError%": rR,
  "%ReferenceError%": aR,
  "%Reflect%": typeof Reflect > "u" ? se : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? se : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !_n || !Se ? se : Se((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? se : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": _n && Se ? Se(""[Symbol.iterator]()) : se,
  "%Symbol%": _n ? Symbol : se,
  "%SyntaxError%": Un,
  "%ThrowTypeError%": mR,
  "%TypedArray%": yR,
  "%TypeError%": Nn,
  "%Uint8Array%": typeof Uint8Array > "u" ? se : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? se : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? se : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? se : Uint32Array,
  "%URIError%": iR,
  "%WeakMap%": typeof WeakMap > "u" ? se : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? se : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? se : WeakSet,
  "%Function.prototype.call%": Nr,
  "%Function.prototype.apply%": Vf,
  "%Object.defineProperty%": fR,
  "%Object.getPrototypeOf%": hR,
  "%Math.abs%": sR,
  "%Math.floor%": oR,
  "%Math.max%": cR,
  "%Math.min%": lR,
  "%Math.pow%": uR,
  "%Math.round%": pR,
  "%Math.sign%": dR,
  "%Reflect.getPrototypeOf%": vR
};
if (Se)
  try {
    null.error;
  } catch (e) {
    var gR = Se(Se(e));
    tn["%Error.prototype%"] = gR;
  }
var xR = function e(t) {
  var n;
  if (t === "%AsyncFunction%")
    n = Qi("async function () {}");
  else if (t === "%GeneratorFunction%")
    n = Qi("function* () {}");
  else if (t === "%AsyncGeneratorFunction%")
    n = Qi("async function* () {}");
  else if (t === "%AsyncGenerator%") {
    var r = e("%AsyncGeneratorFunction%");
    r && (n = r.prototype);
  } else if (t === "%AsyncIteratorPrototype%") {
    var a = e("%AsyncGenerator%");
    a && Se && (n = Se(a.prototype));
  }
  return tn[t] = n, n;
}, Cu = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
}, Ir = Za, Sa = lc, bR = Ir.call(Nr, Array.prototype.concat), _R = Ir.call(Vf, Array.prototype.splice), Lu = Ir.call(Nr, String.prototype.replace), Ta = Ir.call(Nr, String.prototype.slice), ER = Ir.call(Nr, RegExp.prototype.exec), wR = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, $R = /\\(\\)?/g, SR = function(t) {
  var n = Ta(t, 0, 1), r = Ta(t, -1);
  if (n === "%" && r !== "%")
    throw new Un("invalid intrinsic syntax, expected closing `%`");
  if (r === "%" && n !== "%")
    throw new Un("invalid intrinsic syntax, expected opening `%`");
  var a = [];
  return Lu(t, wR, function(i, s, o, l) {
    a[a.length] = o ? Lu(l, $R, "$1") : s || i;
  }), a;
}, TR = function(t, n) {
  var r = t, a;
  if (Sa(Cu, r) && (a = Cu[r], r = "%" + a[0] + "%"), Sa(tn, r)) {
    var i = tn[r];
    if (i === $n && (i = xR(r)), typeof i > "u" && !n)
      throw new Nn("intrinsic " + t + " exists, but is not available. Please file an issue!");
    return {
      alias: a,
      name: r,
      value: i
    };
  }
  throw new Un("intrinsic " + t + " does not exist!");
}, RR = function(t, n) {
  if (typeof t != "string" || t.length === 0)
    throw new Nn("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof n != "boolean")
    throw new Nn('"allowMissing" argument must be a boolean');
  if (ER(/^%?[^%]*%?$/, t) === null)
    throw new Un("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var r = SR(t), a = r.length > 0 ? r[0] : "", i = TR("%" + a + "%", n), s = i.name, o = i.value, l = !1, u = i.alias;
  u && (a = u[0], _R(r, bR([0, 1], u)));
  for (var c = 1, p = !0; c < r.length; c += 1) {
    var f = r[c], h = Ta(f, 0, 1), g = Ta(f, -1);
    if ((h === '"' || h === "'" || h === "`" || g === '"' || g === "'" || g === "`") && h !== g)
      throw new Un("property names with quotes must have matching quotes");
    if ((f === "constructor" || !p) && (l = !0), a += "." + f, s = "%" + a + "%", Sa(tn, s))
      o = tn[s];
    else if (o != null) {
      if (!(f in o)) {
        if (!n)
          throw new Nn("base intrinsic for " + t + " exists, but the property is not available.");
        return;
      }
      if (br && c + 1 >= r.length) {
        var m = br(o, f);
        p = !!m, p && "get" in m && !("originalValue" in m.get) ? o = m.get : o = o[f];
      } else
        p = Sa(o, f), o = o[f];
      p && !l && (tn[s] = o);
    }
  }
  return o;
}, es, Du;
function OR() {
  if (Du) return es;
  Du = 1;
  var e = Uf();
  return es = function() {
    return e() && !!Symbol.toStringTag;
  }, es;
}
var AR = RR, Fu = AR("%Object.defineProperty%", !0), PR = OR()(), kR = lc, NR = oc(), ra = PR ? Symbol.toStringTag : null, IR = function(t, n) {
  var r = arguments.length > 2 && !!arguments[2] && arguments[2].force, a = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
  if (typeof r < "u" && typeof r != "boolean" || typeof a < "u" && typeof a != "boolean")
    throw new NR("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
  ra && (r || !kR(t, ra)) && (Fu ? Fu(t, ra, {
    configurable: !a,
    enumerable: !1,
    value: n,
    writable: !1
  }) : t[ra] = n);
}, jR = function(e, t) {
  return Object.keys(t).forEach(function(n) {
    e[n] = e[n] || t[n];
  }), e;
}, uc = G1, CR = dn, ts = Ve, LR = qs, DR = Bs, FR = Pa.parse, UR = vt, MR = Ae.Stream, zR = xp, ns = Af, qR = xT, BR = IR, Mt = lc, As = jR;
function oe(e) {
  if (!(this instanceof oe))
    return new oe(e);
  this._overheadLength = 0, this._valueLength = 0, this._valuesToMeasure = [], uc.call(this), e = e || {};
  for (var t in e)
    this[t] = e[t];
}
CR.inherits(oe, uc);
oe.LINE_BREAK = `\r
`;
oe.DEFAULT_CONTENT_TYPE = "application/octet-stream";
oe.prototype.append = function(e, t, n) {
  n = n || {}, typeof n == "string" && (n = { filename: n });
  var r = uc.prototype.append.bind(this);
  if ((typeof t == "number" || t == null) && (t = String(t)), Array.isArray(t)) {
    this._error(new Error("Arrays are not supported."));
    return;
  }
  var a = this._multiPartHeader(e, t, n), i = this._multiPartFooter();
  r(a), r(t), r(i), this._trackLength(a, t, n);
};
oe.prototype._trackLength = function(e, t, n) {
  var r = 0;
  n.knownLength != null ? r += Number(n.knownLength) : Buffer.isBuffer(t) ? r = t.length : typeof t == "string" && (r = Buffer.byteLength(t)), this._valueLength += r, this._overheadLength += Buffer.byteLength(e) + oe.LINE_BREAK.length, !(!t || !t.path && !(t.readable && Mt(t, "httpVersion")) && !(t instanceof MR)) && (n.knownLength || this._valuesToMeasure.push(t));
};
oe.prototype._lengthRetriever = function(e, t) {
  Mt(e, "fd") ? e.end != null && e.end != 1 / 0 && e.start != null ? t(null, e.end + 1 - (e.start ? e.start : 0)) : UR.stat(e.path, function(n, r) {
    if (n) {
      t(n);
      return;
    }
    var a = r.size - (e.start ? e.start : 0);
    t(null, a);
  }) : Mt(e, "httpVersion") ? t(null, Number(e.headers["content-length"])) : Mt(e, "httpModule") ? (e.on("response", function(n) {
    e.pause(), t(null, Number(n.headers["content-length"]));
  }), e.resume()) : t("Unknown stream");
};
oe.prototype._multiPartHeader = function(e, t, n) {
  if (typeof n.header == "string")
    return n.header;
  var r = this._getContentDisposition(t, n), a = this._getContentType(t, n), i = "", s = {
    // add custom disposition as third element or keep it two elements if not
    "Content-Disposition": ["form-data", 'name="' + e + '"'].concat(r || []),
    // if no content type. allow it to be empty array
    "Content-Type": [].concat(a || [])
  };
  typeof n.header == "object" && As(s, n.header);
  var o;
  for (var l in s)
    if (Mt(s, l)) {
      if (o = s[l], o == null)
        continue;
      Array.isArray(o) || (o = [o]), o.length && (i += l + ": " + o.join("; ") + oe.LINE_BREAK);
    }
  return "--" + this.getBoundary() + oe.LINE_BREAK + i + oe.LINE_BREAK;
};
oe.prototype._getContentDisposition = function(e, t) {
  var n;
  if (typeof t.filepath == "string" ? n = ts.normalize(t.filepath).replace(/\\/g, "/") : t.filename || e && (e.name || e.path) ? n = ts.basename(t.filename || e && (e.name || e.path)) : e && e.readable && Mt(e, "httpVersion") && (n = ts.basename(e.client._httpMessage.path || "")), n)
    return 'filename="' + n + '"';
};
oe.prototype._getContentType = function(e, t) {
  var n = t.contentType;
  return !n && e && e.name && (n = ns.lookup(e.name)), !n && e && e.path && (n = ns.lookup(e.path)), !n && e && e.readable && Mt(e, "httpVersion") && (n = e.headers["content-type"]), !n && (t.filepath || t.filename) && (n = ns.lookup(t.filepath || t.filename)), !n && e && typeof e == "object" && (n = oe.DEFAULT_CONTENT_TYPE), n;
};
oe.prototype._multiPartFooter = function() {
  return (function(e) {
    var t = oe.LINE_BREAK, n = this._streams.length === 0;
    n && (t += this._lastBoundary()), e(t);
  }).bind(this);
};
oe.prototype._lastBoundary = function() {
  return "--" + this.getBoundary() + "--" + oe.LINE_BREAK;
};
oe.prototype.getHeaders = function(e) {
  var t, n = {
    "content-type": "multipart/form-data; boundary=" + this.getBoundary()
  };
  for (t in e)
    Mt(e, t) && (n[t.toLowerCase()] = e[t]);
  return n;
};
oe.prototype.setBoundary = function(e) {
  if (typeof e != "string")
    throw new TypeError("FormData boundary must be a string");
  this._boundary = e;
};
oe.prototype.getBoundary = function() {
  return this._boundary || this._generateBoundary(), this._boundary;
};
oe.prototype.getBuffer = function() {
  for (var e = new Buffer.alloc(0), t = this.getBoundary(), n = 0, r = this._streams.length; n < r; n++)
    typeof this._streams[n] != "function" && (Buffer.isBuffer(this._streams[n]) ? e = Buffer.concat([e, this._streams[n]]) : e = Buffer.concat([e, Buffer.from(this._streams[n])]), (typeof this._streams[n] != "string" || this._streams[n].substring(2, t.length + 2) !== t) && (e = Buffer.concat([e, Buffer.from(oe.LINE_BREAK)])));
  return Buffer.concat([e, Buffer.from(this._lastBoundary())]);
};
oe.prototype._generateBoundary = function() {
  this._boundary = "--------------------------" + zR.randomBytes(12).toString("hex");
};
oe.prototype.getLengthSync = function() {
  var e = this._overheadLength + this._valueLength;
  return this._streams.length && (e += this._lastBoundary().length), this.hasKnownLength() || this._error(new Error("Cannot calculate proper length in synchronous way.")), e;
};
oe.prototype.hasKnownLength = function() {
  var e = !0;
  return this._valuesToMeasure.length && (e = !1), e;
};
oe.prototype.getLength = function(e) {
  var t = this._overheadLength + this._valueLength;
  if (this._streams.length && (t += this._lastBoundary().length), !this._valuesToMeasure.length) {
    process.nextTick(e.bind(this, null, t));
    return;
  }
  qR.parallel(this._valuesToMeasure, this._lengthRetriever, function(n, r) {
    if (n) {
      e(n);
      return;
    }
    r.forEach(function(a) {
      t += a;
    }), e(null, t);
  });
};
oe.prototype.submit = function(e, t) {
  var n, r, a = { method: "post" };
  return typeof e == "string" ? (e = FR(e), r = As({
    port: e.port,
    path: e.pathname,
    host: e.hostname,
    protocol: e.protocol
  }, a)) : (r = As(e, a), r.port || (r.port = r.protocol === "https:" ? 443 : 80)), r.headers = this.getHeaders(e.headers), r.protocol === "https:" ? n = DR.request(r) : n = LR.request(r), this.getLength((function(i, s) {
    if (i && i !== "Unknown stream") {
      this._error(i);
      return;
    }
    if (s && n.setHeader("Content-Length", s), this.pipe(n), t) {
      var o, l = function(u, c) {
        return n.removeListener("error", l), n.removeListener("response", o), t.call(this, u, c);
      };
      o = l.bind(this, null), n.on("error", l), n.on("response", o);
    }
  }).bind(this)), n;
};
oe.prototype._error = function(e) {
  this.error || (this.error = e, this.pause(), this.emit("error", e));
};
oe.prototype.toString = function() {
  return "[object FormData]";
};
BR(oe.prototype, "FormData");
var VR = oe;
const Hf = /* @__PURE__ */ zn(VR);
function Ps(e) {
  return A.isPlainObject(e) || A.isArray(e);
}
function Gf(e) {
  return A.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function rs(e, t, n) {
  return e ? e.concat(t).map(function(a, i) {
    return a = Gf(a), !n && i ? "[" + a + "]" : a;
  }).join(n ? "." : "") : t;
}
function HR(e) {
  return A.isArray(e) && !e.some(Ps);
}
const GR = A.toFlatObject(A, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function ei(e, t, n) {
  if (!A.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new (Hf || FormData)(), n = A.toFlatObject(
    n,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(v, d) {
      return !A.isUndefined(d[v]);
    }
  );
  const r = n.metaTokens, a = n.visitor || p, i = n.dots, s = n.indexes, o = n.Blob || typeof Blob < "u" && Blob, l = n.maxDepth === void 0 ? 100 : n.maxDepth, u = o && A.isSpecCompliantForm(t);
  if (!A.isFunction(a))
    throw new TypeError("visitor must be a function");
  function c(m) {
    if (m === null) return "";
    if (A.isDate(m))
      return m.toISOString();
    if (A.isBoolean(m))
      return m.toString();
    if (!u && A.isBlob(m))
      throw new G("Blob is not supported. Use a Buffer instead.");
    return A.isArrayBuffer(m) || A.isTypedArray(m) ? u && typeof Blob == "function" ? new Blob([m]) : Buffer.from(m) : m;
  }
  function p(m, v, d) {
    let y = m;
    if (A.isReactNative(t) && A.isReactNativeBlob(m))
      return t.append(rs(d, v, i), c(m)), !1;
    if (m && !d && typeof m == "object") {
      if (A.endsWith(v, "{}"))
        v = r ? v : v.slice(0, -2), m = JSON.stringify(m);
      else if (A.isArray(m) && HR(m) || (A.isFileList(m) || A.endsWith(v, "[]")) && (y = A.toArray(m)))
        return v = Gf(v), y.forEach(function(x, E) {
          !(A.isUndefined(x) || x === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            s === !0 ? rs([v], E, i) : s === null ? v : v + "[]",
            c(x)
          );
        }), !1;
    }
    return Ps(m) ? !0 : (t.append(rs(d, v, i), c(m)), !1);
  }
  const f = [], h = Object.assign(GR, {
    defaultVisitor: p,
    convertValue: c,
    isVisitable: Ps
  });
  function g(m, v, d = 0) {
    if (!A.isUndefined(m)) {
      if (d > l)
        throw new G(
          "Object is too deeply nested (" + d + " levels). Max depth: " + l,
          G.ERR_FORM_DATA_DEPTH_EXCEEDED
        );
      if (f.indexOf(m) !== -1)
        throw Error("Circular reference detected in " + v.join("."));
      f.push(m), A.forEach(m, function(_, x) {
        (!(A.isUndefined(_) || _ === null) && a.call(t, _, A.isString(x) ? x.trim() : x, v, h)) === !0 && g(_, v ? v.concat(x) : [x], d + 1);
      }), f.pop();
    }
  }
  if (!A.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function Uu(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(r) {
    return t[r];
  });
}
function Kf(e, t) {
  this._pairs = [], e && ei(e, this, t);
}
const Xf = Kf.prototype;
Xf.append = function(t, n) {
  this._pairs.push([t, n]);
};
Xf.toString = function(t) {
  const n = t ? function(r) {
    return t.call(this, r, Uu);
  } : Uu;
  return this._pairs.map(function(a) {
    return n(a[0]) + "=" + n(a[1]);
  }, "").join("&");
};
function KR(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function pc(e, t, n) {
  if (!t)
    return e;
  const r = n && n.encode || KR, a = A.isFunction(n) ? {
    serialize: n
  } : n, i = a && a.serialize;
  let s;
  if (i ? s = i(t, a) : s = A.isURLSearchParams(t) ? t.toString() : new Kf(t, a).toString(r), s) {
    const o = e.indexOf("#");
    o !== -1 && (e = e.slice(0, o)), e += (e.indexOf("?") === -1 ? "?" : "&") + s;
  }
  return e;
}
class Mu {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(t, n, r) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(t) {
    A.forEach(this.handlers, function(r) {
      r !== null && t(r);
    });
  }
}
const ti = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0
}, XR = Pa.URLSearchParams, as = "abcdefghijklmnopqrstuvwxyz", zu = "0123456789", Wf = {
  DIGIT: zu,
  ALPHA: as,
  ALPHA_DIGIT: as + as.toUpperCase() + zu
}, WR = (e = 16, t = Wf.ALPHA_DIGIT) => {
  let n = "";
  const { length: r } = t, a = new Uint32Array(e);
  xp.randomFillSync(a);
  for (let i = 0; i < e; i++)
    n += t[a[i] % r];
  return n;
}, YR = {
  isNode: !0,
  classes: {
    URLSearchParams: XR,
    FormData: Hf,
    Blob: typeof Blob < "u" && Blob || null
  },
  ALPHABET: Wf,
  generateString: WR,
  protocols: ["http", "https", "file", "data"]
}, dc = typeof window < "u" && typeof document < "u", ks = typeof navigator == "object" && navigator || void 0, JR = dc && (!ks || ["ReactNative", "NativeScript", "NS"].indexOf(ks.product) < 0), QR = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", ZR = dc && window.location.href || "http://localhost", eO = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: dc,
  hasStandardBrowserEnv: JR,
  hasStandardBrowserWebWorkerEnv: QR,
  navigator: ks,
  origin: ZR
}, Symbol.toStringTag, { value: "Module" })), ye = {
  ...eO,
  ...YR
};
function tO(e, t) {
  return ei(e, new ye.classes.URLSearchParams(), {
    visitor: function(n, r, a, i) {
      return ye.isNode && A.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
function nO(e) {
  return A.matchAll(/\w+|\[(\w*)]/g, e).map((t) => t[0] === "[]" ? "" : t[1] || t[0]);
}
function rO(e) {
  const t = {}, n = Object.keys(e);
  let r;
  const a = n.length;
  let i;
  for (r = 0; r < a; r++)
    i = n[r], t[i] = e[i];
  return t;
}
function Yf(e) {
  function t(n, r, a, i) {
    let s = n[i++];
    if (s === "__proto__") return !0;
    const o = Number.isFinite(+s), l = i >= n.length;
    return s = !s && A.isArray(a) ? a.length : s, l ? (A.hasOwnProp(a, s) ? a[s] = A.isArray(a[s]) ? a[s].concat(r) : [a[s], r] : a[s] = r, !o) : ((!A.hasOwnProp(a, s) || !A.isObject(a[s])) && (a[s] = []), t(n, r, a[s], i) && A.isArray(a[s]) && (a[s] = rO(a[s])), !o);
  }
  if (A.isFormData(e) && A.isFunction(e.entries)) {
    const n = {};
    return A.forEachEntry(e, (r, a) => {
      t(nO(r), a, n, 0);
    }), n;
  }
  return null;
}
const En = (e, t) => e != null && A.hasOwnProp(e, t) ? e[t] : void 0;
function aO(e, t, n) {
  if (A.isString(e))
    try {
      return (t || JSON.parse)(e), A.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(e);
}
const jr = {
  transitional: ti,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const r = n.getContentType() || "", a = r.indexOf("application/json") > -1, i = A.isObject(t);
      if (i && A.isHTMLForm(t) && (t = new FormData(t)), A.isFormData(t))
        return a ? JSON.stringify(Yf(t)) : t;
      if (A.isArrayBuffer(t) || A.isBuffer(t) || A.isStream(t) || A.isFile(t) || A.isBlob(t) || A.isReadableStream(t))
        return t;
      if (A.isArrayBufferView(t))
        return t.buffer;
      if (A.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let o;
      if (i) {
        const l = En(this, "formSerializer");
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return tO(t, l).toString();
        if ((o = A.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const u = En(this, "env"), c = u && u.FormData;
          return ei(
            o ? { "files[]": t } : t,
            c && new c(),
            l
          );
        }
      }
      return i || a ? (n.setContentType("application/json", !1), aO(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = En(this, "transitional") || jr.transitional, r = n && n.forcedJSONParsing, a = En(this, "responseType"), i = a === "json";
      if (A.isResponse(t) || A.isReadableStream(t))
        return t;
      if (t && A.isString(t) && (r && !a || i)) {
        const o = !(n && n.silentJSONParsing) && i;
        try {
          return JSON.parse(t, En(this, "parseReviver"));
        } catch (l) {
          if (o)
            throw l.name === "SyntaxError" ? G.from(l, G.ERR_BAD_RESPONSE, this, null, En(this, "response")) : l;
        }
      }
      return t;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: ye.classes.FormData,
    Blob: ye.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
A.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  jr.headers[e] = {};
});
function is(e, t) {
  const n = this || jr, r = t || n, a = Te.from(r.headers);
  let i = r.data;
  return A.forEach(e, function(o) {
    i = o.call(n, i, a.normalize(), t ? t.status : void 0);
  }), a.normalize(), i;
}
function Jf(e) {
  return !!(e && e.__CANCEL__);
}
let ln = class extends G {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, n, r) {
    super(t ?? "canceled", G.ERR_CANCELED, n, r), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function On(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? e(n) : t(new G(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? G.ERR_BAD_REQUEST : G.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function iO(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function sO(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function fc(e, t, n) {
  let r = !iO(t);
  return e && (r || n === !1) ? sO(e, t) : t;
}
var oO = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
function cO(e) {
  try {
    return new URL(e);
  } catch {
    return null;
  }
}
function lO(e) {
  var t = (typeof e == "string" ? cO(e) : e) || {}, n = t.protocol, r = t.host, a = t.port;
  if (typeof r != "string" || !r || typeof n != "string" || (n = n.split(":", 1)[0], r = r.replace(/:\d*$/, ""), a = parseInt(a) || oO[n] || 0, !uO(r, a)))
    return "";
  var i = Ns(n + "_proxy") || Ns("all_proxy");
  return i && i.indexOf("://") === -1 && (i = n + "://" + i), i;
}
function uO(e, t) {
  var n = Ns("no_proxy").toLowerCase();
  return n ? n === "*" ? !1 : n.split(/[,\s]/).every(function(r) {
    if (!r)
      return !0;
    var a = r.match(/^(.+):(\d+)$/), i = a ? a[1] : r, s = a ? parseInt(a[2]) : 0;
    return s && s !== t ? !0 : /^[.*]/.test(i) ? (i.charAt(0) === "*" && (i = i.slice(1)), !e.endsWith(i)) : e !== i;
  }) : !0;
}
function Ns(e) {
  return process.env[e.toLowerCase()] || process.env[e.toUpperCase()] || "";
}
var mc = {}, Is = { exports: {} }, aa = { exports: {} }, ss, qu;
function pO() {
  if (qu) return ss;
  qu = 1;
  var e = 1e3, t = e * 60, n = t * 60, r = n * 24, a = r * 7, i = r * 365.25;
  ss = function(c, p) {
    p = p || {};
    var f = typeof c;
    if (f === "string" && c.length > 0)
      return s(c);
    if (f === "number" && isFinite(c))
      return p.long ? l(c) : o(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function s(c) {
    if (c = String(c), !(c.length > 100)) {
      var p = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (p) {
        var f = parseFloat(p[1]), h = (p[2] || "ms").toLowerCase();
        switch (h) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return f * i;
          case "weeks":
          case "week":
          case "w":
            return f * a;
          case "days":
          case "day":
          case "d":
            return f * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return f * n;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return f * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return f * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return f;
          default:
            return;
        }
      }
    }
  }
  function o(c) {
    var p = Math.abs(c);
    return p >= r ? Math.round(c / r) + "d" : p >= n ? Math.round(c / n) + "h" : p >= t ? Math.round(c / t) + "m" : p >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var p = Math.abs(c);
    return p >= r ? u(c, p, r, "day") : p >= n ? u(c, p, n, "hour") : p >= t ? u(c, p, t, "minute") : p >= e ? u(c, p, e, "second") : c + " ms";
  }
  function u(c, p, f, h) {
    var g = p >= f * 1.5;
    return Math.round(c / f) + " " + h + (g ? "s" : "");
  }
  return ss;
}
var os, Bu;
function Qf() {
  if (Bu) return os;
  Bu = 1;
  function e(t) {
    r.debug = r, r.default = r, r.coerce = u, r.disable = o, r.enable = i, r.enabled = l, r.humanize = pO(), r.destroy = c, Object.keys(t).forEach((p) => {
      r[p] = t[p];
    }), r.names = [], r.skips = [], r.formatters = {};
    function n(p) {
      let f = 0;
      for (let h = 0; h < p.length; h++)
        f = (f << 5) - f + p.charCodeAt(h), f |= 0;
      return r.colors[Math.abs(f) % r.colors.length];
    }
    r.selectColor = n;
    function r(p) {
      let f, h = null, g, m;
      function v(...d) {
        if (!v.enabled)
          return;
        const y = v, _ = Number(/* @__PURE__ */ new Date()), x = _ - (f || _);
        y.diff = x, y.prev = f, y.curr = _, f = _, d[0] = r.coerce(d[0]), typeof d[0] != "string" && d.unshift("%O");
        let E = 0;
        d[0] = d[0].replace(/%([a-zA-Z%])/g, (C, D) => {
          if (C === "%%")
            return "%";
          E++;
          const S = r.formatters[D];
          if (typeof S == "function") {
            const R = d[E];
            C = S.call(y, R), d.splice(E, 1), E--;
          }
          return C;
        }), r.formatArgs.call(y, d), (y.log || r.log).apply(y, d);
      }
      return v.namespace = p, v.useColors = r.useColors(), v.color = r.selectColor(p), v.extend = a, v.destroy = r.destroy, Object.defineProperty(v, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => h !== null ? h : (g !== r.namespaces && (g = r.namespaces, m = r.enabled(p)), m),
        set: (d) => {
          h = d;
        }
      }), typeof r.init == "function" && r.init(v), v;
    }
    function a(p, f) {
      const h = r(this.namespace + (typeof f > "u" ? ":" : f) + p);
      return h.log = this.log, h;
    }
    function i(p) {
      r.save(p), r.namespaces = p, r.names = [], r.skips = [];
      const f = (typeof p == "string" ? p : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const h of f)
        h[0] === "-" ? r.skips.push(h.slice(1)) : r.names.push(h);
    }
    function s(p, f) {
      let h = 0, g = 0, m = -1, v = 0;
      for (; h < p.length; )
        if (g < f.length && (f[g] === p[h] || f[g] === "*"))
          f[g] === "*" ? (m = g, v = h, g++) : (h++, g++);
        else if (m !== -1)
          g = m + 1, v++, h = v;
        else
          return !1;
      for (; g < f.length && f[g] === "*"; )
        g++;
      return g === f.length;
    }
    function o() {
      const p = [
        ...r.names,
        ...r.skips.map((f) => "-" + f)
      ].join(",");
      return r.enable(""), p;
    }
    function l(p) {
      for (const f of r.skips)
        if (s(p, f))
          return !1;
      for (const f of r.names)
        if (s(p, f))
          return !0;
      return !1;
    }
    function u(p) {
      return p instanceof Error ? p.stack || p.message : p;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return r.enable(r.load()), r;
  }
  return os = e, os;
}
var Vu;
function dO() {
  return Vu || (Vu = 1, function(e, t) {
    t.formatArgs = r, t.save = a, t.load = i, t.useColors = n, t.storage = s(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function n() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function r(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const u = "color: " + this.color;
      l.splice(1, 0, u, "color: inherit");
      let c = 0, p = 0;
      l[0].replace(/%[a-zA-Z%]/g, (f) => {
        f !== "%%" && (c++, f === "%c" && (p = c));
      }), l.splice(p, 0, u);
    }
    t.log = console.debug || console.log || (() => {
    });
    function a(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function i() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function s() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Qf()(t);
    const { formatters: o } = e.exports;
    o.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (u) {
        return "[UnexpectedJSONParseError]: " + u.message;
      }
    };
  }(aa, aa.exports)), aa.exports;
}
var ia = { exports: {} }, cs, Hu;
function fO() {
  return Hu || (Hu = 1, cs = (e, t = process.argv) => {
    const n = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", r = t.indexOf(n + e), a = t.indexOf("--");
    return r !== -1 && (a === -1 || r < a);
  }), cs;
}
var ls, Gu;
function mO() {
  if (Gu) return ls;
  Gu = 1;
  const e = xa, t = bp, n = fO(), { env: r } = process;
  let a;
  n("no-color") || n("no-colors") || n("color=false") || n("color=never") ? a = 0 : (n("color") || n("colors") || n("color=true") || n("color=always")) && (a = 1), "FORCE_COLOR" in r && (r.FORCE_COLOR === "true" ? a = 1 : r.FORCE_COLOR === "false" ? a = 0 : a = r.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(r.FORCE_COLOR, 10), 3));
  function i(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function s(l, u) {
    if (a === 0)
      return 0;
    if (n("color=16m") || n("color=full") || n("color=truecolor"))
      return 3;
    if (n("color=256"))
      return 2;
    if (l && !u && a === void 0)
      return 0;
    const c = a || 0;
    if (r.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const p = e.release().split(".");
      return Number(p[0]) >= 10 && Number(p[2]) >= 10586 ? Number(p[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in r)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((p) => p in r) || r.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in r)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(r.TEAMCITY_VERSION) ? 1 : 0;
    if (r.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in r) {
      const p = parseInt((r.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (r.TERM_PROGRAM) {
        case "iTerm.app":
          return p >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(r.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(r.TERM) || "COLORTERM" in r ? 1 : c;
  }
  function o(l) {
    const u = s(l, l && l.isTTY);
    return i(u);
  }
  return ls = {
    supportsColor: o,
    stdout: i(s(!0, t.isatty(1))),
    stderr: i(s(!0, t.isatty(2)))
  }, ls;
}
var Ku;
function hO() {
  return Ku || (Ku = 1, function(e, t) {
    const n = bp, r = dn;
    t.init = c, t.log = o, t.formatArgs = i, t.save = l, t.load = u, t.useColors = a, t.destroy = r.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const f = mO();
      f && (f.stderr || f).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((f) => /^debug_/i.test(f)).reduce((f, h) => {
      const g = h.substring(6).toLowerCase().replace(/_([a-z])/g, (v, d) => d.toUpperCase());
      let m = process.env[h];
      return /^(yes|on|true|enabled)$/i.test(m) ? m = !0 : /^(no|off|false|disabled)$/i.test(m) ? m = !1 : m === "null" ? m = null : m = Number(m), f[g] = m, f;
    }, {});
    function a() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : n.isatty(process.stderr.fd);
    }
    function i(f) {
      const { namespace: h, useColors: g } = this;
      if (g) {
        const m = this.color, v = "\x1B[3" + (m < 8 ? m : "8;5;" + m), d = `  ${v};1m${h} \x1B[0m`;
        f[0] = d + f[0].split(`
`).join(`
` + d), f.push(v + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        f[0] = s() + h + " " + f[0];
    }
    function s() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function o(...f) {
      return process.stderr.write(r.formatWithOptions(t.inspectOpts, ...f) + `
`);
    }
    function l(f) {
      f ? process.env.DEBUG = f : delete process.env.DEBUG;
    }
    function u() {
      return process.env.DEBUG;
    }
    function c(f) {
      f.inspectOpts = {};
      const h = Object.keys(t.inspectOpts);
      for (let g = 0; g < h.length; g++)
        f.inspectOpts[h[g]] = t.inspectOpts[h[g]];
    }
    e.exports = Qf()(t);
    const { formatters: p } = e.exports;
    p.o = function(f) {
      return this.inspectOpts.colors = this.useColors, r.inspect(f, this.inspectOpts).split(`
`).map((h) => h.trim()).join(" ");
    }, p.O = function(f) {
      return this.inspectOpts.colors = this.useColors, r.inspect(f, this.inspectOpts);
    };
  }(ia, ia.exports)), ia.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Is.exports = dO() : Is.exports = hO();
var ni = Is.exports, hc = {};
Object.defineProperty(hc, "__esModule", { value: !0 });
function vO(e) {
  return function(t, n) {
    return new Promise((r, a) => {
      e.call(this, t, n, (i, s) => {
        i ? a(i) : r(s);
      });
    });
  };
}
hc.default = vO;
var Zf = ht && ht.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
const yO = gp, gO = Zf(ni), xO = Zf(hc), or = gO.default("agent-base");
function bO(e) {
  return !!e && typeof e.addRequest == "function";
}
function us() {
  const { stack: e } = new Error();
  return typeof e != "string" ? !1 : e.split(`
`).some((t) => t.indexOf("(https.js:") !== -1 || t.indexOf("node:https:") !== -1);
}
function Ra(e, t) {
  return new Ra.Agent(e, t);
}
(function(e) {
  class t extends yO.EventEmitter {
    constructor(r, a) {
      super();
      let i = a;
      typeof r == "function" ? this.callback = r : r && (i = r), this.timeout = null, i && typeof i.timeout == "number" && (this.timeout = i.timeout), this.maxFreeSockets = 1, this.maxSockets = 1, this.maxTotalSockets = 1 / 0, this.sockets = {}, this.freeSockets = {}, this.requests = {}, this.options = {};
    }
    get defaultPort() {
      return typeof this.explicitDefaultPort == "number" ? this.explicitDefaultPort : us() ? 443 : 80;
    }
    set defaultPort(r) {
      this.explicitDefaultPort = r;
    }
    get protocol() {
      return typeof this.explicitProtocol == "string" ? this.explicitProtocol : us() ? "https:" : "http:";
    }
    set protocol(r) {
      this.explicitProtocol = r;
    }
    callback(r, a, i) {
      throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
    }
    /**
     * Called by node-core's "_http_client.js" module when creating
     * a new HTTP request with this Agent instance.
     *
     * @api public
     */
    addRequest(r, a) {
      const i = Object.assign({}, a);
      typeof i.secureEndpoint != "boolean" && (i.secureEndpoint = us()), i.host == null && (i.host = "localhost"), i.port == null && (i.port = i.secureEndpoint ? 443 : 80), i.protocol == null && (i.protocol = i.secureEndpoint ? "https:" : "http:"), i.host && i.path && delete i.path, delete i.agent, delete i.hostname, delete i._defaultAgent, delete i.defaultPort, delete i.createConnection, r._last = !0, r.shouldKeepAlive = !1;
      let s = !1, o = null;
      const l = i.timeout || this.timeout, u = (h) => {
        r._hadError || (r.emit("error", h), r._hadError = !0);
      }, c = () => {
        o = null, s = !0;
        const h = new Error(`A "socket" was not created for HTTP request before ${l}ms`);
        h.code = "ETIMEOUT", u(h);
      }, p = (h) => {
        s || (o !== null && (clearTimeout(o), o = null), u(h));
      }, f = (h) => {
        if (s)
          return;
        if (o != null && (clearTimeout(o), o = null), bO(h)) {
          or("Callback returned another Agent instance %o", h.constructor.name), h.addRequest(r, i);
          return;
        }
        if (h) {
          h.once("free", () => {
            this.freeSocket(h, i);
          }), r.onSocket(h);
          return;
        }
        const g = new Error(`no Duplex stream was returned to agent-base for \`${r.method} ${r.path}\``);
        u(g);
      };
      if (typeof this.callback != "function") {
        u(new Error("`callback` is not defined"));
        return;
      }
      this.promisifiedCallback || (this.callback.length >= 3 ? (or("Converting legacy callback function to promise"), this.promisifiedCallback = xO.default(this.callback)) : this.promisifiedCallback = this.callback), typeof l == "number" && l > 0 && (o = setTimeout(c, l)), "port" in i && typeof i.port != "number" && (i.port = Number(i.port));
      try {
        or("Resolving socket for %o request: %o", i.protocol, `${r.method} ${r.path}`), Promise.resolve(this.promisifiedCallback(r, i)).then(f, p);
      } catch (h) {
        Promise.reject(h).catch(p);
      }
    }
    freeSocket(r, a) {
      or("Freeing socket %o %o", r.constructor.name, a), r.destroy();
    }
    destroy() {
      or("Destroying agent %o", this.constructor.name);
    }
  }
  e.Agent = t, e.prototype = e.Agent.prototype;
})(Ra || (Ra = {}));
var _O = Ra, vc = {}, EO = ht && ht.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(vc, "__esModule", { value: !0 });
const wO = EO(ni), cr = wO.default("https-proxy-agent:parse-proxy-response");
function $O(e) {
  return new Promise((t, n) => {
    let r = 0;
    const a = [];
    function i() {
      const p = e.read();
      p ? c(p) : e.once("readable", i);
    }
    function s() {
      e.removeListener("end", l), e.removeListener("error", u), e.removeListener("close", o), e.removeListener("readable", i);
    }
    function o(p) {
      cr("onclose had error %o", p);
    }
    function l() {
      cr("onend");
    }
    function u(p) {
      s(), cr("onerror %o", p), n(p);
    }
    function c(p) {
      a.push(p), r += p.length;
      const f = Buffer.concat(a, r);
      if (f.indexOf(`\r
\r
`) === -1) {
        cr("have not received end of HTTP headers yet..."), i();
        return;
      }
      const g = f.toString("ascii", 0, f.indexOf(`\r
`)), m = +g.split(" ")[1];
      cr("got proxy server response: %o", g), t({
        statusCode: m,
        buffered: f
      });
    }
    e.on("error", u), e.on("close", o), e.on("end", l), i();
  });
}
vc.default = $O;
var SO = ht && ht.__awaiter || function(e, t, n, r) {
  function a(i) {
    return i instanceof n ? i : new n(function(s) {
      s(i);
    });
  }
  return new (n || (n = Promise))(function(i, s) {
    function o(c) {
      try {
        u(r.next(c));
      } catch (p) {
        s(p);
      }
    }
    function l(c) {
      try {
        u(r.throw(c));
      } catch (p) {
        s(p);
      }
    }
    function u(c) {
      c.done ? i(c.value) : a(c.value).then(o, l);
    }
    u((r = r.apply(e, t || [])).next());
  });
}, Xn = ht && ht.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(mc, "__esModule", { value: !0 });
const Xu = Xn(Im), Wu = Xn(jm), TO = Xn(Pa), RO = Xn($r), OO = Xn(ni), AO = _O, PO = Xn(vc), lr = OO.default("https-proxy-agent:agent");
let kO = class extends AO.Agent {
  constructor(t) {
    let n;
    if (typeof t == "string" ? n = TO.default.parse(t) : n = t, !n)
      throw new Error("an HTTP(S) proxy server `host` and `port` must be specified!");
    lr("creating new HttpsProxyAgent instance: %o", n), super(n);
    const r = Object.assign({}, n);
    this.secureProxy = n.secureProxy || jO(r.protocol), r.host = r.hostname || r.host, typeof r.port == "string" && (r.port = parseInt(r.port, 10)), !r.port && r.host && (r.port = this.secureProxy ? 443 : 80), this.secureProxy && !("ALPNProtocols" in r) && (r.ALPNProtocols = ["http 1.1"]), r.host && r.path && (delete r.path, delete r.pathname), this.proxy = r;
  }
  /**
   * Called when the node-core HTTP client library is creating a
   * new HTTP request.
   *
   * @api protected
   */
  callback(t, n) {
    return SO(this, void 0, void 0, function* () {
      const { proxy: r, secureProxy: a } = this;
      let i;
      a ? (lr("Creating `tls.Socket`: %o", r), i = Wu.default.connect(r)) : (lr("Creating `net.Socket`: %o", r), i = Xu.default.connect(r));
      const s = Object.assign({}, r.headers);
      let l = `CONNECT ${`${n.host}:${n.port}`} HTTP/1.1\r
`;
      r.auth && (s["Proxy-Authorization"] = `Basic ${Buffer.from(r.auth).toString("base64")}`);
      let { host: u, port: c, secureEndpoint: p } = n;
      IO(c, p) || (u += `:${c}`), s.Host = u, s.Connection = "close";
      for (const v of Object.keys(s))
        l += `${v}: ${s[v]}\r
`;
      const f = PO.default(i);
      i.write(`${l}\r
`);
      const { statusCode: h, buffered: g } = yield f;
      if (h === 200) {
        if (t.once("socket", NO), n.secureEndpoint) {
          lr("Upgrading socket connection to TLS");
          const v = n.servername || n.host;
          return Wu.default.connect(Object.assign(Object.assign({}, CO(n, "host", "hostname", "path", "port")), {
            socket: i,
            servername: v
          }));
        }
        return i;
      }
      i.destroy();
      const m = new Xu.default.Socket({ writable: !1 });
      return m.readable = !0, t.once("socket", (v) => {
        lr("replaying proxy buffer for failed request"), RO.default(v.listenerCount("data") > 0), v.push(g), v.push(null);
      }), m;
    });
  }
};
mc.default = kO;
function NO(e) {
  e.resume();
}
function IO(e, t) {
  return !!(!t && e === 80 || t && e === 443);
}
function jO(e) {
  return typeof e == "string" ? /^https:?$/i.test(e) : !1;
}
function CO(e, ...t) {
  const n = {};
  let r;
  for (r in e)
    t.includes(r) || (n[r] = e[r]);
  return n;
}
var LO = ht && ht.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
const js = LO(mc);
function Cs(e) {
  return new js.default(e);
}
(function(e) {
  e.HttpsProxyAgent = js.default, e.prototype = js.default.prototype;
})(Cs || (Cs = {}));
var DO = Cs;
const em = /* @__PURE__ */ zn(DO);
var yc = { exports: {} }, ur, FO = function() {
  if (!ur) {
    try {
      ur = ni("follow-redirects");
    } catch {
    }
    typeof ur != "function" && (ur = function() {
    });
  }
  ur.apply(null, arguments);
}, Cr = Pa, _r = Cr.URL, UO = qs, MO = Bs, gc = Ae.Writable, xc = $r, tm = FO;
(function() {
  var t = typeof process < "u", n = typeof window < "u" && typeof document < "u", r = un(Error.captureStackTrace);
  !t && (n || !r) && console.warn("The follow-redirects package should be excluded from browser builds.");
})();
var bc = !1;
try {
  xc(new _r(""));
} catch (e) {
  bc = e.code === "ERR_INVALID_URL";
}
var zO = [
  "Authorization",
  "Proxy-Authorization",
  "Cookie"
], qO = [
  "auth",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "hash"
], _c = ["abort", "aborted", "connect", "error", "socket", "timeout"], Ec = /* @__PURE__ */ Object.create(null);
_c.forEach(function(e) {
  Ec[e] = function(t, n, r) {
    this._redirectable.emit(e, t, n, r);
  };
});
var Ls = Lr(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
), Ds = Lr(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
), BO = Lr(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded",
  Ds
), VO = Lr(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
), HO = Lr(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
), GO = gc.prototype.destroy || rm;
function He(e, t) {
  gc.call(this), this._sanitizeOptions(e), this._options = e, this._ended = !1, this._ending = !1, this._redirectCount = 0, this._redirects = [], this._requestBodyLength = 0, this._requestBodyBuffers = [], t && this.on("response", t);
  var n = this;
  this._onNativeResponse = function(r) {
    try {
      n._processResponse(r);
    } catch (a) {
      n.emit("error", a instanceof Ds ? a : new Ds({ cause: a }));
    }
  }, this._headerFilter = new RegExp("^(?:" + zO.concat(e.sensitiveHeaders).map(QO).join("|") + ")$", "i"), this._performRequest();
}
He.prototype = Object.create(gc.prototype);
He.prototype.abort = function() {
  $c(this._currentRequest), this._currentRequest.abort(), this.emit("abort");
};
He.prototype.destroy = function(e) {
  return $c(this._currentRequest, e), GO.call(this, e), this;
};
He.prototype.write = function(e, t, n) {
  if (this._ending)
    throw new HO();
  if (!nn(e) && !YO(e))
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  if (un(t) && (n = t, t = null), e.length === 0) {
    n && n();
    return;
  }
  this._requestBodyLength + e.length <= this._options.maxBodyLength ? (this._requestBodyLength += e.length, this._requestBodyBuffers.push({ data: e, encoding: t }), this._currentRequest.write(e, t, n)) : (this.emit("error", new VO()), this.abort());
};
He.prototype.end = function(e, t, n) {
  if (un(e) ? (n = e, e = t = null) : un(t) && (n = t, t = null), !e)
    this._ended = this._ending = !0, this._currentRequest.end(null, null, n);
  else {
    var r = this, a = this._currentRequest;
    this.write(e, t, function() {
      r._ended = !0, a.end(null, null, n);
    }), this._ending = !0;
  }
};
He.prototype.setHeader = function(e, t) {
  this._options.headers[e] = t, this._currentRequest.setHeader(e, t);
};
He.prototype.removeHeader = function(e) {
  delete this._options.headers[e], this._currentRequest.removeHeader(e);
};
He.prototype.setTimeout = function(e, t) {
  var n = this;
  function r(s) {
    s.setTimeout(e), s.removeListener("timeout", s.destroy), s.addListener("timeout", s.destroy);
  }
  function a(s) {
    n._timeout && clearTimeout(n._timeout), n._timeout = setTimeout(function() {
      n.emit("timeout"), i();
    }, e), r(s);
  }
  function i() {
    n._timeout && (clearTimeout(n._timeout), n._timeout = null), n.removeListener("abort", i), n.removeListener("error", i), n.removeListener("response", i), n.removeListener("close", i), t && n.removeListener("timeout", t), n.socket || n._currentRequest.removeListener("socket", a);
  }
  return t && this.on("timeout", t), this.socket ? a(this.socket) : this._currentRequest.once("socket", a), this.on("socket", r), this.on("abort", i), this.on("error", i), this.on("response", i), this.on("close", i), this;
};
[
  "flushHeaders",
  "getHeader",
  "setNoDelay",
  "setSocketKeepAlive"
].forEach(function(e) {
  He.prototype[e] = function(t, n) {
    return this._currentRequest[e](t, n);
  };
});
["aborted", "connection", "socket"].forEach(function(e) {
  Object.defineProperty(He.prototype, e, {
    get: function() {
      return this._currentRequest[e];
    }
  });
});
He.prototype._sanitizeOptions = function(e) {
  if (e.headers || (e.headers = {}), WO(e.sensitiveHeaders) || (e.sensitiveHeaders = []), e.host && (e.hostname || (e.hostname = e.host), delete e.host), !e.pathname && e.path) {
    var t = e.path.indexOf("?");
    t < 0 ? e.pathname = e.path : (e.pathname = e.path.substring(0, t), e.search = e.path.substring(t));
  }
};
He.prototype._performRequest = function() {
  var e = this._options.protocol, t = this._options.nativeProtocols[e];
  if (!t)
    throw new TypeError("Unsupported protocol " + e);
  if (this._options.agents) {
    var n = e.slice(0, -1);
    this._options.agent = this._options.agents[n];
  }
  var r = this._currentRequest = t.request(this._options, this._onNativeResponse);
  r._redirectable = this;
  for (var a of _c)
    r.on(a, Ec[a]);
  if (this._currentUrl = /^\//.test(this._options.path) ? Cr.format(this._options) : (
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path
  ), this._isRedirect) {
    var i = 0, s = this, o = this._requestBodyBuffers;
    (function l(u) {
      if (r === s._currentRequest)
        if (u)
          s.emit("error", u);
        else if (i < o.length) {
          var c = o[i++];
          r.finished || r.write(c.data, c.encoding, l);
        } else s._ended && r.end();
    })();
  }
};
He.prototype._processResponse = function(e) {
  var t = e.statusCode;
  this._options.trackRedirects && this._redirects.push({
    url: this._currentUrl,
    headers: e.headers,
    statusCode: t
  });
  var n = e.headers.location;
  if (!n || this._options.followRedirects === !1 || t < 300 || t >= 400) {
    e.responseUrl = this._currentUrl, e.redirects = this._redirects, this.emit("response", e), this._requestBodyBuffers = [];
    return;
  }
  if ($c(this._currentRequest), e.destroy(), ++this._redirectCount > this._options.maxRedirects)
    throw new BO();
  var r, a = this._options.beforeRedirect;
  a && (r = Object.assign({
    // The Host header was set by nativeProtocol.request
    Host: e.req.getHeader("host")
  }, this._options.headers));
  var i = this._options.method;
  ((t === 301 || t === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
  // the server is redirecting the user agent to a different resource […]
  // A user agent can perform a retrieval request targeting that URI
  // (a GET or HEAD request if using HTTP) […]
  t === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) && (this._options.method = "GET", this._requestBodyBuffers = [], ps(/^content-/i, this._options.headers));
  var s = ps(/^host$/i, this._options.headers), o = wc(this._currentUrl), l = s || o.host, u = /^\w+:/.test(n) ? this._currentUrl : Cr.format(Object.assign(o, { host: l })), c = KO(n, u);
  if (tm("redirecting to", c.href), this._isRedirect = !0, Fs(c, this._options), (c.protocol !== o.protocol && c.protocol !== "https:" || c.host !== l && !XO(c.host, l)) && ps(this._headerFilter, this._options.headers), un(a)) {
    var p = {
      headers: e.headers,
      statusCode: t
    }, f = {
      url: u,
      method: i,
      headers: r
    };
    a(this._options, p, f), this._sanitizeOptions(this._options);
  }
  this._performRequest();
};
function nm(e) {
  var t = {
    maxRedirects: 21,
    maxBodyLength: 10485760
  }, n = {};
  return Object.keys(e).forEach(function(r) {
    var a = r + ":", i = n[a] = e[r], s = t[r] = Object.create(i);
    function o(u, c, p) {
      return JO(u) ? u = Fs(u) : nn(u) ? u = Fs(wc(u)) : (p = c, c = am(u), u = { protocol: a }), un(c) && (p = c, c = null), c = Object.assign({
        maxRedirects: t.maxRedirects,
        maxBodyLength: t.maxBodyLength
      }, u, c), c.nativeProtocols = n, !nn(c.host) && !nn(c.hostname) && (c.hostname = "::1"), xc.equal(c.protocol, a, "protocol mismatch"), tm("options", c), new He(c, p);
    }
    function l(u, c, p) {
      var f = s.request(u, c, p);
      return f.end(), f;
    }
    Object.defineProperties(s, {
      request: { value: o, configurable: !0, enumerable: !0, writable: !0 },
      get: { value: l, configurable: !0, enumerable: !0, writable: !0 }
    });
  }), t;
}
function rm() {
}
function wc(e) {
  var t;
  if (bc)
    t = new _r(e);
  else if (t = am(Cr.parse(e)), !nn(t.protocol))
    throw new Ls({ input: e });
  return t;
}
function KO(e, t) {
  return bc ? new _r(e, t) : wc(Cr.resolve(t, e));
}
function am(e) {
  if (/^\[/.test(e.hostname) && !/^\[[:0-9a-f]+\]$/i.test(e.hostname))
    throw new Ls({ input: e.href || e });
  if (/^\[/.test(e.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(e.host))
    throw new Ls({ input: e.href || e });
  return e;
}
function Fs(e, t) {
  var n = t || {};
  for (var r of qO)
    n[r] = e[r];
  return n.hostname.startsWith("[") && (n.hostname = n.hostname.slice(1, -1)), n.port !== "" && (n.port = Number(n.port)), n.path = n.search ? n.pathname + n.search : n.pathname, n;
}
function ps(e, t) {
  var n;
  for (var r in t)
    e.test(r) && (n = t[r], delete t[r]);
  return n === null || typeof n > "u" ? void 0 : String(n).trim();
}
function Lr(e, t, n) {
  function r(a) {
    un(Error.captureStackTrace) && Error.captureStackTrace(this, this.constructor), Object.assign(this, a || {}), this.code = e, this.message = this.cause ? t + ": " + this.cause.message : t;
  }
  return r.prototype = new (n || Error)(), Object.defineProperties(r.prototype, {
    constructor: {
      value: r,
      enumerable: !1
    },
    name: {
      value: "Error [" + e + "]",
      enumerable: !1
    }
  }), r;
}
function $c(e, t) {
  for (var n of _c)
    e.removeListener(n, Ec[n]);
  e.on("error", rm), e.destroy(t);
}
function XO(e, t) {
  xc(nn(e) && nn(t));
  var n = e.length - t.length - 1;
  return n > 0 && e[n] === "." && e.endsWith(t);
}
function WO(e) {
  return e instanceof Array;
}
function nn(e) {
  return typeof e == "string" || e instanceof String;
}
function un(e) {
  return typeof e == "function";
}
function YO(e) {
  return typeof e == "object" && "length" in e;
}
function JO(e) {
  return _r && e instanceof _r;
}
function QO(e) {
  return e.replace(/[\]\\/()*+?.$]/g, "\\$&");
}
yc.exports = nm({ http: UO, https: MO });
yc.exports.wrap = nm;
var ZO = yc.exports;
const eA = /* @__PURE__ */ zn(ZO), Er = "1.16.1";
function im(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
const tA = /^([^,;]+\/[^,;]+)?((?:;[^,;=]+=[^,;]+)*)(;base64)?,([\s\S]*)$/;
function nA(e, t, n) {
  const r = n && n.Blob || ye.classes.Blob, a = im(e);
  if (t === void 0 && r && (t = !0), a === "data") {
    e = a.length ? e.slice(a.length + 1) : e;
    const i = tA.exec(e);
    if (!i)
      throw new G("Invalid URL", G.ERR_INVALID_URL);
    const s = i[1], o = i[2], l = i[3] ? "base64" : "utf8", u = i[4];
    let c;
    s ? c = o ? s + o : s : o && (c = "text/plain" + o);
    const p = Buffer.from(decodeURIComponent(u), l);
    if (t) {
      if (!r)
        throw new G("Blob is not supported", G.ERR_NOT_SUPPORT);
      return new r([p], { type: c });
    }
    return p;
  }
  throw new G("Unsupported protocol " + a, G.ERR_NOT_SUPPORT);
}
const ds = Symbol("internals");
class Yu extends Ae.Transform {
  constructor(t) {
    t = A.toFlatObject(
      t,
      {
        maxRate: 0,
        chunkSize: 64 * 1024,
        minChunkSize: 100,
        timeWindow: 500,
        ticksRate: 2,
        samplesCount: 15
      },
      null,
      (r, a) => !A.isUndefined(a[r])
    ), super({
      readableHighWaterMark: t.chunkSize
    });
    const n = this[ds] = {
      timeWindow: t.timeWindow,
      chunkSize: t.chunkSize,
      maxRate: t.maxRate,
      minChunkSize: t.minChunkSize,
      bytesSeen: 0,
      isCaptured: !1,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    this.on("newListener", (r) => {
      r === "progress" && (n.isCaptured || (n.isCaptured = !0));
    });
  }
  _read(t) {
    const n = this[ds];
    return n.onReadCallback && n.onReadCallback(), super._read(t);
  }
  _transform(t, n, r) {
    const a = this[ds], i = a.maxRate, s = this.readableHighWaterMark, o = a.timeWindow, l = 1e3 / o, u = i / l, c = a.minChunkSize !== !1 ? Math.max(a.minChunkSize, u * 0.01) : 0, p = (h, g) => {
      const m = Buffer.byteLength(h);
      a.bytesSeen += m, a.bytes += m, a.isCaptured && this.emit("progress", a.bytesSeen), this.push(h) ? process.nextTick(g) : a.onReadCallback = () => {
        a.onReadCallback = null, process.nextTick(g);
      };
    }, f = (h, g) => {
      const m = Buffer.byteLength(h);
      let v = null, d = s, y, _ = 0;
      if (i) {
        const x = Date.now();
        (!a.ts || (_ = x - a.ts) >= o) && (a.ts = x, y = u - a.bytes, a.bytes = y < 0 ? -y : 0, _ = 0), y = u - a.bytes;
      }
      if (i) {
        if (y <= 0)
          return setTimeout(() => {
            g(null, h);
          }, o - _);
        y < d && (d = y);
      }
      d && m > d && m - d > c && (v = h.subarray(d), h = h.subarray(0, d)), p(
        h,
        v ? () => {
          process.nextTick(g, null, v);
        } : g
      );
    };
    f(t, function h(g, m) {
      if (g)
        return r(g);
      m ? f(m, h) : r(null);
    });
  }
}
const { asyncIterator: Ju } = Symbol, sm = async function* (e) {
  e.stream ? yield* e.stream() : e.arrayBuffer ? yield await e.arrayBuffer() : e[Ju] ? yield* e[Ju]() : yield e;
}, rA = ye.ALPHABET.ALPHA_DIGIT + "-_", wr = typeof TextEncoder == "function" ? new TextEncoder() : new dn.TextEncoder(), Jt = `\r
`, aA = wr.encode(Jt), iA = 2;
class sA {
  constructor(t, n) {
    const { escapeName: r } = this.constructor, a = A.isString(n);
    let i = `Content-Disposition: form-data; name="${r(t)}"${!a && n.name ? `; filename="${r(n.name)}"` : ""}${Jt}`;
    if (a)
      n = wr.encode(String(n).replace(/\r?\n|\r\n?/g, Jt));
    else {
      const s = String(n.type || "application/octet-stream").replace(/[\r\n]/g, "");
      i += `Content-Type: ${s}${Jt}`;
    }
    this.headers = wr.encode(i + Jt), this.contentLength = a ? n.byteLength : n.size, this.size = this.headers.byteLength + this.contentLength + iA, this.name = t, this.value = n;
  }
  async *encode() {
    yield this.headers;
    const { value: t } = this;
    A.isTypedArray(t) ? yield t : yield* sm(t), yield aA;
  }
  static escapeName(t) {
    return String(t).replace(
      /[\r\n"]/g,
      (n) => ({
        "\r": "%0D",
        "\n": "%0A",
        '"': "%22"
      })[n]
    );
  }
}
const oA = (e, t, n) => {
  const {
    tag: r = "form-data-boundary",
    size: a = 25,
    boundary: i = r + "-" + ye.generateString(a, rA)
  } = n || {};
  if (!A.isFormData(e))
    throw TypeError("FormData instance required");
  if (i.length < 1 || i.length > 70)
    throw Error("boundary must be 1-70 characters long");
  const s = wr.encode("--" + i + Jt), o = wr.encode("--" + i + "--" + Jt);
  let l = o.byteLength;
  const u = Array.from(e.entries()).map(([p, f]) => {
    const h = new sA(p, f);
    return l += h.size, h;
  });
  l += s.byteLength * u.length, l = A.toFiniteNumber(l);
  const c = {
    "Content-Type": `multipart/form-data; boundary=${i}`
  };
  return Number.isFinite(l) && (c["Content-Length"] = l), t && t(c), Nm.from(
    async function* () {
      for (const p of u)
        yield s, yield* p.encode();
      yield o;
    }()
  );
};
class cA extends Ae.Transform {
  __transform(t, n, r) {
    this.push(t), r();
  }
  _transform(t, n, r) {
    if (t.length !== 0 && (this._transform = this.__transform, t[0] !== 120)) {
      const a = Buffer.alloc(2);
      a[0] = 120, a[1] = 156, this.push(a, n);
    }
    this.__transform(t, n, r);
  }
}
const lA = (e, t) => A.isAsyncFn(e) ? function(...n) {
  const r = n.pop();
  e.apply(this, n).then((a) => {
    try {
      t ? r(null, ...t(a)) : r(null, a);
    } catch (i) {
      r(i);
    }
  }, r);
} : e, uA = /* @__PURE__ */ new Set(["localhost"]), om = (e) => {
  const t = e.split(".");
  return t.length !== 4 || t[0] !== "127" ? !1 : t.every((n) => /^\d+$/.test(n) && Number(n) >= 0 && Number(n) <= 255);
}, pA = (e) => {
  if (e === "::1") return !0;
  const t = e.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (t) return om(t[1]);
  const n = e.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (n) {
    const a = parseInt(n[1], 16);
    return a >= 32512 && a <= 32767;
  }
  const r = e.split(":");
  if (r.length === 8) {
    for (let a = 0; a < 7; a++)
      if (!/^0+$/.test(r[a])) return !1;
    return /^0*1$/.test(r[7]);
  }
  return !1;
}, Qu = (e) => e ? uA.has(e) || om(e) ? !0 : pA(e) : !1, dA = {
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
  ftp: 21
}, fA = (e) => {
  let t = e, n = 0;
  if (t.charAt(0) === "[") {
    const i = t.indexOf("]");
    if (i !== -1) {
      const s = t.slice(1, i), o = t.slice(i + 1);
      return o.charAt(0) === ":" && /^\d+$/.test(o.slice(1)) && (n = Number.parseInt(o.slice(1), 10)), [s, n];
    }
  }
  const r = t.indexOf(":"), a = t.lastIndexOf(":");
  return r !== -1 && r === a && /^\d+$/.test(t.slice(a + 1)) && (n = Number.parseInt(t.slice(a + 1), 10), t = t.slice(0, a)), [t, n];
}, mA = /^(?:::|(?:0{1,4}:){1,4}:|(?:0{1,4}:){5})ffff:(\d+\.\d+\.\d+\.\d+)$/i, hA = /^(?:::|(?:0{1,4}:){1,4}:|(?:0{1,4}:){5})ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i, vA = (e) => {
  if (typeof e != "string" || e.indexOf(":") === -1) return e;
  const t = e.match(mA);
  if (t) return t[1];
  const n = e.match(hA);
  if (n) {
    const r = parseInt(n[1], 16), a = parseInt(n[2], 16);
    return `${r >> 8}.${r & 255}.${a >> 8}.${a & 255}`;
  }
  return e;
}, Zu = (e) => e && (e.charAt(0) === "[" && e.charAt(e.length - 1) === "]" && (e = e.slice(1, -1)), vA(e.replace(/\.+$/, "")));
function yA(e) {
  let t;
  try {
    t = new URL(e);
  } catch {
    return !1;
  }
  const n = (process.env.no_proxy || process.env.NO_PROXY || "").toLowerCase();
  if (!n)
    return !1;
  if (n === "*")
    return !0;
  const r = Number.parseInt(t.port, 10) || dA[t.protocol.split(":", 1)[0]] || 0, a = Zu(t.hostname.toLowerCase());
  return n.split(/[\s,]+/).some((i) => {
    if (!i)
      return !1;
    let [s, o] = fA(i);
    return s = Zu(s), !s || o && o !== r ? !1 : (s.charAt(0) === "*" && (s = s.slice(1)), s.charAt(0) === "." ? a.endsWith(s) : a === s || Qu(a) && Qu(s));
  });
}
function gA(e, t) {
  e = e || 10;
  const n = new Array(e), r = new Array(e);
  let a = 0, i = 0, s;
  return t = t !== void 0 ? t : 1e3, function(l) {
    const u = Date.now(), c = r[i];
    s || (s = u), n[a] = l, r[a] = u;
    let p = i, f = 0;
    for (; p !== a; )
      f += n[p++], p = p % e;
    if (a = (a + 1) % e, a === i && (i = (i + 1) % e), u - s < t)
      return;
    const h = c && u - c;
    return h ? Math.round(f * 1e3 / h) : void 0;
  };
}
function xA(e, t) {
  let n = 0, r = 1e3 / t, a, i;
  const s = (u, c = Date.now()) => {
    n = c, a = null, i && (clearTimeout(i), i = null), e(...u);
  };
  return [(...u) => {
    const c = Date.now(), p = c - n;
    p >= r ? s(u, c) : (a = u, i || (i = setTimeout(() => {
      i = null, s(a);
    }, r - p)));
  }, () => a && s(a)];
}
const Mn = (e, t, n = 3) => {
  let r = 0;
  const a = gA(50, 250);
  return xA((i) => {
    if (!i || typeof i.loaded != "number")
      return;
    const s = i.loaded, o = i.lengthComputable ? i.total : void 0, l = o != null ? Math.min(s, o) : s, u = Math.max(0, l - r), c = a(u);
    r = Math.max(r, l);
    const p = {
      loaded: l,
      total: o,
      progress: o ? l / o : void 0,
      bytes: u,
      rate: c || void 0,
      estimated: c && o ? (o - l) / c : void 0,
      event: i,
      lengthComputable: o != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
  }, n);
}, Oa = (e, t) => {
  const n = e != null;
  return [
    (r) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: r
    }),
    t[1]
  ];
}, Aa = (e) => (...t) => A.asap(() => e(...t));
function cm(e) {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const t = e.indexOf(",");
  if (t < 0) return 0;
  const n = e.slice(5, t), r = e.slice(t + 1);
  if (/;base64/i.test(n)) {
    let s = r.length;
    const o = r.length;
    for (let h = 0; h < o; h++)
      if (r.charCodeAt(h) === 37 && h + 2 < o) {
        const g = r.charCodeAt(h + 1), m = r.charCodeAt(h + 2);
        (g >= 48 && g <= 57 || g >= 65 && g <= 70 || g >= 97 && g <= 102) && (m >= 48 && m <= 57 || m >= 65 && m <= 70 || m >= 97 && m <= 102) && (s -= 2, h += 2);
      }
    let l = 0, u = o - 1;
    const c = (h) => h >= 2 && r.charCodeAt(h - 2) === 37 && // '%'
    r.charCodeAt(h - 1) === 51 && // '3'
    (r.charCodeAt(h) === 68 || r.charCodeAt(h) === 100);
    u >= 0 && (r.charCodeAt(u) === 61 ? (l++, u--) : c(u) && (l++, u -= 3)), l === 1 && u >= 0 && (r.charCodeAt(u) === 61 || c(u)) && l++;
    const f = Math.floor(s / 4) * 3 - (l || 0);
    return f > 0 ? f : 0;
  }
  if (typeof Buffer < "u" && typeof Buffer.byteLength == "function")
    return Buffer.byteLength(r, "utf8");
  let i = 0;
  for (let s = 0, o = r.length; s < o; s++) {
    const l = r.charCodeAt(s);
    if (l < 128)
      i += 1;
    else if (l < 2048)
      i += 2;
    else if (l >= 55296 && l <= 56319 && s + 1 < o) {
      const u = r.charCodeAt(s + 1);
      u >= 56320 && u <= 57343 ? (i += 4, s++) : i += 3;
    } else
      i += 3;
  }
  return i;
}
const ep = {
  flush: Ft.constants.Z_SYNC_FLUSH,
  finishFlush: Ft.constants.Z_SYNC_FLUSH
}, bA = {
  flush: Ft.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: Ft.constants.BROTLI_OPERATION_FLUSH
}, tp = A.isFunction(Ft.createBrotliDecompress), { http: _A, https: EA } = eA, lm = /https:?/, wA = ["content-type", "content-length"];
function $A(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t).forEach(([r, a]) => {
    wA.includes(r.toLowerCase()) && e.set(r, a);
  });
}
const np = Symbol("axios.http.socketListener"), sa = Symbol("axios.http.currentReq"), um = Symbol("axios.http.installedTunnel"), SA = /* @__PURE__ */ new Map(), rp = /* @__PURE__ */ new WeakMap();
function TA(e, t) {
  const n = e.protocol + "//" + e.hostname + ":" + (e.port || "") + "#" + (e.auth || ""), r = t ? rp.get(t) || rp.set(t, /* @__PURE__ */ new Map()).get(t) : SA;
  let a = r.get(n);
  if (a) return a;
  const i = t && t.options ? { ...t.options, ...e } : e;
  return a = new em(i), a[um] = !0, r.set(n, a), a;
}
const ap = ye.protocols.map((e) => e + ":"), ip = (e) => {
  if (!A.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, sp = (e, [t, n]) => (e.on("end", n).on("error", n), t);
class RA {
  constructor() {
    this.sessions = /* @__PURE__ */ Object.create(null);
  }
  getSession(t, n) {
    n = Object.assign(
      {
        sessionTimeout: 1e3
      },
      n
    );
    let r = this.sessions[t];
    if (r) {
      let c = r.length;
      for (let p = 0; p < c; p++) {
        const [f, h] = r[p];
        if (!f.destroyed && !f.closed && dn.isDeepStrictEqual(h, n))
          return f;
      }
    }
    const a = _p.connect(t, n);
    let i;
    const s = () => {
      if (i)
        return;
      i = !0;
      let c = r, p = c.length, f = p;
      for (; f--; )
        if (c[f][0] === a) {
          p === 1 ? delete this.sessions[t] : c.splice(f, 1), a.closed || a.close();
          return;
        }
    }, o = a.request, { sessionTimeout: l } = n;
    if (l != null) {
      let c, p = 0;
      a.request = function() {
        const f = o.apply(this, arguments);
        return p++, c && (clearTimeout(c), c = null), f.once("close", () => {
          --p || (c = setTimeout(() => {
            c = null, s();
          }, l));
        }), f;
      };
    }
    a.once("close", s);
    let u = [a, n];
    return r ? r.push(u) : r = this.sessions[t] = [u], a;
  }
}
const OA = new RA();
function AA(e, t, n) {
  e.beforeRedirects.proxy && e.beforeRedirects.proxy(e), e.beforeRedirects.config && e.beforeRedirects.config(e, t, n);
}
function pm(e, t, n, r, a) {
  let i = t;
  if (!i && i !== !1) {
    const s = lO(n);
    s && (yA(n) || (i = new URL(s)));
  }
  if (r && e.headers)
    for (const s of Object.keys(e.headers))
      s.toLowerCase() === "proxy-authorization" && delete e.headers[s];
  if (r && e.agent && e.agent[um] && (e.agent = void 0), i) {
    const s = i instanceof URL, o = (f) => s || A.hasOwnProp(i, f) ? i[f] : void 0, l = o("username"), u = o("password");
    let c = A.hasOwnProp(i, "auth") ? i.auth : void 0;
    if (l && (c = (l || "") + ":" + (u || "")), c) {
      const f = typeof c == "object", h = f && A.hasOwnProp(c, "username") ? c.username : void 0, g = f && A.hasOwnProp(c, "password") ? c.password : void 0;
      if (!!(h || g))
        c = (h || "") + ":" + (g || "");
      else if (f)
        throw new G("Invalid proxy authorization", G.ERR_BAD_OPTION, { proxy: i });
    }
    if (lm.test(e.protocol)) {
      if (!(a instanceof em)) {
        const f = o("hostname") || o("host"), h = o("port"), g = o("protocol"), m = g ? g.includes(":") ? g : `${g}:` : "http:", v = f && f.includes(":") && !f.startsWith("[") ? `[${f}]` : f, d = new URL(
          `${m}//${v}${h ? ":" + h : ""}`
        ), y = {
          protocol: d.protocol,
          hostname: d.hostname.replace(/^\[|\]$/g, ""),
          port: d.port,
          auth: c && typeof c == "string" ? c : void 0
        };
        d.protocol === "https:" && (y.ALPNProtocols = ["http/1.1"]);
        const _ = TA(y, a);
        e.agent = _, e.agents && (e.agents.https = _);
      }
    } else {
      if (c) {
        const m = Buffer.from(c, "utf8").toString("base64");
        e.headers["Proxy-Authorization"] = "Basic " + m;
      }
      let f = !1;
      for (const m of Object.keys(e.headers))
        if (m.toLowerCase() === "host") {
          f = !0;
          break;
        }
      f || (e.headers.host = e.hostname + (e.port ? ":" + e.port : ""));
      const h = o("hostname") || o("host");
      e.hostname = h, e.host = h, e.port = o("port"), e.path = n;
      const g = o("protocol");
      g && (e.protocol = g.includes(":") ? g : `${g}:`);
    }
  }
  e.beforeRedirects.proxy = function(o) {
    pm(o, t, o.href, !0, a);
  };
}
const PA = typeof process < "u" && A.kindOf(process) === "process", kA = (e) => new Promise((t, n) => {
  let r, a;
  const i = (l, u) => {
    a || (a = !0, r && r(l, u));
  }, s = (l) => {
    i(l), t(l);
  }, o = (l) => {
    i(l, !0), n(l);
  };
  e(s, o, (l) => r = l).catch(o);
}), NA = ({ address: e, family: t }) => {
  if (!A.isString(e))
    throw TypeError("address must be a string");
  return {
    address: e,
    family: t || (e.indexOf(".") < 0 ? 6 : 4)
  };
}, op = (e, t) => NA(A.isObject(e) ? e : { address: e, family: t }), IA = {
  request(e, t) {
    const n = e.protocol + "//" + e.hostname + ":" + (e.port || (e.protocol === "https:" ? 443 : 80)), { http2Options: r, headers: a } = e, i = OA.getSession(n, r), { HTTP2_HEADER_SCHEME: s, HTTP2_HEADER_METHOD: o, HTTP2_HEADER_PATH: l, HTTP2_HEADER_STATUS: u } = _p.constants, c = {
      [s]: e.protocol.replace(":", ""),
      [o]: e.method,
      [l]: e.path
    };
    A.forEach(a, (f, h) => {
      h.charAt(0) !== ":" && (c[h] = f);
    });
    const p = i.request(c);
    return p.once("response", (f) => {
      const h = p;
      f = Object.assign({}, f);
      const g = f[u];
      delete f[u], h.headers = f, h.statusCode = +g, t(h);
    }), p;
  }
}, jA = PA && function(t) {
  return kA(async function(r, a, i) {
    const s = (q) => A.hasOwnProp(t, q) ? t[q] : void 0;
    let o = s("data"), l = s("lookup"), u = s("family"), c = s("httpVersion");
    c === void 0 && (c = 1);
    let p = s("http2Options");
    const f = s("responseType"), h = s("responseEncoding"), g = t.method.toUpperCase();
    let m, v = !1, d, y;
    if (c = +c, Number.isNaN(c))
      throw TypeError(`Invalid protocol version: '${t.httpVersion}' is not a number`);
    if (c !== 1 && c !== 2)
      throw TypeError(`Unsupported protocol version '${c}'`);
    const _ = c === 2;
    if (l) {
      const q = lA(l, (z) => A.isArray(z) ? z : [z]);
      l = (z, X, W) => {
        q(z, X, (J, ue, fe) => {
          if (J)
            return W(J);
          const ie = A.isArray(ue) ? ue.map((Ge) => op(Ge)) : [op(ue, fe)];
          X.all ? W(J, ie) : W(J, ie[0].address, ie[0].family);
        });
      };
    }
    const x = new km();
    function E(q) {
      try {
        x.emit(
          "abort",
          !q || q.type ? new ln(null, t, d) : q
        );
      } catch (z) {
        console.warn("emit error", z);
      }
    }
    function I() {
      y && (clearTimeout(y), y = null);
    }
    function C() {
      let q = t.timeout ? "timeout of " + t.timeout + "ms exceeded" : "timeout exceeded";
      const z = t.transitional || ti;
      return t.timeoutErrorMessage && (q = t.timeoutErrorMessage), new G(
        q,
        z.clarifyTimeoutError ? G.ETIMEDOUT : G.ECONNABORTED,
        t,
        d
      );
    }
    x.once("abort", a);
    const D = () => {
      I(), t.cancelToken && t.cancelToken.unsubscribe(E), t.signal && t.signal.removeEventListener("abort", E), x.removeAllListeners();
    };
    (t.cancelToken || t.signal) && (t.cancelToken && t.cancelToken.subscribe(E), t.signal && (t.signal.aborted ? E() : t.signal.addEventListener("abort", E))), i((q, z) => {
      if (m = !0, I(), z) {
        v = !0, D();
        return;
      }
      const { data: X } = q;
      if (X instanceof Ae.Readable || X instanceof Ae.Duplex) {
        const W = Ae.finished(X, () => {
          W(), D();
        });
      } else
        D();
    });
    const S = fc(t.baseURL, t.url, t.allowAbsoluteUrls), R = new URL(S, ye.hasBrowserEnv ? ye.origin : void 0), O = R.protocol || ap[0];
    if (O === "data:") {
      if (t.maxContentLength > -1) {
        const z = String(t.url || S || "");
        if (cm(z) > t.maxContentLength)
          return a(
            new G(
              "maxContentLength size of " + t.maxContentLength + " exceeded",
              G.ERR_BAD_RESPONSE,
              t
            )
          );
      }
      let q;
      if (g !== "GET")
        return On(r, a, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config: t
        });
      try {
        q = nA(t.url, f === "blob", {
          Blob: t.env && t.env.Blob
        });
      } catch (z) {
        throw G.from(z, G.ERR_BAD_REQUEST, t);
      }
      return f === "text" ? (q = q.toString(h), (!h || h === "utf8") && (q = A.stripBOM(q))) : f === "stream" && (q = Ae.Readable.from(q)), On(r, a, {
        data: q,
        status: 200,
        statusText: "OK",
        headers: new Te(),
        config: t
      });
    }
    if (ap.indexOf(O) === -1)
      return a(
        new G("Unsupported protocol " + O, G.ERR_BAD_REQUEST, t)
      );
    const k = Te.from(t.headers).normalize();
    k.set("User-Agent", "axios/" + Er, !1);
    const { onUploadProgress: V, onDownloadProgress: P } = t, F = t.maxRate;
    let H, j;
    if (A.isSpecCompliantForm(o)) {
      const q = k.getContentType(/boundary=([-_\w\d]{10,70})/i);
      o = oA(
        o,
        (z) => {
          k.set(z);
        },
        {
          tag: `axios-${Er}-boundary`,
          boundary: q && q[1] || void 0
        }
      );
    } else if (A.isFormData(o) && A.isFunction(o.getHeaders) && o.getHeaders !== Object.prototype.getHeaders) {
      if ($A(k, o.getHeaders(), s("formDataHeaderPolicy")), !k.hasContentLength())
        try {
          const q = await dn.promisify(o.getLength).call(o);
          Number.isFinite(q) && q >= 0 && k.setContentLength(q);
        } catch {
        }
    } else if (A.isBlob(o) || A.isFile(o))
      o.size && k.setContentType(o.type || "application/octet-stream"), k.setContentLength(o.size || 0), o = Ae.Readable.from(sm(o));
    else if (o && !A.isStream(o)) {
      if (!Buffer.isBuffer(o)) if (A.isArrayBuffer(o))
        o = Buffer.from(new Uint8Array(o));
      else if (A.isString(o))
        o = Buffer.from(o, "utf-8");
      else
        return a(
          new G(
            "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
            G.ERR_BAD_REQUEST,
            t
          )
        );
      if (k.setContentLength(o.length, !1), t.maxBodyLength > -1 && o.length > t.maxBodyLength)
        return a(
          new G(
            "Request body larger than maxBodyLength limit",
            G.ERR_BAD_REQUEST,
            t
          )
        );
    }
    const U = A.toFiniteNumber(k.getContentLength());
    A.isArray(F) ? (H = F[0], j = F[1]) : H = j = F, o && (V || H) && (A.isStream(o) || (o = Ae.Readable.from(o, { objectMode: !1 })), o = Ae.pipeline(
      [
        o,
        new Yu({
          maxRate: A.toFiniteNumber(H)
        })
      ],
      A.noop
    ), V && o.on(
      "progress",
      sp(
        o,
        Oa(
          U,
          Mn(Aa(V), !1, 3)
        )
      )
    ));
    let B;
    const L = s("auth");
    if (L) {
      const q = L.username || "", z = L.password || "";
      B = q + ":" + z;
    }
    if (!B && R.username) {
      const q = ip(R.username), z = ip(R.password);
      B = q + ":" + z;
    }
    B && k.delete("authorization");
    let $;
    try {
      $ = pc(
        R.pathname + R.search,
        t.params,
        t.paramsSerializer
      ).replace(/^\?/, "");
    } catch (q) {
      const z = new Error(q.message);
      return z.config = t, z.url = t.url, z.exists = !0, a(z);
    }
    k.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (tp ? ", br" : ""),
      !1
    );
    const N = Object.assign(/* @__PURE__ */ Object.create(null), {
      path: $,
      method: g,
      headers: sc(k),
      agents: { http: t.httpAgent, https: t.httpsAgent },
      auth: B,
      protocol: O,
      family: u,
      beforeRedirect: AA,
      beforeRedirects: /* @__PURE__ */ Object.create(null),
      http2Options: p
    });
    if (!A.isUndefined(l) && (N.lookup = l), t.socketPath) {
      if (typeof t.socketPath != "string")
        return a(
          new G("socketPath must be a string", G.ERR_BAD_OPTION_VALUE, t)
        );
      if (t.allowedSocketPaths != null) {
        const q = Array.isArray(t.allowedSocketPaths) ? t.allowedSocketPaths : [t.allowedSocketPaths], z = Pc(t.socketPath);
        if (!q.some(
          (W) => typeof W == "string" && Pc(W) === z
        ))
          return a(
            new G(
              `socketPath "${t.socketPath}" is not permitted by allowedSocketPaths`,
              G.ERR_BAD_OPTION_VALUE,
              t
            )
          );
      }
      N.socketPath = t.socketPath;
    } else
      N.hostname = R.hostname.startsWith("[") ? R.hostname.slice(1, -1) : R.hostname, N.port = R.port, pm(
        N,
        t.proxy,
        O + "//" + R.hostname + (R.port ? ":" + R.port : "") + N.path,
        !1,
        t.httpsAgent
      );
    let T, b = !1;
    const w = lm.test(N.protocol);
    if (N.agent == null && (N.agent = w ? t.httpsAgent : t.httpAgent), _)
      T = IA;
    else {
      const q = s("transport");
      if (q)
        T = q;
      else if (t.maxRedirects === 0)
        T = w ? Bs : qs, b = !0;
      else {
        t.maxRedirects && (N.maxRedirects = t.maxRedirects);
        const z = s("beforeRedirect");
        z && (N.beforeRedirects.config = z), T = w ? EA : _A;
      }
    }
    t.maxBodyLength > -1 ? N.maxBodyLength = t.maxBodyLength : N.maxBodyLength = 1 / 0, N.insecureHTTPParser = !!s("insecureHTTPParser"), d = T.request(N, function(z) {
      if (I(), d.destroyed) return;
      const X = [z], W = A.toFiniteNumber(z.headers["content-length"]);
      if (P || j) {
        const ie = new Yu({
          maxRate: A.toFiniteNumber(j)
        });
        P && ie.on(
          "progress",
          sp(
            ie,
            Oa(
              W,
              Mn(Aa(P), !0, 3)
            )
          )
        ), X.push(ie);
      }
      let J = z;
      const ue = z.req || d;
      if (t.decompress !== !1 && z.headers["content-encoding"])
        switch ((g === "HEAD" || z.statusCode === 204) && delete z.headers["content-encoding"], (z.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            X.push(Ft.createUnzip(ep)), delete z.headers["content-encoding"];
            break;
          case "deflate":
            X.push(new cA()), X.push(Ft.createUnzip(ep)), delete z.headers["content-encoding"];
            break;
          case "br":
            tp && (X.push(Ft.createBrotliDecompress(bA)), delete z.headers["content-encoding"]);
        }
      J = X.length > 1 ? Ae.pipeline(X, A.noop) : X[0];
      const fe = {
        status: z.statusCode,
        statusText: z.statusMessage,
        headers: new Te(z.headers),
        config: t,
        request: ue
      };
      if (f === "stream") {
        if (t.maxContentLength > -1) {
          const ie = t.maxContentLength, Ge = J;
          async function* tt() {
            let me = 0;
            for await (const Ye of Ge) {
              if (me += Ye.length, me > ie)
                throw new G(
                  "maxContentLength size of " + ie + " exceeded",
                  G.ERR_BAD_RESPONSE,
                  t,
                  ue
                );
              yield Ye;
            }
          }
          J = Ae.Readable.from(tt(), {
            objectMode: !1
          });
        }
        fe.data = J, On(r, a, fe);
      } else {
        const ie = [];
        let Ge = 0;
        J.on("data", function(me) {
          ie.push(me), Ge += me.length, t.maxContentLength > -1 && Ge > t.maxContentLength && (v = !0, J.destroy(), E(
            new G(
              "maxContentLength size of " + t.maxContentLength + " exceeded",
              G.ERR_BAD_RESPONSE,
              t,
              ue
            )
          ));
        }), J.on("aborted", function() {
          if (v)
            return;
          const me = new G(
            "stream has been aborted",
            G.ERR_BAD_RESPONSE,
            t,
            ue,
            fe
          );
          J.destroy(me), a(me);
        }), J.on("error", function(me) {
          v || a(G.from(me, null, t, ue, fe));
        }), J.on("end", function() {
          try {
            let me = ie.length === 1 ? ie[0] : Buffer.concat(ie);
            f !== "arraybuffer" && (me = me.toString(h), (!h || h === "utf8") && (me = A.stripBOM(me))), fe.data = me;
          } catch (me) {
            return a(G.from(me, null, t, fe.request, fe));
          }
          On(r, a, fe);
        });
      }
      x.once("abort", (ie) => {
        J.destroyed || (J.emit("error", ie), J.destroy());
      });
    }), x.once("abort", (q) => {
      d.close ? d.close() : d.destroy(q);
    }), d.on("error", function(z) {
      a(G.from(z, null, t, d));
    });
    const M = /* @__PURE__ */ new Set();
    if (d.on("socket", function(z) {
      z.setKeepAlive(!0, 1e3 * 60), z[np] || (z.on("error", function(W) {
        const J = z[sa];
        J && !J.destroyed && J.destroy(W);
      }), z[np] = !0), z[sa] = d, M.add(z);
    }), d.once("close", function() {
      I();
      for (const z of M)
        z[sa] === d && (z[sa] = null);
      M.clear();
    }), t.timeout) {
      const q = parseInt(t.timeout, 10);
      if (Number.isNaN(q)) {
        E(
          new G(
            "error trying to parse `config.timeout` to int",
            G.ERR_BAD_OPTION_VALUE,
            t,
            d
          )
        );
        return;
      }
      const z = function() {
        m || E(C());
      };
      b && q > 0 && (y = setTimeout(z, q)), d.setTimeout(q, z);
    } else
      d.setTimeout(0);
    if (A.isStream(o)) {
      let q = !1, z = !1;
      o.on("end", () => {
        q = !0;
      }), o.once("error", (W) => {
        z = !0, d.destroy(W);
      }), o.on("close", () => {
        !q && !z && E(new ln("Request stream has been aborted", t, d));
      });
      let X = o;
      if (t.maxBodyLength > -1 && t.maxRedirects === 0) {
        const W = t.maxBodyLength;
        let J = 0;
        X = Ae.pipeline(
          [
            o,
            new Ae.Transform({
              transform(ue, fe, ie) {
                if (J += ue.length, J > W)
                  return ie(
                    new G(
                      "Request body larger than maxBodyLength limit",
                      G.ERR_BAD_REQUEST,
                      t,
                      d
                    )
                  );
                ie(null, ue);
              }
            })
          ],
          A.noop
        ), X.on("error", (ue) => {
          d.destroyed || d.destroy(ue);
        });
      }
      X.pipe(d);
    } else
      o && d.write(o), d.end();
  });
}, CA = ye.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, ye.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(ye.origin),
  ye.navigator && /(msie|trident)/i.test(ye.navigator.userAgent)
) : () => !0, LA = ye.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, r, a, i, s) {
      if (typeof document > "u") return;
      const o = [`${e}=${encodeURIComponent(t)}`];
      A.isNumber(n) && o.push(`expires=${new Date(n).toUTCString()}`), A.isString(r) && o.push(`path=${r}`), A.isString(a) && o.push(`domain=${a}`), i === !0 && o.push("secure"), A.isString(s) && o.push(`SameSite=${s}`), document.cookie = o.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let n = 0; n < t.length; n++) {
        const r = t[n].replace(/^\s+/, ""), a = r.indexOf("=");
        if (a !== -1 && r.slice(0, a) === e)
          return decodeURIComponent(r.slice(a + 1));
      }
      return null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
), cp = (e) => e instanceof Te ? { ...e } : e;
function pn(e, t) {
  t = t || {};
  const n = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(n, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
  function r(u, c, p, f) {
    return A.isPlainObject(u) && A.isPlainObject(c) ? A.merge.call({ caseless: f }, u, c) : A.isPlainObject(c) ? A.merge({}, c) : A.isArray(c) ? c.slice() : c;
  }
  function a(u, c, p, f) {
    if (A.isUndefined(c)) {
      if (!A.isUndefined(u))
        return r(void 0, u, p, f);
    } else return r(u, c, p, f);
  }
  function i(u, c) {
    if (!A.isUndefined(c))
      return r(void 0, c);
  }
  function s(u, c) {
    if (A.isUndefined(c)) {
      if (!A.isUndefined(u))
        return r(void 0, u);
    } else return r(void 0, c);
  }
  function o(u, c, p) {
    if (A.hasOwnProp(t, p))
      return r(u, c);
    if (A.hasOwnProp(e, p))
      return r(void 0, u);
  }
  const l = {
    url: i,
    method: i,
    data: i,
    baseURL: s,
    transformRequest: s,
    transformResponse: s,
    paramsSerializer: s,
    timeout: s,
    timeoutMessage: s,
    withCredentials: s,
    withXSRFToken: s,
    adapter: s,
    responseType: s,
    xsrfCookieName: s,
    xsrfHeaderName: s,
    onUploadProgress: s,
    onDownloadProgress: s,
    decompress: s,
    maxContentLength: s,
    maxBodyLength: s,
    beforeRedirect: s,
    transport: s,
    httpAgent: s,
    httpsAgent: s,
    cancelToken: s,
    socketPath: s,
    allowedSocketPaths: s,
    responseEncoding: s,
    validateStatus: o,
    headers: (u, c, p) => a(cp(u), cp(c), p, !0)
  };
  return A.forEach(Object.keys({ ...e, ...t }), function(c) {
    if (c === "__proto__" || c === "constructor" || c === "prototype") return;
    const p = A.hasOwnProp(l, c) ? l[c] : a, f = A.hasOwnProp(e, c) ? e[c] : void 0, h = A.hasOwnProp(t, c) ? t[c] : void 0, g = p(f, h, c);
    A.isUndefined(g) && p !== o || (n[c] = g);
  }), n;
}
const DA = ["content-type", "content-length"];
function FA(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t).forEach(([r, a]) => {
    DA.includes(r.toLowerCase()) && e.set(r, a);
  });
}
const UA = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), dm = (e) => {
  const t = pn({}, e), n = (f) => A.hasOwnProp(t, f) ? t[f] : void 0, r = n("data");
  let a = n("withXSRFToken");
  const i = n("xsrfHeaderName"), s = n("xsrfCookieName");
  let o = n("headers");
  const l = n("auth"), u = n("baseURL"), c = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = o = Te.from(o), t.url = pc(
    fc(u, p, c),
    e.params,
    e.paramsSerializer
  ), l && o.set(
    "Authorization",
    "Basic " + btoa((l.username || "") + ":" + (l.password ? UA(l.password) : ""))
  ), A.isFormData(r) && (ye.hasStandardBrowserEnv || ye.hasStandardBrowserWebWorkerEnv ? o.setContentType(void 0) : A.isFunction(r.getHeaders) && FA(o, r.getHeaders(), n("formDataHeaderPolicy"))), ye.hasStandardBrowserEnv && (A.isFunction(a) && (a = a(t)), a === !0 || a == null && CA(t.url))) {
    const h = i && s && LA.read(s);
    h && o.set(i, h);
  }
  return t;
}, MA = typeof XMLHttpRequest < "u", zA = MA && function(e) {
  return new Promise(function(n, r) {
    const a = dm(e);
    let i = a.data;
    const s = Te.from(a.headers).normalize();
    let { responseType: o, onUploadProgress: l, onDownloadProgress: u } = a, c, p, f, h, g;
    function m() {
      h && h(), g && g(), a.cancelToken && a.cancelToken.unsubscribe(c), a.signal && a.signal.removeEventListener("abort", c);
    }
    let v = new XMLHttpRequest();
    v.open(a.method.toUpperCase(), a.url, !0), v.timeout = a.timeout;
    function d() {
      if (!v)
        return;
      const _ = Te.from(
        "getAllResponseHeaders" in v && v.getAllResponseHeaders()
      ), E = {
        data: !o || o === "text" || o === "json" ? v.responseText : v.response,
        status: v.status,
        statusText: v.statusText,
        headers: _,
        config: e,
        request: v
      };
      On(
        function(C) {
          n(C), m();
        },
        function(C) {
          r(C), m();
        },
        E
      ), v = null;
    }
    "onloadend" in v ? v.onloadend = d : v.onreadystatechange = function() {
      !v || v.readyState !== 4 || v.status === 0 && !(v.responseURL && v.responseURL.startsWith("file:")) || setTimeout(d);
    }, v.onabort = function() {
      v && (r(new G("Request aborted", G.ECONNABORTED, e, v)), m(), v = null);
    }, v.onerror = function(x) {
      const E = x && x.message ? x.message : "Network Error", I = new G(E, G.ERR_NETWORK, e, v);
      I.event = x || null, r(I), m(), v = null;
    }, v.ontimeout = function() {
      let x = a.timeout ? "timeout of " + a.timeout + "ms exceeded" : "timeout exceeded";
      const E = a.transitional || ti;
      a.timeoutErrorMessage && (x = a.timeoutErrorMessage), r(
        new G(
          x,
          E.clarifyTimeoutError ? G.ETIMEDOUT : G.ECONNABORTED,
          e,
          v
        )
      ), m(), v = null;
    }, i === void 0 && s.setContentType(null), "setRequestHeader" in v && A.forEach(sc(s), function(x, E) {
      v.setRequestHeader(E, x);
    }), A.isUndefined(a.withCredentials) || (v.withCredentials = !!a.withCredentials), o && o !== "json" && (v.responseType = a.responseType), u && ([f, g] = Mn(u, !0), v.addEventListener("progress", f)), l && v.upload && ([p, h] = Mn(l), v.upload.addEventListener("progress", p), v.upload.addEventListener("loadend", h)), (a.cancelToken || a.signal) && (c = (_) => {
      v && (r(!_ || _.type ? new ln(null, e, v) : _), v.abort(), m(), v = null);
    }, a.cancelToken && a.cancelToken.subscribe(c), a.signal && (a.signal.aborted ? c() : a.signal.addEventListener("abort", c)));
    const y = im(a.url);
    if (y && !ye.protocols.includes(y)) {
      r(
        new G(
          "Unsupported protocol " + y + ":",
          G.ERR_BAD_REQUEST,
          e
        )
      );
      return;
    }
    v.send(i || null);
  });
}, qA = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let r = !1;
  const a = function(l) {
    if (!r) {
      r = !0, s();
      const u = l instanceof Error ? l : this.reason;
      n.abort(
        u instanceof G ? u : new ln(u instanceof Error ? u.message : u)
      );
    }
  };
  let i = t && setTimeout(() => {
    i = null, a(new G(`timeout of ${t}ms exceeded`, G.ETIMEDOUT));
  }, t);
  const s = () => {
    e && (i && clearTimeout(i), i = null, e.forEach((l) => {
      l.unsubscribe ? l.unsubscribe(a) : l.removeEventListener("abort", a);
    }), e = null);
  };
  e.forEach((l) => l.addEventListener("abort", a));
  const { signal: o } = n;
  return o.unsubscribe = () => A.asap(s), o;
}, BA = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let r = 0, a;
  for (; r < n; )
    a = r + t, yield e.slice(r, a), r = a;
}, VA = async function* (e, t) {
  for await (const n of HA(e))
    yield* BA(n, t);
}, HA = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: n, value: r } = await t.read();
      if (n)
        break;
      yield r;
    }
  } finally {
    await t.cancel();
  }
}, lp = (e, t, n, r) => {
  const a = VA(e, t);
  let i = 0, s, o = (l) => {
    s || (s = !0, r && r(l));
  };
  return new ReadableStream(
    {
      async pull(l) {
        try {
          const { done: u, value: c } = await a.next();
          if (u) {
            o(), l.close();
            return;
          }
          let p = c.byteLength;
          if (n) {
            let f = i += p;
            n(f);
          }
          l.enqueue(new Uint8Array(c));
        } catch (u) {
          throw o(u), u;
        }
      },
      cancel(l) {
        return o(l), a.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, up = 64 * 1024, { isFunction: oa } = A, pp = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, GA = (e) => {
  const t = A.global !== void 0 && A.global !== null ? A.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
  e = A.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: a, Request: i, Response: s } = e, o = a ? oa(a) : typeof fetch == "function", l = oa(i), u = oa(s);
  if (!o)
    return !1;
  const c = o && oa(n), p = o && (typeof r == "function" ? /* @__PURE__ */ ((d) => (y) => d.encode(y))(new r()) : async (d) => new Uint8Array(await new i(d).arrayBuffer())), f = l && c && pp(() => {
    let d = !1;
    const y = new i(ye.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return d = !0, "half";
      }
    }), _ = y.headers.has("Content-Type");
    return y.body != null && y.body.cancel(), d && !_;
  }), h = u && c && pp(() => A.isReadableStream(new s("").body)), g = {
    stream: h && ((d) => d.body)
  };
  o && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((d) => {
    !g[d] && (g[d] = (y, _) => {
      let x = y && y[d];
      if (x)
        return x.call(y);
      throw new G(
        `Response type '${d}' is not supported`,
        G.ERR_NOT_SUPPORT,
        _
      );
    });
  });
  const m = async (d) => {
    if (d == null)
      return 0;
    if (A.isBlob(d))
      return d.size;
    if (A.isSpecCompliantForm(d))
      return (await new i(ye.origin, {
        method: "POST",
        body: d
      }).arrayBuffer()).byteLength;
    if (A.isArrayBufferView(d) || A.isArrayBuffer(d))
      return d.byteLength;
    if (A.isURLSearchParams(d) && (d = d + ""), A.isString(d))
      return (await p(d)).byteLength;
  }, v = async (d, y) => {
    const _ = A.toFiniteNumber(d.getContentLength());
    return _ ?? m(y);
  };
  return async (d) => {
    let {
      url: y,
      method: _,
      data: x,
      signal: E,
      cancelToken: I,
      timeout: C,
      onDownloadProgress: D,
      onUploadProgress: S,
      responseType: R,
      headers: O,
      withCredentials: k = "same-origin",
      fetchOptions: V,
      maxContentLength: P,
      maxBodyLength: F
    } = dm(d);
    const H = A.isNumber(P) && P > -1, j = A.isNumber(F) && F > -1;
    let U = a || fetch;
    R = R ? (R + "").toLowerCase() : "text";
    let B = qA(
      [E, I && I.toAbortSignal()],
      C
    ), L = null;
    const $ = B && B.unsubscribe && (() => {
      B.unsubscribe();
    });
    let N;
    try {
      if (H && typeof y == "string" && y.startsWith("data:") && cm(y) > P)
        throw new G(
          "maxContentLength size of " + P + " exceeded",
          G.ERR_BAD_RESPONSE,
          d,
          L
        );
      if (j && _ !== "get" && _ !== "head") {
        const z = await v(O, x);
        if (typeof z == "number" && isFinite(z) && z > F)
          throw new G(
            "Request body larger than maxBodyLength limit",
            G.ERR_BAD_REQUEST,
            d,
            L
          );
      }
      if (S && f && _ !== "get" && _ !== "head" && (N = await v(O, x)) !== 0) {
        let z = new i(y, {
          method: "POST",
          body: x,
          duplex: "half"
        }), X;
        if (A.isFormData(x) && (X = z.headers.get("content-type")) && O.setContentType(X), z.body) {
          const [W, J] = Oa(
            N,
            Mn(Aa(S))
          );
          x = lp(z.body, up, W, J);
        }
      }
      A.isString(k) || (k = k ? "include" : "omit");
      const T = l && "credentials" in i.prototype;
      if (A.isFormData(x)) {
        const z = O.getContentType();
        z && /^multipart\/form-data/i.test(z) && !/boundary=/i.test(z) && O.delete("content-type");
      }
      O.set("User-Agent", "axios/" + Er, !1);
      const b = {
        ...V,
        signal: B,
        method: _.toUpperCase(),
        headers: sc(O.normalize()),
        body: x,
        duplex: "half",
        credentials: T ? k : void 0
      };
      L = l && new i(y, b);
      let w = await (l ? U(L, V) : U(y, b));
      if (H) {
        const z = A.toFiniteNumber(w.headers.get("content-length"));
        if (z != null && z > P)
          throw new G(
            "maxContentLength size of " + P + " exceeded",
            G.ERR_BAD_RESPONSE,
            d,
            L
          );
      }
      const M = h && (R === "stream" || R === "response");
      if (h && w.body && (D || H || M && $)) {
        const z = {};
        ["status", "statusText", "headers"].forEach((ie) => {
          z[ie] = w[ie];
        });
        const X = A.toFiniteNumber(w.headers.get("content-length")), [W, J] = D && Oa(
          X,
          Mn(Aa(D), !0)
        ) || [];
        let ue = 0;
        const fe = (ie) => {
          if (H && (ue = ie, ue > P))
            throw new G(
              "maxContentLength size of " + P + " exceeded",
              G.ERR_BAD_RESPONSE,
              d,
              L
            );
          W && W(ie);
        };
        w = new s(
          lp(w.body, up, fe, () => {
            J && J(), $ && $();
          }),
          z
        );
      }
      R = R || "text";
      let q = await g[A.findKey(g, R) || "text"](
        w,
        d
      );
      if (H && !h && !M) {
        let z;
        if (q != null && (typeof q.byteLength == "number" ? z = q.byteLength : typeof q.size == "number" ? z = q.size : typeof q == "string" && (z = typeof r == "function" ? new r().encode(q).byteLength : q.length)), typeof z == "number" && z > P)
          throw new G(
            "maxContentLength size of " + P + " exceeded",
            G.ERR_BAD_RESPONSE,
            d,
            L
          );
      }
      return !M && $ && $(), await new Promise((z, X) => {
        On(z, X, {
          data: q,
          headers: Te.from(w.headers),
          status: w.status,
          statusText: w.statusText,
          config: d,
          request: L
        });
      });
    } catch (T) {
      if ($ && $(), B && B.aborted && B.reason instanceof G) {
        const b = B.reason;
        throw b.config = d, L && (b.request = L), T !== b && (b.cause = T), b;
      }
      throw T && T.name === "TypeError" && /Load failed|fetch/i.test(T.message) ? Object.assign(
        new G(
          "Network Error",
          G.ERR_NETWORK,
          d,
          L,
          T && T.response
        ),
        {
          cause: T.cause || T
        }
      ) : G.from(T, T && T.code, d, L, T && T.response);
    }
  };
}, KA = /* @__PURE__ */ new Map(), fm = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: r, Response: a } = t, i = [r, a, n];
  let s = i.length, o = s, l, u, c = KA;
  for (; o--; )
    l = i[o], u = c.get(l), u === void 0 && c.set(l, u = o ? /* @__PURE__ */ new Map() : GA(t)), c = u;
  return u;
};
fm();
const Sc = {
  http: jA,
  xhr: zA,
  fetch: {
    get: fm
  }
};
A.forEach(Sc, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const dp = (e) => `- ${e}`, XA = (e) => A.isFunction(e) || e === null || e === !1;
function WA(e, t) {
  e = A.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, a;
  const i = {};
  for (let s = 0; s < n; s++) {
    r = e[s];
    let o;
    if (a = r, !XA(r) && (a = Sc[(o = String(r)).toLowerCase()], a === void 0))
      throw new G(`Unknown adapter '${o}'`);
    if (a && (A.isFunction(a) || (a = a.get(t))))
      break;
    i[o || "#" + s] = a;
  }
  if (!a) {
    const s = Object.entries(i).map(
      ([l, u]) => `adapter ${l} ` + (u === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let o = n ? s.length > 1 ? `since :
` + s.map(dp).join(`
`) : " " + dp(s[0]) : "as no adapter specified";
    throw new G(
      "There is no suitable adapter to dispatch the request " + o,
      "ERR_NOT_SUPPORT"
    );
  }
  return a;
}
const mm = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: WA,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Sc
};
function fs(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new ln(null, e);
}
function fp(e) {
  return fs(e), e.headers = Te.from(e.headers), e.data = is.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), mm.getAdapter(e.adapter || jr.adapter, e)(e).then(
    function(r) {
      fs(e), e.response = r;
      try {
        r.data = is.call(e, e.transformResponse, r);
      } finally {
        delete e.response;
      }
      return r.headers = Te.from(r.headers), r;
    },
    function(r) {
      if (!Jf(r) && (fs(e), r && r.response)) {
        e.response = r.response;
        try {
          r.response.data = is.call(
            e,
            e.transformResponse,
            r.response
          );
        } finally {
          delete e.response;
        }
        r.response.headers = Te.from(r.response.headers);
      }
      return Promise.reject(r);
    }
  );
}
const ri = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  ri[e] = function(r) {
    return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const mp = {};
ri.transitional = function(t, n, r) {
  function a(i, s) {
    return "[Axios v" + Er + "] Transitional option '" + i + "'" + s + (r ? ". " + r : "");
  }
  return (i, s, o) => {
    if (t === !1)
      throw new G(
        a(s, " has been removed" + (n ? " in " + n : "")),
        G.ERR_DEPRECATED
      );
    return n && !mp[s] && (mp[s] = !0, console.warn(
      a(
        s,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(i, s, o) : !0;
  };
};
ri.spelling = function(t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function YA(e, t, n) {
  if (typeof e != "object")
    throw new G("options must be an object", G.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let a = r.length;
  for (; a-- > 0; ) {
    const i = r[a], s = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
    if (s) {
      const o = e[i], l = o === void 0 || s(o, i, e);
      if (l !== !0)
        throw new G(
          "option " + i + " must be " + l,
          G.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new G("Unknown option " + i, G.ERR_BAD_OPTION);
  }
}
const ga = {
  assertOptions: YA,
  validators: ri
}, Je = ga.validators;
let rn = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new Mu(),
      response: new Mu()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
        let a = {};
        Error.captureStackTrace ? Error.captureStackTrace(a) : a = new Error();
        const i = (() => {
          if (!a.stack)
            return "";
          const s = a.stack.indexOf(`
`);
          return s === -1 ? "" : a.stack.slice(s + 1);
        })();
        try {
          if (!r.stack)
            r.stack = i;
          else if (i) {
            const s = i.indexOf(`
`), o = s === -1 ? -1 : i.indexOf(`
`, s + 1), l = o === -1 ? "" : i.slice(o + 1);
            String(r.stack).endsWith(l) || (r.stack += `
` + i);
          }
        } catch {
        }
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = pn(this.defaults, n);
    const { transitional: r, paramsSerializer: a, headers: i } = n;
    r !== void 0 && ga.assertOptions(
      r,
      {
        silentJSONParsing: Je.transitional(Je.boolean),
        forcedJSONParsing: Je.transitional(Je.boolean),
        clarifyTimeoutError: Je.transitional(Je.boolean),
        legacyInterceptorReqResOrdering: Je.transitional(Je.boolean)
      },
      !1
    ), a != null && (A.isFunction(a) ? n.paramsSerializer = {
      serialize: a
    } : ga.assertOptions(
      a,
      {
        encode: Je.function,
        serialize: Je.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), ga.assertOptions(
      n,
      {
        baseUrl: Je.spelling("baseURL"),
        withXsrfToken: Je.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let s = i && A.merge(i.common, i[n.method]);
    i && A.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (g) => {
      delete i[g];
    }), n.headers = Te.concat(s, i);
    const o = [];
    let l = !0;
    this.interceptors.request.forEach(function(m) {
      if (typeof m.runWhen == "function" && m.runWhen(n) === !1)
        return;
      l = l && m.synchronous;
      const v = n.transitional || ti;
      v && v.legacyInterceptorReqResOrdering ? o.unshift(m.fulfilled, m.rejected) : o.push(m.fulfilled, m.rejected);
    });
    const u = [];
    this.interceptors.response.forEach(function(m) {
      u.push(m.fulfilled, m.rejected);
    });
    let c, p = 0, f;
    if (!l) {
      const g = [fp.bind(this), void 0];
      for (g.unshift(...o), g.push(...u), f = g.length, c = Promise.resolve(n); p < f; )
        c = c.then(g[p++], g[p++]);
      return c;
    }
    f = o.length;
    let h = n;
    for (; p < f; ) {
      const g = o[p++], m = o[p++];
      try {
        h = g(h);
      } catch (v) {
        m.call(this, v);
        break;
      }
    }
    try {
      c = fp.call(this, h);
    } catch (g) {
      return Promise.reject(g);
    }
    for (p = 0, f = u.length; p < f; )
      c = c.then(u[p++], u[p++]);
    return c;
  }
  getUri(t) {
    t = pn(this.defaults, t);
    const n = fc(t.baseURL, t.url, t.allowAbsoluteUrls);
    return pc(n, t.params, t.paramsSerializer);
  }
};
A.forEach(["delete", "get", "head", "options"], function(t) {
  rn.prototype[t] = function(n, r) {
    return this.request(
      pn(r || {}, {
        method: t,
        url: n,
        data: (r || {}).data
      })
    );
  };
});
A.forEach(["post", "put", "patch", "query"], function(t) {
  function n(r) {
    return function(i, s, o) {
      return this.request(
        pn(o || {}, {
          method: t,
          headers: r ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: i,
          data: s
        })
      );
    };
  }
  rn.prototype[t] = n(), t !== "query" && (rn.prototype[t + "Form"] = n(!0));
});
let JA = class hm {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(i) {
      n = i;
    });
    const r = this;
    this.promise.then((a) => {
      if (!r._listeners) return;
      let i = r._listeners.length;
      for (; i-- > 0; )
        r._listeners[i](a);
      r._listeners = null;
    }), this.promise.then = (a) => {
      let i;
      const s = new Promise((o) => {
        r.subscribe(o), i = o;
      }).then(a);
      return s.cancel = function() {
        r.unsubscribe(i);
      }, s;
    }, t(function(i, s, o) {
      r.reason || (r.reason = new ln(i, s, o), n(r.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), n = (r) => {
      t.abort(r);
    };
    return this.subscribe(n), t.signal.unsubscribe = () => this.unsubscribe(n), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new hm(function(a) {
        t = a;
      }),
      cancel: t
    };
  }
};
function QA(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function ZA(e) {
  return A.isObject(e) && e.isAxiosError === !0;
}
const Us = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(Us).forEach(([e, t]) => {
  Us[t] = e;
});
function vm(e) {
  const t = new rn(e), n = gf(rn.prototype.request, t);
  return A.extend(n, rn.prototype, t, { allOwnKeys: !0 }), A.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(a) {
    return vm(pn(e, a));
  }, n;
}
const xe = vm(jr);
xe.Axios = rn;
xe.CanceledError = ln;
xe.CancelToken = JA;
xe.isCancel = Jf;
xe.VERSION = Er;
xe.toFormData = ei;
xe.AxiosError = G;
xe.Cancel = xe.CanceledError;
xe.all = function(t) {
  return Promise.all(t);
};
xe.spread = QA;
xe.isAxiosError = ZA;
xe.mergeConfig = pn;
xe.AxiosHeaders = Te;
xe.formToJSON = (e) => Yf(A.isHTMLForm(e) ? new FormData(e) : e);
xe.getAdapter = mm.getAdapter;
xe.HttpStatusCode = Us;
xe.default = xe;
const {
  Axios: tk,
  AxiosError: nk,
  CanceledError: rk,
  isCancel: ak,
  CancelToken: ik,
  VERSION: sk,
  all: ok,
  Cancel: ck,
  isAxiosError: lk,
  spread: uk,
  toFormData: pk,
  AxiosHeaders: dk,
  HttpStatusCode: fk,
  formToJSON: mk,
  getAdapter: hk,
  mergeConfig: vk,
  create: yk
} = xe;
function hp(e) {
  var t;
  if (xe.isAxiosError(e)) {
    const n = (t = e.response) == null ? void 0 : t.data;
    return (n == null ? void 0 : n.message) || (n == null ? void 0 : n.exception) || (n == null ? void 0 : n.exc_type) || e.message || "ERPNext API request failed.";
  }
  return e instanceof Error ? e.message : "Unexpected error.";
}
async function vp(e, t = {}) {
  const n = SS();
  return (await xe.get(`${n.siteUrl}${e}`, {
    ...t,
    headers: {
      ...t.headers,
      Authorization: `token ${n.apiKey}:${n.apiSecret}`
    }
  })).data;
}
function eP() {
  ce.handle("user:get-logged-user", async () => {
    try {
      return (await vp(
        "/api/method/frappe.auth.get_logged_user"
      )).message;
    } catch (e) {
      const t = hp(e);
      throw console.error("Failed to fetch logged user:", t), new Error(t);
    }
  }), ce.handle("projects:get", async () => {
    try {
      return (await vp(
        "/api/resource/Project",
        {
          params: {
            fields: JSON.stringify(["*"])
          }
        }
      )).data;
    } catch (e) {
      const t = hp(e);
      throw console.error("Failed to fetch projects:", t), new Error(t);
    }
  });
}
function tP() {
  ce.handle("settings:get", async () => {
    const e = _t();
    return {
      screenshot_frequency_seconds: e.general.trackingIntervalMinutes * 60,
      idle_timeout_minutes: e.general.idleTimeoutMinutes || 0,
      popup_frequency_minutes: e.general.activityUpdateIntervalMinutes || 0,
      auto_submit_timesheet: !1
    };
  });
}
function nP() {
  ce.handle("tasks:get", async (e, t) => {
    try {
      return [
        {
          name: "TASK-0001",
          subject: "Frontend Dashboard"
        },
        {
          name: "TASK-0002",
          subject: "Tracker API Integration"
        }
      ];
    } catch (n) {
      return console.error(n), [];
    }
  });
}
function ym(e) {
  const t = e.general.trackingIntervalMinutes * 60 * 1e3;
  return e.advanced.randomizedTracking ? Math.max(6e4, Math.floor(Math.random() * t)) : t;
}
class rP {
  constructor(t) {
    le(this, "timer", null);
    le(this, "isRunning", !1);
    le(this, "isPaused", !1);
    this.uploadQueue = t;
  }
  start(t, n) {
    this.isRunning = !0, this.isPaused = !1, this.schedule(t, n, 1500);
  }
  pause() {
    this.isPaused = !0;
  }
  resume() {
    this.isPaused = !1;
  }
  stop() {
    this.isRunning = !1, this.timer && (clearTimeout(this.timer), this.timer = null);
  }
  schedule(t, n, r = ym(n())) {
    this.isRunning && (this.timer = setTimeout(async () => {
      const a = n();
      !this.isPaused && a.general.takeCamshots && await this.capture(t, a), this.schedule(t, n);
    }, r));
  }
  async capture(t, n) {
    try {
      const r = await aP(n);
      if (!r)
        return;
      const a = Op({
        sessionId: t,
        mediaType: "camshot",
        filePath: r.filePath,
        timestamp: r.timestamp,
        approved: r.approved,
        rejected: r.rejected,
        cameraId: r.cameraId
      });
      Cn({
        sessionId: t,
        type: "camshot_taken",
        timestamp: r.timestamp,
        imageId: a
      }), r.approved && !r.rejected && this.uploadQueue.enqueue({ id: a, filePath: r.filePath });
    } catch (r) {
      console.error("Camshot capture failed:", r);
    }
  }
}
async function aP(e) {
  if (!e.general.takeCamshots)
    return null;
  const t = await mf("camshots"), n = Date.now(), r = Q.join(t, `${n}.jpg`), a = e.trackingSources.cameraId, i = await iP(a);
  if (!i)
    return null;
  await Dt.writeFile(r, i);
  const s = await ff(r, e);
  return {
    timestamp: new Date(n).toISOString(),
    filePath: r,
    approved: s,
    rejected: !s,
    cameraId: a
  };
}
function iP(e) {
  return new Promise((t) => {
    const n = new zt({
      width: 320,
      height: 240,
      show: !1,
      webPreferences: {
        contextIsolation: !1,
        nodeIntegration: !0
      }
    }), r = setTimeout(() => {
      t(null), n.close();
    }, 1e4), a = sP(e);
    n.webContents.once("ipc-message", (i, s, o) => {
      if (s === "camshot:capture") {
        if (clearTimeout(r), !o.startsWith("data:image/jpeg;base64,")) {
          t(null), n.close();
          return;
        }
        t(Buffer.from(o.replace("data:image/jpeg;base64,", ""), "base64")), n.close();
      }
    }), n.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(a)}`);
  });
}
function sP(e) {
  return `
    <!doctype html>
    <html>
      <body>
        <video autoplay playsinline style="width:320px;height:240px"></video>
        <canvas width="320" height="240"></canvas>
        <script>
          const { ipcRenderer } = require('electron');
          const video = document.querySelector('video');
          const canvas = document.querySelector('canvas');
          const constraints = {
            video: ${JSON.stringify(
    e ? { deviceId: { exact: e } } : !0
  )}
          };

          async function capture() {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(constraints);
              video.srcObject = stream;
              await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
              });
              await video.play();
              canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
              stream.getTracks().forEach((track) => track.stop());
              ipcRenderer.send('camshot:capture', canvas.toDataURL('image/jpeg', 0.85));
            } catch (error) {
              ipcRenderer.send('camshot:capture', '');
            }
          }

          capture();
        <\/script>
      </body>
    </html>
  `;
}
const oP = 15e3;
class cP {
  constructor() {
    le(this, "timer", null);
    le(this, "idleStartedAt", "");
    le(this, "isIdle", !1);
  }
  start(t, n, r) {
    const a = n.general.idleTimeoutMinutes;
    a && (this.timer = setInterval(() => {
      const i = Rm.getSystemIdleTime(), s = a * 60, o = (/* @__PURE__ */ new Date()).toISOString();
      if (!this.isIdle && i >= s) {
        this.isIdle = !0, this.idleStartedAt = o, Wm({ sessionId: t, startTime: o }), Cn({
          sessionId: t,
          type: "idle_started",
          timestamp: o
        }), ms(t, "idle"), r.onIdleStarted();
        return;
      }
      if (this.isIdle && i < s) {
        const l = this.idleStartedAt;
        this.isIdle = !1, this.idleStartedAt = "", Cc({ sessionId: t, startTime: l, endTime: o }), Cn({
          sessionId: t,
          type: "idle_ended",
          timestamp: o
        }), ms(t, "active"), r.onIdleEnded();
      }
    }, oP));
  }
  stop(t) {
    this.timer && (clearInterval(this.timer), this.timer = null), this.isIdle && this.idleStartedAt && Cc({
      sessionId: t,
      startTime: this.idleStartedAt,
      endTime: (/* @__PURE__ */ new Date()).toISOString()
    }), this.isIdle = !1, this.idleStartedAt = "";
  }
}
const lP = 6e4, uP = Cm(import.meta.url);
class pP {
  constructor() {
    le(this, "keyboardCount", 0);
    le(this, "mouseClickCount", 0);
    le(this, "flushTimer", null);
    le(this, "isPaused", !1);
    le(this, "sessionId", "");
    le(this, "hook", null);
    le(this, "keyListener", () => {
      this.isPaused || (this.keyboardCount += 1);
    });
    le(this, "mouseListener", () => {
      this.isPaused || (this.mouseClickCount += 1);
    });
  }
  async start(t, n) {
    if (this.sessionId = t, this.isPaused = !1, this.keyboardCount = 0, this.mouseClickCount = 0, !(!n.trackingSources.countKeyboardHits && !n.trackingSources.countMouseClicks)) {
      if (process.platform === "darwin" && !Ac.isTrustedAccessibilityClient(!1)) {
        Ac.isTrustedAccessibilityClient(!0), console.warn(
          "Keyboard/mouse activity tracking is paused until Accessibility permission is granted for this app."
        );
        return;
      }
      try {
        const r = uP("uiohook-napi");
        if (this.hook = r.uIOhook || null, !this.hook)
          return;
        n.trackingSources.countKeyboardHits && this.hook.on("keydown", this.keyListener), n.trackingSources.countMouseClicks && this.hook.on("mousedown", this.mouseListener), this.hook.start(), this.flushTimer = setInterval(() => this.flush(), lP);
      } catch (r) {
        console.warn("Input tracking is unavailable:", r);
      }
    }
  }
  pause() {
    this.flush(), this.isPaused = !0;
  }
  resume() {
    this.isPaused = !1;
  }
  stop() {
    this.flush(), this.flushTimer && (clearInterval(this.flushTimer), this.flushTimer = null), this.hook && (this.hook.off("keydown", this.keyListener), this.hook.off("mousedown", this.mouseListener), this.hook.stop(), this.hook = null), this.sessionId = "";
  }
  flush() {
    if (!this.sessionId)
      return;
    const t = (/* @__PURE__ */ new Date()).toISOString();
    this.flushKind("keyboard", this.keyboardCount, t), this.flushKind("mouse", this.mouseClickCount, t), this.keyboardCount = 0, this.mouseClickCount = 0;
  }
  flushKind(t, n, r) {
    n <= 0 || Xm({
      sessionId: this.sessionId,
      kind: t,
      timestamp: r,
      count: n
    });
  }
}
class dP {
  constructor(t) {
    le(this, "timer", null);
    le(this, "isRunning", !1);
    le(this, "isPaused", !1);
    this.uploadQueue = t;
  }
  start(t, n) {
    this.isRunning = !0, this.isPaused = !1, this.schedule(t, n, 1e3);
  }
  pause() {
    this.isPaused = !0;
  }
  resume() {
    this.isPaused = !1;
  }
  stop() {
    this.isRunning = !1, this.timer && (clearTimeout(this.timer), this.timer = null);
  }
  schedule(t, n, r = ym(n())) {
    this.isRunning && (this.timer = setTimeout(async () => {
      const a = n();
      this.isPaused || await this.capture(t, a), this.schedule(t, n);
    }, r));
  }
  async capture(t, n) {
    try {
      (await hf(n)).forEach((a) => {
        const i = Op({
          sessionId: t,
          mediaType: "screenshot",
          filePath: a.filePath,
          timestamp: a.timestamp,
          approved: a.approved,
          rejected: a.rejected
        });
        Cn({
          sessionId: t,
          type: "screenshot_taken",
          timestamp: a.timestamp,
          imageId: i
        }), a.approved && !a.rejected && this.uploadQueue.enqueue({ id: i, filePath: a.filePath });
      });
    } catch (r) {
      console.error("Screenshot capture failed:", r);
    }
  }
}
class fP {
  constructor() {
    le(this, "queue", []);
    le(this, "isProcessing", !1);
  }
  enqueue(t) {
    this.queue.push({ ...t, attempts: 0 }), this.process();
  }
  async process() {
    if (!this.isProcessing) {
      for (this.isProcessing = !0; this.queue.length > 0; ) {
        const t = this.queue.shift();
        if (t)
          try {
            await this.upload(t);
          } catch (n) {
            t.attempts < 3 ? this.queue.push({ ...t, attempts: t.attempts + 1 }) : console.error("Media upload failed:", n);
          }
      }
      this.isProcessing = !1;
    }
  }
  async upload(t) {
    await Promise.resolve();
  }
}
class mP {
  constructor() {
    le(this, "activeSession", null);
    le(this, "uploadQueue", new fP());
    le(this, "screenshotService", new dP(this.uploadQueue));
    le(this, "camshotService", new rP(this.uploadQueue));
    le(this, "inputTrackingService", new pP());
    le(this, "idleDetectionService", new cP());
    le(this, "autosaveTimer", null);
    le(this, "cleanupTimer", null);
  }
  async start(t) {
    if (this.activeSession)
      return {
        success: !0,
        sessionId: this.activeSession.id,
        startedAt: this.activeSession.startTime,
        status: this.activeSession.status
      };
    if (!t.project)
      throw new Error("Please select a project first.");
    const n = (/* @__PURE__ */ new Date()).toISOString(), r = `session-${Date.now()}`, a = _t();
    return this.activeSession = Hm({
      id: r,
      projectId: t.project,
      taskId: t.taskId,
      description: t.description,
      startTime: n
    }), jc({
      sessionId: r,
      project: t.project,
      description: t.description,
      startTime: n
    }), Cn({
      sessionId: r,
      type: "tracking_started",
      timestamp: n
    }), this.screenshotService.start(r, _t), this.camshotService.start(r, _t), await this.inputTrackingService.start(r, a), this.idleDetectionService.start(r, a, {
      onIdleStarted: () => this.pauseForIdle(),
      onIdleEnded: () => this.resumeFromIdle()
    }), this.autosaveTimer = setInterval(() => {
      this.activeSession && ms(
        this.activeSession.id,
        this.activeSession.status
      );
    }, 6e4), this.cleanupTimer = setInterval(() => {
      pu().catch((i) => {
        console.warn("Uploaded media cleanup failed:", i);
      });
    }, 5 * 6e4), {
      success: !0,
      sessionId: r,
      startedAt: n,
      status: "active"
    };
  }
  async stop() {
    if (!this.activeSession)
      throw new Error("No tracker session is currently running.");
    const t = this.activeSession, n = (/* @__PURE__ */ new Date()).toISOString();
    Sp(t.id, n), this.screenshotService.stop(), this.camshotService.stop(), this.inputTrackingService.stop(), this.idleDetectionService.stop(t.id), this.autosaveTimer && (clearInterval(this.autosaveTimer), this.autosaveTimer = null), this.cleanupTimer && (clearInterval(this.cleanupTimer), this.cleanupTimer = null), pu().catch((a) => {
      console.warn("Uploaded media cleanup failed:", a);
    }), Cn({
      sessionId: t.id,
      type: "tracking_stopped",
      timestamp: n
    });
    const r = Gm(t.id, n);
    return this.activeSession = null, {
      success: !0,
      sessionId: r.id,
      startedAt: r.startTime,
      stoppedAt: n,
      durationSeconds: r.duration,
      status: r.status
    };
  }
  updateActivity(t) {
    if (!this.activeSession)
      throw new Error("No tracker session is currently running.");
    const n = t.description.trim();
    if (!n)
      throw new Error("Activity description is required.");
    const r = (/* @__PURE__ */ new Date()).toISOString(), a = jc({
      sessionId: this.activeSession.id,
      project: this.activeSession.projectId,
      description: n,
      startTime: r
    });
    return this.activeSession = {
      ...this.activeSession,
      description: n
    }, {
      success: !0,
      activityId: a,
      description: n,
      startedAt: r
    };
  }
  getActiveSession() {
    return this.activeSession;
  }
  getStatus() {
    return this.activeSession ? {
      isTracking: !0,
      sessionId: this.activeSession.id,
      project: this.activeSession.projectId,
      description: this.activeSession.description,
      startedAt: this.activeSession.startTime,
      status: this.activeSession.status
    } : {
      isTracking: !1,
      sessionId: "",
      project: "",
      description: "",
      startedAt: "",
      status: ""
    };
  }
  pauseForIdle() {
    this.screenshotService.pause(), this.camshotService.pause(), this.inputTrackingService.pause(), this.activeSession && (this.activeSession = {
      ...this.activeSession,
      status: "idle"
    });
  }
  resumeFromIdle() {
    _t().general.resumeTrackingAfterIdle && (this.screenshotService.resume(), this.camshotService.resume(), this.inputTrackingService.resume(), this.activeSession && (this.activeSession = {
      ...this.activeSession,
      status: "active"
    }));
  }
}
const An = new mP();
function hP() {
  ce.handle(
    "tracker:start",
    async (e, t) => An.start(t)
  ), ce.handle("tracker:stop", async () => An.stop()), ce.handle("tracker:status", async () => An.getStatus()), ce.handle(
    "tracker:update-activity",
    async (e, t) => An.updateActivity(t)
  );
}
function vP(e) {
  FS(), US(), MS(e), eP(), tP(), nP(), hP();
}
const gm = Q.dirname(Om(import.meta.url));
process.env.APP_ROOT = Q.join(gm, "..");
const xm = process.env.VITE_DEV_SERVER_URL, gk = Q.join(process.env.APP_ROOT, "dist-electron"), yP = Q.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = xm ? Q.join(process.env.APP_ROOT, "public") : yP;
const Ms = {
  dirname: gm,
  isDev: process.env.NODE_ENV === "development",
  viteDevServerUrl: xm
};
vP(Ms);
Fe.whenReady().then(async () => {
  ac(_t()), Dm(Ms), Fe.on("activate", () => {
    Fm(Ms);
  });
});
Fe.on("window-all-closed", () => {
  process.platform !== "darwin" && Fe.quit();
});
Fe.on("before-quit", () => {
  An.getActiveSession() && An.stop().catch((e) => {
    console.error("Failed to stop active tracking session before quit:", e);
  });
});
export {
  gk as MAIN_DIST,
  yP as RENDERER_DIST,
  xm as VITE_DEV_SERVER_URL
};
