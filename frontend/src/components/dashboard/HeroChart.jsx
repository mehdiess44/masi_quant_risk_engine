import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function HeroChart({ data = [], markers = [] }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (data.length === 0) return;

    const mappedData = data.map(item => ({ 
      time: item.date || item.time, 
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close !== undefined ? item.close : item.value 
    }));
    
    const chartMarkers = markers.length > 0 ? markers : generateDummyMarkers(mappedData);

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
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(mappedData);
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
      time: data[data.length - 20].time,
      position: 'aboveBar',
      color: '#FFB020',
      shape: 'arrowDown',
      text: 'AI SELL',
    });
  }
  return markers;
}
