/* ============================================================
 * 宋瓷五窑纪 · 触屏导航支持（手机/平板下拉菜单）
 * 桌面端 hover 已可用；本脚本仅在触屏设备启用：
 * - 点击「五大名窑 / 更多」展开或收起下拉，点击别处自动收起
 * - 手机端（≤768px）：下拉面板移出导航容器，fixed 定位浮出，
 *   避免被导航横向滚动与 backdrop-filter 裁剪
 * ============================================================ */
(function () {
    'use strict';
    var TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
    if (!TOUCH) return; // 桌面端保持 hover 行为

    var MOBILE = window.matchMedia('(max-width: 768px)');

    function closeAll() {
        document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
            d.classList.remove('open');
        });
        document.querySelectorAll('[data-nav-dropdown]').forEach(function (c) {
            c.style.display = 'none';
        });
    }

    function openDropdown(dd) {
        var content = dd.querySelector('.dropdown-content');
        if (!content) return;

        if (MOBILE.matches) {
            // 手机端：面板移出导航容器，fixed 浮出
            if (content.parentNode !== document.body) {
                document.body.appendChild(content);
            }
            content.classList.add('nav-flyout');
            content.setAttribute('data-nav-dropdown', '1');
            content.style.display = 'block';

            var navBar = document.querySelector('.nav-menu-bar');
            var base = navBar ? navBar.getBoundingClientRect() : dd.getBoundingClientRect();
            var triggerRect = dd.children[0].getBoundingClientRect();
            content.style.position = 'fixed';
            content.style.top = (base.bottom + 8) + 'px';
            content.style.left = Math.max(8, triggerRect.left) + 'px';
            content.style.right = 'auto';
            content.style.transform = 'none';
            content.style.margin = '0';
            content.style.zIndex = '99999';
            content.style.maxHeight = '70vh';
            content.style.overflowY = 'auto';
        } else {
            // 平板/桌面触屏：原位展开
            content.style.display = 'block';
        }
    }

    document.addEventListener('click', function (e) {
        var dd = e.target.closest('.nav-dropdown');
        var all = document.querySelectorAll('.nav-dropdown');

        if (!dd) {
            // 点击页面其他区域：收起所有下拉
            closeAll();
            return;
        }

        var trigger = dd.children[0]; // 触发链接（五大名窑 / 更多）
        var content = dd.querySelector('.dropdown-content');
        var isTrigger = trigger && (e.target === trigger || trigger.contains(e.target));

        if (isTrigger) {
            // 点击触发链接：阻止 # 跳转，展开/收起
            e.preventDefault();
            var wasOpen = dd.classList.contains('open');
            closeAll();
            if (!wasOpen) {
                dd.classList.add('open');
                openDropdown(dd);
            }
        } else if (!(content && content.contains(e.target))) {
            // 点击下拉内容之外的区域（含另一个下拉的触发）：收起
            closeAll();
        }
        // 点击下拉菜单项本身：不拦截，正常跳转
    });

    // 滚动时收起已展开的下拉，避免面板停留在旧位置
    window.addEventListener('scroll', function () {
        closeAll();
    }, { passive: true });
})();
