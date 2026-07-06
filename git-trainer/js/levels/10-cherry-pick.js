// Level 10 — Cherry-pick
GT.registerLevel({
  id: 10,
  title: 'Cherry-pick',
  whyItMatters: 'Cherry-pick lets you apply a single commit\'s changes to a different branch — essential for backporting bug fixes or pulling one feature out of a messy branch without taking everything else.',
  glossary: ['cherry-pick', 'SHA', 'merge'],
  learn: ''
    + '<h4>What cherry-pick does</h4>'
    + '<p><code>git cherry-pick &lt;sha&gt;</code> takes the <em>diff</em> introduced by a commit and applies it as a new commit on the current branch. The new commit gets a <strong>new SHA</strong> but the same diff and message (unless you use <code>-e</code> to edit).</p>'
    + '<div class="terminal">Before:\n  main: A ← B ← C\n  hotfix: A ← D ← E (E is the fix)\n\ngit checkout main && git cherry-pick E\n\nAfter:\n  main: A ← B ← C ← E\'\n  hotfix: A ← D ← E (unchanged)\n  E\' has new SHA, same diff as E</div>'
    + '<p>Cherry-pick computes the diff by diffing the commit against its parent, then applies that diff to the current HEAD.</p>'

    + '<h4>Cherry-pick vs merge vs rebase</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Operation</th><th>What gets integrated</th><th>New SHA?</th><th>History relationship</th></tr>'
    + '<tr><td>merge</td><td>All commits from the other branch</td><td>Only the merge commit</td><td>Branch histories joined</td></tr>'
    + '<tr><td>rebase</td><td>All branch-specific commits, replayed</td><td>All replayed commits</td><td>Linear, history rewritten</td></tr>'
    + '<tr><td>cherry-pick</td><td>Specific commit(s) you choose</td><td>Yes, each pick</td><td>No relationship; duplicate diffs in both branches</td></tr>'
    + '</table>'

    + '<h4>Picking a range</h4>'
    + '<p><code>git cherry-pick A..B</code> picks all commits from A (exclusive) to B (inclusive) — oldest first. This is useful for backporting a series of commits.</p>'

    + '<h4>Conflicts during cherry-pick</h4>'
    + '<p>If the patch doesn\'t apply cleanly (context lines have changed), you get a conflict. The process is the same as a merge conflict: edit the file, <code>git add</code>, then <code>git cherry-pick --continue</code>. To bail: <code>git cherry-pick --abort</code>.</p>'

    + '<h4>Common use cases</h4>'
    + '<ul>'
    + '<li><strong>Backporting a fix:</strong> You found and fixed a bug on main. Cherry-pick the fix commit onto the v1.x maintenance branch.</li>'
    + '<li><strong>Rescue a commit:</strong> A useful commit is buried in a feature branch that isn\'t ready. Cherry-pick it to a release branch.</li>'
    + '<li><strong>Duplicate without merge:</strong> You want the change but not the branch relationship. (Be aware: this creates two commits with identical diffs but different SHAs — can be confusing during future merges.)</li>'
    + '</ul>'

    + '<h4>The "duplicate commit" problem</h4>'
    + '<p>If you cherry-pick commit E onto main, then later merge the branch containing the original E into main, Git may detect them as separate commits (different SHAs) and try to apply E\'s diff again. This usually produces no conflict (the change is already there), but it can confuse <code>git log --graph</code>. Prefer merge or rebase when you\'re bringing in a whole branch.</p>'

    + '<div class="callout"><div class="label">-x flag for traceability</div>'
    + 'git cherry-pick -x &lt;sha&gt; appends "(cherry picked from commit &lt;sha&gt;)" to the commit message. Invaluable on maintenance branches — you can always trace back to the original commit on main.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate cherry-picking a commit onto another branch.</p>';

    var lib = GT.lib.git;

    var mainCommits = ['A(init)', 'B(readme)', 'C(navbar)'];
    var hotfixCommits = ['A(init)', 'D(branch)', 'E(bugfix)'];
    var mainAfter = null;

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '12px';
    display.style.lineHeight = '1.8';

    function render() {
      var lines = [];
      lines.push('<strong>main:</strong>  ' + mainCommits.join(' ← '));
      lines.push('<strong>hotfix:</strong> ' + hotfixCommits.join(' ← '));
      if (mainAfter) {
        lines.push('');
        lines.push('<span style="color:#4ade80">After cherry-pick E onto main:</span>');
        lines.push('<strong>main:</strong>  ' + mainAfter.join(' ← '));
        lines.push('<span style="color:#fbbf24">E\' has new SHA — same diff as E, but different parent (C not D)</span>');
        lines.push('<strong>hotfix:</strong> ' + hotfixCommits.join(' ← ') + '  (unchanged)');
      }
      display.innerHTML = lines.join('<br>');
    }
    render();

    var btn = document.createElement('button');
    btn.className = 'primary-btn';
    btn.style.marginTop = '10px';
    btn.textContent = 'git checkout main && git cherry-pick E';
    btn.addEventListener('click', function () {
      mainAfter = mainCommits.concat(["E'(bugfix — new SHA)"]);
      render();
      btn.textContent = 'Reset';
      btn.className = 'secondary-btn';
      btn.onclick = function () { mainAfter = null; render(); btn.textContent = 'git checkout main && git cherry-pick E'; btn.className = 'primary-btn'; btn.onclick = null; btn.addEventListener('click', arguments.callee); };
    });

    container.appendChild(display);
    container.appendChild(btn);

    var note = document.createElement('div');
    note.style.marginTop = '12px';
    note.style.fontSize = '12px';
    note.style.color = '#9aa3b2';
    note.innerHTML = 'Note: E\' is a new object. If you later merge hotfix into main, Git sees E and E\' as different commits with the same diff — usually harmless but visually confusing.';
    container.appendChild(note);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You cherry-pick commit <code>abc1234</code> from the <code>feature</code> branch onto <code>main</code>. The new commit on main has the same diff as <code>abc1234</code>. Does it have the same SHA?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="yes">Yes — same diff = same SHA</option>'
          + '<option value="no">No — cherry-pick always creates a new SHA</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'no') return { correct: true, feedback: 'Correct. The SHA is computed from the tree + parent + author + timestamps + message. The parent is different (it\'s main\'s tip, not the original parent), so the SHA differs — even if the diff is bit-for-bit identical.' };
        if (v === 'yes') return { correct: false, feedback: 'No. Same diff ≠ same SHA. The commit SHA depends on the tree, parent, author, timestamp, and message. Since the parent is different (it\'s main\'s tip), the SHA is different.' };
        return { correct: false, feedback: 'Choose one.' };
      },
      hints: [
        'Commit SHA = hash(tree + parent + author + committer + message).',
        'The parent is different — on main it\'s main\'s tip, not the original branch\'s commit.',
        'Different parent → different SHA. Always.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You want to backport commits <code>D</code>, <code>E</code>, and <code>F</code> (in order, D is oldest) from <code>main</code> to the <code>v2-maintenance</code> branch. C is the commit immediately before D. What is the cherry-pick command?',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'git cherry-pick ...';
        inp.style.width = '320px';
        container.appendChild(inp);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var clean = v.toLowerCase().replace(/\s+/g, ' ').trim();
        if (clean === 'git cherry-pick c..f') return { correct: true, feedback: 'Correct. C..F picks commits after C up to and including F — that\'s D, E, F in order. The range is exclusive of C (start) and inclusive of F (end).' };
        if (clean === 'git cherry-pick d e f') return { correct: true, feedback: 'Also correct — listing each SHA individually works. The range syntax C..F is more concise.' };
        if (clean === 'git cherry-pick d..f') return { correct: true, feedback: 'Correct — D..F picks commits after D up to F, i.e. E and F. Wait — D is excluded! For D, E, F you need C..F.' };
        if (v.indexOf('cherry-pick') !== -1 && v.indexOf('..') !== -1) {
          return { correct: false, feedback: 'Close — check your range endpoints. A..B picks commits reachable from B but not A. To include D, you need to start the range one commit before D.' };
        }
        return { correct: false, feedback: 'Try using the range notation A..B, where A is the commit just before the first one you want.' };
      },
      hints: [
        'git cherry-pick A..B picks commits reachable from B but not from A. A is EXCLUDED.',
        'To include D, E, F: use C..F (C is excluded, then D, E, F are included).',
        'git cherry-pick C..F — applied oldest-first (D, then E, then F).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You cherry-picked commit E (a bug fix) from <code>hotfix</code> onto <code>main</code>, creating E\'. Later, you merge the entire <code>hotfix</code> branch into <code>main</code>. Describe what Git does with the original commit E during the merge.',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'What happens to E during the merge?';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasDetect = v.indexOf('already') !== -1 || v.indexOf('no conflict') !== -1 || v.indexOf('empty') !== -1 || v.indexOf('same diff') !== -1 || v.indexOf('null merge') !== -1 || v.indexOf('noop') !== -1 || v.indexOf('skip') !== -1 || v.indexOf('no change') !== -1;
        var hasSha = v.indexOf('sha') !== -1 || v.indexOf('different') !== -1 || v.indexOf('duplicate') !== -1;
        if (hasDetect) return { correct: true, feedback: 'Correct. When merging hotfix into main, Git 3-way merges using the common ancestor. E\'s changes are already present in main (via E\'). The merge sees no net diff for those lines and merges them cleanly without conflict — effectively a no-op for E\'s changes. The merge commit is still created. (Note: Git does not detect "this was cherry-picked" by SHA comparison — it compares actual file content via the 3-way merge algorithm.)' };
        if (hasSha) return { correct: false, feedback: 'True, E and E\' have different SHAs — Git doesn\'t "know" E was cherry-picked. But the merge still works. Why? Think about how 3-way merge resolves changes.' };
        return { correct: false, feedback: 'Think about how 3-way merge works: it looks at what changed in each branch relative to the common ancestor, not at commit SHAs.' };
      },
      hints: [
        'Git\'s 3-way merge doesn\'t compare SHAs — it compares file content relative to the common ancestor.',
        'The common ancestor doesn\'t have E\'s fix. main has it (via E\'). hotfix has it (via E).',
        'Both sides made the same change relative to the base — Git\'s 3-way merge sees this as no conflict. The lines are already correct on both sides, so the merge just preserves them. No conflict, no duplicate application.'
      ]
    }
  ]
});
