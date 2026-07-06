// Level 6 — Proof by Induction
DMT.registerLevel({
  id: 6,
  title: 'Proof by Induction',
  whyItMatters: 'Loops, recursion, and any algorithm that builds up a result one step at a time are proven correct by induction. It\'s the same idea as a recursive function: handle the base case, then trust the recursive call.',
  glossary: ['induction', 'base case', 'inductive step', '∀'],
  learn: ''
    + '<h4>The big idea</h4>'
    + '<p>You want to prove some statement <code class="inline">P(n)</code> is true for <strong>every</strong> natural number n. You can\'t check infinitely many cases. Instead:</p>'
    + '<ol>'
    +   '<li><strong>Base case</strong>: prove <code class="inline">P(0)</code> (or whatever the smallest n is) directly.</li>'
    +   '<li><strong>Inductive step</strong>: prove that <em>if</em> <code class="inline">P(k)</code> is true for some arbitrary k, <em>then</em> <code class="inline">P(k+1)</code> is also true.</li>'
    + '</ol>'
    + '<p>Once both pieces are in place, P(n) is true for every n. The reasoning: P(0) holds, so P(1) holds (by the step), so P(2) holds, so P(3)... domino-style, all the way up.</p>'

    + '<div class="callout"><div class="label">Programming analogy</div>'
    + 'Induction is recursion in math form. Base case = base case of the recursion. Inductive step = "assume the recursive call works, show the wrapper does the right thing".'
    + '</div>'

    + '<h4>Worked example: 1 + 2 + ... + n = n(n+1)/2</h4>'
    + '<p>Claim: For all n ≥ 1, <code class="inline">1 + 2 + ... + n = n(n+1)/2</code>.</p>'

    + '<div class="example"><div class="label">Base case: n = 1</div>'
    + 'Left side: 1. Right side: 1·2/2 = 1. ✓ Equal, so P(1) holds.'
    + '</div>'

    + '<div class="example"><div class="label">Inductive step</div>'
    + '<strong>Assume</strong> P(k): &nbsp; 1 + 2 + ... + k = k(k+1)/2 &nbsp; <span class="muted">(this is the inductive hypothesis)</span><br>'
    + '<strong>Show</strong> P(k+1): &nbsp; 1 + 2 + ... + k + (k+1) = (k+1)(k+2)/2<br><br>'
    + 'Take the left side of P(k+1):<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp; 1 + 2 + ... + k + (k+1)<br>'
    + '&nbsp;&nbsp;= [1 + 2 + ... + k] + (k+1) &nbsp; <span class="muted">(group the first k)</span><br>'
    + '&nbsp;&nbsp;= k(k+1)/2 + (k+1) &nbsp; <span class="muted">(by the hypothesis P(k))</span><br>'
    + '&nbsp;&nbsp;= (k+1)·[k/2 + 1]<br>'
    + '&nbsp;&nbsp;= (k+1)·(k+2)/2<br>'
    + 'Which is the right side of P(k+1). ✓'
    + '</div>'

    + '<p>Both pieces done → claim proven for all n ≥ 1. ∎</p>'

    + '<h4>The inductive hypothesis is the trick</h4>'
    + '<p>The line "<em>assume P(k) is true</em>" feels like cheating — like assuming what you\'re trying to prove. But you\'re really proving the implication "P(k) → P(k+1)" for an arbitrary k, not declaring P(k) true outright. Combined with the base case, that implication chain forces P to hold everywhere.</p>'

    + '<div class="callout"><div class="label">Common pitfall</div>'
    + 'You must prove the inductive step for an <em>arbitrary</em> k — you can\'t assume k is special. And you can\'t skip the base case! Without it, the dominos never get knocked over.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Step through the induction proof of <code class="inline">1 + 2 + ... + n = n(n+1)/2</code>. Click "Next" to advance.</p>'
      + '<div id="ind-frame" class="formula-box" style="font-size:15px;line-height:1.7"></div>'
      + '<div class="controls-row">'
      +   '<button class="secondary-btn" id="ind-prev">← Back</button>'
      +   '<button class="primary-btn" id="ind-next">Next →</button>'
      +   '<span id="ind-pos" class="muted"></span>'
      + '</div>';
    var steps = [
      { title: 'Goal',
        body: 'Prove that for every n ≥ 1: <strong>1 + 2 + ... + n = n(n+1)/2</strong>.<br><br>We do this in two parts: a base case and an inductive step.' },
      { title: 'Base case (n = 1)',
        body: 'Left side: <code class="inline">1</code><br>Right side: <code class="inline">1·(1+1)/2 = 2/2 = 1</code><br>Equal ✓. So P(1) holds.' },
      { title: 'Inductive hypothesis',
        body: 'Pick an arbitrary k ≥ 1, and ASSUME P(k) is true:<br><br><code class="inline">1 + 2 + ... + k = k(k+1)/2</code><br><br>This is the "free assumption". We use it to derive P(k+1).' },
      { title: 'What we need to show: P(k+1)',
        body: '<code class="inline">1 + 2 + ... + k + (k+1) = (k+1)(k+2)/2</code>' },
      { title: 'Manipulate the left side',
        body: '1 + 2 + ... + k + (k+1)<br>= [1 + 2 + ... + k] + (k+1) &nbsp;<span class="muted">(group the first k)</span><br>= <strong>k(k+1)/2</strong> + (k+1) &nbsp;<span class="muted">(by the hypothesis!)</span>' },
      { title: 'Algebra',
        body: 'k(k+1)/2 + (k+1)<br>= (k+1)·[k/2 + 1]<br>= (k+1)·(k+2)/2 &nbsp;<span class="muted">✓</span><br><br>That equals the right side of P(k+1). Step done.' },
      { title: 'Conclusion',
        body: 'P(1) holds (base case).<br>For any k, P(k) → P(k+1) (inductive step).<br>By induction, P(n) holds for every n ≥ 1.<br><br><strong>∎</strong>' }
    ];
    var idx = 0;
    var frame = container.querySelector('#ind-frame');
    var pos = container.querySelector('#ind-pos');
    function render() {
      frame.innerHTML = '<div style="color:var(--accent);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">' + steps[idx].title + '</div>' + steps[idx].body;
      pos.textContent = ' Step ' + (idx + 1) + ' of ' + steps.length;
      container.querySelector('#ind-prev').disabled = (idx === 0);
      container.querySelector('#ind-next').disabled = (idx === steps.length - 1);
    }
    container.querySelector('#ind-prev').addEventListener('click', function () { if (idx > 0) { idx--; render(); } });
    container.querySelector('#ind-next').addEventListener('click', function () { if (idx < steps.length - 1) { idx++; render(); } });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'In the proof that <code class="inline">2^0 + 2^1 + ... + 2^n = 2^(n+1) - 1</code> for n ≥ 0, what is the <strong>base case</strong>?',
      mountInput: function (c) {
        var opts = [
          'n = 0: left side = 1, right side = 2¹ − 1 = 1. ✓',
          'n = 1: left side = 1 + 2 = 3, right side = 2² − 1 = 3. ✓',
          'Assume P(k) holds, then derive P(k+1).',
          'There is no base case in induction.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 0) return { correct: true, feedback: 'The base case verifies P(n) directly at the smallest n, which is 0 here. Both sides come out to 1.' };
        if (v === 1) return { correct: false, feedback: 'You picked n=1, but the smallest n in the claim is 0. The base case should be the smallest value where P is claimed to hold.' };
        if (v === 2) return { correct: false, feedback: 'That\'s the inductive STEP. The base case is direct verification at the smallest n.' };
        return { correct: false, feedback: 'Induction always has a base case. It\'s the foundation everything else stands on.' };
      },
      hints: [
        'Base case = checking P(n) directly at the smallest n in the claim.',
        'Smallest n here is 0. Plug n=0 into both sides.',
        'Left: 2⁰ = 1. Right: 2¹ − 1 = 1. Match → base case holds.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'During the inductive step of proving "P(n) for all n ≥ 0", what exactly is the <strong>inductive hypothesis</strong>?',
      mountInput: function (c) {
        var opts = [
          'P(0) is true.',
          'P(n) is true for every n ≥ 0.',
          'For some arbitrary k ≥ 0, P(k) is true.',
          'P(k+1) is true.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'You ASSUME P(k) for an arbitrary k, then PROVE P(k+1). The hypothesis is the assumption you get to use.' };
        if (v === 1) return { correct: false, feedback: 'That\'s what you\'re trying to prove overall — circular if you assumed it. The hypothesis is just for one arbitrary k.' };
        if (v === 0) return { correct: false, feedback: 'P(0) is the base case, not the hypothesis used inside the inductive step.' };
        return { correct: false, feedback: 'P(k+1) is what you\'re trying to prove in the step, not what you assume. You assume P(k) and derive P(k+1).' };
      },
      hints: [
        'You assume something at k, then prove something at k+1.',
        'You don\'t assume the entire claim — only that it holds at some particular k.',
        'For arbitrary k ≥ 0, assume P(k) — that\'s the hypothesis.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Below are the steps of a proof that <code class="inline">1 + 3 + 5 + ... + (2n−1) = n²</code> for n ≥ 1, but they\'re shuffled. Drag them into the correct order (1 = first).</p>',
      mountInput: function (c) {
        var steps = [
          { id: 'A', text: 'Conclude: by induction, the formula holds for all n ≥ 1.' },
          { id: 'B', text: 'Base case: n = 1. Left side = 1, right side = 1² = 1. ✓' },
          { id: 'C', text: 'Inductive hypothesis: assume 1 + 3 + ... + (2k−1) = k² for some k ≥ 1.' },
          { id: 'D', text: 'Inductive step: show 1 + 3 + ... + (2k−1) + (2(k+1)−1) = (k+1)². Add (2k+1) to both sides of the hypothesis: k² + (2k+1) = (k+1)². ✓' }
        ];
        // Correct order: B, C, D, A
        var correct = ['B', 'C', 'D', 'A'];
        // shuffle deterministically (not too random)
        var shuffled = ['D', 'B', 'A', 'C'];
        var ordered = shuffled.map(function (id) { return steps.find(function (s) { return s.id === id; }); });
        var list = document.createElement('div');
        list.className = 'steps-list';
        function render() {
          list.innerHTML = '';
          ordered.forEach(function (s, i) {
            var div = document.createElement('div');
            div.className = 'step-item';
            div.innerHTML = '<span class="step-handle">#' + (i + 1) + '</span>'
              + '<span style="flex:1">' + s.text + '</span>'
              + '<button class="ghost-btn" data-up="' + i + '" style="padding:4px 8px">↑</button>'
              + '<button class="ghost-btn" data-down="' + i + '" style="padding:4px 8px">↓</button>';
            list.appendChild(div);
          });
          Array.prototype.forEach.call(list.querySelectorAll('button[data-up]'), function (b) {
            b.addEventListener('click', function () {
              var i = parseInt(b.getAttribute('data-up'), 10);
              if (i > 0) { var t = ordered[i - 1]; ordered[i - 1] = ordered[i]; ordered[i] = t; render(); }
            });
          });
          Array.prototype.forEach.call(list.querySelectorAll('button[data-down]'), function (b) {
            b.addEventListener('click', function () {
              var i = parseInt(b.getAttribute('data-down'), 10);
              if (i < ordered.length - 1) { var t = ordered[i + 1]; ordered[i + 1] = ordered[i]; ordered[i] = t; render(); }
            });
          });
        }
        render();
        c.appendChild(list);
        return function () { return ordered.map(function (s) { return s.id; }); };
      },
      check: function (v) {
        var correct = ['B', 'C', 'D', 'A'];
        var ok = v.length === correct.length && v.every(function (x, i) { return x === correct[i]; });
        if (ok) return { correct: true, feedback: 'Perfect. Base → hypothesis → step → conclusion.' };
        return { correct: false, feedback: 'Not quite. Order is: base case, inductive hypothesis, inductive step, conclusion.' };
      },
      hints: [
        'Every induction proof has the same skeleton: base case, then the inductive piece, then the conclusion.',
        'Inside the inductive piece: state the hypothesis BEFORE doing the step that uses it.',
        'Order: Base → Hypothesis → Step → Conclusion.'
      ]
    }
  ]
});
