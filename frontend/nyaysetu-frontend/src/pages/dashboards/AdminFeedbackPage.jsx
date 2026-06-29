import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { feedbackAPI } from '../../services/api';

export default function AdminFeedbackPage() {
    const { user } = useAuthStore();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFeedback = async () => {
            try {
                const response = await feedbackAPI.getAll();
                setFeedbacks(response.data || []);
            } catch (error) {
                console.error('Failed to load feedback:', error);
            } finally {
                setLoading(false);
            }
        };
        loadFeedback();
    }, []);

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Feedback Review</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                        Reviewing user feedback submitted through the litigant portal.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Signed in as</p>
                    <p style={{ margin: 0, fontWeight: 700 }}>{user?.name || user?.email}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                    <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>Recent Feedback</h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Total submissions: {feedbacks.length}</p>
                </div>
                <div style={{ background: 'var(--bg-surface)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                    <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>Quick Overview</h2>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-secondary)' }}>
                        <li>Feedback categories are grouped by users and priorities.</li>
                        <li>Screenshot attachments are stored securely on disk.</li>
                        <li>Admins may follow up directly using notifications.</li>
                    </ul>
                </div>
            </div>

            {loading && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading feedback...
                </div>
            )}

            {!loading && feedbacks.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No feedback submissions have been received yet.
                </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {feedbacks.map((item) => (
                    <div key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '1rem', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>From: {item.userName || item.userEmail}</p>
                                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: '700' }}>{item.subject || item.category || 'User feedback'}</h3>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Category: {item.category}</p>
                                <p style={{ margin: '0.35rem 0 0', fontWeight: '700' }}>Rating: {item.rating || 'N/A'} / 5</p>
                            </div>
                        </div>
                        <p style={{ margin: '0 0 1rem', color: 'var(--text-main)' }}>{item.message}</p>
                        {item.screenshotPath && (
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Screenshot: {item.screenshotPath}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
