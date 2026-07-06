// Level 9 — The Raspberry Pi Deep Dive
EST.registerLevel({
  id: 9,
  title: 'The Raspberry Pi Deep Dive',
  whyItMatters: 'The Raspberry Pi is where embedded meets real computing — a full Linux system with GPIO pins. Knowing when to reach for a Pi instead of an MCU (and how to use its GPIO safely) opens up projects that no microcontroller can handle.',
  glossary: ['RPi', 'SBC', 'GPIO', 'firmware'],
  learn:
    '<p>The Raspberry Pi is <b>NOT a microcontroller</b>. It is a full single-board computer (SBC) that runs Linux. This one distinction changes everything about how you develop: you have a filesystem, a package manager, multitasking, networking, and any programming language that compiles on ARM Linux. But it also means higher power draw, longer boot times, and no real-time guarantees.</p>' +

    '<h4>What you get that an MCU does not</h4>' +
    '<div class="example">' +
    '<div class="label">A full Linux computer on a board</div>' +
    '<ul>' +
    '<li><b>Operating system:</b> Raspberry Pi OS (Debian-based), Ubuntu, or many other Linux distros. Full filesystem, apt package manager, systemd services.</li>' +
    '<li><b>Languages:</b> Real CPython (not MicroPython), Node.js, Go, Rust, Java, C/C++ — anything that runs on ARM Linux.</li>' +
    '<li><b>USB ports:</b> Connect keyboards, mice, webcams, USB drives, USB-serial adapters.</li>' +
    '<li><b>HDMI output:</b> Plug in a monitor and you have a desktop. The RPi 5 supports dual 4K displays.</li>' +
    '<li><b>Networking:</b> Gigabit Ethernet, WiFi, Bluetooth — a full TCP/IP stack with sockets, HTTP servers, SSH, and everything else.</li>' +
    '<li><b>GPIO header:</b> 40 pins for hardware control — yes, it is also a hardware platform. This is what makes it special: a Linux computer you can wire up to sensors and actuators.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>RPi 5 Specifications</h4>' +
    '<div class="example">' +
    '<div class="label">The current flagship</div>' +
    '<p><b>CPU:</b> Quad-core ARM Cortex-A76 at 2.4 GHz. This is a proper desktop-class processor — orders of magnitude faster than any MCU.</p>' +
    '<p><b>RAM:</b> 2, 4, 8, or 16 GB LPDDR4X. The 4 GB model ($60) is the sweet spot for most projects; 8 GB ($80) for heavier workloads.</p>' +
    '<p><b>Storage:</b> microSD card (default) or NVMe SSD via the new PCIe 2.0 x1 connector (much faster, more reliable for heavy I/O).</p>' +
    '<p><b>Connectivity:</b> Gigabit Ethernet, WiFi 5 (802.11ac, 2.4 + 5 GHz), Bluetooth 5.0, 2x USB 3.0, 2x USB 2.0.</p>' +
    '<p><b>Display:</b> 2x micro-HDMI (4K60 each).</p>' +
    '<p><b>Power:</b> USB-C, needs a 5V/5A (27W) supply for full performance. Draws 3-7W typical under load.</p>' +
    '<p><b>Price:</b> $60 (4 GB) / $80 (8 GB).</p>' +
    '</div>' +

    '<h4>GPIO on the Raspberry Pi</h4>' +
    '<div class="example">' +
    '<div class="label">40 pins, but not all GPIO</div>' +
    '<p>The 40-pin header includes power pins, ground pins, and GPIO pins:</p>' +
    '<ul>' +
    '<li><b>Power:</b> 2x 5V pins, 2x 3.3V pins, 8x GND pins</li>' +
    '<li><b>GPIO:</b> ~26 usable GPIO pins (BCM numbering)</li>' +
    '<li><b>Special functions:</b> Some pins double as I2C (GPIO 2/3 = SDA/SCL), SPI (GPIO 7-11), UART (GPIO 14/15 = TX/RX)</li>' +
    '</ul>' +

    '<div class="callout">' +
    '<div class="label">CRITICAL: 3.3V logic only!</div>' +
    '<p>All RPi GPIO pins are <b>3.3V logic and are NOT 5V tolerant</b>. Applying 5V to any GPIO pin will permanently damage the Pi. There are no protection diodes, no forgiveness. If you have a 5V sensor, use a voltage divider or level shifter to bring the signal down to 3.3V before connecting it to a GPIO pin.</p>' +
    '</div>' +

    '<p><b>Python with gpiozero (the easy way):</b></p>' +
    '<pre>from gpiozero import LED, Button\nfrom signal import pause\n\nled = LED(17)         # GPIO 17 as output\nbtn = Button(27)      # GPIO 27 as input (internal pull-up)\n\nbtn.when_pressed = led.on\nbtn.when_released = led.off\n\npause()  # keep the script running, events handle the rest</pre>' +
    '<p>The <code class="inline">gpiozero</code> library is event-driven — you assign callbacks instead of polling in a loop. This is the Pythonic, recommended approach.</p>' +

    '<p><b>Lower-level with RPi.GPIO:</b></p>' +
    '<pre>import RPi.GPIO as GPIO\nimport time\n\nGPIO.setmode(GPIO.BCM)\nGPIO.setup(17, GPIO.OUT)\nGPIO.setup(27, GPIO.IN, pull_up_down=GPIO.PUD_UP)\n\nwhile True:\n    if GPIO.input(27) == GPIO.LOW:   # button pressed\n        GPIO.output(17, GPIO.HIGH)   # LED on\n    else:\n        GPIO.output(17, GPIO.LOW)\n    time.sleep(0.01)</pre>' +
    '</div>' +

    '<h4>I2C and SPI on the Pi</h4>' +
    '<div class="example">' +
    '<div class="label">Enable via raspi-config</div>' +
    '<p>I2C and SPI are disabled by default on the RPi. Enable them:</p>' +
    '<pre>sudo raspi-config\n# Navigate to: Interface Options -> I2C -> Enable\n# Navigate to: Interface Options -> SPI -> Enable</pre>' +
    '<p>Then use <code class="inline">smbus2</code> for I2C or <code class="inline">spidev</code> for SPI in Python. Even better: Adafruit provides <code class="inline">adafruit-circuitpython-*</code> libraries that work on both RPi and CircuitPython MCUs — same API, same code.</p>' +
    '<pre># I2C example with smbus2\nimport smbus2\nbus = smbus2.SMBus(1)  # I2C bus 1\ndata = bus.read_byte_data(0x76, 0xD0)  # read register from BME280\nprint(hex(data))</pre>' +
    '</div>' +

    '<h4>When to use RPi vs ESP32</h4>' +
    '<div class="example">' +
    '<div class="label">The decision framework</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:0.9em;">' +
    '<tr style="border-bottom:1px solid #3a4256;">' +
    '<th style="text-align:left;padding:4px;">Requirement</th>' +
    '<th style="text-align:left;padding:4px;">Best choice</th>' +
    '<th style="text-align:left;padding:4px;">Why</th></tr>' +
    '<tr><td style="padding:4px;">Battery power, deep sleep</td><td style="padding:4px;">ESP32</td><td style="padding:4px;">10 uA deep sleep vs 3-7W always-on</td></tr>' +
    '<tr><td style="padding:4px;">WiFi thermostat</td><td style="padding:4px;">ESP32</td><td style="padding:4px;">Read sensor, send data, sleep. No Linux needed.</td></tr>' +
    '<tr><td style="padding:4px;">Camera + OpenCV</td><td style="padding:4px;">RPi</td><td style="padding:4px;">Image processing needs real CPU + RAM + USB camera</td></tr>' +
    '<tr><td style="padding:4px;">Web dashboard (Flask/Node)</td><td style="padding:4px;">RPi</td><td style="padding:4px;">Full HTTP server, templates, database</td></tr>' +
    '<tr><td style="padding:4px;">Home automation hub</td><td style="padding:4px;">RPi</td><td style="padding:4px;">Node-RED, Home Assistant, MQTT broker</td></tr>' +
    '<tr><td style="padding:4px;">Real-time (us precision)</td><td style="padding:4px;">ESP32</td><td style="padding:4px;">Linux is not real-time. Kernel can pause your code.</td></tr>' +
    '<tr><td style="padding:4px;">Cost matters ($5 vs $60)</td><td style="padding:4px;">ESP32</td><td style="padding:4px;">12x cheaper for simple tasks</td></tr>' +
    '<tr><td style="padding:4px;">Docker containers</td><td style="padding:4px;">RPi</td><td style="padding:4px;">Full Linux + Docker. MCUs cannot run containers.</td></tr>' +
    '</table>' +
    '</div>' +

    '<h4>RPi as a server</h4>' +
    '<div class="example">' +
    '<div class="label">Popular always-on services</div>' +
    '<p>Many people use the Raspberry Pi as a low-power home server running 24/7 at ~5W (vs 50-200W for a desktop). Popular uses:</p>' +
    '<ul>' +
    '<li><b>Pi-hole:</b> DNS-level ad blocker for your entire network.</li>' +
    '<li><b>Home Assistant:</b> Open-source home automation platform. Controls lights, thermostats, cameras.</li>' +
    '<li><b>OctoPrint:</b> 3D printer control and monitoring via web interface.</li>' +
    '<li><b>Media server:</b> Plex, Jellyfin, or Kodi for streaming media to your TV.</li>' +
    '<li><b>MQTT broker:</b> Mosquitto running on RPi as the central hub for all your ESP32 sensor nodes.</li>' +
    '</ul>' +
    '<p>The RPi 5 with an NVMe SSD is fast enough for all of these simultaneously.</p>' +
    '</div>' +

    '<div class="callout">' +
    '<div class="label">The best of both worlds</div>' +
    '<p>Many projects combine both: ESP32 nodes around the house reading sensors and publishing to MQTT, with a Raspberry Pi as the central server running Mosquitto (MQTT broker) + Node-RED (automation logic) + Grafana (dashboards). The ESP32s are cheap, low-power edge devices. The Pi is the brain.</p>' +
    '</div>',

  mountPlay: function (container) {
    var scenarios = [
      { name: 'WiFi thermostat', desc: 'Read a temperature sensor every 5 minutes, send reading to a cloud dashboard, sleep between readings.', best: 'ESP32', reason: 'Simple sensor reading + WiFi. Deep sleep between readings saves battery. No Linux needed.' },
      { name: 'Security camera with face detection', desc: 'USB camera captures video, runs face detection AI, sends alerts on detection.', best: 'Raspberry Pi', reason: 'OpenCV face detection needs real CPU power, RAM, and USB camera support. ESP32-CAM exists but is too slow for real face detection.' },
      { name: 'LED strip controller', desc: 'Control WS2812B LEDs with patterns and animations. WiFi control from phone app.', best: 'ESP32', reason: 'NeoPixel control is simple GPIO. WiFi for phone control. No Linux needed. Cheaper and lower power.' },
      { name: 'Home automation dashboard', desc: 'Run Home Assistant with a web interface, control Zigbee/Z-Wave devices, automations, and a database.', best: 'Raspberry Pi', reason: 'Home Assistant needs Python, a database, web server, and multiple protocol bridges. Full Linux required.' },
      { name: 'Weather station (outdoor sensor)', desc: 'Battery-powered: read BME280, send data via WiFi every 15 min, solar-charged.', best: 'ESP32', reason: 'Battery + solar = low power is critical. ESP32 deep sleep (10 uA) is perfect. Pi would drain the battery in hours.' },
      { name: 'Retro game emulator', desc: 'Run NES/SNES/N64 emulators with HDMI output and USB controllers.', best: 'Raspberry Pi', reason: 'Emulators need CPU power, RAM, HDMI output, and USB controller support. RPi with RetroPie is the standard setup.' },
      { name: 'Soil moisture alert system', desc: 'Monitor soil moisture, send a phone notification when it is too dry.', best: 'ESP32', reason: 'Read analog sensor, compare to threshold, send WiFi notification. Sleep between checks. Simple task, low power.' },
      { name: 'Network ad blocker (Pi-hole)', desc: 'DNS server that blocks ads for every device on your network.', best: 'Raspberry Pi', reason: 'Runs a DNS server (dnsmasq), needs networking stack, web admin UI, and 24/7 reliability. Full Linux required.' },
      { name: 'Balancing robot', desc: 'Two-wheeled robot that stays upright using an MPU-6050 gyroscope and PID control, with real-time motor adjustments.', best: 'ESP32', reason: 'Needs microsecond-level real-time PID loop. Linux is not real-time — the kernel can pause your code for 10-50ms, causing the robot to fall. ESP32 has deterministic timing.' },
      { name: '3D printer controller (OctoPrint)', desc: 'Web interface to control a 3D printer, monitor via webcam, manage print jobs.', best: 'Raspberry Pi', reason: 'OctoPrint is a Python web app needing Flask, webcam streaming, and serial communication. Full Linux required.' }
    ];

    container.innerHTML =
      '<p class="muted">Click a project to see which board is best and why.</p>' +
      '<div class="chip-row" id="est-rpi-row" style="flex-wrap:wrap;"></div>' +
      '<div id="est-rpi-detail" class="formula-box" style="margin-top:12px;min-height:120px;">' +
      'Select a project above to see the recommended board.</div>';

    var row = container.querySelector('#est-rpi-row');
    var detail = container.querySelector('#est-rpi-detail');

    scenarios.forEach(function (sc) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = sc.name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');

        var boardColor = sc.best === 'ESP32' ? '#7ab7ff' : '#a78bfa';
        detail.innerHTML =
          '<div><b>' + sc.name + '</b></div>' +
          '<div class="info-line" style="margin-top:6px;"><span class="key">Task:</span> <span class="val">' + sc.desc + '</span></div>' +
          '<div class="info-line"><span class="key">Best board:</span> <span class="val" style="color:' + boardColor + ';font-weight:bold;">' + sc.best + '</span></div>' +
          '<div class="info-line"><span class="key">Why:</span> <span class="val">' + sc.reason + '</span></div>';
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want to run a <b>Python Flask web server</b> that serves a dashboard showing sensor data, with charts rendered server-side. Which board?</p>',
      mountInput: function (container) {
        var opts = ['Arduino Uno', 'ESP32', 'Raspberry Pi Pico', 'Raspberry Pi'];
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
        if (v === 'Raspberry Pi') return { correct: true, feedback: 'Correct! Flask is a full Python web framework that needs CPython, pip, Jinja2 templates, and enough RAM for HTTP connections. Only a Raspberry Pi (running Linux) can handle this. MCUs do not run Flask.' };
        if (v === 'ESP32') return { correct: false, feedback: 'The ESP32 can run a basic HTTP server in MicroPython, but it cannot run Flask (which requires full CPython, pip packages, and significant RAM). For a real web dashboard with server-side rendering, you need a Raspberry Pi.' };
        if (v === 'Raspberry Pi Pico') return { correct: false, feedback: 'The Pico is an MCU, not a Linux computer. It runs MicroPython but cannot run Flask or serve complex web pages. The Raspberry Pi (the SBC, not the Pico) is what you need.' };
        return { correct: false, feedback: 'The Arduino Uno has 2 KB of RAM and no networking. You need a Raspberry Pi — a full Linux computer that can run Python, Flask, and serve web pages.' };
      },
      hints: [
        'Flask requires full CPython (not MicroPython), pip for package management, and enough RAM for web connections.',
        'Which boards run a full operating system? Only SBCs run Linux — MCUs run bare metal or MicroPython.',
        'The Raspberry Pi runs Linux and can install Flask via pip. No MCU can do this.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>RPi GPIO pins use <b>3.3V logic</b>. You have a sensor that outputs <b>5V HIGH</b>. How do you safely connect it to a GPIO input pin? Choose the best approach.</p>',
      mountInput: function (container) {
        var opts = [
          'Connect directly — RPi can handle 5V',
          'Add a 1k resistor in series',
          'Use a voltage divider (two resistors)',
          'Use a capacitor to filter the voltage'
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
        if (v === 'Use a voltage divider (two resistors)') return { correct: true, feedback: 'Correct! A voltage divider with two resistors steps 5V down to 3.3V or less. For example, R1 = 1k and R2 = 2k gives Vout = 5 x 2k / (1k + 2k) = 3.33V — safe for the Pi. A bidirectional level shifter also works, especially if you need two-way communication.' };
        if (v === 'Connect directly — RPi can handle 5V') return { correct: false, feedback: 'WRONG — the RPi GPIO pins are NOT 5V tolerant! Applying 5V to a GPIO pin will permanently damage the Raspberry Pi. There are no internal protection diodes. You need a voltage divider or level shifter.' };
        if (v === 'Add a 1k resistor in series') return { correct: false, feedback: 'A series resistor limits current but does NOT reduce the voltage. The GPIO pin would still see ~5V through the internal ESD diodes (which are not designed for continuous current). Use a voltage divider (two resistors) to actually step the voltage down to 3.3V.' };
        return { correct: false, feedback: 'A capacitor filters AC noise but does not reduce DC voltage. You need a voltage divider (two resistors in series, with the midpoint connected to GPIO) to step 5V down to 3.3V.' };
      },
      hints: [
        'The Pi GPIO is NOT 5V tolerant. You need to reduce 5V to 3.3V before it reaches the pin.',
        'A single resistor limits current but does not change voltage. You need two resistors arranged as a voltage divider.',
        'Voltage divider: R1 (top, to 5V) and R2 (bottom, to GND), with the midpoint going to GPIO. Vout = 5V x R2 / (R1 + R2). Pick R1=1k, R2=2k for ~3.3V out.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Design a <b>home security system</b>. It needs:</p>' +
              '<ol>' +
              '<li>PIR motion detection</li>' +
              '<li>Camera that takes a photo on motion</li>' +
              '<li>Sends a notification via WiFi</li>' +
              '<li>Runs 24/7 on wall power</li>' +
              '</ol>' +
              '<p><b>Part A:</b> Which board is best for this system?</p>' +
              '<p><b>Part B:</b> If the requirements change to <i>battery-powered, no camera, just PIR + WiFi notification</i> — which board then?</p>',
      mountInput: function (container) {
        var opts = ['Arduino Uno', 'ESP32', 'Raspberry Pi Pico', 'Raspberry Pi'];

        var row1 = document.createElement('div');
        row1.style.marginBottom = '8px';
        var label1 = document.createElement('span');
        label1.textContent = 'Part A (camera + 24/7): ';
        label1.style.display = 'inline-block';
        label1.style.width = '220px';
        var sel1 = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          sel1.appendChild(opt);
        });
        row1.appendChild(label1);
        row1.appendChild(sel1);

        var row2 = document.createElement('div');
        var label2 = document.createElement('span');
        label2.textContent = 'Part B (battery, no camera): ';
        label2.style.display = 'inline-block';
        label2.style.width = '220px';
        var sel2 = document.createElement('select');
        opts.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          sel2.appendChild(opt);
        });
        row2.appendChild(label2);
        row2.appendChild(sel2);

        container.appendChild(row1);
        container.appendChild(row2);
        return function () { return { partA: sel1.value, partB: sel2.value }; };
      },
      check: function (v) {
        var aCorrect = v.partA === 'Raspberry Pi';
        var bCorrect = v.partB === 'ESP32';

        if (aCorrect && bCorrect) return { correct: true, feedback: 'Correct on both! Part A: Raspberry Pi — a camera with photo capture and image processing needs Linux, USB camera support, and enough CPU/RAM. Push notifications are easy with Python libraries. Wall power means battery life is not a concern. Part B: ESP32 — PIR + WiFi notification is trivially simple for an ESP32. Deep sleep between events extends battery life to months. No camera means no need for Linux.' };
        if (!aCorrect && bCorrect) return { correct: false, feedback: 'Part B is right (ESP32). But Part A needs a Raspberry Pi — capturing photos from a camera requires USB camera support, image processing libraries (like picamera2 or OpenCV), and enough RAM. Only a Linux SBC can do this.' };
        if (aCorrect && !bCorrect) return { correct: false, feedback: 'Part A is right (Raspberry Pi). But Part B should be ESP32 — without a camera, the task is just "detect motion, send WiFi notification." The ESP32 handles that easily, and deep sleep makes it battery-friendly. A Pi would drain the battery in hours.' };
        return { correct: false, feedback: 'Both need fixing. Part A: Raspberry Pi (camera + image processing = Linux needed, wall power = battery not a concern). Part B: ESP32 (PIR + WiFi is simple, deep sleep = long battery life, no camera = no need for Linux).' };
      },
      hints: [
        'Part A needs a camera. Which boards can connect a USB camera and process images? Part B has no camera but needs battery life.',
        'Camera + image processing = Linux (RPi). Simple sensor + WiFi with battery = MCU with deep sleep (ESP32).',
        'Part A: Raspberry Pi (camera + push notifications + 24/7 on wall power). Part B: ESP32 (PIR is one digital pin, WiFi notification is simple, deep sleep for battery).'
      ]
    }
  ]
});
