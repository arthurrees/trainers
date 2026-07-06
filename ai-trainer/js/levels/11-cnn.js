// Level 11 — Convolutional Neural Networks
AIT.registerLevel({
  id: 11,
  title: 'Convolutional Neural Networks',
  whyItMatters: 'CNNs ruled image processing for a decade and still underpin every camera, every photo app, and most medical imaging. Even now that vision transformers have caught up, the convolution is the cleanest example of "build a strong inductive bias right into the architecture".',
  glossary: ['CNN', 'filter', 'pooling', 'parameter'],
  learn: ''
    + '<h4>The problem with using MLPs on images</h4>'
    + '<p>Take a tiny 100×100 grayscale image — that\'s 10,000 pixels. A fully connected first layer with 1,000 hidden units would have 10⁷ parameters in the first layer alone. Worse, the model doesn\'t know that pixel (3, 4) and (3, 5) are neighbors — every pixel is a separate feature with no spatial structure built in.</p>'

    + '<h4>The convolution — three properties</h4>'
    + '<p>A convolutional layer slides a small filter (kernel) across the image, computing a dot product at each position:</p>'
    + '<ol>'
    +   '<li><strong>Local connectivity</strong> — each output cell only depends on a small patch of the input.</li>'
    +   '<li><strong>Parameter sharing</strong> — the same filter is applied across the whole image. A 3×3 filter is just 9 weights, regardless of image size.</li>'
    +   '<li><strong>Translation equivariance</strong> — shift the input, the output shifts with it. Edges, corners, cat ears — you want to detect them regardless of where they are.</li>'
    + '</ol>'

    + '<h4>The convolution operation</h4>'
    + '<p>For a 3×3 filter K applied at position (i, j) of input I:</p>'
    + '<div class="formula-box">output[i][j] = Σ Σ I[i+u][j+v] · K[u][v]</div>'
    + '<p>Slide the filter, dot-product the patch, write the result. That\'s it.</p>'

    + '<div class="example"><div class="label">Edge detector — Sobel filter (horizontal edges)</div>'
    + '<code class="inline">K = [[ -1, -2, -1 ],</code><br>'
    + '<code class="inline">&nbsp;&nbsp;&nbsp;&nbsp;[&nbsp;&nbsp;0,&nbsp;&nbsp;0,&nbsp;&nbsp;0 ],</code><br>'
    + '<code class="inline">&nbsp;&nbsp;&nbsp;&nbsp;[&nbsp;&nbsp;1,&nbsp;&nbsp;2,&nbsp;&nbsp;1 ]]</code><br><br>'
    + 'Applied to a uniform region: Σ = 0 (no edge). Applied across a horizontal edge: large positive or negative. <strong>The whole point</strong>: the filter\'s job is to fire when its pattern is present.'
    + '</div>'

    + '<h4>Channels and depth</h4>'
    + '<p>A color image has 3 input <strong>channels</strong> (R, G, B). A filter for a 3-channel input is itself shape (3, kH, kW) — one 2-D slice per input channel — and produces one output channel. Stack F filters and you get F output channels. Real CNNs use dozens to hundreds.</p>'

    + '<h4>Stride and padding</h4>'
    + '<ul>'
    +   '<li><strong>Stride s</strong> — how many pixels to move the filter each step. Stride 2 halves output size.</li>'
    +   '<li><strong>Padding p</strong> — pretend the image has p extra zero-rows/columns around the edge so the filter can apply at the borders.</li>'
    + '</ul>'
    + '<p><strong>Output size formula</strong>: <code class="inline">⌊(W + 2p − k) / s⌋ + 1</code>. Memorize it; it\'s the most-asked CNN question on every interview.</p>'

    + '<h4>Pooling</h4>'
    + '<p>Downsample the spatial dimensions, keep the channels. <strong>Max-pool</strong> over a 2×2 window keeps the largest value of each window — the CNN equivalent of "is this feature present somewhere in this region?". Halves H and W.</p>'

    + '<h4>The classic CNN pattern</h4>'
    + '<div class="formula-box">[Conv → ReLU → Pool] × N → Flatten → FC → softmax</div>'
    + '<p>Each [Conv → ReLU → Pool] block: more channels, smaller spatial size. Late layers see a smaller "image" but each cell sees a larger receptive field of the original input. By the end, each feature represents a high-level concept (cat ear, wheel, eye).</p>'

    + '<div class="callout"><div class="label">CNNs vs Transformers (2026)</div>'
    + 'For images, vision transformers (ViTs) have caught up to and often surpassed CNNs at scale. But CNNs still dominate when you have less data, less compute, or need very fast inference. They\'re also still excellent for medical imaging, satellite imagery, and embedded vision. Convolutions are not dead — they\'re just no longer the only game in town.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'A 6×6 input. Pick a filter; see the convolved output. Hover over output cells to see the math (the 3×3 patch and the kernel).';
    container.appendChild(help);

    // a 6×6 image with a horizontal edge halfway down
    var img = [
      [10, 10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10, 10],
      [10, 10, 10, 10, 10, 10],
      [80, 80, 80, 80, 80, 80],
      [80, 80, 80, 80, 80, 80],
      [80, 80, 80, 80, 80, 80]
    ];
    var filters = [
      { name: 'Identity', K: [[0,0,0],[0,1,0],[0,0,0]] },
      { name: 'Horizontal edge (Sobel)', K: [[-1,-2,-1],[0,0,0],[1,2,1]] },
      { name: 'Vertical edge (Sobel)',   K: [[-1,0,1],[-2,0,2],[-1,0,1]] },
      { name: 'Blur (box)', K: [[1,1,1],[1,1,1],[1,1,1]].map(function (r) { return r.map(function (v) { return v / 9; }); }) },
      { name: 'Sharpen',    K: [[0,-1,0],[-1,5,-1],[0,-1,0]] }
    ];

    function conv(I, K) {
      var H = I.length, W = I[0].length, kh = K.length, kw = K[0].length;
      var oH = H - kh + 1, oW = W - kw + 1;
      var O = [];
      for (var i = 0; i < oH; i++) {
        var row = [];
        for (var j = 0; j < oW; j++) {
          var s = 0;
          for (var u = 0; u < kh; u++) for (var v = 0; v < kw; v++) s += I[i+u][j+v] * K[u][v];
          row.push(Math.round(s * 100) / 100);
        }
        O.push(row);
      }
      return O;
    }

    var ctrls = document.createElement('div');
    ctrls.className = 'chip-row';
    container.appendChild(ctrls);
    var current = 1; // edge default
    filters.forEach(function (f, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === current ? ' active' : '');
      b.textContent = f.name;
      b.addEventListener('click', function () {
        current = i;
        Array.prototype.forEach.call(ctrls.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        render();
      });
      ctrls.appendChild(b);
    });

    var grid = document.createElement('div');
    grid.style.display = 'flex';
    grid.style.gap = '24px';
    grid.style.flexWrap = 'wrap';
    grid.style.marginTop = '12px';
    container.appendChild(grid);

    function fmtMat(M, max) {
      var html = '<table style="border-collapse:collapse;font-family:var(--mono);font-size:12px">';
      for (var i = 0; i < M.length; i++) {
        html += '<tr>';
        for (var j = 0; j < M[i].length; j++) {
          var v = M[i][j];
          var t = max ? Math.min(255, Math.max(0, Math.round((v / max) * 255))) : 128;
          var bg = 'rgb(' + t + ',' + t + ',' + t + ')';
          html += '<td style="border:1px solid var(--border);padding:4px;min-width:34px;text-align:center;background:' + bg + ';color:' + (t > 128 ? '#000' : '#fff') + '">' + v + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      return html;
    }
    function fmtKernel(K) {
      var html = '<table style="border-collapse:collapse;font-family:var(--mono);font-size:12px">';
      for (var i = 0; i < K.length; i++) {
        html += '<tr>';
        for (var j = 0; j < K[i].length; j++) {
          var v = Math.round(K[i][j] * 100) / 100;
          html += '<td style="border:1px solid var(--accent);padding:4px;min-width:34px;text-align:center;color:var(--accent)">' + v + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      return html;
    }

    function render() {
      var f = filters[current];
      var O = conv(img, f.K);
      var maxAbs = 0;
      O.forEach(function (r) { r.forEach(function (v) { if (Math.abs(v) > maxAbs) maxAbs = Math.abs(v); }); });
      // For the output, color by magnitude
      var disp = O.map(function (r) { return r.map(function (v) { return Math.abs(Math.round(v)); }); });
      grid.innerHTML =
        '<div><div class="muted" style="font-size:13px;margin-bottom:6px">Input (6×6)</div>' + fmtMat(img, 80) + '</div>'
      + '<div><div class="muted" style="font-size:13px;margin-bottom:6px">Filter (3×3)</div>' + fmtKernel(f.K) + '</div>'
      + '<div><div class="muted" style="font-size:13px;margin-bottom:6px">Output (' + O.length + '×' + O[0].length + ')</div>' + fmtMat(disp, Math.max(1, maxAbs)) + '</div>';
    }
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A 3×3 filter applied to a 5×5 input with stride 1 and <strong>no padding</strong>. What is the output spatial size?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text'; input.placeholder = 'e.g. 3x3';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        // (5 - 3)/1 + 1 = 3
        if (/^3\s*[x×]\s*3$/i.test(v)) return { correct: true, feedback: 'Right. Formula: ⌊(W + 2p − k) / s⌋ + 1 = (5 − 3)/1 + 1 = 3. So 3×3.' };
        return { correct: false, feedback: '(5 − 3)/1 + 1 = 3 → 3×3.' };
      },
      hints: [
        'Use the formula: ⌊(W + 2p − k) / s⌋ + 1.',
        'p = 0, k = 3, s = 1, W = 5.',
        '(5 − 3)/1 + 1 = 3. Output is 3×3.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A convolutional layer has 16 output channels, each with a 3×3 kernel applied to a 3-channel (RGB) input. Plus one bias per output channel. How many <strong>parameters</strong> in this layer?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        // weights = 16 * 3 * 3 * 3 = 432. plus 16 biases = 448
        if (v === 448) return { correct: true, feedback: 'Right. Each filter has 3 input channels × 3×3 = 27 weights. 16 filters → 432 weights. Plus 16 biases = 448. Notice this is independent of image size — that\'s parameter sharing.' };
        if (v === 432) return { correct: false, feedback: 'Close — that\'s just weights. Don\'t forget the 16 biases (one per output channel). 432 + 16 = 448.' };
        return { correct: false, feedback: '16 filters × (3 channels × 3 × 3 = 27) = 432 weights. + 16 biases = 448.' };
      },
      hints: [
        'Each filter has shape (in_channels, kH, kW). Compute its parameter count.',
        'Per filter: 3 · 3 · 3 = 27 weights. With 16 filters: 432.',
        '432 + 16 biases = 448.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You apply a 3×3 filter to a 100×100 image with stride 2 and padding 1. What is the output spatial size?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text'; input.placeholder = 'e.g. AxB';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        // (100 + 2 - 3)/2 + 1 = 99/2 + 1 = 49.5 + 1 → floor(99/2) + 1 = 49 + 1 = 50
        if (/^50\s*[x×]\s*50$/i.test(v)) return { correct: true, feedback: 'Right. ⌊(100 + 2 − 3) / 2⌋ + 1 = ⌊99/2⌋ + 1 = 49 + 1 = 50. So 50×50.' };
        return { correct: false, feedback: '⌊(100 + 2·1 − 3) / 2⌋ + 1 = ⌊99/2⌋ + 1 = 49 + 1 = 50. Output: 50×50.' };
      },
      hints: [
        'Use the formula: ⌊(W + 2p − k) / s⌋ + 1.',
        'W = 100, p = 1, k = 3, s = 2 → ⌊(100 + 2 − 3) / 2⌋ + 1 = ⌊99/2⌋ + 1.',
        '⌊49.5⌋ + 1 = 49 + 1 = 50. Output: 50×50.'
      ]
    }
  ]
});
