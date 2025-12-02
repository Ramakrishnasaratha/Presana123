// Simple canvas scene: cake, candles, confetti, and typewriter greeting animation.
// Name is prefilled in index.html as "Arulnidhi Presanna".

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const surpriseBtn = document.getElementById('surprise');
const playBtn = document.getElementById('playMusic');
const downloadBtn = document.getElementById('download');

const W = canvas.width;
const H = canvas.height;

let particles = [];
let typingText = `Happy Birthday, Arulnidhi Presanna!\n\nWishing you a joyful day filled with love, friends & lots of cake!`;
let typeBuffer = '';
let typeIndex = 0;
let typing = false;
let raf = null;

// Draw static background and cake
function drawBackground() {
  // gradient bg
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#07101a');
  g.addColorStop(1,'#08121a');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // faint stars
  for(let i=0;i<30;i++){
    ctx.fillStyle = `rgba(255,255,255,${0.02 + (i%6)*0.01})`;
    ctx.beginPath(); ctx.arc((i*73)%W, 20 + (i*47)%150, (i%3)+0.6, 0, Math.PI*2); ctx.fill();
  }

  // cake base
  const cx = W/2, cy = H*0.62;
  ctx.fillStyle = '#ffe0c2';
  roundRect(ctx,cx-180,cy-100,360,120,16,true);
  ctx.fillStyle = '#ff8fb1';
  roundRect(ctx,cx-180,cy-118,360,24,12,true);
  ctx.fillStyle = '#ffe0c2';
  roundRect(ctx,cx-130,cy-180,260,90,14,true);
  ctx.fillStyle = '#ff8fb1';
  ctx.beginPath(); ctx.ellipse(cx,cy-190,90,28,0,0,Math.PI*2); ctx.fill();

  // icing blobs
  ctx.fillStyle = '#fff';
  for(let i=-4;i<=4;i++){
    ctx.beginPath();
    ctx.ellipse(cx + i*36, cy-60, 12,8,0,0,Math.PI*2);
    ctx.fill();
  }
}

// rounded rect helper
function roundRect(ctx,x,y,w,h,r,fill){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  if(fill) ctx.fill();
  else ctx.stroke();
}

// draw candles (static stems; flames animated)
const candlePositions = [];
function drawCandles(t){
  const cx = W/2, cy = H*0.62;
  // positions (5)
  for(let i=0;i<5;i++){
    const x = cx - 80 + i*40;
    const y = cy - 200;
    candlePositions[i] = {x,y};
    // stem
    ctx.fillStyle = '#ffff77';
    ctx.fillRect(x-6,y-36,12,36);
    // stripes
    ctx.strokeStyle = 'rgba(255,160,128,0.9)';
    ctx.lineWidth = 1;
    for(let k=0;k<3;k++){
      ctx.beginPath(); ctx.moveTo(x-4+k*3,y-32); ctx.lineTo(x-4+k*3,y-8); ctx.stroke();
    }
    // flame
    const flick = Math.sin((t*0.006 + i)*8)*2 + Math.random()*1.2;
    const h = 18 + flick;
    const w = 8 + Math.abs(flick)*0.4;
    const grad = ctx.createRadialGradient(x, y - h/2, 2, x, y - h/2, h*1.2);
    grad.addColorStop(0, "rgba(255,255,180,0.98)");
    grad.addColorStop(0.4, "rgba(255,180,60,0.9)");
    grad.addColorStop(1, "rgba(255,100,20,0.08)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(x, y - h/2, w, h, Math.sin(t*0.002+i)*0.2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,220,0.98)";
    ctx.beginPath(); ctx.ellipse(x, y - h/2, Math.max(2,w*0.4), Math.max(3,h*0.45), 0,0,Math.PI*2); ctx.fill();
  }
}

// confetti
const COLORS = ["#ff4d6d","#ffd24a","#6ef2b1","#7aa2ff","#e36bff","#fff7a6"];
function emitConfetti(cx,cy,count=80){
  for(let i=0;i<count;i++){
    particles.push({
      x: cx + (Math.random()*40-20),
      y: cy + (Math.random()*30-15),
      vx: (Math.random()*12-6),
      vy: (Math.random()*-12-2),
      size: Math.round(Math.random()*7 + 3),
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      life: Math.round(Math.random()*100+60),
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()*0.3-0.15)
    });
  }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.vy += 0.35; p.vx *= 0.995; p.vy *= 0.995;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    if(p.life<=0 || p.y>H+40) particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    ctx.save();
    ctx.translate(p.x,p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.7);
    ctx.restore();
  }
}

// typewriter render
function drawTypeText(){
  const boxX = W/2, boxY = H*0.18;
  ctx.save();
  // translucent panel
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  roundRect(ctx, W*0.06, H*0.05, W*0.88, H*0.28, 14, true);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "36px Inter, Arial";
  const lines = typeBuffer.split("\n");
  ctx.fillText(lines[0] || "", boxX, boxY - 16);
  ctx.font = "18px Inter, Arial";
  for(let i=1;i<lines.length;i++){
    ctx.fillText(lines[i], boxX, boxY + 6 + (i-1)*26);
  }
  ctx.restore();
}

// animation loop
let last = performance.now();
function loop(t){
  ctx.clearRect(0,0,W,H);
  drawBackground();
  drawTypeText();
  drawCandles(t);
  updateParticles();
  drawParticles();
  raf = requestAnimationFrame(loop);
}
raf = requestAnimationFrame(loop);

// typewriter start
function startTypewriter(full){
  if(typing) return;
  typing = true; typeBuffer = ''; typeIndex = 0;
  (function step(){
    if(typeIndex < full.length){
      typeBuffer += full[typeIndex++];
      drawTypeText();
      let delay = 18;
      const ch = full[typeIndex-1];
      if(ch === ' ') delay = 8;
      if(".!?".includes(ch)) delay += 160;
      setTimeout(step, delay);
    } else {
      typing = false;
      emitConfetti(W/2, H*0.35, 140);
    }
  })();
}

// simple melody via WebAudio
let audioCtx = null;
function playMelody(){
  if(!window.AudioContext) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00]; // simple scale
  notes.forEach((freq,i)=>{
    const t0 = now + i*0.18;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    g.gain.value = 0;
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(t0); g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
    osc.stop(t0 + 0.16);
  });
}

// download canvas as PNG
function downloadCanvas(){
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url; a.download = 'happy_birthday_arulnidhi_presanna.png';
  document.body.appendChild(a); a.click(); a.remove();
}

// Button events
surpriseBtn.addEventListener('click', ()=> {
  startTypewriter(typingText);
  emitConfetti(W/2, H*0.4, 160);
  playMelody();
});

playBtn.addEventListener('click', ()=> {
  playMelody();
});

downloadBtn.addEventListener('click', downloadCanvas);

// ensure canvas resizes nicely on small screens (keeps internal pixel size unchanged)
window.addEventListener('resize', ()=> {
  // canvas has fixed internal size; style width handles responsiveness via CSS
});
