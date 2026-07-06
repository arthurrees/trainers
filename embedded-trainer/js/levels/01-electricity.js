// Level 1 — Electricity Fundamentals
EST.registerLevel({
  id: 1,
  title: 'Electricity Fundamentals',
  whyItMatters: 'Every embedded project is an electrical circuit. If you do not understand Ohm\'s law, you will burn out LEDs, fry GPIO pins, and wonder why your sensor reads garbage.',
  glossary: ['voltage', 'current', 'resistance', 'GND', 'Vcc'],
  learn:
    '<h4>Ohm\'s Law: the one equation you must know</h4>' +
    '<p>All of electronics rests on one relationship:</p>' +
    '<div class="example">' +
    '<div class="label">Ohm\'s Law</div>' +
    '<p><b>V = I &times; R</b></p>' +
    '<p>Voltage (V, in volts) = Current (I, in amps) &times; Resistance (R, in ohms)</p>' +
    '<p>Rearranged: <b>I = V / R</b> and <b>R = V / I</b></p>' +
    '</div>' +

    '<h4>The water pipe analogy</h4>' +
    '<p>If electricity is water flowing through pipes:</p>' +
    '<ul>' +
    '<li><b>Voltage</b> is the water pressure — how hard the water is being pushed. A 5V pin pushes harder than a 3.3V pin.</li>' +
    '<li><b>Current</b> is the flow rate — how much water passes through per second. Measured in amps (A). In MCU work, you will almost always deal in <b>milliamps (mA)</b> — thousandths of an amp. An LED might need 10-20 mA. A motor might need 500 mA.</li>' +
    '<li><b>Resistance</b> is how narrow the pipe is — it restricts flow. Measured in ohms (&Omega;). A resistor is literally a component that "resists" current flow on purpose.</li>' +
    '</ul>' +

    '<h4>Power: how much energy per second</h4>' +
    '<div class="example">' +
    '<div class="label">Power equation</div>' +
    '<p><b>P = V &times; I</b></p>' +
    '<p>Power (P, in watts) = Voltage &times; Current. A 5V pin supplying 20 mA uses P = 5 &times; 0.020 = 0.1 W (100 milliwatts).</p>' +
    '</div>' +
    '<p>Power matters for battery life and heat. If a voltage regulator is dropping 5V to 3.3V at 100 mA, it dissipates (5 - 3.3) &times; 0.1 = 0.17 W as heat. That is fine. At 1A it would be 1.7 W — enough to need a heatsink.</p>' +

    '<h4>Units you will use daily</h4>' +
    '<div class="example">' +
    '<div class="label">Common units</div>' +
    '<ul>' +
    '<li><b>Volts (V)</b> — 3.3V and 5V are the two voltages you will see most in MCU work.</li>' +
    '<li><b>Amps (A)</b> — but you will usually say milliamps (mA). 1 A = 1,000 mA. A GPIO pin typically outputs 10-40 mA max.</li>' +
    '<li><b>Ohms (&Omega;)</b> — resistor values. Common: 100&Omega;, 220&Omega;, 1k&Omega; (1,000), 10k&Omega; (10,000), 4.7k&Omega;.</li>' +
    '<li><b>Watts (W)</b> — power. A USB port supplies 5V at 500 mA = 2.5 W.</li>' +
    '</ul></div>' +

    '<h4>GPIO pins: tiny power sources</h4>' +
    '<p>An MCU GPIO pin set to OUTPUT HIGH puts out either 3.3V (ESP32, Pico) or 5V (Arduino Uno). But the key limitation is <b>current</b>: a typical GPIO pin can supply only <b>10-40 mA</b>. That is enough to light an LED, but nowhere near enough to spin a motor or drive an LED strip.</p>' +
    '<div class="callout"><div class="label">The golden rule</div>' +
    'If your load needs more current than the GPIO can supply, you need a <b>transistor or MOSFET</b> to switch a separate, beefier power source. The GPIO acts as a "gate signal" — it tells the transistor when to let the big current flow.</div>' +

    '<h4>Worked example: LED current-limiting resistor</h4>' +
    '<p>You want to connect a red LED to an ESP32 GPIO pin (3.3V). The LED has a <b>forward voltage</b> of 1.8V (the voltage "used up" by the LED) and you want 20 mA of current through it. What resistor do you need?</p>' +
    '<div class="example">' +
    '<div class="label">Step-by-step calculation</div>' +
    '<p>1. The resistor must drop the remaining voltage: V<sub>R</sub> = 3.3V - 1.8V = <b>1.5V</b></p>' +
    '<p>2. Apply Ohm\'s law: R = V / I = 1.5 / 0.020 = <b>75&Omega;</b></p>' +
    '<p>3. Resistors come in standard values. The nearest standard value above 75&Omega; is <b>82&Omega;</b> or <b>100&Omega;</b>. Using 100&Omega; means slightly less current (I = 1.5/100 = 15 mA), which is fine — the LED will be slightly dimmer but perfectly safe.</p>' +
    '<p>Always round <b>up</b> to the next standard resistor. Rounding down means more current than you planned, and risks burning out the LED.</p>' +
    '</div>' +

    '<h4>Voltage dividers</h4>' +
    '<p>A voltage divider is two resistors in series that split an input voltage into a smaller output voltage. This is incredibly common — you use it to read a 5V sensor with a 3.3V MCU, or to scale a battery voltage into ADC range.</p>' +
    '<div class="example">' +
    '<div class="label">Voltage divider formula</div>' +
    '<p><b>V<sub>out</sub> = V<sub>in</sub> &times; R2 / (R1 + R2)</b></p>' +
    '<p>where R1 is the "top" resistor (connected to V<sub>in</sub>) and R2 is the "bottom" resistor (connected to GND). V<sub>out</sub> is measured at the junction between them.</p>' +
    '<p>Example: V<sub>in</sub> = 5V, R1 = 10k&Omega;, R2 = 20k&Omega; &rarr; V<sub>out</sub> = 5 &times; 20k / (10k + 20k) = 5 &times; 20/30 = <b>3.33V</b>. Perfect for stepping a 5V signal down to 3.3V.</p>' +
    '</div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;

    container.innerHTML =
      '<p class="muted">Enter any two of V, I, R and the third will be calculated. Leave one field blank to solve for it.</p>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin-bottom:16px;">' +
        '<div><label>Voltage (V):</label><br><input id="est-ohm-v" type="number" step="any" style="width:100px;" placeholder="blank = solve"></div>' +
        '<div><label>Current (mA):</label><br><input id="est-ohm-i" type="number" step="any" style="width:100px;" placeholder="blank = solve"></div>' +
        '<div><label>Resistance (&Omega;):</label><br><input id="est-ohm-r" type="number" step="any" style="width:100px;" placeholder="blank = solve"></div>' +
        '<div><button id="est-ohm-calc" class="primary-btn">Calculate</button></div>' +
      '</div>' +
      '<div id="est-ohm-result" class="formula-box" style="min-height:50px;">Enter two values and click Calculate.</div>';

    var vIn = container.querySelector('#est-ohm-v');
    var iIn = container.querySelector('#est-ohm-i');
    var rIn = container.querySelector('#est-ohm-r');
    var btn = container.querySelector('#est-ohm-calc');
    var result = container.querySelector('#est-ohm-result');

    btn.addEventListener('click', function () {
      var vVal = vIn.value.trim() === '' ? null : parseFloat(vIn.value);
      var iVal = iIn.value.trim() === '' ? null : parseFloat(iIn.value) / 1000; // mA to A
      var rVal = rIn.value.trim() === '' ? null : parseFloat(rIn.value);

      var blanks = (vVal === null ? 1 : 0) + (iVal === null ? 1 : 0) + (rVal === null ? 1 : 0);
      if (blanks !== 1) {
        result.innerHTML = 'Leave exactly <b>one</b> field blank to solve for it.';
        return;
      }

      var V, I, R;
      if (vVal === null) {
        I = iVal; R = rVal;
        V = lib.ohmsV(I, R);
        vIn.value = V.toFixed(3);
      } else if (iVal === null) {
        V = vVal; R = rVal;
        I = lib.ohmsI(V, R);
        iIn.value = (I * 1000).toFixed(3);
      } else {
        V = vVal; I = iVal;
        R = lib.ohmsR(V, I);
        rIn.value = R.toFixed(1);
      }

      V = vVal !== null ? vVal : V;
      I = iVal !== null ? iVal : I;
      R = rVal !== null ? rVal : R;

      var P = lib.power(V, I);
      result.innerHTML =
        '<div class="info-line"><span class="key">Voltage:</span> <span class="val">' + lib.fmtVolts(V) + '</span></div>' +
        '<div class="info-line"><span class="key">Current:</span> <span class="val">' + lib.fmtAmps(I) + '</span></div>' +
        '<div class="info-line"><span class="key">Resistance:</span> <span class="val">' + lib.fmtOhms(R) + '</span></div>' +
        '<div class="info-line"><span class="key">Power:</span> <span class="val">' + (P < 1 ? (P * 1000).toFixed(1) + ' mW' : P.toFixed(3) + ' W') + '</span></div>';
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>An LED has a <b>forward voltage of 2.0V</b> and you want <b>15 mA</b> through it. Your ESP32 outputs <b>3.3V</b>. What resistor do you need? (Enter a value in ohms.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 100';
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
        // Exact is 86.67. Accept 82-100 (standard resistor range)
        var exact = (3.3 - 2.0) / 0.015;
        if (num >= 82 && num <= 100) return { correct: true, feedback: 'Correct! R = (3.3V - 2.0V) / 0.015A = ' + exact.toFixed(1) + '\u03A9. Standard values nearby: 82\u03A9, 100\u03A9. Either works — 100\u03A9 gives 13 mA (slightly dimmer, very safe).' };
        if (num >= 75 && num < 82) return { correct: false, feedback: 'Close! The exact value is ' + exact.toFixed(1) + '\u03A9. In practice you would round UP to a standard value like 82\u03A9 or 100\u03A9 for safety. Values in the 82-100\u03A9 range are accepted.' };
        if (num > 100 && num <= 150) return { correct: false, feedback: 'A bit high. That would limit current below 10 mA and the LED would be quite dim. The exact value is ' + exact.toFixed(1) + '\u03A9. Use 82-100\u03A9.' };
        return { correct: false, feedback: 'Not quite. Use the formula: R = (V_source - V_forward) / I = (3.3 - 2.0) / 0.015 = ' + exact.toFixed(1) + '\u03A9. Standard values: 82\u03A9 or 100\u03A9.' };
      },
      hints: [
        'The resistor must drop the voltage that the LED does not use: V_R = 3.3V - 2.0V = 1.3V.',
        'Apply Ohm\'s law: R = V / I = 1.3V / 0.015A.',
        'R = 86.7\u03A9. The nearest standard resistor values are 82\u03A9 and 100\u03A9. Enter any value from 82 to 100.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You have a <b>5V source</b> and a voltage divider with <b>R1 = 10k&Omega;</b> (top) and <b>R2 = 20k&Omega;</b> (bottom). What is the output voltage? (Enter in volts.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 2.5';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' V';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // Exact: 5 * 20000/(10000+20000) = 3.333...
        var exact = EST.lib.embed.voltageDivider(5, 10000, 20000);
        if (num >= 3.3 && num <= 3.4) return { correct: true, feedback: 'Correct! V_out = V_in &times; R2 / (R1 + R2) = 5 &times; 20k / (10k + 20k) = 5 &times; 0.667 = ' + exact.toFixed(2) + 'V. Voltage dividers are commonly used to step 5V signals down to 3.3V for ESP32 inputs.' };
        if (num >= 1.6 && num <= 1.7) return { correct: false, feedback: 'You may have swapped R1 and R2. In the formula, R2 is the BOTTOM resistor (between the output and GND). V_out = V_in &times; R2 / (R1 + R2) = 5 &times; 20k / 30k = 3.33V.' };
        return { correct: false, feedback: 'Not quite. Use the voltage divider formula: V_out = V_in &times; R2 / (R1 + R2) = 5 &times; 20000 / (10000 + 20000) = ' + exact.toFixed(2) + 'V.' };
      },
      hints: [
        'The voltage divider formula is: V_out = V_in &times; R2 / (R1 + R2).',
        'R1 = 10k (top, connected to 5V), R2 = 20k (bottom, connected to GND). Plug in: V_out = 5 &times; 20000 / 30000.',
        '5 &times; 20000 / 30000 = 5 &times; 0.667 = 3.33V.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>A motor draws <b>500 mA at 12V</b>. Your ESP32 GPIO can supply <b>40 mA at 3.3V</b>. Can you drive the motor directly from the GPIO pin? If not, what do you need?</p>',
      mountInput: function (container) {
        var opts = [
          '(a) Yes, connect the motor directly to the GPIO pin',
          '(b) No — use a MOSFET or transistor to switch the 12V supply',
          '(c) No — use a voltage divider to step 3.3V up to 12V',
          '(d) No — use a capacitor to store enough charge'
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
        if (v === 'b') return { correct: true, feedback: 'Correct! The GPIO cannot supply 500 mA (max 40 mA) and cannot output 12V (only 3.3V). A MOSFET acts as an electronic switch: the GPIO pin drives the gate (needs almost zero current), and the MOSFET switches the 12V power supply to the motor. This is the standard pattern for driving motors, relays, LED strips, and anything else that needs more power than a GPIO can provide.' };
        if (v === 'a') return { correct: false, feedback: 'No! The GPIO can only supply 40 mA at 3.3V. The motor needs 500 mA at 12V. Connecting it directly would either burn out the GPIO pin or simply not work. You need a MOSFET to switch a separate 12V supply.' };
        if (v === 'c') return { correct: false, feedback: 'A voltage divider can only step voltage DOWN, not up. And even a boost converter would not solve the current problem — the GPIO tops out at 40 mA. You need a MOSFET to switch a separate 12V supply.' };
        return { correct: false, feedback: 'A capacitor stores and releases charge, but it cannot continuously supply 500 mA to a motor. You need a MOSFET to switch a separate 12V power supply, using the GPIO as a low-current gate signal.' };
      },
      hints: [
        'Compare what the GPIO can supply (40 mA, 3.3V) with what the motor needs (500 mA, 12V). Both voltage and current are mismatched.',
        'You need a component that can be controlled by a small signal (3.3V, almost zero current) but switch a large load (12V, 500 mA).',
        'A MOSFET is an electronic switch. The GPIO drives the gate (needs ~0 mA), the MOSFET connects the 12V supply to the motor. Answer is (b).'
      ]
    }
  ]
});
