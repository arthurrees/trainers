// Level 8 — Counting & Combinatorics
DMT.registerLevel({
  id: 8,
  title: 'Counting & Combinatorics',
  whyItMatters: 'How many possible passwords? How many distinct license plates? How many ways can a sort algorithm split a list? Counting answers all of these — and combinatorics is the toolkit. CS uses it constantly: hash table sizing, complexity analysis, probability, cryptography.',
  glossary: ['n!', 'P(n,k)', 'C(n,k)', '(n choose k)'],
  learn: ''
    + '<h4>Two basic rules</h4>'
    + '<ul>'
    +   '<li><strong>Addition rule</strong>: if there are A ways to do thing 1 OR B ways to do thing 2 (and they don\'t overlap), the total is <code class="inline">A + B</code>.</li>'
    +   '<li><strong>Multiplication rule</strong>: if there are A ways to do thing 1 AND for each, B ways to do thing 2, the total is <code class="inline">A × B</code>.</li>'
    + '</ul>'
    + '<div class="example"><div class="label">Example</div>'
    + 'How many 4-digit PINs are there? Each of the 4 positions has 10 choices (0–9), independently. Multiplication rule: <code class="inline">10 × 10 × 10 × 10 = 10⁴ = 10,000</code>.'
    + '</div>'

    + '<h4>Factorial</h4>'
    + '<p><code class="inline">n!</code> = n × (n-1) × ... × 2 × 1. By convention, <code class="inline">0! = 1</code>. It counts the number of ways to arrange n distinct items in order.</p>'
    + '<div class="example"><div class="label">Why arrangements use n!</div>'
    + 'Arranging 3 books on a shelf: 3 choices for the leftmost, then 2 for the middle, then 1 for the right. <code class="inline">3 × 2 × 1 = 6</code> arrangements.'
    + '</div>'

    + '<h4>Permutations vs combinations</h4>'
    + '<p>The big question: <strong>does order matter?</strong></p>'

    + '<table class="truth-table"><thead><tr><th></th><th>Order matters</th><th>Order doesn\'t</th></tr></thead><tbody>'
    + '<tr><td><strong>Pick k from n</strong></td><td>P(n,k) = n!/(n−k)!</td><td>C(n,k) = n!/(k!(n−k)!)</td></tr>'
    + '<tr><td><em>Name</em></td><td>permutation</td><td>combination</td></tr>'
    + '<tr><td><em>Mental check</em></td><td>"a different ordering counts as different"</td><td>"same elements = same group"</td></tr>'
    + '</tbody></table>'

    + '<div class="example"><div class="label">Worked examples (n=5, k=3)</div>'
    + 'P(5,3) = 5·4·3 = 60. (Arranging 3 of 5 trophies in 1st-2nd-3rd order.)<br>'
    + 'C(5,3) = 60 / 3! = 10. (Picking 3 of 5 trophies for a committee — order doesn\'t matter.)'
    + '</div>'

    + '<div class="callout"><div class="label">Decision tree</div>'
    + 'When asked "how many ways…" — ask:<br>'
    + '1. Does order matter?<br>'
    + '2. Can items repeat?<br>'
    + 'Answer drives the formula:'
    + '<ul>'
    +   '<li>Order matters, repetition allowed: <code class="inline">n^k</code> (e.g., PINs).</li>'
    +   '<li>Order matters, no repetition: <code class="inline">P(n,k) = n!/(n−k)!</code>.</li>'
    +   '<li>Order doesn\'t matter, no repetition: <code class="inline">C(n,k) = n!/(k!(n−k)!)</code>.</li>'
    +   '<li>Order doesn\'t matter, repetition allowed: <code class="inline">C(n+k−1, k)</code> (less common).</li>'
    + '</ul>'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Adjust n, k, and the toggles. The formula and count update live.</p>'
      + '<div class="controls-row">'
      +   '<label>n: <input type="number" id="n-in" value="5" min="0" max="15"></label>'
      +   '<label>k: <input type="number" id="k-in" value="3" min="0" max="15"></label>'
      +   '<label><input type="checkbox" id="ord"> Order matters</label>'
      +   '<label><input type="checkbox" id="rep"> Repetition allowed</label>'
      + '</div>'
      + '<div id="count-out" class="formula-box"></div>'
      + '<div id="count-explain" style="margin-top:10px"></div>';
    var nIn = container.querySelector('#n-in');
    var kIn = container.querySelector('#k-in');
    var ord = container.querySelector('#ord');
    var rep = container.querySelector('#rep');
    var out = container.querySelector('#count-out');
    var explain = container.querySelector('#count-explain');

    function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
    function perm(n, k) { return fact(n) / fact(n - k); }
    function comb(n, k) { return fact(n) / (fact(k) * fact(n - k)); }

    function update() {
      var n = parseInt(nIn.value, 10);
      var k = parseInt(kIn.value, 10);
      if (isNaN(n) || isNaN(k) || n < 0 || k < 0) {
        out.innerHTML = '<span style="color:var(--bad)">enter non-negative integers</span>';
        explain.innerHTML = '';
        return;
      }
      if (k > n && !rep.checked) {
        out.innerHTML = '<span class="muted">can\'t pick ' + k + ' from ' + n + ' without repetition.</span>';
        explain.innerHTML = '';
        return;
      }
      var formula, value, name, helper;
      if (ord.checked && rep.checked) {
        formula = 'n<sup>k</sup> = ' + n + '<sup>' + k + '</sup>';
        value = Math.pow(n, k);
        name = 'sequences of length k from n items, with repetition';
        helper = 'Each of k positions has n choices, independently.';
      } else if (ord.checked && !rep.checked) {
        formula = 'P(n,k) = n! / (n−k)! = ' + n + '! / ' + (n - k) + '!';
        value = perm(n, k);
        name = 'permutations';
        helper = 'k slots; ' + n + ' choices for the first, ' + (n - 1) + ' for the second, ...';
      } else if (!ord.checked && !rep.checked) {
        formula = 'C(n,k) = n! / (k! (n−k)!) = ' + n + '! / (' + k + '! · ' + (n - k) + '!)';
        value = comb(n, k);
        name = 'combinations ("n choose k")';
        helper = 'Pick a group of k from n; different orderings of the same group count as one.';
      } else {
        formula = 'C(n+k−1, k) = C(' + (n + k - 1) + ',' + k + ')';
        value = comb(n + k - 1, k);
        name = 'multisets — pick k with repetition, order doesn\'t matter';
        helper = 'Stars-and-bars trick.';
      }
      out.innerHTML = '<div style="font-size:13px;color:var(--text-dim);margin-bottom:6px">' + name + '</div><div>' + formula + ' = <span class="result">' + value.toLocaleString() + '</span></div>';
      explain.innerHTML = '<span class="muted">' + helper + '</span>';
    }
    nIn.addEventListener('input', update);
    kIn.addEventListener('input', update);
    ord.addEventListener('change', update);
    rep.addEventListener('change', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A 4-digit PIN allows digits 0–9 in any position, including repeats. How many distinct PINs are possible?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'just the count';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 10000) return { correct: true, feedback: '10⁴ = 10,000. Multiplication rule: 10 choices per digit, 4 digits, independent.' };
        return { correct: false, feedback: '10 choices for each of 4 positions: 10 × 10 × 10 × 10 = 10⁴ = 10,000.' };
      },
      hints: [
        'Each of the 4 positions has 10 possible digits, and they can repeat.',
        'Multiplication rule: 10 × 10 × 10 × 10.',
        'That\'s 10,000.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'How many ways are there to arrange 5 different books on a shelf in a row?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'just the count';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 120) return { correct: true, feedback: '5! = 5 × 4 × 3 × 2 × 1 = 120. Order matters, no repetition — full permutation.' };
        return { correct: false, feedback: 'You\'re arranging all 5 books. 5 choices for first slot, 4 for next, ... 5! = 120.' };
      },
      hints: [
        'Order matters here (a different shelf arrangement is a different outcome).',
        '5 choices for the leftmost slot, then 4, then 3, then 2, then 1.',
        '5! = 120.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'From 10 students, choose a president and vice president, then choose a 3-person committee from the remaining 8 students. How many outcomes are possible?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'just the count';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 5040) return { correct: true, feedback: 'Choose the ordered officers in P(10,2)=10·9=90 ways. Then choose 3 of the remaining 8 in C(8,3)=56 ways. Multiply: 90·56=5,040.' };
        if (v === 120) return { correct: false, feedback: 'That counts only a 3-person committee from 10. The two distinct officer roles must be chosen first.' };
        if (v === 30240) return { correct: false, feedback: 'That treats the committee positions as ordered. The committee has no roles, so use C(8,3), not P(8,3).' };
        return { correct: false, feedback: 'Officers: P(10,2)=90. Committee from the remaining 8: C(8,3)=56. Multiply to get 5,040.' };
      },
      hints: [
        'Split the task: choose two ordered officer roles, then an unordered committee.',
        'Officers: P(10,2)=90. After that, 8 students remain; committee: C(8,3)=56.',
        'Multiply the stages: 90 × 56 = 5,040.'
      ]
    }
  ]
});
