import React from "react";
import HearingReminder from "./components/HearingReminder";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0F172A",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        ⚖️ NyaySetu
      </h1>

      <p
        style={{
          color: "#CBD5E1",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        Smart Hearing Reminder & Notification System
      </p>

      <HearingReminder />
    </div>
  );
}

export default App;