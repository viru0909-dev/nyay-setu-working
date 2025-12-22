import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCcw, CheckCircle, AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFaceRecognition } from '../../hooks/useFaceRecognition';
import '../../styles/Biometrics.css';

export default function FaceCapture({ onCapture, mode = 'enroll' }) {
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('idle'); // idle, detecting, success, error
    const [faceDetected, setFaceDetected] = useState(false);
    const { modelsLoaded, isLoading: modelsLoading, detectFace, error: modelError } = useFaceRecognition();

    useEffect(() => {
        if (modelError) {
            setMessage('Biometric hardware error detected');
            setStatus('error');
        } else if (!modelsLoaded) {
            setMessage('Initializing AI vision systems...');
        } else {
            setMessage('Align your face within the digital GUIDELINES');
        }
    }, [modelsLoaded, modelError]);

    // Real-time detection feedback
    useEffect(() => {
        let interval;
        if (modelsLoaded && status === 'idle' && !isCapturing) {
            interval = setInterval(async () => {
                if (webcamRef.current?.video) {
                    try {
                        const detection = await detectFace(webcamRef.current.video, 0.5); // Lower threshold for feedback

                        if (detection) {
                            if (detection.isCentered) {
                                setFaceDetected(true);
                                setMessage('Align your face within the digital GUIDELINES');
                            } else {
                                setFaceDetected(false);
                                setMessage('ADJUST POSITION: Center face in frame');
                            }
                        } else {
                            setFaceDetected(false);
                            setMessage('Align your face within the digital GUIDELINES');
                        }
                    } catch (err) {
                        console.error('Detection loop error:', err);
                    }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [modelsLoaded, status, isCapturing, detectFace]);

    const capture = async () => {
        if (!webcamRef.current || !modelsLoaded) return;

        try {
            setIsCapturing(true);
            setStatus('detecting');
            setMessage('Processing biometric signature... Hold position');

            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) throw new Error('Input stream lost');

            const img = new Image();
            img.src = imageSrc;
            await img.decode();

            const detection = await detectFace(img, 0.7); // Higher threshold for actual capture

            if (!detection || !detection.isCentered) {
                setStatus('error');
                setMessage(detection && !detection.isCentered ? 'Face not centered' : 'Biometric capture failed. No face detected.');
                return;
            }

            if (detection.score < 0.6) {
                setStatus('error');
                setMessage('Signal quality too low. Ensure proper lighting.');
                return;
            }

            setStatus('success');
            setMessage('Biometric signature ENROLLED');
            onCapture(detection.descriptor);
        } catch (err) {
            console.error('Capture failed:', err);
            setStatus('error');
            setMessage(err.message || 'Processing error. Reset and retry.');
        } finally {
            setIsCapturing(false);
        }
    };

    const reset = () => {
        setStatus('idle');
        setMessage('Align your face within the digital GUIDELINES');
        setFaceDetected(false);
    };

    if (modelsLoading) {
        return (
            <div className="bio-loading-container">
                <div className="bio-spinner">
                    <Loader2 className="bio-spinner-svg" />
                    <ShieldCheck style={{ width: '32px', height: '32px', color: '#60a5fa', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <h3 className="biometric-title bio-mb-2">Systems Initialization</h3>
                <p className="biometric-subtitle">Loading encrypted neural networks and biometric modules...</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className={`biometric-container ${faceDetected ? 'face-detected' : ''}`}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="biometric-video"
                    videoConstraints={{ facingMode: "user" }}
                />

                {/* HUD Elements */}
                <div className="scanner-overlay">
                    <div className="scanner-line"></div>
                    <div className="hud-corner corner-tl"></div>
                    <div className="hud-corner corner-tr"></div>
                    <div className="hud-corner corner-bl"></div>
                    <div className="hud-corner corner-br"></div>
                    <div className="face-guideline"></div>
                </div>

                {/* Signal Indicators */}
                <div className="scanner-status-badge">
                    <div className={`status-dot ${faceDetected ? 'active' : ''}`}></div>
                    <span className="status-text">
                        {faceDetected ? 'SIGNAL LOCKED' : 'SEARCHING SIGNAL'}
                    </span>
                </div>

                {/* Mode Indicator */}
                <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 12px', borderRadius: '9999px', background: 'rgba(37, 99, 235, 0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                    <span className="status-text" style={{ color: '#60a5fa' }}>
                        {mode === 'enroll' ? 'ENROLLMENT MODE' : 'VERIFICATION MODE'}
                    </span>
                </div>

                {/* Dynamic Status Display */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="status-badge"
                    >
                        {status === 'idle' && (
                            <>
                                {faceDetected ? <UserCheck size={16} className="text-emerald-400" /> : <Camera size={16} className="text-blue-400" />}
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
                            </>
                        )}
                        {status === 'detecting' && (
                            <>
                                <Loader2 size={16} className="text-blue-400 animate-spin" />
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <CheckCircle size={16} style={{ color: '#10b981' }} />
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>{message}</span>
                            </>
                        )}
                        {status === 'error' && (
                            <>
                                <AlertCircle size={16} style={{ color: '#f43f5e' }} />
                                <span className="pulse-red" style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="bio-mt-8 bio-flex-center bio-gap-6">
                {status === 'success' ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={reset}
                        className="biometric-btn btn-secondary-bio"
                    >
                        <RefreshCcw size={20} />
                        Re-Scan
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={faceDetected && !isCapturing ? { scale: 1.05 } : {}}
                        whileTap={faceDetected && !isCapturing ? { scale: 0.95 } : {}}
                        onClick={capture}
                        disabled={!faceDetected || isCapturing}
                        className={`biometric-btn ${faceDetected ? 'btn-primary-bio' : ''}`}
                        style={!faceDetected || isCapturing ? { background: '#1e293b', color: '#64748b', border: '1px solid #334155', cursor: 'not-allowed' } : {}}
                    >
                        <ShieldCheck size={20} />
                        Capture Biometric
                    </motion.button>
                )}
            </div>
        </div>
    );
}
