import React, { useState } from "react";
import "./FeedbackForm.css";

const CATEGORIES = ["Suggestion", "Bug Report", "General Review", "Feature Request"];

const FeedbackForm = () => {
  const [form, setForm] = useState({ name: "", email: "", category: "", rating: 0, message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.category) e.category = "Please select a category.";
    if (!form.message.trim()) e.message = "Feedback message is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", category: "", rating: 0, message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2 className="feedback-title">Share Your Feedback</h2>
        <p className="feedback-subtitle">Help us improve NyaySetu — your input matters.</p>
        {status === "success" && <div className="alert alert-success">✅ Feedback submitted successfully!</div>}
        {status === "error" && <div className="alert alert-error">❌ Something went wrong. Please try again.</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Name (Optional)</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="form-input" />
          </div>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={`form-input ${errors.email ? "input-error" : ""}`} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className={`form-input ${errors.category ? "input-error" : ""}`}>
              <option value="">-- Select Category --</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label>Rating (Optional)</label>
            <div className="star-rating">
              {[1,2,3,4,5].map(s => (
                <span key={s} onClick={() => setForm({...form, rating: s})} className={`star ${form.rating >= s ? "star-filled" : ""}`}>★</span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Your Feedback *</label>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your feedback, suggestion, or bug report here..." rows={5} className={`form-input ${errors.message ? "input-error" : ""}`} />
            {errors.message && <span className="error-text">{errors.message}</span>}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Submitting..." : "Submit Feedback"}</button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
