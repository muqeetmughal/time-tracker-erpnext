import ie from "events";
import H from "path";
import te from "fs";
import oe from "os";
function ae(e, i) {
  for (var u = 0; u < i.length; u++) {
    const s = i[u];
    if (typeof s != "string" && !Array.isArray(s)) {
      for (const E in s)
        if (E !== "default" && !(E in e)) {
          const d = Object.getOwnPropertyDescriptor(s, E);
          d && Object.defineProperty(e, E, d.get ? d : {
            enumerable: !0,
            get: () => s[E]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
var c = {};
function Y(e) {
  throw new Error('Could not dynamically require "' + e + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var k = { exports: {} }, D, K;
function ue() {
  if (K) return D;
  K = 1;
  var e = te, i = H, u = oe, s = typeof __webpack_require__ == "function" ? __non_webpack_require__ : Y, E = process.config && process.config.variables || {}, d = !!process.env.PREBUILDS_ONLY, O = process.versions.modules, _ = z() ? "electron" : Q() ? "node-webkit" : "node", v = process.env.npm_config_arch || u.arch(), h = process.env.npm_config_platform || u.platform(), R = process.env.LIBC || (J(h) ? "musl" : "glibc"), N = process.env.ARM_VERSION || (v === "arm64" ? "8" : E.arm_version) || "", A = (process.versions.uv || "").split(".")[0];
  D = p;
  function p(r) {
    return s(p.resolve(r));
  }
  p.resolve = p.path = function(r) {
    r = i.resolve(r || ".");
    try {
      var t = s(i.join(r, "package.json")).name.toUpperCase().replace(/-/g, "_");
      process.env[t + "_PREBUILD"] && (r = process.env[t + "_PREBUILD"]);
    } catch {
    }
    if (!d) {
      var n = U(i.join(r, "build/Release"), F);
      if (n) return n;
      var a = U(i.join(r, "build/Debug"), F);
      if (a) return a;
    }
    var m = g(r);
    if (m) return m;
    var o = g(i.dirname(process.execPath));
    if (o) return o;
    var X = [
      "platform=" + h,
      "arch=" + v,
      "runtime=" + _,
      "abi=" + O,
      "uv=" + A,
      N ? "armv=" + N : "",
      "libc=" + R,
      "node=" + process.versions.node,
      process.versions.electron ? "electron=" + process.versions.electron : "",
      typeof __webpack_require__ == "function" ? "webpack=true" : ""
      // eslint-disable-line
    ].filter(Boolean).join(" ");
    throw new Error("No native build was found for " + X + `
    loaded from: ` + r + `
`);
    function g(S) {
      var ee = b(i.join(S, "prebuilds")).map(L), q = ee.filter(B(h, v)).sort(V)[0];
      if (q) {
        var I = i.join(S, "prebuilds", q.name), re = b(I).map(M), ne = re.filter(C(_, O)), j = ne.sort(P(_))[0];
        if (j) return i.join(I, j.file);
      }
    }
  };
  function b(r) {
    try {
      return e.readdirSync(r);
    } catch {
      return [];
    }
  }
  function U(r, t) {
    var n = b(r).filter(t);
    return n[0] && i.join(r, n[0]);
  }
  function F(r) {
    return /\.node$/.test(r);
  }
  function L(r) {
    var t = r.split("-");
    if (t.length === 2) {
      var n = t[0], a = t[1].split("+");
      if (n && a.length && a.every(Boolean))
        return { name: r, platform: n, architectures: a };
    }
  }
  function B(r, t) {
    return function(n) {
      return n == null || n.platform !== r ? !1 : n.architectures.includes(t);
    };
  }
  function V(r, t) {
    return r.architectures.length - t.architectures.length;
  }
  function M(r) {
    var t = r.split("."), n = t.pop(), a = { file: r, specificity: 0 };
    if (n === "node") {
      for (var m = 0; m < t.length; m++) {
        var o = t[m];
        if (o === "node" || o === "electron" || o === "node-webkit")
          a.runtime = o;
        else if (o === "napi")
          a.napi = !0;
        else if (o.slice(0, 3) === "abi")
          a.abi = o.slice(3);
        else if (o.slice(0, 2) === "uv")
          a.uv = o.slice(2);
        else if (o.slice(0, 4) === "armv")
          a.armv = o.slice(4);
        else if (o === "glibc" || o === "musl")
          a.libc = o;
        else
          continue;
        a.specificity++;
      }
      return a;
    }
  }
  function C(r, t) {
    return function(n) {
      return !(n == null || n.runtime && n.runtime !== r && !Z(n) || n.abi && n.abi !== t && !n.napi || n.uv && n.uv !== A || n.armv && n.armv !== N || n.libc && n.libc !== R);
    };
  }
  function Z(r) {
    return r.runtime === "node" && r.napi;
  }
  function P(r) {
    return function(t, n) {
      return t.runtime !== n.runtime ? t.runtime === r ? -1 : 1 : t.abi !== n.abi ? t.abi ? -1 : 1 : t.specificity !== n.specificity ? t.specificity > n.specificity ? -1 : 1 : 0;
    };
  }
  function Q() {
    return !!(process.versions && process.versions.nw);
  }
  function z() {
    return process.versions && process.versions.electron || process.env.ELECTRON_RUN_AS_NODE ? !0 : typeof window < "u" && window.process && window.process.type === "renderer";
  }
  function J(r) {
    return r === "linux" && e.existsSync("/etc/alpine-release");
  }
  return p.parseTags = M, p.matchTags = C, p.compareTags = P, p.parseTuple = L, p.matchTuple = B, p.compareTuples = V, D;
}
const w = typeof __webpack_require__ == "function" ? __non_webpack_require__ : Y;
typeof w.addon == "function" ? k.exports = w.addon.bind(w) : k.exports = ue();
var se = k.exports, y, T;
Object.defineProperty(c, "__esModule", { value: !0 });
var G = c.uIOhook = W = c.UiohookKey = T = c.WheelDirection = y = c.EventType = void 0;
const ce = ie, pe = H, f = se((0, pe.join)(__dirname, ".."));
var x;
(function(e) {
  e[e.Tap = 0] = "Tap", e[e.Down = 1] = "Down", e[e.Up = 2] = "Up";
})(x || (x = {}));
var l;
(function(e) {
  e[e.EVENT_KEY_PRESSED = 4] = "EVENT_KEY_PRESSED", e[e.EVENT_KEY_RELEASED = 5] = "EVENT_KEY_RELEASED", e[e.EVENT_MOUSE_CLICKED = 6] = "EVENT_MOUSE_CLICKED", e[e.EVENT_MOUSE_PRESSED = 7] = "EVENT_MOUSE_PRESSED", e[e.EVENT_MOUSE_RELEASED = 8] = "EVENT_MOUSE_RELEASED", e[e.EVENT_MOUSE_MOVED = 9] = "EVENT_MOUSE_MOVED", e[e.EVENT_MOUSE_WHEEL = 11] = "EVENT_MOUSE_WHEEL";
})(l || (y = c.EventType = l = {}));
var $;
(function(e) {
  e[e.VERTICAL = 3] = "VERTICAL", e[e.HORIZONTAL = 4] = "HORIZONTAL";
})($ || (T = c.WheelDirection = $ = {}));
var W = c.UiohookKey = {
  Backspace: 14,
  Tab: 15,
  Enter: 28,
  CapsLock: 58,
  Escape: 1,
  Space: 57,
  PageUp: 3657,
  PageDown: 3665,
  End: 3663,
  Home: 3655,
  ArrowLeft: 57419,
  ArrowUp: 57416,
  ArrowRight: 57421,
  ArrowDown: 57424,
  Insert: 3666,
  Delete: 3667,
  0: 11,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10,
  A: 30,
  B: 48,
  C: 46,
  D: 32,
  E: 18,
  F: 33,
  G: 34,
  H: 35,
  I: 23,
  J: 36,
  K: 37,
  L: 38,
  M: 50,
  N: 49,
  O: 24,
  P: 25,
  Q: 16,
  R: 19,
  S: 31,
  T: 20,
  U: 22,
  V: 47,
  W: 17,
  X: 45,
  Y: 21,
  Z: 44,
  Numpad0: 82,
  Numpad1: 79,
  Numpad2: 80,
  Numpad3: 81,
  Numpad4: 75,
  Numpad5: 76,
  Numpad6: 77,
  Numpad7: 71,
  Numpad8: 72,
  Numpad9: 73,
  NumpadMultiply: 55,
  NumpadAdd: 78,
  NumpadSubtract: 74,
  NumpadDecimal: 83,
  NumpadDivide: 3637,
  NumpadEnter: 3612,
  NumpadEnd: 61007,
  NumpadArrowDown: 61008,
  NumpadPageDown: 61009,
  NumpadArrowLeft: 61003,
  NumpadArrowRight: 61005,
  NumpadHome: 60999,
  NumpadArrowUp: 61e3,
  NumpadPageUp: 61001,
  NumpadInsert: 61010,
  NumpadDelete: 61011,
  F1: 59,
  F2: 60,
  F3: 61,
  F4: 62,
  F5: 63,
  F6: 64,
  F7: 65,
  F8: 66,
  F9: 67,
  F10: 68,
  F11: 87,
  F12: 88,
  F13: 91,
  F14: 92,
  F15: 93,
  F16: 99,
  F17: 100,
  F18: 101,
  F19: 102,
  F20: 103,
  F21: 104,
  F22: 105,
  F23: 106,
  F24: 107,
  Semicolon: 39,
  Equal: 13,
  Comma: 51,
  Minus: 12,
  Period: 52,
  Slash: 53,
  Backquote: 41,
  BracketLeft: 26,
  Backslash: 43,
  BracketRight: 27,
  Quote: 40,
  Ctrl: 29,
  // Left
  CtrlRight: 3613,
  Alt: 56,
  // Left
  AltRight: 3640,
  Shift: 42,
  // Left
  ShiftRight: 54,
  Meta: 3675,
  MetaRight: 3676,
  NumLock: 69,
  ScrollLock: 70,
  PrintScreen: 3639
};
class Ee extends ce.EventEmitter {
  handler(i) {
    switch (this.emit("input", i), i.type) {
      case l.EVENT_KEY_PRESSED:
        this.emit("keydown", i);
        break;
      case l.EVENT_KEY_RELEASED:
        this.emit("keyup", i);
        break;
      case l.EVENT_MOUSE_CLICKED:
        this.emit("click", i);
        break;
      case l.EVENT_MOUSE_MOVED:
        this.emit("mousemove", i);
        break;
      case l.EVENT_MOUSE_PRESSED:
        this.emit("mousedown", i);
        break;
      case l.EVENT_MOUSE_RELEASED:
        this.emit("mouseup", i);
        break;
      case l.EVENT_MOUSE_WHEEL:
        this.emit("wheel", i);
        break;
    }
  }
  start() {
    f.start(this.handler.bind(this));
  }
  stop() {
    f.stop();
  }
  keyTap(i, u = []) {
    if (!u.length) {
      f.keyTap(i, x.Tap);
      return;
    }
    for (const E of u)
      f.keyTap(E, x.Down);
    f.keyTap(i, x.Tap);
    let s = u.length;
    for (; s--; )
      f.keyTap(u[s], x.Up);
  }
  keyToggle(i, u) {
    f.keyTap(i, u === "down" ? x.Down : x.Up);
  }
}
G = c.uIOhook = new Ee();
const de = /* @__PURE__ */ ae({
  __proto__: null,
  get EventType() {
    return y;
  },
  get UiohookKey() {
    return W;
  },
  get WheelDirection() {
    return T;
  },
  default: c,
  get uIOhook() {
    return G;
  }
}, [c]);
export {
  de as i
};
