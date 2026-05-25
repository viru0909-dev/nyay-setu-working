import React, { useState } from "react";

const HearingReminder = () => {
  const [hearingTitle, setHearingTitle] = useState("");
  const [hearingTime, setHearingTime] = useState("");

  const requestPermission = async () => {
    if (Notification.permission !== "granted") {
      await Notification.requestPermission();
    }
  };

  const scheduleReminder = async () => {
    if (!hearingTitle || !hearingTime) {
      alert("Please enter hearing details.");
      return;
    }

    await requestPermission();

    const selectedTime = new Date(hearingTime).getTime();
    const currentTime = new Date().getTime();

    const delay = selectedTime - currentTime;

    if (delay <= 0) {
      alert("Please select a future date and time.");
      return;
    }

    alert("Reminder has been scheduled successfully!");

    setTimeout(() => {
      new Notification("⚖️ Upcoming Hearing Reminder", {
        body: `${hearingTitle} is scheduled now.`,
      });
    }, delay);
  };

  return (
    <div
      style={{
        background: "#111827",
        padding: "24px",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "450px",
        margin: "20px auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Smart Hearing Reminder
      </h2>

      <input
        type="text"
        placeholder="Enter Hearing Title"
        value={hearingTitle}
        onChange={(e) => setHearingTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "16px",
          borderRadius: "8px",
          border: "1px solid #374151",
          background: "#1F2937",
          color: "white",
        }}
      />

      <input
        type="datetime-local"
        value={hearingTime}
        onChange={(e) => setHearingTime(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #374151",
          background: "#1F2937",
          color: "white",
        }}
      />

      <button
        onClick={scheduleReminder}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          background: "#6C63FF",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "0.3s",
        }}
      >
        Set Hearing Reminder
      </button>
    </div>
  );
};

export default HearingReminder;