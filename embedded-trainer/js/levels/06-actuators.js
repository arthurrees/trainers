// Level 6 — Actuators & Output Devices
EST.registerLevel({
  id: 6,
  title: 'Actuators & Output Devices',
  whyItMatters: 'Sensors let your MCU perceive the world, but actuators let it ACT on it — spinning motors, lighting LEDs, switching relays. The interface between a tiny GPIO pin and a powerful load is where most beginner mistakes (and fried boards) happen.',
  glossary: ['LED', 'transistor', 'relay', 'MOSFET', 'PWM'],
  learn:
    '<p>Actuators convert electrical signals into physical action. A sensor reads; an actuator does. Together they form the input-output loop that makes embedded systems useful.</p>' +

    '<h4>LEDs & Displays</h4>' +
    '<div class="example">' +
    '<div class="label">Single LEDs</div>' +
    '<p>An LED is the simplest actuator. Current flows through it, and it glows. But LEDs have almost zero resistance — if you connect one directly to 3.3V or 5V without a resistor, too much current will flow and the LED will burn out (or damage your GPIO pin).</p>' +
    '<p><b>Current-limiting resistor:</b> R = (Vsource - Vforward) / Iled. For a typical red LED (Vf = 2.0V, desired current = 10mA) on a 3.3V ESP32: R = (3.3 - 2.0) / 0.010 = 130 ohm. Use the next standard value up: 150 ohm.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">RGB LEDs</div>' +
    '<p>Three LEDs in one package: red, green, blue. Mix them to make any color. Two types:</p>' +
    '<ul>' +
    '<li><b>Common cathode:</b> the three anodes are separate (one per color), and they share a single ground pin. Apply voltage to each color to turn it on.</li>' +
    '<li><b>Common anode:</b> the three cathodes are separate, and they share a single VCC pin. Pull each color LOW to turn it on (inverted logic).</li>' +
    '</ul>' +
    '<p>Use PWM on each color pin to control brightness (0-255 levels) and mix millions of colors.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">WS2812B "NeoPixel" LED Strips</div>' +
    '<p>Individually addressable RGB LEDs on a strip. Each LED has a tiny controller chip built in. You control the entire strip from a <b>single data wire</b> — send a stream of 24-bit color values (8 bits each for red, green, blue), and each LED grabs its own data and passes the rest down the line.</p>' +
    '<p><b>Power warning:</b> Each LED draws up to 60 mA at full white (all three colors at max). A 60-LED strip at full white draws 60 x 60 mA = 3600 mA = 3.6 A. That is far too much for USB (500 mA). You need a separate 5V power supply rated for at least 4A.</p>' +
    '<p>Runs at 5V, but many strips accept 3.3V data signals. If not, use a level shifter.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">OLED Displays (SSD1306)</div>' +
    '<p>Tiny 128x64 pixel displays that connect over I2C (2 wires). Perfect for showing text, numbers, or simple graphics. Low power (typically 20-30 mA). Libraries like <code class="inline">ssd1306</code> in MicroPython make them easy to use. Great for status displays on sensor projects.</p>' +
    '</div>' +

    '<h4>Motors</h4>' +
    '<div class="example">' +
    '<div class="label">DC Motor</div>' +
    '<p>The simplest motor: apply voltage, it spins. Reverse the polarity, it spins the other way. Control speed with PWM (varying the duty cycle). Requires an <b>H-bridge</b> driver (like L298N or TB6612) to control direction from an MCU, or a single MOSFET if you only need one direction.</p>' +
    '<p>Draws 100 mA to several amps depending on size and load. <b>NEVER connect directly to a GPIO pin.</b></p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Servo Motor</div>' +
    '<p>A motor with a built-in controller that moves to a specific angle (0 to 180 degrees). You control it with a PWM signal at 50 Hz:</p>' +
    '<ul>' +
    '<li>1.0 ms pulse width = 0 degrees</li>' +
    '<li>1.5 ms pulse width = 90 degrees (center)</li>' +
    '<li>2.0 ms pulse width = 180 degrees</li>' +
    '</ul>' +
    '<p>The servo has its own internal motor driver — you do NOT need an H-bridge or MOSFET. Just connect the signal wire to a GPIO pin, VCC to 5V (external, not from MCU), and GND. Small servos (SG90) draw ~200-500 mA, which is borderline for GPIO but the signal wire only carries the control signal, not the motor power.</p>' +
    '<p><b>MicroPython example (ESP32):</b></p>' +
    '<pre>from machine import PWM, Pin\nservo = PWM(Pin(18), freq=50)  # 50 Hz = 20ms period\nservo.duty(77)   # ~1.5ms pulse = 90 degrees (center)\n# duty range: ~26 (0 deg) to ~128 (180 deg) on ESP32</pre>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Stepper Motor</div>' +
    '<p>A motor that rotates in precise discrete steps (e.g. 200 steps per revolution = 1.8 degrees per step). Used in 3D printers, CNC machines, and anything needing precise positioning. Requires a driver board (A4988 or DRV8825) that converts step/direction signals from the MCU into the correct coil energizing sequence.</p>' +
    '<p>More complex to drive than DC motors, but you get precise angular control without feedback sensors.</p>' +
    '</div>' +

    '<h4>Relays & Switches</h4>' +
    '<div class="example">' +
    '<div class="label">Relay Module</div>' +
    '<p>An electromagnetically-controlled switch. A 5V coil inside the relay is energized by your MCU signal (through a transistor on the module), which mechanically flips a switch that can handle high-voltage loads (120V/240V AC at 10A). This is how an ESP32 turns on a lamp, a fan, or a water pump.</p>' +
    '<p>Relay modules typically have a transistor + flyback diode built in, so you connect the signal pin to a GPIO and it just works. You hear a satisfying "click" when it switches.</p>' +
    '<p><b>Limitation:</b> Relays are on/off only — no speed control. Mechanical contacts wear out over time (rated for ~100,000 cycles). Slow switching (5-10 ms).</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Solid-State Relay (SSR)</div>' +
    '<p>Like a relay but with no moving parts — uses a semiconductor (triac or MOSFET) to switch the load. Faster, quieter, no mechanical wear. More expensive. Used when you need silent or high-frequency switching.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">MOSFET for DC Switching</div>' +
    '<p>A MOSFET is a transistor optimized for switching. When you apply a voltage to the gate pin, it allows current to flow between drain and source — like a valve. MOSFETs switch in microseconds (much faster than relays), produce no noise, and can be PWM-controlled for speed/brightness control.</p>' +
    '<p><b>Common pattern: </b>GPIO pin -> MOSFET gate (with a 10k pull-down resistor to GND so the MOSFET stays off when the MCU is not driving it) -> load (motor, LED strip) connected between external power supply positive and MOSFET drain -> MOSFET source to GND (shared with MCU GND).</p>' +
    '<p>Use an N-channel logic-level MOSFET (like IRLZ44N) that fully turns on at 3.3V gate voltage.</p>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">The golden rule of actuators</div>' +
    '<p><b>NEVER connect a motor, relay coil, or high-current load directly to a GPIO pin.</b> GPIO pins on most MCUs can supply 10-40 mA. A small DC motor draws 100-500 mA. A relay coil draws 70-80 mA. Exceeding the GPIO current limit will damage the MCU permanently.</p>' +
    '<p>Always use a transistor, MOSFET, or dedicated driver as a switch between your MCU and the load. The GPIO pin controls the switch; the external power supply provides the current.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Wiring pattern: GPIO to MOSFET to motor</div>' +
    '<pre>ESP32 GPIO 18 ---[wire]---+--- MOSFET Gate\n                          |\n                         10k (pull-down to GND)\n                          |\n                         GND\n\nExternal 12V + ---[wire]--- Motor + \nMotor -       ---[wire]--- MOSFET Drain\nMOSFET Source ---[wire]--- GND (shared with ESP32 GND)\nExternal 12V - ---[wire]--- GND (shared)</pre>' +
    '<p>When GPIO 18 goes HIGH, the MOSFET turns on, current flows through the motor from the external supply. The ESP32 GPIO only drives the gate — which draws essentially zero current.</p>' +
    '</div>',

  mountPlay: function (container) {
    var categories = {
      'LEDs': [
        { name: 'Single LED', current: '10-20 mA', interface: 'GPIO + resistor', directGPIO: true, notes: 'Always use a current-limiting resistor. R = (Vsource - Vf) / I.' },
        { name: 'RGB LED', current: '30-60 mA (all colors)', interface: '3x GPIO + resistors', directGPIO: true, notes: 'Use PWM on each pin for color mixing. Common anode or cathode.' },
        { name: 'WS2812B Strip (60 LEDs)', current: 'Up to 3.6 A', interface: '1 data pin', directGPIO: false, notes: 'Data pin is OK from GPIO, but power needs an external 5V supply (4A+).' }
      ],
      'Motors': [
        { name: 'DC Motor (small)', current: '100-500 mA', interface: 'MOSFET or H-bridge', directGPIO: false, notes: 'MOSFET for one direction, H-bridge (L298N) for bidirectional + speed.' },
        { name: 'Servo (SG90)', current: '200-500 mA', interface: 'PWM signal pin', directGPIO: true, notes: 'Signal wire to GPIO is fine. Power the servo from external 5V, not the MCU.' },
        { name: 'Stepper (NEMA 17)', current: '0.5-2 A', interface: 'A4988/DRV8825 driver', directGPIO: false, notes: 'Driver board takes STEP + DIR signals from GPIO, drives the coils.' }
      ],
      'Relays': [
        { name: 'Relay Module (5V)', current: '70-80 mA coil', interface: 'GPIO (module has transistor)', directGPIO: true, notes: 'Module handles the coil drive. Can switch 120V/240V AC loads. On/off only.' },
        { name: 'Solid-State Relay', current: '10-30 mA control', interface: 'GPIO', directGPIO: true, notes: 'No moving parts, faster, quieter. Higher cost. Some support PWM dimming for AC.' },
        { name: 'MOSFET Switch', current: '~0 mA gate', interface: 'GPIO + pull-down', directGPIO: true, notes: 'Gate draws negligible current. Can PWM for speed/brightness control. DC loads only.' }
      ],
      'Displays': [
        { name: 'SSD1306 OLED (128x64)', current: '20-30 mA', interface: 'I2C (SDA + SCL)', directGPIO: true, notes: 'Low power, high contrast, no backlight needed. Great for status text.' },
        { name: 'ILI9341 TFT (320x240)', current: '30-50 mA', interface: 'SPI (4+ wires)', directGPIO: true, notes: 'Color display. Needs SPI for speed. Good for dashboards and graphics.' },
        { name: '16x2 LCD (HD44780)', current: '20-30 mA', interface: 'I2C adapter or 6+ GPIO', directGPIO: true, notes: 'Classic text display. Use I2C adapter board to reduce from 6 pins to 2.' }
      ]
    };

    container.innerHTML =
      '<p class="muted">Click a category, then an actuator, to see specs and whether GPIO can drive it directly.</p>' +
      '<div class="chip-row" id="est-act-cats"></div>' +
      '<div class="chip-row" id="est-act-items" style="margin-top:8px;"></div>' +
      '<div id="est-act-detail" class="formula-box" style="margin-top:12px;min-height:120px;">' +
      'Select a category and actuator above.</div>';

    var catRow = container.querySelector('#est-act-cats');
    var itemRow = container.querySelector('#est-act-items');
    var detail = container.querySelector('#est-act-detail');

    Object.keys(categories).forEach(function (cat) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = cat;
      chip.addEventListener('click', function () {
        var allCats = catRow.querySelectorAll('.chip');
        for (var j = 0; j < allCats.length; j++) allCats[j].classList.remove('active');
        chip.classList.add('active');

        itemRow.innerHTML = '';
        detail.innerHTML = 'Click an actuator to see its details.';
        var items = categories[cat];
        items.forEach(function (item) {
          var ic = document.createElement('span');
          ic.className = 'chip';
          ic.textContent = item.name;
          ic.addEventListener('click', function () {
            var allItems = itemRow.querySelectorAll('.chip');
            for (var k = 0; k < allItems.length; k++) allItems[k].classList.remove('active');
            ic.classList.add('active');
            var gpioColor = item.directGPIO ? '#4ade80' : '#f87171';
            var gpioText = item.directGPIO ? 'Yes (signal only)' : 'No — needs driver/external power';
            detail.innerHTML =
              '<div><b>' + item.name + '</b></div>' +
              '<div class="info-line"><span class="key">Typical current:</span> <span class="val">' + item.current + '</span></div>' +
              '<div class="info-line"><span class="key">Interface:</span> <span class="val">' + item.interface + '</span></div>' +
              '<div class="info-line"><span class="key">GPIO can drive directly?</span> <span class="val" style="color:' + gpioColor + ';">' + gpioText + '</span></div>' +
              '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + item.notes + '</span></div>';
          });
          itemRow.appendChild(ic);
        });
      });
      catRow.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want to control a <b>12V DC motor\'s speed</b> from an ESP32. What component sits between the GPIO pin and the motor?</p>',
      mountInput: function (container) {
        var opts = ['Direct wire', 'Resistor', 'Relay', 'MOSFET', 'Capacitor'];
        var sel = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });
        container.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'MOSFET') return { correct: true, feedback: 'Correct! A MOSFET lets the ESP32 GPIO (which outputs almost no current) control a high-current 12V motor. Use PWM on the gate to control speed. The MOSFET acts as a fast electronic switch.' };
        if (v === 'Direct wire') return { correct: false, feedback: 'Connecting a 12V motor directly to a GPIO pin will destroy the ESP32. GPIO pins can supply at most 40 mA at 3.3V — a motor draws 100 mA to several amps at 12V. Use a MOSFET as a switch.' };
        if (v === 'Relay') return { correct: false, feedback: 'A relay can switch a motor on/off, but it cannot control SPEED. Relays are mechanical on/off switches. For speed control, you need a MOSFET with PWM.' };
        if (v === 'Resistor') return { correct: false, feedback: 'A resistor would waste power as heat and cannot properly control a motor. You need a MOSFET — it acts as a fast electronic switch controlled by the GPIO pin.' };
        return { correct: false, feedback: 'A capacitor stores charge — it does not switch a motor. You need a MOSFET between the GPIO and the motor. The MOSFET gate is controlled by PWM for speed control.' };
      },
      hints: [
        'The motor needs speed control, not just on/off. That rules out anything that is purely a switch with no PWM capability.',
        'A relay is on/off only. You need something that can switch fast enough for PWM (thousands of times per second).',
        'A MOSFET is a transistor that switches in microseconds — perfect for PWM speed control of DC motors.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>A <b>WS2812B LED strip</b> has <b>60 LEDs</b>. Each LED draws up to <b>60 mA at full white</b>. What is the maximum current draw of the strip, and can a USB 2.0 port (500 mA) power it?</p>',
      mountInput: function (container) {
        var row1 = document.createElement('div');
        row1.style.marginBottom = '8px';
        var label1 = document.createElement('span');
        label1.textContent = 'Max current: ';
        var inp1 = document.createElement('input');
        inp1.type = 'text';
        inp1.placeholder = 'e.g. 3600';
        inp1.style.width = '100px';
        var unit1 = document.createElement('span');
        unit1.textContent = ' mA';
        row1.appendChild(label1);
        row1.appendChild(inp1);
        row1.appendChild(unit1);

        var row2 = document.createElement('div');
        var label2 = document.createElement('span');
        label2.textContent = 'Can USB 2.0 power it? ';
        var sel = document.createElement('select');
        var optY = document.createElement('option');
        optY.value = 'yes'; optY.textContent = 'Yes';
        var optN = document.createElement('option');
        optN.value = 'no'; optN.textContent = 'No';
        sel.appendChild(optY);
        sel.appendChild(optN);
        row2.appendChild(label2);
        row2.appendChild(sel);

        container.appendChild(row1);
        container.appendChild(row2);
        return function () { return { current: inp1.value.trim(), usb: sel.value }; };
      },
      check: function (v) {
        var num = parseFloat(v.current);
        var currentOk = !isNaN(num) && num >= 3500 && num <= 3700;
        var usbOk = v.usb === 'no';

        if (currentOk && usbOk) return { correct: true, feedback: 'Correct! 60 LEDs x 60 mA = 3600 mA = 3.6 A. USB 2.0 only provides 500 mA, so you need a separate 5V power supply rated for at least 4A.' };
        if (!currentOk && usbOk) return { correct: false, feedback: 'You are right that USB cannot power it, but the current calculation is off. Each LED draws up to 60 mA, and there are 60 LEDs: 60 x 60 = 3600 mA (3.6 A).' };
        if (currentOk && !usbOk) return { correct: false, feedback: 'The current is right (3600 mA), but USB 2.0 can NOT power it. USB 2.0 provides only 500 mA — the strip needs 3600 mA. That is 7x more than USB can supply. You need a separate 5V power supply.' };
        return { correct: false, feedback: 'Both parts need fixing. Current: 60 LEDs x 60 mA = 3600 mA (3.6 A). USB 2.0 provides only 500 mA — far too little. You need a separate 5V supply rated for at least 4A.' };
      },
      hints: [
        'Max current = number of LEDs times current per LED. Each draws 60 mA at full white.',
        '60 x 60 mA = 3600 mA = 3.6 A. Compare that to the 500 mA a USB 2.0 port provides.',
        'The strip needs 3600 mA. USB 2.0 gives 500 mA. The answer is 3600 mA, and no, USB cannot power it.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are building a <b>garden irrigation system</b>. For each component, name the correct interface:</p>' +
              '<ol type="a">' +
              '<li>Turn a <b>12V solenoid valve</b> on/off</li>' +
              '<li>Control a <b>small 5V pump\'s speed</b></li>' +
              '<li>Move a <b>servo</b> to aim a sprinkler head</li>' +
              '</ol>',
      mountInput: function (container) {
        var items = [
          { label: '(a) 12V solenoid valve:', opts: ['Direct GPIO', 'Relay or MOSFET', 'MOSFET with PWM', 'PWM signal (50 Hz)', 'H-bridge'] },
          { label: '(b) 5V pump speed:', opts: ['Direct GPIO', 'Relay or MOSFET', 'MOSFET with PWM', 'PWM signal (50 Hz)', 'H-bridge'] },
          { label: '(c) Servo aiming:', opts: ['Direct GPIO', 'Relay or MOSFET', 'MOSFET with PWM', 'PWM signal (50 Hz)', 'H-bridge'] }
        ];
        var selects = [];
        items.forEach(function (item) {
          var row = document.createElement('div');
          row.style.marginBottom = '6px';
          var label = document.createElement('span');
          label.textContent = item.label + ' ';
          label.style.display = 'inline-block';
          label.style.width = '220px';
          var sel = document.createElement('select');
          item.opts.forEach(function (o) {
            var opt = document.createElement('option');
            opt.value = o; opt.textContent = o;
            sel.appendChild(opt);
          });
          selects.push(sel);
          row.appendChild(label);
          row.appendChild(sel);
          container.appendChild(row);
        });
        return function () {
          return { a: selects[0].value, b: selects[1].value, c: selects[2].value };
        };
      },
      check: function (v) {
        var wrong = [];
        // (a) Solenoid = on/off, so relay or MOSFET
        if (v.a !== 'Relay or MOSFET') {
          wrong.push('(a) Solenoid valve: needs a Relay or MOSFET for on/off switching of 12V. Not direct GPIO (12V would fry MCU), not PWM (just on/off).');
        }
        // (b) Pump speed = MOSFET with PWM
        if (v.b !== 'MOSFET with PWM') {
          wrong.push('(b) Pump speed: needs a MOSFET with PWM. A relay is on/off only (no speed control). Direct GPIO cannot handle motor current.');
        }
        // (c) Servo = PWM signal at 50 Hz
        if (v.c !== 'PWM signal (50 Hz)') {
          wrong.push('(c) Servo: just needs a PWM signal at 50 Hz directly from GPIO. The servo has its own internal motor driver — no MOSFET or relay needed.');
        }
        if (wrong.length === 0) return { correct: true, feedback: 'All correct! (a) Relay or MOSFET for on/off 12V switching. (b) MOSFET with PWM for variable-speed pump control. (c) Direct PWM at 50 Hz for the servo (it has a built-in driver). Nice work understanding which loads need what interface.' };
        return { correct: false, feedback: 'Not quite. ' + wrong.join(' ') };
      },
      hints: [
        'Think about what each load needs: on/off only, variable speed, or positional control. Each has a different interface.',
        'The solenoid is just on/off (relay or MOSFET). The pump needs speed control (PWM through a MOSFET). The servo is special — it has its own driver.',
        '(a) Relay or MOSFET (on/off 12V). (b) MOSFET with PWM (speed control). (c) PWM signal at 50 Hz (servo has built-in controller, just send the pulse).'
      ]
    }
  ]
});
