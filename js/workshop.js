// 全局变量
let currentGame = '';
let diyData = {
	shape: '',
	shapePts: [38, 62, 22, 78, 18, 82, 32, 68],
	kiln: '',
	color: '#b3cde0',
	colorName: 'workshop.diy.glazeRu',
	pattern: null,
	patternPos: { x: 0, y: 0 },
	w: 0,
	h: 0
};
// 暴露给 hand-control.js 同步手势形变
window.diyData = diyData;

// 器型数据：clip-path 控制点（左右各4个：口沿/肩/腹/底足）、对应窑口、成品诗句
// pts: [口沿L, 口沿R, 肩L, 肩R, 腹L, 腹R, 底足L, 底足R]，都是百分比
const SHAPE_MAP = {
	ruyao: {
		pts: [30, 70, 20, 80, 15, 85, 35, 65],  // 洗：宽口浅腹
		nameKey: 'workshop.diy.shapeRu',
		kiln: 'ruyao',
		poem: { zh: '雨过天青云破处，这般颜色做将来', en: 'After rain the sky breaks clear — this hue was meant to be' }
	},
	guanyao: {
		pts: [40, 60, 30, 70, 18, 82, 38, 62],  // 瓶：窄口长身鼓腹
		nameKey: 'workshop.diy.shapeGuan',
		kiln: 'guanyao',
		poem: { zh: '金声玉色，简约大方', en: 'Golden tone, jade hue, dignified and plain' }
	},
	geyao: {
		pts: [35, 65, 30, 70, 28, 72, 35, 65],  // 杯：直筒
		nameKey: 'workshop.diy.shapeGe',
		kiln: 'geyao',
		poem: { zh: '金丝铁线，自然天成', en: 'Golden threads and iron wires, nature-made' }
	},
	junyao: {
		pts: [25, 75, 15, 85, 12, 88, 30, 70],  // 尊：敞口鼓腹
		nameKey: 'workshop.diy.shapeJun',
		kiln: 'junyao',
		poem: { zh: '入窑一色，出窑万彩', en: 'One color in, myriad colors out' }
	},
	dingyao: {
		pts: [28, 72, 18, 82, 20, 80, 38, 62],  // 碗：深腹撇口
		nameKey: 'workshop.diy.shapeDing',
		kiln: 'dingyao',
		poem: { zh: '细腻纹饰，宛若霜雪', en: 'Fine patterns, like frost and snow' }
	}
};

// 根据控制点生成 clip-path polygon
function buildClipPath(p) {
	return `polygon(${p[0]}% 0%, ${p[1]}% 0%, ${p[3]}% 25%, ${p[5]}% 55%, ${p[7]}% 100%, ${p[6]}% 100%, ${p[4]}% 55%, ${p[2]}% 25%)`;
}

// 各窑口经典纹饰
const PATTERN_MAP = {
	ruyao: [
		{ img: 'img/冰裂纹（汝）.png', name: { zh: '冰裂纹', en: 'Ice Crackle' } },
		{ img: 'img/蟹爪纹（汝）.png', name: { zh: '蟹爪纹', en: 'Crab Claw' } },
		{ img: 'img/鱼子纹（汝）.png', name: { zh: '鱼子纹', en: 'Fish Roe' } }
	],
	guanyao: [
		{ img: 'img/冰裂纹（官）.png', name: { zh: '冰裂纹', en: 'Ice Crackle' } },
		{ img: 'img/大片纹（官）.png', name: { zh: '大片纹', en: 'Broad Crackle' } },
		{ img: 'img/文武片（官）.png', name: { zh: '文武片', en: 'Wen-Wu Sheets' } }
	],
	geyao: [
		{ img: 'img/金丝铁线（哥）.png', name: { zh: '金丝铁线', en: 'Golden Threads' } },
		{ img: 'img/百圾碎（哥）.png', name: { zh: '百圾碎', en: 'Hundred Crackles' } },
		{ img: 'img/鱼子纹（哥）.png', name: { zh: '鱼子纹', en: 'Fish Roe' } }
	],
	junyao: [
		{ img: 'img/兔毫纹（钧）.png', name: { zh: '兔毫纹', en: "Hare's Fur" } },
		{ img: 'img/流云纹（钧）.png', name: { zh: '流云纹', en: 'Flowing Clouds' } },
		{ img: 'img/蚯蚓走泥纹（钧）.png', name: { zh: '蚯蚓走泥纹', en: 'Earthworm Tracks' } }
	],
	dingyao: [
		{ img: 'img/婴戏纹（定）.png', name: { zh: '婴戏纹', en: 'Children at Play' } },
		{ img: 'img/花卉纹（定）.png', name: { zh: '花卉纹', en: 'Floral Scroll' } },
		{ img: 'img/龙凤纹（定）.png', name: { zh: '龙凤纹', en: 'Dragon & Phoenix' } }
	]
};

