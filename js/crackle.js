/* ============================================================
 * 开片实验室 crackle.js
 * 模拟胎釉膨胀差导致的釉面开裂：
 *   裂纹数量 ← 温差(膨胀系数差)
 *   裂纹长度/深度 ← 釉层厚度
 *   生长速度/急缓 ← 冷却速度
 * 算法：随机种子点 + 角度随机游走的分支裂纹，逐帧生长。
 * ============================================================ */
(function () {
    'use strict';

    const canvas = document.getElementById('crackleCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H * 0.54, RX = W * 0.42, RY = H * 0.30;

    const deltaR = document.getElementById('deltaRange');
    const thickR = document.getElementById('thickRange');
    const coolR = document.getElementById('coolRange');
    const valDelta = document.getElementById('valDelta');
    const valThick = document.getElementById('valThick');
    const valCool = document.getElementById('valCool');
    const tag = document.getElementById('crackleTag');
    const verdictName = document.getElementById('verdictName');
    const verdictDesc = document.getElementById('verdictDesc');

    [[deltaR, valDelta], [thickR, valThick], [coolR, valCool]].forEach(([r, v]) => {
        r.addEventListener('input', () => v.textContent = r.value);
    });

    let cracks = [];      // 裂纹折线集合
    let rafId = null;

    /* ---------- 瓷盘绘制 ---------- */
    function drawDish() {
        ctx.clearRect(0, 0, W, H);
        // 影
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.beginPath();
        ctx.ellipse(CX, CY + RY + 16, RX * 0.9, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        // 盘体（青瓷釉）
        const g = ctx.createRadialGradient(CX - 70, CY - 80, 30, CX, CY, RX * 1.25);
        g.addColorStop(0, '#dcebe2');
        g.addColorStop(0.5, '#bcd6c8');
        g.addColorStop(1, '#8fb3a2');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
        ctx.fill();
        // 口沿
        ctx.strokeStyle = 'rgba(60,80,70,0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // 圈足
        ctx.strokeStyle = 'rgba(60,80,70,0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(CX, CY, RX * 0.72, RY * 0.72, 0, 0, Math.PI * 2);
        ctx.stroke();
        // 高光
        const hl = ctx.createRadialGradient(CX - RX * 0.35, CY - RY * 0.5, 8, CX - RX * 0.3, CY - RY * 0.45, RX * 0.7);
        hl.addColorStop(0, 'rgba(255,255,255,0.35)');
        hl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hl;
        ctx.beginPath();
        ctx.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ---------- 裂纹生成 ---------- */
    function genCracks(delta, thick, cool) {
        const seeds = Math.round(2 + delta * 2.2);            // 种子数 ← 温差
        const maxLen = 30 + thick * 26;                        // 主裂纹长 ← 釉厚
        const branchP = 0.012 + delta * 0.004;                 // 分支概率
        const jitter = 0.28 + cool * 0.03;                     // 走向抖动 ← 冷却
        const list = [];
        for (let s = 0; s < seeds; s++) {
            const a = Math.random() * Math.PI * 2;
            const rr = Math.sqrt(Math.random());
            const x0 = CX + Math.cos(a) * RX * rr * 0.8;
            const y0 = CY + Math.sin(a) * RY * rr * 0.8;
            list.push(grow(x0, y0, Math.random() * Math.PI * 2, maxLen * (0.6 + Math.random() * 0.5), jitter, branchP, thick, list, 0));
        }
        return list.filter(Boolean);
    }

    function grow(x, y, dir, len, jitter, branchP, thick, list, depth) {
        const pts = [[x, y]];
        let cx = x, cy = y, d = dir, remain = len;
        const step = 5 + thick * 0.6;
        while (remain > 0) {
            d += (Math.random() - 0.5) * 2 * jitter;
            cx += Math.cos(d) * step;
            cy += Math.sin(d) * step * 0.72; // 压扁，贴合盘面透视
            if (!insideDish(cx, cy)) break;
            pts.push([cx, cy]);
            remain -= step;
            if (depth < 2 && Math.random() < branchP * 8) {
                list.push(grow(cx, cy, d + (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.8), len * 0.45, jitter, branchP, thick, list, depth + 1));
            }
        }
        return pts.length > 2 ? { pts, depth } : null;
    }

    function insideDish(x, y) {
        const dx = (x - CX) / (RX * 0.94), dy = (y - CY) / (RY * 0.94);
        return dx * dx + dy * dy <= 1;
    }

    /* ---------- i18n 辅助 ---------- */
    function t(key) {
        return window.SongCiI18N ? window.SongCiI18N.t(key) : key;
    }
    // 当前已定格的判定 key（null = 初始/重置态）
    var settledKey = null;
    function renderVerdict() {
        if (settledKey) {
            tag.textContent = t('crackle.judge.' + settledKey + '.tag');
            verdictName.textContent = t('crackle.judge.' + settledKey + '.name');
            verdictDesc.textContent = t('crackle.judge.' + settledKey + '.desc');
        } else {
            tag.textContent = t('crackle.tag.awaiting');
            verdictName.textContent = t('crackle.verdict.initialName');
            verdictDesc.textContent = t('crackle.verdict.resetDesc');
        }
    }
    window.addEventListener('langchange', renderVerdict);

    /* ---------- 判定（返回字典 key 后缀，文案由 lang-crackle.js 提供） ---------- */
    function judge(delta, thick, cool) {
        if (delta <= 3 && thick <= 4) return 'perfect';
        if (thick >= 7 && delta >= 6) return 'crab';
        if (cool >= 8) return 'quench';
        if (delta >= 4) return 'ice';
        return 'fish';
    }

    /* ---------- 生长动画 ---------- */
    function animateCracks(result) {
        if (rafId) clearTimeout(rafId);
        const cool = +coolR.value;
        const speed = 0.008 + cool * 0.004;   // 冷却越快长得越急
        let progress = 0;
        const totalPts = result.list.reduce((s, c) => s + c.pts.length, 0);

        // setTimeout 步进：避免后台标签页 rAF 节流导致动画冻结
        (function frame() {
            progress += speed * 30;
            drawDish();
            let drawn = 0;
            const target = Math.floor(totalPts * Math.min(1, progress));
            for (const c of result.list) {
                const n = Math.min(c.pts.length, Math.max(0, target - drawn));
                if (n > 1) {
                    ctx.strokeStyle = c.depth === 0 ? 'rgba(52,40,34,0.78)' : 'rgba(52,40,34,0.55)';
                    ctx.lineWidth = c.depth === 0 ? 1.8 : 1;
                    ctx.beginPath();
                    ctx.moveTo(c.pts[0][0], c.pts[0][1]);
                    for (let i = 1; i < n; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
                    ctx.stroke();
                    // 哥窑式染色：细纹泛金
                    if (c.depth > 0) {
                        ctx.strokeStyle = 'rgba(196,154,72,0.28)';
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
                drawn += c.pts.length;
            }
            if (progress < 1) rafId = setTimeout(frame, 16);
            else rafId = null;
        })();
    }

    /* ---------- 事件 ---------- */
    document.getElementById('coolBtn').addEventListener('click', () => {
        const delta = +deltaR.value, thick = +thickR.value, cool = +coolR.value;
        drawDish();
        settledKey = null;
        tag.textContent = t('crackle.tag.cooling');
        verdictName.textContent = t('crackle.verdict.coolingName');
        verdictDesc.textContent = t('crackle.verdict.coolingDesc');
        const list = [];
        genCracks(delta, thick, cool).forEach(c => list.push(c));
        const resKey = judge(delta, thick, cool);
        setTimeout(() => {
            animateCracks({ list });
            settledKey = resKey;
            renderVerdict();
            if (window.SongCiSeals) window.SongCiSeals.award('kaipian', t('crackle.seal.name'));
        }, 350);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (rafId) clearTimeout(rafId);
        deltaR.value = 5; thickR.value = 5; coolR.value = 5;
        valDelta.textContent = valThick.textContent = valCool.textContent = '5';
        settledKey = null;
        renderVerdict();
        drawDish();
    });

    drawDish();
    renderVerdict();
})();
