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
import { supabase } from "../supabaseClient";

export default function CareerAndLearningTracker() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [progressData, setProgressData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [dayCount, setDayCount] = useState(1);

  // Career Plan
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([""]);
  const [planId, setPlanId] = useState(null);

  // ---------------------------------------------------
  // FETCH TASKS
  // ---------------------------------------------------
  const fetchTasks = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("career_tasks")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("created_at", { ascending: true });

    if (!data) return;

    setTasks(data.map((t) => ({ ...t, completed: false })));
  };

  // ---------------------------------------------------
  // FETCH DAILY LOGS (YOUR TABLE)
  // ---------------------------------------------------
  const fetchProgress = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("career_daily_logs")
      .select("*")
      .eq("user_id", user.data.user.id)
      .order("day_number", { ascending: true });

    const safe = data || [];

    // Transform into graph-friendly format
    const graphData = safe.map((log) => ({
      day: `Day ${log.day_number}`,
      completed: log.completed_tasks,
    }));

    setProgressData(graphData);

    setStreak(safe.length);
    setDayCount(safe.length + 1);
  };

  // ---------------------------------------------------
  // FETCH CAREER PLAN
  // ---------------------------------------------------
  const fetchCareerPlan = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data: plan } = await supabase
      .from("career_plans")
      .select("*")
      .eq("user_id", user.data.user.id)
      .limit(1)
      .single();

    if (!plan) return;

    setPlanId(plan.id);
    setTitle(plan.title);
    setDescription(plan.description);

    const { data: stepData } = await supabase
      .from("career_plan_steps")
      .select("*")
      .eq("plan_id", plan.id)
      .order("step_number", { ascending: true });

    setSteps(stepData.map((s) => s.step_text));
  };

  // LOAD EVERYTHING
  useEffect(() => {
    fetchTasks();
    fetchProgress();
    fetchCareerPlan();
  }, []);

  // ---------------------------------------------------
  // ADD TASK
  // ---------------------------------------------------
  const addTask = async () => {
    if (!newTask.trim()) return;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { data } = await supabase
      .from("career_tasks")
      .insert({
        user_id: user.data.user.id,
        task_name: newTask.trim(),
      })
      .select();

    if (data) {
      setTasks([...tasks, { ...data[0], completed: false }]);
      setNewTask("");
    }
  };

  // TOGGLE COMPLETED
  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // ---------------------------------------------------
  // SAVE TODAY TO YOUR TABLE
  // ---------------------------------------------------
  const pushToGraph = async () => {
    const completedCount = tasks.filter((t) => t.completed).length;

    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const payload = {
      user_id: user.data.user.id,
      day_number: dayCount,
      completed_tasks: completedCount,
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.task_name,
        completed: t.completed,
      })),
    };

    const { data, error } = await supabase
      .from("career_daily_logs")
      .insert(payload)
      .select();

    if (error) {
      console.error(error);
    }

    if (data) {
      const newLog = {
        day: `Day ${data[0].day_number}`,
        completed: data[0].completed_tasks,
      };

      setProgressData([...progressData, newLog]);
      setStreak(streak + 1);
      setDayCount(dayCount + 1);

      setTasks(tasks.map((t) => ({ ...t, completed: false })));

      alert(
        completedCount === tasks.length
          ? "✨ FULL DAY COMPLETED — PROUD OF YOU! ✨"
          : `Saved: ${completedCount}/${tasks.length} tasks`
      );
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    await supabase.from("career_tasks").delete().eq("id", id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // ---------------------------------------------------
  // CAREER PLAN EDITING
  // ---------------------------------------------------
  const addStep = () => setSteps([...steps, ""]);

  const updateStep = (i, value) => {
    const updated = [...steps];
    updated[i] = value;
    setSteps(updated);
  };

  const removeStep = (i) =>
    setSteps(steps.filter((_, idx) => idx !== i));

  // SAVE CAREER PLAN
  const saveCareerPlan = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    if (!title.trim()) {
      alert("Title required");
      return;
    }

    // Create plan
    if (!planId) {
      const { data: plan } = await supabase
        .from("career_plans")
        .insert({
          user_id: user.data.user.id,
          title,
          description,
        })
        .select()
        .single();

      setPlanId(plan.id);

      for (let i = 0; i < steps.length; i++) {
        await supabase.from("career_plan_steps").insert({
          plan_id: plan.id,
          step_number: i + 1,
          step_text: steps[i],
        });
      }

      alert("Career Plan Saved ✨");
      return;
    }

    // Update existing
    await supabase
      .from("career_plans")
      .update({
        title,
        description,
      })
      .eq("id", planId);

    await supabase
      .from("career_plan_steps")
      .delete()
      .eq("plan_id", planId);

    for (let i = 0; i < steps.length; i++) {
      await supabase.from("career_plan_steps").insert({
        plan_id: planId,
        step_number: i + 1,
        step_text: steps[i],
      });
    }

    alert("Career Plan Updated ✨");
  };

  // ---------------------------------------------------
  // UI BELOW
  // ---------------------------------------------------

  return (
    <div className="career-tracker-container">
      <h3 className="section-title">📈 Career & Learning Tracker</h3>

      {/* Add Task */}
      <div className="input-area">
        <input
          type="text"
          placeholder="Add your own task…"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button onClick={addTask}>+ Add Task</button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-row" key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <span>{task.task_name}</span>

            <button
              className="delete-task-btn"
              onClick={() => deleteTask(task.id)}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      {/* Save Day */}
      <button className="push-btn" onClick={pushToGraph}>
        Lock Today & Push to Graph 🚀
      </button>

      {/* Graph */}
      <div className="progress-graph">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} domain={[0, tasks.length]} />
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

      {/* Streak */}
      <div className="dream-meter">
        <p>Streak: {streak} days</p>
        <div className="meter-bar">
          <div
            className="meter-fill"
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Career Plan Creator */}
      <h2 className="plan-title">✨ Create Your Career Plan</h2>

      <input
        className="input-box"
        type="text"
        placeholder="Plan Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="input-box"
        placeholder="Describe your main career goal..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <h3 className="step-heading">🧩 Steps</h3>

      {steps.map((step, index) => (
        <div key={index} className="step-row">
          <textarea
            value={step}
            onChange={(e) => updateStep(index, e.target.value)}
            placeholder={`Step ${index + 1}`}
          />
          <button className="remove-btn" onClick={() => removeStep(index)}>
            ✖
          </button>
        </div>
      ))}

      <button className="add-step-btn" onClick={addStep}>
        + Add Step
      </button>

      <button className="save-plan-btn" onClick={saveCareerPlan}>
        Save Plan
      </button>
    </div>
  );
}
