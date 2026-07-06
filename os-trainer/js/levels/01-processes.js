// Level 1 — Processes
OST.registerLevel({
  id: 1,
  title: 'Processes — Fork, Exec, Wait',
  whyItMatters: 'Every shell command is a fork+exec. Every server spawning workers is a fork. Every "the program just hangs" can be a misuse of wait. The four-syscall family — fork, exec, wait, exit — is the foundation of how Linux runs anything.',
  glossary: ['process', 'PID', 'PPID', 'fork', 'exec', 'wait', 'zombie', 'orphan'],
  learn: ''
    + '<h4>What\'s in a process</h4>'
    + '<p>Each process has:</p>'
    + '<ul>'
    +   '<li>A unique <strong>PID</strong> and a <strong>PPID</strong> (parent\'s PID).</li>'
    +   '<li>An <strong>address space</strong> (its virtual memory).</li>'
    +   '<li>A <strong>file descriptor table</strong> (open files, sockets, pipes).</li>'
    +   '<li>The current working directory, environment variables, signal handlers.</li>'
    +   '<li>Credentials (UID, GID, supplementary groups).</li>'
    +   '<li>Resource limits (rlimit), CPU affinity, namespaces (containers!).</li>'
    +   '<li>One or more threads of execution.</li>'
    + '</ul>'
    + '<p>Linux stores all this in a <code>struct task_struct</code> in kernel memory, one per process/thread.</p>'

    + '<h4>The four syscalls</h4>'

    + '<h4>fork()</h4>'
    + '<p>Creates a new process by cloning the calling one. After fork:</p>'
    + '<ul>'
    +   '<li>Both parent and child are running, executing the same code, after the fork() call.</li>'
    +   '<li>fork() returns 0 in the child, the child\'s PID in the parent.</li>'
    +   '<li>That return value is how each process knows which one it is.</li>'
    + '</ul>'
    + '<div class="terminal">'
    + 'pid_t pid = fork();\n'
    + 'if (pid == 0) {\n'
    + '    <span class="out">// child code path</span>\n'
    + '} else if (pid &gt; 0) {\n'
    + '    <span class="out">// parent code path; pid is child\'s PID</span>\n'
    + '} else {\n'
    + '    <span class="bad">// fork failed (rare; out of process slots)</span>\n'
    + '}'
    + '</div>'
    + '<p>Modern Linux makes fork cheap with <strong>copy-on-write (COW)</strong>: the child shares the parent\'s pages read-only. Only when one writes does the kernel actually copy that page.</p>'

    + '<h4>exec()</h4>'
    + '<p>Replaces the current process\'s executable image with a new one. Same PID, different program. The address space is wiped and reloaded from the new binary.</p>'
    + '<div class="terminal">'
    + 'execvp("ls", argv);  <span class="out">// after this, "ls" is running with this PID</span>'
    + '</div>'
    + '<p>If exec succeeds, it never returns (there\'s no caller to return to). If it fails (binary not found, no exec permission), it returns -1.</p>'

    + '<h4>The fork+exec idiom</h4>'
    + '<p>Shells run commands by combining the two:</p>'
    + '<div class="terminal">'
    + 'pid_t pid = fork();\n'
    + 'if (pid == 0) {\n'
    + '    execvp("ls", argv);   <span class="out">// child becomes ls</span>\n'
    + '    exit(127);             <span class="out">// reached only if exec fails</span>\n'
    + '} else {\n'
    + '    int status;\n'
    + '    waitpid(pid, &amp;status, 0);  <span class="out">// parent waits</span>\n'
    + '}'
    + '</div>'
    + '<p>The Unix design separates them so the parent can set things up between fork and exec — redirect stdout, change directory, drop privileges, etc.</p>'

    + '<h4>wait()</h4>'
    + '<p>Parent retrieves a child\'s exit status. <code>WEXITSTATUS(status)</code> extracts the exit code; <code>WIFSIGNALED(status)</code> tests if the child died from a signal.</p>'
    + '<p>Until the parent waits, the child remains a <strong>zombie</strong> in the process table — taking up a PID slot, holding its exit status. <code>ps</code> shows zombies as state <code>Z</code>.</p>'

    + '<h4>Orphans and PID 1</h4>'
    + '<p>If the parent exits before the child, the child becomes an <strong>orphan</strong>. The kernel reparents it to PID 1 (init / systemd), which immediately reaps it on exit. So orphans are NOT a problem; zombies (parent alive but not waiting) ARE.</p>'

    + '<h4>The classic shell-command flow</h4>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> ls\n'
    + '\n'
    + '<span class="out">1. shell calls fork()</span>\n'
    + '<span class="out">2. child calls execvp("ls", ...) — replaces itself with ls</span>\n'
    + '<span class="out">3. parent calls waitpid(child_pid, ...)</span>\n'
    + '<span class="out">4. ls runs, writes output to stdout, exits with code 0</span>\n'
    + '<span class="out">5. parent\'s waitpid returns; shell prints the next prompt</span>'
    + '</div>'

    + '<h4>Pipelines = fork+exec with pipes</h4>'
    + '<p><code>ls | grep foo</code>: shell creates a pipe, forks two children, dup2()s the pipe ends to stdin/stdout, exec()s ls and grep. The parent waits for both.</p>'

    + '<h4>Background jobs (&amp;)</h4>'
    + '<p><code>./long_task &amp;</code> — shell forks, exec\'s, but does NOT wait. Foreground vs background is just whether the shell waits.</p>'

    + '<div class="callout"><div class="label">A useful test for "where did my zombie come from?"</div>'
    + '<code>ps -ef | awk \'$2 ~ /^Z/ || $3 ~ /^Z/\'</code>. Or look at <code>/proc/&lt;pid&gt;/status</code>: <code>State: Z (zombie)</code>. The parent PID is right there. Find the parent\'s code and look for a forgotten <code>wait()</code> or a missing <code>SIGCHLD</code> handler.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click "fork" to spawn children. Click "wait" to reap a zombie. Click a child to kill it (becomes zombie until reaped). The process tree updates live.</p>';

    var nextPid = 100;
    var procs = [{ pid: 1, ppid: 0, state: 'running', children: [] }];

    var tree = document.createElement('div'); tree.className = 'proc-tree';
    var ctrls = document.createElement('div'); ctrls.className = 'controls-row';
    var output = document.createElement('div'); output.className = 'formula-box';

    function findProc(pid) {
      for (var i = 0; i < procs.length; i++) if (procs[i].pid === pid) return procs[i];
      return null;
    }
    function children(pid) { return procs.filter(function (p) { return p.ppid === pid; }); }
    function render() {
      var lines = [];
      function rec(pid, prefix) {
        var p = findProc(pid);
        if (!p) return;
        var stateLabel = p.state === 'zombie' ? '<span class="zombie">[zombie]</span>' :
                        p.state === 'orphan' ? '<span class="orphan">[orphaned to PID 1]</span>' :
                        '<span class="proc">[running]</span>';
        var line = prefix + '<span class="pid">PID ' + p.pid + '</span> (ppid ' + p.ppid + ') ' + stateLabel;
        lines.push(line);
        children(pid).forEach(function (c) { rec(c.pid, prefix + '  '); });
      }
      rec(1, '');
      tree.innerHTML = lines.join('\n');

      var z = procs.filter(function (p) { return p.state === 'zombie'; }).length;
      var live = procs.filter(function (p) { return p.state !== 'zombie'; }).length;
      output.innerHTML =
        '<div class="info-line"><span class="key">Live processes:</span> <span class="val">' + live + '</span></div>' +
        '<div class="info-line"><span class="key">Zombies:</span> <span class="val">' + z + (z > 0 ? ' (parents are leaking — reap them!)' : '') + '</span></div>';
    }

    function btn(label, fn) {
      var b = document.createElement('button'); b.className = 'secondary-btn'; b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    }

    ctrls.appendChild(btn('fork() under PID 1', function () {
      procs.push({ pid: nextPid++, ppid: 1, state: 'running' });
      render();
    }));
    ctrls.appendChild(btn('fork() under random child', function () {
      var c = procs.filter(function (p) { return p.state === 'running' && p.pid !== 1; });
      if (!c.length) { alert('No children yet. Fork once first.'); return; }
      var parent = c[Math.floor(Math.random() * c.length)];
      procs.push({ pid: nextPid++, ppid: parent.pid, state: 'running' });
      render();
    }));
    ctrls.appendChild(btn('exit a leaf process (becomes zombie)', function () {
      var leaves = procs.filter(function (p) {
        return p.state === 'running' && p.pid !== 1 && children(p.pid).length === 0;
      });
      if (!leaves.length) { alert('No leaf processes to exit.'); return; }
      var leaf = leaves[Math.floor(Math.random() * leaves.length)];
      leaf.state = 'zombie';
      render();
    }));
    ctrls.appendChild(btn('wait() — reap a zombie', function () {
      var z = procs.filter(function (p) { return p.state === 'zombie'; });
      if (!z.length) { alert('No zombies to reap. Make one first.'); return; }
      var idx = procs.indexOf(z[0]);
      procs.splice(idx, 1);
      render();
    }));
    ctrls.appendChild(btn('parent dies (children → init)', function () {
      var inner = procs.filter(function (p) {
        return p.state === 'running' && p.pid !== 1 && children(p.pid).length > 0;
      });
      if (!inner.length) { alert('No process with children (other than PID 1).'); return; }
      var parent = inner[Math.floor(Math.random() * inner.length)];
      // Reparent its children to PID 1
      procs.forEach(function (p) { if (p.ppid === parent.pid) p.ppid = 1; });
      // Remove the dying parent
      var idx = procs.indexOf(parent);
      procs.splice(idx, 1);
      render();
    }));

    container.appendChild(ctrls);
    container.appendChild(tree);
    container.appendChild(output);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A C program calls <code>fork()</code>. Immediately after the call returns, how many processes are running this code?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>1</option><option>2</option><option>It depends</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2') return { correct: true, feedback: 'Right. fork() returns twice — once in the parent (returning the child\'s PID) and once in the child (returning 0). Both processes resume execution from the same point with different return values.' };
        return { correct: false, feedback: 'fork() returns TWICE — in the parent and in the child. Two processes resume from the same point.' };
      },
      hints: [
        'fork() returns twice — once in each process.',
        '2.',
        '2.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A long-running daemon spawns child processes regularly but never calls <code>wait()</code>. Over hours, what happens?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Children become orphans, adopted by init, no problem</option>' +
          '<option>Children become zombies; the process table fills up. Eventually fork() fails with EAGAIN and no new processes can be created system-wide.</option>' +
          '<option>The kernel auto-reaps after 30 seconds</option>' +
          '<option>The OOM killer kills the daemon</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Children become zombies; the process table fills up') === 0) return { correct: true, feedback: 'Right. As long as the parent is alive, exited children are zombies and stay zombies until reaped (or the parent exits, in which case they become orphans → reaped by init). PID space is finite (default 32K, can be 4M); a leaking daemon will eventually fill it. Fix: install a SIGCHLD handler that calls waitpid() in a loop, OR explicitly waitpid() in your event loop.' };
        if (v === 'Children become orphans, adopted by init, no problem') return { correct: false, feedback: 'Orphans only happen if the PARENT dies. Here the parent is alive but not waiting → zombies.' };
        if (v === 'The kernel auto-reaps after 30 seconds') return { correct: false, feedback: 'The kernel never auto-reaps while the parent is alive. Zombies persist until parent calls wait() or parent dies.' };
        if (v === 'The OOM killer kills the daemon') return { correct: false, feedback: 'OOM kills based on memory pressure, not zombie count.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'When does an unwaited child become an orphan vs a zombie?',
        'Orphan only if parent dies. Otherwise zombie. Zombies hold PID slots.',
        'Process table fills with zombies; eventually fork fails.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A C program: <code>fork(); fork(); fork(); printf("hi");</code>. How many "hi" messages are printed in total (counting parent and all descendants)?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='count';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 8) return { correct: true, feedback: 'Right. Each fork() doubles the process count. Start: 1. After fork#1: 2. After fork#2: 4. After fork#3: 8. All 8 reach the printf — exactly 8 lines, because the printf comes AFTER the forks. (Classic gotcha: if the printf preceded the forks and stdout was block-buffered, the unflushed buffer would be duplicated by each fork and you would see MORE than 8 lines on flush. Order of operations matters.)' };
        if (v === 4) return { correct: false, feedback: 'You counted only fork-pairs at one level. Each fork doubles. Three forks = 2³ = 8.' };
        if (v === 3) return { correct: false, feedback: 'You counted forks, not the resulting processes. Three forks doubles three times: 2³ = 8.' };
        return { correct: false, feedback: 'Each fork doubles the process count. After N forks: 2^N processes. Three forks → 8.' };
      },
      hints: [
        'fork() doubles the process count. Three forks in series: how many doublings?',
        '2 × 2 × 2 = 8 processes total.',
        '8.'
      ]
    }
  ]
});
