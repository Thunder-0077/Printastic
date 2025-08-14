// Main interactions & shared utilities
const qs = sel => document.querySelector(sel);
const qsa = sel => [...document.querySelectorAll(sel)];

// Mobile nav
const hamburger = qs('#hamburger');
const mainNav = qs('#mainNav');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
}
qsa('.main-nav a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  hamburger?.classList.remove('open');
}));

// Remove theme toggle logic
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) themeToggle.style.display = "none";
document.documentElement.removeAttribute('data-theme');

// Year
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Intersection reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
},{threshold:.3});
qsa('[data-observe]').forEach(el => observer.observe(el));

// Metrics counter (About page)
qsa('.metric .num').forEach(numEl => {
  const target = +numEl.dataset.count;
  if (!target) return;
  const step = target / 120;
  const update = () => {
    const val = +numEl.textContent;
    if (val < target) {
      numEl.textContent = Math.min(target, Math.round(val + step));
      requestAnimationFrame(update);
    }
  };
  update();
});

document.addEventListener('DOMContentLoaded', () => {
  const metrics = document.querySelectorAll('.metric .num[data-count]');
  const animateCount = (el) => {
    const target = +el.getAttribute('data-count');
    let start = 0;
    const duration = 1200;
    const step = Math.max(1, Math.floor(target / 60));
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  metrics.forEach(el => observer.observe(el));
});

// Hero canvas subtle particles
const heroCanvas = qs('#heroCanvas');
if (heroCanvas) {
  const ctx = heroCanvas.getContext('2d');
  let w,h,particles=[]; const COUNT = 48;
  const resize = () => { w = heroCanvas.width = window.innerWidth; h = heroCanvas.height = heroCanvas.offsetHeight; };
  window.addEventListener('resize', resize); resize();
  const init = () => { particles = [...Array(COUNT)].map(()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+0.5,dx:(Math.random()-.5)*.25,dy:(Math.random()-.5)*.25}));};
  init();
  const loop = () => {
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p=>{
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0||p.x>w) p.dx*=-1;
      if(p.y<0||p.y>h) p.dy*=-1;
      const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,'rgba(18,123,255,.8)');
      g.addColorStop(1,'rgba(18,123,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(loop);
  };
  loop();
}

// Hero mockup click-to-focus
const mockups = qsa('.hero-showcase .mockup');
if(mockups.length){
  mockups.forEach((m,i)=>{
    m.tabIndex = 0; // make focusable
    m.addEventListener('click',()=>bringToFront(m));
    m.addEventListener('keypress',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); bringToFront(m);} });
  });
  const bringToFront = (el)=>{
    mockups.forEach(m=>m.classList.remove('active'));
    el.classList.add('active');
    // reorder z-index for stacked look (clicked on top)
    let z = 10;
    mockups.filter(m=>m!==el).forEach(m=>{ m.style.zIndex = z++; });
    el.style.zIndex = 50;
  };
  // set default active (middle if exists)
  const middle = mockups[Math.floor(mockups.length/2)];
  if(middle) middle.click();
}

/* Hero slider init */
(function(){
  const host = document.getElementById('heroSlider');
  if(!host) return;
  const slides = [...host.querySelectorAll('.hero-slide')];
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn = host.querySelector('.hero-prev');
  const nextBtn = host.querySelector('.hero-next');
  let idx = 0, timer = null;
  const INTERVAL = 5000;

  function buildDots(){
    slides.forEach((_,i)=>{
      const b=document.createElement('button');
      b.type='button';
      b.setAttribute('aria-label','Go to slide '+(i+1));
      b.addEventListener('click',()=>go(i,true));
      dotsWrap.appendChild(b);
    });
  }
  function go(i,user){
    idx=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle('is-active',n===idx));
    [...dotsWrap.children].forEach((d,n)=>{
      if(n===idx) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current');
    });
    if(user) restart();
  }
  function next(){ go(idx+1,false); }
  function prev(){ go(idx-1,false); }
  function restart(){ clearInterval(timer); timer=setInterval(next,INTERVAL); }
  function pause(){ clearInterval(timer); }

  buildDots();
  go(0,false);
  restart();

  nextBtn.addEventListener('click',()=>go(idx+1,true));
  prevBtn.addEventListener('click',()=>go(idx-1,true));

  host.addEventListener('mouseenter',pause);
  host.addEventListener('mouseleave',restart);
  host.addEventListener('focusin',pause);
  host.addEventListener('focusout',restart);

  host.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){ e.preventDefault(); next(); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); prev(); }
  });

  // Swipe (touch)
  let sx=null;
  host.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; },{passive:true});
  host.addEventListener('touchend',e=>{
    if(sx==null) return;
    const dx=e.changedTouches[0].clientX - sx;
    if(Math.abs(dx)>45){ dx<0 ? next() : prev(); }
    sx=null;
  });
})();

