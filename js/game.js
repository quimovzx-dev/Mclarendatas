const el=id=>document.getElementById(id),clamp=(a,lo,hi)=>Math.max(lo,Math.min(hi,a));
document.body.classList.add(matchMedia('(pointer:coarse)').matches?'touch':'pc');
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,1600);
const ren=new THREE.WebGLRenderer({canvas:el('gl'),antialias:true});
ren.setPixelRatio(Math.min(devicePixelRatio,2));ren.setSize(innerWidth,innerHeight);
const hemi=new THREE.HemisphereLight(0xffffff,0x444444,.9),sun=new THREE.DirectionalLight(0xffffff,1),SUND=new THREE.Vector3(0,1,0);
scene.add(hemi,sun);
const cvs=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t};

// ================= LEVELS =================
const T1=[[0,-300],[250,-320],[520,-300],[700,-200],[720,-40],[600,60],[420,40],[330,160],[400,300],[250,380],[40,350],[-120,240],[-300,300],[-460,180],[-440,-40],[-300,-120],[-180,-260]];
const T2=[[0,0],[200,-40],[380,20],[470,140],[380,260],[220,240],[140,340],[-20,380],[-180,320],[-220,180],[-120,100],[-260,20],[-240,-120],[-100,-180]];
const T3=[[0,0],[500,-30],[900,40],[1150,220],[1100,470],[850,600],[500,560],[300,700],[-50,720],[-350,600],[-420,340],[-300,140],[-120,60]];
const T4=[[0,0],[300,20],[520,-100],[700,50],[640,260],[430,300],[380,450],[520,600],[300,700],[60,600],[-40,420],[-240,380],[-320,200],[-160,80]];
const LV=[
 {name:'SUNSET CITY',sub:'Warm-up lap',theme:'sunset',cp:T1,sc:.7,W:18,laps:3,ai:3,aiV:50,maxV:66,lat:30,grip:9},
 {name:'NEON NIGHT',sub:'Tight & technical',theme:'night',cp:T2,sc:.9,W:16,laps:3,ai:4,aiV:54,maxV:68,lat:32,grip:9},
 {name:'DESERT RUSH',sub:'Flat-out speed',theme:'desert',cp:T3,sc:.6,W:20,laps:3,ai:4,aiV:64,maxV:80,lat:40,grip:9},
 {name:'ALPINE STORM',sub:'Hairpins on ice',theme:'snow',cp:T4,sc:.8,W:17,laps:4,ai:5,aiV:60,maxV:74,lat:34,grip:6.5}];
const TH={
 sunset:{sky:['#1f2d6b','#6a5aa8','#ff9a5c','#ffd2a0','#f2b98a'],fog:0xf2b98a,fn:120,ff:900,env:['#2a3580','#8b6fa8','#ffb070','#5a4a48'],hemi:[0xffc9a0,0x40503a,.9],sun:[0xffb27a,1.15],sd:[-350,110,-450],sz:420,sc:0xffffff,g:['#5f9e4a','rgba(30,80,30,.18)','rgba(150,200,110,.18)'],deco:'city',bm:[['#8e949c','#ffe9a8','#2b3540'],['#6f7f92','#d8f0ff','#1d2c3d'],['#a5745c','#ffe2a0','#3a2a25'],['#b9bcc2','#fff3c4','#4a5560']],em:'#ffcf80',lamp:[0xffe6a0],hs:1},
 night:{sky:['#01020a','#0a1038','#1b1f5c','#3a2a6a','#1a1c46'],fog:0x141a3a,fn:80,ff:650,env:['#050820','#1a2060','#5a3a8a','#0a0c1a'],hemi:[0x6a78b8,0x101828,.8],sun:[0x8fa8ff,.65],sd:[300,160,-300],sz:170,sc:0xbfd0ff,g:['#182418','rgba(0,0,0,.25)','rgba(60,90,60,.15)'],deco:'city',bm:[['#20263a','#7ff3ff','#0c1020'],['#2a1f3e','#ff7fe0','#0c0a18'],['#1f2f3a','#ffe27f','#0a1218'],['#262a40','#9fffb0','#0c1020']],em:'#9ff',lamp:[0x40e8ff,0xff40c8],hs:1.3},
 desert:{sky:['#2f64b0','#6fa4dc','#f2d7a5','#ffe6b8','#f0d9b0'],fog:0xf0d9b0,fn:150,ff:1000,env:['#3a70b8','#9cc4e8','#f6d9a8','#6b5238'],hemi:[0xfff0d0,0x9a7040,1],sun:[0xfff0c8,1.2],sd:[200,260,-300],sz:300,sc:0xfff2c0,g:['#d2a566','rgba(120,80,30,.2)','rgba(255,230,170,.2)'],deco:'mesa',lamp:[0xffe0a0]},
 snow:{sky:['#4a6f9c','#8db0d0','#d6e4f0','#eef4fa','#dfe9f2'],fog:0xdfe9f2,fn:100,ff:750,env:['#5a80ae','#a8c6e0','#eef4fa','#9aa8b8'],hemi:[0xdce8ff,0xaab4c4,1],sun:[0xe8f0ff,.9],sd:[-200,200,300],sz:220,sc:0xf0f6ff,g:['#eef2f6','rgba(120,140,170,.16)','rgba(255,255,255,.4)'],deco:'pine',lamp:[0xdff4ff]}};

