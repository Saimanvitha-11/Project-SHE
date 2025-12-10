import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./career-and-learning-tracker.css";

export default function CareerAndLearningTracker() {
  const initialTasks = [
    { name: "Learn a new concept", completed: false },
    { name: "Practice coding", completed: false },
    { name: "Read an article/book", completed: false },
    { name: "Work on a project", completed: false },
  ];

  const [tasks, setTasks] = useState(initialTasks);
  const [streak, setStreak] = useState(0);
  const [progressData, setProgressData] = useState([]);
  const [dayCount, setDayCount] = useState(1);

  useEffect(() => {
    const savedProgress =
      JSON.parse(localStorage.getItem("progressData")) || [];
    const savedStreak = parseInt(localStorage.getItem("streak")) || 0;
    const savedDay = parseInt(localStorage.getItem("dayCount")) || 1;

    setProgressData(savedProgress);
    setStreak(savedStreak);
    setDayCount(savedDay);
  }, []);

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  // 🔒 THIS BUTTON CONTROLS THE GRAPH NOW
  const pushToGraph = () => {
    const completedCount = tasks.filter((t) => t.completed).length;

    const newEntry = {
      day: `Day ${dayCount}`,
      completed: completedCount,
    };

    const updatedProgress = [...progressData, newEntry];
    setProgressData(updatedProgress);

    // Update streak only if all 4 are done
    const newStreak = completedCount === 4 ? streak + 1 : streak;
    setStreak(newStreak);

    // Save
    localStorage.setItem("progressData", JSON.stringify(updatedProgress));
    localStorage.setItem("streak", newStreak);
    localStorage.setItem("dayCount", dayCount + 1);

    setDayCount((prev) => prev + 1);

    // Reset for next day
    setTasks(initialTasks);

    if (completedCount === 4) {
      alert("✨ FULL DAY COMPLETED. ONE STEP CLOSER TO YOUR DREAM. ✨");
    } else {
      alert(
        `Progress saved: ${completedCount}/4 tasks done today. Show up again tomorrow, warrior.`
      );
    }
  };

  return (
    <div className="career-tracker-container">
      <h3 className="section-title">📈 Career & Learning Tracker</h3>

      <div className="task-list">
        {tasks.map((task, index) => (
          <div className="task-row" key={index}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(index)}
            />
            <span>{task.name}</span>
          </div>
        ))}
      </div>

      {/* 🚀 THE MAGIC BUTTON */}
      <button className="push-btn" onClick={pushToGraph}>
        Lock Today & Push to Graph 🚀
      </button>

      <div className="progress-graph">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} domain={[0, 4]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#cc2e74"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="dream-meter">
        <p>  Streak: {streak} days</p>
        <div className="meter-bar">
          <div
            className="meter-fill"
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
