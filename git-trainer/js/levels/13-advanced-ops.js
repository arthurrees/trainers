// Level 13 — Advanced Ops
GT.registerLevel({
  id: 13,
  title: 'Advanced Ops',
  whyItMatters: 'Pack files explain why .git is small, git bisect finds bugs in seconds, shallow clones speed up CI, and worktrees let you work two branches simultaneously. These are the tools that make Git feel fast.',
  glossary: ['pack file', 'bisect', 'worktree', 'ORIG_HEAD'],
  learn: ''
    + '<h4>Pack files — how Git stays small</h4>'
    + '<p>Each blob, tree, and commit starts as a "loose object" file in <code>.git/objects/</code>. Over time (or when you run <code>git gc</code>), Git packs loose objects into <strong>pack files</strong>: compressed binary archives stored in <code>.git/objects/pack/</code>.</p>'
    + '<p>Pack files use <strong>delta compression</strong>: similar objects are stored as a base + a delta (diff), not as two complete copies. This is why a Git repo with thousands of commits and file versions can be smaller than the working tree itself.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git count-objects -vH\n<span class="out">count: 0\nsize: 0 bytes\nin-pack: 8453\npacks: 1\nsize-pack: 2.43 MiB\nprune-packable: 0\ngc: 0</span></div>'
    + '<p>Trigger packing manually: <code>git gc</code> or <code>git pack-objects</code>. Git auto-packs after fetch when the object count exceeds <code>gc.auto</code> (default: 6700).</p>'

    + '<h4>git bisect — binary search for a bug</h4>'
    + '<p><code>git bisect</code> finds the exact commit that introduced a bug using binary search. It checks out midpoints in the history and asks you to test each one. For a 1000-commit history, it finds the culprit in ~10 steps.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git bisect start\n<span class="prompt">$</span> git bisect bad              # current commit is broken\n<span class="prompt">$</span> git bisect good v1.0        # v1.0 was fine\n<span class="out">Bisecting: 500 revisions left, ~9 steps</span>\n# Test — run your test suite or reproduce the bug\n<span class="prompt">$</span> git bisect good            # or: git bisect bad\n# ... repeat until:\n<span class="out">abc1234 is the first bad commit</span>\n<span class="prompt">$</span> git bisect reset           # return to HEAD</span></div>'
    + '<p>Automate with a test script: <code>git bisect run ./test.sh</code> — Git marks good/bad automatically.</p>'

    + '<h4>Shallow clones — fast CI clones</h4>'
    + '<p>A shallow clone downloads only the most recent N commits, not the full history:</p>'
    + '<div class="terminal"><span class="prompt">$</span> git clone --depth=1 https://github.com/user/repo</span></div>'
    + '<p>Useful for CI pipelines where you only need to build the latest code and don\'t need full history. The <code>.git/shallow</code> file records which commits are "shallow roots" (no parents fetched).</p>'
    + '<p>Shallow clones have limitations: <code>git log</code> shows truncated history, <code>git bisect</code> doesn\'t work across the shallow boundary, and some Git operations (like rebase onto a shallow commit) may fail. Deepen with: <code>git fetch --unshallow</code>.</p>'

    + '<h4>Worktrees — two branches at once</h4>'
    + '<p>A <strong>worktree</strong> lets you check out a second branch in a separate directory, linked to the same <code>.git/</code>. Useful for reviewing a PR while keeping your current work untouched.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git worktree add ../hotfix-review hotfix/login\n<span class="prompt">$</span> ls ../hotfix-review   # fully checked out hotfix/login branch\n<span class="prompt">$</span> git worktree list\n<span class="out">/home/user/repo        abc1234 [main]\n/home/user/hotfix-review  9ef5678 [hotfix/login]</span>\n<span class="prompt">$</span> git worktree remove ../hotfix-review</span></div>'
    + '<p>A branch can only be checked out in one worktree at a time. Worktrees share the object store and refs — a commit in one is immediately visible in the other.</p>'

    + '<h4>Safety refs: ORIG_HEAD, MERGE_HEAD, CHERRY_PICK_HEAD</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Ref</th><th>Set by</th><th>Contains</th></tr>'
    + '<tr><td>ORIG_HEAD</td><td>merge, rebase, reset</td><td>Previous HEAD (undo pointer)</td></tr>'
    + '<tr><td>MERGE_HEAD</td><td>mid-merge</td><td>The other branch\'s tip being merged</td></tr>'
    + '<tr><td>CHERRY_PICK_HEAD</td><td>mid-cherry-pick</td><td>The commit being cherry-picked</td></tr>'
    + '<tr><td>REBASE_HEAD</td><td>mid-rebase</td><td>The commit being replayed</td></tr>'
    + '</table>'

    + '<h4>git fsck — repository health check</h4>'
    + '<p><code>git fsck</code> checks the object database for integrity errors and dangling objects. <code>git fsck --lost-found</code> writes dangling objects to <code>.git/lost-found/</code> — useful for recovering commits after a failed operation.</p>'

    + '<div class="callout"><div class="label">git maintenance — automatic housekeeping</div>'
    + 'git maintenance start sets up a background cron/scheduled-task that runs gc, prefetch, commit-graph, and loose-object packing on a schedule. Recommended for large repos. On macOS/Linux it uses launchctl/systemd; on Windows it uses Task Scheduler.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate git bisect. Mark commits good or bad to find the bug.</p>';

    var commits = [];
    var total = 16;
    var bugAt = Math.floor(Math.random() * 10) + 4; // bug introduced at position bugAt (0=oldest)
    for (var i = 0; i < total; i++) {
      commits.push({ id: i, sha: 'c' + (1000 + i), msg: 'Commit #' + i, bad: i >= bugAt });
    }

    var bisecting = false;
    var lo = 0, hi = total - 1;
    var mid = -1;
    var done = false;
    var stepCount = 0;

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '12px';
    display.style.lineHeight = '1.8';

    var timeline = document.createElement('div');
    timeline.style.display = 'flex';
    timeline.style.gap = '4px';
    timeline.style.flexWrap = 'wrap';
    timeline.style.marginTop = '10px';

    function render() {
      var lines = [];
      if (!bisecting) {
        lines.push('<span class="muted">Click "git bisect start" to begin. There are ' + total + ' commits. A bug was introduced at one of them.</span>');
        lines.push('<span class="muted">Current HEAD (newest) = c' + (1000 + total - 1) + ' (bad). v1.0 = c1000 (good).</span>');
      } else if (done) {
        lines.push('<span style="color:#f87171">✗ First bad commit: <strong>c' + (1000 + mid) + ' (Commit #' + mid + ')</strong></span>');
        lines.push('Found in <strong>' + stepCount + ' steps</strong> (binary search over ' + total + ' commits).');
        lines.push('<span class="muted">git bisect reset — returns to HEAD.</span>');
      } else {
        lines.push('<strong>Bisecting:</strong> checking commit <span style="color:#7ab7ff">c' + (1000 + mid) + '</span> (Commit #' + mid + ')');
        lines.push('Range: c' + (1000 + lo) + ' → c' + (1000 + hi) + ' (' + (hi - lo + 1) + ' commits, ~' + Math.ceil(Math.log2(hi - lo + 1)) + ' steps left)');
        lines.push('Does this commit have the bug? (c' + (1000 + mid) + '.bad = ' + commits[mid].bad + ')');
        lines.push('<span class="muted">Click "git bisect good" or "git bisect bad"</span>');
      }
      display.innerHTML = lines.join('<br>');

      // Timeline
      timeline.innerHTML = '';
      for (var i = 0; i < total; i++) {
        var box = document.createElement('div');
        box.style.width = '24px';
        box.style.height = '24px';
        box.style.borderRadius = '4px';
        box.style.display = 'flex';
        box.style.alignItems = 'center';
        box.style.justifyContent = 'center';
        box.style.fontSize = '9px';
        box.style.color = '#fff';
        box.title = 'Commit #' + i;
        if (done && i === mid) {
          box.style.background = '#f87171';
          box.textContent = '!';
        } else if (bisecting && i === mid) {
          box.style.background = '#7ab7ff';
          box.textContent = '?';
        } else if (bisecting && (i < lo || i > hi)) {
          box.style.background = '#1e2433';
          box.style.opacity = '0.4';
          box.textContent = i;
        } else {
          box.style.background = '#3a4256';
          box.textContent = i;
        }
        timeline.appendChild(box);
      }
    }
    render();

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
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

    var goodBtn = btn('git bisect good', function () {
      if (!bisecting || done) return;
      lo = mid + 1;
      step();
    });
    var badBtn = btn('git bisect bad', function () {
      if (!bisecting || done) return;
      hi = mid;
      step();
    });

    function step() {
      stepCount++;
      if (lo >= hi) {
        mid = lo;
        done = true;
      } else {
        mid = Math.floor((lo + hi) / 2);
      }
      render();
    }

    btnRow.appendChild(btn('git bisect start', function () {
      bisecting = true; done = false; lo = 0; hi = total - 1; mid = Math.floor((lo + hi) / 2); stepCount = 0;
      render();
    }));
    btnRow.appendChild(goodBtn);
    btnRow.appendChild(badBtn);
    btnRow.appendChild(btn('git bisect reset', function () {
      bisecting = false; done = false; lo = 0; hi = total - 1; mid = -1; stepCount = 0;
      bugAt = Math.floor(Math.random() * 10) + 4;
      for (var i = 0; i < total; i++) commits[i].bad = (i >= bugAt);
      render();
    }));

    container.appendChild(display);
    container.appendChild(timeline);
    container.appendChild(btnRow);
    var hint2 = document.createElement('div');
    hint2.style.fontSize = '11px';
    hint2.style.color = '#9aa3b2';
    hint2.style.marginTop = '6px';
    hint2.textContent = 'Tip: the commit is "bad" when its index >= bugAt (hidden from you, like a real bug). Click good/bad to narrow the range.';
    container.appendChild(hint2);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You have a 1024-commit history. You know the bug exists somewhere in it. In the worst case, how many <code>git bisect</code> steps are needed to find it?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="512">512 (linear search worst case)</option>'
          + '<option value="10">10 (log₂ of 1024)</option>'
          + '<option value="1024">1024 (you must test every commit)</option>'
          + '<option value="32">32 (square root of 1024)</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '10') return { correct: true, feedback: 'Correct. Binary search on N items takes at most log₂(N) steps. log₂(1024) = 10. For 1024 commits, bisect finds the bad commit in at most 10 test rounds — Git even tells you the estimated remaining steps.' };
        if (v === '512') return { correct: false, feedback: 'That\'s linear search. Bisect is binary search — it halves the range each step.' };
        return { correct: false, feedback: 'Binary search is O(log N). Think about halving the range each step.' };
      },
      hints: [
        'git bisect halves the range on each step.',
        '1024 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 → 1. That\'s 10 halvings.',
        'log₂(1024) = 10. Worst case: 10 steps.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You want to check out a specific feature branch to review a PR, while keeping your current main branch work untouched in the same repository. Which git feature lets you do this without stashing or creating a new clone?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="worktree">git worktree add</option>'
          + '<option value="stash">git stash then checkout</option>'
          + '<option value="clone">git clone into a second folder</option>'
          + '<option value="branch">git branch -c (copy the branch)</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'worktree') return { correct: true, feedback: 'Correct. git worktree add ../review-dir feature-branch creates a second working directory linked to the same .git/. Both directories share the object store and refs. You can work in both simultaneously — main is untouched.' };
        if (v === 'stash') return { correct: false, feedback: 'You could stash and checkout, but that modifies your current working directory. You\'d need to pop the stash when done and re-checkout main. Worktrees let you keep both checked out simultaneously.' };
        if (v === 'clone') return { correct: false, feedback: 'Cloning creates a completely separate repo. It works, but it means downloading all objects again and you have two separate .git/ directories. Worktrees share the .git/ directory.' };
        return { correct: false, feedback: 'There\'s a git feature specifically designed for this — having two branches checked out simultaneously.' };
      },
      hints: [
        'You want two directories, both pointing to the same .git/ — sharing history but at different commits.',
        'git worktree is designed exactly for this: multiple checkout directories, one .git/.',
        'git worktree add ../review-dir feature-branch'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A CI pipeline clones your repo with <code>git clone --depth=1</code> for fast builds. A developer now tries to run <code>git bisect</code> in that CI environment to debug a regression. What problem will they encounter, and how do they fix it?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Describe the problem and the fix...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasProblem = v.indexOf('shallow') !== -1 || v.indexOf('history') !== -1 || v.indexOf('only one') !== -1 || v.indexOf('no parent') !== -1 || v.indexOf('depth') !== -1;
        var hasFix = v.indexOf('unshallow') !== -1 || v.indexOf('fetch --depth') !== -1 || v.indexOf('full history') !== -1;
        if (hasProblem && hasFix) return { correct: true, feedback: 'Correct. A --depth=1 clone has only one commit (the latest) and no parent history. git bisect needs to walk the history graph to find midpoints. Fix: git fetch --unshallow to download the full history, then git bisect can run normally. Alternatively: git fetch --depth=N to deepen without fully unshallowing.' };
        if (hasProblem) return { correct: false, feedback: 'Good — the shallow clone doesn\'t have history. What command brings the full history into an existing shallow clone?' };
        return { correct: false, feedback: 'Think about what bisect needs (commit graph traversal) and what a --depth=1 clone provides (one commit, no history).' };
      },
      hints: [
        'git bisect works by checking out midpoints between a "good" commit and a "bad" commit.',
        'A --depth=1 clone has only one commit in its local history. There are no midpoints to check out.',
        'Fix: git fetch --unshallow fetches the complete history into the shallow clone. Then bisect can traverse the graph normally.'
      ]
    }
  ]
});
