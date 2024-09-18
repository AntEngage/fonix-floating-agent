import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import useAudioAnalysis from "./audioAnalysis"; // Ensure this path is correct in your project
import { v4 as uuidv4 } from "uuid";
import BubbleVisualizer from "./BubbleVisualizer"; // Import directly since we are not using next/dynamic

const localTimeUTC = new Date().toISOString();
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const date = new Date(localTimeUTC);

const options = {
  timeZone,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const formatter = new Intl.DateTimeFormat("en-US", options);

const parts = formatter.formatToParts(date);

const localTime = `${parts[4].value}-${parts[0].value}-${parts[2].value} ${parts[6].value}:${parts[8].value}:${parts[10].value}`;

const SOCKET_URL = `${process.env.NEXT_PUBLIC_WEB_CALL_URL
  }?localTime=${encodeURIComponent(localTime)}`;
console.log(SOCKET_URL);

const socket = io(SOCKET_URL);

const AudioHandler = ({
  showBubbleVisualizer,
  heading,
  showTimer,
  direction,
  socketConnected,
  setSocketConnected,
  botId,
}) => {
  const [callId, setCallId] = useState("");
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [monitorAudio, setMonitorAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [inputDevices, setInputDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const captureAudioContextRef = useRef(null);
  const playbackAudioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const isMutedRef = useRef(false);
  const gainNodeRef = useRef(null);
  const [callStarted, setCallStarted] = useState(false);
  const currentSourceRef = useRef(null);
  const [isPermissionGranted, setPermissionGranted] = useState(false);
  const [socketConnecting, setSocketConnecting] = useState(false);
  const [emo, setEmo] = useState(null);
  const [vad, setVad] = useState(null);

  const { volume, emotion } = useAudioAnalysis(
    playbackAudioContextRef.current,
    analyserRef.current
  );

  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    console.log("callId : ", callId);
    if (callId) {
      socket.on(`outputAudioChunk/${callId}`, (chunk) => {
        console.log("Received audio chunk");
        console.log(chunk.length);
        audioQueueRef.current.push(chunk);
        if (!isPlayingRef.current) {
          playNextChunk();
        }
      });

      socket.on(`cleanup-queue/${callId}`, () => {
        console.log("Received cleanup event");
        stopAndFlushAudio();
      });

      socket.on(`endCallEvent/${callId}`, ({ state }) => {
        console.log("Received call state change event");
        console.log(state);
        if (state === "endCall") {
          setTimeout(() => {
            handleEndCall();
          }, 3000);
        }
      });

      socket.on(`audioFeatures`, ({ data }) => {
        console.log(data);
        if (data && data.data) {
          setEmo(data.data.emotion_data);
          setVad(data.data.voice_activity);
        }
      });
    }

    return () => {
      if (callId) {
        socket.off(`outputAudioChunk/${callId}`);
        socket.off(`cleanup-queue/${callId}`);
        socket.off(`endCallEvent/${callId}`);
      }
    };
  }, [callId]);

  useEffect(() => {
    const handleCallStarted = (data) => {
      setCallStarted(true);
      setCallId(data.callId);
      setTimer(0);
      setTimerActive(true);
    };

    socket.on("callStarted", handleCallStarted);
    return () => {
      socket.off("callStarted", handleCallStarted);
    };
  }, []);

  useEffect(() => {
    enumerateDevices();
  }, []);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      setInputDevices(audioInputDevices);
      if (audioInputDevices.length > 0) {
        setSelectedDeviceId(audioInputDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
    }
  };

  const startCall = async () => {
    console.log("Starting call...");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
    } catch (err) {
      setPermissionGranted(false);
      console.log(err);
      return;
    }

    setSocketConnecting(true);
    if (socket.connected) {
      setSocketConnected(true);
      setSocketConnecting(false);
      console.log("Socket is already connected");
    } else {
      console.log("Connecting to server...");
      socket.connect();
      socket.on("connect", () => {
        setSocketConnected(true);
        setSocketConnecting(false);
        console.log("Socket connected successfully");
      });
      socket.on("connect_error", (error) => {
        setSocketConnected(false);
        setSocketConnecting(false);
        console.log("Socket connection error:", error);
      });
      socket.on("disconnect", () => {
        setSocketConnected(false);
        setSocketConnecting(false);
        console.log("Socket disconnected");
      });
    }
    const localCallId = uuidv4();

    if (!captureAudioContextRef.current) {
      captureAudioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 16000 });
    }

    if (!playbackAudioContextRef.current) {
      playbackAudioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 48000 });
    }

    analyserRef.current = playbackAudioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    gainNodeRef.current = playbackAudioContextRef.current.createGain();
    gainNodeRef.current.gain.value = 1;
    analyserRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(playbackAudioContextRef.current.destination);

    if (captureAudioContextRef.current.audioWorklet) {
      try {
        await captureAudioContextRef.current.audioWorklet.addModule(
          "processor.js"
        );
      } catch (error) {
        console.error("Error adding audio worklet module:", error);
      }
    }

    console.log(
      "captureAudioContextRef.current.state : ",
      captureAudioContextRef.current.state
    );
    if (socket.disconnected) {
      console.log("Connecting to server...");
      socket.connect();
    }
    console.log("ari client", botId);
    socket.emit("startCall", {
      callId: localCallId,
      ariClient: "45172662-d1e1-49ae-b4fb-51d27e7aa5bf",
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          voiceActivityDetection: true,
        },
      });
      console.log("Media stream active:", stream.active);
      console.log("Audio tracks:", stream.getAudioTracks());
      handleAudio(stream, localCallId);
    } catch (error) {
      console.log(error);
    }
  };

  const stopAndFlushAudio = () => {
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    stopCurrentSource();
    console.log("Audio playback stopped and queue flushed.");
  };

  const handleAudio = (stream, localCallId) => {
    if (
      captureAudioContextRef.current &&
      captureAudioContextRef.current.state === "suspended"
    ) {
      captureAudioContextRef.current.resume().then(() => {
        console.log("AudioContext resumed");
      });
    }

    mediaStreamRef.current = stream;
    const source =
      captureAudioContextRef.current.createMediaStreamSource(stream);
    if (!workletNodeRef.current) {
      workletNodeRef.current = new AudioWorkletNode(
        captureAudioContextRef.current,
        "my-processor"
      );
      workletNodeRef.current.port.onmessage = (event) => {
        if (
          captureAudioContextRef.current &&
          captureAudioContextRef.current.state === "suspended"
        ) {
          captureAudioContextRef.current.resume().then(() => {
            console.log("AudioContext resumed from onmessage");
          });
        }
        if (!isMutedRef.current) {
          console.log("Sending audio chunk");
          socket.emit(`inputAudioChunk/${localCallId}`, { chunk: event.data });
        }
      };
    }
    setupNode(workletNodeRef.current);
    source.connect(workletNodeRef.current);
    console.log("Audio source connected to worklet node");
  };

  const handleEndCall = () => {
    setTimerActive(false);
    stopAndFlushAudio();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.stop();
      });
    }
    if (captureAudioContextRef.current) {
      captureAudioContextRef.current.close();
      captureAudioContextRef.current = null;
    }
    if (playbackAudioContextRef.current) {
      playbackAudioContextRef.current.close();
      playbackAudioContextRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    socket.emit("endCall", { callId });
    socket.close();
    setCallId("");
    // Replace router.push with window.location if needed
    window.location.href = "/web-call-feedback";
  };

  const setupNode = (node) => {
    if (monitorAudio) {
      node.connect(captureAudioContextRef.current.destination);
    } else {
      node.disconnect();
    }
  };

  const playNextChunk = () => {
    if (audioQueueRef.current.length > 0 && !isPlayingRef.current) {
      isPlayingRef.current = true;
      const chunk = audioQueueRef.current.shift();
      console.log(chunk.length, " done");
      playAudioChunk(chunk, () => {
        console.log("Playing new chunk");
        isPlayingRef.current = false;
        playNextChunk();
      });
    }
  };

  const playAudioChunk = (chunk, callback) => {
    let arrayBuffer;
    if (typeof chunk === "string") {
      const binaryString = window.atob(chunk);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      arrayBuffer = chunk;
    }

    try {
      playbackAudioContextRef.current.decodeAudioData(
        arrayBuffer,
        async (buffer) => {
          const resampledBuffer = await resampleBuffer(
            buffer,
            playbackAudioContextRef.current.sampleRate,
            48000
          );
          const source = playbackAudioContextRef.current.createBufferSource();
          source.buffer = resampledBuffer;
          source.connect(analyserRef.current);
          source.connect(gainNodeRef.current);
          source.start();
          source.onended = callback;
          currentSourceRef.current = source;
        },
        (e) => {
          console.error("Error decoding audio data:", e);
        }
      );
    } catch (error) {
      console.log("Error decoding audio data:", error);
    }
  };

  const resampleBuffer = (buffer, fromSampleRate, toSampleRate) => {
    return new Promise((resolve) => {
      const offlineContext = new OfflineAudioContext(
        buffer.numberOfChannels,
        (buffer.length * toSampleRate) / fromSampleRate,
        toSampleRate
      );
      const bufferSource = offlineContext.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(offlineContext.destination);
      bufferSource.start(0);
      offlineContext.startRendering().then((resampledBuffer) => {
        resolve(resampledBuffer);
      });
    });
  };

  const stopCurrentSource = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current.disconnect();
      currentSourceRef.current = null;
    }
  };


  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    isMutedRef.current = !isMuted;
  };

  const toggleSpeaker = () => {
    setSpeakerOn((prev) => {
      const newSpeakerOn = !prev;
      gainNodeRef.current.gain.value = newSpeakerOn ? 1 : 0;
      return newSpeakerOn;
    });
  };

  useEffect(() => {
    startCall();
  }, []);

  return (
    <>
      {!isPermissionGranted ? (
        <div className="w-[701px] flex flex-col  gap-4 py-14 transition-all duration-200 opacity-100 h-auto text-center">
          <h1 className="font-bold text-lg">Please provide microphone permission!</h1>
        </div>
      ) :
        <div className="relative">
          {!socketConnected ? (
            <div className="w-[701px] flex flex-col  gap-4 py-14 transition-all duration-200 opacity-100 h-auto text-center">
              <h1 className="font-bold text-lg">Yikes! Something's off.</h1>
              <div>
                <button onClick={startCall} disabled={socketConnecting}>
                  {socketConnecting ? "Connecting..." : "Try that again"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {callStarted ? (
                <div className="w-[701px] flex flex-col gap-y-6 py-7 transition-all duration-200 opacity-100 h-auto">
                  <div className="flex flex-col gap-3 text-[#404040] text-center">
                    {showBubbleVisualizer && (
                      <div className="w-full flex items-center justify-center">
                        <BubbleVisualizer
                          volume={volume}
                          emotion={emotion}
                          logo={"/antengage-min.png"}
                        />
                      </div>
                    )}
                    {heading && (
                      <h2 className="text-3xl font-semibold">{heading}</h2>
                    )}
                    {timerActive && showTimer && (
                      <p className="text-[20px] font-medium"></p>
                    )}
                  </div>

                  <div
                    className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"
                      } items-center justify-center gap-5`}
                  >
                    <img
                      src={
                        !isMuted ? "/images/mute_off.svg" : "/images/mute_on.svg"
                      }
                      width={60}
                      height={60}
                      alt="mic"
                      className="shadow-lg rounded-full cursor-pointer"
                      onClick={toggleMute}
                    />
                    <img
                      src="/images/call_cut.svg"
                      width={60}
                      height={60}
                      alt="call cut"
                      className="shadow-lg rounded-full cursor-pointer"
                      onClick={handleEndCall}
                    />
                    <img
                      src={
                        speakerOn
                          ? "/images/speaker_on.svg"
                          : "/images/speaker_off.svg"
                      }
                      width={60}
                      height={60}
                      alt="speaker"
                      className="shadow-lg rounded-full cursor-pointer"
                      onClick={toggleSpeaker}
                    />
                  </div>
                  <div className="flex justify-center">
                    <div>
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="p-2 border rounded w-64 sm:w-full"
                      >
                        {inputDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[701px] flex flex-col gap-y-[78px] py-14 transition-all duration-200 opacity-100 h-auto text-center">
                  <h1 className="font-bold text-lg">
                    We’ll connect you shortly...
                  </h1>
                </div>
              )}
            </div>
          )}
        </div>}
    </>
  );
};

export default AudioHandler;
