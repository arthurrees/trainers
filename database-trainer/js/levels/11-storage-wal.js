(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 11,
    title: 'Storage, Pages & WAL',
    whyItMatters: 'Understanding pages and logs explains why databases can be fast and still survive crashes.',
    glossary: ['page', 'buffer pool', 'WAL', 'checkpoint', 'commit'],
    learn:
      '<p>Databases read and write fixed-size pages, not individual logical rows. Hot pages live in the buffer pool. Dirty pages are changed in memory and later flushed to disk.</p>' +
      '<p>Write-ahead logging makes this safe: the log record reaches stable storage before the data page has to. On crash, the engine replays committed log records and discards uncommitted ones.</p>' +
      '<div class="example"><div class="label">Rule</div>Log first, data page later.</div>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: '1. Change row', body: 'Page becomes dirty in memory.' },
        { title: '2. Write WAL', body: 'Commit record reaches disk.' },
        { title: '3. Flush page', body: 'Checkpoint later writes dirty pages.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'What fixed-size unit does a database usually read from disk?',
        mountInput: function (c) { return db.textInput(c, 'unit'); },
        check: function (v) { return db.norm(v).indexOf('page') !== -1 ? { correct: true, feedback: 'Right. Pages are the basic IO unit.' } : { correct: false, feedback: 'Rows live inside a larger fixed-size disk block.' }; },
        hints: ['Often 4KB, 8KB, or 16KB depending on engine.', 'Rows are stored inside it.', 'Page.']
      },
      {
        difficulty: 'medium',
        prompt: 'Why can a commit finish before every changed data page is written?',
        mountInput: function (c) { return db.textInput(c, 'reason'); },
        check: function (v) { return db.norm(v).indexOf('wal') !== -1 || db.norm(v).indexOf('log') !== -1 ? { correct: true, feedback: 'Yes. The WAL record is enough to redo the committed change after a crash.' } : { correct: false, feedback: 'The durable record of the change is written somewhere else first.' }; },
        hints: ['The dirty page can wait in memory.', 'Crash recovery needs a durable recipe.', 'Because WAL/log records are durable first.']
      },
      {
        difficulty: 'hard',
        prompt: 'A checkpoint mainly reduces what future cost?',
        mountInput: function (c) { return db.selectInput(c, ['Crash recovery time', 'SQL parse time', 'Network round trips']); },
        check: function (v) { return v === 'Crash recovery time' ? { correct: true, feedback: 'Right. Checkpoints shorten how much WAL must be replayed.' } : { correct: false, feedback: 'Checkpointing is about flushing dirty pages and limiting recovery work.' }; },
        hints: ['It writes dirty pages.', 'It moves the safe restart point forward.', 'Crash recovery time.']
      }
    ]
  });
})();
