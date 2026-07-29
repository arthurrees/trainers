// Level 10 — Discrete Probability
DMT.registerLevel({
  id: 10,
  title: 'Discrete Probability',
  whyItMatters: 'Probability turns counting into risk estimates. Randomized algorithms, reliability, security, machine learning, and performance analysis all depend on distinguishing independent events from dependent ones.',
  glossary: ['Ω', 'P(A)', 'P(B|A)'],
  learn: ''
    + '<h4>Sample spaces and events</h4>'
    + '<p>A <strong>sample space</strong>, written <code class="inline">Ω</code>, is the set of every possible outcome. An <strong>event</strong> A is a subset of those outcomes. When every outcome is equally likely:</p>'
    + '<div class="formula-box" style="text-align:center">P(A) = |A| / |Ω|</div>'
    + '<div class="example"><div class="label">One fair die</div>'
    + 'Ω = {1,2,3,4,5,6}. The event “roll even” is A = {2,4,6}. Therefore P(A)=3/6=1/2.'
    + '</div>'
    + '<h4>Complement</h4>'
    + '<p>The complement Aᶜ means “A does not happen.” Since either A or Aᶜ must occur:</p>'
    + '<div class="formula-box">P(Aᶜ) = 1 − P(A)</div>'
    + '<h4>Two events in sequence</h4>'
    + '<p><strong>Conditional probability</strong> <code class="inline">P(B | A)</code> means “the probability of B given that A already happened.” The general multiplication rule is:</p>'
    + '<div class="formula-box">P(A and B) = P(A) × P(B | A)</div>'
    + '<p>If A does not change the probability of B, the events are <strong>independent</strong>, so P(B | A)=P(B). Otherwise they are dependent.</p>'
    + '<div class="example"><div class="label">Without replacement</div>'
    + 'A bag has 5 red and 7 blue socks. For two reds without replacement:<br>'
    + 'P(first red)=5/12. After a red is removed, P(second red | first red)=4/11.<br>'
    + 'So P(two reds)=5/12 × 4/11 = 5/33.'
    + '</div>'
    + '<div class="callout"><div class="label">With versus without replacement</div>'
    + 'With replacement, the bag resets and successive draws are independent. Without replacement, both the total count and the favorable count can change, so later probabilities are conditional.'
    + '</div>',

  mountPlay: function (container) {
    container.innerHTML = ''
      + '<p class="muted">Change the bag and choose whether the first ball is replaced. The two-red probability updates live.</p>'
      + '<div class="controls-row">'
      + '<label>Red <input type="number" id="prob-red" value="5" min="1" max="20"></label>'
      + '<label>Blue <input type="number" id="prob-blue" value="7" min="0" max="20"></label>'
      + '<label><input type="checkbox" id="prob-replace"> Replace the first draw</label></div>'
      + '<div id="prob-out" class="formula-box" aria-live="polite"></div>';
    var red=container.querySelector('#prob-red'), blue=container.querySelector('#prob-blue'), rep=container.querySelector('#prob-replace'), out=container.querySelector('#prob-out');
    function gcd(a,b){while(b){var t=b;b=a%b;a=t;}return a;}
    function update(){
      var r=parseInt(red.value,10), b=parseInt(blue.value,10), total=r+b;
      if(isNaN(r)||isNaN(b)||r<1||b<0||total<2){out.textContent='Enter a bag with at least two balls and at least one red.';return;}
      var n1=r,d1=total,n2=rep.checked?r:r-1,d2=rep.checked?total:total-1;
      var num=n1*n2,den=d1*d2,g=gcd(num,den);
      out.innerHTML='P(two red) = '+n1+'/'+d1+' × '+n2+'/'+d2+' = <span class="result">'+(num/g)+'/'+(den/g)+'</span><br><span class="muted">'+(rep.checked?'Independent: the bag resets.':'Dependent: one red and one total ball are gone.')+'</span>';
    }
    red.addEventListener('input',update);blue.addEventListener('input',update);rep.addEventListener('change',update);update();
  },

  puzzles: [
    {
      difficulty:'easy',
      prompt:'Roll one fair six-sided die. What is <code class="inline">P(rolling an even number)</code>? Enter a fraction in lowest terms.',
      mountInput:function(c){var i=document.createElement('input');i.type='text';i.placeholder='e.g. 1/2';c.appendChild(i);return function(){return i.value.replace(/\s+/g,'');};},
      check:function(v){if(v==='1/2')return{correct:true,feedback:'Three favorable outcomes {2,4,6} out of six: 3/6=1/2.'};return{correct:false,feedback:'Even outcomes are 2, 4, and 6. P=3/6=1/2.'};},
      hints:['List all six equally likely outcomes.','Favorable outcomes are 2, 4, and 6.','3/6 reduces to 1/2.']
    },
    {
      difficulty:'medium',
      prompt:'Roll two fair six-sided dice. What is the probability that the sum is 7? Enter a fraction in lowest terms.',
      mountInput:function(c){var i=document.createElement('input');i.type='text';i.placeholder='e.g. 1/6';c.appendChild(i);return function(){return i.value.replace(/\s+/g,'');};},
      check:function(v){if(v==='1/6')return{correct:true,feedback:'Six ordered pairs sum to 7 out of 36 total pairs: 6/36=1/6.'};if(v==='6/36')return{correct:false,feedback:'Correct count; reduce 6/36 to 1/6.'};return{correct:false,feedback:'The pairs are (1,6),(2,5),(3,4),(4,3),(5,2),(6,1): 6/36=1/6.'};},
      hints:['Two dice have 6×6=36 ordered outcomes.','There are six pairs that sum to 7.','6/36=1/6.']
    },
    {
      difficulty:'hard',
      prompt:'A drawer has 5 red socks and 7 blue socks. Draw two without replacement. What is the probability both are red? Enter a fraction in lowest terms.',
      mountInput:function(c){var i=document.createElement('input');i.type='text';i.placeholder='e.g. 5/33';c.appendChild(i);return function(){return i.value.replace(/\s+/g,'');};},
      check:function(v){if(v==='5/33')return{correct:true,feedback:'P(first red)=5/12. Then P(second red | first red)=4/11. Product: 20/132=5/33.'};if(v==='20/132'||v==='10/66')return{correct:false,feedback:'The calculation is right; reduce to 5/33.'};if(v==='25/144')return{correct:false,feedback:'That treats the draws as independent. Without replacement, the second probability is 4/11.'};return{correct:false,feedback:'Use the conditional multiplication rule: 5/12 × 4/11 = 5/33.'};},
      hints:['First red: 5/12.','After one red is removed, 4 red remain among 11 socks.','5/12 × 4/11 = 20/132 = 5/33.']
    }
  ]
});
