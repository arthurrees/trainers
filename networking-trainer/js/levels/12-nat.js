// Level 12 — NAT & Port Translation
NT.registerLevel({
  id: 12,
  title: 'NAT & Port Translation',
  whyItMatters: 'Your home has dozens of devices and one public IP. NAT is the magic that lets all of them talk to the internet at once — and the source of every "why can\'t my friend join my Minecraft server?" question.',
  glossary: ['NAT', 'PAT', 'port forwarding', 'port', 'private IP', 'default gateway'],
  learn: ''
    + '<h4>The address shortage</h4>'
    + '<p>IPv4 has 2³² ≈ 4.3 billion addresses. The world has tens of billions of devices. Something had to give. <strong>NAT</strong> (Network Address Translation) was the patch that bought IPv4 thirty extra years.</p>'
    + '<p>The idea: only ISPs and servers need globally unique public IPs. Devices inside a home or office use addresses from the <em>private</em> ranges (10/8, 172.16/12, 192.168/16) that overlap with everyone else\'s. The router rewrites packets on the way out and on the way back.</p>'

    + '<h4>The basic rewrite</h4>'
    + '<div class="example"><div class="label">Outbound packet</div>'
    + 'Before NAT: src=<code class="inline">192.168.1.42:51234</code>, dst=<code class="inline">93.184.216.34:443</code><br>'
    + 'After NAT:&nbsp; src=<code class="inline">203.0.113.7:38491</code>, dst=<code class="inline">93.184.216.34:443</code><br>'
    + '<span class="muted">The router replaced the private source IP with its own public IP, and assigned a fresh source port. It records the mapping in its connection-tracking table.</span>'
    + '</div>'
    + '<div class="example"><div class="label">When the reply comes back</div>'
    + 'Inbound: src=<code class="inline">93.184.216.34:443</code>, dst=<code class="inline">203.0.113.7:38491</code><br>'
    + 'After de-NAT: dst rewritten back to <code class="inline">192.168.1.42:51234</code> using the table.<br>'
    + '<span class="muted">The router uses the destination port as the lookup key — that\'s why each connection needs a unique source port.</span>'
    + '</div>'

    + '<h4>NAT vs PAT (NAPT)</h4>'
    + '<p>Strictly, "NAT" rewrites only IPs (one private IP ↔ one public IP). What home routers actually do is <strong>Port Address Translation</strong> (PAT) — they rewrite the source <em>port</em> too, so many private IPs share one public IP. People still casually call this "NAT", but PAT is the precise name.</p>'

    + '<h4>The connection-tracking table</h4>'
    + '<p>Every active flow gets one row:</p>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Proto</th><th>Inside src</th><th>Public src (after NAT)</th><th>Destination</th><th>Idle TTL</th></tr>'
    + '<tr><td>TCP</td><td>192.168.1.42:51234</td><td>203.0.113.7:38491</td><td>93.184.216.34:443</td><td>2 h</td></tr>'
    + '<tr><td>TCP</td><td>192.168.1.99:54000</td><td>203.0.113.7:38492</td><td>93.184.216.34:443</td><td>2 h</td></tr>'
    + '<tr><td>UDP</td><td>192.168.1.42:5353</td><td>203.0.113.7:5353</td><td>1.1.1.1:53</td><td>30 s</td></tr>'
    + '</table>'
    + '<p>Note that two devices both connecting to the same external service (port 443) get different <em>public</em> source ports — that\'s how the router tells the return packets apart.</p>'

    + '<h4>The asymmetry: outbound is easy, inbound is hard</h4>'
    + '<p>NAT works smoothly when an inside host initiates a connection — the table entry gets created on the way out, and replies match. But what about <em>incoming</em> connections, like someone trying to reach a server inside your house?</p>'
    + '<p>By default, those packets arrive at your router, which has nothing in its table for them, and drops them. This is great for security (your laptop isn\'t exposed to the internet by default) but bad if you actually want to host something.</p>'

    + '<h4>Port forwarding — the explicit override</h4>'
    + '<p>To host a server, you tell the router: "any TCP packet hitting public port 25565, send it to 192.168.1.42 port 25565." That static rule lets the inbound packet through despite no entry in the dynamic table. This is why hosting a Minecraft server, an SSH server, or a self-hosted blog requires "opening a port" on your router.</p>'

    + '<h4>Other NAT pain points</h4>'
    + '<ul>'
    +   '<li><strong>Symmetric NAT</strong> — some routers assign a different public source port for every distinct destination, which breaks NAT-traversal techniques used by VoIP, gaming, and WebRTC.</li>'
    +   '<li><strong>Hairpin NAT</strong> — when an inside device tries to reach <em>itself</em> via the public IP. Many cheap routers don\'t handle this and the connection fails.</li>'
    +   '<li><strong>Protocols that embed IPs</strong> — old FTP and SIP put IP addresses inside their payloads; NAT has to deep-inspect and rewrite those too. Hence "ALGs" — Application Layer Gateways.</li>'
    +   '<li><strong>End-to-end principle</strong> — NAT breaks it. Two arbitrary internet hosts can no longer just talk; one of them has to be reachable.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Why IPv6 makes NAT (mostly) go away</div>'
    + 'IPv6 has 2¹²⁸ addresses — every device, every appliance, every grain of sand can have its own globally unique address. So pure NAT is unnecessary. (Some networks still use NAT66 for privacy or multihoming, but it\'s a choice, not a forced workaround.)'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click "open connection" buttons to see the NAT table fill up. Each connection gets a unique public source port.';
    container.appendChild(help);

    var publicIp = '203.0.113.7';
    var nextPort = 38490;
    var table = []; // {proto, ipriv, ppriv, ppub, idst, pdst}

    var topo = document.createElement('div');
    topo.className = 'formula-box';
    topo.style.fontSize = '13px';
    topo.style.lineHeight = '1.7';
    container.appendChild(topo);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    container.appendChild(ctrls);

    var tableHost = document.createElement('div');
    tableHost.className = 'formula-box';
    tableHost.style.fontSize = '13px';
    container.appendChild(tableHost);

    var devices = [
      { name: 'Laptop',  ip: '192.168.1.42' },
      { name: 'Phone',   ip: '192.168.1.55' },
      { name: 'Console', ip: '192.168.1.99' }
    ];
    var dests = [
      { name: 'example.com:443', ip: '93.184.216.34', port: 443, proto: 'TCP' },
      { name: 'cloudflare DNS:53', ip: '1.1.1.1', port: 53, proto: 'UDP' },
      { name: 'github.com:22', ip: '140.82.121.4', port: 22, proto: 'TCP' }
    ];

    function renderTopo() {
      var rows = '<div><strong>Home LAN — 192.168.1.0/24</strong></div>';
      devices.forEach(function (d) {
        rows += '<div>&nbsp;&nbsp;● <strong>' + d.name + '</strong> <span class="muted">' + d.ip + '</span></div>';
      });
      rows += '<div><strong>Router (NAT)</strong> &nbsp; <span class="muted">private 192.168.1.1, public ' + publicIp + '</span></div>';
      topo.innerHTML = rows;
    }

    function openConn(devIdx, dstIdx) {
      var d = devices[devIdx], dst = dests[dstIdx];
      var pPriv = 50000 + Math.floor(Math.random() * 1000);
      var pPub = nextPort++;
      table.push({ proto: dst.proto, ipriv: d.ip, ppriv: pPriv, ppub: pPub, idst: dst.ip, pdst: dst.port });
      renderTable();
    }

    function renderTable() {
      var rows = '<div><strong>NAT connection-tracking table</strong></div>';
      if (table.length === 0) {
        rows += '<div class="muted">empty — click a button below</div>';
      } else {
        rows += '<table class="truth-table" style="margin:8px 0;font-size:12px">'
              + '<tr><th>Proto</th><th>Inside src</th><th>Public src</th><th>Destination</th></tr>';
        table.forEach(function (t) {
          rows += '<tr>'
                + '<td>' + t.proto + '</td>'
                + '<td>' + t.ipriv + ':' + t.ppriv + '</td>'
                + '<td><span style="color:var(--accent)">' + publicIp + ':' + t.ppub + '</span></td>'
                + '<td>' + t.idst + ':' + t.pdst + '</td>'
                + '</tr>';
        });
        rows += '</table>';
      }
      tableHost.innerHTML = rows;
    }

    devices.forEach(function (d, di) {
      dests.forEach(function (dst, xi) {
        var b = document.createElement('button');
        b.className = 'secondary-btn';
        b.style.fontSize = '12px';
        b.textContent = d.name + ' → ' + dst.name;
        b.addEventListener('click', function () { openConn(di, xi); });
        ctrls.appendChild(b);
      });
    });
    var clrBtn = document.createElement('button');
    clrBtn.className = 'ghost-btn';
    clrBtn.textContent = 'Clear table';
    clrBtn.addEventListener('click', function () { table = []; renderTable(); });
    ctrls.appendChild(clrBtn);

    renderTopo();
    renderTable();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What does <strong>NAT</strong> stand for?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Network Access Table', 'Network Address Translation', 'Numbered Address Translator', 'Native Address Tunneling'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Network Address Translation') return { correct: true, feedback: 'Right. NAT = Network Address Translation. The router translates between private and public addresses.' };
        return { correct: false, feedback: 'Network Address Translation.' };
      },
      hints: [
        'The "T" stands for "Translation".',
        'It rewrites Network Addresses.',
        'Network Address Translation.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Your laptop is at <code class="inline">192.168.1.42</code> behind a home router doing NAT. You start a web server on your laptop, port 80. A friend on the public internet types your home\'s public IP into their browser. Will they reach your server, with no other configuration?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>Yes</option><option>No</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'No') return { correct: true, feedback: 'Right. The packet hits the router, which checks its connection-tracking table — there\'s no entry, because nothing inside the LAN initiated this connection. So it drops the packet. To make it work you need a port-forwarding rule mapping public port 80 → 192.168.1.42:80.' };
        if (v === 'Yes') return { correct: false, feedback: 'No — the router has no table entry for an unsolicited inbound connection, so it drops the packet. You need port forwarding to override that.' };
        return { correct: false, feedback: 'Pick yes or no.' };
      },
      hints: [
        'NAT only creates table entries when an INSIDE host initiates a connection. Inbound packets without an entry get...?',
        '...dropped. By default, NAT is one-way.',
        'Answer: No, not without port forwarding.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Two devices behind the same home router (the laptop and the console) both connect to <code class="inline">93.184.216.34:443</code> at the same time. Both have <em>different</em> private source ports. After NAT, what is true about the OUTBOUND packets?',
      mountInput: function (c) {
        var opts = [
          'Both packets come out with the router\'s public IP, but with the same source port — the destination figures it out from context.',
          'Both packets come out with the router\'s public IP, but the router assigns each connection a different public source port so replies can be demultiplexed.',
          'Only one of the connections succeeds; the other is blocked because they target the same destination.',
          'The router multiplexes both packets into one, then demuxes on the way back.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. PAT (Port Address Translation) is the trick. Same public IP for everyone, but each connection gets a unique public source port, so reply packets can be matched back to the right inside host. That\'s the whole point of "many private IPs share one public IP".' };
        if (v === 0) return { correct: false, feedback: 'If both used the same source port, replies would be ambiguous — the router couldn\'t tell which inside host they belong to. The fix is unique source ports.' };
        if (v === 2) return { correct: false, feedback: 'NAT routinely supports many simultaneous connections to the same destination — that\'s home networking working at all hours.' };
        if (v === 3) return { correct: false, feedback: 'Routers don\'t merge packets. They forward them; the per-connection state is in the NAT table.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Both packets have the same destination IP and port. What lets the router demux REPLIES?',
        'It must be something different in the OUTBOUND packets. The router controls that.',
        'The router rewrites each connection to use a unique public source port — that\'s PAT.'
      ]
    }
  ]
});
