# Programming Languages Trainer

Self-paced web app for learning how programming languages work end-to-end: source code → tokens → AST → typed AST → IR → optimized IR → assembly → machine code → linked executable → loaded process. Plus interpreters, runtimes, and JITs.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order) live in `../CLAUDE.md`. This file covers only what is specific to this trainer.

## Topic-specific things

- **Namespace:** `window.LT` &nbsp; · &nbsp; **Storage key:** `lt_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Audience:** developers who can read code, but have not built compilers / never seen a tokenizer or IR before.
- **Programming analogies welcome.** The user codes daily; framing IR temps as "SSA versions of a variable" or symbol tables as "nested dicts" lands well.

## Topic-specific libraries

- **`LT.lib.lex`** — tokenizer for a tiny C-like language. `tokenize(src)` returns a list of `{ type, value, line, col }`. Tokens: `NUMBER`, `STRING`, `IDENT`, `KEYWORD`, `OP`, `PUNCT`. Used by levels 1, 2, 3, 4, 5, 6, 7, 8, 13.
- **`LT.lib.parse`** — recursive-descent parser. `parse(tokens)` returns an AST: `Number`, `Bool`, `Ident`, `UnaryOp`, `BinaryOp`. Also exposes `astTree(node)` (pretty-print) and `evaluate(node, env)` (tree-walk interpreter). Used by levels 3–8, 13.
- **`LT.lib.ir`** — three-address-code helpers. `toTAC(ast)` lowers an expression AST to a list of TAC instructions. `formatTAC(tac)` pretty-prints. `constFold(tac)` and `deadCode(tac)` are simple optimization passes. Used by levels 7, 8.
- **`LT.lib.canvas`** — small drawing helper (`pos(canvas, evt)`). Currently unused in the levels but available if a later level adds a canvas visualization.

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | clickable pipeline diagram |
| 1 | Syntax vs Semantics | live lex+parse+evaluate |
| 2 | Lexing & Tokenization | textarea → token list with line/col |
| 3 | Grammars & Parsing | textbox → indented AST |
| 4 | Abstract Syntax Trees | side-by-side AST comparison (with vs without parens) |
| 5 | Semantic Analysis | mini type-checker against a fixed symbol table |
| 6 | Tree-Walking Interpreters | tiny interpreter with x/y/z bound |
| 7 | Intermediate Representation | AST → TAC side-by-side |
| 8 | Optimization | TAC before/after const-fold + DCE |
| 9 | Code Generation | toy x86-64 codegen for arithmetic |
| 10 | Assembly → Machine Code | instruction → byte breakdown |
| 11 | Linking & Loading | symbol-resolution simulator |
| 12 | Runtime Systems | mark-and-sweep GC visualizer |
| 13 | Bytecode VMs & JITs | expression → Python-style stack bytecode |

## Conventions specific to this trainer

- **The "tiny language" is consistent.** When a level says "imagine our language has these tokens" or "this is the IR for X", it is the same language `LT.lib.lex/parse` actually accepts. Stay consistent — readers wire up the picture across levels.
- **x86-64 System V calling convention** is the default reference (used in levels 9 and 10). If you reference Microsoft's x64 ABI or ARM64, label it explicitly.
- **CISC vs RISC** is introduced once in level 10. After that, just say "x86-64 / ARM64".
- **AST node shape** is `{ type: 'BinaryOp', op: '+', left, right }` etc. Match `LT.lib.parse` so the live Play surfaces line up with what the Learn sections describe.

## Cross-level integration

There are no shared globals between levels (unlike `_dmtPlayGraph` in discrete-trainer L9). Each level is self-contained. If you add cross-level integration, document it here.

## Things that are intentionally out of scope

- **Building a real compiler.** This is a mental-model trainer, not a tutorial — there are no "now write your own parser" exercises. Real compilers needs real books (Crafting Interpreters, Engineering a Compiler).
- **Specific languages.** Examples cite Python/C/Rust/JS/Go to anchor concepts, but no level requires the user to know any specific language deeply.
- **Garbage collection algorithms in depth.** L12 covers the model. Tri-color marking, write barriers, generational details belong in a dedicated GC trainer if it ever exists.
- **Type theory / Hindley-Milner inference.** Mentioned by name, not derived. Same with phi-nodes — named, not built.

## Verification before shipping

```powershell
cd "trainers\lang-trainer"
node -e "
  var fs = require('fs');
  global.window = global;
  global.document = { createElement: function(){return{appendChild:function(){},addEventListener:function(){},classList:{add:function(){},remove:function(){}},querySelectorAll:function(){return[];},style:{},insertBefore:function(){},getContext:function(){return null;}};},getElementById:function(){return{innerHTML:'',value:'',addEventListener:function(){},textContent:''};} };
  ['js/lib/lex.js','js/lib/parse.js','js/lib/ir.js','js/lib/canvas-utils.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){eval(fs.readFileSync(f,'utf8'));});
  fs.readdirSync('js/levels').sort().forEach(function(f){eval(fs.readFileSync('js/levels/'+f,'utf8'));});
  console.log('Levels: '+global.LT.levels.length+' Puzzles: '+global.LT.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
"
```

Expect: `Levels: 14 Puzzles: 42`.
