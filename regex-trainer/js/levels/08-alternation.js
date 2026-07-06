// Level 8 — Alternation
RXT.registerLevel({
  id: 8,
  title: 'Alternation',
  whyItMatters: 'The pipe means "OR", but its surprisingly low precedence creates a classic bug where your anchors only apply to one branch, and that gotcha shows up in interviews and in production validators alike.',
  glossary: ['|', '( )', '(?: )', '\\b'],
  learn: ''
    + '<h4>The pipe means OR</h4>'
    + '<p>So far every pattern has described one shape of text. <strong>Alternation</strong> lets you say "match this OR that". The operator is the vertical bar <code class="inline">|</code> (the pipe character, the same key you use for piping in the shell).</p>'
    + '<p>The pattern <code class="inline">cat|dog</code> matches the text <code class="inline">cat</code> or the text <code class="inline">dog</code>. The engine tries the left branch first; if it fails at this position, it tries the right branch.</p>'
    + '<div class="example"><div class="label">Read this one</div>'
    + 'In a log line, <code class="inline">ERROR|WARN|INFO</code> matches whichever of those three words appears. This is exactly what <code class="inline">grep -E "ERROR|WARN"</code> does at the terminal.'
    + '</div>'

    + '<h4>You can list as many branches as you want</h4>'
    + '<p>Chain pipes for more than two options: <code class="inline">red|green|blue</code> matches any one of the three. Think of it like a chain of <code class="inline">||</code> conditions in code, where each branch is a sub-pattern that the engine tries in order.</p>'

    + '<h4>The trap: alternation has the LOWEST precedence</h4>'
    + '<p>This is the one thing about <code class="inline">|</code> that bites everyone. The pipe splits the <em>entire</em> pattern, reaching as far left and as far right as it can. It is the loosest-binding operator in regex, looser than concatenation, looser than any quantifier.</p>'
    + '<p>So this pattern does NOT mean what it looks like it means:</p>'
    + '<div class="example"><div class="label">The classic bug</div>'
    + '<p>You want "the whole string is exactly <code class="inline">cat</code> or exactly <code class="inline">dog</code>", so you write:</p>'
    + '<p><code class="inline">^cat|dog$</code></p>'
    + '<p>But because <code class="inline">|</code> splits the whole pattern, the engine reads it as two branches:</p>'
    + '<p><code class="inline">(^cat)</code> &nbsp;OR&nbsp; <code class="inline">(dog$)</code></p>'
    + '<p>The left branch means "starts with cat" (the rest of the line can be anything). The right branch means "ends with dog". So <code class="inline">^cat|dog$</code> happily matches <code class="inline">catalog</code> (it starts with cat) and <code class="inline">hotdog</code> (it ends with dog). The anchors landed on the wrong things.</p>'
    + '</div>'

    + '<h4>The fix: group the alternation</h4>'
    + '<p>Wrap the OR in parentheses so the pipe only splits <em>inside</em> the group. The anchors then apply to the whole thing:</p>'
    + '<p><code class="inline">^(?:cat|dog)$</code></p>'
    + '<p>Now it reads as "start, then (cat OR dog), then end". That matches exactly <code class="inline">cat</code> and exactly <code class="inline">dog</code> and nothing else.</p>'
    + '<div class="callout"><div class="label">Capturing vs non-capturing group</div>'
    + 'A plain <code class="inline">( )</code> group does two jobs: it bounds the alternation AND it captures what matched into a numbered slot. When you only need the bounding, use a <strong>non-capturing group</strong> <code class="inline">(?:...)</code>. The <code class="inline">?:</code> right after the open paren says "group, but do not bother saving a capture". Either works for fixing the precedence bug. <code class="inline">^(cat|dog)$</code> and <code class="inline">^(?:cat|dog)$</code> match the same strings; the first one also stores the match in group 1. Reach for <code class="inline">(?:...)</code> when you are not going to use that capture, since it is slightly cheaper and signals intent.'
    + '</div>'

    + '<h4>Bounding a branch in the middle of a pattern</h4>'
    + '<p>The same grouping rule applies when the OR is part of a longer pattern. Say you want a filename: one or more word characters, a dot, then one of three extensions.</p>'
    + '<div class="example"><div class="label">Worked example: image filenames</div>'
    + '<p><code class="inline">\\w+\\.(?:jpg|png|gif)</code></p>'
    + '<ul>'
    +   '<li><code class="inline">\\w+</code> is one or more word characters (the name).</li>'
    +   '<li><code class="inline">\\.</code> is an escaped dot, so it matches a literal period and not "any character".</li>'
    +   '<li><code class="inline">(?:jpg|png|gif)</code> bounds the alternation, so the OR is just between the three extensions, not the whole pattern.</li>'
    + '</ul>'
    + '<p>Without the group, <code class="inline">\\w+\\.jpg|png|gif</code> would mean "(name dot jpg) OR (png) OR (gif)", so the bare word <code class="inline">png</code> anywhere would match. The group keeps the OR local.</p>'
    + '</div>'

    + '<h4>Order matters when branches overlap</h4>'
    + '<p>The engine tries branches left to right and stops at the first one that works at the current position. When you are doing a partial match (not anchored to the whole string) and one branch is a prefix of another, put the longer or more specific branch first.</p>'
    + '<div class="example"><div class="label">Prefix overlap</div>'
    + 'On the text <code class="inline">github</code>, the pattern <code class="inline">git|github</code> matches only <code class="inline">git</code>, because the left branch succeeds first and the engine is satisfied. If you wanted the whole word, write <code class="inline">github|git</code> (longer first) or anchor with <code class="inline">\\b</code>. This rarely matters when you anchor the whole string, but it surprises people doing find-all.'
    + '</div>'

    + '<h4>Pairing alternation with word boundaries</h4>'
    + '<p>The Play tester below uses <code class="inline">\\b(?:cat|dog|bird)\\b</code>. The <code class="inline">\\b</code> is a word boundary, the zero-width spot between a word character and a non-word character. Wrapping the alternation in <code class="inline">\\b...\\b</code> matches those words as standalone words, so <code class="inline">category</code> does not light up even though it starts with <code class="inline">cat</code>. Try deleting the boundaries to watch <code class="inline">category</code> get partially matched.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">The seeded pattern matches the words cat, dog, or bird as whole words. Try removing the <code class="inline">\\b</code> boundaries to see "category" get a partial match, or change the branches.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '\\b(?:cat|dog|bird)\\b',
      flags: 'g',
      text: 'a cat, a dog, a bird, and a category.\n'
          + 'GET /index.html and POST /login were the two requests.\n'
          + 'files: photo.png, logo.jpg, banner.gif, notes.txt',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 4,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'HTTP methods. Write a pattern that matches exactly <code class="inline">GET</code> or exactly <code class="inline">POST</code> (the whole string is one of those two words).',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: GET|POST',
          flagToggles: [],
          previewList: [
            { label: 'GET', text: 'GET' },
            { label: 'POST', text: 'POST' },
            { label: 'PUT', text: 'PUT' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var get = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'GET');
          var post = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'POST');
          var put = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'PUT');
          if (get && post && !put) {
            return { correct: true, feedback: 'Right. <code class="inline">GET|POST</code> means "GET OR POST". The pipe is the OR operator, and here it is the only thing in the pattern so it cleanly splits the two words.' };
          }
          if (get && post && put) return { correct: false, feedback: 'It also matches PUT, so it is too loose. List only the two words you want, joined with a pipe.' };
          if (!get && !post) return { correct: false, feedback: 'It matches neither GET nor POST. Use the pipe to offer both: GET on one side, POST on the other.' };
          return { correct: false, feedback: 'It matches one of the two but not both. The pattern should accept GET and accept POST. Join them with <code class="inline">|</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'The pipe character | means OR. You want one word OR the other.',
        'Put the first word, then |, then the second word.',
        'The answer is: GET|POST'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Image filenames. Write a pattern that matches one or more word characters, then a literal dot, then one of the extensions <code class="inline">jpg</code>, <code class="inline">png</code>, or <code class="inline">gif</code> (the whole string is a valid image filename).',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'name . one-of(jpg/png/gif)',
          flagToggles: [],
          previewList: [
            { label: 'photo.png', text: 'photo.png' },
            { label: 'logo.jpg', text: 'logo.jpg' },
            { label: 'photo.bmp', text: 'photo.bmp' },
            { label: 'photo.', text: 'photo.' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var png = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'photo.png');
          var jpg = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'logo.jpg');
          var gif = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'art.gif');
          var bmp = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'photo.bmp');
          var bare = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'photo.');
          if (png && jpg && gif && !bmp && !bare) {
            return { correct: true, feedback: 'Right. Something like <code class="inline">\\w+\\.(?:jpg|png|gif)</code> works. The non-capturing group <code class="inline">(?:...)</code> bounds the alternation so the OR is only between the three extensions, not the whole pattern.' };
          }
          if (bmp) return { correct: false, feedback: 'It accepts photo.bmp, so the extension part is too loose. List only jpg, png, and gif as the alternatives.' };
          if (bare) return { correct: false, feedback: 'It accepts "photo." with no extension. You need an extension after the dot. Did you make the extension optional or leave the OR un-grouped?' };
          if (!png || !jpg || !gif) return { correct: false, feedback: 'It should accept all three of photo.png, logo.jpg, and art.gif. Check that you wrote <code class="inline">\\w+</code> for the name, an escaped dot <code class="inline">\\.</code>, then the three extensions joined with pipes.' };
          return { correct: false, feedback: 'Not quite. Aim for name, escaped dot, then one of jpg/png/gif.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Build it in three parts: \\w+ for the name, \\. for the literal dot, then the extension choice.',
        'For the extension, bound the alternation in a group so the OR does not leak: (?:jpg|png|gif).',
        'The answer is: \\w+\\.(?:jpg|png|gif)'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Validate a confirmation answer. Write a pattern so that the ENTIRE input must be exactly <code class="inline">yes</code> or exactly <code class="inline">no</code>, and nothing more. <br><span class="muted">Watch the precedence trap: a naive <code class="inline">^yes|no$</code> wrongly accepts <code class="inline">yesterday</code> (it only requires the start to be "yes"), and a bare <code class="inline">yes|no</code> with no anchors even matches <code class="inline">say no please</code>.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'whole string is yes or no',
          flagToggles: [],
          previewList: [
            { label: 'yes', text: 'yes' },
            { label: 'no', text: 'no' },
            { label: 'say no please', text: 'say no please' },
            { label: 'yesterday', text: 'yesterday' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var yes = RXT.lib.rx.test(v.pattern, v.flags, 'yes');
          var no = RXT.lib.rx.test(v.pattern, v.flags, 'no');
          var sentence = RXT.lib.rx.test(v.pattern, v.flags, 'say no please');
          var yesterday = RXT.lib.rx.test(v.pattern, v.flags, 'yesterday');
          if (yes && no && !sentence && !yesterday) {
            return { correct: true, feedback: 'Right. You grouped the alternation: <code class="inline">^(?:yes|no)$</code>. The anchors now apply to the whole group, so the entire string must be yes or no. The naive <code class="inline">^yes|no$</code> splits into "starts with yes" OR "ends with no", which is why it leaked.' };
          }
          if (yes && no && (sentence || yesterday)) {
            var leaks = [];
            if (sentence) leaks.push('"say no please"');
            if (yesterday) leaks.push('"yesterday"');
            return { correct: false, feedback: 'This is the precedence bug. Your pattern also matches ' + leaks.join(' and ') + '. The pipe split your anchors apart. Wrap the OR in a group so <code class="inline">^</code> and <code class="inline">$</code> bound the whole thing: <code class="inline">^(?:...)$</code>.' };
          }
          if (!yes || !no) return { correct: false, feedback: 'It should accept both yes and no. Offer both with a pipe, and anchor the whole string with <code class="inline">^</code> and <code class="inline">$</code>.' };
          return { correct: false, feedback: 'Not quite. The whole input must be yes or no. Anchor at both ends and group the alternation.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You need both anchors, ^ at the start and $ at the end, plus the yes|no alternation.',
        'If you write ^yes|no$ the pipe splits the whole pattern, so the anchors land on different branches. Bound the OR in a group first.',
        'The answer is: ^(?:yes|no)$  (a capturing ^(yes|no)$ works too)'
      ]
    }
  ]
});
