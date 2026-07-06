// Level 10 — HTTP & Status Codes
NT.registerLevel({
  id: 10,
  title: 'HTTP & Status Codes',
  whyItMatters: 'HTTP is the lingua franca of every API and every web page. Reading a raw request and knowing the difference between 401 and 403 (or 502 and 504) is the kind of skill that quietly separates good engineers from great ones.',
  glossary: ['HTTP', 'HTTPS', 'method', 'status code', 'URL', 'TCP', 'TLS', 'port'],
  learn: ''
    + '<h4>One request, one response</h4>'
    + '<p>HTTP is a request/response protocol. The client sends a text message describing what it wants; the server sends a text message describing the result.</p>'

    + '<h4>The request</h4>'
    + '<div class="example"><div class="label">Anatomy</div>'
    + '<code class="inline">GET /api/users/42 HTTP/1.1</code> &nbsp;&nbsp;<span class="muted">← request line: METHOD path VERSION</span><br>'
    + '<code class="inline">Host: api.example.com</code> &nbsp;&nbsp;<span class="muted">← which virtual host</span><br>'
    + '<code class="inline">User-Agent: curl/8.0</code><br>'
    + '<code class="inline">Accept: application/json</code><br>'
    + '<code class="inline">Authorization: Bearer eyJhbGciOi...</code><br>'
    + '<code class="inline">&nbsp;</code> &nbsp;&nbsp;<span class="muted">← blank line: ends the headers</span><br>'
    + '<code class="inline">(optional body)</code>'
    + '</div>'

    + '<h4>The response</h4>'
    + '<div class="example"><div class="label">Anatomy</div>'
    + '<code class="inline">HTTP/1.1 200 OK</code> &nbsp;&nbsp;<span class="muted">← status line: VERSION CODE REASON</span><br>'
    + '<code class="inline">Content-Type: application/json</code><br>'
    + '<code class="inline">Content-Length: 47</code><br>'
    + '<code class="inline">Cache-Control: max-age=60</code><br>'
    + '<code class="inline">&nbsp;</code><br>'
    + '<code class="inline">{"id":42,"name":"Ada","role":"admin"}</code>'
    + '</div>'

    + '<h4>The methods</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Method</th><th>Meaning</th><th>Idempotent?</th><th>Body?</th></tr>'
    + '<tr><td>GET</td><td>Read a resource</td><td>yes</td><td>no</td></tr>'
    + '<tr><td>HEAD</td><td>Like GET but headers only</td><td>yes</td><td>no</td></tr>'
    + '<tr><td>POST</td><td>Submit data, often creating something</td><td>no</td><td>yes</td></tr>'
    + '<tr><td>PUT</td><td>Replace a resource</td><td>yes</td><td>yes</td></tr>'
    + '<tr><td>PATCH</td><td>Partially update a resource</td><td>no (typically)</td><td>yes</td></tr>'
    + '<tr><td>DELETE</td><td>Remove a resource</td><td>yes</td><td>no</td></tr>'
    + '<tr><td>OPTIONS</td><td>What can I do here? (CORS preflight)</td><td>yes</td><td>no</td></tr>'
    + '</table>'
    + '<p><strong>Idempotent</strong> = doing it twice has the same effect as doing it once. GET, PUT, DELETE are idempotent; POST and PATCH usually aren\'t.</p>'

    + '<h4>Status codes — the big picture</h4>'
    + '<p>The first digit gives you the category. You can almost always guess the right code from the category:</p>'
    + '<ul>'
    +   '<li><strong>1xx — informational</strong> (rare): "got it, keep going"</li>'
    +   '<li><strong>2xx — success</strong>: "done"</li>'
    +   '<li><strong>3xx — redirect</strong>: "look elsewhere"</li>'
    +   '<li><strong>4xx — client error</strong>: "you screwed up"</li>'
    +   '<li><strong>5xx — server error</strong>: "I screwed up"</li>'
    + '</ul>'

    + '<h4>The codes you must know</h4>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">200</span>OK</div>'
    +   '<div class="symbol-chip"><span class="sym">201</span>Created</div>'
    +   '<div class="symbol-chip"><span class="sym">204</span>No Content</div>'
    +   '<div class="symbol-chip"><span class="sym">301</span>Moved Permanently</div>'
    +   '<div class="symbol-chip"><span class="sym">302</span>Found (temp redirect)</div>'
    +   '<div class="symbol-chip"><span class="sym">304</span>Not Modified</div>'
    +   '<div class="symbol-chip"><span class="sym">400</span>Bad Request</div>'
    +   '<div class="symbol-chip"><span class="sym">401</span>Unauthorized (= no auth / auth failed)</div>'
    +   '<div class="symbol-chip"><span class="sym">403</span>Forbidden (auth\'d but not allowed)</div>'
    +   '<div class="symbol-chip"><span class="sym">404</span>Not Found</div>'
    +   '<div class="symbol-chip"><span class="sym">409</span>Conflict</div>'
    +   '<div class="symbol-chip"><span class="sym">429</span>Too Many Requests</div>'
    +   '<div class="symbol-chip"><span class="sym">500</span>Internal Server Error</div>'
    +   '<div class="symbol-chip"><span class="sym">502</span>Bad Gateway</div>'
    +   '<div class="symbol-chip"><span class="sym">503</span>Service Unavailable</div>'
    +   '<div class="symbol-chip"><span class="sym">504</span>Gateway Timeout</div>'
    + '</div>'

    + '<div class="callout"><div class="label">401 vs 403 — the classic confusion</div>'
    + '<strong>401 Unauthorized</strong>: "I don\'t know who you are" — no credentials, or invalid credentials. The fix is to authenticate (or re-authenticate). <br>'
    + '<strong>403 Forbidden</strong>: "I know who you are, but you\'re not allowed to do this." The fix is permissions, not credentials.<br>'
    + 'Trick to remember: <em>401 says "show ID"; 403 says "ID checks out, but no."</em>'
    + '</div>'

    + '<h4>HTTPS = HTTP + TLS</h4>'
    + '<p>HTTPS isn\'t a different protocol — it\'s plain HTTP carried inside a TLS-encrypted TCP connection. The client opens TCP to port <strong>443</strong>, does a TLS handshake, then sends regular HTTP inside. We\'ll cover TLS itself in the next level.</p>'

    + '<h4>HTTP/1.1 vs HTTP/2 vs HTTP/3</h4>'
    + '<ul>'
    +   '<li><strong>HTTP/1.1</strong> (1997) — text protocol over TCP. One request at a time per connection (or pipelined, with limits).</li>'
    +   '<li><strong>HTTP/2</strong> (2015) — binary framing over TCP, multiplexed streams (many requests in flight on one connection).</li>'
    +   '<li><strong>HTTP/3</strong> (2022) — same idea but over QUIC over UDP, removing TCP\'s head-of-line blocking.</li>'
    + '</ul>'
    + '<p>The semantics (methods, headers, status codes) are the same across all three. Only the wire format changes.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click any status code to see what it means and a typical scenario.';
    container.appendChild(help);

    var codes = [
      { code: '200', name: 'OK', cat: 2, scenario: 'A successful GET — the body has what you asked for.' },
      { code: '201', name: 'Created', cat: 2, scenario: 'A POST that created a new resource. Often includes a Location header.' },
      { code: '204', name: 'No Content', cat: 2, scenario: 'Successful DELETE, or PUT/PATCH that returns no body.' },
      { code: '301', name: 'Moved Permanently', cat: 3, scenario: 'The resource has a new URL, forever. Browsers cache aggressively.' },
      { code: '302', name: 'Found', cat: 3, scenario: 'Temporary redirect. The original URL is still right; just look here for now.' },
      { code: '304', name: 'Not Modified', cat: 3, scenario: 'Conditional GET (If-Modified-Since / If-None-Match) — the cached copy is still valid.' },
      { code: '400', name: 'Bad Request', cat: 4, scenario: 'Malformed JSON, missing required field — the request itself is broken.' },
      { code: '401', name: 'Unauthorized', cat: 4, scenario: 'No credentials / invalid token. Re-authenticate.' },
      { code: '403', name: 'Forbidden', cat: 4, scenario: 'You\'re authenticated, but not permitted to do this. (Permissions, not credentials.)' },
      { code: '404', name: 'Not Found', cat: 4, scenario: 'The resource doesn\'t exist (or the server doesn\'t want to admit it does).' },
      { code: '409', name: 'Conflict', cat: 4, scenario: 'A write conflicted with current state — e.g. you tried to create something that already exists.' },
      { code: '429', name: 'Too Many Requests', cat: 4, scenario: 'Rate limit exceeded. The Retry-After header tells you when to try again.' },
      { code: '500', name: 'Internal Server Error', cat: 5, scenario: 'The server crashed or threw an unhandled exception.' },
      { code: '502', name: 'Bad Gateway', cat: 5, scenario: 'A reverse proxy / load balancer got a bad response from the upstream.' },
      { code: '503', name: 'Service Unavailable', cat: 5, scenario: 'Server is overloaded, or in maintenance. Often temporary.' },
      { code: '504', name: 'Gateway Timeout', cat: 5, scenario: 'A reverse proxy / load balancer didn\'t hear back from the upstream in time.' }
    ];
    var gridWrap = document.createElement('div');
    gridWrap.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a status code</span>';
    var catColors = { 1: 'var(--text-dim)', 2: 'var(--good)', 3: 'var(--accent)', 4: 'var(--warn)', 5: 'var(--bad)' };
    var catNames = { 1: '1xx Informational', 2: '2xx Success', 3: '3xx Redirect', 4: '4xx Client error', 5: '5xx Server error' };

    [1, 2, 3, 4, 5].forEach(function (cat) {
      var row = document.createElement('div');
      row.style.marginBottom = '10px';
      var label = document.createElement('div');
      label.style.cssText = 'font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;color:' + catColors[cat];
      label.textContent = catNames[cat];
      row.appendChild(label);
      var tiles = document.createElement('div');
      tiles.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px';
      var matching = codes.filter(function (c) { return c.cat === cat; });
      if (matching.length === 0) {
        var none = document.createElement('div');
        none.className = 'muted';
        none.style.fontSize = '13px';
        none.textContent = '(rare in practice — not covered here)';
        tiles.appendChild(none);
      } else {
        matching.forEach(function (c) {
          var b = document.createElement('button');
          b.style.cssText = 'flex:1 1 auto;min-width:140px;padding:10px 14px;background:var(--bg-3);border:1px solid var(--border);border-radius:8px;text-align:left;cursor:pointer;font-family:var(--mono);transition:all 0.15s';
          b.innerHTML =
            '<div style="font-size:18px;font-weight:700;color:' + catColors[c.cat] + '">' + c.code + '</div>'
          + '<div style="font-size:13px;color:var(--text);margin-top:2px">' + c.name + '</div>';
          b.addEventListener('click', function () {
            Array.prototype.forEach.call(gridWrap.querySelectorAll('button'), function (bb) {
              bb.style.background = 'var(--bg-3)';
              bb.style.borderColor = 'var(--border)';
            });
            b.style.background = 'rgba(122,183,255,0.08)';
            b.style.borderColor = catColors[c.cat];
            output.innerHTML =
              '<div><strong style="color:' + catColors[c.cat] + ';font-size:18px">' + c.code + ' ' + c.name + '</strong></div>'
            + '<div style="margin-top:6px">' + c.scenario + '</div>';
          });
          tiles.appendChild(b);
        });
      }
      row.appendChild(tiles);
      gridWrap.appendChild(row);
    });
    container.appendChild(gridWrap);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What does HTTP status code <strong>404</strong> mean?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Not Found', 'Internal Server Error', 'Forbidden', 'Bad Request'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Not Found') return { correct: true, feedback: 'Right. 404 = "you asked for a resource I don\'t have." Possibly the most famous status code on the internet.' };
        return { correct: false, feedback: 'Not Found. The 4xx category is "client error", and 404 specifically means "nothing here at that URL".' };
      },
      hints: [
        'It\'s in the 4xx (client error) family.',
        'The most famous error code on the web.',
        'Not Found.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Tick each statement that is <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: '5xx codes mean the server failed.',                                     t: true },
          { label: '4xx codes mean the client did something wrong.',                        t: true },
          { label: 'GET requests should be idempotent — safe to retry.',                    t: true },
          { label: '301 means the resource has been temporarily moved.',                    t: false },
          { label: 'POST is idempotent.',                                                   t: false },
          { label: 'A 204 response carries no body.',                                       t: true }
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
        if (allCorrect) return { correct: true, feedback: 'Right. 301 is permanent; 302 is the temporary one. POST is not idempotent (each call may create a new resource). The other four are true.' };
        return { correct: false, feedback: 'Re-check: 301 = permanent (302 is temporary), POST is NOT idempotent. The other four are true.' };
      },
      hints: [
        '301 and 302: one is permanent, one is temporary. Which is which?',
        '301 = permanent, 302 = temporary. POST creates new things — calling it twice usually creates two.',
        'Four are true: 5xx, 4xx, GET-idempotent, 204-no-body. Two are false: 301-temporary, POST-idempotent.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A user calls your API with a valid auth token, but the user does not have permission to access the requested resource. What is the <strong>most appropriate</strong> status code?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found', '500 Internal Server Error'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '403 Forbidden') return { correct: true, feedback: 'Right. 403 = "I know who you are, but you can\'t do this." 401 would be wrong because the token IS valid — there\'s no authentication problem; it\'s an authorization problem. (Some APIs do return 404 to hide existence — defensible, but 403 is the textbook answer.)' };
        if (v === '401 Unauthorized') return { correct: false, feedback: 'Common mistake. 401 means "I don\'t know who you are / your credentials are invalid." But the token IS valid here — the user is authenticated. The problem is authorization (permissions), not authentication. → 403.' };
        if (v === '404 Not Found') return { correct: false, feedback: 'Some APIs do this on purpose (to hide which resources exist). Defensible, but the textbook answer for "auth\'d but not permitted" is 403 Forbidden.' };
        if (v === '400 Bad Request') return { correct: false, feedback: '400 is for malformed requests (bad JSON, missing fields). The request here is fine — it\'s the permission that\'s missing.' };
        if (v === '500 Internal Server Error') return { correct: false, feedback: 'Nothing crashed on the server. This is a normal, expected response — "no, you can\'t do that".' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'The token is valid → authentication succeeded. So 401 is wrong.',
        'The user is correctly identified, just not permitted. That\'s authorization, not authentication.',
        '"Auth\'d but not allowed" = 403 Forbidden.'
      ]
    }
  ]
});
