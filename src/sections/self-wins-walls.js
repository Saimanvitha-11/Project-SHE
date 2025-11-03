import React, { useState } from "react";
import "./self-wins-wall.css";

export default function SelfWinsWall() {
  const [wins, setWins] = useState([]);
  const [newWin, setNewWin] = useState("");

  const addWin = () => {
    if (newWin.trim() === "") return;
    const winObj = {
      text: newWin,
      date: new Date().toLocaleDateString(),
      tilt: Math.random() * 10 - 5 // random tilt between -5° to 5°
    };
    setWins([...wins, winObj]);
    setNewWin("");
  };

  const deleteWin = (indexToDelete) => {
    setWins(wins.filter((_, index) => index !== indexToDelete));
  };

  return (
    <div className="self-wins-wall">
      <h2 className="title">💗 My Self Wins Wall</h2>
      <p className="subtitle">
        Because every small victory matters, nothing is too small.
      </p>

      <div className="input-area">
        <input
          type="text"
          placeholder="Write your win here..."
          value={newWin}
          onChange={(e) => setNewWin(e.target.value)}
        />
        <button onClick={addWin}>+ Add Win</button>
      </div>

      <div className="wins-grid">
        {wins.map((win, index) => (
          <div
            key={index}
            className="win-card"
            style={{ transform: `rotate(${win.tilt}deg)` }}
          >
            <span className="pin">📌</span>
            <button
              className="delete-btn"
              onClick={() => deleteWin(index)}
              title="Remove this win"
            >
              ✖
            </button>
            <div className="polaroid">
              <p className="win-text">{win.text}</p>
              <span className="win-date">{win.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
