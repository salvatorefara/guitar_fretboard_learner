import { Dispatch, SetStateAction } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

interface HeaderProps {
  setSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setStatisticsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Header({
  setSettingsOpen,
  setStatisticsOpen,
}: HeaderProps) {
  return (
    <Box sx={{ flexGrow: 1, zIndex: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            onClick={() => {
              setSettingsOpen(true);
            }}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <SettingsIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setStatisticsOpen(true);
            }}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <QueryStatsIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Guitar Fretboard Learner
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
