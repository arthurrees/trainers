# Trainers â€” Project List

A growing collection of self-paced, browser-based trainers for technical fundamentals that beginners typically struggle with. Each trainer is its own folder, vanilla HTML/JS, no build step (opens via `file://`), follows the **Learn â†’ Play â†’ Try** rhythm pioneered in `discrete-trainer/`.

## Status legend
- âœ… shipped â€” usable end-to-end
- ðŸ› ï¸ in progress â€” scaffolding or content underway
- ðŸ§Š planned â€” on the roadmap, not started

## Existing trainers

| Status | Folder | Subject | Notes |
|---|---|---|---|
| âœ… | `discrete-trainer/` | Discrete math (CSE 260 prep) | 11 levels, propositional logic â†’ graphs â†’ boolean algebra |
| âœ… | `networking-trainer/` | Computer networking | 13 levels, 39 puzzles. Orientation â†’ IPv4 â†’ subnetting â†’ layers â†’ ARP â†’ switches/routers â†’ routing â†’ TCP handshake â†’ TCP/UDP â†’ DNS â†’ HTTP â†’ TLS â†’ NAT |
| âœ… | `ai-trainer/` | AI / ML / deep learning (in-depth) | 21 levels, 63 puzzles. Math foundations â†’ classical ML â†’ neural nets (incl. backprop by hand) â†’ architectures â†’ modern LLMs (tokenization, attention, training, sampling, quantization, RAG/agents) plus a plain-English wrap-up |
| âœ… | `hardware-trainer/` | PC hardware (in-depth, builder's-eye view) | 14 levels, 42 puzzles. CPU â†’ memory â†’ PCIe â†’ storage â†’ GPU â†’ PSU â†’ motherboard/chipset â†’ cooling â†’ display â†’ USB â†’ networking â†’ bottlenecks â†’ diagnostics |
| âœ… | `ethical-hacking-trainer/` | Ethical hacking / offensive security (conceptual + CTF) | 14 levels, 42 puzzles. Orientation/scope â†’ CIA+STRIDE â†’ recon â†’ MITM â†’ crypto pitfalls â†’ auth â†’ SQLi â†’ XSS â†’ broken access control â†’ memory safety â†’ RE â†’ privesc â†’ forensics â†’ secure systems |
| âœ… | `os-trainer/` | Operating systems (Linux focus) | 14 levels, 42 puzzles. Orientation â†’ processes â†’ threads â†’ scheduling â†’ context switches â†’ virtual memory â†’ page faults â†’ memory allocation â†’ file systems â†’ syscalls â†’ sync primitives â†’ deadlock â†’ signals â†’ IPC |
| âœ… | `lang-trainer/` | How programming languages work (compilers, interpreters, runtimes) | 14 levels, 42 puzzles. Orientation â†’ syntax/semantics â†’ lexing â†’ parsing â†’ AST â†’ semantic analysis â†’ tree-walking interpreter â†’ IR â†’ optimization â†’ codegen â†’ assemblyâ†’machine code â†’ linking/loading â†’ runtime systems â†’ bytecode VMs & JITs |
| âœ… | `embedded-trainer/` | Embedded systems & electronics (RPi, ESP32, sensors, protocols) | 14 levels, 42 puzzles. Orientation â†’ electricity â†’ circuits â†’ GPIO â†’ ADC/PWM â†’ sensors â†’ actuators â†’ UART/I2C/SPI â†’ ESP32 deep dive â†’ RPi deep dive â†’ wireless/MQTT â†’ power/batteries â†’ breadboards/PCBs â†’ project patterns |
| ✅ | `database-trainer/` | Database systems | 14 levels, 42 puzzles. Orientation → schemas/constraints → SELECT/WHERE → joins → indexes → query planning → transactions → isolation → locks/MVCC → normalization → aggregation/windows → storage/WAL → replication/backups → performance tuning |
| ✅ | `git-trainer/` | Git internals & workflows | 14 levels, 42 puzzles. Orientation → object model (blobs/trees/commits) → three trees → refs/HEAD → commits/DAG → merging → rebase → detached HEAD → remote refs → reflog → cherry-pick → .gitignore → stash → advanced ops (bisect, worktrees, pack files) |
| ✅ | `regex-trainer/` | Regular expressions (live JS engine) | 14 levels, 42 puzzles. Orientation → literals/escaping → dot/classes → shorthand (`\d\w\s`) → quantifiers → greedy vs lazy → anchors/boundaries → groups/capturing → alternation → backreferences → lookaround → flags → replace → ReDoS/catastrophic backtracking. RXT namespace. Every Play and Try runs the browser's native regex engine, so every pattern is real and runnable. |

## Roadmap â€” strong candidates

These topics fit the format well: visual, rule-based, beginner-hostile, with plenty of "play" surface that doesn't generalize across topics.

### Computer networking â€” `networking-trainer/` âœ… shipped
Levels 0â€“12 cover: orientation, IPv4 addressing & subnet masks, subnetting, OSI/TCP-IP layers, Ethernet/MAC/ARP, switches vs routers, IP routing & longest-prefix match, TCP handshake & teardown, TCP vs UDP, DNS resolution, HTTP & status codes, TLS handshake, NAT & port translation. Future additions could include traceroute/ping mechanics, IPv6 deep dive, BGP, QUIC, mobile/Wi-Fi specifics.

### Operating systems â€” `os-trainer/` âœ… shipped
14 levels covering: orientation, processes (fork/exec/wait, zombies/orphans), threads vs processes (the shared/not-shared table, fork+threads gotchas), CPU scheduling (FCFS/SJF/RR with live Gantt), context switches, virtual memory (translation, multi-level paging), page faults & TLB & demand paging, memory allocation (brk vs mmap, fragmentation, allocator choice), file systems (inodes, dentries, hard/soft links, fd table), syscalls (vDSO, strace, io_uring), synchronization primitives, deadlock (Coffman, dining philosophers, lock ordering), signals (default actions, async-signal-safety, PID 1), IPC (pipes, sockets, shared memory, signals).

### PC hardware (in-depth, builder's-eye view) â€” `hardware-trainer/` âœ… shipped
The complement to `arch-trainer/` (which is the CS-class view: binary, two's complement, IEEE 754, caching, pipelining). This one is the builder's-eye view of a real PC: what each component does, how they're balanced, and how the numbers on the spec sheet translate into observable behavior. Levels: CPU anatomy (cores/IPC/cache/CCDs), memory (DDR generations, channels, CAS, XMP), PCIe (lanes, generations, bandwidth math, bifurcation), storage (NVMe vs SATA vs HDD, M.2 lane sharing), GPU (VRAM, memory bandwidth, power connectors), PSU budgeting (transient spikes, efficiency ratings), motherboards & chipsets (VRM phases, B550 vs X570), cooling & thermals, display pipeline (DP vs HDMI versions, refresh Ã— resolution bandwidth), USB & peripherals, networking hardware, bottleneck analysis, and a building/diagnostics level.

### Computer architecture / low-level â€” `arch-trainer/`
- Binary & hex (convert by hand, then with intuition)
- Two's complement â€” why negation works the way it does
- Floating point (IEEE 754) â€” why `0.1 + 0.2 â‰  0.3`
- Bitwise ops & masks
- Endianness
- Memory hierarchy & caching (locality, why a 2D loop order matters)
- Pipelining & hazards
- Branch prediction at a conceptual level
- Assembly basics (a tiny RISC subset is enough)

### Git â€” `git-trainer/`
- The object model: blobs, trees, commits, refs
- The three trees: working dir, index, HEAD
- Merge vs rebase â€” what each actually rewrites
- Reflog as a safety net
- Detached HEAD â€” what it means, how to recover
- Cherry-pick & interactive rebase mechanics
- Remote tracking refs, fast-forward vs non-fast-forward push
- `.gitignore` quirks, untracked vs ignored

### Regex â€” `regex-trainer/` âœ… shipped
14 levels, 42 puzzles, RXT namespace. Built on the native JS regex engine so every Play and Try
surface runs the user's pattern for real, with live match highlighting and a capture-group readout.
Covers everything below plus a final ReDoS / catastrophic-backtracking level with a step-count
visualizer.
- Literal characters, escape rules
- Character classes & negation
- Quantifiers (greedy vs lazy)
- Anchors (`^`, `$`, `\b`)
- Groups, captures, backreferences
- Alternation
- Lookahead / lookbehind
- Flavors & gotchas (POSIX vs PCRE vs JS vs Python)

### Concurrency â€” `concurrency-trainer/`
- Race conditions you can see (animate two threads incrementing a counter)
- Mutexes, semaphores, condition variables, monitors
- Deadlock & the four conditions
- Producer / consumer
- Async / await mental model
- Memory ordering at a beginner level

### Cryptography fundamentals â€” `crypto-trainer/`
- Symmetric vs asymmetric â€” what each is good for
- Hash functions: collision resistance, why we don't use MD5
- HMAC vs signature
- Public-key intuition (RSA, then ECC at a high level)
- TLS handshake walk-through
- Password storage: bcrypt / argon2, salts, peppers
- What "ciphertext indistinguishability" means without math

## Other candidates (lower priority)
- Big-O / complexity analysis
- HTTP & REST API design
- Linux command line & shells
- Docker & containers (namespaces, cgroups, images vs containers)
- Memory layout in C (stack vs heap, pointers, common UB)

## Conventions for new trainers

When starting a new trainer, copy the discrete-trainer shell and rename the global / storage key:
- `window.DMT` â†’ `window.NT` (networking), `window.OST`, `window.SQT`, etc.
- `dmt_state_v1` â†’ `nt_state_v1`, etc.
- Keep the script-tag pattern. No bundler, no ES modules, no external fonts/images.
- Every level: 1 Learn section, 1 Play sandbox (no goal), 3 graded puzzles (easy/medium/hard) with 3 progressive hints each.
- Beginner-first writing. Introduce every term and acronym on first use.
- Each trainer gets its own `CLAUDE.md` with topic-specific notes.
