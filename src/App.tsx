import { useState, useEffect } from "react";
import createTuner from "@pedroloch/tuner";
import { TunerData } from "@pedroloch/tuner/dist/interfaces";
import useMicrophoneVolume from "react-use-microphone-volume-hook";
import { C0, Notes } from "./constants";
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

const tuner = createTuner();

function getOctave(pitch: number) {
  return Math.floor(Math.log2(pitch / C0));
}

function App() {
  const [isListening, setIsListening] = useState(false);
  const [tunerData, setTunerData] = useState<TunerData>(defaultTunerData);
  const [
    volume,
    { startTrackingMicrophoneVolume, stopTrackingMicrophoneVolume },
  ] = useMicrophoneVolume();

  const handleListening = () => {
    if (isListening) {
      disableListening();
    } else {
      enableListening();
    }
  };

  const enableListening = () => {
    const status = startTrackingMicrophoneVolume();
    if (status) setIsListening(true);
    tuner.start();
  };

  const disableListening = () => {
    const status = stopTrackingMicrophoneVolume();
    if (status) setIsListening(false);
    tuner.stop();
  };

  useEffect(() => {
    console.log("Listening Changed", isListening);
  }, [isListening]);

  tuner.getData((data) => {
    if (volume >= volumeThreshold) {
      setTunerData(data);
    }
  });

  const random_note = Notes[Math.floor(Math.random() * Notes.length)];

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
        <button onClick={handleListening}>
          {isListening ? "Stop practice" : "Start practice"}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Volume {volume}, Tuner {tunerData.note} {tunerData.pitch}, Octave
        {getOctave(tunerData.pitch)}, Random Note
        {random_note.name} {random_note.octave}
      </p>
    </>
  );
}

export default App;
