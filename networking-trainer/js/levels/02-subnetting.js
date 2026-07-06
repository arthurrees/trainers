// Level 2 — Subnetting Practice
NT.registerLevel({
  id: 2,
  title: 'Subnetting Practice',
  whyItMatters: 'A company gets one big block of addresses and has to slice it into many smaller subnets — one per office, per VLAN, per WAN link. Doing this in your head is the rite of passage for every network admin.',
  glossary: ['subnet', 'borrowed bits', 'VLSM', '/31', '/32', 'CIDR', 'prefix length', 'network address', 'broadcast address'],
  learn: ''
    + '<h4>Splitting a block into smaller blocks</h4>'
    + '<p>A /24 has 256 addresses. What if you have four offices and want each on its own subnet? You take some of the host bits and re-purpose them as <em>extra</em> network bits. This is called <strong>borrowing bits</strong>.</p>'
    + '<div class="example"><div class="label">Borrow 2 bits from a /24 → four /26s</div>'
    + '<code class="inline">192.168.1.0/24</code> (1 block of 256)<br>'
    + '<code class="inline">192.168.1.0/26</code> &nbsp;→ &nbsp;.0  – .63<br>'
    + '<code class="inline">192.168.1.64/26</code> &nbsp;→ .64 – .127<br>'
    + '<code class="inline">192.168.1.128/26</code> → .128 – .191<br>'
    + '<code class="inline">192.168.1.192/26</code> → .192 – .255'
    + '</div>'
    + '<p>The pattern: every additional <em>borrowed</em> bit doubles the number of subnets and halves the size of each.</p>'

    + '<h4>The two formulas</h4>'
    + '<p>If you split a /N into /M subnets (with M &gt; N):</p>'
    + '<ul>'
    +   '<li><strong>Number of new subnets</strong> = 2<sup>(M − N)</sup></li>'
    +   '<li><strong>Addresses per subnet</strong> = 2<sup>(32 − M)</sup></li>'
    +   '<li><strong>Usable hosts per subnet</strong> = 2<sup>(32 − M)</sup> − 2 &nbsp; <span class="muted">(minus network + broadcast)</span></li>'
    + '</ul>'

    + '<h4>Reading "X.Y.Z.W/M" — find the subnet by hand</h4>'
    + '<p>The recipe never changes:</p>'
    + '<ol>'
    +   '<li>Convert the IP to binary.</li>'
    +   '<li>Keep the first M bits, set the rest to 0 → that\'s the network address.</li>'
    +   '<li>Keep the first M bits, set the rest to 1 → that\'s the broadcast.</li>'
    + '</ol>'
    + '<div class="example"><div class="label">10.0.5.77/22 — what subnet?</div>'
    + '<code class="inline">10.0.5.77</code> = <code class="inline">00001010.00000000.00000101.01001101</code><br>'
    + 'First 22 bits = first 2 octets (16) + first 6 bits of octet 3 = <code class="inline">000001</code><br>'
    + 'Zero the rest: <code class="inline">00001010.00000000.00000100.00000000</code> = <strong>10.0.4.0/22</strong><br>'
    + 'Range: <code class="inline">10.0.4.0 – 10.0.7.255</code> &nbsp; <span class="muted">(2¹⁰ = 1024 addresses)</span>'
    + '</div>'

    + '<h4>The "magic number" shortcut</h4>'
    + '<p>For prefixes that don\'t land on octet boundaries, the trick is the <strong>block size</strong> — the size of each subnet in the octet where the boundary falls.</p>'
    + '<p><strong>Block size = 256 − (decimal value of the mask octet)</strong>.</p>'
    + '<div class="example"><div class="label">/26 → mask 255.255.255.192, block size in last octet = 256 − 192 = 64</div>'
    + 'Subnets land at multiples of 64 in the last octet: <code class="inline">.0, .64, .128, .192</code>. Done.'
    + '</div>'
    + '<div class="callout"><div class="label">Why this works</div>'
    + 'The mask octet "192" comes from the borrowed bits being 11000000 = 192. The first 0-bit is in the 64\'s place — and 64 is exactly how often a new subnet starts.'
    + '</div>'

    + '<h4>Edges worth knowing</h4>'
    + '<ul>'
    +   '<li><strong>/31 (RFC 3021)</strong> — only 2 addresses, both usable. Used on point-to-point links between routers (no broadcast needed).</li>'
    +   '<li><strong>/32</strong> — single-host "subnet". Used for loopback addresses and explicit "host routes".</li>'
    +   '<li><strong>VLSM</strong> — different subnets in the same network can have different prefix lengths. You aren\'t forced to split a /24 into equal pieces.</li>'
    + '</ul>',

  mountPlay: function (container) {
    var ip = NT.lib.ip;
    var state = { baseIp: '192.168.1.0', basePrefix: 24, borrowed: 2 };

    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Pick a base block, drag the "borrow N bits" slider, and see every resulting subnet.';
    container.appendChild(help);

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    ctrls.innerHTML =
      '<label>Base IP <input type="text" id="sub-baseip" value="' + state.baseIp + '" style="width:140px"></label>'
    + '<label>Prefix /<input type="number" id="sub-baseprefix" value="' + state.basePrefix + '" min="0" max="30" style="width:60px"></label>'
    + '<label>Borrow bits: <input type="range" id="sub-borrow" min="0" max="8" value="' + state.borrowed + '" style="width:180px"> '
    + '<span id="sub-borrow-num">' + state.borrowed + '</span></label>';
    container.appendChild(ctrls);

    var summary = document.createElement('div');
    summary.className = 'formula-box';
    summary.style.fontSize = '13px';
    container.appendChild(summary);

    var listHost = document.createElement('div');
    listHost.style.maxHeight = '320px';
    listHost.style.overflowY = 'auto';
    listHost.style.marginTop = '8px';
    container.appendChild(listHost);

    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

    function rerender() {
      state.baseIp = document.getElementById('sub-baseip').value.trim();
      state.basePrefix = clamp(parseInt(document.getElementById('sub-baseprefix').value, 10) || 0, 0, 30);
      state.borrowed = parseInt(document.getElementById('sub-borrow').value, 10);
      var maxBorrow = 32 - state.basePrefix;
      var borrowSlider = document.getElementById('sub-borrow');
      borrowSlider.max = String(Math.min(maxBorrow, 12));
      if (state.borrowed > maxBorrow) state.borrowed = maxBorrow;
      borrowSlider.value = String(state.borrowed);
      document.getElementById('sub-borrow-num').textContent = state.borrowed;

      var oct = ip.parseIPv4(state.baseIp);
      if (!oct) {
        summary.innerHTML = '<span class="muted">Invalid IP. Format: a.b.c.d</span>';
        listHost.innerHTML = '';
        return;
      }
      var newPrefix = state.basePrefix + state.borrowed;
      if (newPrefix > 32) newPrefix = 32;
      var subnets = Math.pow(2, state.borrowed);
      var addrsEach = Math.pow(2, 32 - newPrefix);
      var hostsEach = newPrefix >= 31 ? addrsEach : Math.max(0, addrsEach - 2);

      // Snap base IP to its own block (so output is sane)
      var baseInt = ip.networkInt(ip.ipToInt(oct), state.basePrefix);
      var baseStr = ip.ipToString(ip.intToIp(baseInt));

      summary.innerHTML =
        '<div><span class="muted">Base block:</span> <span class="result">' + baseStr + '/' + state.basePrefix + '</span> '
      + '<span class="muted">→ split into</span> <span class="result">' + subnets + ' × /' + newPrefix + '</span></div>'
      + '<div><span class="muted">Each subnet:</span> ' + addrsEach.toLocaleString() + ' addresses, '
      + hostsEach.toLocaleString() + ' usable hosts</div>'
      + '<div><span class="muted">New mask:</span> ' + ip.ipToString(ip.maskOctetsFromPrefix(newPrefix)) + '</div>';

      // List the subnets (cap at 64 entries to stay sane)
      var maxToShow = Math.min(subnets, 64);
      var rows = '';
      for (var i = 0; i < maxToShow; i++) {
        var net = (baseInt + i * addrsEach) >>> 0;
        var bcast = (net + addrsEach - 1) >>> 0;
        rows += '<div style="font-family:var(--mono);font-size:13px;padding:2px 0">'
              + '<span class="muted">#' + i + '</span> &nbsp;'
              + '<span style="color:var(--accent)">' + ip.ipToString(ip.intToIp(net)) + '/' + newPrefix + '</span> &nbsp;'
              + '<span class="muted">range</span> ' + ip.ipToString(ip.intToIp(net)) + ' – ' + ip.ipToString(ip.intToIp(bcast))
              + '</div>';
      }
      if (subnets > maxToShow) {
        rows += '<div class="muted" style="padding:6px 0">...and ' + (subnets - maxToShow) + ' more (truncated)</div>';
      }
      listHost.innerHTML = rows;
    }

    document.getElementById('sub-baseip').addEventListener('input', rerender);
    document.getElementById('sub-baseprefix').addEventListener('input', rerender);
    document.getElementById('sub-borrow').addEventListener('input', rerender);
    rerender();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'How many <strong>total</strong> addresses are in a /27 subnet (including network + broadcast)?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'a number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 32) return { correct: true, feedback: 'Right. /27 has 32 − 27 = 5 host bits → 2⁵ = 32 addresses (30 usable + network + broadcast).' };
        if (v === 30) return { correct: false, feedback: 'Close — 30 is the count of <em>usable</em> hosts. The question asked for <em>total</em> addresses, which includes the network and broadcast.' };
        return { correct: false, feedback: 'Total addresses = 2^(32 − prefix). For /27 that is 2⁵ = 32.' };
      },
      hints: [
        'Total addresses in a /N = 2^(32 − N).',
        'For /27, that\'s 2^(32−27) = 2⁵.',
        '2⁵ = 32.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You split <code class="inline">192.168.10.0/24</code> into <strong>four equal subnets</strong>. What is the network address of the <strong>third</strong> subnet (the one numbered #2 if you start at #0)?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 192.168.10.???';
        input.style.width = '200px';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        var ip = NT.lib.ip;
        var got = ip.parseIPv4(v);
        if (!got) return { correct: false, feedback: 'That doesn\'t look like an IPv4 address. Format: a.b.c.d, each 0–255.' };
        if (ip.ipToString(got) === '192.168.10.128') {
          return { correct: true, feedback: 'Right. Splitting /24 into 4 = borrow 2 bits → /26, block size 64. Subnets: .0, .64, .128, .192. The third is .128.' };
        }
        return { correct: false, feedback: 'Not quite. 4 subnets means /26 (block size 64). The four network addresses are .0, .64, .128, .192. The third (#2) is .128. Expected: 192.168.10.128.' };
      },
      hints: [
        'Four subnets means borrowing 2 bits → /26.',
        'A /26 has 64 addresses, so subnets start every 64 in the last octet: .0, .64, .128, .192.',
        'Counting from 0: #0=.0, #1=.64, #2=.128, #3=.192. Answer: 192.168.10.128.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Which of the following CIDR blocks does the IP <code class="inline">10.0.5.77</code> belong to? <span class="muted">(Pick the one whose range contains it.)</span>',
      mountInput: function (c) {
        var opts = ['10.0.0.0/22', '10.0.4.0/22', '10.0.5.0/24', '10.0.0.0/16'];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '10.0.4.0/22') return { correct: true, feedback: 'Right. /22 covers 1024 addresses; aligned blocks are 10.0.0.0/22, 10.0.4.0/22, 10.0.8.0/22, ... 10.0.5.77 falls in 10.0.4.0/22 (range 10.0.4.0 – 10.0.7.255). And yes, 10.0.0.0/16 also contains it — but the question asks "which block" and /22 is the one shown that fits.' };
        if (v === '10.0.5.0/24') return { correct: false, feedback: '10.0.5.0/24 covers 10.0.5.0 – 10.0.5.255, which does include .77. But the question asks which of the offered /22 blocks contains it — and a /24 is not a /22. (Also: 10.0.5.0/22 isn\'t a valid network address — /22s start at multiples of 4 in the third octet.)' };
        if (v === '10.0.0.0/22') return { correct: false, feedback: '10.0.0.0/22 covers 10.0.0.0 – 10.0.3.255 — it stops just before 10.0.4.0.' };
        if (v === '10.0.0.0/16') return { correct: false, feedback: 'Technically yes — /16 contains everything in 10.0.x.x — but it\'s less specific than 10.0.4.0/22, which is the right answer here.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        '/22 has 10 host bits → blocks of 1024 addresses, or 4 consecutive third-octet values.',
        '/22 blocks under 10.0/16 align at multiples of 4 in the third octet: 10.0.0/22, 10.0.4/22, 10.0.8/22, ...',
        '10.0.5.77\'s third octet is 5, which falls in the 10.0.4 – 10.0.7 quartet → 10.0.4.0/22.'
      ]
    }
  ]
});
