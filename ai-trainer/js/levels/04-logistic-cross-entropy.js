// Level 4 — Logistic Regression & Cross-Entropy
AIT.registerLevel({
  id: 4,
  title: 'Logistic Regression & Cross-Entropy',
  whyItMatters: 'Most ML predictions are not numbers — they are probabilities of categories. The combination of a sigmoid output and a cross-entropy loss is the original recipe for binary classification, and it is built into every NN classifier you will ever use.',
  glossary: ['sigmoid', 'softmax', 'cross-entropy', 'loss'],
  learn: ''
    + '<h4>The classification problem</h4>'
    + '<p>Given features x, predict a discrete category. Binary case: y ∈ {0, 1}. We don\'t want the model to output −∞ to ∞ — we want a number we can interpret as <em>"probability that y = 1"</em>.</p>'

    + '<h4>The sigmoid — squash to (0, 1)</h4>'
    + '<div class="formula-box"><strong>σ(z) = 1 / (1 + e<sup>−z</sup>)</strong></div>'
    + '<p>Properties:</p>'
    + '<ul>'
    +   '<li>σ(0) = 1/2 — at the boundary.</li>'
    +   '<li>z → +∞ → σ(z) → 1 (confident yes).</li>'
    +   '<li>z → −∞ → σ(z) → 0 (confident no).</li>'
    +   '<li>It\'s smooth, monotonic, and differentiable: σ\'(z) = σ(z) · (1 − σ(z)).</li>'
    + '</ul>'

    + '<h4>Logistic regression</h4>'
    + '<p>Same shape as linear regression, but pass the output through sigmoid:</p>'
    + '<div class="formula-box">z = w·x + b &nbsp;&nbsp;&nbsp;&nbsp; <strong>p = σ(z)</strong></div>'
    + '<p>The boundary z = 0 (where p = 0.5) is the <strong>decision boundary</strong> — a line in 2D, a hyperplane in higher dimensions.</p>'

    + '<h4>Why MSE is wrong for classification</h4>'
    + '<p>If you train a sigmoid output with MSE, gradients vanish near 0 and 1 — exactly where you most need them. The sigmoid is flat there, so σ\'(z) ≈ 0, and the chain rule kills the gradient.</p>'
    + '<p>You need a loss whose gradient stays alive when the model is confidently wrong.</p>'

    + '<h4>Cross-entropy — the right loss</h4>'
    + '<p>For one example with true label y and predicted probability p:</p>'
    + '<div class="formula-box"><strong>L = −[ y · log(p) + (1 − y) · log(1 − p) ]</strong></div>'
    + '<p>Read it carefully:</p>'
    + '<ul>'
    +   '<li>If <strong>y = 1</strong>: L = −log(p). Closer p is to 1, smaller the loss. p → 0 → L → ∞.</li>'
    +   '<li>If <strong>y = 0</strong>: L = −log(1 − p). Closer p is to 0, smaller the loss. p → 1 → L → ∞.</li>'
    + '</ul>'
    + '<div class="example"><div class="label">Confidence matters</div>'
    + 'y = 1 and p = 0.9 → L = −log(0.9) ≈ 0.105 &nbsp;<span class="muted">(close to right, small loss)</span><br>'
    + 'y = 1 and p = 0.5 → L = −log(0.5) ≈ 0.693 &nbsp;<span class="muted">(uncertain)</span><br>'
    + 'y = 1 and p = 0.01 → L = −log(0.01) ≈ 4.605 &nbsp;<span class="muted">(confidently wrong — punished hard)</span>'
    + '</div>'

    + '<h4>Multi-class case — softmax + cross-entropy</h4>'
    + '<p>For K classes, the model outputs K logits <strong>z₁, ..., z_K</strong>. Softmax turns them into probabilities:</p>'
    + '<div class="formula-box"><strong>p_k = e<sup>z_k</sup> / Σ<sub>j</sub> e<sup>z_j</sup></strong></div>'
    + '<p>Cross-entropy then becomes:</p>'
    + '<div class="formula-box"><strong>L = −log(p<sub>true class</sub>)</strong></div>'
    + '<p>Punishes the model for not putting enough probability on the correct class. This is what every modern classifier minimizes — same loss whether you have 2 classes (binary) or 50,000 (LLM next-token).</p>'

    + '<div class="callout"><div class="label">Cross-entropy is "surprise"</div>'
    + 'Cross-entropy comes straight from information theory. −log(p) is the "self-information" or "surprise" of an event with probability p. Cross-entropy is the average surprise of the true labels under the model\'s distribution. Train the model = minimize how surprised it is by the truth.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = '2D classifier. Drag w₁, w₂, b. Watch the decision boundary (where σ(w·x+b) = 0.5) and the cross-entropy loss.';
    container.appendChild(help);

    // generate two clusters
    var pts = [];
    var seed = 42;
    function rng() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = 0; i < 8; i++) pts.push({ x: 1 + rng(), y: 1 + rng(), label: 0 });
    for (var j = 0; j < 8; j++) pts.push({ x: 3 + rng() * 1.5, y: 3 + rng() * 1.5, label: 1 });

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>w₁ = <span id="lg-w1">1.0</span> <input type="range" id="lg-w1-r" min="-3" max="3" step="0.05" value="1" style="width:160px"></label>'
    + '<label>w₂ = <span id="lg-w2">1.0</span> <input type="range" id="lg-w2-r" min="-3" max="3" step="0.05" value="1" style="width:160px"></label>'
    + '<label>b = <span id="lg-b">-4.0</span> <input type="range" id="lg-b-r" min="-8" max="4" step="0.05" value="-4" style="width:160px"></label>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 320;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

    function render() {
      var w1 = parseFloat(document.getElementById('lg-w1-r').value);
      var w2 = parseFloat(document.getElementById('lg-w2-r').value);
      var b = parseFloat(document.getElementById('lg-b-r').value);
      document.getElementById('lg-w1').textContent = w1.toFixed(2);
      document.getElementById('lg-w2').textContent = w2.toFixed(2);
      document.getElementById('lg-b').textContent = b.toFixed(2);

      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      var xMin = 0, xMax = 5, yMin = 0, yMax = 5;
      function px(x) { return pad + (W - 2*pad) * (x - xMin) / (xMax - xMin); }
      function py(y) { return H - pad - (H - 2*pad) * (y - yMin) / (yMax - yMin); }

      // probability heat map (coarse)
      var step = 12;
      for (var iy = 0; iy < H; iy += step) {
        for (var ix = 0; ix < W; ix += step) {
          var X = xMin + (xMax - xMin) * (ix - pad) / (W - 2*pad);
          var Y = yMin + (yMax - yMin) * ((H - pad - iy) / (H - 2*pad));
          var p = sigmoid(w1 * X + w2 * Y + b);
          ctx.fillStyle = 'rgba(' + Math.round(248 - p*126) + ',' + Math.round(113 + p*125) + ',' + Math.round(113 + p*15) + ',0.18)';
          ctx.fillRect(ix, iy, step, step);
        }
      }
      // axes box
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, W - 2*pad, H - 2*pad);

      // decision boundary: w1*x + w2*y + b = 0 → y = -(w1*x + b)/w2
      ctx.strokeStyle = '#7ab7ff'; ctx.lineWidth = 2;
      ctx.beginPath();
      if (Math.abs(w2) > 1e-6) {
        ctx.moveTo(px(xMin), py(-(w1 * xMin + b) / w2));
        ctx.lineTo(px(xMax), py(-(w1 * xMax + b) / w2));
      } else if (Math.abs(w1) > 1e-6) {
        // vertical line
        var xv = -b / w1;
        ctx.moveTo(px(xv), py(yMin)); ctx.lineTo(px(xv), py(yMax));
      }
      ctx.stroke();

      // points
      pts.forEach(function (p) {
        ctx.fillStyle = p.label === 1 ? '#4ade80' : '#f87171';
        ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 6, 0, Math.PI * 2); ctx.fill();
      });

      // loss
      var L = 0;
      pts.forEach(function (p) {
        var phat = sigmoid(w1 * p.x + w2 * p.y + b);
        // clamp to avoid log(0)
        phat = Math.min(0.999999, Math.max(1e-7, phat));
        L += -(p.label * Math.log(phat) + (1 - p.label) * Math.log(1 - phat));
      });
      L /= pts.length;
      var nCorrect = 0;
      pts.forEach(function (p) {
        var phat = sigmoid(w1 * p.x + w2 * p.y + b);
        if ((phat >= 0.5) === (p.label === 1)) nCorrect++;
      });
      box.innerHTML =
        '<div><span class="muted">Boundary:</span> ' + w1.toFixed(2) + ' · x₁ + ' + w2.toFixed(2) + ' · x₂ + ' + b.toFixed(2) + ' = 0</div>'
      + '<div><span class="muted">Cross-entropy loss (avg):</span> <span class="result">' + L.toFixed(4) + '</span></div>'
      + '<div><span class="muted">Accuracy:</span> ' + nCorrect + ' / ' + pts.length + '</div>';
    }

    document.getElementById('lg-w1-r').addEventListener('input', render);
    document.getElementById('lg-w2-r').addEventListener('input', render);
    document.getElementById('lg-b-r').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is <code class="inline">σ(0)</code>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (Math.abs(v - 0.5) < 1e-6) return { correct: true, feedback: 'Right. σ(0) = 1 / (1 + e⁰) = 1 / 2 = 0.5. The midpoint of the sigmoid.' };
        return { correct: false, feedback: 'σ(0) = 1 / (1 + 1) = 0.5.' };
      },
      hints: [
        'σ(z) = 1 / (1 + e⁻ᶻ). What is e⁰?',
        'e⁰ = 1. So σ(0) = 1 / (1 + 1).',
        '0.5.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'For binary cross-entropy with <strong>y = 1</strong>, what is the loss when the model predicts <strong>p = 0.9</strong>? <span class="muted">(Use natural log. Round to 3 decimals.)</span>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        var t = -Math.log(0.9);
        if (Math.abs(v - t) < 0.01) return { correct: true, feedback: 'Right. y=1 → L = −log(p) = −log(0.9) ≈ 0.105. Confidence near the right answer → small loss.' };
        return { correct: false, feedback: 'For y=1, L = −log(p). −log(0.9) ≈ 0.105.' };
      },
      hints: [
        'When y = 1 the second term disappears: L = −log(p).',
        'log(0.9) is a small negative number — about −0.105.',
        '−(−0.105) = 0.105.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'For y = 1, two predictions are evaluated. Prediction A says <strong>p = 0.5</strong> ("not sure"). Prediction B says <strong>p = 0.01</strong> ("confidently wrong"). Roughly how many times <strong>more</strong> loss does B incur than A?',
      mountInput: function (c) {
        var opts = ['About the same — both are wrong', 'About 2× more', 'About 7× more', 'About 100× more'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        // L_A = -log(0.5) ≈ 0.693, L_B = -log(0.01) ≈ 4.605. ratio ≈ 6.65 ≈ 7
        if (v === 2) return { correct: true, feedback: 'Right. L_A = −log(0.5) ≈ 0.693. L_B = −log(0.01) ≈ 4.605. Ratio ≈ 6.65, so about 7×. The whole point of cross-entropy: confidently wrong is much worse than uncertain.' };
        if (v === 0) return { correct: false, feedback: 'Cross-entropy strongly distinguishes "uncertain" (around 0.7) from "confidently wrong" (around 4.6) — a factor of ~7.' };
        if (v === 1) return { correct: false, feedback: 'Underestimating. −log(0.5) ≈ 0.693, but −log(0.01) ≈ 4.605 — about 6–7× larger.' };
        if (v === 3) return { correct: false, feedback: 'Cross-entropy uses log, so the punishment scales gently — not 100×. It\'s about 7×.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'L = −log(p) when y = 1. Compute for p = 0.5 and p = 0.01.',
        '−log(0.5) ≈ 0.693, −log(0.01) ≈ 4.605.',
        '4.605 / 0.693 ≈ 6.65, so about 7×.'
      ]
    }
  ]
});
