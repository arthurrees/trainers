// Level 4 — Commits & the DAG
GT.registerLevel({
  id: 4,
  title: 'Commits & the DAG',
  whyItMatters: 'Every git log, rebase, merge, and cherry-pick traverses the commit graph. Once you see history as a DAG, commands like "rebase onto" and "find the merge base" become visual.',
  glossary: ['DAG', 'commit', 'orphan'],
  learn: ''
    + '<h4>History as a directed acyclic graph</h4>'
    + '<p>Git\'s commit history is a <strong>DAG</strong> (Directed Acyclic Graph). Each commit node has edges pointing to its parent(s). The direction is child → parent. "Acyclic" means you can never follow edges and get back to where you started.</p>'
    + '<p>Unlike a timeline or a list, a DAG can split (when you branch) and rejoin (when you merge).</p>'

    + '<h4>What a commit stores (review)</h4>'
    + '<ul>'
    + '<li><strong>tree</strong> — SHA of the root tree (the complete snapshot)</li>'
    + '<li><strong>parent</strong> — SHA(s) of parent commit(s)</li>'
    + '<li><strong>author</strong> — name, email, timestamp</li>'
    + '<li><strong>committer</strong> — name, email, timestamp (can differ from author after rebase/amend)</li>'
    + '<li><strong>message</strong> — free text</li>'
    + '</ul>'
    + '<p>There is no "diff" stored in a commit. <code>git show</code> computes the diff by comparing the commit\'s tree to its parent\'s tree on the fly.</p>'

    + '<h4>Graph shapes you\'ll encounter</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Shape</th><th>How it forms</th><th>What produces it</th></tr>'
    + '<tr><td>Linear chain</td><td>A → B → C (each has one parent)</td><td>Sequential commits on one branch</td></tr>'
    + '<tr><td>Fork</td><td>Two branches diverge from a common ancestor</td><td>git checkout -b new-branch</td></tr>'
    + '<tr><td>Merge commit</td><td>One commit with two parents</td><td>git merge</td></tr>'
    + '<tr><td>Octopus merge</td><td>One commit with 3+ parents</td><td>git merge branch1 branch2 branch3</td></tr>'
    + '<tr><td>Orphan root</td><td>Commit with no parent</td><td>First commit; git checkout --orphan</td></tr>'
    + '</table>'

    + '<h4>Reachability</h4>'
    + '<p>A commit X is <strong>reachable</strong> from commit Y if you can follow parent edges from Y and arrive at X. This concept drives garbage collection, merge-base detection, and the output of <code>git log</code>.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git log --oneline --graph --all\n<span class="out">* c3d4e5f (HEAD -&gt; main) Merge feature-login\n|\\  \n| * a1b2c3d (feature-login) Add login page\n| * 9f8e7d6 Add login route\n* | 7b6a5f4 Fix navbar\n|/  \n* 3c2b1a0 Initial commit</span></div>'
    + '<p>Reading a graph like this: <code>*</code> is a commit node, <code>|</code> and <code>\\</code> are edges, the leftmost column is the currently active line.</p>'

    + '<h4>Merge base — the common ancestor</h4>'
    + '<p>The <strong>merge base</strong> (also called lowest common ancestor, LCA) of two commits is the most recent commit reachable from both. Git uses it to compute 3-way merges and to find what changed on each branch since they diverged.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git merge-base main feature-login\n<span class="out">3c2b1a0...</span></div>'

    + '<div class="callout"><div class="label">git log traversal</div>'
    + 'git log starts at HEAD (or whatever commits you name) and walks parent pointers, printing each commit it visits. git log A..B means "commits reachable from B but NOT from A" — useful for seeing what\'s on a branch that hasn\'t been merged yet.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Build a commit graph. Click commits to highlight their ancestors.</p>';

    var lib = GT.lib.git;
    var commits = [
      { id: 'A', msg: 'Initial commit', parents: [], x: 320, y: 260 },
      { id: 'B', msg: 'Add README', parents: ['A'], x: 220, y: 180 },
      { id: 'C', msg: 'Add login', parents: ['B'], x: 120, y: 100 },
      { id: 'D', msg: 'Fix navbar', parents: ['B'], x: 320, y: 100 },
      { id: 'E', msg: 'Merge', parents: ['C', 'D'], x: 220, y: 20 }
    ];

    var canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 300;
    canvas.style.background = '#0a0c11';
    canvas.style.borderRadius = '6px';
    canvas.style.display = 'block';

    var selected = null;
    var info = document.createElement('div');
    info.className = 'formula-box';
    info.style.marginTop = '8px';
    info.innerHTML = '<span class="muted">Click a commit to highlight its ancestors</span>';

    function byId(id) { return commits.find(function (c) { return c.id === id; }); }

    function getAncestors(id) {
      var result = {};
      function walk(cid) {
        if (result[cid]) return;
        result[cid] = true;
        var c = byId(cid);
        if (c) c.parents.forEach(walk);
      }
      walk(id);
      return result;
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var ancestors = selected ? getAncestors(selected) : {};

      // Draw edges
      commits.forEach(function (c) {
        c.parents.forEach(function (pid) {
          var p = byId(pid);
          if (!p) return;
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = '#3a4256';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      });

      // Draw nodes
      commits.forEach(function (c) {
        var isSelected = c.id === selected;
        var isAncestor = ancestors[c.id] && !isSelected;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#7ab7ff' : (isAncestor ? '#a78bfa' : '#1e2433');
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#7ab7ff' : (isAncestor ? '#a78bfa' : '#3a4256');
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.id, c.x, c.y);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#9aa3b2';
        ctx.fillText(c.msg.slice(0, 12), c.x, c.y + 28);
      });
    }
    draw();

    canvas.addEventListener('click', function (evt) {
      var r = canvas.getBoundingClientRect();
      var mx = evt.clientX - r.left;
      var my = evt.clientY - r.top;
      var hit = null;
      commits.forEach(function (c) {
        var dx = mx - c.x, dy = my - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) hit = c.id;
      });
      if (hit) {
        selected = hit;
        var ancs = getAncestors(hit);
        delete ancs[hit];
        var ancList = Object.keys(ancs).join(', ') || 'none';
        info.innerHTML = '<strong>' + hit + ':</strong> ' + GT.escapeHtml(byId(hit).msg) + '<br>Ancestors: ' + ancList;
      } else {
        selected = null;
        info.innerHTML = '<span class="muted">Click a commit to highlight its ancestors</span>';
      }
      draw();
    });

    container.appendChild(canvas);
    container.appendChild(info);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'In the graph: <code>A ← B ← C ← D (main)</code> and <code>A ← B ← E (feature)</code>. What is the merge base of <code>main</code> and <code>feature</code>?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="A">A</option>'
          + '<option value="B">B</option>'
          + '<option value="C">C</option>'
          + '<option value="D">D</option>'
          + '<option value="E">E</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'B') return { correct: true, feedback: 'Correct. B is reachable from both main (D←C←B) and feature (E←B). A is also reachable from both, but B is more recent — it\'s the lowest common ancestor.' };
        if (v === 'A') return { correct: false, feedback: 'A is a common ancestor, but B is also a common ancestor and is more recent. The merge base is the MOST RECENT common ancestor.' };
        return { correct: false, feedback: 'Trace the parent edges from each branch tip. Where do the paths first meet?' };
      },
      hints: [
        'Follow parents: main tip D → C → B → A. Feature tip E → B → A.',
        'Both paths pass through B. Both paths pass through A. Which is more recent?',
        'B is the lowest common ancestor (merge base) because it\'s the most recent commit reachable from both tips.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<code>git log main..feature</code> — what does the <code>..</code> notation mean exactly? For graph: main=D, feature=E, common ancestor=B; commits are A,B,C,D on main and A,B,E on feature.',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">Commits reachable from feature but NOT from main (i.e., E only)</option>'
          + '<option value="b">Commits reachable from main but NOT from feature (i.e., C, D)</option>'
          + '<option value="c">All commits reachable from both main and feature</option>'
          + '<option value="d">The diff between main and feature tips</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'a') return { correct: true, feedback: 'Correct. A..B means "reachable from B, but exclude everything reachable from A." So main..feature = commits on feature not yet on main. In this graph, that\'s just E. This is how you see "what\'s on my feature branch that I haven\'t merged yet."' };
        if (v === 'b') return { correct: false, feedback: 'That would be feature..main — you swapped the order. A..B is "what B has that A doesn\'t."' };
        return { correct: false, feedback: 'The .. notation is about set subtraction in the commit graph. X..Y means: reachable from Y, minus reachable from X.' };
      },
      hints: [
        'X..Y is a set subtraction: {commits reachable from Y} minus {commits reachable from X}.',
        'main..feature = {from feature} minus {from main} = commits on feature not yet on main.',
        'In this graph: feature is E, B, A. main is D, C, B, A. Subtract main\'s set: only E remains.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have this history: root←A←B←C (main) and root←A←D←E (feature). You run <code>git log --all --oneline</code> and see 6 commits. How many commits would <code>git log main...feature</code> (three dots) show, and which ones?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'How many commits, and which ones...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasCount = v.indexOf('4') !== -1;
        var hasBoth = (v.indexOf('b') !== -1 && v.indexOf('c') !== -1 && v.indexOf('d') !== -1 && v.indexOf('e') !== -1) ||
                      v.indexOf('b, c, d, e') !== -1 || v.indexOf('b,c,d,e') !== -1;
        if (hasCount && hasBoth) return { correct: true, feedback: 'Correct. Three-dot (X...Y) is symmetric difference: commits reachable from X or Y, but not both. Both sides reach root and A — those are excluded. main-only: B, C. Feature-only: D, E. Total: 4 commits.' };
        if (hasCount) return { correct: false, feedback: '4 is right. Now which ones? Think about which commits are exclusive to each branch.' };
        return { correct: false, feedback: 'Three-dot is X...Y = (X..Y) union (Y..X) = symmetric difference. Commits unique to either side, excluding shared ancestors.' };
      },
      hints: [
        'Three dots (X...Y) = symmetric difference: (X..Y) ∪ (Y..X).',
        'main..feature = D, E (on feature only). feature..main = B, C (on main only).',
        '4 commits total: B, C (main-only) + D, E (feature-only). root and A are reachable from both, so excluded.'
      ]
    }
  ]
});
