// Level 0 — Orientation
LT.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'A program is a string of characters. The CPU runs bytes. Everything in this trainer lives in the gap between those two things.',
  glossary: ['source code', 'compiler', 'interpreter', 'machine code', 'AOT', 'JIT', 'runtime'],
  learn:
    '<p>You write code. The CPU runs bytes. Between those two facts sits a stack of machinery that this trainer is going to take apart, one layer at a time.</p>' +

    '<h4>The pipeline at 30,000 feet</h4>' +
    '<p>For a typical compiled language, your source code goes through roughly these stages on its way to running:</p>' +
    '<div class="example">' +
    '<div class="label">The pipeline</div>' +
    '<code class="inline">source code</code> → <b>lex</b> → <code class="inline">tokens</code> → <b>parse</b> → <code class="inline">AST</code> → <b>analyze</b> → <code class="inline">typed AST</code> → <b>lower</b> → <code class="inline">IR</code> → <b>optimize</b> → <code class="inline">better IR</code> → <b>codegen</b> → <code class="inline">assembly</code> → <b>assemble</b> → <code class="inline">object file</code> → <b>link</b> → <code class="inline">executable</code> → <b>load + run</b>' +
    '</div>' +
    '<p>That is a lot of stages. Real compilers have even more. Each stage takes one representation and produces a slightly lower-level (and often slightly bigger) representation.</p>' +

    '<h4>Why so many stages?</h4>' +
    '<p>Each stage solves one problem well, then hands off. <b>Lexing</b> only worries about characters becoming tokens. <b>Parsing</b> only worries about tokens becoming a tree. <b>Codegen</b> only worries about IR becoming target instructions. The intermediate forms are the contract between stages.</p>' +
    '<p>This is the same instinct as splitting a big function into small ones. Each stage is testable, replaceable, and reusable — you can plug a new front-end onto an existing back-end (Rust and C++ both target LLVM, for example).</p>' +

    '<h4>Compiler vs interpreter</h4>' +
    '<p>The first big choice in language design: do you produce a binary up-front (<b>compile</b>), or run the program directly from its tree/bytecode form (<b>interpret</b>)?</p>' +
    '<ul>' +
    '<li><b>Compiler</b> (C, Rust, Go): translate ahead of time, ship a binary. Fast at run time, slower to build, errors caught early.</li>' +
    '<li><b>Interpreter</b> (older Python, classic Ruby): hand source or bytecode to a runtime that walks it and computes results. Slower per operation, but fast iteration.</li>' +
    '<li><b>JIT</b> (modern JS engines, JVM HotSpot, .NET, PyPy): start by interpreting, then compile hot code to native at run time. Best of both, much more complex to implement.</li>' +
    '</ul>' +
    '<p>The line is fuzzier than textbooks make it sound. CPython compiles to bytecode (a compiler!) and then interprets that bytecode (an interpreter!). The <b>compiler vs interpreter</b> distinction is really about <i>where</i> the heavy lifting happens — before run time, or during it.</p>' +

    '<h4>What the CPU actually wants</h4>' +
    '<p>The CPU is a machine that fetches bytes, decodes them as instructions, and executes them. Instructions like "load a value from memory into a register," "add two registers," "jump if zero." All your beautiful abstractions — classes, generics, async/await — eventually become exactly that.</p>' +
    '<p>Every level in this trainer is one rung on the ladder between "elegant" and "what the silicon actually does."</p>' +

    '<div class="callout"><div class="label">How to use this trainer</div>' +
    'Each level has three sections: <b>Learn</b> (read), <b>Play</b> (poke at the live thing — no goal), and <b>Try</b> (3 graded puzzles). When stuck on a puzzle, use the hints — three are always available, and the third nearly gives the answer.</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Click each stage to see what comes in and what goes out.</p>' +
      '<div class="chip-row" id="lt-stage-row"></div>' +
      '<div id="lt-stage-detail" class="formula-box" style="margin-top:12px;min-height:80px;">' +
      'Pick a stage above to see what flows in and out.</div>';

    var stages = [
      { name: 'Lex', input: 'source code (a string)', output: 'tokens (a list)', why: 'Strip whitespace and group characters into atoms — numbers, names, operators.' },
      { name: 'Parse', input: 'tokens', output: 'AST (a tree)', why: 'Group tokens into nested structures: expressions, statements, blocks.' },
      { name: 'Analyze', input: 'AST', output: 'AST + type info', why: 'Resolve names, check types, attach decorations the next stages will need.' },
      { name: 'Lower to IR', input: 'typed AST', output: 'IR (a list of simple ops)', why: 'Throw away high-level abstractions; keep just basic operations on virtual registers.' },
      { name: 'Optimize', input: 'IR', output: 'better IR', why: 'Apply rewrites: fold constants, kill dead code, inline small functions.' },
      { name: 'Codegen', input: 'IR', output: 'assembly', why: 'Pick real instructions and registers; emit assembly for the target CPU.' },
      { name: 'Assemble', input: 'assembly', output: 'object file (bytes)', why: 'Encode each assembly line as the actual bytes the CPU will execute.' },
      { name: 'Link', input: 'object files + libs', output: 'executable', why: 'Resolve cross-file references; produce a single runnable binary.' },
      { name: 'Load + Run', input: 'executable', output: 'effects in the world', why: 'OS maps the binary into memory; CPU starts fetching instructions at the entry point.' }
    ];

    var row = container.querySelector('#lt-stage-row');
    var detail = container.querySelector('#lt-stage-detail');
    stages.forEach(function (s, i) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = (i + 1) + '. ' + s.name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');
        detail.innerHTML =
          '<div><b>' + LT.escapeHtml(s.name) + '</b></div>' +
          '<div class="info-line"><span class="key">in:</span>  <span class="val">' + LT.escapeHtml(s.input) + '</span></div>' +
          '<div class="info-line"><span class="key">out:</span> <span class="val">' + LT.escapeHtml(s.output) + '</span></div>' +
          '<div style="margin-top:8px;">' + LT.escapeHtml(s.why) + '</div>';
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>Which of these best describes the difference between a <b>compiler</b> and an <b>interpreter</b>?</p>',
      mountInput: function (container) {
        var opts = [
          'A compiler runs your code; an interpreter only checks the syntax.',
          'A compiler translates source ahead of time into a separate program; an interpreter executes the source (or an intermediate form) directly at run time.',
          'A compiler is faster than an interpreter because it skips lexing.',
          'A compiler is for low-level languages and an interpreter is for high-level languages.'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o, i) {
          var opt = document.createElement('option');
          opt.value = String(i); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '1') return { correct: true, feedback: 'Right. The split is "translate up front" vs "execute directly". Both still lex and parse.' };
        return { correct: false, feedback: 'Not quite — both compilers and interpreters lex, parse, and check the program. The difference is what they do AFTER that.' };
      },
      hints: [
        'A compiler does not skip any of the front-end stages — both compilers and interpreters lex and parse.',
        'Think about WHEN the work happens: before you run the program, or while it is running?',
        'Pick the option that contrasts "ahead of time" with "directly at run time".'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Put these compiler stages in the order they happen, from earliest to latest:<br>' +
              '<code class="inline">codegen</code>, <code class="inline">parse</code>, <code class="inline">link</code>, <code class="inline">lex</code>, <code class="inline">optimize</code></p>' +
              '<p>Type them comma-separated, in order:</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.style.width = '100%';
        inp.placeholder = 'e.g. lex, parse, ...';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var parts = String(v).toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var want = ['lex', 'parse', 'optimize', 'codegen', 'link'];
        if (parts.length !== want.length) {
          return { correct: false, feedback: 'Need exactly 5 stages, comma-separated.' };
        }
        for (var i = 0; i < want.length; i++) {
          if (parts[i] !== want[i]) {
            return { correct: false, feedback: 'Wrong order. Remember: characters → tokens → tree → IR → assembly → executable.' };
          }
        }
        return { correct: true, feedback: 'Yes — characters become tokens become a tree become IR become assembly become a linked binary.' };
      },
      hints: [
        'Lexing comes first: it turns the source text into a sequence of tokens.',
        'Linking is essentially last: it stitches compiled pieces into one executable.',
        'Optimization runs on IR, which exists between parsing and codegen — so optimize is between parse and codegen.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>CPython compiles your <code class="inline">.py</code> file into bytecode (you have seen <code class="inline">.pyc</code> files in <code class="inline">__pycache__/</code>) and then runs that bytecode in a virtual machine.</p>' +
              '<p>Is CPython best described as a <b>compiler</b>, an <b>interpreter</b>, or <b>both</b>? Pick the one that captures what is really going on.</p>',
      mountInput: function (container) {
        var opts = ['compiler', 'interpreter', 'both'];
        var sel = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'both') return { correct: true, feedback: 'Yes. There is a compile step (.py → bytecode) AND an interpret step (the VM walks the bytecode). The "compiler vs interpreter" line is fuzzier than it sounds.' };
        if (v === 'interpreter') return { correct: false, feedback: 'Closer than "compiler", but the .pyc files are the smoking gun: someone is doing real translation work up front.' };
        return { correct: false, feedback: 'CPython does compile to bytecode, but it does not produce a native binary — there is a VM running the bytecode at run time.' };
      },
      hints: [
        '"Compiler" and "interpreter" describe stages, not the whole system. Look for both stages here.',
        'The .pyc bytecode files prove something is doing translation. The VM that walks them at run time is doing something else.',
        'When a system both translates ahead of time AND executes from an intermediate form, you can fairly call it both.'
      ]
    }
  ]
});
