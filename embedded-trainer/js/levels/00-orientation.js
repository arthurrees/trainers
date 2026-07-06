// Level 0 — Orientation
EST.registerLevel({
  id: 0,
  title: 'Orientation',
  whyItMatters: 'Embedded systems are everywhere — your car, your thermostat, your washing machine. Picking the right board for a project is the first real engineering decision you will make.',
  glossary: ['MCU', 'SBC', 'GPIO', 'firmware', 'breadboard'],
  learn:
    '<p>You already know how to write software that runs on a laptop or server. But there is a whole other world of computing: <b>embedded systems</b> — computers that live <i>inside things</i>.</p>' +

    '<h4>What counts as "embedded"?</h4>' +
    '<p>If a device has a processor running code and you would not call it a "computer," it is embedded. Your microwave has one. Your car has dozens. A smart light bulb has one. The Mars rovers have several. Even your USB keyboard has a tiny processor inside it that scans the key matrix 1,000 times per second.</p>' +
    '<p>Embedded systems are the largest category of computers in the world — by a huge margin. For every laptop sold, hundreds of microcontrollers ship.</p>' +

    '<h4>The two families: MCU vs SBC</h4>' +
    '<p>The boards you will work with fall into two broad families:</p>' +
    '<div class="example">' +
    '<div class="label">Microcontroller (MCU)</div>' +
    '<p>A tiny computer on a single chip: CPU + RAM + flash + I/O peripherals, all in one package. No operating system — your code runs in a loop, and it IS the entire system. When you power it on, your code starts running in milliseconds.</p>' +
    '<p>Examples: <b>Arduino Uno</b> (ATmega328P, 16 MHz, 2 KB RAM, 5V), <b>ESP32</b> (dual-core 240 MHz, 520 KB RAM, WiFi + Bluetooth, 3.3V), <b>Raspberry Pi Pico</b> (RP2040, 133 MHz, 264 KB RAM, 3.3V).</p>' +
    '<p>Think of an MCU like a dedicated employee who does one job, does it fast, and never takes a break.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Single-Board Computer (SBC)</div>' +
    '<p>A full computer on one board — runs Linux (or another OS), has USB, HDMI, networking, a filesystem, multitasking. It boots like a PC (takes 10-30 seconds), but once it is up, you can SSH in, run Python scripts, host a web server, or plug in a monitor and use it as a desktop.</p>' +
    '<p>Examples: <b>Raspberry Pi 5</b> (quad-core ARM at 2.4 GHz, 4-8 GB RAM), <b>Raspberry Pi Zero 2 W</b> (quad-core ARM at 1 GHz, 512 MB RAM).</p>' +
    '<p>Think of an SBC like a full employee with a desk, a calendar, and the ability to multitask — powerful, but more overhead.</p>' +
    '</div>' +

    '<h4>When to use which</h4>' +
    '<div class="callout"><div class="label">The decision tree</div>' +
    '<ul>' +
    '<li><b>Need WiFi or Bluetooth?</b> ESP32 or Pico W (MCU) for battery projects. RPi for always-on with power.</li>' +
    '<li><b>Need Linux, HDMI, or heavy processing?</b> Raspberry Pi (SBC). An MCU cannot run a web browser or display a desktop.</li>' +
    '<li><b>Need to run for months on a battery?</b> MCU, absolutely. An ESP32 in deep sleep draws ~10 microamps. A Raspberry Pi draws 2-5 watts continuously.</li>' +
    '<li><b>Just blinking an LED or reading a sensor?</b> Arduino Uno or Pico. Simple, cheap, no overkill.</li>' +
    '<li><b>Need real-time response (microsecond precision)?</b> MCU. Linux is not a real-time OS — it can pause your code for garbage collection, disk writes, or kernel tasks.</li>' +
    '</ul></div>' +

    '<h4>The three boards you will see most in this trainer</h4>' +
    '<div class="example">' +
    '<div class="label">Arduino Uno</div>' +
    '<p>The "Hello World" of embedded. ATmega328P chip, 16 MHz clock, 2 KB RAM, 32 KB flash. Runs at 5V. No WiFi, no Bluetooth. Programmed in C/C++ via the Arduino IDE. Costs ~$25 (or ~$3 for a clone). Best for: learning the basics, simple sensors, and 5V components.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">ESP32</div>' +
    '<p>The IoT workhorse. Dual-core Xtensa at 240 MHz, 520 KB RAM, 4 MB flash. Runs at 3.3V. Has WiFi AND Bluetooth built in. Supports MicroPython, CircuitPython, and Arduino C. Costs ~$5-10. Best for: anything wireless, battery-powered sensors, home automation.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Raspberry Pi 5</div>' +
    '<p>A full Linux computer. Quad-core ARM Cortex-A76 at 2.4 GHz, 4-8 GB RAM, microSD or NVMe storage. Has WiFi, Bluetooth, HDMI, USB, and 40 GPIO pins. Costs ~$60-80. Best for: anything that needs Linux — media servers, machine learning inference, Node-RED dashboards, running Docker containers.</p>' +
    '</div>' +

    '<h4>MicroPython: the beginner-friendly language</h4>' +
    '<p>Traditionally, MCUs were programmed in C. It is fast and efficient, but the learning curve is steep (manual memory management, pointer arithmetic, no built-in strings). <b>MicroPython</b> is a lean implementation of Python 3 that runs directly on MCUs like the ESP32 and Pico. You get a REPL, you can type <code class="inline">print("hello")</code> and see the result immediately over a serial connection. The tradeoff: it is slower and uses more RAM than C, but for most sensor-reading, LED-blinking, WiFi-connecting projects, it is more than fast enough.</p>' +
    '<p>Throughout this trainer, code examples will use MicroPython for ESP32/Pico and Arduino C for the Uno.</p>' +

    '<div class="callout"><div class="label">How to use this trainer</div>' +
    'Each level has three sections: <b>Learn</b> (read the lesson), <b>Play</b> (interact with the sandbox below — no goal, just explore), and <b>Try</b> (3 graded puzzles). When stuck on a puzzle, use the hints — three are always available, and the third nearly gives the answer.</div>',

  mountPlay: function (container) {
    var lib = EST.lib.embed;
    var boards = lib.BOARDS;
    var names = Object.keys(boards);

    container.innerHTML =
      '<p class="muted">Click a board to see its specs. Compare them to pick the right tool for the job.</p>' +
      '<div class="chip-row" id="est-board-row"></div>' +
      '<div id="est-board-detail" class="formula-box" style="margin-top:12px;min-height:120px;">' +
      'Pick a board above to see its full spec sheet.</div>';

    var row = container.querySelector('#est-board-row');
    var detail = container.querySelector('#est-board-detail');

    names.forEach(function (name) {
      var chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = name;
      chip.addEventListener('click', function () {
        var all = row.querySelectorAll('.chip');
        for (var j = 0; j < all.length; j++) all[j].classList.remove('active');
        chip.classList.add('active');

        var b = boards[name];
        var lines = [
          '<div><b>' + name + '</b></div>',
          '<div class="info-line"><span class="key">Chip:</span> <span class="val">' + b.chip + '</span></div>',
          '<div class="info-line"><span class="key">Architecture:</span> <span class="val">' + b.arch + '</span></div>',
          '<div class="info-line"><span class="key">Clock:</span> <span class="val">' + b.clockMhz + ' MHz</span></div>',
          '<div class="info-line"><span class="key">Flash:</span> <span class="val">' + b.flash + '</span></div>',
          '<div class="info-line"><span class="key">RAM:</span> <span class="val">' + b.ram + '</span></div>',
          '<div class="info-line"><span class="key">GPIO pins:</span> <span class="val">' + b.gpio + '</span></div>',
          '<div class="info-line"><span class="key">Analog inputs:</span> <span class="val">' + b.analog + '</span></div>',
          '<div class="info-line"><span class="key">WiFi:</span> <span class="val">' + (b.wifi ? 'Yes' : 'No') + '</span></div>',
          '<div class="info-line"><span class="key">Bluetooth:</span> <span class="val">' + (b.bluetooth ? 'Yes' : 'No') + '</span></div>',
          '<div class="info-line"><span class="key">Runs OS:</span> <span class="val">' + (b.os ? 'Yes (Linux)' : 'No (bare metal)') + '</span></div>',
          '<div class="info-line"><span class="key">Voltage:</span> <span class="val">' + b.voltage + '</span></div>',
          '<div class="info-line"><span class="key">Price:</span> <span class="val">' + b.price + '</span></div>',
          '<div class="info-line"><span class="key">Language:</span> <span class="val">' + b.lang + '</span></div>',
          '<div class="info-line"><span class="key">Best for:</span> <span class="val">' + b.best + '</span></div>'
        ];
        detail.innerHTML = lines.join('');
      });
      row.appendChild(chip);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want to build a <b>WiFi-connected temperature sensor</b> that runs on batteries for months. Which board is the best fit?</p>',
      mountInput: function (container) {
        var opts = ['Arduino Uno', 'ESP32', 'Raspberry Pi 5'];
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
        if (v === 'ESP32') return { correct: true, feedback: 'Right. The ESP32 has built-in WiFi, deep sleep mode (~10 microamps), and costs ~$5. It is the go-to board for battery-powered IoT sensors.' };
        if (v === 'Arduino Uno') return { correct: false, feedback: 'The Arduino Uno has no WiFi. You would need a separate WiFi shield, which adds cost, complexity, and power draw. The ESP32 has WiFi built in.' };
        return { correct: false, feedback: 'The Raspberry Pi 5 draws 2-5 watts continuously and takes 10-30 seconds to boot. It would drain a battery in hours, not months. The ESP32 can deep-sleep at ~10 microamps.' };
      },
      hints: [
        'The project needs WiFi. Which boards have WiFi built in?',
        'Battery life matters. An SBC draws watts; an MCU in deep sleep draws microamps.',
        'The ESP32 has WiFi, Bluetooth, and a deep sleep mode that draws ~10 microamps.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You want to run a <b>Python script that downloads stock prices every hour</b> and displays them on an <b>HDMI monitor</b>. Which board?</p>',
      mountInput: function (container) {
        var opts = ['Arduino Uno', 'ESP32', 'Raspberry Pi Pico', 'Raspberry Pi 5'];
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
        if (v === 'Raspberry Pi 5') return { correct: true, feedback: 'Correct. You need full Python (not MicroPython), HTTP libraries, and HDMI output. Only an SBC running Linux can do all three. The RPi 5 has HDMI, WiFi, and runs any Python library.' };
        if (v === 'ESP32') return { correct: false, feedback: 'The ESP32 can do HTTP requests, but it has no HDMI output and runs MicroPython (limited libraries). You need a full Linux system for HDMI display and rich Python.' };
        return { correct: false, feedback: 'This project needs HDMI output, full Python, and HTTP networking. Only the Raspberry Pi 5 (a full Linux SBC) has all three.' };
      },
      hints: [
        'The project needs HDMI output. Which boards have HDMI?',
        'It needs to run full Python with HTTP libraries like requests. MicroPython does not have those.',
        'The Raspberry Pi 5 runs Linux, has HDMI, and can run any Python library. MCUs cannot do this.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Match each project to the <b>best board</b>:</p>' +
              '<ol type="a">' +
              '<li>LED blinker for a kid\'s toy</li>' +
              '<li>Home automation hub with Node-RED</li>' +
              '<li>Battery-powered soil moisture sensor that posts to MQTT</li>' +
              '<li>Custom USB HID device (acts as a keyboard)</li>' +
              '</ol>',
      mountInput: function (container) {
        var projects = ['(a) LED blinker', '(b) Home automation hub', '(c) MQTT soil sensor', '(d) USB HID device'];
        var boards = ['Arduino Uno', 'ESP32', 'Raspberry Pi Pico', 'Raspberry Pi 5'];
        var selects = [];
        projects.forEach(function (p) {
          var row = document.createElement('div');
          row.style.marginBottom = '6px';
          var label = document.createElement('span');
          label.textContent = p + ': ';
          label.style.display = 'inline-block';
          label.style.width = '220px';
          var sel = document.createElement('select');
          boards.forEach(function (b) {
            var opt = document.createElement('option');
            opt.value = b; opt.textContent = b;
            sel.appendChild(opt);
          });
          selects.push(sel);
          row.appendChild(label);
          row.appendChild(sel);
          container.appendChild(row);
        });
        return function () {
          return {
            a: selects[0].value,
            b: selects[1].value,
            c: selects[2].value,
            d: selects[3].value
          };
        };
      },
      check: function (v) {
        var correct = { a: 'Arduino Uno', b: 'Raspberry Pi 5', c: 'ESP32', d: 'Raspberry Pi Pico' };
        var wrong = [];
        if (v.a !== correct.a) wrong.push('(a) LED blinker → Arduino Uno (simplest, cheapest, 5V, no wireless needed)');
        if (v.b !== correct.b) wrong.push('(b) Home automation → RPi 5 (needs Linux for Node-RED, always-on power)');
        if (v.c !== correct.c) wrong.push('(c) MQTT soil sensor → ESP32 (WiFi + deep sleep for battery life)');
        if (v.d !== correct.d) wrong.push('(d) USB HID → Pico (native USB with RP2040, perfect for custom HID)');
        if (wrong.length === 0) return { correct: true, feedback: 'All four correct! Arduino Uno for simplicity, RPi 5 for Linux, ESP32 for wireless + battery, Pico for USB and real-time.' };
        return { correct: false, feedback: 'Not quite. Check these: ' + wrong.join('; ') + '.' };
      },
      hints: [
        'The LED blinker needs the simplest, cheapest board. No WiFi required.',
        'Node-RED is a Node.js application that needs Linux. MQTT over WiFi from a battery needs deep sleep.',
        '(a) Arduino Uno, (b) Raspberry Pi 5, (c) ESP32, (d) Raspberry Pi Pico. The Pico has native USB support via RP2040.'
      ]
    }
  ]
});
