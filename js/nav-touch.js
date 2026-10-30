/* ============================================================
 * 宋瓷五窑纪 · 触屏导航支持（手机/平板下拉菜单）
 * 桌面端 hover 已可用；本脚本仅在触屏设备启用：
 * 点击「五大名窑 / 更多」展开或收起下拉，点击别处自动收起
 * ============================================================ */
(function () {
    'use strict';
    var TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
    if (!TOUCH) return; // 桌面端保持 hover 行为

    function closeAll() {
        document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
            d.classList.remove('open');
        });
    }

    document.addEventListener('click', function (e) {
        var dd = e.target.closest('.nav-dropdown');
        var all = document.querySelectorAll('.nav-dropdown');

        if (!dd) {
            // 点击页面其他区域：收起所有下拉
            all.forEach(function (d) { d.classList.remove('open'); });
            return;
        }

        var trigger = dd.children[0]; // 触发链接（五大名窑 / 更多）
        var content = dd.querySelector('.dropdown-content');
        var isTrigger = trigger && (e.target === trigger || trigger.contains(e.target));

        if (isTrigger) {
            // 点击触发链接：阻止 # 跳转，展开/收起
            e.preventDefault();
            var wasOpen = dd.classList.contains('open');
            all.forEach(function (d) { d.classList.remove('open'); });
            if (!wasOpen) dd.classList.add('open');
        } else if (!(content && content.contains(e.target))) {
            // 点击下拉内容之外的区域（含另一个下拉的触发）：收起
            all.forEach(function (d) { d.classList.remove('open'); });
        }
        // 点击下拉菜单项本身：不拦截，正常跳转
    });
})();
