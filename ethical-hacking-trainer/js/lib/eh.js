// eh.js — ethical-hacking helpers used across levels.
// Pure functions. ES5-only. Safe to load in Node smoke test.
// NO real exploits, NO offensive payloads — utilities for puzzle math + sandboxed demos.
window.EHT = window.EHT || {};
EHT.lib = EHT.lib || {};

EHT.lib.eh = (function () {

  // ---------- Hash time-to-crack (very rough; for educational order-of-magnitude only) ----------
  // Modern attacker rig benchmarks (one consumer GPU, hashcat -b approximate):
  //   MD5      : ~50,000,000,000  (50 G H/s)
  //   SHA-1    : ~20,000,000,000  (20 G H/s)
  //   SHA-256  : ~10,000,000,000  (10 G H/s)
  //   bcrypt   : ~20,000          (20 K H/s)  cost factor 12
  //   argon2id : ~5,000           (5 K H/s)   normal m,t params
  var HASH_SPEED = {
    'md5':      5e10,
    'sha1':     2e10,
    'sha256':   1e10,
    'ntlm':     1e11,
    'bcrypt':   2e4,
    'argon2id': 5e3
  };
  function hashSpeed(name) { return HASH_SPEED[name] || 0; }

  // Password search space = charset_size ^ length
  // charset:
  //   lower      = 26
  //   loweralpha = 36
  //   alphanum   = 62
  //   ascii      = 95
  function charsetSize(name) {
    return ({ lower: 26, loweralpha: 36, alphanum: 62, ascii: 95 })[name] || 0;
  }
  function searchSpace(charset, length) {
    return Math.pow(charsetSize(charset), length);
  }
  // Average crack time = (search space / 2) / hashes per second.  Returns seconds.
  function crackSeconds(hashName, charset, length) {
    var s = hashSpeed(hashName);
    if (s <= 0) return Infinity;
    var space = searchSpace(charset, length);
    return (space / 2) / s;
  }
  function fmtSeconds(sec) {
    if (!isFinite(sec)) return '∞';
    if (sec < 1) return (sec * 1000).toFixed(1) + ' ms';
    if (sec < 60) return sec.toFixed(1) + ' s';
    if (sec < 3600) return (sec / 60).toFixed(1) + ' min';
    if (sec < 86400) return (sec / 3600).toFixed(1) + ' hr';
    if (sec < 31536000) return (sec / 86400).toFixed(1) + ' days';
    var years = sec / 31536000;
    if (years < 1e6) return years.toFixed(1) + ' years';
    if (years < 1e9) return (years / 1e6).toFixed(1) + ' million yr';
    if (years < 1e12) return (years / 1e9).toFixed(1) + ' billion yr';
    return (years / 1e12).toFixed(1) + ' trillion yr';
  }

  // ---------- Encoding helpers ----------
  function isBase64(s) { return /^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0; }
  function isHex(s) { return /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0; }
  function isUrlEnc(s) { return /%[0-9a-fA-F]{2}/.test(s); }

  function hexToString(hex) {
    var out = '';
    for (var i = 0; i < hex.length; i += 2) {
      out += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return out;
  }
  function stringToHex(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var h = s.charCodeAt(i).toString(16);
      if (h.length < 2) h = '0' + h;
      out += h;
    }
    return out;
  }

  // ---------- File permissions ----------
  // mode like 'rwsr-xr-x' → { owner:[r,w,suid], group:[r,x], other:[r,x], suid: true, sgid:false, sticky:false, octal: '4755' }
  function parsePerm(mode) {
    if (mode.length !== 9) return null;
    function bits(seg, isExecPos) {
      // isExecPos = 's' or 'S' or 't' or 'T' shows special bit overlapping x
      var r = seg[0] === 'r';
      var w = seg[1] === 'w';
      var x = seg[2] === 'x' || seg[2] === 's' || seg[2] === 't';
      var special = seg[2] === 's' || seg[2] === 'S' || seg[2] === 't' || seg[2] === 'T';
      return { r: r, w: w, x: x, special: special };
    }
    var owner = bits(mode.substr(0, 3));
    var group = bits(mode.substr(3, 3));
    var other = bits(mode.substr(6, 3));
    var suid = owner.special;
    var sgid = group.special;
    var sticky = other.special;
    function perm3(b) { return (b.r ? 4 : 0) + (b.w ? 2 : 0) + (b.x ? 1 : 0); }
    var special = (suid ? 4 : 0) + (sgid ? 2 : 0) + (sticky ? 1 : 0);
    var octal = '' + special + perm3(owner) + perm3(group) + perm3(other);
    return { owner: owner, group: group, other: other, suid: suid, sgid: sgid, sticky: sticky, octal: octal };
  }

  // ---------- Tiny SQLi sandbox: in-memory "users" table + concat-based query simulator ----------
  // For educational use ONLY. Mirrors what a vulnerable PHP/Node app might do.
  var DEMO_USERS = [
    { id: 1, username: 'admin',   password: 'P@ssw0rd!2024', role: 'admin' },
    { id: 2, username: 'alice',   password: 'butterfly42',   role: 'user' },
    { id: 3, username: 'bob',     password: 'qwerty',        role: 'user' },
    { id: 4, username: 'charlie', password: 'monkeybanana',  role: 'user' }
  ];
  // VULNERABLE pseudo-query (string concat): SELECT * FROM users WHERE username='X' AND password='Y'
  // We "execute" it on DEMO_USERS by literally evaluating the predicate the way SQL would.
  // The sandbox handles trivial injections like:  ' OR '1'='1
  function vulnerableLogin(username, password) {
    // String-concat the would-be query, then mini-parse the WHERE clause.
    // For pedagogy we only honor a handful of patterns. Anything past those returns "syntax error."
    var trimmedU = username.trim();
    var trimmedP = password.trim();
    // Plain login: literal match.
    var direct = DEMO_USERS.filter(function (u) { return u.username === trimmedU && u.password === trimmedP; });
    if (direct.length === 1) return { ok: true, user: direct[0], reason: 'normal-credential-match' };
    // Detect classic always-true tail in either field.
    var alwaysTrue = /'\s*(OR|UNION)\s+'?\d+'?\s*=\s*'?\d+/i;
    var commentTail = /(--|#|\/\*)/;
    function injects(s) { return alwaysTrue.test(s) || (s.indexOf("'") !== -1 && commentTail.test(s)); }
    if (injects(trimmedU) || injects(trimmedP)) {
      // SQL would now match the first row (admin).
      return { ok: true, user: DEMO_USERS[0], reason: 'sql-injection-bypass', note: 'The injected WHERE clause matched all rows; the DB returned the first.' };
    }
    return { ok: false, reason: 'no-match' };
  }

  // ---------- ECB visual demo ----------
  // Generate a deterministic 16x16 "image" + ECB-encrypt it block-by-block.
  // Real AES-ECB would map duplicated 16-byte blocks → duplicated 16-byte ciphertext.
  // We fake the SAME property: identical input cells → identical output color.
  // The point is pedagogical (the famous Linux penguin demo).
  function makeEcbDemo() {
    // Make a tiny 16x16 grid where each cell is a single "byte". Foreground cells = 1, background = 0.
    var GRID = [];
    for (var y = 0; y < 16; y++) {
      var row = [];
      for (var x = 0; x < 16; x++) {
        // Draw a smiley face: eyes + grin
        var on =
          (y === 4  && (x === 5 || x === 10)) ||
          (y === 5  && (x === 5 || x === 10)) ||
          (y === 10 && (x === 4 || x === 11)) ||
          (y === 11 && (x >= 5 && x <= 10));
        row.push(on ? 1 : 0);
      }
      GRID.push(row);
    }
    return GRID;
  }
  // Hash-by-byte function to make ECB output: same input byte → same output color.
  // (Actual AES is a permutation; we simulate the relevant property.)
  function ecbCellColor(byteVal) {
    if (byteVal === 0) return '#1f2533';
    if (byteVal === 1) return '#7ab7ff';
    return '#9aa3b2';
  }

  // ---------- Kill chain stages (Lockheed Martin model) ----------
  var KILL_CHAIN = [
    { name: 'Reconnaissance', desc: 'Gather info on the target. OSINT, port scans, subdomain enumeration. Goal: find attack surface.' },
    { name: 'Weaponization',  desc: 'Combine an exploit with a payload, e.g. embed a malicious macro in a Word file.' },
    { name: 'Delivery',       desc: 'Send the weapon to the victim — phishing email, malicious USB, watering-hole site.' },
    { name: 'Exploitation',   desc: 'Trigger the bug — user opens the doc, browser hits an evil URL, etc.' },
    { name: 'Installation',   desc: 'Drop persistence — service, scheduled task, registry run-key, cron entry.' },
    { name: 'Command & Control', desc: 'Phone home to the attacker over HTTPS / DNS / Slack / GitHub Issues / etc.' },
    { name: 'Actions on Objectives', desc: 'Whatever the attacker wanted: data exfil, ransomware detonation, lateral movement.' }
  ];

  // ---------- Helpers ----------
  function approxEq(a, b, tol) { tol = tol == null ? 0.05 : tol; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }

  return {
    HASH_SPEED: HASH_SPEED,
    hashSpeed: hashSpeed,
    charsetSize: charsetSize,
    searchSpace: searchSpace,
    crackSeconds: crackSeconds,
    fmtSeconds: fmtSeconds,
    isBase64: isBase64,
    isHex: isHex,
    isUrlEnc: isUrlEnc,
    hexToString: hexToString,
    stringToHex: stringToHex,
    parsePerm: parsePerm,
    DEMO_USERS: DEMO_USERS,
    vulnerableLogin: vulnerableLogin,
    makeEcbDemo: makeEcbDemo,
    ecbCellColor: ecbCellColor,
    KILL_CHAIN: KILL_CHAIN,
    approxEq: approxEq
  };
})();
