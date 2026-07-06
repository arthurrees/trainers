// Level 1 — IPv4 Addresses & Subnet Masks
NT.registerLevel({
  id: 1,
  title: 'IPv4 Addresses & Subnet Masks',
  whyItMatters: 'Every device on the internet has an IP address. Reading them, knowing what counts as the "network" portion, and figuring out which addresses share a subnet is the single most useful networking skill you will ever pick up.',
  glossary: ['IPv4', 'octet', 'CIDR', 'subnet mask', 'prefix length', 'network address', 'broadcast address', 'private IP'],
  learn: ''
    + '<h4>An IPv4 address is a 32-bit number</h4>'
    + '<p>That\'s it. <code class="inline">192.168.1.10</code> is just a friendly way of writing a single 32-bit number. Humans can\'t read 32-bit numbers comfortably, so we chop it into four 8-bit chunks (called <strong>octets</strong>) and write each in decimal:</p>'
    + '<div class="example"><div class="label">Same number, three notations</div>'
    + '<code class="inline">192.168.1.10</code><br>'
    + '<code class="inline">11000000.10101000.00000001.00001010</code> &nbsp;<span class="muted">(binary)</span><br>'
    + '<code class="inline">3,232,235,786</code> &nbsp;<span class="muted">(decimal as one big number)</span>'
    + '</div>'
    + '<p>Each octet is 0–255 because that\'s the range of an 8-bit number. <code class="inline">256.0.0.1</code> is not a valid IP — there\'s no 9-bit octet.</p>'

    + '<h4>Network portion vs host portion</h4>'
    + '<p>An IP address is logically split into two parts:</p>'
    + '<ul>'
    +   '<li>The <strong>network portion</strong> — which subnet (group of hosts) this IP belongs to.</li>'
    +   '<li>The <strong>host portion</strong> — which specific host within that subnet.</li>'
    + '</ul>'
    + '<p>Where the split happens is <em>not</em> baked into the address. You have to be told. The thing that tells you is the <strong>subnet mask</strong>.</p>'

    + '<h4>The subnet mask</h4>'
    + '<p>A subnet mask is a 32-bit number where the leading bits are all 1 and the rest are all 0 — <em>contiguous</em> 1s on the left.</p>'
    + '<div class="example"><div class="label">Mask 255.255.255.0</div>'
    + '<code class="inline">11111111.11111111.11111111.00000000</code><br>'
    + '24 leading 1-bits → first 24 bits of an IP are the network, last 8 are the host.'
    + '</div>'
    + '<p>Because masks are always "n leading 1s, then 0s", you don\'t need to write the whole mask. You just say "the first n bits are network." That shorthand is <strong>CIDR notation</strong>:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">/24</span>= mask 255.255.255.0</div>'
    +   '<div class="symbol-chip"><span class="sym">/16</span>= mask 255.255.0.0</div>'
    +   '<div class="symbol-chip"><span class="sym">/8</span>= mask 255.0.0.0</div>'
    +   '<div class="symbol-chip"><span class="sym">/26</span>= mask 255.255.255.192</div>'
    + '</div>'
    + '<p>So <code class="inline">192.168.1.10/24</code> means: "this IP, with the first 24 bits being the network." The <strong>prefix length</strong> is the number after the slash.</p>'

    + '<h4>Network address & broadcast address</h4>'
    + '<p>Once you know the prefix, two special addresses fall out of the math:</p>'
    + '<ul>'
    +   '<li><strong>Network address</strong> — host bits all <em>zero</em>. Identifies the subnet itself. You can\'t assign this to a host.</li>'
    +   '<li><strong>Broadcast address</strong> — host bits all <em>one</em>. A packet sent here goes to every host on the subnet. Also can\'t be assigned to a host.</li>'
    + '</ul>'
    + '<p>So in <code class="inline">192.168.1.0/24</code>:</p>'
    + '<div class="example"><div class="label">Worked example</div>'
    + '<code class="inline">192.168.1.<strong>0</strong></code> = network address (host bits all 0)<br>'
    + '<code class="inline">192.168.1.<strong>255</strong></code> = broadcast (host bits all 1)<br>'
    + '<code class="inline">192.168.1.1</code> through <code class="inline">192.168.1.254</code> = 254 usable host addresses'
    + '</div>'

    + '<div class="callout"><div class="label">The formula</div>'
    + 'For prefix /n: total addresses = 2<sup>32&nbsp;−&nbsp;n</sup>. Usable hosts = 2<sup>32&nbsp;−&nbsp;n</sup> − 2 (subtract network + broadcast).'
    + '</div>'

    + '<h4>How to find the network address by hand</h4>'
    + '<p>Mechanical recipe: AND the IP with the mask, bit by bit.</p>'
    + '<div class="example"><div class="label">192.168.1.10/24</div>'
    + '<code class="inline">11000000.10101000.00000001.00001010</code> ← IP<br>'
    + '<code class="inline">11111111.11111111.11111111.00000000</code> ← mask (/24)<br>'
    + '<code class="inline">11000000.10101000.00000001.00000000</code> ← AND, = 192.168.1.0'
    + '</div>'
    + '<p>Practical shortcut: if the prefix lands on an octet boundary (/8, /16, /24), you don\'t need binary. Just keep that many leading octets, zero the rest.</p>'

    + '<h4>Private IP ranges (worth memorizing)</h4>'
    + '<p>These three ranges are reserved for use inside LANs only — your router uses NAT to share one public IP among all of them:</p>'
    + '<div class="symbol-row">'
    +   '<div class="symbol-chip"><span class="sym">10.0.0.0/8</span>10.x.x.x</div>'
    +   '<div class="symbol-chip"><span class="sym">172.16.0.0/12</span>172.16.x.x – 172.31.x.x</div>'
    +   '<div class="symbol-chip"><span class="sym">192.168.0.0/16</span>192.168.x.x</div>'
    + '</div>'
    + '<p>If your home router shows an IP like <code class="inline">192.168.1.42</code>, that\'s why.</p>',

  mountPlay: function (container) {
    var ip = NT.lib.ip;
    var state = { octets: [192, 168, 1, 10], prefix: 24 };

    container.innerHTML = '';

    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Drag the sliders. Watch the binary, the network portion (highlighted), the network address, broadcast, and host count update live.';
    container.appendChild(help);

    // Octet sliders row
    var octetRow = document.createElement('div');
    octetRow.className = 'controls-row';
    octetRow.style.gap = '14px';

    var octetSliders = [];
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var wrap = document.createElement('label');
        wrap.style.flexDirection = 'column';
        wrap.style.alignItems = 'flex-start';
        wrap.style.gap = '4px';
        wrap.innerHTML = '<span>Octet ' + (idx + 1) + '</span>';
        var range = document.createElement('input');
        range.type = 'range';
        range.min = '0';
        range.max = '255';
        range.value = String(state.octets[idx]);
        range.style.width = '140px';
        var num = document.createElement('input');
        num.type = 'number';
        num.min = '0';
        num.max = '255';
        num.value = String(state.octets[idx]);
        num.style.width = '70px';
        function sync(val) {
          var n = parseInt(val, 10);
          if (isNaN(n) || n < 0) n = 0;
          if (n > 255) n = 255;
          state.octets[idx] = n;
          range.value = String(n);
          num.value = String(n);
          render();
        }
        range.addEventListener('input', function () { sync(range.value); });
        num.addEventListener('input', function () { sync(num.value); });
        wrap.appendChild(range);
        wrap.appendChild(num);
        octetRow.appendChild(wrap);
        octetSliders.push({ range: range, num: num });
      })(i);
    }
    container.appendChild(octetRow);

    // Prefix slider
    var prefixRow = document.createElement('div');
    prefixRow.className = 'controls-row';
    var prefLabel = document.createElement('label');
    prefLabel.style.flexDirection = 'column';
    prefLabel.style.alignItems = 'flex-start';
    prefLabel.style.gap = '4px';
    prefLabel.innerHTML = '<span>CIDR prefix /<span id="play-prefix-num">' + state.prefix + '</span></span>';
    var prefRange = document.createElement('input');
    prefRange.type = 'range';
    prefRange.min = '0';
    prefRange.max = '32';
    prefRange.value = String(state.prefix);
    prefRange.style.width = '320px';
    prefRange.addEventListener('input', function () {
      state.prefix = parseInt(prefRange.value, 10);
      render();
    });
    prefLabel.appendChild(prefRange);
    prefixRow.appendChild(prefLabel);
    container.appendChild(prefixRow);

    // Output box
    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    box.style.lineHeight = '1.7';
    container.appendChild(box);

    function render() {
      var prefix = state.prefix;
      document.getElementById('play-prefix-num').textContent = prefix;
      var ipStr = ip.ipToString(state.octets);
      var ipBin = ip.ipToBinary(state.octets);
      var maskOctets = ip.maskOctetsFromPrefix(prefix);
      var maskBin = ip.ipToBinary(maskOctets);
      var ipInt = ip.ipToInt(state.octets);
      var netInt = ip.networkInt(ipInt, prefix);
      var bcastInt = ip.broadcastInt(ipInt, prefix);
      var netStr = ip.ipToString(ip.intToIp(netInt));
      var bcastStr = ip.ipToString(ip.intToIp(bcastInt));
      var netBin = ip.ipToBinary(ip.intToIp(netInt));
      var hosts = ip.usableHosts(prefix);
      var cls = ip.ipClass(state.octets);
      var priv = ip.isPrivate(state.octets);

      // colorize the network portion of the binary IP
      var coloredIp = colorizeBinary(ipBin, prefix);
      var coloredMask = colorizeBinary(maskBin, prefix);
      var coloredNet = colorizeBinary(netBin, prefix);

      box.innerHTML =
        '<div><span class="muted">IP:</span> <span class="result">' + ipStr + '/' + prefix + '</span></div>'
      + '<div style="font-family:var(--mono)"><span class="muted">     bin:</span> ' + coloredIp + '</div>'
      + '<div style="font-family:var(--mono)"><span class="muted">    mask:</span> ' + coloredMask + ' &nbsp;<span class="muted">(' + ip.ipToString(maskOctets) + ')</span></div>'
      + '<hr style="border:0;border-top:1px solid var(--border);margin:8px 0">'
      + '<div><span class="muted">Network address:</span> <span class="result">' + netStr + '</span></div>'
      + '<div style="font-family:var(--mono)"><span class="muted">     bin:</span> ' + coloredNet + '</div>'
      + '<div><span class="muted">Broadcast:</span> <span class="result">' + bcastStr + '</span></div>'
      + '<div><span class="muted">Usable hosts:</span> <span class="result">' + hosts.toLocaleString() + '</span></div>'
      + '<div><span class="muted">Class (legacy):</span> ' + cls + (priv ? ' &middot; <span style="color:var(--good)">private</span>' : ' &middot; <span style="color:var(--accent)">public-range</span>') + '</div>';
    }

    // Wraps the network bits (first `prefix` bits) in <strong style="color:accent">
    // and the host bits in muted color. Keeps the dots between octets.
    function colorizeBinary(binStr, prefix) {
      var out = '';
      var bitIdx = 0;
      for (var i = 0; i < binStr.length; i++) {
        var ch = binStr.charAt(i);
        if (ch === '.') { out += '<span class="muted">.</span>'; continue; }
        if (bitIdx < prefix) out += '<span style="color:var(--accent);font-weight:600">' + ch + '</span>';
        else out += '<span style="color:var(--text-dim)">' + ch + '</span>';
        bitIdx++;
      }
      return out;
    }

    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is <code class="inline">192</code> as an 8-bit binary number? <span class="muted">(Each octet of an IP is just an 8-bit number written in decimal.)</span>',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = [
          '10000000', // 128
          '11000000', // 192  ✓
          '11100000', // 224
          '10101010'  // 170
        ];
        sel.innerHTML = '<option value="">— pick one —</option>'
          + opts.map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '11000000') return { correct: true, feedback: 'Right. 192 = 128 + 64 = 2⁷ + 2⁶ → bits 7 and 6 are 1, the rest are 0.' };
        return { correct: false, feedback: 'Not quite. 192 = 128 + 64. So the two leftmost bits (the 128-place and the 64-place) are 1.' };
      },
      hints: [
        'In an 8-bit number, the bit places are 128, 64, 32, 16, 8, 4, 2, 1 (left to right).',
        'Find which of those add up to 192. Hint: 128 + 64 = 192.',
        'So bits in the 128 and 64 places are 1, the rest are 0 → 11000000.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'What is the <strong>network address</strong> of <code class="inline">10.20.30.40/24</code>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 10.20.30.0';
        input.style.width = '180px';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        var ip = NT.lib.ip;
        var got = ip.parseIPv4(v);
        if (!got) return { correct: false, feedback: 'That doesn\'t look like an IPv4 address. Format: a.b.c.d, each 0–255.' };
        var expected = '10.20.30.0';
        if (ip.ipToString(got) === expected) return { correct: true, feedback: 'Right. /24 means "first 24 bits = network." That\'s the first three octets. The last octet is the host portion, which is all-zero in the network address.' };
        return { correct: false, feedback: 'Not quite. With /24 the network is the first three octets, and the host portion (last octet) is set to 0. Expected: ' + expected + '.' };
      },
      hints: [
        '/24 means the first 24 bits are the network. 24 bits = 3 octets exactly.',
        'The network address has the host portion all zero. With /24, the host portion is the last octet.',
        'Take 10.20.30.40, zero the last octet → 10.20.30.0.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'For <code class="inline">192.168.5.130/26</code>, give the <strong>broadcast address</strong>. <span class="muted">(/26 doesn\'t fall on an octet boundary, so the last octet has both network and host bits.)</span>',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'e.g. 192.168.5.???';
        input.style.width = '200px';
        c.appendChild(input);
        return function () { return input.value.trim(); };
      },
      check: function (v) {
        var ip = NT.lib.ip;
        var got = ip.parseIPv4(v);
        if (!got) return { correct: false, feedback: 'That doesn\'t look like an IPv4 address. Format: a.b.c.d, each 0–255.' };
        var expected = '192.168.5.191';
        if (ip.ipToString(got) === expected) {
          return { correct: true, feedback: 'Right. /26 = 24 + 2 → in the last octet, the top 2 bits are network, the bottom 6 are host. 130 in binary is 10000010 → first 2 bits 10 fix the subnet (10000000 = 128). The broadcast has those 6 host bits all 1: 10111111 = 191.' };
        }
        return { correct: false, feedback: 'Not quite. The /26 boundary is in the middle of the last octet — top 2 bits = network (10 → 128–191 range), bottom 6 bits = host. Set the host bits all to 1: 10|111111 = 191. Expected: ' + expected + '.' };
      },
      hints: [
        '/26 = 24 (full octets) + 2 more bits in the last octet. So in the last octet: 2 network bits, 6 host bits.',
        '130 in binary is 10000010. The top 2 bits are 10 — that fixes the subnet to addresses 128–191 in the last octet (network=128, broadcast=191).',
        'Broadcast = host bits all 1. With network bits 10 and host bits 111111, the last octet is 10111111 = 191. Final answer: 192.168.5.191.'
      ]
    }
  ]
});
