// Level 11 — Grammars and Derivations
DMT.registerLevel({
  id: 11,
  title: 'Grammars & Derivations',
  whyItMatters: 'A grammar is a finite set of rules that describes infinitely many valid strings. Programming-language syntax, parsers, data formats, and protocol messages all start here.',
  glossary: ['ε', '⇒'],
  learn: ''
    + '<h4>A rule system for strings</h4>'
    + '<p>A <strong>formal grammar</strong> builds strings by repeatedly replacing symbols according to production rules. A grammar has:</p>'
    + '<ul><li><strong>Terminals</strong>: symbols that appear in the finished string, such as <code class="inline">a</code> and <code class="inline">b</code>.</li>'
    + '<li><strong>Nonterminals</strong>: placeholders still waiting to be expanded, often capital letters such as <code class="inline">S</code>.</li>'
    + '<li>A <strong>start symbol</strong>: the nonterminal where every derivation begins.</li>'
    + '<li><strong>Productions</strong>: replacement rules, written with <code class="inline">→</code>.</li></ul>'
    + '<p>The symbol <code class="inline">ε</code> (epsilon) means the empty string: a string containing zero characters.</p>'
    + '<div class="example"><div class="label">Example grammar</div>'
    + '<code class="inline">S → aSb | ε</code><br><br>'
    + 'The vertical bar means “or.” Each use of <code class="inline">aSb</code> adds one a on the left and one b on the right. Choosing ε stops the derivation.'
    + '</div>'
    + '<div class="example"><div class="label">Derive aabb</div>'
    + '<code class="inline">S ⇒ aSb ⇒ aaSbb ⇒ aabb</code><br>'
    + 'The final step replaces S with ε. The double arrow means “derives in one step.”'
    + '</div>'
    + '<h4>The language of a grammar</h4>'
    + '<p>The <strong>language</strong> is the set of every terminal-only string the grammar can produce. For this grammar:</p>'
    + '<div class="formula-box">L = { ε, ab, aabb, aaabbb, ... } = { aⁿbⁿ | n ≥ 0 }</div>'
    + '<p>A <strong>parse tree</strong> records which productions were used. Its root is the start symbol; reading the terminal leaves from left to right gives the generated string.</p>'
    + '<div class="callout"><div class="label">Do not confuse generation with recognition</div>'
    + 'A grammar <em>generates</em> valid strings. A machine or parser <em>recognizes</em> whether an input belongs to the language. The next level focuses on recognition.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Build a derivation with S → aSb | ε. “Wrap” uses aSb; “Finish” replaces S with ε.</p>'
      + '<div id="grammar-current" class="formula-box" aria-live="polite"></div>'
      + '<div class="controls-row"><button class="secondary-btn" id="grammar-wrap">Apply S → aSb</button><button class="primary-btn" id="grammar-finish">Apply S → ε</button><button class="ghost-btn" id="grammar-reset">Reset</button></div>'
      + '<div id="grammar-history" class="muted"></div>';
    var current = 'S', history = ['S'];
    var out = container.querySelector('#grammar-current');
    var hist = container.querySelector('#grammar-history');
    function render() {
      out.textContent = current;
      hist.textContent = history.join(' ⇒ ');
      container.querySelector('#grammar-wrap').disabled = current.indexOf('S') === -1;
      container.querySelector('#grammar-finish').disabled = current.indexOf('S') === -1;
    }
    container.querySelector('#grammar-wrap').addEventListener('click', function () { current = current.replace('S', 'aSb'); history.push(current); render(); });
    container.querySelector('#grammar-finish').addEventListener('click', function () { current = current.replace('S', ''); history.push(current || 'ε'); render(); });
    container.querySelector('#grammar-reset').addEventListener('click', function () { current = 'S'; history = ['S']; render(); });
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'For the grammar <code class="inline">S → 0S1 | ε</code>, which symbols are terminals?',
      mountInput: function (c) {
        var opts = ['S only', '0 and 1', 'S, 0, and 1', 'ε only'];
        var s = document.createElement('select');
        s.innerHTML = '<option value="-1">— pick one —</option>' + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(s); return function () { return parseInt(s.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: '0 and 1 remain in finished strings. S is a nonterminal placeholder; ε means “produce no character.”' };
        return { correct: false, feedback: 'Terminals appear in finished strings. Here they are 0 and 1.' };
      },
      hints: ['A terminal remains after the derivation is finished.', 'S must be replaced, so it is a nonterminal.', 'The terminals are 0 and 1.']
    },
    {
      difficulty: 'medium',
      prompt: 'Which strings belong to the language generated by <code class="inline">S → aSb | ε</code>? Tick all that apply.',
      mountInput: function (c) {
        var items = [{label:'ε (empty string)',t:true},{label:'ab',t:true},{label:'aabb',t:true},{label:'abab',t:false},{label:'aaabb',t:false}];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) { var l=document.createElement('label'), b=document.createElement('input');b.type='checkbox';l.appendChild(b);l.appendChild(document.createTextNode(' '+it.label));div.appendChild(l);return{cb:b,expected:it.t}; });
        c.appendChild(div); return function(){return boxes.map(function(b){return{picked:b.cb.checked,expected:b.expected};});};
      },
      check: function (v) {
        if (v.every(function (b) { return b.picked === b.expected; })) return { correct: true, feedback: 'The grammar produces exactly aⁿbⁿ: all a symbols first, then the same number of b symbols.' };
        return { correct: false, feedback: 'Each wrap adds one a before S and one b after S. Valid choices are ε, ab, and aabb.' };
      },
      hints: ['Every use of aSb adds one a and one b.', 'All a symbols must come before all b symbols.', 'Choose ε, ab, and aabb.']
    },
    {
      difficulty: 'hard',
      prompt: 'For <code class="inline">S → aSb | ε</code>, a learner writes <code class="inline">S ⇒ aSb ⇒ abSb ⇒ ababb</code>. What is the first problem?',
      mountInput: function (c) {
        var opts = ['The first step S ⇒ aSb is illegal.', 'The step aSb ⇒ abSb uses a production the grammar does not have.', 'The final string has equal numbers of a and b, so it is valid.', 'A derivation may never contain S.'];
        var s=document.createElement('select');s.innerHTML='<option value="-1">— pick one —</option>'+opts.map(function(o,i){return'<option value="'+i+'">'+o+'</option>';}).join('');c.appendChild(s);return function(){return parseInt(s.value,10);};
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Correct. The only replacements for S are aSb and ε. Replacing S with aSb would produce aaSbb, not abSb.' };
        return { correct: false, feedback: 'Inspect the first changed S. From aSb, the next legal forms are aaSbb (wrap again) or ab (finish).' };
      },
      hints: ['Check each arrow against the two productions.', 'From aSb, replacing S with aSb gives aaSbb.', 'So aSb ⇒ abSb is the first illegal step.']
    }
  ]
});
