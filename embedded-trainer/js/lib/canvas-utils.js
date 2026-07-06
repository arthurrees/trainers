// canvas-utils.js — small helpers
window.EST = window.EST || {};
EST.lib = EST.lib || {};

EST.lib.canvas = (function () {
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

// Each level exports itself by pushing onto EST.levels
window.EST.levels = window.EST.levels || [];
EST.registerLevel = function (lvl) { EST.levels.push(lvl); };
