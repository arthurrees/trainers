// Level 3 — OSI & TCP/IP Layers
NT.registerLevel({
  id: 3,
  title: 'OSI & TCP/IP Layers',
  whyItMatters: 'When you read networking docs you will see "layer 2", "L7 load balancer", "TCP is a transport protocol" everywhere. The layer model is just a vocabulary for who does what — once you have it, the rest of networking falls into place.',
  glossary: ['OSI', 'TCP/IP model', 'L1', 'L2', 'L3', 'L4', 'L7', 'encapsulation', 'frame', 'MAC', 'ARP', 'TCP', 'UDP', 'HTTP', 'DNS', 'TLS'],
  learn: ''
    + '<h4>Why have layers at all?</h4>'
    + '<p>Networking touches everything from <em>"electrical pulses on copper"</em> up to <em>"render the New York Times homepage"</em>. Trying to design that as one giant blob is hopeless. Instead we split it into layers, where each layer does one thing well and treats the layer below as a black box.</p>'
    + '<p>Two models you will see:</p>'
    + '<ul>'
    +   '<li><strong>OSI model</strong> — 7 layers. Academic. Useful as vocabulary; almost nothing implements all 7 cleanly.</li>'
    +   '<li><strong>TCP/IP model</strong> — 4 layers. Practical. Matches how the real internet is built.</li>'
    + '</ul>'

    + '<h4>The two models, side by side</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>OSI #</th><th>OSI name</th><th>TCP/IP layer</th><th>Examples</th></tr>'
    + '<tr><td>7</td><td>Application</td><td rowspan="3" style="background:rgba(122,183,255,0.06)">Application</td><td>HTTP, DNS, SSH, SMTP</td></tr>'
    + '<tr><td>6</td><td>Presentation</td><td>TLS, MIME, character encoding</td></tr>'
    + '<tr><td>5</td><td>Session</td><td>RPC session control, NetBIOS</td></tr>'
    + '<tr><td>4</td><td>Transport</td><td style="background:rgba(122,183,255,0.06)">Transport</td><td>TCP, UDP, ports</td></tr>'
    + '<tr><td>3</td><td>Network</td><td style="background:rgba(122,183,255,0.06)">Internet</td><td>IP, ICMP, routing</td></tr>'
    + '<tr><td>2</td><td>Data Link</td><td rowspan="2" style="background:rgba(122,183,255,0.06)">Link</td><td>Ethernet, Wi-Fi, MAC, ARP</td></tr>'
    + '<tr><td>1</td><td>Physical</td><td>Copper, fiber, radio waves</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">Memory aid</div>'
    + 'For OSI top-down: <strong>A</strong>ll <strong>P</strong>eople <strong>S</strong>eem <strong>T</strong>o <strong>N</strong>eed <strong>D</strong>ata <strong>P</strong>rocessing. (Application, Presentation, Session, Transport, Network, Data Link, Physical.)'
    + '</div>'

    + '<h4>What each layer actually does</h4>'
    + '<ul>'
    +   '<li><strong>Physical (L1)</strong> — get bits onto a wire / fiber / antenna. Voltages, modulation, connectors.</li>'
    +   '<li><strong>Data Link (L2)</strong> — frames between two hosts that share a physical link. Addresses are <strong>MAC</strong>s, scope is one LAN.</li>'
    +   '<li><strong>Network (L3)</strong> — packets across <em>multiple</em> networks. Addresses are <strong>IP</strong>s, scope is global. Routers live here.</li>'
    +   '<li><strong>Transport (L4)</strong> — end-to-end conversations between applications. Addresses are <strong>(IP, port)</strong>. TCP and UDP are the two giants.</li>'
    +   '<li><strong>Session / Presentation</strong> — in OSI these split out "manage a session" and "format / encrypt data". In real life TLS sits about here, but TCP/IP just lumps it into Application.</li>'
    +   '<li><strong>Application (L7)</strong> — the protocol your program actually speaks. HTTP, DNS, SSH, IMAP.</li>'
    + '</ul>'

    + '<h4>Encapsulation</h4>'
    + '<p>When you send data, every layer wraps the layer above it in its own header. By the time it reaches the wire, your "GET /index.html" looks like a russian doll:</p>'
    + '<div class="example"><div class="label">Going down the stack</div>'
    + '<code class="inline">[ Ethernet [ IP [ TCP [ HTTP "GET /index.html" ] ] ] ] CRC</code><br>'
    + 'On the receiving side, each layer peels off its header and hands the inside to the layer above.'
    + '</div>'

    + '<h4>Practical mental model</h4>'
    + '<p>When someone says "Layer 7", they mean the application protocol. <em>"L7 load balancer"</em> = "this thing reads HTTP". <em>"L4 load balancer"</em> = "this thing only knows about IPs and ports, doesn\'t look inside the packet payload". This casual usage is far more common than the formal 7-layer recital.</p>'

    + '<div class="callout"><div class="label">Two messy edges (don\'t worry about them yet)</div>'
    + '<strong>ARP</strong> uses MAC frames but resolves IPs, so it\'s often called "L2.5". <strong>TLS</strong> sits between TCP and HTTP, so it\'s sometimes L5/L6 (OSI) and sometimes "Application" (TCP/IP). Both are fine answers — context decides.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click any protocol to see what layer it lives at.</p>';
    var items = [
      { name: 'HTTP',     osi: 'L7 Application',  tcpip: 'Application', desc: 'How browsers and APIs talk. Plain-text request/response.' },
      { name: 'HTTPS',    osi: 'L7 Application',  tcpip: 'Application', desc: 'HTTP wrapped in TLS. Same layer as HTTP — TLS is below it.' },
      { name: 'DNS',      osi: 'L7 Application',  tcpip: 'Application', desc: 'Name → IP lookups. Runs over UDP (mostly) or TCP.' },
      { name: 'SSH',      osi: 'L7 Application',  tcpip: 'Application', desc: 'Remote login + crypto. Runs over TCP.' },
      { name: 'TLS',      osi: 'L5/6 Session/Presentation', tcpip: 'Application (lumped)', desc: 'Encrypts + authenticates a TCP connection. OSI puts it 5/6; TCP/IP just calls it Application.' },
      { name: 'TCP',      osi: 'L4 Transport',    tcpip: 'Transport',    desc: 'Reliable, ordered byte stream. Adds ports and sequencing on top of IP.' },
      { name: 'UDP',      osi: 'L4 Transport',    tcpip: 'Transport',    desc: 'Fire-and-forget datagrams. 8-byte header, no handshake.' },
      { name: 'IP (v4/v6)', osi: 'L3 Network',    tcpip: 'Internet',     desc: 'Packets across multiple networks. Best-effort.' },
      { name: 'ICMP',     osi: 'L3 Network',      tcpip: 'Internet',     desc: 'Control messages: ping, traceroute, "destination unreachable".' },
      { name: 'ARP',      osi: 'L2 (≈L2.5)',      tcpip: 'Link',         desc: 'Find the MAC address for an IP on the same LAN. Boundary protocol.' },
      { name: 'Ethernet', osi: 'L2 Data Link',    tcpip: 'Link',         desc: 'Frames on a wire. MAC addresses, EtherType, CRC.' },
      { name: 'Wi-Fi (802.11)', osi: 'L1 + L2',   tcpip: 'Link',         desc: 'Radio (L1) + framing/MAC (L2) — it really does both.' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a protocol</span>';
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = it.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + it.name + '</strong></div>'
        + '<div><span class="muted">OSI:</span> ' + it.osi + '</div>'
        + '<div><span class="muted">TCP/IP:</span> ' + it.tcpip + '</div>'
        + '<div style="margin-top:6px">' + it.desc + '</div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which TCP/IP layer is responsible for delivering an ordered, reliable byte stream between two applications?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Link', 'Internet', 'Transport', 'Application'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Transport') return { correct: true, feedback: 'Right. Transport. TCP lives there. (Internet/IP is best-effort packets; reliability is added one layer up.)' };
        return { correct: false, feedback: 'Not quite. TCP — the protocol that does ordered, reliable delivery — is at the Transport layer.' };
      },
      hints: [
        'Four layers, bottom to top: Link → Internet → Transport → Application.',
        'IP is "best effort" — it can lose packets. Reliability has to be added by something above it.',
        'TCP does that, and TCP is at the Transport layer.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Order these protocols from <strong>highest</strong> layer (closest to the application) to <strong>lowest</strong> (closest to the wire). Tick the boxes only if the order, top → bottom, is exactly: <strong>HTTP, TCP, IP, Ethernet</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'HTTP is higher than TCP.',  t: true },
          { label: 'TCP is higher than IP.',    t: true },
          { label: 'IP is higher than Ethernet.', t: true },
          { label: 'Ethernet is higher than IP.', t: false },
          { label: 'TCP is at the same layer as HTTP.', t: false }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. Top→bottom: HTTP (Application) → TCP (Transport) → IP (Internet) → Ethernet (Link). Three statements are true; the last two are wrong.' };
        return { correct: false, feedback: 'Not quite. The stack is HTTP > TCP > IP > Ethernet. Ethernet is the lowest of the four. HTTP and TCP are at different layers (Application vs Transport).' };
      },
      hints: [
        'Layers from top to bottom in TCP/IP: Application → Transport → Internet → Link.',
        'HTTP is Application. TCP is Transport. IP is Internet. Ethernet is Link.',
        'So top→bottom: HTTP, TCP, IP, Ethernet. The first three statements are true; the last two are not.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Pick all the statements that are <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'A "Layer 7 load balancer" can read the HTTP request and route based on URL or headers.', t: true },
          { label: 'A "Layer 4 load balancer" routes based on IP and port without inspecting the payload.', t: true },
          { label: 'Routers operate at Layer 2.', t: false },
          { label: 'Switches forward frames using MAC addresses (Layer 2).', t: true },
          { label: 'TLS only encrypts the IP header, not the data above it.', t: false },
          { label: 'When you send data, lower layers wrap upper-layer data in their own headers (encapsulation).', t: true }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. L7 LBs see HTTP; L4 LBs only see IP+port. Routers = L3 (not L2). Switches = L2 (MAC). TLS encrypts the application data ABOVE the IP layer, not the IP header. Encapsulation = lower layers wrap upper layers.' };
        return { correct: false, feedback: 'Re-check: routers are L3 (IP); switches are L2 (MAC). TLS encrypts payload, not IP headers (the network would not be able to route it otherwise). The other three are true.' };
      },
      hints: [
        'Layer 7 = Application. Layer 4 = Transport. Layer 3 = Network (routers!). Layer 2 = Data Link (switches!).',
        'TLS sits between TCP and HTTP — it can\'t encrypt headers below it (otherwise routers couldn\'t route).',
        'Four statements are true: L7 LB, L4 LB, switches, encapsulation. Two are false: "routers at L2" and "TLS encrypts IP header".'
      ]
    }
  ]
});
