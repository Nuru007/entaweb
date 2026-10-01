'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width: 900px)');
const header=$('.header'),menu=$('.menu-toggle'),motionSwitch=$('.motion-switch'),story=$('.story-v3'),arts=$$('[data-art]'),steps=$$('[data-story]');
let motionEnabled=!reduced.matches,storyMotion=false,activeStory=0,storyVisible=false,lastStoryInteraction=0;

/* Smooth lerp & scroll-driven engine variables */
let targetY=window.scrollY,smoothY=window.scrollY,rafId=null,isLoopRunning=false;

function chooseStory(index,progress=0){
 activeStory=index;
 steps.forEach((button,i)=>{
  button.classList.toggle('active',i===index);
  button.setAttribute('aria-expanded',String(i===index));
  button.style.setProperty('--step-progress',i===index?Math.min(100,Math.max(5,progress*100))+'%':'0%');
 });
 arts.forEach((art,i)=>{
  art.classList.toggle('active',i===index);
  art.setAttribute('aria-hidden',String(i!==index));
  art.inert=i!==index;
 });
 $$('.story-dots i').forEach((el,i)=>el.classList.toggle('active',i===index));
 const counter=$('.story-index');
 if(counter)counter.textContent=String(index+1).padStart(2,'0')+' / 04';
}

function updateScrollDriven(){
 const sy=motionEnabled?smoothY:targetY;
 header.classList.toggle('scrolled',sy>75);

 if(motionEnabled){
  // 1. Hero depth parallax scrub
  const hero=$('.hero');
  if(hero){
   const hRect=hero.getBoundingClientRect();
   if(hRect.bottom>0){
    const hDist=Math.max(0,sy);
    hero.style.setProperty('--hero-shift',Math.min(40,hDist*0.07)+'px');
    hero.style.setProperty('--p-sales',(-hDist*0.22).toFixed(2)+'px');
    hero.style.setProperty('--p-tiers',(-hDist*0.32).toFixed(2)+'px');
    hero.style.setProperty('--p-price',(-hDist*0.14).toFixed(2)+'px');
    hero.style.setProperty('--p-qr',(-hDist*0.25).toFixed(2)+'px');
    hero.style.setProperty('--p-device',(hDist*0.16).toFixed(2)+'px');
    hero.style.setProperty('--p-scale',(1-Math.min(0.04,hDist*0.00005)).toFixed(3));
    hero.style.setProperty('--p-rot-sales',(hDist*0.007).toFixed(2)+'deg');
    hero.style.setProperty('--p-rot-tiers',(-hDist*0.005).toFixed(2)+'deg');
   }
  }

  // 2. Sheet section transition & fanning scrub
  const benefits=$('.benefits-v3');
  if(benefits){
   const bRect=benefits.getBoundingClientRect();
   if(bRect.top<window.innerHeight&&bRect.bottom>0){
    const bProg=Math.max(0,Math.min(1,(window.innerHeight-bRect.top)/(window.innerHeight*0.8)));
    const stack=$('.benefits-stack')||benefits;
    stack.style.setProperty('--sheet-back-shift',((-1+bProg)*12).toFixed(1)+'px');
    stack.style.setProperty('--sheet-front-shift',((-1+bProg)*6).toFixed(1)+'px');
   }
  }

  // 3. Manifesto subtle floating parallax
  const manifesto=$('.manifesto-v3');
  if(manifesto){
   const mRect=manifesto.getBoundingClientRect();
   if(mRect.top<window.innerHeight&&mRect.bottom>0){
    const mCenter=(mRect.top+mRect.height/2-window.innerHeight/2)/(window.innerHeight/2);
    manifesto.style.setProperty('--p-mf1',(-mCenter*26).toFixed(1)+'px');
    manifesto.style.setProperty('--p-mf2',(mCenter*22).toFixed(1)+'px');
    manifesto.style.setProperty('--p-mf3',(-mCenter*30).toFixed(1)+'px');
    manifesto.style.setProperty('--p-mf4',(mCenter*18).toFixed(1)+'px');
   }
  }

  // 4. Interactive console perspective tilt & badge parallax
  const consoleEl=$('.console');
  if(consoleEl){
   const cRect=consoleEl.getBoundingClientRect();
   if(cRect.top<window.innerHeight&&cRect.bottom>0){
    const cNorm=Math.max(-1,Math.min(1,(cRect.top-window.innerHeight*0.25)/(window.innerHeight*0.75)));
    consoleEl.style.setProperty('--dashboard-tilt',(cNorm*3.8).toFixed(2)+'deg');
    const surround=$('.dash-surround');
    if(surround){
     surround.style.setProperty('--p-ds1',(-cNorm*22).toFixed(1)+'px');
     surround.style.setProperty('--p-ds2',(cNorm*18).toFixed(1)+'px');
    }
   }
  }

  // 5. Event posters horizontal marquee scrub
  const world=$('.event-world');
  if(world){
   const wRect=world.getBoundingClientRect();
   if(wRect.bottom>0&&wRect.top<window.innerHeight){
    const wProg=Math.max(0,Math.min(1,(window.innerHeight-wRect.top)/(window.innerHeight+wRect.height)));
    const posters=$('.event-posters');
    if(posters)posters.style.setProperty('--poster-shift',(wProg*320).toFixed(1)+'px');
   }
  }
 }

 // 6. Pinned storytelling section progression
 if(storyMotion&&story){
  const sRect=story.getBoundingClientRect();
  const range=story.offsetHeight-window.innerHeight;
  if(range>0){
   const sProgress=Math.max(0,Math.min(3.999,-sRect.top/range*4));
   chooseStory(Math.floor(sProgress),sProgress%1);
  }
 }
}

