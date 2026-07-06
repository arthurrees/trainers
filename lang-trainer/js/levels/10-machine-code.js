// Level 10 — Assembly to Machine Code
LT.registerLevel({
  id: 10,
  title: 'Assembly → Machine Code',
  whyItMatters: 'The assembler is the unsung hero of the toolchain. It turns human-readable instructions into the actual bytes the CPU will fetch and execute.',
  glossary: ['opcode', 'machine code', 'assembler', 'object file'],
  learn:
    '<p>The codegen produced text — assembly source. The CPU does not run text. Something has to convert each line into the specific bytes the silicon understands. That something is the <b>assembler</b>.</p>' +

    '<h4>An instruction is a small struct</h4>' +
    '<p>Each machine instruction has a structure. For x86-64 (which is unfortunately one of the most complex encodings ever designed), an instruction can include:</p>' +
    '<ul>' +
    '<li><b>Prefix bytes</b> (optional): override operand size, address size, segment, etc.</li>' +
    '<li><b>REX prefix</b> (optional): introduced for 64-bit mode; extends register encoding.</li>' +
    '<li><b>Opcode</b>: 1–3 bytes that say WHICH instruction (add, mov, jump, ...).</li>' +
    '<li><b>ModR/M</b> (optional): encodes which registers and addressing modes are used.</li>' +
    '<li><b>SIB</b> (optional): for complex addressing like <code class="inline">[base + index*scale]</code>.</li>' +
    '<li><b>Displacement</b> (optional): an integer offset.</li>' +
    '<li><b>Immediate</b> (optional): a constant operand.</li>' +
    '</ul>' +
    '<p>Total: 1 to 15 bytes. Variable-length.</p>' +
    '<div class="example"><div class="label">Decoding "mov rax, rdi"</div>' +
    'asm:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code class="inline">mov rax, rdi</code><br>' +
    'bytes:&nbsp;&nbsp;<code class="inline">48 89 F8</code><br>' +
    '<span class="muted">48 = REX.W (64-bit operands). 89 = MOV r/m, r. F8 = ModR/M (rax destination, rdi source).</span>' +
    '</div>' +

    '<h4>RISC vs CISC</h4>' +
    '<p>x86-64 is a <b>CISC</b> (Complex Instruction Set Computer) — variable length, hundreds of instructions, weird addressing modes. Most other architectures are <b>RISC</b> (Reduced Instruction Set Computer) and have a much simpler story:</p>' +
    '<ul>' +
    '<li><b>ARM64 (AArch64)</b>: every instruction is exactly 4 bytes. Fixed encoding. About 30 instruction "shapes".</li>' +
    '<li><b>RISC-V</b>: 4-byte (or 2-byte for compressed) instructions, modular extensions, very clean encoding.</li>' +
    '</ul>' +
    '<p>Why does x86-64 keep its mess? Backwards compatibility. Code compiled in 1995 still runs. The cost is decoder complexity at the front of the CPU pipeline — modern x86 chips have entire predecode stages just to figure out where instructions begin and end.</p>' +

    '<h4>What the assembler does</h4>' +
    '<p>The assembler reads assembly text and emits an <b>object file</b>: a binary container of machine-code bytes plus some metadata. For each instruction:</p>' +
    '<ol>' +
    '<li>Identify the mnemonic (<code class="inline">add</code>, <code class="inline">mov</code>, <code class="inline">jmp</code>, ...).</li>' +
    '<li>Look at the operands (registers, immediates, memory addresses).</li>' +
    '<li>Find the encoding entry that matches that combination.</li>' +
    '<li>Emit the right prefix/opcode/ModR/M/etc bytes.</li>' +
    '</ol>' +
    '<p>For labels and external symbols (other functions, global vars), the assembler does not yet know the final address. It leaves a <b>relocation</b> in the object file — "fix this displacement later when the linker knows where everything ended up." We will cover linking next level.</p>' +

    '<h4>Reading machine code in practice</h4>' +
    '<p><code class="inline">objdump -d</code> on Linux disassembles an object file or executable, showing the bytes alongside the assembly:</p>' +
    '<div class="formula-box">' +
    '0000000000001000 &lt;main&gt;:<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;1000:&nbsp;55&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;push&nbsp;&nbsp;&nbsp;rbp<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;1001:&nbsp;48 89 e5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mov&nbsp;&nbsp;&nbsp;&nbsp;rbp,rsp<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;1004:&nbsp;b8 2a 00 00 00&nbsp;&nbsp;&nbsp;mov&nbsp;&nbsp;&nbsp;&nbsp;eax,0x2a<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;1009:&nbsp;5d&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pop&nbsp;&nbsp;&nbsp;&nbsp;rbp<br>' +
    '&nbsp;&nbsp;&nbsp;&nbsp;100a:&nbsp;c3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ret' +
    '</div>' +
    '<p>That left column is what the CPU actually fetches. The right column is what we humans wrote. The assembler is the bridge.</p>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Pick an instruction; see a sketch of its x86-64 encoding. (Encodings are illustrative — real ones depend on operands.)</p>' +
      '<select id="lt-mc-pick" style="margin-bottom:10px;"></select>' +
      '<div id="lt-mc-out" class="formula-box" style="min-height:90px;"></div>';
    var sel = container.querySelector('#lt-mc-pick');
    var out = container.querySelector('#lt-mc-out');
    var demos = [
      { asm: 'mov rax, rdi', bytes: '48 89 F8',
        parts: [['48', 'REX.W: use 64-bit operands'], ['89', 'opcode: MOV r/m, r (move register-to-register/memory)'], ['F8', 'ModR/M: dst = rax, src = rdi']] },
      { asm: 'mov eax, 42', bytes: 'B8 2A 00 00 00',
        parts: [['B8', 'opcode: MOV eax, imm32 (specific encoding for eax)'], ['2A 00 00 00', 'immediate value 42 in little-endian']] },
      { asm: 'add rax, rcx', bytes: '48 01 C8',
        parts: [['48', 'REX.W: 64-bit'], ['01', 'opcode: ADD r/m, r'], ['C8', 'ModR/M: dst = rax, src = rcx']] },
      { asm: 'ret', bytes: 'C3',
        parts: [['C3', 'opcode: near return']] },
      { asm: 'push rbp', bytes: '55',
        parts: [['55', 'opcode + register: PUSH r64 with reg = rbp']] },
      { asm: 'jmp +5', bytes: 'EB 05',
        parts: [['EB', 'opcode: JMP rel8 (short jump, 1-byte signed displacement)'], ['05', 'displacement: jump forward 5 bytes']] }
    ];
    demos.forEach(function (d, i) {
      var opt = document.createElement('option'); opt.value = String(i); opt.textContent = d.asm;
      sel.appendChild(opt);
    });
    function update() {
      var d = demos[parseInt(sel.value, 10)];
      var rows = d.parts.map(function (p) {
        return '<div class="info-line"><span class="key" style="display:inline-block;min-width:120px">' +
          LT.escapeHtml(p[0]) + '</span> <span class="val">' + LT.escapeHtml(p[1]) + '</span></div>';
      }).join('');
      out.innerHTML =
        '<div><b>' + LT.escapeHtml(d.asm) + '</b></div>' +
        '<div class="info-line"><span class="key">bytes:</span> <span class="val">' + LT.escapeHtml(d.bytes) + '</span></div>' +
        '<div style="margin-top:6px;">' + rows + '</div>';
    }
    sel.addEventListener('change', update);
    update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>Which architecture has <b>fixed-length</b> 4-byte instructions?</p>',
      mountInput: function (container) {
        var opts = ['x86-64', 'ARM64 (AArch64)', 'i386 (32-bit x86)', '6502'];
        var sel = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option'); opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'ARM64 (AArch64)') return { correct: true, feedback: 'Right. ARM64 instructions are exactly 4 bytes each. RISC-V is similar (with optional 2-byte compressed). x86 is variable length, 1–15 bytes per instruction.' };
        return { correct: false, feedback: 'x86 is famously variable length. Look for the RISC-style architecture in the list.' };
      },
      hints: [
        'RISC architectures use fixed-length instructions. CISC ones (x86) do not.',
        'The mainstream RISC architecture in mobile and Apple Silicon is...',
        'ARM64 / AArch64.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>x86-64 instruction <code class="inline">B8 2A 00 00 00</code> encodes <code class="inline">mov eax, 42</code>. The bytes <code class="inline">2A 00 00 00</code> represent the immediate value <b>42</b> stored in <b>little-endian</b> 32-bit format.</p>' +
              '<p>If the immediate were <b>1000</b> instead, what would those four bytes be (in hex)?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input'); inp.type = 'text';
        inp.placeholder = 'e.g. AA BB CC DD'; inp.style.width = '100%';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var clean = String(v).replace(/0x/gi, '').replace(/[^0-9a-fA-F\s]/g, '').trim().toUpperCase();
        var parts = clean.split(/\s+/).filter(Boolean);
        // 1000 = 0x3E8 → little-endian = E8 03 00 00
        var want = ['E8', '03', '00', '00'];
        if (parts.length !== 4) return { correct: false, feedback: 'Need exactly 4 hex bytes, separated by spaces.' };
        for (var i = 0; i < 4; i++) {
          if (parts[i].replace(/^0+/, '') !== want[i].replace(/^0+/, '') && parts[i] !== want[i]) {
            return { correct: false, feedback: '1000 in hex is 0x3E8. In little-endian 32-bit that is E8, 03, 00, 00 (low byte first).' };
          }
        }
        return { correct: true, feedback: 'Yes. 1000 = 0x000003E8. Little-endian stores the LOW byte first: E8 03 00 00.' };
      },
      hints: [
        '1000 in decimal is 0x3E8 in hex. Pad to 4 bytes: 00 00 03 E8.',
        'Little-endian reverses the BYTE order (not the digits within a byte): E8 03 00 00.',
        'Answer: E8 03 00 00.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>The assembler emits <code class="inline">call printf</code> as part of an object file. <code class="inline">printf</code> is defined in libc, not in this object file. What does the assembler put in the bytes for the displacement?</p>',
      mountInput: function (container) {
        var opts = [
          'The actual address of printf, looked up from libc.',
          'A placeholder (often zero) and a relocation entry telling the linker "fix this 4-byte displacement once you know where printf ends up".',
          'A jump to a magic instruction the OS intercepts.',
          'It refuses to assemble the file.'
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
        if (v === '1') return { correct: true, feedback: 'Yes. The assembler does not know addresses across files. It emits a placeholder plus a relocation. The linker (next level) reads relocations and patches in the right values once everything is laid out.' };
        if (v === '0') return { correct: false, feedback: 'The assembler has no way to know where printf will end up — that is decided at link time (or even runtime for dynamic linking).' };
        return { correct: false, feedback: 'Cross-file references work via relocations. The assembler leaves notes for the linker.' };
      },
      hints: [
        'Object files are produced one at a time. The assembler does not see other files.',
        'It needs to leave a "fix me later" note for whoever does see all the files.',
        'That note is a RELOCATION entry. The linker reads them.'
      ]
    }
  ]
});
