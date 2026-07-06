// Level 5 — Switches vs Routers
NT.registerLevel({
  id: 5,
  title: 'Switches vs Routers',
  whyItMatters: 'Almost every "boxes that forward packets" question collapses into one of two: it\'s either a switch (L2, MAC) or a router (L3, IP). Knowing which is which fixes 80% of network confusion.',
  glossary: ['switch', 'router', 'MAC table', 'broadcast domain', 'collision domain', 'default gateway', 'L2', 'L3', 'frame'],
  learn: ''
    + '<h4>Two boxes, two jobs</h4>'
    + '<p>Both switches and routers are <em>"forwarders"</em> — they take a frame/packet on one port and send it out another. The difference is which address they use:</p>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th></th><th>Switch</th><th>Router</th></tr>'
    + '<tr><td>Layer</td><td>L2 (Data Link)</td><td>L3 (Network)</td></tr>'
    + '<tr><td>Forwards by</td><td>destination MAC</td><td>destination IP</td></tr>'
    + '<tr><td>Lookup table</td><td>MAC table (learned)</td><td>routing table (configured / learned by protocols)</td></tr>'
    + '<tr><td>Scope</td><td>one LAN</td><td>between LANs</td></tr>'
    + '<tr><td>Stops broadcasts?</td><td>no — forwards</td><td>yes — drops</td></tr>'
    + '</table>'

    + '<h4>How a switch learns</h4>'
    + '<p>A switch starts with an empty <strong>MAC table</strong>. Every time a frame comes in, it does two things:</p>'
    + '<ol>'
    +   '<li><strong>Learn</strong>: record "source MAC X was last seen on port P".</li>'
    +   '<li><strong>Forward</strong>: look up the destination MAC.<br>'
    +     '&nbsp;&nbsp;– If known → send out the specific port.<br>'
    +     '&nbsp;&nbsp;– If unknown → <strong>flood</strong> out every port except the one it came in on.<br>'
    +     '&nbsp;&nbsp;– If destination is broadcast (ff:ff:ff:ff:ff:ff) → flood.'
    +   '</li>'
    + '</ol>'
    + '<p>That\'s the entire algorithm. Within a few frames the table fills in and the switch unicasts perfectly without configuration.</p>'

    + '<h4>Broadcast domain vs collision domain</h4>'
    + '<ul>'
    +   '<li><strong>Collision domain</strong> — set of ports where two hosts could "talk over" each other. A modern switch gives <em>each port its own collision domain</em>, so collisions essentially don\'t happen anymore. (This is why hubs went extinct.)</li>'
    +   '<li><strong>Broadcast domain</strong> — set of ports a broadcast frame will reach. A switch keeps everything in one broadcast domain. A router <em>separates</em> broadcast domains.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Why this matters</div>'
    + 'If your LAN gets too big, broadcast traffic (ARP, DHCP discoveries, mDNS) starts eating bandwidth. The fix is to subdivide with routers (or VLANs + a router-on-a-stick). That\'s the practical reason subnetting exists.'
    + '</div>'

    + '<h4>What a router does (preview)</h4>'
    + '<p>A router has multiple interfaces, each in a different IP subnet. When a packet arrives:</p>'
    + '<ol>'
    +   '<li>Decapsulate the Ethernet frame, look at the destination IP.</li>'
    +   '<li>Look up that IP in the routing table → find the best matching prefix → get the next hop and outgoing interface.</li>'
    +   '<li>Decrement TTL. If 0, drop and send ICMP "Time Exceeded" (this is what traceroute exploits).</li>'
    +   '<li>ARP for the next-hop\'s MAC if not cached.</li>'
    +   '<li>Re-frame with new src MAC (router\'s outgoing interface) and new dest MAC (next hop), keep IPs unchanged, transmit.</li>'
    + '</ol>'
    + '<p>(Level 6 is dedicated to the routing-table lookup — the most interesting step here.)</p>'

    + '<h4>"Layer 3 switch" — the trick name</h4>'
    + '<p>You\'ll see this in datacenter docs. A "L3 switch" is just a router built with switching-grade hardware (fast, lots of ports). Same algorithm as a router; people just call it a switch because it lives in a switch chassis.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'A switch with 3 hosts. Click "send" buttons; watch the MAC table fill in and see when the switch floods vs unicasts.';
    container.appendChild(help);

    var hosts = [
      { name: 'H1', mac: '11:11:11:11:11:11', port: 1 },
      { name: 'H2', mac: '22:22:22:22:22:22', port: 2 },
      { name: 'H3', mac: '33:33:33:33:33:33', port: 3 }
    ];
    var macTable = {}; // mac -> port

    var topo = document.createElement('div');
    topo.className = 'formula-box';
    topo.style.fontSize = '13px';
    container.appendChild(topo);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    container.appendChild(ctrls);

    var log = document.createElement('div');
    log.className = 'formula-box';
    log.style.fontSize = '13px';
    log.style.maxHeight = '240px';
    log.style.overflowY = 'auto';
    container.appendChild(log);

    function renderTopo() {
      var rows = '<div><strong>Switch S1</strong> &nbsp; <span class="muted">MAC table:</span></div>';
      var keys = Object.keys(macTable);
      if (keys.length === 0) rows += '<div class="muted">&nbsp;&nbsp;empty</div>';
      else keys.forEach(function (mac) {
        rows += '<div>&nbsp;&nbsp;' + mac + ' &nbsp;→&nbsp; port ' + macTable[mac] + '</div>';
      });
      rows += '<div style="margin-top:8px"><strong>Hosts</strong></div>';
      hosts.forEach(function (h) {
        rows += '<div>&nbsp;&nbsp;' + h.name + ' &nbsp; <span class="muted">MAC=' + h.mac + ', port=' + h.port + '</span></div>';
      });
      topo.innerHTML = rows;
    }

    function logMsg(html) {
      var d = document.createElement('div');
      d.style.padding = '4px 0';
      d.style.borderTop = '1px solid var(--border)';
      d.innerHTML = html;
      log.insertBefore(d, log.firstChild);
    }

    function send(srcIdx, dstIdx) {
      var src = hosts[srcIdx], dst = hosts[dstIdx];
      // Switch learns
      var learnedNow = !macTable[src.mac];
      macTable[src.mac] = src.port;

      var lines = [];
      lines.push('<strong>' + src.name + ' → ' + dst.name + '</strong>');
      lines.push('Frame: src=' + src.mac + ' dst=' + dst.mac);
      lines.push('Switch learns: ' + src.mac + ' is on port ' + src.port + (learnedNow ? ' <span style="color:var(--good)">(new!)</span>' : ' <span class="muted">(already knew)</span>'));
      if (macTable[dst.mac]) {
        lines.push('Switch knows ' + dst.mac + ' is on port ' + macTable[dst.mac] + ' → <span style="color:var(--accent)">unicast out port ' + macTable[dst.mac] + '</span>');
      } else {
        var floodPorts = hosts.filter(function (h) { return h.port !== src.port; }).map(function (h) { return h.port; });
        lines.push('Switch does NOT know ' + dst.mac + ' → <span style="color:var(--warn)">flood out ports ' + floodPorts.join(', ') + '</span>');
      }
      logMsg(lines.join('<br>'));
      renderTopo();
    }

    function broadcast(srcIdx) {
      var src = hosts[srcIdx];
      var learnedNow = !macTable[src.mac];
      macTable[src.mac] = src.port;
      var floodPorts = hosts.filter(function (h) { return h.port !== src.port; }).map(function (h) { return h.port; });
      var lines = [];
      lines.push('<strong>' + src.name + ' → broadcast</strong>');
      lines.push('Frame: src=' + src.mac + ' dst=ff:ff:ff:ff:ff:ff');
      lines.push('Switch learns ' + src.mac + ' on port ' + src.port + (learnedNow ? ' <span style="color:var(--good)">(new!)</span>' : ''));
      lines.push('Destination is broadcast → <span style="color:var(--warn)">flood out ports ' + floodPorts.join(', ') + '</span>');
      logMsg(lines.join('<br>'));
      renderTopo();
    }

    function clearTable() {
      macTable = {};
      logMsg('<em class="muted">— MAC table cleared —</em>');
      renderTopo();
    }

    [[0, 1], [0, 2], [1, 0], [2, 1]].forEach(function (pair) {
      var b = document.createElement('button');
      b.className = 'secondary-btn';
      b.textContent = hosts[pair[0]].name + ' → ' + hosts[pair[1]].name;
      b.addEventListener('click', function () { send(pair[0], pair[1]); });
      ctrls.appendChild(b);
    });
    var bcastBtn = document.createElement('button');
    bcastBtn.className = 'secondary-btn';
    bcastBtn.textContent = 'H1 → broadcast';
    bcastBtn.addEventListener('click', function () { broadcast(0); });
    ctrls.appendChild(bcastBtn);

    var clrBtn = document.createElement('button');
    clrBtn.className = 'ghost-btn';
    clrBtn.textContent = 'Clear MAC table';
    clrBtn.addEventListener('click', clearTable);
    ctrls.appendChild(clrBtn);

    renderTopo();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A device that forwards based on <strong>MAC addresses</strong> within a single LAN is a:',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['router', 'switch', 'firewall', 'modem'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'switch') return { correct: true, feedback: 'Right. Switches operate at L2 — they forward frames using MAC addresses, learned by watching the source MAC of every frame they see.' };
        if (v === 'router') return { correct: false, feedback: 'Routers forward by IP (L3), not MAC. They cross between networks.' };
        return { correct: false, feedback: 'Switches forward by MAC, within one LAN.' };
      },
      hints: [
        'MAC addresses are L2. Routers operate at L3.',
        'Switches build a "MAC table" by watching source addresses.',
        'Answer: switch.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re on LAN A (192.168.1.0/24). A host on LAN A sends a broadcast frame (dest MAC <code class="inline">ff:ff:ff:ff:ff:ff</code>). LAN A is connected to LAN B through a router. Will the broadcast appear on LAN B?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Yes', 'No'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'No') return { correct: true, feedback: 'Right. Routers do not forward L2 broadcasts. The broadcast stays inside LAN A — that\'s exactly what "router separates broadcast domains" means.' };
        if (v === 'Yes') return { correct: false, feedback: 'Switches forward broadcasts; routers don\'t. That\'s a key difference between them.' };
        return { correct: false, feedback: 'Pick yes or no.' };
      },
      hints: [
        'Switches are transparent to broadcasts. Routers are not.',
        'The set of ports a broadcast can reach is called a "broadcast domain". Routers separate them.',
        'Answer: No.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A switch receives a frame whose destination MAC <strong>is not in its MAC table</strong>. The frame arrived on port 2. The switch has 4 ports. What does the switch do?',
      mountInput: function (c) {
        var opts = [
          'Drops the frame.',
          'Sends an ARP request for the destination MAC.',
          'Forwards the frame out ports 1, 3, and 4 (all ports except the one it arrived on).',
          'Forwards the frame out only port 1.',
          'Forwards the frame out all 4 ports including port 2.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. This is called "unknown unicast flooding". The switch sends a copy out every port except the incoming one — eventually the destination will respond, the switch will learn its port, and future frames will be unicast.' };
        if (v === 0) return { correct: false, feedback: 'A switch never silently drops unknown unicast — it floods, hoping the destination is somewhere on the LAN.' };
        if (v === 1) return { correct: false, feedback: 'Switches don\'t do ARP — that\'s a host job. The switch floods at L2 and lets the conversation happen.' };
        if (v === 3) return { correct: false, feedback: 'It can\'t pick a single port without knowing where the destination is. That\'s the whole point — it doesn\'t know.' };
        if (v === 4) return { correct: false, feedback: 'Close, but it doesn\'t echo back out the incoming port — that would just send the frame back to the sender.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'When the switch doesn\'t know a destination MAC, it can\'t pick a single port. So it does the safe thing.',
        '"Unknown unicast flooding" — send out every port except the one it came in on.',
        'For a 4-port switch with the frame arriving on port 2, that means out ports 1, 3, and 4.'
      ]
    }
  ]
});
