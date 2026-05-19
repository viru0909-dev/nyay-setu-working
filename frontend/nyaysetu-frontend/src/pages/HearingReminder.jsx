import { useEffect, useState } from "react";
import axios from "axios";

function HearingReminder() {
    const [formData, setFormData] = useState({
        caseTitle: "",
        courtName: "",
        hearingDate: "",
        reminderMessage: ""
    });

    const [reminders, setReminders] = useState([]);

    // Fetch all reminders
    const fetchReminders = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8081/api/hearing-reminders"
            );
            setReminders(response.data);
        } catch (error) {
            console.error("Error fetching reminders:", error);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                "http://localhost:8081/api/hearing-reminders",
                formData
            );

            alert("Reminder saved successfully!");

            fetchReminders();

            setFormData({
                caseTitle: "",
                courtName: "",
                hearingDate: "",
                reminderMessage: ""
            });

        } catch (error) {
            console.error("Error saving reminder:", error);
            alert("Failed to save reminder");
        }
    };

    return (
        <div style={{ padding: "30px", fontFamily: "Arial" }}>
            <h2>📅 Hearing Reminder System</h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    name="caseTitle"
                    placeholder="Case Title"
                    value={formData.caseTitle}
                    onChange={handleChange}
                    required
                    style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
                />

                <input
                    type="text"
                    name="courtName"
                    placeholder="Court Name"
                    value={formData.courtName}
                    onChange={handleChange}
                    required
                    style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
                />

                <input
                    type="datetime-local"
                    name="hearingDate"
                    value={formData.hearingDate}
                    onChange={handleChange}
                    required
                    style={{ display: "block", margin: "10px 0", padding: "8px" }}
                />

                <textarea
                    name="reminderMessage"
                    placeholder="Reminder Message"
                    value={formData.reminderMessage}
                    onChange={handleChange}
                    style={{ display: "block", margin: "10px 0", padding: "8px", width: "300px" }}
                />

                <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
                    Save Reminder
                </button>
            </form>

            <hr />

            {/* LIST */}
            <h3>📌 Upcoming Hearings</h3>

            {reminders.length === 0 ? (
                <p>No reminders found.</p>
            ) : (
                reminders.map((reminder) => (
                    <div
                        key={reminder.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "8px"
                        }}
                    >
                        <h4>{reminder.caseTitle}</h4>
                        <p><b>Court:</b> {reminder.courtName}</p>
                        <p><b>Hearing Date:</b> {reminder.hearingDate}</p>
                        <p><b>Message:</b> {reminder.reminderMessage}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default HearingReminder;