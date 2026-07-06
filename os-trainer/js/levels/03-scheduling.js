// Level 3 — CPU scheduling
OST.registerLevel({
  id: 3,
  title: 'CPU Scheduling',
  whyItMatters: 'There are always more runnable tasks than CPUs. The scheduler picks who runs and for how long. Which algorithm runs determines whether your interactive app feels snappy or laggy, whether your batch job finishes in 2 min or 20.',
  glossary: ['scheduler', 'FCFS', 'SJF', 'RR', 'MLFQ', 'CFS', 'preemption', 'context switch'],
  learn: ''
    + '<h4>What the scheduler tries to optimize</h4>'
    + '<p>Multiple, sometimes-competing goals:</p>'
    + '<ul>'
    +   '<li><strong>Throughput</strong> — jobs completed per unit time.</li>'
    +   '<li><strong>Average wait time</strong> — how long jobs spend ready but not running.</li>'
    +   '<li><strong>Average turnaround</strong> — completion time minus arrival time.</li>'
    +   '<li><strong>Response time</strong> — time until a task FIRST runs (matters for interactive work).</li>'
    +   '<li><strong>Fairness</strong> — no task starves; share is roughly proportional.</li>'
    +   '<li><strong>Predictability</strong> — bounded latency; no surprise pauses.</li>'
    + '</ul>'
    + '<p>You can\'t optimize all simultaneously. Real schedulers pick a balance.</p>'

    + '<h4>Scheduler algorithms (the canonical four)</h4>'

    + '<h4>1. FCFS — First Come, First Served</h4>'
    + '<p>Simplest. Run jobs in arrival order; each runs to completion. Non-preemptive.</p>'
    + '<ul>'
    +   '<li>Pro: trivial; no overhead.</li>'
    +   '<li>Con: <strong>convoy effect</strong>. One long job blocks short ones. A 1-second job that arrived right after a 10-minute job waits 10 minutes.</li>'
    + '</ul>'

    + '<h4>2. SJF — Shortest Job First</h4>'
    + '<p>Always pick the ready job with the smallest CPU burst. Provably optimal for average wait time.</p>'
    + '<ul>'
    +   '<li>Pro: minimum average wait time (mathematically).</li>'
    +   '<li>Con: <strong>you don\'t know burst length in advance.</strong> SJF is theoretical; real schedulers approximate it.</li>'
    +   '<li>Con: long jobs can starve if short jobs keep arriving.</li>'
    + '</ul>'

    + '<h4>3. RR — Round Robin</h4>'
    + '<p>Each job gets a fixed time quantum (typical 10–100 ms). When quantum expires, job moves to back of queue.</p>'
    + '<ul>'
    +   '<li>Pro: fair; bounded response time.</li>'
    +   '<li>Tradeoff: small quantum → snappy but lots of context-switch overhead. Large quantum → degenerates into FCFS.</li>'
    + '</ul>'

    + '<h4>4. MLFQ — Multi-Level Feedback Queue</h4>'
    + '<p>Approximates SJF without knowing burst lengths. Multiple queues at descending priorities. New jobs start at top. If a job uses its full quantum, it drops a level (probably CPU-bound). If it yields early (probably I/O-bound), it stays high. Periodically bump everyone back up to prevent starvation.</p>'
    + '<p>Variants of MLFQ powered Unix schedulers for decades. Linux\'s O(1) scheduler (2003–2007) was MLFQ-flavored. The current Linux scheduler (CFS / EEVDF) is conceptually different — see below.</p>'

    + '<h4>Linux: CFS and EEVDF</h4>'
    + '<p>The <strong>Completely Fair Scheduler (CFS)</strong> tracks <code>vruntime</code> (virtual runtime) per task. Picks the task with smallest vruntime. "Niceness" weights how fast a task\'s vruntime advances. Implemented as a red-black tree; O(log N) pick.</p>'
    + '<p>Linux 6.6 (2023) replaced CFS with <strong>EEVDF (Earliest Eligible Virtual Deadline First)</strong>, which adds a "lag" concept that better handles latency-sensitive tasks.</p>'

    + '<h4>Worked example</h4>'
    + '<p>Three jobs: A arrives at t=0, burst=5. B arrives t=1, burst=3. C arrives t=2, burst=8.</p>'

    + '<h4>FCFS</h4>'
    + '<div class="terminal">'
    + 't:    0    5    8       16\n'
    + 'cpu:  AAAAA BBB CCCCCCCC\n'
    + '\n'
    + 'A: completion 5,  wait 0\n'
    + 'B: completion 8,  wait 4   (waited 0–1 to arrive, then 1–5 for A)\n'
    + 'C: completion 16, wait 6   (waited 0–2 to arrive, then 2–8 for A and B)\n'
    + 'avg wait = (0 + 4 + 6) / 3 = 3.33'
    + '</div>'

    + '<h4>SJF (non-preemptive)</h4>'
    + '<p>At t=0 only A is ready, so A runs. At t=5 both B (burst 3) and C (burst 8) are waiting; pick B. Then C.</p>'
    + '<div class="terminal">'
    + 't:    0    5    8       16\n'
    + 'cpu:  AAAAA BBB CCCCCCCC\n'
    + '\n'
    + 'Same Gantt as FCFS in this case! avg wait = 3.33\n'
    + '<span class="out">(SJF and FCFS coincide here because B/C only become ready after A finishes.)</span>'
    + '</div>'

    + '<h4>Round Robin (quantum = 2)</h4>'
    + '<div class="terminal">'
    + 't:  0  2  4  6  8 9 11 12 14 16\n'
    + 'cpu:AA BB CC AA B CC A  CC CC\n'
    + '\n'
    + 'avg wait ≈ 6  — fairer pickup of B early, but more context switches'
    + '</div>'

    + '<h4>What real systems use today</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>System</th><th>Scheduler</th><th>Notes</th></tr>'
    + '<tr><td>Linux</td><td>EEVDF (since 6.6, 2023)</td><td>Replaced CFS. Eligibility + virtual deadlines.</td></tr>'
    + '<tr><td>Windows</td><td>Multi-level priority queues</td><td>32 priority levels, preemptive.</td></tr>'
    + '<tr><td>macOS / iOS</td><td>Multi-level priority + GCD</td><td>QoS classes (UserInteractive → Background).</td></tr>'
    + '<tr><td>Embedded RTOS</td><td>Static priority + preemption</td><td>Predictable latency &gt; throughput.</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">"My batch job is slow when other people are using the box"</div>'
    + 'Run it under <code>nice -n 19 ./job</code> — high niceness = low priority = scheduled when others aren\'t. Or set realtime priority for the foreground task you care about: <code>chrt -r 50 ./video_player</code>. Don\'t set realtime on long-running batch, or you\'ll starve everything else.'
    + '</div>',

  mountPlay: function (container) {
    var os = OST.lib.os;
    container.innerHTML = '<p class="muted">Pick an algorithm. The Gantt chart and stats update.</p>';

    var jobs = [
      { id: 'A', arrival: 0, burst: 5 },
      { id: 'B', arrival: 1, burst: 3 },
      { id: 'C', arrival: 2, burst: 8 }
    ];

    var algSel = document.createElement('select');
    [['fcfs','FCFS'],['sjf','SJF (non-preemptive)'],['rr2','Round Robin (q=2)'],['rr4','Round Robin (q=4)']].forEach(function (a) {
      var o = document.createElement('option'); o.value=a[0]; o.textContent=a[1]; algSel.appendChild(o);
    });
    var output = document.createElement('div'); output.className = 'formula-box';

    var palette = { 'A':'#7ab7ff', 'B':'#a78bfa', 'C':'#4ade80', 'idle':'#3a4256' };

    function update() {
      var r, label;
      if (algSel.value === 'fcfs') { r = os.fcfs(jobs); label = 'FCFS'; }
      else if (algSel.value === 'sjf') { r = os.sjfNonPreemptive(jobs); label = 'SJF (non-preemptive)'; }
      else if (algSel.value === 'rr2') { r = os.roundRobin(jobs, 2); label = 'Round Robin (q=2)'; }
      else { r = os.roundRobin(jobs, 4); label = 'Round Robin (q=4)'; }

      var totalT = r.gantt[r.gantt.length - 1].end;
      var html = '<div class="info-line"><span class="key">Algorithm:</span> <span class="val">' + label + '</span></div>';
      html += '<div class="gantt">';
      r.gantt.forEach(function (g) {
        var width = ((g.end - g.start) / totalT * 100);
        var color = palette[g.id] || '#666';
        var cls = g.id === 'idle' ? 'slot idle' : 'slot';
        html += '<div class="' + cls + '" style="background:' + (g.id==='idle'?'':color) + ';flex:' + width.toFixed(2) + ' 1 0;">' + g.id + '</div>';
      });
      html += '</div>';
      html += '<div class="gantt-axis">';
      var ticks = [];
      r.gantt.forEach(function (g) { ticks.push(g.start); });
      ticks.push(totalT);
      ticks.forEach(function (t) {
        html += '<div class="tick" style="flex:1">t=' + t + '</div>';
      });
      html += '</div>';

      var ids = Object.keys(r.stats);
      html += '<div class="info-line"><span class="key">Per-job stats:</span></div>';
      ids.forEach(function (id) {
        var s = r.stats[id];
        html += '<div class="info-line">&nbsp;&nbsp;<span class="key">' + id + ':</span> <span class="val">completion=' + s.completion + ', turnaround=' + s.turnaround + ', wait=' + s.wait + '</span></div>';
      });
      html += '<div class="info-line"><span class="key">Average wait:</span> <span class="val"><span class="result">' + (Math.round(os.avgWait(r.stats) * 100) / 100) + '</span></span></div>';
      output.innerHTML = html;
    }
    algSel.addEventListener('change', update);
    var row = document.createElement('div'); row.className='controls-row';
    var lbl = document.createElement('label'); lbl.appendChild(document.createTextNode('Algorithm: ')); lbl.appendChild(algSel);
    row.appendChild(lbl);
    container.appendChild(row);
    var info = document.createElement('div'); info.className = 'info-line muted'; info.textContent = 'Jobs: A(arrival=0, burst=5), B(arrival=1, burst=3), C(arrival=2, burst=8)';
    container.appendChild(info);
    container.appendChild(output);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Three jobs all arrive at t=0 with bursts: A=10, B=2, C=4. Under non-preemptive SJF, what is the average wait time?',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.step='0.01'; inp.placeholder='avg wait';
        c.appendChild(inp);
        return function () { return parseFloat(inp.value); };
      },
      check: function (v) {
        // SJF order: B(2) → C(4) → A(10).
        // B waits 0, completion 2.
        // C waits 2, completion 6.
        // A waits 6, completion 16.
        // avg wait = (0 + 2 + 6) / 3 = 8/3 ≈ 2.67
        if (Math.abs(v - 2.67) <= 0.05 || Math.abs(v - (8/3)) < 0.05) return { correct: true, feedback: 'Right. SJF picks shortest first: B(2) → C(4) → A(10). Waits: B=0, C=2, A=6. Average = 8/3 ≈ 2.67. Compare to FCFS in arrival order (assuming alphabetical): A=0, B=10, C=12 → avg 22/3 ≈ 7.33 — SJF is dramatically better.' };
        return { correct: false, feedback: 'SJF order: B(2)→C(4)→A(10). Waits: 0, 2, 6. Average = 8/3 ≈ 2.67.' };
      },
      hints: [
        'SJF picks shortest job first. So order is B → C → A.',
        'B waits 0, C waits until B done (2), A waits until both done (6).',
        '(0+2+6)/3 = 2.67.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A team finds their interactive shell feels laggy on a busy server. The OS uses RR with a 200 ms quantum. They consider lowering it to 1 ms "for snappier response." What\'s the trade-off?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>1 ms is better — always faster</option>' +
          '<option>1 ms gives better worst-case response time, but context-switch overhead per second goes up dramatically (potentially 1000+ switches/sec/CPU). At some point most CPU time is spent context-switching, not running jobs. The right answer is "balance" — typical OS quanta are ~1–100 ms.</option>' +
          '<option>1 ms breaks the kernel — it requires nanosecond-precision timers</option>' +
          '<option>1 ms causes deadlock</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('1 ms gives better worst-case response time') === 0) return { correct: true, feedback: 'Right. Quantum ↓ = response time ↓ but context-switch frequency ↑. A context switch costs ~1–10 µs of CPU time + cache/TLB pollution. At 1 ms quantum with 100 active tasks: 1000 switches/sec/CPU = 1–10 ms/sec just on switching, plus indirect costs from cache misses. Typical OS quanta land at 1–100 ms specifically to balance these. Tuning narrowly for "interactive feel" is exactly what schedulers like CFS/MLFQ do automatically — they boost interactive tasks (low CPU usage between sleeps) without forcing tiny quanta system-wide.' };
        return { correct: false, feedback: 'Smaller quantum = better response BUT more context-switch overhead. Real schedulers find a balance (1–100 ms typical) and use heuristics to favor interactive tasks.' };
      },
      hints: [
        'Quantum size is a trade-off. What gets worse as quantum shrinks?',
        'Context-switch frequency. Each switch is ~µs of overhead + cache pollution.',
        'Trade-off between response time and switching overhead.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A real-time video transcoder runs on a server alongside web servers and batch jobs. The video must encode at 30 fps (33 ms per frame). What scheduling policy should the transcoder use, and what risk does that create for the rest of the system?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Use SCHED_FIFO real-time priority — the transcoder always preempts SCHED_OTHER tasks. Risk: if it ever spins (bug, deadlock) it starves everything; needs careful CPU-affinity / cgroup limits to bound damage.</option>' +
          '<option>Use nice -n -20 — same as real-time</option>' +
          '<option>Run on a separate machine — no risk</option>' +
          '<option>Use SCHED_OTHER with higher niceness</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Use SCHED_FIFO real-time priority') === 0) return { correct: true, feedback: 'Right. SCHED_FIFO and SCHED_RR are Linux\'s real-time policies — they preempt all SCHED_OTHER tasks regardless of fairness. Required for tight-deadline workloads (video, audio, robotics). The risk: an RT task in an infinite loop or with priority inversion can monopolize the CPU, locking out the rest of the system. Mitigations: <code>kernel.sched_rt_runtime_us = 950000</code> (kernel will throttle RT to 95% to leave 5% for SCHED_OTHER); CPU pinning to a subset of cores; cgroup CPU shares as a backup. Niceness alone (SCHED_OTHER) doesn\'t guarantee preemption — fine for relative priority, not for hard deadlines.' };
        if (v === 'Use nice -n -20 — same as real-time') return { correct: false, feedback: 'Negative niceness gives priority within SCHED_OTHER but doesn\'t preempt other normal tasks unconditionally. Insufficient for hard real-time deadlines.' };
        if (v === 'Run on a separate machine — no risk') return { correct: false, feedback: 'Solves the problem by not co-locating; question asked about the trade-offs of co-locating with RT priority.' };
        if (v === 'Use SCHED_OTHER with higher niceness') return { correct: false, feedback: 'See above; niceness alone doesn\'t guarantee real-time preemption.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'For hard deadlines you need PREEMPTION over normal tasks. What scheduling class does that?',
        'SCHED_FIFO / SCHED_RR. They preempt SCHED_OTHER unconditionally.',
        'Risk: starvation. Mitigations: rt-throttling, CPU pinning.'
      ]
    }
  ]
});
