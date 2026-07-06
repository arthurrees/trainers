// mat.js — minimal matrix/vector math used across levels.
// Matrices are arrays of arrays: m[row][col]. Vectors are flat arrays.
window.AIT = window.AIT || {};
AIT.lib = AIT.lib || {};

AIT.lib.mat = (function () {

  function shape(M) {
    if (!Array.isArray(M)) return [0, 0];
    if (!Array.isArray(M[0])) return [M.length]; // vector
    return [M.length, M[0].length];
  }

  function dot(a, b) {
    if (a.length !== b.length) throw new Error('dot: length mismatch ' + a.length + ' vs ' + b.length);
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  // Matrix-matrix multiply A (m×n) × B (n×p) → C (m×p)
  function matmul(A, B) {
    var aR = A.length, aC = A[0].length;
    var bR = B.length, bC = B[0].length;
    if (aC !== bR) throw new Error('matmul shape mismatch: (' + aR + 'x' + aC + ') × (' + bR + 'x' + bC + ')');
    var C = [];
    for (var i = 0; i < aR; i++) {
      var row = [];
      for (var j = 0; j < bC; j++) {
        var s = 0;
        for (var k = 0; k < aC; k++) s += A[i][k] * B[k][j];
        row.push(s);
      }
      C.push(row);
    }
    return C;
  }

  // Matrix-vector multiply: A (m×n) × x (n) → y (m)
  function matvec(A, x) {
    if (A[0].length !== x.length) throw new Error('matvec shape mismatch');
    var y = [];
    for (var i = 0; i < A.length; i++) {
      var s = 0;
      for (var j = 0; j < x.length; j++) s += A[i][j] * x[j];
      y.push(s);
    }
    return y;
  }

  function transpose(A) {
    var r = A.length, c = A[0].length;
    var T = [];
    for (var j = 0; j < c; j++) {
      var row = [];
      for (var i = 0; i < r; i++) row.push(A[i][j]);
      T.push(row);
    }
    return T;
  }

  // Element-wise add of two equal-shaped matrices (or vectors)
  function add(A, B) {
    if (Array.isArray(A[0])) {
      return A.map(function (row, i) { return row.map(function (v, j) { return v + B[i][j]; }); });
    }
    return A.map(function (v, i) { return v + B[i]; });
  }

  function vecAdd(a, b) {
    if (a.length !== b.length) throw new Error('vecAdd length mismatch');
    return a.map(function (v, i) { return v + b[i]; });
  }
  function vecSub(a, b) {
    if (a.length !== b.length) throw new Error('vecSub length mismatch');
    return a.map(function (v, i) { return v - b[i]; });
  }
  function vecScale(a, k) {
    return a.map(function (v) { return v * k; });
  }
  function vecNorm(a) {
    return Math.sqrt(dot(a, a));
  }
  function cosine(a, b) {
    var na = vecNorm(a), nb = vecNorm(b);
    if (na === 0 || nb === 0) return 0;
    return dot(a, b) / (na * nb);
  }

  // Softmax of a vector
  function softmax(v) {
    var m = Math.max.apply(null, v); // for numerical stability
    var ex = v.map(function (x) { return Math.exp(x - m); });
    var s = ex.reduce(function (a, b) { return a + b; }, 0);
    return ex.map(function (x) { return x / s; });
  }

  // Round all entries to `digits` decimals — for display
  function round(M, digits) {
    var k = Math.pow(10, digits || 4);
    if (Array.isArray(M[0])) return M.map(function (r) { return r.map(function (v) { return Math.round(v * k) / k; }); });
    return M.map(function (v) { return Math.round(v * k) / k; });
  }

  return {
    shape: shape,
    dot: dot,
    matmul: matmul,
    matvec: matvec,
    transpose: transpose,
    add: add,
    vecAdd: vecAdd,
    vecSub: vecSub,
    vecScale: vecScale,
    vecNorm: vecNorm,
    cosine: cosine,
    softmax: softmax,
    round: round
  };
})();
