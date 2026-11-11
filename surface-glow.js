/* Share the gallery's pointer light without its tilt, zoom or colour reveal. */
(() => {
  'use strict';
  const selector = '#home, .launch-event, .options-pair > article, .care-curve, .pathway-comparison, .atlas-reader-figure, .care-details > article';
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  function init(){
    const glow = document.createElement('div');
    glow.className = 'surface-pointer-glow';
    glow.setAttribute('aria-hidden','true');
    document.body.append(glow);
    let active=null, frame=0, pending=null;
    function clear(){
      active=null;pending=null;
      if(frame)cancelAnimationFrame(frame);
      frame=0;glow.dataset.visible='false';
    }
    function paint(){
      frame=0;
      if(!pending)return;
      const {surface,x,y}=pending;
      if(!surface.isConnected||surface.closest('[hidden]')){clear();return}
      const box=surface.getBoundingClientRect(),style=getComputedStyle(surface);
      if(box.width<=0||box.height<=0||style.visibility==='hidden'){clear();return}
      active=surface;
      Object.assign(glow.style,{left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',borderRadius:style.borderRadius});
      glow.style.setProperty('--glow-x',(x-box.left)+'px');
      glow.style.setProperty('--glow-y',(y-box.top)+'px');
      glow.style.setProperty('--glow-size',Math.min(540,Math.max(240,Math.min(box.width,box.height)*.85))+'px');
      glow.dataset.visible='true';
    }
    document.addEventListener('pointermove',event=>{
      if(!fine.matches||reduced.matches||event.pointerType==='touch'){clear();return}
      const surface=event.target instanceof Element?event.target.closest(selector):null;
      if(!surface||surface.closest('[data-scene-active=false]')){clear();return}
      pending={surface,x:event.clientX,y:event.clientY};
      if(!frame)frame=requestAnimationFrame(paint);
    },{passive:true});
    document.documentElement.addEventListener('pointerleave',clear);
    document.addEventListener('pointercancel',clear);
    document.addEventListener('scroll',clear,{passive:true,capture:true});
    document.addEventListener('visibilitychange',clear);
    addEventListener('blur',clear);addEventListener('resize',clear);
    fine.addEventListener('change',clear);reduced.addEventListener('change',clear);
    window.meiovaSurfaceGlow={reset:clear,probe:()=>({active:active?.id||active?.className||null,visible:glow.dataset.visible==='true',running:!!frame,x:glow.style.getPropertyValue('--glow-x'),y:glow.style.getPropertyValue('--glow-y')})};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
