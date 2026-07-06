// Level 3 — Linear Regression & MSE
AIT.registerLevel({
  id: 3,
  title: 'Linear Regression & MSE',
  whyItMatters: 'A linear model with one weight and one bias is the simplest "neural network" you can build. Once you fit it by minimizing MSE, you have done in 5 minutes what every deep learning system does in slow motion at huge scale.',
  glossary: ['parameter', 'weight', 'bias', 'loss', 'MSE'],
  learn: ''
    + '<h4>The simplest model</h4>'
    + '<p>You have data points (x₁, y₁), ..., (xₙ, yₙ) and you want to predict y from x. Linear regression assumes the relationship is a straight line:</p>'
    + '<div class="formula-box"><strong>ŷ = w · x + b</strong></div>'
    + '<p>Two parameters: a slope <strong>w</strong> (weight) and an intercept <strong>b</strong> (bias). Different (w, b) → different lines → different predictions.</p>'

    + '<h4>How wrong is a line? Mean squared error</h4>'
    + '<p>For each data point, the error is the gap between predicted and actual:</p>'
    + '<div class="formula-box"><strong>error_i = ŷ_i − y_i = (w · x_i + b) − y_i</strong></div>'
    + '<p>Square each error and average:</p>'
    + '<div class="formula-box"><strong>MSE</strong> = (1/n) Σ (ŷ_i − y_i)²</div>'
    + '<p>Why squared, not absolute? Three reasons:</p>'
    + '<ul>'
    +   '<li>Smooth and differentiable everywhere — no kink at zero like |x|.</li>'
    +   '<li>Convex — exactly one minimum, so optimization is easy.</li>'
    +   '<li>Penalizes big errors disproportionately — a single 10-off prediction costs as much as a hundred 1-off predictions.</li>'
    + '</ul>'

    + '<h4>Worked example</h4>'
    + '<p>Data: (1, 2), (2, 3), (3, 5). Try line w = 1, b = 1:</p>'
    + '<div class="example"><div class="label">Step by step</div>'
    + 'ŷ₁ = 1·1 + 1 = 2 &nbsp;&nbsp; error₁ = 2 − 2 = 0 &nbsp;&nbsp; sq = 0<br>'
    + 'ŷ₂ = 1·2 + 1 = 3 &nbsp;&nbsp; error₂ = 3 − 3 = 0 &nbsp;&nbsp; sq = 0<br>'
    + 'ŷ₃ = 1·3 + 1 = 4 &nbsp;&nbsp; error₃ = 4 − 5 = −1 &nbsp; sq = 1<br>'
    + 'MSE = (0 + 0 + 1) / 3 = <strong>0.333</strong>'
    + '</div>'

    + '<h4>Two ways to fit</h4>'
    + '<p>For linear regression specifically, you can solve for the optimal (w, b) in closed form (the "normal equations"). But the deep-learning recipe — gradient descent — works for <em>any</em> model, including ones with no closed-form solution. We\'ll use linear regression as the sandbox to introduce gradients in the next two levels.</p>'

    + '<div class="callout"><div class="label">It\'s a 1-neuron network</div>'
    + 'A single neuron with no activation function and one input is exactly y = w · x + b. Add many inputs and the same shape becomes y = w · x + b with x and w as vectors. Stack many of those, add nonlinearities between them, and you have a neural network. Linear regression is the atom.'
    + '</div>'

    + '<h4>What "training" means here</h4>'
    + '<p>Pick (w, b) to minimize MSE on your data. Different metrics for different losses, but the recipe — define a loss, minimize it — is identical across all of ML.</p>',

  mountPlay: function (container) {
    var canvasUtils = AIT.lib.canvas;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Drag the sliders for w (slope) and b (intercept). Watch the line move and the MSE update.';
    container.appendChild(help);

    var data = [[1, 2.1], [2, 2.8], [3, 4.0], [4, 5.2], [5, 5.9], [6, 7.1], [7, 7.8], [8, 9.0]];
    var state = { w: 0, b: 0 };

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>w = <span id="lr-w">0.0</span> <input type="range" id="lr-w-r" min="-2" max="3" step="0.05" value="0" style="width:200px"></label>'
    + '<label>b = <span id="lr-b">0.0</span> <input type="range" id="lr-b-r" min="-3" max="3" step="0.05" value="0" style="width:200px"></label>'
    + '<button class="ghost-btn" id="lr-best">Snap to best fit</button>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 320;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function mse(w, b) {
      var s = 0;
      for (var i = 0; i < data.length; i++) {
        var e = (w * data[i][0] + b) - data[i][1];
        s += e * e;
      }
      return s / data.length;
    }

    function bestFit() {
      // closed-form: w = cov(x,y)/var(x), b = mean(y) - w*mean(x)
      var n = data.length, sx = 0, sy = 0;
      for (var i = 0; i < n; i++) { sx += data[i][0]; sy += data[i][1]; }
      var mx = sx / n, my = sy / n;
      var num = 0, den = 0;
      for (var j = 0; j < n; j++) {
        num += (data[j][0] - mx) * (data[j][1] - my);
        den += (data[j][0] - mx) * (data[j][0] - mx);
      }
      var w = num / den;
      var b = my - w * mx;
      return [w, b];
    }

    function render() {
      state.w = parseFloat(document.getElementById('lr-w-r').value);
      state.b = parseFloat(document.getElementById('lr-b-r').value);
      document.getElementById('lr-w').textContent = state.w.toFixed(2);
      document.getElementById('lr-b').textContent = state.b.toFixed(2);

      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      var xMin = 0, xMax = 9, yMin = 0, yMax = 11;

      // axes
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, W - 2*pad, H - 2*pad);

      function px(x) { return canvasUtils.scale(x, xMin, xMax, pad, W - pad); }
      function py(y) { return canvasUtils.scale(y, yMin, yMax, H - pad, pad); }

      // residual lines
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.5;
      for (var i = 0; i < data.length; i++) {
        var x = data[i][0], y = data[i][1];
        var yhat = state.w * x + state.b;
        ctx.beginPath(); ctx.moveTo(px(x), py(y)); ctx.lineTo(px(x), py(yhat)); ctx.stroke();
      }

      // regression line
      ctx.strokeStyle = '#7ab7ff'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(px(xMin), py(state.w * xMin + state.b)); ctx.lineTo(px(xMax), py(state.w * xMax + state.b)); ctx.stroke();

      // points
      ctx.fillStyle = '#a78bfa';
      for (var j = 0; j < data.length; j++) {
        ctx.beginPath(); ctx.arc(px(data[j][0]), py(data[j][1]), 5, 0, Math.PI * 2); ctx.fill();
      }

      var loss = mse(state.w, state.b);
      box.innerHTML =
        '<div><span class="muted">Line:</span> ŷ = <strong>' + state.w.toFixed(2) + '</strong> · x + <strong>' + state.b.toFixed(2) + '</strong></div>'
      + '<div><span class="muted">MSE:</span> <span class="result">' + loss.toFixed(4) + '</span></div>'
      + '<div class="muted">Red bars are residuals (gaps). MSE squares and averages them.</div>';
    }

    document.getElementById('lr-w-r').addEventListener('input', render);
    document.getElementById('lr-b-r').addEventListener('input', render);
    document.getElementById('lr-best').addEventListener('click', function () {
      var bf = bestFit();
      document.getElementById('lr-w-r').value = bf[0].toFixed(2);
      document.getElementById('lr-b-r').value = bf[1].toFixed(2);
      render();
    });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Given <code class="inline">w = 2, b = -1</code>, what does the model predict for <code class="inline">x = 5</code>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (v === 9) return { correct: true, feedback: 'Right. ŷ = 2·5 + (−1) = 10 − 1 = 9.' };
        return { correct: false, feedback: 'ŷ = w·x + b = 2·5 + (−1) = 9.' };
      },
      hints: [
        'Plug into ŷ = w·x + b.',
        '2·5 = 10, then add b (which is −1).',
        '10 − 1 = 9.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Compute the MSE on this dataset for the line ŷ = x + 1:<br>'
            + '<code class="inline">(1, 2), (2, 4), (3, 4)</code>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        // ŷ for x=1,2,3 is 2,3,4. errors: 0, -1, 0. squared: 0,1,0. mean = 1/3 ≈ 0.333
        var target = 1/3;
        if (Math.abs(v - target) < 0.01) return { correct: true, feedback: 'Right. Predictions are 2, 3, 4. Errors: 0, −1, 0. Squared: 0, 1, 0. Mean = 1/3 ≈ 0.333.' };
        return { correct: false, feedback: 'Predictions: 2, 3, 4. Errors (ŷ − y): 0, −1, 0. Squared: 0, 1, 0. Mean = 1/3 ≈ 0.333.' };
      },
      hints: [
        'Compute ŷ for each x using ŷ = x + 1.',
        'Errors are (ŷ − y) for each pair: 2−2=0, 3−4=−1, 4−4=0.',
        'Square: 0, 1, 0. Average: 1/3 ≈ 0.333.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'For two data points <code class="inline">(0, 1)</code> and <code class="inline">(2, 3)</code>, what (w, b) gives MSE = 0?',
      mountInput: function (c) {
        var div = document.createElement('div');
        div.innerHTML = '<label>w = <input type="number" id="lr3-w" step="any" style="width:90px"></label> '
                      + '<label>b = <input type="number" id="lr3-b" step="any" style="width:90px"></label>';
        c.appendChild(div);
        return function () {
          return [parseFloat(document.getElementById('lr3-w').value), parseFloat(document.getElementById('lr3-b').value)];
        };
      },
      check: function (v) {
        var w = v[0], b = v[1];
        if (Math.abs(w - 1) < 0.01 && Math.abs(b - 1) < 0.01) {
          return { correct: true, feedback: 'Right. The line through (0, 1) and (2, 3) has slope (3−1)/(2−0) = 1, intercept 1. ŷ = x + 1 hits both points exactly → MSE = 0.' };
        }
        return { correct: false, feedback: 'A line through (0, 1) has b = 1 (when x=0, ŷ should = 1). Slope is (3−1)/(2−0) = 1. So w = 1, b = 1.' };
      },
      hints: [
        'MSE = 0 means the line passes through every point exactly. With 2 points and 2 parameters, this is always possible.',
        'Find the slope: (y₂ − y₁) / (x₂ − x₁) = (3 − 1) / (2 − 0) = 1.',
        'Plug in (0, 1): 1 = w·0 + b → b = 1. So w = 1, b = 1.'
      ]
    }
  ]
});
