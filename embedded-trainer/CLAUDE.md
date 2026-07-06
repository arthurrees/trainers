# Embedded Systems & Electronics Trainer

In-depth interactive trainer for embedded systems and electronics — bridging the gap between software and hardware. 14 levels, 42 puzzles, covering electricity fundamentals through complete project integration. The user can code (Python, JS) but has zero electronics/hardware experience. Everything is explained from scratch.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to embedded systems.

## Topic-specific things

- **Namespace:** `window.EST` &nbsp; · &nbsp; **Storage key:** `est_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Software-developer-first framing.** The user already codes — analogies to software concepts land well (GPIO = boolean output, ADC = float input, interrupt = event listener, MQTT = pub/sub). Don't explain what a variable is; do explain what a resistor is.
- **MicroPython is the default language** for ESP32/Pico code examples. Arduino C is shown as a secondary reference where helpful. Python (gpiozero) for Raspberry Pi.
- **Practical over theoretical.** The goal is "I can build a thing," not "I can pass an EE exam." Ohm's law matters because you need to calculate a resistor value; Maxwell's equations don't appear.

## Topic-specific library: `EST.lib.embed`

Pure-function helpers for puzzles + Play surfaces. ES5-only. Verified by Node smoke test.

| Function | Purpose |
|---|---|
| `ohmsV(I, R)` / `ohmsI(V, R)` / `ohmsR(V, I)` / `power(V, I)` | Ohm's law + power. |
| `voltageDivider(Vin, R1, R2)` | Voltage divider output. |
| `ledResistor(Vsource, Vforward, Iled)` | Current-limiting resistor for LEDs. |
| `pwmVoltage(Vmax, dutyCyclePercent)` | Effective voltage from PWM. |
| `adcStep(Vref, bits)` / `adcValue(Vin, Vref, bits)` | ADC resolution and conversion. |
| `batteryLife(capacityMah, currentMa)` | Hours until battery dies. |
| `uartBytesPerSec(baud)` / `spiBytesPerSec(clockHz)` / `i2cMaxDevices()` | Protocol throughput/limits. |
| `BOARDS` | Spec database for Arduino Uno/Nano, ESP32/S3, Pico/Pico W, RPi 5/Zero 2 W. |
| `PROTOCOLS` | UART, I2C, SPI, OneWire comparison data. |
| `SENSORS` | DHT22, BME280, HC-SR04, PIR, LDR, MPU-6050, DS18B20, soil moisture specs. |
| `fmtOhms`, `fmtVolts`, `fmtAmps`, `fmtTime`, `approxEq` | Formatting & tolerance helpers. |

## The 14 levels

| # | Title | Play surface |
|---|---|---|
| 0 | Orientation | Board picker — clickable cards showing full specs |
| 1 | Electricity Fundamentals | Ohm's law calculator (V/I/R triangle) |
| 2 | Reading Circuit Diagrams | Schematic symbol identifier |
| 3 | GPIO & Digital I/O | Pin-state toggle simulator with pull-up/pull-down |
| 4 | Analog Signals, ADC & PWM | Duty-cycle slider + ADC value calculator |
| 5 | Sensors & Input Devices | Sensor explorer with specs and wiring |
| 6 | Actuators & Output Devices | Actuator picker by category |
| 7 | Serial Protocols: UART, I2C, SPI | Protocol comparator side by side |
| 8 | The ESP32 Deep Dive | Pinout explorer with safe/unsafe color coding |
| 9 | The Raspberry Pi Deep Dive | RPi vs ESP32 decision tool |
| 10 | Wireless: WiFi, BLE & MQTT | MQTT message flow visualizer |
| 11 | Power & Batteries | Power budget calculator with sleep modes |
| 12 | Breadboards to PCBs | Virtual breadboard with connected-hole highlighting |
| 13 | Project Patterns & Integration | Project planner with component recommendations |

## Content priorities

- **Always show the code.** Every hardware concept gets a MicroPython snippet showing how you'd use it. The user thinks in code — that's the bridge.
- **Safety warnings are load-bearing.** "Never connect a motor directly to GPIO" and "RPi GPIO is NOT 5V tolerant" prevent real hardware damage. Don't soften these.
- **Real component names and prices.** BME280, not "a temperature sensor." ~$5, not "inexpensive." The user needs to be able to order parts.
- **The hard puzzles combine ideas across levels.** L8.2 (battery life with deep sleep math), L11.2 (weighted average current with sleep), L13.3 (full system design). Don't water these down.

## Sanity-check verifications

```bash
cd trainers/embedded-trainer
# Library smoke test
node -e "global.window=global; eval(require('fs').readFileSync('js/lib/embed.js','utf8'));
  var e = global.EST.lib.embed;
  console.log('LED R:', e.fmtOhms(e.ledResistor(3.3, 1.8, 0.020)));
  console.log('ADC 12-bit step:', e.adcStep(3.3, 12).toFixed(4), 'V');
  console.log('Battery:', e.fmtTime(e.batteryLife(2000, 1.12)));
  console.log('UART 115200:', e.uartBytesPerSec(115200), 'B/s');
  console.log('Boards:', Object.keys(e.BOARDS).length);"

# Level integrity
node -e "
  var fs = require('fs');
  global.window = global;
  global.document = { createElement: function(){return{appendChild:function(){},addEventListener:function(){},classList:{add:function(){},remove:function(){}},querySelectorAll:function(){return[];},style:{},insertBefore:function(){},innerHTML:'',value:'',textContent:'',getContext:function(){return{fillRect:function(){},fillText:function(){},beginPath:function(){},moveTo:function(){},lineTo:function(){},stroke:function(){},fill:function(){},closePath:function(){},strokeRect:function(){},arc:function(){},setLineDash:function(){},measureText:function(){return{width:50};},clearRect:function(){},fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',textBaseline:'',save:function(){},restore:function(){}};}};},getElementById:function(){return{innerHTML:'',value:'',addEventListener:function(){},textContent:''};}};
  ['js/lib/canvas-utils.js','js/lib/embed.js','js/storage.js','js/glossary.js','js/hints.js'].forEach(function(f){
    eval(fs.readFileSync(f,'utf8'));
  });
  fs.readdirSync('js/levels').sort().forEach(function(f){
    eval(fs.readFileSync('js/levels/'+f,'utf8'));
  });
  console.log('Levels:', global.EST.levels.length, 'Puzzles:',
    global.EST.levels.reduce(function(a,l){return a+l.puzzles.length;},0));
  global.EST.levels.forEach(function(l){
    if (l.puzzles.length !== 3) throw new Error('Level '+l.id+' has '+l.puzzles.length+' puzzles');
    l.puzzles.forEach(function(p,i){
      if (!p.hints || p.hints.length !== 3) throw new Error('Level '+l.id+' puzzle '+i+' hints');
    });
  });
  console.log('shape OK: 14 x 3 x 3 = 126 hints');
"
```
