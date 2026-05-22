import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Star, MapPin, Briefcase, ArrowLeft, Loader2, Calendar, 
  Clock, Shield, CreditCard, ChevronRight, CheckCircle, Download, ExternalLink 
} from 'lucide-react';
import { consultationAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const specializations = [
  'All', 'Criminal Law', 'Family Law',
  'Civil Law', 'Corporate Law'
];

export default function FindLawyerPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Marketplace list state
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Booking modal/process state
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Slot, 2: Notes & Card, 3: Success
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Booking form state
  const [notes, setNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Card input states
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Completed booking details
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Fetch lawyers on load
  useEffect(() => {
    async function loadLawyers() {
      try {
        setLoading(true);
        const res = await consultationAPI.getAllLawyers();
        setLawyers(res.data?.content || []);
      } catch (err) {
        console.error("Error loading lawyers:", err);
        toast.error("Failed to load lawyers from marketplace");
      } finally {
        setLoading(false);
      }
    }
    loadLawyers();
  }, []);

  // Fetch slots for selected lawyer
  useEffect(() => {
    if (!selectedLawyer) return;
    
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        
        // Generate from/to range (today to 7 days later) in format YYYY-MM-DDTHH:mm:ss
        const fromDate = new Date();
        const toDate = new Date();
        toDate.setDate(toDate.getDate() + 7);
        
        const fromStr = fromDate.toISOString().slice(0, 19);
        const toStr = toDate.toISOString().slice(0, 19);
        
        const res = await consultationAPI.getAvailableSlots(selectedLawyer.id, fromStr, toStr);
        setAvailableSlots(res.data || []);
        
        // Set first available date as default
        if (res.data && res.data.length > 0) {
          const datesObj = {};
          res.data.forEach(s => {
            const dateStr = new Date(s.startTime).toLocaleDateString();
            datesObj[dateStr] = true;
          });
          const datesArr = Object.keys(datesObj);
          if (datesArr.length > 0) {
            setSelectedDateStr(datesArr[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        toast.error("Could not fetch available availability slots");
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedLawyer]);

  // Handle slot booking & payment
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error("Please choose a consultation time slot!");
      return;
    }
    if (!notes.trim()) {
      toast.error("Please provide case details or reason for consultation!");
      return;
    }
    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
      toast.error("Please fill in valid card credentials!");
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Step A: Book consultation
      const bookingData = {
        lawyerId: selectedLawyer.id,
        scheduledTime: selectedSlot.startTime,
        durationMinutes: parseInt(durationMinutes),
        notes: notes
      };
      
      const bookRes = await consultationAPI.bookConsultation(bookingData);
      const consultationDto = bookRes.data;
      
      // Step B: Create payment intent on backend
      const subtotal = selectedLawyer.hourlyRate * (durationMinutes / 60);
      const tax = subtotal * 0.18;
      const totalAmount = subtotal + tax;

      const intentRes = await consultationAPI.createPaymentIntent({
        consultationId: consultationDto.id,
        amount: totalAmount
      });
      const { paymentIntentId } = intentRes.data;

      // Step C: Trigger simulated Stripe webhook endpoint to process success
      // In a real application, the Stripe SDK completes this, and Stripe invokes the Webhook.
      // Here, we hit the webhook endpoint directly with a success event payload.
      await axios.post(`${consultationAPI.getAllLawyers.name ? 'http://localhost:8080' : ''}/api/consultations/payment/webhook`, {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentIntentId
          }
        }
      });

      // Refetch consultation detail to get the updated status, invoice, zoomMeetingUrl
      const finalRes = await consultationAPI.getConsultationDetails(consultationDto.id);
      
      setConfirmedBooking(finalRes.data);
      toast.success("Payment successful! Consultation booked!");
      setBookingStep(3);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.error || "Booking/Payment transaction failed.");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Download PDF Invoice
  const handleDownloadInvoice = async (paymentId) => {
    if (!paymentId) return;
    try {
      toast.loading("Generating PDF Invoice...", { id: "invoice" });
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const downloadUrl = `${backendUrl}/api/consultations/payment/${paymentId}/invoice`;
      
      // We can open the download URL in a new window or trigger download via axios blob
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

  // Filters logic
  const filtered = lawyers.filter(l => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.bio && l.bio.toLowerCase().includes(search.toLowerCase()));
    
    const matchFilter =
      filter === 'All' || 
      (l.specializations && l.specializations.some(s => s.toLowerCase().includes(filter.toLowerCase())));
      
    return matchSearch && matchFilter;
  });

  // Helper: group slots by date
  const getUniqueSlotDates = () => {
    const datesObj = {};
    availableSlots.forEach(s => {
      const dateStr = new Date(s.startTime).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short'
      });
      datesObj[dateStr] = new Date(s.startTime).toLocaleDateString();
    });
    return Object.entries(datesObj);
  };

  const getSlotsForSelectedDate = () => {
    return availableSlots.filter(s => {
      return new Date(s.startTime).toLocaleDateString() === selectedDateStr;
    });
  };

  const glassStyle = {
    background: 'var(--bg-glass-strong)',
    backdropFilter: 'var(--glass-blur)',
    border: 'var(--border-glass-strong)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--shadow-glass-strong)'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <Toaster />

      {/* Main Marketplace View */}
      {!selectedLawyer && (
        <>
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
                Virtual Lawyer Consultations
              </h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                Book on-demand video consultations with verified legal practitioners securely
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search by lawyer name or expertise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.75rem',
                borderRadius: '12px',
                border: 'var(--border-glass)',
                background: 'var(--bg-glass)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {specializations.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: '0.4rem 1.1rem',
                  borderRadius: '20px',
                  border: '1.5px solid var(--color-primary)',
                  cursor: 'pointer',
                  background: filter === s ? 'var(--color-primary)' : 'transparent',
                  color: filter === s ? 'white' : 'var(--color-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}>
                {s}
              </button>
            ))}
          </div>

          {/* Listing */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={36} style={{ color: 'var(--color-primary)', animation: 'spin 1.2s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', ...glassStyle }}>
              <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--text-main)' }}>No Lawyers Online</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filtered.map(lawyer => (
                <div key={lawyer.id} style={{ ...glassStyle, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between' }}>
                  <div>
                    {/* Top Section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800', flexShrink: 0
                      }}>
                        {lawyer.name?.[0] || 'L'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {lawyer.name}
                          {lawyer.verified && <span style={{ color: '#3b82f6', fontSize: '0.9rem' }} title="Verified Profile">🛡️</span>}
                        </h3>
                        <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: '700' }}>
                          {lawyer.specializations?.join(', ') || 'General Counsel'}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {lawyer.bio || "Verified legal attorney offering strategic consultations and representation across civil, criminal, and personal litigation."}
                    </p>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Briefcase size={14} style={{ color: 'var(--color-primary)' }} /> <b>{lawyer.yearsOfExperience || 5}+ Years</b> exp
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" /> <b>{lawyer.averageRating?.toFixed(1) || '5.0'}</b> ({lawyer.totalRatings || 0} reviews)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', gridColumn: '1 / -1' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: '800' }}>₹{lawyer.hourlyRate || 1000}</span> / hour consultation
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLawyer(lawyer);
                      setBookingStep(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: 'auto'
                    }}
                  >
                    Book Appointment <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Booking Wizard Drawer/Modal View */}
      {selectedLawyer && (
        <div style={{ ...glassStyle, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--bg-glass-subtle)', paddingBottom: '1rem' }}>
            <button 
              onClick={() => {
                setSelectedLawyer(null);
                setNotes('');
              }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '700' }}
            >
              <ArrowLeft size={16} /> Exit Booking
            </button>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: bookingStep === 1 ? '800' : '400', color: bookingStep === 1 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>1. Time Slot</span>
              <span style={{ fontWeight: bookingStep === 2 ? '800' : '400', color: bookingStep === 2 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>2. Secure Checkout</span>
              <span style={{ fontWeight: bookingStep === 3 ? '800' : '400', color: bookingStep === 3 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>3. Done</span>
            </div>
          </div>

          {/* STEP 1: Select Slot */}
          {bookingStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Select Consultation Slot</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Availability calendar for <b>{selectedLawyer.name}</b></p>
              
              {loadingSlots ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                  <Loader2 size={30} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : availableSlots.length === 0 ? (
                <div style={{ background: 'var(--bg-glass-subtle)', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>No upcoming slots found!</p>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This lawyer hasn't uploaded their availability calendar for the next 7 days.</p>
                </div>
              ) : (
                <>
                  {/* Date selection bar */}
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Choose Date</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                    {getUniqueSlotDates().map(([label, dateVal]) => (
                      <button
                        key={dateVal}
                        onClick={() => setSelectedDateStr(dateVal)}
                        style={{
                          flexShrink: 0,
                          padding: '0.6rem 1rem',
                          borderRadius: '8px',
                          border: selectedDateStr === dateVal ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                          background: selectedDateStr === dateVal ? 'rgba(30, 42, 68, 0.08)' : 'transparent',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Slots Grid */}
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Available Time (60-min sessions)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                    {getSlotsForSelectedDate().map(slot => {
                      const startTime = new Date(slot.startTime);
                      const timeStr = startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                      const isSelected = selectedSlot?.id === slot.id;
                      
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                            background: isSelected ? 'var(--color-primary)' : 'var(--bg-glass-subtle)',
                            color: isSelected ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            textAlign: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          <Clock size={12} style={{ display: 'inline', marginRight: '0.4rem' }} />
                          {timeStr}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  if (!selectedSlot) {
                    toast.error("Please pick a date and time slot first!");
                    return;
                  }
                  setBookingStep(2);
                }}
                disabled={!selectedSlot}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: selectedSlot ? 'var(--color-primary)' : 'var(--bg-glass-subtle)',
                  color: selectedSlot ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: '700',
                  cursor: selectedSlot ? 'pointer' : 'not-allowed',
                  fontSize: '0.95rem'
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}

          {/* STEP 2: Checkout & Notes */}
          {bookingStep === 2 && (
            <form onSubmit={handleBookingSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              
              {/* Left Column: Form & Card */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>Consultation Intake</h3>
                
                {/* Notes */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Describe your legal issue/case *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a summary of the facts, key dates, or legal questions you want answered. This helps the lawyer prepare beforehand."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-glass)',
                      border: 'var(--border-glass)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Secure Payment */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={18} style={{ color: 'var(--color-primary)' }} /> Secure Stripe Payment
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rajesh Kumar" 
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Card Number</label>
                    <input 
                      type="text" 
                      required
                      maxLength={16}
                      placeholder="4242 •••• •••• 4242" 
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Expiry Date</label>
                      <input 
                        type="text" 
                        required
                        maxLength={5}
                        placeholder="MM/YY" 
                        value={cardExpiry}
                        onChange={e => {
                          let val = e.target.value;
                          if (val.length === 2 && !val.includes('/')) val += '/';
                          setCardExpiry(val);
                        }}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>CVV</label>
                      <input 
                        type="password" 
                        required
                        maxLength={3}
                        placeholder="•••" 
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: 'var(--border-glass)', background: 'var(--bg-glass)', color: 'var(--text-main)', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px', marginTop: '1.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <Shield size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                  <span>Stripe Secure Connection. Your payment details are encrypted end-to-end. Card credentials are never stored.</span>
                </div>
              </div>

              {/* Right Column: Checkout Summary */}
              <div style={{ background: 'var(--bg-glass-subtle)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--bg-glass-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>Order Summary</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--bg-glass-subtle)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Consultant</span>
                      <b style={{ color: 'var(--text-main)' }}>{selectedLawyer.name}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Date</span>
                      <b style={{ color: 'var(--text-main)' }}>{new Date(selectedSlot.startTime).toLocaleDateString()}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Time</span>
                      <b style={{ color: 'var(--text-main)' }}>{new Date(selectedSlot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Duration</span>
                      <b style={{ color: 'var(--text-main)' }}>{durationMinutes} mins</b>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', borderBottom: '1px solid var(--bg-glass-subtle)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hourly Fee</span>
                      <span>₹{selectedLawyer.hourlyRate || 1000}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>GST (18%)</span>
                      <span>₹{(selectedLawyer.hourlyRate * 0.18).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '800', marginTop: '1rem' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{(selectedLawyer.hourlyRate * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: processingPayment ? 'not-allowed' : 'pointer',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Processing Transaction...
                      </>
                    ) : (
                      `Pay & Confirm Booking`
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingStep(1)}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Modify Date/Time
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* STEP 3: Booking Success Receipt */}
          {bookingStep === 3 && confirmedBooking && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#e8f5e9', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)'
              }}>
                <CheckCircle size={40} color="#2e7d32" />
              </div>

              <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' }}>Appointment Confirmed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Your meeting has been scheduled and credentials generated. Confirmation email sent.
              </p>

              {/* Receipt info */}
              <div style={{ background: 'var(--bg-glass-subtle)', borderRadius: '12px', border: 'var(--border-glass)', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-glass-subtle)', paddingBottom: '0.5rem' }}>
                  <span>Booking Reference</span>
                  <b style={{ color: 'var(--text-main)' }}>NS-C-{confirmedBooking.id}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lawyer Representative</span>
                  <b style={{ color: 'var(--text-main)' }}>{confirmedBooking.lawyer?.name}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Scheduled Time</span>
                  <b style={{ color: 'var(--text-main)' }}>{new Date(confirmedBooking.scheduledTime).toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration</span>
                  <b style={{ color: 'var(--text-main)' }}>{confirmedBooking.durationMinutes} minutes</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--bg-glass-subtle)', paddingTop: '0.5rem' }}>
                  <span>Stripe Payment Status</span>
                  <span style={{ color: '#2e7d32', fontWeight: '700' }}>✓ COMPLETED</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/litigant/consultation/${confirmedBooking.id}`)}
                  style={{
                    padding: '0.85rem 1.5rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 10px rgba(30, 42, 68, 0.2)'
                  }}
                >
                  <ExternalLink size={16} /> Join Consultation Room
                </button>

                <button
                  onClick={() => handleDownloadInvoice(confirmedBooking.payment?.id)}
                  style={{
                    padding: '0.85rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Download size={16} /> Download Invoice PDF
                </button>

                <button
                  onClick={() => {
                    setSelectedLawyer(null);
                    setNotes('');
                    setBookingStep(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    marginTop: '1rem'
                  }}
                >
                  Return to Lawyer Directory
                </button>
              </div>

            </div>
          )}

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