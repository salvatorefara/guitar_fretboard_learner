import Typography from "@mui/material/Typography";
import { NoteStatsColorMap } from "../constants";

interface LegendProps {
  colorLabels: string[];
  label: string;
}

export default function Legend({ colorLabels, label }: LegendProps) {
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
            <Typography sx={{ color: "black" }}>
              {colorLabels[index]}
            </Typography>
          </div>
        ))}
      </div>
      <Typography sx={{ color: "black" }}>{label}</Typography>
    </div>
  );
}
