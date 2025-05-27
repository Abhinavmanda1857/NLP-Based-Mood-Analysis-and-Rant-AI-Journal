import React from "react";

export default function EntryList({ entries, onSelectEntry }) {
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.id} onClick={() => onSelectEntry(entry)}>
          <h3>{entry.title}</h3>
          <p>{entry.date}</p>
        </li>
      ))}
    </ul>
  );
}