// Level 4 — Methods of Proof
DMT.registerLevel({
  id: 4,
  title: 'Methods of Proof',
  whyItMatters: 'A proof is a correctness argument that covers every allowed input. The same habits power loop invariants, API contracts, security arguments, and explanations of why an algorithm cannot fail.',
  glossary: ['∀', '∃', '→', '¬', '∴', 'ℝ'],
  learn: ''
    + '<h4>What a proof does</h4>'
    + '<p>A proof starts from facts you are allowed to use—definitions, premises, and already-proved results—and reaches a conclusion by justified steps. Testing examples can suggest a claim, but examples alone cannot prove a universal statement.</p>'
    + '<div class="callout"><div class="label">Quantifiers tell you the job</div>'
    + 'To disprove <code class="inline">∀x : P(x)</code>, one <strong>counterexample</strong> is enough. To prove <code class="inline">∃x : P(x)</code>, one valid witness is enough. Proving a universal statement requires an argument for an arbitrary allowed x.'
    + '</div>'
    + '<h4>Four core methods</h4>'
    + '<table class="truth-table"><thead><tr><th>Method</th><th>How it starts</th><th>Best fit</th></tr></thead><tbody>'
    + '<tr><td>Direct</td><td>Assume the hypothesis p</td><td>Definitions lead naturally to q</td></tr>'
    + '<tr><td>Contrapositive</td><td>Assume ¬q; prove ¬p</td><td>p → q is awkward, but ¬q → ¬p is concrete</td></tr>'
    + '<tr><td>Contradiction</td><td>Assume the claim is false</td><td>The false assumption forces an impossibility</td></tr>'
    + '<tr><td>Cases</td><td>Split into exhaustive possibilities</td><td>Different inputs need different arguments</td></tr>'
    + '</tbody></table>'
    + '<div class="example"><div class="label">Direct proof</div>'
    + 'Claim: if n is even, then n² is even.<br>Assume n is even. By definition, n = 2k for some integer k. Then n² = (2k)² = 4k² = 2(2k²), which has the form 2 × integer. Therefore n² is even.'
    + '</div>'
    + '<div class="example"><div class="label">Contrapositive</div>'
    + 'Claim: if n² is even, then n is even. Prove the equivalent contrapositive: if n is odd, then n² is odd. Write n = 2k+1; then n² = 2(2k²+2k)+1, which is odd.'
    + '</div>'
    + '<h4>Validity and inference</h4>'
    + '<p>An argument is <strong>valid</strong> when it is impossible for every premise to be true while the conclusion is false. Two common inference rules are:</p>'
    + '<ul><li><strong>Modus ponens:</strong> p → q, p, therefore q.</li>'
    + '<li><strong>Modus tollens:</strong> p → q, ¬q, therefore ¬p.</li></ul>'
    + '<div class="callout"><div class="label">Avoid affirming the consequent</div>'
    + 'From p → q and q, you may <em>not</em> conclude p. A program can reach the same output through more than one path.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Choose a proof method to see its reusable skeleton.</p>'
      + '<div class="chip-row" id="proof-methods"></div>'
      + '<div id="proof-skeleton" class="formula-box" aria-live="polite"></div>';
    var methods = [
      { name: 'Direct', body: '<strong>Goal:</strong> p → q<br>1. Assume p.<br>2. Unpack definitions.<br>3. Derive q.<br>4. Therefore p → q.' },
      { name: 'Contrapositive', body: '<strong>Goal:</strong> p → q<br>1. Rewrite as ¬q → ¬p.<br>2. Assume ¬q.<br>3. Derive ¬p.<br>4. The contrapositive proves the original.' },
      { name: 'Contradiction', body: '<strong>Goal:</strong> prove C<br>1. Assume ¬C.<br>2. Derive an impossibility such as r ∧ ¬r.<br>3. Reject ¬C; therefore C.' },
      { name: 'Cases', body: '<strong>Goal:</strong> prove C for every input<br>1. Split into exhaustive cases.<br>2. Prove C in each case.<br>3. Since every input is covered, C always holds.' }
    ];
    var row = container.querySelector('#proof-methods');
    var out = container.querySelector('#proof-skeleton');
    methods.forEach(function (m, i) {
      var b = document.createElement('button');
      b.className = 'chip'; b.textContent = m.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(row.querySelectorAll('.chip'), function (x) { x.classList.remove('active'); });
        b.classList.add('active'); out.innerHTML = m.body;
      });
      row.appendChild(b);
      if (i === 0) b.click();
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which value is a counterexample to <code class="inline">∀x ∈ ℝ : x² ≥ x</code>?',
      mountInput: function (c) {
        var s = document.createElement('select');
        s.innerHTML = '<option value="">— pick one —</option><option value="-2">n = -2</option><option value="0">n = 0</option><option value="0.5">n = 1/2</option><option value="2">n = 2</option>';
        c.appendChild(s); return function () { return s.value; };
      },
      check: function (v) {
        if (v === '0.5') return { correct: true, feedback: 'At x=1/2, x²=1/4, and 1/4 is not ≥ 1/2. One counterexample disproves the universal claim.' };
        return { correct: false, feedback: 'Substitute each value. At x=1/2, the claim becomes 1/4 ≥ 1/2, which is false.' };
      },
      hints: ['A counterexample is one allowed input that makes the claim false.', 'Try a real number strictly between 0 and 1.', 'At x=1/2, x²=1/4 < 1/2.']
    },
    {
      difficulty: 'medium',
      prompt: 'What is the contrapositive of <code class="inline">if n² is odd, then n is odd</code>?',
      mountInput: function (c) {
        var opts = ['If n is odd, then n² is odd.', 'If n is not odd, then n² is not odd.', 'If n² is not odd, then n is not odd.', 'If n is even, then n² is odd.'];
        var s = document.createElement('select');
        s.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(s); return function () { return parseInt(s.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'For p → q, the contrapositive is ¬q → ¬p. Here p is “n² is odd” and q is “n is odd.”' };
        return { correct: false, feedback: 'Reverse the direction and negate both parts: “if n is not odd, then n² is not odd.”' };
      },
      hints: ['Contrapositive of p → q is ¬q → ¬p.', 'q is “n is odd,” so ¬q comes first.', 'If n is not odd, then n² is not odd.']
    },
    {
      difficulty: 'hard',
      prompt: 'Premises: <code class="inline">p → q</code> and <code class="inline">¬q</code>. Which conclusion follows validly?',
      mountInput: function (c) {
        var opts = ['p', '¬p', 'q', 'p ↔ q'];
        var s = document.createElement('select');
        s.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(s); return function () { return parseInt(s.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Modus tollens: p → q, ¬q, therefore ¬p. If p were true, q would have to be true, contradicting ¬q.' };
        return { correct: false, feedback: 'The valid pattern is modus tollens: p → q and ¬q force ¬p.' };
      },
      hints: ['Assume p for a moment. What would p → q force?', 'It would force q, but a premise says ¬q.', 'Therefore p cannot be true: conclude ¬p.']
    }
  ]
});
