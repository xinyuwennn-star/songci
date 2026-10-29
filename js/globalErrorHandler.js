// 全局异常处理工具：网络中断、操作超时、脚本错误
window.GlobalErrorHandler = {
    // 配置项（统一修改）
    config: {
        timeout: 10000, // 10秒超时阈值
        retryText: '重试',
        backText: '返回',
        refreshText: '立即刷新',
        laterText: '稍后处理'
    },
    // 快捷取翻译（兼容 i18n 引擎）
    t(key) {
        if (window.SongCiI18N && typeof window.SongCiI18N.t === 'function') {
            return window.SongCiI18N.t(key);
        }
        return key;
    },
    init() {
        // 1. 监听网络状态（离线/在线）
        this.listenNetworkStatus();
        // 2. 监听页面加载超时
        this.listenPageLoadTimeout();
        // 3. 监听全局脚本错误
        this.listenGlobalErrors();
        // 4. 创建异常弹窗DOM（隐藏状态）
        this.createErrorModal();
    },
    // 1. 网络状态监听（全页面生效）
    listenNetworkStatus() {
        // 初始加载时检测
        if (!navigator.onLine) {
            this.showErrorModal('network');
        }
        // 网络断开时触发
        window.addEventListener('offline', () => {
            this.showErrorModal('network');
        });
        // 网络恢复时触发
        window.addEventListener('online', () => {
            this.closeErrorModal();
            this.showToast(this.t('toast.networkRecovered'));
        });
    },
    // 2. 页面加载超时监听（10秒未完成加载则触发）
    listenPageLoadTimeout() {
        const timeoutTimer = setTimeout(() => {
            if (document.readyState !== 'complete') {
                this.showErrorModal('timeout');
                // 3秒后自动刷新
                setTimeout(() => {
                    this.refreshPage();
                }, 3000);
            }
        }, this.config.timeout);

        // 页面加载完成后清除定时器
        window.addEventListener('load', () => {
            clearTimeout(timeoutTimer);
        });
    },
    // 3. 全局脚本错误监听（捕获页面JS报错）
    listenGlobalErrors() {
        // 捕获脚本错误
        window.addEventListener('error', (err) => {
            console.error('全局脚本错误:', err);
            this.showErrorModal('error', err.message);
        });

        // 捕获未处理的Promise错误
        window.addEventListener('unhandledrejection', (err) => {
            console.error('未处理Promise错误:', err.reason);
            this.showErrorModal('error', this.t('err.errorTitle'));
        });
    },
    // 4. 创建异常弹窗DOM（全局唯一）
    createErrorModal() {
        if (document.getElementById('globalErrorModal')) return;

        const modal = document.createElement('div');
        modal.id = 'globalErrorModal';
        modal.className = 'global-error-modal';
        modal.style.display = 'none';
        document.body.appendChild(modal);
    },
    // 5. 显示异常弹窗（支持3种类型：network/timeout/error）
    showErrorModal(type, msg = '') {
        const modal = document.getElementById('globalErrorModal');
        if (!modal) return;
        // 弹窗内容模板
        const templates = {
            network: `
                <div class="error-icon">⚠️</div>
                <h3>${this.t('err.networkTitle')}</h3>
                <p>${this.t('err.networkDesc')}</p>
                <div class="error-btns">
                    <button onclick="GlobalErrorHandler.retryOperation()">${this.t('err.retry')}</button>
                    <button onclick="GlobalErrorHandler.goBack()">${this.t('err.back')}</button>
                </div>
            `,
            timeout: `
                <div class="error-icon">⌛</div>
                <h3>${this.t('err.timeoutTitle')}</h3>
                <p>${this.t('err.timeoutDesc').replace('{sec}', this.config.timeout / 1000)}</p>
                <div class="error-btns">
                    <button onclick="GlobalErrorHandler.refreshPage()">${this.t('err.refresh')}</button>
                    <button onclick="GlobalErrorHandler.closeErrorModal()">${this.t('err.later')}</button>
                </div>
            `,
            error: `
                <div class="error-icon">❌</div>
                <h3>${this.t('err.errorTitle')}</h3>
                <p>${msg || this.t('err.errorDesc')}</p>
                <div class="error-btns">
                    <button onclick="GlobalErrorHandler.retryOperation()">${this.t('err.retry')}</button>
                    <button onclick="GlobalErrorHandler.closeErrorModal()">${this.t('err.later')}</button>
                </div>
            `
        };
        modal.innerHTML = templates[type];
        modal.style.display = 'flex';
    },
    // 6. 关闭异常弹窗
    closeErrorModal() {
        const modal = document.getElementById('globalErrorModal');
        if (modal) modal.style.display = 'none';
    },
    // 7. 重试操作（重新加载当前页面核心逻辑）
    retryOperation() {
        this.closeErrorModal();
        this.showToast(this.t('toast.retrying'));

        // 重新触发页面加载逻辑
        if (document.readyState === 'complete') {
            window.location.reload(false); // 不强制刷新缓存
        } else {
            document.dispatchEvent(new Event('DOMContentLoaded'));
        }
    },
    // 8. 返回上一页
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html'; // 无历史记录则返回首页
        }
        this.closeErrorModal();
    },
    // 9. 刷新页面
    refreshPage() {
        window.location.reload(true); // 强制刷新（清除缓存）
    },
    // 10. 显示操作提示（如网络恢复、重试中）
    showToast(text) {
        let toast = document.getElementById('globalToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'globalToast';
            toast.className = 'global-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        toast.style.display = 'block';
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 2000);
    },
    // 工具方法：检查当前网络状态（供其他页面主动调用）
    isOnline() {
        return navigator.onLine;
    },

    // 工具方法：启动自定义操作超时监听（供接口请求等使用）
    startCustomTimeout(cb) {
        const timer = setTimeout(() => {
            this.showErrorModal('timeout');
        }, this.config.timeout);
        // 返回清除定时器的函数
        return () => {
            clearTimeout(timer);
            if (cb && typeof cb === 'function') cb();
        };
    }
};
// 页面加载时自动初始化（所有页面无需手动调用）
window.addEventListener('load', () => {
    GlobalErrorHandler.init();
});