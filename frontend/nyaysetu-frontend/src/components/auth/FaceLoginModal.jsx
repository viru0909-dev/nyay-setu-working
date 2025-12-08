import { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';

export default function FaceLoginModal({ isOpen, onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'scanning' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const [faceDetected, setFaceDetected] = useState(false);
    const webcamRef = useRef(null);
    const { modelsLoaded, detectFace, loginWithFace } = useFaceRecognition();

    useEffect(() => {
        if (step === 'scanning' && modelsLoaded) {
            startFaceDetection();
        }
    }, [step, modelsLoaded]);

    const startFaceDetection = async () => {
        const interval = setInterval(async () => {
            if (webcamRef.current?.video) {
                try {
                    const result = await detectFace(webcamRef.current.video);
                    if (result) {
                        setFaceDetected(true);
                        clearInterval(interval);
                        await handleFaceLogin(result.descriptor);
                    }
                } catch (err) {
                    console.error('Face detection error:', err);
                }
            }
        }, 1000);

        // Timeout after 30 seconds
        setTimeout(() => {
            clearInterval(interval);
            if (step === 'scanning') {
                setStep('error');
                setMessage('Face detection timeout. Please try again.');
            }
        }, 30000);
    };

    const handleFaceLogin = async (descriptor) => {
        try {
            setMessage('Verifying your face...');
            const response = await loginWithFace(email, descriptor);

            setStep('success');
            setMessage('Login successful!');

            setTimeout(() => {
                onSuccess(response);
                onClose();
            }, 1500);
        } catch (error) {
            setStep('error');
            setMessage(error.message || 'Face verification failed');
        }
    };

    const handleStartScanning = () => {
        if (!email.trim()) {
            setMessage('Please enter your email');
            return;
        }
        setStep('scanning');
        setMessage('Position your face in the camera');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '2rem'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '500px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '1.5rem',
                            padding: '2rem',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.5rem',
                                width: '2.5rem',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                borderRadius: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <Camera size={32} color="white" />
                            </div>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
                                Face Login
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                                Quick and secure login with your face
                            </p>
                        </div>

                        {step === 'email' && (
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        marginBottom: '1rem'
                                    }}
                                    onKeyPress={(e) => e.key === 'Enter' && handleStartScanning()}
                                />
                                <button
                                    onClick={handleStartScanning}
                                    disabled={!modelsLoaded}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: modelsLoaded
                                            ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                            : 'rgba(139, 92, 246, 0.3)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: modelsLoaded ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    {modelsLoaded ? 'Start Face Scan' : 'Loading Models...'}
                                </button>
                                {message && (
                                    <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                        {message}
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 'scanning' && (
                            <div>
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '1rem',
                                    overflow: 'hidden',
                                    marginBottom: '1rem'
                                }}>
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: 'user' }}
                                        style={{ width: '100%', borderRadius: '1rem' }}
                                    />
                                    {faceDetected && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '200px',
                                            height: '200px',
                                            border: '3px solid #10b981',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                                        }} />
                                    )}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Loader2 size={24} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                                    <p style={{ color: '#a78bfa', fontSize: '0.9rem', margin: 0 }}>
                                        {message}
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#10b981', fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
                                    {message}
                                </p>
                            </div>
                        )}

                        {step === 'error' && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <AlertCircle size={64} color="#f87171" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#f87171', fontSize: '1rem', marginBottom: '1rem' }}>
                                    {message}
                                </p>
                                <button
                                    onClick={() => {
                                        setStep('email');
                                        setMessage('');
                                        setFaceDetected(false);
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        <style>{`
                            @keyframes spin {
                                from { transform: rotate(0deg); }
                                to { transform: rotate(360deg); }
                            }
                        `}</style>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
