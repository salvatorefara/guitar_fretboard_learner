import { useEffect, Dispatch, SetStateAction } from "react";
import Typography from "@mui/material/Typography";

interface CountdownProps {
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
}

export default function Countdown({ time, setTime }: CountdownProps) {
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
    <div className="countdown">
      <Typography variant="h2">{time}</Typography>
    </div>
  );
}
