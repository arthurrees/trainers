# OS Trainer

In-depth interactive trainer for operating systems (Linux focus). 14 levels, 42 puzzles, covering processes, threads, scheduling, virtual memory, file systems, syscalls, synchronization, deadlock, signals, IPC. The user runs Linux on Kali + a Francis server, so all examples are Linux-flavored with concrete syscall and tool references.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to OS.

## Topic-specific things

- **Namespace:** `window.OST` &nbsp; · &nbsp; **Storage key:** `ost_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Linux-first.** Real syscall names (read/write/fork/clone/futex), real Linux mechanisms (CFS/EEVDF, COW, KPTI, vDSO, io_uring, futex, eventfd). Where Windows differs significantly (Windows scheduler, Windows-style IPC) we note briefly. macOS is barely mentioned.
- **Bridges hardware-trainer and ethical-hacking-trainer.** L11 of eth-hacking covered SUID/Linux privesc — this trainer's L8 (file systems) and L9 (syscalls) are the layer underneath. Don't repeat eth-hacking content; reference it.
- **Concrete numbers.** Syscall ~100–500 ns. Context switch ~1–10 µs. TLB miss ~20+ ns. Major page fault ~ms. The user thinks in numbers; the trainer should too.

## Topic-specific library: `OST.lib.os`

Pure-function helpers for Play surfaces and puzzle math. ES5-only. Verified by Node smoke test.

| Function | Purpose |
|---|---|
| `fcfs(jobs)` / `sjfNonPreemptive(jobs)` / `roundRobin(jobs, q)` | Compute Gantt + per-job stats (completion / turnaround / wait) for the canonical scheduling algorithms. Used in L3. |
| `avgWait(stats)` | Average wait time across jobs. |
| `translate(vaddr, pageSize, pageTable)` | Virtual → physical address translation, returning fault info. Used in L5. |
| `effectiveAccessTime(hitRate, tlbTime, memTime)` | TLB-aware EAT formula. Used in L6. |
| `workingSet(refs, windowSize)` | Distinct pages in last N references. |
| `parsePerm(mode)` | Linux permission parser, mirrors `EHT.lib.eh.parsePerm`. Used in L8. |
| `SIGNALS` | Signal table (number, default action, catchable, description). Used in L12. |
| `fmtAddr` / `approxEq` | Helpers. |

The `OST.lib.canvas` helper is identical to other trainers (pos / scale / unscale).

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | abstraction → cost explorer |
| 1 | Processes — Fork, Exec, Wait | live process-tree simulator with fork / exit / wait / orphan reparenting |
| 2 | Threads vs Processes | property-by-property shared/not-shared table |
| 3 | CPU Scheduling | live Gantt chart for FCFS / SJF / RR(2) / RR(4) on the same job set |
| 4 | Context Switches | live cost calculator (CS/sec × cost/sec → % CPU) |
| 5 | Virtual Memory | virtual-address translator with present/swapped/invalid pages |
| 6 | Page Faults &amp; Demand Paging | TLB-aware effective access time calculator |
| 7 | Memory Allocation | live heap fragmentation visualizer (alloc/free buttons) |
| 8 | File Systems — Inodes, Links, FDs | dentry/inode table with hard/soft link operations |
| 9 | System Calls | operation → kind/cost catalog |
| 10 | Synchronization Primitives | counter race simulator (with vs without lock) |
| 11 | Deadlock | AB-BA deadlock detector based on lock-acquisition order |
| 12 | Signals | signal explorer with default action + catchability |
| 13 | IPC | scenario → mechanism picker |

## Content priorities

- **Lead with the cost.** Every abstraction (process, syscall, lock, signal) gets a real number for what it costs in time. Memorable numbers anchor abstract concepts.
- **Bridge to the user's actual experience.** "Why is my Python program slow?" "Why is my container shutting down via SIGKILL?" "Why does df show different from du?" These come up in L7, L12, L8 respectively.
- **Defensive depth on classic gotchas:** L1 zombies, L8 deleted-but-open, L10 cond_wait-needs-while, L12 PID-1 signal handling, L7 fragmentation. These are the "I shipped this bug" moments OS class never quite drills.
- **Hard puzzles combine across levels.** L1.3 (3 forks → 8), L2.3 (fork in multi-threaded → mutex deadlock), L4.3 (Go vs thread-per-request structural advantages), L5.3 (COW write-set), L7.3 (allocator swap via LD_PRELOAD), L8.3 (shared-fd-after-fork seek position), L9.3 (io_uring batching), L11.3 (3-cycle deadlock), L12.3 (printf-not-async-safe handler deadlock).

## Sanity-check verifications

```bash
cd trainers/os-trainer
# Library smoke test
node -e "global.window=global; eval(require('fs').readFileSync('js/lib/os.js','utf8'));
  var os = global.OST.lib.os;
  // Scheduling
  var r = os.fcfs([{id:'A',arrival:0,burst:5},{id:'B',arrival:1,burst:3},{id:'C',arrival:2,burst:8}]);
  console.log('FCFS avg wait:', os.avgWait(r.stats), '(expect 3.33)');
  r = os.roundRobin([{id:'A',arrival:0,burst:5},{id:'B',arrival:1,burst:3},{id:'C',arrival:2,burst:8}], 2);
  console.log('RR q=2 avg wait:', os.avgWait(r.stats), '(expect 6)');
  // VM
  console.log('translate 0x1234 page=4096 frame=5:', JSON.stringify(os.translate(0x1234, 0x1000, [{frame:5,present:true}])));
  // EAT
  console.log('EAT 95% hit:', os.effectiveAccessTime(0.95, 1, 100), 'ns');"
# Level integrity
# (See parent CLAUDE.md for the full mock; same shape works here.)
```

The 42 puzzles passed answer-key spot-checks before shipping. Math-dense ones to redo if you touch them:

- L1.3 (8 processes after 3 forks)
- L3.3 (SJF avg wait = 8/3 ≈ 2.67)
- L4.3 (16 cores, 500K CS/s × 5 µs ≈ 15.6%)
- L5.3 (write-set determines COW cost)
- L6.3 (mmap big file: virtual ≠ committed RAM)
- L8.3 (shared-fd-after-fork: 4 distinct bytes, any order)
- L11.3 (3-cycle deadlock)
