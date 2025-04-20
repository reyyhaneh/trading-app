import React, { useEffect, useRef } from 'react';

const TradingViewWidget = ({ selectedSymbol }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null); // To track if the script has already been loaded

  useEffect(() => {

    if (!containerRef.current) {
      console.warn("⚠️ containerRef is not ready, delaying execution.");
      return;
    }

    // Clear previous script before adding a new one
    containerRef.current.innerHTML = '';

    // If script already exists, remove it before appending again
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    // TradingView widget configuration
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '610',
      symbol: selectedSymbol || 'CME:BTC1!',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      container_id: 'tradingview-widget',
    });


    // Append script only if container exists
    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptRef.current = script; // Store reference to prevent duplicates
    } else {
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Reset container
      }
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [selectedSymbol]);

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef}></div>
    </div>
  );
};

export default TradingViewWidget;
