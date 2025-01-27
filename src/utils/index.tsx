import {
  C0,
  EnharmonicNames,
  NoteNames,
  Notes,
  NoteStatsColorMap,
} from "../constants";
import { Note } from "../types";

export function getNoteImageFileNames(): string[] {
  const folderContent = import.meta.glob("/public/notes/*.svg");
  const fileNames = Object.keys(folderContent).map((filePath) =>
    filePath.replace("/public/", "")
  );
  console.log("Note image file names:", fileNames);
  return fileNames;
}

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

export function drawEnharmonicNote(
  key: string,
  selectedNotes: string[]
): string {
  const names = EnharmonicNames[key].filter((note) =>
    selectedNotes.includes(note)
  );
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex];
}

export function drawNote(
  includeIndexes: number[] = [],
  accuracies: Record<string, number> = {},
  times: Record<string, number> = {},
  minAccuracy: number = 0.1,
  maxTime: number = 10,
  method: "accuracy-based" | "time-based"
): [Note, number] {
  const notesSelected = Notes.filter((_, index) =>
    includeIndexes.includes(index)
  );
  const weights =
    method === "accuracy-based"
      ? notesSelected.map((note, _) => {
          const noteName = noteToName(note);
          let accuracy = accuracies[noteName];
          accuracy = accuracy ? Math.max(accuracy, minAccuracy) : minAccuracy;
          return 1 / accuracy;
        })
      : notesSelected.map((note, _) => {
          const noteName = noteToName(note);
          const timeToCorrect = times[noteName];
          return timeToCorrect ? Math.min(timeToCorrect, maxTime) : maxTime;
        });

  const weightsSum = weights.reduce((sum, w) => sum + w, 0);
  const probabilities = weights.map((w) => w / weightsSum);
  const cumulativeDistribution: number[] = [];
  probabilities.reduce((sum, p, index) => {
    cumulativeDistribution[index] = sum + p;
    return sum + p;
  }, 0);

  const randomValue = Math.random();
  const selectIndex = cumulativeDistribution.findIndex(
    (cumulativeProb) => randomValue < cumulativeProb
  );

  return [Notes[includeIndexes[selectIndex]], includeIndexes[selectIndex]];
}

export function noteToName(note: Note): string {
  return `${note.name.replace("#", "s").toLowerCase()}${note.octave}`;
}

export function transpose(noteName: string, shift: number): string {
  const namePrefix = noteName.slice(0, -1);
  const octave = Number(noteName.slice(-1));
  return `${namePrefix}${shift + octave}`;
}

export function noteToImage(note: Note | null, shift: number = 0): string {
  return note
    ? `notes/${transpose(noteToName(note), shift)}.svg`
    : "notes/the_lick.svg";
}

export function initializeNoteStats() {
  return Notes.reduce((acc: any, note) => {
    acc[noteToName(note)] = null;
    return acc;
  }, {});
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
