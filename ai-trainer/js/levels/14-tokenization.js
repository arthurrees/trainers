// Level 14 — Tokenization & BPE
AIT.registerLevel({
  id: 14,
  title: 'Tokenization & BPE',
  whyItMatters: 'Every LLM input passes through a tokenizer first. Knowing what tokens really are explains why "running" might be 1 token but "RuNNiNg" might be 4, why some languages are more expensive to talk to, and why your context window fills up faster than you expect.',
  glossary: ['token', 'BPE', 'embedding'],
  learn: ''
    + '<h4>Why not just use words? Or characters?</h4>'
    + '<p>Words are too big a unit — vocabularies are infinite (typos, names, new words), and you\'d need a separate row in your embedding table for "running", "ran", "runs", "runner", "rerun"...</p>'
    + '<p>Characters are too small — sequences become extremely long, and the model has to relearn from scratch that "the" is a meaningful chunk.</p>'
    + '<p><strong>Tokens</strong> sit in between. They\'re subword units chosen so that common letter sequences become single tokens, and rare or unfamiliar words break into a few smaller pieces.</p>'

    + '<h4>Byte-Pair Encoding (BPE) — how the tokenizer is built</h4>'
    + '<p>BPE is the standard recipe (used by GPT-2, GPT-3, Llama, and most modern LLMs):</p>'
    + '<ol>'
    +   '<li>Start with a vocabulary of single bytes / characters.</li>'
    +   '<li>Take a giant text corpus. Count the frequency of every adjacent pair of tokens.</li>'
    +   '<li>Find the most common pair. Add a new token that is the merger of those two. Re-tokenize the corpus.</li>'
    +   '<li>Repeat steps 2–3 until vocabulary reaches the target size (typical: 32K to 200K).</li>'
    + '</ol>'
    + '<div class="example"><div class="label">Tiny worked example</div>'
    + 'Corpus: "low low low lower lower newer newer wider"<br>'
    + 'Initial tokens: ["l", "o", "w", "e", "r", "n", " ", "i", "d"]<br>'
    + 'Most-common pair: "l" + "o" → merge to "lo" (vocab gets a new token)<br>'
    + 'Next most-common pair: "lo" + "w" → merge to "low"<br>'
    + 'Next: "e" + "r" → "er". Then "low" + " " → "low " ...<br>'
    + 'After enough merges, frequent words become single tokens; rare words remain split.'
    + '</div>'

    + '<h4>Decoding at inference time</h4>'
    + '<p>Once trained, the tokenizer is just a fast greedy table lookup: scan the text left-to-right and pick the longest subword match in the vocabulary. The merges learned during training determine exactly how each text gets split.</p>'

    + '<h4>What this means in practice</h4>'
    + '<ul>'
    +   '<li><strong>Common words</strong> (the, and, is) → one token each.</li>'
    +   '<li><strong>Less common words</strong> (philosophy, tokenization) → 2–4 tokens.</li>'
    +   '<li><strong>Rare or made-up words</strong> (zonglefribbet) → many character-level tokens.</li>'
    +   '<li><strong>Non-Latin scripts</strong> (Chinese, Arabic, Cyrillic) → often more tokens per character, because Western corpora dominate the BPE training data and these scripts didn\'t get many merges.</li>'
    +   '<li><strong>Code</strong> (Python, JS) — modern tokenizers (GPT-4o, Llama-3) include code-friendly merges, but spaces, indentation, and operators each cost tokens.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Why this matters for cost</div>'
    + 'API pricing is per-token. A 1,000-character English paragraph might be ~250 tokens; the same content in Chinese could be 600+. If you\'re building on top of LLMs, knowing your token costs matters as much as knowing your byte costs in network programming.'
    + '</div>'

    + '<h4>Embeddings — from token IDs to vectors</h4>'
    + '<p>The vocabulary is just a list. Each token has an integer ID. The model has an <strong>embedding table</strong> — a big matrix of shape (vocab_size × d_model) — and the input token IDs simply look up rows in that table.</p>'
    + '<p>For Llama-3 with 128K vocab and d_model = 8,192, the embedding table alone has ~1B parameters. Most of those rows get gradients on every training step — that\'s a lot of learning capacity sitting in "what does each token mean".</p>'

    + '<h4>Special tokens</h4>'
    + '<ul>'
    +   '<li><strong>BOS / &lt;|begin_of_text|&gt;</strong> — start of a sequence.</li>'
    +   '<li><strong>EOS / &lt;|end_of_text|&gt;</strong> — end. Sampling stops here.</li>'
    +   '<li><strong>System / user / assistant</strong> tokens — chat template markers.</li>'
    +   '<li><strong>Padding</strong> — fill batches to equal length, masked in attention.</li>'
    + '</ul>'

    + '<h4>Pitfalls</h4>'
    + '<ul>'
    +   '<li>"Hello" and "hello" might be different tokens. Capitalization matters.</li>'
    +   '<li>" hello" (with leading space) and "hello" are different tokens. The space is part of the next word in BPE.</li>'
    +   '<li>The classic "strawberry" trick: GPT-4 famously miscounted r\'s in "strawberry" partly because the word is one or two tokens — the model never saw individual letters of it during training.</li>'
    + '</ul>',

  mountPlay: function (container) {
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'A toy BPE tokenizer with a small learned vocabulary. Type some text — see how it splits.';
    container.appendChild(help);

    // Hand-picked merges that feel like a real BPE on English-ish text.
    // Tokenize greedily by longest-match.
    var vocab = [
      // longest first matters for greedy match
      'tion', 'ing', 'the ', 'and ', 'ation', ' the', ' and', ' is', ' a ',
      'ed ', 'er ', 'es ', 'ly ', ' to ',
      'th', 'er', 'in', 'on', 're', 'an', 'en', 'at', 'or', 'it', 'is', 'es', 'ar', 'al',
      ' ', '\n'
    ];
    // Sort by length desc so greedy longest match works
    vocab.sort(function (a, b) { return b.length - a.length; });

    function tokenize(text) {
      var out = [];
      var i = 0;
      while (i < text.length) {
        var matched = null;
        for (var v = 0; v < vocab.length; v++) {
          var t = vocab[v];
          if (text.substr(i, t.length) === t) { matched = t; break; }
        }
        if (matched) {
          out.push(matched);
          i += matched.length;
        } else {
          out.push(text[i]);
          i++;
        }
      }
      return out;
    }

    var input = document.createElement('textarea');
    input.value = "Tokenization is the first step in language modeling.";
    input.style.width = '100%';
    input.style.minHeight = '80px';
    container.appendChild(input);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    function colors(i) {
      var pal = ['#7ab7ff', '#a78bfa', '#4ade80', '#fbbf24', '#f87171', '#22d3ee'];
      return pal[i % pal.length];
    }

    function render() {
      var tokens = tokenize(input.value);
      var html = '<div><span class="muted">Token count:</span> <strong>' + tokens.length + '</strong> &nbsp; '
               + '<span class="muted">Char count:</span> ' + input.value.length + ' &nbsp; '
               + '<span class="muted">Avg chars/token:</span> ' + (input.value.length / Math.max(1, tokens.length)).toFixed(2) + '</div>';
      html += '<div style="margin:8px 0;font-family:var(--mono);line-height:1.8">';
      tokens.forEach(function (t, i) {
        var disp = t.replace(/ /g, '·').replace(/\n/g, '↵');
        html += '<span style="background:rgba(122,183,255,0.12);border:1px solid ' + colors(i) + ';padding:2px 4px;margin:1px;border-radius:3px;color:' + colors(i) + '">' + disp + '</span>';
      });
      html += '</div>';
      html += '<div class="muted">Toy tokenizer with ~30 learned merges. Real tokenizers have 32K–200K. The pattern is the same: common subwords become single tokens, rare ones split.</div>';
      box.innerHTML = html;
    }
    input.addEventListener('input', render);
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'BPE stands for:',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>'
          + ['Backpropagation Encoder', 'Byte-Pair Encoding', 'Bidirectional Pre-training Embedding', 'Bilingual Pair Equivalence'].map(function (o) { return '<option>' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Byte-Pair Encoding') return { correct: true, feedback: 'Right. Originally a 1994 compression algorithm; repurposed by Sennrich et al. 2015 for neural machine translation, then adopted by GPT-2 and basically every LLM since.' };
        return { correct: false, feedback: 'Byte-Pair Encoding.' };
      },
      hints: [
        'It started as a compression algorithm.',
        'It repeatedly merges the most-common adjacent pair.',
        'Byte-Pair Encoding.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A model has vocabulary size <strong>50,000</strong> and embedding dimension <strong>4,096</strong>. How many parameters are in just the input embedding table?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number';
        c.appendChild(input);
        return function () { return parseInt(input.value, 10); };
      },
      check: function (v) {
        // 50000 * 4096 = 204,800,000
        if (v === 204800000) return { correct: true, feedback: 'Right. 50,000 × 4,096 = 204,800,000 parameters — over 200 million. The embedding table is one of the biggest single tensors in the whole model.' };
        return { correct: false, feedback: 'vocab × d_model = 50,000 × 4,096 = 204,800,000.' };
      },
      hints: [
        'Embedding table shape is (vocab_size × d_model).',
        '50,000 × 4,096.',
        '204,800,000 (~200M).'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You are sending the same essay to an API: once in English, once translated to Mandarin Chinese. The English version is 1,000 tokens. Approximately how many tokens is the Mandarin version likely to be, with a typical Western-trained tokenizer?',
      mountInput: function (c) {
        var opts = [
          'About 1,000 — translation preserves token count.',
          'Around 250 — Chinese is more compact information-wise.',
          'Significantly more, often 2,000+ — non-Latin scripts get fewer learned merges and tokenize more granularly.',
          'Exactly the same number of bytes encoded the same way.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 2) return { correct: true, feedback: 'Right. BPE is data-driven — most pretraining data is English. Mandarin (and Arabic, Korean, Hindi, etc.) gets fewer learned merges, so each character often becomes 1–2 tokens. The same content in Mandarin commonly costs ~2× the tokens of English. This has real cost and latency consequences for non-English users — it\'s an active fairness/access issue in LLM deployment.' };
        if (v === 0) return { correct: false, feedback: 'Token counts vary substantially across languages because BPE merges are corpus-dependent.' };
        if (v === 1) return { correct: false, feedback: 'Closer to the opposite — it\'s usually significantly MORE tokens, not fewer.' };
        return { correct: false, feedback: 'Non-Latin scripts typically tokenize more granularly because the BPE training corpus is dominated by English.' };
      },
      hints: [
        'Tokenizers learn merges from training data. Most LLM training data is what?',
        'English-heavy. So scripts that appear less often in training get fewer merges → more tokens per character.',
        'Mandarin tends to use ~2× as many tokens as English for equivalent content.'
      ]
    }
  ]
});
