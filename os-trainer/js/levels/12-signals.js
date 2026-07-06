// Level 12 — Signals
OST.registerLevel({
  id: 12,
  title: 'Signals',
  whyItMatters: 'Signals are the asynchronous wrench in your control flow. They can interrupt almost any instruction. Knowing which are catchable, what async-safe means, and how shells and daemons handle them turns "Ctrl-C made my program corrupt its file" into "ah, of course."',
  glossary: ['signal', 'SIGTERM', 'SIGKILL', 'SIGCHLD'],
  learn: ''
    + '<h4>What a signal is</h4>'
    + '<p>A signal is a tiny asynchronous notification: a number (1–31 standard, 32+ realtime) sent to a process. The receiving process either:</p>'
    + '<ul>'
    +   '<li>Runs the default action (terminate, ignore, stop, etc.).</li>'
    +   '<li>Has installed a handler that runs.</li>'
    +   '<li>Has the signal blocked (queued for later).</li>'
    + '</ul>'
    + '<p>Signals carry almost no data — just the number. (<code>sigaction</code> + <code>SA_SIGINFO</code> can deliver some context.) For richer messaging, use IPC mechanisms (level 13).</p>'

    + '<h4>The canonical signals</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Signal</th><th>Default</th><th>Catchable</th><th>Use</th></tr>'
    + '<tr><td>SIGHUP (1)</td><td>terminate</td><td>yes</td><td>Hangup. Daemons usually catch to reload config.</td></tr>'
    + '<tr><td>SIGINT (2)</td><td>terminate</td><td>yes</td><td>Ctrl-C. Most CLI programs catch to exit cleanly.</td></tr>'
    + '<tr><td>SIGQUIT (3)</td><td>core+terminate</td><td>yes</td><td>Ctrl-\\. Like SIGINT but with core dump.</td></tr>'
    + '<tr><td>SIGKILL (9)</td><td>terminate</td><td class="bad">NO</td><td>Cannot be caught, blocked, or ignored. Last resort. <code>kill -9</code>.</td></tr>'
    + '<tr><td>SIGSEGV (11)</td><td>core+terminate</td><td>yes (rarely useful to catch)</td><td>Invalid memory access.</td></tr>'
    + '<tr><td>SIGPIPE (13)</td><td>terminate</td><td>yes</td><td>Wrote to a pipe with no reader. <em>This is why <code>command | head</code> makes <code>command</code> exit early.</em></td></tr>'
    + '<tr><td>SIGTERM (15)</td><td>terminate</td><td>yes</td><td>Polite termination request. Default for <code>kill</code>.</td></tr>'
    + '<tr><td>SIGCHLD (17)</td><td>ignore</td><td>yes</td><td>Child changed state. Parent typically catches to <code>wait()</code> + avoid zombies.</td></tr>'
    + '<tr><td>SIGSTOP (19)</td><td>stop</td><td class="bad">NO</td><td>Suspend. Can\'t be caught.</td></tr>'
    + '<tr><td>SIGCONT (18)</td><td>continue</td><td>yes</td><td>Resume a stopped process.</td></tr>'
    + '<tr><td>SIGUSR1, SIGUSR2</td><td>terminate</td><td>yes</td><td>Reserved for app use. Often used as "reload config without restart."</td></tr>'
    + '</table>'

    + '<h4>How they\'re delivered</h4>'
    + '<p>The kernel sets a "pending" bit when a signal is sent. On the next return from kernel mode (after a syscall or interrupt), the kernel checks if any signals are pending and not blocked. If so:</p>'
    + '<ul>'
    +   '<li>If a handler is registered, the kernel sets up the user stack to run the handler before resuming the interrupted code.</li>'
    +   '<li>If using the default action, do that action (terminate, ignore, etc.).</li>'
    + '</ul>'
    + '<p>Implication: a signal is delivered when control NEXT returns to userspace. A tight CPU loop with no syscalls can run without checking for signals for a while (until a timer interrupt fires).</p>'

    + '<h4>Async-signal-safe functions</h4>'
    + '<p>A signal handler can interrupt your code at almost any instruction — including in the middle of <code>malloc()</code>, <code>printf()</code>, <code>fopen()</code>. If your handler then calls those same functions, you can corrupt internal state (re-entrant lock, free list mid-update).</p>'
    + '<p>Only <strong>async-signal-safe</strong> functions are safe to call from a handler. POSIX has a list — about 50 functions. Notably:</p>'
    + '<ul>'
    +   '<li>SAFE: <code>write</code>, <code>read</code>, <code>_exit</code>, <code>kill</code>, <code>signal</code>, <code>sigaction</code>, <code>raise</code>, <code>open</code>, <code>close</code>, atomics.</li>'
    +   '<li>NOT SAFE: <code>printf</code>, <code>malloc</code>, <code>free</code>, <code>fopen</code>, anything that takes a lock, anything that uses errno without saving/restoring it.</li>'
    + '</ul>'
    + '<p>Common pattern: handler sets a <code>volatile sig_atomic_t flag = 1;</code> and the main loop checks the flag. The handler does almost nothing.</p>'

    + '<h4>Graceful shutdown — the SIGTERM idiom</h4>'
    + '<div class="terminal">'
    + 'volatile sig_atomic_t shutting_down = 0;\n'
    + '\n'
    + 'void on_sigterm(int s) { shutting_down = 1; }\n'
    + '\n'
    + 'sigaction(SIGTERM, ...);  <span class="out">// install handler</span>\n'
    + '\n'
    + 'while (!shutting_down) {\n'
    + '    accept_request();\n'
    + '    process();\n'
    + '}\n'
    + '<span class="hi">flush_state();</span>\n'
    + '<span class="hi">close_logs();</span>\n'
    + 'exit(0);'
    + '</div>'
    + '<p>SIGTERM gives the program time to finish cleanly. Container orchestrators (Kubernetes, Docker, systemd) send SIGTERM first, then SIGKILL after a grace period (default 30 sec on K8s).</p>'

    + '<h4>SIGKILL is special</h4>'
    + '<p>The kernel itself terminates the process. The process never runs again to "handle" anything. Used for runaway processes that won\'t respond to TERM. Note: it doesn\'t tear down DEEP kernel state instantly — a process in uninterruptible sleep (D state, often disk I/O) might not die until the I/O returns.</p>'

    + '<h4>SIGPIPE — the silent killer</h4>'
    + '<p>Default action is terminate. Anytime your program writes to a closed pipe/socket, it gets SIGPIPE and dies — possibly mid-output, no error returned. Servers that handle disconnected clients <strong>must</strong> ignore SIGPIPE (or block it) and check write() return for EPIPE instead. <code>signal(SIGPIPE, SIG_IGN);</code> at startup is standard server boilerplate.</p>'

    + '<h4>PID 1 in containers</h4>'
    + '<p>Containers usually have one process (your app) running as PID 1. PID 1 has special signal semantics: <strong>SIGTERM and SIGINT are ignored by default</strong> (init shouldn\'t accidentally kill itself). If your app doesn\'t install handlers, it won\'t shut down on TERM. Hence the rise of "tini" / "dumb-init" — tiny init wrappers that forward signals.</p>'

    + '<h4>Real-time signals (SIGRTMIN..SIGRTMAX)</h4>'
    + '<p>Standard signals are not queued — multiple instances of the same signal coalesce. Real-time signals (32–63) ARE queued and carry an integer payload. Mostly used by libraries (glibc uses some internally).</p>'

    + '<div class="callout"><div class="label">"My program crashed; how do I tell if it was a signal?"</div>'
    + 'In bash: <code>$? &gt; 128</code> indicates death by signal; signal number = <code>$? - 128</code>. So 137 = killed by signal 9 (SIGKILL — likely OOM killer). 143 = signal 15 (SIGTERM). 139 = signal 11 (SIGSEGV). <code>dmesg | tail</code> for OOM logs.'
    + '</div>',

  mountPlay: function (container) {
    var os = OST.lib.os;
    container.innerHTML = '<p class="muted">Click each signal to see what it does and whether it\'s catchable.</p>';
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a signal</span>';
    Object.keys(os.SIGNALS).forEach(function (sig) {
      var s = os.SIGNALS[sig];
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = sig + ' (' + s.num + ')';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + sig + ' (' + s.num + ')</strong></div>' +
          '<div class="info-line"><span class="key">Default action:</span> <span class="val">' + s.default + '</span></div>' +
          '<div class="info-line"><span class="key">Catchable?</span> <span class="val" style="color:var(--' + (s.catchable ? 'good' : 'bad') + ')">' + (s.catchable ? 'YES' : 'NO') + '</span></div>' +
          '<div class="info-line"><span class="key">Description:</span> <span class="val">' + s.description + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A misbehaving process won\'t respond to <code>kill PID</code> (which sends SIGTERM). Which signal CANNOT be caught or ignored, guaranteeing termination?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>SIGINT (2)</option><option>SIGTERM (15)</option><option>SIGKILL (9)</option><option>SIGHUP (1)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'SIGKILL (9)') return { correct: true, feedback: 'Right. SIGKILL and SIGSTOP are the only two signals that CANNOT be caught, blocked, or ignored. <code>kill -9 PID</code>. Reserve it for processes that ignore SIGTERM — TERM gives them a chance to clean up.' };
        return { correct: false, feedback: 'SIGKILL (9) is the uncatchable one.' };
      },
      hints: [
        'Most signals can be caught. Two cannot.',
        'SIGKILL and SIGSTOP.',
        'kill -9.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Your container app receives a SIGTERM from Kubernetes during a deploy. The app is supposed to gracefully drain in-flight requests over 20 seconds. The app is written in Python and runs as PID 1. After 30 seconds, K8s SIGKILLs it without the graceful exit running. Why?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>K8s ignores SIGTERM</option>' +
          '<option>Python ignores all signals</option>' +
          '<option>PID 1 has special semantics: SIGTERM is ignored unless the program explicitly installs a handler. The Python app runs as PID 1 and has no handler → SIGTERM was a no-op. Fix: install signal handler in app, OR use tini/dumb-init as PID 1 to forward signals.</option>' +
          '<option>SIGTERM never propagates into containers</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('PID 1 has special semantics') === 0) return { correct: true, feedback: 'Right. PID 1 has special signal handling: SIGTERM/SIGINT are ignored by default. Most apps were never designed to be PID 1 (they assume an init exists above them). Solutions: (1) install the SIGTERM handler explicitly in your code (Python: <code>signal.signal(signal.SIGTERM, ...)</code>); (2) use a tiny init wrapper like <code>tini</code> or <code>dumb-init</code> as the container entrypoint, which becomes PID 1 and forwards signals to your app.' };
        return { correct: false, feedback: 'PID 1 has special handling: SIGTERM is ignored unless explicitly handled. The container running your app as PID 1 swallows SIGTERM by default.' };
      },
      hints: [
        'Containers run apps as PID 1. PID 1 has special signal semantics.',
        'SIGTERM/SIGINT are ignored by default at PID 1.',
        'Either install a signal handler or use tini/dumb-init.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A daemon installs a signal handler for SIGUSR1 that calls <code>printf("reloading config\\n");</code>, then reads + parses a config file. After a few months running stably, the daemon hangs after receiving SIGUSR1. What could cause this, and what\'s the structural fix?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>printf is not async-signal-safe. The signal interrupted the main thread mid-printf (or mid-malloc inside printf), and the handler\'s printf re-entered the same library state, deadlocking on an internal lock. Fix: handler should set a flag (volatile sig_atomic_t reload = 1), main loop checks the flag and does the actual config reload.</option>' +
          '<option>SIGUSR1 is broken in newer kernels</option>' +
          '<option>The config file got too big</option>' +
          '<option>printf was renamed in glibc 2.40</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('printf is not async-signal-safe') === 0) return { correct: true, feedback: 'Right. printf takes an internal lock for thread safety; if the signal interrupts main-thread printf, the handler\'s printf tries to acquire the same lock → deadlock. (Same applies to malloc, fopen, anything stateful.) The async-signal-safe pattern: handler sets a flag; main loop polls the flag and does the work in a normal context. Or use <code>signalfd()</code> to get signals as readable file descriptors and avoid handlers entirely. The "ran fine for months" part is realistic — the race is intermittent.' };
        return { correct: false, feedback: 'printf is not async-signal-safe. The handler can deadlock on stdio internal locks. Use a flag + main-loop pattern.' };
      },
      hints: [
        'What is printf doing internally that\'s NOT safe in a signal handler?',
        'Locks. printf is not async-signal-safe.',
        'Handler should set a flag; main loop polls and does the actual work.'
      ]
    }
  ]
});
