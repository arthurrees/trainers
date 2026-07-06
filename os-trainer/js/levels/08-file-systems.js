// Level 8 — File systems
OST.registerLevel({
  id: 8,
  title: 'File Systems — Inodes, Links, Descriptors',
  whyItMatters: 'Filesystems aren\'t just "where files live" — they\'re the data model that makes "ln -s", "rm a busy file", "df vs du discrepancies", and "open file descriptors" make sense. The on-disk layout is unexpectedly elegant.',
  glossary: ['inode', 'dentry', 'hard link', 'symlink', 'fd', 'fs'],
  learn: ''
    + '<h4>The big idea: name vs file</h4>'
    + '<p>The single most important fact: <strong>filenames are NOT a property of files</strong>. A file is described by an <strong>inode</strong>, which contains size, owner, permissions, timestamps, and pointers to data blocks. The inode does NOT contain the name. Names live in <strong>directory entries (dentries)</strong>, which are (name → inode-number) pairs stored in directories.</p>'

    + '<h4>What a directory really is</h4>'
    + '<p>A directory is just a special file containing a list of (name, inode) pairs. <code>ls</code> reads this list and presents it. <code>mkdir</code> creates a new directory file with two initial entries: <code>.</code> (its own inode) and <code>..</code> (parent\'s inode).</p>'

    + '<h4>Hard links</h4>'
    + '<p><code>ln a b</code> adds a new dentry pointing to the same inode as <code>a</code>. After this, <code>a</code> and <code>b</code> are <em>indistinguishable</em>: same inode, same data, same mtime, same permissions. Modifying via <code>a</code> shows up via <code>b</code>.</p>'
    + '<p>The inode has a "link count." <code>rm a</code> removes the dentry and decrements the count. Only when count reaches 0 are the data blocks freed.</p>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> echo hello &gt; a\n'
    + '<span class="prompt">$</span> ln a b\n'
    + '<span class="prompt">$</span> ls -li a b\n'
    + '<span class="hi">12345</span> -rw-r--r-- <span class="hi">2</span> user user 6 May  6 10:15 a\n'
    + '<span class="hi">12345</span> -rw-r--r-- <span class="hi">2</span> user user 6 May  6 10:15 b\n'
    + '<span class="prompt">$</span> rm a\n'
    + '<span class="prompt">$</span> cat b\n'
    + 'hello'
    + '</div>'
    + '<p>Limits: hard links can\'t cross filesystems (inode numbers are filesystem-local) and most filesystems disallow hard-linking directories (would create cycles).</p>'

    + '<h4>Symbolic links (symlinks)</h4>'
    + '<p>A symlink is its own tiny file whose contents are a path to another file. <code>ln -s a b</code> makes <code>b</code> a symlink containing the string "a". Different inode; <em>resolved at access time</em>.</p>'
    + '<p>Differences from hard links:</p>'
    + '<ul>'
    +   '<li>Can cross filesystems.</li>'
    +   '<li>Can target directories.</li>'
    +   '<li>Can be <strong>broken</strong> — target may not exist or may be removed later. Hard links never go stale.</li>'
    +   '<li>Show up in <code>ls -l</code> with an arrow: <code>b -&gt; a</code>.</li>'
    + '</ul>'

    + '<h4>The file-descriptor table</h4>'
    + '<p>Each process has a per-process file descriptor table. fd 0/1/2 are reserved for stdin/stdout/stderr; <code>open()</code> returns the smallest unused integer.</p>'
    + '<p>Three layers:</p>'
    + '<ol>'
    +   '<li>Per-process FD table: small integer → entry in...</li>'
    +   '<li>System-wide open file table: each entry has a current offset (seek position), open flags, and a pointer to...</li>'
    +   '<li>The inode table.</li>'
    + '</ol>'
    + '<p>Two processes that <code>open()</code> the same file get different fd table entries (independent seek positions). After <code>fork()</code>, parent and child share the same open file table entry (shared seek position!) — a classic surprise.</p>'

    + '<h4>"Removed but still open"</h4>'
    + '<p>Unix lets you <code>unlink()</code> a file that\'s still open. The dentry is gone (the file is invisible to <code>ls</code>) but the inode\'s link count is still &gt; 0 because the open file descriptor counts as a reference. The file\'s blocks aren\'t freed until the last fd is closed.</p>'
    + '<p>Practical consequence: <code>rm /var/log/huge.log</code> while a daemon has it open does NOT free the disk space. <code>df</code> shows the same. <code>du /var/log</code> shows less. The discrepancy is "deleted but still held open." Fix: restart the daemon, or <code>truncate -s 0 /var/log/huge.log</code> instead.</p>'

    + '<h4>The inode itself (ext4 example)</h4>'
    + '<p>An inode contains:</p>'
    + '<ul>'
    +   '<li>File type (regular / directory / symlink / device / fifo / socket).</li>'
    +   '<li>Permissions (mode bits including SUID/SGID/sticky — see eth-hacking-trainer L11).</li>'
    +   '<li>Owner UID, GID.</li>'
    +   '<li>Size in bytes.</li>'
    +   '<li>Timestamps: atime (last access), mtime (last modify), ctime (last metadata change), btime/birth (creation, on supported filesystems).</li>'
    +   '<li>Link count.</li>'
    +   '<li>Block pointers: direct, indirect, double-indirect, triple-indirect (allowing very large files with small inodes).</li>'
    + '</ul>'
    + '<p>Modern filesystems use extents (start + length) instead of block pointers — more compact for big files.</p>'

    + '<h4>Common Linux file systems</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>FS</th><th>Notes</th></tr>'
    + '<tr><td>ext4</td><td>Default for most distros. Reliable, well-tuned. Journaling.</td></tr>'
    + '<tr><td>XFS</td><td>Excellent on big-file workloads. RHEL default.</td></tr>'
    + '<tr><td>btrfs</td><td>Copy-on-write. Snapshots. Subvolumes. Checksums.</td></tr>'
    + '<tr><td>ZFS</td><td>Industrial-strength: checksums, compression, snapshots, send/receive. Not in mainline Linux due to license.</td></tr>'
    + '<tr><td>tmpfs</td><td>RAM-backed. /tmp on most modern Linuxes.</td></tr>'
    + '<tr><td>FAT/exFAT/NTFS</td><td>Cross-OS compatibility. Limited Unix semantics (no real perms, no inodes-as-permanent-IDs).</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">"df shows full but du shows half — what gives?"</div>'
    + 'Likely: deleted-but-still-open file. <code>lsof | grep \'(deleted)\'</code> shows them. Restart the holding process to free the space, or use <code>:&gt; /proc/PID/fd/N</code> to truncate the held file via /proc.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click an operation. See how dentries and the inode table change.</p>';

    var state = {
      inodes: { 100: { type: 'file', linkCount: 1, contents: 'hello world\n' } },
      dirs: { '/': { 'a': 100 } },
      nextInode: 101
    };

    var output = document.createElement('div'); output.className = 'formula-box';
    var ctrls = document.createElement('div');

    function btn(label, fn) {
      var b = document.createElement('button'); b.className='secondary-btn'; b.textContent=label;
      b.style.marginRight='6px'; b.style.marginBottom='6px';
      b.addEventListener('click', fn);
      return b;
    }

    function render() {
      var lines = ['<strong>Directory /:</strong>'];
      var entries = state.dirs['/'];
      Object.keys(entries).forEach(function (name) {
        var ino = entries[name];
        var inode = state.inodes[ino];
        lines.push('  <code>' + name + '</code> &rarr; inode ' + ino + (inode.type === 'symlink' ? ' (symlink → ' + inode.target + ')' : ''));
      });
      lines.push('');
      lines.push('<strong>Inode table:</strong>');
      Object.keys(state.inodes).forEach(function (ino) {
        var i = state.inodes[ino];
        var color = i.linkCount === 0 ? 'var(--bad)' : i.linkCount > 1 ? 'var(--accent)' : 'var(--text)';
        lines.push('  <span style="color:' + color + '">inode ' + ino + ': ' + i.type + ', linkCount=' + i.linkCount + ', "' + (i.target || (i.contents || '').slice(0, 30)) + '"</span>');
      });
      output.innerHTML = lines.join('<br>');
    }

    ctrls.appendChild(btn('echo "data" > b (create file)', function () {
      var ino = state.nextInode++;
      state.inodes[ino] = { type: 'file', linkCount: 1, contents: 'data\n' };
      state.dirs['/']['b'] = ino;
      render();
    }));
    ctrls.appendChild(btn('ln a c (hard link)', function () {
      if (!state.dirs['/']['a']) { alert('a doesn\'t exist'); return; }
      var ino = state.dirs['/']['a'];
      state.dirs['/']['c'] = ino;
      state.inodes[ino].linkCount++;
      render();
    }));
    ctrls.appendChild(btn('ln -s a sym (symlink)', function () {
      var ino = state.nextInode++;
      state.inodes[ino] = { type: 'symlink', linkCount: 1, target: 'a' };
      state.dirs['/']['sym'] = ino;
      render();
    }));
    ctrls.appendChild(btn('rm a (unlink)', function () {
      if (!state.dirs['/']['a']) { alert('a doesn\'t exist'); return; }
      var ino = state.dirs['/']['a'];
      delete state.dirs['/']['a'];
      state.inodes[ino].linkCount--;
      if (state.inodes[ino].linkCount === 0) delete state.inodes[ino];
      render();
    }));
    ctrls.appendChild(btn('rm -- everything', function () {
      Object.keys(state.dirs['/']).forEach(function (n) {
        var ino = state.dirs['/'][n];
        delete state.dirs['/'][n];
        state.inodes[ino].linkCount--;
        if (state.inodes[ino].linkCount === 0) delete state.inodes[ino];
      });
      render();
    }));
    ctrls.appendChild(btn('reset', function () {
      state.inodes = { 100: { type: 'file', linkCount: 1, contents: 'hello world\n' } };
      state.dirs = { '/': { 'a': 100 } };
      state.nextInode = 101;
      render();
    }));

    container.appendChild(ctrls);
    container.appendChild(output);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You run <code>echo hello &gt; foo</code>, then <code>ln foo bar</code>, then <code>rm foo</code>. What is in <code>bar</code>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>"hello"</option>' +
          '<option>Empty file</option>' +
          '<option>bar is now broken (file deleted)</option>' +
          '<option>"Permission denied"</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '"hello"') return { correct: true, feedback: 'Right. <code>ln</code> creates a hard link — same inode. After <code>rm foo</code> the inode\'s link count is still 1 (bar holds a reference); the data is intact.' };
        if (v === 'bar is now broken (file deleted)') return { correct: false, feedback: 'That\'s symlink behavior. Hard links don\'t go stale.' };
        return { correct: false, feedback: 'Hard link = same inode. rm reduces link count; doesn\'t free data while count > 0.' };
      },
      hints: [
        'Is <code>ln</code> hard or soft?',
        'Hard. Same inode. Data freed only when link count hits 0.',
        '"hello" — bar still points to the same inode.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A daemon on production opens <code>/var/log/myapp.log</code> at startup, writes to it for hours. Disk is filling up. You <code>rm /var/log/myapp.log</code> to free space. What happens to disk usage?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Disk space is freed immediately</option>' +
          '<option>Disk space is NOT freed because the daemon still has the file open. The link count went to 0 but the open fd keeps the inode alive. Daemon keeps writing to the now-invisible file. Space frees only when the daemon closes the fd or restarts.</option>' +
          '<option>The daemon crashes</option>' +
          '<option>The kernel kills the daemon</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Disk space is NOT freed because the daemon still has the file open') === 0) return { correct: true, feedback: 'Right. The classic gotcha. <code>df</code> still shows the space used; <code>du</code> shows less; <code>ls</code> doesn\'t show the file. <code>lsof | grep deleted</code> reveals the held-open files. Solutions: restart the daemon, send it a HUP if it has a logrotate-aware handler, OR truncate via /proc: <code>:&gt; /proc/&lt;daemon-pid&gt;/fd/&lt;N&gt;</code>. Best practice: rotate logs in place (logrotate copytruncate or signal-based) so file is never unlinked while open.' };
        return { correct: false, feedback: 'Open fd keeps the inode alive (link count > 0 effectively). Space is held until close.' };
      },
      hints: [
        'Unix semantics: file is freed when ALL references are gone — both dentries AND open fds.',
        'rm removed the dentry, but the daemon\'s open fd still references the inode.',
        'Space NOT freed. Need to close the fd (restart daemon or truncate via /proc).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A C program: <code>fd = open("file", O_WRONLY); fork(); write(fd, "X", 1); write(fd, "Y", 1);</code>. Both parent and child execute the writes. After both finish, the file contains 4 bytes. What 4 bytes are in the file (in order)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>"XYXY" — file always contains 4 bytes in order</option>' +
          '<option>"XXYY" — parent finishes first, then child</option>' +
          '<option>Could be "XYXY", "XXYY", "XYYX", or "YXXY" — ANY interleaving — but always 4 distinct bytes because parent and child SHARE the open-file-table entry (and thus the seek position), so writes don\'t overwrite each other</option>' +
          '<option>"XX" or "YY" — race condition causes lost writes</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Could be "XYXY", "XXYY", "XYYX", or "YXXY"') === 0) return { correct: true, feedback: 'Right. After fork, parent and child share the open-file-table entry (the shared seek position is the key fact). Each write atomically appends 1 byte and advances the offset. Order depends on scheduling — any interleaving is possible — but the SEEK POSITION is shared, so writes don\'t step on each other. If they had each opened the file independently in two processes, separate offsets → writes WOULD overlap. This shared-fd-after-fork behavior is exactly the case for stdout from a forked process.' };
        if (v === '"XYXY" — file always contains 4 bytes in order') return { correct: false, feedback: 'No guarantees on ordering — schedulers can interleave anywhere. But all 4 bytes ARE preserved.' };
        if (v === '"XXYY" — parent finishes first, then child') return { correct: false, feedback: 'No guarantee parent finishes first.' };
        if (v === '"XX" or "YY" — race condition causes lost writes') return { correct: false, feedback: 'Writes don\'t overwrite — they share the seek position. Each write advances it.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Does fork share the open-file-table entry, or just the fd table entry?',
        'Both fd table AND the open-file-table entry are shared after fork. Same seek position.',
        'All 4 bytes preserved, any interleaving possible. The SHARED offset is the trick.'
      ]
    }
  ]
});
