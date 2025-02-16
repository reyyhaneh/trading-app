import React, { useEffect, useRef } from 'react';

const TradingViewWidget = ({ selectedSymbol }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null); // To track if the script has already been loaded

  useEffect(() => {
    console.log("📌 TradingViewWidget Mounted - Symbol:", selectedSymbol);

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
      console.log("🧹 Removed existing TradingView script.");
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
      theme: 'light',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      container_id: 'tradingview-widget',
    });

    console.log("✅ Appending TradingView script:", script.innerHTML);

    // Append script only if container exists
    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptRef.current = script; // Store reference to prevent duplicates
      console.log("📌 TradingView script appended successfully.");
    } else {
      console.error("❌ containerRef is null, script was NOT appended.");
    }

    return () => {
      console.log("🧹 Cleaning up TradingView widget.");
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
