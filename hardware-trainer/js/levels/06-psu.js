// Level 6 — PSU
HWT.registerLevel({
  id: 6,
  title: 'Power Supply (PSU)',
  whyItMatters: 'The PSU is the single most underrated component. A weak or low-quality unit causes "random reboots, blue screens, or no-POST" symptoms that look like CPU/RAM/mobo failures and waste hours of debugging. This level teaches you to size and pick a PSU correctly.',
  glossary: ['PSU', 'rail', '80 PLUS', 'modular', 'transient', '12VHPWR'],
  learn: ''
    + '<h4>What a PSU does</h4>'
    + '<p>Wall outlet provides 120 V AC (or 230 V depending on country). Your PC needs steady DC at three voltages: 12 V (CPU + GPU + drives), 5 V (USB, some logic), 3.3 V (some logic). The PSU rectifies, transforms, regulates, and outputs these "rails" via a thick bundle of cables.</p>'
    + '<p>Modern PSUs are essentially "single 12 V" — almost all the watts come out the 12 V rail because that\'s where the CPU and GPU live. The 3.3 V and 5 V rails are tiny by comparison.</p>'

    + '<h4>Sizing: the budget approach</h4>'
    + '<p>Add up the rated power of every component, then add headroom. Approximate component draws:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Component</th><th>Idle</th><th>Load</th><th>Notes</th></tr>'
    + '<tr><td>Mainstream CPU (65–105 W TDP)</td><td>~20 W</td><td>~120–180 W</td><td>Boost can exceed TDP. Ryzen 9 3900X peaks ~142 W.</td></tr>'
    + '<tr><td>Mid-high GPU</td><td>~15 W</td><td>~150–250 W</td><td>RTX 3070 = 220 W TGP</td></tr>'
    + '<tr><td>High-end GPU</td><td>~25 W</td><td>~350–450 W</td><td>RTX 4090 = 450 W</td></tr>'
    + '<tr><td>Motherboard + RAM</td><td>~25 W</td><td>~50 W</td><td>RGB / lots of fans / extra controllers add up</td></tr>'
    + '<tr><td>Each NVMe SSD</td><td>~2 W</td><td>~8 W</td><td>Brief spikes during writes</td></tr>'
    + '<tr><td>Each HDD</td><td>~5 W</td><td>~10 W</td><td>Spin-up = ~25 W spike</td></tr>'
    + '<tr><td>Each case fan</td><td>~1 W</td><td>~3 W</td><td>4 fans × 3 W = 12 W</td></tr>'
    + '</table>'

    + '<h4>The 50–60% rule</h4>'
    + '<p>Most PSUs are most efficient (and run cool/quiet) at <strong>50–60% of rated load</strong>. So:</p>'
    + '<div class="formula-box">recommended_PSU_watts ≈ peak_total_draw / 0.6</div>'
    + '<p>Example: 3900X (~142 W under load) + RTX 3070 (220 W) + the rest (~80 W) ≈ 440 W under load. Recommended PSU: 440 / 0.6 ≈ 730 W → buy a 750 W or 850 W. The user\'s RM850x is a comfortable choice.</p>'

    + '<h4>The transient spike problem</h4>'
    + '<p>This is the most common reason builds randomly shut down. Modern GPUs (especially RTX 30/40-series) draw 1.5–2× their average TGP for ~1–10 ms during scene transitions or shader compilation. A 220 W RTX 3070 can briefly pull 350+ W; a 450 W RTX 4090 can pull 800+ W.</p>'
    + '<p>A weak PSU has a slow protection circuit that interprets the spike as a fault and shuts off (OCP — Over Current Protection). A quality PSU rides through.</p>'
    + '<div class="callout"><div class="label">Why "850 W" can be worse than "750 W"</div>'
    + 'Watts on the box are nameplate. A no-name 850 W unit may use cheap caps and a slow OCP — actual sustained capacity might be 600 W with a hard shutdown above. A Corsair RM750x will feed 750 W rock-steady AND tolerate 1000+ W transients. Always look up reviews (Cybenetics, Hardware Busters, JonnyGuru archive) before buying. Brand quality &gt; nameplate watts.'
    + '</div>'

    + '<h4>80 PLUS efficiency tiers</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Tier</th><th>Efficiency at 50% load (115 V)</th></tr>'
    + '<tr><td>White (basic)</td><td>80%</td></tr>'
    + '<tr><td>Bronze</td><td>85%</td></tr>'
    + '<tr><td>Silver</td><td>88%</td></tr>'
    + '<tr><td>Gold</td><td>90%</td></tr>'
    + '<tr><td>Platinum</td><td>92%</td></tr>'
    + '<tr><td>Titanium</td><td>94%</td></tr>'
    + '</table>'
    + '<p>Don\'t obsess over efficiency tier — the difference between Gold and Platinum is ~2%, worth maybe $2/year. The real value of "Gold or higher" is that it correlates with build quality (better caps, more rigorous protection circuits). A Gold-rated unit from a reputable maker is the modern sweet spot.</p>'

    + '<h4>Modular vs semi-modular vs fixed</h4>'
    + '<ul>'
    +   '<li><strong>Fixed</strong> — all cables permanently attached. Cheap. Cable management nightmare on builds with few drives.</li>'
    +   '<li><strong>Semi-modular</strong> — main cables (24-pin ATX, EPS CPU) fixed; peripheral cables detachable. The mid-range default.</li>'
    +   '<li><strong>Fully modular</strong> — every cable detaches from the PSU. Cleanest builds. ~$20 more.</li>'
    + '</ul>'

    + '<h4>The 12VHPWR / 12V-2x6 connector</h4>'
    + '<p>Introduced for RTX 30 FE (with adapter) and standard for RTX 40/50. 16 pins (12 power + 4 sense) carrying up to 600 W on one cable. Two notes:</p>'
    + '<ul>'
    +   '<li><strong>Seat it fully.</strong> Click. Latch engaged. Both cable ends. Several early RTX 4090 melts traced to partial seating (sense pins not engaged).</li>'
    +   '<li><strong>Don\'t bend within ~35 mm of the connector.</strong> ATX 3.0 cables are stiff; tight bends pulled some pins partially out.</li>'
    + '</ul>'

    + '<h4>What \'kill the PSU\' actually looks like</h4>'
    + '<p>Symptoms of an undersized or failing PSU:</p>'
    + '<ul>'
    +   '<li>System shuts off cold (no BSOD) under heavy load — classic OCP trip.</li>'
    +   '<li>Random reboots in games but stable in idle/desktop work.</li>'
    +   '<li>"No-POST" intermittently after gaming sessions (capacitors degrading).</li>'
    +   '<li>Coil whine that gets worse over time.</li>'
    + '</ul>'
    + '<p>A 5–10 year old PSU on a heavy 24/7 system is a real failure candidate. Quality units come with 7–10 year warranties — they\'re engineered for the long haul.</p>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Toggle components on/off. The recommended PSU updates live.</p>';

    var components = [
      { name: 'CPU — Ryzen 9 3900X', watts: 142, spike: true, on: true },
      { name: 'GPU — RTX 3070', watts: 220, spike: true, on: true },
      { name: 'GPU — RTX 4090 (replace 3070)', watts: 450, spike: true, on: false },
      { name: 'Motherboard + RAM', watts: 50, on: true },
      { name: 'NVMe SSD ×1', watts: 8, on: true },
      { name: 'NVMe SSD ×2 (extra)', watts: 8, on: false },
      { name: 'HDD ×1', watts: 10, on: false },
      { name: '4× 120 mm fans', watts: 12, on: true },
      { name: 'AIO pump + radiator fans', watts: 15, on: true },
      { name: 'RGB strip', watts: 8, on: false }
    ];

    var checkboxes = document.createElement('div'); checkboxes.className = 'checkbox-list';
    var output = document.createElement('div'); output.className = 'formula-box';

    components.forEach(function (c, i) {
      var lbl = document.createElement('label');
      var cb = document.createElement('input'); cb.type='checkbox'; cb.checked = c.on;
      cb.addEventListener('change', function () { c.on = cb.checked; update(); });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(' ' + c.name + ' — ' + c.watts + ' W' + (c.spike ? ' (spikes)' : '')));
      checkboxes.appendChild(lbl);
    });

    function update() {
      var active = components.filter(function (c) { return c.on; });
      var b = hw.psuBudget(active);
      var fits = b.recommended <= 850 ? 'good' : (b.recommended <= 1000 ? 'warn' : 'bad');
      output.innerHTML =
        '<div class="info-line"><span class="key">Average load:</span> <span class="val">' + b.total + ' W</span></div>' +
        '<div class="info-line"><span class="key">Estimated transient peak:</span> <span class="val">' + Math.round(b.transientPeak) + ' W</span></div>' +
        '<div class="info-line"><span class="key">Recommended PSU:</span> <span class="val"><span class="result" style="color:var(--' + fits + ')">' + b.recommended + ' W</span> (run at ~60% load)</span></div>' +
        '<div class="info-line"><span class="key">Headroom at recommended:</span> <span class="val">' + b.headroomPct + '%</span></div>';
    }

    update();
    container.appendChild(checkboxes);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Your build draws ~330 W under typical gaming load. Following the "operate at 50–60% of rated PSU load for best efficiency" rule, what\'s the smallest PSU wattage you should buy (round up to the nearest 50 W)?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='watts';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // 330 / 0.6 = 550. Round up to 550.
        if (v === 550) return { correct: true, feedback: 'Right. 330 / 0.6 = 550 W. (650 W would be even more comfortable, but 550 W is the floor by this rule.)' };
        if (v === 600 || v === 650 || v === 700 || v === 750) return { correct: true, feedback: 'Acceptable — anything in this range is sensible. The floor by the rule is 550 W (330 / 0.6). Going higher gives you headroom for upgrades.' };
        if (v === 330 || v === 400) return { correct: false, feedback: 'You want headroom — running a PSU at 100% load is hot, loud, and inefficient. Aim for ~60% load: PSU = load / 0.6.' };
        return { correct: false, feedback: '330 W / 0.6 = 550 W minimum.' };
      },
      hints: [
        'Recommended_watts = peak_load / 0.6',
        '330 / 0.6 = 550.',
        '550 W (or higher).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A user reports: "PC gaming sessions lasting 30+ minutes randomly shut down — black screen, no BSOD. Reboots fine. CPU and GPU temps look normal in monitoring software." Most likely culprit?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>RAM error — run MemTest86</option>' +
          '<option>PSU OCP tripping on a transient spike — undersized or low-quality PSU</option>' +
          '<option>CPU thermal throttle</option>' +
          '<option>Storage failure — SSD slow death</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'PSU OCP tripping on a transient spike — undersized or low-quality PSU') return { correct: true, feedback: 'Right. The fingerprint of a PSU OCP shutdown: hard cold-cut (no BSOD, no error, just off), happens under heavy load only, normal temps. Solution: replace with a quality PSU sized for ~60% of peak draw. RAM errors usually BSOD; thermals throttle (slow down) before shutdown; storage failure tends to show in event log.' };
        if (v === 'RAM error — run MemTest86') return { correct: false, feedback: 'RAM faults usually produce BSODs (specific bugcheck codes), not silent shutdowns.' };
        if (v === 'CPU thermal throttle') return { correct: false, feedback: 'Throttling means slow-down, not shutdown. Plus you said temps look normal.' };
        if (v === 'Storage failure — SSD slow death') return { correct: false, feedback: 'SSD failure usually presents as I/O errors, BSODs, or read-only mode — not random total power-off.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'A clean cold cut (no BSOD, no warning) is the fingerprint of a power problem.',
        'Heavy-load only + normal temps points away from cooling, RAM, storage.',
        'PSU OCP trip on transient spike.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re building with: Ryzen 7 7800X3D (~120 W under load), RTX 4080 Super (~320 W TGP, but transients up to ~500 W), B650 mobo + 2 NVMe + AIO + 4 fans (~80 W combined). Two PSU options at the same price: <br><br>' +
        '<strong>PSU A:</strong> 750 W 80 Plus Gold, Tier-A in reviewer rankings.<br>' +
        '<strong>PSU B:</strong> 850 W 80 Plus Bronze, no-name Tier-D brand.<br><br>' +
        'Which should you buy and why?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>PSU A — 750 W is enough; quality matters more than nameplate watts</option>' +
          '<option>PSU B — 850 W gives more transient headroom</option>' +
          '<option>Either works fine — they\'re both within spec</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'PSU A — 750 W is enough; quality matters more than nameplate watts') return { correct: true, feedback: 'Right. Average load: 120 + 320 + 80 = 520 W → recommended 520/0.6 = 870 W… but that\'s a target, not a hard floor. A high-quality 750 W unit will sustain 750 W steady AND ride through 4080 transients (~700 W instantaneous demand) without OCP trip. A no-name 850 W often can\'t sustain its nameplate AND has aggressive OCP that trips on those transients. Real reviewers (Cybenetics etc.) test transient response — that\'s what differentiates tier-A from tier-D more than the rated watts.' };
        if (v === 'PSU B — 850 W gives more transient headroom') return { correct: false, feedback: 'On paper, yes. In practice, no-name PSUs often can\'t deliver their nameplate watts cleanly AND have slow/aggressive OCP that DOES trip on transient spikes. Quality &gt; watts.' };
        if (v === 'Either works fine — they\'re both within spec') return { correct: false, feedback: 'No-name "850 W Bronze" units have caused thousands of "random shutdown" support tickets. Brand and review tier are not interchangeable with nameplate.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Compute peak average draw: 120 + 320 + 80 = 520 W.',
        '750 W of high-quality output > 850 W of low-quality output. The PSU has to ride through transient spikes without OCP-tripping.',
        'PSU A. Quality matters more than the headline wattage.'
      ]
    }
  ]
});