// ================= SKY / ENV / GROUND =================
const sky=new THREE.Mesh(new THREE.SphereGeometry(1350,24,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-2;scene.add(sky);
const sunT=cvs(128,128,(x)=>{const g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(255,250,220,1)');g.addColorStop(.2,'rgba(255,220,150,.9)');g.addColorStop(1,'rgba(255,170,90,0)');x.fillStyle=g;x.fillRect(0,0,128,128)});
const sunSp=new THREE.Sprite(new THREE.SpriteMaterial({map:sunT,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));sunSp.renderOrder=-1;scene.add(sunSp);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),new THREE.MeshLambertMaterial());ground.rotation.x=-Math.PI/2;scene.add(ground);
let envTex=null;
function makeEnv(c){const cv=document.createElement('canvas');cv.width=512;cv.height=256;const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,c[0]);g.addColorStop(.35,c[1]);g.addColorStop(.47,c[2]);g.addColorStop(.5,'#fff2d8');g.addColorStop(.53,c[3]);g.addColorStop(1,'#141414');
  x.fillStyle=g;x.fillRect(0,0,512,256);x.fillStyle='#fff';x.fillRect(60,40,120,14);x.fillRect(300,28,90,10);x.fillRect(200,70,60,6);
  const s=x.createRadialGradient(400,60,2,400,60,40);s.addColorStop(0,'#fff');s.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=s;x.fillRect(340,0,120,120);
  const t=new THREE.CanvasTexture(cv);t.mapping=THREE.EquirectangularReflectionMapping;
  const pm=new THREE.PMREMGenerator(ren),e=pm.fromEquirectangular(t).texture;pm.dispose();return e}

// ================= WORLD =================
let world=null,N=1,L=1,ds=1,pts=[],tan=[],nor=[],look=[],W=18,LIM=15,pads=[],mmBg=null,mm={};
const DS=THREE.DoubleSide;
function disposeObj(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material)(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{['map','emissiveMap'].forEach(k=>{if(m[k])m[k].dispose()});m.dispose()})})}
function nearD(x,z){let m=1e9;for(let i=0;i<N;i+=3){const dx=pts[i].x-x,dz=pts[i].z-z,d=dx*dx+dz*dz;if(d<m)m=d}return Math.sqrt(m)}
function buildWorld(i){
  const lv=LV[i],th=TH[lv.theme];
  if(world){scene.remove(world);disposeObj(world)}
  world=new THREE.Group();scene.add(world);
  scene.background=new THREE.Color(th.fog);scene.fog=new THREE.Fog(th.fog,th.fn,th.ff);
  hemi.color.setHex(th.hemi[0]);hemi.groundColor.setHex(th.hemi[1]);hemi.intensity=th.hemi[2];
  sun.color.setHex(th.sun[0]);sun.intensity=th.sun[1];SUND.set(th.sd[0],th.sd[1],th.sd[2]).normalize();sun.position.copy(SUND).multiplyScalar(200);
  if(sky.material.map)sky.material.map.dispose();
  sky.material.map=cvs(4,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);[0,.3,.44,.5,.52].forEach((s,k)=>g.addColorStop(s,th.sky[k]));g.addColorStop(1,th.sky[4]);x.fillStyle=g;x.fillRect(0,0,w,h)});sky.material.needsUpdate=true;
  sunSp.material.color.setHex(th.sc);sunSp.scale.set(th.sz,th.sz,1);
  if(envTex)envTex.dispose();envTex=makeEnv(th.env);scene.environment=envTex;
  if(ground.material.map)ground.material.map.dispose();
  const gt=cvs(64,64,(x,w,h)=>{x.fillStyle=th.g[0];x.fillRect(0,0,w,h);for(let k=0;k<300;k++){x.fillStyle=th.g[k%2?1:2];x.fillRect(Math.random()*w,Math.random()*h,2,2)}});gt.repeat.set(220,220);
  ground.material.map=gt;ground.material.needsUpdate=true;
  // track
  W=lv.W;LIM=W/2+7;
  const curve=new THREE.CatmullRomCurve3(lv.cp.map(p=>new THREE.Vector3(p[0]*lv.sc,0,p[1]*lv.sc)),true,'centripetal');
  L=curve.getLength();N=Math.max(700,Math.round(L/2.2));ds=L/N;
  pts=curve.getSpacedPoints(N);pts.pop();tan=[];nor=[];
  for(let k=0;k<N;k++){const a=pts[(k+1)%N],b=pts[(k-1+N)%N],t=new THREE.Vector3(a.x-b.x,0,a.z-b.z).normalize();tan.push(t);nor.push(new THREE.Vector3(-t.z,0,t.x))}
  const vs=[];for(let k=0;k<N;k++){const a=tan[k],b=tan[(k+6)%N],ang=Math.abs(Math.asin(clamp(a.x*b.z-a.z*b.x,-1,1)));vs.push(Math.min(200,Math.sqrt(lv.lat/Math.max(ang/(6*ds),1e-4))))}
  look=[];for(let k=0;k<N;k++){let m=1e9;for(let j=0;j<46;j++)m=Math.min(m,vs[(k+j)%N]);look.push(m)}
  function strip(fn,mat){const pos=[],uv=[],idx=[];for(let k=0;k<=N;k++){const j=k%N;fn(j,k*ds,pos,uv)}for(let k=0;k<N;k++){const a=2*k;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();world.add(new THREE.Mesh(g,mat))}
  const ribbon=(o1,o2,y,ul,mat)=>strip((j,s,pos,uv)=>{const p=pts[j],n=nor[j];pos.push(p.x+n.x*o1,y,p.z+n.z*o1,p.x+n.x*o2,y,p.z+n.z*o2);uv.push(0,s/ul,1,s/ul)},mat);
  const wall=(side,h,mat)=>strip((j,s,pos,uv)=>{const p=pts[j],n=nor[j],o=side*LIM;pos.push(p.x+n.x*o,0,p.z+n.z*o,p.x+n.x*o,h,p.z+n.z*o);uv.push(0,s/6,1,s/6)},mat);
  const roadTex=cvs(256,256,(x,w,h)=>{x.fillStyle='#3a3e44';x.fillRect(0,0,w,h);for(let k=0;k<2500;k++){x.fillStyle='rgba(255,255,255,'+Math.random()*.07+')';x.fillRect(Math.random()*w,Math.random()*h,2,2)}x.fillStyle='#fff';x.fillRect(8,0,6,h);x.fillRect(242,0,6,h);x.fillStyle='#f2c230';x.fillRect(125,0,6,h/2)});
  const kerbTex=cvs(8,16,(x)=>{x.fillStyle='#d3222a';x.fillRect(0,0,8,8);x.fillStyle='#fff';x.fillRect(0,8,8,8)});
  const lam=o=>new THREE.MeshLambertMaterial(Object.assign({side:DS},o));
  ribbon(-W/2,W/2,.03,30,lam({map:roadTex}));
  [[W/2,W/2+1.6],[-W/2-1.6,-W/2]].forEach(o=>ribbon(o[0],o[1],.05,4,lam({map:kerbTex})));
  [[W/2+1.6,W/2+6.6],[-W/2-6.6,-W/2-1.6]].forEach(o=>ribbon(o[0],o[1],.02,20,lam({color:lv.theme==='snow'?0xc9d4e0:lv.theme==='desert'?0xc79a5a:0x9a8a6a})));
  [1,-1].forEach(s=>wall(s,1.3,lam({map:kerbTex})));
  // start gantry
  {const g=new THREE.Group(),t=tan[0];g.position.copy(pts[0]);g.rotation.y=Math.atan2(t.x,t.z);
   const chk=cvs(64,16,(x)=>{for(let r=0;r<2;r++)for(let c=0;c<8;c++){x.fillStyle=(r+c)%2?'#fff':'#111';x.fillRect(c*8,r*8,8,8)}});
   const ln=new THREE.Mesh(new THREE.PlaneGeometry(W,2.4),new THREE.MeshBasicMaterial({map:chk}));ln.rotation.x=-Math.PI/2;ln.position.y=.07;g.add(ln);
   const pm=new THREE.MeshLambertMaterial({color:0x2a2d33});
   [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.BoxGeometry(1,9,1),pm);p.position.set(s*(W/2+2.5),4.5,0);g.add(p)});
   const ban=cvs(512,64,(x,w,h)=>{x.fillStyle='#c81616';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.font='bold 40px system-ui';x.textAlign='center';x.fillText('START / FINISH',w/2,46)});
   const bm=new THREE.Mesh(new THREE.BoxGeometry(W+6,2.4,1),[pm,pm,pm,pm,new THREE.MeshBasicMaterial({map:ban}),new THREE.MeshBasicMaterial({map:ban})]);bm.position.y=9;g.add(bm);world.add(g)}
  // boost pads
  pads=[];const padT=cvs(64,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#ffcf2e';for(let k=0;k<3;k++){const y=10+k*38;x.beginPath();x.moveTo(6,y);x.lineTo(32,y+22);x.lineTo(58,y);x.lineTo(58,y+12);x.lineTo(32,y+34);x.lineTo(6,y+12);x.fill()}});
  for(let k=0;k<6;k++){const j=Math.floor(N*(k+.5)/6),g=new THREE.Group();g.position.copy(pts[j]);g.rotation.y=Math.atan2(tan[j].x,tan[j].z);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(W*.4,W*.7),new THREE.MeshBasicMaterial({map:padT,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.08;g.add(m);world.add(g);pads.push({i:j,cd:0})}
  // lamps
  {const n=Math.floor(N/30),post=new THREE.InstancedMesh(new THREE.BoxGeometry(.3,8,.3),new THREE.MeshLambertMaterial({color:0x3a3d44}),n),head=new THREE.InstancedMesh(new THREE.SphereGeometry(.7,8,6),new THREE.MeshBasicMaterial({color:0xffffff}),n),m=new THREE.Object3D();
   for(let k=0;k<n;k++){const j=k*30,o=(k%2?1:-1)*(LIM+1.8);m.position.set(pts[j].x+nor[j].x*o,4,pts[j].z+nor[j].z*o);m.updateMatrix();post.setMatrixAt(k,m.matrix);m.position.y=8.2;m.updateMatrix();head.setMatrixAt(k,m.matrix);head.setColorAt(k,new THREE.Color(th.lamp[k%th.lamp.length]))}
   world.add(post,head)}
  // scenery
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z)});x0-=380;x1+=380;z0-=380;z1+=380;
  const scatter=(n,minD,cb)=>{let c=0;for(let k=0;k<n*40&&c<n;k++){const x=x0+Math.random()*(x1-x0),z=z0+Math.random()*(z1-z0);if(nearD(x,z)<minD)continue;if(cb(x,z,c))c++}};
  if(th.deco==='city'){
    const BM=th.bm.map(b=>{const pat=[];for(let k=0;k<64;k++)pat.push(Math.random()<.42);
      const a=cvs(256,256,(x)=>{x.fillStyle=b[0];x.fillRect(0,0,256,256);for(let r=0;r<8;r++)for(let c=0;c<8;c++){x.fillStyle=pat[r*8+c]?b[1]:b[2];x.fillRect(c*32+6,r*32+8,20,16)}});
      const e=cvs(256,256,(x)=>{x.fillStyle='#000';x.fillRect(0,0,256,256);for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(pat[r*8+c]){x.fillStyle=th.em;x.fillRect(c*32+6,r*32+8,20,16)}});
      return new THREE.MeshLambertMaterial({map:a,emissive:0xffffff,emissiveMap:e,emissiveIntensity:.95})});
    const placed=[];
    scatter(120,50,(x,z,c)=>{if(placed.some(p=>Math.hypot(p[0]-x,p[1]-z)<38))return false;
      const w=14+Math.random()*18,d=14+Math.random()*18,h=(14+Math.pow(Math.random(),2)*100)*th.hs;placed.push([x,z]);
      const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;
      for(let f=0;f<6;f++)for(let q=0;q<4;q++){const k=f*4+q;if(f<2)uv.setXY(k,uv.getX(k)*d/32,uv.getY(k)*h/32);else if(f>3)uv.setXY(k,uv.getX(k)*w/32,uv.getY(k)*h/32)}
      const b=new THREE.Mesh(g,BM[c%4]);b.position.set(x,h/2,z);b.rotation.y=Math.random()<.5?0:Math.PI/2;world.add(b);return true});
  }else if(th.deco==='mesa'){
    const bg=new THREE.BoxGeometry(1,1,1);bg.translate(0,.5,0);const im=new THREE.InstancedMesh(bg,new THREE.MeshLambertMaterial({color:0xffffff}),90),o=new THREE.Object3D(),cs=[0xb9784c,0xa5643e,0xc98a5c,0x9a5a3a];
    scatter(90,45,(x,z,c)=>{o.position.set(x,0,z);o.scale.set(20+Math.random()*40,12+Math.random()*40,18+Math.random()*34);o.rotation.y=Math.random()*3;o.updateMatrix();im.setMatrixAt(c,o.matrix);im.setColorAt(c,new THREE.Color(cs[c%4]));return true});world.add(im);
  }else{
    const cg=new THREE.ConeGeometry(1,1,8);cg.translate(0,.5,0);const A=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0x1f4a3a}),170),B=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0xf2f6fa}),170),o=new THREE.Object3D();
    scatter(170,30,(x,z,c)=>{const s=.8+Math.random()*.9;o.position.set(x,0,z);o.scale.set(4*s,16*s,4*s);o.updateMatrix();A.setMatrixAt(c,o.matrix);o.position.y=9*s;o.scale.set(2.6*s,8*s,2.6*s);o.updateMatrix();B.setMatrixAt(c,o.matrix);return true});world.add(A,B);
  }
  // minimap
  let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;pts.forEach(p=>{a0=Math.min(a0,p.x);a1=Math.max(a1,p.x);b0=Math.min(b0,p.z);b1=Math.max(b1,p.z)});
  const S=Math.min(176/(a1-a0),176/(b1-b0));mm={a0,b0,S,ox:(208-(a1-a0)*S)/2,oz:(208-(b1-b0)*S)/2};
  mmBg=document.createElement('canvas');mmBg.width=mmBg.height=208;{const c=mmBg.getContext('2d');c.lineJoin='round';c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=13;c.beginPath();pts.forEach((p,k)=>{const X=mm.ox+(p.x-a0)*S,Z=mm.oz+(p.z-b0)*S;k?c.lineTo(X,Z):c.moveTo(X,Z)});c.closePath();c.stroke();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=6;c.stroke();
    const t0=pts[0];c.fillStyle='#ff8000';c.fillRect(mm.ox+(t0.x-a0)*S-6,mm.oz+(t0.z-b0)*S-2,12,4)}
}

