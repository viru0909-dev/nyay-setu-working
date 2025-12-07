import { X, Brain, MessageCircle, BookOpen, FileText, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function AIAssistantModal({ isOpen, onClose }) {
    const { language } = useLanguage();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const capabilities = [
        {
            icon: MessageCircle,
            title: language === 'en' ? 'Legal Guidance' : 'कानूनी मार्गदर्शन',
            desc: language === 'en'
                ? 'Get instant answers to legal questions 24/7'
                : '24/7 कानूनी प्रश्नों के तत्काल उत्तर प्राप्त करें',
            action: () => {
                onClose();
                navigate('/');
                setTimeout(() => {
                    const chatbot = document.querySelector('#chatbot');
                    if (chatbot) chatbot.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        },
        {
            icon: BookOpen,
            title: language === 'en' ? 'Constitution Q&A' : 'संविधान प्रश्नोत्तर',
            desc: language === 'en'
                ? 'Ask questions about Indian Constitution articles'
                : 'भारतीय संविधान के अनुच्छेदों के बारे में पूछें',
            action: () => {
                onClose();
                navigate('/constitution');
            }
        },
        {
            icon: FileText,
            title: language === 'en' ? 'Document Help' : 'दस्तावेज़ सहायता',
            desc: language === 'en'
                ? 'Assistance with legal documents and filings'
                : 'कानूनी दस्तावेज़ों और फाइलिंग में सहायता',
            action: () => {
                onClose();
                navigate('/');
                setTimeout(() => {
                    const chatbot = document.querySelector('#chatbot');
                    if (chatbot) chatbot.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        },
        {
            icon: Shield,
            title: language === 'en' ? 'Rights Information' : 'अधिकार जानकारी',
            desc: language === 'en'
                ? 'Learn about your fundamental and legal rights'
                : 'अपने मौलिक और कानूनी अधिकारों के बारे में जानें',
            action: () => {
                onClose();
                navigate('/constitution');
            }
        }
    ];

    const sampleQuestions = language === 'en'
        ? [
            "What are my fundamental rights?",
            "How do I file a case online?",
            "Explain Article 21 of the Constitution",
            "What is bail and how does it work?",
            "How to find a lawyer near me?"
        ]
        : [
            "मेरे मौलिक अधिकार क्या हैं?",
            "मैं ऑनलाइन मामला कैसे दर्ज करूं?",
            "संविधान के अनुच्छेद 21 को समझाएं",
            "जमानत क्या है और यह कैसे काम करती है?",
            "मेरे पास वकील कैसे खोजें?"
        ];

    const handleQuestionClick = (question) => {
        onClose();
        navigate('/');
        setTimeout(() => {
            const chatbot = document.querySelector('#chatbot');
            if (chatbot) {
                chatbot.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('prefillChatQuestion', { detail: question }));
            }
        }, 100);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
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
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '2rem',
                            position: 'relative'
                        }}
                    >
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                right: '1.5rem',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '0.75rem',
                                width: '3rem',
                                height: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                transition: 'all 0.3s',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                                e.currentTarget.style.borderColor = '#8b5cf6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            }}
                        >
                            <X size={24} />
                        </motion.button>

                        <div style={{ padding: '3rem' }}>
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                style={{ textAlign: 'center', marginBottom: '3rem' }}
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: 'reverse'
                                    }}
                                    style={{
                                        display: 'inline-block',
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        borderRadius: '1.5rem',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    <Brain size={48} color="white" />
                                </motion.div>

                                <h2 style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '900',
                                    color: 'white',
                                    marginBottom: '1rem',
                                    background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {language === 'en' ? 'AI-Powered Legal Brain' : 'AI-संचालित कानूनी मस्तिष्क'}
                                </h2>

                                <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                                    {language === 'en'
                                        ? 'Your intelligent assistant that understands Indian law, guides you through legal processes, and provides instant answers to your legal queries.'
                                        : 'आपका बुद्धिमान सहायक जो भारतीय कानून को समझता है, कानूनी प्रक्रियाओं में आपका मार्गदर्शन करता है, और आपके कानूनी प्रश्नों के तत्काल उत्तर प्रदान करता है।'
                                    }
                                </p>
                            </motion.div>

                            {/* Capabilities */}
                            <div style={{ marginBottom: '3rem' }}>
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {language === 'en' ? '🚀 What Can I Do?' : '🚀 मैं क्या कर सकता हूं?'}
                                </motion.h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {capabilities.map((cap, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + idx * 0.1 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={cap.action}
                                            style={{
                                                padding: '1.5rem',
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '1rem',
                                                transition: 'all 0.3s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                                e.currentTarget.style.borderColor = '#8b5cf6';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <cap.icon size={32} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
                                            <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                                {cap.title}
                                            </h4>
                                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                {cap.desc}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Sample Questions */}
                            <div style={{ marginBottom: '2rem' }}>
                                <motion.h3
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    style={{
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        color: 'white',
                                        marginBottom: '1.5rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {language === 'en' ? '💡 Try Asking' : '💡 पूछने का प्रयास करें'}
                                </motion.h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {sampleQuestions.map((question, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + idx * 0.1 }}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleQuestionClick(question)}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                background: 'rgba(30, 41, 59, 0.6)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                                borderRadius: '0.75rem',
                                                color: '#94a3b8',
                                                fontSize: '0.95rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                                e.currentTarget.style.borderColor = '#8b5cf6';
                                                e.currentTarget.style.color = '#a78bfa';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                                                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            }}
                                        >
                                            "{question}"
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Privacy Notice */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3 }}
                                style={{
                                    padding: '1.5rem',
                                    background: 'rgba(236, 72, 153, 0.1)',
                                    border: '1px solid rgba(236, 72, 153, 0.3)',
                                    borderRadius: '1rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                                    <Shield size={24} style={{ color: '#ec4899', flexShrink: 0, marginTop: '0.25rem' }} />
                                    <div>
                                        <h4 style={{ color: '#ec4899', fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                            {language === 'en' ? 'Privacy & Security' : 'गोपनीयता और सुरक्षा'}
                                        </h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                                            {language === 'en'
                                                ? 'Your conversations are encrypted and private. We never store or share your personal information. All AI responses are for informational purposes only and should not be considered as legal advice.'
                                                : 'आपकी बातचीत एन्क्रिप्टेड और निजी है। हम कभी भी आपकी व्यक्तिगत जानकारी संग्रहीत या साझा नहीं करते हैं। सभी AI प्रतिक्रियाएं केवल सूचनात्मक उद्देश्यों के लिए हैं और इन्हें कानूनी सलाह नहीं माना जाना चाहिए।'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                style={{ textAlign: 'center', marginTop: '2rem' }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        onClose();
                                        navigate('/');
                                        setTimeout(() => {
                                            const chatbot = document.querySelector('#chatbot');
                                            if (chatbot) chatbot.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '1.125rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <Sparkles size={20} />
                                    {language === 'en' ? 'Start Chatting Now!' : 'अभी चैट करना शुरू करें!'}
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
