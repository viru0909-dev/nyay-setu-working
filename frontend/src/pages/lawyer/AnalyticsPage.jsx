import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    PieChart,
    Users,
    Briefcase,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Calendar,
    ChevronDown
} from 'lucide-react';

export default function LawyerAnalyticsPage() {
    const glassStyle = {
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'var(--glass-blur)',
        border: 'var(--border-glass-strong)',
        borderRadius: '1.5rem',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-glass-strong)'
    };

    const stats = [
        { label: 'Success Rate', value: '84%', change: '+5.2%', trend: 'up', icon: Target, color: 'var(--color-success)' },
        { label: 'Active Clients', value: '48', change: '+12%', trend: 'up', icon: Users, color: 'var(--color-accent)' },
        { label: 'Avg. Case Duration', value: '142 Days', change: '-8.4%', trend: 'up', icon: Clock, color: 'var(--color-warning)' },
        { label: 'Revenue Growth', value: '₹12.4L', change: '+18.5%', trend: 'up', icon: TrendingUp, color: 'var(--color-error)' },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glass)'
                    }}>
                        <BarChart3 size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                            Practice Analytics
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Performance monitoring and strategic practice insights
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{
                        background: 'var(--bg-glass)', border: 'var(--border-glass)',
                        borderRadius: '0.75rem', padding: '0.75rem 1.25rem', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem'
                    }}>
                        <Calendar size={18} /> Last 30 Days <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} style={glassStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: `${stat.color}15`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: stat.color
                            }}>
                                <stat.icon size={22} />
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                color: stat.trend === 'up' ? 'var(--color-success)' : 'var(--color-error)',
                                fontSize: '0.75rem', fontWeight: '800'
                            }}>
                                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{stat.value}</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontWeight: '500' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ ...glassStyle, minHeight: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Case Load Distribution</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['Month', 'Quarter', 'Year'].map(t => (
                                <button key={t} style={{
                                    fontSize: '0.7rem', fontWeight: '800', padding: '0.3rem 0.75rem', borderRadius: '4px',
                                    background: t === 'Month' ? 'var(--bg-glass-subtle)' : 'transparent',
                                    color: t === 'Month' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                    border: 'none', cursor: 'pointer'
                                }}>{t.toUpperCase()}</button>
                            ))}
                        </div>
                    </div>
                    {/* Mock Chart Area */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 1rem' }}>
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '40px' }}>
                                <div style={{
                                    width: '100%', height: `${h}%`,
                                    background: 'linear-gradient(to top, #4f46e5, #818cf8)',
                                    borderRadius: '6px',
                                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                                }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: '700' }}>W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={glassStyle}>
                    <h3 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.1rem', fontWeight: '700', marginBottom: '2rem' }}>Case Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { label: 'Criminal Law', count: 18, pct: 45, color: '#ef4444' },
                            { label: 'Civil Disputes', count: 12, pct: 30, color: '#6366f1' },
                            { label: 'Family Matters', count: 6, pct: 15, color: '#10b981' },
                            { label: 'Corp./Commercial', count: 4, pct: 10, color: '#f59e0b' },
                        ].map((cat, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{cat.label}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{cat.count} Cases</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-glass-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: '4px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                {[
                    { title: 'Upcoming Deadlines', value: '12', desc: 'Next 7 days', color: '#ef4444' },
                    { title: 'Billed Hours', value: '164.5', desc: 'Current month', color: '#6366f1' },
                    { title: 'New Leads', value: '7', desc: 'Last 48 hours', color: '#10b981' },
                ].map((item, i) => (
                    <div key={i} style={{ ...glassStyle, borderLeft: `4px solid ${item.color}` }}>
                        <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>{item.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>{item.value}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
