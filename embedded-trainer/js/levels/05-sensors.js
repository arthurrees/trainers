// Level 5 — Sensors & Input Devices
EST.registerLevel({
  id: 5,
  title: 'Sensors & Input Devices',
  whyItMatters: 'Sensors are the eyes and ears of every embedded system — without them, your MCU is blind to the physical world. Knowing which sensor to pick and how to wire it determines whether your project actually works.',
  glossary: ['analog', 'digital', 'ADC', 'I2C', 'pull-up'],
  learn:
    '<p>Sensors convert physical phenomena — temperature, distance, light, motion, pressure — into electrical signals your MCU can read. The whole point of embedded systems is interacting with the real world, and sensors are how you <i>perceive</i> it.</p>' +

    '<h4>Two kinds of sensor output</h4>' +
    '<p>Every sensor produces one of two types of signal:</p>' +
    '<div class="example">' +
    '<div class="label">Digital output</div>' +
    '<p>The sensor gives you a <b>HIGH or LOW</b> (on/off), or a timed pulse whose duration encodes the measurement. You read it with a digital GPIO pin.</p>' +
    '<ul>' +
    '<li><b>PIR motion sensor</b> — outputs HIGH when it detects a warm body moving, LOW otherwise.</li>' +
    '<li><b>HC-SR04 ultrasonic</b> — you send a trigger pulse, then measure how long the echo pin stays HIGH. That time encodes the distance.</li>' +
    '<li><b>DHT22</b> — uses a custom one-wire protocol where the sensor sends a stream of timed HIGH/LOW pulses encoding temperature and humidity bits.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Analog output</div>' +
    '<p>The sensor produces a <b>continuous voltage</b> that varies with the measurement. You read it with an ADC pin. The ADC converts that voltage into a number (0-4095 on a 12-bit ESP32 ADC).</p>' +
    '<ul>' +
    '<li><b>LDR (light-dependent resistor)</b> — resistance drops in bright light, rises in darkness. Wire it as a voltage divider with a fixed resistor, and the midpoint voltage maps to light level.</li>' +
    '<li><b>Soil moisture sensor</b> — resistance between two probes varies with water content. Wetter soil = lower resistance = higher voltage (or lower, depending on wiring).</li>' +
    '<li><b>Potentiometer</b> — not really a "sensor," but same idea: a knob that outputs a variable voltage. Great for testing ADC code.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Sensor deep dives</h4>' +
    '<p>Here are the sensors you will encounter most often in embedded projects, with enough detail to actually wire and code them:</p>' +

    '<div class="example">' +
    '<div class="label">DHT22 — Temperature + Humidity</div>' +
    '<p><b>What it measures:</b> Temperature (-40 to 80 C, +/-0.5 C accuracy) and relative humidity (0-100% RH, +/-2% accuracy).</p>' +
    '<p><b>How it works:</b> Uses a custom single-wire protocol (NOT standard OneWire). The sensor sends 40 bits of data as timed pulses on one data pin. It is slow — you can only read it once every 2 seconds.</p>' +
    '<p><b>Wiring:</b> 3 pins used (out of 4 physical pins): VCC (3.3-5V), DATA (to a GPIO), GND. A 10k pull-up resistor on the DATA line is recommended (though many breakout boards include one).</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>import dht\nfrom machine import Pin\n\nd = dht.DHT22(Pin(4))\nd.measure()              # trigger a reading\nprint(d.temperature())   # e.g. 23.5 (Celsius)\nprint(d.humidity())      # e.g. 48.2 (percent)</pre>' +
    '<p><b>Gotcha:</b> If you call <code class="inline">d.measure()</code> more than once every 2 seconds, you get stale data or errors.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">HC-SR04 — Ultrasonic Distance</div>' +
    '<p><b>What it measures:</b> Distance to an object (2-400 cm range).</p>' +
    '<p><b>How it works:</b> You send a 10-microsecond HIGH pulse on the TRIG pin. The sensor fires an ultrasonic burst at 40 kHz. When the echo bounces back, the ECHO pin goes HIGH for a duration proportional to the distance. Distance = echo_time_seconds x 343 / 2 (speed of sound is 343 m/s at room temperature; divide by 2 because the sound travels to the object and back).</p>' +
    '<p><b>Wiring:</b> VCC (5V required!), TRIG (any GPIO), ECHO (any GPIO — but outputs 5V!), GND. If using an ESP32 (3.3V logic), you need a voltage divider on the ECHO pin to bring 5V down to 3.3V safely.</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>from machine import Pin, time_pulse_us\nimport time\n\ntrig = Pin(5, Pin.OUT)\necho = Pin(18, Pin.IN)\n\ntrig.off()\ntime.sleep_us(2)\ntrig.on()\ntime.sleep_us(10)\ntrig.off()\n\npulse_us = time_pulse_us(echo, 1, 30000)  # timeout 30ms\ndistance_cm = pulse_us * 0.0343 / 2\nprint(distance_cm)</pre>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">PIR (HC-SR501) — Infrared Motion Detection</div>' +
    '<p><b>What it measures:</b> Whether a warm body (human, animal) is moving within range (~7 meters, 120-degree cone).</p>' +
    '<p><b>How it works:</b> Contains a pyroelectric sensor that detects changes in infrared radiation. When a warm body moves across its field of view, the IR pattern changes, and the sensor outputs HIGH. It does NOT measure distance or identify what is moving — just "something warm moved."</p>' +
    '<p><b>Wiring:</b> VCC (5V), OUT (digital HIGH/LOW to any GPIO), GND. The module has two potentiometers: one for sensitivity (detection range) and one for hold time (how long the output stays HIGH after detection, 3 seconds to 5 minutes).</p>' +
    '<p><b>Code:</b> Dead simple — just read the pin:</p>' +
    '<pre>from machine import Pin\npir = Pin(14, Pin.IN)\nif pir.value() == 1:\n    print("Motion detected!")</pre>' +
    '<p><b>Gotcha:</b> The PIR needs 30-60 seconds to stabilize after power-on. During that time, it may give false triggers.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">BME280 — Temperature + Humidity + Pressure (I2C)</div>' +
    '<p><b>What it measures:</b> Temperature (-40 to 85 C), relative humidity (0-100%), and barometric pressure (300-1100 hPa). Much more accurate than the DHT22.</p>' +
    '<p><b>How it works:</b> A sophisticated Bosch MEMS sensor that communicates over I2C (or SPI). It has internal calibration data stored in registers that you read to convert raw ADC values into real measurements.</p>' +
    '<p><b>Wiring (I2C):</b> VCC (3.3V), SDA (to I2C data pin, e.g. GPIO 21), SCL (to I2C clock pin, e.g. GPIO 22), GND. Needs pull-up resistors on SDA and SCL (4.7k ohm typical — many breakout boards include them). The default I2C address is 0x76 (or 0x77 if the SDO pin is pulled high).</p>' +
    '<p><b>Why pressure matters:</b> Barometric pressure decreases with altitude. The barometric formula lets you estimate altitude from pressure: approximately 8.3 meters of altitude change per 1 hPa of pressure change near sea level. This is how altimeters in watches and drones work.</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>from machine import I2C, Pin\nimport bme280  # external library\n\ni2c = I2C(0, sda=Pin(21), scl=Pin(22))\nbme = bme280.BME280(i2c=i2c)\nprint(bme.values)\n# ("23.45C", "48.20%", "1013.25hPa")</pre>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">LDR — Light-Dependent Resistor</div>' +
    '<p><b>What it measures:</b> Ambient light level (relative, not calibrated lux).</p>' +
    '<p><b>How it works:</b> The LDR is a passive component whose resistance changes with light. In bright light, resistance drops to a few hundred ohms. In darkness, it rises to several hundred kilohms. You wire it as one half of a voltage divider with a fixed resistor (e.g. 10k ohm), then read the midpoint voltage with an ADC pin.</p>' +
    '<p><b>Wiring:</b> 3.3V -> LDR -> ADC pin -> 10k resistor -> GND. The voltage at the ADC pin varies between 0V (total darkness) and ~3.3V (very bright). No special library needed — just read the ADC:</p>' +
    '<pre>from machine import ADC, Pin\nldr = ADC(Pin(34))         # GPIO 34 on ESP32\nldr.atten(ADC.ATTN_11DB)   # full 0-3.3V range\nvalue = ldr.read()         # 0-4095\nprint("Light level:", value)</pre>' +
    '<p><b>Tip:</b> LDR values are relative. To get meaningful readings, calibrate by recording values in known conditions (dark room vs. bright sunlight) and mapping the range.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">MPU-6050 — 6-Axis Accelerometer + Gyroscope (I2C)</div>' +
    '<p><b>What it measures:</b> 3-axis acceleration (up to +/-16g) and 3-axis angular velocity (up to +/-2000 degrees/second). Six axes total = "6-DOF" (degrees of freedom).</p>' +
    '<p><b>How it works:</b> MEMS accelerometer measures linear acceleration (including gravity — if the board is tilted, gravity pulls on the sensor element and you can calculate tilt angle). MEMS gyroscope measures rotational speed. Combine both to get stable orientation (sensor fusion). The chip also has an on-board Digital Motion Processor (DMP) that can do sensor fusion internally.</p>' +
    '<p><b>Wiring (I2C):</b> VCC (3.3V), SDA, SCL, GND. Default I2C address is 0x68 (or 0x69 if AD0 pin is HIGH).</p>' +
    '<p><b>Common uses:</b> Balancing robots (like a Segway), drone stabilization, gesture detection, step counters, vibration monitoring.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">DS18B20 — Waterproof Temperature Sensor (OneWire)</div>' +
    '<p><b>What it measures:</b> Temperature (-55 to 125 C, +/-0.5 C accuracy from -10 to 85 C).</p>' +
    '<p><b>How it works:</b> Uses the Dallas/Maxim OneWire protocol — a single data wire carries both data and (optionally) power. Each DS18B20 has a unique 64-bit serial number burned in at the factory, so you can chain many sensors on a single wire and address each one individually. This is unique among the sensors here.</p>' +
    '<p><b>Wiring:</b> VCC (3.3-5V), DATA (one GPIO pin + a 4.7k pull-up resistor to VCC), GND. In "parasite power" mode, you skip the VCC wire entirely and the sensor draws power from the data line.</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>import onewire, ds18x20, time\nfrom machine import Pin\n\now = onewire.OneWire(Pin(4))\nds = ds18x20.DS18X20(ow)\nroms = ds.scan()   # find all sensors on the bus\nds.convert_temp()  # start temperature conversion\ntime.sleep_ms(750) # wait for conversion\nfor rom in roms:\n    print(ds.read_temp(rom))</pre>' +
    '<p><b>Best use case:</b> Any situation where you need waterproof temperature readings or need to measure temperature at many points (e.g. a brewing system with 5 probes on one wire).</p>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">Choosing the right sensor</div>' +
    '<p>Ask yourself three questions:</p>' +
    '<ol>' +
    '<li><b>What do I need to measure?</b> Temperature, distance, motion, light, orientation?</li>' +
    '<li><b>What protocol/interface does my MCU support?</b> I2C is easiest for multi-sensor setups (shared bus). Analog needs an ADC pin. Digital timing-based sensors need precise timing.</li>' +
    '<li><b>How accurate does it need to be?</b> DHT22 is fine for a home weather display. BME280 is better for a weather station you actually trust. A medical device would need a calibrated, certified sensor.</li>' +
    '</ol>' +
    '</div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;
    var sensors = lib.SENSORS;
    var names = Object.keys(sensors);

    var snippets = {
      'DHT22': 'import dht\nfrom machine import Pin\n\nd = dht.DHT22(Pin(4))\nd.measure()\nprint(d.temperature())  # e.g. 23.5\nprint(d.humidity())     # e.g. 48.2',
      'BME280': 'from machine import I2C, Pin\nimport bme280\n\ni2c = I2C(0, sda=Pin(21), scl=Pin(22))\nbme = bme280.BME280(i2c=i2c)\nprint(bme.values)',
      'HC-SR04': 'from machine import Pin, time_pulse_us\nimport time\n\ntrig = Pin(5, Pin.OUT)\necho = Pin(18, Pin.IN)\ntrig.off(); time.sleep_us(2)\ntrig.on(); time.sleep_us(10); trig.off()\npulse = time_pulse_us(echo, 1, 30000)\nprint(pulse * 0.0343 / 2, "cm")',
      'PIR (HC-SR501)': 'from machine import Pin\npir = Pin(14, Pin.IN)\nif pir.value():\n    print("Motion detected!")',
      'LDR': 'from machine import ADC, Pin\nldr = ADC(Pin(34))\nldr.atten(ADC.ATTN_11DB)\nprint("Light:", ldr.read())',
      'MPU-6050': 'from machine import I2C, Pin\nimport mpu6050\n\ni2c = I2C(0, sda=Pin(21), scl=Pin(22))\nmpu = mpu6050.MPU6050(i2c)\nprint("Accel:", mpu.acceleration)\nprint("Gyro:", mpu.gyro)',
      'DS18B20': 'import onewire, ds18x20, time\nfrom machine import Pin\n\now = onewire.OneWire(Pin(4))\nds = ds18x20.DS18X20(ow)\nroms = ds.scan()\nds.convert_temp()\ntime.sleep_ms(750)\nfor r in roms:\n    print(ds.read_temp(r))',
      'Soil Moisture': 'from machine import ADC, Pin\nsoil = ADC(Pin(34))\nsoil.atten(ADC.ATTN_11DB)\nval = soil.read()\nprint("Moisture:", val)'
    };

    var wirings = {
      'DHT22': 'VCC (3.3-5V) -> VCC pin, GPIO 4 -> DATA pin (+ 10k pull-up to VCC), GND -> GND',
      'BME280': 'VCC (3.3V) -> VIN, GPIO 21 -> SDA, GPIO 22 -> SCL, GND -> GND (pull-ups on SDA/SCL)',
      'HC-SR04': 'VCC (5V) -> VCC, GPIO 5 -> TRIG, GPIO 18 -> ECHO (use voltage divider for 3.3V MCU!), GND -> GND',
      'PIR (HC-SR501)': 'VCC (5V) -> VCC, GPIO 14 -> OUT, GND -> GND',
      'LDR': '3.3V -> LDR -> ADC pin (GPIO 34) -> 10k resistor -> GND (voltage divider)',
      'MPU-6050': 'VCC (3.3V) -> VCC, GPIO 21 -> SDA, GPIO 22 -> SCL, GND -> GND',
      'DS18B20': 'VCC (3.3-5V) -> VCC (red), GPIO 4 -> DATA (yellow) + 4.7k pull-up to VCC, GND -> GND (black)',
      'Soil Moisture': 'VCC (3.3V) -> VCC, GPIO 34 -> AO (analog out), GND -> GND'
    };

    container.innerHTML =
      '<p class="muted">Click a sensor to see its full specs, wiring, and a MicroPython code snippet.</p>' +
      '<div class="chip-row" id="est-sensor-row"></div>' +
      '<div id="est-sensor-detail" class="formula-box" style="margin-top:12px;min-height:160px;">' +
      'Pick a sensor above to explore it.</div>';

    var row = container.querySelector('#est-sensor-row');
    var detail = container.querySelector('#est-sensor-detail');

    names.forEach(function (name) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');

        var s = sensors[name];
        var lines = [
          '<div><b>' + name + '</b></div>',
          '<div class="info-line"><span class="key">Measures:</span> <span class="val">' + s.measures + '</span></div>',
          '<div class="info-line"><span class="key">Output type:</span> <span class="val">' + s.output + '</span></div>',
          '<div class="info-line"><span class="key">Voltage:</span> <span class="val">' + s.voltage + '</span></div>',
          '<div class="info-line"><span class="key">Range:</span> <span class="val">' + s.range + '</span></div>',
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + s.notes + '</span></div>'
        ];
        if (wirings[name]) {
          lines.push('<div class="info-line" style="margin-top:8px;"><span class="key">Wiring:</span> <span class="val">' + wirings[name] + '</span></div>');
        }
        if (snippets[name]) {
          lines.push('<div style="margin-top:8px;"><b>MicroPython:</b></div><pre>' + snippets[name] + '</pre>');
        }
        detail.innerHTML = lines.join('');
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You need to measure <b>room temperature and humidity</b> on an ESP32. The sensor must connect via <b>I2C</b>. Which sensor should you use?</p>',
      mountInput: function (container) {
        var opts = ['DHT22', 'BME280', 'LDR', 'DS18B20', 'MPU-6050'];
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
        if (v === 'BME280') return { correct: true, feedback: 'Correct! The BME280 measures temperature, humidity, AND pressure over I2C. It is more accurate than the DHT22 and uses a standard protocol.' };
        if (v === 'DHT22') return { correct: false, feedback: 'The DHT22 does measure temperature and humidity, but it uses a custom one-wire protocol — NOT I2C. The question requires I2C. The BME280 is the right choice.' };
        if (v === 'LDR') return { correct: false, feedback: 'An LDR measures light level, not temperature or humidity. The BME280 is what you need — it measures temp + humidity + pressure over I2C.' };
        if (v === 'DS18B20') return { correct: false, feedback: 'The DS18B20 measures temperature only (no humidity) and uses the OneWire protocol, not I2C. The BME280 covers temp + humidity + pressure over I2C.' };
        return { correct: false, feedback: 'The MPU-6050 is an accelerometer/gyroscope — it measures motion, not temperature or humidity. The BME280 is the correct answer.' };
      },
      hints: [
        'The question has two requirements: (1) temperature + humidity, and (2) I2C protocol. Which sensor meets both?',
        'DHT22 does temp + humidity but does NOT use I2C — it uses a custom one-wire protocol.',
        'The BME280 measures temperature, humidity, and pressure over I2C (address 0x76 or 0x77).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>An <b>HC-SR04 ultrasonic sensor</b> returns an echo pulse of <b>1460 microseconds</b>. How far away is the object? (Speed of sound = 343 m/s)</p><p>Give your answer in centimeters, rounded to one decimal place.</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. 25.0';
        inp.style.width = '120px';
        var label = document.createElement('span');
        label.textContent = ' cm';
        container.appendChild(inp);
        container.appendChild(label);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number in centimeters.' };
        // Distance = 0.001460s * 343m/s / 2 = 0.25039m = 25.039cm
        if (num >= 24.5 && num <= 25.5) return { correct: true, feedback: 'Correct! Distance = (1460 x 10<sup>-6</sup> s) x 343 m/s / 2 = 0.2504 m = 25.0 cm. The divide-by-2 accounts for the round trip (sound goes out and comes back).' };
        // Common mistake: forgetting to divide by 2
        if (num >= 49 && num <= 51) return { correct: false, feedback: 'You got 50 cm — it looks like you forgot to divide by 2. The sound travels to the object AND back, so the actual distance is half of what the full time suggests. Correct answer: ~25.0 cm.' };
        return { correct: false, feedback: 'Not quite. The formula is: distance = echo_time_seconds x speed_of_sound / 2. So: (1460 x 10<sup>-6</sup>) x 343 / 2 = 0.2504 m = 25.0 cm.' };
      },
      hints: [
        'The formula is: distance = echo_time x speed_of_sound / 2. Why divide by 2? Because the sound travels to the object and back.',
        'Convert microseconds to seconds first: 1460 us = 0.001460 seconds. Then: 0.001460 x 343 = 0.50078 meters total path.',
        'Total path = 0.50078 m. Divide by 2 for one-way distance: 0.25039 m = 25.0 cm.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are building a <b>weather station</b> that needs to measure:</p>' +
              '<ul><li>Temperature</li><li>Humidity</li><li>Barometric pressure</li><li>Light level</li></ul>' +
              '<p>Name the <b>minimum set of sensors</b> you would use (fewest sensors possible). Type them separated by commas.</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. SensorA, SensorB';
        inp.style.width = '300px';
        container.appendChild(inp);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var lower = v.toLowerCase().replace(/\s+/g, '');
        var hasBME = lower.indexOf('bme280') !== -1 || lower.indexOf('bme') !== -1;
        var hasLDR = lower.indexOf('ldr') !== -1 || lower.indexOf('light') !== -1 || lower.indexOf('photoresist') !== -1;
        var hasDHT = lower.indexOf('dht') !== -1;
        var hasBMP = lower.indexOf('bmp') !== -1;

        if (hasBME && hasLDR) {
          // Check if they listed extra unnecessary sensors
          if (hasDHT) return { correct: false, feedback: 'You listed the BME280 AND a DHT sensor. The BME280 already covers temperature and humidity — the DHT is redundant. The optimal answer is just BME280 + LDR (2 sensors).' };
          return { correct: true, feedback: 'Correct! The BME280 covers temperature + humidity + barometric pressure in a single I2C device, and the LDR covers light level. That is the minimum: just 2 sensors for all 4 measurements.' };
        }
        if (hasDHT && hasBMP && hasLDR) {
          return { correct: false, feedback: 'That works, but it is not the minimum. A DHT22 + BMP280 is 2 sensors for temp/humidity/pressure, but the BME280 does all three in ONE sensor. Optimal: BME280 + LDR = 2 sensors.' };
        }
        if (hasDHT && hasLDR && !hasBME) {
          return { correct: false, feedback: 'The DHT22 gives you temperature and humidity, and the LDR gives you light — but you are missing barometric pressure. The BME280 covers temp + humidity + pressure in one device. Optimal: BME280 + LDR.' };
        }
        if (hasBME && !hasLDR) {
          return { correct: false, feedback: 'The BME280 covers temperature, humidity, and pressure — nice! But you are missing light level. Add an LDR (light-dependent resistor) to complete the set. Answer: BME280 + LDR.' };
        }
        return { correct: false, feedback: 'The optimal answer is <b>BME280 + LDR</b> (just 2 sensors). The BME280 measures temperature, humidity, AND barometric pressure in a single I2C device. The LDR measures light level via a voltage divider and ADC.' };
      },
      hints: [
        'Is there a single sensor that covers more than one of these measurements? Check the BME280.',
        'The BME280 measures temperature + humidity + pressure — that is 3 out of 4 in one chip. What covers the fourth?',
        'BME280 (temp + humidity + pressure) + LDR (light level) = 2 sensors covering all 4 measurements.'
      ]
    }
  ]
});
