/**
 * GA4 事件追蹤輔助（gtag 已於 app.blade.php 載入，property: G-D43Z4Q46V7）。
 * 統一命名（object_action）、安全（SSR 無 window 時不執行）、集中管理。
 *
 * 事件清單見 docs：track('cta_clicked', { location, button_text })
 */

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}

export type TrackParams = Record<string, string | number | boolean | undefined>;

/** 送出一個 GA4 事件。SSR / 未載入 gtag 時自動略過，不會報錯。 */
export function track(event: string, params: TrackParams = {}): void {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    // 過濾掉 undefined，避免送出空值
    const clean: TrackParams = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') clean[k] = v;
    }
    window.gtag('event', event, clean);
}

/** 外連點擊（產品、合作夥伴、社群）。 */
export function trackOutbound(label: string, url: string, location: string): void {
    track('outbound_click', { link_label: label, link_url: url, location });
}
