// Level 2 — Threads vs processes
OST.registerLevel({
  id: 2,
  title: 'Threads vs Processes',
  whyItMatters: 'Knowing what threads share — and what they don\'t — is the key to writing correct concurrent code. Most concurrency bugs come from "I forgot the heap is shared" or "I assumed errno was thread-local."',
  glossary: ['process', 'thread', 'TLS'],
  learn: ''
    + '<h4>The shared/not-shared table</h4>'
    + '<p>The single most useful diagram in OS class:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>What</th><th>Threads in same process</th><th>Different processes</th></tr>'
    + '<tr><td>Address space (heap, globals, code, mmap)</td><td class="warn">SHARED</td><td>Separate</td></tr>'
    + '<tr><td>File descriptors</td><td class="warn">SHARED</td><td>Separate (unless inherited via fork)</td></tr>'
    + '<tr><td>Signal handlers</td><td class="warn">SHARED</td><td>Separate</td></tr>'
    + '<tr><td>Working directory, environment</td><td class="warn">SHARED</td><td>Separate</td></tr>'
    + '<tr><td>UID/GID</td><td class="warn">SHARED</td><td>Inherited but can change independently</td></tr>'
    + '<tr><td>Stack</td><td class="good">PER-THREAD</td><td>Per-process</td></tr>'
    + '<tr><td>Registers + program counter</td><td class="good">PER-THREAD</td><td>Per-process</td></tr>'
    + '<tr><td>errno (thread-local)</td><td class="good">PER-THREAD</td><td>Per-process</td></tr>'
    + '<tr><td>Thread-local storage (TLS)</td><td class="good">PER-THREAD</td><td>Per-process</td></tr>'
    + '<tr><td>Signal mask + pending signals</td><td class="good">PER-THREAD</td><td>Per-process</td></tr>'
    + '</table>'

    + '<h4>"Shared" means "you need a lock"</h4>'
    + '<p>Anything in the SHARED column is a potential race condition. Two threads incrementing the same counter, two threads writing to the same file descriptor, two threads modifying the same hash table — all need synchronization (level 10).</p>'

    + '<h4>The Linux truth: clone()</h4>'
    + '<p>On Linux, fork() and pthread_create() are both built on the same lower-level syscall: <code>clone()</code>. The flags decide what gets shared:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Flag</th><th>Effect</th></tr>'
    + '<tr><td><code>CLONE_VM</code></td><td>Share address space</td></tr>'
    + '<tr><td><code>CLONE_FILES</code></td><td>Share file descriptor table</td></tr>'
    + '<tr><td><code>CLONE_FS</code></td><td>Share filesystem info (cwd, umask)</td></tr>'
    + '<tr><td><code>CLONE_SIGHAND</code></td><td>Share signal handlers</td></tr>'
    + '<tr><td><code>CLONE_THREAD</code></td><td>New "thread" within same thread group (PID stays the same as the leader; thread has a TID)</td></tr>'
    + '</table>'
    + '<p>fork() = clone() with no sharing. pthread_create() = clone() with all of the above. There\'s a continuum in between (used by containers — see <code>CLONE_NEWNS</code>, <code>CLONE_NEWPID</code>, etc., for namespaces).</p>'

    + '<h4>Threads, scheduler-side</h4>'
    + '<p>The Linux kernel schedules threads, not processes. To the scheduler, a thread is just a task; threads in the same process compete with threads in other processes for CPU. (This is "1:1 threading" — every userspace thread is a kernel-scheduled task.)</p>'

    + '<h4>When to use threads vs processes</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Use case</th><th>Choice</th><th>Why</th></tr>'
    + '<tr><td>Parallelize CPU work, share data</td><td>Threads</td><td>No cost for shared access. (Cf. Python GIL — threads don\'t parallelize CPU; use multiprocessing.)</td></tr>'
    + '<tr><td>Run untrusted code</td><td>Processes</td><td>Address-space isolation. A bug in one can\'t corrupt the other\'s memory.</td></tr>'
    + '<tr><td>Crash isolation</td><td>Processes</td><td>One worker crashes; others survive. Browsers do this per-tab.</td></tr>'
    + '<tr><td>Different privileges</td><td>Processes</td><td>setuid only works at process granularity.</td></tr>'
    + '<tr><td>I/O concurrency on a budget</td><td>Async (one process, one thread)</td><td>Avoids thread-switch overhead entirely. Node, Go (goroutines on threads), Python asyncio.</td></tr>'
    + '</table>'

    + '<h4>The Python GIL footnote</h4>'
    + '<p>CPython has a Global Interpreter Lock — only one thread executes Python bytecode at a time. So Python threads don\'t parallelize CPU work; they only help with I/O-bound work where the GIL is released during blocking calls. For CPU-bound parallelism: <code>multiprocessing</code> (separate Python processes), or use a library that releases the GIL (numpy, PyTorch). Python 3.13 has experimental "no-GIL" mode.</p>'

    + '<h4>The browser model</h4>'
    + '<p>Modern browsers use both:</p>'
    + '<ul>'
    +   '<li>One process per tab/origin (process isolation — a malicious page can\'t read another tab\'s memory).</li>'
    +   '<li>Within each renderer process, multiple threads (compositor, raster, JS runtime, GPU thread).</li>'
    + '</ul>'
    + '<p>Chrome can have hundreds of processes when you have many tabs. That\'s deliberate — it\'s the security model.</p>'

    + '<div class="callout"><div class="label">A useful debugging heuristic</div>'
    + 'When two threads "fight over" a variable, think of it as: "if I printed this variable, what value would I see?" — and remember that BOTH threads can be in mid-update simultaneously. The race is real even if the value never seems wrong in casual testing. Solutions: atomic ops for primitives, locks for compound data, message passing to avoid the question.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click each property to see whether two threads in the same process share it (and whether two separate processes do).</p>';
    var props = [
      { name: 'A global variable in C', threads: 'SHARED — both threads see writes', procs: 'Separate copies — each process has its own' },
      { name: 'malloc()ed heap memory', threads: 'SHARED — same heap pointer is valid in both', procs: 'Separate — same pointer in two procs is unrelated memory' },
      { name: 'Stack-local int x;', threads: 'PER-THREAD — each has own stack', procs: 'PER-PROCESS — each has own stack' },
      { name: 'errno', threads: 'PER-THREAD via TLS — different threads can have different errno values from concurrent syscalls', procs: 'PER-PROCESS' },
      { name: 'open() file descriptor', threads: 'SHARED — both threads see the same fd (and seek position)', procs: 'After fork: shared file table entry initially, then separate fd tables (but underlying file is shared)' },
      { name: 'Signal handlers', threads: 'SHARED — installing one in thread A affects thread B', procs: 'Separate — fork inherits but they diverge after' },
      { name: 'Current working directory', threads: 'SHARED — chdir() in one thread changes it for all', procs: 'Per-process; chdir affects only the calling process' },
      { name: 'Signal mask (which signals are blocked)', threads: 'PER-THREAD — pthread_sigmask vs sigprocmask', procs: 'Per-process' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a property</span>';
    props.forEach(function (p) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = p.name;
      b.style.maxWidth = '260px'; b.style.whiteSpace = 'normal'; b.style.textAlign = 'left';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + p.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Two threads in same process:</span> <span class="val">' + p.threads + '</span></div>' +
          '<div class="info-line"><span class="key">Two separate processes:</span> <span class="val">' + p.procs + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Two threads in the same C process both increment a shared global counter <code>g</code> a million times each in a loop: <code>g++;</code>. After both finish, what value is <code>g</code> guaranteed to have?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Exactly 2,000,000</option>' +
          '<option>Somewhere between 1,000,000 and 2,000,000 — race condition; g++ is not atomic</option>' +
          '<option>0 — undefined behavior</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Somewhere between 1,000,000 and 2,000,000') === 0) return { correct: true, feedback: 'Right. <code>g++</code> compiles to (typically) a load, increment, store — three instructions. Two threads can interleave: T1 reads 5, T2 reads 5, T1 writes 6, T2 writes 6 — net +1 instead of +2. The "lost update" race. Final value is <em>somewhere between 1M and 2M</em>, depending on how often the race fires. Fix: <code>__atomic_fetch_add</code> in C / <code>std::atomic&lt;int&gt;</code> in C++ / <code>AtomicInteger</code> in Java / a mutex.' };
        if (v === 'Exactly 2,000,000') return { correct: false, feedback: 'g++ is NOT atomic in C. It\'s load + increment + store, three instructions, with race windows in between.' };
        if (v === '0 — undefined behavior') return { correct: false, feedback: 'In C/C++ this is technically undefined behavior (data race), but in practice you get a value between 1M and 2M, not 0.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'g++ compiles to load + increment + store. Three instructions. Are they atomic?',
        'No. Two threads can interleave and lose updates.',
        'Between 1M and 2M.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re writing a Python program that does heavy NumPy matrix math AND lots of concurrent HTTP requests. Which is the best architecture?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Threads everywhere — Python threads parallelize NumPy</option>' +
          '<option>multiprocessing for the NumPy work (escapes the GIL), asyncio for HTTP (non-blocking I/O is far more efficient than threads for many concurrent requests)</option>' +
          '<option>Single-threaded — Python is too slow to parallelize</option>' +
          '<option>Switch to JavaScript</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('multiprocessing for the NumPy work') === 0) return { correct: true, feedback: 'Right. The Python GIL prevents threads from parallelizing pure-Python CPU work, but NumPy releases the GIL during its C-implemented operations — so SOME thread parallelism works for NumPy specifically. Still, multiprocessing is cleaner and scales further. For HTTP: asyncio (or trio/anyio) handles thousands of concurrent connections in one thread without the per-thread overhead.' };
        if (v === 'Threads everywhere — Python threads parallelize NumPy') return { correct: false, feedback: 'Partially true (NumPy releases the GIL). But multiprocessing scales further for CPU work, and asyncio is much better for many concurrent HTTP than threads.' };
        if (v === 'Single-threaded — Python is too slow to parallelize') return { correct: false, feedback: 'NumPy + multiprocessing is plenty fast.' };
        if (v === 'Switch to JavaScript') return { correct: false, feedback: 'Not the question.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Python GIL: threads can\'t parallelize pure-Python CPU work.',
        'For CPU: multiprocessing. For many concurrent I/O: asyncio.',
        'multiprocessing + asyncio.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A multi-threaded server forks. Right after fork, in the child, only the calling thread exists — all other threads vanished. Why is this — and what surprising consequence has tripped up real production servers?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>fork() in a multi-threaded program clones ONLY the calling thread. Surprise: any locks held by the OTHER threads at fork time are still locked in the child (the lock state was copied) but the threads holding them don\'t exist there. Subsequent attempts to acquire those locks deadlock the child. This is why fork+exec is fine but fork-without-exec in multi-threaded programs is dangerous.</option>' +
          '<option>fork() in a multi-threaded program clones all threads — the question\'s premise is wrong</option>' +
          '<option>Threads vanish because their stacks live in shared memory</option>' +
          '<option>Linux refuses to fork multi-threaded processes since 4.0</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('fork() in a multi-threaded program clones ONLY the calling thread') === 0) return { correct: true, feedback: 'Right. POSIX requires fork() to clone only the calling thread. The child gets a copy of the address space — INCLUDING the state of every mutex. If thread B held mutex M when thread A called fork(), the child has a "M is locked" bit but no thread B to unlock it. Any code in the child that tries to acquire M deadlocks. Real-world: many production stories of "fork in malloc-heavy multi-threaded code → child hangs forever." The safe pattern: fork+exec immediately (exec wipes the address space, starting fresh), or use posix_spawn(). Glibc has pthread_atfork() handlers but most code uses them wrong.' };
        return { correct: false, feedback: 'Premise is correct: only the calling thread survives. Re-read about lock state surviving in the child without its holder.' };
      },
      hints: [
        'fork() clones only the calling thread, but copies the WHOLE address space — including mutex state.',
        'If another thread held a mutex at fork time, the child has the locked-mutex state without the holder.',
        'Deadlock if the child tries to acquire that lock. Fix: fork+exec immediately, or posix_spawn().'
      ]
    }
  ]
});
