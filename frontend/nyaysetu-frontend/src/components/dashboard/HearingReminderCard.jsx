import { Calendar, Clock, AlertCircle, CheckCircle2, Video } from 'lucide-react';

/**
 * HearingReminderCard - Displays a single hearing reminder with status
 * 
 * Props:
 * - hearing: {Object} Hearing data with id, caseTitle, scheduledDate, formattedDate, formattedTime, status, videoRoomId, caseId
 * - isNearest: {Boolean} Whether this is the nearest upcoming hearing
 * - onViewDetails: {Function} Callback when "View Details" is clicked
 */
export default function HearingReminderCard({ hearing, isNearest = false, onViewDetails }) {
    // Determine if hearing is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hearingDate = new Date(hearing.scheduledDate);
    const hearingDateOnly = new Date(hearingDate);
    hearingDateOnly.setHours(0, 0, 0, 0);
    
    const isToday = hearingDate.getTime() === today.getTime();
    
    // Calculate days until hearing
    const daysUntil = Math.floor((hearingDateOnly - today) / (1000 * 60 * 60 * 24));
    
    // Get status color and label
    const getStatusInfo = () => {
        if (isToday) return { label: 'TODAY', color: 'var(--color-error)', bgColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' };
        if (daysUntil === 1) return { label: 'TOMORROW', color: 'var(--color-warning)', bgColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' };
        return { label: `IN ${daysUntil} DAYS`, color: 'var(--color-success)', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' };
    };
    
    const statusInfo = getStatusInfo();

    return (
        <div
            style={{
                padding: '1.25rem',
                background: isNearest ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-glass)',
                border: isNearest 
                    ? '2px solid var(--color-accent)' 
                    : 'var(--border-glass)',
                borderRadius: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Highlight indicator for nearest hearing */}
            {isNearest && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, var(--color-accent), transparent)',
                        animation: 'slideRight 2s infinite'
                    }}
                />
            )}

            {/* Header with nearest badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                            margin: 0,
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {hearing.caseTitle}
                        </h3>
                        {isNearest && (
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '2rem',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                background: 'rgba(99, 102, 241, 0.2)',
                                color: 'var(--color-accent)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                whiteSpace: 'nowrap'
                            }}>
                                ⭐ NEAREST
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Status badge */}
                <span
                    style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '2rem',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.borderColor}`,
                        whiteSpace: 'nowrap',
                        marginLeft: '0.5rem'
                    }}
                >
                    {statusInfo.label}
                </span>
            </div>

            {/* Hearing Details Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
            }}>
                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Calendar size={18} color="var(--color-accent)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>DATE</p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: '600' }}>
                            {hearing.formattedDate}
                        </p>
                    </div>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Clock size={18} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>TIME</p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: '600' }}>
                            {hearing.formattedTime}
                        </p>
                    </div>
                </div>

                {/* Room/Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Video size={18} color="var(--color-success)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>ROOM</p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: '600' }}>
                            {hearing.videoRoomId || 'Virtual'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => onViewDetails?.(hearing)}
                style={{
                    width: '100%',
                    background: isNearest 
                        ? 'var(--color-accent)' 
                        : 'var(--bg-glass)',
                    border: isNearest 
                        ? 'none' 
                        : 'var(--border-glass)',
                    color: isNearest 
                        ? 'white' 
                        : 'var(--color-accent)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                {isNearest ? (
                    <>
                        <AlertCircle size={16} /> View & Prepare
                    </>
                ) : (
                    <>
                        <CheckCircle2 size={16} /> View Details
                    </>
                )}
            </button>

            {/* CSS Animation for highlight */}
            <style>{`
                @keyframes slideRight {
                    0% { width: 0%; }
                    50% { width: 100%; }
                    100% { width: 0%; }
                }
            `}</style>
        </div>
    );
}
