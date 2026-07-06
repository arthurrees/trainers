// Level 9 — System calls
OST.registerLevel({
  id: 9,
  title: 'System Calls — The User/Kernel Boundary',
  whyItMatters: 'Every syscall is a privilege transition. Knowing which operations are syscalls (vs library calls), what they cost, and how to inspect them turns "this program is mysteriously slow" into "this program makes 10K syscalls/sec; here\'s why."',
  glossary: ['syscall', 'kernel', 'userspace'],
  learn: ''
    + '<h4>What a syscall does, mechanically</h4>'
    + '<p>On x86_64 Linux:</p>'
    + '<ol>'
    +   '<li>Userspace places the syscall number in <code>rax</code>, args in <code>rdi rsi rdx r10 r8 r9</code>.</li>'
    +   '<li>Userspace executes the <code>syscall</code> instruction.</li>'
    +   '<li>CPU switches to ring 0, jumps to the kernel\'s <code>entry_SYSCALL_64</code> handler.</li>'
    +   '<li>Kernel saves user state (mostly automatic), checks the syscall number against the syscall table, dispatches.</li>'
    +   '<li>The kernel function does its work — possibly waiting (blocking syscall), possibly running entirely in kernel mode.</li>'
    +   '<li>Returns the result in <code>rax</code> (negative values 0..−4095 are errors, encoding errno).</li>'
    +   '<li><code>sysret</code> instruction returns to ring 3.</li>'
    + '</ol>'
    + '<p>The cost of just the boundary crossing: ~100–500 ns on modern CPUs (KPTI added another ~100 ns on Meltdown-vulnerable hardware).</p>'

    + '<h4>Syscall vs library call vs vDSO</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Kind</th><th>Crosses to kernel?</th><th>Examples</th></tr>'
    + '<tr><td>Pure library function</td><td>No</td><td><code>strlen</code>, <code>memcpy</code>, <code>printf("hello")</code> (until flush), <code>sin(x)</code></td></tr>'
    + '<tr><td>Library wrapper around syscall</td><td>Yes (every call)</td><td><code>open</code>, <code>read</code>, <code>write</code>, <code>fork</code></td></tr>'
    + '<tr><td>Library wrapper that batches</td><td>Sometimes</td><td><code>fread</code> (buffered), <code>printf</code> (buffered until newline/flush)</td></tr>'
    + '<tr><td>vDSO ("virtual dynamic shared object")</td><td>Userspace only — kernel maps "fast path" code into every process</td><td><code>gettimeofday</code>, <code>clock_gettime</code>, <code>getcpu</code></td></tr>'
    + '</table>'
    + '<p>The vDSO is the kernel\'s answer to "people call gettimeofday millions of times per second." Instead of a real syscall, the kernel publishes time data in a shared page; the vDSO function reads it directly. Cost: ~10 ns vs ~500 ns for a real syscall.</p>'

    + '<h4>Common syscalls (Linux)</h4>'
    + '<p>There are ~400 in modern Linux. The most-used:</p>'
    + '<ul>'
    +   '<li><code>read</code>, <code>write</code>, <code>open</code>, <code>close</code> — file I/O.</li>'
    +   '<li><code>mmap</code>, <code>munmap</code>, <code>brk</code> — memory.</li>'
    +   '<li><code>fork</code>, <code>execve</code>, <code>exit</code>, <code>wait4</code> — process lifecycle.</li>'
    +   '<li><code>socket</code>, <code>bind</code>, <code>listen</code>, <code>accept</code>, <code>send</code>, <code>recv</code> — network.</li>'
    +   '<li><code>poll</code>, <code>select</code>, <code>epoll_*</code>, <code>io_uring_*</code> — I/O multiplexing.</li>'
    +   '<li><code>futex</code> — userspace locking primitives (mutexes, condvars).</li>'
    +   '<li><code>clone</code>, <code>set_tid_address</code> — thread/process creation.</li>'
    +   '<li><code>kill</code>, <code>rt_sigaction</code> — signals.</li>'
    + '</ul>'

    + '<h4>strace — your friend</h4>'
    + '<p><code>strace</code> uses ptrace to intercept every syscall a process makes:</p>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> strace -c sleep 1\n'
    + '<span class="out">% time     seconds  usecs/call     calls    errors syscall</span>\n'
    + '------ ----------- ----------- --------- --------- ----------------\n'
    + ' 30.85    0.000031          15         2           clock_nanosleep\n'
    + ' 21.89    0.000022           7         3           mmap\n'
    + ' 17.91    0.000018           4         4           openat\n'
    + ' 13.93    0.000014           4         3         3 access\n'
    + ' 11.94    0.000012           3         3           close\n'
    + '...'
    + '</div>'
    + '<p>Use cases:</p>'
    + '<ul>'
    +   '<li><code>strace -c</code> — count + time per syscall (great for "where is the time going?").</li>'
    +   '<li><code>strace -e openat,read</code> — filter to specific syscalls.</li>'
    +   '<li><code>strace -f</code> — follow forks (without it, only the parent is traced).</li>'
    +   '<li><code>strace -p PID</code> — attach to a running process.</li>'
    + '</ul>'
    + '<p>Caveat: strace adds 10–100× overhead. Don\'t leave it on production. <code>perf trace</code> is a lower-overhead alternative.</p>'

    + '<h4>Reducing syscall count — patterns</h4>'
    + '<ul>'
    +   '<li><strong>Bigger buffers</strong>: read 64 KB at a time, not 1 byte.</li>'
    +   '<li><strong>mmap instead of read</strong>: for large files; pages fault in lazily.</li>'
    +   '<li><strong>sendfile</strong>: copy file to socket without ever entering userspace memory.</li>'
    +   '<li><strong>splice / vmsplice</strong>: zero-copy between file descriptors.</li>'
    +   '<li><strong>epoll edge-triggered</strong>: one syscall returns many ready fds.</li>'
    +   '<li><strong>io_uring</strong>: submit batches of operations via shared ring buffer with kernel; near-zero syscall overhead.</li>'
    + '</ul>'

    + '<h4>seccomp — restricting which syscalls are allowed</h4>'
    + '<p>Linux\'s <code>seccomp-bpf</code> filters which syscalls a process can make. Used heavily for sandboxing — Docker, Chrome\'s renderer, gVisor, Firecracker. A misbehaving (or malicious) program can\'t make syscalls outside the allow-list. Combined with namespaces and cgroups, it\'s the foundation of container isolation.</p>'

    + '<div class="callout"><div class="label">"Why is this program slow?"</div>'
    + '<code>strace -c -p PID</code> for ~10 seconds, look at the top syscalls by time. If <code>read</code> is dominating with tiny <code>usecs/call</code> and a huge call count → buffer too small. If <code>futex</code> is huge → lock contention (probably too many threads). If <code>poll/select/epoll_wait</code> times dominate → that\'s mostly <em>waiting</em>, not work — fine.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick an operation. See whether it\'s a syscall, a library call, or vDSO — and roughly what it costs.</p>';
    var ops = [
      { op: 'strlen("hello")',         kind: 'pure userspace',  cost: '~5 ns', notes: 'No kernel involvement. Just memory reads.' },
      { op: 'sin(x)',                   kind: 'pure userspace',  cost: '~10 ns', notes: 'Math library — pure CPU.' },
      { op: 'malloc(64)',               kind: 'usually userspace', cost: '~20 ns (cached) to ~500 ns (syscall)', notes: 'Allocator usually has a free chunk; syscall only when growing the heap.' },
      { op: 'gettimeofday()',           kind: 'vDSO (userspace)', cost: '~10 ns', notes: 'Kernel publishes time in a shared page; libc reads it without crossing.' },
      { op: 'getpid()',                 kind: 'cached or syscall', cost: '~5 ns (cached) or ~200 ns (syscall)', notes: 'glibc caches the result.' },
      { op: 'open("/etc/hosts", O_RDONLY)', kind: 'syscall', cost: '~1 µs', notes: 'Path lookup + permission check + fd allocation.' },
      { op: 'read(fd, buf, 4096)',      kind: 'syscall',         cost: '~500 ns to ms', notes: 'Hits page cache: hundreds of ns. Misses (real disk): ms.' },
      { op: 'write(fd, buf, 4096) to TTY', kind: 'syscall',     cost: '~few µs', notes: 'Includes pushing chars to terminal.' },
      { op: 'fork()',                   kind: 'syscall',         cost: '~50–500 µs', notes: 'Set up new task_struct, page tables (COW), fd table.' },
      { op: 'send() / recv() on socket', kind: 'syscall',        cost: '~1 µs (loopback) to ms (real network)', notes: 'Kernel networking stack involvement.' },
      { op: 'futex_wait (mutex contention)', kind: 'syscall',    cost: '~µs to indefinite', notes: 'Kernel sleeps the thread; only contested locks are slow.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click an operation</span>';
    ops.forEach(function (o) {
      var b = document.createElement('button'); b.className = 'chip';
      b.style.maxWidth = '300px'; b.style.whiteSpace = 'normal'; b.style.textAlign = 'left';
      b.textContent = o.op;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + o.op + '</strong></div>' +
          '<div class="info-line"><span class="key">Kind:</span> <span class="val">' + o.kind + '</span></div>' +
          '<div class="info-line"><span class="key">Cost:</span> <span class="val">' + o.cost + '</span></div>' +
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + o.notes + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You run <code>strace -c ./program</code> and see <code>read</code> with 50,000 calls totaling 5 seconds. What\'s the most actionable optimization?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Buy faster disk</option>' +
          '<option>Use a bigger buffer (read fewer, larger chunks) — drop syscall count</option>' +
          '<option>Switch programming language</option>' +
          '<option>Disable strace</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Use a bigger buffer') === 0) return { correct: true, feedback: 'Right. 50,000 reads × 100 µs each = 5 sec — that\'s mostly per-call overhead, not actual data work. Buffering reduces both syscall count and cumulative overhead. (Fastest baseline: 1 read of 64 KB per ~64 KB of data.)' };
        return { correct: false, feedback: 'Look at the call count. 50K reads is way too many. Bigger buffer = fewer reads.' };
      },
      hints: [
        'High call count + significant total time = per-call overhead is dominating.',
        'Bigger buffer → fewer reads.',
        'Bigger buffer.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Why is <code>gettimeofday()</code> so much faster than most syscalls — fast enough to call millions of times per second?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>It\'s implemented via the vDSO — a kernel-published page mapped into every process. The C library reads time data directly from that page without crossing into the kernel.</option>' +
          '<option>Modern CPUs special-case time syscalls in hardware</option>' +
          '<option>Linux runs gettimeofday in ring 0 from userspace</option>' +
          '<option>It\'s cached, with a 1-second TTL</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('It\'s implemented via the vDSO') === 0) return { correct: true, feedback: 'Right. The vDSO ("virtual dynamic shared object") is mapped into every process at exec time. The kernel maintains a shared page with current time + scaling factors; the vDSO function reads + computes in pure userspace. ~10 ns vs ~500 ns for a real syscall. Same trick for <code>clock_gettime</code> and <code>getcpu</code>.' };
        return { correct: false, feedback: 'It\'s the vDSO — userspace code mapped by the kernel that reads time directly from a shared page. No syscall.' };
      },
      hints: [
        'The kernel publishes time data somewhere userspace can read.',
        'A special "shared object" the kernel maps into every process.',
        'vDSO.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A web server handles 50,000 connections per second. Each connection: accept(), read request, open file, sendfile() to socket, close. With a thread-per-request model the system saturates at ~30 K req/s and shows ~80% CPU in syscalls. Switching to <code>io_uring</code> doubles throughput. Why does io_uring help structurally?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>io_uring is faster because it\'s asynchronous</option>' +
          '<option>io_uring uses a pair of shared ring buffers (submission + completion). Userspace puts many ops in the submission ring; the kernel processes them in order; userspace reads results from the completion ring. ONE syscall (or zero, in polling mode) per BATCH of operations instead of one per op. Fewer kernel/user crossings → less per-op overhead → ~2× throughput on syscall-heavy workloads.</option>' +
          '<option>io_uring runs in kernel mode</option>' +
          '<option>io_uring uses a different scheduler</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('io_uring uses a pair of shared ring buffers') === 0) return { correct: true, feedback: 'Right. io_uring (Linux 5.1+, 2019) introduces shared-memory ring buffers between user and kernel. Userspace appends submission queue entries (SQEs); kernel processes them; appends completions. The boundary crossing happens once per batch (or zero, with kernel polling). At 50K req/s × 5 syscalls/req = 250K syscalls/sec → 25K syscalls/sec batched. The KPTI overhead alone (~100 ns × 250K = 25 ms/sec) is reclaimed. Used by major libraries — Tokio, Glommio — and high-perf databases.' };
        if (v === 'io_uring is faster because it\'s asynchronous') return { correct: false, feedback: 'epoll is also asynchronous. The structural difference is the SHARED RING and BATCHING — fewer boundary crossings.' };
        return { correct: false, feedback: 'Re-read the lesson on io_uring.' };
      },
      hints: [
        'What\'s the cost we\'re trying to reduce? Per-syscall boundary crossings.',
        'io_uring batches operations via shared ring buffers.',
        'Fewer kernel/user crossings; one syscall per BATCH.'
      ]
    }
  ]
});
