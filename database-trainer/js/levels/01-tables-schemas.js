(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 1,
    title: 'Tables, Schemas & Constraints',
    whyItMatters: 'Good schemas prevent impossible states from entering the system in the first place.',
    glossary: ['table', 'row', 'column', 'schema', 'primary key', 'foreign key', 'constraint'],
    learn:
      '<p>A relational schema is a contract. It says what rows may exist, how they identify themselves, and how they relate to other rows.</p>' +
      '<div class="example"><div class="label">Example</div><pre><code>users(id PRIMARY KEY, email UNIQUE NOT NULL)\norders(id PRIMARY KEY, user_id REFERENCES users(id), total_cents CHECK(total_cents &gt;= 0))</code></pre></div>' +
      '<p>Application checks are useful, but database constraints are stronger because every writer must pass through them: web app, admin script, migration, import job, or console session.</p>',
    mountPlay: function (container) {
      container.innerHTML = db.tableHtml(['users.id', 'email'], [[1, 'ava@example.com'], [2, 'ben@example.com']]) +
        db.tableHtml(['orders.id', 'user_id', 'total_cents'], [[10, 1, 4900], [11, 2, 1200]]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which constraint makes sure every user row has a stable unique identifier?',
        mountInput: function (c) { return db.selectInput(c, ['FOREIGN KEY', 'PRIMARY KEY', 'CHECK']); },
        check: function (v) { return v === 'PRIMARY KEY' ? { correct: true, feedback: 'Right. A primary key uniquely identifies each row.' } : { correct: false, feedback: 'A foreign key points elsewhere; CHECK validates an expression. The stable row identity is the primary key.' }; },
        hints: ['It is usually named id.', 'Other tables can point at it.', 'The answer is PRIMARY KEY.']
      },
      {
        difficulty: 'medium',
        prompt: 'An order must belong to an existing user. Which constraint belongs on <code>orders.user_id</code>?',
        mountInput: function (c) { return db.textInput(c, 'constraint'); },
        check: function (v) { return db.norm(v).indexOf('foreign') !== -1 && db.norm(v).indexOf('user') !== -1 ? { correct: true, feedback: 'Yes. orders.user_id should be a foreign key referencing users(id).' } : { correct: false, feedback: 'The orders table needs a pointer to a valid row in users.' }; },
        hints: ['The child table stores the parent id.', 'The database should reject orphan orders.', 'Use FOREIGN KEY (user_id) REFERENCES users(id).']
      },
      {
        difficulty: 'hard',
        prompt: 'Pick all rules the database should enforce for <code>users.email</code>.',
        mountInput: function (c) { return db.multiSelect(c, ['NOT NULL', 'UNIQUE', 'FOREIGN KEY to orders', 'CHECK total_cents >= 0']); },
        check: function (v) { var s = v.join('|'); return s.indexOf('NOT NULL') !== -1 && s.indexOf('UNIQUE') !== -1 && v.length === 2 ? { correct: true, feedback: 'Right. Emails should exist and should not duplicate. The other two rules belong elsewhere.' } : { correct: false, feedback: 'For email identity, enforce presence and uniqueness. Foreign keys and order totals are separate concerns.' }; },
        hints: ['Email is a property on users.', 'Can two accounts share the same login email?', 'Choose NOT NULL and UNIQUE only.']
      }
    ]
  });
})();
