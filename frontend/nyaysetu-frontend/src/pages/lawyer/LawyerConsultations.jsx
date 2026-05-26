import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, Video, User, Plus, CheckCircle, 
  Trash2, Loader2, FileText, ChevronRight, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { consultationAPI } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const standardHours = [
  { start: '09:00:00', end: '10:00:00', label: '09:00 AM - 10:00 AM' },
  { start: '10:00:00', end: '11:00:00', label: '10:00 AM - 11:00 AM' },
  { start: '11:00:00', end: '12:00:00', label: '11:00 AM - 12:00 PM' },
  { start: '12:00:00', end: '13:00:00', label: '12:00 PM - 01:00 PM' },
  { start: '14:00:00', end: '15:00:00', label: '02:00 PM - 03:00 PM' },
  { start: '15:00:00', end: '16:00:00', label: '03:00 PM - 04:00 PM' },
  { start: '16:00:00', end: '17:00:00', label: '04:00 PM - 05:00 PM' }
];

export default function LawyerConsultations() {
  const navigate = useNavigate();
  
  // Booked schedule state
  const [consultations, setConsultations] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // New slot builder state
  const [slotDate, setSlotDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [selectedHours, setSelectedHours] = useState([]);
  const [submittingSlots, setSubmittingSlots] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [page]);

  const loadConsultations = async () => {
    try {
      setLoadingSchedule(true);
      const res = await consultationAPI.getLawyerConsultations(page, 10);
      setConsultations(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error loading lawyer consultations:", err);
      toast.error("Failed to fetch your booked consultations list.");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleHourToggle = (hourStart) => {
    if (selectedHours.includes(hourStart)) {
      setSelectedHours(prev => prev.filter(h => h !== hourStart));
    } else {
      setSelectedHours(prev => [...prev, hourStart]);
    }
  };

  const handlePublishSlots = async (e) => {
    e.preventDefault();
    if (selectedHours.length === 0) {
      toast.error("Please select at least one hour block!");
      return;
    }

    try {
      setSubmittingSlots(true);
      // Format selected hours to LocalDateTime format matching parser: YYYY-MM-DDTHH:mm:ss
      const slotsPayload = selectedHours.map(hourStart => {
        const item = standardHours.find(h => h.start === hourStart);
        return {
          startTime: `${slotDate}T${item.start}`,
          endTime: `${slotDate}T${item.end}`
        };
      });

      await consultationAPI.addConsultationSlots(slotsPayload);
      toast.success(`Successfully published ${selectedHours.length} availability slots!`);
      setSelectedHours([]);
    } catch (err) {
      console.error("Publish slots error:", err);
      toast.error(err.response?.data?.error || "Failed to publish slots to server.");
    } finally {
      setSubmittingSlots(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff9db', text: '#f08c00', border: '#ffe066' };
      case 'CONFIRMED': return { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' };
      case 'COMPLETED': return { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' };
      case 'CANCELLED': return { bg: '#fce8e6', text: '#c62828', border: '#ef9a9a' };
      default: return { bg: 'var(--bg-glass-subtle)', text: 'var(--text-secondary)', border: 'var(--border-glass)' };
    }
  };

  const glassStyle = {
    background: 'var(--bg-glass-strong)',
    backdropFilter: 'var(--glass-blur)',
    border: 'var(--border-glass-strong)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--shadow-glass-strong)'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Toaster />

      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
          Virtual consultation Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          Publish your availability calendar, manage booked litigant cases, and host Zoom/WebRTC meetings
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Booked Consultations List */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Upcoming Appointments</h2>
          
          {loadingSchedule ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={32} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : consultations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', ...glassStyle }}>
              <CalendarIcon size={44} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: '600' }}>No consultations booked yet</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Publish available slots to let litigants schedule meetings with you.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {consultations.map(c => {
                const colors = getStatusColor(c.status);
                return (
                  <div key={c.id} style={{ ...glassStyle, padding: '1.25rem', borderLeft: `5px solid ${colors.text}` }}>
                    
                    {/* Header line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} style={{ color: 'var(--color-primary)' }} />
                        {c.clientName || 'Litigant Client'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '15px',
                        background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                      }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span><b>Date:</b> {new Date(c.scheduledTime).toLocaleDateString()}</span>
                      <span><b>Time:</b> {new Date(c.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({c.durationMinutes}m)</span>
                      <span><b>Ref ID:</b> NS-C-{c.id}</span>
                    </div>

                    {/* Description */}
                    <p style={{ margin: '0 0 1rem', background: 'var(--bg-glass-subtle)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-main)', border: 'var(--border-glass)' }}>
                      <b>Client Note:</b> "{c.notes || 'No description provided.'}"
                    </p>

                    {/* Zoom details */}
                    {c.status === 'CONFIRMED' && c.zoomMeetingUrl && (
                      <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.65rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <span style={{ color: '#2563eb' }}>📹 Zoom Tele-Law conference ready.</span>
                        <a href={c.zoomMeetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          Start Meeting <ExternalLink size={12} />
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--bg-glass-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                      {c.status === 'CONFIRMED' && (
                        <button
                          onClick={() => navigate(`/lawyer/consultation/${c.id}`)}
                          style={{
                            padding: '0.45rem 1rem', background: 'var(--color-primary)', color: 'white',
                            border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.25rem'
                          }}
                        >
                          <Video size={12} /> Enter Secure Consultation Room
                        </button>
                      )}

                      {c.status === 'COMPLETED' && c.lawyerRating && (
                        <div style={{ color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          Client Rating: {c.lawyerRating}★ {c.clientFeedback && `("${c.clientFeedback}")`}
                        </div>
                      )}

                      {c.status === 'CANCELLED' && (
                        <div style={{ color: '#c62828' }}>
                          Status: Appointment Cancelled
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-main)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    Prev
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
                  <button 
                    disabled={page === totalPages - 1} 
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-main)', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Slot Publisher */}
        <div style={{ ...glassStyle, padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} style={{ color: 'var(--color-primary)' }} /> Set Availability Slots
          </h3>

          <form onSubmit={handlePublishSlots}>
            {/* Date Pick */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.3rem' }}>Select Date</label>
              <input 
                type="date"
                required
                value={slotDate}
                onChange={e => setSlotDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={{
                  width: '100%', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '6px',
                  padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* List hours */}
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Choose Timeslots</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
              {standardHours.map(hour => {
                const isSelected = selectedHours.includes(hour.start);
                return (
                  <button
                    key={hour.start}
                    type="button"
                    onClick={() => handleHourToggle(hour.start)}
                    style={{
                      padding: '0.55rem 0.75rem', borderRadius: '6px',
                      border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--border-glass)',
                      background: isSelected ? 'rgba(30, 42, 68, 0.06)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', textAlign: 'left',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span>{hour.label}</span>
                    {isSelected && <CheckCircle size={14} style={{ color: 'var(--color-primary)' }} />}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={submittingSlots || selectedHours.length === 0}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: '8px', border: 'none',
                background: selectedHours.length === 0 ? 'var(--bg-glass-subtle)' : 'var(--color-primary)',
                color: selectedHours.length === 0 ? 'var(--text-secondary)' : 'white',
                fontWeight: '700', fontSize: '0.85rem', cursor: selectedHours.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}
            >
              {submittingSlots ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Publishing slots...
                </>
              ) : (
                `Publish ${selectedHours.length} slots`
              )}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.4rem', background: '#e3f2fd', color: '#1565c0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.72rem', marginTop: '1.25rem', border: '1px solid #90caf9' }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>Litigants will immediately see your published hours on the search marketplace directory.</span>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
