// Level 7 — Detached HEAD
GT.registerLevel({
  id: 7,
  title: 'Detached HEAD',
  whyItMatters: 'Detached HEAD is not an error — it\'s a valid (and useful) state. The danger is making commits in it without knowing what happens to them. Five minutes here prevents the "I lost my commits" panic.',
  glossary: ['detached HEAD', 'HEAD', 'orphan', 'ref'],
  learn: ''
    + '<h4>What "detached HEAD" means</h4>'
    + '<p>Normally <code>.git/HEAD</code> contains a symbolic ref like <code>ref: refs/heads/main</code>. This means "HEAD follows the main branch." When you commit, main advances, and HEAD follows automatically.</p>'
    + '<p>In <strong>detached HEAD</strong> state, <code>.git/HEAD</code> contains a raw SHA instead:</p>'
    + '<div class="terminal">ref: refs/heads/main        ← normal (attached)\na1b2c3d4e5f67890...         ← detached HEAD</div>'
    + '<p>When HEAD is detached, it points directly at a commit — not at a branch. If you make commits, they\'re not on any branch.</p>'

    + '<h4>How you end up in detached HEAD</h4>'
    + '<ul>'
    + '<li><code>git checkout &lt;SHA&gt;</code> — checking out a specific commit</li>'
    + '<li><code>git checkout v1.0</code> — checking out a tag (tags don\'t move)</li>'
    + '<li><code>git checkout origin/main</code> — checking out a remote tracking ref</li>'
    + '<li><code>git bisect</code> — checking out midpoints for debugging (moves HEAD directly)</li>'
    + '<li>After some rebase operations</li>'
    + '</ul>'
    + '<p>Git warns you clearly: <em>"You are in \'detached HEAD\' state. You can look around, make experimental changes and commit them, and you can discard any commits you make in this state without impacting any branches by switching back to a branch."</em></p>'

    + '<h4>What you can safely do in detached HEAD</h4>'
    + '<ul>'
    + '<li>Browse old code: <code>git checkout abc1234</code> then look around</li>'
    + '<li>Run tests against an old commit</li>'
    + '<li>Try experimental changes — you can always discard them by switching to a branch</li>'
    + '</ul>'

    + '<h4>The danger: making commits you want to keep</h4>'
    + '<p>If you make commits in detached HEAD and then switch to another branch, those commits are orphaned — no branch points to them. Git will warn you:</p>'
    + '<div class="terminal">Warning: you are leaving 2 commits behind, not connected to any of your branches.\n  abc1234 My experiment\n  def5678 More work\n\nIf you want to keep them by creating a new branch, this may be a good time to do so with:\n  git branch new-branch abc1234</div>'

    + '<h4>Recovery options</h4>'
    + '<p>If you made commits in detached HEAD and then switched away:</p>'
    + '<ol>'
    + '<li><strong>Immediate (within seconds):</strong> Copy the SHA from the warning message, then <code>git checkout -b rescue &lt;sha&gt;</code>.</li>'
    + '<li><strong>Later (within 30 days):</strong> <code>git reflog</code> still records the SHA. Find it, create a branch.</li>'
    + '<li><strong>After gc:</strong> The commits may be gone. Check <code>git fsck --lost-found</code> for dangling objects.</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">Using detached HEAD intentionally</div>'
    + 'git bisect checks out commits in detached HEAD mode as it binary-searches for a bug. This is expected and safe — bisect manages HEAD itself. When bisect finishes (git bisect reset), you\'re put back on your branch.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Toggle between attached and detached HEAD. Watch what happens when you commit in each state.</p>';

    var state = {
      attached: true,
      branch: 'main',
      headSha: 'c7d8e9f',
      mainSha: 'c7d8e9f',
      detachedCommits: []
    };
    var commitCount = 0;

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '12px';
    display.style.lineHeight = '1.7';

    function render() {
      var lines = [];
      if (state.attached) {
        lines.push('<strong>.git/HEAD:</strong> <span style="color:#4ade80">ref: refs/heads/' + state.branch + '</span>  ← <em>attached</em>');
        lines.push('<strong>refs/heads/' + state.branch + ':</strong> ' + state.mainSha);
        lines.push('<strong>HEAD resolves to:</strong> ' + state.mainSha + ' (via branch)');
        lines.push('');
        lines.push('<span style="color:#4ade80">✓ Committing here advances the ' + state.branch + ' branch.</span>');
      } else {
        lines.push('<strong>.git/HEAD:</strong> <span style="color:#fbbf24">' + state.headSha + '</span>  ← <em>detached!</em>');
        lines.push('<strong>refs/heads/' + state.branch + ':</strong> ' + state.mainSha + ' (unchanged)');
        lines.push('<strong>HEAD resolves to:</strong> ' + state.headSha + ' (direct SHA)');
        lines.push('');
        if (state.detachedCommits.length === 0) {
          lines.push('<span style="color:#fbbf24">⚠ Commits made here are NOT on any branch.</span>');
        } else {
          lines.push('<span style="color:#f87171">⚠ You have ' + state.detachedCommits.length + ' commit(s) not on any branch:</span>');
          state.detachedCommits.forEach(function (c) {
            lines.push('  ' + c.sha + ' — ' + GT.escapeHtml(c.msg));
          });
          lines.push('<span style="color:#9aa3b2">Run: git checkout -b rescue ' + state.headSha + '</span>');
        }
      }
      display.innerHTML = lines.join('<br>');
    }
    render();

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.gap = '6px';
    btnRow.style.marginTop = '10px';

    function makeBtn(label, fn) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.style.fontSize = '12px';
      b.textContent = label;
      b.addEventListener('click', function () { fn(); render(); });
      return b;
    }

    btnRow.appendChild(makeBtn('git checkout abc1234 (detach)', function () {
      state.attached = false;
      state.headSha = 'abc1234';
    }));
    btnRow.appendChild(makeBtn('git commit (in current state)', function () {
      commitCount++;
      var newSha = 'exp' + commitCount + 'def';
      if (state.attached) {
        state.mainSha = newSha;
        state.headSha = newSha;
      } else {
        state.detachedCommits.push({ sha: newSha, msg: 'Experimental commit #' + commitCount });
        state.headSha = newSha;
      }
    }));
    btnRow.appendChild(makeBtn('git checkout main (re-attach)', function () {
      if (state.detachedCommits.length > 0) {
        display.innerHTML += '<br><span style="color:#f87171">⚠ Warning: leaving ' + state.detachedCommits.length + ' commit(s) behind!</span>';
      }
      state.attached = true;
      state.headSha = state.mainSha;
      state.detachedCommits = [];
    }));
    btnRow.appendChild(makeBtn('git checkout -b rescue (save detached)', function () {
      if (!state.attached && state.detachedCommits.length > 0) {
        state.attached = true;
        state.branch = 'rescue';
        state.mainSha = state.headSha;
        state.detachedCommits = [];
      }
    }));

    container.appendChild(display);
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is in <code>.git/HEAD</code> when you are in detached HEAD state?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="sha">A raw commit SHA (e.g. a1b2c3d4...)</option>'
          + '<option value="symref">A symbolic ref (e.g. ref: refs/heads/main)</option>'
          + '<option value="empty">The file is empty</option>'
          + '<option value="branch">Just the branch name (e.g. "main")</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'sha') return { correct: true, feedback: 'Correct. In detached HEAD, .git/HEAD contains a raw 40-character SHA. In normal mode it contains "ref: refs/heads/<branchname>" — a symbolic ref. That\'s the only difference.' };
        if (v === 'symref') return { correct: false, feedback: 'That\'s normal (attached) HEAD. Detached HEAD has a raw SHA, not a symbolic ref.' };
        return { correct: false, feedback: 'Try: cat .git/HEAD in a repo, then git checkout <old-sha>, then cat .git/HEAD again. See the difference.' };
      },
      hints: [
        'Normal HEAD: "ref: refs/heads/main".',
        'Detached HEAD: the symbolic ref is gone. What replaces it?',
        'Detached HEAD: a raw SHA like "a1b2c3d4e5f6789012345678901234567890abcd".'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You are in detached HEAD at commit <code>abc1234</code>. You make two commits and then run <code>git checkout main</code>. Git warns about 2 commits being left behind. You act fast — what command creates a branch called <code>experiment</code> pointing to your most recent detached commit?',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'git ...';
        inp.style.width = '320px';
        container.appendChild(inp);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var clean = v.toLowerCase().replace(/\s+/g, ' ').trim();
        if (clean.indexOf('git branch experiment') !== -1 || clean.indexOf('git checkout -b experiment') !== -1) {
          return { correct: true, feedback: 'Correct. "git branch experiment <sha>" creates a branch at that SHA without checking it out. "git checkout -b experiment <sha>" creates and switches. Either works. The key: you need the SHA from the warning message (or git reflog).' };
        }
        return { correct: false, feedback: 'You need to create a branch that points to your most recent detached commit. What command creates a branch at a specific SHA?' };
      },
      hints: [
        'You need to create a branch pointing to a specific SHA — the one Git warned you about.',
        'git branch <name> <sha> creates a branch at that SHA.',
        'git branch experiment <sha-of-last-detached-commit> — or git checkout -b experiment <sha> to also switch to it.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You made commits in detached HEAD three weeks ago and switched away without saving them. You never ran <code>git gc</code>. Can you still recover those commits? Describe the approach.',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Can you recover? How?';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var saysYes = v.indexOf('yes') !== -1 || v.indexOf('can') !== -1 || v.indexOf('possible') !== -1;
        var hasReflog = v.indexOf('reflog') !== -1;
        var hasFsck = v.indexOf('fsck') !== -1 || v.indexOf('lost-found') !== -1 || v.indexOf('dangling') !== -1;
        if (saysYes && (hasReflog || hasFsck)) return { correct: true, feedback: 'Correct. Three weeks is within the default reflog retention window (90 days). git reflog shows HEAD movements, including detached-HEAD commits. Find the SHA, run git checkout -b rescue <sha>. If reflog entries have expired, git fsck --lost-found finds dangling objects in .git/lost-found/commit/.' };
        if (saysYes) return { correct: false, feedback: 'Yes, recovery is possible — but how? What tool logs all HEAD positions, including detached ones?' };
        return { correct: false, feedback: 'gc hasn\'t run, so the objects are still in .git/objects/. The question is how to find their SHAs.' };
      },
      hints: [
        'The reflog default retention is 90 days. Three weeks is well within that.',
        'git reflog shows every position HEAD has been — including while detached. The detached commits should appear.',
        'git reflog → find the SHA of the detached commits → git checkout -b rescue <sha>. Alternatively, git fsck --lost-found writes dangling commit SHAs to .git/lost-found/commit/.'
      ]
    }
  ]
});
