(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 6,
    title: 'Transactions & ACID',
    whyItMatters: 'Transactions let multi-step changes behave like one reliable operation.',
    glossary: ['transaction', 'ACID', 'commit', 'rollback', 'WAL'],
    learn:
      '<p>A transaction groups operations so they commit together or not at all. This is essential for money movement, inventory, account creation, and any workflow that updates multiple rows.</p>' +
      '<div class="example"><div class="label">Transfer</div><pre><code>BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;</code></pre></div>' +
      '<p>ACID means atomic, consistent, isolated, durable. The database uses locks, MVCC, constraints, and WAL to approximate that promise efficiently.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'BEGIN', body: 'Start grouping changes.' },
        { title: 'COMMIT', body: 'Make all changes durable.' },
        { title: 'ROLLBACK', body: 'Undo the transaction if a step fails.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which command makes a transaction permanent?',
        mountInput: function (c) { return db.selectInput(c, ['BEGIN', 'COMMIT', 'ROLLBACK']); },
        check: function (v) { return v === 'COMMIT' ? { correct: true, feedback: 'Right. COMMIT makes the transaction durable.' } : { correct: false, feedback: 'BEGIN starts it; ROLLBACK cancels it. COMMIT makes it permanent.' }; },
        hints: ['It is the success endpoint.', 'After this, crash recovery must preserve it.', 'COMMIT.']
      },
      {
        difficulty: 'medium',
        prompt: 'A transfer subtracts money from account A, then the process crashes before adding to account B. Which ACID property prevents half a transfer?',
        mountInput: function (c) { return db.textInput(c, 'property'); },
        check: function (v) { return db.norm(v).indexOf('atomic') !== -1 ? { correct: true, feedback: 'Right. Atomicity means all-or-nothing.' } : { correct: false, feedback: 'The key phrase is all-or-nothing.' }; },
        hints: ['All changes happen or none do.', 'The A in ACID.', 'Atomicity.']
      },
      {
        difficulty: 'hard',
        prompt: 'Why does durability usually require a write-ahead log?',
        mountInput: function (c) { return db.textInput(c, 'explain'); },
        check: function (v) { return db.hasAll(v, ['crash']) && (db.norm(v).indexOf('replay') !== -1 || db.norm(v).indexOf('recover') !== -1 || db.norm(v).indexOf('log') !== -1) ? { correct: true, feedback: 'Yes. The log reaches disk first, so committed changes can be replayed after a crash.' } : { correct: false, feedback: 'Durability is about surviving crashes before dirty data pages are fully written.' }; },
        hints: ['Data pages may still be in memory.', 'The log is written before the page change is considered safe.', 'After a crash, replay committed WAL records.']
      }
    ]
  });
})();
