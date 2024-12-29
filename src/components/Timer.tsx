import { useEffect, Dispatch, SetStateAction } from "react";
import Typography from "@mui/material/Typography";

interface TimerProps {
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
}

export default function Timer({ time, setTime }: TimerProps) {
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography variant="h2" sx={{ color: "black" }}>
      {`${Math.floor(time / 60)}`.padStart(2, "0")}:
      {`${time % 60}`.padStart(2, "0")}
    </Typography>
  );
}
