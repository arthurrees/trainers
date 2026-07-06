// Level 6 — Page faults & TLB
OST.registerLevel({
  id: 6,
  title: 'Page Faults &amp; Demand Paging',
  whyItMatters: 'A page fault is the kernel\'s way of "lazy-loading" memory. Most are fast (microseconds); some are slow (milliseconds, if disk is involved). Understanding which is which lets you reason about latency and capacity planning.',
  glossary: ['page fault', 'TLB', 'demand paging', 'COW', 'mmap'],
  learn: ''
    + '<h4>What a page fault is</h4>'
    + '<p>The CPU tries to translate a virtual address. Either the TLB has the entry (fast hit) or it doesn\'t — in which case the MMU walks the page table. If the page-table entry says "not present," the MMU raises a <strong>page fault</strong> trap. Control transfers to the kernel\'s fault handler, which decides what to do.</p>'

    + '<h4>Three kinds of page fault</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Kind</th><th>What kernel does</th><th>Latency</th></tr>'
    + '<tr><td><strong>Minor (soft)</strong></td><td>Page is in physical memory but not in this process\'s page table (e.g., shared lib loaded but page table not updated; first touch of a COW page; page in buffer cache).</td><td>~1 µs (pure bookkeeping)</td></tr>'
    + '<tr><td><strong>Major (hard)</strong></td><td>Page must be read from disk (file-backed mmap, swap-in).</td><td>~10 µs–10 ms (depends on storage)</td></tr>'
    + '<tr><td class="bad"><strong>Invalid</strong></td><td>The virtual address is genuinely not mapped — null pointer deref, stack overflow, etc. Kernel sends SIGSEGV.</td><td>Process dies (or signal handler runs)</td></tr>'
    + '</table>'

    + '<h4>Demand paging — why exec is fast</h4>'
    + '<p>When you exec a 1 GB binary, the kernel <em>doesn\'t</em> read 1 GB into RAM. It just sets up page-table entries marking the file\'s contents as "not present, file-backed at offset N." The first time the CPU executes from a particular page, a minor fault triggers the kernel to read JUST THAT PAGE from disk. Pages you never touch are never loaded. This is <strong>demand paging</strong>.</p>'
    + '<p>Same mechanism for <code>mmap()</code> of a large file. mmap of a 100 GB log file uses essentially zero RAM until you start reading.</p>'

    + '<h4>The page cache</h4>'
    + '<p>Linux uses spare RAM as a cache of disk content. <code>read(fd, buf, 4096)</code> first checks: "is this disk block already in the page cache?" If yes (cache hit), the kernel copies it from cache to buf — no disk I/O. If no (cache miss), it reads from disk into cache, then copies to buf.</p>'
    + '<p>This is why the SECOND time you read a file, it\'s blazingly fast: the file lives in the page cache. <code>echo 3 &gt; /proc/sys/vm/drop_caches</code> flushes it (don\'t do this on a busy system).</p>'

    + '<h4>Working set</h4>'
    + '<p>The <strong>working set</strong> of a process at time t is the set of pages it has accessed in the last τ time units. Approximate denning model: as long as RAM ≥ sum of all working sets, page-fault rate stays low. When RAM &lt; sum, the system <strong>thrashes</strong>: every process keeps causing major faults to bring back pages it just had.</p>'
    + '<p>Modern Linux uses LRU-based heuristics: pages on an "active" list (recently used) and "inactive" list. Pressure evicts from inactive first. <code>sar -B</code> shows page-fault rate; <code>sar -W</code> shows swap activity.</p>'

    + '<h4>Page replacement algorithms</h4>'
    + '<p>When physical RAM is full and you need to bring in a new page, you must evict an existing one. Algorithms (theoretical):</p>'
    + '<ul>'
    +   '<li><strong>FIFO</strong> — evict the page that\'s been in RAM longest. Simple. Susceptible to "Belady\'s anomaly" — more RAM can cause MORE faults.</li>'
    +   '<li><strong>LRU</strong> — evict the least-recently-used page. Optimal-ish. Hard to implement exactly (need timestamp on every access).</li>'
    +   '<li><strong>Clock / Second-chance</strong> — approximation of LRU. Each page has a "referenced" bit. Sweep cyclically; if bit is 0, evict; if 1, clear bit and continue. Linux uses a variant.</li>'
    +   '<li><strong>Optimal</strong> — evict the page used farthest in the future. Theoretical baseline; can\'t be implemented (you don\'t know the future) but useful for benchmarking.</li>'
    + '</ul>'

    + '<h4>Swap</h4>'
    + '<p><strong>Swap space</strong> is disk space dedicated to "overflow RAM." When the OS needs to evict an anonymous (non-file-backed) page and physical RAM is full, it writes the page to swap. Re-accessing it = major fault to read from swap.</p>'
    + '<p>Modern best practice: have SOME swap (lets the kernel evict cold anonymous pages and use that RAM for cache) but don\'t rely on it. Tune <code>vm.swappiness</code> (0–200): low = prefer evicting page cache; high = prefer swapping anonymous pages.</p>'
    + '<p>For containerized workloads, swap is often disabled to make memory limits hard.</p>'

    + '<h4>Effective access time</h4>'
    + '<p>The expected time for a memory access, factoring in TLB and faults:</p>'
    + '<div class="formula-box">EAT = (TLB_hit × t_mem) + (TLB_miss_no_fault × (t_walk + t_mem)) + (fault × t_fault)</div>'
    + '<p>For a workload with 99% TLB hit, 1% TLB miss but no fault, 0.001% major fault: roughly <code>0.99×100ns + 0.01×120ns + 0.00001×5ms = ~100 ns + 1.2 ns + 50 ns = ~150 ns</code>. The 0.001% fault rate dominates if it\'s a major fault.</p>'

    + '<div class="callout"><div class="label">Why your laptop hangs when memory fills</div>'
    + 'You\'ve hit thrashing. Every process is page-faulting; the disk is saturated; the kernel can barely run. The OOM killer eventually picks a victim and ends the worst offender. Modern Linux has earlyoom / systemd-oomd to act faster than the kernel\'s slow OOM. tmpfs in /tmp + 32 GB of Chrome tabs is the canonical user-side cause.'
    + '</div>',

  mountPlay: function (container) {
    var os = OST.lib.os;
    container.innerHTML = '<p class="muted">Set TLB hit rate, miss costs, and fault rates. The effective access time updates live.</p>';

    var state = { hitRate: 0.95, tlbTime: 1, memTime: 100, faultRate: 0, faultTime: 5000000 }; // 5ms
    var output = document.createElement('div'); output.className = 'formula-box';

    function num(min, max, val, step) { var i = document.createElement('input'); i.type='number'; i.min=min; i.max=max; i.value=val; i.step=step||1; return i; }
    var hitInp = num(0, 1, state.hitRate, 0.01);
    var memInp = num(10, 1000, state.memTime, 10);
    var faultInp = num(0, 1, state.faultRate, 0.001);

    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    var row = document.createElement('div'); row.className='controls-row';
    row.appendChild(lbl('TLB hit rate (0–1):', hitInp));
    row.appendChild(lbl('Memory access (ns):', memInp));
    row.appendChild(lbl('Major fault rate (0–1):', faultInp));

    function update() {
      state.hitRate = parseFloat(hitInp.value);
      state.memTime = parseFloat(memInp.value);
      state.faultRate = parseFloat(faultInp.value);
      // Simple model: hit takes mem, miss takes 2*mem (walk + access), fault takes ~5ms
      var noFault = (state.hitRate * state.memTime) + ((1 - state.hitRate) * 2 * state.memTime);
      var withFault = (1 - state.faultRate) * noFault + state.faultRate * 5e6;
      var verdict = withFault < 200 ? 'good' : withFault < 5000 ? 'warn' : 'bad';
      output.innerHTML =
        '<div class="info-line"><span class="key">Without faults (TLB only):</span> <span class="val">' + noFault.toFixed(2) + ' ns avg</span></div>' +
        '<div class="info-line"><span class="key">Effective access time:</span> <span class="val"><span class="result" style="color:var(--' + verdict + ')">' + (withFault < 1000 ? withFault.toFixed(2) + ' ns' : (withFault / 1000).toFixed(1) + ' µs') + '</span></span></div>' +
        '<div class="info-line muted">Note: a single major fault is ~5 ms (5,000,000 ns). At 0.001 fault rate (1 per 1000 accesses), that\'s 5,000 ns averaged in — vastly bigger than TLB effects. Major faults dominate.</div>';
    }
    [hitInp, memInp, faultInp].forEach(function (e) { e.addEventListener('input', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which kind of page fault is fastest to resolve?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Major (page must be read from disk)</option>' +
          '<option>Minor (page is in RAM, just not in this process\'s page table)</option>' +
          '<option>Invalid (segfault)</option>' +
          '<option>All take the same time</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Minor (page is in RAM, just not in this process\'s page table)') return { correct: true, feedback: 'Right. Minor faults are pure bookkeeping — no I/O — typically <1 µs. Major faults wait for disk (10 µs to 10 ms). Invalid faults kill the process (or run a signal handler).' };
        return { correct: false, feedback: 'Minor: bookkeeping only, no I/O. ~1 µs. Major: disk read. Invalid: segfault.' };
      },
      hints: [
        'Which kind doesn\'t need I/O?',
        'Minor — page is in RAM, just bookkeeping.',
        'Minor.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A database has a 50 GB working set and the server has 64 GB RAM. Page-fault rate is low. A second instance is started on the same server (also 50 GB working set). What happens?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Both run normally — 64 GB is plenty</option>' +
          '<option>Combined working set (100 GB) exceeds RAM (64 GB). System thrashes — major page faults skyrocket as each instance evicts the other\'s pages and re-reads from disk. Performance collapses non-linearly.</option>' +
          '<option>Linux kills the slower one</option>' +
          '<option>One instance gets all the RAM, the other gets none</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Combined working set (100 GB) exceeds RAM (64 GB)') === 0) return { correct: true, feedback: 'Right. The classic capacity-planning failure mode. With 64 GB of RAM and 100 GB of combined working set, every access by one instance starts evicting pages the other just brought in. Major-fault rate explodes; disk I/O saturates; both instances become unusably slow. Mitigations: more RAM, separate hosts, swap-disabled to fail fast, container memory limits to enforce isolation.' };
        if (v === 'Both run normally — 64 GB is plenty') return { correct: false, feedback: '50 + 50 = 100. RAM = 64. They fight for memory.' };
        if (v === 'Linux kills the slower one') return { correct: false, feedback: 'OOM killer fires only at extreme memory pressure (allocation failure). Thrashing happens BEFORE OOM and is often the worse problem.' };
        if (v === 'One instance gets all the RAM, the other gets none') return { correct: false, feedback: 'Linux page-replacement is fair-ish; both processes suffer.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Add up working sets and compare to RAM.',
        '50 + 50 > 64. Doesn\'t fit.',
        'Thrashing — both instances page-fault constantly, evicting each other.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You <code>mmap()</code> a 100 GB log file on a server with 16 GB RAM. The file isn\'t streamed; you randomly access bytes throughout. Free RAM drops as you read. What\'s the kernel doing, and why is the program NOT killed by OOM despite "using" 100 GB?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>It\'s using 100 GB and Linux is broken</option>' +
          '<option>mmap of a file is file-backed memory — pages fault in on access (page cache). When RAM fills, the kernel evicts other page-cache pages back to their backing files (which is just "drop the page" — the file copy is authoritative). Process never "owns" 100 GB; it just has a 100 GB virtual mapping. RSS stays bounded by RAM.</option>' +
          '<option>The file is compressed in RAM</option>' +
          '<option>OOM kicks in after 16 GB and crashes the program</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('mmap of a file is file-backed memory') === 0) return { correct: true, feedback: 'Right. File-backed mmap means the file IS the backing store. Pages fault in on access; the kernel uses page cache. When pressure hits, file-backed pages can be dropped (no need to write them back — the file on disk is already the canonical version). Anonymous (non-file-backed) memory is what "uses" RAM in the traditional sense and triggers OOM. So you can mmap arbitrarily large files with little RSS impact — perfect for indexes, search workloads, etc. RES (resident) tracks actual RAM use; VIRT shows the 100 GB virtual mapping. <code>top</code> distinguishes them.' };
        return { correct: false, feedback: 'mmap of a file uses page cache. Pages can be evicted back to "the file" without copy. The 100 GB is virtual, not committed RSS.' };
      },
      hints: [
        'The file IS the backing store. What does "evicting" a clean file-backed page require?',
        'Just drop it — the file on disk is already the canonical copy.',
        'mmap with file-backed pages doesn\'t commit RAM; uses page cache. RSS stays small.'
      ]
    }
  ]
});
