// Level 9 — Backreferences
RXT.registerLevel({
  id: 9,
  title: 'Backreferences',
  whyItMatters: 'Backreferences match the same text again, which is how you catch doubled words, pair up matching quotes, and spot duplicate typos in one pass; they also push regex past the limits of "regular" languages.',
  glossary: ['( )', '(?<name>)', '\\1', '\\k<name>', '\\b'],
  learn: ''
    + '<h4>Matching the same text twice</h4>'
    + '<p>So far a capture group has been a way to <em>remember</em> what matched so you can pull it out later. A <strong>backreference</strong> lets you reuse that remembered text inside the SAME pattern. The token <code class="inline">\\1</code> means "match the exact text that capture group 1 just matched".</p>'
    + '<p>Read that carefully, because it is the one thing beginners get wrong. <code class="inline">\\1</code> does NOT mean "match the same pattern again". It means "match the same <em>characters</em> again". If group 1 captured the letter <code class="inline">o</code>, then <code class="inline">\\1</code> matches a literal <code class="inline">o</code> at that point, nothing else.</p>'
    + '<div class="callout"><div class="label">Programming analogy</div>'
    + 'Think of a capture group as assigning to a variable: <code class="inline">var g1 = "..."</code>. A plain group with a quantifier like <code class="inline">(\\w)+</code> is like running the matcher again. A backreference <code class="inline">\\1</code> is like writing <code class="inline">=== g1</code>: it checks the next characters equal the string you already stored.'
    + '</div>'

    + '<h4>Finding a doubled character</h4>'
    + '<p>The classic example is a letter repeated back to back, like the <code class="inline">oo</code> in <code class="inline">book</code> or the <code class="inline">ss</code> in <code class="inline">kiss</code>.</p>'
    + '<div class="example"><div class="label">Walk through (\\w)\\1</div>'
    + '<p><code class="inline">(\\w)</code> matches one word character and captures it into group 1. Then <code class="inline">\\1</code> demands the very next character be the SAME one. On the word <code class="inline">book</code>:</p>'
    + '<ul>'
    +   '<li>At <code class="inline">b</code>: group 1 grabs <code class="inline">b</code>, then <code class="inline">\\1</code> needs another <code class="inline">b</code>. Next char is <code class="inline">o</code>. No match here.</li>'
    +   '<li>At the first <code class="inline">o</code>: group 1 grabs <code class="inline">o</code>, then <code class="inline">\\1</code> needs another <code class="inline">o</code>. Next char IS <code class="inline">o</code>. Match: <code class="inline">oo</code>.</li>'
    + '</ul>'
    + '<p>Without a backreference you would have to write <code class="inline">aa|bb|cc|dd|...</code> for every letter. The backreference says "whatever it was, again" in three characters.</p>'
    + '</div>'

    + '<h4>Finding a doubled word</h4>'
    + '<p>The same idea scales up from one character to a whole word. A common editing mistake is typing the the same word twice (you just read one). This pattern finds it:</p>'
    + '<div class="example"><div class="label">\\b(\\w+) \\1\\b</div>'
    + '<p><code class="inline">\\b</code> is a word boundary (the zero-width spot between a word char and a non-word char) so we start at the beginning of a word. <code class="inline">(\\w+)</code> captures the whole word into group 1. A space follows. Then <code class="inline">\\1</code> requires the exact same word again, and a closing <code class="inline">\\b</code> makes sure it is a whole word and not a prefix.</p>'
    + '<p>On <code class="inline">paris in the the spring</code> it matches <code class="inline">the the</code>. On <code class="inline">the theater opened</code> it does NOT match, because <code class="inline">the</code> followed by <code class="inline">theater</code> are different strings, and the closing <code class="inline">\\b</code> blocks the partial overlap.</p>'
    + '</div>'
    + '<div class="callout"><div class="label">Why the trailing \\b matters</div>'
    + 'Without the final boundary, <code class="inline">(\\w+) \\1</code> could match <code class="inline">the the</code> inside <code class="inline">the theater</code> if the spacing lined up, capturing a partial word. Anchoring both ends with <code class="inline">\\b</code> keeps the repeat to a full word. People often write <code class="inline">\\s+</code> instead of a single space to allow tabs or multiple spaces between the words.'
    + '</div>'

    + '<h4>Named backreferences</h4>'
    + '<p>If you captured into a named group with <code class="inline">(?&lt;name&gt;...)</code>, you reference it with <code class="inline">\\k&lt;name&gt;</code> instead of a number. It reads better once you have several groups.</p>'
    + '<div class="example"><div class="label">Numbered vs named, same meaning</div>'
    + '<code class="inline">(\\w)\\1</code> and <code class="inline">(?&lt;c&gt;\\w)\\k&lt;c&gt;</code> both match a doubled word character. Numbers are terse; names survive you later inserting another group in front (which would renumber everything).'
    + '</div>'

    + '<h4>Pairing up matching quotes</h4>'
    + '<p>Here is the trick that makes backreferences click. To match a quoted string where the closing quote MUST be the same kind as the opening quote, capture the opening quote and reuse it:</p>'
    + '<div class="example"><div class="label">(["\'])' + '.*?\\1</div>'
    + '<p><code class="inline">["\']</code> is a character class matching ONE quote character, either a double quote or a single quote, and the group captures whichever one it found. <code class="inline">.*?</code> lazily matches the contents (as little as possible). Then <code class="inline">\\1</code> requires the closing quote to equal the opening one.</p>'
    + '<ul>'
    +   '<li>On <code class="inline">"yes"</code>: group 1 is <code class="inline">"</code>, contents <code class="inline">yes</code>, then <code class="inline">\\1</code> matches the closing <code class="inline">"</code>. Match.</li>'
    +   '<li>On <code class="inline">\'fine\'</code>: group 1 is <code class="inline">\'</code>, so <code class="inline">\\1</code> now requires a closing <code class="inline">\'</code>. Match.</li>'
    +   '<li>On <code class="inline">"oops\'</code>: group 1 is <code class="inline">"</code>, so <code class="inline">\\1</code> requires a closing <code class="inline">"</code>. The lone <code class="inline">\'</code> does not satisfy it, so there is no match at that spot.</li>'
    + '</ul>'
    + '<p>A plain class like <code class="inline">["\'].*?["\']</code> would happily accept a mismatched pair, because the closing class does not care which quote opened. The backreference is what enforces "the same one".</p>'
    + '</div>'

    + '<div class="callout"><div class="label">Beyond regular languages</div>'
    + 'A pattern like "some text, then the SAME text again" is something a classic finite-state machine cannot do; it has no memory of what it saw. Backreferences give the engine that memory, which is why a regex flavor with backreferences is technically more powerful than a "regular" language. The cost: backreferences force the engine to remember and re-check captured text, so they can be slower than plain matching (more on performance in Level 13).'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">The pattern <code class="inline">(\\w)\\1</code> finds a word character immediately repeated. Watch the doubled letters light up. Try <code class="inline">\\b(\\w+) \\1\\b</code> on a sentence with a repeated word, or <code class="inline">(["\']).*?\\1</code> on some quoted text.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '(\\w)\\1',
      flags: 'g',
      text: 'book balloon kiss letter mississippi.\n'
          + 'paris in the the spring; the theater opened.\n'
          + 'he said "yes" and it\'s \'fine\' with me.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Match a <strong>doubled character</strong>: any single character that appears twice in a row (like the <code class="inline">oo</code> in <code class="inline">book</code>). Capture the character, then backreference it.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: (.)\\1',
          previewList: [
            { label: 'book', text: 'book' },
            { label: 'aa', text: 'aa' },
            { label: 'cat', text: 'cat' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var book = RXT.lib.rx.test(v.pattern, v.flags, 'book');
          var aa = RXT.lib.rx.test(v.pattern, v.flags, 'aa');
          var cat = RXT.lib.rx.test(v.pattern, v.flags, 'cat');
          if (book && aa && !cat) {
            return { correct: true, feedback: 'Right. <code class="inline">(.)\\1</code> captures one character, then <code class="inline">\\1</code> demands the same character again. <code class="inline">book</code> and <code class="inline">aa</code> have a repeat; <code class="inline">cat</code> has no two identical neighbors.' };
          }
          if (book && aa && cat) {
            return { correct: false, feedback: 'You matched <code class="inline">cat</code> too, which has no doubled character. A bare <code class="inline">.</code> or <code class="inline">.+</code> matches anything. You need to capture a character and then require the SAME one with <code class="inline">\\1</code>.' };
          }
          if (!book || !aa) {
            return { correct: false, feedback: 'That does not match a doubled character. Capture one character in a group, then backreference it: <code class="inline">(.)\\1</code>.' };
          }
          return { correct: false, feedback: 'Not quite. Match a character repeated immediately, and only that.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A backreference \\1 matches the exact text capture group 1 already matched, not the pattern again.',
        'Capture one character in a group, then require the same character right after it. The group can be (.) or (\\w).',
        'The answer is: (.)\\1'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Find a <strong>doubled word</strong>: the same word repeated, separated by a space (like <code class="inline">the the</code>). Capture the word, then backreference it.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: \\b(\\w+) \\1\\b',
          previewList: [
            { label: 'repeated', text: 'paris in the the spring' },
            { label: 'no repeat', text: 'the cat sat' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var dbl = RXT.lib.rx.test(v.pattern, v.flags, 'paris in the the spring');
          var single = RXT.lib.rx.test(v.pattern, v.flags, 'the cat sat');
          if (dbl && !single) {
            return { correct: true, feedback: 'Right. <code class="inline">(\\w+)</code> captures a word, a space follows, then <code class="inline">\\1</code> requires that exact word again. The repeated <code class="inline">the the</code> matches; a sentence with no repeat does not.' };
          }
          if (dbl && single) {
            return { correct: false, feedback: 'You also matched <code class="inline">the cat sat</code>, which has no repeated word. Your pattern is too loose. You need <code class="inline">\\1</code> to require the SAME captured word again, separated by a space.' };
          }
          if (!dbl) {
            return { correct: false, feedback: 'That did not catch the doubled word in <code class="inline">the the</code>. Capture the word with <code class="inline">(\\w+)</code>, then a space, then backreference it with <code class="inline">\\1</code>.' };
          }
          return { correct: false, feedback: 'Not quite. Match a word, a space, then the same word again.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Capture a whole word with (\\w+), match the space between, then backreference the word with \\1.',
        'Word boundaries \\b on the ends keep it to whole words. Use a literal space or \\s+ between the two words.',
        'The answer is: \\b(\\w+) \\1\\b   (or \\b(\\w+)\\s+\\1\\b)'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Match a <strong>quoted string with matching quotes</strong>: the opening and closing quote must be the SAME character (both <code class="inline">"</code> or both <code class="inline">\'</code>). A mismatched pair must NOT match. Capture the opening quote and reuse it.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: (["\\\'])' + '.*?\\1',
          previewList: [
            { label: 'double', text: 'he said "yes" loud' },
            { label: 'single', text: "it's 'fine' ok" },
            { label: 'mismatch', text: 'mismatch "here\' end' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var dq = RXT.lib.rx.test(v.pattern, v.flags, 'he said "yes" loud');
          var sq = RXT.lib.rx.test(v.pattern, v.flags, "it's 'fine' ok");
          var mismatch = RXT.lib.rx.test(v.pattern, v.flags, 'mismatch "here\' end');
          var noQuotes = RXT.lib.rx.test(v.pattern, v.flags, 'no quotes here');
          if (dq && sq && !mismatch && !noQuotes) {
            return { correct: true, feedback: 'Right. <code class="inline">(["\\\'])</code> captures whichever quote opened, <code class="inline">.*?</code> lazily takes the contents, and <code class="inline">\\1</code> forces the closing quote to equal the opening one. A lone <code class="inline">"</code> with a lone <code class="inline">\\\'</code> never forms a matching pair.' };
          }
          if (mismatch) {
            return { correct: false, feedback: 'Your pattern matched the mismatched <code class="inline">"...\\\'</code> pair. That means your closing quote is its own class instead of a backreference. Capture the opening quote and require the SAME one to close with <code class="inline">\\1</code>.' };
          }
          if (noQuotes) {
            return { correct: false, feedback: 'Your pattern matched text with no quotes at all. The quote characters need to be literal parts of the match. Start with a captured quote: <code class="inline">(["\\\'])</code>.' };
          }
          if (!dq || !sq) {
            return { correct: false, feedback: 'That did not match a properly quoted string. Capture an opening quote, match the contents lazily, then backreference the quote to close: <code class="inline">(["\\\'])' + '.*?\\1</code>.' };
          }
          return { correct: false, feedback: 'Not quite. The closing quote must equal the opening quote, enforced with a backreference.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A character class ["\\\'] matches one quote. Put it in a group so you can refer back to which one it was.',
        'Capture the opening quote, match the inside with .*? (lazy), then require the same quote to close using \\1.',
        'The answer is: (["\\\'])' + '.*?\\1'
      ]
    }
  ]
});
