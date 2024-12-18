import { useState, useEffect } from "react";
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

const pitchTracker = createTuner();

function getOctave(pitch: number) {
  return Math.floor(Math.log2(pitch / C0));
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
    pitchTracker.start();
  };

  const disableListening = () => {
    const status = stopTrackingMicrophoneVolume();
    if (status) setIsListening(false);
    pitchTracker.stop();
  };

  useEffect(() => {
    console.log("Practice state:", practiceState);

    switch (practiceState) {
      case "Idle":
        break;
      case "New Note":
        const randomNote = Notes[Math.floor(Math.random() * Notes.length)];
        setCurrentNote(randomNote);
        setPracticeState("Listening");
        enableListening();
        break;
      case "Listening":
        break;
    }
  }, [practiceState]);

  useEffect(() => {
    console.log("Listening Changed", isListening);
  }, [isListening]);

  pitchTracker.getData((data) => {
    if (volume >= volumeThreshold) {
      setTunerData(data);
    }
  });

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
        Volume {volume}, Tuner {tunerData.note} {tunerData.pitch}, Octave
        {getOctave(tunerData.pitch)}, Random Note
        {currentNote.name} {currentNote.octave}
      </p>
    </>
  );
}

export default App;
