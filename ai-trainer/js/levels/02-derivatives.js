// Level 2 — Derivatives & The Chain Rule
AIT.registerLevel({
  id: 2,
  title: 'Derivatives & The Chain Rule',
  whyItMatters: 'Training a network is "go downhill on the loss." The thing that tells you which way is downhill is the gradient — a stack of derivatives. The chain rule is what makes computing those gradients tractable for a 100-layer network instead of impossible.',
  glossary: ['derivative', 'partial', 'gradient', 'chain rule'],
  learn: ''
    + '<h4>The derivative — slope at a point</h4>'
    + '<p>For a function f(x), the derivative <strong>f\'(x)</strong> (or df/dx) tells you how much f changes per tiny change in x. Geometrically, the slope of the tangent line.</p>'
    + '<div class="example"><div class="label">If at x = 3 you have f\'(3) = 2</div>'
    + 'Then nudging x up by 0.01 will change f by about 0.02. Bigger derivative → steeper hill → bigger response to a nudge.'
    + '</div>'

    + '<h4>The five derivatives you actually need</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>f(x)</th><th>f\'(x)</th><th>where it shows up</th></tr>'
    + '<tr><td>c (constant)</td><td>0</td><td>biases — only matter once</td></tr>'
    + '<tr><td>xⁿ</td><td>n · xⁿ⁻¹</td><td>polynomial losses, MSE</td></tr>'
    + '<tr><td>eˣ</td><td>eˣ</td><td>softmax, sigmoid</td></tr>'
    + '<tr><td>log(x)</td><td>1 / x</td><td>cross-entropy</td></tr>'
    + '<tr><td>1 / (1 + e⁻ˣ) = σ(x)</td><td>σ(x) · (1 − σ(x))</td><td>sigmoid activation</td></tr>'
    + '</table>'
    + '<p>These five plus the chain rule cover ~90% of NN math.</p>'

    + '<h4>Linearity</h4>'
    + '<ul>'
    +   '<li>Derivative of a sum is the sum of derivatives: (f + g)\' = f\' + g\'.</li>'
    +   '<li>Derivative scales: (c · f)\' = c · f\'.</li>'
    + '</ul>'

    + '<h4>The chain rule</h4>'
    + '<p>For a composition <strong>y = f(g(x))</strong>:</p>'
    + '<div class="formula-box"><strong>dy/dx = f\'(g(x)) · g\'(x)</strong></div>'
    + '<p>"Differentiate the outer at g(x), times the derivative of the inner." If you have three nested functions, the rule chains again.</p>'
    + '<div class="example"><div class="label">y = (3x + 2)²</div>'
    + 'Let u = 3x + 2 (inner), so y = u². <br>'
    + 'dy/du = 2u = 2(3x + 2). <br>'
    + 'du/dx = 3. <br>'
    + 'Chain: dy/dx = (2(3x+2)) · 3 = <strong>6(3x + 2)</strong>.'
    + '</div>'

    + '<div class="callout"><div class="label">Why this is the heart of deep learning</div>'
    + 'A 100-layer network is a 100-deep nested function. The chain rule lets you compute the gradient with respect to ANY parameter using local derivatives at each layer multiplied together. <em>That\'s</em> backpropagation. Without the chain rule, training would require an exponential number of computations.'
    + '</div>'

    + '<h4>Partial derivatives</h4>'
    + '<p>For a function of multiple variables, <strong>∂f/∂x</strong> is the derivative w.r.t. x while pretending y, z, ... are constants.</p>'
    + '<div class="example"><div class="label">f(x, y) = x²y + y²</div>'
    + '∂f/∂x = 2x · y + 0 = <strong>2xy</strong> &nbsp;<span class="muted">(treat y as a constant)</span><br>'
    + '∂f/∂y = x² + 2y &nbsp;<span class="muted">(treat x as a constant)</span>'
    + '</div>'

    + '<h4>The gradient</h4>'
    + '<p>Stack all the partial derivatives of f into one vector and you have <strong>∇f</strong>:</p>'
    + '<div class="formula-box">∇f(x, y, z) = [∂f/∂x, &nbsp;∂f/∂y, &nbsp;∂f/∂z]</div>'
    + '<p>Geometrically, ∇f points in the direction of steepest <em>ascent</em>. To minimize a loss we go the <em>opposite</em> way — that\'s gradient descent (level 5).</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Pick a function. The play surface plots f and f\' side by side and reports values at a point you choose.';
    container.appendChild(help);

    var fns = [
      { name: 'f(x) = x²',          f: function (x) { return x * x; },                   df: function (x) { return 2 * x; },                                            range: [-3, 3] },
      { name: 'f(x) = x³ - 3x',     f: function (x) { return x * x * x - 3 * x; },       df: function (x) { return 3 * x * x - 3; },                                    range: [-3, 3] },
      { name: 'f(x) = e^x',         f: function (x) { return Math.exp(x); },             df: function (x) { return Math.exp(x); },                                      range: [-2, 2] },
      { name: 'f(x) = sin(x)',      f: function (x) { return Math.sin(x); },             df: function (x) { return Math.cos(x); },                                      range: [-Math.PI*2, Math.PI*2] },
      { name: 'f(x) = σ(x) (sigmoid)', f: function (x) { return 1 / (1 + Math.exp(-x)); }, df: function (x) { var s = 1 / (1 + Math.exp(-x)); return s * (1 - s); },     range: [-6, 6] },
      { name: 'f(x) = (3x + 2)²',   f: function (x) { var u = 3*x+2; return u * u; },     df: function (x) { return 6 * (3 * x + 2); },                                  range: [-2, 1] }
    ];

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    var sel = document.createElement('select');
    fns.forEach(function (fn, i) { sel.innerHTML += '<option value="' + i + '">' + fn.name + '</option>'; });
    var label = document.createElement('label'); label.textContent = 'Function: ';
    label.appendChild(sel); ctrls.appendChild(label);
    var xLabel = document.createElement('label');
    xLabel.innerHTML = '&nbsp;&nbsp;x = <span id="dp-x">0.5</span>';
    var range = document.createElement('input');
    range.type = 'range'; range.min = '-3'; range.max = '3'; range.step = '0.05'; range.value = '0.5'; range.style.width = '200px';
    xLabel.appendChild(range);
    ctrls.appendChild(xLabel);
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 220;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var output = document.createElement('div');
    output.className = 'formula-box';
    output.style.fontSize = '13px';
    container.appendChild(output);

    function render() {
      var fn = fns[parseInt(sel.value, 10)];
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var W = canvas.width / 2 - 10, H = canvas.height;
      var pad = 30;
      var x0 = fn.range[0], x1 = fn.range[1];
      // sample
      var xs = [], fs = [], dfs = [];
      var N = 200;
      var fMin = Infinity, fMax = -Infinity, dMin = Infinity, dMax = -Infinity;
      for (var i = 0; i <= N; i++) {
        var x = x0 + (x1 - x0) * i / N;
        var fy = fn.f(x), dfy = fn.df(x);
        xs.push(x); fs.push(fy); dfs.push(dfy);
        if (isFinite(fy)) { if (fy < fMin) fMin = fy; if (fy > fMax) fMax = fy; }
        if (isFinite(dfy)) { if (dfy < dMin) dMin = dfy; if (dfy > dMax) dMax = dfy; }
      }
      // pad ranges
      function pr(lo, hi) { var pad2 = (hi - lo) * 0.1 || 1; return [lo - pad2, hi + pad2]; }
      var fr = pr(fMin, fMax), dr = pr(dMin, dMax);

      function drawAxes(x0px, w, h, title, yLo, yHi) {
        ctx.strokeStyle = '#3a4256';
        ctx.lineWidth = 1;
        // x-axis
        var y0 = h - pad - (0 - yLo) / (yHi - yLo) * (h - 2 * pad);
        ctx.beginPath();
        ctx.moveTo(x0px + pad, y0); ctx.lineTo(x0px + w - 5, y0); ctx.stroke();
        // y-axis (at x=0 if in range)
        var xAxisX = x0px + pad + (0 - x0) / (x1 - x0) * (w - pad - 5);
        if (xAxisX > x0px + pad && xAxisX < x0px + w - 5) {
          ctx.beginPath(); ctx.moveTo(xAxisX, pad); ctx.lineTo(xAxisX, h - pad); ctx.stroke();
        }
        ctx.fillStyle = '#9aa3b2';
        ctx.font = '12px monospace';
        ctx.fillText(title, x0px + pad, 16);
      }
      function drawCurve(x0px, w, h, ys, yLo, yHi, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        var any = false;
        for (var i = 0; i <= N; i++) {
          var px = x0px + pad + (xs[i] - x0) / (x1 - x0) * (w - pad - 5);
          var py = h - pad - (ys[i] - yLo) / (yHi - yLo) * (h - 2 * pad);
          if (!isFinite(py)) continue;
          if (!any) { ctx.moveTo(px, py); any = true; }
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      drawAxes(0, W, H, 'f(x)', fr[0], fr[1]);
      drawCurve(0, W, H, fs, fr[0], fr[1], '#7ab7ff');
      drawAxes(W + 20, W, H, "f'(x)", dr[0], dr[1]);
      drawCurve(W + 20, W, H, dfs, dr[0], dr[1], '#a78bfa');

      // marker at chosen x — clamp x to the function's range so the marker stays meaningful
      var rawX = parseFloat(range.value);
      var xMark = Math.max(x0, Math.min(x1, rawX));
      var fMark = fn.f(xMark), dMark = fn.df(xMark);
      [
        [0, fs, fr, fMark, '#7ab7ff'],
        [W + 20, dfs, dr, dMark, '#a78bfa']
      ].forEach(function (g) {
        var px = g[0] + pad + (xMark - x0) / (x1 - x0) * (W - pad - 5);
        var py = H - pad - (g[3] - g[2][0]) / (g[2][1] - g[2][0]) * (H - 2 * pad);
        ctx.fillStyle = g[4];
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      });

      document.getElementById('dp-x').textContent = xMark.toFixed(2);
      output.innerHTML =
        '<div><span class="muted">at x =</span> <strong>' + xMark.toFixed(2) + '</strong></div>'
      + '<div><span class="muted">f(x)  =</span> <span class="result">' + fMark.toFixed(4) + '</span></div>'
      + '<div><span class="muted">f\'(x) =</span> <span class="result">' + dMark.toFixed(4) + '</span> &nbsp; <span class="muted">(slope of the tangent line)</span></div>';
    }

    sel.addEventListener('change', function () {
      var fn = fns[parseInt(sel.value, 10)];
      range.min = String(fn.range[0]); range.max = String(fn.range[1]);
      if (parseFloat(range.value) < fn.range[0] || parseFloat(range.value) > fn.range[1]) range.value = '0';
      render();
    });
    range.addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the derivative of <code class="inline">f(x) = x³</code>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = ['x²', '2x²', '3x²', '3x³', 'x³ / 3'];
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '3x²') return { correct: true, feedback: 'Right. Power rule: d/dx [xⁿ] = n · xⁿ⁻¹. So d/dx [x³] = 3x².' };
        return { correct: false, feedback: 'Power rule: d/dx [xⁿ] = n · xⁿ⁻¹. For x³, that\'s 3x².' };
      },
      hints: [
        'Use the power rule: d/dx [xⁿ] = n · xⁿ⁻¹.',
        'For n = 3: bring the 3 down, drop the exponent by one.',
        '3x².'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Use the chain rule. What is <code class="inline">d/dx [(2x + 1)³]</code> at x = 1?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (v === 54) return { correct: true, feedback: 'Right. Let u = 2x+1, so y = u³. dy/du = 3u², du/dx = 2. Chain: dy/dx = 3u² · 2 = 6u² = 6(2x+1)². At x = 1: 6 · (3)² = 6 · 9 = 54.' };
        return { correct: false, feedback: 'Chain rule: 6(2x+1)². At x = 1, that\'s 6·9 = 54.' };
      },
      hints: [
        'Set u = 2x + 1. Then y = u³. Compute dy/du and du/dx separately, then multiply.',
        'dy/du = 3u², du/dx = 2 → dy/dx = 6u² = 6(2x+1)².',
        'At x = 1: 2x+1 = 3, so 6 · 3² = 6 · 9 = 54.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'For <code class="inline">f(x, y) = x²y + y³</code>, what is the partial derivative <strong>∂f/∂y</strong>?',
      mountInput: function (c) {
        var opts = ['2xy', 'x² + 3y²', '2xy + 3y²', 'x² + y²', 'x³ + 3y²'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'x² + 3y²') return { correct: true, feedback: 'Right. Treat x as a constant. d/dy [x²·y] = x² (since x² is constant w.r.t. y). d/dy [y³] = 3y². Sum: x² + 3y².' };
        return { correct: false, feedback: 'For ∂/∂y, treat x as a constant. d/dy [x²·y] = x², d/dy [y³] = 3y². Sum: x² + 3y².' };
      },
      hints: [
        'Partial w.r.t. y means: pretend x is a constant.',
        'For the term x²·y, the y is the only variable — derivative is x² · 1.',
        'For y³, derivative is 3y². Sum: x² + 3y².'
      ]
    }
  ]
});