function engineLoop(){
 const diff=targetY-smoothY;
 if(Math.abs(diff)>0.25&&motionEnabled){
  smoothY+=diff*0.13;
  updateScrollDriven();
  rafId=requestAnimationFrame(engineLoop);
 }else{
  smoothY=targetY;
  updateScrollDriven();
  isLoopRunning=false;
 }
}

function onScroll(){
 targetY=window.scrollY;
 if(!isLoopRunning){
  isLoopRunning=true;
  rafId=requestAnimationFrame(engineLoop);
 }
}

function applyMotion(){
 document.body.classList.toggle('no-motion',!motionEnabled);
 document.body.classList.toggle('js-motion',motionEnabled);
 motionSwitch.textContent=motionEnabled?'Motion on':'Motion off';
 motionSwitch.setAttribute('aria-pressed',String(motionEnabled));
 document.documentElement.style.scrollBehavior=motionEnabled?'smooth':'auto';
 storyMotion=motionEnabled&&wide.matches;
 document.body.classList.toggle('has-story-motion',storyMotion);

 if(!motionEnabled){
  const hero=$('.hero');
  if(hero){
   hero.style.setProperty('--hero-shift','0px');
   hero.style.setProperty('--p-sales','0px');
   hero.style.setProperty('--p-tiers','0px');
   hero.style.setProperty('--p-price','0px');
   hero.style.setProperty('--p-qr','0px');
   hero.style.setProperty('--p-device','0px');
   hero.style.setProperty('--p-scale','1');
   hero.style.setProperty('--p-rot-sales','0deg');
   hero.style.setProperty('--p-rot-tiers','0deg');
  }
  const stack=$('.benefits-stack')||$('.benefits-v3');
  if(stack){
   stack.style.setProperty('--sheet-back-shift','0px');
   stack.style.setProperty('--sheet-front-shift','0px');
  }
  const consoleEl=$('.console');
  if(consoleEl)consoleEl.style.setProperty('--dashboard-tilt','0deg');
  const posters=$('.event-posters');
  if(posters)posters.style.setProperty('--poster-shift','0px');
 }
 targetY=window.scrollY;
 smoothY=targetY;
 updateScrollDriven();
}

