// Level 4 — Cryptography pitfalls
EHT.registerLevel({
  id: 4,
  title: 'Cryptography Pitfalls',
  whyItMatters: 'Crypto rarely fails because the math is broken. It fails because the API was misused — wrong mode, predictable nonce, MD5 for passwords, missing salts. Recognizing these patterns saves you from the most common avoidable breaches.',
  glossary: ['hash', 'salt', 'pepper', 'bcrypt', 'argon2', 'ECB', 'CBC', 'GCM'],
  learn: ''
    + '<h4>Two things people confuse</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th></th><th>Cryptographic hash</th><th>Encryption</th></tr>'
    + '<tr><td>Direction</td><td>One-way (no key, no inverse)</td><td>Two-way (key required to invert)</td></tr>'
    + '<tr><td>Inputs</td><td>Variable-length data</td><td>Variable-length data + key</td></tr>'
    + '<tr><td>Output</td><td>Fixed-length digest</td><td>Variable-length ciphertext</td></tr>'
    + '<tr><td>Use cases</td><td>Integrity, fingerprints, password storage</td><td>Confidentiality (in transit, at rest)</td></tr>'
    + '<tr><td>Examples</td><td>SHA-256, BLAKE3, bcrypt, argon2</td><td>AES-GCM, ChaCha20-Poly1305, RSA</td></tr>'
    + '</table>'

    + '<h4>The hash hierarchy</h4>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Hash</th><th>Use for</th><th>Notes</th></tr>'
    + '<tr><td class="bad">MD5</td><td>NOTHING security-related</td><td>Collisions trivially produced (~2010). Still fine as a CHECKSUM (download integrity), never for passwords or signatures.</td></tr>'
    + '<tr><td class="bad">SHA-1</td><td>Legacy compatibility only</td><td>Practical collisions demonstrated 2017 (SHAttered). Git still uses internally; don\'t for new work.</td></tr>'
    + '<tr><td>SHA-256 / SHA-3 / BLAKE3</td><td>General hashing, integrity, signatures</td><td>Fast — that\'s why they\'re BAD for passwords. Brute-force friendly.</td></tr>'
    + '<tr><td class="good">bcrypt</td><td>Password storage (legacy systems)</td><td>Tunable cost factor (work factor). Built-in salt. ~20K hashes/sec on a modern GPU at cost 12.</td></tr>'
    + '<tr><td class="good">argon2id</td><td>Password storage (new systems)</td><td>Memory-hard. Even GPUs can\'t parallelize cheaply. PHC winner 2015.</td></tr>'
    + '</table>'

    + '<h4>Why fast hashes are wrong for passwords</h4>'
    + '<p>A modern GPU does ~50 <em>billion</em> SHA-256 hashes per second. That means an 8-character lowercase password (26⁸ ≈ 2×10¹¹ possibilities) is found in ~2 seconds. Even an 8-character ASCII password takes only minutes.</p>'
    + '<p>bcrypt at cost factor 12 is ~5,000× slower per hash. Same 8-char alphanum password? Now ~70 years. The whole game is making the attacker\'s per-guess cost expensive.</p>'

    + '<h4>Salt + pepper</h4>'
    + '<ul>'
    +   '<li><strong>Salt</strong> — random per-user value mixed with the password before hashing. Defeats <em>rainbow tables</em> (precomputed hash → plaintext lookup). Stored alongside the hash. Built into bcrypt and argon2 by default.</li>'
    +   '<li><strong>Pepper</strong> — global secret value, mixed into hashing, stored in the application config or HSM (NOT in the DB). If the DB leaks, the attacker has hashes + salts but no pepper → can\'t crack offline.</li>'
    + '</ul>'
    + '<p>Modern recipe: <code>argon2id(password + salt + pepper)</code>, with salt random per user, pepper from a key-management service.</p>'

    + '<h4>Encryption mode pitfalls</h4>'
    + '<p>AES-128 the cipher is unbroken. AES-128 misused via the wrong <em>mode</em> is broken weekly.</p>'
    + '<table class="spec-table" style="margin:12px 0">'
    + '<tr><th>Mode</th><th>Properties</th><th>Verdict</th></tr>'
    + '<tr><td class="bad">ECB</td><td>Each 16-byte block encrypted independently. Identical plaintext → identical ciphertext.</td><td>Don\'t use. Visualize a bitmap encrypted with ECB and you can still see the picture (the famous Linux penguin).</td></tr>'
    + '<tr><td class="warn">CBC</td><td>Each block XORed with previous ciphertext. Hides patterns.</td><td>Vulnerable to padding-oracle attacks; needs a separate MAC. Rarely used today.</td></tr>'
    + '<tr><td>CTR</td><td>Stream cipher mode. Encrypt counters, XOR with plaintext.</td><td>Fine if nonce is unique. Reused nonce = catastrophic (XOR plaintexts together).</td></tr>'
    + '<tr><td class="good">GCM</td><td>CTR + authenticator (Galois MAC). Encryption + integrity in one.</td><td>The modern default. <strong>Never reuse a nonce</strong> — it\'s catastrophic for both confidentiality AND authenticity.</td></tr>'
    + '<tr><td class="good">ChaCha20-Poly1305</td><td>Stream cipher + MAC. Software-friendly.</td><td>Modern default for non-AES platforms (mobile, embedded).</td></tr>'
    + '</table>'

    + '<h4>The "ECB penguin" intuition</h4>'
    + '<p>Encrypt a bitmap with AES-ECB block by block. Each 16-byte block of pixels maps to its own 16-byte ciphertext. Background (all the same color) → all the same ciphertext blocks. Foreground edges (different patterns) → different ciphertext. <em>The image structure leaks.</em> The encrypted output looks scrambled but you can still recognize a penguin.</p>'

    + '<h4>Other recurring pitfalls</h4>'
    + '<ul>'
    +   '<li><strong>Hardcoded keys</strong> in source code → leaked to GitHub. Tools: trufflehog, gitleaks scan for these.</li>'
    +   '<li><strong>Reused nonce in GCM</strong> → both confidentiality and authenticity fail. Always use a fresh random nonce or a counter you can prove won\'t repeat.</li>'
    +   '<li><strong>Math.random() for crypto</strong> — not cryptographically secure. Use <code>crypto.getRandomValues</code> (web), <code>secrets</code> (Python), <code>crypto/rand</code> (Go).</li>'
    +   '<li><strong>Length extension</strong> on raw SHA-256/512 — given <code>H(secret || msg)</code>, an attacker can compute <code>H(secret || msg || padding || extra)</code> WITHOUT knowing the secret. Use HMAC, not "secret prepended to data."</li>'
    +   '<li><strong>Roll your own crypto</strong> — almost always wrong. Use libsodium / NaCl / Tink / age / mature library defaults.</li>'
    + '</ul>'

    + '<div class="callout"><div class="label">A useful test for production code</div>'
    + 'If your crypto code calls AES, SHA, or RSA directly with hand-tuned parameters, it\'s probably wrong. If it calls a high-level API (<code>encrypt(plaintext)</code>, <code>password_verify(...)</code>), the library is making the mode/nonce/iteration-count choices for you. Choose the second by default.'
    + '</div>',

  mountPlay: function (container) {
    var eh = EHT.lib.eh;
    container.innerHTML = '<p class="muted">Plug in a hash scheme + password parameters. See realistic crack time on a modern attacker rig.</p>';

    var state = { hash: 'md5', charset: 'alphanum', length: 8 };

    var hashSel = document.createElement('select');
    [['md5','MD5 (broken hash, fast)'],['sha1','SHA-1 (broken, fast)'],['sha256','SHA-256 (fast — wrong for passwords)'],['ntlm','NTLM (Windows, fast)'],['bcrypt','bcrypt cost 12'],['argon2id','argon2id (memory-hard)']].forEach(function (h) {
      var o = document.createElement('option'); o.value=h[0]; o.textContent=h[1]; hashSel.appendChild(o);
    });
    hashSel.value = state.hash;

    var charSel = document.createElement('select');
    [['lower','lowercase (26)'],['loweralpha','lowercase+digits (36)'],['alphanum','mixed alphanum (62)'],['ascii','printable ASCII (95)']].forEach(function (c) {
      var o = document.createElement('option'); o.value=c[0]; o.textContent=c[1]; charSel.appendChild(o);
    });
    charSel.value = state.charset;

    var lenInp = document.createElement('input'); lenInp.type='number'; lenInp.min=4; lenInp.max=24; lenInp.value=state.length;

    var output = document.createElement('div'); output.className='formula-box';

    function lbl(t, el) { var l = document.createElement('label'); l.appendChild(document.createTextNode(t+' ')); l.appendChild(el); return l; }
    var row = document.createElement('div'); row.className='controls-row';
    row.appendChild(lbl('Hash:', hashSel));
    row.appendChild(lbl('Charset:', charSel));
    row.appendChild(lbl('Length:', lenInp));

    function update() {
      state.hash = hashSel.value;
      state.charset = charSel.value;
      state.length = parseInt(lenInp.value, 10);
      var sec = eh.crackSeconds(state.hash, state.charset, state.length);
      var space = eh.searchSpace(state.charset, state.length);
      var speed = eh.hashSpeed(state.hash);
      var verdict = sec < 60 ? 'bad' : sec < 86400 * 30 ? 'warn' : 'good';
      output.innerHTML =
        '<div class="info-line"><span class="key">Search space:</span> <span class="val">' + eh.charsetSize(state.charset) + '<sup>' + state.length + '</sup> ≈ ' + space.toExponential(2) + ' candidates</span></div>' +
        '<div class="info-line"><span class="key">Hash speed (1 GPU):</span> <span class="val">' + speed.toExponential(2) + ' H/s</span></div>' +
        '<div class="info-line"><span class="key">Avg crack time:</span> <span class="val"><span class="result" style="color:var(--' + verdict + ')">' + eh.fmtSeconds(sec) + '</span></span></div>';
    }
    [hashSel, charSel, lenInp].forEach(function (el) { el.addEventListener('input', update); });
    update();
    container.appendChild(row);
    container.appendChild(output);
  },

  puzzles: [
    {
      difficulty: 'easy',
      prompt: 'A new web app stores user passwords as <code>SHA-256(password)</code> with no salt. What\'s the single biggest problem?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>SHA-256 is broken</option>' +
          '<option>SHA-256 is too fast for passwords AND no salt = rainbow tables work</option>' +
          '<option>SHA-256 outputs are too long</option>' +
          '<option>It should be MD5 instead</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'SHA-256 is too fast for passwords AND no salt = rainbow tables work') return { correct: true, feedback: 'Right. Two problems compounding: (1) SHA-256 hashes at ~10 GH/s on a consumer GPU — brute force on common passwords completes in seconds; (2) without a per-user salt, attackers use precomputed rainbow tables (terabytes of "hash → password" lookups). Use bcrypt or argon2id with their built-in salt.' };
        if (v === 'SHA-256 is broken') return { correct: false, feedback: 'SHA-256 is mathematically fine. The problem is using a fast general-purpose hash for password storage at all.' };
        if (v === 'SHA-256 outputs are too long') return { correct: false, feedback: 'Length is unrelated.' };
        if (v === 'It should be MD5 instead') return { correct: false, feedback: 'MD5 is even worse — it\'s broken.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'Two issues are stacked here. Speed AND missing per-user randomization.',
        'Fast hash = brute-force friendly. No salt = rainbow tables work.',
        'Use bcrypt or argon2id, not raw SHA-256.'
      ]
    },
    {
      difficulty: 'medium',
      prompt: 'A team encrypts customer profile photos with AES-128-ECB before storing in S3. They tell you "AES is industry standard, this is fine." Demonstrate the issue: what specifically can an attacker who steals the encrypted bucket observe?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>Nothing — AES-128 is unbroken</option>' +
          '<option>The exact original images, decrypted</option>' +
          '<option>Visible structure: identical 16-byte plaintext blocks → identical ciphertext blocks. Solid-color regions, edges, repeated patterns are still visible. Penguins still look like penguins.</option>' +
          '<option>The keys, because ECB exposes them</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Visible structure: identical 16-byte plaintext blocks → identical ciphertext blocks. Solid-color regions, edges, repeated patterns are still visible. Penguins still look like penguins.') return { correct: true, feedback: 'Right. The famous "ECB penguin" demo. AES the cipher is fine; AES-ECB the mode preserves structure because each 16-byte block is encrypted independently. For any data with repetition (most images), the ciphertext leaks the shape. Modern fix: AES-GCM with random nonce per object.' };
        if (v === 'The exact original images, decrypted') return { correct: false, feedback: 'They wouldn\'t see the EXACT image — but they\'d see structure that often makes the subject identifiable.' };
        if (v === 'Nothing — AES-128 is unbroken') return { correct: false, feedback: 'The cipher is unbroken. The MODE (ECB) leaks structure.' };
        if (v === 'The keys, because ECB exposes them') return { correct: false, feedback: 'Keys aren\'t exposed by ECB. Structure is.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'AES-128 the cipher is fine. AES-128-ECB the MODE has a famous failure.',
        'In ECB, identical plaintext blocks → identical ciphertext blocks.',
        'Image structure leaks — the "ECB penguin" demo.'
      ]
    },
    {
      difficulty: 'hard',
      prompt: 'A code review shows: <code>const hash = sha256(secretKey + message); send({ message, hash });</code>. The receiver verifies by recomputing <code>sha256(secretKey + receivedMessage)</code>. What known cryptographic flaw does this expose, and what\'s the fix?',
      mountInput: function (c) {
        var sel = document.createElement('select');
        sel.innerHTML = '<option value="">— pick one —</option>' +
          '<option>SHA-256 is broken — switch to BLAKE3</option>' +
          '<option>Length-extension attack — given (message, hash), an attacker can produce a valid hash for (message + padding + extra) without knowing secretKey. Fix: HMAC-SHA-256(secretKey, message)</option>' +
          '<option>It\'s fine — SHA-256 with a key is what HMAC does</option>' +
          '<option>The secretKey is too long for SHA-256</option>';
        c.appendChild(sel);
        return function () { return sel.value; };
      },
      check: function (v) {
        if (v === 'Length-extension attack — given (message, hash), an attacker can produce a valid hash for (message + padding + extra) without knowing secretKey. Fix: HMAC-SHA-256(secretKey, message)') return { correct: true, feedback: 'Right. The Merkle–Damgård construction (used by SHA-256) lets you continue hashing FROM a known intermediate state. So if you know <code>H(K || M)</code>, you can compute <code>H(K || M || pad || M\')</code> for any M\' you want, with NO knowledge of K. This is "length extension." HMAC fixes it via <code>H(K_outer || H(K_inner || M))</code> — the outer hash hides the intermediate state. <strong>Always use HMAC, never raw "key prepended to data" with SHA-2.</strong> SHA-3 and BLAKE2 are not vulnerable to length extension and can be used directly.' };
        if (v === 'SHA-256 is broken — switch to BLAKE3') return { correct: false, feedback: 'SHA-256 isn\'t broken. The PATTERN of using it (raw concat) is broken.' };
        if (v === 'It\'s fine — SHA-256 with a key is what HMAC does') return { correct: false, feedback: 'Specifically, this is NOT what HMAC does. HMAC = H(K_outer || H(K_inner || M)). Two passes, with different key derivations, exactly to defeat length-extension.' };
        if (v === 'The secretKey is too long for SHA-256') return { correct: false, feedback: 'Length isn\'t the issue.' };
        return { correct: false, feedback: 'Pick one.' };
      },
      hints: [
        'There\'s a famous attack name for "raw H(secret || message)" patterns.',
        'It exploits Merkle–Damgård internal state. You can EXTEND the hash with new data without the key.',
        'Length-extension. Fix: use HMAC.'
      ]
    }
  ]
});
