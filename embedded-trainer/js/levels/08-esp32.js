// Level 8 — The ESP32 Deep Dive
EST.registerLevel({
  id: 8,
  title: 'The ESP32 Deep Dive',
  whyItMatters: 'The ESP32 is the most popular MCU for hobbyist and professional IoT projects. Understanding its pins, peripherals, and power modes is the difference between a working prototype and hours of debugging mysterious boot loops.',
  glossary: ['ESP32', 'WiFi', 'BLE', 'deep sleep', 'ADC', 'PWM', 'DAC'],
  learn:
    '<p>The ESP32 is the Swiss Army knife of embedded development. For ~$5, you get a dual-core processor, WiFi, Bluetooth, and enough peripherals to build almost anything. Let us go deep on what is inside and how to use it well.</p>' +

    '<h4>CPU</h4>' +
    '<div class="example">' +
    '<div class="label">Dual-core Xtensa LX6</div>' +
    '<p>Two independent cores running at 240 MHz. In practice, the WiFi/BT stack runs on Core 0, and your application code runs on Core 1. This is why your code does not stutter when WiFi is active — they are on separate cores.</p>' +
    '<p><b>Variants:</b> The ESP32-S2 is single-core (cheaper, lower power, USB OTG). The ESP32-S3 adds vector instructions for on-device machine learning (TensorFlow Lite Micro). The ESP32-C3 is RISC-V single-core — the cheapest option (~$3) for simple IoT.</p>' +
    '</div>' +

    '<h4>Memory</h4>' +
    '<div class="example">' +
    '<div class="label">Flash and RAM</div>' +
    '<p><b>520 KB SRAM</b> — your variables, buffers, and stack live here. Sounds tiny, but MicroPython scripts rarely use more than 50-100 KB. In C, you have even more headroom.</p>' +
    '<p><b>4 MB flash</b> — your program is stored here (and for MicroPython, the filesystem too). Some boards come with 8 or 16 MB flash for larger applications.</p>' +
    '<p><b>PSRAM (optional):</b> Some boards (ESP32-WROVER, ESP32-S3) add external PSRAM (up to 8 MB). This is useful for image buffers, audio processing, or anything that needs large contiguous memory. Accessed through the SPI bus, so it is slower than internal SRAM.</p>' +
    '</div>' +

    '<h4>Wireless</h4>' +
    '<div class="example">' +
    '<div class="label">WiFi + Bluetooth</div>' +
    '<p><b>WiFi:</b> 2.4 GHz 802.11 b/g/n. Can operate as a station (connects to your router), an access point (creates its own network for other devices to join), or both simultaneously. Typical range: 30-100 meters indoors depending on walls and interference.</p>' +
    '<p><b>Bluetooth:</b> Classic Bluetooth (for audio, serial) AND BLE (Bluetooth Low Energy — for sensors, beacons, fitness trackers). BLE is much lower power than classic BT.</p>' +
    '<p><b>MicroPython WiFi example:</b></p>' +
    '<pre>import network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect("MySSID", "MyPassword")\nwhile not wlan.isconnected():\n    pass\nprint("Connected:", wlan.ifconfig())</pre>' +
    '</div>' +

    '<h4>GPIO Pin Map</h4>' +
    '<div class="example">' +
    '<div class="label">34 GPIOs, but not all are safe</div>' +
    '<p>The ESP32 has GPIO 0 through GPIO 39, but several have special restrictions:</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.9em;">' +
    '<tr style="border-bottom:1px solid #3a4256;">' +
    '<th style="text-align:left;padding:4px;">Pins</th>' +
    '<th style="text-align:left;padding:4px;">Status</th>' +
    '<th style="text-align:left;padding:4px;">Why</th></tr>' +
    '<tr style="color:#f87171;"><td style="padding:4px;">GPIO 6-11</td><td style="padding:4px;">DO NOT USE</td><td style="padding:4px;">Connected to internal SPI flash. Using them crashes the board.</td></tr>' +
    '<tr style="color:#fbbf24;"><td style="padding:4px;">GPIO 0</td><td style="padding:4px;">Strapping pin</td><td style="padding:4px;">Must be HIGH at boot for normal operation. LOW = bootloader mode. Do not drive LOW at startup.</td></tr>' +
    '<tr style="color:#fbbf24;"><td style="padding:4px;">GPIO 2</td><td style="padding:4px;">Strapping pin</td><td style="padding:4px;">Must be LOW at boot (or floating). Connected to onboard LED on many boards.</td></tr>' +
    '<tr style="color:#fbbf24;"><td style="padding:4px;">GPIO 5</td><td style="padding:4px;">Strapping pin</td><td style="padding:4px;">Affects timing of SDIO boot. Usually safe after boot.</td></tr>' +
    '<tr style="color:#fbbf24;"><td style="padding:4px;">GPIO 12</td><td style="padding:4px;">Strapping pin</td><td style="padding:4px;">Sets flash voltage. If pulled HIGH at boot on a 3.3V flash module, it can brick the board until you reflash.</td></tr>' +
    '<tr style="color:#fbbf24;"><td style="padding:4px;">GPIO 15</td><td style="padding:4px;">Strapping pin</td><td style="padding:4px;">Controls boot log output. Pulling LOW suppresses startup messages.</td></tr>' +
    '<tr><td style="padding:4px;">GPIO 34-39</td><td style="padding:4px;">Input only</td><td style="padding:4px;">No internal pull-up/pull-down. Best used for ADC (less noise).</td></tr>' +
    '<tr style="color:#4ade80;"><td style="padding:4px;">GPIO 13-33 (except above)</td><td style="padding:4px;">Safe</td><td style="padding:4px;">Fully usable for input, output, ADC, PWM, I2C, SPI, UART.</td></tr>' +
    '</table>' +
    '<p><b>Rule of thumb:</b> Use GPIO 13, 14, 16-33 freely. Avoid 6-11 entirely. Be careful with 0, 2, 5, 12, 15 (strapping pins). Use 34-39 for analog input only.</p>' +
    '</div>' +

    '<h4>Peripherals</h4>' +
    '<div class="example">' +
    '<div class="label">What the ESP32 has built in</div>' +
    '<p><b>ADC:</b> 18 channels, 12-bit resolution (0-4095). But accuracy is poor — +/-6% without calibration. The built-in ADC is fine for "is the battery above 3.5V?" but not for precision measurements. GPIO 34-39 are recommended for ADC because they have no internal pull resistors to add noise.</p>' +
    '<p><b>DAC:</b> 2 channels (GPIO 25 and 26 only), 8-bit (0-255 = 0-3.3V). True analog output — useful for generating audio waveforms or reference voltages.</p>' +
    '<p><b>PWM:</b> Up to 16 independent channels, assignable to any GPIO. Uses the hardware LEDC (LED Controller) peripheral, which despite the name works for any PWM application: LED dimming, motor speed, servo control. Resolution up to 16-bit at lower frequencies.</p>' +
    '<p><b>Touch:</b> 10 capacitive touch pins (GPIO 0, 2, 4, 12-15, 27, 32, 33). You can detect a finger touch without any external components. Touch pins can also wake the ESP32 from deep sleep.</p>' +
    '<p><b>UART:</b> 3 hardware UART ports. UART0 is typically used for the USB-serial debug console. UART1 and UART2 are free for your peripherals.</p>' +
    '<p><b>I2C:</b> 2 hardware I2C buses. You can assign them to any safe GPIO pair.</p>' +
    '<p><b>SPI:</b> 2 usable SPI buses (HSPI and VSPI). The third SPI bus is used internally for flash memory.</p>' +
    '</div>' +

    '<h4>Power Modes</h4>' +
    '<div class="example">' +
    '<div class="label">From full speed to micro-sleep</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.9em;">' +
    '<tr style="border-bottom:1px solid #3a4256;">' +
    '<th style="text-align:left;padding:4px;">Mode</th>' +
    '<th style="text-align:left;padding:4px;">Current</th>' +
    '<th style="text-align:left;padding:4px;">What stays on</th></tr>' +
    '<tr><td style="padding:4px;">Active (CPU only)</td><td style="padding:4px;">~80 mA</td><td style="padding:4px;">Everything except WiFi/BT radio</td></tr>' +
    '<tr><td style="padding:4px;">Active + WiFi</td><td style="padding:4px;">~160-260 mA</td><td style="padding:4px;">Everything including radio (TX peaks at 260 mA)</td></tr>' +
    '<tr><td style="padding:4px;">Modem sleep</td><td style="padding:4px;">~20 mA</td><td style="padding:4px;">CPU runs, WiFi radio off</td></tr>' +
    '<tr><td style="padding:4px;">Light sleep</td><td style="padding:4px;">~0.8 mA</td><td style="padding:4px;">CPU paused, RAM retained, wake on interrupt/timer</td></tr>' +
    '<tr><td style="padding:4px;">Deep sleep</td><td style="padding:4px;">~10 uA</td><td style="padding:4px;">Only RTC memory (8 KB). Wake on timer, pin, or touch. Full reboot on wake.</td></tr>' +
    '</table>' +
    '<p><b>Deep sleep is the killer feature</b> for battery projects. At 10 uA, a 2000 mAh LiPo lasts over 20 years in deep sleep alone. The bottleneck is the active time for sensing and transmitting.</p>' +
    '<p><b>MicroPython deep sleep example:</b></p>' +
    '<pre>import machine\nimport esp32\n\n# Wake up after 15 minutes (in milliseconds)\nmachine.deepsleep(15 * 60 * 1000)\n\n# Or wake on a pin change:\nesp32.wake_on_ext0(pin=machine.Pin(33), level=esp32.WAKEUP_ANY_HIGH)</pre>' +
    '</div>' +

    '<h4>Development Options</h4>' +
    '<div class="example">' +
    '<div class="label">How to program the ESP32</div>' +
    '<ul>' +
    '<li><b>MicroPython</b> — fastest to prototype. Flash the firmware, connect via serial, type Python interactively. Best for learning and quick projects.</li>' +
    '<li><b>Arduino IDE</b> — write C/C++ with the Arduino framework. Huge library ecosystem. Good balance of speed and ease.</li>' +
    '<li><b>PlatformIO</b> — professional IDE (VS Code extension). Supports Arduino and ESP-IDF frameworks. Better than Arduino IDE for larger projects.</li>' +
    '<li><b>ESP-IDF</b> — Espressif\'s official C SDK. Maximum control, access to all features (both CPU cores, FreeRTOS tasks). Steeper learning curve.</li>' +
    '<li><b>CircuitPython</b> — Adafruit\'s Python variant. Drag-and-drop file deployment. Slightly simpler than MicroPython but fewer ESP32 features.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Common boards</div>' +
    '<ul>' +
    '<li><b>ESP32 DevKitC</b> (~$5) — the standard 38-pin board. Has USB-serial chip, all GPIOs broken out.</li>' +
    '<li><b>ESP32-S3-DevKitC</b> (~$8) — S3 variant with USB OTG (can act as a USB device), vector instructions for ML, up to 8 MB PSRAM.</li>' +
    '<li><b>ESP32-C3</b> (~$3) — RISC-V single-core, ultra-cheap. Enough for simple WiFi sensor nodes. Great for high-volume IoT.</li>' +
    '</ul>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">The "safe pin" cheat sheet</div>' +
    '<p>When in doubt, use these GPIO pins on a standard ESP32 DevKitC:</p>' +
    '<ul>' +
    '<li><b>Digital I/O:</b> 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33</li>' +
    '<li><b>ADC input:</b> 34, 35, 36, 39 (input-only, but best for analog)</li>' +
    '<li><b>DAC output:</b> 25, 26 (the only DAC pins)</li>' +
    '<li><b>I2C default:</b> SDA = 21, SCL = 22 (convention, not hardware-fixed)</li>' +
    '<li><b>SPI (VSPI) default:</b> SCLK = 18, MOSI = 23, MISO = 19, CS = 5</li>' +
    '</ul>' +
    '</div>',

  mountPlay: function (container) {
    var pins = [];
    var i;
    var pinData = {
      0:  { safe: 'yellow', funcs: 'Digital, Touch, Strapping', notes: 'Strapping pin: must be HIGH at boot. LOW = bootloader mode. Has internal pull-up. Touch T1.' },
      1:  { safe: 'yellow', funcs: 'UART0 TX', notes: 'Default serial TX. Used for USB debug output. Avoid unless you remap UART0.' },
      2:  { safe: 'yellow', funcs: 'Digital, ADC, Touch, Strapping', notes: 'Strapping pin. Often connected to onboard LED. Must be LOW/floating at boot. Touch T2.' },
      3:  { safe: 'yellow', funcs: 'UART0 RX', notes: 'Default serial RX. Used for USB debug input. Avoid unless you remap UART0.' },
      4:  { safe: 'green', funcs: 'Digital, ADC, Touch', notes: 'Safe. Commonly used for DHT sensors, OneWire. Touch T0.' },
      5:  { safe: 'yellow', funcs: 'Digital, SPI CS, Strapping', notes: 'Strapping pin (affects SDIO timing). Default VSPI CS. Usually safe after boot.' },
      6:  { safe: 'red', funcs: 'Flash SCK', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      7:  { safe: 'red', funcs: 'Flash D0', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      8:  { safe: 'red', funcs: 'Flash D1', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      9:  { safe: 'red', funcs: 'Flash D2', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      10: { safe: 'red', funcs: 'Flash D3', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      11: { safe: 'red', funcs: 'Flash CMD', notes: 'Connected to internal SPI flash. DO NOT USE.' },
      12: { safe: 'yellow', funcs: 'Digital, ADC, Touch, Strapping', notes: 'Strapping pin: sets flash voltage. Pulling HIGH at boot on 3.3V flash can brick board. Touch T5.' },
      13: { safe: 'green', funcs: 'Digital, ADC, Touch', notes: 'Safe. Touch T4.' },
      14: { safe: 'green', funcs: 'Digital, ADC, Touch, HSPI SCLK', notes: 'Safe. HSPI clock. Touch T6.' },
      15: { safe: 'yellow', funcs: 'Digital, ADC, Touch, Strapping', notes: 'Strapping pin: controls boot log output. Touch T3.' },
      16: { safe: 'green', funcs: 'Digital, UART2 RX', notes: 'Safe. Default UART2 RX.' },
      17: { safe: 'green', funcs: 'Digital, UART2 TX', notes: 'Safe. Default UART2 TX.' },
      18: { safe: 'green', funcs: 'Digital, VSPI SCLK', notes: 'Safe. Default VSPI clock.' },
      19: { safe: 'green', funcs: 'Digital, VSPI MISO', notes: 'Safe. Default VSPI MISO.' },
      21: { safe: 'green', funcs: 'Digital, I2C SDA', notes: 'Safe. Default I2C data line.' },
      22: { safe: 'green', funcs: 'Digital, I2C SCL', notes: 'Safe. Default I2C clock line.' },
      23: { safe: 'green', funcs: 'Digital, VSPI MOSI', notes: 'Safe. Default VSPI MOSI.' },
      25: { safe: 'green', funcs: 'Digital, ADC, DAC1', notes: 'Safe. One of only two DAC output pins.' },
      26: { safe: 'green', funcs: 'Digital, ADC, DAC2', notes: 'Safe. One of only two DAC output pins.' },
      27: { safe: 'green', funcs: 'Digital, ADC, Touch', notes: 'Safe. Touch T7.' },
      32: { safe: 'green', funcs: 'Digital, ADC, Touch', notes: 'Safe. Touch T9.' },
      33: { safe: 'green', funcs: 'Digital, ADC, Touch', notes: 'Safe. Touch T8.' },
      34: { safe: 'green', funcs: 'ADC (input only)', notes: 'Input only. No pull-up/down. Best for ADC.' },
      35: { safe: 'green', funcs: 'ADC (input only)', notes: 'Input only. No pull-up/down. Best for ADC.' },
      36: { safe: 'green', funcs: 'ADC (input only), VP', notes: 'Input only. Sensor VP. Best for ADC.' },
      39: { safe: 'green', funcs: 'ADC (input only), VN', notes: 'Input only. Sensor VN. Best for ADC.' }
    };

    container.innerHTML =
      '<p class="muted">Click any GPIO pin to see its functions, safety status, and notes.</p>' +
      '<div class="chip-row" id="est-pin-row" style="flex-wrap:wrap;"></div>' +
      '<div id="est-pin-detail" class="formula-box" style="margin-top:12px;min-height:100px;">' +
      'Select a pin above. <span style="color:#4ade80;">Green</span> = safe, <span style="color:#fbbf24;">Yellow</span> = use with caution, <span style="color:#f87171;">Red</span> = do not use.</div>';

    var row = container.querySelector('#est-pin-row');
    var detail = container.querySelector('#est-pin-detail');

    var pinNums = Object.keys(pinData).sort(function (a, b) { return parseInt(a) - parseInt(b); });
    pinNums.forEach(function (num) {
      var pd = pinData[num];
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = 'GPIO ' + num;
      var colorMap = { green: '#4ade80', yellow: '#fbbf24', red: '#f87171' };
      chip.style.borderColor = colorMap[pd.safe] || '#3a4256';
      chip.style.color = colorMap[pd.safe] || '#9aa3b2';
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');

        var safeLabel = { green: 'Safe to use', yellow: 'Use with caution', red: 'DO NOT USE' };
        detail.innerHTML =
          '<div><b>GPIO ' + num + '</b></div>' +
          '<div class="info-line"><span class="key">Status:</span> <span class="val" style="color:' + colorMap[pd.safe] + ';">' + safeLabel[pd.safe] + '</span></div>' +
          '<div class="info-line"><span class="key">Functions:</span> <span class="val">' + pd.funcs + '</span></div>' +
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + pd.notes + '</span></div>';
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>Which ESP32 GPIOs should you <b>NEVER</b> use for your own circuits, and why?</p>',
      mountInput: function (container) {
        var opts = [
          'GPIO 0-5 (strapping pins)',
          'GPIO 6-11 (internal flash)',
          'GPIO 34-39 (input only)',
          'GPIO 25-26 (DAC pins)'
        ];
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
        if (v === 'GPIO 6-11 (internal flash)') return { correct: true, feedback: 'Correct! GPIO 6-11 are connected to the internal SPI flash memory. Using them for your own circuits will crash the board or corrupt the firmware. Always avoid these pins.' };
        if (v === 'GPIO 0-5 (strapping pins)') return { correct: false, feedback: 'Strapping pins (0, 2, 5, 12, 15) need care at boot time, but they CAN be used after boot. GPIO 6-11 are the ones you should NEVER use — they are connected to the internal SPI flash.' };
        if (v === 'GPIO 34-39 (input only)') return { correct: false, feedback: 'GPIO 34-39 are input-only, but they are perfectly safe for reading sensors and ADC. The pins you must never use are GPIO 6-11 (connected to internal flash).' };
        return { correct: false, feedback: 'GPIO 25-26 are the DAC pins, but they are fully usable for digital I/O, ADC, or DAC. The forbidden pins are GPIO 6-11 — connected to the internal SPI flash memory.' };
      },
      hints: [
        'Some GPIOs are physically wired to an internal component that the ESP32 needs to function. Which ones?',
        'The ESP32 stores its firmware in SPI flash memory. Which pins are the SPI bus for that flash?',
        'GPIO 6-11 are connected to the internal SPI flash. Using them crashes the board.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You build a battery-powered sensor that <b>wakes every 15 minutes</b>, reads a temperature sensor, sends data over WiFi, then goes back to deep sleep. In deep sleep the ESP32 draws <b>10 uA</b>. The active+WiFi phase takes <b>5 seconds at 200 mA average</b>. With a <b>2000 mAh LiPo</b>, estimate the battery life in days.</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. 74';
        inp.style.width = '100px';
        var unit = document.createElement('span');
        unit.textContent = ' days';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value.trim(); };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // Per 15-min cycle: 5s at 200mA + 895s at 0.01mA
        // Active: 200mA * (5/3600)h = 0.2778 mAh
        // Sleep: 0.01mA * (895/3600)h = 0.002486 mAh
        // Per cycle: ~0.280 mAh
        // Per hour (4 cycles): ~1.12 mAh
        // 2000 / 1.12 = 1786 hours = 74.4 days
        if (num >= 65 && num <= 85) return { correct: true, feedback: 'Correct! Per 15-min cycle: active = 200 mA x (5/3600) h = 0.278 mAh, sleep = 0.01 mA x (895/3600) h = 0.0025 mAh. Total per cycle = ~0.28 mAh. Per hour (4 cycles) = ~1.12 mAh. Battery life = 2000 / 1.12 = ~1786 hours = ~74 days. Deep sleep is what makes this possible.' };
        if (num >= 1 && num < 10) return { correct: false, feedback: 'That seems too low. Remember, the ESP32 spends most of its time in deep sleep at only 10 uA (0.01 mA). The 5-second active burst at 200 mA happens only 4 times per hour. The answer is around 74 days.' };
        return { correct: false, feedback: 'The calculation: each 15-min cycle uses 5 seconds active (200 mA = 0.278 mAh) + 895 seconds sleeping (0.01 mA = 0.0025 mAh) = ~0.28 mAh per cycle. That is 1.12 mAh per hour. 2000 mAh / 1.12 mAh/hour = ~1786 hours = ~74 days.' };
      },
      hints: [
        'Break it into two phases per cycle: 5 seconds active at 200 mA, and 895 seconds sleeping at 0.01 mA. Convert each to mAh.',
        'Active: 200 mA x (5/3600) hours = 0.278 mAh. Sleep: 0.01 mA x (895/3600) hours = 0.0025 mAh. Total per 15-min cycle: ~0.28 mAh.',
        '4 cycles per hour x 0.28 mAh = 1.12 mAh/hour. Battery life = 2000 / 1.12 = ~1786 hours = ~74 days.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are designing a home environment monitor with these components:</p>' +
              '<ul>' +
              '<li>Temp/humidity sensor (I2C, e.g. BME280)</li>' +
              '<li>OLED display (I2C, e.g. SSD1306)</li>' +
              '<li>Buzzer (digital output)</li>' +
              '<li>WS2812B LED strip (data pin)</li>' +
              '<li>Button (input with pull-up)</li>' +
              '</ul>' +
              '<p>Assign a specific ESP32 GPIO pin to each. Avoid unsafe pins and conflicts. I2C devices must share SDA/SCL.</p>',
      mountInput: function (container) {
        var items = [
          { label: 'I2C SDA (shared by BME280 + OLED):' },
          { label: 'I2C SCL (shared by BME280 + OLED):' },
          { label: 'Buzzer (digital out):' },
          { label: 'LED strip data pin:' },
          { label: 'Button (input):' }
        ];
        var inputs = [];
        items.forEach(function (item) {
          var row = document.createElement('div');
          row.style.marginBottom = '6px';
          var label = document.createElement('span');
          label.textContent = item.label + ' GPIO ';
          label.style.display = 'inline-block';
          label.style.width = '320px';
          var inp = document.createElement('input');
          inp.type = 'text';
          inp.placeholder = 'e.g. 21';
          inp.style.width = '60px';
          inputs.push(inp);
          row.appendChild(label);
          row.appendChild(inp);
          container.appendChild(row);
        });
        return function () {
          return {
            sda: inputs[0].value.trim(),
            scl: inputs[1].value.trim(),
            buzzer: inputs[2].value.trim(),
            led: inputs[3].value.trim(),
            button: inputs[4].value.trim()
          };
        };
      },
      check: function (v) {
        var forbidden = [6, 7, 8, 9, 10, 11];
        var inputOnly = [34, 35, 36, 39];
        var allPins = [
          { name: 'SDA', val: parseInt(v.sda, 10), needsOutput: true },
          { name: 'SCL', val: parseInt(v.scl, 10), needsOutput: true },
          { name: 'Buzzer', val: parseInt(v.buzzer, 10), needsOutput: true },
          { name: 'LED strip', val: parseInt(v.led, 10), needsOutput: true },
          { name: 'Button', val: parseInt(v.button, 10), needsOutput: false }
        ];
        var errors = [];

        for (var i = 0; i < allPins.length; i++) {
          var p = allPins[i];
          if (isNaN(p.val) || p.val < 0 || p.val > 39) {
            errors.push(p.name + ': invalid GPIO number (must be 0-39).');
            continue;
          }
          if (forbidden.indexOf(p.val) !== -1) {
            errors.push(p.name + ' (GPIO ' + p.val + '): this pin is connected to internal flash. DO NOT USE GPIO 6-11.');
          }
          if (p.needsOutput && inputOnly.indexOf(p.val) !== -1) {
            errors.push(p.name + ' (GPIO ' + p.val + '): this pin is input-only. You need an output-capable pin here.');
          }
        }

        // Check for duplicates (SDA and SCL should be different, everything else unique)
        var assigned = {};
        for (var j = 0; j < allPins.length; j++) {
          var pin = allPins[j];
          if (isNaN(pin.val)) continue;
          if (assigned[pin.val] !== undefined) {
            errors.push(pin.name + ' and ' + assigned[pin.val] + ' are both assigned to GPIO ' + pin.val + '. Each function needs its own pin.');
          } else {
            assigned[pin.val] = pin.name;
          }
        }

        if (errors.length === 0) {
          return { correct: true, feedback: 'Correct! You avoided GPIO 6-11 (flash pins), used output-capable pins for the buzzer and LED strip, shared I2C for both sensors, and gave each function its own pin. Well done! A common setup would be SDA=21, SCL=22, buzzer=25, LED=23, button=33 — but any valid pin assignment works.' };
        }
        return { correct: false, feedback: 'Issues found: ' + errors.join(' ') + ' Fix these and try again.' };
      },
      hints: [
        'I2C default pins on ESP32 are GPIO 21 (SDA) and GPIO 22 (SCL). Both I2C devices share these two pins.',
        'For outputs (buzzer, LED strip), pick from the safe range: 13, 14, 16-19, 23, 25-27, 32-33. For the button input, GPIO 33 or 27 work well.',
        'Example: SDA=21, SCL=22, buzzer=25, LED strip=23, button=33. The key rules: avoid GPIO 6-11, do not put outputs on input-only pins (34-39), do not double-assign pins.'
      ]
    }
  ]
});
