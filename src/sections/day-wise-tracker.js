import React, { useState, useEffect } from "react";
import "./day-wise-tracker.css";
import { supabase } from "../supabaseClient";

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

  const emptyTaskStructure = daysOfWeek.reduce(
    (acc, day) => ({ ...acc, [day]: [] }),
    {}
  );

  const [tasks, setTasks] = useState(emptyTaskStructure);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  /* ---------------- FETCH USER SESSION ---------------- */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        loadTasks(data.user.id);
      }
    };
    getUser();
  }, []);

  /* ---------------- LOAD TASKS FROM SUPABASE ---------------- */
  const loadTasks = async (uid) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("day_wise_tasks")
      .select("tasks")
      .eq("user_id", uid)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
    }

    // If no entry yet → create one
    if (!data) {
      await supabase.from("day_wise_tasks").insert({
        user_id: uid,
        tasks: emptyTaskStructure,
      });

      setTasks(emptyTaskStructure);
    } else {
      setTasks(data.tasks);
    }

    setLoading(false);
  };

  /* ---------------- SAVE TASKS TO SUPABASE ---------------- */
  const saveTasks = async (updatedTasks) => {
    setTasks(updatedTasks);

    await supabase
      .from("day_wise_tasks")
      .update({
        tasks: updatedTasks,
        updated_at: new Date(),
      })
      .eq("user_id", userId);
  };

  /* ---------------- ADD TASK ---------------- */
  const handleAddTask = () => {
    if (!taskInput.trim()) return;

    const updated = {
      ...tasks,
      [selectedDay]: [
        ...tasks[selectedDay],
        { text: taskInput.trim(), done: false },
      ],
    };

    saveTasks(updated);
    setTaskInput("");
  };

  /* ---------------- TOGGLE TASK ---------------- */
  const handleToggle = (day, index) => {
    const updated = { ...tasks };
    updated[day][index].done = !updated[day][index].done;

    saveTasks(updated);
  };

  /* ---------------- DELETE TASK ---------------- */
  const handleDelete = (day, index) => {
    const updated = { ...tasks };
    updated[day].splice(index, 1);

    saveTasks(updated);
  };

  if (loading) return <p>Loading your tasks... 💗</p>;

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