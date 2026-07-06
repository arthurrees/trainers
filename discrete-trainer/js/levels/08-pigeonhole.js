// Level 8 — Pigeonhole & Basic Probability
DMT.registerLevel({
  id: 8,
  title: 'Pigeonhole & Probability',
  whyItMatters: 'Pigeonhole proves "something must collide" — hash collisions, scheduling conflicts, network congestion. Basic probability is the foundation for randomized algorithms, ML, and any "what are the odds" reasoning.',
  glossary: [],
  learn: ''
    + '<h4>The pigeonhole principle</h4>'
    + '<p><strong>If you put n+1 pigeons into n holes, at least one hole has at least 2 pigeons.</strong> Obvious — but surprisingly powerful when n is large.</p>'

    + '<div class="example"><div class="label">Example</div>'
    + 'In any group of 13 people, at least 2 share a birth month. (12 months = holes, 13 people = pigeons.)'
    + '</div>'

    + '<h4>Generalized pigeonhole</h4>'
    + '<p>If you put N pigeons into k holes, some hole has at least <code class="inline">⌈N/k⌉</code> pigeons. (The ceiling: round up.)</p>'
    + '<div class="example"><div class="label">Example</div>'
    + 'Among 100 people, at least ⌈100/12⌉ = 9 share a birth month.'
    + '</div>'

    + '<div class="callout"><div class="label">Where this shows up in CS</div>'
    + 'Hash tables: with more keys than buckets, collisions are guaranteed. Cache lines: more memory than cache → some cache line gets reused. Compression: you can\'t losslessly compress every input — by pigeonhole, two distinct inputs must map to the same output.'
    + '</div>'

    + '<h4>Basic probability</h4>'
    + '<p>If every outcome in a sample space Ω is equally likely, the probability of an event A is:</p>'
    + '<div class="formula-box" style="text-align:center;font-size:18px">P(A) = |A| / |Ω|</div>'
    + '<p>Probability is just <em>counting</em>: how many outcomes are favorable, divided by the total. Once you know the formula, the work is combinatorics.</p>'

    + '<div class="example"><div class="label">Example</div>'
    + 'Roll one fair die. P(rolling an even number) = |{2,4,6}| / |{1,2,3,4,5,6}| = 3/6 = 1/2.'
    + '</div>'

    + '<div class="example"><div class="label">Example: two dice, sum = 7</div>'
    + 'Total outcomes: 6 × 6 = 36 (ordered pairs). Pairs that sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) → 6 pairs. P(sum=7) = 6/36 = 1/6.'
    + '</div>'

    + '<h4>Two useful rules</h4>'
    + '<ul>'
    +   '<li><strong>Complement</strong>: P(not A) = 1 − P(A). Sometimes easier to count what you don\'t want.</li>'
    +   '<li><strong>Independence</strong>: if A and B are independent (one doesn\'t affect the other), P(A and B) = P(A) × P(B).</li>'
    + '</ul>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<div class="flex-row">'
      +   '<div style="flex:1;min-width:280px">'
      +     '<strong>Pigeonhole simulator</strong>'
      +     '<div class="controls-row">'
      +       '<label>Pigeons (N): <input type="number" id="php-n" value="13" min="0" max="100" style="width:80px"></label>'
      +       '<label>Holes (k): <input type="number" id="php-k" value="12" min="1" max="50" style="width:80px"></label>'
      +     '</div>'
      +     '<div id="php-out" class="formula-box"></div>'
      +     '<div id="php-vis" style="font-size:18px;line-height:1.6;margin-top:8px"></div>'
      +   '</div>'
      +   '<div style="flex:1;min-width:280px">'
      +     '<strong>Two-dice sample space</strong>'
      +     '<p class="muted" style="font-size:13px">Click any cell to toggle it as part of an event. P(event) = (cells highlighted) / 36.</p>'
      +     '<div id="dice-grid"></div>'
      +     '<div id="dice-prob" class="formula-box" style="margin-top:8px"></div>'
      +   '</div>'
      + '</div>';

    var phpN = container.querySelector('#php-n');
    var phpK = container.querySelector('#php-k');
    var phpOut = container.querySelector('#php-out');
    var phpVis = container.querySelector('#php-vis');

    function updatePhp() {
      var N = parseInt(phpN.value, 10), k = parseInt(phpK.value, 10);
      if (isNaN(N) || isNaN(k) || k < 1 || N < 0) { phpOut.innerHTML = '<span style="color:var(--bad)">enter valid numbers</span>'; phpVis.innerHTML = ''; return; }
      var min = Math.ceil(N / k);
      phpOut.innerHTML = N > 0
        ? '<div>Some hole must contain at least <span class="result">' + min + '</span> pigeon' + (min === 1 ? '' : 's') + '.</div>'
          + '<div class="muted" style="font-size:13px">⌈' + N + ' / ' + k + '⌉ = ' + min + '</div>'
        : '<div class="muted">no pigeons</div>';
      // visual: distribute pigeons as evenly as possible
      var counts = new Array(k).fill(0);
      for (var i = 0; i < N; i++) counts[i % k]++;
      var html = '';
      for (var h = 0; h < Math.min(k, 12); h++) {
        var pigs = '';
        for (var p = 0; p < counts[h]; p++) pigs += '🐦';
        html += '<div>Hole ' + (h + 1) + ': ' + (pigs || '<span class="muted">empty</span>') + ' &nbsp; <span class="muted">(' + counts[h] + ')</span></div>';
      }
      if (k > 12) html += '<div class="muted">... ' + (k - 12) + ' more holes ...</div>';
      phpVis.innerHTML = html;
    }
    phpN.addEventListener('input', updatePhp);
    phpK.addEventListener('input', updatePhp);
    updatePhp();

    // Dice grid
    var diceGrid = container.querySelector('#dice-grid');
    var diceProb = container.querySelector('#dice-prob');
    var picked = {};
    function renderDice() {
      var html = '<table style="border-collapse:collapse;font-family:var(--mono);font-size:12px"><tr><td></td>';
      for (var c = 1; c <= 6; c++) html += '<th style="padding:4px 8px;color:var(--accent)">' + c + '</th>';
      html += '</tr>';
      for (var r = 1; r <= 6; r++) {
        html += '<tr><th style="padding:4px 8px;color:var(--accent)">' + r + '</th>';
        for (var c2 = 1; c2 <= 6; c2++) {
          var key = r + ',' + c2;
          var on = picked[key];
          html += '<td data-k="' + key + '" style="border:1px solid var(--border);padding:6px 10px;cursor:pointer;text-align:center;background:' + (on ? 'var(--accent)' : 'transparent') + ';color:' + (on ? '#0b0d12' : 'var(--text-dim)') + '">' + (r + c2) + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      diceGrid.innerHTML = html;
      Array.prototype.forEach.call(diceGrid.querySelectorAll('td[data-k]'), function (td) {
        td.addEventListener('click', function () {
          var k = td.getAttribute('data-k');
          picked[k] = !picked[k];
          renderDice();
        });
      });
      var n = Object.values(picked).filter(Boolean).length;
      diceProb.innerHTML = 'P(highlighted) = ' + n + '/36 = <span class="result">' + (n / 36).toFixed(4) + '</span> &nbsp; (' + ((n / 36) * 100).toFixed(2) + '%)';
    }
    renderDice();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You have 25 socks of 3 different colors mixed in a drawer. By the pigeonhole principle, you can grab some number of socks and be guaranteed at least 2 of the same color. What\'s the smallest number you must grab?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 4) return { correct: true, feedback: '3 colors = 3 holes. Grab 4 socks → at least one color appears twice. (3 socks could be all different colors; the 4th forces a repeat.)' };
        return { correct: false, feedback: 'You could grab 3 socks of 3 different colors and have no pair. The 4th sock guarantees a match. Answer: 4.' };
      },
      hints: [
        '3 colors are the "holes". You want to be sure 2 socks land in the same hole.',
        'Imagine the worst case: 3 socks all different colors. What\'s the next sock?',
        'Grab 3+1 = 4. By pigeonhole, two must share a color.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Roll two fair six-sided dice. What is the probability the <strong>sum is 7</strong>? Enter as a fraction in lowest terms (like <code class="inline">1/6</code>).',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 1/6';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        var clean = v.replace(/\s+/g, '');
        if (clean === '1/6') return { correct: true, feedback: '6 favorable pairs out of 36 total. 6/36 = 1/6.' };
        if (clean === '6/36') return { correct: false, feedback: 'Right idea — that\'s the unreduced fraction. Reduce to lowest terms: 1/6.' };
        return { correct: false, feedback: 'Total outcomes = 6 × 6 = 36. Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6.' };
      },
      hints: [
        'Total outcomes for 2 dice: 6 × 6 = 36.',
        'Count pairs summing to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs.',
        '6/36 reduces to 1/6.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A drawer has 5 red socks and 7 blue socks. You pull 2 socks out without looking, one at a time, without replacement. What\'s the probability that BOTH are red? Enter as a fraction in lowest terms.',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 5/33';
        c.appendChild(input);
        return function () { return input.value; };
      },
      check: function (v) {
        var clean = v.replace(/\s+/g, '');
        if (clean === '5/33') return { correct: true, feedback: 'P(first red) = 5/12. Given that, P(second red) = 4/11. Multiply: 5/12 × 4/11 = 20/132 = 5/33.' };
        if (clean === '20/132' || clean === '10/66') return { correct: false, feedback: 'Right calculation, but reduce. 20/132 = 5/33.' };
        if (clean === '25/144') return { correct: false, feedback: 'You used "with replacement". The puzzle says without — the second draw has only 11 socks left and 4 reds.' };
        return { correct: false, feedback: 'P(first red) × P(second red | first red) = 5/12 × 4/11 = 20/132 = 5/33.' };
      },
      hints: [
        '12 socks total. P(first red) = 5/12.',
        'After pulling one red, there are 11 socks left, 4 of which are red. So P(second red | first red) = 4/11.',
        'Multiply: 5/12 × 4/11 = 20/132 = 5/33.'
      ]
    }
  ]
});
