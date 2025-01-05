import Typography from "@mui/material/Typography";
import { Note as NoteType } from "../types";
import { NoteStatsColorMap } from "../constants";
import { noteToImage } from "../utils";

interface NoteProps {
  imagePath: string;
  currentNote: NoteType | null;
  practiceState: string;
  showNoteName: boolean;
  isAnswerCorrect: boolean;
}

export default function Note({
  imagePath,
  currentNote,
  practiceState,
  showNoteName,
  isAnswerCorrect,
}: NoteProps) {
  const feedbackColor = isAnswerCorrect
    ? NoteStatsColorMap.slice(-1)
    : NoteStatsColorMap[0];
  const feedbackValue = isAnswerCorrect ? "+1" : "-1";

  return (
    <div className="note">
      <div className="note-image-feedback">
        <div></div>
        <img
          className="note-image"
          src={imagePath}
          alt={noteToImage(currentNote)}
        />
        <div className="note-feedback">
          <Typography variant="h3" sx={{ color: feedbackColor }}>
            {practiceState === "Feedback" ? feedbackValue : ""}
          </Typography>
        </div>
      </div>
      <Typography variant="h2" sx={{ color: "black" }}>
        {["Idle", "Countdown"].includes(practiceState) || !showNoteName
          ? ""
          : currentNote?.name}
      </Typography>
    </div>
  );
}
