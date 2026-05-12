import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, Video, FileText, Bot, 
    Play, Pause, Clock, AlertTriangle, 
    FileCheck, ExternalLink, ChevronRight,
    Terminal, Info, CheckCircle, Search, 
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AvatarPanel from '../../components/avatar/AvatarPanel';

const ForensicsPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle, uploading, extracted, analyzing, logic_lookup, complete
    const [timeline, setTimeline] = useState([]);
    const [legalSections, setLegalSections] = useState([]);
    const [liabilityReport, setLiabilityReport] = useState(null);
    const [events, setEvents] = useState([]);
    const [videoUrl, setVideoUrl] = useState(null);
    const [avatarState, setAvatarState] = useState('idle');
    const [audioData, setAudioData] = useState(null);
    const [speakingText, setSpeakingText] = useState("");

    const fileInputRef = useRef(null);
    const sseRef = useRef(null);

    // Mock logic for simulation
    const simulateAnalysis = () => {
        setAnalysisStatus('uploading');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                startStreamingAnalysis();
            }
        }, 100);
    };

    const startStreamingAnalysis = () => {
        setAnalysisStatus('analyzing');
        addEvent("AI: Starting Forensic Frame Extraction...", "info");
        
        // Simulating SSE events
        setTimeout(() => {
            addEvent("Gemini: Extracting timeline from video frames...", "search");
            setTimeline([
                { time: "00:02", desc: "Vehicle A entering intersection at 45km/h", type: "observation" },
                { time: "00:04", desc: "Vehicle B fails to stop at red light", type: "violation" },
                { time: "00:05", desc: "Point of Impact at Center-Left lane", type: "accident" }
            ]);
            avatarSpeak("I am analyzing the video footage. I can see a collision at the intersection where vehicle B failed to yield.");
        }, 2000);

        setTimeout(() => {
            addEvent("Groq: Looking up relevant legal sections (MVA, IPC)...", "search");
            setLegalSections([
                { section: "MVA 184", title: "Dangerous Driving", penalty: "Imprisonment up to 6 months or fine" },
                { section: "IPC 279", title: "Rash Driving on a Public Way", penalty: "Standard legal penalty applies" }
            ]);
            avatarSpeak("Based on my analysis, sections IPC 279 and MVA 184 are applicable here due to rash driving and signal violation.");
        }, 5000);

        setTimeout(() => {
            setAnalysisStatus('complete');
            addEvent("Success: Liability Report Generated", "success");
            setLiabilityReport({
                primaryLiability: "Vehicle B (White SUV)",
                contributoryFactors: ["Signal violation", "Overspeeding"],
                confidence: "94%"
            });
            avatarSpeak("The final liability report is ready. Vehicle B is primarily liable for the accident.");
        }, 8000);
    };

    const addEvent = (text, type) => {
        setEvents(prev => [...prev, { text, type, id: Date.now() }]);
    };

    const avatarSpeak = (text) => {
        setSpeakingText(text);
        setAvatarState('talking');
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            let animationFrameId;
            const simulateLipSync = () => {
                const data = new Float32Array(32);
                for(let i=0; i<32; i++) data[i] = Math.random() * 0.8 + 0.1;
                setAudioData(data);
                animationFrameId = requestAnimationFrame(simulateLipSync);
            };

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => simulateLipSync();
            utterance.onend = () => {
                setAvatarState('idle');
                cancelAnimationFrame(animationFrameId);
                setAudioData(null);
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setVideoUrl(URL.createObjectURL(selectedFile));
            simulateAnalysis();
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 64px)',
            background: 'var(--color-bg-alt)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <header style={{
                padding: '1rem 1.5rem',
                background: 'white',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button 
                  onClick={() => navigate(-1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Accident Forensic Analysis</h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Video Crime Scene Reconstruction</p>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel: Video & Avatar */}
                <div style={{
                    flex: '0 0 400px',
                    background: 'white',
                    borderRight: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1rem'
                }}>
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        background: '#000',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {videoUrl ? (
                            <video 
                              src={videoUrl} 
                              controls 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666' }}>
                                <Video size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '0.9rem' }}>No Video Uploaded</p>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', background: '#f8f9fa' }}>
                        <AvatarPanel 
                          mode={avatarState}
                          audioData={audioData}
                          userName="Virendra"
                        />
                        {speakingText && avatarState === 'talking' && (
                            <div style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: '1rem',
                                right: '1rem',
                                background: 'rgba(255,255,255,0.9)',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                borderLeft: '3px solid var(--color-primary)',
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {speakingText}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area: Timeline & Analysis */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', p: '1.5rem', gap: '1.5rem', overflowY: 'auto', padding: '1.5rem' }}>
                    
                    {/* Upload Area */}
                    {analysisStatus === 'idle' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            border: '2px dashed var(--color-border)',
                            borderRadius: '1rem',
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              style={{ display: 'none' }} 
                              accept="video/*"
                              onChange={handleFileChange}
                            />
                            <div style={{ width: '64px', height: '64px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1rem' }}>
                                <Upload color="var(--color-primary)" size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload Accident Footage</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>MP4, MOV or AVI files up to 500MB</p>
                        </motion.div>
                    )}

                    {/* Progress Tracker */}
                    {analysisStatus !== 'idle' && analysisStatus !== 'complete' && (
                        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Forensic Engine Status</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    {analysisStatus === 'uploading' ? `Uploading ${uploadProgress}%` : 'Processing...'}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div 
                                  style={{ height: '100%', background: 'var(--color-primary)', width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Results Grid */}
                    {analysisStatus !== 'idle' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            
                            {/* Incident Timeline */}
                            <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} /> RECONSTRUCTED TIMELINE
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {timeline.length > 0 ? timeline.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', minWidth: '40px' }}>
                                                {item.time}
                                            </span>
                                            <div style={{ fontSize: '0.85rem' }}>{item.desc}</div>
                                        </div>
                                    )) : (
                                        <div style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic' }}>Waiting for frame analysis...</div>
                                    )}
                                </div>
                            </div>

                            {/* Legal Implications */}
                            <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '1rem', padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={16} /> LEGAL IMPLICATIONS
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {legalSections.length > 0 ? legalSections.map((item, i) => (
                                        <div key={i} style={{ padding: '0.75rem', background: '#fff9f0', border: '1px solid #ffd8a8', borderRadius: '0.5rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e67e22' }}>{item.section}</div>
                                            <div style={{ fontSize: '0.8rem' }}>{item.title}</div>
                                        </div>
                                    )) : (
                                        <div style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic' }}>Analyzing violations...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Live Terminal / Events */}
                    {analysisStatus !== 'idle' && (
                        <div style={{ background: '#1a1a1a', borderRadius: '1rem', padding: '1rem', fontFamily: 'monospace', color: '#10b981', fontSize: '0.8rem', flex: 1, minHeight: '200px' }}>
                            <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Terminal size={14} /> FORENSIC_ENGINE_LOGS
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {events.map((e, i) => (
                                    <div key={i} style={{ marginBottom: '0.25rem' }}>
                                        <span style={{ opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</span> {e.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Final Report Modal/Overlay */}
                    <AnimatePresence>
                        {liabilityReport && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Liability Assessment Ready</h2>
                                    <p style={{ margin: '0.25rem 0 0', opacity: 0.9 }}>Primary Liable Party detected: {liabilityReport.primaryLiability}</p>
                                </div>
                                <button style={{
                                    background: 'white',
                                    color: 'var(--color-primary)',
                                    border: 'none',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FileText size={18} /> View Case Report
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ForensicsPage;
