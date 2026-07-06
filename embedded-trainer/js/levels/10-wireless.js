// Level 10 — Wireless: WiFi, BLE & MQTT
EST.registerLevel({
  id: 10,
  title: 'Wireless: WiFi, BLE & MQTT',
  whyItMatters: 'Wireless connectivity is what turns a blinking LED project into a "smart" device. Understanding WiFi, BLE, and MQTT lets you build real IoT systems that talk to phones, dashboards, and each other.',
  glossary: ['WiFi', 'BLE', 'MQTT', 'broker', 'ESP32'],
  learn:
    '<p>Wireless is what makes embedded projects "smart." Three technologies dominate the embedded IoT world, and they each solve a different problem. Understanding when to use each one is an essential engineering decision.</p>' +

    '<h4>WiFi: internet connectivity for your MCU</h4>' +
    '<p>WiFi lets your ESP32 connect to your home router and access the internet — just like your phone or laptop. The ESP32 can act as a <b>station (STA)</b> (connects to an existing access point) or as an <b>access point (AP)</b> (creates its own network that other devices connect to).</p>' +
    '<div class="example">' +
    '<div class="label">WiFi key specs</div>' +
    '<ul>' +
    '<li><b>Range:</b> ~30-100 meters indoors (depends on walls, interference)</li>' +
    '<li><b>Power draw:</b> ~160-260 mA while actively transmitting. This is a LOT for a battery project.</li>' +
    '<li><b>Speed:</b> More than enough for sensor data (you are sending bytes, not streaming video)</li>' +
    '<li><b>Use for:</b> sending data to cloud services, web dashboards, OTA firmware updates, HTTP APIs, MQTT</li>' +
    '</ul></div>' +

    '<p>Here is how you connect to WiFi in MicroPython on an ESP32:</p>' +
    '<div class="example">' +
    '<div class="label">MicroPython WiFi connection</div>' +
    '<pre><code>import network\n' +
    'wlan = network.WLAN(network.STA_IF)  # station mode\n' +
    'wlan.active(True)\n' +
    'wlan.connect(\'MySSID\', \'MyPassword\')\n' +
    'while not wlan.isconnected():\n' +
    '    pass\n' +
    'print(wlan.ifconfig())  # (ip, subnet, gateway, dns)</code></pre>' +
    '<p>Once connected, you can use <code class="inline">urequests</code> to make HTTP calls or <code class="inline">umqtt</code> for MQTT. The connection persists until you disconnect or the ESP32 goes to deep sleep.</p>' +
    '</div>' +

    '<div class="callout"><div class="label">WiFi power trap</div>' +
    'WiFi reconnection takes 1-3 seconds and draws 200+ mA the entire time. For battery projects, you want to minimize how often you wake up and connect. The pattern is: wake from deep sleep, connect WiFi, send data as fast as possible, disconnect, go back to sleep.</div>' +

    '<h4>BLE (Bluetooth Low Energy): short-range, low-power communication</h4>' +
    '<p>BLE is <b>NOT</b> the same as classic Bluetooth (the kind that streams music to your headphones). Classic Bluetooth is designed for continuous, high-bandwidth data streams. BLE is designed for <b>small packets of data</b> sent infrequently — sensor readings, commands, status updates.</p>' +
    '<div class="example">' +
    '<div class="label">BLE key specs</div>' +
    '<ul>' +
    '<li><b>Range:</b> ~10-30 meters indoors</li>' +
    '<li><b>Power draw:</b> Connected: ~10-15 mA. Advertising only: ~0.5-1 mA. Orders of magnitude less than WiFi.</li>' +
    '<li><b>Speed:</b> Low (a few hundred bytes per second typical). Not for streaming.</li>' +
    '<li><b>Use for:</b> phone-to-ESP32 communication, wireless sensors, beacons, fitness trackers, remote controls</li>' +
    '</ul></div>' +

    '<p>BLE uses <b>GATT (Generic Attribute Profile)</b> to organize data. Think of it like a mini database:</p>' +
    '<ul>' +
    '<li>A device advertises one or more <b>services</b> (e.g., "Temperature Service," "Battery Service")</li>' +
    '<li>Each service contains one or more <b>characteristics</b> (e.g., "temperature_value," "battery_level")</li>' +
    '<li>Other devices can <b>read</b>, <b>write</b>, or <b>subscribe to notifications</b> on characteristics</li>' +
    '</ul>' +
    '<p>For example, a BLE temperature sensor might advertise a "Temperature Service" with a "current_temp" characteristic. Your phone app subscribes to notifications on that characteristic and receives updates whenever the value changes.</p>' +

    '<div class="callout"><div class="label">BLE vs WiFi: when to use which</div>' +
    'Need internet access or cloud connectivity? <b>WiFi.</b> Need phone-to-device control without internet? <b>BLE.</b> Need months of battery life? <b>BLE</b> (or WiFi with deep sleep and very infrequent wakes). Want both? The ESP32 has both — you can use BLE for local control and WiFi for cloud uploads.</div>' +

    '<h4>MQTT: the IoT messaging protocol</h4>' +
    '<p>MQTT stands for <b>Message Queuing Telemetry Transport</b>. It is a <b>publish/subscribe</b> messaging protocol designed specifically for IoT. Instead of devices talking directly to each other, they all talk through a central <b>broker</b>.</p>' +

    '<div class="example">' +
    '<div class="label">How MQTT works</div>' +
    '<p>Three roles:</p>' +
    '<ul>' +
    '<li><b>Publisher:</b> a device that sends messages to a topic. Example: ESP32 publishes <code class="inline">23.5</code> to topic <code class="inline">home/living-room/temperature</code>.</li>' +
    '<li><b>Subscriber:</b> a device that listens for messages on a topic. Example: a dashboard subscribes to <code class="inline">home/+/temperature</code> to get all room temperatures.</li>' +
    '<li><b>Broker:</b> the central server that receives all published messages and routes them to subscribers. Example: Mosquitto running on a Raspberry Pi.</li>' +
    '</ul>' +
    '<p>The beauty: publishers and subscribers do not know about each other. The broker handles all routing. You can add new sensors or new dashboards without changing any existing code.</p>' +
    '</div>' +

    '<p>MQTT has three <b>Quality of Service (QoS)</b> levels:</p>' +
    '<ul>' +
    '<li><b>QoS 0</b> — fire and forget. No confirmation. Fastest, lowest overhead. Fine for frequent sensor readings (if you miss one, the next arrives in seconds).</li>' +
    '<li><b>QoS 1</b> — at least once. Broker acknowledges receipt. May deliver duplicates. Good for important commands.</li>' +
    '<li><b>QoS 2</b> — exactly once. Four-step handshake. Highest overhead. Rarely needed in hobby projects.</li>' +
    '</ul>' +

    '<p>MQTT topics use a <b>hierarchical namespace</b> with <code class="inline">/</code> separators, like file paths:</p>' +
    '<div class="example">' +
    '<div class="label">MQTT topic hierarchy example</div>' +
    '<pre><code>home/bedroom/temperature\n' +
    'home/bedroom/humidity\n' +
    'home/kitchen/temperature\n' +
    'home/front-door/motion\n' +
    'office/server-room/temperature</code></pre>' +
    '<p>Wildcards: <code class="inline">+</code> matches one level (<code class="inline">home/+/temperature</code> = all rooms\' temperatures). <code class="inline">#</code> matches everything below (<code class="inline">home/#</code> = all home topics).</p>' +
    '</div>' +

    '<p>MicroPython MQTT publishing:</p>' +
    '<div class="example">' +
    '<div class="label">MicroPython MQTT example</div>' +
    '<pre><code>from umqtt.simple import MQTTClient\n' +
    'client = MQTTClient(\'esp32-sensor\', \'192.168.1.100\')\n' +
    'client.connect()\n' +
    'client.publish(\'home/temp\', \'23.5\')\n' +
    'client.disconnect()</code></pre>' +
    '<p>The first argument is a client ID (unique per device). The second is the broker IP address.</p>' +
    '</div>' +

    '<h4>The architecture: putting it all together</h4>' +
    '<p>The most common IoT architecture uses all three technologies:</p>' +
    '<div class="example">' +
    '<div class="label">Smart home sensor network</div>' +
    '<p>Imagine a 3-room house with sensors:</p>' +
    '<ul>' +
    '<li><b>Living room:</b> ESP32 + BME280 (temperature/humidity/pressure) &rarr; publishes to <code class="inline">home/living-room/temperature</code>, <code class="inline">home/living-room/humidity</code></li>' +
    '<li><b>Bedroom:</b> ESP32 + PIR motion sensor &rarr; publishes to <code class="inline">home/bedroom/motion</code></li>' +
    '<li><b>Front door:</b> ESP32 + reed switch (door open/closed) &rarr; publishes to <code class="inline">home/front-door/status</code></li>' +
    '</ul>' +
    '<p>All three ESP32s connect to the home WiFi and publish to a <b>Mosquitto MQTT broker</b> running on a Raspberry Pi. The same RPi runs <b>Home Assistant</b> (or Node-RED + Grafana), which subscribes to all topics and displays a dashboard. You view the dashboard on your phone via the local network.</p>' +
    '<p>If a sensor goes offline, the broker can notify subscribers using <b>Last Will and Testament (LWT)</b> — a message the broker publishes on behalf of a client that disconnects unexpectedly.</p>' +
    '</div>' +

    '<div class="callout"><div class="label">MQTT is everywhere in IoT</div>' +
    'Home Assistant, Node-RED, AWS IoT Core, Google Cloud IoT, and Azure IoT Hub all speak MQTT. Learning it once means you can talk to any of these platforms. It is the lingua franca of IoT messaging.</div>',

  mountPlay: function (container) {
    var devices = [
      { name: 'Temp Sensor', topic: 'home/living-room/temperature', payload: '23.5\u00B0C', color: '#4ade80' },
      { name: 'Motion Sensor', topic: 'home/bedroom/motion', payload: 'DETECTED', color: '#fbbf24' },
      { name: 'Door Switch', topic: 'home/front-door/status', payload: 'OPEN', color: '#f87171' }
    ];

    container.innerHTML =
      '<p class="muted">Click a device to publish an MQTT message. Watch it flow through the broker to the dashboard.</p>' +
      '<div style="display:flex;align-items:center;justify-content:center;gap:0;flex-wrap:wrap;margin:16px 0;">' +
        '<div id="est-mqtt-devices" style="display:flex;flex-direction:column;gap:12px;min-width:160px;"></div>' +
        '<div id="est-mqtt-arrows-left" style="width:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;"></div>' +
        '<div id="est-mqtt-broker" style="border:2px solid #7ab7ff;border-radius:8px;padding:16px 20px;text-align:center;min-width:120px;background:rgba(122,183,255,0.08);">' +
          '<div style="font-weight:bold;color:#7ab7ff;">MQTT Broker</div>' +
          '<div style="font-size:12px;color:#9aa3b2;">Mosquitto</div>' +
          '<div id="est-mqtt-broker-log" style="margin-top:8px;font-size:11px;color:#9aa3b2;max-height:120px;overflow-y:auto;text-align:left;"></div>' +
        '</div>' +
        '<div id="est-mqtt-arrows-right" style="width:60px;display:flex;align-items:center;justify-content:center;"></div>' +
        '<div id="est-mqtt-dashboard" style="border:2px solid #a78bfa;border-radius:8px;padding:16px 20px;min-width:180px;background:rgba(167,139,250,0.08);">' +
          '<div style="font-weight:bold;color:#a78bfa;">Dashboard</div>' +
          '<div style="font-size:12px;color:#9aa3b2;">Home Assistant</div>' +
          '<div id="est-mqtt-dash-values" style="margin-top:8px;font-size:13px;"></div>' +
        '</div>' +
      '</div>' +
      '<div id="est-mqtt-msg" style="text-align:center;min-height:40px;color:#7ab7ff;font-size:13px;margin-top:8px;"></div>';

    var devCol = container.querySelector('#est-mqtt-devices');
    var brokerLog = container.querySelector('#est-mqtt-broker-log');
    var dashValues = container.querySelector('#est-mqtt-dash-values');
    var msgArea = container.querySelector('#est-mqtt-msg');
    var msgCount = 0;

    // Initialize dashboard values
    var dashState = {};
    devices.forEach(function (d) {
      dashState[d.topic] = '---';
    });

    function renderDash() {
      var html = '';
      devices.forEach(function (d) {
        html += '<div class="info-line" style="font-size:12px;">' +
          '<span class="key" style="color:' + d.color + ';">' + d.name + ':</span> ' +
          '<span class="val">' + dashState[d.topic] + '</span></div>';
      });
      dashValues.innerHTML = html;
    }
    renderDash();

    devices.forEach(function (d) {
      var btn = document.createElement('button');
      btn.className = 'primary-btn';
      btn.style.fontSize = '13px';
      btn.style.padding = '8px 14px';
      btn.style.background = d.color;
      btn.style.color = '#0a0c11';
      btn.textContent = d.name;
      btn.addEventListener('click', function () {
        msgCount++;
        var id = msgCount;

        // Show message flow
        msgArea.innerHTML = '<b>PUBLISH</b> &rarr; Topic: <code class="inline">' + d.topic + '</code> &nbsp; Payload: <code class="inline">' + d.payload + '</code>';

        // Add to broker log
        var logLine = document.createElement('div');
        logLine.textContent = '#' + id + ' ' + d.topic.split('/').pop() + ': ' + d.payload;
        logLine.style.color = d.color;
        brokerLog.insertBefore(logLine, brokerLog.firstChild);

        // Update dashboard after short delay
        setTimeout(function () {
          dashState[d.topic] = d.payload;
          renderDash();
          msgArea.innerHTML += ' &nbsp; <span style="color:#4ade80;">\u2713 Delivered to subscriber</span>';
        }, 400);

        // Vary payloads for realism
        if (d.name === 'Temp Sensor') {
          d.payload = (20 + Math.random() * 8).toFixed(1) + '\u00B0C';
        } else if (d.name === 'Motion Sensor') {
          d.payload = Math.random() > 0.5 ? 'DETECTED' : 'CLEAR';
        } else {
          d.payload = Math.random() > 0.5 ? 'OPEN' : 'CLOSED';
        }
      });
      devCol.appendChild(btn);
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: '<p>You want an ESP32 to send temperature data to a Raspberry Pi every 5 minutes. The Pi runs a dashboard. What protocol would you use between them?</p>',
      mountInput: function (container) {
        var opts = [
          '(a) MQTT — lightweight pub/sub designed for IoT',
          '(b) BLE — Bluetooth Low Energy',
          '(c) SPI — Serial Peripheral Interface',
          '(d) UART — serial over USB cable'
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
        if (v === 'a') return { correct: true, feedback: 'Correct! MQTT over WiFi is the ideal protocol here. It is lightweight, designed for exactly this pattern (sensor publishing to a dashboard subscriber via a broker), and the Raspberry Pi can run a Mosquitto broker plus a dashboard like Grafana or Home Assistant.' };
        if (v === 'b') return { correct: false, feedback: 'BLE would work for short range (~10-30m) but is awkward for periodic data uploads to a dashboard. MQTT over WiFi is the standard pattern for sensor-to-dashboard communication. BLE is better for phone-to-device control.' };
        if (v === 'c') return { correct: false, feedback: 'SPI is a wired bus protocol for chips on the same board — it cannot work wirelessly. You need a network protocol like MQTT over WiFi.' };
        return { correct: false, feedback: 'UART over USB requires a physical cable between the ESP32 and the Pi. For a sensor that might be in another room, you want wireless. MQTT over WiFi is the standard IoT pattern.' };
      },
      hints: [
        'The ESP32 and Pi are likely not right next to each other. You need a wireless protocol.',
        'MQTT is specifically designed for IoT sensor data: publish sensor readings to a topic, subscribe on the dashboard side.',
        'MQTT over WiFi is the answer. The Pi runs a Mosquitto broker, the ESP32 publishes to a topic, the dashboard subscribes.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: '<p>Your ESP32 BLE beacon advertises sensor data every 2 seconds. Each advertisement is 31 bytes. A BLE connection uses ~15 mA average. In <b>advertising-only mode</b> (no connection), average current is ~1 mA. With a <b>500 mAh coin cell</b>, how long does advertising-only mode last? (Answer in days.)</p>',
      mountInput: function (container) {
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.step = 'any';
        inp.placeholder = 'e.g. 15';
        inp.style.width = '120px';
        var unit = document.createElement('span');
        unit.textContent = ' days';
        container.appendChild(inp);
        container.appendChild(unit);
        return function () { return inp.value; };
      },
      check: function (v) {
        var num = parseFloat(v);
        if (isNaN(num)) return { correct: false, feedback: 'Please enter a number.' };
        // 500 mAh / 1 mA = 500 hours = 20.83 days
        var hours = EST.lib.embed.batteryLife(500, 1);
        var days = hours / 24;
        if (num >= 20 && num <= 21.5) return { correct: true, feedback: 'Correct! Battery life = 500 mAh / 1 mA = 500 hours = ' + days.toFixed(1) + ' days. Compare this to connected mode: 500 / 15 = 33.3 hours = just 1.4 days. Advertising-only mode is dramatically more power-efficient.' };
        if (num >= 19 && num < 20) return { correct: false, feedback: 'Very close! 500 mAh / 1 mA = 500 hours. Divide by 24 to get days: 500 / 24 = 20.8 days.' };
        if (num >= 490 && num <= 510) return { correct: false, feedback: 'That looks like the answer in hours, not days! 500 hours / 24 = 20.8 days.' };
        return { correct: false, feedback: 'Battery life = capacity / current draw = 500 mAh / 1 mA = 500 hours. Convert to days: 500 / 24 = ' + days.toFixed(1) + ' days.' };
      },
      hints: [
        'Battery life formula: hours = capacity (mAh) / current draw (mA).',
        '500 mAh / 1 mA = 500 hours. Now convert hours to days.',
        '500 hours / 24 hours per day = 20.8 days.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: '<p>Design an <b>MQTT topic hierarchy</b> for a 3-room house with <b>temperature and humidity sensors</b> in each room, plus a <b>motion sensor</b> at the front door. Write all <b>7 topic names</b>, one per line.</p>',
      mountInput: function (container) {
        var ta = document.createElement('textarea');
        ta.rows = 9;
        ta.cols = 50;
        ta.placeholder = 'home/bedroom/temperature\nhome/bedroom/humidity\n...';
        ta.style.width = '100%';
        ta.style.maxWidth = '500px';
        ta.style.fontFamily = 'monospace';
        container.appendChild(ta);
        return function () { return ta.value; };
      },
      check: function (v) {
        var lines = v.trim().split('\n').map(function (l) { return l.trim().toLowerCase(); }).filter(function (l) { return l.length > 0; });

        if (lines.length < 7) return { correct: false, feedback: 'You need 7 topics: temperature + humidity for each of 3 rooms (6 topics) plus 1 motion sensor at the front door. You only listed ' + lines.length + '.' };

        // Check for key elements
        var hasTemp = 0;
        var hasHumidity = 0;
        var hasMotion = false;
        var hasSlashes = true;
        var hasCommonPrefix = true;

        var prefixes = [];
        lines.forEach(function (line) {
          if (line.indexOf('/') === -1) hasSlashes = false;
          var parts = line.split('/');
          if (parts.length > 0) prefixes.push(parts[0]);

          if (line.indexOf('temp') !== -1) hasTemp++;
          if (line.indexOf('humid') !== -1) hasHumidity++;
          if (line.indexOf('motion') !== -1) hasMotion = true;
        });

        // Check common prefix
        var firstPrefix = prefixes[0];
        prefixes.forEach(function (p) {
          if (p !== firstPrefix) hasCommonPrefix = false;
        });

        var issues = [];
        if (!hasSlashes) issues.push('Topics should use / separators (e.g., home/room/sensor)');
        if (hasTemp < 3) issues.push('Need temperature topics for all 3 rooms (found ' + hasTemp + ')');
        if (hasHumidity < 3) issues.push('Need humidity topics for all 3 rooms (found ' + hasHumidity + ')');
        if (!hasMotion) issues.push('Missing a motion sensor topic for the front door');
        if (!hasCommonPrefix) issues.push('All topics should share a common prefix (e.g., "home/...")');

        if (issues.length === 0) return { correct: true, feedback: 'Excellent! Your hierarchy is well-structured with a common prefix, room-level grouping, and sensor-type leaf nodes. This makes it easy to subscribe to all sensors in one room (home/bedroom/#) or all temperatures (home/+/temperature) using MQTT wildcards.' };

        return { correct: false, feedback: 'Almost! Issues found: ' + issues.join('. ') + '. A good hierarchy might look like: home/bedroom/temperature, home/bedroom/humidity, home/kitchen/temperature, home/kitchen/humidity, home/living-room/temperature, home/living-room/humidity, home/front-door/motion.' };
      },
      hints: [
        'MQTT topics use / as a separator, like file paths. Start with a common prefix like "home/".',
        'You need 3 rooms (e.g., bedroom, kitchen, living-room), each with temperature and humidity. Plus front-door/motion. That is 3*2 + 1 = 7 topics.',
        'Example: home/bedroom/temperature, home/bedroom/humidity, home/kitchen/temperature, home/kitchen/humidity, home/living-room/temperature, home/living-room/humidity, home/front-door/motion.'
      ]
    }
  ]
});
