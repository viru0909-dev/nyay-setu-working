import { useState, useRef, useEffect } from 'react';
import {
    User, Camera, Save, Edit2, Lock, Shield,
    Mail, Phone, MapPin, Briefcase, CheckCircle2,
    ShieldCheck, X, Trash2, Eye, EyeOff, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import FaceCapture from '../../components/auth/FaceCapture';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';

export default function ProfilePage() {
    const { user, token } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
    const { enrollFace, deleteFace } = useFaceRecognition();
    const [faceStatus, setFaceStatus] = useState('Checking...');
    const [faceLoaded, setFaceLoaded] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Fetch face status from backend if needed, or use profile data
        // For now, let's assume we check the backend or use a state
        setFaceLoaded(true);
    }, []);

    const [profileData, setProfileData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+91 9876543210',
        address: 'Mumbai, Maharashtra, India',
        profession: 'Software Engineer',
        bio: 'Experienced professional seeking legal assistance for property matters.',
        faceEnabled: false
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleEnrollFace = async (descriptor) => {
        try {
            await enrollFace(descriptor, token);
            setProfileData({ ...profileData, faceEnabled: true });
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
                setProfileData({ ...profileData, faceEnabled: false });
                alert('Face data deleted.');
            } catch (err) {
                alert('Failed to delete face data: ' + err.message);
            }
        }
    };

    const handleSave = () => {
        // TODO: API call to update profile
        setEditing(false);
    };

    const handlePasswordChange = () => {
        // TODO: API call to change password
        setPasswordData({ current: '', new: '', confirm: '' });
        setShowPasswordChange(false);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                    Profile Settings
                </h1>
                <p style={{ fontSize: '1rem', color: '#94a3b8' }}>
                    Manage your account information and security settings
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column - Profile Card */}
                <div>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        {/* Profile Photo */}
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: '800',
                                color: 'white',
                                border: '4px solid rgba(139, 92, 246, 0.3)'
                            }}>
                                {profileData.name.charAt(0).toUpperCase()}
                            </div>
                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    border: '3px solid rgba(15, 23, 42, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <Camera size={18} />
                            </button>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                            {profileData.name}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {user?.role?.replace('_', ' ')}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                            {profileData.email}
                        </p>

                        {/* Face Login Status */}
                        <div style={{
                            padding: '1rem',
                            background: profileData.faceEnabled
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(148, 163, 184, 0.1)',
                            border: profileData.faceEnabled
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={16} style={{ color: profileData.faceEnabled ? '#10b981' : '#94a3b8' }} />
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: profileData.faceEnabled ? '#10b981' : '#94a3b8'
                                }}>
                                    Face Login
                                </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                {profileData.faceEnabled ? 'Enabled' : 'Not configured'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setShowFaceEnrollment(true)}
                                style={{
                                    flex: 1,
                                    padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Camera size={16} />
                                {profileData.faceEnabled ? 'Update' : 'Enable'} Face Login
                            </button>
                            {profileData.faceEnabled && (
                                <button
                                    onClick={handleDeleteFace}
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.75rem',
                                        color: '#f87171',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Details & Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personal Information */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                                Personal Information
                            </h3>
                            <button
                                onClick={() => editing ? handleSave() : setEditing(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.25rem',
                                    background: editing
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : 'rgba(139, 92, 246, 0.2)',
                                    border: editing ? 'none' : '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: editing ? 'white' : '#c4b5fd',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {editing ? <><Save size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                    Full Name
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: editing ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(139, 92, 246, 0.1)',
                                    borderRadius: '0.75rem'
                                }}>
                                    <User size={18} style={{ color: '#8b5cf6' }} />
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '1rem',
                                                flex: 1,
                                                outline: 'none'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ color: 'white', fontSize: '1rem' }}>{profileData.name}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                    Email
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '2px solid rgba(139, 92, 246, 0.1)',
                                    borderRadius: '0.75rem'
                                }}>
                                    <Mail size={18} style={{ color: '#8b5cf6' }} />
                                    <span style={{ color: '#94a3b8', fontSize: '1rem' }}>{profileData.email}</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                    Phone
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: editing ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(139, 92, 246, 0.1)',
                                    borderRadius: '0.75rem'
                                }}>
                                    <Phone size={18} style={{ color: '#8b5cf6' }} />
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '1rem',
                                                flex: 1,
                                                outline: 'none'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ color: 'white', fontSize: '1rem' }}>{profileData.phone}</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                    Profession
                                </label>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: editing ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(139, 92, 246, 0.1)',
                                    borderRadius: '0.75rem'
                                }}>
                                    <Briefcase size={18} style={{ color: '#8b5cf6' }} />
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={profileData.profession}
                                            onChange={(e) => setProfileData({ ...profileData, profession: e.target.value })}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '1rem',
                                                flex: 1,
                                                outline: 'none'
                                            }}
                                        />
                                    ) : (
                                        <span style={{ color: 'white', fontSize: '1rem' }}>{profileData.profession}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                Address
                            </label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.875rem 1rem',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: editing ? '2px solid rgba(139, 92, 246, 0.3)' : '2px solid rgba(139, 92, 246, 0.1)',
                                borderRadius: '0.75rem'
                            }}>
                                <MapPin size={18} style={{ color: '#8b5cf6' }} />
                                {editing ? (
                                    <input
                                        type="text"
                                        value={profileData.address}
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '1rem',
                                            flex: 1,
                                            outline: 'none'
                                        }}
                                    />
                                ) : (
                                    <span style={{ color: 'white', fontSize: '1rem' }}>{profileData.address}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '1.5rem',
                        padding: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>
                            Security Settings
                        </h3>

                        <button
                            onClick={() => setShowPasswordChange(!showPasswordChange)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.75rem',
                                color: '#c4b5fd',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textAlign: 'left'
                            }}
                        >
                            <Lock size={18} />
                            Change Password
                        </button>

                        {showPasswordChange && (
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                        Current Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                        New Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8', fontWeight: '600' }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: '2px solid rgba(139, 92, 246, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handlePasswordChange}
                                    style={{
                                        padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Update Password
                                </button>
                            </div>
                        )}
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
                                        Biometric Enrollment
                                    </h2>
                                    <p className="biometric-subtitle">
                                        Neural Signature Registration System
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
