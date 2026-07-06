// Level 19 — RAG, Tool Use, Agents
AIT.registerLevel({
  id: 19,
  title: 'RAG, Tool Use & Agents',
  whyItMatters: 'Every interesting LLM application is one of three patterns: stuff retrieved context into the prompt (RAG), let the model call functions (tool use), or let it loop (agents). These three patterns power 99% of the LLM products you use, including the one you are building.',
  glossary: ['RAG', 'tool use', 'agent', 'embedding', 'context window'],
  learn: ''
    + '<h4>The shared problem</h4>'
    + '<p>An LLM at inference time only knows two things: <strong>(1)</strong> what was baked into its weights at training, and <strong>(2)</strong> what is in its context window right now. To do anything beyond chat — current data, real computation, multi-step tasks — you have to feed the right things into context. The three patterns are the three ways to do that.</p>'

    + '<h4>Pattern 1 — RAG (Retrieval-Augmented Generation)</h4>'
    + '<p>Use search to find relevant info, paste it into the prompt, then ask. Architecture:</p>'
    + '<ol>'
    +   '<li><strong>Indexing (offline)</strong> — chunk your documents (200–1000 tokens each), embed each chunk (level 15), store in a vector DB.</li>'
    +   '<li><strong>Retrieval (per query)</strong> — embed the user\'s question, vector-DB search, get top-k chunks (typical k = 3–10).</li>'
    +   '<li><strong>Generation</strong> — stuff retrieved chunks into the prompt with "use this context to answer: [...]", then ask the LLM.</li>'
    + '</ol>'
    + '<p>RAG is the right pattern when:</p>'
    + '<ul>'
    +   '<li>Your knowledge changes — fresh data without re-fine-tuning.</li>'
    +   '<li>You have proprietary docs the model doesn\'t know about.</li>'
    +   '<li>You need source attribution ("here\'s where this fact came from").</li>'
    +   '<li>Hallucinations matter — RAG grounds answers in retrieved evidence.</li>'
    + '</ul>'
    + '<p>Pitfalls: bad chunking, embeddings missing semantic matches, retrieval hits the right doc but wrong section, prompt context overflowing.</p>'

    + '<h4>Pattern 2 — Tool use / function calling</h4>'
    + '<p>Some things an LLM cannot do well, no matter how much you scale it:</p>'
    + '<ul>'
    +   '<li>Compute exact arithmetic (just call a calculator).</li>'
    +   '<li>Get the current time, weather, stock price (call an API).</li>'
    +   '<li>Run code (delegate to a sandboxed runtime).</li>'
    +   '<li>Search the web (delegate to a search engine).</li>'
    +   '<li>Read or modify files (delegate to a filesystem tool).</li>'
    + '</ul>'
    + '<p>Tool use lets the model say "I want to call function X with these arguments" — typically as structured JSON. The runtime executes, returns the result, and the model continues with the result in context.</p>'
    + '<p>Modern LLMs are SFT-trained on tool-call examples, so they natively emit OpenAI / Anthropic / Llama tool-call format.</p>'
    + '<div class="example"><div class="label">Example tool call</div>'
    + 'User: "What\'s the population of Tokyo divided by 7?"<br>'
    + 'Model emits: <code class="inline">{"tool": "calculator", "args": {"expression": "37400000 / 7"}}</code><br>'
    + 'Runtime executes, returns 5,342,857.<br>'
    + 'Model: "About 5.34 million."'
    + '</div>'

    + '<h4>Pattern 3 — Agents</h4>'
    + '<p>An agent is just <strong>tool use in a loop</strong>:</p>'
    + '<ol>'
    +   '<li>Take user goal.</li>'
    +   '<li>Plan or "think" about what to do.</li>'
    +   '<li>Call a tool.</li>'
    +   '<li>Observe the result.</li>'
    +   '<li>Decide: are we done? If not → go to 2.</li>'
    + '</ol>'
    + '<p>This is the <strong>ReAct</strong> pattern (Reason + Act). Variants: tree-of-thoughts (explore branches), reflection (critique own outputs), planner/executor splits.</p>'
    + '<p>Agents work great for:</p>'
    + '<ul>'
    +   '<li>Multi-step research ("find me the top 5 papers on X and summarize each").</li>'
    +   '<li>Coding ("look at this repo, find the bug, fix it, run tests").</li>'
    +   '<li>Anything where you can\'t fully describe the steps in advance.</li>'
    + '</ul>'

    + '<h4>Where agents fall over</h4>'
    + '<ul>'
    +   '<li><strong>Loop / repeat failure</strong> — the model calls the same tool 50 times. Solution: step limits, observation diversity checks.</li>'
    +   '<li><strong>Error compounding</strong> — small mistakes early in a long chain become big mistakes by the end.</li>'
    +   '<li><strong>Context overflow</strong> — every step adds tokens. Long chains exhaust the context window.</li>'
    +   '<li><strong>Cost</strong> — many roundtrips, each one a full LLM forward pass. A 20-step agent can cost 50× a single chat turn.</li>'
    + '</ul>'

    + '<h4>The mental model</h4>'
    + '<table class="truth-table" style="margin:12px 0">'
    + '<tr><th>Pattern</th><th>Use when</th><th>Don\'t use when</th></tr>'
    + '<tr><td>RAG</td><td>You need facts the model doesn\'t have / changing data / source attribution</td><td>The task is reasoning, not lookup</td></tr>'
    + '<tr><td>Tool use</td><td>The task needs precise computation or external state</td><td>Chat-only conversation</td></tr>'
    + '<tr><td>Agent</td><td>Open-ended multi-step task; you can\'t plan it linearly</td><td>Single-turn answer is enough</td></tr>'
    + '</table>'

    + '<div class="callout"><div class="label">Combining all three</div>'
    + 'Production systems often layer them: an agent loop (3) where one of the available tools is a RAG search (1), and other tools are calculators/APIs (2). Claude Code is exactly this — an agent loop over tools (Read, Edit, Bash, Grep, etc.). The "intelligence" is in the LLM\'s decisions about which tool to call when.'
    + '</div>'

    + '<h4>For your Francis project</h4>'
    + '<p>If Francis ever needs current info, code execution, or to look up things in a personal corpus, you\'ll reach for one of these three patterns. RAG is the cheapest first move (no model changes); tool use is the cleanest for "let it call a Python interpreter"; an agent loop is the natural shape once Francis needs to actually <em>do</em> things rather than just answer.</p>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click each pattern to see when it\'s the right tool.';
    container.appendChild(help);

    var patterns = [
      {
        name: 'RAG (Retrieval-Augmented Generation)',
        flow: 'Question → embed → vector DB search → retrieve top-k chunks → stuff into prompt → LLM answers grounded in retrieved evidence.',
        good: ['Internal docs', 'changing knowledge', 'source attribution', 'reduce hallucination'],
        bad: ['Pure reasoning tasks', 'small fixed knowledge base (just put it in system prompt)', 'real-time computation needs']
      },
      {
        name: 'Tool use / function calling',
        flow: 'LLM emits structured tool-call JSON → runtime executes → result fed back into context → LLM continues.',
        good: ['Calculator', 'web search', 'API calls', 'code execution', 'database queries'],
        bad: ['Conversational chat without external state', 'tasks the LLM can do natively']
      },
      {
        name: 'Agent (loop of think-act-observe)',
        flow: 'Goal → plan → call tool → observe result → decide if done; if not, repeat from plan. ReAct, reflection, planner/executor variants.',
        good: ['Open-ended multi-step tasks', 'coding', 'research', 'anything you can\'t script linearly'],
        bad: ['Single-turn questions (overkill)', 'cost-sensitive simple tasks', 'when you need predictable behavior']
      }
    ];

    var ctrls = document.createElement('div');
    ctrls.className = 'chip-row';
    container.appendChild(ctrls);
    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    var current = 0;
    patterns.forEach(function (p, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === current ? ' active' : '');
      b.textContent = p.name;
      b.addEventListener('click', function () {
        current = i;
        Array.prototype.forEach.call(ctrls.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        render();
      });
      ctrls.appendChild(b);
    });

    function render() {
      var p = patterns[current];
      box.innerHTML =
        '<div><strong style="color:var(--accent)">' + p.name + '</strong></div>'
      + '<div style="margin:8px 0"><span class="muted">Flow:</span> ' + p.flow + '</div>'
      + '<div><span class="muted">Good for:</span> ' + p.good.map(function (g) { return '<span class="tag yes">' + g + '</span>'; }).join('') + '</div>'
      + '<div style="margin-top:6px"><span class="muted">Bad for:</span> ' + p.bad.map(function (g) { return '<span class="tag no">' + g + '</span>'; }).join('') + '</div>';
    }
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What does <strong>RAG</strong> stand for?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Recursive Auto-encoded Generation', 'Retrieval-Augmented Generation', 'Reinforcement Approximate Gradient', 'Recurrent Attention Graph'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Retrieval-Augmented Generation') return { correct: true, feedback: 'Right. Retrieve relevant info, augment the prompt with it, then generate.' };
        return { correct: false, feedback: 'Retrieval-Augmented Generation.' };
      },
      hints: [
        'It\'s about retrieving information to enrich an LLM\'s context.',
        'Three words: Retrieval, Augmented, Generation.',
        'Retrieval-Augmented Generation.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'You\'re building an internal Q&A tool over your company\'s engineering wiki, which gets updated daily. Hallucinated answers are a serious problem. Which pattern is the most natural fit?',
      mountInput: function (c) {
        var opts = [
          'Fine-tune the model on the wiki content monthly.',
          'RAG — embed the wiki, retrieve relevant chunks per query.',
          'A long agent loop that browses the wiki for each question.',
          'Stuff the entire wiki into every prompt.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. RAG handles all three constraints elegantly: (1) re-indexing on update is cheap (embed only changed docs), (2) retrieved chunks ground answers and reduce hallucination, (3) you get source attribution for free.' };
        if (v === 0) return { correct: false, feedback: 'Re-fine-tuning daily is expensive and slow. RAG handles fresh data with just re-embedding the changed docs — far cheaper.' };
        if (v === 2) return { correct: false, feedback: 'A full agent loop per question is overkill for "look up wiki content." RAG does this with one retrieval step.' };
        if (v === 3) return { correct: false, feedback: 'Wikis are usually too big for the context window. Even when they fit, you waste tokens including irrelevant content.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Three constraints: changing knowledge, hallucination is bad, internal docs the model doesn\'t know.',
        'Which pattern grounds answers in retrieved evidence and handles fresh data cheaply?',
        'RAG.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You\'re building an LLM agent that searches a codebase, identifies a bug, edits files, and runs tests. After deploying, you notice some agents get stuck calling the same "Read" tool 30 times in a row before giving up. What is the most general fix?',
      mountInput: function (c) {
        var opts = [
          'Use a bigger LLM — it will not get stuck.',
          'Remove the Read tool entirely.',
          'Add observation-diversity checks and a maximum step limit; force a "summarize and replan" step when progress stalls.',
          'Disable the agent for any task that takes more than 1 step.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. The general agent-loop hygiene: (a) hard step limit so failures bound their own cost, (b) detect stagnation (same observation repeating, no progress signal), (c) force a "step back, summarize, re-plan" prompt instead of just letting the model keep grinding. This generalizes — bigger models also get stuck; the loop structure is the right place to fix it.' };
        if (v === 0) return { correct: false, feedback: 'Bigger models get stuck too. The fix needs to be in the loop, not the model.' };
        if (v === 1) return { correct: false, feedback: 'Removing the right tool is overkill — you just need to prevent unbounded loops on it.' };
        if (v === 3) return { correct: false, feedback: 'The whole point of agents is multi-step tasks. Limiting to 1 step throws out the value.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'The problem is in the LOOP, not the model. What loop-level guards exist?',
        'Step limits, stagnation detection, forced re-planning when nothing is changing.',
        'Combine all three: limit + detect + replan.'
      ]
    }
  ]
});
