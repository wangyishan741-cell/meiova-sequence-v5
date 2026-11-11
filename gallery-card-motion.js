/* Lumina-inspired radial colour reveal, adapted to one photograph per card.
   The grey and colour samples use the same texture: no cross-image overlap. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const compact = matchMedia('(max-width:850px)');
  const cards = new Map();
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const ease = v => v*v*(3-2*v);
  let raf=0, previous=0, held=false;
  const vertex = `attribute vec2 point;varying vec2 uv;
    void main(){uv=point*.5+.5;gl_Position=vec4(point,0.,1.);}`;
  const fragment = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D photo;
    uniform vec2 imageSize,boxSize;
    uniform float reveal,crop,drift;
    vec2 cover(vec2 p){
      float a=imageSize.x/imageSize.y,b=boxSize.x/boxSize.y;
      vec2 fit=a>b?vec2(b/a,1.):vec2(1.,a/b);
      p=(p-.5)/crop+vec2(.5, .5+drift/boxSize.y/crop);
      return clamp((p-.5)*fit+.5,.001,.999);
    }
    void main(){
      vec3 original=texture2D(photo,cover(uv)).rgb;
      float luma=dot(original,vec3(.2126,.7152,.0722));
      vec3 quiet=vec3(luma)*vec3(1.007,.998,1.012);
      vec2 aspect=vec2(boxSize.x/boxSize.y,1.);
      vec2 delta=(uv-.5)*aspect;
      float distance=length(delta);
      float radius=reveal*(length(aspect)*.52+.06);
      float mask=1.-smoothstep(radius-.027,radius+.027,distance);
      float moving=sin(3.14159265*reveal);
      float rim=exp(-pow((distance-radius)/.045,2.))*moving;
      vec2 direction=delta/max(distance,.001)/aspect;
      vec2 lens=uv-direction*rim*.009;
      float split=rim*.0012;
      vec3 colour=vec3(
        texture2D(photo,cover(lens+direction*split)).r,
        texture2D(photo,cover(lens)).g,
        texture2D(photo,cover(lens-direction*split)).b);
      colour+=rim*.018;
      if(reveal<.001)mask=0.;
      if(reveal>.999){mask=1.;colour=original;}
      gl_FragColor=vec4(mix(quiet,colour,mask),1.);
    }`;
  function request(){if(!raf&&!held&&!document.hidden)raf=requestAnimationFrame(tick)}
  function resetTilt(c){c.tx=c.ty=0;c.hover=false;request()}
  function make(button){
    const img=button.querySelector('img');
    if(!img)return null;
    const face=document.createElement('span');face.className='atlas-card-face';
    img.replaceWith(face);face.append(img);button.dataset.cardDepth='true';
    const c={button,img,face,active:null,value:0,from:0,to:0,start:0,duration:850,rx:0,ry:0,tx:0,ty:0,light:0,hover:false,gl:null,failed:false,dirty:true,drift:0,crop:1,width:264,height:352,visible:false};
    cards.set(button,c);
    const move=e=>{
      if(!fine.matches||reduce.matches||compact.matches||document.querySelector('#knowledge').dataset.atlasReading==='true')return;
      const b=button.getBoundingClientRect(),x=clamp((e.clientX-b.left)/b.width),y=clamp((e.clientY-b.top)/b.height);
      c.tx=-(y-.5)*7;c.ty=(x-.5)*9;c.hover=true;
      face.style.setProperty('--card-light-x',(x*100)+'%');face.style.setProperty('--card-light-y',(y*100)+'%');request();
    };
    button.addEventListener('pointermove',move,{passive:true});
    button.addEventListener('pointerleave',()=>resetTilt(c));
    button.addEventListener('pointercancel',()=>resetTilt(c));
    button.addEventListener('blur',()=>resetTilt(c));
    img.addEventListener('load',()=>{if(c.gl)upload(c);c.dirty=true;request()});
    return c;
  }
  function shader(gl,type,source){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function upload(c){
    if(!c.img.complete||!c.img.naturalWidth)return;
    const {gl}=c;gl.bindTexture(gl.TEXTURE_2D,c.texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c.img);
    c.uploaded=true;c.dirty=true;
  }
  function prepare(c){
    if(c.gl||c.failed||reduce.matches||compact.matches||!c.img.complete||!c.img.naturalWidth)return;
    let canvas;
    try{
      canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
      const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
      if(!gl)throw new Error('No WebGL context');
      const vs=shader(gl,gl.VERTEX_SHADER,vertex),fs=shader(gl,gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
      gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      for(const axis of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,axis,gl.CLAMP_TO_EDGE);
      for(const filter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,filter,gl.LINEAR);
      Object.assign(c,{gl,canvas,texture,program,uniforms:Object.fromEntries(['photo','imageSize','boxSize','reveal','crop','drift'].map(k=>[k,gl.getUniformLocation(program,k)]))});
      upload(c);c.face.append(canvas);
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();c.failed=true;delete c.face.dataset.glReady;canvas.hidden=true});
      c.dirty=true;
    }catch(e){c.failed=true;canvas?.remove();c.gl=null;delete c.face.dataset.glReady;}
  }
  function paint(c){
    if(!c.gl||!c.uploaded||c.failed)return;
    const {gl,canvas,uniforms:u}=c,dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(c.width*dpr)),h=Math.max(1,Math.round(c.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
    gl.useProgram(c.program);gl.uniform1i(u.photo,0);gl.uniform2f(u.imageSize,c.img.naturalWidth,c.img.naturalHeight);gl.uniform2f(u.boxSize,c.width,c.height);
    gl.uniform1f(u.reveal,c.value);gl.uniform1f(u.crop,c.crop);gl.uniform1f(u.drift,c.drift);gl.drawArrays(gl.TRIANGLES,0,6);
    c.face.dataset.glReady='true';c.draws=(c.draws||0)+1;c.dirty=false;
  }
  function update(button,state){
    const c=cards.get(button)||make(button);if(!c)return;
    const active=!!state.active;
    if(c.active!==active){
      c.from=c.value;c.to=active?1:0;c.start=performance.now();c.duration=active?880:660;
      if(c.active===null||reduce.matches||compact.matches)c.value=c.to;
      c.active=active;c.dirty=true;
      c.face.style.setProperty('--card-gray',active?'0':'1');
    }
    const box=button.getBoundingClientRect();c.visible=box.bottom>0&&box.top<innerHeight&&box.right>0&&box.left<innerWidth&&!button.hidden;
    const w=button.clientWidth,h=button.clientHeight,drift=state.drift||0,crop=state.crop||1;
    if(c.width!==w||c.height!==h||c.drift!==drift||c.crop!==crop)c.dirty=true;
    Object.assign(c,{width:w,height:h,drift,crop});
    if(c.visible)prepare(c);
    request();
  }
  function tick(now){
    raf=0;const dt=previous?Math.min((now-previous)/1000,.045):1/60;previous=now;let moving=false;
    const reading=document.querySelector('#knowledge')?.dataset.atlasReading==='true';
    cards.forEach(c=>{
      if(reading||reduce.matches||compact.matches||!fine.matches){c.tx=c.ty=0;c.hover=false;}
      const k=1-Math.exp(-15*dt);c.rx+=(c.tx-c.rx)*k;c.ry+=(c.ty-c.ry)*k;c.light+=((c.hover?1:0)-c.light)*k;
      if(Math.abs(c.rx-c.tx)+Math.abs(c.ry-c.ty)<.008){c.rx=c.tx;c.ry=c.ty}
      if(Math.abs(c.light-(c.hover?1:0))<.003)c.light=c.hover?1:0;
      c.face.style.transform=c.rx||c.ry?`perspective(900px) rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) translateZ(${(c.light*5).toFixed(2)}px)`:'none';
      c.face.style.setProperty('--card-light',c.light.toFixed(3));
      c.face.style.boxShadow=c.light>.001?`${(-c.ry*.8).toFixed(1)}px ${(6*c.light+c.rx*.4).toFixed(1)}px ${(18*c.light).toFixed(1)}px rgb(52 36 66 / ${(c.light*.12).toFixed(3)})`:'none';
      if(c.value!==c.to){const p=reduce.matches||compact.matches?1:clamp((now-c.start)/c.duration);c.value=c.from+(c.to-c.from)*ease(p);if(p===1)c.value=c.to;c.dirty=true;}
      if(c.visible&&!reading&&c.dirty){prepare(c);paint(c)}
      if(!reading&&(c.value!==c.to||c.rx!==c.tx||c.ry!==c.ty||c.light!==(c.hover?1:0)))moving=true;
    });
    if(moving)request();else previous=0;
  }
  function reset(){cards.forEach(c=>{c.tx=c.ty=c.rx=c.ry=c.light=0;c.hover=false;c.face.style.transform='none';c.face.style.boxShadow='none';c.face.style.setProperty('--card-light','0')});request()}
  reduce.addEventListener('change',()=>{reset();cards.forEach(c=>{c.value=c.to;c.dirty=true;if(reduce.matches)delete c.face.dataset.glReady});request()});
  fine.addEventListener('change',reset);compact.addEventListener('change',reset);
  addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;previous=0;reset()}else request()});
  window.meiovaCardMotion={update,reset,
    probe:()=>({running:!!raf,cards:[...cards.values()].map(c=>({slot:c.button.dataset.atlasSlot??'lead',active:c.active,reveal:c.value,tilt:[c.rx,c.ry],webgl:!!c.gl&&!c.failed,visible:c.visible,draws:c.draws||0}))}),
    hold(progress){held=true;if(raf)cancelAnimationFrame(raf);raf=0;cards.forEach(c=>{if(c.from!==c.to){c.value=c.from+(c.to-c.from)*ease(clamp(progress));c.dirty=true;if(c.visible)paint(c)}})},
    resume(){held=false;cards.forEach(c=>{c.from=c.value;c.start=performance.now()});request()}
  };
})();
