const P=t=>(Math.floor(t)%12*150%360+360)%360;function B(t){const a=l=>{const b=(l+t/30)%12;return .5-.5*Math.max(-1,Math.min(b-3,9-b,1))},f=l=>l<=.04045?l/12.92:((l+.055)/1.055)**2.4,[o,c,s]=[a(0),a(8),a(4)].map(f),r=Math.cbrt(.4122214708*o+.5363295*c+.0514459929*s),p=Math.cbrt(.2119034982*o+.6806995451*c+.1073969566*s),w=Math.cbrt(.0883024619*o+.2817188376*c+.6299787005*s),M=1.9779984951*r-2.428592205*p+.4505937099*w,R=.0259040371*r+.7827717662*p-.808675766*w;return(Math.atan2(R,M)*180/Math.PI+360)%360}function D(t){document.documentElement.style.setProperty("--hue",B(P(t)).toFixed(1))}const H=[.5,.5],O=6,v=document.querySelector(".hour-field"),x=v.closest(".hero"),n=v.querySelector("canvas"),_=document.querySelector("[data-readout-time]"),k=document.querySelector("[data-readout-hue]"),U=document.querySelector(".readout"),m=matchMedia("(prefers-reduced-motion: reduce)"),$=matchMedia("(pointer: fine)"),T=()=>{const t=new Date;return t.getHours()+t.getMinutes()/60+t.getSeconds()/3600};let u=T(),E=null;function q(t){const a=Math.floor(t)%24,f=Math.floor(t%1*60),o=P(a),c=P(a+1);return D(a),v.style.setProperty("--h-now",String(o)),v.style.setProperty("--h-next",String(c)),v.style.setProperty("--sweep",`${(t%1).toFixed(4)}turn`),_&&(_.textContent=`${String(a).padStart(2,"0")}:${String(f).padStart(2,"0")}`),k&&(k.textContent=`${o}°`),{hNow:o,hNext:c,frac:t%1}}U?.removeAttribute("hidden");let A=q(u);const e=n.getContext("webgl",{antialias:!1,premultipliedAlpha:!1});if(e){const t="attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }",a=`
      precision highp float;
      uniform vec2 uRes; uniform vec2 uCenter; uniform float uCell;
      uniform float uNow; uniform float uNext; uniform float uFrac; uniform float uTime;
      vec3 hsl(float h, float s, float l) {
        vec3 k = mod(vec3(0.0, 8.0, 4.0) + h / 30.0, 12.0);
        return l - s * min(l, 1.0 - l) * clamp(min(k - 3.0, 9.0 - k), -1.0, 1.0);
      }
      float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
      float bayer8(vec2 a) {
        return bayer2(0.25 * a) * 0.0625 + bayer2(0.5 * a) * 0.25 + bayer2(a);
      }
      void main() {
        vec2 cell = floor(gl_FragCoord.xy / uCell);
        vec2 frag = (cell + 0.5) * uCell;
        vec2 d = frag - uCenter;
        float ang = fract(atan(d.x, d.y) / 6.2831853);           // 0 at twelve o'clock, clockwise
        float r = length(d) / length(uRes);
        float edge = uFrac + 0.004 * sin(uTime * 0.6 + r * 18.0);  // the wet edge of the paint
        float soft = 0.012 + 0.03 * r;
        float wedge = smoothstep(edge + soft, edge - soft, ang) * step(0.0005, uFrac);
        float l = mix(0.6, 0.44, smoothstep(0.0, 0.8, r));
        vec3 c = mix(hsl(uNow, 0.72, l), hsl(uNext, 0.72, l), wedge);
        float t = bayer8(cell) - 0.5;
        vec3 q = clamp(floor(c * 3.0 + 0.5 + t) / 3.0, 0.0, 1.0);  // four levels per channel
        gl_FragColor = vec4(q, 1.0);
      }`,f=(c,s)=>{const r=e.createShader(c);return e.shaderSource(r,s),e.compileShader(r),r},o=e.createProgram();if(e.attachShader(o,f(e.VERTEX_SHADER,t)),e.attachShader(o,f(e.FRAGMENT_SHADER,a)),e.linkProgram(o),e.getProgramParameter(o,e.LINK_STATUS)){e.useProgram(o);const c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const s=e.getAttribLocation(o,"p");e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0);const r=i=>e.getUniformLocation(o,i),p=r("uRes"),w=r("uCenter"),M=r("uCell"),R=r("uNow"),l=r("uNext"),b=r("uFrac"),I=r("uTime");let y=1;const N=()=>{y=Math.min(window.devicePixelRatio||1,1.5),n.width=Math.round(n.clientWidth*y),n.height=Math.round(n.clientHeight*y),e.viewport(0,0,n.width,n.height)},C=i=>{e.uniform2f(p,n.width,n.height),e.uniform2f(w,H[0]*n.width,(1-H[1])*n.height),e.uniform1f(M,Math.max(1,Math.round(O*y))),e.uniform1f(R,A.hNow),e.uniform1f(l,A.hNext),e.uniform1f(b,A.frac),e.uniform1f(I,m.matches?0:i/1e3),e.drawArrays(e.TRIANGLES,0,3)};let L=!0,F=0;const S=i=>{F=0;const d=E??T();let g=(d-u+36)%24-12;m.matches||Math.abs(g)<5e-4?(g=d-u,u=d):u=(u+g*.12+24)%24,A=q(u),C(i),m.matches||h()},h=()=>{!F&&L&&document.visibilityState==="visible"&&(F=requestAnimationFrame(S))};N(),C(0),n.classList.add("ready"),h(),new ResizeObserver(()=>{N(),C(performance.now())}).observe(n),new IntersectionObserver(([i])=>{L=i.isIntersecting,h()}).observe(x),document.addEventListener("visibilitychange",h),setInterval(()=>{m.matches&&S(performance.now())},6e4),x.addEventListener("pointermove",i=>{if(!$.matches)return;const d=x.getBoundingClientRect(),g=Math.min(Math.max((i.clientX-d.left)/d.width,0),.9999);E=Math.floor(T()/12)*12+g*12,m.matches?S(performance.now()):h()}),x.addEventListener("pointerleave",()=>{E=null,m.matches?S(performance.now()):h()})}}
