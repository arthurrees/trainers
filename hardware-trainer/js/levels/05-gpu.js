// Level 5 — GPU
HWT.registerLevel({
  id: 5,
  title: 'GPU — VRAM, Bandwidth, Power',
  whyItMatters: 'A GPU spec sheet is dense. The three numbers that mostly determine real performance are: how many SMs/CUDA cores, how much VRAM, and how fast the VRAM is (memory bandwidth). The user\'s RTX 3070 has 5,888 CUDA cores, 8 GB GDDR6, and 448 GB/s memory bandwidth — all three matter for different workloads.',
  glossary: ['GPU', 'VRAM', 'CUDA', 'TGP', '12VHPWR', 'PCIe'],
  learn: ''
    + '<h4>What\'s on a GPU board</h4>'
    + '<p>A discrete GPU is essentially a self-contained computer that plugs into the motherboard via PCIe and gets power from the PSU. On the board:</p>'
    + '<ul>'
    +   '<li><strong>The GPU die</strong> — thousands of tiny ALU cores grouped into "SMs" (NVIDIA) or "CUs" (AMD).</li>'
    +   '<li><strong>VRAM</strong> — fast video memory soldered around the GPU die (GDDR6, GDDR6X, GDDR7, or HBM on some workstation cards).</li>'
    +   '<li><strong>VRMs</strong> — power delivery for the GPU die; another set for VRAM.</li>'
    +   '<li><strong>Display outputs</strong> — usually 3× DisplayPort + 1× HDMI on consumer cards.</li>'
    +   '<li><strong>Power connectors</strong> — 1–3× 8-pin PCIe (older) or 1× 12VHPWR / 12V-2x6 (RTX 30/40/50 era).</li>'
    + '</ul>'

    + '<h4>The three numbers that drive performance</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Card</th><th>Cores</th><th>VRAM</th><th>Mem bandwidth</th><th>TGP</th></tr>'
    + '<tr><td>RTX 3070 (user\'s card)</td><td>5,888</td><td>8 GB GDDR6</td><td>448 GB/s</td><td>220 W</td></tr>'
    + '<tr><td>RTX 4060 Ti 8 GB</td><td>4,352</td><td>8 GB GDDR6</td><td>288 GB/s</td><td>160 W</td></tr>'
    + '<tr><td>RTX 4070</td><td>5,888</td><td>12 GB GDDR6X</td><td>504 GB/s</td><td>200 W</td></tr>'
    + '<tr><td>RTX 4090</td><td>16,384</td><td>24 GB GDDR6X</td><td>1008 GB/s</td><td>450 W</td></tr>'
    + '</table>'
    + '<p>Notice the 4060 Ti has fewer cores AND less bandwidth than the 3070 — it\'s a weaker raster card despite being a generation newer. Generation alone doesn\'t imply better; tier within the lineup matters more.</p>'

    + '<h4>VRAM — when 8 GB stops being enough</h4>'
    + '<p>VRAM holds: framebuffers, depth buffers, textures, geometry, shader code, and (for ML) model weights + activations + KV cache. Once you exceed VRAM, the driver either:</p>'
    + '<ul>'
    +   '<li>Spills to system RAM via PCIe — 10–100× slower. Frame times collapse.</li>'
    +   '<li>(For ML) refuses to allocate — out-of-memory, training/inference dies.</li>'
    + '</ul>'
    + '<p>In 2026, 8 GB is comfortable for 1080p / 1440p gaming, marginal at 4K / max textures, and tight for many ML models above ~7B params at FP16.</p>'

    + '<h4>Memory bandwidth — the underrated number</h4>'
    + '<p>VRAM bandwidth = bus_width × effective_speed / 8.</p>'
    + '<div class="formula-box">RTX 3070: 256-bit bus × 14 Gbps / 8 = <span class="result">448 GB/s</span></div>'
    + '<p>For shading-heavy and ML workloads, you\'re often bandwidth-bound, not compute-bound. The "core count" matters less than how fast you can stream weights/activations through them. This is why the 4060 Ti (288 GB/s, narrow 128-bit bus) struggles vs the 3070 in some workloads — the cores can\'t be fed.</p>'

    + '<h4>VRAM math for ML inference</h4>'
    + '<p>For a transformer LLM at inference:</p>'
    + '<div class="formula-box">VRAM ≈ params × bytes_per_param + KV cache + working buffers</div>'
    + '<ul>'
    +   '<li>FP32 = 4 bytes/param. 7B params × 4 = 28 GB. <em>Won\'t fit on most consumer GPUs.</em></li>'
    +   '<li>FP16 = 2 bytes/param. 7B × 2 = 14 GB. Fits a 16 GB GPU; tight on 12 GB.</li>'
    +   '<li>INT8 = 1 byte/param. 7B × 1 = 7 GB. Fits an 8 GB card. Quality drop ~marginal.</li>'
    +   '<li>Q4_K_M (~4.5 bits/param) ≈ 0.56 bytes. 7B × 0.56 ≈ 4 GB. Plenty of room on 8 GB.</li>'
    + '</ul>'
    + '<div class="example"><div class="label">User\'s rig: RTX 3070 8 GB running a 7B model</div>FP16 (14 GB) doesn\'t fit. Q4_K_M (~4 GB) fits with plenty of room for KV cache. This is why local LLMs on a 3070 typically run 4–5 bit quants — the math forces it. (Covered in depth in <code>ai-trainer</code> level 18.)</div>'

    + '<h4>TGP, TBP, and the 12VHPWR connector</h4>'
    + '<p>TGP = Total Graphics Power, TBP = Total Board Power. Same idea: what the whole card draws under load.</p>'
    + '<ul>'
    +   '<li>RTX 3070 FE: 220 W TGP, 1× 12VHPWR (or 1× 8-pin via adapter on launch units)</li>'
    +   '<li>RTX 4090 FE: 450 W TGP, 1× 12VHPWR rated for 600 W</li>'
    + '</ul>'
    + '<p>The 12VHPWR / 12V-2x6 connector is a 16-pin (12 power + 4 sense) connector that carries up to 600 W on a single cable. Early units had melting issues if not seated fully — the 12V-2x6 revision shortened the sense pins so a partially-seated connector triggers a fault rather than running a poor connection. <strong>Push it in until you hear a click and the latch engages.</strong></p>'

    + '<h4>Transient spikes</h4>'
    + '<p>Modern GPUs (especially Ampere/Ada) draw 1.5–2× their average TGP for ~1–10 ms during scene transitions. A 220 W RTX 3070 can briefly pull 300+ W. A weak PSU shuts down on these spikes even though the average draw "fits." Quality matters more than max watts. This is why Corsair RM-series, Seasonic Focus/PRIME, and similar tier-A units are recommended.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a model size and precision to see whether it fits 8 GB of VRAM (the user\'s RTX 3070).</p>';

    var modelSel = document.createElement('select');
    [{n:'1B',p:1e9},{n:'3B',p:3e9},{n:'7B',p:7e9},{n:'13B',p:13e9},{n:'34B',p:34e9},{n:'70B',p:70e9}].forEach(function (m) {
      var o = document.createElement('option'); o.value = m.p; o.textContent = m.n + ' params'; modelSel.appendChild(o);
    });
    modelSel.value = 7e9;

    var precSel = document.createElement('select');
    var precs = [
      { n: 'FP32 (4 bytes/param)', b: 4.0 },
      { n: 'FP16 / BF16 (2 bytes)', b: 2.0 },
      { n: 'INT8 (1 byte)',          b: 1.0 },
      { n: 'Q5_K_M (~5.5 bits)',     b: 0.69 },
      { n: 'Q4_K_M (~4.5 bits)',     b: 0.56 },
      { n: 'Q3_K_M (~3.4 bits)',     b: 0.43 }
    ];
    precs.forEach(function (p) { var o = document.createElement('option'); o.value=p.b; o.textContent=p.n; precSel.appendChild(o); });
    precSel.value = 0.56;

    var ctxSel = document.createElement('select');
    ['2048','4096','8192','32768','128000'].forEach(function (n) { var o = document.createElement('option'); o.value=n; o.textContent=n+' tok ctx'; ctxSel.appendChild(o); });
    ctxSel.value = '4096';

    var output = document.createElement('div'); output.className = 'formula-box';
    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    var row = document.createElement('div'); row.className='controls-row';
    row.appendChild(lbl('Model:', modelSel));
    row.appendChild(lbl('Precision:', precSel));
    row.appendChild(lbl('Context:', ctxSel));

    function update() {
      var params = parseFloat(modelSel.value);
      var bytes = parseFloat(precSel.value);
      var ctx = parseInt(ctxSel.value, 10);
      var weightsGB = params * bytes / 1e9;
      // Rough KV cache: 2 (K,V) * num_layers * num_kv_heads * head_dim * ctx * 2 bytes (FP16)
      // Use a heuristic: KV cache ≈ 0.0005 GB per param per 4k context (very rough).
      var kvGB = (params / 1e9) * (ctx / 4096) * 0.05;
      var workingGB = 0.5;
      var total = weightsGB + kvGB + workingGB;
      var fitsOn = total <= 8 ? 'good' : (total <= 12 ? 'warn' : 'bad');
      var verdict = total <= 8 ? '✓ Fits on RTX 3070 (8 GB)' :
                    total <= 12 ? '⚠ Needs 12 GB+ (RTX 4070, 3060 12 GB)' :
                    total <= 16 ? '⚠ Needs 16 GB (4060 Ti 16 GB, A4000)' :
                    total <= 24 ? '⚠ Needs 24 GB (RTX 3090/4090, A5000)' :
                    '✗ Beyond a single consumer card';
      output.innerHTML =
        '<div class="info-line"><span class="key">Weights:</span> <span class="val">' + (Math.round(weightsGB*10)/10) + ' GB</span></div>' +
        '<div class="info-line"><span class="key">KV cache (rough):</span> <span class="val">' + (Math.round(kvGB*10)/10) + ' GB</span></div>' +
        '<div class="info-line"><span class="key">Working buffers:</span> <span class="val">~0.5 GB</span></div>' +
        '<div class="info-line"><span class="key">Total VRAM needed:</span> <span class="val"><span class="result" style="color:var(--' + fitsOn + ')">' + (Math.round(total*10)/10) + ' GB</span> — ' + verdict + '</span></div>';
    }

    [modelSel, precSel, ctxSel].forEach(function (el) { el.addEventListener('change', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A GPU advertises "256-bit memory bus, 16 Gbps GDDR6." Compute its memory bandwidth in GB/s.',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='GB/s';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // 256 / 8 * 16 = 512 GB/s
        if (v === 512) return { correct: true, feedback: 'Right. 256 bits / 8 bits/byte = 32 bytes/transfer. × 16 G transfers/s = 512 GB/s.' };
        return { correct: false, feedback: 'bus_bits / 8 × Gbps. 256 / 8 = 32. × 16 = 512 GB/s.' };
      },
      hints: [
        'Convert bus width from bits to bytes: divide by 8.',
        '256 bits ÷ 8 = 32 bytes per transfer.',
        '32 bytes × 16 Gbps = 512 GB/s.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You have a 13B-parameter LLM and want to run it on the user\'s RTX 3070 (8 GB VRAM). Which precision is the lightest one that <strong>does NOT fit</strong> in the 8 GB VRAM (assume ~0.5 GB overhead for KV cache + buffers)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>FP16 (2 bytes/param)</option>' +
          '<option>INT8 (1 byte/param)</option>' +
          '<option>Q4_K_M (~0.56 bytes/param)</option>' +
          '<option>Q3_K_M (~0.43 bytes/param)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // 13B at: FP16 = 26 GB; INT8 = 13 GB; Q4 = 7.3 GB; Q3 = 5.6 GB
        // 8 GB cap with ~0.5 GB overhead → must fit in ~7.5 GB
        // FP16: doesn't fit. INT8: doesn't fit. Q4: borderline (~7.8 — doesn't fit). Q3: fits.
        // The "lightest one that does NOT fit" → INT8? Wait check: Q4 doesn't fit either at 7.3 + 0.5 = 7.8 > 7.5? Hmm depends. Let's nail down:
        // 13e9 * 0.56 = 7.28 GB. + 0.5 = 7.78 GB. That's < 8 GB → fits!
        // So Q4 fits, INT8 doesn't (13 + 0.5 = 13.5).
        // Lightest that doesn't fit = INT8.
        if (v === 'INT8 (1 byte/param)') return { correct: true, feedback: 'Right. 13B × 1 byte = 13 GB weights + 0.5 GB ≈ 13.5 GB. Doesn\'t fit in 8 GB. Q4_K_M is 13B × 0.56 ≈ 7.3 GB + 0.5 = 7.8 GB — fits. So INT8 is the lightest precision that overflows. (This is exactly why the 4–5 bit quants dominate consumer LLM hosting.)' };
        if (v === 'FP16 (2 bytes/param)') return { correct: false, feedback: 'FP16 doesn\'t fit either, but it\'s not the LIGHTEST one that doesn\'t fit. Check INT8.' };
        if (v === 'Q4_K_M (~0.56 bytes/param)') return { correct: false, feedback: '13B × 0.56 = 7.3 GB. + 0.5 GB overhead = 7.8 GB. That\'s under 8 GB, so Q4 actually fits.' };
        if (v === 'Q3_K_M (~0.43 bytes/param)') return { correct: false, feedback: 'Q3 is even smaller — definitely fits.' };
        return { correct: false, feedback: 'Compute weight size for each: 13e9 × bytes_per_param.' };
      },
      hints: [
        'For each precision, compute 13e9 × bytes/param + 0.5 GB. Compare to 8 GB.',
        'FP16 = 26.5 GB (doesn\'t fit). INT8 = 13.5 GB (doesn\'t fit). Q4 = 7.8 GB (fits).',
        'Lightest that doesn\'t fit = INT8.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re comparing two GPUs for an ML training workload that\'s memory-bandwidth-bound (each forward pass streams ~10 GB of weights). Card A: 256-bit bus, 14 Gbps, 5,888 cores. Card B: 192-bit bus, 21 Gbps, 7,680 cores. Which gives you faster <strong>steps per second</strong> and why?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Card A — its 256-bit bus + lower clocks beat the narrower bus</option>' +
          '<option>Card B — more cores AND higher clocks mean more compute, narrower bus doesn\'t matter</option>' +
          '<option>Tied — bandwidth is essentially equal</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // A: 256/8 * 14 = 448 GB/s. B: 192/8 * 21 = 504 GB/s.
        if (v === 'Tied — bandwidth is essentially equal') return { correct: false, feedback: 'Compute the bandwidth: A = 256/8 × 14 = 448 GB/s. B = 192/8 × 21 = 504 GB/s. Not tied — B is ~12% faster.' };
        if (v === 'Card B — more cores AND higher clocks mean more compute, narrower bus doesn\'t matter') return { correct: true, feedback: 'Right, but the reasoning is subtler than "more cores." A: 256/8 × 14 = 448 GB/s. B: 192/8 × 21 = 504 GB/s. The narrower bus on B is more than offset by faster GDDR (21 vs 14 Gbps). Memory-bandwidth-bound work cares about GB/s end-to-end. B wins ~12% on bandwidth alone, plus has more cores. Lesson: bus width AND speed both contribute — don\'t fixate on one number.' };
        if (v === 'Card A — its 256-bit bus + lower clocks beat the narrower bus') return { correct: false, feedback: 'Bus width is half the story. The product (bits × Gbps / 8) is bandwidth. A = 448 GB/s, B = 504 GB/s. B wins.' };
        return { correct: false, feedback: 'Compute bandwidth = (bus_bits / 8) × Gbps for each.' };
      },
      hints: [
        'For memory-bandwidth-bound work, the relevant metric is GB/s, not core count.',
        'Bandwidth = (bus_bits / 8) × Gbps. Compute for each card.',
        'A = 448 GB/s, B = 504 GB/s. B wins by ~12%.'
      ]
    }
  ]
});
