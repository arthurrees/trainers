// Level 3 — Refs and HEAD
GT.registerLevel({
  id: 3,
  title: 'Refs & HEAD',
  whyItMatters: 'A "branch" is not a timeline or a folder — it is a 41-byte file that moves. Understanding refs is what separates people who panic when HEAD changes from people who stay calm.',
  glossary: ['ref', 'HEAD', 'branch', 'tag'],
  learn: ''
    + '<h4>What a ref is</h4>'
    + '<p>A <strong>ref</strong> (reference) is a named pointer to a Git object, almost always a commit. Refs are stored as plain text files under <code>.git/refs/</code>:</p>'
    + '<div class="terminal">.git/refs/\n  heads/\n    main          ← contains "a1b2c3d4..."\n    feature-login ← contains "9f8e7d6c..."\n  tags/\n    v1.0          ← contains "3c4d5e6f..."</div>'
    + '<p>Each file contains exactly one line: a 40-character SHA.</p>'

    + '<h4>HEAD — the "you are here" marker</h4>'
    + '<p><code>.git/HEAD</code> is special. Normally it contains a <em>symbolic ref</em>:</p>'
    + '<div class="terminal">ref: refs/heads/main</div>'
    + '<p>This means "HEAD points to the branch named main." When you commit, Git writes the new SHA into <code>.git/refs/heads/main</code> — HEAD automatically follows because it points at the branch, not the commit.</p>'
    + '<p>When HEAD contains a raw SHA instead of a branch name, you are in <strong>detached HEAD</strong> state (covered in Level 7).</p>'

    + '<h4>Branches — the key insight</h4>'
    + '<p>A branch is <em>just a ref that moves on every commit</em>. Creating a branch is instant: Git writes a new file in <code>.git/refs/heads/</code> containing the current commit SHA. Deleting a branch deletes that file. The commits themselves are unaffected.</p>'
    + '<div class="terminal"><span class="prompt">$</span> cat .git/refs/heads/main\n<span class="out">a1b2c3d4e5f6789012345678901234567890abcd</span>\n<span class="prompt">$</span> git branch feature-login\n# Creates .git/refs/heads/feature-login with the same SHA\n<span class="prompt">$</span> wc -c .git/refs/heads/feature-login\n<span class="out">41 .git/refs/heads/feature-login</span></div>'

    + '<h4>Tags — fixed refs</h4>'
    + '<p>A lightweight tag is a ref that <em>does not move</em>. Create one with <code>git tag v1.0</code>. It points to a commit and never changes automatically. That\'s the only difference from a branch — the file stays put.</p>'
    + '<p>Annotated tags (<code>git tag -a v1.0 -m "Release"</code>) create a tag object in the object store (with its own SHA) and a ref pointing to that object.</p>'

    + '<h4>Packed refs</h4>'
    + '<p>Git occasionally compacts all the small ref files into one file called <code>.git/packed-refs</code>. The behavior is identical — it\'s just an optimization for repos with thousands of refs.</p>'

    + '<h4>Useful ref spellings</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Ref expression</th><th>Means</th></tr>'
    + '<tr><td><code>HEAD</code></td><td>Current commit</td></tr>'
    + '<tr><td><code>HEAD~1</code> or <code>HEAD~</code></td><td>One commit back from HEAD</td></tr>'
    + '<tr><td><code>HEAD~3</code></td><td>Three commits back</td></tr>'
    + '<tr><td><code>HEAD^2</code></td><td>Second parent of HEAD (merge commits only)</td></tr>'
    + '<tr><td><code>main@{3}</code></td><td>Where main was 3 reflog entries ago</td></tr>'
    + '<tr><td><code>HEAD@{yesterday}</code></td><td>Where HEAD was yesterday</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">Practical tip</div>'
    + 'git show-ref lists all refs. git rev-parse HEAD prints the SHA HEAD resolves to. These two commands let you see the full ref state of your repo at any time.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate creating branches, committing, and switching. Watch HEAD and branch pointers move.</p>';

    var commits = [
      { sha: 'a1b2c3d', msg: 'Initial commit' },
      { sha: 'e4f5a6b', msg: 'Add README' },
      { sha: 'c7d8e9f', msg: 'Add login page' }
    ];
    var branches = { main: 'c7d8e9f', feature: null };
    var head = 'main'; // symbolic ref
    var commitCount = commits.length;

    var display = document.createElement('div');
    display.className = 'formula-box';
    display.style.fontFamily = 'monospace';
    display.style.fontSize = '13px';

    function render() {
      var headSha = branches[head] || head;
      var lines = [];
      lines.push('<strong>.git/HEAD:</strong> ref: refs/heads/' + head);
      lines.push('');
      lines.push('<strong>refs/heads/:</strong>');
      Object.keys(branches).forEach(function (b) {
        if (branches[b]) lines.push('  ' + b + ' → ' + branches[b] + (b === head ? ' <span style="color:#7ab7ff">← HEAD</span>' : ''));
      });
      lines.push('');
      lines.push('<strong>Commits (newest first):</strong>');
      commits.slice().reverse().forEach(function (c) {
        var isHead = c.sha === headSha;
        lines.push('  ' + c.sha + ' ' + GT.escapeHtml(c.msg) + (isHead ? ' <span style="color:#4ade80">← HEAD</span>' : ''));
      });
      display.innerHTML = lines.join('<br>');
    }
    render();

    var ops = [
      {
        label: 'git branch feature',
        action: function () {
          branches['feature'] = branches[head] || head;
          render();
        }
      },
      {
        label: 'git checkout feature',
        action: function () {
          if (!branches['feature']) { alert('Create feature branch first.'); return; }
          head = 'feature';
          render();
        }
      },
      {
        label: 'git checkout main',
        action: function () { head = 'main'; render(); }
      },
      {
        label: 'git commit (on current branch)',
        action: function () {
          commitCount++;
          var sha = 'new' + commitCount + 'abc';
          commits.push({ sha: sha, msg: 'New commit #' + commitCount });
          branches[head] = sha;
          render();
        }
      },
      {
        label: 'git branch -d feature',
        action: function () {
          if (head === 'feature') { alert('Cannot delete current branch.'); return; }
          delete branches['feature'];
          render();
        }
      }
    ];

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.gap = '6px';
    btnRow.style.marginTop = '10px';

    ops.forEach(function (op) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.style.fontSize = '12px';
      b.textContent = op.label;
      b.addEventListener('click', op.action);
      btnRow.appendChild(b);
    });

    container.appendChild(display);
    container.appendChild(btnRow);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is stored in the file <code>.git/refs/heads/main</code>?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="sha">A 40-character commit SHA</option>'
          + '<option value="diff">A list of diffs from the last commit</option>'
          + '<option value="files">A list of all tracked filenames</option>'
          + '<option value="log">The entire commit history</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'sha') return { correct: true, feedback: 'Correct. A branch is literally a 41-byte file (40 hex chars + newline) containing the SHA of the commit the branch currently points to. That\'s it.' };
        return { correct: false, feedback: 'Branch files are tiny. The entire history, file list, or diff would be enormous — Git doesn\'t store those in ref files.' };
      },
      hints: [
        'Try running: cat .git/refs/heads/main in any git repo.',
        'The output is a 40-character hex string.',
        'A branch ref contains exactly one commit SHA.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You are on branch <code>main</code>. You run <code>git checkout -b hotfix</code>, make a commit, then run <code>git checkout main</code>. Which commit does HEAD point to now?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">The commit you made on hotfix</option>'
          + '<option value="b">The commit main was at before you branched</option>'
          + '<option value="c">The initial commit of the repository</option>'
          + '<option value="d">HEAD is detached — it points to no branch</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'b') return { correct: true, feedback: 'Correct. "git checkout main" makes HEAD point to the main branch. Since you committed on hotfix (not main), main\'s pointer didn\'t move. HEAD now follows main, which is still at the same commit as before you branched.' };
        if (v === 'a') return { correct: false, feedback: 'That commit is on the hotfix branch. Checking out main points HEAD at main\'s tip, not hotfix\'s tip.' };
        if (v === 'd') return { correct: false, feedback: 'Checking out a branch name (not a SHA) attaches HEAD to that branch. Detached HEAD happens when you checkout a SHA or tag.' };
        return { correct: false, feedback: 'Think about what git checkout main does to HEAD and what the main branch pointer contains.' };
      },
      hints: [
        'git checkout main sets HEAD to "ref: refs/heads/main".',
        'The main branch pointer never moved — you committed on hotfix.',
        'HEAD → main → the SHA main has always had. HEAD points to the commit main\'s file contains.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have a repo with refs <code>main</code>, <code>develop</code>, and <code>v1.0</code> (a lightweight tag). You run <code>git branch -d develop</code>. What is the effect on the commits that were only reachable via <code>develop</code>?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Describe what happens to those commits...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var mentionsOrphan = v.indexOf('orphan') !== -1 || v.indexOf('unreachable') !== -1 || v.indexOf('no ref') !== -1 || v.indexOf('gc') !== -1 || v.indexOf('dangling') !== -1;
        var mentionsStillThere = v.indexOf('still') !== -1 || v.indexOf('remain') !== -1 || v.indexOf('not deleted') !== -1 || v.indexOf('exist') !== -1 || v.indexOf('reflog') !== -1;
        if (mentionsOrphan && mentionsStillThere) return { correct: true, feedback: 'Correct. Deleting a branch deletes only the ref file. The commit objects remain in .git/objects/. They become "orphaned" — no ref points to them. Git won\'t delete them for at least 30 days (reflog retention). git gc prune eventually removes them. git reflog can find them in the meantime.' };
        if (mentionsOrphan) return { correct: false, feedback: 'Good — they\'re orphaned. But are they immediately deleted?' };
        if (mentionsStillThere) return { correct: false, feedback: 'They do remain — but what is their status? Is there still a way to reach them?' };
        return { correct: false, feedback: 'Think about what git branch -d actually does at the filesystem level (it deletes a ref file), and what happens to commits that are no longer pointed to by any ref.' };
      },
      hints: [
        'git branch -d only removes the file .git/refs/heads/develop.',
        'Commit objects in .git/objects/ are not deleted by branch deletion.',
        'Commits with no path from any ref are called "unreachable" or "orphaned". They live until git gc --prune removes them (30+ day default). git reflog show develop can still find them while reflog entries exist.'
      ]
    }
  ]
});
