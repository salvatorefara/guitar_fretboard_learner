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
      <div className="note-image-feedback">
        <div></div>
        <img
          className="note-image"
          src={imagePath}
          alt={noteToImage(currentNote)}
        />
        <div className="note-feedback">
          <Typography variant="h3" sx={{ color: "black" }}>
            +1
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
