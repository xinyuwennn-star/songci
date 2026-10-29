/* 开片实验室 crackle 页字典 */
(function (window) {
    var D = window.SONCI_I18N_DICT = window.SONCI_I18N_DICT || {};

    /* ========== 浏览器标签页标题 ========== */
    D['document.title'] = { zh: '开片实验室 · 金丝铁线如何生长 | 宋瓷五窑纪', en: 'Crackle Lab · How Golden Threads and Iron Wires Grow | Song Five Kilns' };

    /* ========== 引言段 ========== */
    D['crackle.story.p1'] = {
        zh: '瓷器的“开片”，曾让宋代窑工心惊胆战——出窑时釉面会自己裂开。后来文人们却痴迷于此：“哥窑品格，纹取冰裂为上。”釉面之下，其实藏着一场胎与釉的拉力博弈。',
        en: 'Crackle once filled Song-dynasty kiln workers with dread: the glaze would split open on its own the moment a vessel left the kiln. Later, literati fell under its spell — “of Ge ware\u2019s character, ice-crackle reigns supreme.” Beneath the glaze lies a quiet tug-of-war between body and glaze.'
    };
    D['crackle.story.p2'] = {
        zh: '拖动滑块，亲手制造一场开片，看裂纹如何爬满瓷面。',
        en: 'Drag the sliders to raise a crackle yourself, and watch the fissures crawl across the glazed surface.'
    };

    /* ========== 控制台 ========== */
    D['crackle.console'] = { zh: '窑务控制台', en: 'Kiln Control Console' };

    D['crackle.slider.delta.label'] = { zh: '胎釉膨胀差（温差）', en: 'Body–Glaze Expansion Gap (ΔT)' };
    D['crackle.slider.delta.desc'] = { zh: '差值越大，釉层收缩越受拉扯，裂纹越多越密', en: 'The wider the mismatch, the more the contracting glaze is tugged, and the denser the crackle network' };

    D['crackle.slider.thick.label'] = { zh: '釉层厚度', en: 'Glaze Thickness' };
    D['crackle.slider.thick.desc'] = { zh: '厚釉积累应力大，容易裂出长而深的纹路', en: 'A thicker glaze stores greater stress and tends to split into long, deep fissures' };

    D['crackle.slider.cool.label'] = { zh: '冷却速度', en: 'Cooling Rate' };
    D['crackle.slider.cool.desc'] = { zh: '冷却越快，应力来不及释放，开片越急骤', en: 'The faster the cooling, the less time stress has to release, and the more abrupt the crackle' };

    /* ========== 按钮 ========== */
    D['crackle.btn.fire'] = { zh: '开窑 · 冷却', en: 'Open Kiln · Cool Down' };
    D['crackle.btn.reset'] = { zh: '回炉重造', en: 'Back to the Kiln' };

    /* ========== 画布标签 / 判定区（静态初始文案） ========== */
    D['crackle.tag.awaiting'] = { zh: '待命中……', en: 'awaiting …' };
    D['crackle.tag.cooling'] = { zh: '冷却中……', en: 'Cooling…' };
    D['crackle.verdict.initialName'] = { zh: '——', en: '——' };
    D['crackle.verdict.coolingName'] = { zh: '釉面正在收缩', en: 'The glaze is contracting' };
    D['crackle.verdict.coolingDesc'] = {
        zh: '听——细微的“叮”声，是裂纹在釉下生长的声音。',
        en: 'Listen closely — that faint “ting” is the sound of fissures spreading beneath the glaze.'
    };
    D['crackle.verdict.resetDesc'] = {
        zh: '调整参数后点击「开窑 · 冷却」，观察釉面变化。',
        en: 'Tweak the parameters, then press “Open Kiln · Cool Down” to watch the glaze respond.'
    };

    /* ========== 五种开片判定（由 crackle.js 动态渲染） ========== */
    D['crackle.judge.perfect.name'] = { zh: '完好无裂 · 太完美的一窑', en: 'Flawless · A Kiln Too Perfect' };
    D['crackle.judge.perfect.tag'] = { zh: '「无开片」', en: 'No Crackle' };
    D['crackle.judge.perfect.desc'] = {
        zh: '胎釉配合默契、冷却平缓，釉面完好。但宋人偏偏觉得“无纹者反俗”——太完美，反而少了韵味。试试把温差调大？',
        en: 'Body and glaze shrink in happy accord, cooling is gentle, and the glaze comes out untouched. Yet Song taste held that “a flawless glaze is vulgar” — perfection, paradoxically, lacks charm. Try widening the expansion gap?'
    };

    D['crackle.judge.crab.name'] = { zh: '蟹爪纹 · 大开片', en: 'Crab-Claw Crackle · Wide Network' };
    D['crackle.judge.crab.tag'] = { zh: '「蟹爪纹大开片」', en: 'Crab-Claw Crackle' };
    D['crackle.judge.crab.desc'] = {
        zh: '厚釉积应力大、温差足，裂出了修长舒展的主纹——像蟹爪爬过的痕迹。汝窑、哥窑都以此为上品。',
        en: 'The thick glaze stored ample stress and the expansion gap is wide enough to carve long, sweeping primary fissures — like the tracks a crab\u2019s claws leave across mud. Both Ru and Ge ware prize this as the finest grade.'
    };

    D['crackle.judge.quench.name'] = { zh: '急冷崩裂 · 窑工伤心的一窑', en: 'Quench Cracks · The Kiln-Worker\u2019s Ruin' };
    D['crackle.judge.quench.tag'] = { zh: '「开片过急」', en: 'Crackled Too Fast' };
    D['crackle.judge.quench.desc'] = {
        zh: '冷却太急，应力瞬间释放，裂纹粗深杂乱。这一窑要赔给主顾了——但别灰心，哥窑匠人正是从这样的裂纹里悟出了“金丝铁线”。',
        en: 'Cooling was too sudden: stress released in an instant, leaving coarse, chaotic fissures deep in the glaze. This batch is owed to the client — yet take heart: Ge-ware craftsmen learned “golden threads and iron wires” from exactly such cracks.'
    };

    D['crackle.judge.ice.name'] = { zh: '冰裂纹 · 细网开片', en: 'Ice-Crackle · Fine Web' };
    D['crackle.judge.ice.tag'] = { zh: '「冰裂纹」', en: 'Ice-Crackle' };
    D['crackle.judge.ice.desc'] = {
        zh: '温差适中，裂出了细密的网状纹，像冰面初裂、也像蝉翼——这就是汝窑标志性的冰裂纹。',
        en: 'A moderate expansion gap opens a fine, web-like fissure pattern — like fresh cracks on a frozen pond, or a cicada\u2019s wing. This is the celebrated ice-crackle of Ru ware.'
    };

    D['crackle.judge.fish.name'] = { zh: '鱼子纹 · 极细碎开片', en: 'Fish-Roe Crackle · Finest Network' };
    D['crackle.judge.fish.tag'] = { zh: '「鱼子纹」', en: 'Fish-Roe Crackle' };
    D['crackle.judge.fish.desc'] = {
        zh: '细小的开片如鱼子密布，要凑近细看才辨得出——这是釉层薄、温差小的含蓄之作。',
        en: 'Minute fissures cluster like fish roe, visible only at close range — the understated work of a thin glaze and a small expansion gap.'
    };

    /* ========== 成就印章 ========== */
    D['crackle.seal.name'] = { zh: '开片实验员', en: 'Crackle Lab Technician' };

    /* ========== 原理说明 ========== */
    D['crackle.why.title'] = { zh: '为什么会开片？', en: 'Why Does Glaze Crackle?' };
    D['crackle.why.p1'] = {
        zh: '瓷器烧成冷却时，<strong>胎</strong>与<strong>釉</strong>的收缩率不同：釉收缩得比胎快，釉面就被“绷”出了裂缝。温差（膨胀系数差）决定裂纹密度，釉层厚度决定裂纹深度，冷却速度决定开片的急缓。哥窑匠人后来反其道而行，用墨汁、茶汁把裂纹染成“金丝铁线”，把缺陷变成了千年美学。汝窑的冰裂纹、蟹爪纹，原理也相同——只是开得更细、更含蓄。',
        en: 'As fired porcelain cools, the <strong>body</strong> and the <strong>glaze</strong> shrink at different rates: the glaze contracts faster than the body, and the surface is stretched until it splits. The gap in thermal expansion sets the crackle\u2019s density; glaze thickness sets its depth; and the cooling rate sets its pace. Ge-ware craftsmen later turned the tables, staining the fissures with ink and tea to create the famed “golden threads and iron wires” — turning a defect into a millennium of aesthetics. Ru ware\u2019s ice-crackle and crab-claw marks work by the same principle, only finer and more understated.'
    };
})(window);
