// Level 4 — Quantifiers
RXT.registerLevel({
  id: 4,
  title: 'Quantifiers',
  whyItMatters: 'Quantifiers turn "match one thing" into "match a phone number, a word, or a number of any length"; they are where regex stops being literal search and starts describing variable-length patterns.',
  glossary: ['*', '+', '?', '{n,m}'],
  learn: ''
    + '<h4>Repeating the previous item</h4>'
    + '<p>So far every token you have written matches a fixed amount of text. <code class="inline">\\d</code> matches exactly one digit, <code class="inline">[a-z]</code> matches exactly one lowercase letter. A <strong>quantifier</strong> is a symbol you place <em>after</em> a token to say "repeat that token". This is what lets a single pattern match a 1-digit number, a 9-digit number, or a word of any length.</p>'
    + '<p>If you think in code, a quantifier is the regex version of a loop. The token is the loop body, and the quantifier is the loop bound: zero or more, one or more, exactly three, between two and five.</p>'

    + '<h4>The three symbol quantifiers</h4>'
    + '<p>There are three single-character quantifiers, and you will type them constantly.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">*</span>0 or more</div>'
    +   '<div class="symbol-chip"><span class="sym">+</span>1 or more</div>'
    +   '<div class="symbol-chip"><span class="sym">?</span>0 or 1 (optional)</div>'
    + '</div>'
    + '<p><code class="inline">*</code> (asterisk) means "match the previous item <strong>zero or more</strong> times". <code class="inline">+</code> (plus) means "<strong>one or more</strong>". <code class="inline">?</code> (question mark) means "<strong>zero or one</strong>", which reads as "this item is optional".</p>'
    + '<div class="example"><div class="label">+ in action</div>'
    + 'The pattern <code class="inline">\\d+</code> means "one or more digits". In <code class="inline">user 42 failed 3 times</code> it matches <code class="inline">42</code> and <code class="inline">3</code>. Without the <code class="inline">+</code>, plain <code class="inline">\\d</code> would match each digit separately, so <code class="inline">42</code> would be two matches instead of one.'
    + '</div>'
    + '<div class="example"><div class="label">? makes a letter optional</div>'
    + 'The pattern <code class="inline">colou?r</code> matches both the American <code class="inline">color</code> and the British <code class="inline">colour</code>. The <code class="inline">?</code> applies only to the <code class="inline">u</code> right before it, so the <code class="inline">u</code> may appear once or not at all. The rest of the letters are still required.'
    + '</div>'

    + '<h4>It applies to ONE item, not the whole pattern</h4>'
    + '<p>This is the rule beginners trip over most. A quantifier attaches to the <strong>single item immediately before it</strong>. That item can be one character, one character class, or (you will see later) one group.</p>'
    + '<p>In <code class="inline">colou?r</code> the <code class="inline">?</code> attaches to <code class="inline">u</code> only, not to the word. In <code class="inline">[a-z]+</code> the <code class="inline">+</code> attaches to the whole class <code class="inline">[a-z]</code>, so it matches a run of one or more lowercase letters. In <code class="inline">ab+</code> the <code class="inline">+</code> attaches only to <code class="inline">b</code>, so it matches <code class="inline">ab</code>, <code class="inline">abb</code>, <code class="inline">abbb</code>, but always needs exactly one leading <code class="inline">a</code>.</p>'

    + '<h4>The counted quantifier: {n,m}</h4>'
    + '<p>When you need an exact count or a range, use braces.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">{3}</span>exactly 3</div>'
    +   '<div class="symbol-chip"><span class="sym">{2,}</span>2 or more</div>'
    +   '<div class="symbol-chip"><span class="sym">{2,5}</span>2 to 5</div>'
    + '</div>'
    + '<p><code class="inline">{n}</code> means exactly <code class="inline">n</code> times. <code class="inline">{n,}</code> (note the trailing comma, with nothing after it) means <code class="inline">n</code> or more, with no upper limit. <code class="inline">{n,m}</code> means at least <code class="inline">n</code> and at most <code class="inline">m</code>. Do not put a space after the comma, regex braces are strict.</p>'
    + '<div class="example"><div class="label">Counting digits</div>'
    + '<code class="inline">\\d{3}</code> matches exactly three digits, like an area code. <code class="inline">\\d{2,4}</code> matches a run of two, three, or four digits. On <code class="inline">codes: 7, 42, 2026, 100000</code> the pattern <code class="inline">\\d{2,4}</code> matches <code class="inline">42</code>, <code class="inline">2026</code>, and the first four digits of <code class="inline">100000</code> (it grabs as many as it can, up to the cap of four).'
    + '</div>'
    + '<div class="callout"><div class="label">The shortcuts you already used</div>'
    + 'The three symbol quantifiers are just shorthand for common brace counts. <code class="inline">*</code> is <code class="inline">{0,}</code>, <code class="inline">+</code> is <code class="inline">{1,}</code>, and <code class="inline">?</code> is <code class="inline">{0,1}</code>. Use whichever reads more clearly.'
    + '</div>'

    + '<h4>The zero trap</h4>'
    + '<p>Because <code class="inline">*</code> and <code class="inline">?</code> allow zero repetitions, a pattern like <code class="inline">a*</code> can match the <strong>empty string</strong>. It is happy to match nothing at all. That is a common surprise: a regex that you expect to require text will silently succeed on an empty input. If you mean "at least one", reach for <code class="inline">+</code>, not <code class="inline">*</code>.</p>'
    + '<div class="callout"><div class="label">Pick the right one</div>'
    + 'Ask yourself how few repetitions are acceptable. If zero is fine (an optional prefix, trailing spaces that may or may not be there) use <code class="inline">*</code> or <code class="inline">?</code>. If you need at least one, use <code class="inline">+</code>. If you need an exact count or a bounded range, use <code class="inline">{n,m}</code>.'
    + '</div>'
    + '<p>Play with the tester below. The seeded pattern is <code class="inline">\\d{2,4}</code>. Try changing it to <code class="inline">\\d+</code>, then <code class="inline">\\d{3}</code>, and watch which numbers light up. Then type some words and try <code class="inline">colou?r</code>.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Edit the pattern and the sample. Try <code class="inline">\\d+</code>, <code class="inline">\\d{3}</code>, <code class="inline">\\d{2,4}</code>, then swap in some words and try <code class="inline">colou?r</code>.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '\\d{2,4}',
      flags: 'g',
      text: 'codes: 7, 42, 2026, 100000 and 5.\n'
          + 'spellings: color and colour.\n'
          + 'words: a, to, the, regex, internationalization.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Write a pattern that matches BOTH <code class="inline">color</code> and <code class="inline">colour</code> (the <code class="inline">u</code> is optional), but does NOT match <code class="inline">colr</code> or <code class="inline">colouur</code>.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match color and colour',
          flagToggles: [],
          previewList: [
            { label: 'color', text: 'color' },
            { label: 'colour', text: 'colour' },
            { label: 'colr', text: 'colr' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var color = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'color');
          var colour = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'colour');
          var colr = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'colr');
          var colouur = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'colouur');
          if (color && colour && !colr && !colouur) {
            return { correct: true, feedback: 'Right. The <code class="inline">?</code> makes the single <code class="inline">u</code> optional, so both spellings match while <code class="inline">colr</code> (no u) and <code class="inline">colouur</code> (two u) are rejected.' };
          }
          if (!color || !colour) return { correct: false, feedback: 'Your pattern misses one of the two valid spellings. Make the <code class="inline">u</code> optional with <code class="inline">?</code> while keeping the rest of the letters required.' };
          if (colr) return { correct: false, feedback: 'You matched <code class="inline">colr</code>, which has no <code class="inline">u</code> at all but is missing nothing else. Did you accidentally make the wrong letter optional? Only the <code class="inline">u</code> should be optional.' };
          if (colouur) return { correct: false, feedback: 'You matched <code class="inline">colouur</code> (two u). <code class="inline">?</code> means zero or one, so the <code class="inline">u</code> can appear at most once. Did you use <code class="inline">*</code> or <code class="inline">+</code> instead?' };
          return { correct: false, feedback: 'Not quite. Use <code class="inline">colou?r</code>: the <code class="inline">?</code> applies only to the <code class="inline">u</code> right before it.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You need a quantifier that means "zero or one of the previous item".',
        'That quantifier is ? (question mark), and it attaches to the single character right before it. Put it after the letter that may or may not be there.',
        'The answer is: colou?r'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Write a pattern that matches EXACTLY a 4-digit year (the whole input must be four digits). It should match <code class="inline">2026</code> but reject <code class="inline">26</code>, <code class="inline">20260</code>, and <code class="inline">abcd</code>.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'exactly four digits',
          flagToggles: [],
          previewList: [
            { label: '2026', text: '2026' },
            { label: '26', text: '26' },
            { label: '20260', text: '20260' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var y2026 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '2026');
          var y26 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '26');
          var y20260 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '20260');
          var abcd = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'abcd');
          if (y2026 && !y26 && !y20260 && !abcd) {
            return { correct: true, feedback: 'Exactly. <code class="inline">\\d{4}</code> means exactly four digits, no more and no fewer, and since matchesWhole anchors the whole input, <code class="inline">20260</code> (five digits) is rejected too.' };
          }
          if (!y2026) return { correct: false, feedback: 'Your pattern does not even match <code class="inline">2026</code>. You want exactly four digit characters. Try a digit token with a counted quantifier.' };
          if (y26) return { correct: false, feedback: 'You accepted <code class="inline">26</code> (only two digits). You need to require exactly four, so use the counted quantifier <code class="inline">{4}</code>, not <code class="inline">+</code> or <code class="inline">{2,4}</code>.' };
          if (y20260) return { correct: false, feedback: 'You accepted <code class="inline">20260</code> (five digits). Use exactly <code class="inline">{4}</code> so longer runs are rejected.' };
          if (abcd) return { correct: false, feedback: 'You matched <code class="inline">abcd</code>, which is letters, not digits. Use a digit token like <code class="inline">\\d</code> (or <code class="inline">[0-9]</code>) repeated four times.' };
          return { correct: false, feedback: 'Not quite. The answer is <code class="inline">\\d{4}</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You want a digit token repeated an exact number of times.',
        'The counted quantifier {n} means exactly n. Combine a digit shorthand with {4}.',
        'The answer is: \\d{4}  (the equivalent [0-9]{4} also works)'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Write a pattern that matches a percentage: 1 to 3 digits immediately followed by a <code class="inline">%</code> sign. It should match <code class="inline">5%</code> and <code class="inline">100%</code>, but reject <code class="inline">1000%</code> (too many digits), a bare <code class="inline">%</code> (no digits), and <code class="inline">50</code> (no percent sign).',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: '1 to 3 digits then %',
          flagToggles: [],
          previewList: [
            { label: '5%', text: '5%' },
            { label: '100%', text: '100%' },
            { label: '1000%', text: '1000%' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var p5 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '5%');
          var p100 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '100%');
          var p1000 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '1000%');
          var pBare = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '%');
          var p50 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '50');
          var pAbc = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'ab%');
          if (p5 && p100 && !p1000 && !pBare && !p50 && !pAbc) {
            return { correct: true, feedback: 'Exactly. <code class="inline">\\d{1,3}%</code> requires between one and three digits, then a literal <code class="inline">%</code>. The range cap of three rejects <code class="inline">1000%</code>, and the required <code class="inline">%</code> rejects a bare <code class="inline">50</code>.' };
          }
          if (!p5 || !p100) return { correct: false, feedback: 'Your pattern misses a valid case. You need 1 to 3 digits followed by a percent sign. Try a digit token with the range quantifier <code class="inline">{1,3}</code> then <code class="inline">%</code>.' };
          if (pAbc) return { correct: false, feedback: 'You accepted <code class="inline">ab%</code> (letters, not digits). The token before <code class="inline">%</code> must be DIGITS specifically. Use <code class="inline">\\d</code> (or <code class="inline">[0-9]</code>), not <code class="inline">.</code> or <code class="inline">\\w</code>.' };
          if (p1000) return { correct: false, feedback: 'You accepted <code class="inline">1000%</code> (four digits). Cap the digit count at three with the range <code class="inline">{1,3}</code>, not <code class="inline">+</code>.' };
          if (pBare) return { correct: false, feedback: 'You accepted a bare <code class="inline">%</code> with no digits. Require at least one digit. The lower bound should be 1, so <code class="inline">{1,3}</code>, not <code class="inline">{0,3}</code> or <code class="inline">*</code>.' };
          if (p50) return { correct: false, feedback: 'You accepted <code class="inline">50</code> with no percent sign. The <code class="inline">%</code> is required, so add it after the digits.' };
          return { correct: false, feedback: 'Not quite. The answer is <code class="inline">\\d{1,3}%</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You need a digit token repeated between 1 and 3 times, then a literal percent sign.',
        'The range quantifier {1,3} means at least one and at most three. Follow it with a % character.',
        'The answer is: \\d{1,3}%  (the equivalent [0-9]{1,3}% also works)'
      ]
    }
  ]
});