// ================= CARS =================
const b64=(s,T)=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)};
const ldr=new THREE.TextureLoader(),TX={};
Object.keys(D.t).forEach(k=>{const tx=ldr.load(D.t[k]);tx.anisotropy=4;tx.wrapS=tx.wrapT=THREE.RepeatWrapping;TX[k]=tx});
const GL=['headlight_1','headlight_2','front_turn_signal','rear_turn_signal','side_turn_signal','brakelight','rear_lamp'];
const S=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:0},o));
const RIVAL_HUES=[210,0,140,280,45];
function buildCar(hex,rival,idx){
  const bodyMat=new THREE.MeshPhysicalMaterial({color:hex,metalness:.55,roughness:.3,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.5});
  const livTex=cvs(256,256,(x)=>{x.fillStyle='#fff';x.beginPath();x.arc(128,128,112,0,7);x.fill();x.lineWidth=8;x.strokeStyle='#111';x.stroke();x.fillStyle='#111';x.font='bold 150px system-ui';x.textAlign='center';x.fillText(String(idx+1),128,178)});
  livTex.wrapS=livTex.wrapT=THREE.ClampToEdgeWrapping;
  const uS={value:new THREE.Color(0xffffff)};
  bodyMat.onBeforeCompile=sh=>{sh.uniforms.uStripe=uS;sh.uniforms.tLiv={value:livTex};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;varying vec3 vON;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;vON=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;varying vec3 vON;uniform vec3 uStripe;uniform sampler2D tLiv;').replace('#include <color_fragment>','#include <color_fragment>\n float ax=abs(vOP.x);\n if(vON.y>.35&&(ax<.2||(ax>.27&&ax<.32)))diffuseColor.rgb=uStripe;\n if(abs(vON.x)>.75){vec2 q=vec2((vOP.z-.05)*sign(vON.x)/.8+.5,(vOP.y-.72)/.8+.5);if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1){vec4 l=texture2D(tLiv,q);diffuseColor.rgb=mix(diffuseColor.rgb,l.rgb,l.a);}}');};
  const c=bodyMat.color;uS.value.setHex((c.r*.3+c.g*.59+c.b*.11)>.5?0x111111:0xffffff);
  const MAT={body:bodyMat,dark:S(0x1b1c1e,{roughness:.5,metalness:.25}),glass:S(0x0b1822,{transparent:true,opacity:.55,roughness:.05,metalness:.6}),
   chrome:S(0xd5d9de,{metalness:1,roughness:.12}),light:S(0xfff0b8,{emissive:0x8a7a40}),red:S(0xc81616,{emissive:0x3a0000}),rim:S(0xc4c8ce,{metalness:1,roughness:.2})};
  const TM={};
  function matFor(g){
    if(!g.t)return MAT[g.c];
    if(TM[g.c])return TM[g.c];
    const o={map:TX[g.t],roughness:g.c==='tire'?.95:.5,metalness:g.c==='brakedisk'?.6:.1};
    if(D.al.indexOf(g.t)>=0){o.transparent=true;o.alphaTest=.02}
    if(g.c.indexOf('windo')===0){o.transparent=true;o.opacity=.6;o.roughness=.05;o.metalness=.5;o.depthWrite=false}
    if(GL.indexOf(g.c)>=0){o.emissive=0xffffff;o.emissiveMap=TX[g.t];o.emissiveIntensity=.35}
    return TM[g.c]=S(0xffffff,o);
  }
  const car=new THREE.Group();
  const wheels=D.w.map((p,i)=>{const piv=new THREE.Group();piv.position.set(p[0],p[1],p[2]);const spin=new THREE.Group();piv.add(spin);car.add(piv);return{piv,spin,front:i>=2}});
  const lod=rival?1:0; // rivals use simplified (dark/body/chrome/rim/tire/windo only) — skip tiny trims to save draw calls on mobile
  D.g.forEach(g=>{
    if(rival&&['fuel_clap','door_stitch','plate_F','plate_R','interior','engine','bottom','grill_3','McLaren_logo','McLaren_supportlogo'].indexOf(g.c)>=0)return;
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(b64(g.p,Float32Array),3));
    geo.setAttribute('normal',new THREE.BufferAttribute(b64(g.n,Int8Array),3,true));
    if(g.u)geo.setAttribute('uv',new THREE.BufferAttribute(b64(g.u,Float32Array),2));
    geo.setIndex(new THREE.BufferAttribute(b64(g.i,Uint32Array),1));
    const m=new THREE.Mesh(geo,matFor(g));if(g.c.indexOf('windo')===0)m.renderOrder=2;
    (g.w>=0?wheels[g.w].spin:car).add(m);
  });
  const shd=new THREE.Mesh(new THREE.PlaneGeometry(6,3),new THREE.MeshBasicMaterial({map:TX.shadow,transparent:true,depthWrite:false,opacity:.85}));
  shd.rotation.x=-Math.PI/2;shd.rotation.z=Math.PI/2;shd.position.y=.09;car.add(shd);
  const puffT=cvs(64,64,(c)=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64)});
  const glow=(sx,z,col,sz)=>{const m=new THREE.SpriteMaterial({map:puffT,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9}),s=new THREE.Sprite(m);s.position.set(sx,.7,z);s.scale.set(sz,sz,1);car.add(s);return m};
  glow(.72,2.3,0xfff2c0,1.8);glow(-.72,2.3,0xfff2c0,1.8);
  const tailM=[glow(.66,-2.4,0xff2020,1.3),glow(-.66,-2.4,0xff2020,1.3)];
  const lights=[];
  if(!rival)[.72,-.72].forEach(sx=>{const s=new THREE.SpotLight(0xfff0d0,1.5,90,.5,.7,1.2);s.position.set(sx,.65,2.1);s.target.position.set(sx,0,30);car.add(s,s.target);lights.push(s)});
  return{group:car,wheels,bodyMat,cols:idx!==undefined?null:null,tailM,puffT,uS};
}
const cols=[0xff7a00,0xd6161c,0xf2f2f2,0x1e4fb8,0x1a1a1a,0xf2c230];let ci=0;
const player=buildCar(cols[0],false,-1);scene.add(player.group);
const cycleColor=()=>{ci=(ci+1)%cols.length;player.bodyMat.color.setHex(cols[ci]);const c=player.bodyMat.color;player.uS.value.setHex((c.r*.3+c.g*.59+c.b*.11)>.5?0x111111:0xffffff)};
el('col').addEventListener('pointerdown',e=>{e.preventDefault();cycleColor()});

