// glossary.js — regex token glossary, rendered in the sidebar
window.RXT = window.RXT || {};

RXT.glossary = {
  // Literals & escaping
  '\\':  { name: 'escape', def: 'Backslash. Makes a special character literal (\\. = a real dot) or a literal character special (\\d = a digit).' },

  // The dot & classes
  '.':   { name: 'any char', def: 'Matches any single character except a newline (unless the s flag is set).' },
  '[abc]':  { name: 'character class', def: 'Matches ONE character from the set: a, b, or c.' },
  '[^abc]': { name: 'negated class', def: 'Matches one character that is NOT a, b, or c.' },
  '[a-z]':  { name: 'range', def: 'A range inside a class. [a-z] = any lowercase letter; [0-9] = any digit.' },

  // Shorthand classes
  '\\d': { name: 'digit', def: 'Any digit 0-9. Same as [0-9].' },
  '\\D': { name: 'non-digit', def: 'Any character that is NOT a digit. Same as [^0-9].' },
  '\\w': { name: 'word char', def: 'A "word" character: [A-Za-z0-9_]. Letters, digits, underscore.' },
  '\\W': { name: 'non-word', def: 'Anything that is NOT a word character. Same as [^A-Za-z0-9_].' },
  '\\s': { name: 'whitespace', def: 'Any whitespace: space, tab, newline, carriage return, etc.' },
  '\\S': { name: 'non-whitespace', def: 'Any character that is NOT whitespace.' },

  // Quantifiers
  '*':   { name: 'zero or more', def: 'Repeat the preceding item 0 or more times. Greedy by default.' },
  '+':   { name: 'one or more', def: 'Repeat the preceding item 1 or more times. Greedy by default.' },
  '?':   { name: 'optional', def: 'Repeat the preceding item 0 or 1 times (makes it optional). Also makes a quantifier lazy when placed after it: *?, +?.' },
  '{n,m}': { name: 'interval', def: '{3} = exactly 3; {2,} = 2 or more; {2,5} = between 2 and 5 times.' },

  // Anchors & boundaries
  '^':   { name: 'start', def: 'Anchors to the start of the string (or start of a line with the m flag). Matches a position, not a character.' },
  '$':   { name: 'end', def: 'Anchors to the end of the string (or end of a line with the m flag). Matches a position, not a character.' },
  '\\b': { name: 'word boundary', def: 'A zero-width position between a word char (\\w) and a non-word char. \\bcat\\b matches the word "cat" but not "category".' },
  '\\B': { name: 'non-boundary', def: 'A position that is NOT a word boundary.' },

  // Groups
  '( )':  { name: 'capturing group', def: 'Groups part of the pattern AND remembers what it matched (capture group 1, 2, ...).' },
  '(?: )': { name: 'non-capturing group', def: 'Groups without capturing. Use when you need grouping but do not need to reference the match.' },
  '(?<name>)': { name: 'named group', def: '(?<year>\\d{4}) captures into a name you can reference, instead of a number.' },

  // Alternation & backrefs
  '|':   { name: 'alternation (OR)', def: 'cat|dog matches "cat" OR "dog". Lowest precedence, so it splits the whole pattern unless grouped.' },
  '\\1': { name: 'backreference', def: 'Matches the SAME text that capture group 1 matched. (\\w)\\1 finds a doubled character.' },
  '\\k<name>': { name: 'named backreference', def: 'Like \\1 but references a named group: \\k<word>.' },

  // Lookaround
  '(?= )':  { name: 'lookahead', def: 'Zero-width. Asserts what FOLLOWS without consuming it. \\d(?=px) matches a digit only if "px" follows.' },
  '(?! )':  { name: 'negative lookahead', def: 'Asserts what does NOT follow. q(?!u) matches a q not followed by u.' },
  '(?<= )': { name: 'lookbehind', def: 'Asserts what PRECEDES without consuming it. (?<=\\$)\\d+ matches digits after a $.' },
  '(?<! )': { name: 'negative lookbehind', def: 'Asserts what does NOT precede.' },

  // Flags
  'g':   { name: 'global flag', def: 'Find ALL matches, not just the first. Required for find-all and replace-all.' },
  'i':   { name: 'ignoreCase flag', def: 'Case-insensitive matching: /cat/i matches "Cat", "CAT".' },
  'm':   { name: 'multiline flag', def: 'Makes ^ and $ match at the start/end of each LINE, not just the whole string.' },
  's':   { name: 'dotAll flag', def: 'Makes . match newline characters too.' },
  'u':   { name: 'unicode flag', def: 'Enables full Unicode mode (proper handling of code points and \\u{...}).' },
  'y':   { name: 'sticky flag', def: 'Matches only starting exactly at lastIndex, no scanning ahead.' },

  // Replacement
  '$1':  { name: 'replacement ref', def: 'In a replacement string, $1 inserts what group 1 captured. $& inserts the whole match.' }
};

RXT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new tokens this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = RXT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
RXT.escapeHtml = escapeHtml;
