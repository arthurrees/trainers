// Level 6 — SQL injection
EHT.registerLevel({
  id: 6,
  title: 'SQL Injection',
  whyItMatters: 'SQLi has been on every OWASP Top 10 since 2003. It still tops bug-bounty payouts in 2026 because the underlying mistake (string-concat queries) keeps reappearing in new frameworks, ORMs, and search filters. Learning the canonical patterns lets you both find SQLi and explain why the fix (parameterized queries) is non-negotiable.',
  glossary: ['SQLi', 'OWASP'],
  learn: ''
    + '<h4>The fundamental bug</h4>'
    + '<p>The vulnerability arises whenever user input is <strong>concatenated</strong> into a SQL query. The DB parser can\'t tell which characters were "code" the dev wrote vs "data" the user supplied — they\'re all just string. Anything special the user types becomes part of the query.</p>'
    + '<div class="example"><div class="label">Vulnerable code (any language)</div>'
    + '<code>query = "SELECT * FROM users WHERE username=\'" + user_input + "\' AND password=\'" + pw_input + "\'"</code><br>'
    + 'If <code>user_input = "admin\' OR \'1\'=\'1"</code>, the query becomes:<br>'
    + '<code>SELECT * FROM users WHERE username=\'admin\' OR \'1\'=\'1\' AND password=\'\'</code><br>'
    + 'The <code>OR \'1\'=\'1\'</code> makes the WHERE always-true. DB returns the first matching row → typically admin.'
    + '</div>'

    + '<h4>The classic injection patterns</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Pattern</th><th>Use</th></tr>'
    + '<tr><td><code>\' OR \'1\'=\'1</code></td><td>Always-true tail. Bypass login.</td></tr>'
    + '<tr><td><code>admin\'--</code></td><td>Comment out the rest of the query. (<code>--</code> in MySQL/Postgres, <code>#</code> in MySQL.)</td></tr>'
    + '<tr><td><code>\' UNION SELECT col1, col2 FROM secret_table--</code></td><td>Append a second SELECT to read other tables.</td></tr>'
    + '<tr><td><code>\'; DROP TABLE users--</code></td><td>Stacked queries (only some DBs / drivers).</td></tr>'
    + '<tr><td><code>1\' AND SLEEP(5)--</code></td><td>Time-based blind SQLi probe — measure response time.</td></tr>'
    + '</table>'

    + '<h4>Three flavors</h4>'
    + '<ul>'
    +   '<li><strong>In-band (visible)</strong> — output reflected in the page. Easiest to exploit; UNION-based attacks reconstruct table data via the visible page.</li>'
    +   '<li><strong>Blind boolean</strong> — page shows different content for true/false but no actual data. Reconstruct data bit-by-bit (<code>AND substring(pwd,1,1)=\'a\'</code> → page is the "true" version).</li>'
    +   '<li><strong>Blind time-based</strong> — same as boolean blind, but you measure response time (<code>AND IF(condition, SLEEP(5), 0)</code>). Slower but works when no boolean signal.</li>'
    + '</ul>'

    + '<h4>The fix: parameterized queries</h4>'
    + '<p>Don\'t concatenate. Use the DB driver\'s parameter mechanism:</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Lang/Lib</th><th>Safe form</th></tr>'
    + '<tr><td>Python (psycopg2)</td><td><code>cur.execute("SELECT * FROM users WHERE name = %s", (name,))</code></td></tr>'
    + '<tr><td>Node (pg)</td><td><code>client.query("SELECT * FROM users WHERE name = $1", [name])</code></td></tr>'
    + '<tr><td>Go (database/sql)</td><td><code>db.Query("SELECT * FROM users WHERE name = ?", name)</code></td></tr>'
    + '<tr><td>Java (PreparedStatement)</td><td><code>stmt.setString(1, name)</code></td></tr>'
    + '<tr><td>PHP (PDO)</td><td><code>$stmt->execute([\':name\' =&gt; $name])</code></td></tr>'
    + '</table>'
    + '<p>The DB receives the query <em>structure</em> and the <em>parameters</em> separately. The parameter is treated as data — never re-parsed as SQL. <strong>This is the only correct fix.</strong> "Escaping" / "blacklisting" / "WAF rules" are all weaker substitutes that fail in edge cases.</p>'

    + '<h4>ORMs and stored procedures</h4>'
    + '<ul>'
    +   '<li><strong>ORMs</strong> (SQLAlchemy, Active Record, Prisma, Sequelize, GORM) generate parameterized queries by default. Going to "raw SQL" mode reintroduces the risk.</li>'
    +   '<li><strong>Stored procedures</strong> are NOT inherently safe. If the SP uses dynamic SQL internally (<code>EXEC(@s)</code>), injection works through the parameters.</li>'
    + '</ul>'

    + '<h4>Tools (use only against intentionally-vulnerable targets)</h4>'
    + '<p>On Kali: <code>sqlmap -u "https://target/page?id=1" --dbs</code> automates fingerprinting, exploitation, and dumping for known SQLi patterns. Real-world pentesters report findings, then exploit (within scope) only as much as needed to demonstrate impact. <strong>Run sqlmap against vulnerable labs (DVWA, PortSwigger Academy), not production sites.</strong></p>'

    + '<h4>Modern variations</h4>'
    + '<ul>'
    +   '<li><strong>NoSQL injection</strong> — same idea against MongoDB, etc. (<code>{$ne: null}</code> as username always-true).</li>'
    +   '<li><strong>GraphQL injection</strong> — variables passed into resolver-side queries; same fix (parameterize).</li>'
    +   '<li><strong>ORM operator injection</strong> — Prisma/Sequelize "where" objects accepting user JSON without filtering keys can let users inject OR/NOT operators.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">A useful code-review heuristic</div>'
    + 'Search the codebase for: string concatenation operators (<code>+</code>, <code>.</code>, template literals, f-strings) <em>inside the query string passed to a DB call</em>. Every match is a potential SQLi. The fix is structural: make those never-allowed via lint rules or framework choice, not via review-time vigilance.'
    + '</div>',

  mountPlay: function (container) {
    var eh = EHT.lib.eh;
    container.innerHTML = '<p class="muted">A simulated vulnerable login form (in-memory only — no real DB, no real network). Try classic injection payloads.</p>' +
      '<div class="muted" style="margin-bottom:8px">Hardcoded users for the demo: <code>admin / P@ssw0rd!2024</code> · <code>alice / butterfly42</code> · <code>bob / qwerty</code></div>';
    var form = document.createElement('div'); form.className='fake-form';
    form.innerHTML =
      '<label>username</label>' +
      '<input type="text" id="vuln-user" placeholder="username">' +
      '<label>password</label>' +
      '<input type="text" id="vuln-pwd"  placeholder="password">' +
      '<button class="primary-btn" id="vuln-submit">Log in</button>' +
      '<div class="form-result" id="vuln-result" style="display:none"></div>';
    container.appendChild(form);
    var queryView = document.createElement('div'); queryView.className = 'terminal';
    queryView.style.marginTop = '10px';
    queryView.innerHTML = '<span class="out">(login attempt → query shown here)</span>';
    container.appendChild(queryView);

    var u = form.querySelector('#vuln-user'), p = form.querySelector('#vuln-pwd');
    var btn = form.querySelector('#vuln-submit'), res = form.querySelector('#vuln-result');

    btn.addEventListener('click', function () {
      var uv = u.value, pv = p.value;
      // Show the would-be query
      queryView.innerHTML =
        '<span class="prompt">SQL:</span> SELECT * FROM users WHERE username=\'<span class="hl-bg">' + EHT.escapeHtml(uv) + '</span>\' AND password=\'<span class="hl-bg">' + EHT.escapeHtml(pv) + '</span>\'';
      var result = eh.vulnerableLogin(uv, pv);
      res.style.display = 'block';
      if (result.ok) {
        res.className = 'form-result success';
        if (result.reason === 'sql-injection-bypass') {
          res.innerHTML = '✓ Logged in as <strong>' + result.user.username + '</strong> (' + result.user.role + ') — <span style="color:var(--bad)">via SQL injection bypass</span>. ' + (result.note || '');
        } else {
          res.innerHTML = '✓ Logged in as <strong>' + result.user.username + '</strong> (' + result.user.role + ') — normal credential match.';
        }
      } else {
        res.className = 'form-result fail';
        res.textContent = '✗ Login failed.';
      }
    });
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A login form builds the query as: <code>SELECT * FROM users WHERE username=\'$U\' AND password=\'$P\'</code> where $U and $P are concatenated user inputs. Which of these inputs in the username field would log you in WITHOUT knowing any password?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>admin</option>' +
          "<option>admin' OR '1'='1</option>" +
          '<option>"--"</option>' +
          '<option>SELECT * FROM users</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === "admin' OR '1'='1") return { correct: true, feedback: 'Right. Substituting into the template: <code>WHERE username=\'admin\' OR \'1\'=\'1\' AND password=\'\'</code>. Due to AND/OR precedence (AND binds tighter), this is effectively <code>username=\'admin\' OR (\'1\'=\'1\' AND password=\'\')</code>. The second branch needs an empty password BUT the first (<code>username=\'admin\'</code>) succeeds — admin gets returned. (Even simpler patterns like <code>" OR 1=1--</code> work too.)' };
        if (v === 'admin') return { correct: false, feedback: 'That\'s just typing the username; you\'d also need the right password.' };
        if (v === '"--"') return { correct: false, feedback: 'The query uses single-quote string delimiters. Double-quotes here are just literal characters.' };
        if (v === 'SELECT * FROM users') return { correct: false, feedback: 'This becomes the literal username "SELECT * FROM users", which doesn\'t match anyone.' };
        return { correct: false, feedback: 'You need to break out of the username string and inject SQL that always evaluates true.' };
      },
      hints: [
        'You need to break out of the string with a quote, then inject something always-true.',
        '<code>\' OR \'1\'=\'1</code> is the textbook example.',
        'Try the second option.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A search endpoint <code>/products?q=USER_INPUT</code> reflects results back. You want to confirm SQLi exists WITHOUT triggering an outage. Which payload is the lowest-risk first probe?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          "<option>'; DROP TABLE products--</option>" +
          "<option>' OR sleep(60)--</option>" +
          "<option>' OR 1=1--</option>" +
          '<option>1 -- comparing one tick: 1\' (single quote, then check for SQL syntax error in response)</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === "1 -- comparing one tick: 1' (single quote, then check for SQL syntax error in response)") return { correct: true, feedback: 'Right. The lowest-risk probe is to inject a single quote and look for: a syntax error in the response, a stack trace, OR different behavior compared to the unquoted query. No data modification, no DROP, no significant load on the DB. Pentesters call this "fuzzing for error" — the cheapest way to confirm the input reaches a SQL parser. After confirmation, escalate to UNION/blind techniques in scope.' };
        if (v === "'; DROP TABLE products--") return { correct: false, feedback: 'This is a destructive payload. Even within an authorized pentest, dropping tables is far past acceptable. Don\'t drop production data EVER.' };
        if (v === "' OR sleep(60)--") return { correct: false, feedback: 'A 60-second sleep on a busy endpoint can cause an effective DoS. Pentesters use 1–3 second sleeps initially.' };
        if (v === "' OR 1=1--") return { correct: false, feedback: 'On a search endpoint, "1=1" returns ALL rows — which can be slow on big tables and noisy in logs. The single-quote-and-check probe is cheaper.' };
        return { correct: false, feedback: 'Pick the cheapest, least-disruptive way to confirm the input reaches a SQL parser.' };
      },
      hints: [
        'Production rule: do as little as possible to confirm a vuln.',
        'You want to know "does my input reach the SQL parser?" — what\'s the smallest payload that triggers a syntax error?',
        'A single quote.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A team has SQLi-vulnerable code spread across hundreds of files. A junior dev proposes "let\'s just add a function <code>sanitize(s)</code> that strips quotes and dashes, then call it before every query." Why is this approach worse than parameterized queries, even though it sounds plausible?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>It\'s the same thing — both work</option>' +
          '<option>Stripping characters is fragile (dev forgets to call it; encoding bypasses; numeric / boolean / IN-clause inputs need different treatment; integer-typed columns don\'t use quotes; second-order injection from DB-stored strings; stripping breaks names with apostrophes). Parameterized queries fix the entire class structurally.</option>' +
          '<option>It\'s slower</option>' +
          '<option>It\'s only needed for MySQL</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Stripping characters is fragile (dev forgets to call it; encoding bypasses; numeric / boolean / IN-clause inputs need different treatment; integer-typed columns don\'t use quotes; second-order injection from DB-stored strings; stripping breaks names with apostrophes). Parameterized queries fix the entire class structurally.') return { correct: true, feedback: 'Right. The sanitization approach is bad on multiple axes: (1) easy to forget (relies on review-time vigilance); (2) different SQL contexts need different escapes — quotes for strings, but integers in <code>WHERE id=$X</code> have NO quotes to begin with, so a numeric injection sneaks through; (3) "second-order" SQLi: input passes sanitize-on-input, gets stored, then is concatenated unescaped on a later query; (4) breaks legitimate names like O\'Brien; (5) Unicode normalization / encoding tricks bypass naive strippers. Parameterized queries fix it STRUCTURALLY — the DB never re-parses the parameter as SQL. There\'s no equivalent escape strategy with the same coverage.' };
        if (v === 'It\'s the same thing — both work') return { correct: false, feedback: 'They are emphatically not the same. Sanitization is fragile; parameterization is structural.' };
        if (v === 'It\'s slower') return { correct: false, feedback: 'Performance is irrelevant here.' };
        if (v === 'It\'s only needed for MySQL') return { correct: false, feedback: 'SQLi affects every relational DB.' };
        return { correct: false, feedback: 'Re-read the lesson on parameterization vs sanitization.' };
      },
      hints: [
        'Sanitization is character-blacklisting. Where does that fail?',
        'Numeric inputs have no quotes to begin with — strippers don\'t help. Plus second-order injection through stored data. Plus Unicode/encoding tricks.',
        'Parameterized queries fix the class structurally; sanitization is a sieve.'
      ]
    }
  ]
});
