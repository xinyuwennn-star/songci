/* 窑变盲盒页面字典 */
(function (window) {
    var D = window.SONCI_I18N_DICT = window.SONCI_I18N_DICT || {};

    /* 浏览器标签页标题 */
    D['document.title'] = { zh: '窑变盲盒 · 入窑一色 出窑万彩 | 宋瓷五窑纪', en: 'Kiln-Transmutation Mystery Box · One Color In, Myriad Out | Song Five Kilns' };

    /* 剧情引子 */
    D['kilnbox.story1'] = { zh: '北宋·禹州钧台 —— 你是替宫廷烧瓷的窑工。钧瓷之美，尽在窑变：釉料入窑时只是一色天蓝，开窑那一刻，铜红釉料在高温还原焰中幻化出万紫千红。连徽宗也忍不住下令：“雨过天青釉可仿，窑变天成不可求。”', en: 'Northern Song · Juntai, Yuzhou — you are a kiln hand firing porcelain for the court. The beauty of Jun ware lies entirely in kiln transmutation: the glaze goes into the kiln a single sky blue, yet the moment the kiln opens, the copper-red glaze unfolds into a riot of purple and crimson in the high-temperature reduction flame. Even Emperor Huizong decreed: “The sky-after-rain glaze may be copied, but heaven-made kiln transmutation cannot be sought.”' };
    D['kilnbox.story2'] = { zh: '每一次开窑都是一场豪赌。今天这一窑，会烧出什么？', en: 'Every opening of the kiln is a gamble. What will this firing bring forth?' };

    /* 第一步：选坯 */
    D['kilnbox.step1.title'] = { zh: '第一步 · 选坯装窑', en: 'Step 1 · Choose the Body & Load the Kiln' };
    D['kilnbox.shape.bowl'] = { zh: '窑变碗', en: 'Transmutation Bowl' };
    D['kilnbox.shape.vase'] = { zh: '窑变瓶', en: 'Transmutation Vase' };
    D['kilnbox.shape.zun'] = { zh: '窑变尊', en: 'Transmutation Zun' };
    D['kilnbox.shape.plate'] = { zh: '窑变盘', en: 'Transmutation Dish' };
    D['kilnbox.btn.fire'] = { zh: '装窑 · 点火', en: 'Load · Light the Fire' };

    /* 第二步：烧制 */
    D['kilnbox.step2.title'] = { zh: '第二步 · 入窑烧制', en: 'Step 2 · Fire the Kiln' };
    D['kilnbox.step2.hint'] = { zh: '炉温 1280℃，还原焰……釉料中的铜、铁正在悄悄发色', en: 'Kiln at 1280°C, reduction flame… copper and iron in the glaze are quietly taking on color' };

    /* 第三步：开窑 */
    D['kilnbox.step3.title'] = { zh: '第三步 · 开窑见宝', en: 'Step 3 · Open the Kiln, Reveal the Treasure' };

    /* 底部按钮 */
    D['kilnbox.btn.save'] = { zh: '存入收藏', en: 'Save to Collection' };
    D['kilnbox.btn.share'] = { zh: '生成分享卡片', en: 'Generate Share Card' };
    D['kilnbox.btn.again'] = { zh: '再烧一窑', en: 'Fire Another Kiln' };

    /* ---------- 动态文本（由 kilnbox.js 调用） ---------- */

    /* 器型名单字（拼件名用） */
    D['kilnbox.shapeName.bowl'] = { zh: '碗', en: 'Bowl' };
    D['kilnbox.shapeName.vase'] = { zh: '瓶', en: 'Vase' };
    D['kilnbox.shapeName.zun'] = { zh: '尊', en: 'Zun' };
    D['kilnbox.shapeName.plate'] = { zh: '盘', en: 'Dish' };

    /* 釉色斑彩名 */
    D['kilnbox.blob.meigui'] = { zh: '玫瑰紫', en: 'Rose Purple' };
    D['kilnbox.blob.haitang'] = { zh: '海棠红', en: 'Crabapple Red' };
    D['kilnbox.blob.qiepi'] = { zh: '茄皮紫', en: 'Eggplant Purple' };
    D['kilnbox.blob.yanzhi'] = { zh: '胭脂红', en: 'Rouge Red' };
    D['kilnbox.blob.zhusha'] = { zh: '朱砂红', en: 'Cinnabar Red' };
    D['kilnbox.glaze.tianqing'] = { zh: '天青', en: 'Sky Blue' };

    /* 件名拼接：zh = 釉色+窑变+器型，en = Glaze + Transmutation + Shape */
    D['kilnbox.piece.middle'] = { zh: '窑变', en: ' Transmutation ' };

    /* 评级 */
    D['kilnbox.rating.label'] = { zh: '评级 · ', en: 'Rating · ' };
    D['kilnbox.rating.1'] = { zh: '常品 · 素雅天青', en: 'Common Piece · Understated Sky Blue' };
    D['kilnbox.rating.2'] = { zh: '上品 · 绚丽窑变', en: 'Fine Piece · Splendid Transmutation' };
    D['kilnbox.rating.3'] = { zh: '珍品 · 万彩天成', en: 'Treasure · Heaven-Wrought Myriad Colors' };

    /* 开窑描述（按评级 1/2/3） */
    D['kilnbox.desc.1'] = { zh: '此窑火候温稳，釉色通体天青、莹润匀净，如雨后长空——是宋人最爱的“尚青”正色。', en: 'This firing held a steady heat; the glaze comes out a uniform, lustrous sky blue, smooth as the heavens after rain — the very “veneration of blue” that Song connoisseurs prized most.' };
    D['kilnbox.desc.2'] = { zh: '铜红在还原焰中发色，紫红斑彩沿器身自然流淌，蓝紫交融，灿若云霞。', en: 'Copper red develops in the reduction flame; purple-crimson blooms flow naturally down the vessel, blue and violet blending like rosy clouds at dawn.' };
    D['kilnbox.desc.3'] = { zh: '万彩交织，紫中泛蓝、蓝中透红，斑如晚霞泼釉——这等窑变，千窑难逢一器，堪称天成！', en: 'A medley of hues — blue glinting within purple, crimson shining through blue, splashed like sunset across the glaze. Such transmutation: one piece in a thousand kilns, truly heaven-wrought!' };

    /* 冷知识 */
    D['kilnbox.trivia'] = { zh: '冷知识：钧窑窑变的本质是釉料中的铜在 1200℃ 以上还原气氛中发生化学价变化，釉层流动使色斑自然晕散——古人无法控制，只能“听天由命”，所以每件钧瓷都独一无二。', en: 'Did you know: Jun kiln transmutation occurs when copper in the glaze changes its oxidation state above 1200°C in a reducing atmosphere; as the glaze flows, the color blooms spread naturally. The ancients could not control it — they left it to fate — so every piece of Jun ware is one of a kind.' };

    /* 珍品彩蛋印记 */
    D['kilnbox.seal.wancai'] = { zh: '万彩窑主', en: 'Lord of Myriad Colors' };

    /* Toast 提示 */
    D['kilnbox.toast.saved'] = { zh: '已存入「我的收藏」', en: 'Saved to “My Collection”' };
    D['kilnbox.toast.shared'] = { zh: '分享卡片已下载，快发给瓷友吧', en: 'Share card downloaded — send it to your fellow porcelain lovers!' };

    /* 分享卡片文案 */
    D['kilnbox.share.slogan'] = { zh: '入窑一色 · 出窑万彩', en: 'One Color In, Myriad Colors Out' };
    D['kilnbox.share.footer'] = { zh: '宋瓷五窑纪 · 我在北宋烧了一窑钧瓷', en: 'Song Five Kilns · I Fired a Jun Kiln in the Northern Song' };

    /* 收藏条目作者与文件名前缀 */
    D['kilnbox.save.author'] = { zh: '@我', en: '@Me' };
    D['kilnbox.file.prefix'] = { zh: '窑变盲盒-', en: 'KilnBox-' };

})(window);
