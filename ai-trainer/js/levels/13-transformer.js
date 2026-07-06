// Level 13 — Transformer Block
AIT.registerLevel({
  id: 13,
  title: 'The Transformer Block',
  whyItMatters: 'A transformer is just N copies of one block stacked on top of each other. Once you know what a single block does — attention, FFN, residuals, normalization — every modern LLM stops being a black box and becomes a (very deep) tree of small, comprehensible operations.',
  glossary: ['transformer', 'attention', 'multi-head', 'self-attention', 'positional encoding', 'encoder', 'decoder'],
  learn: ''
    + '<h4>The block, in one picture</h4>'
    + '<p>A modern (pre-LayerNorm) transformer block looks like this, repeated N times:</p>'
    + '<div class="example"><div class="label">One block</div>'
    + '<code class="inline">x_in</code> ──┬──→ <strong>LayerNorm</strong> → <strong>Multi-head Self-Attention</strong> ──┐<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└────────────── + ──────────── ←──── (residual)<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──→ <strong>LayerNorm</strong> → <strong>FFN (2-layer MLP)</strong> ──┐<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──── + ──────────────────── ←─── (residual)<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code class="inline">x_out</code>'
    + '</div>'

    + '<h4>The two halves</h4>'
    + '<ol>'
    +   '<li><strong>Attention sub-block</strong> — every token looks at every other token (self-attention, level 12). This is where information flows between positions.</li>'
    +   '<li><strong>FFN sub-block</strong> — a 2-layer MLP applied independently to each position (no cross-position mixing here). This is where each token does "computation" on what attention gathered. The hidden dim of the FFN is typically 4× the model dim — most of an LLM\'s parameters live here.</li>'
    + '</ol>'

    + '<h4>Residual connections</h4>'
    + '<p>Each sub-block computes <strong>output = input + sublayer(LN(input))</strong>. The "+ input" is the residual / skip connection. Two reasons it matters:</p>'
    + '<ul>'
    +   '<li><strong>Gradient flow</strong> — gradients can travel directly back through the residual path, without dying through 100 layers.</li>'
    +   '<li><strong>Identity prior</strong> — the network can default to "do nothing" at any layer (just pass input through), and only deviate where it helps.</li>'
    + '</ul>'

    + '<h4>LayerNorm</h4>'
    + '<p>Normalize each token\'s vector to mean 0, variance 1, then apply learned scale γ and shift β:</p>'
    + '<div class="formula-box">LN(x) = γ · (x − μ) / σ + β</div>'
    + '<p>Why? Stabilizes training when activations have wildly different magnitudes across the network. Modern transformers actually use RMSNorm (which drops the mean centering) — slightly simpler, slightly faster, no significant quality loss.</p>'

    + '<h4>Positional information</h4>'
    + '<p>Attention is permutation-invariant — if you shuffle the input tokens, the output set is the same (just shuffled). That\'s a problem: <em>"the cat ate the fish"</em> ≠ <em>"the fish ate the cat"</em>. The fix is to add positional information to each token before it enters the first block:</p>'
    + '<ul>'
    +   '<li><strong>Sinusoidal</strong> (original transformer) — sine/cosine functions of position.</li>'
    +   '<li><strong>Learned absolute</strong> — one trainable vector per position.</li>'
    +   '<li><strong>RoPE (rotary)</strong> — rotate Q and K by an angle proportional to position. Modern default; generalizes well to longer contexts.</li>'
    +   '<li><strong>ALiBi</strong> — add a position-dependent bias directly to attention scores. Simple and surprisingly effective for long context.</li>'
    + '</ul>'

    + '<h4>The three transformer families</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Family</th><th>Attention type</th><th>Examples</th><th>Best for</th></tr>'
    + '<tr><td>Encoder-only</td><td>bidirectional</td><td>BERT, RoBERTa</td><td>understanding tasks (classification, embeddings)</td></tr>'
    + '<tr><td>Decoder-only</td><td>causal (masked)</td><td>GPT, Llama, Mistral</td><td>generation, the modern LLM default</td></tr>'
    + '<tr><td>Encoder-decoder</td><td>encoder bidirectional, decoder causal + cross-attn</td><td>T5, BART, original transformer</td><td>translation, structured generation</td></tr>'
    + '</table>'

    + '<h4>The big-picture forward pass of an LLM</h4>'
    + '<ol>'
    +   '<li>Tokenize text → integer IDs.</li>'
    +   '<li>Each ID → embedding vector (lookup in a big table).</li>'
    +   '<li>Add positional info (or apply RoPE inside attention).</li>'
    +   '<li>N transformer blocks, each: attention + residual + FFN + residual.</li>'
    +   '<li>Final LayerNorm.</li>'
    +   '<li>Project to vocabulary size → logits over all possible next tokens.</li>'
    +   '<li>Softmax → probabilities. Sample a token (we cover that in level 17).</li>'
    + '</ol>'

    + '<div class="callout"><div class="label">By the numbers</div>'
    + 'GPT-3: 96 blocks, model dim 12,288, 96 heads of dim 128, FFN hidden 49,152. ~175B parameters total. Llama-3 70B: 80 blocks, dim 8,192, 64 query heads / 8 KV heads (grouped-query attention). The shapes have grown but the block recipe has barely changed since 2017.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click any block in the diagram to see what it does. The block on the right is what gets stacked 12–96 times in real LLMs.';
    container.appendChild(help);

    // Each "step" is now a clickable region in the diagram
    // Layout: a vertical column of boxes from x_in (top) to x_out (bottom),
    // with residual lines wrapping around the attention sub-block and the FFN sub-block.
    var blocks = [
      { id: 'in',     y: 30,  label: 'x_in', color: '#7ab7ff', desc: 'Token embedding + positional info. A vector of dim d_model — e.g. 768, 4096, or 12288 in real models.' },
      { id: 'ln1',    y: 100, label: 'LayerNorm', color: '#a78bfa', desc: 'Normalize entries to mean 0 / variance 1, then apply learned scale γ and shift β. Stabilizes training. Output shape is unchanged.' },
      { id: 'mha',    y: 170, label: 'Multi-head Self-Attention', color: '#4ade80', desc: 'Project x to Q, K, V (split across heads). Each head: softmax(Q·Kᵀ/√d_k) · V. Concat heads, project with Wo. THIS is where tokens look at other tokens.' },
      { id: 'add1',   y: 240, label: '+', color: '#fbbf24', desc: 'Residual (skip) connection: add x_in to the attention output. Lets gradients flow back unobstructed; lets the layer "do nothing" by making attention output zero.' },
      { id: 'ln2',    y: 310, label: 'LayerNorm', color: '#a78bfa', desc: 'Normalize again, ahead of the FFN.' },
      { id: 'ffn',    y: 380, label: 'FFN (2-layer MLP)', color: '#4ade80', desc: 'Linear up: d_model → 4·d_model. Activation (GELU/SwiGLU). Linear down: 4·d_model → d_model. Per-position only — no cross-token interaction here. Half the model parameters live in these.' },
      { id: 'add2',   y: 450, label: '+', color: '#fbbf24', desc: 'Second residual: add the post-attention vector. Final x_out for this block.' },
      { id: 'out',    y: 520, label: 'x_out → next block', color: '#7ab7ff', desc: 'Same shape as x_in. 12 (small) to 96+ (frontier) of these blocks stacked makes an LLM.' }
    ];

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 580;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var stepBox = document.createElement('div');
    stepBox.className = 'formula-box';
    stepBox.style.fontSize = '13px';
    stepBox.style.minHeight = '80px';
    container.appendChild(stepBox);

    var current = 0;
    var blockBounds = []; // for hit testing

    function render() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var cx = canvas.width / 2;
      var w = 280;
      blockBounds = [];

      // residual paths (drawn first, behind blocks)
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      // residual 1: from below x_in around the right side back into the +
      ctx.beginPath();
      ctx.moveTo(cx + w/2 - 8, 80); // top of x_in box
      ctx.lineTo(cx + w/2 + 60, 80);
      ctx.lineTo(cx + w/2 + 60, 250);
      ctx.lineTo(cx + w/2, 260);
      ctx.stroke();
      // residual 2: from after first +, around right, into second +
      ctx.beginPath();
      ctx.moveTo(cx + w/2 - 8, 260);
      ctx.lineTo(cx + w/2 + 90, 260);
      ctx.lineTo(cx + w/2 + 90, 460);
      ctx.lineTo(cx + w/2, 470);
      ctx.stroke();
      ctx.setLineDash([]);

      // residual labels
      ctx.fillStyle = '#9aa3b2'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
      ctx.fillText('skip 1', cx + w/2 + 64, 175);
      ctx.fillText('skip 2', cx + w/2 + 94, 365);

      // forward arrows down the spine (between blocks)
      ctx.strokeStyle = '#7ab7ff'; ctx.lineWidth = 2;
      for (var i = 0; i < blocks.length - 1; i++) {
        var y1 = blocks[i].y + 28, y2 = blocks[i + 1].y - 5;
        ctx.beginPath(); ctx.moveTo(cx, y1); ctx.lineTo(cx, y2); ctx.stroke();
        // arrowhead
        ctx.beginPath();
        ctx.moveTo(cx, y2);
        ctx.lineTo(cx - 5, y2 - 6); ctx.lineTo(cx + 5, y2 - 6);
        ctx.closePath(); ctx.fillStyle = '#7ab7ff'; ctx.fill();
      }

      // blocks
      blocks.forEach(function (b, i) {
        var bw = b.id === 'add1' || b.id === 'add2' ? 50 : w;
        var bh = 50;
        var bx = cx - bw / 2, by = b.y - 25;
        blockBounds.push({ x: bx, y: by, w: bw, h: bh, idx: i });

        var isCurrent = i === current;
        ctx.fillStyle = isCurrent ? b.color : '#1f2533';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = isCurrent ? 3 : 1.5;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = isCurrent ? '#0a0c11' : b.color;
        ctx.font = (b.id === 'add1' || b.id === 'add2') ? 'bold 24px monospace' : 'bold 13px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, cx, by + bh / 2);
      });

      // Title above
      ctx.fillStyle = '#9aa3b2'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText('One transformer block (pre-LayerNorm variant)', cx, 12);

      // selected step
      var s = blocks[current];
      stepBox.innerHTML = '<div><strong style="color:' + s.color + '">' + s.label + '</strong></div>'
                        + '<div style="margin-top:8px">' + s.desc + '</div>';
    }

    canvas.addEventListener('click', function (e) {
      var p = AIT.lib.canvas.pos(canvas, e);
      for (var i = 0; i < blockBounds.length; i++) {
        var bb = blockBounds[i];
        if (p.x >= bb.x && p.x <= bb.x + bb.w && p.y >= bb.y && p.y <= bb.y + bb.h) {
          current = bb.idx;
          render();
          return;
        }
      }
    });
    canvas.style.cursor = 'pointer';
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which transformer family is GPT?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Encoder-only', 'Decoder-only', 'Encoder-decoder', 'CNN-based'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Decoder-only') return { correct: true, feedback: 'Right. GPT, Llama, Mistral, Claude — almost every modern generative LLM is decoder-only with a causal attention mask.' };
        if (v === 'Encoder-only') return { correct: false, feedback: 'BERT is encoder-only. GPT is decoder-only — the difference is the causal mask.' };
        return { correct: false, feedback: 'Decoder-only.' };
      },
      hints: [
        'GPT generates text left to right. What attention pattern enables that?',
        'Causal (masked) attention. Which family uses that?',
        'Decoder-only.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Why are <strong>residual connections</strong> ("+input") important for training a deep transformer?',
      mountInput: function (c) {
        var opts = [
          'They double the parameter count, increasing model capacity.',
          'They give gradients a direct path back through the network, preventing them from dying as depth increases.',
          'They are required by the softmax in attention.',
          'They are mathematically equivalent to dropout.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. The residual connection adds an "identity bypass" path. During backprop, gradients can flow back through the +input shortcut without being multiplied by all the layer transformations — preventing vanishing gradients in deep stacks.' };
        if (v === 0) return { correct: false, feedback: 'Residuals don\'t add parameters — they just add the input through. Capacity-wise, they\'re free.' };
        return { correct: false, feedback: 'They\'re a gradient-flow trick. Without residuals, training a 100-layer transformer is nearly impossible.' };
      },
      hints: [
        'Think about what happens during backprop in a deep network without skip connections.',
        'Gradients get multiplied through each layer. If those multipliers are < 1, gradients vanish.',
        'Residuals provide a path with multiplier 1 — gradients flow freely.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Inside a single transformer block, which sub-component <strong>mixes information across token positions</strong>, vs. processes each position independently?',
      mountInput: function (c) {
        var opts = [
          'Both attention and the FFN mix across positions.',
          'Attention mixes across positions; FFN processes each position independently.',
          'Neither — both are per-position.',
          'FFN mixes across positions; attention is per-position.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. This is the central design split: attention is the only place where positions talk to each other; FFN is "personal time" for each position. Some research (e.g. mixture-of-experts) makes the FFN routing-based, but it\'s still per-position.' };
        if (v === 0) return { correct: false, feedback: 'The FFN is purely per-position — it applies the same MLP to each token\'s vector independently, no cross-token interaction.' };
        if (v === 3) return { correct: false, feedback: 'Backwards: attention is the cross-position part. FFN is per-position.' };
        return { correct: false, feedback: 'Attention crosses positions; FFN doesn\'t.' };
      },
      hints: [
        'Look at the formulas. Attention multiplies Q · Kᵀ — that involves all positions at once.',
        'FFN takes a single vector per position and applies a 2-layer MLP. No other positions enter the formula.',
        'So: attention crosses positions; FFN is per-position.'
      ]
    }
  ]
});
