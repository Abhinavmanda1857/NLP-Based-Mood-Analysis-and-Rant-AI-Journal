import React, { useState, useEffect } from "react";
import axios from "axios";

export default function JournalEntryForm({ onAddEntry, initialData, fetchEntries }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setContent(initialData.content);
      setStatus(initialData.status);
    }
  }, [initialData]);
  const predictSentiment = async (text) => {
    try {
      const response = await fetch(
        "http://192.168.177.113:5001/predict_sentiment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();
      return data.predicted_sentiment;
    } catch (error) {
      console.error("Error predicting sentiment:", error);
      return null;
    }
  };
 const handleSubmit = async (newStatus) => {
  if (!title || !content) {
    alert("Both title and content are required!");
    return;
  }

  try {
    // Step 1: Predict sentiment
    const sentimentResponse = await axios.post(
      "http://192.168.177.113:5001/predict_sentiment",
      { text: content },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const predictedSentiment = sentimentResponse.data.predicted_sentiment;
    console.log("Predicted Sentiment:", predictedSentiment);

    // Step 2: Create blog entry object
    const blogEntry = {
      title,
      date: date || new Date().toISOString().split("T")[0], // Default to today's date if none provided
      content,
      status: newStatus,
      sentiment: predictedSentiment,
    };

    // Step 3: Save blog entry to the backend
    const saveResponse = await axios.post(
      "http://localhost:5001/api/journal-entries",
      blogEntry,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
        },
      }
    );

    if (saveResponse.status !== 201) {
      throw new Error("Failed to save blog entry");
    }

    // Step 4: Refresh entries and reset form
    await fetchEntries();
    onAddEntry(saveResponse.data);

    // Step 5: Redirect to Rant-AI if sentiment is negative
    if (predictedSentiment === "negative") {
      console.log("Redirecting to Rant-AI...");
      window.open("http://localhost:5173", "_blank"); // Update this if necessary
    } else {
      alert("Blog saved successfully!");
    }

    // Reset the form
    setTitle("");
    setDate("");
    setContent("");
    setStatus("Draft");
  } catch (error) {
    console.error("Error predicting sentiment or saving blog:", error);
    alert("An error occurred while saving the journal entry.");
  }
};
  return (
    <div className="entry-form">
      <input
        type="text"
        placeholder="Enter your journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-group"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="form-group"
      />
      <textarea
        placeholder="Start writing your journal entry here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="form-group"
      />
      <div>
        <button onClick={() => handleSubmit("Draft")}>Save Draft</button>
        <button onClick={() => handleSubmit("Published")}>Publish</button>
      </div>
    </div>
  );
}