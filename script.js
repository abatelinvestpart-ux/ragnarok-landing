(function(){
  "use strict";
  var doc=document.documentElement; doc.classList.add("js");
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||window.matchMedia("(pointer:coarse) and (max-width:900px)").matches;
  if(isMobile) doc.classList.add("is-mobile");

  /* ---- CTA click tracking (no URL params added) ---- */
  window.dataLayer=window.dataLayer||[];
  document.querySelectorAll("a.cta").forEach(function(a){
    a.addEventListener("click",function(){
      window.dataLayer.push({event:"cta_click",cta_position:a.getAttribute("data-cta"),device:isMobile?"mobile":"desktop"});
    });
  });

  /* ---- copy link for mobile visitors ---- */
  document.querySelectorAll(".copylink").forEach(function(b){
    b.addEventListener("click",function(){
      var url=location.href.split("#")[0];
      var done=function(){b.textContent="Link copied";window.dataLayer.push({event:"copy_link"});setTimeout(function(){b.textContent="Copy link"},2200)};
      try{navigator.clipboard.writeText(url).then(done,function(){b.textContent=url})}catch(e){b.textContent=url}
    });
  });

  /* ---- sticky CTA appears after hero ---- */
  var topbar=document.getElementById("topbar"), heroCta=document.querySelector('[data-cta="hero"]');
  if("IntersectionObserver" in window && heroCta){
    new IntersectionObserver(function(es){topbar.classList.toggle("show-cta",!es[0].isIntersecting)},{rootMargin:"-64px 0px 0px 0px"}).observe(heroCta);
  } else topbar.classList.add("show-cta");

  /* ---- hero video: load after page is ready, skip on mobile/data saver/reduced motion ---- */
  var hv=document.getElementById("heroVideo");
  var saveData=navigator.connection&&navigator.connection.saveData;
  if(hv && !reduce && !saveData && !isMobile){
    window.addEventListener("load",function(){
      setTimeout(function(){
        hv.src="assets/videos/hero-loop.mp4";
        hv.addEventListener("canplay",function(){hv.classList.add("ready");var p=hv.play();if(p&&p.catch)p.catch(function(){})},{once:true});
        hv.load();
      },400);
    });
  }

  /* ---- hero sky: drifting gel bubbles + rune sparkles (canvas) ---- */
  var sky=document.getElementById("sky");
  if(sky && !reduce){
    var c=sky.getContext("2d"),W,H,dpr=Math.min(window.devicePixelRatio||1,2),parts=[],run=true;
    var cols=["255,160,190","242,179,61","141,176,255","255,210,122"];
    function size(){var r=sky.getBoundingClientRect();W=r.width;H=r.height;sky.width=W*dpr;sky.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}
    function mk(init){var gel=Math.random()<.28;return{x:Math.random()*W,y:init?Math.random()*H:H+20,r:gel?6+Math.random()*10:1+Math.random()*2.2,gel:gel,vy:gel?.25+Math.random()*.35:.3+Math.random()*.6,ph:Math.random()*6.28,col:cols[gel?0:1+Math.floor(Math.random()*3)],a:.35+Math.random()*.5}}
    size();var N=Math.round(Math.min(70,W/18));for(var i=0;i<N;i++)parts.push(mk(true));
    window.addEventListener("resize",size);
    new IntersectionObserver(function(es){run=es[0].isIntersecting;if(run)requestAnimationFrame(tick)}).observe(sky);
    function tick(t){
      if(!run)return;
      c.clearRect(0,0,W,H);
      for(var i=0;i<parts.length;i++){var p=parts[i];p.y-=p.vy;p.ph+=.02;var x=p.x+Math.sin(p.ph)*(p.gel?14:6);
        if(p.gel){var sq=1+Math.sin(p.ph*2)*.08;c.save();c.translate(x,p.y);c.scale(1/sq,sq);
          var g=c.createRadialGradient(-p.r*.35,-p.r*.4,p.r*.1,0,0,p.r);g.addColorStop(0,"rgba(255,255,255,"+(p.a*.9)+")");g.addColorStop(.35,"rgba("+p.col+","+p.a*.7+")");g.addColorStop(1,"rgba("+p.col+",0.05)");
          c.fillStyle=g;c.beginPath();c.arc(0,0,p.r,0,6.283);c.fill();c.restore();}
        else{var tw=.5+.5*Math.sin(p.ph*3);c.fillStyle="rgba("+p.col+","+(p.a*tw)+")";c.beginPath();c.arc(x,p.y,p.r,0,6.283);c.fill();
          if(p.r>2.4){c.strokeStyle="rgba("+p.col+","+(p.a*tw*.6)+")";c.lineWidth=1;c.beginPath();c.moveTo(x-6,p.y);c.lineTo(x+6,p.y);c.moveTo(x,p.y-6);c.lineTo(x,p.y+6);c.stroke()}}
        if(p.y<-30)parts[i]=mk(false);}
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- section reveal: content is visible at rest; it only slides up a little ---- */
  if("IntersectionObserver" in window && !reduce){
    var rvs=[].slice.call(document.querySelectorAll(".rv"));
    var vh=window.innerHeight;
    rvs.forEach(function(el){if(el.getBoundingClientRect().top>vh)el.classList.add("pre")});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
    rvs.forEach(function(el){io.observe(el)});
  }

  /* ---- safe refine mini-game ---- */
  var lvl=0,gem=document.getElementById("gem"),lvlEl=document.getElementById("lvl"),log=document.getElementById("log"),btn=document.getElementById("refineBtn");
  var sc=document.getElementById("sparks"),sx=sc.getContext("2d"),sp=[],animating=false;
  function burst(n,col){for(var i=0;i<n;i++){var a=Math.random()*6.283,v=2+Math.random()*5;sp.push({x:210,y:210,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,col:col})}if(!animating&&!reduce){animating=true;requestAnimationFrame(sparkTick)}}
  function sparkTick(){sx.clearRect(0,0,420,420);for(var i=sp.length-1;i>=0;i--){var s=sp[i];s.x+=s.vx;s.y+=s.vy;s.vy+=.12;s.l-=.025;if(s.l<=0){sp.splice(i,1);continue}sx.fillStyle="rgba("+s.col+","+s.l+")";sx.beginPath();sx.arc(s.x,s.y,2.6,0,6.283);sx.fill()}if(sp.length)requestAnimationFrame(sparkTick);else{animating=false;sx.clearRect(0,0,420,420)}}
  function chance(l){return Math.max(.22,1-l*.065)}
  btn.addEventListener("click",function(){
    if(lvl>=15){log.innerHTML="<b class='ok'>+15 reached.</b> That's the cap. Imagine this on your real gear.";return}
    gem.classList.remove("hit","fail");void gem.offsetWidth;
    if(Math.random()<chance(lvl)){lvl++;gem.classList.add("hit");burst(26,"242,179,61");
      log.innerHTML=lvl===15?"<b class='ok'>Success! +15.</b> Max refine, zero broken gear.":"<b class='ok'>Success!</b> Now at +"+lvl+".";}
    else{gem.classList.add("fail");burst(10,"141,176,255");
      log.innerHTML="<b class='no'>Failed.</b> Gear still at +"+lvl+". No break, no level loss. Try again.";}
    lvlEl.textContent="+"+lvl;
  });
  document.getElementById("resetBtn").addEventListener("click",function(){lvl=0;lvlEl.textContent="+0";log.textContent="Your weapon is at +0. Hit Refine."});

  /* ---- offline idle slider ---- */
  var hours=document.getElementById("hours"),hOut=document.getElementById("hoursOut"),fill=document.getElementById("fill"),orb=document.getElementById("orb"),scene=document.getElementById("idleScene");
  var icons=["💎","🪙","📜","🧪","🍎","⚔️","🪙","💎","🧪","📜","🪙","🛡️"];
  function idle(){var h=+hours.value;hOut.textContent=h+" h";fill.style.setProperty("--fill",Math.round(h/12*100));
    var t=(h-1)/11;orb.style.setProperty("--t",t);orb.style.setProperty("--a",(t*180)+"deg");
    var night=h>=6;orb.style.background=night?"radial-gradient(circle at 35% 35%,#FFFFFF,#CFE0FF 60%,#8DB0FF)":"";orb.style.boxShadow=night?"0 0 30px #8DB0FF":"";
    scene.querySelectorAll(".loot").forEach(function(n){n.remove()});
    for(var i=0;i<h;i++){var s=document.createElement("span");s.className="loot";s.textContent=icons[i];s.style.left=(4+i*7.8)+"%";s.style.animationDelay=(i*.15)+"s";scene.appendChild(s)}}
  hours.addEventListener("input",idle);idle();

  /* ---- trailer player (loads only on click) ---- */
  var screen=document.getElementById("screen"),pb=document.getElementById("playBtn"),vp=document.getElementById("vposter"),vl=document.getElementById("vlabel");
  var cur={src:"assets/videos/trailer-gameplay.mp4"};
  function play(){var v=document.createElement("video");v.src=cur.src;v.controls=true;v.autoplay=true;v.playsInline=true;v.setAttribute("aria-label",vl.textContent);
    screen.innerHTML="";screen.appendChild(v);var p=v.play();if(p&&p.catch)p.catch(function(){});window.dataLayer.push({event:"trailer_play",trailer:cur.src})}
  pb.addEventListener("click",play);
  document.querySelectorAll(".tab").forEach(function(t){t.addEventListener("click",function(){
    document.querySelectorAll(".tab").forEach(function(x){x.setAttribute("aria-selected","false")});t.setAttribute("aria-selected","true");
    cur.src=t.dataset.src;
    screen.innerHTML="";var img=document.createElement("img");img.src=t.dataset.poster;img.alt=t.dataset.label+" preview";screen.appendChild(img);
    pb=document.createElement("button");pb.className="playbtn";pb.type="button";pb.setAttribute("aria-label","Play the trailer");
    pb.innerHTML='<span><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5Z"/></svg></span><em>'+t.dataset.label+'</em>';
    vl={textContent:t.dataset.label};pb.addEventListener("click",play);screen.appendChild(pb);
  })});

  /* ---- gallery lightbox ---- */
  var lb=document.getElementById("lightbox"),lbImg=document.getElementById("lbImg"),lbCap=document.getElementById("lbCap");
  function openShot(f){var im=f.querySelector("img");lbImg.src=f.dataset.full;lbImg.alt=im.alt;lbCap.textContent=f.querySelector("figcaption").textContent;
    if(lb.showModal)lb.showModal();else lb.setAttribute("open","")}
  document.querySelectorAll(".shot").forEach(function(f){f.addEventListener("click",function(){openShot(f)});f.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openShot(f)}})});
  document.getElementById("lbClose").addEventListener("click",function(){lb.close?lb.close():lb.removeAttribute("open")});
  lb.addEventListener("click",function(e){if(e.target===lb)lb.close()});

  /* ---- party roles ---- */
  var roles={tank:{t:"Tank",p:"Hold the boss's attention and soak the hits while your party lays into it.",img:"assets/images/ss4.webp",alt:"Party fighting an MVP boss in an arena"},
    heal:{t:"Healer",p:"Keep everyone standing through the boss's big attacks. The party lives or wipes with you.",img:"assets/images/ss3.webp",alt:"A party gathered on an airship deck"},
    dps:{t:"Damage",p:"Burst, summon or control. Stack skill combos and turn the toughest boss into loot.",img:"assets/images/ss7.webp",alt:"Big damage numbers against glowing monsters"}};
  var rImg=document.getElementById("roleImg"),rCard=document.getElementById("roleCard");
  document.querySelectorAll(".role").forEach(function(b){b.addEventListener("click",function(){
    document.querySelectorAll(".role").forEach(function(x){x.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");
    var r=roles[b.dataset.role];rCard.innerHTML="<h3>"+r.t+"</h3><p>"+r.p+"</p>";rImg.style.opacity=0;
    setTimeout(function(){rImg.src=r.img;rImg.alt=r.alt;rImg.style.opacity=1},reduce?0:200);
  })});
  /* druid forms cycle */
  var forms=[].slice.call(document.querySelectorAll("#forms span")),fi=0;
  if(!reduce)setInterval(function(){forms[fi].classList.remove("on");fi=(fi+1)%forms.length;forms[fi].classList.add("on")},1800);

  /* ---- RAM check ---- */
  var ramOut=document.getElementById("ramOut");
  var ramMsg={"8":"Below the 12 GB minimum. The game may not run well on this PC.","12":"You meet the minimum. Close other apps for smoother play.","16":"You're at the recommended spec. Good to go.","0":"On Windows: press Ctrl + Shift + Esc, open Performance, then Memory. The total is at the top right."};
  document.querySelectorAll(".ram-opts button").forEach(function(b){b.addEventListener("click",function(){
    document.querySelectorAll(".ram-opts button").forEach(function(x){x.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");
    ramOut.textContent=ramMsg[b.dataset.ram];window.dataLayer.push({event:"ram_check",ram:b.dataset.ram});
  })});
})();
