// Level 0 — Orientation
AIT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Modern AI is a remarkably small set of ideas applied at huge scale. This level lays out what fits where — the difference between AI, ML, and deep learning, the three big learning paradigms, and the universal recipe (data → model → loss → gradient → update) that we will refine for the next 19 levels.',
  glossary: ['AI', 'ML', 'DL', 'supervised', 'unsupervised', 'RL', 'parameter', 'loss'],
  learn: ''
    + '<h4>Three nested terms</h4>'
    + '<p>People use "AI" loosely. Here\'s how the words actually nest:</p>'
    + '<ul>'
    +   '<li><strong>AI</strong> — the umbrella idea: machines that do "intelligent" things. Includes ML, but also classic stuff like rule-based expert systems and graph search.</li>'
    +   '<li><strong>ML</strong> — the subset of AI that <em>learns from data</em>. Linear regression is ML. Random forests are ML. Neural networks are ML.</li>'
    +   '<li><strong>DL</strong> — the subset of ML using neural networks with many layers. Almost everything you read about today (LLMs, vision, voice) is deep learning.</li>'
    + '</ul>'
    + '<p>This trainer focuses on ML and especially DL — that\'s where the real machinery lives.</p>'

    + '<h4>The three learning paradigms</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Paradigm</th><th>You give the model</th><th>Model learns to</th><th>Examples</th></tr>'
    + '<tr><td>Supervised</td><td>(input, label) pairs</td><td>predict label from input</td><td>image → cat/dog; email → spam/not</td></tr>'
    + '<tr><td>Unsupervised</td><td>just inputs</td><td>find structure</td><td>clustering, embeddings, autoencoders</td></tr>'
    + '<tr><td>Reinforcement</td><td>environment + reward</td><td>act to maximize reward</td><td>game agents, robotics, RLHF</td></tr>'
    + '</table>'
    + '<p>Most production AI systems are supervised, even when they look fancier. ChatGPT-style models combine all three: pretraining is "self-supervised" (predict next token), fine-tuning is supervised, alignment uses RL.</p>'

    + '<h4>The universal training loop</h4>'
    + '<p>Every model in this trainer — from a 2-parameter linear regression to a 70-billion-parameter LLM — gets trained the same way:</p>'
    + '<ol>'
    +   '<li><strong>Initialize</strong> the model with random parameters θ.</li>'
    +   '<li><strong>Forward pass</strong> — pick a batch of data, compute predictions ŷ = model(x; θ).</li>'
    +   '<li><strong>Loss</strong> — compute a scalar L that says how wrong ŷ is.</li>'
    +   '<li><strong>Backward pass</strong> — compute ∇θ L, the gradient of the loss with respect to every parameter.</li>'
    +   '<li><strong>Update</strong> — take a small step "downhill": θ ← θ − η · ∇θ L.</li>'
    +   '<li>Go to 2. Repeat for millions or billions of steps.</li>'
    + '</ol>'
    + '<p>That\'s the entire game. Everything else — architectures, optimizers, regularization, attention, RLHF — is decorations on this loop.</p>'

    + '<div class="callout"><div class="label">Why deep learning won</div>'
    + 'For decades, ML was a zoo of carefully hand-crafted models for each domain (SIFT features for vision, MFCC for speech, parsers for language). Around 2012, two things converged: enough data (the internet) and enough compute (GPUs) for a single approach — deep neural networks trained end-to-end — to beat all the specialist methods at their own games. The trade-off: deep nets need a lot more data and compute, but they replace decades of domain expertise with raw scale.'
    + '</div>'

    + '<h4>What you should already have</h4>'
    + '<p>Probability (you said you do), basic algebra, a willingness to read a few formulas. Linear algebra and calculus get covered (briefly) in levels 1 and 2 — skim if you know them, slow down if you don\'t.</p>'

    + '<h4>How this app works</h4>'
    + '<p>Every level: <strong>Learn</strong> (the lesson, with formulas and worked examples), <strong>Play</strong> (a sandbox to mess around in), <strong>Try</strong> (3 puzzles, easy → hard, with 3 progressive hints each). Progress saves automatically.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Click a paradigm to see what it looks like in practice.</p>';
    var items = [
      { name: 'Supervised — image classification', desc: 'You feed millions of (image, label) pairs. The model learns to map pixels → label probabilities. Loss = cross-entropy. Examples: ImageNet, MNIST, all medical-imaging models.' },
      { name: 'Supervised — regression', desc: 'Same structure, but the label is a continuous number. Predict tomorrow\'s temperature from today\'s readings. Loss = MSE.' },
      { name: 'Self-supervised — language modeling', desc: 'Take huge unlabeled text, and ask the model to predict the next token from the preceding ones. The labels come for free from the text itself. This is how LLMs are pretrained.' },
      { name: 'Unsupervised — clustering', desc: 'No labels at all. The model groups similar inputs together. Used for customer segmentation, anomaly detection, exploratory analysis.' },
      { name: 'Unsupervised — embeddings', desc: 'Map each input to a vector such that similar inputs get nearby vectors. Powers semantic search, recommendation, vector DBs.' },
      { name: 'RL — game playing', desc: 'Agent plays a game, gets reward at the end. Learns a policy that maximizes expected reward. AlphaGo, OpenAI Five, robotics.' },
      { name: 'RL — RLHF (alignment)', desc: 'After pretraining, train a reward model on human preferences, then use RL to optimize the LLM against that reward. Turns "predict next token" into "be helpful and harmless".' }
    ];
    var grid = document.createElement('div');
    grid.className = 'chip-row';
    grid.style.marginBottom = '16px';
    var output = document.createElement('div');
    output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click any paradigm</span>';
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.textContent = it.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML = '<div><strong style="color:var(--accent)">' + it.name + '</strong></div><div style="margin-top:6px">' + it.desc + '</div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which paradigm best describes "the model is given (image, label) pairs and learns to predict labels"?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Supervised', 'Unsupervised', 'Reinforcement'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Supervised') return { correct: true, feedback: 'Right. Supervised = labeled training data. The model learns a mapping x → y from explicit (x, y) examples.' };
        return { correct: false, feedback: 'Supervised — it\'s the one with explicit labels.' };
      },
      hints: [
        '"Labels" is the keyword — what does that pair with?',
        'If you\'re telling the model the right answer for every example, you\'re supervising it.',
        'Supervised.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Order the steps of one training iteration. Tick only the statements that are <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'The forward pass computes the loss after computing predictions.',  t: true },
          { label: 'The backward pass computes the gradient of the loss with respect to the parameters.', t: true },
          { label: 'The optimizer takes a step opposite the gradient direction (downhill).', t: true },
          { label: 'Backward pass happens before forward pass in each iteration.', t: false },
          { label: 'A model with random initial parameters is useless — you must start from a known-good initialization.', t: false }
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
        if (allCorrect) return { correct: true, feedback: 'Right. The order is forward → loss → backward → update. Backward depends on having computed loss first. And random init is the norm — it\'s usually all you need.' };
        return { correct: false, feedback: 'Re-check: order is forward → loss → backward → update. Backward CAN\'T happen first (it needs a loss). Random init is fine; carefully crafted init is sometimes nice but not required.' };
      },
      hints: [
        'You need a prediction before you can compute its error.',
        'Gradients are computed FROM the loss — so the loss must already be computed.',
        'Three statements are true. Two are false: "backward first" and "random init is useless".'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A team has a huge unlabeled corpus of medical journal articles. They want a model that maps each article to a vector such that semantically similar articles end up close together (for search and recommendation). Which paradigm fits best?',
      mountInput: function (c) {
        var opts = [
          'Supervised learning with cross-entropy loss',
          'Unsupervised / self-supervised representation learning',
          'Reinforcement learning with article-rating rewards',
          'Rule-based AI — write a TF-IDF system, no learning needed'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. There are no labels — just text. The goal (vectors that capture meaning) is a representation-learning task. Modern approach: pretrain or use an off-the-shelf embedding model (a transformer trained with contrastive or masked-token objectives). That\'s self-supervised, a cousin of unsupervised.' };
        if (v === 0) return { correct: false, feedback: 'There ARE no labels in the prompt. Supervised needs explicit labeled pairs.' };
        if (v === 2) return { correct: false, feedback: 'No reward signal mentioned. RL needs rewards.' };
        if (v === 3) return { correct: false, feedback: 'TF-IDF is a non-learning baseline; it would catch keyword overlap but miss "this article uses different words for the same concept" — which is exactly what learned embeddings handle.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Read the prompt carefully — what is given, and what is asked? Are there labels?',
        'No labels and no rewards. The goal is "vectors that encode meaning" — that\'s representation learning.',
        'Self-supervised / unsupervised. The actual modern recipe: use a pretrained embedding model like sentence-BERT or fine-tune one on contrastive pairs.'
      ]
    }
  ]
});
