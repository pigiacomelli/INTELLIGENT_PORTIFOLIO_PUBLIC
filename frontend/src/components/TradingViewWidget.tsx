import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
    widgetConfig: any;
    containerId: string;
    type?: 'screener' | 'heatmap' | 'symbol-overview' | 'ticker-tape' | 'chart' | 'timeline' | 'mini-chart' | 'technical-analysis' | 'events' | 'crypto-mkt-screener' | 'market-quotes';
    height?: string | number;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
    widgetConfig,
    containerId,
    type = 'screener',
    height = '100%'
}) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent multiple script injections
        if (!container.current) return;
        container.current.innerHTML = '';

        const script = document.createElement("script");
        let scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";

        switch (type) {
            case 'heatmap':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
                break;
            case 'symbol-overview':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
                break;
            case 'ticker-tape':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
                break;
            case 'chart':
                scriptSrc = "https://s3.tradingview.com/tv.js";
                break;
            case 'timeline':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
                break;
            case 'mini-chart':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
                break;
            case 'technical-analysis':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
                break;
            case 'events':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
                break;
            case 'crypto-mkt-screener':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
                break;
            case 'market-quotes':
                scriptSrc = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
                break;
        }

        if (type === 'chart') {
            // Special handling for the advanced chart which is a constructor, not just an embed script
            script.src = scriptSrc;
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => {
                if (window.TradingView && container.current) {
                    new window.TradingView.widget({
                        ...widgetConfig,
                        container_id: containerId,
                        width: "100%",
                        height: "100%",
                    });
                }
            };
        } else {
            script.src = scriptSrc;
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                ...widgetConfig,
                width: "100%",
                height: "100%",
            });
        }

        container.current.appendChild(script);

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [widgetConfig, type, containerId]);

    return (
        <div style={{ height, width: '100%' }}>
            <div
                className="tradingview-widget-container"
                ref={container}
                id={containerId}
                style={{ height: '100%', width: '100%' }}
            >
                <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
            </div>
        </div>
    );
};

// Add Global interface for TradingView constructor
declare global {
    interface Window {
        TradingView: any;
    }
}

export default memo(TradingViewWidget);
