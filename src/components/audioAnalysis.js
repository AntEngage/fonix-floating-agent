import { useRef, useEffect, useState } from 'react';

const useAudioAnalysis = (audioContext, analyserNode) => {
  const [volume, setVolume] = useState(0);
  const [emotion, setEmotion] = useState('neutral');

  useEffect(() => {
    if (!audioContext || !analyserNode) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const analyzeAudio = () => {
      analyserNode.getByteTimeDomainData(dataArray);
      const rms = Math.sqrt(dataArray.reduce((sum, value) => sum + (value - 128) ** 2, 0) / dataArray.length);
      setVolume(rms);

      if (rms > 20) {
        setEmotion('angry');
      } else if (rms > 10) {
        setEmotion('happy');
      } else {
        setEmotion('neutral');
      }

      requestAnimationFrame(analyzeAudio);
    };

    analyzeAudio();

    return () => cancelAnimationFrame(analyzeAudio);
  }, [audioContext, analyserNode]);

  return { volume, emotion };
};

export default useAudioAnalysis;
