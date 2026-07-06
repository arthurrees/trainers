// Level 1 — Linear Algebra Crash Course
AIT.registerLevel({
  id: 1,
  title: 'Linear Algebra Crash Course',
  whyItMatters: 'A neural network is a stack of matrix multiplications glued together with nonlinearities. If matmul makes sense, the rest of deep learning is suddenly tractable; if it doesn\'t, every later level will feel like magic. This is the cheap-but-essential primer.',
  glossary: ['scalar', 'vector', 'matrix', 'tensor', 'dot product', 'matmul', 'transpose'],
  learn: ''
    + '<h4>The four main objects</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Name</th><th>Shape</th><th>Example</th><th>What it represents in ML</th></tr>'
    + '<tr><td>scalar</td><td>()</td><td>3.7</td><td>a loss, a single number</td></tr>'
    + '<tr><td>vector</td><td>(n,)</td><td>[1, 2, 3]</td><td>one example, one embedding</td></tr>'
    + '<tr><td>matrix</td><td>(m, n)</td><td>[[1,2],[3,4]]</td><td>a layer\'s weights, a batch of vectors</td></tr>'
    + '<tr><td>tensor</td><td>(d₁, ..., dₖ)</td><td>4-D image batch</td><td>everything else (images, multi-head attention, ...)</td></tr>'
    + '</table>'

    + '<h4>The dot product — the workhorse</h4>'
    + '<p>For two equal-length vectors:</p>'
    + '<div class="formula-box"><strong>a · b</strong> = a₁·b₁ + a₂·b₂ + ... + aₙ·bₙ &nbsp;&nbsp;&nbsp;<span class="muted">(a single number)</span></div>'
    + '<div class="example"><div class="label">Worked example</div>'
    + 'a = [1, 2, 3], &nbsp; b = [4, 5, 6]<br>'
    + 'a · b = 1·4 + 2·5 + 3·6 = 4 + 10 + 18 = <strong>32</strong>'
    + '</div>'
    + '<p>The dot product measures "alignment". Geometrically, a · b = ‖a‖ ‖b‖ cos(θ). When two vectors point the same way, big number. When perpendicular, zero. When opposite, negative.</p>'

    + '<h4>Matrix-vector multiply</h4>'
    + '<p>One matrix row at a time, dot it with the vector:</p>'
    + '<div class="example"><div class="label">A · x where A is 2×3, x has length 3</div>'
    + '<code class="inline">A = [[1, 2, 3],&nbsp;&nbsp; x = [a, b, c]<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[4, 5, 6]]</code><br><br>'
    + 'A·x = [<br>'
    + '&nbsp;&nbsp;1·a + 2·b + 3·c,<br>'
    + '&nbsp;&nbsp;4·a + 5·b + 6·c<br>'
    + '] &nbsp;<span class="muted">(length 2 vector)</span>'
    + '</div>'
    + '<p>This is exactly what one fully connected NN layer computes: output = W · x + b, where W is the weight matrix.</p>'

    + '<h4>Matrix-matrix multiply (matmul)</h4>'
    + '<p>For each output cell C[i][j]:</p>'
    + '<div class="formula-box"><strong>C[i][j]</strong> = (row i of A) · (column j of B)</div>'
    + '<p>Shape rule: <strong>(m × n) · (n × p) = (m × p)</strong>. The two "n"s must match. The result drops them.</p>'
    + '<div class="example"><div class="label">2×3 times 3×2</div>'
    + '<code class="inline">A = [[1, 2, 3],&nbsp;&nbsp;&nbsp;&nbsp; B = [[7,  8],</code><br>'
    + '<code class="inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[4, 5, 6]]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[9, 10],</code><br>'
    + '<code class="inline">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[11, 12]]</code><br><br>'
    + 'C[0][0] = 1·7 + 2·9 + 3·11 = 7 + 18 + 33 = <strong>58</strong><br>'
    + 'C[0][1] = 1·8 + 2·10 + 3·12 = 8 + 20 + 36 = <strong>64</strong><br>'
    + 'C[1][0] = 4·7 + 5·9 + 6·11 = 28 + 45 + 66 = <strong>139</strong><br>'
    + 'C[1][1] = 4·8 + 5·10 + 6·12 = 32 + 50 + 72 = <strong>154</strong><br><br>'
    + 'C = [[58, 64], [139, 154]]'
    + '</div>'

    + '<div class="callout"><div class="label">Why this is everywhere in ML</div>'
    + 'A neural network layer with B inputs in a batch and N output neurons is one matmul: <code class="inline">Y = X · W</code> where X is (B × in) and W is (in × N), giving Y of shape (B × N). The whole forward pass is just a sequence of these. GPUs are insanely good at matmul; that\'s the whole reason deep learning is feasible.'
    + '</div>'

    + '<h4>Transpose</h4>'
    + '<p>Aᵀ swaps rows and columns. (Aᵀ)[i][j] = A[j][i]. Shape (m, n) → (n, m).</p>'
    + '<p>Why it shows up: when you compute gradients on the backward pass, transposes appear in the chain-rule formulas. We\'ll meet them in level 8.</p>'

    + '<h4>The shape rule, dramatized</h4>'
    + '<p>When you stack neural network layers, you\'re composing matmuls. The output shape of one layer must match the input shape of the next. <em>"Shape mismatch"</em> is the most common error message in all of deep learning. Reading shapes carefully is most of the debugging.</p>',

  mountPlay: function (container) {
    var mat = AIT.lib.mat;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Pick shapes for A and B. The app shows a worked matmul, cell by cell.';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>m (rows of A) <input type="number" id="mm-m" value="2" min="1" max="4" style="width:60px"></label>'
    + '<label>n (cols of A / rows of B) <input type="number" id="mm-n" value="3" min="1" max="4" style="width:60px"></label>'
    + '<label>p (cols of B) <input type="number" id="mm-p" value="2" min="1" max="4" style="width:60px"></label>'
    + '<button class="ghost-btn" id="mm-rand">Re-roll values</button>';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function rand() { return Math.floor(Math.random() * 9) - 4; } // -4..4
    var A, B;

    function regen() {
      var m = Math.max(1, Math.min(4, parseInt(document.getElementById('mm-m').value, 10) || 1));
      var n = Math.max(1, Math.min(4, parseInt(document.getElementById('mm-n').value, 10) || 1));
      var p = Math.max(1, Math.min(4, parseInt(document.getElementById('mm-p').value, 10) || 1));
      A = []; for (var i = 0; i < m; i++) { var r = []; for (var j = 0; j < n; j++) r.push(rand()); A.push(r); }
      B = []; for (var i2 = 0; i2 < n; i2++) { var r2 = []; for (var j2 = 0; j2 < p; j2++) r2.push(rand()); B.push(r2); }
      render();
    }

    function fmt(M) {
      var rows = M.length, cols = M[0].length;
      var html = '<table style="border-collapse:collapse;font-family:var(--mono);font-size:13px;display:inline-table;margin-right:12px">';
      for (var i = 0; i < rows; i++) {
        html += '<tr>';
        for (var j = 0; j < cols; j++) {
          var v = M[i][j];
          html += '<td style="border:1px solid var(--border);padding:4px 8px;min-width:32px;text-align:center">' + v + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      return html;
    }

    function render() {
      var C = mat.matmul(A, B);
      var detail = '';
      for (var i = 0; i < C.length; i++) {
        for (var j = 0; j < C[0].length; j++) {
          var parts = [];
          for (var k = 0; k < A[0].length; k++) parts.push(A[i][k] + '·' + B[k][j]);
          detail += '<div>C[' + i + '][' + j + '] = ' + parts.join(' + ') + ' = <strong style="color:var(--accent)">' + C[i][j] + '</strong></div>';
        }
      }
      box.innerHTML =
        '<div><strong>A</strong> (' + A.length + '×' + A[0].length + ')&nbsp;&nbsp;'
      + '<strong>B</strong> (' + B.length + '×' + B[0].length + ')&nbsp;&nbsp;'
      + '<strong>C = A·B</strong> (' + C.length + '×' + C[0].length + ')</div>'
      + '<div style="margin:8px 0">' + fmt(A) + fmt(B) + fmt(C) + '</div>'
      + '<div style="font-family:var(--mono);font-size:13px;margin-top:8px">' + detail + '</div>';
    }

    document.getElementById('mm-m').addEventListener('input', regen);
    document.getElementById('mm-n').addEventListener('input', regen);
    document.getElementById('mm-p').addEventListener('input', regen);
    document.getElementById('mm-rand').addEventListener('click', regen);
    regen();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Compute the dot product: <code class="inline">[2, 3, 4] · [1, 0, -1]</code>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === -2) return { correct: true, feedback: 'Right. 2·1 + 3·0 + 4·(−1) = 2 + 0 − 4 = −2.' };
        return { correct: false, feedback: '2·1 + 3·0 + 4·(−1) = 2 + 0 − 4 = −2.' };
      },
      hints: [
        'Multiply elementwise, then add.',
        '2·1 = 2, 3·0 = 0, 4·(−1) = −4.',
        '2 + 0 − 4 = −2.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Which of these matmul shape compositions are <strong>valid</strong>? Tick only the valid ones.',
      mountInput: function (c) {
        var items = [
          { label: '(3 × 4) · (4 × 5) → (3 × 5)',  t: true },
          { label: '(2 × 3) · (3 × 1) → (2 × 1)',  t: true },
          { label: '(5 × 2) · (3 × 5) → (5 × 5)',  t: false },
          { label: '(1 × 4) · (4 × 1) → (1 × 1)',  t: true },
          { label: '(3 × 3) · (2 × 3) → (3 × 3)',  t: false }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. The "inner" dims must match: (m × n) · (n × p). Three are valid; two have mismatched inners (5×2 · 3×5 fails because 2≠3; 3×3 · 2×3 fails because 3≠2).' };
        return { correct: false, feedback: 'The middle two dimensions must match. (5×2)·(3×5) doesn\'t — the inner pair is 2 and 3. (3×3)·(2×3) doesn\'t either — inner pair is 3 and 2.' };
      },
      hints: [
        'Shape rule: (m × n) · (n × p) = (m × p). The two "n"s in the middle must be equal.',
        'Look at the inner two numbers. Are they equal?',
        'Three are valid: (3×4)·(4×5), (2×3)·(3×1), (1×4)·(4×1). Two are not.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Compute <strong>C[1][1]</strong> (zero-indexed) of A · B where:<br>'
            + '<code class="inline">A = [[1, 2, 3], [4, 5, 6]]</code><br>'
            + '<code class="inline">B = [[1, 0], [0, 1], [1, 1]]</code>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 11) return { correct: true, feedback: 'Right. C[1][1] = (row 1 of A) · (col 1 of B) = [4,5,6] · [0,1,1] = 0 + 5 + 6 = 11.' };
        return { correct: false, feedback: 'Row 1 of A is [4, 5, 6]. Column 1 of B is [0, 1, 1]. Dot product: 4·0 + 5·1 + 6·1 = 0 + 5 + 6 = 11.' };
      },
      hints: [
        'C[i][j] = (row i of A) · (column j of B). With zero indexing, C[1][1] uses row 1 of A = [4, 5, 6] and column 1 of B.',
        'Column 1 of B is the second column: B[0][1], B[1][1], B[2][1] = 0, 1, 1.',
        'Dot: 4·0 + 5·1 + 6·1 = 11.'
      ]
    }
  ]
});
