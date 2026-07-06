(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 8,
    title: 'Locks & MVCC',
    whyItMatters: 'Locks and row versions explain why some queries block, some do not, and some deadlock.',
    glossary: ['lock', 'MVCC', 'isolation', 'row'],
    learn:
      '<p>A lock blocks conflicting work. MVCC instead keeps multiple versions so readers can see an older snapshot while writers create new versions.</p>' +
      '<p>Most modern relational databases use both: locks for writes and schema changes, MVCC for non-blocking reads, cleanup for old versions.</p>' +
      '<div class="example"><div class="label">Mental model</div>Writer changes row v1 into v2. A reader whose snapshot started earlier still sees v1. A later reader sees v2 after commit.</div>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'T1 reader', body: 'Snapshot starts at time 10 and keeps seeing version A.' },
        { title: 'T2 writer', body: 'Creates version B, then commits at time 11.' },
        { title: 'T3 reader', body: 'Starts at time 12 and sees version B.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'What does MVCC stand for?',
        mountInput: function (c) { return db.textInput(c, 'words'); },
        check: function (v) { return db.hasAll(v, ['multi', 'version']) && db.hasAll(v, ['concurrency']) ? { correct: true, feedback: 'Right: Multi-Version Concurrency Control.' } : { correct: false, feedback: 'The key words are multi-version and concurrency control.' }; },
        hints: ['It stores more than one row version.', 'It is about concurrent access.', 'Multi-Version Concurrency Control.']
      },
      {
        difficulty: 'medium',
        prompt: 'Under MVCC, why can many reads avoid blocking writes?',
        mountInput: function (c) { return db.textInput(c, 'reason'); },
        check: function (v) { return db.norm(v).indexOf('snapshot') !== -1 || db.norm(v).indexOf('old version') !== -1 || db.norm(v).indexOf('version') !== -1 ? { correct: true, feedback: 'Yes. Readers can use a snapshot/older committed version instead of waiting for the writer.' } : { correct: false, feedback: 'Think about what the reader sees while a writer creates a newer version.' }; },
        hints: ['Readers do not need the newest uncommitted row.', 'They can see a consistent older view.', 'They read a snapshot/old version.']
      },
      {
        difficulty: 'hard',
        prompt: 'Two transactions update rows in opposite order: T1 locks A then wants B; T2 locks B then wants A. What problem is this?',
        mountInput: function (c) { return db.textInput(c, 'problem'); },
        check: function (v) { return db.norm(v).indexOf('deadlock') !== -1 ? { correct: true, feedback: 'Right. Each waits for a lock held by the other.' } : { correct: false, feedback: 'This is a cycle in the wait-for graph.' }; },
        hints: ['Each transaction is waiting.', 'Neither can proceed unless one aborts.', 'Deadlock.']
      }
    ]
  });
})();
