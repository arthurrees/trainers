// Level 13 — Performance & Catastrophic Backtracking
RXT.registerLevel({
  id: 13,
  title: 'Performance & Catastrophic Backtracking',
  whyItMatters: 'A careless regex run on untrusted input can hang a server for seconds or minutes (a real denial-of-service class called ReDoS), so recognizing the shape of a dangerous pattern and knowing how to rewrite it is a security skill.',
  glossary: ['*', '+', '( )', '(?: )'],
  learn: ''
    + '<h4>Regex can be slow. Sometimes catastrophically slow.</h4>'
    + '<p>Until now we have only asked "does this match?" In this level we ask "how much WORK did the engine do to decide?" For almost every pattern the answer is "a little, and it scales smoothly with the length of the text." But a small family of patterns can do an amount of work that <strong>doubles every time you add one character</strong>. On a few dozen characters of the wrong input, that means billions of steps and a frozen program.</p>'
    + '<p>This is not a theoretical curiosity. A regex like this sitting in a web server, fed a hand-crafted string by an attacker, is a denial-of-service bug with its own name: <strong>ReDoS</strong> (Regular-expression Denial of Service). Real outages at large companies have been traced to one bad regex.</p>'

    + '<h4>Recap: greedy quantifiers backtrack</h4>'
    + '<p>Remember from the greedy/lazy level that <code class="inline">*</code> (zero or more) and <code class="inline">+</code> (one or more) are <strong>greedy</strong>. They grab as much as they can, then if the rest of the pattern cannot match, they hand characters back one at a time and retry. That handing-back-and-retrying is <strong>backtracking</strong>.</p>'
    + '<p>For a simple pattern this is cheap. Consider <code class="inline">a+b</code> (one or more <code class="inline">a</code> characters, then a <code class="inline">b</code>) run against <code class="inline">aaaa</code> (four a\'s, no b). The <code class="inline">a+</code> eats all four a\'s, fails to find a <code class="inline">b</code>, backs off to three a\'s, fails again, and so on down to one. That is a handful of attempts. The work grows <em>linearly</em> with the number of a\'s.</p>'
    + '<div class="example"><div class="label">Linear is fine</div>'
    + '<code class="inline">a+b</code> on <code class="inline">aaaaaaaa</code> (eight a\'s, no b): roughly 8 ways for the <code class="inline">a+</code> to give back characters. Double the a\'s and you roughly double the attempts. That is what "linear time" means, and it is the behavior you want.'
    + '</div>'

    + '<h4>The trap: a quantifier inside a quantifier</h4>'
    + '<p>The danger appears when you put a repetition <em>inside</em> another repetition. The classic shape is <code class="inline">(a+)+b</code>: a group that matches one-or-more a\'s, and that whole group is itself repeated one-or-more times, then a <code class="inline">b</code>.</p>'
    + '<p>To a human, <code class="inline">(a+)+</code> looks like a clumsy way to write "some a\'s." And on text that MATCHES it is fine. The problem is text that <strong>almost matches and then fails at the very end</strong>. Take <code class="inline">aaaaaaaaaaaaaaaaaaaaaaaa</code> (a long run of a\'s with no trailing <code class="inline">b</code>). Now the engine has two nested ways to slice up that run of a\'s:</p>'
    + '<ul>'
    +   '<li>the inner <code class="inline">a+</code> can take any number of a\'s, AND</li>'
    +   '<li>the outer <code class="inline">+</code> can repeat the group any number of times.</li>'
    + '</ul>'
    + '<p>For a run of <em>n</em> a\'s there are exponentially many ways to partition it (think of every way to split a row of n items into groups). Because the final <code class="inline">b</code> never matches, the engine is forced to try <strong>all of them</strong> before giving up. The number of attempts is roughly 2 to the power of n. At n = 30 that is over a billion.</p>'
    + '<div class="callout"><div class="label">The recipe for catastrophic backtracking</div>'
    + 'You need both halves: (1) <strong>nested or overlapping quantifiers</strong> over the same characters (like <code class="inline">(a+)+</code>, <code class="inline">(a*)*</code>, <code class="inline">(.*)*</code>, or alternations that overlap such as <code class="inline">(a|a)+</code>), and (2) an input that produces a <strong>long run the pattern can chew on, then a failure at the end</strong>. Matching input stays fast; it is the near-miss that explodes.'
    + '</div>'
    + '<p>The Play surface below lets you watch this happen. Pick <code class="inline">a+b</code> versus <code class="inline">(a+)+b</code>, slide the number of a\'s up, and compare the step counts. The safe pattern climbs gently. The nested one runs off the chart, then hits a safety cap.</p>'

    + '<h4>How to fix a dangerous pattern</h4>'
    + '<p>Once you can spot the shape, the fixes are mechanical.</p>'
    + '<p><strong>1. Do not nest quantifiers over the same characters.</strong> If you wrote <code class="inline">(a+)+</code>, you almost always meant just <code class="inline">a+</code>. Collapse it. A single quantifier over a character cannot blow up.</p>'
    + '<p><strong>2. Replace a greedy dot inside delimiters with a negated class.</strong> The pattern <code class="inline">".*"</code> (a quote, greedy anything, a quote) is a common offender because the <code class="inline">.*</code> can overlap with the surrounding text in many ways. Write <code class="inline">"[^"]*"</code> instead. The class <code class="inline">[^"]</code> means "any character that is NOT a quote", so the repetition can only go up to the next quote and there is exactly one way to do that. No ambiguity, no backtracking blow-up.</p>'
    + '<div class="example"><div class="label">Same intent, very different cost</div>'
    + '<code class="inline">".*"</code> &rarr; ambiguous, can backtrack badly on adversarial input.<br>'
    + '<code class="inline">"[^"]*"</code> &rarr; unambiguous, linear, matches exactly one quoted run. Always prefer the negated class for "everything between two delimiters".'
    + '</div>'
    + '<p><strong>3. Anchor the pattern.</strong> Adding <code class="inline">^</code> and <code class="inline">$</code> can cut off failed retries early because the engine cannot keep sliding the match to a new start position.</p>'

    + '<h4>Tools other engines have (and JavaScript does not)</h4>'
    + '<p>Some regex flavors give you a way to tell a quantifier "once you have matched this, never give the characters back." That kills the backtracking explosion outright.</p>'
    + '<ul>'
    +   '<li><strong>Atomic groups</strong> <code class="inline">(?&gt;...)</code> and <strong>possessive quantifiers</strong> <code class="inline">a++</code>, <code class="inline">a*+</code> exist in PCRE (Perl, PHP), Java, and .NET. They do not backtrack into the group.</li>'
    +   '<li><strong>JavaScript supports NEITHER.</strong> If you copy a possessive-quantifier pattern from a Java answer on Stack Overflow into JS, it will throw a syntax error or silently mean something else. In JS you fix ReDoS by restructuring the pattern (negated classes, no nesting), not with possessive syntax.</li>'
    +   '<li><strong>Go\'s RE2</strong> (also used by RE2 bindings in other languages) takes a different approach entirely: it uses a non-backtracking automaton and <em>guarantees</em> linear time. The tradeoff is that RE2 drops backreferences and lookarounds, which need backtracking. If you must run untrusted patterns or untrusted input, a non-backtracking engine is the safest choice.</li>'
    + '</ul>'
    + '<div class="callout"><div class="label">Practical rule of thumb</div>'
    + 'Before you ship a regex that runs on user-supplied input, scan it for a quantifier inside a group that is itself quantified, and for <code class="inline">.*</code> or <code class="inline">.+</code> sitting between two delimiters. Those two shapes cover the large majority of real ReDoS bugs. When in doubt, test your pattern against a long failing input and watch the clock.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '';

    var intro = document.createElement('p');
    intro.className = 'muted';
    intro.innerHTML = 'Pick a pattern, slide the number of <code class="inline">a</code> characters in the test text (there is NO trailing <code class="inline">b</code>, so the match always fails at the end), and watch how many steps the engine takes. The safe pattern grows in a straight line. The nested one explodes, then slams into a safety cap. The bottom row always shows the safe <code class="inline">a+b</code> for comparison.';
    container.appendChild(intro);

    var SAFETY_CAP = 5000000;

    // Pattern picker
    var ctrlRow = document.createElement('div');
    ctrlRow.className = 'rx-pattern-row';
    ctrlRow.style.flexWrap = 'wrap';
    ctrlRow.style.alignItems = 'center';

    var patLabel = document.createElement('label');
    patLabel.textContent = 'Pattern: ';
    patLabel.style.marginRight = '6px';
    var sel = document.createElement('select');
    sel.innerHTML = ''
      + '<option value="a+b">a+b   (safe, linear)</option>'
      + '<option value="(a+)+b">(a+)+b   (nested, catastrophic)</option>'
      + '<option value="(a+)+c">(a+)+c   (nested, catastrophic)</option>';
    patLabel.appendChild(sel);
    ctrlRow.appendChild(patLabel);

    var nLabel = document.createElement('label');
    nLabel.style.marginLeft = '16px';
    nLabel.textContent = "number of a's: ";
    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '28';
    slider.value = '12';
    slider.style.verticalAlign = 'middle';
    var nReadout = document.createElement('span');
    nReadout.className = 'rx-count';
    nReadout.style.marginLeft = '8px';
    nReadout.textContent = '12';
    nLabel.appendChild(slider);
    nLabel.appendChild(nReadout);
    ctrlRow.appendChild(nLabel);

    container.appendChild(ctrlRow);

    var bars = document.createElement('div');
    bars.className = 'rx-bars';
    container.appendChild(bars);

    var note = document.createElement('div');
    note.className = 'rx-status';
    container.appendChild(note);

    function repeatA(n) {
      var s = '';
      for (var i = 0; i < n; i++) s += 'a';
      return s;
    }

    function measure(pattern, text) {
      try {
        return RXT.lib.rx.backtrackSteps(pattern, text);
      } catch (e) {
        return { error: e.message };
      }
    }

    function barRow(label, res, maxSteps) {
      var pct = 0;
      var valTxt = '';
      if (res.error) {
        valTxt = 'error';
      } else {
        pct = maxSteps > 0 ? Math.min(100, Math.round((res.steps / maxSteps) * 100)) : 0;
        if (pct < 2 && res.steps > 0) pct = 2;
        valTxt = res.steps.toLocaleString() + ' step' + (res.steps === 1 ? '' : 's');
        if (res.blown) valTxt += ' (capped)';
      }
      var html = '<div class="rx-bar-row">'
        + '<span class="rx-bar-label">' + RXT.escapeHtml(label) + '</span>'
        + '<span class="rx-bar-track"><span class="rx-bar-fill" style="width:' + pct + '%"></span></span>'
        + '<span class="rx-bar-val">' + RXT.escapeHtml(valTxt) + '</span>'
        + '</div>';
      return html;
    }

    function render() {
      var n = parseInt(slider.value, 10);
      nReadout.textContent = String(n);
      var text = repeatA(n);
      var chosen = sel.value;

      var chosenRes = measure(chosen, text);
      var safeRes = measure('a+b', text);

      // Scale the bars off whichever step count is larger (capped result included).
      var maxSteps = 0;
      if (!chosenRes.error && chosenRes.steps > maxSteps) maxSteps = chosenRes.steps;
      if (!safeRes.error && safeRes.steps > maxSteps) maxSteps = safeRes.steps;

      var html = '';
      html += barRow(chosen + "  on " + n + " a's", chosenRes, maxSteps);
      if (chosen !== 'a+b') {
        html += barRow("a+b  on " + n + " a's", safeRes, maxSteps);
      }
      bars.innerHTML = html;

      var msg = '';
      if (chosenRes.error) {
        msg = '<span class="rx-err">This pattern uses tokens the illustration engine does not support.</span>';
      } else if (chosenRes.blown) {
        msg = '<span class="rx-err">The nested pattern blew past the safety cap of ' + SAFETY_CAP.toLocaleString() + ' steps and was stopped. A real engine would keep going and freeze.</span>';
      } else if (chosen !== 'a+b' && !safeRes.error) {
        var ratio = safeRes.steps > 0 ? Math.round(chosenRes.steps / safeRes.steps) : 0;
        if (ratio > 1) {
          msg = '<span class="rx-count">The nested pattern took about ' + ratio.toLocaleString() + 'x the work of the safe one. Slide the count higher and watch the gap explode.</span>';
        } else {
          msg = '<span class="rx-count">At this length the gap is small. Slide the count higher and watch the nested pattern run away.</span>';
        }
      } else {
        msg = '<span class="rx-count">Linear: step count climbs gently with the number of a\'s.</span>';
      }
      note.innerHTML = msg;
    }

    sel.addEventListener('change', render);
    slider.addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Which of these patterns is at risk of <strong>catastrophic backtracking</strong> (a ReDoS blow-up)?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">pick one...</option>'
          + '<option value="0">abc</option>'
          + '<option value="1">[a-z]+</option>'
          + '<option value="2">(a+)+b</option>'
          + '<option value="3">\\d{3}</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '2') return { correct: true, feedback: 'Right. <code class="inline">(a+)+b</code> nests a quantifier inside a quantified group, so a long run of a\'s with no trailing <code class="inline">b</code> can be split exponentially many ways. The others have no nesting: <code class="inline">abc</code> is literal, <code class="inline">[a-z]+</code> is a single quantifier over a class, and <code class="inline">\\d{3}</code> is a fixed count.' };
        if (v === '') return { correct: false, feedback: 'Pick one of the options.' };
        return { correct: false, feedback: 'No. The danger sign is a quantifier INSIDE another quantifier over the same characters. Look for the option with a <code class="inline">+</code> inside a group that is itself followed by <code class="inline">+</code>.' };
      },
      hints: [
        'Catastrophic backtracking needs a quantifier nested inside another quantifier over the same characters. Scan each option for that shape.',
        'A single quantifier like [a-z]+ or a fixed count like \\d{3} cannot blow up. You are looking for a group that repeats AND repeats inside.',
        'The answer is (a+)+b: a+ inside a group that is itself repeated with +.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Rewrite the dangerous quoted-string matcher to be <strong>safe</strong>. Match a double-quoted string (an opening <code class="inline">"</code>, the characters inside, a closing <code class="inline">"</code>) <strong>without using <code class="inline">.*</code></strong>. Use a negated class so the repetition cannot overshoot. <br><span class="muted">Test strings: <code class="inline">"hello"</code> should match whole; <code class="inline">"a" and "b"</code> should yield two matches; <code class="inline">"hello</code> (no closing quote) should NOT match.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'safe quoted-string matcher',
          flagToggles: ['g'],
          previewList: [
            { label: '"hello"', text: '"hello"' },
            { label: 'two', text: '"a" and "b"' },
            { label: 'unterminated', text: '"hello' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          if (v.pattern.indexOf('.*') !== -1) {
            return { correct: false, feedback: 'That still uses the dot (<code class="inline">.*</code>). This puzzle asks you to avoid the dot entirely and use a negated class instead: <code class="inline">[^"]</code> means "any character that is not a quote", so <code class="inline">"[^"]*"</code> can only run to the next quote.' };
          }
          if (v.pattern.indexOf('.+') !== -1) {
            return { correct: false, feedback: 'Drop the dot. Use the negated class <code class="inline">[^"]</code> between the quotes instead, so the repetition stops at the closing quote on its own.' };
          }
          var whole = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '"hello"');
          var two = RXT.lib.rx.matches(v.pattern, v.flags, '"a" and "b"');
          var unterminated = RXT.lib.rx.matchesWhole(v.pattern, v.flags, '"hello');
          if (whole && two.length === 2 && !unterminated) {
            return { correct: true, feedback: 'Safe and correct. <code class="inline">"[^"]*"</code> matches exactly one quoted run with no ambiguity, so it cannot backtrack catastrophically. The two-match test proves it is not greedily spanning across both strings the way <code class="inline">".*"</code> would.' };
          }
          if (!whole) return { correct: false, feedback: 'Your pattern does not match the whole of <code class="inline">"hello"</code>. You need an opening quote, a negated-class repetition, then a closing quote: <code class="inline">"[^"]*"</code>.' };
          if (two.length !== 2) return { correct: false, feedback: 'On <code class="inline">"a" and "b"</code> you got ' + two.length + ' match' + (two.length === 1 ? '' : 'es') + ', not 2. A greedy span eats both at once. The negated class <code class="inline">[^"]*</code> stops at the first closing quote, giving two separate matches.' };
          if (unterminated) return { correct: false, feedback: 'Your pattern matched <code class="inline">"hello</code> with no closing quote. Require a closing <code class="inline">"</code> at the end.' };
          return { correct: false, feedback: 'Not quite. Aim for <code class="inline">"[^"]*"</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A double-quoted string is: a quote, then "anything that is not a quote" repeated, then a quote. The middle part is where you avoid the dot.',
        'Use a negated class for the inside: [^"] means "any character except a quote". Repeat it with *.',
        'The answer is "[^"]*": quote, then [^"]*, then quote. No dot anywhere.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Write a <strong>safe (linear)</strong> pattern that matches one or more <code class="inline">a</code> characters followed by a single <code class="inline">b</code>, with <strong>no nested quantifiers</strong>, so it does not blow up on a long failing input. <br><span class="muted">Should match: <code class="inline">ab</code>, <code class="inline">aaab</code>. Should NOT match: <code class="inline">aaa</code> (no b), <code class="inline">b</code> (no a). And it must stay fast on a long run of a\'s.</span>',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'one or more a, then b, safely',
          flagToggles: [],
          previewList: [
            { label: 'aaab', text: 'aaab' },
            { label: 'ab', text: 'ab' },
            { label: 'aaa', text: 'aaa' }
          ]
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var ok1 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'aaab');
          var ok2 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'ab');
          var bad1 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'aaa');
          var bad2 = RXT.lib.rx.matchesWhole(v.pattern, v.flags, 'b');
          var behaviorOk = ok1 && ok2 && !bad1 && !bad2;

          if (!behaviorOk) {
            if (!ok1 || !ok2) return { correct: false, feedback: 'Your pattern does not match <code class="inline">aaab</code> and <code class="inline">ab</code>. You want one or more a\'s, then exactly one b: <code class="inline">a+b</code>.' };
            if (bad1) return { correct: false, feedback: 'Your pattern matched <code class="inline">aaa</code>, which has no <code class="inline">b</code>. The trailing <code class="inline">b</code> must be required.' };
            if (bad2) return { correct: false, feedback: 'Your pattern matched <code class="inline">b</code> alone. At least one <code class="inline">a</code> is required before the b, so use <code class="inline">+</code>, not <code class="inline">*</code>.' };
            return { correct: false, feedback: 'Not quite. Aim for <code class="inline">a+b</code>.' };
          }

          // Behavior is right. Now confirm it is actually linear / safe.
          var measured = true;
          var r = null;
          try {
            r = RXT.lib.rx.backtrackSteps(v.pattern, 'aaaaaaaaaaaaaaaaaaaaaaaa');
          } catch (e) {
            measured = false;
          }
          if (measured && r && (r.steps >= 300 || r.blown)) {
            return { correct: false, feedback: 'Your pattern matches the right strings, but it is NOT safe: on a long run of a\'s it took ' + (r.blown ? 'more than the safety cap' : r.steps.toLocaleString() + ' steps') + '. That is the catastrophic-backtracking blow-up. Remove the nested quantifier and use a flat <code class="inline">a+b</code>.' };
          }
          if (!measured) {
            return { correct: true, feedback: 'Correct behavior. (Your pattern used tokens the illustration engine could not measure, so the step count was skipped, but a flat <code class="inline">a+b</code> is the safe answer.)' };
          }
          return { correct: true, feedback: 'Safe and correct. <code class="inline">a+b</code> has a single quantifier with nothing nested, so on a 24-a failing input it took only ' + r.steps + ' steps. The same logic written as <code class="inline">(a+)+b</code> would have exploded.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'You want one or more a\'s, then one b. Write that as plainly as possible, with no group and no quantifier inside a quantifier.',
        'Just a+ for the a\'s, then a literal b. Do not wrap the a+ in a group that you also repeat.',
        'The answer is a+b. Flat, no nesting, linear time.'
      ]
    }
  ]
});
