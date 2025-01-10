import Typography from "@mui/material/Typography";
import { NoteStatsColorMap } from "../constants";

interface LegendProps {
  labels: string[];
}

export default function Legend({ labels }: LegendProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {NoteStatsColorMap.map((color, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: color,
                marginBottom: "5px",
              }}
            />
            <Typography sx={{ color: "black" }}>{labels[index]}</Typography>
          </div>
        ))}
      </div>
      <Typography sx={{ color: "black" }}>Accuracy (%)</Typography>
    </div>
  );
}
