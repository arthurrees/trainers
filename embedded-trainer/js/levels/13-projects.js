// Level 13 — Project Patterns & Integration
EST.registerLevel({
  id: 13,
  title: 'Project Patterns & Integration',
  whyItMatters: 'Knowing individual components is not enough — you need to know how to combine them into complete systems. These patterns are the blueprints that working engineers use for real IoT and embedded projects.',
  glossary: ['MCU', 'SBC', 'MQTT', 'deep sleep', 'PCB'],
  learn:
    '<p>You now have all the pieces: electricity, sensors, communication protocols, wireless, power management, and prototyping. This level is about <b>putting them together</b> — the architecture patterns behind real embedded projects.</p>' +

    '<h4>Pattern 1: Sensor &rarr; MCU &rarr; Cloud</h4>' +
    '<p>The simplest and most common IoT pattern. An ESP32 reads a sensor, connects to WiFi, and sends data to a cloud service or local server.</p>' +

    '<div class="example">' +
    '<div class="label">Example: WiFi weather station</div>' +
    '<ul>' +
    '<li><b>Components:</b> ESP32 + BME280 (temperature, humidity, pressure)</li>' +
    '<li><b>Communication:</b> WiFi &rarr; MQTT &rarr; Mosquitto broker on RPi &rarr; Grafana dashboard</li>' +
    '<li><b>Power:</b> Deep sleep between readings. Wake every 15 minutes, read sensor, connect WiFi, publish MQTT, sleep. Average current ~1 mA = months on a LiPo.</li>' +
    '<li><b>Gotcha:</b> WiFi reconnection takes 1-3 seconds and draws 200+ mA. Minimize wake time. Read the sensor BEFORE connecting WiFi so you can publish immediately after connection.</li>' +
    '</ul>' +
    '<p><b>Code flow:</b></p>' +
    '<pre><code># main.py (runs on every deep sleep wake)\n' +
    'import machine, network, time\n' +
    'from umqtt.simple import MQTTClient\n' +
    'from bme280 import BME280\n' +
    'from machine import I2C, Pin\n' +
    '\n' +
    '# 1. Read sensor FIRST (while WiFi is off)\n' +
    'i2c = I2C(0, scl=Pin(22), sda=Pin(21))\n' +
    'bme = BME280(i2c=i2c)\n' +
    'temp = bme.temperature\n' +
    'humidity = bme.humidity\n' +
    '\n' +
    '# 2. Connect WiFi\n' +
    'wlan = network.WLAN(network.STA_IF)\n' +
    'wlan.active(True)\n' +
    'wlan.connect(\'MySSID\', \'MyPassword\')\n' +
    'while not wlan.isconnected():\n' +
    '    time.sleep_ms(100)\n' +
    '\n' +
    '# 3. Publish and disconnect ASAP\n' +
    'client = MQTTClient(\'weather\', \'192.168.1.50\')\n' +
    'client.connect()\n' +
    'client.publish(\'home/outdoor/temp\', str(temp))\n' +
    'client.publish(\'home/outdoor/humidity\', str(humidity))\n' +
    'client.disconnect()\n' +
    '\n' +
    '# 4. Deep sleep for 15 minutes\n' +
    'machine.deepsleep(15 * 60 * 1000)</code></pre>' +
    '</div>' +

    '<h4>Pattern 2: Sensor &rarr; MCU &rarr; Local display</h4>' +
    '<p>No cloud, no WiFi, no internet. The ESP32 reads sensors and shows data on a local display. Simple and self-contained.</p>' +

    '<div class="example">' +
    '<div class="label">Example: desk thermometer</div>' +
    '<ul>' +
    '<li><b>Components:</b> ESP32 + DHT22 (temperature/humidity) + SSD1306 OLED (128x64 pixels, I2C)</li>' +
    '<li><b>Communication:</b> I2C to both sensor and display. No wireless.</li>' +
    '<li><b>Power:</b> Wall-powered via USB. Display is always on, so battery life would be poor (~20 mA for the OLED alone).</li>' +
    '<li><b>Code flow:</b> Read sensor every few seconds, update the OLED display. Simple infinite loop.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Pattern 3: Phone &rarr; BLE &rarr; MCU &rarr; Actuator</h4>' +
    '<p>Control something physical from your phone, wirelessly, without needing WiFi or internet.</p>' +

    '<div class="example">' +
    '<div class="label">Example: Bluetooth RGB LED controller</div>' +
    '<ul>' +
    '<li><b>Components:</b> ESP32 + WS2812B LED strip (Neopixel, driven by one GPIO) + phone app (nRF Connect or custom)</li>' +
    '<li><b>Communication:</b> BLE. Phone connects, writes RGB values to a BLE characteristic, ESP32 updates LEDs.</li>' +
    '<li><b>Power:</b> USB or 5V adapter (LED strips are power-hungry: ~60 mA per LED at full white). 30 LEDs = 1.8A!</li>' +
    '<li><b>No WiFi needed.</b> Works even without a router. Great for portable projects.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Pattern 4: Sensor network &rarr; MQTT broker &rarr; Dashboard</h4>' +
    '<p>Multiple sensor nodes, one central brain. This is the architecture behind real smart home systems.</p>' +

    '<div class="example">' +
    '<div class="label">Example: whole-house monitoring</div>' +
    '<ul>' +
    '<li><b>Sensors:</b> 5 ESP32 dev boards, each with a BME280, placed in different rooms.</li>' +
    '<li><b>Communication:</b> Each ESP32 connects to home WiFi and publishes to its own MQTT topic (e.g., <code class="inline">home/bedroom/temp</code>, <code class="inline">home/kitchen/temp</code>).</li>' +
    '<li><b>Broker:</b> Raspberry Pi running Mosquitto (MQTT broker). Also runs Home Assistant or Node-RED + Grafana for visualization.</li>' +
    '<li><b>Scalable:</b> Adding a new room = flash another ESP32, plug it in, and it starts publishing. No changes to existing code or dashboard (just add the new topic to the dashboard).</li>' +
    '<li><b>Power:</b> Each sensor node can run on deep sleep + battery, or wall-powered. The RPi broker is always on (wall power).</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Pattern 5: RPi as edge gateway</h4>' +
    '<p>A Raspberry Pi collects data from local sensors, processes it locally (ML inference, rule-based alerts), and only sends summaries to the cloud. Saves bandwidth, reduces latency, and adds privacy.</p>' +

    '<div class="example">' +
    '<div class="label">Example: smart security camera</div>' +
    '<ul>' +
    '<li><b>Components:</b> Raspberry Pi 5 + USB camera (or Pi Camera Module) + TensorFlow Lite for object detection</li>' +
    '<li><b>Logic:</b> Run inference locally. If a person is detected, capture a still image and send a push notification to your phone. If nothing is detected, send nothing. Instead of streaming 24/7 video to the cloud (expensive, slow, privacy risk), you only send the alert.</li>' +
    '<li><b>Add local ESP32 sensors:</b> Motion sensor (PIR) triggers the camera to start looking. Door sensor publishes to MQTT, RPi subscribes and starts recording when the door opens.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>Pattern 6: Physical automation (feedback loop)</h4>' +
    '<p>No cloud, no display, no phone. Just an MCU reading a sensor and controlling an actuator in a closed loop. The original embedded system pattern.</p>' +

    '<div class="example">' +
    '<div class="label">Example: automatic plant watering</div>' +
    '<ul>' +
    '<li><b>Components:</b> ESP32 + capacitive soil moisture sensor (analog) + relay module + 5V water pump + tube + water reservoir</li>' +
    '<li><b>Logic:</b> Read soil moisture every 30 minutes. If below threshold, activate relay (turns on pump) for 10 seconds. Wait 30 minutes, check again. Prevents over-watering.</li>' +
    '<li><b>Power:</b> Wall-powered (pump needs 5V). Add WiFi/MQTT if you want to monitor remotely (hybrid with Pattern 1).</li>' +
    '</ul>' +
    '</div>' +

    '<div class="example">' +
    '<div class="label">Example: thermostat</div>' +
    '<ul>' +
    '<li><b>Components:</b> ESP32 + BME280 + relay + heater/fan</li>' +
    '<li><b>Logic:</b> Use <b>hysteresis</b> — turn the heater on below 18&deg;C, off above 22&deg;C. Without hysteresis (turning on/off at exactly 20&deg;C), the relay would chatter rapidly as temperature oscillates around the setpoint.</li>' +
    '</ul>' +
    '</div>' +

    '<h4>The decision tree for new projects</h4>' +
    '<div class="callout"><div class="label">How to plan any embedded project</div>' +
    '<ol>' +
    '<li><b>What do you need to sense?</b> &rarr; Pick sensors (BME280 for climate, PIR for motion, ultrasonic for distance, etc.)</li>' +
    '<li><b>What do you need to control?</b> &rarr; Pick actuators and drivers (relay for pumps/solenoids, MOSFET for motors, PWM for LEDs/servos)</li>' +
    '<li><b>Does it need WiFi, BLE, both, or neither?</b> &rarr; ESP32 for wireless, Pico for wired-only cheap projects, RPi for heavy compute (ML, video, multi-service)</li>' +
    '<li><b>Battery or wall power?</b> &rarr; Budget power draw, choose regulators, plan sleep modes</li>' +
    '<li><b>Prototype on breadboard &rarr; iterate &rarr; PCB when stable</b></li>' +
    '</ol></div>' +

    '<h4>Worked example: complete component list for a weather station</h4>' +
    '<div class="example">' +
    '<div class="label">Outdoor weather station — component list</div>' +
    '<ul>' +
    '<li><b>Board:</b> ESP32 DevKit v1 (~$7)</li>' +
    '<li><b>Sensor:</b> BME280 breakout (~$3) — temperature, humidity, pressure</li>' +
    '<li><b>Power:</b> 18650 LiPo cell (3.7V, 3000 mAh, ~$5) + TP4056 charge module (~$0.50) + 3.3V LDO (on the ESP32 dev board)</li>' +
    '<li><b>Enclosure:</b> Waterproof junction box (~$5) with ventilation holes for the sensor</li>' +
    '<li><b>Software:</b> MicroPython, deep sleep every 15 min, MQTT publish to RPi broker</li>' +
    '<li><b>Server:</b> Raspberry Pi 3/4/5 running Mosquitto + Grafana</li>' +
    '<li><b>Total cost:</b> ~$20-25 for the sensor node, ~$50-80 for the RPi dashboard (one-time, serves all nodes)</li>' +
    '</ul>' +
    '</div>',

  mountPlay: function (container) {
    var projects = {
      'Weather Station': {
        board: 'ESP32 DevKit',
        sensors: ['BME280 (temp/humidity/pressure)'],
        actuators: ['None'],
        protocol: 'WiFi + MQTT',
        power: 'LiPo 3000mAh + deep sleep (wake every 15 min)',
        batteryLife: '~4-5 months',
        cost: '~$15-20',
        notes: 'Classic IoT pattern. Publish to MQTT broker on RPi. Grafana dashboard for visualization.'
      },
      'Plant Watering': {
        board: 'ESP32 DevKit',
        sensors: ['Capacitive soil moisture sensor (analog)'],
        actuators: ['5V water pump via relay module'],
        protocol: 'WiFi + MQTT (optional, for monitoring)',
        power: 'Wall-powered (5V USB adapter) — pump needs constant power available',
        batteryLife: 'N/A (wall powered)',
        cost: '~$20-25',
        notes: 'Feedback loop: read soil moisture, activate pump if dry. Add MQTT for remote monitoring.'
      },
      'Smart Doorbell': {
        board: 'ESP32-CAM',
        sensors: ['PIR motion sensor', 'Push button (doorbell)'],
        actuators: ['Buzzer (local alert)', 'Camera (capture image)'],
        protocol: 'WiFi + HTTP (push notification to phone)',
        power: 'Wall-powered (camera draws ~200mA continuously when active)',
        batteryLife: 'N/A (wall powered)',
        cost: '~$15-20',
        notes: 'Motion detection triggers camera capture. Button press sends notification. Consider ESP32-CAM module (~$8) which has camera built in.'
      },
      'BLE LED Controller': {
        board: 'ESP32 DevKit',
        sensors: ['None'],
        actuators: ['WS2812B LED strip (Neopixel)'],
        protocol: 'BLE (phone app control)',
        power: '5V adapter (LED strip at 30 LEDs = ~1.8A max)',
        batteryLife: 'N/A (wall powered)',
        cost: '~$15-25',
        notes: 'Phone sends RGB values via BLE. No WiFi needed. Use nRF Connect app for testing, or build a custom app.'
      },
      'Temperature Logger': {
        board: 'Raspberry Pi Pico W',
        sensors: ['DS18B20 waterproof temperature probe (OneWire)'],
        actuators: ['None (data logging only)'],
        protocol: 'WiFi + HTTP POST to Google Sheets or InfluxDB',
        power: 'USB powered or 3x AA batteries + deep sleep',
        batteryLife: '~2-3 months on AA batteries with hourly readings',
        cost: '~$10-15',
        notes: 'Log temperatures over time. DS18B20 is waterproof — great for aquariums, fridges, outdoor. Pico W is cheaper than ESP32 if you don\'t need BLE.'
      },
      'Home Security': {
        board: 'Raspberry Pi 5 (hub) + ESP32 nodes',
        sensors: ['PIR motion sensors (per room)', 'Reed switches (doors/windows)', 'Camera (RPi)'],
        actuators: ['Buzzer/siren via relay', 'Smart lights via MQTT'],
        protocol: 'MQTT (sensor nodes to RPi hub) + WiFi',
        power: 'Wall-powered hub. Battery-powered sensor nodes (deep sleep, wake on interrupt).',
        batteryLife: 'Sensor nodes: ~6-12 months (interrupt-driven wake)',
        cost: '~$100-150 total',
        notes: 'Multiple ESP32 sensor nodes publish to RPi MQTT broker. RPi runs Home Assistant for automation rules and notifications. Camera does local ML inference for person detection.'
      }
    };

    var projectNames = Object.keys(projects);

    container.innerHTML =
      '<p class="muted">Select a project to see a recommended architecture, component list, and power approach.</p>' +
      '<div style="margin-bottom:12px;">' +
        '<label>Project: </label>' +
        '<select id="est-proj-sel"></select>' +
        '<button id="est-proj-btn" class="primary-btn" style="margin-left:8px;">Show Plan</button>' +
      '</div>' +
      '<div id="est-proj-detail" class="formula-box" style="min-height:200px;">Select a project and click Show Plan.</div>';

    var sel = container.querySelector('#est-proj-sel');
    var btn = container.querySelector('#est-proj-btn');
    var detail = container.querySelector('#est-proj-detail');

    projectNames.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });

    btn.addEventListener('click', function () {
      var p = projects[sel.value];
      if (!p) return;

      var html =
        '<div style="margin-bottom:8px;"><b style="font-size:16px;">' + sel.value + '</b></div>' +
        '<div class="info-line"><span class="key">Board:</span> <span class="val">' + p.board + '</span></div>' +
        '<div class="info-line"><span class="key">Sensors:</span> <span class="val">' + p.sensors.join(', ') + '</span></div>' +
        '<div class="info-line"><span class="key">Actuators:</span> <span class="val">' + p.actuators.join(', ') + '</span></div>' +
        '<div class="info-line"><span class="key">Protocol:</span> <span class="val">' + p.protocol + '</span></div>' +
        '<div class="info-line"><span class="key">Power:</span> <span class="val">' + p.power + '</span></div>' +
        '<div class="info-line"><span class="key">Battery life:</span> <span class="val">' + p.batteryLife + '</span></div>' +
        '<div class="info-line"><span class="key">Est. cost:</span> <span class="val">' + p.cost + '</span></div>' +
        '<hr style="border-color:#3a4256;margin:12px 0;">' +
        '<div style="color:#9aa3b2;font-size:13px;">' + p.notes + '</div>';

      detail.innerHTML = html;
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want to build a <b>plant watering system</b> that checks soil moisture every hour and activates a 5V pump when it is too dry. What components do you need?</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 5;
        ta.cols = 55;
        ta.placeholder = 'List the components: board, sensor(s), actuator(s), switching component, power source...';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var answer = v.toLowerCase();
        if (answer.length < 15) return { correct: false, feedback: 'Please list the components you would need.' };

        var hasMCU = answer.indexOf('esp32') !== -1 || answer.indexOf('pico') !== -1 || answer.indexOf('arduino') !== -1 || answer.indexOf('mcu') !== -1 || answer.indexOf('microcontroller') !== -1;
        var hasSensor = answer.indexOf('moisture') !== -1 || answer.indexOf('soil') !== -1 || answer.indexOf('sensor') !== -1;
        var hasSwitch = answer.indexOf('relay') !== -1 || answer.indexOf('mosfet') !== -1 || answer.indexOf('transistor') !== -1;
        var hasPump = answer.indexOf('pump') !== -1 || answer.indexOf('motor') !== -1;
        var hasPower = answer.indexOf('power') !== -1 || answer.indexOf('usb') !== -1 || answer.indexOf('adapter') !== -1 || answer.indexOf('battery') !== -1 || answer.indexOf('5v') !== -1 || answer.indexOf('supply') !== -1;

        var score = 0;
        var found = [];
        var missing = [];
        if (hasMCU) { score++; found.push('MCU'); } else { missing.push('MCU (ESP32, Pico, or Arduino)'); }
        if (hasSensor) { score++; found.push('moisture sensor'); } else { missing.push('soil moisture sensor'); }
        if (hasSwitch) { score++; found.push('switching component'); } else { missing.push('relay or MOSFET (to switch the pump)'); }
        if (hasPump) { score++; found.push('pump'); } else { missing.push('water pump'); }
        if (hasPower) { score++; found.push('power source'); } else { missing.push('power source (5V adapter)'); }

        if (score >= 4) return { correct: true, feedback: 'Great component list! The essentials are: (1) MCU (ESP32 or Pico), (2) capacitive soil moisture sensor, (3) relay or MOSFET to switch the pump, (4) 5V water pump, (5) 5V power supply. The relay/MOSFET is critical because the MCU GPIO cannot directly drive the pump\'s current.' };
        if (score >= 3) return { correct: false, feedback: 'Good start! You got: ' + found.join(', ') + '. But you are missing: ' + missing.join(', ') + '. The complete list: MCU + soil moisture sensor + relay/MOSFET + 5V pump + 5V power supply.' };
        return { correct: false, feedback: 'The complete component list is: (1) <b>MCU</b> — ESP32 or Pico, (2) <b>capacitive soil moisture sensor</b> (analog output), (3) <b>relay module or MOSFET</b> to switch the pump (GPIO cannot drive it directly), (4) <b>5V water pump</b>, (5) <b>5V power supply</b> (USB adapter or wall wart). You mentioned: ' + (found.length > 0 ? found.join(', ') : 'none of the key components') + '.' };
      },
      hints: [
        'You need something to think (MCU), something to measure (sensor), something to act (pump), and something to switch the pump on/off safely (relay or MOSFET).',
        'The MCU\'s GPIO cannot drive a pump directly (too much current). You need a relay or MOSFET between the GPIO and the pump.',
        'Full list: ESP32 (or Pico/Arduino), capacitive soil moisture sensor, relay module, 5V water pump, 5V power supply.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Design a <b>whole-house temperature monitoring system</b>. You have 4 rooms. Each room needs a temperature sensor. You want a central dashboard viewable from your phone. <b>Describe the architecture:</b> what hardware goes where, what protocol connects them, and how do you view the data?</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 8;
        ta.cols = 55;
        ta.placeholder = 'Describe: sensor nodes (board + sensor), communication protocol, central hub, dashboard software, how you view from phone...';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var answer = v.toLowerCase();
        if (answer.length < 40) return { correct: false, feedback: 'Please provide a more detailed architecture description.' };

        var hasNodes = answer.indexOf('esp32') !== -1 || answer.indexOf('pico') !== -1 || (answer.indexOf('sensor') !== -1 && answer.indexOf('node') !== -1);
        var hasTempSensor = answer.indexOf('bme280') !== -1 || answer.indexOf('dht') !== -1 || answer.indexOf('ds18b20') !== -1 || answer.indexOf('temperature') !== -1;
        var hasProtocol = answer.indexOf('mqtt') !== -1 || answer.indexOf('http') !== -1 || answer.indexOf('wifi') !== -1;
        var hasCentral = answer.indexOf('raspberry') !== -1 || answer.indexOf('rpi') !== -1 || answer.indexOf('server') !== -1 || answer.indexOf('broker') !== -1 || answer.indexOf('hub') !== -1 || answer.indexOf('central') !== -1;
        var hasDashboard = answer.indexOf('dashboard') !== -1 || answer.indexOf('grafana') !== -1 || answer.indexOf('home assistant') !== -1 || answer.indexOf('node-red') !== -1 || answer.indexOf('display') !== -1 || answer.indexOf('web') !== -1 || answer.indexOf('phone') !== -1;
        var hasMultiple = answer.indexOf('4') !== -1 || answer.indexOf('four') !== -1 || answer.indexOf('each room') !== -1 || answer.indexOf('per room') !== -1 || answer.indexOf('multiple') !== -1;

        var score = 0;
        if (hasNodes) score++;
        if (hasTempSensor) score++;
        if (hasProtocol) score++;
        if (hasCentral) score++;
        if (hasDashboard) score++;
        if (hasMultiple) score++;

        if (score >= 5) return { correct: true, feedback: 'Excellent architecture! The standard approach: 4 ESP32 nodes (each with a BME280 or DS18B20), connected to home WiFi, publishing temperature data via MQTT to a Mosquitto broker running on a Raspberry Pi. The same Pi runs a dashboard (Home Assistant, Node-RED + Grafana, or similar) accessible from your phone via the local network. Adding a 5th room is just another ESP32 — no changes to the hub.' };
        if (score >= 3) return { correct: false, feedback: 'Good foundation, but missing some key elements. The full architecture: (1) 4 sensor nodes — ESP32 + temp sensor in each room, (2) WiFi + MQTT for communication, (3) Raspberry Pi as central hub running Mosquitto (MQTT broker), (4) Dashboard software (Home Assistant or Grafana) on the Pi, (5) Phone accesses the dashboard via local network or VPN. Your answer covered some of these but needs more detail.' };
        return { correct: false, feedback: 'The standard architecture for this: <b>4 ESP32 nodes</b> (one per room, each with a BME280 or DS18B20 temperature sensor). Each connects to home <b>WiFi</b> and publishes readings to <b>MQTT</b> topics (e.g., home/bedroom/temp). A <b>Raspberry Pi</b> runs <b>Mosquitto</b> (MQTT broker) and <b>Home Assistant or Grafana</b> (dashboard). You view the dashboard on your phone via the local network. Adding rooms = adding more ESP32 nodes.' };
      },
      hints: [
        'You need a sensor in each room. What cheap MCU has WiFi built in?',
        'Multiple sensors need a central collection point. MQTT is the standard protocol — a broker on a Raspberry Pi receives all the data. A dashboard subscribes to the MQTT topics.',
        'Architecture: 4 ESP32s with temperature sensors, WiFi + MQTT to a Raspberry Pi running Mosquitto + Home Assistant/Grafana. Phone views the dashboard via local network.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>You are building a <b>battery-powered outdoor weather station</b>. Requirements:</p>' +
              '<ul>' +
              '<li>Sensors: temperature, humidity, pressure, wind speed (anemometer with pulse output), rain gauge (tipping bucket with reed switch)</li>' +
              '<li>Must last <b>6+ months</b> on a 6000 mAh LiPo</li>' +
              '<li>Must upload data via WiFi every 15 minutes</li>' +
              '</ul>' +
              '<p>Design the full system: board, sensors, power strategy, communication. <b>Estimate if 6 months is achievable</b> (show your math).</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 12;
        ta.cols = 55;
        ta.placeholder = 'Describe:\n- Board choice\n- Sensors and how they connect\n- Power strategy (sleep mode, wake cycle)\n- Communication protocol\n- Battery life estimate with math';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var answer = v.toLowerCase();
        if (answer.length < 80) return { correct: false, feedback: 'Please provide a detailed design with battery life calculation.' };

        var hasBoard = answer.indexOf('esp32') !== -1;
        var hasBME = answer.indexOf('bme280') !== -1 || answer.indexOf('bme') !== -1 || (answer.indexOf('temp') !== -1 && answer.indexOf('humid') !== -1 && answer.indexOf('pressure') !== -1);
        var hasWind = answer.indexOf('anemometer') !== -1 || answer.indexOf('wind') !== -1;
        var hasRain = answer.indexOf('rain') !== -1;
        var hasDeepSleep = answer.indexOf('deep sleep') !== -1 || answer.indexOf('deepsleep') !== -1 || answer.indexOf('sleep') !== -1;
        var hasMQTT = answer.indexOf('mqtt') !== -1 || answer.indexOf('http') !== -1 || answer.indexOf('wifi') !== -1;
        var hasMath = answer.indexOf('ma') !== -1 || answer.indexOf('hour') !== -1 || answer.indexOf('day') !== -1 || answer.indexOf('month') !== -1;
        var hasFeasible = answer.indexOf('yes') !== -1 || answer.indexOf('achievable') !== -1 || answer.indexOf('feasible') !== -1 || answer.indexOf('possible') !== -1 || answer.indexOf('6 month') !== -1 || answer.indexOf('7 month') !== -1;

        var score = 0;
        if (hasBoard) score++;
        if (hasBME) score++;
        if (hasWind || hasRain) score++;
        if (hasDeepSleep) score++;
        if (hasMQTT) score++;
        if (hasMath) score++;
        if (hasFeasible) score++;

        if (score >= 6) return { correct: true, feedback: 'Excellent design! The math works out: ESP32 awake for ~5 seconds at ~200 mA every 15 minutes, deep sleep at ~10 \u00B5A for 895 seconds. Average current = (5/900 \u00D7 200) + (895/900 \u00D7 0.01) \u2248 1.12 mA. Battery life = 6000 / 1.12 \u2248 5357 hours \u2248 223 days \u2248 7.4 months. Even accounting for wind/rain counting during sleep (using ULP coprocessor or interrupt-based counting, adding ~50-150 \u00B5A), the average stays well under 2 mA, keeping battery life above 6 months. Key detail: the anemometer and rain gauge use interrupt pins — the ULP coprocessor or RTC GPIO can count pulses even during deep sleep.' };
        if (score >= 4) return { correct: false, feedback: 'Good design, but needs more detail. Key points: (1) ESP32 with BME280 for temp/humidity/pressure, anemometer on interrupt GPIO, rain gauge on interrupt GPIO. (2) Deep sleep for 895s, wake for 5s every 15 min. (3) WiFi + MQTT upload. (4) Math: average current \u2248 1.12 mA, battery life = 6000/1.12 = 5357 hours = 223 days = 7.4 months. YES, 6 months is achievable. The tricky part: counting wind/rain pulses during sleep requires the ULP coprocessor or RTC GPIO wake-on-pin.' };
        return { correct: false, feedback: 'Full design: <b>ESP32</b> + <b>BME280</b> (temp/humidity/pressure) + <b>anemometer</b> on interrupt GPIO + <b>rain gauge</b> on interrupt GPIO. <b>Deep sleep</b> between readings. Wake every 15 min, read sensors, connect WiFi, publish via <b>MQTT</b>, sleep. Average current: (5/900 \u00D7 200) + (895/900 \u00D7 0.01) = 1.12 mA. Battery: 6000 / 1.12 = 5357 hours = <b>223 days = 7.4 months</b>. YES, achievable. Wind/rain counting during sleep uses the ESP32 ULP coprocessor (counts pulses at ~150 \u00B5A, still well within budget).' };
      },
      hints: [
        'ESP32 is the right board (WiFi + deep sleep). BME280 covers temperature, humidity, and pressure in one sensor. The anemometer and rain gauge both produce pulses that can be counted.',
        'Deep sleep is essential. Wake every 15 minutes, stay awake for ~5 seconds to read sensors and send WiFi data, then sleep. Calculate the weighted average current.',
        'Math: active 5s at 200 mA, sleep 895s at 0.01 mA. Average = (5/900 x 200) + (895/900 x 0.01) = 1.12 mA. Battery life = 6000 / 1.12 = 5357 hours = 223 days = 7.4 months. Yes, 6 months is achievable.'
      ]
    }
  ]
});