/* Hero slider auto cycle (5s) */
(function(){
  const sliderWrap = document.querySelector('.hero-slides');
  if(!sliderWrap) return;
  const slides = [...sliderWrap.querySelectorAll('.hero-slide')];
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  let idx = 0, timer;

  function buildDots(){
    if(!dotsWrap) return;
    dotsWrap.innerHTML = '';
    slides.forEach((_,i)=>{
      const b=document.createElement('button');
      b.type='button';
      b.setAttribute('role','tab');
      b.setAttribute('aria-label','Show slide '+(i+1));
      b.addEventListener('click',()=>go(i,true));
      dotsWrap.appendChild(b);
    });
  }

  function go(i,user){
    idx = (i + slides.length) % slides.length;
    slides.forEach((s,n)=>s.classList.toggle('is-active', n===idx));
    if(dotsWrap){
      [...dotsWrap.children].forEach((d,n)=>{
        if(n===idx) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current');
      });
    }
    if(user) restart();
  }

  function next(){ go(idx+1,false); }
  function prev(){ go(idx-1,false); }

  function restart(){
    clearInterval(timer);
    timer = setInterval(next,5000); // 5s auto scroll
  }
  function pause(){ clearInterval(timer); }

  buildDots();
  go(0,false);
  restart();

  nextBtn?.addEventListener('click',()=>go(idx+1,true));
  prevBtn?.addEventListener('click',()=>go(idx-1,true));

  const host = document.getElementById('heroSlider') || sliderWrap;
  host.addEventListener('mouseenter',pause);
  host.addEventListener('mouseleave',restart);
  host.addEventListener('focusin',pause);
  host.addEventListener('focusout',restart);

  host.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){ e.preventDefault(); next(); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); prev(); }
  });

  // Simple swipe
  let startX=null;
  host.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; },{passive:true});
  host.addEventListener('touchend',e=>{
    if(startX==null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx)>40){ dx<0?next():prev(); }
    startX=null;
  });
})();

// Accessibility: close nav with ESC
window.addEventListener('keydown', e => { if(e.key==='Escape'){ mainNav?.classList.remove('open'); hamburger?.classList.remove('open'); }});

// Animate gallery and about images on entrance
document.addEventListener('DOMContentLoaded', () => {
  const galleryItems = document.querySelectorAll('.masonry-item, .stacked-photos .ph');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  galleryItems.forEach(el => observer.observe(el));
  
  // Animate sections on entrance
  const observedEls = document.querySelectorAll('[data-observe]');
  const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  observedEls.forEach(el => observer2.observe(el));
  
  // Sticky nav shadow on scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

// Scroll-triggered staggered animations for sections
function staggerReveal(selector, effect = 'fade-up', stagger = 120) {
  const els = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible', effect);
        }, i * stagger);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  staggerReveal('.section-pad', 'fade-up', 180);
  staggerReveal('.price-card', 'scale-in', 120);
  staggerReveal('.step-card', 'slide-in', 120);
  staggerReveal('.testimonial', 'fade-up', 120);
  staggerReveal('.panel', 'fade-up', 120);

  // Demo: Skeleton loading for product cards on homepage
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/Printastic/' ) {
    showSkeletons('.price-card.skeleton');
    setTimeout(() => {
      // Hide skeletons
      document.querySelectorAll('.price-card.skeleton').forEach(el => el.style.display = 'none');
      // Reveal actual cards
      document.querySelectorAll('.price-card.real-card').forEach(el => el.style.display = '');
    }, 1200);
  }
});

// Complex animated section entrances
function complexEntrance(selector, effect = 'flip-in', stagger = 160) {
  const els = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible', effect);
        }, i * stagger);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  complexEntrance('.section-pad', 'flip-in', 160);
  complexEntrance('.price-card', 'rotate-in', 120);
  complexEntrance('.panel', 'morph-in', 120);
});

// Dynamic hero parallax and mouse-responsive gradient
const heroBg = document.querySelector('.hero-bg-animated');
if(heroBg){
  window.addEventListener('mousemove',e=>{
    const x = e.clientX/window.innerWidth*100;
    const y = e.clientY/window.innerHeight*100;
    heroBg.style.setProperty('--mx', x+'%');
    heroBg.style.setProperty('--my', y+'%');
    heroBg.classList.add('parallax');
  });
  window.addEventListener('mouseleave',()=>{
    heroBg.classList.remove('parallax');
    heroBg.style.setProperty('--mx','50%');
    heroBg.style.setProperty('--my','50%');
  });
}
