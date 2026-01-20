import React, { useState, useEffect } from "react";
import "./self-wins-wall.css";
import { supabase } from "../supabaseClient";

export default function SelfWinsWall() {
  const [wins, setWins] = useState([]);
  const [newWin, setNewWin] = useState("");

  // ------------------------------
  // FETCH ALL WINS ON PAGE LOAD
  // ------------------------------
  const fetchWins = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data, error } = await supabase
      .from("self_wins")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: false });

    if (!error) setWins(data);
  };

  useEffect(() => {
    fetchWins();
  }, []);

  // ------------------------------
  // ADD A WIN (SAVE TO SUPABASE)
  // ------------------------------
  const addWin = async () => {
    if (newWin.trim() === "") return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const payload = {
      user_id: user.data.user.id,
      text: newWin,
      category: "general", // default category
      date: new Date().toISOString().split("T")[0],
      tilt: Math.random() * 10 - 5,
    };

    const { data, error } = await supabase
      .from("self_wins")
      .insert(payload)
      .select();

    if (!error && data) {
      setWins([data[0], ...wins]); // update UI
      setNewWin("");
    }
  };

  // ------------------------------
  // DELETE A WIN
  // ------------------------------
  const deleteWin = async (id) => {
    const { error } = await supabase
      .from("self_wins")
      .delete()
      .eq("id", id);

    if (!error) {
      setWins(wins.filter((w) => w.id !== id));
    }
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
        {wins.map((win) => (
          <div
            key={win.id}
            className="win-card"
            style={{
              transform: `rotate(${win.tilt ?? 0}deg)`
            }}
          >
            <span className="pin">📌</span>

            <button
              className="delete-btn"
              onClick={() => deleteWin(win.id)}
            >
              ✖
            </button>

            <div className="polaroid">
              <p className="win-text">{win.text}</p>

              <span className="win-date">
                {win.date
                  ? new Date(win.date).toLocaleDateString()
                  : new Date(win.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
