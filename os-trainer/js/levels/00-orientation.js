// Level 0 — Orientation
OST.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'The OS is the most-touched piece of code in your day. Every program you run, file you open, network packet you send goes through it. Knowing what abstractions it provides — and what costs they hide — is the difference between writing fast software and slow software.',
  glossary: ['OS', 'kernel', 'userspace', 'syscall', 'POSIX'],
  learn: ''
    + '<h4>What an OS does, in one sentence</h4>'
    + '<p>An operating system <strong>multiplexes hardware among programs and gives them safe abstractions to use</strong>. The hardware is one CPU (or several), one memory bus, one disk, one NIC. The OS makes each program think it has its own CPU, its own memory, its own files, its own network — and arbitrates so they don\'t step on each other.</p>'

    + '<h4>The four big abstractions</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Abstraction</th><th>Hides</th><th>Used via</th></tr>'
    + '<tr><td><strong>Process</strong></td><td>"This program has the CPU to itself"</td><td>fork, exec, exit</td></tr>'
    + '<tr><td><strong>Virtual memory</strong></td><td>"This program has 256 TB of contiguous RAM to itself"</td><td>mmap, malloc; transparent</td></tr>'
    + '<tr><td><strong>File</strong></td><td>"Persistent named bag of bytes"</td><td>open, read, write, close</td></tr>'
    + '<tr><td><strong>Socket</strong></td><td>"Point-to-point byte stream over the network"</td><td>socket, connect, send, recv</td></tr>'
    + '</table>'

    + '<h4>Two privilege levels: user and kernel</h4>'
    + '<p>x86 calls them rings (0 = kernel, 3 = user; rings 1 and 2 are unused). ARM has EL0 (user) and EL1 (kernel). The CPU enforces the boundary in hardware — userspace code that tries to execute privileged instructions or touch kernel memory faults.</p>'
    + '<p>To do anything that requires kernel privilege (open a file, send a packet, allocate memory, read the time), userspace makes a <strong>syscall</strong>. On x86_64 Linux, that\'s the <code>syscall</code> instruction with the syscall number in <code>rax</code> and arguments in <code>rdi, rsi, rdx, r10, r8, r9</code>.</p>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> strace -e write echo hi\n'
    + '<span class="out">write(1, "hi\\n", 3)                       = 3</span>\n'
    + 'hi\n'
    + '+++ exited with 0 +++'
    + '</div>'
    + '<p><code>strace</code> intercepts and prints every syscall a process makes. The <code>write(1, ...)</code> tells the kernel "write 3 bytes from this buffer to file descriptor 1" (stdout, hooked to your terminal).</p>'

    + '<h4>The syscall cost</h4>'
    + '<p>A syscall is much more expensive than a function call:</p>'
    + '<ul>'
    +   '<li>Function call: a few cycles (push args, call, ret).</li>'
    +   '<li>Syscall: ~100–500 ns on modern hardware. Saves user state, switches privilege, restores after.</li>'
    +   '<li>Spectre/Meltdown mitigations (KPTI) added another ~100 ns to syscalls in 2018.</li>'
    + '</ul>'
    + '<p>This is why "batch your syscalls" is a real perf principle: <code>read()</code> ten thousand times in a loop is 10× slower than reading one big buffer once.</p>'

    + '<h4>Linux, macOS, Windows in three sentences</h4>'
    + '<ul>'
    +   '<li><strong>Linux</strong> is a monolithic open-source kernel. POSIX-compliant. Powers most servers, Android, embedded systems. <em>This trainer\'s focus.</em></li>'
    +   '<li><strong>macOS</strong> is XNU (Mach microkernel-ish + BSD layer). Mostly POSIX-compliant; ships with the GNU userspace replaced by BSD versions.</li>'
    +   '<li><strong>Windows NT</strong> is a hybrid kernel. Different syscall surface (Win32 API), object-handle model instead of file-descriptor numbers. WSL provides Linux-like POSIX.</li>'
    + '</ul>'
    + '<p>This trainer is Linux-focused. The user runs Kali (Linux) plus Linux servers; the abstractions transfer. Where Windows differs significantly we\'ll note it.</p>'

    + '<h4>"Everything is a file"</h4>'
    + '<p>Unix\'s big idea. Almost everything you can read or write — files on disk, terminals, network sockets, devices, pipes — is accessed through <code>read()</code> and <code>write()</code> on file descriptors. This means the same code can read from a file, the keyboard, or a network socket. <code>cat &lt; file.txt | grep foo &gt; out.txt</code> works because everything is a file.</p>'
    + '<p>(Modern realities: sockets, signals, timers, etc. have specialized syscalls — but the file-descriptor abstraction still unifies them.)</p>'

    + '<h4>What you\'ll learn (level by level)</h4>'
    + '<ul>'
    +   '<li>L1–L2: how processes and threads work; what fork/exec/wait do; the process tree.</li>'
    +   '<li>L3–L4: how the scheduler picks who runs; why context switches are slow.</li>'
    +   '<li>L5–L7: the virtual-memory machinery — paging, TLB, page faults, malloc.</li>'
    +   '<li>L8: file systems, inodes, links, descriptors.</li>'
    +   '<li>L9: the syscall boundary in detail.</li>'
    +   '<li>L10–L11: synchronization primitives and deadlock.</li>'
    +   '<li>L12: signals and how they tear into your control flow.</li>'
    +   '<li>L13: IPC — pipes, sockets, shared memory.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">A useful mental model</div>'
    + 'When you don\'t know why some code is slow, ask: "how many syscalls is this making?" — then "<code>strace -c ./program</code>" to count and time them. The answer is often 100× more than necessary, and the fix is "use a bigger buffer" or "use mmap instead."'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click each abstraction to see what hardware reality it hides — and what it costs.</p>';
    var items = [
      { name: 'Process',         hides: 'Single CPU shared by hundreds of processes',     cost: 'Context switch ~1–10 µs + cache pollution. Process creation (fork+exec) ~100 µs–1 ms.' },
      { name: 'Virtual memory',  hides: 'Limited RAM, must coexist with other processes', cost: 'TLB miss ~10–100 ns. Page fault (minor) ~µs. Major page fault (swap) ~ms.' },
      { name: 'File',            hides: 'Disk blocks, file system layout, on-disk format', cost: 'Each read/write is a syscall (~100–500 ns) plus actual I/O (NVMe ~10 µs, HDD ~5 ms).' },
      { name: 'Socket',          hides: 'Network stack, packets, retransmits, congestion', cost: 'Local syscall + kernel networking (~µs). Remote: tens of µs to many ms depending on path.' },
      { name: 'Thread',          hides: 'Multiple cores, each with its own register file', cost: 'Cheap to create (~10 µs). Synchronization (locks, atomics) is the real cost.' },
      { name: 'Pipe',            hides: 'Two processes coordinating without a network',    cost: '~hundreds of ns per write/read. Limited buffer (~64KB) before blocking.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click an abstraction</span>';
    items.forEach(function (it) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = it.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + it.name + '</strong></div>' +
          '<div class="info-line"><span class="key">What it hides:</span> <span class="val">' + it.hides + '</span></div>' +
          '<div class="info-line"><span class="key">Hidden cost:</span> <span class="val">' + it.cost + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which of these typically requires a system call (a transition from userspace to the kernel)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Adding two numbers</option>' +
          '<option>Calling a function in your own program</option>' +
          '<option>Calling printf("hello")</option>' +
          '<option>Calculating sin(x)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Calling printf("hello")') return { correct: true, feedback: 'Right. printf eventually calls write(1, ...), which is a syscall — bytes have to leave userspace and go to the terminal\'s file descriptor. Pure arithmetic and intra-process function calls stay entirely in userspace. (printf may also buffer internally, batching multiple printfs into one write — that\'s why output sometimes only shows up at flush.)' };
        return { correct: false, feedback: 'A syscall happens when userspace asks the kernel to do something — I/O, memory mapping, networking. Pure computation does not.' };
      },
      hints: [
        'Which option requires the kernel to do something? (I/O, memory, etc.)',
        'printf eventually writes to the terminal. That\'s I/O.',
        'printf.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A program reads a 10 MB file by calling <code>read(fd, buf, 1)</code> in a loop (one byte at a time). It takes ~5 seconds. Switching to <code>read(fd, buf, 64*1024)</code> drops it to ~50 ms. Why such a huge difference?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>The disk is 100× faster with bigger reads</option>' +
          '<option>10 million syscalls × ~500 ns each ≈ 5 seconds. Bigger buffer → ~150 syscalls instead, dropping the per-call overhead from "the entire bottleneck" to "essentially zero." The actual disk I/O was tiny in both cases (the file is in page cache).</option>' +
          '<option>Larger reads use a different DMA mode</option>' +
          '<option>The kernel pre-fetches more aggressively with bigger reads</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('10 million syscalls') === 0) return { correct: true, feedback: 'Right. The dominant cost was per-syscall overhead (~500 ns × 10M ≈ 5 s). With a 64 KB buffer, you make about 150 syscalls — the per-call overhead becomes negligible. The actual disk I/O was already cheap (file likely in page cache the second time). This is the textbook "use bigger buffers" lesson and why <code>fread</code>/stdio buffers transparently.' };
        return { correct: false, feedback: 'It\'s not about disk speed (the file is likely in page cache anyway). It\'s the syscall count: 10M × ~500 ns = 5 s of just-syscall overhead.' };
      },
      hints: [
        'How many syscalls does the byte-at-a-time loop make? About how long does each syscall take?',
        '10 million syscalls × ~500 ns = ~5 seconds — matches the observed time.',
        'Syscall overhead. Bigger buffers → fewer crossings.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A web server processes 100,000 short HTTP requests per second on one machine. Each request currently makes ~50 syscalls (accept, read, parse, open file, read file, write socket, close, etc). Profiling shows that ~30% of CPU time is in kernel mode (syscall overhead and the in-kernel work the syscalls do). Which technique is MOST LIKELY to reduce syscall overhead while keeping correctness?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Switch to a "thread-per-request" model — one syscall per thread</option>' +
          '<option>Use sendfile() / io_uring / epoll batching to reduce per-request syscall count and amortize boundary crossings</option>' +
          '<option>Disable CPU mitigations (Spectre, KPTI) for performance</option>' +
          '<option>Buy a faster CPU</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Use sendfile() / io_uring / epoll batching') === 0) return { correct: true, feedback: 'Right. These are the canonical syscall-reduction techniques: <code>sendfile()</code> replaces "read from file → write to socket" (2 syscalls + a userspace copy) with one syscall; <code>io_uring</code> (Linux 5.1+) submits batches of I/O ops via a shared ring buffer with the kernel — many ops, ~1 syscall; <code>epoll</code> with edge-triggered I/O lets one thread handle thousands of connections. Nginx uses sendfile + epoll; modern high-perf servers (Cloudflare, etc.) use io_uring. Disabling CPU mitigations gives you ~5–10% but exposes you to Spectre — generally a bad trade.' };
        if (v === 'Switch to a "thread-per-request" model — one syscall per thread') return { correct: false, feedback: 'Threads don\'t reduce syscall counts; each thread still makes the same syscalls. Plus thread-per-request hits ~10K-thread scaling problems.' };
        if (v === 'Disable CPU mitigations (Spectre, KPTI) for performance') return { correct: false, feedback: 'You\'d gain ~5–10% on syscall-heavy workloads but expose to known attacks. Bad security/perf trade.' };
        if (v === 'Buy a faster CPU') return { correct: false, feedback: 'Doesn\'t change the syscall count or per-call cost meaningfully. Software fix is much higher leverage.' };
        return { correct: false, feedback: 'Pick the option that reduces syscalls per request.' };
      },
      hints: [
        'You want fewer kernel boundary crossings, not faster ones.',
        'sendfile, io_uring, epoll all batch / collapse syscalls.',
        'sendfile / io_uring / epoll batching.'
      ]
    }
  ]
});
