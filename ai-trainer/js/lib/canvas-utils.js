// canvas-utils.js — small helpers
window.AIT = window.AIT || {};
AIT.lib = AIT.lib || {};

AIT.lib.canvas = (function () {
  function pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }
  // Map a value in [vMin, vMax] to a pixel in [pMin, pMax]
  function scale(v, vMin, vMax, pMin, pMax) {
    return pMin + (pMax - pMin) * (v - vMin) / (vMax - vMin);
  }
  // Inverse of scale
  function unscale(p, pMin, pMax, vMin, vMax) {
    return vMin + (vMax - vMin) * (p - pMin) / (pMax - pMin);
  }
  return { pos: pos, scale: scale, unscale: unscale };
})();
