// Level 13 — Building & diagnostics
HWT.registerLevel({
  id: 13,
  title: 'Building & Diagnostics',
  whyItMatters: 'A new build that won\'t POST is the most common "I built a PC and it doesn\'t work" panic moment. 90% of these are one of about a dozen well-known issues. This level gives you the diagnostic tree.',
  glossary: ['BIOS', 'POST', 'beep code', 'debug LED', 'CPU', 'mobo'],
  learn: ''
    + '<h4>The POST sequence</h4>'
    + '<p>POST = Power On Self Test. Before your OS even thinks about loading, the BIOS/UEFI firmware on the motherboard runs:</p>'
    + '<ol>'
    +   '<li><strong>Power good.</strong> PSU must signal "rails are stable" within ~500 ms of power-on. If not, BIOS doesn\'t even start.</li>'
    +   '<li><strong>CPU init.</strong> Microcode loads, caches initialize, internal busses come up.</li>'
    +   '<li><strong>RAM training.</strong> The IMC tests every DIMM channel — voltages, timings, signal integrity. This takes 5–60 seconds on first boot or after BIOS reset.</li>'
    +   '<li><strong>GPU init.</strong> If iGPU exists, falls back to it; else discrete GPU detected on PCIe.</li>'
    +   '<li><strong>USB / NVMe / SATA enumeration.</strong></li>'
    +   '<li><strong>Boot device selection.</strong> Find a bootloader, hand off control.</li>'
    + '</ol>'
    + '<p>If a stage fails, POST stops there. Modern boards report which stage via:</p>'
    + '<ul>'
    +   '<li><strong>Q-LED / EZ-Debug LED</strong> — 4 little LEDs labeled CPU / DRAM / VGA / BOOT. Whichever stays lit is the failed stage.</li>'
    +   '<li><strong>2-digit POST code display</strong> — premium boards. Numeric error code; look up vendor table.</li>'
    +   '<li><strong>Beep codes</strong> — old-school. 1 long + 2 short = video failure (Award/AMI). Some modern boards drop these.</li>'
    + '</ul>'

    + '<h4>The "won\'t POST" diagnostic tree</h4>'

    + '<h4>1. Nothing happens — no fans, no lights</h4>'
    + '<ul>'
    +   '<li>Wall switch / PSU switch on?</li>'
    +   '<li>24-pin ATX seated fully?</li>'
    +   '<li>8-pin EPS (CPU power) seated? <strong>Most common forget.</strong> Modern boards won\'t POST without it. Don\'t confuse with PCIe 8-pin.</li>'
    +   '<li>Front-panel PWR_SW header connected to motherboard? It\'s small and easy to miss.</li>'
    +   '<li>If PSU has a switch labeled "ON/OFF" on the back — flipped to ON?</li>'
    + '</ul>'

    + '<h4>2. Fans spin briefly, then stop, then maybe spin again ("boot loop")</h4>'
    + '<ul>'
    +   '<li>Almost always RAM. Try one stick at a time in slot A2 (consult manual).</li>'
    +   '<li>Or BIOS doesn\'t support the CPU. Older AM4 board + Ryzen 5000 = needs BIOS update first (use BIOS Flashback if available).</li>'
    + '</ul>'

    + '<h4>3. Fans run, but no display, Q-LED on CPU</h4>'
    + '<ul>'
    +   '<li>CPU not seated correctly (very rare on modern boards) or bent pins on AM4 (PGA chip).</li>'
    +   '<li>BIOS doesn\'t recognize the CPU — needs an update.</li>'
    +   '<li>EPS power not connected or PSU dying.</li>'
    + '</ul>'

    + '<h4>4. Fans run, no display, Q-LED on DRAM</h4>'
    + '<ul>'
    +   '<li>RAM not seated firmly. Press until it clicks — both sides.</li>'
    +   '<li>Wrong slots. Manual specifies which two slots for dual-channel (typically A2 + B2, slots 2 and 4).</li>'
    +   '<li>RAM speed too aggressive — clear CMOS, try at JEDEC default.</li>'
    +   '<li>Incompatible RAM — check the QVL (Qualified Vendors List) on the mobo manufacturer\'s site.</li>'
    + '</ul>'

    + '<h4>5. Fans run, no display, Q-LED on VGA</h4>'
    + '<ul>'
    +   '<li>Most common: GPU not getting power (8-pin / 12VHPWR not seated fully).</li>'
    +   '<li>Monitor connected to mobo HDMI port instead of GPU\'s output (your CPU has no iGPU — see level 1).</li>'
    +   '<li>Monitor cable not seated, monitor on wrong input.</li>'
    +   '<li>GPU not seated in PCIe slot — push down firmly until latch clicks.</li>'
    + '</ul>'

    + '<h4>6. POSTs fine, then OS doesn\'t load (Q-LED on BOOT)</h4>'
    + '<ul>'
    +   '<li>Boot drive missing or in wrong order in BIOS.</li>'
    +   '<li>Bootloader corrupted — recovery USB.</li>'
    +   '<li>Secure Boot or CSM mismatch with installation type.</li>'
    + '</ul>'

    + '<h4>7. Random reboots / shutdowns under load</h4>'
    + '<ul>'
    +   '<li>PSU OCP trip on transient spike — see level 6.</li>'
    +   '<li>Overheat — see level 8.</li>'
    +   '<li>Bad RAM — run MemTest86 overnight (boot from USB).</li>'
    +   '<li>Unstable XMP / overclock — disable, retry stock.</li>'
    + '</ul>'

    + '<h4>8. Blue Screens / Kernel panics</h4>'
    + '<ul>'
    +   '<li>"WHEA_UNCORRECTABLE_ERROR" on Windows = hardware (often CPU/RAM voltage).</li>'
    +   '<li>"PAGE_FAULT_IN_NONPAGED_AREA" or "MEMORY_MANAGEMENT" = often RAM.</li>'
    +   '<li>"CRITICAL_PROCESS_DIED" = often storage.</li>'
    +   '<li>Linux: <code>dmesg</code> tells you exactly which subsystem barfed.</li>'
    + '</ul>'

    + '<h4>The CMOS-clear escape hatch</h4>'
    + '<p>If you\'ve been mucking with BIOS overclocks and the system won\'t POST, <strong>clear CMOS</strong>. Three ways:</p>'
    + '<ol>'
    +   '<li>Press the "Clear CMOS" button if your board has one (premium models).</li>'
    +   '<li>Short the CLR_CMOS pins on the motherboard with a screwdriver for 5 seconds (with the system off).</li>'
    +   '<li>Pull the CR2032 coin battery for 30 seconds with the system off.</li>'
    + '</ol>'
    + '<p>This wipes BIOS settings back to default. Date/time gets reset; everything else (XMP, fan curves, boot order) needs reconfiguring. Good. The point.</p>'

    + '<div class="callout"><div class="label">When all else fails: bench-test</div>'
    + 'Pull the motherboard out of the case, set it on the cardboard box it shipped in. Connect: CPU + cooler + 1 stick of RAM in A2 + GPU + PSU + monitor. No drives, no case fans, no front panel. Use a screwdriver to short the PWR_SW pins. If THIS doesn\'t POST, the case isn\'t the problem (rules out shorts to standoffs). If it DOES POST, the case has a wiring issue.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Pick a symptom. See the most likely causes (in priority order) and the fix.</p>';
    var symptoms = [
      { name: 'No fans, no lights at all', causes: '1. PSU switch off / unplugged.<br>2. 24-pin ATX or 8-pin EPS not seated.<br>3. PWR_SW header not connected to mobo.<br>4. Dead PSU (test with paperclip jumper).' },
      { name: 'Fans spin briefly, then power off, then retry', causes: '1. RAM not seated, wrong slot, or incompatible. Try 1 stick in A2.<br>2. CPU not supported by current BIOS — needs flashback.<br>3. EPS not seated.' },
      { name: 'Fans on, no display, CPU LED lit', causes: '1. EPS connector not seated.<br>2. Bent CPU pins (AM4) or socket pad damage (LGA).<br>3. CPU newer than current BIOS — flash newer BIOS first.' },
      { name: 'Fans on, no display, DRAM LED lit', causes: '1. RAM not fully seated (push to click).<br>2. Wrong slots (consult manual — usually A2 + B2).<br>3. XMP too aggressive — clear CMOS, try JEDEC.<br>4. Bad RAM stick — try one at a time.' },
      { name: 'Fans on, no display, VGA LED lit', causes: '1. GPU power cable(s) not seated.<br>2. Monitor cable on mobo iGPU output instead of GPU port.<br>3. GPU not fully seated in PCIe slot.<br>4. Wrong monitor input selected.' },
      { name: 'POST OK, but no OS — BOOT LED lit', causes: '1. Boot drive not detected / not in BIOS boot order.<br>2. Bootloader corrupted — boot from install media.<br>3. CSM/Secure Boot mismatch with the OS install type.' },
      { name: 'Random shutdowns under heavy load only', causes: '1. PSU OCP trip on transient spike — quality issue or undersized.<br>2. CPU overheat — temps reaching Tjmax + power-off.<br>3. Bad RAM at higher frequencies under load.' },
      { name: 'BSODs every few hours', causes: '1. Run MemTest86 overnight — RAM issues are #1.<br>2. WHEA errors → CPU voltage instability or thermal margin.<br>3. Storage failure — check SMART data with CrystalDiskInfo.' },
      { name: 'Was working, suddenly won\'t POST after BIOS tweaks', causes: 'Clear CMOS:<br>1. Clear CMOS button if you have one.<br>2. Short CLR_CMOS pins for 5 seconds.<br>3. Pull coin battery for 30 seconds.<br>Settings reset to default.' }
    ];
    var pickRow = document.createElement('div'); pickRow.className = 'chip-row';
    var output = document.createElement('div'); output.className = 'formula-box';
    output.innerHTML = '<span class="muted">← click a symptom</span>';
    symptoms.forEach(function (s) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = s.name;
      b.style.maxWidth = '100%';
      b.style.whiteSpace = 'normal';
      b.style.textAlign = 'left';
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(pickRow.querySelectorAll('.chip.active'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        output.innerHTML =
          '<div><strong style="color:var(--accent)">' + s.name + '</strong></div>' +
          '<div style="margin-top:8px">' + s.causes + '</div>';
      });
      pickRow.appendChild(b);
    });
    container.appendChild(pickRow);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'You finish a fresh build, hit power, and... nothing. No fans spin. No lights. PSU is plugged in and the switch on the PSU is in the ON position. What should you check FIRST?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>RAM seating</option>' +
          '<option>The PWR_SW front-panel header to the motherboard</option>' +
          '<option>BIOS version</option>' +
          '<option>GPU PCIe seating</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'The PWR_SW front-panel header to the motherboard') return { correct: true, feedback: 'Right. If absolutely nothing happens — no fans, no lights — the most common cause is the case\'s power button isn\'t wired to the mobo. The PWR_SW pins on the front-panel header are tiny and easy to miss. (Other top suspects: 24-pin/EPS not seated, PSU switch off — but the question said PSU is on.)' };
        return { correct: false, feedback: 'If literally nothing turns on, no part has even tried to draw power yet. The motherboard never gets the "power on" signal. That comes from the front-panel PWR_SW header.' };
      },
      hints: [
        'If absolutely nothing turns on, the mobo never even got the "power on" signal.',
        'That signal comes from the case\'s power button via the front-panel header.',
        'PWR_SW header.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'On power-on the system fans spin, the motherboard lights up, but the screen stays black. The board\'s Q-LED stays lit on the <strong>DRAM</strong> light. You verified the PSU is good. What is your next step?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Replace the GPU</option>' +
          '<option>Re-seat RAM (push until clicks both sides), then try one stick at a time in slot A2</option>' +
          '<option>Update the BIOS</option>' +
          '<option>Replace the CPU</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Re-seat RAM (push until clicks both sides), then try one stick at a time in slot A2') return { correct: true, feedback: 'Right. The DRAM Q-LED literally tells you the failure stage: RAM training failed. The two highest-prior fixes are (a) re-seat sticks (most common — they look seated but aren\'t fully clicked) and (b) try one stick at a time in the slot the manual specifies (typically A2 — slot 2). 80% of "DRAM LED" panic threads are solved by one of those two steps.' };
        return { correct: false, feedback: 'The Q-LED tells you which stage failed. DRAM = RAM. Don\'t replace anything yet — re-seat first.' };
      },
      hints: [
        'The Q-LED tells you which stage failed. DRAM = RAM training.',
        'Most common cause of DRAM LED: not fully seated.',
        'Re-seat RAM, then test sticks individually in slot A2.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A user reports: "PC boots fine and games for ~30 minutes, then suddenly powers off. After it\'s off, I can\'t turn it back on for ~5 minutes. Then it boots normally. Repeats." Multiple components could explain this. Which set of likely causes — IN PRIORITY ORDER — should you investigate?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>(1) PSU OCP trip / weak PSU; (2) CPU/GPU thermal shutdown; (3) bad RAM. Test in this order.</option>' +
          '<option>(1) Failing SSD; (2) network adapter; (3) BIOS bug. Test in this order.</option>' +
          '<option>(1) GPU driver bug; (2) Windows update; (3) malware. Test in this order.</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === '(1) PSU OCP trip / weak PSU; (2) CPU/GPU thermal shutdown; (3) bad RAM. Test in this order.') return { correct: true, feedback: 'Right. Cold cut after sustained load + ~5 min cool-down before re-boot strongly suggests thermal protection (either PSU OCP trip — many PSUs have a thermal lockout — or CPU/GPU emergency shutdown at Tjmax). These two account for the vast majority. Bad RAM under sustained load is third — usually BSODs first, but can hard-cut. Software (driver/Windows/malware) almost never causes a hard power-off; it BSODs or freezes. Hardware causes always come first when the symptom is "no warning, just off."' };
        if (v === '(1) Failing SSD; (2) network adapter; (3) BIOS bug. Test in this order.') return { correct: false, feedback: 'SSD failure causes I/O errors and BSODs, not silent total power-off. Network adapters can\'t cause shutdowns. The 5-minute cool-down hint points directly at thermal protection.' };
        if (v === '(1) GPU driver bug; (2) Windows update; (3) malware. Test in this order.') return { correct: false, feedback: 'Software bugs cause BSODs / freezes, not clean cold cuts of power. The 5-minute "can\'t turn on" cool-down is a giveaway for thermal protection.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'A 5-minute "can\'t restart" cooldown is a HUGE clue. What hardware mechanisms enforce a cooldown?',
        'PSU thermal lockout and CPU/GPU thermal protection both demand cooldown before retry.',
        '(1) PSU OCP / thermal trip; (2) CPU/GPU overheat; (3) RAM. In that order.'
      ]
    }
  ]
});
