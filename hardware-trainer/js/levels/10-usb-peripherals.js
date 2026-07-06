// Level 10 — USB & peripherals
HWT.registerLevel({
  id: 10,
  title: 'USB & Peripherals',
  whyItMatters: 'USB has the worst naming in PC hardware. "USB 3.2 Gen 2x2" tells you almost nothing without decoder rings. This level gives you those rings — the underlying speed of every name, and the often-confused distinction between USB-C the connector and USB the protocol.',
  glossary: ['USB', 'TB'],
  learn: ''
    + '<h4>The naming chaos</h4>'
    + '<p>USB-IF (the standards body) has renamed every major USB version multiple times. The result is a generation of products with five different names for the same speed. Here\'s the decoder ring:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Year</th><th>Speed</th><th>Original name</th><th>Renames over time</th></tr>'
    + '<tr><td>1996</td><td>1.5 / 12 Mbps</td><td>USB 1.0/1.1</td><td>Low / Full Speed</td></tr>'
    + '<tr><td>2000</td><td>480 Mbps</td><td>USB 2.0</td><td>Hi-Speed</td></tr>'
    + '<tr><td>2008</td><td>5 Gbps</td><td>USB 3.0</td><td>USB 3.1 Gen 1 → USB 3.2 Gen 1 → "SuperSpeed USB 5 Gbps"</td></tr>'
    + '<tr><td>2013</td><td>10 Gbps</td><td>USB 3.1</td><td>USB 3.1 Gen 2 → USB 3.2 Gen 2 → "SuperSpeed USB 10 Gbps"</td></tr>'
    + '<tr><td>2017</td><td>20 Gbps</td><td>USB 3.2</td><td>USB 3.2 Gen 2x2 → "SuperSpeed USB 20 Gbps"</td></tr>'
    + '<tr><td>2019</td><td>40 Gbps</td><td>USB4</td><td>"USB4 40 Gbps"</td></tr>'
    + '<tr><td>2022</td><td>80/120 Gbps</td><td>USB4 v2</td><td>"USB4 80 Gbps", "USB4 120 Gbps" (asymmetric)</td></tr>'
    + '</table>'
    + '<p>The "Gen X" suffix tells you the speed:</p>'
    + '<ul>'
    +   '<li><strong>Gen 1</strong> = 5 Gbps (one lane)</li>'
    +   '<li><strong>Gen 2</strong> = 10 Gbps (one lane)</li>'
    +   '<li><strong>Gen 2x2</strong> = 20 Gbps (two lanes of 10)</li>'
    + '</ul>'
    + '<p>USB-IF officially recommends marketing-style names like "SuperSpeed USB 10 Gbps" — but most product listings still use the technical name. Memorize "Gen X" → speed.</p>'

    + '<h4>USB-C the connector vs USB the protocol</h4>'
    + '<p>This is the most-confused thing in PC hardware. <strong>USB-C is a connector shape.</strong> A USB-C port can carry:</p>'
    + '<ul>'
    +   '<li>USB 2.0 (480 Mbps) — common on cheap phones & dongles.</li>'
    +   '<li>USB 3.x (any of the above speeds).</li>'
    +   '<li>USB4 (40+ Gbps).</li>'
    +   '<li>Thunderbolt 3 / 4 / 5 — Intel/Apple\'s superset, also up to 40 / 80 Gbps.</li>'
    +   '<li>DisplayPort Alt Mode — DP signals over the USB-C wires.</li>'
    +   '<li>Power Delivery (USB-PD) — up to 240 W (PD 3.1).</li>'
    + '</ul>'
    + '<p>So: "I have a USB-C port" tells you nothing about speed, charging capability, or whether you can drive a monitor through it. <strong>Always read the icon next to the port.</strong> Lightning bolt = TB; "SS" = SuperSpeed (5 Gbps); "10" = 10 Gbps; "DP" symbol = DisplayPort Alt; thin rectangle (battery) = Power Delivery.</p>'

    + '<h4>Thunderbolt</h4>'
    + '<p>Originally Intel + Apple, now an open standard merged with USB4. TB carries:</p>'
    + '<ul>'
    +   '<li>PCIe (so external GPUs, fast SSDs, capture cards work)</li>'
    +   '<li>DisplayPort (so chained monitors)</li>'
    +   '<li>USB (so legacy peripherals)</li>'
    + '</ul>'
    + '<p>Speed tiers:</p>'
    + '<ul>'
    +   '<li><strong>TB3</strong> (2015) — 40 Gbps, 4 PCIe lanes Gen 3.</li>'
    +   '<li><strong>TB4</strong> (2020) — 40 Gbps but with stricter device certification + dual-4K display support guaranteed.</li>'
    +   '<li><strong>TB5</strong> (2023) — 80 Gbps base, 120 Gbps for displays. PCIe Gen 4 x4.</li>'
    + '</ul>'
    + '<p>Thunderbolt requires the host to have a TB controller — most consumer Intel laptops have one; consumer Ryzen desktops typically don\'t (unless the mobo is high-end and includes a JHL/Maple Ridge controller).</p>'

    + '<h4>Power Delivery (USB-PD)</h4>'
    + '<p>USB-PD lets a USB-C port negotiate higher voltages and currents — up to 5 V × 5 A standard, with PD 3.1 going to 48 V × 5 A = 240 W. This is how a single USB-C cable charges a 100 W laptop. Not all USB-C ports support PD; it\'s a feature, not given by the connector.</p>'

    + '<h4>Cable matters more than you think</h4>'
    + '<p>Two USB-C cables can look identical but be wildly different inside:</p>'
    + '<ul>'
    +   '<li><strong>USB 2.0-only USB-C cable</strong> — common cheap cable. 480 Mbps. No display, no fast data.</li>'
    +   '<li><strong>USB 3.x cable</strong> — has the extra wires for SuperSpeed.</li>'
    +   '<li><strong>USB4 / Thunderbolt cable</strong> — has the timing-critical shielding for 40 Gbps. Active above 1 m typically.</li>'
    +   '<li><strong>"Charge-only" USB-C cable</strong> — power lines but no data lines, exists for portable battery packs.</li>'
    + '</ul>'
    + '<p>Look for the speed marking on the connector body or buy known-spec cables. A cheap cable will silently drop you to USB 2.0 with no error.</p>'

    + '<h4>Header types on a desktop motherboard</h4>'
    + '<p>Internal USB headers on the motherboard let case-front USB ports plug in. Common:</p>'
    + '<ul>'
    +   '<li><strong>USB 2.0 header</strong> — 9-pin, two ports per header. Tiny.</li>'
    +   '<li><strong>USB 3.x Gen 1 header</strong> — 19-pin "Type-E adjacent." Two USB 3.0 5 Gbps ports.</li>'
    +   '<li><strong>USB 3.x Gen 2 USB-C header (Type-E)</strong> — single USB-C front port, up to 10 Gbps.</li>'
    + '</ul>'
    + '<p>Whether your case can use a "fast front USB-C" depends on whether the motherboard has the matching header. Mid-range B550M boards usually have one; cheaper A520 boards often don\'t.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a USB / TB name. See its actual speed and what it can do.</p>';
    var versions = [
      { name: 'USB 2.0',           speedGbps: 0.48, notes: 'Mice, keyboards, cheap webcams. Still everywhere — most BIOS keyboards are USB 2.0.' },
      { name: 'USB 3.2 Gen 1',     speedGbps: 5,    notes: 'Aka USB 3.0. Most "USB 3" sticks. Fast enough for SATA-class external drives.' },
      { name: 'USB 3.2 Gen 2',     speedGbps: 10,   notes: 'Most modern USB-C ports. Good for fast NVMe enclosures (gets ~1 GB/s sustained).' },
      { name: 'USB 3.2 Gen 2x2',   speedGbps: 20,   notes: 'Doubled-up Gen 2. Very rare in 2026 — superseded by USB4.' },
      { name: 'USB4 / TB3',        speedGbps: 40,   notes: 'Carries USB + PCIe + DP. eGPU enclosures, fast NVMe enclosures, dual 4K displays.' },
      { name: 'TB4',               speedGbps: 40,   notes: 'TB3 with stricter requirements (must support 32 Gbps PCIe, dual 4K).' },
      { name: 'USB4 v2 / TB5',     speedGbps: 80,   notes: 'Doubles TB4. Asymmetric mode boosts to 120 Gbps for displays.' }
    ];
    var pickRow = document.createElement('div'); pickRow.className = 'chip-row';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a USB version</span>';
    versions.forEach(function (v) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = v.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(pickRow.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        var mbps = v.speedGbps >= 1 ? v.speedGbps + ' Gbps' : (v.speedGbps * 1000) + ' Mbps';
        var realMBps = Math.round(v.speedGbps * 1000 / 8 * 0.85);
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + v.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Theoretical:</span> <span class="val">' + mbps + '</span></div>' +
          '<div class="info-line"><span class="key">Realistic max throughput:</span> <span class="val">~' + realMBps + ' MB/s (after overhead)</span></div>' +
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + v.notes + '</span></div>';
      });
      pickRow.appendChild(b);
    });
    container.appendChild(pickRow);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A spec sheet says "USB 3.2 Gen 1." What is its raw speed?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>480 Mbps</option><option>5 Gbps</option><option>10 Gbps</option><option>20 Gbps</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '5 Gbps') return { correct: true, feedback: 'Right. "Gen 1" always = 5 Gbps. This is the same speed as old "USB 3.0" / "USB 3.1 Gen 1" — same protocol, three names.' };
        if (v === '10 Gbps') return { correct: false, feedback: 'That\'s Gen 2.' };
        if (v === '20 Gbps') return { correct: false, feedback: 'That\'s Gen 2x2.' };
        return { correct: false, feedback: 'Gen 1 = 5 Gbps. The "Gen N" suffix is the only useful indicator of speed.' };
      },
      hints: [
        '"Gen N" is the speed indicator. Gen 1, Gen 2, Gen 2x2.',
        'Gen 1 is the slowest of the three.',
        '5 Gbps.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You buy a USB-C-to-USB-C cable (1 m, $5) and connect it between your laptop and an external NVMe enclosure rated for "USB 3.2 Gen 2" (10 Gbps). The drive transfers at <strong>~50 MB/s</strong> instead of the expected ~1,000 MB/s. The most likely cause is:',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>The drive is faulty</option>' +
          '<option>The cable is USB 2.0-only — silently caps everything at 480 Mbps</option>' +
          '<option>The laptop\'s USB-C port lacks PCIe; it dropped to USB 2.0</option>' +
          '<option>The drive enclosure is a SATA bridge, not NVMe</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'The cable is USB 2.0-only — silently caps everything at 480 Mbps') return { correct: true, feedback: 'Right. 50 MB/s is the realistic throughput of USB 2.0 (480 Mbps × 0.85 / 8 ≈ 51 MB/s). Cheap "USB-C charging cables" often lack the SuperSpeed wires entirely. The connector is USB-C either way; only the cable interior differs. Always buy known-spec data cables for storage. The hardware did fine — the cable was the bottleneck.' };
        if (v === 'The laptop\'s USB-C port lacks PCIe; it dropped to USB 2.0') return { correct: false, feedback: 'PCIe is for Thunderbolt/USB4. USB 3.2 Gen 2 doesn\'t need PCIe. Lack of PCIe wouldn\'t drop you to 2.0.' };
        if (v === 'The drive enclosure is a SATA bridge, not NVMe') return { correct: false, feedback: 'SATA-bridged enclosures cap near 540 MB/s, not 50.' };
        return { correct: false, feedback: '50 MB/s ≈ USB 2.0\'s real throughput. The cheap cable is almost certainly USB 2.0-only.' };
      },
      hints: [
        '50 MB/s is suspiciously close to USB 2.0\'s real throughput (~50 MB/s = 480 Mbps × 0.85 / 8).',
        'USB-C the connector ≠ USB 3.x the protocol. Cables can be USB 2.0-only despite having a USB-C plug.',
        'The cable is USB 2.0.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You want to drive a 4K @ 60 Hz monitor AND an external NVMe SSD (sustained ~1.5 GB/s) AND charge a 65 W laptop, all from a single port on your hub. Which of these connection types is the cheapest one that can do all three simultaneously?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>USB 3.2 Gen 2 (10 Gbps) with USB-PD</option>' +
          '<option>USB4 / Thunderbolt 3 (40 Gbps) with USB-PD</option>' +
          '<option>HDMI 2.1 + separate USB cable</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'USB4 / Thunderbolt 3 (40 Gbps) with USB-PD') return { correct: true, feedback: 'Right. USB 3.2 Gen 2 doesn\'t have a built-in DisplayPort tunnel of the right capacity (DP Alt Mode over USB 3.2 takes lanes away from data — and 4K @ 60 Hz 8bpc needs ~12.5 Gbps of DP, which only fits if you sacrifice USB lanes). USB4/TB3 explicitly carries DP + PCIe + USB simultaneously over its 40 Gbps total. Plus, USB-PD up to 100 W (or 240 W in PD 3.1) handles the laptop charge. HDMI 2.1 alone is video-only, not data or power. USB4/TB3 is the all-in-one answer.' };
        if (v === 'USB 3.2 Gen 2 (10 Gbps) with USB-PD') return { correct: false, feedback: 'USB 3.2 Gen 2 can carry DP Alt Mode but loses USB lanes for data when it does — and 1.5 GB/s + 4K display + everything else doesn\'t fit cleanly in 10 Gbps total. USB4/TB3 is what you need.' };
        if (v === 'HDMI 2.1 + separate USB cable') return { correct: false, feedback: 'The question says "single port on your hub." HDMI is video-only. You need a port type that simultaneously carries display + data + power.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'You need a port type that simultaneously carries display + USB data + power delivery.',
        'USB 3.2 Gen 2 caps at 10 Gbps total — and DP over it eats USB lanes.',
        'USB4 / TB3 carries DP, PCIe, and USB simultaneously over 40 Gbps.'
      ]
    }
  ]
});
