// Level 1 — CIA + threat models
EHT.registerLevel({
  id: 1,
  title: 'CIA Triad &amp; Threat Models',
  whyItMatters: 'Before you can attack or defend a system, you have to know what you\'re trying to break or protect. "Security" is too vague. The CIA triad gives you three concrete, testable properties — and naming WHICH property an attack breaks is the first step of every assessment.',
  glossary: ['CIA', 'AAA', 'threat model', 'STRIDE'],
  learn: ''
    + '<h4>The CIA triad</h4>'
    + '<p>Three properties any system must defend. An "attack" is something that violates at least one.</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Property</th><th>What it means</th><th>Violated by</th><th>Defended with</th></tr>'
    + '<tr><td><strong>Confidentiality</strong></td><td>Only authorized parties can see the data.</td><td>Eavesdropping, data exfil, info disclosure bugs.</td><td>Encryption (at rest, in transit), access control, classification.</td></tr>'
    + '<tr><td><strong>Integrity</strong></td><td>Data hasn\'t been tampered with; it\'s what it claims to be.</td><td>MITM altering messages, malicious patches, log tampering.</td><td>Hashes, MACs, digital signatures, immutable storage.</td></tr>'
    + '<tr><td><strong>Availability</strong></td><td>The system is usable when needed.</td><td>DDoS, ransomware, deletion, broken HA.</td><td>Redundancy, rate limits, backups, capacity planning.</td></tr>'
    + '</table>'

    + '<h4>"Same attack, different property"</h4>'
    + '<p>The same technical move can break different properties depending on context:</p>'
    + '<ul>'
    +   '<li>Stealing a database — confidentiality.</li>'
    +   '<li>Wiping the database — availability.</li>'
    +   '<li>Quietly editing 1000 invoices to a different bank account — integrity. <em>This is often the costliest, because the org might not notice for months.</em></li>'
    + '</ul>'

    + '<h4>AAA — the operational extension</h4>'
    + '<p>CIA is the goal. AAA is how you achieve it operationally:</p>'
    + '<ul>'
    +   '<li><strong>Authentication</strong> — who are you? (Password, MFA, certificate.)</li>'
    +   '<li><strong>Authorization</strong> — what may you do? (RBAC, ACLs, capabilities.)</li>'
    +   '<li><strong>Auditing / Accounting</strong> — what did you do? (Logs.)</li>'
    + '</ul>'
    + '<p>Authn is checked once per session; authz on every action; audit always.</p>'

    + '<h4>Threat modeling — STRIDE</h4>'
    + '<p>Microsoft\'s STRIDE acronym gives you six categories to consider for every component / data flow:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Letter</th><th>Threat</th><th>Maps to</th></tr>'
    + '<tr><td>S</td><td>Spoofing identity</td><td>Authentication</td></tr>'
    + '<tr><td>T</td><td>Tampering with data</td><td>Integrity</td></tr>'
    + '<tr><td>R</td><td>Repudiation (denying you did it)</td><td>Audit</td></tr>'
    + '<tr><td>I</td><td>Information disclosure</td><td>Confidentiality</td></tr>'
    + '<tr><td>D</td><td>Denial of service</td><td>Availability</td></tr>'
    + '<tr><td>E</td><td>Elevation of privilege</td><td>Authorization</td></tr>'
    + '</table>'

    + '<h4>The threat-modeling exercise (4 questions)</h4>'
    + '<p>From Adam Shostack:</p>'
    + '<ol>'
    +   '<li><strong>What are we building?</strong> Draw a data-flow diagram. Components, trust boundaries, data flows.</li>'
    +   '<li><strong>What can go wrong?</strong> Walk STRIDE per component / boundary.</li>'
    +   '<li><strong>What are we going to do about it?</strong> Decide: mitigate, transfer (insurance), accept, or eliminate.</li>'
    +   '<li><strong>Did we do a good job?</strong> Review the model, test the controls.</li>'
    + '</ol>'
    + '<p>Threat modeling beats individual bug-hunting because it finds entire <em>missing</em> controls, not just bugs in existing ones.</p>'

    + '<h4>Trust boundaries</h4>'
    + '<p>The most useful concept on the diagram. A trust boundary is a line your data crosses where it goes from one trust level to another. Examples:</p>'
    + '<ul>'
    +   '<li>Browser → server: untrusted to "we control this" (this is where input validation lives).</li>'
    +   '<li>Web frontend → DB query layer: structured to a different parser (this is where SQLi lives).</li>'
    +   '<li>HTML template → DOM: data to executable (this is where XSS lives).</li>'
    +   '<li>App → kernel: userspace to root (this is where privesc lives).</li>'
    + '</ul>'
    + '<p><strong>Almost every vulnerability lives at a trust boundary.</strong> Find them on your diagram, scrutinize them.</p>'

    + '<div class="callout"><div class="label">Why "encryption fixes everything" is wrong</div>'
    + 'Encryption preserves <strong>confidentiality in transit</strong>. It does not by itself protect integrity (use AEAD modes — GCM, ChaCha20-Poly1305 — not just CBC). It does not protect availability (encrypted ransomware works fine). It does not protect against the encrypted server returning the data after a successful login bypass. CIA is three properties for a reason.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a scenario. The labels show which CIA property is broken AND which STRIDE category fits.</p>';
    var scenarios = [
      { name: 'Attacker reads passwords from a leaked DB backup',
        cia: 'Confidentiality', stride: 'Information disclosure (I)',
        note: 'Read-only access to data that should be secret. Doesn\'t change the data; doesn\'t take down the service.' },
      { name: 'Ransomware encrypts every file; pays-for-decryption demand',
        cia: 'Availability (primary), Integrity (secondary)', stride: 'Denial of service (D); Tampering (T)',
        note: 'Files are still THERE but unusable; the encryption itself is also tampering.' },
      { name: 'Attacker forges a JWT and accesses another user\'s account',
        cia: 'Confidentiality + Integrity (depends on what they do)', stride: 'Spoofing (S); Elevation of privilege (E)',
        note: 'Pretending to be someone else = spoofing. If they then use it to perform admin actions, also EoP.' },
      { name: 'MITM alters bank transfer amount in transit',
        cia: 'Integrity', stride: 'Tampering (T)',
        note: 'Confidentiality might also be broken if read in plaintext, but the financial impact is from tampering.' },
      { name: 'Insider deletes audit logs to cover their tracks',
        cia: 'Integrity (specifically of the audit trail)', stride: 'Repudiation (R)',
        note: 'They can now deny the bad thing they did; the system can\'t prove otherwise.' },
      { name: 'DDoS botnet floods login endpoint, legitimate users locked out',
        cia: 'Availability', stride: 'Denial of service (D)',
        note: 'The service is up but unusable.' },
      { name: 'Web user changes /orders/123 in URL to /orders/124, sees another customer\'s order',
        cia: 'Confidentiality', stride: 'Information disclosure (I)',
        note: 'Classic IDOR; covered in level 8.' },
      { name: 'Local user exploits SUID bug to run as root',
        cia: 'Authorization broken', stride: 'Elevation of privilege (E)',
        note: 'Subsequent damage depends on what they do as root.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a scenario</span>';
    scenarios.forEach(function (s) {
      var b = document.createElement('button'); b.className='chip'; b.textContent = s.name;
      b.style.maxWidth = '260px'; b.style.whiteSpace = 'normal'; b.style.textAlign = 'left';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">Scenario</strong>: ' + s.name + '</div>' +
          '<div class="info-line"><span class="key">CIA broken:</span> <span class="val">' + s.cia + '</span></div>' +
          '<div class="info-line"><span class="key">STRIDE:</span> <span class="val">' + s.stride + '</span></div>' +
          '<div class="info-line"><span class="key">Note:</span> <span class="val">' + s.note + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A database admin runs <code>UPDATE invoices SET amount=amount*0.99 WHERE 1=1</code> "by accident" and 100,000 invoices have wrong values until backup restore. Which CIA property was MOST DIRECTLY violated?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Confidentiality</option><option>Integrity</option><option>Availability</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Integrity') return { correct: true, feedback: 'Right. The data wasn\'t leaked (no confidentiality break) and the system was up the whole time (no availability break). The data was MODIFIED — wrong values written. That\'s an integrity violation, even though it was accidental rather than malicious.' };
        if (v === 'Confidentiality') return { correct: false, feedback: 'Nothing was leaked to an unauthorized party. The data was wrong, not exposed.' };
        if (v === 'Availability') return { correct: false, feedback: 'The DB was up. Wrong values is a different category than "users can\'t reach the system."' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Walk through CIA. Was data leaked? Was the system down? Was data changed?',
        'The data was changed. Not leaked, not unavailable.',
        'Integrity.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re threat-modeling a "forgot password" flow that emails a reset link. Match each STRIDE letter to the most relevant concern in this flow.',
      mountInput: function (c) {
        var concerns = [
          { letter: 'S — Spoofing',           desc: 'Attacker triggers password reset for someone else\'s account by knowing their email.' },
          { letter: 'T — Tampering',          desc: 'Reset token is predictable / sequential, allowing crafted tokens.' },
          { letter: 'R — Repudiation',        desc: 'No log of WHO requested the reset; user denies clicking the link.' },
          { letter: 'I — Information disclosure', desc: '"User not found" vs "email sent" reveals whether an email exists in the system.' },
          { letter: 'D — Denial of service',  desc: 'Attacker spams reset endpoint to lock out a target user / fill mail queue.' },
          { letter: 'E — Elevation of privilege', desc: 'Reset link reuses session of currently-logged-in admin in some weird browser-state edge case.' }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        concerns.forEach(function (c2) {
          var lbl = document.createElement('label');
          lbl.appendChild(document.createTextNode(c2.letter + ': ' + c2.desc));
          div.appendChild(lbl);
        });
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— which is the MOST commonly real-world exploited issue in this flow? —</option>' +
          '<option>S — Spoofing (just emailing-someone-elses-link is unavoidable)</option>' +
          '<option>I — Information disclosure (user-enumeration via different responses)</option>' +
          '<option>R — Repudiation (no log of who requested)</option>' +
          '<option>E — Elevation of privilege (admin session reuse)</option>';
        c.appendChild(div);
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'I — Information disclosure (user-enumeration via different responses)') return { correct: true, feedback: 'Right. User enumeration via different responses ("user not found" vs "email sent" vs different timing) is real-world rampant. It\'s the basis for credential-stuffing list curation. Every bug-bounty triages it daily. Fix: respond identically regardless of whether the email exists.' };
        return { correct: false, feedback: 'The most commonly exploited in real-world bug bounties is user enumeration — "user not found" vs "email sent" leaks WHICH emails are accounts. Attackers use this to refine credential-stuffing lists.' };
      },
      hints: [
        'Walk through STRIDE for this flow.',
        'Which one routinely shows up in real bug bounty triage?',
        'User enumeration via response differences — Information Disclosure.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re reviewing a small SaaS\'s architecture. The diagram shows: <code>Browser → CloudFront → API Gateway → Lambda → DynamoDB</code>, with a separate path <code>Stripe webhook → API Gateway → Lambda → DynamoDB</code>. Where are the trust boundaries that need scrutiny, and what\'s the highest-impact one to mismodel?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Browser → CloudFront — biggest because it\'s untrusted internet input</option>' +
          '<option>Stripe webhook → API Gateway — easily forgeable if signature verification is missing</option>' +
          '<option>Lambda → DynamoDB — IAM should restrict this</option>' +
          '<option>API Gateway → Lambda — check the integration mapping for injection</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Stripe webhook → API Gateway — easily forgeable if signature verification is missing') return { correct: true, feedback: 'Right. All four boundaries deserve attention, but the webhook one is the most commonly mismodeled with the highest blast radius. Junior devs often think "the URL is secret, only Stripe will hit it" — but ANY internet client can POST to your webhook URL. Without signature verification (Stripe-Signature header HMAC check), an attacker forges "user paid $X" events and gets free service. The Stripe docs literally show this; many integrations skip it. Same problem appears with GitHub webhooks, Slack, etc. Real-world it\'s a regular bug-bounty finding.' };
        if (v === 'Browser → CloudFront — biggest because it\'s untrusted internet input') return { correct: false, feedback: 'Browser-input is the OBVIOUS boundary — every dev knows it\'s untrusted. The MISMODELED boundary (high-impact + commonly missed) is the webhook one.' };
        if (v === 'Lambda → DynamoDB — IAM should restrict this') return { correct: false, feedback: 'Real, but a misconfigured IAM is a gradual escalation issue, not the "single typo costs you money daily" boundary.' };
        if (v === 'API Gateway → Lambda — check the integration mapping for injection') return { correct: false, feedback: 'Worth modeling, but it\'s an internal-internal hop. The webhook hop is more commonly mismodeled with worse direct impact.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Trust boundaries are where data crosses from "untrusted" to "we believe this." Look for the boundary that\'s WRONGLY assumed trusted.',
        'Webhook URLs are public. Anyone can POST.',
        'Stripe webhook → API Gateway: forgeable without signature verification. Highest impact when forgotten.'
      ]
    }
  ]
});
