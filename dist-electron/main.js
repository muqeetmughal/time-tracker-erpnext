var Td = Object.defineProperty;
var Io = (e) => {
  throw TypeError(e);
};
var Ad = (e, t, n) => t in e ? Td(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Pn = (e, t, n) => Ad(e, typeof t != "symbol" ? t + "" : t, n), Ir = (e, t, n) => t.has(e) || Io("Cannot " + n);
var X = (e, t, n) => (Ir(e, t, "read from private field"), n ? n.call(e) : t.get(e)), He = (e, t, n) => t.has(e) ? Io("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n), Ie = (e, t, n, a) => (Ir(e, t, "write to private field"), a ? a.call(e, n) : t.set(e, n), n), ot = (e, t, n) => (Ir(e, t, "access private method"), n);
import Hl, { BrowserWindow as Gl, app as Pt, nativeImage as jd, Tray as kd, Menu as Nd, ipcMain as rt } from "electron";
import { fileURLToPath as Id } from "node:url";
import Q from "node:path";
import Cd from "better-sqlite3";
import ue from "node:process";
import { promisify as Re, isDeepStrictEqual as Co } from "node:util";
import J from "node:fs";
import On from "node:crypto";
import Lo from "node:assert";
import Kl from "node:os";
import "node:events";
import "node:stream";
import Wt from "util";
import Ee, { Readable as Ld } from "stream";
import Wl, { resolve as Do } from "path";
import Zs from "http";
import ei from "https";
import Ya from "url";
import Dd from "fs";
import Xl from "crypto";
import Fd from "net";
import Ud from "tls";
import Jl from "assert";
import Yl from "tty";
import zd from "os";
import Md, { EventEmitter as qd } from "events";
import Ql from "http2";
import Et from "zlib";
let xe = null, Tn = null;
function Zl(e) {
  return xe = new Gl({
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
  }), e.isDev && e.viteDevServerUrl ? (xe.loadURL(e.viteDevServerUrl), xe.webContents.openDevTools()) : xe.loadFile(Q.join(e.dirname, "../renderer/index.html")), xe.on("close", (t) => {
    Pt.isQuitting || (t.preventDefault(), xe == null || xe.hide());
  }), xe;
}
function Bd(e) {
  const t = jd.createFromPath(
    Q.join(e, "../../resources/icon.png")
  );
  Tn = new kd(t);
  const n = Nd.buildFromTemplate([
    {
      label: "Open Tracker",
      click: () => {
        xe == null || xe.show();
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
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        Pt.isQuitting = !0, Pt.quit();
      }
    }
  ]);
  return Tn.setToolTip("ERPNext Time Tracker"), Tn.setContextMenu(n), Tn.on("double-click", () => {
    xe == null || xe.show();
  }), Tn;
}
function Vd(e) {
  Zl(e), Bd(e.dirname);
}
function Hd(e) {
  if (Gl.getAllWindows().length === 0) {
    Zl(e);
    return;
  }
  xe == null || xe.show();
}
let An = null;
function Gd() {
  return An || (An = new Cd(Q.join(Pt.getPath("userData"), "time-tracker.sqlite")), An.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('start', 'stop')),
      description TEXT NOT NULL,
      session_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `), An);
}
function Kd(e) {
  const t = e.createdAt || (/* @__PURE__ */ new Date()).toISOString(), n = e.sessionId || "", a = Gd().prepare(
    `
        INSERT INTO activities (
          project,
          type,
          description,
          session_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)
      `
  ).run(e.project, e.type, e.description, n, t);
  return {
    id: Number(a.lastInsertRowid),
    project: e.project,
    type: e.type,
    description: e.description,
    sessionId: n,
    createdAt: t
  };
}
function Wd() {
  rt.handle("activities:create", async (e, t) => {
    const n = t.description.trim();
    if (!t.project)
      throw new Error("Please select a project first.");
    if (!n)
      throw new Error("Activity description is required.");
    return Kd({
      ...t,
      description: n
    });
  });
}
const Mt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, eu = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), tu = 1e6, Xd = (e) => e >= "0" && e <= "9";
function nu(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= tu;
  }
  return !1;
}
function Cr(e, t) {
  return eu.has(e) ? !1 : (e && nu(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function Jd(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let n = "", a = "start", r = !1, s = 0;
  for (const i of e) {
    if (s++, r) {
      n += i, r = !1;
      continue;
    }
    if (i === "\\") {
      if (a === "index")
        throw new Error(`Invalid character '${i}' in an index at position ${s}`);
      if (a === "indexEnd")
        throw new Error(`Invalid character '${i}' after an index at position ${s}`);
      r = !0, a = a === "start" ? "property" : a;
      continue;
    }
    switch (i) {
      case ".": {
        if (a === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${s}`);
        if (a === "indexEnd") {
          a = "property";
          break;
        }
        if (!Cr(n, t))
          return [];
        n = "", a = "property";
        break;
      }
      case "[": {
        if (a === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${s}`);
        if (a === "indexEnd") {
          a = "index";
          break;
        }
        if (a === "property" || a === "start") {
          if ((n || a === "property") && !Cr(n, t))
            return [];
          n = "";
        }
        a = "index";
        break;
      }
      case "]": {
        if (a === "index") {
          if (n === "")
            n = (t.pop() || "") + "[]", a = "property";
          else {
            const o = Number.parseInt(n, 10);
            !Number.isNaN(o) && Number.isFinite(o) && o >= 0 && o <= Number.MAX_SAFE_INTEGER && o <= tu && n === String(o) ? t.push(o) : t.push(n), n = "", a = "indexEnd";
          }
          break;
        }
        if (a === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${s}`);
        n += i;
        break;
      }
      default: {
        if (a === "index" && !Xd(i))
          throw new Error(`Invalid character '${i}' in an index at position ${s}`);
        if (a === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${s}`);
        a === "start" && (a = "property"), n += i;
      }
    }
  }
  switch (r && (n += "\\"), a) {
    case "property": {
      if (!Cr(n, t))
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
function Qa(e) {
  if (typeof e == "string")
    return Jd(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [n, a] of e.entries()) {
      if (typeof a != "string" && typeof a != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${n}, got ${typeof a}`);
      if (typeof a == "number" && !Number.isFinite(a))
        throw new TypeError(`Path segment at index ${n} must be a finite number, got ${a}`);
      if (eu.has(a))
        return [];
      typeof a == "string" && nu(a) ? t.push(Number.parseInt(a, 10)) : t.push(a);
    }
    return t;
  }
  return [];
}
function Fo(e, t, n) {
  if (!Mt(e) || typeof t != "string" && !Array.isArray(t))
    return n === void 0 ? e : n;
  const a = Qa(t);
  if (a.length === 0)
    return n;
  for (let r = 0; r < a.length; r++) {
    const s = a[r];
    if (e = e[s], e == null) {
      if (r !== a.length - 1)
        return n;
      break;
    }
  }
  return e === void 0 ? n : e;
}
function ua(e, t, n) {
  if (!Mt(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const a = e, r = Qa(t);
  if (r.length === 0)
    return e;
  for (let s = 0; s < r.length; s++) {
    const i = r[s];
    if (s === r.length - 1)
      e[i] = n;
    else if (!Mt(e[i])) {
      const l = typeof r[s + 1] == "number";
      e[i] = l ? [] : {};
    }
    e = e[i];
  }
  return a;
}
function Yd(e, t) {
  if (!Mt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const n = Qa(t);
  if (n.length === 0)
    return !1;
  for (let a = 0; a < n.length; a++) {
    const r = n[a];
    if (a === n.length - 1)
      return Object.hasOwn(e, r) ? (delete e[r], !0) : !1;
    if (e = e[r], !Mt(e))
      return !1;
  }
}
function Lr(e, t) {
  if (!Mt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const n = Qa(t);
  if (n.length === 0)
    return !1;
  for (const a of n) {
    if (!Mt(e) || !(a in e))
      return !1;
    e = e[a];
  }
  return !0;
}
const bt = Kl.homedir(), ti = Kl.tmpdir(), { env: sn } = ue, Qd = (e) => {
  const t = Q.join(bt, "Library");
  return {
    data: Q.join(t, "Application Support", e),
    config: Q.join(t, "Preferences", e),
    cache: Q.join(t, "Caches", e),
    log: Q.join(t, "Logs", e),
    temp: Q.join(ti, e)
  };
}, Zd = (e) => {
  const t = sn.APPDATA || Q.join(bt, "AppData", "Roaming"), n = sn.LOCALAPPDATA || Q.join(bt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: Q.join(n, e, "Data"),
    config: Q.join(t, e, "Config"),
    cache: Q.join(n, e, "Cache"),
    log: Q.join(n, e, "Log"),
    temp: Q.join(ti, e)
  };
}, ef = (e) => {
  const t = Q.basename(bt);
  return {
    data: Q.join(sn.XDG_DATA_HOME || Q.join(bt, ".local", "share"), e),
    config: Q.join(sn.XDG_CONFIG_HOME || Q.join(bt, ".config"), e),
    cache: Q.join(sn.XDG_CACHE_HOME || Q.join(bt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: Q.join(sn.XDG_STATE_HOME || Q.join(bt, ".local", "state"), e),
    temp: Q.join(ti, t, e)
  };
};
function tf(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ue.platform === "darwin" ? Qd(e) : ue.platform === "win32" ? Zd(e) : ef(e);
}
const ft = (e, t) => {
  const { onError: n } = t;
  return function(...r) {
    return e.apply(void 0, r).catch(n);
  };
}, ct = (e, t) => {
  const { onError: n } = t;
  return function(...r) {
    try {
      return e.apply(void 0, r);
    } catch (s) {
      return n(s);
    }
  };
}, nf = 250, mt = (e, t) => {
  const { isRetriable: n } = t;
  return function(r) {
    const { timeout: s } = r, i = r.interval ?? nf, o = Date.now() + s;
    return function l(...u) {
      return e.apply(void 0, u).catch((c) => {
        if (!n(c) || Date.now() >= o)
          throw c;
        const p = Math.round(i * Math.random());
        return p > 0 ? new Promise((f) => setTimeout(f, p)).then(() => l.apply(void 0, u)) : l.apply(void 0, u);
      });
    };
  };
}, ht = (e, t) => {
  const { isRetriable: n } = t;
  return function(r) {
    const { timeout: s } = r, i = Date.now() + s;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (u) {
          if (!n(u) || Date.now() >= i)
            throw u;
          continue;
        }
    };
  };
}, on = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!on.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !af && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!on.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!on.isNodeError(e))
      throw e;
    if (!on.isChangeErrorOk(e))
      throw e;
  }
}, pa = {
  onError: on.onChangeError
}, Ue = {
  onError: () => {
  }
}, af = ue.getuid ? !ue.getuid() : !1, Pe = {
  isRetriable: on.isRetriableError
}, Te = {
  attempt: {
    /* ASYNC */
    chmod: ft(Re(J.chmod), pa),
    chown: ft(Re(J.chown), pa),
    close: ft(Re(J.close), Ue),
    fsync: ft(Re(J.fsync), Ue),
    mkdir: ft(Re(J.mkdir), Ue),
    realpath: ft(Re(J.realpath), Ue),
    stat: ft(Re(J.stat), Ue),
    unlink: ft(Re(J.unlink), Ue),
    /* SYNC */
    chmodSync: ct(J.chmodSync, pa),
    chownSync: ct(J.chownSync, pa),
    closeSync: ct(J.closeSync, Ue),
    existsSync: ct(J.existsSync, Ue),
    fsyncSync: ct(J.fsync, Ue),
    mkdirSync: ct(J.mkdirSync, Ue),
    realpathSync: ct(J.realpathSync, Ue),
    statSync: ct(J.statSync, Ue),
    unlinkSync: ct(J.unlinkSync, Ue)
  },
  retry: {
    /* ASYNC */
    close: mt(Re(J.close), Pe),
    fsync: mt(Re(J.fsync), Pe),
    open: mt(Re(J.open), Pe),
    readFile: mt(Re(J.readFile), Pe),
    rename: mt(Re(J.rename), Pe),
    stat: mt(Re(J.stat), Pe),
    write: mt(Re(J.write), Pe),
    writeFile: mt(Re(J.writeFile), Pe),
    /* SYNC */
    closeSync: ht(J.closeSync, Pe),
    fsyncSync: ht(J.fsyncSync, Pe),
    openSync: ht(J.openSync, Pe),
    readFileSync: ht(J.readFileSync, Pe),
    renameSync: ht(J.renameSync, Pe),
    statSync: ht(J.statSync, Pe),
    writeSync: ht(J.writeSync, Pe),
    writeFileSync: ht(J.writeFileSync, Pe)
  }
}, rf = "utf8", Uo = 438, sf = 511, of = {}, cf = ue.geteuid ? ue.geteuid() : -1, lf = ue.getegid ? ue.getegid() : -1, uf = 1e3, pf = !!ue.getuid;
ue.getuid && ue.getuid();
const zo = 128, df = (e) => e instanceof Error && "code" in e, Mo = (e) => typeof e == "string", Dr = (e) => e === void 0, ff = ue.platform === "linux", au = ue.platform === "win32", ni = ["SIGHUP", "SIGINT", "SIGTERM"];
au || ni.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
ff && ni.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class mf {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const n of this.callbacks)
          n();
        t && (au && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ue.kill(ue.pid, "SIGTERM") : ue.kill(ue.pid, t));
      }
    }, this.hook = () => {
      ue.once("exit", () => this.exit());
      for (const t of ni)
        try {
          ue.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const hf = new mf(), vf = hf.register, Ae = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), r = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${r}`;
  },
  get: (e, t, n = !0) => {
    const a = Ae.truncate(t(e));
    return a in Ae.store ? Ae.get(e, t, n) : (Ae.store[a] = n, [a, () => delete Ae.store[a]]);
  },
  purge: (e) => {
    Ae.store[e] && (delete Ae.store[e], Te.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ae.store[e] && (delete Ae.store[e], Te.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ae.store)
      Ae.purgeSync(e);
  },
  truncate: (e) => {
    const t = Q.basename(e);
    if (t.length <= zo)
      return e;
    const n = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!n)
      return e;
    const a = t.length - zo;
    return `${e.slice(0, -t.length)}${n[1]}${n[2].slice(0, -a)}${n[3]}`;
  }
};
vf(Ae.purgeSyncAll);
function ru(e, t, n = of) {
  if (Mo(n))
    return ru(e, t, { encoding: n });
  const r = { timeout: n.timeout ?? uf };
  let s = null, i = null, o = null;
  try {
    const l = Te.attempt.realpathSync(e), u = !!l;
    e = l || e, [i, s] = Ae.get(e, n.tmpCreate || Ae.create, n.tmpPurge !== !1);
    const c = pf && Dr(n.chown), p = Dr(n.mode);
    if (u && (c || p)) {
      const d = Te.attempt.statSync(e);
      d && (n = { ...n }, c && (n.chown = { uid: d.uid, gid: d.gid }), p && (n.mode = d.mode));
    }
    if (!u) {
      const d = Q.dirname(e);
      Te.attempt.mkdirSync(d, {
        mode: sf,
        recursive: !0
      });
    }
    o = Te.retry.openSync(r)(i, "w", n.mode || Uo), n.tmpCreated && n.tmpCreated(i), Mo(t) ? Te.retry.writeSync(r)(o, t, 0, n.encoding || rf) : Dr(t) || Te.retry.writeSync(r)(o, t, 0, t.length, 0), n.fsync !== !1 && (n.fsyncWait !== !1 ? Te.retry.fsyncSync(r)(o) : Te.attempt.fsync(o)), Te.retry.closeSync(r)(o), o = null, n.chown && (n.chown.uid !== cf || n.chown.gid !== lf) && Te.attempt.chownSync(i, n.chown.uid, n.chown.gid), n.mode && n.mode !== Uo && Te.attempt.chmodSync(i, n.mode);
    try {
      Te.retry.renameSync(r)(i, e);
    } catch (d) {
      if (!df(d) || d.code !== "ENAMETOOLONG")
        throw d;
      Te.retry.renameSync(r)(i, Ae.truncate(e));
    }
    s(), i = null;
  } finally {
    o && Te.attempt.closeSync(o), i && Ae.purge(i);
  }
}
var st = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Yn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Os = { exports: {} }, ai = {}, Ve = {}, mn = {}, Qn = {}, K = {}, Gn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class n extends t {
    constructor($) {
      if (super(), !e.IDENTIFIER.test($))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = $;
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
  class a extends t {
    constructor($) {
      super(), this._items = typeof $ == "string" ? [$] : $;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const $ = this._items[0];
      return $ === "" || $ === '""';
    }
    get str() {
      var $;
      return ($ = this._str) !== null && $ !== void 0 ? $ : this._str = this._items.reduce((S, T) => `${S}${T}`, "");
    }
    get names() {
      var $;
      return ($ = this._names) !== null && $ !== void 0 ? $ : this._names = this._items.reduce((S, T) => (T instanceof n && (S[T.str] = (S[T.str] || 0) + 1), S), {});
    }
  }
  e._Code = a, e.nil = new a("");
  function r(m, ...$) {
    const S = [m[0]];
    let T = 0;
    for (; T < $.length; )
      o(S, $[T]), S.push(m[++T]);
    return new a(S);
  }
  e._ = r;
  const s = new a("+");
  function i(m, ...$) {
    const S = [f(m[0])];
    let T = 0;
    for (; T < $.length; )
      S.push(s), o(S, $[T]), S.push(s, f(m[++T]));
    return l(S), new a(S);
  }
  e.str = i;
  function o(m, $) {
    $ instanceof a ? m.push(...$._items) : $ instanceof n ? m.push($) : m.push(p($));
  }
  e.addCodeArg = o;
  function l(m) {
    let $ = 1;
    for (; $ < m.length - 1; ) {
      if (m[$] === s) {
        const S = u(m[$ - 1], m[$ + 1]);
        if (S !== void 0) {
          m.splice($ - 1, 3, S);
          continue;
        }
        m[$++] = "+";
      }
      $++;
    }
  }
  function u(m, $) {
    if ($ === '""')
      return m;
    if (m === '""')
      return $;
    if (typeof m == "string")
      return $ instanceof n || m[m.length - 1] !== '"' ? void 0 : typeof $ != "string" ? `${m.slice(0, -1)}${$}"` : $[0] === '"' ? m.slice(0, -1) + $.slice(1) : void 0;
    if (typeof $ == "string" && $[0] === '"' && !(m instanceof n))
      return `"${m}${$.slice(1)}`;
  }
  function c(m, $) {
    return $.emptyStr() ? m : m.emptyStr() ? $ : i`${m}${$}`;
  }
  e.strConcat = c;
  function p(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : f(Array.isArray(m) ? m.join(",") : m);
  }
  function d(m) {
    return new a(f(m));
  }
  e.stringify = d;
  function f(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = f;
  function g(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new a(`.${m}`) : r`[${m}]`;
  }
  e.getProperty = g;
  function v(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new a(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = v;
  function y(m) {
    return new a(m.toString());
  }
  e.regexpCode = y;
})(Gn);
var Ts = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Gn;
  class n extends Error {
    constructor(u) {
      super(`CodeGen: "code" for ${u} not defined`), this.value = u.value;
    }
  }
  var a;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
  })(a || (e.UsedValueState = a = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class r {
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
  e.Scope = r;
  class s extends t.Name {
    constructor(u, c) {
      super(c), this.prefix = u;
    }
    setValue(u, { property: c, itemIndex: p }) {
      this.value = u, this.scopePath = (0, t._)`.${new t.Name(c)}[${p}]`;
    }
  }
  e.ValueScopeName = s;
  const i = (0, t._)`\n`;
  class o extends r {
    constructor(u) {
      super(u), this._values = {}, this._scope = u.scope, this.opts = { ...u, _n: u.lines ? i : t.nil };
    }
    get() {
      return this._scope;
    }
    name(u) {
      return new s(u, this._newName(u));
    }
    value(u, c) {
      var p;
      if (c.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const d = this.toName(u), { prefix: f } = d, g = (p = c.key) !== null && p !== void 0 ? p : c.ref;
      let v = this._values[f];
      if (v) {
        const $ = v.get(g);
        if ($)
          return $;
      } else
        v = this._values[f] = /* @__PURE__ */ new Map();
      v.set(g, d);
      const y = this._scope[f] || (this._scope[f] = []), m = y.length;
      return y[m] = c.ref, d.setValue(c, { property: f, itemIndex: m }), d;
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
      return this._reduceValues(u, (d) => {
        if (d.value === void 0)
          throw new Error(`CodeGen: name "${d}" has no value`);
        return d.value.code;
      }, c, p);
    }
    _reduceValues(u, c, p = {}, d) {
      let f = t.nil;
      for (const g in u) {
        const v = u[g];
        if (!v)
          continue;
        const y = p[g] = p[g] || /* @__PURE__ */ new Map();
        v.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, a.Started);
          let $ = c(m);
          if ($) {
            const S = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            f = (0, t._)`${f}${S} ${m} = ${$};${this.opts._n}`;
          } else if ($ = d == null ? void 0 : d(m))
            f = (0, t._)`${f}${$}${this.opts._n}`;
          else
            throw new n(m);
          y.set(m, a.Completed);
        });
      }
      return f;
    }
  }
  e.ValueScope = o;
})(Ts);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Gn, n = Ts;
  var a = Gn;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return a._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return a.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return a.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return a.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return a.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return a.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return a.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return a.Name;
  } });
  var r = Ts;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return r.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return r.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return r.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return r.varKinds;
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
  class s {
    optimizeNodes() {
      return this;
    }
    optimizeNames(h, x) {
      return this;
    }
  }
  class i extends s {
    constructor(h, x, O) {
      super(), this.varKind = h, this.name = x, this.rhs = O;
    }
    render({ es5: h, _n: x }) {
      const O = h ? n.varKinds.var : this.varKind, A = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${O} ${this.name}${A};` + x;
    }
    optimizeNames(h, x) {
      if (h[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, h, x)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class o extends s {
    constructor(h, x, O) {
      super(), this.lhs = h, this.rhs = x, this.sideEffects = O;
    }
    render({ _n: h }) {
      return `${this.lhs} = ${this.rhs};` + h;
    }
    optimizeNames(h, x) {
      if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, h, x), this;
    }
    get names() {
      const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return re(h, this.rhs);
    }
  }
  class l extends o {
    constructor(h, x, O, A) {
      super(h, O, A), this.op = x;
    }
    render({ _n: h }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + h;
    }
  }
  class u extends s {
    constructor(h) {
      super(), this.label = h, this.names = {};
    }
    render({ _n: h }) {
      return `${this.label}:` + h;
    }
  }
  class c extends s {
    constructor(h) {
      super(), this.label = h, this.names = {};
    }
    render({ _n: h }) {
      return `break${this.label ? ` ${this.label}` : ""};` + h;
    }
  }
  class p extends s {
    constructor(h) {
      super(), this.error = h;
    }
    render({ _n: h }) {
      return `throw ${this.error};` + h;
    }
    get names() {
      return this.error.names;
    }
  }
  class d extends s {
    constructor(h) {
      super(), this.code = h;
    }
    render({ _n: h }) {
      return `${this.code};` + h;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(h, x) {
      return this.code = j(this.code, h, x), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class f extends s {
    constructor(h = []) {
      super(), this.nodes = h;
    }
    render(h) {
      return this.nodes.reduce((x, O) => x + O.render(h), "");
    }
    optimizeNodes() {
      const { nodes: h } = this;
      let x = h.length;
      for (; x--; ) {
        const O = h[x].optimizeNodes();
        Array.isArray(O) ? h.splice(x, 1, ...O) : O ? h[x] = O : h.splice(x, 1);
      }
      return h.length > 0 ? this : void 0;
    }
    optimizeNames(h, x) {
      const { nodes: O } = this;
      let A = O.length;
      for (; A--; ) {
        const R = O[A];
        R.optimizeNames(h, x) || (k(h, R.names), O.splice(A, 1));
      }
      return O.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((h, x) => z(h, x.names), {});
    }
  }
  class g extends f {
    render(h) {
      return "{" + h._n + super.render(h) + "}" + h._n;
    }
  }
  class v extends f {
  }
  class y extends g {
  }
  y.kind = "else";
  class m extends g {
    constructor(h, x) {
      super(x), this.condition = h;
    }
    render(h) {
      let x = `if(${this.condition})` + super.render(h);
      return this.else && (x += "else " + this.else.render(h)), x;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const h = this.condition;
      if (h === !0)
        return this.nodes;
      let x = this.else;
      if (x) {
        const O = x.optimizeNodes();
        x = this.else = Array.isArray(O) ? new y(O) : O;
      }
      if (x)
        return h === !1 ? x instanceof m ? x : x.nodes : this.nodes.length ? this : new m(F(h), x instanceof m ? [x] : x.nodes);
      if (!(h === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(h, x) {
      var O;
      if (this.else = (O = this.else) === null || O === void 0 ? void 0 : O.optimizeNames(h, x), !!(super.optimizeNames(h, x) || this.else))
        return this.condition = j(this.condition, h, x), this;
    }
    get names() {
      const h = super.names;
      return re(h, this.condition), this.else && z(h, this.else.names), h;
    }
  }
  m.kind = "if";
  class $ extends g {
  }
  $.kind = "for";
  class S extends $ {
    constructor(h) {
      super(), this.iteration = h;
    }
    render(h) {
      return `for(${this.iteration})` + super.render(h);
    }
    optimizeNames(h, x) {
      if (super.optimizeNames(h, x))
        return this.iteration = j(this.iteration, h, x), this;
    }
    get names() {
      return z(super.names, this.iteration.names);
    }
  }
  class T extends $ {
    constructor(h, x, O, A) {
      super(), this.varKind = h, this.name = x, this.from = O, this.to = A;
    }
    render(h) {
      const x = h.es5 ? n.varKinds.var : this.varKind, { name: O, from: A, to: R } = this;
      return `for(${x} ${O}=${A}; ${O}<${R}; ${O}++)` + super.render(h);
    }
    get names() {
      const h = re(super.names, this.from);
      return re(h, this.to);
    }
  }
  class I extends $ {
    constructor(h, x, O, A) {
      super(), this.loop = h, this.varKind = x, this.name = O, this.iterable = A;
    }
    render(h) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
    }
    optimizeNames(h, x) {
      if (super.optimizeNames(h, x))
        return this.iterable = j(this.iterable, h, x), this;
    }
    get names() {
      return z(super.names, this.iterable.names);
    }
  }
  class W extends g {
    constructor(h, x, O) {
      super(), this.name = h, this.args = x, this.async = O;
    }
    render(h) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
    }
  }
  W.kind = "func";
  class ne extends f {
    render(h) {
      return "return " + super.render(h);
    }
  }
  ne.kind = "return";
  class ce extends g {
    render(h) {
      let x = "try" + super.render(h);
      return this.catch && (x += this.catch.render(h)), this.finally && (x += this.finally.render(h)), x;
    }
    optimizeNodes() {
      var h, x;
      return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (x = this.finally) === null || x === void 0 || x.optimizeNodes(), this;
    }
    optimizeNames(h, x) {
      var O, A;
      return super.optimizeNames(h, x), (O = this.catch) === null || O === void 0 || O.optimizeNames(h, x), (A = this.finally) === null || A === void 0 || A.optimizeNames(h, x), this;
    }
    get names() {
      const h = super.names;
      return this.catch && z(h, this.catch.names), this.finally && z(h, this.finally.names), h;
    }
  }
  class he extends g {
    constructor(h) {
      super(), this.error = h;
    }
    render(h) {
      return `catch(${this.error})` + super.render(h);
    }
  }
  he.kind = "catch";
  class te extends g {
    render(h) {
      return "finally" + super.render(h);
    }
  }
  te.kind = "finally";
  class U {
    constructor(h, x = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...x, _n: x.lines ? `
` : "" }, this._extScope = h, this._scope = new n.Scope({ parent: h }), this._nodes = [new v()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(h) {
      return this._scope.name(h);
    }
    // reserves unique name in the external scope
    scopeName(h) {
      return this._extScope.name(h);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(h, x) {
      const O = this._extScope.value(h, x);
      return (this._values[O.prefix] || (this._values[O.prefix] = /* @__PURE__ */ new Set())).add(O), O;
    }
    getScopeValue(h, x) {
      return this._extScope.getValue(h, x);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(h) {
      return this._extScope.scopeRefs(h, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(h, x, O, A) {
      const R = this._scope.toName(x);
      return O !== void 0 && A && (this._constants[R.str] = O), this._leafNode(new i(h, R, O)), R;
    }
    // `const` declaration (`var` in es5 mode)
    const(h, x, O) {
      return this._def(n.varKinds.const, h, x, O);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(h, x, O) {
      return this._def(n.varKinds.let, h, x, O);
    }
    // `var` declaration with optional assignment
    var(h, x, O) {
      return this._def(n.varKinds.var, h, x, O);
    }
    // assignment code
    assign(h, x, O) {
      return this._leafNode(new o(h, x, O));
    }
    // `+=` code
    add(h, x) {
      return this._leafNode(new l(h, e.operators.ADD, x));
    }
    // appends passed SafeExpr to code or executes Block
    code(h) {
      return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new d(h)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...h) {
      const x = ["{"];
      for (const [O, A] of h)
        x.length > 1 && x.push(","), x.push(O), (O !== A || this.opts.es5) && (x.push(":"), (0, t.addCodeArg)(x, A));
      return x.push("}"), new t._Code(x);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(h, x, O) {
      if (this._blockNode(new m(h)), x && O)
        this.code(x).else().code(O).endIf();
      else if (x)
        this.code(x).endIf();
      else if (O)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(h) {
      return this._elseNode(new m(h));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(h, x) {
      return this._blockNode(h), x && this.code(x).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(h, x) {
      return this._for(new S(h), x);
    }
    // `for` statement for a range of values
    forRange(h, x, O, A, R = this.opts.es5 ? n.varKinds.var : n.varKinds.let) {
      const M = this._scope.toName(h);
      return this._for(new T(R, M, x, O), () => A(M));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(h, x, O, A = n.varKinds.const) {
      const R = this._scope.toName(h);
      if (this.opts.es5) {
        const M = x instanceof t.Name ? x : this.var("_arr", x);
        return this.forRange("_i", 0, (0, t._)`${M}.length`, (V) => {
          this.var(R, (0, t._)`${M}[${V}]`), O(R);
        });
      }
      return this._for(new I("of", A, R, x), () => O(R));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(h, x, O, A = this.opts.es5 ? n.varKinds.var : n.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(h, (0, t._)`Object.keys(${x})`, O);
      const R = this._scope.toName(h);
      return this._for(new I("in", A, R, x), () => O(R));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode($);
    }
    // `label` statement
    label(h) {
      return this._leafNode(new u(h));
    }
    // `break` statement
    break(h) {
      return this._leafNode(new c(h));
    }
    // `return` statement
    return(h) {
      const x = new ne();
      if (this._blockNode(x), this.code(h), x.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(ne);
    }
    // `try` statement
    try(h, x, O) {
      if (!x && !O)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const A = new ce();
      if (this._blockNode(A), this.code(h), x) {
        const R = this.name("e");
        this._currNode = A.catch = new he(R), x(R);
      }
      return O && (this._currNode = A.finally = new te(), this.code(O)), this._endBlockNode(he, te);
    }
    // `throw` statement
    throw(h) {
      return this._leafNode(new p(h));
    }
    // start self-balancing block
    block(h, x) {
      return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(x), this;
    }
    // end the current self-balancing block
    endBlock(h) {
      const x = this._blockStarts.pop();
      if (x === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const O = this._nodes.length - x;
      if (O < 0 || h !== void 0 && O !== h)
        throw new Error(`CodeGen: wrong number of nodes: ${O} vs ${h} expected`);
      return this._nodes.length = x, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(h, x = t.nil, O, A) {
      return this._blockNode(new W(h, x, O)), A && this.code(A).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(W);
    }
    optimize(h = 1) {
      for (; h-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(h) {
      return this._currNode.nodes.push(h), this;
    }
    _blockNode(h) {
      this._currNode.nodes.push(h), this._nodes.push(h);
    }
    _endBlockNode(h, x) {
      const O = this._currNode;
      if (O instanceof h || x && O instanceof x)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${x ? `${h.kind}/${x.kind}` : h.kind}"`);
    }
    _elseNode(h) {
      const x = this._currNode;
      if (!(x instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = x.else = h, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const h = this._nodes;
      return h[h.length - 1];
    }
    set _currNode(h) {
      const x = this._nodes;
      x[x.length - 1] = h;
    }
  }
  e.CodeGen = U;
  function z(_, h) {
    for (const x in h)
      _[x] = (_[x] || 0) + (h[x] || 0);
    return _;
  }
  function re(_, h) {
    return h instanceof t._CodeOrName ? z(_, h.names) : _;
  }
  function j(_, h, x) {
    if (_ instanceof t.Name)
      return O(_);
    if (!A(_))
      return _;
    return new t._Code(_._items.reduce((R, M) => (M instanceof t.Name && (M = O(M)), M instanceof t._Code ? R.push(...M._items) : R.push(M), R), []));
    function O(R) {
      const M = x[R.str];
      return M === void 0 || h[R.str] !== 1 ? R : (delete h[R.str], M);
    }
    function A(R) {
      return R instanceof t._Code && R._items.some((M) => M instanceof t.Name && h[M.str] === 1 && x[M.str] !== void 0);
    }
  }
  function k(_, h) {
    for (const x in h)
      _[x] = (_[x] || 0) - (h[x] || 0);
  }
  function F(_) {
    return typeof _ == "boolean" || typeof _ == "number" || _ === null ? !_ : (0, t._)`!${E(_)}`;
  }
  e.not = F;
  const D = w(e.operators.AND);
  function q(..._) {
    return _.reduce(D);
  }
  e.and = q;
  const C = w(e.operators.OR);
  function P(..._) {
    return _.reduce(C);
  }
  e.or = P;
  function w(_) {
    return (h, x) => h === t.nil ? x : x === t.nil ? h : (0, t._)`${E(h)} ${_} ${E(x)}`;
  }
  function E(_) {
    return _ instanceof t.Name ? _ : (0, t._)`(${_})`;
  }
})(K);
var L = {};
Object.defineProperty(L, "__esModule", { value: !0 });
L.checkStrictMode = L.getErrorPath = L.Type = L.useFunc = L.setEvaluated = L.evaluatedPropsToName = L.mergeEvaluated = L.eachItem = L.unescapeJsonPointer = L.escapeJsonPointer = L.escapeFragment = L.unescapeFragment = L.schemaRefOrVal = L.schemaHasRulesButRef = L.schemaHasRules = L.checkUnknownRules = L.alwaysValidSchema = L.toHash = void 0;
const ie = K, yf = Gn;
function gf(e) {
  const t = {};
  for (const n of e)
    t[n] = !0;
  return t;
}
L.toHash = gf;
function xf(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (su(e, t), !iu(t, e.self.RULES.all));
}
L.alwaysValidSchema = xf;
function su(e, t = e.schema) {
  const { opts: n, self: a } = e;
  if (!n.strictSchema || typeof t == "boolean")
    return;
  const r = a.RULES.keywords;
  for (const s in t)
    r[s] || lu(e, `unknown keyword: "${s}"`);
}
L.checkUnknownRules = su;
function iu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (t[n])
      return !0;
  return !1;
}
L.schemaHasRules = iu;
function bf(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (n !== "$ref" && t.all[n])
      return !0;
  return !1;
}
L.schemaHasRulesButRef = bf;
function $f({ topSchemaRef: e, schemaPath: t }, n, a, r) {
  if (!r) {
    if (typeof n == "number" || typeof n == "boolean")
      return n;
    if (typeof n == "string")
      return (0, ie._)`${n}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(a)}`;
}
L.schemaRefOrVal = $f;
function wf(e) {
  return ou(decodeURIComponent(e));
}
L.unescapeFragment = wf;
function _f(e) {
  return encodeURIComponent(ri(e));
}
L.escapeFragment = _f;
function ri(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
L.escapeJsonPointer = ri;
function ou(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
L.unescapeJsonPointer = ou;
function Ef(e, t) {
  if (Array.isArray(e))
    for (const n of e)
      t(n);
  else
    t(e);
}
L.eachItem = Ef;
function qo({ mergeNames: e, mergeToName: t, mergeValues: n, resultToName: a }) {
  return (r, s, i, o) => {
    const l = i === void 0 ? s : i instanceof ie.Name ? (s instanceof ie.Name ? e(r, s, i) : t(r, s, i), i) : s instanceof ie.Name ? (t(r, i, s), s) : n(s, i);
    return o === ie.Name && !(l instanceof ie.Name) ? a(r, l) : l;
  };
}
L.mergeEvaluated = {
  props: qo({
    mergeNames: (e, t, n) => e.if((0, ie._)`${n} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(n, !0), () => e.assign(n, (0, ie._)`${n} || {}`).code((0, ie._)`Object.assign(${n}, ${t})`));
    }),
    mergeToName: (e, t, n) => e.if((0, ie._)`${n} !== true`, () => {
      t === !0 ? e.assign(n, !0) : (e.assign(n, (0, ie._)`${n} || {}`), si(e, n, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: cu
  }),
  items: qo({
    mergeNames: (e, t, n) => e.if((0, ie._)`${n} !== true && ${t} !== undefined`, () => e.assign(n, (0, ie._)`${t} === true ? true : ${n} > ${t} ? ${n} : ${t}`)),
    mergeToName: (e, t, n) => e.if((0, ie._)`${n} !== true`, () => e.assign(n, t === !0 ? !0 : (0, ie._)`${n} > ${t} ? ${n} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function cu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const n = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && si(e, n, t), n;
}
L.evaluatedPropsToName = cu;
function si(e, t, n) {
  Object.keys(n).forEach((a) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(a)}`, !0));
}
L.setEvaluated = si;
const Bo = {};
function Sf(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Bo[t.code] || (Bo[t.code] = new yf._Code(t.code))
  });
}
L.useFunc = Sf;
var As;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(As || (L.Type = As = {}));
function Rf(e, t, n) {
  if (e instanceof ie.Name) {
    const a = t === As.Num;
    return n ? a ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : a ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return n ? (0, ie.getProperty)(e).toString() : "/" + ri(e);
}
L.getErrorPath = Rf;
function lu(e, t, n = e.opts.strictSchema) {
  if (n) {
    if (t = `strict mode: ${t}`, n === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
L.checkStrictMode = lu;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
const Oe = K, Pf = {
  // validation function arguments
  data: new Oe.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Oe.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Oe.Name("instancePath"),
  parentData: new Oe.Name("parentData"),
  parentDataProperty: new Oe.Name("parentDataProperty"),
  rootData: new Oe.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Oe.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Oe.Name("vErrors"),
  // null or array of validation errors
  errors: new Oe.Name("errors"),
  // counter of validation errors
  this: new Oe.Name("this"),
  // "globals"
  self: new Oe.Name("self"),
  scope: new Oe.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Oe.Name("json"),
  jsonPos: new Oe.Name("jsonPos"),
  jsonLen: new Oe.Name("jsonLen"),
  jsonPart: new Oe.Name("jsonPart")
};
ze.default = Pf;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = K, n = L, a = ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function r(y, m = e.keywordError, $, S) {
    const { it: T } = y, { gen: I, compositeRule: W, allErrors: ne } = T, ce = p(y, m, $);
    S ?? (W || ne) ? l(I, ce) : u(T, (0, t._)`[${ce}]`);
  }
  e.reportError = r;
  function s(y, m = e.keywordError, $) {
    const { it: S } = y, { gen: T, compositeRule: I, allErrors: W } = S, ne = p(y, m, $);
    l(T, ne), I || W || u(S, a.default.vErrors);
  }
  e.reportExtraError = s;
  function i(y, m) {
    y.assign(a.default.errors, m), y.if((0, t._)`${a.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${a.default.vErrors}.length`, m), () => y.assign(a.default.vErrors, null)));
  }
  e.resetErrorsCount = i;
  function o({ gen: y, keyword: m, schemaValue: $, data: S, errsCount: T, it: I }) {
    if (T === void 0)
      throw new Error("ajv implementation error");
    const W = y.name("err");
    y.forRange("i", T, a.default.errors, (ne) => {
      y.const(W, (0, t._)`${a.default.vErrors}[${ne}]`), y.if((0, t._)`${W}.instancePath === undefined`, () => y.assign((0, t._)`${W}.instancePath`, (0, t.strConcat)(a.default.instancePath, I.errorPath))), y.assign((0, t._)`${W}.schemaPath`, (0, t.str)`${I.errSchemaPath}/${m}`), I.opts.verbose && (y.assign((0, t._)`${W}.schema`, $), y.assign((0, t._)`${W}.data`, S));
    });
  }
  e.extendErrors = o;
  function l(y, m) {
    const $ = y.const("err", m);
    y.if((0, t._)`${a.default.vErrors} === null`, () => y.assign(a.default.vErrors, (0, t._)`[${$}]`), (0, t._)`${a.default.vErrors}.push(${$})`), y.code((0, t._)`${a.default.errors}++`);
  }
  function u(y, m) {
    const { gen: $, validateName: S, schemaEnv: T } = y;
    T.$async ? $.throw((0, t._)`new ${y.ValidationError}(${m})`) : ($.assign((0, t._)`${S}.errors`, m), $.return(!1));
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
  function p(y, m, $) {
    const { createErrors: S } = y.it;
    return S === !1 ? (0, t._)`{}` : d(y, m, $);
  }
  function d(y, m, $ = {}) {
    const { gen: S, it: T } = y, I = [
      f(T, $),
      g(y, $)
    ];
    return v(y, m, I), S.object(...I);
  }
  function f({ errorPath: y }, { instancePath: m }) {
    const $ = m ? (0, t.str)`${y}${(0, n.getErrorPath)(m, n.Type.Str)}` : y;
    return [a.default.instancePath, (0, t.strConcat)(a.default.instancePath, $)];
  }
  function g({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: $, parentSchema: S }) {
    let T = S ? m : (0, t.str)`${m}/${y}`;
    return $ && (T = (0, t.str)`${T}${(0, n.getErrorPath)($, n.Type.Str)}`), [c.schemaPath, T];
  }
  function v(y, { params: m, message: $ }, S) {
    const { keyword: T, data: I, schemaValue: W, it: ne } = y, { opts: ce, propertyName: he, topSchemaRef: te, schemaPath: U } = ne;
    S.push([c.keyword, T], [c.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), ce.messages && S.push([c.message, typeof $ == "function" ? $(y) : $]), ce.verbose && S.push([c.schema, W], [c.parentSchema, (0, t._)`${te}${U}`], [a.default.data, I]), he && S.push([c.propertyName, he]);
  }
})(Qn);
Object.defineProperty(mn, "__esModule", { value: !0 });
mn.boolOrEmptySchema = mn.topBoolOrEmptySchema = void 0;
const Of = Qn, Tf = K, Af = ze, jf = {
  message: "boolean schema is false"
};
function kf(e) {
  const { gen: t, schema: n, validateName: a } = e;
  n === !1 ? uu(e, !1) : typeof n == "object" && n.$async === !0 ? t.return(Af.default.data) : (t.assign((0, Tf._)`${a}.errors`, null), t.return(!0));
}
mn.topBoolOrEmptySchema = kf;
function Nf(e, t) {
  const { gen: n, schema: a } = e;
  a === !1 ? (n.var(t, !1), uu(e)) : n.var(t, !0);
}
mn.boolOrEmptySchema = Nf;
function uu(e, t) {
  const { gen: n, data: a } = e, r = {
    gen: n,
    keyword: "false schema",
    data: a,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Of.reportError)(r, jf, void 0, t);
}
var ye = {}, qt = {};
Object.defineProperty(qt, "__esModule", { value: !0 });
qt.getRules = qt.isJSONType = void 0;
const If = ["string", "number", "integer", "boolean", "null", "object", "array"], Cf = new Set(If);
function Lf(e) {
  return typeof e == "string" && Cf.has(e);
}
qt.isJSONType = Lf;
function Df() {
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
qt.getRules = Df;
var ut = {};
Object.defineProperty(ut, "__esModule", { value: !0 });
ut.shouldUseRule = ut.shouldUseGroup = ut.schemaHasRulesForType = void 0;
function Ff({ schema: e, self: t }, n) {
  const a = t.RULES.types[n];
  return a && a !== !0 && pu(e, a);
}
ut.schemaHasRulesForType = Ff;
function pu(e, t) {
  return t.rules.some((n) => du(e, n));
}
ut.shouldUseGroup = pu;
function du(e, t) {
  var n;
  return e[t.keyword] !== void 0 || ((n = t.definition.implements) === null || n === void 0 ? void 0 : n.some((a) => e[a] !== void 0));
}
ut.shouldUseRule = du;
Object.defineProperty(ye, "__esModule", { value: !0 });
ye.reportTypeError = ye.checkDataTypes = ye.checkDataType = ye.coerceAndCheckDataType = ye.getJSONTypes = ye.getSchemaTypes = ye.DataType = void 0;
const Uf = qt, zf = ut, Mf = Qn, Y = K, fu = L;
var un;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(un || (ye.DataType = un = {}));
function qf(e) {
  const t = mu(e.type);
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
ye.getSchemaTypes = qf;
function mu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Uf.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ye.getJSONTypes = mu;
function Bf(e, t) {
  const { gen: n, data: a, opts: r } = e, s = Vf(t, r.coerceTypes), i = t.length > 0 && !(s.length === 0 && t.length === 1 && (0, zf.schemaHasRulesForType)(e, t[0]));
  if (i) {
    const o = ii(t, a, r.strictNumbers, un.Wrong);
    n.if(o, () => {
      s.length ? Hf(e, t, s) : oi(e);
    });
  }
  return i;
}
ye.coerceAndCheckDataType = Bf;
const hu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Vf(e, t) {
  return t ? e.filter((n) => hu.has(n) || t === "array" && n === "array") : [];
}
function Hf(e, t, n) {
  const { gen: a, data: r, opts: s } = e, i = a.let("dataType", (0, Y._)`typeof ${r}`), o = a.let("coerced", (0, Y._)`undefined`);
  s.coerceTypes === "array" && a.if((0, Y._)`${i} == 'object' && Array.isArray(${r}) && ${r}.length == 1`, () => a.assign(r, (0, Y._)`${r}[0]`).assign(i, (0, Y._)`typeof ${r}`).if(ii(t, r, s.strictNumbers), () => a.assign(o, r))), a.if((0, Y._)`${o} !== undefined`);
  for (const u of n)
    (hu.has(u) || u === "array" && s.coerceTypes === "array") && l(u);
  a.else(), oi(e), a.endIf(), a.if((0, Y._)`${o} !== undefined`, () => {
    a.assign(r, o), Gf(e, o);
  });
  function l(u) {
    switch (u) {
      case "string":
        a.elseIf((0, Y._)`${i} == "number" || ${i} == "boolean"`).assign(o, (0, Y._)`"" + ${r}`).elseIf((0, Y._)`${r} === null`).assign(o, (0, Y._)`""`);
        return;
      case "number":
        a.elseIf((0, Y._)`${i} == "boolean" || ${r} === null
              || (${i} == "string" && ${r} && ${r} == +${r})`).assign(o, (0, Y._)`+${r}`);
        return;
      case "integer":
        a.elseIf((0, Y._)`${i} === "boolean" || ${r} === null
              || (${i} === "string" && ${r} && ${r} == +${r} && !(${r} % 1))`).assign(o, (0, Y._)`+${r}`);
        return;
      case "boolean":
        a.elseIf((0, Y._)`${r} === "false" || ${r} === 0 || ${r} === null`).assign(o, !1).elseIf((0, Y._)`${r} === "true" || ${r} === 1`).assign(o, !0);
        return;
      case "null":
        a.elseIf((0, Y._)`${r} === "" || ${r} === 0 || ${r} === false`), a.assign(o, null);
        return;
      case "array":
        a.elseIf((0, Y._)`${i} === "string" || ${i} === "number"
              || ${i} === "boolean" || ${r} === null`).assign(o, (0, Y._)`[${r}]`);
    }
  }
}
function Gf({ gen: e, parentData: t, parentDataProperty: n }, a) {
  e.if((0, Y._)`${t} !== undefined`, () => e.assign((0, Y._)`${t}[${n}]`, a));
}
function js(e, t, n, a = un.Correct) {
  const r = a === un.Correct ? Y.operators.EQ : Y.operators.NEQ;
  let s;
  switch (e) {
    case "null":
      return (0, Y._)`${t} ${r} null`;
    case "array":
      s = (0, Y._)`Array.isArray(${t})`;
      break;
    case "object":
      s = (0, Y._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      s = i((0, Y._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      s = i();
      break;
    default:
      return (0, Y._)`typeof ${t} ${r} ${e}`;
  }
  return a === un.Correct ? s : (0, Y.not)(s);
  function i(o = Y.nil) {
    return (0, Y.and)((0, Y._)`typeof ${t} == "number"`, o, n ? (0, Y._)`isFinite(${t})` : Y.nil);
  }
}
ye.checkDataType = js;
function ii(e, t, n, a) {
  if (e.length === 1)
    return js(e[0], t, n, a);
  let r;
  const s = (0, fu.toHash)(e);
  if (s.array && s.object) {
    const i = (0, Y._)`typeof ${t} != "object"`;
    r = s.null ? i : (0, Y._)`!${t} || ${i}`, delete s.null, delete s.array, delete s.object;
  } else
    r = Y.nil;
  s.number && delete s.integer;
  for (const i in s)
    r = (0, Y.and)(r, js(i, t, n, a));
  return r;
}
ye.checkDataTypes = ii;
const Kf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Y._)`{type: ${e}}` : (0, Y._)`{type: ${t}}`
};
function oi(e) {
  const t = Wf(e);
  (0, Mf.reportError)(t, Kf);
}
ye.reportTypeError = oi;
function Wf(e) {
  const { gen: t, data: n, schema: a } = e, r = (0, fu.schemaRefOrVal)(e, a, "type");
  return {
    gen: t,
    keyword: "type",
    data: n,
    schema: a.type,
    schemaCode: r,
    schemaValue: r,
    parentSchema: a,
    params: {},
    it: e
  };
}
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
Za.assignDefaults = void 0;
const Qt = K, Xf = L;
function Jf(e, t) {
  const { properties: n, items: a } = e.schema;
  if (t === "object" && n)
    for (const r in n)
      Vo(e, r, n[r].default);
  else t === "array" && Array.isArray(a) && a.forEach((r, s) => Vo(e, s, r.default));
}
Za.assignDefaults = Jf;
function Vo(e, t, n) {
  const { gen: a, compositeRule: r, data: s, opts: i } = e;
  if (n === void 0)
    return;
  const o = (0, Qt._)`${s}${(0, Qt.getProperty)(t)}`;
  if (r) {
    (0, Xf.checkStrictMode)(e, `default is ignored for: ${o}`);
    return;
  }
  let l = (0, Qt._)`${o} === undefined`;
  i.useDefaults === "empty" && (l = (0, Qt._)`${l} || ${o} === null || ${o} === ""`), a.if(l, (0, Qt._)`${o} = ${(0, Qt.stringify)(n)}`);
}
var at = {}, Z = {};
Object.defineProperty(Z, "__esModule", { value: !0 });
Z.validateUnion = Z.validateArray = Z.usePattern = Z.callValidateCode = Z.schemaProperties = Z.allSchemaProperties = Z.noPropertyInData = Z.propertyInData = Z.isOwnProperty = Z.hasPropFunc = Z.reportMissingProp = Z.checkMissingProp = Z.checkReportMissingProp = void 0;
const oe = K, ci = L, vt = ze, Yf = L;
function Qf(e, t) {
  const { gen: n, data: a, it: r } = e;
  n.if(ui(n, a, t, r.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, oe._)`${t}` }, !0), e.error();
  });
}
Z.checkReportMissingProp = Qf;
function Zf({ gen: e, data: t, it: { opts: n } }, a, r) {
  return (0, oe.or)(...a.map((s) => (0, oe.and)(ui(e, t, s, n.ownProperties), (0, oe._)`${r} = ${s}`)));
}
Z.checkMissingProp = Zf;
function em(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
Z.reportMissingProp = em;
function vu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, oe._)`Object.prototype.hasOwnProperty`
  });
}
Z.hasPropFunc = vu;
function li(e, t, n) {
  return (0, oe._)`${vu(e)}.call(${t}, ${n})`;
}
Z.isOwnProperty = li;
function tm(e, t, n, a) {
  const r = (0, oe._)`${t}${(0, oe.getProperty)(n)} !== undefined`;
  return a ? (0, oe._)`${r} && ${li(e, t, n)}` : r;
}
Z.propertyInData = tm;
function ui(e, t, n, a) {
  const r = (0, oe._)`${t}${(0, oe.getProperty)(n)} === undefined`;
  return a ? (0, oe.or)(r, (0, oe.not)(li(e, t, n))) : r;
}
Z.noPropertyInData = ui;
function yu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
Z.allSchemaProperties = yu;
function nm(e, t) {
  return yu(t).filter((n) => !(0, ci.alwaysValidSchema)(e, t[n]));
}
Z.schemaProperties = nm;
function am({ schemaCode: e, data: t, it: { gen: n, topSchemaRef: a, schemaPath: r, errorPath: s }, it: i }, o, l, u) {
  const c = u ? (0, oe._)`${e}, ${t}, ${a}${r}` : t, p = [
    [vt.default.instancePath, (0, oe.strConcat)(vt.default.instancePath, s)],
    [vt.default.parentData, i.parentData],
    [vt.default.parentDataProperty, i.parentDataProperty],
    [vt.default.rootData, vt.default.rootData]
  ];
  i.opts.dynamicRef && p.push([vt.default.dynamicAnchors, vt.default.dynamicAnchors]);
  const d = (0, oe._)`${c}, ${n.object(...p)}`;
  return l !== oe.nil ? (0, oe._)`${o}.call(${l}, ${d})` : (0, oe._)`${o}(${d})`;
}
Z.callValidateCode = am;
const rm = (0, oe._)`new RegExp`;
function sm({ gen: e, it: { opts: t } }, n) {
  const a = t.unicodeRegExp ? "u" : "", { regExp: r } = t.code, s = r(n, a);
  return e.scopeValue("pattern", {
    key: s.toString(),
    ref: s,
    code: (0, oe._)`${r.code === "new RegExp" ? rm : (0, Yf.useFunc)(e, r)}(${n}, ${a})`
  });
}
Z.usePattern = sm;
function im(e) {
  const { gen: t, data: n, keyword: a, it: r } = e, s = t.name("valid");
  if (r.allErrors) {
    const o = t.let("valid", !0);
    return i(() => t.assign(o, !1)), o;
  }
  return t.var(s, !0), i(() => t.break()), s;
  function i(o) {
    const l = t.const("len", (0, oe._)`${n}.length`);
    t.forRange("i", 0, l, (u) => {
      e.subschema({
        keyword: a,
        dataProp: u,
        dataPropType: ci.Type.Num
      }, s), t.if((0, oe.not)(s), o);
    });
  }
}
Z.validateArray = im;
function om(e) {
  const { gen: t, schema: n, keyword: a, it: r } = e;
  if (!Array.isArray(n))
    throw new Error("ajv implementation error");
  if (n.some((l) => (0, ci.alwaysValidSchema)(r, l)) && !r.opts.unevaluated)
    return;
  const i = t.let("valid", !1), o = t.name("_valid");
  t.block(() => n.forEach((l, u) => {
    const c = e.subschema({
      keyword: a,
      schemaProp: u,
      compositeRule: !0
    }, o);
    t.assign(i, (0, oe._)`${i} || ${o}`), e.mergeValidEvaluated(c, o) || t.if((0, oe.not)(i));
  })), e.result(i, () => e.reset(), () => e.error(!0));
}
Z.validateUnion = om;
Object.defineProperty(at, "__esModule", { value: !0 });
at.validateKeywordUsage = at.validSchemaType = at.funcKeywordCode = at.macroKeywordCode = void 0;
const ke = K, Tt = ze, cm = Z, lm = Qn;
function um(e, t) {
  const { gen: n, keyword: a, schema: r, parentSchema: s, it: i } = e, o = t.macro.call(i.self, r, s, i), l = gu(n, a, o);
  i.opts.validateSchema !== !1 && i.self.validateSchema(o, !0);
  const u = n.name("valid");
  e.subschema({
    schema: o,
    schemaPath: ke.nil,
    errSchemaPath: `${i.errSchemaPath}/${a}`,
    topSchemaRef: l,
    compositeRule: !0
  }, u), e.pass(u, () => e.error(!0));
}
at.macroKeywordCode = um;
function pm(e, t) {
  var n;
  const { gen: a, keyword: r, schema: s, parentSchema: i, $data: o, it: l } = e;
  fm(l, t);
  const u = !o && t.compile ? t.compile.call(l.self, s, i, l) : t.validate, c = gu(a, r, u), p = a.let("valid");
  e.block$data(p, d), e.ok((n = t.valid) !== null && n !== void 0 ? n : p);
  function d() {
    if (t.errors === !1)
      v(), t.modifying && Ho(e), y(() => e.error());
    else {
      const m = t.async ? f() : g();
      t.modifying && Ho(e), y(() => dm(e, m));
    }
  }
  function f() {
    const m = a.let("ruleErrs", null);
    return a.try(() => v((0, ke._)`await `), ($) => a.assign(p, !1).if((0, ke._)`${$} instanceof ${l.ValidationError}`, () => a.assign(m, (0, ke._)`${$}.errors`), () => a.throw($))), m;
  }
  function g() {
    const m = (0, ke._)`${c}.errors`;
    return a.assign(m, null), v(ke.nil), m;
  }
  function v(m = t.async ? (0, ke._)`await ` : ke.nil) {
    const $ = l.opts.passContext ? Tt.default.this : Tt.default.self, S = !("compile" in t && !o || t.schema === !1);
    a.assign(p, (0, ke._)`${m}${(0, cm.callValidateCode)(e, c, $, S)}`, t.modifying);
  }
  function y(m) {
    var $;
    a.if((0, ke.not)(($ = t.valid) !== null && $ !== void 0 ? $ : p), m);
  }
}
at.funcKeywordCode = pm;
function Ho(e) {
  const { gen: t, data: n, it: a } = e;
  t.if(a.parentData, () => t.assign(n, (0, ke._)`${a.parentData}[${a.parentDataProperty}]`));
}
function dm(e, t) {
  const { gen: n } = e;
  n.if((0, ke._)`Array.isArray(${t})`, () => {
    n.assign(Tt.default.vErrors, (0, ke._)`${Tt.default.vErrors} === null ? ${t} : ${Tt.default.vErrors}.concat(${t})`).assign(Tt.default.errors, (0, ke._)`${Tt.default.vErrors}.length`), (0, lm.extendErrors)(e);
  }, () => e.error());
}
function fm({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function gu(e, t, n) {
  if (n === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof n == "function" ? { ref: n } : { ref: n, code: (0, ke.stringify)(n) });
}
function mm(e, t, n = !1) {
  return !t.length || t.some((a) => a === "array" ? Array.isArray(e) : a === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == a || n && typeof e > "u");
}
at.validSchemaType = mm;
function hm({ schema: e, opts: t, self: n, errSchemaPath: a }, r, s) {
  if (Array.isArray(r.keyword) ? !r.keyword.includes(s) : r.keyword !== s)
    throw new Error("ajv implementation error");
  const i = r.dependencies;
  if (i != null && i.some((o) => !Object.prototype.hasOwnProperty.call(e, o)))
    throw new Error(`parent schema must have dependencies of ${s}: ${i.join(",")}`);
  if (r.validateSchema && !r.validateSchema(e[s])) {
    const l = `keyword "${s}" value is invalid at path "${a}": ` + n.errorsText(r.validateSchema.errors);
    if (t.validateSchema === "log")
      n.logger.error(l);
    else
      throw new Error(l);
  }
}
at.validateKeywordUsage = hm;
var St = {};
Object.defineProperty(St, "__esModule", { value: !0 });
St.extendSubschemaMode = St.extendSubschemaData = St.getSubschema = void 0;
const nt = K, xu = L;
function vm(e, { keyword: t, schemaProp: n, schema: a, schemaPath: r, errSchemaPath: s, topSchemaRef: i }) {
  if (t !== void 0 && a !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const o = e.schema[t];
    return n === void 0 ? {
      schema: o,
      schemaPath: (0, nt._)`${e.schemaPath}${(0, nt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: o[n],
      schemaPath: (0, nt._)`${e.schemaPath}${(0, nt.getProperty)(t)}${(0, nt.getProperty)(n)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, xu.escapeFragment)(n)}`
    };
  }
  if (a !== void 0) {
    if (r === void 0 || s === void 0 || i === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: a,
      schemaPath: r,
      topSchemaRef: i,
      errSchemaPath: s
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
St.getSubschema = vm;
function ym(e, t, { dataProp: n, dataPropType: a, data: r, dataTypes: s, propertyName: i }) {
  if (r !== void 0 && n !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: o } = t;
  if (n !== void 0) {
    const { errorPath: u, dataPathArr: c, opts: p } = t, d = o.let("data", (0, nt._)`${t.data}${(0, nt.getProperty)(n)}`, !0);
    l(d), e.errorPath = (0, nt.str)`${u}${(0, xu.getErrorPath)(n, a, p.jsPropertySyntax)}`, e.parentDataProperty = (0, nt._)`${n}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (r !== void 0) {
    const u = r instanceof nt.Name ? r : o.let("data", r, !0);
    l(u), i !== void 0 && (e.propertyName = i);
  }
  s && (e.dataTypes = s);
  function l(u) {
    e.data = u, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, u];
  }
}
St.extendSubschemaData = ym;
function gm(e, { jtdDiscriminator: t, jtdMetadata: n, compositeRule: a, createErrors: r, allErrors: s }) {
  a !== void 0 && (e.compositeRule = a), r !== void 0 && (e.createErrors = r), s !== void 0 && (e.allErrors = s), e.jtdDiscriminator = t, e.jtdMetadata = n;
}
St.extendSubschemaMode = gm;
var Se = {}, bu = function e(t, n) {
  if (t === n) return !0;
  if (t && n && typeof t == "object" && typeof n == "object") {
    if (t.constructor !== n.constructor) return !1;
    var a, r, s;
    if (Array.isArray(t)) {
      if (a = t.length, a != n.length) return !1;
      for (r = a; r-- !== 0; )
        if (!e(t[r], n[r])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === n.source && t.flags === n.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === n.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === n.toString();
    if (s = Object.keys(t), a = s.length, a !== Object.keys(n).length) return !1;
    for (r = a; r-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(n, s[r])) return !1;
    for (r = a; r-- !== 0; ) {
      var i = s[r];
      if (!e(t[i], n[i])) return !1;
    }
    return !0;
  }
  return t !== t && n !== n;
}, $u = { exports: {} }, _t = $u.exports = function(e, t, n) {
  typeof t == "function" && (n = t, t = {}), n = t.cb || n;
  var a = typeof n == "function" ? n : n.pre || function() {
  }, r = n.post || function() {
  };
  Aa(t, a, r, e, "", e);
};
_t.keywords = {
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
_t.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
_t.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
_t.skipKeywords = {
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
function Aa(e, t, n, a, r, s, i, o, l, u) {
  if (a && typeof a == "object" && !Array.isArray(a)) {
    t(a, r, s, i, o, l, u);
    for (var c in a) {
      var p = a[c];
      if (Array.isArray(p)) {
        if (c in _t.arrayKeywords)
          for (var d = 0; d < p.length; d++)
            Aa(e, t, n, p[d], r + "/" + c + "/" + d, s, r, c, a, d);
      } else if (c in _t.propsKeywords) {
        if (p && typeof p == "object")
          for (var f in p)
            Aa(e, t, n, p[f], r + "/" + c + "/" + xm(f), s, r, c, a, f);
      } else (c in _t.keywords || e.allKeys && !(c in _t.skipKeywords)) && Aa(e, t, n, p, r + "/" + c, s, r, c, a);
    }
    n(a, r, s, i, o, l, u);
  }
}
function xm(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var bm = $u.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const $m = L, wm = bu, _m = bm, Em = /* @__PURE__ */ new Set([
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
function Sm(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !ks(e) : t ? wu(e) <= t : !1;
}
Se.inlineRef = Sm;
const Rm = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function ks(e) {
  for (const t in e) {
    if (Rm.has(t))
      return !0;
    const n = e[t];
    if (Array.isArray(n) && n.some(ks) || typeof n == "object" && ks(n))
      return !0;
  }
  return !1;
}
function wu(e) {
  let t = 0;
  for (const n in e) {
    if (n === "$ref")
      return 1 / 0;
    if (t++, !Em.has(n) && (typeof e[n] == "object" && (0, $m.eachItem)(e[n], (a) => t += wu(a)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function _u(e, t = "", n) {
  n !== !1 && (t = pn(t));
  const a = e.parse(t);
  return Eu(e, a);
}
Se.getFullPath = _u;
function Eu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = Eu;
const Pm = /#\/?$/;
function pn(e) {
  return e ? e.replace(Pm, "") : "";
}
Se.normalizeId = pn;
function Om(e, t, n) {
  return n = pn(n), e.resolve(t, n);
}
Se.resolveUrl = Om;
const Tm = /^[a-z_][-a-z0-9._]*$/i;
function Am(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: n, uriResolver: a } = this.opts, r = pn(e[n] || t), s = { "": r }, i = _u(a, r, !1), o = {}, l = /* @__PURE__ */ new Set();
  return _m(e, { allKeys: !0 }, (p, d, f, g) => {
    if (g === void 0)
      return;
    const v = i + d;
    let y = s[g];
    typeof p[n] == "string" && (y = m.call(this, p[n])), $.call(this, p.$anchor), $.call(this, p.$dynamicAnchor), s[d] = y;
    function m(S) {
      const T = this.opts.uriResolver.resolve;
      if (S = pn(y ? T(y, S) : S), l.has(S))
        throw c(S);
      l.add(S);
      let I = this.refs[S];
      return typeof I == "string" && (I = this.refs[I]), typeof I == "object" ? u(p, I.schema, S) : S !== pn(v) && (S[0] === "#" ? (u(p, o[S], S), o[S] = p) : this.refs[S] = v), S;
    }
    function $(S) {
      if (typeof S == "string") {
        if (!Tm.test(S))
          throw new Error(`invalid anchor "${S}"`);
        m.call(this, `#${S}`);
      }
    }
  }), o;
  function u(p, d, f) {
    if (d !== void 0 && !wm(p, d))
      throw c(f);
  }
  function c(p) {
    return new Error(`reference "${p}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = Am;
Object.defineProperty(Ve, "__esModule", { value: !0 });
Ve.getData = Ve.KeywordCxt = Ve.validateFunctionCode = void 0;
const Su = mn, Go = ye, pi = ut, Ma = ye, jm = Za, Mn = at, Fr = St, B = K, G = ze, km = Se, pt = L, jn = Qn;
function Nm(e) {
  if (Ou(e) && (Tu(e), Pu(e))) {
    Lm(e);
    return;
  }
  Ru(e, () => (0, Su.topBoolOrEmptySchema)(e));
}
Ve.validateFunctionCode = Nm;
function Ru({ gen: e, validateName: t, schema: n, schemaEnv: a, opts: r }, s) {
  r.code.es5 ? e.func(t, (0, B._)`${G.default.data}, ${G.default.valCxt}`, a.$async, () => {
    e.code((0, B._)`"use strict"; ${Ko(n, r)}`), Cm(e, r), e.code(s);
  }) : e.func(t, (0, B._)`${G.default.data}, ${Im(r)}`, a.$async, () => e.code(Ko(n, r)).code(s));
}
function Im(e) {
  return (0, B._)`{${G.default.instancePath}="", ${G.default.parentData}, ${G.default.parentDataProperty}, ${G.default.rootData}=${G.default.data}${e.dynamicRef ? (0, B._)`, ${G.default.dynamicAnchors}={}` : B.nil}}={}`;
}
function Cm(e, t) {
  e.if(G.default.valCxt, () => {
    e.var(G.default.instancePath, (0, B._)`${G.default.valCxt}.${G.default.instancePath}`), e.var(G.default.parentData, (0, B._)`${G.default.valCxt}.${G.default.parentData}`), e.var(G.default.parentDataProperty, (0, B._)`${G.default.valCxt}.${G.default.parentDataProperty}`), e.var(G.default.rootData, (0, B._)`${G.default.valCxt}.${G.default.rootData}`), t.dynamicRef && e.var(G.default.dynamicAnchors, (0, B._)`${G.default.valCxt}.${G.default.dynamicAnchors}`);
  }, () => {
    e.var(G.default.instancePath, (0, B._)`""`), e.var(G.default.parentData, (0, B._)`undefined`), e.var(G.default.parentDataProperty, (0, B._)`undefined`), e.var(G.default.rootData, G.default.data), t.dynamicRef && e.var(G.default.dynamicAnchors, (0, B._)`{}`);
  });
}
function Lm(e) {
  const { schema: t, opts: n, gen: a } = e;
  Ru(e, () => {
    n.$comment && t.$comment && ju(e), Mm(e), a.let(G.default.vErrors, null), a.let(G.default.errors, 0), n.unevaluated && Dm(e), Au(e), Vm(e);
  });
}
function Dm(e) {
  const { gen: t, validateName: n } = e;
  e.evaluated = t.const("evaluated", (0, B._)`${n}.evaluated`), t.if((0, B._)`${e.evaluated}.dynamicProps`, () => t.assign((0, B._)`${e.evaluated}.props`, (0, B._)`undefined`)), t.if((0, B._)`${e.evaluated}.dynamicItems`, () => t.assign((0, B._)`${e.evaluated}.items`, (0, B._)`undefined`));
}
function Ko(e, t) {
  const n = typeof e == "object" && e[t.schemaId];
  return n && (t.code.source || t.code.process) ? (0, B._)`/*# sourceURL=${n} */` : B.nil;
}
function Fm(e, t) {
  if (Ou(e) && (Tu(e), Pu(e))) {
    Um(e, t);
    return;
  }
  (0, Su.boolOrEmptySchema)(e, t);
}
function Pu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const n in e)
    if (t.RULES.all[n])
      return !0;
  return !1;
}
function Ou(e) {
  return typeof e.schema != "boolean";
}
function Um(e, t) {
  const { schema: n, gen: a, opts: r } = e;
  r.$comment && n.$comment && ju(e), qm(e), Bm(e);
  const s = a.const("_errs", G.default.errors);
  Au(e, s), a.var(t, (0, B._)`${s} === ${G.default.errors}`);
}
function Tu(e) {
  (0, pt.checkUnknownRules)(e), zm(e);
}
function Au(e, t) {
  if (e.opts.jtd)
    return Wo(e, [], !1, t);
  const n = (0, Go.getSchemaTypes)(e.schema), a = (0, Go.coerceAndCheckDataType)(e, n);
  Wo(e, n, !a, t);
}
function zm(e) {
  const { schema: t, errSchemaPath: n, opts: a, self: r } = e;
  t.$ref && a.ignoreKeywordsWithRef && (0, pt.schemaHasRulesButRef)(t, r.RULES) && r.logger.warn(`$ref: keywords ignored in schema at path "${n}"`);
}
function Mm(e) {
  const { schema: t, opts: n } = e;
  t.default !== void 0 && n.useDefaults && n.strictSchema && (0, pt.checkStrictMode)(e, "default is ignored in the schema root");
}
function qm(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, km.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Bm(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function ju({ gen: e, schemaEnv: t, schema: n, errSchemaPath: a, opts: r }) {
  const s = n.$comment;
  if (r.$comment === !0)
    e.code((0, B._)`${G.default.self}.logger.log(${s})`);
  else if (typeof r.$comment == "function") {
    const i = (0, B.str)`${a}/$comment`, o = e.scopeValue("root", { ref: t.root });
    e.code((0, B._)`${G.default.self}.opts.$comment(${s}, ${i}, ${o}.schema)`);
  }
}
function Vm(e) {
  const { gen: t, schemaEnv: n, validateName: a, ValidationError: r, opts: s } = e;
  n.$async ? t.if((0, B._)`${G.default.errors} === 0`, () => t.return(G.default.data), () => t.throw((0, B._)`new ${r}(${G.default.vErrors})`)) : (t.assign((0, B._)`${a}.errors`, G.default.vErrors), s.unevaluated && Hm(e), t.return((0, B._)`${G.default.errors} === 0`));
}
function Hm({ gen: e, evaluated: t, props: n, items: a }) {
  n instanceof B.Name && e.assign((0, B._)`${t}.props`, n), a instanceof B.Name && e.assign((0, B._)`${t}.items`, a);
}
function Wo(e, t, n, a) {
  const { gen: r, schema: s, data: i, allErrors: o, opts: l, self: u } = e, { RULES: c } = u;
  if (s.$ref && (l.ignoreKeywordsWithRef || !(0, pt.schemaHasRulesButRef)(s, c))) {
    r.block(() => Iu(e, "$ref", c.all.$ref.definition));
    return;
  }
  l.jtd || Gm(e, t), r.block(() => {
    for (const d of c.rules)
      p(d);
    p(c.post);
  });
  function p(d) {
    (0, pi.shouldUseGroup)(s, d) && (d.type ? (r.if((0, Ma.checkDataType)(d.type, i, l.strictNumbers)), Xo(e, d), t.length === 1 && t[0] === d.type && n && (r.else(), (0, Ma.reportTypeError)(e)), r.endIf()) : Xo(e, d), o || r.if((0, B._)`${G.default.errors} === ${a || 0}`));
  }
}
function Xo(e, t) {
  const { gen: n, schema: a, opts: { useDefaults: r } } = e;
  r && (0, jm.assignDefaults)(e, t.type), n.block(() => {
    for (const s of t.rules)
      (0, pi.shouldUseRule)(a, s) && Iu(e, s.keyword, s.definition, t.type);
  });
}
function Gm(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Km(e, t), e.opts.allowUnionTypes || Wm(e, t), Xm(e, e.dataTypes));
}
function Km(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((n) => {
      ku(e.dataTypes, n) || di(e, `type "${n}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Ym(e, t);
  }
}
function Wm(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && di(e, "use allowUnionTypes to allow union type keyword");
}
function Xm(e, t) {
  const n = e.self.RULES.all;
  for (const a in n) {
    const r = n[a];
    if (typeof r == "object" && (0, pi.shouldUseRule)(e.schema, r)) {
      const { type: s } = r.definition;
      s.length && !s.some((i) => Jm(t, i)) && di(e, `missing type "${s.join(",")}" for keyword "${a}"`);
    }
  }
}
function Jm(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function ku(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Ym(e, t) {
  const n = [];
  for (const a of e.dataTypes)
    ku(t, a) ? n.push(a) : t.includes("integer") && a === "number" && n.push("integer");
  e.dataTypes = n;
}
function di(e, t) {
  const n = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${n}" (strictTypes)`, (0, pt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Nu {
  constructor(t, n, a) {
    if ((0, Mn.validateKeywordUsage)(t, n, a), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = a, this.data = t.data, this.schema = t.schema[a], this.$data = n.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, pt.schemaRefOrVal)(t, this.schema, a, this.$data), this.schemaType = n.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = n, this.$data)
      this.schemaCode = t.gen.const("vSchema", Cu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Mn.validSchemaType)(this.schema, n.schemaType, n.allowUndefined))
      throw new Error(`${a} value must be ${JSON.stringify(n.schemaType)}`);
    ("code" in n ? n.trackErrors : n.errors !== !1) && (this.errsCount = t.gen.const("_errs", G.default.errors));
  }
  result(t, n, a) {
    this.failResult((0, B.not)(t), n, a);
  }
  failResult(t, n, a) {
    this.gen.if(t), a ? a() : this.error(), n ? (this.gen.else(), n(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, n) {
    this.failResult((0, B.not)(t), void 0, n);
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
    this.fail((0, B._)`${n} !== undefined && (${(0, B.or)(this.invalid$data(), t)})`);
  }
  error(t, n, a) {
    if (n) {
      this.setParams(n), this._error(t, a), this.setParams({});
      return;
    }
    this._error(t, a);
  }
  _error(t, n) {
    (t ? jn.reportExtraError : jn.reportError)(this, this.def.error, n);
  }
  $dataError() {
    (0, jn.reportError)(this, this.def.$dataError || jn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, jn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, n) {
    n ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, n, a = B.nil) {
    this.gen.block(() => {
      this.check$data(t, a), n();
    });
  }
  check$data(t = B.nil, n = B.nil) {
    if (!this.$data)
      return;
    const { gen: a, schemaCode: r, schemaType: s, def: i } = this;
    a.if((0, B.or)((0, B._)`${r} === undefined`, n)), t !== B.nil && a.assign(t, !0), (s.length || i.validateSchema) && (a.elseIf(this.invalid$data()), this.$dataError(), t !== B.nil && a.assign(t, !1)), a.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: n, schemaType: a, def: r, it: s } = this;
    return (0, B.or)(i(), o());
    function i() {
      if (a.length) {
        if (!(n instanceof B.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(a) ? a : [a];
        return (0, B._)`${(0, Ma.checkDataTypes)(l, n, s.opts.strictNumbers, Ma.DataType.Wrong)}`;
      }
      return B.nil;
    }
    function o() {
      if (r.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: r.validateSchema });
        return (0, B._)`!${l}(${n})`;
      }
      return B.nil;
    }
  }
  subschema(t, n) {
    const a = (0, Fr.getSubschema)(this.it, t);
    (0, Fr.extendSubschemaData)(a, this.it, t), (0, Fr.extendSubschemaMode)(a, t);
    const r = { ...this.it, ...a, items: void 0, props: void 0 };
    return Fm(r, n), r;
  }
  mergeEvaluated(t, n) {
    const { it: a, gen: r } = this;
    a.opts.unevaluated && (a.props !== !0 && t.props !== void 0 && (a.props = pt.mergeEvaluated.props(r, t.props, a.props, n)), a.items !== !0 && t.items !== void 0 && (a.items = pt.mergeEvaluated.items(r, t.items, a.items, n)));
  }
  mergeValidEvaluated(t, n) {
    const { it: a, gen: r } = this;
    if (a.opts.unevaluated && (a.props !== !0 || a.items !== !0))
      return r.if(n, () => this.mergeEvaluated(t, B.Name)), !0;
  }
}
Ve.KeywordCxt = Nu;
function Iu(e, t, n, a) {
  const r = new Nu(e, n, t);
  "code" in n ? n.code(r, a) : r.$data && n.validate ? (0, Mn.funcKeywordCode)(r, n) : "macro" in n ? (0, Mn.macroKeywordCode)(r, n) : (n.compile || n.validate) && (0, Mn.funcKeywordCode)(r, n);
}
const Qm = /^\/(?:[^~]|~0|~1)*$/, Zm = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Cu(e, { dataLevel: t, dataNames: n, dataPathArr: a }) {
  let r, s;
  if (e === "")
    return G.default.rootData;
  if (e[0] === "/") {
    if (!Qm.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    r = e, s = G.default.rootData;
  } else {
    const u = Zm.exec(e);
    if (!u)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const c = +u[1];
    if (r = u[2], r === "#") {
      if (c >= t)
        throw new Error(l("property/index", c));
      return a[t - c];
    }
    if (c > t)
      throw new Error(l("data", c));
    if (s = n[t - c], !r)
      return s;
  }
  let i = s;
  const o = r.split("/");
  for (const u of o)
    u && (s = (0, B._)`${s}${(0, B.getProperty)((0, pt.unescapeJsonPointer)(u))}`, i = (0, B._)`${i} && ${s}`);
  return i;
  function l(u, c) {
    return `Cannot access ${u} ${c} levels up, current level is ${t}`;
  }
}
Ve.getData = Cu;
var xn = {};
Object.defineProperty(xn, "__esModule", { value: !0 });
class eh extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
xn.default = eh;
var Xt = {};
Object.defineProperty(Xt, "__esModule", { value: !0 });
const Ur = Se;
class th extends Error {
  constructor(t, n, a, r) {
    super(r || `can't resolve reference ${a} from id ${n}`), this.missingRef = (0, Ur.resolveUrl)(t, n, a), this.missingSchema = (0, Ur.normalizeId)((0, Ur.getFullPath)(t, this.missingRef));
  }
}
Xt.default = th;
var Ne = {};
Object.defineProperty(Ne, "__esModule", { value: !0 });
Ne.resolveSchema = Ne.getCompilingSchema = Ne.resolveRef = Ne.compileSchema = Ne.SchemaEnv = void 0;
const Ge = K, nh = xn, Ot = ze, We = Se, Jo = L, ah = Ve;
class er {
  constructor(t) {
    var n;
    this.refs = {}, this.dynamicAnchors = {};
    let a;
    typeof t.schema == "object" && (a = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (n = t.baseId) !== null && n !== void 0 ? n : (0, We.normalizeId)(a == null ? void 0 : a[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = a == null ? void 0 : a.$async, this.refs = {};
  }
}
Ne.SchemaEnv = er;
function fi(e) {
  const t = Lu.call(this, e);
  if (t)
    return t;
  const n = (0, We.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: a, lines: r } = this.opts.code, { ownProperties: s } = this.opts, i = new Ge.CodeGen(this.scope, { es5: a, lines: r, ownProperties: s });
  let o;
  e.$async && (o = i.scopeValue("Error", {
    ref: nh.default,
    code: (0, Ge._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = i.scopeName("validate");
  e.validateName = l;
  const u = {
    gen: i,
    allErrors: this.opts.allErrors,
    data: Ot.default.data,
    parentData: Ot.default.parentData,
    parentDataProperty: Ot.default.parentDataProperty,
    dataNames: [Ot.default.data],
    dataPathArr: [Ge.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: i.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ge.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: n,
    baseId: e.baseId || n,
    schemaPath: Ge.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ge._)`""`,
    opts: this.opts,
    self: this
  };
  let c;
  try {
    this._compilations.add(e), (0, ah.validateFunctionCode)(u), i.optimize(this.opts.code.optimize);
    const p = i.toString();
    c = `${i.scopeRefs(Ot.default.scope)}return ${p}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const f = new Function(`${Ot.default.self}`, `${Ot.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(l, { ref: f }), f.errors = null, f.schema = e.schema, f.schemaEnv = e, e.$async && (f.$async = !0), this.opts.code.source === !0 && (f.source = { validateName: l, validateCode: p, scopeValues: i._values }), this.opts.unevaluated) {
      const { props: g, items: v } = u;
      f.evaluated = {
        props: g instanceof Ge.Name ? void 0 : g,
        items: v instanceof Ge.Name ? void 0 : v,
        dynamicProps: g instanceof Ge.Name,
        dynamicItems: v instanceof Ge.Name
      }, f.source && (f.source.evaluated = (0, Ge.stringify)(f.evaluated));
    }
    return e.validate = f, e;
  } catch (p) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), p;
  } finally {
    this._compilations.delete(e);
  }
}
Ne.compileSchema = fi;
function rh(e, t, n) {
  var a;
  n = (0, We.resolveUrl)(this.opts.uriResolver, t, n);
  const r = e.refs[n];
  if (r)
    return r;
  let s = oh.call(this, e, n);
  if (s === void 0) {
    const i = (a = e.localRefs) === null || a === void 0 ? void 0 : a[n], { schemaId: o } = this.opts;
    i && (s = new er({ schema: i, schemaId: o, root: e, baseId: t }));
  }
  if (s !== void 0)
    return e.refs[n] = sh.call(this, s);
}
Ne.resolveRef = rh;
function sh(e) {
  return (0, We.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : fi.call(this, e);
}
function Lu(e) {
  for (const t of this._compilations)
    if (ih(t, e))
      return t;
}
Ne.getCompilingSchema = Lu;
function ih(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function oh(e, t) {
  let n;
  for (; typeof (n = this.refs[t]) == "string"; )
    t = n;
  return n || this.schemas[t] || tr.call(this, e, t);
}
function tr(e, t) {
  const n = this.opts.uriResolver.parse(t), a = (0, We._getFullPath)(this.opts.uriResolver, n);
  let r = (0, We.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && a === r)
    return zr.call(this, n, e);
  const s = (0, We.normalizeId)(a), i = this.refs[s] || this.schemas[s];
  if (typeof i == "string") {
    const o = tr.call(this, e, i);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : zr.call(this, n, o);
  }
  if (typeof (i == null ? void 0 : i.schema) == "object") {
    if (i.validate || fi.call(this, i), s === (0, We.normalizeId)(t)) {
      const { schema: o } = i, { schemaId: l } = this.opts, u = o[l];
      return u && (r = (0, We.resolveUrl)(this.opts.uriResolver, r, u)), new er({ schema: o, schemaId: l, root: e, baseId: r });
    }
    return zr.call(this, n, i);
  }
}
Ne.resolveSchema = tr;
const ch = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function zr(e, { baseId: t, schema: n, root: a }) {
  var r;
  if (((r = e.fragment) === null || r === void 0 ? void 0 : r[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof n == "boolean")
      return;
    const l = n[(0, Jo.unescapeFragment)(o)];
    if (l === void 0)
      return;
    n = l;
    const u = typeof n == "object" && n[this.opts.schemaId];
    !ch.has(o) && u && (t = (0, We.resolveUrl)(this.opts.uriResolver, t, u));
  }
  let s;
  if (typeof n != "boolean" && n.$ref && !(0, Jo.schemaHasRulesButRef)(n, this.RULES)) {
    const o = (0, We.resolveUrl)(this.opts.uriResolver, t, n.$ref);
    s = tr.call(this, a, o);
  }
  const { schemaId: i } = this.opts;
  if (s = s || new er({ schema: n, schemaId: i, root: a, baseId: t }), s.schema !== s.root.schema)
    return s;
}
const lh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", uh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", ph = "object", dh = [
  "$data"
], fh = {
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
}, mh = !1, hh = {
  $id: lh,
  description: uh,
  type: ph,
  required: dh,
  properties: fh,
  additionalProperties: mh
};
var mi = {}, nr = { exports: {} };
const vh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Du = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u), hi = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu), Fu = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu), yh = RegExp.prototype.test.bind(/^[\da-z\-._~!$&'()*+,;=:@/]$/iu);
function Uu(e) {
  let t = "", n = 0, a = 0;
  for (a = 0; a < e.length; a++)
    if (n = e[a].charCodeAt(0), n !== 48) {
      if (!(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
        return "";
      t += e[a];
      break;
    }
  for (a += 1; a < e.length; a++) {
    if (n = e[a].charCodeAt(0), !(n >= 48 && n <= 57 || n >= 65 && n <= 70 || n >= 97 && n <= 102))
      return "";
    t += e[a];
  }
  return t;
}
const gh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Yo(e) {
  return e.length = 0, !0;
}
function xh(e, t, n) {
  if (e.length) {
    const a = Uu(e);
    if (a !== "")
      t.push(a);
    else
      return n.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function bh(e) {
  let t = 0;
  const n = { error: !1, address: "", zone: "" }, a = [], r = [];
  let s = !1, i = !1, o = xh;
  for (let l = 0; l < e.length; l++) {
    const u = e[l];
    if (!(u === "[" || u === "]"))
      if (u === ":") {
        if (s === !0 && (i = !0), !o(r, a, n))
          break;
        if (++t > 7) {
          n.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (s = !0), a.push(":");
        continue;
      } else if (u === "%") {
        if (!o(r, a, n))
          break;
        o = Yo;
      } else {
        r.push(u);
        continue;
      }
  }
  return r.length && (o === Yo ? n.zone = r.join("") : i ? a.push(r.join("")) : a.push(Uu(r))), n.address = a.join(""), n;
}
function zu(e) {
  if ($h(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = bh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let n = t.address, a = t.address;
    return t.zone && (n += "%" + t.zone, a += "%25" + t.zone), { host: n, isIPV6: !0, escapedHost: a };
  }
}
function $h(e, t) {
  let n = 0;
  for (let a = 0; a < e.length; a++)
    e[a] === t && n++;
  return n;
}
function wh(e) {
  let t = e;
  const n = [];
  let a = -1, r = 0;
  for (; r = t.length; ) {
    if (r === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        n.push("/");
        break;
      } else {
        n.push(t);
        break;
      }
    } else if (r === 2) {
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
    } else if (r === 3 && t === "/..") {
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
    if ((a = t.indexOf("/", 1)) === -1) {
      n.push(t);
      break;
    } else
      n.push(t.slice(0, a)), t = t.slice(a);
  }
  return n.join("");
}
const _h = { "@": "%40", "/": "%2F", "?": "%3F", "#": "%23", ":": "%3A" }, Eh = /[@/?#:]/g, Sh = /[@/?#]/g;
function Mu(e, t) {
  const n = t ? Sh : Eh;
  return n.lastIndex = 0, e.replace(n, (a) => _h[a]);
}
function Rh(e, t = !1) {
  if (e.indexOf("%") === -1)
    return e;
  let n = "";
  for (let a = 0; a < e.length; a++) {
    if (e[a] === "%" && a + 2 < e.length) {
      const r = e.slice(a + 1, a + 3);
      if (hi(r)) {
        const s = r.toUpperCase(), i = String.fromCharCode(parseInt(s, 16));
        t && Fu(i) ? n += i : n += "%" + s, a += 2;
        continue;
      }
    }
    n += e[a];
  }
  return n;
}
function Ph(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) {
    if (e[n] === "%" && n + 2 < e.length) {
      const a = e.slice(n + 1, n + 3);
      if (hi(a)) {
        const r = a.toUpperCase(), s = String.fromCharCode(parseInt(r, 16));
        s !== "." && Fu(s) ? t += s : t += "%" + r, n += 2;
        continue;
      }
    }
    yh(e[n]) ? t += e[n] : t += escape(e[n]);
  }
  return t;
}
function Oh(e) {
  let t = "";
  for (let n = 0; n < e.length; n++) {
    if (e[n] === "%" && n + 2 < e.length) {
      const a = e.slice(n + 1, n + 3);
      if (hi(a)) {
        t += "%" + a.toUpperCase(), n += 2;
        continue;
      }
    }
    t += escape(e[n]);
  }
  return t;
}
function Th(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let n = unescape(e.host);
    if (!Du(n)) {
      const a = zu(n);
      a.isIPV6 === !0 ? n = `[${a.escapedHost}]` : n = Mu(n, !1);
    }
    t.push(n);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var qu = {
  nonSimpleDomain: gh,
  recomposeAuthority: Th,
  reescapeHostDelimiters: Mu,
  normalizePercentEncoding: Rh,
  normalizePathEncoding: Ph,
  escapePreservingEscapes: Oh,
  removeDotSegments: wh,
  isIPv4: Du,
  isUUID: vh,
  normalizeIPv6: zu
};
const { isUUID: Ah } = qu, jh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Bu(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Vu(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Hu(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function kh(e) {
  return e.secure = Bu(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Nh(e) {
  if ((e.port === (Bu(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, n] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = n, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Ih(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const n = e.path.match(jh);
  if (n) {
    const a = t.scheme || e.scheme || "urn";
    e.nid = n[1].toLowerCase(), e.nss = n[2];
    const r = `${a}:${t.nid || e.nid}`, s = vi(r);
    e.path = void 0, s && (e = s.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Ch(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const n = t.scheme || e.scheme || "urn", a = e.nid.toLowerCase(), r = `${n}:${t.nid || a}`, s = vi(r);
  s && (e = s.serialize(e, t));
  const i = e, o = e.nss;
  return i.path = `${a || t.nid}:${o}`, t.skipEscape = !0, i;
}
function Lh(e, t) {
  const n = e;
  return n.uuid = n.nss, n.nss = void 0, !t.tolerant && (!n.uuid || !Ah(n.uuid)) && (n.error = n.error || "UUID is not valid."), n;
}
function Dh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Gu = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Vu,
    serialize: Hu
  }
), Fh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Gu.domainHost,
    parse: Vu,
    serialize: Hu
  }
), ja = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: kh,
    serialize: Nh
  }
), Uh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: ja.domainHost,
    parse: ja.parse,
    serialize: ja.serialize
  }
), zh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Ih,
    serialize: Ch,
    skipNormalize: !0
  }
), Mh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: Lh,
    serialize: Dh,
    skipNormalize: !0
  }
), qa = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Gu,
    https: Fh,
    ws: ja,
    wss: Uh,
    urn: zh,
    "urn:uuid": Mh
  }
);
Object.setPrototypeOf(qa, null);
function vi(e) {
  return e && (qa[
    /** @type {SchemeName} */
    e
  ] || qa[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var qh = {
  SCHEMES: qa,
  getSchemeHandler: vi
};
const { normalizeIPv6: Bh, removeDotSegments: Un, recomposeAuthority: Vh, normalizePercentEncoding: Hh, normalizePathEncoding: Gh, escapePreservingEscapes: Kh, reescapeHostDelimiters: Wh, isIPv4: Xh, nonSimpleDomain: Jh } = qu, { SCHEMES: Yh, getSchemeHandler: Ku } = qh;
function Qh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  av(e, t) : typeof e == "object" && (e = /** @type {T} */
  hn(Bt(e, t), t)), e;
}
function Zh(e, t, n) {
  const a = n ? Object.assign({ scheme: "null" }, n) : { scheme: "null" }, r = Wu(hn(e, a), hn(t, a), a, !0);
  return a.skipEscape = !0, Bt(r, a);
}
function Wu(e, t, n, a) {
  const r = {};
  return a || (e = hn(Bt(e, n), n), t = hn(Bt(t, n), n)), n = n || {}, !n.tolerant && t.scheme ? (r.scheme = t.scheme, r.userinfo = t.userinfo, r.host = t.host, r.port = t.port, r.path = Un(t.path || ""), r.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (r.userinfo = t.userinfo, r.host = t.host, r.port = t.port, r.path = Un(t.path || ""), r.query = t.query) : (t.path ? (t.path[0] === "/" ? r.path = Un(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? r.path = "/" + t.path : e.path ? r.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : r.path = t.path, r.path = Un(r.path)), r.query = t.query) : (r.path = e.path, t.query !== void 0 ? r.query = t.query : r.query = e.query), r.userinfo = e.userinfo, r.host = e.host, r.port = e.port), r.scheme = e.scheme), r.fragment = t.fragment, r;
}
function ev(e, t, n) {
  const a = Qo(e, n), r = Qo(t, n);
  return a !== void 0 && r !== void 0 && a.toLowerCase() === r.toLowerCase();
}
function Bt(e, t) {
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
  }, a = Object.assign({}, t), r = [], s = Ku(a.scheme || n.scheme);
  s && s.serialize && s.serialize(n, a), n.path !== void 0 && (a.skipEscape ? n.path = Hh(n.path) : (n.path = Kh(n.path), n.scheme !== void 0 && (n.path = n.path.split("%3A").join(":")))), a.reference !== "suffix" && n.scheme && r.push(n.scheme, ":");
  const i = Vh(n);
  if (i !== void 0 && (a.reference !== "suffix" && r.push("//"), r.push(i), n.path && n.path[0] !== "/" && r.push("/")), n.path !== void 0) {
    let o = n.path;
    !a.absolutePath && (!s || !s.absolutePath) && (o = Un(o)), i === void 0 && o[0] === "/" && o[1] === "/" && (o = "/%2F" + o.slice(2)), r.push(o);
  }
  return n.query !== void 0 && r.push("?", n.query), n.fragment !== void 0 && r.push("#", n.fragment), r.join("");
}
const tv = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function nv(e, t) {
  if (t[2] !== void 0 && e.path && e.path[0] !== "/")
    return 'URI path must start with "/" when authority is present.';
  if (typeof e.port == "number" && (e.port < 0 || e.port > 65535))
    return "URI port is malformed.";
}
function Xu(e, t) {
  const n = Object.assign({}, t), a = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let r = !1, s = !1;
  n.reference === "suffix" && (n.scheme ? e = n.scheme + ":" + e : e = "//" + e);
  const i = e.match(tv);
  if (i) {
    a.scheme = i[1], a.userinfo = i[3], a.host = i[4], a.port = parseInt(i[5], 10), a.path = i[6] || "", a.query = i[7], a.fragment = i[8], isNaN(a.port) && (a.port = i[5]);
    const o = nv(a, i);
    if (o !== void 0 && (a.error = a.error || o, r = !0), a.host)
      if (Xh(a.host) === !1) {
        const c = Bh(a.host);
        a.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    a.scheme === void 0 && a.userinfo === void 0 && a.host === void 0 && a.port === void 0 && a.query === void 0 && !a.path ? a.reference = "same-document" : a.scheme === void 0 ? a.reference = "relative" : a.fragment === void 0 ? a.reference = "absolute" : a.reference = "uri", n.reference && n.reference !== "suffix" && n.reference !== a.reference && (a.error = a.error || "URI is not a " + n.reference + " reference.");
    const l = Ku(n.scheme || a.scheme);
    if (!n.unicodeSupport && (!l || !l.unicodeSupport) && a.host && (n.domainHost || l && l.domainHost) && s === !1 && Jh(a.host))
      try {
        a.host = URL.domainToASCII(a.host.toLowerCase());
      } catch (u) {
        a.error = a.error || "Host's domain name can not be converted to ASCII: " + u;
      }
    if ((!l || l && !l.skipNormalize) && (e.indexOf("%") !== -1 && (a.scheme !== void 0 && (a.scheme = unescape(a.scheme)), a.host !== void 0 && (a.host = Wh(unescape(a.host), s))), a.path && (a.path = Gh(a.path)), a.fragment))
      try {
        a.fragment = encodeURI(decodeURIComponent(a.fragment));
      } catch {
        a.error = a.error || "URI malformed";
      }
    l && l.parse && l.parse(a, n);
  } else
    a.error = a.error || "URI can not be parsed.";
  return { parsed: a, malformedAuthorityOrPort: r };
}
function hn(e, t) {
  return Xu(e, t).parsed;
}
function av(e, t) {
  return Ju(e, t).normalized;
}
function Ju(e, t) {
  const { parsed: n, malformedAuthorityOrPort: a } = Xu(e, t);
  return {
    normalized: a ? e : Bt(n, t),
    malformedAuthorityOrPort: a
  };
}
function Qo(e, t) {
  if (typeof e == "string") {
    const { normalized: n, malformedAuthorityOrPort: a } = Ju(e, t);
    return a ? void 0 : n;
  }
  if (typeof e == "object")
    return Bt(e, t);
}
const yi = {
  SCHEMES: Yh,
  normalize: Qh,
  resolve: Zh,
  resolveComponent: Wu,
  equal: ev,
  serialize: Bt,
  parse: hn
};
nr.exports = yi;
nr.exports.default = yi;
nr.exports.fastUri = yi;
var rv = nr.exports;
Object.defineProperty(mi, "__esModule", { value: !0 });
const Yu = rv;
Yu.code = 'require("ajv/dist/runtime/uri").default';
mi.default = Yu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ve;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var n = K;
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
  const a = xn, r = Xt, s = qt, i = Ne, o = K, l = Se, u = ye, c = L, p = hh, d = mi, f = (P, w) => new RegExp(P, w);
  f.code = "new RegExp";
  const g = ["removeAdditional", "useDefaults", "coerceTypes"], v = /* @__PURE__ */ new Set([
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
  ]), y = {
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
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, $ = 200;
  function S(P) {
    var w, E, _, h, x, O, A, R, M, V, H, le, we, se, Ze, it, pe, Yt, Rr, Pr, Or, Tr, Ar, jr, kr;
    const Rn = P.strict, Nr = (w = P.code) === null || w === void 0 ? void 0 : w.optimize, ko = Nr === !0 || Nr === void 0 ? 1 : Nr || 0, No = (_ = (E = P.code) === null || E === void 0 ? void 0 : E.regExp) !== null && _ !== void 0 ? _ : f, Od = (h = P.uriResolver) !== null && h !== void 0 ? h : d.default;
    return {
      strictSchema: (O = (x = P.strictSchema) !== null && x !== void 0 ? x : Rn) !== null && O !== void 0 ? O : !0,
      strictNumbers: (R = (A = P.strictNumbers) !== null && A !== void 0 ? A : Rn) !== null && R !== void 0 ? R : !0,
      strictTypes: (V = (M = P.strictTypes) !== null && M !== void 0 ? M : Rn) !== null && V !== void 0 ? V : "log",
      strictTuples: (le = (H = P.strictTuples) !== null && H !== void 0 ? H : Rn) !== null && le !== void 0 ? le : "log",
      strictRequired: (se = (we = P.strictRequired) !== null && we !== void 0 ? we : Rn) !== null && se !== void 0 ? se : !1,
      code: P.code ? { ...P.code, optimize: ko, regExp: No } : { optimize: ko, regExp: No },
      loopRequired: (Ze = P.loopRequired) !== null && Ze !== void 0 ? Ze : $,
      loopEnum: (it = P.loopEnum) !== null && it !== void 0 ? it : $,
      meta: (pe = P.meta) !== null && pe !== void 0 ? pe : !0,
      messages: (Yt = P.messages) !== null && Yt !== void 0 ? Yt : !0,
      inlineRefs: (Rr = P.inlineRefs) !== null && Rr !== void 0 ? Rr : !0,
      schemaId: (Pr = P.schemaId) !== null && Pr !== void 0 ? Pr : "$id",
      addUsedSchema: (Or = P.addUsedSchema) !== null && Or !== void 0 ? Or : !0,
      validateSchema: (Tr = P.validateSchema) !== null && Tr !== void 0 ? Tr : !0,
      validateFormats: (Ar = P.validateFormats) !== null && Ar !== void 0 ? Ar : !0,
      unicodeRegExp: (jr = P.unicodeRegExp) !== null && jr !== void 0 ? jr : !0,
      int32range: (kr = P.int32range) !== null && kr !== void 0 ? kr : !0,
      uriResolver: Od
    };
  }
  class T {
    constructor(w = {}) {
      this.schemas = {}, this.refs = {}, this.formats = /* @__PURE__ */ Object.create(null), this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), w = this.opts = { ...w, ...S(w) };
      const { es5: E, lines: _ } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: v, es5: E, lines: _ }), this.logger = z(w.logger);
      const h = w.validateFormats;
      w.validateFormats = !1, this.RULES = (0, s.getRules)(), I.call(this, y, w, "NOT SUPPORTED"), I.call(this, m, w, "DEPRECATED", "warn"), this._metaOpts = te.call(this), w.formats && ce.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), w.keywords && he.call(this, w.keywords), typeof w.meta == "object" && this.addMetaSchema(w.meta), ne.call(this), w.validateFormats = h;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: w, meta: E, schemaId: _ } = this.opts;
      let h = p;
      _ === "id" && (h = { ...p }, h.id = h.$id, delete h.$id), E && w && this.addMetaSchema(h, h[_], !1);
    }
    defaultMeta() {
      const { meta: w, schemaId: E } = this.opts;
      return this.opts.defaultMeta = typeof w == "object" ? w[E] || w : void 0;
    }
    validate(w, E) {
      let _;
      if (typeof w == "string") {
        if (_ = this.getSchema(w), !_)
          throw new Error(`no schema with key or ref "${w}"`);
      } else
        _ = this.compile(w);
      const h = _(E);
      return "$async" in _ || (this.errors = _.errors), h;
    }
    compile(w, E) {
      const _ = this._addSchema(w, E);
      return _.validate || this._compileSchemaEnv(_);
    }
    compileAsync(w, E) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: _ } = this.opts;
      return h.call(this, w, E);
      async function h(V, H) {
        await x.call(this, V.$schema);
        const le = this._addSchema(V, H);
        return le.validate || O.call(this, le);
      }
      async function x(V) {
        V && !this.getSchema(V) && await h.call(this, { $ref: V }, !0);
      }
      async function O(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (H) {
          if (!(H instanceof r.default))
            throw H;
          return A.call(this, H), await R.call(this, H.missingSchema), O.call(this, V);
        }
      }
      function A({ missingSchema: V, missingRef: H }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${H} cannot be resolved`);
      }
      async function R(V) {
        const H = await M.call(this, V);
        this.refs[V] || await x.call(this, H.$schema), this.refs[V] || this.addSchema(H, V, E);
      }
      async function M(V) {
        const H = this._loading[V];
        if (H)
          return H;
        try {
          return await (this._loading[V] = _(V));
        } finally {
          delete this._loading[V];
        }
      }
    }
    // Adds schema to the instance
    addSchema(w, E, _, h = this.opts.validateSchema) {
      if (Array.isArray(w)) {
        for (const O of w)
          this.addSchema(O, void 0, _, h);
        return this;
      }
      let x;
      if (typeof w == "object") {
        const { schemaId: O } = this.opts;
        if (x = w[O], x !== void 0 && typeof x != "string")
          throw new Error(`schema ${O} must be string`);
      }
      return E = (0, l.normalizeId)(E || x), this._checkUnique(E), this.schemas[E] = this._addSchema(w, _, E, h, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(w, E, _ = this.opts.validateSchema) {
      return this.addSchema(w, E, !0, _), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(w, E) {
      if (typeof w == "boolean")
        return !0;
      let _;
      if (_ = w.$schema, _ !== void 0 && typeof _ != "string")
        throw new Error("$schema must be a string");
      if (_ = _ || this.opts.defaultMeta || this.defaultMeta(), !_)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const h = this.validate(_, w);
      if (!h && E) {
        const x = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(x);
        else
          throw new Error(x);
      }
      return h;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(w) {
      let E;
      for (; typeof (E = W.call(this, w)) == "string"; )
        w = E;
      if (E === void 0) {
        const { schemaId: _ } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: _ });
        if (E = i.resolveSchema.call(this, h, w), !E)
          return;
        this.refs[w] = E;
      }
      return E.validate || this._compileSchemaEnv(E);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(w) {
      if (w instanceof RegExp)
        return this._removeAllSchemas(this.schemas, w), this._removeAllSchemas(this.refs, w), this;
      switch (typeof w) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const E = W.call(this, w);
          return typeof E == "object" && this._cache.delete(E.schema), delete this.schemas[w], delete this.refs[w], this;
        }
        case "object": {
          const E = w;
          this._cache.delete(E);
          let _ = w[this.opts.schemaId];
          return _ && (_ = (0, l.normalizeId)(_), delete this.schemas[_], delete this.refs[_]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(w) {
      for (const E of w)
        this.addKeyword(E);
      return this;
    }
    addKeyword(w, E) {
      let _;
      if (typeof w == "string")
        _ = w, typeof E == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), E.keyword = _);
      else if (typeof w == "object" && E === void 0) {
        if (E = w, _ = E.keyword, Array.isArray(_) && !_.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, _, E), !E)
        return (0, c.eachItem)(_, (x) => k.call(this, x)), this;
      D.call(this, E);
      const h = {
        ...E,
        type: (0, u.getJSONTypes)(E.type),
        schemaType: (0, u.getJSONTypes)(E.schemaType)
      };
      return (0, c.eachItem)(_, h.type.length === 0 ? (x) => k.call(this, x, h) : (x) => h.type.forEach((O) => k.call(this, x, h, O))), this;
    }
    getKeyword(w) {
      const E = this.RULES.all[w];
      return typeof E == "object" ? E.definition : !!E;
    }
    // Remove keyword
    removeKeyword(w) {
      const { RULES: E } = this;
      delete E.keywords[w], delete E.all[w];
      for (const _ of E.rules) {
        const h = _.rules.findIndex((x) => x.keyword === w);
        h >= 0 && _.rules.splice(h, 1);
      }
      return this;
    }
    // Add format
    addFormat(w, E) {
      return typeof E == "string" && (E = new RegExp(E)), this.formats[w] = E, this;
    }
    errorsText(w = this.errors, { separator: E = ", ", dataVar: _ = "data" } = {}) {
      return !w || w.length === 0 ? "No errors" : w.map((h) => `${_}${h.instancePath} ${h.message}`).reduce((h, x) => h + E + x);
    }
    $dataMetaSchema(w, E) {
      const _ = this.RULES.all;
      w = JSON.parse(JSON.stringify(w));
      for (const h of E) {
        const x = h.split("/").slice(1);
        let O = w;
        for (const A of x)
          O = O[A];
        for (const A in _) {
          const R = _[A];
          if (typeof R != "object")
            continue;
          const { $data: M } = R.definition, V = O[A];
          M && V && (O[A] = C(V));
        }
      }
      return w;
    }
    _removeAllSchemas(w, E) {
      for (const _ in w) {
        const h = w[_];
        (!E || E.test(_)) && (typeof h == "string" ? delete w[_] : h && !h.meta && (this._cache.delete(h.schema), delete w[_]));
      }
    }
    _addSchema(w, E, _, h = this.opts.validateSchema, x = this.opts.addUsedSchema) {
      let O;
      const { schemaId: A } = this.opts;
      if (typeof w == "object")
        O = w[A];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof w != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let R = this._cache.get(w);
      if (R !== void 0)
        return R;
      _ = (0, l.normalizeId)(O || _);
      const M = l.getSchemaRefs.call(this, w, _);
      return R = new i.SchemaEnv({ schema: w, schemaId: A, meta: E, baseId: _, localRefs: M }), this._cache.set(R.schema, R), x && !_.startsWith("#") && (_ && this._checkUnique(_), this.refs[_] = R), h && this.validateSchema(w, !0), R;
    }
    _checkUnique(w) {
      if (this.schemas[w] || this.refs[w])
        throw new Error(`schema with key or id "${w}" already exists`);
    }
    _compileSchemaEnv(w) {
      if (w.meta ? this._compileMetaSchema(w) : i.compileSchema.call(this, w), !w.validate)
        throw new Error("ajv implementation error");
      return w.validate;
    }
    _compileMetaSchema(w) {
      const E = this.opts;
      this.opts = this._metaOpts;
      try {
        i.compileSchema.call(this, w);
      } finally {
        this.opts = E;
      }
    }
  }
  T.ValidationError = a.default, T.MissingRefError = r.default, e.default = T;
  function I(P, w, E, _ = "error") {
    for (const h in P) {
      const x = h;
      x in w && this.logger[_](`${E}: option ${h}. ${P[x]}`);
    }
  }
  function W(P) {
    return P = (0, l.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function ne() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const w in P)
          this.addSchema(P[w], w);
  }
  function ce() {
    for (const P in this.opts.formats) {
      const w = this.opts.formats[P];
      w && this.addFormat(P, w);
    }
  }
  function he(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const w in P) {
      const E = P[w];
      E.keyword || (E.keyword = w), this.addKeyword(E);
    }
  }
  function te() {
    const P = { ...this.opts };
    for (const w of g)
      delete P[w];
    return P;
  }
  const U = { log() {
  }, warn() {
  }, error() {
  } };
  function z(P) {
    if (P === !1)
      return U;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const re = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(P, w) {
    const { RULES: E } = this;
    if ((0, c.eachItem)(P, (_) => {
      if (E.keywords[_])
        throw new Error(`Keyword ${_} is already defined`);
      if (!re.test(_))
        throw new Error(`Keyword ${_} has invalid name`);
    }), !!w && w.$data && !("code" in w || "validate" in w))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, w, E) {
    var _;
    const h = w == null ? void 0 : w.post;
    if (E && h)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: x } = this;
    let O = h ? x.post : x.rules.find(({ type: R }) => R === E);
    if (O || (O = { type: E, rules: [] }, x.rules.push(O)), x.keywords[P] = !0, !w)
      return;
    const A = {
      keyword: P,
      definition: {
        ...w,
        type: (0, u.getJSONTypes)(w.type),
        schemaType: (0, u.getJSONTypes)(w.schemaType)
      }
    };
    w.before ? F.call(this, O, A, w.before) : O.rules.push(A), x.all[P] = A, (_ = w.implements) === null || _ === void 0 || _.forEach((R) => this.addKeyword(R));
  }
  function F(P, w, E) {
    const _ = P.rules.findIndex((h) => h.keyword === E);
    _ >= 0 ? P.rules.splice(_, 0, w) : (P.rules.push(w), this.logger.warn(`rule ${E} is not defined`));
  }
  function D(P) {
    let { metaSchema: w } = P;
    w !== void 0 && (P.$data && this.opts.$data && (w = C(w)), P.validateSchema = this.compile(w, !0));
  }
  const q = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function C(P) {
    return { anyOf: [P, q] };
  }
})(ai);
var gi = {}, ar = {}, xi = {};
Object.defineProperty(xi, "__esModule", { value: !0 });
const sv = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
xi.default = sv;
var dt = {};
Object.defineProperty(dt, "__esModule", { value: !0 });
dt.callRef = dt.getValidate = void 0;
const iv = Xt, Zo = Z, Le = K, Zt = ze, ec = Ne, da = L, ov = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: n, it: a } = e, { baseId: r, schemaEnv: s, validateName: i, opts: o, self: l } = a, { root: u } = s;
    if ((n === "#" || n === "#/") && r === u.baseId)
      return p();
    const c = ec.resolveRef.call(l, u, r, n);
    if (c === void 0)
      throw new iv.default(a.opts.uriResolver, r, n);
    if (c instanceof ec.SchemaEnv)
      return d(c);
    return f(c);
    function p() {
      if (s === u)
        return ka(e, i, s, s.$async);
      const g = t.scopeValue("root", { ref: u });
      return ka(e, (0, Le._)`${g}.validate`, u, u.$async);
    }
    function d(g) {
      const v = Qu(e, g);
      ka(e, v, g, g.$async);
    }
    function f(g) {
      const v = t.scopeValue("schema", o.code.source === !0 ? { ref: g, code: (0, Le.stringify)(g) } : { ref: g }), y = t.name("valid"), m = e.subschema({
        schema: g,
        dataTypes: [],
        schemaPath: Le.nil,
        topSchemaRef: v,
        errSchemaPath: n
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Qu(e, t) {
  const { gen: n } = e;
  return t.validate ? n.scopeValue("validate", { ref: t.validate }) : (0, Le._)`${n.scopeValue("wrapper", { ref: t })}.validate`;
}
dt.getValidate = Qu;
function ka(e, t, n, a) {
  const { gen: r, it: s } = e, { allErrors: i, schemaEnv: o, opts: l } = s, u = l.passContext ? Zt.default.this : Le.nil;
  a ? c() : p();
  function c() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const g = r.let("valid");
    r.try(() => {
      r.code((0, Le._)`await ${(0, Zo.callValidateCode)(e, t, u)}`), f(t), i || r.assign(g, !0);
    }, (v) => {
      r.if((0, Le._)`!(${v} instanceof ${s.ValidationError})`, () => r.throw(v)), d(v), i || r.assign(g, !1);
    }), e.ok(g);
  }
  function p() {
    e.result((0, Zo.callValidateCode)(e, t, u), () => f(t), () => d(t));
  }
  function d(g) {
    const v = (0, Le._)`${g}.errors`;
    r.assign(Zt.default.vErrors, (0, Le._)`${Zt.default.vErrors} === null ? ${v} : ${Zt.default.vErrors}.concat(${v})`), r.assign(Zt.default.errors, (0, Le._)`${Zt.default.vErrors}.length`);
  }
  function f(g) {
    var v;
    if (!s.opts.unevaluated)
      return;
    const y = (v = n == null ? void 0 : n.validate) === null || v === void 0 ? void 0 : v.evaluated;
    if (s.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (s.props = da.mergeEvaluated.props(r, y.props, s.props));
      else {
        const m = r.var("props", (0, Le._)`${g}.evaluated.props`);
        s.props = da.mergeEvaluated.props(r, m, s.props, Le.Name);
      }
    if (s.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (s.items = da.mergeEvaluated.items(r, y.items, s.items));
      else {
        const m = r.var("items", (0, Le._)`${g}.evaluated.items`);
        s.items = da.mergeEvaluated.items(r, m, s.items, Le.Name);
      }
  }
}
dt.callRef = ka;
dt.default = ov;
Object.defineProperty(ar, "__esModule", { value: !0 });
const cv = xi, lv = dt, uv = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  cv.default,
  lv.default
];
ar.default = uv;
var rr = {}, bi = {};
Object.defineProperty(bi, "__esModule", { value: !0 });
const Ba = K, yt = Ba.operators, Va = {
  maximum: { okStr: "<=", ok: yt.LTE, fail: yt.GT },
  minimum: { okStr: ">=", ok: yt.GTE, fail: yt.LT },
  exclusiveMaximum: { okStr: "<", ok: yt.LT, fail: yt.GTE },
  exclusiveMinimum: { okStr: ">", ok: yt.GT, fail: yt.LTE }
}, pv = {
  message: ({ keyword: e, schemaCode: t }) => (0, Ba.str)`must be ${Va[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Ba._)`{comparison: ${Va[e].okStr}, limit: ${t}}`
}, dv = {
  keyword: Object.keys(Va),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: pv,
  code(e) {
    const { keyword: t, data: n, schemaCode: a } = e;
    e.fail$data((0, Ba._)`${n} ${Va[t].fail} ${a} || isNaN(${n})`);
  }
};
bi.default = dv;
var $i = {};
Object.defineProperty($i, "__esModule", { value: !0 });
const qn = K, fv = {
  message: ({ schemaCode: e }) => (0, qn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, qn._)`{multipleOf: ${e}}`
}, mv = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: fv,
  code(e) {
    const { gen: t, data: n, schemaCode: a, it: r } = e, s = r.opts.multipleOfPrecision, i = t.let("res"), o = s ? (0, qn._)`Math.abs(Math.round(${i}) - ${i}) > 1e-${s}` : (0, qn._)`${i} !== parseInt(${i})`;
    e.fail$data((0, qn._)`(${a} === 0 || (${i} = ${n}/${a}, ${o}))`);
  }
};
$i.default = mv;
var wi = {}, _i = {};
Object.defineProperty(_i, "__esModule", { value: !0 });
function Zu(e) {
  const t = e.length;
  let n = 0, a = 0, r;
  for (; a < t; )
    n++, r = e.charCodeAt(a++), r >= 55296 && r <= 56319 && a < t && (r = e.charCodeAt(a), (r & 64512) === 56320 && a++);
  return n;
}
_i.default = Zu;
Zu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(wi, "__esModule", { value: !0 });
const At = K, hv = L, vv = _i, yv = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxLength" ? "more" : "fewer";
    return (0, At.str)`must NOT have ${n} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, At._)`{limit: ${e}}`
}, gv = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: yv,
  code(e) {
    const { keyword: t, data: n, schemaCode: a, it: r } = e, s = t === "maxLength" ? At.operators.GT : At.operators.LT, i = r.opts.unicode === !1 ? (0, At._)`${n}.length` : (0, At._)`${(0, hv.useFunc)(e.gen, vv.default)}(${n})`;
    e.fail$data((0, At._)`${i} ${s} ${a}`);
  }
};
wi.default = gv;
var Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
const xv = Z, bv = L, cn = K, $v = {
  message: ({ schemaCode: e }) => (0, cn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, cn._)`{pattern: ${e}}`
}, wv = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: $v,
  code(e) {
    const { gen: t, data: n, $data: a, schema: r, schemaCode: s, it: i } = e, o = i.opts.unicodeRegExp ? "u" : "";
    if (a) {
      const { regExp: l } = i.opts.code, u = l.code === "new RegExp" ? (0, cn._)`new RegExp` : (0, bv.useFunc)(t, l), c = t.let("valid");
      t.try(() => t.assign(c, (0, cn._)`${u}(${s}, ${o}).test(${n})`), () => t.assign(c, !1)), e.fail$data((0, cn._)`!${c}`);
    } else {
      const l = (0, xv.usePattern)(e, r);
      e.fail$data((0, cn._)`!${l}.test(${n})`);
    }
  }
};
Ei.default = wv;
var Si = {};
Object.defineProperty(Si, "__esModule", { value: !0 });
const Bn = K, _v = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxProperties" ? "more" : "fewer";
    return (0, Bn.str)`must NOT have ${n} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Bn._)`{limit: ${e}}`
}, Ev = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: _v,
  code(e) {
    const { keyword: t, data: n, schemaCode: a } = e, r = t === "maxProperties" ? Bn.operators.GT : Bn.operators.LT;
    e.fail$data((0, Bn._)`Object.keys(${n}).length ${r} ${a}`);
  }
};
Si.default = Ev;
var Ri = {};
Object.defineProperty(Ri, "__esModule", { value: !0 });
const kn = Z, Vn = K, Sv = L, Rv = {
  message: ({ params: { missingProperty: e } }) => (0, Vn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Vn._)`{missingProperty: ${e}}`
}, Pv = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Rv,
  code(e) {
    const { gen: t, schema: n, schemaCode: a, data: r, $data: s, it: i } = e, { opts: o } = i;
    if (!s && n.length === 0)
      return;
    const l = n.length >= o.loopRequired;
    if (i.allErrors ? u() : c(), o.strictRequired) {
      const f = e.parentSchema.properties, { definedProperties: g } = e.it;
      for (const v of n)
        if ((f == null ? void 0 : f[v]) === void 0 && !g.has(v)) {
          const y = i.schemaEnv.baseId + i.errSchemaPath, m = `required property "${v}" is not defined at "${y}" (strictRequired)`;
          (0, Sv.checkStrictMode)(i, m, i.opts.strictRequired);
        }
    }
    function u() {
      if (l || s)
        e.block$data(Vn.nil, p);
      else
        for (const f of n)
          (0, kn.checkReportMissingProp)(e, f);
    }
    function c() {
      const f = t.let("missing");
      if (l || s) {
        const g = t.let("valid", !0);
        e.block$data(g, () => d(f, g)), e.ok(g);
      } else
        t.if((0, kn.checkMissingProp)(e, n, f)), (0, kn.reportMissingProp)(e, f), t.else();
    }
    function p() {
      t.forOf("prop", a, (f) => {
        e.setParams({ missingProperty: f }), t.if((0, kn.noPropertyInData)(t, r, f, o.ownProperties), () => e.error());
      });
    }
    function d(f, g) {
      e.setParams({ missingProperty: f }), t.forOf(f, a, () => {
        t.assign(g, (0, kn.propertyInData)(t, r, f, o.ownProperties)), t.if((0, Vn.not)(g), () => {
          e.error(), t.break();
        });
      }, Vn.nil);
    }
  }
};
Ri.default = Pv;
var Pi = {};
Object.defineProperty(Pi, "__esModule", { value: !0 });
const Hn = K, Ov = {
  message({ keyword: e, schemaCode: t }) {
    const n = e === "maxItems" ? "more" : "fewer";
    return (0, Hn.str)`must NOT have ${n} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Hn._)`{limit: ${e}}`
}, Tv = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Ov,
  code(e) {
    const { keyword: t, data: n, schemaCode: a } = e, r = t === "maxItems" ? Hn.operators.GT : Hn.operators.LT;
    e.fail$data((0, Hn._)`${n}.length ${r} ${a}`);
  }
};
Pi.default = Tv;
var Oi = {}, Zn = {};
Object.defineProperty(Zn, "__esModule", { value: !0 });
const ep = bu;
ep.code = 'require("ajv/dist/runtime/equal").default';
Zn.default = ep;
Object.defineProperty(Oi, "__esModule", { value: !0 });
const Mr = ye, _e = K, Av = L, jv = Zn, kv = {
  message: ({ params: { i: e, j: t } }) => (0, _e.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, _e._)`{i: ${e}, j: ${t}}`
}, Nv = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: kv,
  code(e) {
    const { gen: t, data: n, $data: a, schema: r, parentSchema: s, schemaCode: i, it: o } = e;
    if (!a && !r)
      return;
    const l = t.let("valid"), u = s.items ? (0, Mr.getSchemaTypes)(s.items) : [];
    e.block$data(l, c, (0, _e._)`${i} === false`), e.ok(l);
    function c() {
      const g = t.let("i", (0, _e._)`${n}.length`), v = t.let("j");
      e.setParams({ i: g, j: v }), t.assign(l, !0), t.if((0, _e._)`${g} > 1`, () => (p() ? d : f)(g, v));
    }
    function p() {
      return u.length > 0 && !u.some((g) => g === "object" || g === "array");
    }
    function d(g, v) {
      const y = t.name("item"), m = (0, Mr.checkDataTypes)(u, y, o.opts.strictNumbers, Mr.DataType.Wrong), $ = t.const("indices", (0, _e._)`{}`);
      t.for((0, _e._)`;${g}--;`, () => {
        t.let(y, (0, _e._)`${n}[${g}]`), t.if(m, (0, _e._)`continue`), u.length > 1 && t.if((0, _e._)`typeof ${y} == "string"`, (0, _e._)`${y} += "_"`), t.if((0, _e._)`typeof ${$}[${y}] == "number"`, () => {
          t.assign(v, (0, _e._)`${$}[${y}]`), e.error(), t.assign(l, !1).break();
        }).code((0, _e._)`${$}[${y}] = ${g}`);
      });
    }
    function f(g, v) {
      const y = (0, Av.useFunc)(t, jv.default), m = t.name("outer");
      t.label(m).for((0, _e._)`;${g}--;`, () => t.for((0, _e._)`${v} = ${g}; ${v}--;`, () => t.if((0, _e._)`${y}(${n}[${g}], ${n}[${v}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
Oi.default = Nv;
var Ti = {};
Object.defineProperty(Ti, "__esModule", { value: !0 });
const Ns = K, Iv = L, Cv = Zn, Lv = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ns._)`{allowedValue: ${e}}`
}, Dv = {
  keyword: "const",
  $data: !0,
  error: Lv,
  code(e) {
    const { gen: t, data: n, $data: a, schemaCode: r, schema: s } = e;
    a || s && typeof s == "object" ? e.fail$data((0, Ns._)`!${(0, Iv.useFunc)(t, Cv.default)}(${n}, ${r})`) : e.fail((0, Ns._)`${s} !== ${n}`);
  }
};
Ti.default = Dv;
var Ai = {};
Object.defineProperty(Ai, "__esModule", { value: !0 });
const zn = K, Fv = L, Uv = Zn, zv = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, zn._)`{allowedValues: ${e}}`
}, Mv = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: zv,
  code(e) {
    const { gen: t, data: n, $data: a, schema: r, schemaCode: s, it: i } = e;
    if (!a && r.length === 0)
      throw new Error("enum must have non-empty array");
    const o = r.length >= i.opts.loopEnum;
    let l;
    const u = () => l ?? (l = (0, Fv.useFunc)(t, Uv.default));
    let c;
    if (o || a)
      c = t.let("valid"), e.block$data(c, p);
    else {
      if (!Array.isArray(r))
        throw new Error("ajv implementation error");
      const f = t.const("vSchema", s);
      c = (0, zn.or)(...r.map((g, v) => d(f, v)));
    }
    e.pass(c);
    function p() {
      t.assign(c, !1), t.forOf("v", s, (f) => t.if((0, zn._)`${u()}(${n}, ${f})`, () => t.assign(c, !0).break()));
    }
    function d(f, g) {
      const v = r[g];
      return typeof v == "object" && v !== null ? (0, zn._)`${u()}(${n}, ${f}[${g}])` : (0, zn._)`${n} === ${v}`;
    }
  }
};
Ai.default = Mv;
Object.defineProperty(rr, "__esModule", { value: !0 });
const qv = bi, Bv = $i, Vv = wi, Hv = Ei, Gv = Si, Kv = Ri, Wv = Pi, Xv = Oi, Jv = Ti, Yv = Ai, Qv = [
  // number
  qv.default,
  Bv.default,
  // string
  Vv.default,
  Hv.default,
  // object
  Gv.default,
  Kv.default,
  // array
  Wv.default,
  Xv.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Jv.default,
  Yv.default
];
rr.default = Qv;
var sr = {}, bn = {};
Object.defineProperty(bn, "__esModule", { value: !0 });
bn.validateAdditionalItems = void 0;
const jt = K, Is = L, Zv = {
  message: ({ params: { len: e } }) => (0, jt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, jt._)`{limit: ${e}}`
}, ey = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Zv,
  code(e) {
    const { parentSchema: t, it: n } = e, { items: a } = t;
    if (!Array.isArray(a)) {
      (0, Is.checkStrictMode)(n, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    tp(e, a);
  }
};
function tp(e, t) {
  const { gen: n, schema: a, data: r, keyword: s, it: i } = e;
  i.items = !0;
  const o = n.const("len", (0, jt._)`${r}.length`);
  if (a === !1)
    e.setParams({ len: t.length }), e.pass((0, jt._)`${o} <= ${t.length}`);
  else if (typeof a == "object" && !(0, Is.alwaysValidSchema)(i, a)) {
    const u = n.var("valid", (0, jt._)`${o} <= ${t.length}`);
    n.if((0, jt.not)(u), () => l(u)), e.ok(u);
  }
  function l(u) {
    n.forRange("i", t.length, o, (c) => {
      e.subschema({ keyword: s, dataProp: c, dataPropType: Is.Type.Num }, u), i.allErrors || n.if((0, jt.not)(u), () => n.break());
    });
  }
}
bn.validateAdditionalItems = tp;
bn.default = ey;
var ji = {}, $n = {};
Object.defineProperty($n, "__esModule", { value: !0 });
$n.validateTuple = void 0;
const tc = K, Na = L, ty = Z, ny = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: n } = e;
    if (Array.isArray(t))
      return np(e, "additionalItems", t);
    n.items = !0, !(0, Na.alwaysValidSchema)(n, t) && e.ok((0, ty.validateArray)(e));
  }
};
function np(e, t, n = e.schema) {
  const { gen: a, parentSchema: r, data: s, keyword: i, it: o } = e;
  c(r), o.opts.unevaluated && n.length && o.items !== !0 && (o.items = Na.mergeEvaluated.items(a, n.length, o.items));
  const l = a.name("valid"), u = a.const("len", (0, tc._)`${s}.length`);
  n.forEach((p, d) => {
    (0, Na.alwaysValidSchema)(o, p) || (a.if((0, tc._)`${u} > ${d}`, () => e.subschema({
      keyword: i,
      schemaProp: d,
      dataProp: d
    }, l)), e.ok(l));
  });
  function c(p) {
    const { opts: d, errSchemaPath: f } = o, g = n.length, v = g === p.minItems && (g === p.maxItems || p[t] === !1);
    if (d.strictTuples && !v) {
      const y = `"${i}" is ${g}-tuple, but minItems or maxItems/${t} are not specified or different at path "${f}"`;
      (0, Na.checkStrictMode)(o, y, d.strictTuples);
    }
  }
}
$n.validateTuple = np;
$n.default = ny;
Object.defineProperty(ji, "__esModule", { value: !0 });
const ay = $n, ry = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, ay.validateTuple)(e, "items")
};
ji.default = ry;
var ki = {};
Object.defineProperty(ki, "__esModule", { value: !0 });
const nc = K, sy = L, iy = Z, oy = bn, cy = {
  message: ({ params: { len: e } }) => (0, nc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, nc._)`{limit: ${e}}`
}, ly = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: cy,
  code(e) {
    const { schema: t, parentSchema: n, it: a } = e, { prefixItems: r } = n;
    a.items = !0, !(0, sy.alwaysValidSchema)(a, t) && (r ? (0, oy.validateAdditionalItems)(e, r) : e.ok((0, iy.validateArray)(e)));
  }
};
ki.default = ly;
var Ni = {};
Object.defineProperty(Ni, "__esModule", { value: !0 });
const Be = K, fa = L, uy = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Be.str)`must contain at least ${e} valid item(s)` : (0, Be.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Be._)`{minContains: ${e}}` : (0, Be._)`{minContains: ${e}, maxContains: ${t}}`
}, py = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: uy,
  code(e) {
    const { gen: t, schema: n, parentSchema: a, data: r, it: s } = e;
    let i, o;
    const { minContains: l, maxContains: u } = a;
    s.opts.next ? (i = l === void 0 ? 1 : l, o = u) : i = 1;
    const c = t.const("len", (0, Be._)`${r}.length`);
    if (e.setParams({ min: i, max: o }), o === void 0 && i === 0) {
      (0, fa.checkStrictMode)(s, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && i > o) {
      (0, fa.checkStrictMode)(s, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, fa.alwaysValidSchema)(s, n)) {
      let v = (0, Be._)`${c} >= ${i}`;
      o !== void 0 && (v = (0, Be._)`${v} && ${c} <= ${o}`), e.pass(v);
      return;
    }
    s.items = !0;
    const p = t.name("valid");
    o === void 0 && i === 1 ? f(p, () => t.if(p, () => t.break())) : i === 0 ? (t.let(p, !0), o !== void 0 && t.if((0, Be._)`${r}.length > 0`, d)) : (t.let(p, !1), d()), e.result(p, () => e.reset());
    function d() {
      const v = t.name("_valid"), y = t.let("count", 0);
      f(v, () => t.if(v, () => g(y)));
    }
    function f(v, y) {
      t.forRange("i", 0, c, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: fa.Type.Num,
          compositeRule: !0
        }, v), y();
      });
    }
    function g(v) {
      t.code((0, Be._)`${v}++`), o === void 0 ? t.if((0, Be._)`${v} >= ${i}`, () => t.assign(p, !0).break()) : (t.if((0, Be._)`${v} > ${o}`, () => t.assign(p, !1).break()), i === 1 ? t.assign(p, !0) : t.if((0, Be._)`${v} >= ${i}`, () => t.assign(p, !0)));
    }
  }
};
Ni.default = py;
var ir = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = K, n = L, a = Z;
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
  const r = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(l) {
      const [u, c] = s(l);
      i(l, u), o(l, c);
    }
  };
  function s({ schema: l }) {
    const u = {}, c = {};
    for (const p in l) {
      if (p === "__proto__")
        continue;
      const d = Array.isArray(l[p]) ? u : c;
      d[p] = l[p];
    }
    return [u, c];
  }
  function i(l, u = l.schema) {
    const { gen: c, data: p, it: d } = l;
    if (Object.keys(u).length === 0)
      return;
    const f = c.let("missing");
    for (const g in u) {
      const v = u[g];
      if (v.length === 0)
        continue;
      const y = (0, a.propertyInData)(c, p, g, d.opts.ownProperties);
      l.setParams({
        property: g,
        depsCount: v.length,
        deps: v.join(", ")
      }), d.allErrors ? c.if(y, () => {
        for (const m of v)
          (0, a.checkReportMissingProp)(l, m);
      }) : (c.if((0, t._)`${y} && (${(0, a.checkMissingProp)(l, v, f)})`), (0, a.reportMissingProp)(l, f), c.else());
    }
  }
  e.validatePropertyDeps = i;
  function o(l, u = l.schema) {
    const { gen: c, data: p, keyword: d, it: f } = l, g = c.name("valid");
    for (const v in u)
      (0, n.alwaysValidSchema)(f, u[v]) || (c.if(
        (0, a.propertyInData)(c, p, v, f.opts.ownProperties),
        () => {
          const y = l.subschema({ keyword: d, schemaProp: v }, g);
          l.mergeValidEvaluated(y, g);
        },
        () => c.var(g, !0)
        // TODO var
      ), l.ok(g));
  }
  e.validateSchemaDeps = o, e.default = r;
})(ir);
var Ii = {};
Object.defineProperty(Ii, "__esModule", { value: !0 });
const ap = K, dy = L, fy = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, ap._)`{propertyName: ${e.propertyName}}`
}, my = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: fy,
  code(e) {
    const { gen: t, schema: n, data: a, it: r } = e;
    if ((0, dy.alwaysValidSchema)(r, n))
      return;
    const s = t.name("valid");
    t.forIn("key", a, (i) => {
      e.setParams({ propertyName: i }), e.subschema({
        keyword: "propertyNames",
        data: i,
        dataTypes: ["string"],
        propertyName: i,
        compositeRule: !0
      }, s), t.if((0, ap.not)(s), () => {
        e.error(!0), r.allErrors || t.break();
      });
    }), e.ok(s);
  }
};
Ii.default = my;
var or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
const ma = Z, Ke = K, hy = ze, ha = L, vy = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ke._)`{additionalProperty: ${e.additionalProperty}}`
}, yy = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: vy,
  code(e) {
    const { gen: t, schema: n, parentSchema: a, data: r, errsCount: s, it: i } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: l } = i;
    if (i.props = !0, l.removeAdditional !== "all" && (0, ha.alwaysValidSchema)(i, n))
      return;
    const u = (0, ma.allSchemaProperties)(a.properties), c = (0, ma.allSchemaProperties)(a.patternProperties);
    p(), e.ok((0, Ke._)`${s} === ${hy.default.errors}`);
    function p() {
      t.forIn("key", r, (y) => {
        !u.length && !c.length ? g(y) : t.if(d(y), () => g(y));
      });
    }
    function d(y) {
      let m;
      if (u.length > 8) {
        const $ = (0, ha.schemaRefOrVal)(i, a.properties, "properties");
        m = (0, ma.isOwnProperty)(t, $, y);
      } else u.length ? m = (0, Ke.or)(...u.map(($) => (0, Ke._)`${y} === ${$}`)) : m = Ke.nil;
      return c.length && (m = (0, Ke.or)(m, ...c.map(($) => (0, Ke._)`${(0, ma.usePattern)(e, $)}.test(${y})`))), (0, Ke.not)(m);
    }
    function f(y) {
      t.code((0, Ke._)`delete ${r}[${y}]`);
    }
    function g(y) {
      if (l.removeAdditional === "all" || l.removeAdditional && n === !1) {
        f(y);
        return;
      }
      if (n === !1) {
        e.setParams({ additionalProperty: y }), e.error(), o || t.break();
        return;
      }
      if (typeof n == "object" && !(0, ha.alwaysValidSchema)(i, n)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (v(y, m, !1), t.if((0, Ke.not)(m), () => {
          e.reset(), f(y);
        })) : (v(y, m), o || t.if((0, Ke.not)(m), () => t.break()));
      }
    }
    function v(y, m, $) {
      const S = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: ha.Type.Str
      };
      $ === !1 && Object.assign(S, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(S, m);
    }
  }
};
or.default = yy;
var Ci = {};
Object.defineProperty(Ci, "__esModule", { value: !0 });
const gy = Ve, ac = Z, qr = L, rc = or, xy = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: n, parentSchema: a, data: r, it: s } = e;
    s.opts.removeAdditional === "all" && a.additionalProperties === void 0 && rc.default.code(new gy.KeywordCxt(s, rc.default, "additionalProperties"));
    const i = (0, ac.allSchemaProperties)(n);
    for (const p of i)
      s.definedProperties.add(p);
    s.opts.unevaluated && i.length && s.props !== !0 && (s.props = qr.mergeEvaluated.props(t, (0, qr.toHash)(i), s.props));
    const o = i.filter((p) => !(0, qr.alwaysValidSchema)(s, n[p]));
    if (o.length === 0)
      return;
    const l = t.name("valid");
    for (const p of o)
      u(p) ? c(p) : (t.if((0, ac.propertyInData)(t, r, p, s.opts.ownProperties)), c(p), s.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(p), e.ok(l);
    function u(p) {
      return s.opts.useDefaults && !s.compositeRule && n[p].default !== void 0;
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
Ci.default = xy;
var Li = {};
Object.defineProperty(Li, "__esModule", { value: !0 });
const sc = Z, va = K, ic = L, oc = L, by = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: n, data: a, parentSchema: r, it: s } = e, { opts: i } = s, o = (0, sc.allSchemaProperties)(n), l = o.filter((v) => (0, ic.alwaysValidSchema)(s, n[v]));
    if (o.length === 0 || l.length === o.length && (!s.opts.unevaluated || s.props === !0))
      return;
    const u = i.strictSchema && !i.allowMatchingProperties && r.properties, c = t.name("valid");
    s.props !== !0 && !(s.props instanceof va.Name) && (s.props = (0, oc.evaluatedPropsToName)(t, s.props));
    const { props: p } = s;
    d();
    function d() {
      for (const v of o)
        u && f(v), s.allErrors ? g(v) : (t.var(c, !0), g(v), t.if(c));
    }
    function f(v) {
      for (const y in u)
        new RegExp(v).test(y) && (0, ic.checkStrictMode)(s, `property ${y} matches pattern ${v} (use allowMatchingProperties)`);
    }
    function g(v) {
      t.forIn("key", a, (y) => {
        t.if((0, va._)`${(0, sc.usePattern)(e, v)}.test(${y})`, () => {
          const m = l.includes(v);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: v,
            dataProp: y,
            dataPropType: oc.Type.Str
          }, c), s.opts.unevaluated && p !== !0 ? t.assign((0, va._)`${p}[${y}]`, !0) : !m && !s.allErrors && t.if((0, va.not)(c), () => t.break());
        });
      });
    }
  }
};
Li.default = by;
var Di = {};
Object.defineProperty(Di, "__esModule", { value: !0 });
const $y = L, wy = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: n, it: a } = e;
    if ((0, $y.alwaysValidSchema)(a, n)) {
      e.fail();
      return;
    }
    const r = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, r), e.failResult(r, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
Di.default = wy;
var Fi = {};
Object.defineProperty(Fi, "__esModule", { value: !0 });
const _y = Z, Ey = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: _y.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Fi.default = Ey;
var Ui = {};
Object.defineProperty(Ui, "__esModule", { value: !0 });
const Ia = K, Sy = L, Ry = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Ia._)`{passingSchemas: ${e.passing}}`
}, Py = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Ry,
  code(e) {
    const { gen: t, schema: n, parentSchema: a, it: r } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    if (r.opts.discriminator && a.discriminator)
      return;
    const s = n, i = t.let("valid", !1), o = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: o }), t.block(u), e.result(i, () => e.reset(), () => e.error(!0));
    function u() {
      s.forEach((c, p) => {
        let d;
        (0, Sy.alwaysValidSchema)(r, c) ? t.var(l, !0) : d = e.subschema({
          keyword: "oneOf",
          schemaProp: p,
          compositeRule: !0
        }, l), p > 0 && t.if((0, Ia._)`${l} && ${i}`).assign(i, !1).assign(o, (0, Ia._)`[${o}, ${p}]`).else(), t.if(l, () => {
          t.assign(i, !0), t.assign(o, p), d && e.mergeEvaluated(d, Ia.Name);
        });
      });
    }
  }
};
Ui.default = Py;
var zi = {};
Object.defineProperty(zi, "__esModule", { value: !0 });
const Oy = L, Ty = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: n, it: a } = e;
    if (!Array.isArray(n))
      throw new Error("ajv implementation error");
    const r = t.name("valid");
    n.forEach((s, i) => {
      if ((0, Oy.alwaysValidSchema)(a, s))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: i }, r);
      e.ok(r), e.mergeEvaluated(o);
    });
  }
};
zi.default = Ty;
var Mi = {};
Object.defineProperty(Mi, "__esModule", { value: !0 });
const Ha = K, rp = L, Ay = {
  message: ({ params: e }) => (0, Ha.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Ha._)`{failingKeyword: ${e.ifClause}}`
}, jy = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Ay,
  code(e) {
    const { gen: t, parentSchema: n, it: a } = e;
    n.then === void 0 && n.else === void 0 && (0, rp.checkStrictMode)(a, '"if" without "then" and "else" is ignored');
    const r = cc(a, "then"), s = cc(a, "else");
    if (!r && !s)
      return;
    const i = t.let("valid", !0), o = t.name("_valid");
    if (l(), e.reset(), r && s) {
      const c = t.let("ifClause");
      e.setParams({ ifClause: c }), t.if(o, u("then", c), u("else", c));
    } else r ? t.if(o, u("then")) : t.if((0, Ha.not)(o), u("else"));
    e.pass(i, () => e.error(!0));
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
        const d = e.subschema({ keyword: c }, o);
        t.assign(i, o), e.mergeValidEvaluated(d, i), p ? t.assign(p, (0, Ha._)`${c}`) : e.setParams({ ifClause: c });
      };
    }
  }
};
function cc(e, t) {
  const n = e.schema[t];
  return n !== void 0 && !(0, rp.alwaysValidSchema)(e, n);
}
Mi.default = jy;
var qi = {};
Object.defineProperty(qi, "__esModule", { value: !0 });
const ky = L, Ny = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: n }) {
    t.if === void 0 && (0, ky.checkStrictMode)(n, `"${e}" without "if" is ignored`);
  }
};
qi.default = Ny;
Object.defineProperty(sr, "__esModule", { value: !0 });
const Iy = bn, Cy = ji, Ly = $n, Dy = ki, Fy = Ni, Uy = ir, zy = Ii, My = or, qy = Ci, By = Li, Vy = Di, Hy = Fi, Gy = Ui, Ky = zi, Wy = Mi, Xy = qi;
function Jy(e = !1) {
  const t = [
    // any
    Vy.default,
    Hy.default,
    Gy.default,
    Ky.default,
    Wy.default,
    Xy.default,
    // object
    zy.default,
    My.default,
    Uy.default,
    qy.default,
    By.default
  ];
  return e ? t.push(Cy.default, Dy.default) : t.push(Iy.default, Ly.default), t.push(Fy.default), t;
}
sr.default = Jy;
var Bi = {}, wn = {};
Object.defineProperty(wn, "__esModule", { value: !0 });
wn.dynamicAnchor = void 0;
const Br = K, Yy = ze, lc = Ne, Qy = dt, Zy = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => sp(e, e.schema)
};
function sp(e, t) {
  const { gen: n, it: a } = e;
  a.schemaEnv.root.dynamicAnchors[t] = !0;
  const r = (0, Br._)`${Yy.default.dynamicAnchors}${(0, Br.getProperty)(t)}`, s = a.errSchemaPath === "#" ? a.validateName : eg(e);
  n.if((0, Br._)`!${r}`, () => n.assign(r, s));
}
wn.dynamicAnchor = sp;
function eg(e) {
  const { schemaEnv: t, schema: n, self: a } = e.it, { root: r, baseId: s, localRefs: i, meta: o } = t.root, { schemaId: l } = a.opts, u = new lc.SchemaEnv({ schema: n, schemaId: l, root: r, baseId: s, localRefs: i, meta: o });
  return lc.compileSchema.call(a, u), (0, Qy.getValidate)(e, u);
}
wn.default = Zy;
var _n = {};
Object.defineProperty(_n, "__esModule", { value: !0 });
_n.dynamicRef = void 0;
const uc = K, tg = ze, pc = dt, ng = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => ip(e, e.schema)
};
function ip(e, t) {
  const { gen: n, keyword: a, it: r } = e;
  if (t[0] !== "#")
    throw new Error(`"${a}" only supports hash fragment reference`);
  const s = t.slice(1);
  if (r.allErrors)
    i();
  else {
    const l = n.let("valid", !1);
    i(l), e.ok(l);
  }
  function i(l) {
    if (r.schemaEnv.root.dynamicAnchors[s]) {
      const u = n.let("_v", (0, uc._)`${tg.default.dynamicAnchors}${(0, uc.getProperty)(s)}`);
      n.if(u, o(u, l), o(r.validateName, l));
    } else
      o(r.validateName, l)();
  }
  function o(l, u) {
    return u ? () => n.block(() => {
      (0, pc.callRef)(e, l), n.let(u, !0);
    }) : () => (0, pc.callRef)(e, l);
  }
}
_n.dynamicRef = ip;
_n.default = ng;
var Vi = {};
Object.defineProperty(Vi, "__esModule", { value: !0 });
const ag = wn, rg = L, sg = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, ag.dynamicAnchor)(e, "") : (0, rg.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Vi.default = sg;
var Hi = {};
Object.defineProperty(Hi, "__esModule", { value: !0 });
const ig = _n, og = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, ig.dynamicRef)(e, e.schema)
};
Hi.default = og;
Object.defineProperty(Bi, "__esModule", { value: !0 });
const cg = wn, lg = _n, ug = Vi, pg = Hi, dg = [cg.default, lg.default, ug.default, pg.default];
Bi.default = dg;
var Gi = {}, Ki = {};
Object.defineProperty(Ki, "__esModule", { value: !0 });
const dc = ir, fg = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: dc.error,
  code: (e) => (0, dc.validatePropertyDeps)(e)
};
Ki.default = fg;
var Wi = {};
Object.defineProperty(Wi, "__esModule", { value: !0 });
const mg = ir, hg = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, mg.validateSchemaDeps)(e)
};
Wi.default = hg;
var Xi = {};
Object.defineProperty(Xi, "__esModule", { value: !0 });
const vg = L, yg = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: n }) {
    t.contains === void 0 && (0, vg.checkStrictMode)(n, `"${e}" without "contains" is ignored`);
  }
};
Xi.default = yg;
Object.defineProperty(Gi, "__esModule", { value: !0 });
const gg = Ki, xg = Wi, bg = Xi, $g = [gg.default, xg.default, bg.default];
Gi.default = $g;
var Ji = {}, Yi = {};
Object.defineProperty(Yi, "__esModule", { value: !0 });
const gt = K, fc = L, wg = ze, _g = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, gt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Eg = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: _g,
  code(e) {
    const { gen: t, schema: n, data: a, errsCount: r, it: s } = e;
    if (!r)
      throw new Error("ajv implementation error");
    const { allErrors: i, props: o } = s;
    o instanceof gt.Name ? t.if((0, gt._)`${o} !== true`, () => t.forIn("key", a, (p) => t.if(u(o, p), () => l(p)))) : o !== !0 && t.forIn("key", a, (p) => o === void 0 ? l(p) : t.if(c(o, p), () => l(p))), s.props = !0, e.ok((0, gt._)`${r} === ${wg.default.errors}`);
    function l(p) {
      if (n === !1) {
        e.setParams({ unevaluatedProperty: p }), e.error(), i || t.break();
        return;
      }
      if (!(0, fc.alwaysValidSchema)(s, n)) {
        const d = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: p,
          dataPropType: fc.Type.Str
        }, d), i || t.if((0, gt.not)(d), () => t.break());
      }
    }
    function u(p, d) {
      return (0, gt._)`!${p} || !${p}[${d}]`;
    }
    function c(p, d) {
      const f = [];
      for (const g in p)
        p[g] === !0 && f.push((0, gt._)`${d} !== ${g}`);
      return (0, gt.and)(...f);
    }
  }
};
Yi.default = Eg;
var Qi = {};
Object.defineProperty(Qi, "__esModule", { value: !0 });
const kt = K, mc = L, Sg = {
  message: ({ params: { len: e } }) => (0, kt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, kt._)`{limit: ${e}}`
}, Rg = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Sg,
  code(e) {
    const { gen: t, schema: n, data: a, it: r } = e, s = r.items || 0;
    if (s === !0)
      return;
    const i = t.const("len", (0, kt._)`${a}.length`);
    if (n === !1)
      e.setParams({ len: s }), e.fail((0, kt._)`${i} > ${s}`);
    else if (typeof n == "object" && !(0, mc.alwaysValidSchema)(r, n)) {
      const l = t.var("valid", (0, kt._)`${i} <= ${s}`);
      t.if((0, kt.not)(l), () => o(l, s)), e.ok(l);
    }
    r.items = !0;
    function o(l, u) {
      t.forRange("i", u, i, (c) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: c, dataPropType: mc.Type.Num }, l), r.allErrors || t.if((0, kt.not)(l), () => t.break());
      });
    }
  }
};
Qi.default = Rg;
Object.defineProperty(Ji, "__esModule", { value: !0 });
const Pg = Yi, Og = Qi, Tg = [Pg.default, Og.default];
Ji.default = Tg;
var cr = {}, Zi = {};
Object.defineProperty(Zi, "__esModule", { value: !0 });
const ve = K, Ag = {
  message: ({ schemaCode: e }) => (0, ve.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, ve._)`{format: ${e}}`
}, jg = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Ag,
  code(e, t) {
    const { gen: n, data: a, $data: r, schema: s, schemaCode: i, it: o } = e, { opts: l, errSchemaPath: u, schemaEnv: c, self: p } = o;
    if (!l.validateFormats)
      return;
    r ? d() : f();
    function d() {
      const g = n.scopeValue("formats", {
        ref: p.formats,
        code: l.code.formats
      }), v = n.const("fDef", (0, ve._)`${g}[${i}]`), y = n.let("fType"), m = n.let("format");
      n.if((0, ve._)`typeof ${v} == "object" && !(${v} instanceof RegExp)`, () => n.assign(y, (0, ve._)`${v}.type || "string"`).assign(m, (0, ve._)`${v}.validate`), () => n.assign(y, (0, ve._)`"string"`).assign(m, v)), e.fail$data((0, ve.or)($(), S()));
      function $() {
        return l.strictSchema === !1 ? ve.nil : (0, ve._)`${i} && !${m}`;
      }
      function S() {
        const T = c.$async ? (0, ve._)`(${v}.async ? await ${m}(${a}) : ${m}(${a}))` : (0, ve._)`${m}(${a})`, I = (0, ve._)`(typeof ${m} == "function" ? ${T} : ${m}.test(${a}))`;
        return (0, ve._)`${m} && ${m} !== true && ${y} === ${t} && !${I}`;
      }
    }
    function f() {
      const g = p.formats[s];
      if (!g) {
        $();
        return;
      }
      if (g === !0)
        return;
      const [v, y, m] = S(g);
      v === t && e.pass(T());
      function $() {
        if (l.strictSchema === !1) {
          p.logger.warn(I());
          return;
        }
        throw new Error(I());
        function I() {
          return `unknown format "${s}" ignored in schema at path "${u}"`;
        }
      }
      function S(I) {
        const W = I instanceof RegExp ? (0, ve.regexpCode)(I) : l.code.formats ? (0, ve._)`${l.code.formats}${(0, ve.getProperty)(s)}` : void 0, ne = n.scopeValue("formats", { key: s, ref: I, code: W });
        return typeof I == "object" && !(I instanceof RegExp) ? [I.type || "string", I.validate, (0, ve._)`${ne}.validate`] : ["string", I, ne];
      }
      function T() {
        if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
          if (!c.$async)
            throw new Error("async format in sync schema");
          return (0, ve._)`await ${m}(${a})`;
        }
        return typeof y == "function" ? (0, ve._)`${m}(${a})` : (0, ve._)`${m}.test(${a})`;
      }
    }
  }
};
Zi.default = jg;
Object.defineProperty(cr, "__esModule", { value: !0 });
const kg = Zi, Ng = [kg.default];
cr.default = Ng;
var Vt = {};
Object.defineProperty(Vt, "__esModule", { value: !0 });
Vt.contentVocabulary = Vt.metadataVocabulary = void 0;
Vt.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Vt.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(gi, "__esModule", { value: !0 });
const Ig = ar, Cg = rr, Lg = sr, Dg = Bi, Fg = Gi, Ug = Ji, zg = cr, hc = Vt, Mg = [
  Dg.default,
  Ig.default,
  Cg.default,
  (0, Lg.default)(!0),
  zg.default,
  hc.metadataVocabulary,
  hc.contentVocabulary,
  Fg.default,
  Ug.default
];
gi.default = Mg;
var lr = {}, ur = {};
Object.defineProperty(ur, "__esModule", { value: !0 });
ur.DiscrError = void 0;
var vc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(vc || (ur.DiscrError = vc = {}));
Object.defineProperty(lr, "__esModule", { value: !0 });
const an = K, Cs = ur, yc = Ne, qg = Xt, Bg = L, Vg = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Cs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: n } }) => (0, an._)`{error: ${e}, tag: ${n}, tagValue: ${t}}`
}, Hg = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Vg,
  code(e) {
    const { gen: t, data: n, schema: a, parentSchema: r, it: s } = e, { oneOf: i } = r;
    if (!s.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = a.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (a.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!i)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), u = t.const("tag", (0, an._)`${n}${(0, an.getProperty)(o)}`);
    t.if((0, an._)`typeof ${u} == "string"`, () => c(), () => e.error(!1, { discrError: Cs.DiscrError.Tag, tag: u, tagName: o })), e.ok(l);
    function c() {
      const f = d();
      t.if(!1);
      for (const g in f)
        t.elseIf((0, an._)`${u} === ${g}`), t.assign(l, p(f[g]));
      t.else(), e.error(!1, { discrError: Cs.DiscrError.Mapping, tag: u, tagName: o }), t.endIf();
    }
    function p(f) {
      const g = t.name("valid"), v = e.subschema({ keyword: "oneOf", schemaProp: f }, g);
      return e.mergeEvaluated(v, an.Name), g;
    }
    function d() {
      var f;
      const g = {}, v = m(r);
      let y = !0;
      for (let T = 0; T < i.length; T++) {
        let I = i[T];
        if (I != null && I.$ref && !(0, Bg.schemaHasRulesButRef)(I, s.self.RULES)) {
          const ne = I.$ref;
          if (I = yc.resolveRef.call(s.self, s.schemaEnv.root, s.baseId, ne), I instanceof yc.SchemaEnv && (I = I.schema), I === void 0)
            throw new qg.default(s.opts.uriResolver, s.baseId, ne);
        }
        const W = (f = I == null ? void 0 : I.properties) === null || f === void 0 ? void 0 : f[o];
        if (typeof W != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        y = y && (v || m(I)), $(W, T);
      }
      if (!y)
        throw new Error(`discriminator: "${o}" must be required`);
      return g;
      function m({ required: T }) {
        return Array.isArray(T) && T.includes(o);
      }
      function $(T, I) {
        if (T.const)
          S(T.const, I);
        else if (T.enum)
          for (const W of T.enum)
            S(W, I);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function S(T, I) {
        if (typeof T != "string" || T in g)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        g[T] = I;
      }
    }
  }
};
lr.default = Hg;
var eo = {};
const Gg = "https://json-schema.org/draft/2020-12/schema", Kg = "https://json-schema.org/draft/2020-12/schema", Wg = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Xg = "meta", Jg = "Core and Validation specifications meta-schema", Yg = [
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
], Qg = [
  "object",
  "boolean"
], Zg = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", ex = {
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
}, tx = {
  $schema: Gg,
  $id: Kg,
  $vocabulary: Wg,
  $dynamicAnchor: Xg,
  title: Jg,
  allOf: Yg,
  type: Qg,
  $comment: Zg,
  properties: ex
}, nx = "https://json-schema.org/draft/2020-12/schema", ax = "https://json-schema.org/draft/2020-12/meta/applicator", rx = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, sx = "meta", ix = "Applicator vocabulary meta-schema", ox = [
  "object",
  "boolean"
], cx = {
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
}, lx = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, ux = {
  $schema: nx,
  $id: ax,
  $vocabulary: rx,
  $dynamicAnchor: sx,
  title: ix,
  type: ox,
  properties: cx,
  $defs: lx
}, px = "https://json-schema.org/draft/2020-12/schema", dx = "https://json-schema.org/draft/2020-12/meta/unevaluated", fx = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, mx = "meta", hx = "Unevaluated applicator vocabulary meta-schema", vx = [
  "object",
  "boolean"
], yx = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, gx = {
  $schema: px,
  $id: dx,
  $vocabulary: fx,
  $dynamicAnchor: mx,
  title: hx,
  type: vx,
  properties: yx
}, xx = "https://json-schema.org/draft/2020-12/schema", bx = "https://json-schema.org/draft/2020-12/meta/content", $x = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, wx = "meta", _x = "Content vocabulary meta-schema", Ex = [
  "object",
  "boolean"
], Sx = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Rx = {
  $schema: xx,
  $id: bx,
  $vocabulary: $x,
  $dynamicAnchor: wx,
  title: _x,
  type: Ex,
  properties: Sx
}, Px = "https://json-schema.org/draft/2020-12/schema", Ox = "https://json-schema.org/draft/2020-12/meta/core", Tx = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Ax = "meta", jx = "Core vocabulary meta-schema", kx = [
  "object",
  "boolean"
], Nx = {
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
}, Ix = {
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
}, Cx = {
  $schema: Px,
  $id: Ox,
  $vocabulary: Tx,
  $dynamicAnchor: Ax,
  title: jx,
  type: kx,
  properties: Nx,
  $defs: Ix
}, Lx = "https://json-schema.org/draft/2020-12/schema", Dx = "https://json-schema.org/draft/2020-12/meta/format-annotation", Fx = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Ux = "meta", zx = "Format vocabulary meta-schema for annotation results", Mx = [
  "object",
  "boolean"
], qx = {
  format: {
    type: "string"
  }
}, Bx = {
  $schema: Lx,
  $id: Dx,
  $vocabulary: Fx,
  $dynamicAnchor: Ux,
  title: zx,
  type: Mx,
  properties: qx
}, Vx = "https://json-schema.org/draft/2020-12/schema", Hx = "https://json-schema.org/draft/2020-12/meta/meta-data", Gx = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, Kx = "meta", Wx = "Meta-data vocabulary meta-schema", Xx = [
  "object",
  "boolean"
], Jx = {
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
}, Yx = {
  $schema: Vx,
  $id: Hx,
  $vocabulary: Gx,
  $dynamicAnchor: Kx,
  title: Wx,
  type: Xx,
  properties: Jx
}, Qx = "https://json-schema.org/draft/2020-12/schema", Zx = "https://json-schema.org/draft/2020-12/meta/validation", eb = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, tb = "meta", nb = "Validation vocabulary meta-schema", ab = [
  "object",
  "boolean"
], rb = {
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
}, sb = {
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
}, ib = {
  $schema: Qx,
  $id: Zx,
  $vocabulary: eb,
  $dynamicAnchor: tb,
  title: nb,
  type: ab,
  properties: rb,
  $defs: sb
};
Object.defineProperty(eo, "__esModule", { value: !0 });
const ob = tx, cb = ux, lb = gx, ub = Rx, pb = Cx, db = Bx, fb = Yx, mb = ib, hb = ["/properties"];
function vb(e) {
  return [
    ob,
    cb,
    lb,
    ub,
    pb,
    t(this, db),
    fb,
    t(this, mb)
  ].forEach((n) => this.addMetaSchema(n, void 0, !1)), this;
  function t(n, a) {
    return e ? n.$dataMetaSchema(a, hb) : a;
  }
}
eo.default = vb;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const n = ai, a = gi, r = lr, s = eo, i = "https://json-schema.org/draft/2020-12/schema";
  class o extends n.default {
    constructor(f = {}) {
      super({
        ...f,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), a.default.forEach((f) => this.addVocabulary(f)), this.opts.discriminator && this.addKeyword(r.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: f, meta: g } = this.opts;
      g && (s.default.call(this, f), this.refs["http://json-schema.org/schema"] = i);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
    }
  }
  t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  var l = Ve;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var u = K;
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
  var c = xn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return c.default;
  } });
  var p = Xt;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return p.default;
  } });
})(Os, Os.exports);
var yb = Os.exports, Ls = { exports: {} }, op = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(U, z) {
    return { validate: U, compare: z };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(s, i),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), u),
    "date-time": t(d(!0), f),
    "iso-time": t(l(), c),
    "iso-date-time": t(d(), g),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
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
    regex: te,
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
    byte: S,
    // signed 32 bit integer
    int32: { type: "number", validate: W },
    // signed 64 bit integer
    int64: { type: "number", validate: ne },
    // C-type float
    float: { type: "number", validate: ce },
    // C-type double
    double: { type: "number", validate: ce },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, u),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, f),
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
  function n(U) {
    return U % 4 === 0 && (U % 100 !== 0 || U % 400 === 0);
  }
  const a = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, r = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function s(U) {
    const z = a.exec(U);
    if (!z)
      return !1;
    const re = +z[1], j = +z[2], k = +z[3];
    return j >= 1 && j <= 12 && k >= 1 && k <= (j === 2 && n(re) ? 29 : r[j]);
  }
  function i(U, z) {
    if (U && z)
      return U > z ? 1 : U < z ? -1 : 0;
  }
  const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(U) {
    return function(re) {
      const j = o.exec(re);
      if (!j)
        return !1;
      const k = +j[1], F = +j[2], D = +j[3], q = j[4], C = j[5] === "-" ? -1 : 1, P = +(j[6] || 0), w = +(j[7] || 0);
      if (P > 23 || w > 59 || U && !q)
        return !1;
      if (k <= 23 && F <= 59 && D < 60)
        return !0;
      const E = F - w * C, _ = k - P * C - (E < 0 ? 1 : 0);
      return (_ === 23 || _ === -1) && (E === 59 || E === -1) && D < 61;
    };
  }
  function u(U, z) {
    if (!(U && z))
      return;
    const re = (/* @__PURE__ */ new Date("2020-01-01T" + U)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf();
    if (re && j)
      return re - j;
  }
  function c(U, z) {
    if (!(U && z))
      return;
    const re = o.exec(U), j = o.exec(z);
    if (re && j)
      return U = re[1] + re[2] + re[3], z = j[1] + j[2] + j[3], U > z ? 1 : U < z ? -1 : 0;
  }
  const p = /t|\s/i;
  function d(U) {
    const z = l(U);
    return function(j) {
      const k = j.split(p);
      return k.length === 2 && s(k[0]) && z(k[1]);
    };
  }
  function f(U, z) {
    if (!(U && z))
      return;
    const re = new Date(U).valueOf(), j = new Date(z).valueOf();
    if (re && j)
      return re - j;
  }
  function g(U, z) {
    if (!(U && z))
      return;
    const [re, j] = U.split(p), [k, F] = z.split(p), D = i(re, k);
    if (D !== void 0)
      return D || u(j, F);
  }
  const v = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(U) {
    return v.test(U) && y.test(U);
  }
  const $ = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function S(U) {
    return $.lastIndex = 0, $.test(U);
  }
  const T = -2147483648, I = 2 ** 31 - 1;
  function W(U) {
    return Number.isInteger(U) && U <= I && U >= T;
  }
  function ne(U) {
    return Number.isInteger(U);
  }
  function ce() {
    return !0;
  }
  const he = /[^\\]\\Z/;
  function te(U) {
    if (he.test(U))
      return !1;
    try {
      return new RegExp(U), !0;
    } catch {
      return !1;
    }
  }
})(op);
var cp = {}, Ds = { exports: {} }, to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const gb = ar, xb = rr, bb = sr, $b = cr, gc = Vt, wb = [
  gb.default,
  xb.default,
  (0, bb.default)(),
  $b.default,
  gc.metadataVocabulary,
  gc.contentVocabulary
];
to.default = wb;
const _b = "http://json-schema.org/draft-07/schema#", Eb = "http://json-schema.org/draft-07/schema#", Sb = "Core schema meta-schema", Rb = {
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
}, Pb = [
  "object",
  "boolean"
], Ob = {
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
}, Tb = {
  $schema: _b,
  $id: Eb,
  title: Sb,
  definitions: Rb,
  type: Pb,
  properties: Ob,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const n = ai, a = to, r = lr, s = Tb, i = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class l extends n.default {
    _addVocabularies() {
      super._addVocabularies(), a.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(r.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const g = this.opts.$data ? this.$dataMetaSchema(s, i) : s;
      this.addMetaSchema(g, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var u = Ve;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return u.KeywordCxt;
  } });
  var c = K;
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
  var p = xn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return p.default;
  } });
  var d = Xt;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return d.default;
  } });
})(Ds, Ds.exports);
var Ab = Ds.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Ab, n = K, a = n.operators, r = {
    formatMaximum: { okStr: "<=", ok: a.LTE, fail: a.GT },
    formatMinimum: { okStr: ">=", ok: a.GTE, fail: a.LT },
    formatExclusiveMaximum: { okStr: "<", ok: a.LT, fail: a.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: a.GT, fail: a.LTE }
  }, s = {
    message: ({ keyword: o, schemaCode: l }) => (0, n.str)`should be ${r[o].okStr} ${l}`,
    params: ({ keyword: o, schemaCode: l }) => (0, n._)`{comparison: ${r[o].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(r),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: s,
    code(o) {
      const { gen: l, data: u, schemaCode: c, keyword: p, it: d } = o, { opts: f, self: g } = d;
      if (!f.validateFormats)
        return;
      const v = new t.KeywordCxt(d, g.RULES.all.format.definition, "format");
      v.$data ? y() : m();
      function y() {
        const S = l.scopeValue("formats", {
          ref: g.formats,
          code: f.code.formats
        }), T = l.const("fmt", (0, n._)`${S}[${v.schemaCode}]`);
        o.fail$data((0, n.or)((0, n._)`typeof ${T} != "object"`, (0, n._)`${T} instanceof RegExp`, (0, n._)`typeof ${T}.compare != "function"`, $(T)));
      }
      function m() {
        const S = v.schema, T = g.formats[S];
        if (!T || T === !0)
          return;
        if (typeof T != "object" || T instanceof RegExp || typeof T.compare != "function")
          throw new Error(`"${p}": format "${S}" does not define "compare" function`);
        const I = l.scopeValue("formats", {
          key: S,
          ref: T,
          code: f.code.formats ? (0, n._)`${f.code.formats}${(0, n.getProperty)(S)}` : void 0
        });
        o.fail$data($(I));
      }
      function $(S) {
        return (0, n._)`${S}.compare(${u}, ${c}) ${r[p].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const i = (o) => (o.addKeyword(e.formatLimitDefinition), o);
  e.default = i;
})(cp);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const n = op, a = cp, r = K, s = new r.Name("fullFormats"), i = new r.Name("fastFormats"), o = (u, c = { keywords: !0 }) => {
    if (Array.isArray(c))
      return l(u, c, n.fullFormats, s), u;
    const [p, d] = c.mode === "fast" ? [n.fastFormats, i] : [n.fullFormats, s], f = c.formats || n.formatNames;
    return l(u, f, p, d), c.keywords && (0, a.default)(u), u;
  };
  o.get = (u, c = "full") => {
    const d = (c === "fast" ? n.fastFormats : n.fullFormats)[u];
    if (!d)
      throw new Error(`Unknown format "${u}"`);
    return d;
  };
  function l(u, c, p, d) {
    var f, g;
    (f = (g = u.opts.code).formats) !== null && f !== void 0 || (g.formats = (0, r._)`require("ajv-formats/dist/formats").${d}`);
    for (const v of c)
      u.addFormat(v, p[v]);
  }
  e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
})(Ls, Ls.exports);
var jb = Ls.exports;
const kb = /* @__PURE__ */ Yn(jb), Nb = (e, t, n, a) => {
  if (n === "length" || n === "prototype" || n === "arguments" || n === "caller")
    return;
  const r = Object.getOwnPropertyDescriptor(e, n), s = Object.getOwnPropertyDescriptor(t, n);
  !Ib(r, s) && a || Object.defineProperty(e, n, s);
}, Ib = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Cb = (e, t) => {
  const n = Object.getPrototypeOf(t);
  n !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, n);
}, Lb = (e, t) => `/* Wrapped ${e}*/
${t}`, Db = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Fb = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Ub = (e, t, n) => {
  const a = n === "" ? "" : `with ${n.trim()}() `, r = Lb.bind(null, a, t.toString());
  Object.defineProperty(r, "name", Fb);
  const { writable: s, enumerable: i, configurable: o } = Db;
  Object.defineProperty(e, "toString", { value: r, writable: s, enumerable: i, configurable: o });
};
function zb(e, t, { ignoreNonConfigurable: n = !1 } = {}) {
  const { name: a } = e;
  for (const r of Reflect.ownKeys(t))
    Nb(e, t, r, n);
  return Cb(e, t), Ub(e, t, a), e;
}
const xc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: n = 0,
    maxWait: a = Number.POSITIVE_INFINITY,
    before: r = !1,
    after: s = !0
  } = t;
  if (n < 0 || a < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!r && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, o, l;
  const u = function(...c) {
    const p = this, d = () => {
      i = void 0, o && (clearTimeout(o), o = void 0), s && (l = e.apply(p, c));
    }, f = () => {
      o = void 0, i && (clearTimeout(i), i = void 0), s && (l = e.apply(p, c));
    }, g = r && !i;
    return clearTimeout(i), i = setTimeout(d, n), a > 0 && a !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(f, a)), g && (l = e.apply(p, c)), l;
  };
  return zb(u, e), u.cancel = () => {
    i && (clearTimeout(i), i = void 0), o && (clearTimeout(o), o = void 0);
  }, u;
};
var Fs = { exports: {} };
const Mb = "2.0.0", lp = 256, qb = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Bb = 16, Vb = lp - 6, Hb = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ea = {
  MAX_LENGTH: lp,
  MAX_SAFE_COMPONENT_LENGTH: Bb,
  MAX_SAFE_BUILD_LENGTH: Vb,
  MAX_SAFE_INTEGER: qb,
  RELEASE_TYPES: Hb,
  SEMVER_SPEC_VERSION: Mb,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Gb = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var pr = Gb;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: a,
    MAX_LENGTH: r
  } = ea, s = pr;
  t = e.exports = {};
  const i = t.re = [], o = t.safeRe = [], l = t.src = [], u = t.safeSrc = [], c = t.t = {};
  let p = 0;
  const d = "[a-zA-Z0-9-]", f = [
    ["\\s", 1],
    ["\\d", r],
    [d, a]
  ], g = (y) => {
    for (const [m, $] of f)
      y = y.split(`${m}*`).join(`${m}{0,${$}}`).split(`${m}+`).join(`${m}{1,${$}}`);
    return y;
  }, v = (y, m, $) => {
    const S = g(m), T = p++;
    s(y, T, m), c[y] = T, l[T] = m, u[T] = S, i[T] = new RegExp(m, $ ? "g" : void 0), o[T] = new RegExp(S, $ ? "g" : void 0);
  };
  v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), v("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${d}+`), v("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), v("FULL", `^${l[c.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), v("LOOSE", `^${l[c.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), v("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${n}})(?:\\.(\\d{1,${n}}))?(?:\\.(\\d{1,${n}}))?`), v("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", l[c.COERCE], !0), v("COERCERTLFULL", l[c.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Fs, Fs.exports);
var ta = Fs.exports;
const Kb = Object.freeze({ loose: !0 }), Wb = Object.freeze({}), Xb = (e) => e ? typeof e != "object" ? Kb : e : Wb;
var no = Xb;
const bc = /^[0-9]+$/, up = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const n = bc.test(e), a = bc.test(t);
  return n && a && (e = +e, t = +t), e === t ? 0 : n && !a ? -1 : a && !n ? 1 : e < t ? -1 : 1;
}, Jb = (e, t) => up(t, e);
var pp = {
  compareIdentifiers: up,
  rcompareIdentifiers: Jb
};
const ya = pr, { MAX_LENGTH: $c, MAX_SAFE_INTEGER: ga } = ea, { safeRe: xa, t: ba } = ta, Yb = no, { compareIdentifiers: Vr } = pp;
let Qb = class et {
  constructor(t, n) {
    if (n = Yb(n), t instanceof et) {
      if (t.loose === !!n.loose && t.includePrerelease === !!n.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > $c)
      throw new TypeError(
        `version is longer than ${$c} characters`
      );
    ya("SemVer", t, n), this.options = n, this.loose = !!n.loose, this.includePrerelease = !!n.includePrerelease;
    const a = t.trim().match(n.loose ? xa[ba.LOOSE] : xa[ba.FULL]);
    if (!a)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +a[1], this.minor = +a[2], this.patch = +a[3], this.major > ga || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > ga || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > ga || this.patch < 0)
      throw new TypeError("Invalid patch version");
    a[4] ? this.prerelease = a[4].split(".").map((r) => {
      if (/^[0-9]+$/.test(r)) {
        const s = +r;
        if (s >= 0 && s < ga)
          return s;
      }
      return r;
    }) : this.prerelease = [], this.build = a[5] ? a[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (ya("SemVer.compare", this.version, this.options, t), !(t instanceof et)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new et(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof et || (t = new et(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof et || (t = new et(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let n = 0;
    do {
      const a = this.prerelease[n], r = t.prerelease[n];
      if (ya("prerelease compare", n, a, r), a === void 0 && r === void 0)
        return 0;
      if (r === void 0)
        return 1;
      if (a === void 0)
        return -1;
      if (a === r)
        continue;
      return Vr(a, r);
    } while (++n);
  }
  compareBuild(t) {
    t instanceof et || (t = new et(t, this.options));
    let n = 0;
    do {
      const a = this.build[n], r = t.build[n];
      if (ya("build compare", n, a, r), a === void 0 && r === void 0)
        return 0;
      if (r === void 0)
        return 1;
      if (a === void 0)
        return -1;
      if (a === r)
        continue;
      return Vr(a, r);
    } while (++n);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, n, a) {
    if (t.startsWith("pre")) {
      if (!n && a === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (n) {
        const r = `-${n}`.match(this.options.loose ? xa[ba.PRERELEASELOOSE] : xa[ba.PRERELEASE]);
        if (!r || r[1] !== n)
          throw new Error(`invalid identifier: ${n}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", n, a);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", n, a);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", n, a), this.inc("pre", n, a);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", n, a), this.inc("pre", n, a);
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
        const r = Number(a) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [r];
        else {
          let s = this.prerelease.length;
          for (; --s >= 0; )
            typeof this.prerelease[s] == "number" && (this.prerelease[s]++, s = -2);
          if (s === -1) {
            if (n === this.prerelease.join(".") && a === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(r);
          }
        }
        if (n) {
          let s = [n, r];
          a === !1 && (s = [n]), Vr(this.prerelease[0], n) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = s) : this.prerelease = s;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var je = Qb;
const wc = je, Zb = (e, t, n = !1) => {
  if (e instanceof wc)
    return e;
  try {
    return new wc(e, t);
  } catch (a) {
    if (!n)
      return null;
    throw a;
  }
};
var Jt = Zb;
const e0 = Jt, t0 = (e, t) => {
  const n = e0(e, t);
  return n ? n.version : null;
};
var n0 = t0;
const a0 = Jt, r0 = (e, t) => {
  const n = a0(e.trim().replace(/^[=v]+/, ""), t);
  return n ? n.version : null;
};
var s0 = r0;
const _c = je, i0 = (e, t, n, a, r) => {
  typeof n == "string" && (r = a, a = n, n = void 0);
  try {
    return new _c(
      e instanceof _c ? e.version : e,
      n
    ).inc(t, a, r).version;
  } catch {
    return null;
  }
};
var o0 = i0;
const Ec = Jt, c0 = (e, t) => {
  const n = Ec(e, null, !0), a = Ec(t, null, !0), r = n.compare(a);
  if (r === 0)
    return null;
  const s = r > 0, i = s ? n : a, o = s ? a : n, l = !!i.prerelease.length;
  if (!!o.prerelease.length && !l) {
    if (!o.patch && !o.minor)
      return "major";
    if (o.compareMain(i) === 0)
      return o.minor && !o.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return n.major !== a.major ? c + "major" : n.minor !== a.minor ? c + "minor" : n.patch !== a.patch ? c + "patch" : "prerelease";
};
var l0 = c0;
const u0 = je, p0 = (e, t) => new u0(e, t).major;
var d0 = p0;
const f0 = je, m0 = (e, t) => new f0(e, t).minor;
var h0 = m0;
const v0 = je, y0 = (e, t) => new v0(e, t).patch;
var g0 = y0;
const x0 = Jt, b0 = (e, t) => {
  const n = x0(e, t);
  return n && n.prerelease.length ? n.prerelease : null;
};
var $0 = b0;
const Sc = je, w0 = (e, t, n) => new Sc(e, n).compare(new Sc(t, n));
var Xe = w0;
const _0 = Xe, E0 = (e, t, n) => _0(t, e, n);
var S0 = E0;
const R0 = Xe, P0 = (e, t) => R0(e, t, !0);
var O0 = P0;
const Rc = je, T0 = (e, t, n) => {
  const a = new Rc(e, n), r = new Rc(t, n);
  return a.compare(r) || a.compareBuild(r);
};
var ao = T0;
const A0 = ao, j0 = (e, t) => e.sort((n, a) => A0(n, a, t));
var k0 = j0;
const N0 = ao, I0 = (e, t) => e.sort((n, a) => N0(a, n, t));
var C0 = I0;
const L0 = Xe, D0 = (e, t, n) => L0(e, t, n) > 0;
var dr = D0;
const F0 = Xe, U0 = (e, t, n) => F0(e, t, n) < 0;
var ro = U0;
const z0 = Xe, M0 = (e, t, n) => z0(e, t, n) === 0;
var dp = M0;
const q0 = Xe, B0 = (e, t, n) => q0(e, t, n) !== 0;
var fp = B0;
const V0 = Xe, H0 = (e, t, n) => V0(e, t, n) >= 0;
var so = H0;
const G0 = Xe, K0 = (e, t, n) => G0(e, t, n) <= 0;
var io = K0;
const W0 = dp, X0 = fp, J0 = dr, Y0 = so, Q0 = ro, Z0 = io, e$ = (e, t, n, a) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e === n;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof n == "object" && (n = n.version), e !== n;
    case "":
    case "=":
    case "==":
      return W0(e, n, a);
    case "!=":
      return X0(e, n, a);
    case ">":
      return J0(e, n, a);
    case ">=":
      return Y0(e, n, a);
    case "<":
      return Q0(e, n, a);
    case "<=":
      return Z0(e, n, a);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var mp = e$;
const t$ = je, n$ = Jt, { safeRe: $a, t: wa } = ta, a$ = (e, t) => {
  if (e instanceof t$)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let n = null;
  if (!t.rtl)
    n = e.match(t.includePrerelease ? $a[wa.COERCEFULL] : $a[wa.COERCE]);
  else {
    const l = t.includePrerelease ? $a[wa.COERCERTLFULL] : $a[wa.COERCERTL];
    let u;
    for (; (u = l.exec(e)) && (!n || n.index + n[0].length !== e.length); )
      (!n || u.index + u[0].length !== n.index + n[0].length) && (n = u), l.lastIndex = u.index + u[1].length + u[2].length;
    l.lastIndex = -1;
  }
  if (n === null)
    return null;
  const a = n[2], r = n[3] || "0", s = n[4] || "0", i = t.includePrerelease && n[5] ? `-${n[5]}` : "", o = t.includePrerelease && n[6] ? `+${n[6]}` : "";
  return n$(`${a}.${r}.${s}${i}${o}`, t);
};
var r$ = a$;
const s$ = Jt, i$ = ea, o$ = je, c$ = (e, t, n) => {
  if (!i$.RELEASE_TYPES.includes(t))
    return null;
  const a = l$(e, n);
  return a && u$(a, t);
}, l$ = (e, t) => {
  const n = e instanceof o$ ? e.version : e;
  return s$(n, t);
}, u$ = (e, t) => {
  if (p$(t))
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
}, p$ = (e) => e.startsWith("pre");
var d$ = c$;
class f$ {
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
        const r = this.map.keys().next().value;
        this.delete(r);
      }
      this.map.set(t, n);
    }
    return this;
  }
}
var m$ = f$, Hr, Pc;
function Je() {
  if (Pc) return Hr;
  Pc = 1;
  const e = /\s+/g;
  class t {
    constructor(k, F) {
      if (F = r(F), k instanceof t)
        return k.loose === !!F.loose && k.includePrerelease === !!F.includePrerelease ? k : new t(k.raw, F);
      if (k instanceof s)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = F, this.loose = !!F.loose, this.includePrerelease = !!F.includePrerelease, this.raw = k.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const D = this.set[0];
        if (this.set = this.set.filter((q) => !v(q[0])), this.set.length === 0)
          this.set = [D];
        else if (this.set.length > 1) {
          for (const q of this.set)
            if (q.length === 1 && y(q[0])) {
              this.set = [q];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let k = 0; k < this.set.length; k++) {
          k > 0 && (this.formatted += "||");
          const F = this.set[k];
          for (let D = 0; D < F.length; D++)
            D > 0 && (this.formatted += " "), this.formatted += F[D].toString().trim();
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
    parseRange(k) {
      const D = ((this.options.includePrerelease && f) | (this.options.loose && g)) + ":" + k, q = a.get(D);
      if (q)
        return q;
      const C = this.options.loose, P = C ? l[u.HYPHENRANGELOOSE] : l[u.HYPHENRANGE];
      k = k.replace(P, z(this.options.includePrerelease)), i("hyphen replace", k), k = k.replace(l[u.COMPARATORTRIM], c), i("comparator trim", k), k = k.replace(l[u.TILDETRIM], p), i("tilde trim", k), k = k.replace(l[u.CARETTRIM], d), i("caret trim", k);
      let w = k.split(" ").map((x) => $(x, this.options)).join(" ").split(/\s+/).map((x) => U(x, this.options));
      C && (w = w.filter((x) => (i("loose invalid filter", x, this.options), !!x.match(l[u.COMPARATORLOOSE])))), i("range list", w);
      const E = /* @__PURE__ */ new Map(), _ = w.map((x) => new s(x, this.options));
      for (const x of _) {
        if (v(x))
          return [x];
        E.set(x.value, x);
      }
      E.size > 1 && E.has("") && E.delete("");
      const h = [...E.values()];
      return a.set(D, h), h;
    }
    intersects(k, F) {
      if (!(k instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, F) && k.set.some((q) => m(q, F) && D.every((C) => q.every((P) => C.intersects(P, F)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(k) {
      if (!k)
        return !1;
      if (typeof k == "string")
        try {
          k = new o(k, this.options);
        } catch {
          return !1;
        }
      for (let F = 0; F < this.set.length; F++)
        if (re(this.set[F], k, this.options))
          return !0;
      return !1;
    }
  }
  Hr = t;
  const n = m$, a = new n(), r = no, s = fr(), i = pr, o = je, {
    safeRe: l,
    t: u,
    comparatorTrimReplace: c,
    tildeTrimReplace: p,
    caretTrimReplace: d
  } = ta, { FLAG_INCLUDE_PRERELEASE: f, FLAG_LOOSE: g } = ea, v = (j) => j.value === "<0.0.0-0", y = (j) => j.value === "", m = (j, k) => {
    let F = !0;
    const D = j.slice();
    let q = D.pop();
    for (; F && D.length; )
      F = D.every((C) => q.intersects(C, k)), q = D.pop();
    return F;
  }, $ = (j, k) => (j = j.replace(l[u.BUILD], ""), i("comp", j, k), j = W(j, k), i("caret", j), j = T(j, k), i("tildes", j), j = ce(j, k), i("xrange", j), j = te(j, k), i("stars", j), j), S = (j) => !j || j.toLowerCase() === "x" || j === "*", T = (j, k) => j.trim().split(/\s+/).map((F) => I(F, k)).join(" "), I = (j, k) => {
    const F = k.loose ? l[u.TILDELOOSE] : l[u.TILDE];
    return j.replace(F, (D, q, C, P, w) => {
      i("tilde", j, D, q, C, P, w);
      let E;
      return S(q) ? E = "" : S(C) ? E = `>=${q}.0.0 <${+q + 1}.0.0-0` : S(P) ? E = `>=${q}.${C}.0 <${q}.${+C + 1}.0-0` : w ? (i("replaceTilde pr", w), E = `>=${q}.${C}.${P}-${w} <${q}.${+C + 1}.0-0`) : E = `>=${q}.${C}.${P} <${q}.${+C + 1}.0-0`, i("tilde return", E), E;
    });
  }, W = (j, k) => j.trim().split(/\s+/).map((F) => ne(F, k)).join(" "), ne = (j, k) => {
    i("caret", j, k);
    const F = k.loose ? l[u.CARETLOOSE] : l[u.CARET], D = k.includePrerelease ? "-0" : "";
    return j.replace(F, (q, C, P, w, E) => {
      i("caret", j, q, C, P, w, E);
      let _;
      return S(C) ? _ = "" : S(P) ? _ = `>=${C}.0.0${D} <${+C + 1}.0.0-0` : S(w) ? C === "0" ? _ = `>=${C}.${P}.0${D} <${C}.${+P + 1}.0-0` : _ = `>=${C}.${P}.0${D} <${+C + 1}.0.0-0` : E ? (i("replaceCaret pr", E), C === "0" ? P === "0" ? _ = `>=${C}.${P}.${w}-${E} <${C}.${P}.${+w + 1}-0` : _ = `>=${C}.${P}.${w}-${E} <${C}.${+P + 1}.0-0` : _ = `>=${C}.${P}.${w}-${E} <${+C + 1}.0.0-0`) : (i("no pr"), C === "0" ? P === "0" ? _ = `>=${C}.${P}.${w}${D} <${C}.${P}.${+w + 1}-0` : _ = `>=${C}.${P}.${w}${D} <${C}.${+P + 1}.0-0` : _ = `>=${C}.${P}.${w} <${+C + 1}.0.0-0`), i("caret return", _), _;
    });
  }, ce = (j, k) => (i("replaceXRanges", j, k), j.split(/\s+/).map((F) => he(F, k)).join(" ")), he = (j, k) => {
    j = j.trim();
    const F = k.loose ? l[u.XRANGELOOSE] : l[u.XRANGE];
    return j.replace(F, (D, q, C, P, w, E) => {
      i("xRange", j, D, q, C, P, w, E);
      const _ = S(C), h = _ || S(P), x = h || S(w), O = x;
      return q === "=" && O && (q = ""), E = k.includePrerelease ? "-0" : "", _ ? q === ">" || q === "<" ? D = "<0.0.0-0" : D = "*" : q && O ? (h && (P = 0), w = 0, q === ">" ? (q = ">=", h ? (C = +C + 1, P = 0, w = 0) : (P = +P + 1, w = 0)) : q === "<=" && (q = "<", h ? C = +C + 1 : P = +P + 1), q === "<" && (E = "-0"), D = `${q + C}.${P}.${w}${E}`) : h ? D = `>=${C}.0.0${E} <${+C + 1}.0.0-0` : x && (D = `>=${C}.${P}.0${E} <${C}.${+P + 1}.0-0`), i("xRange return", D), D;
    });
  }, te = (j, k) => (i("replaceStars", j, k), j.trim().replace(l[u.STAR], "")), U = (j, k) => (i("replaceGTE0", j, k), j.trim().replace(l[k.includePrerelease ? u.GTE0PRE : u.GTE0], "")), z = (j) => (k, F, D, q, C, P, w, E, _, h, x, O) => (S(D) ? F = "" : S(q) ? F = `>=${D}.0.0${j ? "-0" : ""}` : S(C) ? F = `>=${D}.${q}.0${j ? "-0" : ""}` : P ? F = `>=${F}` : F = `>=${F}${j ? "-0" : ""}`, S(_) ? E = "" : S(h) ? E = `<${+_ + 1}.0.0-0` : S(x) ? E = `<${_}.${+h + 1}.0-0` : O ? E = `<=${_}.${h}.${x}-${O}` : j ? E = `<${_}.${h}.${+x + 1}-0` : E = `<=${E}`, `${F} ${E}`.trim()), re = (j, k, F) => {
    for (let D = 0; D < j.length; D++)
      if (!j[D].test(k))
        return !1;
    if (k.prerelease.length && !F.includePrerelease) {
      for (let D = 0; D < j.length; D++)
        if (i(j[D].semver), j[D].semver !== s.ANY && j[D].semver.prerelease.length > 0) {
          const q = j[D].semver;
          if (q.major === k.major && q.minor === k.minor && q.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Hr;
}
var Gr, Oc;
function fr() {
  if (Oc) return Gr;
  Oc = 1;
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
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, p), this.options = p, this.loose = !!p.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const p = this.options.loose ? a[r.COMPARATORLOOSE] : a[r.COMPARATOR], d = c.match(p);
      if (!d)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new o(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new o(c, this.options);
        } catch {
          return !1;
        }
      return s(c, this.operator, this.semver, this.options);
    }
    intersects(c, p) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, p).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, p).test(c.semver) : (p = n(p), p.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !p.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || s(this.semver, "<", c.semver, p) && this.operator.startsWith(">") && c.operator.startsWith("<") || s(this.semver, ">", c.semver, p) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Gr = t;
  const n = no, { safeRe: a, t: r } = ta, s = mp, i = pr, o = je, l = Je();
  return Gr;
}
const h$ = Je(), v$ = (e, t, n) => {
  try {
    t = new h$(t, n);
  } catch {
    return !1;
  }
  return t.test(e);
};
var mr = v$;
const y$ = Je(), g$ = (e, t) => new y$(e, t).set.map((n) => n.map((a) => a.value).join(" ").trim().split(" "));
var x$ = g$;
const b$ = je, $$ = Je(), w$ = (e, t, n) => {
  let a = null, r = null, s = null;
  try {
    s = new $$(t, n);
  } catch {
    return null;
  }
  return e.forEach((i) => {
    s.test(i) && (!a || r.compare(i) === -1) && (a = i, r = new b$(a, n));
  }), a;
};
var _$ = w$;
const E$ = je, S$ = Je(), R$ = (e, t, n) => {
  let a = null, r = null, s = null;
  try {
    s = new S$(t, n);
  } catch {
    return null;
  }
  return e.forEach((i) => {
    s.test(i) && (!a || r.compare(i) === 1) && (a = i, r = new E$(a, n));
  }), a;
};
var P$ = R$;
const Kr = je, O$ = Je(), Tc = dr, T$ = (e, t) => {
  e = new O$(e, t);
  let n = new Kr("0.0.0");
  if (e.test(n) || (n = new Kr("0.0.0-0"), e.test(n)))
    return n;
  n = null;
  for (let a = 0; a < e.set.length; ++a) {
    const r = e.set[a];
    let s = null;
    r.forEach((i) => {
      const o = new Kr(i.semver.version);
      switch (i.operator) {
        case ">":
          o.prerelease.length === 0 ? o.patch++ : o.prerelease.push(0), o.raw = o.format();
        case "":
        case ">=":
          (!s || Tc(o, s)) && (s = o);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${i.operator}`);
      }
    }), s && (!n || Tc(n, s)) && (n = s);
  }
  return n && e.test(n) ? n : null;
};
var A$ = T$;
const j$ = Je(), k$ = (e, t) => {
  try {
    return new j$(e, t).range || "*";
  } catch {
    return null;
  }
};
var N$ = k$;
const I$ = je, hp = fr(), { ANY: C$ } = hp, L$ = Je(), D$ = mr, Ac = dr, jc = ro, F$ = io, U$ = so, z$ = (e, t, n, a) => {
  e = new I$(e, a), t = new L$(t, a);
  let r, s, i, o, l;
  switch (n) {
    case ">":
      r = Ac, s = F$, i = jc, o = ">", l = ">=";
      break;
    case "<":
      r = jc, s = U$, i = Ac, o = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (D$(e, t, a))
    return !1;
  for (let u = 0; u < t.set.length; ++u) {
    const c = t.set[u];
    let p = null, d = null;
    if (c.forEach((f) => {
      f.semver === C$ && (f = new hp(">=0.0.0")), p = p || f, d = d || f, r(f.semver, p.semver, a) ? p = f : i(f.semver, d.semver, a) && (d = f);
    }), p.operator === o || p.operator === l || (!d.operator || d.operator === o) && s(e, d.semver))
      return !1;
    if (d.operator === l && i(e, d.semver))
      return !1;
  }
  return !0;
};
var oo = z$;
const M$ = oo, q$ = (e, t, n) => M$(e, t, ">", n);
var B$ = q$;
const V$ = oo, H$ = (e, t, n) => V$(e, t, "<", n);
var G$ = H$;
const kc = Je(), K$ = (e, t, n) => (e = new kc(e, n), t = new kc(t, n), e.intersects(t, n));
var W$ = K$;
const X$ = mr, J$ = Xe;
var Y$ = (e, t, n) => {
  const a = [];
  let r = null, s = null;
  const i = e.sort((c, p) => J$(c, p, n));
  for (const c of i)
    X$(c, t, n) ? (s = c, r || (r = c)) : (s && a.push([r, s]), s = null, r = null);
  r && a.push([r, null]);
  const o = [];
  for (const [c, p] of a)
    c === p ? o.push(c) : !p && c === i[0] ? o.push("*") : p ? c === i[0] ? o.push(`<=${p}`) : o.push(`${c} - ${p}`) : o.push(`>=${c}`);
  const l = o.join(" || "), u = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < u.length ? l : t;
};
const Nc = Je(), co = fr(), { ANY: Wr } = co, Nn = mr, lo = Xe, Q$ = (e, t, n = {}) => {
  if (e === t)
    return !0;
  e = new Nc(e, n), t = new Nc(t, n);
  let a = !1;
  e: for (const r of e.set) {
    for (const s of t.set) {
      const i = ew(r, s, n);
      if (a = a || i !== null, i)
        continue e;
    }
    if (a)
      return !1;
  }
  return !0;
}, Z$ = [new co(">=0.0.0-0")], Ic = [new co(">=0.0.0")], ew = (e, t, n) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Wr) {
    if (t.length === 1 && t[0].semver === Wr)
      return !0;
    n.includePrerelease ? e = Z$ : e = Ic;
  }
  if (t.length === 1 && t[0].semver === Wr) {
    if (n.includePrerelease)
      return !0;
    t = Ic;
  }
  const a = /* @__PURE__ */ new Set();
  let r, s;
  for (const f of e)
    f.operator === ">" || f.operator === ">=" ? r = Cc(r, f, n) : f.operator === "<" || f.operator === "<=" ? s = Lc(s, f, n) : a.add(f.semver);
  if (a.size > 1)
    return null;
  let i;
  if (r && s) {
    if (i = lo(r.semver, s.semver, n), i > 0)
      return null;
    if (i === 0 && (r.operator !== ">=" || s.operator !== "<="))
      return null;
  }
  for (const f of a) {
    if (r && !Nn(f, String(r), n) || s && !Nn(f, String(s), n))
      return null;
    for (const g of t)
      if (!Nn(f, String(g), n))
        return !1;
    return !0;
  }
  let o, l, u, c, p = s && !n.includePrerelease && s.semver.prerelease.length ? s.semver : !1, d = r && !n.includePrerelease && r.semver.prerelease.length ? r.semver : !1;
  p && p.prerelease.length === 1 && s.operator === "<" && p.prerelease[0] === 0 && (p = !1);
  for (const f of t) {
    if (c = c || f.operator === ">" || f.operator === ">=", u = u || f.operator === "<" || f.operator === "<=", r) {
      if (d && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === d.major && f.semver.minor === d.minor && f.semver.patch === d.patch && (d = !1), f.operator === ">" || f.operator === ">=") {
        if (o = Cc(r, f, n), o === f && o !== r)
          return !1;
      } else if (r.operator === ">=" && !Nn(r.semver, String(f), n))
        return !1;
    }
    if (s) {
      if (p && f.semver.prerelease && f.semver.prerelease.length && f.semver.major === p.major && f.semver.minor === p.minor && f.semver.patch === p.patch && (p = !1), f.operator === "<" || f.operator === "<=") {
        if (l = Lc(s, f, n), l === f && l !== s)
          return !1;
      } else if (s.operator === "<=" && !Nn(s.semver, String(f), n))
        return !1;
    }
    if (!f.operator && (s || r) && i !== 0)
      return !1;
  }
  return !(r && u && !s && i !== 0 || s && c && !r && i !== 0 || d || p);
}, Cc = (e, t, n) => {
  if (!e)
    return t;
  const a = lo(e.semver, t.semver, n);
  return a > 0 ? e : a < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Lc = (e, t, n) => {
  if (!e)
    return t;
  const a = lo(e.semver, t.semver, n);
  return a < 0 ? e : a > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var tw = Q$;
const Xr = ta, Dc = ea, nw = je, Fc = pp, aw = Jt, rw = n0, sw = s0, iw = o0, ow = l0, cw = d0, lw = h0, uw = g0, pw = $0, dw = Xe, fw = S0, mw = O0, hw = ao, vw = k0, yw = C0, gw = dr, xw = ro, bw = dp, $w = fp, ww = so, _w = io, Ew = mp, Sw = r$, Rw = d$, Pw = fr(), Ow = Je(), Tw = mr, Aw = x$, jw = _$, kw = P$, Nw = A$, Iw = N$, Cw = oo, Lw = B$, Dw = G$, Fw = W$, Uw = Y$, zw = tw;
var Mw = {
  parse: aw,
  valid: rw,
  clean: sw,
  inc: iw,
  diff: ow,
  major: cw,
  minor: lw,
  patch: uw,
  prerelease: pw,
  compare: dw,
  rcompare: fw,
  compareLoose: mw,
  compareBuild: hw,
  sort: vw,
  rsort: yw,
  gt: gw,
  lt: xw,
  eq: bw,
  neq: $w,
  gte: ww,
  lte: _w,
  cmp: Ew,
  coerce: Sw,
  truncate: Rw,
  Comparator: Pw,
  Range: Ow,
  satisfies: Tw,
  toComparators: Aw,
  maxSatisfying: jw,
  minSatisfying: kw,
  minVersion: Nw,
  validRange: Iw,
  outside: Cw,
  gtr: Lw,
  ltr: Dw,
  intersects: Fw,
  simplifyRange: Uw,
  subset: zw,
  SemVer: nw,
  re: Xr.re,
  src: Xr.src,
  tokens: Xr.t,
  SEMVER_SPEC_VERSION: Dc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Dc.RELEASE_TYPES,
  compareIdentifiers: Fc.compareIdentifiers,
  rcompareIdentifiers: Fc.rcompareIdentifiers
};
const en = /* @__PURE__ */ Yn(Mw), qw = Object.prototype.toString, Bw = "[object Uint8Array]", Vw = "[object ArrayBuffer]";
function vp(e, t, n) {
  return e ? e.constructor === t ? !0 : qw.call(e) === n : !1;
}
function yp(e) {
  return vp(e, Uint8Array, Bw);
}
function Hw(e) {
  return vp(e, ArrayBuffer, Vw);
}
function Gw(e) {
  return yp(e) || Hw(e);
}
function Kw(e) {
  if (!yp(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Ww(e) {
  if (!Gw(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Jr(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((r, s) => r + s.length, 0));
  const n = new Uint8Array(t);
  let a = 0;
  for (const r of e)
    Kw(r), n.set(r, a), a += r.length;
  return n;
}
const _a = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Ea(e, t = "utf8") {
  return Ww(e), _a[t] ?? (_a[t] = new globalThis.TextDecoder(t)), _a[t].decode(e);
}
function Xw(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Jw = new globalThis.TextEncoder();
function Yr(e) {
  return Xw(e), Jw.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Uc = "aes-256-cbc", gp = /* @__PURE__ */ new Set([
  "aes-256-cbc",
  "aes-256-gcm",
  "aes-256-ctr"
]), Yw = (e) => typeof e == "string" && gp.has(e), lt = () => /* @__PURE__ */ Object.create(null), zc = (e) => e !== void 0, Qr = (e, t) => {
  const n = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), a = typeof t;
  if (n.has(a))
    throw new TypeError(`Setting a value of type \`${a}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, xt = "__internal__", Zr = `${xt}.migrations.version`;
var $t, wt, Ct, Ce, qe, Lt, Dt, fn, tt, $e, xp, bp, $p, wp, _p, Ep, Sp, Rp;
class Qw {
  constructor(t = {}) {
    He(this, $e);
    Pn(this, "path");
    Pn(this, "events");
    He(this, $t);
    He(this, wt);
    He(this, Ct);
    He(this, Ce);
    He(this, qe, {});
    He(this, Lt, !1);
    He(this, Dt);
    He(this, fn);
    He(this, tt);
    Pn(this, "_deserialize", (t) => JSON.parse(t));
    Pn(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const n = ot(this, $e, xp).call(this, t);
    Ie(this, Ce, n), ot(this, $e, bp).call(this, n), ot(this, $e, wp).call(this, n), ot(this, $e, _p).call(this, n), this.events = new EventTarget(), Ie(this, wt, n.encryptionKey), Ie(this, Ct, n.encryptionAlgorithm ?? Uc), this.path = ot(this, $e, Ep).call(this, n), ot(this, $e, Sp).call(this, n), n.watch && this._watch();
  }
  get(t, n) {
    if (X(this, Ce).accessPropertiesByDotNotation)
      return this._get(t, n);
    const { store: a } = this;
    return t in a ? a[t] : n;
  }
  set(t, n) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && n === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${xt} key, as it's used to manage this module internal operations.`);
    const { store: a } = this, r = (s, i) => {
      if (Qr(s, i), X(this, Ce).accessPropertiesByDotNotation)
        ua(a, s, i);
      else {
        if (s === "__proto__" || s === "constructor" || s === "prototype")
          return;
        a[s] = i;
      }
    };
    if (typeof t == "object") {
      const s = t;
      for (const [i, o] of Object.entries(s))
        r(i, o);
    } else
      r(t, n);
    this.store = a;
  }
  has(t) {
    return X(this, Ce).accessPropertiesByDotNotation ? Lr(this.store, t) : t in this.store;
  }
  appendToArray(t, n) {
    Qr(t, n);
    const a = X(this, Ce).accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(a))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...a, n]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const n of t)
      zc(X(this, qe)[n]) && this.set(n, X(this, qe)[n]);
  }
  delete(t) {
    const { store: n } = this;
    X(this, Ce).accessPropertiesByDotNotation ? Yd(n, t) : delete n[t], this.store = n;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = lt();
    for (const n of Object.keys(X(this, qe)))
      zc(X(this, qe)[n]) && (Qr(n, X(this, qe)[n]), X(this, Ce).accessPropertiesByDotNotation ? ua(t, n, X(this, qe)[n]) : t[n] = X(this, qe)[n]);
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
      const n = J.readFileSync(this.path, X(this, wt) ? null : "utf8"), a = this._decryptData(n);
      return ((s) => {
        const i = this._deserialize(s);
        return X(this, Lt) || this._validate(i), Object.assign(lt(), i);
      })(a);
    } catch (n) {
      if ((n == null ? void 0 : n.code) === "ENOENT")
        return this._ensureDirectory(), lt();
      if (X(this, Ce).clearInvalidConfig) {
        const a = n;
        if (a.name === "SyntaxError" || (t = a.message) != null && t.startsWith("Config schema violation:") || a.message === "Failed to decrypt config data.")
          return lt();
      }
      throw n;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Lr(t, xt))
      try {
        const n = J.readFileSync(this.path, X(this, wt) ? null : "utf8"), a = this._decryptData(n), r = this._deserialize(a);
        Lr(r, xt) && ua(t, xt, Fo(r, xt));
      } catch {
      }
    X(this, Lt) || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, n] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, n]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    X(this, Dt) && (X(this, Dt).close(), Ie(this, Dt, void 0)), X(this, fn) && (J.unwatchFile(this.path), Ie(this, fn, !1)), Ie(this, tt, void 0);
  }
  _decryptData(t) {
    const n = X(this, wt);
    if (!n)
      return typeof t == "string" ? t : Ea(t);
    const a = X(this, Ct), r = a === "aes-256-gcm" ? 16 : 0, s = ":".codePointAt(0), i = typeof t == "string" ? t.codePointAt(16) : t[16];
    if (!(s !== void 0 && i === s)) {
      if (a === "aes-256-cbc")
        return typeof t == "string" ? t : Ea(t);
      throw new Error("Failed to decrypt config data.");
    }
    const l = (f) => {
      if (r === 0)
        return { ciphertext: f };
      const g = f.length - r;
      if (g < 0)
        throw new Error("Invalid authentication tag length.");
      return {
        ciphertext: f.slice(0, g),
        authenticationTag: f.slice(g)
      };
    }, u = t.slice(0, 16), c = t.slice(17), p = typeof c == "string" ? Yr(c) : c, d = (f) => {
      const { ciphertext: g, authenticationTag: v } = l(p), y = On.pbkdf2Sync(n, f, 1e4, 32, "sha512"), m = On.createDecipheriv(a, y, u);
      return v && m.setAuthTag(v), Ea(Jr([m.update(g), m.final()]));
    };
    try {
      return d(u);
    } catch {
      try {
        return d(u.toString());
      } catch {
      }
    }
    if (a === "aes-256-cbc")
      return typeof t == "string" ? t : Ea(t);
    throw new Error("Failed to decrypt config data.");
  }
  _handleStoreChange(t) {
    let n = this.store;
    const a = () => {
      const r = n, s = this.store;
      Co(s, r) || (n = s, t.call(this, s, r));
    };
    return this.events.addEventListener("change", a), () => {
      this.events.removeEventListener("change", a);
    };
  }
  _handleValueChange(t, n) {
    let a = t();
    const r = () => {
      const s = a, i = t();
      Co(i, s) || (a = i, n.call(this, i, s));
    };
    return this.events.addEventListener("change", r), () => {
      this.events.removeEventListener("change", r);
    };
  }
  _validate(t) {
    if (!X(this, $t) || X(this, $t).call(this, t) || !X(this, $t).errors)
      return;
    const a = X(this, $t).errors.map(({ instancePath: r, message: s = "" }) => `\`${r.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + a.join("; "));
  }
  _ensureDirectory() {
    J.mkdirSync(Q.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let n = this._serialize(t);
    const a = X(this, wt);
    if (a) {
      const r = On.randomBytes(16), s = On.pbkdf2Sync(a, r, 1e4, 32, "sha512"), i = On.createCipheriv(X(this, Ct), s, r), o = Jr([i.update(Yr(n)), i.final()]), l = [r, Yr(":"), o];
      X(this, Ct) === "aes-256-gcm" && l.push(i.getAuthTag()), n = Jr(l);
    }
    if (ue.env.SNAP)
      J.writeFileSync(this.path, n, { mode: X(this, Ce).configFileMode });
    else
      try {
        ru(this.path, n, { mode: X(this, Ce).configFileMode });
      } catch (r) {
        if ((r == null ? void 0 : r.code) === "EXDEV") {
          J.writeFileSync(this.path, n, { mode: X(this, Ce).configFileMode });
          return;
        }
        throw r;
      }
  }
  _watch() {
    if (this._ensureDirectory(), J.existsSync(this.path) || this._write(lt()), ue.platform === "win32" || ue.platform === "darwin") {
      X(this, tt) ?? Ie(this, tt, xc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const t = Q.dirname(this.path), n = Q.basename(this.path);
      Ie(this, Dt, J.watch(t, { persistent: !1, encoding: "utf8" }, (a, r) => {
        r && r !== n || typeof X(this, tt) == "function" && X(this, tt).call(this);
      }));
    } else
      X(this, tt) ?? Ie(this, tt, xc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), J.watchFile(this.path, { persistent: !1 }, (t, n) => {
        typeof X(this, tt) == "function" && X(this, tt).call(this);
      }), Ie(this, fn, !0);
  }
  _migrate(t, n, a) {
    let r = this._get(Zr, "0.0.0");
    const s = Object.keys(t).filter((o) => this._shouldPerformMigration(o, r, n));
    let i = structuredClone(this.store);
    for (const o of s)
      try {
        a && a(this, {
          fromVersion: r,
          toVersion: o,
          finalVersion: n,
          versions: s
        });
        const l = t[o];
        l == null || l(this), this._set(Zr, o), r = o, i = structuredClone(this.store);
      } catch (l) {
        this.store = i;
        const u = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(r) || !en.eq(r, n)) && this._set(Zr, n);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [n, a] of Object.entries(t))
      if (this._isReservedKeyPath(n) || this._objectContainsReservedKey(a))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === xt || t.startsWith(`${xt}.`);
  }
  _isVersionInRangeFormat(t) {
    return en.clean(t) === null;
  }
  _shouldPerformMigration(t, n, a) {
    return this._isVersionInRangeFormat(t) ? n !== "0.0.0" && en.satisfies(n, t) ? !1 : en.satisfies(a, t) : !(en.lte(t, n) || en.gt(t, a));
  }
  _get(t, n) {
    return Fo(this.store, t, n);
  }
  _set(t, n) {
    const { store: a } = this;
    ua(a, t, n), this.store = a;
  }
}
$t = new WeakMap(), wt = new WeakMap(), Ct = new WeakMap(), Ce = new WeakMap(), qe = new WeakMap(), Lt = new WeakMap(), Dt = new WeakMap(), fn = new WeakMap(), tt = new WeakMap(), $e = new WeakSet(), xp = function(t) {
  const n = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...t
  };
  if (n.encryptionAlgorithm ?? (n.encryptionAlgorithm = Uc), !Yw(n.encryptionAlgorithm))
    throw new TypeError(`The \`encryptionAlgorithm\` option must be one of: ${[...gp].join(", ")}`);
  if (!n.cwd) {
    if (!n.projectName)
      throw new Error("Please specify the `projectName` option.");
    n.cwd = tf(n.projectName, { suffix: n.projectSuffix }).config;
  }
  return typeof n.fileExtension == "string" && (n.fileExtension = n.fileExtension.replace(/^\.+/, "")), n;
}, bp = function(t) {
  if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
    return;
  if (t.schema && typeof t.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const n = kb.default, a = new yb.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...t.ajvOptions
  });
  n(a);
  const r = {
    ...t.rootSchema,
    type: "object",
    properties: t.schema
  };
  Ie(this, $t, a.compile(r)), ot(this, $e, $p).call(this, t.schema);
}, $p = function(t) {
  const n = Object.entries(t ?? {});
  for (const [a, r] of n) {
    if (!r || typeof r != "object" || !Object.hasOwn(r, "default"))
      continue;
    const { default: s } = r;
    s !== void 0 && (X(this, qe)[a] = s);
  }
}, wp = function(t) {
  t.defaults && Object.assign(X(this, qe), t.defaults);
}, _p = function(t) {
  t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
}, Ep = function(t) {
  const n = typeof t.fileExtension == "string" ? t.fileExtension : void 0, a = n ? `.${n}` : "";
  return Q.resolve(t.cwd, `${t.configName ?? "config"}${a}`);
}, Sp = function(t) {
  if (t.migrations) {
    ot(this, $e, Rp).call(this, t), this._validate(this.store);
    return;
  }
  const n = this.store, a = Object.assign(lt(), t.defaults ?? {}, n);
  this._validate(a);
  try {
    Lo.deepEqual(n, a);
  } catch {
    this.store = a;
  }
}, Rp = function(t) {
  const { migrations: n, projectVersion: a } = t;
  if (n) {
    if (!a)
      throw new Error("Please specify the `projectVersion` option.");
    Ie(this, Lt, !0);
    try {
      const r = this.store, s = Object.assign(lt(), t.defaults ?? {}, r);
      try {
        Lo.deepEqual(r, s);
      } catch {
        this._write(s);
      }
      this._migrate(n, a, t.beforeEachMigration);
    } finally {
      Ie(this, Lt, !1);
    }
  }
};
const { app: Ca, ipcMain: Us, shell: Zw } = Hl;
let Mc = !1;
const qc = () => {
  if (!Us || !Ca)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Ca.getPath("userData"),
    appVersion: Ca.getVersion()
  };
  return Mc || (Us.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Mc = !0), e;
};
class e_ extends Qw {
  constructor(t) {
    let n, a;
    if (ue.type === "renderer") {
      const r = Hl.ipcRenderer.sendSync("electron-store-get-data");
      if (!r)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: n, appVersion: a } = r);
    } else Us && Ca && ({ defaultCwd: n, appVersion: a } = qc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = a), t.cwd ? t.cwd = Q.isAbsolute(t.cwd) ? t.cwd : Q.join(n, t.cwd) : t.cwd = n, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    qc();
  }
  async openInEditor() {
    const t = await Zw.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const hr = new e_();
function t_(e) {
  return e.trim().replace(/\/+$/, "");
}
function n_() {
  const e = hr.get("credentials");
  if (!e)
    throw new Error("Please login first.");
  return e;
}
function a_(e) {
  hr.set("credentials", e);
}
function r_() {
  hr.delete("credentials");
}
function s_() {
  rt.handle("auth:get", async () => {
    const e = hr.get("credentials");
    return e ? {
      loggedIn: !0,
      siteUrl: e.siteUrl
    } : {
      loggedIn: !1,
      siteUrl: ""
    };
  }), rt.handle("auth:login", async (e, t) => {
    const n = t_(t.siteUrl), a = t.apiKey.trim(), r = t.apiSecret.trim();
    if (!n || !a || !r)
      throw new Error("Site URL, API key, and API secret are required.");
    return a_({
      siteUrl: n,
      apiKey: a,
      apiSecret: r
    }), {
      success: !0,
      siteUrl: n
    };
  }), rt.handle("auth:logout", async () => (r_(), {
    success: !0
  }));
}
function Pp(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
const { toString: i_ } = Object.prototype, { getPrototypeOf: vr } = Object, { iterator: yr, toStringTag: Op } = Symbol, gr = /* @__PURE__ */ ((e) => (t) => {
  const n = i_.call(t);
  return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), Ye = (e) => (e = e.toLowerCase(), (t) => gr(t) === e), xr = (e) => (t) => typeof t === e, { isArray: En } = Array, vn = xr("undefined");
function na(e) {
  return e !== null && !vn(e) && e.constructor !== null && !vn(e.constructor) && De(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
const Tp = Ye("ArrayBuffer");
function o_(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Tp(e.buffer), t;
}
const c_ = xr("string"), De = xr("function"), Ap = xr("number"), aa = (e) => e !== null && typeof e == "object", l_ = (e) => e === !0 || e === !1, La = (e) => {
  if (gr(e) !== "object")
    return !1;
  const t = vr(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Op in e) && !(yr in e);
}, u_ = (e) => {
  if (!aa(e) || na(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, p_ = Ye("Date"), d_ = Ye("File"), f_ = (e) => !!(e && typeof e.uri < "u"), m_ = (e) => e && typeof e.getParts < "u", h_ = Ye("Blob"), v_ = Ye("FileList"), y_ = (e) => aa(e) && De(e.pipe);
function g_() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
const Bc = g_(), Vc = typeof Bc.FormData < "u" ? Bc.FormData : void 0, x_ = (e) => {
  if (!e) return !1;
  if (Vc && e instanceof Vc) return !0;
  const t = vr(e);
  if (!t || t === Object.prototype || !De(e.append)) return !1;
  const n = gr(e);
  return n === "formdata" || // detect form-data instance
  n === "object" && De(e.toString) && e.toString() === "[object FormData]";
}, b_ = Ye("URLSearchParams"), [$_, w_, __, E_] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(Ye), S_ = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function ra(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let a, r;
  if (typeof e != "object" && (e = [e]), En(e))
    for (a = 0, r = e.length; a < r; a++)
      t.call(null, e[a], a, e);
  else {
    if (na(e))
      return;
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e), i = s.length;
    let o;
    for (a = 0; a < i; a++)
      o = s[a], t.call(null, e[o], o, e);
  }
}
function jp(e, t) {
  if (na(e))
    return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let a = n.length, r;
  for (; a-- > 0; )
    if (r = n[a], t === r.toLowerCase())
      return r;
  return null;
}
const Nt = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, kp = (e) => !vn(e) && e !== Nt;
function zs(...e) {
  const { caseless: t, skipUndefined: n } = kp(this) && this || {}, a = {}, r = (s, i) => {
    if (i === "__proto__" || i === "constructor" || i === "prototype")
      return;
    const o = t && jp(a, i) || i, l = Ms(a, o) ? a[o] : void 0;
    La(l) && La(s) ? a[o] = zs(l, s) : La(s) ? a[o] = zs({}, s) : En(s) ? a[o] = s.slice() : (!n || !vn(s)) && (a[o] = s);
  };
  for (let s = 0, i = e.length; s < i; s++)
    e[s] && ra(e[s], r);
  return a;
}
const R_ = (e, t, n, { allOwnKeys: a } = {}) => (ra(
  t,
  (r, s) => {
    n && De(r) ? Object.defineProperty(e, s, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot
      // hijack defineProperty's accessor-vs-data resolution.
      __proto__: null,
      value: Pp(r, n),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, s, {
      __proto__: null,
      value: r,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: a }
), e), P_ = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), O_ = (e, t, n, a) => {
  e.prototype = Object.create(t.prototype, a), Object.defineProperty(e.prototype, "constructor", {
    __proto__: null,
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    __proto__: null,
    value: t.prototype
  }), n && Object.assign(e.prototype, n);
}, T_ = (e, t, n, a) => {
  let r, s, i;
  const o = {};
  if (t = t || {}, e == null) return t;
  do {
    for (r = Object.getOwnPropertyNames(e), s = r.length; s-- > 0; )
      i = r[s], (!a || a(i, e, t)) && !o[i] && (t[i] = e[i], o[i] = !0);
    e = n !== !1 && vr(e);
  } while (e && (!n || n(e, t)) && e !== Object.prototype);
  return t;
}, A_ = (e, t, n) => {
  e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
  const a = e.indexOf(t, n);
  return a !== -1 && a === n;
}, j_ = (e) => {
  if (!e) return null;
  if (En(e)) return e;
  let t = e.length;
  if (!Ap(t)) return null;
  const n = new Array(t);
  for (; t-- > 0; )
    n[t] = e[t];
  return n;
}, k_ = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && vr(Uint8Array)), N_ = (e, t) => {
  const a = (e && e[yr]).call(e);
  let r;
  for (; (r = a.next()) && !r.done; ) {
    const s = r.value;
    t.call(e, s[0], s[1]);
  }
}, I_ = (e, t) => {
  let n;
  const a = [];
  for (; (n = e.exec(t)) !== null; )
    a.push(n);
  return a;
}, C_ = Ye("HTMLFormElement"), L_ = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(n, a, r) {
  return a.toUpperCase() + r;
}), Ms = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), D_ = Ye("RegExp"), Np = (e, t) => {
  const n = Object.getOwnPropertyDescriptors(e), a = {};
  ra(n, (r, s) => {
    let i;
    (i = t(r, s, e)) !== !1 && (a[s] = i || r);
  }), Object.defineProperties(e, a);
}, F_ = (e) => {
  Np(e, (t, n) => {
    if (De(e) && ["arguments", "caller", "callee"].includes(n))
      return !1;
    const a = e[n];
    if (De(a)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, U_ = (e, t) => {
  const n = {}, a = (r) => {
    r.forEach((s) => {
      n[s] = !0;
    });
  };
  return En(e) ? a(e) : a(String(e).split(t)), n;
}, z_ = () => {
}, M_ = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function q_(e) {
  return !!(e && De(e.append) && e[Op] === "FormData" && e[yr]);
}
const B_ = (e) => {
  const t = /* @__PURE__ */ new WeakSet(), n = (a) => {
    if (aa(a)) {
      if (t.has(a))
        return;
      if (na(a))
        return a;
      if (!("toJSON" in a)) {
        t.add(a);
        const r = En(a) ? [] : {};
        return ra(a, (s, i) => {
          const o = n(s);
          !vn(o) && (r[i] = o);
        }), t.delete(a), r;
      }
    }
    return a;
  };
  return n(e);
}, V_ = Ye("AsyncFunction"), H_ = (e) => e && (aa(e) || De(e)) && De(e.then) && De(e.catch), Ip = ((e, t) => e ? setImmediate : t ? ((n, a) => (Nt.addEventListener(
  "message",
  ({ source: r, data: s }) => {
    r === Nt && s === n && a.length && a.shift()();
  },
  !1
), (r) => {
  a.push(r), Nt.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(typeof setImmediate == "function", De(Nt.postMessage)), G_ = typeof queueMicrotask < "u" ? queueMicrotask.bind(Nt) : typeof process < "u" && process.nextTick || Ip, K_ = (e) => e != null && De(e[yr]), b = {
  isArray: En,
  isArrayBuffer: Tp,
  isBuffer: na,
  isFormData: x_,
  isArrayBufferView: o_,
  isString: c_,
  isNumber: Ap,
  isBoolean: l_,
  isObject: aa,
  isPlainObject: La,
  isEmptyObject: u_,
  isReadableStream: $_,
  isRequest: w_,
  isResponse: __,
  isHeaders: E_,
  isUndefined: vn,
  isDate: p_,
  isFile: d_,
  isReactNativeBlob: f_,
  isReactNative: m_,
  isBlob: h_,
  isRegExp: D_,
  isFunction: De,
  isStream: y_,
  isURLSearchParams: b_,
  isTypedArray: k_,
  isFileList: v_,
  forEach: ra,
  merge: zs,
  extend: R_,
  trim: S_,
  stripBOM: P_,
  inherits: O_,
  toFlatObject: T_,
  kindOf: gr,
  kindOfTest: Ye,
  endsWith: A_,
  toArray: j_,
  forEachEntry: N_,
  matchAll: I_,
  isHTMLForm: C_,
  hasOwnProperty: Ms,
  hasOwnProp: Ms,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Np,
  freezeMethods: F_,
  toObjectSet: U_,
  toCamelCase: L_,
  noop: z_,
  toFiniteNumber: M_,
  findKey: jp,
  global: Nt,
  isContextDefined: kp,
  isSpecCompliantForm: q_,
  toJSONObject: B_,
  isAsyncFn: V_,
  isThenable: H_,
  setImmediate: Ip,
  asap: G_,
  isIterable: K_
}, W_ = b.toObjectSet([
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
]), X_ = (e) => {
  const t = {};
  let n, a, r;
  return e && e.split(`
`).forEach(function(i) {
    r = i.indexOf(":"), n = i.substring(0, r).trim().toLowerCase(), a = i.substring(r + 1).trim(), !(!n || t[n] && W_[n]) && (n === "set-cookie" ? t[n] ? t[n].push(a) : t[n] = [a] : t[n] = t[n] ? t[n] + ", " + a : a);
  }), t;
};
function J_(e) {
  let t = 0, n = e.length;
  for (; t < n; ) {
    const a = e.charCodeAt(t);
    if (a !== 9 && a !== 32)
      break;
    t += 1;
  }
  for (; n > t; ) {
    const a = e.charCodeAt(n - 1);
    if (a !== 9 && a !== 32)
      break;
    n -= 1;
  }
  return t === 0 && n === e.length ? e : e.slice(t, n);
}
const Y_ = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), Q_ = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function uo(e, t) {
  return b.isArray(e) ? e.map((n) => uo(n, t)) : J_(String(e).replace(t, ""));
}
const Z_ = (e) => uo(e, Y_), eE = (e) => uo(e, Q_);
function po(e) {
  const t = /* @__PURE__ */ Object.create(null);
  return b.forEach(e.toJSON(), (n, a) => {
    t[a] = eE(n);
  }), t;
}
const Hc = Symbol("internals");
function In(e) {
  return e && String(e).trim().toLowerCase();
}
function Da(e) {
  return e === !1 || e == null ? e : b.isArray(e) ? e.map(Da) : Z_(String(e));
}
function tE(e) {
  const t = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let a;
  for (; a = n.exec(e); )
    t[a[1]] = a[2];
  return t;
}
const nE = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function es(e, t, n, a, r) {
  if (b.isFunction(a))
    return a.call(this, t, n);
  if (r && (t = n), !!b.isString(t)) {
    if (b.isString(a))
      return t.indexOf(a) !== -1;
    if (b.isRegExp(a))
      return a.test(t);
  }
}
function aE(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, n, a) => n.toUpperCase() + a);
}
function rE(e, t) {
  const n = b.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((a) => {
    Object.defineProperty(e, a + n, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(r, s, i) {
        return this[a].call(this, t, r, s, i);
      },
      configurable: !0
    });
  });
}
let be = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, a) {
    const r = this;
    function s(o, l, u) {
      const c = In(l);
      if (!c)
        throw new Error("header name must be a non-empty string");
      const p = b.findKey(r, c);
      (!p || r[p] === void 0 || u === !0 || u === void 0 && r[p] !== !1) && (r[p || l] = Da(o));
    }
    const i = (o, l) => b.forEach(o, (u, c) => s(u, c, l));
    if (b.isPlainObject(t) || t instanceof this.constructor)
      i(t, n);
    else if (b.isString(t) && (t = t.trim()) && !nE(t))
      i(X_(t), n);
    else if (b.isObject(t) && b.isIterable(t)) {
      let o = {}, l, u;
      for (const c of t) {
        if (!b.isArray(c))
          throw TypeError("Object iterator must return a key-value pair");
        o[u = c[0]] = (l = o[u]) ? b.isArray(l) ? [...l, c[1]] : [l, c[1]] : c[1];
      }
      i(o, n);
    } else
      t != null && s(n, t, a);
    return this;
  }
  get(t, n) {
    if (t = In(t), t) {
      const a = b.findKey(this, t);
      if (a) {
        const r = this[a];
        if (!n)
          return r;
        if (n === !0)
          return tE(r);
        if (b.isFunction(n))
          return n.call(this, r, a);
        if (b.isRegExp(n))
          return n.exec(r);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (t = In(t), t) {
      const a = b.findKey(this, t);
      return !!(a && this[a] !== void 0 && (!n || es(this, this[a], a, n)));
    }
    return !1;
  }
  delete(t, n) {
    const a = this;
    let r = !1;
    function s(i) {
      if (i = In(i), i) {
        const o = b.findKey(a, i);
        o && (!n || es(a, a[o], o, n)) && (delete a[o], r = !0);
      }
    }
    return b.isArray(t) ? t.forEach(s) : s(t), r;
  }
  clear(t) {
    const n = Object.keys(this);
    let a = n.length, r = !1;
    for (; a--; ) {
      const s = n[a];
      (!t || es(this, this[s], s, t, !0)) && (delete this[s], r = !0);
    }
    return r;
  }
  normalize(t) {
    const n = this, a = {};
    return b.forEach(this, (r, s) => {
      const i = b.findKey(a, s);
      if (i) {
        n[i] = Da(r), delete n[s];
        return;
      }
      const o = t ? aE(s) : String(s).trim();
      o !== s && delete n[s], n[o] = Da(r), a[o] = !0;
    }), this;
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = /* @__PURE__ */ Object.create(null);
    return b.forEach(this, (a, r) => {
      a != null && a !== !1 && (n[r] = t && b.isArray(a) ? a.join(", ") : a);
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
    const a = new this(t);
    return n.forEach((r) => a.set(r)), a;
  }
  static accessor(t) {
    const a = (this[Hc] = this[Hc] = {
      accessors: {}
    }).accessors, r = this.prototype;
    function s(i) {
      const o = In(i);
      a[o] || (rE(r, i), a[o] = !0);
    }
    return b.isArray(t) ? t.forEach(s) : s(t), this;
  }
};
be.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
b.reduceDescriptors(be.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(a) {
      this[n] = a;
    }
  };
});
b.freezeMethods(be);
const sE = "[REDACTED ****]";
function iE(e) {
  if (b.hasOwnProp(e, "toJSON"))
    return !0;
  let t = Object.getPrototypeOf(e);
  for (; t && t !== Object.prototype; ) {
    if (b.hasOwnProp(t, "toJSON"))
      return !0;
    t = Object.getPrototypeOf(t);
  }
  return !1;
}
function oE(e, t) {
  const n = new Set(t.map((s) => String(s).toLowerCase())), a = [], r = (s) => {
    if (s === null || typeof s != "object" || b.isBuffer(s)) return s;
    if (a.indexOf(s) !== -1) return;
    s instanceof be && (s = s.toJSON()), a.push(s);
    let i;
    if (b.isArray(s))
      i = [], s.forEach((o, l) => {
        const u = r(o);
        b.isUndefined(u) || (i[l] = u);
      });
    else {
      if (!b.isPlainObject(s) && iE(s))
        return a.pop(), s;
      i = /* @__PURE__ */ Object.create(null);
      for (const [o, l] of Object.entries(s)) {
        const u = n.has(o.toLowerCase()) ? sE : r(l);
        b.isUndefined(u) || (i[o] = u);
      }
    }
    return a.pop(), i;
  };
  return r(e);
}
let N = class Cp extends Error {
  static from(t, n, a, r, s, i) {
    const o = new Cp(t.message, n || t.code, a, r, s);
    return o.cause = t, o.name = t.name, t.status != null && o.status == null && (o.status = t.status), i && Object.assign(o, i), o;
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
  constructor(t, n, a, r, s) {
    super(t), Object.defineProperty(this, "message", {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, n && (this.code = n), a && (this.config = a), r && (this.request = r), s && (this.response = s, this.status = s.status);
  }
  toJSON() {
    const t = this.config, n = t && b.hasOwnProp(t, "redact") ? t.redact : void 0, a = b.isArray(n) && n.length > 0 ? oE(t, n) : b.toJSONObject(t);
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
      config: a,
      code: this.code,
      status: this.status
    };
  }
};
N.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
N.ERR_BAD_OPTION = "ERR_BAD_OPTION";
N.ECONNABORTED = "ECONNABORTED";
N.ETIMEDOUT = "ETIMEDOUT";
N.ECONNREFUSED = "ECONNREFUSED";
N.ERR_NETWORK = "ERR_NETWORK";
N.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
N.ERR_DEPRECATED = "ERR_DEPRECATED";
N.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
N.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
N.ERR_CANCELED = "ERR_CANCELED";
N.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
N.ERR_INVALID_URL = "ERR_INVALID_URL";
N.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
var Lp = Ee.Stream, cE = Wt, lE = Qe;
function Qe() {
  this.source = null, this.dataSize = 0, this.maxDataSize = 1024 * 1024, this.pauseStream = !0, this._maxDataSizeExceeded = !1, this._released = !1, this._bufferedEvents = [];
}
cE.inherits(Qe, Lp);
Qe.create = function(e, t) {
  var n = new this();
  t = t || {};
  for (var a in t)
    n[a] = t[a];
  n.source = e;
  var r = e.emit;
  return e.emit = function() {
    return n._handleEmit(arguments), r.apply(e, arguments);
  }, e.on("error", function() {
  }), n.pauseStream && e.pause(), n;
};
Object.defineProperty(Qe.prototype, "readable", {
  configurable: !0,
  enumerable: !0,
  get: function() {
    return this.source.readable;
  }
});
Qe.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};
Qe.prototype.resume = function() {
  this._released || this.release(), this.source.resume();
};
Qe.prototype.pause = function() {
  this.source.pause();
};
Qe.prototype.release = function() {
  this._released = !0, this._bufferedEvents.forEach((function(e) {
    this.emit.apply(this, e);
  }).bind(this)), this._bufferedEvents = [];
};
Qe.prototype.pipe = function() {
  var e = Lp.prototype.pipe.apply(this, arguments);
  return this.resume(), e;
};
Qe.prototype._handleEmit = function(e) {
  if (this._released) {
    this.emit.apply(this, e);
    return;
  }
  e[0] === "data" && (this.dataSize += e[1].length, this._checkIfMaxDataSizeExceeded()), this._bufferedEvents.push(e);
};
Qe.prototype._checkIfMaxDataSizeExceeded = function() {
  if (!this._maxDataSizeExceeded && !(this.dataSize <= this.maxDataSize)) {
    this._maxDataSizeExceeded = !0;
    var e = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this.emit("error", new Error(e));
  }
};
var uE = Wt, Dp = Ee.Stream, Gc = lE, pE = fe;
function fe() {
  this.writable = !1, this.readable = !0, this.dataSize = 0, this.maxDataSize = 2 * 1024 * 1024, this.pauseStreams = !0, this._released = !1, this._streams = [], this._currentStream = null, this._insideLoop = !1, this._pendingNext = !1;
}
uE.inherits(fe, Dp);
fe.create = function(e) {
  var t = new this();
  e = e || {};
  for (var n in e)
    t[n] = e[n];
  return t;
};
fe.isStreamLike = function(e) {
  return typeof e != "function" && typeof e != "string" && typeof e != "boolean" && typeof e != "number" && !Buffer.isBuffer(e);
};
fe.prototype.append = function(e) {
  var t = fe.isStreamLike(e);
  if (t) {
    if (!(e instanceof Gc)) {
      var n = Gc.create(e, {
        maxDataSize: 1 / 0,
        pauseStream: this.pauseStreams
      });
      e.on("data", this._checkDataSize.bind(this)), e = n;
    }
    this._handleErrors(e), this.pauseStreams && e.pause();
  }
  return this._streams.push(e), this;
};
fe.prototype.pipe = function(e, t) {
  return Dp.prototype.pipe.call(this, e, t), this.resume(), e;
};
fe.prototype._getNext = function() {
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
fe.prototype._realGetNext = function() {
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
    var a = fe.isStreamLike(n);
    a && (n.on("data", this._checkDataSize.bind(this)), this._handleErrors(n)), this._pipeNext(n);
  }).bind(this));
};
fe.prototype._pipeNext = function(e) {
  this._currentStream = e;
  var t = fe.isStreamLike(e);
  if (t) {
    e.on("end", this._getNext.bind(this)), e.pipe(this, { end: !1 });
    return;
  }
  var n = e;
  this.write(n), this._getNext();
};
fe.prototype._handleErrors = function(e) {
  var t = this;
  e.on("error", function(n) {
    t._emitError(n);
  });
};
fe.prototype.write = function(e) {
  this.emit("data", e);
};
fe.prototype.pause = function() {
  this.pauseStreams && (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function" && this._currentStream.pause(), this.emit("pause"));
};
fe.prototype.resume = function() {
  this._released || (this._released = !0, this.writable = !0, this._getNext()), this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function" && this._currentStream.resume(), this.emit("resume");
};
fe.prototype.end = function() {
  this._reset(), this.emit("end");
};
fe.prototype.destroy = function() {
  this._reset(), this.emit("close");
};
fe.prototype._reset = function() {
  this.writable = !1, this._streams = [], this._currentStream = null;
};
fe.prototype._checkDataSize = function() {
  if (this._updateDataSize(), !(this.dataSize <= this.maxDataSize)) {
    var e = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
    this._emitError(new Error(e));
  }
};
fe.prototype._updateDataSize = function() {
  this.dataSize = 0;
  var e = this;
  this._streams.forEach(function(t) {
    t.dataSize && (e.dataSize += t.dataSize);
  }), this._currentStream && this._currentStream.dataSize && (this.dataSize += this._currentStream.dataSize);
};
fe.prototype._emitError = function(e) {
  this._reset(), this.emit("error", e);
};
var Fp = {};
const dE = {
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
var fE = dE;
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
(function(e) {
  var t = fE, n = Wl.extname, a = /^\s*([^;\s]*)(?:;|\s|$)/, r = /^text\//i;
  e.charset = s, e.charsets = { lookup: s }, e.contentType = i, e.extension = o, e.extensions = /* @__PURE__ */ Object.create(null), e.lookup = l, e.types = /* @__PURE__ */ Object.create(null), u(e.extensions, e.types);
  function s(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = a.exec(c), d = p && t[p[1].toLowerCase()];
    return d && d.charset ? d.charset : p && r.test(p[1]) ? "UTF-8" : !1;
  }
  function i(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = c.indexOf("/") === -1 ? e.lookup(c) : c;
    if (!p)
      return !1;
    if (p.indexOf("charset") === -1) {
      var d = e.charset(p);
      d && (p += "; charset=" + d.toLowerCase());
    }
    return p;
  }
  function o(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = a.exec(c), d = p && e.extensions[p[1].toLowerCase()];
    return !d || !d.length ? !1 : d[0];
  }
  function l(c) {
    if (!c || typeof c != "string")
      return !1;
    var p = n("x." + c).toLowerCase().substr(1);
    return p && e.types[p] || !1;
  }
  function u(c, p) {
    var d = ["nginx", "apache", void 0, "iana"];
    Object.keys(t).forEach(function(g) {
      var v = t[g], y = v.extensions;
      if (!(!y || !y.length)) {
        c[g] = y;
        for (var m = 0; m < y.length; m++) {
          var $ = y[m];
          if (p[$]) {
            var S = d.indexOf(t[p[$]].source), T = d.indexOf(v.source);
            if (p[$] !== "application/octet-stream" && (S > T || S === T && p[$].substr(0, 12) === "application/"))
              continue;
          }
          p[$] = g;
        }
      }
    });
  }
})(Fp);
var mE = hE;
function hE(e) {
  var t = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
  t ? t(e) : setTimeout(e, 0);
}
var Kc = mE, Up = vE;
function vE(e) {
  var t = !1;
  return Kc(function() {
    t = !0;
  }), function(a, r) {
    t ? e(a, r) : Kc(function() {
      e(a, r);
    });
  };
}
var zp = yE;
function yE(e) {
  Object.keys(e.jobs).forEach(gE.bind(e)), e.jobs = {};
}
function gE(e) {
  typeof this.jobs[e] == "function" && this.jobs[e]();
}
var Wc = Up, xE = zp, Mp = bE;
function bE(e, t, n, a) {
  var r = n.keyedList ? n.keyedList[n.index] : n.index;
  n.jobs[r] = $E(t, r, e[r], function(s, i) {
    r in n.jobs && (delete n.jobs[r], s ? xE(n) : n.results[r] = i, a(s, n.results));
  });
}
function $E(e, t, n, a) {
  var r;
  return e.length == 2 ? r = e(n, Wc(a)) : r = e(n, t, Wc(a)), r;
}
var qp = wE;
function wE(e, t) {
  var n = !Array.isArray(e), a = {
    index: 0,
    keyedList: n || t ? Object.keys(e) : null,
    jobs: {},
    results: n ? {} : [],
    size: n ? Object.keys(e).length : e.length
  };
  return t && a.keyedList.sort(n ? t : function(r, s) {
    return t(e[r], e[s]);
  }), a;
}
var _E = zp, EE = Up, Bp = SE;
function SE(e) {
  Object.keys(this.jobs).length && (this.index = this.size, _E(this), EE(e)(null, this.results));
}
var RE = Mp, PE = qp, OE = Bp, TE = AE;
function AE(e, t, n) {
  for (var a = PE(e); a.index < (a.keyedList || e).length; )
    RE(e, t, a, function(r, s) {
      if (r) {
        n(r, s);
        return;
      }
      if (Object.keys(a.jobs).length === 0) {
        n(null, a.results);
        return;
      }
    }), a.index++;
  return OE.bind(a, n);
}
var br = { exports: {} }, Xc = Mp, jE = qp, kE = Bp;
br.exports = NE;
br.exports.ascending = Vp;
br.exports.descending = IE;
function NE(e, t, n, a) {
  var r = jE(e, n);
  return Xc(e, t, r, function s(i, o) {
    if (i) {
      a(i, o);
      return;
    }
    if (r.index++, r.index < (r.keyedList || e).length) {
      Xc(e, t, r, s);
      return;
    }
    a(null, r.results);
  }), kE.bind(r, a);
}
function Vp(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
function IE(e, t) {
  return -1 * Vp(e, t);
}
var Hp = br.exports, CE = Hp, LE = DE;
function DE(e, t, n) {
  return CE(e, t, null, n);
}
var FE = {
  parallel: TE,
  serial: LE,
  serialOrdered: Hp
}, Gp = Object, UE = Error, zE = EvalError, ME = RangeError, qE = ReferenceError, BE = SyntaxError, fo = TypeError, VE = URIError, HE = Math.abs, GE = Math.floor, KE = Math.max, WE = Math.min, XE = Math.pow, JE = Math.round, YE = Number.isNaN || function(t) {
  return t !== t;
}, QE = YE, ZE = function(t) {
  return QE(t) || t === 0 ? t : t < 0 ? -1 : 1;
}, eS = Object.getOwnPropertyDescriptor, Fa = eS;
if (Fa)
  try {
    Fa([], "length");
  } catch {
    Fa = null;
  }
var Kp = Fa, Ua = Object.defineProperty || !1;
if (Ua)
  try {
    Ua({}, "a", { value: 1 });
  } catch {
    Ua = !1;
  }
var tS = Ua, ts, Jc;
function Wp() {
  return Jc || (Jc = 1, ts = function() {
    if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
      return !1;
    if (typeof Symbol.iterator == "symbol")
      return !0;
    var t = {}, n = Symbol("test"), a = Object(n);
    if (typeof n == "string" || Object.prototype.toString.call(n) !== "[object Symbol]" || Object.prototype.toString.call(a) !== "[object Symbol]")
      return !1;
    var r = 42;
    t[n] = r;
    for (var s in t)
      return !1;
    if (typeof Object.keys == "function" && Object.keys(t).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(t).length !== 0)
      return !1;
    var i = Object.getOwnPropertySymbols(t);
    if (i.length !== 1 || i[0] !== n || !Object.prototype.propertyIsEnumerable.call(t, n))
      return !1;
    if (typeof Object.getOwnPropertyDescriptor == "function") {
      var o = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(t, n)
      );
      if (o.value !== r || o.enumerable !== !0)
        return !1;
    }
    return !0;
  }), ts;
}
var ns, Yc;
function nS() {
  if (Yc) return ns;
  Yc = 1;
  var e = typeof Symbol < "u" && Symbol, t = Wp();
  return ns = function() {
    return typeof e != "function" || typeof Symbol != "function" || typeof e("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : t();
  }, ns;
}
var as, Qc;
function Xp() {
  return Qc || (Qc = 1, as = typeof Reflect < "u" && Reflect.getPrototypeOf || null), as;
}
var rs, Zc;
function Jp() {
  if (Zc) return rs;
  Zc = 1;
  var e = Gp;
  return rs = e.getPrototypeOf || null, rs;
}
var aS = "Function.prototype.bind called on incompatible ", rS = Object.prototype.toString, sS = Math.max, iS = "[object Function]", el = function(t, n) {
  for (var a = [], r = 0; r < t.length; r += 1)
    a[r] = t[r];
  for (var s = 0; s < n.length; s += 1)
    a[s + t.length] = n[s];
  return a;
}, oS = function(t, n) {
  for (var a = [], r = n, s = 0; r < t.length; r += 1, s += 1)
    a[s] = t[r];
  return a;
}, cS = function(e, t) {
  for (var n = "", a = 0; a < e.length; a += 1)
    n += e[a], a + 1 < e.length && (n += t);
  return n;
}, lS = function(t) {
  var n = this;
  if (typeof n != "function" || rS.apply(n) !== iS)
    throw new TypeError(aS + n);
  for (var a = oS(arguments, 1), r, s = function() {
    if (this instanceof r) {
      var c = n.apply(
        this,
        el(a, arguments)
      );
      return Object(c) === c ? c : this;
    }
    return n.apply(
      t,
      el(a, arguments)
    );
  }, i = sS(0, n.length - a.length), o = [], l = 0; l < i; l++)
    o[l] = "$" + l;
  if (r = Function("binder", "return function (" + cS(o, ",") + "){ return binder.apply(this,arguments); }")(s), n.prototype) {
    var u = function() {
    };
    u.prototype = n.prototype, r.prototype = new u(), u.prototype = null;
  }
  return r;
}, uS = lS, $r = Function.prototype.bind || uS, ss, tl;
function mo() {
  return tl || (tl = 1, ss = Function.prototype.call), ss;
}
var is, nl;
function Yp() {
  return nl || (nl = 1, is = Function.prototype.apply), is;
}
var os, al;
function pS() {
  return al || (al = 1, os = typeof Reflect < "u" && Reflect && Reflect.apply), os;
}
var cs, rl;
function dS() {
  if (rl) return cs;
  rl = 1;
  var e = $r, t = Yp(), n = mo(), a = pS();
  return cs = a || e.call(n, t), cs;
}
var ls, sl;
function fS() {
  if (sl) return ls;
  sl = 1;
  var e = $r, t = fo, n = mo(), a = dS();
  return ls = function(s) {
    if (s.length < 1 || typeof s[0] != "function")
      throw new t("a function is required");
    return a(e, n, s);
  }, ls;
}
var us, il;
function mS() {
  if (il) return us;
  il = 1;
  var e = fS(), t = Kp, n;
  try {
    n = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (i) {
    if (!i || typeof i != "object" || !("code" in i) || i.code !== "ERR_PROTO_ACCESS")
      throw i;
  }
  var a = !!n && t && t(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  ), r = Object, s = r.getPrototypeOf;
  return us = a && typeof a.get == "function" ? e([a.get]) : typeof s == "function" ? (
    /** @type {import('./get')} */
    function(o) {
      return s(o == null ? o : r(o));
    }
  ) : !1, us;
}
var ps, ol;
function hS() {
  if (ol) return ps;
  ol = 1;
  var e = Xp(), t = Jp(), n = mS();
  return ps = e ? function(r) {
    return e(r);
  } : t ? function(r) {
    if (!r || typeof r != "object" && typeof r != "function")
      throw new TypeError("getProto: not an object");
    return t(r);
  } : n ? function(r) {
    return n(r);
  } : null, ps;
}
var vS = Function.prototype.call, yS = Object.prototype.hasOwnProperty, gS = $r, ho = gS.call(vS, yS), ee, xS = Gp, bS = UE, $S = zE, wS = ME, _S = qE, yn = BE, dn = fo, ES = VE, SS = HE, RS = GE, PS = KE, OS = WE, TS = XE, AS = JE, jS = ZE, Qp = Function, ds = function(e) {
  try {
    return Qp('"use strict"; return (' + e + ").constructor;")();
  } catch {
  }
}, Kn = Kp, kS = tS, fs = function() {
  throw new dn();
}, NS = Kn ? function() {
  try {
    return arguments.callee, fs;
  } catch {
    try {
      return Kn(arguments, "callee").get;
    } catch {
      return fs;
    }
  }
}() : fs, tn = nS()(), ge = hS(), IS = Jp(), CS = Xp(), Zp = Yp(), sa = mo(), rn = {}, LS = typeof Uint8Array > "u" || !ge ? ee : ge(Uint8Array), Ft = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError > "u" ? ee : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? ee : ArrayBuffer,
  "%ArrayIteratorPrototype%": tn && ge ? ge([][Symbol.iterator]()) : ee,
  "%AsyncFromSyncIteratorPrototype%": ee,
  "%AsyncFunction%": rn,
  "%AsyncGenerator%": rn,
  "%AsyncGeneratorFunction%": rn,
  "%AsyncIteratorPrototype%": rn,
  "%Atomics%": typeof Atomics > "u" ? ee : Atomics,
  "%BigInt%": typeof BigInt > "u" ? ee : BigInt,
  "%BigInt64Array%": typeof BigInt64Array > "u" ? ee : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array > "u" ? ee : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView > "u" ? ee : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": bS,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $S,
  "%Float16Array%": typeof Float16Array > "u" ? ee : Float16Array,
  "%Float32Array%": typeof Float32Array > "u" ? ee : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? ee : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? ee : FinalizationRegistry,
  "%Function%": Qp,
  "%GeneratorFunction%": rn,
  "%Int8Array%": typeof Int8Array > "u" ? ee : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? ee : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? ee : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": tn && ge ? ge(ge([][Symbol.iterator]())) : ee,
  "%JSON%": typeof JSON == "object" ? JSON : ee,
  "%Map%": typeof Map > "u" ? ee : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !tn || !ge ? ee : ge((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": xS,
  "%Object.getOwnPropertyDescriptor%": Kn,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? ee : Promise,
  "%Proxy%": typeof Proxy > "u" ? ee : Proxy,
  "%RangeError%": wS,
  "%ReferenceError%": _S,
  "%Reflect%": typeof Reflect > "u" ? ee : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? ee : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !tn || !ge ? ee : ge((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? ee : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": tn && ge ? ge(""[Symbol.iterator]()) : ee,
  "%Symbol%": tn ? Symbol : ee,
  "%SyntaxError%": yn,
  "%ThrowTypeError%": NS,
  "%TypedArray%": LS,
  "%TypeError%": dn,
  "%Uint8Array%": typeof Uint8Array > "u" ? ee : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? ee : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? ee : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? ee : Uint32Array,
  "%URIError%": ES,
  "%WeakMap%": typeof WeakMap > "u" ? ee : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? ee : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? ee : WeakSet,
  "%Function.prototype.call%": sa,
  "%Function.prototype.apply%": Zp,
  "%Object.defineProperty%": kS,
  "%Object.getPrototypeOf%": IS,
  "%Math.abs%": SS,
  "%Math.floor%": RS,
  "%Math.max%": PS,
  "%Math.min%": OS,
  "%Math.pow%": TS,
  "%Math.round%": AS,
  "%Math.sign%": jS,
  "%Reflect.getPrototypeOf%": CS
};
if (ge)
  try {
    null.error;
  } catch (e) {
    var DS = ge(ge(e));
    Ft["%Error.prototype%"] = DS;
  }
var FS = function e(t) {
  var n;
  if (t === "%AsyncFunction%")
    n = ds("async function () {}");
  else if (t === "%GeneratorFunction%")
    n = ds("function* () {}");
  else if (t === "%AsyncGeneratorFunction%")
    n = ds("async function* () {}");
  else if (t === "%AsyncGenerator%") {
    var a = e("%AsyncGeneratorFunction%");
    a && (n = a.prototype);
  } else if (t === "%AsyncIteratorPrototype%") {
    var r = e("%AsyncGenerator%");
    r && ge && (n = ge(r.prototype));
  }
  return Ft[t] = n, n;
}, cl = {
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
}, ia = $r, Ga = ho, US = ia.call(sa, Array.prototype.concat), zS = ia.call(Zp, Array.prototype.splice), ll = ia.call(sa, String.prototype.replace), Ka = ia.call(sa, String.prototype.slice), MS = ia.call(sa, RegExp.prototype.exec), qS = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, BS = /\\(\\)?/g, VS = function(t) {
  var n = Ka(t, 0, 1), a = Ka(t, -1);
  if (n === "%" && a !== "%")
    throw new yn("invalid intrinsic syntax, expected closing `%`");
  if (a === "%" && n !== "%")
    throw new yn("invalid intrinsic syntax, expected opening `%`");
  var r = [];
  return ll(t, qS, function(s, i, o, l) {
    r[r.length] = o ? ll(l, BS, "$1") : i || s;
  }), r;
}, HS = function(t, n) {
  var a = t, r;
  if (Ga(cl, a) && (r = cl[a], a = "%" + r[0] + "%"), Ga(Ft, a)) {
    var s = Ft[a];
    if (s === rn && (s = FS(a)), typeof s > "u" && !n)
      throw new dn("intrinsic " + t + " exists, but is not available. Please file an issue!");
    return {
      alias: r,
      name: a,
      value: s
    };
  }
  throw new yn("intrinsic " + t + " does not exist!");
}, GS = function(t, n) {
  if (typeof t != "string" || t.length === 0)
    throw new dn("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof n != "boolean")
    throw new dn('"allowMissing" argument must be a boolean');
  if (MS(/^%?[^%]*%?$/, t) === null)
    throw new yn("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var a = VS(t), r = a.length > 0 ? a[0] : "", s = HS("%" + r + "%", n), i = s.name, o = s.value, l = !1, u = s.alias;
  u && (r = u[0], zS(a, US([0, 1], u)));
  for (var c = 1, p = !0; c < a.length; c += 1) {
    var d = a[c], f = Ka(d, 0, 1), g = Ka(d, -1);
    if ((f === '"' || f === "'" || f === "`" || g === '"' || g === "'" || g === "`") && f !== g)
      throw new yn("property names with quotes must have matching quotes");
    if ((d === "constructor" || !p) && (l = !0), r += "." + d, i = "%" + r + "%", Ga(Ft, i))
      o = Ft[i];
    else if (o != null) {
      if (!(d in o)) {
        if (!n)
          throw new dn("base intrinsic for " + t + " exists, but the property is not available.");
        return;
      }
      if (Kn && c + 1 >= a.length) {
        var v = Kn(o, d);
        p = !!v, p && "get" in v && !("originalValue" in v.get) ? o = v.get : o = o[d];
      } else
        p = Ga(o, d), o = o[d];
      p && !l && (Ft[i] = o);
    }
  }
  return o;
}, ms, ul;
function KS() {
  if (ul) return ms;
  ul = 1;
  var e = Wp();
  return ms = function() {
    return e() && !!Symbol.toStringTag;
  }, ms;
}
var WS = GS, pl = WS("%Object.defineProperty%", !0), XS = KS()(), JS = ho, YS = fo, Sa = XS ? Symbol.toStringTag : null, QS = function(t, n) {
  var a = arguments.length > 2 && !!arguments[2] && arguments[2].force, r = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
  if (typeof a < "u" && typeof a != "boolean" || typeof r < "u" && typeof r != "boolean")
    throw new YS("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
  Sa && (a || !JS(t, Sa)) && (pl ? pl(t, Sa, {
    configurable: !r,
    enumerable: !1,
    value: n,
    writable: !1
  }) : t[Sa] = n);
}, ZS = function(e, t) {
  return Object.keys(t).forEach(function(n) {
    e[n] = e[n] || t[n];
  }), e;
}, vo = pE, e1 = Wt, hs = Wl, t1 = Zs, n1 = ei, a1 = Ya.parse, r1 = Dd, s1 = Ee.Stream, i1 = Xl, vs = Fp, o1 = FE, c1 = QS, Rt = ho, qs = ZS;
function ae(e) {
  if (!(this instanceof ae))
    return new ae(e);
  this._overheadLength = 0, this._valueLength = 0, this._valuesToMeasure = [], vo.call(this), e = e || {};
  for (var t in e)
    this[t] = e[t];
}
e1.inherits(ae, vo);
ae.LINE_BREAK = `\r
`;
ae.DEFAULT_CONTENT_TYPE = "application/octet-stream";
ae.prototype.append = function(e, t, n) {
  n = n || {}, typeof n == "string" && (n = { filename: n });
  var a = vo.prototype.append.bind(this);
  if ((typeof t == "number" || t == null) && (t = String(t)), Array.isArray(t)) {
    this._error(new Error("Arrays are not supported."));
    return;
  }
  var r = this._multiPartHeader(e, t, n), s = this._multiPartFooter();
  a(r), a(t), a(s), this._trackLength(r, t, n);
};
ae.prototype._trackLength = function(e, t, n) {
  var a = 0;
  n.knownLength != null ? a += Number(n.knownLength) : Buffer.isBuffer(t) ? a = t.length : typeof t == "string" && (a = Buffer.byteLength(t)), this._valueLength += a, this._overheadLength += Buffer.byteLength(e) + ae.LINE_BREAK.length, !(!t || !t.path && !(t.readable && Rt(t, "httpVersion")) && !(t instanceof s1)) && (n.knownLength || this._valuesToMeasure.push(t));
};
ae.prototype._lengthRetriever = function(e, t) {
  Rt(e, "fd") ? e.end != null && e.end != 1 / 0 && e.start != null ? t(null, e.end + 1 - (e.start ? e.start : 0)) : r1.stat(e.path, function(n, a) {
    if (n) {
      t(n);
      return;
    }
    var r = a.size - (e.start ? e.start : 0);
    t(null, r);
  }) : Rt(e, "httpVersion") ? t(null, Number(e.headers["content-length"])) : Rt(e, "httpModule") ? (e.on("response", function(n) {
    e.pause(), t(null, Number(n.headers["content-length"]));
  }), e.resume()) : t("Unknown stream");
};
ae.prototype._multiPartHeader = function(e, t, n) {
  if (typeof n.header == "string")
    return n.header;
  var a = this._getContentDisposition(t, n), r = this._getContentType(t, n), s = "", i = {
    // add custom disposition as third element or keep it two elements if not
    "Content-Disposition": ["form-data", 'name="' + e + '"'].concat(a || []),
    // if no content type. allow it to be empty array
    "Content-Type": [].concat(r || [])
  };
  typeof n.header == "object" && qs(i, n.header);
  var o;
  for (var l in i)
    if (Rt(i, l)) {
      if (o = i[l], o == null)
        continue;
      Array.isArray(o) || (o = [o]), o.length && (s += l + ": " + o.join("; ") + ae.LINE_BREAK);
    }
  return "--" + this.getBoundary() + ae.LINE_BREAK + s + ae.LINE_BREAK;
};
ae.prototype._getContentDisposition = function(e, t) {
  var n;
  if (typeof t.filepath == "string" ? n = hs.normalize(t.filepath).replace(/\\/g, "/") : t.filename || e && (e.name || e.path) ? n = hs.basename(t.filename || e && (e.name || e.path)) : e && e.readable && Rt(e, "httpVersion") && (n = hs.basename(e.client._httpMessage.path || "")), n)
    return 'filename="' + n + '"';
};
ae.prototype._getContentType = function(e, t) {
  var n = t.contentType;
  return !n && e && e.name && (n = vs.lookup(e.name)), !n && e && e.path && (n = vs.lookup(e.path)), !n && e && e.readable && Rt(e, "httpVersion") && (n = e.headers["content-type"]), !n && (t.filepath || t.filename) && (n = vs.lookup(t.filepath || t.filename)), !n && e && typeof e == "object" && (n = ae.DEFAULT_CONTENT_TYPE), n;
};
ae.prototype._multiPartFooter = function() {
  return (function(e) {
    var t = ae.LINE_BREAK, n = this._streams.length === 0;
    n && (t += this._lastBoundary()), e(t);
  }).bind(this);
};
ae.prototype._lastBoundary = function() {
  return "--" + this.getBoundary() + "--" + ae.LINE_BREAK;
};
ae.prototype.getHeaders = function(e) {
  var t, n = {
    "content-type": "multipart/form-data; boundary=" + this.getBoundary()
  };
  for (t in e)
    Rt(e, t) && (n[t.toLowerCase()] = e[t]);
  return n;
};
ae.prototype.setBoundary = function(e) {
  if (typeof e != "string")
    throw new TypeError("FormData boundary must be a string");
  this._boundary = e;
};
ae.prototype.getBoundary = function() {
  return this._boundary || this._generateBoundary(), this._boundary;
};
ae.prototype.getBuffer = function() {
  for (var e = new Buffer.alloc(0), t = this.getBoundary(), n = 0, a = this._streams.length; n < a; n++)
    typeof this._streams[n] != "function" && (Buffer.isBuffer(this._streams[n]) ? e = Buffer.concat([e, this._streams[n]]) : e = Buffer.concat([e, Buffer.from(this._streams[n])]), (typeof this._streams[n] != "string" || this._streams[n].substring(2, t.length + 2) !== t) && (e = Buffer.concat([e, Buffer.from(ae.LINE_BREAK)])));
  return Buffer.concat([e, Buffer.from(this._lastBoundary())]);
};
ae.prototype._generateBoundary = function() {
  this._boundary = "--------------------------" + i1.randomBytes(12).toString("hex");
};
ae.prototype.getLengthSync = function() {
  var e = this._overheadLength + this._valueLength;
  return this._streams.length && (e += this._lastBoundary().length), this.hasKnownLength() || this._error(new Error("Cannot calculate proper length in synchronous way.")), e;
};
ae.prototype.hasKnownLength = function() {
  var e = !0;
  return this._valuesToMeasure.length && (e = !1), e;
};
ae.prototype.getLength = function(e) {
  var t = this._overheadLength + this._valueLength;
  if (this._streams.length && (t += this._lastBoundary().length), !this._valuesToMeasure.length) {
    process.nextTick(e.bind(this, null, t));
    return;
  }
  o1.parallel(this._valuesToMeasure, this._lengthRetriever, function(n, a) {
    if (n) {
      e(n);
      return;
    }
    a.forEach(function(r) {
      t += r;
    }), e(null, t);
  });
};
ae.prototype.submit = function(e, t) {
  var n, a, r = { method: "post" };
  return typeof e == "string" ? (e = a1(e), a = qs({
    port: e.port,
    path: e.pathname,
    host: e.hostname,
    protocol: e.protocol
  }, r)) : (a = qs(e, r), a.port || (a.port = a.protocol === "https:" ? 443 : 80)), a.headers = this.getHeaders(e.headers), a.protocol === "https:" ? n = n1.request(a) : n = t1.request(a), this.getLength((function(s, i) {
    if (s && s !== "Unknown stream") {
      this._error(s);
      return;
    }
    if (i && n.setHeader("Content-Length", i), this.pipe(n), t) {
      var o, l = function(u, c) {
        return n.removeListener("error", l), n.removeListener("response", o), t.call(this, u, c);
      };
      o = l.bind(this, null), n.on("error", l), n.on("response", o);
    }
  }).bind(this)), n;
};
ae.prototype._error = function(e) {
  this.error || (this.error = e, this.pause(), this.emit("error", e));
};
ae.prototype.toString = function() {
  return "[object FormData]";
};
c1(ae.prototype, "FormData");
var l1 = ae;
const ed = /* @__PURE__ */ Yn(l1);
function Bs(e) {
  return b.isPlainObject(e) || b.isArray(e);
}
function td(e) {
  return b.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function ys(e, t, n) {
  return e ? e.concat(t).map(function(r, s) {
    return r = td(r), !n && s ? "[" + r + "]" : r;
  }).join(n ? "." : "") : t;
}
function u1(e) {
  return b.isArray(e) && !e.some(Bs);
}
const p1 = b.toFlatObject(b, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function wr(e, t, n) {
  if (!b.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new (ed || FormData)(), n = b.toFlatObject(
    n,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(y, m) {
      return !b.isUndefined(m[y]);
    }
  );
  const a = n.metaTokens, r = n.visitor || p, s = n.dots, i = n.indexes, o = n.Blob || typeof Blob < "u" && Blob, l = n.maxDepth === void 0 ? 100 : n.maxDepth, u = o && b.isSpecCompliantForm(t);
  if (!b.isFunction(r))
    throw new TypeError("visitor must be a function");
  function c(v) {
    if (v === null) return "";
    if (b.isDate(v))
      return v.toISOString();
    if (b.isBoolean(v))
      return v.toString();
    if (!u && b.isBlob(v))
      throw new N("Blob is not supported. Use a Buffer instead.");
    return b.isArrayBuffer(v) || b.isTypedArray(v) ? u && typeof Blob == "function" ? new Blob([v]) : Buffer.from(v) : v;
  }
  function p(v, y, m) {
    let $ = v;
    if (b.isReactNative(t) && b.isReactNativeBlob(v))
      return t.append(ys(m, y, s), c(v)), !1;
    if (v && !m && typeof v == "object") {
      if (b.endsWith(y, "{}"))
        y = a ? y : y.slice(0, -2), v = JSON.stringify(v);
      else if (b.isArray(v) && u1(v) || (b.isFileList(v) || b.endsWith(y, "[]")) && ($ = b.toArray(v)))
        return y = td(y), $.forEach(function(T, I) {
          !(b.isUndefined(T) || T === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            i === !0 ? ys([y], I, s) : i === null ? y : y + "[]",
            c(T)
          );
        }), !1;
    }
    return Bs(v) ? !0 : (t.append(ys(m, y, s), c(v)), !1);
  }
  const d = [], f = Object.assign(p1, {
    defaultVisitor: p,
    convertValue: c,
    isVisitable: Bs
  });
  function g(v, y, m = 0) {
    if (!b.isUndefined(v)) {
      if (m > l)
        throw new N(
          "Object is too deeply nested (" + m + " levels). Max depth: " + l,
          N.ERR_FORM_DATA_DEPTH_EXCEEDED
        );
      if (d.indexOf(v) !== -1)
        throw Error("Circular reference detected in " + y.join("."));
      d.push(v), b.forEach(v, function(S, T) {
        (!(b.isUndefined(S) || S === null) && r.call(t, S, b.isString(T) ? T.trim() : T, y, f)) === !0 && g(S, y ? y.concat(T) : [T], m + 1);
      }), d.pop();
    }
  }
  if (!b.isObject(e))
    throw new TypeError("data must be an object");
  return g(e), t;
}
function dl(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(a) {
    return t[a];
  });
}
function nd(e, t) {
  this._pairs = [], e && wr(e, this, t);
}
const ad = nd.prototype;
ad.append = function(t, n) {
  this._pairs.push([t, n]);
};
ad.toString = function(t) {
  const n = t ? function(a) {
    return t.call(this, a, dl);
  } : dl;
  return this._pairs.map(function(r) {
    return n(r[0]) + "=" + n(r[1]);
  }, "").join("&");
};
function d1(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function yo(e, t, n) {
  if (!t)
    return e;
  const a = n && n.encode || d1, r = b.isFunction(n) ? {
    serialize: n
  } : n, s = r && r.serialize;
  let i;
  if (s ? i = s(t, r) : i = b.isURLSearchParams(t) ? t.toString() : new nd(t, r).toString(a), i) {
    const o = e.indexOf("#");
    o !== -1 && (e = e.slice(0, o)), e += (e.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return e;
}
class fl {
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
  use(t, n, a) {
    return this.handlers.push({
      fulfilled: t,
      rejected: n,
      synchronous: a ? a.synchronous : !1,
      runWhen: a ? a.runWhen : null
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
    b.forEach(this.handlers, function(a) {
      a !== null && t(a);
    });
  }
}
const _r = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0
}, f1 = Ya.URLSearchParams, gs = "abcdefghijklmnopqrstuvwxyz", ml = "0123456789", rd = {
  DIGIT: ml,
  ALPHA: gs,
  ALPHA_DIGIT: gs + gs.toUpperCase() + ml
}, m1 = (e = 16, t = rd.ALPHA_DIGIT) => {
  let n = "";
  const { length: a } = t, r = new Uint32Array(e);
  Xl.randomFillSync(r);
  for (let s = 0; s < e; s++)
    n += t[r[s] % a];
  return n;
}, h1 = {
  isNode: !0,
  classes: {
    URLSearchParams: f1,
    FormData: ed,
    Blob: typeof Blob < "u" && Blob || null
  },
  ALPHABET: rd,
  generateString: m1,
  protocols: ["http", "https", "file", "data"]
}, go = typeof window < "u" && typeof document < "u", Vs = typeof navigator == "object" && navigator || void 0, v1 = go && (!Vs || ["ReactNative", "NativeScript", "NS"].indexOf(Vs.product) < 0), y1 = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", g1 = go && window.location.href || "http://localhost", x1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: go,
  hasStandardBrowserEnv: v1,
  hasStandardBrowserWebWorkerEnv: y1,
  navigator: Vs,
  origin: g1
}, Symbol.toStringTag, { value: "Module" })), de = {
  ...x1,
  ...h1
};
function b1(e, t) {
  return wr(e, new de.classes.URLSearchParams(), {
    visitor: function(n, a, r, s) {
      return de.isNode && b.isBuffer(n) ? (this.append(a, n.toString("base64")), !1) : s.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
function $1(e) {
  return b.matchAll(/\w+|\[(\w*)]/g, e).map((t) => t[0] === "[]" ? "" : t[1] || t[0]);
}
function w1(e) {
  const t = {}, n = Object.keys(e);
  let a;
  const r = n.length;
  let s;
  for (a = 0; a < r; a++)
    s = n[a], t[s] = e[s];
  return t;
}
function sd(e) {
  function t(n, a, r, s) {
    let i = n[s++];
    if (i === "__proto__") return !0;
    const o = Number.isFinite(+i), l = s >= n.length;
    return i = !i && b.isArray(r) ? r.length : i, l ? (b.hasOwnProp(r, i) ? r[i] = b.isArray(r[i]) ? r[i].concat(a) : [r[i], a] : r[i] = a, !o) : ((!b.hasOwnProp(r, i) || !b.isObject(r[i])) && (r[i] = []), t(n, a, r[i], s) && b.isArray(r[i]) && (r[i] = w1(r[i])), !o);
  }
  if (b.isFormData(e) && b.isFunction(e.entries)) {
    const n = {};
    return b.forEachEntry(e, (a, r) => {
      t($1(a), r, n, 0);
    }), n;
  }
  return null;
}
const nn = (e, t) => e != null && b.hasOwnProp(e, t) ? e[t] : void 0;
function _1(e, t, n) {
  if (b.isString(e))
    try {
      return (t || JSON.parse)(e), b.trim(e);
    } catch (a) {
      if (a.name !== "SyntaxError")
        throw a;
    }
  return (n || JSON.stringify)(e);
}
const oa = {
  transitional: _r,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, n) {
      const a = n.getContentType() || "", r = a.indexOf("application/json") > -1, s = b.isObject(t);
      if (s && b.isHTMLForm(t) && (t = new FormData(t)), b.isFormData(t))
        return r ? JSON.stringify(sd(t)) : t;
      if (b.isArrayBuffer(t) || b.isBuffer(t) || b.isStream(t) || b.isFile(t) || b.isBlob(t) || b.isReadableStream(t))
        return t;
      if (b.isArrayBufferView(t))
        return t.buffer;
      if (b.isURLSearchParams(t))
        return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let o;
      if (s) {
        const l = nn(this, "formSerializer");
        if (a.indexOf("application/x-www-form-urlencoded") > -1)
          return b1(t, l).toString();
        if ((o = b.isFileList(t)) || a.indexOf("multipart/form-data") > -1) {
          const u = nn(this, "env"), c = u && u.FormData;
          return wr(
            o ? { "files[]": t } : t,
            c && new c(),
            l
          );
        }
      }
      return s || r ? (n.setContentType("application/json", !1), _1(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const n = nn(this, "transitional") || oa.transitional, a = n && n.forcedJSONParsing, r = nn(this, "responseType"), s = r === "json";
      if (b.isResponse(t) || b.isReadableStream(t))
        return t;
      if (t && b.isString(t) && (a && !r || s)) {
        const o = !(n && n.silentJSONParsing) && s;
        try {
          return JSON.parse(t, nn(this, "parseReviver"));
        } catch (l) {
          if (o)
            throw l.name === "SyntaxError" ? N.from(l, N.ERR_BAD_RESPONSE, this, null, nn(this, "response")) : l;
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
    FormData: de.classes.FormData,
    Blob: de.classes.Blob
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
b.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (e) => {
  oa.headers[e] = {};
});
function xs(e, t) {
  const n = this || oa, a = t || n, r = be.from(a.headers);
  let s = a.data;
  return b.forEach(e, function(o) {
    s = o.call(n, s, r.normalize(), t ? t.status : void 0);
  }), r.normalize(), s;
}
function id(e) {
  return !!(e && e.__CANCEL__);
}
let Ht = class extends N {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(t, n, a) {
    super(t ?? "canceled", N.ERR_CANCELED, n, a), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
};
function ln(e, t, n) {
  const a = n.config.validateStatus;
  !n.status || !a || a(n.status) ? e(n) : t(new N(
    "Request failed with status code " + n.status,
    n.status >= 400 && n.status < 500 ? N.ERR_BAD_REQUEST : N.ERR_BAD_RESPONSE,
    n.config,
    n.request,
    n
  ));
}
function E1(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function S1(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function xo(e, t, n) {
  let a = !E1(t);
  return e && (a || n === !1) ? S1(e, t) : t;
}
var R1 = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
function P1(e) {
  try {
    return new URL(e);
  } catch {
    return null;
  }
}
function O1(e) {
  var t = (typeof e == "string" ? P1(e) : e) || {}, n = t.protocol, a = t.host, r = t.port;
  if (typeof a != "string" || !a || typeof n != "string" || (n = n.split(":", 1)[0], a = a.replace(/:\d*$/, ""), r = parseInt(r) || R1[n] || 0, !T1(a, r)))
    return "";
  var s = Hs(n + "_proxy") || Hs("all_proxy");
  return s && s.indexOf("://") === -1 && (s = n + "://" + s), s;
}
function T1(e, t) {
  var n = Hs("no_proxy").toLowerCase();
  return n ? n === "*" ? !1 : n.split(/[,\s]/).every(function(a) {
    if (!a)
      return !0;
    var r = a.match(/^(.+):(\d+)$/), s = r ? r[1] : a, i = r ? parseInt(r[2]) : 0;
    return i && i !== t ? !0 : /^[.*]/.test(s) ? (s.charAt(0) === "*" && (s = s.slice(1)), !e.endsWith(s)) : e !== s;
  }) : !0;
}
function Hs(e) {
  return process.env[e.toLowerCase()] || process.env[e.toUpperCase()] || "";
}
var bo = {}, Gs = { exports: {} }, Ra = { exports: {} }, bs, hl;
function A1() {
  if (hl) return bs;
  hl = 1;
  var e = 1e3, t = e * 60, n = t * 60, a = n * 24, r = a * 7, s = a * 365.25;
  bs = function(c, p) {
    p = p || {};
    var d = typeof c;
    if (d === "string" && c.length > 0)
      return i(c);
    if (d === "number" && isFinite(c))
      return p.long ? l(c) : o(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function i(c) {
    if (c = String(c), !(c.length > 100)) {
      var p = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (p) {
        var d = parseFloat(p[1]), f = (p[2] || "ms").toLowerCase();
        switch (f) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return d * s;
          case "weeks":
          case "week":
          case "w":
            return d * r;
          case "days":
          case "day":
          case "d":
            return d * a;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return d * n;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return d * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return d * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return d;
          default:
            return;
        }
      }
    }
  }
  function o(c) {
    var p = Math.abs(c);
    return p >= a ? Math.round(c / a) + "d" : p >= n ? Math.round(c / n) + "h" : p >= t ? Math.round(c / t) + "m" : p >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var p = Math.abs(c);
    return p >= a ? u(c, p, a, "day") : p >= n ? u(c, p, n, "hour") : p >= t ? u(c, p, t, "minute") : p >= e ? u(c, p, e, "second") : c + " ms";
  }
  function u(c, p, d, f) {
    var g = p >= d * 1.5;
    return Math.round(c / d) + " " + f + (g ? "s" : "");
  }
  return bs;
}
var $s, vl;
function od() {
  if (vl) return $s;
  vl = 1;
  function e(t) {
    a.debug = a, a.default = a, a.coerce = u, a.disable = o, a.enable = s, a.enabled = l, a.humanize = A1(), a.destroy = c, Object.keys(t).forEach((p) => {
      a[p] = t[p];
    }), a.names = [], a.skips = [], a.formatters = {};
    function n(p) {
      let d = 0;
      for (let f = 0; f < p.length; f++)
        d = (d << 5) - d + p.charCodeAt(f), d |= 0;
      return a.colors[Math.abs(d) % a.colors.length];
    }
    a.selectColor = n;
    function a(p) {
      let d, f = null, g, v;
      function y(...m) {
        if (!y.enabled)
          return;
        const $ = y, S = Number(/* @__PURE__ */ new Date()), T = S - (d || S);
        $.diff = T, $.prev = d, $.curr = S, d = S, m[0] = a.coerce(m[0]), typeof m[0] != "string" && m.unshift("%O");
        let I = 0;
        m[0] = m[0].replace(/%([a-zA-Z%])/g, (ne, ce) => {
          if (ne === "%%")
            return "%";
          I++;
          const he = a.formatters[ce];
          if (typeof he == "function") {
            const te = m[I];
            ne = he.call($, te), m.splice(I, 1), I--;
          }
          return ne;
        }), a.formatArgs.call($, m), ($.log || a.log).apply($, m);
      }
      return y.namespace = p, y.useColors = a.useColors(), y.color = a.selectColor(p), y.extend = r, y.destroy = a.destroy, Object.defineProperty(y, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => f !== null ? f : (g !== a.namespaces && (g = a.namespaces, v = a.enabled(p)), v),
        set: (m) => {
          f = m;
        }
      }), typeof a.init == "function" && a.init(y), y;
    }
    function r(p, d) {
      const f = a(this.namespace + (typeof d > "u" ? ":" : d) + p);
      return f.log = this.log, f;
    }
    function s(p) {
      a.save(p), a.namespaces = p, a.names = [], a.skips = [];
      const d = (typeof p == "string" ? p : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const f of d)
        f[0] === "-" ? a.skips.push(f.slice(1)) : a.names.push(f);
    }
    function i(p, d) {
      let f = 0, g = 0, v = -1, y = 0;
      for (; f < p.length; )
        if (g < d.length && (d[g] === p[f] || d[g] === "*"))
          d[g] === "*" ? (v = g, y = f, g++) : (f++, g++);
        else if (v !== -1)
          g = v + 1, y++, f = y;
        else
          return !1;
      for (; g < d.length && d[g] === "*"; )
        g++;
      return g === d.length;
    }
    function o() {
      const p = [
        ...a.names,
        ...a.skips.map((d) => "-" + d)
      ].join(",");
      return a.enable(""), p;
    }
    function l(p) {
      for (const d of a.skips)
        if (i(p, d))
          return !1;
      for (const d of a.names)
        if (i(p, d))
          return !0;
      return !1;
    }
    function u(p) {
      return p instanceof Error ? p.stack || p.message : p;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return a.enable(a.load()), a;
  }
  return $s = e, $s;
}
var yl;
function j1() {
  return yl || (yl = 1, function(e, t) {
    t.formatArgs = a, t.save = r, t.load = s, t.useColors = n, t.storage = i(), t.destroy = /* @__PURE__ */ (() => {
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
    function a(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const u = "color: " + this.color;
      l.splice(1, 0, u, "color: inherit");
      let c = 0, p = 0;
      l[0].replace(/%[a-zA-Z%]/g, (d) => {
        d !== "%%" && (c++, d === "%c" && (p = c));
      }), l.splice(p, 0, u);
    }
    t.log = console.debug || console.log || (() => {
    });
    function r(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function s() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function i() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = od()(t);
    const { formatters: o } = e.exports;
    o.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (u) {
        return "[UnexpectedJSONParseError]: " + u.message;
      }
    };
  }(Ra, Ra.exports)), Ra.exports;
}
var Pa = { exports: {} }, ws, gl;
function k1() {
  return gl || (gl = 1, ws = (e, t = process.argv) => {
    const n = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", a = t.indexOf(n + e), r = t.indexOf("--");
    return a !== -1 && (r === -1 || a < r);
  }), ws;
}
var _s, xl;
function N1() {
  if (xl) return _s;
  xl = 1;
  const e = zd, t = Yl, n = k1(), { env: a } = process;
  let r;
  n("no-color") || n("no-colors") || n("color=false") || n("color=never") ? r = 0 : (n("color") || n("colors") || n("color=true") || n("color=always")) && (r = 1), "FORCE_COLOR" in a && (a.FORCE_COLOR === "true" ? r = 1 : a.FORCE_COLOR === "false" ? r = 0 : r = a.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(a.FORCE_COLOR, 10), 3));
  function s(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function i(l, u) {
    if (r === 0)
      return 0;
    if (n("color=16m") || n("color=full") || n("color=truecolor"))
      return 3;
    if (n("color=256"))
      return 2;
    if (l && !u && r === void 0)
      return 0;
    const c = r || 0;
    if (a.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const p = e.release().split(".");
      return Number(p[0]) >= 10 && Number(p[2]) >= 10586 ? Number(p[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in a)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((p) => p in a) || a.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in a)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(a.TEAMCITY_VERSION) ? 1 : 0;
    if (a.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in a) {
      const p = parseInt((a.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (a.TERM_PROGRAM) {
        case "iTerm.app":
          return p >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(a.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(a.TERM) || "COLORTERM" in a ? 1 : c;
  }
  function o(l) {
    const u = i(l, l && l.isTTY);
    return s(u);
  }
  return _s = {
    supportsColor: o,
    stdout: s(i(!0, t.isatty(1))),
    stderr: s(i(!0, t.isatty(2)))
  }, _s;
}
var bl;
function I1() {
  return bl || (bl = 1, function(e, t) {
    const n = Yl, a = Wt;
    t.init = c, t.log = o, t.formatArgs = s, t.save = l, t.load = u, t.useColors = r, t.destroy = a.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const d = N1();
      d && (d.stderr || d).level >= 2 && (t.colors = [
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
    t.inspectOpts = Object.keys(process.env).filter((d) => /^debug_/i.test(d)).reduce((d, f) => {
      const g = f.substring(6).toLowerCase().replace(/_([a-z])/g, (y, m) => m.toUpperCase());
      let v = process.env[f];
      return /^(yes|on|true|enabled)$/i.test(v) ? v = !0 : /^(no|off|false|disabled)$/i.test(v) ? v = !1 : v === "null" ? v = null : v = Number(v), d[g] = v, d;
    }, {});
    function r() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : n.isatty(process.stderr.fd);
    }
    function s(d) {
      const { namespace: f, useColors: g } = this;
      if (g) {
        const v = this.color, y = "\x1B[3" + (v < 8 ? v : "8;5;" + v), m = `  ${y};1m${f} \x1B[0m`;
        d[0] = m + d[0].split(`
`).join(`
` + m), d.push(y + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        d[0] = i() + f + " " + d[0];
    }
    function i() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function o(...d) {
      return process.stderr.write(a.formatWithOptions(t.inspectOpts, ...d) + `
`);
    }
    function l(d) {
      d ? process.env.DEBUG = d : delete process.env.DEBUG;
    }
    function u() {
      return process.env.DEBUG;
    }
    function c(d) {
      d.inspectOpts = {};
      const f = Object.keys(t.inspectOpts);
      for (let g = 0; g < f.length; g++)
        d.inspectOpts[f[g]] = t.inspectOpts[f[g]];
    }
    e.exports = od()(t);
    const { formatters: p } = e.exports;
    p.o = function(d) {
      return this.inspectOpts.colors = this.useColors, a.inspect(d, this.inspectOpts).split(`
`).map((f) => f.trim()).join(" ");
    }, p.O = function(d) {
      return this.inspectOpts.colors = this.useColors, a.inspect(d, this.inspectOpts);
    };
  }(Pa, Pa.exports)), Pa.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Gs.exports = j1() : Gs.exports = I1();
var Er = Gs.exports, $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
function C1(e) {
  return function(t, n) {
    return new Promise((a, r) => {
      e.call(this, t, n, (s, i) => {
        s ? r(s) : a(i);
      });
    });
  };
}
$o.default = C1;
var cd = st && st.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
const L1 = Md, D1 = cd(Er), F1 = cd($o), Cn = D1.default("agent-base");
function U1(e) {
  return !!e && typeof e.addRequest == "function";
}
function Es() {
  const { stack: e } = new Error();
  return typeof e != "string" ? !1 : e.split(`
`).some((t) => t.indexOf("(https.js:") !== -1 || t.indexOf("node:https:") !== -1);
}
function Wa(e, t) {
  return new Wa.Agent(e, t);
}
(function(e) {
  class t extends L1.EventEmitter {
    constructor(a, r) {
      super();
      let s = r;
      typeof a == "function" ? this.callback = a : a && (s = a), this.timeout = null, s && typeof s.timeout == "number" && (this.timeout = s.timeout), this.maxFreeSockets = 1, this.maxSockets = 1, this.maxTotalSockets = 1 / 0, this.sockets = {}, this.freeSockets = {}, this.requests = {}, this.options = {};
    }
    get defaultPort() {
      return typeof this.explicitDefaultPort == "number" ? this.explicitDefaultPort : Es() ? 443 : 80;
    }
    set defaultPort(a) {
      this.explicitDefaultPort = a;
    }
    get protocol() {
      return typeof this.explicitProtocol == "string" ? this.explicitProtocol : Es() ? "https:" : "http:";
    }
    set protocol(a) {
      this.explicitProtocol = a;
    }
    callback(a, r, s) {
      throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
    }
    /**
     * Called by node-core's "_http_client.js" module when creating
     * a new HTTP request with this Agent instance.
     *
     * @api public
     */
    addRequest(a, r) {
      const s = Object.assign({}, r);
      typeof s.secureEndpoint != "boolean" && (s.secureEndpoint = Es()), s.host == null && (s.host = "localhost"), s.port == null && (s.port = s.secureEndpoint ? 443 : 80), s.protocol == null && (s.protocol = s.secureEndpoint ? "https:" : "http:"), s.host && s.path && delete s.path, delete s.agent, delete s.hostname, delete s._defaultAgent, delete s.defaultPort, delete s.createConnection, a._last = !0, a.shouldKeepAlive = !1;
      let i = !1, o = null;
      const l = s.timeout || this.timeout, u = (f) => {
        a._hadError || (a.emit("error", f), a._hadError = !0);
      }, c = () => {
        o = null, i = !0;
        const f = new Error(`A "socket" was not created for HTTP request before ${l}ms`);
        f.code = "ETIMEOUT", u(f);
      }, p = (f) => {
        i || (o !== null && (clearTimeout(o), o = null), u(f));
      }, d = (f) => {
        if (i)
          return;
        if (o != null && (clearTimeout(o), o = null), U1(f)) {
          Cn("Callback returned another Agent instance %o", f.constructor.name), f.addRequest(a, s);
          return;
        }
        if (f) {
          f.once("free", () => {
            this.freeSocket(f, s);
          }), a.onSocket(f);
          return;
        }
        const g = new Error(`no Duplex stream was returned to agent-base for \`${a.method} ${a.path}\``);
        u(g);
      };
      if (typeof this.callback != "function") {
        u(new Error("`callback` is not defined"));
        return;
      }
      this.promisifiedCallback || (this.callback.length >= 3 ? (Cn("Converting legacy callback function to promise"), this.promisifiedCallback = F1.default(this.callback)) : this.promisifiedCallback = this.callback), typeof l == "number" && l > 0 && (o = setTimeout(c, l)), "port" in s && typeof s.port != "number" && (s.port = Number(s.port));
      try {
        Cn("Resolving socket for %o request: %o", s.protocol, `${a.method} ${a.path}`), Promise.resolve(this.promisifiedCallback(a, s)).then(d, p);
      } catch (f) {
        Promise.reject(f).catch(p);
      }
    }
    freeSocket(a, r) {
      Cn("Freeing socket %o %o", a.constructor.name, r), a.destroy();
    }
    destroy() {
      Cn("Destroying agent %o", this.constructor.name);
    }
  }
  e.Agent = t, e.prototype = e.Agent.prototype;
})(Wa || (Wa = {}));
var z1 = Wa, wo = {}, M1 = st && st.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(wo, "__esModule", { value: !0 });
const q1 = M1(Er), Ln = q1.default("https-proxy-agent:parse-proxy-response");
function B1(e) {
  return new Promise((t, n) => {
    let a = 0;
    const r = [];
    function s() {
      const p = e.read();
      p ? c(p) : e.once("readable", s);
    }
    function i() {
      e.removeListener("end", l), e.removeListener("error", u), e.removeListener("close", o), e.removeListener("readable", s);
    }
    function o(p) {
      Ln("onclose had error %o", p);
    }
    function l() {
      Ln("onend");
    }
    function u(p) {
      i(), Ln("onerror %o", p), n(p);
    }
    function c(p) {
      r.push(p), a += p.length;
      const d = Buffer.concat(r, a);
      if (d.indexOf(`\r
\r
`) === -1) {
        Ln("have not received end of HTTP headers yet..."), s();
        return;
      }
      const g = d.toString("ascii", 0, d.indexOf(`\r
`)), v = +g.split(" ")[1];
      Ln("got proxy server response: %o", g), t({
        statusCode: v,
        buffered: d
      });
    }
    e.on("error", u), e.on("close", o), e.on("end", l), s();
  });
}
wo.default = B1;
var V1 = st && st.__awaiter || function(e, t, n, a) {
  function r(s) {
    return s instanceof n ? s : new n(function(i) {
      i(s);
    });
  }
  return new (n || (n = Promise))(function(s, i) {
    function o(c) {
      try {
        u(a.next(c));
      } catch (p) {
        i(p);
      }
    }
    function l(c) {
      try {
        u(a.throw(c));
      } catch (p) {
        i(p);
      }
    }
    function u(c) {
      c.done ? s(c.value) : r(c.value).then(o, l);
    }
    u((a = a.apply(e, t || [])).next());
  });
}, Sn = st && st.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
Object.defineProperty(bo, "__esModule", { value: !0 });
const $l = Sn(Fd), wl = Sn(Ud), H1 = Sn(Ya), G1 = Sn(Jl), K1 = Sn(Er), W1 = z1, X1 = Sn(wo), Dn = K1.default("https-proxy-agent:agent");
let J1 = class extends W1.Agent {
  constructor(t) {
    let n;
    if (typeof t == "string" ? n = H1.default.parse(t) : n = t, !n)
      throw new Error("an HTTP(S) proxy server `host` and `port` must be specified!");
    Dn("creating new HttpsProxyAgent instance: %o", n), super(n);
    const a = Object.assign({}, n);
    this.secureProxy = n.secureProxy || Z1(a.protocol), a.host = a.hostname || a.host, typeof a.port == "string" && (a.port = parseInt(a.port, 10)), !a.port && a.host && (a.port = this.secureProxy ? 443 : 80), this.secureProxy && !("ALPNProtocols" in a) && (a.ALPNProtocols = ["http 1.1"]), a.host && a.path && (delete a.path, delete a.pathname), this.proxy = a;
  }
  /**
   * Called when the node-core HTTP client library is creating a
   * new HTTP request.
   *
   * @api protected
   */
  callback(t, n) {
    return V1(this, void 0, void 0, function* () {
      const { proxy: a, secureProxy: r } = this;
      let s;
      r ? (Dn("Creating `tls.Socket`: %o", a), s = wl.default.connect(a)) : (Dn("Creating `net.Socket`: %o", a), s = $l.default.connect(a));
      const i = Object.assign({}, a.headers);
      let l = `CONNECT ${`${n.host}:${n.port}`} HTTP/1.1\r
`;
      a.auth && (i["Proxy-Authorization"] = `Basic ${Buffer.from(a.auth).toString("base64")}`);
      let { host: u, port: c, secureEndpoint: p } = n;
      Q1(c, p) || (u += `:${c}`), i.Host = u, i.Connection = "close";
      for (const y of Object.keys(i))
        l += `${y}: ${i[y]}\r
`;
      const d = X1.default(s);
      s.write(`${l}\r
`);
      const { statusCode: f, buffered: g } = yield d;
      if (f === 200) {
        if (t.once("socket", Y1), n.secureEndpoint) {
          Dn("Upgrading socket connection to TLS");
          const y = n.servername || n.host;
          return wl.default.connect(Object.assign(Object.assign({}, eR(n, "host", "hostname", "path", "port")), {
            socket: s,
            servername: y
          }));
        }
        return s;
      }
      s.destroy();
      const v = new $l.default.Socket({ writable: !1 });
      return v.readable = !0, t.once("socket", (y) => {
        Dn("replaying proxy buffer for failed request"), G1.default(y.listenerCount("data") > 0), y.push(g), y.push(null);
      }), v;
    });
  }
};
bo.default = J1;
function Y1(e) {
  e.resume();
}
function Q1(e, t) {
  return !!(!t && e === 80 || t && e === 443);
}
function Z1(e) {
  return typeof e == "string" ? /^https:?$/i.test(e) : !1;
}
function eR(e, ...t) {
  const n = {};
  let a;
  for (a in e)
    t.includes(a) || (n[a] = e[a]);
  return n;
}
var tR = st && st.__importDefault || function(e) {
  return e && e.__esModule ? e : { default: e };
};
const Ks = tR(bo);
function Ws(e) {
  return new Ks.default(e);
}
(function(e) {
  e.HttpsProxyAgent = Ks.default, e.prototype = Ks.default.prototype;
})(Ws || (Ws = {}));
var nR = Ws;
const ld = /* @__PURE__ */ Yn(nR);
var _o = { exports: {} }, Fn, aR = function() {
  if (!Fn) {
    try {
      Fn = Er("follow-redirects");
    } catch {
    }
    typeof Fn != "function" && (Fn = function() {
    });
  }
  Fn.apply(null, arguments);
}, ca = Ya, Wn = ca.URL, rR = Zs, sR = ei, Eo = Ee.Writable, So = Jl, ud = aR;
(function() {
  var t = typeof process < "u", n = typeof window < "u" && typeof document < "u", a = Gt(Error.captureStackTrace);
  !t && (n || !a) && console.warn("The follow-redirects package should be excluded from browser builds.");
})();
var Ro = !1;
try {
  So(new Wn(""));
} catch (e) {
  Ro = e.code === "ERR_INVALID_URL";
}
var iR = [
  "Authorization",
  "Proxy-Authorization",
  "Cookie"
], oR = [
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
], Po = ["abort", "aborted", "connect", "error", "socket", "timeout"], Oo = /* @__PURE__ */ Object.create(null);
Po.forEach(function(e) {
  Oo[e] = function(t, n, a) {
    this._redirectable.emit(e, t, n, a);
  };
});
var Xs = la(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
), Js = la(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
), cR = la(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded",
  Js
), lR = la(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
), uR = la(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
), pR = Eo.prototype.destroy || dd;
function Fe(e, t) {
  Eo.call(this), this._sanitizeOptions(e), this._options = e, this._ended = !1, this._ending = !1, this._redirectCount = 0, this._redirects = [], this._requestBodyLength = 0, this._requestBodyBuffers = [], t && this.on("response", t);
  var n = this;
  this._onNativeResponse = function(a) {
    try {
      n._processResponse(a);
    } catch (r) {
      n.emit("error", r instanceof Js ? r : new Js({ cause: r }));
    }
  }, this._headerFilter = new RegExp("^(?:" + iR.concat(e.sensitiveHeaders).map(yR).join("|") + ")$", "i"), this._performRequest();
}
Fe.prototype = Object.create(Eo.prototype);
Fe.prototype.abort = function() {
  Ao(this._currentRequest), this._currentRequest.abort(), this.emit("abort");
};
Fe.prototype.destroy = function(e) {
  return Ao(this._currentRequest, e), pR.call(this, e), this;
};
Fe.prototype.write = function(e, t, n) {
  if (this._ending)
    throw new uR();
  if (!Ut(e) && !hR(e))
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  if (Gt(t) && (n = t, t = null), e.length === 0) {
    n && n();
    return;
  }
  this._requestBodyLength + e.length <= this._options.maxBodyLength ? (this._requestBodyLength += e.length, this._requestBodyBuffers.push({ data: e, encoding: t }), this._currentRequest.write(e, t, n)) : (this.emit("error", new lR()), this.abort());
};
Fe.prototype.end = function(e, t, n) {
  if (Gt(e) ? (n = e, e = t = null) : Gt(t) && (n = t, t = null), !e)
    this._ended = this._ending = !0, this._currentRequest.end(null, null, n);
  else {
    var a = this, r = this._currentRequest;
    this.write(e, t, function() {
      a._ended = !0, r.end(null, null, n);
    }), this._ending = !0;
  }
};
Fe.prototype.setHeader = function(e, t) {
  this._options.headers[e] = t, this._currentRequest.setHeader(e, t);
};
Fe.prototype.removeHeader = function(e) {
  delete this._options.headers[e], this._currentRequest.removeHeader(e);
};
Fe.prototype.setTimeout = function(e, t) {
  var n = this;
  function a(i) {
    i.setTimeout(e), i.removeListener("timeout", i.destroy), i.addListener("timeout", i.destroy);
  }
  function r(i) {
    n._timeout && clearTimeout(n._timeout), n._timeout = setTimeout(function() {
      n.emit("timeout"), s();
    }, e), a(i);
  }
  function s() {
    n._timeout && (clearTimeout(n._timeout), n._timeout = null), n.removeListener("abort", s), n.removeListener("error", s), n.removeListener("response", s), n.removeListener("close", s), t && n.removeListener("timeout", t), n.socket || n._currentRequest.removeListener("socket", r);
  }
  return t && this.on("timeout", t), this.socket ? r(this.socket) : this._currentRequest.once("socket", r), this.on("socket", a), this.on("abort", s), this.on("error", s), this.on("response", s), this.on("close", s), this;
};
[
  "flushHeaders",
  "getHeader",
  "setNoDelay",
  "setSocketKeepAlive"
].forEach(function(e) {
  Fe.prototype[e] = function(t, n) {
    return this._currentRequest[e](t, n);
  };
});
["aborted", "connection", "socket"].forEach(function(e) {
  Object.defineProperty(Fe.prototype, e, {
    get: function() {
      return this._currentRequest[e];
    }
  });
});
Fe.prototype._sanitizeOptions = function(e) {
  if (e.headers || (e.headers = {}), mR(e.sensitiveHeaders) || (e.sensitiveHeaders = []), e.host && (e.hostname || (e.hostname = e.host), delete e.host), !e.pathname && e.path) {
    var t = e.path.indexOf("?");
    t < 0 ? e.pathname = e.path : (e.pathname = e.path.substring(0, t), e.search = e.path.substring(t));
  }
};
Fe.prototype._performRequest = function() {
  var e = this._options.protocol, t = this._options.nativeProtocols[e];
  if (!t)
    throw new TypeError("Unsupported protocol " + e);
  if (this._options.agents) {
    var n = e.slice(0, -1);
    this._options.agent = this._options.agents[n];
  }
  var a = this._currentRequest = t.request(this._options, this._onNativeResponse);
  a._redirectable = this;
  for (var r of Po)
    a.on(r, Oo[r]);
  if (this._currentUrl = /^\//.test(this._options.path) ? ca.format(this._options) : (
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path
  ), this._isRedirect) {
    var s = 0, i = this, o = this._requestBodyBuffers;
    (function l(u) {
      if (a === i._currentRequest)
        if (u)
          i.emit("error", u);
        else if (s < o.length) {
          var c = o[s++];
          a.finished || a.write(c.data, c.encoding, l);
        } else i._ended && a.end();
    })();
  }
};
Fe.prototype._processResponse = function(e) {
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
  if (Ao(this._currentRequest), e.destroy(), ++this._redirectCount > this._options.maxRedirects)
    throw new cR();
  var a, r = this._options.beforeRedirect;
  r && (a = Object.assign({
    // The Host header was set by nativeProtocol.request
    Host: e.req.getHeader("host")
  }, this._options.headers));
  var s = this._options.method;
  ((t === 301 || t === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
  // the server is redirecting the user agent to a different resource […]
  // A user agent can perform a retrieval request targeting that URI
  // (a GET or HEAD request if using HTTP) […]
  t === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) && (this._options.method = "GET", this._requestBodyBuffers = [], Ss(/^content-/i, this._options.headers));
  var i = Ss(/^host$/i, this._options.headers), o = To(this._currentUrl), l = i || o.host, u = /^\w+:/.test(n) ? this._currentUrl : ca.format(Object.assign(o, { host: l })), c = dR(n, u);
  if (ud("redirecting to", c.href), this._isRedirect = !0, Ys(c, this._options), (c.protocol !== o.protocol && c.protocol !== "https:" || c.host !== l && !fR(c.host, l)) && Ss(this._headerFilter, this._options.headers), Gt(r)) {
    var p = {
      headers: e.headers,
      statusCode: t
    }, d = {
      url: u,
      method: s,
      headers: a
    };
    r(this._options, p, d), this._sanitizeOptions(this._options);
  }
  this._performRequest();
};
function pd(e) {
  var t = {
    maxRedirects: 21,
    maxBodyLength: 10485760
  }, n = {};
  return Object.keys(e).forEach(function(a) {
    var r = a + ":", s = n[r] = e[a], i = t[a] = Object.create(s);
    function o(u, c, p) {
      return vR(u) ? u = Ys(u) : Ut(u) ? u = Ys(To(u)) : (p = c, c = fd(u), u = { protocol: r }), Gt(c) && (p = c, c = null), c = Object.assign({
        maxRedirects: t.maxRedirects,
        maxBodyLength: t.maxBodyLength
      }, u, c), c.nativeProtocols = n, !Ut(c.host) && !Ut(c.hostname) && (c.hostname = "::1"), So.equal(c.protocol, r, "protocol mismatch"), ud("options", c), new Fe(c, p);
    }
    function l(u, c, p) {
      var d = i.request(u, c, p);
      return d.end(), d;
    }
    Object.defineProperties(i, {
      request: { value: o, configurable: !0, enumerable: !0, writable: !0 },
      get: { value: l, configurable: !0, enumerable: !0, writable: !0 }
    });
  }), t;
}
function dd() {
}
function To(e) {
  var t;
  if (Ro)
    t = new Wn(e);
  else if (t = fd(ca.parse(e)), !Ut(t.protocol))
    throw new Xs({ input: e });
  return t;
}
function dR(e, t) {
  return Ro ? new Wn(e, t) : To(ca.resolve(t, e));
}
function fd(e) {
  if (/^\[/.test(e.hostname) && !/^\[[:0-9a-f]+\]$/i.test(e.hostname))
    throw new Xs({ input: e.href || e });
  if (/^\[/.test(e.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(e.host))
    throw new Xs({ input: e.href || e });
  return e;
}
function Ys(e, t) {
  var n = t || {};
  for (var a of oR)
    n[a] = e[a];
  return n.hostname.startsWith("[") && (n.hostname = n.hostname.slice(1, -1)), n.port !== "" && (n.port = Number(n.port)), n.path = n.search ? n.pathname + n.search : n.pathname, n;
}
function Ss(e, t) {
  var n;
  for (var a in t)
    e.test(a) && (n = t[a], delete t[a]);
  return n === null || typeof n > "u" ? void 0 : String(n).trim();
}
function la(e, t, n) {
  function a(r) {
    Gt(Error.captureStackTrace) && Error.captureStackTrace(this, this.constructor), Object.assign(this, r || {}), this.code = e, this.message = this.cause ? t + ": " + this.cause.message : t;
  }
  return a.prototype = new (n || Error)(), Object.defineProperties(a.prototype, {
    constructor: {
      value: a,
      enumerable: !1
    },
    name: {
      value: "Error [" + e + "]",
      enumerable: !1
    }
  }), a;
}
function Ao(e, t) {
  for (var n of Po)
    e.removeListener(n, Oo[n]);
  e.on("error", dd), e.destroy(t);
}
function fR(e, t) {
  So(Ut(e) && Ut(t));
  var n = e.length - t.length - 1;
  return n > 0 && e[n] === "." && e.endsWith(t);
}
function mR(e) {
  return e instanceof Array;
}
function Ut(e) {
  return typeof e == "string" || e instanceof String;
}
function Gt(e) {
  return typeof e == "function";
}
function hR(e) {
  return typeof e == "object" && "length" in e;
}
function vR(e) {
  return Wn && e instanceof Wn;
}
function yR(e) {
  return e.replace(/[\]\\/()*+?.$]/g, "\\$&");
}
_o.exports = pd({ http: rR, https: sR });
_o.exports.wrap = pd;
var gR = _o.exports;
const xR = /* @__PURE__ */ Yn(gR), Xn = "1.16.1";
function md(e) {
  const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
  return t && t[1] || "";
}
const bR = /^([^,;]+\/[^,;]+)?((?:;[^,;=]+=[^,;]+)*)(;base64)?,([\s\S]*)$/;
function $R(e, t, n) {
  const a = n && n.Blob || de.classes.Blob, r = md(e);
  if (t === void 0 && a && (t = !0), r === "data") {
    e = r.length ? e.slice(r.length + 1) : e;
    const s = bR.exec(e);
    if (!s)
      throw new N("Invalid URL", N.ERR_INVALID_URL);
    const i = s[1], o = s[2], l = s[3] ? "base64" : "utf8", u = s[4];
    let c;
    i ? c = o ? i + o : i : o && (c = "text/plain" + o);
    const p = Buffer.from(decodeURIComponent(u), l);
    if (t) {
      if (!a)
        throw new N("Blob is not supported", N.ERR_NOT_SUPPORT);
      return new a([p], { type: c });
    }
    return p;
  }
  throw new N("Unsupported protocol " + r, N.ERR_NOT_SUPPORT);
}
const Rs = Symbol("internals");
class _l extends Ee.Transform {
  constructor(t) {
    t = b.toFlatObject(
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
      (a, r) => !b.isUndefined(r[a])
    ), super({
      readableHighWaterMark: t.chunkSize
    });
    const n = this[Rs] = {
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
    this.on("newListener", (a) => {
      a === "progress" && (n.isCaptured || (n.isCaptured = !0));
    });
  }
  _read(t) {
    const n = this[Rs];
    return n.onReadCallback && n.onReadCallback(), super._read(t);
  }
  _transform(t, n, a) {
    const r = this[Rs], s = r.maxRate, i = this.readableHighWaterMark, o = r.timeWindow, l = 1e3 / o, u = s / l, c = r.minChunkSize !== !1 ? Math.max(r.minChunkSize, u * 0.01) : 0, p = (f, g) => {
      const v = Buffer.byteLength(f);
      r.bytesSeen += v, r.bytes += v, r.isCaptured && this.emit("progress", r.bytesSeen), this.push(f) ? process.nextTick(g) : r.onReadCallback = () => {
        r.onReadCallback = null, process.nextTick(g);
      };
    }, d = (f, g) => {
      const v = Buffer.byteLength(f);
      let y = null, m = i, $, S = 0;
      if (s) {
        const T = Date.now();
        (!r.ts || (S = T - r.ts) >= o) && (r.ts = T, $ = u - r.bytes, r.bytes = $ < 0 ? -$ : 0, S = 0), $ = u - r.bytes;
      }
      if (s) {
        if ($ <= 0)
          return setTimeout(() => {
            g(null, f);
          }, o - S);
        $ < m && (m = $);
      }
      m && v > m && v - m > c && (y = f.subarray(m), f = f.subarray(0, m)), p(
        f,
        y ? () => {
          process.nextTick(g, null, y);
        } : g
      );
    };
    d(t, function f(g, v) {
      if (g)
        return a(g);
      v ? d(v, f) : a(null);
    });
  }
}
const { asyncIterator: El } = Symbol, hd = async function* (e) {
  e.stream ? yield* e.stream() : e.arrayBuffer ? yield await e.arrayBuffer() : e[El] ? yield* e[El]() : yield e;
}, wR = de.ALPHABET.ALPHA_DIGIT + "-_", Jn = typeof TextEncoder == "function" ? new TextEncoder() : new Wt.TextEncoder(), It = `\r
`, _R = Jn.encode(It), ER = 2;
class SR {
  constructor(t, n) {
    const { escapeName: a } = this.constructor, r = b.isString(n);
    let s = `Content-Disposition: form-data; name="${a(t)}"${!r && n.name ? `; filename="${a(n.name)}"` : ""}${It}`;
    if (r)
      n = Jn.encode(String(n).replace(/\r?\n|\r\n?/g, It));
    else {
      const i = String(n.type || "application/octet-stream").replace(/[\r\n]/g, "");
      s += `Content-Type: ${i}${It}`;
    }
    this.headers = Jn.encode(s + It), this.contentLength = r ? n.byteLength : n.size, this.size = this.headers.byteLength + this.contentLength + ER, this.name = t, this.value = n;
  }
  async *encode() {
    yield this.headers;
    const { value: t } = this;
    b.isTypedArray(t) ? yield t : yield* hd(t), yield _R;
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
const RR = (e, t, n) => {
  const {
    tag: a = "form-data-boundary",
    size: r = 25,
    boundary: s = a + "-" + de.generateString(r, wR)
  } = n || {};
  if (!b.isFormData(e))
    throw TypeError("FormData instance required");
  if (s.length < 1 || s.length > 70)
    throw Error("boundary must be 1-70 characters long");
  const i = Jn.encode("--" + s + It), o = Jn.encode("--" + s + "--" + It);
  let l = o.byteLength;
  const u = Array.from(e.entries()).map(([p, d]) => {
    const f = new SR(p, d);
    return l += f.size, f;
  });
  l += i.byteLength * u.length, l = b.toFiniteNumber(l);
  const c = {
    "Content-Type": `multipart/form-data; boundary=${s}`
  };
  return Number.isFinite(l) && (c["Content-Length"] = l), t && t(c), Ld.from(
    async function* () {
      for (const p of u)
        yield i, yield* p.encode();
      yield o;
    }()
  );
};
class PR extends Ee.Transform {
  __transform(t, n, a) {
    this.push(t), a();
  }
  _transform(t, n, a) {
    if (t.length !== 0 && (this._transform = this.__transform, t[0] !== 120)) {
      const r = Buffer.alloc(2);
      r[0] = 120, r[1] = 156, this.push(r, n);
    }
    this.__transform(t, n, a);
  }
}
const OR = (e, t) => b.isAsyncFn(e) ? function(...n) {
  const a = n.pop();
  e.apply(this, n).then((r) => {
    try {
      t ? a(null, ...t(r)) : a(null, r);
    } catch (s) {
      a(s);
    }
  }, a);
} : e, TR = /* @__PURE__ */ new Set(["localhost"]), vd = (e) => {
  const t = e.split(".");
  return t.length !== 4 || t[0] !== "127" ? !1 : t.every((n) => /^\d+$/.test(n) && Number(n) >= 0 && Number(n) <= 255);
}, AR = (e) => {
  if (e === "::1") return !0;
  const t = e.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (t) return vd(t[1]);
  const n = e.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (n) {
    const r = parseInt(n[1], 16);
    return r >= 32512 && r <= 32767;
  }
  const a = e.split(":");
  if (a.length === 8) {
    for (let r = 0; r < 7; r++)
      if (!/^0+$/.test(a[r])) return !1;
    return /^0*1$/.test(a[7]);
  }
  return !1;
}, Sl = (e) => e ? TR.has(e) || vd(e) ? !0 : AR(e) : !1, jR = {
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
  ftp: 21
}, kR = (e) => {
  let t = e, n = 0;
  if (t.charAt(0) === "[") {
    const s = t.indexOf("]");
    if (s !== -1) {
      const i = t.slice(1, s), o = t.slice(s + 1);
      return o.charAt(0) === ":" && /^\d+$/.test(o.slice(1)) && (n = Number.parseInt(o.slice(1), 10)), [i, n];
    }
  }
  const a = t.indexOf(":"), r = t.lastIndexOf(":");
  return a !== -1 && a === r && /^\d+$/.test(t.slice(r + 1)) && (n = Number.parseInt(t.slice(r + 1), 10), t = t.slice(0, r)), [t, n];
}, NR = /^(?:::|(?:0{1,4}:){1,4}:|(?:0{1,4}:){5})ffff:(\d+\.\d+\.\d+\.\d+)$/i, IR = /^(?:::|(?:0{1,4}:){1,4}:|(?:0{1,4}:){5})ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i, CR = (e) => {
  if (typeof e != "string" || e.indexOf(":") === -1) return e;
  const t = e.match(NR);
  if (t) return t[1];
  const n = e.match(IR);
  if (n) {
    const a = parseInt(n[1], 16), r = parseInt(n[2], 16);
    return `${a >> 8}.${a & 255}.${r >> 8}.${r & 255}`;
  }
  return e;
}, Rl = (e) => e && (e.charAt(0) === "[" && e.charAt(e.length - 1) === "]" && (e = e.slice(1, -1)), CR(e.replace(/\.+$/, "")));
function LR(e) {
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
  const a = Number.parseInt(t.port, 10) || jR[t.protocol.split(":", 1)[0]] || 0, r = Rl(t.hostname.toLowerCase());
  return n.split(/[\s,]+/).some((s) => {
    if (!s)
      return !1;
    let [i, o] = kR(s);
    return i = Rl(i), !i || o && o !== a ? !1 : (i.charAt(0) === "*" && (i = i.slice(1)), i.charAt(0) === "." ? r.endsWith(i) : r === i || Sl(r) && Sl(i));
  });
}
function DR(e, t) {
  e = e || 10;
  const n = new Array(e), a = new Array(e);
  let r = 0, s = 0, i;
  return t = t !== void 0 ? t : 1e3, function(l) {
    const u = Date.now(), c = a[s];
    i || (i = u), n[r] = l, a[r] = u;
    let p = s, d = 0;
    for (; p !== r; )
      d += n[p++], p = p % e;
    if (r = (r + 1) % e, r === s && (s = (s + 1) % e), u - i < t)
      return;
    const f = c && u - c;
    return f ? Math.round(d * 1e3 / f) : void 0;
  };
}
function FR(e, t) {
  let n = 0, a = 1e3 / t, r, s;
  const i = (u, c = Date.now()) => {
    n = c, r = null, s && (clearTimeout(s), s = null), e(...u);
  };
  return [(...u) => {
    const c = Date.now(), p = c - n;
    p >= a ? i(u, c) : (r = u, s || (s = setTimeout(() => {
      s = null, i(r);
    }, a - p)));
  }, () => r && i(r)];
}
const gn = (e, t, n = 3) => {
  let a = 0;
  const r = DR(50, 250);
  return FR((s) => {
    if (!s || typeof s.loaded != "number")
      return;
    const i = s.loaded, o = s.lengthComputable ? s.total : void 0, l = o != null ? Math.min(i, o) : i, u = Math.max(0, l - a), c = r(u);
    a = Math.max(a, l);
    const p = {
      loaded: l,
      total: o,
      progress: o ? l / o : void 0,
      bytes: u,
      rate: c || void 0,
      estimated: c && o ? (o - l) / c : void 0,
      event: s,
      lengthComputable: o != null,
      [t ? "download" : "upload"]: !0
    };
    e(p);
  }, n);
}, Xa = (e, t) => {
  const n = e != null;
  return [
    (a) => t[0]({
      lengthComputable: n,
      total: e,
      loaded: a
    }),
    t[1]
  ];
}, Ja = (e) => (...t) => b.asap(() => e(...t));
function yd(e) {
  if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
  const t = e.indexOf(",");
  if (t < 0) return 0;
  const n = e.slice(5, t), a = e.slice(t + 1);
  if (/;base64/i.test(n)) {
    let i = a.length;
    const o = a.length;
    for (let f = 0; f < o; f++)
      if (a.charCodeAt(f) === 37 && f + 2 < o) {
        const g = a.charCodeAt(f + 1), v = a.charCodeAt(f + 2);
        (g >= 48 && g <= 57 || g >= 65 && g <= 70 || g >= 97 && g <= 102) && (v >= 48 && v <= 57 || v >= 65 && v <= 70 || v >= 97 && v <= 102) && (i -= 2, f += 2);
      }
    let l = 0, u = o - 1;
    const c = (f) => f >= 2 && a.charCodeAt(f - 2) === 37 && // '%'
    a.charCodeAt(f - 1) === 51 && // '3'
    (a.charCodeAt(f) === 68 || a.charCodeAt(f) === 100);
    u >= 0 && (a.charCodeAt(u) === 61 ? (l++, u--) : c(u) && (l++, u -= 3)), l === 1 && u >= 0 && (a.charCodeAt(u) === 61 || c(u)) && l++;
    const d = Math.floor(i / 4) * 3 - (l || 0);
    return d > 0 ? d : 0;
  }
  if (typeof Buffer < "u" && typeof Buffer.byteLength == "function")
    return Buffer.byteLength(a, "utf8");
  let s = 0;
  for (let i = 0, o = a.length; i < o; i++) {
    const l = a.charCodeAt(i);
    if (l < 128)
      s += 1;
    else if (l < 2048)
      s += 2;
    else if (l >= 55296 && l <= 56319 && i + 1 < o) {
      const u = a.charCodeAt(i + 1);
      u >= 56320 && u <= 57343 ? (s += 4, i++) : s += 3;
    } else
      s += 3;
  }
  return s;
}
const Pl = {
  flush: Et.constants.Z_SYNC_FLUSH,
  finishFlush: Et.constants.Z_SYNC_FLUSH
}, UR = {
  flush: Et.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: Et.constants.BROTLI_OPERATION_FLUSH
}, Ol = b.isFunction(Et.createBrotliDecompress), { http: zR, https: MR } = xR, gd = /https:?/, qR = ["content-type", "content-length"];
function BR(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t).forEach(([a, r]) => {
    qR.includes(a.toLowerCase()) && e.set(a, r);
  });
}
const Tl = Symbol("axios.http.socketListener"), Oa = Symbol("axios.http.currentReq"), xd = Symbol("axios.http.installedTunnel"), VR = /* @__PURE__ */ new Map(), Al = /* @__PURE__ */ new WeakMap();
function HR(e, t) {
  const n = e.protocol + "//" + e.hostname + ":" + (e.port || "") + "#" + (e.auth || ""), a = t ? Al.get(t) || Al.set(t, /* @__PURE__ */ new Map()).get(t) : VR;
  let r = a.get(n);
  if (r) return r;
  const s = t && t.options ? { ...t.options, ...e } : e;
  return r = new ld(s), r[xd] = !0, a.set(n, r), r;
}
const jl = de.protocols.map((e) => e + ":"), kl = (e) => {
  if (!b.isString(e))
    return e;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}, Nl = (e, [t, n]) => (e.on("end", n).on("error", n), t);
class GR {
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
    let a = this.sessions[t];
    if (a) {
      let c = a.length;
      for (let p = 0; p < c; p++) {
        const [d, f] = a[p];
        if (!d.destroyed && !d.closed && Wt.isDeepStrictEqual(f, n))
          return d;
      }
    }
    const r = Ql.connect(t, n);
    let s;
    const i = () => {
      if (s)
        return;
      s = !0;
      let c = a, p = c.length, d = p;
      for (; d--; )
        if (c[d][0] === r) {
          p === 1 ? delete this.sessions[t] : c.splice(d, 1), r.closed || r.close();
          return;
        }
    }, o = r.request, { sessionTimeout: l } = n;
    if (l != null) {
      let c, p = 0;
      r.request = function() {
        const d = o.apply(this, arguments);
        return p++, c && (clearTimeout(c), c = null), d.once("close", () => {
          --p || (c = setTimeout(() => {
            c = null, i();
          }, l));
        }), d;
      };
    }
    r.once("close", i);
    let u = [r, n];
    return a ? a.push(u) : a = this.sessions[t] = [u], r;
  }
}
const KR = new GR();
function WR(e, t, n) {
  e.beforeRedirects.proxy && e.beforeRedirects.proxy(e), e.beforeRedirects.config && e.beforeRedirects.config(e, t, n);
}
function bd(e, t, n, a, r) {
  let s = t;
  if (!s && s !== !1) {
    const i = O1(n);
    i && (LR(n) || (s = new URL(i)));
  }
  if (a && e.headers)
    for (const i of Object.keys(e.headers))
      i.toLowerCase() === "proxy-authorization" && delete e.headers[i];
  if (a && e.agent && e.agent[xd] && (e.agent = void 0), s) {
    const i = s instanceof URL, o = (d) => i || b.hasOwnProp(s, d) ? s[d] : void 0, l = o("username"), u = o("password");
    let c = b.hasOwnProp(s, "auth") ? s.auth : void 0;
    if (l && (c = (l || "") + ":" + (u || "")), c) {
      const d = typeof c == "object", f = d && b.hasOwnProp(c, "username") ? c.username : void 0, g = d && b.hasOwnProp(c, "password") ? c.password : void 0;
      if (!!(f || g))
        c = (f || "") + ":" + (g || "");
      else if (d)
        throw new N("Invalid proxy authorization", N.ERR_BAD_OPTION, { proxy: s });
    }
    if (gd.test(e.protocol)) {
      if (!(r instanceof ld)) {
        const d = o("hostname") || o("host"), f = o("port"), g = o("protocol"), v = g ? g.includes(":") ? g : `${g}:` : "http:", y = d && d.includes(":") && !d.startsWith("[") ? `[${d}]` : d, m = new URL(
          `${v}//${y}${f ? ":" + f : ""}`
        ), $ = {
          protocol: m.protocol,
          hostname: m.hostname.replace(/^\[|\]$/g, ""),
          port: m.port,
          auth: c && typeof c == "string" ? c : void 0
        };
        m.protocol === "https:" && ($.ALPNProtocols = ["http/1.1"]);
        const S = HR($, r);
        e.agent = S, e.agents && (e.agents.https = S);
      }
    } else {
      if (c) {
        const v = Buffer.from(c, "utf8").toString("base64");
        e.headers["Proxy-Authorization"] = "Basic " + v;
      }
      let d = !1;
      for (const v of Object.keys(e.headers))
        if (v.toLowerCase() === "host") {
          d = !0;
          break;
        }
      d || (e.headers.host = e.hostname + (e.port ? ":" + e.port : ""));
      const f = o("hostname") || o("host");
      e.hostname = f, e.host = f, e.port = o("port"), e.path = n;
      const g = o("protocol");
      g && (e.protocol = g.includes(":") ? g : `${g}:`);
    }
  }
  e.beforeRedirects.proxy = function(o) {
    bd(o, t, o.href, !0, r);
  };
}
const XR = typeof process < "u" && b.kindOf(process) === "process", JR = (e) => new Promise((t, n) => {
  let a, r;
  const s = (l, u) => {
    r || (r = !0, a && a(l, u));
  }, i = (l) => {
    s(l), t(l);
  }, o = (l) => {
    s(l, !0), n(l);
  };
  e(i, o, (l) => a = l).catch(o);
}), YR = ({ address: e, family: t }) => {
  if (!b.isString(e))
    throw TypeError("address must be a string");
  return {
    address: e,
    family: t || (e.indexOf(".") < 0 ? 6 : 4)
  };
}, Il = (e, t) => YR(b.isObject(e) ? e : { address: e, family: t }), QR = {
  request(e, t) {
    const n = e.protocol + "//" + e.hostname + ":" + (e.port || (e.protocol === "https:" ? 443 : 80)), { http2Options: a, headers: r } = e, s = KR.getSession(n, a), { HTTP2_HEADER_SCHEME: i, HTTP2_HEADER_METHOD: o, HTTP2_HEADER_PATH: l, HTTP2_HEADER_STATUS: u } = Ql.constants, c = {
      [i]: e.protocol.replace(":", ""),
      [o]: e.method,
      [l]: e.path
    };
    b.forEach(r, (d, f) => {
      f.charAt(0) !== ":" && (c[f] = d);
    });
    const p = s.request(c);
    return p.once("response", (d) => {
      const f = p;
      d = Object.assign({}, d);
      const g = d[u];
      delete d[u], f.headers = d, f.statusCode = +g, t(f);
    }), p;
  }
}, ZR = XR && function(t) {
  return JR(async function(a, r, s) {
    const i = (A) => b.hasOwnProp(t, A) ? t[A] : void 0;
    let o = i("data"), l = i("lookup"), u = i("family"), c = i("httpVersion");
    c === void 0 && (c = 1);
    let p = i("http2Options");
    const d = i("responseType"), f = i("responseEncoding"), g = t.method.toUpperCase();
    let v, y = !1, m, $;
    if (c = +c, Number.isNaN(c))
      throw TypeError(`Invalid protocol version: '${t.httpVersion}' is not a number`);
    if (c !== 1 && c !== 2)
      throw TypeError(`Unsupported protocol version '${c}'`);
    const S = c === 2;
    if (l) {
      const A = OR(l, (R) => b.isArray(R) ? R : [R]);
      l = (R, M, V) => {
        A(R, M, (H, le, we) => {
          if (H)
            return V(H);
          const se = b.isArray(le) ? le.map((Ze) => Il(Ze)) : [Il(le, we)];
          M.all ? V(H, se) : V(H, se[0].address, se[0].family);
        });
      };
    }
    const T = new qd();
    function I(A) {
      try {
        T.emit(
          "abort",
          !A || A.type ? new Ht(null, t, m) : A
        );
      } catch (R) {
        console.warn("emit error", R);
      }
    }
    function W() {
      $ && (clearTimeout($), $ = null);
    }
    function ne() {
      let A = t.timeout ? "timeout of " + t.timeout + "ms exceeded" : "timeout exceeded";
      const R = t.transitional || _r;
      return t.timeoutErrorMessage && (A = t.timeoutErrorMessage), new N(
        A,
        R.clarifyTimeoutError ? N.ETIMEDOUT : N.ECONNABORTED,
        t,
        m
      );
    }
    T.once("abort", r);
    const ce = () => {
      W(), t.cancelToken && t.cancelToken.unsubscribe(I), t.signal && t.signal.removeEventListener("abort", I), T.removeAllListeners();
    };
    (t.cancelToken || t.signal) && (t.cancelToken && t.cancelToken.subscribe(I), t.signal && (t.signal.aborted ? I() : t.signal.addEventListener("abort", I))), s((A, R) => {
      if (v = !0, W(), R) {
        y = !0, ce();
        return;
      }
      const { data: M } = A;
      if (M instanceof Ee.Readable || M instanceof Ee.Duplex) {
        const V = Ee.finished(M, () => {
          V(), ce();
        });
      } else
        ce();
    });
    const he = xo(t.baseURL, t.url, t.allowAbsoluteUrls), te = new URL(he, de.hasBrowserEnv ? de.origin : void 0), U = te.protocol || jl[0];
    if (U === "data:") {
      if (t.maxContentLength > -1) {
        const R = String(t.url || he || "");
        if (yd(R) > t.maxContentLength)
          return r(
            new N(
              "maxContentLength size of " + t.maxContentLength + " exceeded",
              N.ERR_BAD_RESPONSE,
              t
            )
          );
      }
      let A;
      if (g !== "GET")
        return ln(a, r, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config: t
        });
      try {
        A = $R(t.url, d === "blob", {
          Blob: t.env && t.env.Blob
        });
      } catch (R) {
        throw N.from(R, N.ERR_BAD_REQUEST, t);
      }
      return d === "text" ? (A = A.toString(f), (!f || f === "utf8") && (A = b.stripBOM(A))) : d === "stream" && (A = Ee.Readable.from(A)), ln(a, r, {
        data: A,
        status: 200,
        statusText: "OK",
        headers: new be(),
        config: t
      });
    }
    if (jl.indexOf(U) === -1)
      return r(
        new N("Unsupported protocol " + U, N.ERR_BAD_REQUEST, t)
      );
    const z = be.from(t.headers).normalize();
    z.set("User-Agent", "axios/" + Xn, !1);
    const { onUploadProgress: re, onDownloadProgress: j } = t, k = t.maxRate;
    let F, D;
    if (b.isSpecCompliantForm(o)) {
      const A = z.getContentType(/boundary=([-_\w\d]{10,70})/i);
      o = RR(
        o,
        (R) => {
          z.set(R);
        },
        {
          tag: `axios-${Xn}-boundary`,
          boundary: A && A[1] || void 0
        }
      );
    } else if (b.isFormData(o) && b.isFunction(o.getHeaders) && o.getHeaders !== Object.prototype.getHeaders) {
      if (BR(z, o.getHeaders(), i("formDataHeaderPolicy")), !z.hasContentLength())
        try {
          const A = await Wt.promisify(o.getLength).call(o);
          Number.isFinite(A) && A >= 0 && z.setContentLength(A);
        } catch {
        }
    } else if (b.isBlob(o) || b.isFile(o))
      o.size && z.setContentType(o.type || "application/octet-stream"), z.setContentLength(o.size || 0), o = Ee.Readable.from(hd(o));
    else if (o && !b.isStream(o)) {
      if (!Buffer.isBuffer(o)) if (b.isArrayBuffer(o))
        o = Buffer.from(new Uint8Array(o));
      else if (b.isString(o))
        o = Buffer.from(o, "utf-8");
      else
        return r(
          new N(
            "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
            N.ERR_BAD_REQUEST,
            t
          )
        );
      if (z.setContentLength(o.length, !1), t.maxBodyLength > -1 && o.length > t.maxBodyLength)
        return r(
          new N(
            "Request body larger than maxBodyLength limit",
            N.ERR_BAD_REQUEST,
            t
          )
        );
    }
    const q = b.toFiniteNumber(z.getContentLength());
    b.isArray(k) ? (F = k[0], D = k[1]) : F = D = k, o && (re || F) && (b.isStream(o) || (o = Ee.Readable.from(o, { objectMode: !1 })), o = Ee.pipeline(
      [
        o,
        new _l({
          maxRate: b.toFiniteNumber(F)
        })
      ],
      b.noop
    ), re && o.on(
      "progress",
      Nl(
        o,
        Xa(
          q,
          gn(Ja(re), !1, 3)
        )
      )
    ));
    let C;
    const P = i("auth");
    if (P) {
      const A = P.username || "", R = P.password || "";
      C = A + ":" + R;
    }
    if (!C && te.username) {
      const A = kl(te.username), R = kl(te.password);
      C = A + ":" + R;
    }
    C && z.delete("authorization");
    let w;
    try {
      w = yo(
        te.pathname + te.search,
        t.params,
        t.paramsSerializer
      ).replace(/^\?/, "");
    } catch (A) {
      const R = new Error(A.message);
      return R.config = t, R.url = t.url, R.exists = !0, r(R);
    }
    z.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (Ol ? ", br" : ""),
      !1
    );
    const E = Object.assign(/* @__PURE__ */ Object.create(null), {
      path: w,
      method: g,
      headers: po(z),
      agents: { http: t.httpAgent, https: t.httpsAgent },
      auth: C,
      protocol: U,
      family: u,
      beforeRedirect: WR,
      beforeRedirects: /* @__PURE__ */ Object.create(null),
      http2Options: p
    });
    if (!b.isUndefined(l) && (E.lookup = l), t.socketPath) {
      if (typeof t.socketPath != "string")
        return r(
          new N("socketPath must be a string", N.ERR_BAD_OPTION_VALUE, t)
        );
      if (t.allowedSocketPaths != null) {
        const A = Array.isArray(t.allowedSocketPaths) ? t.allowedSocketPaths : [t.allowedSocketPaths], R = Do(t.socketPath);
        if (!A.some(
          (V) => typeof V == "string" && Do(V) === R
        ))
          return r(
            new N(
              `socketPath "${t.socketPath}" is not permitted by allowedSocketPaths`,
              N.ERR_BAD_OPTION_VALUE,
              t
            )
          );
      }
      E.socketPath = t.socketPath;
    } else
      E.hostname = te.hostname.startsWith("[") ? te.hostname.slice(1, -1) : te.hostname, E.port = te.port, bd(
        E,
        t.proxy,
        U + "//" + te.hostname + (te.port ? ":" + te.port : "") + E.path,
        !1,
        t.httpsAgent
      );
    let _, h = !1;
    const x = gd.test(E.protocol);
    if (E.agent == null && (E.agent = x ? t.httpsAgent : t.httpAgent), S)
      _ = QR;
    else {
      const A = i("transport");
      if (A)
        _ = A;
      else if (t.maxRedirects === 0)
        _ = x ? ei : Zs, h = !0;
      else {
        t.maxRedirects && (E.maxRedirects = t.maxRedirects);
        const R = i("beforeRedirect");
        R && (E.beforeRedirects.config = R), _ = x ? MR : zR;
      }
    }
    t.maxBodyLength > -1 ? E.maxBodyLength = t.maxBodyLength : E.maxBodyLength = 1 / 0, E.insecureHTTPParser = !!i("insecureHTTPParser"), m = _.request(E, function(R) {
      if (W(), m.destroyed) return;
      const M = [R], V = b.toFiniteNumber(R.headers["content-length"]);
      if (j || D) {
        const se = new _l({
          maxRate: b.toFiniteNumber(D)
        });
        j && se.on(
          "progress",
          Nl(
            se,
            Xa(
              V,
              gn(Ja(j), !0, 3)
            )
          )
        ), M.push(se);
      }
      let H = R;
      const le = R.req || m;
      if (t.decompress !== !1 && R.headers["content-encoding"])
        switch ((g === "HEAD" || R.statusCode === 204) && delete R.headers["content-encoding"], (R.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            M.push(Et.createUnzip(Pl)), delete R.headers["content-encoding"];
            break;
          case "deflate":
            M.push(new PR()), M.push(Et.createUnzip(Pl)), delete R.headers["content-encoding"];
            break;
          case "br":
            Ol && (M.push(Et.createBrotliDecompress(UR)), delete R.headers["content-encoding"]);
        }
      H = M.length > 1 ? Ee.pipeline(M, b.noop) : M[0];
      const we = {
        status: R.statusCode,
        statusText: R.statusMessage,
        headers: new be(R.headers),
        config: t,
        request: le
      };
      if (d === "stream") {
        if (t.maxContentLength > -1) {
          const se = t.maxContentLength, Ze = H;
          async function* it() {
            let pe = 0;
            for await (const Yt of Ze) {
              if (pe += Yt.length, pe > se)
                throw new N(
                  "maxContentLength size of " + se + " exceeded",
                  N.ERR_BAD_RESPONSE,
                  t,
                  le
                );
              yield Yt;
            }
          }
          H = Ee.Readable.from(it(), {
            objectMode: !1
          });
        }
        we.data = H, ln(a, r, we);
      } else {
        const se = [];
        let Ze = 0;
        H.on("data", function(pe) {
          se.push(pe), Ze += pe.length, t.maxContentLength > -1 && Ze > t.maxContentLength && (y = !0, H.destroy(), I(
            new N(
              "maxContentLength size of " + t.maxContentLength + " exceeded",
              N.ERR_BAD_RESPONSE,
              t,
              le
            )
          ));
        }), H.on("aborted", function() {
          if (y)
            return;
          const pe = new N(
            "stream has been aborted",
            N.ERR_BAD_RESPONSE,
            t,
            le,
            we
          );
          H.destroy(pe), r(pe);
        }), H.on("error", function(pe) {
          y || r(N.from(pe, null, t, le, we));
        }), H.on("end", function() {
          try {
            let pe = se.length === 1 ? se[0] : Buffer.concat(se);
            d !== "arraybuffer" && (pe = pe.toString(f), (!f || f === "utf8") && (pe = b.stripBOM(pe))), we.data = pe;
          } catch (pe) {
            return r(N.from(pe, null, t, we.request, we));
          }
          ln(a, r, we);
        });
      }
      T.once("abort", (se) => {
        H.destroyed || (H.emit("error", se), H.destroy());
      });
    }), T.once("abort", (A) => {
      m.close ? m.close() : m.destroy(A);
    }), m.on("error", function(R) {
      r(N.from(R, null, t, m));
    });
    const O = /* @__PURE__ */ new Set();
    if (m.on("socket", function(R) {
      R.setKeepAlive(!0, 1e3 * 60), R[Tl] || (R.on("error", function(V) {
        const H = R[Oa];
        H && !H.destroyed && H.destroy(V);
      }), R[Tl] = !0), R[Oa] = m, O.add(R);
    }), m.once("close", function() {
      W();
      for (const R of O)
        R[Oa] === m && (R[Oa] = null);
      O.clear();
    }), t.timeout) {
      const A = parseInt(t.timeout, 10);
      if (Number.isNaN(A)) {
        I(
          new N(
            "error trying to parse `config.timeout` to int",
            N.ERR_BAD_OPTION_VALUE,
            t,
            m
          )
        );
        return;
      }
      const R = function() {
        v || I(ne());
      };
      h && A > 0 && ($ = setTimeout(R, A)), m.setTimeout(A, R);
    } else
      m.setTimeout(0);
    if (b.isStream(o)) {
      let A = !1, R = !1;
      o.on("end", () => {
        A = !0;
      }), o.once("error", (V) => {
        R = !0, m.destroy(V);
      }), o.on("close", () => {
        !A && !R && I(new Ht("Request stream has been aborted", t, m));
      });
      let M = o;
      if (t.maxBodyLength > -1 && t.maxRedirects === 0) {
        const V = t.maxBodyLength;
        let H = 0;
        M = Ee.pipeline(
          [
            o,
            new Ee.Transform({
              transform(le, we, se) {
                if (H += le.length, H > V)
                  return se(
                    new N(
                      "Request body larger than maxBodyLength limit",
                      N.ERR_BAD_REQUEST,
                      t,
                      m
                    )
                  );
                se(null, le);
              }
            })
          ],
          b.noop
        ), M.on("error", (le) => {
          m.destroyed || m.destroy(le);
        });
      }
      M.pipe(m);
    } else
      o && m.write(o), m.end();
  });
}, eP = de.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (n) => (n = new URL(n, de.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(
  new URL(de.origin),
  de.navigator && /(msie|trident)/i.test(de.navigator.userAgent)
) : () => !0, tP = de.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, n, a, r, s, i) {
      if (typeof document > "u") return;
      const o = [`${e}=${encodeURIComponent(t)}`];
      b.isNumber(n) && o.push(`expires=${new Date(n).toUTCString()}`), b.isString(a) && o.push(`path=${a}`), b.isString(r) && o.push(`domain=${r}`), s === !0 && o.push("secure"), b.isString(i) && o.push(`SameSite=${i}`), document.cookie = o.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.split(";");
      for (let n = 0; n < t.length; n++) {
        const a = t[n].replace(/^\s+/, ""), r = a.indexOf("=");
        if (r !== -1 && a.slice(0, r) === e)
          return decodeURIComponent(a.slice(r + 1));
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
), Cl = (e) => e instanceof be ? { ...e } : e;
function Kt(e, t) {
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
  function a(u, c, p, d) {
    return b.isPlainObject(u) && b.isPlainObject(c) ? b.merge.call({ caseless: d }, u, c) : b.isPlainObject(c) ? b.merge({}, c) : b.isArray(c) ? c.slice() : c;
  }
  function r(u, c, p, d) {
    if (b.isUndefined(c)) {
      if (!b.isUndefined(u))
        return a(void 0, u, p, d);
    } else return a(u, c, p, d);
  }
  function s(u, c) {
    if (!b.isUndefined(c))
      return a(void 0, c);
  }
  function i(u, c) {
    if (b.isUndefined(c)) {
      if (!b.isUndefined(u))
        return a(void 0, u);
    } else return a(void 0, c);
  }
  function o(u, c, p) {
    if (b.hasOwnProp(t, p))
      return a(u, c);
    if (b.hasOwnProp(e, p))
      return a(void 0, u);
  }
  const l = {
    url: s,
    method: s,
    data: s,
    baseURL: i,
    transformRequest: i,
    transformResponse: i,
    paramsSerializer: i,
    timeout: i,
    timeoutMessage: i,
    withCredentials: i,
    withXSRFToken: i,
    adapter: i,
    responseType: i,
    xsrfCookieName: i,
    xsrfHeaderName: i,
    onUploadProgress: i,
    onDownloadProgress: i,
    decompress: i,
    maxContentLength: i,
    maxBodyLength: i,
    beforeRedirect: i,
    transport: i,
    httpAgent: i,
    httpsAgent: i,
    cancelToken: i,
    socketPath: i,
    allowedSocketPaths: i,
    responseEncoding: i,
    validateStatus: o,
    headers: (u, c, p) => r(Cl(u), Cl(c), p, !0)
  };
  return b.forEach(Object.keys({ ...e, ...t }), function(c) {
    if (c === "__proto__" || c === "constructor" || c === "prototype") return;
    const p = b.hasOwnProp(l, c) ? l[c] : r, d = b.hasOwnProp(e, c) ? e[c] : void 0, f = b.hasOwnProp(t, c) ? t[c] : void 0, g = p(d, f, c);
    b.isUndefined(g) && p !== o || (n[c] = g);
  }), n;
}
const nP = ["content-type", "content-length"];
function aP(e, t, n) {
  if (n !== "content-only") {
    e.set(t);
    return;
  }
  Object.entries(t).forEach(([a, r]) => {
    nP.includes(a.toLowerCase()) && e.set(a, r);
  });
}
const rP = (e) => encodeURIComponent(e).replace(
  /%([0-9A-F]{2})/gi,
  (t, n) => String.fromCharCode(parseInt(n, 16))
), $d = (e) => {
  const t = Kt({}, e), n = (d) => b.hasOwnProp(t, d) ? t[d] : void 0, a = n("data");
  let r = n("withXSRFToken");
  const s = n("xsrfHeaderName"), i = n("xsrfCookieName");
  let o = n("headers");
  const l = n("auth"), u = n("baseURL"), c = n("allowAbsoluteUrls"), p = n("url");
  if (t.headers = o = be.from(o), t.url = yo(
    xo(u, p, c),
    e.params,
    e.paramsSerializer
  ), l && o.set(
    "Authorization",
    "Basic " + btoa((l.username || "") + ":" + (l.password ? rP(l.password) : ""))
  ), b.isFormData(a) && (de.hasStandardBrowserEnv || de.hasStandardBrowserWebWorkerEnv ? o.setContentType(void 0) : b.isFunction(a.getHeaders) && aP(o, a.getHeaders(), n("formDataHeaderPolicy"))), de.hasStandardBrowserEnv && (b.isFunction(r) && (r = r(t)), r === !0 || r == null && eP(t.url))) {
    const f = s && i && tP.read(i);
    f && o.set(s, f);
  }
  return t;
}, sP = typeof XMLHttpRequest < "u", iP = sP && function(e) {
  return new Promise(function(n, a) {
    const r = $d(e);
    let s = r.data;
    const i = be.from(r.headers).normalize();
    let { responseType: o, onUploadProgress: l, onDownloadProgress: u } = r, c, p, d, f, g;
    function v() {
      f && f(), g && g(), r.cancelToken && r.cancelToken.unsubscribe(c), r.signal && r.signal.removeEventListener("abort", c);
    }
    let y = new XMLHttpRequest();
    y.open(r.method.toUpperCase(), r.url, !0), y.timeout = r.timeout;
    function m() {
      if (!y)
        return;
      const S = be.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), I = {
        data: !o || o === "text" || o === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: S,
        config: e,
        request: y
      };
      ln(
        function(ne) {
          n(ne), v();
        },
        function(ne) {
          a(ne), v();
        },
        I
      ), y = null;
    }
    "onloadend" in y ? y.onloadend = m : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.startsWith("file:")) || setTimeout(m);
    }, y.onabort = function() {
      y && (a(new N("Request aborted", N.ECONNABORTED, e, y)), v(), y = null);
    }, y.onerror = function(T) {
      const I = T && T.message ? T.message : "Network Error", W = new N(I, N.ERR_NETWORK, e, y);
      W.event = T || null, a(W), v(), y = null;
    }, y.ontimeout = function() {
      let T = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded";
      const I = r.transitional || _r;
      r.timeoutErrorMessage && (T = r.timeoutErrorMessage), a(
        new N(
          T,
          I.clarifyTimeoutError ? N.ETIMEDOUT : N.ECONNABORTED,
          e,
          y
        )
      ), v(), y = null;
    }, s === void 0 && i.setContentType(null), "setRequestHeader" in y && b.forEach(po(i), function(T, I) {
      y.setRequestHeader(I, T);
    }), b.isUndefined(r.withCredentials) || (y.withCredentials = !!r.withCredentials), o && o !== "json" && (y.responseType = r.responseType), u && ([d, g] = gn(u, !0), y.addEventListener("progress", d)), l && y.upload && ([p, f] = gn(l), y.upload.addEventListener("progress", p), y.upload.addEventListener("loadend", f)), (r.cancelToken || r.signal) && (c = (S) => {
      y && (a(!S || S.type ? new Ht(null, e, y) : S), y.abort(), v(), y = null);
    }, r.cancelToken && r.cancelToken.subscribe(c), r.signal && (r.signal.aborted ? c() : r.signal.addEventListener("abort", c)));
    const $ = md(r.url);
    if ($ && !de.protocols.includes($)) {
      a(
        new N(
          "Unsupported protocol " + $ + ":",
          N.ERR_BAD_REQUEST,
          e
        )
      );
      return;
    }
    y.send(s || null);
  });
}, oP = (e, t) => {
  if (e = e ? e.filter(Boolean) : [], !t && !e.length)
    return;
  const n = new AbortController();
  let a = !1;
  const r = function(l) {
    if (!a) {
      a = !0, i();
      const u = l instanceof Error ? l : this.reason;
      n.abort(
        u instanceof N ? u : new Ht(u instanceof Error ? u.message : u)
      );
    }
  };
  let s = t && setTimeout(() => {
    s = null, r(new N(`timeout of ${t}ms exceeded`, N.ETIMEDOUT));
  }, t);
  const i = () => {
    e && (s && clearTimeout(s), s = null, e.forEach((l) => {
      l.unsubscribe ? l.unsubscribe(r) : l.removeEventListener("abort", r);
    }), e = null);
  };
  e.forEach((l) => l.addEventListener("abort", r));
  const { signal: o } = n;
  return o.unsubscribe = () => b.asap(i), o;
}, cP = function* (e, t) {
  let n = e.byteLength;
  if (n < t) {
    yield e;
    return;
  }
  let a = 0, r;
  for (; a < n; )
    r = a + t, yield e.slice(a, r), a = r;
}, lP = async function* (e, t) {
  for await (const n of uP(e))
    yield* cP(n, t);
}, uP = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: n, value: a } = await t.read();
      if (n)
        break;
      yield a;
    }
  } finally {
    await t.cancel();
  }
}, Ll = (e, t, n, a) => {
  const r = lP(e, t);
  let s = 0, i, o = (l) => {
    i || (i = !0, a && a(l));
  };
  return new ReadableStream(
    {
      async pull(l) {
        try {
          const { done: u, value: c } = await r.next();
          if (u) {
            o(), l.close();
            return;
          }
          let p = c.byteLength;
          if (n) {
            let d = s += p;
            n(d);
          }
          l.enqueue(new Uint8Array(c));
        } catch (u) {
          throw o(u), u;
        }
      },
      cancel(l) {
        return o(l), r.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, Dl = 64 * 1024, { isFunction: Ta } = b, Fl = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, pP = (e) => {
  const t = b.global !== void 0 && b.global !== null ? b.global : globalThis, { ReadableStream: n, TextEncoder: a } = t;
  e = b.merge.call(
    {
      skipUndefined: !0
    },
    {
      Request: t.Request,
      Response: t.Response
    },
    e
  );
  const { fetch: r, Request: s, Response: i } = e, o = r ? Ta(r) : typeof fetch == "function", l = Ta(s), u = Ta(i);
  if (!o)
    return !1;
  const c = o && Ta(n), p = o && (typeof a == "function" ? /* @__PURE__ */ ((m) => ($) => m.encode($))(new a()) : async (m) => new Uint8Array(await new s(m).arrayBuffer())), d = l && c && Fl(() => {
    let m = !1;
    const $ = new s(de.origin, {
      body: new n(),
      method: "POST",
      get duplex() {
        return m = !0, "half";
      }
    }), S = $.headers.has("Content-Type");
    return $.body != null && $.body.cancel(), m && !S;
  }), f = u && c && Fl(() => b.isReadableStream(new i("").body)), g = {
    stream: f && ((m) => m.body)
  };
  o && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((m) => {
    !g[m] && (g[m] = ($, S) => {
      let T = $ && $[m];
      if (T)
        return T.call($);
      throw new N(
        `Response type '${m}' is not supported`,
        N.ERR_NOT_SUPPORT,
        S
      );
    });
  });
  const v = async (m) => {
    if (m == null)
      return 0;
    if (b.isBlob(m))
      return m.size;
    if (b.isSpecCompliantForm(m))
      return (await new s(de.origin, {
        method: "POST",
        body: m
      }).arrayBuffer()).byteLength;
    if (b.isArrayBufferView(m) || b.isArrayBuffer(m))
      return m.byteLength;
    if (b.isURLSearchParams(m) && (m = m + ""), b.isString(m))
      return (await p(m)).byteLength;
  }, y = async (m, $) => {
    const S = b.toFiniteNumber(m.getContentLength());
    return S ?? v($);
  };
  return async (m) => {
    let {
      url: $,
      method: S,
      data: T,
      signal: I,
      cancelToken: W,
      timeout: ne,
      onDownloadProgress: ce,
      onUploadProgress: he,
      responseType: te,
      headers: U,
      withCredentials: z = "same-origin",
      fetchOptions: re,
      maxContentLength: j,
      maxBodyLength: k
    } = $d(m);
    const F = b.isNumber(j) && j > -1, D = b.isNumber(k) && k > -1;
    let q = r || fetch;
    te = te ? (te + "").toLowerCase() : "text";
    let C = oP(
      [I, W && W.toAbortSignal()],
      ne
    ), P = null;
    const w = C && C.unsubscribe && (() => {
      C.unsubscribe();
    });
    let E;
    try {
      if (F && typeof $ == "string" && $.startsWith("data:") && yd($) > j)
        throw new N(
          "maxContentLength size of " + j + " exceeded",
          N.ERR_BAD_RESPONSE,
          m,
          P
        );
      if (D && S !== "get" && S !== "head") {
        const R = await y(U, T);
        if (typeof R == "number" && isFinite(R) && R > k)
          throw new N(
            "Request body larger than maxBodyLength limit",
            N.ERR_BAD_REQUEST,
            m,
            P
          );
      }
      if (he && d && S !== "get" && S !== "head" && (E = await y(U, T)) !== 0) {
        let R = new s($, {
          method: "POST",
          body: T,
          duplex: "half"
        }), M;
        if (b.isFormData(T) && (M = R.headers.get("content-type")) && U.setContentType(M), R.body) {
          const [V, H] = Xa(
            E,
            gn(Ja(he))
          );
          T = Ll(R.body, Dl, V, H);
        }
      }
      b.isString(z) || (z = z ? "include" : "omit");
      const _ = l && "credentials" in s.prototype;
      if (b.isFormData(T)) {
        const R = U.getContentType();
        R && /^multipart\/form-data/i.test(R) && !/boundary=/i.test(R) && U.delete("content-type");
      }
      U.set("User-Agent", "axios/" + Xn, !1);
      const h = {
        ...re,
        signal: C,
        method: S.toUpperCase(),
        headers: po(U.normalize()),
        body: T,
        duplex: "half",
        credentials: _ ? z : void 0
      };
      P = l && new s($, h);
      let x = await (l ? q(P, re) : q($, h));
      if (F) {
        const R = b.toFiniteNumber(x.headers.get("content-length"));
        if (R != null && R > j)
          throw new N(
            "maxContentLength size of " + j + " exceeded",
            N.ERR_BAD_RESPONSE,
            m,
            P
          );
      }
      const O = f && (te === "stream" || te === "response");
      if (f && x.body && (ce || F || O && w)) {
        const R = {};
        ["status", "statusText", "headers"].forEach((se) => {
          R[se] = x[se];
        });
        const M = b.toFiniteNumber(x.headers.get("content-length")), [V, H] = ce && Xa(
          M,
          gn(Ja(ce), !0)
        ) || [];
        let le = 0;
        const we = (se) => {
          if (F && (le = se, le > j))
            throw new N(
              "maxContentLength size of " + j + " exceeded",
              N.ERR_BAD_RESPONSE,
              m,
              P
            );
          V && V(se);
        };
        x = new i(
          Ll(x.body, Dl, we, () => {
            H && H(), w && w();
          }),
          R
        );
      }
      te = te || "text";
      let A = await g[b.findKey(g, te) || "text"](
        x,
        m
      );
      if (F && !f && !O) {
        let R;
        if (A != null && (typeof A.byteLength == "number" ? R = A.byteLength : typeof A.size == "number" ? R = A.size : typeof A == "string" && (R = typeof a == "function" ? new a().encode(A).byteLength : A.length)), typeof R == "number" && R > j)
          throw new N(
            "maxContentLength size of " + j + " exceeded",
            N.ERR_BAD_RESPONSE,
            m,
            P
          );
      }
      return !O && w && w(), await new Promise((R, M) => {
        ln(R, M, {
          data: A,
          headers: be.from(x.headers),
          status: x.status,
          statusText: x.statusText,
          config: m,
          request: P
        });
      });
    } catch (_) {
      if (w && w(), C && C.aborted && C.reason instanceof N) {
        const h = C.reason;
        throw h.config = m, P && (h.request = P), _ !== h && (h.cause = _), h;
      }
      throw _ && _.name === "TypeError" && /Load failed|fetch/i.test(_.message) ? Object.assign(
        new N(
          "Network Error",
          N.ERR_NETWORK,
          m,
          P,
          _ && _.response
        ),
        {
          cause: _.cause || _
        }
      ) : N.from(_, _ && _.code, m, P, _ && _.response);
    }
  };
}, dP = /* @__PURE__ */ new Map(), wd = (e) => {
  let t = e && e.env || {};
  const { fetch: n, Request: a, Response: r } = t, s = [a, r, n];
  let i = s.length, o = i, l, u, c = dP;
  for (; o--; )
    l = s[o], u = c.get(l), u === void 0 && c.set(l, u = o ? /* @__PURE__ */ new Map() : pP(t)), c = u;
  return u;
};
wd();
const jo = {
  http: ZR,
  xhr: iP,
  fetch: {
    get: wd
  }
};
b.forEach(jo, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { __proto__: null, value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { __proto__: null, value: t });
  }
});
const Ul = (e) => `- ${e}`, fP = (e) => b.isFunction(e) || e === null || e === !1;
function mP(e, t) {
  e = b.isArray(e) ? e : [e];
  const { length: n } = e;
  let a, r;
  const s = {};
  for (let i = 0; i < n; i++) {
    a = e[i];
    let o;
    if (r = a, !fP(a) && (r = jo[(o = String(a)).toLowerCase()], r === void 0))
      throw new N(`Unknown adapter '${o}'`);
    if (r && (b.isFunction(r) || (r = r.get(t))))
      break;
    s[o || "#" + i] = r;
  }
  if (!r) {
    const i = Object.entries(s).map(
      ([l, u]) => `adapter ${l} ` + (u === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let o = n ? i.length > 1 ? `since :
` + i.map(Ul).join(`
`) : " " + Ul(i[0]) : "as no adapter specified";
    throw new N(
      "There is no suitable adapter to dispatch the request " + o,
      "ERR_NOT_SUPPORT"
    );
  }
  return r;
}
const _d = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: mP,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: jo
};
function Ps(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new Ht(null, e);
}
function zl(e) {
  return Ps(e), e.headers = be.from(e.headers), e.data = xs.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), _d.getAdapter(e.adapter || oa.adapter, e)(e).then(
    function(a) {
      Ps(e), e.response = a;
      try {
        a.data = xs.call(e, e.transformResponse, a);
      } finally {
        delete e.response;
      }
      return a.headers = be.from(a.headers), a;
    },
    function(a) {
      if (!id(a) && (Ps(e), a && a.response)) {
        e.response = a.response;
        try {
          a.response.data = xs.call(
            e,
            e.transformResponse,
            a.response
          );
        } finally {
          delete e.response;
        }
        a.response.headers = be.from(a.response.headers);
      }
      return Promise.reject(a);
    }
  );
}
const Sr = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  Sr[e] = function(a) {
    return typeof a === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
const Ml = {};
Sr.transitional = function(t, n, a) {
  function r(s, i) {
    return "[Axios v" + Xn + "] Transitional option '" + s + "'" + i + (a ? ". " + a : "");
  }
  return (s, i, o) => {
    if (t === !1)
      throw new N(
        r(i, " has been removed" + (n ? " in " + n : "")),
        N.ERR_DEPRECATED
      );
    return n && !Ml[i] && (Ml[i] = !0, console.warn(
      r(
        i,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), t ? t(s, i, o) : !0;
  };
};
Sr.spelling = function(t) {
  return (n, a) => (console.warn(`${a} is likely a misspelling of ${t}`), !0);
};
function hP(e, t, n) {
  if (typeof e != "object")
    throw new N("options must be an object", N.ERR_BAD_OPTION_VALUE);
  const a = Object.keys(e);
  let r = a.length;
  for (; r-- > 0; ) {
    const s = a[r], i = Object.prototype.hasOwnProperty.call(t, s) ? t[s] : void 0;
    if (i) {
      const o = e[s], l = o === void 0 || i(o, s, e);
      if (l !== !0)
        throw new N(
          "option " + s + " must be " + l,
          N.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (n !== !0)
      throw new N("Unknown option " + s, N.ERR_BAD_OPTION);
  }
}
const za = {
  assertOptions: hP,
  validators: Sr
}, Me = za.validators;
let zt = class {
  constructor(t) {
    this.defaults = t || {}, this.interceptors = {
      request: new fl(),
      response: new fl()
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
    } catch (a) {
      if (a instanceof Error) {
        let r = {};
        Error.captureStackTrace ? Error.captureStackTrace(r) : r = new Error();
        const s = (() => {
          if (!r.stack)
            return "";
          const i = r.stack.indexOf(`
`);
          return i === -1 ? "" : r.stack.slice(i + 1);
        })();
        try {
          if (!a.stack)
            a.stack = s;
          else if (s) {
            const i = s.indexOf(`
`), o = i === -1 ? -1 : s.indexOf(`
`, i + 1), l = o === -1 ? "" : s.slice(o + 1);
            String(a.stack).endsWith(l) || (a.stack += `
` + s);
          }
        } catch {
        }
      }
      throw a;
    }
  }
  _request(t, n) {
    typeof t == "string" ? (n = n || {}, n.url = t) : n = t || {}, n = Kt(this.defaults, n);
    const { transitional: a, paramsSerializer: r, headers: s } = n;
    a !== void 0 && za.assertOptions(
      a,
      {
        silentJSONParsing: Me.transitional(Me.boolean),
        forcedJSONParsing: Me.transitional(Me.boolean),
        clarifyTimeoutError: Me.transitional(Me.boolean),
        legacyInterceptorReqResOrdering: Me.transitional(Me.boolean)
      },
      !1
    ), r != null && (b.isFunction(r) ? n.paramsSerializer = {
      serialize: r
    } : za.assertOptions(
      r,
      {
        encode: Me.function,
        serialize: Me.function
      },
      !0
    )), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), za.assertOptions(
      n,
      {
        baseUrl: Me.spelling("baseURL"),
        withXsrfToken: Me.spelling("withXSRFToken")
      },
      !0
    ), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let i = s && b.merge(s.common, s[n.method]);
    s && b.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (g) => {
      delete s[g];
    }), n.headers = be.concat(i, s);
    const o = [];
    let l = !0;
    this.interceptors.request.forEach(function(v) {
      if (typeof v.runWhen == "function" && v.runWhen(n) === !1)
        return;
      l = l && v.synchronous;
      const y = n.transitional || _r;
      y && y.legacyInterceptorReqResOrdering ? o.unshift(v.fulfilled, v.rejected) : o.push(v.fulfilled, v.rejected);
    });
    const u = [];
    this.interceptors.response.forEach(function(v) {
      u.push(v.fulfilled, v.rejected);
    });
    let c, p = 0, d;
    if (!l) {
      const g = [zl.bind(this), void 0];
      for (g.unshift(...o), g.push(...u), d = g.length, c = Promise.resolve(n); p < d; )
        c = c.then(g[p++], g[p++]);
      return c;
    }
    d = o.length;
    let f = n;
    for (; p < d; ) {
      const g = o[p++], v = o[p++];
      try {
        f = g(f);
      } catch (y) {
        v.call(this, y);
        break;
      }
    }
    try {
      c = zl.call(this, f);
    } catch (g) {
      return Promise.reject(g);
    }
    for (p = 0, d = u.length; p < d; )
      c = c.then(u[p++], u[p++]);
    return c;
  }
  getUri(t) {
    t = Kt(this.defaults, t);
    const n = xo(t.baseURL, t.url, t.allowAbsoluteUrls);
    return yo(n, t.params, t.paramsSerializer);
  }
};
b.forEach(["delete", "get", "head", "options"], function(t) {
  zt.prototype[t] = function(n, a) {
    return this.request(
      Kt(a || {}, {
        method: t,
        url: n,
        data: (a || {}).data
      })
    );
  };
});
b.forEach(["post", "put", "patch", "query"], function(t) {
  function n(a) {
    return function(s, i, o) {
      return this.request(
        Kt(o || {}, {
          method: t,
          headers: a ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: s,
          data: i
        })
      );
    };
  }
  zt.prototype[t] = n(), t !== "query" && (zt.prototype[t + "Form"] = n(!0));
});
let vP = class Ed {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(s) {
      n = s;
    });
    const a = this;
    this.promise.then((r) => {
      if (!a._listeners) return;
      let s = a._listeners.length;
      for (; s-- > 0; )
        a._listeners[s](r);
      a._listeners = null;
    }), this.promise.then = (r) => {
      let s;
      const i = new Promise((o) => {
        a.subscribe(o), s = o;
      }).then(r);
      return i.cancel = function() {
        a.unsubscribe(s);
      }, i;
    }, t(function(s, i, o) {
      a.reason || (a.reason = new Ht(s, i, o), n(a.reason));
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
    const t = new AbortController(), n = (a) => {
      t.abort(a);
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
      token: new Ed(function(r) {
        t = r;
      }),
      cancel: t
    };
  }
};
function yP(e) {
  return function(n) {
    return e.apply(null, n);
  };
}
function gP(e) {
  return b.isObject(e) && e.isAxiosError === !0;
}
const Qs = {
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
Object.entries(Qs).forEach(([e, t]) => {
  Qs[t] = e;
});
function Sd(e) {
  const t = new zt(e), n = Pp(zt.prototype.request, t);
  return b.extend(n, zt.prototype, t, { allOwnKeys: !0 }), b.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(r) {
    return Sd(Kt(e, r));
  }, n;
}
const me = Sd(oa);
me.Axios = zt;
me.CanceledError = Ht;
me.CancelToken = vP;
me.isCancel = id;
me.VERSION = Xn;
me.toFormData = wr;
me.AxiosError = N;
me.Cancel = me.CanceledError;
me.all = function(t) {
  return Promise.all(t);
};
me.spread = yP;
me.isAxiosError = gP;
me.mergeConfig = Kt;
me.AxiosHeaders = be;
me.formToJSON = (e) => sd(b.isHTMLForm(e) ? new FormData(e) : e);
me.getAdapter = _d.getAdapter;
me.HttpStatusCode = Qs;
me.default = me;
const {
  Axios: rO,
  AxiosError: sO,
  CanceledError: iO,
  isCancel: oO,
  CancelToken: cO,
  VERSION: lO,
  all: uO,
  Cancel: pO,
  isAxiosError: dO,
  spread: fO,
  toFormData: mO,
  AxiosHeaders: hO,
  HttpStatusCode: vO,
  formToJSON: yO,
  getAdapter: gO,
  mergeConfig: xO,
  create: bO
} = me;
function ql(e) {
  var t;
  if (me.isAxiosError(e)) {
    const n = (t = e.response) == null ? void 0 : t.data;
    return (n == null ? void 0 : n.message) || (n == null ? void 0 : n.exception) || (n == null ? void 0 : n.exc_type) || e.message || "ERPNext API request failed.";
  }
  return e instanceof Error ? e.message : "Unexpected error.";
}
async function Bl(e, t = {}) {
  const n = n_();
  return (await me.get(`${n.siteUrl}${e}`, {
    ...t,
    headers: {
      ...t.headers,
      Authorization: `token ${n.apiKey}:${n.apiSecret}`
    }
  })).data;
}
function xP() {
  rt.handle("user:get-logged-user", async () => {
    try {
      return (await Bl(
        "/api/method/frappe.auth.get_logged_user"
      )).message;
    } catch (e) {
      const t = ql(e);
      throw console.error("Failed to fetch logged user:", t), new Error(t);
    }
  }), rt.handle("projects:get", async () => {
    try {
      return (await Bl(
        "/api/resource/Project",
        {
          params: {
            fields: JSON.stringify(["*"])
          }
        }
      )).data;
    } catch (e) {
      const t = ql(e);
      throw console.error("Failed to fetch projects:", t), new Error(t);
    }
  });
}
function bP() {
  rt.handle("settings:get", async () => ({
    screenshot_frequency_seconds: 300,
    idle_timeout_minutes: 5,
    popup_frequency_minutes: 30,
    auto_submit_timesheet: !1
  }));
}
function $P() {
  rt.handle("tasks:get", async (e, t) => {
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
function wP() {
  rt.handle("tracker:start", async (e, t) => {
    try {
      return console.log("Tracker Start Payload:", t), {
        success: !0,
        sessionId: "session-" + Date.now()
      };
    } catch (n) {
      return console.error(n), {
        success: !1,
        error: n.message
      };
    }
  }), rt.handle("tracker:stop", async (e, t) => {
    try {
      return console.log("Stopping Tracker:", t), {
        success: !0
      };
    } catch (n) {
      return console.error(n), {
        success: !1,
        error: n.message
      };
    }
  });
}
function _P() {
  Wd(), s_(), xP(), bP(), $P(), wP();
}
const Rd = Q.dirname(Id(import.meta.url));
process.env.APP_ROOT = Q.join(Rd, "..");
const Pd = process.env.VITE_DEV_SERVER_URL, $O = Q.join(process.env.APP_ROOT, "dist-electron"), EP = Q.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Pd ? Q.join(process.env.APP_ROOT, "public") : EP;
const Vl = {
  dirname: Rd,
  isDev: process.env.NODE_ENV === "development",
  viteDevServerUrl: Pd
};
_P();
Pt.whenReady().then(async () => {
  Vd(Vl), Pt.on("activate", () => {
    Hd(Vl);
  });
});
Pt.on("window-all-closed", () => {
  process.platform !== "darwin" && Pt.quit();
});
export {
  $O as MAIN_DIST,
  EP as RENDERER_DIST,
  Pd as VITE_DEV_SERVER_URL
};
