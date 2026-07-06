// Level 7 — Serial Protocols: UART, I2C, SPI
EST.registerLevel({
  id: 7,
  title: 'Serial Protocols: UART, I2C, SPI',
  whyItMatters: 'Every sensor, display, and module you connect to an MCU speaks one of these three protocols. If you do not understand UART, I2C, and SPI, you cannot read a datasheet, debug a wiring issue, or pick the right bus for your project.',
  glossary: ['UART', 'I2C', 'SPI', 'pull-up', 'I2C address'],
  learn:
    '<p>MCUs talk to sensors, displays, and other MCUs over <b>serial protocols</b> — sending data one bit at a time over wires. This sounds slow compared to a 64-bit-wide memory bus inside your laptop, but for embedded peripherals it is plenty fast and uses very few wires (which matters when you only have 20-40 GPIO pins).</p>' +
    '<p>Three protocols cover about 95% of all embedded communication. Learn these three and you can wire up almost anything.</p>' +

    '<h4>UART (Universal Asynchronous Receiver/Transmitter)</h4>' +
    '<div class="example">' +
    '<div class="label">The simplest serial protocol</div>' +
    '<p><b>Wires:</b> 2 — TX (transmit) and RX (receive). You cross them: MCU TX connects to the sensor RX, and MCU RX connects to sensor TX. Think of it like two people talking face-to-face — my mouth (TX) goes to your ear (RX).</p>' +
    '<p><b>Clock:</b> None. UART is <i>asynchronous</i> — there is no shared clock wire. Both sides must agree on the <b>baud rate</b> (bits per second) ahead of time. Common baud rates: 9600 (slow, reliable), 115200 (fast, standard for debug consoles). If the baud rates do not match, you get garbage characters.</p>' +
    '<p><b>Topology:</b> Point-to-point. One TX talks to one RX. If you need to connect 4 UART devices to one MCU, you need 4 separate UART ports (8 wires total).</p>' +
    '<p><b>Framing:</b> Each byte is sent as: 1 start bit + 8 data bits + 1 stop bit = 10 bits per byte. So 115200 baud gives you ~11,520 bytes per second.</p>' +
    '<p><b>Common uses:</b> GPS modules (NMEA sentences), Bluetooth modules (HC-05), debug/serial console (USB-serial adapters like CP2102), communication between two MCUs.</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>from machine import UART\nuart = UART(2, baudrate=9600, tx=17, rx=16)\nuart.write("Hello\\n")\ndata = uart.readline()  # read until newline</pre>' +
    '</div>' +

    '<h4>I2C (Inter-Integrated Circuit)</h4>' +
    '<div class="example">' +
    '<div class="label">The sensor bus</div>' +
    '<p><b>Wires:</b> 2 — SDA (data) and SCL (clock). Both lines need <b>pull-up resistors</b> (4.7k ohm typical) to VCC. The pull-ups are essential because I2C uses "open-drain" drivers — devices can pull lines LOW but cannot drive them HIGH. The resistors pull the lines HIGH by default, and devices pull them LOW to transmit a 0 bit.</p>' +
    '<p>Many MCUs have internal pull-ups you can enable in code, but external 4.7k resistors are more reliable, especially with long wires or many devices on the bus.</p>' +
    '<p><b>Clock:</b> Yes — SCL is the clock, driven by the master (your MCU). This makes I2C <i>synchronous</i>.</p>' +
    '<p><b>Topology:</b> Bus — multiple devices share the same 2 wires. Each device has a unique <b>7-bit address</b> (0x00 to 0x7F). The master sends the address first, and only the device with that address responds. Up to 112 usable addresses (16 are reserved).</p>' +
    '<p><b>Duplex:</b> Half-duplex — data travels one direction at a time on the single SDA line.</p>' +
    '<p><b>Speed:</b> 100 kHz (standard mode), 400 kHz (fast mode). Slow compared to SPI, but fast enough for most sensors.</p>' +
    '<p><b>Common uses:</b> Sensors (BME280 at 0x76, MPU-6050 at 0x68), OLED displays (SSD1306 at 0x3C), EEPROMs, real-time clocks (DS3231).</p>' +
    '<p><b>Scanning for devices:</b> You can discover all devices on the bus:</p>' +
    '<pre>from machine import I2C, Pin\ni2c = I2C(0, sda=Pin(21), scl=Pin(22), freq=400000)\ndevices = i2c.scan()\nfor d in devices:\n    print("Found device at address:", hex(d))</pre>' +
    '<p>This is one of the first things to do when debugging I2C — if <code class="inline">i2c.scan()</code> returns an empty list, check your wiring and pull-ups.</p>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">I2C address conflicts</div>' +
    '<p>What happens if you want two BME280 sensors on the same I2C bus? They have the same default address (0x76). Some devices have an address pin (SDO/A0) that you can pull HIGH or LOW to select between two addresses (0x76 or 0x77). If you need more, you need an I2C multiplexer (like TCA9548A) that lets you switch between 8 separate I2C buses.</p>' +
    '</div>' +

    '<h4>SPI (Serial Peripheral Interface)</h4>' +
    '<div class="example">' +
    '<div class="label">The speed demon</div>' +
    '<p><b>Wires:</b> 4 base wires + 1 extra per additional device:</p>' +
    '<ul>' +
    '<li><b>MOSI</b> — Master Out, Slave In (data from MCU to device)</li>' +
    '<li><b>MISO</b> — Master In, Slave Out (data from device to MCU)</li>' +
    '<li><b>SCLK</b> — Serial Clock (driven by master)</li>' +
    '<li><b>CS/SS</b> — Chip Select (one per device — pulled LOW to activate that device)</li>' +
    '</ul>' +
    '<p><b>Clock:</b> Yes — SCLK is driven by the master. Synchronous.</p>' +
    '<p><b>Topology:</b> Bus with chip-select lines. MOSI, MISO, and SCLK are shared by all devices. Each device gets its own CS line — the master pulls the CS LOW for the device it wants to talk to, and all other devices ignore the bus.</p>' +
    '<p><b>Duplex:</b> Full-duplex — MOSI and MISO carry data simultaneously in both directions.</p>' +
    '<p><b>Speed:</b> 1-80 MHz clock typical. At 10 MHz, that is 1.25 MB/sec — 100x faster than I2C standard mode. This is why SPI is used for displays and SD cards.</p>' +
    '<p><b>Common uses:</b> SD cards, TFT displays (ILI9341), LoRa radio modules (SX1276), fast ADCs, flash memory.</p>' +
    '<p><b>Downside:</b> Needs more wires. 1 device = 4 wires. 3 devices = 4 + 2 extra CS = 6 wires (MOSI, MISO, SCLK are shared, but each device needs its own CS).</p>' +
    '<p><b>MicroPython example:</b></p>' +
    '<pre>from machine import SPI, Pin\nspi = SPI(1, baudrate=10000000, polarity=0, phase=0,\n          sck=Pin(18), mosi=Pin(23), miso=Pin(19))\ncs = Pin(5, Pin.OUT)\ncs.off()                # select device (active LOW)\nspi.write(b"\\x9F")      # send a command\ndata = spi.read(3)      # read 3 bytes back\ncs.on()                 # deselect device</pre>' +
    '</div>' +

    '<h4>Comparison table</h4>' +
    '<div class="example">' +
    '<div class="label">UART vs I2C vs SPI at a glance</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.92em;">' +
    '<tr style="border-bottom:1px solid #3a4256;">' +
    '<th style="text-align:left;padding:6px;">Feature</th>' +
    '<th style="text-align:left;padding:6px;">UART</th>' +
    '<th style="text-align:left;padding:6px;">I2C</th>' +
    '<th style="text-align:left;padding:6px;">SPI</th></tr>' +
    '<tr><td style="padding:6px;">Wires</td><td style="padding:6px;">2 (TX, RX)</td><td style="padding:6px;">2 (SDA, SCL)</td><td style="padding:6px;">4 + 1/device</td></tr>' +
    '<tr><td style="padding:6px;">Clock</td><td style="padding:6px;">None (async)</td><td style="padding:6px;">SCL (sync)</td><td style="padding:6px;">SCLK (sync)</td></tr>' +
    '<tr><td style="padding:6px;">Speed</td><td style="padding:6px;">~115 kbps</td><td style="padding:6px;">100-400 kbps</td><td style="padding:6px;">1-80 Mbps</td></tr>' +
    '<tr><td style="padding:6px;">Duplex</td><td style="padding:6px;">Full</td><td style="padding:6px;">Half</td><td style="padding:6px;">Full</td></tr>' +
    '<tr><td style="padding:6px;">Devices</td><td style="padding:6px;">1 per port</td><td style="padding:6px;">Up to 112</td><td style="padding:6px;">Limited by CS pins</td></tr>' +
    '<tr><td style="padding:6px;">Addressing</td><td style="padding:6px;">None</td><td style="padding:6px;">7-bit address</td><td style="padding:6px;">CS pin per device</td></tr>' +
    '<tr><td style="padding:6px;">Best for</td><td style="padding:6px;">Debug, GPS, BT</td><td style="padding:6px;">Sensors, OLED</td><td style="padding:6px;">Displays, SD, fast</td></tr>' +
    '</table>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">How to pick a protocol</div>' +
    '<p>You usually do not get to pick — the sensor or module dictates the protocol. But when designing a system:</p>' +
    '<ul>' +
    '<li><b>Many slow sensors?</b> I2C — 2 wires for all of them.</li>' +
    '<li><b>Need speed (display, SD card)?</b> SPI.</li>' +
    '<li><b>Talking to a GPS or Bluetooth module?</b> UART — it is what they speak.</li>' +
    '<li><b>Running out of pins?</b> I2C uses the fewest. SPI uses the most.</li>' +
    '</ul>' +
    '</div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;
    var protocols = lib.PROTOCOLS;
    var names = ['UART', 'I2C', 'SPI'];

    var codeExamples = {
      'UART': 'from machine import UART\n\nuart = UART(2, baudrate=115200, tx=17, rx=16)\nuart.write("Hello\\n")\nresponse = uart.readline()\nprint(response)',
      'I2C': 'from machine import I2C, Pin\n\ni2c = I2C(0, sda=Pin(21), scl=Pin(22), freq=400000)\ndevices = i2c.scan()\nfor addr in devices:\n    print("Device at", hex(addr))\n\n# Read 2 bytes from device at 0x76, register 0xD0\ndata = i2c.readfrom_mem(0x76, 0xD0, 2)',
      'SPI': 'from machine import SPI, Pin\n\nspi = SPI(1, baudrate=10000000,\n          sck=Pin(18), mosi=Pin(23), miso=Pin(19))\ncs = Pin(5, Pin.OUT)\n\ncs.off()              # select device\nspi.write(b"\\x9F")    # send command\ndata = spi.read(3)    # read response\ncs.on()               # deselect'
    };

    var diagrams = {
      'UART': 'MCU             Sensor\n TX  ---------->  RX\n RX  <----------  TX\n GND -----------  GND\n\nNo clock wire. Both sides must agree on baud rate.\nCross the wires: TX to RX, RX to TX.',
      'I2C': 'VCC ---[4.7k]---+---[4.7k]--- VCC\n                |             |\n MCU SDA -------+--+--+--+    |\n MCU SCL -----------+--+--+---+\n                   |  |  |\n                  Dev1 Dev2 Dev3\n                  0x76 0x3C 0x68\n\nAll devices share SDA + SCL.\nPull-up resistors keep lines HIGH by default.',
      'SPI': 'MCU               Dev1    Dev2\n MOSI -----------> MOSI    MOSI\n MISO <----------- MISO    MISO\n SCLK -----------> SCLK    SCLK\n CS1  -----------> CS\n CS2  ----------------------> CS\n\nMOSI, MISO, SCLK shared. One CS per device.\nPull CS LOW to select, HIGH to deselect.'
    };

    container.innerHTML =
      '<p class="muted">Click a protocol to see its wiring diagram, speed, and code example.</p>' +
      '<div class="chip-row" id="est-proto-row"></div>' +
      '<div id="est-proto-detail" class="formula-box" style="margin-top:12px;min-height:200px;">' +
      'Select a protocol above.</div>';

    var row = container.querySelector('#est-proto-row');
    var detail = container.querySelector('#est-proto-detail');

    names.forEach(function (name) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');

        var p = protocols[name];
        var lines = [
          '<div><b>' + name + '</b></div>',
          '<div class="info-line"><span class="key">Wires:</span> <span class="val">' + p.wires + '</span></div>',
          '<div class="info-line"><span class="key">Speed:</span> <span class="val">' + p.speed + '</span></div>',
          '<div class="info-line"><span class="key">Topology:</span> <span class="val">' + p.topology + '</span></div>',
          '<div class="info-line"><span class="key">Duplex:</span> <span class="val">' + p.duplex + '</span></div>',
          '<div class="info-line"><span class="key">Notes:</span> <span class="val">' + p.notes + '</span></div>',
          '<div style="margin-top:10px;"><b>Wiring diagram:</b></div>',
          '<pre style="font-size:0.85em;">' + diagrams[name] + '</pre>',
          '<div style="margin-top:8px;"><b>MicroPython (ESP32):</b></div>',
          '<pre>' + codeExamples[name] + '</pre>'
        ];
        detail.innerHTML = lines.join('');
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want to connect <b>4 sensors</b> to an ESP32 using the <b>fewest wires possible</b>. Which protocol should you use?</p>',
      mountInput: function (container) {
        var opts = ['UART', 'I2C', 'SPI'];
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
        if (v === 'I2C') return { correct: true, feedback: 'Correct! I2C uses just 2 wires (SDA + SCL) for ALL devices on the bus. Each device has its own address, so 4 sensors share those same 2 wires. UART would need 2 wires per device (8 total). SPI would need 4 + 3 extra CS wires (7 total).' };
        if (v === 'UART') return { correct: false, feedback: 'UART is point-to-point — each device needs its own TX/RX pair. 4 devices = 8 wires. I2C can connect all 4 on just 2 wires (SDA + SCL) using addresses.' };
        return { correct: false, feedback: 'SPI shares MOSI, MISO, and SCLK, but needs a separate CS wire per device. For 4 devices: 3 shared + 4 CS = 7 wires. I2C does it with just 2 wires total.' };
      },
      hints: [
        'Think about how each protocol handles multiple devices. UART is 1-to-1, SPI needs a chip select per device, I2C uses addresses.',
        'UART: 2 wires per device = 8 total. SPI: 3 shared + 1 CS each = 7 total. I2C: 2 shared for everyone.',
        'I2C — just 2 wires (SDA + SCL) for up to 112 devices, each with its own address.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>At <b>115200 baud</b> with UART (10 bits per byte: 1 start + 8 data + 1 stop), how many <b>bytes per second</b> can you send? How long does it take to transfer <b>1 KB</b> (1024 bytes)?</p>',
      mountInput: function (container) {
        var row1 = document.createElement('div');
        row1.style.marginBottom = '8px';
        var label1 = document.createElement('span');
        label1.textContent = 'Bytes per second: ';
        var inp1 = document.createElement('input');
        inp1.type = 'text';
        inp1.placeholder = 'e.g. 11520';
        inp1.style.width = '120px';
        row1.appendChild(label1);
        row1.appendChild(inp1);

        var row2 = document.createElement('div');
        var label2 = document.createElement('span');
        label2.textContent = 'Time for 1 KB: ';
        var inp2 = document.createElement('input');
        inp2.type = 'text';
        inp2.placeholder = 'e.g. 89';
        inp2.style.width = '80px';
        var unit2 = document.createElement('span');
        unit2.textContent = ' ms';
        row2.appendChild(label2);
        row2.appendChild(inp2);
        row2.appendChild(unit2);

        container.appendChild(row1);
        container.appendChild(row2);
        return function () { return { bps: inp1.value.trim(), ms: inp2.value.trim() }; };
      },
      check: function (v) {
        var bps = parseFloat(v.bps);
        var ms = parseFloat(v.ms);
        var bpsOk = !isNaN(bps) && bps >= 11500 && bps <= 11600;
        // 1024 / 11520 = 0.08889s = 88.89ms
        var msOk = !isNaN(ms) && ms >= 88 && ms <= 90;

        if (bpsOk && msOk) return { correct: true, feedback: 'Correct! 115200 baud / 10 bits per byte = 11,520 bytes/sec. Time for 1 KB = 1024 / 11520 = 0.0889 seconds = ~89 ms.' };
        if (bpsOk && !msOk) return { correct: false, feedback: 'Bytes/sec is right (11,520). But the time is off. 1024 bytes / 11,520 bytes/sec = 0.0889 seconds = ~89 ms.' };
        if (!bpsOk && msOk) return { correct: false, feedback: 'Time is right (~89 ms). But bytes/sec is off. 115200 baud / 10 bits per byte = 11,520 bytes/sec.' };
        return { correct: false, feedback: 'Both need work. Baud = bits per second, and each byte takes 10 bits (1 start + 8 data + 1 stop). So: 115200 / 10 = 11,520 bytes/sec. Time = 1024 / 11520 = ~89 ms.' };
      },
      hints: [
        'Baud rate is bits per second. Each byte takes 10 bits on the wire (1 start + 8 data + 1 stop). Divide baud by 10.',
        '115200 / 10 = 11,520 bytes per second. Now divide 1024 bytes by that rate to get seconds.',
        '11,520 bytes/sec. Time = 1024 / 11520 = 0.0889 seconds = 89 ms.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You need to connect these three devices to <b>one ESP32</b>:</p>' +
              '<ul>' +
              '<li>BME280 sensor (I2C)</li>' +
              '<li>GPS module (UART)</li>' +
              '<li>SD card (SPI)</li>' +
              '</ul>' +
              '<p>How many <b>total GPIO pins</b> do you need? List the protocol for each device.</p>',
      mountInput: function (container) {
        var items = [
          { label: 'BME280 protocol:', opts: ['UART', 'I2C', 'SPI'] },
          { label: 'GPS protocol:', opts: ['UART', 'I2C', 'SPI'] },
          { label: 'SD card protocol:', opts: ['UART', 'I2C', 'SPI'] }
        ];
        var selects = [];
        items.forEach(function (item) {
          var row = document.createElement('div');
          row.style.marginBottom = '6px';
          var label = document.createElement('span');
          label.textContent = item.label + ' ';
          label.style.display = 'inline-block';
          label.style.width = '160px';
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

        var pinRow = document.createElement('div');
        pinRow.style.marginTop = '10px';
        var pinLabel = document.createElement('span');
        pinLabel.textContent = 'Total GPIO pins needed: ';
        var pinInp = document.createElement('input');
        pinInp.type = 'text';
        pinInp.placeholder = 'e.g. 8';
        pinInp.style.width = '60px';
        pinRow.appendChild(pinLabel);
        pinRow.appendChild(pinInp);
        container.appendChild(pinRow);

        return function () {
          return {
            bme: selects[0].value,
            gps: selects[1].value,
            sd: selects[2].value,
            pins: pinInp.value.trim()
          };
        };
      },
      check: function (v) {
        var wrong = [];
        if (v.bme !== 'I2C') wrong.push('BME280 uses I2C (SDA + SCL)');
        if (v.gps !== 'UART') wrong.push('GPS uses UART (TX + RX)');
        if (v.sd !== 'SPI') wrong.push('SD card uses SPI (MOSI + MISO + SCLK + CS)');

        var pins = parseInt(v.pins, 10);
        var pinsOk = pins === 8;

        if (wrong.length === 0 && pinsOk) {
          return { correct: true, feedback: 'Correct! BME280 = I2C (2 pins: SDA, SCL). GPS = UART (2 pins: TX, RX). SD card = SPI (4 pins: MOSI, MISO, SCLK, CS). Total = 2 + 2 + 4 = 8 GPIO pins. Note: if you added another I2C device (like an OLED), it would share the same SDA/SCL — no extra pins!' };
        }
        if (wrong.length === 0 && !pinsOk) {
          return { correct: false, feedback: 'Protocols are correct! But the pin count is off. I2C = 2 pins (SDA, SCL). UART = 2 pins (TX, RX). SPI = 4 pins (MOSI, MISO, SCLK, CS). Total = 2 + 2 + 4 = 8 pins.' };
        }
        return { correct: false, feedback: 'Not quite. ' + wrong.join('. ') + '. Pin count: I2C = 2 (SDA + SCL), UART = 2 (TX + RX), SPI = 4 (MOSI + MISO + SCLK + CS). Total = 8.' };
      },
      hints: [
        'The question already tells you which protocol each device uses. Count the wires for each protocol.',
        'I2C = 2 wires (SDA + SCL). UART = 2 wires (TX + RX). SPI = 4 wires (MOSI + MISO + SCLK + CS). Add them up.',
        'BME280 = I2C (2 pins), GPS = UART (2 pins), SD card = SPI (4 pins). Total = 8 GPIO pins.'
      ]
    }
  ]
});
