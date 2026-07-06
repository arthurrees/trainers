// Level 7 — TCP Handshake & Teardown
NT.registerLevel({
  id: 7,
  title: 'TCP Handshake & Teardown',
  whyItMatters: 'Every web page, every git push, every SSH session opens with the same three-message dance. Knowing what SYN, ACK, and FIN actually do — and why teardown takes four messages, not three — turns packet captures from gibberish into a story you can read.',
  glossary: ['TCP', 'SYN', 'ACK', 'FIN', 'RST', 'three-way handshake', 'sequence number', 'port'],
  learn: ''
    + '<h4>Why TCP needs a handshake</h4>'
    + '<p>IP delivers packets best-effort: maybe in order, maybe not, maybe lost, maybe duplicated. TCP turns that into a reliable, ordered byte stream — but to do so it needs both sides to agree on starting state. That agreement is the <strong>three-way handshake</strong>.</p>'

    + '<h4>The three messages</h4>'
    + '<ol>'
    +   '<li><strong>SYN</strong> &nbsp;(client → server): "I want to talk. My initial sequence number is <code class="inline">x</code>."</li>'
    +   '<li><strong>SYN + ACK</strong> &nbsp;(server → client): "OK, I\'ll talk. My initial sequence number is <code class="inline">y</code>. I acknowledge your SYN — next byte I expect from you is <code class="inline">x+1</code>."</li>'
    +   '<li><strong>ACK</strong> &nbsp;(client → server): "Acknowledged. Next byte I expect from you is <code class="inline">y+1</code>."</li>'
    + '</ol>'
    + '<p>After step 3, both sides are in the <code class="inline">ESTABLISHED</code> state. Data can now flow.</p>'

    + '<div class="callout"><div class="label">Sequence number footnote</div>'
    + 'Sequence numbers count <em>bytes sent</em>, not packets. The SYN itself consumes one sequence number even though it carries no payload — that\'s why the ACK number is <code class="inline">x+1</code>, not <code class="inline">x</code>. Same trick for FIN.'
    + '</div>'

    + '<h4>Why three, not two?</h4>'
    + '<p>Two would be enough to <em>start</em> a connection, but not enough to robustly <em>recover</em> from old, delayed packets and to confirm both sides chose their sequence numbers. The third ACK is the client telling the server "yes I really did want this — go ahead." Without it, an attacker could spray fake SYNs and exhaust server resources (this is the SYN-flood attack — and yes, it\'s a real problem; modern stacks defend with SYN cookies).</p>'

    + '<h4>Data flow</h4>'
    + '<p>Once established, both sides send data in segments. Each segment includes:</p>'
    + '<ul>'
    +   '<li><strong>Seq</strong> — the byte offset of this segment\'s first byte in the sender\'s stream.</li>'
    +   '<li><strong>Ack</strong> — the next byte the sender expects from the peer (cumulative).</li>'
    +   '<li>Flags (SYN, ACK, FIN, RST, PSH, URG).</li>'
    +   '<li>A receive window — "I have N bytes of buffer space free" (this is flow control).</li>'
    + '</ul>'
    + '<p>If a segment doesn\'t get acked in time, the sender retransmits. If the receiver gets data with a gap, it\'ll keep acking the last in-order byte (duplicate ACKs) — a hint to the sender that something was lost.</p>'

    + '<h4>Closing — four-way teardown</h4>'
    + '<p>TCP connections are full-duplex (two independent streams), so each side closes its own direction independently. Polite close looks like:</p>'
    + '<ol>'
    +   '<li><strong>FIN</strong> &nbsp;(A → B): "I\'m done sending."</li>'
    +   '<li><strong>ACK</strong> &nbsp;(B → A): "Acknowledged. I might still have more to send though."</li>'
    +   '<li><strong>FIN</strong> &nbsp;(B → A): "Now I\'m done too."</li>'
    +   '<li><strong>ACK</strong> &nbsp;(A → B): "Acknowledged. Connection closed."</li>'
    + '</ol>'
    + '<p>Often steps 2 and 3 can be combined into a single packet (B has nothing more to send, so it ACKs and FINs at once). Then teardown is 3 messages, not 4.</p>'

    + '<h4>The TIME_WAIT trap</h4>'
    + '<p>The side that sends the <em>last</em> ACK enters <strong>TIME_WAIT</strong> for ~2 × MSL (typically 60–120 s). This catches stray packets from the just-closed connection so they don\'t confuse a new connection on the same port pair. It\'s why "address already in use" errors plague servers that restart frequently — the OS won\'t reuse a recently used port until TIME_WAIT expires.</p>'

    + '<h4>RST — abrupt close</h4>'
    + '<p>If something goes wrong (crash, unwanted traffic, port not listening), either side can send <strong>RST</strong>. No teardown — connection is just gone. Try to <code class="inline">curl</code> a port that\'s not open and you\'ll see a RST come back.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Step through a TCP connection from open → data → close. Watch the sequence and ack numbers.';
    container.appendChild(help);

    var clientSeq0 = 1000;
    var serverSeq0 = 5000;

    var steps = [
      { from: 'C', to: 'S', flags: ['SYN'], seq: clientSeq0,           ack: 0,             desc: 'Client sends SYN with its initial sequence number.', stateC: 'SYN_SENT', stateS: 'LISTEN → SYN_RECEIVED' },
      { from: 'S', to: 'C', flags: ['SYN','ACK'], seq: serverSeq0,    ack: clientSeq0 + 1, desc: 'Server replies SYN+ACK. ack = client_seq + 1 (the SYN consumed 1 seq number).', stateC: 'SYN_SENT', stateS: 'SYN_RECEIVED' },
      { from: 'C', to: 'S', flags: ['ACK'], seq: clientSeq0 + 1,      ack: serverSeq0 + 1, desc: 'Client acks the server SYN. Both sides now ESTABLISHED — data can flow.', stateC: 'ESTABLISHED', stateS: 'ESTABLISHED' },
      { from: 'C', to: 'S', flags: ['ACK','PSH'], seq: clientSeq0 + 1, ack: serverSeq0 + 1, payload: '"GET /index.html HTTP/1.1\\r\\nHost: x\\r\\n\\r\\n" (~50 bytes)', desc: 'Client sends 50 bytes of data. Seq starts at 1001 (no data yet sent), next seq will be 1051.', stateC: 'ESTABLISHED', stateS: 'ESTABLISHED' },
      { from: 'S', to: 'C', flags: ['ACK'], seq: serverSeq0 + 1, ack: clientSeq0 + 51, desc: 'Server acks the 50 bytes (next byte expected = 1051).', stateC: 'ESTABLISHED', stateS: 'ESTABLISHED' },
      { from: 'S', to: 'C', flags: ['ACK','PSH'], seq: serverSeq0 + 1, ack: clientSeq0 + 51, payload: '"HTTP/1.1 200 OK\\r\\n... <html>...</html>" (1200 bytes)', desc: 'Server sends 1200 bytes back. Seq starts at 5001, next seq will be 6201.', stateC: 'ESTABLISHED', stateS: 'ESTABLISHED' },
      { from: 'C', to: 'S', flags: ['ACK'], seq: clientSeq0 + 51, ack: serverSeq0 + 1201, desc: 'Client acks the 1200 bytes.', stateC: 'ESTABLISHED', stateS: 'ESTABLISHED' },
      { from: 'C', to: 'S', flags: ['FIN','ACK'], seq: clientSeq0 + 51, ack: serverSeq0 + 1201, desc: 'Client sends FIN — "I\'m done sending." (FIN consumes 1 seq number too.)', stateC: 'FIN_WAIT_1', stateS: 'CLOSE_WAIT' },
      { from: 'S', to: 'C', flags: ['ACK'], seq: serverSeq0 + 1201, ack: clientSeq0 + 52, desc: 'Server acks the FIN. Server is half-closed; might still send.', stateC: 'FIN_WAIT_2', stateS: 'CLOSE_WAIT' },
      { from: 'S', to: 'C', flags: ['FIN','ACK'], seq: serverSeq0 + 1201, ack: clientSeq0 + 52, desc: 'Server now sends its own FIN.', stateC: 'FIN_WAIT_2', stateS: 'LAST_ACK' },
      { from: 'C', to: 'S', flags: ['ACK'], seq: clientSeq0 + 52, ack: serverSeq0 + 1202, desc: 'Client acks. Connection fully closed. Client enters TIME_WAIT for ~60–120 s before fully releasing.', stateC: 'TIME_WAIT', stateS: 'CLOSED' }
    ];

    var step = -1;
    var topo = document.createElement('div');
    topo.className = 'formula-box';
    topo.style.fontSize = '13px';
    container.appendChild(topo);

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

    // Ladder/sequence diagram canvas
    var canvasHost = document.createElement('div');
    canvasHost.className = 'canvas-host';
    canvasHost.style.display = 'block';
    var canvas = document.createElement('canvas');
    canvas.width = 760; canvas.height = 580;
    canvas.style.width = '100%';
    canvasHost.appendChild(canvas);
    container.appendChild(canvasHost);

    var detail = document.createElement('div');
    detail.className = 'formula-box';
    detail.style.fontSize = '13px';
    container.appendChild(detail);

    function renderTopo() {
      var s = step >= 0 ? steps[step] : { stateC: 'CLOSED', stateS: 'LISTEN' };
      topo.innerHTML =
        '<div><strong>Client</strong> &nbsp; <span style="color:var(--accent)">' + s.stateC + '</span> &nbsp; '
      + '<span class="muted">←─────────────→</span> &nbsp; '
      + '<strong>Server</strong> &nbsp; <span style="color:var(--accent)">' + s.stateS + '</span></div>';
    }

    function flagColor(flags) {
      if (flags.indexOf('FIN') >= 0) return '#fbbf24';
      if (flags.indexOf('SYN') >= 0) return '#4ade80';
      if (flags.indexOf('PSH') >= 0) return '#a78bfa';
      return '#7ab7ff';
    }

    function renderDiagram() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0c11';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var clientX = 130, serverX = canvas.width - 130;
      var topY = 50, bottomY = canvas.height - 30;
      var rowSpacing = (bottomY - topY - 30) / steps.length;

      // header
      ctx.fillStyle = '#7ab7ff'; ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Client', clientX, 20);
      ctx.fillText('Server', serverX, 20);

      // vertical lifelines (segmented by step state)
      ctx.strokeStyle = '#3a4256'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(clientX, topY - 10); ctx.lineTo(clientX, bottomY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(serverX, topY - 10); ctx.lineTo(serverX, bottomY); ctx.stroke();
      ctx.setLineDash([]);

      // arrows for each step (up to current `step`)
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        var y = topY + 10 + (i + 0.5) * rowSpacing;
        var revealed = i <= step;
        var x1, x2;
        if (s.from === 'C') { x1 = clientX + 8; x2 = serverX - 8; }
        else { x1 = serverX - 8; x2 = clientX + 8; }

        var color = revealed ? flagColor(s.flags) : '#2a3142';
        ctx.strokeStyle = color; ctx.fillStyle = color;
        ctx.lineWidth = (i === step) ? 2.5 : 1.5;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
        // arrowhead
        var ah = (x2 > x1) ? 0 : Math.PI;
        ctx.beginPath();
        ctx.moveTo(x2, y);
        ctx.lineTo(x2 - 9 * Math.cos(ah - Math.PI/7), y - 9 * Math.sin(ah - Math.PI/7));
        ctx.lineTo(x2 - 9 * Math.cos(ah + Math.PI/7), y - 9 * Math.sin(ah + Math.PI/7));
        ctx.closePath(); ctx.fill();

        // label centered above the arrow
        if (revealed) {
          var midX = (x1 + x2) / 2;
          ctx.font = 'bold 11px monospace';
          var flagStr = '[' + s.flags.join(',') + ']';
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.fillText(flagStr, midX, y - 14);
          ctx.font = '10px monospace';
          ctx.fillStyle = '#9aa3b2';
          ctx.fillText('seq=' + s.seq + (s.ack ? ' ack=' + s.ack : ''), midX, y + 12);
          if (s.payload) {
            ctx.fillStyle = '#a78bfa';
            ctx.fillText('+ ' + (s.payload.length > 60 ? s.payload.substring(0, 57) + '...' : s.payload), midX, y + 24);
          }
        } else {
          ctx.font = '10px monospace';
          ctx.fillStyle = '#3a4256';
          ctx.textAlign = 'center';
          ctx.fillText('[' + s.flags.join(',') + ']', (x1 + x2) / 2, y - 14);
        }

        // step number on left edge
        ctx.fillStyle = revealed ? '#7ab7ff' : '#2a3142';
        ctx.font = '10px monospace'; ctx.textAlign = 'left';
        ctx.fillText((i + 1).toString(), 6, y);
      }
    }

    function renderStep() {
      renderDiagram();
      if (step >= 0) {
        var s = steps[step];
        detail.innerHTML =
          '<div><strong style="color:' + flagColor(s.flags) + '">Step ' + (step + 1) + '</strong> &nbsp; '
        + (s.from === 'C' ? 'C → S' : 'S → C') + ' &nbsp; flags=[' + s.flags.join(',') + '] &nbsp; seq=' + s.seq + ' ack=' + s.ack
        + (s.payload ? ' &nbsp; payload: ' + s.payload : '') + '</div>'
        + '<div class="muted" style="margin-top:6px">' + s.desc + '</div>';
      } else {
        detail.innerHTML = '<div class="muted">Click "Next step →" to start the connection.</div>';
      }
    }

    nextBtn.addEventListener('click', function () {
      if (step >= steps.length - 1) return;
      step++;
      renderTopo();
      renderStep();
    });
    resetBtn.addEventListener('click', function () {
      step = -1;
      renderTopo();
      renderStep();
    });

    renderTopo();
    renderStep();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'How many segments are exchanged in the TCP <strong>three-way handshake</strong>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 3) return { correct: true, feedback: 'Right. SYN, SYN+ACK, ACK. Hence "three-way".' };
        return { correct: false, feedback: 'Three. SYN, SYN+ACK, ACK.' };
      },
      hints: [
        'The name has the answer in it.',
        'Three-way handshake: 3 messages.',
        'Three.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A client opens a TCP connection by sending <code class="inline">SYN, seq=4000</code>. What <strong>ack number</strong> does the server put in its <code class="inline">SYN+ACK</code> reply?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        input.placeholder = 'a number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        if (v === 4001) return { correct: true, feedback: 'Right. The SYN consumes one sequence number even though it carries no payload — so the next byte the server expects is 4001.' };
        if (v === 4000) return { correct: false, feedback: 'Close. The trick is that the SYN flag itself counts as 1 sequence number — so the server\'s ACK is the byte AFTER the SYN, which is 4001.' };
        return { correct: false, feedback: 'The ACK is "next byte I expect" = client_seq + 1. The SYN counts as 1 seq number. So 4001.' };
      },
      hints: [
        'ACK number = "the next byte I expect to receive" (cumulative ack).',
        'The SYN flag itself consumes one sequence number, even with no payload.',
        '4000 + 1 = 4001.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'Pick all the statements that are <strong>true</strong>.',
      mountInput: function (c) {
        var items = [
          { label: 'A FIN politely closes one direction; the other side can keep sending until it sends its own FIN.', t: true },
          { label: 'TCP sequence numbers count packets, not bytes.', t: false },
          { label: 'A RST abruptly tears down a connection without the FIN dance.', t: true },
          { label: 'The server side of a connection always sends the first SYN.', t: false },
          { label: 'After full close, the side that sent the last ACK enters TIME_WAIT for ~2 × MSL.', t: true },
          { label: 'Because the connection is full-duplex, polite close logically takes 4 messages (sometimes combined to 3).', t: true }
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
        if (allCorrect) return { correct: true, feedback: 'Right. Sequence numbers count BYTES (not packets). The CLIENT — the one that did connect() — sends the first SYN. The four true statements are the FIN/RST/TIME_WAIT/duplex ones.' };
        return { correct: false, feedback: 'Re-check: seq numbers count bytes; clients (active opener) send the first SYN. The other four are true.' };
      },
      hints: [
        'TCP sequence numbers are BYTE offsets — they grow by the size of payloads sent.',
        'The "client" is the side that calls connect() — that side sends the first SYN. A server that calls listen() waits.',
        'Four are true: FIN semantics, RST, TIME_WAIT, and duplex 4-way close.'
      ]
    }
  ]
});
