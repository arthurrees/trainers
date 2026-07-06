// Level 1 — The Object Model
GT.registerLevel({
  id: 1,
  title: 'The Object Model',
  whyItMatters: 'Every git command is just a manipulation of four object types in .git/objects/. Once you can read a commit with git cat-file, nothing about Git is magic.',
  glossary: ['blob', 'tree', 'commit', 'tag', 'SHA', 'object store'],
  learn: ''
    + '<h4>Four object types, one store</h4>'
    + '<p>Everything Git knows about your project lives in <code>.git/objects/</code>. Objects are immutable (never changed after creation) and identified by the SHA-1 hash of their content. The first two hex chars become a directory name; the rest is the filename:</p>'
    + '<div class="terminal">.git/objects/\n  4b/825dc642cb6eb9a060e54bf8d69288fbee4904  ← the "empty tree"\n  a8/4f3c1b9c2d8e0f5...</div>'

    + '<h4>Blob — raw file content</h4>'
    + '<p>A blob is just bytes. It has no filename, no path, no permissions. When you run <code>git add file.txt</code>, Git hashes the content and writes a blob object.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git hash-object -w file.txt\n<span class="out">d8e8fca2dc0f896fd7cb4cb0031ba249</span>\n<span class="prompt">$</span> git cat-file -t d8e8fc\n<span class="out">blob</span>\n<span class="prompt">$</span> git cat-file -p d8e8fc\n<span class="out">hello world</span></div>'

    + '<h4>Tree — directory snapshot</h4>'
    + '<p>A tree maps names and permissions to blob or sub-tree SHAs. Think of it as one level of a directory listing, frozen in time.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git cat-file -p HEAD^{tree}\n<span class="out">100644 blob a8f4...  README.md\n040000 tree c3d9...  src\n100644 blob 7b12...  .gitignore</span></div>'
    + '<p>The permissions are Unix-style: <code>100644</code> = regular file, <code>100755</code> = executable, <code>040000</code> = directory (sub-tree), <code>120000</code> = symlink.</p>'

    + '<h4>Commit — history node</h4>'
    + '<p>A commit points to exactly one tree (the root of the snapshot), zero or more parent commit SHAs, and metadata.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git cat-file -p HEAD\n<span class="out">tree   a94f5374fce5edbc8e2a8697132ad594...\nparent 9f7b9a2c...\nauthor  Alice &lt;alice@example.com&gt; 1716000000 +0000\ncommitter Alice &lt;alice@example.com&gt; 1716000000 +0000\n\nAdd README</span></div>'
    + '<ul>'
    + '<li>Root commit: zero parents.</li>'
    + '<li>Normal commit: one parent.</li>'
    + '<li>Merge commit: two or more parents.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Why commit SHAs change when you rebase</div>'
    + 'The commit SHA is computed from the tree SHA + parent SHA + author + timestamp + message. Change any of these — including the parent — and you get a new SHA. Rebase changes the parent, so every rebased commit is a new object, even if the diff is identical.'
    + '</div>'

    + '<h4>Annotated tag — named metadata envelope</h4>'
    + '<p>A lightweight tag is just a ref file pointing to a commit SHA. An <em>annotated</em> tag is a real Git object: it has its own SHA, contains a pointer to the commit, a tagger, date, and message. <code>git tag -a v1.0 -m "Release"</code> creates an annotated tag.</p>'
    + '<div class="terminal"><span class="prompt">$</span> git cat-file -p v1.0\n<span class="out">object 4b827...\ntype commit\ntag v1.0\ntagger Alice &lt;alice@example.com&gt; 1716000000 +0000\n\nRelease 1.0</span></div>'

    + '<h4>Walking the graph manually</h4>'
    + '<div class="terminal"><span class="prompt">$</span> git log --oneline -3\n<span class="out">abc1234 Add login page\n9ef5678 Fix navbar\n3cd9012 Initial commit</span>\n<span class="prompt">$</span> git cat-file -p abc1234   # see the commit\n<span class="prompt">$</span> git cat-file -p &lt;tree-sha&gt;  # see the directory listing\n<span class="prompt">$</span> git cat-file -p &lt;blob-sha&gt;  # see a file\'s content</span></div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Explore the object graph. Click a node to inspect it.</p>';

    // Build a tiny simulated repo
    var lib = GT.lib.git;
    var blobs = [
      { sha: lib.shortHash('hello world\n'), type: 'blob', content: 'hello world\n', name: 'README.md' },
      { sha: lib.shortHash('console.log("hi");\n'), type: 'blob', content: 'console.log("hi");\n', name: 'index.js' }
    ];
    var tree = { sha: lib.shortHash('tree:' + blobs[0].sha + blobs[1].sha), type: 'tree', entries: blobs };
    var commit1 = { sha: lib.shortHash('commit:init:' + tree.sha), type: 'commit', message: 'Initial commit', parent: null, tree: tree.sha };
    var blob2 = { sha: lib.shortHash('hello world updated\n'), type: 'blob', content: 'hello world updated\n', name: 'README.md' };
    var tree2 = { sha: lib.shortHash('tree2:' + blob2.sha + blobs[1].sha), type: 'tree', entries: [blob2, blobs[1]] };
    var commit2 = { sha: lib.shortHash('commit2:' + tree2.sha + commit1.sha), type: 'commit', message: 'Update README', parent: commit1.sha, tree: tree2.sha };

    var allObjects = {};
    allObjects[blobs[0].sha] = blobs[0];
    allObjects[blobs[1].sha] = blobs[1];
    allObjects[blob2.sha] = blob2;
    allObjects[tree.sha] = tree;
    allObjects[tree2.sha] = tree2;
    allObjects[commit1.sha] = commit1;
    allObjects[commit2.sha] = commit2;

    var detail = document.createElement('div');
    detail.className = 'formula-box';
    detail.style.marginTop = '12px';
    detail.innerHTML = '<span class="muted">← click an object</span>';

    function makeBtn(label, sha, color) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.style.background = color;
      b.style.color = '#fff';
      b.style.fontFamily = 'monospace';
      b.style.margin = '4px';
      b.textContent = label + ' ' + sha.slice(0, 7);
      b.addEventListener('click', function () {
        var obj = allObjects[sha];
        if (!obj) { detail.innerHTML = 'Not found.'; return; }
        var lines = ['<strong>type:</strong> ' + obj.type, '<strong>sha:</strong> ' + sha];
        if (obj.type === 'blob') lines.push('<strong>content:</strong> ' + GT.escapeHtml(obj.content));
        if (obj.type === 'tree') {
          lines.push('<strong>entries:</strong>');
          obj.entries.forEach(function (e) { lines.push('  100644 blob ' + e.sha + '  ' + e.name); });
        }
        if (obj.type === 'commit') {
          lines.push('<strong>tree:</strong> ' + obj.tree);
          if (obj.parent) lines.push('<strong>parent:</strong> ' + obj.parent);
          lines.push('<strong>message:</strong> ' + GT.escapeHtml(obj.message));
        }
        detail.innerHTML = lines.join('<br>');
      });
      return b;
    }

    var row1 = document.createElement('div');
    row1.innerHTML = '<strong>Commits:</strong> ';
    row1.appendChild(makeBtn('commit', commit2.sha, '#7ab7ff'));
    row1.appendChild(makeBtn('commit', commit1.sha, '#7ab7ff'));

    var row2 = document.createElement('div');
    row2.innerHTML = '<strong>Trees:</strong> ';
    row2.appendChild(makeBtn('tree', tree2.sha, '#a78bfa'));
    row2.appendChild(makeBtn('tree', tree.sha, '#a78bfa'));

    var row3 = document.createElement('div');
    row3.innerHTML = '<strong>Blobs:</strong> ';
    row3.appendChild(makeBtn('blob', blob2.sha, '#4ade80'));
    row3.appendChild(makeBtn('blob', blobs[0].sha, '#4ade80'));
    row3.appendChild(makeBtn('blob', blobs[1].sha, '#4ade80'));

    container.appendChild(row1);
    container.appendChild(row2);
    container.appendChild(row3);
    container.appendChild(detail);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You have a file <code>notes.txt</code> with the content "buy milk". You run <code>git add notes.txt</code>. What type of Git object is created?',
      mountInput: function (container) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">-- choose --</option>'
          + '<option value="blob">blob</option>'
          + '<option value="tree">tree</option>'
          + '<option value="commit">commit</option>'
          + '<option value="tag">tag</option>';
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'blob') return { correct: true, feedback: 'Correct. git add hashes the file content and writes a blob object. The filename (notes.txt) is NOT part of the blob — it lives in the tree, which is created at commit time.' };
        if (v === 'tree') return { correct: false, feedback: 'A tree is created when you commit, not when you add. It maps filenames to blob SHAs.' };
        if (v === 'commit') return { correct: false, feedback: 'A commit is created by git commit, not git add.' };
        return { correct: false, feedback: 'git add creates an object, just not that type.' };
      },
      hints: [
        'git add stages file content into the index. It also writes the raw content to .git/objects/.',
        'The object that stores raw file bytes (with no filename) has a specific name.',
        'The answer is blob. Blobs store content; trees store names; commits store history.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A commit object contains a pointer to a tree. That tree contains entries pointing to blobs and sub-trees. If you change one character in <code>src/app.js</code> and commit, which objects get NEW SHAs?',
      mountInput: function (container) {
        var checks = [
          { id: 'blob_app', label: 'The blob for src/app.js' },
          { id: 'blob_others', label: 'Blobs for unchanged files' },
          { id: 'tree_src', label: 'The tree for the src/ directory' },
          { id: 'tree_root', label: 'The root tree' },
          { id: 'commit', label: 'The new commit object' }
        ];
        var state = {};
        checks.forEach(function (c) {
          var label = document.createElement('label');
          label.style.display = 'block';
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = c.id;
          cb.style.marginRight = '8px';
          label.appendChild(cb);
          label.appendChild(document.createTextNode(c.label));
          container.appendChild(label);
          state[c.id] = cb;
        });
        return function () {
          return Object.keys(state).filter(function (k) { return state[k].checked; }).join(',');
        };
      },
      check: function (v) {
        var got = v.split(',').filter(Boolean).sort().join(',');
        var want = 'blob_app,commit,tree_root,tree_src';
        if (got === want) return { correct: true, feedback: 'Correct. Only changed objects get new SHAs. The changed blob ripples up: new blob → new src/ tree → new root tree → new commit. Unchanged blobs (other files) keep their old SHAs and are reused.' };
        if (v.indexOf('blob_others') !== -1) return { correct: false, feedback: 'Unchanged files keep their existing blobs. SHA is content-based, so same bytes = same SHA = same object.' };
        return { correct: false, feedback: 'Think about which objects\' content actually changed. The blob for app.js changed. What tree contains that blob? What tree contains that tree?' };
      },
      hints: [
        'SHA is computed from content. If the content didn\'t change, the SHA doesn\'t change.',
        'The changed file produces a new blob. The tree that listed that blob must now list a new SHA — so it gets a new SHA too. This cascades up to the root tree.',
        'New objects: the blob for app.js, the tree for src/, the root tree, and the commit. Everything else is reused unchanged.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You run <code>git commit --amend --no-edit</code> with no staged changes. Does this create a new commit object? Why or why not?',
      mountInput: function (container) {
        var t = document.createElement('textarea');
        t.placeholder = 'Yes or no, and explain why...';
        t.style.width = '100%';
        t.style.height = '80px';
        container.appendChild(t);
        return function () { return t.value.trim().toLowerCase(); };
      },
      check: function (v) {
        var saysYes = v.indexOf('yes') !== -1 || v.indexOf('new') !== -1 || v.indexOf('different') !== -1;
        var hasReason = v.indexOf('timestamp') !== -1 || v.indexOf('time') !== -1 || v.indexOf('committer') !== -1 || v.indexOf('sha') !== -1 || v.indexOf('hash') !== -1;
        if (saysYes && hasReason) return { correct: true, feedback: 'Correct. Even with no staged changes, amend rewrites the commit object. At minimum the committer timestamp changes, producing a new SHA. The old commit remains in .git/objects/ until gc. This is why "amend a published commit" causes the same divergence problem as rebase.' };
        if (saysYes) return { correct: false, feedback: 'Yes, a new commit IS created — good. But why? What changes in the commit object even when no files change?' };
        return { correct: false, feedback: 'Consider: git cat-file -p HEAD before and after amend. Even with no file changes, does the commit SHA stay the same?' };
      },
      hints: [
        'A commit SHA is derived from its tree SHA, parent SHA, author, committer, and message.',
        'Even if the tree and parent are identical, the committer timestamp is set to "now" when you amend.',
        'New timestamp → different commit object content → different SHA. A new commit is created. The old one becomes orphaned (no branch points to it).'
      ]
    }
  ]
});
