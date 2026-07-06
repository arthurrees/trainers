// set-ops.js — set operations on plain arrays (treated as sets, no duplicates)
window.DMT = window.DMT || {};
DMT.lib = DMT.lib || {};

DMT.lib.sets = (function () {
  function uniq(a) {
    var out = [];
    a.forEach(function (x) { if (out.indexOf(x) === -1) out.push(x); });
    return out;
  }
  function union(a, b) {
    return uniq(a.concat(b));
  }
  function intersect(a, b) {
    return a.filter(function (x) { return b.indexOf(x) !== -1; });
  }
  function difference(a, b) {
    return a.filter(function (x) { return b.indexOf(x) === -1; });
  }
  function symDiff(a, b) {
    return union(difference(a, b), difference(b, a));
  }
  function equal(a, b) {
    if (a.length !== b.length) return false;
    return a.every(function (x) { return b.indexOf(x) !== -1; });
  }
  function subset(a, b) {
    return a.every(function (x) { return b.indexOf(x) !== -1; });
  }
  function powerSet(a) {
    var n = a.length;
    var out = [];
    for (var i = 0; i < (1 << n); i++) {
      var sub = [];
      for (var j = 0; j < n; j++) if (i & (1 << j)) sub.push(a[j]);
      out.push(sub);
    }
    return out;
  }
  function format(s) {
    if (!s.length) return '∅';
    return '{ ' + s.join(', ') + ' }';
  }

  return {
    uniq: uniq, union: union, intersect: intersect,
    difference: difference, symDiff: symDiff,
    equal: equal, subset: subset, powerSet: powerSet,
    format: format
  };
})();
