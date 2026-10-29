/* ============================================================
 * 窑变盲盒 kilnbox.js
 * 机制：选坯 → 烧制（升温动画）→ 开窑 → 生成随机窑变釉
 * 原理还原：钧釉以铜为着色剂，高温还原焰中铜离子价态
 * 变化 + 釉层流动，形成独一无二的窑变斑彩。
 * ============================================================ */
(function () {
    'use strict';

    /* ---------- 器型轮廓（与选坯卡片 SVG 完全一致，100x100 空间）
     * body：外壁闭合轮廓（用于裁剪填充，避免口沿内线造成镂空）
     * path：完整轮廓（含口沿内线，用于描边） ---------- */
    const SHAPES = {
        bowl: {
            key: 'kilnbox.shapeName.bowl',
            body: 'M18,38 Q20,72 50,76 Q80,72 82,38 Z',
            path: 'M18,38 Q20,72 50,76 Q80,72 82,38 Q66,46 50,46 Q34,46 18,38 Z'
        },
        vase: {
            key: 'kilnbox.shapeName.vase',
            body: 'M42,12 Q40,22 36,30 Q28,42 28,56 Q28,80 50,82 Q72,80 72,56 Q72,42 64,30 Q60,22 58,12 Z',
            path: 'M42,12 Q40,22 36,30 Q28,42 28,56 Q28,80 50,82 Q72,80 72,56 Q72,42 64,30 Q60,22 58,12 Q54,16 50,16 Q46,16 42,12 Z'
        },
        zun: {
            key: 'kilnbox.shapeName.zun',
            body: 'M30,14 Q46,24 38,38 Q26,56 30,72 Q33,84 50,85 Q67,84 70,72 Q74,56 62,38 Q54,24 70,14 Z',
            path: 'M30,14 Q46,24 38,38 Q26,56 30,72 Q33,84 50,85 Q67,84 70,72 Q74,56 62,38 Q54,24 70,14 Q60,20 50,20 Q40,20 30,14 Z'
        },
        plate: {
            key: 'kilnbox.shapeName.plate',
            body: 'M14,52 Q14,74 50,76 Q86,74 86,52 Z',
            path: 'M14,52 Q14,74 50,76 Q86,74 86,52 Q70,62 50,62 Q30,62 14,52 Z'
        }
    };

    /* ---------- 窑变调色板 ---------- */
    const BASES = [ // 底色：天蓝 / 月白 / 豆青
        { top: '#5e8fb8', mid: '#8fb3cd', bot: '#c3d6de' },
        { top: '#7ba7c9', mid: '#a9c6d8', bot: '#d8e4e8' },
        { top: '#6f9e9a', mid: '#9fc2ba', bot: '#d2e2d8' }
    ];
    const BLOBS = [ // 斑彩：铜红系
        { c: [122, 60, 110], key: 'kilnbox.blob.meigui' },   // 玫瑰紫
        { c: [176, 58, 72],  key: 'kilnbox.blob.haitang' },  // 海棠红
        { c: [93, 48, 108],  key: 'kilnbox.blob.qiepi' },    // 茄皮紫
        { c: [196, 92, 96],  key: 'kilnbox.blob.yanzhi' },   // 胭脂红
        { c: [150, 70, 60],  key: 'kilnbox.blob.zhusha' }    // 朱砂红
    ];

    /* ---------- 状态 ---------- */
    let chosenShape = null;
    let currentPiece = null; // {shapeKey, glazeKey, rating, ratingKey, descKey, base, blobs}

    /* i18n 取值（缺字典时回退 key） */
    function T(key) {
        return (window.SongCiI18N) ? window.SongCiI18N.t(key) : key;
    }
    /* 拼件名：zh = 釉色+窑变+器型；en = Glaze + Transmutation + Shape */
    function pieceName(p) {
        return T(p.glazeKey) + T('kilnbox.piece.middle') + T(p.shapeNameKey);
    }
    /* 用当前语言重绘开窑结果文字（不重摇算法） */
    function renderPiece() {
        if (!currentPiece) return;
        document.getElementById('kbPieceName').textContent = pieceName(currentPiece);
        document.getElementById('kbRating').textContent = T('kilnbox.rating.label') + T(currentPiece.ratingKey);
        document.getElementById('kbDesc').textContent = T(currentPiece.descKey);
        document.getElementById('kbTrivia').textContent = T('kilnbox.trivia');
    }
    /* 切换语言后重渲染当前结果 */
    window.addEventListener('langchange', renderPiece);

    const step1 = document.getElementById('kbStep1');
    const step2 = document.getElementById('kbStep2');
    const step3 = document.getElementById('kbStep3');
    const toFireBtn = document.getElementById('kbToFire');

    /* ---------- 步骤一：选坯 ---------- */
    document.querySelectorAll('.kb-shape-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.kb-shape-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            chosenShape = item.dataset.shape;
            toFireBtn.disabled = false;
        });
    });

    toFireBtn.addEventListener('click', () => {
        step1.classList.remove('active');
        step2.classList.add('active');
        runFiring();
    });

    /* ---------- 步骤二：升温烧制 ---------- */
    function runFiring() {
        var fill = document.getElementById('kbTempFill');
        var text = document.getElementById('kbTempText');
        var DUR = 3400, TARGET = 1280;
        var t0 = performance.now();
        // 用 setTimeout 步进而非 rAF：后台标签页 rAF 会被节流，导致流程卡死
        (function tick() {
            var p = Math.min(1, (performance.now() - t0) / DUR);
            var eased = 1 - Math.pow(1 - p, 2);
            fill.style.width = (eased * 100) + '%';
            text.textContent = Math.round(eased * TARGET) + '℃';
            if (p < 1) setTimeout(tick, 60);
            else setTimeout(openKiln, 500);
        })();
    }

    /* ---------- 步骤三：开窑 ---------- */
    function openKiln() {
        step2.classList.remove('active');
        step3.classList.add('active');
        document.getElementById('kbBottomBar').style.display = 'flex'; // 底部导航栏随开窑出现
        const flash = document.getElementById('kbFlash');
        flash.classList.add('go');

        const piece = generateKilnChange();
        currentPiece = piece;
        drawPiece(document.getElementById('kbCanvas'), piece, 1);

        renderPiece();

        // 珍品级彩蛋：授予「万彩窑主」印记
        if (piece.rating === 3 && window.SongCiSeals) {
            window.SongCiSeals.award('wancai', T('kilnbox.seal.wancai'));
        }
    }

    /* ---------- 窑变生成算法 ---------- */
    function generateKilnChange() {
        const shape = SHAPES[chosenShape];
        const base = BASES[rand(BASES.length)];
        const fortune = Math.random(); // 本窑运势
        // 斑彩数量：运势越好斑越丰
        let nBlobs = 3 + Math.floor(fortune * 6) + rand(2); // 3~10
        const blobs = [];
        for (let i = 0; i < nBlobs; i++) {
            const b = BLOBS[rand(BLOBS.length)];
            blobs.push({
                x: 0.18 + Math.random() * 0.64,
                y: 0.12 + Math.random() * 0.56, // 偏上半部（铜红易在肩部聚集）
                rx: 0.10 + Math.random() * 0.16,
                ry: 0.16 + Math.random() * 0.22, // 垂直拉长 = 釉下流动感
                c: b.c, key: b.key,
                alpha: 0.55 + Math.random() * 0.4
            });
        }
        // 评级：斑块覆盖与运势综合
        const rating = fortune > 0.82 ? 3 : fortune > 0.45 ? 2 : 1;
        const mainBlob = mode(blobs.map(b => b.key));
        const glazeKey = rating === 1 ? 'kilnbox.glaze.tianqing' : mainBlob;
        return { shapeKey: chosenShape, shapeNameKey: shape.key, base, blobs, rating, ratingKey: 'kilnbox.rating.' + rating, glazeKey, descKey: 'kilnbox.desc.' + rating };
    }

    /* ---------- 绘制（canvas）：器型轮廓与选坯卡片完全一致 ---------- */
    function drawPiece(canvas, piece, scale) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // 器型路径：直接复用卡片 SVG 轮廓（100x100 空间）
        const shape = SHAPES[piece.shapeKey];
        const bodyPath = new Path2D(shape.body);  // 外壁闭合轮廓：裁剪填充
        const path = new Path2D(shape.path);      // 完整轮廓：描边
        const s = Math.min(W / 100, H / 100) * 0.92;   // 等比缩放，保持轮廓比例
        const ox = (W - 100 * s) / 2, oy = (H - 100 * s) / 2;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(s, s);

        // 展台阴影（100 空间）
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(50, 91, 40, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.clip(bodyPath);

        // 釉底：垂直渐变（口沿薄釉色浅、积釉处色深）
        const g = ctx.createLinearGradient(0, 8, 0, 92);
        g.addColorStop(0, piece.base.bot);
        g.addColorStop(0.45, piece.base.mid);
        g.addColorStop(1, piece.base.top);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 100, 100);

        // 窑变斑彩：multiply 叠加，模拟釉下流动
        ctx.globalCompositeOperation = 'multiply';
        for (const b of piece.blobs) {
            const bx = 100 * b.x, by = 100 * b.y;
            const rg = ctx.createRadialGradient(bx, by + 100 * b.ry * 0.3, 1.5, bx, by, 100 * b.rx * 1.9);
            const [r, gg, bb] = b.c;
            rg.addColorStop(0, `rgba(${r},${gg},${bb},${b.alpha})`);
            rg.addColorStop(0.62, `rgba(${r},${gg},${bb},${b.alpha * 0.55})`);
            rg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = rg;
            ctx.save();
            ctx.translate(bx, by);
            ctx.scale(1, b.ry / b.rx);
            ctx.translate(-bx, -by);
            ctx.beginPath();
            ctx.arc(bx, by, 100 * b.rx * 1.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';

        // 釉面立体光影：左暗右亮，增强瓷器质感
        const shade = ctx.createLinearGradient(0, 0, 100, 0);
        shade.addColorStop(0, 'rgba(0,0,0,0.16)');
        shade.addColorStop(0.32, 'rgba(255,255,255,0)');
        shade.addColorStop(0.72, 'rgba(255,255,255,0.20)');
        shade.addColorStop(1, 'rgba(255,255,255,0.06)');
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, 100, 100);

        // 底部积釉：器足处色深
        const footG = ctx.createLinearGradient(0, 74, 0, 90);
        footG.addColorStop(0, 'rgba(0,0,0,0)');
        footG.addColorStop(1, 'rgba(0,0,0,0.14)');
        ctx.fillStyle = footG;
        ctx.fillRect(0, 74, 100, 18);

        // 釉下细斑（气泡感）
        for (let i = 0; i < 160; i++) {
            const x = Math.random() * 100, y = Math.random() * 100;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(60,40,60,0.05)';
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 0.42 + 0.08, 0, Math.PI * 2);
            ctx.fill();
        }

        // 玉质高光
        const hl = ctx.createRadialGradient(34, 30, 1.5, 34, 30, 42);
        hl.addColorStop(0, 'rgba(255,255,255,0.32)');
        hl.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hl;
        ctx.fillRect(0, 0, 100, 100);

        ctx.restore(); // 取消裁剪与缩放

        // 器型轮廓描边：与卡片线条一致的柔和釉色
        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(s, s);
        ctx.strokeStyle = 'rgba(80,60,45,0.4)';
        ctx.lineWidth = 2 / s;
        ctx.stroke(path);
        ctx.restore();
    }

    /* ---------- 保存 / 分享 ---------- */
    document.getElementById('kbSaveBtn').addEventListener('click', () => {
        if (!currentPiece) return;
        const saved = JSON.parse(localStorage.getItem('songciCollections') || '[]');
        saved.unshift({
            id: 'kiln_' + Date.now(),
            imgSrc: 'img/钧窑海报.png',
            author: T('kilnbox.save.author'),
            desc: pieceName(currentPiece) + ' · ' + T(currentPiece.ratingKey),
            time: new Date().toLocaleDateString()
        });
        localStorage.setItem('songciCollections', JSON.stringify(saved));
        toast(T('kilnbox.toast.saved'));
    });

    document.getElementById('kbShareBtn').addEventListener('click', () => {
        if (!currentPiece) return;
        const card = document.createElement('canvas');
        card.width = 1000; card.height = 1250;
        const c = card.getContext('2d');
        // 宣纸底
        c.fillStyle = '#f7f3ea'; c.fillRect(0, 0, 1000, 1250);
        c.strokeStyle = '#1a3c34'; c.lineWidth = 3;
        c.strokeRect(36, 36, 928, 1178);
        c.lineWidth = 1;
        c.strokeRect(48, 48, 904, 1154);
        // 器
        const inner = document.createElement('canvas');
        inner.width = 560; inner.height = 620;
        drawPiece(inner, currentPiece, 1);
        c.drawImage(inner, 220, 150);
        // 文案
        var isEn = window.SongCiI18N && window.SongCiI18N.current === 'en';
        c.textAlign = 'center';
        c.fillStyle = '#1a3c34';
        c.font = '44px SimSun, serif';
        c.fillText(T('kilnbox.share.slogan'), 500, 880);
        c.font = '60px SimSun, serif';
        c.fillText(pieceName(currentPiece), 500, 972);
        c.fillStyle = '#c2491d';
        c.font = '32px SimSun, serif';
        var ratingLine = isEn ? '(' + T(currentPiece.ratingKey) + ')' : '「' + T(currentPiece.ratingKey) + '」';
        c.fillText(ratingLine, 500, 1036);
        c.fillStyle = '#8a7a68';
        c.font = '24px SimSun, serif';
        c.fillText(T('kilnbox.share.footer'), 500, 1150);
        // 下载
        const a = document.createElement('a');
        a.download = T('kilnbox.file.prefix') + pieceName(currentPiece) + '.png';
        a.href = card.toDataURL('image/png');
        a.click();
        toast(T('kilnbox.toast.shared'));
    });

    document.getElementById('kbAgainBtn').addEventListener('click', () => {
        step3.classList.remove('active');
        step1.classList.add('active');
        document.getElementById('kbBottomBar').style.display = 'none'; // 返回选坯时隐藏
    });

    /* ---------- 工具 ---------- */
    function rand(n) { return Math.floor(Math.random() * n); }
    function mode(arr) {
        const m = {};
        arr.forEach(x => m[x] = (m[x] || 0) + 1);
        return Object.keys(m).reduce((a, b) => m[a] >= m[b] ? a : b);
    }
    let toastTimer = null;
    function toast(msg) {
        let el = document.querySelector('.kb-toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'kb-toast';
            el.style.cssText = 'position:fixed;top:45%;left:50%;transform:translate(-50%,-50%);padding:16px 34px;background:rgba(26,60,52,.92);color:#fff;border-radius:10px;font-size:17px;letter-spacing:2px;z-index:9999;box-shadow:0 6px 24px rgba(0,0,0,.3);';
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.display = 'block';
        el.style.opacity = '1';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.style.display = 'none', 350); }, 2200);
    }
})();
