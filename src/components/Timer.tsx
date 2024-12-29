import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";

export default function Countdown() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(3);

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
      <p>
        Time left: {`${Math.floor(time / 60)}`.padStart(2, "0")}:
        {`${time % 60}`.padStart(2, "0")}
      </p>
    </div>
  );
}
