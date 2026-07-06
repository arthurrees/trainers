// Level 7 — XSS
EHT.registerLevel({
  id: 7,
  title: 'Cross-Site Scripting (XSS)',
  whyItMatters: 'XSS is "I can run JavaScript in your user\'s browser, in the context of your domain." That means stealing session cookies (if not HttpOnly), reading the DOM, sending requests as the user, displaying fake login forms. It\'s pervasive, easy to introduce, and subtle to fix correctly.',
  glossary: ['XSS', 'CSP', 'OWASP'],
  learn: ''
    + '<h4>The fundamental bug</h4>'
    + '<p>Anywhere your server takes user input and inserts it into HTML <strong>without proper output encoding</strong>, the user can inject script. The browser parses the resulting HTML and dutifully runs the JavaScript.</p>'
    + '<div class="example"><div class="label">Vulnerable template (Express + raw concat)</div>'
    + '<code>res.send("&lt;h1&gt;Hello, " + req.query.name + "!&lt;/h1&gt;");</code><br>'
    + 'If <code>?name=&lt;script&gt;alert(1)&lt;/script&gt;</code>, the browser sees: <code>&lt;h1&gt;Hello, &lt;script&gt;alert(1)&lt;/script&gt;!&lt;/h1&gt;</code> and runs the script.'
    + '</div>'

    + '<h4>Three flavors</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Type</th><th>Trust path</th><th>Example trigger</th></tr>'
    + '<tr><td><strong>Reflected</strong></td><td>Server reflects the input from the request directly into the response.</td><td>Send victim a link with payload in URL → they click → their browser executes.</td></tr>'
    + '<tr><td><strong>Stored / Persistent</strong></td><td>Payload is saved server-side (DB, comments, profile) and rendered on every page load by every viewer.</td><td>Comment that contains a script — every user who views the post gets popped.</td></tr>'
    + '<tr><td><strong>DOM-based</strong></td><td>The vulnerability is entirely in client-side JS. The server sends a benign page; client JS reads from <code>location.hash</code> / <code>document.URL</code> and innerHTMLs it.</td><td>Single-page apps that take URL fragments and use them as HTML.</td></tr>'
    + '</table>'

    + '<h4>What an XSS payload can do</h4>'
    + '<p>Once you\'re running JS in the page\'s origin, you have FULL access to:</p>'
    + '<ul>'
    +   '<li>Cookies the page can read (XSS bypasses everything except HttpOnly).</li>'
    +   '<li>Make any same-origin request as the user (steal CSRF tokens, hit admin endpoints if user is admin).</li>'
    +   '<li>Read and modify the entire DOM — replace forms, exfiltrate data the user types.</li>'
    +   '<li>Read localStorage / sessionStorage.</li>'
    +   '<li>Use the Service Worker / Notification APIs if granted.</li>'
    + '</ul>'
    + '<p>"Just a popup" demos undersell the impact. A real XSS payload phones home, scrapes the user\'s data, and pivots within the app.</p>'

    + '<h4>The fix: contextual output encoding</h4>'
    + '<p>"Encoding" (also called "escaping") = converting characters that have meaning in the destination context into their safe representations.</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Where the data goes</th><th>What to encode</th></tr>'
    + '<tr><td>HTML body (between tags)</td><td><code>&amp;</code>→<code>&amp;amp;</code>, <code>&lt;</code>→<code>&amp;lt;</code>, <code>&gt;</code>→<code>&amp;gt;</code></td></tr>'
    + '<tr><td>HTML attribute value</td><td>HTML-encode + quote the attribute value</td></tr>'
    + '<tr><td>JavaScript string literal</td><td>JS-escape: <code>\\\'</code>, <code>\\"</code>, <code>\\\\</code>, <code>\\n</code>, <code>\\r</code>, <code>\\u003c</code> for <code>&lt;</code></td></tr>'
    + '<tr><td>URL parameter</td><td>URL-encode (<code>encodeURIComponent</code>)</td></tr>'
    + '<tr><td>CSS context</td><td>CSS-escape (<code>CSS.escape</code>)</td></tr>'
    + '</table>'
    + '<p>Modern templating engines (React JSX, Angular, Vue, Jinja2 with autoescape, ERB with safe defaults) do this automatically as long as you don\'t bypass them with <code>dangerouslySetInnerHTML</code> / <code>{{{x}}}</code> / <code>html_safe</code>.</p>'

    + '<h4>Content-Security-Policy (CSP)</h4>'
    + '<p>HTTP header that instructs browsers to refuse to load/execute resources outside an explicit allowlist. Even if XSS injects a script tag, CSP can refuse to run it.</p>'
    + '<div class="example"><div class="label">A reasonable starter CSP</div>'
    + '<code>Content-Security-Policy: default-src \'self\'; script-src \'self\' \'nonce-RANDOM\'; object-src \'none\'; base-uri \'self\'; frame-ancestors \'self\'</code><br>'
    + 'Key parts: scripts only from same origin OR with the matching nonce; no inline scripts; no objects; no clickjacking.'
    + '</div>'
    + '<p>CSP is defense-in-depth, NOT primary defense. Output encoding is the primary defense; CSP is the safety net for missed encodings.</p>'

    + '<h4>Common mistakes that re-open XSS</h4>'
    + '<ul>'
    +   '<li><code>dangerouslySetInnerHTML</code> in React with user data → game over.</li>'
    +   '<li><code>v-html</code> in Vue with user data → same.</li>'
    +   '<li>Passing user data directly into <code>innerHTML</code> / <code>document.write</code> in vanilla JS.</li>'
    +   '<li>Inserting user data into <code>href="..."</code> attributes without checking the URL scheme — <code>javascript:alert(1)</code> works in href.</li>'
    +   '<li>Using <code>Markdown.render</code> without a sanitizer — Markdown allows HTML by default in many parsers.</li>'
    +   '<li>Server-side templating with the wrong filter for the destination (HTML-escape applied to a JS string context — different escapes are needed).</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">Sanitization vs encoding</div>'
    + '"Sanitization" tries to PARSE the input, remove dangerous bits, return cleaned HTML — needed when you must allow some HTML (rich-text editors, comments). Use <strong>DOMPurify</strong> (client) or <strong>bleach</strong> (Python) — battle-tested. <em>Don\'t</em> roll your own. "Encoding" is the simpler operation for the case where you don\'t need any HTML — just make characters literal. Use the right one for the situation.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = '<p class="muted">Type a "name" and see how three different render strategies behave. The third is properly encoded; the first two are vulnerable.</p>';

    var input = document.createElement('input');
    input.type = 'text'; input.value = '<script>alert(1)</script>'; input.style.width = '100%'; input.style.maxWidth = '480px';
    container.appendChild(input);

    var rows = document.createElement('div'); rows.style.marginTop = '14px';

    function renderRow(title, mode) {
      var div = document.createElement('div'); div.style.marginBottom = '10px';
      var label = document.createElement('div'); label.className = 'info-line';
      label.innerHTML = '<span class="key">' + title + ':</span>';
      var out = document.createElement('div');
      out.style.background = 'var(--bg-3)';
      out.style.border = '1px solid var(--border)';
      out.style.padding = '10px 12px';
      out.style.borderRadius = '6px';
      out.style.fontFamily = 'var(--mono)';
      out.style.fontSize = '13px';
      div.appendChild(label);
      div.appendChild(out);
      rows.appendChild(div);
      return out;
    }

    var bad1 = renderRow('1. Raw innerHTML (vulnerable)', 'bad');
    var bad2 = renderRow('2. Concatenated into HTML attribute (still vulnerable)', 'bad');
    var safe = renderRow('3. textContent / encoded (safe)', 'safe');

    function update() {
      var v = input.value;
      // Mode 1: render as if injected raw (we use a sandboxed <iframe srcdoc> so any script
      // can only access the iframe, not the trainer page. Or just show the literal HTML.)
      // Showing the literal escaped HTML the browser would render but flagged as dangerous.
      bad1.innerHTML = '<span style="color:var(--bad)">would execute as HTML →</span> <code>&lt;h1&gt;Hello, ' + v + '!&lt;/h1&gt;</code>';
      bad2.innerHTML = '<span style="color:var(--bad)">would render attribute →</span> <code>&lt;a href="/?n=' + v + '"&gt;link&lt;/a&gt;</code>';
      // Mode 3: textContent — set as text, browser doesn't parse as HTML
      safe.textContent = 'Hello, ' + v + '! (rendered as text — < and > are literals here, no script tag executes)';
      safe.style.color = 'var(--good)';
    }
    input.addEventListener('input', update);
    update();
    container.appendChild(rows);

    var note = document.createElement('div');
    note.className = 'info-line muted';
    note.style.marginTop = '8px';
    note.innerHTML = 'Note: this Play surface only SHOWS the literal HTML strings; nothing executes (the trainer page never sets innerHTML to your input). The point is to recognize that rows 1 and 2 would, in a real app, be dangerous; row 3 (textContent / encoded) is safe by construction.';
    container.appendChild(note);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A site shows search results as: <code>res.send("&lt;p&gt;You searched for: " + req.query.q + "&lt;/p&gt;")</code>. What kind of XSS does this enable, and what payload demonstrates it?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Stored XSS, payload is an SQL injection</option>' +
          '<option>Reflected XSS — payload like <code>?q=&lt;script&gt;alert(1)&lt;/script&gt;</code> in URL, victim clicks the link</option>' +
          '<option>DOM-based XSS — only happens in client JS</option>' +
          '<option>It\'s safe — Express auto-escapes</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Reflected XSS — payload like <code>?q=&lt;script&gt;alert(1)&lt;/script&gt;</code> in URL, victim clicks the link') return { correct: true, feedback: 'Right. The payload is in the URL (req.query.q), the server reflects it directly into the HTML response, and the victim\'s browser executes it. That\'s the textbook reflected XSS shape. Express does NOT auto-escape res.send strings — you have to use a templating engine with autoescape, or escape manually, or use res.json instead.' };
        if (v === 'Stored XSS, payload is an SQL injection') return { correct: false, feedback: 'There\'s no DB write here. The payload comes from the URL and is reflected back. That\'s reflected XSS, not stored. SQLi is a different vuln class.' };
        if (v === 'DOM-based XSS — only happens in client JS') return { correct: false, feedback: 'The unsafe concatenation happens on the SERVER. DOM-based XSS lives entirely in client JS.' };
        if (v === 'It\'s safe — Express auto-escapes') return { correct: false, feedback: 'Express does not auto-escape res.send. You\'re sending a literal string.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Server reflects URL parameter into HTML. Three flavors: reflected, stored, DOM. Which?',
        'No persistence, no DB. Server response mirrors the URL parameter.',
        'Reflected XSS.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A team adds <code>Content-Security-Policy: default-src \'self\'</code> as their entire XSS defense. They tell users they\'ve "fixed XSS." Why is this an incomplete defense, even though CSP is a real control?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>CSP is fake security; nothing actually changes</option>' +
          '<option>CSP is defense-in-depth, not the primary defense. It can\'t stop "exfiltrate session data via fetch to /api/...", DOM manipulation, fake login forms, eval if \'unsafe-eval\' is allowed somewhere, or browsers without CSP support. Output encoding is the primary defense — CSP is a backstop for missed encodings.</option>' +
          '<option>CSP only works on Chrome</option>' +
          '<option>It\'s fine — they\'re right</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v.indexOf('CSP is defense-in-depth') === 0) return { correct: true, feedback: 'Right. CSP is a real and useful layer — it can stop a script from a different origin, refuse inline scripts (with strict policies), prevent some forms of code execution. But XSS impact extends beyond "execute a script tag." An injected payload can: manipulate the DOM (replace forms with phishing), exfiltrate readable data via fetch to /api/... (your own origin is allowed by default-src \'self\'!), set off keyboard logging, render fake login UIs that POST elsewhere via form action. None of those need to load anything off-origin. Output encoding eliminates the injection point; CSP catches what slips through.' };
        if (v === 'CSP is fake security; nothing actually changes') return { correct: false, feedback: 'CSP is real. Just not sufficient on its own.' };
        if (v === 'CSP only works on Chrome') return { correct: false, feedback: 'All major browsers support CSP.' };
        if (v === 'It\'s fine — they\'re right') return { correct: false, feedback: 'Several real attacks survive default-src \'self\'.' };
        return { correct: false, feedback: 'Re-read the lesson on CSP as defense-in-depth.' };
      },
      hints: [
        'CSP blocks loading scripts from other origins. What can XSS still do at the SAME origin?',
        'DOM tampering, fake forms, fetch() to /api/... (allowed by self), keyboard logging — none of these need an off-origin script.',
        'CSP is a safety net, not a primary defense. Encode output.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A React app does <code>{userBio}</code> in JSX (auto-escaped by React) and uses <code>dangerouslySetInnerHTML</code> ONLY for the WYSIWYG-edited "rich bio" field. The team uses DOMPurify on the rich bio before rendering. Their CSP is <code>default-src \'self\'; script-src \'self\'</code>. A bug-bounty researcher reports stored XSS via the rich bio. List the most likely failure modes (mark TRUE for ones that are real).',
      mountInput: function (c) {
        var items = [
          { label: 'DOMPurify ran on input but NOT after a later DB column-rename migration that re-stored raw HTML — second-order escape failure.', t: true },
          { label: 'DOMPurify config allowed <code>onerror</code> attributes (bad config option).', t: true },
          { label: 'DOMPurify ran client-side only, but the bio is also rendered server-side by an SSR path that didn\'t purify.', t: true },
          { label: 'React auto-escaping is broken in v18.', t: false },
          { label: 'CSP blocks all XSS automatically.',  t: false }
        ];
        var div = document.createElement('div'); div.className = 'checkbox-list';
        var boxes = items.map(function (it) {
          var lbl = document.createElement('label');
          var cb = document.createElement('input'); cb.type='checkbox'; lbl.appendChild(cb);
          lbl.appendChild(document.createTextNode(' '));
          var span = document.createElement('span'); span.innerHTML = it.label; lbl.appendChild(span);
          div.appendChild(lbl);
          return { cb: cb, expected: it.t };
        });
        c.appendChild(div);
        return function () { return boxes.map(function (b) { return { picked: b.cb.checked, expected: b.expected }; }); };
      },
      check: function (v) {
        var allCorrect = v.every(function (b) { return b.picked === b.expected; });
        if (allCorrect) return { correct: true, feedback: 'Right. The first three are real, common patterns: <ol><li>Migrations and pipeline changes can bypass earlier sanitization (data was clean when written, but a re-import or column rename brings raw payload back).</li><li>DOMPurify\'s defaults are good, but config options to ALLOW certain attributes/tags are a frequent foot-gun.</li><li>Server-side rendering paths that don\'t go through the same sanitizer — the React component is fine, but Next.js SSR or a Sidekiq email job uses a different render path with no purifier.</li></ol> React 18 auto-escape isn\'t broken. CSP doesn\'t block all XSS (covered in the previous puzzle).' };
        return { correct: false, feedback: 'Re-check: the first three are realistic real-world failure modes for purified rich-text fields. The last two are not (React 18 auto-escape works; CSP isn\'t a complete XSS defense).' };
      },
      hints: [
        'Think about ALL the places this rich-bio HTML might be rendered — not just the React component.',
        'Server-side rendering, email pipelines, data migrations, DOMPurify config options.',
        'First three are real patterns. Last two are not.'
      ]
    }
  ]
});
