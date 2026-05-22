import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, AlertTriangle, Video, FileText, Download, 
  Trash2, Award, Star, Loader2, ExternalLink, HelpCircle 
} from 'lucide-react';
import { consultationAPI } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

export default function LitigantConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Cancellation state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [page]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const res = await consultationAPI.getMyConsultations(page, 10);
      setConsultations(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error loading consultations:", err);
      toast.error("Failed to load your scheduled consultations.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation!");
      return;
    }

    try {
      setSubmittingCancel(true);
      await consultationAPI.cancelConsultation(cancellingId, cancelReason);
      
      // Try to trigger refund if applicable
      const item = consultations.find(c => c.id === cancellingId);
      if (item?.payment?.id) {
        await consultationAPI.refundPayment(item.payment.id, cancelReason);
        toast.success("Consultation cancelled. Fee refunded to original card!");
      } else {
        toast.success("Consultation cancelled successfully.");
      }

      setCancellingId(null);
      setCancelReason('');
      loadConsultations();
    } catch (err) {
      console.error("Cancellation error:", err);
      toast.error(err.response?.data?.error || "Could not cancel consultation appointment.");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    if (!paymentId) return;
    try {
      toast.loading("Generating PDF Invoice...", { id: "invoice" });
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const downloadUrl = `${backendUrl}/api/consultations/payment/${paymentId}/invoice`;
      
      const res = await axios.get(downloadUrl, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_Payment_${paymentId}.pdf`;
      link.click();
      
      toast.success("Invoice downloaded!", { id: "invoice" });
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Could not download invoice PDF", { id: "invoice" });
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <Toaster />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            My Consultations
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Manage upcoming video meetings, access invoices, and rate your lawyers
          </p>
        </div>
        
        <button
          onClick={() => navigate('/litigant/find-lawyer')}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Calendar size={15} /> Book Consultation
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 size={36} style={{ color: 'var(--color-primary)', animation: 'spin 1.2s linear infinite' }} />
        </div>
      ) : consultations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', ...glassStyle }}>
          <Video size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-main)' }}>No Consultations Scheduled</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You have no legal appointments. Connect with a lawyer to get professional guidance.</p>
          <button
            onClick={() => navigate('/litigant/find-lawyer')}
            style={{ padding: '0.6rem 1.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
          >
            Find a Lawyer
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {consultations.map(c => {
            const colors = getStatusColor(c.status);
            return (
              <div key={c.id} style={{ ...glassStyle, padding: '1.5rem', borderLeft: `5px solid ${colors.text}` }}>
                
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      Consultation with {c.lawyer?.name || 'Advocate'}
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '700' }}>
                      {c.lawyer?.specialization || 'Legal Specialist'}
                    </p>
                  </div>
                  
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '20px',
                    background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`
                  }}>
                    {c.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                    <span><b>Date:</b> {new Date(c.scheduledTime).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                    <span><b>Time:</b> {new Date(c.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({c.durationMinutes}m)</span>
                  </div>
                  {c.payment && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={14} style={{ color: 'var(--color-primary)' }} />
                      <span><b>Amount Paid:</b> ₹{c.payment.amount?.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Litigant Notes */}
                <div style={{ background: 'var(--bg-glass-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.82rem', border: 'var(--border-glass)' }}>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontStyle: 'italic' }}>
                    <b>Case Note:</b> "{c.notes || 'No description provided.'}"
                  </p>
                </div>

                {/* Zoom Link (If zoom meeting exists and status is CONFIRMED) */}
                {c.status === 'CONFIRMED' && c.zoomMeetingUrl && (
                  <div style={{ background: 'rgba(46, 204, 113, 0.05)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
                    <span style={{ color: '#27ae60' }}>📹 Zoom Meeting Room is ready and scheduled.</span>
                    <a href={c.zoomMeetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#27ae60', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      Open Zoom <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--bg-glass-subtle)', paddingTop: '1rem' }}>
                  {c.status === 'CONFIRMED' && (
                    <button
                      onClick={() => navigate(`/litigant/consultation/${c.id}`)}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none',
                        background: 'var(--color-primary)', color: 'white', fontWeight: '700',
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      <Video size={14} /> Join Consultation Room
                    </button>
                  )}

                  {c.payment?.id && c.payment?.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleDownloadInvoice(c.payment.id)}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: '6px', border: '1px solid var(--border-glass)',
                        background: 'var(--bg-glass)', color: 'var(--text-main)', fontWeight: '600',
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      <Download size={14} /> Invoice PDF
                    </button>
                  )}

                  {c.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setCancellingId(c.id)}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: '6px', border: '1px solid #ef5350',
                        background: 'transparent', color: '#ef5350', fontWeight: '600',
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                        marginLeft: 'auto'
                      }}
                    >
                      <Trash2 size={14} /> Cancel Appointment
                    </button>
                  )}

                  {c.status === 'COMPLETED' && (
                    <button
                      onClick={() => navigate(`/litigant/feedback?consultationId=${c.id}`)}
                      style={{
                        padding: '0.5rem 1.2rem', borderRadius: '6px', border: 'none',
                        background: '#f59e0b', color: 'white', fontWeight: '700',
                        fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      <Star size={14} /> Rate Consultation
                    </button>
                  )}

                  {c.status === 'CANCELLED' && c.cancellationReason && (
                    <div style={{ color: '#c62828', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertTriangle size={14} /> Cancelled: "{c.cancellationReason}" (Refund Settled)
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

      {/* Cancellation Modal Dialog */}
      {cancellingId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(3px)'
        }}>
          <div style={{ ...glassStyle, padding: '2rem', maxWidth: '450px', width: '90%' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.5rem' }}>Cancel Appointment</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              Are you sure you want to cancel this booking? If you cancel, a full refund of your consultation fee will be credited back to your card.
            </p>
            
            <form onSubmit={handleCancelSubmit}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>Reason for cancellation *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g., Scheduling conflict, issue resolved privately, etc."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{
                  width: '100%', background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '6px',
                  padding: '0.5rem 0.75rem', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none',
                  boxSizing: 'border-box', marginBottom: '1.5rem', resize: 'none'
                }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCancellingId(null);
                    setCancelReason('');
                  }}
                  style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  style={{ padding: '0.5rem 1.2rem', background: '#ef5350', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700' }}
                >
                  {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
