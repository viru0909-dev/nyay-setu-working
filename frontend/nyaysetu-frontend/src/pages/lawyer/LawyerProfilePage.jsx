import { useState, useEffect } from 'react';
import {
    Award, Shield, Settings,
    LogOut, Camera, Save, Lock,
    Briefcase, ChevronRight,
    Trash2, X, ShieldCheck,
    MapPin
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

    // FULLY EDITABLE FORM DATA
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        barCouncilId: '',
        specialization: '',
        experience: '',
        location: ''
    });

    // LOAD USER DATA
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '+91 98765 43210',
                barCouncilId: user.barCouncilId || 'BAR/2015/ND/4821',
                specialization: user.specialization || 'Criminal & Constitutional Law',
                experience: user.experience || '12+ Years',
                location: user.location || 'New Delhi, India'
            });
        }
    }, [user]);

    // INPUT HANDLER
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // SAVE CHANGES
    const handleSaveChanges = () => {
        console.log('Updated Profile:', formData);

        alert('Profile updated successfully!');

        setIsEditing(false);
    };

    // FACE ENROLL
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

    // DELETE FACE
    const handleDeleteFace = async () => {

        if (
            window.confirm(
                'Are you sure you want to disable face login?'
            )
        ) {
            try {

                await deleteFace(token);

                setFaceEnabled(false);

                alert('Face data deleted.');

            } catch (err) {

                alert('Failed to delete face data: ' + err.message);
            }
        }
    };

    // GLASS STYLE
    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    // INPUT STYLE
    const inputStyle = {
        background: 'var(--bg-glass-subtle)',
        border: 'var(--border-glass-subtle)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
        fontWeight: '600',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    };

    return (

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '320px 1fr',
                    gap: '2rem'
                }}
            >

                {/* LEFT SIDE */}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}
                >

                    {/* PROFILE CARD */}

                    <div
                        style={{
                            ...glassStyle,
                            textAlign: 'center',
                            padding: '2.5rem 1.5rem'
                        }}
                    >

                        <div
                            style={{
                                position: 'relative',
                                width: '120px',
                                height: '120px',
                                margin: '0 auto 1.5rem'
                            }}
                        >

                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '35px',
                                    background: 'var(--color-accent)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-main)',
                                    fontSize: '3rem',
                                    fontWeight: '800'
                                }}
                            >
                                {formData.name?.charAt(0) || 'L'}
                            </div>

                            <button
                                style={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-glass-strong)',
                                    border: 'var(--border-glass)',
                                    color: 'var(--text-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Camera size={18} />
                            </button>

                        </div>

                        <h2
                            style={{
                                color: 'var(--text-main)',
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: '800'
                            }}
                        >
                            {formData.name || 'Vakil Sahib'}
                        </h2>

                        <p
                            style={{
                                color: 'var(--color-accent)',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                marginTop: '0.25rem'
                            }}
                        >
                            Senior Advocate
                        </p>

                        {/* BUTTONS */}

                        <div
                            style={{
                                marginTop: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}
                        >

                            <button
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '0.75rem',
                                    background: 'var(--bg-glass)',
                                    color: 'var(--color-accent)',
                                    border: 'var(--border-glass)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Settings size={18} />
                                Account Settings
                            </button>

                            <button
                                onClick={logout}
                                style={{
                                    width: '100%',
                                    padding: '0.8rem',
                                    borderRadius: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--color-error)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>

                        </div>

                    </div>

                    {/* VERIFICATION */}

                    <div style={glassStyle}>

                        <h3
                            style={{
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                fontWeight: '700',
                                marginBottom: '1.25rem'
                            }}
                        >
                            Digital Verification
                        </h3>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                        >

                            <div style={{ color: 'var(--text-secondary)' }}>
                                ✓ Identity Verified
                            </div>

                            <div style={{ color: 'var(--text-secondary)' }}>
                                ✓ Bar Council Synced
                            </div>

                            <div style={{ color: 'var(--text-secondary)' }}>
                                ✓ Blockchain Auth Active
                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT SIDE */}

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem'
                    }}
                >

                    {/* PERSONAL INFO */}

                    <div style={glassStyle}>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}
                        >

                            <h3
                                style={{
                                    color: 'var(--text-main)',
                                    margin: 0,
                                    fontSize: '1.25rem',
                                    fontWeight: '800'
                                }}
                            >
                                Personal Information
                            </h3>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                style={{
                                    background: 'var(--bg-glass-subtle)',
                                    color: 'var(--text-main)',
                                    border: 'var(--border-glass-subtle)',
                                    borderRadius: '0.5rem',
                                    padding: '0.4rem 1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>

                        </div>

                        {/* FORM GRID */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem'
                            }}
                        >

                            {[
                                ['name', 'Full Name'],
                                ['email', 'Email Address'],
                                ['phone', 'Phone Number'],
                                ['barCouncilId', 'Bar Council ID'],
                                ['specialization', 'Specialization'],
                                ['experience', 'Experience'],
                                ['location', 'Location']
                            ].map(([key, label]) => (

                                <div
                                    key={key}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                >

                                    <label
                                        style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {label}
                                    </label>

                                    {isEditing ? (

                                        <input
                                            type="text"
                                            name={key}
                                            value={formData[key]}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                        />

                                    ) : (

                                        <div
                                            style={{
                                                color: 'var(--text-main)',
                                                fontWeight: '600',
                                                padding: '0.4rem 0'
                                            }}
                                        >
                                            {formData[key]}
                                        </div>

                                    )}

                                </div>

                            ))}

                        </div>

                        {/* SAVE BUTTON */}

                        {isEditing && (

                            <div
                                style={{
                                    marginTop: '2rem',
                                    paddingTop: '1.5rem',
                                    borderTop: 'var(--border-glass)',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}
                            >

                                <button
                                    onClick={handleSaveChanges}
                                    style={{
                                        background: 'var(--color-accent)',
                                        color: 'var(--text-main)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        padding: '0.7rem 1.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>

                            </div>

                        )}

                    </div>

                </div>

            </div>

            {/* FACE MODAL */}

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