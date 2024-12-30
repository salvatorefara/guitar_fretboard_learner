import { C0, NoteNames, Notes, NoteStatsColorMap } from "../constants";
import { Note } from "../types";

export function getLocalStorageItem<T>(itemName: string, defaultValue: T): T {
  const itemValue = localStorage.getItem(itemName);
  return itemValue ? JSON.parse(itemValue) : defaultValue;
}

export function getNote(pitch: number | null): Note | null {
  if (pitch == null) {
    return null;
  }
  const semitone = Math.round(12 * Math.log2(pitch / C0));
  const octave = Math.floor(semitone / 12);
  const noteName = NoteNames[semitone % 12];
  return { name: noteName, octave: octave };
}

export function drawNote(noteIndexRange: number[]): Note {
  const noteIndex = Math.round(
    noteIndexRange[0] + Math.random() * (noteIndexRange[1] - noteIndexRange[0])
  );
  return Notes[noteIndex];
}

export function noteToImage(note: Note | null): string {
  const transpose = 1; // Transpose octave for guitar
  return note
    ? `notes/${note.name.replace("#", "s").toLowerCase()}${
        note.octave + transpose
      }.svg`
    : "notes/the_lick.svg";
}

export const calculateRMS = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};

export function getColor(value: number | null): string {
  if (value === null) {
    return "#000000";
  }
  if (value < 0 || value > 1) {
    throw new Error("Value must be between 0 and 1");
  }

  const index = Math.floor(value * (NoteStatsColorMap.length - 1));
  return NoteStatsColorMap[index];
}
