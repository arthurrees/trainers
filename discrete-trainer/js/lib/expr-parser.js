// expr-parser.js — propositional logic parser, evaluator, truth tables
window.DMT = window.DMT || {};
DMT.lib = DMT.lib || {};

DMT.lib.expr = (function () {
  function tokenize(input) {
    var tokens = [];
    var i = 0;
    while (i < input.length) {
      var c = input[i];
      if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
      if (c === '(') { tokens.push({ type: 'LPAREN', value: c }); i++; continue; }
      if (c === ')') { tokens.push({ type: 'RPAREN', value: c }); i++; continue; }

      // Multi-char ASCII ops
      if (input.substr(i, 3) === '<->') { tokens.push({ type: 'IFF', value: '<->' }); i += 3; continue; }
      if (input.substr(i, 3) === '<=>') { tokens.push({ type: 'IFF', value: '<=>' }); i += 3; continue; }
      if (input.substr(i, 2) === '->') { tokens.push({ type: 'IMP', value: '->' }); i += 2; continue; }
      if (input.substr(i, 2) === '=>') { tokens.push({ type: 'IMP', value: '=>' }); i += 2; continue; }
      if (input.substr(i, 2) === '&&') { tokens.push({ type: 'AND', value: '&&' }); i += 2; continue; }
      if (input.substr(i, 2) === '||') { tokens.push({ type: 'OR', value: '||' }); i += 2; continue; }

      // Unicode ops
      if (c === '¬' || c === '~' || c === '!') { tokens.push({ type: 'NOT', value: c }); i++; continue; }
      if (c === '∧' || c === '&') { tokens.push({ type: 'AND', value: c }); i++; continue; }
      if (c === '∨' || c === '|') { tokens.push({ type: 'OR', value: c }); i++; continue; }
      if (c === '⊕') { tokens.push({ type: 'XOR', value: c }); i++; continue; }
      if (c === '→') { tokens.push({ type: 'IMP', value: c }); i++; continue; }
      if (c === '↔') { tokens.push({ type: 'IFF', value: c }); i++; continue; }

      // Words / vars / constants
      var rest = input.substr(i);
      var m = rest.match(/^[A-Za-z][A-Za-z0-9_]*/);
      if (m) {
        var w = m[0];
        var lower = w.toLowerCase();
        if (lower === 'not') tokens.push({ type: 'NOT', value: w });
        else if (lower === 'and') tokens.push({ type: 'AND', value: w });
        else if (lower === 'or') tokens.push({ type: 'OR', value: w });
        else if (lower === 'xor') tokens.push({ type: 'XOR', value: w });
        else if (lower === 'implies') tokens.push({ type: 'IMP', value: w });
        else if (lower === 'iff') tokens.push({ type: 'IFF', value: w });
        else if (w === 'T' || lower === 'true') tokens.push({ type: 'TRUE', value: w });
        else if (w === 'F' || lower === 'false') tokens.push({ type: 'FALSE', value: w });
        else tokens.push({ type: 'VAR', value: w });
        i += w.length;
        continue;
      }

      if (c === '1') { tokens.push({ type: 'TRUE', value: c }); i++; continue; }
      if (c === '0') { tokens.push({ type: 'FALSE', value: c }); i++; continue; }

      throw new Error('Unexpected character "' + c + '"');
    }
    return tokens;
  }

  function parse(input) {
    var tokens = tokenize(input);
    var pos = 0;

    function peek() { return tokens[pos]; }
    function eat(type) { if (tokens[pos] && tokens[pos].type === type) return tokens[pos++]; return null; }

    function parseIff() {
      var left = parseImp();
      while (peek() && peek().type === 'IFF') {
        pos++;
        var right = parseImp();
        left = { type: 'iff', l: left, r: right };
      }
      return left;
    }
    function parseImp() {
      var left = parseOr();
      if (peek() && peek().type === 'IMP') {
        pos++;
        // right-associative
        var right = parseImp();
        return { type: 'imp', l: left, r: right };
      }
      return left;
    }
    function parseOr() {
      var left = parseAnd();
      while (peek() && (peek().type === 'OR' || peek().type === 'XOR')) {
        var op = peek().type === 'OR' ? 'or' : 'xor';
        pos++;
        var right = parseAnd();
        left = { type: op, l: left, r: right };
      }
      return left;
    }
    function parseAnd() {
      var left = parseNot();
      while (peek() && peek().type === 'AND') {
        pos++;
        var right = parseNot();
        left = { type: 'and', l: left, r: right };
      }
      return left;
    }
    function parseNot() {
      if (peek() && peek().type === 'NOT') {
        pos++;
        return { type: 'not', v: parseNot() };
      }
      return parseAtom();
    }
    function parseAtom() {
      var t = peek();
      if (!t) throw new Error('Unexpected end of expression');
      if (t.type === 'TRUE') { pos++; return { type: 'true' }; }
      if (t.type === 'FALSE') { pos++; return { type: 'false' }; }
      if (t.type === 'VAR') { pos++; return { type: 'var', name: t.value }; }
      if (t.type === 'LPAREN') {
        pos++;
        var e = parseIff();
        if (!eat('RPAREN')) throw new Error('Missing closing parenthesis');
        return e;
      }
      throw new Error('Unexpected token "' + t.value + '"');
    }

    if (tokens.length === 0) throw new Error('Empty expression');
    var ast = parseIff();
    if (pos < tokens.length) throw new Error('Unexpected token "' + tokens[pos].value + '"');
    return ast;
  }

  function evaluate(ast, env) {
    switch (ast.type) {
      case 'true': return true;
      case 'false': return false;
      case 'var': return !!env[ast.name];
      case 'not': return !evaluate(ast.v, env);
      case 'and': return evaluate(ast.l, env) && evaluate(ast.r, env);
      case 'or':  return evaluate(ast.l, env) || evaluate(ast.r, env);
      case 'xor': return evaluate(ast.l, env) !== evaluate(ast.r, env);
      case 'imp': {
        var lv = evaluate(ast.l, env);
        var rv = evaluate(ast.r, env);
        return !lv || rv;
      }
      case 'iff': return evaluate(ast.l, env) === evaluate(ast.r, env);
    }
    throw new Error('Unknown node type: ' + ast.type);
  }

  function collectVars(ast) {
    var seen = {}, out = [];
    function walk(n) {
      if (!n) return;
      if (n.type === 'var') { if (!seen[n.name]) { seen[n.name] = true; out.push(n.name); } }
      walk(n.l); walk(n.r); walk(n.v);
    }
    walk(ast);
    out.sort();
    return out;
  }

  // Pretty-print AST back to a string (canonical, fully parenthesized)
  function format(ast) {
    function fmt(n) {
      switch (n.type) {
        case 'true': return 'T';
        case 'false': return 'F';
        case 'var': return n.name;
        case 'not': return '¬' + fmt(n.v);
        case 'and': return '(' + fmt(n.l) + ' ∧ ' + fmt(n.r) + ')';
        case 'or':  return '(' + fmt(n.l) + ' ∨ ' + fmt(n.r) + ')';
        case 'xor': return '(' + fmt(n.l) + ' ⊕ ' + fmt(n.r) + ')';
        case 'imp': return '(' + fmt(n.l) + ' → ' + fmt(n.r) + ')';
        case 'iff': return '(' + fmt(n.l) + ' ↔ ' + fmt(n.r) + ')';
      }
    }
    var s = fmt(ast);
    // remove outer parens if present
    if (s.charAt(0) === '(' && s.charAt(s.length - 1) === ')') s = s.slice(1, -1);
    return s;
  }

  function truthTable(input) {
    var ast = (typeof input === 'string') ? parse(input) : input;
    var vars = collectVars(ast);
    var rows = [];
    var n = Math.pow(2, vars.length);
    for (var i = 0; i < n; i++) {
      var env = {};
      for (var j = 0; j < vars.length; j++) {
        env[vars[j]] = !!(i & (1 << (vars.length - 1 - j)));
      }
      rows.push({ env: env, value: evaluate(ast, env) });
    }
    return { vars: vars, rows: rows, ast: ast };
  }

  // Compare two expressions for logical equivalence over their combined vars.
  function equivalent(a, b) {
    var astA = parse(a), astB = parse(b);
    var va = collectVars(astA), vb = collectVars(astB);
    var all = {};
    va.concat(vb).forEach(function (x) { all[x] = true; });
    var vars = Object.keys(all).sort();
    var n = Math.pow(2, vars.length);
    for (var i = 0; i < n; i++) {
      var env = {};
      for (var j = 0; j < vars.length; j++) env[vars[j]] = !!(i & (1 << (vars.length - 1 - j)));
      if (evaluate(astA, env) !== evaluate(astB, env)) return false;
    }
    return true;
  }

  // Returns a string column ('TFTFTT...') for the value of ast across canonical orderings of given vars
  function valueColumn(ast, vars) {
    var n = Math.pow(2, vars.length);
    var s = '';
    for (var i = 0; i < n; i++) {
      var env = {};
      for (var j = 0; j < vars.length; j++) env[vars[j]] = !!(i & (1 << (vars.length - 1 - j)));
      s += evaluate(ast, env) ? 'T' : 'F';
    }
    return s;
  }

  function renderTruthTable(input, options) {
    options = options || {};
    var tt = truthTable(input);
    var html = '<table class="truth-table"><thead><tr>';
    tt.vars.forEach(function (v) { html += '<th>' + DMT.escapeHtml(v) + '</th>'; });
    var label = options.label || (typeof input === 'string' ? input : format(tt.ast));
    html += '<th class="target">' + DMT.escapeHtml(label) + '</th></tr></thead><tbody>';
    tt.rows.forEach(function (r) {
      html += '<tr>';
      tt.vars.forEach(function (v) {
        html += '<td class="' + (r.env[v] ? 'true' : 'false') + '">' + (r.env[v] ? 'T' : 'F') + '</td>';
      });
      html += '<td class="target ' + (r.value ? 'true' : 'false') + '">' + (r.value ? 'T' : 'F') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }

  return {
    tokenize: tokenize,
    parse: parse,
    evaluate: evaluate,
    collectVars: collectVars,
    format: format,
    truthTable: truthTable,
    equivalent: equivalent,
    valueColumn: valueColumn,
    renderTruthTable: renderTruthTable
  };
})();
