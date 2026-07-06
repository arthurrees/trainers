// Level 3 — PCIe
HWT.registerLevel({
  id: 3,
  title: 'PCIe — Lanes, Generations, Bandwidth',
  whyItMatters: 'PCIe is the high-speed bus that connects your CPU to your GPU, your NVMe drives, and most expansion cards. It\'s sold as "Gen X by N lanes" — and lane allocation is constantly debated in builder forums because mid-range boards make you trade off between GPU lanes, NVMe lanes, and chipset lanes. This level untangles the math.',
  glossary: ['PCIe', 'lane', 'bifurcation', 'NVMe', 'M.2', 'DMI'],
  learn: ''
    + '<h4>The two numbers: generation and lane count</h4>'
    + '<p>A PCIe slot is described as "Gen X by N lanes," e.g. <code>Gen 4 x16</code>. Two independent dials:</p>'
    + '<ul>'
    +   '<li><strong>Generation (1–6)</strong> — controls the per-lane raw transfer rate. Each new gen roughly doubles the previous.</li>'
    +   '<li><strong>Lane count (x1, x2, x4, x8, x16)</strong> — how many lanes the slot uses. Each lane is one independent serial pair (full duplex).</li>'
    + '</ul>'

    + '<h4>Per-lane bandwidth</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Generation</th><th>Year</th><th>Encoding</th><th>Per-lane (one direction)</th><th>x4 link</th><th>x16 link</th></tr>'
    + '<tr><td>1.0</td><td>2003</td><td>8b/10b (-20%)</td><td>250 MB/s</td><td>1.0 GB/s</td><td>4.0 GB/s</td></tr>'
    + '<tr><td>2.0</td><td>2007</td><td>8b/10b</td><td>500 MB/s</td><td>2.0 GB/s</td><td>8.0 GB/s</td></tr>'
    + '<tr><td>3.0</td><td>2010</td><td>128b/130b (~no overhead)</td><td>~985 MB/s (≈ 1 GB/s)</td><td>3.94 GB/s</td><td>15.75 GB/s</td></tr>'
    + '<tr><td>4.0</td><td>2017</td><td>128b/130b</td><td>~1.97 GB/s</td><td>7.88 GB/s</td><td>31.5 GB/s</td></tr>'
    + '<tr><td>5.0</td><td>2019</td><td>128b/130b</td><td>~3.94 GB/s</td><td>15.75 GB/s</td><td>63 GB/s</td></tr>'
    + '<tr><td>6.0</td><td>2022</td><td>PAM4 + FLIT</td><td>~7.56 GB/s</td><td>30.25 GB/s</td><td>121 GB/s</td></tr>'
    + '</table>'
    + '<p><strong>Doubling per generation</strong> is the rule. So Gen 4 x4 ≈ Gen 3 x8 ≈ Gen 2 x16. A "skinny but fast" link can match a "wide but slow" one.</p>'

    + '<h4>How many lanes does a CPU give you?</h4>'
    + '<p>The CPU has a fixed pool. Mainstream desktop chips give you ~24 PCIe lanes total to spend:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>CPU</th><th>Total CPU lanes</th><th>Typical split</th></tr>'
    + '<tr><td>Ryzen 5000 (AM4)</td><td>24 (Gen 4)</td><td>16 → GPU + 4 → NVMe + 4 → chipset (DMI)</td></tr>'
    + '<tr><td>Ryzen 7000 (AM5)</td><td>28 (Gen 5/4 mix)</td><td>16 → GPU + 8 → 2× NVMe + 4 → chipset</td></tr>'
    + '<tr><td>Intel 13–14th gen</td><td>20 (Gen 5/4 mix)</td><td>16 → GPU + 4 → NVMe + DMI 4.0 x8 → chipset</td></tr>'
    + '<tr><td>Threadripper PRO</td><td>128 (Gen 4/5)</td><td>multi-GPU + many NVMe + 100 GbE NIC, etc.</td></tr>'
    + '</table>'
    + '<p>The chipset (B550, X670, Z790…) provides <em>additional</em> lanes — but they all share the chipset uplink (DMI on Intel, similar on AMD), so heavy concurrent use saturates that pipe.</p>'

    + '<h4>Bifurcation</h4>'
    + '<p>A x16 slot can sometimes be configured as 2× x8, or 4× x4 — that\'s "bifurcation." Used for: multi-GPU rigs, "quad NVMe" expansion cards. Requires CPU + BIOS support; not all consumer chips/boards permit it.</p>'

    + '<h4>The shared-M.2 trap</h4>'
    + '<p>Mid-range B550/B650 boards often have 2 M.2 slots: one wired direct to the CPU (Gen 4 x4 — fastest), one wired through the chipset (Gen 4 x4 but bottlenecked by chipset uplink). The second one might also be a "shared" slot — populating it disables PCIe slot #2, or drops the GPU slot from x16 to x8. <strong>Always read the motherboard manual\'s lane-sharing table before buying.</strong></p>'

    + '<h4>Does GPU at x8 vs x16 actually matter?</h4>'
    + '<p>Real benchmarks: Gen 4 x8 ≈ Gen 4 x16 within ~1–2% in games at 1440p/4K. The link is so fast relative to typical GPU PCIe traffic that you literally cannot saturate x8 in normal use. <em>Exception:</em> compute workloads that constantly stream data between system RAM and VRAM (some ML training, some video work) can lose 5–15% on x8.</p>'

    + '<div class="callout"><div class="label">A useful identity</div>'
    + '<strong>Gen N x M ≈ Gen (N-1) x 2M</strong> in bandwidth. So "Gen 3 x16" ≈ "Gen 4 x8" ≈ "Gen 5 x4." This is why a Gen 5 NVMe needs only 4 lanes to match a Gen 3 x16 GPU\'s peak bandwidth.'
    + '</div>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Pick a generation and lane count. See the bandwidth.</p>';

    var state = { gen: 4, lanes: 16 };
    var output = document.createElement('div'); output.className = 'formula-box';

    var row = document.createElement('div'); row.className = 'controls-row';
    var genSel = document.createElement('select');
    [1,2,3,4,5,6].forEach(function (g) { var o = document.createElement('option'); o.value=g; o.textContent='Gen '+g; genSel.appendChild(o); });
    genSel.value = state.gen;
    var laneSel = document.createElement('select');
    [1,2,4,8,16].forEach(function (n) { var o = document.createElement('option'); o.value=n; o.textContent='x'+n; laneSel.appendChild(o); });
    laneSel.value = state.lanes;

    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    row.appendChild(lbl('Generation:', genSel));
    row.appendChild(lbl('Lanes:', laneSel));

    function update() {
      state.gen = parseInt(genSel.value,10); state.lanes = parseInt(laneSel.value,10);
      var bw = hw.pcieBandwidthRounded(state.gen, state.lanes);
      var perLane = hw.pcieLaneMBps(state.gen);
      output.innerHTML =
        '<div class="info-line"><span class="key">Per-lane (one direction):</span> <span class="val">' + perLane + ' MB/s</span></div>' +
        '<div class="info-line"><span class="key">Total bandwidth (' + state.lanes + ' lanes):</span> <span class="val"><span class="result">' + bw + ' GB/s</span></span></div>' +
        '<div class="info-line muted">Equivalent: ' + equivalent(state.gen, state.lanes) + '</div>';
    }

    function equivalent(gen, lanes) {
      var pairs = [];
      var laneOpts = [1,2,4,8,16];
      for (var g = 1; g <= 6; g++) {
        for (var i = 0; i < laneOpts.length; i++) {
          var l = laneOpts[i];
          if (g === gen && l === lanes) continue;
          if (Math.abs(hw.pcieBandwidthGBps(g,l) - hw.pcieBandwidthGBps(gen,lanes)) < 0.1) {
            pairs.push('Gen ' + g + ' x' + l);
          }
        }
      }
      return pairs.length ? pairs.join(', ') + ' (same bandwidth)' : 'no consumer-typical equivalent';
    }

    genSel.addEventListener('change', update); laneSel.addEventListener('change', update);
    container.appendChild(row); container.appendChild(output);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the bandwidth of a <strong>PCIe Gen 4 x16</strong> link, in GB/s, rounded to the nearest whole number?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='GB/s';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // 1.969 * 16 = 31.5 → rounds to 32 (or 31 acceptable)
        if (v === 32 || v === 31) return { correct: true, feedback: 'Right. ~1.97 GB/s per lane × 16 = ~31.5 GB/s. (Exact decimal varies — 31.5 is the textbook value, 32 is the marketing round.)' };
        if (v === 16) return { correct: false, feedback: '16 GB/s is Gen 3 x16, not Gen 4. Each generation roughly doubles.' };
        return { correct: false, feedback: 'Per-lane Gen 4 ≈ 2 GB/s. × 16 = ~32 GB/s.' };
      },
      hints: [
        'Each PCIe generation doubles the previous.',
        'Gen 3 x16 = ~16 GB/s. So Gen 4 x16 = ~32 GB/s.',
        '32 (or 31.5).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You install a Gen 4 NVMe SSD into the second M.2 slot on a B550 board. The manual says: "M.2_2 shares lanes with PCIe x1_3; populating M.2_2 disables that slot. M.2_2 runs at PCIe Gen 3 x4." What\'s the maximum sequential read speed you can expect from this drive (the spec sheet says "up to 7,000 MB/s")?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='MB/s';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // Gen 3 x4 ≈ 3.94 GB/s ≈ 3940 MB/s. Accept 3500-4000.
        if (v >= 3500 && v <= 4000) return { correct: true, feedback: 'Right. PCIe Gen 3 x4 caps at ~3.9 GB/s ≈ 3,900 MB/s. The drive\'s "7,000 MB/s" rating requires Gen 4 x4 — the slot is the bottleneck. Always read your motherboard\'s lane sharing table.' };
        if (v >= 6500 && v <= 7500) return { correct: false, feedback: 'You\'d need Gen 4 x4 for 7,000 MB/s. The slot is Gen 3 x4 — half that bandwidth.' };
        return { correct: false, feedback: 'Gen 3 x4 ≈ 985 MB/s × 4 = ~3,940 MB/s. The drive caps there regardless of its "up to 7,000" rating.' };
      },
      hints: [
        'The drive can\'t go faster than the slot it\'s plugged into.',
        'Gen 3 x4 bandwidth: ~985 MB/s × 4 lanes.',
        '~3,900 MB/s.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A board has these CPU lane allocations (AM5, Ryzen 7000): "PCIE x16 → Gen 5 x16 (or x8 + x8 if M.2_1 is Gen 5)" and "M.2_1 → Gen 5 x4 (when set to Gen 5, GPU drops to x8)." If you populate M.2_1 with a Gen 5 NVMe, what is the resulting GPU link speed compared to Gen 5 x16, and is the practical gaming impact significant?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>GPU drops to Gen 5 x8 — equivalent bandwidth to Gen 4 x16, ~1–2% real-world impact</option>' +
          '<option>GPU drops to Gen 4 x16 — ~50% slower, severe impact</option>' +
          '<option>No change — bifurcation just splits unused lanes</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'GPU drops to Gen 5 x8 — equivalent bandwidth to Gen 4 x16, ~1–2% real-world impact') return { correct: true, feedback: 'Right. Gen 5 x16 = 63 GB/s, Gen 5 x8 = 31.5 GB/s = same as Gen 4 x16. Real-world game benchmarks consistently show 1–2% deltas at 1440p/4K because no current GPU even approaches saturating Gen 4 x16 in graphics workloads. Compute/ML workloads with heavy host↔device traffic are the exception. So: yes the lanes drop, no the FPS doesn\'t.' };
        if (v === 'GPU drops to Gen 4 x16 — ~50% slower, severe impact') return { correct: false, feedback: 'Lane count and generation are independent dials. Bifurcating Gen 5 x16 → Gen 5 x8/x8 keeps the same generation. Bandwidth halves on paper but games don\'t saturate it.' };
        if (v === 'No change — bifurcation just splits unused lanes') return { correct: false, feedback: 'Bifurcation IS reallocating active lanes. Half the GPU\'s lanes are reused for the M.2.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'When bifurcation is "x8 + x8," each side gets 8 lanes — the GPU now sees x8 instead of x16.',
        'But the generation is preserved. Gen 5 x8 = same bandwidth as Gen 4 x16.',
        'Real benchmarks: GPU bandwidth headroom in games is huge. ~1% impact at most.'
      ]
    }
  ]
});
