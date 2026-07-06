// Level 12 — Bottlenecks
HWT.registerLevel({
  id: 12,
  title: 'Bottlenecks & Balancing',
  whyItMatters: 'Every PC has a bottleneck. The question is whether the bottleneck is in the right place — meaning the most expensive component is the busy one. This level teaches you to read utilization data and make intelligent upgrade decisions instead of buying the part with the biggest number.',
  glossary: ['bottleneck', 'utilization', 'CPU', 'GPU', 'RAM'],
  learn: ''
    + '<h4>The fundamental rule</h4>'
    + '<p>The bottleneck of a system is whichever component is at <strong>~99% utilization</strong> while the others have headroom. The reason: utilization clusters at saturation. A non-bottlenecked component can\'t go above what it\'s being asked to do.</p>'
    + '<p>Diagnosing a bottleneck = looking at every component\'s utilization while the workload runs and finding the one pegged.</p>'

    + '<h4>Diagnostic stack</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Component</th><th>Tool to watch</th><th>"Bottleneck" indicator</th></tr>'
    + '<tr><td>CPU</td><td>Task Manager / btop / HWInfo</td><td>One or more cores at ~100%</td></tr>'
    + '<tr><td>GPU</td><td>nvidia-smi / GPU-Z / Task Manager Performance</td><td>"GPU utilization" 95+%; framerate locked</td></tr>'
    + '<tr><td>RAM</td><td>Task Manager Memory tab</td><td>"In use" near max + "Committed" exceeding RAM = paging</td></tr>'
    + '<tr><td>Storage</td><td>Task Manager Disk / iotop</td><td>"Active time" 100%; tasks stalled in iowait</td></tr>'
    + '<tr><td>Network</td><td>Task Manager Ethernet / iftop</td><td>Link at line rate</td></tr>'
    + '</table>'

    + '<h4>Workload archetypes and their bottlenecks</h4>'
    + '<ul>'
    +   '<li><strong>Gaming at 1080p, high frame rate:</strong> CPU-bound. The GPU finishes frames before the CPU can submit the next. Solution: faster CPU (more IPC, more cache) or higher resolution to shift load to GPU.</li>'
    +   '<li><strong>Gaming at 4K:</strong> GPU-bound. CPU is comfortably below 50%. Upgrade GPU or accept lower settings.</li>'
    +   '<li><strong>Compiling code (gcc/clang/rustc):</strong> mostly CPU-bound, with bursts of disk IO. More cores help if the build parallelizes; otherwise IPC matters.</li>'
    +   '<li><strong>Pandas/numpy data work:</strong> usually single-thread CPU-bound. RAM bandwidth matters too. More cores rarely help.</li>'
    +   '<li><strong>Training a small NN on GPU:</strong> GPU-bound (compute or memory bandwidth). CPU just feeds data.</li>'
    +   '<li><strong>Loading a game / opening a project:</strong> storage-bound (random IO, lots of small files). NVMe slays HDD here.</li>'
    +   '<li><strong>Streaming game with OBS:</strong> might be CPU-bound (software encoder) or GPU-bound (depending on how busy the GPU is with the game).</li>'
    +   '<li><strong>Running a 13B LLM on consumer GPU:</strong> VRAM-capacity-bound first; once it fits, memory-bandwidth-bound.</li>'
    + '</ul>'

    + '<h4>The "balanced build" idea</h4>'
    + '<p>"Balanced" doesn\'t mean every part is the same tier — it means no single part is so weak that it caps the rest by 30+% on your typical workload. Examples of imbalance for "1440p gaming" workload:</p>'
    + '<ul>'
    +   '<li>RTX 4090 + i3-12100F + 8 GB DDR4: imbalanced. CPU and RAM bottleneck a $1600 GPU.</li>'
    +   '<li>RTX 4060 + i9-14900K + 64 GB DDR5: imbalanced. CPU sits at 30% utilization, GPU is the cap.</li>'
    +   '<li>RTX 4070 + Ryzen 5 7600 + 32 GB DDR5: balanced. Both 70–90% utilized.</li>'
    + '</ul>'

    + '<h4>"Bottleneck calculator" sites and why to ignore them</h4>'
    + '<p>You\'ve seen "calculate your bottleneck" sites that output "your CPU is bottlenecking your GPU by 14.3%." These numbers are made up. There is no formula that takes part SKU names and outputs a meaningful bottleneck percentage — it depends on the resolution, the game, the settings, the workload mix. Real bottleneck data comes from actually running your workload and watching utilization, not from a website.</p>'

    + '<h4>Upgrading: spend where the meter is pegged</h4>'
    + '<p>Algorithm:</p>'
    + '<ol>'
    +   '<li>Run your typical workload.</li>'
    +   '<li>Watch utilization across CPU / GPU / RAM / disk for ~10 minutes.</li>'
    +   '<li>Whichever is pegged is your bottleneck for that workload.</li>'
    +   '<li>Spend upgrade money there. Other parts will absorb the bigger budget for that one only when YOU\'VE made the bottleneck move there.</li>'
    + '</ol>'
    + '<p>Don\'t upgrade the GPU when the CPU is the bottleneck — you\'ll buy a better GPU that sits at the same 50% utilization, and your framerate barely moves.</p>'

    + '<div class="callout"><div class="label">The eternal frame-pacing footnote</div>'
    + '"Average FPS" hides bottlenecks. A game that averages 100 fps but stutters to 30 every 10 seconds is just as broken as a steady 60. Watch frametime graphs (CapFrameX, MSI Afterburner) — bottlenecks often manifest as 1% / 0.1% lows getting worse before averages do.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Drag the sliders to set utilization. The bottleneck identifier flags whichever is closest to saturation.</p>';

    var state = { cpu: 65, gpu: 95, ram: 50, disk: 20, net: 10 };
    var output = document.createElement('div'); output.className = 'formula-box';
    var bars = document.createElement('div'); bars.className = 'bar-chart';
    var rowsByKey = {};

    function addRow(key, label) {
      var row = document.createElement('div'); row.className='bar-row';
      var fill = document.createElement('span'); fill.className = 'bar-fill';
      var track = document.createElement('span'); track.className='bar-track'; track.appendChild(fill);
      row.innerHTML = '<span class="bar-label">' + label + '</span>';
      row.appendChild(track);
      var val = document.createElement('span'); val.className = 'bar-val';
      row.appendChild(val);
      bars.appendChild(row);
      rowsByKey[key] = { fill: fill, val: val };
    }
    addRow('cpu','CPU');
    addRow('gpu','GPU');
    addRow('ram','RAM');
    addRow('disk','Disk');
    addRow('net','Network');

    var sliders = document.createElement('div'); sliders.className = 'controls-row';
    var keys = ['cpu','gpu','ram','disk','net'];
    keys.forEach(function (k) {
      var l = document.createElement('label');
      l.style.flexDirection = 'column'; l.style.alignItems = 'flex-start';
      l.appendChild(document.createTextNode(k.toUpperCase()));
      var inp = document.createElement('input'); inp.type='range'; inp.min=0; inp.max=100; inp.value=state[k]; inp.style.width='140px';
      inp.addEventListener('input', function () { state[k] = parseInt(inp.value,10); update(); });
      l.appendChild(inp);
      sliders.appendChild(l);
    });

    function update() {
      var maxKey = null, maxVal = -1;
      keys.forEach(function (k) {
        var v = state[k];
        var cls = v >= 95 ? 'bad' : v >= 80 ? 'warn' : 'good';
        rowsByKey[k].fill.className = 'bar-fill ' + cls;
        rowsByKey[k].fill.style.width = v + '%';
        rowsByKey[k].val.textContent = v + '%';
        if (v > maxVal) { maxVal = v; maxKey = k; }
      });
      if (maxVal >= 95) {
        output.innerHTML = '<div class="info-line"><span class="key">Bottleneck:</span> <span class="val"><span class="result" style="color:var(--bad)">' + maxKey.toUpperCase() + '</span> at ' + maxVal + '%. This is what to upgrade.</span></div>';
      } else if (maxVal >= 80) {
        output.innerHTML = '<div class="info-line"><span class="key">Hot but not bottlenecked:</span> <span class="val"><span class="result" style="color:var(--warn)">' + maxKey.toUpperCase() + '</span> at ' + maxVal + '%. Watch this; load slightly more and it will become the bottleneck.</span></div>';
      } else {
        output.innerHTML = '<div class="info-line"><span class="key">No clear bottleneck:</span> <span class="val">all components below 80%. Workload is light or limited by something not measured here (e.g., software synchronization).</span></div>';
      }
    }
    update();

    container.appendChild(bars);
    container.appendChild(sliders);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'During a game, you observe: CPU 45%, GPU 99%, RAM 60%, disk 5%. What\'s the bottleneck?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>CPU</option><option>GPU</option><option>RAM</option><option>Disk</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'GPU') return { correct: true, feedback: 'Right. The GPU is pegged at 99% — that\'s the cap. Other components have headroom (CPU at 45% is barely working, plenty of RAM, almost no disk activity). To raise FPS, upgrade the GPU or lower graphics settings.' };
        return { correct: false, feedback: 'The bottleneck is the part at saturation. GPU at 99% — that\'s the one.' };
      },
      hints: [
        'Look for the part at ~100%.',
        'GPU is at 99%. CPU at only 45% means it\'s waiting on the GPU.',
        'GPU is the bottleneck.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re running a Python data-pipeline that reads a 200 GB Parquet dataset, does pandas operations, and writes results. Profiling shows: 1 CPU core at 100% (the others at idle), GPU at 0%, RAM 60%, disk active-time 35%. What\'s the bottleneck and what would help most?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Add more cores — bottleneck is CPU multi-thread</option>' +
          '<option>Add a GPU — pandas can use CUDA</option>' +
          '<option>Use a parallel framework (Dask, Polars, Spark) so multiple cores get used</option>' +
          '<option>Buy faster NVMe — disk is the bottleneck</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Use a parallel framework (Dask, Polars, Spark) so multiple cores get used') return { correct: true, feedback: 'Right. The bottleneck is single-thread CPU because pandas is single-threaded by default. Adding cores doesn\'t help if the workload doesn\'t use them. Adding a GPU doesn\'t help with vanilla pandas. Faster disk doesn\'t help when disk active-time is only 35%. The fix is to USE the cores you already have — switch to Polars (multi-threaded by default) or Dask (parallel pandas). 1× core saturated → 8 cores at 50% = ~4× speedup, no hardware change.' };
        if (v === 'Add more cores — bottleneck is CPU multi-thread') return { correct: false, feedback: 'CPU multi-thread isn\'t the bottleneck — only 1 core is busy. The OTHER cores are idle. Adding cores you don\'t use is wasted money.' };
        if (v === 'Add a GPU — pandas can use CUDA') return { correct: false, feedback: 'Vanilla pandas does not use CUDA. (cuDF / RAPIDS does, but that requires rewriting.) Profile first.' };
        if (v === 'Buy faster NVMe — disk is the bottleneck') return { correct: false, feedback: 'Disk is at 35% active-time. It\'s not the bottleneck.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'One core at 100% with others idle = single-threaded CPU bottleneck.',
        'Adding cores can\'t help if your code doesn\'t USE them.',
        'Switch to a multi-threaded library (Polars, Dask, etc.).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re running an LLM inference workload on the user\'s rig: Ryzen 9 3900X + RTX 3070 (8 GB) + 32 GB DDR4. The 7B-param model is loaded in Q4_K_M (~4 GB on GPU). Tokens-per-second is ~8 t/s and you want more. Profiling shows: CPU 30%, GPU 99% utilization, GPU memory 6 GB used / 8 GB total, system RAM 12 GB used. What\'s the most likely bottleneck — and would adding more system RAM help?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>GPU compute / memory bandwidth — the 3070 is the cap. More system RAM does NOT help.</option>' +
          '<option>CPU — only 30% utilization but it bottlenecks GPU feeding. More RAM helps.</option>' +
          '<option>System RAM — only 12 GB used means the model is being swapped in. More RAM helps.</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'GPU compute / memory bandwidth — the 3070 is the cap. More system RAM does NOT help.') return { correct: true, feedback: 'Right. GPU at 99% utilization with the model fully loaded into 6 GB of VRAM (no spilling) means the 3070\'s compute (or memory bandwidth) is saturated. CPU at 30% is fine — it\'s not blocking. System RAM is barely used (12 / 32 GB) — adding more does nothing. Tokens/sec for a quantized 7B on a 3070 around 8 t/s is roughly the expected ceiling — Q4 inference is bandwidth-bound and the 3070\'s 448 GB/s is the cap. Real upgrade path: 3090 (936 GB/s) or 4090 (1008 GB/s). System RAM is irrelevant.' };
        if (v === 'CPU — only 30% utilization but it bottlenecks GPU feeding. More RAM helps.') return { correct: false, feedback: 'A bottlenecked CPU would show much higher utilization (close to 100% on at least one core). 30% with GPU pegged at 99% means CPU is fine and GPU is the cap.' };
        if (v === 'System RAM — only 12 GB used means the model is being swapped in. More RAM helps.') return { correct: false, feedback: '12 GB used out of 32 GB means there\'s 20 GB free — definitely no swapping. RAM is not the bottleneck.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        '99% GPU utilization = GPU is the cap.',
        'System RAM is 12/32 used — no pressure there.',
        'GPU compute/bandwidth is the cap. More system RAM does nothing for this workload.'
      ]
    }
  ]
});
