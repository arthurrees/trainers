// Level 3 — Shorthand Classes
RXT.registerLevel({
  id: 3,
  title: 'Shorthand Classes',
  whyItMatters: 'The shorthands \\d \\w \\s are the abbreviations you will type thousands of times; knowing exactly what each one covers (and what it quietly leaves out) prevents a whole family of subtle bugs.',
  glossary: ['\\d', '\\D', '\\w', '\\W', '\\s', '\\S'],
  learn: ''
    + '<h4>The shorthands</h4>'
    + '<p>In the last level you wrote character classes by hand: <code class="inline">[0-9]</code> for a digit, <code class="inline">[A-Za-z0-9_]</code> for an identifier character. Those come up so often that regex gives them one-letter names called <strong>shorthand classes</strong>. Each one is a backslash followed by a letter, and each matches exactly ONE character, the same as a class in <code class="inline">[ ]</code>.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">\\d</span>a digit, same as [0-9]</div>'
    +   '<div class="symbol-chip"><span class="sym">\\w</span>a word char, [A-Za-z0-9_]</div>'
    +   '<div class="symbol-chip"><span class="sym">\\s</span>any whitespace</div>'
    + '</div>'
    + '<p>So the pattern <code class="inline">\\d\\d\\d</code> matches three digits in a row, exactly like <code class="inline">[0-9][0-9][0-9]</code> but shorter to type and easier to read.</p>'
    + '<div class="callout"><div class="label">Programming analogy</div>'
    + 'If you have ever called <code class="inline">Character.isDigit(c)</code> in Java, <code class="inline">c.isdigit()</code> in Python, or <code class="inline">/\\d/.test(c)</code> in JS, that is exactly <code class="inline">\\d</code>. <code class="inline">\\w</code> is the "is this an identifier character" test, and <code class="inline">\\s</code> is "is this whitespace". The shorthands are the regex versions of the character predicates you already use.'
    + '</div>'

    + '<h4>What each one actually covers</h4>'
    + '<p>The exact membership matters, because the bugs come from the edges.</p>'
    + '<div class="example"><div class="label">\\d is just the ten digits</div>'
    + '<code class="inline">\\d</code> means <code class="inline">[0-9]</code>. Nothing else. Not a minus sign, not a decimal point, not commas. So <code class="inline">\\d+</code> matches <code class="inline">42</code> inside <code class="inline">-42.5</code> but stops at the <code class="inline">.</code> and never sees the sign.'
    + '</div>'
    + '<div class="example"><div class="label">\\w is letters, digits, AND underscore</div>'
    + '<code class="inline">\\w</code> means <code class="inline">[A-Za-z0-9_]</code>. Two things trip people up: it <strong>includes</strong> the underscore <code class="inline">_</code> (so <code class="inline">user_42</code> is all word characters), and it does <strong>not</strong> include the hyphen <code class="inline">-</code> (so <code class="inline">logged-in</code> breaks into two word runs at the dash). The name says "word" but punctuation like <code class="inline">-</code> <code class="inline">.</code> <code class="inline">@</code> is not in it.'
    + '</div>'
    + '<div class="example"><div class="label">\\s is more than the spacebar</div>'
    + '<code class="inline">\\s</code> matches any whitespace: a regular space, a tab <code class="inline">\\t</code>, a newline <code class="inline">\\n</code>, a carriage return <code class="inline">\\r</code>, and a few rarer ones. This is what you reach for when you split on whitespace and do not care which kind it is.'
    + '</div>'

    + '<h4>Uppercase means "the opposite"</h4>'
    + '<p>Every shorthand has an uppercase twin that matches the exact complement. The uppercase letter negates the lowercase one, the same way <code class="inline">[^...]</code> negated a class in the last level.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">\\D</span>NOT a digit, [^0-9]</div>'
    +   '<div class="symbol-chip"><span class="sym">\\W</span>NOT a word char</div>'
    +   '<div class="symbol-chip"><span class="sym">\\S</span>NOT whitespace</div>'
    + '</div>'
    + '<p>So <code class="inline">\\D</code> matches a letter, a space, a comma, anything that is not <code class="inline">0</code> through <code class="inline">9</code>. And <code class="inline">\\S</code> matches any single visible (non-space) character. A useful trick: <code class="inline">\\S+</code> grabs a run of non-space characters, which is roughly "one whitespace-delimited token".</p>'

    + '<h4>They work inside classes too</h4>'
    + '<p>You can drop a shorthand inside a <code class="inline">[ ]</code> class to add it to a set. <code class="inline">[\\w.]</code> means "a word character OR a literal dot" (handy for matching things like <code class="inline">file.name</code>). And <code class="inline">[\\d\\s]</code> means "a digit or whitespace". Combining a shorthand with extra characters this way is extremely common.</p>'
    + '<div class="callout"><div class="label">Caveat: \\d and \\w are ASCII-only by default</div>'
    + 'In JavaScript, <code class="inline">\\d</code> matches only <code class="inline">0-9</code> and <code class="inline">\\w</code> matches only ASCII letters. Accented letters like <code class="inline">e&#769;</code>, other scripts, and non-Latin digits are NOT matched unless you turn on the <code class="inline">u</code> (unicode) flag and use Unicode property escapes, which is a later-flavor topic. For plain English text and code this rarely bites, but it is the reason a name with an accent can slip past a <code class="inline">\\w+</code> validator.'
    + '</div>'
    + '<p>Below is the live tester seeded with <code class="inline">\\w+</code> (one or more word characters) over a messy line. Watch where the highlighted runs break: on the space, the hyphen, the colon, and the exclamation mark, because none of those are word characters. Then try <code class="inline">\\d+</code>, <code class="inline">\\s</code>, and <code class="inline">\\S+</code> to feel the difference.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Seeded with <code class="inline">\\w+</code>. The runs break wherever a non-word character appears. Try <code class="inline">\\d+</code>, then <code class="inline">\\s</code> (whitespace lights up), then <code class="inline">\\S+</code> (everything except the gaps). Toggle the uppercase twins by typing them.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '\\w+',
      flags: 'g',
      text: 'user_42 logged-in at 09:30! cost was $3.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Match a <strong>single digit</strong> using a shorthand class. Your pattern should match one character that is a digit, and reject a letter or a space.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'a shorthand for one digit',
          flagToggles: [],
          previewList: [
            { label: '0', text: '0' },
            { label: '9', text: '9' },
            { label: 'a', text: 'a' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var d0 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '0');
          var d9 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '9');
          var la = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'a');
          var sp = RXT.lib.rx.matchesWhole(v.pattern, v.flags, ' ');
          if (d0 && d9 && !la && !sp) {
            return { correct: true, feedback: 'Right. <code class="inline">\\d</code> is the shorthand for <code class="inline">[0-9]</code>, one digit and nothing else. (Writing it out as <code class="inline">[0-9]</code> is equally valid, just longer.)' };
          }
          if (d0 && d9 && (la || sp)) {
            return { correct: false, feedback: 'Your pattern matches non-digits too. <code class="inline">\\d</code> matches ONLY 0 through 9. A wildcard like <code class="inline">.</code> is too loose here.' };
          }
          return { correct: false, feedback: 'That does not match a single digit. The shorthand you want is <code class="inline">\\d</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'There is a one-letter shorthand that means "any digit 0-9".',
        'It is a backslash followed by a lowercase letter. Think "digit".',
        'The answer is: \\d'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Match a whole <strong>word token</strong>: one or more word characters and nothing else. It should accept <code class="inline">hello_123</code> (letters, digits, underscore all count) but reject anything containing a space or a hyphen, and reject an empty string.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'one or more word characters',
          flagToggles: [],
          previewList: [
            { label: 'hello_123', text: 'hello_123' },
            { label: 'hi there', text: 'hi there' },
            { label: 'a-b', text: 'a-b' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var good = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'hello_123');
          var space = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'hi there');
          var hyphen = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'a-b');
          var empty = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '');
          if (good && !space && !hyphen && !empty) {
            return { correct: true, feedback: 'Right. <code class="inline">\\w+</code> is one or more word characters, and <code class="inline">\\w</code> includes the underscore but not the hyphen, so <code class="inline">a-b</code> splits at the dash and fails as a whole. The <code class="inline">+</code> means "one or more", which is why the empty string is rejected.' };
          }
          if (good && empty) {
            return { correct: false, feedback: 'Your pattern also matches the empty string. You used <code class="inline">*</code> (zero or more). Switch to <code class="inline">+</code> (one or more) so an empty token is rejected.' };
          }
          if (good && hyphen) {
            return { correct: false, feedback: 'Your pattern accepts <code class="inline">a-b</code>. Remember the hyphen is NOT a word character, so a real <code class="inline">\\w+</code> would stop at the dash and fail to match the whole string.' };
          }
          if (good && space) {
            return { correct: false, feedback: 'Your pattern accepts <code class="inline">hi there</code> with a space. A space is not a word character, so a <code class="inline">\\w+</code> token cannot span it.' };
          }
          return { correct: false, feedback: 'That does not match <code class="inline">hello_123</code> as a whole. You want one or more word characters: <code class="inline">\\w+</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You need the word-character shorthand, then a quantifier that means "one or more".',
        'The shorthand is \\w and the quantifier is + .',
        'The answer is: \\w+'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Match a single character that is <strong>NOT whitespace</strong>. It should accept any visible character (a letter, a digit, a symbol) but reject a space, a tab, or a newline.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'a shorthand for one non-whitespace char',
          flagToggles: [],
          previewList: [
            { label: 'a', text: 'a' },
            { label: '$', text: '$' },
            { label: '(space)', text: ' ' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var accepts = ['a', '5', '-', '$'];
          var rejects = [' ', '\t', '\n'];
          var allAccept = true, i;
          for (i = 0; i < accepts.length; i++) {
            if (!RXT.lib.rx.matchesWhole(v.pattern, v.flags, accepts[i])) { allAccept = false; break; }
          }
          var allReject = true;
          for (i = 0; i < rejects.length; i++) {
            if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, rejects[i])) { allReject = false; break; }
          }
          if (allAccept && allReject) {
            return { correct: true, feedback: 'Right. <code class="inline">\\S</code> (uppercase) is the negation of <code class="inline">\\s</code>: one character that is NOT whitespace. The uppercase twin always means "the opposite of the lowercase one".' };
          }
          if (allAccept && !allReject) {
            return { correct: false, feedback: 'Your pattern matches whitespace too, so it is too broad (a bare <code class="inline">.</code> matches a space). You want the shorthand that EXCLUDES whitespace: the uppercase twin of <code class="inline">\\s</code>.' };
          }
          return { correct: false, feedback: 'That does not match an ordinary visible character. The shorthand for "not whitespace" is <code class="inline">\\S</code> (capital S).' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Whitespace is \\s. You want its opposite, one non-whitespace character.',
        'The uppercase twin of a shorthand negates it. So the opposite of \\s is its capital form.',
        'The answer is: \\S  (capital S)'
      ]
    }
  ]
});
