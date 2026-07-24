import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function HeroChart({ data = [], markers = [] }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Default dummy data if none provided
    const chartData = data.length > 0 ? data : generateDummyData();
    const chartMarkers = markers.length > 0 ? markers : generateDummyMarkers(chartData);

    const handleResize = () => {
      if(chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#7A8499',
      },
      grid: {
        vertLines: { color: 'rgba(45, 124, 255, 0.05)' },
        horzLines: { color: 'rgba(45, 124, 255, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#00D4FF',
          width: 1,
          style: 1,
          labelBackgroundColor: '#2D7CFF',
        },
        horzLine: {
          color: '#00D4FF',
          width: 1,
          style: 1,
          labelBackgroundColor: '#2D7CFF',
        },
      },
      timeScale: {
        borderColor: 'rgba(45, 124, 255, 0.08)',
      },
      rightPriceScale: {
        borderColor: 'rgba(45, 124, 255, 0.08)',
      },
    });
    
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00FFA3',
      downColor: '#FF2D55',
      borderVisible: false,
      wickUpColor: '#00FFA3',
      wickDownColor: '#FF2D55',
    });

    candlestickSeries.setData(chartData);
    candlestickSeries.setMarkers(chartMarkers);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, markers]);

  return (
    <div className="relative w-full h-[400px]">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full font-mono-data"
      />
    </div>
  );
}

// Helpers for visual demonstration
function generateDummyData() {
  const res = [];
  let time = new Date('2023-01-01').getTime();
  let open = 12000;
  for (let i = 0; i < 100; i++) {
    time += 24 * 60 * 60 * 1000; // +1 day
    const volatility = (Math.random() - 0.5) * 150;
    const close = open + volatility;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    
    res.push({
      time: time / 1000,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close)
    });
    open = close;
  }
  return res;
}

function generateDummyMarkers(data) {
  const markers = [];
  // AI specific markers
  if (data.length > 50) {
    markers.push({
      time: data[20].time,
      position: 'belowBar',
      color: '#00D4FF',
      shape: 'arrowUp',
      text: 'AI BUY',
    });
    markers.push({
      time: data[60].time,
      position: 'aboveBar',
      color: '#FFB020',
      shape: 'arrowDown',
      text: 'AI SELL',
    });
    markers.push({
      time: data[85].time,
      position: 'belowBar',
      color: '#00D4FF',
      shape: 'arrowUp',
      text: 'AI BUY',
    });
  }
  return markers;
}
