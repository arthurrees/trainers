// Level 2 — Memory (RAM)
HWT.registerLevel({
  id: 2,
  title: 'Memory & RAM',
  whyItMatters: 'RAM is the third leg of the CPU performance triangle (with cores and cache). For most workloads, the CPU is starving for data — the question isn\'t "how many GB" but "how fast does new data arrive at the cache." This level shows you how to compute that.',
  glossary: ['RAM', 'DRAM', 'DIMM', 'DDR', 'channel', 'CAS', 'XMP', 'IMC'],
  learn: ''
    + '<h4>What\'s on a DIMM</h4>'
    + '<p>A DIMM (Dual In-line Memory Module) is the physical RAM stick. On it: a row of DRAM chips wired to a 64-bit-wide bus that connects to one CPU memory channel. A consumer motherboard has <strong>2 channels</strong> (so 2 DIMMs run in dual-channel; 4 DIMMs share those 2 channels two-up).</p>'

    + '<h4>DDR generations</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Generation</th><th>Years</th><th>Typical speed</th><th>Voltage</th><th>Notes</th></tr>'
    + '<tr><td>DDR3</td><td>2007–2018</td><td>1333–2133 MT/s</td><td>1.5 V</td><td>Legacy. Boards before AM4 / LGA1151.</td></tr>'
    + '<tr><td>DDR4</td><td>2014–still common</td><td>2400–4000 MT/s</td><td>1.2 V</td><td>AM4 (Ryzen 1000–5000), LGA1151/1200/1700-DDR4.</td></tr>'
    + '<tr><td>DDR5</td><td>2021–now</td><td>4800–8000+ MT/s</td><td>1.1 V</td><td>AM5, LGA1700-DDR5, LGA1851. On-DIMM PMIC, two 32-bit subchannels per stick.</td></tr>'
    + '</table>'
    + '<p>DDR generations are <strong>not interchangeable</strong>. The notch in the slot is in a different place. The CPU\'s integrated memory controller (IMC) decides which one you can use.</p>'

    + '<h4>"MT/s" vs "MHz" — the favorite gotcha</h4>'
    + '<p>DDR = "double data rate." It transfers data on both rising and falling edges of the clock. So DDR4-3200 means:</p>'
    + '<ul>'
    +   '<li><strong>3200 MT/s</strong> (mega-transfers per second) — the headline marketing number.</li>'
    +   '<li><strong>1600 MHz</strong> actual clock frequency.</li>'
    + '</ul>'
    + '<p>HWInfo shows "1600 MHz" and people panic. The MT/s is right.</p>'

    + '<h4>Bandwidth math</h4>'
    + '<div class="formula-box">Bandwidth (GB/s) = channels × MT/s × 8 bytes / 1000</div>'
    + '<p>Examples:</p>'
    + '<ul>'
    +   '<li>DDR4-3200, dual channel: 2 × 3200 × 8 / 1000 = <strong>51.2 GB/s</strong></li>'
    +   '<li>DDR5-6000, dual channel: 2 × 6000 × 8 / 1000 = <strong>96.0 GB/s</strong></li>'
    +   '<li>DDR4-3200, single channel (one stick): 25.6 GB/s — half of dual</li>'
    + '</ul>'
    + '<p>Going from single-channel to dual-channel is the single biggest free RAM upgrade — it literally doubles bandwidth. <em>Always</em> install RAM in matched pairs in the colored slots the manual specifies.</p>'

    + '<h4>CAS latency (CL)</h4>'
    + '<p>CL is the number of <em>cycles</em> between asking for data and getting it. Lower is better. But cycles aren\'t time — you have to convert:</p>'
    + '<div class="formula-box">latency (ns) = (CL × 2 / MT-per-second) × 1000<br>'
    + 'or equivalently: <span class="result">latency (ns) = CL × 2000 / MT/s</span></div>'
    + '<p>Examples:</p>'
    + '<ul>'
    +   '<li>DDR4-3200 CL16: 16 × 2000 / 3200 = <strong>10.0 ns</strong></li>'
    +   '<li>DDR4-3600 CL18: 18 × 2000 / 3600 = <strong>10.0 ns</strong></li>'
    +   '<li>DDR5-6000 CL30: 30 × 2000 / 6000 = <strong>10.0 ns</strong></li>'
    + '</ul>'
    + '<p>Notice all three are ~10 ns. <strong>True latency hasn\'t improved much in a decade</strong> — DDR generations buy bandwidth, not access time. CPU caches and prefetchers hide most of the latency anyway.</p>'

    + '<h4>XMP / DOCP / EXPO</h4>'
    + '<p>RAM ships rated for, say, "DDR4-3600 CL16" — but JEDEC spec only requires it to run at, say, 2666 MT/s by default. The manufacturer programs an <strong>XMP profile</strong> (Intel) / DOCP (older AMD) / EXPO (Ryzen 7000+) onto the DIMM\'s SPD chip. You enable it in BIOS, and the board configures the IMC to the rated speed. <em>If you don\'t enable XMP, your fast RAM runs slow.</em> This is the most common "I bought 3600 MT/s RAM but it\'s only 2133" newbie mistake.</p>'

    + '<h4>Why 4 DIMMs often runs slower than 2</h4>'
    + '<p>The IMC has to drive twice as many electrical loads. Most consumer CPUs cannot run 4 sticks at the rated XMP speed of fast kits. AMD Ryzen 5000, for example, often drops from "3600 MT/s 1:1" to "2933 MT/s" with 4 sticks. Two sticks of 16 GB > four sticks of 8 GB, all else equal.</p>'

    + '<div class="callout"><div class="label">When does RAM speed actually matter?</div>'
    + 'Heavy: gaming (especially 1% lows), AMD Ryzen anything (the Infinity Fabric runs synchronously with RAM up to ~3600 MT/s on Zen 3, ~6000 MT/s on Zen 4), data-streaming code (memcpy, image processing, in-memory DBs).<br>'
    + 'Light: most office work, web browsing, general compile speed.'
    + '</div>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Slide the dials. Watch bandwidth and latency change in real time.</p>';

    var state = { gen: 'DDR4', mts: 3200, cl: 16, channels: 2 };

    var row1 = document.createElement('div'); row1.className = 'controls-row';
    var row2 = document.createElement('div'); row2.className = 'controls-row';
    var output = document.createElement('div'); output.className = 'formula-box';

    function genSelect() {
      var sel = document.createElement('select');
      ['DDR3','DDR4','DDR5'].forEach(function (g) {
        var o = document.createElement('option'); o.value = g; o.textContent = g; sel.appendChild(o);
      });
      sel.value = state.gen;
      sel.addEventListener('change', function () {
        state.gen = sel.value;
        // sensible defaults per gen
        if (state.gen === 'DDR3') { state.mts = 1600; mtsInp.value = 1600; }
        if (state.gen === 'DDR4') { state.mts = 3200; mtsInp.value = 3200; }
        if (state.gen === 'DDR5') { state.mts = 6000; mtsInp.value = 6000; }
        update();
      });
      return sel;
    }

    var genSel = genSelect();
    var mtsInp = document.createElement('input'); mtsInp.type='number'; mtsInp.value = state.mts; mtsInp.step = 100; mtsInp.min = 800; mtsInp.max = 8400;
    var clInp  = document.createElement('input'); clInp.type='number'; clInp.value = state.cl; clInp.min = 8; clInp.max = 60;
    var chSel  = document.createElement('select');
    [1,2,4].forEach(function (n) {
      var o = document.createElement('option'); o.value=n; o.textContent = n + '-channel'; chSel.appendChild(o);
    });
    chSel.value = state.channels;

    [mtsInp, clInp, chSel].forEach(function (el) {
      el.addEventListener('input', function () {
        state.mts = parseInt(mtsInp.value,10) || 0;
        state.cl = parseInt(clInp.value,10) || 0;
        state.channels = parseInt(chSel.value,10) || 1;
        update();
      });
    });

    function lbl(text, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(text + ' ')); l.appendChild(el); return l; }
    row1.appendChild(lbl('Generation:', genSel));
    row1.appendChild(lbl('MT/s:', mtsInp));
    row2.appendChild(lbl('CL:', clInp));
    row2.appendChild(lbl('Channels:', chSel));

    function update() {
      var bw = hw.memBandwidthGBps(state.channels, state.mts);
      var latency = state.cl * 2000 / state.mts;
      output.innerHTML =
        '<div class="info-line"><span class="key">Bandwidth:</span> <span class="val">' +
          state.channels + ' × ' + state.mts + ' × 8 / 1000 = <span class="result">' + (Math.round(bw*10)/10) + ' GB/s</span></span></div>' +
        '<div class="info-line"><span class="key">Latency:</span> <span class="val">' +
          state.cl + ' × 2000 / ' + state.mts + ' = <span class="result">' + (Math.round(latency*10)/10) + ' ns</span></span></div>' +
        '<div class="info-line muted">(true latency barely moves across DDR3→DDR5; bandwidth scales linearly with MT/s and channels.)</div>';
    }
    update();

    container.appendChild(row1);
    container.appendChild(row2);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A kit is sold as "DDR5-6400". What is the actual <em>clock frequency</em> of the chips in MHz?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type = 'number'; inp.placeholder = 'MHz';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 3200) return { correct: true, feedback: 'Right. DDR is "double data rate" — transfers on both clock edges. 6400 MT/s = 3200 MHz actual clock.' };
        if (v === 6400) return { correct: false, feedback: '6400 is MT/s (mega-transfers/sec), not MHz. Halve it.' };
        return { correct: false, feedback: 'MT/s = 2 × clock_MHz. So clock = MT/s / 2 = 3200 MHz.' };
      },
      hints: [
        'DDR doubles the transfer rate vs the actual clock.',
        'MT/s = 2 × clock.',
        '6400 / 2 = 3200 MHz.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Compute the dual-channel bandwidth of <strong>DDR4-3600</strong>. Use <code>bw = channels × MT/s × 8 / 1000</code>. Answer in GB/s, rounded to 1 decimal.',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type = 'number'; inp.step = '0.1'; inp.placeholder = 'GB/s';
        c.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        // 2 * 3600 * 8 / 1000 = 57.6
        if (Math.abs(v - 57.6) <= 0.2) return { correct: true, feedback: 'Right. 2 × 3600 × 8 / 1000 = 57.6 GB/s. Compare to DDR5-6000 dual at 96 GB/s — DDR5 is +67% bandwidth.' };
        if (Math.abs(v - 28.8) <= 0.2) return { correct: false, feedback: 'That\'s single-channel. The question asks dual.' };
        return { correct: false, feedback: '2 × 3600 × 8 / 1000 = 57.6 GB/s.' };
      },
      hints: [
        'Plug the formula. channels = 2, MT/s = 3600.',
        '2 × 3600 = 7200. × 8 = 57,600. ÷ 1000 = 57.6.',
        '57.6 GB/s.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You can buy either of these DDR5 kits, both for the same price:<br><br>' +
        '<strong>Kit A:</strong> DDR5-6000 CL30<br>' +
        '<strong>Kit B:</strong> DDR5-7200 CL36<br><br>' +
        'For a Ryzen 7000-series CPU (Infinity Fabric runs 1:1 only up to about 6000–6200 MT/s; above that you incur a fabric-divider penalty), which is the <strong>better</strong> choice?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Kit A — 6000 CL30</option>' +
          '<option>Kit B — 7200 CL36</option>' +
          '<option>Tied — same true latency, same effective bandwidth</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Kit A — 6000 CL30') return { correct: true, feedback: 'Right. Both kits have ~10 ns true latency (30·2000/6000 = 10; 36·2000/7200 = 10) — so the only differentiator is bandwidth, AND on Ryzen 7000 you can\'t actually run 7200 in the sweet spot. The IF clock would have to drop to 1:2, hurting effective performance more than the raw MT/s gain. 6000 CL30 is the universally recommended Ryzen 7000 sweet spot for exactly this reason.' };
        if (v === 'Kit B — 7200 CL36') return { correct: false, feedback: 'Higher MT/s only wins if your platform can use it 1:1. Ryzen 7000\'s Infinity Fabric maxes out around 6000–6200 MT/s in 1:1 mode. Going higher forces a 1:2 divider, which actually loses ground.' };
        if (v === 'Tied — same true latency, same effective bandwidth') return { correct: false, feedback: 'Same true latency, yes. But not same effective bandwidth on Ryzen 7000 — the 1:2 fabric divider on the 7200 kit costs more than the raw MT/s gain.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'First check true latency: CL × 2000 / MT/s for each kit.',
        'Both kits = exactly 10.0 ns true latency. Same.',
        'Differentiator is bandwidth — but Ryzen 7000\'s Infinity Fabric drops to 1:2 above ~6200 MT/s, costing more than the bandwidth gained. 6000 CL30 wins.'
      ]
    }
  ]
});
