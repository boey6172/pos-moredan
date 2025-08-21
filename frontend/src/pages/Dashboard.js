import React, { useState, useEffect } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";

export default function Dashboard() {
  const [cash, setCash] = useState("");
  const [startingCash, setStartingCash] = useState(null);

  useEffect(() => {
    // Check localStorage for saved cash with date
    const savedData = JSON.parse(localStorage.getItem("startingCashData"));
    const today = new Date().toDateString();

    if (savedData && savedData.date === today) {
      setStartingCash(savedData.cash);
    }
  }, []);

  const handleSave = () => {
    const today = new Date().toDateString();
    localStorage.setItem(
      "startingCashData",
      JSON.stringify({ cash, date: today })
    );
    setStartingCash(cash);
  };

  return (
    <Card sx={{ p: 1, maxWidth: 400, m: "20px auto" }}>
      <CardContent>
        {startingCash ? (
          <Typography variant="h6">
            ✅ Starting Cash for today: ₱{startingCash}
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Enter Starting Cash
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="Starting Cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSave}
              disabled={!cash}
            >
              Save
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
