// Level 12 — Replace & Capture References

// Puzzle input for this level: a pattern field plus a replacement field. Flags
// are fixed at 'g' (replace-all) so the lesson stays on captures, not flags.
// Returns getValue -> { pattern, flags: 'g', replacement }. A small live result
// box previews the rewrite as the user types.
function mountReplaceInput(c, opts) {
  opts = opts || {};
  var sample = opts.sample != null ? opts.sample : '';

  var wrap = document.createElement('div');
  wrap.className = 'rx-field';

  // Pattern row: / [input] / g
  var pRow = document.createElement('div');
  pRow.className = 'rx-pattern-row';
  var s1 = document.createElement('span'); s1.className = 'rx-slash'; s1.textContent = '/';
  var patIn = document.createElement('input');
  patIn.type = 'text'; patIn.className = 'rx-pattern-input';
  patIn.placeholder = opts.patternPlaceholder || 'your pattern';
  patIn.spellcheck = false; patIn.setAttribute('autocomplete', 'off');
  var s2 = document.createElement('span'); s2.className = 'rx-slash'; s2.textContent = '/';
  var gTag = document.createElement('span'); gTag.className = 'rx-slash'; gTag.textContent = 'g';
  gTag.title = 'global flag is fixed on for this level (replace every match)';
  pRow.appendChild(s1); pRow.appendChild(patIn); pRow.appendChild(s2); pRow.appendChild(gTag);
  wrap.appendChild(pRow);

  // Replacement row
  var rRow = document.createElement('div');
  rRow.className = 'rx-pattern-row';
  var arrow = document.createElement('span'); arrow.className = 'rx-slash'; arrow.textContent = '→';
  arrow.title = 'replacement string';
  var repIn = document.createElement('input');
  repIn.type = 'text'; repIn.className = 'rx-pattern-input';
  repIn.placeholder = opts.replacementPlaceholder || 'replacement (use $1, $2)';
  repIn.spellcheck = false; repIn.setAttribute('autocomplete', 'off');
  rRow.appendChild(arrow); rRow.appendChild(repIn);
  wrap.appendChild(rRow);

  // Live preview of the rewrite on the sample
  var pv = document.createElement('div');
  pv.className = 'rx-preview';
  wrap.appendChild(pv);

  function preview() {
    var pat = patIn.value;
    if (pat === '') { pv.innerHTML = '<span class="muted">live result appears here</span>'; return; }
    var out;
    try {
      out = RXT.lib.rx.replace(pat, 'g', sample, repIn.value);
    } catch (e) {
      pv.innerHTML = '<span class="rx-err">⚠ ' + RXT.lib.rx.esc(e.message) + '</span>';
      return;
    }
    pv.innerHTML = '<span class="muted">' + RXT.lib.rx.esc(sample) + '</span> &rarr; '
      + (out === '' ? '<span class="muted">(empty)</span>' : '<span class="rx-pv-text">' + RXT.lib.rx.esc(out) + '</span>');
  }

  patIn.addEventListener('input', preview);
  repIn.addEventListener('input', preview);
  preview();
  c.appendChild(wrap);

  return function () { return { pattern: patIn.value, flags: 'g', replacement: repIn.value }; };
}

