// Level 11 — Networking hardware
HWT.registerLevel({
  id: 11,
  title: 'Networking Hardware',
  whyItMatters: 'A network is end-to-end as fast as the slowest link. Knowing the speed of every wire and air-link in your home setup tells you why "I have gigabit internet" and "I can\'t download faster than 30 MB/s on Wi-Fi" both happen at the same time.',
  glossary: ['Ethernet', 'Wi-Fi', 'NIC', 'PHY', 'MAC'],
  learn: ''
    + '<h4>The OSI/TCP-IP detour</h4>'
    + '<p>(For deep coverage of OSI/TCP-IP layers, see <code>networking-trainer/</code> level 3. This level focuses on the <em>physical</em> hardware.)</p>'
    + '<p>Each network interface (Ethernet NIC, Wi-Fi card) has two halves:</p>'
    + '<ul>'
    +   '<li><strong>PHY</strong> (physical layer chip) — turns logical bits into electrical pulses on copper, light on fiber, or RF on Wi-Fi.</li>'
    +   '<li><strong>MAC</strong> (media access control) — handles framing, the unique 48-bit hardware address, and "who-talks-when" arbitration.</li>'
    + '</ul>'

    + '<h4>Ethernet speed tiers</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Tier</th><th>Speed</th><th>Cable</th><th>Real-world MB/s</th><th>Notes</th></tr>'
    + '<tr><td>10 Mbps</td><td>10BASE-T</td><td>Cat3+</td><td>~1 MB/s</td><td>Legacy.</td></tr>'
    + '<tr><td>Fast Ethernet</td><td>100 Mbps</td><td>Cat5+</td><td>~12 MB/s</td><td>Old. Still on cheap printers.</td></tr>'
    + '<tr><td>Gigabit (1 GbE)</td><td>1 Gbps</td><td>Cat5e+</td><td>~110 MB/s</td><td>The default for ~20 years of consumer Ethernet.</td></tr>'
    + '<tr><td>2.5 GbE</td><td>2.5 Gbps</td><td>Cat5e+</td><td>~280 MB/s</td><td>2026 budget mobo standard. Same wiring as 1 GbE.</td></tr>'
    + '<tr><td>5 GbE</td><td>5 Gbps</td><td>Cat6+</td><td>~560 MB/s</td><td>Niche; mostly enterprise.</td></tr>'
    + '<tr><td>10 GbE</td><td>10 Gbps</td><td>Cat6a+</td><td>~1100 MB/s</td><td>Workstation / NAS / enthusiast.</td></tr>'
    + '<tr><td>25 / 40 / 100 GbE</td><td>25–100 Gbps</td><td>fiber / DAC</td><td>~2.7–11 GB/s</td><td>Datacenter only.</td></tr>'
    + '</table>'
    + '<p>Cable category (Cat5e, Cat6, Cat6a, Cat7, Cat8) defines wire quality and shielding. Higher cat = more bandwidth, longer runs at high speed. Cat6a is the realistic ceiling for residential 10 GbE.</p>'

    + '<h4>The negotiation rule</h4>'
    + '<p>Two devices on a link negotiate down to the lowest common speed. A 1 GbE NIC + 10 GbE switch port = 1 GbE link. Always upgrade weak-link end first. Common surprise: the cable is Cat5e, but a worn or kinked one might fail to auto-negotiate gigabit and silently drop to 100 Mbps. Replacing the cable can be a magic 10× speed gain.</p>'

    + '<h4>Wi-Fi generations</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Wi-Fi</th><th>IEEE name</th><th>Year</th><th>Bands</th><th>Top speed (typical 1 stream)</th><th>Notes</th></tr>'
    + '<tr><td>Wi-Fi 4</td><td>802.11n</td><td>2009</td><td>2.4 + 5 GHz</td><td>~150 Mbps</td><td>Old. Avoid.</td></tr>'
    + '<tr><td>Wi-Fi 5</td><td>802.11ac</td><td>2013</td><td>5 GHz</td><td>~430 Mbps</td><td>Most existing routers in 2026.</td></tr>'
    + '<tr><td>Wi-Fi 6</td><td>802.11ax</td><td>2019</td><td>2.4 + 5</td><td>~1.2 Gbps</td><td>OFDMA — better in crowded environments. PHY rate at 80 MHz / 1 stream.</td></tr>'
    + '<tr><td>Wi-Fi 6E</td><td>802.11ax</td><td>2021</td><td>+ 6 GHz</td><td>~1.2 Gbps</td><td>Adds the 6 GHz band — much less crowded.</td></tr>'
    + '<tr><td>Wi-Fi 7</td><td>802.11be</td><td>2024</td><td>2.4 + 5 + 6</td><td>~2.4 Gbps</td><td>320 MHz channels, MLO (multi-link operation).</td></tr>'
    + '</table>'
    + '<p>The "top speed" advertised on a router box (e.g. "AX5400") is the sum across all bands and all spatial streams in ideal conditions. Single-device, single-band real throughput is much lower (typically 30–60% of "PHY rate").</p>'

    + '<h4>Why Wi-Fi feels slower than Ethernet</h4>'
    + '<ul>'
    +   '<li><strong>Half-duplex on a shared medium.</strong> Devices take turns. Ethernet over twisted pair is full-duplex.</li>'
    +   '<li><strong>Distance + walls + interference</strong> drop the modulation rate. A 5 GHz signal through two drywall walls might drop from 1200 Mbps PHY to 100 Mbps.</li>'
    +   '<li><strong>Other devices</strong> on the network share airtime.</li>'
    +   '<li><strong>2.4 GHz is crowded.</strong> Microwaves, baby monitors, Bluetooth, neighbors. Use 5 GHz or 6 GHz where possible.</li>'
    + '</ul>'
    + '<p>Rule of thumb: cabled gigabit will outperform any household Wi-Fi for sustained transfers, even a Wi-Fi 7 router two rooms away.</p>'

    + '<h4>The home network chain</h4>'
    + '<p>For "I have 1 Gbps internet but a download tops out at 30 MB/s" diagnostics, walk the chain:</p>'
    + '<ol>'
    +   '<li>ISP modem (DOCSIS / fiber ONT) — provider-installed, sized to your plan.</li>'
    +   '<li>Router — has a WAN port (often 1 GbE; 2.5 GbE on newer) and LAN ports (1 GbE typical).</li>'
    +   '<li>(Optional) switch — if you need more LAN ports.</li>'
    +   '<li>Cable + your NIC OR Wi-Fi card.</li>'
    + '</ol>'
    + '<p>If you have 2 Gbps internet and a 1 GbE router WAN port, the router is your cap. If you have 1 GbE router but Wi-Fi 5 in the bedroom, Wi-Fi is your cap. Always test wired before blaming ISP.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a hop in the chain. See its speed and where bottlenecks could appear.</p>';

    var hops = [
      { name: 'Internet plan: 1 Gbps', speed: 125, cls: 'good' },
      { name: 'Internet plan: 100 Mbps', speed: 12.5, cls: 'warn' },
      { name: 'Modem ↔ router: 1 GbE WAN', speed: 125, cls: 'good' },
      { name: 'Modem ↔ router: 2.5 GbE WAN', speed: 312.5, cls: 'good' },
      { name: 'Switch port: 1 GbE', speed: 125, cls: 'good' },
      { name: 'Switch port: 10 GbE', speed: 1100, cls: 'good' },
      { name: 'Cat5e cable, 25 ft, good condition', speed: 125, cls: 'good' },
      { name: 'Cat5 cable, kinked', speed: 12.5, cls: 'bad' },
      { name: 'Wi-Fi 5 client, 2 walls away', speed: 35, cls: 'warn' },
      { name: 'Wi-Fi 6 client, same room', speed: 75, cls: 'good' },
      { name: 'Wi-Fi 7 client, line of sight, 6 GHz', speed: 250, cls: 'good' }
    ];

    var pickRow = document.createElement('div'); pickRow.className = 'chip-row';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a hop to see realistic throughput</span>';
    hops.forEach(function (h) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = h.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(pickRow.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + h.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Realistic throughput:</span> <span class="val"><span class="result" style="color:var(--' + h.cls + ')">' + h.speed + ' MB/s</span></span></div>' +
          '<div class="info-line muted">(after protocol overhead, real-world conditions)</div>';
      });
      pickRow.appendChild(b);
    });
    container.appendChild(pickRow);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A "1 Gbps" Ethernet link delivers approximately what real-world download speed in MB/s?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>~12 MB/s</option><option>~30 MB/s</option><option>~110 MB/s</option><option>~1000 MB/s</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '~110 MB/s') return { correct: true, feedback: 'Right. 1 Gbps / 8 = 125 MB/s theoretical, minus TCP/IP headers, retransmits, etc. ≈ ~110 MB/s realistically. The classic "I have a gigabit connection so I should download a 1 GB file in 8 seconds" — yes, about 9 seconds.' };
        if (v === '~1000 MB/s') return { correct: false, feedback: 'Off by a factor of 8 — you mixed bits and bytes. 1 Gbps ≈ 125 MB/s.' };
        if (v === '~12 MB/s') return { correct: false, feedback: 'That\'s 100 Mbps (Fast Ethernet).' };
        return { correct: false, feedback: '1 Gbps / 8 bits/byte = 125 MB/s theoretical. Real-world ~ 110 MB/s.' };
      },
      hints: [
        'Divide by 8 to convert bits to bytes.',
        '1000 / 8 = 125 MB/s theoretical.',
        'Subtract overhead — ~110 MB/s real.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You upgraded your internet plan from 1 Gbps to 2 Gbps. Your router has a 1 GbE WAN port. Will speed-test results actually exceed 1 Gbps?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Yes — modems negotiate above the WAN port speed</option>' +
          '<option>No — the WAN port caps at 1 Gbps; you need a router with 2.5 GbE or 10 GbE WAN</option>' +
          '<option>Only if the cable is Cat6a or better</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'No — the WAN port caps at 1 Gbps; you need a router with 2.5 GbE or 10 GbE WAN') return { correct: true, feedback: 'Right. The chain is only as fast as the slowest link. 1 GbE WAN port on the router = ~1 Gbps maximum, regardless of what the ISP delivers. Look for "2.5G WAN" or "10G WAN" routers when getting plans above 1 Gbps. (Most ISPs will sell you a "free fast plan" that you can\'t actually use without telling you.)' };
        if (v === 'Yes — modems negotiate above the WAN port speed') return { correct: false, feedback: 'PHYs negotiate to the LOWEST common speed, never higher than the slower endpoint supports. 1 GbE WAN = 1 Gbps cap.' };
        if (v === 'Only if the cable is Cat6a or better') return { correct: false, feedback: 'Cable doesn\'t override port speed. Even with Cat8, a 1 GbE port outputs 1 Gbps.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'A network is as fast as its slowest link.',
        'The router\'s WAN port is 1 GbE.',
        'You\'re capped at ~1 Gbps. Need a 2.5G+ WAN router.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A user has gigabit internet (1 Gbps), a Wi-Fi 6 router supporting 2.4 GHz + 5 GHz (no 6 GHz), and is connecting their laptop in a home office <strong>two drywall walls + 25 feet</strong> from the router. They\'re seeing 30–40 Mbps in a speed test. Which fix is most likely to give the BIGGEST improvement?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Upgrade to a Wi-Fi 7 router — Wi-Fi 7 reaches further</option>' +
          '<option>Run an Ethernet cable to the laptop</option>' +
          '<option>Buy a faster internet plan</option>' +
          '<option>Force the laptop to use 2.4 GHz exclusively</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Run an Ethernet cable to the laptop') return { correct: true, feedback: 'Right. Wi-Fi 5 GHz drops sharply through walls; 2 walls + 25 ft is genuinely brutal RF. Even a Wi-Fi 7 upgrade would only modestly help (the 6 GHz band penetrates worse than 5 GHz; you only really gain in the same-room scenario). A Cat5e cable from router to laptop — even routed along the baseboard — instantly turns 30 Mbps into 900+ Mbps. The cheapest, biggest-impact, most reliable fix in home networking is "use a wire."' };
        if (v === 'Upgrade to a Wi-Fi 7 router — Wi-Fi 7 reaches further') return { correct: false, feedback: 'Wi-Fi 7 has higher peak speeds, not better range. The 6 GHz band Wi-Fi 7 uses actually has WORSE wall penetration than 5 GHz. You\'d gain little here.' };
        if (v === 'Buy a faster internet plan') return { correct: false, feedback: 'You\'re not internet-limited; you\'re using 4% of your 1 Gbps plan. A faster plan won\'t help if Wi-Fi caps you at 30 Mbps.' };
        if (v === 'Force the laptop to use 2.4 GHz exclusively') return { correct: false, feedback: '2.4 GHz penetrates walls better but is much slower (~50 Mbps real-world max in a crowded environment) and shares with microwaves/Bluetooth. You\'d gain at most a few Mbps.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Identify the bottleneck: 30 Mbps is the Wi-Fi link, not the internet plan.',
        'No Wi-Fi upgrade beats a wire for sustained throughput.',
        'Run Ethernet to the laptop. Cheapest, biggest gain.'
      ]
    }
  ]
});
