// canvas-utils.js — small helpers
window.EHT = window.EHT || {};
EHT.lib = EHT.lib || {};

EHT.lib.canvas = (function () {
  function pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }
  function scale(v, vMin, vMax, pMin, pMax) {
    return pMin + (pMax - pMin) * (v - vMin) / (vMax - vMin);
  }
  function unscale(p, pMin, pMax, vMin, vMax) {
    return vMin + (vMax - vMin) * (p - pMin) / (pMax - pMin);
  }
  return { pos: pos, scale: scale, unscale: unscale };
})();
