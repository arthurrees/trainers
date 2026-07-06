// Level 18 — Quantization & Inference Optimization
AIT.registerLevel({
  id: 18,
  title: 'Quantization & Inference',
  whyItMatters: 'Why can your RTX 3070 (8GB VRAM) run a 7-billion-parameter Llama? Because someone quantized the weights. This level explains the tradeoffs and the few other tricks (KV cache, FlashAttention, speculative decoding) that make local inference actually viable.',
  glossary: ['quantization', 'KV cache', 'context window'],
  learn: ''
    + '<h4>The memory problem</h4>'
    + '<p>Models are stored as floating-point numbers, one per parameter. The size in bytes depends on precision:</p>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Precision</th><th>Bytes per param</th><th>7B model size</th><th>70B model size</th></tr>'
    + '<tr><td>FP32</td><td>4</td><td>28 GB</td><td>280 GB</td></tr>'
    + '<tr><td>FP16 / BF16</td><td>2</td><td>14 GB</td><td>140 GB</td></tr>'
    + '<tr><td>INT8</td><td>1</td><td>7 GB</td><td>70 GB</td></tr>'
    + '<tr><td>INT4</td><td>0.5</td><td>3.5 GB</td><td>35 GB</td></tr>'
    + '<tr><td>INT2</td><td>0.25</td><td>1.75 GB</td><td>17.5 GB</td></tr>'
    + '</table>'
    + '<p>Your 8GB GPU can\'t fit a 7B model in FP16 (14 GB needed) — but it fits comfortably at INT4 (3.5 GB). That\'s why you\'re running quantized models.</p>'

    + '<h4>What quantization actually does</h4>'
    + '<p>For each weight tensor, find its min and max. Map that range linearly to the integer range (e.g., −7 to +7 for INT4). Store the integers. Also store the (min, max) so you can recover approximate floats at compute time:</p>'
    + '<div class="formula-box">w_quant = round((w_float − zero_point) / scale)<br>w_recovered = w_quant · scale + zero_point</div>'
    + '<p>Per-tensor or per-channel quantization (one scale/zero_point per row) is more accurate than one for the whole matrix.</p>'

    + '<h4>Why it works at all</h4>'
    + '<p>Three reasons quantization barely hurts model quality:</p>'
    + '<ol>'
    +   '<li><strong>Weights are robust.</strong> Modern training pushes most weights into a narrow distribution; rounding to the nearest of 16 levels still captures most of the signal.</li>'
    +   '<li><strong>Errors average out.</strong> One layer\'s quantization error gets partially absorbed by subsequent layers.</li>'
    +   '<li><strong>The bottleneck was memory bandwidth.</strong> Modern GPUs are usually waiting on memory, not compute. Smaller weights → less memory traffic → often <em>faster</em> inference, not just smaller.</li>'
    + '</ol>'
    + '<p>Typical quality drop at INT4: 1–3% on benchmarks. Below INT4 the cliff gets steep.</p>'

    + '<h4>Quantization formats you\'ll see</h4>'
    + '<ul>'
    +   '<li><strong>GGUF</strong> (used by llama.cpp / Ollama) — multiple quant levels: Q4_K_M, Q5_K_M, Q8_0. The "K_M" variants use mixed precision (more bits for sensitive layers).</li>'
    +   '<li><strong>AWQ, GPTQ</strong> — calibrated post-training quantization formats that achieve better INT4 quality.</li>'
    +   '<li><strong>BitsAndBytes (bnb)</strong> — 8-bit and 4-bit quantization for HuggingFace transformers, supports QLoRA fine-tuning.</li>'
    +   '<li><strong>FP8 / NF4</strong> — newer formats with better dynamic range than naive INT8/INT4.</li>'
    + '</ul>'

    + '<h4>The KV cache — the second memory cost</h4>'
    + '<p>Generation is autoregressive: predict token N+1, then N+2, then N+3. Naively, each new token requires re-running attention over all preceding tokens — O(n²) total cost.</p>'
    + '<p>Trick: cache the K and V vectors for already-generated tokens. New tokens only need to compute their own Q, K, V and attend over the cached pairs. This makes per-token attention O(n) instead of O(n²).</p>'
    + '<p>Cost: KV cache memory. For a 70B model with d=8192, 80 layers, 8 KV heads, 128 head dim, a 4K context costs:</p>'
    + '<div class="formula-box">2 (K and V) × 4096 (tokens) × 80 (layers) × 8 (KV heads) × 128 (dim) × 2 (FP16 bytes) ≈ 1.3 GB</div>'
    + '<p>For long contexts (32K, 128K, 1M), KV cache often exceeds the size of the model itself.</p>'

    + '<h4>FlashAttention</h4>'
    + '<p>Standard attention reads/writes the (n × n) attention matrix to GPU memory — slow because of memory bandwidth. <strong>FlashAttention</strong> tiles the computation so the attention matrix never fully materializes; it stays in fast on-chip SRAM. Same math, 2–4× faster, supports way longer contexts.</p>'

    + '<h4>Speculative decoding</h4>'
    + '<p>Big models are slow because every new token requires a full forward pass. Trick: use a small "draft" model to propose, say, 5 tokens at once. Run the big model in parallel on those 5 candidate continuations and verify. If the draft was right, you got 5 tokens for the cost of 1. If wrong, you fall back at the first divergence.</p>'
    + '<p>Speedups: 2–3× for free, no accuracy loss (the big model is the source of truth — the draft just speeds up cases where it would have agreed).</p>'

    + '<div class="callout"><div class="label">Practical recipe for your RTX 3070 (8GB)</div>'
    + '<strong>Llama-3 8B-Instruct at Q4_K_M</strong> via Ollama: ~5 GB weights, ~2 GB KV cache for 4K context, leaves ~1 GB headroom. Tokens/s: typically 30–50 with GPU offload. Quality: very close to FP16 on most benchmarks. <br>For quality-sensitive work try Q5_K_M (~6 GB weights). For longer contexts drop to Q4_K_S to give the KV cache more room.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Quantization calculator. Pick model size and precision; see VRAM needs vs your GPU.';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>Model params: <select id="qm-size">'
    + '  <option value="1.5">1.5B</option>'
    + '  <option value="3">3B</option>'
    + '  <option value="7" selected>7B</option>'
    + '  <option value="13">13B</option>'
    + '  <option value="30">30B</option>'
    + '  <option value="70">70B</option>'
    + '  <option value="180">180B</option>'
    + '</select></label>'
    + '<label>Precision: <select id="qm-prec">'
    + '  <option value="4">FP32</option>'
    + '  <option value="2" selected>FP16 / BF16</option>'
    + '  <option value="1">INT8</option>'
    + '  <option value="0.5">INT4</option>'
    + '  <option value="0.25">INT2 (extreme)</option>'
    + '</select></label>'
    + '<label>Context length (tokens): <select id="qm-ctx">'
    + '  <option value="2048">2,048</option>'
    + '  <option value="4096" selected>4,096</option>'
    + '  <option value="8192">8,192</option>'
    + '  <option value="32768">32,768</option>'
    + '  <option value="131072">131,072</option>'
    + '</select></label>'
    + '<label>GPU VRAM (GB): <input type="number" id="qm-vram" value="8" min="4" step="2" style="width:80px"></label>';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function render() {
      var nB = parseFloat(document.getElementById('qm-size').value); // billions
      var bytes = parseFloat(document.getElementById('qm-prec').value);
      var ctx = parseInt(document.getElementById('qm-ctx').value, 10);
      var vram = parseFloat(document.getElementById('qm-vram').value);

      var weights = nB * 1e9 * bytes / 1e9; // GB
      // KV cache estimate: roughly 2 * ctx * params^(1/3) * fp16_factor
      // We'll use a simpler heuristic: KV cache ~ ctx tokens * model_dim * 2 (K,V) * num_layers * 2 bytes (FP16)
      // Approximate model_dim and num_layers from params
      var modelDim, layers, kvHeads;
      if (nB <= 2)        { modelDim = 2048; layers = 22; kvHeads = 4; }
      else if (nB <= 5)   { modelDim = 3072; layers = 28; kvHeads = 8; }
      else if (nB <= 9)   { modelDim = 4096; layers = 32; kvHeads = 8; }
      else if (nB <= 15)  { modelDim = 5120; layers = 40; kvHeads = 8; }
      else if (nB <= 35)  { modelDim = 6656; layers = 60; kvHeads = 8; }
      else if (nB <= 80)  { modelDim = 8192; layers = 80; kvHeads = 8; }
      else                { modelDim = 12288; layers = 96; kvHeads = 8; }
      var headDim = 128;
      var kv = 2 * ctx * layers * kvHeads * headDim * 2 / 1e9; // GB, FP16

      var totalNeeded = weights + kv;
      var headroom = vram - totalNeeded;
      var status = headroom > 1 ? '<span style="color:var(--good)">fits comfortably</span>'
                : headroom > 0 ? '<span style="color:var(--warn)">just fits</span>'
                : '<span style="color:var(--bad)">won\'t fit</span>';

      box.innerHTML =
        '<div><span class="muted">Weights:</span> <strong>' + weights.toFixed(2) + ' GB</strong></div>'
      + '<div><span class="muted">KV cache (' + ctx.toLocaleString() + ' tokens):</span> <strong>' + kv.toFixed(2) + ' GB</strong></div>'
      + '<div><span class="muted">Total VRAM needed:</span> <span class="result">' + totalNeeded.toFixed(2) + ' GB</span></div>'
      + '<div><span class="muted">Your VRAM:</span> ' + vram + ' GB &nbsp; → &nbsp; ' + status + ' (' + headroom.toFixed(2) + ' GB headroom)</div>'
      + '<div class="muted" style="margin-top:8px">Approximations: typical decoder-only architecture, FP16 KV cache. Real KV cache can be smaller (grouped-query attention) or larger (no grouping).</div>';
    }
    ['qm-size','qm-prec','qm-ctx','qm-vram'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', render);
      document.getElementById(id).addEventListener('input', render);
    });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'How many bytes per parameter does a model use at <strong>FP16</strong>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = '0.01';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. FP16 = 16 bits = 2 bytes per parameter. So a 7B model in FP16 takes 14 GB.' };
        return { correct: false, feedback: 'FP16 = 16 bits / 8 = 2 bytes per parameter.' };
      },
      hints: [
        'FP16 means 16 bits.',
        '16 bits = how many bytes?',
        '2 bytes.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A 13B-parameter model is loaded at <strong>INT4</strong>. About how much VRAM do the weights alone take?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any'; input.placeholder = 'GB';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        // 13e9 * 0.5 = 6.5e9 bytes = 6.5 GB
        if (Math.abs(v - 6.5) < 0.2) return { correct: true, feedback: 'Right. INT4 = 0.5 bytes/param. 13e9 × 0.5 = 6.5 GB.' };
        return { correct: false, feedback: 'INT4 = 0.5 bytes/param. 13B × 0.5 bytes = 6.5 GB.' };
      },
      hints: [
        'INT4 means 4 bits per parameter. How many bytes is that?',
        '0.5 bytes per parameter.',
        '13e9 × 0.5 / 1e9 = 6.5 GB.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re running a 70B model with a long context (32K tokens). The KV cache is now larger than the quantized model itself. Approximately what is the KV cache size? <span class="muted">(Assume 80 layers, 8 KV heads, 128 head dim, FP16.)</span>',
      mountInput: function (c) {
        var opts = ['~1 GB', '~10 GB', '~26 GB', '~140 GB'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // KV cache = 2 * ctx * layers * kv_heads * head_dim * 2 bytes
        // = 2 * 32768 * 80 * 8 * 128 * 2 / 1e9
        // = 32768 * 80 * 8 * 128 * 4 / 1e9
        // = 1,073,741,824,000 / 1e9 ≈ 1073 / 1.073 = ~10.7 GB? Let me recompute:
        // 2 (K,V) * 32768 * 80 * 8 * 128 * 2(bytes) = 2 * 32768 * 80 * 8 * 128 * 2
        // = 4 * 32768 * 80 * 8 * 128
        // = 4 * 32768 * 81920
        // = 4 * 2,684,354,560 = 10,737,418,240 bytes ≈ 10.7 GB
        if (v === '~10 GB') return { correct: true, feedback: 'Right. 2 (K and V) × 32,768 × 80 × 8 × 128 × 2 bytes ≈ 10.7 GB. For long-context inference, the KV cache often dwarfs the model weights themselves — this is why long-context inference needs lots of VRAM.' };
        if (v === '~26 GB') return { correct: false, feedback: 'Too high. Recompute: 2 × 32768 × 80 × 8 × 128 × 2 ≈ 10.7 GB. (You may have forgotten the grouped-query trick — only 8 KV heads, not 64 query heads.)' };
        if (v === '~1 GB') return { correct: false, feedback: 'Too low — you might be missing a factor. Multiply step by step: 2 × 32768 × 80 × 8 × 128 × 2.' };
        if (v === '~140 GB') return { correct: false, feedback: 'That would be the model weights at FP16. KV cache is closer to 10 GB.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Formula: 2 (K and V) × ctx × layers × kv_heads × head_dim × bytes_per_element.',
        '2 × 32,768 × 80 × 8 × 128 × 2 (FP16). Multiply step by step.',
        '≈ 10.7 GB. (Tip: the grouped-query KV head count of 8 is much smaller than the 64 query heads.)'
      ]
    }
  ]
});
