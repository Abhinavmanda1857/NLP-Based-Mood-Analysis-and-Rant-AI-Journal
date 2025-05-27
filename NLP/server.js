const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg"); // PostgreSQL client
const bcrypt = require("bcrypt"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For generating JWT tokens

const app = express();
const PORT = 5001;
const SECRET_KEY = "your_secret_key"; // Replace with a secure key for JWT signing

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL Database Connection
const pool = new Pool({
  user: "journal_user", // Replace with your PostgreSQL username
  host: "localhost", // Replace with your database host
  database: "journal_app", // Replace with your database name
  password: "Pranshu@2004", // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to the database:", err.stack);
  }
  console.log("Connected to the database!");
  release();
});

// ---- ROUTES ----

// Authentication Middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ success: false, error: "Authorization token required" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Add user details to the request
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// Authentication Endpoint (Login)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userQuery = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    const user = userQuery.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, error: "An error occurred. Please try again." });
  }
});

// Create/Register User Endpoint
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
      [username, email, hashedPassword]
    );

    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, error: "An error occurred. Please try again." });
  }
});

// Predict Sentiment Endpoint
app.post("/api/predict-sentiment", (req, res) => {
  const { text } = req.body;

  // Simplified sentiment analysis logic (replace with actual ML model if required)
  const sentiment = text.includes("bad") || text.includes("sad") ? "negative" : "positive";

  res.json({ success: true, predicted_sentiment: sentiment });
});

// Fetch all journal entries for the logged-in user
app.get("/api/journal-entries", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC",
      [req.user.id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    res.status(500).json({ error: "Error fetching journal entries" });
  }
});

// Create a new journal entry (add this route to server.js)
app.post("/api/journal-entries", authenticateToken, async (req, res) => {
  const { title, content, date, status, sentiment } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO journal_entries (title, content, date, status, sentiment, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, content, date, status, sentiment || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding journal entry:", error);
    res.status(500).json({ error: "Error adding journal entry" });
  }
});

app.post("/api/user/:userId/journal-entries", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { title, content, date, status, sentiment } = req.body;

  // Validate userId
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: "Invalid userId" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO journal_entries (title, content, date, status, sentiment, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, content, date, status, sentiment, parseInt(userId)] // Ensure userId is an integer
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding journal entry for specific user:", error);
    res.status(500).json({ error: "Error adding journal entry for specific user" });
  }
});

// Edit a journal entry
app.put("/api/journal-entries/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, date, status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE journal_entries SET title = $1, content = $2, date = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
      [title, content, date, status, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Journal entry not found or unauthorized" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error editing journal entry:", error);
    res.status(500).json({ error: "Error editing journal entry" });
  }
});

// Delete a journal entry
app.delete("/api/journal-entries/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM journal_entries WHERE id = $1 AND user_id = $2 RETURNING *", [
      id,
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Journal entry not found or unauthorized" });
    }
    res.status(200).json({ message: "Journal entry deleted", entry: result.rows[0] });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    res.status(500).json({ error: "Error deleting journal entry" });
  }
});

// Fetch all journal entries for a specific user
app.get("/api/user/:userId/journal-entries", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const userWithEntries = await pool.query(
      "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );

    res.status(200).json(userWithEntries.rows);
  } catch (error) {
    console.error("Error fetching journal entries for specific user:", error);
    res.status(500).json({ error: "Error fetching journal entries for specific user" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});