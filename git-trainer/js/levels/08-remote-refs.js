// Level 8 — Remote Tracking Refs
GT.registerLevel({
  id: 8,
  title: 'Remote Tracking Refs',
  whyItMatters: 'Fetch, pull, and push are the three operations that move commits between repos. Understanding remote tracking refs (like origin/main) clarifies what each one actually changes — and why a push can be rejected.',
  glossary: ['remote', 'remote tracking ref', 'fetch', 'pull', 'push'],
  learn: ''
    + '<h4>What a remote is</h4>'
    + '<p>A <strong>remote</strong> is a named URL for another copy of the repository. Configure one with <code>git remote add origin https://github.com/user/repo</code>. View them with <code>git remote -v</code>.</p>'
    + '<p>You can have multiple remotes: <code>origin</code> (your fork), <code>upstream</code> (the original), etc.</p>'

    + '<h4>Remote tracking refs</h4>'
    + '<p>After a fetch, Git stores where each remote\'s branches are as <strong>remote tracking refs</strong>:</p>'
    + '<div class="terminal">.git/refs/remotes/\n  origin/\n    main      ← SHA of origin\'s main as of last fetch\n    feature   ← SHA of origin\'s feature as of last fetch</div>'
    + '<p>These are <em>read-only snapshots</em>. You can\'t commit to <code>origin/main</code> — it only updates when you fetch. Think of them as "cached last-known state of the remote."</p>'

    + '<h4>git fetch — download without integrating</h4>'
    + '<p><code>git fetch origin</code>:</p>'
    + '<ol>'
    + '<li>Downloads any new objects (commits, trees, blobs) from origin</li>'
    + '<li>Updates remote tracking refs (<code>origin/main</code>, etc.)</li>'
    + '<li>Does NOT touch your local branches or working directory</li>'
    + '</ol>'
    + '<div class="terminal"><span class="prompt">$</span> git fetch origin\n<span class="out">remote: Enumerating objects: 5, done.\nFrom https://github.com/user/repo\n   c7d8e9f..a1b2c3d  main -&gt; origin/main</span></div>'
    + '<p>After fetch, you can inspect what changed without committing to anything: <code>git log main..origin/main</code>.</p>'

    + '<h4>git pull — fetch then integrate</h4>'
    + '<p><code>git pull</code> is exactly <code>git fetch</code> followed by either <code>git merge</code> or <code>git rebase</code> (depending on your config). It\'s a convenience shortcut — but understanding that it\'s two operations explains why you sometimes get merge commits from a pull.</p>'
    + '<p>Prefer: <code>git pull --rebase</code> to keep a linear history, or configure it globally: <code>git config --global pull.rebase true</code>.</p>'

    + '<h4>git push — send commits to the remote</h4>'
    + '<p><code>git push origin main</code> sends your local main commits to origin and asks origin to advance its main pointer.</p>'
    + '<p><strong>Push rejection:</strong> If origin\'s main has commits you don\'t have (someone else pushed first), Git rejects your push:</p>'
    + '<div class="terminal"><span class="out"> ! [rejected]  main -&gt; main (fetch first)\nerror: failed to push some refs to \'origin\'</span></div>'
    + '<p>Fix: fetch first, integrate the remote changes, then push again. Never force-push a shared branch unless the whole team agrees.</p>'

    + '<h4>Fast-forward-only push rule</h4>'
    + '<p>By default, Git only accepts pushes that are <em>fast-forwards</em> — meaning the remote\'s current tip is an ancestor of what you\'re pushing. This prevents accidental history loss. A <code>--force</code> push overrides this.</p>'

    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Command</th><th>Changes local branches?</th><th>Changes remote tracking refs?</th><th>Changes remote?</th></tr>'
    + '<tr><td>fetch</td><td>✗</td><td>✓</td><td>✗</td></tr>'
    + '<tr><td>pull</td><td>✓ (merge/rebase)</td><td>✓</td><td>✗</td></tr>'
    + '<tr><td>push</td><td>✗</td><td>✓ (after success)</td><td>✓</td></tr>'
    + '</table>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate fetch, pull, and push. Watch which refs change.</p>';

    var state = {
      localMain: 'd1e2f3a',
      remoteMain: 'd1e2f3a',
      originMain: 'd1e2f3a', // remote tracking ref (local copy of remote's state)
      remoteAhead: false,
      localAhead: false
    };
    var commitN = 1;

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '12px';
    display.style.lineHeight = '1.8';

    function render() {
      var lines = [];
      lines.push('<strong>Local repo:</strong>');
      lines.push('  refs/heads/main:          ' + state.localMain);
      lines.push('  refs/remotes/origin/main: ' + state.originMain + (state.originMain === state.remoteMain ? ' <span style="color:#4ade80">✓ in sync</span>' : ' <span style="color:#fbbf24">⚠ stale</span>'));
      lines.push('');
      lines.push('<strong>Remote (origin):</strong>');
      lines.push('  main: ' + state.remoteMain);
      lines.push('');
      if (state.localMain === state.remoteMain) {
        lines.push('<span style="color:#4ade80">✓ In sync</span>');
      } else if (state.localAhead && !state.remoteAhead) {
        lines.push('<span style="color:#7ab7ff">→ Local is ahead — git push will succeed (fast-forward)</span>');
      } else if (state.remoteAhead && !state.localAhead) {
        lines.push('<span style="color:#fbbf24">⚠ Remote is ahead — git pull needed before push</span>');
      } else {
        lines.push('<span style="color:#f87171">✗ Diverged — push will be rejected. Fetch + merge/rebase first.</span>');
      }
      display.innerHTML = lines.join('<br>');
    }
    render();

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
      b.addEventListener('click', function () { fn(); render(); });
      return b;
    }

    btnRow.appendChild(btn('Someone pushes to remote', function () {
      commitN++;
      state.remoteMain = 'rem' + commitN + 'xyz';
      state.remoteAhead = true;
    }));
    btnRow.appendChild(btn('git commit locally', function () {
      commitN++;
      state.localMain = 'loc' + commitN + 'abc';
      state.localAhead = true;
    }));
    btnRow.appendChild(btn('git fetch origin', function () {
      state.originMain = state.remoteMain;
    }));
    btnRow.appendChild(btn('git merge origin/main (after fetch)', function () {
      if (state.originMain !== state.remoteMain) { return; }
      state.localMain = state.remoteMain;
      state.remoteAhead = false;
    }));
    btnRow.appendChild(btn('git push (attempt)', function () {
      if (state.remoteAhead) {
        display.innerHTML += '<br><span style="color:#f87171">✗ Push rejected — remote has commits you don\'t have. Fetch first.</span>';
      } else if (state.localAhead) {
        state.remoteMain = state.localMain;
        state.originMain = state.localMain;
        state.localAhead = false;
        display.innerHTML += '<br><span style="color:#4ade80">✓ Push successful.</span>';
      }
    }));
    btnRow.appendChild(btn('Reset', function () {
      state = { localMain: 'd1e2f3a', remoteMain: 'd1e2f3a', originMain: 'd1e2f3a', remoteAhead: false, localAhead: false };
      commitN = 1;
    }));

    container.appendChild(display);
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'After running <code>git fetch origin</code>, which of these is updated?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">Your local main branch</option>'
          + '<option value="b">origin/main (the remote tracking ref)</option>'
          + '<option value="c">Both local main and origin/main</option>'
          + '<option value="d">The remote repository\'s main branch</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'b') return { correct: true, feedback: 'Correct. git fetch updates only the remote tracking refs (origin/main, origin/feature, etc.). Your local branches are untouched. This lets you inspect what changed before integrating.' };
        if (v === 'a') return { correct: false, feedback: 'git fetch doesn\'t touch your local branches. That\'s what git merge or git rebase does after the fetch.' };
        if (v === 'c') return { correct: false, feedback: 'git pull updates local main, not git fetch. Fetch only downloads objects and updates remote tracking refs.' };
        if (v === 'd') return { correct: false, feedback: 'Fetch downloads FROM the remote. It cannot change the remote.' };
        return { correct: false, feedback: 'Choose one.' };
      },
      hints: [
        'git fetch is a read-only operation on your local repo.',
        'It downloads new objects and updates one type of ref — the remote tracking refs.',
        'The remote tracking ref for origin\'s main is origin/main. That\'s what fetch updates.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Your push is rejected with "fetch first." You run <code>git fetch origin</code>. Now you have local commits on main that the remote doesn\'t have, AND remote commits that you don\'t have. What is the sequence to get your commits pushed?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'List the git commands...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasMergeOrRebase = v.indexOf('merge') !== -1 || v.indexOf('rebase') !== -1 || v.indexOf('pull') !== -1;
        var hasPush = v.indexOf('push') !== -1;
        if (hasMergeOrRebase && hasPush) return { correct: true, feedback: 'Correct. After fetch: (1) integrate the remote changes into your local main — either git merge origin/main or git rebase origin/main. (2) Resolve any conflicts. (3) git push origin main — now the push is a fast-forward from the remote\'s perspective.' };
        if (hasMergeOrRebase) return { correct: false, feedback: 'Good — integrating is step 1. What\'s step 2 after the integration succeeds?' };
        return { correct: false, feedback: 'You have both local and remote commits. You need to combine them, then push the combined result.' };
      },
      hints: [
        'After fetch, origin/main has the remote\'s commits. You need to integrate those into your local main.',
        'git merge origin/main OR git rebase origin/main — pick one. Resolve any conflicts.',
        'Once integrated: git push origin main. Now the remote\'s tip is an ancestor of yours — fast-forward push succeeds.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have <code>git pull --rebase</code> set globally. A colleague pushed a merge commit to origin/main. You run <code>git pull</code>. What does this do, and is there a risk compared to the default <code>git pull</code> (merge)?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Explain what happens and any risks...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasRebase = v.indexOf('rebase') !== -1;
        var hasMerge = v.indexOf('merge commit') !== -1 || v.indexOf('merge history') !== -1 || v.indexOf('lost') !== -1 || v.indexOf('linear') !== -1;
        if (hasRebase && hasMerge) return { correct: true, feedback: 'Correct. git pull --rebase replays your local commits on top of origin/main. If your colleague\'s merge commit is now the remote tip, your commits land on top of it — linear history preserved. However, if you had already shared those local commits with others, rebase creates the usual SHA-replacement problem. Also note: --rebase does NOT lose the merge commit itself — it\'s already in the remote\'s history. The risk is only for your own local-only commits.' };
        if (hasRebase) return { correct: false, feedback: 'Good — it rebases your local commits onto origin/main. What\'s the implication for the merge commit that\'s now in origin/main?' };
        return { correct: false, feedback: 'Think about what --rebase does instead of --merge, and how that interacts with a merge commit already in the remote history.' };
      },
      hints: [
        'git pull --rebase = git fetch + git rebase origin/main (instead of git merge).',
        'Your local commits get replayed on top of origin/main\'s tip. That tip happens to be the merge commit.',
        'The merge commit (already in remote history) is kept. Your local commits are rebased on top. This is usually fine unless those local commits were already shared with others.'
      ]
    }
  ]
});