RXT.registerLevel({
  id: 12,
  title: 'Replace & Capture References',
  whyItMatters: 'Find-and-replace with captures is the everyday superpower behind reformatting dates, masking secrets, and reordering names across a whole file in a single command.',
  glossary: ['$1', '( )', '(?<name>)', '\\d'],
  learn: ''
    + '<h4>From finding to rewriting</h4>'
    + '<p>Everything so far has been about <em>finding</em> text: does it match, where, what did the groups capture. Now you put that to work. A <strong>replace</strong> takes a pattern, finds every place it matches, and substitutes a new string in each spot. This is the find-and-replace box in your editor, but driven by a pattern instead of a fixed string.</p>'
    + '<p>In JavaScript the call is <code class="inline">str.replace(regex, replacement)</code>. It returns a brand new string with the matches swapped out. The original string is untouched (strings are immutable), so you assign the result somewhere.</p>'
    + '<div class="example"><div class="label">A plain replace</div>'
    + '<code class="inline">"I like cats".replace(/cat/, "dog")</code> returns <code class="inline">"I like dogs"</code>.<br>'
    + 'The pattern <code class="inline">cat</code> matched inside <code class="inline">cats</code>, and only that part was replaced.'
    + '</div>'

    + '<h4>You need the g flag to replace every match</h4>'
    + '<p>By default <code class="inline">replace</code> only swaps the <strong>first</strong> match. That surprises almost everyone the first time. To replace all of them, add the <code class="inline">g</code> (global) flag you met earlier.</p>'
    + '<div class="example"><div class="label">First match vs all matches</div>'
    + '<code class="inline">"a a a".replace(/a/, "x")</code> returns <code class="inline">"x a a"</code> (only the first).<br>'
    + '<code class="inline">"a a a".replace(/a/g, "x")</code> returns <code class="inline">"x x x"</code> (all of them).'
    + '</div>'
    + '<div class="callout"><div class="label">In this level the g flag is on by default</div>'
    + 'The puzzles below replace across the whole input, so the flag is fixed at <code class="inline">g</code> for you. Just remember that in real code you have to add it yourself, and forgetting it is one of the most common replace bugs.'
    + '</div>'

    + '<h4>The dollar tokens: putting captured text back in</h4>'
    + '<p>This is the part that makes regex replace powerful. The replacement string is not pure literal text. A few <code class="inline">$</code> tokens are special, and they pull pieces of the match back into the result. The big one is <code class="inline">$1</code>, which inserts whatever <strong>capture group 1</strong> matched. <code class="inline">$2</code> inserts group 2, and so on.</p>'
    + '<p>So you capture parts of the match with parentheses <code class="inline">( )</code> (exactly like Level 7), then reference those captures by number in the replacement. Everything else in the replacement string is literal.</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">$1</span>group 1\'s text</div>'
    +   '<div class="symbol-chip"><span class="sym">$2</span>group 2\'s text</div>'
    +   '<div class="symbol-chip"><span class="sym">$&amp;</span>the whole match</div>'
    +   '<div class="symbol-chip"><span class="sym">$`</span>text before the match</div>'
    +   '<div class="symbol-chip"><span class="sym">$\'</span>text after the match</div>'
    + '</div>'
    + '<div class="example"><div class="label">Swapping two words with $1 and $2</div>'
    + 'Pattern: <code class="inline">(\\w+) (\\w+)</code> &nbsp; Replacement: <code class="inline">$2 $1</code><br>'
    + '<code class="inline">\\w</code> is a word character (letter, digit, or underscore) and <code class="inline">+</code> is one-or-more, both from earlier levels. So group 1 grabs the first word, group 2 the second.<br><br>'
    + 'On <code class="inline">Ada Lovelace</code> the match captures <code class="inline">Ada</code> into group 1 and <code class="inline">Lovelace</code> into group 2. The replacement <code class="inline">$2 $1</code> writes them back in the other order, giving <code class="inline">Lovelace Ada</code>.'
    + '</div>'
    + '<div class="callout"><div class="label">$1 is the text, not the pattern</div>'
    + 'A common mix-up: <code class="inline">$1</code> in a replacement is NOT the regex <code class="inline">\\1</code> backreference from Level 9. They look related but live in different places. <code class="inline">\\1</code> goes inside the <em>pattern</em> and matches the same text again while searching. <code class="inline">$1</code> goes inside the <em>replacement</em> and pastes that captured text into the output. Same captured text, two different jobs.'
    + '</div>'

    + '<h4>Replacing with nothing, or with a fixed character</h4>'
    + '<p>The replacement does not have to reference a capture. If you replace with an empty string you delete the matches. If you replace with a single character you mask them. This is how you redact data.</p>'
    + '<div class="example"><div class="label">Masking digits</div>'
    + 'Pattern: <code class="inline">\\d</code> &nbsp; Replacement: <code class="inline">*</code> &nbsp; (with the <code class="inline">g</code> flag)<br>'
    + '<code class="inline">\\d</code> matches one digit. With <code class="inline">g</code> it matches every digit in turn, and each one is replaced by a <code class="inline">*</code>.<br><br>'
    + 'On <code class="inline">call 911 now</code> you get <code class="inline">call *** now</code>. Each of the three digits became a single <code class="inline">*</code>.'
    + '</div>'

    + '<h4>Named groups in the replacement: $&lt;name&gt;</h4>'
    + '<p>If you captured with a named group <code class="inline">(?&lt;name&gt;...)</code> (Level 7 again), you can reference it in the replacement as <code class="inline">$&lt;name&gt;</code> instead of counting to a number. Reads better and survives someone inserting a group ahead of it.</p>'
    + '<div class="example"><div class="label">Reordering a date by name</div>'
    + 'Pattern: <code class="inline">(?&lt;y&gt;\\d{4})-(?&lt;m&gt;\\d{2})-(?&lt;d&gt;\\d{2})</code><br>'
    + 'Replacement: <code class="inline">$&lt;m&gt;/$&lt;d&gt;/$&lt;y&gt;</code><br><br>'
    + 'On <code class="inline">2026-06-28</code> this produces <code class="inline">06/28/2026</code>. The numbered form <code class="inline">$2/$3/$1</code> does the exact same thing.'
    + '</div>'

    + '<h4>The same idea everywhere else</h4>'
    + '<p>This is not a JavaScript quirk. The same capture-and-reference replace shows up across the tools you already use, just with different syntax for the references.</p>'
    + '<div class="example"><div class="label">Reordering a date in three tools</div>'
    + '<strong>JavaScript:</strong> <code class="inline">s.replace(/(\\d{4})-(\\d{2})-(\\d{2})/g, "$2/$3/$1")</code><br>'
    + '<strong>sed:</strong> <code class="inline">sed -E \'s#([0-9]{4})-([0-9]{2})-([0-9]{2})#\\2/\\3/\\1#g\'</code> (here the references are <code class="inline">\\1 \\2 \\3</code>)<br>'
    + '<strong>vim:</strong> <code class="inline">:%s/\\(\\d\\{4}\\)-\\(\\d\\{2}\\)-\\(\\d\\{2}\\)/\\2\\/\\3\\/\\1/g</code>'
    + '</div>'
    + '<div class="callout"><div class="label">The references are 1-based by output position</div>'
    + 'In JS the replacement references are <code class="inline">$1 $2 $3</code>. In sed and vim they are <code class="inline">\\1 \\2 \\3</code>. The numbering rule is the same as capturing: count the opening parentheses left to right starting at 1. Group 0 (the whole match) is <code class="inline">$&amp;</code> in JS and <code class="inline">&amp;</code> in sed.'
    + '</div>'

    + '<h4>Play with it below</h4>'
    + '<p>The sandbox below is a live find-and-replace. Type a pattern, optional flags (start with <code class="inline">g</code>), a replacement string, and watch the result update on every keystroke. It is seeded with the name-swap example. Try changing the replacement to <code class="inline">$1 $1</code> to duplicate the first word, or to <code class="inline">$&amp;!</code> to keep the whole match and add a bang.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';

    var intro = document.createElement('p');
    intro.className = 'muted';
    intro.innerHTML = 'Live find-and-replace. The pattern finds matches in the sample, and each match is rewritten using the replacement string. Use <code class="inline">$1</code>, <code class="inline">$2</code> to insert captured groups, <code class="inline">$&amp;</code> for the whole match. Keep <code class="inline">g</code> in flags to replace every occurrence.';
    container.appendChild(intro);

    function labeledRow(labelText) {
      var row = document.createElement('div');
      row.className = 'rx-field';
      var lab = document.createElement('div');
      lab.className = 'rx-pv-label';
      lab.style.marginBottom = '4px';
      lab.textContent = labelText;
      row.appendChild(lab);
      container.appendChild(row);
      return row;
    }

    // Pattern + flags row
    var patRow = labeledRow('Pattern and flags');
    var pRow = document.createElement('div');
    pRow.className = 'rx-pattern-row';
    var s1 = document.createElement('span'); s1.className = 'rx-slash'; s1.textContent = '/';
    var patIn = document.createElement('input');
    patIn.type = 'text'; patIn.className = 'rx-pattern-input';
    patIn.value = '(\\w+) (\\w+)';
    patIn.spellcheck = false; patIn.setAttribute('autocomplete', 'off');
    var s2 = document.createElement('span'); s2.className = 'rx-slash'; s2.textContent = '/';
    var flagsIn = document.createElement('input');
    flagsIn.type = 'text'; flagsIn.className = 'rx-pattern-input';
    flagsIn.value = 'g';
    flagsIn.spellcheck = false; flagsIn.setAttribute('autocomplete', 'off');
    flagsIn.style.maxWidth = '70px';
    flagsIn.title = 'flags, e.g. g, gi, gs';
    pRow.appendChild(s1); pRow.appendChild(patIn); pRow.appendChild(s2); pRow.appendChild(flagsIn);
    patRow.appendChild(pRow);

    // Replacement row
    var repRow = labeledRow('Replacement (use $1, $2, $&)');
    var repIn = document.createElement('input');
    repIn.type = 'text'; repIn.className = 'rx-pattern-input';
    repIn.value = '$2 $1';
    repIn.spellcheck = false; repIn.setAttribute('autocomplete', 'off');
    repRow.appendChild(repIn);

    // Sample text row
    var sampleRow = labeledRow('Sample text');
    var sampleIn = document.createElement('textarea');
    sampleIn.className = 'rx-sample';
    sampleIn.rows = 3;
    sampleIn.spellcheck = false;
    sampleIn.value = 'Ada Lovelace, Alan Turing';
    sampleRow.appendChild(sampleIn);

    // Status + result
    var status = document.createElement('div');
    status.className = 'rx-status';
    container.appendChild(status);

    var resultLabel = document.createElement('div');
    resultLabel.className = 'rx-pv-label';
    resultLabel.style.marginBottom = '4px';
    resultLabel.textContent = 'Result';
    container.appendChild(resultLabel);

    var result = document.createElement('div');
    result.className = 'rx-output';
    container.appendChild(result);

    function update() {
      var pat = patIn.value;
      var fl = flagsIn.value;
      var rep = repIn.value;
      var txt = sampleIn.value;
      if (pat === '') {
        status.innerHTML = '<span class="muted">Type a pattern above.</span>';
        result.innerHTML = RXT.lib.rx.esc(txt);
        return;
      }
      var out;
      try {
        out = RXT.lib.rx.replace(pat, fl, txt, rep);
      } catch (e) {
        status.innerHTML = '<span class="rx-err">⚠ ' + RXT.lib.rx.esc(e.message) + '</span>';
        result.innerHTML = RXT.lib.rx.esc(txt);
        return;
      }
      var changed = (out !== txt);
      status.innerHTML = changed
        ? '<span class="rx-count">rewritten</span>'
        : '<span class="muted">no change (pattern did not match, or replacement equals the match)</span>';
      result.innerHTML = (out === '') ? '<span class="muted">(empty string)</span>' : RXT.lib.rx.esc(out);
    }

    patIn.addEventListener('input', update);
    flagsIn.addEventListener('input', update);
    repIn.addEventListener('input', update);
    sampleIn.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Swap two space-separated words. On the input <code class="inline">Ada Lovelace</code>, your pattern and replacement should produce <code class="inline">Lovelace Ada</code>. Capture each word and reference them in the other order.',
      mountInput: function (c) {
        return mountReplaceInput(c, {
          patternPlaceholder: 'try: (\\w+) (\\w+)',
          replacementPlaceholder: 'try: $2 $1',
          sample: 'Ada Lovelace'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          if (v.replacement === '') return { correct: false, feedback: 'Type a replacement string too. Reference your captured words with <code class="inline">$1</code> and <code class="inline">$2</code>.' };
          var out = RXT.lib.rx.replace(v.pattern, v.flags || 'g', 'Ada Lovelace', v.replacement);
          if (out === 'Lovelace Ada') {
            return { correct: true, feedback: 'You captured each word into a group, then wrote them back in the other order with <code class="inline">$2 $1</code>. Group 1 held <code class="inline">Ada</code>, group 2 held <code class="inline">Lovelace</code>, and the replacement reversed them.' };
          }
          return { correct: false, feedback: 'On <code class="inline">Ada Lovelace</code> your replacement produced <code class="inline">' + RXT.escapeHtml(out) + '</code>, not <code class="inline">Lovelace Ada</code>. Capture each word with parentheses, then reference them as <code class="inline">$2 $1</code> in the replacement.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Capture each word with its own group: (\\w+) for the first word, (\\w+) for the second, with a space between them.',
        'In the replacement, $1 is the first captured word and $2 is the second. Write them in the order you want.',
        'Pattern: (\\w+) (\\w+)   Replacement: $2 $1'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Redact digits. Replace <strong>every</strong> digit with a single <code class="inline">*</code>. On <code class="inline">call 911 now</code> the result should be <code class="inline">call *** now</code>. (You do not need any capture groups for this one.)',
      mountInput: function (c) {
        return mountReplaceInput(c, {
          patternPlaceholder: 'match a digit',
          replacementPlaceholder: 'the mask character',
          sample: 'call 911 now'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var out = RXT.lib.rx.replace(v.pattern, v.flags || 'g', 'call 911 now', v.replacement);
          if (out === 'call *** now') {
            return { correct: true, feedback: 'Each digit matched on its own and was replaced by a single <code class="inline">*</code>. The <code class="inline">g</code> flag is what made it hit all three instead of just the first. This is the core of data redaction.' };
          }
          if (out === 'call 911 now') {
            return { correct: false, feedback: 'Nothing changed. Your pattern needs to match a digit (<code class="inline">\\d</code> or <code class="inline">[0-9]</code>), and your replacement must be a single <code class="inline">*</code>.' };
          }
          return { correct: false, feedback: 'On <code class="inline">call 911 now</code> you got <code class="inline">' + RXT.escapeHtml(out) + '</code>, not <code class="inline">call *** now</code>. Match a single digit and replace it with exactly one <code class="inline">*</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A single digit is \\d (or the equivalent [0-9]). The g flag is already on, so it will hit every digit.',
        'The replacement is just the literal character you want in place of each digit: a single asterisk.',
        'Pattern: \\d   Replacement: *'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Reformat an ISO date to US format. On <code class="inline">2026-06-28</code> (YYYY-MM-DD), produce <code class="inline">06/28/2026</code> (MM/DD/YYYY). Capture the year, month, and day, then reorder them with slashes in the replacement.',
      mountInput: function (c) {
        return mountReplaceInput(c, {
          patternPlaceholder: 'capture year, month, day',
          replacementPlaceholder: 'try: $2/$3/$1',
          sample: '2026-06-28'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          if (v.replacement === '') return { correct: false, feedback: 'Type a replacement too. You will reference your three captures with <code class="inline">$1</code>, <code class="inline">$2</code>, <code class="inline">$3</code> and separate them with slashes.' };
          var out = RXT.lib.rx.replace(v.pattern, v.flags || 'g', '2026-06-28', v.replacement);
          if (out === '06/28/2026') {
            return { correct: true, feedback: 'You captured the year, month, and day into three groups, then rebuilt the string as <code class="inline">$2/$3/$1</code> with slashes between. This is the everyday log-and-data reformatting trick, done in one pass.' };
          }
          return { correct: false, feedback: 'On <code class="inline">2026-06-28</code> your output was <code class="inline">' + RXT.escapeHtml(out) + '</code>, not <code class="inline">06/28/2026</code>. Capture the three parts (<code class="inline">(\\d{4})-(\\d{2})-(\\d{2})</code>), then write <code class="inline">$2/$3/$1</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Capture all three parts: (\\d{4})-(\\d{2})-(\\d{2}). Group 1 is the year, group 2 the month, group 3 the day.',
        'US format is month, then day, then year, joined by slashes. In the replacement that is $2/$3/$1.',
        'Pattern: (\\d{4})-(\\d{2})-(\\d{2})   Replacement: $2/$3/$1'
      ]
    }
  ]
});
