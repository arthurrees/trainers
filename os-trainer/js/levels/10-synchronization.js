// Level 10 — Synchronization
OST.registerLevel({
  id: 10,
  title: 'Synchronization Primitives',
  whyItMatters: 'When two threads share data, you need synchronization. Knowing what mutexes, semaphores, condition variables, and atomics each do — and when each is appropriate — is the difference between concurrent code that works and concurrent code with subtle data races that show up in production at 3 AM.',
  glossary: ['race condition', 'mutex', 'semaphore', 'CV', 'atomic'],
  learn: ''
    + '<h4>The fundamental problem</h4>'
    + '<p>Multiple threads access shared state. <strong>Atomicity</strong> matters: a "single" operation in the source code might be multiple instructions, and the OS can interrupt anywhere.</p>'
    + '<p><code>counter++;</code> compiles to roughly:</p>'
    + '<div class="terminal">'
    + 'mov   eax, [counter]   ; load\n'
    + 'add   eax, 1           ; increment\n'
    + 'mov   [counter], eax   ; store'
    + '</div>'
    + '<p>Two threads can interleave between any of these. T1 loads 5, T2 loads 5, T1 stores 6, T2 stores 6 → "6" instead of "7". <strong>Lost update</strong>.</p>'

    + '<h4>The toolbox</h4>'

    + '<h4>Mutex (mutual-exclusion lock)</h4>'
    + '<p>One thread at a time can hold the mutex. Others block in <code>lock()</code>. Pattern:</p>'
    + '<div class="terminal">'
    + 'pthread_mutex_lock(&amp;m);\n'
    + '<span class="hi">// critical section: shared state safe to touch</span>\n'
    + 'pthread_mutex_unlock(&amp;m);'
    + '</div>'
    + '<p>Common mistakes:</p>'
    + '<ul>'
    +   '<li>Forgetting to unlock on an error path → permanent deadlock. RAII (C++) and <code>defer</code> (Go) prevent this.</li>'
    +   '<li>Holding the lock across a long operation → contention.</li>'
    +   '<li>Recursive lock attempt by same thread → deadlock (with default mutex; recursive mutexes opt in).</li>'
    + '</ul>'

    + '<h4>Semaphore</h4>'
    + '<p>A counter with <code>wait()</code> (decrement, block if 0) and <code>post()</code> (increment, wake one waiter). Two flavors:</p>'
    + '<ul>'
    +   '<li><strong>Counting semaphore</strong> — limit concurrent access to N resources. "Allow up to 10 in-flight DB connections."</li>'
    +   '<li><strong>Binary semaphore</strong> (count 0 or 1) — like a mutex but with looser ownership semantics; any thread can post.</li>'
    + '</ul>'

    + '<h4>Condition variable (CV)</h4>'
    + '<p>For "wait until some condition becomes true." Always paired with a mutex.</p>'
    + '<div class="terminal">'
    + '<span class="out">// Consumer:</span>\n'
    + 'pthread_mutex_lock(&amp;m);\n'
    + 'while (queue_empty()) pthread_cond_wait(&amp;cv, &amp;m);\n'
    + '<span class="hi">item = dequeue();</span>\n'
    + 'pthread_mutex_unlock(&amp;m);\n'
    + '\n'
    + '<span class="out">// Producer:</span>\n'
    + 'pthread_mutex_lock(&amp;m);\n'
    + '<span class="hi">enqueue(item);</span>\n'
    + 'pthread_cond_signal(&amp;cv);\n'
    + 'pthread_mutex_unlock(&amp;m);'
    + '</div>'
    + '<p><code>cond_wait()</code> atomically: releases the mutex, sleeps until signal, reacquires the mutex on wake. The <strong>while loop</strong> (not if) is essential — spurious wakeups are real, and even genuine signals can race with another thread emptying the queue.</p>'

    + '<h4>Atomic operations</h4>'
    + '<p>Hardware-supported indivisible operations on small data. Compare-and-swap (CAS) is the foundation:</p>'
    + '<div class="terminal">'
    + 'bool cas(int *ptr, int expected, int new) {\n'
    + '    if (*ptr == expected) { *ptr = new; return true; }\n'
    + '    return false;\n'
    + '}'
    + '</div>'
    + '<p>Implemented as a single instruction on most CPUs (<code>lock cmpxchg</code> on x86, LL/SC on ARM). Building blocks for lock-free data structures, atomic counters, futex implementations.</p>'
    + '<p>C: <code>__atomic_*</code> / <code>stdatomic.h</code>. C++: <code>std::atomic</code>. Java: <code>AtomicInteger</code>. Go: <code>sync/atomic</code>. Rust: <code>std::sync::atomic</code>.</p>'

    + '<h4>Read-write lock</h4>'
    + '<p>Many readers OR one writer. Useful when reads vastly outnumber writes (config caches, lookup tables).</p>'
    + '<p>Caveats: writer can starve under continuous reads (depending on implementation). RCU (Read-Copy-Update, used heavily in the Linux kernel) is a more sophisticated read-mostly primitive.</p>'

    + '<h4>Spinlock</h4>'
    + '<p>A lock that <strong>busy-waits</strong> instead of sleeping. <code>while (!try_lock()) { /* spin */ }</code>. Use cases:</p>'
    + '<ul>'
    +   '<li>Critical sections that are EXTREMELY short (a few instructions).</li>'
    +   '<li>Inside the kernel where you can\'t sleep (interrupt handlers).</li>'
    + '</ul>'
    + '<p>Userspace mutexes are usually adaptive: spin briefly (fast path for cheap contention), then fall back to a futex-based sleep (slow path).</p>'

    + '<h4>How userspace mutexes really work: futex</h4>'
    + '<p>Modern Linux mutexes use the <code>futex</code> ("fast userspace mutex") syscall. The fast path is an atomic CAS on a userspace word — no syscall. Only on contention does the thread make a <code>futex_wait()</code> syscall to sleep. This is why uncontended locks are nearly free.</p>'

    + '<h4>Lock-free and wait-free</h4>'
    + '<p><strong>Lock-free</strong>: at least one thread makes progress; no deadlock. <strong>Wait-free</strong>: every thread makes progress in bounded steps. Implemented with atomics; common in concurrent queues, hash tables, allocators.</p>'
    + '<p>Lock-free isn\'t automatically faster than locks — it\'s about progress guarantees. For most apps, "use a well-designed lock" is the simpler win.</p>'

    + '<h4>Memory ordering — the brain-melter</h4>'
    + '<p>CPUs reorder instructions for performance. Without explicit ordering constraints, two threads can disagree on the ORDER of writes to memory. Languages provide memory-ordering levels (acquire, release, sequentially-consistent) for atomics. Most code that uses mutexes never thinks about this — locks include the right barriers automatically.</p>'

    + '<div class="callout"><div class="label">When in doubt, lock</div>'
    + 'Lock-free programming is hard. The standard library locks are fast on the uncontended path. "Premature lock-free" is a real anti-pattern. Profile first, locks are the fix far more often than the problem.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Simulate two threads incrementing a shared counter. With locking they always reach 2N. Without, you see lost updates.</p>';

    var state = { counter: 0, withLock: false };

    var btn1 = document.createElement('button'); btn1.className='secondary-btn'; btn1.textContent='Run 100,000 increments × 2 threads (no lock)';
    var btn2 = document.createElement('button'); btn2.className='secondary-btn'; btn2.textContent='Run 100,000 increments × 2 threads (WITH lock)'; btn2.style.marginLeft='8px';
    var output = document.createElement('div'); output.className = 'formula-box';

    function simulate(withLock) {
      // Simulate the race: 100K ops × 2 threads, randomized interleave
      var counter = 0;
      var N = 10000;
      // No-lock model: each op is read-mod-write; if two threads both read at same step, one update is lost.
      // We'll model it stochastically: with probability p_collision = (1 / 2N) per op (very rough), lose an update.
      if (withLock) {
        counter = 2 * N;
        var lockSyscalls = Math.floor(N * 0.05); // ~5% of ops contend → futex wait
        output.innerHTML =
          '<div class="info-line"><span class="key">Final counter:</span> <span class="val"><span class="result" style="color:var(--good)">' + counter + '</span> (expected ' + (2*N) + ')</span></div>' +
          '<div class="info-line"><span class="key">~Estimated futex syscalls (contention):</span> <span class="val">' + lockSyscalls + '</span></div>' +
          '<div class="info-line muted">Lock guarantees no lost updates. ~5% of ops contend → futex_wait syscall.</div>';
      } else {
        // Simulate ~5–15% lost updates depending on interleave
        var loss = Math.floor(N * (0.05 + Math.random() * 0.1));
        counter = 2 * N - loss;
        output.innerHTML =
          '<div class="info-line"><span class="key">Final counter:</span> <span class="val"><span class="result" style="color:var(--bad)">' + counter + '</span> (expected ' + (2*N) + ')</span></div>' +
          '<div class="info-line"><span class="key">Lost updates:</span> <span class="val">' + loss + '</span></div>' +
          '<div class="info-line muted">Each "missing" count is a race window where two threads read, both wrote back the same incremented value.</div>';
      }
    }

    btn1.addEventListener('click', function () { simulate(false); });
    btn2.addEventListener('click', function () { simulate(true); });
    container.appendChild(btn1);
    container.appendChild(btn2);
    container.appendChild(document.createElement('br'));
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You need to ensure ONLY ONE thread enters a critical section at a time. Which primitive is the natural choice?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Mutex</option><option>Counting semaphore</option><option>Condition variable alone</option><option>Atomic add</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Mutex') return { correct: true, feedback: 'Right. Mutex = "mutual exclusion." A binary semaphore (initial value 1) achieves the same thing but lacks the ownership semantics that make mutexes safer (only the locker should unlock; semaphores allow any thread to post).' };
        if (v === 'Counting semaphore') return { correct: false, feedback: 'Useful for "up to N can enter" — for N=1 specifically it\'d work, but mutex is the idiom and gives ownership semantics.' };
        return { correct: false, feedback: 'Single-occupancy → mutex.' };
      },
      hints: ['Mutex.', 'Mutual exclusion = mutex.', 'Mutex.']
    },
    {
      difficulty: 'medium',
      prompt: 'A producer-consumer queue uses a mutex + condition variable. The consumer code is: <code>lock(); if (queue_empty()) wait(); item = dequeue(); unlock();</code>. What\'s the bug?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Use of `if` instead of `while`. CV waits can wake spuriously, and even on a real signal, another consumer could have grabbed the item between signal and wake. Re-check the predicate in a loop: <code>while (queue_empty()) wait();</code></option>' +
          '<option>Should use a semaphore instead</option>' +
          '<option>Need to unlock before wait()</option>' +
          '<option>It\'s correct</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Use of `if` instead of `while`') === 0) return { correct: true, feedback: 'Right. Three reasons to loop, not branch: (1) spurious wakeups (POSIX permits cond_wait to return without a real signal); (2) "thundering herd" — one signal wakes all waiters but only one will get the item; (3) signal+predicate races. The classic line: "always re-check the predicate." pthreads docs explicitly require this.' };
        return { correct: false, feedback: 'The bug is using `if`. CV waits should always be in a `while` loop re-checking the predicate.' };
      },
      hints: [
        'There\'s a famous rule about how to use cond_wait.',
        'Always check the predicate in a LOOP, not an IF.',
        'Replace `if` with `while`.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A data structure has 99% reads, 1% writes. The team uses a single mutex for all access. They notice high contention. List the optimizations that would actually help (mark TRUE for ones that\'d be effective).',
      mountInput: function (c) {
        var items = [
          { label: 'Switch to a read-write lock — readers don\'t block each other',                                                       t: true },
          { label: 'Use atomic operations on a per-field basis (where the data structure permits) — bypass the lock entirely on read paths', t: true },
          { label: 'Use RCU-style copy-on-write — readers see a consistent snapshot without any lock',                                    t: true },
          { label: 'Add more mutexes',                                                                                                       t: false },
          { label: 'Switch to spinlocks (always spin, never sleep)',                                                                         t: false },
          { label: 'Shard the data — separate locks for separate keys (works well for hashmaps)',                                           t: true }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. Read-mostly workloads benefit from: RW locks (parallel reads), atomics (lock-free reads where possible), RCU (snapshot semantics, used heavily in the Linux kernel), and sharding (multiple locks for parallelizable structures). "Add more mutexes" alone doesn\'t reduce contention. "Switch to spinlocks" can WORSEN it for long-held locks (you burn CPU spinning). The right architecture for read-heavy is "make reads non-blocking."' };
        return { correct: false, feedback: 'Re-check: RW locks, atomics, RCU, and sharding all help read-heavy workloads. Generic spinlocks and "more mutexes" don\'t.' };
      },
      hints: [
        '99% reads = make reads not block each other.',
        'RW locks, atomics, RCU, sharding.',
        'Skip "spinlock" (only for very short critical sections) and "more mutexes" (doesn\'t reduce contention by itself).'
      ]
    }
  ]
});
