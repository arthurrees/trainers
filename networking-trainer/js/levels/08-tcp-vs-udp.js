// Level 8 — TCP vs UDP
NT.registerLevel({
  id: 8,
  title: 'TCP vs UDP',
  whyItMatters: 'Pretty much every internet application sits on one of these two. Knowing why DNS uses UDP, why HTTP uses TCP (mostly), and why HTTP/3 broke the rules teaches you the real-world tradeoffs better than any single protocol can.',
  glossary: ['TCP', 'UDP', 'port', 'three-way handshake', 'flow control', 'congestion control'],
  learn: ''
    + '<h4>One-paragraph summary</h4>'
    + '<p>Both are <strong>Transport-layer</strong> protocols (L4). Both add ports on top of IP so multiple apps on a host can keep their conversations separate. The difference is what they promise:</p>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th></th><th>TCP</th><th>UDP</th></tr>'
    + '<tr><td>Connection setup</td><td>3-way handshake</td><td>none — first packet is data</td></tr>'
    + '<tr><td>Reliability</td><td>retransmits lost segments</td><td>fire and forget</td></tr>'
    + '<tr><td>Ordering</td><td>delivered in order</td><td>arrival order = nature\'s</td></tr>'
    + '<tr><td>Flow control</td><td>yes (receive window)</td><td>no</td></tr>'
    + '<tr><td>Congestion control</td><td>yes (slow-start, AIMD)</td><td>no (the app must do it if needed)</td></tr>'
    + '<tr><td>Header size</td><td>20 bytes (no options)</td><td>8 bytes</td></tr>'
    + '<tr><td>Per-message latency</td><td>higher (handshake, ordering)</td><td>lower</td></tr>'
    + '</table>'

    + '<h4>The headers, side by side</h4>'
    + '<div class="example"><div class="label">UDP header — 8 bytes total</div>'
    + '<code class="inline">[ src port | dst port | length | checksum ]</code><br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;2 bytes &nbsp; 2 bytes &nbsp; 2 bytes &nbsp; 2 bytes'
    + '</div>'
    + '<div class="example"><div class="label">TCP header — 20 bytes minimum</div>'
    + '<code class="inline">[ src port | dst port | seq | ack | data offset+flags | window | checksum | urgent | options ]</code><br>'
    + '&nbsp;&nbsp;Includes 32-bit seq, 32-bit ack, flags (SYN, ACK, FIN, RST, PSH, URG), 16-bit receive window.'
    + '</div>'
    + '<p>UDP is essentially "IP with ports + a checksum". That\'s it. Anything else you want — reliability, ordering, encryption — you build on top yourself.</p>'

    + '<h4>What runs on what</h4>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">TCP</span>HTTP, HTTPS, SSH, SMTP, IMAP, FTP, git, databases</div>'
    +   '<div class="symbol-chip"><span class="sym">UDP</span>DNS (mostly), NTP, DHCP, VoIP/video, multiplayer games, multicast</div>'
    + '</div>'

    + '<h4>Why DNS picked UDP</h4>'
    + '<p>A DNS query is tiny (a name) and the answer is tiny (an IP). The whole exchange is one packet each way. Setting up a TCP connection — three handshake packets before you can even ask — would more than double the latency for the most common case in networking. Lose the query? Just resend it; it\'s 100 bytes.</p>'
    + '<p>(DNS does fall back to TCP for big answers — e.g. zone transfers, DNSSEC responses larger than a UDP datagram.)</p>'

    + '<h4>Why video calls picked UDP</h4>'
    + '<p>Imagine TCP for live audio: a packet from 200 ms ago is missing. TCP halts the stream until that packet is retransmitted, even though by then the missing audio is meaningless. <strong>Late audio is worse than missing audio.</strong> UDP just lets the packet stay lost; the codec masks the gap.</p>'

    + '<h4>Why most things picked TCP</h4>'
    + '<p>Most applications want "send these bytes, get them on the other side, in order, period." Implementing that yourself on top of UDP is a substantial project (and historically full of bugs). TCP is the right default unless you have a reason.</p>'

    + '<div class="callout"><div class="label">The plot twist: HTTP/3 (QUIC)</div>'
    + 'In 2021 the IETF standardized QUIC — a new transport protocol that runs over UDP but reimplements reliability and adds TLS, multiplexed streams (no head-of-line blocking), and connection migration. HTTP/3 = HTTP over QUIC over UDP. So "the web is TCP" is no longer fully true.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click an application — see which transport it uses and why.';
    container.appendChild(help);

    var apps = [
      { name: 'HTTP / HTTPS (browsing)', proto: 'TCP (mostly) / UDP for HTTP/3', why: 'Web pages need every byte; ordering matters; latency is forgivable on connection setup. HTTP/3 moved to UDP+QUIC to avoid TCP head-of-line blocking, especially on lossy mobile networks.' },
      { name: 'SSH', proto: 'TCP', why: 'Interactive shell — every keystroke and byte must arrive in order. Reliability is non-negotiable.' },
      { name: 'DNS query', proto: 'UDP (with TCP fallback)', why: 'Tiny request and reply. Setting up a TCP connection just to ask "what\'s example.com?" would be overkill.' },
      { name: 'Video / voice call', proto: 'UDP', why: 'Late audio is worse than missing audio. The codec hides small gaps better than TCP\'s retransmit can.' },
      { name: 'Multiplayer game (real-time)', proto: 'UDP', why: 'Same as voice — fresh state matters more than every state. A retransmitted "where the player was 200ms ago" is useless.' },
      { name: 'File download (FTP/HTTP)', proto: 'TCP', why: 'Every byte matters; throughput on a long-lived connection benefits from TCP\'s congestion control.' },
      { name: 'Email (SMTP/IMAP)', proto: 'TCP', why: 'Reliability matters; latency does not.' },
      { name: 'NTP (time sync)', proto: 'UDP', why: 'Symmetrical tiny request/response. TCP setup would add latency that hurts time-sync accuracy.' },
      { name: 'DHCP (get an IP)', proto: 'UDP (broadcast)', why: 'You don\'t have an IP yet — you can\'t do a TCP handshake. UDP broadcast on the LAN is the only option.' },
      { name: 'git over SSH', proto: 'TCP (via SSH)', why: 'SSH is TCP, so anything tunneled through it is TCP underneath.' }
    ];

    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click an application</span>';
    apps.forEach(function (a) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = a.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + a.name + '</strong></div>'
        + '<div><span class="muted">Transport:</span> ' + a.proto + '</div>'
        + '<div style="margin-top:6px">' + a.why + '</div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'How many bytes is a <strong>UDP header</strong>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 8) return { correct: true, feedback: 'Right. 8 bytes: src port (2), dst port (2), length (2), checksum (2). That\'s the entire header.' };
        if (v === 20) return { correct: false, feedback: '20 bytes is the minimum TCP header. UDP is much smaller — only 8.' };
        return { correct: false, feedback: 'Four 16-bit fields → 8 bytes total.' };
      },
      hints: [
        'UDP has just 4 fields in its header.',
        'Each field is 16 bits (2 bytes): src port, dst port, length, checksum.',
        '4 × 2 = 8 bytes.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Tick each protocol that runs on <strong>UDP</strong> (and only UDP, in its common usage).',
      mountInput: function (c) {
        var items = [
          { label: 'DNS (typical query)',     u: true },
          { label: 'SSH',                     u: false },
          { label: 'NTP',                     u: true },
          { label: 'HTTP/1.1',                u: false },
          { label: 'DHCP',                    u: true },
          { label: 'IMAP',                    u: false }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.u };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. UDP: DNS (typical), NTP, DHCP. TCP: SSH, HTTP/1.1, IMAP. (HTTP/3 is the exception that moves HTTP to UDP, but HTTP/1.1 is still TCP.)' };
        return { correct: false, feedback: 'UDP for: DNS query, NTP, DHCP. TCP for: SSH, HTTP/1.1, IMAP. (DHCP can\'t use TCP — you don\'t even have an IP yet.)' };
      },
      hints: [
        'Tiny single-shot request/response → typically UDP. Long-lived stream of bytes → TCP.',
        'DHCP runs before you have an IP, so TCP isn\'t even an option.',
        'Three are UDP: DNS, NTP, DHCP. The other three (SSH, HTTP/1.1, IMAP) are TCP.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Real-time voice and video calls almost always use UDP, even though they care about quality. Why is that the right choice?',
      mountInput: function (c) {
        var opts = [
          'UDP packets are physically faster on the wire than TCP packets.',
          'UDP avoids TCP\'s retransmissions — a late audio packet is worthless, so dropping it is better than waiting for it.',
          'UDP encrypts traffic by default; TCP does not.',
          'TCP cannot carry audio data; UDP is required.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. The classic line: "late audio is worse than missing audio." TCP would block the stream while it retransmits — by the time the missing 200 ms of audio arrives, the conversation has already moved on. The codec hides small gaps better than TCP can fix them.' };
        if (v === 0) return { correct: false, feedback: 'There\'s no physical speed difference — both run on the same IP. The reason is about behavior on loss, not raw speed.' };
        if (v === 2) return { correct: false, feedback: 'Neither UDP nor TCP encrypts by default. (TLS does, and there\'s also DTLS for UDP.)' };
        if (v === 3) return { correct: false, feedback: 'TCP can carry any byte stream, including audio. People still avoid it for real-time because of HOW it handles loss, not whether it can.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Think about what TCP does when it loses a packet.',
        'TCP halts the stream until the missing packet is retransmitted. For real-time audio, that lateness is itself a worse problem than the loss.',
        'UDP\'s "fire and forget" is a feature for media: drop the lost packet, let the codec hide it, keep playing fresh data.'
      ]
    }
  ]
});
