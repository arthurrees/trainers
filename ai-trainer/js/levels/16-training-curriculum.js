// Level 16 — The LLM Training Curriculum
AIT.registerLevel({
  id: 16,
  title: 'Pretraining → SFT → RLHF / DPO',
  whyItMatters: 'A "helpful AI assistant" is not one model — it is the result of three training stages, each doing a very different job. Knowing what each stage adds explains why ChatGPT acts the way it does, why Llama and GPT-4 differ at inference, and where you can intervene if you have your own data.',
  glossary: ['pretraining', 'SFT', 'RLHF', 'DPO', 'LoRA', 'parameter'],
  learn: ''
    + '<h4>The three stages</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Stage</th><th>What it teaches</th><th>Data</th><th>Cost</th></tr>'
    + '<tr><td>1. Pretraining</td><td>language, world knowledge, basic reasoning</td><td>10T+ tokens of internet text, books, code</td><td>$1M – $100M</td></tr>'
    + '<tr><td>2. Supervised fine-tuning (SFT)</td><td>follow instructions, respond in a useful format</td><td>10K – 1M handcrafted (instruction, response) pairs</td><td>$10K – $1M</td></tr>'
    + '<tr><td>3. Alignment (RLHF or DPO)</td><td>be helpful, honest, and harmless according to humans</td><td>10K – 1M preference comparisons</td><td>$10K – $1M</td></tr>'
    + '</table>'

    + '<h4>Stage 1 — Pretraining</h4>'
    + '<p>The expensive one. Take an absurd amount of text. Train a transformer to predict the next token. That\'s the entire objective:</p>'
    + '<div class="formula-box">L = − Σ_t log P(token_t | tokens_&lt;t)</div>'
    + '<p>It\'s "self-supervised" — the labels (next token) come for free from the text. From this single objective the model picks up grammar, facts, reasoning, code syntax, world knowledge — anything that helps reduce next-token loss on real text. Frontier models do this on 10–15 trillion tokens for months on tens of thousands of GPUs.</p>'

    + '<h4>Stage 2 — Supervised fine-tuning (SFT)</h4>'
    + '<p>A pretrained model can write text but doesn\'t know what the user wants. If you ask "What is photosynthesis?" it might just continue "What is photosynthesis? It\'s a question often asked in 6th grade biology classes..." instead of answering.</p>'
    + '<p>SFT fixes this. Show the model a curated set of (instruction, ideal-response) pairs and continue training with the same next-token loss. After SFT, the model knows that when a user asks something, the next tokens should be a helpful answer.</p>'
    + '<p>Datasets: a few tens of thousands to a few million pairs. Often human-written, occasionally AI-generated and human-filtered.</p>'

    + '<h4>Stage 3 — Alignment</h4>'
    + '<p>SFT gets you a helpful model. Alignment makes it <em>more</em> helpful, less harmful, and less likely to confidently make things up. Two recipes:</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">RLHF (Reinforcement Learning from Human Feedback)</h5>'
    + '<ol>'
    +   '<li>Collect human preferences: for each prompt, two model responses A and B. Humans label which is better.</li>'
    +   '<li>Train a <strong>reward model</strong> (a separate transformer head) on these pairs to predict "humans would prefer this response by X points."</li>'
    +   '<li>Use RL (typically PPO) to update the LLM to maximize the reward model\'s score, while not drifting too far from the SFT model (KL penalty).</li>'
    + '</ol>'
    + '<p>This is the OpenAI / InstructGPT recipe. Powerful but fiddly — three models in play, hyperparameters everywhere.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">DPO (Direct Preference Optimization)</h5>'
    + '<p>Same preference data, but skip the explicit reward model. A clever derivation shows you can optimize the LLM directly with a contrastive loss on (preferred, dispreferred) pairs:</p>'
    + '<div class="formula-box">L_DPO = −log σ(β · [log π(y_w|x)/π_ref(y_w|x) − log π(y_l|x)/π_ref(y_l|x)])</div>'
    + '<p>(<em>y_w</em> = winning response, <em>y_l</em> = losing.) Simpler implementation, no reward model, fewer moving parts. Modern frontier labs use a mix: DPO for many tasks, RLHF/PPO when extra control is needed.</p>'

    + '<h4>LoRA / PEFT — fine-tune cheaply</h4>'
    + '<p>You don\'t need to update all 70B parameters to adapt a model. <strong>LoRA</strong> (Low-Rank Adaptation) freezes the base weights and adds tiny trainable low-rank matrices alongside them: W_eff = W + A · B, where A and B are small. You train ~1% of the parameters and get most of the benefit. Memory and time cost drop ~10–100×.</p>'
    + '<p>Used everywhere: domain adaptation, custom personalities, multilingual tweaks, instruction adapters.</p>'

    + '<h4>Inference-time alignment (no training at all)</h4>'
    + '<p>Sometimes you don\'t need to retrain anything:</p>'
    + '<ul>'
    +   '<li><strong>System prompts</strong> — "You are a helpful assistant. Refuse harmful requests."</li>'
    +   '<li><strong>Few-shot examples</strong> — show the model 3 examples of the format you want.</li>'
    +   '<li><strong>RAG</strong> — provide retrieved facts in context (level 19).</li>'
    +   '<li><strong>Tool use</strong> — let the model call functions for things it can\'t do internally.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">For your use case (running models locally)</div>'
    + 'When you download a model from Ollama, what you get is the result of all three stages — pretraining + SFT + alignment — already baked in. The "instruct" or "chat" variants are SFT+alignment. The "base" variants are just pretrained. If you want to fine-tune locally, LoRA is your friend: a 7B model can be LoRA-fine-tuned on a single 24GB GPU in hours, not weeks.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click each stage to see what changes about the model.';
    container.appendChild(help);

    var stages = [
      { name: '0. Random init', desc: 'Brand new transformer. Outputs gibberish. ~70B random numbers.', cost: '0', dataNeeded: 'none' },
      { name: '1. Pretrained', desc: 'Trained for months on trillions of tokens. Writes coherent text in many styles, knows facts up to its cutoff date. But: doesn\'t reliably follow instructions — it\'s a text-completer, not a chatbot. Asked a question, it might just continue the question itself.', cost: '$1M–$100M', dataNeeded: '10T+ tokens', costMid: 1e7,  dataMid: 1e13, color: '#f87171' },
      { name: '2. + SFT', desc: 'Continue training on (instruction, ideal-response) pairs. Now the model "knows" that questions deserve answers, that asks for code should produce code, etc. Quality: dramatically more useful but still occasionally rambles, makes things up, refuses to answer reasonable things.', cost: '$10K–$1M', dataNeeded: '10K–1M pairs', costMid: 1e5, dataMid: 1e5, color: '#fbbf24' },
      { name: '3. + RLHF / DPO', desc: 'Train against human preferences (or AI feedback). Output style aligns with what humans rate as helpful, honest, harmless. Refuses harmful requests, hedges appropriately, formats nicely. This is what "ChatGPT-feel" actually is.', cost: '$10K–$1M', dataNeeded: '10K–1M comparisons', costMid: 1e5, dataMid: 1e5, color: '#a78bfa' },
      { name: '4. + LoRA fine-tune', desc: 'OPTIONAL last step for your own use case. Train tiny low-rank adapters on your domain data while freezing the base. Adds your domain knowledge or style without retraining the whole model.', cost: '$10–$1000', dataNeeded: '100–10K examples', costMid: 100, dataMid: 1e3, color: '#4ade80' }
    ];

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 720; canvas.height = 280;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var stepBox = document.createElement('div');
    stepBox.className = 'formula-box';
    stepBox.style.fontSize = '13px';
    stepBox.style.minHeight = '100px';
    container.appendChild(stepBox);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    container.appendChild(ctrls);

    var current = 1; // skip random init by default
    var barBounds = []; // hit testing

    function render() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // log scale: from 10^1 to 10^8 dollars
      var W = canvas.width, H = canvas.height;
      var leftPad = 100, rightPad = 30, topPad = 40, bottomPad = 50;
      var costMin = 10, costMax = 1e8;
      var lgMin = Math.log10(costMin), lgMax = Math.log10(costMax);
      function costToX(c) { return leftPad + (W - leftPad - rightPad) * (Math.log10(c) - lgMin) / (lgMax - lgMin); }

      // axis labels (powers of 10)
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.fillStyle = '#9aa3b2'; ctx.font = '10px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [10, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8].forEach(function (c) {
        var x = costToX(c);
        ctx.beginPath(); ctx.moveTo(x, topPad); ctx.lineTo(x, H - bottomPad); ctx.stroke();
        var label = c >= 1e6 ? '$' + (c / 1e6) + 'M' : c >= 1e3 ? '$' + (c / 1e3) + 'K' : '$' + c;
        ctx.fillText(label, x, H - bottomPad + 6);
      });

      // title
      ctx.fillStyle = '#7ab7ff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
      ctx.fillText('Training cost (log scale)', leftPad, 16);

      // bars: skip stage 0 (no cost)
      var stagesWithCost = stages.slice(1);
      var rowH = (H - topPad - bottomPad) / stagesWithCost.length - 6;
      barBounds = [];
      stagesWithCost.forEach(function (st, idx) {
        var origIdx = idx + 1;
        var minCost = origIdx === 1 ? 1e6 : (origIdx === 4 ? 10 : 1e4);
        var maxCost = origIdx === 1 ? 1e8 : (origIdx === 4 ? 1e3 : 1e6);
        var x1 = costToX(minCost), x2 = costToX(maxCost);
        var y = topPad + idx * (rowH + 6);

        barBounds.push({ x: leftPad - 80, y: y, w: W - rightPad - leftPad + 80, h: rowH, idx: origIdx });

        var isCurrent = origIdx === current;
        // bar
        ctx.fillStyle = st.color + (isCurrent ? '' : '88');
        ctx.fillRect(x1, y, x2 - x1, rowH);
        if (isCurrent) {
          ctx.strokeStyle = st.color; ctx.lineWidth = 2;
          ctx.strokeRect(x1 - 1, y - 1, x2 - x1 + 2, rowH + 2);
        }

        // stage label
        ctx.fillStyle = isCurrent ? st.color : '#e6e8ee';
        ctx.font = (isCurrent ? 'bold ' : '') + '11px monospace';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText(st.name.replace(/^[0-9]+\. /, ''), leftPad - 8, y + rowH / 2);

        // cost label inside bar
        ctx.fillStyle = '#0a0c11';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(st.cost, (x1 + x2) / 2, y + rowH / 2);
      });

      // selected detail
      var s = stages[current];
      stepBox.innerHTML =
        '<div><strong style="color:' + (s.color || 'var(--accent)') + '">' + s.name + '</strong></div>'
      + '<div style="margin:6px 0">' + s.desc + '</div>'
      + '<div><span class="muted">Cost:</span> ' + s.cost + ' &nbsp; '
      + '<span class="muted">Data needed:</span> ' + s.dataNeeded + '</div>';
      ctrls.innerHTML = '';
      stages.forEach(function (st, i) {
        var b = document.createElement('button');
        b.className = (i === current ? 'primary-btn' : 'ghost-btn');
        b.textContent = i + ': ' + st.name.replace(/^[0-9]+\. \+? ?/, '');
        b.style.padding = '6px 12px';
        b.addEventListener('click', function () { current = i; render(); });
        ctrls.appendChild(b);
      });
    }
    canvas.addEventListener('click', function (e) {
      var p = AIT.lib.canvas.pos(canvas, e);
      for (var i = 0; i < barBounds.length; i++) {
        var bb = barBounds[i];
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
      prompt: 'Which stage of LLM training is by far the most expensive in compute and time?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Pretraining', 'SFT (supervised fine-tuning)', 'RLHF', 'LoRA fine-tune'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Pretraining') return { correct: true, feedback: 'Right. Pretraining is months on tens of thousands of GPUs, processing trillions of tokens — easily 100× the cost of all the fine-tuning stages combined.' };
        return { correct: false, feedback: 'Pretraining. SFT, RLHF, and LoRA are 10×–10000× cheaper.' };
      },
      hints: [
        'Which stage uses the largest dataset?',
        'Trillions of tokens vs hundreds of thousands of pairs.',
        'Pretraining.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'What does <strong>DPO</strong> simplify compared to standard <strong>RLHF</strong>?',
      mountInput: function (c) {
        var opts = [
          'It avoids the need for any human preference data.',
          'It removes the explicit reward model — preferences are optimized against directly.',
          'It uses convolutional networks instead of transformers.',
          'It trains 100× faster on the same data.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. RLHF: train reward model → use RL to maximize it. DPO: derive a closed-form loss that lets you optimize the LLM directly on preference pairs, no reward model needed. Same human-preference data, simpler pipeline, fewer moving parts.' };
        if (v === 0) return { correct: false, feedback: 'DPO still uses preference data — the same (winning, losing) pairs as RLHF. The simplification is in HOW that data is used.' };
        return { correct: false, feedback: 'DPO collapses the two-step "train reward model, then RL against it" pipeline into a single direct optimization on the preference data.' };
      },
      hints: [
        'DPO stands for "Direct Preference Optimization". The "Direct" is the clue.',
        'RLHF has reward model + RL. DPO removes one of those stages.',
        'It removes the explicit reward model.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You want to teach Llama-3 8B specific terminology and style for your medical practice. You have 5,000 example responses. You have one consumer GPU (24GB). What approach is most practical?',
      mountInput: function (c) {
        var opts = [
          'Re-pretrain Llama-3 from scratch on your medical data.',
          'Full fine-tuning of all 8B parameters.',
          'LoRA (or QLoRA) fine-tuning on the 5,000 examples.',
          'Use only system prompts; don\'t fine-tune at all.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. LoRA (or its quantized cousin QLoRA) is exactly designed for this: train only ~1% of parameters via low-rank adapters, fits in 24GB, runs in hours, gets you ~90%+ of the quality of full fine-tuning. 5K examples is in the sweet spot.' };
        if (v === 0) return { correct: false, feedback: 'Pretraining from scratch needs trillions of tokens and millions of dollars. Wildly impractical.' };
        if (v === 1) return { correct: false, feedback: 'Full fine-tuning of 8B parameters needs ~32GB+ for parameters alone, plus optimizer state (AdamW doubles or triples this) — won\'t fit in 24GB without aggressive quantization.' };
        if (v === 3) return { correct: false, feedback: 'System prompts work for general behavior but can\'t teach 5K examples worth of medical terminology / style. A small fine-tune is the right tool.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Re-pretraining or full fine-tuning is way out of budget.',
        'You want to add domain knowledge cheaply. There\'s a fine-tuning method designed exactly for this.',
        'LoRA (or QLoRA, the quantized version) — trains tiny adapter matrices, fits on consumer hardware.'
      ]
    }
  ]
});
