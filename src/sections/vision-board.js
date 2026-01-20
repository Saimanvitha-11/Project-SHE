import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./vision-board.css";
import { supabase } from "../supabaseClient";

export default function VisionBoard() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const boardRef = useRef(null);

  const drawing = useRef(false);
  const undoStack = useRef([]);

  const [boards, setBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);

  const [dragging, setDragging] = useState(null);
  const [drawMode, setDrawMode] = useState(false);
  const [brushColor, setBrushColor] = useState("#cc2e74");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  const [viewMode, setViewMode] = useState("board");

  // -------------------------------------------------------------------
  // 1️⃣ LOAD ALL BOARDS FROM SUPABASE
  // -------------------------------------------------------------------
  const loadBoards = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("vision_boards")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: true });

    if (!data || data.length === 0) {
      // Create 1 default board if none exist
      const { data: newBoard } = await supabase
        .from("vision_boards")
        .insert({
          user_id: user.data.user.id,
          name: "My First Dream",
          items: [],
          doodles: "",
          timeline: { past: "", now: "", future: "" },
          goal: {
            title: "",
            targetDate: "",
            selfProgress: 0,
            monthFocus: "",
            todayAction: "",
          },
        })
        .select()
        .single();

      setBoards([newBoard]);
      setActiveBoardId(newBoard.id);
      return;
    }

    setBoards(data);
    setActiveBoardId(data[0].id);
  };

  useEffect(() => {
    loadBoards();
  }, []);

  // -------------------------------------------------------------------
  // 2️⃣ AUTO-SAVE WHEN activeBoard changes
  // -------------------------------------------------------------------
  const saveBoard = async (board) => {
    if (!board) return;

    await supabase
      .from("vision_boards")
      .update({
        name: board.name,
        items: board.items,
        doodles: board.doodles,
        timeline: board.timeline,
        goal: board.goal,
      })
      .eq("id", board.id);
  };

  // Save whenever boards state changes
  useEffect(() => {
    if (!activeBoardId) return;
    const board = boards.find((b) => b.id === activeBoardId);
    saveBoard(board);
  }, [boards]);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  // -------------------------------------------------------------------
  // IMAGE UPLOAD
  // -------------------------------------------------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newItem = {
        id: Date.now(),
        type: "image",
        src: reader.result,
        x: 80,
        y: 80,
      };

      updateBoard({ items: [...activeBoard.items, newItem] });
    };
    reader.readAsDataURL(file);
  };

  const updateBoard = (fields) => {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId ? { ...b, ...fields } : b
      )
    );
  };

  // -------------------------------------------------------------------
  // TEXT NOTE
  // -------------------------------------------------------------------
  const addTextNote = () => {
    const text = prompt("Write your intention:");
    if (!text) return;

    const newItem = {
      id: Date.now(),
      type: "text",
      text,
      x: 100,
      y: 100,
    };

    updateBoard({ items: [...activeBoard.items, newItem] });
  };

  const deleteItem = (itemId) => {
    updateBoard({
      items: activeBoard.items.filter((i) => i.id !== itemId),
    });
  };

  // -------------------------------------------------------------------
  // DRAGGING ITEMS
  // -------------------------------------------------------------------
  const startDrag = (e, itemId) => {
    if (drawMode || viewMode !== "board") return;

    const rect = boardRef.current.getBoundingClientRect();
    setDragging({
      id: itemId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;

    updateBoard({
      items: activeBoard.items.map((item) =>
        item.id === dragging.id ? { ...item, x, y } : item
      ),
    });
  };

  const stopDrag = () => setDragging(null);

  // -------------------------------------------------------------------
  // DOODLE MODE CANVAS
  // -------------------------------------------------------------------
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    if (!drawMode || viewMode !== "board") return;
    drawing.current = true;
    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current) return;

    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineTo(x, y);

    ctx.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";

    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawing.current) return;

    drawing.current = false;

    const data = canvasRef.current.toDataURL();
    undoStack.current.push(data);

    updateBoard({ doodles: data });
  };

  // -------------------------------------------------------------------
  // TIMELINE MODE
  // -------------------------------------------------------------------
  const handleTimelineChange = (field, value) => {
    updateBoard({
      timeline: { ...activeBoard.timeline, [field]: value },
    });
  };

  // -------------------------------------------------------------------
  // GOALS MODE
  // -------------------------------------------------------------------
  const handleGoalChange = (field, value) => {
    const updatedGoal = {
      ...activeBoard.goal,
      [field]: field === "selfProgress" ? Number(value) : value,
    };

    updateBoard({ goal: updatedGoal });
  };

  // -------------------------------------------------------------------
  // EXPORT FUNCTIONS
  // -------------------------------------------------------------------
  const handleExportPNG = async () => {
    const canvas = await html2canvas(boardRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = `${activeBoard.name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleExportPDF = async () => {
    const canvas = await html2canvas(boardRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "px", "a4");

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(img, "PNG", 0, 0, width, height);
    pdf.save(`${activeBoard.name}.pdf`);
  };

  if (!activeBoard) return null;

  // -------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------
  return (
    <div
      className="vision-container"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <h3 className="vision-title">Vision Board</h3>
      <p className="vision-sub">Dream it. Build it. See it come alive.</p>

      {/* MODE TOGGLE */}
      <div className="vision-mode-toggle">
        <button
          className={viewMode === "board" ? "active-mode" : ""}
          onClick={() => setViewMode("board")}
        >
          Canvas
        </button>
        <button
          className={viewMode === "timeline" ? "active-mode" : ""}
          onClick={() => setViewMode("timeline")}
        >
          Timeline
        </button>
        <button
          className={viewMode === "goals" ? "active-mode" : ""}
          onClick={() => setViewMode("goals")}
        >
          Goals
        </button>
      </div>

      {/* BOARD SELECTOR */}
      <div className="vision-tabs">
        {boards.map((board) => (
          <button
            key={board.id}
            className={activeBoardId === board.id ? "active-tab" : ""}
            onClick={() => setActiveBoardId(board.id)}
          >
            {board.name}
          </button>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="vision-controls">
        <button onClick={() => fileInputRef.current.click()}>Add Image</button>
        <button onClick={addTextNote}>Add Text</button>

        <button onClick={() => setDrawMode((d) => !d)}>
          {drawMode ? "Stop Drawing" : "Doodle Mode"}
        </button>

        {drawMode && (
          <>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              disabled={isEraser}
            />
            <input
              type="range"
              min="1"
              max="16"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
            />

            <button onClick={() => setIsEraser(false)}>✏️ Pen</button>
            <button onClick={() => setIsEraser(true)}>🧽 Eraser</button>
          </>
        )}

        <button onClick={handleExportPNG}>PNG</button>
        <button onClick={handleExportPDF}>PDF</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageUpload}
      />

      {/* MAIN BOARD */}
      <div
        className="vision-board"
        ref={boardRef}
        onMouseDown={drawMode ? startDrawing : undefined}
        onMouseMove={drawMode ? draw : undefined}
        onMouseUp={drawMode ? stopDrawing : undefined}
        onMouseLeave={drawMode ? stopDrawing : undefined}
      >
        {/* BOARD MODE */}
        {viewMode === "board" && (
          <>
            <canvas ref={canvasRef} className="vision-canvas" />
            {activeBoard.items.map((item) => (
              <div
                key={item.id}
                className={`vision-item ${item.type}`}
                style={{ left: item.x, top: item.y }}
                onMouseDown={(e) => startDrag(e, item.id)}
              >
                <span
                  className="delete-btn"
                  onClick={() => deleteItem(item.id)}
                >
                  ✖
                </span>

                {item.type === "image" ? (
                  <img src={item.src} alt="" />
                ) : (
                  <div className="vision-text">{item.text}</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* TIMELINE MODE */}
        {viewMode === "timeline" && (
          <div className="timeline-layout">
            <div className="timeline-column">
              <h4>Past</h4>
              <textarea
                className="timeline-input"
                value={activeBoard.timeline.past}
                onChange={(e) =>
                  handleTimelineChange("past", e.target.value)
                }
              />
            </div>
            <div className="timeline-column">
              <h4>Now</h4>
              <textarea
                className="timeline-input"
                value={activeBoard.timeline.now}
                onChange={(e) =>
                  handleTimelineChange("now", e.target.value)
                }
              />
            </div>
            <div className="timeline-column">
              <h4>Future</h4>
              <textarea
                className="timeline-input"
                value={activeBoard.timeline.future}
                onChange={(e) =>
                  handleTimelineChange("future", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {/* GOALS MODE */}
        {viewMode === "goals" && (
          <div className="goals-layout">
            <div className="goal-main">
              <label>
                Big Dream
                <input
                  type="text"
                  value={activeBoard.goal.title}
                  onChange={(e) =>
                    handleGoalChange("title", e.target.value)
                  }
                />
              </label>

              <label>
                Target Date
                <input
                  type="date"
                  value={activeBoard.goal.targetDate}
                  onChange={(e) =>
                    handleGoalChange("targetDate", e.target.value)
                  }
                />
              </label>

              <label>
                Progress ({activeBoard.goal.selfProgress}%)
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeBoard.goal.selfProgress}
                  onChange={(e) =>
                    handleGoalChange("selfProgress", e.target.value)
                  }
                />
              </label>

              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${activeBoard.goal.selfProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="goal-side">
              <label>
                This Month’s Focus
                <textarea
                  value={activeBoard.goal.monthFocus}
                  onChange={(e) =>
                    handleGoalChange("monthFocus", e.target.value)
                  }
                />
              </label>

              <label>
                Today's Tiny Action
                <textarea
                  value={activeBoard.goal.todayAction}
                  onChange={(e) =>
                    handleGoalChange("todayAction", e.target.value)
                  }
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}