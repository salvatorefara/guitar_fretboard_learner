import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

interface ScoreProps {
  correct: number;
  incorrect: number;
  averageTimeToCorrect: number | null;
}

export default function Score({
  correct,
  incorrect,
  averageTimeToCorrect,
}: ScoreProps) {
  const accuracy = Math.round((100 * correct) / (correct + incorrect));
  return (
    <div className="score">
      <Card variant="outlined">
        <CardHeader titleTypographyProps={{ variant: "h6" }} title="Correct" />
        <CardContent>
          <Typography variant="h5">{correct}</Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader
          titleTypographyProps={{ variant: "h6" }}
          title="Incorrect"
        />
        <CardContent>
          <Typography variant="h5">{incorrect}</Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader titleTypographyProps={{ variant: "h6" }} title="Accuracy" />
        <CardContent>
          <Typography variant="h5">
            {isNaN(accuracy) ? "0%" : accuracy + "%"}
          </Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader titleTypographyProps={{ variant: "h6" }} title="Time" />
        <CardContent>
          <Typography variant="h5">
            {averageTimeToCorrect === null
              ? "sec"
              : averageTimeToCorrect.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
