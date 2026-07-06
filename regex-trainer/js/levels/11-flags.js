// Level 11 — Flags & Modes
RXT.registerLevel({
  id: 11,
  title: 'Flags & Modes',
  whyItMatters: 'The same pattern behaves differently under different flags, so knowing which one to reach for (and that other tools spell them inline like (?i) or as command-line switches) saves a lot of confusion.',
  glossary: ['g', 'i', 'm', 's', 'u', 'y'],
  learn: ''
    + '<h4>Flags change how the engine runs, not what the pattern says</h4>'
    + '<p>You have been toggling those little <code class="inline">g</code> <code class="inline">i</code> <code class="inline">m</code> <code class="inline">s</code> buttons in the tester since level 0. Now we name them. A <strong>flag</strong> (also called a mode or modifier) is a single letter that sits after the closing slash of a regex and changes how matching behaves. The pattern is the same. The flag changes the rules of the engine.</p>'
    + '<p>Think of it like compiler switches. The source code is the same, but <code class="inline">-O2</code> changes how it runs. Flags are the regex equivalent.</p>'
    + '<div class="example"><div class="label">The /pattern/flags notation</div>'
    + 'In JavaScript, Perl, and sed, a regex is written between slashes with the flags stuck on the end: <code class="inline">/cat/gi</code> means the pattern <code class="inline">cat</code> with the <code class="inline">g</code> and <code class="inline">i</code> flags on. Order does not matter, so <code class="inline">/cat/ig</code> is identical. You can combine as many as you like.'
    + '</div>'

    + '<h4>The six flags</h4>'
    + '<p>JavaScript has six. You will use the first four constantly and the last two rarely.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">g</span>global</div>'
    +   '<div class="symbol-chip"><span class="sym">i</span>ignore case</div>'
    +   '<div class="symbol-chip"><span class="sym">m</span>multiline</div>'
    +   '<div class="symbol-chip"><span class="sym">s</span>dotAll</div>'
    +   '<div class="symbol-chip"><span class="sym">u</span>unicode</div>'
    +   '<div class="symbol-chip"><span class="sym">y</span>sticky</div>'
    + '</div>'

    + '<h4>g: global</h4>'
    + '<p>The <code class="inline">g</code> (global) flag tells the engine to find <em>all</em> matches, not just the first. Without it, a search stops at the first hit. This is also the flag that makes a replace operation replace <em>every</em> occurrence instead of only the first.</p>'
    + '<div class="example"><div class="label">First vs all</div>'
    + 'Pattern <code class="inline">cat</code> on <code class="inline">cat cat cat</code>: without <code class="inline">g</code> it reports one match. With <code class="inline">g</code> it reports three. (This trainer always iterates globally when it counts matches for you, so the count box already shows all of them. The flag still matters the moment you call replace, which you will in level 12.)'
    + '</div>'

    + '<h4>i: ignore case</h4>'
    + '<p>Regex is case-sensitive by default, so <code class="inline">cat</code> does not match <code class="inline">CAT</code>. The <code class="inline">i</code> (ignore case) flag turns that off, so <code class="inline">/cat/i</code> matches <code class="inline">cat</code>, <code class="inline">Cat</code>, <code class="inline">CAT</code>, and <code class="inline">cAt</code> all the same.</p>'
    + '<div class="callout"><div class="label">Why not just write [Cc][Aa][Tt]?</div>'
    + 'You could, and it works, but it is noisy and easy to get wrong on a long word. The <code class="inline">i</code> flag says the intent once for the whole pattern. Reach for the flag.'
    + '</div>'

    + '<h4>m: multiline</h4>'
    + '<p>This one only matters when your anchors are in play. Normally <code class="inline">^</code> means start of the whole string and <code class="inline">$</code> means end of the whole string. The <code class="inline">m</code> (multiline) flag makes <code class="inline">^</code> and <code class="inline">$</code> match the start and end of each <em>line</em> instead, splitting on every newline.</p>'
    + '<div class="example"><div class="label">Per-line anchoring</div>'
    + 'On the text <code class="inline">alpha\\nbeta\\ngamma</code> (three lines), the pattern <code class="inline">^\\w+</code> with the <code class="inline">m</code> flag matches the first word of every line: <code class="inline">alpha</code>, <code class="inline">beta</code>, <code class="inline">gamma</code>. Without <code class="inline">m</code> it only matches <code class="inline">alpha</code>, because <code class="inline">^</code> only fits at the very start of the string. (Pair it with <code class="inline">g</code> to actually collect all the line starts.)'
    + '</div>'

    + '<h4>s: dotAll</h4>'
    + '<p>By default the dot <code class="inline">.</code> matches any character <em>except</em> a newline. The <code class="inline">s</code> (dotAll) flag removes that exception, so <code class="inline">.</code> matches newlines too. This is what you want when a match needs to span multiple lines.</p>'
    + '<div class="example"><div class="label">Crossing a line break</div>'
    + 'On <code class="inline">&lt;a&gt;line1\\nline2&lt;/a&gt;</code>, the pattern <code class="inline">&lt;a&gt;.*?&lt;/a&gt;</code> with NO <code class="inline">s</code> flag fails to capture the whole thing, because the <code class="inline">.</code> stops at the newline between the lines. Turn on <code class="inline">s</code> and the dot sails right through the newline, so the match spans both lines.'
    + '</div>'
    + '<div class="callout"><div class="label">The s-free workaround</div>'
    + 'Older engines (and old JavaScript before 2018) had no <code class="inline">s</code> flag. The classic trick is the character class <code class="inline">[\\s\\S]</code>, which means "any whitespace OR any non-whitespace", in other words truly any character including newlines. So <code class="inline">&lt;a&gt;[\\s\\S]*?&lt;/a&gt;</code> works without the <code class="inline">s</code> flag at all. Good to recognize when you read other people\'s patterns.'
    + '</div>'

    + '<h4>u and y: the two you will rarely touch</h4>'
    + '<p>The <code class="inline">u</code> (unicode) flag makes the engine treat the pattern as a sequence of Unicode code points rather than UTF-16 code units, which matters for emoji and non-Latin scripts and is what unlocks Unicode property escapes like <code class="inline">\\p{Letter}</code>. The <code class="inline">y</code> (sticky) flag forces a match to start exactly at the engine\'s current position (its <code class="inline">lastIndex</code>) rather than scanning forward to find one. It is used in tokenizers and lexers. You can leave both off for everyday work.</p>'

    + '<h4>Other tools spell flags differently</h4>'
    + '<p>The slash-and-flags style is a JavaScript, Perl, and sed convention. Other tools say the same thing other ways. It is worth recognizing all three forms.</p>'
    + '<div class="example"><div class="label">Same intent, three spellings</div>'
    + '<ul>'
    +   '<li><strong>Trailing flags</strong> (JS, Perl, sed): <code class="inline">/cat/i</code></li>'
    +   '<li><strong>Inline mode modifier</strong> (PCRE, Python, Java): <code class="inline">(?i)cat</code> turns on ignore-case from that point in the pattern. You can scope it: <code class="inline">(?i:cat)</code>.</li>'
    +   '<li><strong>Command-line switch</strong> (grep, ripgrep): <code class="inline">grep -i cat file.txt</code></li>'
    + '</ul>'
    + 'When you move a pattern between tools, the pattern body usually ports cleanly. How you ask for case-insensitivity is the part that changes.'
    + '</div>'

    + '<p>In the Play tester below, type <code class="inline">cat</code> and watch the count. Then toggle <code class="inline">i</code> and watch it jump as the capitalized versions start matching. Toggle <code class="inline">m</code> off and on while a <code class="inline">^</code> anchor is in your pattern to feel what multiline does.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Type a pattern, then flip flags with the small buttons and watch the match count change. Try <code class="inline">cat</code> with and without <code class="inline">i</code>, then try <code class="inline">^\\w+</code> with and without <code class="inline">m</code>.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: 'cat',
      flags: 'g',
      text: 'Cat cat CAT\ncategory and a cat.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which flag makes a regex find <strong>all</strong> matches instead of stopping at the first one (and is the flag you need for replace-all)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">pick one...</option>'
          + '<option value="g">g</option>'
          + '<option value="i">i</option>'
          + '<option value="m">m</option>'
          + '<option value="s">s</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'g') return { correct: true, feedback: 'Right. The g (global) flag finds every match, and it is also required to make a replace operation hit every occurrence instead of just the first.' };
        if (v === '') return { correct: false, feedback: 'Pick one of the options first.' };
        if (v === 'i') return { correct: false, feedback: 'i is ignore-case, which controls capitalization, not how many matches you get. Try again.' };
        if (v === 'm') return { correct: false, feedback: 'm is multiline, which changes what ^ and $ anchor to. It does not control finding all matches. Try again.' };
        if (v === 's') return { correct: false, feedback: 's is dotAll, which lets the dot match newlines. It does not control finding all matches. Try again.' };
        return { correct: false, feedback: 'Not quite. The flag for "find all matches" is g.' };
      },
      hints: [
        'It is the flag that also turns a single replace into a replace-all.',
        'Without it, the engine stops at the first hit.',
        'The answer is g (global).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Make the pattern <code class="inline">cat</code> match <strong>case-insensitively</strong>, so it matches <code class="inline">CAT</code>, <code class="inline">Cat</code>, and <code class="inline">cat</code> alike, but still does not match <code class="inline">dog</code>. <br><span class="muted">Type the word and turn on the right flag.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'type: cat, then toggle a flag',
          flagToggles: ['i', 'g'],
          previewList: [
            { label: 'CAT', text: 'CAT' },
            { label: 'Cat', text: 'Cat' },
            { label: 'cat', text: 'cat' },
            { label: 'dog', text: 'dog' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var upper = RXT.lib.rx.test(v.pattern, v.flags, 'CAT');
          var title = RXT.lib.rx.test(v.pattern, v.flags, 'Cat');
          var lower = RXT.lib.rx.test(v.pattern, v.flags, 'cat');
          var dog = RXT.lib.rx.test(v.pattern, v.flags, 'dog');
          if (upper && title && lower && !dog) {
            return { correct: true, feedback: 'Right. With the i (ignore case) flag on, one pattern covers every capitalization, far cleaner than writing [Cc][Aa][Tt].' };
          }
          if (dog) {
            return { correct: false, feedback: 'Your pattern also matches "dog", so it is too loose. Type the literal letters c-a-t and let the i flag handle the capitalization.' };
          }
          if (upper && !lower) {
            return { correct: false, feedback: 'You match the uppercase form but not lowercase "cat". Turn on the i flag so capitalization stops mattering.' };
          }
          if (lower && !upper) {
            return { correct: false, feedback: 'You match lowercase "cat" but not "CAT". Turn on the i (ignore case) flag.' };
          }
          return { correct: false, feedback: 'That does not match all three of CAT / Cat / cat. Type cat and toggle the i flag on.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'The pattern is just the three letters. A flag does the case work.',
        'Type cat, then turn on the i flag so capitalization stops mattering.',
        'The answer is the pattern cat with the i flag turned on.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Match from <code class="inline">&lt;a&gt;</code> all the way to <code class="inline">&lt;/a&gt;</code> even when the content runs across a line break. <br><span class="muted">Sample: <code class="inline">&lt;a&gt;line1</code> then a newline then <code class="inline">line2&lt;/a&gt;</code>. Plain <code class="inline">.</code> stops at a newline, so you need the right flag (or a trick that does not need it).</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match <a> ... </a> across a newline',
          flagToggles: ['g', 's'],
          previewList: [
            { label: 'one line', text: '<a>hello</a>' },
            { label: 'two lines', text: '<a>line1\nline2</a>' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var sample = 'before <a>line1\nline2</a> after';
          var c = RXT.lib.rx.capture(v.pattern, v.flags, sample);
          if (!c) {
            return { correct: false, feedback: 'No match across the two lines. Make sure your pattern goes from &lt;a&gt; to &lt;/a&gt;, and turn on the s (dotAll) flag so the dot can cross the newline (or use [\\s\\S] instead of the dot).' };
          }
          var span = c.whole;
          var isTag = span.indexOf('<a>') === 0 && span.lastIndexOf('</a>') === span.length - 4;
          var bothLines = span.indexOf('line1') !== -1 && span.indexOf('line2') !== -1;
          if (isTag && bothLines) {
            return { correct: true, feedback: 'Right. The s (dotAll) flag lets the dot cross the newline so the match spans from &lt;a&gt; to &lt;/a&gt; across both lines. The alternative [\\s\\S] works the same way without any flag, which is the classic pre-2018 trick.' };
          }
          if (!bothLines) {
            return { correct: false, feedback: 'You matched something, but it did not span both lines (your match stopped at the newline). The dot will not cross a newline unless you turn on the s flag, or swap the dot for [\\s\\S].' };
          }
          return { correct: false, feedback: 'Your match grabbed text outside the tags instead of just the &lt;a&gt;...&lt;/a&gt; span. Bound it with the literal <code class="inline">&lt;a&gt;</code> and <code class="inline">&lt;/a&gt;</code> so the match starts and ends at the tags.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'The dot does not match a newline by default. One flag changes that.',
        'Use <a>.*?</a> and turn on the s (dotAll) flag, or replace the dot with [\\s\\S] which already includes newlines.',
        'The answer is the pattern <a>.*?</a> with the s flag on (equivalently <a>[\\s\\S]*?</a> with no flag).'
      ]
    }
  ]
});
