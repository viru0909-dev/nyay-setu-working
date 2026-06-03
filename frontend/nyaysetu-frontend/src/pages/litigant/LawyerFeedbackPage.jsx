import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';

const mockLawyer = {
  id: 1,
  name: "Adv. Rajesh Kumar",
  specialization: "Criminal Law",
  caseTitle: "Property Dispute Case #2024",
  avatar: "R"
};

export default function LawyerFeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [recommend, setRecommend] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair', 
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating!');
      return;
    }
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  const glassStyle = {
    background: 'var(--bg-glass-strong)',
    backdropFilter: 'var(--glass-blur)',
    border: 'var(--border-glass-strong)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--shadow-glass-strong)'
  };

  // Success Screen
  if (submitted) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ ...glassStyle, padding: '3rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#e8f5e9', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={48} color="#2e7d32" />
          </div>

          <h2 style={{
            color: 'var(--text-main)',
            fontSize: '1.8rem',
            fontWeight: '800',
            marginBottom: '0.75rem'
          }}>
            Thank You! 🎉
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            marginBottom: '0.5rem'
          }}>
            Your feedback has been submitted successfully!
          </p>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '2rem'
          }}>
            Your review helps other litigants choose the right lawyer.
          </p>

          {/* Rating Summary */}
          <div style={{
            background: 'var(--bg-glass)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '0.5rem' }}>
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  size={24}
                  fill={s <= rating ? '#f59e0b' : 'transparent'}
                  color={s <= rating ? '#f59e0b' : 'var(--text-secondary)'}
                />
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              You rated {ratingLabels[rating]}
            </p>
          </div>

          <button
            onClick={() => navigate('/litigant/chat')}
            style={{
              padding: '0.75rem 2rem',
              background: 'var(--color-primary)',
              color: 'white', border: 'none',
              borderRadius: '10px', cursor: 'pointer',
              fontSize: '1rem', fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-main)', cursor: 'pointer'
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{
            color: 'var(--text-main)',
            fontSize: '1.8rem',
            fontWeight: '800', margin: 0
          }}>
            Rate Your Lawyer
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            margin: 0, fontSize: '0.9rem'
          }}>
            Share your experience to help others
          </p>
        </div>
      </div>

      {/* Lawyer Info Card */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: '700'
          }}>
            {mockLawyer.avatar}
          </div>
          <div>
            <h3 style={{
              color: 'var(--text-main)',
              margin: 0, fontSize: '1.1rem',
              fontWeight: '700'
            }}>
              {mockLawyer.name}
            </h3>
            <p style={{
              color: 'var(--color-primary)',
              margin: 0, fontSize: '0.85rem'
            }}>
              {mockLawyer.specialization}
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              margin: 0, fontSize: '0.8rem'
            }}>
              📁 {mockLawyer.caseTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
          fontSize: '1rem', fontWeight: '700'
        }}>
          Overall Rating *
        </h3>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px', marginBottom: '0.75rem'
        }}>
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
          <p style={{
            textAlign: 'center',
            color: '#f59e0b',
            fontWeight: '600',
            fontSize: '1rem',
            margin: 0
          }}>
            {ratingLabels[hoveredRating || rating]}
          </p>
        )}
      </div>

      {/* Written Review */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{
          color: 'var(--text-main)',
          marginBottom: '1rem',
          fontSize: '1rem', fontWeight: '700'
        }}>
          Write a Review
        </h3>
        <textarea
          placeholder="Share your experience with this lawyer... How was the communication? Was the case handled professionally?"
          value={review}
          onChange={e => setReview(e.target.value)}
          rows={4}
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
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.8rem',
          textAlign: 'right',
          margin: '0.5rem 0 0'
        }}>
          {review.length}/500
        </p>
      </div>

      {/* Recommend */}
      <div style={{ ...glassStyle, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{
          color: 'var(--text-main)',
          marginBottom: '1rem',
          fontSize: '1rem', fontWeight: '700'
        }}>
          Would you recommend this lawyer?
        </h3>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setRecommend(true)}
            style={{
              flex: 1, padding: '0.85rem',
              borderRadius: '10px',
              border: `2px solid ${recommend === true ? '#2e7d32' : 'var(--border-glass)'}`,
              background: recommend === true ? '#e8f5e9' : 'transparent',
              color: recommend === true ? '#2e7d32' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: '600', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <ThumbsUp size={18} /> Yes, Recommend
          </button>

          <button
            onClick={() => setRecommend(false)}
            style={{
              flex: 1, padding: '0.85rem',
              borderRadius: '10px',
              border: `2px solid ${recommend === false ? '#c62828' : 'var(--border-glass)'}`,
              background: recommend === false ? '#fce8e6' : 'transparent',
              color: recommend === false ? '#c62828' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.95rem',
              fontWeight: '600', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <ThumbsDown size={18} /> Not Really
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        style={{
          width: '100%', padding: '1rem',
          background: rating === 0 ? 'var(--bg-glass-subtle)' : 'var(--color-primary)',
          color: rating === 0 ? 'var(--text-secondary)' : 'white',
          border: 'none', borderRadius: '12px',
          cursor: rating === 0 ? 'not-allowed' : 'pointer',
          fontSize: '1rem', fontWeight: '700',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        {submitting ? (
          <>⏳ Submitting...</>
        ) : (
          <><Send size={18} /> Submit Feedback</>
        )}
      </button>

    </div>
  );
}