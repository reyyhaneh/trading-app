// src/components/TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ selectedSymbol }) {
  const container = useRef(null);
  const scriptRef = useRef(null); // To track the script element

  useEffect(() => {
    // Clean up existing script if it exists
    if (scriptRef.current) {
      container.current.innerHTML = '';
      scriptRef.current = null;
    }

    if (container.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      // Create the configuration object with dynamic watchlist
      // const config = {
      //   "width": "100%", // Use percentage for responsiveness
      //   "height": "610",
      //   "symbol": "CME:BTC1!",
      //   "interval": "D",
      //   "timezone": "Etc/UTC",
      //   "theme": "light",
      //   "style": "1",
      //   "locale": "en",
      //   "allow_symbol_change": true,
      //   "calendar": false,
      //   "widgetbar": {
      //     "watchlist": true,
      //     "watchlist_settings": {
      //       "default_symbols": watchlist,
      //       "readonly": false, // Allow users to modify the watchlist
      //     },
      //   },
      //   "support_host": "https://www.tradingview.com"
      // };
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

      container.current.appendChild(script);
      scriptRef.current = script;
    }

    // Cleanup function
    return () => {
      if (container.current) {
        container.current.innerHTML = ''; // Clean up script on unmount or update
      }
    };
  }, [selectedSymbol]); // Re-run when watchlist changes

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
