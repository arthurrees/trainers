// Level 3 — Network sniffing & MITM
EHT.registerLevel({
  id: 3,
  title: 'Network Sniffing &amp; MITM',
  whyItMatters: 'Half the security folklore from 1995–2010 was about people sending plaintext passwords over hotel Wi-Fi. HTTPS made most of that noise go away — except when implementation gaps reopen the door. Knowing what HTTPS does and doesn\'t protect lets you reason about which "Wi-Fi pineapple" / VPN claims actually matter.',
  glossary: ['ARP', 'MITM', 'TLS', 'cert pinning'],
  learn: ''
    + '<h4>What sniffing is</h4>'
    + '<p>"Sniffing" = reading packets you can see on a network. On a switched LAN, you only see packets addressed to you (the switch is "smart"). On a Wi-Fi network, devices hear all radio frames in their vicinity — though if WPA2/WPA3 is enabled, frames are encrypted at the link layer with a per-station key, so other clients can\'t decrypt them.</p>'
    + '<p>Tools: <strong>Wireshark</strong> (the industry GUI), <strong>tcpdump</strong> (CLI), <strong>tshark</strong> (Wireshark CLI). Modern Kali ships all three.</p>'

    + '<h4>What HTTPS protects (and what it doesn\'t)</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Visible to a sniffer between client and server</th><th>HTTP (plaintext)</th><th>HTTPS</th></tr>'
    + '<tr><td>The destination IP + port</td><td class="bad">yes</td><td class="bad">yes</td></tr>'
    + '<tr><td>The destination hostname (via SNI)</td><td class="bad">yes</td><td class="bad">yes (until ECH rolls out)</td></tr>'
    + '<tr><td>The URL path (e.g. /admin/login)</td><td class="bad">yes</td><td class="good">no</td></tr>'
    + '<tr><td>HTTP headers (cookies, User-Agent)</td><td class="bad">yes</td><td class="good">no</td></tr>'
    + '<tr><td>POST body (passwords, tokens)</td><td class="bad">yes</td><td class="good">no</td></tr>'
    + '<tr><td>Response body</td><td class="bad">yes</td><td class="good">no</td></tr>'
    + '<tr><td>Approximate size + timing of request/response</td><td class="bad">yes</td><td class="bad">yes (traffic analysis)</td></tr>'
    + '</table>'
    + '<p>So HTTPS encrypts the URL path and body — but the destination hostname (in SNI) and the IP are still visible. A network observer can see "this user is talking to bank.com" but not "to /transfer?to=…&amp;amount=…".</p>'

    + '<h4>How HTTPS authenticates the server</h4>'
    + '<ol>'
    +   '<li>Browser connects, says hello (with the SNI of the hostname it wants).</li>'
    +   '<li>Server presents a certificate signed by a Certificate Authority (CA) the browser trusts.</li>'
    +   '<li>Browser verifies: cert is for THIS hostname, issued by a trusted CA, not expired, not revoked.</li>'
    +   '<li>Asymmetric crypto sets up a session key; symmetric AES-GCM after that.</li>'
    + '</ol>'
    + '<p>If steps 2–3 succeed, an attacker on the network <strong>cannot</strong> read or modify the channel without breaking the server\'s private key or compromising the CA system. That\'s why HTTPS+CT works.</p>'

    + '<h4>How MITM attacks work today</h4>'
    + '<p>Three flavors, in decreasing prevalence:</p>'
    + '<ol>'
    +   '<li><strong>SSL stripping</strong> — user types <code>example.com</code> → browser does plain HTTP first → attacker on the network rewrites links to keep them HTTP. Mitigated by <strong>HSTS</strong> (the server tells the browser "always use HTTPS for me," browser caches the policy).</li>'
    +   '<li><strong>Trust a malicious cert</strong> — corporate proxies / antivirus install their own CA root on the device. Once the CA is trusted, the proxy can intercept any HTTPS. Used legitimately by some enterprise networks; abused by some over-zealous AV products.</li>'
    +   '<li><strong>ARP spoofing on a LAN</strong> — see below. Local-network only.</li>'
    + '</ol>'

    + '<h4>ARP spoofing (the classic LAN attack)</h4>'
    + '<p>Address Resolution Protocol maps IP → MAC on a local network. To send a packet to <code>192.168.1.1</code>, your laptop asks "who has 192.168.1.1?" via broadcast ARP. The router replies "I do, my MAC is aa:bb:cc:dd:ee:ff." Your laptop caches this. Then you send the packet to that MAC.</p>'
    + '<p>The bug: <strong>ARP is unauthenticated</strong>. Anyone on the LAN can claim "I am 192.168.1.1." If they spam ARP replies faster than the real router does, your laptop caches the attacker\'s MAC for 192.168.1.1 — and now your traffic to the gateway goes to them. They forward it to the real gateway and become a transparent MITM at L2.</p>'
    + '<p>BUT: HTTPS still protects you. The attacker sees IPs and hostnames (via SNI) but can\'t read or alter HTTPS traffic. The reason MITM is even relevant in 2026 is the residual non-HTTPS traffic (legacy IoT, MQTT, internal services) and metadata.</p>'
    + '<p>Tools: <code>arpspoof</code>, <code>ettercap</code>, <code>bettercap</code>. Defense: dynamic ARP inspection (DAI) on managed switches; static ARP for critical hosts; IDS rules for "MAC of gateway suddenly changes."</p>'

    + '<h4>Certificate pinning</h4>'
    + '<p>Even with the CA system, a compromised CA could issue a bogus cert for any domain. <strong>Cert pinning</strong> = the client refuses to accept any cert except a specific one (or one signed by a specific intermediate). Banking apps, password managers, and some browsers do this. It defeats CA-compromise MITM at the cost of brittleness (pin rotates → app breaks).</p>'

    + '<h4>Coffee-shop Wi-Fi today</h4>'
    + '<p>The 2008 advice "don\'t bank on hotel Wi-Fi" is mostly obsolete because every site you care about is HTTPS-everywhere with HSTS. What remains:</p>'
    + '<ul>'
    +   '<li>Captive portal phishing — the attacker controls the splash page, can serve a fake one.</li>'
    +   '<li>Old IoT / unencrypted traffic still leaks.</li>'
    +   '<li>Metadata (which sites you visit) is visible.</li>'
    +   '<li>You might trust the wrong cert if you click through a warning. <strong>Don\'t click through cert warnings.</strong></li>'
    + '</ul>'
    + '<p>VPNs swap "trust the coffee shop\'s ISP" for "trust the VPN provider." Useful for geo-shifting and metadata-hiding, but they aren\'t adding to HTTPS\'s end-to-end security.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a request type. See what an on-path attacker can read at each layer.</p>';
    var requests = [
      { name: 'HTTP login form (POST /login)',         http: 'username + password readable in clear', https: 'N/A — request is HTTP, fully exposed' },
      { name: 'HTTPS login form (POST /login)',        http: 'N/A',                                      https: 'destination IP + hostname (SNI) visible; URL path + body encrypted' },
      { name: 'WPA2 Wi-Fi to access point',            http: 'unencrypted L2 frames',                    https: 'L2 encrypted; HTTPS adds another layer over the top' },
      { name: 'DNS query (UDP/53, plain DNS)',         http: 'full hostname visible to anyone on path', https: 'N/A — DNS itself is plain unless DoT/DoH' },
      { name: 'DNS over HTTPS (DoH)',                  http: 'N/A',                                      https: 'looks like normal HTTPS to e.g. cloudflare-dns.com' },
      { name: 'SSH to server',                         http: 'N/A',                                      https: 'connection metadata + first banner visible; everything after handshake encrypted' },
      { name: 'Old IoT MQTT (TCP/1883, no TLS)',       http: 'topics + payloads in plaintext',          https: 'N/A — using non-TLS variant' }
    ];
    var grid = document.createElement('div'); grid.className='chip-row'; grid.style.marginBottom='12px';
    var output = document.createElement('div'); output.className='formula-box';
    output.innerHTML = '<span class="muted">← click a request type</span>';
    requests.forEach(function (r) {
      var b = document.createElement('button'); b.className='chip'; b.textContent = r.name;
      b.style.maxWidth='260px'; b.style.whiteSpace='normal'; b.style.textAlign='left';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + r.name + '</strong></div>' +
          '<div class="info-line"><span class="key">Plain (HTTP / no-TLS):</span> <span class="val">' + r.http + '</span></div>' +
          '<div class="info-line"><span class="key">Encrypted (HTTPS / TLS):</span> <span class="val">' + r.https + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You\'re sniffing a coffee-shop Wi-Fi network. A laptop nearby loads <code>https://nytimes.com/2026/01/15/...</code>. What can you observe from the wire?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Hostname (nytimes.com via SNI), destination IP, approximate size and timing — but not the URL path or content</option>' +
          '<option>Nothing — HTTPS encrypts everything including hostname</option>' +
          '<option>The full URL including the article path</option>' +
          '<option>The user\'s session cookie</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Hostname (nytimes.com via SNI), destination IP, approximate size and timing — but not the URL path or content') return { correct: true, feedback: 'Right. Until Encrypted Client Hello (ECH) rolls out broadly, SNI exposes the hostname even over TLS. The URL path, headers, body, response — all encrypted. Traffic analysis (size + timing) can sometimes infer which page from a hostname, but you don\'t see the path directly.' };
        if (v === 'Nothing — HTTPS encrypts everything including hostname') return { correct: false, feedback: 'SNI is sent in the TLS ClientHello in plaintext, exposing the hostname. ECH (Encrypted Client Hello) fixes this; not yet deployed everywhere.' };
        if (v === 'The full URL including the article path') return { correct: false, feedback: 'The path is part of the encrypted HTTP request — not visible.' };
        if (v === 'The user\'s session cookie') return { correct: false, feedback: 'Cookies are in encrypted headers. Not visible.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'HTTPS encrypts URL paths, headers, and bodies.',
        'But how does the network know which server\'s cert to negotiate? SNI is sent in cleartext.',
        'Hostname, IP, size and timing.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A startup is on a budget. Their dev says "we\'re fine — our app already runs on HTTPS, no extra security work needed before launch." What\'s the most accurate critique?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>HTTPS only ensures encryption between browser and server. They still need authn, authz, input validation, secure storage, secure session cookies, security headers, etc.</option>' +
          '<option>HTTPS is enough — that\'s why everyone uses it</option>' +
          '<option>HTTPS doesn\'t encrypt anything between server and database</option>' +
          '<option>HTTPS is broken in 2026; switch to HTTP/3 with QUIC</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'HTTPS only ensures encryption between browser and server. They still need authn, authz, input validation, secure storage, secure session cookies, security headers, etc.') return { correct: true, feedback: 'Right. HTTPS protects the channel between client and server. Everything else — application security, server-side controls, data-at-rest encryption, secret management — is independent. Most real-world breaches happen INSIDE the application (broken access control, injection, etc.), not on the wire. HTTPS is necessary, not sufficient.' };
        if (v === 'HTTPS is enough — that\'s why everyone uses it') return { correct: false, feedback: 'It\'s a baseline, not a finished story.' };
        if (v === 'HTTPS doesn\'t encrypt anything between server and database') return { correct: false, feedback: 'True (DB connection security is separate), but not the main point — the app needs many more controls than just any kind of encryption.' };
        if (v === 'HTTPS is broken in 2026; switch to HTTP/3 with QUIC') return { correct: false, feedback: 'HTTPS isn\'t broken. HTTP/3 is just HTTP over QUIC, which is itself TLS-based. Same trust model.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'HTTPS solves "channel between browser and server."',
        'It does nothing about authn, authz, injection, broken access control, etc.',
        'Channel encryption is necessary but not sufficient.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re investigating an enterprise where users complain that browser dev tools show "issued by InternalCorp-CA" certs for every HTTPS site they visit, including google.com. The CISO says it\'s "for security." What is happening, what is the security trade-off, and what specifically does it BREAK?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Working as designed — TLS lets each org issue its own root</option>' +
          '<option>The corp installed an internal CA root on every device, runs a TLS-intercepting proxy, and decrypts/re-encrypts all traffic. Trade-off: visibility for incident response/DLP, but breaks E2E confidentiality with banks/health and renders certificate pinning ineffective for in-policy apps</option>' +
          '<option>It\'s a CA compromise — the org should treat as P0 incident</option>' +
          '<option>Browsers do this for performance — caching certs at a proxy is normal</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'The corp installed an internal CA root on every device, runs a TLS-intercepting proxy, and decrypts/re-encrypts all traffic. Trade-off: visibility for incident response/DLP, but breaks E2E confidentiality with banks/health and renders certificate pinning ineffective for in-policy apps') return { correct: true, feedback: 'Right. This is "TLS inspection" / "SSL break-and-inspect" — common at large enterprises. They install their own CA root on managed devices, run a proxy that terminates TLS from the user, decrypts/inspects, then re-encrypts to the real destination using its own cert chain (signed by the internal CA, which is now trusted). Pros: malware C2 detection, DLP. Cons: every TLS connection is read-cleartext by the proxy → bank session, health portal, password manager — all visible to corp infra and anyone who breaches it. Cert pinning works (the app refuses the corp cert) only if explicitly excluded by the proxy. This is policy/governance terrain, not a bug.' };
        if (v === 'Working as designed — TLS lets each org issue its own root') return { correct: false, feedback: 'Each org doesn\'t get to issue certs for "google.com" globally. They forced their cert to be trusted ONLY on their managed devices.' };
        if (v === 'It\'s a CA compromise — the org should treat as P0 incident') return { correct: false, feedback: 'Not a compromise; it\'s an internal cert that\'s only trusted on managed devices. Deliberate setup.' };
        if (v === 'Browsers do this for performance — caching certs at a proxy is normal') return { correct: false, feedback: 'Browsers don\'t do that. Caching wouldn\'t change which CA issued the cert.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Why does the cert chain go up to "InternalCorp-CA" instead of "DigiCert"? What had to be configured?',
        'The internal CA root must be installed as trusted on every device — usually pushed via MDM / GPO.',
        'TLS inspection / SSL break-and-inspect. The proxy decrypts and re-encrypts. Trade-off is privacy for visibility.'
      ]
    }
  ]
});
