/* ============================================================
 * 宋瓷五窑纪 · 详情页增强（五窑页共用）
 * 1) 档案区器物参考图 + 经典纹样图：悬停放大镜（查看开片 / 窑变细节）
 * 2) 四大关键词翻转卡片：点击翻面显示答案
 * 纯原生 JS，无第三方依赖
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. 参考图 / 纹样图悬停放大镜 ---------- */
  var LENS_ZOOM = 2.4;

  function initZoom() {
    var imgs = document.querySelectorAll('.detail-img, .pattern-img');
    if (!imgs.length) return;

    var lens = document.createElement('div');
    lens.className = 'zoom-lens';
    document.body.appendChild(lens);

    function hideLens() {
      lens.style.display = 'none';
    }

    imgs.forEach(function (img) {
      img.addEventListener('mouseenter', function () {
        lens.style.backgroundImage = 'url("' + img.src + '")';
        lens.style.display = 'block';
      });
      img.addEventListener('mousemove', function (e) {
        var rect = img.getBoundingClientRect();
        var x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        var y = Math.min(Math.max(e.clientY - rect.top, 0), rect.height);
        var bw = rect.width * LENS_ZOOM;
        var bh = rect.height * LENS_ZOOM;
        // 镜面中心跟随光标，光标所指位置位于镜面中心
        lens.style.left = (e.clientX - lens.offsetWidth / 2) + 'px';
        lens.style.top = (e.clientY - lens.offsetHeight / 2) + 'px';
        lens.style.backgroundSize = bw + 'px ' + bh + 'px';
        lens.style.backgroundPosition =
          (-(x * LENS_ZOOM - lens.offsetWidth / 2)) + 'px ' +
          (-(y * LENS_ZOOM - lens.offsetHeight / 2)) + 'px';
      });
      img.addEventListener('mouseleave', hideLens);
    });
    // 滚动 / 页面变化时隐藏镜面，避免残留
    window.addEventListener('scroll', hideLens, { passive: true });
  }

  /* ---------- 2. 四大关键词翻转卡片 ---------- */
  function initFlip() {
    var cards = document.querySelectorAll('.quiz-card');
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });
  }

  function init() {
    initZoom();
    initFlip();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
