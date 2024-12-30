import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import NoteStats from "./NoteStats";
// import NoteStats from "../assets/note_stats.svg?react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 380,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export default function Statistics() {
  return (
    <div>
      <Modal
        open={true}
        // onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <NoteStats />
        </Box>
      </Modal>
    </div>
  );
}
