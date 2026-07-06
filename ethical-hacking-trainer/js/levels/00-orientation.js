// Level 0 — Orientation
EHT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Ethical hacking is a discipline, not a vibe. Before techniques, three things matter: legal scope, the attacker\'s mental model (the kill chain), and the cultural distinction between red, blue, and purple work. This level lays out the rules of the game.',
  glossary: ['pentest', 'red team', 'blue team', 'purple team', 'CTF', 'kill chain', 'TTPs', 'IOC'],
  learn: ''
    + '<div class="scope-banner">'
    +   '<span class="label">Scope &amp; legality</span>'
    +   'Every technique in this trainer is taught for <strong>defensive understanding and authorized testing</strong>: your own machines, lab VMs, intentionally-vulnerable platforms (HackTheBox, TryHackMe, VulnHub, OverTheWire, PortSwigger Web Academy), and CTF events. <strong>Running these techniques against systems you don\'t own or have written permission to test is a felony in most jurisdictions</strong> (CFAA in the US, Computer Misuse Act in the UK, similar laws elsewhere). Ignorance of intent is not a defense — courts care that you accessed the system, not what you found. When in doubt, don\'t.'
    + '</div>'

    + '<h4>Red, Blue, Purple</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Team</th><th>Mission</th><th>Outputs</th></tr>'
    + '<tr><td>Red</td><td>Simulate adversaries; find vulns and chains.</td><td>Pentest reports, exploitation paths.</td></tr>'
    + '<tr><td>Blue</td><td>Detect, respond, harden.</td><td>Detections (Sigma rules, alerts), incident reports, hardening guides.</td></tr>'
    + '<tr><td>Purple</td><td>Red and blue collaborating.</td><td>Tested detections (red runs the technique, blue checks if their alert fires).</td></tr>'
    + '</table>'
    + '<p>Most security jobs are blue. Red is where the trainer-shaped puzzles live, but a blue mindset (assume breach; what would you detect?) makes a red operator far better.</p>'

    + '<h4>The kill chain</h4>'
    + '<p>Lockheed Martin\'s Cyber Kill Chain (2011) became the canonical attacker-side model. Seven stages, top to bottom:</p>'
    + '<ol>'
    +   '<li><strong>Reconnaissance</strong> — find attack surface. Subdomain enum, port scans, OSINT.</li>'
    +   '<li><strong>Weaponization</strong> — craft the payload. Embed an exploit in a deliverable file.</li>'
    +   '<li><strong>Delivery</strong> — get the weapon to the target. Phishing email, USB drop, malicious ad.</li>'
    +   '<li><strong>Exploitation</strong> — bug triggers. Macro runs; browser hits a Use-After-Free; the parser dereferences a bad pointer.</li>'
    +   '<li><strong>Installation</strong> — persistence. New service, scheduled task, registry run-key, cron.</li>'
    +   '<li><strong>Command &amp; Control (C2)</strong> — phone home. HTTPS to evil.example, DNS tunneling, fronted CDN.</li>'
    +   '<li><strong>Actions on Objectives</strong> — the actual goal: data exfil, ransomware, lateral movement, credential harvesting.</li>'
    + '</ol>'
    + '<p>Defenders use it to reason about "where in the chain can we break this?" The earlier you break the chain, the cheaper the loss. Killing recon (reduce internet-facing services) is far cheaper than incident response after C2 is established.</p>'

    + '<h4>MITRE ATT&amp;CK — the modern kill chain</h4>'
    + '<p>ATT&amp;CK (attack.mitre.org) is a vastly more granular catalog of <strong>techniques</strong> grouped by <strong>tactics</strong>. Instead of "Installation," ATT&amp;CK gives you the exact technique IDs ("T1547.001 Registry Run Keys / Startup Folder", "T1053.005 Scheduled Task"). Every detection rule, every threat-intel report references these IDs. If you do anything blue-team, learn the framework.</p>'

    + '<h4>The "pyramid of pain"</h4>'
    + '<p>From David Bianco. Indicators are NOT all created equal — some are trivial for an attacker to change, some are foundational. Listed bottom (easy to change) to top (painful to change):</p>'
    + '<ol>'
    +   '<li>Hash values (trivially changed)</li>'
    +   '<li>IP addresses (changed in minutes)</li>'
    +   '<li>Domain names (changed in hours)</li>'
    +   '<li>Network/host artifacts (paths, mutex names)</li>'
    +   '<li>Tools (using a different RAT)</li>'
    +   '<li><strong>TTPs (tactics, techniques, procedures)</strong> — painful to change. The way an actor operates.</li>'
    + '</ol>'
    + '<p>If you build detections only on hashes and IPs, you\'ll be playing whack-a-mole. If you build on TTPs (e.g., "abnormal LSASS access"), you catch the actor across infrastructure changes.</p>'

    + '<h4>Where to legally practice (the user has Kali)</h4>'
    + '<ul>'
    +   '<li><strong>HackTheBox</strong> / <strong>TryHackMe</strong> — guided rooms + machines you can pwn legally.</li>'
    +   '<li><strong>OverTheWire (Bandit, Natas, Leviathan)</strong> — text-mode wargames, free.</li>'
    +   '<li><strong>VulnHub</strong> — vulnerable VMs you download and run on your own LAN.</li>'
    +   '<li><strong>PortSwigger Web Security Academy</strong> — the canonical free web-app vuln course (by the makers of Burp Suite).</li>'
    +   '<li><strong>picoCTF</strong> / <strong>CSAW CTF</strong> / <strong>DEF CON Quals</strong> — competitive CTFs.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">A useful test: would you tell your grandmother?</div>'
    + 'Before performing any technique against a system, ask: would you be comfortable explaining what you did, on the record, in court? If not, you\'re probably outside scope. Pentesters get written authorization (a "rules of engagement" document) before engaging — it specifies time windows, targets, allowed techniques, and out-of-scope assets. Treat your own activities the same way.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click each kill-chain stage to see what it looks like in practice and what defenders typically watch for.</p>';
    var stages = EHT.lib.eh.KILL_CHAIN;
    var defenseByStage = {
      'Reconnaissance': 'Reduce internet-facing surface; monitor DNS / cert-transparency for new subdomains; rate-limit unknown clients.',
      'Weaponization': 'Mostly invisible to defenders (happens on attacker infrastructure). Prevention is harder.',
      'Delivery': 'Email security gateway; remove macros from Office docs by default; web filtering; user training.',
      'Exploitation': 'Patch fast; EDR with exploit-prevention; sandboxing (browser, mail).',
      'Installation': 'Application allowlisting; AV/EDR on persistence locations; immutable infrastructure.',
      'Command & Control': 'Egress filtering, DNS sinkholing, JA3 fingerprinting, beacon-detection ML.',
      'Actions on Objectives': 'Data Loss Prevention, segmentation, immutable backups, behavior-based EDR (mass-encrypt detection, abnormal data egress).'
    };
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a stage</span>';
    stages.forEach(function (st, i) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = (i + 1) + '. ' + st.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">Stage ' + (i + 1) + ' — ' + st.name + '</strong></div>' +
          '<div style="margin-top:6px">' + st.desc + '</div>' +
          '<div class="info-line" style="margin-top:8px"><span class="key">Typical defenses:</span> <span class="val">' + defenseByStage[st.name] + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You discover a SQL injection in a public web app while bored. The site is a small business you\'ve never interacted with — no bug bounty, no permission. Which is the legally and ethically correct next step?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Exploit it to dump the database, then report what you found</option>' +
          '<option>Submit a polite report to security@theirdomain (or use HackerOne disclosure assistance) describing what you observed without further exploitation</option>' +
          '<option>Stay silent — you might get sued just for reporting</option>' +
          '<option>Post it publicly on Twitter so they fix it faster</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Submit a polite report to security@theirdomain (or use HackerOne disclosure assistance) describing what you observed without further exploitation') return { correct: true, feedback: 'Right. Coordinated disclosure is the only legal path here. Stop testing once the bug is confirmed; do NOT exfiltrate data; report through their disclosure address (look for security.txt at /.well-known/security.txt) or via a service like HackerOne. Some jurisdictions still expose the reporter to legal risk — be measured in what you say and don\'t over-share — but staying silent leaves the bug exploitable, and exploiting further crosses the legal line clearly.' };
        if (v === 'Exploit it to dump the database, then report what you found') return { correct: false, feedback: 'You\'re past authorized testing the moment you exploit further. "I was going to report it" is not a legal defense; many CFAA convictions exist exactly here.' };
        if (v === 'Stay silent — you might get sued just for reporting') return { correct: false, feedback: 'Reporting carries some risk in poorly-governed orgs, but the standard practice is coordinated disclosure. Public databases of disclosure-friendly companies exist (security.txt, HackerOne).' };
        if (v === 'Post it publicly on Twitter so they fix it faster') return { correct: false, feedback: 'That\'s "full disclosure," not "responsible disclosure." It actively endangers users while the org scrambles.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'There\'s a path that\'s both legal AND useful for defenders.',
        'Coordinated / responsible disclosure: report it, don\'t exploit further.',
        'Send a non-exploitative report to security@ or via a disclosure service.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'An incident-response report says: "Adversary changed C2 domains 7 times in 24 hours but kept using the same custom RAT and the same lateral-movement technique (WMI + scheduled tasks)." On the pyramid of pain, where should defenders invest detection effort to make THIS adversary\'s life hardest?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Block the domains as fast as possible</option>' +
          '<option>Block the file hashes of the RAT</option>' +
          '<option>Build a TTP-level detection on the WMI + scheduled-task lateral movement</option>' +
          '<option>Block source IPs of all observed beacons</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Build a TTP-level detection on the WMI + scheduled-task lateral movement') return { correct: true, feedback: 'Right. The adversary is rotating low-tier indicators (domains, IPs) cheaply, but their <em>technique</em> — WMI + scheduled-task lateral movement — is core to how they operate. A TTP detection (e.g. "wmiexec process tree pattern, then schtasks creation") catches them across every domain and binary they swap in. Hash blocks miss the next sample; domain blocks miss the next 7. TTP detection is the high-leverage play. (Pyramid of Pain, Bianco 2013.)' };
        if (v === 'Block the domains as fast as possible') return { correct: false, feedback: 'Domains are at the bottom of the pyramid — easy for the attacker to swap, as the report itself shows. Whack-a-mole.' };
        if (v === 'Block the file hashes of the RAT') return { correct: false, feedback: 'Hashes are even easier to change than domains (recompile / repack). Bottom of the pyramid.' };
        if (v === 'Block source IPs of all observed beacons') return { correct: false, feedback: 'IPs cycle in minutes. Marginal value as a primary control.' };
        return { correct: false, feedback: 'Re-read the pyramid of pain section in the lesson.' };
      },
      hints: [
        'Pyramid of pain: hashes/IPs are easy for attackers to change; TTPs are not.',
        'The adversary kept their technique (WMI + scheduled tasks) constant. That\'s the highest-leverage detection target.',
        'TTP-level detection.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A small company has a $50K security budget for the year. They\'re asking where to spend it. Their threat model: "we sell SaaS to small businesses; we\'re not a Tier-1 target, but we get phished a lot and our developers reuse passwords." Which TWO investments give the most kill-chain leverage for this profile?',
      mountInput: function (c) {
        var items = [
          { label: 'Email security gateway with macro stripping + URL rewriting', t: true,  why: 'Phishing → Delivery: kills most clicks before they hit a user.' },
          { label: 'Hardware-key MFA (FIDO2) for all employees',                  t: true,  why: 'Phishing-resistant MFA breaks credential-stuffing and credential-phishing — your two stated threats.' },
          { label: 'On-prem SIEM with 1 year of log retention',                   t: false, why: 'Useful for investigation, but won\'t prevent the most likely incidents at this profile. Lower ROI than the above two.' },
          { label: 'A custom-built decoy / honeypot infrastructure',              t: false, why: 'Cool, advanced. But for "we get phished a lot" + "password reuse," the higher-impact controls aren\'t honeypots.' },
          { label: 'A web-app pentest report once per year',                      t: false, why: 'Useful, but doesn\'t address phishing or password reuse — your two stated threats.' }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t, why: it.why };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected, why: b.why }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. The two highest-leverage controls for THIS threat model: <ol><li>Email security with macro stripping + URL rewriting → cuts off Delivery stage for the most-cited threat.</li><li>FIDO2 hardware keys → kills credential-phishing AND credential-stuffing simultaneously, since the private key never leaves the device and the origin is bound into the signed challenge.</li></ol>The other options (SIEM, honeypots, pentest) are valuable but addressed at OTHER threat profiles. Threat modeling is about matching controls to YOUR attackers.' };
        var picked = v.filter(function (b) { return b.picked; }).length;
        var hits = v.filter(function (b) { return b.picked === b.expected; }).length;
        return { correct: false, feedback: 'Not quite. The two correct ones are the email security gateway and FIDO2 keys — both target the stated threats (phishing, password reuse). Re-read the company\'s stated threat profile and pick controls that DIRECTLY address those.' };
      },
      hints: [
        'Threat modeling is matching controls to YOUR threats. List the company\'s stated threats first.',
        'They said: phishing + password reuse. Which two controls directly address those?',
        'Email security gateway + FIDO2 hardware MFA.'
      ]
    }
  ]
});
