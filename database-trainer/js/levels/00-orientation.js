(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 0,
    title: 'Orientation',
    whyItMatters: 'Databases are where application state becomes durable, shared, queryable, and dangerous if misunderstood.',
    glossary: ['database', 'SQL', 'transaction', 'schema'],
    learn:
      '<p>A database is not just a file full of rows. It is a system for storing data, enforcing rules, answering questions, and surviving crashes while many clients use it at once.</p>' +
      '<div class="example"><div class="label">The engine has four jobs</div>' +
      '<ol><li><b>Store:</b> keep bytes on disk in pages and files.</li><li><b>Find:</b> use indexes and plans to avoid unnecessary work.</li><li><b>Protect:</b> enforce constraints and isolate concurrent users.</li><li><b>Recover:</b> use logs and backups when machines fail.</li></ol></div>' +
      '<p>The central skill is separating the <em>logical</em> view from the <em>physical</em> work. SQL says what rows you want. The engine decides how to get them.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'Logical layer', body: 'Tables, rows, columns, constraints, SQL results.' },
        { title: 'Planner layer', body: 'Chooses scans, index lookups, joins, sorts, and aggregates.' },
        { title: 'Storage layer', body: 'Pages, buffer pool, WAL, checkpoints, replicas, backups.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which statement best describes a database engine?',
        mountInput: function (c) { return db.selectInput(c, ['A spreadsheet with nicer syntax', 'Persistent storage plus rules, querying, concurrency, and recovery', 'A JSON file with indexes']); },
        check: function (v) { return v === 'Persistent storage plus rules, querying, concurrency, and recovery' ? { correct: true, feedback: 'Right. The engine is storage + rules + query execution + safety.' } : { correct: false, feedback: 'Too narrow. A real database also plans queries, enforces integrity, coordinates concurrency, and recovers from crashes.' }; },
        hints: ['Think beyond rows.', 'What happens when two users write at once?', 'The full answer includes persistence, rules, queries, concurrency, and recovery.']
      },
      {
        difficulty: 'medium',
        prompt: 'SQL is usually called <em>declarative</em>. What does that mean?',
        mountInput: function (c) { return db.textInput(c, 'Explain in one sentence'); },
        check: function (v) { return db.hasAll(v, ['what']) && db.hasAll(v, ['not']) && db.hasAll(v, ['how']) ? { correct: true, feedback: 'Yes. SQL describes the result; the optimizer chooses the procedure.' } : { correct: false, feedback: 'Use the what-vs-how distinction: you state what rows you want, not exactly how to fetch them.' }; },
        hints: ['Compare SQL to a for-loop.', 'Who chooses whether to scan or use an index?', 'Declarative means describing what result you want, not the step-by-step algorithm.']
      },
      {
        difficulty: 'hard',
        prompt: 'A product page shows stale inventory after another user buys the last item. Name the database concept most directly involved.',
        mountInput: function (c) { return db.textInput(c, 'concept'); },
        check: function (v) { return db.norm(v).indexOf('isolation') !== -1 || db.norm(v).indexOf('transaction') !== -1 ? { correct: true, feedback: 'Right. Transactions and isolation decide what concurrent users can see.' } : { correct: false, feedback: 'This is not mainly about SQL syntax. It is about concurrent reads/writes and what each transaction sees.' }; },
        hints: ['Two users are interacting with the same data.', 'The bug is about what one operation sees while another operation changes data.', 'Transactions and isolation are the core ideas.']
      }
    ]
  });
})();
