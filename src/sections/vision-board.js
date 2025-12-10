import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./vision-board.css";

export default function VisionBoard() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const boardRef = useRef(null);

  const drawing = useRef(false);
  const undoStack = useRef([]);

  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem("vision-boards");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((b, idx) => ({
          id: b.id ?? Date.now() + idx,
          name: b.name ?? `Board ${idx + 1}`,
          items: b.items ?? [],
          doodles: b.doodles ?? "",
          timeline: b.timeline || { past: "", now: "", future: "" },
          goal:
            b.goal || {
              title: "",
              targetDate: "",
              selfProgress: 0,
              monthFocus: "",
              todayAction: "",
            },
        }));
      } catch {
        // fallback if parsing fails
      }
    }
    return [
      {
        id: 1,
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
      },
    ];
  });

  const [activeBoardId, setActiveBoardId] = useState(
    (boards[0] && boards[0].id) || 1
  );

  const activeBoard =
    boards.find((b) => b.id === activeBoardId) || boards[0];

  const [dragging, setDragging] = useState(null);
  const [drawMode, setDrawMode] = useState(false);
  const [brushColor, setBrushColor] = useState("#cc2e74");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  const [viewMode, setViewMode] = useState("board"); // "board" | "timeline" | "goals"

  // save boards
  useEffect(() => {
    localStorage.setItem("vision-boards", JSON.stringify(boards));
  }, [boards]);

  // canvas size + restore doodles
  useEffect(() => {
    if (!canvasRef.current || !boardRef.current) return;

    const canvas = canvasRef.current;
    const board = boardRef.current;

    canvas.width = board.clientWidth;
    canvas.height = board.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    undoStack.current = [];

    if (activeBoard?.doodles) {
      const img = new Image();
      img.src = activeBoard.doodles;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        undoStack.current.push(activeBoard.doodles);
      };
    }
  }, [activeBoardId, boards.length]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // -------- BOARD MANAGEMENT --------
  const addBoard = () => {
    const name = prompt("Name your new vision board:");
    if (!name) return;

    const newBoard = {
      id: Date.now(),
      name,
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
    };

    setBoards((prev) => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  // -------- IMAGE + TEXT --------
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

      setBoards((prev) =>
        prev.map((board) =>
          board.id === activeBoardId
            ? { ...board, items: [...board.items, newItem] }
            : board
        )
      );
    };
    reader.readAsDataURL(file);
  };

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

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId
          ? { ...board, items: [...board.items, newItem] }
          : board
      )
    );
  };

  const deleteItem = (itemId) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId
          ? {
              ...board,
              items: board.items.filter((item) => item.id !== itemId),
            }
          : board
      )
    );
  };

  // -------- DRAG ITEMS --------
  const startDrag = (e, itemId) => {
    if (drawMode || viewMode !== "board") return;
    setDragging({
      id: itemId,
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
    });
  };

  const onDrag = (e) => {
    if (!dragging || viewMode !== "board") return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - boardRect.left - dragging.offsetX;
    const y = e.clientY - boardRect.top - dragging.offsetY;

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId
          ? {
              ...board,
              items: board.items.map((item) =>
                item.id === dragging.id ? { ...item, x, y } : item
              ),
            }
          : board
      )
    );
  };

  const stopDrag = () => setDragging(null);

  // -------- DOODLE MODE --------
  const startDrawing = (e) => {
    if (!drawMode || viewMode !== "board") return;
    drawing.current = true;
    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current || viewMode !== "board") return;
    const { x, y } = getCanvasPos(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineTo(x, y);

    ctx.strokeStyle = isEraser ? "rgba(0,0,0,1)" : brushColor;
    ctx.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!drawing.current) return;
    drawing.current = false;

    const canvas = canvasRef.current;
    const data = canvas.toDataURL();

    undoStack.current.push(data);

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId ? { ...board, doodles: data } : board
      )
    );
  };

  const clearDoodles = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    undoStack.current = [];

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId ? { ...board, doodles: "" } : board
      )
    );
  };

  const undoLastStroke = () => {
    if (undoStack.current.length === 0) return;

    undoStack.current.pop();
    const previous = undoStack.current[undoStack.current.length - 1] || "";

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (previous) {
      const img = new Image();
      img.src = previous;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }

    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId ? { ...board, doodles: previous } : board
      )
    );
  };

  // -------- TIMELINE MODE --------
  const handleTimelineChange = (field, value) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId
          ? {
              ...board,
              timeline: {
                past: "",
                now: "",
                future: "",
                ...(board.timeline || {}),
                [field]: value,
              },
            }
          : board
      )
    );
  };

  // -------- GOAL MODE --------
  const handleGoalChange = (field, value) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === activeBoardId
          ? {
              ...board,
              goal: {
                title: "",
                targetDate: "",
                selfProgress: 0,
                monthFocus: "",
                todayAction: "",
                ...(board.goal || {}),
                [field]: field === "selfProgress" ? Number(value) : value,
              },
            }
          : board
      )
    );
  };

  const goal = activeBoard?.goal || {};
  const goalProgress = goal.selfProgress || 0;

  // -------- EXPORT --------
  const handleExportPNG = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { scale: 2 });
    const link = document.createElement("a");
    const safeName =
      (activeBoard?.name || "vision-board").replace(/\s+/g, "-").toLowerCase();
    link.download = `${safeName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleExportPDF = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "px", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(
      pageWidth / canvas.width,
      pageHeight / canvas.height
    );
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    const safeName =
      (activeBoard?.name || "vision-board").replace(/\s+/g, "-").toLowerCase();
    pdf.save(`${safeName}.pdf`);
  };

  if (!activeBoard) return null;

  return (
    <div
      className="vision-container"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
    >
      <h3 className="vision-title">Vision Board Section</h3>
      <p className="vision-sub">Create, draw, move & manifest freely.</p>

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

      {/* BOARD TABS */}
      <div className="vision-tabs">
        {boards.map((board) => (
          <button
            key={board.id}
            className={board.id === activeBoardId ? "active-tab" : ""}
            onClick={() => setActiveBoardId(board.id)}
          >
            {board.name}
          </button>
        ))}
        <button onClick={addBoard}>+ New Board</button>
      </div>

      {/* CONTROLS */}
      <div className="vision-controls">
        <button onClick={() => fileInputRef.current.click()}>Add Image</button>
        <button onClick={addTextNote}>Add Text</button>

        <button onClick={() => setDrawMode((d) => !d)}>
          {drawMode ? "Stop Drawing" : "Doodle Mode"}
        </button>

        {viewMode === "board" && drawMode && (
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
            <button onClick={undoLastStroke}>↩ Undo</button>
            <button onClick={clearDoodles}>🗑 Clear</button>
          </>
        )}

        {/* Export buttons always available */}
        <button onClick={handleExportPNG}>📤 PNG</button>
        <button onClick={handleExportPDF}>📄 PDF</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageUpload}
      />

      {/* BOARD AREA */}
      <div
        className="vision-board"
        ref={boardRef}
        onMouseDown={viewMode === "board" ? startDrawing : undefined}
        onMouseMove={viewMode === "board" ? draw : undefined}
        onMouseUp={viewMode === "board" ? stopDrawing : undefined}
        onMouseLeave={viewMode === "board" ? stopDrawing : undefined}
      >
        {/* CANVAS MODE */}
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
                  <img src={item.src} alt="vision" />
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
              <h4>Past Me</h4>
              <textarea
                className="timeline-input"
                placeholder="What did she survive? What did she learn?"
                value={activeBoard.timeline?.past || ""}
                onChange={(e) =>
                  handleTimelineChange("past", e.target.value)
                }
              />
            </div>
            <div className="timeline-column">
              <h4>Now Me</h4>
              <textarea
                className="timeline-input"
                placeholder="Who is she now? What is she working on?"
                value={activeBoard.timeline?.now || ""}
                onChange={(e) =>
                  handleTimelineChange("now", e.target.value)
                }
              />
            </div>
            <div className="timeline-column">
              <h4>Future Me</h4>
              <textarea
                className="timeline-input"
                placeholder="Where is she headed? Describe her life."
                value={activeBoard.timeline?.future || ""}
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
                Big Dream:
                <input
                  type="text"
                  placeholder="e.g. 15+ LPA SWE at Microsoft"
                  value={goal.title || ""}
                  onChange={(e) =>
                    handleGoalChange("title", e.target.value)
                  }
                />
              </label>

              <label>
                Target Date:
                <input
                  type="date"
                  value={goal.targetDate || ""}
                  onChange={(e) =>
                    handleGoalChange("targetDate", e.target.value)
                  }
                />
              </label>

              <label>
                How close do you feel? ({goalProgress}%)
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goalProgress}
                  onChange={(e) =>
                    handleGoalChange("selfProgress", e.target.value)
                  }
                />
              </label>

              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
              <p className="goal-progress-text">
                Every month, update this slider honestly. Small moves count.
              </p>
            </div>

            <div className="goal-side">
              <label>
                This month’s focus
                <textarea
                  placeholder="What is this month's main focus?"
                  value={goal.monthFocus || ""}
                  onChange={(e) =>
                    handleGoalChange("monthFocus", e.target.value)
                  }
                />
              </label>

              <label>
                Today’s tiny action
                <textarea
                  placeholder="One small thing you can do today."
                  value={goal.todayAction || ""}
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
