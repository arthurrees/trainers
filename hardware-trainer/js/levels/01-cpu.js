// Level 1 — CPU anatomy
HWT.registerLevel({
  id: 1,
  title: 'CPU Anatomy',
  whyItMatters: 'A CPU spec sheet has dozens of numbers. Three of them — core count, single-thread performance (clock × IPC), and cache — explain almost all real-world performance differences. The rest is detail. This level untangles those three from the marketing.',
  glossary: ['CPU', 'core', 'thread', 'SMT', 'IPC', 'clock', 'TDP', 'cache', 'CCD', 'IMC', 'iGPU'],
  learn: ''
    + '<h4>Cores and threads</h4>'
    + '<p>A <strong>core</strong> is an independent execution unit. A 12-core CPU can execute 12 different programs (or 12 parts of one program) in true parallel. A <strong>hardware thread</strong> is what the OS sees: with SMT (Intel calls it Hyper-Threading), one physical core exposes 2 threads. So a 12-core / 24-thread CPU has 12 physical cores; the extra 12 are squeezed in by reusing core resources during idle moments.</p>'
    + '<div class="example"><div class="label">User\'s CPU: Ryzen 9 3900X</div>12 cores, 24 threads, 64 MB L3 cache, 105 W TDP, AM4 socket. The 12 cores are split across <strong>two CCDs</strong> (chiplets) of 6 cores each — cross-CCD communication has higher latency than within-CCD.</div>'

    + '<h4>The two halves of single-thread speed: clock × IPC</h4>'
    + '<p>"Speed" of a single core ≈ <code>frequency × work-per-cycle</code>. The two terms:</p>'
    + '<ul>'
    +   '<li><strong>Clock (GHz)</strong> — how many cycles per second. 4.0 GHz = 4 billion cycles/sec.</li>'
    +   '<li><strong>IPC (instructions per clock)</strong> — how much work the core gets done per cycle. Architectural; doesn\'t change for a given chip.</li>'
    + '</ul>'
    + '<p>Two CPUs at the same clock can have wildly different IPC. A Zen 5 core at 4.0 GHz gets noticeably more work done than a Zen 1 core at 4.0 GHz — same frequency, ~50% better IPC.</p>'
    + '<div class="callout"><div class="label">Why "GHz wars" died</div>The Pentium 4 in 2004 hit 3.8 GHz and was beaten by Core 2 Duo chips at 2.4 GHz. IPC matters more than raw frequency once heat limits become real. Today both Intel and AMD top out around 5–6 GHz; further gains come from IPC.</div>'

    + '<h4>The cache hierarchy</h4>'
    + '<p>RAM is fast (~80 ns access) but slow compared to a CPU running at 5 GHz (one cycle = 0.2 ns). To hide this gap, every modern CPU has a tiered cache:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Level</th><th>Size (per core, typical)</th><th>Latency</th><th>Scope</th></tr>'
    + '<tr><td>L1</td><td>32–64 KB</td><td>~1 ns (4 cycles)</td><td>per core</td></tr>'
    + '<tr><td>L2</td><td>0.5–2 MB</td><td>~3 ns (12 cycles)</td><td>per core</td></tr>'
    + '<tr><td>L3</td><td>16–128 MB</td><td>~10–15 ns (40 cycles)</td><td>shared by all cores in a CCD/die</td></tr>'
    + '<tr><td>RAM</td><td>16–128 GB</td><td>~80 ns (400 cycles)</td><td>shared</td></tr>'
    + '</table>'
    + '<p>An L1 hit is ~80× faster than going to RAM. The whole point of cache is to keep the small set of bytes you\'re currently reading close. When you process an array sequentially, the CPU prefetches the next chunks into L1 — that\'s why <strong>cache-friendly memory access patterns</strong> can make code 5–10× faster with no algorithmic change.</p>'

    + '<h4>TDP — what it actually means</h4>'
    + '<p>TDP (Thermal Design Power) is rated in watts and represents the heat the cooler must dissipate at "design" load. It\'s <em>roughly</em> equal to power draw, but:</p>'
    + '<ul>'
    +   '<li>Modern CPUs <strong>boost</strong> well above TDP for short bursts (PPT, PL2 — Intel calls these "Power Limits"). A 105 W 3900X can pull 142 W under full load with PBO enabled.</li>'
    +   '<li>Idle draw is much lower (~20 W).</li>'
    +   '<li>Pick a cooler rated for at least the chip\'s peak sustained draw, not just TDP.</li>'
    + '</ul>'

    + '<h4>SMT / Hyper-Threading</h4>'
    + '<p>One core runs two threads simultaneously by interleaving them on shared execution units. Typical throughput gain: <strong>+20–35%</strong> on multi-threaded workloads. It\'s effectively free silicon. Disable it only for security-paranoid setups (it shares cache between threads — sometimes a sidechannel concern).</p>'

    + '<h4>iGPU vs no iGPU</h4>'
    + '<p>AMD\'s naming: chips ending in <strong>X</strong> (Ryzen 9 3900X) have <em>no</em> iGPU. Chips ending in <strong>G</strong> (Ryzen 5 5600G) do. If your CPU has no iGPU, you <em>must</em> have a discrete GPU to see anything on the monitor. Modern Ryzen 7000+ chips quietly include a tiny iGPU on every SKU (no "G" suffix needed).</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click a CPU to see its key specs side-by-side.</p>';
    var cpus = [
      { name: 'Ryzen 9 3900X (Zen 2, 2019)', cores: 12, threads: 24, baseGHz: 3.8, boostGHz: 4.6, l3: '64 MB', tdp: '105 W', notes: 'Two CCDs of 6 cores. PCIe 4.0. AM4. The user\'s chip.' },
      { name: 'Ryzen 5 5600 (Zen 3, 2022)', cores: 6, threads: 12, baseGHz: 3.5, boostGHz: 4.4, l3: '32 MB', tdp: '65 W', notes: 'Single CCD. Best Zen 3 IPC. Sweet spot for gaming + light productivity.' },
      { name: 'Ryzen 7 7800X3D (Zen 4, 2023)', cores: 8, threads: 16, baseGHz: 4.2, boostGHz: 5.0, l3: '96 MB (3D V-Cache)', tdp: '120 W', notes: 'Stacked extra L3 cache. The reigning gaming CPU when shipped — cache size beats clock for game perf.' },
      { name: 'Core i9-14900K (Raptor Lake, 2023)', cores: 24, threads: 32, baseGHz: 3.2, boostGHz: 6.0, l3: '36 MB', tdp: '125–253 W', notes: '8 P-cores + 16 E-cores hybrid. Highest single-thread numbers but huge power draw.' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a CPU</span>';
    cpus.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = c.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + c.name + '</strong></div>' +
          '<div style="margin-top:6px">' +
          '<span class="info-line"><span class="key">Cores / threads:</span> <span class="val">' + c.cores + ' / ' + c.threads + '</span></span><br>' +
          '<span class="info-line"><span class="key">Base / boost:</span> <span class="val">' + c.baseGHz + ' GHz / ' + c.boostGHz + ' GHz</span></span><br>' +
          '<span class="info-line"><span class="key">L3 cache:</span> <span class="val">' + c.l3 + '</span></span><br>' +
          '<span class="info-line"><span class="key">TDP:</span> <span class="val">' + c.tdp + '</span></span><br>' +
          '<span class="info-line"><span class="key">Notes:</span> <span class="val">' + c.notes + '</span></span>' +
          '</div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A spec sheet says "8 cores / 16 threads." How many <strong>physical</strong> cores does this CPU have?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type = 'number'; inp.min = '0'; inp.placeholder = 'cores';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 8) return { correct: true, feedback: 'Right. The 16 threads come from SMT — each of the 8 physical cores presents 2 hardware threads to the OS.' };
        if (v === 16) return { correct: false, feedback: '16 is the thread count, not the physical core count. SMT lets each core present 2 threads.' };
        return { correct: false, feedback: 'The "cores" number is the physical count. The "threads" number doubles it under SMT.' };
      },
      hints: [
        'Threads are what the OS sees. Cores are physical.',
        'SMT (Hyper-Threading) makes 1 core look like 2 threads.',
        'Cores = 8.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'CPU A: 16 cores at 3.0 GHz, IPC = 1.0 (relative). CPU B: 8 cores at 4.0 GHz, IPC = 1.5 (relative). Which CPU is faster on a workload that <em>perfectly parallelizes</em> across all available threads (no SMT, ignore cache)? Compute total relative throughput = cores × clock × IPC.',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>CPU A</option><option>CPU B</option><option>Tied</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // A: 16 * 3.0 * 1.0 = 48
        // B:  8 * 4.0 * 1.5 = 48
        if (v === 'Tied') return { correct: true, feedback: 'Right. A: 16 × 3.0 × 1.0 = 48. B: 8 × 4.0 × 1.5 = 48. Equal aggregate throughput. (In practice they\'d differ on memory bandwidth, cache, scheduling — but the headline number ties.)' };
        return { correct: false, feedback: 'Compute cores × clock × IPC for each. A: 16 × 3.0 × 1.0 = 48. B: 8 × 4.0 × 1.5 = 48. They tie.' };
      },
      hints: [
        'Throughput on a perfectly-parallel workload ≈ cores × clock × IPC.',
        'Plug in: A is 16 × 3 × 1 = 48; B is 8 × 4 × 1.5 = 48.',
        'They tie.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You profile a hot loop and find: each iteration reads <strong>one 8-byte value</strong> from RAM (L3 misses) and does ~10 ns of arithmetic. Iterations are independent. Estimate the speedup if you reorganize the data so all 8-byte values fit in L1 cache (so reads become L1 hits at ~1 ns instead of ~80 ns RAM accesses). Use these times: <code>RAM = 80 ns, L1 = 1 ns, arithmetic = 10 ns</code>. Assume the CPU does the read THEN the arithmetic per iteration — no overlap.',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type = 'number'; inp.step = '0.1'; inp.placeholder = 'speedup ×';
        c.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        // before: 80 + 10 = 90 ns/iter
        // after:   1 + 10 = 11 ns/iter
        // speedup = 90/11 ≈ 8.18
        if (Math.abs(v - 8.18) <= 0.3 || Math.abs(v - 8.2) <= 0.3) return { correct: true, feedback: 'Right. Before: 80 + 10 = 90 ns/iter. After: 1 + 10 = 11 ns/iter. Speedup ≈ 90 / 11 ≈ 8.2×. Algorithmically you changed nothing — only the access pattern. This is why "memory layout" is a real engineering concern, not premature optimization.' };
        if (v >= 7.5 && v <= 9.0) return { correct: true, feedback: 'Close enough. Exact: 90 / 11 ≈ 8.18×.' };
        return { correct: false, feedback: 'Per-iter time before = 80 + 10 = 90 ns. After = 1 + 10 = 11 ns. Speedup = 90 / 11 ≈ 8.2×.' };
      },
      hints: [
        'Per iteration time = read time + arithmetic time.',
        'Before: 80 + 10 = 90 ns. After: 1 + 10 = 11 ns.',
        'Speedup = 90 / 11 ≈ 8.2×.'
      ]
    }
  ]
});
