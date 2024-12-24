import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Modal from "@mui/material/Modal";

interface SettingsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  showNoteName: boolean;
  setShowNoteName: Dispatch<SetStateAction<boolean>>;
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
}: SettingsProps) {
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
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
        </Box>
      </Modal>
    </div>
  );
}
