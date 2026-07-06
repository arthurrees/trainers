// Level 0 — Orientation
GT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Git is the universal undo/branch/collaborate tool for code. But most people learn it by memorizing commands without understanding the model underneath — then panic when something goes wrong. This trainer fixes that.',
  glossary: ['DAG', 'object store', 'SHA'],
  learn: ''
    + '<h4>What Git actually is</h4>'
    + '<p>Git is a <strong>content-addressed object store</strong> with a thin set of commands layered on top. That\'s it. Almost every confusing thing about Git — detached HEAD, rebase conflicts, "your branch has diverged" — becomes obvious once you see the underlying model.</p>'
    + '<p>Everything Git tracks is stored in <code>.git/objects/</code>. Every file snapshot, every directory listing, every commit — each gets compressed, hashed with SHA-1 (now SHA-256 in newer repos), and stored forever by its hash. The hash <em>is</em> the name.</p>'
    + '<div class="callout"><div class="label">Key insight</div>Two files with the same content get the same SHA and are stored once. Git never duplicates identical content.</div>'

    + '<h4>The three things people get wrong about Git</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Common belief</th><th>Reality</th></tr>'
    + '<tr><td>"Git stores diffs / changesets"</td><td>Git stores <strong>snapshots</strong>. Each commit is a complete picture of your project, not a list of changes. (Git does use delta compression internally for network transfer, but that\'s an implementation detail.)</td></tr>'
    + '<tr><td>"A branch is a copy of code"</td><td>A branch is a <strong>41-byte text file</strong> containing one commit SHA. Moving a branch forward just overwrites that file.</td></tr>'
    + '<tr><td>"git reset / rebase deletes commits"</td><td>Nothing is deleted until garbage collection runs. Old commits stay in <code>.git/objects/</code> for at least 30 days. The reflog remembers where you were.</td></tr>'
    + '</table>'

    + '<h4>The four object types</h4>'
    + '<p>Git has exactly four kinds of objects. You\'ll meet all of them in the next level.</p>'
    + '<ul>'
    + '<li><strong>blob</strong> — raw file content (no filename, no path, just bytes)</li>'
    + '<li><strong>tree</strong> — a directory listing: names, permissions, and pointers to blobs or sub-trees</li>'
    + '<li><strong>commit</strong> — a tree pointer, parent commit pointer(s), author/committer info, and message</li>'
    + '<li><strong>tag</strong> (annotated) — a pointer to a commit with extra metadata</li>'
    + '</ul>'
    + '<p>You can inspect any object: <code>git cat-file -t &lt;sha&gt;</code> (type) and <code>git cat-file -p &lt;sha&gt;</code> (contents).</p>'

    + '<h4>What makes Git hard (and what this trainer covers)</h4>'
    + '<ul>'
    + '<li><strong>L1</strong> — The object model (blobs, trees, commits, refs)</li>'
    + '<li><strong>L2</strong> — The three trees: working dir, index, HEAD</li>'
    + '<li><strong>L3</strong> — Refs and HEAD (branches as pointers)</li>'
    + '<li><strong>L4</strong> — Commits and the DAG (history as a graph)</li>'
    + '<li><strong>L5</strong> — Merging (fast-forward vs 3-way)</li>'
    + '<li><strong>L6</strong> — Rebase (history rewriting)</li>'
    + '<li><strong>L7</strong> — Detached HEAD (when HEAD points at a commit, not a branch)</li>'
    + '<li><strong>L8</strong> — Remote tracking refs (fetch / pull / push)</li>'
    + '<li><strong>L9</strong> — Reflog (your undo button)</li>'
    + '<li><strong>L10</strong> — Cherry-pick</li>'
    + '<li><strong>L11</strong> — .gitignore</li>'
    + '<li><strong>L12</strong> — Stash</li>'
    + '<li><strong>L13</strong> — Advanced ops (bisect, worktrees, pack files, shallow clones)</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">How to use this trainer</div>'
    + 'Each level: <strong>Learn</strong> (read the theory), <strong>Play</strong> (click around the sandbox — no goal, just exploration), <strong>Try</strong> (three graded puzzles). Harder puzzles at each level combine concepts from earlier levels. Start from Level 1 if you\'re brand new; jump to Level 6 if you already know branches and merges.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click a misconception to see the Git reality behind it.</p>';
    var myths = [
      {
        myth: '"Git branches are heavyweight — like copies of the codebase"',
        reality: 'A branch is just a text file in .git/refs/heads/ containing a 40-character SHA-1. Creating a branch is almost instantaneous and uses 41 bytes of disk space. Switching branches (git checkout) updates your working directory and index — the branch itself is trivial.'
      },
      {
        myth: '"git commit saves a diff of what changed"',
        reality: 'git commit saves a complete snapshot of every tracked file (as trees and blobs). It looks efficient because blobs with identical content share the same SHA and are stored once. Delta compression only happens in pack files for network transfer.'
      },
      {
        myth: '"git reset --hard destroyed my work"',
        reality: 'Probably not. git reflog shows every place HEAD has pointed in the last 90 days. Run "git reflog" to find the SHA you were at before the reset, then "git checkout -b rescue <sha>" to recover. Old commits stay in .git/objects/ until gc runs.'
      },
      {
        myth: '"Merge and rebase do the same thing"',
        reality: 'Both integrate changes from one branch into another — but merge adds a merge commit preserving the original history, while rebase replays commits as new objects with new SHAs, rewriting history. The resulting code can be identical, but the commit graph looks completely different.'
      },
      {
        myth: '"git pull fetches the latest code"',
        reality: 'git pull = git fetch + git merge (or rebase). The fetch downloads new commits and updates remote tracking refs (like origin/main). The merge integrates them into your local branch. You can, and often should, run fetch and merge separately to see what you\'re about to integrate.'
      }
    ];

    var grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.flexDirection = 'column';
    grid.style.gap = '8px';

    var detail = document.createElement('div');
    detail.className = 'formula-box';
    detail.style.marginTop = '12px';
    detail.innerHTML = '<span class="muted">← click a myth to bust it</span>';

    myths.forEach(function (m) {
      var btn = document.createElement('button');
      btn.className = 'secondary-btn';
      btn.style.textAlign = 'left';
      btn.style.padding = '10px 14px';
      btn.innerHTML = '🚫 ' + GT.escapeHtml(m.myth);
      btn.addEventListener('click', function () {
        detail.innerHTML = '<strong>Reality:</strong> ' + GT.escapeHtml(m.reality);
      });
      grid.appendChild(btn);
    });

    container.appendChild(grid);
    container.appendChild(detail);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Git stores file content as objects called <strong>blobs</strong>. If two files in different directories contain the exact same bytes, how many blob objects does Git create for them?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="1">1 (one shared blob, same SHA)</option>'
          + '<option value="2">2 (one per file)</option>'
          + '<option value="0">0 (Git skips identical files)</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Correct. Content-addressing means identical bytes → identical SHA → one object. This is how git stores thousands of node_modules without bloating .git.' };
        if (v === '2') return { correct: false, feedback: 'Not quite. Git hashes the content, not the filename. Same bytes = same hash = same object.' };
        return { correct: false, feedback: 'Git definitely stores something. Think about what the SHA is computed from.' };
      },
      hints: [
        'SHA is computed from the raw file content (plus a small header). Filename and path are NOT part of the blob.',
        'If two blobs would produce the same SHA, Git stores only one object. This is the definition of content-addressing.',
        'The answer is 1. Two files, one blob.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You ran <code>git reset --hard HEAD~3</code> by mistake and lost three commits. What is the fastest way to recover them, assuming you have not run <code>git gc</code>?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">Check .git/objects/ manually for loose object files</option>'
          + '<option value="b">Run git reflog to find the SHA and git checkout -b rescue &lt;sha&gt;</option>'
          + '<option value="c">Re-clone the repository from the remote</option>'
          + '<option value="d">The commits are gone — reset --hard is permanent</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'b') return { correct: true, feedback: 'Correct. The reflog records every position HEAD has been in (default 90-day retention). Find the SHA before the reset, create a branch there, done. This is one of the most important Git recovery techniques.' };
        if (v === 'd') return { correct: false, feedback: 'Not permanent. git reset --hard moves the branch pointer and updates the working tree, but the old commit objects remain in .git/objects/ until gc removes them.' };
        if (v === 'c') return { correct: false, feedback: 'Possible but the slowest option, and only works if you had pushed those three commits first.' };
        return { correct: false, feedback: 'You could do this, but it\'s tedious. Git has a purpose-built log of ref movements.' };
      },
      hints: [
        'git reset moves a branch pointer. It does not delete commit objects from .git/objects/.',
        'Git records every position HEAD has been in, even after resets. The command to view this log starts with "ref".',
        'git reflog shows entries like "HEAD@{1}: commit: my message". Find the SHA you want and run: git checkout -b rescue <sha>'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A colleague says: "I pushed a rebase to our shared feature branch — it should be fine since the code is identical." What specific problem does this cause, and what is the canonical fix for everyone else on the branch?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Explain the problem and the fix...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasProblem = v.indexOf('sha') !== -1 || v.indexOf('rewrite') !== -1 || v.indexOf('history') !== -1 || v.indexOf('diverge') !== -1 || v.indexOf('different') !== -1;
        var hasFix = v.indexOf('force') !== -1 || v.indexOf('reset') !== -1 || v.indexOf('fetch') !== -1;
        if (hasProblem && hasFix) return { correct: true, feedback: 'Correct. Rebase creates new commit SHAs even if the content is identical. Everyone else\'s local branch still points to the old SHA chain. They now have "diverged" history. Fix: git fetch origin && git reset --hard origin/feature-branch (losing any local-only commits on that branch).' };
        if (hasProblem) return { correct: false, feedback: 'Good — you identified the divergence problem. Now explain what everyone else should do to fix their local copy.' };
        return { correct: false, feedback: 'Think about what rebase changes about the commits beyond the content. Each rebased commit gets a new SHA even if the diff is identical.' };
      },
      hints: [
        'Rebase replays commits as new objects with new SHAs. Two commits with identical content but different parents will have different SHAs.',
        'If Alice has rebased and force-pushed, Bob\'s local origin/main still points to the old commits. Bob\'s history has "diverged" from the remote even though the code is the same.',
        'The fix: git fetch origin, then git reset --hard origin/feature-branch. This throws away Bob\'s local pointer and uses the remote\'s. Any local-only commits would be lost, so Bob needs to cherry-pick those back if needed.'
      ]
    }
  ]
});
