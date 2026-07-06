// parse.js — recursive-descent parser for arithmetic + comparisons + boolean expressions
// Grammar (loosest-binding first):
//   expr       := or
//   or         := and ('||' and)*
//   and        := equality ('&&' equality)*
//   equality   := comparison (('=='|'!=') comparison)*
//   comparison := term (('<'|'>'|'<='|'>=') term)*
//   term       := factor (('+'|'-') factor)*
//   factor     := unary (('*'|'/') unary)*
//   unary      := ('-'|'!') unary | primary
//   primary    := NUMBER | true | false | IDENT | '(' expr ')'
window.LT = window.LT || {};
LT.lib = LT.lib || {};

LT.lib.parse = (function () {
  function parse(tokens) {
    var pos = 0;

    function peek() { return tokens[pos]; }
    function eat()  { return tokens[pos++]; }
    function check(type, value) {
      var t = tokens[pos];
      if (!t) return false;
      return t.type === type && (value === undefined || t.value === value);
    }
    function expect(type, value) {
      var t = tokens[pos];
      var want = value !== undefined ? '"' + value + '"' : type;
      if (!t) throw new Error('Parse error: expected ' + want + ' but reached end of input');
      if (t.type !== type || (value !== undefined && t.value !== value)) {
        throw new Error('Parse error at line ' + t.line + ', col ' + t.col +
          ': expected ' + want + ' but got "' + t.value + '"');
      }
      pos++;
      return t;
    }

    function or() {
      var left = and();
      while (check('OP', '||')) { eat(); var right = and(); left = bin('||', left, right); }
      return left;
    }
    function and() {
      var left = equality();
      while (check('OP', '&&')) { eat(); var right = equality(); left = bin('&&', left, right); }
      return left;
    }
    function equality() {
      var left = comparison();
      while (check('OP', '==') || check('OP', '!=')) {
        var op = eat().value;
        var right = comparison();
        left = bin(op, left, right);
      }
      return left;
    }
    function comparison() {
      var left = term();
      while (check('OP', '<') || check('OP', '>') || check('OP', '<=') || check('OP', '>=')) {
        var op = eat().value;
        var right = term();
        left = bin(op, left, right);
      }
      return left;
    }
    function term() {
      var left = factor();
      while (check('OP', '+') || check('OP', '-')) {
        var op = eat().value;
        var right = factor();
        left = bin(op, left, right);
      }
      return left;
    }
    function factor() {
      var left = unary();
      while (check('OP', '*') || check('OP', '/')) {
        var op = eat().value;
        var right = unary();
        left = bin(op, left, right);
      }
      return left;
    }
    function unary() {
      if (check('OP', '-') || check('OP', '!')) {
        var op = eat().value;
        return { type: 'UnaryOp', op: op, operand: unary() };
      }
      return primary();
    }
    function primary() {
      var t = peek();
      if (!t) throw new Error('Parse error: unexpected end of input');
      if (t.type === 'NUMBER') {
        eat(); return { type: 'Number', value: parseFloat(t.value) };
      }
      if (t.type === 'KEYWORD' && (t.value === 'true' || t.value === 'false')) {
        eat(); return { type: 'Bool', value: t.value === 'true' };
      }
      if (t.type === 'IDENT') {
        eat(); return { type: 'Ident', name: t.value };
      }
      if (t.type === 'PUNCT' && t.value === '(') {
        eat();
        var e = or();
        expect('PUNCT', ')');
        return e;
      }
      throw new Error('Parse error at line ' + t.line + ', col ' + t.col +
        ': unexpected token "' + t.value + '"');
    }

    function bin(op, l, r) { return { type: 'BinaryOp', op: op, left: l, right: r }; }

    var ast = or();
    if (pos < tokens.length) {
      var t2 = tokens[pos];
      throw new Error('Parse error at line ' + t2.line + ', col ' + t2.col +
        ': leftover token "' + t2.value + '" after expression');
    }
    return ast;
  }

  // Pretty-print an AST as an indented tree (string).
  function astTree(node, indent) {
    indent = indent || '';
    if (!node) return '';
    var label;
    if (node.type === 'Number') label = 'Number ' + node.value;
    else if (node.type === 'Bool') label = 'Bool ' + node.value;
    else if (node.type === 'Ident') label = 'Ident ' + node.name;
    else if (node.type === 'UnaryOp') label = 'UnaryOp ' + node.op;
    else if (node.type === 'BinaryOp') label = 'BinaryOp ' + node.op;
    else label = node.type;
    var out = indent + label + '\n';
    if (node.type === 'UnaryOp') out += astTree(node.operand, indent + '  ');
    else if (node.type === 'BinaryOp') {
      out += astTree(node.left, indent + '  ');
      out += astTree(node.right, indent + '  ');
    }
    return out;
  }

  // Evaluate an AST against a variable environment (object name -> value).
  function evaluate(node, env) {
    env = env || {};
    if (node.type === 'Number') return node.value;
    if (node.type === 'Bool') return node.value;
    if (node.type === 'Ident') {
      if (!env.hasOwnProperty(node.name)) throw new Error('Unknown variable: ' + node.name);
      return env[node.name];
    }
    if (node.type === 'UnaryOp') {
      var v = evaluate(node.operand, env);
      if (node.op === '-') return -v;
      if (node.op === '!') return !v;
    }
    if (node.type === 'BinaryOp') {
      var l = evaluate(node.left, env);
      var r = evaluate(node.right, env);
      switch (node.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '<': return l < r;
        case '>': return l > r;
        case '<=': return l <= r;
        case '>=': return l >= r;
        case '==': return l === r;
        case '!=': return l !== r;
        case '&&': return l && r;
        case '||': return l || r;
      }
    }
    throw new Error('Cannot evaluate node type: ' + node.type);
  }

  return { parse: parse, astTree: astTree, evaluate: evaluate };
})();
