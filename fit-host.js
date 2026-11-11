(()=>{
const frame=document.getElementById('fit-frame');
const sync=()=>{try{frame.contentWindow.setMeiovaLanguage?.(document.documentElement.lang);const sheet=[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch{return []}}).filter(r=>r.cssText.startsWith('@font-face')).map(r=>r.cssText).join('\n');const doc=frame.contentDocument;if(doc&&!doc.getElementById('meiova-fonts')){const st=doc.createElement('style');st.id='meiova-fonts';st.textContent=sheet;doc.head.append(st)}}catch{}};
frame.addEventListener('load',sync);new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
addEventListener('message',e=>{if(e.source!==frame.contentWindow)return;if(e.data?.type==='meiova-fit-height')frame.style.height=Math.max(500,e.data.height)+'px';if(e.data?.type==='meiova-fit-step'){document.querySelector('.atlas-reader')?.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}});sync();
})();

