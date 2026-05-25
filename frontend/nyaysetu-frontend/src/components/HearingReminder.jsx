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

    alert("Reminder scheduled successfully!");

    setTimeout(() => {

      // Play alarm sound
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      );

      audio.play();

      // Show browser notification
      new Notification("⚖️ Upcoming Hearing Reminder", {
        body: `${hearingTitle} is scheduled now.`,
      });

    }, delay);
  };

  return (
    <div
      style={{
        background: "#111827",
        padding: "30px",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "500px",
        margin: "20px auto",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      }}
    >
      <h1
        style={{
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "25px",
          fontSize: "40px",
        }}
      >
        Smart Hearing Reminder
      </h1>

      <input
        type="text"
        placeholder="Enter Hearing Title"
        value={hearingTitle}
        onChange={(e) => setHearingTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "18px",
          borderRadius: "10px",
          border: "1px solid #374151",
          background: "#1F2937",
          color: "white",
          fontSize: "16px",
        }}
      />

      <input
        type="datetime-local"
        value={hearingTime}
        onChange={(e) => setHearingTime(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "22px",
          borderRadius: "10px",
          border: "1px solid #374151",
          background: "#1F2937",
          color: "white",
          fontSize: "16px",
        }}
      />

      <button
        onClick={scheduleReminder}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "none",
          background: "#6C63FF",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
          transition: "0.3s ease",
        }}
      >
        Set Hearing Reminder
      </button>
    </div>
  );
};

export default HearingReminder;