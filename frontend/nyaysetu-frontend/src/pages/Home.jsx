import React from "react";
import HearingReminder from "../components/HearingReminder";

const Home = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1120",
        padding: "40px",
        color: "white",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "42px",
        }}
      >
        NyaySetu Dashboard
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: "40px",
          color: "#9CA3AF",
        }}
      >
        Manage hearings, legal schedules, and smart reminders.
      </p>

      <HearingReminder />
    </div>
  );
};

export default Home;