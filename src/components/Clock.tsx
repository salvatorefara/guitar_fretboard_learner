import { Dispatch, SetStateAction } from "react";
import Countdown from "./Countdown";
import Timer from "./Timer";

interface ClockProps {
  practiceState: string;
  timer: number;
  setTimer: Dispatch<SetStateAction<number>>;
  countdown: number;
  setCountdown: Dispatch<SetStateAction<number>>;
}

export default function Clock({
  practiceState,
  timer,
  setTimer,
  countdown,
  setCountdown,
}: ClockProps) {
  switch (practiceState) {
    case "Idle":
      return <div></div>;
    case "Countdown":
      return <Countdown time={countdown} setTime={setCountdown} />;
    default:
      return <Timer time={timer} setTime={setTimer} />;
  }
}
