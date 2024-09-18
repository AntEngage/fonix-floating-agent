import React, { useState, useEffect } from "react";
import './Overlay.css';  // Import the CSS file

const VoiceActivityOverlay = ({ voiceActivity }) => {
  const [shuffledVoiceActivity, setShuffledVoiceActivity] = useState({});

  useEffect(() => {
    const randomize = (min, max) => (Math.random() * (max - min) + min).toFixed(3);

    Object.entries(voiceActivity).forEach(([activity, finalScore]) => {
      let shuffleInterval = setInterval(() => {
        setShuffledVoiceActivity(prev => ({
          ...prev,
          [activity]: randomize(0, 1),
        }));
      }, 100);

      setTimeout(() => {
        clearInterval(shuffleInterval);
        setShuffledVoiceActivity(prev => ({
          ...prev,
          [activity]: finalScore.toFixed(3),
        }));
      }, 1000);
    });
  }, [voiceActivity]);

  return (
    <div className="overlay-container absolute top-0 left-0 p-2 gradient-bg text-white rounded-lg shadow-lg m-2 float-effect" style={{ zIndex: 1000, width: '190px' }}>
      <h3 className="text-sm label-glow">Voice Activities</h3>
      <ul className="space-y-1 text-xs">
        {Object.entries(voiceActivity).map(([activity]) => (
          <li key={activity} className="flex justify-between items-center">
            <span className="highlighted">{activity}</span>
            <span className="badge highlighted">{shuffledVoiceActivity[activity]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoiceActivityOverlay;
