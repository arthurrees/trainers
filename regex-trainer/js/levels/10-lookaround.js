// Level 10 — Lookahead & Lookbehind
RXT.registerLevel({
  id: 10,
  title: 'Lookahead & Lookbehind',
  whyItMatters: 'Lookarounds let you match on CONTEXT without consuming it, so you can grab "the number before px", "the digits after a $", or enforce a multi-rule password policy in a single pattern.',
  glossary: ['(?= )', '(?! )', '(?<= )', '(?<! )', '\\d'],
  learn: ''
    + '<h4>Matching by context, without eating it</h4>'
    + '<p>Everything so far has <em>consumed</em> the characters it matched. A <code class="inline">\\d+</code> that matches <code class="inline">12</code> moves the engine past those two digits and includes them in the result. A <strong>lookaround</strong> is different. It is a <strong>zero-width assertion</strong>: it checks whether some pattern is (or is not) just ahead of or just behind the current position, and then throws that check away without moving forward or adding anything to the match.</p>'
    + '<p>Think of it like a programming guard clause. <code class="inline">if (nextThing === "px") { ... }</code> inspects what is next but does not advance the cursor. The match is decided by the condition, the condition is not part of the output.</p>'
    + '<div class="callout"><div class="label">Zero-width, like an anchor</div>'
    + 'You already met zero-width things: <code class="inline">^</code>, <code class="inline">$</code>, and <code class="inline">\\b</code> match a <em>position</em>, not a character. Lookarounds are the same idea, except instead of "start of line" or "word boundary" you get to write your own condition: any sub-pattern you like.'
    + '</div>'

    + '<h4>Lookahead: (?= ) and (?! )</h4>'
    + '<p>A <strong>lookahead</strong> sits at a position and tests the text <em>to its right</em>.</p>'
    + '<ul>'
    +   '<li><code class="inline">(?=...)</code> &mdash; <strong>positive lookahead</strong>: "the next thing IS ...". Succeeds if the inside pattern matches starting here.</li>'
    +   '<li><code class="inline">(?!...)</code> &mdash; <strong>negative lookahead</strong>: "the next thing is NOT ...". Succeeds if the inside pattern does NOT match here.</li>'
    + '</ul>'
    + '<div class="example"><div class="label">A number followed by px</div>'
    + 'The pattern <code class="inline">\\d+(?=px)</code> reads as "one or more digits, but only if <code class="inline">px</code> comes right after". On the text <code class="inline">width 12px</code> it matches just <code class="inline">12</code>. The <code class="inline">px</code> is checked but left out of the match, so the highlighted result is <code class="inline">12</code>, not <code class="inline">12px</code>.'
    + '</div>'
    + '<div class="example"><div class="label">A q NOT followed by u</div>'
    + 'The pattern <code class="inline">q(?!u)</code> matches a <code class="inline">q</code> only when no <code class="inline">u</code> follows. It matches the <code class="inline">q</code> in <code class="inline">Iraq</code> and <code class="inline">qatar</code> but skips the <code class="inline">q</code> in <code class="inline">queue</code>. The <code class="inline">(?!u)</code> consumes nothing, it just vetoes the match when a <code class="inline">u</code> is next.'
    + '</div>'

    + '<h4>Lookbehind: (?&lt;= ) and (?&lt;! )</h4>'
    + '<p>A <strong>lookbehind</strong> tests the text <em>to the left</em> of the current position. Same two flavors, with a <code class="inline">&lt;</code> added to mean "behind".</p>'
    + '<ul>'
    +   '<li><code class="inline">(?&lt;=...)</code> &mdash; <strong>positive lookbehind</strong>: "the thing just before IS ...".</li>'
    +   '<li><code class="inline">(?&lt;!...)</code> &mdash; <strong>negative lookbehind</strong>: "the thing just before is NOT ...".</li>'
    + '</ul>'
    + '<div class="example"><div class="label">Digits after a dollar sign</div>'
    + 'The pattern <code class="inline">(?&lt;=\\$)\\d+</code> matches one or more digits, but only when a <code class="inline">$</code> sits right before them. (The <code class="inline">\\$</code> is an escaped dollar sign, because <code class="inline">$</code> is otherwise the "end" anchor.) On <code class="inline">price $50 today</code> it matches <code class="inline">50</code> and leaves the <code class="inline">$</code> out. A bare <code class="inline">50</code> elsewhere in the text would NOT match, because nothing precedes it with a <code class="inline">$</code>.'
    + '</div>'
    + '<div class="callout"><div class="label">Lookbehind is real in JavaScript</div>'
    + 'Lookbehind was the last lookaround to arrive. JavaScript has supported it since ES2018, so every modern browser runs it (this trainer included). A few older or smaller engines still lack it, which is the one portability gotcha worth remembering.'
    + '</div>'

    + '<h4>Stacking lookaheads for a policy check</h4>'
    + '<p>Because a lookahead consumes nothing, you can place several in a row and they all test from the SAME position. Each one is an independent rule that must hold. This is the idiom behind password and validation checks.</p>'
    + '<div class="example"><div class="label">At least 8 chars, with a digit and a lowercase letter</div>'
    + '<code class="inline">^(?=.*\\d)(?=.*[a-z]).{8,}$</code><br>'
    + 'Read it left to right from the start of the string (<code class="inline">^</code>):'
    + '<ul>'
    +   '<li><code class="inline">(?=.*\\d)</code> &mdash; somewhere ahead there is a digit. (<code class="inline">.*</code> skips any characters, then <code class="inline">\\d</code> requires a digit.)</li>'
    +   '<li><code class="inline">(?=.*[a-z])</code> &mdash; somewhere ahead there is a lowercase letter.</li>'
    +   '<li><code class="inline">.{8,}$</code> &mdash; and the actual string is at least 8 characters long, all the way to the end (<code class="inline">$</code>).</li>'
    + '</ul>'
    + 'The two lookaheads are guards that never move the cursor. Only <code class="inline">.{8,}</code> does the consuming. Add <code class="inline">(?=.*[A-Z])</code> to also demand an uppercase letter, and so on. Each rule is one more lookahead.'
    + '</div>'
    + '<div class="callout"><div class="label">Why this is hard to do without lookahead</div>'
    + 'Without lookaheads you would need to spell out every ordering of digit, letter, and length, because a plain pattern consumes as it goes and cannot say "this and that, in any order". Stacked lookaheads check several conditions against the same spot, which is exactly what an unordered rule set needs.'
    + '</div>'

    + '<h4>The mental model</h4>'
    + '<p>A lookaround answers a yes/no question about the neighborhood and then steps back to where it started. Positive means "must be there", negative means "must not be there", ahead looks right, behind looks left. The characters it inspects are never part of the match, which is the whole point: you match a thing <em>because of</em> its context, not the context itself.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">The pattern <code class="inline">\\d+(?=px)</code> matches a number only when <code class="inline">px</code> follows. Notice the <code class="inline">px</code> itself is NOT highlighted: the lookahead checks it but does not consume it. Try <code class="inline">\\d+(?=em)</code>, or a lookbehind like <code class="inline">(?&lt;=top )\\d+</code>.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '\\d+(?=px)',
      flags: 'g',
      text: 'width 12px, height 8em, top 30px, z 5.\n'
          + 'margin 4px and padding 16px but font 14pt.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Match a number that is immediately followed by <code class="inline">px</code>, <strong>without</strong> including the <code class="inline">px</code> in the match. On <code class="inline">12px 8em 30px</code> the two matches should be <code class="inline">12</code> and <code class="inline">30</code>.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'digits followed by px',
          flagToggles: ['i'],
          previewText: '12px 8em 30px'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ms = RXT.lib.rx.matches(v.pattern, v.flags, '12px 8em 30px');
          if (ms.length === 2 && ms[0].text === '12' && ms[1].text === '30') {
            return { correct: true, feedback: 'Right. <code class="inline">\\d+(?=px)</code> grabs the digits, and the <code class="inline">(?=px)</code> lookahead checks that "px" follows without making it part of the match. The 8 is skipped because "em" follows, not "px".' };
          }
          if (ms.length === 2 && ms[0].text === '12px' && ms[1].text === '30px') {
            return { correct: false, feedback: 'Close, but you included the <code class="inline">px</code> in the match. Put <code class="inline">px</code> inside a lookahead <code class="inline">(?=px)</code> so it is checked but not consumed.' };
          }
          if (ms.length === 0) {
            return { correct: false, feedback: 'No matches. You want <code class="inline">\\d+</code> for the digits, then a lookahead <code class="inline">(?=px)</code> for the part that must follow.' };
          }
          return { correct: false, feedback: 'Not quite. Aim for exactly two matches, <code class="inline">12</code> and <code class="inline">30</code> (the 8 has "em" after it, so it should not match).' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A lookahead checks what follows without consuming it. The shape is X(?=Y): match X only when Y comes next.',
        'X is the digits: \\d+. Y is the literal text that must follow: px.',
        'The answer is: \\d+(?=px)'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Match the digits that come right after a <code class="inline">$</code>, <strong>without</strong> including the <code class="inline">$</code>. On <code class="inline">$50 plus 50 cents and $7</code> the matches should be <code class="inline">50</code> and <code class="inline">7</code> only. The standalone <code class="inline">50</code> (no <code class="inline">$</code> before it) must be excluded.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'digits preceded by a $',
          flagToggles: ['i'],
          previewText: '$50 plus 50 cents and $7'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ms = RXT.lib.rx.matches(v.pattern, v.flags, '$50 plus 50 cents and $7');
          if (ms.length === 2 && ms[0].text === '50' && ms[1].text === '7') {
            return { correct: true, feedback: 'Right. <code class="inline">(?&lt;=\\$)\\d+</code> looks behind for a <code class="inline">$</code>, then matches the digits. The lone <code class="inline">50</code> in the middle has a space before it, so the lookbehind fails and it is skipped.' };
          }
          if (ms.length === 3) {
            return { correct: false, feedback: 'You matched all three numbers, including the standalone 50. Add a lookbehind <code class="inline">(?&lt;=\\$)</code> so only digits with a <code class="inline">$</code> right before them count. Remember to escape the dollar sign as <code class="inline">\\$</code>.' };
          }
          if (ms.length === 2 && (ms[0].text === '$50' || ms[1].text === '$7')) {
            return { correct: false, feedback: 'You included the <code class="inline">$</code> in the match. Use a lookbehind <code class="inline">(?&lt;=\\$)</code> instead of consuming the dollar sign, so only the digits are matched.' };
          }
          return { correct: false, feedback: 'Not quite. Aim for exactly two matches, <code class="inline">50</code> and <code class="inline">7</code>, with the <code class="inline">$</code> checked by a lookbehind but left out.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A lookbehind tests what comes BEFORE the current spot. The shape is (?<=Y)X: match X only when Y precedes it.',
        'Y is a literal dollar sign, which is special, so escape it: \\$. X is the digits: \\d+.',
        'The answer is: (?<=\\$)\\d+'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Write a password rule: the whole string must be <strong>at least 8 characters</strong>, contain <strong>at least one digit</strong>, and contain <strong>at least one lowercase letter</strong>. Accept <code class="inline">abcdefg1</code> and <code class="inline">password1</code>. Reject <code class="inline">abcdefgh</code> (no digit), <code class="inline">ABCDEFG1</code> (no lowercase), and <code class="inline">abc1</code> (too short).',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'stacked lookaheads + length',
          flagToggles: ['i', 'm', 's'],
          previewList: [
            { label: 'abcdefg1 (ok)', text: 'abcdefg1' },
            { label: 'password1 (ok)', text: 'password1' },
            { label: 'abcdefgh (no digit)', text: 'abcdefgh' },
            { label: 'ABCDEFG1 (no lower)', text: 'ABCDEFG1' },
            { label: 'abc1 (too short)', text: 'abc1' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ok1 = RXT.lib.rx.test(v.pattern, v.flags, 'abcdefg1');
          var ok2 = RXT.lib.rx.test(v.pattern, v.flags, 'password1');
          var noDigit = RXT.lib.rx.test(v.pattern, v.flags, 'abcdefgh');
          var noLower = RXT.lib.rx.test(v.pattern, v.flags, 'ABCDEFG1');
          var tooShort = RXT.lib.rx.test(v.pattern, v.flags, 'abc1');
          if (ok1 && ok2 && !noDigit && !noLower && !tooShort) {
            return { correct: true, feedback: 'Right. <code class="inline">^(?=.*\\d)(?=.*[a-z]).{8,}$</code> uses two stacked lookaheads as independent rules (a digit exists, a lowercase letter exists), then <code class="inline">.{8,}</code> enforces the length. Each lookahead checks from the start and consumes nothing.' };
          }
          if (noLower && v.flags && v.flags.indexOf('i') !== -1) {
            return { correct: false, feedback: 'The i flag makes <code class="inline">[a-z]</code> match uppercase too, so <code class="inline">ABCDEFG1</code> wrongly passes. Turn the i flag OFF, the rule needs a real lowercase letter.' };
          }
          if (!ok1 || !ok2) {
            return { correct: false, feedback: 'You are rejecting a valid password. You need two lookaheads from the start: <code class="inline">(?=.*\\d)</code> for a digit and <code class="inline">(?=.*[a-z])</code> for a lowercase letter, then <code class="inline">.{8,}</code> for length. Anchor with <code class="inline">^</code> and <code class="inline">$</code>.' };
          }
          if (noDigit) return { correct: false, feedback: 'You accepted <code class="inline">abcdefgh</code>, which has no digit. Add the lookahead <code class="inline">(?=.*\\d)</code>.' };
          if (noLower) return { correct: false, feedback: 'You accepted <code class="inline">ABCDEFG1</code>, which has no lowercase letter. Add the lookahead <code class="inline">(?=.*[a-z])</code> (and keep the i flag off).' };
          if (tooShort) return { correct: false, feedback: 'You accepted <code class="inline">abc1</code>, which is only 4 characters. Enforce the length with <code class="inline">.{8,}</code> and anchor both ends.' };
          return { correct: false, feedback: 'Not quite. Combine two stacked lookaheads with a length rule, anchored at both ends.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Each rule is its own lookahead at the start of the string. Because lookaheads consume nothing, you can place several in a row and they all test from the same spot.',
        '(?=.*\\d) means "a digit somewhere ahead". (?=.*[a-z]) means "a lowercase letter somewhere ahead". After the lookaheads, .{8,} matches at least 8 characters. Wrap the whole thing in ^...$.',
        'The answer is: ^(?=.*\\d)(?=.*[a-z]).{8,}$  (keep the i flag off)'
      ]
    }
  ]
});