// 预设釉色
const GLAZE_MAP = {
	'#b3cde0': 'workshop.diy.glazeRu',
	'#8fb8cc': 'workshop.diy.glazeGuan',
	'#f2e6d8': 'workshop.diy.glazeGe',
	'#c26e69': 'workshop.diy.glazeJun',
	'#f5f0e6': 'workshop.diy.glazeDing'
};

// 快捷取翻译
function __t(key) {
	if (window.SongCiI18N && typeof window.SongCiI18N.t === 'function') {
		return window.SongCiI18N.t(key);
	}
	return key;
}

// 页面加载完成初始化
window.onload = function() {
	initDiyGame();
};

// 进入指定游戏
function enterGame(gameType) {
	currentGame = gameType;
	document.querySelectorAll('.game-page').forEach(page => page.style.display = 'none');
	document.getElementById(`${gameType}GamePage`).style.display = 'block';
	document.getElementById('gameSelectPage').style.display = 'none';
}

// 返回游戏选择页面
function backToSelect() {
	document.getElementById('gameSelectPage').style.display = 'block';
	document.querySelectorAll('.game-page').forEach(page => page.style.display = 'none');
	currentGame = '';
}

// ==================== 瓷韵DIY 游戏逻辑 ====================
function initDiyGame() {
	// 选器型
	const shapeItems = document.querySelectorAll('.shape-item');
	const toStep2Btn = document.getElementById('diyToStep2');
	const clayBody = document.getElementById('diyClayBody');
	const crack = document.getElementById('diyCrack');

	shapeItems.forEach(item => {
		item.addEventListener('click', () => {
			shapeItems.forEach(i => i.querySelector('.shape-img').style.border = '2px solid transparent');
			item.querySelector('.shape-img').style.border = '2px solid #5a4a3c';
			const shapeKey = item.dataset.shape;
			diyData.shape = shapeKey;
			diyData.shapePts = [...SHAPE_MAP[shapeKey].pts];
			diyData.kiln = SHAPE_MAP[shapeKey].kiln;
			toStep2Btn.disabled = false;
		});
	});

	toStep2Btn.addEventListener('click', () => {
		// 进入拉坯步：初始化 3D 胚体
		window.__latheBasePts = [...SHAPE_MAP[diyData.shape].pts];
		diyData.w = 160;
		diyData.h = 200;
		crack.style.display = 'none';
		showDiyStep('diyStep2');
		if (window.LathePot) {
			window.LathePot.init(diyData.shapePts);
			window.LathePot.setColor('#c9b196'); // 陶土色（未上釉）
		}
	});

	// 拉坯：按鼠标在泥胚上的垂直位置，分部位调节
	// 上1/3拖左右→调口沿，中1/3→调腹部，下1/3→调底足；上下拖→调整体高
	let isDragging = false;
	let startX = 0, startY = 0;
	let startPts = [];
	let startH = 0;
	let dragZone = ''; // 'top' | 'mid' | 'bot' | 'h'

	clayBody.addEventListener('mousedown', startDrag);
	clayBody.addEventListener('touchstart', startDrag, { passive: false });
	document.addEventListener('mousemove', drag);
	document.addEventListener('touchmove', drag, { passive: false });
	document.addEventListener('mouseup', endDrag);
	document.addEventListener('touchend', endDrag);

	function startDrag(e) {
		isDragging = true;
		const touch = e.touches ? e.touches[0] : e;
		startX = touch.clientX;
		startY = touch.clientY;
		startPts = [...diyData.shapePts];
		startH = diyData.h;
		// 判断按下位置在泥胚的哪个垂直区域
		const rect = clayBody.getBoundingClientRect();
		const relY = (touch.clientY - rect.top) / rect.height;
		if (relY < 0.3) dragZone = 'top';
		else if (relY > 0.7) dragZone = 'bot';
		else dragZone = 'mid';
		crack.style.display = 'none';
		e.preventDefault();
	}

	function drag(e) {
		if (!isDragging) return;
		const touch = e.touches ? e.touches[0] : e;
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;
		const dPts = [...startPts];

		if (dragZone === 'top') {
			// 口沿：左右控制点
			dPts[0] = clamp(startPts[0] - dx/3, 15, 45);
			dPts[1] = clamp(startPts[1] + dx/3, 55, 85);
		} else if (dragZone === 'mid') {
			// 腹部：左右控制点
			dPts[4] = clamp(startPts[4] - dx/3, 5, 40);
			dPts[5] = clamp(startPts[5] + dx/3, 60, 95);
		} else if (dragZone === 'bot') {
			// 底足：左右控制点
			dPts[6] = clamp(startPts[6] - dx/3, 15, 45);
			dPts[7] = clamp(startPts[7] + dx/3, 55, 85);
		}
		// 上下拖调整体高度
		let newH = startH - dy;
		newH = Math.max(100, Math.min(280, newH));
		diyData.h = newH;
		clayBody.style.height = newH + 'px';
		// 形状太夸张判定开裂
		const bellyW = dPts[5] - dPts[4];
		if (bellyW > 90 || bellyW < 20) {
			crack.style.display = 'block';
			return;
		}
		crack.style.display = 'none';
		diyData.shapePts = dPts;
		clayBody.style.clipPath = buildClipPath(dPts);
	}

	function clamp(v, min, max) {
		return Math.max(min, Math.min(max, v));
	}

	function endDrag() {
		isDragging = false;
	}

	// 釉色：预设按钮 + RGB滑块双向同步
	const glazeBtns = document.querySelectorAll('.glaze-btn');
	const testGlaze = document.getElementById('diyTestGlaze');
	const rSlider = document.getElementById('redSlider');
	const gSlider = document.getElementById('greenSlider');
	const bSlider = document.getElementById('blueSlider');
	const testGlazeBtn = document.getElementById('diyTestGlazeBtn');

	function hexToRgb(hex) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return { r, g, b };
	}

	// 给泥坯上釉色+纹饰：多层background叠加，纹样完全贴合瓷体
	function applyGlaze(el, color, patternImg, patternX, patternY) {
		const layers = [];
		if (patternImg) {
			layers.push(`url('${patternImg}') ${patternX || '50%'} ${patternY || '50%'} / cover no-repeat`);
		}
		layers.push(`linear-gradient(145deg, ${color} 0%, ${color} 60%, rgba(0,0,0,0.18) 100%)`);
		el.style.background = layers.join(', ');
		el.style.backgroundBlendMode = patternImg ? 'multiply, normal' : 'normal';
		el.style.backgroundSize = 'cover';
	}

	glazeBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			glazeBtns.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			diyData.color = btn.dataset.color;
			diyData.colorName = GLAZE_MAP[btn.dataset.color] || 'workshop.diy.customColor';
			testGlaze.style.background = diyData.color;
			applyGlaze(clayBody, diyData.color);
			if (window.LathePot) window.LathePot.setColor(diyData.color);
			const { r, g, b } = hexToRgb(diyData.color);
			rSlider.value = r; gSlider.value = g; bSlider.value = b;
		});
	});

	[rSlider, gSlider, bSlider].forEach(slider => {
		slider.addEventListener('input', () => {
			glazeBtns.forEach(b => b.classList.remove('active'));
			diyData.color = `rgb(${rSlider.value}, ${gSlider.value}, ${bSlider.value})`;
			testGlaze.style.background = diyData.color;
			applyGlaze(clayBody, diyData.color);
			if (window.LathePot) window.LathePot.setColor(diyData.color);
		});
	});

	testGlazeBtn.addEventListener('click', () => {
		diyData.color = `rgb(${rSlider.value}, ${gSlider.value}, ${bSlider.value})`;
		diyData.colorName = 'workshop.diy.customColor';
		testGlaze.style.background = diyData.color;
		applyGlaze(clayBody, diyData.color);
		if (window.LathePot) window.LathePot.setColor(diyData.color);
	});

	// 纹饰选择：进入第四步时根据窑口动态生成
	const patternOptions = document.getElementById('patternOptions');
	const toStep5Btn = document.getElementById('diyToStep5');
	const previewClay = document.getElementById('previewClayBody');
	const previewPlaceholder = document.querySelector('.preview-placeholder');
	const toStep4Btn = document.getElementById('diyToStep4');

	toStep4Btn.addEventListener('click', () => {
		renderPatternOptions();
		previewPlaceholder.style.display = 'none';
		previewClay.style.display = 'none'; // 隐藏 DOM 瓷胚，交给 3D
		showDiyStep('diyStep4');
		if (window.LathePot) {
			window.LathePot.setColor(diyData.color);
			window.LathePot.setPattern(diyData.pattern ? diyData.pattern.img : null);
		}
	});

	function renderPatternOptions() {
		patternOptions.innerHTML = '';
		const patterns = PATTERN_MAP[diyData.kiln] || [];
		const lang = (window.SongCiI18N && window.SongCiI18N.current) || 'zh';
		patterns.forEach(p => {
			const div = document.createElement('div');
			div.className = 'pattern-item';
			div.innerHTML = `<img src="${p.img}" alt="${p.name[lang]}"><p>${p.name[lang]}</p>`;
			div.addEventListener('click', () => {
				patternOptions.querySelectorAll('.pattern-item').forEach(i => i.classList.remove('selected'));
				div.classList.add('selected');
				diyData.pattern = p;
				diyData.patternPos = { x: 0, y: 0 };
				toStep5Btn.disabled = false;
				previewPlaceholder.style.display = 'none';
				if (window.LathePot) window.LathePot.setPattern(p.img);
			});
			patternOptions.appendChild(div);
		});
	}

	// 在瓷体上拖拽纹饰位置（改background-position）
	let isDraggingPattern = false;
	let startBX = 0, startBY = 0;
	previewClay.addEventListener('mousedown', startDragPattern);
	previewClay.addEventListener('touchstart', startDragPattern, { passive: false });
	document.addEventListener('mousemove', dragPattern);
	document.addEventListener('touchmove', dragPattern, { passive: false });
	document.addEventListener('mouseup', endDragPattern);
	document.addEventListener('touchend', endDragPattern);

	function startDragPattern(e) {
		if (!diyData.pattern) return;
		isDraggingPattern = true;
		const touch = e.touches ? e.touches[0] : e;
		startBX = touch.clientX;
		startBY = touch.clientY;
		e.preventDefault();
	}

	function dragPattern(e) {
		if (!isDraggingPattern || !diyData.pattern) return;
		const touch = e.touches ? e.touches[0] : e;
		const dx = touch.clientX - startBX;
		const dy = touch.clientY - startBY;
		// 拖动距离映射到background-position百分比
		const px = 50 + (diyData.patternPos.x + dx) / 2;
		const py = 50 + (diyData.patternPos.y + dy) / 2;
		previewClay.style.backgroundPosition = `${px}% ${py}%`;
		diyData.patternPos = { x: diyData.patternPos.x + dx, y: diyData.patternPos.y + dy };
		startBX = touch.clientX;
		startBY = touch.clientY;
	}

	function endDragPattern() {
		isDraggingPattern = false;
	}

	// 烧制
	const fireBtn = document.getElementById('diyFireBtn');
	const fireAnim = document.getElementById('diyFireAnim');
	const finalProduct = document.getElementById('diyFinalProduct');
	const resultText = document.getElementById('diyResultText');
	const saveBtn = document.getElementById('diySaveBtn');
	const downloadBtn = document.getElementById('diyDownloadBtn');
	const restartBtn = document.getElementById('diyRestartBtn');
	const finalClay = document.getElementById('finalClayBody');
	const productShape = document.getElementById('productShape');
	const productColor = document.getElementById('productColor');
	const productPattern = document.getElementById('productPattern');
	const productPoem = document.getElementById('productPoem');

	// 绘制成品卡片（缩略图/大图共用）；W/H 控制尺寸，patternImg 为纹样图或 null
	function drawDiyCard(ctx, W, H, patternImg) {
		const lang = (window.SongCiI18N && window.SongCiI18N.current) || 'zh';
		const s = W / 800;
		const bg = ctx.createLinearGradient(0, 0, 0, H);
		bg.addColorStop(0, '#f5eede');
		bg.addColorStop(1, '#e8dcc2');
		ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = '#8a7350'; ctx.lineWidth = 6 * s;
		ctx.strokeRect(24 * s, 24 * s, W - 48 * s, H - 48 * s);
		ctx.textAlign = 'center';
		ctx.fillStyle = '#3a2d1c';
		ctx.font = 'bold ' + (46 * s) + 'px "SimSun", serif';
		ctx.fillText('宋瓷五窑纪', W / 2, 92 * s);
		ctx.font = (24 * s) + 'px "SimSun", serif';
		ctx.fillStyle = '#6b5638';
		ctx.fillText('瓷韵 DIY · 我的专属瓷器', W / 2, 132 * s);
		const p = diyData.shapePts;
		const cx = W / 2, bw = 230 * s, bh = 300 * s, by = 200 * s;
		const raw = [[p[0],0],[p[1],0],[p[3],25],[p[5],55],[p[7],100],[p[6],100],[p[4],55],[p[2],25]];
		const poly = raw.map(([xp, yp]) => [cx + (xp / 100 - 0.5) * bw, by + (yp / 100) * bh]);
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(poly[0][0], poly[0][1]);
		for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
		ctx.closePath();
		ctx.fillStyle = diyData.color || '#b3cde0';
		ctx.fill();
		if (patternImg) {
			ctx.clip();
			const pw = bw * 0.9;
			const px = cx - pw / 2 + ((diyData.patternPos && diyData.patternPos.x) || 0) / 2;
			const py = by + bh * 0.35 + ((diyData.patternPos && diyData.patternPos.y) || 0) / 2;
			ctx.globalAlpha = 0.85;
			ctx.drawImage(patternImg, px, py, pw, pw);
			ctx.globalAlpha = 1;
		}
		const hl = ctx.createLinearGradient(cx - bw / 2, by, cx + bw / 2, by);
		hl.addColorStop(0, 'rgba(255,255,255,0)');
		hl.addColorStop(0.4, 'rgba(255,255,255,0.35)');
		hl.addColorStop(0.6, 'rgba(255,255,255,0.05)');
		hl.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = hl; ctx.fill();
		ctx.restore();
		ctx.fillStyle = 'rgba(0,0,0,0.12)';
		ctx.beginPath();
		ctx.ellipse(cx, by + bh + 15 * s, bw * 0.32, 12 * s, 0, 0, Math.PI * 2);
		ctx.fill();
		const shapeName = __t(SHAPE_MAP[diyData.shape].nameKey);
		const colorName = __t(diyData.colorName);
		const patternName = diyData.pattern ? diyData.pattern.name[lang] : '—';
		ctx.fillStyle = '#3a2d1c';
		ctx.font = (26 * s) + 'px "SimSun", serif';
		ctx.fillText(shapeName + ' · ' + colorName, W / 2, by + bh + 92 * s);
		ctx.font = (22 * s) + 'px "SimSun", serif';
		ctx.fillStyle = '#6b5638';
		ctx.fillText('纹饰：' + patternName, W / 2, by + bh + 128 * s);
		ctx.font = 'italic ' + (24 * s) + 'px "SimSun", serif';
		ctx.fillStyle = '#8a6d3b';
		ctx.fillText('「' + SHAPE_MAP[diyData.shape].poem[lang] + '」', W / 2, H - 110 * s);
		ctx.font = (18 * s) + 'px "SimSun", serif';
		ctx.fillStyle = '#999';
		ctx.fillText('宋瓷五窑纪 · 瓷韵DIY出品', W / 2, H - 70 * s);
	}
	// 生成成品 JPEG dataURL；file:// 下若被纹样污染则自动降级无纹样
	function getDiyCardDataURL(patternImg, W, H, cb) {
		try {
			const c = document.createElement('canvas');
			c.width = W; c.height = H;
			drawDiyCard(c.getContext('2d'), W, H, patternImg);
			cb(c.toDataURL('image/jpeg', 0.85));
		} catch (e) {
			const c = document.createElement('canvas');
			c.width = W; c.height = H;
			drawDiyCard(c.getContext('2d'), W, H, null);
			try { cb(c.toDataURL('image/jpeg', 0.85)); } catch (e2) { cb(null); }
		}
	}

	fireBtn.addEventListener('click', () => {
		fireBtn.style.display = 'none';
		fireAnim.style.display = 'block';
		finalProduct.style.display = 'none';
		resultText.style.display = 'none';
		saveBtn.style.display = 'none';
		restartBtn.style.display = 'none';

		setTimeout(() => {
			fireAnim.style.display = 'none';
			finalProduct.style.display = 'block';
			resultText.style.display = 'block';
			saveBtn.style.display = 'inline-block';
			downloadBtn.style.display = 'inline-block';
			restartBtn.style.display = 'inline-block';

			// 成品泥坯：用 3D 瓶身替代 DOM clip-path
			finalClay.style.display = 'none';
			const stage = document.querySelector('.porcelain-stage');
			if (stage && window.LathePot) {
				window.LathePot.attachTo(stage);
			}
			const lang = (window.SongCiI18N && window.SongCiI18N.current) || 'zh';
			productShape.textContent = __t(SHAPE_MAP[diyData.shape].nameKey);
			productColor.textContent = __t(diyData.colorName) + (diyData.colorName === 'workshop.diy.customColor' ? ` (${diyData.color})` : '');
			productPattern.textContent = diyData.pattern ? diyData.pattern.name[lang] : '—';
			productPoem.textContent = '「' + SHAPE_MAP[diyData.shape].poem[lang] + '」';

			finalProduct.style.opacity = '0';
			finalProduct.style.transform = 'translateY(20px)';
			setTimeout(() => {
				finalProduct.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
				finalProduct.style.opacity = '1';
				finalProduct.style.transform = 'translateY(0)';
			}, 50);
		}, 2200);
	});

	// 保存成品：生成这只瓷器的缩略图存入本地收藏列表
	saveBtn.addEventListener('click', () => {
		const lang = (window.SongCiI18N && window.SongCiI18N.current) || 'zh';
		const desc = __t(SHAPE_MAP[diyData.shape].nameKey) + ' · ' + __t(diyData.colorName) + (diyData.pattern ? ' · ' + diyData.pattern.name[lang] : '');
		function proceed(imgSrc) {
			const saved = JSON.parse(localStorage.getItem('songciCollections') || '[]');
			saved.unshift({
				id: 'diy_' + Date.now(),
				imgSrc: imgSrc || 'img/汝.jpg',
				author: '@我 · 瓷韵DIY',
				desc: desc,
				time: new Date().toLocaleDateString()
			});
			try {
				localStorage.setItem('songciCollections', JSON.stringify(saved));
			} catch (e) {
				// 存储空间不足时退回首图
				saved[0].imgSrc = 'img/汝.jpg';
				localStorage.setItem('songciCollections', JSON.stringify(saved));
			}
			alert(__t('workshop.diy.saved'));
		}
		if (diyData.pattern) {
			const img = new Image();
			img.onload = () => getDiyCardDataURL(img, 400, 500, proceed);
			img.onerror = () => getDiyCardDataURL(null, 400, 500, proceed);
			img.src = diyData.pattern.img;
		} else {
			getDiyCardDataURL(null, 400, 500, proceed);
		}
	});

	// 下载成品为本地 JPG：用 Canvas 按所选器型/釉色/纹样绘制成品卡片
	downloadBtn.addEventListener('click', () => {
		const W = 800, H = 1000;
		const lang = (window.SongCiI18N && window.SongCiI18N.current) || 'zh';
		const p = diyData.shapePts;
		const cx = W / 2, bw = 230, bh = 300, by = 200;
		const raw = [[p[0],0],[p[1],0],[p[3],25],[p[5],55],[p[7],100],[p[6],100],[p[4],55],[p[2],25]];
		const poly = raw.map(([xp, yp]) => [cx + (xp / 100 - 0.5) * bw, by + (yp / 100) * bh]);

		// 在给定 ctx 上绘制整张成品图；patternImg 为空则不贴纹样
		function buildScene(ctx, patternImg) {
			// 宣纸背景
			const bg = ctx.createLinearGradient(0, 0, 0, H);
			bg.addColorStop(0, '#f5eede');
			bg.addColorStop(1, '#e8dcc2');
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, W, H);
			// 边框
			ctx.strokeStyle = '#8a7350';
			ctx.lineWidth = 6;
			ctx.strokeRect(24, 24, W - 48, H - 48);
			// 标题
			ctx.textAlign = 'center';
			ctx.fillStyle = '#3a2d1c';
			ctx.font = 'bold 46px "SimSun", serif';
			ctx.fillText('宋瓷五窑纪', W / 2, 92);
			ctx.font = '24px "SimSun", serif';
			ctx.fillStyle = '#6b5638';
			ctx.fillText('瓷韵 DIY · 我的专属瓷器', W / 2, 132);
			// 瓷瓶
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(poly[0][0], poly[0][1]);
			for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
			ctx.closePath();
			ctx.fillStyle = diyData.color || '#b3cde0';
			ctx.fill();
			if (patternImg) {
				ctx.clip();
				const pw = bw * 0.9;
				const px = cx - pw / 2 + ((diyData.patternPos && diyData.patternPos.x) || 0) / 2;
				const py = by + bh * 0.35 + ((diyData.patternPos && diyData.patternPos.y) || 0) / 2;
				ctx.globalAlpha = 0.85;
				ctx.drawImage(patternImg, px, py, pw, pw);
				ctx.globalAlpha = 1;
			}
			const hl = ctx.createLinearGradient(cx - bw / 2, by, cx + bw / 2, by);
			hl.addColorStop(0, 'rgba(255,255,255,0.0)');
			hl.addColorStop(0.4, 'rgba(255,255,255,0.35)');
			hl.addColorStop(0.6, 'rgba(255,255,255,0.05)');
			hl.addColorStop(1, 'rgba(255,255,255,0.0)');
			ctx.fillStyle = hl;
			ctx.fill();
			ctx.restore();
			// 瓶底阴影
			ctx.fillStyle = 'rgba(0,0,0,0.12)';
			ctx.beginPath();
			ctx.ellipse(cx, by + bh + 15, bw * 0.32, 12, 0, 0, Math.PI * 2);
			ctx.fill();
			// 信息文字
			const shapeName = __t(SHAPE_MAP[diyData.shape].nameKey);
			const colorName = __t(diyData.colorName);
			const patternName = diyData.pattern ? diyData.pattern.name[lang] : '—';
			ctx.fillStyle = '#3a2d1c';
			ctx.font = '26px "SimSun", serif';
			ctx.fillText(shapeName + ' · ' + colorName, W / 2, by + bh + 92);
			ctx.font = '22px "SimSun", serif';
			ctx.fillStyle = '#6b5638';
			ctx.fillText('纹饰：' + patternName, W / 2, by + bh + 128);
			// 诗句与落款
			ctx.font = 'italic 24px "SimSun", serif';
			ctx.fillStyle = '#8a6d3b';
			ctx.fillText('「' + SHAPE_MAP[diyData.shape].poem[lang] + '」', W / 2, H - 110);
			ctx.font = '18px "SimSun", serif';
			ctx.fillStyle = '#999';
			ctx.fillText('宋瓷五窑纪 · 瓷韵DIY出品', W / 2, H - 70);
		}

		function downloadCanvas(canvas) {
			const url = canvas.toDataURL('image/jpeg', 0.92);
			const a = document.createElement('a');
			a.href = url;
			a.download = '我的宋瓷-' + (diyData.shape || 'diy') + '.jpg';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}

		function exportWithPattern(patternImg) {
			// 第一次：尝试带纹样导出；file:// 下若被浏览器安全策略拦截，则降级为无纹样版本
			try {
				const c1 = document.createElement('canvas');
				c1.width = W; c1.height = H;
				buildScene(c1.getContext('2d'), patternImg);
				downloadCanvas(c1);
			} catch (e) {
				const c2 = document.createElement('canvas');
				c2.width = W; c2.height = H;
				buildScene(c2.getContext('2d'), null);
				try {
					downloadCanvas(c2);
				} catch (e2) {
					alert('导出失败，请用截图保存。');
				}
			}
		}

		if (diyData.pattern) {
			const img = new Image();
			img.onload = () => exportWithPattern(img);
			img.onerror = () => exportWithPattern(null);
			img.src = diyData.pattern.img;
		} else {
			exportWithPattern(null);
		}
	});

	restartBtn.addEventListener('click', () => {
		diyData = { shape: '', shapePts: [38,62,22,78,18,82,32,68], kiln: '', color: '#b3cde0', colorName: 'workshop.diy.glazeRu', pattern: null, patternPos: {x:0,y:0}, w:0, h:0 };
		window.diyData = diyData;
		window.__latheBasePts = null;
		if (window.LathePot) window.LathePot.setColor('#c9b196');
		shapeItems.forEach(i => i.querySelector('.shape-img').style.border = '2px solid transparent');
		toStep2Btn.disabled = true;
		patternOptions.innerHTML = '';
		toStep5Btn.disabled = true;
		glazeBtns.forEach(b => b.classList.remove('active'));
		document.querySelector('.glaze-tianqing').classList.add('active');
		rSlider.value = 179; gSlider.value = 205; bSlider.value = 224;
		testGlaze.style.background = '#b3cde0';
		fireBtn.style.display = 'inline-block';
		clayBody.className = 'clay-body';
		clayBody.style.clipPath = buildClipPath([38,62,22,78,18,82,32,68]);
		clayBody.style.background = '';
		clayBody.style.width = '';
		clayBody.style.height = '';
		crack.style.display = 'none';
		// 清空预览区
		previewClay.className = 'clay-body';
		previewClay.style.display = '';
		previewClay.style.clipPath = buildClipPath([38,62,22,78,18,82,32,68]);
		previewClay.style.width = '';
		previewClay.style.height = '';
		previewClay.style.background = '';
		previewPlaceholder.style.display = 'block';
		// 清空成品区
		finalClay.className = 'clay-body';
		finalClay.style.clipPath = buildClipPath([38,62,22,78,18,82,32,68]);
		finalClay.style.width = '';
		finalClay.style.height = '';
		finalClay.style.background = '';
		productShape.textContent = '';
		productColor.textContent = '';
		productPattern.textContent = '';
		productPoem.textContent = '';
		resultText.style.display = 'none';
		saveBtn.style.display = 'none';
		downloadBtn.style.display = 'none';
		restartBtn.style.display = 'none';
		finalProduct.style.display = 'none';
		showDiyStep('diyStep1');
	});
}

function showDiyStep(stepId) {
	document.querySelectorAll('.step-panel').forEach(panel => panel.classList.remove('active'));
	document.getElementById(stepId).classList.add('active');
	// 3D canvas 跟随步骤：step2 在拉坯区，step4 在纹样预览区
	if (window.LathePot) {
		if (stepId === 'diyStep2') {
			const lc = document.querySelector('.lapi-container');
			if (lc) window.LathePot.attachTo(lc);
		} else if (stepId === 'diyStep4') {
			const pv = document.getElementById('patternPreview');
			if (pv) window.LathePot.attachTo(pv);
		}
	}
}
