import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { MinPitchRMS, Notes, TimerTimes } from "../constants";

interface SettingsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showNoteName: boolean;
  setShowNoteName: Dispatch<SetStateAction<boolean>>;
  changeNoteOnMistake: boolean;
  setChangeNoteOnMistake: Dispatch<SetStateAction<boolean>>;
  useClock: boolean;
  setUseClock: Dispatch<SetStateAction<boolean>>;
  noteIndexRange: number[];
  setNoteIndexRange: Dispatch<SetStateAction<number[]>>;
  timerTime: number;
  setTimerTime: Dispatch<SetStateAction<number>>;
  micSensitivityIndex: number;
  setMicSensitivityIndex: Dispatch<SetStateAction<number>>;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
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
  useClock,
  setUseClock,
  noteIndexRange,
  setNoteIndexRange,
  timerTime,
  setTimerTime,
  micSensitivityIndex,
  setMicSensitivityIndex,
}: SettingsProps) {
  const handleClose = () => setOpen(false);

  const getNoteName = (index: number) => {
    return `${Notes[index].name}${Notes[index].octave}`;
  };

  const handleNoteRangeChange = (event: any) => {
    if (event.target) {
      setNoteIndexRange(event.target.value as number[]);
    }
  };

  const handleMicSensitivityChange = (event: any) => {
    if (event.target) {
      setMicSensitivityIndex(event.target.value as number);
    }
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
            Settings
          </Typography>
          <FormControlLabel
            label="Show note name"
            sx={{ color: "black" }}
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
            sx={{ color: "black" }}
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
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid>
              <FormControlLabel
                label="Use timer"
                sx={{ color: "black" }}
                control={
                  <Switch
                    checked={useClock}
                    onChange={() => {
                      setUseClock(!useClock);
                    }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
              />
            </Grid>
            <Grid>
              <TextField
                id="standard-select-currency-native"
                select
                value={timerTime}
                onChange={(event) => {
                  setTimerTime(Number(event.target.value));
                }}
                defaultValue="EUR"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                variant="standard"
              >
                {TimerTimes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            sx={{ alignItems: "center", top: "20px", position: "relative" }}
          >
            <Grid size={6}>
              <IOSSlider
                getAriaLabel={getNoteName}
                min={0}
                max={Notes.length - 1}
                step={1}
                valueLabelDisplay="on"
                value={noteIndexRange}
                onChange={handleNoteRangeChange}
                getAriaValueText={getNoteName}
                valueLabelFormat={getNoteName}
              />
            </Grid>
            <Grid>
              <Typography sx={{ color: "black" }}>Note range</Typography>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            sx={{ alignItems: "center", top: "20px", position: "relative" }}
          >
            <Grid size={6}>
              <IOSSlider
                getAriaLabel={getNoteName}
                min={0}
                max={MinPitchRMS.length - 1}
                step={1}
                valueLabelDisplay="off"
                value={micSensitivityIndex}
                onChange={handleMicSensitivityChange}
              />
            </Grid>
            <Grid>
              <Typography sx={{ color: "black" }}>
                Microphone sensitivity
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
