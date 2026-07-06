// Level 2 — The Dot & Character Classes
RXT.registerLevel({
  id: 2,
  title: 'The Dot & Character Classes',
  whyItMatters: 'Character classes are how you say "one of these" without listing every option; they are the workhorse of real patterns.',
  glossary: ['.', '[abc]', '[^abc]', '[a-z]'],
  learn: ''
    + '<h4>The dot matches any one character</h4>'
    + '<p>The first true metacharacter is the dot, <code class="inline">.</code>. It matches <strong>any single character</strong> (with one exception: it does not match a newline). One dot stands for exactly one character, no more, no less.</p>'
    + '<div class="example"><div class="label">One dot, one character</div>'
    + 'The pattern <code class="inline">c.t</code> matches <code class="inline">cat</code>, <code class="inline">cot</code>, <code class="inline">cut</code>, even <code class="inline">c8t</code> or <code class="inline">c@t</code>. The dot in the middle is a placeholder that says "something goes here, I do not care what".'
    + '</div>'
    + '<p>Think of the dot as a single-character wildcard, like the <code class="inline">?</code> in a shell glob (<code class="inline">c?t</code>). It is powerful, and that is exactly the problem. <code class="inline">c.t</code> happily matches <code class="inline">c#t</code> too. When you only want <em>certain</em> characters in that spot, you need a character class.</p>'

    + '<h4>A character class is a menu: [abc]</h4>'
    + '<p>Square brackets define a <strong>character class</strong>: a set of characters, any ONE of which is allowed at that position. The pattern <code class="inline">[abc]</code> matches a single <code class="inline">a</code>, or a single <code class="inline">b</code>, or a single <code class="inline">c</code>. It is the regex way of writing "one of these".</p>'
    + '<div class="example"><div class="label">Pick one from the set</div>'
    + 'The pattern <code class="inline">gr[ae]y</code> matches both <code class="inline">gray</code> and <code class="inline">grey</code> (American and British spelling). The class <code class="inline">[ae]</code> says "an a or an e goes here". It still matches exactly one character, so <code class="inline">graey</code> does not match.'
    + '</div>'
    + '<p>A class is like an <code class="inline">if</code> over a single character: <code class="inline">if (ch === \'a\' || ch === \'b\' || ch === \'c\')</code>. The class <code class="inline">[abc]</code> is that whole condition, packed into three characters.</p>'
    + '<div class="callout"><div class="label">A class always matches exactly ONE character</div>'
    + 'This trips up everyone at first. <code class="inline">[abc]</code> does not match the string <code class="inline">abc</code>. It matches a single <code class="inline">a</code>, or a single <code class="inline">b</code>, or a single <code class="inline">c</code>. To match three characters you would write three classes, or add a quantifier (the next level).'
    + '</div>'

    + '<h4>Ranges: [a-z], [A-Z], [0-9]</h4>'
    + '<p>Listing every character would be miserable. Inside a class, a hyphen between two characters means a <strong>range</strong> across their character codes. <code class="inline">[a-z]</code> is every lowercase letter, <code class="inline">[A-Z]</code> every uppercase letter, <code class="inline">[0-9]</code> every digit. You can combine ranges and loose characters in one class.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">[a-z]</span>one lowercase letter</div>'
    +   '<div class="symbol-chip"><span class="sym">[A-Z]</span>one uppercase letter</div>'
    +   '<div class="symbol-chip"><span class="sym">[0-9]</span>one digit</div>'
    +   '<div class="symbol-chip"><span class="sym">[a-zA-Z0-9]</span>one letter or digit</div>'
    + '</div>'
    + '<div class="example"><div class="label">Combining ranges and characters</div>'
    + 'The class <code class="inline">[a-fA-F0-9]</code> matches one hexadecimal digit in either case. The class <code class="inline">[A-Za-z_]</code> matches one letter or an underscore. Ranges run over the underlying character codes, so <code class="inline">[0-9]</code> works because <code class="inline">0</code> through <code class="inline">9</code> are adjacent in that order, and <code class="inline">[a-z]</code> works because the lowercase letters are contiguous and in order.'
    + '</div>'

    + '<h4>Negation: [^...] flips the set</h4>'
    + '<p>If the very first character inside the brackets is a caret <code class="inline">^</code>, the class is <strong>negated</strong>: it matches one character that is NOT in the set. <code class="inline">[^0-9]</code> matches any single character that is not a digit. <code class="inline">[^aeiou]</code> matches one character that is not a lowercase vowel.</p>'
    + '<div class="example"><div class="label">Everything except</div>'
    + 'The pattern <code class="inline">[^,]</code> matches any one character that is not a comma. This is the everyday way to say "scan forward until you hit a delimiter". A negated class still matches exactly one character, just from the opposite set.'
    + '</div>'
    + '<div class="callout"><div class="label">The caret has two jobs</div>'
    + 'A caret <code class="inline">^</code> means "negate" ONLY when it is the first character inside a class. Anywhere else inside the brackets it is a literal caret. So <code class="inline">[^x]</code> is "not x", but <code class="inline">[x^]</code> matches an x or a literal caret. (Outside a class, <code class="inline">^</code> means start-of-string, a separate topic in the anchors level.)'
    + '</div>'

    + '<h4>Most metacharacters go quiet inside a class</h4>'
    + '<p>This is the part that surprises people coming from outside. Inside <code class="inline">[...]</code> most of the special characters lose their powers and just stand for themselves. A dot inside a class is a literal dot, not a wildcard.</p>'
    + '<div class="example"><div class="label">A dot inside a class is just a dot</div>'
    + 'Outside a class, <code class="inline">.</code> matches anything. Inside, <code class="inline">[.]</code> matches only a literal period. So <code class="inline">[.?!]</code> matches one sentence-ending punctuation mark (period, question mark, or exclamation point), with no escaping needed for any of them.'
    + '</div>'
    + '<p>Only four characters stay special inside a class, and each has a simple rule to make it literal:</p>'
    + '<ul>'
    +   '<li><code class="inline">^</code> is special only as the very first character (negation). Put it anywhere else, or escape it as <code class="inline">\\^</code>, to mean a literal caret.</li>'
    +   '<li><code class="inline">-</code> means a range between two characters. To match a literal hyphen, put it first <code class="inline">[-a-z]</code>, last <code class="inline">[a-z-]</code>, or escape it <code class="inline">[a\\-z]</code>.</li>'
    +   '<li><code class="inline">]</code> closes the class, so a literal <code class="inline">]</code> must be escaped as <code class="inline">\\]</code> (or placed first).</li>'
    +   '<li><code class="inline">\\</code> is still the escape character.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Why this is a relief</div>'
    + 'A class is a clean little island where you can drop in punctuation without worrying about escaping each piece. <code class="inline">[.()$*]</code> matches one of those five literal characters, even though every one of them is a metacharacter outside the brackets.'
    + '</div>'

    + '<h4>Putting it together</h4>'
    + '<p>The dot is the loosest tool (any character), a class is a precise menu, and a negated class is the complement of that menu. You will reach for classes constantly: matching one digit, one letter, one allowed identifier character, one delimiter. The Play surface below starts with <code class="inline">[0-9]</code>. Try <code class="inline">[aeiou]</code> to highlight vowels, <code class="inline">[^0-9]</code> to highlight everything that is not a digit, and <code class="inline">[A-Z]</code> for the capital letters.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">A class matches exactly ONE character from its set. Try <code class="inline">[0-9]</code>, then <code class="inline">[aeiou]</code>, <code class="inline">[^0-9]</code>, and <code class="inline">[A-Z]</code>. Watch each match cover a single character.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '[0-9]',
      flags: 'g',
      text: 'order 66 on day 7 at 3pm, room 12B.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Write a character class that matches a single <strong>vowel</strong>: one of <code class="inline">a</code>, <code class="inline">e</code>, <code class="inline">i</code>, <code class="inline">o</code>, or <code class="inline">u</code>. It should match exactly one such letter and reject any non-vowel.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'one of a e i o u',
          previewList: [
            { label: 'a', text: 'a' },
            { label: 'e', text: 'e' },
            { label: 'b', text: 'b' },
            { label: 'z', text: 'z' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var vowels = ['a', 'e', 'i', 'o', 'u'];
          var nonVowels = ['b', 'c', 'd', 'z', 'y', 'p'];
          var i, allVowels = true, anyNon = false;
          for (i = 0; i < vowels.length; i++) {
            if (!RXT.lib.rx.matchesWhole(v.pattern, v.flags, vowels[i])) allVowels = false;
          }
          for (i = 0; i < nonVowels.length; i++) {
            if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, nonVowels[i])) anyNon = true;
          }
          if (allVowels && !anyNon) return { correct: true, feedback: 'Right. <code class="inline">[aeiou]</code> is a menu of five characters, any one of which matches. The class matches exactly one character, so it accepts a single vowel and nothing else.' };
          if (!allVowels && !anyNon) return { correct: false, feedback: 'You are missing at least one vowel. List all five inside the brackets: a, e, i, o, u.' };
          if (allVowels && anyNon) return { correct: false, feedback: 'Your class matches every vowel but also matches a consonant. Put ONLY the five vowels inside the brackets, with nothing extra.' };
          return { correct: false, feedback: 'That is not matching the right set. Use a character class containing exactly the five vowels.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A character class is square brackets around the allowed characters: [ ... ].',
        'List all five vowels inside the brackets, in any order. Order does not matter.',
        'The answer is: [aeiou]'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Write a class that matches a single <strong>lowercase hexadecimal digit</strong>: a digit <code class="inline">0</code>-<code class="inline">9</code> or a lowercase letter <code class="inline">a</code>-<code class="inline">f</code>. Use ranges so you do not have to list every character.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'a hex digit (0-9 or a-f)',
          previewList: [
            { label: '0', text: '0' },
            { label: 'f', text: 'f' },
            { label: 'g', text: 'g' },
            { label: 'A', text: 'A' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var good = ['0', '5', '9', 'a', 'c', 'f'];
          var bad = ['g', 'z', 'A', '/', ':', 'h', '.'];
          var i, allGood = true, anyBad = false;
          for (i = 0; i < good.length; i++) {
            if (!RXT.lib.rx.matchesWhole(v.pattern, v.flags, good[i])) allGood = false;
          }
          for (i = 0; i < bad.length; i++) {
            if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, bad[i])) anyBad = true;
          }
          if (allGood && !anyBad) return { correct: true, feedback: 'Correct. <code class="inline">[0-9a-f]</code> stacks two ranges in one class. Note the boundaries: <code class="inline">:</code> sits just past <code class="inline">9</code> and <code class="inline">/</code> just before <code class="inline">0</code> in the character codes, so a tight range excludes both.' };
          if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'A')) return { correct: false, feedback: 'You are also matching uppercase <code class="inline">A</code>. A lowercase hex digit uses <code class="inline">a-f</code>, not <code class="inline">A-F</code>. Did you add an uppercase range or turn on the i flag?' };
          if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'g')) return { correct: false, feedback: 'You are matching <code class="inline">g</code>, which is past <code class="inline">f</code>. The letter range stops at f: use <code class="inline">a-f</code>.' };
          if (!allGood) return { correct: false, feedback: 'You are missing some valid characters. You need both the digit range <code class="inline">0-9</code> and the letter range <code class="inline">a-f</code> inside one class.' };
          if (anyBad) return { correct: false, feedback: 'Your class lets in a character it should not. Tighten the ranges to exactly <code class="inline">0-9</code> and <code class="inline">a-f</code>.' };
          return { correct: false, feedback: 'Not quite. Combine the ranges 0-9 and a-f in a single class.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You can put more than one range inside the same class: [<range1><range2>].',
        'You need a digit range and a lowercase-letter range. The letters stop at f, not z.',
        'The answer is: [0-9a-f]'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Write a class that matches a single character allowed to <strong>start a programming identifier</strong>: a letter of any case, or an underscore. A digit cannot start an identifier, so it must be rejected.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'letter (any case) or underscore',
          previewList: [
            { label: 'a', text: 'a' },
            { label: 'Z', text: 'Z' },
            { label: '_', text: '_' },
            { label: '5', text: '5' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var good = ['a', 'Z', '_'];
          var bad = ['5', '0', '9', '-', '$', ' ', '@'];
          var i, allGood = true, anyBad = false;
          for (i = 0; i < good.length; i++) {
            if (!RXT.lib.rx.matchesWhole(v.pattern, v.flags, good[i])) allGood = false;
          }
          for (i = 0; i < bad.length; i++) {
            if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, bad[i])) anyBad = true;
          }
          if (allGood && !anyBad) return { correct: true, feedback: 'Exactly. <code class="inline">[A-Za-z_]</code> covers both letter ranges plus a literal underscore. This is the classic identifier-start class. A leading digit is excluded, which matches how almost every language defines a valid name.' };
          if (RXT.lib.rx.matchesWhole(v.pattern, v.flags, '5')) return { correct: false, feedback: 'You are matching the digit <code class="inline">5</code>. An identifier cannot start with a digit, so leave the <code class="inline">0-9</code> range out.' };
          if (!RXT.lib.rx.matchesWhole(v.pattern, v.flags, '_')) return { correct: false, feedback: 'You are missing the underscore. Add a literal <code class="inline">_</code> inside the class alongside the letter ranges.' };
          if (!allGood) return { correct: false, feedback: 'You are missing a valid character. You need both an uppercase range and a lowercase range, plus the underscore.' };
          if (anyBad) return { correct: false, feedback: 'Your class allows a character that cannot start an identifier (a digit, hyphen, dollar sign, or space). Keep it to letters and underscore only.' };
          return { correct: false, feedback: 'Not quite. Combine the ranges A-Z and a-z with a literal underscore.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You need two letter ranges (uppercase and lowercase) plus one more literal character.',
        'The underscore is just a literal character inside the class. Drop it in next to the ranges.',
        'The answer is: [A-Za-z_]'
      ]
    }
  ]
});
