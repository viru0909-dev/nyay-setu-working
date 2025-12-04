import { Link } from 'react-router-dom';
import { Scale, Shield, Video, FileText, Clock, Award, Brain, Calendar, Search, Users, CheckCircle, ChevronRight } from 'lucide-react';

export default function Landing() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-white)' }}>
            {/* Navigation */}
            <nav style={{
                background: 'var(--color-white)',
                borderBottom: '1px solid var(--color-slate-200)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div className="container" style={{
                    height: '64px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Scale size={32} color="var(--color-royal-blue)" strokeWidth={2.5} />
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: 'var(--color-royal-blue)',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            NyaySetu
                        </h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn btn-secondary">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="py-5" style={{
                background: 'linear-gradient(180deg, var(--color-slate-50) 0%, var(--color-white) 100%)'
            }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1.5rem',
                            background: 'rgba(37, 99, 235, 0.1)',
                            border: '1px solid rgba(37, 99, 235, 0.2)',
                            borderRadius: 'var(--radius-full)',
                            color: 'var(--color-royal-blue)',
                            fontSize: 'var(--text-body-sm)',
                            fontWeight: '600',
                            marginBottom: 'var(--spacing-2xl)'
                        }}>
                            ⚡ India's First AI-Powered Virtual Judiciary
                        </div>

                        <h1 style={{
                            fontSize: 'var(--text-display)',
                            fontWeight: '900',
                            color: 'var(--color-slate-900)',
                            marginBottom: 'var(--spacing-xl)',
                            lineHeight: '1.1',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            AI-Powered Digital Justice<br />
                            <span style={{ color: 'var(--color-royal-blue)' }}>for Every Citizen</span>
                        </h1>

                        <p style={{
                            fontSize: 'var(--text-body-lg)',
                            color: 'var(--color-slate-600)',
                            marginBottom: 'var(--spacing-3xl)',
                            maxWidth: '700px',
                            margin: '0 auto var(--spacing-3xl)'
                        }}>
                            Access justice from anywhere, anytime. File cases, track progress, attend virtual hearings,
                            and get AI-powered legal assistance—all on a single transparent platform.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/signup" className="btn btn-primary btn-lg">
                                File Your Case Now
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Login
                            </Link>
                            <button className="btn btn-ghost btn-lg">
                                Watch Demo <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container py-4">
                <div className="grid grid-cols-4">
                    {[
                        { number: '100+', label: 'District Courts', icon: <Scale size={24} /> },
                        { number: '50K+', label: 'Cases Filed', icon: <FileText size={24} /> },
                        { number: '98%', label: 'Success Rate', icon: <Award size={24} /> },
                        { number: '24/7', label: 'Available', icon: <Clock size={24} /> }
                    ].map((stat, idx) => (
                        <div key={idx} className="card card-stat">
                            <div className="card-stat-icon">
                                {stat.icon}
                            </div>
                            <div className="card-stat-value">{stat.number}</div>
                            <div className="card-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="container py-5">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
                    <h2 style={{
                        fontSize: 'var(--text-h2)',
                        fontWeight: '800',
                        color: 'var(--color-slate-900)',
                        marginBottom: 'var(--spacing-lg)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        Our Services
                    </h2>
                    <p style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-slate-600)', maxWidth: '600px', margin: '0 auto' }}>
                        Everything you need for comprehensive legal case management
                    </p>
                </div>

                <div className="grid grid-cols-4">
                    {[
                        {
                            icon: <FileText size={32} color="var(--color-royal-blue)" />,
                            title: 'Register FIR Online',
                            desc: 'File your complaint online anytime, from anywhere. Simple, secure, and instant.',
                            badge: 'Easy'
                        },
                        {
                            icon: <Search size={32} color="var(--color-indigo)" />,
                            title: 'Case Tracking',
                            desc: 'Track your case status in real-time with instant updates and notifications.',
                            badge: 'Real-time'
                        },
                        {
                            icon: <Brain size={32} color="var(--color-emerald)" />,
                            title: 'AI Legal Assistance',
                            desc: 'Get instant legal guidance powered by advanced AI and precedent analysis.',
                            badge: 'AI Powered'
                        },
                        {
                            icon: <Calendar size={32} color="var(--color-info)" />,
                            title: 'Court Hearing Scheduling',
                            desc: 'Schedule and attend virtual hearings seamlessly with integrated video conferencing.',
                            badge: 'Virtual'
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="card" style={{ position: 'relative', cursor: 'pointer' }}>
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem'
                            }}>
                                <span className="badge badge-primary">{feature.badge}</span>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                {feature.icon}
                            </div>

                            <h4 style={{
                                fontSize: 'var(--text-h5)',
                                fontWeight: '700',
                                color: 'var(--color-slate-900)',
                                marginBottom: 'var(--spacing-md)',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                {feature.title}
                            </h4>

                            <p style={{ color: 'var(--color-slate-600)', lineHeight: '1.6', fontSize: 'var(--text-body-sm)' }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="py-5" style={{ background: 'var(--color-slate-50)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
                        <h2 style={{
                            fontSize: 'var(--text-h2)',
                            fontWeight: '800',
                            color: 'var(--color-slate-900)',
                            marginBottom: 'var(--spacing-lg)',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            How NyaySetu Works
                        </h2>
                    </div>

                    <div className="grid grid-cols-4">
                        {[
                            { num: '1', title: 'Register', desc: 'Create your account in minutes' },
                            { num: '2', title: 'File Case', desc: 'Submit your complaint online' },
                            { num: '3', title: 'Track Progress', desc: 'Monitor case status in real-time' },
                            { num: '4', title: 'Attend Hearing', desc: 'Join virtual court sessions' }
                        ].map((step, idx) => (
                            <div key={idx} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto var(--spacing-lg)',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'linear-gradient(135deg, var(--color-royal-blue) 0%, var(--color-indigo) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-white)',
                                    fontSize: 'var(--text-h3)',
                                    fontWeight: '800',
                                    boxShadow: 'var(--shadow-blue)'
                                }}>
                                    {step.num}
                                </div>
                                <h5 style={{
                                    fontSize: 'var(--text-h5)',
                                    fontWeight: '700',
                                    color: 'var(--color-slate-900)',
                                    marginBottom: 'var(--spacing-sm)',
                                    fontFamily: 'var(--font-heading)'
                                }}>
                                    {step.title}
                                </h5>
                                <p style={{ color: 'var(--color-slate-600)', fontSize: 'var(--text-body-sm)' }}>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Roles */}
            <div className="container py-5">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
                    <h2 style={{
                        fontSize: 'var(--text-h2)',
                        fontWeight: '800',
                        color: 'var(--color-slate-900)',
                        marginBottom: 'var(--spacing-lg)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        Who Uses NyaySetu?
                    </h2>
                </div>

                <div className="grid grid-cols-4">
                    {[
                        {
                            role: 'Citizen',
                            color: 'var(--color-info)',
                            icon: <Users size={48} />,
                            points: ['File complaints', 'Track case status', 'Attend virtual hearings', 'Access documents']
                        },
                        {
                            role: 'Advocate',
                            color: 'var(--color-indigo)',
                            icon: <FileText size={48} />,
                            points: ['Manage client cases', 'Draft legal documents', 'Schedule consultations', 'AI legal research']
                        },
                        {
                            role: 'Judge',
                            color: 'var(--color-emerald)',
                            icon: <Scale size={48} />,
                            points: ['Review pending cases', 'Conduct hearings', 'Access case evidence', 'Publish judgments']
                        },
                        {
                            role: 'Admin',
                            color: 'var(--color-warning)',
                            icon: <Shield size={48} />,
                            points: ['User management', 'System monitoring', 'Analytics dashboard', 'Audit logs']
                        }
                    ].map((user, idx) => (
                        <div key={idx} className="card" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto var(--spacing-lg)',
                                borderRadius: 'var(--radius-full)',
                                background: `linear-gradient(135deg, ${user.color} 0%, ${user.color} 100%)`,
                                opacity: 0.1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', color: user.color }}>
                                    {user.icon}
                                </div>
                            </div>

                            <span className="badge badge-primary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                {user.role}
                            </span>

                            <ul style={{
                                textAlign: 'left',
                                listStyle: 'none',
                                padding: 0,
                                color: 'var(--color-slate-600)',
                                fontSize: 'var(--text-body-sm)'
                            }}>
                                {user.points.map((point, i) => (
                                    <li key={i} style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)'
                                    }}>
                                        <CheckCircle size={16} color="var(--color-emerald)" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-5" style={{
                background: 'linear-gradient(135deg, var(--color-royal-blue) 0%, var(--color-indigo) 100%)',
                color: 'var(--color-white)'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: 'var(--text-h2)',
                        fontWeight: '800',
                        marginBottom: 'var(--spacing-lg)',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        Ready to Experience Digital Justice?
                    </h2>
                    <p style={{ fontSize: 'var(--text-body-lg)', marginBottom: 'var(--spacing-2xl)', opacity: 0.9 }}>
                        Join thousands of lawyers, judges, and citizens using NyaySetu
                    </p>
                    <Link to="/signup">
                        <button className="btn" style={{
                            background: 'var(--color-white)',
                            color: 'var(--color-royal-blue)',
                            fontSize: 'var(--text-body-lg)',
                            padding: '1.25rem 3rem',
                            fontWeight: '700',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            Create Free Account <ChevronRight size={20} />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                background: 'var(--color-slate-900)',
                color: 'var(--color-slate-400)',
                padding: '3rem 0 2rem'
            }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--spacing-3xl)',
                        marginBottom: 'var(--spacing-2xl)',
                        paddingBottom: 'var(--spacing-2xl)',
                        borderBottom: '1px solid var(--color-slate-700)'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 'var(--spacing-lg)' }}>
                                <Scale size={28} color="var(--color-royal-blue)" />
                                <h3 style={{ color: 'var(--color-white)', fontWeight: '800', fontSize: 'var(--text-h5)' }}>NyaySetu</h3>
                            </div>
                            <p style={{ fontSize: 'var(--text-body-sm)', lineHeight: '1.6' }}>
                                India's first AI-powered virtual judiciary platform. Access justice from anywhere.
                            </p>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--color-white)', fontWeight: '700', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-body)' }}>
                                Quick Links
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, fontSize: 'var(--text-body-sm)' }}>
                                <li style={{ marginBottom: 'var(--spacing-sm)' }}><a href="#" style={{ color: 'inherit' }}>About Us</a></li>
                                <li style={{ marginBottom: 'var(--spacing-sm)' }}><a href="#" style={{ color: 'inherit' }}>Services</a></li>
                                <li style={{ marginBottom: 'var(--spacing-sm)' }}><a href="#" style={{ color: 'inherit' }}>Contact</a></li>
                                <li style={{ marginBottom: 'var(--spacing-sm)' }}><a href="#" style={{ color: 'inherit' }}>Help Center</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--color-white)', fontWeight: '700', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-body)' }}>
                                Contact
                            </h4>
                            <p style={{ fontSize: 'var(--text-body-sm)', lineHeight: '1.8' }}>
                                Email: support@nyaysetu.gov.in<br />
                                Phone: 1800-XXX-XXXX<br />
                                Hours: 24/7 Support
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: 'var(--text-body-sm)' }}>
                        <p>© 2024 NyaySetu - India's Virtual Judiciary Platform. All rights reserved.</p>
                        <p style={{ marginTop: 'var(--spacing-sm)' }}>
                            🔒 ISO 27001 Certified • Blockchain Secured • Trusted by 100+ District Courts
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
