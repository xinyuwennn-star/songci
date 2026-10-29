/* ============================================================
 * 宋瓷五窑纪 · 真实 3D 瓷器模型渲染（Three.js + GLB）
 * 将五个名窑的 OBJ 简化模型放入各窑页面顶部 header
 * 交互：拖拽任意方向旋转 / 滚轮缩放 / 自动旋转
 * ============================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  const header = document.querySelector('.detail-header');
  if (!header) return;

  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  const kilnKey = page.replace('.html', '');

  const canvas = document.createElement('canvas');
  canvas.id = 'porcelain3dCanvas';
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:grab;touch-action:none;';
  header.style.position = 'relative';
  header.insertBefore(canvas, header.firstChild);

  /* ---------- 加载提示：模型解析期间显示 ---------- */
  const loading = document.createElement('div');
  loading.className = 'porc-loading';
  loading.textContent = '入窑开彩中…';
  header.appendChild(loading);

  /* ---------- 渲染器 / 场景 / 相机 ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4.5);
  camera.lookAt(0, 0, 0);

  /* ---------- 灯光：模拟展厅打光（明亮展示） ---------- */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x55665f, 1.15);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe8ff, 0.65);
  fill.position.set(-4, 1, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff3d6, 0.85);
  rim.position.set(-1, 3, -4);
  scene.add(rim);

  /* ---------- 模型容器 ----------
   * pivot：负责把模型几何中心平移到原点；
   * group：负责缩放与旋转（绕原点 = 绕模型几何中心，旋转轴合理） */
  const pivot = new THREE.Group();
  const group = new THREE.Group();
  group.rotation.order = 'YXZ'; // 任意方向 360° 旋转，避免万向锁
  group.add(pivot);
  scene.add(group);

  let baseScale = 1;
  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  function fitModel() {
    box.setFromObject(pivot);
    box.getCenter(center);
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim) return;
    // 归一化：最长边 = 1；pivot 平移让模型几何中心回到原点
    baseScale = 1 / maxDim;
    group.scale.set(baseScale, baseScale, baseScale);
    pivot.position.set(-center.x, -center.y, -center.z);
    updateCamera();
  }

  function updateCamera() {
    // 让模型高度约占画布高度 58%
    const h = header.clientHeight || 800;
    const targetRatio = 0.58;
    const dist = 1 / (2 * Math.tan(THREE.MathUtils.degToRad(35) / 2) * targetRatio);
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    camera.aspect = Math.max(0.5, (header.clientWidth || 1200) / h);
    camera.updateProjectionMatrix();
  }

  /* ---------- 加载 GLB（内嵌 base64，规避 file:// 下 fetch 被拦截） ---------- */
  const loader = new THREE.GLTFLoader();
  let modelReady = false;
  const hint = document.createElement('div');
  hint.style.cssText = 'position:absolute;bottom:56px;left:0;right:0;text-align:center;' +
    'color:rgba(255,255,255,0.55);font-size:13px;pointer-events:none;z-index:2;';
  function setHint() {
    hint.textContent = (window.SongCiI18N && SongCiI18N.t('porc.dragHint')) || '拖拽任意方向旋转360° · 滚轮缩放';
  }
  setHint();
  window.addEventListener('langchange', setHint);
  header.appendChild(hint);

  /* ---------- 模型控制条：自动旋转 / 快捷视角 / 缩放重置 / 截图 ---------- */
  const controls = document.createElement('div');
  controls.className = 'porc-controls';
  header.appendChild(controls);

  const CTL = [
    { id: 'spin',    key: 'porc.spin',    on: true },
    { id: 'front',   key: 'porc.front' },
    { id: 'top',     key: 'porc.top' },
    { id: 'angle45', key: 'porc.angle45' },
    { id: 'reset',   key: 'porc.reset' },
    { id: 'shot',    key: 'porc.shot' }
  ];
  const btnEls = {};
  CTL.forEach(function (c) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'porc-btn' + (c.on ? ' on' : '');
    b.addEventListener('click', function () { onControl(c.id); });
    controls.appendChild(b);
    btnEls[c.id] = b;
  });
  function applyCtlLabels() {
    if (!window.SongCiI18N) return;
    CTL.forEach(function (c) { btnEls[c.id].textContent = window.SongCiI18N.t(c.key); });
  }
  applyCtlLabels();
  window.addEventListener('langchange', applyCtlLabels);

  function setHint(text) {
    hint.textContent = text;
  }

  try {
    const b64 = window.PORCELAIN_MODEL || '';
    if (!b64) throw new Error('PORCELAIN_MODEL 缺失');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    loader.parse(bytes.buffer, '', function (gltf) {
      pivot.add(gltf.scene);
      // 陶瓷为非金属材质：金属度归零，避免釉面发黑；保留粗糙度贴图控制光泽
      gltf.scene.traverse(function (obj) {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(function (m) {
            m.metalness = 0;
            m.needsUpdate = true;
          });
        }
      });
      fitModel();
      modelReady = true;
      loading.classList.add('done');
      render(); // 模型就绪后立即出图
      header.dataset.porc3d = 'ok';
    }, function (err) {
      console.error('[porcelain3d] 模型解析失败:', err);
      loading.classList.add('done');
      header.dataset.porc3d = 'error';
      setHint('3D 模型加载失败');
    });
  } catch (e) {
    console.error('[porcelain3d] 初始化失败:', e);
    loading.classList.add('done');
    header.dataset.porc3d = 'error';
    setHint('3D 模型加载失败');
  }

  /* ---------- 尺寸适配 ---------- */
  let W = 0, H = 0;
  function resize() {
    W = header.clientWidth;
    H = header.clientHeight;
    renderer.setSize(W, H, false);
    updateCamera();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- 交互：拖拽任意角度 360° 旋转 / 双指与滚轮缩放 / 自动旋转 ---------- */
  let rotX = 0, rotY = 0, autoSpin = true, zoom = 1;
  let spinForced = null;   // null=自动（拖拽后 4 秒恢复）｜true=始终旋转｜false=保持停止
  let dragging = false, lastMX = 0, lastMY = 0;
  let pinchDist = 0;
  let spinGraceTimer = null;

  function resumeSpinAfter(delay) {
    clearTimeout(spinGraceTimer);
    if (spinForced !== false) autoSpin = false;
    spinGraceTimer = setTimeout(function () {
      if (spinForced !== false) autoSpin = true;
    }, delay);
  }

  function syncSpinButton() {
    if (btnEls.spin) btnEls.spin.classList.toggle('on', spinForced !== false);
  }

  /* 快捷视角预设（相机固定于 +Z 看向原点，旋转模型；group 旋转顺序 YXZ） */
  const VIEWS = {
    front:   { rx: 0, ry: 0 },
    top:     { rx: 1.05,  ry: 0 },
    angle45: { rx: -0.28, ry: Math.PI / 4 }
  };

  function onControl(id) {
    switch (id) {
      case 'spin':
        if (spinForced === null) spinForced = autoSpin ? false : true;
        else spinForced = !spinForced;
        clearTimeout(spinGraceTimer);
        autoSpin = spinForced;
        syncSpinButton();
        break;
      case 'front':
      case 'top':
      case 'angle45': {
        const v = VIEWS[id];
        rotX = v.rx; rotY = v.ry;
        resumeSpinAfter(4000);
        break;
      }
      case 'reset':
        zoom = 1;
        break;
      case 'shot':
        capturePNG();
        break;
    }
  }

  /* 截图分享：渲染一帧后 canvas 导出 PNG */
  function capturePNG() {
    try {
      render();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = (kilnKey || 'porcelain') + '-3d.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('[porcelain3d] 截图失败:', e);
    }
  }

  canvas.addEventListener('mousedown', function (e) {
    dragging = true;
    clearTimeout(spinGraceTimer);
    lastMX = e.clientX; lastMY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    rotY += (e.clientX - lastMX) * 0.008;
    rotX += (e.clientY - lastMY) * 0.008;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging = false; canvas.style.cursor = 'grab';
    resumeSpinAfter(4000);
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    zoom *= (e.deltaY > 0) ? 0.93 : 1.07;
    zoom = Math.max(0.55, Math.min(2.2, zoom));
  }, { passive: false });
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      dragging = true;
      clearTimeout(spinGraceTimer);
      lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      dragging = false;
      pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2 && pinchDist > 0) {
      e.preventDefault(); // 阻止浏览器双指页面缩放
      var d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (d > 0) {
        zoom *= d / pinchDist;
        zoom = Math.max(0.55, Math.min(2.2, zoom));
        pinchDist = d;
      }
    } else if (dragging && e.touches.length === 1) {
      e.preventDefault();
      rotY += (e.touches[0].clientX - lastMX) * 0.008;
      rotX += (e.touches[0].clientY - lastMY) * 0.008;
      lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', function (e) {
    if (e.touches.length === 0) {
      dragging = false;
      pinchDist = 0;
      resumeSpinAfter(4000);
    } else if (e.touches.length === 1) {
      pinchDist = 0;
    }
  });

  /* ---------- 渲染循环 ----------
   * 说明：不用 requestAnimationFrame 驱动，改用 setInterval。
   * 部分浏览器/隐藏标签环境下 rAF 不触发，会导致画面一直空白。 */
  function render() {
    try {
      if (modelReady) {
        if (autoSpin && !dragging) rotY += 0.004;
        group.rotation.set(rotX, rotY, 0);
        group.scale.set(baseScale * zoom, baseScale * zoom, baseScale * zoom);
      }
      renderer.render(scene, camera);
    } catch (e) {
      header.dataset.porcErr = String(e && e.message ? e.message : e);
    }
  }
  render();
  setInterval(render, 40); // 约 25fps，稳定出图

  // 调试暴露（供浏览器验证）
  window.__porc = { scene: scene, camera: camera, renderer: renderer, group: group, getModelReady: function () { return modelReady; } };
})();
