// glossary.js — shared glossary, rendered in sidebar
window.EST = window.EST || {};

EST.glossary = {
  // Orientation
  'MCU':        { name: 'microcontroller (MCU)', def: 'A tiny computer on a single chip: CPU + RAM + flash + I/O peripherals. Runs one program in a loop. Arduino, ESP32, RP2040 are all MCUs.' },
  'SBC':        { name: 'single-board computer (SBC)', def: 'A full computer on one board — runs Linux, has USB, HDMI, networking. Raspberry Pi is the most famous. NOT a microcontroller.' },
  'GPIO':       { name: 'general-purpose I/O', def: 'Pins on a board you can control from code — set HIGH/LOW (output) or read HIGH/LOW (input). The bridge between software and the physical world.' },
  'firmware':   { name: 'firmware', def: 'The software that runs on an MCU. Burned to flash memory. Runs in a loop — no OS, no filesystem (usually). Your code IS the whole system.' },
  'breadboard': { name: 'breadboard', def: 'A plastic board with rows of connected holes — lets you wire circuits without soldering. Essential for prototyping.' },

  // Electricity
  'voltage':    { name: 'voltage (V)', def: 'The "pressure" pushing electrons through a circuit. Measured in volts. A 3.3V pin pushes electrons at 3.3 volts.' },
  'current':    { name: 'current (I)', def: 'The "flow rate" of electrons. Measured in amps (A). Most MCU pins supply 10-40 mA max — enough for an LED, not a motor.' },
  'resistance': { name: 'resistance (R)', def: 'How much a component fights current flow. Measured in ohms (\u03A9). V = I \u00D7 R (Ohm\'s law). A resistor "resists."' },
  'GND':        { name: 'ground (GND)', def: 'The 0V reference point. All voltages are measured relative to ground. Every circuit needs a return path to GND.' },
  'Vcc':        { name: 'Vcc / 3V3 / 5V', def: 'The positive supply rail. Vcc on a 5V Arduino = 5V; 3V3 on an ESP32 = 3.3V. Sensors need to match this voltage or use a level shifter.' },

  // Components
  'LED':        { name: 'light-emitting diode', def: 'Glows when current flows through it (in one direction only). Needs a current-limiting resistor or you\'ll burn it out.' },
  'resistor':   { name: 'resistor', def: 'Limits current flow. Color bands encode its value. The most common component in electronics.' },
  'capacitor':  { name: 'capacitor', def: 'Stores a tiny charge and releases it. Used to smooth power, debounce buttons, filter noise. Measured in farads (usually \u00B5F or pF).' },
  'diode':      { name: 'diode', def: 'One-way valve for current. Blocks reverse current. LEDs are a special kind of diode.' },
  'transistor': { name: 'transistor', def: 'An electronic switch. A small current/voltage on the base/gate controls a large current through the other two pins. The building block of everything digital.' },
  'relay':      { name: 'relay', def: 'An electrically-controlled mechanical switch. Lets a low-voltage MCU pin control a high-voltage circuit (e.g. 120V AC lamp).' },
  'MOSFET':     { name: 'MOSFET', def: 'A type of transistor that\'s great for switching high-current loads (motors, LED strips). Voltage-controlled, very low on-resistance.' },

  // Signals
  'digital':    { name: 'digital signal', def: 'Only two states: HIGH (3.3V or 5V) and LOW (0V). Like a boolean: true/false.' },
  'analog':     { name: 'analog signal', def: 'A continuous voltage — any value between 0V and Vref. Temperature sensors, light sensors, potentiometers output analog.' },
  'ADC':        { name: 'analog-to-digital converter', def: 'Reads an analog voltage and converts it to a digital number. A 12-bit ADC splits 0-3.3V into 4096 steps.' },
  'PWM':        { name: 'pulse-width modulation', def: 'Rapidly switching a digital pin on and off to simulate an analog output. 50% duty cycle on a 3.3V pin = ~1.65V average. Used for dimming LEDs, controlling motor speed.' },
  'DAC':        { name: 'digital-to-analog converter', def: 'Outputs a true analog voltage. ESP32 has 2 DAC channels. Most MCUs fake it with PWM instead.' },

  // Protocols
  'UART':       { name: 'UART', def: 'Universal Asynchronous Receiver/Transmitter. Two wires (TX, RX). No clock — both sides agree on baud rate. The simplest serial protocol.' },
  'I2C':        { name: 'I\u00B2C (I2C)', def: 'Two wires (SDA data, SCL clock). Each device has an address. Up to 112 devices on one bus. Great for sensors.' },
  'SPI':        { name: 'SPI', def: 'Serial Peripheral Interface. 4 wires (MOSI, MISO, SCLK, CS). Fast. Used for displays, SD cards, fast ADCs.' },
  'MQTT':       { name: 'MQTT', def: 'Lightweight messaging protocol for IoT. Devices publish/subscribe to "topics" through a broker. Tiny overhead — perfect for ESP32 on WiFi.' },

  // Boards
  'ESP32':      { name: 'ESP32', def: 'Dual-core 240 MHz MCU with WiFi + Bluetooth built in. ~$5. The workhorse of DIY IoT. Runs MicroPython or Arduino C.' },
  'RPi':        { name: 'Raspberry Pi', def: 'A family of SBCs running full Linux. RPi 5 is a quad-core ARM at 2.4 GHz with 4-8 GB RAM. Has 40 GPIO pins.' },
  'Pico':       { name: 'Raspberry Pi Pico', def: 'An MCU board (NOT a full computer). RP2040 chip, dual ARM Cortex-M0+ at 133 MHz. ~$4. Has PIO state machines for custom protocols.' },
  'Arduino':    { name: 'Arduino', def: 'A family of MCU boards + an IDE. The Uno (ATmega328P, 16 MHz, 2 KB RAM) is the classic beginner board. 5V logic.' },

  // Power
  'regulator':  { name: 'voltage regulator', def: 'Converts one voltage to another. Linear (LDO) = simple but wastes power as heat. Switching (buck/boost) = efficient but noisy.' },
  'LDO':        { name: 'LDO (low-dropout regulator)', def: 'A linear regulator with a small Vin-Vout difference. The AMS1117-3.3 on many ESP32 boards converts 5V USB to 3.3V.' },
  'deep sleep': { name: 'deep sleep', def: 'An ultra-low-power mode on MCUs. ESP32 draws ~10 \u00B5A in deep sleep vs ~80 mA active. Wake on timer, pin change, or touch.' },
  'LiPo':       { name: 'LiPo battery', def: 'Lithium polymer. 3.7V nominal, 4.2V full, 3.0V empty. High energy density. Needs a charge controller (TP4056 is common).' },

  // PCB
  'PCB':        { name: 'printed circuit board', def: 'A board with copper traces that connect components. What you graduate to after breadboarding. JLCPCB and PCBWay do 5 boards for ~$2.' },
  'schematic':  { name: 'schematic', def: 'A diagram showing how components connect electrically (not physically). Uses standard symbols. The blueprint of a circuit.' },
  'trace':      { name: 'trace', def: 'A copper path on a PCB — the equivalent of a wire on a breadboard. Width matters for current capacity.' },
  'solder':     { name: 'solder', def: 'A metal alloy (usually tin/lead or lead-free) melted to join components to a PCB. Through-hole is beginner-friendly; SMD is smaller.' },

  // Wireless
  'BLE':        { name: 'Bluetooth Low Energy', def: 'A low-power Bluetooth variant designed for IoT. ESP32 supports both classic Bluetooth and BLE.' },
  'WiFi':       { name: 'WiFi (802.11)', def: 'Wireless networking. ESP32 does 2.4 GHz only (b/g/n). RPi 5 does 2.4 + 5 GHz (ac). Typical range: 30-100m indoors.' },
  'broker':     { name: 'MQTT broker', def: 'A server that routes MQTT messages. Mosquitto is the most common self-hosted broker. Cloud options: AWS IoT, HiveMQ.' },

  // Misc
  'pull-up':    { name: 'pull-up resistor', def: 'A resistor connecting an input pin to Vcc. Ensures the pin reads HIGH when nothing is actively driving it LOW. Many MCUs have internal pull-ups you can enable in code.' },
  'pull-down':  { name: 'pull-down resistor', def: 'A resistor connecting an input pin to GND. Ensures the pin reads LOW when nothing is driving it. Prevents a "floating" pin from reading random noise.' },
  'debounce':   { name: 'debounce', def: 'When you press a physical button, the contacts bounce — causing multiple rapid HIGH/LOW transitions. Debouncing (in hardware with a capacitor or in software with a delay) ignores the bouncing.' },
  'interrupt':  { name: 'interrupt', def: 'A hardware signal that pauses normal code to run a special function (ISR) immediately. Used for buttons, encoders, timers — anything that can\'t wait for the main loop.' },
  'level shifter': { name: 'level shifter', def: 'Converts signals between voltage levels (e.g. 3.3V ESP32 \u2194 5V sensor). Bidirectional shifters work both ways.' },
  'I2C address': { name: 'I2C address', def: 'A 7-bit number (0x00-0x7F) that identifies a device on the I2C bus. Some devices have configurable address pins to avoid conflicts.' }
};

EST.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = EST.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
EST.escapeHtml = escapeHtml;
