import { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, CheckCircle, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';
import '../../styles/Biometrics.css';

export default function FaceLoginModal({ isOpen, onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'scanning' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const [faceDetected, setFaceDetected] = useState(false);
    const webcamRef = useRef(null);
    const { modelsLoaded, detectFace, loginWithFace } = useFaceRecognition();

    useEffect(() => {
        let interval;
        if (step === 'scanning' && modelsLoaded) {
            interval = startFaceDetection();
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, modelsLoaded]);

    const startFaceDetection = () => {
        const interval = setInterval(async () => {
            if (webcamRef.current?.video) {
                try {
                    const result = await detectFace(webcamRef.current.video, 0.75); // High threshold for login
                    if (result && result.isCentered) {
                        setFaceDetected(true);
                        clearInterval(interval);
                        await handleFaceLogin(result.descriptor);
                    } else if (result) {
                        setFaceDetected(false);
                        setMessage('CENTER FACE: Move closer to the HUD grid');
                    } else {
                        setFaceDetected(false);
                        setMessage('SCANNING: No valid biometric signature found');
                    }
                } catch (err) {
                    console.error('Face detection error:', err);
                }
            }
        }, 800);

        setTimeout(() => {
            if (interval) clearInterval(interval);
            if (step === 'scanning' && !faceDetected) {
                setStep('error');
                setMessage('Biometric timeout. Signal not acquired.');
            }
        }, 45000);

        return interval;
    };

    const handleFaceLogin = async (descriptor) => {
        try {
            setMessage('Verifying biometric signature...');
            const response = await loginWithFace(email, descriptor);
            setStep('success');
            setMessage('Authentication Successful');
            setTimeout(() => {
                onSuccess(response);
                onClose();
            }, 1500);
        } catch (error) {
            setStep('error');
            setMessage(error.message || 'Verification failed');
        }
    };

    const handleStartScanning = () => {
        if (!email.trim()) {
            setMessage('Required: Identification Email');
            return;
        }
        setStep('scanning');
        setMessage('Projecting biometric grid...');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="biometric-modal-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="biometric-modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="biometric-header-decor"></div>

                    <button onClick={onClose} className="biometric-close-btn">
                        <X size={20} />
                    </button>

                    <div className="biometric-body">
                        <div className="biometric-title-section">
                            <div className="biometric-icon-wrapper">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="biometric-title">Biometric Login</h2>
                            <p className="biometric-subtitle">Neural Signature Verification System</p>
                        </div>

                        {step === 'email' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="biometric-input-group"
                            >
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Identification Email"
                                    className="biometric-input"
                                    onKeyPress={(e) => e.key === 'Enter' && handleStartScanning()}
                                />
                                <button
                                    onClick={handleStartScanning}
                                    disabled={!modelsLoaded}
                                    className="biometric-btn btn-primary-bio"
                                >
                                    {modelsLoaded ? 'INITIALIZE SCAN' : 'LOADING NEURAL ENGINE...'}
                                </button>
                                {message && <p className="biometric-error-msg animate-pulse">{message}</p>}
                            </motion.div>
                        )}

                        {step === 'scanning' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className={`biometric-container ${faceDetected ? 'face-detected' : ''}`}>
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: 'user' }}
                                        className="biometric-video"
                                    />
                                    <div className="scanner-overlay">
                                        <div className="scanner-line"></div>
                                        <div className="hud-corner corner-tl"></div>
                                        <div className="hud-corner corner-tr"></div>
                                        <div className="hud-corner corner-bl"></div>
                                        <div className="hud-corner corner-br"></div>
                                        <div className="face-guideline"></div>
                                    </div>

                                    <div className="scanner-status-badge">
                                        <div className={`status-dot ${faceDetected ? 'active' : ''}`}></div>
                                        <span className="status-text">
                                            {faceDetected ? 'BIOMETRIC ACQUIRED' : 'SCANNING FOR SIGNAL'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <Loader2 size={18} className="text-blue-500 animate-spin" style={{ color: '#3b82f6' }} />
                                        <p style={{ color: '#60a5fa', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', margin: 0 }}>
                                            {message}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12"
                                style={{ textAlign: 'center', padding: '3rem 0' }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', marginBottom: '1.5rem' }}>
                                    <UserCheck size={48} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#34d399', marginBottom: '8px', textTransform: 'uppercase' }}>Access Granted</h3>
                                <p style={{ color: 'rgba(16, 185, 129, 0.6)', fontWeight: '500' }}>Signature matched. Redirecting...</p>
                            </motion.div>
                        )}

                        {step === 'error' && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ textAlign: 'center', padding: '2rem 0' }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', marginBottom: '1.5rem' }}>
                                    <AlertCircle size={40} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fb7185', marginBottom: '8px', textTransform: 'uppercase' }}>Access Denied</h3>
                                <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '320px', marginInline: 'auto', fontSize: '14px' }}>{message}</p>
                                <button
                                    onClick={() => {
                                        setStep('email');
                                        setMessage('');
                                        setFaceDetected(false);
                                    }}
                                    className="biometric-btn btn-secondary-bio"
                                >
                                    RE-INITIALIZE SYSTEMS
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
