// Level 8 — Backpropagation by Hand
AIT.registerLevel({
  id: 8,
  title: 'Backpropagation by Hand',
  whyItMatters: 'Backprop is the algorithm that makes deep learning possible. People talk about it like dark magic; it is just the chain rule applied carefully. Compute it once on a 4-parameter network and the whole abstraction becomes mechanical instead of mystical.',
  glossary: ['backprop', 'forward pass', 'backward pass', 'gradient', 'chain rule', 'partial', 'sigmoid'],
  learn: ''
    + '<h4>The setup — a 4-parameter network</h4>'
    + '<p>Input: scalar x. Hidden: one sigmoid neuron. Output: scalar (linear).</p>'
    + '<div class="formula-box">'
    + 'z₁ = w₁ · x + b₁ &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">hidden pre-activation</span><br>'
    + 'h &nbsp;= σ(z₁) &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">hidden activation</span><br>'
    + 'ŷ &nbsp;= w₂ · h + b₂ &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">output</span><br>'
    + 'L &nbsp;= (ŷ − y)² &nbsp;&nbsp;&nbsp;&nbsp;<span class="muted">squared error vs target y</span>'
    + '</div>'
    + '<p>4 parameters: w₁, b₁, w₂, b₂. Goal: compute ∂L/∂w₁, ∂L/∂b₁, ∂L/∂w₂, ∂L/∂b₂.</p>'

    + '<h4>The forward pass — concrete numbers</h4>'
    + '<p>x = 1, &nbsp; y = 1, &nbsp; w₁ = 0.5, b₁ = 0, &nbsp; w₂ = 1.0, b₂ = 0.</p>'
    + '<div class="example"><div class="label">Compute forward</div>'
    + 'z₁ = 0.5·1 + 0 = 0.5<br>'
    + 'h &nbsp;= σ(0.5) = 1 / (1 + e<sup>−0.5</sup>) ≈ <strong>0.6225</strong><br>'
    + 'ŷ &nbsp;= 1.0·0.6225 + 0 = <strong>0.6225</strong><br>'
    + 'L &nbsp;= (0.6225 − 1)² = (−0.3775)² ≈ <strong>0.1425</strong>'
    + '</div>'

    + '<h4>The backward pass — chain rule, layer by layer</h4>'
    + '<p>Walk backwards. At each step, multiply by the local derivative.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 6px">Step 1 — at the loss</h5>'
    + '<div class="formula-box">∂L/∂ŷ = 2(ŷ − y) = 2 · (−0.3775) ≈ <strong>−0.755</strong></div>'

    + '<h5 style="color:var(--accent);margin:14px 0 6px">Step 2 — through the output layer</h5>'
    + '<p>ŷ = w₂ · h + b₂. Local derivatives:</p>'
    + '<ul>'
    +   '<li>∂ŷ/∂w₂ = h</li>'
    +   '<li>∂ŷ/∂b₂ = 1</li>'
    +   '<li>∂ŷ/∂h &nbsp;= w₂</li>'
    + '</ul>'
    + '<p>Chain with ∂L/∂ŷ:</p>'
    + '<div class="formula-box">'
    + '∂L/∂w₂ = (∂L/∂ŷ) · h &nbsp;= −0.755 · 0.6225 ≈ <strong>−0.470</strong><br>'
    + '∂L/∂b₂ = (∂L/∂ŷ) · 1 = <strong>−0.755</strong><br>'
    + '∂L/∂h &nbsp; = (∂L/∂ŷ) · w₂ = −0.755 · 1.0 = <strong>−0.755</strong>'
    + '</div>'

    + '<h5 style="color:var(--accent);margin:14px 0 6px">Step 3 — through the sigmoid</h5>'
    + '<p>h = σ(z₁). Sigmoid derivative: σ\'(z) = σ(z)(1 − σ(z)). Here:</p>'
    + '<div class="formula-box">∂h/∂z₁ = h · (1 − h) = 0.6225 · 0.3775 ≈ <strong>0.2350</strong></div>'
    + '<p>Chain:</p>'
    + '<div class="formula-box">∂L/∂z₁ = (∂L/∂h) · (∂h/∂z₁) = −0.755 · 0.2350 ≈ <strong>−0.177</strong></div>'

    + '<h5 style="color:var(--accent);margin:14px 0 6px">Step 4 — through the hidden layer</h5>'
    + '<p>z₁ = w₁ · x + b₁. Locals:</p>'
    + '<ul>'
    +   '<li>∂z₁/∂w₁ = x</li>'
    +   '<li>∂z₁/∂b₁ = 1</li>'
    + '</ul>'
    + '<p>Chain:</p>'
    + '<div class="formula-box">'
    + '∂L/∂w₁ = (∂L/∂z₁) · x = −0.177 · 1 = <strong>−0.177</strong><br>'
    + '∂L/∂b₁ = (∂L/∂z₁) · 1 = <strong>−0.177</strong>'
    + '</div>'

    + '<h4>What just happened</h4>'
    + '<p>For each parameter, we built up its gradient by walking from the loss backwards through every layer it passed through, multiplying local derivatives along the way. That\'s it. <em>That</em> is backprop.</p>'

    + '<h4>The pattern</h4>'
    + '<ol>'
    +   '<li>Forward pass — compute and <em>cache</em> each intermediate (z₁, h, ŷ).</li>'
    +   '<li>Start at the loss: compute ∂L/∂ŷ.</li>'
    +   '<li>For each layer, going backwards: use the locally-known derivative formulas to push the gradient into earlier values.</li>'
    +   '<li>When you reach a parameter, store its gradient.</li>'
    +   '<li>Update: parameter ← parameter − η · gradient.</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">Why this scales to 70 billion parameters</div>'
    + 'The local derivatives at each layer (matmul, ReLU, attention, layer norm) all have closed forms — frameworks like PyTorch / JAX know them. The framework records the forward graph, then walks it backwards using these recipes. The cost of one backward pass is roughly the same as one forward pass — linear in network size, not exponential. Without the chain rule, training would be impossible.'
    + '</div>'

    + '<h4>One step of training</h4>'
    + '<p>With η = 0.5, parameter updates would be:</p>'
    + '<ul>'
    +   '<li>w₁ ← 0.5 − 0.5·(−0.177) = 0.5885</li>'
    +   '<li>b₁ ← 0 − 0.5·(−0.177) = 0.0885</li>'
    +   '<li>w₂ ← 1.0 − 0.5·(−0.470) = 1.235</li>'
    +   '<li>b₂ ← 0 − 0.5·(−0.755) = 0.3775</li>'
    + '</ul>'
    + '<p>Run forward again with these new params: z₁ = 0.6774, h = σ(0.6774) ≈ 0.6632, ŷ = 1.235·0.6632 + 0.3775 ≈ 1.20. Note that with η = 0.5 the step is large — ŷ <em>overshoots</em> past the target of 1.0. The new error |1.20 − 1| = 0.20 is still smaller than the original |0.62 − 1| = 0.38, so we did improve, but a smaller learning rate would have been safer. Iterate millions of times with sensible η. That\'s training.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Adjust x, y, and the four parameters. Blue arrows show the forward pass (left → right). Red arrows show gradients flowing back (right → left). Numbers below each arrow are gradients.';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>x = <input type="number" id="bp-x" value="1" step="0.1" style="width:70px"></label>'
    + '<label>y = <input type="number" id="bp-y" value="1" step="0.1" style="width:70px"></label>'
    + '<label>w₁ = <input type="number" id="bp-w1" value="0.5" step="0.1" style="width:70px"></label>'
    + '<label>b₁ = <input type="number" id="bp-b1" value="0" step="0.1" style="width:70px"></label>'
    + '<label>w₂ = <input type="number" id="bp-w2" value="1" step="0.1" style="width:70px"></label>'
    + '<label>b₂ = <input type="number" id="bp-b2" value="0" step="0.1" style="width:70px"></label>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 760; canvas.height = 280;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

    function valueColor(v) {
      var m = Math.min(1, Math.abs(v) / 3);
      if (v >= 0) return 'rgba(74, 222, 128, ' + (0.25 + m * 0.55) + ')';
      return 'rgba(248, 113, 113, ' + (0.25 + m * 0.55) + ')';
    }
    function drawNode(ctx, x, y, label, value) {
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fillStyle = valueColor(value);
      ctx.fill();
      ctx.strokeStyle = '#2a3142'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#e6e8ee'; ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y - 6);
      ctx.font = '11px monospace';
      ctx.fillText(value.toFixed(3), x, y + 8);
    }
    function drawArrow(ctx, x1, y1, x2, y2, color, label, lw, offsetY) {
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw || 2;
      var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx*dx + dy*dy);
      var sx = x1 + dx / d * 26, sy = y1 + dy / d * 26;
      var ex = x2 - dx / d * 26, ey = y2 - dy / d * 26;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      // arrowhead
      var ah = Math.atan2(ey - sy, ex - sx);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 8 * Math.cos(ah - Math.PI / 7), ey - 8 * Math.sin(ah - Math.PI / 7));
      ctx.lineTo(ex - 8 * Math.cos(ah + Math.PI / 7), ey - 8 * Math.sin(ah + Math.PI / 7));
      ctx.closePath(); ctx.fill();
      // label
      if (label) {
        ctx.fillStyle = '#1f2533';
        var midX = (sx + ex) / 2, midY = (sy + ey) / 2 + (offsetY || 0);
        var tw = ctx.measureText(label).width + 6;
        ctx.fillRect(midX - tw / 2, midY - 8, tw, 14);
        ctx.fillStyle = color; ctx.font = '11px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);
      }
    }

    function render() {
      var x = parseFloat(document.getElementById('bp-x').value);
      var y = parseFloat(document.getElementById('bp-y').value);
      var w1 = parseFloat(document.getElementById('bp-w1').value);
      var b1 = parseFloat(document.getElementById('bp-b1').value);
      var w2 = parseFloat(document.getElementById('bp-w2').value);
      var b2 = parseFloat(document.getElementById('bp-b2').value);

      // Forward
      var z1 = w1 * x + b1;
      var h = sigmoid(z1);
      var yhat = w2 * h + b2;
      var L = (yhat - y) * (yhat - y);

      // Backward
      var dL_dyhat = 2 * (yhat - y);
      var dL_dw2 = dL_dyhat * h;
      var dL_db2 = dL_dyhat;
      var dL_dh = dL_dyhat * w2;
      var dh_dz1 = h * (1 - h);
      var dL_dz1 = dL_dh * dh_dz1;
      var dL_dw1 = dL_dz1 * x;
      var dL_db1 = dL_dz1;

      function f(v) { return v.toFixed(3); }

      // Diagram
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // node positions
      var nx = { x: 80, y: 140 };
      var nz1 = { x: 250, y: 140 };
      var nh = { x: 410, y: 140 };
      var nyh = { x: 580, y: 140 };
      var nL = { x: 720, y: 140 };

      // section labels
      ctx.fillStyle = '#7ab7ff'; ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('FORWARD →', canvas.width / 2, 12);
      ctx.fillStyle = '#f87171';
      ctx.fillText('← BACKWARD (gradients)', canvas.width / 2, 250);

      // forward arrows (blue) — above the line
      drawArrow(ctx, nx.x, nx.y - 16, nz1.x, nz1.y - 16, '#7ab7ff', 'w₁·x + b₁', 2, 0);
      drawArrow(ctx, nz1.x, nz1.y - 16, nh.x, nh.y - 16, '#7ab7ff', 'σ', 2, 0);
      drawArrow(ctx, nh.x, nh.y - 16, nyh.x, nyh.y - 16, '#7ab7ff', 'w₂·h + b₂', 2, 0);
      drawArrow(ctx, nyh.x, nyh.y - 16, nL.x, nL.y - 16, '#7ab7ff', '(ŷ − y)²', 2, 0);

      // backward arrows (red) — below, going right→left
      drawArrow(ctx, nL.x, nL.y + 16, nyh.x, nyh.y + 16, '#f87171', '∂L/∂ŷ = ' + f(dL_dyhat), 2, 0);
      drawArrow(ctx, nyh.x, nyh.y + 16, nh.x, nh.y + 16, '#f87171', '∂L/∂h = ' + f(dL_dh), 2, 0);
      drawArrow(ctx, nh.x, nh.y + 16, nz1.x, nz1.y + 16, '#f87171', '∂L/∂z₁ = ' + f(dL_dz1), 2, 0);

      // nodes
      drawNode(ctx, nx.x, nx.y, 'x', x);
      drawNode(ctx, nz1.x, nz1.y, 'z₁', z1);
      drawNode(ctx, nh.x, nh.y, 'h', h);
      drawNode(ctx, nyh.x, nyh.y, 'ŷ', yhat);
      drawNode(ctx, nL.x, nL.y, 'L', L);

      // parameter gradient labels under their arrows
      ctx.fillStyle = '#fbbf24'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText('∂L/∂w₁ = ' + f(dL_dw1), (nx.x + nz1.x) / 2, 80);
      ctx.fillText('∂L/∂b₁ = ' + f(dL_db1), (nx.x + nz1.x) / 2, 95);
      ctx.fillText('∂L/∂w₂ = ' + f(dL_dw2), (nh.x + nyh.x) / 2, 80);
      ctx.fillText('∂L/∂b₂ = ' + f(dL_db2), (nh.x + nyh.x) / 2, 95);

      box.innerHTML =
        '<div><strong style="color:var(--accent)">Forward</strong> &nbsp; '
      + 'z₁=' + f(z1) + ', &nbsp; h=σ(z₁)=' + f(h) + ', &nbsp; ŷ=' + f(yhat) + ', &nbsp; L=(ŷ−y)²=<strong>' + f(L) + '</strong></div>'
      + '<div><strong style="color:var(--bad)">Backward</strong> &nbsp; '
      + '∂L/∂ŷ=' + f(dL_dyhat) + ' &nbsp; ∂L/∂h=' + f(dL_dh) + ' &nbsp; ∂L/∂z₁=' + f(dL_dz1) + '</div>'
      + '<div><strong style="color:var(--warn)">Parameter gradients</strong> &nbsp; '
      + '∂L/∂w₁=<span class="result">' + f(dL_dw1) + '</span> &nbsp; '
      + '∂L/∂b₁=<span class="result">' + f(dL_db1) + '</span> &nbsp; '
      + '∂L/∂w₂=<span class="result">' + f(dL_dw2) + '</span> &nbsp; '
      + '∂L/∂b₂=<span class="result">' + f(dL_db2) + '</span></div>';
    }
    ['bp-x','bp-y','bp-w1','bp-b1','bp-w2','bp-b2'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', render);
    });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'For loss <code class="inline">L = (ŷ − y)²</code>, what is <code class="inline">∂L/∂ŷ</code>?',
      mountInput: function (c) {
        var opts = ['ŷ − y', '2(ŷ − y)', '(ŷ − y)²', '−2(ŷ − y)'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2(ŷ − y)') return { correct: true, feedback: 'Right. Treating y as a constant: L = (ŷ − y)². Use chain rule with u = ŷ − y, so L = u² → dL/du = 2u, du/dŷ = 1. Together: 2(ŷ − y).' };
        if (v === '−2(ŷ − y)') return { correct: false, feedback: 'Sign trick — note the derivative is taken w.r.t. ŷ, not y. ∂(ŷ − y)/∂ŷ = +1, not −1. So 2(ŷ − y).' };
        return { correct: false, feedback: 'Chain rule with u = ŷ − y: L = u² → ∂L/∂u = 2u, ∂u/∂ŷ = 1. Together: 2(ŷ − y).' };
      },
      hints: [
        'Power rule + chain rule. Let u = ŷ − y.',
        'L = u². dL/du = 2u. du/dŷ = 1.',
        '2(ŷ − y).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'In the same network as the lesson (hidden has sigmoid), suppose at some forward pass <strong>h = 0.8</strong>. What is <code class="inline">∂h/∂z₁</code> (the sigmoid derivative at z₁)?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        // σ'(z) = h(1-h) = 0.8 * 0.2 = 0.16
        if (Math.abs(v - 0.16) < 1e-3) return { correct: true, feedback: 'Right. σ\'(z) = σ(z)(1 − σ(z)) = h(1 − h) = 0.8 · 0.2 = 0.16. Notice: when h is near 0 or 1 (saturated), this is tiny → vanishing gradient.' };
        return { correct: false, feedback: 'σ\'(z) = h(1−h) = 0.8 · 0.2 = 0.16.' };
      },
      hints: [
        'Sigmoid has the elegant identity σ\'(z) = σ(z)(1 − σ(z)).',
        'h = σ(z₁) = 0.8, so we just plug in: 0.8 · (1 − 0.8).',
        '0.8 · 0.2 = 0.16.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Same network. Given x = 2, h = 0.8, w₂ = 0.5, and ∂L/∂ŷ = −0.4, compute <strong>∂L/∂w₁</strong>.',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        // dL/dh = dL/dyhat * w2 = -0.4 * 0.5 = -0.2
        // dh/dz1 = h(1-h) = 0.16
        // dL/dz1 = -0.2 * 0.16 = -0.032
        // dL/dw1 = dL/dz1 * x = -0.032 * 2 = -0.064
        if (Math.abs(v - (-0.064)) < 1e-3) return { correct: true, feedback: 'Right. Walk the chain: ∂L/∂h = ∂L/∂ŷ · w₂ = −0.4 · 0.5 = −0.2. ∂h/∂z₁ = h(1−h) = 0.16. ∂L/∂z₁ = −0.2 · 0.16 = −0.032. ∂L/∂w₁ = ∂L/∂z₁ · x = −0.032 · 2 = −0.064.' };
        return { correct: false, feedback: 'Step by step: ∂L/∂h = (−0.4)(0.5) = −0.2. ∂h/∂z₁ = 0.8 · 0.2 = 0.16. ∂L/∂z₁ = (−0.2)(0.16) = −0.032. ∂L/∂w₁ = (−0.032)(2) = −0.064.' };
      },
      hints: [
        'Walk from the loss backwards: ∂L/∂h, then ∂L/∂z₁, then ∂L/∂w₁. Multiply local derivatives.',
        '∂L/∂h = ∂L/∂ŷ · w₂ = −0.4 · 0.5 = −0.2. ∂h/∂z₁ = h(1−h) = 0.16.',
        '∂L/∂z₁ = (−0.2)(0.16) = −0.032. ∂L/∂w₁ = ∂L/∂z₁ · x = (−0.032)(2) = −0.064.'
      ]
    }
  ]
});
