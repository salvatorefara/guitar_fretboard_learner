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

export const Notes: Note[] = [
  { name: "E", octave: 2 },
  { name: "F", octave: 2 },
  { name: "F#", octave: 2 },
  { name: "G", octave: 2 },
  { name: "G#", octave: 2 },
  { name: "A", octave: 2 },
  { name: "A#", octave: 2 },
  { name: "B", octave: 2 },
  { name: "C", octave: 3 },
  { name: "C#", octave: 3 },
  { name: "D", octave: 3 },
  { name: "D#", octave: 3 },
  { name: "E", octave: 3 },
  { name: "F", octave: 3 },
  { name: "F#", octave: 3 },
  { name: "G", octave: 3 },
  { name: "G#", octave: 3 },
  { name: "A", octave: 3 },
  { name: "A#", octave: 3 },
  { name: "B", octave: 3 },
  { name: "C", octave: 4 },
  { name: "C#", octave: 4 },
  { name: "D", octave: 4 },
  { name: "D#", octave: 4 },
  { name: "E", octave: 4 },
  { name: "F", octave: 4 },
  { name: "F#", octave: 4 },
  { name: "G", octave: 4 },
  { name: "G#", octave: 4 },
  { name: "A", octave: 4 },
  { name: "A#", octave: 4 },
  { name: "B", octave: 4 },
  { name: "C", octave: 5 },
  { name: "C#", octave: 5 },
  { name: "D", octave: 5 },
  { name: "D#", octave: 5 },
  { name: "E", octave: 5 },
  { name: "F", octave: 5 },
  { name: "F#", octave: 5 },
  { name: "G", octave: 5 },
  { name: "G#", octave: 5 },
  { name: "A", octave: 5 },
  { name: "A#", octave: 5 },
  { name: "B", octave: 5 },
  { name: "C", octave: 6 },
];

export const SampleRate = 44100;
export const AudioBufferSize = 8192;

export const MicSensitivityIndex = 4;
export const MinPitchRMS = [
  0.04, 0.035, 0.03, 0.025, 0.02, 0.015, 0.01, 0.005, 0,
];

export const CountdownTime = 3;
export const TimerTime = 180;
export const TimerTimes = [
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

export const DrawNoteMethod = "accuracy-based";
export const DrawNoteMinAccuracy = 0.1;

export const MaxIndexBufferSize = 10;
export const IndexBufferSizeFraction = 0.2;

export const MinNoteRange = 12;

export const FeedbackDuration = 600;