applyMotion();
reduced.addEventListener('change',e=>{motionEnabled=!e.matches;applyMotion()});
wide.addEventListener('change',applyMotion);
motionSwitch.addEventListener('click',()=>{motionEnabled=!motionEnabled;applyMotion()});
window.addEventListener('scroll',onScroll,{passive:true});
window.addEventListener('resize',()=>{targetY=window.scrollY;smoothY=targetY;applyMotion()},{passive:true});
document.fonts.ready.then(()=>{targetY=window.scrollY;smoothY=targetY;updateScrollDriven()});

/* Smooth anchor link navigation with sticky header offset */
document.addEventListener('click',e=>{
 const anchor=e.target.closest('a[href^="#"]');
 if(!anchor)return;
 const hash=anchor.getAttribute('href');
 if(hash==='#'||!hash.startsWith('#'))return;
 const targetEl=$(hash);
 if(targetEl){
  e.preventDefault();
  closeMenu();
  const topPos=targetEl.getBoundingClientRect().top+window.scrollY-72;
  window.scrollTo({top:Math.max(0,topPos),behavior:motionEnabled?'smooth':'auto'});
  history.pushState(null,null,hash);
 }
});

/* Masked and Staggered Reveal Observer */
const revealObserver=new IntersectionObserver(entries=>{
 entries.forEach(e=>{
  if(e.isIntersecting){
   e.target.classList.add('shown');
   revealObserver.unobserve(e.target);
  }
 });
},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
$$('.reveal, .reveal-mask').forEach(el=>revealObserver.observe(el));

/* Story Visibility & Auto-rotation fallback */
const storyObserver=new IntersectionObserver(entries=>{
 storyVisible=entries.some(e=>e.isIntersecting);
},{threshold:0.25});
if($('.story-layout'))storyObserver.observe($('.story-layout'));

setInterval(()=>{
 if(!storyMotion&&motionEnabled&&storyVisible&&!document.hidden&&Date.now()-lastStoryInteraction>15000&&!$('.story-layout')?.contains(document.activeElement)){
  chooseStory((activeStory+1)%4);
 }
},6500);

steps.forEach(button=>button.addEventListener('click',()=>{
 lastStoryInteraction=Date.now();
 const index=Number(button.dataset.story);
 chooseStory(index,0.1);
 if(storyMotion&&story){
  const start=story.getBoundingClientRect().top+window.scrollY;
  const targetScroll=start+(index+0.12)/4*(story.offsetHeight-window.innerHeight);
  window.scrollTo({top:targetScroll,behavior:motionEnabled?'smooth':'auto'});
 }
}));

/* Mobile navigation menu */
function closeMenu(){
 menu.setAttribute('aria-expanded','false');
 menu.setAttribute('aria-label','Open navigation');
 menu.textContent='Menu';
 $('.nav-links').classList.remove('open');
}
menu.addEventListener('click',()=>{
 const open=menu.getAttribute('aria-expanded')!=='true';
 menu.setAttribute('aria-expanded',String(open));
 menu.textContent=open?'Close':'Menu';
 menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');
 $('.nav-links').classList.toggle('open',open);
});
$$('.nav-links a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus()}});

/* Section Highlight Observer */
const sectionObserver=new IntersectionObserver(entries=>{
 entries.forEach(e=>{
  if(e.isIntersecting){
   $$('.nav-links a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));
  }
 });
},{rootMargin:'-25% 0px -55% 0px',threshold:0});
$$('#home,#features,#how-it-works,#pricing').forEach(el=>sectionObserver.observe(el));

/* Interactive Dashboard & Analytics State */
const events={
 afterhours:{name:'After Hours',cover:'concert',capacity:500,tiers:[{name:'Regular',price:5000,sold:260,capacity:350},{name:'VIP',price:15000,sold:45,capacity:100},{name:'VVIP',price:30000,sold:15,capacity:50}],bars30:[34,42,28,60,48,45,63],bars7:[16,21,14,24,18,23,30]},
 art:{name:'Art After Dark',cover:'culture',capacity:200,tiers:[{name:'Regular',price:3000,sold:94,capacity:140},{name:'VIP',price:8000,sold:26,capacity:40},{name:'VVIP',price:15000,sold:8,capacity:20}],bars30:[13,17,9,25,16,20,28],bars7:[5,9,4,8,12,7,15]}
};
const guests=[{name:'Ada O.',tier:'VIP',seat:'A01'},{name:'Tunde K.',tier:'Regular',seat:'C14'},{name:'Zainab B.',tier:'VVIP',seat:'V03'},{name:'Emeka N.',tier:'Regular',seat:'C22'},{name:'Kemi A.',tier:'VIP',seat:'A06'},{name:'Femi D.',tier:'Regular',seat:'C08'}];
let eventKey='afterhours',range=30,dashView='overview';
const naira=n=>'₦'+n.toLocaleString('en-NG'),compactNaira=n=>n>=1000000?'₦'+(n/1000000).toFixed(2)+'m':'₦'+Math.round(n/1000)+'k';

function renderGuests(){
 const query=$('#guest-search').value.trim().toLowerCase();
 const selected=guests.filter(g=>(g.name+' '+g.tier+' '+g.seat).toLowerCase().includes(query));
 $('#guest-list').replaceChildren();
 if(!selected.length){
  const empty=document.createElement('p');
  empty.className='no-guests';
  empty.textContent='No guests match your search.';
  $('#guest-list').append(empty);
  return;
 }
 selected.forEach(g=>{
  const row=document.createElement('div');
  row.className='guest-row';
  for(const [tag,text] of [['i',g.name.split(' ').map(x=>x[0]).join('')],['span',g.name],['small',g.tier],['b',g.seat]]){
   const el=document.createElement(tag);
   el.textContent=text;
   row.append(el);
  }
  $('#guest-list').append(row);
 });
}

function renderDashboard(){
 const event=events[eventKey],allSold=event.tiers.reduce((s,t)=>s+t.sold,0),allRevenue=event.tiers.reduce((s,t)=>s+t.sold*t.price,0),bars=event['bars'+range],periodSold=bars.reduce((s,n)=>s+n,0);
 $('#sidebar-event-name').textContent=event.name;
 $('#dash-cover').src='/assets/'+event.cover+'.webp';
 $('#dash-sold').textContent=periodSold;
 $('#dash-revenue').textContent=compactNaira(Math.round(allRevenue*periodSold/allSold));
 $('#dash-remaining').textContent=event.capacity-allSold;
 $('#donut-total').textContent=allSold;
 const regular=event.tiers[0].sold/allSold*100,vip=event.tiers[1].sold/allSold*100;
 $('.dash-donut').style.background=`conic-gradient(#754cff 0 ${regular}%,#4cddec ${regular}% ${regular+vip}%,#ff9b76 ${regular+vip}%)`;
 ['regular','vip','vvip'].forEach((name,i)=>$('#legend-'+name).textContent=event.tiers[i].sold);
 $('#chart-period').textContent='Last '+range+' days';
 $('#chart-annotation').textContent='Select a bar to explore';
 const max=range===30?(eventKey==='afterhours'?80:40):40;
 $$('.chart-grid>span').forEach((el,i)=>{el.firstChild.textContent=String(max-i*max/4)});
 $$('.sales-bar').forEach((button,i)=>{
  button.style.setProperty('--value',bars[i]/max*100+'%');
  button.setAttribute('aria-label',(range===7?['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]:'Period '+(i+1))+': '+bars[i]+' tickets');
  $('.bar-tip',button).textContent=bars[i];
  $('small',button).textContent=range===7?['M','T','W','T','F','S','S'][i]:['01','05','10','15','20','25','30'][i];
  button.classList.remove('picked');
 });
 $$('[data-range]').forEach(button=>{
  const active=Number(button.dataset.range)===range;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 $('#ticket-table-rows').innerHTML=event.tiers.map(t=>`<div class="tt-row"><span><i></i>${t.name}</span><span>${naira(t.price)}</span><span>${t.sold} / ${t.capacity}<progress value="${t.sold}" max="${t.capacity}" aria-label="${t.name} tickets sold"></progress></span></div>`).join('');
 const rows=$$('.dash-activity>div');
 $('span:nth-child(3)',rows[0]).textContent=naira(event.tiers[1].price);
 $('span:nth-child(3)',rows[1]).textContent=naira(event.tiers[0].price);
}

$$('[data-dash-view]').forEach(button=>button.addEventListener('click',()=>{
 dashView=button.dataset.dashView;
 $$('[data-dash-view]').forEach(b=>{
  const active=b===button;
  b.classList.toggle('active',active);
  b.setAttribute('aria-pressed',String(active));
 });
 $$('.console-view').forEach(v=>v.hidden=v.id!=='view-'+dashView);
 $('#dash-view-title').textContent={overview:'Event overview',tickets:'Your ticket tiers',guests:'Your guests'}[dashView];
 $('.range-control').hidden=dashView!=='overview';
}));

$$('[data-range]').forEach(button=>button.addEventListener('click',()=>{
 range=Number(button.dataset.range);
 renderDashboard();
}));
$('#dash-event').addEventListener('change',e=>{
 eventKey=e.target.value;
 renderDashboard();
});
$('#guest-search').addEventListener('input',renderGuests);
$$('[data-bar]').forEach(button=>button.addEventListener('click',()=>{
 $$('.sales-bar').forEach(b=>b.classList.toggle('picked',b===button));
 $('#chart-annotation').textContent=button.getAttribute('aria-label');
}));
$$('[data-tier]').forEach(button=>button.addEventListener('click',()=>{
 lastStoryInteraction=Date.now();
 $$('[data-tier]').forEach(b=>{
  b.classList.toggle('selected',b===button);
  b.setAttribute('aria-pressed',String(b===button));
 });
 const tier=button.dataset.tier,detail={Regular:['₦5,000','General admission'],VIP:['₦15,000','Front-row access'],VVIP:['₦30,000','The full experience']}[tier];
 $('#tier-demo-price').firstChild.textContent=detail[0];
 $('#tier-demo-price span').textContent=detail[1];
}));

renderDashboard();
renderGuests();
chooseStory(0);

/* Event Creation Modal & Local Storage Draft */
const dialog=$('#create-dialog'),form=$('#event-form'),preview=$('#draft-preview');
let draft={},lastTrigger=null;

try{
 const saved=JSON.parse(localStorage.getItem('enta-event-draft')||'{}');
 if(saved&&typeof saved==='object'){
  draft=saved;
  for(const k of ['name','date','time','location','description']){
   if(typeof saved[k]==='string')form.elements[k].value=saved[k];
  }
 }
}catch{}

function openCreator(trigger){
 closeMenu();
 lastTrigger=trigger;
 if($('#inline-name').value.trim())form.elements.name.value=$('#inline-name').value.trim();
 form.hidden=false;
 preview.hidden=true;
 $('.dialog-heading').hidden=false;
 document.body.classList.add('modal-open');
 dialog.showModal();
 setTimeout(()=>form.elements.name.focus(),50);
}

$$('[data-create]').forEach(el=>el.addEventListener('click',()=>openCreator(el)));
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{
 if(e.target===dialog){
  const r=dialog.getBoundingClientRect();
  if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
 }
});
dialog.addEventListener('close',()=>{
 document.body.classList.remove('modal-open');
 lastTrigger?.focus();
});

form.addEventListener('submit',e=>{
 e.preventDefault();
 if(!form.reportValidity())return;
 draft=Object.fromEntries(new FormData(form));
 for(const k of Object.keys(draft))draft[k]=draft[k].trim();
 if(!draft.name||!draft.location||!draft.description){
  toast('Please add your event details.');
  return;
 }
 let savedHere=false;
 try{
  localStorage.setItem('enta-event-draft',JSON.stringify(draft));
  savedHere=true;
 }catch{}
 $('#draft-preview .draft-note').textContent=savedHere?'Your draft is saved on this device. This preview does not publish an event or sell tickets.':'Download your draft to keep it. This preview does not publish an event or sell tickets.';
 $('#draft-title').textContent=draft.name;
 const d=new Date(draft.date+'T'+draft.time);
 $('#draft-when').textContent=Number.isNaN(d.getTime())?draft.date:d.toLocaleString(undefined,{dateStyle:'full',timeStyle:'short'});
 $('#draft-location').textContent=draft.location;
 $('#draft-description').textContent=draft.description;
 form.hidden=true;
 preview.hidden=false;
 $('.dialog-heading').hidden=true;
 dialog.scrollTop=0;
 $('#download-draft').focus();
});

$('#edit-draft').addEventListener('click',()=>{
 form.hidden=false;
 preview.hidden=true;
 $('.dialog-heading').hidden=false;
 form.elements.name.focus();
});

$('#download-draft').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({brand:'Enta',status:'draft',...draft},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;
 a.download='enta-event-draft.json';
 a.click();
 setTimeout(()=>URL.revokeObjectURL(url),500);
 toast('Your event draft is ready to keep.');
});

let toastTimer;
function toast(message){
 clearTimeout(toastTimer);
 $('#toast').textContent=message;
 $('#toast').classList.add('visible');
 toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);
}

/* Moments image swapper: swipe up every 3 seconds */
(function initMomentsSwapper(){
 const slides = $$('.iw-slide');
 if(slides.length < 2) return;
 let current = 0;
 setInterval(()=>{
  const next = (current + 1) % slides.length;
  const curSlide = slides[current];
  const nextSlide = slides[next];

  nextSlide.classList.add('no-trans');
  nextSlide.classList.remove('active', 'prev');
  void nextSlide.offsetWidth;
  nextSlide.classList.remove('no-trans');

  curSlide.classList.remove('active');
  curSlide.classList.add('prev');
  nextSlide.classList.add('active');

  setTimeout(()=>{
   curSlide.classList.add('no-trans');
   curSlide.classList.remove('prev');
   void curSlide.offsetWidth;
   curSlide.classList.remove('no-trans');
  }, 750);

  current = next;
 }, 3000);
})();

/* Mobile navigation & touch gesture enhancements */
(function initMobileEnhancements(){
 const header = $('.header');
 const menu = $('.menu-toggle');
 const nav = header ? $('.nav-links', header) : null;
 if (menu && nav) {
  menu.addEventListener('click', (e) => {
   e.stopPropagation();
   const isOpen = nav.classList.toggle('open');
   header.classList.toggle('nav-open', isOpen);
   menu.setAttribute('aria-expanded', String(isOpen));
  });
  $$('a', nav).forEach(link => {
   link.addEventListener('click', () => {
    nav.classList.remove('open');
    header.classList.remove('nav-open');
    menu.setAttribute('aria-expanded', 'false');
   });
  });
  document.addEventListener('click', (e) => {
   if (!header.contains(e.target) && nav.classList.contains('open')) {
    nav.classList.remove('open');
    header.classList.remove('nav-open');
    menu.setAttribute('aria-expanded', 'false');
   }
  });
 }

 /* Touch swipe for storytelling visual card */
 const visual = $('.story-visual');
 if (visual) {
  let touchStartX = 0, touchStartY = 0;
  visual.addEventListener('touchstart', (e) => {
   touchStartX = e.touches[0].clientX;
   touchStartY = e.touches[0].clientY;
  }, { passive: true });
  visual.addEventListener('touchend', (e) => {
   const diffX = e.changedTouches[0].clientX - touchStartX;
   const diffY = e.changedTouches[0].clientY - touchStartY;
   if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < 0) {
     chooseStory((activeStory + 1) % steps.length);
    } else {
     chooseStory((activeStory - 1 + steps.length) % steps.length);
    }
   }
  }, { passive: true });
 }

 /* Clickable story pagination dots */
 $$('.story-dots i').forEach((dot, i) => {
  dot.style.cursor = 'pointer';
  dot.setAttribute('role', 'button');
  dot.setAttribute('aria-label', 'Go to story ' + (i + 1));
  dot.addEventListener('click', () => chooseStory(i));
 });
})();
