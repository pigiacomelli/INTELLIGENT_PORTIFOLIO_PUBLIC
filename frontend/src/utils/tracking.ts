import { useEffect } from 'react';

export function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || 'direct',
        utm_medium: params.get('utm_medium') || 'none',
        utm_campaign: params.get('utm_campaign') || 'none',
    };
}

export function trackEvent(event: string, data?: Record<string, string>) {
    try {
        let device = 'unknown';
        if (window.location.pathname === '/mobile') device = 'mobile';
        else if (window.location.pathname === '/desktop') device = 'desktop';

        const payload = { device, ...getUTMParams(), ...data };
        if ((window as any).va) (window as any).va('event', { name: event, ...payload });
        if ((window as any).dataLayer) (window as any).dataLayer.push({ event, ...payload });
    } catch (e) {
        console.error('Tracking error', e);
    }
}

let lastClickTime = 0;
export const trackCTAClick = (location: string, device: string) => {
    const now = Date.now();
    // 2s throttle to prevent double clicking/inflated metrics
    if (now - lastClickTime < 2000) return;
    lastClickTime = now;

    trackEvent('cta_click', { location, device });
};

export const useScrollTracking = (device: string) => {
    useEffect(() => {
        let s50Fired = false;
        let s75Fired = false;

        const onScroll = () => {
            const h = document.documentElement;
            // Provide a fallback in case h properties are 0
            const scrollHeight = h.scrollHeight || document.body.scrollHeight;
            const clientHeight = h.clientHeight || document.body.clientHeight;
            const scrollTop = window.scrollY || h.scrollTop || document.body.scrollTop;

            if (scrollHeight <= clientHeight) return;

            const scrollPercent = (scrollTop + clientHeight) / scrollHeight;

            if (scrollPercent >= 0.5 && !s50Fired) {
                s50Fired = true;
                trackEvent('scroll_50', { device });
            }
            if (scrollPercent >= 0.75 && !s75Fired) {
                s75Fired = true;
                trackEvent('scroll_75', { device });
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [device]);
};
