// Level 0 — Orientation
RXT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'A regular expression is a tiny pattern language for finding, validating, and rewriting text. Every search box, log filter, form validator, and find-and-replace you have ever used is regex underneath. Learn it once and it pays off in every language and every terminal.',
  glossary: ['.', '\\d', '\\w', '+', '( )'],
  learn: ''
    + '<h4>What is a regular expression?</h4>'
    + '<p>A <strong>regular expression</strong> (regex, or regexp) is a <em>pattern</em> that describes a set of strings. You hand the pattern and some text to a <strong>regex engine</strong>, and it tells you where the pattern matches, what it captured, or rewrites the text for you.</p>'
    + '<p>Think of it as a search query with superpowers. Instead of searching for the literal word <code class="inline">cat</code>, you can search for "three digits, a dash, then four digits" or "anything that looks like an email address".</p>'
    + '<div class="example"><div class="label">Where you already meet regex</div>'
    + '<ul>'
    +   '<li><strong>grep / ripgrep</strong> in the terminal: <code class="inline">grep -E "ERROR|WARN" app.log</code></li>'
    +   '<li><strong>Find &amp; replace</strong> in VS Code (toggle the <code class="inline">.*</code> button)</li>'
    +   '<li><strong>Form validation</strong>: "is this a valid email / phone / zip?"</li>'
    +   '<li><strong>Log &amp; data wrangling</strong>: pull every IP address out of a server log</li>'
    +   '<li><strong>Security work</strong>: scanning for tokens, secrets, or suspicious patterns</li>'
    + '</ul></div>'

    + '<h4>Literal text is already a regex</h4>'
    + '<p>The simplest pattern is just the text you want. The pattern <code class="inline">cat</code> matches the letters c-a-t anywhere they appear, including inside <code class="inline">category</code> or <code class="inline">scatter</code>. Most characters in a regex stand for themselves.</p>'
    + '<p>The power comes from a handful of <strong>metacharacters</strong> that mean "any digit", "one or more", "start of line", and so on. You will meet them one level at a time. A quick taste:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">.</span>any character</div>'
    +   '<div class="symbol-chip"><span class="sym">\\d</span>any digit</div>'
    +   '<div class="symbol-chip"><span class="sym">\\w</span>a letter/digit/underscore</div>'
    +   '<div class="symbol-chip"><span class="sym">+</span>one or more</div>'
    +   '<div class="symbol-chip"><span class="sym">( )</span>a group</div>'
    + '</div>'
    + '<div class="example"><div class="label">Read this one</div>'
    + 'The pattern <code class="inline">\\d+</code> means "one or more digits". In the log line <code class="inline">user 42 failed 3 times</code> it matches <code class="inline">42</code> and <code class="inline">3</code>.'
    + '</div>'

    + '<h4>The /pattern/flags notation</h4>'
    + '<p>Regexes are usually written between slashes, with optional <strong>flags</strong> after the closing slash: <code class="inline">/cat/gi</code>. The slashes are just delimiters (this is how JavaScript, Perl, and sed write them). The flags change how matching works. The two you will use constantly:</p>'
    + '<ul>'
    +   '<li><code class="inline">g</code> &mdash; <strong>global</strong>: find <em>all</em> matches, not just the first.</li>'
    +   '<li><code class="inline">i</code> &mdash; <strong>ignore case</strong>: <code class="inline">/cat/i</code> matches "Cat" and "CAT" too.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Which flavor is this trainer?</div>'
    + 'Regex comes in dialects (flavors): JavaScript, PCRE (Perl/PHP), Python <code class="inline">re</code>, Go RE2, POSIX. They agree on the core 95% and differ at the edges. This trainer runs the <strong>JavaScript engine</strong> in your browser, so everything you type here is real and runnable. Level 13 calls out the differences that bite when you move to another flavor.'
    + '</div>'

    + '<h4>How this app works</h4>'
    + '<p>Every level has three parts:</p>'
    + '<ul>'
    +   '<li><strong>Learn</strong> &mdash; the lesson with worked examples (this section).</li>'
    +   '<li><strong>Play</strong> &mdash; a live regex tester. Type a pattern, watch matches light up in the sample text. No goal, just mess around.</li>'
    +   '<li><strong>Try</strong> &mdash; three puzzles, easy &rarr; hard. Stuck? The Hint button gives up to three progressively bigger nudges.</li>'
    + '</ul>'
    + '<p>Progress and notes save automatically in your browser. Below is the tester you will see on every level. Try typing <code class="inline">cat</code>, then turn on the <code class="inline">i</code> flag, then try <code class="inline">\\d+</code>.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Type a pattern on the left. Matches light up in the sample below. Toggle flags with the small buttons. Edit the sample text too.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: 'cat',
      flags: 'g',
      text: 'The cat sat. A CAT and a catalog. Another cat.\n'
          + 'Call 517-555-0142 or 313-555-0199 before 2026-06-28.\n'
          + 'user 42 failed 3 times; user 7 failed 11 times.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which job is a regular expression the right tool for?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">pick one...</option>'
          + '<option value="0">Adding two numbers together</option>'
          + '<option value="1">Finding every email address in a block of text</option>'
          + '<option value="2">Sorting a list of files by size</option>'
          + '<option value="3">Compressing an image</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Exactly. Regex describes text patterns. Finding, validating, and extracting strings is its whole job.' };
        return { correct: false, feedback: 'Regex is about text patterns. Arithmetic, sorting, and image work are not pattern-matching over text.' };
      },
      hints: [
        'Regex is a pattern language for TEXT.',
        'Which option is about locating something inside text?',
        'Finding every email address in a block of text.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Type a pattern that <strong>matches the word</strong> <code class="inline">cat</code> in the sample. (Literal text is a valid pattern, you do not need any special characters yet.)',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: cat',
          flagToggles: ['i'],
          previewText: 'The cat sat on the mat.'
        });
      },
      check: function (v) {
        try {
          var hitsCat = RXT.lib.rx.test(v.pattern, v.flags, 'I adopted a cat');
          var hitsDog = RXT.lib.rx.test(v.pattern, v.flags, 'I adopted a dog');
          if (v.pattern === '') return { correct: false, feedback: 'Type something first.' };
          if (hitsCat && !hitsDog) return { correct: true, feedback: 'That matches "cat". The simplest regex is just the literal text you are looking for.' };
          if (hitsCat && hitsDog) return { correct: false, feedback: 'Your pattern matches "dog" too, so it is too loose. Be specific: type the letters c-a-t.' };
          return { correct: false, feedback: 'That does not match a string containing "cat". Try typing the literal word.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + e.message }; }
      },
      hints: [
        'Most characters in a regex match themselves.',
        'You literally just type the three letters you want to find.',
        'The answer is: cat'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Logs use uppercase tags. Type a pattern that matches the word <code class="inline">ERROR</code> in this line, but does NOT match the lowercase word <code class="inline">error</code>. <br><span class="muted">Sample: <code class="inline">[2026-06-28] ERROR disk full; a minor error earlier</code></span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match ERROR but not error',
          flagToggles: ['i'],
          previewText: '[2026-06-28] ERROR disk full; a minor error earlier'
        });
      },
      check: function (v) {
        try {
          if (v.pattern === '') return { correct: false, feedback: 'Type something first.' };
          var hitsUpper = RXT.lib.rx.test(v.pattern, v.flags, 'ERROR');
          var hitsLower = RXT.lib.rx.test(v.pattern, v.flags, 'error');
          if (hitsUpper && !hitsLower) return { correct: true, feedback: 'Case matters by default: ERROR matches the literal pattern ERROR, while lowercase error does not. Turning on the i flag would have broken this. Regex is case-sensitive unless you say otherwise.' };
          if (hitsUpper && hitsLower) return { correct: false, feedback: 'You matched lowercase too. Did you turn on the i (ignore case) flag? Turn it OFF. The point is that regex is case-sensitive.' };
          return { correct: false, feedback: 'That does not match ERROR. Type the uppercase letters E-R-R-O-R.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + e.message }; }
      },
      hints: [
        'Regex is case-sensitive by default. Uppercase ERROR and lowercase error are different patterns.',
        'Just type the uppercase letters. Make sure the i flag is OFF.',
        'The answer is: ERROR  (with the i flag turned off)'
      ]
    }
  ]
});
