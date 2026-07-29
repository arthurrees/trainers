// Level 9 — Pigeonhole Principle
DMT.registerLevel({
  id: 9,
  title: 'Pigeonhole Principle',
  whyItMatters: 'Pigeonhole arguments prove that collisions must exist even when you cannot identify the collision in advance—exactly the situation in hashing, storage, scheduling, and compression limits.',
  glossary: ['⌈x⌉'],
  learn: ''
    + '<h4>The basic principle</h4>'
    + '<p>If more objects are placed into fewer categories, some category receives at least two objects:</p>'
    + '<div class="formula-box">n+1 pigeons in n holes ⇒ some hole contains at least 2 pigeons</div>'
    + '<div class="example"><div class="label">Birth months</div>Among any 13 people, at least two share a birth month. People are the pigeons; the 12 months are the holes.</div>'
    + '<h4>The generalized principle</h4>'
    + '<p>Putting N objects into k categories guarantees that some category contains at least:</p>'
    + '<div class="formula-box">⌈N/k⌉</div>'
    + '<p>The ceiling brackets mean “round up.” For 100 people and 12 months, ⌈100/12⌉=9, so at least nine people share a birth month.</p>'
    + '<h4>Working backward from a guarantee</h4>'
    + '<p>To guarantee at least r objects in one of k holes, imagine the fullest arrangement that still avoids r: place r−1 objects in every hole. One more object forces the guarantee.</p>'
    + '<div class="formula-box">minimum N = k(r−1)+1</div>'
    + '<div class="example"><div class="label">Guarantee five in one bucket</div>With 8 buckets, 8×4=32 keys could be spread four per bucket. Key 33 forces some bucket to contain at least five.</div>'
    + '<div class="callout"><div class="label">Precise compression consequence</div>'
    + 'No lossless compressor can make <em>every</em> fixed-length input strictly shorter. There are fewer shorter bit strings than original fixed-length strings, so two inputs would have to share an output, making perfect decompression impossible.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Distribute N objects as evenly as possible among k holes and watch the guaranteed maximum.</p>'
      + '<div class="controls-row"><label>Objects N <input type="number" id="php-n" value="13" min="0" max="100"></label><label>Holes k <input type="number" id="php-k" value="12" min="1" max="20"></label></div>'
      + '<div id="php-out" class="formula-box" aria-live="polite"></div><div id="php-vis"></div>';
    var nIn=container.querySelector('#php-n'),kIn=container.querySelector('#php-k'),out=container.querySelector('#php-out'),vis=container.querySelector('#php-vis');
    function update(){
      var N=parseInt(nIn.value,10),k=parseInt(kIn.value,10);
      if(isNaN(N)||isNaN(k)||N<0||k<1){out.textContent='Enter valid non-negative counts.';vis.innerHTML='';return;}
      var guarantee=Math.ceil(N/k),counts=new Array(k).fill(0),html='';
      for(var i=0;i<N;i++)counts[i%k]++;
      out.innerHTML='Some hole must contain at least <span class="result">'+guarantee+'</span> object'+(guarantee===1?'':'s')+'. &nbsp; <span class="muted">⌈'+N+'/'+k+'⌉</span>';
      for(var h=0;h<Math.min(k,12);h++)html+='<span class="tag">Hole '+(h+1)+': '+counts[h]+'</span>';
      if(k>12)html+='<span class="muted">…and '+(k-12)+' more holes</span>';vis.innerHTML=html;
    }
    nIn.addEventListener('input',update);kIn.addEventListener('input',update);update();
  },

  puzzles: [
    {
      difficulty:'easy',
      prompt:'A drawer contains socks of 3 colors. What is the smallest number you must grab to guarantee two socks of the same color?',
      mountInput:function(c){var i=document.createElement('input');i.type='number';c.appendChild(i);return function(){return parseInt(i.value,10);};},
      check:function(v){if(v===4)return{correct:true,feedback:'Three socks could all have different colors; the fourth must repeat one of the three colors.'};return{correct:false,feedback:'Worst case: one sock of each of 3 colors. The next sock forces a match, so 4.'};},
      hints:['Colors are the holes.','Three socks could all differ.','3+1=4 guarantees a repeated color.']
    },
    {
      difficulty:'medium',
      prompt:'Among 100 people, how many are guaranteed to share a birth month?',
      mountInput:function(c){var i=document.createElement('input');i.type='number';c.appendChild(i);return function(){return parseInt(i.value,10);};},
      check:function(v){if(v===9)return{correct:true,feedback:'⌈100/12⌉=⌈8.33…⌉=9.'};return{correct:false,feedback:'Use the generalized principle: ⌈100 people / 12 months⌉ = 9.'};},
      hints:['There are 12 month-holes.','Compute 100/12 and round up.','⌈8.33…⌉=9.']
    },
    {
      difficulty:'hard',
      prompt:'A hash table has 8 buckets. What is the smallest number of keys that guarantees some bucket contains at least 5 keys?',
      mountInput:function(c){var i=document.createElement('input');i.type='number';c.appendChild(i);return function(){return parseInt(i.value,10);};},
      check:function(v){if(v===33)return{correct:true,feedback:'With 32 keys, all 8 buckets could hold exactly 4. Key 33 forces a fifth key into some bucket.'};if(v===40)return{correct:false,feedback:'40 certainly works, but it is not the smallest. Build the largest arrangement that still avoids five per bucket.'};return{correct:false,feedback:'Avoiding five allows at most 4 keys in each of 8 buckets: 8×4=32. Add one: 33.'};},
      hints:['How many keys can you place while keeping every bucket at 4 or fewer?','8 buckets × 4 keys = 32 can still avoid five.','One more forces the guarantee: 33.']
    }
  ]
});
