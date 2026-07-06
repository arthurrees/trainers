// Level 2 — Reading Circuit Diagrams
EST.registerLevel({
  id: 2,
  title: 'Reading Circuit Diagrams',
  whyItMatters: 'Schematics are the universal language of electronics. Every tutorial, datasheet, and forum answer uses them. You cannot build real projects without being able to read one.',
  glossary: ['LED', 'resistor', 'capacitor', 'diode', 'transistor', 'schematic'],
  learn:
    '<h4>What is a schematic?</h4>' +
    '<p>A schematic (also called a circuit diagram) is a drawing that shows how components connect <b>electrically</b> — not physically. Two symbols connected by a line means "these are on the same wire." The physical layout on your breadboard will look completely different from the schematic, but the electrical connections are the same.</p>' +
    '<p>Think of it like a subway map: it shows you which stations connect, not the actual geography of the tunnels underground.</p>' +

    '<h4>The symbols you must know</h4>' +
    '<div class="example">' +
    '<div class="label">Essential schematic symbols</div>' +
    '<ul>' +
    '<li><b>Resistor</b> — a zigzag line (US style) or a rectangle (European style). Limits current. By far the most common component.</li>' +
    '<li><b>Capacitor</b> — two parallel lines with a gap. Stores a tiny charge. Polarized (electrolytic) caps have one curved line. Smooths power, filters noise.</li>' +
    '<li><b>LED</b> — a triangle pointing at a bar, with two small arrows coming off it (the arrows represent light). Current flows from the flat base of the triangle (anode, +) toward the bar at the tip (cathode, -). Must always have a current-limiting resistor in series.</li>' +
    '<li><b>Diode</b> — like an LED but without the arrows. A one-way valve for current: allows flow from anode to cathode only.</li>' +
    '<li><b>Transistor (NPN)</b> — a circle with three lines: base (B, the control pin), collector (C), and emitter (E, has an arrow pointing outward). A small current into the base allows a large current from collector to emitter.</li>' +
    '<li><b>MOSFET</b> — similar to a transistor but voltage-controlled. Three pins: gate (G), drain (D), source (S). A voltage on the gate opens the drain-source channel.</li>' +
    '<li><b>Battery / power source</b> — alternating long and short horizontal lines. Long line = positive (+), short line = negative (-).</li>' +
    '<li><b>Ground (GND)</b> — three horizontal lines decreasing in width, or a single downward-pointing triangle. The 0V reference.</li>' +
    '<li><b>Switch</b> — a gap in a wire with a lever that can close it. Open = no connection, closed = wire is complete.</li>' +
    '</ul></div>' +

    '<h4>Reading the wires</h4>' +
    '<div class="callout"><div class="label">Wire rules</div>' +
    '<ul>' +
    '<li>A <b>straight line</b> between two components means they are electrically connected — same wire.</li>' +
    '<li>Where two lines <b>cross</b>: a <b>dot</b> at the intersection means they ARE connected. <b>No dot</b> (or a small bridge/hop) means they are NOT connected — they just happen to cross on the diagram.</li>' +
    '<li>Wires can bend at right angles freely. The shape of the wire does not matter — only the connections.</li>' +
    '</ul></div>' +

    '<h4>Series vs parallel</h4>' +
    '<p>Two fundamental ways to connect components:</p>' +
    '<div class="example">' +
    '<div class="label">Series connection</div>' +
    '<p>Components are connected <b>end-to-end</b>, forming a single path for current. Current is the <b>same</b> through each component (there is only one path). Voltage is <b>split</b> across them.</p>' +
    '<p>For resistors in series: <b>R_total = R1 + R2 + R3 + ...</b></p>' +
    '<p>Analogy: cars on a single-lane road. Every car passes through every tollbooth (same current), but each tollbooth slows them down a little (each resistor drops some voltage).</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Parallel connection</div>' +
    '<p>Components are connected <b>side by side</b> — both ends touch the same two nodes. Voltage is the <b>same</b> across each component. Current is <b>split</b> between them.</p>' +
    '<p>For resistors in parallel: <b>1/R_total = 1/R1 + 1/R2</b></p>' +
    '<p>For two resistors: <b>R_total = (R1 &times; R2) / (R1 + R2)</b></p>' +
    '<p>Analogy: a highway splitting into two lanes. The pressure (voltage) is the same on both lanes, but traffic (current) divides between them.</p>' +
    '</div>' +

    '<h4>Reading a real schematic: LED circuit</h4>' +
    '<div class="example">' +
    '<div class="label">Worked example</div>' +
    '<p>A schematic shows: <code class="inline">3.3V &rarr; 220&Omega; resistor &rarr; LED (1.8V forward) &rarr; GND</code></p>' +
    '<p>Reading it: The 3.3V source connects to one end of the 220&Omega; resistor. The other end of the resistor connects to the anode of the LED. The cathode of the LED connects to GND. This is a <b>series</b> circuit — one path.</p>' +
    '<p>Current: I = (3.3 - 1.8) / 220 = 1.5 / 220 = 0.00682 A = <b>6.8 mA</b>. Safe for an LED.</p>' +
    '</div>' +

    '<h4>Common schematic patterns you will see everywhere</h4>' +
    '<div class="callout"><div class="label">Patterns to recognize</div>' +
    '<ul>' +
    '<li><b>Pull-up/pull-down resistor:</b> A resistor from a pin to Vcc (pull-up) or GND (pull-down). Prevents floating inputs.</li>' +
    '<li><b>Decoupling capacitor:</b> A small capacitor (0.1 &micro;F / 100 nF) placed very close to an IC between Vcc and GND. Filters high-frequency noise. Every IC in a real design has one.</li>' +
    '<li><b>Current-limiting resistor:</b> A resistor in series with an LED. Always. No exceptions.</li>' +
    '<li><b>Voltage divider:</b> Two resistors in series between Vin and GND, with the output tapped from the middle.</li>' +
    '<li><b>Flyback diode:</b> A diode placed reverse-biased across a motor or relay coil. When the coil turns off, the collapsing magnetic field creates a voltage spike that can damage your MCU. The diode safely absorbs it.</li>' +
    '</ul></div>',

  mountPlay: function (container) {
    var symbols = [
      { name: 'Resistor', art: '\u2500/\\/\\/\u2500', desc: 'Limits current flow. Value in ohms (\u03A9). Color bands encode the value. The most common passive component.', use: 'Current limiting for LEDs, pull-up/pull-down on inputs, voltage dividers.' },
      { name: 'Capacitor', art: '\u2500|||\u2500', desc: 'Stores and releases charge. Value in farads (usually \u00B5F or pF). Polarized (electrolytic) types have a + side.', use: 'Power smoothing (decoupling), noise filtering, debouncing buttons, timing circuits.' },
      { name: 'LED', art: '\u2500\u25B6|\u2500 (\u2197\u2197)', desc: 'Light-emitting diode. Current flows from anode (+, triangle) to cathode (-, bar). Emits light. Always needs a series resistor.', use: 'Status indicators, user feedback, light output.' },
      { name: 'Diode', art: '\u2500\u25B6|\u2500', desc: 'One-way valve for current. Blocks reverse current. Has ~0.7V forward drop (silicon) or ~0.3V (Schottky).', use: 'Reverse polarity protection, flyback protection across motors/relays.' },
      { name: 'NPN Transistor', art: 'B\u2500\u2502 C\u2500\u2502 E\u2500\u25BD', desc: 'Current amplifier/switch. A small current into the Base allows a larger current to flow from Collector to Emitter.', use: 'Switching loads (LEDs, small motors) from a GPIO pin.' },
      { name: 'MOSFET (N-ch)', art: 'G\u2500\u2502 D\u2500\u2502 S\u2500', desc: 'Voltage-controlled switch. A voltage on the Gate opens a channel from Drain to Source. Almost zero current on the gate.', use: 'Switching high-current loads: motors, LED strips, heaters.' },
      { name: 'Battery', art: '\u2500|||\u2500 (long=+)', desc: 'Power source. Long line is positive (+), short line is negative (-). Multiple pairs = higher voltage.', use: 'Portable power supply. A single LiPo cell is 3.7V nominal.' },
      { name: 'Ground', art: '\u23DA (three lines)', desc: 'The 0V reference point. All voltages are measured relative to ground. Symbol: three decreasing horizontal lines.', use: 'Every circuit needs a return path to ground.' },
      { name: 'Switch', art: '\u2500 / \u2500 (lever)', desc: 'Mechanical connection/disconnection. Open = circuit broken. Closed = circuit complete.', use: 'On/off power, user buttons, mode selection.' },
      { name: 'Wire Junction', art: '\u2500\u2022\u2500 (dot)', desc: 'A dot where wires cross means they are connected. No dot (or a hop) means they just cross on paper.', use: 'Distinguishing connected vs non-connected wire crossings on schematics.' }
    ];

    container.innerHTML =
      '<p class="muted">Click a schematic symbol to learn what it is and where you will see it.</p>' +
      '<div class="chip-row" id="est-sym-row"></div>' +
      '<div id="est-sym-detail" class="formula-box" style="margin-top:12px;min-height:80px;">' +
      'Pick a symbol above to see its description.</div>';

    var row = container.querySelector('#est-sym-row');
    var detail = container.querySelector('#est-sym-detail');

    symbols.forEach(function (s) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = s.name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');
        detail.innerHTML =
          '<div><b>' + s.name + '</b></div>' +
          '<div class="info-line" style="font-family:monospace;font-size:1.1em;margin:8px 0;">' + s.art + '</div>' +
          '<div>' + s.desc + '</div>' +
          '<div class="info-line" style="margin-top:8px;"><span class="key">Common uses:</span> <span class="val">' + s.use + '</span></div>';
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>In a <b>series circuit</b> with a 100&Omega; and a 200&Omega; resistor, what is the <b>total resistance</b>? (Enter in ohms.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 150';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' \u03A9';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        if (num === 300) return { correct: true, feedback: 'Correct! In series, resistances simply add: R_total = 100\u03A9 + 200\u03A9 = 300\u03A9. The current through both is the same, and each resistor drops a portion of the total voltage.' };
        if (num > 60 && num < 70) return { correct: false, feedback: 'That looks like the parallel formula. For SERIES, resistances ADD: R_total = R1 + R2 = 100 + 200 = 300\u03A9.' };
        return { correct: false, feedback: 'Not quite. For resistors in series: R_total = R1 + R2 = 100 + 200 = 300\u03A9. Series means end-to-end, one path.' };
      },
      hints: [
        'Series means the resistors are connected end-to-end. There is one path for current.',
        'In series, resistances add: R_total = R1 + R2.',
        'R_total = 100 + 200 = 300\u03A9.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Two <b>10k&Omega; resistors in parallel</b>. What is the combined resistance? (Enter in ohms. You can type 5000 or 5k.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. 5000 or 5k';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' \u03A9';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var s = String(v).trim().toLowerCase().replace(/\s/g, '');
        var num;
        if (s.indexOf('k') !== -1) {
          num = parseFloat(s) * 1000;
        } else {
          num = parseFloat(s);
        }
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number (e.g. 5000 or 5k).' };
        if (num >= 4900 && num <= 5100) return { correct: true, feedback: 'Correct! For two equal resistors in parallel: R_total = R/2 = 10k/2 = 5k\u03A9. The general formula: 1/R_total = 1/R1 + 1/R2, so R_total = (R1 &times; R2) / (R1 + R2) = (10k &times; 10k) / (10k + 10k) = 100M / 20k = 5k\u03A9.' };
        if (num >= 19000 && num <= 21000) return { correct: false, feedback: 'That is the series result (R1 + R2). For PARALLEL: R_total = (R1 &times; R2) / (R1 + R2) = 5k\u03A9. Parallel resistance is always LESS than the smallest individual resistor.' };
        return { correct: false, feedback: 'Not quite. For resistors in parallel: R_total = (R1 &times; R2) / (R1 + R2) = (10000 &times; 10000) / (10000 + 10000) = 5000\u03A9 = 5k\u03A9.' };
      },
      hints: [
        'Parallel means both ends of the resistors connect to the same two nodes. The formula is different from series.',
        'For two resistors in parallel: R_total = (R1 &times; R2) / (R1 + R2). Or for equal resistors: R_total = R / 2.',
        '(10000 &times; 10000) / (10000 + 10000) = 100,000,000 / 20,000 = 5000\u03A9.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>A schematic shows: <code class="inline">3.3V &rarr; 220&Omega; resistor &rarr; LED (1.8V forward voltage) &rarr; GND</code>. How much current flows through the LED? (Enter in mA.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 10.0';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' mA';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // Exact: (3.3-1.8)/220 = 1.5/220 = 0.006818 A = 6.818 mA
        var exact = (3.3 - 1.8) / 220 * 1000;
        if (num >= 6.5 && num <= 7.0) return { correct: true, feedback: 'Correct! I = (V_source - V_forward) / R = (3.3 - 1.8) / 220 = 1.5 / 220 = ' + exact.toFixed(1) + ' mA. This is a safe current for most LEDs (typical max is 20 mA). The 220\u03A9 resistor protects the LED from overcurrent.' };
        if (num >= 14 && num <= 16) return { correct: false, feedback: 'You may have used 3.3V / 220\u03A9 without subtracting the LED forward voltage. The LED "uses up" 1.8V, so the resistor only sees 3.3 - 1.8 = 1.5V. Current = 1.5 / 220 = ' + exact.toFixed(1) + ' mA.' };
        return { correct: false, feedback: 'Not quite. The resistor drops (3.3V - 1.8V) = 1.5V. Then I = V/R = 1.5 / 220 = ' + exact.toFixed(1) + ' mA.' };
      },
      hints: [
        'This is a series circuit. The LED has a forward voltage of 1.8V, which means the resistor must drop the remaining voltage.',
        'Voltage across the resistor: V_R = 3.3 - 1.8 = 1.5V. Now use Ohm\'s law: I = V / R.',
        'I = 1.5V / 220\u03A9 = 0.00682 A = 6.8 mA.'
      ]
    }
  ]
});
