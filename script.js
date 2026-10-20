(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const scene = $('scene');
  const syringe = $('syringe');
  const plunger = $('plunger');
  const TARGET = {x:381,y:302};
  const STROKE = 100;
  const START = {x:143,y:397};
  const KEY = 'jarc-chem8-arcade-v2';
  let state='idle', score=0, round=1, fill=0, best=0, playerName='';
  let pos={...START}, drag=null, startY=0, startFill=0;
  let soundOn=true, saved=false, run=0, velocitySamples=[];
  let localScores=[];
  try {
    const store=JSON.parse(localStorage.getItem(KEY)||'{}');
    best=Number(store.best)||0;
    playerName=store.name||'';
    localScores=Array.isArray(store.scores)?store.scores.slice(0,20):[];
  } catch (_) {}
  $('player').value=playerName;

  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  const tolerance=()=>Math.max(16,26-(round-1)*0.8);
  const lower=()=>Math.min(76,70+(round-1)*0.65);
  const upper=()=>Math.max(84,87-(round-1)*0.4);
  const coords=e=>{const p=scene.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(scene.getScreenCTM().inverse())};
  const aligned=()=>Math.hypot(pos.x-TARGET.x,pos.y-TARGET.y)<=tolerance();
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify({best,name:playerName,scores:localScores.slice(0,20)}))}catch(_){}};
  const msg=(s)=>{$('message').textContent=s;};
  function sound(freq=620,len=.11){if(!soundOn)return;try{const context=new(window.AudioContext||window.webkitAudioContext)();const osc=context.createOscillator(),vol=context.createGain();osc.frequency.value=freq;osc.type='sine';vol.gain.value=.045;osc.connect(vol);vol.connect(context.destination);osc.start();osc.stop(context.currentTime+len);osc.onended=()=>context.close()}catch(_){}}
  function paint(){
    syringe.setAttribute('transform',`translate(${pos.x} ${pos.y})`);
    plunger.setAttribute('transform',`translate(0 ${STROKE*fill/100})`);
    $('sampleInside').setAttribute('height',String(Math.max(0,68*(1-fill/100))));
    $('channelFill').setAttribute('width',String(582*fill/100));
    $('fillBar').style.width=fill+'%';
    $('fillTarget').style.left=lower()+'%';
    $('fillTarget').style.width=(upper()-lower())+'%';
    $('targetBand').setAttribute('x',String(3+582*lower()/100));
    $('targetBand').setAttribute('width',String(582*(upper()-lower())/100));
    $('percent').textContent=fill.toFixed(1)+'%';
    const ok=aligned();
    $('aimStatus').textContent=ok?'Tip aligned':'Align the tip';
    $('aimDot').classList.toggle('good',ok);
    $('score').textContent=String(score).padStart(2,'0');
    $('round').textContent=String(round).padStart(2,'0');
    $('best').textContent=String(best).padStart(2,'0');
    $('difficulty').textContent='LEVEL '+round;
    $('toleranceReadout').textContent=round<5?'Generous':round<10?'Moderate':'Precise';
    $('flowReadout').textContent=round<7?'Forgiving':'Focused';
    $('sceneMessage').textContent=state==='aim'?(ok?'ALIGNED · PUSH THE PLUNGER DOWN':'DRAG SYRINGE TO THE SAMPLE PORT'):state==='push'?'PUSH STEADILY · STOP IN GREEN':state==='success'?'GREAT FILL · +1 CARTRIDGE':'DRAG SYRINGE TO THE SAMPLE PORT';
  }
  function newRound(){
    state='aim';fill=0;pos={...START};drag=null;velocitySamples=[];saved=false;
    $('save').disabled=true;$('resultOverlay').classList.add('hidden');
    $('phaseLabel').textContent='Step 1 · Align syringe';
    $('start').innerHTML='RESTART CHALLENGE <span>↻</span>';
    msg('Drag the syringe barrel toward the glowing sample port.');paint();
  }
  function start(){run++;round=1;score=0;newRound();sound(560,.09)}
  function end(reason,help){
    if(state==='over'||state==='success')return;
    state='over';drag=null;
    $('resultIcon').textContent='✕';
    $('resultTitle').textContent=reason;
    $('resultText').textContent=help+` You successfully filled ${score} cartridge${score===1?'':'s'}.`;
    $('resultOverlay').classList.remove('hidden');
    $('save').disabled=false;$('phaseLabel').textContent='Run complete';
    msg(reason+' · GAME OVER');$('start').innerHTML='PLAY AGAIN <span>↻</span>';sound(200,.23);paint();
  }
  function success(){
    state='success';drag=null;score++;if(score>best){best=score;persist()}
    $('phaseLabel').textContent='Perfect! Next cartridge incoming';
    msg('CORRECT FILL! +1 CARTRIDGE');sound(770,.15);paint();
    round++;
    const id=run;
    setTimeout(()=>{if(run===id&&state==='success')newRound()},950);
  }
  function release(){
    if(state!=='push')return;
    if(!aligned())return end('MISSED PORT','The syringe tip moved away from the sample port.');
    if(fill<lower())return end('UNDERFILL','Release closer to the highlighted green fill zone.');
    if(fill>upper())return end('OVERFILL','The cartridge went beyond the target fill window.');
    success();
  }
  $('barrelGrip').addEventListener('pointerdown',e=>{
    if(state!=='aim')return;
    e.preventDefault();const p=coords(e);drag={mode:'barrel',id:e.pointerId,dx:p.x-pos.x,dy:p.y-pos.y};
    scene.setPointerCapture(e.pointerId);
  });
  $('plungerGrip').addEventListener('pointerdown',e=>{
    if(state!=='aim')return;
    e.preventDefault();
    if(!aligned()){msg('Move the needle tip onto the glowing sample port first.');sound(330,.08);return}
    const p=coords(e);drag={mode:'plunger',id:e.pointerId};
    startY=p.y;startFill=fill;velocitySamples=[{t:performance.now(),value:fill}];state='push';
    $('phaseLabel').textContent='Step 2 · Controlled dispense';
    msg('Slide the attached plunger down. Release inside green.');
    scene.setPointerCapture(e.pointerId);
  });
  scene.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    e.preventDefault();const p=coords(e);
    if(drag.mode==='barrel'){
      pos.x=clamp(p.x-drag.dx,45,607);
      pos.y=clamp(p.y-drag.dy,282,522);
      paint();return;
    }
    if(state!=='push')return;
    const proposed=clamp(startFill+(p.y-startY)*100/STROKE,0,100);
    const next=Math.max(fill,proposed);
    const now=performance.now();velocitySamples.push({t:now,value:next});
    velocitySamples=velocitySamples.filter(x=>now-x.t<110);
    if(velocitySamples.length>1){
      const first=velocitySamples[0];const duration=(now-first.t)/1000;
      if(duration>.055&&(next-first.value)/duration>360){fill=next;paint();return end('TOO FAST','The plunger was pushed too quickly. Try a smoother movement.')}
    }
    fill=next;paint();
    if(fill>upper())end('OVERFILL','You pushed beyond the green fill window.');
  });
  scene.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const mode=drag.mode;drag=null;
    if(mode==='plunger')release();else if(aligned()){msg('Great alignment! Now slide the plunger cap downward.');sound(680,.08)}
  });
  scene.addEventListener('pointercancel',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const mode=drag.mode;drag=null;
    if(mode==='plunger')end('INTERRUPTED','The plunger movement was interrupted.');
  });
  scene.addEventListener('lostpointercapture',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const mode=drag.mode;drag=null;if(mode==='plunger')release();
  });
  $('start').addEventListener('click',start);$('reset').addEventListener('click',start);$('overlayRestart').addEventListener('click',start);
  $('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'♫':'×';$('sound').title=soundOn?'Sound on':'Sound off'});
  function renderScores(){
    const list=$('scores');list.replaceChildren();
    const rows=[...localScores].sort((a,b)=>b.score-a.score||a.date-b.date).slice(0,5);
    if(!rows.length){const li=document.createElement('li');li.className='muted';li.textContent='No scores yet. Be the first!';list.append(li);return}
    rows.forEach((row,i)=>{const li=document.createElement('li');const a=document.createElement('span');const b=document.createElement('b');a.textContent=`${i+1}. ${row.name}`;b.textContent=`${row.score} filled`;li.append(a,b);list.append(li)});
  }
  $('save').addEventListener('click',()=>{
    if(state!=='over'||saved)return;
    playerName=$('player').value.trim().slice(0,24)||'Guest';
    localScores.push({name:playerName,score,date:Date.now()});
    localScores.sort((a,b)=>b.score-a.score||a.date-b.date);localScores=localScores.slice(0,20);
    saved=true;persistenceAndRefresh();
  });
  function persistenceAndRefresh(){persist();renderScores();$('save').disabled=true;$('save').textContent='SAVED ✓'}
  function resetSave(){ $('save').textContent='SAVE'; }
  $('start').addEventListener('click',resetSave);$('reset').addEventListener('click',resetSave);$('overlayRestart').addEventListener('click',resetSave);
  renderScores();paint();
})();
