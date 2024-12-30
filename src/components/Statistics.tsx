import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Legend from "./Legend";
import NoteStats from "./NoteStats";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 850,
  maxWidth: "100%",
  bgcolor: "background.paper",
  overflow: "auto",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
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
