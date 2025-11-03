import React, { useState } from "react";
import "./journalingPage.css";

const JournalingPage = () => {
  const [tone, setTone] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSave = () => {
    if (!date || !tone || !entry.trim()) {
      setSavedMessage("Please fill all fields.");
      return;
    }

    const newEntry = { date, tone, entry };

    if (editingIndex !== null) {
      const updatedHistory = [...journalHistory];
      updatedHistory[editingIndex] = newEntry;
      setJournalHistory(updatedHistory);
      setSavedMessage("Journal entry updated!");
      setEditingIndex(null);
    } else {
      setJournalHistory([newEntry, ...journalHistory]);
      setSavedMessage("Journal entry saved!");
    }

    setTone("");
    setEntry("");
    setDate("");
  };

  const handleEntryClick = (index) => {
    setSelectedEntry(journalHistory[index]);
  };

  const handleEdit = (index) => {
    const entryToEdit = journalHistory[index];
    setTone(entryToEdit.tone);
    setEntry(entryToEdit.entry);
    setDate(entryToEdit.date);
    setEditingIndex(index);
    setSelectedEntry(null);
    setSavedMessage("Editing entry...");
  };

  const tones = [
    "Happy",
    "Sad",
    "Calm",
    "Anxious",
    "Angry",
    "Motivated",
    "Grateful",
  ];

  return (
    <div className="journaling-container">
      <div className="journaling-card">
        <h1>Dear Diary ✨</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Date"
        />
        <div className="tone-selector">
          {tones.map((t) => (
            <button
              key={t}
              className={`tone-button ${tone === t ? "selected" : ""}`}
              onClick={() => setTone(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your heart out..."
        />
        <button onClick={handleSave}>
          {editingIndex !== null ? "Update Entry" : "Save Entry"}
        </button>
        {savedMessage && <p className="saved-message">{savedMessage}</p>}
      </div>

      <div className="journal-history">
        <h2>📖 Past Journal Entries</h2>
        {journalHistory.map((item, index) => (
          <div
            className="history-item"
            key={index}
            onClick={() => handleEntryClick(index)}
          >
            <span>
              {item.date} — {item.tone}
            </span>
            <button
              className="edit-button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(index);
              }}
            >
              Edit
            </button>
          </div>
        ))}

        {selectedEntry && (
          <div className="entry-preview">
            <h3>
              {selectedEntry.date} — {selectedEntry.tone}
            </h3>
            <div className="entry-content">{selectedEntry.entry}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalingPage;
