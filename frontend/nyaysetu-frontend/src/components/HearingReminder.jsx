import React, { useState } from "react";

const HearingReminder = () => {
  const [hearingTitle, setHearingTitle] = useState("");
  const [hearingTime, setHearingTime] = useState("");

  const requestPermission = async () => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
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
      // Browser notification
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("⚖️ Hearing Reminder", {
          body: `${hearingTitle} is scheduled now.`,
        });
      }

      // Audio alert
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
      );

      audio.play().catch((err) => {
        console.log("Audio blocked:", err);
      });
    }, delay);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#111827",
          padding: "30px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
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
            padding: "12px",
            marginBottom: "15px",
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
            border: "none",
            borderRadius: "8px",
            background: "#6C63FF",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Set Hearing Reminder
        </button>
      </div>
    </div>
  );
};

export default HearingReminder;