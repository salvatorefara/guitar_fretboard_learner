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

export function drawNote(
  noteIndexRange: number[],
  excludeIndexes: number[] = [],
  accuracies: Record<string, number> = {},
  minAccuracy: number = 0.1,
  method: "random" | "accuracy-based" = "random"
): Note {
  switch (method) {
    case "random":
      const noteIndex = Math.round(
        noteIndexRange[0] +
          Math.random() * (noteIndexRange[1] - noteIndexRange[0])
      );
      return Notes[noteIndex];
    case "accuracy-based":
      const notes = Notes.filter((_, index) => {
        noteIndexRange[0] <= index &&
          index <= noteIndexRange[1] &&
          !excludeIndexes.includes(index);
      });
      const indexes = notes.map((_, index) => {
        return index;
      });
      const weights = notes.map((note, _) => {
        const noteName = noteToName(note);
        let accuracy = accuracies[noteName];
        accuracy = accuracy ? Math.max(accuracy, minAccuracy) : minAccuracy;
        return 1 / accuracy;
      });
      const weightsSum = weights.reduce((sum, w) => sum + w, 0);
      const probabilities = weights.map((w) => w / weightsSum);
      const cumulativeDistribution: number[] = [];
      probabilities.reduce((sum, p, index) => {
        cumulativeDistribution[index] = sum + p;
        return sum + p;
      }, 0);

      const selectIndex = cumulativeDistribution.findIndex(
        (cumulativeProb) => Math.random() < cumulativeProb
      );

      return Notes[indexes[selectIndex]];
  }
}

export function noteToName(note: Note, transpose: number = 1): string {
  return `${note.name.replace("#", "s").toLowerCase()}${
    note.octave + transpose
  }`;
}

export function nameToNote(noteString: string, transpose: number = 1): Note {
  const name = noteString.slice(0, -1).replace("s", "#").toUpperCase();
  const octave = Number(noteString.slice(-1)) - transpose;
  return { name: name, octave: octave };
}

export function noteToImage(note: Note | null): string {
  return note ? `notes/${noteToName(note)}.svg` : "notes/the_lick.svg";
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
