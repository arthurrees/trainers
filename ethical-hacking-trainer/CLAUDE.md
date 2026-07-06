# Ethical Hacking Trainer

In-depth interactive trainer for ethical hacking / offensive security at the **conceptual + CTF** level. 14 levels, 42 puzzles, covering the kill chain end to end with a strong defensive thread throughout. The user has Kali Linux available for hands-on practice — references to real tools (nmap, Wireshark, Burp Suite, hashcat, John, gobuster, sqlmap, Metasploit, Ghidra, linpeas) are concrete and welcome.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to ethical hacking.

## Topic-specific things

- **Namespace:** `window.EHT` &nbsp; · &nbsp; **Storage key:** `eht_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **The scope line is load-bearing.** Conceptual + CTF + authorized-testing only. NO working exploits, NO recipes against real targets, NO current-CVE shellcode, NO detection-evasion-for-malicious-use. Level 0 has a `<div class="scope-banner">` that anchors this. When you edit content, do not erode the boundary.
- **Defensive framing throughout.** Every offense lesson ends in "and here's the fix" — that's the pedagogy. Output encoding, parameterized queries, FIDO2, ASLR, etc. The user is being trained to build secure systems as much as to think like an attacker.
- **Real Kali tooling references are encouraged** — say `sqlmap -u "..." --dbs`, not "use a SQLi tool." The user can actually run these against PortSwigger Academy / HackTheBox / their own lab.

## Topic-specific library: `EHT.lib.eh`

Pure-function helpers for Play surfaces and puzzle math. ES5-only. Verified by Node smoke test.

| Function | Purpose |
|---|---|
| `crackSeconds(hashName, charset, length)` / `fmtSeconds` | Time-to-crack estimator (MD5, SHA-1/256, NTLM, bcrypt, argon2id × lower / loweralpha / alphanum / ascii). Used in level 4 + level 5. |
| `hashSpeed`, `charsetSize`, `searchSpace` | Sub-functions of the above. |
| `hexToString` / `stringToHex` / `isBase64` / `isHex` / `isUrlEnc` | Encoding helpers, e.g. for level 10 (RE) puzzles. |
| `parsePerm(mode)` | Parse Linux permission strings (`rwsr-xr-x` → octal 4755, SUID flag, etc.). Used in level 11. |
| `vulnerableLogin(user, pwd)` against `DEMO_USERS` | In-memory SQLi sandbox. Recognizes `' OR '1'='1` and `admin'--` patterns, returns `{ ok, user, reason }`. Used in level 6. |
| `makeEcbDemo` / `ecbCellColor` | Tiny ECB-pattern visualizer helpers (level 4, currently unused — easy hook to add a "penguin" canvas). |
| `KILL_CHAIN` | 7-stage Lockheed Martin model with descriptions (level 0). |
| `approxEq` | Tolerance helper. |

The `EHT.lib.canvas` helper is identical to the other trainers (pos / scale / unscale).

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | kill-chain stage explorer + scope banner |
| 1 | CIA Triad &amp; Threat Models | scenario → CIA + STRIDE labels |
| 2 | Reconnaissance | nmap port-state explorer |
| 3 | Network Sniffing &amp; MITM | request-type → what's visible to a sniffer (HTTP vs HTTPS) |
| 4 | Cryptography Pitfalls | live hash crack-time calculator |
| 5 | Authentication &amp; Sessions | credential-stuffing simulator against fake user list |
| 6 | SQL Injection | in-memory vulnerable login form (sandboxed JS, no DB) |
| 7 | Cross-Site Scripting | encoding comparator (raw innerHTML vs textContent) |
| 8 | Broken Access Control | scenario → IDOR/CSRF/SSRF classification |
| 9 | Memory Safety Basics | stack-frame buffer-overflow visualizer |
| 10 | Reverse Engineering 101 | mini CTF binary with `strings` + simulated run |
| 11 | Privilege Escalation (Linux) | simulated `find / -perm -u=s` output with GTFOBins commentary |
| 12 | Forensics &amp; Blue Team | annotated log lines (normal vs suspicious) |
| 13 | Building Secure Systems | feature-level STRIDE threat-model picker |

## Content priorities

- **Real-world numbers anchor abstractions.** "MD5 cracks alphanum-8 in ~36 minutes; bcrypt ~70 years." "70% of CVEs in C/C++ are memory bugs (Microsoft + Google)." "ASLR + DEP + canaries combined raise the cost of exploitation but don't eliminate the class — only memory-safe languages do."
- **Lead with the mistake.** Every web-vuln level shows a one-line vulnerable code snippet alongside the fix. The fix is structural (parameterized queries, output encoding, origin-bound MFA), not whack-a-mole.
- **Defensive value of attack knowledge.** The pedagogy is "if you understand how it breaks, you can build it not to." Don't drift into "here's the cool exploit" mode.
- **Pyramid-of-pain thread.** Levels 0, 12, and the final synthesis all reference it. TTP-level detection > IOC-level. This is the one big idea to make sure students leave with.
- **Hard puzzles combine ideas across levels.** L7.3 (XSS) + L4 (sanitization vs encoding); L8.3 (SSRF deny-list bypasses); L11.3 (RE + privesc); L12.3 (TTP-vs-IOC). Don't water these down.

## Scope-line maintenance

If a future change starts to add specific exploit recipes against real CVEs, real-target instructions, working shellcode, or evasion tutorials for malicious use — that's outside scope. The level-0 scope-banner is the anchor; respect it. CTF-style puzzles (in-memory SQLi sandbox, fake binary, simulated logs) are the right level. Pointers to legitimate practice grounds (HackTheBox, TryHackMe, PortSwigger Academy, picoCTF, OverTheWire) are the right place to send anyone wanting hands-on.

## Sanity-check verifications

```bash
cd trainers/ethical-hacking-trainer
# Library smoke test
node -e "global.window=global; eval(require('fs').readFileSync('js/lib/eh.js','utf8'));
  var eh = global.EHT.lib.eh;
  console.log('alphanum-8 vs MD5:', eh.fmtSeconds(eh.crackSeconds('md5','alphanum',8)));
  console.log('alphanum-8 vs bcrypt:', eh.fmtSeconds(eh.crackSeconds('bcrypt','alphanum',8)));
  console.log('SUID parse rwsr-xr-x:', eh.parsePerm('rwsr-xr-x').octal);
  console.log('SQLi: admin OR 1=1 →', eh.vulnerableLogin(\"admin' OR '1'='1\", 'x').reason);"

# Level integrity (14 × 3 puzzles × 3 hints; every Play mounts)
node -e "/* see hardware-trainer/CLAUDE.md for the full mock; same shape works here */"
```

The 42 puzzles passed answer-key spot-checks before shipping. Most arithmetic-dense:

- L4.3 (length-extension attack rationale)
- L5.3 (JWT alg-confusion)
- L8.3 (SSRF deny-list bypasses — checkbox grid)
- L9.3 (memory-safety statistics — Microsoft/Google ~70%; Android Bionic 76% → 24%)
- L10.2 (XOR/arithmetic flag-decode by hand)
- L11.3 (SUID-binary command injection via system())
