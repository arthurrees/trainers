// ir.js — three-address-code IR helpers + simple optimizations
window.LT = window.LT || {};
LT.lib = LT.lib || {};

LT.lib.ir = (function () {
  // Convert an expression AST into a list of three-address instructions.
  // Each instruction: { dest: 't0', op: '+', args: ['a', 'b'] }
  // Constants and idents flow through as plain strings.
  function toTAC(ast) {
    var instructions = [];
    var counter = 0;
    function fresh() { var n = 't' + counter; counter++; return n; }

    function visit(node) {
      if (node.type === 'Number') return String(node.value);
      if (node.type === 'Bool')   return String(node.value);
      if (node.type === 'Ident')  return node.name;
      if (node.type === 'UnaryOp') {
        var v = visit(node.operand);
        var d = fresh();
        instructions.push({ dest: d, op: node.op, args: [v] });
        return d;
      }
      if (node.type === 'BinaryOp') {
        var l = visit(node.left);
        var r = visit(node.right);
        var d2 = fresh();
        instructions.push({ dest: d2, op: node.op, args: [l, r] });
        return d2;
      }
      throw new Error('toTAC: unknown node ' + node.type);
    }

    var result = visit(ast);
    return { instructions: instructions, result: result };
  }

  // Format TAC as text, one instruction per line.
  function formatTAC(tac) {
    var lines = tac.instructions.map(function (i) {
      if (i.args.length === 1) return i.dest + ' = ' + i.op + i.args[0];
      return i.dest + ' = ' + i.args[0] + ' ' + i.op + ' ' + i.args[1];
    });
    lines.push('return ' + tac.result);
    return lines.join('\n');
  }

  function isNum(s) {
    if (s === 'true' || s === 'false') return false;
    var n = parseFloat(s);
    return !isNaN(n) && isFinite(n) && String(n) === String(s);
  }

  // Constant folding: fold any binop or unop whose operands are all literals,
  // and propagate the result to subsequent instructions.
  function constFold(tac) {
    var renames = {};       // tempName -> literal-as-string
    var newInstr = [];

    function deref(a) { return renames.hasOwnProperty(a) ? renames[a] : a; }

    tac.instructions.forEach(function (instr) {
      var args = instr.args.map(deref);

      if (args.length === 2 && isNum(args[0]) && isNum(args[1])) {
        var a = parseFloat(args[0]), b = parseFloat(args[1]);
        var v = null;
        if (instr.op === '+') v = a + b;
        else if (instr.op === '-') v = a - b;
        else if (instr.op === '*') v = a * b;
        else if (instr.op === '/' && b !== 0) v = a / b;
        if (v !== null) { renames[instr.dest] = String(v); return; }
      }
      if (args.length === 1 && isNum(args[0]) && instr.op === '-') {
        renames[instr.dest] = String(-parseFloat(args[0]));
        return;
      }
      newInstr.push({ dest: instr.dest, op: instr.op, args: args });
    });

    var result = deref(tac.result);
    return { instructions: newInstr, result: result };
  }

  // Dead-code elimination: drop any temp whose dest is never used (and isn't the result).
  function deadCode(tac) {
    var used = {};
    used[tac.result] = true;
    // walk backwards: anything used later marks its operands as used
    for (var i = tac.instructions.length - 1; i >= 0; i--) {
      var instr = tac.instructions[i];
      if (used[instr.dest]) {
        instr.args.forEach(function (a) { used[a] = true; });
      }
    }
    var keep = tac.instructions.filter(function (instr) { return used[instr.dest]; });
    return { instructions: keep, result: tac.result };
  }

  return { toTAC: toTAC, formatTAC: formatTAC, constFold: constFold, deadCode: deadCode };
})();
