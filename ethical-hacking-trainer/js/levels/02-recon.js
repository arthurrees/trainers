// Level 2 — Reconnaissance
EHT.registerLevel({
  id: 2,
  title: 'Reconnaissance',
  whyItMatters: 'Recon is stage 1 of the kill chain because it\'s where attackers find the surface to attack. The same techniques a red teamer uses to enumerate a target, a defender uses to know what their org is exposing. Both jobs run nmap.',
  glossary: ['OSINT', 'nmap', 'banner grab', 'dorking', 'ct logs'],
  learn: ''
    + '<h4>Passive vs active</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Passive recon</th><th>Active recon</th></tr>'
    + '<tr><td>Touches target?</td><td>No (just queries 3rd parties)</td><td>Yes — packets to the target</td></tr>'
    + '<tr><td>Logs / detection</td><td>Invisible to target</td><td>Logged in their IDS / WAF / cloud audit</td></tr>'
    + '<tr><td>Examples</td><td>Google dorking, Shodan, certificate transparency, GitHub search, LinkedIn for org chart, DNS records</td><td>nmap, banner grabbing, gobuster (directory brute), nuclei (vuln templates)</td></tr>'
    + '</table>'
    + '<p>Pentests usually start with thorough passive recon (no scope-blowing risk), then escalate to active.</p>'

    + '<h4>OSINT sources worth knowing</h4>'
    + '<ul>'
    +   '<li><strong>crt.sh</strong> — every public TLS cert ever issued for a domain. Reveals subdomains an org forgot existed. (<code>%.example.com</code> wildcard search.)</li>'
    +   '<li><strong>Shodan</strong> — search engine for internet-exposed services. "Show me every port 8080 in the US running Tomcat 9.0.30."</li>'
    +   '<li><strong>VirusTotal</strong> — passive DNS, file lookups. Sees what infrastructure has hosted what.</li>'
    +   '<li><strong>GitHub code search</strong> — leaked secrets, internal hostnames, dev configs. Tools: trufflehog, gitleaks.</li>'
    +   '<li><strong>Wayback Machine</strong> — archived versions of pages, including ones removed for security.</li>'
    +   '<li><strong>HaveIBeenPwned</strong> — known breached emails (limited; doesn\'t expose passwords without subscription).</li>'
    + '</ul>'

    + '<h4>nmap — the Swiss army knife</h4>'
    + '<p>What nmap does: send probes, observe responses, infer what\'s listening. Common modes:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Flag</th><th>What it does</th><th>Trade-off</th></tr>'
    + '<tr><td><code>-sS</code></td><td>SYN scan (default if root)</td><td>Sends SYN, never completes 3-way handshake. Stealthier; logs less than full connect.</td></tr>'
    + '<tr><td><code>-sT</code></td><td>TCP connect scan</td><td>Full 3-way handshake. Logged in app logs.</td></tr>'
    + '<tr><td><code>-sU</code></td><td>UDP scan</td><td>SLOW. UDP is connectionless; you wait for ICMP "port unreachable" timeouts.</td></tr>'
    + '<tr><td><code>-sV</code></td><td>Service / version detection</td><td>Banner grabs to figure out what\'s running.</td></tr>'
    + '<tr><td><code>-sC</code></td><td>Run default NSE scripts</td><td>Cheap intel: SSH algos, HTTP titles, DNS NSEC walks.</td></tr>'
    + '<tr><td><code>-A</code></td><td>Aggressive: -sV -sC -O --traceroute</td><td>Loud. Lots of info fast.</td></tr>'
    + '<tr><td><code>-p-</code></td><td>All 65,535 TCP ports</td><td>Slower than top-1000.</td></tr>'
    + '<tr><td><code>-T0..-T5</code></td><td>Timing/aggression</td><td>T0 = paranoid (slowest). T4 = "aggressive, fast on home WiFi". T5 = "insane, will lose packets".</td></tr>'
    + '</table>'
    + '<p>Typical recon command: <code>nmap -sV -sC -p- -T4 -oA scan target.example.com</code> — version + script scan, all ports, fast, save outputs in 3 formats (.nmap, .gnmap, .xml).</p>'

    + '<h4>Reading nmap output</h4>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> nmap -sV -sC scanme.nmap.org\n'
    + 'PORT     STATE    SERVICE     VERSION\n'
    + '<span class="hi">22/tcp</span>   open     ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)\n'
    + '<span class="hi">80/tcp</span>   open     http        Apache httpd 2.4.7\n'
    + '<span class="hi">9929/tcp</span> open     nping-echo  Nping echo\n'
    + '<span class="hi">31337/tcp</span> open    tcpwrapped\n'
    + '<span class="out">Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel</span>'
    + '</div>'
    + '<p>What this tells you:</p>'
    + '<ul>'
    +   '<li>SSH 6.6.1 is OLD (2014). Probably has known weak default algorithms.</li>'
    +   '<li>Apache 2.4.7 is also old. Predates many CVEs.</li>'
    +   '<li>Port 31337 ("eleet") wide open — that\'s a tell that this is a deliberately-test box (which it is — scanme.nmap.org is the official safe-to-scan target).</li>'
    +   '<li>Linux kernel detected.</li>'
    + '</ul>'

    + '<h4>"Is this scope OK?"</h4>'
    + '<div class="callout"><div class="label">Public scan-friendly hosts</div>'
    + 'For learning nmap without authorization concerns: <strong>scanme.nmap.org</strong> exists explicitly for testing nmap (read /etc/nmap-policy on it for the rules). Beyond that, scan only your own systems, lab VMs, or boxes you have written permission for. Random IP addresses might be cloud customers, hospitals, schools — you have no way to know from the outside.'
    + '</div>'

    + '<h4>Subdomain enumeration</h4>'
    + '<p>Modern orgs sprawl across hundreds of subdomains. Two complementary approaches:</p>'
    + '<ul>'
    +   '<li><strong>Passive</strong>: crt.sh, Shodan facets, VirusTotal passive DNS, GitHub. No traffic to target.</li>'
    +   '<li><strong>Active brute</strong>: <code>gobuster dns -d example.com -w wordlist.txt</code>, <code>amass enum</code>, <code>subfinder</code>. Sends DNS queries; logged at recursors.</li>'
    + '</ul>'

    + '<h4>Web fingerprinting</h4>'
    + '<p>HTTP headers + cookies + favicon hashes leak the stack:</p>'
    + '<ul>'
    +   '<li><code>Server: nginx/1.18.0</code> — reverse proxy version.</li>'
    +   '<li><code>X-Powered-By: Express</code>, <code>X-Powered-By: PHP/7.4.3</code> — backend hints.</li>'
    +   '<li><code>Set-Cookie: PHPSESSID=…</code> — implies PHP.</li>'
    +   '<li>Favicon hash → "this is WordPress" (and which version) via tools like wappalyzer.</li>'
    + '</ul>'
    + '<p>Defenders: turn off Server-version disclosure. It\'s low-value security-by-obscurity but cheap.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click an nmap port-state result to see what it means and how attackers/defenders read it.</p>';
    var states = [
      { name: 'open',          desc: 'Service is accepting connections. Most actionable result.', defender: 'Make sure it\'s SUPPOSED to be exposed. Internet-facing? Restricted to VPN? Documented?' },
      { name: 'closed',        desc: 'Host responded RST — port is reachable but nothing listens.', defender: 'Confirms host is up and not heavily firewalled. Often safe.' },
      { name: 'filtered',      desc: 'No response at all (or ICMP unreachable). Firewall is dropping.', defender: 'Generally good — your firewall is doing its job.' },
      { name: 'open|filtered', desc: 'Couldn\'t tell apart. Common in UDP scans.', defender: 'Inconclusive. Often appears in heavily firewalled setups.' },
      { name: 'unfiltered',    desc: 'Reachable but state can\'t be determined (specific to ACK scans).', defender: 'Means firewall isn\'t doing stateful filtering for this port.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a state</span>';
    states.forEach(function (s) {
      var b = document.createElement('button'); b.className='chip'; b.textContent = s.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + s.name + '</strong></div>' +
          '<div class="info-line"><span class="key">What it means:</span> <span class="val">' + s.desc + '</span></div>' +
          '<div class="info-line"><span class="key">Defender lens:</span> <span class="val">' + s.defender + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You want to find subdomains of <code>example.com</code> WITHOUT sending any packets to example.com\'s servers (passive only). Which source is the single best starting point?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>nmap -p- example.com</option>' +
          '<option>gobuster dns -d example.com -w wordlist.txt</option>' +
          '<option>crt.sh — Certificate Transparency log search</option>' +
          '<option>nslookup -type=ANY example.com</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'crt.sh — Certificate Transparency log search') return { correct: true, feedback: 'Right. Every TLS certificate issued is published to public CT logs. Querying <code>%.example.com</code> at crt.sh gives you a complete list of subdomains the org has set up TLS for — including ones they may have forgotten about — without sending any packets to example.com infrastructure.' };
        if (v === 'nmap -p- example.com') return { correct: false, feedback: 'nmap is active — it sends packets to the target. The question asked passive.' };
        if (v === 'gobuster dns -d example.com -w wordlist.txt') return { correct: false, feedback: 'gobuster sends DNS queries that resolve against the target zone\'s authoritative server. That\'s active.' };
        if (v === 'nslookup -type=ANY example.com') return { correct: false, feedback: 'Sends a DNS query to authoritative servers — active. Also, ANY queries are now refused by most servers (RFC 8482).' };
        return { correct: false, feedback: 'Pick the source that doesn\'t touch example.com.' };
      },
      hints: [
        'Passive = no packets to the target.',
        'Where do all TLS-cert issuances get logged publicly?',
        'crt.sh — Certificate Transparency.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'An nmap scan returns <code>3306/tcp open mysql MySQL 5.7.33-log</code>. Which of these is the MOST useful next step for a pentester (assume scope authorizes interaction with this MySQL service)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Brute-force the root password with hydra</option>' +
          '<option>Check whether the version has known CVEs in NVD/searchsploit; check whether MySQL is listening on 0.0.0.0 (should be 127.0.0.1 only)</option>' +
          '<option>Run sqlmap against the MySQL port directly</option>' +
          '<option>Try common backdoor accounts</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Check whether the version has known CVEs in NVD/searchsploit; check whether MySQL is listening on 0.0.0.0 (should be 127.0.0.1 only)') return { correct: true, feedback: 'Right. The single most-actionable observation about an exposed MySQL is: it shouldn\'t be exposed. Best practice = bind to 127.0.0.1 and reach it via localhost or via a firewall-restricted private network. The fact that a port scan from the internet sees 3306 open is itself a finding to report. Then version → CVE search informs whether known issues apply. Brute-force or sqlmap-against-DB is far down the list.' };
        if (v === 'Brute-force the root password with hydra') return { correct: false, feedback: 'Hydra against MySQL is loud, slow, and trips DBA monitoring. Even within scope it\'s a poor first step. The exposure itself is a finding.' };
        if (v === 'Run sqlmap against the MySQL port directly') return { correct: false, feedback: 'sqlmap is for SQL injection through web apps, not direct MySQL protocol. Wrong tool.' };
        if (v === 'Try common backdoor accounts') return { correct: false, feedback: 'Worse than hydra — guessing without intel and noisy.' };
        return { correct: false, feedback: 'Re-read the question — what is the SINGLE most useful observation here?' };
      },
      hints: [
        'Why is MySQL on 3306 reachable from the internet at all? That itself might be the finding.',
        'Best practice: bind to localhost or private subnet. Public 3306 is a misconfig.',
        'Report the exposure + version-vs-CVE check.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A scan output: <code>$ nmap -sV -p 80,443 web.example.com</code> shows <code>80/tcp open http nginx 1.18.0</code> but <code>443/tcp closed</code>. Curl confirms HTTP works. The same domain has had a valid Let\'s Encrypt cert for 2 years according to crt.sh. What\'s the most likely explanation?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>The cert was issued but the team forgot to deploy TLS — common.</option>' +
          '<option>A CDN/load-balancer terminates TLS upstream; the origin you scanned is a separate non-TLS host (likely the real backend), reachable directly because of weak DNS/firewall hygiene.</option>' +
          '<option>Let\'s Encrypt logs are unreliable.</option>' +
          '<option>The site is using HTTP/3 which doesn\'t use port 443 TCP.</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'A CDN/load-balancer terminates TLS upstream; the origin you scanned is a separate non-TLS host (likely the real backend), reachable directly because of weak DNS/firewall hygiene.') return { correct: true, feedback: 'Right. A super-common real-world pattern: the public hostname (web.example.com) points to Cloudflare/CloudFront, which serves HTTPS to users using Let\'s Encrypt. But "web.example.com" the DNS A record might still point at the origin server directly (or there\'s a stale/forgotten DNS entry that does). The origin doesn\'t terminate TLS — only HTTP — and the real web app sits behind. This is "origin discovery" and it bypasses the WAF/DDoS protection the CDN provides. Defender fix: restrict origin to only accept connections from the CDN\'s IP ranges; rotate IP after CDN onboarding.' };
        if (v === 'The cert was issued but the team forgot to deploy TLS — common.') return { correct: false, feedback: 'A 2-year history of issuance argues against "they forgot." Plus, where is the cert SERVING from? Probably the CDN.' };
        if (v === 'Let\'s Encrypt logs are unreliable.') return { correct: false, feedback: 'They\'re extremely reliable — that\'s the entire point of Certificate Transparency.' };
        if (v === 'The site is using HTTP/3 which doesn\'t use port 443 TCP.') return { correct: false, feedback: 'HTTP/3 is over UDP/443 (QUIC), but TCP/443 also stays available for HTTP/1.1 + HTTP/2 fallback. Real sites running HTTP/3 still have TCP/443.' };
        return { correct: false, feedback: 'Think CDN architecture. Where is TLS terminated?' };
      },
      hints: [
        'How do most real public sites serve HTTPS today?',
        'CDN/edge terminates TLS; origin is non-TLS HTTP behind the CDN.',
        'You\'ve discovered a directly-reachable origin (or stale DNS). The TLS lives at the CDN, not the origin.'
      ]
    }
  ]
});
