/* ============================================================
 * 宋瓷五窑纪 · 全局粒子特效（增强版）
 * 效果清单：
 *   1. 青瓷浮尘 —— 缓慢漂浮，近距自动连线（星尘网络）
 *   2. 窑火余烬 —— 暖橙火星从底部升起，明灭闪烁
 *   3. 鼠标丝线 —— 光标附近粒子被吸附拉出暖橙丝线
 *   4. 点击迸发 —— 点击处炸开多色星尘
 *   5. 鼠标拖尾 —— 光标划过留下渐隐星尘轨迹
 *   6. 轮播窑火 —— 首页轮播图区域叠加更亮的窑火闪光
 *   7. 滚动聚合 —— 页面滚动时粒子加速并向中心聚拢
 * ============================================================ */
(function () {
  'use strict';

  if (document.getElementById('particleCanvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const isMobile = window.innerWidth < 768;
  const mouse = { x: -9999, y: -9999, lastX: -9999, lastY: -9999 };
  let scrollVel = 0; // 滚动速度（像素/帧）

  /* 宋瓷五窑代表釉色板（加深版） */
  const PALETTE = [
    { c: '90,170,195',   w: 22 }, // 汝窑·天青
    { c: '115,145,95',   w: 20 }, // 官窑·粉青
    { c: '205,155,80',   w: 20 }, // 哥窑·米黄
    { c: '125,90,175',   w: 20 }, // 钧窑·玫瑰紫
    { c: '225,218,200',  w: 18 }, // 定窑·象牙白
  ];
  const PALETTE_TOTAL = PALETTE.reduce((s, p) => s + p.w, 0);

  function pickColor() {
    let r = Math.random() * PALETTE_TOTAL;
    for (const p of PALETTE) {
      r -= p.w;
      if (r <= 0) return p.c;
    }
    return PALETTE[0].c;
  }

  /* 根据当前页面决定鼠标丝线颜色（对应窑口釉色，加深版） */
  const PAGE_LINE_COLOR = {
    'ruyao.html':   '90,170,195',   // 汝窑·天青
    'guanyao.html': '115,145,95',   // 官窑·粉青
    'geyao.html':   '205,155,80',   // 哥窑·米黄
    'junyao.html':  '125,90,175',   // 钧窑·玫瑰紫
    'dingyao.html': '225,218,200',  // 定窑·象牙白
  };
  const _page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const mouseLineColor = PAGE_LINE_COLOR[_page] || '242,163,101'; // 其他页面默认窑火橙

  /* ---------- 1. 青瓷浮尘 ---------- */
  class Dot {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.r = Math.random() * 2.2 + 1.4;
      this.color = pickColor();
      this.baseAlpha = Math.random() * 0.35 + 0.65;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;

      // 滚动聚合：跟随滚动方向漂移 + 向屏幕中心轻微聚拢
      this.y += scrollVel * 0.15;
      const centerX = W / 2;
      const centerPull = scrollVel * 0.02;
      if (scrollVel > 0.5 || scrollVel < -0.5) {
        this.x += (centerX - this.x) * 0.0015;
      }

      // 边界环绕
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;

      // 鼠标排斥
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      const mr = 140;
      if (d2 < mr * mr && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (mr - d) / mr;
        this.x += (dx / d) * f * 2.2;
        this.y += (dy / d) * f * 2.2;
      }
      this.pulse = 0.5 + 0.5 * Math.sin(t * this.pulseSpeed + this.pulseOffset);
    }
    draw() {
      const a = this.baseAlpha * (0.6 + 0.4 * this.pulse);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.color + ',' + a + ')';
      ctx.fill();
    }
  }

  /* ---------- 2. 窑火余烬 ---------- */
  class Ember {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.vy = -(Math.random() * 1.3 + 0.5);
      this.vx = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 2.2 + 1.0;
      this.maxAlpha = Math.random() * 0.4 + 0.6;
      this.life = 0;
      this.maxLife = Math.random() * 220 + 160;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (Math.random() - 0.5) * 0.03;
      this.vy *= 0.999;
      this.life++;
      const fadeIn = Math.min(1, this.life / 30);
      const fadeOut = Math.min(1, (this.maxLife - this.life) / 60);
      this.alpha = this.maxAlpha * fadeIn * fadeOut;
      if (this.life >= this.maxLife || this.y < -10) this.reset(false);
    }
    draw() {
      if (this.alpha <= 0.01) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,163,101,' + (this.alpha * 0.35) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,150,60,' + this.alpha + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,235,200,' + (this.alpha * 0.95) + ')';
      ctx.fill();
    }
  }

  /* ---------- 3. 轮播图窑火闪光（更大更亮，从轮播底部升起） ---------- */
  class CarouselSpark {
    constructor(rect) {
      this.rect = rect;
      this.x = rect.left + Math.random() * rect.width;
      this.y = rect.bottom - Math.random() * 30;
      this.vy = -(Math.random() * 1.5 + 0.8);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2.5 + 1.5;
      this.life = 0;
      this.maxLife = Math.random() * 120 + 80;
      this.maxAlpha = Math.random() * 0.3 + 0.7;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy *= 0.995;
      this.life++;
      const fadeIn = Math.min(1, this.life / 15);
      const fadeOut = Math.min(1, (this.maxLife - this.life) / 30);
      this.alpha = this.maxAlpha * fadeIn * fadeOut;
    }
    draw() {
      if (this.alpha <= 0.01) return;
      // 大辉光
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
      g.addColorStop(0, 'rgba(255,200,120,' + (this.alpha * 0.6) + ')');
      g.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      // 亮芯
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,240,210,' + this.alpha + ')';
      ctx.fill();
    }
    isDead() {
      return this.life >= this.maxLife || this.y < this.rect.top - 10;
    }
  }

  /* ---------- 4. 点击迸发星尘 ---------- */
  class Spark {
    constructor(x, y) {
      this.x = x; this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.r = Math.random() * 2.5 + 1;
      this.color = pickColor();
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.012;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.vy += 0.04;
      this.life -= this.decay;
    }
    draw() {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.color + ',' + (this.life * 0.85) + ')';
      ctx.fill();
    }
  }

  /* ---------- 5. 鼠标拖尾星尘 ---------- */
  class Trail {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6 - 0.2;
      this.r = Math.random() * 1.8 + 0.8;
      this.color = pickColor();
      this.life = 1;
      this.decay = Math.random() * 0.025 + 0.018;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95;
      this.vy *= 0.95;
      this.life -= this.decay;
    }
    draw() {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * this.life, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.color + ',' + (this.life * 0.6) + ')';
      ctx.fill();
    }
  }

  let dots = [], embers = [], sparks = [], trails = [], carouselSparks = [];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    resize();
    dots = [];
    embers = [];
    const dotCount = isMobile ? 55 : 160;
    const emberCount = isMobile ? 12 : 36;
    for (let i = 0; i < dotCount; i++) dots.push(new Dot());
    for (let i = 0; i < emberCount; i++) embers.push(new Ember());
  }

  /* 获取首页轮播图位置（如果存在） */
  function getCarouselRect() {
    const c = document.querySelector('.carousel');
    if (!c) return null;
    const r = c.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H) return null; // 不在视口内
    return r;
  }

  function drawDotsLines() {
    // 滚动时连线距离缩短，产生聚合感
    const speedFactor = Math.min(Math.abs(scrollVel) * 0.02, 0.4);
    const baseDist = isMobile ? 90 : 130;
    const maxDist = baseDist * (1 - speedFactor);
    const maxDist2 = maxDist * maxDist;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const a = dots[i], b = dots[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          const alpha = (1 - d2 / maxDist2) * (0.35 + speedFactor * 0.5);
          ctx.strokeStyle = 'rgba(230,228,220,' + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseLines() {
    if (isMobile || mouse.x < -100) return;
    const mr = 180;
    const mr2 = mr * mr;
    for (const d of dots) {
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < mr2) {
        const alpha = (1 - d2 / mr2) * 0.65;
        ctx.strokeStyle = 'rgba(' + mouseLineColor + ',' + alpha + ')';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }

  function loop(t) {
    ctx.clearRect(0, 0, W, H);

    // 滚动速度衰减
    scrollVel *= 0.92;

    for (const d of dots) { d.update(t); d.draw(); }
    for (const e of embers) { e.update(); e.draw(); }

    // 轮播图窑火闪光：持续生成
    const cRect = getCarouselRect();
    if (cRect && !isMobile) {
      if (Math.random() < 0.25 && carouselSparks.length < 40) {
        carouselSparks.push(new CarouselSpark(cRect));
      }
    }
    carouselSparks = carouselSparks.filter(s => !s.isDead());
    for (const s of carouselSparks) { s.update(); s.draw(); }

    // 点击星尘
    sparks = sparks.filter(s => s.life > 0);
    for (const s of sparks) { s.update(); s.draw(); }

    // 鼠标拖尾
    trails = trails.filter(tr => tr.life > 0);
    for (const tr of trails) { tr.update(); tr.draw(); }

    requestAnimationFrame(loop);
  }

  /* ---------- 事件 ---------- */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });

  // 鼠标移动：记录位置 + 生成拖尾
  window.addEventListener('mousemove', function (e) {
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // 移动距离超过阈值才生成拖尾粒子，避免静止时堆积
    if (isMobile) return;
    const dx = mouse.x - mouse.lastX;
    const dy = mouse.y - mouse.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (mouse.lastX > -100 && dist > 4) {
      const count = Math.min(Math.floor(dist / 8), 3);
      for (let i = 0; i < count; i++) {
        trails.push(new Trail(mouse.x + (Math.random() - 0.5) * 6,
                              mouse.y + (Math.random() - 0.5) * 6));
      }
    }
  });
  window.addEventListener('mouseout', function () {
    mouse.x = -9999; mouse.y = -9999;
  });

  // 点击迸发
  window.addEventListener('click', function (e) {
    if (isMobile) return;
    for (let i = 0; i < 22; i++) sparks.push(new Spark(e.clientX, e.clientY));
  });

  // 滚动速度采集
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', function () {
    const now = window.scrollY;
    scrollVel = now - lastScrollY;
    lastScrollY = now;
  }, { passive: true });

  // 触摸支持
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  window.addEventListener('touchend', function () {
    mouse.x = -9999; mouse.y = -9999;
  });

  init();
  requestAnimationFrame(loop);
})();
