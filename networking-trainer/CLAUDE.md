# Networking Trainer

Self-paced web app covering computer networking from zero — IPv4 addressing through NAT and TLS. 13 levels, 39 puzzles.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, canvas patterns, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to networking.

## Topic-specific things

- **Namespace:** `window.NT` &nbsp; · &nbsp; **Storage key:** `nt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Tone:** blunt and concrete. Networking is full of jargon — every acronym (DNS, ARP, NAT, MTU) gets defined on first use. Real-world details (why DNS uses UDP, why your home server needs port forwarding) earn their place.

## Topic-specific libraries

- **`NT.lib.ip`** — IPv4 math used by levels 1, 2, 6.
  - Parsing: `parseIPv4(s)` → `[a,b,c,d]` or `null`
  - Conversion: `ipToInt`, `intToIp`, `ipToString`, `octetToBinary`, `ipToBinary`
  - Masks: `maskFromPrefix(n)` → 32-bit int, `maskOctetsFromPrefix(n)` → octet array, `prefixFromMask(maskInt)`
  - Subnet math: `networkInt(ipInt, prefix)`, `broadcastInt(ipInt, prefix)`, `blockSize(prefix)`, `usableHosts(prefix)`
  - Classification: `ipClass(octets)` (A/B/C/D/E), `isPrivate(octets)` (RFC1918), `isValidMask(maskInt)`
  - **All operations are 32-bit unsigned.** The lib special-cases `prefix === 0` because `0xFFFFFFFF << 32` collapses to a no-op in JS — be careful preserving this if you extend it. Verified by 24-case Node smoke test.

## The 13 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | term click-card |
| 1 | IPv4 Addresses & Subnet Masks | live binary visualizer with octet + CIDR sliders |
| 2 | Subnetting Practice | "borrow N bits" calculator listing every resulting subnet |
| 3 | OSI & TCP/IP Layers | clickable protocol → layer reference |
| 4 | Ethernet, MAC & ARP | **canvas topology** with animated ARP request/reply arrows |
| 5 | Switches vs Routers | MAC-table learning demo (text log) |
| 6 | IP Routing & Longest-Prefix | live routing-table lookup with winner highlighted |
| 7 | TCP Handshake & Teardown | **canvas ladder/sequence diagram** — Client/Server lifelines, color-coded arrows by flag |
| 8 | TCP vs UDP | application → protocol picker |
| 9 | DNS Resolution | **canvas hierarchy tree** — root → TLD → authoritative, current node highlighted |
| 10 | HTTP & Status Codes | **categorized grid** of status codes (color-coded by 1xx–5xx) |
| 11 | TLS Handshake | **canvas ladder diagram** with encrypted region visually shaded |
| 12 | NAT & Port Translation | live connection-tracking-table demo |

## Networking-content priorities

- **Concrete IPs and MACs in worked examples**, not `xxx.yyy.zzz.www`. Use `192.168.1.x`, `aa:bb:cc:11:22:33`, etc. — readers should be able to type the example into their terminal and follow along.
- **Real-world tie-ins**: every level should connect to something the user has actually seen ("this is why your router has a setup page at 192.168.1.1", "this is why DNS hasn't propagated yet", "this is why port 443").
- **Don't sanitize the messy edges**: ARP is L2.5, TLS is L5/6 in OSI but Application in TCP/IP, HTTP/3 broke the rule that web is TCP. Naming the messiness teaches better than ignoring it.
- The hard puzzles often require combining facts (off-LAN dest MAC = gateway, /22 contains 4 third-octet values, longest-prefix beats default route). Resist making them just "easy + bigger numbers".

## Sanity-check math

Subnetting (level 1, 2, 6 puzzles) was verified case-by-case via Node before shipping. If you change `NT.lib.ip` add to that test.
