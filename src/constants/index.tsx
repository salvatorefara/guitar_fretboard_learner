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
export const AudioBufferSize = 4096;

export const minPitchRMS = 0.02;
export const minPitchRMSDiff = 0.03;
