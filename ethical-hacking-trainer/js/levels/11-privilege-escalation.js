// Level 11 — Privilege escalation (Linux focus)
EHT.registerLevel({
  id: 11,
  title: 'Privilege Escalation (Linux)',
  whyItMatters: 'Initial foothold on a box rarely lands you as root. Privilege escalation is how you go from "I have a shell as www-data" to "I have a root shell." A handful of misconfigurations dominate real-world findings; knowing them lets you find them in minutes.',
  glossary: ['SUID', 'sudo', 'capabilities', 'PATH hijack'],
  learn: ''
    + '<h4>The privilege model on Linux</h4>'
    + '<p>Each process runs under a UID (user) and GIDs (groups). UID 0 is root — bypasses (almost) all access checks. Files have <strong>permissions</strong> for owner, group, and other (the rwx triplets). Processes inherit identity from their parent on <code>fork()</code>. <code>execve()</code> normally preserves identity — except in special cases below.</p>'

    + '<h4>SUID — Set User ID</h4>'
    + '<p>If a binary has the SUID bit set, it runs as its OWNER, not as the user who invoked it. Common example: <code>/usr/bin/passwd</code> is owned by root and SUID. When a user runs <code>passwd</code>, the process runs as root (because passwd needs to edit <code>/etc/shadow</code>, which is root-only).</p>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> ls -la /usr/bin/passwd\n'
    + '-rw<span class="hi">s</span>r-xr-x 1 <span class="hi">root</span> root 68208 Nov 24 2022 /usr/bin/passwd'
    + '</div>'
    + '<p>The <code>s</code> in the owner-execute position is the SUID bit. Octal mode is <code>4755</code> (the 4 is SUID).</p>'
    + '<p><strong>The privesc opportunity</strong>: any SUID-root binary you can manipulate to do something arbitrary becomes a root-shell vector. Three shapes:</p>'
    + '<ol>'
    +   '<li><strong>Custom SUID binary</strong> with a bug (BoF, command injection in a system() call).</li>'
    +   '<li><strong>SUID binary intended to be safe</strong> but operates on user-controlled data unsafely.</li>'
    +   '<li><strong>SUID binary that already does dangerous things</strong> by design — listed on GTFOBins.</li>'
    + '</ol>'
    + '<div class="callout"><div class="label">GTFOBins</div>'
    + '<a href="https://gtfobins.github.io" target="_blank">gtfobins.github.io</a> catalogs Linux binaries that, if SUID-root, give you a root shell — often as a one-liner. <code>find . -exec /bin/sh \\; -quit</code> for a SUID find. <code>vim -c \':!/bin/sh\'</code> for SUID vim. Routine pentest enumeration: <code>find / -perm -u=s -type f 2>/dev/null</code>; check each result against GTFOBins.'
    + '</div>'

    + '<h4>sudo misconfiguration</h4>'
    + '<p>sudo lets users run specific commands as another user. <code>/etc/sudoers</code> rules:</p>'
    + '<div class="terminal">'
    + '<span class="prompt">$</span> sudo -l   <span class="out"># show what current user can sudo</span>\n'
    + 'User www-data may run the following commands:\n'
    + '    (root) NOPASSWD: /usr/bin/find\n'
    + '    (root) NOPASSWD: /usr/bin/awk'
    + '</div>'
    + '<p>Both <code>find</code> and <code>awk</code> are GTFOBins entries — you can spawn a shell from inside them. <code>sudo find . -exec /bin/sh \\; -quit</code> → root shell.</p>'
    + '<p>Other sudo gotchas:</p>'
    + '<ul>'
    +   '<li><code>(root) /usr/bin/vim /var/www/log.txt</code> — vim has shell escape; you get root shell from inside vim.</li>'
    +   '<li><code>(root) /usr/local/bin/myscript</code> — if myscript calls binaries unqualified AND sudo preserves PATH, PATH-hijack escalation.</li>'
    +   '<li>Old sudo CVEs (Baron Samedit, etc.) — heap overflow bypassing rules.</li>'
    + '</ul>'

    + '<h4>Linux capabilities</h4>'
    + '<p>Capabilities split root\'s power into ~40 named privileges. Granted via <code>setcap</code> or filesystem attributes. Useful examples that are equivalent to root if granted to a binary:</p>'
    + '<ul>'
    +   '<li><code>cap_setuid+ep</code> — can become any user (= root).</li>'
    +   '<li><code>cap_sys_admin+ep</code> — kitchen-sink "almost root."</li>'
    +   '<li><code>cap_dac_override+ep</code> — bypass file permissions for read/write.</li>'
    +   '<li><code>cap_sys_ptrace+ep</code> — attach to and read memory of any process.</li>'
    + '</ul>'
    + '<p>Find them: <code>getcap -r / 2>/dev/null</code>. Treat any capability-granted binary like a SUID binary in your enumeration.</p>'

    + '<h4>PATH hijack</h4>'
    + '<p>If a privileged script calls a command without a full path AND a directory you control is earlier in <code>$PATH</code>, you replace the command:</p>'
    + '<div class="terminal">'
    + '<span class="out"># /etc/cron.d/backup runs as root, every minute</span>\n'
    + '* * * * * root cd /tmp; <span class="bad">tar</span> -czf /backup/snap.tgz /var/www\n'
    + '\n'
    + '<span class="out"># Attacker (any user with write to a $PATH dir) does:</span>\n'
    + '$ echo "/bin/bash -p" &gt; /usr/local/bin/tar\n'
    + '$ chmod +x /usr/local/bin/tar\n'
    + '\n'
    + '<span class="out"># /usr/local/bin is earlier in $PATH than /usr/bin</span>\n'
    + '<span class="out"># cron runs the attacker\'s "tar" → root shell.</span>'
    + '</div>'
    + '<p>Defense: full paths in scripts (<code>/usr/bin/tar</code> not <code>tar</code>); restrict <code>$PATH</code> in cron; avoid mixing user-writable dirs into root\'s <code>$PATH</code>.</p>'

    + '<h4>Kernel exploits</h4>'
    + '<p>If the kernel is old, public exploits exist for many CVEs (Dirty Pipe, Dirty COW, etc.). Run <code>uname -a</code>; check the kernel version against searchsploit. <strong>Kernel exploits crash boxes regularly</strong> — pentesters get explicit permission first.</p>'

    + '<h4>The privesc enumeration loop</h4>'
    + '<ol>'
    +   '<li><code>id; uname -a; cat /etc/os-release</code></li>'
    +   '<li><code>sudo -l</code></li>'
    +   '<li><code>find / -perm -u=s -type f 2>/dev/null</code> (SUID hunt)</li>'
    +   '<li><code>getcap -r / 2>/dev/null</code> (capabilities hunt)</li>'
    +   '<li><code>cat /etc/crontab; ls -la /etc/cron.d /etc/cron.*/</code> (cron jobs)</li>'
    +   '<li>Look at <code>$PATH</code> and writable dirs in it.</li>'
    +   '<li>Check world-writable / group-writable files in sensitive paths.</li>'
    +   '<li>Run an automated tool: <code>linpeas.sh</code>, <code>linenum.sh</code>.</li>'
    + '</ol>'
    + '<p><strong>linpeas</strong> alone gets you 80% of the findings. Manual exploration handles the rest.</p>'

    + '<div class="callout"><div class="label">Brief Windows analog</div>'
    + 'Windows privesc has analogous categories: tokens (run as another user), services (unquoted paths, weak ACLs on the service binary), AlwaysInstallElevated registry, scheduled tasks, kernel exploits. <code>winPEAS</code> or <code>PowerUp</code> automates enumeration. The user has Kali for Linux practice; for Windows, stand up a vulnerable VM (e.g., HackTheBox\'s "Optimum" or "Bashed") and use winPEAS in a controlled environment.'
    + '</div>',

  mountPlay: function (container) {
    var eh = EHT.lib.eh;
    container.innerHTML = '<p class="muted">A simulated <code>find / -perm -u=s</code> output. Click each binary to see if it\'s an obvious privesc vector via GTFOBins.</p>';
    var rows = [
      { name: '/usr/bin/passwd',       mode: 'rwsr-xr-x', owner: 'root', dangerous: false, note: 'Standard SUID; legitimate. Used for password change. Not a privesc vector by itself.' },
      { name: '/usr/bin/sudo',         mode: 'rwsr-xr-x', owner: 'root', dangerous: false, note: 'Standard SUID. Whether it grants you root depends on /etc/sudoers entries (see sudo -l).' },
      { name: '/usr/bin/find',         mode: 'rwsr-xr-x', owner: 'root', dangerous: true,  note: 'GTFOBins entry: find . -exec /bin/sh \\; -quit → root shell. Treat as compromise.' },
      { name: '/usr/bin/vim',          mode: 'rwsr-xr-x', owner: 'root', dangerous: true,  note: 'GTFOBins: open vim, type :!/bin/sh — root shell. Almost never legitimately SUID.' },
      { name: '/usr/bin/python3.11',   mode: 'rwsr-xr-x', owner: 'root', dangerous: true,  note: 'GTFOBins: python3 -c "import pty; pty.spawn(\'/bin/sh\')" — root shell. Never legitimately SUID.' },
      { name: '/usr/bin/cp',           mode: 'rwxr-xr-x', owner: 'root', dangerous: false, note: 'Not SUID (no s in mode). Normal binary.' },
      { name: '/opt/legacy/backup_helper', mode: 'rwsr-xr-x', owner: 'root', dangerous: true, note: 'Custom SUID binary written in C. Attack surface: dump it, RE in Ghidra, look for command injection / format string / argv mishandling.' }
    ];
    var grid = document.createElement('div'); grid.className = 'chip-row'; grid.style.marginBottom = '12px';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a binary</span>';
    rows.forEach(function (r) {
      var b = document.createElement('button'); b.className = 'chip';
      b.style.maxWidth = '320px'; b.style.whiteSpace = 'normal'; b.style.textAlign = 'left';
      b.innerHTML = '<code>' + r.mode + '</code> <span style="color:var(--accent)">' + r.owner + '</span> ' + r.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(grid.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        var perm = eh.parsePerm(r.mode);
        output.innerHTML =
          '<div class="info-line"><span class="key">Path:</span> <span class="val">' + r.name + '</span></div>' +
          '<div class="info-line"><span class="key">Mode:</span> <span class="val">' + r.mode + ' (' + perm.octal + ')</span></div>' +
          '<div class="info-line"><span class="key">SUID:</span> <span class="val">' + (perm.suid ? '<span style="color:var(--bad)">yes — runs as ' + r.owner + '</span>' : 'no') + '</span></div>' +
          '<div class="info-line"><span class="key">Privesc?</span> <span class="val">' + (r.dangerous ? '<span style="color:var(--bad)">YES — exploitable</span>' : 'No (or not directly)') + '</span></div>' +
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + r.note + '</span></div>';
      });
      grid.appendChild(b);
    });
    container.appendChild(grid);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You\'re on a box as <code>www-data</code> (web server user). What\'s the FIRST command of the standard privesc enumeration loop?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option><code>id; uname -a</code> — basic context</option>' +
          '<option><code>cat /etc/shadow</code> — try to read passwords</option>' +
          '<option><code>./binary_exploit_kernel_cve.sh</code> — go straight to kernel exploit</option>' +
          '<option><code>rm -rf /</code></option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '<code>id; uname -a</code> — basic context') return { correct: true, feedback: 'Right. Always start with context: who are you running as, what kernel, what distro? Determines which exploits even apply, what user/group memberships you have, what initial privileges. Skipping straight to "try shadow" or "kernel exploit" without context is amateur.' };
        if (v === '<code>cat /etc/shadow</code> — try to read passwords') return { correct: false, feedback: '/etc/shadow is root-readable only. As www-data you\'ll get permission denied. (Useful in some specific scenarios — but not the FIRST step.)' };
        if (v === '<code>./binary_exploit_kernel_cve.sh</code> — go straight to kernel exploit') return { correct: false, feedback: 'Without uname -a you don\'t even know if your kernel is vulnerable. Plus kernel exploits crash boxes — last resort.' };
        if (v === '<code>rm -rf /</code>') return { correct: false, feedback: 'Don\'t.' };
        return { correct: false, feedback: 'Always context first.' };
      },
      hints: [
        'Before exploitation, learn the environment.',
        '<code>id</code> shows uid/gid/groups; <code>uname -a</code> shows kernel version.',
        'id; uname -a.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You run <code>sudo -l</code> as user <code>backup</code> and see: <code>(root) NOPASSWD: /usr/bin/tar -czf * *</code>. What\'s the privesc?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>None — tar is benign</option>' +
          '<option>Use tar\'s --checkpoint-action=exec=sh feature: <code>sudo tar -czf /tmp/x --checkpoint=1 --checkpoint-action=exec=/bin/sh /etc</code> — root shell at first checkpoint.</option>' +
          '<option>Brute-force the root password</option>' +
          '<option>Modify /etc/sudoers directly</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Use tar\'s --checkpoint-action=exec=sh feature') === 0) return { correct: true, feedback: 'Right. tar has a feature where checkpoints can run a command. With NOPASSWD sudo, that command runs as root. The "* *" wildcards in the sudoers entry are dangerously permissive — they let you pass arbitrary args including --checkpoint-action. This is straight from GTFOBins. Defense: the sudoers rule should pin the EXACT command (<code>/usr/bin/tar -czf /backup/today.tgz /var/www</code>) with no wildcard args.' };
        if (v === 'None — tar is benign') return { correct: false, feedback: 'tar has multiple shell-spawning features (checkpoint-action, --to-command). On GTFOBins.' };
        if (v === 'Brute-force the root password') return { correct: false, feedback: 'You don\'t need to — you have NOPASSWD sudo to a binary that spawns shells.' };
        if (v === 'Modify /etc/sudoers directly') return { correct: false, feedback: 'You don\'t have write access to /etc/sudoers as user backup.' };
        return { correct: false, feedback: 'Check GTFOBins for "tar".' };
      },
      hints: [
        'Look up tar on GTFOBins.',
        'tar has a --checkpoint-action feature that can exec arbitrary commands.',
        'sudo tar with --checkpoint=1 --checkpoint-action=exec=/bin/sh.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You find a SUID-root binary at <code>/opt/inhouse/backup-helper</code>. <code>file</code> says ELF 64-bit, dynamically linked, not stripped. <code>strings</code> shows references to <code>system(</code> and the literal <code>"tar -czf %s"</code>. Decompile it in Ghidra and find: <code>sprintf(cmd, "tar -czf %s", argv[1]); system(cmd);</code>. What attacker-input gives you a root shell, and what\'s the structural fix?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Pass <code>"; /bin/sh #"</code> as argv[1] — sprintf produces "tar -czf ; /bin/sh #" → system runs the shell. Fix: never use system()/sprintf with user input. Use execve() with arg array, or input allow-list, or remove SUID entirely.</option>' +
          '<option>Buffer overflow on argv[1]</option>' +
          '<option>Race condition between the sprintf and system call</option>' +
          '<option>None — sprintf is safe</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('Pass') === 0 && v.indexOf('"; /bin/sh #"') > -1) return { correct: true, feedback: 'Right. Classic command injection via system(). The semicolon ends the tar command, /bin/sh launches a shell, # comments out anything trailing. Since the binary is SUID-root, system() inherits root privilege, so the shell is a root shell. Structural fixes: (1) never call system() on user-derived strings — use execve() with an arg array (the shell isn\'t involved, no parsing); (2) if you need to invoke a sub-process by name, allow-list args; (3) ask whether SUID is necessary at all — often a setuid bit is removable in favor of capabilities or a properly-restricted sudoers rule.' };
        if (v === 'Buffer overflow on argv[1]') return { correct: false, feedback: 'sprintf into a fixed-size cmd buffer might also be a BoF, but the IMMEDIATE vuln is command injection via system() — much easier to weaponize.' };
        if (v === 'Race condition between the sprintf and system call') return { correct: false, feedback: 'No race here.' };
        if (v === 'None — sprintf is safe') return { correct: false, feedback: 'sprintf concatenates user input into a shell command line. Anything but the most paranoid filtering allows command injection.' };
        return { correct: false, feedback: 'How do you escape "tar -czf USER_INPUT"? With shell metacharacters.' };
      },
      hints: [
        'system() runs <strong>through a shell</strong>. What if the user includes shell metacharacters?',
        'Semicolon ends the tar command; /bin/sh starts a new one; # comments out the rest.',
        'argv[1] = "; /bin/sh #". Fix: execve() with arg array, never system() with user input.'
      ]
    }
  ]
});
