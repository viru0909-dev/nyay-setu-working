import { useState, useEffect } from 'react';

const LawyerDirectory = () => {
  const [lawyers, setLawyers] = useState([]);
  const [city, setCity] = useState('');
  const [expertise, setExpertise] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (expertise) params.append('expertise', expertise);
      const res = await fetch(`/api/cases/lawyers/directory?${params}`);
      const data = await res.json();
      setLawyers(data);
    } catch (err) {
      console.error('Failed to fetch lawyers', err);
      // Mock data for preview
      setLawyers([
        { lawyerProfileId: 1, name: 'Aditi Sharma', city: 'Delhi', expertiseTags: ['Criminal', 'Family'], rating: 4.8, experienceYears: 12, activeCaseCount: 3, barCouncilNumber: 'DL/1234/2012' },
        { lawyerProfileId: 2, name: 'Ravi Menon', city: 'Mumbai', expertiseTags: ['Civil', 'Property'], rating: 4.5, experienceYears: 8, activeCaseCount: 5, barCouncilNumber: 'MH/5678/2016' },
        { lawyerProfileId: 3, name: 'Priya Nair', city: 'Hyderabad', expertiseTags: ['Corporate', 'Tax'], rating: 4.9, experienceYears: 15, activeCaseCount: 2, barCouncilNumber: 'TG/9012/2009' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLawyers(); }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Lawyer Directory</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Filter by city"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        <input
          placeholder="Filter by expertise"
          value={expertise}
          onChange={e => setExpertise(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
        />
        <button
          onClick={fetchLawyers}
          style={{ padding: '0.5rem 1.5rem', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {lawyers.map(lawyer => (
          <div key={lawyer.lawyerProfileId} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.2rem', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 0.4rem' }}>{lawyer.name}</h3>
            <p style={{ margin: '0 0 0.3rem', color: '#555', fontSize: '13px' }}>📍 {lawyer.city}</p>
            <p style={{ margin: '0 0 0.3rem', color: '#555', fontSize: '13px' }}>⚖️ {lawyer.barCouncilNumber}</p>
            <p style={{ margin: '0 0 0.3rem', fontSize: '13px' }}>⭐ {lawyer.rating} &nbsp;|&nbsp; {lawyer.experienceYears} yrs exp &nbsp;|&nbsp; {lawyer.activeCaseCount} active cases</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {lawyer.expertiseTags?.map(tag => (
                <span key={tag} style={{ background: '#ebf5ff', color: '#1a56db', borderRadius: '20px', padding: '2px 10px', fontSize: '12px' }}>{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!loading && lawyers.length === 0 && <p>No lawyers found.</p>}
    </div>
  );
};

export default LawyerDirectory;