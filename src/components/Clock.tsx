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
    return <div className="clock"></div>;
  } else if (practiceState === "Countdown") {
    return (
      <div className="clock">
        <Countdown time={countdown} setTime={setCountdown} />
      </div>
    );
  } else {
    return (
      <div className="clock">
        <Timer time={timer} setTime={setTimer} />
      </div>
    );
  }
}
