/* ============================================================
 * 宋瓷五窑纪 · 滚动入场动效（scroll-reveal）
 * 自动为内容区块添加入场动画：进入视口时淡入上移
 * 兼容：IntersectionObserver 不可用时直接显示（不阻塞内容）
 * ============================================================ */
(function () {
  'use strict';

  // 内容区块白名单：仅对静态内容块启用，排除动态显隐/导航/轮播/3D 区域
  // 五窑详情页采用细粒度元素（档案条目/卡片/图片逐项入场），避免整块整体出现
  var SELECTORS = [
    '.porcelain-card', '.quest-banner', '.quest-banner-cards',
    '.info-item', '.content-title', '.content-text', '.detail-img', '.guide-btn',
    '.module-title', '.pattern-item', '.glaze-card', '.classic-card', '.quiz-card',
    '.funfact-card', '.qna-item',
    '.story-bar', '.kb-btn-group', '.kb-info',
    '.lab-panel', '.lab-science',
    '.game-card', '.diy-main',
    '.work-card', '.upload-area', '.comment-area',
    '.collections-area', '.collection-card',
    '.contact-wrapper', '.contact-form', '.contact-info',
    '.step-card', '.craftsman-card', '.achievement-module'
  ];

  // 收集应启用入场动画的元素（祖先已匹配则跳过子级，避免嵌套动画）
  function collect() {
    var els = [];
    var i, j, el, ancestor;
    for (i = 0; i < SELECTORS.length; i++) {
      var list = document.querySelectorAll(SELECTORS[i]);
      for (j = 0; j < list.length; j++) {
        el = list[j];
        ancestor = null;
        for (var k = 0; k < SELECTORS.length; k++) {
          var p = el.parentElement ? el.parentElement.closest(SELECTORS[k]) : null;
          if (p) { ancestor = p; break; }
        }
        if (!ancestor) els.push(el);
      }
    }
    return els;
  }

  function init() {
    var els = collect();
    if (!els.length) return;

    // 打上 reveal 初始态（opacity:0 + 上移），并按序错峰（stagger）
    els.forEach(function (el, idx) {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = ((idx % 4) * 70) + 'ms';
    });

    // 强制显示：将当前视口内未 reveal 的元素立即显示（兜底）
    function forceVisible() {
      els.forEach(function (el) {
        if (el.classList.contains('revealed')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add('revealed');
          el.style.transitionDelay = '0ms';
        }
      });
    }

    // 无 IntersectionObserver 时直接全部显示（兜底）
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          en.target.style.transitionDelay = '0ms';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });

    // 滚动/缩放兜底：环境异常导致 IO 不回调时，滚动后立即显示视口内元素
    var t = null;
    window.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(forceVisible, 80);
    }, { passive: true });
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(forceVisible, 120);
    }, { passive: true });

    // 兜底：2.5s 后仍在视口内但未显示的元素，强制显示（防止异常阻塞内容）
    setTimeout(forceVisible, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
