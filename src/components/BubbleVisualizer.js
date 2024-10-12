import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import './BubbleVisualizer.css';

const BubbleVisualizer = ({ volume }) => {
  const bubbleRef = useRef(null);
  const particleRef = useRef([]);

  useEffect(() => {
    const newSize = 130 + volume * 10;

    anime({
      targets: bubbleRef.current,
      width: `${newSize}px`,
      height: `${newSize}px`,
      background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, ${0.5 + volume * 0.05}), rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0))`,
      duration: 500,
      easing: 'easeOutElastic(1, .8)',
    });

    if (volume > 5) {
      anime({
        targets: particleRef.current,
        translateY: () => anime.random(-50, 50),
        translateX: () => anime.random(-50, 50),
        scale: [0.5, 1],
        opacity: [1, 0],
        duration: 1500,
        easing: 'easeOutQuad',
      });
    }
  }, [volume]);

  return (
    <div className="siri-visualizer">
      <div ref={bubbleRef} className="siri-bubble">
        <div className="siri-glow" />
        <div className="siri-glow-secondary" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (particleRef.current[i] = el)}
            className="siri-particle"
          />
        ))}
      </div>
    </div>
  );
};

export default BubbleVisualizer;
