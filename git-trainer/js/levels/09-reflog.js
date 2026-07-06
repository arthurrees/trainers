// Level 9 — Reflog
GT.registerLevel({
  id: 9,
  title: 'Reflog',
  whyItMatters: 'The reflog is Git\'s undo button. Every panic-inducing git reset --hard, bad rebase, or deleted branch has a recovery path through the reflog — if you act before garbage collection.',
  glossary: ['reflog', 'ORIG_HEAD', 'orphan'],
  learn: ''
    + '<h4>What the reflog is</h4>'
    + '<p>Every time a ref (like HEAD or a branch) changes position, Git appends an entry to the <strong>reflog</strong> — a local log of ref movements. It records: the old SHA, the new SHA, the timestamp, and a short description of what changed it.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git reflog\n<span class="out">abc1234 HEAD@{0}: commit: Add tests\n9ef5678 HEAD@{1}: rebase (finish): returning to refs/heads/main\n3cd9012 HEAD@{2}: rebase (pick): Fix login bug\nb7f6a51 HEAD@{3}: checkout: moving from feature to main\n...</span></div>'
    + '<p>The reflog is <em>local only</em> — it doesn\'t sync to remotes. It\'s your private undo history.</p>'

    + '<h4>Default retention</h4>'
    + '<ul>'
    + '<li>Normal entries: 90 days</li>'
    + '<li>Unreachable (orphaned) entries: 30 days</li>'
    + '<li>After expiry, <code>git gc</code> can prune them</li>'
    + '</ul>'
    + '<p>Configure with: <code>git config gc.reflogExpire 180.days</code></p>'

    + '<h4>Recovery patterns</h4>'
    + '<p>The reflog is most useful after these accidents:</p>'

    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Accident</th><th>Recovery</th></tr>'
    + '<tr><td><code>git reset --hard HEAD~3</code> (too far)</td><td><code>git reflog</code> → find the SHA before reset → <code>git reset --hard &lt;sha&gt;</code></td></tr>'
    + '<tr><td>Deleted a branch</td><td><code>git reflog show &lt;deleted-branch&gt;</code> → get tip SHA → <code>git checkout -b &lt;name&gt; &lt;sha&gt;</code></td></tr>'
    + '<tr><td>Bad rebase</td><td><code>git reflog</code> → find SHA before rebase started → <code>git reset --hard &lt;sha&gt;</code></td></tr>'
    + '<tr><td>Committed in detached HEAD</td><td><code>git reflog</code> → find the detached commit SHAs → <code>git checkout -b rescue &lt;sha&gt;</code></td></tr>'
    + '</table>'

    + '<h4>ORIG_HEAD — the automatic undo pointer</h4>'
    + '<p>Git sets <code>ORIG_HEAD</code> automatically before dangerous operations:</p>'
    + '<ul>'
    + '<li><code>git merge</code> — sets ORIG_HEAD to pre-merge HEAD</li>'
    + '<li><code>git rebase</code> — sets ORIG_HEAD to pre-rebase HEAD</li>'
    + '<li><code>git reset</code> — sets ORIG_HEAD to pre-reset HEAD</li>'
    + '</ul>'
    + '<p>Quick undo: <code>git reset --hard ORIG_HEAD</code>. This is the fastest single-command recovery for a bad merge or rebase.</p>'

    + '<h4>Specific reflog commands</h4>'
    + '<div class="terminal"><span class="prompt">$</span> git reflog                     # HEAD movements\n<span class="prompt">$</span> git reflog show main           # main branch movements\n<span class="prompt">$</span> git reflog show stash          # stash history\n<span class="prompt">$</span> git reflog expire --all --expire=now  # manually expire (dangerous!)\n<span class="prompt">$</span> git log -g HEAD                # same as reflog, git log format</span></div>'

    + '<div class="callout"><div class="label">The reflog only helps if you act before gc</div>'
    + 'git gc runs automatically after certain operations (e.g., many fetches). After gc prunes expired entries, truly orphaned commit objects are deleted. The 30-day unreachable retention is usually plenty of time — but if you know you made a mistake, recover now, not later.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate operations and watch the reflog grow. Click an entry to "restore" to that point.</p>';

    var headSha = 'a1b2c3d';
    var reflog = [
      { ref: 'HEAD@{0}', sha: 'a1b2c3d', op: 'commit: Initial commit', ts: '2 hours ago' }
    ];
    var opCount = 0;

    var logDiv = document.createElement('div');
    logDiv.className = 'formula-box';
    logDiv.style.fontFamily = 'monospace';
    logDiv.style.fontSize = '12px';
    logDiv.style.maxHeight = '180px';
    logDiv.style.overflowY = 'auto';

    var status = document.createElement('div');
    status.style.marginTop = '8px';
    status.style.fontSize = '12px';
    status.style.color = '#9aa3b2';
    status.textContent = 'HEAD → ' + headSha;

    function render() {
      logDiv.innerHTML = reflog.map(function (e, i) {
        return '<div style="cursor:pointer;padding:2px 4px;border-radius:3px" data-i="' + i + '">'
          + '<span style="color:#7ab7ff">' + e.ref + '</span>: '
          + '<span style="color:#4ade80">' + e.sha + '</span> — '
          + GT.escapeHtml(e.op) + ' <span style="color:#9aa3b2">(' + e.ts + ')</span>'
          + '</div>';
      }).join('');
      // Click handler
      logDiv.querySelectorAll('[data-i]').forEach(function (el) {
        el.addEventListener('click', function () {
          var i = parseInt(el.getAttribute('data-i'));
          headSha = reflog[i].sha;
          status.textContent = 'HEAD → ' + headSha + '  (restored to ' + reflog[i].ref + ')';
          status.style.color = '#4ade80';
        });
      });
    }
    render();

    function addOp(sha, op) {
      opCount++;
      // Renumber
      reflog = reflog.map(function (e) {
        var n = parseInt(e.ref.match(/\{(\d+)\}/)[1]) + 1;
        return { ref: 'HEAD@{' + n + '}', sha: e.sha, op: e.op, ts: e.ts };
      });
      reflog.unshift({ ref: 'HEAD@{0}', sha: sha, op: op, ts: 'just now' });
      headSha = sha;
      status.textContent = 'HEAD → ' + headSha;
      status.style.color = '#9aa3b2';
      render();
    }

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.gap = '6px';
    btnRow.style.marginTop = '10px';

    function btn(label, fn) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.style.fontSize = '12px';
      b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    }

    btnRow.appendChild(btn('git commit', function () {
      opCount++;
      addOp('new' + opCount + 'abc', 'commit: Change #' + opCount);
    }));
    btnRow.appendChild(btn('git reset --hard HEAD~1', function () {
      var prev = reflog[1];
      if (prev) addOp(prev.sha, 'reset: moving to HEAD~1');
    }));
    btnRow.appendChild(btn('git checkout -b feature', function () {
      addOp(headSha, 'checkout: moving from main to feature');
    }));
    btnRow.appendChild(btn('git rebase (simulated)', function () {
      opCount++;
      var newSha = 'reb' + opCount + 'xyz';
      addOp(headSha, 'rebase (start): checkout ' + headSha);
      opCount++;
      addOp(newSha, 'rebase (finish): returning to refs/heads/main');
    }));

    container.appendChild(logDiv);
    container.appendChild(status);
    container.appendChild(document.createElement('br'));
    container.appendChild(document.createTextNode('Click a reflog entry to restore HEAD to that SHA.'));
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You ran <code>git reset --hard HEAD~5</code> — too far back. You want to get to where you were before the reset. Which command shows you the SHA HEAD was at immediately before the reset?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">git log</option>'
          + '<option value="b">git reflog</option>'
          + '<option value="c">git status</option>'
          + '<option value="d">git diff HEAD~5</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'b') return { correct: true, feedback: 'Correct. git reflog shows every position HEAD has been, including before and after the reset. Look for the entry that says "reset: moving to HEAD~5" — the entry just above it is where you were before. ORIG_HEAD also points there.' };
        if (v === 'a') return { correct: false, feedback: 'git log only shows commits reachable from current HEAD. After a reset --hard, you\'ve moved HEAD back — the commits you reset away from are not shown by git log.' };
        return { correct: false, feedback: 'After a hard reset, most commands can\'t see the commits you moved away from. What Git-specific tool logs all HEAD movements?' };
      },
      hints: [
        'git log only shows the current history. After a reset, commits above the new HEAD aren\'t in git log.',
        'You need a log of HEAD movements, not a log of commits.',
        'git reflog. Also: ORIG_HEAD points to the SHA before the most recent reset.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You deleted branch <code>experiment</code> with <code>git branch -d</code>. The branch had 3 commits not in any other branch. You want to recover them. Write the two commands to (1) find the tip SHA and (2) create a new branch at it.',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Two commands...';
        t.style.width = '100%';
        t.style.height = '60px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasReflog = v.indexOf('reflog') !== -1;
        var hasBranch = v.indexOf('branch') !== -1 || v.indexOf('checkout -b') !== -1;
        if (hasReflog && hasBranch) return { correct: true, feedback: 'Correct. (1) git reflog show experiment — shows all the SHAs the experiment branch pointed to, including the tip SHA before deletion. (2) git checkout -b experiment <sha> — recreates the branch at that SHA.' };
        if (hasReflog) return { correct: false, feedback: 'Good — reflog can find the SHA. What command recreates a branch at a specific SHA?' };
        return { correct: false, feedback: 'The reflog for a deleted branch still contains its history. How do you view it?' };
      },
      hints: [
        'git reflog show <branchname> works even for deleted branches, as long as the reflog entries haven\'t expired.',
        'The output shows the SHA the tip was at just before deletion.',
        '(1) git reflog show experiment — find the tip SHA. (2) git checkout -b experiment <sha>'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You ran an interactive rebase (<code>git rebase -i HEAD~10</code>) that went badly — some commits were accidentally dropped. You want to abort to the state before the rebase started. What is the one command, and what is the backup if that fails?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Primary command, then backup...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasAbort = v.indexOf('rebase --abort') !== -1;
        var hasOrigHead = v.indexOf('orig_head') !== -1 || v.indexOf('orig head') !== -1;
        var hasReflog = v.indexOf('reflog') !== -1 || v.indexOf('reset --hard') !== -1;
        if (hasAbort && (hasOrigHead || hasReflog)) return { correct: true, feedback: 'Correct. If the rebase is still in progress: git rebase --abort restores everything to pre-rebase state. If the rebase already completed: git reset --hard ORIG_HEAD is the one-command undo (Git sets ORIG_HEAD before rebasing). If ORIG_HEAD was overwritten: git reflog shows the pre-rebase SHA.' };
        if (hasAbort) return { correct: false, feedback: 'git rebase --abort is right for a rebase in progress. What if the rebase already finished?' };
        return { correct: false, feedback: 'Two scenarios: rebase in progress vs rebase already finished. Each has its own tool.' };
      },
      hints: [
        'If the rebase is still running (you\'re in the middle): git rebase --abort is a clean exit.',
        'If the rebase already finished: ORIG_HEAD points to where you were before the rebase started.',
        'git rebase --abort (if in progress) OR git reset --hard ORIG_HEAD (if finished). Backup: git reflog to find the SHA manually.'
      ]
    }
  ]
});
