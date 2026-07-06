// glossary.js — shared glossary, rendered in sidebar
window.OST = window.OST || {};

OST.glossary = {
  // Foundations
  'OS':         { name: 'operating system', def: 'Software that mediates between user programs and hardware. Provides abstractions (processes, files, sockets), shares resources fairly, and isolates programs from each other.' },
  'kernel':     { name: 'kernel', def: 'The privileged core of an OS. Runs in CPU "ring 0" / kernel mode. Manages memory, schedules processes, handles interrupts, mediates I/O.' },
  'userspace':  { name: 'userspace', def: 'Where ordinary programs run, in CPU "ring 3" / user mode. Cannot directly touch hardware; must invoke the kernel via syscalls.' },
  'syscall':    { name: 'system call', def: 'The mechanism a userspace program uses to request a kernel service: read, write, fork, mmap, etc. Crosses the user/kernel boundary; expensive (~hundreds of ns).' },
  'POSIX':      { name: 'POSIX', def: 'Portable Operating System Interface — the standard set of Unix-style APIs. Linux, macOS, BSDs all implement it. Windows has a subsystem (WSL, originally POSIX Subsystem).' },

  // Processes / threads
  'process':    { name: 'process', def: 'A running program with its own address space, file descriptors, signal handlers, etc. Identified by a PID.' },
  'PID':        { name: 'process ID', def: 'Unique integer identifying a process. PID 1 is init (or systemd) — the parent of all orphaned processes.' },
  'PPID':       { name: 'parent PID', def: 'PID of the process that created this one (via fork). Process tree is built from PPID links.' },
  'fork':       { name: 'fork', def: 'Create a new process by cloning the calling one. Returns 0 in the child, child\'s PID in the parent. Modern Linux uses copy-on-write to avoid copying memory eagerly.' },
  'exec':       { name: 'exec', def: 'Replace the current process\'s executable image with a new one. Same PID, totally new program. fork+exec is how shells spawn commands.' },
  'wait':       { name: 'wait', def: 'Parent reaps a child\'s exit status. If the parent never waits, the child becomes a zombie until reaped or the parent exits.' },
  'zombie':     { name: 'zombie process', def: 'A child that has exited but whose status the parent hasn\'t collected via wait(). Holds onto the PID slot.' },
  'orphan':     { name: 'orphan process', def: 'A process whose parent has died. Adopted by PID 1 (init / systemd), which immediately wait()s it if it exits.' },
  'thread':     { name: 'thread', def: 'A line of execution within a process. Threads share the address space, file descriptors, signal handlers; have their own stack and registers.' },
  'TLS':        { name: 'thread-local storage', def: 'Per-thread global variables. Each thread gets its own copy. Implemented via a thread-local pointer in glibc (FS register on x86_64).' },

  // Scheduling
  'scheduler':  { name: 'CPU scheduler', def: 'Kernel component that decides which runnable process/thread runs on each CPU at each moment.' },
  'FCFS':       { name: 'first come, first served', def: 'Scheduling algorithm: jobs run in arrival order. Simple. Bad for short-after-long jobs (convoy effect).' },
  'SJF':        { name: 'shortest job first', def: 'Pick the job with the smallest CPU burst next. Provably optimal for average wait time IF you know burst lengths in advance (you don\'t).' },
  'RR':         { name: 'round robin', def: 'Each ready job gets a fixed time slice (quantum), then goes to the back of the queue. Fair; quantum size trades latency vs context-switch overhead.' },
  'MLFQ':       { name: 'multi-level feedback queue', def: 'Multiple queues at different priorities. New jobs start at top; ones that use full quanta drop down. Approximates SJF without knowing burst lengths.' },
  'CFS':        { name: 'Completely Fair Scheduler', def: 'Linux\'s default scheduler (2007–2023). Tracks "vruntime" per task, picks lowest. Replaced by EEVDF in Linux 6.6 (October 2023).' },
  'preemption': { name: 'preemption', def: 'Interrupting a running task to switch to another. Modern OSes preempt on timer interrupts; "voluntary" yield happens at syscalls.' },
  'context switch': { name: 'context switch', def: 'Saving the running task\'s registers/PC/state and loading another\'s. Costs ~1–10 µs plus secondary cache/TLB pollution.' },

  // Memory
  'virtual memory': { name: 'virtual memory', def: 'Each process sees a private linear address space (e.g. 0..2⁴⁸ on x86_64). The OS+MMU translate to physical RAM at runtime.' },
  'MMU':        { name: 'memory management unit', def: 'Hardware unit that does virtual→physical translation on every memory access using page tables.' },
  'page':       { name: 'page', def: 'Fixed-size unit of virtual memory (4 KB on x86_64; sometimes 2 MB or 1 GB "huge pages"). All translation happens at page granularity.' },
  'frame':      { name: 'page frame', def: 'A page-sized slot in physical RAM.' },
  'page table': { name: 'page table', def: 'Per-process data structure mapping virtual pages → physical frames. Multi-level (4 levels on x86_64) to keep size manageable.' },
  'TLB':        { name: 'translation lookaside buffer', def: 'Small associative cache of recent virtual→physical translations, on the CPU. Hit avoids page-table walk; miss = walk + cache.' },
  'page fault': { name: 'page fault', def: 'CPU trap when a memory access hits a page that isn\'t resident. Major (must read from disk) vs minor (just update bookkeeping). Major faults cost ms.' },
  'demand paging': { name: 'demand paging', def: 'Pages are loaded into RAM only when first accessed, not at exec time. Lets you "exec" a 2 GB binary without using 2 GB.' },
  'COW':        { name: 'copy-on-write', def: 'Both processes share a page until one writes; then the kernel copies it. Makes fork() cheap; many forked processes share unmodified pages forever.' },
  'mmap':       { name: 'mmap', def: 'Map a file (or anonymous memory) into the address space. Loading pages is then just reading memory; the OS pages it in/out behind the scenes.' },
  'brk':        { name: 'brk / sbrk', def: 'Old POSIX system call moving the "program break" — the top of the heap. Largely supplanted by mmap for new allocations.' },
  'malloc':     { name: 'malloc', def: 'C library function: ask the userspace allocator (glibc, jemalloc) for memory. The allocator gets memory in chunks from brk/mmap and parcels it out.' },
  'fragmentation': { name: 'fragmentation', def: 'External: free memory exists but in small pieces. Internal: allocated chunks larger than requested due to alignment. Both waste memory.' },

  // Files
  'inode':      { name: 'inode', def: 'On-disk record describing a file: size, owner, mode, timestamps, and pointers to data blocks. Filenames are NOT in the inode — they\'re in directory entries.' },
  'dentry':     { name: 'directory entry', def: '(name, inode-number) pair stored in a directory. The same inode can have many dentries — that\'s a hard link.' },
  'hard link':  { name: 'hard link', def: 'Additional name for the same inode. ln a b makes b another name for whatever a names. Same inode, same data.' },
  'symlink':    { name: 'symbolic link', def: 'A file whose contents are a path to another file. ln -s a b makes b → a. Different inode; stale if target moves.' },
  'fd':         { name: 'file descriptor', def: 'A small integer (0=stdin, 1=stdout, 2=stderr, then open() returns 3, 4...) indexing into a per-process table.' },
  'pipe':       { name: 'pipe', def: 'Kernel byte buffer with a read end and write end. Shell | uses anonymous pipes. Cannot seek; closing the write end gives EOF on read.' },
  'fs':         { name: 'file system', def: 'On-disk layout that turns blocks into a tree of files and directories. ext4, XFS, btrfs, ZFS, NTFS.' },

  // Sync
  'race condition': { name: 'race condition', def: 'Behavior depends on the order/timing of concurrent operations on shared state. The bug looks intermittent because timing varies.' },
  'mutex':      { name: 'mutex', def: 'Mutual-exclusion lock. At most one thread holds it at a time; others block. Protects a critical section.' },
  'semaphore':  { name: 'semaphore', def: 'Counter with wait() and post() operations. Counting (resource pool) or binary (= mutex with looser semantics).' },
  'CV':         { name: 'condition variable', def: 'Lets a thread sleep until another thread signals a condition. Always paired with a mutex.' },
  'atomic':     { name: 'atomic operation', def: 'Hardware-supported indivisible read-modify-write (CAS, fetch-add). Foundation of lock-free data structures.' },
  'deadlock':   { name: 'deadlock', def: 'Two or more threads each hold a lock the other needs. None ever progresses. Four conditions required (Coffman): mutual exclusion, hold-and-wait, no preemption, circular wait.' },

  // Signals / IPC
  'signal':     { name: 'signal', def: 'Asynchronous notification to a process. Can interrupt at almost any point. Limited info (just a number).' },
  'SIGTERM':    { name: 'SIGTERM', def: 'Polite termination request. Default for kill(1). Catchable.' },
  'SIGKILL':    { name: 'SIGKILL', def: 'Cannot be caught or ignored. Forces termination. Use kill -9 last.' },
  'SIGCHLD':    { name: 'SIGCHLD', def: 'Sent to parent when a child changes state. Parent typically catches to wait() and avoid zombies.' },
  'IPC':        { name: 'inter-process communication', def: 'Mechanisms for processes to talk: pipes, sockets, shared memory, signals, message queues, semaphores. Different trade-offs.' },
  'shm':        { name: 'shared memory', def: 'Two processes mmap the same memory region. Fastest IPC; you must do your own synchronization.' }
};

OST.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = OST.glossary[key];
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
OST.escapeHtml = escapeHtml;
