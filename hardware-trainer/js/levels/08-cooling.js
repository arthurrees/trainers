// Level 8 — Cooling & thermals
HWT.registerLevel({
  id: 8,
  title: 'Cooling & Thermals',
  whyItMatters: 'CPUs throttle (slow down) when they get too hot — typically above 95 °C. A perfect CPU on a weak cooler will run slower than a worse CPU on a good cooler. Understanding airflow, the air-vs-AIO trade-off, and fan curves lets you eliminate thermal-throttle losses for free.',
  glossary: ['air cooler', 'AIO', 'TIM', 'fan curve', 'TDP'],
  learn: ''
    + '<h4>Why we cool</h4>'
    + '<p>A CPU under load dissipates 100–250+ W as heat. If that heat doesn\'t leave the chip, the silicon temperature rises until the on-die thermal sensor hits its limit (Tjmax — typically 95–100 °C). At that point the CPU <strong>throttles</strong>: drops clocks, drops voltage, until temp falls. Throttling is the safety mechanism that keeps the chip from cooking itself.</p>'
    + '<p>Goal: keep the CPU below ~85 °C even at 100% load, so it sustains full boost.</p>'

    + '<h4>The thermal chain</h4>'
    + '<p>Heat travels: <code>silicon die → IHS (heat spreader) → thermal paste (TIM) → cooler base → heatsink fins → moving air → out of the case</code>. Any weak link in this chain caps the rest. Common failures:</p>'
    + '<ul>'
    +   '<li>Old/dried-out paste — adds thermal resistance.</li>'
    +   '<li>Cooler not seated flat on the IHS — air gap kills conductivity.</li>'
    +   '<li>Heatsink dust-blocked — fins don\'t exchange heat with air.</li>'
    +   '<li>Bad case airflow — heatsink dumps hot air into a stagnant case.</li>'
    + '</ul>'

    + '<h4>Air cooler vs AIO liquid</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Air cooler</th><th>AIO liquid (closed-loop)</th></tr>'
    + '<tr><td>Capacity</td><td>Up to ~250 W (Noctua NH-D15)</td><td>240 mm: ~250 W. 360 mm: ~350 W.</td></tr>'
    + '<tr><td>Reliability</td><td>10+ years, no maintenance</td><td>~5–8 yr pump life. Coolant evaporation over time.</td></tr>'
    + '<tr><td>Noise</td><td>Big slow fan = quiet</td><td>Pump adds a small constant hum</td></tr>'
    + '<tr><td>Failure mode</td><td>Fan dies — replace</td><td>Pump dies → CPU thermally throttles or shuts down</td></tr>'
    + '<tr><td>Looks</td><td>Big metal block</td><td>Cleaner; pump on CPU; rad mounts in case</td></tr>'
    + '</table>'
    + '<p>For 95% of users, a quality $50–80 air cooler matches a $120 240mm AIO in cooling. The user\'s H100i RGB Platinum is a 240mm AIO — chosen for looks and slightly quieter operation under heavy load, not strictly necessary.</p>'

    + '<h4>Case airflow basics</h4>'
    + '<p>A case is a wind tunnel. Your job: make air flow through it without recirculating.</p>'
    + '<ul>'
    +   '<li><strong>Intake</strong> (front, sometimes bottom) → cool outside air enters.</li>'
    +   '<li>Air passes over GPU, then CPU heatsink.</li>'
    +   '<li><strong>Exhaust</strong> (rear, top) → hot air leaves.</li>'
    + '</ul>'
    + '<p>Most builds aim for slight <strong>positive pressure</strong> — slightly more intake CFM than exhaust. Why: positive pressure pushes dust out through gaps; negative sucks it in.</p>'
    + '<p>Mesh-front cases (Lian Li Lancool, Fractal Torrent, Corsair 4000D Airflow) cool dramatically better than glass-front cases for the same fans. The user\'s Corsair 4000D Airflow has a fully-meshed front exactly for this reason.</p>'

    + '<h4>AIO orientation — the underrated detail</h4>'
    + '<p>An AIO has air bubbles that migrate over time. If the radiator is mounted <em>below</em> the pump, those bubbles end up in the pump and cause cavitation noise + potential pump death. Two acceptable mounts:</p>'
    + '<ul>'
    +   '<li><strong>Front intake</strong> with rad above pump — bubbles rise away from pump. Best cooling. Slightly worse case-air temps than front-exhaust.</li>'
    +   '<li><strong>Top intake/exhaust</strong> with rad above pump — same bubble safety. Convenient mount.</li>'
    + '</ul>'
    + '<p>Don\'t mount the radiator at the bottom of the case (rad below pump) unless the manufacturer explicitly says it\'s OK.</p>'

    + '<h4>Fan curves</h4>'
    + '<p>BIOS / Corsair iCUE / fan-control software lets you map temperature to fan speed. Common shapes:</p>'
    + '<ul>'
    +   '<li><strong>Silent</strong>: idle ≤ 30% RPM until 60 °C, then ramp. Best for office work.</li>'
    +   '<li><strong>Balanced</strong>: linear from 30% at 30 °C to 100% at 80 °C. Default-ish.</li>'
    +   '<li><strong>Performance</strong>: 60% at idle, 100% at 65 °C. Loud but max thermal headroom.</li>'
    + '</ul>'

    + '<h4>Thermal paste / TIM</h4>'
    + '<p>The space between the CPU IHS (top metal cap) and the cooler base is microscopic but not zero — paste fills it. Standard pastes (Arctic MX-4/6, Noctua NT-H1) last 3–5 years before drying out. Liquid metal (Conductonaut) is ~10 °C better but conductive — dangerous on bare-die or aluminum coolers (galvanic corrosion).</p>'
    + '<p>Pea-sized dot in the center, screw down evenly. Don\'t spread it manually — pressure spreads it more uniformly than your finger does.</p>'

    + '<div class="callout"><div class="label">When to repaste</div>'
    + 'Average CPU temps creeping up year-over-year + you\'ve had the system 3+ years = probably time. A 5-min job that often drops temps 5–10 °C.'
    + '</div>',

  mountPlay: function (container) {
    var hw = HWT.lib.hw;
    container.innerHTML = '<p class="muted">Slide the dials. Estimate steady-state CPU temp under 100% load.</p>';

    var state = { ambient: 22, tdp: 142, coolerCap: 200 };
    var output = document.createElement('div'); output.className = 'formula-box';
    var row = document.createElement('div'); row.className = 'controls-row';

    function makeNum(min, max, val, step) {
      var inp = document.createElement('input'); inp.type='number'; inp.min=min; inp.max=max; inp.value=val; inp.step=step||1;
      return inp;
    }

    var ambInp = makeNum(15, 40, state.ambient);
    var tdpInp = makeNum(35, 350, state.tdp, 5);
    var capSel = document.createElement('select');
    [
      { name: 'Stock cooler', cap: 80 },
      { name: 'Budget tower (~$30)', cap: 130 },
      { name: 'Quality tower (Hyper 212, Peerless Assassin) ~$40', cap: 180 },
      { name: 'High-end air (NH-D15, Dark Rock Pro 4)', cap: 250 },
      { name: '240mm AIO (H100i Platinum)', cap: 250 },
      { name: '360mm AIO (premium)', cap: 350 }
    ].forEach(function (c) {
      var o = document.createElement('option'); o.value = c.cap; o.textContent = c.name + ' (~' + c.cap + ' W cap)'; capSel.appendChild(o);
    });
    capSel.value = state.coolerCap;

    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    row.appendChild(lbl('Ambient °C:', ambInp));
    row.appendChild(lbl('CPU TDP under load:', tdpInp));
    row.appendChild(lbl('Cooler:', capSel));

    function update() {
      state.ambient = parseInt(ambInp.value, 10);
      state.tdp = parseInt(tdpInp.value, 10);
      state.coolerCap = parseInt(capSel.value, 10);
      var t = hw.thermalEstTemp(state.ambient, state.tdp, state.coolerCap);
      var status = t < 75 ? { c: 'good', text: 'Good — full boost sustained' } :
                   t < 85 ? { c: 'good', text: 'Fine — full boost, mild headroom' } :
                   t < 95 ? { c: 'warn', text: 'Hot — close to throttle limit on hot days' } :
                              { c: 'bad', text: 'Will throttle — performance loss inevitable' };
      output.innerHTML =
        '<div class="info-line"><span class="key">Estimated CPU steady-state:</span> <span class="val"><span class="result" style="color:var(--' + status.c + ')">' + Math.round(t) + ' °C</span> — ' + status.text + '</span></div>' +
        '<div class="info-line muted">(rough model: T_cpu ≈ ambient + (TDP / cooler_cap) × 60. Real temps depend on case airflow, paste, ambient humidity, etc.)</div>';
    }
    [ambInp, tdpInp, capSel].forEach(function (el) { el.addEventListener('input', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'Your CPU temperature monitoring shows: idle = 38 °C, but during a Cinebench run it climbs to 95 °C and the CPU clocks visibly drop from 4.6 GHz to 4.0 GHz. What is happening?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Power-saving feature kicked in to lower noise</option>' +
          '<option>Thermal throttling — the CPU dropped clocks to stay below Tjmax</option>' +
          '<option>The CPU has reached its base clock; this is normal</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Thermal throttling — the CPU dropped clocks to stay below Tjmax') return { correct: true, feedback: 'Right. 95 °C is at or near Tjmax for most modern CPUs. The chip self-protects by lowering frequency and voltage. Solution: better cooler, repaste, better case airflow, or undervolt the CPU. The dropped clocks are the visible cost of the cooling failure.' };
        return { correct: false, feedback: 'Hitting 95 °C and watching clocks drop is the textbook description of thermal throttle. The CPU is protecting itself.' };
      },
      hints: [
        'Modern CPUs have a max safe temp called Tjmax (~95–100 °C).',
        'When they hit it, they drop clocks to stay below.',
        'Thermal throttling.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A user installs a high-end 240mm AIO. They mount the radiator <strong>at the bottom of the case</strong> (intake) with the pump above it on the CPU. Within 6 months the AIO starts making gurgling noises and CPU temps climb. What\'s the likely cause?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Coolant evaporated — needs refilling</option>' +
          '<option>Air bubbles migrated to the pump (pump higher than rad) — cavitation</option>' +
          '<option>Dust on the radiator</option>' +
          '<option>Pump is normal-quality and dies after 6 months always</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Air bubbles migrated to the pump (pump higher than rad) — cavitation') return { correct: true, feedback: 'Right. AIOs aren\'t 100% liquid — small air pockets are unavoidable in a sealed loop. Air rises. If the pump is the highest point in the loop, those bubbles collect there → cavitation noise + reduced pump efficiency + accelerated wear. Mount the radiator at or above the pump (front intake or top mount). The user\'s case (Corsair 4000D Airflow) supports both correctly.' };
        if (v === 'Coolant evaporated — needs refilling') return { correct: false, feedback: 'Closed-loop AIOs lose ~5% over 5 years; not enough to cause symptoms in 6 months.' };
        if (v === 'Dust on the radiator') return { correct: false, feedback: 'Dust raises temps but doesn\'t cause gurgling noises. The noise pattern + bottom-mount red flag points elsewhere.' };
        return { correct: false, feedback: 'Pump higher than radiator → air bubbles end up in pump → cavitation.' };
      },
      hints: [
        'AIOs always contain a tiny amount of air. Where does air go in a liquid-filled loop?',
        'Bubbles rise. The pump is the highest part of this loop.',
        'Bubbles in the pump = cavitation noise + accelerated wear.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have these data points: ambient 22 °C, CPU TDP under load 142 W (Ryzen 9 3900X). Currently a 130 W stock-tier cooler. Estimated steady-state CPU temp using <code>T ≈ ambient + (TDP / cooler_cap) × 60</code>. Calculate the temperature, then say whether the CPU will likely thermally throttle (Tjmax = 95 °C).',
      mountInput: function (c) {
        var inp = document.createElement('input'); inp.type='number'; inp.placeholder='estimated °C';
        c.appendChild(inp);
        return function () { return parseInt(inp.value, 10); };
      },
      check: function (v) {
        // 22 + (142/130) * 60 = 22 + 65.5 = 87.5 → ~88 °C
        if (v >= 86 && v <= 90) return { correct: true, feedback: 'Right — ~88 °C. Above 85 but below the 95 °C throttle floor, so it would normally hold full boost… but on a 30 °C summer day, +8 °C ambient pushes it to ~96 °C and the chip throttles. The cooler is mismatched: a 142 W chip on a 130 W cooler = no headroom for hot ambient or sustained loads. Recommendation: upgrade to a Peerless Assassin / NH-D15 / 240mm AIO (180–250 W cap).' };
        return { correct: false, feedback: '22 + (142 / 130) × 60 = 22 + ~65.5 = ~88 °C. Right at the edge of throttle in summer.' };
      },
      hints: [
        'Plug into the formula. ambient = 22, TDP = 142, cap = 130.',
        '22 + (142/130) × 60 = 22 + 65.5 = 87.5 °C.',
        'Round to ~88. Below throttle today, but no margin — summer ambient bumps it over.'
      ]
    }
  ]
});
