import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Legend from "./Legend";
import NoteStats from "./NoteStats";
import { MaxTimeToCorrectStats, NoteStatsColorMap } from "../constants";
import { initializeNoteStats, getLocalStorageItem } from "../utils";

interface StatisticsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  noteAccuracy: Record<string, number | null>;
  setNoteAccuracy: Dispatch<SetStateAction<Record<string, number | null>>>;
  noteTimeToCorrect: Record<string, number | null>;
  setNoteTimeToCorrect: Dispatch<SetStateAction<Record<string, number | null>>>;
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
  p: 4,
};

export default function Statistics({
  open,
  setOpen,
  noteAccuracy,
  setNoteAccuracy,
  noteTimeToCorrect,
  setNoteTimeToCorrect,
  instrument,
}: StatisticsProps) {
  const [statistic, setStatistic] = useState<string>(
    getLocalStorageItem("statistic", "Accuracy")
  );

  const handleClose = () => setOpen(false);

  const resetNoteStats = () => {
    if (statistic === "Accuracy") {
      setNoteAccuracy(initializeNoteStats());
    } else {
      setNoteTimeToCorrect(initializeNoteStats());
    }
  };

  let colorLabels, label, noteStats;

  if (statistic === "Accuracy") {
    colorLabels = NoteStatsColorMap.map((_, index) =>
      ((100 * index) / (NoteStatsColorMap.length - 1)).toFixed(0)
    );
    label = "Accuracy (%)";
    noteStats = noteAccuracy;
  } else {
    const nSteps = NoteStatsColorMap.length;
    const stepSize = MaxTimeToCorrectStats / (nSteps - 1);
    colorLabels = Array.from({ length: nSteps }, (_, i) =>
      (MaxTimeToCorrectStats - i * stepSize).toFixed(1)
    );
    label = "Time to correct note (sec)";
    noteStats = Object.fromEntries(
      Object.entries(noteTimeToCorrect).map(([key, value]) => [
        key,
        value
          ? 1 - Math.min(value, MaxTimeToCorrectStats) / MaxTimeToCorrectStats
          : value,
      ])
    );
  }

  useEffect(() => {
    localStorage.setItem("statistic", JSON.stringify(statistic));
  }, [statistic]);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h5" sx={{ color: "black", mb: 1 }}>
            Statistics
          </Typography>
          <TextField
            id="standard-select-currency-native"
            select
            value={statistic}
            onChange={(event) => {
              setStatistic(event.target.value);
            }}
            slotProps={{
              select: {
                native: true,
              },
            }}
            variant="standard"
          >
            <option value={"Accuracy"}>Accuracy</option>
            <option value={"Time to correct note"}>Time to correct note</option>
          </TextField>
          <NoteStats noteStats={noteStats} instrument={instrument} />
          <Legend colorLabels={colorLabels} label={label} />
          <Button
            className="button"
            variant="contained"
            onClick={resetNoteStats}
            sx={{ mb: 4 }}
          >
            Reset
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
