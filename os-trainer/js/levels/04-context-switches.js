// Level 4 — Context switches
OST.registerLevel({
  id: 4,
  title: 'Context Switches',
  whyItMatters: 'A context switch is one of the few operations that\'s genuinely expensive at the hardware level. Knowing what gets saved and why it\'s slow explains why "thread per request" stops scaling, why interrupt-heavy workloads suffer, and why CPU pinning sometimes wins.',
  glossary: ['context switch', 'preemption', 'kernel', 'syscall'],
  learn: ''
    + '<h4>What "context" means</h4>'
    + '<p>The "context" of a running task is the CPU state needed to resume it later as if nothing happened. To switch tasks, the kernel must save the current task\'s state and load the next task\'s state.</p>'
    + '<p>Direct hardware state to save:</p>'
    + '<ul>'
    +   '<li><strong>General-purpose registers</strong> (RAX..R15 on x86_64): 16 × 8 bytes.</li>'
    +   '<li><strong>Program counter (RIP)</strong> + flags (RFLAGS).</li>'
    +   '<li><strong>Stack pointer (RSP)</strong>.</li>'
    +   '<li><strong>Floating-point and SIMD state</strong>: ~512 bytes (or more with AVX-512).</li>'
    +   '<li><strong>Segment registers</strong> (FS/GS for TLS).</li>'
    + '</ul>'
    + '<p>Indirect state that "must be reset" but isn\'t literally written:</p>'
    + '<ul>'
    +   '<li><strong>Page table base</strong> (CR3 on x86) — different process means different page tables.</li>'
    +   '<li><strong>TLB entries</strong> — must be flushed (or selectively kept with PCIDs/ASIDs) when switching to a different address space. This invalidates caches built up by the previous task.</li>'
    + '</ul>'

    + '<h4>The hidden cost: cache and TLB pollution</h4>'
    + '<p>The literal save/load is fast (~1 µs). The expensive part is what comes after:</p>'
    + '<ul>'
    +   '<li>The new task starts running with no useful entries in L1/L2/L3 cache or TLB.</li>'
    +   '<li>Its first thousand memory accesses are cache misses (~10–100 ns each instead of ~1 ns).</li>'
    +   '<li>Total effective slowdown: tens to hundreds of µs of "warming up" before steady-state.</li>'
    + '</ul>'
    + '<p>This is why "high context-switch rate" is a real performance enemy even when the literal switch overhead seems small.</p>'

    + '<h4>Voluntary vs involuntary</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Trigger</th><th>How it happens</th></tr>'
    + '<tr><td><strong>Voluntary</strong> — task gives up CPU</td><td>Blocking syscall (read on empty pipe, sleep, mutex lock contention). Task is removed from run queue until ready.</td></tr>'
    + '<tr><td><strong>Involuntary</strong> — kernel forces switch</td><td>Timer interrupt fires; if scheduler decides another task should run, switch happens regardless of current task.</td></tr>'
    + '</table>'
    + '<p>Linux\'s timer tick frequency (HZ): typically 100–1000 Hz on servers, 250 on desktops. "Tickless" kernels (NO_HZ) skip the tick when only one task is runnable on a CPU.</p>'

    + '<h4>The same-process exception</h4>'
    + '<p>Switching between two threads in the SAME process is much cheaper than switching between processes:</p>'
    + '<ul>'
    +   '<li>Address space (CR3) doesn\'t change → TLB stays valid.</li>'
    +   '<li>Cache references for shared data may still be hot.</li>'
    + '</ul>'
    + '<p>This is one reason "many threads, one process" can be faster than "many processes" for shared workloads — even ignoring the explicit shared memory.</p>'

    + '<h4>Process Context ID (PCID) / ASID</h4>'
    + '<p>Modern x86 CPUs support tagging TLB entries with a process ID. On a context switch the TLB doesn\'t get flushed; just the active PCID changes. When you switch back to the original process, its TLB entries are still there. Big win for switch-heavy workloads.</p>'
    + '<p>Linux uses PCIDs since ~2017. Combined with KPTI (Meltdown mitigation) the gains were less dramatic; without mitigations, ~20% throughput improvement on switch-heavy benchmarks.</p>'

    + '<h4>The KPTI overhead (Meltdown mitigation)</h4>'
    + '<p>After Meltdown (Jan 2018), Linux added Kernel Page-Table Isolation: separate page tables for kernel and userspace. Every syscall now switches CR3 (TLB flush) on entry and again on exit. Cost: ~5–30% on syscall-heavy workloads. Mitigated on hardware that doesn\'t need KPTI (newer CPUs without the Meltdown vulnerability) — the kernel detects and skips it.</p>'

    + '<h4>How to measure</h4>'
    + '<p><code>/proc/$$/status</code> shows <code>voluntary_ctxt_switches</code> and <code>nonvoluntary_ctxt_switches</code> per process. <code>vmstat 1</code> shows system-wide rate. Sustained &gt; 100K/sec on a single CPU is suspicious; the bottleneck might be lock contention or thread thrash.</p>'
    + '<p>Profilers like <code>perf</code> can attribute time to "stalled cycles" caused by cache misses post-switch.</p>'

    + '<h4>Why goroutines / async runtimes win</h4>'
    + '<p>Go\'s goroutines (and async/await runtimes generally) implement <strong>userspace cooperative scheduling</strong> on top of a small pool of OS threads. Switching between goroutines doesn\'t touch the kernel — no kernel/user crossing, no TLB flush, no scheduler involvement. Goroutine switch ≈ 100 ns; OS thread switch ≈ 1–10 µs. For high-fan-out concurrent I/O, this is decisive.</p>'

    + '<div class="callout"><div class="label">When you see high "ctxt/sec" in vmstat</div>'
    + 'Likely causes: lock contention (threads block trying to acquire and resume), too many threads competing on too few CPUs (thread thrash), interrupt floods (NIC). <code>perf top</code> + <code>perf sched record</code> tell you which threads and which lock. The <em>fix</em> is usually fewer threads, lock-free data structures, or moving the workload to async/event-driven.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Tweak parameters; see how cumulative cost adds up.</p>';

    var state = { switchesPerSec: 10000, costUs: 5, cores: 4 };
    var output = document.createElement('div'); output.className = 'formula-box';
    var row = document.createElement('div'); row.className = 'controls-row';

    function makeNum(min, max, val) { var i = document.createElement('input'); i.type='number'; i.min=min; i.max=max; i.value=val; return i; }
    var swInp = makeNum(100, 1000000, state.switchesPerSec);
    var costInp = makeNum(1, 100, state.costUs);
    var coreInp = makeNum(1, 64, state.cores);
    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    row.appendChild(lbl('Context switches/sec/CPU:', swInp));
    row.appendChild(lbl('Cost per switch (µs, incl cache pollution):', costInp));
    row.appendChild(lbl('CPU cores:', coreInp));

    function update() {
      state.switchesPerSec = parseInt(swInp.value, 10);
      state.costUs = parseInt(costInp.value, 10);
      state.cores = parseInt(coreInp.value, 10);
      var totalCsPerSec = state.switchesPerSec * state.cores;
      var totalUsPerSec = state.switchesPerSec * state.costUs; // per-CPU
      var pctPerCpu = totalUsPerSec / 1e6 * 100;
      var verdict = pctPerCpu < 1 ? 'good' : pctPerCpu < 5 ? 'good' : pctPerCpu < 20 ? 'warn' : 'bad';
      output.innerHTML =
        '<div class="info-line"><span class="key">System-wide context switches/sec:</span> <span class="val">' + totalCsPerSec.toLocaleString() + '</span></div>' +
        '<div class="info-line"><span class="key">CPU time spent in switches per CPU:</span> <span class="val"><span class="result" style="color:var(--' + verdict + ')">' + pctPerCpu.toFixed(2) + '%</span></span></div>' +
        '<div class="info-line muted">(Below 1% is invisible. 1–5% is fine. 5–20% is suspicious — workload is switch-heavy. >20% = your scheduler is dominating; audit for lock contention or too-many-threads.)</div>';
    }
    [swInp, costInp, coreInp].forEach(function (el) { el.addEventListener('input', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Switching between two threads of the same process is generally cheaper than switching between two threads of different processes. Why?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Threads have less state than processes</option>' +
          '<option>Same address space → no CR3 change → no TLB flush. Cache lines for shared data also stay hot.</option>' +
          '<option>The kernel doesn\'t schedule threads</option>' +
          '<option>It isn\'t cheaper, the question is wrong</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Same address space') === 0) return { correct: true, feedback: 'Right. The big difference is the address-space switch: changing CR3 invalidates TLB entries (or rotates PCIDs). Same-process thread switches keep the TLB warm. Plus shared data lines stay cached. Same-process thread switch is typically 2–3× cheaper than cross-process.' };
        return { correct: false, feedback: 'The expensive part of a context switch is loading the new address space (CR3 + TLB flush). Same-process threads share an address space, so that step is skipped.' };
      },
      hints: [
        'What\'s the most expensive part of a context switch?',
        'Loading a new page table base (CR3) and the TLB flush that follows.',
        'Same-process threads share the address space, skipping that step.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<code>vmstat 1</code> on a 16-core server shows ~500,000 context switches per second sustained. Each switch costs ~5 µs (load + cache pollution). Roughly what fraction of total CPU time is going to context switching?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.step='0.01'; inp.placeholder='%';
        c.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        // 500_000 switches × 5 µs = 2.5 × 10^6 µs = 2.5 seconds of switching per second
        // across 16 cores → 16 × 1e6 µs/sec available. fraction = 2.5e6 / 16e6 = 15.625%
        if (v >= 14 && v <= 17) return { correct: true, feedback: 'Right. 500K × 5 µs = 2.5 × 10⁶ µs/sec spent context-switching. 16 cores provide 16 × 10⁶ µs/sec. Fraction ≈ 15.6%. That\'s firmly in "switch-heavy" territory — investigate lock contention or thread thrash.' };
        return { correct: false, feedback: 'Total switching time per sec = 500,000 × 5 µs = 2.5 × 10⁶ µs. Available CPU time across 16 cores = 16 × 10⁶ µs. ≈ 15.6%.' };
      },
      hints: [
        'Total switching time per second = switches × cost.',
        '500,000 × 5 µs = 2.5 × 10⁶ µs / sec spent switching.',
        'Available CPU time = 16 × 10⁶ µs/sec. Fraction ≈ 15.6%.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A Go service handles 50,000 concurrent HTTP connections on 8 OS threads. The same workload in a "thread-per-connection" Java server would need ~50,000 OS threads. List the structural advantages of the Go approach (mark TRUE for advantages that are real).',
      mountInput: function (c) {
        var items = [
          { label: 'Goroutine switch is ~100 ns vs OS thread switch ~1–10 µs (10–100× cheaper)',                  t: true },
          { label: 'Each goroutine\'s stack starts at ~2 KB (grows on demand) vs ~1 MB per OS thread',             t: true },
          { label: 'Total memory: 50K × 2 KB = ~100 MB for goroutines vs ~50 GB for thread stacks',                 t: true },
          { label: 'Goroutines use less wallclock time per request',                                                  t: false },
          { label: 'Goroutines avoid kernel/user mode switching except on actual blocking syscalls',                  t: true },
          { label: 'Goroutines fully bypass the OS scheduler — they\'re completely user-mode',                        t: false }
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
        if (allCorrect) return { correct: true, feedback: 'Right. Cheaper switches (userspace cooperative scheduling, no kernel boundary), tiny stacks (~2 KB initial vs ~1 MB), massive memory savings, and only crossing into the kernel on actual blocking I/O. The two false statements: goroutines don\'t reduce per-request wallclock work; they reduce CONCURRENCY OVERHEAD. And they don\'t fully bypass the OS scheduler — Go\'s runtime schedules goroutines onto OS threads (G-M-P model), which the OS still schedules onto cores. Goroutines layer on top of OS threading; they don\'t replace it.' };
        return { correct: false, feedback: 'Re-check. Cheaper switches, smaller stacks, lower kernel-crossing rate are real. Goroutines don\'t make individual requests faster (same compute) and don\'t bypass the OS scheduler — they ride on top.' };
      },
      hints: [
        'What\'s expensive about thread-per-connection at 50K connections?',
        'Memory (1 MB stacks) and switch frequency.',
        'Goroutines: cheap switches, tiny stacks, kernel-crossing only on actual blocking I/O. They DON\'T reduce per-request CPU work or bypass the OS scheduler entirely.'
      ]
    }
  ]
});
