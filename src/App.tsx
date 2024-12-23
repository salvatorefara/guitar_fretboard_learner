import { useState, useEffect, useRef, useMemo } from "react";
import * as Pitchfinder from "pitchfinder";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";
import Header from "./components/Header";
import Score from "./components/Score";
import { calculateRMS, getNote, noteToImage } from "./utils";
import {
  AudioBufferSize,
  minPitchRMS,
  minPitchRMSDiff,
  Notes,
  SampleRate,
} from "./constants";
import { Note, PracticeState } from "./types";
import "./styles/App.css";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [practiceState, setPracticeState] = useState<PracticeState>("Idle");
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [detectedNote, setDetectedNote] = useState<Note | null>(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [newNoteTimestamp, setNewNoteTimestamp] = useState(0);
  const [oldNoteTimestamp, setOldNoteTimestamp] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const previousPitchRMSRef = useRef(0);
  const imageCache = useRef<{ [key: string]: HTMLImageElement }>({});

  const detectPitch = Pitchfinder.AMDF({
    sampleRate: SampleRate,
    minFrequency: 70,
    maxFrequency: 1500,
  });

  const cacheImages = async (): Promise<void> => {
    const idleImage = new Image();
    const src = noteToImage(null);
    idleImage.src = src;
    imageCache.current[src] = idleImage;

    const promises = Notes.map((note) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        const src = noteToImage(note);
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject();
        imageCache.current[src] = img;
      });
    });
    await Promise.all(promises);
    setIsLoading(false);
  };

  useEffect(() => {
    cacheImages();
  }, []);

  const imagePath = useMemo(() => {
    if (practiceState === "Idle") {
      return imageCache.current[noteToImage(null)]?.src || "notes/the_lick.svg";
    } else if (currentNote) {
      return imageCache.current[noteToImage(currentNote)]?.src || "";
    }
    return "";
  }, [practiceState, currentNote]);

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
        const inputRMS = calculateRMS(inputBuffer);
        const detectedPitch =
          inputRMS > minPitchRMS ? detectPitch(inputBuffer) : null;
        const pitchRMS = calculateRMS(inputBuffer);
        const note = getNote(detectedPitch);

        if (!detectedPitch) {
          previousPitchRMSRef.current = minPitchRMS;
        } else if (pitchRMS > minPitchRMSDiff + previousPitchRMSRef.current) {
          console.log("New note!");
          setNewNoteTimestamp(Date.now());
          previousPitchRMSRef.current = pitchRMS;
        } else {
          previousPitchRMSRef.current = pitchRMS;
        }

        setDetectedNote(note);
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
        if (detectedNote && oldNoteTimestamp != newNoteTimestamp) {
          setOldNoteTimestamp(newNoteTimestamp);
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
        setPracticeState("New Note");
        break;
    }
  }, [practiceState, newNoteTimestamp, detectedNote]);

  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <CircularProgress color="inherit" />
      </div>
    );
  } else {
    return (
      <div className="app">
        <Header />
        <div>
          <img
            src={imagePath}
            className="note"
            alt={noteToImage(currentNote)}
          />
        </div>
        <Typography variant="h2">
          {practiceState != "Idle" ? currentNote?.name : ""}
        </Typography>
        <Score correct={correct} incorrect={incorrect} />
        <Button className="button" variant="contained" onClick={handlePractice}>
          {practiceState == "Idle" ? "Start Practice" : "Stop Practice"}
        </Button>
      </div>
    );
  }
};

export default App;
