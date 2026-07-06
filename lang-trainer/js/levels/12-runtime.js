// Level 12 — Runtime Systems
LT.registerLevel({
  id: 12,
  title: 'Runtime Systems',
  whyItMatters: 'Languages do not just produce machine code. They ship a runtime that handles memory, exceptions, threads, and bookkeeping the program counts on at run time.',
  glossary: ['runtime', 'GC', 'heap', 'stack'],
  learn:
    '<p>A "compiled" program is rarely just your code. Bundled with it (or linked in dynamically) is a <b>runtime</b>: code that comes with the language and runs alongside your program. The runtime handles the things your code expects but did not implement: memory allocation, garbage collection, exception unwinding, dynamic dispatch tables, thread scheduling, type information.</p>' +

    '<h4>The minimum: process memory layout</h4>' +
    '<p>When your program is loaded, its address space looks roughly like this (on Unix; Windows is similar):</p>' +
    '<div class="formula-box">' +
    'high addresses<br>' +
    '  ┌─────────────┐<br>' +
    '  │   stack     │  ← grows down<br>' +
    '  │     ↓       │<br>' +
    '  ├─────────────┤<br>' +
    '  │             │<br>' +
    '  │   (gap)     │<br>' +
    '  │             │<br>' +
    '  ├─────────────┤<br>' +
    '  │     ↑       │<br>' +
    '  │   heap      │  ← grows up<br>' +
    '  ├─────────────┤<br>' +
    '  │   .bss      │  uninitialized globals<br>' +
    '  ├─────────────┤<br>' +
    '  │   .data     │  initialized globals<br>' +
    '  ├─────────────┤<br>' +
    '  │   .rodata   │  string literals, constants<br>' +
    '  ├─────────────┤<br>' +
    '  │   .text     │  code<br>' +
    '  └─────────────┘<br>' +
    'low addresses' +
    '</div>' +
    '<ul>' +
    '<li><b>Stack</b>: per-thread, grows downward. Each function call adds a frame.</li>' +
    '<li><b>Heap</b>: where dynamic allocations live (<code class="inline">malloc</code>, <code class="inline">new</code>, language-specific allocators).</li>' +
    '<li><b>.text/.data/.rodata/.bss</b>: came from the executable, mapped in by the loader.</li>' +
    '</ul>' +

    '<h4>Memory management strategies</h4>' +
    '<p>How does the language clean up memory after you are done with it?</p>' +
    '<ul>' +
    '<li><b>Manual</b> (C, C++): you call <code class="inline">free</code>/<code class="inline">delete</code>. Fast, predictable, error-prone (use-after-free, double-free, leaks).</li>' +
    '<li><b>Reference counting</b> (Python, Swift, C++ <code class="inline">shared_ptr</code>): each object tracks how many references point to it; freed when count hits zero. Simple, but cannot reclaim cycles without help.</li>' +
    '<li><b>Tracing GC</b> (Java, Go, JavaScript, OCaml): periodically walk all live references from "roots" (stack, globals, registers); anything unreachable is freed. Reclaims cycles, but introduces pauses (now usually concurrent / sub-millisecond).</li>' +
    '<li><b>Ownership</b> (Rust): the type system enforces that each value has exactly one owner. When the owner goes out of scope, the value is dropped. No GC; safety enforced at compile time.</li>' +
    '</ul>' +

    '<h4>Garbage collection in 60 seconds</h4>' +
    '<p>The classic mark-and-sweep algorithm:</p>' +
    '<ol>' +
    '<li><b>Mark</b>: starting from roots (stack vars, globals, registers), traverse all reachable objects, marking each one.</li>' +
    '<li><b>Sweep</b>: walk the heap. Anything not marked is unreachable; free it.</li>' +
    '</ol>' +
    '<p>Real GCs are far more sophisticated:</p>' +
    '<ul>' +
    '<li><b>Generational</b>: most objects die young, so collect the "young generation" frequently and the "old generation" rarely.</li>' +
    '<li><b>Concurrent / parallel</b>: do as much as possible while the program runs (only short "stop-the-world" pauses for the bits that need synchronization).</li>' +
    '<li><b>Compacting</b>: physically move surviving objects together to defragment the heap.</li>' +
    '</ul>' +

    '<h4>Exception handling</h4>' +
    '<p>Languages with exceptions (Java, Python, C++) need a way to <b>unwind the stack</b>: when an exception is thrown, walk back through stack frames running cleanup (destructors, finally blocks) until a matching catch is found. The compiler emits <b>unwind tables</b> that the runtime consults to know what to clean up at each frame.</p>' +
    '<p>Cost is paid when an exception fires (rare path) — the happy path is essentially free in modern implementations. C++ uses zero-cost exceptions; Rust uses Result/panic by design.</p>' +

    '<h4>What runtimes ship with</h4>' +
    '<ul>' +
    '<li><b>C</b>: tiny runtime — just startup glue and libc.</li>' +
    '<li><b>C++</b>: libc + exception unwinder + RTTI tables.</li>' +
    '<li><b>Go</b>: scheduler (goroutines), GC, race detector, big runtime — adds ~2 MB to every binary.</li>' +
    '<li><b>Java/.NET</b>: full virtual machine with JIT, GC, class loader, reflection, threading. Megabytes.</li>' +
    '<li><b>Rust</b>: minimal — async executor is opt-in, no GC, panic handler is small.</li>' +
    '</ul>' +
    '<p>"Compiled" does not mean "no runtime". Even a hello-world Go binary has a 2 MB runtime in there.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Click cells to mark them <b>reachable from a root</b>. Then click "Sweep" to free everything not marked.</p>' +
      '<div id="lt-gc-grid" style="display:grid;grid-template-columns:repeat(8,40px);gap:6px;margin:10px 0;"></div>' +
      '<div class="flex-row">' +
      '<button id="lt-gc-sweep" class="primary-btn">Sweep</button>' +
      '<button id="lt-gc-reset" class="ghost-btn">Reset</button>' +
      '<span class="muted" id="lt-gc-status"></span>' +
      '</div>';
    var grid = container.querySelector('#lt-gc-grid');
    var status = container.querySelector('#lt-gc-status');
    var cells = [];
    function reset() {
      grid.innerHTML = '';
      cells = [];
      for (var i = 0; i < 32; i++) {
        var c = document.createElement('div');
        c.style.width = '40px'; c.style.height = '40px';
        c.style.background = 'var(--bg-3)';
        c.style.border = '1px solid var(--border)';
        c.style.borderRadius = '4px';
        c.style.cursor = 'pointer';
        c.style.display = 'flex';
        c.style.alignItems = 'center';
        c.style.justifyContent = 'center';
        c.style.fontFamily = 'var(--mono)';
        c.style.fontSize = '11px';
        c.textContent = 'obj' + i;
        c.dataset.marked = '0';
        c.addEventListener('click', function (e) {
          var el = e.currentTarget;
          if (el.dataset.dead === '1') return;
          if (el.dataset.marked === '1') {
            el.dataset.marked = '0';
            el.style.background = 'var(--bg-3)';
          } else {
            el.dataset.marked = '1';
            el.style.background = 'rgba(74,222,128,0.25)';
          }
        });
        grid.appendChild(c);
        cells.push(c);
      }
      status.textContent = 'click cells to mark reachable objects';
    }
    container.querySelector('#lt-gc-reset').addEventListener('click', reset);
    container.querySelector('#lt-gc-sweep').addEventListener('click', function () {
      var freed = 0, kept = 0;
      cells.forEach(function (c) {
        if (c.dataset.dead === '1') return;
        if (c.dataset.marked === '1') {
          kept++;
          c.dataset.marked = '0';
          c.style.background = 'var(--bg-3)';
        } else {
          freed++;
          c.dataset.dead = '1';
          c.style.background = 'rgba(248,113,113,0.15)';
          c.style.color = 'var(--bad)';
          c.textContent = '(freed)';
        }
      });
      status.textContent = 'swept: kept ' + kept + ', freed ' + freed;
    });
    reset();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>Which memory-management strategy can leak memory when two objects reference each other in a cycle, but no one outside the cycle holds a reference?</p>',
      mountInput: function (container) {
        var opts = [
          'manual (malloc/free)',
          'simple reference counting',
          'tracing GC',
          'Rust ownership'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Right. Each object in the cycle keeps the other one\'s refcount above zero, even though nothing outside the cycle reaches them. Pure refcounting cannot reclaim this. Hybrid systems (Python, CPython) add a cycle collector to handle it.' };
        if (v === '2') return { correct: false, feedback: 'Tracing GC starts from roots — it would not visit cycle objects with no path from a root, so they would be freed.' };
        return { correct: false, feedback: 'The trap of refcounting is its locality: each object only sees the count, not whether anything is reachable from a root.' };
      },
      hints: [
        'Reference counting is local: each object has a counter.',
        'In a cycle, each object\'s count includes the other one\'s reference, so neither hits zero.',
        'Pure refcounting leaks cycles. CPython adds a separate cycle detector.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>A garbage collector traces from "roots". Which of these is <b>not</b> typically a root?</p>',
      mountInput: function (container) {
        var opts = [
          'global variables',
          'values currently in CPU registers',
          'every object on the heap',
          'values on the call stack'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2') return { correct: true, feedback: 'Right. Roots are the OUTSIDE references: stack, registers, globals. Heap objects are what the GC is trying to traverse — they become reachable BECAUSE roots point at them (transitively).' };
        return { correct: false, feedback: 'A root is something the program can directly access without going through another heap object. Stack, registers, globals all qualify. Heap objects do not — they are what the GC is looking at.' };
      },
      hints: [
        'A root is an outside-the-heap reference to a heap object.',
        'Stack, registers, and globals all hold direct references.',
        'Heap objects are NOT roots — they are what the GC traverses.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Java\'s G1 garbage collector is <b>generational</b>. It separates objects into a "young generation" (recently allocated) and an "old generation" (long-lived). Why is this two-tier split a win?</p>',
      mountInput: function (container) {
        var opts = [
          'Old objects need bigger memory blocks, so they cannot mix with young ones.',
          'Most objects die young — collecting just the young gen reclaims a lot of memory cheaply, without scanning long-lived objects every time.',
          'Java requires it for thread safety.',
          'It avoids the need for unwind tables.'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Yes. The "weak generational hypothesis" — most objects die young — is one of the most reliable empirical observations in GC. Collecting the young gen is cheap and frees a lot. The old gen, where survivors accumulate, is collected far less often.' };
        return { correct: false, feedback: 'The reason is statistical, not architectural. Look for the answer about object lifetime distributions.' };
      },
      hints: [
        'Generational GC exploits an empirical observation about object lifetimes.',
        'The "weak generational hypothesis" says most allocated objects die very young.',
        'So you collect the young region often (cheap, high yield) and the old region rarely.'
      ]
    }
  ]
});
