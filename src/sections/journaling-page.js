import React, { useState, useEffect } from "react";
import "./journalingPage.css";
import { supabase } from "../supabaseClient";

const JournalingPage = () => {
  const [tone, setTone] = useState("");
  const [entry, setEntry] = useState("");
  const [date, setDate] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const tones = [
    "Happy",
    "Sad",
    "Calm",
    "Anxious",
    "Angry",
    "Motivated",
    "Grateful",
  ];

  // ----------------------------------
  // FETCH ALL JOURNAL ENTRIES
  // ----------------------------------
  const fetchEntries = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .from("journals") // <<---- FIXED TABLE NAME
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setJournalHistory(data);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // ----------------------------------
  // SAVE OR UPDATE ENTRY
  // ----------------------------------
  const handleSave = async () => {
    if (!date || !tone || !entry.trim()) {
      setSavedMessage("Please fill all fields.");
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const payload = {
      user_id: user.data.user.id,
      date,
      tone,
      entry,
    };

    let response;

    if (editingId) {
      // UPDATE
      response = await supabase
        .from("journals") // <<---- FIXED TABLE NAME
        .update(payload)
        .eq("id", editingId);

      setSavedMessage("Journal entry updated!");
    } else {
      // INSERT
      response = await supabase
        .from("journals") // <<---- FIXED TABLE NAME
        .insert(payload);

      setSavedMessage("Journal entry saved!");
    }

    if (!response.error) {
      setTone("");
      setEntry("");
      setDate("");
      setEditingId(null);
      fetchEntries();
    }
  };

  // ----------------------------------
  // CLICK ENTRY TO PREVIEW
  // ----------------------------------
  const handleEntryClick = (entryObj) => {
    setSelectedEntry(entryObj);
  };

  // ----------------------------------
  // EDIT ENTRY
  // ----------------------------------
  const handleEdit = (entryObj) => {
    setTone(entryObj.tone);
    setEntry(entryObj.entry);
    setDate(entryObj.date);
    setEditingId(entryObj.id);
    setSelectedEntry(null);
    setSavedMessage("Editing entry...");
  };

  return (
    <div className="journaling-container">
      <div className="journaling-card">
        <h1>Dear Diary ✨</h1>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
          {editingId ? "Update Entry" : "Save Entry"}
        </button>

        {savedMessage && <p className="saved-message">{savedMessage}</p>}
      </div>

      <div className="journal-history">
        <h2>📖 Past Journal Entries</h2>

        {journalHistory.map((item) => (
          <div
            className="history-item"
            key={item.id}
            onClick={() => handleEntryClick(item)}
          >
            <span>
              {item.date} — {item.tone}
            </span>

            <button
              className="edit-button"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
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
