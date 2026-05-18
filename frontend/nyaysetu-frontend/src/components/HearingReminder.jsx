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

    const fetchReminders = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8081/api/hearing-reminders"
            );

            setReminders(response.data);

        } catch (error) {
            console.error("Error fetching reminders", error);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await axios.post(
                "http://localhost:8081/api/hearing-reminders",
                formData
            );

            fetchReminders();

            setFormData({
                caseTitle: "",
                courtName: "",
                hearingDate: "",
                reminderMessage: ""
            });

        } catch (error) {
            console.error("Error saving reminder", error);
        }
    };

    return (
        <div style={{ padding: "30px" }}>

            <h2>Hearing Reminder System</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="caseTitle"
                    placeholder="Case Title"
                    value={formData.caseTitle}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="text"
                    name="courtName"
                    placeholder="Court Name"
                    value={formData.courtName}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="datetime-local"
                    name="hearingDate"
                    value={formData.hearingDate}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <textarea
                    name="reminderMessage"
                    placeholder="Reminder Message"
                    value={formData.reminderMessage}
                    onChange={handleChange}
                />

                <br /><br />

                <button type="submit">
                    Save Reminder
                </button>

            </form>

            <hr />

            <h3>Upcoming Hearings</h3>

            {
                reminders.map((reminder) => (
                    <div
                        key={reminder.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px"
                        }}
                    >
                        <h4>{reminder.caseTitle}</h4>

                        <p>
                            <strong>Court:</strong>
                            {" "}
                            {reminder.courtName}
                        </p>

                        <p>
                            <strong>Hearing Date:</strong>
                            {" "}
                            {reminder.hearingDate}
                        </p>

                        <p>
                            <strong>Message:</strong>
                            {" "}
                            {reminder.reminderMessage}
                        </p>

                    </div>
                ))
            }

        </div>
    );
}

export default HearingReminder;