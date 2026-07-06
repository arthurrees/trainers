// Level 20 - AI in Plain English
AIT.registerLevel({
  id: 20,
  title: 'AI in Plain English',
  whyItMatters: 'This level is written so you can explain AI to someone else. It avoids formulas, but it still explains what is actually happening: training, weights, prompts, tokens, context, inference, mistakes, and tools.',
  glossary: ['AI', 'ML', 'DL', 'parameter', 'weight', 'token', 'context window', 'RAG', 'tool use'],
  learn: ''
    + '<h4>The one-sentence explanation</h4>'
    + '<p>An AI language model is a system trained on huge amounts of text so it can look at some current text and predict what text should come next.</p>'
    + '<p>That sounds simple, but it becomes powerful at scale. If a model gets very good at predicting what comes next, it also starts to look like it can answer questions, summarize, translate, write code, explain ideas, imitate styles, and follow instructions. Those abilities come from learning patterns in examples.</p>'

    + '<div class="example"><div class="label">Tiny example</div>'
    + 'If you see this sentence:<br>'
    + '<code class="inline">The dog chased the ___</code><br>'
    + 'you can guess words like <code class="inline">cat</code>, <code class="inline">ball</code>, or <code class="inline">squirrel</code>. You know that because you have seen enough language and real-world situations. A language model learns a similar skill from text, but at a much larger scale.'
    + '</div>'

    + '<h4>Step 1: training gives the model practice</h4>'
    + '<p>Training is the learning phase. The model is shown example after example. It tries to predict missing or next text. When it guesses poorly, the training process adjusts the model slightly so it is more likely to make a better guess next time.</p>'
    + '<p>You can explain it like this:</p>'
    + '<ol>'
    +   '<li>Show the model a piece of text.</li>'
    +   '<li>Hide the next piece.</li>'
    +   '<li>Ask the model to guess it.</li>'
    +   '<li>Compare the guess to the real answer.</li>'
    +   '<li>Adjust the model a little.</li>'
    +   '<li>Repeat this billions or trillions of times.</li>'
    + '</ol>'
    + '<p>The model is not born knowing facts or grammar. It gets shaped by practice.</p>'

    + '<div class="example"><div class="label">Training example</div>'
    + 'Training text: <code class="inline">Michigan State University is located in East ___</code><br>'
    + 'Model guess early in training: <code class="inline">America</code><br>'
    + 'Correct next text: <code class="inline">Lansing</code><br>'
    + 'Training response: adjust the model so that, in similar situations, <code class="inline">Lansing</code> becomes more likely.'
    + '</div>'

    + '<h4>Step 2: weights are what training changes</h4>'
    + '<p>The adjustments happen inside the model\'s <strong>weights</strong>. A weight is just a learned setting. Think of it like one tiny dial on a huge control board.</p>'
    + '<p>One dial by itself does not mean "dog" or "Python" or "politeness." Real behavior is spread across many dials working together. That is why people say knowledge is distributed across the model.</p>'
    + '<p>A practical analogy: imagine a giant soundboard. One knob controls a tiny part of the final sound. One knob alone is not the song. But the full arrangement of knobs changes what comes out. Training turns the knobs. Using the model runs your prompt through that already-tuned board.</p>'

    + '<div class="example"><div class="label">Weight intuition</div>'
    + 'Suppose a model often sees:<br>'
    + '<code class="inline">2 + 2 = 4</code><br>'
    + '<code class="inline">2 + 3 = 5</code><br>'
    + '<code class="inline">3 + 3 = 6</code><br>'
    + 'It does not store a neat rule card that says "addition works like this." Instead, training changes many internal settings so addition-like patterns become easier for the model to produce. For exact math, though, a calculator tool is still better.'
    + '</div>'

    + '<h4>Step 3: text gets broken into tokens</h4>'
    + '<p>The model does not read text exactly the way humans do. Before text goes into the model, it gets split into <strong>tokens</strong>. A token can be a whole word, part of a word, a space, punctuation, or a common text chunk.</p>'
    + '<p>This matters because the model generates one token at a time. It does not write the whole answer in one instant. It repeatedly chooses the next chunk.</p>'

    + '<div class="example"><div class="label">Token example</div>'
    + 'A sentence like <code class="inline">unbelievable results!</code> might be split roughly like:<br>'
    + '<code class="inline">un</code> + <code class="inline">believable</code> + <code class="inline"> results</code> + <code class="inline">!</code><br>'
    + 'Different models split text differently, but the core idea is the same: text becomes chunks the model can process.'
    + '</div>'

    + '<h4>Step 4: inference is the answering phase</h4>'
    + '<p>When you chat with a model, you are usually not training it. You are using it. That use phase is called inference.</p>'
    + '<p>During inference, the model looks at the current context and asks: "Given everything I can see right now, what token should probably come next?" After it chooses that token, it asks the same question again. This loop builds the final answer.</p>'

    + '<div class="example"><div class="label">Inference example</div>'
    + 'Prompt: <code class="inline">Explain photosynthesis in one sentence.</code><br>'
    + 'The model might begin with: <code class="inline">Photosynthesis</code><br>'
    + 'Then it continues: <code class="inline"> is</code>, <code class="inline"> the</code>, <code class="inline"> process</code>, and so on.<br>'
    + 'To you it looks like one answer. Under the hood, it is a chain of next-token choices.'
    + '</div>'

    + '<h4>Step 5: the context window is the model\'s temporary workspace</h4>'
    + '<p>The model can only directly use what is in its context window right now. That includes your prompt, previous messages that still fit, system instructions, pasted documents, and tool results.</p>'
    + '<p>The context window is like the model\'s desk. If you put a report on the desk, the model can refer to it. If the report is not on the desk and was not learned during training, the model cannot reliably know it.</p>'

    + '<div class="example"><div class="label">Context example</div>'
    + 'Weak prompt: <code class="inline">Summarize the report.</code><br>'
    + 'Better prompt: paste the report, then ask <code class="inline">Summarize this report in five bullets for a manager.</code><br>'
    + 'The second prompt works better because the model has the actual source text in front of it and knows the audience.'
    + '</div>'

    + '<h4>Step 6: prompts steer the model</h4>'
    + '<p>A prompt is not magic wording. It is how you place instructions and evidence into the model\'s temporary workspace.</p>'
    + '<p>Good prompts usually say three things: what you want, what context matters, and what shape the answer should have.</p>'

    + '<div class="example"><div class="label">Prompt quality example</div>'
    + 'Vague: <code class="inline">Help with my resume.</code><br>'
    + 'Better: <code class="inline">Rewrite these three resume bullets for a data analyst internship. Keep them truthful, action-oriented, and under 25 words each: ...</code><br>'
    + 'The better version gives the task, the role, the constraints, and the source material.'
    + '</div>'

    + '<h4>Step 7: why it can be wrong</h4>'
    + '<p>The model is very good at producing text that fits the situation. But fitting the situation is not the same as being true.</p>'
    + '<p>It can be wrong when the needed fact is missing from training, changed after training, not present in the context, or requires exact calculation. It may still produce a confident answer because fluent writing is part of what it learned.</p>'

    + '<div class="example"><div class="label">Wrong-answer example</div>'
    + 'Question: <code class="inline">What is the newest policy in my company handbook?</code><br>'
    + 'If the handbook is not in context and the model has no tool to fetch it, the honest answer should be: <code class="inline">I need the handbook or access to it.</code><br>'
    + 'A weak system might guess. A better system retrieves the handbook first.'
    + '</div>'

    + '<h4>Step 8: tools make the system more reliable</h4>'
    + '<p>A chatbot app can wrap tools around the model. The model decides it needs something, the tool gets it, and the result is placed back into context.</p>'
    + '<p>Use tools when the task needs current facts, exact math, private files, code execution, database records, or a source-backed answer.</p>'

    + '<div class="example"><div class="label">Tool example</div>'
    + 'User: <code class="inline">What changed in my project since yesterday?</code><br>'
    + 'Bad answer: the model guesses from general training.<br>'
    + 'Good system: run a file or git tool, collect the changed files, put that result in context, then have the model explain it clearly.'
    + '</div>'

    + '<h4>How to explain the whole thing to someone</h4>'
    + '<p>Here is a clean script:</p>'
    + '<div class="callout"><div class="label">Plain-English script</div>'
    + 'An AI model is trained by practicing on huge amounts of examples. During training, it adjusts billions of internal settings called weights. Later, when you type a prompt, the model does not look up a fixed answer. It reads the current context, uses its learned weights to predict what text should come next, and builds the answer one piece at a time. If it needs fresh facts or exact work, the app should give it tools and put those tool results into the context.'
    + '</div>'

    + '<h4>The mental model to keep</h4>'
    + '<ol>'
    +   '<li><strong>Training data</strong> gives examples.</li>'
    +   '<li><strong>Training</strong> adjusts weights.</li>'
    +   '<li><strong>Weights</strong> hold learned patterns, not neat human-readable facts.</li>'
    +   '<li><strong>Prompts</strong> put temporary instructions and evidence into context.</li>'
    +   '<li><strong>Inference</strong> generates one token at a time.</li>'
    +   '<li><strong>Tools</strong> add current facts, exact computation, and access to outside systems.</li>'
    + '</ol>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Click each scenario to see how you could explain what the AI system is doing.';
    container.appendChild(help);

    var scenarios = [
      {
        name: 'Sentence completion',
        title: 'Why next-token prediction can look intelligent',
        prompt: 'Prompt: "The best way to secure an account is to use..."',
        body: 'The model has seen many security explanations. Its weights make words like "a strong password" and "two-factor authentication" likely continuations. It is not pulling from one exact page; it is using learned language and security patterns.',
        explain: 'This is the core trick: if you get very good at choosing the next piece of text, complex answers emerge from many small choices.'
      },
      {
        name: 'Resume help',
        title: 'Why context changes the answer',
        prompt: 'Prompt: "Rewrite these bullets for a data analyst internship: [your bullets]"',
        body: 'The model uses its learned writing patterns plus the specific bullets you pasted. The pasted bullets are temporary context; they are not permanently stored in the model\'s weights.',
        explain: 'Weights provide general skill. Context provides the specific material.'
      },
      {
        name: 'Fresh project state',
        title: 'Why tools are needed for local or current facts',
        prompt: 'Prompt: "What changed in this folder today?"',
        body: 'The model cannot know that from training. A file or git tool has to inspect the folder. Then the tool result goes into context, and the model explains it.',
        explain: 'Do not ask weights to do a tool\'s job. Use the model to interpret tool results.'
      },
      {
        name: 'Exact math',
        title: 'Why calculators still matter',
        prompt: 'Prompt: "What is 18,347 multiplied by 92?"',
        body: 'The model may have learned arithmetic patterns, but exact calculation is better delegated to a calculator. The calculator returns the precise result; the model formats and explains it.',
        explain: 'Models are pattern engines. Tools are exact instruments.'
      },
      {
        name: 'Bad prompt',
        title: 'Why vague prompts produce vague answers',
        prompt: 'Prompt: "Make this better."',
        body: 'The model has no clear target. Better prompts say what "better" means: shorter, clearer, more professional, more persuasive, beginner-friendly, or technically precise.',
        explain: 'The model follows the information it has. If the goal is vague, the answer will often be generic.'
      }
    ];

    var chips = document.createElement('div');
    chips.className = 'chip-row';
    container.appendChild(chips);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function render(index) {
      var s = scenarios[index];
      box.innerHTML =
        '<div><strong style="color:var(--accent)">' + s.title + '</strong></div>'
      + '<div style="margin:8px 0"><span class="muted">' + s.prompt + '</span></div>'
      + '<p style="margin:8px 0">' + s.body + '</p>'
      + '<div><span class="muted">How to explain it:</span> ' + s.explain + '</div>';
    }

    scenarios.forEach(function (scenario, index) {
      var b = document.createElement('button');
      b.className = 'chip' + (index === 0 ? ' active' : '');
      b.textContent = scenario.name;
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        render(index);
      });
      chips.appendChild(b);
    });

    render(0);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'In plain English, what are model <strong>weights</strong> closest to?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = [
          'A list of every sentence the model has memorized exactly.',
          'Tiny learned settings that shape how the model responds.',
          'The temporary chat history currently visible to the model.',
          'A search engine connected to the internet.'
        ];
        sel.innerHTML = '<option value="-1">- pick one -</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. Weights are learned internal settings. One alone is not meaningful, but many together shape the model\'s behavior.' };
        if (v === 0) return { correct: false, feedback: 'Not quite. Models can memorize some text, but weights are not a clean list of stored sentences.' };
        if (v === 2) return { correct: false, feedback: 'That describes the context window, not the weights.' };
        if (v === 3) return { correct: false, feedback: 'A model may be connected to search as a tool, but weights are inside the model.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Think of the soundboard analogy.',
        'Training adjusts them. Chatting normally does not.',
        'They are tiny learned settings that shape responses.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Which statement best explains the difference between <strong>training</strong> and simply <strong>chatting</strong> with a model?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = [
          'Training changes the model\'s weights; chatting usually only gives temporary context.',
          'Chatting changes every weight permanently after each message.',
          'Training is just asking the model a question many times.',
          'There is no practical difference.'
        ];
        sel.innerHTML = '<option value="-1">- pick one -</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 0) return { correct: true, feedback: 'Right. Training updates the long-term learned settings. Chatting mostly supplies temporary information in the context window.' };
        if (v === 1) return { correct: false, feedback: 'Usually no. Your chat goes into the context window; it does not normally rewrite the model\'s permanent weights.' };
        if (v === 2) return { correct: false, feedback: 'Training involves examples, error checking, and weight updates. It is not just repeated prompting.' };
        if (v === 3) return { correct: false, feedback: 'There is a major difference: training changes the model, inference uses the model.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Which process changes the long-term internal dials?',
        'A prompt affects what is on the model\'s temporary desk.',
        'Training changes weights; chatting gives context.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You ask an AI assistant, "What changed in this project since yesterday?" The model was trained months ago and cannot see your files unless the app gives it access. What should the system do?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        var opts = [
          'Guess from the model\'s training data.',
          'Use file or git tools to inspect the project, then put the results into context.',
          'Fine-tune the entire model on the project before answering.',
          'Answer that AI models can never work with files.'
        ];
        sel.innerHTML = '<option value="-1">- pick one -</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. The model needs current project state in its context. Tools can gather that state; then the model can explain it.' };
        if (v === 0) return { correct: false, feedback: 'Training data is old and generic. It will not contain yesterday\'s local project changes.' };
        if (v === 2) return { correct: false, feedback: 'Full fine-tuning is far too heavy for this. The project state belongs in context via tools.' };
        if (v === 3) return { correct: false, feedback: 'They can work with files when the surrounding app gives them file tools and returns the results.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'The model needs fresh local information.',
        'Fresh information usually goes into context, not into the weights.',
        'Use tools to inspect the project, then feed the results back to the model.'
      ]
    }
  ]
});
