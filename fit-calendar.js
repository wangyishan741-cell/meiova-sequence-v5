/* Localized birth-date calendar. The form continues to receive an ISO date. */
(() => {
 const input=document.getElementById('f_date_of_birth');if(!input)return;
 const today=new Date(),maxYear=today.getFullYear(),minYear=maxYear-120;
 let lang=document.documentElement.lang,year=maxYear-30,month=today.getMonth(),open=false;
 const wrapper=document.createElement('div');wrapper.className='date-control';input.before(wrapper);wrapper.append(input);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='date-calendar-toggle';toggle.setAttribute('aria-controls','birth-date-calendar');toggle.setAttribute('aria-expanded','false');
 toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M7 17h2"/></svg>';wrapper.append(toggle);
 const calendar=document.createElement('div');calendar.id='birth-date-calendar';calendar.className='date-calendar';calendar.hidden=true;calendar.setAttribute('role','group');wrapper.after(calendar);
 const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 const zh=()=>lang==='zh-CN';
 function selected(){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(input.value);if(!m)return null;const y=+m[1],mo=+m[2]-1,d=+m[3],date=new Date(y,mo,d);return date.getFullYear()===y&&date.getMonth()===mo&&date.getDate()===d?{y,m:mo,d}:null;}
 function setOpen(value){open=value;calendar.hidden=!value;toggle.setAttribute('aria-expanded',String(value));if(value){const s=selected();if(s){year=Math.min(maxYear,Math.max(minYear,s.y));month=s.m}render()}else toggle.focus({preventScroll:true});}
 function choose(d){input.value=iso(year,month,d);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));setOpen(false);}
 function moveMonth(delta){const d=new Date(year,month+delta,1);if(d.getFullYear()<minYear||d.getFullYear()>maxYear||d>new Date(maxYear,today.getMonth(),1))return;year=d.getFullYear();month=d.getMonth();render();}
 function render(){
  const locale=zh()?'zh-CN':'en-US';toggle.setAttribute('aria-label',zh()?'打开出生日期日历':'Open date of birth calendar');calendar.setAttribute('aria-label',zh()?'选择出生日期':'Choose date of birth');if(!open)return;
  const months=Array.from({length:12},(_,m)=>new Intl.DateTimeFormat(locale,{month:'long'}).format(new Date(2000,m,1)));
  calendar.innerHTML=`<div class="date-calendar-head"><button type="button" class="date-calendar-nav" data-month="-1" aria-label="${zh()?'上个月':'Previous month'}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5"/></svg></button><select class="date-calendar-month" aria-label="${zh()?'月份':'Month'}">${months.map((name,m)=>`<option value="${m}"${m===month?' selected':''}>${name}</option>`).join('')}</select><select class="date-calendar-year" aria-label="${zh()?'年份':'Year'}">${Array.from({length:maxYear-minYear+1},(_,i)=>maxYear-i).map(y=>`<option value="${y}"${y===year?' selected':''}>${y}${zh()?'年':''}</option>`).join('')}</select><button type="button" class="date-calendar-nav" data-month="1" aria-label="${zh()?'下个月':'Next month'}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg></button></div><div class="date-calendar-week" aria-hidden="true">${(zh()?['日','一','二','三','四','五','六']:['Su','Mo','Tu','We','Th','Fr','Sa']).map(d=>`<span>${d}</span>`).join('')}</div><div class="date-calendar-days" role="group" aria-label="${new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}).format(new Date(year,month,1))}"></div><div class="date-calendar-footer"><button type="button" data-clear>${zh()?'清除日期':'Clear date'}</button><button type="button" data-close>${zh()?'关闭日历':'Close calendar'}</button></div>`;
  const days=calendar.querySelector('.date-calendar-days'),first=new Date(year,month,1).getDay(),last=new Date(year,month+1,0).getDate();
  for(let i=0;i<first;i++)days.append(document.createElement('span'));
  for(let d=1;d<=last;d++){const date=new Date(year,month,d),key=iso(year,month,d),btn=document.createElement('button');btn.type='button';btn.className='date-calendar-day';btn.textContent=d;btn.dataset.day=d;btn.setAttribute('aria-label',new Intl.DateTimeFormat(locale,{dateStyle:'long'}).format(date));btn.setAttribute('aria-pressed',String(input.value===key));if(key===iso(maxYear,today.getMonth(),today.getDate()))btn.setAttribute('aria-current','date');btn.disabled=date>today;btn.addEventListener('click',()=>choose(d));days.append(btn);}
  calendar.querySelectorAll('[data-month]').forEach(b=>{const delta=+b.dataset.month;b.disabled=delta<0?year===minYear&&month===0:year===maxYear&&month>=today.getMonth();b.addEventListener('click',()=>moveMonth(delta))});
  calendar.querySelector('.date-calendar-month').addEventListener('change',e=>{month=+e.target.value;if(year===maxYear)month=Math.min(month,today.getMonth());render();calendar.querySelector(".date-calendar-month").focus()});
  calendar.querySelector('.date-calendar-year').addEventListener('change',e=>{year=+e.target.value;if(year===maxYear)month=Math.min(month,today.getMonth());render();calendar.querySelector(".date-calendar-year").focus()});
  calendar.querySelector('[data-clear]').addEventListener('click',()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));setOpen(false)});
  calendar.querySelector('[data-close]').addEventListener('click',()=>setOpen(false));
 }
 toggle.addEventListener('click',()=>setOpen(!open));
 calendar.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();setOpen(false);return}const day=e.target.closest('[data-day]');if(!day)return;const shifts={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(e.key in shifts))return;e.preventDefault();const target=new Date(year,month,+day.dataset.day+shifts[e.key]);if(target<new Date(minYear,0,1)||target>today)return;year=target.getFullYear();month=target.getMonth();render();calendar.querySelector(`[data-day="${target.getDate()}"]`)?.focus();});
 input.addEventListener('keydown',e=>{if(e.altKey&&e.key==='ArrowDown'){e.preventDefault();setOpen(true);calendar.querySelector('select')?.focus()}});
 new MutationObserver(()=>{const next=document.documentElement.lang;if(next!==lang){lang=next;render()}}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});render();
})();
