import { useState, useEffect, useRef } from "react";
import { YIN } from "pitchfinder";
import createTuner from "@pedroloch/tuner";
import { TunerData } from "@pedroloch/tuner/dist/interfaces";
import useMicrophoneVolume from "react-use-microphone-volume-hook";
import { C0, Notes } from "./constants";
import { Note, PracticeState } from "./types";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const defaultTunerData: TunerData = {
  frequency: 0,
  pitch: 440,
  note: "A",
  diff: 0,
};

const volumeThreshold = 30;

// const pitchTracker = createTuner();

function getOctave(pitch: number) {
  return Math.floor(Math.log2(pitch / C0));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function App() {
  const [practiceState, setPracticeState] = useState<PracticeState>("Idle");
  const [currentNote, setCurrentNote] = useState<Note>(Notes[0]);
  const [isListening, setIsListening] = useState(false);
  const [tunerData, setTunerData] = useState<TunerData>(defaultTunerData);
  const [
    volume,
    { startTrackingMicrophoneVolume, stopTrackingMicrophoneVolume },
  ] = useMicrophoneVolume();

  const handlePractice = () => {
    if (practiceState == "Idle") {
      setPracticeState("New Note");
    } else {
      setPracticeState("Idle");
    }
  };

  const enableListening = () => {
    if (!isListening) {
      const status = startTrackingMicrophoneVolume();
      if (status) setIsListening(true);
    }
    // if (!pitchTracker.isOn) {
    //   pitchTracker.start();
    // }
  };

  const disableListening = () => {
    if (isListening) {
      const status = stopTrackingMicrophoneVolume();
      if (status) setIsListening(false);
    }
    // if (pitchTracker.isOn) {
    //   pitchTracker.stop();
    // }
  };

  useEffect(() => {
    console.log("Practice state:", practiceState);

    switch (practiceState) {
      case "Idle":
        disableListening();
        break;
      case "New Note":
        const randomNote = Notes[Math.floor(Math.random() * Notes.length)];
        setCurrentNote(randomNote);
        setPracticeState("Listening");
        break;
      case "Listening":
        enableListening();
        break;
      case "Feedback":
        disableListening();
        console.log(currentNote.name, tunerData.note);
        console.log(currentNote.octave, getOctave(tunerData.pitch));
        setPracticeState("Pause");
        // if (
        //   currentNote.name == tunerData.note &&
        //   currentNote.octave == getOctave(tunerData.pitch)
        // ) {
        //   console.log("Correct");
        // } else {
        //   console.log("Incorrect");
        // }
        break;
      case "Pause":
        setTimeout(() => {
          setPracticeState("New Note");
        }, 100);
        break;
    }
  }, [practiceState]);

  useEffect(() => {
    console.log("Listening: ", isListening);
  }, [isListening]);

  // pitchTracker.getData((data) => {
  //   // if (volume >= volumeThreshold) {
  //   setTunerData(data);
  //   setPracticeState("Feedback");
  //   // }
  // });

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handlePractice}>
          {practiceState == "Idle" ? "Start practice" : "Stop practice"}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Volume {volume},
        {/* Tuner {tunerData.note} {tunerData.pitch}, Octave {getOctave(tunerData.pitch)},  */}
        Random Note {currentNote.name} {currentNote.octave}
      </p>
    </>
  );
}

const PitchDetection: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pitch, setPitch] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const detectPitch = YIN();

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new window.AudioContext();
      const source = audioContext.createMediaStreamSource(stream);

      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);

        // Run pitch detection on the current audio frame
        const detectedPitch = detectPitch(inputBuffer);
        setPitch(detectedPitch || null);
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      scriptProcessorRef.current = scriptProcessor;

      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
  };

  return (
    <div>
      <h1>Real-Time Pitch Detection</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {pitch && (
        <div>
          <h2>Detected Pitch: {pitch.toFixed(2)} Hz</h2>
        </div>
      )}
    </div>
  );
};

export default PitchDetection;

// export default App;
