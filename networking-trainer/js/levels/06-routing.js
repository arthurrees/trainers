// Level 6 — IP Routing & Longest-Prefix Match
NT.registerLevel({
  id: 6,
  title: 'IP Routing & Longest-Prefix Match',
  whyItMatters: 'Every router in the world makes a routing-table decision for every packet — billions of times a second. Once you understand longest-prefix match, the entire internet stops being magic.',
  glossary: ['routing table', 'longest-prefix match', 'default route', 'next hop', 'router', 'L3'],
  learn: ''
    + '<h4>The router\'s one job</h4>'
    + '<p>A router gets a packet and has to decide: <em>which interface should I send this out, and to which next-hop\'s MAC?</em> The answer comes from the <strong>routing table</strong>:</p>'
    + '<div class="example"><div class="label">A small routing table</div>'
    + '<table class="truth-table" style="margin:8px 0">'
    + '<tr><th>Destination</th><th>Next hop</th><th>Interface</th></tr>'
    + '<tr><td><code class="inline">0.0.0.0/0</code></td><td>203.0.113.1</td><td>eth0 (ISP)</td></tr>'
    + '<tr><td><code class="inline">10.0.0.0/8</code></td><td>directly connected</td><td>eth1</td></tr>'
    + '<tr><td><code class="inline">10.1.0.0/16</code></td><td>10.0.0.99</td><td>eth1</td></tr>'
    + '<tr><td><code class="inline">10.1.5.0/24</code></td><td>10.1.0.42</td><td>eth1</td></tr>'
    + '<tr><td><code class="inline">192.168.1.0/24</code></td><td>directly connected</td><td>eth2</td></tr>'
    + '</table>'
    + 'For every incoming packet, the router scans this table for entries whose prefix matches the destination IP.'
    + '</div>'

    + '<h4>What "matches" means</h4>'
    + '<p>A route <code class="inline">10.1.0.0/16</code> matches an IP if the first 16 bits of the IP equal the first 16 bits of <code class="inline">10.1.0.0</code>. So:</p>'
    + '<ul>'
    +   '<li><code class="inline">10.1.5.42</code> &nbsp;→&nbsp; first 16 bits = <code class="inline">10.1</code> &nbsp;→&nbsp; <strong>matches</strong> 10.1.0.0/16</li>'
    +   '<li><code class="inline">10.2.5.42</code> &nbsp;→&nbsp; first 16 bits = <code class="inline">10.2</code> &nbsp;→&nbsp; doesn\'t match 10.1.0.0/16, but does match 10.0.0.0/8</li>'
    + '</ul>'

    + '<h4>Longest-prefix match — the tiebreaker</h4>'
    + '<p>An IP can match several entries at once. <code class="inline">10.1.5.42</code> matches all four:</p>'
    + '<ul>'
    +   '<li><code class="inline">0.0.0.0/0</code> — every IP matches this (zero bits required to agree)</li>'
    +   '<li><code class="inline">10.0.0.0/8</code> — first octet 10 ✓</li>'
    +   '<li><code class="inline">10.1.0.0/16</code> — first two octets 10.1 ✓</li>'
    +   '<li><code class="inline">10.1.5.0/24</code> — first three octets 10.1.5 ✓</li>'
    + '</ul>'
    + '<p>The rule: <strong>the most specific (longest prefix) wins</strong>. <code class="inline">/24</code> beats <code class="inline">/16</code> beats <code class="inline">/8</code> beats <code class="inline">/0</code>. So <code class="inline">10.1.5.42</code> takes the <code class="inline">10.1.5.0/24</code> route.</p>'

    + '<div class="callout"><div class="label">Why "longest"?</div>'
    + 'A longer prefix is a more specific statement about where to send the packet — it overrides the more general defaults. This is exactly how you carve out exceptions: "send all 10.x to A, EXCEPT 10.1.5.x, which goes to B".'
    + '</div>'

    + '<h4>The default route</h4>'
    + '<p><code class="inline">0.0.0.0/0</code> matches every possible IP. It\'s the catch-all "I don\'t have a more specific entry, so just send it to the ISP" rule. Without a default route, anything not covered by a specific entry simply gets dropped.</p>'

    + '<h4>The full forwarding decision (recap)</h4>'
    + '<ol>'
    +   '<li>Look up destination IP in the routing table → pick longest-prefix match.</li>'
    +   '<li>If no match → drop and send ICMP "destination unreachable".</li>'
    +   '<li>Decrement TTL. If 0 → drop, send ICMP "time exceeded" (powers traceroute).</li>'
    +   '<li>If next hop is "directly connected" → ARP for the destination IP\'s MAC and send. Otherwise → ARP for the next-hop\'s MAC and send.</li>'
    +   '<li>Build a new Ethernet frame with router\'s outgoing-interface MAC as src, the next-hop\'s MAC as dst. The IP header stays unchanged (except TTL, checksum).</li>'
    + '</ol>',

  mountPlay: function (container) {
    var ip = NT.lib.ip;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Type a destination IP. The table lists every entry that matches; the winner (longest prefix) is highlighted.';
    container.appendChild(help);

    var routes = [
      { dst: '0.0.0.0',    prefix: 0,  via: '203.0.113.1', iface: 'eth0 (ISP)' },
      { dst: '10.0.0.0',   prefix: 8,  via: 'directly connected', iface: 'eth1' },
      { dst: '10.1.0.0',   prefix: 16, via: '10.0.0.99', iface: 'eth1' },
      { dst: '10.1.5.0',   prefix: 24, via: '10.1.0.42', iface: 'eth1' },
      { dst: '192.168.1.0', prefix: 24, via: 'directly connected', iface: 'eth2' }
    ];

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML = '<label>Destination IP <input type="text" id="rt-ip" value="10.1.5.42" style="width:160px"></label>';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function render() {
      var v = document.getElementById('rt-ip').value.trim();
      var oct = ip.parseIPv4(v);
      if (!oct) { box.innerHTML = '<span class="muted">Invalid IP. Format: a.b.c.d</span>'; return; }
      var ipInt = ip.ipToInt(oct);
      var matches = [];
      routes.forEach(function (r) {
        var rOct = ip.parseIPv4(r.dst);
        var rInt = ip.ipToInt(rOct);
        // does r match ipInt?
        var mask = ip.maskFromPrefix(r.prefix);
        if (((ipInt & mask) >>> 0) === ((rInt & mask) >>> 0)) {
          matches.push(r);
        }
      });
      // pick longest prefix
      var winner = null;
      matches.forEach(function (r) {
        if (!winner || r.prefix > winner.prefix) winner = r;
      });

      var rows = '<div><strong>Routing table</strong> (entries that match shown in green; winner bold):</div>';
      rows += '<table class="truth-table" style="margin:8px 0">'
            + '<tr><th>Destination</th><th>Next hop</th><th>Interface</th><th>Match?</th></tr>';
      routes.forEach(function (r) {
        var matched = matches.indexOf(r) >= 0;
        var isWinner = (r === winner);
        var color = isWinner ? 'color:var(--accent);font-weight:600' : (matched ? 'color:var(--good)' : 'color:var(--text-dim)');
        rows += '<tr style="' + color + '">'
              + '<td>' + r.dst + '/' + r.prefix + '</td>'
              + '<td>' + r.via + '</td>'
              + '<td>' + r.iface + '</td>'
              + '<td>' + (isWinner ? '✓ longest' : (matched ? '✓' : '—')) + '</td>'
              + '</tr>';
      });
      rows += '</table>';
      if (winner) {
        rows += '<div style="margin-top:8px"><span class="muted">Decision for </span><strong>' + v + '</strong>:'
              + ' send via <span class="result">' + winner.dst + '/' + winner.prefix + '</span>'
              + ' &middot; next hop <span class="result">' + winner.via + '</span>'
              + ' &middot; out <span class="result">' + winner.iface + '</span></div>';
      } else {
        rows += '<div style="margin-top:8px;color:var(--bad)">No match — would drop &amp; send ICMP destination unreachable.</div>';
      }
      box.innerHTML = rows;
    }

    document.getElementById('rt-ip').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What does the route <code class="inline">0.0.0.0/0</code> mean?',
      mountInput: function (c) {
        var opts = [
          'It only matches the IP 0.0.0.0.',
          'It matches every possible IP — the default / catch-all route.',
          'It is invalid — prefix length must be at least 1.',
          'It only matches addresses inside the same subnet as the router.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. /0 means "0 bits required to agree" — every IP matches. It\'s the default route, used as a fallback when nothing more specific matches.' };
        return { correct: false, feedback: 'Not quite. /0 = 0 bits of prefix required → matches every IP. It\'s the default route.' };
      },
      hints: [
        'The number after the slash is how many leading bits must match.',
        'If 0 bits must match, then... how many IPs match?',
        '/0 matches everything. It\'s the default route.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Given this routing table:<br><br>'
            + '<table class="truth-table"><tr><th>Destination</th><th>Next hop</th></tr>'
            + '<tr><td>0.0.0.0/0</td><td>A</td></tr>'
            + '<tr><td>10.0.0.0/8</td><td>B</td></tr>'
            + '<tr><td>10.1.0.0/16</td><td>C</td></tr>'
            + '</table><br>Where is the packet to <code class="inline">10.1.2.3</code> sent?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>A</option><option>B</option><option>C</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'C') return { correct: true, feedback: 'Right. 10.1.2.3 matches all three (/0, /8, /16) but /16 is the longest, so it wins. → C.' };
        if (v === 'B') return { correct: false, feedback: '10.0.0.0/8 matches, but 10.1.0.0/16 matches MORE specifically (16 bits vs 8) — and longer prefix always wins.' };
        if (v === 'A') return { correct: false, feedback: 'A is the default route. It matches everything but loses to any more specific entry.' };
        return { correct: false, feedback: 'Pick A, B, or C.' };
      },
      hints: [
        'How many of the 3 entries match 10.1.2.3?',
        'All three match. But only one wins.',
        'Longest prefix wins. /16 > /8 > /0 → answer is C.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Given this routing table, where does the packet to <code class="inline">10.1.5.50</code> go?<br><br>'
            + '<table class="truth-table"><tr><th>Destination</th><th>Next hop</th></tr>'
            + '<tr><td>0.0.0.0/0</td><td>ISP</td></tr>'
            + '<tr><td>10.0.0.0/8</td><td>RouterA</td></tr>'
            + '<tr><td>10.1.0.0/16</td><td>RouterB</td></tr>'
            + '<tr><td>10.1.5.0/24</td><td>RouterC</td></tr>'
            + '<tr><td>10.1.5.64/26</td><td>RouterD</td></tr>'
            + '</table>',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['ISP', 'RouterA', 'RouterB', 'RouterC', 'RouterD'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'RouterC') return { correct: true, feedback: 'Right. 10.1.5.50 matches /0, /8, /16, /24, but NOT 10.1.5.64/26 (that range is .64–.127 — 50 is below it). The longest matching prefix is /24 → RouterC.' };
        if (v === 'RouterD') return { correct: false, feedback: '10.1.5.64/26 covers 10.1.5.64 – 10.1.5.127. The address .50 is below that range, so /26 does NOT match. The longest prefix that DOES match is /24 → RouterC.' };
        if (v === 'RouterB') return { correct: false, feedback: 'RouterB (/16) matches, but /24 also matches and is more specific. Longer prefix wins.' };
        if (v === 'RouterA') return { correct: false, feedback: 'RouterA (/8) matches, but more specific entries also match. Longest wins.' };
        if (v === 'ISP') return { correct: false, feedback: 'The default route loses to any more specific match.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Check each route: does 10.1.5.50 fall inside its range?',
        '10.1.5.64/26 covers 10.1.5.64 to 10.1.5.127 only. Is 50 in that range?',
        '50 < 64, so /26 doesn\'t match. Longest matching prefix is /24 → RouterC.'
      ]
    }
  ]
});
