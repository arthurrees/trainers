// Level 11 — Deadlock
OST.registerLevel({
  id: 11,
  title: 'Deadlock',
  whyItMatters: 'Deadlocks are concurrency bugs that don\'t manifest as wrong answers — they manifest as nothing happening. Programs hang; threads stay in "waiting." Knowing the four conditions and the canonical patterns to break them prevents 90% of these bugs at design time.',
  glossary: ['deadlock', 'mutex'],
  learn: ''
    + '<h4>The Coffman conditions</h4>'
    + '<p>A deadlock requires ALL FOUR simultaneously. Break any one → no deadlock possible.</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Condition</th><th>What it means</th><th>How to break</th></tr>'
    + '<tr><td>1. Mutual exclusion</td><td>Some resource is non-shareable (only one holder at a time).</td><td>Make resources shareable (rare; usually inherent).</td></tr>'
    + '<tr><td>2. Hold and wait</td><td>A thread holds resources while waiting to acquire more.</td><td>Acquire all resources atomically (try-lock-all-or-release-all).</td></tr>'
    + '<tr><td>3. No preemption</td><td>Resources can\'t be forcibly taken from the holder.</td><td>Allow preemption / time-out lock acquisition.</td></tr>'
    + '<tr><td>4. Circular wait</td><td>Two or more threads form a cycle: A waits for B, B waits for A.</td><td>Impose a global lock-acquisition order.</td></tr>'
    + '</table>'

    + '<h4>The minimum example</h4>'
    + '<div class="terminal">'
    + '<span class="out">// Thread 1:</span>\n'
    + 'lock(A);\n'
    + 'lock(B);    <span class="bad">// blocks if Thread 2 holds B</span>\n'
    + '\n'
    + '<span class="out">// Thread 2:</span>\n'
    + 'lock(B);\n'
    + 'lock(A);    <span class="bad">// blocks if Thread 1 holds A</span>'
    + '</div>'
    + '<p>Both threads grab their first lock simultaneously, then forever wait for the other\'s lock. Classic AB-BA deadlock.</p>'

    + '<h4>The lock-ordering fix</h4>'
    + '<p>Impose a global ordering: "always acquire A before B." Now both threads ask for A first; one gets it, the other waits — no deadlock.</p>'
    + '<p>Locks can be ordered by:</p>'
    + '<ul>'
    +   '<li>Address (lock with smaller address first).</li>'
    +   '<li>A documented hierarchy ("user lock → account lock → transaction lock").</li>'
    +   '<li>Lock IDs assigned at creation.</li>'
    + '</ul>'

    + '<h4>Detection vs avoidance vs prevention</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Strategy</th><th>How</th><th>Used in</th></tr>'
    + '<tr><td>Prevention</td><td>Design so deadlock is impossible (lock ordering, single-lock systems).</td><td>Most well-designed software.</td></tr>'
    + '<tr><td>Avoidance</td><td>Runtime check: don\'t grant a lock if it could lead to deadlock (Banker\'s algorithm).</td><td>Mostly textbook; rare in practice.</td></tr>'
    + '<tr><td>Detection + recovery</td><td>Periodically check the lock graph for cycles; if found, kill or roll back a victim.</td><td>Database engines (Postgres, MySQL InnoDB) — they detect deadlocks and abort one transaction.</td></tr>'
    + '<tr><td>Time-out</td><td>If <code>lock(timeout)</code> waits too long, give up and unwind.</td><td>Java <code>tryLock</code>, Go <code>context</code>-aware locks.</td></tr>'
    + '<tr><td>Ostrich algorithm</td><td>Pretend it can\'t happen.</td><td>Lots of production systems. (Restart when it does.)</td></tr>'
    + '</table>'

    + '<h4>The dining philosophers</h4>'
    + '<p>Five philosophers around a table; five chopsticks (one between each pair); each needs both adjacent chopsticks to eat. Each philosopher: pick up left chopstick, then right, eat, put down both.</p>'
    + '<p>If all simultaneously pick up their left chopstick, all wait forever for their right. Classic deadlock.</p>'
    + '<p>Solutions:</p>'
    + '<ul>'
    +   '<li>One philosopher picks up RIGHT first (breaks circular wait).</li>'
    +   '<li>Number chopsticks; always pick up lower-numbered first (lock ordering).</li>'
    +   '<li>Limit to N-1 philosophers picking up at once (limits concurrency).</li>'
    +   '<li>Pick up both atomically (breaks hold-and-wait).</li>'
    + '</ul>'

    + '<h4>Database deadlocks</h4>'
    + '<p>Common in transactional systems. Two transactions update rows in different orders → cycle. Postgres / MySQL InnoDB detect this and abort one with "deadlock detected; one of the transactions has been chosen as the victim." Application is expected to retry.</p>'

    + '<h4>Livelock — the sneaky cousin</h4>'
    + '<p>Threads aren\'t blocked — they\'re actively running — but make no progress. Imagine two people trying to pass in a hallway, each stepping aside in the same direction, repeatedly. No progress. Solutions: random backoff, priority-based tie-breakers.</p>'

    + '<h4>Priority inversion</h4>'
    + '<p>High-priority task waits for a lock held by a low-priority task. Medium-priority tasks preempt the low one, so the high-priority task is blocked indirectly by mediums. Mars Pathfinder hit this in 1997; fix is "priority inheritance" — the lock-holder temporarily inherits the priority of its highest-priority waiter.</p>'

    + '<div class="callout"><div class="label">"My program is hung — is it deadlocked?"</div>'
    + '<code>strace -p PID</code> shows it\'s in <code>futex_wait</code>. <code>cat /proc/&lt;pid&gt;/task/*/stack</code> shows the kernel stack of each thread. <code>gdb -p PID</code> + <code>thread apply all bt</code> shows the userspace stacks. If two threads are each in mutex acquisition for the OTHER\'s lock — deadlock confirmed. Helgrind (Valgrind tool) and ThreadSanitizer detect potential deadlocks (lock-order violations) at runtime, often before they actually happen.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Two threads each need locks A and B. Pick acquisition orders. See whether deadlock can happen.</p>';

    var state = { t1Order: 'AB', t2Order: 'BA' };
    var t1Sel = document.createElement('select'); t1Sel.innerHTML = '<option>AB</option><option>BA</option>'; t1Sel.value = 'AB';
    var t2Sel = document.createElement('select'); t2Sel.innerHTML = '<option>AB</option><option>BA</option>'; t2Sel.value = 'BA';
    var output = document.createElement('div'); output.className = 'formula-box';

    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    var row = document.createElement('div'); row.className='controls-row';
    row.appendChild(lbl('Thread 1 acquires:', t1Sel));
    row.appendChild(lbl('Thread 2 acquires:', t2Sel));

    function update() {
      state.t1Order = t1Sel.value; state.t2Order = t2Sel.value;
      var possible = state.t1Order !== state.t2Order;
      output.innerHTML =
        '<div class="info-line"><span class="key">Thread 1:</span> <span class="val">lock(' + state.t1Order[0] + '); lock(' + state.t1Order[1] + ');</span></div>' +
        '<div class="info-line"><span class="key">Thread 2:</span> <span class="val">lock(' + state.t2Order[0] + '); lock(' + state.t2Order[1] + ');</span></div>' +
        '<div class="info-line"><span class="key">Deadlock possible?</span> <span class="val"><span class="result" style="color:var(--' + (possible ? 'bad' : 'good') + ')">' + (possible ? 'YES — circular wait can form' : 'NO — same lock order eliminates circular wait') + '</span></span></div>' +
        '<div class="info-line muted">' + (possible
          ? 'Sequence to deadlock: T1 acquires ' + state.t1Order[0] + ', preemption, T2 acquires ' + state.t2Order[0] + '. Now T1 wants ' + state.t1Order[1] + ' (held by T2), T2 wants ' + state.t2Order[1] + ' (held by T1). Forever.'
          : 'Both threads ask for the same lock first. Whoever gets it proceeds. No cycle possible.') + '</div>';
    }
    [t1Sel, t2Sel].forEach(function (e) { e.addEventListener('change', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Two threads are stuck. <code>strace</code> on both shows them in <code>futex_wait</code> on different addresses. <code>gdb</code> shows T1 holding lock A, waiting for B; T2 holding B, waiting for A. Which Coffman condition would breaking solve this?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Mutual exclusion</option>' +
          '<option>Hold and wait</option>' +
          '<option>Circular wait — impose a global lock order</option>' +
          '<option>None — this is normal behavior</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Circular wait — impose a global lock order') return { correct: true, feedback: 'Right. The cleanest, simplest fix: always acquire locks in a globally-defined order. With "A always before B," thread that gets A first wins; the other waits for A — no deadlock. Other Coffman conditions can also be broken (try-lock with timeout breaks "no preemption"; bulk acquisition breaks "hold and wait") but lock-ordering is the standard prevention.' };
        return { correct: false, feedback: 'Lock-ordering is the canonical fix for AB-BA deadlocks. It breaks "circular wait."' };
      },
      hints: [
        'There\'s a cycle: T1 → B → T2 → A → T1.',
        'Cycle = circular wait (Coffman #4).',
        'Impose lock ordering: always A before B.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Postgres reports "ERROR: deadlock detected" on a transaction in your app and rolls it back. What\'s the correct response in the application?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Crash the app</option>' +
          '<option>Catch the error and retry the transaction (likely with a small backoff). Postgres detects deadlocks routinely; one transaction is chosen as victim and rolled back. Retrying usually succeeds because the conflicting transaction has now committed.</option>' +
          '<option>Disable Postgres deadlock detection</option>' +
          '<option>Add more connections</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Catch the error and retry') === 0) return { correct: true, feedback: 'Right. Postgres deadlock detection is a feature: it picks a victim, rolls it back, and surfaces the error so the app can retry. Common app-side patterns: a generic retry-on-deadlock decorator with exponential backoff and a small retry limit. Long-term: review the offending code path for inconsistent lock ordering (often "update rows in random order" instead of always-by-PK).' };
        return { correct: false, feedback: 'Postgres handles deadlock detection for you; the app\'s job is to retry. Long-term fix: enforce consistent lock ordering in the SQL.' };
      },
      hints: [
        'Postgres has already done the hard part (detected + chose victim).',
        'Your app\'s job: retry.',
        'Catch + retry with backoff.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Three threads, three resources. T1 holds R1, wants R2. T2 holds R2, wants R3. T3 holds R3, wants R1. Is this a deadlock, and what\'s the cycle structure?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Yes — 3-thread cycle T1→T2→T3→T1. All four Coffman conditions are met. None can progress.</option>' +
          '<option>No — only 2-thread cycles count as deadlock</option>' +
          '<option>No — Postgres would detect this</option>' +
          '<option>Yes, but only at full moon</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Yes — 3-thread cycle') === 0) return { correct: true, feedback: 'Right. Deadlock can involve any number of threads in a cycle. Detection algorithms model the wait-for graph and look for ANY cycle. Real-world: distributed systems can deadlock across machines (transaction coordinators, two-phase locking) — same Coffman conditions apply at scale. The canonical fix is still "global ordering of resources" — number them and always acquire low-to-high.' };
        if (v === 'No — only 2-thread cycles count as deadlock') return { correct: false, feedback: 'Cycles of any length are deadlocks. The 2-thread case is just the most common.' };
        if (v === 'No — Postgres would detect this') return { correct: false, feedback: 'Postgres detects deadlocks WITHIN a Postgres instance; arbitrary cycles in any synchronization scheme can occur regardless.' };
        return { correct: false, feedback: 'Yes, this is a 3-cycle deadlock.' };
      },
      hints: [
        'Trace the wait-for graph: T1 waits for R2 (held by T2), T2 waits for R3 (held by T3), T3 waits for R1 (held by T1).',
        'Closed cycle = deadlock.',
        'Yes, deadlock with a 3-thread cycle.'
      ]
    }
  ]
});