// shared smoke/skid pool (reused across levels)
const puffTex=cvs(64,64,(c)=>{const g=c.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64)});
const PF=[];for(let i=0;i<60;i++){const m=new THREE.SpriteMaterial({map:puffTex,transparent:true,depthWrite:false,opacity:0}),s=new THREE.Sprite(m);s.visible=false;scene.add(s);PF.push({s,m,life:0,max:1,vx:0,vy:0,vz:0,g:1,o:.5,size:1})}
let pfi=0;
function puff(px,py,pz,vx,vy,vz,col,size,life,op,add){const p=PF[pfi];pfi=(pfi+1)%PF.length;p.s.visible=true;p.s.position.set(px,py,pz);p.vx=vx;p.vy=vy;p.vz=vz;p.m.color.setHex(col);p.m.blending=add?THREE.AdditiveBlending:THREE.NormalBlending;p.size=size;p.life=p.max=life;p.o=op;p.g=add?-.7:2.2}
const SK=900,skGeo=new THREE.PlaneGeometry(.34,1.1);skGeo.rotateX(-Math.PI/2);
const skidMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.5,depthWrite:false});
let skid=new THREE.InstancedMesh(skGeo,skidMat,SK),si=0,skidAcc=0;scene.add(skid);const dmS=new THREE.Object3D();

// ================= STATE / RACE =================
let level=0,unlocked=parseInt(localStorage.getItem('mf1_unlock')||'0',10)||0;
const best=JSON.parse(localStorage.getItem('mf1_best')||'{}');
const DEFK={left:'KeyA',right:'KeyD',gas:'KeyW',brake:'KeyS',boost:'ShiftLeft',drift:'Space',reset:'KeyT',rear:'KeyV',pause:'KeyP'};
let SET=JSON.parse(localStorage.getItem('mf1_settings')||'null')||{keys:Object.assign({},DEFK),mouseSteer:false,diff:'normal'};
SET.keys=Object.assign({},DEFK,SET.keys||{});
function saveSettings(){localStorage.setItem('mf1_settings',JSON.stringify(SET))}
let paused=false,rearView=false,mouseActive=false,mouseTarget=0,rebindAction=null;
const inp={l:0,r:0,gas:0,brk:0,hb:0,nit:0},kb={W:0,S:0};
const WMAX=170;let wheelAng=0,wheelHeld=false,wL=0,wId=-1;
let gear='D';const GS=['D','N','R'];
let x=0,z=0,h=0,v=0,vs=0,boost=100,steerV=0,wheelRot=0,idx=0,lat=0,prevIdx=0;
let lap=1,lapT0=0,raceT0=0,finished=false,place=1,running=false,cdActive=false;
let rivals=[];
const camPos=new THREE.Vector3();
let AC=null,eng=null,muted=false;

function initAudio(){if(AC){if(AC.state==='suspended')AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();
  const o1=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
  o1.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=900;g.gain.value=0;
  o1.connect(f);o2.connect(f);f.connect(g);g.connect(AC.destination);o1.start();o2.start();
  const nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=AC.createBufferSource();ns.buffer=nb;ns.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=.8;
  const ng=AC.createGain();ng.gain.value=0;ns.connect(bp);bp.connect(ng);ng.connect(AC.destination);ns.start();
  eng={o1,o2,g,f,ng}}catch(e){AC=null}}
