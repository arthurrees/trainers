// Level 3 — GPIO & Digital I/O
EST.registerLevel({
  id: 3,
  title: 'GPIO & Digital I/O',
  whyItMatters: 'GPIO pins are the bridge between your code and the physical world. Every sensor you read, every LED you blink, every motor you spin starts with understanding digital I/O.',
  glossary: ['GPIO', 'digital', 'pull-up', 'pull-down', 'debounce', 'interrupt'],
  learn:
    '<h4>What is GPIO?</h4>' +
    '<p><b>General-Purpose Input/Output</b> — the pins on your MCU that you control from code. Each GPIO pin can be configured in software as either an <b>output</b> (you set its voltage) or an <b>input</b> (you read its voltage).</p>' +
    '<p>On an ESP32, you have 34 GPIO pins. On an Arduino Uno, you have 14 digital pins. On a Raspberry Pi Pico, 26. Not all pins are created equal — some can do special things (ADC, PWM, I2C, SPI), and some are input-only. But at their core, they are all about one thing: <b>HIGH or LOW</b>.</p>' +

    '<h4>Output mode: setting HIGH and LOW</h4>' +
    '<p>When you configure a pin as OUTPUT, you can set it to:</p>' +
    '<ul>' +
    '<li><b>HIGH</b> — the pin outputs Vcc (3.3V on ESP32, 5V on Arduino Uno). Current can flow OUT of the pin.</li>' +
    '<li><b>LOW</b> — the pin connects to GND (0V). Current can flow INTO the pin.</li>' +
    '</ul>' +
    '<p>This is how you blink an LED, turn on a buzzer, or send a signal to another device.</p>' +

    '<div class="example">' +
    '<div class="label">Arduino: blink an LED on pin 13</div>' +
    '<pre>pinMode(13, OUTPUT);       // configure pin 13 as output\ndigitalWrite(13, HIGH);    // LED on (3.3V or 5V)\ndelay(1000);               // wait 1 second\ndigitalWrite(13, LOW);     // LED off (0V)</pre>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">MicroPython (ESP32): blink an LED on pin 2</div>' +
    '<pre>from machine import Pin\nimport time\n\nled = Pin(2, Pin.OUT)\nled.value(1)    # LED on (HIGH, 3.3V)\ntime.sleep(1)\nled.value(0)    # LED off (LOW, 0V)</pre>' +
    '</div>' +

    '<h4>Input mode: reading a button</h4>' +
    '<p>When you configure a pin as INPUT, you can read whether something external is pulling it HIGH or LOW. The simplest example: a push button.</p>' +
    '<p>A button is just a switch. When pressed, it connects two points. When released, the connection is broken.</p>' +

    '<h4>The floating pin problem</h4>' +
    '<div class="callout"><div class="label">Critical concept</div>' +
    '<p>When a button is <b>not pressed</b>, the pin is connected to... <b>nothing</b>. It is "floating" — not connected to Vcc or GND. A floating pin picks up electrical noise from the environment and reads random HIGH/LOW values. Your button will appear to press itself randomly.</p>' +
    '<p>This is one of the most common beginner mistakes. The fix: <b>pull-up or pull-down resistors</b>.</p></div>' +

    '<h4>Pull-up and pull-down resistors</h4>' +
    '<div class="example">' +
    '<div class="label">Pull-up resistor (most common)</div>' +
    '<p>A resistor (typically 10k&Omega;) connecting the input pin to Vcc. When the button is <b>not pressed</b>, the resistor gently holds the pin at HIGH. When the button IS pressed (connecting the pin to GND), the low resistance of the direct GND connection wins, and the pin reads LOW.</p>' +
    '<p>This is called <b>"active LOW"</b> — the button is "active" (pressed) when the pin reads LOW.</p>' +
    '<p>Logic: <b>not pressed = HIGH, pressed = LOW</b>.</p>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Pull-down resistor</div>' +
    '<p>A resistor connecting the input pin to GND. When the button is not pressed, the pin is held LOW. When pressed (connecting to Vcc), the pin reads HIGH.</p>' +
    '<p>This is <b>"active HIGH"</b> — pressed = HIGH.</p>' +
    '<p>Logic: <b>not pressed = LOW, pressed = HIGH</b>.</p>' +
    '</div>' +

    '<p>The great news: most MCUs have <b>internal pull-up resistors</b> you can enable in code. No external resistor needed!</p>' +

    '<div class="example">' +
    '<div class="label">Arduino: button with internal pull-up</div>' +
    '<pre>pinMode(15, INPUT_PULLUP);         // enable internal pull-up\nint state = digitalRead(15);       // HIGH = not pressed, LOW = pressed\nif (state == LOW) {\n  // button is pressed!\n}</pre>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">MicroPython: button with internal pull-up</div>' +
    '<pre>from machine import Pin\n\nbtn = Pin(15, Pin.IN, Pin.PULL_UP)\nif btn.value() == 0:    # 0 = LOW = pressed (active LOW)\n    print("Button pressed!")</pre>' +
    '</div>' +

    '<h4>The debounce problem</h4>' +
    '<p>When you press a physical button, the metal contacts do not make clean contact — they <b>bounce</b>. For a few milliseconds, the contacts rapidly connect and disconnect, causing dozens of rapid HIGH/LOW transitions. Your code might see one button press as 5-10 presses.</p>' +

    '<div class="example">' +
    '<div class="label">What the MCU sees on a single button press</div>' +
    '<pre>Time:   0ms  1ms  2ms  3ms  4ms  5ms  ... 20ms\nPin:    HIGH LOW  HIGH LOW  HIGH LOW  ... LOW (stable)</pre>' +
    '<p>Solution: <b>debouncing</b>. In software, ignore changes for ~20-50ms after the first transition. In hardware, add a small capacitor (0.1 &micro;F) across the button to smooth the signal.</p>' +
    '</div>' +

    '<h4>Interrupts: reacting instantly</h4>' +
    '<p>So far, reading a button means checking it in your main loop (<b>polling</b>). But what if your loop takes 500ms to run? You might miss a quick button press.</p>' +
    '<p><b>Interrupts</b> solve this. You tell the MCU: "whenever pin 15 goes from HIGH to LOW, immediately pause whatever you are doing and run this function." The MCU hardware watches the pin and fires your function (called an <b>ISR — Interrupt Service Routine</b>) the instant the change happens.</p>' +

    '<div class="example">' +
    '<div class="label">MicroPython: button interrupt</div>' +
    '<pre>from machine import Pin\nimport time\n\ndef button_pressed(pin):\n    print("Button pressed!")\n\nbtn = Pin(15, Pin.IN, Pin.PULL_UP)\nbtn.irq(trigger=Pin.IRQ_FALLING, handler=button_pressed)\n# IRQ_FALLING = fires when pin goes HIGH to LOW (button press with pull-up)</pre>' +
    '</div>' +

    '<div class="callout"><div class="label">ISR rules</div>' +
    '<p>Interrupt handlers must be <b>fast</b>. Do not do I/O, allocate memory, or run long calculations inside an ISR. Set a flag, and handle it in your main loop:</p>' +
    '<pre>pressed = False\ndef button_isr(pin):\n    global pressed\n    pressed = True\n\n# In main loop:\nif pressed:\n    pressed = False\n    # handle the press here</pre>' +
    '</div>',

  mountPlay: function (container) {
    container.innerHTML =
      '<p class="muted">Simulate 4 GPIO pins. Toggle modes, press buttons, and see how pull resistors affect input readings.</p>' +
      '<div id="est-gpio-pins" style="display:flex;gap:20px;flex-wrap:wrap;"></div>';

    var host = container.querySelector('#est-gpio-pins');

    function makePin(pinNum) {
      var box = document.createElement('div');
      box.className = 'formula-box';
      box.style.minWidth = '180px';
      box.style.padding = '12px';

      var mode = 'output';
      var outputState = false;
      var pullMode = 'none';
      var buttonDown = false;

      function render() {
        var reading;
        if (mode === 'output') {
          reading = outputState ? 'HIGH (3.3V)' : 'LOW (0V)';
        } else {
          if (buttonDown) {
            reading = pullMode === 'pull-down' ? 'HIGH' : 'LOW';
          } else {
            if (pullMode === 'pull-up') reading = 'HIGH';
            else if (pullMode === 'pull-down') reading = 'LOW';
            else reading = Math.random() > 0.5 ? 'HIGH (noise!)' : 'LOW (noise!)';
          }
        }

        var ledColor = 'none';
        if (mode === 'output' && outputState) ledColor = '#4ade80';

        var html =
          '<div style="margin-bottom:8px;"><b>GPIO ' + pinNum + '</b></div>' +
          '<div style="margin-bottom:6px;">Mode: <select class="est-mode-sel">' +
          '<option value="output"' + (mode === 'output' ? ' selected' : '') + '>OUTPUT</option>' +
          '<option value="input"' + (mode === 'input' ? ' selected' : '') + '>INPUT</option></select></div>';

        if (mode === 'output') {
          html += '<div style="margin-bottom:6px;"><button class="est-toggle-btn">' + (outputState ? 'Set LOW' : 'Set HIGH') + '</button></div>';
          html += '<div style="margin-bottom:6px;">LED: <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:' + ledColor + ';border:1px solid #555;vertical-align:middle;"></span></div>';
        } else {
          html += '<div style="margin-bottom:6px;">Pull: <select class="est-pull-sel">' +
            '<option value="none"' + (pullMode === 'none' ? ' selected' : '') + '>None (floating)</option>' +
            '<option value="pull-up"' + (pullMode === 'pull-up' ? ' selected' : '') + '>Pull-up</option>' +
            '<option value="pull-down"' + (pullMode === 'pull-down' ? ' selected' : '') + '>Pull-down</option></select></div>';
          html += '<div style="margin-bottom:6px;"><button class="est-btn-sim">Hold Button</button></div>';
        }

        html += '<div>Read: <b style="color:' + (reading.indexOf('noise') !== -1 ? '#f87171' : '#4ade80') + ';">' + reading + '</b></div>';

        box.innerHTML = html;

        // Re-attach listeners
        var modeSel = box.querySelector('.est-mode-sel');
        if (modeSel) modeSel.addEventListener('change', function () {
          mode = modeSel.value;
          outputState = false;
          buttonDown = false;
          render();
        });

        var toggleBtn = box.querySelector('.est-toggle-btn');
        if (toggleBtn) toggleBtn.addEventListener('click', function () {
          outputState = !outputState;
          render();
        });

        var pullSel = box.querySelector('.est-pull-sel');
        if (pullSel) pullSel.addEventListener('change', function () {
          pullMode = pullSel.value;
          render();
        });

        var btnSim = box.querySelector('.est-btn-sim');
        if (btnSim) {
          btnSim.addEventListener('mousedown', function () { buttonDown = true; render(); });
          btnSim.addEventListener('mouseup', function () { buttonDown = false; render(); });
          btnSim.addEventListener('mouseleave', function () { if (buttonDown) { buttonDown = false; render(); } });
        }
      }

      render();
      return box;
    }

    for (var i = 0; i < 4; i++) {
      host.appendChild(makePin(i + 2));
    }
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You connect a button between <b>GPIO 15 and GND</b>, and enable the <b>internal pull-up resistor</b>. When the button is <b>NOT pressed</b>, what does the pin read?</p>',
      mountInput: function (container) {
        var opts = ['HIGH', 'LOW', 'Random / floating'];
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
        if (v === 'HIGH') return { correct: true, feedback: 'Correct! The pull-up resistor connects the pin to Vcc (3.3V) through a ~10k\u03A9 resistor. When the button is NOT pressed, nothing is pulling the pin to GND, so the pull-up holds it at HIGH. When you press the button, it connects the pin directly to GND (almost 0\u03A9), which overpowers the weak pull-up, and the pin reads LOW.' };
        if (v === 'LOW') return { correct: false, feedback: 'That is what the pin reads when the button IS pressed. With a pull-up, the idle (unpressed) state is HIGH. The button pulls it LOW when pressed.' };
        return { correct: false, feedback: 'Floating only happens with NO pull resistor. You enabled the pull-up, so the pin is held at HIGH when the button is not pressed.' };
      },
      hints: [
        'A "pull-up" resistor connects the pin to Vcc (the positive supply). Think about what that means when nothing else is connected.',
        'When the button is open (not pressed), the only connection is the pull-up to Vcc. So the pin is pulled to HIGH.',
        'With a pull-up: not pressed = HIGH, pressed = LOW (because the button connects the pin to GND).'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>You have an LED on GPIO 2 and a button on GPIO 15. The LED should light when the button is pressed. The button connects to GND with an internal pull-up enabled. Fill in the blank:</p>' +
              '<pre>if btn.value() == ___:</pre>' +
              '<p>What value should go in the blank?</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'e.g. 1';
        inp.style.width = '80px';
        container.appendChild(inp);
        return function () { return inp.value; };
      },
      check: function (v) {
        var s = String(v).trim();
        if (s === '0' || s.toLowerCase() === 'low' || s.toLowerCase() === 'false') return { correct: true, feedback: 'Correct! With a pull-up resistor, the button is "active LOW": pressed = LOW = 0. The pin reads 0 (LOW) when the button connects it to GND. So <code class="inline">btn.value() == 0</code> means "the button is pressed." This is the standard pattern for buttons in MicroPython.' };
        if (s === '1' || s.toLowerCase() === 'high' || s.toLowerCase() === 'true') return { correct: false, feedback: 'With a pull-up, the pin reads HIGH (1) when the button is NOT pressed. When pressed, the button connects the pin to GND, making it LOW (0). So you check for 0, not 1.' };
        return { correct: false, feedback: 'With pull-up + button-to-GND: not pressed = 1 (HIGH), pressed = 0 (LOW). The blank should be 0.' };
      },
      hints: [
        'The button connects the pin to GND when pressed. The pull-up holds it HIGH when not pressed.',
        'This is called "active LOW" — the button is active (pressed) when the pin is LOW (0).',
        'The answer is 0. btn.value() == 0 means "button is pressed."'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Your button interrupt fires <b>6 times</b> for a single physical press. What is the problem and the fix?</p>',
      mountInput: function (container) {
        var opts = [
          '(a) Wrong pull resistor type — switch to pull-down',
          '(b) Contact bounce — add debounce (software delay or hardware capacitor)',
          '(c) Interrupt priority is too high — lower it',
          '(d) The button is analog, not digital — use an ADC instead'
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
        if (v === 'b') return { correct: true, feedback: 'Correct! Physical buttons have <b>contact bounce</b> — the metal contacts rapidly connect and disconnect for a few milliseconds during a single press. The MCU is fast enough to detect each tiny bounce as a separate press. The fix is <b>debouncing</b>: in software, ignore any transitions within ~20-50ms of the first one. In hardware, add a 0.1\u00B5F capacitor across the button to smooth the signal.' };
        if (v === 'a') return { correct: false, feedback: 'The type of pull resistor (up vs down) does not cause multiple triggers. Both work fine — they just invert the logic. The problem is mechanical contact bounce.' };
        if (v === 'c') return { correct: false, feedback: 'Interrupt priority does not cause multiple fires. The bouncing contacts physically create multiple HIGH/LOW transitions, each of which triggers the interrupt. The fix is debouncing.' };
        return { correct: false, feedback: 'Buttons are digital devices (pressed or not pressed). The problem is mechanical: the contacts bounce for a few milliseconds on each press, creating multiple transitions. The fix is debouncing.' };
      },
      hints: [
        'This is a physical/mechanical problem, not a software configuration issue. What happens at the metal contacts when you press a button?',
        'The metal contacts do not make clean contact — they "bounce" rapidly for a few milliseconds. Each bounce looks like a separate press to the fast MCU.',
        'The answer is (b) — contact bounce. Fix with debouncing: ignore transitions for 20-50ms after the first one.'
      ]
    }
  ]
});
