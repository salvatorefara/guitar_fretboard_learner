import { Dispatch, SetStateAction } from "react";
import Countdown from "./Countdown";
import Timer from "./Timer";

interface ClockProps {
  practiceState: string;
  useClock: boolean;
  timer: number;
  setTimer: Dispatch<SetStateAction<number>>;
  countdown: number;
  setCountdown: Dispatch<SetStateAction<number>>;
}

export default function Clock({
  practiceState,
  useClock,
  timer,
  setTimer,
  countdown,
  setCountdown,
}: ClockProps) {
  if (practiceState === "Idle" || !useClock) {
    return <div></div>;
  } else if (practiceState === "Countdown") {
    return <Countdown time={countdown} setTime={setCountdown} />;
  } else {
    return <Timer time={timer} setTime={setTimer} />;
  }
}
