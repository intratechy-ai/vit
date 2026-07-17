/* ============================================================
   VIT DISCORD — shared script
   ============================================================ */

/* ---- EDIT THIS ONE LINE WHEN YOU HAVE THE REAL INVITE ---- */
const DISCORD_INVITE_LINK = "https://discord.gg/fnDGVfgS8n";
/* ------------------------------------------------------------ */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------
   Particle mesh background (squares + connecting lines)
   ---------------------------------------------------------- */
function initMesh(canvas){
  const ctx = canvas.getContext('2d');
  let particles = [];
  let vw = window.innerWidth, vh = window.innerHeight;
  const colors = ['255,138,61', '94,234,212', '139,127,255'];
  const mouse = { x: -9999, y: -9999 };

  function resize(){
    vw = window.innerWidth; vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const density = vw < 640 ? 22000 : 16000;
    const count = Math.max(24, Math.min(85, Math.floor((vw * vh) / density)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * vw,
      y: Math.random() * vh,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      size: 2 + Math.random() * 3.5,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', resize);

  function frame(){
    ctx.clearRect(0, 0, vw, vh);

    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > vw) p.vx *= -1;
      if(p.y < 0 || p.y > vh) p.vy *= -1;
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d = Math.hypot(dx, dy);
      if(d < 110){ p.x -= dx * 0.008; p.y -= dy * 0.008; }
    }

    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if(d < 105){
          ctx.strokeStyle = `rgba(233,237,241,${0.09 * (1 - d / 105)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for(const p of particles){
      ctx.fillStyle = `rgba(${p.c},0.75)`;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    if(!REDUCED_MOTION) requestAnimationFrame(frame);
  }

  resize();
  frame();
}

/* ----------------------------------------------------------
   Scramble / decode text reveal
   ---------------------------------------------------------- */
function scrambleReveal(el, startDelay){
  const finalText = el.dataset.text || '';
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&<>[]{}/\\';

  if(REDUCED_MOTION){
    el.textContent = finalText;
    return;
  }

  el.innerHTML = '';
  const letters = finalText.split('').map(ch => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.visibility = 'hidden';
    el.appendChild(span);
    return { span, ch };
  });

  letters.forEach(({ span, ch }, i) => {
    const localDelay = startDelay + i * 45;
    setTimeout(() => {
      if(ch === ' '){ span.style.visibility = 'visible'; return; }
      span.style.visibility = 'visible';
      let ticks = 0;
      const maxTicks = 7;
      const iv = setInterval(() => {
        span.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        ticks++;
        if(ticks >= maxTicks){
          clearInterval(iv);
          span.textContent = ch;
          span.classList.add('settled');
        }
      }, 28);
    }, localDelay);
  });
}

/* ----------------------------------------------------------
   Boot log typing (index page)
   ---------------------------------------------------------- */
function typeBootLog(container, lines, onDone){
  if(REDUCED_MOTION){
    container.innerHTML = lines.map(l => `<div>${l}</div>`).join('');
    container.classList.add('hide');
    onDone && onDone();
    return;
  }

  let lineIndex = 0;
  function nextLine(){
    if(lineIndex >= lines.length){
      setTimeout(() => container.classList.add('hide'), 300);
      onDone && onDone();
      return;
    }
    const div = document.createElement('div');
    const textNode = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    div.appendChild(textNode);
    div.appendChild(cursor);
    container.appendChild(div);
    const text = lines[lineIndex];
    let charIndex = 0;
    const iv = setInterval(() => {
      textNode.textContent = text.slice(0, charIndex + 1);
      charIndex++;
      if(charIndex >= text.length){
        clearInterval(iv);
        cursor.remove();
        lineIndex++;
        setTimeout(nextLine, 160);
      }
    }, 18);
  }
  nextLine();
}

/* ----------------------------------------------------------
   Tile wipe transition grid
   ---------------------------------------------------------- */
function buildWipeTiles(overlay){
  const cell = window.innerWidth < 640 ? 56 : 74;
  const cols = Math.ceil(window.innerWidth / cell);
  const rows = Math.ceil(window.innerHeight / cell);
  overlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  overlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  overlay.innerHTML = '';

  const palette = ['var(--amber)', 'var(--cyan)', 'var(--violet)'];
  const tiles = [];
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      const tile = document.createElement('div');
      tile.className = 'wipe-tile';
      tile.style.background = palette[(r + c) % palette.length];
      overlay.appendChild(tile);
      tiles.push({ el: tile, r, c });
    }
  }
  return { tiles, cols, rows, cell };
}

function coverScreen(overlay, originX, originY, onComplete){
  const { tiles, cell } = buildWipeTiles(overlay);
  const originCol = originX / cell;
  const originRow = originY / cell;
  let maxDelay = 0;

  tiles.forEach(({ el, r, c }) => {
    const dist = Math.hypot(c - originCol, r - originRow);
    const delay = dist * 26;
    maxDelay = Math.max(maxDelay, delay);
    el.style.transitionDelay = `${delay}ms`;
  });

  requestAnimationFrame(() => {
    tiles.forEach(({ el }) => el.classList.add('wipe-in'));
  });

  setTimeout(onComplete, maxDelay + 520);
}

function revealScreen(overlay){
  const { tiles } = buildWipeTiles(overlay);
  let maxDelay = 0;

  tiles.forEach(({ el, r, c }) => {
    const delay = (c + r) * 18;
    maxDelay = Math.max(maxDelay, delay);
    el.style.transitionDelay = `${delay}ms`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tiles.forEach(({ el }) => el.classList.add('wipe-out'));
    });
  });

  setTimeout(() => { overlay.style.display = 'none'; }, maxDelay + 600);
}

/* ----------------------------------------------------------
   Copy to clipboard + confetti burst
   ---------------------------------------------------------- */
function spawnConfetti(x, y){
  if(REDUCED_MOTION) return;
  const colors = ['#FF8A3D', '#5EEAD4', '#8B7FFF', '#E9EDF1'];
  for(let i = 0; i < 14; i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 70;
    piece.style.left = x + 'px';
    piece.style.top = y + 'px';
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
    piece.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
    piece.style.setProperty('--rot', (Math.random() * 360) + 'deg');
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 650);
  }
}

function initCopyButton(){
  const btn = document.getElementById('copyBtn');
  if(!btn) return;
  btn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(DISCORD_INVITE_LINK);
    }catch(e){
      const ta = document.createElement('textarea');
      ta.value = DISCORD_INVITE_LINK;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try{ document.execCommand('copy'); }catch(err){ /* no-op */ }
      ta.remove();
    }
    const rect = btn.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const label = btn.querySelector('.copy-label');
    const original = label.textContent;
    label.textContent = 'copied';
    btn.classList.add('copied');
    setTimeout(() => {
      label.textContent = original;
      btn.classList.remove('copied');
    }, 1600);
  });
}

/* ----------------------------------------------------------
   Page init
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if(REDUCED_MOTION) document.body.classList.add('reduced-motion');

  const canvas = document.getElementById('mesh');
  if(canvas) initMesh(canvas);

  const inviteLink = document.getElementById('inviteLink');
  if(inviteLink) inviteLink.textContent = DISCORD_INVITE_LINK.replace(/^https?:\/\//, '');

  const joinBtn = document.getElementById('joinBtn');
  if(joinBtn) joinBtn.href = DISCORD_INVITE_LINK;

  initCopyButton();

  /* ---- INTRO PAGE ---- */
  if(document.body.classList.contains('page-intro')){
    const boot = document.getElementById('bootLog');
    if(boot){
      typeBootLog(boot, [
        '> connecting to campus.net',
        '> handshake ok',
        '> spinning up community...'
      ]);
    }

    document.querySelectorAll('.headline [data-text]').forEach((el, i) => {
      scrambleReveal(el, 2150 + i * 380);
    });

    const overlay = document.getElementById('wipeOverlay');
    const cta = document.getElementById('ctaBtn');
    if(cta && overlay){
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        const href = cta.getAttribute('href');
        const rect = cta.getBoundingClientRect();
        coverScreen(overlay, rect.left + rect.width / 2, rect.top + rect.height / 2, () => {
          window.location.href = href;
        });
      });
    }
  }

  /* ---- JOIN PAGE ---- */
  if(document.body.classList.contains('page-join')){
    document.querySelectorAll('.headline [data-text]').forEach((el, i) => {
      scrambleReveal(el, 150 + i * 380);
    });

    const overlay = document.getElementById('wipeOverlay');
    if(overlay){
      setTimeout(() => revealScreen(overlay), 120);
    }
  }
});
