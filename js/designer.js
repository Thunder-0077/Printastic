// Simple T-shirt designer interactions
const designLayer = document.getElementById('designLayer');
const uploadInput = document.getElementById('uploadInput');
const textInput = document.getElementById('textInput');
const textColor = document.getElementById('textColor');
const textWeight = document.getElementById('textWeight');
const addTextBtn = document.getElementById('addTextBtn');
const scaleRange = document.getElementById('scaleRange');
const rotateRange = document.getElementById('rotateRange');
const removeSelectedBtn = document.getElementById('removeSelected');
const saveMockupBtn = document.getElementById('saveMockup');
let selectedEl = null;

function deselect(){selectedEl?.classList.remove('selected'); selectedEl = null;}
function select(el){deselect(); selectedEl = el; el.classList.add('selected'); syncControls();}
function syncControls(){ if(!selectedEl) return; const t = selectedEl.style.transform; const m = t.match(/scale\(([^)]+)\)/); const r = t.match(/rotate\(([^)]+)deg\)/); if(m) scaleRange.value = m[1]; if(r) rotateRange.value = r[1]; }
function centerElement(el){ el.style.left = '50%'; el.style.top = '50%'; el.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)'; }

// Drag logic
function makeDraggable(el){
  let offsetX, offsetY;
  const isTouch = () => window.matchMedia('(pointer: coarse)').matches;
  const getClientXY = e => {
    if(e.touches) return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    return {x: e.clientX, y: e.clientY};
  };
  const onPointerDown = e => {
    select(el);
    const {x, y} = getClientXY(e);
    const rect = el.getBoundingClientRect();
    const wrapper = designLayer.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    document.addEventListener(isTouch() ? 'touchmove' : 'pointermove', onPointerMove, {passive:false});
    document.addEventListener(isTouch() ? 'touchend' : 'pointerup', onPointerUp);
  };
  const onPointerMove = e => {
    e.preventDefault();
    const {x, y} = getClientXY(e);
    const wrapper = designLayer.getBoundingClientRect();
    let left = x - wrapper.left - offsetX + el.offsetWidth/2;
    let top = y - wrapper.top - offsetY + el.offsetHeight/2;
    // Clamp to designLayer bounds
    left = Math.max(el.offsetWidth/2, Math.min(left, wrapper.width - el.offsetWidth/2));
    top = Math.max(el.offsetHeight/2, Math.min(top, wrapper.height - el.offsetHeight/2));
    el.style.left = (left / wrapper.width * 100) + '%';
    el.style.top = (top / wrapper.height * 100) + '%';
    const scale = (el.style.transform.match(/scale\(([^)]+)\)/)||[])[1]||1;
    const rot = (el.style.transform.match(/rotate\(([^)]+)deg\)/)||[])[1]||0;
    el.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rot}deg)`;
  };
  const onPointerUp = e => {
    document.removeEventListener(isTouch() ? 'touchmove' : 'pointermove', onPointerMove);
    document.removeEventListener(isTouch() ? 'touchend' : 'pointerup', onPointerUp);
  };
  el.addEventListener(isTouch() ? 'touchstart' : 'pointerdown', onPointerDown);
}

// Upload image
uploadInput?.addEventListener('change', e => {
  const file = uploadInput.files[0]; if(!file) return;
  const img = new Image(); img.className='draggable';
  img.onload = () => { designLayer.appendChild(img); centerElement(img); makeDraggable(img); select(img);} ;
  img.src = URL.createObjectURL(file);
});

// Add text
addTextBtn?.addEventListener('click', () => {
  const val = textInput.value.trim(); if(!val) return;
  const div = document.createElement('div');
  div.className='draggable draggable-text';
  div.textContent = val;
  div.style.fontWeight = textWeight.value;
  div.style.color = textColor.value;
  div.style.fontSize = '32px';
  div.style.position = 'absolute';
  div.style.left = '50%';
  div.style.top = '50%';
  div.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)';
  designLayer.appendChild(div); makeDraggable(div); select(div);
});

textInput?.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); addTextBtn.click(); }});

// Adjust scale / rotate
scaleRange?.addEventListener('input', () => { if(!selectedEl) return; const rot = (selectedEl.style.transform.match(/rotate\(([^)]+)deg\)/)||[])[1]||0; selectedEl.style.transform = `translate(-50%,-50%) scale(${scaleRange.value}) rotate(${rot}deg)`; });
rotateRange?.addEventListener('input', () => { if(!selectedEl) return; const scale = (selectedEl.style.transform.match(/scale\(([^)]+)\)/)||[])[1]||1; selectedEl.style.transform = `translate(-50%,-50%) scale(${scale}) rotate(${rotateRange.value}deg)`; });

textWeight?.addEventListener('change', ()=>{ if(selectedEl && selectedEl.nodeName==='DIV') selectedEl.style.fontWeight = textWeight.value; });
textColor?.addEventListener('change', ()=>{ if(selectedEl) selectedEl.style.color = textColor.value; });

removeSelectedBtn?.addEventListener('click', () => { if(selectedEl){ selectedEl.remove(); deselect(); }});

designLayer?.addEventListener('click', e => { if(e.target.classList.contains('draggable')) select(e.target); else deselect(); });

// Save mockup to image
saveMockupBtn?.addEventListener('click', async () => {
  const wrapper = document.getElementById('shirtCanvasWrapper');
  if(!wrapper) return;
  // dynamic import html2canvas if needed
  if(!window.html2canvas){
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    document.body.appendChild(script);
    await new Promise(res => script.onload = res);
  }
  window.html2canvas(wrapper,{backgroundColor:null,scale:2}).then(canvas => {
    const link = document.createElement('a');
    link.download = 'printastic-mockup.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

window.addEventListener('keydown', e => { if(e.key==='Delete' && selectedEl){ selectedEl.remove(); deselect(); } });
