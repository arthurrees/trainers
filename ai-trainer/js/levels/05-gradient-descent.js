// Level 5 — Gradient Descent
AIT.registerLevel({
  id: 5,
  title: 'Gradient Descent',
  whyItMatters: 'Every neural network on Earth is trained with one algorithm: gradient descent (or a small variation of it). It is dumb, mechanical, and absurdly effective — but only if you pick the learning rate right.',
  glossary: ['gradient descent', 'learning rate', 'gradient', 'loss'],
  learn: ''
    + '<h4>The whole algorithm</h4>'
    + '<div class="formula-box"><strong>θ ← θ − η · ∇L(θ)</strong></div>'
    + '<p>That\'s it. Repeatedly: compute the gradient of the loss, take a small step in the opposite direction. <strong>η</strong> (the learning rate) is how big a step.</p>'
    + '<p>Gradient = direction of steepest <em>ascent</em>. Negate it → direction of steepest descent. Take a small step. Recompute. Repeat.</p>'

    + '<h4>Worked example — 1D</h4>'
    + '<p>L(θ) = θ². Minimum at θ = 0. Derivative: dL/dθ = 2θ. Start at θ = 5, η = 0.1.</p>'
    + '<div class="example"><div class="label">Step by step</div>'
    + 'θ₀ = 5, &nbsp; ∇L = 10. &nbsp; Update: θ₁ = 5 − 0.1·10 = 4.<br>'
    + 'θ₁ = 4, &nbsp; ∇L = 8. &nbsp;&nbsp; Update: θ₂ = 4 − 0.1·8 = 3.2.<br>'
    + 'θ₂ = 3.2, &nbsp; ∇L = 6.4. &nbsp; Update: θ₃ = 3.2 − 0.64 = 2.56.<br>'
    + '<span class="muted">...and so on. Notice: as θ shrinks, so does the step. We slow down as we approach the minimum.</span>'
    + '</div>'

    + '<h4>The learning-rate Goldilocks zone</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>η too small</th><th>η just right</th><th>η too big</th></tr>'
    + '<tr><td>tiny steps, painfully slow</td><td>steady descent toward min</td><td>overshoots, oscillates, can diverge</td></tr>'
    + '</table>'
    + '<div class="example"><div class="label">η = 1.1 on L = θ², starting at θ = 1</div>'
    + 'θ₁ = 1 − 1.1·2 = −1.2 &nbsp;<span class="muted">(overshot past zero)</span><br>'
    + 'θ₂ = −1.2 − 1.1·(−2.4) = 1.44 &nbsp;<span class="muted">(overshot back)</span><br>'
    + 'θ₃ = 1.44 − 1.1·2.88 = −1.728 &nbsp;<span class="muted">(getting worse)</span><br>'
    + 'It diverges.'
    + '</div>'

    + '<h4>Multi-dimensional</h4>'
    + '<p>Same algorithm, just with vectors. ∇L is now a vector with one component per parameter, and the update happens in parallel for all of them:</p>'
    + '<div class="formula-box">w₁ ← w₁ − η · ∂L/∂w₁<br>w₂ ← w₂ − η · ∂L/∂w₂<br>... (and so on for every parameter)</div>'
    + '<p>For an LLM, "every parameter" can be 70 billion entries. The principle is the same.</p>'

    + '<h4>Stochastic gradient descent (SGD)</h4>'
    + '<p>Computing ∇L over the entire dataset is expensive. So we use one <em>mini-batch</em> at a time:</p>'
    + '<ul>'
    +   '<li><strong>Batch GD</strong> — average gradient over all examples. Stable but slow.</li>'
    +   '<li><strong>SGD</strong> — gradient on one example. Noisy but fast.</li>'
    +   '<li><strong>Mini-batch SGD</strong> — gradient over a small batch (32, 64, 128). The standard.</li>'
    + '</ul>'
    + '<p>The noise in mini-batch SGD turns out to be a feature: it helps escape narrow ravines and bad local minima.</p>'

    + '<div class="callout"><div class="label">Local minima used to be the boogeyman</div>'
    + 'For decades people worried that GD would get stuck in bad local minima. In practice, in the very high-dimensional loss landscapes of deep networks, almost all critical points are saddle points (some directions go down, some go up), and most local minima are about as good as the global one. The real challenges are "plateaus" and "ravines", not bad minima.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Watch GD on L(θ) = θ². Pick a learning rate, click "Step" repeatedly. Try η = 0.1, η = 1.1 (diverges), and η = 1.01 (slow oscillation).';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>θ₀ = <input type="number" id="gd-init" value="3" step="0.1" style="width:80px"></label>'
    + '<label>η = <input type="number" id="gd-lr" value="0.1" step="0.01" style="width:80px"></label>'
    + '<button class="primary-btn" id="gd-step">Step →</button>'
    + '<button class="secondary-btn" id="gd-run">Run 20 steps</button>'
    + '<button class="ghost-btn" id="gd-reset">Reset</button>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 280;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    var trajectory = [];
    var theta = 3;

    function L(t) { return t * t; }
    function dL(t) { return 2 * t; }

    function reset() {
      theta = parseFloat(document.getElementById('gd-init').value);
      trajectory = [theta];
      render();
    }

    function step() {
      var lr = parseFloat(document.getElementById('gd-lr').value);
      var g = dL(theta);
      theta = theta - lr * g;
      trajectory.push(theta);
      // safety clamp for display
      if (!isFinite(theta) || Math.abs(theta) > 1e6) {
        trajectory.push(theta);
      }
      render();
    }

    function run() { for (var i = 0; i < 20; i++) step(); }

    function render() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      var xMin = -6, xMax = 6, yMin = 0, yMax = 36;
      function px(x) { return pad + (W - 2*pad) * (x - xMin) / (xMax - xMin); }
      function py(y) { return H - pad - (H - 2*pad) * (Math.min(yMax, y) - yMin) / (yMax - yMin); }

      // axes
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, W - 2*pad, H - 2*pad);

      // L(θ)
      ctx.strokeStyle = '#7ab7ff'; ctx.lineWidth = 2;
      ctx.beginPath();
      var first = true;
      for (var x = xMin; x <= xMax; x += 0.05) {
        var y = L(x);
        if (first) { ctx.moveTo(px(x), py(y)); first = false; }
        else ctx.lineTo(px(x), py(y));
      }
      ctx.stroke();

      // trajectory
      ctx.fillStyle = '#a78bfa';
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 1;
      for (var i = 0; i < trajectory.length; i++) {
        var t = trajectory[i];
        if (!isFinite(t) || Math.abs(t) > xMax) continue;
        var cx = px(t), cy = py(L(t));
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
        if (i > 0) {
          var prev = trajectory[i - 1];
          if (isFinite(prev) && Math.abs(prev) <= xMax) {
            ctx.beginPath(); ctx.moveTo(px(prev), py(L(prev))); ctx.lineTo(cx, cy); ctx.stroke();
          }
        }
      }

      box.innerHTML =
        '<div><span class="muted">θ =</span> <span class="result">' + (isFinite(theta) ? theta.toFixed(4) : '∞ (diverged)') + '</span> &nbsp; '
      + '<span class="muted">L(θ) =</span> ' + (isFinite(theta) ? L(theta).toFixed(4) : '∞')
      + '</div>'
      + '<div><span class="muted">Steps:</span> ' + (trajectory.length - 1) + '</div>';
    }

    document.getElementById('gd-step').addEventListener('click', step);
    document.getElementById('gd-run').addEventListener('click', run);
    document.getElementById('gd-reset').addEventListener('click', reset);
    document.getElementById('gd-init').addEventListener('change', reset);
    reset();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You\'re at θ = 2. The gradient is dL/dθ = 0.5. With learning rate η = 0.4, what is θ after one gradient-descent step?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (Math.abs(v - 1.8) < 1e-6) return { correct: true, feedback: 'Right. θ ← θ − η · g = 2 − 0.4 · 0.5 = 2 − 0.2 = 1.8.' };
        return { correct: false, feedback: 'θ ← 2 − 0.4·0.5 = 1.8.' };
      },
      hints: [
        'Update rule: θ ← θ − η · gradient.',
        '0.4 · 0.5 = 0.2.',
        '2 − 0.2 = 1.8.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'On <code class="inline">L(θ) = θ²</code>, you start at θ = 1 and use learning rate η = 1.0. What does the sequence of θ values look like?',
      mountInput: function (c) {
        var opts = [
          'Converges quickly: 1, 0.5, 0.25, 0.125, ...',
          'Stays at θ = 1 forever — the gradient cancels.',
          'Bounces between 1 and −1 forever.',
          'Diverges to ±∞.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        // dL/dθ = 2θ. Update: θ ← θ - 1.0·2θ = -θ. So 1 → -1 → 1 → -1 ...
        if (v === 2) return { correct: true, feedback: 'Right. dL/dθ = 2θ. Update with η = 1: θ ← θ − 2θ = −θ. So 1 → −1 → 1 → −1, oscillating forever. Just outside the convergence regime.' };
        if (v === 0) return { correct: false, feedback: 'For convergence on L = θ² we\'d need η < 1. Try the update: θ ← θ − 2θ. With η = 1 that\'s θ ← −θ.' };
        if (v === 1) return { correct: false, feedback: 'The gradient at θ = 1 is 2, not zero. The update is non-trivial.' };
        if (v === 3) return { correct: false, feedback: 'For divergence we\'d need η > 1. At η = 1 exactly, it neither converges nor diverges — it cycles.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Compute the update: θ ← θ − η · 2θ. Simplify with η = 1.',
        'θ ← θ − 2θ = −θ. So each step flips the sign.',
        'Starting at 1: 1, −1, 1, −1, ... — bounces.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'On <code class="inline">L(θ) = θ²</code>, what is the <strong>largest</strong> learning rate η for which gradient descent will converge to the minimum (rather than oscillate or diverge)?',
      mountInput: function (c) {
        var opts = ['η < 0.5', 'η < 1', 'η < 2', 'any η > 0'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // update: θ ← θ - η·2θ = (1 - 2η) θ. Converges iff |1 - 2η| < 1 iff 0 < η < 1.
        if (v === 'η < 1') return { correct: true, feedback: 'Right. The update is θ ← (1 − 2η) θ. Convergence requires |1 − 2η| < 1, i.e., 0 < η < 1. (For η = 1 exactly we got the bouncing case in the previous puzzle.)' };
        return { correct: false, feedback: 'Update: θ ← (1 − 2η) θ. For convergence the multiplier must have absolute value < 1: |1 − 2η| < 1 → 0 < η < 1.' };
      },
      hints: [
        'Write the update as θ_{t+1} = (1 − 2η) θ_t. The sequence is geometric with ratio (1 − 2η).',
        'Geometric sequences converge to 0 only when |ratio| < 1.',
        '|1 − 2η| < 1 → 0 < η < 1.'
      ]
    }
  ]
});
