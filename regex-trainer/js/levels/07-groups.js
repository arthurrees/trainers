// Level 7 - Groups & Capturing
RXT.registerLevel({
  id: 7,
  title: 'Groups & Capturing',
  whyItMatters: 'Groups are how you pull structured data OUT of text (the year out of a date, the username out of a config line, the area code out of a phone number), which is what turns regex from a yes/no test into an extraction tool.',
  glossary: ['( )', '(?: )', '(?<name>)', '\\d', '+'],
  learn: ''
    + '<h4>Parentheses do two jobs at once</h4>'
    + '<p>Up to now your patterns answered yes/no questions: does this text match? A pair of parentheses <code class="inline">( )</code> adds a second power. It does <strong>two</strong> things at the same time:</p>'
    + '<ul>'
    +   '<li><strong>Group</strong>: it bundles several tokens into one unit, so a quantifier applies to the whole bundle instead of just the last character.</li>'
    +   '<li><strong>Capture</strong>: it <em>remembers</em> the exact text that matched inside it and stores it in a numbered slot you can read back later.</li>'
    + '</ul>'
    + '<p>That second job is the new idea. Think of each <code class="inline">( )</code> as a labeled box. After a match, the engine hands you the contents of every box.</p>'

    + '<h4>Grouping so a quantifier applies to more than one character</h4>'
    + '<p>A quantifier like <code class="inline">+</code> (one or more) normally binds to the single thing right before it. So <code class="inline">ab+</code> means "an <code class="inline">a</code> then one-or-more <code class="inline">b</code>s", where the <code class="inline">+</code> only repeats the <code class="inline">b</code>. To repeat <em>both</em> letters, wrap them in a group: <code class="inline">(ab)+</code> matches <code class="inline">ab</code>, <code class="inline">abab</code>, <code class="inline">ababab</code>, and so on.</p>'
    + '<div class="example"><div class="label">Group vs no group</div>'
    + 'Pattern <code class="inline">ab+</code> on <code class="inline">abbb</code> matches the whole thing (one <code class="inline">a</code>, three <code class="inline">b</code>s).<br>'
    + 'Pattern <code class="inline">(ab)+</code> on <code class="inline">ababab</code> matches the whole thing (three repeats of <code class="inline">ab</code>).'
    + '</div>'

    + '<h4>Capturing: reading what each group matched</h4>'
    + '<p>Capture groups are numbered <strong>by the position of their opening parenthesis</strong>, left to right, starting at 1. Group 0 is always the entire match. So in:</p>'
    + '<div class="example"><div class="label">Numbering the groups</div>'
    + 'Pattern: <code class="inline">(\\d{4})-(\\d{2})-(\\d{2})</code> &nbsp; Text: <code class="inline">2026-06-28</code><br>'
    + '<code class="inline">\\d</code> means "a digit" and <code class="inline">{4}</code> means "exactly four of them" (both from earlier levels).<br><br>'
    + 'Group 0 (whole match): <code class="inline">2026-06-28</code><br>'
    + 'Group 1 (first paren): <code class="inline">2026</code><br>'
    + 'Group 2 (second paren): <code class="inline">06</code><br>'
    + 'Group 3 (third paren): <code class="inline">28</code>'
    + '</div>'
    + '<p>In JavaScript you read these off the match object. The library this trainer uses returns them in a <code class="inline">groups</code> array (group 1 is at index 0):</p>'
    + '<div class="example"><div class="label">Reading captures in code</div>'
    + '<code class="inline">var m = "2026-06-28".match(/(\\d{4})-(\\d{2})-(\\d{2})/);</code><br>'
    + '<code class="inline">m[0]</code> is <code class="inline">"2026-06-28"</code> (the whole match)<br>'
    + '<code class="inline">m[1]</code> is <code class="inline">"2026"</code>, &nbsp;<code class="inline">m[2]</code> is <code class="inline">"06"</code>, &nbsp;<code class="inline">m[3]</code> is <code class="inline">"28"</code>'
    + '</div>'
    + '<p>This is the difference between asking "is this a date?" and actually pulling the year, month, and day out as separate strings you can use.</p>'

    + '<h4>Nesting: groups inside groups</h4>'
    + '<p>Groups can contain other groups. The rule for numbering does not change. Count opening parentheses left to right. The outer group gets the lower number because its <code class="inline">(</code> comes first.</p>'
    + '<div class="example"><div class="label">Counting opening parens, left to right</div>'
    + 'Pattern: <code class="inline">((\\d{4})-(\\d{2}))</code> &nbsp; Text: <code class="inline">2026-06</code><br><br>'
    + 'Group 1 = the outer paren = <code class="inline">2026-06</code><br>'
    + 'Group 2 = the first inner paren = <code class="inline">2026</code><br>'
    + 'Group 3 = the second inner paren = <code class="inline">06</code>'
    + '</div>'

    + '<h4>Grouping without capturing: (?: )</h4>'
    + '<p>Sometimes you only need the <em>grouping</em> job, not the capturing job. Maybe you want to repeat a chunk but you do not care to extract it. Capturing it anyway clutters your numbered slots and makes a later group jump from 1 to 2 unexpectedly. The non-capturing group <code class="inline">(?:...)</code> groups without taking a slot.</p>'
    + '<div class="example"><div class="label">(?: ) keeps your numbering clean</div>'
    + 'Pattern: <code class="inline">(?:ab)+(\\d+)</code> on <code class="inline">ababab42</code><br>'
    + 'The <code class="inline">(?:ab)</code> repeats but captures nothing. The digits land in group <strong>1</strong>, not group 2.<br>'
    + 'Group 1: <code class="inline">42</code>'
    + '</div>'
    + '<div class="callout"><div class="label">Rule of thumb</div>'
    + 'Use a plain <code class="inline">( )</code> when you want to read the text back out. Use <code class="inline">(?:...)</code> when you only need to bound a quantifier or an alternation and you do not care about extracting it. It is also a tiny bit faster, but the real reason is keeping your group numbers stable.'
    + '</div>'

    + '<h4>Named groups: (?&lt;name&gt;...)</h4>'
    + '<p>Counting parentheses gets error-prone in a long pattern. Add a name and read the capture by that name instead of a number. The syntax is <code class="inline">(?&lt;name&gt;...)</code>, a <code class="inline">?&lt;name&gt;</code> right after the opening paren.</p>'
    + '<div class="example"><div class="label">Naming a capture</div>'
    + 'Pattern: <code class="inline">(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})</code> &nbsp; Text: <code class="inline">2026-06</code><br><br>'
    + 'In JavaScript you read these from <code class="inline">match.groups</code>:<br>'
    + '<code class="inline">m.groups.year</code> is <code class="inline">"2026"</code>, &nbsp;<code class="inline">m.groups.month</code> is <code class="inline">"06"</code><br>'
    + 'They still occupy numbered slots too (<code class="inline">m[1]</code>, <code class="inline">m[2]</code>), so naming is a convenience layered on top.'
    + '</div>'
    + '<div class="callout"><div class="label">Programming analogy</div>'
    + 'Numbered groups are like a function returning a tuple, where you have to remember which position is which. Named groups are like returning an object with labeled fields. The named version reads better and survives someone inserting a new group in the middle.'
    + '</div>'

    + '<h4>Try it in the Play panel</h4>'
    + '<p>The tester below has a <strong>Capture groups</strong> panel that fills in live whenever your pattern has groups. It is seeded with the date pattern. Watch <code class="inline">$1</code>, <code class="inline">$2</code>, <code class="inline">$3</code> populate as the two dates match. Try turning one of the groups into a non-capturing <code class="inline">(?:...)</code> and watch a slot disappear, or add a name with <code class="inline">(?&lt;y&gt;\\d{4})</code> and watch the named row appear.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">The pattern below captures the year, month, and day of each date into three numbered groups. The Capture groups panel underneath shows what each group caught. Edit the pattern: make a group non-capturing with <code class="inline">(?:...)</code>, or name one with <code class="inline">(?&lt;y&gt;...)</code>.</p>';
    var host = document.createElement('div');
    container.appendChild(host);
    RXT.lib.rx.mountTester(host, {
      pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
      flags: 'g',
      text: 'Shipped 2026-06-28 then 2025-12-01. Bad: 2026/6/9 ignored.',
      flagToggles: ['g', 'i', 'm', 's'],
      rows: 3,
      showGroups: true
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Write a pattern with <strong>one capture group</strong> that captures the 4-digit year out of <code class="inline">2026-06-28</code>. The group should hold exactly <code class="inline">2026</code>.',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'try: (\\d{4})',
          flagToggles: [],
          previewText: '2026-06-28'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var c = RXT.lib.rx.capture(v.pattern, v.flags, '2026-06-28');
          if (!c) return { correct: false, feedback: 'Your pattern did not match <code class="inline">2026-06-28</code> at all. Match the four leading digits.' };
          if (!c.groups || c.groups.length === 0) {
            return { correct: false, feedback: 'No capture group. You need a pair of parentheses around the year, like <code class="inline">(\\d{4})</code>. Parentheses are what create a capturing slot.' };
          }
          if (c.groups[0] === '2026') {
            return { correct: true, feedback: 'Group 1 captured <code class="inline">' + RXT.escapeHtml(c.groups[0]) + '</code>. The parentheses both group the four digits and remember what they matched, so you can read the year back out.' };
          }
          return { correct: false, feedback: 'Group 1 captured <code class="inline">' + RXT.escapeHtml(String(c.groups[0])) + '</code>, not <code class="inline">2026</code>. Capture exactly the four-digit year.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A pair of parentheses ( ) creates a capture group AND remembers what matched inside it.',
        'You need four digits inside the parentheses. Four digits is \\d{4}.',
        'The answer is: (\\d{4})'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'From <code class="inline">2026-06-28</code>, capture the <strong>month</strong> into group 1 and the <strong>day</strong> into group 2. The year should NOT be captured (so it stays out of your numbered slots).',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'capture month and day, skip the year',
          flagToggles: [],
          previewText: '2026-06-28'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var c = RXT.lib.rx.capture(v.pattern, v.flags, '2026-06-28');
          if (!c) return { correct: false, feedback: 'Your pattern did not match <code class="inline">2026-06-28</code>. You still need to match across the whole date even though you only capture two parts of it.' };
          if (!c.groups || c.groups.length < 2) {
            return { correct: false, feedback: 'You need TWO capture groups: one around the month, one around the day. You have ' + (c.groups ? c.groups.length : 0) + '.' };
          }
          if (c.groups[0] === '06' && c.groups[1] === '28') {
            return { correct: true, feedback: 'Group 1 is <code class="inline">06</code> and group 2 is <code class="inline">28</code>. The year was matched but left uncaptured, so the month became group 1 instead of group 2. That is exactly what (?:...) or a bare \\d{4} is for.' };
          }
          var g0 = c.groups[0] === undefined ? '(none)' : String(c.groups[0]);
          var g1 = c.groups[1] === undefined ? '(none)' : String(c.groups[1]);
          return { correct: false, feedback: 'Group 1 captured <code class="inline">' + RXT.escapeHtml(g0) + '</code> and group 2 captured <code class="inline">' + RXT.escapeHtml(g1) + '</code>. You want group 1 = <code class="inline">06</code> and group 2 = <code class="inline">28</code>. Do not wrap the year in capturing parentheses. Match it without a group.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'Match all three parts, but only put parentheses around the month and the day.',
        'Match the year with a plain \\d{4} (no parentheses), then capture the next two: \\d{4}-(\\d{2})-(\\d{2}).',
        'The answer is: \\d{4}-(\\d{2})-(\\d{2})'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'From the config line <code class="inline">user=arthur;</code>, capture the username into a <strong>named group</strong> called <code class="inline">user</code>. (Reading captures by name beats counting parentheses in a long pattern.)',
      mountInput: function (c) {
        return RXT.lib.rx.patternField(c, {
          placeholder: 'name the capture: user',
          flagToggles: [],
          previewText: 'user=arthur;'
        });
      },
      check: function (v) {
        try {
          if (!v.pattern) return { correct: false, feedback: 'Type a pattern first.' };
          var c = RXT.lib.rx.capture(v.pattern, v.flags, 'user=arthur;');
          if (!c) return { correct: false, feedback: 'Your pattern did not match <code class="inline">user=arthur;</code>. Match the literal <code class="inline">user=</code> first, then capture the name.' };
          if (!c.named || !('user' in c.named)) {
            return { correct: false, feedback: 'No named group called <code class="inline">user</code>. The syntax is <code class="inline">(?&lt;user&gt;...)</code>. The name goes right after the opening parenthesis.' };
          }
          if (c.named.user === 'arthur') {
            return { correct: true, feedback: 'The named group <code class="inline">user</code> captured <code class="inline">arthur</code>. You can now read it as <code class="inline">match.groups.user</code> instead of guessing a number, which is much harder to break when the pattern grows.' };
          }
          return { correct: false, feedback: 'The <code class="inline">user</code> group captured <code class="inline">' + RXT.escapeHtml(String(c.named.user)) + '</code>, not <code class="inline">arthur</code>. Capture one or more word characters (\\w+) after the <code class="inline">=</code>.' };
        } catch (e) { return { correct: false, feedback: 'Invalid regex: ' + RXT.escapeHtml(e.message) }; }
      },
      hints: [
        'A named group is written (?<name>...). The name goes immediately after the opening parenthesis.',
        'Match the literal user= first, then capture one-or-more word characters into the name: user=(?<user>\\w+).',
        'The answer is: user=(?<user>\\w+)'
      ]
    }
  ]
});
