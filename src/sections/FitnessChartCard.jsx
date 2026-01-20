import React from "react";
import "./fitness-chart-card.css";

const FitnessChartCard = ({ title, emoji, children }) => {
  return (
    <div className="fitness-chart-card">
      <h3 className="fitness-chart-title">
        {title} <span className="fitness-chart-emoji">{emoji}</span>
      </h3>

      <div className="fitness-chart-content">
        {children}
      </div>
    </div>
  );
};

export default FitnessChartCard;
