// Level 11 — Power & Batteries
EST.registerLevel({
  id: 11,
  title: 'Power & Batteries',
  whyItMatters: 'Power is the #1 thing beginners get wrong. Getting it right means the difference between a project that works on your desk and one that works in the real world — for days, weeks, or months on a battery.',
  glossary: ['regulator', 'LDO', 'deep sleep', 'LiPo'],
  learn:
    '<h4>Voltage sources: where does power come from?</h4>' +
    '<p>Every embedded project needs a power source. Here are the ones you will use most:</p>' +

    '<div class="example">' +
    '<div class="label">Common voltage sources</div>' +
    '<ul>' +
    '<li><b>USB:</b> 5V. USB 2.0 supplies up to 500 mA. USB 3.0 supplies up to 900 mA. USB-C with Power Delivery can do 5V/3A or higher voltages (9V, 12V, 20V). Most dev boards (ESP32, Pico, Arduino) take USB for power during development.</li>' +
    '<li><b>LiPo battery:</b> 3.7V nominal (4.2V when fully charged, 3.0V when dead — never discharge below 3.0V or you damage the cell permanently). Common sizes: 500 mAh, 1000 mAh, 2000 mAh, 3000 mAh. Flat, rectangular, lightweight. Needs a <b>TP4056 charge controller</b> for safe charging.</li>' +
    '<li><b>18650 cell:</b> 3.7V, typically 2500-3500 mAh. Same chemistry as LiPo but in a cylindrical form factor (like a chunky AA battery). Used in power banks, flashlights, and Tesla battery packs. Reusable and robust.</li>' +
    '<li><b>AA batteries:</b> 1.5V each (1.2V for rechargeables like NiMH). Four in series gives 6V &rarr; needs a regulator down to 3.3V or 5V. Cheap and widely available.</li>' +
    '<li><b>Wall adapter:</b> 5V, 9V, or 12V DC via a barrel jack or USB connector. For projects that stay plugged in (home automation hubs, displays, motor controllers).</li>' +
    '</ul></div>' +

    '<h4>Voltage regulators: getting the right voltage</h4>' +
    '<p>Your ESP32 needs 3.3V. USB gives 5V. A LiPo gives 3.7V. Something has to convert one voltage to another. That something is a <b>voltage regulator</b>.</p>' +

    '<div class="example">' +
    '<div class="label">LDO (Low Dropout Regulator) — linear</div>' +
    '<p>An LDO is the simplest regulator. It takes a higher voltage in and outputs a lower, stable voltage. The "dropout" is the minimum difference between input and output — typically 0.3-0.7V. So a 3.3V LDO needs at least ~3.6-4.0V input.</p>' +
    '<p><b>Pros:</b> simple, cheap, very low noise (good for sensitive analog circuits), tiny (SOT-223 or SOT-23 packages).</p>' +
    '<p><b>Cons:</b> wastes excess voltage as heat. Efficiency = V<sub>out</sub> / V<sub>in</sub>. A 3.3V LDO running on 5V is only 3.3/5 = <b>66% efficient</b> — 34% of the input power is wasted as heat. On a 12V input, it drops to 3.3/12 = 27.5% efficiency. Terrible.</p>' +
    '<p><b>Use when:</b> the voltage difference is small (LiPo 3.7V &rarr; 3.3V = 89% efficient) and current is low (under ~500 mA).</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Buck converter — switching regulator (step-down)</div>' +
    '<p>A buck converter rapidly switches the input voltage on and off and uses an inductor + capacitor to smooth it into a lower, stable output. Much more complex internally, but dramatically more efficient.</p>' +
    '<p><b>Pros:</b> 85-95% efficient regardless of voltage difference. 12V &rarr; 3.3V at 90% efficiency means almost no heat.</p>' +
    '<p><b>Cons:</b> electrically noisy (the switching creates ripple). Costs more. Needs external components (inductor, capacitor, diode).</p>' +
    '<p><b>Use when:</b> battery life matters, the voltage drop is large (12V &rarr; 3.3V), or current is high (over ~500 mA).</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Boost converter — step-up</div>' +
    '<p>Steps voltage UP. A 3.7V LiPo &rarr; 5V for USB peripherals or 5V relay modules. Same switching principle as a buck, just reversed.</p>' +
    '<p><b>Use when:</b> your battery voltage is lower than what a component needs.</p>' +
    '</div>' +

    '<h4>Power budgeting: how long will the battery last?</h4>' +
    '<p>The most important calculation in battery-powered embedded design. Add up the current draw of every component:</p>' +

    '<div class="example">' +
    '<div class="label">Example: always-on sensor station</div>' +
    '<ul>' +
    '<li>ESP32 active with WiFi: ~200 mA</li>' +
    '<li>BME280 sensor: ~0.5 mA</li>' +
    '<li>OLED display (SSD1306): ~20 mA</li>' +
    '<li>LED indicator: ~15 mA</li>' +
    '</ul>' +
    '<p><b>Total: ~235.5 mA</b></p>' +
    '<p>Battery life = capacity / average current = 2000 mAh / 235.5 mA = <b>8.5 hours</b>. That is terrible for a battery project. You would need to recharge every single day.</p>' +
    '</div>' +

    '<h4>Deep sleep: the game changer</h4>' +
    '<p>The ESP32 in deep sleep draws only ~10 &micro;A (0.01 mA). If your sensor only needs to read every 15 minutes, the ESP32 is awake for about 5 seconds (read sensor, connect WiFi, send data) and asleep for 895 seconds.</p>' +

    '<div class="example">' +
    '<div class="label">Weighted average current calculation</div>' +
    '<p>Total cycle: 900 seconds (15 minutes)</p>' +
    '<p>Active time: 5 seconds at 200 mA</p>' +
    '<p>Sleep time: 895 seconds at 0.01 mA</p>' +
    '<p>Average current = (5/900 &times; 200) + (895/900 &times; 0.01)</p>' +
    '<p>= 1.11 + 0.01 = <b>1.12 mA</b></p>' +
    '<p>Battery life = 2000 mAh / 1.12 mA = 1786 hours = <b>74 days!</b></p>' +
    '<p>That is the difference deep sleep makes: from 8.5 hours to 74 days on the same battery.</p>' +
    '</div>' +

    '<div class="callout"><div class="label">MicroPython deep sleep</div>' +
    '<pre><code>import machine\nimport time\n\n# Do your work (read sensor, send data)\nprint("Awake! Sending data...")\n\n# Sleep for 15 minutes (in milliseconds)\nmachine.deepsleep(15 * 60 * 1000)</code></pre>' +
    'When the ESP32 wakes from deep sleep, it <b>reboots completely</b> — your code starts from the top of <code class="inline">main.py</code>. Any variables in RAM are lost. If you need to persist data across sleep cycles, write to flash (a file) or use RTC memory.</div>' +

    '<h4>Common power mistakes (and how to avoid them)</h4>' +
    '<div class="example">' +
    '<div class="label">Mistake #1: wrong voltage</div>' +
    '<p>Powering a 3.3V device (ESP32, BME280) from 5V. The GPIO pins are not 5V-tolerant on most 3.3V MCUs. Result: <b>magic smoke</b> — the chip is permanently damaged. Always check the datasheet.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Mistake #2: shared power rail with motors</div>' +
    '<p>Running a motor and your MCU from the same power source without isolation. Motors create huge current spikes when they start, which drops the voltage momentarily. Your MCU sees the voltage dip and <b>resets or crashes</b>. Solution: separate power rails or a large decoupling capacitor (100-1000 &micro;F) near the MCU.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Mistake #3: no decoupling capacitors</div>' +
    '<p>Every IC should have a 100 nF (0.1 &micro;F) ceramic capacitor between its V<sub>cc</sub> and GND pins, placed as close to the chip as possible. Without it, high-frequency switching noise causes <b>random crashes, garbage sensor readings, and intermittent bugs</b> that are incredibly hard to diagnose.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Mistake #4: LDO when a buck would save battery</div>' +
    '<p>Using an LDO to drop 12V to 3.3V wastes 72.5% of your battery as heat. A buck converter at 90% efficiency would give you 3.3x the battery life. For battery projects, always consider a buck converter when the voltage drop is more than ~1V.</p>' +
    '</div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;

    container.innerHTML =
      '<p class="muted">Build a power budget. Select components and sleep mode to see battery life estimates.</p>' +

      '<div style="display:flex;gap:24px;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:250px;">' +
          '<h4 style="margin-top:0;">Components</h4>' +
          '<div style="margin-bottom:8px;">' +
            '<label>ESP32 mode:</label><br>' +
            '<select id="est-pwr-esp">' +
              '<option value="200">Active + WiFi (200 mA)</option>' +
              '<option value="20">Modem sleep (20 mA)</option>' +
              '<option value="0.01">Deep sleep (0.01 mA)</option>' +
              '<option value="0">Off (0 mA)</option>' +
            '</select>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<label><input type="checkbox" id="est-pwr-bme" checked> BME280 sensor (0.5 mA)</label>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<label><input type="checkbox" id="est-pwr-oled"> OLED display (20 mA)</label>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<label><input type="checkbox" id="est-pwr-led"> LED (15 mA)</label>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<label><input type="checkbox" id="est-pwr-motor"> Servo motor (150 mA)</label>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<label><input type="checkbox" id="est-pwr-relay"> Relay module (70 mA)</label>' +
          '</div>' +
          '<h4>Battery</h4>' +
          '<select id="est-pwr-batt">' +
            '<option value="500">500 mAh (small LiPo)</option>' +
            '<option value="1000">1000 mAh (medium LiPo)</option>' +
            '<option value="2000" selected>2000 mAh (large LiPo)</option>' +
            '<option value="3000">3000 mAh (18650 cell)</option>' +
            '<option value="6000">6000 mAh (2x 18650)</option>' +
          '</select>' +
        '</div>' +

        '<div style="flex:1;min-width:250px;">' +
          '<div id="est-pwr-result" class="formula-box" style="min-height:200px;">Click Calculate to see your power budget.</div>' +
          '<button id="est-pwr-calc" class="primary-btn" style="margin-top:8px;">Calculate</button>' +
        '</div>' +
      '</div>';

    var btn = container.querySelector('#est-pwr-calc');
    var result = container.querySelector('#est-pwr-result');

    btn.addEventListener('click', function () {
      var espMa = parseFloat(container.querySelector('#est-pwr-esp').value);
      var total = espMa;
      var parts = ['ESP32: ' + espMa + ' mA'];

      var checks = [
        { id: '#est-pwr-bme', name: 'BME280', ma: 0.5 },
        { id: '#est-pwr-oled', name: 'OLED', ma: 20 },
        { id: '#est-pwr-led', name: 'LED', ma: 15 },
        { id: '#est-pwr-motor', name: 'Servo', ma: 150 },
        { id: '#est-pwr-relay', name: 'Relay', ma: 70 }
      ];

      checks.forEach(function (c) {
        if (container.querySelector(c.id).checked) {
          total += c.ma;
          parts.push(c.name + ': ' + c.ma + ' mA');
        }
      });

      var battMah = parseFloat(container.querySelector('#est-pwr-batt').value);
      var hours = total > 0 ? lib.batteryLife(battMah, total) : Infinity;

      var regRec = '';
      if (total < 100) {
        regRec = 'LDO is fine (low current, simple)';
      } else if (total < 500) {
        regRec = 'LDO OK for 3.7V&rarr;3.3V; use buck for 5V+ input';
      } else {
        regRec = 'Use a buck converter (high current, efficiency matters)';
      }

      var html =
        '<div style="margin-bottom:12px;"><b>Component breakdown:</b></div>';
      parts.forEach(function (p) {
        html += '<div class="info-line" style="font-size:13px;">' + p + '</div>';
      });
      html +=
        '<hr style="border-color:#3a4256;margin:12px 0;">' +
        '<div class="info-line"><span class="key">Total current:</span> <span class="val">' + (total < 1 ? (total * 1000).toFixed(0) + ' \u00B5A' : total.toFixed(1) + ' mA') + '</span></div>' +
        '<div class="info-line"><span class="key">Battery:</span> <span class="val">' + battMah + ' mAh</span></div>' +
        '<div class="info-line"><span class="key">Battery life:</span> <span class="val" style="color:' + (hours > 168 ? '#4ade80' : hours > 24 ? '#fbbf24' : '#f87171') + ';">' + (hours === Infinity ? '\u221E' : lib.fmtTime(hours)) + '</span></div>' +
        '<div class="info-line"><span class="key">Regulator:</span> <span class="val">' + regRec + '</span></div>';

      if (espMa >= 200) {
        html += '<div style="margin-top:12px;color:#fbbf24;font-size:13px;">\u26A0 Tip: switch ESP32 to deep sleep mode to see how dramatically battery life improves!</div>';
      }

      result.innerHTML = html;
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>A circuit draws <b>150 mA constant</b> from a <b>1000 mAh LiPo</b>. How long until the battery dies? (Answer in hours.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 5.0';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' hours';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // 1000 / 150 = 6.667 hours
        var exact = EST.lib.embed.batteryLife(1000, 150);
        if (num >= 6.5 && num <= 6.8) return { correct: true, feedback: 'Correct! Battery life = capacity / current = 1000 mAh / 150 mA = ' + exact.toFixed(2) + ' hours. Simple division is all you need for constant-current scenarios.' };
        if (num >= 6.0 && num < 6.5) return { correct: false, feedback: 'Close but a bit low. 1000 / 150 = ' + exact.toFixed(2) + ' hours. Make sure you are dividing capacity by current.' };
        if (num > 6.8 && num <= 7.0) return { correct: false, feedback: 'Close but a bit high. 1000 / 150 = ' + exact.toFixed(2) + ' hours.' };
        return { correct: false, feedback: 'Not quite. Battery life = capacity / current = 1000 mAh / 150 mA = ' + exact.toFixed(2) + ' hours.' };
      },
      hints: [
        'The formula is: battery life (hours) = capacity (mAh) / current draw (mA).',
        '1000 mAh / 150 mA = ?',
        '1000 / 150 = 6.67 hours.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Your ESP32 project uses <b>deep sleep</b>. It wakes every <b>10 minutes</b>, runs for <b>3 seconds at 180 mA</b> (WiFi send), then sleeps at <b>10 &micro;A</b> for 597 seconds. With a <b>3000 mAh battery</b>, how many days will it last?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 100';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' days';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // Active: 3/600 * 180 = 0.9 mA. Sleep: 597/600 * 0.01 = 0.00995 mA. Total: 0.90995 mA
        // Battery: 3000 / 0.91 = 3296.7 hours = 137.4 days
        var cycleSec = 600;
        var activeFrac = 3 / cycleSec;
        var sleepFrac = 597 / cycleSec;
        var avgMa = activeFrac * 180 + sleepFrac * 0.01;
        var hours = EST.lib.embed.batteryLife(3000, avgMa);
        var days = hours / 24;

        if (num >= 130 && num <= 145) return { correct: true, feedback: 'Correct! Average current = (3/600 &times; 180) + (597/600 &times; 0.01) = 0.9 + 0.01 = ' + avgMa.toFixed(2) + ' mA. Battery life = 3000 / ' + avgMa.toFixed(2) + ' = ' + hours.toFixed(0) + ' hours = ' + days.toFixed(0) + ' days. Deep sleep makes this possible!' };
        if (num >= 120 && num < 130) return { correct: false, feedback: 'Close but a bit low. Average current = (3/600 &times; 180) + (597/600 &times; 0.01) = ~0.91 mA. 3000 / 0.91 = ' + hours.toFixed(0) + ' hours = ~' + days.toFixed(0) + ' days.' };
        if (num > 145 && num <= 160) return { correct: false, feedback: 'Close but a bit high. Check your weighted average: active fraction is 3/600 (not 3/597). Average is ~0.91 mA, giving ~' + days.toFixed(0) + ' days.' };
        return { correct: false, feedback: 'Use the weighted average formula: avg current = (active_time/total_time &times; active_mA) + (sleep_time/total_time &times; sleep_mA) = (3/600 &times; 180) + (597/600 &times; 0.01) = ' + avgMa.toFixed(2) + ' mA. Battery life = 3000 / ' + avgMa.toFixed(2) + ' = ' + days.toFixed(0) + ' days.' };
      },
      hints: [
        'First calculate the average current using a weighted average: (fraction of time active &times; active current) + (fraction of time asleep &times; sleep current).',
        'Cycle = 600 seconds. Active = 3s at 180 mA. Sleep = 597s at 0.01 mA. Average = (3/600 &times; 180) + (597/600 &times; 0.01) = 0.9 + 0.01 = 0.91 mA.',
        '3000 mAh / 0.91 mA = 3297 hours. Divide by 24 = 137 days.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You have a <b>5V USB source</b> and need to power: (1) an <b>ESP32</b> (3.3V, 200 mA peak), (2) a <b>5V relay module</b> (70 mA), and (3) a <b>12V solenoid</b> (500 mA, on for 2 seconds per activation, max 10 activations per hour). Design the power setup: what regulators do you need, and can a single USB 2.0 port handle all of it?</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 8;
        ta.cols = 55;
        ta.placeholder = 'Describe: what regulator(s), what power source for each component, and can USB 2.0 handle it all?';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var answer = v.toLowerCase();
        if (answer.length < 30) return { correct: false, feedback: 'Please provide a more detailed answer covering all three components and their power needs.' };

        var hasEspReg = answer.indexOf('ldo') !== -1 || answer.indexOf('buck') !== -1 || answer.indexOf('regulator') !== -1 || answer.indexOf('3.3') !== -1;
        var hasRelayDirect = answer.indexOf('relay') !== -1 || answer.indexOf('5v') !== -1 || answer.indexOf('5 v') !== -1 || answer.indexOf('direct') !== -1;
        var hasSolenoidSeparate = answer.indexOf('12') !== -1 || answer.indexOf('separate') !== -1 || answer.indexOf('external') !== -1 || answer.indexOf('adapter') !== -1 || answer.indexOf('supply') !== -1;
        var mentionsUSBLimit = answer.indexOf('500') !== -1 || answer.indexOf('usb') !== -1 || answer.indexOf('not enough') !== -1 || answer.indexOf('can\'t') !== -1 || answer.indexOf('cannot') !== -1;

        var score = 0;
        var issues = [];
        if (hasEspReg) { score++; } else { issues.push('ESP32 needs 3.3V from the 5V USB via an LDO or buck converter'); }
        if (hasRelayDirect) { score++; } else { issues.push('The 5V relay can run directly from the USB 5V rail'); }
        if (hasSolenoidSeparate) { score++; } else { issues.push('The 12V solenoid needs a separate 12V power supply (USB cannot provide 12V)'); }

        if (score >= 3) return { correct: true, feedback: 'Excellent! You identified all three power needs: (1) LDO or buck converter from 5V to 3.3V for the ESP32, (2) relay runs directly on the 5V USB rail, (3) solenoid needs a separate 12V adapter. USB 2.0 at 500 mA can handle the ESP32 (200 mA) + relay (70 mA) = 270 mA with headroom, but the 12V solenoid is a completely separate power domain.' };
        if (score >= 2) return { correct: false, feedback: 'Good start, but missing a key point. ' + issues.join('. ') + '. The full solution: (1) LDO/buck 5V&rarr;3.3V for ESP32, (2) relay on 5V USB directly, (3) separate 12V supply for solenoid. USB 2.0 handles 270 mA (ESP32 + relay) fine.' };
        return { correct: false, feedback: 'Let\'s break it down: (1) ESP32 needs 3.3V &mdash; use an LDO or buck converter from the 5V USB. (2) The 5V relay module runs directly from the USB 5V rail. (3) The 12V solenoid <b>cannot</b> run from USB at all &mdash; USB only provides 5V. It needs a separate 12V power adapter. USB 2.0 at 500 mA can handle ESP32 (200 mA) + relay (70 mA) = 270 mA, but the solenoid is a different voltage domain entirely.' };
      },
      hints: [
        'Think about each component\'s voltage needs: ESP32 wants 3.3V, relay wants 5V, solenoid wants 12V. USB provides 5V.',
        'USB can step DOWN (via a regulator) to 3.3V for the ESP32. The relay can use 5V directly. But USB cannot step UP to 12V — the solenoid needs its own power source.',
        'Answer: (1) LDO or buck from 5V to 3.3V for ESP32, (2) relay on 5V USB directly, (3) separate 12V power adapter for solenoid. USB 2.0 handles 200+70 = 270 mA fine.'
      ]
    }
  ]
});
