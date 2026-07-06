// Level 4 — Ethernet, MAC, ARP
NT.registerLevel({
  id: 4,
  title: 'Ethernet, MAC & ARP',
  whyItMatters: 'IP gets all the press, but inside any LAN — your house, an office, a data center rack — packets actually move as Ethernet frames addressed by MAC. ARP is the missing-link translator that lets IP work on top of Ethernet at all.',
  glossary: ['MAC', 'frame', 'ARP', 'broadcast (MAC)', 'EtherType', 'L2', 'L3'],
  learn: ''
    + '<h4>The MAC address</h4>'
    + '<p>Every network interface — your Ethernet port, your Wi-Fi card — has a 48-bit number burned into its firmware called a <strong>MAC address</strong>. It\'s written as six hex pairs:</p>'
    + '<div class="example"><div class="label">A typical MAC</div>'
    + '<code class="inline">aa:bb:cc:11:22:33</code><br>'
    + 'First 3 bytes (<code class="inline">aa:bb:cc</code>) — <strong>OUI</strong>, the vendor identifier (Apple, Intel, Cisco, ...).<br>'
    + 'Last 3 bytes (<code class="inline">11:22:33</code>) — vendor-assigned, unique within that vendor.'
    + '</div>'
    + '<p>Special MACs to know:</p>'
    + '<ul>'
    +   '<li><code class="inline">ff:ff:ff:ff:ff:ff</code> — <strong>broadcast</strong>. A frame here goes to every host on the LAN.</li>'
    +   '<li><code class="inline">01:00:5e:xx:xx:xx</code> — IPv4 multicast.</li>'
    +   '<li><code class="inline">33:33:xx:xx:xx:xx</code> — IPv6 multicast.</li>'
    + '</ul>'

    + '<h4>The Ethernet frame</h4>'
    + '<p>An Ethernet frame is the L2 envelope your packets ride in:</p>'
    + '<div class="example"><div class="label">Ethernet II frame</div>'
    + '<code class="inline">[ Dest MAC | Src MAC | EtherType | ... payload ... | CRC ]</code><br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;6 bytes &nbsp;&nbsp; 6 bytes &nbsp;&nbsp;&nbsp; 2 bytes &nbsp;&nbsp;&nbsp;&nbsp;46–1500 bytes&nbsp;&nbsp;&nbsp; 4 bytes'
    + '</div>'
    + '<p><strong>EtherType</strong> tells the receiver what protocol is in the payload:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">0x0800</span>IPv4</div>'
    +   '<div class="symbol-chip"><span class="sym">0x86DD</span>IPv6</div>'
    +   '<div class="symbol-chip"><span class="sym">0x0806</span>ARP</div>'
    +   '<div class="symbol-chip"><span class="sym">0x8100</span>VLAN tag (802.1Q)</div>'
    + '</div>'

    + '<h4>The Ethernet–IP gap</h4>'
    + '<p>Here\'s the puzzle. When your laptop wants to send an IP packet to <code class="inline">192.168.1.42</code>, it can\'t put that IP into an Ethernet frame — Ethernet frames need <em>MAC</em> addresses. So how does your laptop discover <em>"which MAC address has IP 192.168.1.42?"</em></p>'
    + '<p>The answer is <strong>ARP</strong> — Address Resolution Protocol. It runs on the same LAN as a tiny query/response over Ethernet broadcast.</p>'

    + '<h4>The ARP exchange (4 steps)</h4>'
    + '<ol>'
    +   '<li>Host A doesn\'t know B\'s MAC. It <strong>broadcasts</strong> a frame: dest MAC <code class="inline">ff:ff:ff:ff:ff:ff</code>, EtherType 0x0806, payload = "Who has 192.168.1.42? Tell 192.168.1.10."</li>'
    +   '<li>Every host on the LAN sees the broadcast. Only B (which has that IP) cares.</li>'
    +   '<li>B replies <strong>unicast</strong> to A: dest MAC = A\'s MAC, payload = "192.168.1.42 is at <code class="inline">aa:bb:cc:11:22:33</code>".</li>'
    +   '<li>A caches the (IP → MAC) mapping in its <strong>ARP cache</strong> for a few minutes. Future packets to B can skip the broadcast.</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">Two important details</div>'
    + '<strong>1.</strong> ARP only works on the local subnet. If the destination IP is off-LAN, your host ARPs for the <em>default gateway</em>\'s MAC instead, and lets the gateway forward. <br>'
    + '<strong>2.</strong> ARP has zero authentication. Anyone on the LAN can lie ("I\'m the gateway!") — that\'s <strong>ARP spoofing</strong>, the basis of many LAN attacks.'
    + '</div>'

    + '<h4>Off-LAN sends — the destination MAC trick</h4>'
    + '<p>If the destination IP is on a different subnet, your laptop puts <em>the gateway\'s MAC</em> in the Ethernet frame, but leaves the destination <em>IP</em> as the original target. The router unpacks, looks at the IP, and re-frames with a new MAC for the next hop. The IP stays the same end-to-end; the MAC changes every hop.</p>'
    + '<div class="example"><div class="label">From your laptop to google.com</div>'
    + 'Frame 1 (LAN): src MAC = laptop, dest MAC = router, src IP = laptop, dest IP = Google.<br>'
    + 'Frame 2 (ISP link): src MAC = router, dest MAC = next router, src IP = laptop (or NAT), dest IP = Google.<br>'
    + 'And so on, hop by hop.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Step through an ARP exchange on a 3-host LAN. Hosts in green are active each step. Yellow arrows = ARP request (broadcast). Blue arrow = ARP reply (unicast).';
    container.appendChild(help);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 360;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var stepBox = document.createElement('div');
    stepBox.className = 'formula-box';
    stepBox.style.fontSize = '13px';
    container.appendChild(stepBox);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    var nextBtn = document.createElement('button');
    nextBtn.className = 'primary-btn';
    nextBtn.textContent = 'Next step →';
    var resetBtn = document.createElement('button');
    resetBtn.className = 'ghost-btn';
    resetBtn.textContent = 'Reset';
    ctrls.appendChild(nextBtn);
    ctrls.appendChild(resetBtn);
    container.appendChild(ctrls);

    var step = 0;
    var hosts = [
      { name: 'Host A', ip: '192.168.1.10', mac: 'aa:aa:aa:aa:aa:aa', cache: {}, x: 130, y: 280 },
      { name: 'Host B', ip: '192.168.1.42', mac: 'bb:bb:bb:bb:bb:bb', cache: {}, x: 360, y: 290 },
      { name: 'Host C', ip: '192.168.1.99', mac: 'cc:cc:cc:cc:cc:cc', cache: {}, x: 590, y: 280 },
      { name: 'Switch', ip: '',             mac: '',                  cache: null, x: 360, y: 130 }
    ];

    function drawArrow(ctx, x1, y1, x2, y2, color, label) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
      var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx*dx + dy*dy);
      var sx = x1 + dx / d * 30, sy = y1 + dy / d * 30;
      var ex = x2 - dx / d * 30, ey = y2 - dy / d * 30;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      var ah = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 9 * Math.cos(ah - Math.PI / 7), ey - 9 * Math.sin(ah - Math.PI / 7));
      ctx.lineTo(ex - 9 * Math.cos(ah + Math.PI / 7), ey - 9 * Math.sin(ah + Math.PI / 7));
      ctx.closePath(); ctx.fill();
      if (label) {
        var midX = (sx + ex) / 2, midY = (sy + ey) / 2;
        ctx.fillStyle = '#1f2533';
        var w = ctx.measureText(label).width + 8;
        ctx.fillRect(midX - w / 2, midY - 9, w, 16);
        ctx.fillStyle = color; ctx.font = '11px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);
      }
    }

    function renderTopo(activeHighlight) {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#9aa3b2'; ctx.font = '11px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('LAN — 192.168.1.0/24', canvas.width / 2, 12);

      // Wires from each host to switch
      hosts.slice(0, 3).forEach(function (h) {
        ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(h.x, h.y - 28); ctx.lineTo(hosts[3].x, hosts[3].y + 18); ctx.stroke();
      });

      // Step-specific arrows for the actual frame flow
      var s = steps[step];
      if (s.arrows) {
        s.arrows.forEach(function (a) {
          drawArrow(ctx, a.from.x, a.from.y - 28, a.to.x, a.to.y - 28, a.color, a.label);
        });
      }

      // Hosts and switch
      hosts.forEach(function (h, idx) {
        var isHighlight = (activeHighlight || []).indexOf(h.name) >= 0;
        var isSwitch = idx === 3;
        var w = isSwitch ? 90 : 110, hgt = 56;
        var color = isHighlight ? '#4ade80' : (isSwitch ? '#a78bfa' : '#7ab7ff');
        ctx.fillStyle = isHighlight ? '#4ade80' : '#1f2533';
        ctx.strokeStyle = color;
        ctx.lineWidth = isHighlight ? 3 : 1.5;
        ctx.fillRect(h.x - w / 2, h.y - hgt / 2, w, hgt);
        ctx.strokeRect(h.x - w / 2, h.y - hgt / 2, w, hgt);
        ctx.fillStyle = isHighlight ? '#0a0c11' : color;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(h.name, h.x, h.y - 12);
        if (!isSwitch) {
          ctx.font = '10px monospace';
          ctx.fillStyle = isHighlight ? '#0a0c11' : '#9aa3b2';
          ctx.fillText(h.ip, h.x, h.y);
          ctx.fillText(h.mac.substring(0, 11) + '..', h.x, h.y + 12);
        }
      });

      // ARP cache state for Host A (most relevant)
      ctx.fillStyle = '#9aa3b2'; ctx.font = '10px monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      var cacheStr = Object.keys(hosts[0].cache).length === 0 ? '(empty)'
        : Object.keys(hosts[0].cache).map(function (k) { return k + ' → ' + hosts[0].cache[k].substring(0, 11) + '..'; }).join('  ');
      ctx.fillText('Host A ARP cache: ' + cacheStr, 12, canvas.height - 16);
    }

    var steps = [
      {
        title: '0. Initial state',
        desc: 'Host A wants to send an IP packet to 192.168.1.42 (Host B). A checks its ARP cache and finds nothing. Time to ARP.',
        highlight: ['Host A'],
        arrows: [],
        action: function () { /* nothing */ }
      },
      {
        title: '1. ARP request — broadcast',
        desc: 'A sends an Ethernet frame:<br>'
            + '<code class="inline">dest MAC = ff:ff:ff:ff:ff:ff</code> (broadcast)<br>'
            + '<code class="inline">src MAC = aa:aa:aa:aa:aa:aa</code><br>'
            + '<code class="inline">EtherType = 0x0806</code> (ARP)<br>'
            + '<code class="inline">payload = "Who has 192.168.1.42? Tell 192.168.1.10."</code><br>'
            + 'Every host on the LAN receives this frame.',
        highlight: ['Host A', 'Host B', 'Host C'],
        arrows: [
          { from: hosts[0], to: hosts[1], color: '#fbbf24', label: 'ARP request (broadcast)' },
          { from: hosts[0], to: hosts[2], color: '#fbbf24', label: '' }
        ],
        action: function () { /* nothing */ }
      },
      {
        title: '2. C ignores; B answers',
        desc: 'Host C reads the request, sees its IP isn\'t 192.168.1.42, and drops it. Host B sees its IP and prepares a reply.',
        highlight: ['Host B'],
        arrows: [],
        action: function () { /* nothing */ }
      },
      {
        title: '3. ARP reply — unicast',
        desc: 'B sends an Ethernet frame:<br>'
            + '<code class="inline">dest MAC = aa:aa:aa:aa:aa:aa</code> (back to A)<br>'
            + '<code class="inline">src MAC = bb:bb:bb:bb:bb:bb</code><br>'
            + '<code class="inline">EtherType = 0x0806</code> (ARP)<br>'
            + '<code class="inline">payload = "192.168.1.42 is at bb:bb:bb:bb:bb:bb."</code>',
        highlight: ['Host A', 'Host B'],
        arrows: [
          { from: hosts[1], to: hosts[0], color: '#7ab7ff', label: 'ARP reply (unicast)' }
        ],
        action: function () { hosts[0].cache['192.168.1.42'] = 'bb:bb:bb:bb:bb:bb'; }
      },
      {
        title: '4. A caches and sends the real packet',
        desc: 'A stores the mapping. Now A can frame the IP packet with dest MAC = bb:bb:bb:bb:bb:bb, EtherType 0x0800 (IPv4), and send. Future packets to 192.168.1.42 will skip the ARP — until the cache entry expires (typically minutes).',
        highlight: ['Host A', 'Host B'],
        arrows: [
          { from: hosts[0], to: hosts[1], color: '#4ade80', label: 'IP packet (unicast)' }
        ],
        action: function () { /* already cached above */ }
      }
    ];

    function render() {
      var s = steps[step];
      stepBox.innerHTML = '<div><strong style="color:var(--accent)">' + s.title + '</strong></div><div style="margin-top:6px">' + s.desc + '</div>';
      renderTopo(s.highlight);
      nextBtn.disabled = step >= steps.length - 1;
    }

    nextBtn.addEventListener('click', function () {
      if (step >= steps.length - 1) return;
      step++;
      steps[step].action();
      render();
    });
    resetBtn.addEventListener('click', function () {
      step = 0;
      hosts.forEach(function (h) { h.cache = {}; });
      render();
    });

    steps[0].action();
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the destination MAC address of an <strong>ARP request</strong>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = ['00:00:00:00:00:00', 'ff:ff:ff:ff:ff:ff', 'the source\'s own MAC', 'the gateway\'s MAC'];
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'ff:ff:ff:ff:ff:ff') return { correct: true, feedback: 'Right. ARP requests are broadcast — they need to reach every host on the LAN, because the sender doesn\'t yet know which host owns the target IP.' };
        return { correct: false, feedback: 'Not quite. The request has to reach every host on the LAN (since the sender doesn\'t know which host owns the IP). That\'s the broadcast MAC ff:ff:ff:ff:ff:ff.' };
      },
      hints: [
        'The whole point of an ARP request is to ASK every host "do any of you have this IP?"',
        'A frame addressed to every host on the LAN is called a broadcast.',
        'The L2 broadcast MAC is all 1s: ff:ff:ff:ff:ff:ff.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'In an Ethernet frame, the <strong>EtherType</strong> field indicates which protocol is inside. What is the EtherType for an ARP frame?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = ['0x0800', '0x0806', '0x86DD', '0x8100'];
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '0x0806') return { correct: true, feedback: 'Right. 0x0806 = ARP. The big four to know: 0x0800 IPv4, 0x86DD IPv6, 0x0806 ARP, 0x8100 VLAN tag.' };
        if (v === '0x0800') return { correct: false, feedback: '0x0800 is IPv4. ARP is 0x0806.' };
        if (v === '0x86DD') return { correct: false, feedback: '0x86DD is IPv6. ARP is 0x0806.' };
        if (v === '0x8100') return { correct: false, feedback: '0x8100 is the 802.1Q VLAN tag header. ARP is 0x0806.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Four EtherTypes worth memorizing.',
        'IPv4 is 0x0800, IPv6 is 0x86DD. ARP is the third one in the list.',
        'ARP = 0x0806.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Host A (192.168.1.10) wants to send a packet to <code class="inline">8.8.8.8</code>, which is on the public internet. A\'s default gateway is 192.168.1.1 (MAC <code class="inline">11:11:11:11:11:11</code>); 8.8.8.8\'s MAC, when seen on a remote network, would be <code class="inline">88:88:88:88:88:88</code>. What goes in the <strong>destination MAC</strong> field of the very first Ethernet frame A puts on the wire?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = [
          'aa:aa:aa:aa:aa:aa (A\'s own MAC)',
          '88:88:88:88:88:88 (8.8.8.8\'s MAC)',
          '11:11:11:11:11:11 (the gateway\'s MAC)',
          'ff:ff:ff:ff:ff:ff (broadcast)'
        ];
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v && v.indexOf('11:11:11:11:11:11') >= 0) {
          return { correct: true, feedback: 'Right. The destination IP stays 8.8.8.8 (end-to-end), but at L2 the frame is going to the next hop, which is the gateway. So the dest MAC is the gateway\'s MAC. The gateway will then re-frame with a new dest MAC for the next hop.' };
        }
        if (v && v.indexOf('88:88:88') >= 0) {
          return { correct: false, feedback: 'A doesn\'t even know 8.8.8.8\'s MAC, and it wouldn\'t help — MAC addresses don\'t cross routers. The first hop is the gateway.' };
        }
        if (v && v.indexOf('ff:ff') >= 0) {
          return { correct: false, feedback: 'Broadcast would flood the LAN. There\'s no need for that — A knows the gateway\'s MAC (or ARPs for it once and caches it). Direct unicast to the gateway.' };
        }
        return { correct: false, feedback: 'Not quite. The destination IP stays 8.8.8.8, but the destination MAC is the next hop on this LAN — which is the gateway.' };
      },
      hints: [
        'MAC addresses are local to one LAN; they change every hop. IP addresses stay end-to-end.',
        'For an off-LAN destination, the next hop on YOUR LAN is the default gateway.',
        'So the dest MAC is the gateway\'s MAC: 11:11:11:11:11:11.'
      ]
    }
  ]
});
