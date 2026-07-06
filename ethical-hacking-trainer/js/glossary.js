// glossary.js — shared glossary, rendered in sidebar
window.EHT = window.EHT || {};

EHT.glossary = {
  // Foundations
  'pentest':       { name: 'penetration test', def: 'Authorized simulated attack on a system to find vulnerabilities before real attackers do. Must be in scope and contracted.' },
  'red team':      { name: 'red team', def: 'Offensive security team simulating adversaries. Goes beyond a pentest — tries to evade detection and reach defined objectives.' },
  'blue team':     { name: 'blue team', def: 'Defenders. Build/run detection, response, hardening. Most jobs in security are blue.' },
  'purple team':   { name: 'purple team', def: 'Red + blue working together to improve detections in real time.' },
  'CTF':           { name: 'capture the flag', def: 'Educational hacking competitions. Solve challenges to retrieve "flags" — strings like flag{...} hidden in the puzzle. Safe legal practice.' },
  'OSINT':         { name: 'open-source intelligence', def: 'Information gathered from public sources — search engines, certificate transparency logs, GitHub leaks, social media.' },
  'kill chain':    { name: 'cyber kill chain', def: 'Lockheed Martin\'s 7-stage model: Recon → Weaponize → Deliver → Exploit → Install → C2 → Actions on Objectives.' },
  'TTPs':          { name: 'tactics, techniques, procedures', def: 'How an adversary operates at three granularities. Tactics = goals; techniques = how (e.g. T1059 Command-Line Interpreter); procedures = specific tool invocations.' },
  'IOC':           { name: 'indicator of compromise', def: 'Forensic artifact suggesting a breach: a file hash, an IP, a domain, a registry key. Hashes/IPs are easy for attackers to change; behaviors are not (see "pyramid of pain").' },

  // CIA
  'CIA':           { name: 'CIA triad', def: 'Confidentiality / Integrity / Availability. The three properties security tries to preserve.' },
  'AAA':           { name: 'AAA', def: 'Authentication (who you are) / Authorization (what you can do) / Auditing (what you did).' },

  // Recon
  'nmap':          { name: 'nmap', def: 'The standard port scanner. -sV detects service versions; -sC runs default scripts; -A is "aggressive" (everything).' },
  'banner grab':   { name: 'banner grabbing', def: 'Connecting to a service and reading the version string it volunteers (SSH-2.0-OpenSSH_8.9p1...).' },
  'dorking':       { name: 'Google dorking', def: 'Using advanced search operators (site:, filetype:, intitle:) to find leaked / accidentally exposed content.' },
  'ct logs':       { name: 'certificate transparency', def: 'Public logs of every TLS certificate issued. Querying by domain reveals subdomains an org has set up. Useful (and often forgotten) recon source.' },

  // Network
  'ARP':           { name: 'Address Resolution Protocol', def: 'Maps IP addresses to MAC addresses on a LAN. Trust-by-default — ARP spoofing redirects local traffic by sending forged replies.' },
  'MITM':          { name: 'man-in-the-middle', def: 'Attacker positions between two parties, reading or altering messages. HTTPS + cert pinning makes this much harder.' },
  'TLS':           { name: 'Transport Layer Security', def: 'The "S" in HTTPS. Authenticates the server (via certificates) and encrypts the channel.' },
  'cert pinning':  { name: 'certificate pinning', def: 'A client refuses to trust ANY cert except a specific known one (or one signed by a specific CA). Stops MITM even with a CA-issued bogus cert.' },

  // Crypto
  'hash':          { name: 'cryptographic hash', def: 'One-way function. Same input → same output; tiny input change → totally different output. Examples: MD5 (broken), SHA-256, bcrypt.' },
  'salt':          { name: 'salt', def: 'Random value mixed with each password before hashing. Defeats rainbow tables: each user\'s hash is unique even for identical passwords.' },
  'pepper':        { name: 'pepper', def: 'A SECRET salt-like value stored separately from the database (often in HSM/key vault). Even DB exfil + salts doesn\'t crack alone.' },
  'bcrypt':        { name: 'bcrypt', def: 'Password hashing function tunable to be intentionally slow. Cost factor 12+ in 2026 = ~50 K hashes/sec on a high-end GPU.' },
  'argon2':        { name: 'argon2id', def: 'Modern password hash, winner of the 2015 Password Hashing Competition. Memory-hard — even GPUs can\'t parallelize cheaply.' },
  'ECB':           { name: 'ECB mode', def: 'Electronic Codebook — encrypt each plaintext block independently. Identical plaintext blocks → identical ciphertext blocks. Famously broken; the "Linux penguin" demo.' },
  'CBC':           { name: 'CBC mode', def: 'Cipher Block Chaining. Each block XORed with previous ciphertext. Hides patterns but vulnerable to padding-oracle attacks.' },
  'GCM':           { name: 'GCM mode', def: 'Galois/Counter Mode — authenticated encryption. The default modern AES mode. Don\'t reuse nonces.' },

  // Auth
  'MFA':           { name: 'multi-factor authentication', def: 'Two or more of: something you know (password), have (TOTP, hardware key), are (biometric).' },
  'TOTP':          { name: 'time-based OTP', def: 'Google Authenticator-style 6-digit codes. Shared secret + current time → code that rotates every 30 s.' },
  'WebAuthn':      { name: 'WebAuthn / FIDO2', def: 'Public-key MFA. Browser holds a private key; site verifies signatures. Resists phishing because the origin is part of the signed challenge.' },
  'SSO':           { name: 'single sign-on', def: 'One login session grants access to many apps via a federated identity provider (Okta, Azure AD, Google).' },
  'OAuth2':        { name: 'OAuth 2.0', def: 'Delegated authorization — "let app X act on my behalf at service Y" without sharing credentials.' },
  'JWT':           { name: 'JSON Web Token', def: 'Self-contained signed token used for sessions / API auth. Header.Payload.Signature, base64url-encoded.' },
  'cred stuffing': { name: 'credential stuffing', def: 'Trying leaked username:password pairs from one breach against unrelated sites. Works because of password reuse.' },

  // Web vulns
  'SQLi':          { name: 'SQL injection', def: 'User input concatenated into a SQL query, allowing the user to break out and inject arbitrary SQL. Fix: parameterized queries.' },
  'XSS':           { name: 'cross-site scripting', def: 'Attacker injects JavaScript that runs in another user\'s browser session. Reflected / Stored / DOM-based.' },
  'CSRF':          { name: 'cross-site request forgery', def: 'Tricks a logged-in user\'s browser into making a state-changing request. Fix: anti-CSRF tokens or SameSite cookies.' },
  'SSRF':          { name: 'server-side request forgery', def: 'Attacker makes the server fetch a URL of their choice. Pivot to internal-only services (cloud metadata endpoints, internal admin panels).' },
  'IDOR':          { name: 'insecure direct object reference', def: 'Object IDs in URLs/parameters with no access check (/orders/12345 — change ID, see someone else\'s order).' },
  'RCE':           { name: 'remote code execution', def: 'Bug that lets the attacker run arbitrary code on the server. Crown jewel of web bugs.' },
  'CSP':           { name: 'Content-Security-Policy', def: 'HTTP header that restricts which scripts/styles a page can load. Killing inline scripts breaks most XSS.' },
  'OWASP':         { name: 'OWASP', def: 'Open Web Application Security Project. Maintains the Top 10 web risks list, used as a reference everywhere.' },

  // Memory safety
  'BoF':           { name: 'buffer overflow', def: 'Writing past the end of a fixed-size buffer corrupts adjacent memory — return addresses, function pointers, etc. Stack and heap variants.' },
  'ASLR':          { name: 'address space layout randomization', def: 'OS randomizes where libraries / stack / heap live each run. Breaks "jump to address 0xdeadbeef" exploits — attacker doesn\'t know what\'s there.' },
  'DEP':           { name: 'data execution prevention / NX', def: 'Hardware-enforced "this memory page is not executable." Stops "write shellcode to stack, then return into it."' },
  'canary':        { name: 'stack canary', def: 'Random value placed before saved return address. Function checks it before returning; mismatch = abort. Detects stack-based BoFs.' },

  // RE / forensics
  'strings':       { name: 'strings (utility)', def: 'Linux tool that prints all printable ASCII/Unicode runs in a binary. Often the fastest way to find hardcoded URLs, flags, or paths.' },
  'objdump':       { name: 'objdump / disassembly', def: 'Turns machine code back into assembly. The first lens after strings.' },
  'Ghidra':        { name: 'Ghidra', def: 'NSA\'s open-source reverse-engineering toolkit. Decompiles to C-ish pseudocode.' },
  'YARA':          { name: 'YARA', def: 'Pattern-matching language for malware. Defines rules ("contains these strings AND this byte sequence") that match families.' },
  'SIEM':          { name: 'SIEM', def: 'Security Information and Event Management. Centralized log collection + alerting (Splunk, Elastic, Sentinel).' },
  'EDR':           { name: 'EDR', def: 'Endpoint Detection and Response — agents on hosts that monitor processes, syscalls, network. CrowdStrike, SentinelOne, Defender for Endpoint.' },

  // Linux privesc
  'SUID':          { name: 'SUID bit', def: 'Filesystem flag making a binary run as its OWNER, not the invoker. /usr/bin/passwd is SUID root because it edits /etc/shadow. Misconfigured SUID = privesc.' },
  'sudo':          { name: 'sudo', def: 'Run a command as another user (default: root). /etc/sudoers controls who can do what — gotchas there are a top privesc class.' },
  'capabilities':  { name: 'capabilities', def: 'Linux fine-grained alternative to all-or-nothing root. Granting CAP_SYS_PTRACE without thinking lets the holder ptrace any process.' },
  'PATH hijack':   { name: 'PATH hijack', def: 'If a privileged script calls a command without full path AND a directory you control is earlier in $PATH, you can replace the command.' },

  // Defense
  'least priv':    { name: 'principle of least privilege', def: 'Each user/service/process gets only the permissions it needs. No more.' },
  'defense-in-depth': { name: 'defense in depth', def: 'Multiple independent layers, so failure of any one doesn\'t expose everything.' },
  'zero trust':    { name: 'zero trust', def: 'Don\'t trust anything based on network position. Every request is authenticated and authorized fresh.' },
  'threat model':  { name: 'threat model', def: 'A structured analysis: what assets, what trust boundaries, who the adversaries are, what they can do, and what mitigations exist. STRIDE is one common framework.' },
  'STRIDE':        { name: 'STRIDE', def: 'Microsoft threat-modeling acronym: Spoofing / Tampering / Repudiation / Information disclosure / Denial of service / Elevation of privilege.' }
};

EHT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = EHT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
EHT.escapeHtml = escapeHtml;
