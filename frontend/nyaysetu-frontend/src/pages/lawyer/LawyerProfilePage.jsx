import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Award, Shield, Settings,
    LogOut, Camera, Save, Lock, Globe, Briefcase, ChevronRight,
    Trash2, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import FaceCapture from '../../components/auth/FaceCapture';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';

export default function LawyerProfilePage() {
    const { user, token, logout } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
    const { enrollFace, deleteFace } = useFaceRecognition();
    const [faceEnabled, setFaceEnabled] = useState(false);

    const handleEnrollFace = async (descriptor) => {
        try {
            await enrollFace(descriptor, token);
            setFaceEnabled(true);
            setShowFaceEnrollment(false);
            alert('Face enrolled successfully!');
        } catch (err) {
            alert('Face enrollment failed: ' + err.message);
        }
    };

    const handleDeleteFace = async () => {
        if (window.confirm('Are you sure you want to disable face login? This will delete your biometric data.')) {
            try {
                await deleteFace(token);
                setFaceEnabled(false);
                alert('Face data deleted.');
            } catch (err) {
                alert('Failed to delete face data: ' + err.message);
            }
        }
    };

    const glassStyle = {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    };

    const sections = [
        { title: 'Bar Council ID', value: 'BAR/2015/ND/4821', icon: Award },
        { title: 'Specialization', value: 'Criminal & Constitutional Law', icon: Briefcase },
        { title: 'Experience', value: '12+ Years', icon: Shield },
        { title: 'Location', value: 'New Delhi, India', icon: MapPin },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
                {/* Left Column: Avatar & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ ...glassStyle, textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '35px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '3rem', fontWeight: '800',
                                boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)'
                            }}>
                                {user?.name?.charAt(0) || 'L'}
                            </div>
                            <button style={{
                                position: 'absolute', bottom: -5, right: -5,
                                width: '36px', height: '36px', borderRadius: '12px',
                                background: '#1e293b', border: '2px solid rgba(255,255,255,0.1)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}>
                                <Camera size={18} />
                            </button>
                        </div>
                        <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{user?.name || 'Vakil Sahib'}</h2>
                        <p style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.25rem' }}>Senior Advocate</p>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button style={{
                                width: '100%', padding: '0.8rem', borderRadius: '0.75rem',
                                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                                border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '700',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}>
                                <Settings size={18} /> Account Settings
                            </button>
                            <button
                                onClick={logout}
                                style={{
                                    width: '100%', padding: '0.8rem', borderRadius: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                    border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '700',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>

                    <div style={{ ...glassStyle, padding: '1.5rem' }}>
                        <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Digital Verification</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Identity Verified</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Bar Council Synced</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Blockchain Auth Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Personal Information</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)', color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem',
                                    padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
                                }}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Full Name</label>
                                <div style={{ color: 'white', fontWeight: '600' }}>{user?.name || 'Adv. Unknown'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Email Address</label>
                                <div style={{ color: 'white', fontWeight: '600' }}>{user?.email || 'lawyer@nyaysetu.gov.in'}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Phone Number</label>
                                <div style={{ color: 'white', fontWeight: '600' }}>+91 98765 43210</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Role</label>
                                <div style={{ color: '#818cf8', fontWeight: '800', fontSize: '0.85rem' }}>{user?.role}</div>
                            </div>
                        </div>

                        {isEditing && (
                            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    color: 'white', border: 'none', borderRadius: '0.75rem',
                                    padding: '0.7rem 1.75rem', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {sections.map((sec, i) => (
                            <div key={i} style={glassStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ color: '#818cf8' }}><sec.icon size={20} /></div>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>{sec.title}</span>
                                </div>
                                <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>{sec.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Security Settings</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setShowFaceEnrollment(true)}
                                    style={{
                                        background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                        color: '#a78bfa', borderRadius: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Camera size={16} /> {faceEnabled ? 'Update Face' : 'Setup Face'}
                                </button>
                                {faceEnabled && (
                                    <button
                                        onClick={handleDeleteFace}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Lock size={18} color="#818cf8" />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Change Password</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Last changed 4 months ago</div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#64748b" />
                            </button>
                            <button style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Shield size={18} color="#818cf8" />
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Face Recognition Login</div>
                                        <div style={{ color: faceEnabled ? '#10b981' : '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>
                                            {faceEnabled ? 'ENABLED' : 'DISABLED'}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#64748b" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showFaceEnrollment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="biometric-modal-overlay"
                        onClick={() => setShowFaceEnrollment(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="biometric-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="biometric-header-decor"></div>

                            <button
                                onClick={() => setShowFaceEnrollment(false)}
                                className="biometric-close-btn"
                            >
                                <X size={20} />
                            </button>

                            <div className="biometric-body">
                                <div className="biometric-title-section">
                                    <div className="biometric-icon-wrapper">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h2 className="biometric-title">
                                        Lawyer Biometric Link
                                    </h2>
                                    <p className="biometric-subtitle">
                                        Secure your legal identity with biometric authentication
                                    </p>
                                </div>

                                <FaceCapture onCapture={handleEnrollFace} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
