// git.js — Git Trainer utility library (GT.lib.git)
// Pure ES5 functions. No DOM. Safe to run in Node for smoke tests.
window.GT = window.GT || {};
GT.lib = GT.lib || {};

GT.lib.git = (function () {

  // --- Fake SHA: deterministic short hash for display ---
  function fakeHash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
      h = h & 0xffffffff;
    }
    var hex = (h >>> 0).toString(16);
    while (hex.length < 8) hex = '0' + hex;
    return hex;
  }

  // Return first 7 chars (like git's short SHA)
  function shortHash(str) {
    return fakeHash(str).slice(0, 7);
  }

  // --- DAG utilities ---
  // commits: array of { id, message, parents: [id, ...] }
  // Returns array of ids in topological order (children before parents)
  function topoSort(commits) {
    var byId = {};
    commits.forEach(function (c) { byId[c.id] = c; });
    var visited = {};
    var order = [];
    function visit(id) {
      if (visited[id]) return;
      visited[id] = true;
      var c = byId[id];
      if (c) {
        (c.parents || []).forEach(function (pid) { visit(pid); });
      }
      order.push(id);
    }
    commits.forEach(function (c) { visit(c.id); });
    return order.reverse();
  }

  // Returns the set of ancestor ids for a given commit id
  function ancestors(id, byId) {
    var result = {};
    function walk(cid) {
      if (result[cid]) return;
      result[cid] = true;
      var c = byId[cid];
      if (c) (c.parents || []).forEach(walk);
    }
    walk(id);
    delete result[id];
    return result;
  }

  // Find the lowest common ancestor of two commit ids
  function lca(idA, idB, commits) {
    var byId = {};
    commits.forEach(function (c) { byId[c.id] = c; });
    var ancsA = ancestors(idA, byId);
    ancsA[idA] = true;
    // Walk up from B until we hit a node in ancsA
    var queue = [idB];
    var seen = {};
    while (queue.length) {
      var cur = queue.shift();
      if (seen[cur]) continue;
      seen[cur] = true;
      if (ancsA[cur]) return cur;
      var c = byId[cur];
      if (c) (c.parents || []).forEach(function (p) { queue.push(p); });
    }
    return null;
  }

  // Simulate a rebase: take commits on branchTip (not in baseTip ancestry),
  // replay them on top of baseTip with new fake SHAs.
  // Returns array of new commit objects.
  function rebase(commits, branchTipId, baseTipId) {
    var byId = {};
    commits.forEach(function (c) { byId[c.id] = c; });

    var baseAncs = ancestors(baseTipId, byId);
    baseAncs[baseTipId] = true;

    // Collect commits reachable from branchTip but not in base ancestry
    var toReplay = [];
    var queue = [branchTipId];
    var seen = {};
    while (queue.length) {
      var cur = queue.shift();
      if (seen[cur] || baseAncs[cur]) continue;
      seen[cur] = true;
      toReplay.push(cur);
      var c = byId[cur];
      if (c) (c.parents || []).forEach(function (p) { queue.push(p); });
    }
    // Reverse so we replay oldest-first
    toReplay.reverse();

    // Replay
    var newCommits = [];
    var parentId = baseTipId;
    toReplay.forEach(function (id) {
      var orig = byId[id];
      var newId = shortHash('rebase:' + id + ':onto:' + baseTipId + ':' + parentId);
      newCommits.push({ id: newId, message: orig.message, parents: [parentId], originalId: id });
      parentId = newId;
    });
    return newCommits;
  }

  // --- .gitignore pattern matching ---
  // Returns true if path matches pattern (simplified: no ** globstar, handles * and ?)
  function matchIgnorePattern(pattern, path) {
    // Strip leading /
    var p = pattern.replace(/^\//, '');
    // Convert glob to regex
    var regStr = '^' + p.replace(/[.+^${}()|[\]\\]/g, '\\$&')
                         .replace(/\*/g, '[^/]*')
                         .replace(/\?/g, '[^/]') + '(/.*)?$';
    try {
      return new RegExp(regStr).test(path);
    } catch (e) {
      return false;
    }
  }

  // matchIgnore: given array of {pattern, negate} rules and a path,
  // returns { matched: bool, rule: pattern|null }
  function matchIgnore(rules, path) {
    var lastMatch = null;
    rules.forEach(function (r) {
      if (matchIgnorePattern(r.pattern, path)) {
        lastMatch = r;
      }
    });
    if (!lastMatch) return { matched: false, rule: null };
    return { matched: !lastMatch.negate, rule: lastMatch.pattern };
  }

  // Parse a .gitignore text into rules array
  function parseIgnore(text) {
    var rules = [];
    text.split('\n').forEach(function (line) {
      var t = line.trim();
      if (!t || t[0] === '#') return;
      var negate = t[0] === '!';
      if (negate) t = t.slice(1);
      rules.push({ pattern: t, negate: negate });
    });
    return rules;
  }

  // --- Stash simulation ---
  // stash is an array of { id, message, branch, diff }
  function stashPush(stack, entry) {
    var id = 'stash@{' + stack.length + '}';
    var copy = { id: id, message: entry.message || 'WIP on branch', branch: entry.branch || 'main', diff: entry.diff || [] };
    return [copy].concat(stack);
  }
  function stashPop(stack) {
    if (!stack.length) return { stack: stack, entry: null };
    return { stack: stack.slice(1), entry: stack[0] };
  }

  // --- Canvas layout helpers (shared across Play surfaces) ---
  function pos(canvas, evt) {
    var r = canvas.getBoundingClientRect();
    return { x: evt.clientX - r.left, y: evt.clientY - r.top };
  }

  return {
    fakeHash: fakeHash,
    shortHash: shortHash,
    topoSort: topoSort,
    ancestors: ancestors,
    lca: lca,
    rebase: rebase,
    matchIgnore: matchIgnore,
    matchIgnorePattern: matchIgnorePattern,
    parseIgnore: parseIgnore,
    stashPush: stashPush,
    stashPop: stashPop,
    pos: pos
  };
})();

GT.levels = GT.levels || [];
GT.registerLevel = function (lvl) { GT.levels.push(lvl); };
