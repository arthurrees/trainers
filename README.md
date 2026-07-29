# Trainers

A family of self-paced, browser-based trainers for technical fundamentals that beginners
usually struggle with. Each one is an independent vanilla HTML/JS app with no build step,
and every trainer follows the same rhythm: **Learn → Play → Try**.

- **Learn** — a short, plain-English explanation of one concept, terms introduced on first use.
- **Play** — an open sandbox with no goal, to build intuition.
- **Try** — three graded puzzles (easy / medium / hard), each with progressive hints.

## Running

No install, no build. Open any trainer's `index.html` in a browser (works over `file://`).

## Trainers

| Folder | Subject | Levels |
|---|---|---|
| `discrete-trainer/` | Discrete math (CSE 260 prep): logic → proofs → sets → counting → probability → grammars → finite-state machines | 15 |
| `networking-trainer/` | Networking: IPv4 → subnetting → layers → ARP → routing → TCP/UDP → DNS → HTTP → TLS → NAT | 13 |
| `ai-trainer/` | AI / ML / deep learning: math foundations → classical ML → neural nets (backprop by hand) → architectures → modern LLMs | 21 |
| `hardware-trainer/` | PC hardware, builder's-eye view: CPU → memory → PCIe → storage → GPU → PSU → cooling → bottlenecks | 14 |
| `ethical-hacking-trainer/` | Offensive security (conceptual + CTF): recon → MITM → crypto pitfalls → auth → SQLi → XSS → privesc → forensics | 14 |
| `os-trainer/` | Operating systems (Linux focus): processes → threads → scheduling → virtual memory → syscalls → sync → deadlock → IPC | 14 |
| `lang-trainer/` | How languages work: lexing → parsing → AST → interpreters → IR → codegen → linking → bytecode VMs & JITs | 14 |
| `embedded-trainer/` | Embedded & electronics: circuits → GPIO → ADC/PWM → sensors → UART/I2C/SPI → ESP32/RPi → MQTT → power → PCBs | 14 |
| `database-trainer/` | Databases: schemas → SELECT/joins → indexes → query planning → transactions → isolation → normalization → tuning | 14 |
| `git-trainer/` | Git internals: object model → three trees → refs → DAG → merge → rebase → reflog → bisect | 14 |
| `regex-trainer/` | Regex on the live JS engine: classes → quantifiers → greedy/lazy → anchors → groups → backrefs → lookaround → ReDoS | 14 |

`binary-trainer/` (binary and bit manipulation) is a working trainer as well, but built on an older
single-file structure (`index.html` + `game.js`) rather than the shared shell the others use, so it's
noted here separately from the table.

## Architecture

Each trainer is fully self-contained ("fork the shell"): its own copy of the small shell files
(`main.js`, `storage.js`, `hints.js`, `styles.css`) plus a topic library. No shared directory,
no bundler, no ES modules. The shell is ~200 lines and stable; the duplication is deliberate so
each trainer can diverge freely. See `CLAUDE.md` for the cross-trainer conventions and
`project_list.md` for the roadmap.
