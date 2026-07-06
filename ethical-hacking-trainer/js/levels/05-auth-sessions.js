// Level 5 — Authentication & sessions
EHT.registerLevel({
  id: 5,
  title: 'Authentication &amp; Sessions',
  whyItMatters: 'Auth is the most-attacked surface on the public internet. Credential stuffing, password reuse, MFA bypass, session hijacking — knowing how each works tells you which controls actually move the needle vs which are theater.',
  glossary: ['MFA', 'TOTP', 'WebAuthn', 'SSO', 'OAuth2', 'JWT', 'cred stuffing'],
  learn: ''
    + '<h4>The three factor types</h4>'
    + '<ul>'
    +   '<li><strong>Something you know</strong> — password, PIN, security question.</li>'
    +   '<li><strong>Something you have</strong> — phone (TOTP, push), hardware key (FIDO2), smartcard.</li>'
    +   '<li><strong>Something you are</strong> — fingerprint, face, voice, typing rhythm.</li>'
    + '</ul>'
    + '<p>"Multi-factor" means combining factors from different categories. Two passwords + a security question = still single-factor (all "know"). Password + TOTP = two-factor (know + have). Password + face unlock = two-factor (know + are).</p>'

    + '<h4>Password attacks, ranked by frequency</h4>'
    + '<ol>'
    +   '<li><strong>Credential stuffing</strong> — try leaked username:password pairs from one breach against unrelated sites. Works because of password reuse. Most common attack on public sites in 2026.</li>'
    +   '<li><strong>Password spraying</strong> — try a small list of common passwords (Spring2024!, Password123) against a large list of usernames. Defeats simple per-account lockout (per-account counter resets; the attacker uses each pwd once per account).</li>'
    +   '<li><strong>Phishing</strong> — fake login page captures credentials directly. Often combined with real-time relay against the real site (proxies the MFA prompt).</li>'
    +   '<li><strong>Brute force</strong> against a single account — rare on public sites due to rate limiting; common against offline-cracked DB dumps.</li>'
    + '</ol>'

    + '<h4>MFA flavors, ranked by phishing resistance</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Method</th><th>Phishing-resistant?</th><th>Notes</th></tr>'
    + '<tr><td>SMS OTP</td><td class="bad">No</td><td>Worst MFA. Vulnerable to SIM swap, phishing relay, telco breaches. Better than nothing.</td></tr>'
    + '<tr><td>TOTP (Authenticator apps)</td><td class="warn">No</td><td>Phishing relay still works — attacker proxies the OTP in real time. Better than SMS.</td></tr>'
    + '<tr><td>Push notification</td><td class="warn">Partial</td><td>"MFA fatigue" — spam pushes until user taps "approve." Number-matching helps. Still relayable.</td></tr>'
    + '<tr><td>FIDO2 / WebAuthn / passkeys</td><td class="good">Yes</td><td>Origin-bound — the browser verifies the requesting URL matches the registered one. A phishing site at evil.com simply CAN\'T reuse the credential.</td></tr>'
    + '</table>'
    + '<p>The leap from "any MFA" → "phishing-resistant MFA" is one of the largest practical wins available to most orgs in 2026. Hardware keys cost $30–60.</p>'

    + '<h4>Sessions and tokens</h4>'
    + '<p>After auth succeeds, the server issues a credential the client sends with each subsequent request. Two flavors:</p>'
    + '<ul>'
    +   '<li><strong>Server-side session</strong> — the server stores user state in a session store (Redis, etc.); cookie holds an opaque session ID. Easy to revoke (drop from store). Default for traditional web apps.</li>'
    +   '<li><strong>JWT (token)</strong> — server signs a self-contained payload; client holds it; server verifies signature on each request without lookup. Hard to revoke without a denylist. Common in microservices / mobile.</li>'
    + '</ul>'

    + '<h4>Session cookie hygiene</h4>'
    + '<p>Set the four flags on every session cookie:</p>'
    + '<ul>'
    +   '<li><code>HttpOnly</code> — JS can\'t read it. Critical for limiting XSS damage (an XSS payload can\'t steal the cookie).</li>'
    +   '<li><code>Secure</code> — only sent over HTTPS. Don\'t leak it to plain HTTP.</li>'
    +   '<li><code>SameSite=Lax</code> (or <code>Strict</code>) — not sent on cross-origin POSTs. Defangs CSRF.</li>'
    +   '<li><code>__Host-</code> prefix — additional integrity (host-locked, no Domain attr, must be Secure).</li>'
    + '</ul>'

    + '<h4>JWT specific gotchas</h4>'
    + '<ul>'
    +   '<li><strong>"alg: none"</strong> — old/buggy libs honored a JWT with the algorithm field set to "none" — meaning no signature required. Modern libs reject this; old code still in the wild.</li>'
    +   '<li><strong>Algorithm confusion</strong> — server expects RS256 (asymmetric) but a buggy verifier accepts HS256 (symmetric) using the public key as the HMAC key. Now an attacker forges with the public key.</li>'
    +   '<li><strong>Long-lived tokens</strong> — JWT is hard to revoke. Keep them short (minutes) + use refresh tokens with revocation lists.</li>'
    +   '<li><strong>Sensitive data in payload</strong> — JWT payload is base64url-encoded, NOT encrypted. Anyone who sees the token reads it.</li>'
    + '</ul>'

    + '<h4>SSO and OAuth2</h4>'
    + '<p>SSO lets one identity provider (Okta, Azure AD, Google) authenticate users for many apps. OAuth2 is the protocol for delegated authorization ("let app X read my Google calendar without sharing my password"). OIDC layers identity onto OAuth2 ("here\'s a signed token saying who the user is").</p>'
    + '<p>Common bug class: <strong>misconfigured redirect URIs</strong>. If the IdP allows a wildcard or open redirect, an attacker can trick the flow into delivering tokens to a malicious URL.</p>'

    + '<h4>Account-recovery: the auth backdoor</h4>'
    + '<p>Most "MFA bypass" stories aren\'t MFA bypasses — they\'re recovery-flow exploits. The recovery flow MUST itself be at least as strong as the primary auth, or it\'s the new front door. Helpdesk social engineering ("I lost my phone, can you reset MFA?") is the leaky path. Real solution: out-of-band identity verification, manager approval, or no recovery at all (require re-enrollment).</p>'

    + '<div class="callout"><div class="label">A useful credential-storage rule</div>'
    + 'If you find yourself thinking "I\'ll store the password encrypted with AES so I can decrypt it later," stop. <strong>You should never need to decrypt a stored password.</strong> Hashing is one-way by design. If you need to "recover" a password, the answer is "force a reset," not "encrypt it." The only things you should store reversibly are tokens you actually need to USE again (e.g., OAuth refresh tokens for 3rd party APIs).'
    + '</div>',

  mountPlay: function (container) {
    var eh = EHT.lib.eh;
    container.innerHTML = '<p class="muted">Run a small "credential stuffing" simulation against a fake user list. See why password reuse is the actual problem.</p>';

    var leakedPasswords = [
      'password123', 'qwerty', 'monkeybanana', 'Spring2024!', 'letmein', 'iloveyou', '123456'
    ];
    var users = [
      { name: 'alice',   reuse: false, pwd: 'butterfly42' },
      { name: 'bob',     reuse: true,  pwd: 'qwerty' },
      { name: 'charlie', reuse: true,  pwd: 'monkeybanana' },
      { name: 'dave',    reuse: false, pwd: 'aB7$xK2pQ#9z!w' },
      { name: 'eve',     reuse: true,  pwd: 'letmein' },
      { name: 'frank',   reuse: false, pwd: 'correcthorsebatterystaple' }
    ];

    var output = document.createElement('div'); output.className = 'formula-box';
    var btn = document.createElement('button'); btn.className = 'primary-btn'; btn.textContent = 'Run credential-stuffing simulation';
    btn.addEventListener('click', function () {
      var hits = [];
      users.forEach(function (u) {
        leakedPasswords.forEach(function (lp) {
          if (lp === u.pwd) hits.push({ user: u.name, pwd: lp });
        });
      });
      var lines = [
        '<span class="prompt">$</span> stuff --userlist users.txt --passlist top1k_leaked.txt --target login.example.com',
        '<span class="out">Trying ' + (users.length * leakedPasswords.length) + ' combinations...</span>',
        ''
      ];
      hits.forEach(function (h) {
        lines.push('[<span class="bad">+</span>] <span class="hi">' + h.user + ' : ' + h.pwd + '</span> <span class="out">— login successful</span>');
      });
      lines.push('');
      lines.push('<span class="out">Done. ' + hits.length + ' / ' + users.length + ' accounts compromised via credential stuffing.</span>');
      output.innerHTML = '<div class="terminal">' + lines.join('\n') + '</div>' +
        '<div class="info-line muted" style="margin-top:8px">Note: alice / dave / frank used unique passwords. Their accounts were not affected by this leak — even though the company they used here might have had a worse breach. <strong>Password reuse is the multiplier that makes credential stuffing effective.</strong></div>';
    });
    output.innerHTML = '<span class="muted">← click button</span>';
    container.appendChild(btn);
    container.appendChild(document.createElement('br'));
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Your CISO is choosing one MFA method to require company-wide. Phishing is their #1 reported threat. Which option is the strongest?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>SMS one-time codes</option>' +
          '<option>TOTP authenticator app (e.g. Google Authenticator)</option>' +
          '<option>Push notification with number-matching</option>' +
          '<option>FIDO2 / WebAuthn hardware keys</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'FIDO2 / WebAuthn hardware keys') return { correct: true, feedback: 'Right. FIDO2 is the only one of these that\'s phishing-resistant. The browser binds the credential to the requesting origin during registration; a phishing page at evil.com simply cannot present the right origin to invoke the credential. SMS, TOTP, and push are all relayable in real-time by an attacker proxying the legitimate site.' };
        if (v === 'SMS one-time codes') return { correct: false, feedback: 'SMS is the WEAKEST option here. Vulnerable to SIM swap and phishing relay.' };
        if (v === 'TOTP authenticator app (e.g. Google Authenticator)') return { correct: false, feedback: 'Better than SMS but still relayable — attacker proxies the prompt in real time.' };
        if (v === 'Push notification with number-matching') return { correct: false, feedback: 'Number-matching helps with MFA fatigue but doesn\'t stop phishing relay.' };
        return { correct: false, feedback: 'Pick the only option that\'s phishing-resistant by design.' };
      },
      hints: [
        '"Phishing-resistant" is the property to optimize for.',
        'Three of the four are still relayable through a real-time phishing proxy.',
        'FIDO2 / WebAuthn — origin-bound by design.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A web app sets a session cookie like: <code>Set-Cookie: session=abc123;</code> with no flags. Pick all flags you should add (mark TRUE for ones you want, FALSE for ones you don\'t).',
      mountInput: function (c) {
        var items = [
          { label: 'HttpOnly', t: true,  why: 'Prevents JavaScript reading the cookie — limits XSS impact.' },
          { label: 'Secure',   t: true,  why: 'Only sent over HTTPS — prevents leakage on plain HTTP.' },
          { label: 'SameSite=Lax (or Strict)', t: true, why: 'Not sent on cross-origin POSTs — defangs CSRF.' },
          { label: 'Domain=.example.com (broaden scope)', t: false, why: 'BROADER scope = MORE risk, not less. Default (host-only) is safer.' },
          { label: 'Max-Age=315360000 (10 years)',         t: false, why: 'Long-lived sessions = bigger blast radius if leaked. Keep them short and rotate.' }
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
        if (allCorrect) return { correct: true, feedback: 'Right. Add HttpOnly, Secure, SameSite. Don\'t broaden Domain (default host-only is safer) and don\'t make sessions live for years (rotate often, ideally short-lived + refresh).' };
        return { correct: false, feedback: 'Re-check: add HttpOnly + Secure + SameSite. Don\'t add Domain= (broadens scope) or huge Max-Age (long-lived = high blast radius).' };
      },
      hints: [
        'There are three "always add" flags for session cookies.',
        'HttpOnly + Secure + SameSite. The other two options are anti-patterns.',
        'Add the first three, leave the last two unchecked.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re reviewing a JWT verification function:<br><br>' +
        '<code>function verify(token) { var [header, payload, sig] = token.split("."); var alg = JSON.parse(atob(header)).alg; if (alg === "HS256") return hmacSha256(SECRET, header + "." + payload) === sig; if (alg === "RS256") return rsaVerify(PUB_KEY, header + "." + payload, sig); throw new Error("unsupported alg"); }</code><br><br>' +
        'The team uses RS256 in production. What\'s the critical bug, and how does an attacker exploit it?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>The function uses atob — should use Buffer.from</option>' +
          '<option>Algorithm-confusion: an attacker submits a token with header.alg=HS256, then signs it with HMAC using the PUBLIC key as the HMAC secret. The verifier follows the alg field, takes the HS256 branch, and (since PUB_KEY is public) the attacker can produce a valid signature</option>' +
          '<option>It should use SHA-512 instead of SHA-256</option>' +
          '<option>The split should use safe destructuring</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Algorithm-confusion: an attacker submits a token with header.alg=HS256, then signs it with HMAC using the PUBLIC key as the HMAC secret. The verifier follows the alg field, takes the HS256 branch, and (since PUB_KEY is public) the attacker can produce a valid signature') return { correct: true, feedback: 'Right. Classic JWT algorithm-confusion bug, CVE-cluster going back ~2015 and still found regularly. The verifier trusts the JWT header to choose the algorithm — but in RS256 the public key is public. By switching alg to HS256, the attacker can produce HMAC signatures using the PUBLIC key as the HMAC secret. Fix: <strong>do NOT honor the alg field from the JWT</strong>. Hard-code the expected algorithm in the verifier, or maintain a key→algorithm mapping.' };
        if (v === 'The function uses atob — should use Buffer.from') return { correct: false, feedback: 'Cosmetic. Not the security issue.' };
        if (v === 'It should use SHA-512 instead of SHA-256') return { correct: false, feedback: 'Hash size isn\'t the issue.' };
        if (v === 'The split should use safe destructuring') return { correct: false, feedback: 'Cosmetic.' };
        return { correct: false, feedback: 'Hint: the verifier reads the algorithm from the token. What if the attacker controls that field?' };
      },
      hints: [
        'The verifier honors the alg field from the JWT header.',
        'What if the attacker submits a token with a DIFFERENT algorithm than the server normally uses?',
        'Algorithm confusion. RS256 → HS256 swap with the public key as HMAC secret.'
      ]
    }
  ]
});
