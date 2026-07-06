// canvas-utils.js — small helpers
window.DMT = window.DMT || {};
DMT.lib = DMT.lib || {};

DMT.lib.canvas = (function () {
  function pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }
  function hitNode(g, x, y, r) {
    r = r || 24;
    for (var i = g.nodes.length - 1; i >= 0; i--) {
      var n = g.nodes[i];
      var dx = x - n.x, dy = y - n.y;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  }
  return { pos: pos, hitNode: hitNode };
})();

// Each level exports itself by pushing onto DMT.levels
window.DMT.levels = window.DMT.levels || [];
DMT.registerLevel = function (lvl) { DMT.levels.push(lvl); };
