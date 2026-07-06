// Level 11 — Linking & Loading
LT.registerLevel({
  id: 11,
  title: 'Linking & Loading',
  whyItMatters: 'A finished compiler emits object files, not running programs. The linker stitches everything together; the loader puts the result in memory and starts it.',
  glossary: ['linker', 'object file', 'symbol', 'relocation', 'static linking', 'dynamic linking', 'ELF', 'PE', 'loader'],
  learn:
    '<p>Each .c (or .rs, .cpp, ...) file is compiled independently into an object file. None of those objects know about each other. The <b>linker</b> is the program that combines them into a single executable, resolving every cross-reference along the way.</p>' +

    '<h4>What is in an object file?</h4>' +
    '<p>An object file is a structured container. Linux uses <b>ELF</b>, Windows uses <b>PE</b>, macOS uses Mach-O — same idea, different formats. Each object file has roughly:</p>' +
    '<ul>' +
    '<li><b>Sections</b>: <code class="inline">.text</code> (code), <code class="inline">.data</code> (initialized globals), <code class="inline">.rodata</code> (constants/strings), <code class="inline">.bss</code> (zero-initialized globals — takes no file space).</li>' +
    '<li><b>Symbol table</b>: every defined name (functions, globals) and every undefined name (things this file uses but does not define).</li>' +
    '<li><b>Relocations</b>: a list of "fix this address once you know where things end up". Anywhere code referred to a symbol, there is a relocation.</li>' +
    '</ul>' +

    '<h4>What the linker does</h4>' +
    '<ol>' +
    '<li><b>Concatenate sections</b>: take all the <code class="inline">.text</code> sections from every input object and put them next to each other; same for <code class="inline">.data</code>, etc.</li>' +
    '<li><b>Resolve symbols</b>: for each undefined symbol, find a definition in another object or library. If anything is unresolved, that is the famous "undefined reference to printf" error.</li>' +
    '<li><b>Apply relocations</b>: walk every relocation entry and patch the bytes with the correct address (or offset) now that the layout is known.</li>' +
    '<li><b>Write the executable</b>: emit the final ELF/PE binary with a complete program header so the OS knows how to load it.</li>' +
    '</ol>' +

    '<h4>Static vs dynamic linking</h4>' +
    '<p>You usually use a library (libc, libpng, ...). Two ways to consume them:</p>' +
    '<ul>' +
    '<li><b>Static linking</b> (<code class="inline">.a</code> on Linux, <code class="inline">.lib</code> on Windows): the library\'s code is COPIED into your executable. Bigger binary, no run-time dependency. Updating the library means re-linking.</li>' +
    '<li><b>Dynamic linking</b> (<code class="inline">.so</code> on Linux, <code class="inline">.dll</code> on Windows, <code class="inline">.dylib</code> on macOS): the executable just has a NOTE that it needs the library. The OS loads the .so at run time and patches up references. Smaller binaries; updates roll in without re-linking; if the .so is missing the program will not start.</li>' +
    '</ul>' +
    '<p>Most Linux programs dynamically link against glibc. Go binaries are famously statically linked. Rust statically links its standard library by default but dynamically links against the OS\'s libc. Choices, choices.</p>' +

    '<h4>The loader</h4>' +
    '<p>When you run an executable, the OS\'s <b>loader</b> takes over:</p>' +
    '<ol>' +
    '<li>Open the executable and parse its program header.</li>' +
    '<li>Map each section into memory at the right address (using mmap on Unix, MapViewOfFile on Windows). Code regions are mapped read+execute; data regions read+write; rodata read-only.</li>' +
    '<li>If the executable dynamically links against libraries, the loader (often a separate component called the <b>dynamic linker</b>, e.g. <code class="inline">ld-linux.so</code>) loads each .so, applies remaining relocations, runs library init code.</li>' +
    '<li>Set up the initial stack with command-line args and env vars.</li>' +
    '<li>Jump to the entry point (the <code class="inline">_start</code> symbol).</li>' +
    '</ol>' +
    '<p>From <code class="inline">_start</code>, the C runtime initializes globals and eventually calls your <code class="inline">main</code>. Your program is now running.</p>' +

    '<h4>Position-independent code</h4>' +
    '<p>Modern systems use <b>ASLR</b> (Address Space Layout Randomization): every program run, the OS picks new random addresses for code and libraries to make exploits harder. This requires <b>position-independent code</b>: the compiler emits code that works at any address, using PC-relative addressing instead of fixed addresses. Almost everything is PIC today.</p>' +

    '<div class="callout"><div class="label">"Undefined reference to..."</div>' +
    'When the linker yells "undefined reference to printf", it means: some object file used this symbol, but no other object file or library defined it. Either you forgot to <code class="inline">#include</code>/<code class="inline">use</code> the right thing, or you forgot the linker flag (<code class="inline">-lc</code>, <code class="inline">-lpng</code>, etc.).</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Pretend the linker. Each "object" exposes some defined symbols and uses some undefined ones. Click "Link" to see what would resolve.</p>' +
      '<div class="flex-row">' +
      '<div style="flex:1"><b>main.o</b><br><span class="muted">defines:</span> main<br><span class="muted">uses:</span> printf, square</div>' +
      '<div style="flex:1"><b>math.o</b><br><span class="muted">defines:</span> square<br><span class="muted">uses:</span> (none)</div>' +
      '<div style="flex:1" id="lt-link-libc-host"><b><label><input type="checkbox" id="lt-link-libc" checked> include libc</label></b><br><span class="muted">defines (when linked):</span> printf, _start</div>' +
      '</div>' +
      '<button id="lt-link-go" class="primary-btn" style="margin-top:10px;">Link</button>' +
      '<div id="lt-link-out" class="formula-box" style="margin-top:10px;min-height:60px;"></div>';
    var btn = container.querySelector('#lt-link-go');
    var out = container.querySelector('#lt-link-out');
    var libc = container.querySelector('#lt-link-libc');
    btn.addEventListener('click', function () {
      var defined = ['main', 'square'];
      if (libc.checked) defined.push('printf', '_start');
      var used = ['printf', 'square'];
      var unresolved = used.filter(function (u) { return defined.indexOf(u) < 0; });
      if (unresolved.length === 0) {
        out.innerHTML = '<div style="color:var(--good)">✓ Link succeeded.</div>' +
          '<div class="muted">Layout: .text contains main + square + printf. Entry: _start → main.</div>';
      } else {
        out.innerHTML = '<div style="color:var(--bad)">✗ Link failed.</div>' +
          unresolved.map(function (u) {
            return '<div class="info-line">undefined reference to <code class="inline">' + LT.escapeHtml(u) + '</code></div>';
          }).join('');
      }
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You compile <code class="inline">main.c</code> into <code class="inline">main.o</code>. The compilation succeeds. When you try to link the executable you get:</p>' +
              '<pre class="formula-box">undefined reference to `add\'</pre>' +
              '<p>What is the most likely cause?</p>',
      mountInput: function (container) {
        var opts = [
          'main.c has a syntax error.',
          'main.c calls add() but no other object file or library you linked actually defines it.',
          'The compiler is broken.',
          'Add is a reserved word.'
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
        if (v === '1') return { correct: true, feedback: 'Right. The compiler accepted a forward declaration of add (or extern), but the linker could not find a definition. Either you forgot to compile/link the file containing add, or you forgot to pass the right -l flag.' };
        if (v === '0') return { correct: false, feedback: 'The compilation succeeded — main.o was produced. So the source itself parsed fine. The error is from the linker.' };
        return { correct: false, feedback: 'Linker errors are about missing definitions across object files / libraries.' };
      },
      hints: [
        'Compilation succeeded. So this is a linker-stage error.',
        'Linker errors mean a symbol was used but no provider for it was found.',
        'Either the file with add() was not linked in, or the right library was not specified.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You compile two programs that both use libpng. With <b>static linking</b>, libpng is copied into each executable. Each executable is ~500 KB bigger.</p>' +
              '<p>With <b>dynamic linking</b>, only one copy of libpng exists on disk and (in memory if both run at once). Which choice is better when you want a binary that can be copied to a fresh machine and run with no setup?</p>',
      mountInput: function (container) {
        var opts = [
          'static linking — no runtime dependency on the target system having libpng',
          'dynamic linking — saves disk space',
          'static linking — faster at runtime',
          'dynamic linking — more secure'
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
        if (v === '0') return { correct: true, feedback: 'Right. Static linking trades size for self-containment — the binary "brings its own dependencies", so the target machine just needs the OS. This is why Go and Rust+musl deploys are popular.' };
        if (v === '1') return { correct: false, feedback: 'Dynamic linking saves space, yes — but it requires the .so to be present on the target system. The question asks about portability.' };
        return { correct: false, feedback: 'Static linking eliminates the runtime dependency. That is what makes it portable.' };
      },
      hints: [
        'Static linking copies the library code INTO the executable.',
        'That means the target machine does not need the library separately installed.',
        'Tradeoff: bigger binary, but portable.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>The OS supports <b>ASLR</b> — every time your program starts, the kernel chooses different random base addresses for the code, libraries, stack, and heap.</p>' +
              '<p>For ASLR to work without re-linking on every run, the executable must be... what?</p>',
      mountInput: function (container) {
        var opts = [
          'compiled without optimizations',
          'position-independent (uses PC-relative addressing rather than absolute addresses)',
          'statically linked',
          'larger than 4 MB'
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
        if (v === '1') return { correct: true, feedback: 'Right. PIC means the code does not bake in absolute addresses — instructions like "jump to printf" become "jump 0x12345 bytes ahead of here". The same code works at any base address. ASLR can then place the program anywhere.' };
        if (v === '2') return { correct: false, feedback: 'Static linking is orthogonal to position-independence. You can have a static + position-independent executable (PIE) too.' };
        return { correct: false, feedback: 'For ASLR to load code at a random address with no patching, the code must work regardless of where it lives in memory.' };
      },
      hints: [
        'If code uses absolute addresses, every random base means re-patching every reference.',
        'PC-relative addressing solves this: each reference is "this far from where I am".',
        'Position-independent code (PIC) — the standard answer.'
      ]
    }
  ]
});
