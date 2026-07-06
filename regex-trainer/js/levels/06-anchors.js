// Level 6 — Anchors & Boundaries
RXT.registerLevel({
  id: 6,
  title: 'Anchors & Boundaries',
  whyItMatters: 'Anchors are how you validate a WHOLE field instead of just finding a substring inside it, and word boundaries are how you match a whole word; skipping them is exactly why a "valid zip code" regex happily accepts garbage12345garbage.',
  glossary: ['^', '$', '\\b', '\\B', 'm', 'g'],
  learn: ''
    + '<h4>Matching a position, not a character</h4>'
    + '<p>Every token you have met so far matches a <em>character</em>. <code class="inline">\\d</code> consumes one digit, <code class="inline">[a-z]</code> consumes one letter, and so on. Anchors are different. They match a <strong>position</strong> between characters and consume nothing. They are <strong>zero-width</strong>. Think of them like the cursor position in your editor: a spot, not a character.</p>'
    + '<p>The two anchors you will use constantly:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">^</span>start of string</div>'
    +   '<div class="symbol-chip"><span class="sym">$</span>end of string</div>'
    + '</div>'
    + '<p><code class="inline">^</code> asserts "we are at the very start of the input". <code class="inline">$</code> asserts "we are at the very end". Neither one eats a character, so they do not show up in the matched text. They just pin the rest of the pattern in place.</p>'

    + '<h4>Why anchors matter: find vs validate</h4>'
    + '<p>This is the single most important idea in the level. By default a regex <strong>searches</strong> for its pattern <em>anywhere</em> inside the text. It says yes if it finds a match in the middle, at the edges, anywhere.</p>'
    + '<div class="example"><div class="label">The bug anchors fix</div>'
    + '<p>Say you want to validate that a field is exactly three digits. You write <code class="inline">\\d{3}</code> and call it a day. But <code class="inline">\\d{3}</code> only asks "are there three digits <em>somewhere</em>?". It matches inside <code class="inline">garbage123garbage</code>, inside <code class="inline">abc999xyz</code>, inside a 50-character mess. As a validator it is useless.</p>'
    + '<p>Wrap it in anchors: <code class="inline">^\\d{3}$</code>. Now it reads "start of string, then exactly three digits, then end of string, with nothing else allowed". That matches <code class="inline">123</code> and rejects <code class="inline">x123y</code> and <code class="inline">1234</code>. The anchors are what turn a <em>search</em> into a <em>validation</em>.</p>'
    + '</div>'
    + '<div class="callout"><div class="label">The validation idiom</div>'
    + 'To check that a WHOLE string matches a pattern, wrap it in <code class="inline">^...$</code>. This is the difference between "does this text contain an email" and "is this entire field a valid email". Almost every form validator you have ever used is <code class="inline">^pattern$</code> under the hood. (This trainer also gives you a helper, <code class="inline">matchesWhole</code>, that does the wrapping for you, but knowing how to write the anchors yourself is the real skill.)'
    + '</div>'

    + '<h4>Word boundaries: ' + RXT.escapeHtml('\\b') + '</h4>'
    + '<p>Anchors pin to the edges of the whole string. A <strong>word boundary</strong> <code class="inline">\\b</code> pins to the edge of a <em>word</em>. It is also zero-width. It matches the position between a word character (a <code class="inline">\\w</code>, meaning a letter, digit, or underscore) and a non-word character, or between a word character and the start or end of the string.</p>'
    + '<p>The classic use is matching a whole word and nothing embedded. Searching for the literal <code class="inline">cat</code> also matches the <code class="inline">cat</code> hiding inside <code class="inline">category</code> and <code class="inline">scatter</code>. Surround it with boundaries, <code class="inline">\\bcat\\b</code>, and now only the standalone word <code class="inline">cat</code> matches.</p>'
    + '<div class="example"><div class="label">Where the boundaries fall</div>'
    + '<p>In the text <code class="inline">a cat. category</code>, the positions <code class="inline">\\b</code> matches are: before the <code class="inline">a</code>, after it, before <code class="inline">cat</code>, after <code class="inline">cat</code> (right before the <code class="inline">.</code>), before <code class="inline">category</code>, and after it. So <code class="inline">\\bcat\\b</code> matches the first <code class="inline">cat</code> (a word char on each side is a space and a dot, both non-word) but NOT the <code class="inline">cat</code> at the front of <code class="inline">category</code>, because the character right after it (<code class="inline">e</code>) is a word char, so there is no boundary there.</p>'
    + '</div>'
    + '<p>The opposite, <code class="inline">\\B</code>, matches a position that is <strong>not</strong> a word boundary. <code class="inline">\\Bcat\\B</code> matches <code class="inline">cat</code> only when it is buried inside a larger word, the exact opposite of <code class="inline">\\bcat\\b</code>.</p>'

    + '<h4>The m flag: anchors per line</h4>'
    + '<p>By default <code class="inline">^</code> and <code class="inline">$</code> mean the start and end of the entire string, even when the string has newlines in it. The <strong>multiline</strong> flag <code class="inline">m</code> changes that. With <code class="inline">m</code> on, <code class="inline">^</code> matches at the start of <em>every line</em> and <code class="inline">$</code> matches at the end of every line.</p>'
    + '<div class="example"><div class="label">Same pattern, different flag</div>'
    + '<p>Given the three-line input <code class="inline">alpha</code> / <code class="inline">beta</code> / <code class="inline">gamma</code> (newlines between them), the pattern <code class="inline">^\\w+</code> with no flags matches just <code class="inline">alpha</code> (the one start-of-string). Add the <code class="inline">m</code> flag and <code class="inline">^\\w+</code> now matches <code class="inline">alpha</code>, <code class="inline">beta</code>, and <code class="inline">gamma</code>, the first word on each line. You will usually pair <code class="inline">m</code> with the <code class="inline">g</code> (global) flag so the engine collects all of those matches instead of stopping at the first.</p>'
    + '</div>'
    + '<div class="callout"><div class="label">g vs m, two different jobs</div>'
    + 'These get confused constantly. <code class="inline">g</code> (global) is "find <em>all</em> the matches, do not stop at the first one". <code class="inline">m</code> (multiline) only changes what <code class="inline">^</code> and <code class="inline">$</code> mean (per line vs whole string). To grab the first word of every line you need both: <code class="inline">m</code> to make <code class="inline">^</code> fire on each line, and <code class="inline">g</code> to actually return each one.'
    + '</div>'

    + '<h4>Quick reference</h4>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">^</span>start of string (or line, with m)</div>'
    +   '<div class="symbol-chip"><span class="sym">$</span>end of string (or line, with m)</div>'
    +   '<div class="symbol-chip"><span class="sym">' + RXT.escapeHtml('\\b') + '</span>word boundary</div>'
    +   '<div class="symbol-chip"><span class="sym">' + RXT.escapeHtml('\\B') + '</span>not a word boundary</div>'
    +   '<div class="symbol-chip"><span class="sym">m</span>^ and $ per line</div>'
    +   '<div class="symbol-chip"><span class="sym">g</span>find all matches</div>'
    + '</div>'
    + '<p>Below, the tester is seeded with <code class="inline">\\bcat\\b</code>. Watch the standalone <code class="inline">cat</code>s light up while the ones inside <code class="inline">category</code> and <code class="inline">scatter</code> stay dark. Then try deleting the <code class="inline">\\b</code>s to see the embedded ones get caught, or switch the pattern to <code class="inline">^\\w+</code> and toggle the <code class="inline">m</code> flag.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Seeded with <code class="inline">\\bcat\\b</code> on a line full of cats. Delete the <code class="inline">\\b</code>s to watch the embedded ones get caught. Or try <code class="inline">^\\w+</code> and toggle the <code class="inline">m</code> flag to match the first word of each line.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '\\bcat\\b',
      flags: 'g',
      text: 'cat category the cat scatter a cat!\n'
          + 'concatenate a cat, then categorize the cat.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Match the standalone word <code class="inline">is</code>. It should match the word <code class="inline">is</code> on its own, but NOT the <code class="inline">is</code> hidden inside <code class="inline">this</code>, <code class="inline">his</code>, or <code class="inline">island</code>. <br><span class="muted">Sample: <code class="inline">this is his island</code>. Only the one real word should match.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match only the word is',
          flags: 'g',
          previewText: 'this is his island'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ms = RXT.lib.rx.matches(v.pattern, v.flags || 'g', 'this is his island');
          if (ms.length === 1 && ms[0].text === 'is') {
            return { correct: true, feedback: 'Exactly one match, and it is the standalone word. The word boundaries \\b on each side require a non-word edge, so the "is" inside "this", "his", and "island" is skipped.' };
          }
          if (ms.length === 0) {
            return { correct: false, feedback: 'No match at all. You still need the literal letters i-s in there, just fenced off by boundaries.' };
          }
          var texts = ms.map(function (m) { return m.text; }).join(', ');
          return { correct: false, feedback: 'You matched ' + ms.length + ' times (' + RXT.escapeHtml(texts) + '). A bare <code class="inline">is</code> also matches inside "this", "his", and "island". Fence it with word boundaries so only the standalone word counts.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A bare "is" matches anywhere the letters i-s appear, including inside other words. You need to require a word edge on each side.',
        'The word boundary token \\b matches the zero-width position between a word char and a non-word char. Put one before AND after.',
        'The answer is: \\bis\\b'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Validate that the ENTIRE input is exactly three digits. The pattern must accept <code class="inline">123</code> but reject <code class="inline">x123y</code> (extra junk around it) and <code class="inline">1234</code> (too many digits). <br><span class="muted">Hint: an un-anchored <code class="inline">\\d{3}</code> would happily match inside <code class="inline">x123y</code>. Anchors are what stop that.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'whole string is exactly 3 digits',
          flags: '',
          previewList: [
            { label: '123', text: '123' },
            { label: 'x123y', text: 'x123y' },
            { label: '1234', text: '1234' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var good = RXT.lib.rx.test(v.pattern, v.flags, '123');
          var junk = RXT.lib.rx.test(v.pattern, v.flags, 'x123y');
          var tooMany = RXT.lib.rx.test(v.pattern, v.flags, '1234');
          var nonDigit = RXT.lib.rx.test(v.pattern, v.flags, 'abc');
          if (good && !junk && !tooMany && !nonDigit) {
            return { correct: true, feedback: 'That is a real validator. Because we grade with a plain search (not a whole-string helper), something in your pattern has to forbid extra characters on both ends. <code class="inline">^</code> and <code class="inline">$</code> are the standard way to pin the three digits to the start and end of the string.' };
          }
          if (!good) {
            return { correct: false, feedback: 'It does not even accept "123". You need exactly three digits between the anchors, like <code class="inline">\\d{3}</code> or <code class="inline">[0-9]{3}</code>.' };
          }
          if (nonDigit) {
            return { correct: false, feedback: 'It accepts "abc", which has no digits. The prompt asks for three DIGITS specifically, so use <code class="inline">\\d{3}</code> or <code class="inline">[0-9]{3}</code> between the anchors, not <code class="inline">.</code> or <code class="inline">\\w</code>.' };
          }
          if (junk && tooMany) {
            return { correct: false, feedback: 'It accepts "x123y" and "1234", so it is just searching for three digits somewhere. Add <code class="inline">^</code> at the start and <code class="inline">$</code> at the end so nothing else is allowed.' };
          }
          if (junk) {
            return { correct: false, feedback: 'It still accepts "x123y" (junk around the digits). You are missing a start anchor <code class="inline">^</code>, an end anchor <code class="inline">$</code>, or both.' };
          }
          return { correct: false, feedback: 'It accepts "1234", which has a fourth digit. Anchor BOTH ends with <code class="inline">^...$</code> so no extra character can sneak in.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A search just asks "is this pattern in there somewhere?". To validate the WHOLE field you must forbid anything before or after.',
        'Pin the start with ^ and the end with $. Between them, exactly three digits: \\d{3} (or [0-9]{3}).',
        'The answer is: ^\\d{3}$'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Match the FIRST word on every line. On the three-line input <code class="inline">alpha one</code> / <code class="inline">beta two</code> / <code class="inline">gamma</code>, you want three matches: <code class="inline">alpha</code>, <code class="inline">beta</code>, <code class="inline">gamma</code>. <br><span class="muted">This needs two flags: one to make <code class="inline">^</code> fire on each line, and one to collect every match.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'first word of each line',
          flags: 'gm',
          flagToggles: ['g', 'm'],
          previewText: 'alpha one\nbeta two\ngamma'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var f = v.flags || '';
          if (f.indexOf('m') === -1) {
            return { correct: false, feedback: 'Without the <code class="inline">m</code> (multiline) flag, <code class="inline">^</code> only means the start of the whole string, so you can match at most the very first word. Turn on the <code class="inline">m</code> flag so <code class="inline">^</code> fires at the start of every line.' };
          }
          if (f.indexOf('g') === -1) {
            return { correct: false, feedback: 'You need the <code class="inline">g</code> (global) flag too. Without it the engine stops at the very first match instead of collecting one per line. Turn on <code class="inline">g</code> so all three line-starts are returned.' };
          }
          var ms = RXT.lib.rx.matches(v.pattern, f, 'alpha one\nbeta two\ngamma');
          var joined = ms.map(function (m) { return m.text; }).join(',');
          if (joined === 'alpha,beta,gamma') {
            return { correct: true, feedback: 'All three first-words, one per line. The <code class="inline">m</code> flag made <code class="inline">^</code> match at the start of each line, and <code class="inline">g</code> collected every match instead of stopping at the first. <code class="inline">^\\w+</code> grabs the run of word characters from that line-start.' };
          }
          return { correct: false, feedback: 'You got "' + RXT.escapeHtml(joined) + '", not "alpha,beta,gamma". Anchor to the line start with <code class="inline">^</code> and grab the leading word with <code class="inline">\\w+</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You want the run of word characters that sits right at the start of each line. That is an anchor plus a quantified word class.',
        'Anchor with ^ and grab the word with \\w+, giving ^\\w+. Then turn on BOTH flags: m (so ^ means line-start) and g (so all lines are collected).',
        'The answer is: pattern ^\\w+ with the g and m flags both on.'
      ]
    }
  ]
});
