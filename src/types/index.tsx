export type Note = {
  name: string;
  octave: number;
};

export type PracticeState =
  | "Idle"
  | "New Note"
  | "Listening"
  | "Feedback"
  | "Countdown";
