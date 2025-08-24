import React, { useState, useEffect } from "react";
import { TextField, Button, Card, CardContent, Typography } from "@mui/material";
import axios from '../api/axios';

export default function Dashboard() {
  const [cash, setCash] = useState(null);
  const [startingCash, setStartingCash] = useState(null);

 
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

    const savedData = JSON.parse(localStorage.getItem("startingCashData"));
    if (savedData && savedData.date === today) {
      setStartingCash(savedData.cash);
    } else {
 
      

      axios
        .get("/api/startingcash", {
          params: { date: today }, // send date as query param
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          if (res.data && res.data.length >= 1) {
            console.log("Starting Cash from API:", res.data[0].starting);
            setStartingCash(res.data[0].starting);
          }else {
            console.log("No starting cash found for today");
          }
        })
        .catch((err) => console.error("Error fetching starting cash:", err));
    }
  }, []);

  const handleSave = () => {
    const today = new Date().toDateString();
  
    axios
      .post(
        "/api/startingcash",
        { starting: cash }, // body
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setStartingCash(cash);
  
        // also update localStorage
        localStorage.setItem(
          "startingCashData",
          JSON.stringify({ cash, date: today })
        );
      })
      .catch((err) => console.error("Error saving starting cash:", err));
  };
  
  return (
    <Card sx={{ p: 1, maxWidth: 400, m: "20px auto" }}>
      <CardContent>
        {startingCash  ? (
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
