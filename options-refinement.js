(()=>{
const frame=document.getElementById('fit-frame');let pendingGoal=null;
const header=document.querySelector('.global-header');
function measureHeader(){const size=header.getBoundingClientRect().height;document.documentElement.style.setProperty('--site-header-height',size+'px');window.meiovaSequence?.refresh()}
measureHeader();new ResizeObserver(measureHeader).observe(header);
function applyGoal(){if(!pendingGoal)return;try{const input=[...frame.contentDocument.querySelectorAll('input')].find(x=>x.value===pendingGoal);if(!input)return;input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));pendingGoal=null}catch{}}
frame.addEventListener('load',applyGoal);
function goSection(id,instant=false){window.meiovaEntrance?.finish();if(window.meiovaAtlas?.probe().reading)window.meiovaAtlas.close(false);const target=document.getElementById(id);if(!target)return;if(id==='sms-information')target.open=true;history.pushState(null,'','#'+id);target.scrollIntoView({behavior:instant||matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
document.addEventListener('click',e=>{
 const goal=e.target.closest('[data-fit-goal]');
 if(goal){e.preventDefault();e.stopImmediatePropagation();const eggs=goal.dataset.fitGoal==='eggs';pendingGoal=eggs?'Freezing eggs':'Becoming pregnant now';window.meiovaEntrance?.finish();window.meiovaGuideNavigate('questionnaire',true);let notice=document.querySelector('.fit-goal-notice');if(!notice){notice=document.createElement('p');notice.className='fit-goal-notice';document.getElementById('fit-frame').before(notice);}notice.textContent=eggs?'Your starting point: egg freezing. You can change this in Your goals.':'Your starting point: becoming pregnant. You can change this in Your goals.';applyGoal();return;}
 const link=e.target.closest('a[href^="#"]');if(link&&['options','sms-information','medical-disclaimer'].includes(link.hash.slice(1))){e.preventDefault();e.stopImmediatePropagation();goSection(link.hash.slice(1));}
},true);
addEventListener('load',()=>{if(['options','sms-information','medical-disclaimer'].includes(location.hash.slice(1)))document.fonts.ready.then(()=>requestAnimationFrame(()=>goSection(location.hash.slice(1),true)));});
})();

