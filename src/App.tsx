import { useState, useEffect, useRef, useMemo } from "react";
import * as Pitchfinder from "pitchfinder";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import Clock from "./components/Clock";
import Note from "./components/Note";
import Header from "./components/Header";
import Score from "./components/Score";
import Settings from "./components/Settings";
import Statistics from "./components/Statistics";
import {
  calculateRMS,
  drawNote,
  getLocalStorageItem,
  getNote,
  initializeNoteAccuracy,
  noteToName,
  noteToImage,
} from "./utils";
import {
  AlphaEMA,
  CountdownTime,
  DrawNoteMinAccuracy,
  DrawNoteMethod,
  FeedbackDuration,
  IndexBufferSizeFraction,
  InstrumentNoteRangeIndex,
  InstrumentOctaveShift,
  MaxIndexBufferSize,
  MicSensitivityIndex,
  MaxNoteImageIndex,
  MinNoteImageIndex,
  MinPitchRMS,
  Notes,
  SampleRate,
  TimerTime,
} from "./constants";
import { Note as NoteType, PracticeState } from "./types";
import "./styles/App.css";

const App = () => {
  const [instrument, setInstrument] = useState(
    getLocalStorageItem("instrument", "guitar")
  );
  const [noteAccuracy, setNoteAccuracy] = useState(
    getLocalStorageItem("noteAccuracy", initializeNoteAccuracy())
  );
  const [useClock, setUseClock] = useState(
    getLocalStorageItem("useClock", true)
  );
  const [timer, setTimer] = useState(
    getLocalStorageItem("timerTime", TimerTime)
  );
  const [timerTime, setTimerTime] = useState(
    getLocalStorageItem("timerTime", TimerTime)
  );
  const [micSensitivityIndex, setMicSensitivityIndex] = useState(
    getLocalStorageItem("micSensitivityIndex", MicSensitivityIndex)
  );
  const [countdown, setCountdown] = useState(CountdownTime);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const [showNoteName, setShowNoteName] = useState(
    getLocalStorageItem("showNoteName", true)
  );
  const [changeNoteOnMistake, setChangeNoteOnMistake] = useState(
    getLocalStorageItem("changeNoteOnMistake", true)
  );
  const [noteIndexRange, setNoteIndexRange] = useState(
    getLocalStorageItem("noteIndexRange", InstrumentNoteRangeIndex[instrument])
  );
  const [isLoading, setIsLoading] = useState(true);
  const [practiceState, setPracticeState] = useState<PracticeState>("Idle");
  const [currentNote, setCurrentNote] = useState<NoteType | null>(null);
  const [detectedNote, setDetectedNote] = useState<NoteType | null>(null);
  const [noteIndexBuffer, setNoteIndexBuffer] = useState<number[]>(
    getLocalStorageItem("noteIndexBuffer", [])
  );
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [newNoteTimestamp, setNewNoteTimestamp] = useState(0);
  const [oldNoteTimestamp, setOldNoteTimestamp] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
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

    const promises = Notes.slice(MinNoteImageIndex, MaxNoteImageIndex + 1).map(
      (note) => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          const src = noteToImage(note);
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => reject();
          imageCache.current[src] = img;
        });
      }
    );
    await Promise.all(promises);
    setIsLoading(false);
  };

  useEffect(() => {
    cacheImages();
  }, []);

  const imagePath = useMemo(() => {
    if (["Idle", "Countdown"].includes(practiceState)) {
      return (
        imageCache.current[noteToImage(null, InstrumentOctaveShift[instrument])]
          ?.src || "notes/the_lick.svg"
      );
    } else if (currentNote) {
      return (
        imageCache.current[
          noteToImage(currentNote, InstrumentOctaveShift[instrument])
        ]?.src || ""
      );
    }
    return "";
  }, [practiceState, currentNote]);

  const handlePractice = () => {
    if (practiceState == "Idle") {
      startListening();
      if (useClock) {
        setCountdown(CountdownTime);
        setPracticeState("Countdown");
      } else {
        setPracticeState("New Note");
      }
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
      await audioContext.audioWorklet.addModule("audio/BufferProcessor.js");
      const source = audioContext.createMediaStreamSource(stream);

      const workletNode = new AudioWorkletNode(
        audioContext,
        "buffer-processor"
      );

      workletNode.port.onmessage = (event) => {
        const inputBuffer = event.data;
        const inputRMS = calculateRMS(inputBuffer);
        const detectedPitch =
          inputRMS > MinPitchRMS[micSensitivityIndex]
            ? detectPitch(inputBuffer)
            : null;
        const note = getNote(detectedPitch);

        if (!detectedPitch) {
          previousPitchRMSRef.current = MinPitchRMS[micSensitivityIndex];
        } else if (
          inputRMS >
          MinPitchRMS[micSensitivityIndex] + previousPitchRMSRef.current
        ) {
          console.log("New note!");
          setNewNoteTimestamp(Date.now());
          previousPitchRMSRef.current = inputRMS;
        } else {
          previousPitchRMSRef.current = inputRMS;
        }

        setDetectedNote(note);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      workletNodeRef.current = workletNode;
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
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const updateNoteAccuracy = (note: NoteType | null, update: number) => {
    if (note) {
      const noteName = noteToName(note);
      var NewNoteAccuracy = { ...noteAccuracy };
      NewNoteAccuracy[noteName] = NewNoteAccuracy[noteName]
        ? AlphaEMA * update + (1 - AlphaEMA) * NewNoteAccuracy[noteName]
        : update;
      setNoteAccuracy(NewNoteAccuracy);
    }
  };

  const updateNoteIndexBuffer = (index: number) => {
    const newNoteIndexBuffer = [
      ...noteIndexBuffer.slice(-MaxIndexBufferSize),
      index,
    ];
    setNoteIndexBuffer(newNoteIndexBuffer);

    console.log("newNoteIndexBuffer:", newNoteIndexBuffer);
  };

  const getResisedNoteindexBuffer = () => {
    const notesRangeCount = noteIndexRange[1] - noteIndexRange[0] + 1;
    const currentBufferSize = Math.min(
      MaxIndexBufferSize,
      Math.round(IndexBufferSizeFraction * notesRangeCount)
    );

    console.log("notesRangeCount:", notesRangeCount);
    console.log("currentBufferSize:", currentBufferSize);

    return noteIndexBuffer.slice(-currentBufferSize);
  };

  useEffect(() => {
    switch (practiceState) {
      case "Idle":
        break;
      case "New Note":
        const [randomNote, noteIndex] = drawNote(
          noteIndexRange,
          getResisedNoteindexBuffer(),
          noteAccuracy,
          DrawNoteMinAccuracy,
          DrawNoteMethod
        );
        updateNoteIndexBuffer(noteIndex);
        setCurrentNote(randomNote);
        setPracticeState("Listening");
        break;
      case "Listening":
        if (detectedNote && oldNoteTimestamp != newNoteTimestamp) {
          console.log(detectedNote);
          setOldNoteTimestamp(newNoteTimestamp);
          if (
            currentNote?.name == detectedNote?.name &&
            currentNote?.octave == detectedNote?.octave
          ) {
            setIsAnswerCorrect(true);
            setCorrect((correct) => correct + 1);
            updateNoteAccuracy(currentNote, 1);
            setPracticeState("Feedback");
            setTimeout(() => {
              setPracticeState("New Note");
            }, FeedbackDuration);
          } else {
            setIsAnswerCorrect(false);
            setIncorrect((incorrect) => incorrect + 1);
            updateNoteAccuracy(currentNote, 0);
            if (changeNoteOnMistake) {
              setPracticeState("Feedback");
              setTimeout(() => {
                setPracticeState("New Note");
              }, FeedbackDuration);
            } else {
              setPracticeState("Feedback");
              setTimeout(() => {
                setPracticeState("Listening");
              }, FeedbackDuration);
            }
          }
        }
        break;
      case "Feedback":
        break;
    }
  }, [practiceState, newNoteTimestamp, detectedNote]);

  useEffect(() => {
    console.log("Practice state:", practiceState);
  }, [practiceState]);

  useEffect(() => {
    if (countdown === 0 && practiceState === "Countdown") {
      setTimer(timerTime);
      setPracticeState("New Note");
    }
  }, [countdown]);

  useEffect(() => {
    if (timer === 0) {
      setPracticeState("Idle");
    }
  }, [timer]);

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
    console.log("noteIndexRange:", noteIndexRange);
    localStorage.setItem("noteIndexRange", JSON.stringify(noteIndexRange));
  }, [noteIndexRange]);

  useEffect(() => {
    localStorage.setItem("useClock", JSON.stringify(useClock));
  }, [useClock]);

  useEffect(() => {
    localStorage.setItem("timerTime", JSON.stringify(timerTime));
  }, [timerTime]);

  useEffect(() => {
    console.log(`MinPitchRMS: ${MinPitchRMS[micSensitivityIndex]}`);
    localStorage.setItem(
      "micSensitivityIndex",
      JSON.stringify(micSensitivityIndex)
    );
  }, [micSensitivityIndex]);

  useEffect(() => {
    console.log("Current note:", currentNote ? noteToName(currentNote) : null);
  }, [currentNote]);

  useEffect(() => {
    localStorage.setItem("noteAccuracy", JSON.stringify(noteAccuracy));
  }, [noteAccuracy]);

  useEffect(() => {
    localStorage.setItem("noteIndexBuffer", JSON.stringify(noteIndexBuffer));
  }, [noteIndexBuffer]);

  useEffect(() => {
    setPracticeState("Idle");
    stopListening();
    setNoteAccuracy(initializeNoteAccuracy());
    setNoteIndexRange(InstrumentNoteRangeIndex[instrument]);
    localStorage.setItem("instrument", JSON.stringify(instrument));
  }, [instrument]);

  if (isLoading) {
    return (
      <div className="app">
        <Header
          setSettingsOpen={setSettingsOpen}
          setStatisticsOpen={setStatisticsOpen}
        />
        <div className="circular-progress">
          <CircularProgress sx={{ color: "black" }} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="app">
        <Header
          setSettingsOpen={setSettingsOpen}
          setStatisticsOpen={setStatisticsOpen}
        />
        <Note
          imagePath={imagePath}
          currentNote={currentNote}
          practiceState={practiceState}
          showNoteName={showNoteName}
          isAnswerCorrect={isAnswerCorrect}
          instrument={instrument}
        />
        <Clock
          practiceState={practiceState}
          useClock={useClock}
          timer={timer}
          setTimer={setTimer}
          countdown={countdown}
          setCountdown={setCountdown}
        />
        <Score correct={correct} incorrect={incorrect} />
        <Button className="button" variant="contained" onClick={handlePractice}>
          {practiceState == "Idle" ? "Start Practice" : "Stop Practice"}
        </Button>
        <Settings
          open={settingsOpen}
          setOpen={setSettingsOpen}
          instrument={instrument}
          setInstrument={setInstrument}
          showNoteName={showNoteName}
          setShowNoteName={setShowNoteName}
          changeNoteOnMistake={changeNoteOnMistake}
          setChangeNoteOnMistake={setChangeNoteOnMistake}
          useClock={useClock}
          setUseClock={setUseClock}
          noteIndexRange={noteIndexRange}
          setNoteIndexRange={setNoteIndexRange}
          timerTime={timerTime}
          setTimerTime={setTimerTime}
          micSensitivityIndex={micSensitivityIndex}
          setMicSensitivityIndex={setMicSensitivityIndex}
        />
        <Statistics
          open={statisticsOpen}
          setOpen={setStatisticsOpen}
          noteAccuracy={noteAccuracy}
          setNoteAccuracy={setNoteAccuracy}
          instrument={instrument}
        />
      </div>
    );
  }
};

export default App;