addEventListener('pointerdown',initAudio);addEventListener('keydown',initAudio);
el('mu').addEventListener('pointerdown',e=>{e.preventDefault();muted=!muted;el('mu').textContent=muted?'🔇':'🔊'});

function fullscreen(){const d=document,r=d.documentElement;if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);return}
  try{const p=(r.requestFullscreen||r.webkitRequestFullscreen).call(r);if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}}
if(!document.fullscreenEnabled&&!document.webkitFullscreenEnabled)el('fs').style.display='none';
el('fs').addEventListener('pointerdown',e=>{e.preventDefault();fullscreen()});

// wheel input
const wa=ev=>{const r=wrapEl.getBoundingClientRect();return Math.atan2(ev.clientX-r.left-r.width/2,-(ev.clientY-r.top-r.height/2))*180/Math.PI};
const wheelEl=el('wheel'),wrapEl=el('wheelWrap');
wrapEl.addEventListener('pointerdown',ev=>{ev.preventDefault();if(wheelHeld)return;wrapEl.setPointerCapture(ev.pointerId);wheelHeld=true;wId=ev.pointerId;wL=wa(ev)});
wrapEl.addEventListener('pointermove',ev=>{if(!wheelHeld||ev.pointerId!==wId)return;
  const r=wrapEl.getBoundingClientRect();if(Math.hypot(ev.clientX-r.left-r.width/2,ev.clientY-r.top-r.height/2)<10)return;
  const a=wa(ev);let d=a-wL;if(d>180)d-=360;else if(d<-180)d+=360;wL=a;wheelAng=clamp(wheelAng-d,-WMAX,WMAX)});
['pointerup','pointercancel'].forEach(n=>wrapEl.addEventListener(n,ev=>{if(ev.pointerId===wId){wheelHeld=false;wId=-1}}));
['gas','brk','hb','nit'].forEach(id=>{const e=el(id);
  e.addEventListener('pointerdown',ev=>{ev.preventDefault();e.setPointerCapture(ev.pointerId);inp[id]=1});
  ['pointerup','pointercancel'].forEach(n=>e.addEventListener(n,()=>{inp[id]=0}))});
const knob=el('knob'),shiftEl=el('shift');
const gearTo=i=>{gear=GS[i];knob.style.top=(i*33.3+16.65)+'%';knob.textContent=gear};
const gearAt=ev=>{const r=shiftEl.getBoundingClientRect();gearTo(clamp(Math.floor((ev.clientY-r.top)/r.height*3),0,2))};
shiftEl.addEventListener('pointerdown',ev=>{ev.preventDefault();shiftEl.setPointerCapture(ev.pointerId);shiftEl._d=1;gearAt(ev)});
shiftEl.addEventListener('pointermove',ev=>{if(shiftEl._d)gearAt(ev)});
['pointerup','pointercancel'].forEach(n=>shiftEl.addEventListener(n,()=>{shiftEl._d=0}));
function keyForAction(a){return SET.keys[a]}
function togglePause(){if(!running&&!cdActive)return;paused=!paused;el('pauseOv').classList.toggle('show',paused);if(paused&&eng&&AC)eng.g.gain.setTargetAtTime(0,AC.currentTime,.05)}
function recoverCar(){if(!running||paused)return;nearest();const j=idx;x=pts[j].x;z=pts[j].z;h=Math.atan2(tan[j].x,tan[j].z);v=0;vs=0;steerV=0;wheelAng=0}
addEventListener('keydown',e=>{const c=e.code;
  if(rebindAction){e.preventDefault();if(c!=='Escape')SET.keys[rebindAction]=c;rebindAction=null;saveSettings();renderKeyRows();return}
  if(el('settings').classList.contains('show')){if(c==='Escape')closeSettings();return}
  if(el('menu').classList.contains('show')||el('res').classList.contains('show')){if(c==='Enter'&&el('menu').classList.contains('show'))startLevel(Math.max(0,Math.min(unlocked,level)));return}
  if(c==='Escape'||c===keyForAction('pause')){togglePause();return}
  if(paused)return;
  if(c===keyForAction('left')||c==='ArrowLeft')inp.l=1;
  if(c===keyForAction('right')||c==='ArrowRight')inp.r=1;
  if(c===keyForAction('gas')||c==='ArrowUp')kb.W=1;
  if(c===keyForAction('brake')||c==='ArrowDown')kb.S=1;
  if(c===keyForAction('drift')){inp.hb=1;e.preventDefault()}
  if(c===keyForAction('boost'))inp.nit=1;
  if(c===keyForAction('rear'))rearView=true;
  if(c===keyForAction('reset')&&!e.repeat)recoverCar();
  if(c==='KeyE')gearTo(0);if(c==='KeyN')gearTo(1);if(c==='KeyR')gearTo(2);
  if(c==='KeyC'&&!e.repeat)cycleColor();if(c==='KeyF'&&!e.repeat)fullscreen();
  if(c.indexOf('Arrow')===0)e.preventDefault()});
addEventListener('keyup',e=>{const c=e.code;
  if(c===keyForAction('left')||c==='ArrowLeft')inp.l=0;
  if(c===keyForAction('right')||c==='ArrowRight')inp.r=0;
  if(c===keyForAction('gas')||c==='ArrowUp')kb.W=0;
  if(c===keyForAction('brake')||c==='ArrowDown')kb.S=0;
  if(c===keyForAction('drift'))inp.hb=0;
  if(c===keyForAction('boost'))inp.nit=0;
  if(c===keyForAction('rear'))rearView=false;});
