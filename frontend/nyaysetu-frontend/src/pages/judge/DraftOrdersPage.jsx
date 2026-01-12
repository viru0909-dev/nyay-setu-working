import { useState, useEffect } from 'react';
import { judgeAPI } from '../../services/api';
import {
    FileText,
    Download,
    Save,
    Loader2,
    Plus,
    Trash2,
    Edit,
    X,
    Clipboard,
    Calendar,
    ChevronDown,
    Search,
    Clock,
    Gavel
} from 'lucide-react';
import axios from 'axios';

export default function DraftOrdersPage() {
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [draftContent, setDraftContent] = useState({
        title: '',
        orderType: 'INTERIM',
        content: '',
        remarks: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await judgeAPI.getCases();
            setCases(response.data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (caseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/orders/case/${caseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        }
    };

    const createOrder = async () => {
        if (!selectedCase || !draftContent.title || !draftContent.content) {
            alert('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/orders', {
                caseId: selectedCase,
                ...draftContent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('✅ Order drafted successfully!');
            setShowDraftModal(false);
            setDraftContent({ title: '', orderType: 'INTERIM', content: '', remarks: '' });
            fetchOrders(selectedCase);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. API may not be available yet.');
        } finally {
            setSaving(false);
        }
    };

    const openDraftModal = () => {
        setDraftContent({
            title: '',
            orderType: 'INTERIM',
            content: generateOrderTemplate(),
            remarks: ''
        });
        setShowDraftModal(true);
    };

    const generateOrderTemplate = () => {
        const caseItem = cases.find(c => c.id === selectedCase);
        return `IN THE COURT OF THE PRINCIPAL DISTRICT AND SESSIONS JUDGE

Case No: NY/${selectedCase?.substring(0, 8).toUpperCase() || 'XXXX-XXXX'}
Case Title: ${caseItem?.title || '[Case Title]'}

PETITIONER: ${caseItem?.petitioner || '[Petitioner Name]'}
RESPONDENT: ${caseItem?.respondent || '[Respondent Name]'}

-------------------------------------------------------------------------
                                 ORDER
-------------------------------------------------------------------------

The matter came up for hearing today. Having heard both parties and perused 
the records available on file, this court observes the following:

[Enter analysis and observations here...]

DECISION:
In view of the above observations, the court hereby orders:

1. [Order point 1]
2. [Order point 2]
3. [Order point 3]

Compliance of this order shall be reported within 14 business days.

DATE: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
LOCATION: DISTRICT COURT SESSIONS

_______________________
PRESIDING JUDGE
NYAY-SETU SECURE SIGNED`;
    };

    const downloadPDF = (order) => {
        const content = `${order.title}\n\n${order.content}\n\nRemarks: ${order.remarks || 'None'}\n\nSigned: ${order.signedDate || 'Not signed'}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `court_order_${order.id.substring(0, 8)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass)'
    };

    const primaryButtonStyle = {
        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.75rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-glass)',
        transition: 'all 0.2s'
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 size={48} className="spin" style={{ color: 'var(--color-accent)' }} />
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    .spin { animation: spin 1s linear infinite; }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Gavel size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Judicial Orders
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Create, manage, and electronically issue court orders
                        </p>
                    </div>
                </div>
            </div>

            {/* Case Selector */}
            <div style={{
                ...glassStyle,
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Search size={20} color="#64748b" />
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'block' }}>
                            Judicial Case File
                        </label>
                        <select
                            value={selectedCase || ''}
                            onChange={(e) => {
                                setSelectedCase(e.target.value || null);
                                if (e.target.value) fetchOrders(e.target.value);
                            }}
                            style={{
                                width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)',
                                fontSize: '1.125rem', fontWeight: '600', outline: 'none', cursor: 'pointer',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none'
                            }}
                        >
                            <option value="" style={{ background: 'var(--bg-glass-strong)' }}>-- Select a case to view orders --</option>
                            {cases.map(c => (
                                <option key={c.id} value={c.id} style={{ background: 'var(--bg-glass-strong)' }}>
                                    {c.title} ({c.caseType})
                                </option>
                            ))}
                        </select>
                    </div>
                    <ChevronDown size={20} color="#64748b" />
                </div>

                {selectedCase && (
                    <button
                        onClick={openDraftModal}
                        style={primaryButtonStyle}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={18} />
                        DRAFT NEW ORDER
                    </button>
                )}
            </div>

            {/* Orders List */}
            {selectedCase && (
                <div style={glassStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                            Case Order Repository
                        </h3>
                        <span style={{
                            padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '700'
                        }}>
                            {orders.length} ORDER{orders.length !== 1 ? 'S' : ''}
                        </span>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <Clipboard size={64} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h4 style={{ color: 'var(--text-secondary)', margin: 0 }}>No orders drafted yet</h4>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Start by clicking "Draft New Order" above</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {orders.map((order) => (
                                <div key={order.id} style={{
                                    background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)',
                                    borderRadius: '1rem',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '10px',
                                            background: 'rgba(99, 102, 241, 0.1)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <FileText size={22} color="#818cf8" />
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                                                {order.title}
                                            </h4>
                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span style={{
                                                    padding: '0.15rem 0.5rem',
                                                    background: 'rgba(99, 102, 241, 0.15)',
                                                    borderRadius: '4px',
                                                    color: 'var(--color-accent)',
                                                    fontWeight: '700',
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {order.orderType}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={14} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span style={{
                                                    color: order.status === 'SIGNED' ? '#4ade80' : 'var(--color-accent)',
                                                    fontWeight: '700'
                                                }}>
                                                    {order.status || 'DRAFT'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => downloadPDF(order)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                color: '#818cf8', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                            title="Download Order"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Draft Modal */}
            {showDraftModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '2rem'
                }} onClick={() => setShowDraftModal(false)}>
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        backdropFilter: 'var(--glass-blur)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        border: 'var(--border-glass-strong)',
                        boxShadow: 'var(--shadow-glass)',
                        position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    background: 'rgba(99, 102, 241, 0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Plus size={24} color="#818cf8" />
                                </div>
                                <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Draft Judicial Order</h2>
                            </div>
                            <button
                                onClick={() => setShowDraftModal(false)}
                                style={{ background: 'var(--bg-glass)', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                    Order Subject / Title *
                                </label>
                                <input
                                    type="text"
                                    value={draftContent.title}
                                    onChange={e => setDraftContent({ ...draftContent, title: e.target.value })}
                                    placeholder="e.g., Interim Stay Order"
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)',
                                        outline: 'none', transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                    Classification
                                </label>
                                <select
                                    value={draftContent.orderType}
                                    onChange={e => setDraftContent({ ...draftContent, orderType: e.target.value })}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-glass)',
                                        border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)',
                                        outline: 'none', cursor: 'pointer',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        appearance: 'none'
                                    }}
                                >
                                    <option value="INTERIM">Interim Order</option>
                                    <option value="FINAL">Final Order</option>
                                    <option value="STAY">Stay Order</option>
                                    <option value="DIRECTION">Direction</option>
                                    <option value="JUDGMENT">Judgment</option>
                                </select>
                                <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: '1rem', bottom: '1rem', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                Order Proclamation *
                            </label>
                            <textarea
                                value={draftContent.content}
                                onChange={e => setDraftContent({ ...draftContent, content: e.target.value })}
                                rows={15}
                                style={{
                                    width: '100%', padding: '1.25rem', background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)',
                                    fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9rem', resize: 'vertical',
                                    lineHeight: '1.6', outline: 'none'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                                Internal Judicial Remarks
                            </label>
                            <textarea
                                value={draftContent.remarks}
                                onChange={e => setDraftContent({ ...draftContent, remarks: e.target.value })}
                                rows={2}
                                placeholder="Confidential metadata or internal notes..."
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)', borderRadius: '0.75rem', color: 'var(--text-main)',
                                    outline: 'none'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDraftModal(false)}
                                style={{
                                    padding: '0.75rem 2rem', background: 'var(--bg-glass)',
                                    border: 'var(--border-glass)', borderRadius: '0.75rem',
                                    color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)'}
                                onMouseOut={e => e.currentTarget.style.background = 'rgba(71, 85, 105, 0.2)'}
                            >
                                DISCARD
                            </button>
                            <button
                                onClick={createOrder}
                                disabled={saving}
                                style={{
                                    ...primaryButtonStyle,
                                    padding: '0.75rem 2.5rem',
                                    justifyContent: 'center'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {saving ? <Loader2 size={20} className="spin" /> : <Save size={20} />}
                                VALIDATE & SAVE DRAFT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
