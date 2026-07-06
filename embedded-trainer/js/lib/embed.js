// embed.js — embedded systems helper library
window.EST = window.EST || {};
EST.lib = EST.lib || {};

EST.lib.embed = (function () {
  // ---------- Ohm's law ----------
  function ohmsV(I, R) { return I * R; }
  function ohmsI(V, R) { return V / R; }
  function ohmsR(V, I) { return V / I; }
  function power(V, I) { return V * I; }

  // ---------- Resistor divider ----------
  function voltageDivider(Vin, R1, R2) {
    return Vin * R2 / (R1 + R2);
  }

  // ---------- LED current limiting resistor ----------
  // R = (Vsource - Vforward) / Iled
  function ledResistor(Vsource, Vforward, Iled) {
    if (Iled <= 0) return Infinity;
    return (Vsource - Vforward) / Iled;
  }

  // ---------- PWM effective voltage ----------
  function pwmVoltage(Vmax, dutyCyclePercent) {
    return Vmax * dutyCyclePercent / 100;
  }

  // ---------- ADC resolution ----------
  // Smallest detectable voltage step = Vref / (2^bits)
  function adcStep(Vref, bits) {
    return Vref / Math.pow(2, bits);
  }

  // ADC digital value for a given input voltage
  function adcValue(Vin, Vref, bits) {
    var maxVal = Math.pow(2, bits) - 1;
    var val = Math.round(Vin / Vref * maxVal);
    return Math.max(0, Math.min(maxVal, val));
  }

  // ---------- Battery life ----------
  // hours = capacity_mAh / current_mA
  function batteryLife(capacityMah, currentMa) {
    if (currentMa <= 0) return Infinity;
    return capacityMah / currentMa;
  }

  // ---------- Serial baud rate to bytes/sec ----------
  // UART: 1 start + 8 data + 1 stop = 10 bits per byte typically
  function uartBytesPerSec(baud) {
    return Math.floor(baud / 10);
  }

  // ---------- I2C max devices on bus ----------
  // 7-bit addressing = 128 addresses, minus ~16 reserved = 112 usable
  function i2cMaxDevices() { return 112; }

  // ---------- SPI throughput ----------
  function spiBytesPerSec(clockHz) {
    return clockHz / 8; // full-duplex, 1 bit per clock
  }

  // ---------- Board comparison data ----------
  var BOARDS = {
    'Arduino Uno': {
      chip: 'ATmega328P', arch: 'AVR 8-bit', clockMhz: 16,
      flash: '32 KB', ram: '2 KB', gpio: 14, analog: 6,
      wifi: false, bluetooth: false, os: false,
      voltage: '5V', price: '~$25', lang: 'C/C++ (Arduino)',
      best: 'Simple projects, beginners, 5V sensors'
    },
    'Arduino Nano': {
      chip: 'ATmega328P', arch: 'AVR 8-bit', clockMhz: 16,
      flash: '32 KB', ram: '2 KB', gpio: 14, analog: 8,
      wifi: false, bluetooth: false, os: false,
      voltage: '5V', price: '~$22', lang: 'C/C++ (Arduino)',
      best: 'Breadboard-friendly Uno equivalent'
    },
    'ESP32': {
      chip: 'ESP32 (Xtensa dual-core)', arch: '32-bit', clockMhz: 240,
      flash: '4 MB', ram: '520 KB', gpio: 34, analog: 18,
      wifi: true, bluetooth: true, os: false,
      voltage: '3.3V', price: '~$5-10', lang: 'C/C++, MicroPython, CircuitPython',
      best: 'IoT, wireless, cost-sensitive, battery projects'
    },
    'ESP32-S3': {
      chip: 'ESP32-S3 (Xtensa dual-core)', arch: '32-bit', clockMhz: 240,
      flash: '8-16 MB', ram: '512 KB + 8 MB PSRAM', gpio: 45, analog: 20,
      wifi: true, bluetooth: true, os: false,
      voltage: '3.3V', price: '~$7-12', lang: 'C/C++, MicroPython',
      best: 'AI on edge (TFLite Micro), USB OTG, camera'
    },
    'Raspberry Pi Pico': {
      chip: 'RP2040 (dual ARM Cortex-M0+)', arch: 'ARM 32-bit', clockMhz: 133,
      flash: '2 MB', ram: '264 KB', gpio: 26, analog: 3,
      wifi: false, bluetooth: false, os: false,
      voltage: '3.3V', price: '~$4', lang: 'MicroPython, C/C++',
      best: 'PIO state machines, ultra-cheap, real-time'
    },
    'Raspberry Pi Pico W': {
      chip: 'RP2040 + CYW43439', arch: 'ARM 32-bit', clockMhz: 133,
      flash: '2 MB', ram: '264 KB', gpio: 26, analog: 3,
      wifi: true, bluetooth: true, os: false,
      voltage: '3.3V', price: '~$6', lang: 'MicroPython, C/C++',
      best: 'Pico with wireless — IoT on a budget'
    },
    'Raspberry Pi 5': {
      chip: 'BCM2712 (quad ARM Cortex-A76)', arch: 'ARM 64-bit', clockMhz: 2400,
      flash: 'microSD / NVMe', ram: '2-16 GB', gpio: 40, analog: 0,
      wifi: true, bluetooth: true, os: true,
      voltage: '5V (USB-C PD)', price: '~$60-80', lang: 'Python, C, anything Linux runs',
      best: 'Full Linux, desktop replacement, media server, ML inference'
    },
    'Raspberry Pi Zero 2 W': {
      chip: 'RP3A0 (quad ARM Cortex-A53)', arch: 'ARM 64-bit', clockMhz: 1000,
      flash: 'microSD', ram: '512 MB', gpio: 40, analog: 0,
      wifi: true, bluetooth: true, os: true,
      voltage: '5V', price: '~$15', lang: 'Python, C, anything Linux runs',
      best: 'Tiny Linux box, headless server, embedded Linux'
    }
  };

  // ---------- Common protocols ----------
  var PROTOCOLS = {
    'UART': { wires: 2, speed: '115200 baud typical (up to ~1 Mbps)', topology: 'Point-to-point', duplex: 'Full', notes: 'Simple, no clock line. TX/RX crossed. Most common for debug/GPS/Bluetooth modules.' },
    'I2C':  { wires: 2, speed: '100 kbps (standard), 400 kbps (fast), 3.4 Mbps (high-speed)', topology: 'Bus (multi-device, addressed)', duplex: 'Half', notes: 'SDA (data) + SCL (clock). Each device has a 7-bit address. Great for sensors. Pull-up resistors required.' },
    'SPI':  { wires: '4 + 1 per extra device', speed: '1-80 MHz clock', topology: 'Bus (chip-select per device)', duplex: 'Full', notes: 'MOSI, MISO, SCLK, CS. Fastest of the three. Used for displays, SD cards, fast ADCs.' },
    'OneWire': { wires: 1, speed: '~16 kbps', topology: 'Bus (parasitic power possible)', duplex: 'Half', notes: 'Dallas/Maxim. DS18B20 temperature sensor is the classic example. One data wire + ground.' }
  };

  // ---------- Common sensors ----------
  var SENSORS = {
    'DHT22':    { measures: 'Temperature + Humidity', output: 'Digital (custom one-wire)', voltage: '3.3-5V', range: '-40 to 80C, 0-100% RH', notes: 'Cheap, slow (2s sample rate), good enough for weather stations.' },
    'BME280':   { measures: 'Temperature + Humidity + Pressure', output: 'I2C or SPI', voltage: '3.3V', range: '-40 to 85C, 0-100% RH, 300-1100 hPa', notes: 'Much better than DHT22. Pressure gives altitude estimation.' },
    'HC-SR04':  { measures: 'Distance (ultrasonic)', output: 'Digital (trigger/echo pulse timing)', voltage: '5V', range: '2-400 cm', notes: 'Send a sound pulse, measure echo time. Distance = time * 343 m/s / 2.' },
    'PIR (HC-SR501)': { measures: 'Motion (infrared)', output: 'Digital HIGH/LOW', voltage: '5V', range: '~7m, 120 degree cone', notes: 'Detects warm bodies moving. Adjustable sensitivity and hold time.' },
    'LDR':      { measures: 'Light level', output: 'Analog (resistance varies)', voltage: '3.3-5V', range: 'Relative (bright = low R, dark = high R)', notes: 'Simplest sensor. Voltage divider + ADC. Good for day/night detection.' },
    'MPU-6050': { measures: 'Accelerometer + Gyroscope (6-axis)', output: 'I2C', voltage: '3.3V', range: '+/-16g accel, +/-2000 deg/s gyro', notes: 'Motion sensing, tilt detection, balancing robots. Has on-chip DMP.' },
    'DS18B20':  { measures: 'Temperature (waterproof)', output: 'OneWire', voltage: '3.3-5V', range: '-55 to 125C, +/-0.5C accuracy', notes: 'Waterproof versions exist. Can chain many on one wire (each has unique ID).' },
    'Soil Moisture': { measures: 'Soil moisture', output: 'Analog', voltage: '3.3-5V', range: 'Relative (wet = lower resistance)', notes: 'Capacitive version lasts longer than resistive (no corrosion).' }
  };

  // ---------- Formatting ----------
  function fmtOhms(r) {
    if (r >= 1e6) return (r / 1e6).toFixed(1) + ' M\u03A9';
    if (r >= 1e3) return (r / 1e3).toFixed(1) + ' k\u03A9';
    return r.toFixed(1) + ' \u03A9';
  }

  function fmtVolts(v) { return v.toFixed(2) + ' V'; }
  function fmtAmps(a) {
    if (a < 0.001) return (a * 1e6).toFixed(0) + ' \u00B5A';
    if (a < 1) return (a * 1000).toFixed(1) + ' mA';
    return a.toFixed(2) + ' A';
  }
  function fmtTime(hours) {
    if (hours >= 24) return (hours / 24).toFixed(1) + ' days';
    if (hours >= 1) return hours.toFixed(1) + ' hours';
    return (hours * 60).toFixed(0) + ' minutes';
  }

  function approxEq(a, b, tol) {
    tol = tol || 0.05;
    return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
  }

  return {
    ohmsV: ohmsV, ohmsI: ohmsI, ohmsR: ohmsR, power: power,
    voltageDivider: voltageDivider,
    ledResistor: ledResistor,
    pwmVoltage: pwmVoltage,
    adcStep: adcStep, adcValue: adcValue,
    batteryLife: batteryLife,
    uartBytesPerSec: uartBytesPerSec,
    i2cMaxDevices: i2cMaxDevices,
    spiBytesPerSec: spiBytesPerSec,
    BOARDS: BOARDS, PROTOCOLS: PROTOCOLS, SENSORS: SENSORS,
    fmtOhms: fmtOhms, fmtVolts: fmtVolts, fmtAmps: fmtAmps, fmtTime: fmtTime,
    approxEq: approxEq
  };
})();
