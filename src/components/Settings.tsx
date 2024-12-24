import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Notes } from "../constants";

interface SettingsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showNoteName: boolean;
  setShowNoteName: Dispatch<SetStateAction<boolean>>;
  changeNoteOnMistake: boolean;
  setChangeNoteOnMistake: Dispatch<SetStateAction<boolean>>;
  minNoteIndex: number;
  setMinNoteIndex: Dispatch<SetStateAction<number>>;
  maxNoteIndex: number;
  setMaxNoteIndex: Dispatch<SetStateAction<number>>;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function Settings({
  open,
  setOpen,
  showNoteName,
  setShowNoteName,
  changeNoteOnMistake,
  setChangeNoteOnMistake,
  minNoteIndex,
  setMinNoteIndex,
  maxNoteIndex,
  setMaxNoteIndex,
}: SettingsProps) {
  const handleClose = () => setOpen(false);

  const getNoteName = (index: number) => {
    return `${Notes[index].name}${Notes[index].octave}`;
  };

  const value = [minNoteIndex, maxNoteIndex];

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant="h5">Settings</Typography>
          <FormControlLabel
            label="Show note name"
            control={
              <Switch
                checked={showNoteName}
                onChange={() => {
                  setShowNoteName(!showNoteName);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
          />
          <FormControlLabel
            label="Change note on mistake"
            control={
              <Switch
                checked={changeNoteOnMistake}
                onChange={() => {
                  setChangeNoteOnMistake(!changeNoteOnMistake);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
          />
          <Typography> Note range</Typography>
          <Slider
            getAriaLabel={getNoteName}
            min={0}
            max={Notes.length - 1}
            step={1}
            marks
            valueLabelDisplay="on"
            value={value}
            // onChange={handleChange}
            // valueLabelDisplay="auto"
            getAriaValueText={getNoteName}
            valueLabelFormat={getNoteName}
          />
        </Box>
      </Modal>
    </div>
  );
}
