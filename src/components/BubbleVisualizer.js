import React, { useEffect, useState } from 'react';
import './BubbleVisualizer.css';

const BubbleVisualizer = ({ volume }) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const initialBars = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      height: Math.random() * 50 + 30,
    }));
    setBars(initialBars);

    const interval = setInterval(() => {
      setBars(bars.map(bar => ({
        ...bar,
        height: Math.max(100 * (volume / 30), 20),
      })));
    }, 200);

    return () => clearInterval(interval);
  }, [volume]);

  return (
    <div className="visualizer-container">
      <svg width="100%" height="100%" viewBox="0 0 300 100">
        {bars.map((bar) => (
          <rect
            key={bar.id}
            x={bar.id * 15}
            y={50 - bar.height / 2}
            width="10"
            height={bar.height}
            rx="5" // Rounded corners
            fill={`url(#gradient${bar.id % 2})`}
          />
        ))}
        <defs>
          <linearGradient id="gradient0" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#9033be', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#42409e', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#42409e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#9033be', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BubbleVisualizer;
