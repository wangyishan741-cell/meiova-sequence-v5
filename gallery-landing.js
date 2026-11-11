/* One image, one landing slot. No image cross-fade during the hand-off. */
(() => {
  addEventListener('load', () => {
    const source = document.querySelector('.care-portrait');
    const root = document.querySelector('#knowledge');
    const stage = document.querySelector('.front-stage');
    const destination = root?.querySelector('.atlas-lead-image');
    if (!source || !destination || !stage) return;
    const bridge = document.createElement('div');
    bridge.className = 'care-gallery-bridge';
    bridge.setAttribute('aria-hidden', 'true');
    const image = source.querySelector('img').cloneNode();
    image.removeAttribute('data-fusion-asset');
    image.alt = '';
    bridge.append(image);
    document.body.append(bridge);
    const incoming = [...root.querySelectorAll('.atlas-images,.atlas-nav,.atlas-topic-summary,.atlas-introduction,.atlas-mode')];
    const outgoing = [...document.querySelectorAll('.care-composition>h2,.care-lead,.care-details,.care-curve')];
    const clamp = n => Math.max(0, Math.min(1, n));
    let raf = 0;
    function reset() {
      incoming.concat(outgoing).forEach(el => el.style.opacity = '');
      bridge.style.display = 'none';
      document.documentElement.classList.remove('care-bridge-active');
      source.style.visibility = '';
      destination.style.visibility = '';
    }
    function paint() {
      raf = 0;
      const top = root.getBoundingClientRect().top;
      const p = clamp(1 - top / innerHeight);
      if (root.dataset.atlasReading === 'true' || root.dataset.atlasMode !== 'vertical' || innerWidth <= 850 || matchMedia('(prefers-reduced-motion:reduce)').matches || p <= 0 || p >= 1) {
        reset(); return;
      }
      const from = source.getBoundingClientRect();
      // Measure layout space, independent of the previous scroll direction or
      // a gallery/card animation still settling from an earlier state.
      const composition = source.parentElement.getBoundingClientRect();
      const fromY = from.top - composition.top;
      const width = 264 * Math.min(innerWidth / 1920, 1.35);
      const to = {left:root.getBoundingClientRect().left + root.clientWidth/2 - width/2, width, height:width*4/3};
      const toY = document.querySelector('.global-header').getBoundingClientRect().height + 20;
      const t = p * p * (3 - 2 * p);
      const toneProgress=clamp((p-.55)/.45),tone=toneProgress*toneProgress*(3-2*toneProgress);
      const mix = (a,b) => a + (b-a)*t;
      document.documentElement.classList.add('care-bridge-active');
      Object.assign(bridge.style, {
        display:'block', left:mix(from.left,to.left)+'px', top:mix(fromY,toY)+'px',
        width:mix(from.width,to.width)+'px', height:mix(from.height,to.height)+'px',
        opacity:String(1-.44*tone),filter:'grayscale('+(.96*tone)+')',borderRadius:mix(16,10)+'px'
      });
      // The next photograph arrives below the hand, never inside it.
      incoming.forEach(el => el.style.opacity = String(p ** 3));
      outgoing.forEach(el => el.style.opacity = String(clamp(1-p*2.5)));
      source.style.visibility = 'hidden';
      destination.style.visibility = 'hidden';
    }
    function request() { if (!raf) raf = requestAnimationFrame(paint); }
    addEventListener('scroll', request, {passive:true});
    addEventListener('resize', request);
    new MutationObserver(request).observe(root, {attributes:true,attributeFilter:['data-atlas-reading','data-atlas-mode']});
    window.meiovaGalleryLanding = {refresh:paint};
    paint();
  }, {once:true});
})();
