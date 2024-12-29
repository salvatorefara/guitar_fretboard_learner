import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Countdown from "./Countdown";
import Typography from "@mui/material/Typography";

interface TimerProps {
  practiceState: string;
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
  countdown: number;
  setCountdown: Dispatch<SetStateAction<number>>;
}

export default function Timer({
  practiceState,
  time,
  setTime,
  countdown,
  setCountdown,
}: TimerProps) {
  switch (practiceState) {
    case "Idle":
      return <div></div>;
    case "Countdown":
      return <Countdown time={countdown} setTime={setCountdown} />;
    default:
      return <div></div>;
  }
}
