// Level 12 — The Attention Mechanism
AIT.registerLevel({
  id: 12,
  title: 'The Attention Mechanism',
  whyItMatters: 'Attention is the single idea that broke the spell on AI. Once each position in a sequence can selectively look at every other position, transformers eat the world. If you understand the Q/K/V dance you understand the engine of every modern LLM.',
  glossary: ['attention', 'Q', 'K', 'V', 'self-attention', 'multi-head', 'softmax', 'matmul'],
  learn: ''
    + '<h4>The motivating problem</h4>'
    + '<p>Old sequence models (RNNs, LSTMs) processed text one token at a time, threading meaning through a single hidden state. Information from token 1 had to survive a long telephone-game journey to influence token 100. Long-range dependencies were a nightmare.</p>'
    + '<p>Attention says: <em>"why don\'t we just let every position directly look at every other position?"</em> Computationally expensive, but parallel and powerful.</p>'

    + '<h4>The Q, K, V triad</h4>'
    + '<p>For each input vector, compute three projections:</p>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Name</th><th>Computed as</th><th>Plain-English role</th></tr>'
    + '<tr><td>Query (Q)</td><td>x · Wq</td><td>"What am I looking for?"</td></tr>'
    + '<tr><td>Key (K)</td><td>x · Wk</td><td>"What do I have to offer?"</td></tr>'
    + '<tr><td>Value (V)</td><td>x · Wv</td><td>"The actual content I\'ll contribute"</td></tr>'
    + '</table>'
    + '<p>Wq, Wk, Wv are learned weight matrices. Each input position produces its own Q, K, V.</p>'

    + '<h4>The attention formula</h4>'
    + '<div class="formula-box"><strong>Attention(Q, K, V) = softmax( Q · Kᵀ / √d_k ) · V</strong></div>'
    + '<p>Read it piece by piece:</p>'
    + '<ol>'
    +   '<li><strong>Q · Kᵀ</strong> — dot every query against every key. Result: a (n × n) matrix of <em>scores</em>. Score[i][j] = "how much should position i listen to position j?"</li>'
    +   '<li><strong>÷ √d_k</strong> — scale down to keep softmax stable for big d_k.</li>'
    +   '<li><strong>softmax</strong> across each row — turn scores into a probability distribution that sums to 1. Each row tells position i how much weight to put on every other position.</li>'
    +   '<li><strong>· V</strong> — take a weighted sum of values according to the attention weights. Each position gets its updated representation.</li>'
    + '</ol>'

    + '<h4>Worked example — 2 tokens</h4>'
    + '<p>Tokens: "the cat". After embedding + projection, suppose:</p>'
    + '<div class="example"><div class="label">After projections</div>'
    + 'Q = [[1, 0], &nbsp;&nbsp;&nbsp;&nbsp; K = [[1, 0], &nbsp;&nbsp; V = [[5, 0],<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0, 1]] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0, 1]] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0, 5]]<br><br>'
    + 'Q · Kᵀ = [[1, 0], [0, 1]]<br>'
    + 'After scaling by √2 and softmax (row-wise) ≈ [[0.67, 0.33], [0.33, 0.67]]<br><br>'
    + 'Output = weights · V = [[0.67·5 + 0.33·0, 0.67·0 + 0.33·5],<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[0.33·5 + 0.67·0, 0.33·0 + 0.67·5]]<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= [[3.35, 1.65], [1.65, 3.35]]'
    + '</div>'
    + '<p>Every token now contains a mix of every other token, weighted by relevance.</p>'

    + '<h4>Why divide by √d_k?</h4>'
    + '<p>If Q and K vectors have d_k components and entries with unit variance, their dot products have variance d_k. For large d_k that pushes softmax into very peaked territory, where one position gets weight ≈ 1 and the rest get ≈ 0 — and gradients there are tiny. Dividing by √d_k brings dot-product variance back to 1, keeping softmax in its useful range.</p>'

    + '<h4>Self-attention vs cross-attention</h4>'
    + '<ul>'
    +   '<li><strong>Self-attention</strong> — Q, K, V all come from the same input. Each token attends to all tokens (including itself).</li>'
    +   '<li><strong>Cross-attention</strong> — Q comes from one source, K and V from another. Used in encoder-decoder models (decoder cross-attends to encoder outputs) and image-text models.</li>'
    + '</ul>'

    + '<h4>Multi-head attention</h4>'
    + '<p>Don\'t do one big attention; do <strong>h</strong> small ones in parallel, each with its own learned Wq, Wk, Wv. Concatenate the outputs and project once more with Wo.</p>'
    + '<div class="formula-box">MultiHead(X) = Concat(head₁, ..., head_h) · Wo<br>head_i = Attention(X · Wqᵢ, X · Wkᵢ, X · Wvᵢ)</div>'
    + '<p>Why? Different heads can learn to attend to different relationships — syntax, coreference, position, semantics — without one head having to do it all. GPT-3 has 96 heads per layer, 96 layers.</p>'

    + '<h4>Causal mask (for generation)</h4>'
    + '<p>If you\'re training a model to predict the next token, you can\'t let position 5 attend to position 6 — that would leak the answer. Solution: <strong>mask the upper triangle</strong> of Q · Kᵀ to −∞ before softmax. Now each position can only attend to itself and earlier positions. This is what makes "decoder-only" transformers like GPT work.</p>'

    + '<div class="callout"><div class="label">The cost</div>'
    + 'Attention is O(n²) in sequence length n. For n = 4K context, that\'s 16M dot products per head per layer. For n = 1M, it\'s 10¹². This is why context windows have been the limiting resource of LLMs and why every modern paper is about attention variants — sliding window, sparse, linear, FlashAttention — to make it cheaper.'
    + '</div>',

  mountPlay: function (container) {
    var mat = AIT.lib.mat;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = '4 tokens. Drag the queries; watch each row of the attention matrix change. The heatmap is the softmax of Q·Kᵀ — row i = "how much token i looks at each token".';
    container.appendChild(help);

    var tokens = ['the', 'cat', 'sat', 'down'];
    // Fixed K and V; user adjusts Q to see the attention pattern change
    var K = [[1, 0], [0, 1], [1, 1], [-1, 0]];
    var V = [[1, 0], [0, 1], [1, 1], [0, -1]];
    var Q = [[1, 0], [0, 1], [1, 1], [-1, 0]]; // start equal to K (each token attends most to itself)

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML = '<div class="muted">Try changing token 0\'s Q: <input type="number" id="att-q00" value="1" step="0.5" style="width:60px"> '
      + '<input type="number" id="att-q01" value="0" step="0.5" style="width:60px"></div>';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '12px';
    container.appendChild(box);

    function softmaxRow(arr) { return mat.softmax(arr); }

    function render() {
      Q[0][0] = parseFloat(document.getElementById('att-q00').value);
      Q[0][1] = parseFloat(document.getElementById('att-q01').value);
      var dk = 2;
      // scores[i][j] = Q[i]·K[j] / sqrt(dk)
      var n = tokens.length;
      var scores = [];
      for (var i = 0; i < n; i++) {
        var row = [];
        for (var j = 0; j < n; j++) row.push(mat.dot(Q[i], K[j]) / Math.sqrt(dk));
        scores.push(row);
      }
      var weights = scores.map(softmaxRow);
      // output[i] = Σ_j weights[i][j] · V[j]
      var output = [];
      for (var i2 = 0; i2 < n; i2++) {
        var o = [0, 0];
        for (var j2 = 0; j2 < n; j2++) {
          o[0] += weights[i2][j2] * V[j2][0];
          o[1] += weights[i2][j2] * V[j2][1];
        }
        output.push(o);
      }

      function tableHeader() {
        var h = '<tr><th></th>';
        tokens.forEach(function (t) { h += '<th>' + t + '</th>'; });
        h += '</tr>';
        return h;
      }
      function fmtAttn(weights) {
        var html = '<table style="border-collapse:collapse;font-family:var(--mono);font-size:12px">' + tableHeader();
        for (var i = 0; i < n; i++) {
          html += '<tr><td style="border:1px solid var(--border);padding:4px 8px;color:var(--accent)"><strong>' + tokens[i] + '</strong></td>';
          for (var j = 0; j < n; j++) {
            var w = weights[i][j];
            var c = Math.round(w * 255);
            html += '<td style="border:1px solid var(--border);padding:4px 8px;text-align:center;background:rgba(122,183,255,' + (w * 0.7) + ');min-width:50px">' + w.toFixed(2) + '</td>';
          }
          html += '</tr>';
        }
        html += '</table>';
        return html;
      }
      box.innerHTML =
        '<div><strong style="color:var(--accent)">Attention weights</strong> &nbsp; <span class="muted">(row i = how token i attends to columns j)</span></div>'
      + '<div style="margin:8px 0">' + fmtAttn(weights) + '</div>'
      + '<div class="muted">Each row sums to 1.0. Brighter = more attention.</div>';
    }
    document.getElementById('att-q00').addEventListener('input', render);
    document.getElementById('att-q01').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'For a sequence of <strong>5 tokens</strong>, what is the shape of the attention-weight matrix (after softmax) within one attention head?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text'; input.placeholder = 'e.g. AxB';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        if (/^5\s*[x×]\s*5$/i.test(v)) return { correct: true, feedback: 'Right. Q is (5 × d_k), Kᵀ is (d_k × 5), so Q·Kᵀ is (5 × 5). Each row tells one token how to weight its attention over all 5.' };
        return { correct: false, feedback: 'Q · Kᵀ has shape (n × n) = (5 × 5).' };
      },
      hints: [
        'Q has shape (n × d_k). What is the shape of Q · Kᵀ?',
        '(n × d_k) · (d_k × n) = (n × n).',
        '5 × 5.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Why divide Q · Kᵀ by <strong>√d_k</strong> before the softmax?',
      mountInput: function (c) {
        var opts = [
          'To make the matrix smaller and save memory.',
          'To compensate for the matmul shape.',
          'To keep the variance of the dot products from growing with d_k, which would push softmax into a saturating regime where gradients vanish.',
          'It is purely a normalization for displaying weights to humans; mathematically optional.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. With d_k components of unit variance, Q·K has variance d_k. Without scaling, softmax becomes super-peaky for large d_k → near-zero gradients on most positions. Dividing by √d_k brings variance back to 1.' };
        if (v === 3) return { correct: false, feedback: 'Not optional. Skipping it noticeably hurts training stability for any reasonably large d_k. It\'s a real numerical fix, not cosmetic.' };
        return { correct: false, feedback: 'It\'s about preventing softmax saturation. Dot products grow as d_k grows; left unscaled, the softmax peaks too sharply, killing gradients.' };
      },
      hints: [
        'Think about what happens to softmax when its inputs are very large vs small.',
        'Big inputs → very peaked softmax → near-zero gradients on the small entries.',
        'The scaling keeps the variance of dot products constant (≈ 1) regardless of d_k.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A decoder-only transformer (like GPT) trains on next-token prediction. Why is the attention mask <strong>causal</strong> (lower-triangular), preventing each position from attending to later positions?',
      mountInput: function (c) {
        var opts = [
          'Causal masking saves memory by computing only half the attention matrix.',
          'Without it, the model would see future tokens at training time — making "predict the next token" trivial and useless.',
          'Causal masking is required by the softmax formula itself.',
          'It is a UI convention; the math works either way.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. The whole training objective is "predict token t+1 from tokens up to t." If position t could attend to position t+1, the model could just copy the answer. The causal mask enforces information flow only from past to future, exactly matching what generation needs at inference.' };
        if (v === 0) return { correct: false, feedback: 'Memory savings exist (FlashAttention exploits the triangular shape) but the PRIMARY reason is correctness: without causality, training is broken because the model can see the answer.' };
        if (v === 2) return { correct: false, feedback: 'Softmax doesn\'t care — it works on any matrix. The mask is a deliberate addition to enforce causality.' };
        if (v === 3) return { correct: false, feedback: 'Without the mask, training is mathematically broken — the model would learn to copy from the future and fail at generation.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'What is the model being asked to predict during training?',
        'It predicts token t+1 from earlier tokens. What happens if it can also see token t+1 itself?',
        'Trivial 100% accuracy at train time, useless at generation. The causal mask prevents this.'
      ]
    }
  ]
});
