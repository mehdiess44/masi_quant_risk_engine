import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

// Extract the formatting logic into a pure utility function
function formatChartData(data) {
  return data.map((item, index, arr) => {
    const currentClose = parseFloat(item.close ?? item.Close ?? item.value ?? item.Value);
    let prevClose = currentClose;

    if (index > 0) {
      prevClose = parseFloat(arr[index - 1].close ?? arr[index - 1].Close ?? arr[index - 1].value ?? arr[index - 1].Value);
    }

    const open = prevClose;
    const close = currentClose;
    const high = Math.max(open, close) + (currentClose * 0.001);
    const low = Math.min(open, close) - (currentClose * 0.001);

    return {
      time: item.date || item.time || item.Date,
      open: open,
      high: high,
      low: low,
      close: close
    };
  });
}

export default function HeroChart({ data = [], markers = [] }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // 🚀 TRACEUR : Si tu ne vois pas ça dans F12, c'est que React ne compile pas !
    console.log("🚀 HERO CHART INITIALIZED - FORCING CANDLESTICKS", data.length);

    // 1. Mappage mathématique pur (ignore les données corrompues de l'API)
    const mappedData = formatChartData(data);

    // 2. Nettoyage absolu du conteneur
    chartContainerRef.current.innerHTML = '';

    // 3. Initialisation du canvas
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#7A8499' },
      grid: { vertLines: { color: 'rgba(45, 124, 255, 0.05)' }, horzLines: { color: 'rgba(45, 124, 255, 0.05)' } },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { 
        borderColor: 'rgba(45, 124, 255, 0.08)',
        rightOffset: 5 
      },
      rightPriceScale: { 
        borderColor: 'rgba(45, 124, 255, 0.08)',
        priceFormat: { type: 'price', precision: 3, minMove: 0.001 }
      },
    });
    chartRef.current = chart;

    // 4. SÉRIE CANDLESTICK STRICTE (Aucun histogramme ne peut survivre à cette ligne)
    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',     // Vert
      downColor: '#ef5350',   // Rouge
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    series.setData(mappedData);

    // Ajustement dynamique des bougies
    chart.timeScale().fitContent();

    if (markers.length > 0) {
      series.setMarkers(markers);
    }

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) {
        return;
      }
      const newRect = entries[0].contentRect;
      if (chartRef.current) {
        chartRef.current.applyOptions({ width: newRect.width });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, markers]);

  return (
    <div className="relative w-full h-[400px]">
      <div ref={chartContainerRef} className="w-full h-full font-mono-data" />
    </div>
  );
}