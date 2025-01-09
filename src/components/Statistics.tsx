import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Legend from "./Legend";
import NoteStats from "./NoteStats";
import { initializeNoteAccuracy } from "../utils";

interface StatisticsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  noteAccuracy: Record<string, number | null>;
  setNoteAccuracy: Dispatch<SetStateAction<Record<string, number | null>>>;
  instrument: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 850,
  maxWidth: "100%",
  maxHeight: "100%",
  bgcolor: "background.paper",
  overflow: "auto",
  boxShadow: 24,
};

export default function Statistics({
  open,
  setOpen,
  noteAccuracy,
  setNoteAccuracy,
  instrument,
}: StatisticsProps) {
  const handleClose = () => setOpen(false);

  const resetNoteAccuracy = () => {
    setNoteAccuracy(initializeNoteAccuracy());
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h5" sx={{ color: "black" }}>
            Statistics
          </Typography>
          <NoteStats noteAccuracy={noteAccuracy} instrument={instrument} />
          <Legend />
          <Button
            className="button"
            variant="contained"
            onClick={resetNoteAccuracy}
          >
            Reset
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
