/* ============================================================
 * 窑主试炼 quiz.js —— 五窑知识闯关（中英双语）
 * 每窑 3 题，全对授予该窑印章（seal.js）。
 * ============================================================ */
(function () {
    'use strict';

    function t(key) {
        return (window.SongCiI18N && SongCiI18N.t(key)) || key;
    }
    function curLang() {
        return (window.SongCiI18N && SongCiI18N.current) || 'zh';
    }
    // 取双语对象 {zh, en}
    function L(b) {
        return b[curLang()] || b.zh;
    }

    var QUIZ = {
        ruyao: {
            name: { zh: '汝窑', en: 'Ru Kiln' }, color: '#6f9ec4',
            qs: [
                { q: { zh: '汝窑作为御用官窑，鼎盛烧造大约持续了多久？',
                       en: 'As an imperial kiln, roughly how long did Ru ware’s peak production last?' },
                  opts: { zh: ['约20年','约80年','约200年','整个北宋'],
                          en: ['About 20 years','About 80 years','About 200 years','The whole Northern Song'] }, a: 0,
                  why: { zh: '汝窑官窑期仅约 20 年（约1086—1125），是五大名窑中烧造最短的，传世不足百件。',
                         en: 'Ru’s imperial phase lasted only about 20 years (c.1086–1125) — the shortest of the Five Famous Kilns, with fewer than a hundred pieces surviving.' } },
                { q: { zh: '汝窑"以玛瑙入釉"，带来的典型釉下特征是？',
                       en: 'What typical under-glaze feature comes from Ru’s “agate in the glaze”?' },
                  opts: { zh: ['釉面气泡大小不一、斜向分布','釉面完全无气泡','布满金属闪光颗粒','呈现规律性螺旋纹'],
                          en: ['Bubbles of varying size, scattered diagonally','A completely bubble-free surface','Glittering metallic granules','Regular spiral patterns'] }, a: 0,
                  why: { zh: '玛瑙入釉使釉面气泡大小不一、斜向分布，不同光线下釉色变幻，这是汝釉的重要特征。',
                         en: 'Agate in the glaze produces bubbles of varying size scattered diagonally, shifting tone under different light — a hallmark of Ru glaze.' } },
                { q: { zh: '鉴别汝瓷的重要依据"芝麻挣钉"指的是？',
                       en: 'The “sesame spur” mark used to authenticate Ru ware refers to what?' },
                  opts: { zh: ['底部细如芝麻的支烧钉痕','釉面芝麻状斑点','口沿金色镶边','足部铁黑色'],
                          en: ['Tiny sesame-sized spur marks on the base','Sesame-like spots on the glaze','A gold rim band','Iron-black feet'] }, a: 0,
                  why: { zh: '汝窑核心御用器以细小支钉垫烧，底部留下芝麻粒大小的钉痕，是分辨汝瓷的重要依据。',
                         en: 'Core court Ru pieces were fired on tiny spurs, leaving sesame-sized marks on the base — a key identification trait.' } }
            ]
        },
        guanyao: {
            name: { zh: '官窑', en: 'Guan Kiln' }, color: '#7ba08a',
            qs: [
                { q: { zh: '南宋官窑分为哪两类？', en: 'The Southern Song Guan kilns fell into which two types?' },
                  opts: { zh: ['修内司官窑（内窑）与郊坛下官窑（新窑）','北宋官窑与南宋官窑','汝窑与钧窑','龙泉窑与哥窑'],
                          en: ['Xiuneisi (Inner) and Jiaotanxia (New) kilns','Northern and Southern Song Guan','Ru and Jun kilns','Longquan and Ge kilns'] }, a: 0,
                  why: { zh: '南宋官窑分凤凰山修内司窑（内窑）与乌龟山郊坛下窑（新窑），前者釉色莹润、工艺更精。',
                         en: 'Southern Song Guan split into the Xiuneisi kiln on Phoenix Hill and the Jiaotanxia kiln on Tortoise Hill; the former has glossier glaze and finer craft.' } },
                { q: { zh: '官窑"紫口铁足"的形成原因是？', en: 'What causes Guan’s “purple mouth, iron foot”?' },
                  opts: { zh: ['胎体含铁量高，口沿釉薄露胎呈紫、圈足露胎呈铁黑','人为描金涂色','紫金土釉料烧成','氧化铜发色'],
                          en: ['Iron-rich body: thin glaze at rim shows purple, unglazed foot shows iron black','Painted gold decoration','Purple-gold clay glaze','Copper oxide colorant'] }, a: 0,
                  why: { zh: '胎体含铁量高，口沿釉薄处透出胎色呈紫，圈足无釉处呈铁黑色，故称"紫口铁足"。',
                         en: 'The iron-rich body shows through thin glaze at the rim as purple, and the unglazed foot as iron black — hence “purple mouth, iron foot.”' } },
                { q: { zh: '宋代官窑瓷器为什么没有年款落款？', en: 'Why do Song Guan pieces bear no reign marks?' },
                  opts: { zh: ['宫廷御用，不允许落款','忘了刻','釉太厚刻不上','仿制前朝风格'],
                          en: ['Court ware — marks were forbidden','Forgotten to carve','Glaze too thick to carve','Imitating earlier dynasties'] }, a: 0,
                  why: { zh: '宋代官窑仅供皇室使用，不落年款，这与明清官窑常见的年款截然不同，也是鉴定特征之一。',
                         en: 'Song Guan served the imperial family alone, with no reign marks — unlike Ming-Qing official ware, and a key authentication trait.' } }
            ]
        },
        geyao: {
            name: { zh: '哥窑', en: 'Ge Kiln' }, color: '#b08d57',
            qs: [
                { q: { zh: '哥窑"金丝铁线"是如何形成的？', en: 'How did Ge’s “golden threads and iron wires” form?' },
                  opts: { zh: ['冷却自然开片后，用铁汁染粗纹、茶汁染细纹','烧前用金银丝镶嵌','高温一次烧成','刻花填金工艺'],
                          en: ['Natural cooling crackle, then broad lines dyed with iron liquor and fine ones with tea','Inlaid gold and silver wire before firing','Fired in one high-temperature step','Carved and filled with gold'] }, a: 0,
                  why: { zh: '开片是自然冷却产生的裂纹，之后人工染色：铁汁染粗纹成"铁线"，茶汁等染细纹成"金丝"。',
                         en: 'Crackle forms naturally on cooling, then is colored by hand: iron liquor stains broad lines (“iron wires”), tea juice the fine ones (“golden threads”).' } },
                { q: { zh: '哥窑在五大名窑中最特殊的一点是？', en: 'What makes Ge most unusual among the Five Kilns?' },
                  opts: { zh: ['窑址至今未被公认确认','产量最大','只烧白瓷','全是金代产品'],
                          en: ['Its kiln site has never been definitively identified','Highest output','Only white ware','All dated to the Jin dynasty'] }, a: 0,
                  why: { zh: '哥窑是唯一未找到公认窑址的名窑，传世器与文献记载存在差异，学界争议至今未平息。',
                         en: 'Ge is the only famous kiln without an accepted site; heirlooms differ from written records, and scholarly debate continues.' } },
                { q: { zh: '哥窑的典型釉色是？', en: 'What is Ge’s typical glaze color?' },
                  opts: { zh: ['米黄、灰青','天蓝、月白','鲜红、翠绿','乌黑、酱紫'],
                          en: ['Rice-yellow and gray-blue','Sky blue and moon white','Bright red and emerald','Jet black and aubergine'] }, a: 0,
                  why: { zh: '哥窑釉色多呈米黄、灰青，与以粉青为主的官窑形成区别。',
                         en: 'Ge glazes are mostly rice-yellow and gray-blue, distinguishing them from Guan’s powder blue.' } }
            ]
        },
        junyao: {
            name: { zh: '钧窑', en: 'Jun Kiln' }, color: '#8a5f9e',
            qs: [
                { q: { zh: '"入窑一色，出窑万彩"描述的是钧窑的什么现象？', en: '“One color in, myriad colors out” describes which Jun phenomenon?' },
                  opts: { zh: ['窑变','开片','流釉','描金'],
                          en: ['Kiln transmutation','Crackle','Dripping glaze','Painted gold'] }, a: 0,
                  why: { zh: '钧釉以铜为着色剂，在还原焰中发生化学变化，出窑时蓝紫红交织、千变万化，称为"窑变"。',
                         en: 'Copper in the Jun glaze reacts in the reducing flame, yielding unpredictable interwoven blues, reds and purples — called kiln transmutation.' } },
                { q: { zh: '钧釉中的"蚯蚓走泥纹"其实是？', en: 'Jun’s “earthworm tracks” are actually what?' },
                  opts: { zh: ['釉层流动开裂后被下层釉填充形成的工艺缺陷','故意刻画的装饰纹','胎体裂纹透出','矿物结晶'],
                          en: ['A firing flaw: flowing glaze cracks, then fills with lower glaze','Intentionally carved decoration','Body cracks showing through','Mineral crystals'] }, a: 0,
                  why: { zh: '它本是烧制时釉层局部流动、开裂后又被下层釉料填充的缺陷，因自然成趣被保留为标志特征。',
                         en: 'Originally a flaw — uneven glaze flow cracked the surface, then lower glaze filled it — its natural charm made it a Jun hallmark.' } },
                { q: { zh: '古代钧窑的窑变效果，窑工能否精确控制？', en: 'Could ancient Jun kiln workers precisely control transmutation?' },
                  opts: { zh: ['基本不能，靠经验判断，每件独一无二','完全可控','用模具控制','靠画师描绘'],
                          en: ['Hardly — by experience only, every piece unique','Fully controllable','Controlled by molds','Painted by artists'] }, a: 0,
                  why: { zh: '古代窑工只能凭经验判断窑内温度与气氛，无法控制窑变结果，因此每件钧瓷都是孤品。',
                         en: 'Ancient workers could only read temperature and atmosphere by experience; transmutation was uncontrollable, so every Jun piece is unique.' } }
            ]
        },
        dingyao: {
            name: { zh: '定窑', en: 'Ding Kiln' }, color: '#c9b48a',
            qs: [
                { q: { zh: '定窑口沿"芒口"的成因是？', en: 'What causes Ding’s “rough mouth” rims?' },
                  opts: { zh: ['覆烧法使口沿无釉','故意磨边','釉料不足','窑温过高烧失'],
                          en: ['Upside-down firing left rims unglazed','Intentionally ground edges','Insufficient glaze','Burnt away by high heat'] }, a: 0,
                  why: { zh: '定窑为提高产量采用覆烧法（器物倒扣烧制），口沿无釉形成"芒口"，后以金银铜扣镶边装饰。',
                         en: 'To raise output, Ding fired pieces upside down, leaving unglazed “rough mouths,” later banded with gold, silver or copper.' } },
                { q: { zh: '北宋徽宗时期，定窑贡瓷为何一度被皇室弃用？', en: 'Why did Emperor Huizong’s court briefly reject Ding tribute ware?' },
                  opts: { zh: ['芒口不美观且使用不适','釉色太艳丽','价格太贵','产量太少'],
                          en: ['The rough rims looked and felt unpleasant','Glaze too gaudy','Too expensive','Too low output'] }, a: 0,
                  why: { zh: '皇室嫌芒口粗糙不美观，下令禁用定窑贡瓷，转而选用釉色完整的汝窑瓷器。',
                         en: 'The court found the rough rims unattractive and uncomfortable, banned Ding tribute, and turned to fully glazed Ru ware.' } },
                { q: { zh: '定窑除了白瓷，还烧造哪些珍稀品种？', en: 'Beyond white ware, what rare varieties did Ding fire?' },
                  opts: { zh: ['紫定、黑定、绿定','青花、五彩','珐琅彩','秘色瓷'],
                          en: ['Purple, black and green Ding','Blue-and-white and wucai','Enamel colors','Mise secret-color ware'] }, a: 0,
                  why: { zh: '定窑还有酱釉紫定、黑釉黑定、绿釉绿定等珍稀品种，存世极少，其中绿定尤为罕见。',
                         en: 'Ding also made brown-glaze “Purple Ding,” black-glaze “Black Ding” and green-glaze “Green Ding,” all extremely rare — Green Ding rarest of all.' } }
            ]
        }
    };

    var KILN_ORDER = ['ruyao', 'guanyao', 'geyao', 'junyao', 'dingyao'];
    var currentKiln = null, qi = 0, score = 0, locked = false;

    var tabsBox = document.getElementById('quizTabs');
    var stage = document.getElementById('quizStage');
    var progress = document.getElementById('quizProgress');

    /* ---------- 渲染 ---------- */
    function renderTabs() {
        tabsBox.innerHTML = '';
        KILN_ORDER.forEach(function (k) {
            var d = QUIZ[k];
            var got = window.SongCiSeals && window.SongCiSeals.has(k);
            var b = document.createElement('button');
            b.className = 'quiz-tab' + (k === currentKiln ? ' active' : '') + (got ? ' got' : '');
            b.style.setProperty('--kc', d.color);
            b.innerHTML = L(d.name) + (got ? '<span class="quiz-seal-mini">✓</span>' : '');
            b.addEventListener('click', function () { startKiln(k); });
            tabsBox.appendChild(b);
        });
    }

    function renderProgress() {
        var n = window.SongCiSeals ? window.SongCiSeals.count() : 0;
        var slots = '';
        for (var i = 0; i < 5; i++) slots += '<span class="quiz-slot' + (i < n ? ' filled' : '') + '"></span>';
        progress.innerHTML = '<span class="quiz-progress-label">' + t('quiz.progressLabel') + '</span>' + slots +
            '<span class="quiz-progress-num">' + n + '/5</span>';
    }

    function startKiln(k) {
        currentKiln = k; qi = 0; score = 0;
        renderTabs();
        renderQ();
    }

    function renderQ() {
        var d = QUIZ[currentKiln];
        var item = d.qs[qi];
        locked = false;
        stage.innerHTML =
            '<p class="quiz-kiln-name" style="color:' + d.color + '">' + L(d.name) + ' · ' +
            (curLang() === 'zh' ? ('第 ' + (qi + 1) + '/3 题') : ('Q' + (qi + 1) + ' of 3')) + '</p>' +
            '<h3 class="quiz-q">' + L(item.q) + '</h3>' +
            '<div class="quiz-opts">' + L(item.opts).map(function (o, i) {
                return '<button class="quiz-opt" data-i="' + i + '">' + String.fromCharCode(65 + i) + ' · ' + o + '</button>';
            }).join('') + '</div>' +
            '<div class="quiz-why" id="quizWhy"></div>';
        stage.querySelectorAll('.quiz-opt').forEach(function (btn) {
            btn.addEventListener('click', function () { answer(+btn.dataset.i, btn); });
        });
    }

    function answer(i, btn) {
        if (locked) return;
        locked = true;
        var item = QUIZ[currentKiln].qs[qi];
        var opts = stage.querySelectorAll('.quiz-opt');
        opts[item.a].classList.add('correct');
        var why = document.getElementById('quizWhy');
        if (i === item.a) {
            score++;
            why.innerHTML = '<p class="why-text ok">' + t('quiz.correct') + L(item.why) + '</p>';
        } else {
            btn.classList.add('wrong');
            why.innerHTML = '<p class="why-text no">' + t('quiz.rightAnswer') + String.fromCharCode(65 + item.a) + '. ' + L(item.why) + '</p>';
        }
        var nav = document.createElement('div');
        nav.className = 'quiz-nav';
        var next = document.createElement('button');
        next.className = 'quiz-next';
        next.textContent = qi < 2 ? t('quiz.nextQ') : t('quiz.seeResult');
        next.addEventListener('click', function () {
            qi++;
            if (qi < 3) renderQ(); else showResult();
        });
        nav.appendChild(next);
        why.appendChild(nav);
    }

    function showResult() {
        var d = QUIZ[currentKiln];
        var pass = score === 3;
        stage.innerHTML =
            '<div class="quiz-result-box">' +
            '<p class="quiz-result-kiln" style="color:' + d.color + '">' + L(d.name) + '</p>' +
            '<p class="quiz-result-score">' + score + ' / 3</p>' +
            (pass
                ? '<p class="quiz-result-text ok">' + t('quiz.allPassed').replace('{name}', L(d.name)) + '</p>'
                : '<p class="quiz-result-text no">' + t('quiz.tryAgain') + '</p>') +
            '<div class="quiz-nav"><button class="quiz-next" id="quizRetry">' + (pass ? t('quiz.nextKiln') : t('quiz.retry')) + '</button></div>' +
            '</div>';
        if (pass && window.SongCiSeals) {
            window.SongCiSeals.award(currentKiln, L(d.name));
        }
        renderTabs();
        renderProgress();
        document.getElementById('quizRetry').addEventListener('click', function () {
            if (pass) {
                var idx = (KILN_ORDER.indexOf(currentKiln) + 1) % 5;
                startKiln(KILN_ORDER[idx]);
            } else {
                startKiln(currentKiln);
            }
        });
    }

    /* ---------- 启动 ---------- */
    renderTabs();
    renderProgress();
    startKiln('ruyao');

    /* ---------- 切语言时重渲染当前状态 ---------- */
    window.addEventListener('langchange', function () {
        renderTabs();
        renderProgress();
        if (currentKiln && stage.querySelector('.quiz-q')) {
            renderQ();
        } else if (currentKiln) {
            showResult();
        }
    });
})();
