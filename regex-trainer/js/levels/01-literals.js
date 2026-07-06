// Level 1 — Literal Characters & Escaping
RXT.registerLevel({
  id: 1,
  title: 'Literal Characters & Escaping',
  whyItMatters: 'The moment a search "breaks" on a dot or a parenthesis is the moment you learn escaping, and it is the number one beginner bug in regex.',
  glossary: ['\\', 'i'],
  learn: ''
    + '<h4>Most characters match themselves</h4>'
    + '<p>You already saw this in the orientation level. The pattern <code class="inline">cat</code> matches the letters c-a-t. Letters, digits, and spaces are all <strong>literals</strong>: they stand for exactly the character you typed. If that were the whole story, regex would just be a slow way to do <code class="inline">indexOf</code>.</p>'
    + '<p>The power comes from a small set of characters that have a special job instead of matching themselves. We call them <strong>metacharacters</strong>. When you want a metacharacter to match its own literal character, you put a backslash in front of it. That backslash is the <strong>escape</strong> character.</p>'

    + '<h4>The 14 metacharacters you must escape</h4>'
    + '<p>These fourteen characters do NOT match themselves by default. Each has a special meaning you will learn in later levels. To match the literal character, escape it with a backslash <code class="inline">\\</code>:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">.</span>any char</div>'
    +   '<div class="symbol-chip"><span class="sym">\\</span>escape</div>'
    +   '<div class="symbol-chip"><span class="sym">+</span>one or more</div>'
    +   '<div class="symbol-chip"><span class="sym">*</span>zero or more</div>'
    +   '<div class="symbol-chip"><span class="sym">?</span>optional</div>'
    +   '<div class="symbol-chip"><span class="sym">(</span>group open</div>'
    +   '<div class="symbol-chip"><span class="sym">)</span>group close</div>'
    +   '<div class="symbol-chip"><span class="sym">[</span>class open</div>'
    +   '<div class="symbol-chip"><span class="sym">]</span>class close</div>'
    +   '<div class="symbol-chip"><span class="sym">{</span>interval open</div>'
    +   '<div class="symbol-chip"><span class="sym">}</span>interval close</div>'
    +   '<div class="symbol-chip"><span class="sym">^</span>start</div>'
    +   '<div class="symbol-chip"><span class="sym">$</span>end</div>'
    +   '<div class="symbol-chip"><span class="sym">|</span>or</div>'
    + '</div>'
    + '<p>A quick way to remember them: <code class="inline">. \\ + * ? ( ) [ ] { } ^ $ |</code>. Everything else you can type usually means itself.</p>'

    + '<h4>The dot is the classic trap</h4>'
    + '<p>The most common metacharacter is <code class="inline">.</code> (the dot). On its own it means "any single character", not "a period". So the pattern <code class="inline">3.14</code> does NOT just match <code class="inline">3.14</code>. The dot will happily match an <code class="inline">x</code> or a <code class="inline">0</code> in that spot.</p>'
    + '<div class="example"><div class="label">The dot over-matches</div>'
    + 'The pattern <code class="inline">3.14</code> matches <code class="inline">3.14</code>, but it ALSO matches <code class="inline">3x14</code> and <code class="inline">3014</code>, because the dot stands for any one character. To match a real period you escape it: <code class="inline">3\\.14</code>. Now the second character must be an actual dot, so <code class="inline">3x14</code> no longer matches.'
    + '</div>'

    + '<h4>Worked examples</h4>'
    + '<p>Read each of these slowly. The pattern is on the left, what it matches is on the right.</p>'
    + '<div class="example"><div class="label">Find a real decimal number</div>'
    + 'To find the literal text <code class="inline">3.14</code> and nothing looser, escape the dot: <code class="inline">3\\.14</code>. The <code class="inline">\\.</code> means "an actual period right here".'
    + '</div>'
    + '<div class="example"><div class="label">Find text wrapped in parentheses</div>'
    + 'Parentheses are metacharacters too: they create groups. To match the literal text <code class="inline">(note)</code> you escape both: <code class="inline">\\(note\\)</code>. Without the backslashes, <code class="inline">(note)</code> means "the group containing the word note", which matches just <code class="inline">note</code> and not the parentheses.'
    + '</div>'
    + '<div class="example"><div class="label">Find a price like $5</div>'
    + 'The dollar sign <code class="inline">$</code> normally anchors to the end of the string. To match a literal dollar amount such as <code class="inline">$5</code>, escape it: <code class="inline">\\$5</code>.'
    + '</div>'

    + '<h4>Case sensitivity and the i flag</h4>'
    + '<p>By default regex is <strong>case-sensitive</strong>. The pattern <code class="inline">cat</code> matches <code class="inline">cat</code> but not <code class="inline">Cat</code> or <code class="inline">CAT</code>. This is exactly like comparing strings with <code class="inline">===</code> in JavaScript.</p>'
    + '<p>To match regardless of case, add the <strong>i flag</strong> (ignore case) after the closing slash. So <code class="inline">/cat/i</code> matches <code class="inline">cat</code>, <code class="inline">Cat</code>, and <code class="inline">CAT</code>. In this trainer you turn the <code class="inline">i</code> flag on with the small <code class="inline">i</code> button next to the pattern box.</p>'
    + '<div class="callout"><div class="label">Escaping is about the dot, not the case</div>'
    + 'Escaping (the backslash) and case sensitivity (the <code class="inline">i</code> flag) are two separate things. Escaping decides whether a metacharacter is literal. The <code class="inline">i</code> flag decides whether letters care about uppercase versus lowercase. You will often want one without the other.'
    + '</div>'

    + '<h4>The leaning toothpick problem</h4>'
    + '<p>Regex lives inside other languages, and many of those languages also treat the backslash as special inside string literals. So the backslash you need for regex often has to be doubled up in source code.</p>'
    + '<div class="callout"><div class="label">Why you sometimes see two backslashes</div>'
    + 'In a JavaScript string, <code class="inline">"\\."</code> is just <code class="inline">.</code> because the string parser eats one backslash. To get a regex that contains <code class="inline">\\.</code> from a string you write <code class="inline">"\\\\."</code> (two backslashes). This pile-up of slashes is nicknamed the <strong>leaning toothpick syndrome</strong>. It is why most people prefer the literal <code class="inline">/3\\.14/</code> notation when the language supports it. In this trainer you type the regex directly, so you only ever need ONE backslash to escape a metacharacter.'
    + '</div>'
    + '<p>In the Play area below, the pattern is <code class="inline">3\\.14</code>. Watch how it matches only the real decimal. Then delete the backslash to make it <code class="inline">3.14</code> and watch the dot start matching things like <code class="inline">3x14</code> and <code class="inline">30014</code>.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">The escaped dot <code class="inline">\\.</code> matches a real period. Delete the backslash so the pattern reads <code class="inline">3.14</code> and watch the dot over-match into <code class="inline">3x14</code> and <code class="inline">30014</code>. Toggle the <code class="inline">i</code> button to see case sensitivity at work too.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '3\\.14',
      flags: 'g',
      text: 'pi is 3.14, not 3x14 or 30014. also 3.141 and 13.14.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Match the literal text <code class="inline">C++</code>. Remember that <code class="inline">+</code> is a metacharacter (it means "one or more"), so a bare <code class="inline">C++</code> will not do what you expect. <br><span class="muted">Accept a string containing <code class="inline">C++</code>, reject a string with just a bare <code class="inline">C</code>.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match the text C++',
          flagToggles: ['i'],
          previewList: [
            { label: 'has C++', text: 'I write C++ daily' },
            { label: 'just C', text: 'I write C daily' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var hasCpp = RXT.lib.rx.test(v.pattern, v.flags, 'I write C++ daily');
          var bareC = RXT.lib.rx.test(v.pattern, v.flags, 'I write C daily');
          var cPlus = RXT.lib.rx.test(v.pattern, v.flags, 'I scored C+ on the test');
          var plusOnly = RXT.lib.rx.test(v.pattern, v.flags, 'a + b');
          if (!hasCpp) return { correct: false, feedback: 'That does not match <code class="inline">C++</code>. You need a literal C followed by two literal plus signs. Escape each plus with a backslash.' };
          if (bareC || plusOnly) return { correct: false, feedback: 'Too loose: your pattern matches text that has no <code class="inline">C++</code> in it (a bare C, or a stray plus). You need a literal C immediately followed by two real plus signs. Escape each plus: <code class="inline">C\\+\\+</code>.' };
          if (cPlus) return { correct: false, feedback: 'Close, but your pattern is happy with a single plus (it matches <code class="inline">C+</code>). C++ has TWO plus signs, so escape both: <code class="inline">C\\+\\+</code>.' };
          return { correct: true, feedback: 'Correct. You escaped each plus sign so it matches a literal <code class="inline">+</code> instead of meaning "one or more". The pattern <code class="inline">C\\+\\+</code> requires a C followed by two real plus signs.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'The plus sign is one of the 12 metacharacters. By itself it does not mean a literal plus.',
        'Escape each plus sign with a backslash so it matches a real +. There are two of them.',
        'The answer is: C\\+\\+'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Match the literal IP address text <code class="inline">192.168.0.1</code> with the dots treated as real periods. <br><span class="muted">Accept <code class="inline">host 192.168.0.1 up</code>. Reject <code class="inline">host 192a168b0c1 up</code> (an unescaped dot would wrongly match that, which is exactly the bug we are catching).</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match 192.168.0.1 literally',
          flagToggles: ['i'],
          previewList: [
            { label: 'real IP', text: 'host 192.168.0.1 up' },
            { label: 'fake (letters)', text: 'host 192a168b0c1 up' },
            { label: 'fake (later dots)', text: 'host 192.168a0b1 up' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var real = RXT.lib.rx.test(v.pattern, v.flags, 'host 192.168.0.1 up');
          var fake = RXT.lib.rx.test(v.pattern, v.flags, 'host 192a168b0c1 up');
          var fake2 = RXT.lib.rx.test(v.pattern, v.flags, 'host 192.168a0b1 up');
          if (!real) return { correct: false, feedback: 'That does not match <code class="inline">192.168.0.1</code>. Type the digits and escape each of the three dots with a backslash.' };
          if (fake || fake2) return { correct: false, feedback: 'You matched a fake address where letters stand in for the dots. That means at least one of your dots is still a wildcard. Escape EVERY dot: <code class="inline">192\\.168\\.0\\.1</code>.' };
          return { correct: true, feedback: 'Correct. Each <code class="inline">\\.</code> demands an actual period, so an address with letters in the dot positions is rejected. The pattern is <code class="inline">192\\.168\\.0\\.1</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'There are three dots in the address. By default each dot matches any character, including a letter.',
        'Escape every dot with a backslash so it only matches a real period: 192\\.168\\.0\\.1',
        'The answer is: 192\\.168\\.0\\.1'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Match the literal price <code class="inline">$9.99</code>. Both the dollar sign and the dot are special, so both need escaping. <br><span class="muted">Accept <code class="inline">it costs $9.99 today</code>. Reject <code class="inline">it costs 9x99 today</code> (the dot must be literal) and reject <code class="inline">$9099</code> (the dot must be present, not a wildcard).</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match the literal price $9.99',
          flagToggles: ['i'],
          previewList: [
            { label: 'real price', text: 'it costs $9.99 today' },
            { label: 'no dollar/dot', text: 'it costs 9x99 today' },
            { label: 'wrong digit', text: '$9099' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var real = RXT.lib.rx.test(v.pattern, v.flags, 'it costs $9.99 today');
          var noSign = RXT.lib.rx.test(v.pattern, v.flags, 'it costs 9x99 today');
          var wrong = RXT.lib.rx.test(v.pattern, v.flags, '$9099');
          var loose = RXT.lib.rx.test(v.pattern, v.flags, 'price is $9.95 here');
          if (!real) return { correct: false, feedback: 'That does not match <code class="inline">$9.99</code>. Escape the dollar sign as <code class="inline">\\$</code> and the dot as <code class="inline">\\.</code>, with the digits in between.' };
          if (noSign) return { correct: false, feedback: 'Your pattern matched <code class="inline">9x99</code>, which has no dollar sign and an x where the dot should be. Escape the dot with <code class="inline">\\.</code> and require the dollar sign with <code class="inline">\\$</code>.' };
          if (wrong) return { correct: false, feedback: 'Your pattern matched <code class="inline">$9099</code>, where the dot position is the digit 0. That means your dot is still a wildcard. Escape it: <code class="inline">\\.</code>.' };
          if (loose) return { correct: false, feedback: 'Your pattern matched <code class="inline">$9.95</code>, so it does not pin down the last two digits. Spell out all of <code class="inline">$9.99</code>: <code class="inline">\\$9\\.99</code>.' };
          return { correct: true, feedback: 'Correct. The <code class="inline">\\$</code> matches a literal dollar sign and the <code class="inline">\\.</code> matches a literal period, so only a real <code class="inline">$9.99</code> matches. The pattern is <code class="inline">\\$9\\.99</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Two metacharacters here: the dollar sign (normally an end anchor) and the dot (normally any character).',
        'Escape both. The dollar becomes \\$ and the dot becomes \\. with the digits 9, 9, 9 in place.',
        'The answer is: \\$9\\.99'
      ]
    }
  ]
});
