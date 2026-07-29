// Level 13 — Bonus: Graphs and Trees
DMT.registerLevel({
  id: 13,
  title: 'Bonus: Graphs & Trees',
  whyItMatters: 'A graph = nodes connected by edges. It is the data structure for: social networks, road maps, the web, file systems, dependencies, neural nets. Half of every algorithms class is graph algorithms.',
  glossary: ['V', 'E', 'deg(v)', 'BFS', 'DFS'],
  learn: ''
    + '<h4>Vocabulary</h4>'
    + '<ul>'
    +   '<li>A <strong>graph</strong> G = (V, E) is a set V of <strong>vertices</strong> (nodes) and a set E of <strong>edges</strong> (connections between pairs of vertices).</li>'
    +   '<li>The <strong>degree</strong> of a vertex v, written <code class="inline">deg(v)</code>, is the number of edges touching it.</li>'
    +   '<li>A <strong>walk</strong> follows adjacent vertices and may repeat them. A <strong>path</strong> is a walk with no repeated vertices. A <strong>cycle</strong> starts and ends at the same vertex, with no other repeated vertices.</li>'
    +   '<li>A graph is <strong>connected</strong> if you can get from any vertex to any other along edges.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Handshake lemma</div>'
    + 'Sum of all degrees = 2 × (number of edges). Each edge contributes 1 to two vertices\' degrees. Therefore the number of vertices with odd degree is always even.'
    + '</div>'

    + '<h4>Two key traversals</h4>'
    + '<ul>'
    +   '<li><strong>BFS (breadth-first search)</strong>: explore outward layer by layer. Uses a queue. Finds shortest paths in unweighted graphs.</li>'
    +   '<li><strong>DFS (depth-first search)</strong>: go as deep as possible, then back up. Uses a stack (or recursion). Useful for cycles, connected components, topological order.</li>'
    + '</ul>'

    + '<h4>Special graphs you should know</h4>'
    + '<ul>'
    +   '<li><strong>Bipartite</strong>: vertices split into two groups, every edge crosses between groups. Equivalent: 2-colourable. Equivalent: no odd cycle.</li>'
    +   '<li><strong>Tree</strong>: connected and has no cycles. Always has exactly |V| − 1 edges.</li>'
    +   '<li><strong>Complete graph K<sub>n</sub></strong>: every pair of vertices is connected. C(n,2) edges.</li>'
    +   '<li><strong>Eulerian</strong>: a nonempty graph where you can walk every edge exactly once and return to the start. In this trainer, that means the whole graph is connected and every vertex has even degree.</li>'
    + '</ul>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Click empty space to add a node. Click two nodes in succession to add or remove an edge between them. Right-click a node to delete it.</p>'
      + '<div class="canvas-host"><canvas id="g-canvas" width="640" height="360" tabindex="0" role="img" aria-label="Interactive undirected graph editor. Tap empty space to add a node and tap two nodes to toggle an edge."></canvas></div>'
      + '<div class="controls-row" style="margin-top:10px">'
      +   '<button class="secondary-btn" id="g-clear">Clear</button>'
      +   '<button class="secondary-btn" id="g-delete">Delete selected node</button>'
      +   '<button class="secondary-btn" id="g-bfs">Run BFS from selected</button>'
      +   '<button class="secondary-btn" id="g-dfs">Run DFS from selected</button>'
      + '</div>'
      + '<div id="g-info" style="margin-top:10px" aria-live="polite"></div>';

    var canvas = container.querySelector('#g-canvas');
    var info = container.querySelector('#g-info');
    var g = DMT.lib.graph.create();
    var pendingEdgeFrom = null;
    var selected = null;
    var highlight = [];

    function nodesAt(x, y) {
      return DMT.lib.canvas.hitNode(g, x, y);
    }
    function render() {
      DMT.lib.graph.draw(g, canvas, { selected: selected, highlight: highlight });
      var degrees = g.nodes.map(function (n) { return DMT.lib.graph.degree(g, n.id); });
      var info_html = '';
      info_html += '<span class="tag">|V| = ' + g.nodes.length + '</span>';
      info_html += '<span class="tag">|E| = ' + g.edges.length + '</span>';
      info_html += '<span class="tag ' + (DMT.lib.graph.isConnected(g) ? 'yes' : 'no') + '">' + (DMT.lib.graph.isConnected(g) ? 'connected' : 'disconnected') + '</span>';
      info_html += '<span class="tag ' + (DMT.lib.graph.isBipartite(g) ? 'yes' : 'no') + '">bipartite' + (DMT.lib.graph.isBipartite(g) ? '' : ' (no)') + '</span>';
      info_html += '<span class="tag ' + (DMT.lib.graph.hasCycle(g) ? '' : 'yes') + '">' + (DMT.lib.graph.hasCycle(g) ? 'has cycle' : 'acyclic') + '</span>';
      info_html += '<span class="tag ' + (DMT.lib.graph.isTree(g) ? 'yes' : '') + '">' + (DMT.lib.graph.isTree(g) ? 'tree' : 'not a tree') + '</span>';
      info_html += '<span class="tag ' + (DMT.lib.graph.isEulerian(g) ? 'yes' : '') + '">' + (DMT.lib.graph.isEulerian(g) ? 'eulerian' : 'not eulerian') + '</span>';
      info_html += '<div style="margin-top:6px;font-size:13px"><span class="muted">degrees:</span> ' + degrees.join(', ') + ' &nbsp; <span class="muted">(handshake check: sum = ' + degrees.reduce(function (a, b) { return a + b; }, 0) + ', should equal 2|E| = ' + (2 * g.edges.length) + ')</span></div>';
      if (selected !== null) info_html += '<div class="muted" style="font-size:13px;margin-top:4px">selected: node ' + selected + ' (' + (g.nodes.find(function (n) { return n.id === selected; }) || {}).label + ')</div>';
      info.innerHTML = info_html;
    }
    function clearHighlight() { highlight = []; }

    canvas.addEventListener('click', function (e) {
      var p = DMT.lib.canvas.pos(canvas, e);
      var hit = nodesAt(p.x, p.y);
      if (hit) {
        if (pendingEdgeFrom !== null && pendingEdgeFrom !== hit.id) {
          if (DMT.lib.graph.hasEdge(g, pendingEdgeFrom, hit.id)) {
            DMT.lib.graph.removeEdge(g, pendingEdgeFrom, hit.id);
          } else {
            DMT.lib.graph.addEdge(g, pendingEdgeFrom, hit.id);
          }
          pendingEdgeFrom = null;
          selected = hit.id;
        } else {
          pendingEdgeFrom = hit.id;
          selected = hit.id;
        }
      } else {
        DMT.lib.graph.addNode(g, p.x, p.y);
        pendingEdgeFrom = null;
      }
      clearHighlight();
      render();
    });
    canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      var p = DMT.lib.canvas.pos(canvas, e);
      var hit = nodesAt(p.x, p.y);
      if (hit) {
        DMT.lib.graph.removeNode(g, hit.id);
        if (pendingEdgeFrom === hit.id) pendingEdgeFrom = null;
        if (selected === hit.id) selected = null;
        clearHighlight();
        render();
      }
    });

    container.querySelector('#g-clear').addEventListener('click', function () {
      g = DMT.lib.graph.create();
      selected = null; pendingEdgeFrom = null; clearHighlight(); render();
    });
    container.querySelector('#g-delete').addEventListener('click', function () {
      if (selected === null) { alert('Select a node first.'); return; }
      DMT.lib.graph.removeNode(g, selected);
      pendingEdgeFrom = null; selected = null; clearHighlight(); render();
    });
    container.querySelector('#g-bfs').addEventListener('click', function () {
      if (selected === null) { alert('Click a node first to select it as the BFS start.'); return; }
      highlight = DMT.lib.graph.bfs(g, selected);
      render();
    });
    container.querySelector('#g-dfs').addEventListener('click', function () {
      if (selected === null) { alert('Click a node first to select it as the DFS start.'); return; }
      highlight = DMT.lib.graph.dfs(g, selected);
      render();
    });

    // Seed with a small example
    DMT.lib.graph.addNode(g, 120, 90);
    DMT.lib.graph.addNode(g, 320, 90);
    DMT.lib.graph.addNode(g, 520, 90);
    DMT.lib.graph.addNode(g, 220, 250);
    DMT.lib.graph.addNode(g, 420, 250);
    DMT.lib.graph.addEdge(g, 0, 1);
    DMT.lib.graph.addEdge(g, 1, 2);
    DMT.lib.graph.addEdge(g, 0, 3);
    DMT.lib.graph.addEdge(g, 3, 4);
    DMT.lib.graph.addEdge(g, 2, 4);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'In a graph with 5 vertices where every vertex has degree exactly 2, how many edges does it have?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 5) return { correct: true, feedback: 'Handshake lemma: sum of degrees = 2|E|. Sum = 5 × 2 = 10. So |E| = 5.' };
        return { correct: false, feedback: 'Use the handshake lemma: sum of degrees = 2|E|. 5 × 2 = 10, divide by 2: 5 edges.' };
      },
      hints: [
        'Sum of all degrees in a graph equals twice the number of edges (handshake lemma).',
        '5 vertices × 2 = 10 total degree.',
        '10 / 2 = 5 edges.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Which of the following must be true of any tree with n ≥ 1 vertices?',
      mountInput: function (c) {
        var items = [
          { label: 'It is connected.', t: true },
          { label: 'It has exactly n − 1 edges.', t: true },
          { label: 'It contains at least one cycle.', t: false },
          { label: 'Every vertex has the same degree.', t: false },
          { label: 'It is bipartite.', t: true }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var ok = v.every(function (b) { return b.picked === b.expected; });
        if (ok) return { correct: true, feedback: 'A tree is connected, has n−1 edges, has no cycle (so bipartite — only odd cycles can break bipartiteness, and a tree has none). Degrees vary in general.' };
        return { correct: false, feedback: 'Connected ✓, n−1 edges ✓, no cycles ✗ (trees have none), bipartite ✓ (no cycles → no odd cycles → bipartite). Vertex degrees can vary.' };
      },
      hints: [
        'Definition of a tree: connected and acyclic.',
        'Property: |E| = |V| − 1 always.',
        'No cycles → no ODD cycles → bipartite. Degrees? Can vary (a "path" tree and a "star" tree look very different).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Build an Eulerian graph on vertices A, B, C, D by selecting edges. Your answer must be connected and every vertex must have even degree.',
      mountInput: function (c) {
        var edges = ['AB', 'AC', 'AD', 'BC', 'BD', 'CD'];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = edges.map(function (edge) {
          var label = document.createElement('label');
          var box = document.createElement('input'); box.type = 'checkbox';
          label.appendChild(box); label.appendChild(document.createTextNode(' edge ' + edge)); div.appendChild(label);
          return { edge: edge, box: box };
        });
        c.appendChild(div);
        return function () { return boxes.filter(function (x) { return x.box.checked; }).map(function (x) { return x.edge; }); };
      },
      check: function (v) {
        var g = DMT.lib.graph.create();
        ['A', 'B', 'C', 'D'].forEach(function (label) { DMT.lib.graph.addNode(g, 0, 0, label); });
        var ids = { A: 0, B: 1, C: 2, D: 3 };
        v.forEach(function (edge) { DMT.lib.graph.addEdge(g, ids[edge[0]], ids[edge[1]]); });
        if (!DMT.lib.graph.isConnected(g)) return { correct: false, feedback: 'Not connected yet—every vertex must be reachable from every other.' };
        var bad = g.nodes.filter(function (n) { return DMT.lib.graph.degree(g, n.id) % 2 !== 0; });
        if (bad.length > 0) return { correct: false, feedback: 'These vertices have odd degree: ' + bad.map(function (n) { return n.label; }).join(', ') + '.' };
        return { correct: true, feedback: 'Connected + every vertex even degree → Eulerian. You could traverse every edge exactly once and end where you started.' };
      },
      hints: [
        'A simple cycle is Eulerian because every vertex has degree 2.',
        'Make a 4-cycle A–B–C–D–A.',
        'Select AB, BC, CD, and AD.'
      ]
    }
  ]
});
