import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Modal from "@mui/material/Modal";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  Instruments,
  InstrumentNoteRangeIndex,
  MinNoteRange,
  MinPitchRMS,
  MinSelectedNotes,
  Notes,
  TimerTimes,
} from "../constants";

interface SettingsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  instrument: string;
  setInstrument: Dispatch<SetStateAction<string>>;
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
  selectedNotes: string[];
  setSelectedNotes: Dispatch<SetStateAction<string[]>>;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 380,
  maxWidth: "100%",
  maxHeight: "100%",
  bgcolor: "background.paper",
  overflow: "auto",
  boxShadow: 24,
  p: 4,
};

const settingNameWidth = 170;
const toggleButtonStyle = {
  height: 29,
  width: 29,
  justifyContent: "center",
};

const IOSSlider = styled(Slider)(({ theme }) => ({
  "& .MuiSlider-valueLabel": {
    fontWeight: "normal",
    top: 3,
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
  instrument,
  setInstrument,
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
  selectedNotes,
  setSelectedNotes,
}: SettingsProps) {
  const handleNoteSelection = (
    _: React.MouseEvent<HTMLElement>,
    newSelection: string[]
  ) => {
    if (newSelection.length >= MinSelectedNotes) {
      setSelectedNotes(newSelection);
    }
  };

  const handleClose = () => setOpen(false);

  const getNoteName = (index: number) => {
    return `${Notes[index].name}${Notes[index].octave}`;
  };

  const handleNoteRangeChange = (event: any) => {
    if (event.target) {
      if (event.target.value[1] - event.target.value[0] + 1 >= MinNoteRange) {
        setNoteIndexRange(event.target.value as number[]);
      }
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
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Instrument</Typography>
            </Grid>
            <Grid>
              <TextField
                id="standard-select-currency-native"
                select
                value={instrument}
                onChange={(event) => {
                  setInstrument(event.target.value);
                }}
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                variant="standard"
              >
                {Instruments.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Show note name</Typography>
            </Grid>
            <Grid>
              <Switch
                checked={showNoteName}
                onChange={() => {
                  setShowNoteName(!showNoteName);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>
                Change note on mistake
              </Typography>
            </Grid>
            <Grid>
              <Switch
                checked={changeNoteOnMistake}
                onChange={() => {
                  setChangeNoteOnMistake(!changeNoteOnMistake);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Use timer</Typography>
            </Grid>
            <Grid>
              <Switch
                checked={useClock}
                onChange={() => {
                  setUseClock(!useClock);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Timer</Typography>
            </Grid>
            <Grid>
              <TextField
                id="standard-select-currency-native"
                select
                value={timerTime}
                onChange={(event) => {
                  setTimerTime(Number(event.target.value));
                }}
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
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Note range</Typography>
            </Grid>
            <Grid size={5}>
              <IOSSlider
                getAriaLabel={getNoteName}
                min={InstrumentNoteRangeIndex[instrument][0]}
                max={InstrumentNoteRangeIndex[instrument][1]}
                step={1}
                valueLabelDisplay="on"
                value={noteIndexRange}
                onChange={handleNoteRangeChange}
                getAriaValueText={getNoteName}
                valueLabelFormat={getNoteName}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={3}
            sx={{ alignItems: "center", top: "20px", position: "relative" }}
          >
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>
                Microphone sensitivity
              </Typography>
            </Grid>
            <Grid size={5}>
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
          </Grid>
          <Grid
            container
            sx={{ alignItems: "center", top: "20px", position: "relative" }}
          >
            <Grid sx={{ width: settingNameWidth }}>
              <Typography sx={{ color: "black" }}>Note selector</Typography>
            </Grid>
            <Grid size={10}>
              <ToggleButtonGroup
                size="small"
                value={selectedNotes}
                onChange={handleNoteSelection}
                aria-label="natural-notes"
              >
                <ToggleButton value="C" aria-label="C" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>C</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="D" aria-label="D" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>D</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="E" aria-label="E" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>E</Typography>
                </ToggleButton>
                <ToggleButton value="F" aria-label="F" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>F</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="G" aria-label="G" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>G</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="A" aria-label="A" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>A</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="B" aria-label="B" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>B</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={10}>
              <ToggleButtonGroup
                size="small"
                value={selectedNotes}
                onChange={handleNoteSelection}
                aria-label="sharp-notes"
              >
                <ToggleButton value="B#" aria-label="B#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>B♯</Typography>
                </ToggleButton>
                <ToggleButton value="C#" aria-label="C#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>C♯</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="D#" aria-label="D#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>D♯</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="E#" aria-label="E#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>E♯</Typography>
                </ToggleButton>
                <ToggleButton value="F#" aria-label="F#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>F♯</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="G#" aria-label="G#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>G♯</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="A#" aria-label="A#" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>A♯</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid size={10}>
              <ToggleButtonGroup
                size="small"
                value={selectedNotes}
                onChange={handleNoteSelection}
                aria-label="flat-notes"
              >
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="Db" aria-label="Db" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>D♭</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="Eb" aria-label="Eb" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>E♭</Typography>
                </ToggleButton>
                <ToggleButton value="Fb" aria-label="Fb" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>F♭</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="Gb" aria-label="Gb" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>G♭</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="Ab" aria-label="Ab" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>A♭</Typography>
                </ToggleButton>
                <ToggleButton value="-" disabled sx={toggleButtonStyle}>
                  {"-"}
                </ToggleButton>
                <ToggleButton value="Bb" aria-label="Bb" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>B♭</Typography>
                </ToggleButton>
                <ToggleButton value="Cb" aria-label="Cb" sx={toggleButtonStyle}>
                  <Typography sx={{ color: "black" }}>C♭</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}
