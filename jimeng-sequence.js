/* Original Jimeng frames, soft horizontal edges, independent supplied backdrop. */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),initialHash=location.hash;
 const W=1664,H=1248,N=97,frames=new Map(),pending=new Map(),anchors=new Set([0,16,32,48,64,80,96]);
 let stage,canvas,ctx,layer,lc,mask,bg,acts,targets,ready=false,raf=0,wanted=0,shown=0,dpr=1,bounds=[[389,4,1405,1248],[389,107,1405,1248],[391,13,1406,1248],[393,112,1409,1248],[394,104,1412,1248],[397,110,1419,1248],[400,113,1421,1248],[401,112,1425,1248],[403,109,1430,1248],[405,108,1435,1248],[407,95,1438,1248],[409,93,1443,1248],[413,92,1447,1248],[415,99,1452,1248],[417,103,1458,1248],[420,103,1462,1248],[421,103,1466,1248],[424,102,1471,1248],[426,102,1475,1248],[429,102,1480,1248],[431,101,1485,1248],[434,99,1489,1248],[436,101,1493,1248],[439,99,1498,1248],[441,99,1501,1248],[443,99,1505,1248],[445,100,1509,1248],[448,93,1512,1248],[451,98,1515,1248],[454,90,1516,1248],[456,89,1518,1248],[460,89,1519,1248],[464,87,1519,1248],[467,86,1519,1248],[471,83,1519,1248],[475,81,1518,1248],[479,81,1516,1248],[482,79,1515,1248],[487,77,1513,1248],[493,76,1511,1248],[497,74,1506,1248],[491,73,1502,1248],[468,72,1498,1248],[457,71,1495,1248],[447,72,1491,1248],[436,69,1486,1248],[426,69,1480,1248],[416,67,1474,1248],[407,66,1468,1248],[395,65,1461,1248],[385,64,1457,1248],[374,63,1452,1248],[365,63,1448,1248],[353,60,1443,1248],[342,60,1437,1248],[333,59,1431,1248],[325,58,1425,1248],[315,58,1419,1248],[306,56,1416,1248],[296,56,1409,1248],[288,55,1406,1248],[280,52,1403,1248],[273,51,1397,1248],[266,51,1392,1248],[258,49,1390,1248],[252,48,1386,1248],[248,47,1385,1248],[244,45,1385,1248],[241,45,1382,1248],[241,44,1382,1248],[242,42,1382,1248],[244,42,1379,1248],[246,41,1379,1248],[252,40,1379,1248],[259,38,1379,1248],[267,38,1379,1248],[275,36,1379,1248],[285,34,1379,1248],[297,32,1377,1248],[308,32,1376,1248],[319,30,1375,1248],[334,30,1375,1248],[348,28,1375,1248],[359,28,1375,1248],[371,28,1375,1248],[385,25,1375,1248],[400,25,1375,1248],[409,25,1375,1248],[418,25,1375,1248],[432,25,1375,1248],[443,24,1376,1248],[453,24,1377,1248],[459,25,1378,1248],[468,25,1379,1248],[472,25,1382,1248],[478,27,1382,1248],[482,27,1383,1248]],lastDraw;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>x*x*(3-2*x),mix=(a,b,t)=>a+(b-a)*t;
 const path=i=>`frames/jimeng-clean/${String(i+1).padStart(4,'0')}.jpg`;
 function request(){if(!raf)raf=requestAnimationFrame(paint);}
 function getFrame(i){
  if(frames.has(i))return Promise.resolve(frames.get(i));if(pending.has(i))return pending.get(i);
  const im=new Image();im.src=path(i);
  const promise=im.decode().then(()=>{frames.set(i,im);pending.delete(i);
   while(frames.size>18){const k=[...frames.keys()].filter(k=>!anchors.has(k)&&k!==wanted).sort((a,b)=>Math.abs(b-wanted)-Math.abs(a-wanted))[0];if(k===undefined)break;frames.delete(k);}
   request();return im;
  }).catch(()=>{pending.delete(i);return null});pending.set(i,promise);return promise;
 }
 function rect(el){const r=el.getBoundingClientRect(),s=stage.getBoundingClientRect();return{x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height};}
 function interpolate(a,b,t){return Object.fromEntries(['x','y','w','h'].map(k=>[k,mix(a[k],b[k],t)]));}
 function placements(){
  const a=targets[0],b=targets[1],c=targets[2];
  const s0=a.h/H,s1=b.h/H,s2=Math.max(c.w/520,c.h/758);
  return[{s:s0,x:Math.max(-stage.clientWidth*.155,-bounds[0][0]*s0),y:a.y},{s:s1,x:Math.min(b.x+b.w/2-960*s1,b.x-240*s1),y:b.y},
   {s:s2,x:c.x-480*s2,y:c.y-490*s2}];
 }
 function posterSize(){if(!stage)return;const s=innerHeight/H;stage.style.setProperty('--jimeng-poster-w',W*s+'px');stage.style.setProperty('--jimeng-poster-h',innerHeight+'px');stage.style.setProperty('--jimeng-poster-x',Math.max(-stage.clientWidth*.155,-bounds[0][0]*s)+'px');}
 function size(){posterSize();if(!ready)return;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(stage.clientWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';targets=[rect(document.querySelector('#home .photo-object')),rect(document.querySelector('#approach .manifesto-photo')),rect(document.querySelector('#care .care-portrait'))];paint();}
 function paint(){
  raf=0;if(!ready)return;const probe=window.__meiovaFusion?.probe(),enabled=probe?.enabled&&!reduced.matches;
  stage.classList.toggle('sequence-ready',!!enabled);canvas.hidden=!enabled;
  if(!enabled){acts.forEach(a=>{a.style.opacity='';a.style.pointerEvents=''});return;}
  const p=Math.max(0,Math.min(2,probe.presented/innerHeight)),part=Math.min(1,Math.floor(p)),t=ease(p-part);
  const r=interpolate(targets[part],targets[part+1],t),positions=placements();
  const a=positions[part],b=positions[part+1];let s=mix(a.s,b.s,t),x=mix(a.x,b.x,t),y=mix(a.y,b.y,t);
  wanted=Math.round(clamp(p)*96);
  [wanted,wanted+1,wanted-1,wanted+2,wanted-2,wanted+3,wanted-3,wanted+4,wanted+5].filter(i=>i>=0&&i<N).forEach(getFrame);
  shown=frames.has(wanted)?wanted:[...frames.keys()].sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];
  const im=frames.get(shown);if(!im)return;
  // Keep the moving elbow inside the shrinking frame, without stretching.
  if(p<1&&bounds){const f=clamp(p)*96,lo=Math.floor(f),hi=Math.min(96,lo+1),box=bounds[lo].map((v,i)=>mix(v,bounds[hi][i],f-lo));x=Math.max(r.x-box[0]*s,Math.min(r.x+r.w-box[2]*s,x));}
  const radius=16*ease(clamp((p-1)/.35));
  ctx.clearRect(0,0,stage.clientWidth,innerHeight);ctx.save();ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,radius);ctx.clip();
  ctx.drawImage(bg,r.x,r.y,r.w,r.h);
  lc.clearRect(0,0,W,H);lc.globalCompositeOperation='source-over';lc.drawImage(im,0,0,W,H);lc.globalCompositeOperation='destination-in';lc.drawImage(mask,0,0);lc.globalCompositeOperation='source-over';
  ctx.drawImage(layer,x,y,W*s,H*s);ctx.restore();lastDraw={p,frame:shown,wanted,rect:r,radius,video:{x,y,w:W*s,h:H*s,scale:s}};
  acts.forEach((el,i)=>{el.style.opacity=String(i===0?1-ease(clamp(p/.30)):p<i?ease(clamp((p-(i-.32))/.22)):1-ease(clamp((p-i)/.30)));el.style.pointerEvents=Math.abs(p-i)<.5?'':'none';});
  if(probe.loopActive)request();
 }
 async function init(){
  stage=document.querySelector('.front-stage');if(!stage)return;posterSize();addEventListener('resize',posterSize);
  acts=[...stage.querySelectorAll('.front-act')];canvas=document.createElement('canvas');canvas.className='sequence-film';canvas.setAttribute('aria-hidden','true');canvas.hidden=true;stage.prepend(canvas);ctx=canvas.getContext('2d');
  layer=document.createElement('canvas');layer.width=W;layer.height=H;lc=layer.getContext('2d');
  mask=document.createElement('canvas');mask.width=W;mask.height=H;const mc=mask.getContext('2d'),gradient=mc.createLinearGradient(0,0,W,0);
  [[0,0],[.025,0],[220/W,1],[1472/W,1],[.995,0],[1,0]].forEach(([p,a])=>gradient.addColorStop(p,`rgba(255,255,255,${a})`));mc.fillStyle=gradient;mc.fillRect(0,0,W,H);
  bg=new Image();bg.src='assets/jimeng-background.png';
  try{await Promise.all([bg.decode(),getFrame(0),getFrame(96)]);if(!frames.has(0))return;}catch(e){console.warn('Keeping poster fallback',e);return;}
  [1,2,3,4,5,16,32,48,64,80].forEach(getFrame);
  await new Promise(resolve=>{const start=performance.now();function check(){const state=window.meiovaEntrance?.probe().state;if(!state||state==='complete'||reduced.matches||scrollY>80||performance.now()-start>4000)resolve();else requestAnimationFrame(check);}check();});
  ready=true;size();addEventListener('scroll',request,{passive:true});addEventListener('resize',size);reduced.addEventListener('change',size);
  const original=window.__meiovaFusion.seek;window.__meiovaFusion.seek=y=>{const value=original(y);paint();return value;};
  window.meiovaSequence={probe:()=>({ready,active:stage.classList.contains('sequence-ready'),count:N,cache:frames.size,pending:pending.size,mode:'jimeng-soft-edges',...lastDraw}),refresh:size};
  // Native anchor offsets must not leave a direct entry between video poses.
  const settleEntry=()=>requestAnimationFrame(()=>{if(location.hash===initialHash&&['#home','#approach','#care'].includes(initialHash)){window.__meiovaFusion.go(initialHash.slice(1),{animate:false,history:false});request();}});
  if(document.readyState==='complete')settleEntry();else addEventListener('load',settleEntry,{once:true});
 }
 init();
})();
