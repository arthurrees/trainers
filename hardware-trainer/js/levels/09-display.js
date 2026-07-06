// Level 9 — Display pipeline
HWT.registerLevel({
  id: 9,
  title: 'Display Pipeline',
  whyItMatters: 'A monitor\'s spec sheet looks simple — "4K @ 144 Hz, HDR" — but whether you can actually drive it depends on the cable bandwidth, the GPU\'s output port version, color depth, and (sometimes) Display Stream Compression. This level teaches the bandwidth math so you can stop guessing if "DP 1.4 supports 4K @ 240."',
  glossary: ['DP', 'HDMI', 'refresh rate', 'bpc', 'DSC'],
  learn: ''
    + '<h4>The pipeline</h4>'
    + '<p>From GPU to your eye:</p>'
    + '<ol>'
    +   '<li>GPU renders frames into a framebuffer in VRAM.</li>'
    +   '<li>The display engine reads each frame, applies the format (8/10-bit RGB, YCbCr, etc.), and serializes onto DP/HDMI.</li>'
    +   '<li>Cable carries bits to the monitor.</li>'
    +   '<li>Monitor\'s scaler/timing controller drives the panel.</li>'
    + '</ol>'
    + '<p>Any link in this chain that can\'t carry the demanded bits/sec breaks the chain. Either the system silently downgrades (drops bit depth, drops refresh, blurs via chroma subsampling) or the monitor goes blank.</p>'

    + '<h4>Bandwidth math</h4>'
    + '<p>An uncompressed RGB stream needs:</p>'
    + '<div class="formula-box">bits/sec = width × height × refresh × bits_per_pixel</div>'
    + '<p>Where bits_per_pixel = 3 × bits_per_channel (RGB). 8 bpc = 24 bpp; 10 bpc HDR = 30 bpp.</p>'
    + '<p>Real cables add overhead (encoding, control). Adding ~25% gives a realistic required link bandwidth.</p>'
    + '<div class="example"><div class="label">4K @ 60 Hz, 8 bpc</div>3840 × 2160 × 60 × 24 = 11.94 Gbps. With overhead: ~14.9 Gbps. → just barely fits HDMI 2.0 (14.4 Gbps payload, ~17.8 Gbps signal). DP 1.4 (25.92 Gbps payload) handles it easily.</div>'

    + '<h4>Connector versions</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Connector</th><th>Year</th><th>Payload (uncompressed)</th><th>Headline use</th></tr>'
    + '<tr><td>HDMI 1.4</td><td>2009</td><td>8.16 Gbps</td><td>1080p @ 120 Hz, 4K @ 30 Hz</td></tr>'
    + '<tr><td>HDMI 2.0</td><td>2013</td><td>14.4 Gbps</td><td>4K @ 60 Hz</td></tr>'
    + '<tr><td>HDMI 2.1</td><td>2017</td><td>42.6 Gbps (FRL)</td><td>4K @ 120 Hz, 8K @ 60 Hz (with DSC)</td></tr>'
    + '<tr><td>DP 1.2</td><td>2010</td><td>17.28 Gbps</td><td>4K @ 60 Hz</td></tr>'
    + '<tr><td>DP 1.4</td><td>2016</td><td>25.92 Gbps</td><td>4K @ 120 Hz, 4K @ 240 Hz with DSC</td></tr>'
    + '<tr><td>DP 2.1 UHBR10</td><td>2022</td><td>38.69 Gbps</td><td>4K @ 240 Hz uncompressed (almost)</td></tr>'
    + '<tr><td>DP 2.1 UHBR20</td><td>2022</td><td>77.37 Gbps</td><td>8K @ 60 Hz uncompressed; 4K @ 480 Hz</td></tr>'
    + '</table>'
    + '<p>Note: <strong>"DP 1.4" or "HDMI 2.1" labels do not always mean full bandwidth.</strong> Some devices support the version but only a subset of features. Read the spec sheet, especially for HDMI 2.1 — many cheap monitors and TVs implement only a 24 Gbps subset and call it "HDMI 2.1."</p>'

    + '<h4>Display Stream Compression (DSC)</h4>'
    + '<p>DSC is a visually-lossless 2:1 to 3:1 compression standard built into DP 1.4+ and HDMI 2.1. It\'s how monitors hit "4K @ 240 Hz HDR" over a single DP 1.4 cable that "shouldn\'t" have the bandwidth. Tradeoffs:</p>'
    + '<ul>'
    +   '<li>Visually lossless — designed to be impossible to distinguish from uncompressed.</li>'
    +   '<li>Adds 1 frame of latency in the encoder, similar in the decoder. Negligible for most users.</li>'
    +   '<li>Some early DSC implementations had blackscreen issues during HDR mode switches.</li>'
    + '</ul>'

    + '<h4>Refresh rate, motion smoothness, and the eye</h4>'
    + '<ul>'
    +   '<li><strong>60 Hz</strong> — the floor for usable; most office monitors. Mouse motion noticeably stutters compared to higher.</li>'
    +   '<li><strong>120/144 Hz</strong> — the "everyday smooth" tier. Typical for gaming. You feel the difference scrolling and dragging windows.</li>'
    +   '<li><strong>240 Hz</strong> — competitive gaming. Returns diminish but still detectable for most.</li>'
    +   '<li><strong>360–480 Hz</strong> — esports tier. Marginal returns; you\'re paying for milliseconds of perceived input lag.</li>'
    + '</ul>'

    + '<h4>FreeSync / G-Sync (adaptive sync)</h4>'
    + '<p>Without adaptive sync: the GPU outputs frames at, say, 91 fps; the monitor refreshes at 144 Hz. Misaligned frames cause "tearing" (a horizontal split where two frames are shown at once). V-Sync fixes tearing but adds latency.</p>'
    + '<p>Adaptive sync makes the monitor\'s refresh rate match the GPU\'s frame rate dynamically. No tearing, no v-sync latency. Two ecosystems:</p>'
    + '<ul>'
    +   '<li><strong>FreeSync</strong> — AMD\'s open standard built on DP\'s built-in support. Works on most modern AMD and NVIDIA GPUs. Most monitors support it.</li>'
    +   '<li><strong>G-Sync (NVIDIA)</strong> — proprietary module in the monitor; pricier. "G-Sync Compatible" is FreeSync rebadged after NVIDIA opened up.</li>'
    + '</ul>'

    + '<h4>Color depth and HDR</h4>'
    + '<p>SDR 8-bit RGB (16.7M colors) is the default; HDR generally needs 10-bit (1.07B colors) — 24 bpp vs 30 bpp. Bandwidth cost: 25% more. HDR also requires the monitor to actually have the contrast and brightness to render it (HDR400/HDR600/HDR1000 certifications gate this — most "HDR" monitors are weak HDR400, almost not worth the hassle).</p>'

    + '<div class="callout"><div class="label">Why your monitor goes blank when you change resolutions</div>'
    + 'Most modern monitors negotiate a maximum supported timing on hot-plug (EDID). Configure something the cable can\'t carry, and the link drops. Windows usually reverts after 15 sec. Mac and Linux can require a manual override.'
    + '</div>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Pick a resolution + refresh + color depth. See whether each link version can carry it.</p>';

    var presets = [
      { w: 1920, h: 1080, hz: 60,  bpc: 8 },
      { w: 1920, h: 1080, hz: 144, bpc: 8 },
      { w: 2560, h: 1440, hz: 144, bpc: 8 },
      { w: 3840, h: 2160, hz: 60,  bpc: 8 },
      { w: 3840, h: 2160, hz: 120, bpc: 10 },
      { w: 3840, h: 2160, hz: 240, bpc: 10 },
      { w: 7680, h: 4320, hz: 60,  bpc: 10 }
    ];
    var state = { p: 3 };

    var presetSel = document.createElement('select');
    presets.forEach(function (p, i) {
      var o = document.createElement('option'); o.value = i;
      o.textContent = p.w + '×' + p.h + ' @ ' + p.hz + ' Hz, ' + p.bpc + ' bpc' + (p.bpc >= 10 ? ' (HDR)' : '');
      presetSel.appendChild(o);
    });
    presetSel.value = state.p;

    var output = document.createElement('div'); output.className = 'formula-box';

    function update() {
      var p = presets[parseInt(presetSel.value, 10)];
      var bpp = p.bpc * 3;
      var raw = p.w * p.h * p.hz * bpp / 1e9;
      var withOH = raw * 1.25;
      var rows = '';
      Object.keys(hw.DISPLAY_LINKS).forEach(function (k) {
        var cap = hw.DISPLAY_LINKS[k];
        var ok = withOH <= cap ? '✓' : '✗';
        var color = withOH <= cap ? 'good' : 'bad';
        rows += '<div class="info-line"><span class="key">' + k + ' (' + cap + ' Gbps):</span> <span class="val" style="color:var(--' + color + ')">' + ok + (withOH > cap ? ' — needs DSC' : '') + '</span></div>';
      });
      output.innerHTML =
        '<div class="info-line"><span class="key">Raw bits/sec:</span> <span class="val">' + p.w + ' × ' + p.h + ' × ' + p.hz + ' × ' + bpp + ' = ' + (Math.round(raw*10)/10) + ' Gbps</span></div>' +
        '<div class="info-line"><span class="key">With ~25% overhead:</span> <span class="val"><span class="result">' + (Math.round(withOH*10)/10) + ' Gbps required</span></span></div>' +
        '<hr style="border-color:var(--border);margin:10px 0">' +
        rows;
    }
    presetSel.addEventListener('change', update);
    update();
    var row = document.createElement('div'); row.className = 'controls-row';
    var lbl = document.createElement('label'); lbl.appendChild(document.createTextNode('Format: ')); lbl.appendChild(presetSel);
    row.appendChild(lbl);
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Compute the raw bandwidth (in Gbps, no overhead) for <strong>1920 × 1080 @ 144 Hz, 8 bpc</strong>. Round to 1 decimal.',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.step='0.1'; inp.placeholder='Gbps';
        c.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        // 1920 * 1080 * 144 * 24 / 1e9 = 7.166...
        if (Math.abs(v - 7.2) <= 0.2 || Math.abs(v - 7.1) <= 0.2) return { correct: true, feedback: 'Right. 1920 × 1080 × 144 × 24 = 7.166e9 ≈ 7.2 Gbps. Even with 25% overhead (≈ 9.0 Gbps), HDMI 2.0 (14.4) and DP 1.2 (17.28) both handle it easily.' };
        return { correct: false, feedback: 'width × height × refresh × bpp where bpp = 3 × bpc. 1920 × 1080 × 144 × 24 / 1e9 ≈ 7.2 Gbps.' };
      },
      hints: [
        'bpp = 3 × bpc = 3 × 8 = 24.',
        '1920 × 1080 = 2,073,600. × 144 = 298,598,400. × 24 = 7,166,361,600 bits/s.',
        '≈ 7.2 Gbps.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Can a single HDMI 2.0 cable (14.4 Gbps payload) carry <strong>4K (3840×2160) @ 60 Hz, 10 bpc HDR</strong>? Add 25% overhead.',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Yes — bandwidth is below the cap</option>' +
          '<option>No — required bandwidth exceeds 14.4 Gbps payload (need DSC, chroma subsampling, or DP/HDMI 2.1)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // 3840*2160*60*30 = 14.93 Gbps raw. *1.25 = 18.66 Gbps.
        if (v === 'No — required bandwidth exceeds 14.4 Gbps payload (need DSC, chroma subsampling, or DP/HDMI 2.1)') return { correct: true, feedback: 'Right. 3840 × 2160 × 60 × 30 = 14.93 Gbps raw. With 25% overhead: ~18.7 Gbps. HDMI 2.0\'s 14.4 Gbps payload is short. To make this work over HDMI 2.0, monitors fall back to YCbCr 4:2:2 chroma subsampling (perceptually-lossy color reduction) — that\'s often what enables "4K 60 Hz HDR over HDMI 2.0" claims.' };
        if (v === 'Yes — bandwidth is below the cap') return { correct: false, feedback: 'Compute it: 3840 × 2160 × 60 × 30 ≈ 14.93 Gbps RAW. With overhead: 18.7 Gbps. > 14.4. Doesn\'t fit.' };
        return { correct: false, feedback: 'Run the math: 3840 × 2160 × 60 × 30 / 1e9 = 14.93 Gbps raw, then × 1.25 = 18.7 Gbps.' };
      },
      hints: [
        'bpp = 3 × 10 = 30.',
        '3840 × 2160 × 60 × 30 = 14.93 × 10⁹ raw. × 1.25 = ~18.7 Gbps.',
        '18.7 > 14.4. Doesn\'t fit.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You buy a <strong>4K 240 Hz HDR (10 bpc)</strong> monitor and a <strong>DisplayPort 1.4</strong> cable. Spec sheet says it\'s supported. (DP 1.4 payload = 25.92 Gbps.) Without DSC, what\'s the maximum refresh rate at 4K 10bpc this cable could push? With DSC at 3:1, can you reach 240 Hz?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Without DSC: ~84 Hz max. With DSC 3:1: yes, 240 Hz fits.</option>' +
          '<option>Without DSC: ~120 Hz max. With DSC: 240 Hz still doesn\'t fit.</option>' +
          '<option>Without DSC: 240 Hz works fine — DP 1.4 has plenty of bandwidth.</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // 4K10bpc raw per Hz: 3840*2160*30 = 248,832,000 bits/Hz. ×1.25 ≈ 311,040,000 bits/Hz/s.
        // Max Hz uncompressed = 25.92e9 / 311.04e6 ≈ 83.3 Hz. So ~84 Hz.
        // With DSC 3:1, effective payload = ~25.92 * 3 = 77.76 Gbps payload-equivalent → at 240 Hz needed = 4K * 240 * 30 * 1.25 = 74.6 Gbps. Fits.
        if (v === 'Without DSC: ~84 Hz max. With DSC 3:1: yes, 240 Hz fits.') return { correct: true, feedback: 'Right. Per Hz at 4K 10bpc: 3840 × 2160 × 30 × 1.25 ≈ 0.311 Gbps. DP 1.4\'s 25.92 Gbps / 0.311 ≈ 83 Hz max uncompressed. With DSC ~3:1, effective bandwidth ≈ 78 Gbps; 240 Hz needs ~75 Gbps — fits. This is exactly why 4K 240 Hz monitors over DP 1.4 are explicitly DSC-enabled, and why "DP 2.1 UHBR20" is a meaningful leap (lets you do this without compression).' };
        if (v === 'Without DSC: ~120 Hz max. With DSC: 240 Hz still doesn\'t fit.') return { correct: false, feedback: 'Re-check the per-Hz cost. 4K 10bpc with overhead = ~0.311 Gbps/Hz. 25.92 / 0.311 ≈ 83, not 120.' };
        if (v === 'Without DSC: 240 Hz works fine — DP 1.4 has plenty of bandwidth.') return { correct: false, feedback: '4K 10bpc 240 Hz uncompressed = ~75 Gbps. DP 1.4 payload is 25.92 Gbps. Way short. DSC is required.' };
        return { correct: false, feedback: 'Compute per-Hz cost, then divide.' };
      },
      hints: [
        'Per-Hz bandwidth at 4K 10bpc with overhead = 3840 × 2160 × 30 × 1.25 / 1e9 ≈ 0.311 Gbps/Hz.',
        'DP 1.4: 25.92 / 0.311 ≈ 83 Hz max uncompressed.',
        'DSC ~3:1 triples effective bandwidth → 240 Hz fits comfortably.'
      ]
    }
  ]
});
