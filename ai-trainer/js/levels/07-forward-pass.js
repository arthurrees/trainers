// Level 7 — Forward Pass Through an MLP
AIT.registerLevel({
  id: 7,
  title: 'Forward Pass Through an MLP',
  whyItMatters: 'A multi-layer perceptron is the simplest deep network and the building block of nearly everything else (the FFN inside transformer blocks is just an MLP). Walking through one forward pass with concrete numbers makes layers, shapes, and weights physically real.',
  glossary: ['MLP', 'forward pass', 'parameter', 'weight', 'bias', 'activation', 'matmul'],
  learn: ''
    + '<h4>The architecture</h4>'
    + '<p>An <strong>MLP</strong> (multi-layer perceptron) is a sequence of <em>fully connected layers</em>. Each layer:</p>'
    + '<ol>'
    +   '<li>Takes the previous layer\'s output as input.</li>'
    +   '<li>Computes a matmul: pre = W · x + b.</li>'
    +   '<li>Applies an activation: out = f(pre).</li>'
    + '</ol>'
    + '<p>For a 2-layer MLP with input x, hidden layer h, output y:</p>'
    + '<div class="formula-box">'
    + 'h = ReLU(<strong>W₁</strong> · x + <strong>b₁</strong>) &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">hidden layer</span><br>'
    + 'y = <strong>W₂</strong> · h + <strong>b₂</strong> &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">output (no activation for regression, softmax for classification)</span>'
    + '</div>'

    + '<h4>The shapes</h4>'
    + '<p>If x has dimension d_in and the hidden layer has h neurons:</p>'
    + '<ul>'
    +   '<li>W₁ has shape (h × d_in)</li>'
    +   '<li>b₁ has shape (h,)</li>'
    +   '<li>W₂ has shape (d_out × h)</li>'
    +   '<li>b₂ has shape (d_out,)</li>'
    + '</ul>'
    + '<p>Each W has one row per output neuron, one column per input. Each entry of b is a per-neuron offset.</p>'

    + '<h4>Worked example — 2 inputs, 2 hidden, 1 output</h4>'
    + '<div class="example"><div class="label">Parameters</div>'
    + 'W₁ = [[1, 2], [-1, 1]] (2×2) &nbsp;&nbsp; b₁ = [0, 1]<br>'
    + 'W₂ = [[1, -1]] (1×2) &nbsp;&nbsp; b₂ = [0]<br>'
    + 'Input: x = [1, 2]'
    + '</div>'
    + '<div class="example"><div class="label">Forward pass</div>'
    + 'pre₁ = W₁ · x + b₁<br>'
    + '&nbsp;&nbsp;= [1·1 + 2·2, &nbsp; (−1)·1 + 1·2] + [0, 1]<br>'
    + '&nbsp;&nbsp;= [5, 1] + [0, 1] = <strong>[5, 2]</strong><br><br>'
    + 'h = ReLU([5, 2]) = <strong>[5, 2]</strong> &nbsp;<span class="muted">(both positive, no clipping)</span><br><br>'
    + 'y = W₂ · h + b₂ = [1·5 + (−1)·2] + [0] = [3] + [0] = <strong>[3]</strong>'
    + '</div>'

    + '<h4>Counting parameters</h4>'
    + '<p>For a layer with d_in inputs and d_out outputs: <strong>d_in · d_out + d_out</strong> parameters (weights + biases). For our example:</p>'
    + '<ul>'
    +   '<li>Layer 1: 2·2 + 2 = 6 params</li>'
    +   '<li>Layer 2: 2·1 + 1 = 3 params</li>'
    +   '<li>Total: 9 params</li>'
    + '</ul>'
    + '<p>For comparison: GPT-3 has 175 billion params spread across 96 layers of (mostly) attention + FFN blocks. Same forward-pass mechanics, vastly more numbers.</p>'

    + '<h4>Batched forward pass</h4>'
    + '<p>In practice we don\'t feed one example at a time. We stack a batch of B examples into a matrix X of shape (B × d_in) and compute:</p>'
    + '<div class="formula-box">H = ReLU(X · W₁ᵀ + b₁) &nbsp;&nbsp; <span class="muted">(B × h)</span><br>Y = H · W₂ᵀ + b₂ &nbsp;&nbsp; <span class="muted">(B × d_out)</span></div>'
    + '<p>Same formulas, slightly transposed conventions, hugely more efficient on a GPU because matmul throughput scales with size.</p>'

    + '<div class="callout"><div class="label">Why this is the universal building block</div>'
    + 'In a transformer, each block is "self-attention, then a 2-layer MLP, then a residual connection." That MLP is exactly what we just built. Half the parameters of a modern LLM live in those FFN MLPs. If you understand this level, you understand half a transformer block — we\'ll cover the other half (attention) in level 12.'
    + '</div>',

  mountPlay: function (container) {
    var mat = AIT.lib.mat;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Tiny MLP: 2 inputs → 3 hidden (ReLU) → 1 output. Drag the input sliders; watch values flow through the network.';
    container.appendChild(help);

    var W1 = [[0.5, -0.5], [1.0, 0.5], [-0.3, 1.0]];
    var b1 = [0.1, -0.2, 0.4];
    var W2 = [[1.0, -0.5, 0.7]];
    var b2 = [0.0];

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>x₁ <input type="number" id="fp-x1" value="1" step="0.1" style="width:80px"></label>'
    + '<label>x₂ <input type="number" id="fp-x2" value="-1" step="0.1" style="width:80px"></label>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 320;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function relu(v) { return v.map(function (x) { return Math.max(0, x); }); }

    // node positions
    var nodes = {
      input:  [{ x: 90,  y: 110, label: 'x₁' }, { x: 90, y: 220, label: 'x₂' }],
      hidden: [{ x: 360, y: 70 }, { x: 360, y: 165 }, { x: 360, y: 260 }],
      output: [{ x: 630, y: 165, label: 'y' }]
    };

    function valueToColor(v) {
      // green for positive, red for negative, intensity by magnitude (clamped)
      var m = Math.min(1, Math.abs(v) / 4);
      if (v >= 0) return 'rgba(74, 222, 128, ' + (0.25 + m * 0.55) + ')';
      return 'rgba(248, 113, 113, ' + (0.25 + m * 0.55) + ')';
    }

    function drawNode(ctx, x, y, label, value, isHidden) {
      ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fillStyle = valueToColor(value);
      ctx.fill();
      ctx.strokeStyle = '#2a3142'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#e6e8ee';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (label) ctx.fillText(label, x, y - 6);
      ctx.font = '11px monospace';
      ctx.fillText(value.toFixed(2), x, y + 7);
    }

    function drawEdge(ctx, x1, y1, x2, y2, weight, hl) {
      var alpha = Math.min(1, 0.3 + Math.abs(weight) * 0.5);
      ctx.strokeStyle = weight >= 0
        ? 'rgba(122, 183, 255, ' + alpha + ')'
        : 'rgba(248, 113, 113, ' + alpha + ')';
      ctx.lineWidth = 0.8 + Math.abs(weight) * 1.6;
      ctx.beginPath();
      // start/end at edge of node circle (radius 24)
      var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx*dx + dy*dy);
      var sx = x1 + dx / d * 24, sy = y1 + dy / d * 24;
      var ex = x2 - dx / d * 24, ey = y2 - dy / d * 24;
      ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
      ctx.stroke();
      // weight label at ~70% along the edge
      ctx.fillStyle = 'rgba(154, 163, 178, 0.9)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      var lx = x1 + dx * 0.65, ly = y1 + dy * 0.65 - 4;
      // small chip background
      var w = ctx.measureText(weight.toFixed(2)).width + 6;
      ctx.fillStyle = 'rgba(31, 37, 51, 0.9)';
      ctx.fillRect(lx - w/2, ly - 7, w, 13);
      ctx.fillStyle = weight >= 0 ? '#7ab7ff' : '#f87171';
      ctx.fillText(weight.toFixed(2), lx, ly + 3);
    }

    function render() {
      var x1 = parseFloat(document.getElementById('fp-x1').value);
      var x2 = parseFloat(document.getElementById('fp-x2').value);
      var x = [x1, x2];
      var pre1 = mat.matvec(W1, x).map(function (v, i) { return v + b1[i]; });
      var h = relu(pre1);
      var y = mat.matvec(W2, h).map(function (v, i) { return v + b2[i]; });

      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // layer labels
      ctx.fillStyle = '#9aa3b2'; ctx.font = '11px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('Input', 90, 12);
      ctx.fillText('Hidden (ReLU)', 360, 12);
      ctx.fillText('Output', 630, 12);

      // edges: input → hidden
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          drawEdge(ctx, nodes.input[i].x, nodes.input[i].y, nodes.hidden[j].x, nodes.hidden[j].y, W1[j][i]);
        }
      }
      // edges: hidden → output
      for (var k = 0; k < 3; k++) {
        drawEdge(ctx, nodes.hidden[k].x, nodes.hidden[k].y, nodes.output[0].x, nodes.output[0].y, W2[0][k]);
      }

      // nodes
      drawNode(ctx, nodes.input[0].x, nodes.input[0].y, 'x₁', x[0]);
      drawNode(ctx, nodes.input[1].x, nodes.input[1].y, 'x₂', x[1]);
      for (var hi = 0; hi < 3; hi++) {
        drawNode(ctx, nodes.hidden[hi].x, nodes.hidden[hi].y, 'h' + (hi+1), h[hi], true);
      }
      drawNode(ctx, nodes.output[0].x, nodes.output[0].y, 'y', y[0]);

      // bias annotations under each post-bias node
      ctx.fillStyle = '#9aa3b2'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      for (var bi = 0; bi < 3; bi++) {
        ctx.fillText('+b=' + b1[bi].toFixed(2), nodes.hidden[bi].x, nodes.hidden[bi].y + 38);
        ctx.fillText('pre=' + pre1[bi].toFixed(2), nodes.hidden[bi].x, nodes.hidden[bi].y + 50);
      }
      ctx.fillText('+b=' + b2[0].toFixed(2), nodes.output[0].x, nodes.output[0].y + 38);

      // legend
      ctx.fillStyle = '#9aa3b2'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText('edge color/thickness = weight sign/magnitude', 12, canvas.height - 24);
      ctx.fillText('node color = activation value (green +, red −)', 12, canvas.height - 10);

      function vec(v) { return '[' + v.map(function (x) { return x.toFixed(3); }).join(', ') + ']'; }
      box.innerHTML =
        '<div><span class="muted">x =</span> ' + vec(x)
      + ' &nbsp; <span class="muted">pre₁ =</span> ' + vec(pre1)
      + ' &nbsp; <span class="muted">h =</span> <span class="result">' + vec(h) + '</span>'
      + ' &nbsp; <span class="muted">y =</span> <span class="result">' + vec(y) + '</span></div>';
    }
    document.getElementById('fp-x1').addEventListener('input', render);
    document.getElementById('fp-x2').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'An MLP layer maps 4 inputs to 5 outputs. How many <strong>parameters</strong> (weights + biases) does this layer have?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 25) return { correct: true, feedback: 'Right. Weight matrix is 5×4 = 20 entries. Plus 5 biases (one per output). 20 + 5 = 25.' };
        if (v === 20) return { correct: false, feedback: 'Close — that\'s just weights. Don\'t forget the bias vector (one bias per output neuron).' };
        return { correct: false, feedback: 'd_in · d_out (weights) + d_out (biases) = 4·5 + 5 = 25.' };
      },
      hints: [
        'Weights form a matrix of shape (d_out × d_in).',
        '5 × 4 = 20 weights, plus 5 biases.',
        '20 + 5 = 25.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'For a layer with W = [[1, 2], [-1, 0]], b = [0, 1], and input x = [3, 1], what is the <strong>pre-activation</strong> (before any activation function)?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text'; input.placeholder = 'e.g. [a, b]';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        // pre = W·x + b. Row 0: 1·3 + 2·1 = 5. Row 1: -1·3 + 0·1 = -3. + b: [5+0, -3+1] = [5, -2]
        var ok = /^\[?\s*5\s*,\s*-2\s*\]?$/;
        if (ok.test(v)) return { correct: true, feedback: 'Right. Row 0: 1·3 + 2·1 = 5, +0 = 5. Row 1: −1·3 + 0·1 = −3, +1 = −2. Pre = [5, −2].' };
        return { correct: false, feedback: 'Pre-activation = W·x + b. Row 0: 1·3 + 2·1 + 0 = 5. Row 1: (−1)·3 + 0·1 + 1 = −2. Answer: [5, −2].' };
      },
      hints: [
        'Compute W · x first, then add b.',
        'W · x = [1·3 + 2·1, &nbsp; −1·3 + 0·1] = [5, −3].',
        'Add b = [0, 1] → [5, −2].'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Take the result above (pre = [5, −2]) and pass it through ReLU. Then a 1-output layer with W₂ = [[1, 1]] and b₂ = [0]. What is the final output?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        // ReLU([5, -2]) = [5, 0]. W2 · [5, 0] + 0 = 1·5 + 1·0 = 5
        if (v === 5) return { correct: true, feedback: 'Right. ReLU([5, −2]) = [5, 0]. Then 1·5 + 1·0 + 0 = 5.' };
        if (v === 3) return { correct: false, feedback: 'Did you skip ReLU and use the raw [5, −2]? ReLU clips negatives to 0, so the input to layer 2 is [5, 0], not [5, −2]. Then 1·5 + 1·0 = 5.' };
        return { correct: false, feedback: 'ReLU([5, −2]) = [5, 0]. Then W₂ · [5, 0] + b₂ = 1·5 + 1·0 + 0 = 5.' };
      },
      hints: [
        'ReLU([5, −2]) — what does ReLU do to negative values?',
        'ReLU([5, −2]) = [5, 0].',
        'W₂ · [5, 0] = 1·5 + 1·0 = 5. Plus b₂ = 0 → 5.'
      ]
    }
  ]
});
