// Level 9 — Optimizers (SGD, Momentum, Adam)
AIT.registerLevel({
  id: 9,
  title: 'Optimizers — SGD, Momentum, Adam',
  whyItMatters: 'Plain gradient descent works in theory; in practice it stalls in ravines, gets noisy on tricky losses, and is annoyingly sensitive to learning rate. Real training uses smarter update rules — momentum and Adam — and "Adam with default hyperparameters" is the default for almost every deep network in 2026.',
  glossary: ['optimizer', 'SGD', 'momentum', 'Adam', 'learning rate'],
  learn: ''
    + '<h4>Plain SGD — the baseline</h4>'
    + '<div class="formula-box">θ ← θ − η · g &nbsp;&nbsp;&nbsp;<span class="muted">where g is the (mini-batch) gradient</span></div>'
    + '<p>Fine on simple convex losses. On real loss landscapes — long narrow ravines, plateaus, noisy mini-batch gradients — it crawls or oscillates.</p>'

    + '<h4>Momentum — the heavy ball</h4>'
    + '<p>Keep a running velocity. Each step, decay it a bit and add the new gradient. Then move along the velocity, not the gradient:</p>'
    + '<div class="formula-box">v ← β · v + g &nbsp;&nbsp;&nbsp;<span class="muted">(typically β = 0.9)</span><br>θ ← θ − η · v</div>'
    + '<p>Geometric intuition: a heavy ball rolling downhill. Brief uphill bumps don\'t stop it, and consistent downhill directions accumulate speed. <strong>Helps a lot in narrow ravines</strong>: oscillation across the ravine cancels in the average; the consistent down-the-ravine component accumulates.</p>'

    + '<h4>Adaptive learning rates — RMSProp / AdaGrad</h4>'
    + '<p>What if some parameters need bigger steps and others need smaller? Adapt the learning rate <em>per parameter</em> using a running estimate of recent gradient magnitudes:</p>'
    + '<div class="formula-box">s ← β · s + (1 − β) · g²<br>θ ← θ − η · g / (√s + ε)</div>'
    + '<p>Parameters with consistently big gradients get smaller effective steps; quiet parameters get bigger ones. That\'s RMSProp.</p>'

    + '<h4>Adam — momentum + adaptive lr</h4>'
    + '<p><strong>Adam</strong> combines both ideas:</p>'
    + '<div class="formula-box">'
    + 'm ← β₁ · m + (1 − β₁) · g &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">first-moment estimate (≈ momentum)</span><br>'
    + 'v ← β₂ · v + (1 − β₂) · g² &nbsp;&nbsp;&nbsp;<span class="muted">second-moment estimate (≈ RMSProp)</span><br>'
    + '<span class="muted">apply bias correction:</span> m̂ = m / (1 − β₁ᵗ), &nbsp; v̂ = v / (1 − β₂ᵗ)<br>'
    + 'θ ← θ − η · m̂ / (√v̂ + ε)'
    + '</div>'
    + '<p>Default hyperparameters: β₁ = 0.9, β₂ = 0.999, ε = 1e−8, η = 1e−3 or 3e−4. These work astonishingly well across almost every architecture. <strong>If in doubt, use Adam.</strong></p>'

    + '<h4>AdamW — weight-decay variant</h4>'
    + '<p>"AdamW" is Adam with a fix: weight decay (L2 regularization) is applied <em>directly</em> to the parameter, not folded into the gradient. This sounds like a footnote but it matters for transformers. <strong>Modern LLM training uses AdamW</strong>, not vanilla Adam.</p>'

    + '<h4>When SGD is still better</h4>'
    + '<p>Adam isn\'t always optimal. For some vision tasks (ResNets on ImageNet), well-tuned SGD with momentum still generalizes slightly better than Adam — at the cost of much more careful learning-rate scheduling. For LLMs, AdamW dominates.</p>'

    + '<div class="callout"><div class="label">The bias-correction trick</div>'
    + 'In Adam, the running averages m and v start at 0. For the first few steps they\'re biased toward zero. Dividing by (1 − βᵗ) corrects this — the correction is huge early (β = 0.9, t = 1 → correction = 1/0.1 = 10×) and fades to ~1 after many steps. Without bias correction, Adam takes timid first steps.'
    + '</div>'

    + '<h4>Learning-rate schedules</h4>'
    + '<p>Modern training rarely uses a constant η. Common patterns:</p>'
    + '<ul>'
    +   '<li><strong>Warmup</strong> — start at near-zero η, ramp up over the first few thousand steps. Stabilizes early Adam.</li>'
    +   '<li><strong>Cosine decay</strong> — slowly drop η along a cosine curve to ~0 by end of training.</li>'
    +   '<li><strong>Step decay</strong> — drop η by a constant factor at fixed milestones. Older.</li>'
    + '</ul>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'A "ravine" loss surface — much steeper across one axis than the other. Run each optimizer; see how they behave differently.';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>η = <input type="number" id="opt-lr" value="0.1" step="0.01" style="width:80px"></label>'
    + '<label>start θ = (<input type="number" id="opt-x0" value="-3" step="0.5" style="width:60px">, <input type="number" id="opt-y0" value="-2" step="0.5" style="width:60px">)</label>'
    + '<button class="primary-btn" id="opt-run">Run all 3 optimizers (60 steps)</button>'
    + '<button class="ghost-btn" id="opt-reset">Reset</button>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 320;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var legend = document.createElement('div');
    legend.className = 'formula-box';
    legend.style.fontSize = '13px';
    legend.innerHTML =
      '<div><span style="color:#7ab7ff">●</span> SGD &nbsp; <span style="color:#fbbf24">●</span> SGD + momentum (β=0.9) &nbsp; <span style="color:#4ade80">●</span> Adam (β₁=0.9, β₂=0.999)</div>'
    + '<div class="muted">Loss: L(x, y) = 5x² + y² (steeper in x). The optimum is at (0, 0).</div>';
    container.appendChild(legend);

    function L(x, y) { return 5 * x * x + y * y; }
    function grad(x, y) { return [10 * x, 2 * y]; }

    var trajectories = { sgd: [], mom: [], adam: [] };

    function runAll() {
      var lr = parseFloat(document.getElementById('opt-lr').value);
      var x0 = parseFloat(document.getElementById('opt-x0').value);
      var y0 = parseFloat(document.getElementById('opt-y0').value);
      var N = 60;
      // SGD
      var x = x0, y = y0; var t1 = [[x, y]];
      for (var i = 0; i < N; i++) {
        var g = grad(x, y);
        x -= lr * g[0]; y -= lr * g[1];
        t1.push([x, y]);
      }
      // Momentum
      var x2 = x0, y2 = y0, vx = 0, vy = 0; var t2 = [[x2, y2]];
      var beta = 0.9;
      for (var i2 = 0; i2 < N; i2++) {
        var g2 = grad(x2, y2);
        vx = beta * vx + g2[0]; vy = beta * vy + g2[1];
        x2 -= lr * vx; y2 -= lr * vy;
        t2.push([x2, y2]);
      }
      // Adam
      var x3 = x0, y3 = y0, mx = 0, my = 0, sx = 0, sy = 0; var t3 = [[x3, y3]];
      var b1 = 0.9, b2 = 0.999, eps = 1e-8;
      for (var t = 1; t <= N; t++) {
        var g3 = grad(x3, y3);
        mx = b1 * mx + (1 - b1) * g3[0]; my = b1 * my + (1 - b1) * g3[1];
        sx = b2 * sx + (1 - b2) * g3[0] * g3[0]; sy = b2 * sy + (1 - b2) * g3[1] * g3[1];
        var mxh = mx / (1 - Math.pow(b1, t)), myh = my / (1 - Math.pow(b1, t));
        var sxh = sx / (1 - Math.pow(b2, t)), syh = sy / (1 - Math.pow(b2, t));
        x3 -= lr * mxh / (Math.sqrt(sxh) + eps); y3 -= lr * myh / (Math.sqrt(syh) + eps);
        t3.push([x3, y3]);
      }
      trajectories = { sgd: t1, mom: t2, adam: t3 };
      render();
    }

    function render() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      var xMin = -4, xMax = 4, yMin = -4, yMax = 4;
      function px(x) { return pad + (W - 2*pad) * (x - xMin) / (xMax - xMin); }
      function py(y) { return H - pad - (H - 2*pad) * (y - yMin) / (yMax - yMin); }

      // contour lines
      var levels = [1, 4, 10, 25, 50, 80];
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      // ellipses for L = c: 5x² + y² = c → x² / (c/5) + y² / c = 1
      levels.forEach(function (c) {
        ctx.beginPath();
        for (var t = 0; t <= 2 * Math.PI + 0.1; t += 0.05) {
          var x = Math.sqrt(c / 5) * Math.cos(t);
          var y = Math.sqrt(c) * Math.sin(t);
          var pX = px(x), pY = py(y);
          if (t === 0) ctx.moveTo(pX, pY);
          else ctx.lineTo(pX, pY);
        }
        ctx.stroke();
      });
      // axes
      ctx.beginPath(); ctx.moveTo(pad, py(0)); ctx.lineTo(W - pad, py(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px(0), pad); ctx.lineTo(px(0), H - pad); ctx.stroke();

      function drawTrajectory(traj, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (var i = 0; i < traj.length; i++) {
          var p = traj[i];
          var X = Math.max(xMin, Math.min(xMax, p[0]));
          var Y = Math.max(yMin, Math.min(yMax, p[1]));
          if (i === 0) ctx.moveTo(px(X), py(Y));
          else ctx.lineTo(px(X), py(Y));
        }
        ctx.stroke();
        // dots
        traj.forEach(function (p) {
          var X = Math.max(xMin, Math.min(xMax, p[0]));
          var Y = Math.max(yMin, Math.min(yMax, p[1]));
          ctx.beginPath(); ctx.arc(px(X), py(Y), 2.5, 0, Math.PI * 2); ctx.fill();
        });
      }
      drawTrajectory(trajectories.sgd, '#7ab7ff');
      drawTrajectory(trajectories.mom, '#fbbf24');
      drawTrajectory(trajectories.adam, '#4ade80');
    }

    document.getElementById('opt-run').addEventListener('click', runAll);
    document.getElementById('opt-reset').addEventListener('click', function () {
      trajectories = { sgd: [], mom: [], adam: [] };
      render();
    });
    runAll();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which optimizer is the de-facto default for training transformers and most modern neural nets in 2026?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Plain SGD', 'SGD + momentum', 'AdaGrad', 'AdamW', 'L-BFGS'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'AdamW') return { correct: true, feedback: 'Right. AdamW (Adam with decoupled weight decay) is the standard for transformers and most modern deep nets. Plain Adam is close behind; SGD+momentum is still used in some vision tasks.' };
        if (v === 'SGD + momentum') return { correct: false, feedback: 'Used to be the default, and still wins on some vision benchmarks, but transformers and most modern training has moved to AdamW.' };
        return { correct: false, feedback: 'AdamW. (Plain Adam is close, but the W-variant has eclipsed it for transformers.)' };
      },
      hints: [
        'It combines momentum and per-parameter adaptive learning rates.',
        'It\'s a variant of Adam with decoupled weight decay.',
        'AdamW.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'In Adam with bias correction, the first-moment estimate is divided by <code class="inline">(1 − β₁ᵗ)</code>. With β₁ = 0.9 and t = 1 (very first step), what does the bias correction do to the effective gradient — make it bigger, smaller, or unchanged compared to using m alone?',
      mountInput: function (c) {
        var opts = ['Bigger by ~10×', 'Smaller by ~10×', 'Unchanged', 'Multiplied by exactly 0.1'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        // 1 - 0.9^1 = 0.1. Dividing by 0.1 multiplies by 10.
        if (v === 0) return { correct: true, feedback: 'Right. 1 − 0.9¹ = 0.1. Dividing m by 0.1 means multiplying by 10. Without this correction, the very first Adam step would be ~10× smaller than what the gradient suggests, because m starts at 0 and only just got 0.1·g added.' };
        if (v === 1) return { correct: false, feedback: 'Wrong direction — bias correction divides by a small number, which makes the effective step BIGGER, not smaller.' };
        return { correct: false, feedback: '1 − 0.9¹ = 0.1. m / 0.1 = 10·m. So bias correction makes the effective gradient ~10× bigger at step 1.' };
      },
      hints: [
        'Compute 1 − 0.9¹ first.',
        '1 − 0.9 = 0.1. Now you divide m by 0.1 — what does that do?',
        'Dividing by 0.1 = multiplying by 10. So the effective step is ~10× bigger at t = 1.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Your loss surface has a long, narrow ravine — much steeper across one axis than along it. Plain SGD oscillates across the ravine instead of progressing along it. Which optimizer change <strong>most directly</strong> addresses this without changing the learning rate?',
      mountInput: function (c) {
        var opts = [
          'Lower the learning rate.',
          'Use SGD with momentum (β = 0.9).',
          'Switch to a deeper network.',
          'Add L2 weight decay.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. Momentum is exactly the cure for ravines. Oscillations across the ravine have alternating signs and cancel in the running average; the consistent down-the-ravine direction reinforces. (Adam also does this; the question said "without changing the lr" — momentum gets there with one new hyperparameter.)' };
        if (v === 0) return { correct: false, feedback: 'Lowering lr removes the oscillation but slows everything else too. Momentum keeps lr the same and damps the oscillation specifically.' };
        if (v === 2) return { correct: false, feedback: 'A deeper network is a model change, not an optimization change. The ravine problem is about the OPTIMIZER, not the architecture.' };
        if (v === 3) return { correct: false, feedback: 'L2 weight decay is regularization — it shrinks weights, not a fix for ravines.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'The "heavy ball rolling downhill" metaphor — what does adding mass do?',
        'Mass smooths out short-term oscillations and lets consistent forces accumulate. That\'s momentum.',
        'SGD + momentum.'
      ]
    }
  ]
});
