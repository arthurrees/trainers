// Level 13 — IPC
OST.registerLevel({
  id: 13,
  title: 'Inter-Process Communication',
  whyItMatters: 'Two processes need to exchange data. Pipes, sockets, shared memory, message queues each fit different shapes. Picking the right one matters for performance and for keeping the architecture simple.',
  glossary: ['IPC', 'pipe', 'shm', 'fd'],
  learn: ''
    + '<h4>The IPC menu</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Mechanism</th><th>Topology</th><th>Throughput</th><th>Best for</th></tr>'
    + '<tr><td>Pipe (anonymous)</td><td>parent ↔ child only</td><td>~GB/s</td><td>Shell pipelines: <code>ls | grep | sort</code></td></tr>'
    + '<tr><td>FIFO (named pipe)</td><td>any processes via filesystem name</td><td>~GB/s</td><td>One-off coordination; logs.</td></tr>'
    + '<tr><td>Unix domain socket</td><td>any processes; bidirectional</td><td>~GB/s</td><td>Local services (Docker, X11, dbus).</td></tr>'
    + '<tr><td>TCP socket</td><td>any processes, any host</td><td>~10 GB/s loopback, network-bound otherwise</td><td>Cross-host services.</td></tr>'
    + '<tr><td>Shared memory (shm/mmap)</td><td>any processes that map the same region</td><td>RAM speed (~tens of GB/s)</td><td>Big buffers, low-latency pipelines.</td></tr>'
    + '<tr><td>Message queues (POSIX/SysV)</td><td>any processes by name/key</td><td>~MB/s</td><td>Less common today; supplanted by sockets.</td></tr>'
    + '<tr><td>Signals</td><td>process → process</td><td>1 number per signal</td><td>"Reload config" / control-plane events.</td></tr>'
    + '<tr><td>Files</td><td>any</td><td>filesystem-bound</td><td>Persistence + IPC; not for tight loops.</td></tr>'
    + '</table>'

    + '<h4>Pipes</h4>'
    + '<p>The kernel maintains a circular buffer (default 64 KB on Linux). Writers <code>write()</code>, readers <code>read()</code>. EOF when all writers close.</p>'
    + '<ul>'
    +   '<li>Pipe is full → writers block (or get EAGAIN with non-blocking flag).</li>'
    +   '<li>Pipe is empty + at least one writer open → readers block.</li>'
    +   '<li>All writers closed → readers get EOF (read returns 0).</li>'
    +   '<li>All readers closed → writers get SIGPIPE (default action: terminate).</li>'
    + '</ul>'
    + '<p>This is exactly how shell pipelines work. <code>cat huge.txt | head -1</code> — head reads one line, exits, closes its read end. cat\'s next write gets SIGPIPE; cat exits. (Not an error — the design is intentional: tools self-terminate when their consumer is done.)</p>'

    + '<h4>Unix domain sockets</h4>'
    + '<p>Like TCP sockets but local-only, addressed by filesystem path (<code>/var/run/docker.sock</code>) or abstract namespace. Stream or datagram. Pass file descriptors between processes (<code>SCM_RIGHTS</code>) — used by privilege-separated services.</p>'
    + '<p>Faster than TCP loopback (no protocol overhead, no checksum), simpler permission model (filesystem perms on the socket file).</p>'

    + '<h4>Shared memory</h4>'
    + '<p>The fastest IPC: two processes <code>mmap()</code> the same physical region. Reads/writes are direct memory accesses — no syscall, no copy. Used for:</p>'
    + '<ul>'
    +   '<li>Database engines (Postgres shared buffers).</li>'
    +   '<li>X11 (window pixels in shared memory).</li>'
    +   '<li>Producer/consumer ring buffers (LMAX Disruptor pattern).</li>'
    +   '<li>io_uring (kernel ↔ user shared rings).</li>'
    + '</ul>'
    + '<p>Cost: <strong>you must do your own synchronization</strong>. Atomics, futexes, or shared mutexes. Easy to get wrong; consider using a library (Boost.Interprocess, etc.).</p>'

    + '<h4>"Use a queue, not shared memory"</h4>'
    + '<p>Erlang/Go-style philosophy: <strong>"don\'t communicate by sharing memory; share memory by communicating."</strong> Pass messages through channels/queues; the queue handles synchronization. Fewer races, easier to reason about.</p>'
    + '<p>Performance trade-off: message passing has higher per-op overhead but eliminates whole bug classes.</p>'

    + '<h4>Choosing IPC</h4>'
    + '<p>A working decision tree:</p>'
    + '<ol>'
    +   '<li>Single host, parent/child only? → <strong>anonymous pipe</strong>.</li>'
    +   '<li>Single host, low to moderate throughput, request/reply? → <strong>Unix domain socket</strong>.</li>'
    +   '<li>Cross-host? → <strong>TCP socket</strong> (gRPC, HTTP, raw protocol).</li>'
    +   '<li>Single host, very high throughput, one-direction stream? → <strong>shared memory ring buffer</strong>.</li>'
    +   '<li>"Just send a small notification"? → <strong>signal</strong> (or eventfd).</li>'
    +   '<li>Persistence required? → <strong>file</strong> (or message queue with disk backing).</li>'
    + '</ol>'

    + '<h4>The eventfd / signalfd / timerfd trio</h4>'
    + '<p>Linux extensions making things-that-aren\'t-files into file descriptors. Lets <code>epoll()</code> wait on signals, timers, semaphore-like counters uniformly with sockets and pipes. Cleaner than mixed signal handlers + poll loops.</p>'

    + '<h4>What about "shared memory across machines"?</h4>'
    + '<p>You can\'t literally share RAM across machines. RDMA gives you remote memory access at the hardware level — used in HPC, some databases. NFS / shared filesystems are persistent shared "memory." Distributed shared memory abstractions exist but tend to be replaced by message-passing / RPC for engineering reasons.</p>'

    + '<div class="callout"><div class="label">A useful mental model</div>'
    + 'Pipes = "byte stream, FIFO, one direction." Sockets = "addressable byte-stream-or-message endpoints." Shared memory = "two processes sharing a chunk of RAM." Pick the simplest that fits — start with sockets unless you have a measured reason to go to shared memory.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Match a use case to the recommended IPC mechanism.</p>';
    var scenarios = [
      { name: 'shell pipeline: ls | grep foo',                      pick: 'Pipe', why: 'Anonymous pipe between parent-and-child processes, byte-stream.' },
      { name: 'two processes share a 100 MB ring buffer at 10 GB/s', pick: 'Shared memory', why: 'Direct memory access; no copy; user-space synchronization needed.' },
      { name: 'docker CLI talking to dockerd locally',                pick: 'Unix domain socket', why: '/var/run/docker.sock — local request/reply with FS permissions for access control.' },
      { name: 'web app calling another microservice on a different host', pick: 'TCP socket (gRPC/HTTP)', why: 'Cross-host needs a real network protocol.' },
      { name: 'daemon needs "reload config" from operator',           pick: 'Signal (SIGHUP / SIGUSR1)', why: 'Tiny notification; standard convention.' },
      { name: 'Python parent process spawns 8 workers and feeds tasks', pick: 'Pipe / multiprocessing.Queue', why: 'multiprocessing.Queue is a pipe-backed FIFO under the hood.' },
      { name: 'Postgres caches table pages across worker processes',  pick: 'Shared memory', why: 'Postgres "shared buffers" — multi-GB shared region; lock-protected.' },
      { name: 'distributed system needing strong ordering + persistence', pick: 'Message queue (Kafka, RabbitMQ)', why: 'Specialized middleware; raw IPC primitives don\'t cover replication/persistence.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a scenario</span>';
    scenarios.forEach(function (s) {
      var b = document.createElement('button'); b.className='chip';
      b.style.maxWidth='280px'; b.style.whiteSpace='normal'; b.style.textAlign='left';
      b.textContent = s.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + s.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Pick:</span> <span class="val">' + s.pick + '</span></div>' +
          '<div class="info-line"><span class="key">Why:</span> <span class="val">' + s.why + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You\'re writing a producer/consumer between a parent and child process you fork. They\'ll exchange a continuous byte stream. Lowest-friction IPC?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Anonymous pipe via pipe(); pass the fd across fork()</option>' +
          '<option>Shared memory + custom synchronization</option>' +
          '<option>TCP socket on localhost</option>' +
          '<option>Files</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Anonymous pipe') === 0) return { correct: true, feedback: 'Right. Anonymous pipe is exactly designed for this case. <code>pipe()</code> returns a (read fd, write fd); after fork, both processes have copies — close the unused end in each. Plenty fast (~GB/s), no setup, kernel handles synchronization.' };
        return { correct: false, feedback: 'Pipe. It\'s the textbook fit for parent-child byte stream.' };
      },
      hints: [
        'Parent + child + byte stream: textbook case.',
        'pipe() before fork(); close unused end in each.',
        'Anonymous pipe.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A C app does <code>cmd | head -1</code>. cmd produces gigabytes of data; head reads the first line and exits. What happens to cmd, and is it an error?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>cmd hangs forever waiting for head</option>' +
          '<option>cmd gets SIGPIPE on its next write (head closed the read end), default action terminates cmd. Not an error — this is by design and is how shell pipelines self-clean. Tools should handle SIGPIPE gracefully.</option>' +
          '<option>cmd succeeds but data is silently corrupted</option>' +
          '<option>head waits for cmd to finish</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('cmd gets SIGPIPE on its next write') === 0) return { correct: true, feedback: 'Right. SIGPIPE is the design: when there\'s no reader, writers self-terminate to avoid wasting work. This is why <code>cat huge.log | head</code> takes a fraction of a second instead of reading the whole file. Some tools (Python in particular) print a noisy "Broken pipe" if their handler doesn\'t catch it — well-behaved Unix tools handle SIGPIPE silently or with a non-zero exit.' };
        return { correct: false, feedback: 'cmd gets SIGPIPE because the read end closed. Default: terminate. Intentional design.' };
      },
      hints: [
        'What signal does writing to a closed pipe generate?',
        'SIGPIPE. Default: terminate.',
        'Intentional shell-pipeline design.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A high-throughput trading system needs two processes to exchange ~10 GB/s of market data updates. They\'re on the same host. The team currently uses a TCP loopback socket and is CPU-bottlenecked on kernel networking. List the IPC alternatives that could give the biggest improvement (mark TRUE for ones that\'d help materially).',
      mountInput: function (c) {
        var items = [
          { label: 'Unix domain socket — same loopback bandwidth without TCP/IP processing overhead',                            t: true },
          { label: 'Shared-memory ring buffer with a careful userspace synchronization protocol — orders-of-magnitude lower CPU per byte', t: true },
          { label: 'eventfd / shared-memory hybrid: shm carries data, eventfd notifies the consumer (avoids polling)',           t: true },
          { label: 'A message queue (RabbitMQ / Kafka) — adds reliability',                                                       t: false },
          { label: 'A larger socket buffer',                                                                                       t: false },
          { label: 'Run on faster CPUs',                                                                                           t: false }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. Unix domain sockets cut the TCP/IP overhead while keeping a familiar API — easy first step. Shared memory gets you to RAM-bandwidth limits but requires careful synchronization. eventfd/shm hybrid combines them: data via shm (fast); notification via eventfd (epollable). Message queues ADD overhead — wrong direction. Bigger socket buffers reduce switching, marginal gain. Faster CPUs help but don\'t change the architecture limit.' };
        return { correct: false, feedback: 'For 10 GB/s on one host: drop TCP/IP overhead (Unix socket), or drop the kernel entirely (shm). Message queues add latency, not the goal here.' };
      },
      hints: [
        'TCP overhead is the bottleneck. What removes that overhead while staying simple? What removes it entirely?',
        'Unix domain socket (less overhead). Shared memory (no kernel boundary).',
        'Both, plus eventfd/shm hybrid for notifications.'
      ]
    }
  ]
});
