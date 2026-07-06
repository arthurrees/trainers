// Level 11 — .gitignore
GT.registerLevel({
  id: 11,
  title: '.gitignore',
  whyItMatters: 'A misconfigured .gitignore causes two classic disasters: accidentally committing secrets (passwords, API keys) or accidentally ignoring build outputs you needed tracked. Both are preventable.',
  glossary: ['gitignore'],
  learn: ''
    + '<h4>What .gitignore does</h4>'
    + '<p>Git tracks files in three states: tracked (in the index), untracked (not in the index, not ignored), and <strong>ignored</strong>. A <code>.gitignore</code> file tells Git which untracked files to silently skip — they won\'t appear in <code>git status</code> and won\'t be added by <code>git add .</code>.</p>'
    + '<p>Ignored files are still readable by your programs — git just pretends they don\'t exist.</p>'

    + '<h4>Pattern syntax</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Pattern</th><th>Matches</th></tr>'
    + '<tr><td><code>*.log</code></td><td>Any file ending in .log, anywhere in the tree</td></tr>'
    + '<tr><td><code>/build</code></td><td>The "build" directory or file at the repo root only</td></tr>'
    + '<tr><td><code>build/</code></td><td>Any directory named "build" anywhere in the tree</td></tr>'
    + '<tr><td><code>doc/*.txt</code></td><td>.txt files directly in the doc/ directory (not subdirs)</td></tr>'
    + '<tr><td><code>doc/**/*.txt</code></td><td>.txt files in doc/ and any subdirectory of doc/</td></tr>'
    + '<tr><td><code>!important.log</code></td><td>Do NOT ignore this — negate a prior pattern</td></tr>'
    + '<tr><td><code>#comment</code></td><td>Comments — lines starting with # are ignored</td></tr>'
    + '</table>'

    + '<h4>Precedence — which .gitignore wins</h4>'
    + '<p>Git applies ignore rules from multiple sources in this priority order (later = higher priority):</p>'
    + '<ol>'
    + '<li>Patterns in <code>.git/info/exclude</code> (local to your clone, not committed)</li>'
    + '<li>Global gitignore: <code>~/.config/git/ignore</code> (e.g., OS junk like .DS_Store)</li>'
    + '<li><code>.gitignore</code> files in the repository, from repo root inward</li>'
    + '</ol>'
    + '<p>A <code>.gitignore</code> in a subdirectory applies to that directory and below. A pattern starting with <code>/</code> is anchored to the location of the <code>.gitignore</code> file.</p>'

    + '<h4>Negation rules</h4>'
    + '<p>An exclamation-mark pattern un-ignores a previously ignored path:</p>'
    + '<div class="terminal">*.log\n!important.log</div>'
    + '<p>This ignores all .log files except <code>important.log</code>. <strong>Caveat:</strong> you cannot un-ignore a file in an already-ignored directory. If you ignore <code>logs/</code>, a <code>!logs/keep.log</code> rule has no effect — Git doesn\'t even look inside ignored directories.</p>'

    + '<h4>The "already tracked" gotcha — the biggest source of confusion</h4>'
    + '<p><code>.gitignore</code> only affects <em>untracked</em> files. If a file is already in the index (i.e., you committed it once), adding it to .gitignore does nothing. Git still tracks changes to it.</p>'
    + '<p>Fix: remove it from tracking without deleting it from disk:</p>'
    + '<div class="terminal"><span class="prompt">$</span> git rm --cached secret.env\n<span class="prompt">$</span> echo "secret.env" >> .gitignore\n<span class="prompt">$</span> git commit -m "Stop tracking secret.env"</div>'

    + '<h4>Useful commands</h4>'
    + '<div class="terminal"><span class="prompt">$</span> git check-ignore -v file.log     # which rule ignores this file?\n<span class="prompt">$</span> git status --ignored             # show ignored files\n<span class="prompt">$</span> git clean -fdX                  # delete all ignored files (careful!)</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Type a .gitignore pattern and a file path to see if it matches.</p>';

    var lib = GT.lib.git;

    var patternInput = document.createElement('input');
    patternInput.type = 'text';
    patternInput.placeholder = '.gitignore pattern, e.g. *.log';
    patternInput.style.width = '220px';
    patternInput.style.marginRight = '8px';

    var pathInput = document.createElement('input');
    pathInput.type = 'text';
    pathInput.placeholder = 'file path, e.g. logs/app.log';
    pathInput.style.width = '220px';

    var result = document.createElement('div');
    result.className = 'formula-box';
    result.style.marginTop = '8px';
    result.innerHTML = '<span class="muted">Enter a pattern and path, then click Test.</span>';

    var testBtn = document.createElement('button');
    testBtn.className = 'primary-btn';
    testBtn.style.marginLeft = '8px';
    testBtn.textContent = 'Test';

    testBtn.addEventListener('click', function () {
      var pattern = patternInput.value.trim();
      var path = pathInput.value.trim().replace(/^\//, '');
      if (!pattern || !path) { result.innerHTML = '<span class="muted">Enter both a pattern and a path.</span>'; return; }
      var negate = pattern[0] === '!';
      var p = negate ? pattern.slice(1) : pattern;
      var matched = lib.matchIgnorePattern(p, path);
      if (matched && !negate) {
        result.innerHTML = '<span style="color:#f87171">✗ IGNORED</span> — Pattern <code>' + GT.escapeHtml(pattern) + '</code> matches <code>' + GT.escapeHtml(path) + '</code>';
      } else if (matched && negate) {
        result.innerHTML = '<span style="color:#4ade80">✓ UN-IGNORED</span> — Negation pattern overrides previous ignore for <code>' + GT.escapeHtml(path) + '</code>';
      } else {
        result.innerHTML = '<span style="color:#4ade80">✓ NOT ignored</span> — Pattern <code>' + GT.escapeHtml(pattern) + '</code> does not match <code>' + GT.escapeHtml(path) + '</code>';
      }
    });

    var examples = document.createElement('div');
    examples.style.marginTop = '10px';
    examples.style.fontSize = '12px';
    examples.style.color = '#9aa3b2';
    var examplePairs = [
      ['*.log', 'app.log'], ['*.log', 'logs/app.log'], ['/build', 'build'], ['/build', 'src/build'],
      ['build/', 'build/output.js'], ['doc/*.txt', 'doc/notes.txt'], ['doc/*.txt', 'doc/sub/notes.txt'],
      ['!important.log', 'important.log'], ['**/*.min.js', 'dist/vendor/jquery.min.js']
    ];
    examples.innerHTML = '<strong>Try these examples:</strong><br>';
    examplePairs.forEach(function (pair) {
      var sp = document.createElement('span');
      sp.style.cursor = 'pointer';
      sp.style.textDecoration = 'underline';
      sp.style.marginRight = '12px';
      sp.textContent = '"' + pair[0] + '" vs "' + pair[1] + '"';
      sp.addEventListener('click', function () {
        patternInput.value = pair[0];
        pathInput.value = pair[1];
        testBtn.click();
      });
      examples.appendChild(sp);
    });

    container.appendChild(patternInput);
    container.appendChild(pathInput);
    container.appendChild(testBtn);
    container.appendChild(result);
    container.appendChild(examples);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You add <code>node_modules/</code> to your <code>.gitignore</code>. Will the <code>node_modules</code> directory be tracked by Git after this?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="no-untracked">No — if node_modules was never committed, it will be ignored going forward</option>'
          + '<option value="no-always">No — .gitignore always removes things from tracking</option>'
          + '<option value="yes-if-tracked">Maybe — if node_modules was already committed, .gitignore has no effect on it</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'yes-if-tracked') return { correct: true, feedback: 'Correct. .gitignore only affects untracked files. If node_modules/ was accidentally committed before, adding it to .gitignore does nothing. You must run: git rm -r --cached node_modules/ to remove it from tracking (without deleting it on disk).' };
        if (v === 'no-always') return { correct: false, feedback: 'Not quite. .gitignore has no effect on files/directories already in the index (already committed). It only ignores untracked files.' };
        if (v === 'no-untracked') return { correct: false, feedback: 'Partially right — if node_modules was never committed, yes, it\'s ignored. But the question leaves open the possibility it was already committed. The complete answer accounts for both cases.' };
        return { correct: false, feedback: 'Choose the most complete answer.' };
      },
      hints: [
        '.gitignore only affects untracked files. "Untracked" means not yet in the index.',
        'If node_modules/ was committed once, it\'s tracked. Gitignore won\'t untrack it.',
        'To stop tracking an already-tracked directory: git rm -r --cached node_modules/'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Your <code>.gitignore</code> contains:<br><code>logs/</code><br><code>!logs/important.log</code><br><br>Will <code>logs/important.log</code> be tracked?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="yes">Yes — the negation un-ignores it</option>'
          + '<option value="no">No — you cannot un-ignore a file inside an ignored directory</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'no') return { correct: true, feedback: 'Correct. Git doesn\'t inspect the contents of ignored directories at all. Since logs/ is ignored, Git stops there — it never sees logs/important.log to apply the negation rule. To fix: don\'t ignore the directory; ignore specific file patterns instead: *.log followed by !important.log.' };
        if (v === 'yes') return { correct: false, feedback: 'Not quite. Negation works on individual files, but only if the parent directory isn\'t itself ignored. Because logs/ is ignored, Git never looks inside it — the !logs/important.log rule never fires.' };
        return { correct: false, feedback: 'Think about how Git processes ignored directories.' };
      },
      hints: [
        'When a directory is ignored, Git stops descending into it entirely.',
        'If Git never sees the files inside an ignored directory, negation rules for those files have no effect.',
        'logs/important.log is NOT tracked. Fix: ignore individual file patterns instead of the whole directory.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You committed <code>.env</code> to your repo by accident 3 commits ago. It contains a real API key. What is the complete remediation — both for Git history and for the exposed secret?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Full remediation steps...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasRotate = v.indexOf('rotate') !== -1 || v.indexOf('revoke') !== -1 || v.indexOf('new key') !== -1 || v.indexOf('invalidate') !== -1;
        var hasHistory = v.indexOf('filter') !== -1 || v.indexOf('bfg') !== -1 || v.indexOf('rebase') !== -1 || v.indexOf('rewrite') !== -1;
        var hasIgnore = v.indexOf('gitignore') !== -1 || v.indexOf('.gitignore') !== -1 || v.indexOf('rm --cached') !== -1;
        if (hasRotate && hasHistory && hasIgnore) return { correct: true, feedback: 'Correct, full remediation: (1) Rotate/revoke the API key immediately — assume it\'s compromised the moment it was pushed. History rewriting doesn\'t help if anyone already cloned. (2) Rewrite history to remove the file: use git filter-repo (preferred) or BFG Repo Cleaner. (3) Add .env to .gitignore and run git rm --cached .env. (4) Force-push the rewritten history to all remotes. (5) Notify all collaborators — they need to re-clone.' };
        if (!hasRotate) return { correct: false, feedback: 'You addressed the Git history — but the most critical step is rotating/revoking the exposed key. History rewriting doesn\'t help if anyone cloned or scraped the repo before you acted.' };
        if (!hasHistory) return { correct: false, feedback: 'You need to rewrite the Git history to remove the file from all past commits, not just the current state.' };
        return { correct: false, feedback: 'This is a multi-step remediation: address the exposed secret, rewrite history, update .gitignore, force-push, and notify collaborators.' };
      },
      hints: [
        'Step 1: Rotate the key immediately. Treat it as compromised — anyone who cloned before now has it.',
        'Step 2: Rewrite Git history to remove .env from all commits. Use git filter-repo --invert-paths --path .env (or BFG: bfg --delete-files .env).',
        'Step 3: Add .env to .gitignore, git rm --cached .env, commit. Step 4: Force-push to all remotes. Step 5: Tell all collaborators to re-clone — their local copies still have the old history.'
      ]
    }
  ]
});
