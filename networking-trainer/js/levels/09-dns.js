// Level 9 — DNS Resolution
NT.registerLevel({
  id: 9,
  title: 'DNS Resolution',
  whyItMatters: 'Every web request, every email, every API call starts with a DNS lookup. Watching the recursive walk from root to authoritative — and which records get cached at each step — is what makes "the internet just works" feel a lot less like magic.',
  glossary: ['DNS', 'A record', 'AAAA record', 'CNAME', 'MX record', 'NS record', 'TTL', 'recursive resolver', 'authoritative server', 'root server', 'TLD'],
  learn: ''
    + '<h4>The problem DNS solves</h4>'
    + '<p>Computers route packets by IP. Humans want names. DNS is the giant distributed phonebook that maps names to IPs (and a few other things).</p>'
    + '<p>It\'s distributed because the alternative — a single global file listing every domain — would be unmaintainable. Instead, the namespace is a tree, and each branch is owned by whoever runs that domain.</p>'

    + '<h4>The hierarchy</h4>'
    + '<div class="example"><div class="label">Read names right-to-left</div>'
    + '<code class="inline">www.example.com.</code><br>'
    + '<code class="inline">└──┘ └─────┘ └─┘ └─</code> root (.)<br>'
    + '<code class="inline">  │     │     └──── TLD (.com)</code><br>'
    + '<code class="inline">  │     └────────── second-level domain (example.com)</code><br>'
    + '<code class="inline">  └──────────────── subdomain (www)</code>'
    + '</div>'
    + '<p>Each level delegates control of names below it to the next level\'s servers. The root tells you who runs .com, .com tells you who runs example.com, example.com tells you the IP of www.example.com.</p>'

    + '<h4>The cast of servers</h4>'
    + '<ul>'
    +   '<li><strong>Stub resolver</strong> — tiny piece of code on your laptop. Just asks one question to the recursive resolver and trusts the answer.</li>'
    +   '<li><strong>Recursive resolver</strong> — does the legwork on your behalf. Examples: 8.8.8.8 (Google), 1.1.1.1 (Cloudflare), your ISP\'s resolver. Caches aggressively.</li>'
    +   '<li><strong>Root servers</strong> — 13 logical servers (named A–M), each anycast-replicated across hundreds of physical machines. They know which servers are authoritative for each TLD.</li>'
    +   '<li><strong>TLD servers</strong> — for .com, .org, .uk, etc. They know which servers are authoritative for each second-level domain in their TLD.</li>'
    +   '<li><strong>Authoritative server</strong> — the source of truth for a specific domain (e.g. ns1.example.com\'s servers).</li>'
    + '</ul>'

    + '<h4>A full recursive resolution</h4>'
    + '<ol>'
    +   '<li>Browser asks the stub: "what\'s the IP for www.example.com?"</li>'
    +   '<li>Stub forwards the query to the configured recursive resolver (say 1.1.1.1).</li>'
    +   '<li>Resolver checks its cache. If fresh entry, return. Otherwise:</li>'
    +   '<li>Resolver asks a <strong>root</strong> server: "who is authoritative for .com?" → root replies with NS records pointing at .com\'s TLD servers.</li>'
    +   '<li>Resolver asks a <strong>.com TLD</strong> server: "who is authoritative for example.com?" → reply with NS records for example.com\'s authoritative servers.</li>'
    +   '<li>Resolver asks the <strong>authoritative</strong> server: "what is the A record for www.example.com?" → reply with the IP.</li>'
    +   '<li>Resolver caches every answer for its TTL, returns the IP to the stub.</li>'
    +   '<li>Stub returns to the browser. Browser opens a TCP connection to the IP.</li>'
    + '</ol>'
    + '<p>In practice the resolver has cached enough that most queries skip the root and TLD steps entirely.</p>'

    + '<h4>Common record types</h4>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">A</span>name → IPv4</div>'
    +   '<div class="symbol-chip"><span class="sym">AAAA</span>name → IPv6</div>'
    +   '<div class="symbol-chip"><span class="sym">CNAME</span>name → another name (alias)</div>'
    +   '<div class="symbol-chip"><span class="sym">MX</span>name → mail server</div>'
    +   '<div class="symbol-chip"><span class="sym">NS</span>name → which DNS server is authoritative</div>'
    +   '<div class="symbol-chip"><span class="sym">TXT</span>arbitrary text (SPF, DKIM, verification)</div>'
    + '</div>'

    + '<h4>TTL and caching</h4>'
    + '<p>Every DNS answer comes with a <strong>TTL</strong> — how long it\'s safe to cache. Short TTLs (seconds–minutes) let you change records quickly but increase resolver traffic. Long TTLs (hours–days) reduce traffic but make changes slow to propagate. The classic "DNS hasn\'t propagated yet!" pain comes from TTL.</p>'

    + '<div class="callout"><div class="label">DNS over UDP, then TCP</div>'
    + 'A normal DNS query is a single UDP packet each way (port 53). Big answers (DNSSEC, zone transfers) fall back to TCP. Modern resolvers also support DoT (DNS-over-TLS) and DoH (DNS-over-HTTPS) for privacy.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Step through a recursive DNS lookup of <code class="inline">www.example.com</code>.';
    container.appendChild(help);

    var steps = [
      { who: 'Browser → Stub resolver',           ask: 'A record for www.example.com?', resp: '(passed to recursive resolver)' },
      { who: 'Stub → Recursive resolver (1.1.1.1)', ask: 'A record for www.example.com?', resp: 'Cache miss. Will ask root.' },
      { who: 'Resolver → Root (a.root-servers.net)', ask: 'A record for www.example.com?', resp: 'I don\'t have it. Try .com TLD: NS = a.gtld-servers.net (and 12 friends).' },
      { who: 'Resolver → .com TLD server',         ask: 'A record for www.example.com?', resp: 'I don\'t have it. Try example.com\'s authoritative servers: NS = ns1.example.com (and ns2…).' },
      { who: 'Resolver → ns1.example.com (authoritative)', ask: 'A record for www.example.com?', resp: 'A record: 93.184.216.34, TTL = 86400.' },
      { who: 'Resolver caches the answer',         ask: '(internal)',                       resp: 'Caches A record for 86400s. Caches NS records along the way too.' },
      { who: 'Recursive resolver → Stub',           ask: '',                                 resp: 'A record: 93.184.216.34' },
      { who: 'Stub → Browser',                      ask: '',                                 resp: '93.184.216.34. Browser opens TCP to that IP.' }
    ];

    var step = -1;

    // Tree diagram canvas
    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 760; canvas.height = 380;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var detail = document.createElement('div');
    detail.className = 'formula-box';
    detail.style.fontSize = '13px';
    container.appendChild(detail);

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

    // tree node positions
    var treeNodes = {
      browser:  { x: 90,  y: 50,  label: 'Browser',  short: 'browser' },
      stub:     { x: 90,  y: 130, label: 'Stub resolver', short: 'stub' },
      resolver: { x: 90,  y: 220, label: 'Recursive resolver\n(1.1.1.1)', short: 'resolver' },
      root:     { x: 380, y: 70,  label: 'Root server\n(.)', short: 'root' },
      tld:      { x: 540, y: 130, label: '.com TLD', short: 'tld' },
      authNS:   { x: 660, y: 220, label: 'ns1.example.com\n(authoritative)', short: 'authNS' }
    };
    // which node is "active" at each step (where the query/answer happens)
    var stepActive = ['browser', 'stub', 'root', 'tld', 'authNS', 'resolver', 'stub', 'browser'];
    // edges (parent → child)
    var treeEdges = [
      { from: 'resolver', to: 'root',   step: 2 },
      { from: 'resolver', to: 'tld',    step: 3 },
      { from: 'resolver', to: 'authNS', step: 4 },
      { from: 'browser',  to: 'stub',   step: 1 },
      { from: 'stub',     to: 'resolver', step: 1 }
    ];

    function drawNode(ctx, node, isActive, hasBeenActive) {
      var x = node.x, y = node.y;
      var color = isActive ? '#7ab7ff' : (hasBeenActive ? '#a78bfa' : '#3a4256');
      ctx.fillStyle = isActive ? '#7ab7ff' : '#1f2533';
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 : 1.5;
      var w = 140, h = 50;
      ctx.fillRect(x - w/2, y - h/2, w, h);
      ctx.strokeRect(x - w/2, y - h/2, w, h);
      ctx.fillStyle = isActive ? '#0a0c11' : (hasBeenActive ? '#a78bfa' : '#9aa3b2');
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var lines = node.label.split('\n');
      lines.forEach(function (line, i) {
        ctx.fillText(line, x, y - (lines.length - 1) * 6 + i * 13);
      });
    }

    function drawEdge(ctx, from, to, active) {
      ctx.strokeStyle = active ? '#fbbf24' : '#3a4256';
      ctx.lineWidth = active ? 2.5 : 1.5;
      ctx.setLineDash(active ? [] : [4, 4]);
      // start/end at edge of box (boxes are 140 wide × 50 tall)
      var dx = to.x - from.x, dy = to.y - from.y;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // arrowhead at "to" side
      if (active) {
        ctx.fillStyle = '#fbbf24';
        var ah = Math.atan2(dy, dx);
        // back off from the box edge a bit
        var ex = to.x - Math.cos(ah) * 75, ey = to.y - Math.sin(ah) * 28;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 9 * Math.cos(ah - Math.PI / 7), ey - 9 * Math.sin(ah - Math.PI / 7));
        ctx.lineTo(ex - 9 * Math.cos(ah + Math.PI / 7), ey - 9 * Math.sin(ah + Math.PI / 7));
        ctx.closePath(); ctx.fill();
      }
    }

    function render() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = '#9aa3b2'; ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Recursive resolution of "www.example.com"', canvas.width / 2, 14);

      // Edges (only highlight current step's active edge)
      treeEdges.forEach(function (e) {
        drawEdge(ctx, treeNodes[e.from], treeNodes[e.to], step === e.step);
      });

      // Nodes
      var activeKey = step >= 0 ? stepActive[step] : null;
      Object.keys(treeNodes).forEach(function (k) {
        var visited = false;
        for (var i = 0; i <= step; i++) if (stepActive[i] === k) { visited = true; break; }
        drawNode(ctx, treeNodes[k], k === activeKey, visited && k !== activeKey);
      });

      // Step label / detail
      if (step >= 0) {
        var s = steps[step];
        detail.innerHTML =
          '<div><strong style="color:var(--accent)">Step ' + (step + 1) + ' / ' + steps.length + '</strong> &nbsp; ' + s.who + '</div>'
        + (s.ask ? '<div class="muted" style="font-family:var(--mono);margin-top:4px">→ ' + s.ask + '</div>' : '')
        + '<div style="font-family:var(--mono);color:var(--accent);margin-top:2px">← ' + s.resp + '</div>';
      } else {
        detail.innerHTML = '<div class="muted">Click "Next step →" to start the resolution.</div>';
      }
    }
    nextBtn.addEventListener('click', function () {
      if (step >= steps.length - 1) return;
      step++; render();
    });
    resetBtn.addEventListener('click', function () { step = -1; render(); });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which DNS record type maps a name to an <strong>IPv4</strong> address?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['A', 'AAAA', 'CNAME', 'MX', 'TXT'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'A') return { correct: true, feedback: 'Right. A = "Address" record, the original DNS record from 1983 — name → 32-bit IPv4. AAAA (quad-A) is the IPv6 cousin.' };
        if (v === 'AAAA') return { correct: false, feedback: 'AAAA is for IPv6. The IPv4 one is just "A".' };
        return { correct: false, feedback: 'A maps to IPv4. AAAA maps to IPv6.' };
      },
      hints: [
        'The original DNS record type, defined in 1983.',
        'A single letter.',
        'Answer: A.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'During a fresh recursive DNS resolution of <code class="inline">www.example.com</code>, in what order does the recursive resolver query servers? Tick the boxes only if the statement is <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'The resolver asks a root server before asking a .com TLD server.',          t: true },
          { label: 'The resolver asks the .com TLD server before example.com\'s authoritative server.', t: true },
          { label: 'The resolver asks example.com\'s authoritative server first.',              t: false },
          { label: 'The root server returns the final A record itself.',                        t: false },
          { label: 'TLD and authoritative answers can be cached, skipping early steps next time.', t: true }
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
        if (allCorrect) return { correct: true, feedback: 'Right. The chain is root → TLD → authoritative. The root only points at TLDs; only the authoritative server has the actual A record. And caching makes most real-world queries skip the early steps.' };
        return { correct: false, feedback: 'Re-check: root → TLD → authoritative is the order, and only the authoritative has the A record. Caching is real and important.' };
      },
      hints: [
        'Read names right-to-left to figure out which server type is asked first: root → TLD → authoritative.',
        'The root server doesn\'t know individual A records — it only knows who runs each TLD.',
        'Three statements are true: root-before-TLD, TLD-before-authoritative, caching is real.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A resolver asks <code class="inline">www.example.com</code> and the authoritative server returns <strong>not</strong> an A record but a CNAME pointing to <code class="inline">example.cdn.net</code>. What does the resolver do next?',
      mountInput: function (c) {
        var opts = [
          'Returns the CNAME to the client and stops — clients are expected to resolve CNAMEs themselves.',
          'Returns an error — only A records are valid answers.',
          'Recursively resolves example.cdn.net and returns the A record (or another CNAME) it finds, along with the original CNAME chain.',
          'Asks the root server again with the new name.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. CNAME = "this name is really another name." The resolver follows the chain — it issues a fresh resolution for the target name and ultimately returns the final A/AAAA record (plus the CNAME chain in the answer section). This is how CDNs and load balancers work: customer\'s domain → CNAME → CDN-managed name → the actual IPs.' };
        if (v === 0) return { correct: false, feedback: 'A few decades ago some clients did this; today resolvers always follow CNAMEs themselves so the client gets a usable IP.' };
        if (v === 1) return { correct: false, feedback: 'CNAME is a perfectly valid answer — the resolver just has to follow it.' };
        if (v === 3) return { correct: false, feedback: 'No need to start from the root again. The resolver may have cached NS records for the new name\'s domain, and even if not, the recursion logic kicks in on its own.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'CNAME means "this name is really another name." Think about what the client actually wanted.',
        'The client wants an IP. The resolver has to keep going until it has one.',
        'The resolver follows the CNAME chain itself (a fresh recursive resolution for the target name) and returns the final A record + the CNAME chain in the answer.'
      ]
    }
  ]
});
