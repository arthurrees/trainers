// Level 2 — Lexing / Tokenization
LT.registerLevel({
  id: 2,
  title: 'Lexing & Tokenization',
  whyItMatters: 'Before a parser can think about structure, something has to chop the source string into the right atomic pieces. Get this stage wrong and nothing downstream can recover.',
  glossary: ['token', 'lexer', 'lexeme', 'tokenization', 'EOF'],
  learn:
    '<p>The first job in the pipeline is the simplest one: turn a stream of characters into a stream of <b>tokens</b>. The component that does this is the <b>lexer</b> (also called a <b>tokenizer</b> or <b>scanner</b>).</p>' +

    '<h4>What a token is</h4>' +
    '<p>A <b>token</b> is one indivisible piece of source code. The lexer reads the input one character at a time and groups characters into tokens, throwing away whitespace and comments along the way.</p>' +
    '<div class="example"><div class="label">Source → tokens</div>' +
    '<code class="inline">let x = 42 + y;</code><br>' +
    'becomes:<br>' +
    '<code class="inline">[ KW(let), IDENT(x), OP(=), NUMBER(42), OP(+), IDENT(y), PUNCT(;) ]</code>' +
    '</div>' +
    '<p>The character span that produced a token is called its <b>lexeme</b>. The token <code class="inline">KW(let)</code> came from the lexeme <code class="inline">"let"</code>. Lexers usually carry the lexeme along (for error messages) plus a line/column.</p>' +

    '<h4>The lexer\'s decisions</h4>' +
    '<p>Lexers solve a few small but real problems:</p>' +
    '<ul>' +
    '<li><b>Maximal munch</b>: when reading <code class="inline">"==="</code>, should that be three <code class="inline">=</code> ops or one <code class="inline">==</code> op followed by a <code class="inline">=</code>? Almost every language picks the longest valid token (here: <code class="inline">==</code> then <code class="inline">=</code>).</li>' +
    '<li><b>Keywords vs identifiers</b>: read characters as if for an identifier, then check the result against a keyword table. <code class="inline">if</code> looks like an identifier but lexes as a keyword.</li>' +
    '<li><b>Whitespace and comments</b>: usually skipped silently. Some languages (Python, F#, Haskell) make whitespace meaningful and emit special <code class="inline">INDENT</code>/<code class="inline">DEDENT</code> tokens.</li>' +
    '<li><b>String escapes</b>: <code class="inline">"\\n"</code> in source becomes the single newline character in the token value.</li>' +
    '</ul>' +

    '<h4>The shape of a hand-written lexer</h4>' +
    '<p>A typical hand-written lexer is just a big loop with a switch on the next character. In pseudocode:</p>' +
    '<div class="formula-box">' +
    'while (i &lt; src.length) {<br>' +
    '&nbsp;&nbsp;c = src[i];<br>' +
    '&nbsp;&nbsp;if (isDigit(c))         emit NUMBER, scan rest of digits<br>' +
    '&nbsp;&nbsp;else if (isAlpha(c))    scan identifier, look up keyword<br>' +
    '&nbsp;&nbsp;else if (c === \'"\')   scan string literal<br>' +
    '&nbsp;&nbsp;else if (isOpStart(c))  scan 1- or 2-char operator<br>' +
    '&nbsp;&nbsp;else if (isWS(c))       skip<br>' +
    '&nbsp;&nbsp;else                    error: unexpected character<br>' +
    '}' +
    '</div>' +
    '<p>That is essentially what <code class="inline">js/lib/lex.js</code> in this trainer does. The result is a list of tokens — and that list is the parser\'s input.</p>' +

    '<h4>Common lexer errors</h4>' +
    '<ul>' +
    '<li><b>Unterminated string</b>: <code class="inline">"hello</code> with no closing quote. Lexer reaches EOF mid-string.</li>' +
    '<li><b>Unexpected character</b>: <code class="inline">@</code> in a language that does not use it. The lexer has no rule that starts with <code class="inline">@</code>.</li>' +
    '<li><b>Bad escape</b>: <code class="inline">"\\q"</code> when only <code class="inline">\\n \\t \\\\ \\"</code> are recognized.</li>' +
    '</ul>' +
    '<p>Lexer errors are usually very local — you cannot get more than a few characters before the lexer trips. Compare to parser errors, which can cascade across whole programs.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Type or paste source. The lexer will list every token it produces.</p>' +
      '<textarea id="lt-lex-in" style="width:100%;min-height:80px;font-family:var(--mono);">let x = 42 + y * 3;\nif (x &gt;= 100) return "big";</textarea>' +
      '<div id="lt-lex-out" class="formula-box" style="margin-top:10px;white-space:pre-wrap;"></div>';
    var inp = container.querySelector('#lt-lex-in');
    var out = container.querySelector('#lt-lex-out');
    function update() {
      try {
        var toks = LT.lib.lex.tokenize(inp.value);
        var lines = toks.map(function (t, i) {
          return String(i).padStart(3, ' ') + '  ' + t.type.padEnd(8, ' ') + '  ' + JSON.stringify(t.value) +
            '   (line ' + t.line + ', col ' + t.col + ')';
        });
        lines.push('---  EOF');
        out.textContent = lines.join('\n');
        out.style.color = '';
      } catch (e) {
        out.textContent = e.message;
        out.style.color = 'var(--bad)';
      }
    }
    inp.addEventListener('input', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>How many tokens does this source produce, ignoring whitespace and comments?</p>' +
              '<pre class="formula-box">x = 1 + 2;</pre>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number'; inp.min = 0; inp.max = 30;
        container.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        if (v === 6) return { correct: true, feedback: 'Right. IDENT(x), OP(=), NUMBER(1), OP(+), NUMBER(2), PUNCT(;) — six tokens.' };
        return { correct: false, feedback: 'Count again. Each name, number, operator, and punctuation symbol counts as one token. Whitespace counts as zero.' };
      },
      hints: [
        'Whitespace and comments are NOT tokens.',
        'Each operator and each punctuation mark counts. The semicolon is its own token.',
        'IDENT(x), OP(=), NUMBER(1), OP(+), NUMBER(2), PUNCT(;).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>A lexer reading <code class="inline">a===b</code> with the <b>maximal munch</b> rule (longest valid token wins at each step) emits which token sequence?</p>',
      mountInput: function (container) {
        var opts = [
          '[ IDENT(a), OP(=), OP(=), OP(=), IDENT(b) ]',
          '[ IDENT(a), OP(==), OP(=), IDENT(b) ]',
          '[ IDENT(a), OP(=), OP(==), IDENT(b) ]',
          '[ IDENT(a), OP(===), IDENT(b) ]'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option'); opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Right. After IDENT(a), the lexer sees "===". With maximal munch + recognizing == but not ===, it takes "==" first, then the third "=" forms its own OP(=).' };
        if (v === '3') return { correct: false, feedback: 'Only true if the lexer recognizes a single 3-char === token. Most C-like languages stop at == — so they would split as in option 2.' };
        return { correct: false, feedback: 'Maximal munch eats the LONGEST valid token at each position. After IDENT(a), the lexer sees =, =, =. Try again.' };
      },
      hints: [
        'Maximal munch: at each position, take the longest valid prefix.',
        'After IDENT(a), the next chars are =,=,=. The lexer recognizes == as a token but not ===.',
        'So it takes == first, leaving = behind, which becomes its own token.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are designing a tiny lexer. The language has these tokens: <code class="inline">NUMBER</code> (digits), <code class="inline">IDENT</code> (letter then letters/digits), keyword <code class="inline">if</code>, operators <code class="inline">+ - * /</code>, and the comparison <code class="inline">==</code>.</p>' +
              '<p>Tokenize: <code class="inline">if2+if==3</code></p>' +
              '<p>Type your token list, comma-separated, using just the tags: <code class="inline">IDENT, KW, NUMBER, OP</code> (e.g. <code class="inline">KW, NUMBER, OP, ...</code>).</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text'; inp.style.width = '100%'; inp.placeholder = 'e.g. KW, NUMBER, OP, ...';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var parts = String(v).toUpperCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var want = ['IDENT', 'OP', 'KW', 'OP', 'NUMBER'];
        if (parts.length !== want.length) {
          return { correct: false, feedback: 'Expected ' + want.length + ' tokens, got ' + parts.length + '. Walk through the input character by character.' };
        }
        for (var i = 0; i < want.length; i++) {
          if (parts[i] !== want[i]) {
            return { correct: false, feedback: 'Mismatch at position ' + (i + 1) + '. Watch what happens with "if2" — does that start the keyword "if"?' };
          }
        }
        return { correct: true, feedback: 'Yes. "if2" is a single IDENT (maximal munch — keep eating letters/digits). Then +. Then "if" stops at == (not a letter/digit). Then ==. Then 3.' };
      },
      hints: [
        'The trick: "if2" looks like keyword "if" + number "2", but lexers use maximal munch. Once an identifier scan starts, it consumes letters AND digits.',
        'So "if2" is a single IDENT token, not KW + NUMBER.',
        'After +, the next chars are "if", then "==", then "3". The keyword check happens after scanning the full ident.'
      ]
    }
  ]
});
