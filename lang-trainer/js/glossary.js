// glossary.js — shared glossary, rendered in sidebar
window.LT = window.LT || {};

LT.glossary = {
  // Front-end pipeline
  'source code': { name: 'source code', def: 'The text you write — what humans read and the compiler reads.' },
  'token': { name: 'token', def: 'One indivisible piece of source: a number, identifier, keyword, operator, or punctuation.' },
  'lexer': { name: 'lexer', def: 'Also "tokenizer" or "scanner". Splits source text into tokens.' },
  'lexeme': { name: 'lexeme', def: 'The exact substring of source that produced a token (e.g., the chars "while" for the while keyword).' },
  'syntax': { name: 'syntax', def: 'The grammar rules — what arrangements of tokens are valid programs.' },
  'semantics': { name: 'semantics', def: 'What a syntactically valid program means when run.' },
  'grammar': { name: 'grammar', def: 'A set of production rules that defines a language. Usually written as BNF/EBNF.' },
  'CFG': { name: 'context-free grammar', def: 'A grammar where each rule expands one nonterminal independent of context. Most programming language syntax fits here.' },
  'BNF': { name: 'BNF', def: 'Backus–Naur Form. Notation for grammars: nonterminal ::= production1 | production2 | ...' },
  'parser': { name: 'parser', def: 'Takes a stream of tokens and builds a tree (AST) — or rejects the input as a syntax error.' },
  'recursive descent': { name: 'recursive descent', def: 'A parsing technique: one mutually-recursive function per grammar rule. Easy to write by hand.' },
  'AST': { name: 'AST', def: 'Abstract Syntax Tree. The structured tree form of your program — punctuation gone, structure preserved.' },
  'parse tree': { name: 'parse tree', def: 'The full tree following the grammar exactly (every rule shows up). The AST is its trimmed-down cousin.' },
  'precedence': { name: 'precedence', def: 'Which operator binds tighter (× before +). The grammar encodes this by layering rules.' },
  'associativity': { name: 'associativity', def: 'For equal-precedence ops: does a−b−c group as (a−b)−c (left) or a−(b−c) (right)?' },
  'ambiguity': { name: 'ambiguity', def: 'A grammar is ambiguous if some input has more than one parse tree. The dangling-else is the classic example.' },

  // Middle pipeline
  'symbol table': { name: 'symbol table', def: 'Map from names (variables, functions) to their declarations and types. Per-scope.' },
  'scope': { name: 'scope', def: 'The region of code where a name is visible. Lexical scope = determined by where it is written.' },
  'binding': { name: 'binding', def: 'The act of associating a name with a declaration. "x" in this scope refers to THIS x.' },
  'type system': { name: 'type system', def: 'Rules for what types things are and which combinations are legal. Static: checked before run. Dynamic: checked at run time.' },
  'static typing': { name: 'static typing', def: 'Types are checked before the program runs. Catches bugs early; needs annotations or inference.' },
  'dynamic typing': { name: 'dynamic typing', def: 'Types are checked when an operation is about to happen. More flexible; errors come later.' },
  'type inference': { name: 'type inference', def: 'The compiler figures out a type from how a value is used, so you do not have to write it.' },
  'IR': { name: 'IR', def: 'Intermediate Representation. A simpler form between source and target — easier to analyze and optimize.' },
  'three-address code': { name: 'three-address code', def: 'IR where each instruction has at most three names: dest = src1 OP src2. Easy to generate, easy to optimize.' },
  'SSA': { name: 'SSA', def: 'Static Single Assignment: every variable is assigned exactly once. Makes data-flow analysis dramatically simpler.' },
  'basic block': { name: 'basic block', def: 'A run of straight-line IR with one entry and one exit — no jumps in the middle.' },
  'CFG (control)': { name: 'control-flow graph', def: 'Graph of basic blocks, with edges showing where control can jump. Disambiguate from "context-free grammar".' },
  'optimization': { name: 'optimization', def: 'Transform the IR into a faster/smaller equivalent. Most optimizations are local and conservative.' },
  'constant folding': { name: 'constant folding', def: 'Compute constant expressions at compile time: 2+3 becomes 5.' },
  'dead code elimination': { name: 'dead code elim', def: 'Drop computations whose results are never used.' },
  'inlining': { name: 'inlining', def: 'Replace a function call with a copy of its body. Removes call overhead and exposes more optimizations.' },
  'CSE': { name: 'CSE', def: 'Common Subexpression Elimination: if (a*b) is computed twice, do it once and reuse.' },
  'register allocation': { name: 'register allocation', def: 'Decide which values live in which CPU registers. Classic problem: graph coloring on the interference graph.' },

  // Back-end / runtime
  'code generation': { name: 'code generation', def: 'Turn IR into the target language — assembly or machine code.' },
  'calling convention': { name: 'calling convention', def: 'The rules for who-puts-what-where on a function call: which args go in which registers, who saves what, where the return value lives.' },
  'stack frame': { name: 'stack frame', def: 'The chunk of stack a function owns while running: locals, saved regs, return address.' },
  'opcode': { name: 'opcode', def: 'The numeric code in a machine instruction telling the CPU what to do (add, jump, load, ...).' },
  'machine code': { name: 'machine code', def: 'The actual bytes the CPU executes. Each architecture (x86-64, ARM64) has its own format.' },
  'assembler': { name: 'assembler', def: 'Tool that turns assembly text into machine-code bytes (one assembly line ≈ one instruction).' },
  'object file': { name: 'object file', def: 'Compiled-but-not-yet-linked output from one source file: machine code + symbols + relocations.' },
  'symbol': { name: 'symbol', def: 'A named entity in an object file (function name, global var). The linker stitches these across files.' },
  'relocation': { name: 'relocation', def: 'A "fix this address later" note left for the linker. Code referring to other modules has these.' },
  'linker': { name: 'linker', def: 'Combines object files and libraries into a single executable, resolving symbols and relocations.' },
  'static linking': { name: 'static linking', def: 'Library code is copied into the final executable. Bigger binary, no runtime dependency.' },
  'dynamic linking': { name: 'dynamic linking', def: 'Library code stays in a shared object (.so / .dll), loaded at run time. Smaller binaries, but the .so must be present.' },
  'ELF': { name: 'ELF', def: 'Executable and Linkable Format. Linux/Unix executable container.' },
  'PE': { name: 'PE', def: 'Portable Executable. Windows executable container (.exe, .dll).' },
  'loader': { name: 'loader', def: 'OS component that maps an executable into memory and starts it running.' },
  'runtime': { name: 'runtime', def: 'Code that comes with the language and runs alongside your program: GC, exception handling, type info, etc.' },
  'GC': { name: 'garbage collector', def: 'Runtime that finds unreachable objects and frees them automatically (Java, Python, Go, etc.).' },
  'heap': { name: 'heap', def: 'The dynamic-allocation region. Lives until explicitly freed or GC reaps it.' },
  'stack': { name: 'stack', def: 'Per-thread region holding stack frames. Grows down on most architectures.' },

  // Execution models
  'compiler': { name: 'compiler', def: 'Translates source code into a different (usually lower-level) language ahead of execution.' },
  'interpreter': { name: 'interpreter', def: 'Executes source (or AST/bytecode) directly, without producing a separate machine-code binary.' },
  'AOT': { name: 'AOT', def: 'Ahead-of-Time compilation. The traditional model: compile once, run the binary forever.' },
  'JIT': { name: 'JIT', def: 'Just-In-Time compilation. Compile to machine code at run time, after seeing how the code is used.' },
  'bytecode': { name: 'bytecode', def: 'A compact, portable instruction format for a virtual machine (JVM, CPython, .NET CIL, WASM).' },
  'VM': { name: 'virtual machine', def: 'Software that interprets/executes bytecode. JVM, CPython, V8, .NET CLR.' },
  'tree-walking': { name: 'tree-walking interpreter', def: 'Simplest interpreter: walk the AST and compute values as you go. Slow, but easy to write.' },
  'tracing JIT': { name: 'tracing JIT', def: 'A JIT that records hot execution traces (e.g., a loop body) and compiles those specific paths.' },
  'method JIT': { name: 'method JIT', def: 'A JIT that compiles a whole method/function once it gets hot. V8 and HotSpot use this style.' },

  // Misc
  'tokenization': { name: 'tokenization', def: 'Same as lexing — splitting source text into tokens.' },
  'syntax error': { name: 'syntax error', def: 'Parser cannot match the tokens to any rule. Caught before any code runs.' },
  'runtime error': { name: 'runtime error', def: 'Failure during execution: divide by zero, null deref, out of memory, etc.' },
  'EOF': { name: 'EOF', def: 'End of file/input. Lexer/parser need to handle this cleanly.' },
  'lookahead': { name: 'lookahead', def: 'Peeking at upcoming tokens without consuming them. Most hand-written parsers use 1-token lookahead.' },
  'side effect': { name: 'side effect', def: 'Anything an expression does besides producing a value: print, assign, file write. Constrains optimizations.' }
};

LT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = LT.glossary[key];
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
LT.escapeHtml = escapeHtml;
