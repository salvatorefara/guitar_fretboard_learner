import { Note } from "../types";

export const C0 = 16.35;

export const NoteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const Octaves = Array.from({ length: 9 }, (_, i) => i);

export const Notes: Note[] = Octaves.flatMap((octave) =>
  NoteNames.map((name) => ({ name, octave }))
).slice(0, -11); // Range from C0 to C8

export const MinNoteImageIndex = 40; // E3
export const MaxNoteImageIndex = 84; // C7

export const SampleRate = 44100;

export const MicSensitivityIndex = 4;
export const MinPitchRMS = [
  0.04, 0.035, 0.03, 0.025, 0.02, 0.015, 0.01, 0.005, 0,
];

export const CountdownTime = 3;
export const TimerTime = 180;
export const TimerTimes = [
  // {
  //   value: 1,
  //   label: "1 second",
  // },
  {
    value: 60,
    label: "1 minute",
  },
  {
    value: 120,
    label: "2 minutes",
  },
  {
    value: 180,
    label: "3 minutes",
  },
  {
    value: 240,
    label: "4 minutes",
  },
  {
    value: 300,
    label: "5 minutes",
  },
];

export const Instruments = [
  {
    value: "guitar",
    label: "guitar",
  },
  {
    value: "piano",
    label: "piano",
  },
];

export const InstrumentOctaveShift: { [key: string]: number } = {
  guitar: 1,
  piano: 0,
};

export const InstrumentNoteRangeIndex: { [key: string]: number[] } = {
  guitar: [28, 72], // E2 - C6
  piano: [40, 84], // E3 - C7
};

export const NoteStatsColorMap = [
  "#8e0152",
  "#c51b7d",
  "#de77ae",
  "#f1b6da",
  "#fde0ef",
  "#e6f5d0",
  "#b8e186",
  "#7fbc41",
  "#4d9221",
  "#276419",
];

const HalfLifeEMA = 5;
export const AlphaEMA = 1 - Math.exp(Math.log(0.5) / HalfLifeEMA);

export const DrawNoteMethod = "time-based";
export const DrawNoteMinAccuracy = 0.1;
export const MaxTimeToCorrect = 10;

export const MaxTimeToCorrectStats = 2;

export const MaxIndexBufferSize = 10;
export const IndexBufferSizeFraction = 0.2;

export const MinNoteRange = 12;

export const FeedbackDuration = 600;
