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
  drawEnharmonicNote,
  drawNote,
  getNoteImageFileNames,
  getLocalStorageItem,
  getNote,
  initializeNoteStats,
  noteToName,
  noteToImage,
} from "./utils";
import {
  AlphaEMA,
  AllEnharmonicNames,
  CountdownTime,
  DrawNoteMinAccuracy,
  DrawNoteMethod,
  EnharmonicNamesToNote,
  FeedbackDuration,
  IndexBufferSizeFraction,
  InstrumentNoteRangeIndex,
  InstrumentOctaveShift,
  MaxIndexBufferSize,
  MaxTimeToCorrect,
  MicSensitivityIndex,
  MinPitchRMS,
  NoteIndexes,
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
    getLocalStorageItem("noteAccuracy", initializeNoteStats())
  );
  const [noteTimeToCorrect, setNoteTimeToCorrect] = useState(
    getLocalStorageItem("noteTimeToCorrect", initializeNoteStats())
  );
  const [averageTimeToCorrect, setAverageTimeToCorrect] = useState<
    number | null
  >(null);
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
  const [enharmonicNote, setEnharmonicNote] = useState<NoteType | null>(null);
  const [detectedNote, setDetectedNote] = useState<NoteType | null>(null);
  const [noteIndexBuffer, setNoteIndexBuffer] = useState<number[]>(
    getLocalStorageItem("noteIndexBuffer", [])
  );
  const [selectedNotes, setSelectedNotes] = useState<string[]>(
    getLocalStorageItem("selectedNotes", AllEnharmonicNames)
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
  const timeoutId = useRef<any | null>(null);
  const noteTime = useRef(0);

  const detectPitch = Pitchfinder.AMDF({
    sampleRate: SampleRate,
    minFrequency: 70,
    maxFrequency: 2100,
  });

  const cacheImages = async (): Promise<void> => {
    const promises = getNoteImageFileNames().map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject();
        imageCache.current[src] = img;
      });
    });
    await Promise.all(promises);
    setIsLoading(false);
  };

  const imagePath = useMemo(() => {
    if (["Idle", "Countdown"].includes(practiceState)) {
      return (
        imageCache.current[noteToImage(null, InstrumentOctaveShift[instrument])]
          ?.src || "notes/the_lick.svg"
      );
    } else if (enharmonicNote) {
      return (
        imageCache.current[
          noteToImage(enharmonicNote, InstrumentOctaveShift[instrument])
        ]?.src || ""
      );
    }
    return "";
  }, [practiceState, enharmonicNote]);

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
      setAverageTimeToCorrect(null);
    } else {
      stopListening();
      setPracticeState("Idle");
      clearTimeout(timeoutId.current);
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

  const updateNoteAccuracy = (update: number) => {
    if (currentNote) {
      const noteName = noteToName(currentNote);
      var NewNoteAccuracy = { ...noteAccuracy };
      NewNoteAccuracy[noteName] = NewNoteAccuracy[noteName]
        ? AlphaEMA * update + (1 - AlphaEMA) * NewNoteAccuracy[noteName]
        : update;
      setNoteAccuracy(NewNoteAccuracy);
    }
  };

  const updateNoteTimeToCorrect = (update: number) => {
    if (currentNote) {
      const noteName = noteToName(currentNote);
      var newNoteTimeToCorrect = { ...noteTimeToCorrect };
      newNoteTimeToCorrect[noteName] = newNoteTimeToCorrect[noteName]
        ? AlphaEMA * update + (1 - AlphaEMA) * newNoteTimeToCorrect[noteName]
        : update;
      setNoteTimeToCorrect(newNoteTimeToCorrect);
    }
  };

  const updateAverageTimeToCorrect = (update: number) => {
    if (averageTimeToCorrect === null) {
      setAverageTimeToCorrect(update);
    } else {
      setAverageTimeToCorrect(
        averageTimeToCorrect + (update - averageTimeToCorrect) / correct
      );
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

  const getIncludeIndexes = () => {
    if (selectedNotes) {
      // Get available note indexes
      const availableNoteNames = selectedNotes.map(
        (note) => EnharmonicNamesToNote[note]
      );
      const availableNoteNamesUnique = Array.from(new Set(availableNoteNames));
      let includeIndexes = availableNoteNamesUnique
        .map((note) => NoteIndexes[note])
        .flat();

      // Select indexes within current range
      includeIndexes = includeIndexes.filter(
        (index) => noteIndexRange[0] <= index && index <= noteIndexRange[1]
      );

      // Exclude indexes that have been shown recently
      const currentBufferSize = Math.min(
        MaxIndexBufferSize,
        Math.round(IndexBufferSizeFraction * includeIndexes.length)
      );
      if (currentBufferSize) {
        includeIndexes = includeIndexes.filter(
          (index) => !noteIndexBuffer.slice(-currentBufferSize).includes(index)
        );
      }

      console.log("includeIndexes:", includeIndexes);
      console.log("currentBufferSize:", currentBufferSize);

      return includeIndexes;
    } else {
      return [];
    }
  };

  useEffect(() => {
    cacheImages();
  }, []);

  useEffect(() => {
    switch (practiceState) {
      case "Idle":
        break;
      case "New Note":
        const [randomNote, noteIndex] = drawNote(
          getIncludeIndexes(),
          noteAccuracy,
          noteTimeToCorrect,
          DrawNoteMinAccuracy,
          MaxTimeToCorrect,
          DrawNoteMethod
        );
        const enharmonicNoteName = drawEnharmonicNote(
          randomNote.name,
          selectedNotes
        );
        setEnharmonicNote({
          name: enharmonicNoteName,
          octave: randomNote.octave,
        });
        updateNoteIndexBuffer(noteIndex);
        setCurrentNote(randomNote);
        setPracticeState("Listening");
        noteTime.current = Date.now();
        break;
      case "Listening":
        if (detectedNote && oldNoteTimestamp != newNoteTimestamp) {
          console.log(detectedNote);
          setOldNoteTimestamp(newNoteTimestamp);
          if (
            currentNote?.name == detectedNote?.name &&
            currentNote?.octave == detectedNote?.octave
          ) {
            const noteTimeToCorrect = (Date.now() - noteTime.current) / 1000;
            console.log("Note time:", noteTimeToCorrect);
            updateAverageTimeToCorrect(noteTimeToCorrect);
            updateNoteTimeToCorrect(noteTimeToCorrect);
            setIsAnswerCorrect(true);
            setCorrect((correct) => correct + 1);
            updateNoteAccuracy(1);
            setPracticeState("Feedback");
            timeoutId.current = setTimeout(() => {
              setPracticeState("New Note");
            }, FeedbackDuration);
          } else {
            setIsAnswerCorrect(false);
            setIncorrect((incorrect) => incorrect + 1);
            updateNoteAccuracy(0);
            if (changeNoteOnMistake) {
              setPracticeState("Feedback");
              timeoutId.current = setTimeout(() => {
                setPracticeState("New Note");
              }, FeedbackDuration);
            } else {
              setPracticeState("Feedback");
              timeoutId.current = setTimeout(() => {
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
      stopListening();
      setPracticeState("Idle");
      clearTimeout(timeoutId.current);
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
    console.log(
      "Enharmonic note:",
      enharmonicNote ? noteToName(enharmonicNote) : null
    );
  }, [enharmonicNote]);

  useEffect(() => {
    getIncludeIndexes();
    console.log("Selected notes", selectedNotes);
    localStorage.setItem("selectedNotes", JSON.stringify(selectedNotes));
  }, [selectedNotes]);

  useEffect(() => {
    localStorage.setItem("noteAccuracy", JSON.stringify(noteAccuracy));
  }, [noteAccuracy]);

  useEffect(() => {
    localStorage.setItem(
      "noteTimeToCorrect",
      JSON.stringify(noteTimeToCorrect)
    );
  }, [noteTimeToCorrect]);

  useEffect(() => {
    localStorage.setItem("noteIndexBuffer", JSON.stringify(noteIndexBuffer));
  }, [noteIndexBuffer]);

  useEffect(() => {
    if (settingsOpen) {
      stopListening();
      setPracticeState("Idle");
      clearTimeout(timeoutId.current);
      setNoteAccuracy(initializeNoteStats());
      setNoteIndexRange(InstrumentNoteRangeIndex[instrument]);
      localStorage.setItem("instrument", JSON.stringify(instrument));
    }
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
          currentNote={enharmonicNote}
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
        <Score
          correct={correct}
          incorrect={incorrect}
          averageTimeToCorrect={averageTimeToCorrect}
        />
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
          selectedNotes={selectedNotes}
          setSelectedNotes={setSelectedNotes}
        />
        <Statistics
          open={statisticsOpen}
          setOpen={setStatisticsOpen}
          noteAccuracy={noteAccuracy}
          setNoteAccuracy={setNoteAccuracy}
          noteTimeToCorrect={noteTimeToCorrect}
          setNoteTimeToCorrect={setNoteTimeToCorrect}
          instrument={instrument}
        />
      </div>
    );
  }
};

export default App;
