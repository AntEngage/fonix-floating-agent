import React, { useEffect, useState } from 'react';
import './BubbleVisualizer.css';

const BubbleVisualizer = ({ volume }) => {
  const [bubbleSize, setBubbleSize] = useState(100);

  useEffect(() => {
    const newSize = 130 + volume * 10;
    setBubbleSize(newSize);
  }, [volume]);

  return (
    <div className="siri-visualizer">
      <div className="siri-bubble" style={{ width: `${bubbleSize}px`, height: `${bubbleSize}px` }}>
        <div className="siri-glow" />
        <div className="siri-glow-secondary" />
      </div>
    </div>
  );
};

export default BubbleVisualizer;
