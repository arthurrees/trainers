// Level 12 — Breadboards to PCBs
EST.registerLevel({
  id: 12,
  title: 'Breadboards to PCBs',
  whyItMatters: 'Every project starts as a tangle of wires on a breadboard. Understanding breadboard wiring prevents hours of debugging, and knowing the path to a PCB lets you turn a prototype into a permanent, professional product.',
  glossary: ['breadboard', 'PCB', 'schematic', 'trace', 'solder'],
  learn:
    '<h4>Breadboard anatomy: what is connected to what?</h4>' +
    '<p>A breadboard (also called a solderless breadboard) is a plastic board with hundreds of holes arranged in a grid. Underneath the holes, metal clips connect certain holes together — and understanding which holes are connected is the <b>single most important thing</b> about using a breadboard.</p>' +

    '<div class="example">' +
    '<div class="label">Internal connections</div>' +
    '<ul>' +
    '<li><b>Terminal strips (the main area):</b> holes are labeled a-e and f-j across, and numbered 1, 2, 3, ... down the rows. In each row, holes <b>a through e</b> are internally connected. Holes <b>f through j</b> are internally connected. But <b>a-e and f-j are NOT connected to each other</b> — they are separated by a center gap (the "ravine").</li>' +
    '<li><b>The center gap</b> is sized exactly for DIP IC chips (like the ATmega328P). When you straddle a chip across the gap, each pin gets its own row — pin 1 connects to row a-e on one side, pin 2 (directly opposite) connects to row f-j on the other side. This prevents pins from shorting to each other.</li>' +
    '<li><b>Power rails</b> run along the top and bottom edges, marked with <span style="color:#f87171;">+</span> (red) and <span style="color:#7ab7ff;">-</span> (blue/black). These are connected horizontally along the entire length of the rail. Use them for V<sub>cc</sub> and GND.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="callout"><div class="label">Watch out: power rail break</div>' +
    'On many full-size breadboards (830 holes), the power rail has a <b>break in the middle</b>. The left half and right half of the rail are NOT connected. You need a small jumper wire to bridge them. If half your circuit has no power, this is probably why. Check with a multimeter in continuity mode!</div>' +

    '<h4>Breadboard wiring tips</h4>' +
    '<div class="example">' +
    '<div class="label">Best practices</div>' +
    '<ul>' +
    '<li><b>Use a color convention:</b> red wires = power (V<sub>cc</sub>), black wires = ground (GND), other colors for signals. This makes debugging much easier.</li>' +
    '<li><b>Keep wires short:</b> long, arching wires are hard to trace and can act as antennas (picking up noise). Cut jumper wires to length or use pre-cut jumper wire kits.</li>' +
    '<li><b>Seat wires fully:</b> a wire that is not pushed all the way into the hole makes a loose connection. Loose connections cause intermittent failures — the worst kind of bug.</li>' +
    '<li><b>Use male-to-male jumpers</b> for breadboard-to-breadboard connections, and <b>male-to-female jumpers</b> for connecting to MCU pin headers.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Common breadboard mistakes</h4>' +
    '<div class="example">' +
    '<div class="label">Things that will waste your afternoon</div>' +
    '<ul>' +
    '<li><b>Bridging the center gap accidentally:</b> if you put two components\' pins in the same row on the same side (a-e), they are shorted together. This is how you accidentally connect an LED anode to a button output when you meant them to be separate.</li>' +
    '<li><b>Forgetting the power rail break:</b> described above. Half your circuit has no power.</li>' +
    '<li><b>Rats-nest wiring:</b> when your breadboard looks like a plate of spaghetti, you cannot debug it. Rewire it neatly. Future you will thank present you.</li>' +
    '<li><b>Using a worn-out breadboard:</b> the metal clips lose their grip over time. If components fall out when you tilt the board, get a new one. They are cheap (~$3-5).</li>' +
    '</ul>' +
    '</div>' +

    '<h4>From breadboard to permanent: your options</h4>' +
    '<p>Once your breadboard prototype works, you have three paths to making it permanent:</p>' +

    '<div class="example">' +
    '<div class="label">Option 1: Perfboard / stripboard</div>' +
    '<p>A board with holes on a 2.54 mm grid (same spacing as a breadboard). You solder components into the holes and connect them with solder bridges or small wires on the back. Cheap (~$1), ugly, good for one-off projects.</p>' +
    '<p>Stripboard is similar but has copper strips running in rows — you cut the strips where you need a break. Slightly easier than perfboard for simple circuits.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Option 2: Custom PCB (the real deal)</div>' +
    '<p>Design your circuit board in software, send the files to a fabrication house, and get professional-quality boards back. This is how every commercial product is made.</p>' +
    '<p><b>Cost:</b> surprisingly cheap for hobby quantities. JLCPCB and PCBWay will make 5 boards for ~$2-5 (plus ~$5-15 shipping). OSH Park is pricier (~$5/sq-inch for 3 boards) but US-based with faster shipping. Turnaround: 5-10 days from order to delivery.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Option 3: Solder directly to the dev board</div>' +
    '<p>For very simple projects (just an ESP32 + a sensor + a few wires), you can solder wires directly to the dev board pin headers. No extra board needed. Quick and dirty.</p>' +
    '</div>' +

    '<h4>PCB design basics: the KiCad workflow</h4>' +
    '<p><b>KiCad</b> is the most popular free, open-source PCB design tool. <b>EasyEDA</b> is a web-based alternative that is simpler but less powerful. Both produce industry-standard Gerber files that any fab house accepts.</p>' +

    '<div class="example">' +
    '<div class="label">PCB design steps</div>' +
    '<ol>' +
    '<li><b>Draw the schematic:</b> place component symbols (resistor, capacitor, ESP32 module, etc.) and connect them with wires (called "nets"). This is a logical diagram — it shows what connects to what, not where things are physically.</li>' +
    '<li><b>Assign footprints:</b> each schematic symbol maps to a physical footprint — the actual shape and pad pattern of the component. A "resistor" symbol might map to a 0805 SMD footprint or a through-hole axial footprint.</li>' +
    '<li><b>Layout the board:</b> place the physical footprints on the board and route copper <b>traces</b> between them. Traces are the "wires" of a PCB — thin copper lines etched onto the board.</li>' +
    '<li><b>Follow design rules:</b> trace width (0.25 mm minimum for signals, wider for power — 0.5-1 mm), clearance between traces (0.2 mm minimum), via size (holes that connect traces between the top and bottom layers of the board).</li>' +
    '<li><b>Run design rule check (DRC):</b> the software checks for errors — traces too close together, unconnected nets, clearance violations.</li>' +
    '<li><b>Generate Gerber files:</b> the industry-standard format that fab houses use. A set of Gerber files describes each layer of the PCB (top copper, bottom copper, silkscreen, solder mask, drill holes).</li>' +
    '<li><b>Upload and order:</b> upload Gerbers to JLCPCB or similar, pick options (board thickness, color, copper weight), pay ~$2-5, wait for delivery.</li>' +
    '</ol>' +
    '</div>' +

    '<h4>SMD vs through-hole components</h4>' +
    '<div class="example">' +
    '<div class="label">Through-hole (THT)</div>' +
    '<p>Components with wire legs that go through holes in the PCB and are soldered on the other side. Easy to hand-solder. The components you use on a breadboard are almost all through-hole. Larger and takes more board space.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Surface mount (SMD)</div>' +
    '<p>Components that sit flat on copper pads on the surface of the board. Smaller (much smaller — some are the size of a grain of sand). Cheaper in bulk. But harder to hand-solder, especially fine-pitch ICs. For hobby work, stick with large SMD sizes:</p>' +
    '<ul>' +
    '<li><b>0805:</b> 2.0 &times; 1.25 mm. Comfortable to hand-solder with a regular iron.</li>' +
    '<li><b>0603:</b> 1.6 &times; 0.8 mm. Doable with tweezers and a fine tip.</li>' +
    '<li><b>0402 and smaller:</b> you need a microscope, solder paste, and a hot air gun or reflow oven. Not hobby-friendly.</li>' +
    '<li><b>SOT-23:</b> a common 3-pin package for transistors, voltage regulators. Easy to hand-solder.</li>' +
    '<li><b>QFN, QFP:</b> multi-pin IC packages. QFP (with visible legs) can be hand-soldered with flux and patience. QFN (pads underneath) needs hot air or reflow.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="callout"><div class="label">Beginner recommendation</div>' +
    'Start with through-hole components on a breadboard. When you move to PCBs, use through-hole for your first board. Once comfortable, mix in 0805 SMD passives (resistors, capacitors) — they save space and are surprisingly easy to solder with a little practice and flux.</div>',

  mountPlay: function (container) {
    // Virtual breadboard visualizer
    var ROWS = 20;
    var COLS_LEFT = 5;  // a-e
    var COLS_RIGHT = 5; // f-j
    var colLabelsLeft = ['a', 'b', 'c', 'd', 'e'];
    var colLabelsRight = ['f', 'g', 'h', 'i', 'j'];

    container.innerHTML =
      '<p class="muted">Click any hole on the breadboard to highlight all holes connected to it. The center gap separates columns a-e from f-j.</p>' +
      '<div style="overflow-x:auto;">' +
        '<div id="est-bb" style="display:inline-block;background:#e8e0d0;border-radius:8px;padding:16px 20px;border:2px solid #3a4256;"></div>' +
      '</div>' +
      '<div id="est-bb-info" style="margin-top:12px;min-height:40px;color:#7ab7ff;font-size:13px;"></div>';

    var bbDiv = container.querySelector('#est-bb');
    var infoDiv = container.querySelector('#est-bb-info');
    var allHoles = [];

    // Power rail (top)
    var pwrRow = document.createElement('div');
    pwrRow.style.cssText = 'display:flex;gap:4px;margin-bottom:8px;padding-left:28px;';
    var pwrLabel = document.createElement('span');
    pwrLabel.style.cssText = 'color:#f87171;font-weight:bold;font-size:12px;width:16px;text-align:center;';
    pwrLabel.textContent = '+';
    pwrRow.appendChild(pwrLabel);
    var pwrHoles = [];
    for (var p = 0; p < ROWS; p++) {
      var ph = document.createElement('span');
      ph.style.cssText = 'display:inline-block;width:14px;height:14px;background:#333;border-radius:50%;cursor:pointer;border:1px solid #555;';
      ph.setAttribute('data-type', 'power');
      ph.setAttribute('data-idx', p.toString());
      pwrHoles.push(ph);
      pwrRow.appendChild(ph);
    }
    allHoles.push({ type: 'power', holes: pwrHoles });
    bbDiv.appendChild(pwrRow);

    // GND rail (top)
    var gndRow = document.createElement('div');
    gndRow.style.cssText = 'display:flex;gap:4px;margin-bottom:12px;padding-left:28px;';
    var gndLabel = document.createElement('span');
    gndLabel.style.cssText = 'color:#7ab7ff;font-weight:bold;font-size:12px;width:16px;text-align:center;';
    gndLabel.textContent = '\u2013';
    gndRow.appendChild(gndLabel);
    var gndHoles = [];
    for (var g = 0; g < ROWS; g++) {
      var gh = document.createElement('span');
      gh.style.cssText = 'display:inline-block;width:14px;height:14px;background:#333;border-radius:50%;cursor:pointer;border:1px solid #555;';
      gh.setAttribute('data-type', 'gnd');
      gh.setAttribute('data-idx', g.toString());
      gndHoles.push(gh);
      gndRow.appendChild(gh);
    }
    allHoles.push({ type: 'gnd', holes: gndHoles });
    bbDiv.appendChild(gndRow);

    // Column labels
    var colLabelRow = document.createElement('div');
    colLabelRow.style.cssText = 'display:flex;gap:4px;margin-bottom:2px;padding-left:28px;font-size:10px;color:#666;';
    colLabelsLeft.forEach(function (c) {
      var sp = document.createElement('span');
      sp.style.cssText = 'display:inline-block;width:14px;text-align:center;';
      sp.textContent = c;
      colLabelRow.appendChild(sp);
    });
    var gapLabel = document.createElement('span');
    gapLabel.style.cssText = 'display:inline-block;width:20px;';
    colLabelRow.appendChild(gapLabel);
    colLabelsRight.forEach(function (c) {
      var sp = document.createElement('span');
      sp.style.cssText = 'display:inline-block;width:14px;text-align:center;';
      sp.textContent = c;
      colLabelRow.appendChild(sp);
    });
    bbDiv.appendChild(colLabelRow);

    // Main rows
    var leftGroups = [];
    var rightGroups = [];
    for (var r = 1; r <= ROWS; r++) {
      var rowDiv = document.createElement('div');
      rowDiv.style.cssText = 'display:flex;gap:4px;align-items:center;margin-bottom:2px;';

      var rowLabel = document.createElement('span');
      rowLabel.style.cssText = 'font-size:10px;color:#666;width:20px;text-align:right;margin-right:4px;';
      rowLabel.textContent = r.toString();
      rowDiv.appendChild(rowLabel);

      // Left side (a-e)
      var leftHoles = [];
      for (var cl = 0; cl < COLS_LEFT; cl++) {
        var hole = document.createElement('span');
        hole.style.cssText = 'display:inline-block;width:14px;height:14px;background:#333;border-radius:50%;cursor:pointer;border:1px solid #555;';
        hole.setAttribute('data-type', 'left');
        hole.setAttribute('data-row', r.toString());
        hole.setAttribute('data-col', cl.toString());
        leftHoles.push(hole);
        rowDiv.appendChild(hole);
      }
      leftGroups.push(leftHoles);

      // Center gap
      var gap = document.createElement('span');
      gap.style.cssText = 'display:inline-block;width:20px;height:14px;background:#c4b898;border-radius:2px;';
      rowDiv.appendChild(gap);

      // Right side (f-j)
      var rightHolesRow = [];
      for (var cr = 0; cr < COLS_RIGHT; cr++) {
        var holeR = document.createElement('span');
        holeR.style.cssText = 'display:inline-block;width:14px;height:14px;background:#333;border-radius:50%;cursor:pointer;border:1px solid #555;';
        holeR.setAttribute('data-type', 'right');
        holeR.setAttribute('data-row', r.toString());
        holeR.setAttribute('data-col', cr.toString());
        rightHolesRow.push(holeR);
        rowDiv.appendChild(holeR);
      }
      rightGroups.push(rightHolesRow);

      bbDiv.appendChild(rowDiv);
    }

    // Collect all hole elements for clearing
    function clearHighlights() {
      var all = bbDiv.querySelectorAll('span[data-type]');
      for (var i = 0; i < all.length; i++) {
        all[i].style.background = '#333';
        all[i].style.borderColor = '#555';
      }
    }

    function highlightGroup(holes, color) {
      holes.forEach(function (h) {
        h.style.background = color;
        h.style.borderColor = color;
      });
    }

    // Click handler for all holes
    bbDiv.addEventListener('click', function (e) {
      var target = e.target;
      var type = target.getAttribute('data-type');
      if (!type) return;

      clearHighlights();

      if (type === 'power') {
        highlightGroup(pwrHoles, '#f87171');
        infoDiv.innerHTML = '<b>Power rail (+):</b> All ' + ROWS + ' holes in this rail are connected horizontally. Used for V<sub>cc</sub> (3.3V or 5V). <span style="color:#fbbf24;">Note: some boards break the rail in the middle!</span>';
      } else if (type === 'gnd') {
        highlightGroup(gndHoles, '#7ab7ff');
        infoDiv.innerHTML = '<b>Ground rail (\u2013):</b> All ' + ROWS + ' holes in this rail are connected horizontally. Used for GND (0V). <span style="color:#fbbf24;">Note: some boards break the rail in the middle!</span>';
      } else if (type === 'left') {
        var row = parseInt(target.getAttribute('data-row'));
        var col = parseInt(target.getAttribute('data-col'));
        highlightGroup(leftGroups[row - 1], '#4ade80');
        infoDiv.innerHTML = '<b>Row ' + row + ', columns a-e:</b> These 5 holes are internally connected. They are <b>NOT</b> connected to f-j across the center gap. Anything plugged into row ' + row + ' on the left side shares the same electrical node.';
      } else if (type === 'right') {
        var rowR = parseInt(target.getAttribute('data-row'));
        var colR = parseInt(target.getAttribute('data-col'));
        highlightGroup(rightGroups[rowR - 1], '#a78bfa');
        infoDiv.innerHTML = '<b>Row ' + rowR + ', columns f-j:</b> These 5 holes are internally connected. They are <b>NOT</b> connected to a-e across the center gap. This side is independent from the left side of the same row.';
      }
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>On a standard breadboard, are holes <b>a1 through e1</b> connected to holes <b>f1 through j1</b>?</p>',
      mountInput: function (container) {
        var opts = [
          '(a) Yes, all 10 holes in row 1 are connected',
          '(b) No, the center gap separates a-e from f-j',
          '(c) Only if you bridge them with a jumper wire',
          '(d) It depends on the breadboard brand'
        ];
        var sel = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o.charAt(1); opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'b') return { correct: true, feedback: 'Correct! The center gap physically and electrically separates the two sides. Holes a1-e1 are connected to each other, and holes f1-j1 are connected to each other, but the two groups are NOT connected. This gap is sized for DIP IC chips to straddle so each pin gets its own isolated row.' };
        if (v === 'a') return { correct: false, feedback: 'No! The center gap (the "ravine" running down the middle) separates a-e from f-j. Only a-e are connected in one group, and f-j in another. This is by design — DIP chips straddle the gap so opposite pins do not short together.' };
        if (v === 'c') return { correct: false, feedback: 'You are right that a jumper could connect them, but the question asks about the internal connections. The answer is (b): a-e and f-j are NOT internally connected. The gap separates them.' };
        return { correct: false, feedback: 'This is standard across all breadboards — the center gap always separates a-e from f-j. Answer: (b).' };
      },
      hints: [
        'The breadboard has a gap running down the center. What is its purpose?',
        'The gap is sized for DIP IC chips. Each pin of the chip needs its own isolated row.',
        'a1 through e1 are connected. f1 through j1 are connected. But the gap separates the two groups. Answer: (b).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You need to connect an ESP32 GPIO to an I2C sensor\'s SDA pin, AND add a <b>4.7k&Omega; pull-up resistor</b> from SDA to 3.3V. How do you do this on a breadboard? Describe the technique.</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 5;
        ta.cols = 55;
        ta.placeholder = 'Describe where each wire/component goes...';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var answer = v.toLowerCase();
        if (answer.length < 20) return { correct: false, feedback: 'Please describe in more detail how you would wire this on a breadboard.' };

        var hasSameRow = answer.indexOf('same row') !== -1 || answer.indexOf('same breadboard row') !== -1 || answer.indexOf('share') !== -1 || answer.indexOf('common row') !== -1 || answer.indexOf('one row') !== -1;
        var hasResistor = answer.indexOf('resistor') !== -1 || answer.indexOf('4.7k') !== -1 || answer.indexOf('pull') !== -1;
        var hasPowerRail = answer.indexOf('3.3') !== -1 || answer.indexOf('power') !== -1 || answer.indexOf('vcc') !== -1 || answer.indexOf('rail') !== -1;
        var hasConnection = answer.indexOf('connect') !== -1 || answer.indexOf('plug') !== -1 || answer.indexOf('wire') !== -1 || answer.indexOf('jumper') !== -1 || answer.indexOf('pin') !== -1 || answer.indexOf('row') !== -1;

        if (hasSameRow && hasResistor && hasPowerRail) return { correct: true, feedback: 'Correct! The key insight is that a breadboard row is a shared node. Put the ESP32 SDA wire, the sensor SDA pin, and one leg of the 4.7k\u03A9 resistor all in the <b>same row</b>. The other leg of the resistor goes to the 3.3V power rail. Since all holes in a row (a-e or f-j) are internally connected, all three are electrically joined — which is exactly what a pull-up needs: one connection to the signal line and one to V<sub>cc</sub>.' };
        if ((hasSameRow || hasConnection) && (hasResistor || hasPowerRail)) return { correct: false, feedback: 'You are on the right track! The key technique: put the ESP32 SDA wire, the sensor SDA pin, and one leg of the 4.7k\u03A9 resistor all in the <b>same breadboard row</b> (they share holes in that row). The other leg of the resistor goes to the 3.3V power rail. The breadboard row acts as a shared electrical node connecting all three.' };
        return { correct: false, feedback: 'The technique is the <b>shared-row connection</b>: put the ESP32 SDA wire, the sensor SDA pin, and one leg of the 4.7k\u03A9 pull-up resistor all in the <b>same breadboard row</b>. Since holes in a row are internally connected, all three components share the SDA signal. The other leg of the resistor plugs into the 3.3V power rail. This is how breadboards make multi-way connections easy — every hole in a row is the same electrical node.' };
      },
      hints: [
        'On a breadboard, all 5 holes in a row (a-e) are internally connected. That means anything plugged into the same row shares an electrical connection.',
        'You need three things connected to SDA: the ESP32 wire, the sensor pin, and one leg of the resistor. What if you put all three in the same row?',
        'Put the ESP32 SDA, sensor SDA, and one resistor leg in the same breadboard row. The other resistor leg goes to the 3.3V power rail. The shared row connects all three.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You have breadboarded a working circuit and want to make a PCB. Your circuit has: an <b>ESP32 module</b>, a <b>BME280 breakout</b>, <b>3 LEDs with resistors</b>, <b>2 buttons</b>, a <b>buzzer</b>, and a <b>micro-USB connector</b> for power. Estimate: (1) the minimum board dimensions (in cm), and (2) the number of nets (unique signal traces) you need to route.</p>',
      mountInput: function (container) {
        var div1 = document.createElement('div');
        div1.style.marginBottom = '8px';
        var label1 = document.createElement('span');
        label1.textContent = 'Board size (W x H cm): ';
        var inpW = document.createElement('input');
        inpW.type = 'number';
        inpW.step = 'any';
        inpW.placeholder = 'W';
        inpW.style.width = '60px';
        var x = document.createElement('span');
        x.textContent = ' x ';
        var inpH = document.createElement('input');
        inpH.type = 'number';
        inpH.step = 'any';
        inpH.placeholder = 'H';
        inpH.style.width = '60px';
        var cm = document.createElement('span');
        cm.textContent = ' cm';
        div1.appendChild(label1);
        div1.appendChild(inpW);
        div1.appendChild(x);
        div1.appendChild(inpH);
        div1.appendChild(cm);
        container.appendChild(div1);

        var div2 = document.createElement('div');
        var label2 = document.createElement('span');
        label2.textContent = 'Number of nets: ';
        var inpN = document.createElement('input');
        inpN.type = 'number';
        inpN.step = '1';
        inpN.placeholder = 'e.g. 12';
        inpN.style.width = '80px';
        div2.appendChild(label2);
        div2.appendChild(inpN);
        container.appendChild(div2);

        return function () {
          return {
            w: inpW.value,
            h: inpH.value,
            nets: inpN.value
          };
        };
      },
      check: function (v) {
        var w = parseFloat(v.w);
        var h = parseFloat(v.h);
        var nets = parseInt(v.nets);

        if (isNaN(w) || isNaN(h) || isNaN(nets)) return { correct: false, feedback: 'Please fill in all three fields with numbers.' };

        var area = w * h;
        var sizeOk = (w >= 3 && w <= 7 && h >= 3 && h <= 7) || (area >= 12 && area <= 35);
        var netsOk = nets >= 10 && nets <= 15;

        var feedback = '';
        if (sizeOk && netsOk) {
          return { correct: true, feedback: 'Great estimates! The ESP32 module is about 25x18 mm, plus space for all the other components and traces, a board around 5x4 cm (50x40 mm) is realistic. For nets: 3.3V + GND (2 power nets), I2C SDA + SCL (2), 3 LED GPIOs, 2 button GPIOs, 1 buzzer GPIO, USB 5V + GND (2, though GND is shared) = roughly 12 unique nets. Well done!' };
        }

        var issues = [];
        if (!sizeOk) {
          if (area < 12) issues.push('Board seems too small. The ESP32 module alone is ~25x18 mm. With all the other components, you need at least 4x3 cm or so.');
          else issues.push('Board seems larger than needed. 5x4 cm (or 6x5 cm with generous spacing) should fit everything.');
        }
        if (!netsOk) {
          if (nets < 10) issues.push('Too few nets. Count: 3.3V, GND, SDA, SCL, 3 LED GPIOs, 2 button GPIOs, buzzer GPIO, USB power = ~12 nets.');
          else issues.push('A bit high. Some signals share nets (all GND connections are one net). Typical count is 10-15 for this circuit.');
        }
        return { correct: false, feedback: issues.join(' ') + ' A good estimate: ~5x4 cm board, ~12 nets (3.3V, GND, SDA, SCL, LED1, LED2, LED3, BTN1, BTN2, BUZZER, USB_5V, USB_GND).' };
      },
      hints: [
        'The ESP32 module is about 25x18 mm. The BME280 breakout is about 15x12 mm. Each LED + resistor takes ~10x5 mm. Allow spacing between components for traces.',
        'For nets, count unique signals: power (3.3V, GND), I2C (SDA, SCL), one GPIO per LED (3), one GPIO per button (2), one GPIO for buzzer (1), USB power lines (2 but GND is shared).',
        'Board: ~5x4 cm. Nets: ~12 (3.3V, GND, SDA, SCL, 3 LED GPIOs, 2 button GPIOs, buzzer GPIO, USB 5V — GND is shared with the main GND net).'
      ]
    }
  ]
});
