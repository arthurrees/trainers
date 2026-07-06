// Level 12 — Stash
GT.registerLevel({
  id: 12,
  title: 'Stash',
  whyItMatters: 'Stash lets you park uncommitted changes without creating a real commit. It\'s the quickest way to temporarily clean your working directory — but understanding that stash is literally a commit prevents the "where did my stash go?" confusion.',
  glossary: ['stash'],
  learn: ''
    + '<h4>What stash is under the hood</h4>'
    + '<p>When you run <code>git stash</code>, Git creates <em>two or three commit objects</em>:</p>'
    + '<ol>'
    + '<li>A commit for the index state</li>'
    + '<li>A commit for the working directory state (with the index commit as parent)</li>'
    + '<li>Optionally a third for untracked files (with <code>-u</code>)</li>'
    + '</ol>'
    + '<p>These commits are stored under a special ref: <code>refs/stash</code>. It\'s a stack — each new stash is pushed on top. The working directory and index are then reset to HEAD.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git stash list\n<span class="out">stash@{0}: WIP on main: a1b2c3d Add login\nstash@{1}: WIP on feature: 9ef5678 Update nav</span></div>'

    + '<h4>Basic workflow</h4>'
    + '<div class="terminal"><span class="prompt">$</span> git stash             # save and clean working dir\n<span class="prompt">$</span> git stash push -m "WIP auth"   # save with a message\n<span class="prompt">$</span> git stash list        # see the stack\n<span class="prompt">$</span> git stash pop         # restore top stash + delete it from stack\n<span class="prompt">$</span> git stash apply       # restore top stash, KEEP it in stack\n<span class="prompt">$</span> git stash apply stash@{2}  # restore a specific stash\n<span class="prompt">$</span> git stash drop stash@{0}   # delete a specific stash\n<span class="prompt">$</span> git stash clear       # delete ALL stashes</span></div>'

    + '<h4>pop vs apply</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Restores changes?</th><th>Removes from stack?</th></tr>'
    + '<tr><td><code>pop</code></td><td>✓</td><td>✓</td></tr>'
    + '<tr><td><code>apply</code></td><td>✓</td><td>✗</td></tr>'
    + '</table>'
    + '<p>Use <code>apply</code> when you want to apply the stash to multiple branches, then <code>drop</code> it manually.</p>'

    + '<h4>Stashing untracked files</h4>'
    + '<p>By default, <code>git stash</code> only saves tracked files (modified and staged). To include untracked files: <code>git stash -u</code> (or <code>--include-untracked</code>). To include ignored files too: <code>-a</code> (or <code>--all</code>).</p>'

    + '<h4>The "wrong branch" pattern</h4>'
    + '<p>You started work on main by mistake and realize it belongs on feature. The fix:</p>'
    + '<div class="terminal"><span class="prompt">$</span> git stash              # save your changes\n<span class="prompt">$</span> git checkout feature   # switch to the right branch\n<span class="prompt">$</span> git stash pop          # apply your changes there</span></div>'

    + '<h4>Stash conflicts</h4>'
    + '<p>Stash pop/apply can produce conflicts if the branch changed since you stashed. Resolve them like any merge conflict — edit, <code>git add</code>, then <code>git stash drop</code> the stash entry manually (pop automatically drops on success; if it conflicts, the stash is kept so you can retry).</p>'

    + '<div class="callout"><div class="label">Stash is local only</div>'
    + 'Stashes are stored in .git/ and never pushed to remotes. If you clone the repo elsewhere or lose .git/, your stashes are gone. If you need to save work-in-progress across machines, commit it (even as a WIP commit) and push.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate a stash stack. Push, pop, and apply stashes.</p>';

    var lib = GT.lib.git;
    var stack = [];
    var workingDir = 'clean';
    var pushCount = 0;

    var stackDisplay = document.createElement('div');
    stackDisplay.className = 'formula-box';
    stackDisplay.style.fontFamily = 'monospace';
    stackDisplay.style.fontSize = '12px';
    stackDisplay.style.lineHeight = '1.8';

    var wdDisplay = document.createElement('div');
    wdDisplay.style.fontFamily = 'monospace';
    wdDisplay.style.fontSize = '12px';
    wdDisplay.style.marginTop = '8px';

    function render() {
      if (stack.length === 0) {
        stackDisplay.innerHTML = '<span class="muted">Stash stack is empty.</span>';
      } else {
        stackDisplay.innerHTML = '<strong>refs/stash (stack):</strong><br>' +
          stack.map(function (s, i) {
            return 'stash@{' + i + '}: ' + GT.escapeHtml(s.message) + ' <span style="color:#9aa3b2">(' + s.branch + ')</span>';
          }).join('<br>');
      }
      wdDisplay.innerHTML = '<strong>Working dir:</strong> <span style="color:' + (workingDir === 'clean' ? '#4ade80' : '#fbbf24') + '">' + GT.escapeHtml(workingDir) + '</span>';
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

    btnRow.appendChild(btn('Edit a file (make changes)', function () {
      pushCount++;
      workingDir = 'Modified: change #' + pushCount;
    }));
    btnRow.appendChild(btn('git stash (save & clean)', function () {
      if (workingDir === 'clean') { return; }
      var result = lib.stashPush(stack, { message: 'WIP: ' + workingDir, branch: 'main' });
      stack = result;
      workingDir = 'clean';
    }));
    btnRow.appendChild(btn('git stash pop', function () {
      var result = lib.stashPop(stack);
      if (!result.entry) { return; }
      stack = result.stack;
      workingDir = result.entry.message.replace('WIP: ', '') + ' [popped]';
    }));
    btnRow.appendChild(btn('git stash apply', function () {
      if (!stack.length) return;
      workingDir = stack[0].message.replace('WIP: ', '') + ' [applied — stash kept]';
    }));
    btnRow.appendChild(btn('git stash drop stash@{0}', function () {
      if (!stack.length) return;
      stack = stack.slice(1).map(function (s, i) { return s; });
    }));
    btnRow.appendChild(btn('git stash clear', function () { stack = []; }));

    container.appendChild(stackDisplay);
    container.appendChild(wdDisplay);
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the difference between <code>git stash pop</code> and <code>git stash apply</code>?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">pop restores changes and removes the stash from the stack; apply restores but keeps the stash</option>'
          + '<option value="b">pop only works on the top entry; apply can target any entry</option>'
          + '<option value="c">pop creates a commit; apply only modifies the working directory</option>'
          + '<option value="d">They are identical</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'a') return { correct: true, feedback: 'Correct. git stash pop = apply + drop (in one step). git stash apply leaves the stash entry in the stack so you can apply it to another branch too, then drop manually.' };
        if (v === 'b') return { correct: false, feedback: 'Both pop and apply can target a specific entry: git stash pop stash@{2}. That\'s not the key difference.' };
        return { correct: false, feedback: 'The key difference is what happens to the stash entry afterward.' };
      },
      hints: [
        'Both pop and apply restore the stashed changes to your working directory.',
        'The difference is what happens to the stash entry in refs/stash afterward.',
        'pop = apply + drop. apply keeps the stash entry.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You have changes in your working directory that include a new untracked file <code>scratch.js</code>. You run <code>git stash</code>. Will <code>scratch.js</code> be stashed?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="yes">Yes — git stash always saves everything</option>'
          + '<option value="no">No — by default, git stash only saves tracked (staged or modified) files</option>'
          + '<option value="depends">Depends on whether you ran git add first</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'no') return { correct: true, feedback: 'Correct. git stash by default only saves modifications to tracked files (staged or modified). Untracked files are left alone. To include untracked files: git stash -u (--include-untracked). To include ignored files too: git stash -a (--all).' };
        if (v === 'depends') return { correct: false, feedback: 'Not quite. Even if you had run git add scratch.js (which would make it tracked), git stash would save staged files. But a new file that was never added is untracked and not saved by default stash.' };
        return { correct: false, feedback: 'git stash has a specific scope by default. Check the manpage: which file states does it cover?' };
      },
      hints: [
        'git stash saves: files with modifications in the index (staged) and modifications in the working directory (for tracked files).',
        'A brand-new file never added with git add is "untracked" — not saved by default git stash.',
        'To include untracked files: git stash -u'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have stash@{0} from branch <code>main</code> and stash@{1} from branch <code>feature</code>. You switch to <code>feature</code> and run <code>git stash apply stash@{0}</code>. Git applies the main stash to the feature branch. Does Git prevent this, and what could go wrong?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Does Git prevent cross-branch apply? What can go wrong?';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var noPrevent = v.indexOf('no') !== -1 || v.indexOf('does not') !== -1 || v.indexOf('doesn\'t') !== -1 || v.indexOf('allow') !== -1 || v.indexOf('apply anywhere') !== -1;
        var hasRisk = v.indexOf('conflict') !== -1 || v.indexOf('wrong') !== -1 || v.indexOf('different') !== -1 || v.indexOf('diverge') !== -1 || v.indexOf('not make sense') !== -1;
        if (noPrevent && hasRisk) return { correct: true, feedback: 'Correct. Git does not check or care which branch a stash came from — you can apply any stash to any branch. The risk: if feature and main have diverged significantly, the stash\'s patch may not apply cleanly, causing conflicts. Or worse, it applies silently and puts wrong changes on the wrong branch without any warning. Stash metadata shows which branch it came from ("WIP on main: ...") — always check git stash list before applying.' };
        if (noPrevent) return { correct: false, feedback: 'Correct that Git doesn\'t prevent it. What are the practical risks of applying a stash from a diverged branch?' };
        return { correct: false, feedback: 'Does Git restrict stash apply to the original branch? What happens if the context is different?' };
      },
      hints: [
        'git stash apply applies the stash\'s diff to the current working tree. It doesn\'t check branch names.',
        'If the branch has diverged a lot since the stash was made, the diff may conflict.',
        'Git allows it. Risks: conflicts if the context diverged, or silent wrong-branch contamination. Always check git stash list to see the origin branch before applying.'
      ]
    }
  ]
});