document.addEventListener('contextmenu',e=>e.preventDefault());
el('hm').addEventListener('pointerdown',e=>{e.preventDefault();goMenu()});
el('pauseBtn').addEventListener('pointerdown',e=>{e.preventDefault();togglePause()});
el('rst').addEventListener('pointerdown',e=>{e.preventDefault();recoverCar()});
el('rear').addEventListener('pointerdown',e=>{e.preventDefault();rearView=true});
['pointerup','pointercancel'].forEach(n=>el('rear').addEventListener(n,()=>rearView=false));
el('pResume').addEventListener('pointerdown',()=>togglePause());
el('pRestart').addEventListener('pointerdown',()=>{paused=false;el('pauseOv').classList.remove('show');startLevel(level)});
el('pSettings').addEventListener('pointerdown',()=>openSettings());
el('pMenu').addEventListener('pointerdown',()=>{paused=false;el('pauseOv').classList.remove('show');goMenu()});
// ---- mouse steering ----
addEventListener('pointermove',ev=>{if(!SET.mouseSteer||ev.pointerType!=='mouse'||!running||paused)return;mouseActive=true;const nx=(ev.clientX/innerWidth-0.5)*2;mouseTarget=clamp(nx*WMAX*1.1,-WMAX,WMAX)});
// ---- settings screen ----
function openSettings(){el('settings').classList.add('show');renderSettings()}
function closeSettings(){el('settings').classList.remove('show');rebindAction=null;renderKeyRows()}
el('stClose').addEventListener('pointerdown',closeSettings);
el('mSettings').addEventListener('pointerdown',()=>openSettings());
document.querySelectorAll('#diffSeg button').forEach(b=>b.addEventListener('pointerdown',()=>{SET.diff=b.dataset.v;saveSettings();renderSettings()}));
el('msToggle').addEventListener('pointerdown',()=>{SET.mouseSteer=!SET.mouseSteer;saveSettings();renderSettings()});
const ACT_LABEL={left:'STEER LEFT',right:'STEER RIGHT',gas:'GAS',brake:'BRAKE',boost:'BOOST',drift:'DRIFT',reset:'RESET CAR',rear:'LOOK BACK',pause:'PAUSE'};
function keyLabel(code){if(!code)return '–';return code.replace('Key','').replace('Digit','').replace('Arrow',' ').replace('Left',' L').replace('Right',' R')}
function renderKeyRows(){
  const wrap=el('kbRows');wrap.innerHTML='';
  Object.keys(ACT_LABEL).forEach(a=>{
    const row=document.createElement('div');row.className='row';row.style.marginTop='6px';
    const sp=document.createElement('span');sp.textContent=ACT_LABEL[a];
    const kbtn=document.createElement('div');kbtn.className='kbind'+(rebindAction===a?' wait':'');kbtn.textContent=rebindAction===a?'PRESS…':keyLabel(SET.keys[a]);
    kbtn.addEventListener('pointerdown',()=>{rebindAction=a;renderKeyRows()});
    row.appendChild(sp);row.appendChild(kbtn);wrap.appendChild(row);
  });
}
el('kbReset').addEventListener('pointerdown',()=>{SET.keys=Object.assign({},DEFK);saveSettings();renderKeyRows()});
function renderSettings(){
  document.querySelectorAll('#diffSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===SET.diff));
  el('msToggle').classList.toggle('on',SET.mouseSteer);
  renderKeyRows();
}
renderSettings();

// ================= MENU =================
function buildMenu(){
  const wrap=el('cards');wrap.innerHTML='';
  LV.forEach((lv,i)=>{
    const locked=i>unlocked,b=best[i];
    const c=document.createElement('div');c.className='card'+(locked?' lock':'');
    c.innerHTML='<small>LEVEL '+(i+1)+'</small><b>'+lv.name+'</b><i>'+lv.sub+'</i><div>'+lv.laps+' laps · '+lv.ai+' rivals</div><div class="st">'+(b?'★'.repeat(b.stars)+'☆'.repeat(3-b.stars):'— — —')+'</div>'+(locked?'<div class="lk">🔒</div>':'');
    if(!locked)c.addEventListener('pointerdown',()=>startLevel(i));
    wrap.appendChild(c);
  });
}
function goMenu(){running=false;cdActive=false;paused=false;el('pauseOv').classList.remove('show');el('settings').classList.remove('show');document.body.classList.remove('playing');el('menu').classList.add('show');el('res').classList.remove('show');buildMenu()}

// ================= AI =================
const DIFFM={easy:.86,normal:1,hard:1.16};
function makeRival(i,lv){
  const hue=RIVAL_HUES[i%RIVAL_HUES.length],c=new THREE.Color().setHSL(hue/360,.65,.5).getHex();
  const car=buildCar(c,true,i);scene.add(car.group);
  const spread=(i+1)*1.7;
  const off=((i%2)?1:-1)*(1+i*.28)*2.2+(Math.random()-.5)*.6;
  return{car,idx:(N-8-((i+1)*5)+N)%N,pidx:(N-8-((i+1)*5)+N)%N,lap:1,v:0,vs:0,h:0,wA:0,off,laneOff:off,skill:.78+Math.random()*.3,aiV:lv.aiV*DIFFM[SET.diff]*(.9+Math.random()*.25),lat:0,wheelRot:0,dist:0};
}
function stepRival(r,lv,dt){
  const la=Math.min(look.length-1,Math.floor(24+r.aiV*.35));
  let ti=(r.idx+la)%N;const tgt=pts[ti],tn=nor[ti];
  // Choose a passing lane when another car is close ahead.
  let desiredOff=r.off;
  const playerAhead=(idx-r.idx+N)%N;
  if(playerAhead>1&&playerAhead<26&&Math.abs(lat-r.off)<4.2){
    desiredOff=lat>=r.off?r.off-4.2:r.off+4.2;
  }
  for(const other of rivals){
    if(other===r)continue;
    const gap=(other.idx-r.idx+N)%N;
    if(gap>1&&gap<20&&Math.abs(other.laneOff-r.laneOff)<3.8){
      desiredOff=r.laneOff>=0?r.off-4.2:r.off+4.2;
    }
  }
  r.laneOff+=(desiredOff-r.laneOff)*Math.min(1,2.6*dt);
  const aimX=tgt.x+tn.x*r.laneOff,aimZ=tgt.z+tn.z*r.laneOff;
  const dx=aimX-r.car.group.position.x,dz=aimZ-r.car.group.position.z;
  const desH=Math.atan2(dx,dz);let dh=desH-r.h;dh=((dh+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
  r.wA+=(clamp(dh*2.4,-1,1)-r.wA)*Math.min(1,7*dt);
  const curveCap=Math.min(lv.maxV,look[r.idx]*r.skill,r.aiV);
  const targetV=curveCap*(1-Math.min(.6,Math.abs(r.wA)*.4));
  r.v+=clamp(targetV-r.v,-40*dt,26*dt);
  r.h+=r.wA*1.6*Math.max(-1,Math.min(1,r.v/8))*dt;
  r.car.group.position.x+=Math.sin(r.h)*r.v*dt;r.car.group.position.z+=Math.cos(r.h)*r.v*dt;
  r.car.group.rotation.y=r.h;
  let bi=r.idx,bd=1e12;for(let k=-20;k<=20;k++){const j=(r.idx+k+N)%N,ddx=pts[j].x-r.car.group.position.x,ddz=pts[j].z-r.car.group.position.z,d=ddx*ddx+ddz*ddz;if(d<bd){bd=d;bi=j}}
  if(r.pidx>N*.9&&bi<N*.1)r.lap++;r.pidx=bi;r.idx=bi;r.dist=(r.lap-1)*L+r.idx*ds;
  r.wheelRot+=r.v*dt/.38;
  r.car.wheels.forEach(w=>{w.spin.rotation.x=r.wheelRot;if(w.front)w.piv.rotation.y=r.wA*.4});
  r.car.tailM.forEach(m=>m.opacity=.35);
}

// Resolve simple bumper contact between the player and AI cars.
function resolveCarContacts(){
  const minGap=3.35,minGap2=minGap*minGap;
  const pushApart=(a,b,playerA,playerB)=>{
    let dx=b.x-a.x,dz=b.z-a.z,d2=dx*dx+dz*dz;
    if(d2>=minGap2)return false;
    if(d2<.0001){dx=.01;dz=0;d2=dx*dx}
    const d=Math.sqrt(d2),nx=dx/d,nz=dz/d,overlap=minGap-d;
    a.x-=nx*overlap*.52;a.z-=nz*overlap*.52;
    b.x+=nx*overlap*.52;b.z+=nz*overlap*.52;
    if(playerA){v=Math.sign(v)*Math.max(0,Math.abs(v)-7);vs*=.72}
    else if(a.rival)a.rival.v=Math.max(0,a.rival.v-5);
    if(playerB){v=Math.sign(v)*Math.max(0,Math.abs(v)-7);vs*=.72}
    else if(b.rival)b.rival.v=Math.max(0,b.rival.v-5);
    return true;
  };
  const player={get x(){return x},set x(n){x=n},get z(){return z},set z(n){z=n}};
  let hit=false;
  for(const r of rivals){
    const pos={get x(){return r.car.group.position.x},set x(n){r.car.group.position.x=n},
      get z(){return r.car.group.position.z},set z(n){r.car.group.position.z=n},rival:r};
    if(pushApart(player,pos,true,false))hit=true;
  }
  for(let i=0;i<rivals.length;i++)for(let j=i+1;j<rivals.length;j++){
    const a=rivals[i],b=rivals[j];
    const pa={get x(){return a.car.group.position.x},set x(n){a.car.group.position.x=n},
      get z(){return a.car.group.position.z},set z(n){a.car.group.position.z=n},rival:a};
    const pb={get x(){return b.car.group.position.x},set x(n){b.car.group.position.x=n},
      get z(){return b.car.group.position.z},set z(n){b.car.group.position.z=n},rival:b};
    pushApart(pa,pb,false,false);
  }
  if(hit)nearest();
}

// ================= LOOP HELPERS =================
function fmt(t){const m=Math.floor(t/60000),s=(t%60000)/1000;return m+':'+(s<10?'0':'')+s.toFixed(1)}
function resetRun(lv){
  const j=N-8;idx=j;prevIdx=j;x=pts[j].x;z=pts[j].z;h=Math.atan2(tan[j].x,tan[j].z);v=0;vs=0;steerV=0;wheelAng=0;boost=100;
  // Every race starts with clean timing and result state.
  lap=1;lapT0=0;raceT0=0;bestLapT=0;place=1;finished=false;gearTo(0);
  player.group.position.set(x,0,z);player.group.rotation.y=h;
  rivals.forEach(r=>scene.remove(r.car.group));
  rivals=Array.from({length:lv.ai},(_,i)=>makeRival(i,lv));
  camPos.set(x,5,z-9);
}
let cdTimer=0,cdN=3;
function startLevel(i){
  level=i;const lv=LV[i];
  buildWorld(i);resetRun(lv);
  document.body.classList.add('playing');el('menu').classList.remove('show');el('res').classList.remove('show');
  el('lapc').textContent='LAP 1/'+lv.laps;
  const b=best[i];el('best').textContent='BEST LAP '+(b&&b.lap?fmt(b.lap):'–');
  running=false;cdActive=true;cdN=3;cdTimer=0;el('cd').textContent='';el('cd').className='';
}
function endRace(){
  running=false;finished=true;
  const lv=LV[level],b=best[level]||{};
  const won=place<=3,stars=place===1?3:place===2?2:place===3?1:0;
  if(stars>(b.stars||0)||b.stars===undefined)best[level]={stars:Math.max(stars,b.stars||0),lap:Math.min(b.lap||1e12,bestLapT||1e12)};
  else if(bestLapT&&bestLapT<(b.lap||1e12))best[level].lap=bestLapT;
  localStorage.setItem('mf1_best',JSON.stringify(best));
  if(won&&level+1>unlocked&&level+1<LV.length){unlocked=level+1;localStorage.setItem('mf1_unlock',unlocked)}
  el('rt').textContent=won?'RACE COMPLETE':'RACE OVER';
  el('rp').textContent='P'+place;
  el('rs').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  el('rd').textContent=bestLapT?('BEST LAP '+fmt(bestLapT)):'';
  el('rn').style.display=(won&&level+1<LV.length)?'':'none';
  document.body.classList.remove('playing');el('res').classList.add('show');
}
el('rn').addEventListener('pointerdown',()=>startLevel(Math.min(LV.length-1,level+1)));
el('rr').addEventListener('pointerdown',()=>startLevel(level));
el('rm').addEventListener('pointerdown',goMenu);
let bestLapT=0;

// ================= MAIN LOOP =================
let prev=performance.now();
const spdEl=el('spd'),grEl=el('gr'),gasEl=el('gas'),brkEl=el('brk'),nitEl=el('nit'),hbEl=el('hb'),bstEl=el('bst'),arcEl=el('arc'),posEl=el('pos'),timerEl=el('timer'),lapcEl=el('lapc'),linesEl=el('lines');
function nearest(){let bi=idx,bd=1e12;for(let k=-30;k<=30;k++){const i=(idx+k+N)%N,dx=pts[i].x-x,dz=pts[i].z-z,d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i}}
  idx=bi;lat=(x-pts[idx].x)*nor[idx].x+(z-pts[idx].z)*nor[idx].z}
function tick(now){
  if(paused){prev=now;ren.render(scene,cam);requestAnimationFrame(tick);return}
  let dt=Math.min((now-prev)/1000,.05);prev=now;
  if(cdActive){cdTimer+=dt;const cd=el('cd');
    if(cdTimer>=1){cdTimer=0;cdN--;if(cdN>0){cd.textContent=cdN;cd.className='pop'}else{cd.textContent='GO!';cd.className='pop';cdActive=false;running=true;raceT0=performance.now();lapT0=raceT0}}
    else if(cdN===3&&cd.textContent===''){cd.textContent=cdN;cd.className='pop'}
  }
  if(running||cdActive){
    const lv=LV[level];
    if(running){
      if(kb.S&&gear==='D'&&v<.6)gearTo(2);
      if(kb.W&&gear==='R'&&v>-.6)gearTo(0);
      const R=gear==='R',dir=gear==='D'?1:R?-1:0;
      const gasE=(R?kb.S:kb.W)||inp.gas,brkE=(R?kb.W:kb.S)||inp.brk;
      const boosting=!!inp.nit&&boost>2&&dir===1;
      gasEl.classList.toggle('on',!!gasE);brkEl.classList.toggle('on',!!brkE);nitEl.classList.toggle('on',boosting);hbEl.classList.toggle('on',!!inp.hb);
      const al=Math.abs(lat),onT=al<=W/2+1.6,grav=al<=W/2+6.6,maxV=(onT?lv.maxV:grav?lv.maxV*.47:lv.maxV*.3)+(boosting?18:0);
      if(gasE&&dir)v+=dir*(v*dir<0?32:20)*dt;
      if(boosting)v+=26*dt;
      if(brkE)v-=Math.sign(v)*Math.min(Math.abs(v),38*dt);
      if((!gasE&&!brkE)||(!dir&&!brkE))v-=Math.sign(v)*Math.min(Math.abs(v),6*dt);
      if(!onT)v-=Math.sign(v)*Math.min(Math.abs(v),(grav?10:16)*dt);
      if(v>maxV)v=Math.max(maxV,v-30*dt);
      if(v<-12)v=-12;
      if(wheelHeld){}else if(SET.mouseSteer&&mouseActive){wheelAng+=(mouseTarget-wheelAng)*Math.min(1,14*dt)}else{const k=inp.l-inp.r;if(k)wheelAng=clamp(wheelAng+k*340*dt,-WMAX,WMAX);else wheelAng-=wheelAng*Math.min(1,8*dt)}
      wheelEl.style.transform='rotate('+(-wheelAng)+'deg)';
      const target=wheelAng/WMAX;
      steerV+=(target-steerV)*Math.min(1,8*dt);
      const hbk=inp.hb&&Math.abs(v)>8;
      const dh=steerV*1.7*Math.max(-1,Math.min(1,v/8))/(1+Math.abs(v)/45)*dt*(hbk?1.35:1);
      h+=dh;{const c=Math.cos(dh),s=Math.sin(dh),nv=v*c+vs*s;vs=vs*c-v*s;v=nv}
      const load=Math.abs(steerV)*Math.abs(v)/55;
      let gk=onT?lv.grip:5;gk-=6*Math.max(0,Math.min(1,(load-.55)/.35));
      if(hbk){gk=1.4;v-=Math.sign(v)*Math.min(Math.abs(v),9*dt)}
      vs-=vs*Math.min(1,Math.max(gk,.8)*dt);
      v-=Math.sign(v)*Math.min(Math.abs(v),Math.abs(vs)*.25*dt);
      x+=(Math.sin(h)*v+Math.cos(h)*vs)*dt;z+=(Math.cos(h)*v-Math.sin(h)*vs)*dt;
      prevIdx=idx;nearest();
      if(Math.abs(lat)>LIM){const ex=lat-Math.sign(lat)*LIM;x-=nor[idx].x*ex;z-=nor[idx].z*ex;v*=Math.max(0,1-4*dt);vs*=Math.max(0,1-4*dt);nearest()}
      pads.forEach(p=>{p.cd=Math.max(0,p.cd-dt);const d=(idx-p.i+N)%N;if(p.cd<=0&&(d<6||d>N-6)&&Math.abs(lat)<W/2){boost=100;p.cd=1.6;puff(x,.6,z,0,4,0,0xffcf2e,3,.5,.9,true)}});
      if(prevIdx>N*.9&&idx<N*.1&&v>0){const t=performance.now(),lt=t-lapT0;if(lt>3000){if(!bestLapT||lt<bestLapT)bestLapT=lt;lapT0=t;lap++;
        if(lap>lv.laps){place=computePlace();endRace()}else lapcEl.textContent='LAP '+lap+'/'+lv.laps}}
      // Main timer is total race time; best-lap timing remains independent.
      timerEl.textContent=fmt(performance.now()-raceT0);el('best').textContent='BEST LAP '+(bestLapT?fmt(bestLapT):'–');
      player.group.position.set(x,0,z);player.group.rotation.y=h;
      wheelRot+=v*dt/.38;
      player.wheels.forEach(w=>{w.spin.rotation.x=wheelRot;if(w.front)w.piv.rotation.y=steerV*.4});
      const rw=[D.w[0],D.w[1]].map(p=>[x+p[0]*Math.cos(h)+p[2]*Math.sin(h),z-p[0]*Math.sin(h)+p[2]*Math.cos(h)]);
      const slip=Math.abs(vs),spdA=Math.abs(v),sliding=(slip>5&&spdA>8)||(hbk&&spdA>10)||(brkE&&spdA>28);
      boost=boosting?Math.max(0,boost-38*dt):Math.min(100,boost+(6+(slip>5?16:0))*dt);bstEl.style.width=boost+'%';
      if(sliding&&onT){skidAcc+=spdA*dt;if(skidAcc>.7){skidAcc=0;const va=Math.atan2(Math.sin(h)*v+Math.cos(h)*vs,Math.cos(h)*v-Math.sin(h)*vs);
        rw.forEach(p=>{dmS.position.set(p[0],.08,p[1]);dmS.rotation.set(0,va,0);dmS.scale.set(1,1,1);dmS.updateMatrix();skid.setMatrixAt(si,dmS.matrix);si=(si+1)%SK});skid.instanceMatrix.needsUpdate=true}
        if(Math.random()<.7){const p=rw[Math.random()<.5?0:1];puff(p[0],.5,p[1],(Math.random()-.5)*2,1.2,(Math.random()-.5)*2,0xe8e8e8,2.2,.9,.5,false)}}
      else if(!onT&&spdA>10&&Math.random()<.5){const p=rw[Math.random()<.5?0:1];puff(p[0],.4,p[1],(Math.random()-.5)*3,1.5,(Math.random()-.5)*3,grav?0xc9b48a:0x7fa060,2,.8,.45,false)}
      if(boosting){[-.3,.3].forEach(o=>puff(x-Math.sin(h)*2.4+Math.cos(h)*o,.4,z-Math.cos(h)*2.4-Math.sin(h)*o,-Math.sin(h)*10,.2,-Math.cos(h)*10,0xff9a2a,1.5,.25,.9,true));
        linesEl.style.opacity=.55;arcEl.style.stroke='#fff'}else{linesEl.style.opacity=0}
      player.tailM.forEach(m=>{m.opacity=brkE?1:.35});
      arcEl.setAttribute('stroke-dashoffset',220-220*Math.min(1,spdA/lv.maxV));
      if(eng&&AC){const gn=Math.min(6,1+Math.floor(spdA/10)),fr=Math.max(0,Math.min(1,(spdA-(gn-1)*10)/10));
        let rpm=(dir||!gasE)?.18+.75*fr:.85;rpm=Math.min(1,rpm+(gasE?.08:0)+(boosting?.05:0));
        const tt=AC.currentTime,fq=38+rpm*150;eng.o1.frequency.setTargetAtTime(fq,tt,.04);eng.o2.frequency.setTargetAtTime(fq*.5,tt,.04);
        eng.f.frequency.setTargetAtTime(400+rpm*1600+(gasE?500:0),tt,.05);
        eng.g.gain.setTargetAtTime(muted?0:.035+.05*(gasE?1:.3)+.03*rpm+(boosting?.03:0),tt,.05);
        eng.ng.gain.setTargetAtTime(muted?0:(sliding?Math.min(.12,.03+slip*.006):(onT?0:Math.min(.06,spdA*.002))),tt,.05)}
      spdEl.firstChild.nodeValue=Math.round(Math.abs(v)*3.6);
      grEl.textContent=gear==='D'?'D'+Math.min(6,1+Math.floor(Math.abs(v)/9)):gear;
      rivals.forEach(r=>stepRival(r,lv,dt));
      resolveCarContacts();
      player.group.position.set(x,0,z);
      place=computePlace();posEl.firstChild.nodeValue='P'+place;
      drawMini();
    }
    for(const p of PF){if(p.life>0){p.life-=dt;p.s.position.x+=p.vx*dt;p.s.position.y+=p.vy*dt;p.s.position.z+=p.vz*dt;const f=1-p.life/p.max,sc=p.size*(1+f*p.g);p.s.scale.set(sc,sc,1);p.m.opacity=p.o*Math.max(0,1-f);if(p.life<=0)p.s.visible=false}}
    const fx=Math.sin(h),fz=Math.cos(h),spdA=Math.abs(v),boostingCam=!!inp.nit&&boost>2&&gear==='D';
    camPos.lerp(new THREE.Vector3(x-fx*9.5,4.4,z-fz*9.5),Math.min(1,5*dt));
    cam.position.copy(camPos);if(boostingCam){cam.position.x+=(Math.random()-.5)*.12;cam.position.y+=(Math.random()-.5)*.12}
    const lx=rearView?-fx:fx,lz=rearView?-fz:fz;
    cam.lookAt(x+lx*6,1.4,z+lz*6);
    cam.fov=62+Math.min(14,spdA/4)+(boostingCam?8:0);cam.updateProjectionMatrix();
    sky.position.copy(cam.position);sunSp.position.copy(cam.position).addScaledVector(SUND,1100);
  }
  ren.render(scene,cam);requestAnimationFrame(tick);
}
function computePlace(){const mine=(lap-1)*L+idx*ds;let p=1;rivals.forEach(r=>{if(r.dist>mine)p++});return p}
function drawMini(){
  const c=el('mm'),g=c.getContext('2d');g.clearRect(0,0,208,208);g.drawImage(mmBg,0,0);
  g.fillStyle='#ff8000';const px=mm.ox+(x-mm.a0)*mm.S,pz=mm.oz+(z-mm.b0)*mm.S;g.beginPath();g.arc(px,pz,5,0,7);g.fill();
  g.fillStyle='#cfd3da';rivals.forEach(r=>{const rx=mm.ox+(r.car.group.position.x-mm.a0)*mm.S,rz=mm.oz+(r.car.group.position.z-mm.b0)*mm.S;g.beginPath();g.arc(rx,rz,3.2,0,7);g.fill()});
}
addEventListener('resize',()=>{ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
buildMenu();el('menu').classList.add('show');
requestAnimationFrame(tick);
