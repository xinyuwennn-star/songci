/* =====================================================
 * 宋瓷五窑纪 - 中英文切换核心 (i18n.js)
 * 依赖：页面中先引入 lang-*.js 字典文件，
 *       它们向 window.SONCI_I18N_DICT 注入 { key: {zh, en} }。
 * 用法：
 *   - 元素加 data-i18n="key"        → 替换 textContent
 *   - 元素加 data-i18n-html="key"   → 替换 innerHTML（含 <br> 等）
 *   - 输入框加 data-i18n-placeholder="key" → 替换 placeholder
 *   - 元素加 data-i18n-title="key"  → 替换 title 属性
 *   - 导航栏放 <button id="langToggle">EN</button> 点击切换
 *   - 动态渲染逻辑监听 window 'langchange' 事件刷新
 * ===================================================== */
(function (window, document) {
    'use strict';

    var STORAGE_KEY = 'songci_lang';
    var DICT_KEY = 'SONCI_I18N_DICT';

    var Lang = {
        current: 'zh',
        dict: {},

        init: function () {
            var saved = null;
            try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
            this.current = (saved === 'en' || saved === 'zh') ? saved : 'zh';
            this.dict = window[DICT_KEY] || {};
            this.apply();
            this.bindToggle();
        },

        /* 取当前语言文本，缺省回退中文、再回退 key */
        t: function (key) {
            var entry = this.dict[key];
            if (!entry) return key;
            var v = entry[this.current];
            if (v !== undefined && v !== null && v !== '') return v;
            return entry['zh'] !== undefined ? entry['zh'] : key;
        },

        apply: function () {
            var i;

            var nodes = document.querySelectorAll('[data-i18n]');
            for (i = 0; i < nodes.length; i++) {
                nodes[i].textContent = this.t(nodes[i].getAttribute('data-i18n'));
            }

            var htmlNodes = document.querySelectorAll('[data-i18n-html]');
            for (i = 0; i < htmlNodes.length; i++) {
                htmlNodes[i].innerHTML = this.t(htmlNodes[i].getAttribute('data-i18n-html'));
            }

            var phNodes = document.querySelectorAll('[data-i18n-placeholder]');
            for (i = 0; i < phNodes.length; i++) {
                phNodes[i].setAttribute('placeholder', this.t(phNodes[i].getAttribute('data-i18n-placeholder')));
            }

            var titleNodes = document.querySelectorAll('[data-i18n-title]');
            for (i = 0; i < titleNodes.length; i++) {
                titleNodes[i].setAttribute('title', this.t(titleNodes[i].getAttribute('data-i18n-title')));
            }

            var altNodes = document.querySelectorAll('[data-i18n-alt]');
            for (i = 0; i < altNodes.length; i++) {
                altNodes[i].setAttribute('alt', this.t(altNodes[i].getAttribute('data-i18n-alt')));
            }

            var toggle = document.getElementById('langToggle');
            if (toggle) {
                toggle.textContent = (this.current === 'zh') ? 'EN' : '中文';
            }

            document.documentElement.setAttribute('lang', this.current === 'zh' ? 'zh-CN' : 'en');

            // 浏览器标签页标题（各语言文件提供 document.title key）
            if (this.dict['document.title']) {
                document.title = this.t('document.title');
            }

            window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: this.current } }));
        },

        setLang: function (lang) {
            if (lang !== 'zh' && lang !== 'en') return;
            this.current = lang;
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
            this.apply();
        },

        toggle: function () {
            this.setLang(this.current === 'zh' ? 'en' : 'zh');
        },

        bindToggle: function () {
            var toggle = document.getElementById('langToggle');
            if (toggle) {
                toggle.addEventListener('click', function () { Lang.toggle(); });
            }
        }
    };

    window.SongCiI18N = Lang;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { Lang.init(); });
    } else {
        Lang.init();
    }
})(window, document);
