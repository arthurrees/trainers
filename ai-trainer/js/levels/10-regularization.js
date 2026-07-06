// Level 10 — Overfitting & Regularization
AIT.registerLevel({
  id: 10,
  title: 'Overfitting & Regularization',
  whyItMatters: 'A model that scores 100% on training data is not a good model — it might just be memorizing. Knowing how to spot overfitting and which regularizer to reach for is the difference between a model that works in production and one that explodes the moment real data shows up.',
  glossary: ['overfitting', 'regularization', 'dropout', 'epoch', 'batch'],
  learn: ''
    + '<h4>What overfitting looks like</h4>'
    + '<p>You split your data into <strong>train</strong>, <strong>validation</strong>, and <strong>test</strong>. You train on train, watch loss on validation. The classic picture:</p>'
    + '<div class="example"><div class="label">Train vs val loss over time</div>'
    + '<code class="inline">train_loss</code> &nbsp;keeps going ↓ ↓ ↓<br>'
    + '<code class="inline">val_loss</code> &nbsp;&nbsp;&nbsp;goes ↓ ↓ ↓ then turns and starts going ↑'
    + '</div>'
    + '<p>That turning point is when the model stops learning generalizable patterns and starts memorizing training noise. Anywhere past it, the model is <strong>overfit</strong>.</p>'

    + '<h4>The bias–variance tradeoff</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th></th><th>Underfit (high bias)</th><th>Just right</th><th>Overfit (high variance)</th></tr>'
    + '<tr><td>Train loss</td><td>high</td><td>low</td><td>very low</td></tr>'
    + '<tr><td>Val loss</td><td>high</td><td>low</td><td>high</td></tr>'
    + '<tr><td>Cause</td><td>model too simple</td><td>—</td><td>model too complex / not enough data / trained too long</td></tr>'
    + '<tr><td>Fix</td><td>bigger model, more features</td><td>—</td><td>more data, regularize, simplify, early stop</td></tr>'
    + '</table>'

    + '<h4>The fixes — by mechanism</h4>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">More data</h5>'
    + '<p>The most powerful regularizer. Doubling data shrinks variance more reliably than any other trick. Often impractical, hence the rest of this list.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">L2 weight decay</h5>'
    + '<p>Add a penalty <code class="inline">λ · Σ wᵢ²</code> to the loss. This pushes weights to be small, which restricts the model to smoother functions. Standard λ values: 1e−4 to 1e−2 for transformers; tiny but consequential.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">L1 weight decay</h5>'
    + '<p>Penalty <code class="inline">λ · Σ |wᵢ|</code>. Pushes weights toward exactly zero, producing <em>sparse</em> models. Useful for feature selection; less common in deep learning than L2.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">Dropout</h5>'
    + '<p>During training, randomly zero out a fraction p of activations on each forward pass. Prevents the network from relying on any single neuron — each neuron has to be useful even when its neighbors disappear. Typical p = 0.1 to 0.5.</p>'
    + '<p>At inference time, dropout is turned off and activations are scaled to compensate.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">Early stopping</h5>'
    + '<p>Watch val loss; stop when it starts rising. The simplest, hardest-to-mess-up regularizer.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">Data augmentation</h5>'
    + '<p>Make synthetic variations of training examples — random crops, flips, color jitter for images; backtranslation, masking for text. Effectively multiplies your training set.</p>'

    + '<h5 style="color:var(--accent);margin:14px 0 4px">Batch normalization / layer normalization</h5>'
    + '<p>Originally proposed for stability, but they have a regularizing side-effect (the per-batch noise in batchnorm acts a bit like dropout).</p>'

    + '<div class="callout"><div class="label">"More parameters than data" — why LLMs don\'t obviously overfit</div>'
    + 'Classical theory says a 70-billion-parameter model on 1 trillion tokens should overfit catastrophically. In practice modern overparameterized neural nets often <em>don\'t</em>, especially with good regularization, large batch sizes, and the implicit regularization of SGD itself. This "double descent" phenomenon is still being understood.'
    + '</div>'

    + '<h4>Generalization vs memorization — a quick test</h4>'
    + '<p>If your val loss is much higher than your train loss → overfitting. If both are equally high → underfitting. If both are low and roughly equal → you\'re probably good.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Simulated training curves. Adjust regularization and watch the val loss change. (The simulator picks the moment of overfitting based on regularization strength.)';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>L2 strength = <span id="reg-l2">0.0</span> <input type="range" id="reg-l2-r" min="0" max="0.5" step="0.01" value="0" style="width:160px"></label>'
    + '<label>Dropout p = <span id="reg-dp">0.0</span> <input type="range" id="reg-dp-r" min="0" max="0.5" step="0.05" value="0" style="width:140px"></label>'
    + '<label>Dataset size = <span id="reg-ds">small</span> <input type="range" id="reg-ds-r" min="0" max="2" step="1" value="0" style="width:120px"></label>';
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    var canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 280;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function render() {
      var l2 = parseFloat(document.getElementById('reg-l2-r').value);
      var dp = parseFloat(document.getElementById('reg-dp-r').value);
      var ds = parseInt(document.getElementById('reg-ds-r').value, 10);
      var dsLabels = ['small', 'medium', 'huge'];
      document.getElementById('reg-l2').textContent = l2.toFixed(2);
      document.getElementById('reg-dp').textContent = dp.toFixed(2);
      document.getElementById('reg-ds').textContent = dsLabels[ds];

      // Toy curves: train loss decays exponentially. Val loss U-shape.
      // The minimum of val and how soon it bottoms depend on regularization.
      var N = 100;
      var trainLoss = [], valLoss = [];
      var floor = 0.05 + 0.05 * l2 + 0.02 * dp; // more regularization -> slightly higher train floor
      var overfitStrength = Math.max(0, 1 - 4 * l2 - 2 * dp - 0.3 * ds); // smaller = less overfit
      var overfitOnset = 30 + 60 * (l2 + 0.5 * dp + 0.2 * ds); // later with reg
      for (var i = 0; i < N; i++) {
        var t = i / N;
        var tl = floor + 1.0 * Math.exp(-3.5 * t);
        trainLoss.push(tl);
        // val loss = train loss + overfit bump after onset
        var bump = 0;
        if (i > overfitOnset) {
          var u = (i - overfitOnset) / (N - overfitOnset);
          bump = overfitStrength * 0.7 * u * u;
        }
        valLoss.push(tl + bump + 0.04);
      }

      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, pad = 30;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#3a4256'; ctx.strokeRect(pad, pad, W - 2*pad, H - 2*pad);
      function px(i) { return pad + (W - 2*pad) * i / (N - 1); }
      function py(v) { return H - pad - (H - 2*pad) * Math.min(1.5, v) / 1.5; }

      function plot(arr, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        for (var i = 0; i < arr.length; i++) {
          if (i === 0) ctx.moveTo(px(i), py(arr[i]));
          else ctx.lineTo(px(i), py(arr[i]));
        }
        ctx.stroke();
      }
      plot(trainLoss, '#7ab7ff');
      plot(valLoss, '#a78bfa');

      // legend
      ctx.fillStyle = '#7ab7ff'; ctx.fillRect(pad + 10, 10, 12, 4);
      ctx.fillStyle = '#9aa3b2'; ctx.font = '12px monospace';
      ctx.fillText('train loss', pad + 28, 16);
      ctx.fillStyle = '#a78bfa'; ctx.fillRect(pad + 110, 10, 12, 4);
      ctx.fillStyle = '#9aa3b2';
      ctx.fillText('val loss', pad + 128, 16);
      ctx.fillStyle = '#9aa3b2'; ctx.fillText('epoch →', W - 80, H - 6);
      ctx.fillText('loss ↑', 6, pad + 4);

      var minVal = Math.min.apply(null, valLoss);
      var minValAt = valLoss.indexOf(minVal);
      var endTrain = trainLoss[trainLoss.length - 1];
      var endVal = valLoss[valLoss.length - 1];
      var diagnosis = 'good fit';
      if (endTrain > 0.4) diagnosis = 'underfit (train loss high)';
      else if (endVal - endTrain > 0.2) diagnosis = 'overfit (val ≫ train)';

      box.innerHTML =
        '<div><span class="muted">Best val loss:</span> <span class="result">' + minVal.toFixed(3) + '</span> at epoch ' + minValAt + '</div>'
      + '<div><span class="muted">Final train / val:</span> ' + endTrain.toFixed(3) + ' / ' + endVal.toFixed(3) + '</div>'
      + '<div><span class="muted">Diagnosis:</span> <strong style="color:var(--accent)">' + diagnosis + '</strong></div>';
    }
    document.getElementById('reg-l2-r').addEventListener('input', render);
    document.getElementById('reg-dp-r').addEventListener('input', render);
    document.getElementById('reg-ds-r').addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Train loss is 0.05 (very low). Validation loss is 0.42 (high). Most likely diagnosis?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Underfitting', 'Overfitting', 'Good fit', 'Wrong loss function'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Overfitting') return { correct: true, feedback: 'Right. Train loss low + val loss much higher = the classic signature of overfitting. The model memorized training data but didn\'t learn generalizable patterns.' };
        return { correct: false, feedback: 'Train low + val high = overfitting. (Underfitting would have BOTH high.)' };
      },
      hints: [
        'Compare train and val. What does the gap say?',
        'A big gap means the model is great on training data but poor on unseen data.',
        'Classic overfitting.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Tick each statement that is <strong>true</strong> about regularization.',
      mountInput: function (c) {
        var items = [
          { label: 'L2 weight decay penalizes large weights, encouraging smoother models.',  t: true },
          { label: 'Dropout randomly zeroes activations during training.',                   t: true },
          { label: 'Early stopping is a form of regularization.',                            t: true },
          { label: 'L1 weight decay produces dense weight matrices.',                        t: false },
          { label: 'More training data is rarely a fix for overfitting.',                    t: false },
          { label: 'Dropout is also active at inference time.',                              t: false }
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
        if (allCorrect) return { correct: true, feedback: 'Right. L1 produces SPARSE matrices (many zeros) — opposite of dense. More data is the SINGLE BEST regularizer. Dropout is OFF at inference time. The other three are textbook true.' };
        return { correct: false, feedback: 'Re-check: L1 → sparse (not dense). More data is the most effective fix for overfitting. Dropout is training-only — turned off for inference.' };
      },
      hints: [
        'L1 zeroes things out — that\'s sparsity, the opposite of dense.',
        'Dropout is a training-time perturbation, not an inference-time one.',
        'Three are true: L2, dropout-during-training, early stopping.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re training a model on a small dataset (1,000 images) and the model is severely overfitting. You can only do <strong>one</strong> thing — which is most likely to help most?',
      mountInput: function (c) {
        var opts = [
          'Make the model bigger (more parameters).',
          'Train for more epochs.',
          'Add data augmentation (random crops, flips, color jitter).',
          'Use a much higher learning rate.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. Augmentation effectively multiplies your dataset — a 1,000-image set with random crops/flips/color jitter behaves like a much larger one. It\'s the single biggest lever when "get more data" isn\'t available. (Bigger model would make overfitting worse; more epochs same; high lr is unrelated.)' };
        if (v === 0) return { correct: false, feedback: 'A bigger model has MORE capacity to memorize 1,000 examples — it would overfit harder, not less.' };
        if (v === 1) return { correct: false, feedback: 'More epochs = more time to memorize. Goes the wrong direction.' };
        if (v === 3) return { correct: false, feedback: 'Higher lr might destabilize training but doesn\'t directly fight overfitting.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Overfitting on small data is a classic problem. The most effective single fix is to expand the data.',
        'You can\'t collect more, but you can synthesize variations of what you have.',
        'Data augmentation.'
      ]
    }
  ]
});
