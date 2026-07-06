// os.js — OS-trainer math helpers
// Pure functions. ES5-only. Verified by Node smoke test.
window.OST = window.OST || {};
OST.lib = OST.lib || {};

OST.lib.os = (function () {

  // ---------- CPU scheduling ----------
  // Job: { id, arrival, burst }.
  // Returns { gantt: [{id, start, end}], stats: { [id]: { wait, turnaround, completion } } }.

  function fcfs(jobs) {
    var sorted = jobs.slice().sort(function (a, b) { return a.arrival - b.arrival; });
    var t = 0; var gantt = []; var stats = {};
    sorted.forEach(function (j) {
      if (t < j.arrival) { gantt.push({ id: 'idle', start: t, end: j.arrival }); t = j.arrival; }
      var start = t; t += j.burst;
      gantt.push({ id: j.id, start: start, end: t });
      stats[j.id] = { completion: t, turnaround: t - j.arrival, wait: (t - j.arrival) - j.burst };
    });
    return { gantt: gantt, stats: stats };
  }

  function sjfNonPreemptive(jobs) {
    var pending = jobs.slice();
    var t = 0; var gantt = []; var stats = {};
    while (pending.length > 0) {
      var ready = pending.filter(function (j) { return j.arrival <= t; });
      if (ready.length === 0) {
        var nextArr = Math.min.apply(null, pending.map(function (j) { return j.arrival; }));
        gantt.push({ id: 'idle', start: t, end: nextArr });
        t = nextArr;
        continue;
      }
      ready.sort(function (a, b) { return a.burst - b.burst; });
      var pick = ready[0];
      var start = t; t += pick.burst;
      gantt.push({ id: pick.id, start: start, end: t });
      stats[pick.id] = { completion: t, turnaround: t - pick.arrival, wait: (t - pick.arrival) - pick.burst };
      pending = pending.filter(function (j) { return j.id !== pick.id; });
    }
    return { gantt: gantt, stats: stats };
  }

  function roundRobin(jobs, quantum) {
    var arr = jobs.slice().sort(function (a, b) { return a.arrival - b.arrival; });
    var remaining = {}; arr.forEach(function (j) { remaining[j.id] = j.burst; });
    var arrivedIds = []; var queue = []; var t = 0;
    var gantt = []; var stats = {};
    var i = 0;
    function admit() {
      while (i < arr.length && arr[i].arrival <= t) {
        queue.push(arr[i].id);
        arrivedIds.push(arr[i].id);
        i++;
      }
    }
    admit();
    while (queue.length > 0 || i < arr.length) {
      if (queue.length === 0) {
        var nextArr = arr[i].arrival;
        gantt.push({ id: 'idle', start: t, end: nextArr });
        t = nextArr;
        admit();
        continue;
      }
      var id = queue.shift();
      var run = Math.min(quantum, remaining[id]);
      var start = t; t += run; remaining[id] -= run;
      gantt.push({ id: id, start: start, end: t });
      admit();
      if (remaining[id] > 0) queue.push(id);
      else {
        var jobObj = arr.filter(function (j) { return j.id === id; })[0];
        stats[id] = { completion: t, turnaround: t - jobObj.arrival, wait: (t - jobObj.arrival) - jobObj.burst };
      }
    }
    return { gantt: gantt, stats: stats };
  }

  function avgWait(stats) {
    var ids = Object.keys(stats);
    if (!ids.length) return 0;
    var s = 0;
    ids.forEach(function (id) { s += stats[id].wait; });
    return s / ids.length;
  }

  // ---------- Virtual memory translation ----------
  // pageSize in bytes (e.g. 4096). pageTable: array indexed by VPN, each entry { frame, present }.
  // Returns { pageNumber, offset, frame, physical, present }.
  function translate(virtualAddr, pageSize, pageTable) {
    var pageNumber = Math.floor(virtualAddr / pageSize);
    var offset = virtualAddr % pageSize;
    var entry = pageTable[pageNumber];
    if (!entry || !entry.present) return { pageNumber: pageNumber, offset: offset, present: false, fault: true };
    var physical = entry.frame * pageSize + offset;
    return { pageNumber: pageNumber, offset: offset, frame: entry.frame, physical: physical, present: true };
  }

  // TLB hit-rate effective access time:
  //   EAT = hitRate * (tlbTime + memTime) + missRate * (tlbTime + 2 * memTime)
  // The 2 memTime accounts for: 1 access to read page-table entry + 1 to read the actual data.
  function effectiveAccessTime(hitRate, tlbTime, memTime) {
    return hitRate * (tlbTime + memTime) + (1 - hitRate) * (tlbTime + 2 * memTime);
  }

  // Working-set page count: distinct pages referenced in last `windowSize` references.
  function workingSet(refs, windowSize) {
    var window = refs.slice(-windowSize);
    var set = {};
    window.forEach(function (p) { set[p] = true; });
    return Object.keys(set).length;
  }

  // ---------- File systems / permissions ----------
  // Reuse the parser from eth-hacking-trainer's library style. Produces same structure.
  function parsePerm(mode) {
    if (mode.length !== 9) return null;
    function bits(seg) {
      var r = seg[0] === 'r';
      var w = seg[1] === 'w';
      var x = seg[2] === 'x' || seg[2] === 's' || seg[2] === 't';
      var special = seg[2] === 's' || seg[2] === 'S' || seg[2] === 't' || seg[2] === 'T';
      return { r: r, w: w, x: x, special: special };
    }
    var owner = bits(mode.substr(0, 3));
    var group = bits(mode.substr(3, 3));
    var other = bits(mode.substr(6, 3));
    function perm3(b) { return (b.r ? 4 : 0) + (b.w ? 2 : 0) + (b.x ? 1 : 0); }
    var special = (owner.special ? 4 : 0) + (group.special ? 2 : 0) + (other.special ? 1 : 0);
    var octal = '' + special + perm3(owner) + perm3(group) + perm3(other);
    return { owner: owner, group: group, other: other, suid: owner.special, sgid: group.special, sticky: other.special, octal: octal };
  }

  // ---------- Signals ----------
  var SIGNALS = {
    SIGHUP:  { num: 1,  default: 'terminate', catchable: true,  description: 'Hangup; terminal closed. Daemons usually catch and reload config.' },
    SIGINT:  { num: 2,  default: 'terminate', catchable: true,  description: 'Interrupt from keyboard (Ctrl-C). Most programs catch to clean up.' },
    SIGQUIT: { num: 3,  default: 'core+terminate', catchable: true,  description: 'Quit + dump core (Ctrl-\\).' },
    SIGKILL: { num: 9,  default: 'terminate', catchable: false, description: 'Cannot be caught, blocked, or ignored. Forces immediate termination.' },
    SIGSEGV: { num: 11, default: 'core+terminate', catchable: true,  description: 'Segmentation fault — invalid memory access.' },
    SIGTERM: { num: 15, default: 'terminate', catchable: true,  description: 'Polite termination request. Default for "kill PID".' },
    SIGCHLD: { num: 17, default: 'ignore',    catchable: true,  description: 'Child process changed state. Parent typically catches to wait().' },
    SIGSTOP: { num: 19, default: 'stop',      catchable: false, description: 'Suspend process. Cannot be caught.' },
    SIGCONT: { num: 18, default: 'continue',  catchable: true,  description: 'Resume suspended process.' },
    SIGPIPE: { num: 13, default: 'terminate', catchable: true,  description: 'Wrote to a pipe with no reader. SIGPIPE is why "command | head" makes "command" exit early.' }
  };

  // ---------- Helpers ----------
  function fmtAddr(n, bits) { bits = bits || 16; var hex = n.toString(16); while (hex.length < Math.ceil(bits / 4)) hex = '0' + hex; return '0x' + hex; }
  function approxEq(a, b, tol) { tol = tol == null ? 0.01 : tol; return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)); }

  return {
    fcfs: fcfs,
    sjfNonPreemptive: sjfNonPreemptive,
    roundRobin: roundRobin,
    avgWait: avgWait,
    translate: translate,
    effectiveAccessTime: effectiveAccessTime,
    workingSet: workingSet,
    parsePerm: parsePerm,
    SIGNALS: SIGNALS,
    fmtAddr: fmtAddr,
    approxEq: approxEq
  };
})();
