import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

interface ScoreProps {
  correct: number;
  incorrect: number;
}

export default function Score({ correct, incorrect }: ScoreProps) {
  const accuracy = Math.round((100 * correct) / (correct + incorrect));
  return (
    <div className="score">
      <Card variant="outlined">
        <CardHeader title="Correct" />
        <CardContent>
          <Typography variant="h3">{correct}</Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader title="Incorrect" />
        <CardContent>
          <Typography variant="h3">{incorrect}</Typography>
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardHeader title="Accuracy" />
        <CardContent>
          <Typography variant="h3">
            {isNaN(accuracy) ? "0%" : accuracy + "%"}
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
