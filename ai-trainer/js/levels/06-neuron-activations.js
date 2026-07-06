// Level 6 — The Neuron & Activation Functions
AIT.registerLevel({
  id: 6,
  title: 'The Neuron & Activations',
  whyItMatters: 'A neural network is just many neurons in layers, and each neuron is a one-line formula. The non-trivial choice is which activation to wrap that line in — pick wrong and your network will not learn.',
  glossary: ['neuron', 'activation', 'ReLU', 'sigmoid', 'tanh', 'GELU', 'softmax'],
  learn: ''
    + '<h4>One neuron, one line</h4>'
    + '<div class="formula-box"><strong>y = f(w · x + b)</strong></div>'
    + '<ul>'
    +   '<li><strong>x</strong> — input vector.</li>'
    +   '<li><strong>w</strong> — weight vector (same length as x), one per input.</li>'
    +   '<li><strong>b</strong> — scalar bias.</li>'
    +   '<li><strong>f</strong> — activation function. The non-linear bit.</li>'
    + '</ul>'
    + '<p>w · x + b is called the <strong>pre-activation</strong> (or "logit"). Apply f → "activation".</p>'

    + '<h4>Why do we need a non-linearity at all?</h4>'
    + '<p>Skip the f and stack two layers: y = W₂ (W₁ x + b₁) + b₂ = (W₂W₁) x + (W₂b₁ + b₂). That collapses to a single linear layer. <strong>No matter how many layers you stack without an activation, you have a one-layer model</strong>. The non-linearity is what lets each layer add real expressive power.</p>'

    + '<h4>The activation zoo</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Name</th><th>Formula</th><th>Output range</th><th>Typical use</th></tr>'
    + '<tr><td>sigmoid (σ)</td><td>1 / (1 + e⁻ᶻ)</td><td>(0, 1)</td><td>binary output, gate values in LSTMs</td></tr>'
    + '<tr><td>tanh</td><td>(eᶻ − e⁻ᶻ) / (eᶻ + e⁻ᶻ)</td><td>(−1, 1)</td><td>RNN hidden states (legacy)</td></tr>'
    + '<tr><td>ReLU</td><td>max(0, z)</td><td>[0, ∞)</td><td>default for hidden layers</td></tr>'
    + '<tr><td>Leaky ReLU</td><td>max(0.01z, z)</td><td>(−∞, ∞)</td><td>fixes "dying ReLU"</td></tr>'
    + '<tr><td>GELU</td><td>z · Φ(z)</td><td>≈(−0.17, ∞)</td><td>BERT, GPT-2/3, modern transformers</td></tr>'
    + '<tr><td>softmax</td><td>eᶻⁱ / Σⱼ eᶻʲ</td><td>(0, 1), sums to 1</td><td>multi-class classification head</td></tr>'
    + '</table>'

    + '<h4>The vanishing-gradient problem</h4>'
    + '<p>Sigmoid and tanh both saturate — they get flat far from zero. Where they\'re flat, their <em>derivatives</em> are nearly zero. In a deep network, gradients multiply through layers via the chain rule, and if many layers have near-zero derivatives, the product collapses to nothing. Early layers stop learning.</p>'
    + '<p>That\'s why ReLU took over: it\'s linear (slope 1) for positive inputs, so gradients pass through cleanly. The non-linearity comes purely from the kink at zero.</p>'

    + '<div class="callout"><div class="label">Modern defaults (2026)</div>'
    + '<strong>Hidden layers</strong>: ReLU or GELU (or its newer cousin SwiGLU in many transformers). <strong>Binary output</strong>: sigmoid. <strong>Multi-class output</strong>: softmax. Sigmoid and tanh are mostly historical footnotes inside hidden layers — they live on in gates (LSTMs, transformer routing) where saturating is a feature.'
    + '</div>'

    + '<h4>Output activation depends on the task</h4>'
    + '<ul>'
    +   '<li><strong>Regression</strong>: no activation on the output (we want any real number).</li>'
    +   '<li><strong>Binary classification</strong>: sigmoid → (0, 1) probability.</li>'
    +   '<li><strong>Multi-class</strong>: softmax → probabilities over K classes that sum to 1.</li>'
    + '</ul>'
    + '<p>Hidden layers are different — they don\'t care about probability constraints, they want fast non-saturating activations.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click an activation. The plot shows it (blue) and its derivative (purple). Look for where the derivative is small — those zones are bad for gradient flow.';
    container.appendChild(help);

    var fns = [
      { name: 'sigmoid', f: function (z) { return 1 / (1 + Math.exp(-z)); }, df: function (z) { var s = 1 / (1 + Math.exp(-z)); return s * (1 - s); } },
      { name: 'tanh',    f: function (z) { return Math.tanh(z); },          df: function (z) { var t = Math.tanh(z); return 1 - t * t; } },
      { name: 'ReLU',    f: function (z) { return Math.max(0, z); },         df: function (z) { return z > 0 ? 1 : 0; } },
      { name: 'Leaky ReLU', f: function (z) { return z > 0 ? z : 0.01 * z; }, df: function (z) { return z > 0 ? 1 : 0.01; } },
      { name: 'GELU',    f: function (z) { return 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * z * z * z))); }, df: function (z) {
        // numerical
        var h = 1e-4;
        var g0 = 0.5 * (z - h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((z - h) + 0.044715 * Math.pow(z - h, 3))));
        var g1 = 0.5 * (z + h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((z + h) + 0.044715 * Math.pow(z + h, 3))));
        return (g1 - g0) / (2 * h);
      } }
    ];

    var ctrls = document.createElement('div');
    ctrls.className = 'chip-row';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.style.fontSize = '13px';

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 240;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(ctrls);
    container.appendChild(canvasHost);
    container.appendChild(output);

    var current = 2; // ReLU default
    fns.forEach(function (fn, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === current ? ' active' : '');
      b.textContent = fn.name;
      b.addEventListener('click', function () {
        current = i;
        Array.prototype.forEach.call(ctrls.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        render();
      });
      ctrls.appendChild(b);
    });

    function render() {
      var fn = fns[current];
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      var xMin = -5, xMax = 5, yMin = -1.5, yMax = 2;
      function px(x) { return pad + (W - 2*pad) * (x - xMin) / (xMax - xMin); }
      function py(y) { return H - pad - (H - 2*pad) * (y - yMin) / (yMax - yMin); }
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      // axes
      ctx.beginPath(); ctx.moveTo(pad, py(0)); ctx.lineTo(W - pad, py(0)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px(0), pad); ctx.lineTo(px(0), H - pad); ctx.stroke();

      function curve(yfn, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        var first = true;
        for (var x = xMin; x <= xMax; x += 0.02) {
          var y = yfn(x);
          if (!isFinite(y)) continue;
          if (first) { ctx.moveTo(px(x), py(y)); first = false; }
          else ctx.lineTo(px(x), py(y));
        }
        ctx.stroke();
      }
      curve(fn.f, '#7ab7ff');
      curve(fn.df, '#a78bfa');

      // legend
      ctx.fillStyle = '#7ab7ff'; ctx.fillRect(pad, 10, 12, 4); ctx.fillStyle = '#9aa3b2'; ctx.font = '12px monospace';
      ctx.fillText(fn.name + '(z)', pad + 18, 16);
      ctx.fillStyle = '#a78bfa'; ctx.fillRect(pad + 90, 10, 12, 4); ctx.fillStyle = '#9aa3b2';
      ctx.fillText(fn.name + "'(z)", pad + 108, 16);

      output.innerHTML =
        '<div><span class="muted">' + fn.name + '(0) =</span> ' + fn.f(0).toFixed(4) + '</div>'
      + '<div><span class="muted">' + fn.name + '(2) =</span> ' + fn.f(2).toFixed(4) + ' &nbsp;<span class="muted">' + fn.name + "'(2) =</span> " + fn.df(2).toFixed(4) + '</div>'
      + '<div><span class="muted">' + fn.name + '(−2) =</span> ' + fn.f(-2).toFixed(4) + ' &nbsp;<span class="muted">' + fn.name + "'(−2) =</span> " + fn.df(-2).toFixed(4) + '</div>';
    }
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is <code class="inline">ReLU(−3)</code>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (v === 0) return { correct: true, feedback: 'Right. ReLU(z) = max(0, z). For any negative z, it returns 0.' };
        return { correct: false, feedback: 'ReLU(z) = max(0, z). For −3, that is 0.' };
      },
      hints: [
        'ReLU is just max(0, z).',
        'max(0, −3) = ?',
        '0.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You stack two linear layers <em>without</em> any activation between them: <code class="inline">y = W₂(W₁ x + b₁) + b₂</code>. Compared to a single linear layer, what does the two-layer network gain in expressive power?',
      mountInput: function (c) {
        var opts = [
          'Twice the expressive power.',
          'Strictly more — it can fit non-linear curves.',
          'Nothing — the composition is mathematically equivalent to a single linear layer.',
          'It depends on whether b₁ and b₂ are zero.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. Expand: y = (W₂W₁) x + (W₂b₁ + b₂) — that\'s y = W\'x + b\' for some W\' and b\'. A single linear layer can already represent this. Without activations between layers, depth gives nothing.' };
        return { correct: false, feedback: 'The composition collapses: y = W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂) = W\'x + b\'. Same as one linear layer. This is exactly why we need activations.' };
      },
      hints: [
        'Try expanding the expression.',
        'y = W₂W₁ x + W₂b₁ + b₂. Set W\' = W₂W₁ and b\' = W₂b₁ + b₂.',
        'Then y = W\' x + b\' — a single linear layer. Composition gained nothing.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'For sigmoid σ(z) = 1 / (1 + e⁻ᶻ), at what value of z is the <strong>derivative</strong> σ\'(z) at its maximum?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (Math.abs(v) < 0.001) return { correct: true, feedback: 'Right. σ\'(z) = σ(z)(1 − σ(z)) is maximized when σ(z) = 0.5, which happens at z = 0. At that point σ\' = 0.25. (Note: even at the peak, sigmoid\'s derivative is only 0.25 — that\'s already a problem in deep networks. Stack many sigmoids and gradients shrink fast.)' };
        return { correct: false, feedback: 'σ\'(z) = σ(z)(1 − σ(z)). This product p(1−p) peaks at p = 0.5, which corresponds to σ(z) = 0.5, i.e., z = 0.' };
      },
      hints: [
        'σ\'(z) = σ(z) · (1 − σ(z)). Let p = σ(z). The expression becomes p(1 − p).',
        'Find where p(1 − p) is maximized — basic single-variable calculus.',
        'd/dp [p(1-p)] = 1 - 2p = 0 → p = 0.5. σ(z) = 0.5 happens at z = 0.'
      ]
    }
  ]
});
