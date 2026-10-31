/* ============================================================
 * 宋瓷工坊 · 手势拉坯（MediaPipe Hands · 单手）
 * - 单手手腕 y 位置 → 操作高度层（手举高=捏口沿，手放低=捏底足）
 * - 拇指尖(4) 到食指尖(8) 的距离 → 该层半径（捏拢=收细，张开=拉粗）
 * - 高斯衰减让相邻层平滑过渡
 * ============================================================ */
(function () {
  'use strict';

  const btn = document.getElementById('handToggleBtn');
  const panel = document.getElementById('handPanel');
  const video = document.getElementById('handVideo');
  const canvas = document.getElementById('handCanvas');
  if (!btn || !panel || !video || !canvas) return;

  let hands = null;
  let camera = null;
  let running = false;

  btn.addEventListener('click', async () => {
    if (running) { stop(); return; }
    btn.disabled = true;
    btn.textContent = '正在启动摄像头…';
    try {
      await loadScripts();
      await start();
    } catch (e) {
      console.error(e);
      alert('摄像头启动失败：' + (e && e.message ? e.message : e) +
        '\n\n请确认：1) 已授予摄像头权限；2) 通过 http://localhost 或 https 访问。');
      btn.textContent = '开启手势拉坯';
    } finally {
      btn.disabled = false;
    }
  });

  function loadScripts() {
    const urls = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'
    ];
    return urls.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('脚本加载失败：' + src));
      document.head.appendChild(s);
    });
  }

  async function start() {
    hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);

    camera = new Camera(video, {
      onFrame: async () => { await hands.send({ image: video }); },
      width: 320,
      height: 240
    });
    await camera.start();
    panel.style.display = 'block';
    running = true;
    btn.textContent = '关闭手势拉坯';
  }

  function stop() {
    try { if (camera) camera.stop(); } catch (e) {}
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    panel.style.display = 'none';
    running = false;
    btn.textContent = '开启手势拉坯';
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)); }

  function onResults(results) {
    const ctx = canvas.getContext('2d');
    if (!canvas.width || canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
    }
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const lms = results.multiHandLandmarks || [];
    lms.forEach(lm => {
      if (typeof drawConnectors === 'function') {
        drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: '#4fe3d8', lineWidth: 2 });
        drawLandmarks(ctx, lm, { color: '#ffffff', lineWidth: 1, radius: 2 });
      }
    });
    ctx.restore();

    // 单手：手腕(0)的 y 选层，拇指尖(4)↔食指尖(8) 距离控制粗细
    if (lms.length === 1 && window.LathePot) {
      const lm = lms[0];
      const wrist = lm[0];
      const thumbTip = lm[4];
      const indexTip = lm[8];

      // 画面 y：0.2(上)~0.8(下) → 胚体 targetY：1(口沿)~0(底足)
      const targetY = 1 - clamp(wrist.y, 0.2, 0.8);
      // 拇指食指距离：0.02~0.22 → scale 0.4~1.9
      const pinch = dist(thumbTip, indexTip);
      const scale = 0.4 + (clamp(pinch, 0.02, 0.22) - 0.02) / 0.20 * 1.5;

      window.LathePot.setLayer(targetY, scale);
      syncToDiyData(targetY, scale);
    }
  }

  function syncToDiyData(targetY, scale) {
    if (!window.diyData || !window.__latheBasePts) return;
    const base = window.__latheBasePts;
    const p = window.diyData.shapePts;

    let li, ri;
    if (targetY > 0.72)      { li = 0; ri = 1; }
    else if (targetY > 0.45) { li = 2; ri = 3; }
    else if (targetY > 0.25) { li = 4; ri = 5; }
    else                     { li = 6; ri = 7; }

    const baseHalf = (base[ri] - base[li]) / 2;
    const newHalf = baseHalf * scale;
    p[li] = 50 - newHalf;
    p[ri] = 50 + newHalf;

    const layerW = p[ri] - p[li];
    const crack = document.getElementById('diyCrack');
    if (crack) crack.style.display = (layerW > 92 || layerW < 15) ? 'block' : 'none';
  }
})();
