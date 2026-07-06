// Level 5 — Virtual memory
OST.registerLevel({
  id: 5,
  title: 'Virtual Memory',
  whyItMatters: 'Virtual memory is one of the great ideas of computing. It gives every process a private, contiguous, huge address space — and lets the kernel transparently manage physical RAM behind it. Reading a page-table walk teaches you why memory access patterns affect speed.',
  glossary: ['virtual memory', 'MMU', 'page', 'frame', 'page table', 'TLB'],
  learn: ''
    + '<h4>The illusion</h4>'
    + '<p>Each process sees a private, contiguous virtual address space:</p>'
    + '<ul>'
    +   '<li>32-bit: 2³² = 4 GB.</li>'
    +   '<li>64-bit (x86_64, 48-bit user portion): 2⁴⁸ = 256 TB.</li>'
    + '</ul>'
    + '<p>The CPU never accesses physical RAM directly from a userspace pointer. Every load/store goes through the <strong>MMU</strong>, which translates virtual → physical via the page tables.</p>'

    + '<h4>Why we have it</h4>'
    + '<ul>'
    +   '<li><strong>Isolation</strong> — each process has its own address space. A bug in process A can\'t corrupt process B\'s memory.</li>'
    +   '<li><strong>Continuous address space</strong> — programs see contiguous memory regardless of physical fragmentation.</li>'
    +   '<li><strong>Paging to disk</strong> — physical RAM is small; the OS can swap pages to disk and bring them back on demand.</li>'
    +   '<li><strong>Sharing</strong> — multiple processes can map the same physical frame (shared libraries, COW after fork, mmap shared memory).</li>'
    +   '<li><strong>Permissions</strong> — pages can be R/W/X/none independently.</li>'
    + '</ul>'

    + '<h4>Pages and frames</h4>'
    + '<p>The unit of mapping is a <strong>page</strong> (4 KB by default on x86_64). A page-aligned chunk of physical RAM is a <strong>frame</strong>. The page table maps pages → frames.</p>'
    + '<p>Page size trade-off: smaller pages → fine-grained sharing/protection but bigger page tables and more TLB pressure. Larger "huge pages" (2 MB, 1 GB) reduce TLB load for big workloads but waste memory if you don\'t need them all.</p>'

    + '<h4>Address breakdown (4 KB pages)</h4>'
    + '<p>A virtual address is split into:</p>'
    + '<ul>'
    +   '<li>The high bits: <strong>virtual page number (VPN)</strong> — index into the page table.</li>'
    +   '<li>The low 12 bits: <strong>offset within the page</strong>.</li>'
    + '</ul>'
    + '<div class="terminal">'
    + 'virtual address: 0x00007ffd1234<span class="hi">5678</span>\n'
    + '                             |--- offset (12 bits) = 0x678\n'
    + '                 |--- VPN -----|\n'
    + '\n'
    + 'page table entry for VPN points to a frame number F.\n'
    + 'physical address = (F &lt;&lt; 12) | offset'
    + '</div>'

    + '<h4>Multi-level page tables</h4>'
    + '<p>A flat page table for 256 TB of address space at 4 KB pages would have 2³⁶ entries × 8 bytes = 512 GB of page table per process. Absurd.</p>'
    + '<p>Solution: <strong>multi-level paging</strong>. x86_64 uses a 4-level walk:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Level</th><th>Index bits</th><th>Each entry covers</th></tr>'
    + '<tr><td>PML4</td><td>47–39 (9 bits)</td><td>512 GB</td></tr>'
    + '<tr><td>PDPT</td><td>38–30 (9 bits)</td><td>1 GB</td></tr>'
    + '<tr><td>PD</td><td>29–21 (9 bits)</td><td>2 MB</td></tr>'
    + '<tr><td>PT</td><td>20–12 (9 bits)</td><td>4 KB (one page)</td></tr>'
    + '</table>'
    + '<p>A page-table walk = 4 memory accesses to follow the chain. <em>Without TLB caching, every load would require 4 extra loads to translate the address.</em> That\'s why the TLB exists.</p>'

    + '<h4>The TLB</h4>'
    + '<p>The <strong>Translation Lookaside Buffer</strong> is a small associative cache (typically 64–4096 entries) of recent virtual-page → physical-frame translations, on the CPU.</p>'
    + '<ul>'
    +   '<li>TLB hit: ~1 cycle (~0.3 ns).</li>'
    +   '<li>TLB miss: 4-level page walk (~50–100 cycles, ~20+ ns), unless the page-table entries are themselves cached.</li>'
    + '</ul>'
    + '<p>Modern CPUs have separate TLBs for instructions and data, sometimes 2 levels of TLB. Huge pages get their own TLB entries with much larger coverage per entry.</p>'

    + '<h4>The cost of TLB misses on big workloads</h4>'
    + '<p>If you randomly access 100 GB of data (way more than can fit in TLB-covered pages), every access can be a TLB miss → page walk. That\'s 4 extra memory accesses per logical access, often ~20 ns of pure translation overhead.</p>'
    + '<p>Mitigations:</p>'
    + '<ul>'
    +   '<li>Huge pages (2 MB or 1 GB) — one TLB entry covers more memory.</li>'
    +   '<li>Locality-aware data structures.</li>'
    +   '<li>Prefetching.</li>'
    + '</ul>'

    + '<h4>Worked translation</h4>'
    + '<p>Virtual address <code>0x12345</code> with 4 KB pages (12-bit offset).</p>'
    + '<ol>'
    +   '<li>Page number = <code>0x12345 &gt;&gt; 12 = 0x12</code> (= 18).</li>'
    +   '<li>Offset = <code>0x12345 &amp; 0xFFF = 0x345</code>.</li>'
    +   '<li>Look up VPN 18 in the page table → frame number, say <code>0x05</code>.</li>'
    +   '<li>Physical = <code>(0x05 &lt;&lt; 12) | 0x345 = 0x5345</code>.</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">Page-table accounting</div>'
    + '<code>cat /proc/&lt;pid&gt;/status | grep -i vmpte</code> — shows how much memory the kernel uses just for THIS process\'s page tables. Gigabytes for very large processes; one of the reasons containers tend to use huge pages.'
    + '</div>',

  mountPlay: function (container) {
    var os = OST.lib.os;
    container.innerHTML = '<p class="muted">Type a virtual address and watch the translation. Some pages are present, some swapped, some never mapped.</p>';

    // Tiny page table for a tiny address space: 16-bit, 4 KB pages → 16 pages
    var pageTable = [
      { frame: 5, present: true },   // 0x0000-0x0FFF → 0x5000
      { frame: 2, present: true },   // 0x1000-0x1FFF → 0x2000
      { frame: 0, present: false },  // 0x2000-0x2FFF swapped (in disk)
      { frame: 7, present: true },   // 0x3000-0x3FFF → 0x7000
      null,                          // 0x4000-0x4FFF unmapped
      { frame: 3, present: true },   // 0x5000-0x5FFF → 0x3000
      { frame: 0, present: false },  // 0x6000 swapped
      { frame: 1, present: true },
      null, null, null, null, null, null, null, null
    ];

    var inp = document.createElement('input'); inp.type='text'; inp.value='0x1234'; inp.style.width='160px';
    var btn = document.createElement('button'); btn.className='secondary-btn'; btn.textContent='Translate'; btn.style.marginLeft='8px';

    var output = document.createElement('div'); output.className = 'formula-box';

    // Show the page-table grid
    var grid = document.createElement('div'); grid.className = 'page-grid';
    pageTable.forEach(function (e, i) {
      var cell = document.createElement('div'); cell.className = 'page-cell';
      if (!e) { cell.classList.add('invalid'); cell.textContent = 'P' + i + '\n--'; }
      else if (!e.present) { cell.classList.add('swapped'); cell.textContent = 'P' + i + '\nswap'; }
      else { cell.classList.add('present'); cell.textContent = 'P' + i + '\nF' + e.frame; }
      grid.appendChild(cell);
    });

    function translate() {
      var raw = inp.value.trim();
      var addr = raw.indexOf('0x') === 0 ? parseInt(raw.substr(2), 16) : parseInt(raw, 10);
      if (isNaN(addr) || addr < 0 || addr > 0xFFFF) {
        output.innerHTML = '<div class="info-line bad">Invalid address — use 0x0000..0xFFFF.</div>';
        return;
      }
      var r = os.translate(addr, 0x1000, pageTable);
      var lines = [
        '<div class="info-line"><span class="key">Virtual address:</span> <span class="val">' + os.fmtAddr(addr) + '</span></div>',
        '<div class="info-line"><span class="key">VPN:</span> <span class="val">' + r.pageNumber + ' (= addr &gt;&gt; 12)</span></div>',
        '<div class="info-line"><span class="key">Offset:</span> <span class="val">0x' + r.offset.toString(16).padStart(3, '0') + '</span></div>'
      ];
      var entry = pageTable[r.pageNumber];
      if (!entry) {
        lines.push('<div class="info-line"><span class="key">Result:</span> <span class="val" style="color:var(--bad)">SEGFAULT — page not mapped</span></div>');
      } else if (!entry.present) {
        lines.push('<div class="info-line"><span class="key">Result:</span> <span class="val" style="color:var(--warn)">PAGE FAULT — must read frame from disk first, then retry</span></div>');
      } else {
        lines.push('<div class="info-line"><span class="key">PT entry:</span> <span class="val">frame ' + entry.frame + '</span></div>');
        lines.push('<div class="info-line"><span class="key">Physical:</span> <span class="val"><span class="result">' + os.fmtAddr(r.physical) + '</span> = (frame &lt;&lt; 12) | offset</span></div>');
      }
      output.innerHTML = lines.join('');
    }
    btn.addEventListener('click', translate);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') translate(); });
    var row = document.createElement('div'); row.className='controls-row';
    var lbl = document.createElement('label'); lbl.appendChild(document.createTextNode('Virtual addr: ')); lbl.appendChild(inp);
    row.appendChild(lbl); row.appendChild(btn);
    container.appendChild(row);
    container.appendChild(grid);
    container.appendChild(output);
    translate();
    var note = document.createElement('div'); note.className = 'info-line muted';
    note.innerHTML = 'Try: <code>0x0345</code> (page 0 → frame 5), <code>0x2000</code> (swapped — page fault!), <code>0x4500</code> (unmapped — segfault!), <code>0x7800</code> (page 7 → frame 1).';
    container.appendChild(note);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Page size = 4 KB (12-bit offset). Virtual address <code>0x3456</code> maps to frame number <code>9</code>. What is the physical address?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='text'; inp.placeholder='0x...';
        c.appendChild(inp);
        return function () { return inp.value.trim().toLowerCase(); };
      },
      check: function (v) {
        // page = 0x3, offset = 0x456. frame = 9 = 0x9. physical = (9 << 12) | 0x456 = 0x9456
        if (v === '0x9456' || v === '9456') return { correct: true, feedback: 'Right. VPN = 0x3456 >> 12 = 0x3 (= 3). Offset = 0x3456 & 0xFFF = 0x456. Physical = (frame 9 << 12) | offset = 0x9000 | 0x456 = 0x9456.' };
        return { correct: false, feedback: 'Offset = low 12 bits = 0x456. Frame number << 12 = 0x9000. OR them: 0x9456.' };
      },
      hints: [
        'Split address: top bits = VPN, low 12 bits = offset.',
        'Frame * 4096 + offset.',
        '0x9456.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A program randomly accesses 4 GB of data with no spatial locality. The CPU has a 64-entry data TLB; each entry covers a 4 KB page. What fraction of memory accesses miss the TLB on average?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>~0% — TLB caches everything</option>' +
          '<option>~64/65536 ≈ 0.1% — TLB covers a tiny fraction</option>' +
          '<option>Nearly 100% — TLB covers 64 × 4 KB = 256 KB out of 4 GB. Random accesses almost always miss.</option>' +
          '<option>Exactly 50%</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Nearly 100%') === 0) return { correct: true, feedback: 'Right. TLB covers 64 × 4 KB = 256 KB. Working set is 4 GB. Random accesses fall on a different page nearly every time → TLB miss almost always. Fix: huge pages. With 2 MB pages, the same 64-entry TLB covers 64 × 2 MB = 128 MB — much better. Modern CPUs have larger TLBs (1024+ entries with several levels) but the math still bites for big-data workloads.' };
        if (v.indexOf('~0% — TLB caches everything') === 0) return { correct: false, feedback: '64 entries × 4 KB = 256 KB total coverage. Vs 4 GB working set with random access — that\'s a 16,384× ratio. TLB caches ~0.006%.' };
        if (v.indexOf('~64/65536') === 0) return { correct: false, feedback: 'Right ratio (256KB/4GB), but 0.1% means MISS rate is 99.9%, not 0.1% miss.' };
        if (v === 'Exactly 50%') return { correct: false, feedback: 'No basis for 50%.' };
        return { correct: false, feedback: 'TLB capacity / working set.' };
      },
      hints: [
        'How much memory does the TLB cover? (entries × page size)',
        '64 × 4 KB = 256 KB. Working set = 4 GB.',
        '256 KB / 4 GB = ~0.006%. Random accesses miss ~99.99% of the time.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A C program <code>fork()</code>s 1000 children. Without copy-on-write, this would require ~1000× the parent\'s memory. With COW (Linux\'s default), what determines the actual extra physical RAM consumed by the children?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Always 0 — COW means no copies happen</option>' +
          '<option>1× the parent\'s memory — Linux always copies once eventually</option>' +
          '<option>The set of pages WRITTEN by any child after fork (each written page diverges and a private copy is made; unwritten pages stay shared)</option>' +
          '<option>Determined by the page size only</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('The set of pages WRITTEN by any child after fork') === 0) return { correct: true, feedback: 'Right. COW shares pages read-only at fork time. The MMU traps a write attempt; the kernel allocates a fresh frame, copies the original page into it, points the writer\'s page table at the new frame (now writable), and lets the write proceed. Pages never written stay shared forever. So the extra cost is "pages that diverged due to writes" × number of diverging children. Programs that fork+exec immediately barely write before exec wipes the address space → COW is essentially free.' };
        if (v === 'Always 0 — COW means no copies happen') return { correct: false, feedback: 'COW means no IMMEDIATE copy. When something is written, copy DOES happen.' };
        if (v === '1× the parent\'s memory — Linux always copies once eventually') return { correct: false, feedback: 'Only the WRITTEN pages get copied. Read-only access stays shared.' };
        if (v === 'Determined by the page size only') return { correct: false, feedback: 'Page size affects the granularity but not the total.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'COW: shared until written. So what triggers a copy?',
        'Writes. Every page WRITTEN diverges; pages NEVER written stay shared.',
        'Cost = pages written × children that wrote.'
      ]
    }
  ]
});
