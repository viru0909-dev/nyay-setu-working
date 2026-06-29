import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Clock, Globe, ArrowRight } from 'lucide-react';
import Header from '../components/landing/Header';
import Footer from '../components/landing/Footer';
import ScrollTopButton from '../components/landing/ScrollTopButton';

export default function Contact() {
    useEffect(() => {
        document.title = "Contact Us | NyaySetu - AI-Powered Judiciary Platform";
        const meta = document.querySelector('meta[name="description"]');
        if (meta) {
            meta.setAttribute("content", "Get in touch with the NyaySetu team for queries, technical support, or feedback on our AI-powered digital justice platform.");
        }
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const validateForm = () => {
        const tempErrors = {};
        if (!formData.name.trim()) tempErrors.name = "Full Name is required";
        if (!formData.email.trim()) {
            tempErrors.email = "Email Address is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address";
        }
        if (!formData.message.trim()) {
            tempErrors.message = "Message cannot be empty";
        } else if (formData.message.trim().length < 10) {
            tempErrors.message = "Message must be at least 10 characters";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // Simulate API request to backend (e.g. 2s network latency)
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() < 0.05) {
                        reject(new Error("Unable to send message due to a connection timeout. Please try again."));
                    } else {
                        resolve();
                    }
                }, 2000);
            });
            setSuccess(true);
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
        } catch (err) {
            setSubmitError(err.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '2rem',
        boxShadow: 'var(--shadow-glass-strong)',
        padding: '3rem',
    };

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '0.85rem 1.2rem',
        background: 'var(--bg-input)',
        border: hasError ? '1.5px solid var(--color-error)' : '1px solid var(--border-light)',
        borderRadius: '0.75rem',
        color: 'var(--text-main)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <Header hideAuthButtons={false} />

            <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
                {/* Hero / Header Section */}
                <section style={{
                    padding: '6rem 2rem 3rem',
                    textAlign: 'center',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-light)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                        width: '600px', height: '600px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 60%)',
                        pointerEvents: 'none', zIndex: 0
                    }} />

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span style={{
                                display: 'inline-block',
                                padding: '0.4rem 1.2rem',
                                background: 'rgba(63, 93, 204, 0.08)',
                                border: '1px solid rgba(63, 93, 204, 0.15)',
                                borderRadius: '2rem',
                                color: 'var(--color-secondary)',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1.5rem'
                            }}>
                                Get In Touch
                            </span>
                            <h1 style={{
                                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                fontWeight: '900',
                                color: 'var(--text-main)',
                                marginBottom: '1.25rem',
                                lineHeight: '1.2',
                                letterSpacing: '-0.02em'
                            }}>
                                We'd Love to{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #7C5CFF 0%, #3F5DCC 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    Hear From You
                                </span>
                            </h1>
                            <p style={{
                                fontSize: '1.15rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.7',
                                maxWidth: '650px',
                                margin: '0 auto'
                            }}>
                                Have a question about NyaySetu? Need technical assistance or want to suggest feedback? Use the form below or contact us via our channels.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Form & Info Section */}
                <section style={{ padding: '5rem 2rem' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '4rem',
                            alignItems: 'start'
                        }}>
                            {/* Contact Details Column */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                            >
                                <div style={{ ...glassStyle, padding: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                                        Contact Information
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                                        Feel free to reach out to us using any of the contact channels below. We strive to respond to all inquiries within 24 hours.
                                    </p>

                                    {/* Info items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                background: 'rgba(124, 92, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '0.75rem',
                                                display: 'flex',
                                                color: '#7C5CFF'
                                            }}>
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Us</h4>
                                                <a href="mailto:support@nyaysetu.in" style={{ color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none' }}>
                                                    support@nyaysetu.in
                                                </a>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                borderRadius: '12px',
                                                padding: '0.75rem',
                                                display: 'flex',
                                                color: '#10B981'
                                            }}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Response Time</h4>
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                                    Within 24 Hours
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                background: 'rgba(63, 93, 204, 0.1)',
                                                borderRadius: '12px',
                                                padding: '0.75rem',
                                                display: 'flex',
                                                color: '#3F5DCC'
                                            }}>
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Location</h4>
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                                                    Mumbai, Maharashtra, India
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FAQ Quick Link Card */}
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.08) 0%, rgba(63, 93, 204, 0.08) 100%)',
                                    border: '1px solid rgba(124, 92, 255, 0.15)',
                                    borderRadius: '2rem',
                                    padding: '2.5rem',
                                    textAlign: 'center'
                                }}>
                                    <MessageSquare size={36} color="#7C5CFF" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                        Looking for Quick Answers?
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                        Browse our FAQ section to find answers to commonly asked questions about our AI Assistant and case filing system.
                                    </p>
                                    <Link to="/faq" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '0.75rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s'
                                    }}>
                                        Visit FAQ Page <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Form Column */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <div style={glassStyle}>
                                    <AnimatePresence mode="wait">
                                        {success ? (
                                            /* Success Screen */
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                style={{ textAlign: 'center', padding: '1rem 0' }}
                                            >
                                                <div style={{
                                                    width: '72px', height: '72px', borderRadius: '50%',
                                                    background: 'rgba(16, 185, 129, 0.1)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto 1.5rem', color: 'var(--color-success)'
                                                }}>
                                                    <CheckCircle2 size={40} />
                                                </div>

                                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                                                    Message Sent!
                                                </h2>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                                    Thank you for getting in touch. Your message has been submitted successfully, and our support team will review it shortly.
                                                </p>

                                                <button
                                                    onClick={() => setSuccess(false)}
                                                    style={{
                                                        padding: '0.85rem 2rem',
                                                        background: 'var(--color-primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.75rem',
                                                        cursor: 'pointer',
                                                        fontWeight: '700',
                                                        fontSize: '1rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Send Another Message
                                                </button>
                                            </motion.div>
                                        ) : (
                                            /* Form Screen */
                                            <motion.form
                                                key="form"
                                                onSubmit={handleSubmit}
                                                noValidate
                                                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                            >
                                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                    Send Us a Message
                                                </h2>

                                                {submitError && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '1rem',
                                                        background: 'rgba(239, 68, 68, 0.08)',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '0.75rem',
                                                        color: 'var(--color-error)',
                                                        fontSize: '0.95rem'
                                                    }}>
                                                        <AlertCircle size={20} style={{ flexShrink: 0 }} />
                                                        <span>{submitError}</span>
                                                    </div>
                                                )}

                                                {/* Full Name */}
                                                <div>
                                                    <label htmlFor="name-input" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        id="name-input"
                                                        type="text"
                                                        name="name"
                                                        placeholder="Your full name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        disabled={submitting}
                                                        style={inputStyle(errors.name)}
                                                    />
                                                    {errors.name && (
                                                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.35rem' }}>
                                                            {errors.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Email Address */}
                                                <div>
                                                    <label htmlFor="email-input" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        id="email-input"
                                                        type="email"
                                                        name="email"
                                                        placeholder="you@example.com"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        disabled={submitting}
                                                        style={inputStyle(errors.email)}
                                                    />
                                                    {errors.email && (
                                                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.35rem' }}>
                                                            {errors.email}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Subject */}
                                                <div>
                                                    <label htmlFor="subject-input" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                        Subject
                                                    </label>
                                                    <select
                                                        id="subject-input"
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleInputChange}
                                                        disabled={submitting}
                                                        style={{
                                                            ...inputStyle(false),
                                                            appearance: 'none',
                                                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                                                            backgroundPosition: 'right 1rem center',
                                                            backgroundSize: '1.25rem',
                                                            backgroundRepeat: 'no-repeat',
                                                            paddingRight: '2.5rem'
                                                        }}
                                                    >
                                                        <option value="General Inquiry">General Inquiry</option>
                                                        <option value="Technical Support">Technical Support</option>
                                                        <option value="Legal Consultation">Legal Consultation</option>
                                                        <option value="Feedback">Feedback</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>

                                                {/* Message */}
                                                <div>
                                                    <label htmlFor="message-input" style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                                                        Message *
                                                    </label>
                                                    <textarea
                                                        id="message-input"
                                                        name="message"
                                                        placeholder="Tell us what you need help with..."
                                                        value={formData.message}
                                                        onChange={handleInputChange}
                                                        disabled={submitting}
                                                        rows={5}
                                                        style={{
                                                            ...inputStyle(errors.message),
                                                            resize: 'vertical',
                                                            minHeight: '120px'
                                                        }}
                                                    />
                                                    {errors.message && (
                                                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.35rem' }}>
                                                            {errors.message}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Submit Button */}
                                                <button
                                                    id="contact-submit-btn"
                                                    type="submit"
                                                    disabled={submitting}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem',
                                                        background: submitting ? 'var(--bg-glass-hover)' : 'var(--color-primary)',
                                                        color: submitting ? 'var(--text-secondary)' : 'white',
                                                        border: 'none',
                                                        borderRadius: '0.75rem',
                                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                                        fontSize: '1.05rem',
                                                        fontWeight: '700',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        transition: 'all 0.2s',
                                                        marginTop: '0.5rem',
                                                        boxShadow: submitting ? 'none' : '0 4px 15px rgba(63, 93, 204, 0.25)'
                                                    }}
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 size={20} className="animate-spin" />
                                                            Sending Message...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send size={18} />
                                                            Send Message
                                                        </>
                                                    )}
                                                </button>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <ScrollTopButton className="scroll-top-bottom-low" />
            <Footer />

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                input:focus, select:focus, textarea:focus {
                    border-color: var(--border-focus) !important;
                    box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.15) !important;
                }
            `}</style>
        </div>
    );
}
