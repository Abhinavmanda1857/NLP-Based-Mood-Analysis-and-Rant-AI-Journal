import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to communicate with the ML model system
app.post("/api/journal", async (req, res) => {
  const { text } = req.body;

  try {
    // Forwarding the request to the ML model's correct endpoint
    const response = await axios.post("http://192.168.177.113:5000/rant", {
      prompt: text, // Match the expected input format of the ML model
    });

    // Forward the ML model response back to React frontend
    res.json({ result: response.data.response });
  } catch (error) {
    console.error("Error communicating with ML model:", error.message);
    res.status(500).json({ error: "Failed to connect to ML model" });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
