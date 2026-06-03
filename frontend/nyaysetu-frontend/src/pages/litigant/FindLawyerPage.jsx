import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Briefcase, ArrowLeft } from 'lucide-react';

const lawyers = [
  {
    id: 1,
    name: "Adv. Rajesh Kumar",
    specialization: "Criminal Law",
    experience: "8 years",
    rating: 4.8,
    location: "Delhi",
    cases: 120,
    available: true,
    languages: ["Hindi", "English"]
  },
  {
    id: 2,
    name: "Adv. Priya Sharma",
    specialization: "Family Law",
    experience: "5 years",
    rating: 4.6,
    location: "Mumbai",
    cases: 85,
    available: true,
    languages: ["Hindi", "Marathi", "English"]
  },
  {
    id: 3,
    name: "Adv. Suresh Mehta",
    specialization: "Civil Law",
    experience: "12 years",
    rating: 4.9,
    location: "Bangalore",
    cases: 200,
    available: false,
    languages: ["Kannada", "English"]
  },
  {
    id: 4,
    name: "Adv. Anita Singh",
    specialization: "Criminal Law",
    experience: "7 years",
    rating: 4.5,
    location: "Chennai",
    cases: 95,
    available: true,
    languages: ["Tamil", "English"]
  },
  {
    id: 5,
    name: "Adv. Vikram Patel",
    specialization: "Corporate Law",
    experience: "10 years",
    rating: 4.7,
    location: "Ahmedabad",
    cases: 150,
    available: true,
    languages: ["Gujarati", "Hindi", "English"]
  }
];

const specializations = [
  'All', 'Criminal Law', 'Family Law',
  'Civil Law', 'Corporate Law'
];

export default function FindLawyerPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [requested, setRequested] = useState([]);

  const filtered = lawyers.filter(l => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' || l.specialization === filter;
    return matchSearch && matchFilter;
  });

  const handleConnect = (lawyer) => {
    setRequested(prev => [...prev, lawyer.id]);
  };

  const glassStyle = {
    background: 'var(--bg-glass-strong)',
    backdropFilter: 'var(--glass-blur)',
    border: 'var(--border-glass-strong)',
    borderRadius: '1.5rem',
    boxShadow: 'var(--shadow-glass-strong)'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            Find a Lawyer
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Browse verified lawyers and connect for your case
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
        />
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 2.75rem',
            borderRadius: '12px',
            border: 'var(--border-glass)',
            background: 'var(--bg-glass)',
            color: 'var(--text-main)',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {specializations.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '0.4rem 1.1rem',
              borderRadius: '20px',
              border: '1.5px solid var(--color-primary)',
              cursor: 'pointer',
              background: filter === s ? 'var(--color-primary)' : 'transparent',
              color: filter === s ? 'white' : 'var(--color-primary)',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        {filtered.length} lawyers found
      </p>

      {/* Lawyer Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.2rem'
      }}>
        {filtered.map(lawyer => (
          <div key={lawyer.id} style={{ ...glassStyle, padding: '1.5rem' }}>

            {/* Top Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700', flexShrink: 0
              }}>
                {lawyer.name.split(' ')[1]?.[0] || 'L'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {lawyer.name}
                </h3>
                <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: '500' }}>
                  {lawyer.specialization}
                </p>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} /> {lawyer.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Briefcase size={13} /> {lawyer.experience}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                📁 {lawyer.cases} cases
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" /> {lawyer.rating}/5.0
              </span>
            </div>

            {/* Languages */}
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {lawyer.languages.map(lang => (
                <span key={lang} style={{
                  fontSize: '0.72rem',
                  background: 'var(--bg-glass-subtle)',
                  color: 'var(--color-primary)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '20px',
                  border: '1px solid var(--color-primary)'
                }}>
                  {lang}
                </span>
              ))}
            </div>

            {/* Status + Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontSize: '0.75rem', padding: '0.25rem 0.7rem', borderRadius: '20px',
                background: lawyer.available ? '#e8f5e9' : '#fce8e6',
                color: lawyer.available ? '#2e7d32' : '#c62828',
                fontWeight: '500'
              }}>
                {lawyer.available ? '● Available' : '● Busy'}
              </span>

              <button
                onClick={() => handleConnect(lawyer)}
                disabled={!lawyer.available || requested.includes(lawyer.id)}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none',
                  cursor: lawyer.available && !requested.includes(lawyer.id) ? 'pointer' : 'not-allowed',
                  background: requested.includes(lawyer.id) ? '#e8f5e9' : lawyer.available ? 'var(--color-primary)' : 'var(--bg-glass-subtle)',
                  color: requested.includes(lawyer.id) ? '#2e7d32' : lawyer.available ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s'
                }}>
                {requested.includes(lawyer.id) ? '✓ Requested' : lawyer.available ? 'Connect' : 'Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}