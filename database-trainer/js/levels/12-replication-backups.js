(function () {
  var db = DBT.lib.db;
  DBT.registerLevel({
    id: 12,
    title: 'Replication & Backups',
    whyItMatters: 'Availability is not the same as recoverability; replicas and backups solve different failure modes.',
    glossary: ['replication', 'RPO', 'RTO', 'WAL'],
    learn:
      '<p>Replication keeps another server close to current so reads can scale or failover can happen. Backups let you recover from deletion, corruption, bad migrations, ransomware, or bugs replicated everywhere.</p>' +
      '<div class="example"><div class="label">Key distinction</div>A replica copies mistakes quickly. A backup lets you go back in time.</div>' +
      '<p>RPO asks "how much data can we lose?" RTO asks "how long can we be down?"</p>',
    mountPlay: function (container) {
      db.cards(container, [
        { title: 'Async replica', body: 'Fast primary commits, possible seconds of data loss.' },
        { title: 'Sync replica', body: 'Primary waits for replica, lower data loss, higher latency.' },
        { title: 'Backup', body: 'Point-in-time recovery if tested and restorable.' }
      ]);
    },
    puzzles: [
      {
        difficulty: 'easy',
        prompt: 'Which protects best against accidentally running <code>DELETE FROM users</code> and replicating it?',
        mountInput: function (c) { return db.selectInput(c, ['A replica only', 'A tested point-in-time backup', 'More indexes']); },
        check: function (v) { return v === 'A tested point-in-time backup' ? { correct: true, feedback: 'Right. The replica will copy the deletion; backups let you rewind.' } : { correct: false, feedback: 'Replication copies both good and bad changes.' }; },
        hints: ['The mistake is a valid write.', 'Replicas follow the primary.', 'Use point-in-time backup/restore.']
      },
      {
        difficulty: 'medium',
        prompt: 'RPO measures what?',
        mountInput: function (c) { return db.selectInput(c, ['Maximum acceptable data loss', 'Maximum acceptable downtime', 'Replica CPU usage']); },
        check: function (v) { return v === 'Maximum acceptable data loss' ? { correct: true, feedback: 'Right. RPO is about the recovery point: how far back you may lose data.' } : { correct: false, feedback: 'RTO is downtime. RPO is data loss.' }; },
        hints: ['Point, not time-to-repair.', 'How stale can restored data be?', 'Maximum acceptable data loss.']
      },
      {
        difficulty: 'hard',
        prompt: 'Why is an untested backup not a real backup?',
        mountInput: function (c) { return db.textInput(c, 'reason'); },
        check: function (v) { return db.norm(v).indexOf('restore') !== -1 || db.norm(v).indexOf('corrupt') !== -1 || db.norm(v).indexOf('verify') !== -1 ? { correct: true, feedback: 'Exactly. The only proof is a successful restore under realistic conditions.' } : { correct: false, feedback: 'The risk is discovering during an outage that the backup cannot actually restore.' }; },
        hints: ['The backup file existing is not enough.', 'You care about restoration.', 'A backup must be regularly restored/verified.']
      }
    ]
  });
})();
