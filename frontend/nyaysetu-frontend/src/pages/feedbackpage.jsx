import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Send, CheckCircle, MessageSquare, Bug, Lightbulb, Info } from 'lucide-react';

const CATEGORIES = [
  { value: 'Bug', label: 'Bug Report', icon: Bug, color: '#c62828', bg: '#fce8e6' },
  { value: 'Suggestion', label: 'Suggestion', icon: Lightbulb, color: '#e65100', bg: '#fff3e0' },
  { value: 'General', label: 'General', icon: Info, color: '#1565c0', bg: '#e3f2fd' },
];

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const glassStyle = {
    background: 'var(--bg-glass-strong)',
    backdropFilter: 'var(--glass-blur)',
    border: 'var(--border-glass-strong)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--shadow-glass-strong)',
  };

  const handleSubmit = async () => {
    if (rating === 0) { alert('Please select a rating!'); return; }
    if (!category) { alert('Please select a category!'); return; }
    if (!message.trim()) { alert('Please write your feedback!'); return; }

    setSubmitting(true);
    // TODO: wire up to backend API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ ...glassStyle, padding: '3rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#e8f5e9', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} color="#2e7d32" />
          </div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            Thank You! 🎉
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Your feedback has been submitted successfully!
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            We use your input to keep improving NyaySetu for everyone.
          </p>

          <div style={{ background: 'var(--bg-glass)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={24} fill={s <= rating ? '#f59e0b' : 'transparent'} color={s <= rating ? '#f59e0b' : 'var(--text-secondary)'} />
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              {RATING_LABELS[rating]} · {category}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 2rem',
              background: 'var(--color-primary)',
              color: 'white', border: 'none',
              borderRadius: '10px', cursor: 'pointer',
              fontSize: '1rem', fontWeight: '600'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            Share Feedback
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Help us improve NyaySetu for everyone
          </p>
        </div>
      </div>

      {/* Star Rating */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.25rem', fontSize: '1rem', fontWeight: '700' }}>
          How would you rate your experience? *
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '0.75rem' }}>
          {[1,2,3,4,5].map(star => (
            <Star
              key={star}
              size={40}
              fill={(hoveredRating || rating) >= star ? '#f59e0b' : 'transparent'}
              color={(hoveredRating || rating) >= star ? '#f59e0b' : 'var(--text-secondary)'}
              style={{ cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        {(hoveredRating || rating) > 0 && (
          <p style={{ textAlign: 'center', color: '#f59e0b', fontWeight: '600', fontSize: '1rem', margin: 0 }}>
            {RATING_LABELS[hoveredRating || rating]}
          </p>
        )}
      </div>

      {/* Category */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
          Category *
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(({ value, label, icon: Icon, color, bg }) => {
            const isSelected = category === value;
            return (
              <button
                key={value}
                onClick={() => setCategory(value)}
                style={{
                  flex: 1, minWidth: '120px', padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  border: `2px solid ${isSelected ? color : 'var(--border-glass)'}`,
                  background: isSelected ? bg : 'transparent',
                  color: isSelected ? color : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.9rem',
                  fontWeight: '600', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', transition: 'all 0.2s'
                }}
              >
                <Icon size={16} /> {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
          Your Feedback *
        </h3>
        <textarea
          placeholder="Describe your experience, report an issue, or share a suggestion..."
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 500))}
          rows={5}
          style={{
            width: '100%',
            background: 'var(--bg-glass)',
            border: 'var(--border-glass)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right', margin: '0.5rem 0 0' }}>
          {message.length}/500
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || !category || !message.trim() || submitting}
        style={{
          width: '100%', padding: '1rem',
          background: (rating === 0 || !category || !message.trim()) ? 'var(--bg-glass-subtle)' : 'var(--color-primary)',
          color: (rating === 0 || !category || !message.trim()) ? 'var(--text-secondary)' : 'white',
          border: 'none', borderRadius: '12px',
          cursor: (rating === 0 || !category || !message.trim()) ? 'not-allowed' : 'pointer',
          fontSize: '1rem', fontWeight: '700',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        {submitting ? <>⏳ Submitting...</> : <><Send size={18} /> Submit Feedback</>}
      </button>

    </div>
  );
}