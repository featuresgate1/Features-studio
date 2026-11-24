
  (function(){
    'use strict';
    const board=document.getElementById('dotboard');
    // Keep just the centre interactive, so keyboard users don't tab through 49 controls.
    const systemNodes=new Set([17,23,25,31]);
    const echoNodes=new Set([8,12,36,40]);
    for(let i=0;board&&i<49;i++){
      const dot=document.createElement(i===24?'button':'span');
      dot.className='recognition-dot'+(i===24?' is-core':systemNodes.has(i)?' is-system':echoNodes.has(i)?' is-echo':'');
      dot.dataset.dot=String(i);
      if(i===24){dot.type='button';dot.id='recognition-core';dot.setAttribute('aria-label','Reveal the next stage of recognition');dot.setAttribute('aria-describedby','recognition-hint')}
      else dot.setAttribute('aria-hidden','true');
      board.appendChild(dot)
    }
    
    document.getElementById('year').textContent=new Date().getFullYear();
    const nav=document.getElementById('topbar'), menu=document.getElementById('menubtn'), links=document.getElementById('navlinks');
    const syncScroll=()=>nav.classList.toggle('scrolled',window.scrollY>30);
    window.addEventListener('scroll',syncScroll,{passive:true});syncScroll();
    menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}));
    const targets=document.querySelectorAll('.reveal');
    if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');obs.unobserve(entry.target)}})},{threshold:.10,rootMargin:'0px 0px -25px 0px'});targets.forEach(t=>obs.observe(t))}else{targets.forEach(t=>t.classList.add('is-visible'))}
    const form=document.getElementById('projectform'),feedback=document.getElementById('formfeedback');
    form?.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const message=`FEATURES STUDIO — PROJECT ENQUIRY\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nBrand: ${data.get('brand')||'Not specified'}\n\nWhat we want to become known for:\n${data.get('ambition')}`;
      try{await navigator.clipboard.writeText(message);feedback.textContent='Enquiry copied. No message has been sent.'}
      catch{feedback.textContent='Could not copy the enquiry. Nothing has been sent; your details remain on this page.'}
    });
  })();
  

  // All motion is a direct function of scroll progress: scrolling up reverses it.
  (function(){
    'use strict';
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
    const lerp=(a,b,t)=>a+(b-a)*t;
    const progress=(el,from=1,to=0)=>{if(!el)return 0;const r=el.getBoundingClientRect();return clamp((innerHeight*from-r.top)/(r.height+innerHeight*(from-to)))};
    const motionAllowed=()=>!reduce.matches;
    const root=document.documentElement;
    const meter=document.createElement('div');meter.className='scroll-meter';meter.setAttribute('aria-hidden','true');document.body.appendChild(meter);
    const up=document.createElement('a');up.className='up-indicator';up.href='#main';up.setAttribute('aria-label','Back to top');up.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';document.body.appendChild(up);
    const nav=document.getElementById('topbar'),menu=document.getElementById('navlinks');
    const hero=document.querySelector('.hero'),heroFrame=document.querySelector('.hero-frame');
    const fusionField=document.getElementById('fusion-field');
    const fusionOrbs=[...document.querySelectorAll('[data-fusion-orb]')];
    const fusionResult=document.getElementById('fusion-result');
    const fusionAura=document.getElementById('fusion-aura');
    const fusionFill=document.getElementById('fusion-fill');
    const easeMerge=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
    function renderFusion(p){
      if(!fusionField)return;
      const w=fusionField.clientWidth,h=fusionField.clientHeight;
      const gather=easeMerge(.06,.74,p);
      const approach=1-gather;
      const dissolve=easeMerge(.72,.92,p);
      const sharpen=easeMerge(.26,.84,p);
      const entries=[[-.40,-.16],[.40,-.23],[.04,.28]];
      fusionOrbs.forEach((el,i)=>{
        const [dx,dy]=entries[i];
        el.style.setProperty('--fx',(w*dx*approach).toFixed(2)+'px');
        el.style.setProperty('--fy',(h*dy*approach).toFixed(2)+'px');
        el.style.setProperty('--fs',(1-.12*(1-gather)).toFixed(4));
        el.style.setProperty('--fb',(Math.max(0,19*(1-sharpen))).toFixed(2)+'px');
        el.style.setProperty('--fo',((1-dissolve)*(1-gather*(i===2?.16:.10))).toFixed(3));
      });
      if(fusionResult){
        const fused=easeMerge(.65,.91,p);
        fusionResult.style.opacity=fused.toFixed(3);
        fusionResult.style.setProperty('--fs',(.80+.20*fused).toFixed(4));
        fusionResult.style.setProperty('--fb',((1-fused)*10).toFixed(2)+'px');
        fusionResult.style.setProperty('--shine-o',(.48*easeMerge(.85,.99,p)).toFixed(3));
      }
      if(fusionAura){fusionAura.style.setProperty('--aura-o',(.5*easeMerge(.60,.96,p)).toFixed(3));fusionAura.style.setProperty('--aura-scale',(.82+.28*gather).toFixed(3));}
      if(fusionFill)fusionFill.style.transform=`scaleX(${p.toFixed(3)})`;
    }

    // Keep the original fusion scene interactive without forcing homepage scrolling.
    const replay=document.getElementById('fusion-replay');
    if(replay&&fusionField){
      let current=0,frame=0;
      const play=()=>{
        if(frame)cancelAnimationFrame(frame);
        if(reduce.matches){current=1;renderFusion(1);return;}
        const from=current>.95?0:current,start=performance.now(),duration=1500;
        const tick=now=>{const t=clamp((now-start)/duration);current=from+(1-from)*easeMerge(0,1,t);renderFusion(current);if(t<1)frame=requestAnimationFrame(tick);else{frame=0;replay.querySelector('span').textContent='Replay the idea';}};
        frame=requestAnimationFrame(tick);
      };
      renderFusion(reduce.matches?1:.18);
      current=reduce.matches?1:.18;
      replay.addEventListener('click',play);
      addEventListener('resize',()=>renderFusion(current),{passive:true});
      reduce.addEventListener?.('change',()=>{if(reduce.matches){if(frame)cancelAnimationFrame(frame);frame=0;current=1;renderFusion(1);}});
    }
    const ticker=document.querySelector('.ticker'),track=document.querySelector('.ticker-track');
    const story=document.getElementById('reveal-story'),panels=[...document.querySelectorAll('.story-panel')],rings=[...document.querySelectorAll('.story-ring')],sparks=[...document.querySelectorAll('.story-spark')],stepText=document.getElementById('story-current'),bar=document.getElementById('story-progress-fill');
    const method=document.querySelector('.method'),stages=document.querySelector('.stages'),steps=[...document.querySelectorAll('.stage')];
    const manifesto=document.querySelector('.manifesto');
    const workImgs=[...document.querySelectorAll('.work-card .feature-thumb img')];
    const recognition=document.querySelector('.idea-recognition');
    const recSteps=[...document.querySelectorAll('[data-recognition-step]')];
    const recCore=document.getElementById('recognition-core');
    const recNum=document.getElementById('recognition-number');
    const recName=document.getElementById('recognition-name');
    const recTitle=document.getElementById('recognition-title');
    const recDescription=document.getElementById('recognition-description');
    const recVisualLabel=document.getElementById('recognition-visual-label');
    const recStages=[
      {name:'SIMILARITY',title:'When everything looks alike, nothing stays.',description:'At first, every mark blends into the same pattern.',visual:'49 familiar shapes. Nothing to remember.'},
      {name:'DISTINCTION',title:'The difference becomes visible.',description:'One defining feature changes what the eye notices.',visual:'One feature breaks through the sameness.'},
      {name:'SYSTEM',title:'A feature becomes an identity.',description:'Bring the right elements together, and distinction gains a form.',visual:'A connected visual language begins to form.'},
      {name:'RECOGNITION',title:'Seen again. Known instantly.',description:'Consistency turns distinctiveness into something people remember.',visual:'A pattern that remains unmistakably yours.'}
    ];
    let lastScroll=window.scrollY,raf=0,lastStep=-1,lastRecStage=-1;
    // Curve provides a gentle crossfade into/out of each scroll chapter.
    function smoothstep(a,b,x){const t=clamp((x-a)/(b-a));return t*t*(3-2*t)}
    function chapterOpacity(p,i){const first=smoothstep(.28,.38,p),second=smoothstep(.62,.72,p);return i===0?1-first:i===1?first*(1-second):second}
    function recognitionProgress(){
      if(!recognition)return 0;
      const r=recognition.getBoundingClientRect();
      return clamp(-r.top/Math.max(1,r.height-innerHeight));
    }
    function renderRecognition(p){
      if(!recognition)return;
      const stage=Math.min(3,Math.floor(Math.min(.99999,p)*4));
      if(stage!==lastRecStage){
        const chapter=recStages[stage];
        recognition.dataset.stage=String(stage);
        recNum.textContent=String(stage+1).padStart(2,'0');
        recName.textContent=chapter.name;recTitle.textContent=chapter.title;
        recDescription.textContent=chapter.description;recVisualLabel.textContent=chapter.visual;
        recSteps.forEach((button,i)=>{button.classList.toggle('is-active',i===stage);button.setAttribute('aria-pressed',String(i===stage))});
        if(recCore)recCore.setAttribute('aria-label',stage===3?'Return to similarity and replay recognition':'Reveal the next stage: '+recStages[stage+1].name.toLowerCase());
        lastRecStage=stage;
      }
      recognition.style.setProperty('--difference-progress',String(smoothstep(.12,.38,p).toFixed(3)));
      recognition.style.setProperty('--system-progress',String(smoothstep(.40,.67,p).toFixed(3)));
      recognition.style.setProperty('--echo-progress',String(smoothstep(.69,.97,p).toFixed(3)));
    }

    const storySceneEls=[...document.querySelectorAll('.story-scene')];
    const findScan=document.getElementById('story-scan');
    const foundLabel=document.getElementById('story-found-label');
    const shapeInputs=[...document.querySelectorAll('.shape-input')];
    const shapeConnectors=document.getElementById('story-shape-connectors');
    const shapeBoard=document.getElementById('story-shape-board');
    const applications=[...document.querySelectorAll('.story-application')];
    const sceneNote=document.getElementById('story-geometry-note');
    const visualNames=['DISCOVER THE DEFINING FEATURES','TURN THEM INTO ONE SYSTEM','MAKE IT RECOGNISABLE EVERYWHERE'];
    let lastVisualStage=-1;
    function renderStoryScenes(p){
      if(!storySceneEls.length)return;
      const fade1=smoothstep(.28,.38,p),fade2=smoothstep(.62,.72,p);
      const visibles=[1-fade1,fade1*(1-fade2),fade2];
      storySceneEls.forEach((el,i)=>{
        const opacity=visibles[i];
        el.style.opacity=opacity.toFixed(3);
        el.style.transform=`translateY(${((1-opacity)*20).toFixed(1)}px) scale(${(.975+opacity*.025).toFixed(4)})`;
        el.style.visibility=opacity<.005?'hidden':'visible';
      });
      // FIND: a carefully placed focus selects a distinctive cue from the research field.
      const scan=smoothstep(.015,.27,p);
      findScan?.setAttribute('transform',`translate(${(79+244*scan).toFixed(1)} ${(133+224*scan/2).toFixed(1)})`);
      if(foundLabel)foundLabel.style.opacity=smoothstep(.11,.25,p).toFixed(3);
      // SHAPE: three insights are brought into a coherent design decision.
      const combine=smoothstep(.38,.59,p);
      shapeInputs.forEach((el,i)=>{el.style.translate=`${(8+combine*([0,9,-4][i])).toFixed(1)}px ${((1-combine)*([14,-10,19][i])).toFixed(1)}px`;el.style.opacity=(.48+.52*combine).toFixed(3)});
      if(shapeConnectors)shapeConnectors.style.opacity=(.25+.75*combine).toFixed(3);
      if(shapeBoard)shapeBoard.style.transform=`translateX(${((1-combine)*30).toFixed(1)}px)`;
      // RECOGNISE: one consistent identity appears across multiple touchpoints.
      applications.forEach((el,i)=>{
        const reveal=smoothstep(.62+i*.075,.70+i*.075,p);
        el.style.opacity=reveal.toFixed(3);
        // Preserve the card's SVG-space translate, and apply a second, nested CSS translate.
        el.style.translate=`0px ${((1-reveal)*42).toFixed(1)}px`;
      });
      const visualStage=p<1/3?0:p<2/3?1:2;
      if(visualStage!==lastVisualStage){if(sceneNote)sceneNote.textContent=visualNames[visualStage];lastVisualStage=visualStage;}
    }
    function moveToRecognitionStage(stage){
      if(!recognition)return;
      if(!motionAllowed()){renderRecognition([0,.35,.62,.98][stage]);return}
      const r=recognition.getBoundingClientRect();
      const top=window.scrollY+r.top;
      const available=Math.max(1,r.height-innerHeight);
      const targets=[.015,.38,.64,.95];
      // Synchronize navigation with the true scroll position so the story reverses naturally.
      window.scrollTo({top:top+available*targets[stage],behavior:'smooth'});
    }
    recSteps.forEach(button=>button.addEventListener('click',()=>moveToRecognitionStage(Number(button.dataset.recognitionStep))));
    recCore?.addEventListener('click',()=>moveToRecognitionStage((Math.max(0,lastRecStage)+1)%4));
    if(reduce.matches){renderRecognition(.99)}
    function update(){raf=0;const y=window.scrollY;const maxScroll=Math.max(1,root.scrollHeight-innerHeight);meter.style.transform=`scaleX(${clamp(y/maxScroll)})`;
      up.classList.toggle('is-visible',y>innerHeight*1.2);
      const dy=y-lastScroll;
      if(nav && Math.abs(dy)>4 && y>170 && !(menu&&menu.classList.contains('open'))){if(dy>0)nav.classList.add('nav-hidden');else nav.classList.remove('nav-hidden')}
      if(y<=170)nav?.classList.remove('nav-hidden');lastScroll=y;
      if(!motionAllowed()){
        nav?.classList.remove('nav-hidden');
        if(panels.length){panels.forEach(p=>p.removeAttribute('aria-hidden'))}
        if(lastRecStage===-1)renderRecognition(.99);
        return;
      }
      if(recognition){const rr=recognition.getBoundingClientRect();if(rr.bottom>0 && rr.top<innerHeight){renderRecognition(recognitionProgress())}}
      if(hero){const r=hero.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const stickyTop=parseFloat(getComputedStyle(heroFrame).top)||0;const p=clamp((stickyTop-r.top)/Math.max(1,r.height-(heroFrame?.clientHeight||innerHeight)));renderFusion(p)}}
      if(ticker&&track){const r=ticker.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=progress(ticker);track.style.setProperty('--ticker-offset',`${(-p*250).toFixed(1)}px`)}}
      if(story){const r=story.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const available=Math.max(1,r.height-innerHeight);const p=clamp(-r.top/available);
          bar.style.transform=`scaleX(${p})`;
          const next=p<1/3?0:p<2/3?1:2;
          if(next!==lastStep){stepText.textContent=String(next+1).padStart(2,'0');panels.forEach((panel,i)=>{panel.classList.toggle('is-current',i===next);panel.setAttribute('aria-hidden',String(i!==next))});lastStep=next}
          panels.forEach((panel,i)=>{const o=chapterOpacity(p,i);panel.style.opacity=String(o);panel.style.transform=`translate3d(0,calc(-50% + ${(1-o)*24}px),0)`});
          renderStoryScenes(p);
      }}
      if(method && stages){const r=stages.getBoundingClientRect();if(r.bottom>0 && r.top<innerHeight){const p=clamp((innerHeight*.62-r.top)/(r.height+innerHeight*.22));stages.style.setProperty('--method-progress',String(p));steps.forEach((s,i)=>s.classList.toggle('method-active',p>i/5 && p<(i+1.2)/5))}}
      if(manifesto){const r=manifesto.getBoundingClientRect();if(r.bottom>0 && r.top<innerHeight){const p=progress(manifesto,.85,.18);manifesto.style.setProperty('--manifesto-progress',String(p));manifesto.style.setProperty('--manifesto-shift',`${((.5-p)*20).toFixed(1)}px`)}}
      for(const img of workImgs){const thumb=img.closest('.feature-thumb');const r=thumb.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const p=clamp((innerHeight-r.top)/(innerHeight+r.height));img.style.setProperty('--project-shift',`${((p-.5)*36).toFixed(1)}px`)}}
    }
    const request=()=>{if(!raf)raf=requestAnimationFrame(update)};
    addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
    reduce.addEventListener?.('change',()=>{if(reduce.matches){renderRecognition(.99)}else{lastRecStage=-1}request()});
    up.addEventListener('click',()=>nav?.classList.remove('nav-hidden'));
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>nav?.classList.remove('nav-hidden')));
    request();
  })();
  