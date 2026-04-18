import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Mic, StopCircle, Globe } from 'lucide-react';
import VakilAvatar3D from './VakilAvatar3D';
import ReasoningPanel from './ReasoningPanel';

const stateLabels = {
    idle: 'Online — Ready to assist',
    thinking: 'Analyzing your query...',
    talking: 'Responding...',
    listening: 'Listening to command...',
    passive: 'Listening quietly...'
};

const stateColors = {
    idle: '#10b981',
    thinking: '#6366f1',
    talking: '#3b82f6',
    listening: '#ef4444',
    passive: '#f59e0b'
};

export default function AvatarPanel({
    state = 'idle',
    onClose,
    isRecording,
    isListeningForCommand,
    startRecording,
    stopRecording,
    inputMessage,
    language,
    setLanguage,
    audioData,
    inline = false,
    reasoningStages = {},
    reasoningText = '',
    kanoonResults = [],
    isDeepResearching = false
}) {
    const [entering, setEntering] = useState(true);

    // Determine the *display* state based on recording status
    const displayState = isRecording && !inputMessage
        ? 'passive'
        : state;

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setEntering(false));
    }, []);

    const overlayContent = (
        <div style={inline ? {
            flex: 1,
            position: 'relative',
            background: '#ffffff', // White background to match UI
            display: 'flex',
            flexDirection: 'column',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            opacity: entering ? 0 : 1,
            transform: entering ? 'scale(0.95)' : 'scale(1)',
            height: '100%',
            width: '100%',
            borderRadius: '1.25rem'
        } : {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999, // Ensure it's above everything
            background: 'radial-gradient(ellipse at center, #1a1d2e 0%, #0f1117 60%, #080a0f 100%)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            opacity: entering ? 0 : 1,
            transform: entering ? 'scale(0.95)' : 'scale(1)'
        }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Sparkles size={20} style={{ color: '#818cf8' }} />
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            color: inline ? '#1e293b' : '#f1f5f9',
                            letterSpacing: '-0.01em'
                        }}>
                            Nyay Saarthi
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                            <div style={{
                                width: '7px', height: '7px',
                                borderRadius: '50%',
                                background: stateColors[displayState],
                                boxShadow: `0 0 8px ${stateColors[displayState]}`,
                                animation: displayState !== 'idle' && displayState !== 'passive' ? 'avatarPulse 1.5s infinite' : 'none'
                            }} />
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: inline ? '#64748b' : '#94a3b8'
                            }}>
                                {stateLabels[displayState]}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        padding: '0.6rem',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Close Avatar"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 3D Canvas — fills remaining space */}
            <div style={{ flex: 1, position: 'relative' }}>
                <VakilAvatar3D state={state} audioData={audioData} />

                {/* Deep Research Reasoning Panel */}
                <ReasoningPanel
                    stages={reasoningStages}
                    reasoningText={reasoningText}
                    kanoonResults={kanoonResults}
                    isActive={isDeepResearching}
                />



                {/* Language Selector (Top Left) */}
                <div style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    background: inline ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: inline ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '2rem',
                    padding: '0.4rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: inline ? '#1e293b' : '#f1f5f9',
                    boxShadow: inline ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none',
                    zIndex: 20
                }}>
                    <Globe size={16} color="#818cf8" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage && setLanguage(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="en">English (English)</option>
                        <option value="hi">हिंदी (Hindi)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="gu">ગુજરાતી (Gujarati)</option>
                        <option value="kn">ಕನ್ನಡ (Kannada)</option>
                        <option value="ml">മലയാളം (Malayalam)</option>
                        <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="ur">اردو (Urdu)</option>
                        <option value="as">অসমীয়া (Assamese)</option>
                        <option value="or">ଓଡ଼ିଆ (Odia)</option>
                    </select>
                </div>

                {/* Live Transcription Display */}
                {isRecording && (
                    <div style={{
                        position: 'absolute',
                        bottom: '22%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        maxWidth: '600px',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        zIndex: 15
                    }}>
                        <div style={{
                            background: inline ? 'rgba(255,255,255,0.9)' : (isListeningForCommand ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.5)'),
                            backdropFilter: 'blur(10px)',
                            padding: '1.5rem 2rem',
                            borderRadius: '1.5rem',
                            border: inline ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                            color: inline ? '#0f172a' : '#fff',
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            boxShadow: inline ? '0 10px 25px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.4)',
                            animation: 'fadeIn 0.3s ease-out',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                color: '#818cf8',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                {inputMessage ? 'Transcribing...' : 'Listening...'}
                            </div>
                            <div style={{ minHeight: '1.5em', opacity: inputMessage ? 1 : 0.5, fontStyle: inputMessage ? 'normal' : 'italic' }}>
                                {inputMessage || "Awaiting your voice..."}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Controls */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '6rem 2rem 1.5rem',
                    background: inline ? 'linear-gradient(transparent, rgba(255,255,255,0.95) 75%)' : 'linear-gradient(transparent, rgba(8,10,15,0.95) 75%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none'
                }}>

                    {/* Voice Controls - Hide when inline because chat has its own mic */}
                    {!inline && (
                        <div style={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {isRecording ? (
                                <button
                                    onClick={stopRecording}
                                    style={{
                                        width: '70px', height: '70px',
                                        borderRadius: '50%',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                        color: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
                                        animation: 'pulseStop 2s infinite'
                                    }}
                                >
                                    <StopCircle size={32} />
                                </button>
                            ) : (
                                <button
                                    onClick={startRecording}
                                    disabled={state !== 'idle'}
                                    style={{
                                        width: '70px', height: '70px',
                                        borderRadius: '50%',
                                        background: state === 'idle' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#f1f5f9',
                                        border: 'none',
                                        color: state === 'idle' ? 'white' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: state === 'idle' ? 'pointer' : 'not-allowed',
                                        boxShadow: state === 'idle' ? '0 10px 25px rgba(99, 102, 241, 0.4)' : 'none',
                                        transition: 'all 0.2s',
                                        transform: state === 'idle' ? 'scale(1)' : 'scale(0.95)'
                                    }}
                                >
                                    <Mic size={32} />
                                </button>
                            )}
                        </div>
                    )}

                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        color: inline ? '#1e293b' : '#f1f5f9',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        marginBottom: '0.25rem'
                    }}>
                        Nyay Saarthi
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: inline ? '#64748b' : '#64748b',
                        fontWeight: '500',
                        marginBottom: '1rem'
                    }}>
                        Your AI-Powered Legal Assistant
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes avatarPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.5); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseStop {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );

    return inline ? overlayContent : createPortal(overlayContent, document.body);
}
