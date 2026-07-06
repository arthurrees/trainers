// Level 0 — Orientation
HWT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Every spec-sheet number you read in the next 13 levels is one slice of a balanced system. Before drilling in, this level lays out the seven big parts inside a tower, what each does, and the universal failure mode of PC builds: one weak component bottlenecks the rest, no matter how strong they are.',
  glossary: ['PC', 'tower', 'OEM', 'spec sheet', 'CPU', 'GPU', 'RAM', 'PSU', 'mobo', 'bottleneck'],
  learn: ''
    + '<h4>What\'s actually inside a tower</h4>'
    + '<p>Open the side panel of a desktop PC and you\'ll see the same handful of parts every time. Each one talks to a few others, and a weakness anywhere caps the system.</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Part</th><th>Job</th><th>Talks to</th></tr>'
    + '<tr><td><strong>CPU</strong></td><td>Runs the OS and most program logic. The "brain".</td><td>RAM (constantly), chipset, PCIe devices</td></tr>'
    + '<tr><td><strong>RAM (DIMMs)</strong></td><td>Volatile working memory. Holds whatever the CPU is touching <em>right now</em>.</td><td>CPU only (memory controller is in the CPU)</td></tr>'
    + '<tr><td><strong>GPU</strong></td><td>Massively parallel compute. Pixels, shaders, ML, video encode.</td><td>CPU/chipset over PCIe, monitor over DP/HDMI</td></tr>'
    + '<tr><td><strong>Storage (NVMe / SATA SSD / HDD)</strong></td><td>Persistent. Holds OS, programs, files. Survives power-off.</td><td>CPU (NVMe direct) or chipset (SATA)</td></tr>'
    + '<tr><td><strong>Motherboard + chipset</strong></td><td>The PCB everything plugs into. Adds I/O the CPU lacks (extra USB, SATA, PCIe).</td><td>Everyone</td></tr>'
    + '<tr><td><strong>PSU</strong></td><td>Converts wall AC → DC rails. Powers everything.</td><td>Wall, then every other part</td></tr>'
    + '<tr><td><strong>Cooling</strong></td><td>Removes heat from CPU + GPU. Without it, chips throttle (slow themselves down) within seconds.</td><td>CPU and GPU mainly</td></tr>'
    + '</table>'

    + '<h4>The mental model: data flow</h4>'
    + '<p>When you click an icon and a program opens, the chain is roughly:</p>'
    + '<ol>'
    +   '<li>OS reads the executable from <strong>storage</strong> (NVMe = fast, HDD = slow).</li>'
    +   '<li>Bytes get copied into <strong>RAM</strong>.</li>'
    +   '<li>The <strong>CPU</strong> starts executing instructions, fetching them from RAM via the cache hierarchy.</li>'
    +   '<li>If it draws to a window, the CPU sends commands to the <strong>GPU</strong> over <strong>PCIe</strong>.</li>'
    +   '<li>The GPU writes pixels into VRAM and pushes the framebuffer over <strong>DisplayPort/HDMI</strong> to the monitor.</li>'
    +   '<li>The whole time, the <strong>PSU</strong> is feeding 12 V to the CPU and GPU, and <strong>cooling</strong> is moving heat out.</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">The universal failure mode: bottlenecks</div>'
    + 'In a chain, total speed is the speed of the slowest link. A 16-core CPU paired with a slow HDD will spend most compile time waiting on disk. A monster GPU paired with a 4-core CPU from 2014 will sit idle while the CPU "feeds" it draw calls. Picking parts is mostly about avoiding bottlenecks for the workload you actually care about.'
    + '</div>'

    + '<h4>The two reasons builds usually fail</h4>'
    + '<ul>'
    +   '<li><strong>Imbalance</strong> — one component is wildly weaker than the others. Solution: read the next 13 levels, learn what "balanced" means for your workload.</li>'
    +   '<li><strong>Power or thermals</strong> — undersized PSU shuts down on transient spikes; weak cooler causes the CPU to throttle. Solution: levels 6 and 8.</li>'
    + '</ul>'

    + '<h4>Reading a spec sheet</h4>'
    + '<p>Every product page is a wall of numbers — frequencies, lane counts, wattages, MHz. Most of this trainer is teaching you to look at one of those numbers and answer:</p>'
    + '<ul>'
    +   '<li>What does it actually <em>mean</em> physically?</li>'
    +   '<li>Is bigger always better, or are there trade-offs (power, heat, cost)?</li>'
    +   '<li>Does it matter for <em>my</em> workload, or is it noise?</li>'
    + '</ul>'
    + '<p>Spoiler: a lot of high-end specs are noise for typical use cases. Knowing which is the real win.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click a part to see its role, what it talks to, and a representative example.</p>';
    var items = [
      { name: 'CPU', desc: 'The processor. Runs the OS scheduler and the bulk of program logic. Modern desktop CPUs: 6–16 cores. Example in this trainer: AMD Ryzen 9 3900X — 12 cores, 24 threads, 105 W TDP, AM4 socket.' },
      { name: 'RAM', desc: 'Working memory. Loses contents on power-off. Connected directly to the CPU via channels. Typical in 2026: 32 GB DDR4 or DDR5, dual-channel.' },
      { name: 'GPU', desc: 'Graphics card. Plugs into a PCIe x16 slot, draws power via PCIe + extra connectors. Used for graphics, ML inference/training, video encoding. Example: NVIDIA RTX 3070 — 8 GB VRAM, 220 W TGP.' },
      { name: 'Storage', desc: 'NVMe SSDs use PCIe x4 lanes via M.2 slots (fast: 3.5–14 GB/s). SATA SSDs cap near 600 MB/s. Spinning HDDs are ~180 MB/s. Most modern builds put OS on NVMe and bulk on HDD or SSD.' },
      { name: 'Motherboard', desc: 'The PCB. Defines socket (AM4, AM5, LGA1700) and chipset (B550, X570, Z790). Decides how many PCIe slots, NVMe slots, USB ports, RAM slots you get. Example: ASRock B550M Steel Legend.' },
      { name: 'PSU', desc: 'Power Supply Unit. Rated in watts (typically 550–1000 W consumer). Quality matters more than peak watts for stability — a no-name 850 W can be worse than a Gold-rated 650 W under transient load. Example: Corsair RM850x.' },
      { name: 'Cooling', desc: 'CPU cooler (air or AIO liquid) plus case fans. The CPU and GPU are heat sources; you must move that heat out of the case. Example: Corsair H100i RGB Platinum (240 mm AIO).' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a part</span>';
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = it.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML = '<div><strong style="color:var(--accent)">' + it.name + '</strong></div><div style="margin-top:6px">' + it.desc + '</div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You unplug your PC from the wall. Which component\'s contents are <strong>lost</strong>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['CPU cache + RAM', 'NVMe SSD', 'HDD', 'BIOS settings'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'CPU cache + RAM') return { correct: true, feedback: 'Right. RAM and on-CPU caches are volatile — they need power to retain bits. SSDs and HDDs are non-volatile (they survive power-off). BIOS settings are stored in NVRAM, also non-volatile.' };
        return { correct: false, feedback: 'Volatile means "needs power to remember." That\'s RAM and the CPU caches.' };
      },
      hints: [
        'Volatile = forgets when unpowered. Non-volatile = persists.',
        'Storage (SSD/HDD) is non-volatile by definition — that\'s the whole point.',
        'RAM is the textbook example of volatile memory.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A user reports: "I edit big videos. My exports take forever." Their build: Ryzen 5 5600 (6c/12t, fast), RTX 4060 (decent encoder), 16 GB RAM, 1 TB <strong>spinning HDD</strong> as the only drive. What\'s the most likely bottleneck?',
      mountInput: function (c) {
        var opts = ['CPU (only 6 cores)', 'GPU (entry-level encoder)', 'RAM (only 16 GB)', 'Storage (HDD instead of NVMe)'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 3) return { correct: true, feedback: 'Right. Video editing reads multi-GB source files and writes multi-GB exports — sequential and random both. An HDD at ~180 MB/s vs an NVMe at 3,500–7,000 MB/s is a 20–40× gap. The 5600 + 4060 are fine; the drive is the cap.' };
        if (v === 0 || v === 1) return { correct: false, feedback: 'The CPU and GPU here are competent. Look at the only spinning-platter component in the build.' };
        if (v === 2) return { correct: false, feedback: '16 GB is tight for 4K editing but adequate for most projects. The 20× I/O speed gap dominates.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Video editing is enormously I/O-heavy. Multi-GB files in and out.',
        'Compare the throughput of an HDD (~180 MB/s) to an NVMe SSD (3,500+ MB/s).',
        'The HDD is the bottleneck. Adding an NVMe scratch disk fixes 90% of the slowness.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re given a $1500 budget for a "fast desktop, mostly Python data science with occasional 1440p gaming." Two builds: <br><br><strong>Build A:</strong> Ryzen 9 7900X (12c, $400), 32 GB DDR5, RTX 4060 8 GB ($300), 1 TB NVMe Gen4, 750 W Gold PSU.<br><strong>Build B:</strong> Ryzen 5 7600 (6c, $230), 32 GB DDR5, RTX 4070 12 GB ($550), 1 TB NVMe Gen4, 750 W Gold PSU.<br><br>Which is the better fit for the stated workload, and why?',
      mountInput: function (c) {
        var opts = [
          'Build A — the 12-core CPU dominates Python data work',
          'Build B — the better GPU helps gaming, and 6 cores is plenty for typical pandas/notebook work',
          'They\'re identical in practice'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. "Python data science" sounds CPU-heavy, but most pandas/numpy code on a single notebook is single-threaded or modestly parallel — 6 fast cores is plenty. Meanwhile the GPU jump (4060 8 GB → 4070 12 GB) is huge for both 1440p gaming AND any GPU-accelerated ML (PyTorch, etc.). 12 GB VRAM in particular lets you fit larger models. The "12-core" instinct is the wrong heuristic here.' };
        if (v === 0) return { correct: false, feedback: 'Common mistake — "more cores must be better for data work." But notebook-style pandas/sklearn rarely uses more than a handful of cores well. The GPU difference matters more for both stated use cases (gaming + any ML acceleration).' };
        if (v === 2) return { correct: false, feedback: 'They\'re very different. Build A is CPU-strong / GPU-weak; Build B is the opposite. Pick based on workload.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Don\'t treat "data science" as one thing. Ask: which library is doing the heavy lifting? pandas (CPU), PyTorch (GPU)?',
        'Notebook-style pandas work is mostly single-threaded. 6 fast cores ≈ 12 fast cores for typical workflows.',
        '1440p gaming and any GPU-accelerated ML both reward more VRAM and more SMs. The GPU upgrade in Build B is the better dollar-for-dollar move.'
      ]
    }
  ]
});
