import React, { useState } from "react";
import "./day-wise-tracker.css";

const DayWiseTracker = () => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
  );

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    setTasks((prev) => ({
      ...prev,
      [selectedDay]: [
        ...prev[selectedDay],
        { text: taskInput.trim(), done: false },
      ],
    }));
    setTaskInput("");
  };

  const handleToggle = (day, index) => {
    const updated = [...tasks[day]];
    updated[index].done = !updated[index].done;
    setTasks((prev) => ({ ...prev, [day]: updated }));
  };

  const handleDelete = (day, index) => {
    const updated = [...tasks[day]];
    updated.splice(index, 1);
    setTasks((prev) => ({ ...prev, [day]: updated }));
  };

  return (
    <div className="tracker-container">
      <h2 className="tracker-title">📅 Weekly Day-wise Task Tracker</h2>

      <div className="day-selector">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            className={`day-btn ${selectedDay === day ? "active" : ""}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="task-input">
        <input
          type="text"
          placeholder={`Add task for ${selectedDay}...`}
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <button onClick={handleAddTask}>+</button>
      </div>

      <div className="task-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="task-card">
            <h4>{day}</h4>
            {tasks[day].length > 0 ? (
              <ul>
                {tasks[day].map((task, i) => (
                  <li
                    key={i}
                    className={`task-item ${task.done ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggle(day, i)}
                    />
                    <span>{task.text}</span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(day, i)}
                    >
                      ✧
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <em>No tasks yet</em>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayWiseTracker;
