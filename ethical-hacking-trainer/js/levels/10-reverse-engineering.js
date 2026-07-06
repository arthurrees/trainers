// Level 10 — Reverse engineering 101
EHT.registerLevel({
  id: 10,
  title: 'Reverse Engineering 101',
  whyItMatters: 'Reverse engineering is reading machine code or stripped binaries to understand what they do. It\'s used in malware analysis, license-cracking (legal issues vary), CTFs, and security research. The 80/20 of useful skill is "strings + objdump + a decompiler" — covered here.',
  glossary: ['strings', 'objdump', 'Ghidra', 'YARA'],
  learn: ''
    + '<h4>The toolchain</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Tool</th><th>What it does</th><th>When to reach for it</th></tr>'
    + '<tr><td><code>file</code></td><td>Identifies file type (ELF, PE, Mach-O, what arch)</td><td>Always first. Ten seconds, eliminates guessing.</td></tr>'
    + '<tr><td><code>strings</code></td><td>Print all printable ASCII/Unicode runs</td><td>Always second. Finds hardcoded strings — URLs, paths, error messages, sometimes flags.</td></tr>'
    + '<tr><td><code>nm</code> / <code>readelf</code></td><td>Symbol tables, sections (Linux)</td><td>If unstripped: see function names, imports.</td></tr>'
    + '<tr><td><code>objdump -d</code></td><td>Disassemble to assembly</td><td>For when you need to see actual instructions.</td></tr>'
    + '<tr><td><strong>Ghidra</strong></td><td>NSA\'s open-source RE suite. Includes a decompiler that produces C-like pseudocode.</td><td>The big tool. Used everywhere from CTFs to malware analysis.</td></tr>'
    + '<tr><td>IDA Pro / Hopper / Binary Ninja</td><td>Commercial alternatives</td><td>Each has its niches; Ghidra free version covers 90%.</td></tr>'
    + '<tr><td><code>gdb</code> / <code>radare2</code></td><td>Live debuggers</td><td>When static analysis isn\'t enough — step through the binary.</td></tr>'
    + '<tr><td><code>strace</code> / <code>ltrace</code></td><td>System / library call tracers</td><td>"What syscalls does this make?" — fast malware behavior overview.</td></tr>'
    + '</table>'

    + '<h4>The cheap-first methodology</h4>'
    + '<ol>'
    +   '<li><code>file binary</code> — what is it?</li>'
    +   '<li><code>strings binary | grep -i "interesting"</code> — flag, key, URL, password.</li>'
    +   '<li><code>nm binary</code> — function names, if not stripped.</li>'
    +   '<li><code>strace ./binary</code> in a sandbox — what does it do at runtime?</li>'
    +   '<li>Open in Ghidra — auto-analyze, look at <code>main()</code> in the decompiler view.</li>'
    + '</ol>'
    + '<p>For 80% of CTF "find the flag in this binary" challenges, steps 1–2 are enough. The flag string is right there in the binary, often even unobfuscated.</p>'

    + '<h4>Reading disassembly without becoming an assembly expert</h4>'
    + '<p>You don\'t need to memorize x86_64 to read it. You DO need to recognize:</p>'
    + '<ul>'
    +   '<li><code>cmp</code> followed by <code>je</code> / <code>jne</code> / <code>jl</code> / <code>jg</code> — comparison + conditional jump = an <code>if</code>.</li>'
    +   '<li><code>call</code> — function call. Argument registers on x86_64 SysV: <code>rdi, rsi, rdx, rcx, r8, r9</code>.</li>'
    +   '<li><code>mov</code> — copy data.</li>'
    +   '<li><code>lea</code> — load effective address (often used to compute pointers).</li>'
    +   '<li><code>ret</code> — return.</li>'
    +   '<li><code>xor reg, reg</code> — set reg to 0 (idiom).</li>'
    + '</ul>'
    + '<p>That\'s 90% of what you need to follow control flow. Decompilers turn the rest into readable C-ish.</p>'

    + '<h4>Common CTF binary patterns</h4>'
    + '<ul>'
    +   '<li><strong>Compare-to-flag</strong>: program reads input, calls <code>strcmp(input, "flag{...}")</code>. Strings finds the flag immediately.</li>'
    +   '<li><strong>Char-by-char check</strong>: defeats <code>strings</code> by computing chars at runtime. Static analysis still trivially recovers.</li>'
    +   '<li><strong>Encoded flag</strong>: ROT13, base64, XOR with constant key. Often disassembly shows the decode loop.</li>'
    +   '<li><strong>Anti-debugging</strong>: ptrace-self, timing checks, isDebuggerPresent. Bypass: patch the check, run in a debugger, or just LD_PRELOAD a no-op ptrace.</li>'
    +   '<li><strong>Packed</strong>: UPX-packed, runtime self-decompresses. Run <code>upx -d</code> to unpack.</li>'
    + '</ul>'

    + '<h4>Malware analysis — same toolkit, different goals</h4>'
    + '<p>Same tools, but you\'re looking for:</p>'
    + '<ul>'
    +   '<li><strong>C2 endpoints</strong>: hardcoded URLs, IPs, DGA seeds.</li>'
    +   '<li><strong>Persistence mechanisms</strong>: scheduled tasks, registry run keys, services.</li>'
    +   '<li><strong>Payload behaviors</strong>: file enumeration, credential theft, encryption (ransomware).</li>'
    +   '<li><strong>Anti-analysis</strong>: VM detection, sandbox detection.</li>'
    + '</ul>'
    + '<p>Ghidra + a sandbox (Cuckoo, ANY.RUN, your-own-VM-with-no-internet) covers most needs. <strong>Run unknown binaries only in throwaway VMs without network access</strong> unless you\'re being deliberate about C2 emulation.</p>'

    + '<h4>YARA — pattern-matching for malware families</h4>'
    + '<p>YARA is a domain-specific language for "match this binary if it contains these strings AND these byte patterns AND these conditions." Used industry-wide for malware classification.</p>'
    + '<div class="example"><div class="label">Tiny YARA rule</div>'
    + '<code>rule MimikatzKnownStrings {<br>'
    + '&nbsp;&nbsp;strings:<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;$a = "sekurlsa::logonpasswords"<br>'
    + '&nbsp;&nbsp;&nbsp;&nbsp;$b = "lsadump::sam"<br>'
    + '&nbsp;&nbsp;condition: any of them<br>'
    + '}</code>'
    + '</div>'
    + '<p>Produces a quick "does this binary look like Mimikatz?" check across your file collection.</p>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">A miniature CTF binary. Click "run strings" to see what hardcoded text it contains. Then "run binary" to interact.</p>';

    // A pretend "binary" with embedded text. The "flag" is right there in the strings output —
    // mimicking real CTF level-1 binaries.
    var fakeBinary = {
      strings: [
        '/lib/x86_64-linux-gnu/libc.so.6',
        '__libc_start_main',
        '__cxa_finalize',
        'puts',
        'fgets',
        'strcmp',
        'Welcome to FlagCheck v1.0',
        'Enter password: ',
        'flag{c4ll1ng_str1ngs_w0rks}',
        'Access granted.',
        'Wrong password.',
        'GCC: (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0',
        '.shstrtab',
        '.text',
        '.data'
      ],
      // What it does at runtime (simulated)
      run: function (input) {
        if (input === 'flag{c4ll1ng_str1ngs_w0rks}') return { ok: true, msg: 'Access granted.' };
        return { ok: false, msg: 'Wrong password.' };
      }
    };

    var stringsBtn = document.createElement('button'); stringsBtn.className = 'secondary-btn'; stringsBtn.textContent = 'strings ./flagcheck';
    var runBtn = document.createElement('button'); runBtn.className = 'secondary-btn'; runBtn.textContent = './flagcheck'; runBtn.style.marginLeft = '8px';
    var input = document.createElement('input'); input.type='text'; input.placeholder='password input'; input.style.marginLeft='8px';

    var output = document.createElement('div'); output.className = 'terminal'; output.style.marginTop = '12px';
    output.innerHTML = '<span class="out">(click strings or run the binary)</span>';

    stringsBtn.addEventListener('click', function () {
      var lines = ['<span class="prompt">$</span> strings ./flagcheck'];
      fakeBinary.strings.forEach(function (s) {
        var hl = (s.indexOf('flag{') === 0) ? '<span class="hi">' + EHT.escapeHtml(s) + '</span>' : EHT.escapeHtml(s);
        lines.push(hl);
      });
      output.innerHTML = lines.join('\n');
    });
    runBtn.addEventListener('click', function () {
      var v = input.value;
      var r = fakeBinary.run(v);
      var color = r.ok ? 'hi' : 'bad';
      output.innerHTML =
        '<span class="prompt">$</span> ./flagcheck\n' +
        'Welcome to FlagCheck v1.0\n' +
        'Enter password: ' + EHT.escapeHtml(v) + '\n' +
        '<span class="' + color + '">' + r.msg + '</span>';
    });

    container.appendChild(stringsBtn);
    container.appendChild(runBtn);
    container.appendChild(input);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You\'re given an unknown ELF binary. What\'s the SINGLE BEST FIRST command to run before anything else?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option><code>./binary</code> (just run it)</option>' +
          '<option><code>file binary</code></option>' +
          '<option><code>objdump -d binary</code></option>' +
          '<option><code>strings binary | grep flag</code></option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '<code>file binary</code>') return { correct: true, feedback: 'Right. <code>file</code> tells you architecture, dynamic vs static, stripped vs not, big-endian vs little. Ten seconds; eliminates guessing about the rest of the analysis. Run it BEFORE strings (you don\'t even know if you have the right strings flavor for Unicode-heavy binaries) and BEFORE running unknown binaries (which you should ALMOST NEVER do casually).' };
        if (v === '<code>./binary</code> (just run it)') return { correct: false, feedback: 'Don\'t run unknown binaries casually. They could be malicious, networked, or destructive.' };
        if (v === '<code>objdump -d binary</code>') return { correct: false, feedback: 'Comes later. First identify what kind of file you have.' };
        if (v === '<code>strings binary | grep flag</code>') return { correct: false, feedback: 'Strings is a great early step but identifying the file first is faster and gives you context.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Identify what you\'re looking at before you analyze it.',
        'Tells you arch, dynamic linking, stripped, etc. — in 10 seconds.',
        '<code>file</code>.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A CTF binary has the flag check obfuscated as: <code>for(i=0;i&lt;14;i++){if(input[i] != (((42 + i) ^ 0x5A) - 7)) return -1;} return 0;</code>. <strong>Without running the binary</strong>, compute the flag. (Show the first 4 chars to confirm.)',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='text'; inp.placeholder='first 4 chars of flag';
        c.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        // Compute: for i=0..3: ((42+i) ^ 0x5A) - 7
        // i=0: (42 ^ 90) - 7 = 112 - 7 = 105 = 'i'
        // i=1: (43 ^ 90) - 7 = 113 - 7 = 106 = 'j'
        // i=2: (44 ^ 90) - 7 = 118 - 7 = 111 = 'o'
        // i=3: (45 ^ 90) - 7 = 119 - 7 = 112 = 'p'
        // Wait let me check: 42 in binary = 00101010, 90 = 01011010, XOR = 01110000 = 112 = 'p' (not 'i')
        // 42 ^ 90: bit-by-bit
        //   00101010
        //   01011010
        // XOR
        //   01110000  = 112 -> 'p'.  -7 = 105 -> 'i'.
        // OK my hand-math was right; what I wrote was confused. let's carefully:
        // i=0: (42 ^ 90) = 112; 112 - 7 = 105 = 'i'
        // i=1: (43 ^ 90):  00101011 XOR 01011010 = 01110001 = 113; 113 - 7 = 106 = 'j'
        // i=2: (44 ^ 90):  00101100 XOR 01011010 = 01110110 = 118; 118 - 7 = 111 = 'o'
        // i=3: (45 ^ 90):  00101101 XOR 01011010 = 01110111 = 119; 119 - 7 = 112 = 'p'
        // → "ijop"
        if (v === 'ijop') return { correct: true, feedback: 'Right. For each i: char = ((42 + i) ^ 0x5A) - 7. i=0→i, i=1→j, i=2→o, i=3→p. Static analysis recovered the flag without ever running the binary. Decompilers (Ghidra) make this kind of arithmetic transparent.' };
        return { correct: false, feedback: 'Compute char_i = ((42 + i) XOR 0x5A) - 7 for i in 0..3. → 105, 106, 111, 112 → "ijop".' };
      },
      hints: [
        'Compute the formula for each i, decode as ASCII.',
        'i=0: (42 ^ 90) − 7 = 112 − 7 = 105 = i.',
        '"ijop".'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re analyzing a suspected malware sample in your throwaway VM. <code>strings</code> shows a base64-looking blob. <code>strace</code> shows the binary calls <code>connect()</code> to several IPs and writes to <code>/etc/cron.d/.cron-update</code>. What\'s your most-defensible-priorities order of next analysis steps?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Run it on prod to see real behavior</option>' +
          '<option>(1) Snapshot the VM. (2) Decode the base64 blob. (3) Open in Ghidra; find the cron-write code path; find the C2 list. (4) Extract IOCs (hash, IPs, domains, file path) and write a YARA rule. Don\'t connect the VM to the internet.</option>' +
          '<option>Just run "rm" and move on</option>' +
          '<option>Send the IPs an angry email</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('(1) Snapshot the VM') === 0) return { correct: true, feedback: 'Right. (1) Snapshot lets you revert. (2) Decoding the base64 might reveal a script or a C2 config. (3) Static analysis in Ghidra finds the persistence mechanism (the cron.d write) and any C2 list, AGENT_ID format, etc. (4) IOC extraction lets you sweep your fleet for compromise + share with peers. Crucially: keep the VM offline so the malware can\'t actually phone home, harm hosts, or spread. This is the standard "isolated detonation" workflow used at every malware-analysis shop.' };
        if (v === 'Run it on prod to see real behavior') return { correct: false, feedback: 'NEVER run unknown malware in production. Period.' };
        if (v === 'Just run "rm" and move on') return { correct: false, feedback: 'You miss extracting IOCs that help detect compromise across your fleet.' };
        if (v === 'Send the IPs an angry email') return { correct: false, feedback: 'Not productive.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'You\'re in a throwaway VM. What do you do BEFORE doing anything else? (Hint: snapshots.)',
        'Static analysis first (Ghidra), keep the VM offline. Decode any blobs. Extract IOCs.',
        'Snapshot, decode base64, Ghidra, write YARA + IOCs.'
      ]
    }
  ]
});
