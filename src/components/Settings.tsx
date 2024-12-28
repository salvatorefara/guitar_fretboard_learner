import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
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
  noteIndexRange: number[];
  setNoteIndexRange: Dispatch<SetStateAction<number[]>>;
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

const IOSSlider = styled(Slider)(({ theme }) => ({
  "& .MuiSlider-valueLabel": {
    fontWeight: "normal",
    top: -6,
    backgroundColor: "unset",
    color: theme.palette.text.primary,
    "&::before": {
      display: "none",
    },
    "& *": {
      background: "transparent",
      color: "#000",
      ...theme.applyStyles("dark", {
        color: "#fff",
      }),
    },
  },
  "& .MuiSlider-track": {
    border: "none",
    height: 5,
  },
  "& .MuiSlider-rail": {
    opacity: 0.5,
    boxShadow: "inset 0px 0px 4px -2px #000",
    backgroundColor: "#d0d0d0",
  },
  ...theme.applyStyles("dark", {
    color: "#0a84ff",
  }),
}));

export default function Settings({
  open,
  setOpen,
  showNoteName,
  setShowNoteName,
  changeNoteOnMistake,
  setChangeNoteOnMistake,
  noteIndexRange,
  setNoteIndexRange,
}: SettingsProps) {
  const handleClose = () => setOpen(false);

  const getNoteName = (index: number) => {
    return `${Notes[index].name}${Notes[index].octave}`;
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    console.log(event);
    setNoteIndexRange(newValue as number[]);
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
          <Grid
            container
            spacing={3}
            sx={{ alignItems: "center", top: "20px", position: "relative" }}
          >
            <Grid size={9}>
              <IOSSlider
                getAriaLabel={getNoteName}
                min={0}
                max={Notes.length - 1}
                step={1}
                marks
                valueLabelDisplay="on"
                value={noteIndexRange}
                onChange={handleSliderChange}
                getAriaValueText={getNoteName}
                valueLabelFormat={getNoteName}
              />
            </Grid>
            <Grid>
              <Typography> Note range</Typography>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
