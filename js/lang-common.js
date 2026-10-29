/* 公共字典：品牌、导航、页脚、通用按钮 */
(function (window) {
    var D = window.SONCI_I18N_DICT = window.SONCI_I18N_DICT || {};

    /* ========== 品牌 ========== */
    D['brand.name'] = { zh: '宋瓷五窑纪', en: 'Song Ceramics · Five Kilns' };

    /* ========== 导航 ========== */
    D['nav.home'] = { zh: '首页', en: 'Home' };
    D['nav.kilns'] = { zh: '五大名窑', en: 'Five Kilns' };
    D['nav.ruyao'] = { zh: '汝窑', en: 'Ru Kiln' };
    D['nav.guanyao'] = { zh: '官窑', en: 'Guan Kiln' };
    D['nav.geyao'] = { zh: '哥窑', en: 'Ge Kiln' };
    D['nav.junyao'] = { zh: '钧窑', en: 'Jun Kiln' };
    D['nav.dingyao'] = { zh: '定窑', en: 'Ding Kiln' };
    D['nav.workshop'] = { zh: '宋瓷工坊', en: 'Song Workshop' };
    D['nav.share'] = { zh: '瓷友分享', en: 'Ceramic Share' };
    D['nav.heritage'] = { zh: '非遗传承', en: 'Heritage' };
    D['nav.more'] = { zh: '更多', en: 'More' };
    D['nav.funfact'] = { zh: '窑口冷知识', en: 'Kiln Fun Facts' };
    D['nav.collection'] = { zh: '我的收藏', en: 'My Collection' };
    D['nav.contact'] = { zh: '联系我们', en: 'Contact Us' };

    /* ========== 页脚 ========== */
    D['footer.copyright'] = { zh: '宋瓷五窑纪', en: 'Song Ceramics · Five Kilns' };

    /* ========== 通用按钮 ========== */
    D['btn.back'] = { zh: '返回', en: 'Back' };
    D['btn.next'] = { zh: '下一步', en: 'Next' };
    D['btn.prev'] = { zh: '上一步', en: 'Previous' };
    D['btn.restart'] = { zh: '重新开始', en: 'Restart' };
    D['btn.save'] = { zh: '保存成品', en: 'Save Artwork' };
    D['btn.start'] = { zh: '开始', en: 'Start' };
    D['btn.confirm'] = { zh: '确认', en: 'Confirm' };
    D['btn.cancel'] = { zh: '取消', en: 'Cancel' };

    /* ========== 通用提示 ========== */
    D['toast.success'] = { zh: '操作成功', en: 'Success' };
    D['toast.networkRecovered'] = { zh: '网络已恢复', en: 'Network recovered' };
    D['toast.retrying'] = { zh: '正在重试...', en: 'Retrying...' };

    /* ========== 全局错误弹窗 ========== */
    D['err.networkTitle'] = { zh: '网络连接失败', en: 'Network Connection Failed' };
    D['err.networkDesc'] = { zh: '当前网络已中断，请检查网络设置后重试', en: 'Your network is offline. Please check your connection and try again' };
    D['err.timeoutTitle'] = { zh: '操作超时', en: 'Operation Timed Out' };
    D['err.timeoutDesc'] = { zh: '页面加载已超时（超过{sec}秒），即将自动刷新', en: 'Page loading timed out (over {sec} seconds). Auto-refreshing' };
    D['err.errorTitle'] = { zh: '操作执行失败', en: 'Operation Failed' };
    D['err.errorDesc'] = { zh: '系统出现异常，请重试或联系客服', en: 'A system error occurred. Please retry or contact support' };
    D['err.retry'] = { zh: '重试', en: 'Retry' };
    D['err.back'] = { zh: '返回', en: 'Back' };
    D['err.refresh'] = { zh: '立即刷新', en: 'Refresh Now' };
    D['err.later'] = { zh: '稍后处理', en: 'Later' };

    /* ========== 窑口详情页公共模块 ========== */
    D['kiln.sideTitle'] = { zh: '窑口档案', en: 'Kiln Profile' };
    D['kiln.introTitle'] = { zh: '简介', en: 'Introduction' };
    D['kiln.patternTitle'] = { zh: '经典纹样', en: 'Signature Patterns' };
    D['kiln.glazeTitle'] = { zh: '经典釉色', en: 'Signature Glazes' };
    D['kiln.classicTitle'] = { zh: '传世经典瓷器', en: 'Classic Masterpieces' };
    D['kiln.field.place'] = { zh: '产地（今属）：', en: 'Origin (modern):' };
    D['kiln.field.era'] = { zh: '年代：', en: 'Period:' };
    D['kiln.field.status'] = { zh: '历史性质与地位：', en: 'Historical Status:' };
    D['kiln.field.glaze'] = { zh: '代表釉色：', en: 'Signature Glaze:' };
    D['kiln.field.craft'] = { zh: '核心工艺特点：', en: 'Key Techniques:' };
    D['kiln.field.body'] = { zh: '胎质：', en: 'Body (Paste):' };
    D['kiln.field.surviving'] = { zh: '存世量：', en: 'Surviving Pieces:' };
    D['kiln.field.material'] = { zh: '核心原料：', en: 'Key Materials:' };
    D['kiln.patternFormat'] = { zh: '纹样格式', en: 'Pattern Specifications' };
    D['kiln.guideDiy'] = { zh: '瓷器DIY', en: 'DIY Porcelain' };
    D['kiln.guideFunfact'] = { zh: '窑口冷知识', en: 'Kiln Fun Facts' };

    /* ========== 3D 模型控制条 ========== */
    D['porc.spin'] = { zh: '自动旋转', en: 'Auto-spin' };
    D['porc.front'] = { zh: '正面', en: 'Front' };
    D['porc.top'] = { zh: '俯视', en: 'Top View' };
    D['porc.angle45'] = { zh: '45°', en: '45°' };
    D['porc.reset'] = { zh: '缩放重置', en: 'Reset Zoom' };
    D['porc.shot'] = { zh: '截图', en: 'Snapshot' };
    D['porc.dragHint'] = { zh: '拖拽任意方向旋转360° · 滚轮缩放', en: 'Drag to rotate 360° · Scroll to zoom' };

    /* ========== 集印徽章（seal.js） ========== */
    D['seal.badgeSeal'] = { zh: '印', en: 'Seal' };
    D['seal.collected'] = { zh: '·集齐', en: '·Complete' };
    D['seal.title'] = { zh: '窑主试炼 · 集齐五窑印章', en: 'Kiln Master Trial · Collect all five seals' };
    D['seal.got'] = { zh: '获得「{name}」印章', en: 'Seal earned: {name}' };

    /* ========== 四大关键词翻转卡片 ========== */
    D['kiln.flipTitle'] = { zh: '四大关键词 · 点击翻面', en: 'Four Key Facts · Click to Flip' };
    D['kiln.flip.glaze'] = { zh: '釉色', en: 'Glaze' };
    D['kiln.flip.form'] = { zh: '器型', en: 'Form' };
    D['kiln.flip.era'] = { zh: '年代', en: 'Period' };
    D['kiln.flip.trait'] = { zh: '特点', en: 'Features' };
    D['kiln.zoomTip'] = { zh: '悬停放大查看细节', en: 'Hover to zoom in' };
})(window);
