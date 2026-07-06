// storage.js — localStorage wrapper for progress and notes
window.DMT = window.DMT || {};

DMT.storage = (function () {
  var KEY = 'dmt_state_v1';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      var s = JSON.parse(raw);
      // shape-check
      if (!s || typeof s !== 'object') return defaultState();
      s.solved = s.solved || {};
      s.notes = s.notes || {};
      s.currentLevel = typeof s.currentLevel === 'number' ? s.currentLevel : 0;
      return s;
    } catch (e) {
      return defaultState();
    }
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  function defaultState() {
    return { solved: {}, notes: {}, currentLevel: 0 };
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  // public helpers
  function isSolved(levelId, puzzleIdx) {
    var s = load();
    return !!(s.solved[levelId] && s.solved[levelId][puzzleIdx]);
  }
  function markSolved(levelId, puzzleIdx) {
    var s = load();
    s.solved[levelId] = s.solved[levelId] || {};
    s.solved[levelId][puzzleIdx] = true;
    save(s);
  }
  function levelCompleted(levelId, totalPuzzles) {
    var s = load();
    var lvl = s.solved[levelId] || {};
    for (var i = 0; i < totalPuzzles; i++) if (!lvl[i]) return false;
    return true;
  }
  function getNote(levelId) {
    return load().notes[levelId] || '';
  }
  function setNote(levelId, text) {
    var s = load();
    s.notes[levelId] = text;
    save(s);
  }
  function getCurrentLevel() { return load().currentLevel; }
  function setCurrentLevel(n) { var s = load(); s.currentLevel = n; save(s); }

  return {
    load: load, save: save, reset: reset,
    isSolved: isSolved, markSolved: markSolved,
    levelCompleted: levelCompleted,
    getNote: getNote, setNote: setNote,
    getCurrentLevel: getCurrentLevel, setCurrentLevel: setCurrentLevel
  };
})();
