// canvas-utils.js — small helpers + level registry
window.RXT = window.RXT || {};
RXT.lib = RXT.lib || {};

RXT.lib.canvas = (function () {
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

// Each level exports itself by pushing onto RXT.levels
window.RXT.levels = window.RXT.levels || [];
RXT.registerLevel = function (lvl) { RXT.levels.push(lvl); };
