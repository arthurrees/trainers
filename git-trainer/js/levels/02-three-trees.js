// Level 2 — The Three Trees
GT.registerLevel({
  id: 2,
  title: 'The Three Trees',
  whyItMatters: 'git reset, git checkout, and git restore all move one or more of Git\'s three internal trees. Understanding which tree each command touches explains every "where did my changes go?" mystery.',
  glossary: ['three trees', 'working directory', 'staging area', 'index', 'HEAD'],
  learn: ''
    + '<h4>Git\'s three separate snapshots</h4>'
    + '<p>At any moment, Git maintains three different versions of your project simultaneously:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Name</th><th>What it is</th><th>Where it lives</th></tr>'
    + '<tr><td><strong>Working Directory</strong></td><td>Actual files on disk that you edit</td><td>Your project folder</td></tr>'
    + '<tr><td><strong>Index (Staging Area)</strong></td><td>Proposed next commit snapshot</td><td><code>.git/index</code></td></tr>'
    + '<tr><td><strong>HEAD</strong></td><td>Last commit snapshot</td><td><code>.git/objects/</code> via <code>.git/HEAD</code></td></tr>'
    + '</table>'
    + '<p>Every git command either reads from, writes to, or compares these three trees.</p>'

    + '<h4>How git status works</h4>'
    + '<p><code>git status</code> runs two diffs:</p>'
    + '<ol>'
    + '<li><strong>HEAD vs Index</strong> — changes staged for the next commit ("Changes to be committed")</li>'
    + '<li><strong>Index vs Working Directory</strong> — changes in your files not yet staged ("Changes not staged for commit")</li>'
    + '</ol>'
    + '<div class="terminal"><span class="prompt">$</span> git status\n<span class="out">Changes to be committed:\n  modified: README.md         ← HEAD ≠ Index\n\nChanges not staged for commit:\n  modified: src/app.js        ← Index ≠ WorkDir</span></div>'

    + '<h4>git add — moves working dir into index</h4>'
    + '<p><code>git add file.txt</code> hashes the current working-directory version and writes it into the index. After this, the index matches your file. The HEAD is unchanged.</p>'

    + '<h4>git commit — moves index into HEAD</h4>'
    + '<p><code>git commit</code> packages the current index as a tree, wraps it in a commit object, and advances the current branch ref to that new commit. Now HEAD matches the index.</p>'

    + '<h4>git reset — the three modes</h4>'
    + '<p><code>git reset</code> moves HEAD (and the branch it points to) to a different commit. The three modes differ in what else they update:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Mode</th><th>Moves HEAD?</th><th>Updates Index?</th><th>Updates Working Dir?</th></tr>'
    + '<tr><td><code>--soft</code></td><td>✓</td><td>✗</td><td>✗</td></tr>'
    + '<tr><td><code>--mixed</code> (default)</td><td>✓</td><td>✓</td><td>✗</td></tr>'
    + '<tr><td><code>--hard</code></td><td>✓</td><td>✓</td><td>✓</td></tr>'
    + '</table>'
    + '<p>Example: <code>git reset --soft HEAD~1</code> "undoes" the last commit but leaves your changes staged, ready to re-commit with a different message.</p>'

    + '<h4>git restore (modern spelling)</h4>'
    + '<p>Git 2.23 added <code>git restore</code> to separate the "discard changes" and "unstage" operations from the overloaded <code>git checkout</code>:</p>'
    + '<ul>'
    + '<li><code>git restore file.txt</code> — copy index → working dir (discard unstaged changes)</li>'
    + '<li><code>git restore --staged file.txt</code> — copy HEAD → index (unstage)</li>'
    + '<li><code>git restore --source=HEAD~2 file.txt</code> — copy a specific commit → working dir</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Mental model</div>'
    + 'Think of the three trees as a pipeline: changes flow Working Dir → Index → HEAD. git add moves the valve one step right. git commit moves it another. git reset moves HEAD (and optionally the valves) backwards. git restore moves content between trees without touching HEAD.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate git commands and watch which trees change.</p>';

    var state = {
      wd: { 'README.md': 'Hello World', 'app.js': 'console.log(1)' },
      idx: { 'README.md': 'Hello World', 'app.js': 'console.log(1)' },
      head: { 'README.md': 'Hello World', 'app.js': 'console.log(1)' }
    };

    function renderTrees() {
      treeDiv.innerHTML = '';
      ['wd', 'idx', 'head'].forEach(function (k) {
        var col = document.createElement('div');
        col.style.flex = '1';
        var title = { wd: 'Working Dir', idx: 'Index (Staging)', head: 'HEAD' }[k];
        col.innerHTML = '<strong>' + title + '</strong><br>';
        Object.keys(state[k]).forEach(function (fname) {
          var line = document.createElement('div');
          line.className = 'formula-box';
          line.style.marginTop = '4px';
          line.style.fontSize = '12px';
          line.innerHTML = '<code>' + GT.escapeHtml(fname) + '</code>: ' + GT.escapeHtml(state[k][fname]);

          var wdVal = state.wd[fname] || '';
          var idxVal = state.idx[fname] || '';
          var headVal = state.head[fname] || '';
          if (k === 'wd' && wdVal !== idxVal) line.style.borderColor = '#fbbf24';
          if (k === 'idx' && idxVal !== headVal) line.style.borderColor = '#7ab7ff';
          treeDiv.appendChild(col);
          col.appendChild(line);
        });
        treeDiv.appendChild(col);
      });
    }

    var treeDiv = document.createElement('div');
    treeDiv.style.display = 'flex';
    treeDiv.style.gap = '12px';
    treeDiv.style.marginBottom = '12px';
    renderTrees();

    var ops = [
      {
        label: 'Edit README.md in working dir',
        action: function () { state.wd['README.md'] = 'Hello Git Trainer'; }
      },
      {
        label: 'git add README.md',
        action: function () { state.idx['README.md'] = state.wd['README.md']; }
      },
      {
        label: 'git commit -m "Update README"',
        action: function () {
          Object.keys(state.idx).forEach(function (k) { state.head[k] = state.idx[k]; });
        }
      },
      {
        label: 'Edit app.js in working dir',
        action: function () { state.wd['app.js'] = 'console.log(2)'; }
      },
      {
        label: 'git reset --soft HEAD~1',
        action: function () {
          // Move HEAD back, keep index and wd
          Object.keys(state.head).forEach(function (k) { state.head[k] = 'Hello World'; });
          state.head['app.js'] = 'console.log(1)';
        }
      },
      {
        label: 'git reset --mixed HEAD',
        action: function () {
          Object.keys(state.head).forEach(function (k) { state.idx[k] = state.head[k]; });
        }
      },
      {
        label: 'git restore README.md (discard working dir change)',
        action: function () { state.wd['README.md'] = state.idx['README.md']; }
      }
    ];

    var btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.gap = '6px';

    ops.forEach(function (op) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.style.fontSize = '12px';
      b.textContent = op.label;
      b.addEventListener('click', function () {
        op.action();
        renderTrees();
      });
      btnRow.appendChild(b);
    });

    container.appendChild(treeDiv);
    container.appendChild(btnRow);
    container.appendChild(document.createTextNode(' ← Yellow border = differs from index. Blue border = staged change.'));
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You edit <code>README.md</code> in your text editor but do NOT run <code>git add</code>. Which of the three trees contains the updated content?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="wd">Working Directory only</option>'
          + '<option value="idx">Index only</option>'
          + '<option value="head">HEAD only</option>'
          + '<option value="all">All three</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'wd') return { correct: true, feedback: 'Correct. Editing a file only touches the working directory. git status would show it as "Changes not staged for commit" — the index and HEAD still have the old content.' };
        return { correct: false, feedback: 'Only the working directory is modified when you edit a file. git add moves it to the index; git commit moves the index to HEAD.' };
      },
      hints: [
        'Your text editor writes to the filesystem — that\'s the working directory.',
        'git add is what copies working directory content into the index.',
        'Without git add, only the working directory changes.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You ran <code>git commit</code> and immediately realized the commit message was wrong. You want to fix the message, keep your staged files staged, and not create a new commit SHA. Which command achieves this?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="a">git commit --amend</option>'
          + '<option value="b">git reset --soft HEAD~1, then git commit again</option>'
          + '<option value="c">git reset --mixed HEAD~1, then git commit again</option>'
          + '<option value="d">git revert HEAD</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'a') return { correct: true, feedback: 'Correct. git commit --amend replaces the last commit with a new one using the current index and a new message. It does NOT keep the same SHA (a new commit object is created), but it\'s the cleanest one-step way to fix the message.' };
        if (v === 'b') return { correct: false, feedback: 'git reset --soft HEAD~1 would work — it undoes the commit but leaves the index staged. Then you recommit with the right message. Two steps, but valid. The question asks for the command that achieves this directly.' };
        if (v === 'c') return { correct: false, feedback: 'git reset --mixed also moves HEAD back, but it unstages the files too. You\'d have to git add again.' };
        if (v === 'd') return { correct: false, feedback: 'git revert creates a NEW commit that undoes the changes. That\'s the opposite of what you want.' };
        return { correct: false, feedback: 'Pick the most direct option.' };
      },
      hints: [
        'You want to modify the most recent commit without creating additional commits.',
        'There is a flag to git commit specifically for modifying the last commit.',
        'git commit --amend opens your editor to let you change the message, then replaces the commit.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have two unstaged changes across two files. You want to commit <em>only</em> one of the files, keeping the other change in your working directory (unstaged). What is the sequence of commands?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'List the commands...';
        t.style.width = '100%';
        t.style.height = '70px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var hasAdd = v.indexOf('git add') !== -1 || v.indexOf('add ') !== -1;
        var hasCommit = v.indexOf('git commit') !== -1 || v.indexOf('commit') !== -1;
        if (hasAdd && hasCommit) return { correct: true, feedback: 'Correct. git add <specific-file> stages only that file. git commit then packages only what\'s in the index. The other file\'s changes stay in the working directory, untouched. You never need to "unstage the other file" — just never stage it in the first place.' };
        return { correct: false, feedback: 'Think about how git add works: it copies specific files into the index. If you only add one file, only one file ends up in the commit.' };
      },
      hints: [
        'git add takes individual file paths: git add file-a.txt',
        'If you only git add one file, the index only contains that file\'s staged changes.',
        'git add file-a.txt, then git commit. file-b.txt never entered the index, so it stays in your working directory unchanged.'
      ]
    }
  ]
});
