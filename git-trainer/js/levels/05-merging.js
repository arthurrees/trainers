// Level 5 — Merging
GT.registerLevel({
  id: 5,
  title: 'Merging',
  whyItMatters: 'Merge is the safest way to combine branches — it never rewrites history. Knowing when Git fast-forwards vs creates a merge commit, and how conflicts are resolved, removes the fear from "git merge".',
  glossary: ['merge', 'fast-forward', '3-way merge'],
  learn: ''
    + '<h4>Two kinds of merge</h4>'
    + '<p>When you run <code>git merge feature</code> from main, Git first checks whether the branches have diverged:</p>'

    + '<h4>Fast-forward merge</h4>'
    + '<p>If <em>main has not moved since feature branched off</em>, main\'s tip is an ancestor of feature\'s tip. Git can simply move the main pointer forward to feature\'s tip. No new commit is created.</p>'
    + '<div class="terminal">Before:  A ← B ← C (main)\n                 ↖ D ← E (feature)\n\nAfter ff: A ← B ← C ← D ← E (main, feature)</div>'
    + '<p>Fast-forward happens automatically when possible. To prevent it and always create a merge commit: <code>git merge --no-ff feature</code>.</p>'

    + '<h4>Three-way merge</h4>'
    + '<p>If both branches have new commits since their common ancestor, Git performs a three-way merge using:</p>'
    + '<ol>'
    + '<li>The <strong>merge base</strong> (common ancestor)</li>'
    + '<li>The <strong>current branch tip</strong> (ours)</li>'
    + '<li>The <strong>other branch tip</strong> (theirs)</li>'
    + '</ol>'
    + '<p>Git computes what each side changed relative to the base. If the same lines were not touched by both sides, Git auto-merges. If the same lines were changed by both sides, that\'s a <strong>conflict</strong>.</p>'
    + '<div class="terminal">Before:  A ← B ← C (main)\n         ↑\n         A ← D ← E (feature)\n\nAfter:   A ← B ← C ← M (main) ← merge commit\n                  ↑         ↑\n              A ← D ← E (feature)</div>'
    + '<p>The merge commit M has two parents: C and E.</p>'

    + '<h4>Merge conflicts</h4>'
    + '<p>When both branches changed the same line(s), Git can\'t decide which version to use. It writes conflict markers into the file and stops:</p>'
    + '<div class="terminal">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD\nThis is the main branch version.\n=======\nThis is the feature branch version.\n&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature</div>'
    + '<p>You edit the file to the desired final state, remove the markers, then <code>git add</code> the file and <code>git commit</code> to complete the merge.</p>'
    + '<p>Useful tools: <code>git mergetool</code>, VS Code\'s merge editor, <code>git checkout --ours file</code> (accept current branch) or <code>git checkout --theirs file</code> (accept incoming).</p>'

    + '<h4>Merge strategies</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Strategy</th><th>When used</th></tr>'
    + '<tr><td><code>ort</code> (default since Git 2.34)</td><td>Two-branch merges. Handles renames well.</td></tr>'
    + '<tr><td><code>octopus</code></td><td>Merging more than two branches at once (no conflicts allowed).</td></tr>'
    + '<tr><td><code>ours</code></td><td>Keep our tree, discard theirs entirely.</td></tr>'
    + '<tr><td><code>subtree</code></td><td>For merging a sub-path rather than the whole tree.</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">--no-ff and history legibility</div>'
    + 'Fast-forward merges produce a cleaner linear log, but you lose the record that those commits were on a feature branch. Many teams use --no-ff for feature merges so git log --graph shows the branch structure. It\'s a workflow preference, not a correctness issue.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Watch how fast-forward vs 3-way merge changes the commit graph.</p>';

    var canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 260;
    canvas.style.background = '#0a0c11';
    canvas.style.borderRadius = '6px';
    canvas.style.display = 'block';

    var mode = 'before'; // before | ff | threeway

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      function node(x, y, label, color, sub) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = color || '#1e2433';
        ctx.fill();
        ctx.strokeStyle = color || '#3a4256';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(label, x, y);
        if (sub) {
          ctx.font = '9px monospace';
          ctx.fillStyle = '#9aa3b2';
          ctx.fillText(sub, x, y + 32);
        }
      }

      function arrow(x1, y1, x2, y2, color) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color || '#3a4256';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      function label(x, y, text, color) {
        ctx.font = '11px monospace';
        ctx.fillStyle = color || '#7ab7ff';
        ctx.fillText(text, x, y);
      }

      if (mode === 'before') {
        ctx.fillStyle = '#9aa3b2'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
        ctx.fillText('Before merge: two diverged branches', 20, 20);
        ctx.textAlign = 'center';
        arrow(80, 130, 140, 130); node(60, 130, 'A', '#4ade80', 'base');
        arrow(140, 130, 200, 130); node(160, 130, 'B', '#4ade80');
        arrow(200, 130, 260, 100); node(280, 90, 'C', '#7ab7ff', 'main');
        arrow(200, 130, 260, 160); node(280, 170, 'D', '#a78bfa');
        arrow(280, 170, 340, 170); node(360, 170, 'E', '#a78bfa', 'feature');
        label(280, 65, 'main ↑', '#7ab7ff');
        label(360, 148, 'feature ↑', '#a78bfa');
      } else if (mode === 'ff') {
        ctx.fillStyle = '#9aa3b2'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
        ctx.fillText('Fast-forward merge (no new commits on main)', 20, 20);
        ctx.textAlign = 'center';
        arrow(60, 130, 120, 130); node(40, 130, 'A', '#4ade80', 'base');
        arrow(120, 130, 180, 130); node(140, 130, 'B', '#4ade80');
        arrow(180, 130, 240, 130); node(200, 130, 'C', '#4ade80');
        arrow(240, 130, 300, 130); node(260, 130, 'D', '#7ab7ff');
        arrow(300, 130, 360, 130); node(320, 130, 'E', '#7ab7ff');
        label(320, 100, 'main ↑\nfeature ↑', '#7ab7ff');
        ctx.fillStyle = '#4ade80'; ctx.font = '11px monospace';
        ctx.fillText('✓ main pointer moved forward — no merge commit', 250, 230);
      } else if (mode === 'threeway') {
        ctx.fillStyle = '#9aa3b2'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
        ctx.fillText('3-way merge (both branches advanced)', 20, 20);
        ctx.textAlign = 'center';
        node(60, 140, 'A', '#4ade80', 'base');
        arrow(80, 140, 130, 110); node(150, 100, 'B', '#7ab7ff');
        arrow(170, 100, 220, 100); node(240, 100, 'C', '#7ab7ff');
        arrow(80, 140, 130, 170); node(150, 180, 'D', '#a78bfa');
        arrow(170, 180, 220, 180); node(240, 180, 'E', '#a78bfa');
        arrow(260, 100, 320, 140); arrow(260, 180, 320, 140);
        node(340, 140, 'M', '#fbbf24', 'merge');
        label(240, 70, 'main', '#7ab7ff');
        label(240, 205, 'feature', '#a78bfa');
        label(340, 110, 'main ↑', '#fbbf24');
      }
    }
    draw();

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';
    btnRow.style.marginTop = '10px';

    function makeBtn(label, m) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.textContent = label;
      b.addEventListener('click', function () { mode = m; draw(); });
      return b;
    }
    btnRow.appendChild(makeBtn('Before merge', 'before'));
    btnRow.appendChild(makeBtn('Fast-forward', 'ff'));
    btnRow.appendChild(makeBtn('3-way merge', 'threeway'));

    container.appendChild(canvas);
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You are on <code>main</code>. You run <code>git merge feature</code>. The output says "Fast-forward". How many new commit objects were created?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="0">0 — no new commits, just a pointer move</option>'
          + '<option value="1">1 — a merge commit</option>'
          + '<option value="2">2 — one for each branch tip</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '0') return { correct: true, feedback: 'Correct. Fast-forward means main\'s tip was an ancestor of feature\'s tip. Git simply moves main\'s pointer to feature\'s tip. No new commit object is needed — the history is already linear.' };
        if (v === '1') return { correct: false, feedback: 'A merge commit has two parents and is only created for a 3-way merge. Fast-forward just moves the pointer.' };
        return { correct: false, feedback: 'Fast-forward merges are defined by the absence of new commits.' };
      },
      hints: [
        'Fast-forward means "no divergence" — main is behind feature with nothing else added.',
        'When there\'s no divergence, Git only needs to move the branch pointer forward.',
        '0 new commits. Fast-forward = pointer move only.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Both <code>main</code> and <code>feature</code> modified <code>config.js</code> since their common ancestor, but on different lines. Will Git produce a merge conflict?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="yes">Yes — any change to the same file causes a conflict</option>'
          + '<option value="no">No — different lines auto-merge successfully</option>'
          + '<option value="depends">It depends on the merge strategy used</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'no') return { correct: true, feedback: 'Correct. Git\'s 3-way merge works line by line. If main changed line 10 and feature changed line 50, Git can safely apply both changes. A conflict only occurs when both sides changed the same line(s) in incompatible ways.' };
        if (v === 'yes') return { correct: false, feedback: 'Not quite. Git merges at the line level, not the file level. Same file ≠ conflict. Only same lines modified by both sides = conflict.' };
        return { correct: false, feedback: 'The default merge strategy (ort) handles this case — the key is whether the same lines were changed.' };
      },
      hints: [
        'Git\'s merge compares three versions: base, ours, theirs — line by line.',
        'If line 10 changed in ours but not theirs, Git accepts our version for line 10. Same logic for theirs.',
        'No conflict. Different lines in the same file can always auto-merge.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You are resolving a merge conflict in <code>app.js</code>. You want to keep <em>both</em> sets of changes, not pick one. After editing the file manually to include both, what is the sequence of commands to finish the merge?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'List the commands...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasAdd = v.indexOf('git add') !== -1 || v.indexOf('add app') !== -1;
        var hasCommit = v.indexOf('git commit') !== -1 || v.indexOf('commit') !== -1;
        if (hasAdd && hasCommit) return { correct: true, feedback: 'Correct. After manually resolving conflict markers and editing the file to the desired state: (1) git add app.js to stage the resolved file, (2) git commit to create the merge commit. Git knows it\'s in a mid-merge state (via .git/MERGE_HEAD) and will auto-fill the commit message.' };
        if (hasAdd) return { correct: false, feedback: 'Good — git add stages the resolved file. What completes the merge?' };
        return { correct: false, feedback: 'After editing the file, you need to tell Git you resolved it (stage it), then finalize the merge.' };
      },
      hints: [
        'Git marks a file as conflicted. After you manually edit it to have the right content, you need to "resolve" it.',
        'Resolving = staging the file with git add. This tells Git "I\'ve handled this conflict."',
        'git add app.js, then git commit. Git detects .git/MERGE_HEAD and creates the merge commit automatically.'
      ]
    }
  ]
});
