import { useState, useRef } from 'react';
import {
    User, Camera, Save, Edit2, Lock, Shield,
    Mail, Phone, MapPin, Briefcase, CheckCircle2,
    Upload, X, Eye, EyeOff
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [showFaceEnrollment, setShowFaceEnrollment] = useState(false);
    const [facePhotos, setFacePhotos] = useState([]);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

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

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
        } catch (err) {
            console.error('Camera access denied:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && facePhotos.length < 5) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            const photoUrl = canvas.toDataURL('image/jpeg');
            setFacePhotos([...facePhotos, photoUrl]);
        }
    };

    const handleEnrollFace = () => {
        // TODO: Send face photos to backend
        setProfileData({ ...profileData, faceEnabled: true });
        setShowFaceEnrollment(false);
        stopCamera();
        setFacePhotos([]);
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

                        <button
                            onClick={() => setShowFaceEnrollment(true)}
                            style={{
                                width: '100%',
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

            {/* Face Enrollment Modal */}
            {showFaceEnrollment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        maxWidth: '700px',
                        width: '100%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                                    Face Enrollment
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                    Capture 5 photos from different angles
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowFaceEnrollment(false);
                                    stopCamera();
                                    setFacePhotos([]);
                                }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(148, 163, 184, 0.1)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Video Preview */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            height: '400px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderRadius: '1rem',
                            marginBottom: '1.5rem',
                            overflow: 'hidden'
                        }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {!stream && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center'
                                }}>
                                    <Camera size={64} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
                                    <button
                                        onClick={startCamera}
                                        style={{
                                            padding: '1rem 2rem',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Start Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                    Photos captured: {facePhotos.length}/5
                                </span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6' }}>
                                    {Math.round((facePhotos.length / 5) * 100)}%
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'rgba(148, 163, 184, 0.2)',
                                borderRadius: '9999px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(facePhotos.length / 5) * 100}%`,
                                    background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>

                        {/* Captured Photos */}
                        {facePhotos.length > 0 && (
                            <div style={{
                                display: 'flex',
                                gap: '0.75rem',
                                marginBottom: '1.5rem',
                                flexWrap: 'wrap'
                            }}>
                                {facePhotos.map((photo, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '0.75rem',
                                            overflow: 'hidden',
                                            border: '2px solid rgba(139, 92, 246, 0.3)'
                                        }}
                                    >
                                        <img src={photo} alt={`Face ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {stream && facePhotos.length < 5 && (
                                <button
                                    onClick={capturePhoto}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Camera size={20} />
                                    Capture Photo
                                </button>
                            )}
                            {facePhotos.length === 5 && (
                                <button
                                    onClick={handleEnrollFace}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CheckCircle2 size={20} />
                                    Complete Enrollment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
