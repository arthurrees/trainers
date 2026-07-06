// Level 6 — Rebase
GT.registerLevel({
  id: 6,
  title: 'Rebase',
  whyItMatters: 'Rebase produces a cleaner linear history than merge — but it rewrites commits. Understanding exactly what rebase does (and doesn\'t do) is what separates confident git users from those who accidentally destroy shared history.',
  glossary: ['rebase', 'interactive rebase', 'SHA'],
  learn: ''
    + '<h4>What rebase does</h4>'
    + '<p>Rebase takes the commits on your current branch (that aren\'t in the target) and <em>replays</em> each one, in order, on top of the target branch. Each replayed commit gets a <strong>new SHA</strong> — it\'s a new object with a different parent, even if the diff is identical.</p>'
    + '<div class="terminal">Before:\n  main: A ← B ← C\n  feature: A ← D ← E\n\ngit checkout feature && git rebase main\n\nAfter:\n  main: A ← B ← C\n  feature: A ← B ← C ← D\' ← E\'\n  (D\' and E\' are new objects with new SHAs)</div>'
    + '<p>Note: D and E still exist in the object store — they\'re just no longer reachable from the feature branch ref.</p>'

    + '<h4>Rebase vs merge — same result, different graph</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Merge</th><th>Rebase</th></tr>'
    + '<tr><td>Resulting code</td><td>Same</td><td>Same</td></tr>'
    + '<tr><td>History graph</td><td>Branching (merge commit with 2 parents)</td><td>Linear (no merge commit)</td></tr>'
    + '<tr><td>Original commit SHAs</td><td>Preserved</td><td>Replaced with new SHAs</td></tr>'
    + '<tr><td>Safe on shared branches?</td><td>Yes</td><td>No — rewrites history</td></tr>'
    + '</table>'

    + '<h4>The golden rule</h4>'
    + '<div class="callout"><div class="label">Never rebase public/shared branches</div>'
    + 'If others have cloned or pulled your branch, rebase replaces the SHAs they rely on. Their local commits appear to "diverge" even though the content is the same. The fix (git reset --hard) discards their local work. Always rebase private feature branches; always merge public ones.'
    + '</div>'

    + '<h4>Interactive rebase — rewriting history intentionally</h4>'
    + '<p><code>git rebase -i HEAD~4</code> opens an editor listing the last 4 commits with actions you can change:</p>'
    + '<div class="terminal">pick a1b2c3d Add login route\npick e4f5a6b Add login page\npick 7c8d9e0 Fix typo\npick f1a2b3c Add tests</div>'
    + '<p>Available actions (replace "pick" with one of these):</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Action</th><th>What it does</th></tr>'
    + '<tr><td><code>pick</code></td><td>Use the commit as-is</td></tr>'
    + '<tr><td><code>reword</code></td><td>Use the commit, but edit the message</td></tr>'
    + '<tr><td><code>edit</code></td><td>Stop and let you amend the commit</td></tr>'
    + '<tr><td><code>squash</code></td><td>Merge into the previous commit, combine messages</td></tr>'
    + '<tr><td><code>fixup</code></td><td>Merge into the previous commit, discard this message</td></tr>'
    + '<tr><td><code>drop</code></td><td>Remove this commit entirely</td></tr>'
    + '</table>'
    + '<p>You can also reorder lines to reorder commits, as long as there are no dependencies between them.</p>'

    + '<h4>Aborting a rebase in progress</h4>'
    + '<p>If conflicts arise mid-rebase and you want to bail: <code>git rebase --abort</code> restores everything to the state before you started. If you\'ve already resolved some conflicts and want to continue: <code>git rebase --continue</code>.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate a rebase. Watch old commits become new ones with different SHAs.</p>';

    var lib = GT.lib.git;

    var baseCommits = [
      { id: 'A', sha: lib.shortHash('A'), msg: 'Initial commit', parents: [] },
      { id: 'B', sha: lib.shortHash('B:A'), msg: 'Add README', parents: ['A'] },
      { id: 'C', sha: lib.shortHash('C:B'), msg: 'Fix bug on main', parents: ['B'] }
    ];
    var featureCommits = [
      { id: 'D', sha: lib.shortHash('D:B'), msg: 'Add login page', parents: ['B'] },
      { id: 'E', sha: lib.shortHash('E:D'), msg: 'Add tests', parents: ['D'] }
    ];

    var rebased = false;
    var rebasedCommits = [];

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '12px';

    function render() {
      var lines = [];
      lines.push('<strong>main:</strong>  A(' + lib.shortHash('A').slice(0,6) + ') ← B(' + lib.shortHash('B:A').slice(0,6) + ') ← C(' + lib.shortHash('C:B').slice(0,6) + ')');
      if (!rebased) {
        lines.push('<strong>feature (before):</strong>  A ← B ← D(' + lib.shortHash('D:B').slice(0,6) + ') ← E(' + lib.shortHash('E:D').slice(0,6) + ')');
        lines.push('');
        lines.push('<span class="muted">↑ D and E are based on B, not C. To update feature onto main, rebase.</span>');
      } else {
        lines.push('<strong>feature (after rebase onto main):</strong>');
        rebasedCommits.forEach(function (rc) {
          lines.push('  A ← B ← C ← ... ← ' + rc.id + '\'(' + rc.id + ') <span style="color:#fbbf24">new SHA!</span> msg: ' + GT.escapeHtml(rc.message));
        });
        lines.push('');
        lines.push('<span style="color:#4ade80">✓ Original D(' + lib.shortHash('D:B').slice(0,6) + ') and E(' + lib.shortHash('E:D').slice(0,6) + ') still in object store — now orphaned.</span>');
      }
      display.innerHTML = lines.join('<br>');
    }
    render();

    var btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.style.marginTop = '10px';
    btn.textContent = 'git rebase main (on feature)';
    btn.addEventListener('click', function () {
      if (rebased) { rebased = false; rebasedCommits = []; btn.textContent = 'git rebase main (on feature)'; render(); return; }
      var allCommits = baseCommits.concat(featureCommits);
      rebasedCommits = lib.rebase(allCommits, 'E', 'C');
      rebased = true;
      btn.textContent = 'Reset (undo rebase visualization)';
      render();
    });

    container.appendChild(display);
    container.appendChild(btn);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You rebase your feature branch onto main. The resulting code is identical to what a merge would have produced. Are the commit SHAs for your feature commits the same or different from before the rebase?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="same">Same — git reuse existing objects when content is identical</option>'
          + '<option value="different">Different — rebase always creates new commits with new SHAs</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'different') return { correct: true, feedback: 'Correct. Even if the diff is byte-for-byte identical, the new commits have a different parent SHA. Since the parent is part of what\'s hashed to produce the commit SHA, the result is always a new SHA.' };
        if (v === 'same') return { correct: false, feedback: 'No. A commit\'s SHA depends on its parent SHA. Rebase changes the parent, so the SHA changes — even if the content (tree) is identical.' };
        return { correct: false, feedback: 'Think about what goes into computing a commit SHA.' };
      },
      hints: [
        'Commit SHA = hash(tree + parent + author + message + timestamps).',
        'Rebase puts the commits on a new base — the parent SHA changes.',
        'Different parent → different SHA, always. New commits with new SHAs.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You want to squash your last 3 commits into one clean commit before submitting a pull request. What command opens the interactive rebase for those 3 commits?',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'git rebase ...';
        inp.style.width = '300px';
        container.appendChild(inp);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var clean = v.replace(/\s+/g, ' ').trim();
        if (clean === 'git rebase -i HEAD~3') return { correct: true, feedback: 'Correct. git rebase -i HEAD~3 opens an interactive rebase for the last 3 commits. In the editor, change "pick" to "squash" (or "s") on the 2nd and 3rd entries. The first entry stays as "pick".' };
        if (clean === 'git rebase -i HEAD~3 --autosquash') return { correct: true, feedback: 'Also correct — --autosquash automatically applies fixup!/squash! prefixed commits in the right order.' };
        if (v.indexOf('-i') !== -1 && v.indexOf('HEAD~3') !== -1) return { correct: true, feedback: 'Correct. The key flags: -i (interactive) and HEAD~3 (go back 3 commits).' };
        if (v.indexOf('-i') === -1) return { correct: false, feedback: 'You need the interactive flag. Check the rebase man page for the flag that opens an editor.' };
        return { correct: false, feedback: 'Almost. How do you specify "the last 3 commits" as the range?' };
      },
      hints: [
        'git rebase has an -i flag for interactive mode.',
        'To target the last N commits, use HEAD~N as the argument.',
        'The full command: git rebase -i HEAD~3'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You rebased your local feature branch and force-pushed to origin/feature. Your teammate Bob has already pulled origin/feature. What does Bob\'s git pull now produce, and what is the safe sequence of commands for Bob to get the rebased history?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Describe what git pull produces, then the fix...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasProblem = v.indexOf('diverge') !== -1 || v.indexOf('merge commit') !== -1 || v.indexOf('conflict') !== -1 || v.indexOf('duplicate') !== -1;
        var hasFix = v.indexOf('fetch') !== -1 && (v.indexOf('reset') !== -1 || v.indexOf('hard') !== -1);
        if (hasProblem && hasFix) return { correct: true, feedback: 'Correct. git pull would create a merge commit that merges the two diverged histories, resulting in duplicate commits (the original + the rebased copies). Fix: git fetch origin && git reset --hard origin/feature. This discards Bob\'s local pointer and uses the remote. If Bob has local commits on top, he\'d need to cherry-pick those back.' };
        if (hasProblem) return { correct: false, feedback: 'Good — you identified the divergence. What is the safe command sequence for Bob to get aligned?' };
        return { correct: false, feedback: 'After a force-push, Bob\'s local feature branch and origin/feature have diverged. What does git pull do with two diverged branches, and what\'s the cleaner fix?' };
      },
      hints: [
        'Bob\'s local feature branch still has the old SHAs. origin/feature now has the rebased SHAs. git pull sees them as diverged.',
        'git pull = fetch + merge. Merge would create a merge commit combining the old and new history, producing duplicate commits.',
        'Safe fix: git fetch origin, then git reset --hard origin/feature. This throws away Bob\'s local feature pointer and uses the remote version. Any local-only commits on feature would be lost.'
      ]
    }
  ]
});
