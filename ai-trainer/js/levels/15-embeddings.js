// Level 15 — Embeddings & Semantic Search
AIT.registerLevel({
  id: 15,
  title: 'Embeddings & Semantic Search',
  whyItMatters: 'Embeddings are the universal "I want to compare meanings" tool. Once you know how to map text (or images, or anything) to vectors, semantic search, recommendation, clustering, and the entire "RAG" pattern fall out for free.',
  glossary: ['embedding', 'cosine similarity', 'vector DB', 'token'],
  learn: ''
    + '<h4>What an embedding is</h4>'
    + '<p>An <strong>embedding</strong> is a dense vector that represents the meaning of something. Train a model so that <em>similar inputs get nearby vectors and dissimilar inputs get distant ones</em>, and a huge family of problems suddenly becomes easy.</p>'
    + '<div class="example"><div class="label">Toy 2-D illustration</div>'
    + '"king" &nbsp;→ [0.92, 0.10]<br>'
    + '"queen" → [0.91, 0.15]<br>'
    + '"banana" → [-0.20, 0.85]<br>'
    + '<span class="muted">"king" and "queen" land near each other; "banana" is in a different region of the space.</span>'
    + '</div>'
    + '<p>Real embeddings live in 256–4,096 dims. The geometry holds: nearby = related, far = unrelated.</p>'

    + '<h4>How "near" is measured — cosine similarity</h4>'
    + '<div class="formula-box">cos(a, b) = (a · b) / (‖a‖ ‖b‖) &nbsp;&nbsp;&nbsp;<span class="muted">range: −1 to 1</span></div>'
    + '<ul>'
    +   '<li><strong>1.0</strong> — vectors point the same way (highly similar).</li>'
    +   '<li><strong>0.0</strong> — perpendicular (unrelated).</li>'
    +   '<li><strong>−1.0</strong> — opposite directions (semantically opposite, in good embeddings).</li>'
    + '</ul>'
    + '<p>Cosine sim ignores vector magnitude — only the angle matters. That makes it robust to scale (long documents vs short, common vs rare embeddings).</p>'

    + '<h4>Why ignore magnitude?</h4>'
    + '<p>Two vectors can have very different lengths (one is 3 units, one is 100) but point the same way. They\'re semantically equivalent — cosine sim correctly says 1.0. Euclidean distance would say "far apart" because of the magnitude difference. For most semantic tasks, cosine wins.</p>'

    + '<h4>How embeddings are trained</h4>'
    + '<p>Several recipes, but most reduce to <strong>contrastive learning</strong>:</p>'
    + '<ul>'
    +   '<li>Pick anchor sentence. Choose a "positive" (semantically similar) and "negatives" (random other sentences).</li>'
    +   '<li>Train the model to make embedding(anchor) close to embedding(positive) and far from embeddings(negatives).</li>'
    +   '<li>Loss: typically InfoNCE — softmax over similarities, target the positive.</li>'
    + '</ul>'
    + '<p>For LLM-style sentence embeddings (sentence-BERT, OpenAI ada, Cohere, etc.), the encoder is itself a transformer.</p>'

    + '<h4>Vector databases — searching at scale</h4>'
    + '<p>You have a million documents and a query. The naive approach: embed everything, compute cosine to query, sort. That\'s O(N) per query — fine at 1K docs, slow at 1M, deadly at 1B.</p>'
    + '<p><strong>Vector DBs</strong> (Pinecone, Weaviate, Qdrant, FAISS, pgvector) trade exactness for speed using <strong>Approximate Nearest Neighbor</strong> indices: HNSW, IVF, ScaNN. Typical: search 10M vectors in ~10ms with 95–99% recall.</p>'

    + '<h4>The classic recipe — RAG without saying "RAG"</h4>'
    + '<ol>'
    +   '<li>Take your documents. Chunk them (200–1000 tokens each).</li>'
    +   '<li>Embed each chunk → vector. Store in a vector DB.</li>'
    +   '<li>For a user query: embed the query → search → top-k chunks.</li>'
    +   '<li>Stuff those chunks into the prompt with "answer based on this context: ...".</li>'
    + '</ol>'
    + '<p>That\'s the entire foundation of RAG (level 19) and most production semantic search.</p>'

    + '<div class="callout"><div class="label">Embedding arithmetic</div>'
    + 'In well-trained embedding spaces, vector arithmetic captures relationships:<br>'
    + '<code class="inline">embedding("king") − embedding("man") + embedding("woman") ≈ embedding("queen")</code><br>'
    + 'This was a famous result from Word2Vec (2013) and still works (less perfectly) in modern transformer embeddings. Doesn\'t mean the model "knows" anything about kings and queens — it means the training pressure pushed analogous relationships into parallel directions in the vector space.'
    + '</div>'

    + '<h4>Where things go wrong</h4>'
    + '<ul>'
    +   '<li><strong>Bad chunking</strong> — sentence cut mid-thought → embedding doesn\'t represent the topic well.</li>'
    +   '<li><strong>Domain mismatch</strong> — generic embedding model on legal contracts misses jargon similarities.</li>'
    +   '<li><strong>Magnitude issues</strong> — almost always use cosine, not raw dot product.</li>'
    +   '<li><strong>Cross-language</strong> — only some embeddings are multilingual; English embeddings + Spanish docs is a recipe for retrieval misses.</li>'
    + '</ul>',

  mountPlay: function (container) {
    var mat = AIT.lib.mat;
    container.innerHTML = '';
    var help = document.createElement('p');
    help.className = 'muted';
    help.innerHTML = 'Pick a query sentence. The app shows cosine similarity to all the others (ranked).';
    container.appendChild(help);

    // Hand-crafted toy embeddings (4-D) for 8 sentences
    var docs = [
      { text: 'The cat slept on the mat.',                     vec: [0.9, 0.2, 0.1, 0.05] },
      { text: 'A kitten napped on the rug.',                   vec: [0.85, 0.3, 0.1, 0.0] },
      { text: 'My dog chased a ball in the park.',             vec: [0.6, 0.6, 0.2, 0.0] },
      { text: 'The sun set behind the mountains.',             vec: [0.0, 0.1, 0.9, 0.2] },
      { text: 'Rain fell on the city all night.',              vec: [0.0, 0.05, 0.7, 0.5] },
      { text: 'Stocks fell sharply on the bad earnings report.', vec: [0.0, 0.0, 0.1, 0.95] },
      { text: 'Markets are volatile this quarter.',             vec: [0.0, 0.0, 0.05, 0.9] },
      { text: 'A puppy barked loudly at the mailman.',          vec: [0.5, 0.7, 0.05, 0.0] }
    ];

    var ctrls = document.createElement('div');
    ctrls.className = 'chip-row';
    container.appendChild(ctrls);

    var box = document.createElement('div');
    box.className = 'formula-box';
    box.style.fontSize = '13px';
    container.appendChild(box);

    var current = 0;

    docs.forEach(function (d, i) {
      var b = document.createElement('button');
      b.className = 'chip' + (i === current ? ' active' : '');
      b.style.maxWidth = '300px';
      b.style.textOverflow = 'ellipsis';
      b.style.overflow = 'hidden';
      b.style.whiteSpace = 'nowrap';
      b.textContent = '"' + d.text + '"';
      b.addEventListener('click', function () {
        current = i;
        Array.prototype.forEach.call(ctrls.querySelectorAll('.chip'), function (c) { c.classList.remove('active'); });
        b.classList.add('active');
        render();
      });
      ctrls.appendChild(b);
    });

    function render() {
      var q = docs[current];
      var rows = docs.map(function (d, i) {
        return { i: i, text: d.text, sim: mat.cosine(q.vec, d.vec) };
      });
      // sort by similarity desc, but show the query first
      rows.sort(function (a, b) {
        if (a.i === current) return -1;
        if (b.i === current) return 1;
        return b.sim - a.sim;
      });
      var html = '<div><span class="muted">Query:</span> <strong style="color:var(--accent)">"' + q.text + '"</strong></div>';
      html += '<table class="truth-table" style="margin:8px 0;font-size:12px">'
            + '<tr><th>Rank</th><th>Sentence</th><th>Cosine sim</th></tr>';
      rows.forEach(function (r, idx) {
        var color = r.i === current ? 'color:var(--accent)' : (r.sim > 0.9 ? 'color:var(--good)' : (r.sim > 0.5 ? 'color:var(--warn)' : 'color:var(--text-dim)'));
        html += '<tr style="' + color + '"><td>' + (r.i === current ? 'self' : idx) + '</td><td style="text-align:left">' + r.text + '</td><td>' + r.sim.toFixed(3) + '</td></tr>';
      });
      html += '</table>';
      box.innerHTML = html;
    }
    render();
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'What is the cosine similarity of <code class="inline">[1, 0]</code> and <code class="inline">[0, 1]</code>?',
      mountInput: function (c) {
        var input = document.createElement('input');
        input.type = 'number'; input.step = 'any';
        c.appendChild(input);
        return function () { return parseFloat(input.value); };
      },
      check: function (v) {
        if (Math.abs(v) < 1e-6) return { correct: true, feedback: 'Right. Dot product = 1·0 + 0·1 = 0. So cos = 0 / (1·1) = 0. The vectors are perpendicular — completely unrelated.' };
        return { correct: false, feedback: '0. They\'re perpendicular: dot product = 0.' };
      },
      hints: [
        'cos = (a · b) / (‖a‖ · ‖b‖). Compute the dot product first.',
        '1·0 + 0·1 = 0. Dividing 0 by anything is still 0.',
        '0.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'Which is more cosine-similar to <code class="inline">[1, 1]</code>: vector A = <code class="inline">[2, 2]</code> or vector B = <code class="inline">[-1, 1]</code>?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option><option>A</option><option>B</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        // cos([1,1], [2,2]) = (2+2)/(√2 · √8) = 4/4 = 1
        // cos([1,1], [-1,1]) = (-1+1)/(√2 · √2) = 0
        if (v === 'A') return { correct: true, feedback: 'Right. cos([1,1], [2,2]) = 1.0 — they point the SAME way (just different magnitudes; cosine ignores magnitude). cos([1,1], [-1,1]) = 0 — they\'re perpendicular.' };
        return { correct: false, feedback: '[2, 2] is just [1, 1] scaled up by 2. Cosine ignores magnitude → cos = 1 (perfect alignment). [-1, 1] is perpendicular to [1, 1] → cos = 0.' };
      },
      hints: [
        'Cosine similarity ignores magnitude — only the angle matters.',
        '[2, 2] points the same direction as [1, 1]. [-1, 1] is rotated 90 degrees.',
        'A.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'You have 100 million document embeddings and need to answer queries in <100ms. Plain "compute cosine to every doc" is way too slow. What does a vector database\'s ANN (Approximate Nearest Neighbor) index trade off, and what\'s the typical recall?',
      mountInput: function (c) {
        var opts = [
          'It returns exact results in O(log N) using a cleverly indexed sort.',
          'It trades a small amount of accuracy (typical recall ~95–99%) for speed (sublinear or near-constant time).',
          'It returns no results unless you precompute every possible query.',
          'It is only fast when query vectors are sparse.'
        ];
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="-1">— pick one —</option>'
          + opts.map(function (o, i) { return '<option value="' + i + '">' + o + '</option>'; }).join('');
        c.appendChild(sel);
        return function () { return parseInt(sel.value, 10); };
      },
      check: function (v) {
        if (v === 1) return { correct: true, feedback: 'Right. ANN indices like HNSW and IVF give up exactness for speed. They might miss the absolute nearest neighbor every now and then but usually find ~95–99% of true top-k. For semantic search, that recall is more than enough — and you get 100–10000× speedup.' };
        if (v === 0) return { correct: false, feedback: 'There is no exact O(log N) high-dim NN. The "curse of dimensionality" means exact methods degrade to linear scan. The trick is to give up exactness.' };
        return { correct: false, feedback: 'ANN gives up a little accuracy (typically 1–5%) for huge speedups. Same idea as accepting cache misses to keep average latency low.' };
      },
      hints: [
        'A — "ANN" — stands for Approximate Nearest Neighbor. The "approximate" is doing real work.',
        'It\'s a recall-vs-speed tradeoff. Real systems use indices like HNSW or IVF.',
        'Typical recall: 95–99%. Speed: sublinear, often near-constant.'
      ]
    }
  ]
});
