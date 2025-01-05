import Typography from "@mui/material/Typography";
import { Note as NoteType } from "../types";
import { noteToImage } from "../utils";

interface NoteProps {
  imagePath: string;
  currentNote: NoteType | null;
  practiceState: string;
  showNoteName: boolean;
}

export default function Note({
  imagePath,
  currentNote,
  practiceState,
  showNoteName,
}: NoteProps) {
  return (
    <div className="note">
      <img
        className="note-image"
        src={imagePath}
        alt={noteToImage(currentNote)}
      />
      <Typography variant="h2" sx={{ color: "black" }}>
        {["Idle", "Countdown"].includes(practiceState) || !showNoteName
          ? ""
          : currentNote?.name}
      </Typography>
    </div>
  );
}
