// Level 7 — Motherboard & chipset
HWT.registerLevel({
  id: 7,
  title: 'Motherboard & Chipset',
  whyItMatters: 'The motherboard is the cheapest place to ruin a build. The cheapest B-tier boards have weak VRMs that throttle the CPU; mid-tier boards lock you out of features (PCIe Gen 5, more M.2, USB4). Knowing which chipset gates which feature lets you pick the board that does what you need without paying for what you won\'t use.',
  glossary: ['mobo', 'socket', 'chipset', 'VRM', 'BIOS', 'POST', 'DMI'],
  learn: ''
    + '<h4>What\'s on a motherboard</h4>'
    + '<p>The motherboard is a multi-layer PCB. Major elements:</p>'
    + '<ul>'
    +   '<li><strong>CPU socket</strong> — physical interface to the CPU. AM4 (Ryzen 1000–5000), AM5 (Ryzen 7000+), LGA1700 (Intel 12–14), LGA1851 (Intel Core Ultra). Sockets and chipsets are tied together; AM5 board ⇒ AM5 CPU only.</li>'
    +   '<li><strong>RAM slots</strong> — typically 2 or 4. Each pair = 1 channel.</li>'
    +   '<li><strong>VRMs</strong> — voltage regulator modules. Drop the PSU\'s 12 V to the ~1 V the CPU runs on, with hundreds of amps current.</li>'
    +   '<li><strong>PCIe slots</strong> — full-length x16 (for GPU), shorter x4/x1 (for sound cards, capture cards, NICs).</li>'
    +   '<li><strong>M.2 slots</strong> — for NVMe SSDs.</li>'
    +   '<li><strong>SATA ports</strong> — usually 4–6, for HDDs and SATA SSDs.</li>'
    +   '<li><strong>Chipset</strong> — a separate chip that adds I/O.</li>'
    +   '<li><strong>I/O panel</strong> — back of board: USB, Ethernet, audio, display outputs (for iGPU systems), maybe Wi-Fi antenna.</li>'
    + '</ul>'

    + '<h4>The chipset and the uplink</h4>'
    + '<p>The CPU has only so many PCIe lanes. The chipset is a separate chip on the board that takes a fixed-width PCIe link <em>from</em> the CPU (the "uplink" — Intel calls this DMI; AMD just calls it the chipset link) and fans out into more I/O: extra USB ports, extra SATA, extra PCIe slots, gigabit Ethernet, audio codec, etc.</p>'
    + '<p>Two consequences:</p>'
    + '<ul>'
    +   '<li><strong>Everything connected to the chipset shares the uplink bandwidth.</strong> Saturating multiple chipset NVMe drives + USB storage + Ethernet at once will hit the cap.</li>'
    +   '<li><strong>The chipset gates which features you get</strong> — not all chipsets give you USB4, multiple Gen 5 NVMe slots, or as much I/O.</li>'
    + '</ul>'

    + '<h4>AM4 chipset cheat sheet</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Chipset</th><th>PCIe Gen 4</th><th>OC support</th><th>USB ports</th><th>Notes</th></tr>'
    + '<tr><td>A520</td><td>No (Gen 3)</td><td>None</td><td>Few</td><td>Office / OEM tier.</td></tr>'
    + '<tr><td>B450</td><td>No (Gen 3)</td><td>Yes</td><td>Mid</td><td>Old. Cheap. Good for Ryzen 3000 budget.</td></tr>'
    + '<tr><td>B550</td><td>Yes (CPU-direct slots only)</td><td>Yes</td><td>Mid+</td><td>The user\'s board (B550M Steel Legend). Sweet spot.</td></tr>'
    + '<tr><td>X570</td><td>Yes (everywhere)</td><td>Yes</td><td>Most</td><td>High-end AM4. Chipset fan on early units.</td></tr>'
    + '</table>'

    + '<h4>VRMs — the spec nobody tells you about</h4>'
    + '<p>VRM = Voltage Regulator Module. The board takes 12 V from the PSU and steps it down to ~1.1 V at sometimes 200+ amps (CPU power = volts × amps; a 240 W CPU at 1.2 V = 200 A). This is done by an array of MOSFETs, chokes, and capacitors arranged in <strong>phases</strong>.</p>'
    + '<p>More phases (and bigger / better-cooled MOSFETs) means:</p>'
    + '<ul>'
    +   '<li>Less voltage ripple — the CPU sees a cleaner supply.</li>'
    +   '<li>Less heat per phase — lower temps, less throttling under sustained load.</li>'
    +   '<li>Headroom for overclocking.</li>'
    + '</ul>'
    + '<p>Cheap "B-tier" boards with 4-phase VRMs and tiny heatsinks throttle high-TDP CPUs after 5–10 minutes of full load. The B550M Steel Legend has a beefy ~10-phase VRM with proper heatsinks — this is why it\'s recommended for 12-core 3900X-class CPUs despite being mATX.</p>'
    + '<div class="callout"><div class="label">How to read VRM specs</div>'
    + 'Reviewers measure VRM temps under sustained Cinebench. A VRM peaking under 60 °C = excellent, 60–80 °C = fine, 90+ °C = throttling will happen on hot summer days. Search "[your board] VRM temps" before buying for high-TDP CPUs.'
    + '</div>'

    + '<h4>Form factors</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Size</th><th>Dimensions</th><th>Slots/RAM</th><th>Notes</th></tr>'
    + '<tr><td>E-ATX</td><td>305 × 330 mm</td><td>7+ / 8 DIMM</td><td>Workstation.</td></tr>'
    + '<tr><td>ATX</td><td>305 × 244 mm</td><td>7 / 4 DIMM</td><td>Standard desktop.</td></tr>'
    + '<tr><td>mATX</td><td>244 × 244 mm</td><td>4 / 4 DIMM</td><td>Compact builds. The user\'s B550M.</td></tr>'
    + '<tr><td>ITX</td><td>170 × 170 mm</td><td>1 / 2 DIMM</td><td>SFF. Premium price.</td></tr>'
    + '</table>'

    + '<h4>BIOS / UEFI — first responsibility on power-on</h4>'
    + '<p>UEFI (modern replacement for legacy BIOS) is firmware on a chip on the motherboard. On power-on:</p>'
    + '<ol>'
    +   '<li>POST — Power On Self Test. Checks CPU, RAM, GPU initialize.</li>'
    +   '<li>Initialize PCIe / NVMe / USB controllers.</li>'
    +   '<li>Read boot order. Hand control to the boot drive\'s bootloader.</li>'
    + '</ol>'
    + '<p>If POST fails, you\'ll see: beep codes (vendor-specific patterns from a tiny speaker), debug LEDs (Q-LED on Asus, EZ Debug LED on MSI — labeled CPU/DRAM/VGA/BOOT), or a 2-digit POST code on premium boards. Level 13 covers the diagnostics flow.</p>'

    + '<h4>BIOS update — when you must</h4>'
    + '<p>Most users should never update BIOS. Three exceptions:</p>'
    + '<ul>'
    +   '<li>The CPU you\'re installing is newer than the board\'s ship date. Example: AM4 B450 board with Ryzen 5000 needs BIOS update first. (Many boards have "BIOS Flashback" — flash without a CPU installed.)</li>'
    +   '<li>You\'re hitting a known bug fixed in a release.</li>'
    +   '<li>Security updates for AMD/Intel CPU vulnerabilities.</li>'
    + '</ul>'
    + '<p>A bricked BIOS update used to be game over; modern boards have dual BIOS or recovery modes. Still — read the changelog, don\'t flash unnecessarily.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click a chipset to see what it gates.</p>';
    var chipsets = [
      { name: 'B550', plat: 'AM4 (Ryzen 3000–5000)', pcie: 'Gen 4 from CPU; Gen 3 from chipset', oc: 'Yes', m2: '1× CPU, 1× chipset (typical)', usb: '2× USB 3.2 Gen 2 + 4× Gen 1', notes: 'Sweet spot for AM4. The user\'s B550M Steel Legend.' },
      { name: 'X570', plat: 'AM4 (Ryzen 3000–5000)', pcie: 'Gen 4 everywhere (incl. chipset)', oc: 'Yes', m2: '2–3× M.2 (most slots Gen 4)', usb: '8× USB 3.2', notes: 'Premium AM4. Early units had a chipset fan due to higher TDP.' },
      { name: 'B650', plat: 'AM5 (Ryzen 7000+)', pcie: 'Gen 4 from CPU; Gen 4 chipset; Gen 5 optional on M.2_1', oc: 'Yes', m2: '2× M.2', usb: 'Mixed Gen 1/Gen 2', notes: 'Mid-tier AM5. Cheaper boards may not have Gen 5.' },
      { name: 'X670E', plat: 'AM5 (Ryzen 7000+)', pcie: 'Gen 5 mandatory (GPU + 1× M.2)', oc: 'Yes', m2: '3+ M.2 (1+ Gen 5)', usb: 'USB4 on most SKUs', notes: 'Premium AM5. The "E" = Extreme = Gen 5 is required.' },
      { name: 'Z790', plat: 'LGA1700 (Intel 12–14th)', pcie: 'Gen 5 GPU; Gen 4 NVMe', oc: 'Yes', m2: '4× M.2 typical', usb: '5+ USB 3.2 Gen 2x2 / Thunderbolt on some', notes: 'High-end Intel.' },
      { name: 'Z890', plat: 'LGA1851 (Core Ultra)', pcie: 'Gen 5 GPU + 1× M.2 Gen 5', oc: 'Yes', m2: '4× M.2', usb: 'TB4 / USB4 standard', notes: 'Latest Intel.' }
    ];
    var pickRow = document.createElement('div'); pickRow.className = 'chip-row';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a chipset</span>';
    chipsets.forEach(function (cs) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = cs.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(pickRow.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + cs.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Platform:</span> <span class="val">' + cs.plat + '</span></div>' +
          '<div class="info-line"><span class="key">PCIe:</span> <span class="val">' + cs.pcie + '</span></div>' +
          '<div class="info-line"><span class="key">CPU OC:</span> <span class="val">' + cs.oc + '</span></div>' +
          '<div class="info-line"><span class="key">M.2:</span> <span class="val">' + cs.m2 + '</span></div>' +
          '<div class="info-line"><span class="key">USB:</span> <span class="val">' + cs.usb + '</span></div>' +
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + cs.notes + '</span></div>';
      });
      pickRow.appendChild(b);
    });
    container.appendChild(pickRow);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You buy a Ryzen 7 7700X (AM5) and want to use it on your existing AM4 motherboard. Will this work?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Yes — Ryzen is backward compatible</option>' +
          '<option>No — sockets differ; AM5 chip will not fit AM4 board</option>' +
          '<option>Only with a BIOS update</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'No — sockets differ; AM5 chip will not fit AM4 board') return { correct: true, feedback: 'Right. AM4 = PGA, 1331 pins; AM5 = LGA, 1718 contacts. Physically incompatible. AM5 also requires DDR5 — different RAM slots too. Cross-generation socket changes always require a new motherboard.' };
        return { correct: false, feedback: 'Sockets are physical. AM4 and AM5 have different pin counts AND different mounting (AM4 = PGA, AM5 = LGA). The chip won\'t even fit.' };
      },
      hints: [
        'Sockets are a physical interface — pin count and arrangement matter.',
        'AM4 and AM5 have different pin counts.',
        'No, you need an AM5 board.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re hooking up: a Gen 4 NVMe in the chipset M.2 slot (~7 GB/s), a USB 3.2 Gen 2x2 external SSD (2 GB/s), and a 2.5 GbE NIC (~0.3 GB/s) — all routed through the chipset. The board\'s chipset uplink is <strong>DMI 4.0 x4 (~7.9 GB/s)</strong>. If all three are saturated at once, what happens?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>All three run at full speed — chipset bandwidth is plenty</option>' +
          '<option>The combined demand (~9.3 GB/s) exceeds the uplink; everything slows proportionally</option>' +
          '<option>The NVMe gets priority; the others stop until it\'s done</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'The combined demand (~9.3 GB/s) exceeds the uplink; everything slows proportionally') return { correct: true, feedback: 'Right. 7 + 2 + 0.3 = 9.3 GB/s requested through a 7.9 GB/s pipe. The chipset arbitrates — devices share the bandwidth. In practice, most devices don\'t saturate continuously, so it\'s usually fine. But if all three are running max-throughput at once (e.g. dual NVMe RAID + USB transfer), they all slow. This is why "more chipset PCIe lanes" on premium boards isn\'t magic — they all share the uplink.' };
        if (v === 'All three run at full speed — chipset bandwidth is plenty') return { correct: false, feedback: 'Add it up: 7 + 2 + 0.3 = 9.3 GB/s. Pipe is 7.9 GB/s. It\'s oversubscribed.' };
        if (v === 'The NVMe gets priority; the others stop until it\'s done') return { correct: false, feedback: 'PCIe arbitration is fair-share by request, not strict priority. Everyone gets a slice; no one gets zero.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Add up the demand. Compare to the uplink capacity.',
        '7 + 2 + 0.3 = 9.3 GB/s requested. Pipe = 7.9 GB/s.',
        'Demand exceeds capacity. Everyone slows proportionally.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re building a Ryzen 9 7950X (170 W TDP, peaks ~230 W) workstation for sustained Cinebench / video encoding. Two motherboards on your shortlist:<br><br>' +
        '<strong>Board P:</strong> Cheap B650, 6+2+1 phase VRM, no VRM heatsinks, $130<br>' +
        '<strong>Board Q:</strong> Mid-range X670, 14+2+1 phase VRM with finned heatsinks, $230<br><br>' +
        'For this CPU under sustained 100% load, what will you actually observe with each?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Board P throttles after a few minutes due to VRM overheating; Board Q sustains full boost</option>' +
          '<option>No difference — VRMs are sized to the chipset spec, both will work</option>' +
          '<option>Board P will fail to POST; cheap VRMs can\'t even initialize a 7950X</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Board P throttles after a few minutes due to VRM overheating; Board Q sustains full boost') return { correct: true, feedback: 'Right. A 6-phase VRM with no heatsinks delivering 230 W to a 7950X means each phase pushes ~35 A and gets very hot. Without a heatsink, MOSFETs hit 100+ °C in minutes; the board engages VRM throttle (drops the CPU clock to protect itself). Reviewers like HUB and Gamers Nexus regularly demonstrate this exact failure mode on cheap boards. Board Q\'s 14-phase + heatsinks divides the same load into smaller per-phase currents and dissipates the heat. A high-TDP CPU on a budget board is the quietest way to lose 20–40% of its performance.' };
        if (v === 'No difference — VRMs are sized to the chipset spec, both will work') return { correct: false, feedback: 'VRM spec is independent of chipset. There are good and bad B650 boards, good and bad X670 boards. Phase count and heatsinking matter.' };
        if (v === 'Board P will fail to POST; cheap VRMs can\'t even initialize a 7950X') return { correct: false, feedback: 'Cheap VRMs CAN initialize the chip — the failure mode is sustained-load throttle, not boot failure. (You\'d see fine benchmarks for the first 30 seconds, then a steady decline.)' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'A 230 W CPU on a 6-phase VRM means each phase carries a lot of current.',
        'Without heatsinks, MOSFETs heat up. The board protects itself by throttling the CPU.',
        'Board P throttles; Board Q is fine. VRM quality matters most for sustained, high-TDP loads.'
      ]
    }
  ]
});
