// Level 0 — Orientation
NT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Every web page you load, every game you play online, every text message you send is a stack of networking protocols quietly cooperating. This level is the lay of the land before any of the real machinery.',
  glossary: ['host', 'protocol', 'packet', 'header', 'payload', 'LAN', 'WAN', 'ISP', 'OSI', 'TCP/IP model'],
  learn: ''
    + '<h4>What is a network?</h4>'
    + '<p>A <strong>network</strong> is just a bunch of devices that have agreed on rules for how to talk to each other. Two laptops on the same Wi-Fi are a network. Your phone and a server in Oregon talking over the internet are a network. The rules are called <strong>protocols</strong>.</p>'
    + '<p>Every device that can send and receive on a network is called a <strong>host</strong>. Your laptop is a host. A web server is a host. So is the Wi-Fi-connected toaster you regret buying.</p>'

    + '<h4>Packets, addresses, ports</h4>'
    + '<p>Networks don\'t send a continuous stream of data — they chop it into <strong>packets</strong>. Each packet has two parts:</p>'
    + '<ul>'
    +   '<li><strong>Header</strong> — metadata: who sent it, who it\'s for, how long it is, what protocol it is.</li>'
    +   '<li><strong>Payload</strong> — the actual data.</li>'
    + '</ul>'
    + '<p>The address tells the network <em>which host</em> the packet is for. The port tells that host <em>which application</em> on it should receive the packet (a single host can run a web browser, a game, and a video call at the same time — ports keep them separate).</p>'

    + '<div class="example"><div class="label">A familiar example</div>'
    + 'When you type <code class="inline">https://example.com</code> in your browser, dozens of packets fly back and forth: DNS queries to look up the address, a TCP handshake, a TLS handshake, then the actual HTTPS request and response. Every step uses a different protocol. We\'ll meet each one.'
    + '</div>'

    + '<h4>LAN, WAN, the internet</h4>'
    + '<ul>'
    +   '<li><strong>LAN</strong> (local area network) — your home, your office. Devices on the same LAN can usually reach each other directly.</li>'
    +   '<li><strong>WAN</strong> (wide area network) — spans buildings, cities, oceans.</li>'
    +   '<li><strong>The internet</strong> — a network of networks. Your LAN connects to your <strong>ISP</strong>, your ISP connects to other ISPs, and so on, until packets can reach almost anywhere.</li>'
    + '</ul>'

    + '<h4>Why we talk about "layers"</h4>'
    + '<p>Networking is built in <strong>layers</strong>. Each layer pretends the layers below it are a black box. Some examples:</p>'
    + '<ul>'
    +   '<li>The browser doesn\'t care whether your packets travel over Ethernet, Wi-Fi, or fiber — that\'s the job of layers below.</li>'
    +   '<li>HTTP doesn\'t worry about lost packets — TCP, one layer down, handles retransmission.</li>'
    +   '<li>TCP doesn\'t worry about routing across the internet — IP, one layer down, handles that.</li>'
    + '</ul>'
    + '<p>Two common layer models:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">OSI</span>7 layers (academic)</div>'
    +   '<div class="symbol-chip"><span class="sym">TCP/IP</span>4 layers (practical)</div>'
    + '</div>'
    + '<p>We\'ll mostly use the practical 4-layer model: <strong>Link</strong> (Ethernet, Wi-Fi) → <strong>Internet</strong> (IP) → <strong>Transport</strong> (TCP/UDP) → <strong>Application</strong> (HTTP, DNS, SSH...). Don\'t memorize this yet — it\'ll click as we walk up the stack.</p>'

    + '<div class="callout"><div class="label">Why CS cares</div>'
    + 'Almost every interesting program is a network program. APIs, databases, microservices, multiplayer games, distributed systems, security — none of it makes sense without understanding what\'s actually happening on the wire.'
    + '</div>'

    + '<h4>How this app works</h4>'
    + '<p>Every level has three parts:</p>'
    + '<ul>'
    +   '<li><strong>Learn</strong> — short lesson with examples (this section).</li>'
    +   '<li><strong>Play</strong> — sandbox to mess around in. No goal. Click stuff, see what happens.</li>'
    +   '<li><strong>Try</strong> — three puzzles, easy → hard. Hint button when stuck (3 hints per puzzle, last one nearly gives the answer).</li>'
    + '</ul>'
    + '<p>Progress saves automatically. Notes you write in the sidebar save too.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click any term to read its plain-English meaning:</p>';
    var terms = [
      { sym: 'host',     desc: 'Any device with an IP address. Your laptop, a phone, a server, a router interface — all hosts.' },
      { sym: 'packet',   desc: 'A small chunk of data with a header on the front. Networks chop big messages into many packets.' },
      { sym: 'header',   desc: 'Metadata at the front of a packet: source address, destination address, protocol, length.' },
      { sym: 'payload',  desc: 'The actual data being delivered, after the header.' },
      { sym: 'protocol', desc: 'The rules two devices follow when talking. HTTP, TCP, IP, DNS — all protocols.' },
      { sym: 'port',     desc: 'A 16-bit number identifying which application on a host should receive a packet (HTTP=80, HTTPS=443, SSH=22).' },
      { sym: 'LAN',      desc: 'Local area network — devices in one building, sharing a switch or Wi-Fi access point.' },
      { sym: 'WAN',      desc: 'Wide area network — spans long distances. The internet is the biggest WAN.' },
      { sym: 'ISP',      desc: 'Internet service provider. The company that connects your LAN to the rest of the internet.' },
      { sym: 'router',   desc: 'A device that forwards packets between different networks. Your home Wi-Fi box is a router (and several other things).' },
      { sym: 'switch',   desc: 'A device that forwards packets between hosts on the same LAN. Doesn\'t cross network boundaries.' },
      { sym: 'OSI',      desc: 'A 7-layer reference model for networking. Useful for vocabulary; nobody really implements all 7 cleanly.' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click any term</span>';
    terms.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = t.sym;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML = '<strong style="font-size:18px;color:var(--accent)">' + t.sym + '</strong><br>' + t.desc;
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A packet has two parts. One holds the actual data. What is the other part called?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + '<option>port</option>'
          + '<option>header</option>'
          + '<option>protocol</option>'
          + '<option>checksum</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'header') return { correct: true, feedback: 'Right. The header carries the metadata (source, destination, protocol, length); the payload carries the data.' };
        return { correct: false, feedback: 'Not quite. The metadata at the front of a packet is called the header.' };
      },
      hints: [
        'Think of an envelope: the address is on the outside, the letter is inside.',
        'The data part is the payload. The metadata part is short and starts with "h".',
        'It\'s called the header.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Match each description to the right term. Tick the box only if the statement is <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'A "protocol" is the set of rules two devices follow when communicating.', t: true },
          { label: 'A "host" must be a server — laptops and phones are not hosts.',           t: false },
          { label: 'A LAN is local; a WAN can span long distances.',                          t: true },
          { label: 'Ports identify which application on a host should receive a packet.',     t: true },
          { label: 'Packets are sent as one giant blob, never split up.',                     t: false }
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
        if (allCorrect) return { correct: true, feedback: 'Right. Three are true (protocol, LAN/WAN, ports). Two are false ("hosts must be servers" — anything with an IP is a host; "packets are one blob" — they\'re always chopped up).' };
        return { correct: false, feedback: 'Not quite. Re-read each statement. Anything with an IP address is a host. Networks always split data into packets.' };
      },
      hints: [
        'A "host" is any device that has an IP address — phones, laptops, servers, even some toasters.',
        'Splitting data into packets is what lets many conversations share the same wire.',
        'Three statements are true: the ones about protocols, LAN vs WAN, and ports.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Which layer of the 4-layer TCP/IP model is responsible for reliably delivering an ordered stream of bytes between two applications, on top of a best-effort packet delivery service below it?',
      mountInput: function (c) {
        var opts = ['Link', 'Internet', 'Transport', 'Application'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Transport') return { correct: true, feedback: 'Right. TCP lives at the Transport layer. It takes IP\'s "I might lose your packet, in any order" service and turns it into a reliable, ordered byte stream.' };
        if (v === 'Internet') return { correct: false, feedback: 'Internet (IP) does the routing — getting packets from one host to another across networks. It does NOT guarantee delivery or ordering. That\'s one layer up.' };
        if (v === 'Application') return { correct: false, feedback: 'Application is HTTP, DNS, SSH, etc. — they USE the reliable byte stream, but they don\'t implement it.' };
        if (v === 'Link') return { correct: false, feedback: 'Link is Ethernet/Wi-Fi — frames over a single physical hop. Way below where reliable byte streams live.' };
        return { correct: false, feedback: 'Pick one of the four layers.' };
      },
      hints: [
        'Four layers, bottom to top: Link → Internet → Transport → Application.',
        'IP is best-effort: it tries, but packets can be lost, reordered, or duplicated. Something has to fix that.',
        'TCP is the protocol that turns "best-effort packets" into "reliable ordered byte stream". TCP lives at the Transport layer.'
      ]
    }
  ]
});
