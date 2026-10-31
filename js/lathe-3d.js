/* ============================================================
 * 宋瓷工坊 · 3D 拉胚（Three.js LatheGeometry）
 * - 旋转成型几何体，Catmull-Rom 样条保证母线顺滑
 * - 手势按"高度层"局部捏合：手在哪一层，就捏哪一层的半径
 *   高斯衰减让相邻层平滑过渡，不会出现硬棱
 * - 暴露 window.LathePot.init / setLayer / setColor / getShape
 * ============================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  let container = document.querySelector('.lapi-container');
  if (!container) return;
  container.style.position = 'relative';

  /* ---------- 渲染器 / 场景 / 相机 ---------- */
  const canvas = document.createElement('canvas');
  canvas.id = 'lapi3dCanvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.25, 3.8);
  camera.lookAt(0, -0.2, 0);

  /* ---------- 灯光 ---------- */
  const hemi = new THREE.HemisphereLight(0xfff2d8, 0x8a7560, 0.65);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff5e0, 0.85);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe4ff, 0.3);
  fill.position.set(-4, 2, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe0b0, 0.4);
  rim.position.set(-2, 4, -4);
  scene.add(rim);

  /* ---------- 转盘 + 胚体 ---------- */
  const spinGroup = new THREE.Group();
  scene.add(spinGroup);

  const wheelGeo = new THREE.CylinderGeometry(1.05, 1.1, 0.12, 64);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x6b5d4f, roughness: 0.85, metalness: 0.05 });
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.position.y = -1.21;
  spinGroup.add(wheel);

  /* ---------- 程序化陶土纹理（fbm 细腻颗粒 + 自然拉坯痕） ---------- */
  function makeClayTexture() {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');

    // 哈希 value noise
    function hash(x, y) {
      let n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return n - Math.floor(n);
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function valueNoise(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const a = hash(xi, yi), b = hash(xi + 1, yi);
      const c2 = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      const u = smooth(xf), v = smooth(yf);
      return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v;
    }
    function fbm(x, y) {
      let v = 0, amp = 0.5, freq = 1;
      for (let i = 0; i < 4; i++) {
        v += amp * valueNoise(x * freq, y * freq);
        amp *= 0.5; freq *= 2;
      }
      return v;
    }

    // 逐像素绘制陶土色 + 细腻 noise 颗粒
    const img = ctx.createImageData(S, S);
    const data = img.data;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        // 低频：整体明暗斑驳；高频：细小砂粒
        const n1 = fbm(x / 48, y / 48);
        const n2 = fbm(x / 6, y / 6);
        const v = (n1 - 0.5) * 36 + (n2 - 0.5) * 18;
        // 陶土基础色：暖棕
        const r = 188 + v;
        const g = 152 + v * 0.85;
        const b = 118 + v * 0.7;
        const idx = (y * S + x) * 4;
        data[idx] = Math.max(0, Math.min(255, r));
        data[idx + 1] = Math.max(0, Math.min(255, g));
        data[idx + 2] = Math.max(0, Math.min(255, b));
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // 拉坯螺旋痕：极细、连续、带轻微起伏的水平线
    for (let row = 0; row < 22; row++) {
      const yBase = (row / 22) * S + Math.random() * 6;
      ctx.strokeStyle = `rgba(90, 65, 45, ${0.10 + Math.random() * 0.08})`;
      ctx.lineWidth = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      for (let x = 0; x <= S; x += 3) {
        const y = yBase + Math.sin(x * 0.02 + row * 1.7) * 1.2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1.5);
    tex.anisotropy = 8;
    return tex;
  }
  const clayTex = makeClayTexture();

  const potMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: clayTex,
    bumpMap: clayTex,
    bumpScale: 0.035,
    roughness: 0.88,
    metalness: 0.02
  });
  let potMesh = null;

  /* ---------- 母线：从器型控制点生成基准轮廓 ---------- */
  // pts: [口沿L,口沿R,肩L,肩R,腹L,腹R,底足L,底足R]（百分比）
  // 输出 [{y, r}]，y∈[0,1] 底→口，r 为半宽比例
  function buildControlPoints(pts) {
    return [
      { y: 0.00, r: (pts[7] - pts[6]) / 2 / 100 },
      { y: 0.10, r: (pts[7] - pts[6]) / 2 / 100 * 1.06 },
      { y: 0.30, r: (pts[3] - pts[2]) / 2 / 100 },
      { y: 0.55, r: (pts[5] - pts[4]) / 2 / 100 },
      { y: 0.80, r: (pts[3] - pts[2]) / 2 / 100 * 0.92 },
      { y: 1.00, r: (pts[1] - pts[0]) / 2 / 100 },
    ];
  }

  // 用 Catmull-Rom 样条把控制点插值成 N 个光滑点
  const N = 64;
  let baseY = new Float32Array(N + 1);
  let baseR = new Float32Array(N + 1);
  // 每个母线点的当前缩放系数（手势局部捏形的结果）
  let curScale = new Float32Array(N + 1).fill(1);
  let tgtScale = new Float32Array(N + 1).fill(1);

  function rebuildProfile(controlPts) {
    // Catmull-Rom 样条（THREE.SplineCurve）
    const v2 = controlPts.map(p => new THREE.Vector2(p.y, p.r));
    const spline = new THREE.SplineCurve(v2);
    const samples = spline.getPoints(N);
    for (let i = 0; i <= N; i++) {
      baseY[i] = samples[i].x;
      baseR[i] = Math.max(0.02, samples[i].y);
    }
    curScale.fill(1);
    tgtScale.fill(1);
  }

  // 高斯函数
  function gauss(d, sigma) {
    return Math.exp(-(d * d) / (2 * sigma * sigma));
  }

  // 手势输入：在 targetY 高度层，把半径缩放成 targetScale
  // sigma 控制影响范围（越大影响越宽）
  // 累积编辑：在 targetY 处写入 targetScale，远处保留之前捏好的形状
  function applyLayer(targetY, targetScale, sigma) {
    for (let i = 0; i <= N; i++) {
      const w = gauss(baseY[i] - targetY, sigma);
      tgtScale[i] = tgtScale[i] * (1 - w) + targetScale * w;
    }
  }

  const MAX_R = 0.7;
  const MAX_H = 1.9;
  const BASE_Y = -1.15;
  const SIGMA = 0.07; // 局部捏合影响范围（越小越精准）

  function rebuildPot() {
    if (!baseR.length) return;
    const points = [];
    for (let i = 0; i <= N; i++) {
      // 平滑逼近目标缩放
      curScale[i] += (tgtScale[i] - curScale[i]) * 0.28;
      const r = baseR[i] * curScale[i];
      points.push(new THREE.Vector2(
        Math.max(0.02, r * MAX_R * 2),
        BASE_Y + baseY[i] * MAX_H
      ));
    }
    const geo = new THREE.LatheGeometry(points, 72);
    if (potMesh) {
      potMesh.geometry.dispose();
      potMesh.geometry = geo;
    } else {
      potMesh = new THREE.Mesh(geo, potMat);
      spinGroup.add(potMesh);
    }
  }

  /* ---------- 尺寸自适应 ---------- */
  function resize() {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 380;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  /* ---------- 渲染循环 ---------- */
  let started = false;
  function animate() {
    requestAnimationFrame(animate);
    rebuildPot();
    spinGroup.rotation.y += 0.008;
    renderer.render(scene, camera);
  }

  /* ---------- 对外接口 ---------- */
  let patternTex = null;
  let currentGlazeHex = '#c9b196';

  window.LathePot = {
    init(pts) {
      rebuildProfile(buildControlPoints(pts));
      resize();
      rebuildPot();
      if (!started) { started = true; animate(); }
    },
    // 手在 targetY（0=底足, 1=口沿）那一层，半径缩放到 scale
    setLayer(targetY, scale) {
      const ty = Math.max(0, Math.min(1, targetY));
      const s = Math.max(0.4, Math.min(1.8, scale));
      applyLayer(ty, s, SIGMA);
    },
    // 传陶土色 '#c9b196' 时恢复陶土纹理；传釉色时隐藏纹理走光滑釉面
    setColor(hex) {
      currentGlazeHex = hex;
      potMat.color.set(hex);
      const isClay = (hex || '').toLowerCase() === '#c9b196';
      if (isClay) {
        potMat.map = clayTex;
        potMat.bumpMap = clayTex;
        potMat.roughness = 0.88;
      } else if (patternTex) {
        potMat.map = patternTex;
        potMat.bumpMap = null;
        potMat.roughness = 0.3;
      } else {
        potMat.map = null;
        potMat.bumpMap = null;
        potMat.roughness = 0.3;
      }
      potMat.needsUpdate = true;
    },
    // 叠加纹样：把纹样 PNG 画到 canvas 作为表面纹理
    setPattern(imgUrl) {
      if (!imgUrl) {
        patternTex = null;
        window.LathePot.setColor(currentGlazeHex);
        return;
      }
      // 加载纹样 PNG，画到 canvas 作为表面纹理
      const img = new Image();
      img.onload = () => {
        const S = 512;
        const c = document.createElement('canvas');
        c.width = c.height = S;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, S, S);
        patternTex = new THREE.CanvasTexture(c);
        patternTex.wrapS = THREE.RepeatWrapping;
        patternTex.wrapT = THREE.RepeatWrapping;
        patternTex.repeat.set(2, 1.2);
        patternTex.anisotropy = 8;
        potMat.map = patternTex;
        potMat.color.set(0xffffff);
        potMat.bumpMap = null;
        potMat.bumpScale = 0;
        potMat.roughness = 0.35;
        potMat.needsUpdate = true;
      };
      img.onerror = (e) => console.error('纹样加载失败:', imgUrl, e);
      img.src = encodeURI(imgUrl);
    },
    // 把 3D canvas 移到新容器（step2→step4/step5 复用同一场景）
    attachTo(newContainer) {
      if (!newContainer) return;
      newContainer.style.position = 'relative';
      newContainer.appendChild(canvas);
      container = newContainer;
      resize();
    },
    getCanvas() { return canvas; },
    getShape() {
      return { y: baseY, r: baseR, s: curScale, n: N };
    }
  };
})();
