// canvas-utils.js — small helpers
window.LT = window.LT || {};
LT.lib = LT.lib || {};

LT.lib.canvas = (function () {
  function pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }
  return { pos: pos };
})();

// Each level exports itself by pushing onto LT.levels
window.LT.levels = window.LT.levels || [];
LT.registerLevel = function (lvl) { LT.levels.push(lvl); };
