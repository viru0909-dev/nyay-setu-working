import { scheduleHearingReminder } from '../../utils/HearingReminder';
import { useState, useEffect } from 'react';
import {
    Video,
    Calendar,
    Clock,
    MapPin,
    User,
    Shield,
    Phone,
    ArrowLeft,
    Loader2,
    Activity,
    ArrowUpRight,
    Search,
    BookOpen,
    Bell,
    Trash2
} from 'lucide-react';
import { hearingAPI, hearingReminderAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function HearingsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCall, setActiveCall] = useState(null);
    const [reminders, setReminders] = useState({});
    const [selectedHearing, setSelectedHearing] = useState(null);
    const [reminderTimeOption, setReminderTimeOption] = useState('15');
    const [customTime, setCustomTime] = useState('');
    const [reminderMessage, setReminderMessage] = useState('');
    const [savingReminder, setSavingReminder] = useState(false);
    const { t } = useTranslation('litigant');

    useEffect(() => {
        fetchHearings();
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const response = await hearingReminderAPI.list();
            const reminderList = response.data || [];
            const reminderMap = {};
            reminderList.forEach(r => {
                if (r.hearingId) {
                    reminderMap[r.hearingId] = r;
                }
            });
            setReminders(reminderMap);
        } catch (error) {
            // Error handled silently or in UI
        }
    };

    const fetchHearings = async () => {
        try {
            const response = await hearingAPI.getMyHearings();
            const rawHearings = response.data || [];

            // Transform to UI format
            const formatted = rawHearings.map(h => {
                // Backend sends scheduledDate (we fixed this earlier)
                const date = new Date(h.scheduledDate);
                return {
                    ...h,
                    fullDate: date,
                    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    dateStr: date.toLocaleDateString([], { month: 'short', day: '2-digit' }),
                    isUpcoming: isUpcoming(date),
                    canJoin: canJoin(date)
                };
            });

            // Sort by date
            formatted.sort((a, b) => a.fullDate - b.fullDate);
            setHearings(formatted);
        } catch (error) {
            alert(t('hearings.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (date) => new Date(date) > new Date();

    const canJoin = (date) => {
        const now = new Date();
        const start = new Date(date);
        const diffMinutes = (start - now) / (1000 * 60);
        return diffMinutes <= 15 && diffMinutes > -120; // 15 mins before up to 2 hours late
    };

    const joinHearing = (hearing) => {
        setActiveCall({
            ...hearing,
            room: hearing.videoRoomId || `nyaysetu-${hearing.id.substring(0, 8)}`
        });
    };

    const endCall = () => {
        setActiveCall(null);
    };

    const openReminderModal = (hearing) => {
        setSelectedHearing(hearing);
        const existingReminder = reminders[hearing.id];
        if (existingReminder) {
            setReminderMessage(existingReminder.reminderMessage || '');
            const schedTime = new Date(hearing.scheduledDate).getTime();
            const remTime = new Date(existingReminder.reminderTime).getTime();
            const diffMins = Math.round((schedTime - remTime) / (60 * 1000));
            
            if ([15, 30, 60, 120, 1440].includes(diffMins)) {
                setReminderTimeOption(diffMins.toString());
                setCustomTime('');
            } else {
                setReminderTimeOption('custom');
                const date = new Date(existingReminder.reminderTime);
                const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                setCustomTime(formatted);
            }
        } else {
            setReminderMessage('');
            setReminderTimeOption('15');
            setCustomTime('');
        }
    };

    const saveReminder = async () => {
        if (!selectedHearing) return;
        setSavingReminder(true);
        try {
            let reminderTimeStr = '';
            if (reminderTimeOption === 'custom') {
                if (!customTime) {
                    alert('Please select a custom date and time');
                    setSavingReminder(false);
                    return;
                }
                reminderTimeStr = customTime;
            } else {
                const offsetMins = parseInt(reminderTimeOption);
                const scheduled = new Date(selectedHearing.scheduledDate);
                const reminderDate = new Date(scheduled.getTime() - offsetMins * 60 * 1000);
                reminderTimeStr = new Date(reminderDate.getTime() - reminderDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            }

            await hearingReminderAPI.create({
                hearingId: selectedHearing.id,
                reminderTime: reminderTimeStr,
                reminderMessage: reminderMessage
            });

            alert('Reminder saved successfully!');
            setSelectedHearing(null);
            fetchReminders();
        } catch (error) {
            alert('Failed to save reminder');
        } finally {
            setSavingReminder(false);
        }
    };

    const deleteReminder = async () => {
        if (!selectedHearing) return;
        const existingReminder = reminders[selectedHearing.id];
        if (!existingReminder) return;

        if (confirm('Are you sure you want to delete this reminder?')) {
            setSavingReminder(true);
            try {
                await hearingReminderAPI.delete(existingReminder.id);
                alert('Reminder deleted successfully!');
                setSelectedHearing(null);
                fetchReminders();
            } catch (error) {
                alert('Failed to delete reminder');
            } finally {
                setSavingReminder(false);
            }
        }
    };

    // Calendar & filtering logic
    const today = new Date();
    const currentDay = today.getDay();
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const hearingDates = new Set(hearings.map(h => h.fullDate ? h.fullDate.toDateString() : ''));

    const filteredHearings = hearings.filter(h =>
        (h.caseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.caseId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    if (activeCall) {
        return (
            <div className="active-call-container" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="active-call-header" style={{
                    ...glassStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-glass-strong)', borderRadius: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={endCall} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>{activeCall.caseTitle || t('hearings.courtHearing')}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                <Shield size={12} color="#4ade80" /> <span>{t('hearings.secureLine')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="active-call-status" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '800', fontSize: '0.875rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'blink 1.5s infinite' }} /> {t('hearings.sessionLive')}
                        </div>
                        <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                <div className="active-call-video" style={{ flex: 1, position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: 'var(--border-glass-strong)', boxShadow: 'var(--shadow-glass)' }}>
                    <iframe
                        src={`https://meet.jit.si/${activeCall.room}#config.prejoinConfig.enabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="Court Hearing"
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.5rem' }}>
                    <button onClick={endCall} style={{
                        padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', borderRadius: '9999px',
                        color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)', transition: 'all 0.2s', letterSpacing: '0.5px'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <Phone size={20} /> {t('hearings.leaveSession')}
                    </button>
                    <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="hearings-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="hearings-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <Video size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            {t('hearings.title')}
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            {t('hearings.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="hearings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem' }}>
                {/* List Column */}
                <div className="hearings-list-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="hearings-search-bar" style={{ ...glassStyle, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type="text"
                                placeholder={t('hearings.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                                style={{
                                    background: 'var(--bg-glass)', border: 'var(--border-glass)', borderRadius: '0.75rem',
                                    padding: '0.6rem 1rem 0.6rem 2.5rem', color: 'var(--text-main)', outline: 'none', width: '300px'
                                }}
                            />
                            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ ...glassStyle, padding: '3rem', textAlign: 'center' }}>
                            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>{t('hearings.loading')}</p>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
                        </div>
                    ) : filteredHearings.length === 0 ? (
                        <div style={{ ...glassStyle, padding: '4rem', textAlign: 'center' }}>
                            <Calendar size={48} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}>{t('hearings.noHearings')}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{t('hearings.noHearingsDescription')}</p>
                        </div>
                    ) : (
                        filteredHearings.map(hearing => {
                            const isToday = hearing.fullDate.toDateString() === today.toDateString();
                            return (
                                <div key={hearing.id} className="hearing-card" style={{
                                    ...glassStyle, padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center',
                                    transition: 'all 0.2s', opacity: hearing.canJoin || hearing.isUpcoming ? 1 : 0.7
                                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>

                                    <div className="hearing-date-box" style={{
                                        width: '70px', height: '70px', borderRadius: '15px',
                                        background: isToday ? 'rgba(74, 222, 128, 0.1)' : 'rgba(30, 42, 68, 0.05)',
                                        border: isToday ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(30, 42, 68, 0.2)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: isToday ? '#22c55e' : 'var(--color-primary)', fontWeight: '600', textTransform: 'uppercase' }}>
                                            {hearing.dateStr}
                                        </span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
                                            {hearing.fullDate.getDate()}
                                        </span>
                                    </div>

                                    <div className="hearing-info" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.25rem' }}>
                                                {hearing.caseTitle}
                                            </h3>
                                            {isToday && hearing.isUpcoming && (
                                                <span className="today-badge" style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(74, 222, 128, 0.1)', color: '#22c55e', fontSize: '0.65rem', fontWeight: '800' }}>TODAY</span>
                                            )}
                                        </div>
                                        <div className="hearing-meta" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} /> {hearing.time}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {t('hearings.virtualCourt')}</div>
                                        </div>
                                    </div>

                                    <div className="hearing-action" style={{ display: 'flex', alignItems: 'center' }}>
                                        {hearing.isUpcoming && (
                                            <button 
                                                onClick={() => openReminderModal(hearing)} 
                                                style={{
                                                    background: reminders[hearing.id] ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: reminders[hearing.id] ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid var(--border-light)',
                                                    borderRadius: '0.75rem',
                                                    padding: '0.65rem',
                                                    color: reminders[hearing.id] ? '#22c55e' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s',
                                                    marginRight: '0.75rem'
                                                }}
                                                title={reminders[hearing.id] ? "Reminder Set" : "Set Reminder"}
                                            >
                                                <Bell size={18} fill={reminders[hearing.id] ? "#22c55e" : "none"} />
                                            </button>
                                        )}

                                        {hearing.canJoin ? (
                                            <button onClick={() => joinHearing(hearing)} style={{
                                                background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '0.75rem',
                                                padding: '0.75rem 1.5rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                boxShadow: '0 4px 12px rgba(30, 42, 68, 0.3)'
                                            }}>
                                                <Video size={18} /> {t('hearings.joinNow')}
                                            </button>
                                        ) : (
                                            <div style={{
                                                padding: '0.75rem 1.5rem', borderRadius: '0.75rem', background: 'rgba(100, 116, 139, 0.1)',
                                                color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem'
                                            }}>
                                                {hearing.isUpcoming ? t('hearings.upcoming') : t('hearings.completed')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar */}
                <div className="hearings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="overview-card" style={glassStyle}>
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="var(--color-primary)" /> {t('hearings.weeklyOverview')}
                        </h3>
                        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '800' }}>{day}</div>
                            ))}
                            {weekDates.map((date, i) => {
                                const isDateToday = date.toDateString() === today.toDateString();
                                const hasHearing = hearingDates.has(date.toDateString());
                                return (
                                    <div key={i} style={{
                                        height: '35px', borderRadius: '8px',
                                        background: isDateToday ? 'rgba(30, 42, 68, 0.1)' : (hasHearing ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 255, 255, 0.03)'),
                                        border: isDateToday ? '1px solid var(--color-primary)' : (hasHearing ? '1px solid rgba(76, 209, 55, 0.2)' : '1px solid transparent'),
                                        color: isDateToday ? 'var(--color-primary)' : (hasHearing ? '#4cd137' : 'var(--text-secondary)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700'
                                    }}>{date.getDate()}</div>
                                );
                            })}
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('hearings.yourHearings')}</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{hearings.filter(h => h.fullDate && h.fullDate.toDateString() === today.toDateString()).length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="legal-aid-card" style={{ ...glassStyle, background: 'rgba(30, 42, 68, 0.05)', border: '1px solid rgba(30, 42, 68, 0.2)' }}>
                        <div style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={14} /> {t('hearings.legalAid')}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                            {t('hearings.legalAidDescription')}
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                            {t('hearings.viewResources')} <ArrowUpRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
            {selectedHearing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'var(--bg-glass-strong)',
                        border: 'var(--border-glass-strong)',
                        boxShadow: 'var(--shadow-glass-strong)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '500px',
                        position: 'relative'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={24} color="var(--color-primary)" /> Hearing Reminder
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Set an alert for the hearing: <strong>{selectedHearing.caseTitle}</strong>
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    When to remind:
                                </label>
                                <select
                                    value={reminderTimeOption}
                                    onChange={(e) => setReminderTimeOption(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: 'var(--border-light)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="15">15 minutes before</option>
                                    <option value="30">30 minutes before</option>
                                    <option value="60">1 hour before</option>
                                    <option value="120">2 hours before</option>
                                    <option value="1440">1 day before</option>
                                    <option value="custom">Custom Date & Time</option>
                                </select>
                            </div>

                            {reminderTimeOption === 'custom' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                        Choose date and time:
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'var(--bg-input)',
                                            border: 'var(--border-light)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    Reminder Message:
                                </label>
                                <textarea
                                    value={reminderMessage}
                                    onChange={(e) => setReminderMessage(e.target.value)}
                                    placeholder="e.g. Bring case files and identity proof."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'var(--bg-input)',
                                        border: 'var(--border-light)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <div>
                                {reminders[selectedHearing.id] && (
                                    <button
                                        onClick={deleteReminder}
                                        disabled={savingReminder}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.25rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: '#ef4444',
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => setSelectedHearing(null)}
                                    disabled={savingReminder}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border-medium)',
                                        borderRadius: '0.75rem',
                                        color: 'var(--text-main)',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveReminder}
                                    disabled={savingReminder}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'var(--color-primary)',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {savingReminder ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
