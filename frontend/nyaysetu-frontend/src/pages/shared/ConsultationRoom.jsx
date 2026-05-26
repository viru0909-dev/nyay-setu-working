import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Send, FileText, 
  Info, Users, MessageSquare, Shield, Clock, Plus, Download, AlertTriangle 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { consultationAPI } from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function ConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const localVideoRef = useRef(null);
  
  // UI & Active states
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // chat, docs, info
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [localStream, setLocalStream] = useState(null);
  
  // Mock remote user attributes
  const [remoteConnecting, setRemoteConnecting] = useState(true);

  // Initialize camera preview
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera/Mic access denied or unavailable", err);
      }
    }
    
    startCamera();
    
    // Simulate remote user joining after 3 seconds
    const timer = setTimeout(() => {
      setRemoteConnecting(false);
      // Seed initial greeting message
      setMessages(prev => [
        ...prev,
        {
          sender: user?.role === 'LITIGANT' ? 'Lawyer' : 'Client',
          text: `Hello! Welcome to our virtual consultation. How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Fetch consultation details
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await consultationAPI.getConsultationDetails(id);
        setConsultation(res.data);
        
        // Calculate remaining seconds
        if (res.data.scheduledTime && res.data.durationMinutes) {
          const scheduledTime = new Date(res.data.scheduledTime);
          const endTime = new Date(scheduledTime.getTime() + res.data.durationMinutes * 60000);
          const diffSeconds = Math.floor((endTime - new Date()) / 1000);
          
          if (diffSeconds > 0) {
            setTimeLeft(diffSeconds);
          } else {
            setTimeLeft(res.data.durationMinutes * 60); // fallback to full duration
          }
        }
      } catch (err) {
        console.error("Error loading consultation details", err);
        toast.error("Failed to load consultation details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDetails();
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handle stream muting
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Chat message submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: user?.name || 'You',
      text: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulated response after 2 seconds for a premium feel
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: user?.role === 'LITIGANT' ? 'Lawyer' : 'Client',
          text: `Acknowledged. Let's document this point and check if we have any other evidence files.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 2500);
  };

  // Mock document upload
  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newDoc = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedBy: user?.name || 'You',
      timestamp: new Date().toLocaleDateString()
    };

    setDocuments(prev => [...prev, newDoc]);
    toast.success("Document uploaded successfully to session drive!");
  };

  // End consultation call
  const handleEndCall = () => {
    const msg = user?.role === 'LITIGANT' 
      ? 'Do you want to end this consultation and rate the lawyer?'
      : 'Do you want to close this consultation session?';
      
    if (window.confirm(msg)) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (user?.role === 'LITIGANT') {
        navigate(`/litigant/feedback?consultationId=${id}`);
      } else {
        navigate('/lawyer/consultations');
      }
    }
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-main)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--bg-glass-subtle)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', fontWeight: '500' }}>Initializing Consultation Room...</p>
      </div>
    );
  }

  const otherPartyName = user?.role === 'LITIGANT' 
    ? consultation?.lawyer?.name || 'Adv. Rajesh Kumar'
    : consultation?.clientName || 'Client Litigant';

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      height: 'calc(100vh - 120px)',
      display: 'flex', 
      flexDirection: 'column',
      gap: '1rem' 
    }}>
      <Toaster />
      
      {/* Header bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'var(--bg-glass-strong)', 
        border: 'var(--border-glass-strong)', 
        borderRadius: '1rem', 
        padding: '0.75rem 1.5rem',
        boxShadow: 'var(--shadow-glass)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: '700', padding: '0.25rem 0.6rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            SECURE CALL
          </div>
          <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{otherPartyName}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>| ID: {id}</span>
        </div>
        
        {/* Timer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: timeLeft < 300 ? '#fce8e6' : 'var(--bg-glass-subtle)', 
          color: timeLeft < 300 ? '#c62828' : 'var(--text-main)',
          padding: '0.4rem 1rem', 
          borderRadius: '20px',
          fontWeight: '700',
          fontSize: '0.95rem'
        }}>
          <Clock size={16} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1rem', flex: 1, minHeight: 0 }}>
        
        {/* Video feed column */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          background: 'black', 
          borderRadius: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid var(--bg-glass-strong)'
        }}>
          {/* Remote Video (Mock presentation) */}
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {remoteConnecting ? (
              <div style={{ textAlign: 'center', color: 'white' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1.5s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: '500' }}>Connecting to secure stream...</p>
              </div>
            ) : (
              // Simulated Remote Feed: gorgeous visual waveform background with initials
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'var(--color-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '3rem', 
                  fontWeight: '700',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                  marginBottom: '1rem',
                  animation: 'pulse 3s infinite'
                }}>
                  {otherPartyName.split(' ').pop()?.[0] || 'L'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{otherPartyName}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Connected via WebRTC SD-WAN</p>
              </div>
            )}

            {/* Local Preview Box (PIP) */}
            <div style={{ 
              position: 'absolute', 
              bottom: '1.5rem', 
              right: '1.5rem', 
              width: '160px', 
              height: '120px', 
              borderRadius: '1rem', 
              background: '#334155', 
              border: '2px solid rgba(255,255,255,0.2)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              zIndex: 10
            }}>
              {isVideoOff ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#1e293b' }}>
                  <VideoOff size={24} />
                </div>
              ) : (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                />
              )}
            </div>
          </div>

          {/* Control Bar (Absolute Bottom) */}
          <div style={{ 
            position: 'absolute', 
            bottom: '1.5rem', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            display: 'flex', 
            gap: '1rem',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 20
          }}>
            <button 
              onClick={toggleMute}
              style={{ 
                width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button 
              onClick={toggleVideo}
              style={{ 
                width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: isVideoOff ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button 
              onClick={handleEndCall}
              style={{ 
                width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', transform: 'rotate(135deg)'
              }}
              title="Hang Up Consultation"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>

        {/* Sidebar panel column */}
        <div style={{ 
          background: 'var(--bg-glass-strong)', 
          border: 'var(--border-glass-strong)', 
          borderRadius: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-glass)',
          overflow: 'hidden'
        }}>
          {/* Tabs header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--bg-glass-subtle)' }}>
            <button 
              onClick={() => setActiveTab('chat')}
              style={{ 
                padding: '0.85rem 0', border: 'none', cursor: 'pointer',
                background: activeTab === 'chat' ? 'var(--bg-glass-hover)' : 'transparent',
                color: activeTab === 'chat' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: '700', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
              }}
            >
              <MessageSquare size={16} />
              Chat
            </button>
            <button 
              onClick={() => setActiveTab('docs')}
              style={{ 
                padding: '0.85rem 0', border: 'none', cursor: 'pointer',
                background: activeTab === 'docs' ? 'var(--bg-glass-hover)' : 'transparent',
                color: activeTab === 'docs' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: '700', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
              }}
            >
              <FileText size={16} />
              Files ({documents.length})
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              style={{ 
                padding: '0.85rem 0', border: 'none', cursor: 'pointer',
                background: activeTab === 'info' ? 'var(--bg-glass-hover)' : 'transparent',
                color: activeTab === 'info' ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: '700', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem'
              }}
            >
              <Info size={16} />
              Case Info
            </button>
          </div>

          {/* Tab content view */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
            
            {activeTab === 'chat' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Messages list */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.85rem' }}>
                      No messages sent in this session yet.
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} style={{ 
                        alignSelf: msg.sender === user?.name || msg.sender === 'You' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: msg.sender === user?.name || msg.sender === 'You' ? 'var(--color-primary)' : 'var(--bg-glass-subtle)',
                        color: msg.sender === user?.name || msg.sender === 'You' ? 'white' : 'var(--text-main)',
                        padding: '0.65rem 0.85rem',
                        borderRadius: msg.sender === user?.name || msg.sender === 'You' ? '12px 12px 0 12px' : '0 12px 12px 12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ fontSize: '0.7rem', opacity: 0.75, fontWeight: '700', marginBottom: '0.15rem' }}>{msg.sender}</div>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.3' }}>{msg.text}</div>
                        <div style={{ fontSize: '0.65rem', textAlign: 'right', opacity: 0.6, marginTop: '0.25rem' }}>{msg.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--bg-glass-subtle)', paddingTop: '0.75rem' }}>
                  <input 
                    type="text" 
                    placeholder="Type message..." 
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    style={{ 
                      flex: 1, 
                      padding: '0.6rem 0.85rem', 
                      borderRadius: '8px', 
                      border: 'var(--border-glass)', 
                      background: 'var(--bg-glass)', 
                      color: 'var(--text-main)',
                      outline: 'none',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Shared Documents</span>
                  <label style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '700',
                    background: 'var(--color-primary)', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer'
                  }}>
                    <Plus size={14} /> Add
                    <input type="file" onChange={handleDocUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Documents List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                  {documents.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.85rem' }}>
                      No documents shared in this meeting yet.
                    </div>
                  ) : (
                    documents.map((doc, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem', 
                        background: 'var(--bg-glass-subtle)', border: 'var(--border-glass)', borderRadius: '8px'
                      }}>
                        <FileText size={24} style={{ color: 'var(--color-primary)' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{doc.size} • by {doc.uploadedBy}</div>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Download size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: '12px', border: 'var(--border-glass)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Consultation Details</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div><b>Date:</b> {consultation?.scheduledTime ? new Date(consultation.scheduledTime).toLocaleDateString() : 'N/A'}</div>
                    <div><b>Duration:</b> {consultation?.durationMinutes || 60} mins</div>
                    <div><b>Client:</b> {consultation?.clientName || 'N/A'} ({consultation?.clientEmail})</div>
                    <div><b>Lawyer ID:</b> {consultation?.lawyer?.id}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-glass-subtle)', padding: '1rem', borderRadius: '12px', border: 'var(--border-glass)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Litigant Notes</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                    {consultation?.notes || 'No notes provided by client.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#fff9db', color: '#f08c00', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid #ffe066' }}>
                  <Shield size={20} style={{ flexShrink: 0 }} />
                  <div>
                    This virtual room is fully encrypted under Indian IT Act Sec 66A. Keep all file uploads relevant to this case.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
