// Level 4 — Storage
HWT.registerLevel({
  id: 4,
  title: 'Storage — HDD, SATA SSD, NVMe',
  whyItMatters: 'Storage was the slowest part of the PC for 30 years. Then NVMe arrived and made bulk I/O cease to be a bottleneck for most workloads. Knowing the per-class throughput numbers (and the random-IO gap that matters more than sequential) lets you pick the right drive for the job, not just buy the biggest "TB" number.',
  glossary: ['HDD', 'SSD', 'NVMe', 'M.2', 'TLC', 'PCIe'],
  learn: ''
    + '<h4>Three classes, three orders of magnitude</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Class</th><th>Sequential read</th><th>Random read (4 KB QD1)</th><th>Random IOPS</th><th>Latency</th><th>$/TB (2026)</th></tr>'
    + '<tr><td>HDD 7200 rpm</td><td class="warn">~180 MB/s</td><td class="bad">~0.6 MB/s</td><td class="bad">~150 IOPS</td><td class="bad">~5 ms (mech seek)</td><td class="good">~$15</td></tr>'
    + '<tr><td>SATA SSD</td><td>~540 MB/s</td><td>~30 MB/s</td><td>~80,000 IOPS</td><td>~50 µs</td><td>~$60</td></tr>'
    + '<tr><td>NVMe Gen 3 x4</td><td class="good">~3,500 MB/s</td><td>~70 MB/s</td><td>~600,000 IOPS</td><td class="good">~20 µs</td><td>~$70</td></tr>'
    + '<tr><td>NVMe Gen 4 x4</td><td class="good">~7,000 MB/s</td><td>~80 MB/s</td><td>~1,000,000 IOPS</td><td class="good">~15 µs</td><td>~$80</td></tr>'
    + '<tr><td>NVMe Gen 5 x4</td><td class="good">~12,000 MB/s</td><td>~85 MB/s</td><td>~1,500,000 IOPS</td><td class="good">~12 µs</td><td>~$120</td></tr>'
    + '</table>'

    + '<h4>Sequential vs random IO — the underrated gap</h4>'
    + '<p>The headline number on a drive box is <strong>sequential read</strong> — copying a single huge file. That\'s what you do for video editing scratch disks. But most desktop activity is <strong>random read</strong> — opening 1000 small files, the OS booting, the package manager unzipping, your IDE indexing. The HDD-to-NVMe gap is bigger here:</p>'
    + '<ul>'
    +   '<li>Sequential: HDD 180 MB/s vs NVMe 7000 MB/s = <strong>~40× faster</strong></li>'
    +   '<li>Random 4 KB: HDD 0.6 MB/s vs NVMe 80 MB/s = <strong>~130× faster</strong></li>'
    +   '<li>4 KB random IOPS: HDD 150 vs NVMe 1,000,000 = <strong>~6700× faster</strong></li>'
    + '</ul>'
    + '<p>This is why putting your OS on an SSD makes a 10-year-old PC feel new — boot involves thousands of small file reads.</p>'

    + '<h4>SATA SSD vs NVMe — does the protocol matter?</h4>'
    + '<p>SATA was designed in 2003 for spinning HDDs. Two unfortunate legacies:</p>'
    + '<ul>'
    +   '<li>SATA caps near 600 MB/s (the SATA-III link) — even if NAND could go faster.</li>'
    +   '<li>SATA uses AHCI, which has a single command queue 32 entries deep — assumes drive is slow enough that 32 in-flight requests is plenty.</li>'
    + '</ul>'
    + '<p>NVMe was designed in 2011 for SSDs:</p>'
    + '<ul>'
    +   '<li>Talks PCIe directly. Bandwidth scales with lanes/gen. No artificial cap.</li>'
    +   '<li>Up to 65,535 queues × 65,535 commands per queue. Built for parallelism.</li>'
    +   '<li>Lower CPU overhead per IO.</li>'
    + '</ul>'
    + '<p>For most users in 2026: <strong>NVMe everywhere.</strong> SATA SSDs only make sense if you\'ve run out of M.2 slots and need bulk-storage SSD on the cheap.</p>'

    + '<h4>The M.2 slot</h4>'
    + '<p>M.2 is a physical slot — a small flat connector on the motherboard. M.2 slots can carry either:</p>'
    + '<ul>'
    +   '<li><strong>NVMe (PCIe x4)</strong> — fast. The point of having M.2 in 2026.</li>'
    +   '<li><strong>SATA</strong> — same protocol, just routed over the M.2 slot. Identical performance to a 2.5" SATA SSD.</li>'
    + '</ul>'
    + '<p>Most cheap "1 TB SSD" SKUs are NVMe. But always check — both physically fit. Mixing them up is a "where did my speed go" support ticket.</p>'

    + '<h4>NAND flavors and endurance</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>NAND</th><th>Bits/cell</th><th>Typical P/E cycles</th><th>Use</th></tr>'
    + '<tr><td>SLC</td><td>1</td><td>~100,000</td><td>Enterprise / extreme endurance only.</td></tr>'
    + '<tr><td>MLC</td><td>2</td><td>~10,000</td><td>Mostly retired; some "Pro" SKUs.</td></tr>'
    + '<tr><td>TLC</td><td>3</td><td>~1,000–3,000</td><td>The default for consumer SSDs in 2026.</td></tr>'
    + '<tr><td>QLC</td><td>4</td><td>~500–1,000</td><td>Cheap, dense, slow under sustained writes. OK for read-heavy workloads.</td></tr>'
    + '</table>'
    + '<p>"P/E cycles" is per-cell. Wear leveling spreads writes across the whole drive, so even a "1,000 P/E" 1 TB drive can absorb hundreds of TB written. TBW (Terabytes Written) on the spec sheet tells you the warrantied write endurance.</p>'

    + '<h4>SLC cache — why benchmarks lie</h4>'
    + '<p>Consumer TLC drives reserve a chunk of their NAND to operate in faster SLC mode (1 bit per cell instead of 3). Writes hit that cache fast — until the cache fills (~10–100 GB depending on drive), then writes drop to the native TLC speed (sometimes ~150 MB/s on a "cheap" drive). For sustained writes (cloning a big game, dumping a video export), the post-cache speed matters more than the headline.</p>'

    + '<div class="callout"><div class="label">Practical recipe (most builds, 2026)</div>'
    + '1× NVMe Gen 4 x4 1–2 TB for OS + applications. Optional 1× large NVMe or SATA SSD for scratch/games. HDD only if you\'re archiving multi-TB cold data and minding cost. Don\'t put your OS on an HDD; you will regret it within a week.'
    + '</div>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Pick a drive type. See realistic sustained sequential and rough copy time for a 100 GB folder.</p>';
    var kinds = [
      { name: 'HDD 7200rpm', label: 'HDD (7200 rpm)' },
      { name: 'SATA SSD', label: 'SATA SSD' },
      { name: 'NVMe Gen3 x4', label: 'NVMe Gen 3 x4' },
      { name: 'NVMe Gen4 x4', label: 'NVMe Gen 4 x4' },
      { name: 'NVMe Gen5 x4', label: 'NVMe Gen 5 x4' }
    ];
    var output = document.createElement('div'); output.className = 'formula-box';
    var bars = document.createElement('div'); bars.className = 'bar-chart';

    kinds.forEach(function (k) {
      var mb = hw.storageMBps(k.name);
      var pct = Math.min(100, mb / 12000 * 100);
      var row = document.createElement('div'); row.className = 'bar-row';
      row.innerHTML = '<span class="bar-label">' + k.label + '</span>' +
        '<span class="bar-track"><span class="bar-fill ' + (mb < 200 ? 'bad' : mb < 1000 ? 'warn' : 'good') + '" style="width:' + pct + '%"></span></span>' +
        '<span class="bar-val">' + mb + ' MB/s</span>';
      bars.appendChild(row);
    });
    container.appendChild(bars);

    var pickRow = document.createElement('div'); pickRow.className = 'chip-row';
    kinds.forEach(function (k) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = k.label;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(pickRow.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        var mb = hw.storageMBps(k.name);
        var seconds = 100 * 1024 / mb;
        var minutes = Math.round(seconds / 60 * 10) / 10;
        output.innerHTML =
          '<div class="info-line"><span class="key">Sustained sequential:</span> <span class="val">' + mb + ' MB/s</span></div>' +
          '<div class="info-line"><span class="key">Copy 100 GB:</span> <span class="val"><span class="result">' + (minutes >= 1 ? minutes + ' min' : Math.round(seconds) + ' s') + '</span> (' + Math.round(seconds) + ' s)</span></div>';
      });
      pickRow.appendChild(b);
    });
    container.appendChild(pickRow);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You buy a "1 TB M.2 SSD" but it only hits ~530 MB/s in benchmarks. Your motherboard\'s M.2 slot supports both NVMe and SATA. What is the most likely cause?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>The drive is SATA-mode M.2, not NVMe</option>' +
          '<option>The drive is faulty</option>' +
          '<option>PCIe Gen 3 x4 caps at 530 MB/s</option>' +
          '<option>The OS isn\'t TRIM-aware</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'The drive is SATA-mode M.2, not NVMe') return { correct: true, feedback: 'Right. ~540 MB/s is the SATA-III link cap. M.2 slots can carry either protocol; physically the drives look the same. Always check the spec sheet for "NVMe" vs "SATA" before buying.' };
        if (v === 'PCIe Gen 3 x4 caps at 530 MB/s') return { correct: false, feedback: 'PCIe Gen 3 x4 = ~3,940 MB/s, way more than 530. The cap here matches SATA-III\'s ~600 MB/s, suggesting this is a SATA-mode M.2 drive.' };
        return { correct: false, feedback: '530 MB/s is suspiciously close to the SATA-III link cap (~600 MB/s). This is almost certainly a SATA M.2 drive, not NVMe.' };
      },
      hints: [
        '~540 MB/s is the SATA-III ceiling.',
        'M.2 is a physical slot — both NVMe and SATA drives use it.',
        'You bought a SATA M.2, not NVMe.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Compute the time, in seconds, to copy a single <strong>50 GB</strong> file from a "1 TB Gen 4 NVMe" (sustained 7,000 MB/s) to a SATA SSD (sustained 540 MB/s). The bottleneck is the slower drive. (Use 1 GB = 1024 MB. Round to the nearest second.)',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='seconds';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // 50 * 1024 / 540 = 94.81 s
        if (v >= 93 && v <= 96) return { correct: true, feedback: 'Right. The slower drive caps the transfer. 50 × 1024 / 540 ≈ 94.8 s ≈ 95 s.' };
        if (v >= 7 && v <= 8) return { correct: false, feedback: 'You used the faster drive\'s rate. The chain is only as fast as the slowest link — copy is bottlenecked by the SATA SSD.' };
        return { correct: false, feedback: 'Bottleneck = SATA SSD at 540 MB/s. 50 × 1024 = 51,200 MB. ÷ 540 = ~95 s.' };
      },
      hints: [
        'Which drive is slower? That\'s your bottleneck.',
        '50 GB × 1024 = 51,200 MB. ÷ 540 MB/s.',
        '~95 seconds.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A NAS has 4× HDDs in RAID 0 (data striped, no redundancy — each drive does ~180 MB/s). Same NAS, you replace those drives with 4× SATA SSDs in RAID 0 (each ~540 MB/s). Both setups are connected to the host over a 1 GbE Ethernet link (~125 MB/s after overhead). For a sequential 100 GB read over the network, approximately how much faster is the SATA-SSD array than the HDD array?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>~3× faster (matches the per-drive throughput ratio)</option>' +
          '<option>~12× faster (4 SSDs vs HDD-equivalent in IOPS)</option>' +
          '<option>About the same — Ethernet is the bottleneck</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'About the same — Ethernet is the bottleneck') return { correct: true, feedback: 'Right. RAID 0 of 4 HDDs ≈ 4 × 180 = 720 MB/s, well above 1 GbE\'s ~125 MB/s ceiling. The SSD array can do ~2,160 MB/s but the network caps both at ~125 MB/s. Same effective speed. The lesson: identify the bottleneck before upgrading. To benefit from the SSDs you\'d need 10 GbE on both ends.' };
        if (v === '~3× faster (matches the per-drive throughput ratio)') return { correct: false, feedback: 'Per-drive ratio doesn\'t apply when something else is the bottleneck. The 1 GbE network is way slower than either RAID array.' };
        if (v === '~12× faster (4 SSDs vs HDD-equivalent in IOPS)') return { correct: false, feedback: 'Both arrays exceed 1 GbE\'s ceiling. Network is the limit.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Identify all the speed limits in the chain.',
        '4 HDDs RAID 0 = 720 MB/s. 4 SATA SSDs RAID 0 = 2,160 MB/s. 1 GbE = 125 MB/s.',
        'Both arrays max out the network. No difference at 1 GbE.'
      ]
    }
  ]
});
