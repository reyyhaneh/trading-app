import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ selectedSymbol }) {
  const containerRef = useRef(null);
  const isScriptAdded = useRef(false); // Track if the script has been added

  useEffect(() => {
    // Prevent re-initialization if the script already exists
    if (isScriptAdded.current) return;

    if (containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;

      // Widget configuration
      const config = {
        width: '100%',
        height: '610',
        symbol: selectedSymbol || 'CME:BTC1!',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        allow_symbol_change: false,
        calendar: false,
      };

      script.innerHTML = JSON.stringify(config);

      // Append script to container
      containerRef.current.appendChild(script);
      isScriptAdded.current = true; // Mark script as added
    }

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        isScriptAdded.current = false; // Reset flag
      }
    };
  }, [selectedSymbol]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          TradingView Chart
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
