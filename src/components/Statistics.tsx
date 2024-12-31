import { Dispatch, SetStateAction } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Legend from "./Legend";
import NoteStats from "./NoteStats";

interface StatisticsProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
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

export default function Statistics({ open, setOpen }: StatisticsProps) {
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
          <Typography variant="h5" sx={{ color: "black" }}>
            Statistics
          </Typography>
          <NoteStats />
          <Legend />
        </Box>
      </Modal>
    </div>
  );
}
