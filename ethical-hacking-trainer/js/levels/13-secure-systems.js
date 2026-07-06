// Level 13 — Building secure systems
EHT.registerLevel({
  id: 13,
  title: 'Building Secure Systems',
  whyItMatters: 'You\'ve learned 12 levels of attack patterns. The synthesis is a small set of principles that, applied early, prevent most of them. This level is the playbook — what good looks like for a developer or architect designing a new system.',
  glossary: ['least priv', 'defense-in-depth', 'zero trust', 'threat model'],
  learn: ''
    + '<h4>Eight load-bearing principles</h4>'

    + '<h4>1. Least privilege</h4>'
    + '<p>Every user, service, process, network connection gets ONLY the permissions it needs. Nothing more.</p>'
    + '<ul>'
    +   '<li>App service accounts: scoped to specific tables, not "the database."</li>'
    +   '<li>Cloud IAM roles: per-microservice, time-limited.</li>'
    +   '<li>Network: services can only talk to services they NEED to.</li>'
    +   '<li>Developers: ephemeral admin (just-in-time access), not permanent.</li>'
    + '</ul>'
    + '<p>The cost is configuration overhead. The benefit is dramatically smaller blast radius when (not if) something gets compromised.</p>'

    + '<h4>2. Defense in depth</h4>'
    + '<p>Multiple independent layers, so any single failure doesn\'t equal compromise.</p>'
    + '<p>Example for a web app:</p>'
    + '<ol>'
    +   '<li>WAF blocks known attack signatures.</li>'
    +   '<li>App-level input validation rejects malformed input.</li>'
    +   '<li>Parameterized queries prevent SQLi even if validation is bypassed.</li>'
    +   '<li>DB user has read-only access to most tables — even if SQLi succeeds, can\'t modify data.</li>'
    +   '<li>Outbound network policy prevents the DB host from exfiltrating to the internet.</li>'
    +   '<li>Audit logs detect the exfil attempt.</li>'
    + '</ol>'
    + '<p>Six layers; an attacker has to defeat ALL of them. Each layer can be cheaper than trying to make one perfect.</p>'

    + '<h4>3. Secure by default</h4>'
    + '<p>The default configuration should be the most secure one. Insecure options should require explicit, opt-in toggles with documentation explaining the risk.</p>'
    + '<ul>'
    +   '<li>HTTPS-only by default. HTTP redirects to HTTPS. Allowed-cipher list defaults to modern only.</li>'
    +   '<li>MFA required to enroll, not "available if you\'d like."</li>'
    +   '<li>S3 buckets private by default; public requires a checkbox + audit.</li>'
    +   '<li>Cookies HttpOnly + Secure + SameSite by default.</li>'
    + '</ul>'

    + '<h4>4. Fail closed (when it matters)</h4>'
    + '<p>If your auth service is down, deny by default — don\'t let users in. If your audit logging fails, refuse to process requests rather than continue silently.</p>'
    + '<p>The exception: availability-critical paths sometimes choose "fail open" deliberately — but that\'s an explicit risk decision.</p>'

    + '<h4>5. Zero trust</h4>'
    + '<p>Don\'t trust based on network position. "On the corporate VPN" is not the same as "authenticated." Every request is authenticated, authorized, and logged — even from inside.</p>'
    + '<p>Practical: BeyondCorp-style architectures, mTLS between services, identity-aware proxies, no "internal" services that lack auth.</p>'

    + '<h4>6. Minimize attack surface</h4>'
    + '<p>Every feature, port, dependency, and interface is something to defend.</p>'
    + '<ul>'
    +   '<li>Internet-facing: only what MUST be.</li>'
    +   '<li>Dependencies: every <code>npm install</code> brings transitive deps and their CVEs. Audit, prefer fewer.</li>'
    +   '<li>Container images: distroless or minimal base, not "ubuntu:latest with everything."</li>'
    +   '<li>Disable features you don\'t use.</li>'
    + '</ul>'

    + '<h4>7. Make breaches detectable</h4>'
    + '<p>Even with all the above, assume breach. Design for detection from day 1:</p>'
    + '<ul>'
    +   '<li>Log security-relevant events (level 12).</li>'
    +   '<li>Honey-tokens — fake credentials/files that nobody legitimate touches; alarm on access.</li>'
    +   '<li>Anomaly baselines — "this service has never made an outbound connection to South America" → alert when it does.</li>'
    + '</ul>'

    + '<h4>8. Threat model new things, regularly</h4>'
    + '<p>The Shostack 4-question loop (level 1) applied to every new feature. Painful at first; quickly becomes a habit. Catches whole classes of bug before code is written.</p>'

    + '<h4>The minimum viable security checklist</h4>'
    + '<p>For a small team launching something new:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Domain</th><th>Minimum</th></tr>'
    + '<tr><td>Auth</td><td>FIDO2 / passkeys for staff. MFA-required for users. Strong password policy + breach-list rejection. Argon2id for storage.</td></tr>'
    + '<tr><td>Web</td><td>HTTPS only with HSTS preload. Modern CSP. SameSite cookies. Parameterized queries everywhere. Output encoding by templating defaults.</td></tr>'
    + '<tr><td>Cloud</td><td>IAM roles per service, no shared accounts, IMDSv2, public-S3 alarm.</td></tr>'
    + '<tr><td>Secrets</td><td>Secret manager (AWS Secrets Manager / HashiCorp Vault / sops + KMS). Never in repo. Pre-commit hook scanning.</td></tr>'
    + '<tr><td>Logging</td><td>Auth events, privileged actions, process exec, outbound connections. Centralized SIEM with 90+ days retention.</td></tr>'
    + '<tr><td>Endpoint</td><td>EDR on all hosts. Disk encryption mandatory. Auto-update enabled.</td></tr>'
    + '<tr><td>Patching</td><td>Critical CVEs within 7 days. Automated dependency scanning (Dependabot, Renovate).</td></tr>'
    + '<tr><td>Backup</td><td>Tested restores. Immutable / off-site copy. Ransomware-resistant.</td></tr>'
    + '<tr><td>People</td><td>Phishing simulations. Onboarding security training. Incident-response runbook + practice.</td></tr>'
    + '</table>'

    + '<h4>What you\'ve learned</h4>'
    + '<ul>'
    +   '<li><strong>Mindset</strong>: kill chain, threat models, ethics scope (level 0–1).</li>'
    +   '<li><strong>Recon and network</strong>: what attackers see; why HTTPS does and doesn\'t help (level 2–3).</li>'
    +   '<li><strong>Crypto and auth</strong>: the misuse patterns that produce real breaches (level 4–5).</li>'
    +   '<li><strong>Web vulns</strong>: SQLi, XSS, broken access control — the OWASP Top 3 (level 6–8).</li>'
    +   '<li><strong>Memory safety</strong>: why 70% of CVEs is one class, and what fixes it (level 9).</li>'
    +   '<li><strong>RE and privesc</strong>: how attackers move once inside (level 10–11).</li>'
    +   '<li><strong>Detection and IR</strong>: how blue teams catch and contain (level 12).</li>'
    +   '<li><strong>Synthesis</strong>: principles for designing systems that resist all of the above (this level).</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Where to go from here</div>'
    + 'Concrete next steps to build on this trainer: <ul>'
    + '<li><strong>HackTheBox / TryHackMe</strong> — guided practice for hands-on technique.</li>'
    + '<li><strong>OSCP</strong> — the standard offensive cert; puts the methodology together at scale.</li>'
    + '<li><strong>BlueTeamLabs / LetsDefend</strong> — defensive equivalents.</li>'
    + '<li><strong>OWASP Cheat Sheet Series</strong> — definitive concise refs for web security.</li>'
    + '<li><strong>Bug bounty programs</strong> on HackerOne / Bugcrowd — get paid for what you\'ve learned (legally).</li>'
    + '<li><strong>Capture the Flag</strong> — picoCTF for beginners; CTFtime for the calendar.</li>'
    + '<li><strong>Real defense</strong>: detection engineering, threat hunting, vulnerability management — much of the industry\'s actual paid work.</li>'
    + '</ul></div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a feature you might design. Click to see a STRIDE-driven mini-threat-model.</p>';
    var features = [
      { name: 'Password reset via email link',
        spoof: 'User-enumeration via response differences (level 1.2).',
        tamper: 'Predictable / reused / non-expiring tokens.',
        repud: 'No log of who initiated; user denies later.',
        info: 'User-enum (above) + token leaked in referrer header.',
        dos: 'Spam reset endpoint to lock target out.',
        eop: 'Reset link logs the user in WITHOUT requiring the user to set a new password (token === session).' },
      { name: 'File upload (avatar)',
        spoof: 'User uploads as someone else if upload endpoint doesn\'t check identity.',
        tamper: 'User overwrites another user\'s avatar (path-traversal in filename).',
        repud: 'No upload audit log.',
        info: 'Stored in public bucket → enumeration of user IDs reveals all avatars.',
        dos: '10 GB upload eats disk; 10,000 small uploads thrash.',
        eop: 'Filename "../../etc/cron.d/x" writes outside intended dir; SVG with embedded script → XSS on view; ImageMagick parser RCE (Imagetragick); content-type sniff = HTML rendered as page.' },
      { name: 'OAuth login ("sign in with Google")',
        spoof: 'Account-takeover via email-changed-then-OAuth-link in some weird order.',
        tamper: 'Open-redirect in callback URL.',
        repud: 'No audit of WHICH provider authorized.',
        info: 'Token / state leaked via referrer.',
        dos: 'IdP outage → users locked out (defense: have password fallback).',
        eop: 'Redirect URI allow-list misconfig → token delivered to attacker.' },
      { name: 'Webhook receiver',
        spoof: 'No signature check → forge events.',
        tamper: 'Replay old signed event for same effect twice.',
        repud: 'No audit log of received events.',
        info: 'Verbose error responses leak internal state.',
        dos: 'Provider can flood you; your DB load spikes.',
        eop: 'Webhook payload deserialization → RCE if using insecure-deserialize-by-default lib.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a feature</span>';
    features.forEach(function (f) {
      var b = document.createElement('button'); b.className = 'chip';
      b.style.maxWidth = '260px'; b.style.whiteSpace = 'normal'; b.style.textAlign = 'left';
      b.textContent = f.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">Threat model:</strong> ' + f.name + '</div>' +
          '<div class="info-line"><span class="key">S — Spoofing:</span> <span class="val">' + f.spoof + '</span></div>' +
          '<div class="info-line"><span class="key">T — Tampering:</span> <span class="val">' + f.tamper + '</span></div>' +
          '<div class="info-line"><span class="key">R — Repudiation:</span> <span class="val">' + f.repud + '</span></div>' +
          '<div class="info-line"><span class="key">I — Info disclosure:</span> <span class="val">' + f.info + '</span></div>' +
          '<div class="info-line"><span class="key">D — Denial of service:</span> <span class="val">' + f.dos + '</span></div>' +
          '<div class="info-line"><span class="key">E — Elevation of privilege:</span> <span class="val">' + f.eop + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A startup\'s entire deployment uses ONE AWS access key, hardcoded in their CI config, with full administrator privileges. Which load-bearing principle does this most violate?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Defense in depth</option>' +
          '<option>Least privilege</option>' +
          '<option>Zero trust</option>' +
          '<option>Make breaches detectable</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Least privilege') return { correct: true, feedback: 'Right. One key with admin everywhere = max-blast-radius. Compromise of CI (where the key lives), CI logs (where it might leak), or a developer\'s laptop = full account takeover. Fix: per-service IAM roles, OIDC-from-CI (no long-lived keys at all), short-lived credentials. Also touches "secure by default" (the platform offers safer alternatives — they ignored them).' };
        return { correct: false, feedback: 'Single admin key for everything is the textbook least-privilege violation.' };
      },
      hints: [
        'One key with all permissions everywhere is the opposite of which principle?',
        'Least privilege.',
        'Per-service roles, not shared admin keys.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re reviewing a company\'s security strategy. They proudly say: "We have a WAF, that\'s our security." What\'s the strongest critique using the principles above?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>WAFs are useless — never deploy one</option>' +
          '<option>A single WAF as the entire defense violates defense-in-depth: one bypass (encoding tricks, novel payloads, app-layer bugs the WAF can\'t see) = full compromise. WAF is a fine outer layer, but app-level controls (parameterized queries, output encoding, authn/authz) must exist independently.</option>' +
          '<option>WAFs only work for HTTP/2</option>' +
          '<option>WAFs require root access</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('A single WAF as the entire defense') === 0) return { correct: true, feedback: 'Right. WAFs are pattern-matchers; they trail novel attacks and can be bypassed by encoding/obfuscation. They also can\'t see the app-layer access-control logic where most modern bugs live (IDOR, broken authz). A WAF is one layer in a defense-in-depth stack — combined with parameterized queries + output encoding + good authn/authz, it adds a lot. Alone, it\'s false comfort.' };
        if (v === 'WAFs are useless — never deploy one') return { correct: false, feedback: 'WAFs add a layer; they\'re useful. The critique is "ONLY a WAF is insufficient," not "WAFs are bad."' };
        return { correct: false, feedback: 'Defense-in-depth: a single layer is fragile. WAFs trail novel attacks and can\'t see app-layer authz logic.' };
      },
      hints: [
        'Defense-in-depth — multiple independent layers.',
        'A WAF is one layer. Bypassed by encoding tricks; can\'t see app-layer authz.',
        'Need app-level controls AS WELL.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re designing a payment-processing endpoint for a SaaS. List the controls you\'d include from the principles above (mark TRUE for ones that should be in v1).',
      mountInput: function (c) {
        var items = [
          { label: 'Strong authentication (FIDO2 or strong MFA on staff-side; properly hashed user passwords)', t: true },
          { label: 'Per-row authorization check on the payment object (IDOR defense)',                          t: true },
          { label: 'Parameterized queries everywhere',                                                          t: true },
          { label: 'Audit log: who initiated, amount, source IP, timestamp, response',                          t: true },
          { label: 'Idempotency keys to prevent double-charge on retry',                                        t: true },
          { label: 'Stored credit-card PANs in plaintext for "speed"',                                          t: false },
          { label: 'Single shared admin DB user with full privileges to all tables',                            t: false },
          { label: 'Webhook receiver that trusts any source (no signature)',                                    t: false }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. The first five are core: auth (level 5), authz IDOR-defense (level 8), parameterized queries (level 6), audit log (level 12), idempotency (basic robustness + replay defense). The last three are anti-patterns that consistently appear in real bug reports: storing PANs unencrypted is a PCI compliance failure (use a vault token); single admin DB user violates least privilege; trusting webhooks without sig verification is the bug from level 1.3 again. Real-world: every PCI-compliant payment system implements at least the top five.' };
        return { correct: false, feedback: 'Re-check: the first five are essential; the last three are explicit anti-patterns. (PANs in plaintext = PCI violation; shared admin DB user = least-privilege violation; unsigned webhook = level 1.3.)' };
      },
      hints: [
        'Apply: least privilege, defense-in-depth, threat-model the flow.',
        'Auth + authz + parameterization + logging + idempotency. Avoid plaintext PANs, shared admin, unsigned webhooks.',
        'First five TRUE, last three FALSE.'
      ]
    }
  ]
});
