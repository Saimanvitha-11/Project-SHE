import React, { useState } from "react";
import "./vibe-playlist.css";

const playlists = {
  DarkRnB:
    "https://open.spotify.com/embed/playlist/6g5PhzHjjGzNL0MHj0pRoZ?utm_source=generator",
  DanceBitch:
    "https://open.spotify.com/embed/playlist/2mkzxrZdQ7sbEUjRGIGieF?utm_source=generator",
  TheWeekend:
    "https://open.spotify.com/embed/album/3OxfaVgvTxUTy7276t7SPU?utm_source=generator",
  ChillAfro:
    "https://open.spotify.com/embed/playlist/65Fqs1yzXEG84DMctmduMz?utm_source=generator",
  FUNK: "https://open.spotify.com/embed/playlist/1rx2U4ZmlG0PfbYZi8NKiO?utm_source=generator",
};

const BuiltInSpotify = () => {
  const [selected, setSelected] = useState("DarkRnB");

  return (
    <>
      {/* Floating Background Stars */}
      <div className="floating-stars">
        <span style={{ left: "5%", animationDuration: "14s" }}>✨</span>
        <span
          style={{ left: "20%", animationDuration: "18s", fontSize: "1.5rem" }}
        >
          ⭐
        </span>
        <span style={{ left: "35%", animationDuration: "12s" }}>✨</span>
        <span
          style={{ left: "50%", animationDuration: "20s", fontSize: "1.7rem" }}
        >
          🌟
        </span>
        <span style={{ left: "65%", animationDuration: "17s" }}>✨</span>
        <span
          style={{ left: "80%", animationDuration: "15s", fontSize: "1.3rem" }}
        >
          ⭐
        </span>
        <span style={{ left: "95%", animationDuration: "22s" }}>🌟</span>
      </div>

      {/* Main Vibe Playlist UI */}
      <div className="vibe-wrapper">
        <h2 className="vibe-title">Vibe Playlist</h2>

        <div className="vibe-tabs">
          {Object.keys(playlists).map((vibe) => (
            <button
              key={vibe}
              className={`vibe-btn ${selected === vibe ? "active" : ""}`}
              onClick={() => setSelected(vibe)}
            >
              {vibe}
            </button>
          ))}
        </div>

        <div className="vibe-frame">
          <iframe
            title="spotify-player-built-in"
            src={playlists[selected]}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: "20px" }}
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default BuiltInSpotify;
