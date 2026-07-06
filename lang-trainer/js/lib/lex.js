// lex.js — tokenizer for a tiny C-like language
window.LT = window.LT || {};
LT.lib = LT.lib || {};

LT.lib.lex = (function () {
  var KEYWORDS = {
    'let': 1, 'if': 1, 'else': 1, 'while': 1, 'return': 1,
    'fn': 1, 'true': 1, 'false': 1
  };

  function isDigit(c)   { return c >= '0' && c <= '9'; }
  function isAlpha(c)   { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'; }
  function isAlphaNum(c){ return isAlpha(c) || isDigit(c); }

  function tokenize(src) {
    var tokens = [];
    var i = 0;
    var line = 1, col = 1;

    function err(msg) {
      throw new Error('Lex error (line ' + line + ', col ' + col + '): ' + msg);
    }

    while (i < src.length) {
      var c = src.charAt(i);

      // whitespace
      if (c === ' ' || c === '\t' || c === '\r') { i++; col++; continue; }
      if (c === '\n') { i++; line++; col = 1; continue; }

      // line comment
      if (c === '/' && src.charAt(i + 1) === '/') {
        while (i < src.length && src.charAt(i) !== '\n') i++;
        continue;
      }

      // numbers (int or decimal, no negatives — those are unary minus)
      if (isDigit(c)) {
        var s = '';
        var startCol = col;
        while (i < src.length && isDigit(src.charAt(i))) { s += src.charAt(i); i++; col++; }
        if (src.charAt(i) === '.' && isDigit(src.charAt(i + 1))) {
          s += '.'; i++; col++;
          while (i < src.length && isDigit(src.charAt(i))) { s += src.charAt(i); i++; col++; }
        }
        tokens.push({ type: 'NUMBER', value: s, line: line, col: startCol });
        continue;
      }

      // strings (double-quoted, with simple \n \t \\ \" escapes)
      if (c === '"') {
        var sCol = col;
        i++; col++;
        var str = '';
        while (i < src.length && src.charAt(i) !== '"') {
          if (src.charAt(i) === '\\' && src.charAt(i + 1)) {
            var esc = src.charAt(i + 1);
            if (esc === 'n') str += '\n';
            else if (esc === 't') str += '\t';
            else if (esc === '\\') str += '\\';
            else if (esc === '"') str += '"';
            else str += esc;
            i += 2; col += 2;
          } else {
            if (src.charAt(i) === '\n') { line++; col = 0; }
            str += src.charAt(i); i++; col++;
          }
        }
        if (src.charAt(i) !== '"') err('unterminated string');
        i++; col++;
        tokens.push({ type: 'STRING', value: str, line: line, col: sCol });
        continue;
      }

      // identifiers and keywords
      if (isAlpha(c)) {
        var idCol = col;
        var id = '';
        while (i < src.length && isAlphaNum(src.charAt(i))) { id += src.charAt(i); i++; col++; }
        var type = KEYWORDS[id] ? 'KEYWORD' : 'IDENT';
        tokens.push({ type: type, value: id, line: line, col: idCol });
        continue;
      }

      // two-char operators
      var two = src.substr(i, 2);
      if (two === '==' || two === '!=' || two === '<=' || two === '>=' ||
          two === '&&' || two === '||') {
        tokens.push({ type: 'OP', value: two, line: line, col: col });
        i += 2; col += 2;
        continue;
      }

      // single-char operators
      if ('+-*/=<>!'.indexOf(c) >= 0) {
        tokens.push({ type: 'OP', value: c, line: line, col: col });
        i++; col++;
        continue;
      }

      // punctuation
      if ('(){}[],;'.indexOf(c) >= 0) {
        tokens.push({ type: 'PUNCT', value: c, line: line, col: col });
        i++; col++;
        continue;
      }

      err('unexpected character "' + c + '"');
    }

    return tokens;
  }

  function tokenLabel(t) {
    if (t.type === 'NUMBER') return 'NUMBER(' + t.value + ')';
    if (t.type === 'STRING') return 'STRING("' + t.value + '")';
    if (t.type === 'IDENT')  return 'IDENT(' + t.value + ')';
    if (t.type === 'KEYWORD') return 'KW(' + t.value + ')';
    if (t.type === 'OP') return 'OP(' + t.value + ')';
    if (t.type === 'PUNCT') return 'PUNCT(' + t.value + ')';
    return t.type + '(' + t.value + ')';
  }

  return { tokenize: tokenize, tokenLabel: tokenLabel, KEYWORDS: KEYWORDS };
})();
