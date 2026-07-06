// Level 11 — TLS Handshake
NT.registerLevel({
  id: 11,
  title: 'TLS Handshake',
  whyItMatters: 'TLS is the difference between "anyone on the same Wi-Fi can read your password" and "the entire internet runs on logins, banking, and chat." Once you understand the handshake, every padlock icon stops being mystical.',
  glossary: ['TLS', 'certificate', 'CA', 'ClientHello', 'ServerHello', 'TCP', 'HTTPS'],
  learn: ''
    + '<h4>Three things TLS gives you</h4>'
    + '<ol>'
    +   '<li><strong>Confidentiality</strong> — nobody on the wire can read your data.</li>'
    +   '<li><strong>Integrity</strong> — nobody can tamper with your data without you noticing.</li>'
    +   '<li><strong>Server authentication</strong> — you can verify you\'re really talking to the server you think you are (not an impostor).</li>'
    + '</ol>'
    + '<p>(Optionally, also <em>client authentication</em> — used by mTLS in zero-trust networks. And modern TLS gives you <em>forward secrecy</em> — even if the server\'s long-term key leaks tomorrow, today\'s traffic stays unreadable.)</p>'

    + '<h4>The trick: asymmetric crypto for setup, symmetric for data</h4>'
    + '<p>Symmetric encryption (AES, ChaCha20) is fast — gigabytes per second. But both sides need the same key, and they\'ve never met. Asymmetric encryption (RSA, ECDHE) lets two strangers agree on a shared secret over an open wire — but it\'s slow.</p>'
    + '<p>TLS uses asymmetric crypto <em>only at the start</em>, to negotiate a fresh symmetric key. After the handshake, all your data is protected with that fast symmetric key.</p>'

    + '<h4>The certificate</h4>'
    + '<p>How do you know the public key the server hands you really belongs to <code class="inline">example.com</code>? Because a <strong>Certificate Authority</strong> (Let\'s Encrypt, DigiCert, etc.) signed a statement saying so. Your OS / browser ships a list of root CA public keys it trusts.</p>'
    + '<div class="example"><div class="label">A cert says</div>'
    + '"This public key (xyz...) belongs to <strong>example.com</strong>, valid from 2026-01-01 to 2026-04-01, signed by <strong>Let\'s Encrypt R3</strong>." (Let\'s Encrypt issues 90-day certs — that 3-month validity is their signature. The R3 intermediate is signed by ISRG Root X1, which your OS trusts.)'
    + '</div>'

    + '<h4>The TLS 1.3 handshake (1-RTT)</h4>'
    + '<ol>'
    +   '<li><strong>ClientHello</strong> &nbsp;(C → S): "Hi. I support TLS 1.3 and these ciphers. Here\'s my Diffie-Hellman key share (my half of the secret)."</li>'
    +   '<li><strong>ServerHello</strong> &nbsp;(S → C): "Picked TLS 1.3, picked AES-128-GCM. Here\'s my key share."<br>'
    +     '<em>From this point on, the rest of the handshake is encrypted</em> using the symmetric key derived from the two key shares.</li>'
    +   '<li>Server sends, encrypted: <strong>Certificate</strong> (its cert chain), <strong>CertificateVerify</strong> (a signature with the cert\'s private key — proves it actually owns the cert), <strong>Finished</strong>.</li>'
    +   '<li>Client verifies: cert chain reaches a trusted root, hostname matches, dates are valid, signature is good. Then sends <strong>Finished</strong>.</li>'
    +   '<li>Application data flows, encrypted with the symmetric key.</li>'
    + '</ol>'
    + '<p>Total: <strong>1 round-trip</strong> before any application data. (TLS 1.2 needed 2 round-trips. TLS 1.3 also has a 0-RTT mode for resumed sessions, with caveats.)</p>'

    + '<div class="callout"><div class="label">"Forward secrecy" — why DH instead of just RSA</div>'
    + 'Old TLS (RSA key exchange) had the client encrypt a random secret with the server\'s public key. If someone records all that ciphertext, then later steals the server\'s private key, they can decrypt every past session.<br>'
    + 'TLS 1.3 forces ephemeral Diffie-Hellman: each session uses a fresh, throwaway key share. Stealing the server\'s long-term key gives an attacker nothing about past traffic.'
    + '</div>'

    + '<h4>What can go wrong</h4>'
    + '<ul>'
    +   '<li><strong>Self-signed cert</strong> — not signed by a trusted CA → your browser shows a big red warning.</li>'
    +   '<li><strong>Hostname mismatch</strong> — cert is for <code class="inline">example.com</code> but you\'re connecting to <code class="inline">api.example.com</code> → warning. (Cert needs the right SAN entry.)</li>'
    +   '<li><strong>Expired cert</strong> — outside the valid date range → warning.</li>'
    +   '<li><strong>Compromised CA</strong> — historical disasters (DigiNotar, 2011) where a CA was hacked and forged certs for major sites. CAs lost trust after that.</li>'
    + '</ul>'

    + '<h4>Where TLS sits</h4>'
    + '<p>In the OSI mapping, TLS lives at L5/L6 — between Transport (TCP) and Application (HTTP, SMTP, ...). In the practical TCP/IP model it\'s lumped into Application. The data flow:</p>'
    + '<div class="example"><div class="label">HTTPS request layered</div>'
    + '<code class="inline">[ Ethernet [ IP [ TCP [ TLS [ HTTP "GET /" ] ] ] ] ]</code>'
    + '</div>'
    + '<p>TLS doesn\'t care whether the inside is HTTP, IMAP, or anything else. That\'s why you\'ll see "SMTPS", "IMAPS", "HTTPS" — same TLS, different application above.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Step through a TLS 1.3 handshake.';
    container.appendChild(help);

    var steps = [
      { from: 'C', to: 'S', enc: false, msg: 'TCP connect to port 443', desc: 'Plain TCP three-way handshake before TLS even begins.' },
      { from: 'C', to: 'S', enc: false, msg: 'ClientHello', desc: 'Client offers TLS 1.3, list of supported ciphers, supported groups, and a key share (its half of the Diffie-Hellman secret).' },
      { from: 'S', to: 'C', enc: false, msg: 'ServerHello', desc: 'Server picks TLS 1.3 + a cipher (e.g. TLS_AES_128_GCM_SHA256), sends its key share. Both sides can now derive the same symmetric handshake key.' },
      { from: 'S', to: 'C', enc: true,  msg: 'Certificate', desc: 'Server\'s cert chain. Encrypted under the handshake key.' },
      { from: 'S', to: 'C', enc: true,  msg: 'CertificateVerify', desc: 'A signature with the cert\'s private key over the handshake transcript — proves the server really owns this cert.' },
      { from: 'S', to: 'C', enc: true,  msg: 'Finished', desc: 'Server says "handshake done from my side."' },
      { from: 'C', to: 'C', enc: true,  msg: '(client verifies)', desc: 'Client checks: cert chains to a trusted root, hostname matches a SAN entry, dates valid, signature good. If anything fails → abort.' },
      { from: 'C', to: 'S', enc: true,  msg: 'Finished', desc: 'Client says "handshake done from my side."' },
      { from: 'C', to: 'S', enc: true,  msg: 'HTTP GET /', desc: 'Application data starts flowing, encrypted under the application key.' }
    ];

    var step = -1;

    var ctrls = document.createElement('div');
    ctrls.className = 'controls-row';
    var nextBtn = document.createElement('button');
    nextBtn.className = 'primary-btn';
    nextBtn.textContent = 'Next step →';
    var resetBtn = document.createElement('button');
    resetBtn.className = 'ghost-btn';
    resetBtn.textContent = 'Reset';
    ctrls.appendChild(nextBtn);
    ctrls.appendChild(resetBtn);
    container.appendChild(ctrls);

    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 760; canvas.height = 480;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var detail = document.createElement('div');
    detail.className = 'formula-box';
    detail.style.fontSize = '13px';
    container.appendChild(detail);

    function render() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var clientX = 130, serverX = canvas.width - 130;
      var topY = 50, bottomY = canvas.height - 30;
      var rowSpacing = (bottomY - topY - 30) / steps.length;

      // headers
      ctx.fillStyle = '#7ab7ff'; ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Client', clientX, 20);
      ctx.fillText('Server', serverX, 20);

      // shaded "encrypted" zone — find first encrypted step
      var firstEnc = -1;
      for (var fi = 0; fi < steps.length; fi++) if (steps[fi].enc) { firstEnc = fi; break; }
      if (firstEnc >= 0) {
        var encY = topY + 10 + firstEnc * rowSpacing;
        ctx.fillStyle = 'rgba(74, 222, 128, 0.06)';
        ctx.fillRect(clientX + 30, encY, serverX - clientX - 60, bottomY - encY);
        ctx.fillStyle = '#4ade80';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 encrypted from here on', (clientX + serverX) / 2, encY + 12);
      }

      // lifelines
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(clientX, topY - 10); ctx.lineTo(clientX, bottomY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(serverX, topY - 10); ctx.lineTo(serverX, bottomY); ctx.stroke();
      ctx.setLineDash([]);

      // messages
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        var y = topY + 25 + (i + 0.5) * rowSpacing;
        var revealed = i <= step;
        var color = revealed ? (s.enc ? '#4ade80' : '#7ab7ff') : '#2a3142';

        if (s.from === 'C' && s.to === 'C') {
          // internal client step — small dotted loop on client side
          ctx.strokeStyle = color; ctx.lineWidth = revealed ? 2 : 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(clientX, y, 14, -Math.PI / 2, Math.PI * 1.5);
          ctx.stroke();
          ctx.setLineDash([]);
          if (revealed) {
            ctx.fillStyle = color; ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(s.msg, clientX + 22, y);
          }
        } else {
          var x1, x2;
          if (s.from === 'C') { x1 = clientX + 8; x2 = serverX - 8; }
          else { x1 = serverX - 8; x2 = clientX + 8; }
          ctx.strokeStyle = color; ctx.fillStyle = color;
          ctx.lineWidth = (i === step) ? 2.5 : 1.5;
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
          var ah = (x2 > x1) ? 0 : Math.PI;
          ctx.beginPath();
          ctx.moveTo(x2, y);
          ctx.lineTo(x2 - 9 * Math.cos(ah - Math.PI / 7), y - 9 * Math.sin(ah - Math.PI / 7));
          ctx.lineTo(x2 - 9 * Math.cos(ah + Math.PI / 7), y - 9 * Math.sin(ah + Math.PI / 7));
          ctx.closePath(); ctx.fill();
          if (revealed) {
            var midX = (x1 + x2) / 2;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText((s.enc ? '🔒 ' : '') + s.msg, midX, y - 8);
          } else {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#3a4256';
            ctx.textAlign = 'center';
            ctx.fillText(s.msg, (x1 + x2) / 2, y - 8);
          }
        }

        // step number
        ctx.fillStyle = revealed ? '#7ab7ff' : '#2a3142';
        ctx.font = '10px monospace'; ctx.textAlign = 'left';
        ctx.fillText((i + 1).toString(), 6, y);
      }

      // detail
      if (step >= 0) {
        var s2 = steps[step];
        var lock = s2.enc ? '<span style="color:var(--good)">🔒 encrypted</span>' : '<span class="muted">plaintext</span>';
        detail.innerHTML =
          '<div><strong style="color:var(--accent)">Step ' + (step + 1) + '</strong> &nbsp; ' + s2.msg + ' &nbsp; ' + lock + '</div>'
        + '<div class="muted" style="margin-top:6px">' + s2.desc + '</div>';
      } else {
        detail.innerHTML = '<div class="muted">Click "Next step →" to start the handshake.</div>';
      }
    }
    nextBtn.addEventListener('click', function () {
      if (step >= steps.length - 1) return;
      step++; render();
    });
    resetBtn.addEventListener('click', function () { step = -1; render(); });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the default TCP port for HTTPS?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 443) return { correct: true, feedback: 'Right. 443 for HTTPS, 80 for plain HTTP.' };
        if (v === 80) return { correct: false, feedback: '80 is plain HTTP. HTTPS is 443.' };
        return { correct: false, feedback: '443.' };
      },
      hints: [
        'HTTP is on port 80.',
        'HTTPS is one of those numbers everyone has memorized.',
        '443.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Tick each statement that is <strong>true</strong> about TLS.',
      mountInput: function (c) {
        var items = [
          { label: 'TLS provides confidentiality of the data you send.',                      t: true },
          { label: 'TLS provides integrity — nobody can tamper without detection.',           t: true },
          { label: 'TLS lets the client verify the server\'s identity (via certificate).',    t: true },
          { label: 'TLS encrypts the destination IP address in the IP header.',               t: false },
          { label: 'TLS uses asymmetric crypto for the entire data stream.',                  t: false },
          { label: 'Modern TLS (1.3) provides forward secrecy.',                              t: true }
        ];
        var div = document.createElement('div');
        div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type = 'checkbox';
          lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' ' + it.label));
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. TLS sits ABOVE IP, so it can\'t encrypt the IP header (routers wouldn\'t be able to route it). And it uses asymmetric only for setup; data uses symmetric for speed. The other four are true.' };
        return { correct: false, feedback: 'Re-check: TLS is above IP — IP headers are visible to routers. And asymmetric crypto is only used to negotiate a symmetric key. The other four are true.' };
      },
      hints: [
        'TLS sits above TCP, which is above IP. Can it encrypt headers BELOW it?',
        'No — if it did, no one could route the packet. TLS encrypts the application payload only.',
        'Asymmetric crypto is slow; TLS uses it only for setup, then switches to symmetric for the bulk traffic. Four statements are true.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re connecting to <code class="inline">https://bank.example.com</code>. An attacker on your network intercepts the connection and sends back a <strong>self-signed</strong> certificate for <code class="inline">bank.example.com</code>. The browser refuses to continue. Why?',
      mountInput: function (c) {
        var opts = [
          'Self-signed certs are encrypted with weak algorithms.',
          'The cert is not signed by a CA in the browser\'s trusted-root list.',
          'TLS forbids self-signed certs at the protocol level.',
          'The browser cannot decrypt traffic from a self-signed cert.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. The cert\'s hostname says bank.example.com, but it isn\'t signed by anyone the browser trusts. The whole point of the trust chain is to detect exactly this attack — anyone can mint a cert for any name; the question is whether a CA the browser trusts vouched for it.' };
        if (v === 0) return { correct: false, feedback: 'Self-signed certs can use the same strong algorithms as CA-signed ones. The problem is who VOUCHED for the public key, not the algorithm.' };
        if (v === 2) return { correct: false, feedback: 'TLS itself doesn\'t forbid self-signed certs (mTLS deployments use them all the time). The browser refuses because it can\'t verify the trust chain.' };
        if (v === 3) return { correct: false, feedback: 'Decryption isn\'t the problem — the browser COULD decrypt, but it shouldn\'t even start, because it can\'t verify the server\'s identity.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Anyone, anywhere, can generate a cert with the name "bank.example.com" on it. What stops them?',
        'A signature from a Certificate Authority that the browser trusts.',
        'A self-signed cert is missing exactly that signature → the trust chain doesn\'t reach a trusted root.'
      ]
    }
  ]
});
