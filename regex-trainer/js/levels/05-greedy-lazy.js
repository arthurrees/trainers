// Level 5 — Greedy vs Lazy
RXT.registerLevel({
  id: 5,
  title: 'Greedy vs Lazy',
  whyItMatters: 'This is the #1 "why did my regex eat the whole line?" bug. Understanding greedy-then-backtrack is what separates copy-pasting regex from writing your own.',
  glossary: ['*', '+', '?'],
  learn: ''
    + '<h4>Quantifiers are greedy by default</h4>'
    + '<p>You already met the quantifiers <code class="inline">*</code> (zero or more), <code class="inline">+</code> (one or more), and <code class="inline">?</code> (zero or one). What you have NOT been told is how much they try to grab. The answer is: <strong>as much as they possibly can</strong>. This is called being <strong>greedy</strong>.</p>'
    + '<p>A greedy quantifier first swallows everything it is allowed to, then hands characters back one at a time (this giving-back is called <strong>backtracking</strong>) only when it has to, so that the rest of the pattern can still match.</p>'
    + '<div class="callout"><div class="label">Mental model</div>'
    + 'Think of a greedy quantifier as a kid at a buffet. It piles its plate as high as the rules allow, then puts food back one scoop at a time only when the cashier (the rest of the pattern) says "you cannot leave until the line after you also gets fed".'
    + '</div>'

    + '<h4>The classic trap: <code class="inline">&lt;.*&gt;</code></h4>'
    + '<p>Say you want to match an HTML tag like <code class="inline">&lt;b&gt;</code>. The pattern <code class="inline">&lt;.*&gt;</code> reads as "a less-than sign, then any characters (<code class="inline">.*</code>), then a greater-than sign". The <code class="inline">.</code> means "any character" and <code class="inline">*</code> means "zero or more of them".</p>'
    + '<p>On the text <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code> you might expect it to stop at the first <code class="inline">&gt;</code> and match just <code class="inline">&lt;b&gt;</code>. It does not. Here is what actually happens:</p>'
    + '<div class="example"><div class="label">Greedy walk-through: <code class="inline">&lt;.*&gt;</code> on <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code></div>'
    + '<ol>'
    +   '<li><code class="inline">&lt;</code> matches the first <code class="inline">&lt;</code>.</li>'
    +   '<li><code class="inline">.*</code> greedily eats the ENTIRE rest of the string: <code class="inline">b&gt;hi&lt;/b&gt;</code>.</li>'
    +   '<li>Now the pattern still needs a final <code class="inline">&gt;</code>, but we are at the end of the string. Fail.</li>'
    +   '<li>So <code class="inline">.*</code> backtracks: it gives back one character (the last <code class="inline">&gt;</code>) and lets the pattern try again.</li>'
    +   '<li>The final <code class="inline">&gt;</code> in the pattern now matches that last <code class="inline">&gt;</code>. Done. The whole match is <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code>, not <code class="inline">&lt;b&gt;</code>.</li>'
    + '</ol>'
    + '</div>'
    + '<p>This is why a greedy pattern so often "eats the whole line". It grabbed everything, then backed off only as far as it was forced to.</p>'

    + '<h4>Make it lazy with a trailing <code class="inline">?</code></h4>'
    + '<p>Put a <code class="inline">?</code> immediately AFTER a quantifier to make it <strong>lazy</strong> (also called non-greedy or reluctant): <code class="inline">*?</code>, <code class="inline">+?</code>, <code class="inline">??</code>. A lazy quantifier does the opposite: it grabs <strong>as little as possible</strong>, then expands one character at a time only when the rest of the pattern cannot match yet.</p>'
    + '<div class="callout"><div class="label">Two jobs for one symbol</div>'
    + 'The <code class="inline">?</code> you learned earlier means "zero or one". The <code class="inline">?</code> here means "be lazy". They are the same character doing different jobs. Position tells them apart: a <code class="inline">?</code> right after a thing-to-repeat is the quantifier "optional"; a <code class="inline">?</code> right after ANOTHER quantifier (<code class="inline">*</code>, <code class="inline">+</code>, <code class="inline">?</code>, <code class="inline">{n,m}</code>) is the lazy modifier.'
    + '</div>'
    + '<div class="example"><div class="label">Lazy walk-through: <code class="inline">&lt;.*?&gt;</code> on <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code></div>'
    + '<ol>'
    +   '<li><code class="inline">&lt;</code> matches the first <code class="inline">&lt;</code>.</li>'
    +   '<li><code class="inline">.*?</code> grabs nothing at first (lazy starts empty).</li>'
    +   '<li>The pattern needs a <code class="inline">&gt;</code>. The next character is <code class="inline">b</code>, not <code class="inline">&gt;</code>. So <code class="inline">.*?</code> expands by one: it now holds <code class="inline">b</code>.</li>'
    +   '<li>Next character is <code class="inline">&gt;</code>. Match. The whole match is just <code class="inline">&lt;b&gt;</code>.</li>'
    + '</ol>'
    + '</div>'
    + '<p>Same input, same <code class="inline">.</code> and <code class="inline">&gt;</code>, but one tiny <code class="inline">?</code> flips the result from <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code> to <code class="inline">&lt;b&gt;</code>. With the global flag turned on, the lazy version then finds the next tag too, so you get several small matches instead of one big one.</p>'

    + '<h4>Lazy still backtracks, just from the other end</h4>'
    + '<p>Do not think of lazy as "no backtracking". A lazy quantifier still tries every length, it just tries them in the opposite order. Greedy starts big and shrinks. Lazy starts small and grows. Both will explore until the overall pattern matches or runs out of options.</p>'

    + '<h4>The negated-class alternative</h4>'
    + '<p>There is a third way to get tag-by-tag matching, and it is often the best one: instead of "any character" use "any character that is NOT the closing delimiter". The pattern <code class="inline">&lt;[^&gt;]*&gt;</code> reads as "a <code class="inline">&lt;</code>, then zero or more characters that are not <code class="inline">&gt;</code>, then a <code class="inline">&gt;</code>". The <code class="inline">[^&gt;]</code> is a negated character class (you saw <code class="inline">[^...]</code> earlier). It physically cannot cross a <code class="inline">&gt;</code>, so it stops in the right place without relying on laziness.</p>'
    + '<div class="callout"><div class="label">Lazy or negated class?</div>'
    + 'Both <code class="inline">&lt;.*?&gt;</code> and <code class="inline">&lt;[^&gt;]*&gt;</code> match a single tag. The negated class is usually faster and clearer because it never has to backtrack, and it cannot accidentally skip past a delimiter the way a lazy dot sometimes can. Reach for the negated class when there is a clear "stop" character.'
    + '</div>'

    + '<div class="callout"><div class="label">A taste of trouble (Level 13)</div>'
    + 'Greedy matching plus backtracking is mostly harmless, but on certain inputs it can get extremely slow, slow enough to hang a program. That failure mode is called catastrophic backtracking, and it is a real denial-of-service risk. You will see it explode step by step in the performance level.'
    + '</div>'

    + '<p>Below, the tester is seeded with the greedy <code class="inline">&lt;.*&gt;</code> on a line with two tags. Watch it swallow everything between the first <code class="inline">&lt;</code> and the LAST <code class="inline">&gt;</code>. Then add a <code class="inline">?</code> right after the <code class="inline">*</code> to make it <code class="inline">&lt;.*?&gt;</code> and watch the one big match split into the individual tags.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Seeded with the greedy <code class="inline">&lt;.*&gt;</code>. Note how it grabs from the first <code class="inline">&lt;</code> all the way to the LAST <code class="inline">&gt;</code> (one big match). Now add a <code class="inline">?</code> after the <code class="inline">*</code> so it reads <code class="inline">&lt;.*?&gt;</code> and watch it become several small matches, one per tag. Try the negated-class version <code class="inline">&lt;[^&gt;]*&gt;</code> too.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '<.*>',
      flags: 'g',
      text: '<b>bold</b> and <i>italic</i> tags.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: false
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'On the text <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code>, what does the greedy pattern <code class="inline">&lt;.*&gt;</code> match?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">pick one...</option>'
          + '<option value="0">&lt;b&gt;</option>'
          + '<option value="1">&lt;b&gt;hi&lt;/b&gt;</option>'
          + '<option value="2">b</option>'
          + '<option value="3">nothing (no match)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '') return { correct: false, feedback: 'Pick an option first.' };
        if (v === '1') return { correct: true, feedback: 'Right. <code class="inline">.*</code> is greedy, so it eats everything after the first <code class="inline">&lt;</code>, then backtracks just enough to leave one final <code class="inline">&gt;</code> for the pattern. The match spans from the first <code class="inline">&lt;</code> to the LAST <code class="inline">&gt;</code>: the whole string.' };
        if (v === '0') return { correct: false, feedback: 'That is what the LAZY version <code class="inline">&lt;.*?&gt;</code> would match. The greedy <code class="inline">&lt;.*&gt;</code> grabs as much as it can, so it runs to the last <code class="inline">&gt;</code>.' };
        if (v === '2') return { correct: false, feedback: 'No. The pattern starts with a literal <code class="inline">&lt;</code> and ends with a literal <code class="inline">&gt;</code>, so the match must include both angle brackets.' };
        return { correct: false, feedback: 'It does match. <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code> begins with <code class="inline">&lt;</code> and ends with <code class="inline">&gt;</code>, and <code class="inline">.*</code> happily fills the middle.' };
      },
      hints: [
        'Greedy means "grab as much as possible, then give back only what you must".',
        'After eating everything, the pattern still needs a final <code class="inline">&gt;</code>, so it backtracks to the LAST <code class="inline">&gt;</code> in the string, not the first.',
        'The greedy match runs from the first <code class="inline">&lt;</code> to the last <code class="inline">&gt;</code>: the entire <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code>.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Write a pattern that matches a single tag, so that the FIRST match on <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code> is just <code class="inline">&lt;b&gt;</code> (not the whole string). Use a lazy quantifier or a negated class.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'match one tag, e.g. <.*?>',
          flagToggles: ['g'],
          previewText: '<b>hi</b>'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ms = RXT.lib.rx.matches(v.pattern, v.flags, '<b>hi</b>');
          if (!ms.length) return { correct: false, feedback: 'That pattern matches nothing on <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code>. You need a <code class="inline">&lt;</code>, then some characters, then a <code class="inline">&gt;</code>.' };
          var first = ms[0].text;
          if (first === '<b>') return { correct: true, feedback: 'Exactly. The first match is just <code class="inline">&lt;b&gt;</code>. A lazy <code class="inline">&lt;.*?&gt;</code> stops at the first <code class="inline">&gt;</code>, and a negated class <code class="inline">&lt;[^&gt;]*&gt;</code> physically cannot cross a <code class="inline">&gt;</code>. Either way you stop at the right place.' };
          if (first === '<b>hi</b>') return { correct: false, feedback: 'Your first match is the whole string <code class="inline">&lt;b&gt;hi&lt;/b&gt;</code>, which is the greedy behavior. Add a <code class="inline">?</code> after the <code class="inline">*</code> to make it lazy, or use <code class="inline">&lt;[^&gt;]*&gt;</code>.' };
          return { correct: false, feedback: 'The first match was <code class="inline">' + RXT.escapeHtml(first) + '</code>, not <code class="inline">&lt;b&gt;</code>. Aim for exactly the opening tag.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A greedy <code class="inline">&lt;.*&gt;</code> grabs too much. You want the SMALLEST match that starts with <code class="inline">&lt;</code> and ends with <code class="inline">&gt;</code>.',
        'Put a <code class="inline">?</code> right after the <code class="inline">*</code> to make it lazy, or replace <code class="inline">.</code> with the negated class <code class="inline">[^&gt;]</code>.',
        'The answer is <code class="inline">&lt;.*?&gt;</code> (lazy) or equivalently <code class="inline">&lt;[^&gt;]*&gt;</code> (negated class).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'On the text <code class="inline">a="1" b="2"</code>, match each quoted value separately so there are exactly TWO matches: <code class="inline">"1"</code> and <code class="inline">"2"</code>. A greedy pattern will grab one big chunk instead.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'two matches: "1" and "2"',
          flagToggles: ['g'],
          previewText: 'a="1" b="2"'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ms = RXT.lib.rx.matches(v.pattern, v.flags, 'a="1" b="2"');
          if (ms.length === 2 && ms[0].text === '"1"' && ms[1].text === '"2"') {
            return { correct: true, feedback: 'Perfect. Two separate matches, <code class="inline">"1"</code> and <code class="inline">"2"</code>. A lazy <code class="inline">".*?"</code> stops at the first closing quote, and the negated-class <code class="inline">"[^"]*"</code> cannot cross a quote, so neither one spans the gap between the two values.' };
          }
          if (ms.length === 1) {
            return { correct: false, feedback: 'You got 1 match (<code class="inline">' + RXT.escapeHtml(ms[0].text) + '</code>), which means the quantifier is greedy and spanned from the first quote to the LAST quote. Make it lazy with <code class="inline">".*?"</code> or use <code class="inline">"[^"]*"</code>.' };
          }
          if (!ms.length) {
            return { correct: false, feedback: 'No matches. You need a literal quote <code class="inline">"</code>, then the value, then another <code class="inline">"</code>.' };
          }
          var got = ms.map(function (m) { return m.text; }).join(', ');
          return { correct: false, feedback: 'Got ' + ms.length + ' matches (' + RXT.escapeHtml(got) + '). Aim for exactly two: <code class="inline">"1"</code> and <code class="inline">"2"</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'The greedy <code class="inline">".*"</code> matches from the very first <code class="inline">"</code> to the very last <code class="inline">"</code>: one match covering <code class="inline">"1" b="2"</code>.',
        'You want each match to stop at its OWN closing quote. Make the <code class="inline">*</code> lazy, or use a class that cannot contain a quote.',
        'The answer is <code class="inline">".*?"</code> (lazy) or equivalently <code class="inline">"[^"]*"</code> (negated class), with the global flag on.'
      ]
    }
  ]
});
