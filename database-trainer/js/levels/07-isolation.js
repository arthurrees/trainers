(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 7,
    title: 'Isolation Levels',
    whyItMatters: 'Isolation is where correctness and concurrency trade off; weak choices create bugs that only appear under load.',
    glossary: ['isolation', 'dirty read', 'phantom read', 'transaction'],
    learn:
      '<p>Isolation controls what one transaction can observe while another transaction is running. Stronger isolation feels simpler but can reduce concurrency.</p>' +
      '<div class="example"><div class="label">Common anomalies</div><ul><li><b>Dirty read:</b> see uncommitted data.</li><li><b>Non-repeatable read:</b> same row changes between reads.</li><li><b>Phantom read:</b> same range query returns different matching rows.</li></ul></div>' +
      '<p>Many production systems default to Read Committed or Snapshot-style behavior. You still need to design updates carefully.</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'Read Committed', body: 'Never see uncommitted rows; repeated reads can change.' },
        { title: 'Repeatable Read / Snapshot', body: 'Transaction sees a stable snapshot in many engines.' },
        { title: 'Serializable', body: 'Result behaves as if transactions ran one at a time.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Reading another transaction\'s uncommitted update is called what?',
        mountInput: function (c) { return db.textInput(c, 'anomaly'); },
        check: function (v) { return db.norm(v).indexOf('dirty') !== -1 ? { correct: true, feedback: 'Right. That is a dirty read.' } : { correct: false, feedback: 'The data is dirty because it may still roll back.' }; },
        hints: ['The writer has not committed.', 'The read may see data that disappears.', 'Dirty read.']
      },
      {
        difficulty: 'medium',
        prompt: 'You run <code>SELECT COUNT(*) FROM orders WHERE status = \'open\'</code> twice. Another transaction inserts a new open order between reads. What anomaly can this be?',
        mountInput: function (c) { return db.selectInput(c, ['Dirty read', 'Phantom read', 'Lost update']); },
        check: function (v) { return v === 'Phantom read' ? { correct: true, feedback: 'Right. A range/predicate query sees a new matching row.' } : { correct: false, feedback: 'The row did not exist in the first predicate result, then appears later.' }; },
        hints: ['The second result has an extra row.', 'It is about a predicate/range, not a single row value.', 'Phantom read.']
      },
      {
        difficulty: 'hard',
        prompt: 'Two doctors are on call. Each transaction sees the other doctor still on call, then sets itself off call. Final state: nobody on call. What stronger isolation level prevents this write-skew pattern?',
        mountInput: function (c) { return db.textInput(c, 'level'); },
        check: function (v) { return db.norm(v).indexOf('serial') !== -1 ? { correct: true, feedback: 'Yes. Serializable isolation prevents outcomes that cannot be ordered one transaction at a time.' } : { correct: false, feedback: 'Snapshot isolation alone can allow write skew. You need the strongest common isolation.' }; },
        hints: ['Both transactions read a predicate and write different rows.', 'This is not a dirty read.', 'Serializable is the safe answer.']
      }
    ]
  });
})();
