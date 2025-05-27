import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import axios from "axios";
import "./Login.css"; // Add styles for the login page here

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // Add email for registration
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Initialize navigate hook

  const handleSwitch = () => {
    setIsRegistering(!isRegistering);
    setError(""); // Clear errors when switching
  };

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
          onLogin(response.data.token); // Pass token to parent
          localStorage.setItem("token", response.data.token); // Store token in localStorage
          navigate("/home"); // Redirect to homepage
        } else {
          alert("Registration successful! Please log in.");
          setIsRegistering(false);
        }
      } else {
        setError(response.data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
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
}