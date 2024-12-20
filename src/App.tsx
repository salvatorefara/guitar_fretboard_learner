import { useState, useEffect, useRef } from "react";
import * as Pitchfinder from "pitchfinder";
import {
  AudioBufferSize,
  C0,
  NextNotePause,
  Notes,
  NoteNames,
  SampleRate,
} from "./constants";
import { Note, PracticeState } from "./types";
import "./App.css";

function getNote(pitch: number | null): Note | null {
  if (pitch == null) {
    return null;
  }
  const semitone = Math.round(12 * Math.log2(pitch / C0));
  const octave = Math.floor(semitone / 12);
  const noteName = NoteNames[semitone % 12];
  return { name: noteName, octave: octave };
}

const calculateRMS = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

const App = () => {
  const [pitch, setPitch] = useState<number | null>(null);
  const [practiceState, setPracticeState] = useState<PracticeState>("Idle");
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [detectedNote, setDetectedNote] = useState<Note | null>(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isNewPitch, setIsNewPitch] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const previousPitchRMSRef = useRef(0);

  const detectPitch = Pitchfinder.AMDF({
    sampleRate: SampleRate,
    minFrequency: 70,
    maxFrequency: 1500,
  });

  const handlePractice = () => {
    if (practiceState == "Idle") {
      startListening();
      setPracticeState("New Note");
      setCorrect(0);
      setIncorrect(0);
    } else {
      stopListening();
      setPracticeState("Idle");
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioContext = new window.AudioContext({
        sampleRate: SampleRate,
      });
      const source = audioContext.createMediaStreamSource(stream);

      const scriptProcessor = audioContext.createScriptProcessor(
        AudioBufferSize,
        1,
        1
      );
      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const detectedPitch = detectPitch(inputBuffer);
        setPitch(detectedPitch);
        setDetectedNote(getNote(detectedPitch));

        // if (detectedPitch) {
        //   const currentPitchRMS = calculateRMS(inputBuffer);
        //   if (currentPitchRMS > previousPitchRMSRef.current) {
        //     setIsNewPitch(true);
        //   } else {
        //     setIsNewPitch(false);
        //   }
        //   previousPitchRMSRef.current = currentPitchRMS;
        // } else {
        //   setIsNewPitch(false);
        //   previousPitchRMSRef.current = 0;
        // }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      scriptProcessorRef.current = scriptProcessor;
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopListening = () => {
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
        break;
      case "Listening":
        // if (detectedNote && isNewPitch) {
        if (detectedNote) {
          setPracticeState("Feedback");
        }
        break;
      case "Feedback":
        if (
          currentNote?.name == detectedNote?.name &&
          currentNote?.octave == detectedNote?.octave
        ) {
          setCorrect((correct) => correct + 1);
        } else {
          setIncorrect((incorrect) => incorrect + 1);
        }
        setPracticeState("Wait");
        break;
      case "Wait":
        setTimeout(() => {
          setPracticeState("New Note");
        }, NextNotePause);
    }
  }, [practiceState, isNewPitch, detectedNote]);

  return (
    <div>
      <h1>Guitar Fretboard Learner</h1>
      <div>
        <img
          src={
            practiceState == "Idle"
              ? "notes/the_lick.svg"
              : "notes/" +
                currentNote?.name.toLowerCase() +
                currentNote?.octave +
                ".svg"
          }
          className="note"
          alt="Vite logo"
        />
      </div>
      <div>
        <p>Correct: {correct}</p>
        <p>Incorrect: {incorrect}</p>
      </div>
      <button onClick={handlePractice}>
        {practiceState == "Idle" ? "Start Practice" : "Stop Practice"}
      </button>
      <div>
        <p>
          Current Note Name: {currentNote?.name}, Octave: {currentNote?.octave}
        </p>
        <p>
          Detected Note Name: {detectedNote?.name}, Octave:{" "}
          {detectedNote?.octave}
        </p>
        <p>
          {"notes/" +
            currentNote?.name.toLowerCase() +
            currentNote?.octave +
            ".svg"}
        </p>
      </div>
    </div>
  );
};

export default App;
