document.addEventListener('click',event=>{
 const link=event.target.closest('[data-care-detail]');if(!link)return;
 event.preventDefault();event.stopImmediatePropagation();
 window.meiovaGuideNavigate('planning',true);
 window.meiovaAtlas.read(2);
 requestAnimationFrame(()=>{
  const reader=document.querySelector('.atlas-reader');
  const section=document.getElementById('care-'+link.dataset.careDetail);
  if(!reader||!section)return;
  if(link.dataset.careDetail==='network')reader.scrollTop=section.getBoundingClientRect().top-reader.getBoundingClientRect().top+reader.scrollTop-130;
  else reader.scrollTop=0;
 });
},true);
