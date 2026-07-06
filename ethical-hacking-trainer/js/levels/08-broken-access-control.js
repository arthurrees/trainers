// Level 8 — CSRF / SSRF / IDOR — broken access control
EHT.registerLevel({
  id: 8,
  title: 'Broken Access Control — CSRF, SSRF, IDOR',
  whyItMatters: 'OWASP\'s 2021 Top 10 ranked Broken Access Control as #1. Three siblings — CSRF, SSRF, IDOR — all break a different access boundary in the same way: the system trusted something it shouldn\'t have.',
  glossary: ['CSRF', 'SSRF', 'IDOR', 'OWASP'],
  learn: ''
    + '<h4>The umbrella: broken access control</h4>'
    + '<p>The bug class: <strong>your system trusts an actor or input it shouldn\'t.</strong> Three classic flavors.</p>'

    + '<h4>IDOR — Insecure Direct Object Reference</h4>'
    + '<p>An object\'s ID is exposed in the URL/parameter, and the server doesn\'t check whether the requester is allowed to access THAT particular object.</p>'
    + '<div class="example"><div class="label">Classic IDOR</div>'
    + '<code>GET /orders/12345</code> shows order 12345.<br>'
    + 'Try <code>/orders/12346</code>. If that shows another customer\'s order, you have IDOR.<br>'
    + '<strong>Fix:</strong> on every request, check <code>order.user_id == current_user.id</code> (or the equivalent ACL).'
    + '</div>'
    + '<p>IDOR is "horizontal privilege escalation" — same role, different user. It\'s also the easiest bug class for a non-technical user to discover by accident. Bug-bounty triage drowns in IDOR reports.</p>'

    + '<h4>CSRF — Cross-Site Request Forgery</h4>'
    + '<p>An attacker\'s site causes the user\'s browser to make a state-changing request to YOUR site, using the user\'s logged-in session. Browsers attach cookies automatically to requests to your domain — even when the request originates from a third-party page.</p>'
    + '<div class="example"><div class="label">Classic CSRF</div>'
    + '<code>&lt;img src="https://bank.com/transfer?to=attacker&amount=1000"&gt;</code><br>'
    + 'Victim is logged into bank.com in another tab. They visit attacker\'s page. Their browser fires the GET, attaches the session cookie. Bank performs the transfer because the request is "authentic" from its perspective.'
    + '</div>'
    + '<p>Three defenses, in modern order:</p>'
    + '<ol>'
    +   '<li><strong>SameSite cookies</strong> (Lax or Strict) — modern browsers don\'t attach the cookie on cross-origin POSTs. The single biggest CSRF mitigator and now default in Chrome.</li>'
    +   '<li><strong>Anti-CSRF token</strong> — server-issued unguessable token in a form field; checked on submit. Doesn\'t live in cookies, can\'t be replayed cross-site.</li>'
    +   '<li><strong>Origin/Referer header check</strong> — verify the request came from your domain.</li>'
    + '</ol>'
    + '<p><strong>Don\'t do state-changing operations on GET.</strong> Even with anti-CSRF tokens elsewhere, a GET that mutates is a bug.</p>'

    + '<h4>SSRF — Server-Side Request Forgery</h4>'
    + '<p>The user sends a URL to your server, and your server fetches it. If the server can reach <em>internal</em> resources the user can\'t — internal admin panels, cloud metadata endpoints, internal microservices — the user effectively gets to make requests from your server\'s privileged network position.</p>'
    + '<div class="example"><div class="label">Classic SSRF — cloud metadata</div>'
    + 'Image-loader endpoint: <code>POST /import?url=http://example.com/photo.jpg</code><br>'
    + 'Attacker sends: <code>POST /import?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/role</code><br>'
    + 'AWS\'s instance metadata service returns IAM credentials directly. Server fetches them. Attacker now has cloud creds — potentially the keys to the kingdom.<br>'
    + '<strong>This is the bug behind the 2019 Capital One breach (~100M records).</strong>'
    + '</div>'
    + '<p>Defenses:</p>'
    + '<ul>'
    +   '<li>Validate the URL against an allow-list, not a deny-list. <em>Don\'t</em> just block "169.254.169.254" — DNS rebinding, IPv6 forms, decimal IP encoding all bypass naive blocks.</li>'
    +   '<li>Use IMDSv2 on AWS — requires a session token PUT first; defeats most SSRF.</li>'
    +   '<li>Network policy: app servers can\'t reach the metadata IP at all (some K8s setups do this).</li>'
    +   '<li>Forward proxy with allow-listed destinations.</li>'
    + '</ul>'

    + '<h4>The general fix: deny-by-default + check on every action</h4>'
    + '<p>The recurring failure mode in all three is "we forgot to check." The architectural fix is to make checks impossible to forget:</p>'
    + '<ul>'
    +   '<li>Centralize authorization in middleware — every route goes through it.</li>'
    +   '<li>Object-level checks colocated with the data access (don\'t allow "find by ID" without "is this user allowed to see this object").</li>'
    +   '<li>Use UUIDs over sequential IDs — they\'re not a security control by themselves, but they make IDOR less discoverable by humans casually browsing.</li>'
    +   '<li>For SSRF: allow-list URLs at the parser, fetch them through a proxy, never let user URLs hit private IP ranges.</li>'
    + '</ul>'

    + '<h4>OWASP Top 10 — recent rankings</h4>'
    + '<p>For context, the 2021 list (most recent at time of writing):</p>'
    + '<ol>'
    +   '<li>Broken Access Control (this level)</li>'
    +   '<li>Cryptographic Failures (level 4)</li>'
    +   '<li>Injection (SQLi, NoSQLi, level 6)</li>'
    +   '<li>Insecure Design</li>'
    +   '<li>Security Misconfiguration</li>'
    +   '<li>Vulnerable and Outdated Components</li>'
    +   '<li>Identification and Authentication Failures (level 5)</li>'
    +   '<li>Software and Data Integrity Failures</li>'
    +   '<li>Security Logging and Monitoring Failures (level 12)</li>'
    +   '<li>Server-Side Request Forgery (this level)</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">A useful test for IDOR</div>'
    + 'In your code, every place you do <code>db.find(id)</code>, ask: where do I check that the requester is allowed to see THIS row? If the answer is "we filter the UI" or "we use random IDs so they can\'t guess," you have IDOR. The right answer is "the query is scoped to the current user" or "we explicitly verify ownership before returning."'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a request scenario. See whether each access-control failure mode applies and how to fix it.</p>';

    var scenarios = [
      { name: 'GET /orders/12346 (other user\'s order, no ACL check)',
        type: 'IDOR',
        why: 'Server returns the order without checking whether order.user_id == current_user.id. Classic horizontal privesc.',
        fix: 'Scope the query: <code>SELECT * FROM orders WHERE id=$1 AND user_id=$2</code> with current_user.id, or check ownership before returning.' },
      { name: '<img src="bank.com/transfer?to=evil&amount=1000"> (cross-site GET)',
        type: 'CSRF (and bonus: GET that mutates state)',
        why: 'Cross-site request forgery. Browser attaches bank.com cookies even when image tag is on attacker.com.',
        fix: 'Don\'t mutate on GET. Use SameSite=Lax cookies + anti-CSRF token on POST.' },
      { name: 'POST /fetch-image url=http://169.254.169.254/latest/meta-data/...',
        type: 'SSRF',
        why: 'Server fetches the URL with its own (privileged) network access. AWS IMDS exposes IAM credentials to anyone who can hit it.',
        fix: 'IMDSv2 + URL allow-list at the fetcher. Never allow user-supplied URLs to private/internal IPs.' },
      { name: 'GET /admin/dashboard (ordinary user, no role check)',
        type: 'Vertical privilege escalation (a form of broken access control)',
        why: 'Server checks "is logged in" but not "is admin role."',
        fix: 'Centralized authorization middleware that requires an admin role for /admin/* routes.' },
      { name: 'POST /api/v1/internal/promote-user (intended for service-to-service only)',
        type: 'Broken access control: missing tenant/auth boundary',
        why: 'Internal endpoint reachable from public internet without auth.',
        fix: 'Network-level: only reachable from internal subnet. Application-level: require service auth (mTLS, JWT) on internal endpoints.' }
    ];
    var grid = document.createElement('div'); grid.className='chip-row'; grid.style.marginBottom='12px';
    var output = document.createElement('div'); output.className='formula-box';
    output.innerHTML = '<span class="muted">← click a scenario</span>';
    scenarios.forEach(function (s) {
      var b = document.createElement('button'); b.className='chip';
      b.style.maxWidth='280px'; b.style.whiteSpace='normal'; b.style.textAlign='left';
      b.textContent = s.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">Type:</strong> ' + s.type + '</div>' +
          '<div class="info-line"><span class="key">Why it works:</span> <span class="val">' + s.why + '</span></div>' +
          '<div class="info-line"><span class="key">Fix:</span> <span class="val">' + s.fix + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A user notices their own profile URL is <code>https://app/users/12</code>. They change 12 to 13 and see another customer\'s name, email, address. Which class is this?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>SQLi</option><option>XSS</option><option>IDOR</option><option>SSRF</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'IDOR') return { correct: true, feedback: 'Right. Insecure Direct Object Reference — server didn\'t verify the user is allowed to see object 13. Trivial to find by hand, devastating in aggregate (loop through all IDs to dump entire user table).' };
        return { correct: false, feedback: 'Object ID exposed in URL + no access check = IDOR.' };
      },
      hints: [
        'Object ID exposed in URL, no permission check.',
        'IDOR.',
        'Insecure Direct Object Reference.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A team\'s only CSRF defense is checking the <code>Origin</code> header equals their domain. A junior dev says "but mobile apps don\'t send Origin headers, so we whitelist absent Origin too." Why is the whitelisted-absent rule a problem, and what\'s the better default?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Whitelist-absent is fine — non-browser clients don\'t send Origin</option>' +
          '<option>Several browser request types intentionally OMIT the Origin header — old links, certain redirects, some preflight scenarios — meaning a CSRF can avoid the check by using one of those. Better: SameSite=Lax cookies + anti-CSRF token on state-changing requests; have the mobile app authenticate via a separate token-based scheme that doesn\'t share cookies.</option>' +
          '<option>The Origin header is encrypted; you can\'t read it server-side</option>' +
          '<option>It\'s fine in 2026 because browsers always send Origin now</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Several browser request types intentionally OMIT the Origin header') === 0) return { correct: true, feedback: 'Right. The "absent → trusted" rule means the attacker just needs ONE of the browser request types where Origin is missing (and there are several). Plus, intermixing browser auth with mobile app auth via the same cookie creates exactly this whitelist-absent dilemma. Better architecture: SameSite cookies + CSRF token for browsers; separate Authorization-header auth for mobile (which the browser CSRF problem doesn\'t apply to).' };
        if (v === 'Whitelist-absent is fine — non-browser clients don\'t send Origin') return { correct: false, feedback: 'Several BROWSER request types omit Origin too. Whitelisting absent is unsafe.' };
        if (v === 'The Origin header is encrypted; you can\'t read it server-side') return { correct: false, feedback: 'Origin is a normal HTTP header. Servers read it.' };
        if (v === 'It\'s fine in 2026 because browsers always send Origin now') return { correct: false, feedback: 'Browsers don\'t send Origin on every request.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'What if Origin is sometimes missing in legitimate browser requests too?',
        'Some redirect types and old request types omit Origin — attacker exploits the whitelist-absent rule.',
        'Use SameSite + CSRF token. Separate the mobile auth scheme.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You build an "import from URL" feature on AWS EC2. The service fetches a user-provided URL and converts the result. You added a deny-list of "169.254.169.254" to block AWS metadata SSRF. List the bypass techniques that defeat a naive string-based deny-list (mark TRUE for techniques that work).',
      mountInput: function (c) {
        var items = [
          { label: 'DNS rebinding — attacker.com resolves to a public IP first, then to 169.254.169.254 on a second resolution',                t: true },
          { label: 'IPv6 form: <code>[fd00:ec2::254]</code>',                                                                                    t: true },
          { label: 'Decimal IP: <code>http://2852039166/</code> (= 169.254.169.254 as a 32-bit integer)',                                        t: true },
          { label: 'IPv4 with leading zeros: <code>http://0169.0254.0169.0254/</code>',                                                          t: true },
          { label: 'Just bypass it with HTTPS instead of HTTP',                                                                                  t: false },
          { label: 'Use a different cloud provider\'s metadata IP that you forgot to block',                                                    t: true }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' '));
          var span = document.createElement('span'); span.innerHTML = it.label; lbl.appendChild(span);
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. Five real bypasses for "just block the metadata IP string": DNS rebinding (the URL parser sees a benign hostname; the actual fetch resolves to the metadata IP); IPv6 forms; multiple integer encodings of the IP; leading-zero octets; alternative cloud metadata IPs (Azure, GCP) you forgot. The right defense is allow-list URLs the user is permitted to fetch (or known-public CDN ranges) AND ensure the application can\'t reach private IPs at the network layer (security group / firewall) AND use IMDSv2.' };
        return { correct: false, feedback: 'Re-check: all of the IP-encoding techniques work, plus DNS rebinding, plus other clouds. The only false answer is "use HTTPS" — that doesn\'t bypass anything.' };
      },
      hints: [
        'String-based deny-lists fail because there are many ways to write the same IP.',
        'DNS rebinding, integer IPs, IPv6, leading zeros — all bypass naive string match.',
        'Plus Azure/GCP have their own metadata IPs.'
      ]
    }
  ]
});
