// ── Navbar scroll ──
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
  // Always scrolled on inner pages
  if (!document.querySelector('.hero')) navbar.classList.add('scrolled');
}

// ── Hamburger ──
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── Fade in on scroll ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ── Form submit ──
document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sent ✓'; btn.disabled = true; btn.style.background = '#2e6b3e'; }
    setTimeout(() => {
      if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; btn.style.background = ''; }
      form.reset();
    }, 4000);
  });
});

// ── Shared Three.js helpers ──
window.NOE3D = {
  makeScene(canvasId, bgColor = 0xffffff) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const w = canvas.parentElement.clientWidth;
    const h = Math.round(w * 0.72);
    canvas.width = w; canvas.height = h;
    canvas.style.height = h + 'px';

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xfff5e0, 0.7));
    const key = new THREE.DirectionalLight(0xfff0d0, 1.3);
    key.position.set(3, 4, 3); key.castShadow = true; scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8d8f0, 0.3);
    fill.position.set(-3, 1, -2); scene.add(fill);

    let isDrag = false, px = 0, py = 0, vx = 0, vy = 0;
    canvas.addEventListener('mousedown', e => { isDrag = true; px = e.clientX; py = e.clientY; });
    window.addEventListener('mouseup', () => isDrag = false);
    window.addEventListener('mousemove', e => {
      if (!isDrag) return;
      vy = (e.clientX - px) * 0.015; vx = (e.clientY - py) * 0.01;
      px = e.clientX; py = e.clientY;
    });
    canvas.addEventListener('touchstart', e => { isDrag = true; px = e.touches[0].clientX; py = e.touches[0].clientY; });
    window.addEventListener('touchend', () => isDrag = false);
    window.addEventListener('touchmove', e => {
      if (!isDrag) return;
      vy = (e.touches[0].clientX - px) * 0.015; vx = (e.touches[0].clientY - py) * 0.01;
      px = e.touches[0].clientX; py = e.touches[0].clientY;
    });
    canvas.addEventListener('wheel', e => {
      camera.position.z = Math.min(9, Math.max(2.5, camera.position.z + e.deltaY * 0.005));
      e.preventDefault();
    }, { passive: false });

    return {
      renderer, scene, camera,
      vel: () => ({ x: vx, y: vy }),
      damp: () => { vx *= 0.88; vy *= 0.88; }
    };
  },

  woodTex(base, grain, w = 512, h = 128) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const r=(base>>16)&0xff, g=(base>>8)&0xff, b=base&0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0,0,w,h);
    const rg=(grain>>16)&0xff, gg=(grain>>8)&0xff, bg=grain&0xff;
    for (let i = 0; i < 70; i++) {
      const y = Math.random() * h;
      ctx.strokeStyle = `rgba(${rg},${gg},${bg},${0.2+Math.random()*0.45})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.5;
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 8) ctx.lineTo(x, y + Math.sin(x*0.04)*2);
      ctx.stroke();
    }
    const id = ctx.getImageData(0,0,w,h);
    for (let i = 0; i < id.data.length; i += 4) {
      const n = (Math.random()-0.5)*10;
      id.data[i]=Math.min(255,Math.max(0,id.data[i]+n));
      id.data[i+1]=Math.min(255,Math.max(0,id.data[i+1]+n));
      id.data[i+2]=Math.min(255,Math.max(0,id.data[i+2]+n));
    }
    ctx.putImageData(id,0,0);
    return new THREE.CanvasTexture(c);
  }
};
