// Level 4 — Analog Signals, ADC & PWM
EST.registerLevel({
  id: 4,
  title: 'Analog Signals, ADC & PWM',
  whyItMatters: 'The real world is analog — temperature, light, and sound are continuous values, not just HIGH or LOW. ADC and PWM let your MCU sense and control the analog world.',
  glossary: ['analog', 'ADC', 'PWM', 'DAC'],
  learn:
    '<h4>The analog world</h4>' +
    '<p>Digital signals are binary: HIGH or LOW, 1 or 0. But the real world is <b>analog</b> — temperature is 23.7\u00B0C, not just "hot" or "cold." Light is 347 lux, not just "bright" or "dark." A potentiometer (volume knob) smoothly varies from 0V to 3.3V as you turn it.</p>' +
    '<p>To work with the analog world, your MCU needs two tools: <b>ADC</b> (to read analog values in) and <b>PWM</b> (to fake analog values out).</p>' +

    '<h4>ADC: reading analog voltages</h4>' +
    '<p>An <b>Analog-to-Digital Converter</b> reads a continuous voltage (0V to some reference voltage, V<sub>ref</sub>) and converts it into a digital number your code can use.</p>' +
    '<div class="example">' +
    '<div class="label">ADC resolution</div>' +
    '<p>The key spec is <b>resolution</b> — how many bits the ADC uses to represent the voltage range.</p>' +
    '<ul>' +
    '<li><b>8-bit ADC:</b> 2<sup>8</sup> = 256 steps. Output: 0 to 255.</li>' +
    '<li><b>10-bit ADC:</b> 2<sup>10</sup> = 1024 steps. Output: 0 to 1023. (Arduino Uno uses this.)</li>' +
    '<li><b>12-bit ADC:</b> 2<sup>12</sup> = 4096 steps. Output: 0 to 4095. (ESP32 uses this.)</li>' +
    '</ul>' +
    '<p>The <b>step size</b> (smallest detectable voltage change) = V<sub>ref</sub> / 2<sup>bits</sup>.</p>' +
    '<p>On ESP32: step = 3.3V / 4096 = <b>0.000806V</b> (&approx; 0.8 mV). So a reading of 2048 means approximately 2048 &times; 0.000806 = <b>1.65V</b> (half of 3.3V).</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Converting ADC reading to voltage</div>' +
    '<p><b>V<sub>in</sub> = (ADC_reading / ADC_max) &times; V<sub>ref</sub></b></p>' +
    '<p>On ESP32 (12-bit, V<sub>ref</sub> = 3.3V): V<sub>in</sub> = (reading / 4095) &times; 3.3</p>' +
    '<p>On Arduino Uno (10-bit, V<sub>ref</sub> = 5V): V<sub>in</sub> = (reading / 1023) &times; 5.0</p>' +
    '</div>' +

    '<div class="callout"><div class="label">ESP32 ADC gotchas</div>' +
    '<p>The ESP32\'s ADC is famously <b>noisy and nonlinear</b>, especially near 0V and 3.3V. Readings can jitter by 50-100 counts. Solutions:</p>' +
    '<ul>' +
    '<li>Average multiple readings (take 10-50 samples and average them).</li>' +
    '<li>Use the ESP32\'s built-in calibration (available in ESP-IDF).</li>' +
    '<li>For precision, use an external ADC like the ADS1115 (16-bit, I2C, much more accurate).</li>' +
    '</ul></div>' +

    '<div class="example">' +
    '<div class="label">MicroPython: reading a potentiometer</div>' +
    '<pre>from machine import ADC, Pin\n\npot = ADC(Pin(34))                  # GPIO 34 (input-only pin)\npot.atten(ADC.ATTN_11DB)            # full 0-3.3V range\nraw = pot.read()                    # 0-4095\nvoltage = raw / 4095 * 3.3          # convert to volts\nprint("Voltage:", voltage, "V")</pre>' +
    '</div>' +

    '<h4>PWM: faking analog output</h4>' +
    '<p>Most MCUs cannot output a true analog voltage (they don\'t have a DAC, or only have 1-2 DAC channels). Instead, they use <b>Pulse Width Modulation (PWM)</b> — switching a digital pin on and off very rapidly. If the pin is HIGH 50% of the time and LOW 50% of the time, the <b>average voltage</b> is half of Vcc.</p>' +

    '<div class="example">' +
    '<div class="label">PWM key terms</div>' +
    '<ul>' +
    '<li><b>Frequency:</b> how many on/off cycles per second (Hz). LED dimming: 1 kHz+. Motor control: 10-25 kHz. Higher frequency = smoother output but more switching losses.</li>' +
    '<li><b>Duty cycle:</b> the percentage of time the pin is HIGH. 0% = always off. 50% = half and half. 100% = always on.</li>' +
    '<li><b>Effective voltage:</b> V<sub>eff</sub> = V<sub>max</sub> &times; duty_cycle / 100. A 3.3V pin at 75% duty = <b>2.475V</b> average.</li>' +
    '</ul></div>' +

    '<div class="example">' +
    '<div class="label">Visualizing PWM duty cycle</div>' +
    '<pre>25% duty (dim LED):    \u2593\u2593\u2591\u2591\u2591\u2591\u2591\u2591  \u2593\u2593\u2591\u2591\u2591\u2591\u2591\u2591  \u2593\u2593\u2591\u2591\u2591\u2591\u2591\u2591\n50% duty (medium):     \u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591  \u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591  \u2593\u2593\u2593\u2593\u2591\u2591\u2591\u2591\n75% duty (bright LED): \u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591  \u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591  \u2593\u2593\u2593\u2593\u2593\u2593\u2591\u2591\n100% duty (full on):   \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593  \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593  \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593</pre>' +
    '<p>\u2593 = pin HIGH, \u2591 = pin LOW. The wider the HIGH portion, the higher the average voltage.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">MicroPython: dim an LED with PWM</div>' +
    '<pre>from machine import PWM, Pin\n\nled = PWM(Pin(2), freq=1000)     # 1 kHz frequency\nled.duty(512)                    # ~50% of 1023 (10-bit resolution)\n# duty(0) = off, duty(1023) = fully on\n# 512/1023 * 3.3V = ~1.65V average</pre>' +
    '</div>' +

    '<h4>DAC: true analog output</h4>' +
    '<p>Some MCUs have a real <b>Digital-to-Analog Converter (DAC)</b> that outputs a true continuous voltage (not a pulsed square wave). The ESP32 has <b>2 DAC channels</b> on GPIO 25 and GPIO 26, with 8-bit resolution (256 steps, so 0-3.3V in steps of ~13 mV).</p>' +
    '<p>DACs are great for generating audio waveforms or precise reference voltages. But for most use cases (LED dimming, motor speed), PWM is preferred because any GPIO pin can do it, and external components (like the motor\'s inductance or an RC filter) smooth out the pulses anyway.</p>' +

    '<div class="example">' +
    '<div class="label">When to use what</div>' +
    '<ul>' +
    '<li><b>ADC:</b> Reading sensors (temperature, light, potentiometer, soil moisture).</li>' +
    '<li><b>PWM:</b> Controlling brightness (LEDs), speed (motors), position (servos).</li>' +
    '<li><b>DAC:</b> Audio output, precision voltage references. Rare in simple projects.</li>' +
    '</ul></div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;

    container.innerHTML =
      '<div style="display:flex;gap:24px;flex-wrap:wrap;">' +

      '<div class="formula-box" style="flex:1;min-width:280px;">' +
      '<h4 style="margin-top:0;">PWM Duty Cycle Visualizer</h4>' +
      '<div style="margin-bottom:8px;">' +
      '<label>Duty cycle: <span id="est-pwm-pct">50</span>%</label><br>' +
      '<input type="range" id="est-pwm-slider" min="0" max="100" value="50" style="width:100%;">' +
      '</div>' +
      '<div style="margin-bottom:8px;">' +
      '<label>Pin voltage: <span id="est-pwm-vmax-lbl">3.3</span>V</label><br>' +
      '<select id="est-pwm-vmax"><option value="3.3">3.3V (ESP32)</option><option value="5">5V (Arduino)</option></select>' +
      '</div>' +
      '<div id="est-pwm-wave" style="font-family:monospace;font-size:14px;margin-bottom:8px;letter-spacing:1px;"></div>' +
      '<div id="est-pwm-led" style="display:inline-block;width:40px;height:40px;border-radius:50%;border:2px solid #555;margin-right:12px;vertical-align:middle;"></div>' +
      '<span id="est-pwm-veff" style="font-weight:bold;"></span>' +
      '</div>' +

      '<div class="formula-box" style="flex:1;min-width:280px;">' +
      '<h4 style="margin-top:0;">ADC Value Calculator</h4>' +
      '<div style="margin-bottom:8px;">' +
      '<label>Input voltage: <span id="est-adc-vlbl">1.65</span>V</label><br>' +
      '<input type="range" id="est-adc-vslider" min="0" max="330" value="165" style="width:100%;">' +
      '</div>' +
      '<div style="margin-bottom:8px;">' +
      '<label>ADC resolution:</label><br>' +
      '<select id="est-adc-bits"><option value="8">8-bit (0-255)</option><option value="10">10-bit (0-1023)</option><option value="12" selected>12-bit (0-4095)</option></select>' +
      '</div>' +
      '<div id="est-adc-result"></div>' +
      '</div>' +

      '</div>';

    // PWM visualization
    var slider = container.querySelector('#est-pwm-slider');
    var pctLabel = container.querySelector('#est-pwm-pct');
    var vmaxSel = container.querySelector('#est-pwm-vmax');
    var vmaxLbl = container.querySelector('#est-pwm-vmax-lbl');
    var waveEl = container.querySelector('#est-pwm-wave');
    var ledEl = container.querySelector('#est-pwm-led');
    var veffEl = container.querySelector('#est-pwm-veff');

    function updatePwm() {
      var duty = parseInt(slider.value);
      var vmax = parseFloat(vmaxSel.value);
      pctLabel.textContent = duty;
      vmaxLbl.textContent = vmax;

      var veff = lib.pwmVoltage(vmax, duty);
      veffEl.textContent = 'Effective voltage: ' + veff.toFixed(2) + 'V';

      // Draw wave
      var totalChars = 32;
      var onChars = Math.round(totalChars * duty / 100 / 4);
      var offChars = Math.round(totalChars / 4) - onChars;
      if (offChars < 0) offChars = 0;
      var period = '';
      for (var i = 0; i < onChars; i++) period += '\u2593';
      for (var j = 0; j < offChars; j++) period += '\u2591';
      var wave = '';
      for (var k = 0; k < 4; k++) wave += period + ' ';
      waveEl.textContent = wave;

      // LED brightness
      var brightness = duty / 100;
      var r = Math.round(74 + brightness * (74));
      var g = Math.round(173 + brightness * (80));
      var b = Math.round(80 + brightness * (48));
      var alpha = brightness;
      ledEl.style.background = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      if (duty === 0) ledEl.style.background = '#1a1a1a';
    }

    slider.addEventListener('input', updatePwm);
    vmaxSel.addEventListener('change', updatePwm);
    updatePwm();

    // ADC visualization
    var vSlider = container.querySelector('#est-adc-vslider');
    var vLbl = container.querySelector('#est-adc-vlbl');
    var bitsSel = container.querySelector('#est-adc-bits');
    var adcResult = container.querySelector('#est-adc-result');

    function updateAdc() {
      var vin = parseInt(vSlider.value) / 100;
      var bits = parseInt(bitsSel.value);
      var vref = 3.3;
      vLbl.textContent = vin.toFixed(2);

      var maxVal = Math.pow(2, bits) - 1;
      var step = lib.adcStep(vref, bits);
      var reading = lib.adcValue(vin, vref, bits);

      adcResult.innerHTML =
        '<div class="info-line"><span class="key">V<sub>ref</sub>:</span> <span class="val">' + vref + 'V</span></div>' +
        '<div class="info-line"><span class="key">Max value:</span> <span class="val">' + maxVal + '</span></div>' +
        '<div class="info-line"><span class="key">Step size:</span> <span class="val">' + (step * 1000).toFixed(2) + ' mV</span></div>' +
        '<div class="info-line"><span class="key">ADC reading:</span> <span class="val" style="font-size:1.2em;font-weight:bold;">' + reading + '</span></div>' +
        '<div class="info-line"><span class="key">Reconstructed V:</span> <span class="val">' + (reading / maxVal * vref).toFixed(3) + 'V</span></div>';
    }

    vSlider.addEventListener('input', updateAdc);
    bitsSel.addEventListener('change', updateAdc);
    updateAdc();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>ESP32\'s ADC is <b>12-bit</b> with <b>V<sub>ref</sub> = 3.3V</b>. You read a value of <b>3000</b>. What is the approximate input voltage? (Enter in volts.)</p>',
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
        // Exact: 3000/4095 * 3.3 = 2.418V
        var exact = 3000 / 4095 * 3.3;
        if (num >= 2.4 && num <= 2.5) return { correct: true, feedback: 'Correct! V = (reading / max) &times; V<sub>ref</sub> = (3000 / 4095) &times; 3.3 = ' + exact.toFixed(2) + 'V. Each of the 4096 steps represents about 0.8 mV.' };
        if (num >= 2.35 && num < 2.4) return { correct: true, feedback: 'Close enough! The exact answer is ' + exact.toFixed(3) + 'V. You used (3000 / 4096) instead of (3000 / 4095), which gives a very slightly different result. Both are acceptable.' };
        return { correct: false, feedback: 'Not quite. Use the formula: V = (reading / ADC_max) &times; V<sub>ref</sub> = (3000 / 4095) &times; 3.3 = ' + exact.toFixed(2) + 'V.' };
      },
      hints: [
        'A 12-bit ADC has 2^12 = 4096 possible values (0 to 4095).',
        'The formula is: V = (ADC_reading / ADC_max) &times; V_ref = (3000 / 4095) &times; 3.3.',
        '3000 / 4095 = 0.7326... Multiply by 3.3 = ~2.42V.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You want to dim an LED to <b>25% brightness</b> using PWM on a <b>3.3V pin</b>. What duty cycle and what effective average voltage?</p>' +
              '<p>Enter as: <code class="inline">duty%, voltage</code> (e.g. <code class="inline">50, 1.65</code>)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. 50, 1.65';
        inp.style.width = '160px';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var parts = String(v).split(',');
        if (parts.length < 2) return { correct: false, feedback: 'Enter two values separated by a comma: duty%, voltage. Example: 50, 1.65' };
        var duty = parseFloat(parts[0]);
        var volt = parseFloat(parts[1]);
        if (isNaN(duty) || isNaN(volt)) return { correct: false, feedback: 'Could not parse your numbers. Enter as: duty%, voltage (e.g. 25, 0.825).' };
        var dutyOk = duty >= 24 && duty <= 26;
        var voltOk = volt >= 0.8 && volt <= 0.85;
        if (dutyOk && voltOk) return { correct: true, feedback: 'Correct! 25% duty cycle means the pin is HIGH for 25% of each cycle. Effective voltage = 3.3V &times; 25/100 = <b>0.825V</b>. The LED sees this average voltage and glows at about 25% brightness.' };
        if (dutyOk && !voltOk) return { correct: false, feedback: 'The duty cycle is right (25%), but the voltage is off. V_eff = V_max &times; duty / 100 = 3.3 &times; 0.25 = 0.825V.' };
        if (!dutyOk && voltOk) return { correct: false, feedback: 'The voltage is right, but the duty cycle should be 25% (you want 25% brightness, so 25% of the time the pin is HIGH).' };
        return { correct: false, feedback: 'For 25% brightness: duty = 25%, V_eff = 3.3 &times; 25/100 = 0.825V.' };
      },
      hints: [
        '25% brightness means the pin is on 25% of the time. What duty cycle is that?',
        'Effective voltage = V_max &times; duty_cycle / 100 = 3.3 &times; 25 / 100.',
        'Duty = 25%, V_eff = 0.825V. Enter: 25, 0.825'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Your ESP32 reads a <b>soil moisture sensor</b> via ADC (12-bit, V<sub>ref</sub> = 3.3V). The sensor outputs:</p>' +
              '<ul><li><b>Dry soil:</b> ~3.0V</li><li><b>Wet soil:</b> ~1.2V</li></ul>' +
              '<p>You want to trigger a pump when moisture drops below <b>40%</b> (where 0% = bone dry at 3.0V, 100% = saturated at 1.2V). What ADC threshold value should you set?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 2500';
        inp.style.width = '120px';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // 40% moisture = 60% of the way from wet to dry voltage
        // V = 1.2 + 0.60 * (3.0 - 1.2) = 1.2 + 1.08 = 2.28V
        // (equivalently: V = 3.0 - 0.40 * (3.0 - 1.2) = 3.0 - 0.72 = 2.28V)
        // ADC = 2.28 / 3.3 * 4095 = 2829
        var voltage = 3.0 - 0.40 * (3.0 - 1.2);
        var adcVal = Math.round(voltage / 3.3 * 4095);
        if (num >= 2800 && num <= 2860) return { correct: true, feedback: 'Correct! 40% moisture maps to a voltage of ' + voltage.toFixed(2) + 'V (since the sensor outputs HIGHER voltage for DRIER soil). ADC value = ' + voltage.toFixed(2) + ' / 3.3 &times; 4095 = <b>' + adcVal + '</b>. Trigger the pump when the ADC reading is ABOVE this threshold (higher voltage = drier soil).' };
        if (num >= 1480 && num <= 1520) return { correct: false, feedback: 'You may have calculated 40% of the ADC range linearly. But the sensor range is 1.2V-3.0V, not 0-3.3V. 40% moisture = voltage of 3.0 - 0.4 &times; (3.0 - 1.2) = ' + voltage.toFixed(2) + 'V, which is ADC ' + adcVal + '.' };
        return { correct: false, feedback: 'The sensor is inverted: dry = 3.0V (high), wet = 1.2V (low). 40% moisture: V = 3.0 - 0.40 &times; (3.0 - 1.2) = ' + voltage.toFixed(2) + 'V. ADC = ' + voltage.toFixed(2) + ' / 3.3 &times; 4095 = ' + adcVal + '. Accept values around 2800-2860.' };
      },
      hints: [
        'The sensor is inverted: dry = high voltage (3.0V), wet = low voltage (1.2V). 40% moisture means the voltage is closer to the dry end.',
        'The voltage range spans 3.0V - 1.2V = 1.8V. At 40% moisture, the voltage is: 3.0 - 0.40 &times; 1.8 = 2.28V.',
        'V = 2.28V. ADC value = 2.28 / 3.3 &times; 4095 = ~2829. Enter a value around 2829.'
      ]
    }
  ]
});
