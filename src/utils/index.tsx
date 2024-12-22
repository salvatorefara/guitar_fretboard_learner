import { C0, NoteNames } from "../constants";
import { Note } from "../types";

export function getNote(pitch: number | null): Note | null {
  if (pitch == null) {
    return null;
  }
  const semitone = Math.round(12 * Math.log2(pitch / C0));
  const octave = Math.floor(semitone / 12);
  const noteName = NoteNames[semitone % 12];
  return { name: noteName, octave: octave };
}

export function noteToImage(note: Note | null): string {
  return note
    ? `notes/${note.name.replace("#", "s").toLowerCase()}${note.octave}.svg`
    : "notes/the_lick.svg";
}

export const calculateRMS = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
};
