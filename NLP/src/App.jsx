import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import RantRedirectButton from "./components/RantRedirectButton";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // New state variables for UI layout
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Function to handle login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering
      ? "http://localhost:5001/api/register"
      : "http://localhost:5001/api/login";
    const payload = isRegistering ? { username, email, password } : { username, password };

    try {
      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        if (!isRegistering) {
          // Login successful
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          
          // Decode token to get user ID
          const decodedToken = JSON.parse(atob(response.data.token.split('.')[1]));
          setUserId(decodedToken.id);
          
          setIsLoggedIn(true);
        } else {
          alert("Registration successful! Please log in.");
          setIsRegistering(false);
        }
      } else {
        setError(response.data.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  // Function to fetch journal entries
  const fetchJournalEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/journal-entries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setJournalEntries(response.data);
      } else {
        setError("Failed to fetch journal entries.");
      }
    } catch (err) {
      console.error("Error fetching journal entries:", err);
      setError("An error occurred while fetching journal entries.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch journal entries on login
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchJournalEntries();
    }
  }, [isLoggedIn, token]);

  // Function to handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    setUserId("");
    localStorage.removeItem("token");
    setJournalEntries([]);
    setSelectedEntry(null);
    setEditingEntry(null);
  };

  // Switch between login and registration
  const handleSwitch = () => {
    setIsRegistering(!isRegistering);
    setError("");
  };

  // Function to handle adding a new journal entry
  const handleAddEntry = async (status) => {
    if (!title || !content) {
      alert("Both title and content are required!");
      return;
    }

    const newEntry = {
      title,
      date: date || new Date().toISOString().split("T")[0],
      content,
      status,
      sentiment: null
    };

    try {
      const response = await axios.post(
        `http://localhost:5001/api/user/${userId}/journal-entries`, 
        newEntry, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        // If editing an existing entry
        if (editingEntry !== null) {
          const updatedEntries = [...journalEntries];
          updatedEntries[editingEntry] = response.data;
          setJournalEntries(updatedEntries);
          setEditingEntry(null);
        } else {
          // Adding a new entry
          setJournalEntries([response.data, ...journalEntries]);
        }
        
        // Clear form fields
        setTitle("");
        setDate("");
        setContent("");
        setSelectedEntry(null);
        
        alert(status === "Published" ? "Entry published successfully!" : "Draft saved successfully!");
      } else {
        alert("Failed to save journal entry. Please try again.");
      }
    } catch (err) {
      console.error("Error saving journal entry:", err);
      alert("An error occurred while saving the journal entry.");
    }
  };

  // Function to edit an entry
  const handleEditEntry = () => {
    if (selectedEntry) {
      const index = journalEntries.findIndex(entry => entry.id === selectedEntry.id);
      if (index !== -1) {
        setEditingEntry(index);
        setTitle(selectedEntry.title);
        setDate(selectedEntry.date);
        setContent(selectedEntry.content);
        setSelectedEntry(null);
      }
    }
  };

  // Function to go back to writing
  const backToWriting = () => {
    setSelectedEntry(null);
    setEditingEntry(null);
    setTitle("");
    setDate("");
    setContent("");
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Login/Register form
  const renderAuthForm = () => (
    <div className="login-container">
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
        <p>
          {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="toggle-link" onClick={handleSwitch}>
            {isRegistering ? "Login" : "Register"}
          </span>
        </p>
      </form>
    </div>
  );

  // Journal entry form
  const renderJournalEntryForm = () => (
    <div className="entry-form">
      <h2>{editingEntry !== null ? "Edit Entry" : "New Entry"}</h2>
      <input
        type="text"
        placeholder="Enter your journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <textarea
        placeholder="Start writing your journal entry here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="10"
      />
      <div id="to_pad">
        <button onClick={() => handleAddEntry("Draft")}>Save as Draft</button>
        <button onClick={() => handleAddEntry("Published")}>Publish</button>
      </div>
    </div>
  );

  // Selected entry detail view
  const renderEntryDetail = () => (
    <div className="entry-detail-view">
      <h2>{selectedEntry.title}</h2>
      <p>
        <strong>Date:</strong> {selectedEntry.date}
      </p>
      <p>
        <strong>Status:</strong> {selectedEntry.status}
      </p>
      <p>{selectedEntry.content}</p>
      <button onClick={handleEditEntry}>Edit</button>
      <button onClick={backToWriting} style={{ marginLeft: "10px" }}>
        Back to Writing
      </button>
    </div>
  );

  // Entry list component
  const renderEntryList = () => (
    <div className="entry-list">
      <h3>Journal Entries</h3>
      {loading ? (
        <p>Loading...</p>
      ) : journalEntries.length > 0 ? (
        journalEntries.map((entry) => (
          <div
            key={entry.id}
            className="entry-card"
            onClick={() => setSelectedEntry(entry)}
          >
            <h3>{entry.title}</h3>
            <p>
              <strong>Date:</strong> {entry.date}
            </p>
            <p>
              <strong>Status:</strong> {entry.status}
            </p>
          </div>
        ))
      ) : (
        <p>No journal entries found.</p>
      )}
    </div>
  );

  return (
    <div>
      <header>
        <h1>My Journal</h1>
        {isLoggedIn && (
          <div>
           
            <button onClick={handleLogout} style={{ marginLeft: "10px" }}>Logout</button>
          </div>
        )}
          <div className="App">
            <RantRedirectButton />
         </div>
      </header>

      {!isLoggedIn ? (
        renderAuthForm()
      ) : (
        <div className={`app ${darkMode ? "dark" : ""}`}>
          {/* Entry List on the Left */}
          {renderEntryList()}

          {/* Main Section (Right) */}
          <div className="entry-detail">
            {selectedEntry ? renderEntryDetail() : renderJournalEntryForm()}
          </div>
        </div>
      )}
    </div>
  );
}