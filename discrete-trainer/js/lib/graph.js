// graph.js — undirected graph with node/edge model + BFS/DFS
window.DMT = window.DMT || {};
DMT.lib = DMT.lib || {};

DMT.lib.graph = (function () {
  function create() { return { nodes: [], edges: [], _next: 0 }; }

  function addNode(g, x, y, label) {
    var id = g._next++;
    g.nodes.push({ id: id, x: x, y: y, label: label || ('n' + id) });
    return id;
  }
  function findNode(g, id) {
    for (var i = 0; i < g.nodes.length; i++) if (g.nodes[i].id === id) return g.nodes[i];
    return null;
  }
  function hasEdge(g, a, b) {
    return g.edges.some(function (e) {
      return (e.a === a && e.b === b) || (e.a === b && e.b === a);
    });
  }
  function addEdge(g, a, b) {
    if (a === b) return false;
    if (hasEdge(g, a, b)) return false;
    g.edges.push({ a: a, b: b });
    return true;
  }
  function removeEdge(g, a, b) {
    g.edges = g.edges.filter(function (e) {
      return !((e.a === a && e.b === b) || (e.a === b && e.b === a));
    });
  }
  function removeNode(g, id) {
    g.nodes = g.nodes.filter(function (n) { return n.id !== id; });
    g.edges = g.edges.filter(function (e) { return e.a !== id && e.b !== id; });
  }
  function neighbors(g, id) {
    var out = [];
    g.edges.forEach(function (e) {
      if (e.a === id) out.push(e.b);
      else if (e.b === id) out.push(e.a);
    });
    return out;
  }
  function degree(g, id) { return neighbors(g, id).length; }

  function isConnected(g) {
    if (g.nodes.length === 0) return true;
    var visited = {};
    var stack = [g.nodes[0].id];
    while (stack.length) {
      var v = stack.pop();
      if (visited[v]) continue;
      visited[v] = true;
      neighbors(g, v).forEach(function (n) { if (!visited[n]) stack.push(n); });
    }
    return g.nodes.every(function (n) { return visited[n.id]; });
  }

  function isBipartite(g) {
    var color = {};
    for (var i = 0; i < g.nodes.length; i++) {
      var startId = g.nodes[i].id;
      if (color[startId] !== undefined) continue;
      var queue = [startId];
      color[startId] = 0;
      while (queue.length) {
        var v = queue.shift();
        var nbrs = neighbors(g, v);
        for (var j = 0; j < nbrs.length; j++) {
          var n = nbrs[j];
          if (color[n] === undefined) { color[n] = 1 - color[v]; queue.push(n); }
          else if (color[n] === color[v]) return false;
        }
      }
    }
    return true;
  }

  function bfs(g, startId) {
    var visited = {}, order = [];
    var queue = [startId];
    visited[startId] = true;
    while (queue.length) {
      var v = queue.shift();
      order.push(v);
      var nbrs = neighbors(g, v).sort(function (a, b) { return a - b; });
      nbrs.forEach(function (n) {
        if (!visited[n]) { visited[n] = true; queue.push(n); }
      });
    }
    return order;
  }
  function dfs(g, startId) {
    var visited = {}, order = [];
    function go(v) {
      if (visited[v]) return;
      visited[v] = true;
      order.push(v);
      var nbrs = neighbors(g, v).sort(function (a, b) { return a - b; });
      nbrs.forEach(go);
    }
    go(startId);
    return order;
  }

  function hasCycle(g) {
    var visited = {};
    function dfs2(v, parent) {
      visited[v] = true;
      var nbrs = neighbors(g, v);
      for (var i = 0; i < nbrs.length; i++) {
        var n = nbrs[i];
        if (!visited[n]) {
          if (dfs2(n, v)) return true;
        } else if (n !== parent) return true;
      }
      return false;
    }
    for (var i = 0; i < g.nodes.length; i++) {
      var id = g.nodes[i].id;
      if (!visited[id] && dfs2(id, -1)) return true;
    }
    return false;
  }

  function isTree(g) {
    return g.nodes.length > 0 && isConnected(g) && !hasCycle(g);
  }

  function isEulerian(g) {
    if (g.nodes.length === 0) return true;
    var nonIso = g.nodes.filter(function (n) { return degree(g, n.id) > 0; });
    if (nonIso.length === 0) return true;
    var visited = {};
    var stack = [nonIso[0].id];
    while (stack.length) {
      var v = stack.pop();
      if (visited[v]) continue;
      visited[v] = true;
      neighbors(g, v).forEach(function (n) { if (!visited[n]) stack.push(n); });
    }
    if (!nonIso.every(function (n) { return visited[n.id]; })) return false;
    return g.nodes.every(function (n) { return degree(g, n.id) % 2 === 0; });
  }

  function draw(g, canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // edges
    ctx.strokeStyle = opts.edgeColor || '#7ab7ff';
    ctx.lineWidth = 2;
    g.edges.forEach(function (e) {
      var a = findNode(g, e.a), b = findNode(g, e.b);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    // nodes
    var hi = opts.highlight || [];
    var sel = opts.selected;
    g.nodes.forEach(function (n) {
      var isHi = hi.indexOf(n.id) !== -1;
      var isSel = sel === n.id;
      ctx.fillStyle = isHi ? '#a78bfa' : (isSel ? '#fbbf24' : '#1f2533');
      ctx.strokeStyle = isSel ? '#fbbf24' : '#7ab7ff';
      ctx.lineWidth = isSel ? 3 : 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e6e8ee';
      ctx.font = 'bold 13px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label || String(n.id), n.x, n.y);
    });
  }

  return {
    create: create, addNode: addNode, addEdge: addEdge, hasEdge: hasEdge,
    removeEdge: removeEdge, removeNode: removeNode,
    findNode: findNode, neighbors: neighbors, degree: degree,
    isConnected: isConnected, isBipartite: isBipartite,
    bfs: bfs, dfs: dfs, hasCycle: hasCycle, isTree: isTree,
    isEulerian: isEulerian, draw: draw
  };
})();
