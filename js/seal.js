/* ============================================================
 * 集印系统 seal.js（全站公共）
 * - 五窑印章：ruyao/guanyao/geyao/junyao/dingyao（知识闯关获得）
 * - 彩蛋印记：wancai（万彩窑主）/ kaipian（开片实验员）
 * - 在导航栏注入集印进度徽章
 * ============================================================ */
(function () {
    'use strict';

    var KEY = 'songci_seals';
    var KILNS = ['ruyao', 'guanyao', 'geyao', 'junyao', 'dingyao'];
    var KILN_NAMES = { ruyao: '汝窑', guanyao: '官窑', geyao: '哥窑', junyao: '钧窑', dingyao: '定窑' };

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
        catch (e) { return {}; }
    }
    function save(s) {
        try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    }

    var Seals = {
        has: function (id) { return !!load()[id]; },
        count: function () {
            var s = load(), n = 0;
            KILNS.forEach(function (k) { if (s[k]) n++; });
            return n;
        },
        all: function () { return load(); },
        /* 授予印章；重复授予返回 false */
        award: function (id, label) {
            var s = load();
            if (s[id]) return false;
            s[id] = { t: Date.now() };
            save(s);
            renderBadge();
            showStamp(label || KILN_NAMES[id] || id);
            return true;
        },
        isComplete: function () { return this.count() === KILNS.length; }
    };
    window.SongCiSeals = Seals;

    function t(key) {
        return (window.SongCiI18N && SongCiI18N.t(key)) || key;
    }

    /* ---------- 导航徽章 ---------- */
    function renderBadge() {
        var bar = document.querySelector('.nav-menu');
        if (!bar) return;
        var badge = document.getElementById('sealBadge');
        if (!badge) {
            badge = document.createElement('a');
            badge.id = 'sealBadge';
            badge.href = 'funfact.html';
            badge.style.cssText =
                'display:inline-flex;align-items:center;gap:6px;margin-left:10px;padding:5px 14px;' +
                'border-radius:16px;background:rgba(242,163,101,0.18);border:1px solid rgba(242,163,101,0.65);' +
                'color:#f2c185;font-size:14px;letter-spacing:1px;text-decoration:none;white-space:nowrap;' +
                'transition:all .3s ease;';
            var toggle = document.getElementById('langToggle');
            if (toggle && toggle.parentNode === bar) bar.insertBefore(badge, toggle);
            else bar.appendChild(badge);
        }
        badge.title = t('seal.title');
        var n = Seals.count();
        badge.innerHTML = '<span style="font-size:15px;">' + t('seal.badgeSeal') + '</span><span>' + n + '/5</span>' +
            (n === 5 ? '<span style="color:#ffd9a0;">' + t('seal.collected') + '</span>' : '');
    }

    /* ---------- 盖章动画 ---------- */
    function showStamp(label) {
        var old = document.getElementById('sealStampAnim');
        if (old) old.remove();
        var box = document.createElement('div');
        box.id = 'sealStampAnim';
        box.style.cssText =
            'position:fixed;top:38%;left:50%;transform:translate(-50%,-50%);z-index:10000;' +
            'display:flex;flex-direction:column;align-items:center;pointer-events:none;';
        var seal = document.createElement('div');
        seal.textContent = '印';
        seal.style.cssText =
            'width:130px;height:130px;border:5px solid #c2491d;border-radius:12px;' +
            'background:rgba(255,248,238,0.94);color:#c2491d;font-size:74px;font-family:SimSun,serif;' +
            'display:flex;align-items:center;justify-content:center;' +
            'box-shadow:0 8px 30px rgba(0,0,0,0.3);transform:rotate(-8deg);opacity:0;';
        var txt = document.createElement('p');
        txt.textContent = t('seal.got').replace('{name}', label);
        txt.style.cssText = 'margin-top:18px;color:#1a3c34;font-size:19px;letter-spacing:3px;background:rgba(255,255,255,.92);padding:8px 22px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.15);opacity:0;';
        box.appendChild(seal);
        box.appendChild(txt);
        document.body.appendChild(box);
        // 砸下动画
        seal.animate([
            { opacity: 0, transform: 'rotate(-8deg) scale(2.4)' },
            { opacity: 1, transform: 'rotate(-8deg) scale(1)', offset: 0.55 },
            { opacity: 1, transform: 'rotate(-8deg) scale(1)' }
        ], { duration: 700, easing: 'cubic-bezier(.2,1.4,.4,1)', fill: 'forwards' });
        txt.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 450, delay: 400, fill: 'forwards' });
        setTimeout(function () {
            box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
            setTimeout(function () { box.remove(); }, 520);
        }, 2300);
    }

    /* ---------- 启动 ---------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderBadge);
    } else {
        renderBadge();
    }
    window.addEventListener('langchange', renderBadge);
})();
