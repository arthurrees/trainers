// rx.js — the regex engine wrapper + shared interactive surfaces.
// Every level leans on this. It uses the browser's NATIVE RegExp engine for all
// real matching (so behavior is exactly JavaScript regex), plus a tiny separate
// instrumented backtracker (backtrackSteps) used only to *illustrate* catastrophic
// backtracking in the performance level.
window.RXT = window.RXT || {};
RXT.lib = RXT.lib || {};

RXT.lib.rx = (function () {

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // ---- core: build / strip flags ----

  function dedupeFlags(flags) {
    flags = flags || '';
    var seen = {};
    var out = '';
    for (var i = 0; i < flags.length; i++) {
      var c = flags[i];
      if (!seen[c]) { seen[c] = true; out += c; }
    }
    return out;
  }

  // Build a native RegExp; throws a friendly Error on invalid syntax.
  function build(pattern, flags) {
    try {
      return new RegExp(pattern, dedupeFlags(flags));
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      throw new Error(msg);
    }
  }

  function ensureGlobal(flags) {
    flags = dedupeFlags(flags);
    if (flags.indexOf('g') === -1) flags += 'g';
    return flags;
  }

  // Remove the flags that make .test()/.exec() stateful, so check() calls are pure.
  function stripIter(flags) {
    return dedupeFlags(flags).replace(/[gy]/g, '');
  }

  // ---- matching ----

  // All non-overlapping matches across text (always iterates globally).
  // Returns [{ index, text, groups:[full, g1, g2,...], named:{} | null }].
  function matches(pattern, flags, text) {
    var re = build(pattern, ensureGlobal(flags));
    text = (text == null) ? '' : String(text);
    var res = [];
    var m, guard = 0;
    while ((m = re.exec(text)) !== null) {
      res.push({
        index: m.index,
        text: m[0],
        groups: Array.prototype.slice.call(m),
        named: m.groups ? m.groups : null
      });
      if (m[0].length === 0) re.lastIndex++;   // zero-width: step forward
      if (++guard > 200000) break;             // pathological guard
    }
    return res;
  }

  // Does the regex find a match ANYWHERE in text?
  function test(pattern, flags, text) {
    return build(pattern, stripIter(flags)).test((text == null) ? '' : String(text));
  }

  // Does the regex match the ENTIRE text? (wraps as ^(?:...)$, keeps i/m/s/u).
  function matchesWhole(pattern, flags, text) {
    var re = build('^(?:' + pattern + ')$', stripIter(flags));
    return re.test((text == null) ? '' : String(text));
  }

  // First match's capture detail, or null.
  function capture(pattern, flags, text) {
    var re = build(pattern, stripIter(flags));
    var m = re.exec((text == null) ? '' : String(text));
    if (!m) return null;
    return {
      whole: m[0],
      groups: Array.prototype.slice.call(m, 1),
      named: m.groups ? m.groups : null,
      index: m.index
    };
  }

  // Native String.prototype.replace semantics ($1, $<name>, $&, $`, $').
  function replace(pattern, flags, text, replacement) {
    var re = build(pattern, flags);
    return String((text == null) ? '' : text).replace(re, replacement);
  }

  // Escape regex metacharacters so s matches literally.
  function escapeLiteral(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ---- highlight rendering ----

  // Build escaped HTML for `text` with <mark> around each match in `ms`
  // (ms = output of matches()). Adjacent matches alternate color. Zero-width
  // matches render a thin caret so they are visible. Newlines are preserved by
  // the .rx-output { white-space: pre-wrap } rule.
  function highlightHtml(text, ms) {
    text = (text == null) ? '' : String(text);
    var out = '', pos = 0, color = 0;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.index < pos) continue; // ignore any overlap
      out += esc(text.slice(pos, m.index));
      if (m.text.length === 0) {
        out += '<span class="rx-zero" title="zero-width match"></span>';
      } else {
        out += '<mark class="rx-hit' + (color % 2 ? ' rx-hit-2' : '') + '">' + esc(m.text) + '</mark>';
        color++;
      }
      pos = m.index + m.text.length;
    }
    out += esc(text.slice(pos));
    return out;
  }

  // One-call helper: returns { html, count, error }.
  function highlight(pattern, flags, text) {
    try {
      var ms = matches(pattern, flags, text);
      return { html: highlightHtml(text, ms), count: ms.length, error: null };
    } catch (e) {
      return { html: esc((text == null) ? '' : String(text)), count: 0, error: e.message };
    }
  }

  // ---- shared interactive surface: the live tester ----
  // opts: { pattern, flags, text, editableText (true), flagToggles (['g','i','m','s']),
  //         rows (5), showGroups (true), label ('Pattern') }
  // Returns { getState: function(){ return {pattern, flags, text}; } }.
  function mountTester(container, opts) {
    opts = opts || {};
    var pattern = opts.pattern != null ? opts.pattern : '';
    var flags = dedupeFlags(opts.flags != null ? opts.flags : 'g');
    var text = opts.text != null ? opts.text : '';
    var editableText = opts.editableText !== false;
    var toggles = opts.flagToggles || ['g', 'i', 'm', 's'];
    var rows = opts.rows || 5;
    var showGroups = opts.showGroups !== false;

    container.innerHTML = '';

    // Pattern row: /  [input]  /  flags
    var pRow = document.createElement('div');
    pRow.className = 'rx-pattern-row';
    var slash1 = document.createElement('span'); slash1.className = 'rx-slash'; slash1.textContent = '/';
    var pIn = document.createElement('input');
    pIn.type = 'text'; pIn.className = 'rx-pattern-input'; pIn.value = pattern;
    pIn.spellcheck = false; pIn.setAttribute('autocomplete', 'off');
    var slash2 = document.createElement('span'); slash2.className = 'rx-slash'; slash2.textContent = '/';
    pRow.appendChild(slash1); pRow.appendChild(pIn); pRow.appendChild(slash2);

    var flagChips = {};
    if (toggles.length) {
      var fWrap = document.createElement('span'); fWrap.className = 'rx-flags';
      toggles.forEach(function (f) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'rx-flag-chip' + (flags.indexOf(f) !== -1 ? ' active' : '');
        chip.textContent = f;
        chip.title = flagName(f);
        chip.addEventListener('click', function () {
          chip.classList.toggle('active');
          update();
        });
        flagChips[f] = chip;
        fWrap.appendChild(chip);
      });
      pRow.appendChild(fWrap);
    }
    container.appendChild(pRow);

    // Sample text
    var textHost;
    if (editableText) {
      textHost = document.createElement('textarea');
      textHost.className = 'rx-sample';
      textHost.rows = rows;
      textHost.value = text;
      textHost.spellcheck = false;
    } else {
      textHost = document.createElement('div');
      textHost.className = 'rx-sample-fixed';
      textHost.textContent = text;
    }
    container.appendChild(textHost);

    // Status + output
    var status = document.createElement('div');
    status.className = 'rx-status';
    container.appendChild(status);

    var output = document.createElement('div');
    output.className = 'rx-output';
    container.appendChild(output);

    var groupsHost = null;
    if (showGroups) {
      groupsHost = document.createElement('div');
      groupsHost.className = 'rx-groups';
      container.appendChild(groupsHost);
    }

    function currentFlags() {
      var f = '';
      toggles.forEach(function (fl) { if (flagChips[fl] && flagChips[fl].classList.contains('active')) f += fl; });
      return f;
    }
    function currentText() {
      return editableText ? textHost.value : text;
    }

    function update() {
      var pat = pIn.value;
      var fl = currentFlags();
      var txt = currentText();
      if (pat === '') {
        status.innerHTML = '<span class="muted">Type a pattern above.</span>';
        output.innerHTML = esc(txt);
        if (groupsHost) groupsHost.innerHTML = '';
        return;
      }
      var res = highlight(pat, fl, txt);
      if (res.error) {
        status.innerHTML = '<span class="rx-err">⚠ ' + esc(res.error) + '</span>';
        output.innerHTML = esc(txt);
        if (groupsHost) groupsHost.innerHTML = '';
        return;
      }
      status.innerHTML = '<span class="rx-count">' + res.count + ' match' + (res.count === 1 ? '' : 'es') + '</span>';
      output.innerHTML = res.html || '<span class="muted">(empty)</span>';
      if (groupsHost) renderGroups(groupsHost, pat, fl, txt);
    }

    pIn.addEventListener('input', update);
    if (editableText) textHost.addEventListener('input', update);
    update();

    return {
      getState: function () { return { pattern: pIn.value, flags: currentFlags(), text: currentText() }; },
      update: update
    };
  }

  function renderGroups(host, pattern, flags, text) {
    host.innerHTML = '';
    var ms;
    try { ms = matches(pattern, flags, text); } catch (e) { return; }
    // Only show groups if the pattern actually has capture groups.
    var hasGroups = ms.some(function (m) { return m.groups.length > 1; });
    var hasNamed = ms.some(function (m) { return m.named && Object.keys(m.named).length; });
    if (!hasGroups && !hasNamed) return;
    var show = ms.slice(0, 5);
    var html = '<div class="rx-groups-title">Capture groups (first ' + show.length + ' match' + (show.length === 1 ? '' : 'es') + ')</div>';
    show.forEach(function (m, i) {
      html += '<div class="rx-group-row"><span class="rx-group-k">match ' + (i + 1) + '</span>'
        + '<span class="rx-group-v">' + esc(m.text) + '</span></div>';
      for (var g = 1; g < m.groups.length; g++) {
        var v = m.groups[g];
        html += '<div class="rx-group-row rx-group-sub"><span class="rx-group-k">$' + g + '</span>'
          + '<span class="rx-group-v">' + (v === undefined ? '<span class="muted">(no match)</span>' : esc(v)) + '</span></div>';
      }
      if (m.named) {
        Object.keys(m.named).forEach(function (name) {
          html += '<div class="rx-group-row rx-group-sub"><span class="rx-group-k">&lt;' + esc(name) + '&gt;</span>'
            + '<span class="rx-group-v">' + (m.named[name] === undefined ? '<span class="muted">(no match)</span>' : esc(m.named[name])) + '</span></div>';
        });
      }
    });
    host.innerHTML = html;
  }

  // ---- compact pattern field for puzzles ----
  // opts: { placeholder, flags ('' ), flagToggles ([]), previewText (string),
  //         previewList ([{label,text}]) }
  // Returns getValue -> { pattern, flags }.
  function patternField(container, opts) {
    opts = opts || {};
    var toggles = opts.flagToggles || [];
    var flags = dedupeFlags(opts.flags || '');

    var wrap = document.createElement('div');
    wrap.className = 'rx-field';

    var row = document.createElement('div');
    row.className = 'rx-pattern-row';
    var s1 = document.createElement('span'); s1.className = 'rx-slash'; s1.textContent = '/';
    var input = document.createElement('input');
    input.type = 'text'; input.className = 'rx-pattern-input';
    input.placeholder = opts.placeholder || 'your pattern';
    input.spellcheck = false; input.setAttribute('autocomplete', 'off');
    var s2 = document.createElement('span'); s2.className = 'rx-slash'; s2.textContent = '/';
    row.appendChild(s1); row.appendChild(input); row.appendChild(s2);

    var flagChips = {};
    if (toggles.length) {
      var fWrap = document.createElement('span'); fWrap.className = 'rx-flags';
      toggles.forEach(function (f) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'rx-flag-chip' + (flags.indexOf(f) !== -1 ? ' active' : '');
        chip.textContent = f; chip.title = flagName(f);
        chip.addEventListener('click', function () { chip.classList.toggle('active'); preview(); });
        flagChips[f] = chip;
        fWrap.appendChild(chip);
      });
      row.appendChild(fWrap);
    }
    wrap.appendChild(row);

    var pv = null;
    if (opts.previewText != null || opts.previewList) {
      pv = document.createElement('div');
      pv.className = 'rx-preview';
      wrap.appendChild(pv);
    }

    function currentFlags() {
      if (!toggles.length) return flags;
      var f = '';
      toggles.forEach(function (fl) { if (flagChips[fl] && flagChips[fl].classList.contains('active')) f += fl; });
      return f;
    }

    function preview() {
      if (!pv) return;
      var pat = input.value;
      if (pat === '') { pv.innerHTML = '<span class="muted">live preview appears here</span>'; return; }
      var fl = currentFlags();
      if (opts.previewList) {
        var html = '';
        opts.previewList.forEach(function (item) {
          var r = highlight(pat, fl, item.text);
          var lab = item.label ? '<span class="rx-pv-label">' + esc(item.label) + '</span>' : '';
          if (r.error) { html += '<div class="rx-pv-row">' + lab + '<span class="rx-err">⚠ ' + esc(r.error) + '</span></div>'; }
          else { html += '<div class="rx-pv-row">' + lab + '<span class="rx-pv-text">' + (r.html || esc(item.text)) + '</span></div>'; }
        });
        pv.innerHTML = html;
      } else {
        var res = highlight(pat, fl, opts.previewText);
        if (res.error) pv.innerHTML = '<span class="rx-err">⚠ ' + esc(res.error) + '</span>';
        else pv.innerHTML = '<span class="muted">matches:</span> ' + (res.html || '<span class="muted">(none)</span>') + ' <span class="rx-count">(' + res.count + ')</span>';
      }
    }

    input.addEventListener('input', preview);
    preview();
    container.appendChild(wrap);

    return function () { return { pattern: input.value, flags: currentFlags() }; };
  }

  function flagName(f) {
    return ({ g: 'global, find all matches', i: 'ignoreCase', m: 'multiline, ^ and $ match line ends',
      s: 'dotAll, . matches newlines too', u: 'unicode', y: 'sticky' })[f] || f;
  }

  // ---- instrumented backtracker (ILLUSTRATION ONLY, level 13) ----
  // Supports a small subset: literal chars, '.', char classes [..] (ranges + ^neg),
  // groups ( ... ), and greedy quantifiers * + ? on any atom. No anchors, no
  // alternation, no escapes. Returns { matched, steps } where steps counts atom-
  // match attempts — this is what blows up under catastrophic backtracking.
  function parseSub(pattern) {
    var i = 0;
    function parseSeq(stopAtParen) {
      var nodes = [];
      while (i < pattern.length) {
        var c = pattern[i];
        if (c === ')') { if (stopAtParen) break; throw new Error('unbalanced )'); }
        var atom = parseAtom();
        var q = '';
        if (i < pattern.length && (pattern[i] === '*' || pattern[i] === '+' || pattern[i] === '?')) {
          q = pattern[i]; i++;
        }
        atom.quant = q;
        nodes.push(atom);
      }
      return nodes;
    }
    function parseAtom() {
      var c = pattern[i];
      if (c === '(') {
        i++;
        var body = parseSeq(true);
        if (pattern[i] !== ')') throw new Error('expected )');
        i++;
        return { type: 'group', body: body };
      }
      if (c === '[') {
        i++;
        var neg = false;
        if (pattern[i] === '^') { neg = true; i++; }
        var set = [];
        while (i < pattern.length && pattern[i] !== ']') {
          var ch = pattern[i];
          if (pattern[i + 1] === '-' && pattern[i + 2] && pattern[i + 2] !== ']') {
            set.push({ from: ch, to: pattern[i + 2] }); i += 3;
          } else { set.push({ from: ch, to: ch }); i++; }
        }
        if (pattern[i] !== ']') throw new Error('expected ]');
        i++;
        return { type: 'class', neg: neg, set: set };
      }
      if (c === '.') { i++; return { type: 'dot' }; }
      if (c === '*' || c === '+' || c === '?') throw new Error('nothing to repeat');
      i++;
      return { type: 'char', ch: c };
    }
    var seq = parseSeq(false);
    if (i < pattern.length) throw new Error('unexpected ' + pattern[i]);
    return seq;
  }

  function inClass(node, ch) {
    var hit = false;
    for (var k = 0; k < node.set.length; k++) {
      var r = node.set[k];
      if (ch >= r.from && ch <= r.to) { hit = true; break; }
    }
    return node.neg ? !hit : hit;
  }

  function backtrackSteps(pattern, text, cap) {
    cap = cap || 5000000;
    var nodes = parseSub(pattern);
    var steps = { n: 0, blown: false };

    function matchAtom(node, pos, cont) {
      steps.n++;
      if (steps.n > cap) { steps.blown = true; return false; }
      if (node.type === 'char') {
        if (text[pos] === node.ch) return cont(pos + 1);
        return false;
      }
      if (node.type === 'dot') {
        if (pos < text.length) return cont(pos + 1);
        return false;
      }
      if (node.type === 'class') {
        if (pos < text.length && inClass(node, text[pos])) return cont(pos + 1);
        return false;
      }
      if (node.type === 'group') {
        return matchSeq(node.body, 0, pos, cont);
      }
      return false;
    }

    function matchQuant(node, pos, cont) {
      var q = node.quant;
      if (q === '') return matchAtom(node, pos, cont);
      if (q === '?') {
        if (matchAtom(node, pos, cont)) return true;
        return cont(pos);
      }
      // * and + : greedy with backtracking
      var min = (q === '+') ? 1 : 0;
      function rep(p, count) {
        if (steps.blown) return false;
        var more = matchAtom(node, p, function (p2) {
          if (p2 === p) return false; // zero-width guard
          return rep(p2, count + 1);
        });
        if (more) return true;
        if (count >= min) return cont(p);
        return false;
      }
      return rep(pos, 0);
    }

    function matchSeq(seq, idx, pos, cont) {
      if (steps.blown) return false;
      if (idx >= seq.length) return cont(pos);
      return matchQuant(seq[idx], pos, function (p2) {
        return matchSeq(seq, idx + 1, p2, cont);
      });
    }

    var matched = matchSeq(nodes, 0, 0, function (p) { return true; });
    return { matched: matched, steps: steps.n, blown: steps.blown };
  }

  return {
    esc: esc,
    build: build,
    matches: matches,
    test: test,
    matchesWhole: matchesWhole,
    capture: capture,
    replace: replace,
    escapeLiteral: escapeLiteral,
    highlightHtml: highlightHtml,
    highlight: highlight,
    mountTester: mountTester,
    patternField: patternField,
    backtrackSteps: backtrackSteps
  };
})();
