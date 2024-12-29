import { useState, useEffect, useRef, useMemo } from "react";
import * as Pitchfinder from "pitchfinder";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import Typography from "@mui/material/Typography";
import Countdown from "./components/Countdown";
import Header from "./components/Header";
import Score from "./components/Score";
import Settings from "./components/Settings";
import {
  calculateRMS,
  drawNote,
  getLocalStorageItem,
  getNote,
  noteToImage,
} from "./utils";
import {
  AudioBufferSize,
  CountdownTime,
  MinPitchRMS,
  MinPitchRMSDiff,
  Notes,
  SampleRate,
} from "./constants";
import { Note, PracticeState } from "./types";
import "./styles/App.css";

const App = () => {
  const [countdown, setCountdown] = useState(CountdownTime);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showNoteName, setShowNoteName] = useState(
    getLocalStorageItem("showNoteName", true)
  );
  const [changeNoteOnMistake, setChangeNoteOnMistake] = useState(
    getLocalStorageItem("changeNoteOnMistake", true)
  );
  const [noteIndexRange, setNoteIndexRange] = useState(
    getLocalStorageItem("noteIndexRange", [0, Notes.length - 1])
  );
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
    if (["Idle", "Countdown"].includes(practiceState)) {
      return imageCache.current[noteToImage(null)]?.src || "notes/the_lick.svg";
    } else if (currentNote) {
      return imageCache.current[noteToImage(currentNote)]?.src || "";
    }
    return "";
  }, [practiceState, currentNote]);

  const handlePractice = () => {
    if (practiceState == "Idle") {
      startListening();
      setCountdown(CountdownTime);
      setPracticeState("Countdown");
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
          inputRMS > MinPitchRMS ? detectPitch(inputBuffer) : null;
        const pitchRMS = calculateRMS(inputBuffer);
        const note = getNote(detectedPitch);

        if (!detectedPitch) {
          previousPitchRMSRef.current = MinPitchRMS;
        } else if (pitchRMS > MinPitchRMSDiff + previousPitchRMSRef.current) {
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
        const randomNote = drawNote(noteIndexRange);
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
          setPracticeState("New Note");
        } else {
          setIncorrect((incorrect) => incorrect + 1);
          if (changeNoteOnMistake) {
            setPracticeState("New Note");
          } else {
            setPracticeState("Listening");
          }
        }
        break;
    }
  }, [practiceState, newNoteTimestamp, detectedNote]);

  useEffect(() => {
    if (countdown === 0) {
      setPracticeState("New Note");
    }
  }, [countdown]);

  useEffect(() => {
    localStorage.setItem("showNoteName", JSON.stringify(showNoteName));
  }, [showNoteName]);

  useEffect(() => {
    localStorage.setItem(
      "changeNoteOnMistake",
      JSON.stringify(changeNoteOnMistake)
    );
  }, [changeNoteOnMistake]);

  useEffect(() => {
    localStorage.setItem("noteIndexRange", JSON.stringify(noteIndexRange));
  }, [noteIndexRange]);

  if (isLoading) {
    return (
      <div className="app">
        <Header setSettingsOpen={setSettingsOpen} />
        <div className="circular-progress">
          <CircularProgress color="inherit" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="app">
        <Header setSettingsOpen={setSettingsOpen} />
        <img src={imagePath} className="note" alt={noteToImage(currentNote)} />
        <Typography variant="h2" sx={{ color: "black" }}>
          {["Idle", "Countdown"].includes(practiceState) || !showNoteName
            ? ""
            : currentNote?.name}
        </Typography>
        {practiceState == "Countdown" ? (
          <Countdown time={countdown} setTime={setCountdown} />
        ) : (
          <div></div>
        )}
        <Score correct={correct} incorrect={incorrect} />
        <Button className="button" variant="contained" onClick={handlePractice}>
          {practiceState == "Idle" ? "Start Practice" : "Stop Practice"}
        </Button>
        <Settings
          open={settingsOpen}
          setOpen={setSettingsOpen}
          showNoteName={showNoteName}
          setShowNoteName={setShowNoteName}
          changeNoteOnMistake={changeNoteOnMistake}
          setChangeNoteOnMistake={setChangeNoteOnMistake}
          noteIndexRange={noteIndexRange}
          setNoteIndexRange={setNoteIndexRange}
        />
      </div>
    );
  }
};

export default App;
