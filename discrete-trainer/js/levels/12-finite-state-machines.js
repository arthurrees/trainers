// Level 12 — Finite-State Machines
DMT.registerLevel({
  id: 12,
  title: 'Finite-State Machines',
  whyItMatters: 'Finite-state machines model systems with a limited memory: parsers, protocol states, UI workflows, game logic, controllers, and regular-expression engines.',
  glossary: ['DFA', 'alphabet', 'accepting state'],
  learn: ''
    + '<h4>A machine with limited memory</h4>'
    + '<p>A <strong>deterministic finite automaton</strong> (DFA) reads one input symbol at a time and remembers only its current state. It has:</p>'
    + '<ul><li>A finite set of <strong>states</strong>.</li><li>An input <strong>alphabet</strong> such as <code class="inline">{0,1}</code>.</li>'
    + '<li>One <strong>start state</strong>.</li><li>Zero or more <strong>accepting states</strong>.</li>'
    + '<li>A <strong>transition</strong> for every state and input symbol.</li></ul>'
    + '<p>After the entire string is read, the DFA accepts exactly when its current state is accepting. A DFA never guesses: a state and symbol determine exactly one next state.</p>'
    + '<div class="example"><div class="label">Even number of 1s</div>'
    + 'Use two states: <code class="inline">EVEN</code> (start and accepting) and <code class="inline">ODD</code>. Reading 0 keeps the state unchanged. Reading 1 toggles EVEN ↔ ODD.<br><br>'
    + '<code class="inline">1011</code>: EVEN → ODD → ODD → EVEN → ODD, so reject. The string has three 1s.'
    + '</div>'
    + '<h4>Transition table</h4>'
    + '<table class="truth-table"><thead><tr><th>Current</th><th>read 0</th><th>read 1</th></tr></thead><tbody>'
    + '<tr><td>EVEN (start, accept)</td><td>EVEN</td><td>ODD</td></tr><tr><td>ODD</td><td>ODD</td><td>EVEN</td></tr></tbody></table>'
    + '<div class="callout"><div class="label">DFA versus grammar</div>'
    + 'A DFA recognizes a <strong>regular language</strong>. Some languages need more memory than any finite number of states can provide. For example, recognizing exactly aⁿbⁿ for arbitrary n requires remembering how many a symbols appeared.'
    + '</div>'
    + '<h4>Designing a DFA</h4>'
    + '<p>Give each state a plain-English invariant: what fact about the input read so far does this state remember? Then define how each new symbol changes that fact. This is much safer than drawing arrows first and guessing what they mean.</p>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Type a binary string. The machine below recognizes strings containing an even number of 1s.</p>'
      + '<div class="controls-row"><label for="fsm-input">Input</label><input id="fsm-input" type="text" value="1011" inputmode="numeric" placeholder="e.g. 1011"></div>'
      + '<div id="fsm-trace" class="formula-box" aria-live="polite"></div>'
      + '<div id="fsm-result"></div>';
    var input = container.querySelector('#fsm-input');
    var trace = container.querySelector('#fsm-trace');
    var result = container.querySelector('#fsm-result');
    function update() {
      var s = input.value.replace(/\s+/g, '');
      if (/[^01]/.test(s)) { trace.textContent = 'Only 0 and 1 belong to this alphabet.'; result.innerHTML = ''; return; }
      var state = 'EVEN', steps = ['EVEN'];
      for (var i = 0; i < s.length; i++) { if (s[i] === '1') state = state === 'EVEN' ? 'ODD' : 'EVEN'; steps.push(state); }
      trace.textContent = steps.join(' → ');
      result.innerHTML = state === 'EVEN' ? '<span class="tag yes">ACCEPT</span> even number of 1s' : '<span class="tag no">REJECT</span> odd number of 1s';
    }
    input.addEventListener('input', update); update();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'For the even-number-of-1s DFA above, where does input <code class="inline">101</code> finish?',
      mountInput: function (c) { var s=document.createElement('select');s.innerHTML='<option value="">— pick one —</option><option>EVEN</option><option>ODD</option>';c.appendChild(s);return function(){return s.value;}; },
      check: function (v) {
        if (v === 'EVEN') return { correct: true, feedback: '101 contains two 1s. Trace: EVEN → ODD → ODD → EVEN.' };
        return { correct: false, feedback: 'Start EVEN. Read 1 → ODD; read 0 → ODD; read 1 → EVEN.' };
      },
      hints: ['Start in EVEN.', 'A 0 stays put; each 1 toggles the state.', 'EVEN → ODD → ODD → EVEN.']
    },
    {
      difficulty: 'medium',
      prompt: 'Which strings does the even-number-of-1s DFA accept? Tick all that apply.',
      mountInput: function (c) {
        var items=[{label:'ε (empty string)',t:true},{label:'0',t:true},{label:'1',t:false},{label:'11',t:true},{label:'1011',t:false}];
        var div=document.createElement('div');div.className='checkbox-list';var boxes=items.map(function(it){var l=document.createElement('label'),b=document.createElement('input');b.type='checkbox';l.appendChild(b);l.appendChild(document.createTextNode(' '+it.label));div.appendChild(l);return{cb:b,expected:it.t};});c.appendChild(div);return function(){return boxes.map(function(b){return{picked:b.cb.checked,expected:b.expected};});};
      },
      check: function (v) {
        if (v.every(function (b) { return b.picked === b.expected; })) return { correct: true, feedback: 'Accepted: ε and 0 have zero 1s; 11 has two. Zero is even.' };
        return { correct: false, feedback: 'Count the 1s. Accept exactly when that count is even: ε, 0, and 11.' };
      },
      hints: ['The machine cares only about the parity of the number of 1s.', 'Zero 1s counts as even.', 'Choose ε, 0, and 11.']
    },
    {
      difficulty: 'hard',
      prompt: 'Design the meaning of two states for a DFA that accepts binary strings ending in 1. Which pair of state invariants works?',
      mountInput: function (c) {
        var opts=['A: length is even; B: length is odd','A: last symbol is not 1 (or no symbol yet); B: last symbol is 1','A: number of 0s is even; B: number of 0s is odd','A: string starts with 1; B: string starts with 0'];var s=document.createElement('select');s.innerHTML='<option value="-1">— pick one —</option>'+opts.map(function(o,i){return'<option value="'+i+'">'+o+'</option>';}).join('');c.appendChild(s);return function(){return parseInt(s.value,10);};
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'State B remembers exactly the fact the language asks about. On 1 go to B; on 0 go to A. Make B accepting.' };
        return { correct: false, feedback: 'Each state should remember whether the most recently read symbol is 1. B is the accepting state.' };
      },
      hints: ['A state invariant should summarize only the history needed for the final decision.', 'To know whether a string ends in 1, remember its most recent symbol.', 'Use A = does not currently end in 1, B = currently ends in 1; accept B.']
    }
  ]
});
