// Level 7 — Memory allocation
OST.registerLevel({
  id: 7,
  title: 'Memory Allocation',
  whyItMatters: 'malloc / free is one of the most-called functions in any C/C++ program. Knowing how it gets memory from the kernel — and why naïve allocation patterns cause fragmentation — explains a wide class of "my program slowly grows over hours" bugs.',
  glossary: ['malloc', 'brk', 'mmap', 'fragmentation'],
  learn: ''
    + '<h4>The two layers</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Layer</th><th>Operation</th><th>Granularity</th></tr>'
    + '<tr><td>Kernel allocator</td><td><code>brk</code> / <code>mmap</code> syscalls</td><td>Pages (4 KB)</td></tr>'
    + '<tr><td>Userspace allocator (glibc malloc / jemalloc / tcmalloc / mimalloc)</td><td><code>malloc</code>/<code>free</code> functions</td><td>Bytes</td></tr>'
    + '</table>'
    + '<p>The kernel only deals in pages. The userspace allocator gets memory in chunks (usually multi-page) from the kernel and parcels it out byte-by-byte.</p>'

    + '<h4>How userspace gets memory from the kernel</h4>'

    + '<h4>brk / sbrk — the program break</h4>'
    + '<p>The original Unix way. The "program break" is the top of the heap. <code>brk(addr)</code> sets it; <code>sbrk(n)</code> moves it by n bytes. Increasing the break = the kernel adds page-table entries for the new region.</p>'
    + '<ul>'
    +   '<li>Pro: cheap (one syscall to grow, no fragmentation in virtual address space).</li>'
    +   '<li>Con: only LIFO. To free memory, you have to release the TOP. If you free a chunk in the middle, you can\'t return that to the kernel.</li>'
    + '</ul>'

    + '<h4>mmap — the modern way</h4>'
    + '<p><code>mmap(NULL, size, PROT_READ|PROT_WRITE, MAP_ANON|MAP_PRIVATE, -1, 0)</code> asks the kernel for an anonymous (zero-filled) memory region of any size, anywhere in the address space.</p>'
    + '<ul>'
    +   '<li>Pro: any region can be munmapped independently. Real "give it back" support.</li>'
    +   '<li>Con: each mmap is a syscall (~100s of ns) plus page-table setup. Heavyweight for small allocations.</li>'
    + '</ul>'
    + '<p>Modern allocators use a hybrid: small allocations come from a heap grown via brk (or large mmap arenas); huge allocations use individual mmaps that can be freed back individually.</p>'

    + '<h4>What glibc malloc does (simplified)</h4>'
    + '<ol>'
    +   '<li>Maintains "arenas" — heap regions, multiple per process to reduce contention between threads.</li>'
    +   '<li>Within an arena, divides memory into "chunks" of various sizes.</li>'
    +   '<li>Free chunks tracked in size-binned free lists.</li>'
    +   '<li><code>malloc(n)</code> — find a free chunk that fits, split if larger; if no chunk fits, grow the arena via brk or mmap.</li>'
    +   '<li><code>free(p)</code> — coalesce with adjacent free chunks; add to a free list.</li>'
    +   '<li>For very large allocations (&gt; ~128 KB), use mmap directly.</li>'
    + '</ol>'

    + '<h4>Fragmentation</h4>'
    + '<p>Two kinds:</p>'
    + '<ul>'
    +   '<li><strong>External fragmentation</strong> — total free memory is N MB, but no contiguous chunk of size M is available because free space is scattered. malloc fails or has to expand the heap.</li>'
    +   '<li><strong>Internal fragmentation</strong> — allocator returns a chunk larger than requested due to alignment or class size buckets. Wasted within each allocation.</li>'
    + '</ul>'
    + '<p>Example pattern that fragments badly: alternating small-and-large allocations, freeing only the smalls. The free smalls can\'t coalesce; the heap grows over time. Long-running processes that look like memory leaks are often just fragmentation.</p>'

    + '<h4>Allocators with different trade-offs</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Allocator</th><th>Strength</th></tr>'
    + '<tr><td>glibc <code>malloc</code> (ptmalloc2)</td><td>Default; reasonable.</td></tr>'
    + '<tr><td>jemalloc</td><td>Better performance under multi-threaded contention. Used by FreeBSD, Rust, Redis, Cassandra.</td></tr>'
    + '<tr><td>tcmalloc</td><td>Per-thread caches. Used by Google services.</td></tr>'
    + '<tr><td>mimalloc</td><td>Microsoft. Very low overhead, good for small-allocation-heavy workloads.</td></tr>'
    + '<tr><td>arena allocators (e.g. apr_pool)</td><td>Allocate, never free; blow away the whole arena at end. Great for request-scoped memory in servers.</td></tr>'
    + '</table>'
    + '<p>You can change allocator without recompiling: <code>LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so ./yourprog</code>.</p>'

    + '<h4>Why "my Python process grows forever" is often this</h4>'
    + '<p>Python objects come from the interpreter\'s small-object allocator (which uses arenas). Free\'d objects go to a free list <em>within the arena</em> — not back to glibc. As a result, peak memory rarely shrinks. <code>malloc_trim()</code> helps; switching to jemalloc helps more. Real fix: start a fresh worker process periodically (uvicorn, Gunicorn do this).</p>'

    + '<h4>Stack vs heap</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Stack</th><th>Heap</th></tr>'
    + '<tr><td>Allocate</td><td>Move RSP — single instruction</td><td>malloc — function call, free-list lookup, possible syscall</td></tr>'
    + '<tr><td>Free</td><td>Function return — single instruction</td><td>free — coalesce, return to free list</td></tr>'
    + '<tr><td>Size</td><td>Per-thread, ~1 MB on Linux (ulimit -s)</td><td>Effectively the whole address space</td></tr>'
    + '<tr><td>Lifetime</td><td>Function call</td><td>Until you free, or process exits</td></tr>'
    + '<tr><td>Growth</td><td>Limited; overflow = SIGSEGV</td><td>Bounded by virtual address space + RAM</td></tr>'
    + '</table>'
    + '<p>"Stack-allocate when possible" is a real perf principle for hot paths.</p>'

    + '<div class="callout"><div class="label">Detecting fragmentation</div>'
    + '<code>cat /proc/&lt;pid&gt;/smaps</code> shows per-region sizes. <code>cat /proc/&lt;pid&gt;/status | grep -E "VmRSS|VmData"</code>: if VmData is climbing but RSS is stable, that\'s often fragmentation. Tools: glibc\'s <code>malloc_info()</code> dumps allocator state to a file.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Allocate and free chunks. Watch the heap fragment.</p>';

    var heap = []; // array of { id, size, free }
    var nextId = 1;
    var TOTAL = 100;
    var sumAlloc = 0;

    var heapView = document.createElement('div');
    heapView.style.display = 'flex';
    heapView.style.height = '40px';
    heapView.style.border = '1px solid var(--border)';
    heapView.style.borderRadius = '4px';
    heapView.style.overflow = 'hidden';
    heapView.style.fontFamily = 'var(--mono)';
    heapView.style.fontSize = '11px';
    heapView.style.margin = '12px 0';

    var output = document.createElement('div'); output.className = 'formula-box';

    function render() {
      heapView.innerHTML = '';
      var used = heap.reduce(function (a, b) { return a + b.size; }, 0);
      var free = TOTAL - used;
      heap.forEach(function (c) {
        var d = document.createElement('div');
        d.style.flex = c.size + ' 1 0';
        d.style.background = c.free ? 'var(--bg-3)' : (c.id % 2 === 0 ? '#7ab7ff' : '#a78bfa');
        d.style.color = c.free ? 'var(--text-dim)' : '#0b0d12';
        d.style.borderRight = '1px solid var(--border)';
        d.style.display = 'flex';
        d.style.alignItems = 'center';
        d.style.justifyContent = 'center';
        d.textContent = c.free ? 'free ' + c.size : '#' + c.id + ' (' + c.size + ')';
        heapView.appendChild(d);
      });
      if (free > 0) {
        var d = document.createElement('div');
        d.style.flex = free + ' 1 0';
        d.style.background = 'var(--bg)';
        d.style.color = 'var(--text-dim)';
        d.style.display = 'flex';
        d.style.alignItems = 'center';
        d.style.justifyContent = 'center';
        d.textContent = 'unallocated ' + free;
        heapView.appendChild(d);
      }
      // Largest contiguous free
      var largestFree = 0;
      var run = 0;
      heap.forEach(function (c) {
        if (c.free) { run += c.size; if (run > largestFree) largestFree = run; }
        else run = 0;
      });
      var unallocated = TOTAL - used;
      if (unallocated > largestFree) largestFree = unallocated;
      output.innerHTML =
        '<div class="info-line"><span class="key">Used / Total:</span> <span class="val">' + used + ' / ' + TOTAL + '</span></div>' +
        '<div class="info-line"><span class="key">Largest contiguous free chunk:</span> <span class="val">' + largestFree + '</span></div>' +
        '<div class="info-line muted">External fragmentation: total free is ' + (TOTAL - sumAlloc) + ' but the biggest single allocation possible is ' + largestFree + '.</div>';
    }

    function btn(label, fn) {
      var b = document.createElement('button'); b.className='secondary-btn'; b.textContent=label;
      b.style.marginRight = '6px'; b.style.marginBottom='6px';
      b.addEventListener('click', fn);
      return b;
    }

    var ctrls = document.createElement('div');
    [3, 7, 12, 20].forEach(function (sz) {
      ctrls.appendChild(btn('alloc ' + sz, function () {
        // Find first-fit free slot
        var placed = false;
        for (var i = 0; i < heap.length; i++) {
          if (heap[i].free && heap[i].size >= sz) {
            var rem = heap[i].size - sz;
            heap[i] = { id: nextId++, size: sz, free: false };
            if (rem > 0) heap.splice(i + 1, 0, { id: 0, size: rem, free: true });
            placed = true;
            sumAlloc += sz;
            break;
          }
        }
        if (!placed) {
          var used = heap.reduce(function (a, b) { return a + b.size; }, 0);
          if (used + sz <= TOTAL) {
            heap.push({ id: nextId++, size: sz, free: false });
            sumAlloc += sz;
          } else {
            alert('alloc(' + sz + ') failed — no contiguous chunk large enough.');
          }
        }
        render();
      }));
    });
    ctrls.appendChild(btn('free random', function () {
      var occupied = heap.filter(function (c) { return !c.free; });
      if (!occupied.length) return;
      var pick = occupied[Math.floor(Math.random() * occupied.length)];
      pick.free = true;
      sumAlloc -= pick.size;
      // Coalesce adjacent free
      for (var i = 0; i < heap.length - 1; i++) {
        if (heap[i].free && heap[i+1].free) {
          heap[i].size += heap[i+1].size;
          heap.splice(i+1, 1);
          i--;
        }
      }
      render();
    }));
    ctrls.appendChild(btn('reset', function () {
      heap = []; nextId = 1; sumAlloc = 0; render();
    }));

    container.appendChild(ctrls);
    container.appendChild(heapView);
    container.appendChild(output);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You allocate 1 KB with <code>malloc(1024)</code>. The function returns. Roughly how many syscalls did this make on a fresh process (assume the allocator hasn\'t been called before)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>0 — malloc is pure userspace</option>' +
          '<option>1 — one brk or mmap to grow the heap, then 1024 bytes are parceled from there</option>' +
          '<option>1024 — one syscall per byte</option>' +
          '<option>4096 — one syscall per page</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('1 — one brk or mmap to grow the heap') === 0) return { correct: true, feedback: 'Right. The first malloc triggers ONE syscall to get a chunk from the kernel (typically much larger than 1 KB — the allocator grabs ~32–128 KB at a time). Subsequent small mallocs are pure userspace until that chunk is exhausted. This is why malloc/free in a loop is fast.' };
        if (v === '0 — malloc is pure userspace') return { correct: false, feedback: 'malloc is mostly userspace, but the FIRST call (or one that exceeds the current heap) needs a syscall to grow.' };
        return { correct: false, feedback: 'One syscall to get a chunk from the kernel. Then the allocator parcels from that chunk in pure userspace.' };
      },
      hints: [
        'The first malloc has to GET memory from the kernel somehow.',
        'After that, the allocator manages a userspace pool.',
        '1 syscall on first call. Subsequent small mallocs: 0.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A long-running daemon shows: VmData (heap region) climbing slowly over days, while VmRSS stays roughly stable. The daemon allocates and frees many objects per second. What\'s the most likely cause?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Memory leak — daemon is forgetting to free</option>' +
          '<option>Heap fragmentation — free\'d chunks can\'t coalesce, so the allocator keeps growing the heap to find contiguous space, but actual resident pages stay roughly stable.</option>' +
          '<option>Linux is double-counting</option>' +
          '<option>The daemon needs more RAM</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Heap fragmentation') === 0) return { correct: true, feedback: 'Right. A leak would show RSS climbing too. Stable RSS but growing VmData = the heap mapping has expanded but the new pages are mostly free space scattered between in-use chunks. Common pattern: alternating small-and-large allocations where only the smalls free. Mitigations: switch to jemalloc, periodically restart workers, use arena/pool allocators for known-lifetime workloads.' };
        if (v === 'Memory leak — daemon is forgetting to free') return { correct: false, feedback: 'A leak would also grow RSS — both VmData and VmRSS climb together.' };
        return { correct: false, feedback: 'Stable RSS + climbing VmData = heap mapping grew but actual resident memory didn\'t. Fragmentation.' };
      },
      hints: [
        'A real leak grows BOTH VmData and VmRSS.',
        'VmData up but RSS stable = virtual mapping grew with mostly-free space inside.',
        'Fragmentation.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A high-performance web server allocates ~100 MB total per request (parsing, templates, scratch buffers) and frees nearly all of it before responding. Profiling shows ~15% of CPU in <code>malloc</code>/<code>free</code>. Which architectural change is most likely to materially reduce that overhead WITHOUT a code rewrite?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Switch the system allocator to jemalloc (or tcmalloc / mimalloc) via LD_PRELOAD — better multi-threaded behavior and significantly less per-call overhead than glibc default</option>' +
          '<option>Increase RAM</option>' +
          '<option>Disable swap</option>' +
          '<option>Run more worker processes</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Switch the system allocator to jemalloc') === 0) return { correct: true, feedback: 'Right. Per-call overhead and multi-threaded contention vary 2–5× across allocators. Switching to jemalloc / tcmalloc / mimalloc via LD_PRELOAD is a one-line change with no code modifications. Real-world: Redis, Cassandra, Discord all switched from glibc to jemalloc with significant tail-latency improvements. The "right" architectural change is to use arena/pool allocation for request-scoped memory (allocate once per request, free entire arena at end) — but that\'s a code change. LD_PRELOAD is the no-code-change move.' };
        if (v === 'Increase RAM') return { correct: false, feedback: 'You\'re not memory-pressured; you\'re CPU-bound in malloc.' };
        if (v === 'Disable swap') return { correct: false, feedback: 'Unrelated.' };
        if (v === 'Run more worker processes') return { correct: false, feedback: 'Doesn\'t reduce per-malloc cost.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Different allocators have very different overheads.',
        'jemalloc / tcmalloc / mimalloc — drop-in via LD_PRELOAD.',
        'Switch allocator.'
      ]
    }
  ]
});
