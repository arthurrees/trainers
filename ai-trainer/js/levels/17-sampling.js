// Level 17 — Sampling Strategies
AIT.registerLevel({
  id: 17,
  title: 'Sampling Strategies',
  whyItMatters: 'Once a model has output a probability distribution over the next token, the choice of HOW to sample defines whether the output feels robotic, creative, repetitive, or unhinged. Most people running LLMs tweak temperature without really knowing what it does — this level fixes that.',
  glossary: ['temperature', 'top-p', 'top-k', 'softmax'],
  learn: ''
    + '<h4>The setup</h4>'
    + '<p>The model outputs a vector of logits — one per token in the vocabulary, say 50,000 numbers. Softmax turns them into a probability distribution. The job of a sampler is: <em>pick the next token</em> from this distribution.</p>'

    + '<h4>Greedy — boring but deterministic</h4>'
    + '<p>Always pick the argmax (highest-probability token). Same input → exact same output every time.</p>'
    + '<p>Pros: deterministic, predictable, fastest. Cons: gets stuck in repetitive loops ("the the the the"), can\'t recover from a mistake, terrible for creative tasks.</p>'

    + '<h4>Pure random sampling</h4>'
    + '<p>Sample from the full softmax distribution. Sometimes you pick a one-in-a-million token. Output is incredibly diverse — and often nonsense.</p>'

    + '<h4>Temperature — the master knob</h4>'
    + '<p>Before applying softmax, divide every logit by T (the temperature):</p>'
    + '<div class="formula-box">P_i = exp(z_i / T) / Σ_j exp(z_j / T)</div>'
    + '<ul>'
    +   '<li><strong>T → 0</strong> — distribution collapses onto the argmax. Equivalent to greedy.</li>'
    +   '<li><strong>T = 1</strong> — distribution unchanged (the natural softmax).</li>'
    +   '<li><strong>T &gt; 1</strong> — distribution flattens. Low-probability tokens become more likely. More "creative" but riskier.</li>'
    +   '<li><strong>T &lt; 1</strong> — distribution sharpens. The most-likely token becomes more likely.</li>'
    + '</ul>'

    + '<h4>Top-k sampling</h4>'
    + '<p>Keep only the top k highest-probability tokens; renormalize; sample from those. Cuts off the long tail of unlikely tokens.</p>'
    + '<p>Problem: k is a fixed number, but how confident the model is varies. Sometimes top-5 covers 99% of probability; sometimes it covers 30%. Top-k can cut too aggressively or not enough.</p>'

    + '<h4>Top-p (nucleus) sampling — the modern default</h4>'
    + '<p>Sort tokens by probability descending. Keep the smallest set whose probabilities sum to at least p (e.g., 0.9). Sample from that set.</p>'
    + '<p>The sampling pool size adapts to confidence:</p>'
    + '<ul>'
    +   '<li>If the model is confident, top-p picks just a few tokens (the rest don\'t add up to p anyway).</li>'
    +   '<li>If the model is uncertain, top-p widens to include more tokens.</li>'
    + '</ul>'
    + '<p>This is exactly the behavior we want.</p>'

    + '<h4>Repetition penalties</h4>'
    + '<p>Add a penalty to the logit of any token that has appeared recently. Prevents loops like "I I I I". Common defaults: penalty 1.05–1.2.</p>'

    + '<h4>Beam search — for structured generation</h4>'
    + '<p>Maintain k partial sequences ("beams"). At each step, expand each beam by every possible next token, score the resulting partial sequences (sum of log-probs), keep the top k. Output the best at the end.</p>'
    + '<p>Used heavily in machine translation, summarization, code generation. Wastes compute and produces samey outputs for open-ended creative tasks — rarely used for chat.</p>'

    + '<h4>Practical recipes</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Task</th><th>Settings</th></tr>'
    + '<tr><td>Reproducible factual answer</td><td>T=0 (greedy)</td></tr>'
    + '<tr><td>Code generation</td><td>T=0.2, top-p=0.95</td></tr>'
    + '<tr><td>Chat / general use</td><td>T=0.7, top-p=0.9</td></tr>'
    + '<tr><td>Creative writing, brainstorming</td><td>T=0.9–1.2, top-p=0.95</td></tr>'
    + '<tr><td>Translation / summarization</td><td>beam search, k=4</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">A common confusion</div>'
    + '"Higher temperature = smarter / more creative model" is wrong. Higher temperature makes the model <em>commit less strongly to any single token</em>. It doesn\'t add information; it spreads probability around. Sometimes that helps creative tasks. Sometimes it just produces incoherent text. Tweaking T is a behavioral knob, not a capability knob.'
    + '</div>',

  mountPlay: function (container) {
    var mat = AIT.lib.mat;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'A toy 8-token vocabulary with fixed logits. Adjust temperature, top-k, top-p — see how the resulting sampling distribution changes.';
    container.appendChild(help);

    var tokens = ['mat', 'rug', 'floor', 'sofa', 'chair', 'roof', 'tree', 'cat'];
    var logits = [3.2, 2.8, 2.5, 1.9, 1.5, 0.5, 0.0, -1.0]; // for "the cat sat on the ___"

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>Temperature = <span id="sm-T">0.7</span> <input type="range" id="sm-T-r" min="0.1" max="2.5" step="0.05" value="0.7" style="width:160px"></label>'
    + '<label>Top-k = <span id="sm-k">8</span> <input type="range" id="sm-k-r" min="1" max="8" step="1" value="8" style="width:120px"></label>'
    + '<label>Top-p = <span id="sm-p">1.0</span> <input type="range" id="sm-p-r" min="0.1" max="1.0" step="0.05" value="1.0" style="width:120px"></label>';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function render() {
      var T = parseFloat(document.getElementById('sm-T-r').value);
      var k = parseInt(document.getElementById('sm-k-r').value, 10);
      var p = parseFloat(document.getElementById('sm-p-r').value);
      document.getElementById('sm-T').textContent = T.toFixed(2);
      document.getElementById('sm-k').textContent = k;
      document.getElementById('sm-p').textContent = p.toFixed(2);

      var scaled = logits.map(function (l) { return l / T; });
      var probs = mat.softmax(scaled);
      // sort indices by prob desc
      var idx = probs.map(function (_, i) { return i; });
      idx.sort(function (a, b) { return probs[b] - probs[a]; });

      // Apply top-k: zero out tokens not in top k
      var topkSet = {};
      for (var i = 0; i < k; i++) topkSet[idx[i]] = true;
      // Apply top-p over the (already top-k filtered) tokens, in sorted order
      var cumP = 0, topPSet = {};
      for (var j = 0; j < idx.length; j++) {
        if (!topkSet[idx[j]]) continue;
        topPSet[idx[j]] = true;
        cumP += probs[idx[j]];
        if (cumP >= p) break;
      }
      // Final mask: in both top-k and top-p
      var keep = probs.map(function (_, i) { return topkSet[i] && topPSet[i]; });
      var renorm = 0;
      probs.forEach(function (pp, i) { if (keep[i]) renorm += pp; });
      var final = probs.map(function (pp, i) { return keep[i] ? pp / renorm : 0; });

      var html = '<div><span class="muted">Prompt:</span> "the cat sat on the ___"</div>';
      html += '<table class="truth-table" style="margin:8px 0;font-size:12px">'
            + '<tr><th>Token</th><th>logit</th><th>P (T)</th><th>kept?</th><th>P (final)</th></tr>';
      idx.forEach(function (i) {
        var color = keep[i] ? 'color:var(--accent)' : 'color:var(--text-dim)';
        html += '<tr style="' + color + '"><td><strong>' + tokens[i] + '</strong></td>'
              + '<td>' + logits[i].toFixed(2) + '</td>'
              + '<td>' + (probs[i] * 100).toFixed(1) + '%</td>'
              + '<td>' + (keep[i] ? '✓' : '×') + '</td>'
              + '<td>' + (final[i] * 100).toFixed(1) + '%</td></tr>';
      });
      html += '</table>';
      box.innerHTML = html;
    }
    document.getElementById('sm-T-r').addEventListener('input', render);
    document.getElementById('sm-k-r').addEventListener('input', render);
    document.getElementById('sm-p-r').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What does <strong>temperature = 0</strong> effectively reduce sampling to?',
      mountInput: function (c) {
        var opts = ['Pure random sampling', 'Greedy (always argmax)', 'Beam search with k=1', 'No sampling — model returns probabilities'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Greedy (always argmax)') return { correct: true, feedback: 'Right. As T → 0, dividing logits by a tiny number sends the largest logit relatively to ∞, all others to −∞ — softmax collapses to a one-hot at the argmax. Same as greedy.' };
        if (v === 'Beam search with k=1') return { correct: true, feedback: 'Technically correct — beam search with k=1 is mathematically equivalent to greedy (always picking the single best token). The more direct answer is "greedy (argmax)", since temperature=0 is about collapsing the softmax, not about beam search. But the equivalence is real.' };
        return { correct: false, feedback: 'T → 0 collapses softmax onto the argmax. That\'s greedy.' };
      },
      hints: [
        'Picture the formula: divide logits by T, then softmax. What happens when T is very small?',
        'Dividing by a tiny number scales differences enormously — softmax becomes a sharp peak at the largest logit.',
        'Greedy.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You want diverse outputs but still coherent — i.e., avoid the long tail of unlikely tokens but adapt to how confident the model is at each step. Which sampler is best suited?',
      mountInput: function (c) {
        var opts = ['Pure greedy (T = 0)', 'Top-k with fixed k = 50', 'Top-p (nucleus) sampling with p ≈ 0.9', 'Pure random sampling'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Top-p (nucleus) sampling with p ≈ 0.9') return { correct: true, feedback: 'Right. Top-p adapts: when the model is confident, the nucleus is small (just a few tokens get any chance); when uncertain, it widens. Top-k uses the same cutoff regardless of confidence — sometimes too aggressive, sometimes too loose.' };
        if (v === 'Pure greedy (T = 0)') return { correct: false, feedback: 'Greedy gives zero diversity — same input → same output every time.' };
        if (v === 'Top-k with fixed k = 50') return { correct: false, feedback: 'Closer, but k is fixed. The cutoff doesn\'t adapt to model confidence — sometimes 50 is way too many, sometimes not enough.' };
        if (v === 'Pure random sampling') return { correct: false, feedback: 'No filtering at all → you\'ll occasionally pick a one-in-a-million token and produce gibberish.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'The keyword is "adapt to confidence". Which method changes its pool size based on the distribution?',
        'Top-k uses a fixed pool size. Top-p uses a fixed probability mass.',
        'Top-p (nucleus). Default is around 0.9.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re running an LLM (via Ollama) on a problem where you need <strong>reproducibility</strong> — same prompt should give same output every time, for testing. What settings do you need?',
      mountInput: function (c) {
        var opts = [
          'Temperature = 0 (greedy decoding).',
          'Top-p = 0.5.',
          'Beam search with k = 4.',
          'High temperature with a fixed random seed.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 0) return { correct: true, feedback: 'Right. Greedy decoding is deterministic by construction — no random choice anywhere. (For non-greedy modes you can also fix the random seed, but most production LLM APIs warn that determinism is best-effort because batching across users can introduce nondeterminism even with the same seed.)' };
        if (v === 1) return { correct: false, feedback: 'Top-p is sampling — it picks randomly from the nucleus. Not deterministic.' };
        if (v === 2) return { correct: false, feedback: 'Beam search is deterministic for a given model and tie-breaking, but Ollama and most modern LLM runtimes default to sampling. Greedy is the simpler and more universal answer.' };
        if (v === 3) return { correct: false, feedback: 'A fixed seed helps in theory, but model batching and CUDA non-determinism mean "high temperature + seed" is often not bit-exact. Greedy avoids the problem entirely.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'For exact reproducibility, you want NO randomness at any decoding step.',
        'Which sampling mode picks deterministically each step?',
        'Greedy (T = 0).'
      ]
    }
  ]
});
